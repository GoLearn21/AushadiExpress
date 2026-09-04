/**
 * ConversationEngine — the Tolan-style loop:
 *   audio ──STT──▶ text ──LLM (persona + memory + context)──▶ {reply, emotion, gesture}
 *        ──TTS──▶ wav + lip-sync envelope ──▶ client animates the Bomma.
 */
import type { NestamConfig } from "../config.js";
import { computeEnvelope, parseWav } from "../audio/wav.js";
import { getCharacter, resolveVisual } from "../characters/roster.js";
import type { AppearanceOverride, CharacterDefinition, CharacterVisual } from "../characters/roster.js";
import { HELPLINE, REPLY_SCHEMA, MEMORY_SCHEMA, buildMemoryExtractionPrompt, buildSystemPrompt, detectCrisis } from "../characters/prompts.js";
import type { Emotion, Gesture } from "../characters/prompts.js";
import { logger } from "../logger.js";
import type { BudgetTracker } from "../sarvam/budget.js";
import type { AiProvider, ChatMessage } from "../sarvam/types.js";
import type { SessionRecord, Store, UserRecord } from "../store/store.js";
import { sha1 } from "../util/ids.js";
import { guessLanguage, hasTeluguScript, istDateKey, looksLikeTenglish, timeOfDay, upcomingFestivals } from "../util/telugu.js";
import { completeActivity, getTodaysActivities, touchStreak } from "./activities.js";
import { parseReply } from "./emotion.js";
import { mergeMemories } from "./memory.js";

const log = logger("engine");
const ENVELOPE_HZ = 50;
const HISTORY_TURNS = 14;
const EXTRACT_EVERY = 6;

export interface ReplyDto {
  id: string;
  sessionId: string;
  transcript: string;
  transcriptLanguage: string;
  text: string;
  textRoman: string;
  emotion: Emotion;
  gesture: Gesture;
  audioBase64: string;
  audioMime: string;
  sampleRate: number;
  durationMs: number;
  envelopeHz: number;
  envelope: number[];
  memoryUpdates: string[];
  activityCompleted: string | null;
  bond: { level: number; points: number; energy: number; streak: number; totalTurns: number };
  safety: { crisis: boolean; helpline: string };
  latencyMs: { stt: number; llm: number; tts: number; total: number };
  thrifty: boolean;
  provider: string;
  salvaged: boolean;
}

export interface CharacterDto {
  id: string;
  nameEn: string;
  nameTe: string;
  craft: { te: string; en: string };
  origin: { te: string; en: string };
  tagline: { te: string; en: string };
  blurb: { te: string; en: string };
  traits: CharacterDefinition["traits"];
  interests: string[];
  voice: { speaker: string; pace: number };
  visual: CharacterVisual;
  chirp: CharacterDefinition["chirp"];
  pokeLines: CharacterDefinition["pokeLines"];
}

export interface SessionInit {
  userId?: string;
  characterId?: string;
  name?: string;
  town?: string;
  language?: "te" | "en" | "mixed";
  addressStyle?: "casual" | "respectful";
  appearance?: AppearanceOverride;
  /** Skip the spoken greeting (saves a TTS call). */
  silent?: boolean;
}

export class ConversationEngine {
  constructor(
    private readonly provider: AiProvider,
    private readonly store: Store,
    private readonly budget: BudgetTracker,
    private readonly cfg: NestamConfig,
  ) {}

  // ── public API ───────────────────────────────────────────────────────────

  characterDto(character: CharacterDefinition, appearance: AppearanceOverride = {}): CharacterDto {
    const speaker = this.speakerFor(character, appearance);
    return {
      id: character.id,
      nameEn: character.nameEn,
      nameTe: character.nameTe,
      craft: character.craft,
      origin: character.origin,
      tagline: character.tagline,
      blurb: character.blurb,
      traits: character.traits,
      interests: character.interests,
      voice: { speaker, pace: character.voice.pace },
      visual: resolveVisual(character, appearance),
      chirp: character.chirp,
      pokeLines: character.pokeLines,
    };
  }

