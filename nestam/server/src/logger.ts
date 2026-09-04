type Level = "debug" | "info" | "warn" | "error";
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

let current: Level = (process.env.NESTAM_LOG_LEVEL as Level) || "info";
if (process.env.NESTAM_ENV === "test") current = "error";

export function setLogLevel(level: Level): void {
  current = level;
}

function emit(level: Level, scope: string, msg: string, extra?: Record<string, unknown>): void {
  if (ORDER[level] < ORDER[current]) return;
  const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} [${scope}] ${msg}`;
  const payload = extra && Object.keys(extra).length > 0 ? ` ${JSON.stringify(extra)}` : "";
  if (level === "error") console.error(line + payload);
  else if (level === "warn") console.warn(line + payload);
  else console.log(line + payload);
}

export function logger(scope: string) {
  return {
    debug: (msg: string, extra?: Record<string, unknown>) => emit("debug", scope, msg, extra),
    info: (msg: string, extra?: Record<string, unknown>) => emit("info", scope, msg, extra),
    warn: (msg: string, extra?: Record<string, unknown>) => emit("warn", scope, msg, extra),
    error: (msg: string, extra?: Record<string, unknown>) => emit("error", scope, msg, extra),
  };
}
