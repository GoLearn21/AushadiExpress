import type { NestamConfig } from "../config.js";
import { logger } from "../logger.js";
import { BudgetTracker } from "./budget.js";
import type { UsagePersistence } from "./budget.js";
import { SarvamClient } from "./client.js";
import { MockProvider } from "./mock.js";
import type { AiProvider, ChatMessage, ChatOptions, SttOptions, TranslateOptions, TtsOptions } from "./types.js";

const log = logger("provider");

/** Wraps a provider so every call is metered by the budget tracker. */
export function withBudget(inner: AiProvider, budget: BudgetTracker): AiProvider {
  return {
    name: inner.name,
    async transcribe(audio: Buffer, opts?: SttOptions) {
      const r = await inner.transcribe(audio, opts);
      budget.record({ kind: "stt", seconds: r.audioDurationMs / 1000 });
      return r;
    },
    async synthesize(text: string, opts: TtsOptions) {
      const r = await inner.synthesize(text, opts);
      budget.record({ kind: "tts", seconds: r.durationMs / 1000, chars: text.length });
      return r;
    },
    async chat(messages: ChatMessage[], opts?: ChatOptions) {
      const r = await inner.chat(messages, opts);
      const inTok = r.usage?.promptTokens ?? Math.round(messages.reduce((a, m) => a + m.content.length, 0) / 4);
      const outTok = r.usage?.completionTokens ?? Math.round(r.content.length / 4);
      budget.record({ kind: "llm", inputTokens: inTok, outputTokens: outTok });
      return r;
    },
    async translate(text: string, from: string, to: string, opts?: TranslateOptions) {
      const r = await inner.translate(text, from, to, opts);
      budget.record({ kind: "translate", chars: text.length });
      return r;
    },
  };
}

export function createProvider(cfg: NestamConfig, usagePersistence: UsagePersistence): { provider: AiProvider; budget: BudgetTracker } {
  const inner: AiProvider = cfg.mock ? new MockProvider() : new SarvamClient(cfg.sarvam);
  const budget = new BudgetTracker(cfg.budget, usagePersistence, inner.name);
  if (cfg.mock) log.warn("SARVAM_API_KEY not set — running in MOCK mode (offline bomma-speak, canned Telugu replies)");
  else log.info("Sarvam provider ready", { stt: cfg.sarvam.sttModel, tts: cfg.sarvam.ttsModel, chat: cfg.sarvam.chatModel });
  return { provider: withBudget(inner, budget), budget };
}

export type { AiProvider } from "./types.js";
