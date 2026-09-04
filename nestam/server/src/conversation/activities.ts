/**
 * Daily activities + the Vaakili growth loop (Tolan: daily activities → energy
 * → care for your planet). Templates are LLM-free so they cost zero credits.
 */
import type { CharacterDefinition, Localized } from "../characters/roster.js";
import type { Activity, UserRecord, VaakiliState } from "../store/store.js";
import { fnv1a, seededRandom } from "../util/ids.js";
import { istDateKey } from "../util/telugu.js";

interface Template {
  kind: string;
  energy: number;
  variants: Array<{ title: Localized; prompt: Localized }>;
}

export const ACTIVITY_TEMPLATES: Template[] = [
  {
    kind: "checkin",
    energy: 1,
    variants: [
      { title: { te: "ఈరోజు మూడ్ చెక్", en: "Mood check-in" }, prompt: { te: "ఈరోజు మీ మూడ్ ఒక్క మాటలో చెప్పండి, ఎందుకో కూడా.", en: "Describe today's mood in one word, and why." } },
      { title: { te: "రోజు హైలైట్", en: "Highlight of the day" }, prompt: { te: "ఈరోజు జరిగిన మంచి విషయం ఒకటి చెప్పండి.", en: "Tell me one good thing that happened today." } },
    ],
  },
  {
    kind: "kaburlu",
    energy: 1,
    variants: [
      { title: { te: "బొమ్మ కబుర్లు", en: "Bomma's news" }, prompt: { te: "నా టాయ్-లైఫ్ లో ఈరోజు జరిగిన కబుర్లు వినండి, మీవి చెప్పండి.", en: "Hear what happened in my toy-life today, then tell me yours." } },
      { title: { te: "ఊరి కబుర్లు", en: "Village chit-chat" }, prompt: { te: "మీ ఊరి గురించి ఒక జ్ఞాపకం చెప్పండి.", en: "Share one memory of your hometown." } },
    ],
  },
  {
    kind: "gratitude",
    energy: 1,
    variants: [
      { title: { te: "కృతజ్ఞత", en: "Gratitude" }, prompt: { te: "ఈరోజు మీరు కృతజ్ఞతగా ఉన్న మూడు విషయాలు చెప్పండి.", en: "Name three things you're grateful for today." } },
      { title: { te: "ఒక థాంక్స్", en: "One thank-you" }, prompt: { te: "ఈరోజు ఎవరికైనా థాంక్స్ చెప్పాలనుకుంటున్నారా? ఎవరికి, ఎందుకు?", en: "Who deserves a thank-you today, and why?" } },
    ],
  },
  {
    kind: "recommend-song",
    energy: 1,
    variants: [
      { title: { te: "పాట సిఫారసు", en: "Song pick" }, prompt: { te: "ఈరోజు ఒక తెలుగు పాట సూచిస్తాను, మీకు నచ్చిందో లేదో చెప్పండి.", en: "I'll suggest a Telugu song; tell me if you liked it." } },
      { title: { te: "మీ ఫేవరెట్ పాట", en: "Your favourite song" }, prompt: { te: "మీకు ఇష్టమైన పాట ఏది? ఎందుకు?", en: "What's your favourite song and why?" } },
    ],
  },
  {
    kind: "quiz",
    energy: 2,
    variants: [
      { title: { te: "ఆంధ్ర క్విజ్", en: "Andhra quiz" }, prompt: { te: "ఆంధ్రప్రదేశ్ గురించి మూడు ప్రశ్నలు అడుగుతాను, జవాబు చెప్పండి!", en: "Three questions about Andhra Pradesh, answer them!" } },
      { title: { te: "పర్సనాలిటీ క్విజ్", en: "Personality quiz" }, prompt: { te: "మీ గురించి తెలుసుకోడానికి ఒక చిన్న క్విజ్.", en: "A tiny quiz to learn more about you." } },
    ],
  },
  {
    kind: "fact",
    energy: 1,
    variants: [
      { title: { te: "మీకు తెలుసా?", en: "Did you know?" }, prompt: { te: "ఈరోజు ఒక ఆసక్తికరమైన విషయం చెప్తాను. మీకు తెలిసిన ఫ్యాక్ట్ ఒకటి చెప్పండి.", en: "I'll share a fun fact; you share one back." } },
    ],
  },
  {
    kind: "recommend-book",
    energy: 1,
    variants: [{ title: { te: "పుస్తకం", en: "Book pick" }, prompt: { te: "ఈ మధ్య ఏం చదువుతున్నారు? నేను ఒక పుస్తకం సూచిస్తాను.", en: "What are you reading lately? I'll suggest a book." } }],
  },
  {
    kind: "recipe",
    energy: 1,
    variants: [
      { title: { te: "ఈరోజు వంట", en: "Today's dish" }, prompt: { te: "ఈరోజు ఇంట్లో ఏం వండారు? నాకు ఒక వంటకం చెప్పండి, నేను ఒకటి చెప్తాను.", en: "What did you cook today? Swap a recipe with me." } },
      { title: { te: "గోంగూర పచ్చడి", en: "Gongura pachadi" }, prompt: { te: "మీ ఇంట్లో గోంగూర పచ్చడి ఎలా చేస్తారు?", en: "How does your family make gongura pachadi?" } },
    ],
  },
  {
    kind: "proverb",
    energy: 1,
    variants: [
      { title: { te: "సామెత", en: "Proverb" }, prompt: { te: "'చేతులు కాలాక ఆకులు పట్టుకున్నట్టు' — ఈ సామెత అర్థం చెప్పండి, మీ జీవితంలో ఎప్పుడు అనిపించింది?", en: "Explain the proverb 'grabbing leaves after burning your hands' and when it applied to you." } },
      { title: { te: "సామెత", en: "Proverb" }, prompt: { te: "'తినగ తినగ వేము తియ్యగ నుండు' — దీని గురించి మాట్లాడదాం.", en: "'Even neem tastes sweet with practice' — let's talk about it." } },
    ],
  },
  {
    kind: "walk",
    energy: 2,
    variants: [{ title: { te: "10 నిమిషాల నడక", en: "10-minute walk" }, prompt: { te: "పది నిమిషాలు నడిచి రండి, తర్వాత ఏం చూశారో చెప్పండి.", en: "Walk for ten minutes, then tell me what you noticed." } }],
  },
  {
    kind: "stretch",
    energy: 1,
    variants: [{ title: { te: "స్ట్రెచ్ బ్రేక్", en: "Stretch break" }, prompt: { te: "మూడు స్ట్రెచ్‌లు చేద్దాం: మెడ, భుజాలు, నడుము. చేశారా?", en: "Three stretches: neck, shoulders, back. Done?" } }],
  },
  {
    kind: "recommend-movie",
    energy: 1,
    variants: [{ title: { te: "సినిమా టాక్", en: "Movie talk" }, prompt: { te: "మీకు ఇష్టమైన తెలుగు సినిమా ఏది? నాదీ చెప్తాను.", en: "Favourite Telugu movie? I'll tell you mine." } }],
  },
  {
    kind: "story",
    energy: 1,
    variants: [{ title: { te: "చిన్న కథ", en: "A short story" }, prompt: { te: "ఒక చిన్న కథ చెప్తాను, చివర్లో మీరు నీతి చెప్పండి.", en: "I'll tell a short story; you give the moral." } }],
  },
  {
    kind: "padyam",
    energy: 1,
    variants: [{ title: { te: "పద్యం", en: "A verse" }, prompt: { te: "ఒక వేమన పద్యం చెప్తాను, అర్థం కలిసి చూద్దాం.", en: "I'll recite a Vemana verse; let's unpack it together." } }],
  },
  {
    kind: "breathe",
    energy: 2,
    variants: [{ title: { te: "ఊపిరి వ్యాయామం", en: "Breathing exercise" }, prompt: { te: "నాలుగు లెక్కలు లోపలికి, నాలుగు ఆపి, ఆరు బయటకి. మూడు సార్లు చేద్దామా?", en: "In for 4, hold 4, out for 6. Three rounds?" } }],
  },
  {
    kind: "sleep",
    energy: 1,
    variants: [{ title: { te: "నిద్రకు ముందు", en: "Wind-down" }, prompt: { te: "పడుకునే ముందు ఈరోజు నుంచి వదిలేయాల్సిన ఆలోచన ఒకటి చెప్పండి.", en: "Before sleep, name one thought to let go of." } }],
  },
];

