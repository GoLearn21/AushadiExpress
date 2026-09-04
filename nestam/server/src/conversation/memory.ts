import { newId } from "../util/ids.js";
import type { Memory } from "../store/store.js";

const STOP = new Set(["the", "a", "an", "is", "are", "of", "to", "and", "user", "user's", "users", "their", "they", "in", "on", "for", "with", "has", "have", "likes", "like"]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !STOP.has(t)),
  );
}

/** Jaccard similarity on word tokens — good enough to dedupe near-identical facts. */
export function similarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return a.trim().toLowerCase() === b.trim().toLowerCase() ? 1 : 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

export function guessCategory(text: string): string {
  const t = text.toLowerCase();
  if (/\bname\b|పేరు/.test(t)) return "identity";
  if (/\b(mother|father|amma|nanna|sister|brother|wife|husband|son|daughter|family|grand)/.test(t) || /అమ్మ|నాన్న|అక్క|అన్న|తమ్ముడు|చెల్లి|భార్య|భర్త/.test(t)) return "family";
  if (/\b(work|job|office|company|college|school|student|exam|study|engineer|doctor|teacher)\b/.test(t) || /ఆఫీస్|కాలేజ్|పరీక్ష|ఉద్యోగం/.test(t)) return "work";
  if (/\b(dislike|hate|doesn'?t like|can'?t stand)\b/.test(t) || /ఇష్టం లేదు|నచ్చదు/.test(t)) return "dislikes";
  if (/\b(likes?|loves?|favou?rite|enjoys?|fan of)\b/.test(t) || /ఇష్టం|నచ్చ/.test(t)) return "likes";
  if (/\b(goal|want to|plan|dream|trying to|learning)\b/.test(t) || /లక్ష్యం|కావాలి|నేర్చుకో/.test(t)) return "goals";
  if (/\b(birthday|wedding|exam on|next week|tomorrow|trip|festival)\b/.test(t) || /పుట్టినరోజు|పెళ్లి|రేపు/.test(t)) return "events";
  if (/\b(health|sick|doctor|pain|sleep|diabet|bp|allergy)\b/.test(t) || /ఆరోగ్యం|జబ్బు|నొప్పి/.test(t)) return "health";
  return "other";
}

export interface MergeResult {
  added: Memory[];
  skipped: number;
}

/** Merges candidate facts into the memory list, skipping near-duplicates. */
export function mergeMemories(existing: Memory[], candidates: Array<{ text: string; category?: string; source?: Memory["source"] }>, now: () => Date = () => new Date(), max = 200): MergeResult {
  const added: Memory[] = [];
  let skipped = 0;
  for (const cand of candidates) {
    const text = cand.text.trim().replace(/\s+/g, " ");
    if (text.length < 4) {
      skipped++;
      continue;
    }
    const dupe = [...existing, ...added].some((m) => similarity(m.text, text) >= 0.6);
    if (dupe) {
      skipped++;
      continue;
    }
    added.push({ id: newId("mem"), text: text.slice(0, 160), category: cand.category ?? guessCategory(text), createdAt: now().toISOString(), source: cand.source ?? "reply" });
  }
  existing.push(...added);
  if (existing.length > max) existing.splice(0, existing.length - max);
  return { added, skipped };
}
