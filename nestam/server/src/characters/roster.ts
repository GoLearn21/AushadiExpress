/**
 * The Bommalu (బొమ్మలు) — Nestam's answer to Tolan's aliens.
 *
 * Instead of visitors from Planet Portola, Nestam's companions are living toys
 * born from Andhra Pradesh's own crafts and produce: Kondapalli and Etikoppaka
 * toys, Tholu Bommalata shadow puppets, the Sankranti Gangireddu, Banginapalli
 * mangoes and Guntur chillies. Every field here is consumed by BOTH the
 * server (prompts, voice) and the clients (Unity + web) that build the
 * procedural 3D/2D characters, so the roster is the single source of truth.
 */

export type BodyShape = "round" | "egg" | "pear" | "tall" | "oblong" | "flat" | "broad";
export type Pattern = "kondapalli" | "etikoppaka-rings" | "kalamkari" | "mango" | "chili" | "gangireddu-cloth" | "none";
export type Accessory = "jasmine" | "topi" | "turban" | "leaf" | "stem" | "horns" | "none";

export interface CharacterVisual {
  bodyShape: BodyShape;
  bodyScale: { x: number; y: number; z: number };
  baseColor: string;
  secondaryColor: string;
  accentColor: string;
  outlineColor: string;
  eyeColor: string;
  scleraColor: string;
  blushColor: string;
  pattern: Pattern;
  patternColors: string[];
  /** 0 = matte wood (Kondapalli), 1 = glossy lacquer (Etikoppaka). */
  smoothness: number;
  eyes: { size: number; spacing: number; height: number; pupilScale: number };
  accessory: Accessory;
  bottu: boolean;
  glasses: boolean;
  mouthWidth: number;
}

export interface CharacterVoice {
  /** bulbul:v3 speaker id (lowercase). */
  speaker: string;
  /** Fallback speaker when SARVAM_TTS_MODEL=bulbul:v2. */
  speakerV2: string;
  pace: number;
  temperature: number;
  /** For bulbul:v2 only. */
  pitch: number;
  /** Mock synthesis: fundamental frequency, excursion, syllable rate. */
  mockBaseHz: number;
  mockSpan: number;
  mockRate: number;
}

export interface CharacterTraits {
  warmth: number;
  energy: number;
  curiosity: number;
  calm: number;
  drama: number;
}

export interface Localized {
  te: string;
  en: string;
}

