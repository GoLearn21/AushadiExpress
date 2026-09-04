import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import type { NestamConfig } from "../config.js";
import { APPEARANCE_OPTIONS, CHARACTERS, getCharacter, sanitizeAppearance } from "../characters/roster.js";
import { CARE_ACTIONS, careForVaakili, completeActivity, getTodaysActivities } from "../conversation/activities.js";
import { ConversationEngine, EngineError } from "../conversation/engine.js";
import { mergeMemories } from "../conversation/memory.js";
import { QUIZ, matchCharacter } from "../conversation/onboarding.js";
import { logger } from "../logger.js";
import type { BudgetTracker } from "../sarvam/budget.js";
import { MOCK_TRANSCRIPT_MARKER } from "../sarvam/mock.js";
import { ProviderError } from "../sarvam/types.js";
import type { Store } from "../store/store.js";
import { FESTIVALS, istDateKey, timeOfDay, upcomingFestivals } from "../util/telugu.js";

const log = logger("api");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

type Async = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
const wrap = (fn: Async) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

function str(v: unknown, max = 200): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;
}

export function createApiRouter(deps: { engine: ConversationEngine; store: Store; budget: BudgetTracker; cfg: NestamConfig; startedAt: Date }): Router {
  const { engine, store, budget, cfg } = deps;
  const r = Router();

  r.get("/status", (_req, res) => {
    res.json({
      ok: true,
      app: "nestam",
      version: "0.1.0",
      provider: cfg.mock ? "mock" : "sarvam",
      models: cfg.mock ? null : { stt: cfg.sarvam.sttModel, tts: cfg.sarvam.ttsModel, chat: cfg.sarvam.chatModel },
      uptimeSec: Math.round((Date.now() - deps.startedAt.getTime()) / 1000),
      istDate: istDateKey(),
      timeOfDay: timeOfDay(),
      store: store.stats(),
      thrifty: budget.thrifty(),
    });
  });

  // ── characters & customisation ───────────────────────────────────────────
  r.get("/characters", (_req, res) => {
    res.json({ characters: CHARACTERS.map((c) => engine.characterDto(c)), options: APPEARANCE_OPTIONS });
  });

  r.get("/characters/:id", (req, res) => {
    const c = getCharacter(req.params.id);
    res.json({ character: engine.characterDto(c) });
  });

  // ── onboarding quiz ──────────────────────────────────────────────────────
  r.get("/onboarding/quiz", (_req, res) => res.json({ questions: QUIZ }));

  r.post("/onboarding/match", (req, res) => {
    const answers = (req.body?.answers ?? {}) as Record<string, string>;
    const result = matchCharacter(answers);
    res.json({ ...result, character: engine.characterDto(getCharacter(result.characterId)) });
  });

  // ── sessions & conversation ──────────────────────────────────────────────
  r.post(
    "/session",
    wrap(async (req, res) => {
      const b = req.body ?? {};
      const language = (["te", "en", "mixed"] as const).find((l) => l === b.language);
      const addressStyle = (["casual", "respectful"] as const).find((a) => a === b.addressStyle);
      const out = await engine.createSession({
        userId: str(b.userId, 80),
        characterId: str(b.characterId, 40),
        name: str(b.name, 60),
        town: str(b.town, 80),
        language,
        addressStyle,
        appearance: b.appearance ? sanitizeAppearance(b.appearance, cfg.sarvam.ttsModel) : undefined,
        silent: b.silent === true,
      });
      res.json({ sessionId: out.session.id, userId: out.user.id, character: out.character, user: publicUser(out.user), greeting: out.greeting });
    }),
  );

  r.post(
    "/chat",
    wrap(async (req, res) => {
      const sessionId = str(req.body?.sessionId, 80);
      const text = typeof req.body?.text === "string" ? req.body.text : "";
      if (!sessionId) throw new EngineError("missing_session", "sessionId is required", 400);
      res.json(await engine.handleText(sessionId, text));
    }),
  );

  r.post(
    "/voice",
    upload.single("audio"),
    wrap(async (req, res) => {
      const sessionId = str(req.body?.sessionId, 80) ?? str(req.query.sessionId, 80);
      if (!sessionId) throw new EngineError("missing_session", "sessionId is required", 400);
      let audio: Buffer | undefined = req.file?.buffer;
      let mime = req.file?.mimetype ?? "audio/wav";
      // Dev/test helper (mock mode only): inject a transcript without recording.
      if (!audio && cfg.mock && typeof req.body?.mockTranscript === "string") {
        audio = Buffer.from((MOCK_TRANSCRIPT_MARKER + req.body.mockTranscript).padEnd(160, " "), "utf8");
        mime = "audio/wav";
      }
      if (!audio) throw new EngineError("missing_audio", "multipart field 'audio' is required", 400);
      if (mime === "application/octet-stream") mime = "audio/wav";
      res.json(await engine.handleVoice(sessionId, audio, mime));
    }),
  );

  r.post(
    "/poke",
    wrap(async (req, res) => {
      const sessionId = str(req.body?.sessionId, 80);
      if (!sessionId) throw new EngineError("missing_session", "sessionId is required", 400);
      res.json(await engine.poke(sessionId));
    }),
  );

  r.get("/session/:id", (req, res) => {
    const s = store.getSession(req.params.id);
    if (!s) return res.status(404).json({ error: { code: "session_not_found", message: "Unknown session" } });
    return res.json({ session: { id: s.id, userId: s.userId, characterId: s.characterId, createdAt: s.createdAt, turns: s.turns.slice(-40) } });
  });

  // ── utilities (tts / stt) ────────────────────────────────────────────────
  r.post(
    "/tts",
    wrap(async (req, res) => {
      const text = str(req.body?.text, 2500);
      if (!text) throw new EngineError("missing_text", "text is required", 400);
      const characterId = str(req.body?.characterId, 40) ?? "bujji";
      const out = await engine.tts(text, characterId, sanitizeAppearance(req.body?.appearance, cfg.sarvam.ttsModel));
      if (req.query.format === "wav") {
        res.setHeader("Content-Type", "audio/wav");
        return res.send(out.wav);
      }
      return res.json({ audioBase64: out.wav.toString("base64"), audioMime: "audio/wav", sampleRate: out.sampleRate, durationMs: out.durationMs, envelopeHz: 50, envelope: out.envelope });
    }),
  );

  // ── user profile, memories, activities, vaakili ──────────────────────────
  r.get("/users/:id", (req, res) => {
    const u = store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: { code: "user_not_found", message: "Unknown user" } });
    return res.json({ user: publicUser(u), character: engine.characterDto(getCharacter(u.characterId), u.appearance) });
  });

  r.patch("/users/:id", (req, res) => {
    const u = store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: { code: "user_not_found", message: "Unknown user" } });
    const b = req.body ?? {};
    if (str(b.name, 60)) u.name = str(b.name, 60);
    if (str(b.town, 80)) u.town = str(b.town, 80);
    if ((["te", "en", "mixed"] as const).includes(b.language)) u.language = b.language;
    if ((["casual", "respectful"] as const).includes(b.addressStyle)) u.addressStyle = b.addressStyle;
    if (str(b.characterId, 40)) u.characterId = getCharacter(b.characterId).id;
    if (b.appearance) u.appearance = { ...u.appearance, ...sanitizeAppearance(b.appearance, cfg.sarvam.ttsModel) };
    if (b.resetAppearance === true) u.appearance = {};
    store.saveUser(u);
    return res.json({ user: publicUser(u), character: engine.characterDto(getCharacter(u.characterId), u.appearance) });
  });

  r.delete("/users/:id", (req, res) => {
    const ok = store.deleteUser(req.params.id);
    res.status(ok ? 200 : 404).json({ ok });
  });

  r.get("/users/:id/memories", (req, res) => {
    const u = store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: { code: "user_not_found", message: "Unknown user" } });
    return res.json({ memories: u.memories });
  });

  r.post("/users/:id/memories", (req, res) => {
    const u = store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: { code: "user_not_found", message: "Unknown user" } });
    const text = str(req.body?.text, 160);
    if (!text) return res.status(400).json({ error: { code: "missing_text", message: "text is required" } });
    const merged = mergeMemories(u.memories, [{ text, category: str(req.body?.category, 20), source: "user" }]);
    store.saveUser(u);
    return res.json({ added: merged.added, memories: u.memories });
  });

  r.delete("/users/:id/memories/:memoryId", (req, res) => {
    const u = store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: { code: "user_not_found", message: "Unknown user" } });
    const before = u.memories.length;
    u.memories = u.memories.filter((m) => m.id !== req.params.memoryId);
    store.saveUser(u);
    return res.json({ removed: before - u.memories.length, memories: u.memories });
  });

  r.get("/users/:id/activities", (req, res) => {
    const u = store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: { code: "user_not_found", message: "Unknown user" } });
    const activities = getTodaysActivities(u, getCharacter(u.characterId));
    store.saveUser(u);
    return res.json({ date: istDateKey(), activities, energy: u.vaakili.energy });
  });

  r.post("/users/:id/activities/:activityId/complete", (req, res) => {
    const u = store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: { code: "user_not_found", message: "Unknown user" } });
    getTodaysActivities(u, getCharacter(u.characterId));
    const act = completeActivity(u, req.params.activityId);
    if (!act) return res.status(404).json({ error: { code: "activity_not_found", message: "No such activity today" } });
    store.saveUser(u);
    return res.json({ activity: act, vaakili: u.vaakili });
  });

  r.get("/users/:id/vaakili", (req, res) => {
    const u = store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: { code: "user_not_found", message: "Unknown user" } });
    return res.json({ vaakili: u.vaakili, actions: CARE_ACTIONS, streak: u.streak });
  });

  r.post("/users/:id/vaakili/care", (req, res) => {
    const u = store.getUser(req.params.id);
    if (!u) return res.status(404).json({ error: { code: "user_not_found", message: "Unknown user" } });
    const action = str(req.body?.action, 20) as keyof typeof CARE_ACTIONS;
    if (!action || !CARE_ACTIONS[action]) return res.status(400).json({ error: { code: "bad_action", message: `action must be one of ${Object.keys(CARE_ACTIONS).join(", ")}` } });
    const result = careForVaakili(u, action);
    store.saveUser(u);
    return res.status(result.ok ? 200 : 409).json(result);
  });

  // ── misc ─────────────────────────────────────────────────────────────────
  r.get("/festivals", (_req, res) => res.json({ upcoming: upcomingFestivals(new Date(), 30), all: FESTIVALS }));
  r.get("/usage", (_req, res) => res.json(budget.summary()));

  // ── errors ───────────────────────────────────────────────────────────────
  r.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof EngineError) return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    if (err instanceof ProviderError) {
      log.error("provider error", { status: err.status, endpoint: err.endpoint });
      return res.status(err.status === 429 ? 429 : 502).json({ error: { code: err.status === 429 ? "rate_limited" : "provider_error", message: err.message, endpoint: err.endpoint } });
    }
    if (err instanceof multer.MulterError) return res.status(400).json({ error: { code: "upload_error", message: err.message } });
    log.error("unhandled", { err: (err as Error).stack ?? String(err) });
    return res.status(500).json({ error: { code: "internal", message: "Internal error" } });
  });

  return r;
}

function publicUser(u: import("../store/store.js").UserRecord) {
  return {
    id: u.id,
    name: u.name ?? null,
    town: u.town ?? null,
    language: u.language,
    addressStyle: u.addressStyle,
    characterId: u.characterId,
    appearance: u.appearance,
    memoryCount: u.memories.length,
    vaakili: u.vaakili,
    streak: u.streak,
    totalTurns: u.totalTurns,
    createdAt: u.createdAt,
    lastSeenAt: u.lastSeenAt,
  };
}