  async createSession(init: SessionInit): Promise<{ session: SessionRecord; user: UserRecord; character: CharacterDto; greeting: ReplyDto | null }> {
    let user = init.userId ? this.store.getUser(init.userId) : undefined;
    const characterId = getCharacter(init.characterId ?? user?.characterId).id;
    if (!user) {
      user = this.store.createUser({ id: init.userId, characterId, name: init.name, town: init.town, language: init.language, addressStyle: init.addressStyle, appearance: init.appearance });
    } else {
      if (init.characterId) user.characterId = characterId;
      if (init.name) user.name = init.name;
      if (init.town) user.town = init.town;
      if (init.language) user.language = init.language;
      if (init.addressStyle) user.addressStyle = init.addressStyle;
      if (init.appearance) user.appearance = { ...user.appearance, ...init.appearance };
    }
    const character = getCharacter(user.characterId);
    getTodaysActivities(user, character);
    touchStreak(user);
    this.store.saveUser(user);
    const session = this.store.createSession(user.id, character.id);
    const greeting = init.silent ? null : await this.greeting(session, user, character);
    return { session, user, character: this.characterDto(character, user.appearance), greeting };
  }

  /** Time-of-day greeting; costs one cached TTS call per (character, text). */
  async greeting(session: SessionRecord, user: UserRecord, character: CharacterDefinition): Promise<ReplyDto> {
    const started = Date.now();
    const tod = timeOfDay();
    const fest = upcomingFestivals(new Date(), 0)[0];
    const lang = user.language === "en" ? "en" : "te";
    const name = user.name?.trim() || (lang === "en" ? "friend" : "నేస్తం");
    let text = character.greetings[tod][lang].replace("{name}", name);
    if (fest) text = `${fest.greetingTe} ${text}`;
    const emotion: Emotion = tod === "night" ? "sleepy" : "happy";
    session.turns.push({ role: "assistant", content: text, at: new Date().toISOString(), emotion });
    this.store.saveSession(session);
    const tts = await this.speak(text, character, user.appearance, { cacheable: true });
    return this.buildReply(session, user, {
      transcript: "",
      transcriptLanguage: "",
      text,
      textRoman: "",
      emotion,
      gesture: tod === "morning" ? "bounce" : "nod",
      memoryUpdates: [],
      activityCompleted: null,
      crisis: false,
      tts,
      latency: { stt: 0, llm: 0, tts: tts.ms, total: Date.now() - started },
      salvaged: false,
    });
  }

  async handleText(sessionId: string, text: string): Promise<ReplyDto> {
    const { session, user, character } = this.load(sessionId);
    const clean = text.trim().slice(0, 2000);
    if (!clean) throw new EngineError("empty_text", "Text is empty", 400);
    const lang = looksLikeTenglish(clean) && !hasTeluguScript(clean) ? "mixed" : guessLanguage(clean);
    return this.respond(session, user, character, clean, lang, 0, { stt: lang === "en" ? "en-IN" : "te-IN" });
  }

  async handleVoice(sessionId: string, audio: Buffer, mimeType: string): Promise<ReplyDto> {
    const { session, user, character } = this.load(sessionId);
    if (audio.length < 100) throw new EngineError("empty_audio", "Audio too short", 400);
    const t0 = Date.now();
    const stt = await this.provider.transcribe(audio, { mimeType, languageCode: "unknown", mode: "transcribe" });
    const sttMs = Date.now() - t0;
    if (!stt.transcript) {
      const text = user.language === "en" ? "Sorry, I couldn't hear that. Say it once more?" : "క్షమించండి, సరిగ్గా వినపడలేదు. ఇంకోసారి చెప్పండి?";
      const tts = await this.speak(text, character, user.appearance, { cacheable: true });
      return this.buildReply(session, user, { transcript: "", transcriptLanguage: stt.languageCode, text, textRoman: "", emotion: "curious", gesture: "lean_in", memoryUpdates: [], activityCompleted: null, crisis: false, tts, latency: { stt: sttMs, llm: 0, tts: tts.ms, total: Date.now() - t0 }, salvaged: false });
    }
    const lang = stt.languageCode.startsWith("te") ? "te" : stt.languageCode.startsWith("en") ? "en" : guessLanguage(stt.transcript);
    return this.respond(session, user, character, stt.transcript, lang, sttMs, { stt: stt.languageCode });
  }

