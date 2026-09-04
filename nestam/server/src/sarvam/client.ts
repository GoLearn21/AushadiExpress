/**
 * Minimal, dependency-free client for the Sarvam AI REST API.
 *
 * Endpoints and field names verified against the official `sarvamai` SDK
 * v1.1.9 (August 2026):
 *   POST /speech-to-text        multipart: file, model, mode, language_code, with_timestamps
 *   POST /text-to-speech        json: text, language_code, speaker, model, pace, temperature,
 *                               speech_sample_rate, (v2: pitch, loudness, enable_preprocessing)
 *   POST /v1/chat/completions   OpenAI-compatible, models sarvam-105b / sarvam-105b-conversations
 *   POST /translate             json: input, source_language_code, target_language_code, mode, model
 * Auth header: api-subscription-key
 */
import type { NestamConfig } from "../config.js";
import { logger } from "../logger.js";
import { parseWav, concatWavs, wavDurationMs } from "../audio/wav.js";
import { ProviderError } from "./types.js";
import type { AiProvider, ChatMessage, ChatOptions, ChatResult, SttOptions, SttResult, TranslateOptions, TtsOptions, TtsResult } from "./types.js";

const log = logger("sarvam");

const TTS_CHAR_LIMIT: Record<string, number> = { "bulbul:v3": 2500, "bulbul:v2": 1500 };
const RETRYABLE = new Set([408, 425, 429, 500, 502, 503, 504]);

