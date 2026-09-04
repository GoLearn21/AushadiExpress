/**
 * Free-tier budget guard. Estimates rupee spend per call from public Sarvam
 * rates and flips the server into "thrifty" mode (skip TTS, reuse cached
 * greetings) once the daily cap is hit — the app degrades instead of failing.
 */
import type { NestamConfig } from "../config.js";
import { istDateKey } from "../util/telugu.js";

export interface UsageDay {
  date: string;
  inr: number;
  sttSeconds: number;
  ttsSeconds: number;
  llmInputTokens: number;
  llmOutputTokens: number;
  calls: { stt: number; tts: number; llm: number; translate: number };
}

export interface UsageSummary {
  provider: "sarvam" | "mock";
  today: UsageDay;
  allTimeInr: number;
  dailyCapInr: number;
  thrifty: boolean;
  days: number;
}

export type UsageEvent =
  | { kind: "stt"; seconds: number }
  | { kind: "tts"; seconds: number; chars: number }
  | { kind: "llm"; inputTokens: number; outputTokens: number }
  | { kind: "translate"; chars: number };

export interface UsagePersistence {
  load(): Record<string, UsageDay>;
  save(days: Record<string, UsageDay>): void;
}

export function emptyUsageDay(date: string): UsageDay {
  return { date, inr: 0, sttSeconds: 0, ttsSeconds: 0, llmInputTokens: 0, llmOutputTokens: 0, calls: { stt: 0, tts: 0, llm: 0, translate: 0 } };
}

export class BudgetTracker {
  private days: Record<string, UsageDay>;

  constructor(
    private readonly rates: NestamConfig["budget"],
    private readonly persistence: UsagePersistence,
    private readonly providerName: "sarvam" | "mock",
    private readonly now: () => Date = () => new Date(),
  ) {
    this.days = persistence.load();
  }

  private today(): UsageDay {
    const key = istDateKey(this.now());
    if (!this.days[key]) this.days[key] = emptyUsageDay(key);
    return this.days[key];
  }

  /** Estimated rupee cost of an event (0 in mock mode: nothing is billed). */
  estimate(ev: UsageEvent): number {
    if (this.providerName === "mock") return 0;
    switch (ev.kind) {
      case "stt":
        return (ev.seconds / 3600) * this.rates.sttInrPerHour;
      case "tts":
        return (ev.seconds / 3600) * this.rates.ttsInrPerHour;
      case "llm":
        return (ev.inputTokens / 1e6) * this.rates.llmInrPerMInput + (ev.outputTokens / 1e6) * this.rates.llmInrPerMOutput;
      case "translate":
        return ev.chars * 0.005; // ₹0.005 / char public base rate
    }
  }

  record(ev: UsageEvent): UsageDay {
    const day = this.today();
    day.inr += this.estimate(ev);
    switch (ev.kind) {
      case "stt":
        day.sttSeconds += ev.seconds;
        day.calls.stt++;
        break;
      case "tts":
        day.ttsSeconds += ev.seconds;
        day.calls.tts++;
        break;
      case "llm":
        day.llmInputTokens += ev.inputTokens;
        day.llmOutputTokens += ev.outputTokens;
        day.calls.llm++;
        break;
      case "translate":
        day.calls.translate++;
        break;
    }
    this.persistence.save(this.days);
    return day;
  }

  /** True once today's estimated spend reaches the cap (never in mock mode). */
  thrifty(): boolean {
    if (this.providerName === "mock") return false;
    return this.today().inr >= this.rates.dailyInr;
  }

  summary(): UsageSummary {
    const today = this.today();
    const all = Object.values(this.days);
    return {
      provider: this.providerName,
      today: { ...today, inr: round2(today.inr) },
      allTimeInr: round2(all.reduce((a, d) => a + d.inr, 0)),
      dailyCapInr: this.rates.dailyInr,
      thrifty: this.thrifty(),
      days: all.length,
    };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
