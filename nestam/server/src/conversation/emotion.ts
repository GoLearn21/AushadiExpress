import { EMOTIONS, GESTURES } from "../characters/prompts.js";
import type { Emotion, Gesture } from "../characters/prompts.js";

export interface ParsedReply {
  reply: string;
  replyRoman: string;
  emotion: Emotion;
  gesture: Gesture;
  memoryNotes: string[];
  activityCompleted: string | null;
  /** True when the model's output was not valid JSON and had to be salvaged. */
  salvaged: boolean;
}

const EMOTION_KEYWORDS: Array<[Emotion, RegExp]> = [
  ["laughing", /హహ|హిహి|😂|haha|lol|నవ్వు/iu],
  ["caring", /బాధ|అయ్యో|sorry|కష్టం|నేను ఉన్నాను|i'?m here|దిగులు/iu],
  ["excited", /లెట్స్ గో|అదిరింది|సూపర్|wow|awesome|amazing|ఫుల్ జోష్/iu],
  ["curious", /మీకు తెలుసా|\?|ఏంటి|why|how come|క్విజ్/iu],
  ["sleepy", /నిద్ర|పడుకో|sleep|శుభ రాత్రి|good night/iu],
  ["calm", /నెమ్మదిగా|ప్రశాంత|ఊపిరి తీసుకుందాం|breathe|relax/iu],
  ["proud", /కథ|పద్యం|story|తెర లేచింది/iu],
  ["happy", /సంతోషం|బాగుంది|నచ్చింది|great|happy|శుభోదయం|good morning/iu],
];

export function guessEmotion(text: string): Emotion {
  for (const [emotion, re] of EMOTION_KEYWORDS) if (re.test(text)) return emotion;
  return "neutral";
}

/** Removes markdown, emojis and stage directions so TTS reads clean speech. */
export function cleanSpeech(text: string, maxChars = 420): string {
  let t = text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[*_#>`~]+/g, "")
    .replace(/\((?:[^()]{0,60})\)/g, (m) => (/[\p{L}]{3,}\s[\p{L}]{3,}/u.test(m) && /^[(](smiles|laughs|nods|giggles|pauses|sighs|whispers)/i.test(m) ? "" : m))
    .replace(/\[[^\]]{0,40}\]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length > maxChars) {
    const cut = t.slice(0, maxChars);
    const lastStop = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("!"), cut.lastIndexOf("?"), cut.lastIndexOf("।"));
    t = lastStop > maxChars * 0.5 ? cut.slice(0, lastStop + 1) : cut.trimEnd() + "…";
  }
  return t;
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const candidates = [trimmed];
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) candidates.push(trimmed.slice(first, last + 1));
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Record<string, unknown>;
    } catch {
      /* try next */
    }
  }
  return null;
}

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Parses the model output for a bomma_reply turn; salvages plain text if JSON is missing. */
export function parseReply(raw: string): ParsedReply {
  const obj = extractJsonObject(raw);
  if (obj && typeof obj.reply === "string") {
    const reply = cleanSpeech(obj.reply);
    const notes = Array.isArray(obj.memory_notes) ? obj.memory_notes.filter((n): n is string => typeof n === "string" && n.trim().length > 0).map((n) => n.trim().slice(0, 140)) : [];
    return {
      reply,
      replyRoman: typeof obj.reply_roman === "string" ? cleanSpeech(obj.reply_roman) : "",
      emotion: pickEnum(obj.emotion, EMOTIONS, guessEmotion(reply)),
      gesture: pickEnum(obj.gesture, GESTURES, "none"),
      memoryNotes: notes.slice(0, 5),
      activityCompleted: typeof obj.activity_completed === "string" && obj.activity_completed.trim() ? obj.activity_completed.trim() : null,
      salvaged: false,
    };
  }
  // Salvage: strip a leading [emotion] tag if present, treat rest as speech.
  let text = raw.trim();
  let emotion: Emotion | null = null;
  const tag = text.match(/^\s*\[(\w+)\]\s*/);
  if (tag) {
    emotion = pickEnum(tag[1].toLowerCase(), EMOTIONS, "neutral");
    text = text.slice(tag[0].length);
  }
  const reply = cleanSpeech(text) || "హ్మ్... ఇంకోసారి చెప్పండి?";
  return { reply, replyRoman: "", emotion: emotion ?? guessEmotion(reply), gesture: "none", memoryNotes: [], activityCompleted: null, salvaged: true };
}