/** Splits long text at sentence boundaries so each chunk fits the TTS limit. */
export function chunkForTts(text: string, limit: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= limit) return clean ? [clean] : [];
  const sentences = clean.split(/(?<=[.!?।])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const s of sentences) {
    if (s.length > limit) {
      if (current) chunks.push(current), (current = "");
      for (let i = 0; i < s.length; i += limit) chunks.push(s.slice(i, i + limit));
      continue;
    }
    if ((current + " " + s).trim().length > limit) {
      chunks.push(current.trim());
      current = s;
    } else current = (current + " " + s).trim();
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/** Removes <think> blocks some reasoning models leak into `content`. */
export function stripThinking(content: string): string {
  return content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

export class SarvamClient implements AiProvider {
  readonly name = "sarvam" as const;

  constructor(private readonly cfg: NestamConfig["sarvam"]) {
    if (!cfg.apiKey) throw new Error("SarvamClient requires an API key");
  }

  private async request<T>(path: string, init: RequestInit & { json?: unknown }, attempt = 0): Promise<T> {
    const url = `${this.cfg.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
    const headers: Record<string, string> = { "api-subscription-key": this.cfg.apiKey, ...(init.headers as Record<string, string> | undefined) };
    let body = init.body;
    if (init.json !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(init.json);
    }
    const started = Date.now();
    let res: Response;
    try {
      res = await fetch(url, { method: init.method ?? "POST", headers, body, signal: AbortSignal.timeout(this.cfg.timeoutMs) });
    } catch (err) {
      if (attempt < 2) {
        await sleep(500 * 2 ** attempt);
        return this.request<T>(path, init, attempt + 1);
      }
      throw new ProviderError(`Network error calling ${path}: ${(err as Error).message}`, 0, undefined, path);
    }
    const ms = Date.now() - started;
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let parsed: unknown = text;
      try {
        parsed = JSON.parse(text);
      } catch {
        /* keep raw */
      }
      if (RETRYABLE.has(res.status) && attempt < 2) {
        const retryAfter = Number(res.headers.get("retry-after")) || 0;
        log.warn(`Sarvam ${path} -> ${res.status}, retrying`, { attempt, ms });
        await sleep(retryAfter > 0 ? retryAfter * 1000 : 800 * 2 ** attempt);
        return this.request<T>(path, init, attempt + 1);
      }
      log.error(`Sarvam ${path} failed`, { status: res.status, body: typeof parsed === "string" ? parsed.slice(0, 300) : parsed });
      throw new ProviderError(`Sarvam ${path} failed with ${res.status}`, res.status, parsed, path);
    }
    log.debug(`Sarvam ${path} ok`, { ms });
    return (await res.json()) as T;
  }

  async transcribe(audio: Buffer, opts: SttOptions = {}): Promise<SttResult> {
    const mime = opts.mimeType ?? "audio/wav";
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(audio)], { type: mime }), mime.includes("webm") ? "audio.webm" : mime.includes("ogg") ? "audio.ogg" : "audio.wav");
    form.append("model", this.cfg.sttModel);
    if (this.cfg.sttModel.startsWith("saaras:v3") || this.cfg.sttModel.startsWith("saaras:v4")) form.append("mode", opts.mode ?? "transcribe");
    form.append("language_code", opts.languageCode ?? "unknown");
    form.append("with_timestamps", "false");
    const res = await this.request<{ transcript: string; language_code?: string; language_probability?: number }>("/speech-to-text", { body: form });
    const durationMs = mime === "audio/wav" ? wavDurationMs(audio) : Math.round((audio.length / 6000) * 1000); // ~48 kbps opus estimate
    return {
      transcript: (res.transcript ?? "").trim(),
      languageCode: res.language_code ?? opts.languageCode ?? "unknown",
      languageProbability: res.language_probability,
      audioDurationMs: durationMs,
    };
  }

  async synthesize(text: string, opts: TtsOptions): Promise<TtsResult> {
    const model = opts.model ?? this.cfg.ttsModel;
    const isV3 = model === "bulbul:v3";
    const sampleRate = opts.sampleRate ?? this.cfg.ttsSampleRate;
    const chunks = chunkForTts(text, TTS_CHAR_LIMIT[model] ?? 1500);
    if (chunks.length === 0) throw new ProviderError("Empty text for TTS", 400);
    const wavs: Buffer[] = [];
    for (const chunk of chunks) {
      const json: Record<string, unknown> = {
        text: chunk,
        language_code: opts.languageCode,
        speaker: opts.speaker,
        model,
        pace: clamp(opts.pace ?? 1.0, isV3 ? 0.5 : 0.3, isV3 ? 2.0 : 3.0),
        speech_sample_rate: sampleRate,
      };
      if (isV3) json.temperature = clamp(opts.temperature ?? 0.6, 0.01, 2.0);
      else {
        json.pitch = clamp(opts.pitch ?? 0, -0.75, 0.75);
        json.loudness = clamp(opts.loudness ?? 1.0, 0.3, 3.0);
        json.enable_preprocessing = true;
      }
      const res = await this.request<{ audios: string[] }>("/text-to-speech", { json });
      const b64 = res.audios?.[0];
      if (!b64) throw new ProviderError("TTS returned no audio", 502, res, "/text-to-speech");
      wavs.push(Buffer.from(b64, "base64"));
    }
    const wav = wavs.length === 1 ? wavs[0] : concatWavs(wavs);
    const parsed = parseWav(wav);
    return { wav, sampleRate: parsed.sampleRate, durationMs: parsed.durationMs };
  }

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const json: Record<string, unknown> = {
      model: opts.model ?? this.cfg.chatModel,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 400,
      reasoning_effort: opts.reasoningEffort ?? this.cfg.reasoningEffort,
      n: 1,
    };
    if (opts.jsonSchema) json.response_format = { type: "json_schema", json_schema: { name: opts.jsonSchema.name, schema: opts.jsonSchema.schema, strict: false } };
    const res = await this.request<{
      choices?: Array<{ message?: { content?: string; reasoning_content?: string }; finish_reason?: string }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
      model?: string;
    }>("/v1/chat/completions", { json });
    const content = stripThinking(res.choices?.[0]?.message?.content ?? "");
    return {
      content,
      model: res.model,
      usage: res.usage ? { promptTokens: res.usage.prompt_tokens ?? 0, completionTokens: res.usage.completion_tokens ?? 0 } : undefined,
    };
  }

  async translate(text: string, from: string, to: string, opts: TranslateOptions = {}): Promise<string> {
    const model = opts.model ?? this.cfg.translateModel;
    const json: Record<string, unknown> = { input: text.slice(0, model === "mayura:v1" ? 1000 : 2000), source_language_code: from, target_language_code: to, model };
    if (model === "mayura:v1") json.mode = opts.mode ?? "modern-colloquial";
    if (opts.speakerGender) json.speaker_gender = opts.speakerGender;
    const res = await this.request<{ translated_text: string }>("/translate", { json });
    return res.translated_text ?? "";
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