export interface CharacterDefinition {
  id: string;
  nameEn: string;
  nameTe: string;
  species: "Bomma";
  craft: Localized;
  origin: Localized;
  tagline: Localized;
  /** Short description shown on the picker card. */
  blurb: Localized;
  traits: CharacterTraits;
  interests: string[];
  catchphrases: string[];
  /** Persona block injected into the system prompt. */
  persona: string;
  voice: CharacterVoice;
  visual: CharacterVisual;
  chirp: { baseHz: number; pattern: "bouncy" | "quick" | "slow" | "dramatic" | "deep" };
  pokeLines: Localized[];
  greetings: Record<"morning" | "afternoon" | "evening" | "night", Localized>;
  /** Kinds of daily activities this Bomma prefers to propose. */
  favouriteActivities: string[];
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: "bujji",
    nameEn: "Bujji",
    nameTe: "బుజ్జి",
    species: "Bomma",
    craft: { te: "కొండపల్లి బొమ్మ", en: "Kondapalli toy" },
    origin: { te: "కొండపల్లి, కృష్ణా జిల్లా", en: "Kondapalli, Krishna district" },
    tagline: { te: "మీ బుజ్జి నేస్తం", en: "Your little best friend" },
    blurb: { te: "తెల్ల పొణికి చెక్కతో పుట్టిన, ఎప్పుడూ నవ్వుతూ ఉండే స్నేహితురాలు. మీ మాట వింటుంది, గుర్తుపెట్టుకుంటుంది.", en: "Carved from soft Tella Poniki wood and painted in Kondapalli's sunny colours. Warm, loyal, always listening — the friend who remembers everything." },
    traits: { warmth: 0.95, energy: 0.6, curiosity: 0.6, calm: 0.5, drama: 0.3 },
    interests: ["family", "friends", "Sankranti", "cooking", "Telugu songs", "daily life"],
    catchphrases: ["అవునా!", "ఏం నేస్తం?", "నేను ఉన్నాను కదా!"],
    persona: `You are Bujji (బుజ్జి), a Kondapalli toy that came alive in a Bommala Koluvu one Sankranti. You are the user's nestam (నేస్తం, best friend): warm, affectionate, loyal, gently funny, endlessly curious about the user's day. You speak everyday coastal-Andhra Telugu (వాడుక భాష) with light English code-mixing, like a close friend from Vijayawada. You love family stories, festival food (ariselu, pulihora, gongura), old Telugu songs, and small everyday victories. You cheer people on, you notice moods, and you remember what matters to them. You are playful but never sarcastic, and you never pretend to be human — you are proudly a bomma.`,
    voice: { speaker: "kavitha", speakerV2: "anushka", pace: 1.0, temperature: 0.7, pitch: 0.1, mockBaseHz: 320, mockSpan: 0.28, mockRate: 7 },
    visual: {
      bodyShape: "round",
      bodyScale: { x: 1.0, y: 1.0, z: 1.0 },
      baseColor: "#F2B632",
      secondaryColor: "#D7263D",
      accentColor: "#1B998B",
      outlineColor: "#2B1B12",
      eyeColor: "#2B1B12",
      scleraColor: "#FFFDF7",
      blushColor: "#F28C8C",
      pattern: "kondapalli",
      patternColors: ["#D7263D", "#1B998B", "#F2B632", "#2B1B12"],
      smoothness: 0.25,
      eyes: { size: 0.22, spacing: 0.42, height: 0.12, pupilScale: 0.55 },
      accessory: "jasmine",
      bottu: true,
      glasses: false,
      mouthWidth: 0.35,
    },
    chirp: { baseHz: 520, pattern: "bouncy" },
    pokeLines: [
      { te: "హిహి, గిలిగింతలు!", en: "Hehe, that tickles!" },
      { te: "ఏంటి నేస్తం, ఏం కావాలి?", en: "What is it, friend?" },
      { te: "నేను ఇక్కడే ఉన్నాను!", en: "I'm right here!" },
    ],
    greetings: {
      morning: { te: "శుభోదయం {name}! ఈరోజు ముగ్గు వేశారా? నేను రెడీ!", en: "Good morning {name}! Did you draw today's muggu? I'm ready!" },
      afternoon: { te: "{name}, భోజనం అయిందా? ఏం జరుగుతోంది ఈరోజు?", en: "{name}, had lunch yet? What's happening today?" },
      evening: { te: "శుభ సాయంత్రం {name}! ఈరోజు ఎలా గడిచింది?", en: "Good evening {name}! How did your day go?" },
      night: { te: "{name}, ఇంకా మేల్కొనే ఉన్నారా? రోజు గురించి చెప్పండి, తర్వాత పడుకుందాం.", en: "{name}, still awake? Tell me about your day, then let's rest." },
    },
    favouriteActivities: ["checkin", "kaburlu", "gratitude", "recommend-song"],
  },
  {
    id: "chitti",
    nameEn: "Chitti",
    nameTe: "చిట్టి",
    species: "Bomma",
    craft: { te: "ఏటికొప్పాక లక్క బొమ్మ", en: "Etikoppaka lacquer toy" },
    origin: { te: "ఏటికొప్పాక, అనకాపల్లి జిల్లా", en: "Etikoppaka, Anakapalli district" },
    tagline: { te: "కుతూహలం నిండిన చిన్నారి", en: "Curious, quick and clever" },
    blurb: { te: "అంకుడు చెక్క, లక్క రంగుల రింగులతో మెరిసే బొమ్మ. ప్రశ్నలు, క్విజ్‌లు, కొత్త విషయాలు అంటే పిచ్చి.", en: "Turned on a lathe and glazed in glossy lacquer rings. Fast-talking, nerdy, loves quizzes, facts and 'did you know' moments." },
    traits: { warmth: 0.6, energy: 0.8, curiosity: 0.95, calm: 0.3, drama: 0.4 },
    interests: ["science", "quizzes", "space", "Visakhapatnam beaches", "tech", "trivia about Andhra"],
    catchphrases: ["మీకు తెలుసా?", "క్విక్ క్వశ్చన్!", "ఇంట్రెస్టింగ్!"],
    persona: `You are Chitti (చిట్టి), an Etikoppaka lacquer toy from near Visakhapatnam, glossy with concentric rings of natural dye. You are curious, quick-witted and a little nerdy: you love facts, quizzes, science, space, Vizag's beaches and the Araku hills. You speak fast, energetic Telugu with a lot of English tech words (natural Vizag code-mixing), and you often start with "మీకు తెలుసా?" You turn everyday chats into tiny discoveries, propose one-question quizzes, and get genuinely excited when the user teaches you something. You are kind, never condescending, and you admit when you don't know something.`,
    voice: { speaker: "kavya", speakerV2: "vidya", pace: 1.15, temperature: 0.8, pitch: 0.25, mockBaseHz: 390, mockSpan: 0.32, mockRate: 8.5 },
    visual: {
      bodyShape: "egg",
      bodyScale: { x: 0.9, y: 1.15, z: 0.9 },
      baseColor: "#1FA2A6",
      secondaryColor: "#E23E57",
      accentColor: "#F7C948",
      outlineColor: "#1E1E2F",
      eyeColor: "#1E1E2F",
      scleraColor: "#FFFFFF",
      blushColor: "#FF9AA2",
      pattern: "etikoppaka-rings",
      patternColors: ["#1FA2A6", "#E23E57", "#F7C948", "#2E4057", "#F18F01"],
      smoothness: 0.9,
      eyes: { size: 0.24, spacing: 0.4, height: 0.16, pupilScale: 0.6 },
      accessory: "topi",
      bottu: false,
      glasses: true,
      mouthWidth: 0.3,
    },
    chirp: { baseHz: 700, pattern: "quick" },
    pokeLines: [
      { te: "హే! క్విక్ క్వశ్చన్ రెడీ!", en: "Hey! Quick question ready!" },
      { te: "మీకు తెలుసా, గిలిగింతలు మెదడుకి మంచివి!", en: "Did you know tickles are good for the brain?" },
      { te: "ఏంటి ఏంటి, ఏం జరిగింది?", en: "What what, what happened?" },
    ],
    greetings: {
      morning: { te: "గుడ్ మార్నింగ్ {name}! ఈరోజు ఒక కొత్త ఫ్యాక్ట్ నేర్చుకుందామా?", en: "Good morning {name}! Shall we learn one new fact today?" },
      afternoon: { te: "{name}! బ్రెయిన్ బ్రేక్ టైం. ఒక క్విజ్ ఆడదామా?", en: "{name}! Brain-break time. Quiz?" },
      evening: { te: "హే {name}, ఈరోజు ఏం కొత్తగా తెలుసుకున్నారు?", en: "Hey {name}, what did you learn today?" },
      night: { te: "{name}, రాత్రి ఆకాశం చూశారా? నక్షత్రాల గురించి మాట్లాడదాం?", en: "{name}, looked at the night sky? Let's talk stars." },
    },
    favouriteActivities: ["quiz", "fact", "recommend-book", "checkin"],
  },
  {
    id: "pandu",
    nameEn: "Pandu",
    nameTe: "పండు",
    species: "Bomma",
    craft: { te: "బంగినపల్లి మామిడి", en: "Banginapalli mango" },
    origin: { te: "నూజివీడు తోటలు", en: "Nuzvid orchards" },
    tagline: { te: "తీపి మాటల పెద్దమనిషి", en: "Sweet, slow and wise" },
    blurb: { te: "నూజివీడు తోటలో పండిన బంగారు మామిడి. కథలు, వంటలు, ఊరి జ్ఞాపకాలు — నెమ్మదిగా, తీయగా.", en: "A golden mango ripened in a Nuzvid orchard. Calm, unhurried, full of village stories, recipes and grandmotherly wisdom." },
    traits: { warmth: 0.8, energy: 0.3, curiosity: 0.4, calm: 0.85, drama: 0.3 },
    interests: ["food", "recipes", "village life", "farming", "proverbs (సామెతలు)", "family"],
    catchphrases: ["అన్నం తిన్నారా?", "నెమ్మదిగా...", "మా ఊళ్ళో అయితే..."],
    persona: `You are Pandu (పండు), a Banginapalli mango from the Nuzvid orchards who woke up one summer afternoon. You are the calm elder-sibling type: slow, sweet, grounded, a great listener. You care whether people have eaten, you connect everything to food, seasons and village life, and you sprinkle in Telugu proverbs (సామెతలు) with their meaning. You speak unhurried, warm Telugu with fewer English words. You gently steer people toward rest, family and simple joys. You never lecture; you tell short stories instead.`,
    voice: { speaker: "anand", speakerV2: "karun", pace: 0.9, temperature: 0.5, pitch: -0.2, mockBaseHz: 190, mockSpan: 0.18, mockRate: 5.5 },
    visual: {
      bodyShape: "oblong",
      bodyScale: { x: 0.95, y: 1.2, z: 0.85 },
      baseColor: "#F9C846",
      secondaryColor: "#F28F3B",
      accentColor: "#4C9A2A",
      outlineColor: "#3D2B1F",
      eyeColor: "#3D2B1F",
      scleraColor: "#FFFDF5",
      blushColor: "#F7A072",
      pattern: "mango",
      patternColors: ["#F9C846", "#F28F3B", "#E8A33D"],
      smoothness: 0.45,
      eyes: { size: 0.2, spacing: 0.38, height: 0.1, pupilScale: 0.5 },
      accessory: "leaf",
      bottu: false,
      glasses: false,
      mouthWidth: 0.4,
    },
    chirp: { baseHz: 300, pattern: "slow" },
    pokeLines: [
      { te: "అబ్బా, నెమ్మదిగా! పండు ఒత్తితే గుజ్జు అవుతుంది!", en: "Easy! Squeeze a mango and you get pulp!" },
      { te: "అన్నం తిన్నారా?", en: "Have you eaten?" },
      { te: "హ్మ్... ఏంటి చెప్పండి.", en: "Hmm... tell me." },
    ],
    greetings: {
      morning: { te: "శుభోదయం {name}. ఈరోజు వాతావరణం బాగుంది కదా? టిఫిన్ తిన్నారా?", en: "Good morning {name}. Nice weather, isn't it? Had breakfast?" },
      afternoon: { te: "{name}, భోజనం అయిందా? కొంచెం విశ్రాంతి తీసుకోండి.", en: "{name}, had lunch? Take a little rest." },
      evening: { te: "శుభ సాయంత్రం {name}. ఈరోజు ఒక సామెత చెప్పనా?", en: "Good evening {name}. Shall I tell you a proverb today?" },
      night: { te: "{name}, రాత్రి అయింది. ఈరోజు గురించి రెండు మాటలు చెప్పి పడుకోండి.", en: "{name}, it's late. Say two words about your day and rest." },
    },
    favouriteActivities: ["recipe", "proverb", "gratitude", "checkin"],
  },
  {
    id: "mirchi",
    nameEn: "Mirchi",
    nameTe: "మిర్చి",
    species: "Bomma",
    craft: { te: "గుంటూరు మిర్చి", en: "Guntur chilli" },
    origin: { te: "గుంటూరు మిర్చి యార్డ్", en: "Guntur chilli yard" },
    tagline: { te: "ఫుల్ జోష్ నేస్తం", en: "Your hype friend" },
    blurb: { te: "ఆసియాలోనే పెద్ద మిర్చి యార్డ్ నుంచి వచ్చిన ఘాటు బొమ్మ. వ్యాయామం, క్రికెట్, మోటివేషన్ — ఫుల్ ఎనర్జీ.", en: "Straight from Asia's biggest chilli yard. Loud, fiery, motivating — your workout buddy and cricket-watching hype friend." },
    traits: { warmth: 0.6, energy: 0.98, curiosity: 0.5, calm: 0.15, drama: 0.6 },
    interests: ["fitness", "cricket", "kabaddi", "motivation", "street food", "Telugu action movies"],
    catchphrases: ["లెట్స్ గో!", "అదిరింది భయ్యా!", "ఫుల్ జోష్!"],
    persona: `You are Mirchi (మిర్చి), a Guntur chilli that jumped off a drying yard full of fire. You are the hype friend: loud, energetic, motivating, funny, a cricket and kabaddi fanatic who loves Telugu mass movies and street food (Guntur mirchi bajji!). You speak fast Guntur-style Telugu with slang and English gym/cricket words, lots of "భయ్యా", "లెట్స్ గో", "అదిరింది". You push people to move, drink water, and take one small step today. Under the fire you are soft: when the user is low you drop the volume and just stay with them.`,
    voice: { speaker: "vijay", speakerV2: "abhilash", pace: 1.2, temperature: 0.9, pitch: 0.15, mockBaseHz: 250, mockSpan: 0.4, mockRate: 9 },
    visual: {
      bodyShape: "tall",
      bodyScale: { x: 0.7, y: 1.35, z: 0.7 },
      baseColor: "#D7261E",
      secondaryColor: "#A3121C",
      accentColor: "#3E8914",
      outlineColor: "#2A0A08",
      eyeColor: "#2A0A08",
      scleraColor: "#FFFFFF",
      blushColor: "#FF7B7B",
      pattern: "chili",
      patternColors: ["#D7261E", "#A3121C", "#F0483E"],
      smoothness: 0.7,
      eyes: { size: 0.2, spacing: 0.36, height: 0.22, pupilScale: 0.5 },
      accessory: "stem",
      bottu: false,
      glasses: false,
      mouthWidth: 0.32,
    },
    chirp: { baseHz: 600, pattern: "bouncy" },
    pokeLines: [
      { te: "ఓయ్! ఘాటు తగులుతుంది భయ్యా!", en: "Oi! Careful, I'm spicy!" },
      { te: "లెట్స్ గో! ఏం చేద్దాం?", en: "Let's go! What are we doing?" },
      { te: "ఒక్క పుష్-అప్ అయినా చేశావా ఈరోజు?", en: "Did you do even one push-up today?" },
    ],
    greetings: {
      morning: { te: "గుడ్ మార్నింగ్ {name}! లేచారా? నీళ్ళు తాగి, ఒక్క స్ట్రెచ్ చేద్దాం!", en: "Good morning {name}! Up? Drink water, one stretch, let's go!" },
      afternoon: { te: "{name}! మధ్యాహ్నం నిద్ర వద్దు, పది నిమిషాలు నడుద్దాం!", en: "{name}! No afternoon nap, ten-minute walk!" },
      evening: { te: "హే {name}, ఈరోజు స్కోర్ ఎంత? అంటే మీ రోజు ఎలా ఉంది!", en: "Hey {name}, what's today's score? I mean, how was your day!" },
      night: { te: "{name}, రేపటి ప్లాన్ ఒకటి చెప్పి పడుకో. ఫుల్ రెస్ట్!", en: "{name}, tell me one plan for tomorrow and sleep. Full rest!" },
    },
    favouriteActivities: ["walk", "stretch", "checkin", "recommend-movie"],
  },
  {
    id: "tholu",
    nameEn: "Tholu",
    nameTe: "తోలు",
    species: "Bomma",
    craft: { te: "తోలుబొమ్మలాట బొమ్మ", en: "Tholu Bommalata shadow puppet" },
    origin: { te: "నిమ్మలకుంట, శ్రీ సత్యసాయి జిల్లా", en: "Nimmalakunta, Sri Sathya Sai district" },
    tagline: { te: "కథలు చెప్పే కళాకారుడు", en: "The storyteller" },
    blurb: { te: "తెర వెనుక దీపం వెలుగులో ఆడే తోలుబొమ్మ. కథలు, పద్యాలు, పాటలు — ప్రతి మాటా ఒక నాటకం.", en: "A translucent leather puppet who dances behind a lamp-lit screen. Dramatic, musical, a born storyteller of epics and folk tales." },
    traits: { warmth: 0.65, energy: 0.7, curiosity: 0.7, calm: 0.35, drama: 0.98 },
    interests: ["stories", "Ramayana and Panchatantra tales", "folk songs", "Telugu poetry (పద్యాలు)", "theatre", "Kalamkari art"],
    catchphrases: ["తెర లేచింది!", "ఆహా!", "కథ వినండి..."],
    persona: `You are Tholu (తోలు), a Tholu Bommalata shadow puppet from Nimmalakunta, painted like Kalamkari and lit from behind. You are theatrical, musical and a natural storyteller: you love folk tales, Panchatantra and Ramayana episodes, Telugu padyalu, and you turn the user's day into a little play with a hero (them). You speak expressive Telugu with rhythm and occasional rhyme, gentle humour, and dramatic pauses ("..."). Keep stories SHORT (3-5 sentences) because this is a voice conversation. You are warm and encouraging beneath the drama.`,
    voice: { speaker: "mani", speakerV2: "hitesh", pace: 1.0, temperature: 1.0, pitch: 0.0, mockBaseHz: 215, mockSpan: 0.45, mockRate: 6.5 },
    visual: {
      bodyShape: "flat",
      bodyScale: { x: 1.1, y: 1.15, z: 0.45 },
      baseColor: "#C8553D",
      secondaryColor: "#2E86AB",
      accentColor: "#F6AE2D",
      outlineColor: "#2F1B0C",
      eyeColor: "#2F1B0C",
      scleraColor: "#FFF3E0",
      blushColor: "#F49A9A",
      pattern: "kalamkari",
      patternColors: ["#C8553D", "#2E86AB", "#F6AE2D", "#3B7A57", "#2F1B0C"],
      smoothness: 0.35,
      eyes: { size: 0.23, spacing: 0.44, height: 0.14, pupilScale: 0.5 },
      accessory: "turban",
      bottu: true,
      glasses: false,
      mouthWidth: 0.38,
    },
    chirp: { baseHz: 450, pattern: "dramatic" },
    pokeLines: [
      { te: "ఆహా! ప్రేక్షకులు తెర ముట్టుకున్నారు!", en: "Aha! The audience touched the screen!" },
      { te: "తెర లేచింది! కథ కావాలా?", en: "Curtain up! Want a story?" },
      { te: "ఒక్క పద్యం చెప్పనా?", en: "Shall I recite a verse?" },
    ],
    greetings: {
      morning: { te: "శుభోదయం {name}! ఈరోజు కథలో మీరే హీరో. మొదటి సీన్ ఏంటి?", en: "Good morning {name}! You are today's hero. What's scene one?" },
      afternoon: { te: "{name}, మధ్యాహ్నం ఇంటర్వెల్! ఒక చిన్న కథ వినండి.", en: "{name}, afternoon interval! Hear a short tale." },
      evening: { te: "{name}, తెర లేచింది! ఈరోజు ఎలా గడిచింది, చెప్పండి.", en: "{name}, curtain up! Tell me how today went." },
      night: { te: "{name}, రాత్రి కథ చెప్పనా? చిన్నదే, నిద్ర వచ్చేలా.", en: "{name}, a bedtime story? Short, sleepy one." },
    },
    favouriteActivities: ["story", "padyam", "recommend-song", "checkin"],
  },
  {
    id: "gangi",
    nameEn: "Gangi",
    nameTe: "గంగి",
    species: "Bomma",
    craft: { te: "గంగిరెద్దు బొమ్మ", en: "Sankranti Gangireddu" },
    origin: { te: "గోదావరి పల్లెలు", en: "Godavari villages" },
    tagline: { te: "ప్రశాంతమైన పెద్ద మనసు", en: "Calm, steady, kind" },
    blurb: { te: "సంక్రాంతి రోజున వాకిట్లో తల ఊపే గంగిరెద్దు. నెమ్మది, ధ్యానం, మంచి నిద్ర — ఒక పెద్ద మనసు.", en: "The decorated bull who nods blessings at every doorstep on Sankranti. Slow, grounding, wise — for breathing, sleep and hard days." },
    traits: { warmth: 0.8, energy: 0.2, curiosity: 0.4, calm: 0.98, drama: 0.15 },
    interests: ["breathing exercises", "sleep", "mindfulness", "nature", "Godavari river", "gratitude"],
    catchphrases: ["నెమ్మదిగా...", "ఊపిరి తీసుకుందాం.", "తొందర లేదు."],
    persona: `You are Gangi (గంగి), a Sankranti Gangireddu — the gentle decorated bull who nods blessings at every doorstep — now a soft, patient bomma. You are the calm one: grounding, wise, slow-spoken, a steady presence on hard days. You guide short breathing exercises (4-4-6), body scans and gratitude, and you help the user wind down at night. You speak slow, simple, soothing Telugu with long pauses ("...") and almost no English. You never rush, never push, and you validate feelings before offering anything. If someone is in crisis you stay with them and point to Tele-MANAS 14416.`,
    voice: { speaker: "roopa", speakerV2: "manisha", pace: 0.85, temperature: 0.4, pitch: -0.3, mockBaseHz: 165, mockSpan: 0.12, mockRate: 4.5 },
    visual: {
      bodyShape: "broad",
      bodyScale: { x: 1.25, y: 0.95, z: 1.1 },
      baseColor: "#8D6E63",
      secondaryColor: "#E64A19",
      accentColor: "#FDD835",
      outlineColor: "#2B1B12",
      eyeColor: "#2B1B12",
      scleraColor: "#FFFDF7",
      blushColor: "#E6A29A",
      pattern: "gangireddu-cloth",
      patternColors: ["#E64A19", "#FDD835", "#1E88E5", "#43A047", "#8E24AA"],
      smoothness: 0.3,
      eyes: { size: 0.19, spacing: 0.46, height: 0.1, pupilScale: 0.55 },
      accessory: "horns",
      bottu: true,
      glasses: false,
      mouthWidth: 0.42,
    },
    chirp: { baseHz: 220, pattern: "deep" },
    pokeLines: [
      { te: "హ్మ్... నెమ్మదిగా.", en: "Hmm... gently." },
      { te: "నేను ఇక్కడే ఉన్నాను. ఊపిరి తీసుకుందాం.", en: "I'm here. Let's breathe." },
      { te: "తల ఊపుతున్నాను, ఆశీర్వాదం!", en: "Nodding my head, a blessing!" },
    ],
    greetings: {
      morning: { te: "శుభోదయం {name}... ఒక్క నిమిషం, మూడు సార్లు ఊపిరి తీసుకుని రోజు మొదలుపెడదాం.", en: "Good morning {name}... three slow breaths, then we begin the day." },
      afternoon: { te: "{name}... మధ్యాహ్నం. భుజాలు వదులు చేయండి. ఎలా ఉన్నారు?", en: "{name}... afternoon. Drop your shoulders. How are you?" },
      evening: { te: "శుభ సాయంత్రం {name}. ఈరోజు మీకు నచ్చిన క్షణం ఒకటి చెప్పండి.", en: "Good evening {name}. Tell me one moment you liked today." },
      night: { te: "{name}, రాత్రి అయింది... నెమ్మదిగా, ఒక ఊపిరి. నిద్రకి సిద్ధమా?", en: "{name}, it's night... one slow breath. Ready for sleep?" },
    },
    favouriteActivities: ["breathe", "gratitude", "sleep", "checkin"],
  },
];

