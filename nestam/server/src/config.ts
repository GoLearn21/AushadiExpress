import "dotenv/config";
import path from "node:path";

/** Runtime configuration for the Nestam server. Every value has a safe default. */
export interface NestamConfig {
  env: "development" | "test" | "production";
  port: number;
  dataDir: string;
  corsOrigin: string;
  logLevel: "debug" | "info" | "warn" | "error";
  sarvam: {
    apiKey: string;
    baseUrl: string;
    sttModel: string;
    ttsModel: string;
    chatModel: string;
    translateModel: string;
    reasoningEffort: "low" | "medium" | "high";
    ttsSampleRate: number;
    timeoutMs: number;
  };
  budget: {
    dailyInr: number;
    sttInrPerHour: number;
    ttsInrPerHour: number;
    llmInrPerMInput: number;
    llmInrPerMOutput: number;
  };
  /** True when no SARVAM_API_KEY is configured: the offline mock provider is used. */
  mock: boolean;
}

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function str(name: string, fallback: string): string {
  const raw = process.env[name];
  return raw === undefined || raw === "" ? fallback : raw;
}

export function loadConfig(overrides: Partial<NestamConfig> = {}): NestamConfig {
  const envName = (process.env.NESTAM_ENV ?? process.env.NODE_ENV ?? "development") as NestamConfig["env"];
  const apiKey = str("SARVAM_API_KEY", "");
  const effort = str("SARVAM_REASONING_EFFORT", "low");
  const cfg: NestamConfig = {
    env: (["development", "test", "production"] as const).includes(envName) ? envName : "development",
    port: num("PORT", 4020),
    dataDir: path.resolve(str("NESTAM_DATA_DIR", "./data")),
    corsOrigin: str("NESTAM_CORS_ORIGIN", "*"),
    logLevel: str("NESTAM_LOG_LEVEL", "info") as NestamConfig["logLevel"],
    sarvam: {
      apiKey,
      baseUrl: str("SARVAM_BASE_URL", "https://api.sarvam.ai"),
      sttModel: str("SARVAM_STT_MODEL", "saaras:v3"),
      ttsModel: str("SARVAM_TTS_MODEL", "bulbul:v3"),
      chatModel: str("SARVAM_CHAT_MODEL", "sarvam-105b"),
      translateModel: str("SARVAM_TRANSLATE_MODEL", "mayura:v1"),
      reasoningEffort: (["low", "medium", "high"].includes(effort) ? effort : "low") as "low" | "medium" | "high",
      ttsSampleRate: num("SARVAM_TTS_SAMPLE_RATE", 22050),
      timeoutMs: num("SARVAM_TIMEOUT_MS", 45000),
    },
    budget: {
      dailyInr: num("NESTAM_DAILY_BUDGET_INR", 30),
      sttInrPerHour: num("NESTAM_RATE_STT_INR_PER_HOUR", 30),
      ttsInrPerHour: num("NESTAM_RATE_TTS_INR_PER_HOUR", 30),
      llmInrPerMInput: num("NESTAM_RATE_LLM_INR_PER_M_INPUT", 29.28),
      llmInrPerMOutput: num("NESTAM_RATE_LLM_INR_PER_M_OUTPUT", 73.2),
    },
    mock: apiKey === "",
  };
  return { ...cfg, ...overrides, sarvam: { ...cfg.sarvam, ...(overrides.sarvam ?? {}) }, budget: { ...cfg.budget, ...(overrides.budget ?? {}) } };
}