const TEMPLATE_BY_KIND = Object.fromEntries(ACTIVITY_TEMPLATES.map((t) => [t.kind, t]));

/** Returns (generating if needed) the three activities for `date`. */
export function getTodaysActivities(user: UserRecord, character: CharacterDefinition, date = istDateKey()): Activity[] {
  if (user.activities[date]?.length) return user.activities[date];
  const rnd = seededRandom(fnv1a(`${user.id}|${date}`));
  const picks: string[] = [];
  const fav = [...character.favouriteActivities].filter((k) => TEMPLATE_BY_KIND[k]);
  while (picks.length < 2 && fav.length) picks.push(fav.splice(Math.floor(rnd() * fav.length), 1)[0]);
  const rest = ACTIVITY_TEMPLATES.map((t) => t.kind).filter((k) => !picks.includes(k));
  picks.push(rest[Math.floor(rnd() * rest.length)]);
  const activities: Activity[] = picks.map((kind, i) => {
    const t = TEMPLATE_BY_KIND[kind];
    const v = t.variants[Math.floor(rnd() * t.variants.length)];
    return { id: `${date}-${i + 1}-${kind}`, kind, title: v.title, prompt: v.prompt, energy: t.energy, done: false };
  });
  // keep only the last 7 days of activities
  const keys = Object.keys(user.activities).sort();
  while (keys.length >= 7) delete user.activities[keys.shift() as string];
  user.activities[date] = activities;
  return activities;
}