  /** Poke/tap reaction: canned line (no LLM), cached TTS. */
  async poke(sessionId: string): Promise<ReplyDto> {
    const { session, user, character } = this.load(sessionId);
    const started = Date.now();
    const line = character.pokeLines[Math.floor(Math.random() * character.pokeLines.length)];
    const text = user.language === "en" ? line.en : line.te;
    const tts = await this.speak(text, character, user.appearance, { cacheable: true });
    return this.buildReply(session, user, { transcript: "", transcriptLanguage: "", text, textRoman: "", emotion: "laughing", gesture: "wiggle", memoryUpdates: [], activityCompleted: null, crisis: false, tts, latency: { stt: 0, llm: 0, tts: tts.ms, total: Date.now() - started }, salvaged: false });
  }

  /** Utility TTS in a character's voice (used by /api/tts and the Unity editor preview). */
  async tts(text: string, characterId: string, appearance: AppearanceOverride = {}): Promise<{ wav: Buffer; sampleRate: number; durationMs: number; envelope: number[] }> {
    const character = getCharacter(characterId);
    const r = await this.speak(text, character, appearance, { cacheable: true, force: true });
    return { wav: r.wav ?? Buffer.alloc(0), sampleRate: r.sampleRate, durationMs: r.durationMs, envelope: r.envelope };
  }

  // ── core loop ────────────────────────────────────────────────────────────

  private async respond(session: SessionRecord, user: UserRecord, character: CharacterDefinition, userText: string, inputLanguage: "te" | "en" | "mixed", sttMs: number, meta: { stt: string }): Promise<ReplyDto> {
    const started = Date.now();
    const crisis = detectCrisis(userText);
    const today = istDateKey();
    const activities = getTodaysActivities(user, character, today);
    const newDay = touchStreak(user, today);
    if (newDay) log.debug("new day for user", { user: user.id, streak: user.streak.count });

    const system = buildSystemPrompt({
      character,
      user: { name: user.name, town: user.town, language: user.language, addressStyle: user.addressStyle },
      memories: user.memories.map((m) => ({ text: m.text, category: m.category })),
      bond: { level: user.vaakili.level, streak: user.streak.count, totalTurns: user.totalTurns },
      todaysActivities: activities.map((a) => ({ id: a.id, title: a.title.en, done: a.done })),
      inputLanguage,
      crisis,
    });
    const history: ChatMessage[] = session.turns.slice(-HISTORY_TURNS).map((t) => ({ role: t.role, content: t.content }));
    const messages: ChatMessage[] = [{ role: "system", content: system }, ...history, { role: "user", content: userText }];

    const t1 = Date.now();
    let parsed;
    try {
      const chat = await this.provider.chat(messages, { jsonSchema: REPLY_SCHEMA, temperature: crisis ? 0.4 : 0.75, maxTokens: 350 });
      parsed = parseReply(chat.content);
    } catch (err) {
      log.error("chat failed", { err: (err as Error).message });
      parsed = parseReply(user.language === "en" ? "[caring] Sorry, my toy brain froze for a second. Tell me again?" : "[caring] అయ్యో, నా బొమ్మ మెదడు ఒక్క క్షణం ఆగిపోయింది. ఇంకోసారి చెప్పండి?");
    }
    const llmMs = Date.now() - t1;
    if (crisis) parsed.emotion = "caring";

    // bookkeeping: turns, bond, memory notes, activity completion
    const now = new Date().toISOString();
    session.turns.push({ role: "user", content: userText, at: now }, { role: "assistant", content: parsed.reply, at: now, emotion: parsed.emotion });
    session.turnsSinceExtraction += 1;
    user.totalTurns += 1;
    user.vaakili.points += 1;
    const merged = mergeMemories(user.memories, parsed.memoryNotes.map((text) => ({ text, source: "reply" as const })));
    let activityCompleted: string | null = null;
    if (parsed.activityCompleted) {
      const done = completeActivity(user, parsed.activityCompleted, today);
      if (done?.done) activityCompleted = done.id;
    }
    this.store.saveUser(user);
    this.store.saveSession(session);
    if (session.turnsSinceExtraction >= EXTRACT_EVERY) {
      session.turnsSinceExtraction = 0;
      void this.extractMemories(session, user).catch((err) => log.warn("memory extraction failed", { err: (err as Error).message }));
    }

    const tts = await this.speak(parsed.reply, character, user.appearance, { cacheable: false });
    return this.buildReply(session, user, {
      transcript: userText,
      transcriptLanguage: meta.stt,
      text: parsed.reply,
      textRoman: parsed.replyRoman,
      emotion: parsed.emotion,
      gesture: parsed.gesture,
      memoryUpdates: merged.added.map((m) => m.text),
      activityCompleted,
      crisis,
      tts,
      latency: { stt: sttMs, llm: llmMs, tts: tts.ms, total: Date.now() - started + sttMs },
      salvaged: parsed.salvaged,
    });
  }

