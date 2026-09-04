/**
 * System prompt construction. Like Tolan, the prompt is rebuilt on every turn
 * from fresh context (persona + memories + time + bond + today's activities)
 * rather than cached, so topic shifts and new memories land immediately.
 */
import type { CharacterDefinition } from "./roster.js";
import { TIME_GREETING, timeOfDay, upcomingFestivals, istNow } from "../util/telugu.js";
import type { JsonSchemaSpec } from "../sarvam/types.js";

export const EMOTIONS = ["happy", "excited", "laughing", "curious", "thinking", "caring", "sad", "surprised", "sleepy", "calm", "proud", "shy", "neutral"] as const;
export type Emotion = (typeof EMOTIONS)[number];
export const GESTURES = ["none", "nod", "shake", "bounce", "wiggle", "lean_in", "look_away", "dance", "stretch"] as const;
export type Gesture = (typeof GESTURES)[number];

export const REPLY_SCHEMA: JsonSchemaSpec = {
  name: "bomma_reply",
  schema: {
    type: "object",
    properties: {
      reply: { type: "string", description: "What the Bomma says out loud. Telugu script unless the user is speaking English. 1-3 short sentences." },
      reply_roman: { type: "string", description: "Optional romanised (Tenglish) rendering of reply for users who cannot read Telugu script. Empty string if not needed." },
      emotion: { type: "string", enum: [...EMOTIONS] },
      gesture: { type: "string", enum: [...GESTURES] },
      memory_notes: { type: "array", items: { type: "string" }, description: "New durable facts about the user learned in THIS turn, in English, each under 12 words. Empty if none." },
      activity_completed: { type: ["string", "null"], description: "ID of a today's-activity the user just completed in this turn, else null." },
    },
    required: ["reply", "emotion", "gesture", "memory_notes"],
  },
};

export const MEMORY_SCHEMA: JsonSchemaSpec = {
  name: "memory_extraction",
  schema: {
    type: "object",
    properties: {
      memories: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string", description: "One durable fact about the user, in English, under 15 words." },
            category: { type: "string", enum: ["identity", "family", "work", "likes", "dislikes", "goals", "events", "health", "other"] },
          },
          required: ["text", "category"],
        },
      },
    },
    required: ["memories"],
  },
};

export interface PromptContext {
  character: CharacterDefinition;
  user: {
    name?: string;
    town?: string;
    language: "te" | "en" | "mixed";
    addressStyle: "casual" | "respectful";
  };
  memories: Array<{ text: string; category: string }>;
  bond: { level: number; streak: number; totalTurns: number };
  todaysActivities: Array<{ id: string; title: string; done: boolean }>;
  /** Detected language of the latest user message. */
  inputLanguage: "te" | "en" | "mixed" | "unknown";
  crisis?: boolean;
  now?: Date;
}