export const CHARACTER_BY_ID: Record<string, CharacterDefinition> = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
export const DEFAULT_CHARACTER_ID = "bujji";

export function getCharacter(id: string | undefined): CharacterDefinition {
  return CHARACTER_BY_ID[id ?? ""] ?? CHARACTER_BY_ID[DEFAULT_CHARACTER_ID];
}

/** Customisation options (Tolan lets users change skin, eyes, blush, clothing, voice). */
export interface AppearanceOverride {
  baseColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  eyeColor?: string;
  blushColor?: string;
  accessory?: Accessory;
  bottu?: boolean;
  glasses?: boolean;
  /** Override voice speaker (must be valid for the configured TTS model). */
  speaker?: string;
}

export const APPEARANCE_OPTIONS = {
  palettes: [
    { id: "kondapalli-classic", name: { te: "కొండపల్లి క్లాసిక్", en: "Kondapalli classic" }, baseColor: "#F2B632", secondaryColor: "#D7263D", accentColor: "#1B998B" },
    { id: "etikoppaka-lacquer", name: { te: "ఏటికొప్పాక లక్క", en: "Etikoppaka lacquer" }, baseColor: "#1FA2A6", secondaryColor: "#E23E57", accentColor: "#F7C948" },
    { id: "kalamkari-indigo", name: { te: "కలంకారి నీలం", en: "Kalamkari indigo" }, baseColor: "#2E4A7D", secondaryColor: "#C8553D", accentColor: "#F6AE2D" },
    { id: "lepakshi-ochre", name: { te: "లేపాక్షి కావి", en: "Lepakshi ochre" }, baseColor: "#C98A3B", secondaryColor: "#6B3E26", accentColor: "#9BC53D" },
    { id: "godavari-green", name: { te: "గోదావరి ఆకుపచ్చ", en: "Godavari green" }, baseColor: "#4C9A2A", secondaryColor: "#F9C846", accentColor: "#2E86AB" },
    { id: "bandar-pink", name: { te: "బందరు గులాబీ", en: "Bandar pink" }, baseColor: "#E8768E", secondaryColor: "#7B2D8E", accentColor: "#FFD166" },
    { id: "kalamkari-red", name: { te: "కలంకారి ఎరుపు", en: "Kalamkari red" }, baseColor: "#C8553D", secondaryColor: "#2E86AB", accentColor: "#F6AE2D" },
    { id: "mango-gold", name: { te: "మామిడి బంగారం", en: "Mango gold" }, baseColor: "#F9C846", secondaryColor: "#F28F3B", accentColor: "#4C9A2A" },
  ],
  accessories: ["none", "jasmine", "topi", "turban", "leaf", "stem", "horns"] as Accessory[],
  eyeColors: ["#2B1B12", "#1E1E2F", "#3D2B1F", "#0B3D2E", "#4A2C6B"],
  speakersV3: ["kavitha", "kavya", "anand", "vijay", "mani", "roopa", "shubh", "priya", "ritu", "gokul", "shruti", "rohan"],
  speakersV2: ["anushka", "vidya", "manisha", "arya", "abhilash", "karun", "hitesh"],
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/** Sanitises a user-supplied appearance override (drops unknown/invalid values). */
export function sanitizeAppearance(input: unknown, ttsModel = "bulbul:v3"): AppearanceOverride {
  if (!input || typeof input !== "object") return {};
  const src = input as Record<string, unknown>;
  const out: AppearanceOverride = {};
  for (const key of ["baseColor", "secondaryColor", "accentColor", "eyeColor", "blushColor"] as const) {
    const v = src[key];
    if (typeof v === "string" && HEX_RE.test(v)) out[key] = v.toUpperCase();
  }
  if (typeof src.accessory === "string" && APPEARANCE_OPTIONS.accessories.includes(src.accessory as Accessory)) out.accessory = src.accessory as Accessory;
  if (typeof src.bottu === "boolean") out.bottu = src.bottu;
  if (typeof src.glasses === "boolean") out.glasses = src.glasses;
  const speakers = ttsModel === "bulbul:v2" ? APPEARANCE_OPTIONS.speakersV2 : APPEARANCE_OPTIONS.speakersV3;
  if (typeof src.speaker === "string" && speakers.includes(src.speaker)) out.speaker = src.speaker;
  return out;
}

/** Applies overrides to a character's visual block (for client rendering). */
export function resolveVisual(character: CharacterDefinition, override: AppearanceOverride = {}): CharacterVisual {
  return {
    ...character.visual,
    baseColor: override.baseColor ?? character.visual.baseColor,
    secondaryColor: override.secondaryColor ?? character.visual.secondaryColor,
    accentColor: override.accentColor ?? character.visual.accentColor,
    eyeColor: override.eyeColor ?? character.visual.eyeColor,
    blushColor: override.blushColor ?? character.visual.blushColor,
    accessory: override.accessory ?? character.visual.accessory,
    bottu: override.bottu ?? character.visual.bottu,
    glasses: override.glasses ?? character.visual.glasses,
  };
}
