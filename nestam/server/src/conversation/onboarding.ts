/**
 * Onboarding quiz — Tolan matches you to an alien through personality quizzes;
 * Nestam matches you to a Bomma through five quick Telugu questions.
 */
import { CHARACTERS } from "../characters/roster.js";
import type { CharacterTraits, Localized } from "../characters/roster.js";

export interface QuizOption {
  id: string;
  text: Localized;
  traits: Partial<CharacterTraits>;
}

export interface QuizQuestion {
  id: string;
  text: Localized;
  options: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    text: { te: "ఆదివారం సాయంత్రం మీరు ఏం చేస్తారు?", en: "What's your ideal Sunday evening?" },
    options: [
      { id: "a", text: { te: "ఇంట్లో అందరితో కబుర్లు", en: "Chatting with family at home" }, traits: { warmth: 1, calm: 0.4 } },
      { id: "b", text: { te: "కొత్తది ఏదైనా నేర్చుకోవడం", en: "Learning something new" }, traits: { curiosity: 1, energy: 0.4 } },
      { id: "c", text: { te: "క్రికెట్ లేదా జిమ్", en: "Cricket or the gym" }, traits: { energy: 1, drama: 0.3 } },
      { id: "d", text: { te: "నిశ్శబ్దంగా, ప్రశాంతంగా", en: "Quiet and peaceful" }, traits: { calm: 1, warmth: 0.3 } },
    ],
  },
  {
    id: "q2",
    text: { te: "బాధగా ఉన్నప్పుడు మీకు ఏం కావాలి?", en: "When you're down, what helps?" },
    options: [
      { id: "a", text: { te: "ఎవరైనా వినాలి", en: "Someone to just listen" }, traits: { warmth: 1 } },
      { id: "b", text: { te: "నవ్వించే కథ", en: "A funny story" }, traits: { drama: 1, warmth: 0.3 } },
      { id: "c", text: { te: "‘లేచి కదులు!’ అనే పుష్", en: "A push to get moving" }, traits: { energy: 1 } },
      { id: "d", text: { te: "నెమ్మదిగా ఊపిరి, నిశ్శబ్దం", en: "Slow breathing, silence" }, traits: { calm: 1 } },
    ],
  },
  {
    id: "q3",
    text: { te: "మీ మాట తీరు ఎలా ఉంటుంది?", en: "How do you talk?" },
    options: [
      { id: "a", text: { te: "వేగంగా, ఉత్సాహంగా", en: "Fast and excited" }, traits: { energy: 1, curiosity: 0.4 } },
      { id: "b", text: { te: "నెమ్మదిగా, ఆలోచించి", en: "Slow and thoughtful" }, traits: { calm: 1 } },
      { id: "c", text: { te: "నాటకీయంగా, కథల్లా", en: "Dramatic, like stories" }, traits: { drama: 1 } },
      { id: "d", text: { te: "సరదాగా, ప్రేమగా", en: "Playful and affectionate" }, traits: { warmth: 1, energy: 0.3 } },
    ],
  },
  {
    id: "q4",
    text: { te: "పండుగ అంటే మీకు ఏది ఇష్టం?", en: "Favourite part of a festival?" },
    options: [
      { id: "a", text: { te: "వంటలు, పిండి వంటలు", en: "The food" }, traits: { warmth: 0.6, calm: 0.6 } },
      { id: "b", text: { te: "ముగ్గులు, అలంకరణ", en: "Muggulu and decoration" }, traits: { curiosity: 0.6, drama: 0.5 } },
      { id: "c", text: { te: "గాలిపటాలు, ఆటలు", en: "Kites and games" }, traits: { energy: 1 } },
      { id: "d", text: { te: "కథలు, పాటలు, భజన", en: "Stories, songs, bhajans" }, traits: { drama: 1, calm: 0.3 } },
    ],
  },
  {
    id: "q5",
    text: { te: "మీ నేస్తం మీకు రోజూ ఏం చేయాలి?", en: "What should your friend do every day?" },
    options: [
      { id: "a", text: { te: "నా రోజు గురించి అడగాలి", en: "Ask about my day" }, traits: { warmth: 1 } },
      { id: "b", text: { te: "ఒక కొత్త విషయం చెప్పాలి", en: "Teach me one new thing" }, traits: { curiosity: 1 } },
      { id: "c", text: { te: "మోటివేట్ చేయాలి", en: "Motivate me" }, traits: { energy: 1 } },
      { id: "d", text: { te: "ప్రశాంతంగా ఉంచాలి", en: "Keep me calm" }, traits: { calm: 1 } },
    ],
  },
];

const AXES: Array<keyof CharacterTraits> = ["warmth", "energy", "curiosity", "calm", "drama"];

export interface MatchResult {
  characterId: string;
  scores: Array<{ characterId: string; score: number }>;
  profile: CharacterTraits;
}

export function matchCharacter(answers: Record<string, string>): MatchResult {
  const profile: CharacterTraits = { warmth: 0.2, energy: 0.2, curiosity: 0.2, calm: 0.2, drama: 0.2 };
  for (const q of QUIZ) {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    if (!opt) continue;
    for (const axis of AXES) profile[axis] += opt.traits[axis] ?? 0;
  }
  const norm = Math.sqrt(AXES.reduce((a, k) => a + profile[k] * profile[k], 0)) || 1;
  const scores = CHARACTERS.map((c) => {
    const cn = Math.sqrt(AXES.reduce((a, k) => a + c.traits[k] * c.traits[k], 0)) || 1;
    const dot = AXES.reduce((a, k) => a + (profile[k] / norm) * (c.traits[k] / cn), 0);
    return { characterId: c.id, score: Math.round(dot * 1000) / 1000 };
  }).sort((a, b) => b.score - a.score);
  return { characterId: scores[0].characterId, scores, profile };
}