  private async extractMemories(session: SessionRecord, user: UserRecord): Promise<void> {
    if (this.budget.thrifty()) return;
    const turns = session.turns.slice(-EXTRACT_EVERY * 2).map((t) => ({ role: t.role, content: t.content }));
    const prompt = buildMemoryExtractionPrompt(turns, user.memories.map((m) => m.text));
    const res = await this.provider.chat([{ role: "system", content: `CHARACTER_ID: ${session.characterId}\nYou are a precise memory extractor.` }, { role: "user", content: prompt }], { jsonSchema: MEMORY_SCHEMA, temperature: 0.1, maxTokens: 300, reasoningEffort: "low" });
    let list: Array<{ text: string; category?: string }> = [];
    try {
      const obj = JSON.parse(res.content.slice(res.content.indexOf("{"), res.content.lastIndexOf("}") + 1));
      if (Array.isArray(obj.memories)) list = obj.memories.filter((m: unknown) => m && typeof (m as { text?: unknown }).text === "string");
    } catch {
      return;
    }
    const fresh = this.store.getUser(user.id) ?? user;
    const merged = mergeMemories(fresh.memories, list.map((m) => ({ text: m.text, category: m.category, source: "extracted" as const })));
    if (merged.added.length) {
      this.store.saveUser(fresh);
      log.info("memories extracted", { user: user.id, added: merged.added.length });
    }
  }

  // ── speech ───────────────────────────────────────────────────────────────

  private speakerFor(character: CharacterDefinition, appearance: AppearanceOverride): string {
    if (appearance.speaker) return appearance.speaker;
    return this.cfg.sarvam.ttsModel === "bulbul:v2" ? character.voice.speakerV2 : character.voice.speaker;
  }

