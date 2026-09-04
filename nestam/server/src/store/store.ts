/**
 * JSON file store with debounced atomic writes. Small, dependency-free and
 * durable enough for a companion app's memories/bond/usage. Swap for Postgres
 * by re-implementing this module (the engine only uses these methods).
 */
import fs from "node:fs";
import path from "node:path";
import type { AppearanceOverride, Localized } from "../characters/roster.js";
import type { UsageDay, UsagePersistence } from "../sarvam/budget.js";
import { newId } from "../util/ids.js";
import { logger } from "../logger.js";

const log = logger("store");

export interface Memory {
  id: string;
  text: string;
  category: string;
  createdAt: string;
  source: "extracted" | "reply" | "user";
}

export interface Activity {
  id: string;
  kind: string;
  title: Localized;
  prompt: Localized;
  energy: number;
  done: boolean;
  completedAt?: string;
}

/** The Vaakili (వాకిలి, front yard) — Nestam's version of Tolan's planet. */
export interface VaakiliState {
  level: number;
  points: number;
  energy: number;
  muggu: number;
  tulasi: number;
  tree: number;
  birds: number;
  deepam: number;
  lastCaredAt?: string;
}

export interface UserRecord {
  id: string;
  name?: string;
  town?: string;
  language: "te" | "en" | "mixed";
  addressStyle: "casual" | "respectful";
  characterId: string;
  appearance: AppearanceOverride;
  memories: Memory[];
  vaakili: VaakiliState;
  streak: { count: number; lastDate: string | null };
  activities: Record<string, Activity[]>;
  totalTurns: number;
  createdAt: string;
  lastSeenAt: string;
}

export interface Turn {
  role: "user" | "assistant";
  content: string;
  at: string;
  emotion?: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  characterId: string;
  createdAt: string;
  lastActiveAt: string;
  turns: Turn[];
  turnsSinceExtraction: number;
}

interface DbShape {
  users: Record<string, UserRecord>;
  sessions: Record<string, SessionRecord>;
  usage: Record<string, UsageDay>;
}

export function newVaakili(): VaakiliState {
  return { level: 1, points: 0, energy: 3, muggu: 1, tulasi: 1, tree: 0, birds: 0, deepam: 0 };
}

export class Store {
  private db: DbShape = { users: {}, sessions: {}, usage: {} };
  private readonly file: string;
  private readonly ttsDir: string;
  private timer: NodeJS.Timeout | null = null;
  private dirty = false;

  constructor(readonly dataDir: string) {
    fs.mkdirSync(dataDir, { recursive: true });
    this.file = path.join(dataDir, "nestam-db.json");
    this.ttsDir = path.join(dataDir, "tts-cache");
    fs.mkdirSync(this.ttsDir, { recursive: true });
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.file)) {
        const parsed = JSON.parse(fs.readFileSync(this.file, "utf8")) as Partial<DbShape>;
        this.db = { users: parsed.users ?? {}, sessions: parsed.sessions ?? {}, usage: parsed.usage ?? {} };
        log.info("loaded store", { users: Object.keys(this.db.users).length, sessions: Object.keys(this.db.sessions).length });
      }
    } catch (err) {
      log.error("failed to load store, starting empty", { err: (err as Error).message });
    }
  }

  /** Schedules a debounced atomic write. */
  save(): void {
    this.dirty = true;
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flushSync();
    }, 80);
    this.timer.unref?.();
  }

  flushSync(): void {
    if (!this.dirty) return;
    this.dirty = false;
    // Trim session history so the file stays small.
    for (const s of Object.values(this.db.sessions)) if (s.turns.length > 60) s.turns.splice(0, s.turns.length - 60);
    const tmp = `${this.file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.db));
    fs.renameSync(tmp, this.file);
  }

  // ── users ────────────────────────────────────────────────────────────────
  getUser(id: string): UserRecord | undefined {
    return this.db.users[id];
  }

  createUser(init: Partial<UserRecord> & { characterId: string }): UserRecord {
    const now = new Date().toISOString();
    const user: UserRecord = {
      id: init.id ?? newId("usr"),
      name: init.name,
      town: init.town,
      language: init.language ?? "te",
      addressStyle: init.addressStyle ?? "respectful",
      characterId: init.characterId,
      appearance: init.appearance ?? {},
      memories: init.memories ?? [],
      vaakili: init.vaakili ?? newVaakili(),
      streak: init.streak ?? { count: 0, lastDate: null },
      activities: init.activities ?? {},
      totalTurns: init.totalTurns ?? 0,
      createdAt: now,
      lastSeenAt: now,
    };
    this.db.users[user.id] = user;
    this.save();
    return user;
  }

  saveUser(user: UserRecord): void {
    user.lastSeenAt = new Date().toISOString();
    this.db.users[user.id] = user;
    this.save();
  }

  deleteUser(id: string): boolean {
    if (!this.db.users[id]) return false;
    delete this.db.users[id];
    for (const [sid, s] of Object.entries(this.db.sessions)) if (s.userId === id) delete this.db.sessions[sid];
    this.save();
    return true;
  }

  // ── sessions ─────────────────────────────────────────────────────────────
  getSession(id: string): SessionRecord | undefined {
    return this.db.sessions[id];
  }

  createSession(userId: string, characterId: string): SessionRecord {
    const now = new Date().toISOString();
    const session: SessionRecord = { id: newId("ses"), userId, characterId, createdAt: now, lastActiveAt: now, turns: [], turnsSinceExtraction: 0 };
    this.db.sessions[session.id] = session;
    // keep at most 20 sessions per user
    const mine = Object.values(this.db.sessions).filter((s) => s.userId === userId).sort((a, b) => a.lastActiveAt.localeCompare(b.lastActiveAt));
    while (mine.length > 20) {
      const old = mine.shift();
      if (old) delete this.db.sessions[old.id];
    }
    this.save();
    return session;
  }

  saveSession(session: SessionRecord): void {
    session.lastActiveAt = new Date().toISOString();
    this.db.sessions[session.id] = session;
    this.save();
  }

  // ── usage ────────────────────────────────────────────────────────────────
  usagePersistence(): UsagePersistence {
    return {
      load: () => ({ ...this.db.usage }),
      save: (days) => {
        this.db.usage = days;
        this.save();
      },
    };
  }

  // ── TTS cache (wav files on disk) ─────────────────────────────────────────
  ttsCacheGet(key: string): Buffer | null {
    const p = path.join(this.ttsDir, `${key}.wav`);
    try {
      return fs.existsSync(p) ? fs.readFileSync(p) : null;
    } catch {
      return null;
    }
  }

  ttsCachePut(key: string, wav: Buffer): void {
    try {
      fs.writeFileSync(path.join(this.ttsDir, `${key}.wav`), wav);
    } catch (err) {
      log.warn("tts cache write failed", { err: (err as Error).message });
    }
  }

  stats(): { users: number; sessions: number; memories: number } {
    const users = Object.values(this.db.users);
    return { users: users.length, sessions: Object.keys(this.db.sessions).length, memories: users.reduce((a, u) => a + u.memories.length, 0) };
  }
}