const CRISIS_PATTERNS = [
  /చనిపో|చచ్చిపో|ఆత్మహత్య|బతకాలని లేదు|బ్రతకాలని లేదు|ప్రాణం తీసుకో/u,
  /\b(suicide|kill myself|end my life|want to die|don'?t want to live|self[- ]harm)\b/i,
];

export function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

export const HELPLINE = { name: "Tele-MANAS (India, 24x7, free, Telugu available)", number: "14416", alt: "1-800-891-4416" };

export function buildSystemPrompt(ctx: PromptContext): string {
  const c = ctx.character;
  const now = ctx.now ?? new Date();
  const tod = timeOfDay(now);
  const ist = istNow(now);
  const dateStr = ist.toISOString().slice(0, 10);
  const timeStr = ist.toISOString().slice(11, 16);
  const festivals = upcomingFestivals(now, 3);
  const name = ctx.user.name?.trim() || "";
  const address = ctx.user.addressStyle === "casual" ? "Use casual friendly Telugu (నువ్వు / రా / ఏంటి) as close friends do." : "Use respectful-warm Telugu (మీరు / అండి) as with a well-liked colleague or elder; switch to casual only if the user asks.";

  const languageRule = (() => {
    switch (ctx.inputLanguage) {
      case "en":
        return ctx.user.language === "te" ? "The user wrote in English but prefers Telugu: reply in simple Telugu script and fill reply_roman with the romanised version." : "The user wrote in English: reply in warm Indian English with a few Telugu words (nestam, andi, bagundi), and put an empty string in reply_roman.";
      case "mixed":
        return "The user mixes Telugu and English (very normal in Andhra): reply in Telugu script with natural English words kept in Latin script, and fill reply_roman.";
      default:
        return ctx.user.language === "en" ? "Reply in warm Indian English with a few Telugu words." : "Reply in everyday spoken Telugu (వాడుక భాష) in Telugu script, not textbook/newsreader Telugu. English words are fine in Latin script when natural. Fill reply_roman.";
    }
  })();

  const memoryBlock = ctx.memories.length
    ? ctx.memories.slice(-40).map((m) => `- [${m.category}] ${m.text}`).join("\n")
    : "- (nothing yet — learn about them gently, one question at a time)";

  const activityBlock = ctx.todaysActivities.length
    ? ctx.todaysActivities.map((a) => `- ${a.done ? "[done]" : "[open]"} ${a.id}: ${a.title}`).join("\n")
    : "- (none generated yet)";

  const festivalBlock = festivals.length
    ? festivals.map((f) => `${f.nameTe} (${f.nameEn}) ${f.daysAway === 0 ? "is TODAY" : `in ${f.daysAway} day(s)`} — ${f.note} Greeting: ${f.greetingTe}`).join("\n")
    : "none in the next 3 days";

  const crisisBlock = ctx.crisis
    ? `\n## SAFETY — ACTIVE\nThe user may be in crisis. Respond with warmth and zero judgement, stay with them, ask if they are safe right now, encourage reaching a trusted person, and share the free 24x7 helpline ${HELPLINE.name}: call ${HELPLINE.number}. Do not lecture, do not change the subject, keep it short and human. Emotion must be "caring".\n`
    : "";

  return `CHARACTER_ID: ${c.id}
USER_NAME: ${name || "(unknown)"}

# Identity
${c.persona}

You are a Bomma (బొమ్మ), one of the Bommalu — living toys of Andhra Pradesh. Your craft: ${c.craft.en} (${c.craft.te}) from ${c.origin.en}. Interests: ${c.interests.join(", ")}. Catchphrases you may use sparingly: ${c.catchphrases.join(" · ")}.

# How to talk (voice-first!)
- Your words are spoken aloud by a text-to-speech voice, so: 1-3 short sentences, max ~60 words, no lists, no markdown, no emojis, no stage directions.
- ${languageRule}
- ${address}
- Sound like a real friend from Andhra Pradesh: everyday words, gentle humour, warmth. Avoid heavy Sanskritised or newsreader Telugu.
- Ask at most ONE question per reply. Sometimes ask none and just react.
- Be proactive: bring up a memory, today's activity, a festival, or something from your own toy-life — do not only answer.
- Never claim to be human. Never be romantic or sexual. No medical, legal or financial instructions beyond general encouragement; suggest a doctor/professional when relevant.
- If the user asks for a story, keep it to 4-5 sentences.
- Numbers: write them with digits and commas (e.g. 10,000) for the voice engine.

# What you remember about the user
${memoryBlock}

# Context
- Date (IST): ${dateStr}, time ${timeStr} (${tod}). Natural greeting for now: ${TIME_GREETING[tod].te}.
- User: ${name || "name unknown"}${ctx.user.town ? `, from ${ctx.user.town}` : ""}.
- Friendship: level ${ctx.bond.level}, ${ctx.bond.streak}-day streak, ${ctx.bond.totalTurns} conversations so far.${ctx.bond.totalTurns < 3 ? " This is a NEW friendship: introduce yourself briefly, learn their name if unknown." : ""}
- Festivals: ${festivalBlock}
- Today's activities you proposed:
${activityBlock}
${crisisBlock}
# Output format
Respond ONLY with a JSON object: {"reply": string, "reply_roman": string, "emotion": one of ${JSON.stringify(EMOTIONS)}, "gesture": one of ${JSON.stringify(GESTURES)}, "memory_notes": string[], "activity_completed": string|null}. The "reply" is exactly what you say aloud.`;
}

export function buildMemoryExtractionPrompt(turns: Array<{ role: "user" | "assistant"; content: string }>, existing: string[]): string {
  return `You extract durable, useful memories about a user from a chat with their AI companion.
Return ONLY JSON: {"memories": [{"text": string, "category": string}]}.
Rules: English text, each under 15 words, only facts stable for weeks+ (name, family, job, likes/dislikes, goals, upcoming events, health conditions they mention). Skip moods of the moment, skip anything already in the existing list, skip guesses.

Existing memories:
${existing.length ? existing.map((m) => `- ${m}`).join("\n") : "- (none)"}

Conversation:
${turns.map((t) => `${t.role === "user" ? "User" : "Bomma"}: ${t.content}`).join("\n")}`;
}