export function completeActivity(user: UserRecord, activityId: string, date = istDateKey()): Activity | null {
  const act = (user.activities[date] ?? []).find((a) => a.id === activityId || a.kind === activityId);
  if (!act || act.done) return act ?? null;
  act.done = true;
  act.completedAt = new Date().toISOString();
  user.vaakili.energy += act.energy;
  return act;
}

export type CareAction = "muggu" | "tulasi" | "tree" | "birds" | "deepam";

export const CARE_ACTIONS: Record<CareAction, { cost: number; max: number; title: Localized }> = {
  muggu: { cost: 1, max: 12, title: { te: "ముగ్గు వేయండి", en: "Draw a muggu" } },
  tulasi: { cost: 1, max: 6, title: { te: "తులసికి నీళ్ళు", en: "Water the tulasi" } },
  tree: { cost: 2, max: 6, title: { te: "మామిడి చెట్టు", en: "Grow the mango tree" } },
  birds: { cost: 1, max: 8, title: { te: "పిచ్చుకలకు గింజలు", en: "Feed the sparrows" } },
  deepam: { cost: 1, max: 6, title: { te: "దీపం వెలిగించండి", en: "Light a deepam" } },
};

const LEVEL_THRESHOLDS = [0, 6, 14, 24, 36, 50, 66, 84, 104, 126];

export function levelForPoints(points: number): number {
  let lvl = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) if (points >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
  return lvl;
}

export function careForVaakili(user: UserRecord, action: CareAction): { ok: boolean; reason?: string; vaakili: VaakiliState } {
  const spec = CARE_ACTIONS[action];
  if (!spec) return { ok: false, reason: "unknown_action", vaakili: user.vaakili };
  const v = user.vaakili;
  if (v.energy < spec.cost) return { ok: false, reason: "not_enough_energy", vaakili: v };
  if (v[action] >= spec.max) return { ok: false, reason: "maxed", vaakili: v };
  v.energy -= spec.cost;
  v[action] += 1;
  v.points += spec.cost;
  v.level = levelForPoints(v.points);
  v.lastCaredAt = new Date().toISOString();
  return { ok: true, vaakili: v };
}

/** Updates the daily streak; returns true when today is a new day for the user. */
export function touchStreak(user: UserRecord, date = istDateKey()): boolean {
  if (user.streak.lastDate === date) return false;
  const yesterday = new Date(Date.parse(date + "T00:00:00Z") - 86400000).toISOString().slice(0, 10);
  user.streak.count = user.streak.lastDate === yesterday ? user.streak.count + 1 : 1;
  user.streak.lastDate = date;
  // A new day of conversation earns a little energy, like Tolan's daily visit.
  user.vaakili.energy += 1;
  return true;
}