  private async speak(text: string, character: CharacterDefinition, appearance: AppearanceOverride, opts: { cacheable: boolean; force?: boolean }): Promise<{ wav: Buffer | null; sampleRate: number; durationMs: number; envelope: number[]; ms: number; skipped: boolean }> {
    const started = Date.now();
    const thrifty = this.budget.thrifty();
    const speaker = this.speakerFor(character, appearance);
    const languageCode = hasTeluguScript(text) ? "te-IN" : "en-IN";
    const key = sha1(`${this.provider.name}|${this.cfg.sarvam.ttsModel}|${speaker}|${languageCode}|${character.voice.pace}|${text}`);
    const cached = this.store.ttsCacheGet(key);
    if (cached) {
      const parsed = parseWav(cached);
      return { wav: cached, sampleRate: parsed.sampleRate, durationMs: parsed.durationMs, envelope: computeEnvelope(parsed.samples, parsed.sampleRate, ENVELOPE_HZ), ms: Date.now() - started, skipped: false };
    }
    if (thrifty && !opts.force) {
      log.warn("thrifty mode: skipping TTS", { chars: text.length });
      return { wav: null, sampleRate: this.cfg.sarvam.ttsSampleRate, durationMs: 0, envelope: [], ms: 0, skipped: true };
    }
    try {
      const r = await this.provider.synthesize(text, {
        languageCode,
        speaker,
        pace: character.voice.pace,
        temperature: character.voice.temperature,
        pitch: character.voice.pitch,
        sampleRate: this.cfg.sarvam.ttsSampleRate,
        mockBaseHz: character.voice.mockBaseHz,
        mockSpan: character.voice.mockSpan,
        mockRate: character.voice.mockRate,
      });
      if (opts.cacheable) this.store.ttsCachePut(key, r.wav);
      const parsed = parseWav(r.wav);
      return { wav: r.wav, sampleRate: r.sampleRate, durationMs: r.durationMs, envelope: computeEnvelope(parsed.samples, parsed.sampleRate, ENVELOPE_HZ), ms: Date.now() - started, skipped: false };
    } catch (err) {
      log.error("tts failed", { err: (err as Error).message });
      return { wav: null, sampleRate: this.cfg.sarvam.ttsSampleRate, durationMs: 0, envelope: [], ms: Date.now() - started, skipped: true };
    }
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private load(sessionId: string): { session: SessionRecord; user: UserRecord; character: CharacterDefinition } {
    const session = this.store.getSession(sessionId);
    if (!session) throw new EngineError("session_not_found", "Unknown session; call POST /api/session first", 404);
    const user = this.store.getUser(session.userId);
    if (!user) throw new EngineError("user_not_found", "User for session no longer exists", 404);
    return { session, user, character: getCharacter(user.characterId) };
  }

  private buildReply(
    session: SessionRecord,
    user: UserRecord,
    p: {
      transcript: string;
      transcriptLanguage: string;
      text: string;
      textRoman: string;
      emotion: Emotion;
      gesture: Gesture;
      memoryUpdates: string[];
      activityCompleted: string | null;
      crisis: boolean;
      tts: { wav: Buffer | null; sampleRate: number; durationMs: number; envelope: number[]; ms: number; skipped: boolean };
      latency: { stt: number; llm: number; tts: number; total: number };
      salvaged: boolean;
    },
  ): ReplyDto {
    return {
      id: `rep_${sha1(`${session.id}|${session.turns.length}|${p.text}`).slice(0, 12)}`,
      sessionId: session.id,
      transcript: p.transcript,
      transcriptLanguage: p.transcriptLanguage,
      text: p.text,
      textRoman: p.textRoman,
      emotion: p.emotion,
      gesture: p.gesture,
      audioBase64: p.tts.wav ? p.tts.wav.toString("base64") : "",
      audioMime: "audio/wav",
      sampleRate: p.tts.sampleRate,
      durationMs: p.tts.durationMs,
      envelopeHz: ENVELOPE_HZ,
      envelope: p.tts.envelope,
      memoryUpdates: p.memoryUpdates,
      activityCompleted: p.activityCompleted,
      bond: { level: user.vaakili.level, points: user.vaakili.points, energy: user.vaakili.energy, streak: user.streak.count, totalTurns: user.totalTurns },
      safety: { crisis: p.crisis, helpline: p.crisis ? `${HELPLINE.name}: ${HELPLINE.number}` : "" },
      latencyMs: p.latency,
      thrifty: p.tts.skipped,
      provider: this.provider.name,
      salvaged: p.salvaged,
    };
  }
}

export class EngineError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "EngineError";
  }
}
