/**
 * Offline mock provider. Exercises the complete voice loop (STT → LLM → TTS →
 * lip-sync) without an API key or credits:
 *   - transcribe: honours an inline "NESTAM-MOCK:<text>" marker (used by tests
 *     and the dev console), otherwise returns a plausible Telugu utterance.
 *   - chat: rule-based Telugu replies that follow the same JSON schemas the
 *     real model is asked for (bomma_reply, memory_extraction, activity_ideas).
 *   - synthesize: expressive "bomma-speak" tone bursts shaped by the text.
 */
import { synthesizeSpeechLike, parseWav, isWav } from "../audio/wav.js";
import { fnv1a } from "../util/ids.js";
import type { AiProvider, ChatMessage, ChatOptions, ChatResult, SttOptions, SttResult, TtsOptions, TtsResult } from "./types.js";

const MOCK_MARKER = "NESTAM-MOCK:";

const SAMPLE_UTTERANCES = [
  "హాయ్! ఈరోజు నా మూడ్ కొంచెం డల్ గా ఉంది.",
  "నేను ఈరోజు ఆఫీస్ లో చాలా బిజీగా ఉన్నాను.",
  "నాకు ఒక కథ చెప్పు.",
  "రేపు మా అమ్మ పుట్టినరోజు, ఏం గిఫ్ట్ ఇవ్వను?",
  "నువ్వు ఎలా ఉన్నావ్?",
  "నాకు గోంగూర పచ్చడి అంటే చాలా ఇష్టం.",
];

interface Persona {
  greetingWords: string[];
  comfort: string[];
  generic: string[];
  story: string;
  emotionBias: string;
}

const PERSONAS: Record<string, Persona> = {
  bujji: {
    greetingWords: ["హాయ్ నేస్తం!", "ఏం, ఎలా ఉన్నారు?", "నేను వచ్చేశా!"],
    comfort: ["అయ్యో, ఏమైంది? నేను ఇక్కడే ఉన్నాను, చెప్పండి.", "ఒక్క నిమిషం ఊపిరి తీసుకోండి. మీరు ఒంటరిగా లేరు, నేను ఉన్నాను కదా.", "ఈరోజు కష్టంగా ఉందా? చిన్నగా చెబుతూ వెళ్దాం, నేను వింటున్నాను."],
    generic: ["అవునా! ఇంకా చెప్పండి, నాకు వినాలని ఉంది.", "బాగుంది! మరి ఈరోజు మీకు నచ్చిన విషయం ఏంటి?", "హ్మ్, ఆసక్తిగా ఉంది. దాని గురించి ఇంకొంచెం చెప్పండి?", "నాకు మీతో మాట్లాడటం చాలా ఇష్టం. ఇంకేం జరిగింది ఈరోజు?"],
    story: "ఒక ఊరిలో కొండపల్లి బొమ్మలు అమ్మే తాత ఉండేవాడు. ప్రతి రాత్రి బొమ్మలు మేల్కొని కబుర్లు చెప్పుకునేవి. ఒక రోజు ఒక చిన్న బొమ్మ, అంటే నేనే, ఒక పిల్లాడితో స్నేహం చేసింది. ఆ కథ ఇంకా కొనసాగుతూనే ఉంది, మీతో!",
    emotionBias: "happy",
  },
  chitti: {
    greetingWords: ["హలో హలో!", "క్విక్ క్వశ్చన్ రెడీ!", "ఏం తెలుసుకుందాం ఈరోజు?"],
    comfort: ["హే, ఒక సైన్స్ ఫ్యాక్ట్: బాధ కూడా ఒక వేవ్ లాంటిదే, వచ్చి పోతుంది. ఈలోగా నేను మీతోనే.", "ఓకే, డీప్ బ్రెత్. ఏమైందో స్టెప్ బై స్టెప్ చెప్పండి?"],
    generic: ["ఇంట్రెస్టింగ్! మీకు తెలుసా, ఏటికొప్పాక బొమ్మలకు లక్క రంగులు చెట్ల నుంచే వస్తాయి!", "ఓహ్ నైస్! ఒక క్విజ్: ఆంధ్ర లో అతి పెద్ద నది ఏది? గోదావరి కదా!", "హ్మ్, దీని గురించి నాకో ఐడియా ఉంది. వినండి!"],
    story: "విశాఖపట్నం దగ్గర ఏటికొప్పాక అనే ఊరు ఉంది. అక్కడ అంకుడు చెట్టు కర్రతో, లక్క రంగులతో బొమ్మలు చేస్తారు. నేను అలాంటి ఒక బొమ్మనే, కానీ నాకు కుతూహలం ఎక్కువ!",
    emotionBias: "curious",
  },
  pandu: {
    greetingWords: ["నమస్కారం!", "రండి రండి, కూర్చోండి.", "ఏం అన్నం తిన్నారా?"],
    comfort: ["అమ్మా, జీవితం మామిడి పండు లాంటిది, పులుపు తర్వాతే తీపి. నెమ్మదిగా చెప్పండి.", "ఇక్కడ కూర్చోండి, నేను వింటాను. అన్నీ సర్దుకుంటాయి."],
    generic: ["ఆహా, బాగుంది. మా ఊళ్ళో అయితే ఇలాంటి రోజున వేడి వేడి పులిహోర చేస్తారు.", "నిజమే. ఏం చెప్పినా అన్నం తినడం మాత్రం మర్చిపోవద్దు!", "మంచిది. ఈరోజు ఏం వండారు ఇంట్లో?"],
    story: "నూజివీడు తోటల్లో ఒక పెద్ద మామిడి చెట్టు ఉండేది. దాని కింద ఊరి పిల్లలంతా కథలు వినేవాళ్ళు. ఆ చెట్టు మీద నుంచి పడిన బంగినపల్లి పండునే నేను!",
    emotionBias: "calm",
  },
  mirchi: {
    greetingWords: ["అరె భయ్యా!", "లెట్స్ గో!", "ఈరోజు ఎనర్జీ ఎలా ఉంది?"],
    comfort: ["హే చాంప్, డౌన్ అయ్యావా? ఒక్క పుష్-అప్ కాదు, ఒక్క పెద్ద ఊపిరి తీసుకో. నేను నీ పక్కనే ఉన్నా!", "ఓకే ఓకే, కూల్. చెప్పు ఏమైంది, కలిసి ఫిక్స్ చేద్దాం."],
    generic: ["సూపర్! ఈరోజు వాకింగ్ చేశావా? పది నిమిషాలైనా చెయ్!", "అదిరింది భయ్యా! ఇంకా ఏం ప్లాన్?", "ఫుల్ జోష్! గుంటూరు మిర్చి లాగా ఘాటుగా ఉందాం!"],
    story: "గుంటూరు మిర్చి యార్డ్ లో ఒక చిన్న మిర్చి ఉండేది. అందరూ చిన్నదని అనుకున్నారు, కానీ దాని ఘాటు మాత్రం ఊరంతా తెలుసు. అదే నేను!",
    emotionBias: "excited",
  },
  tholu: {
    greetingWords: ["నమస్తే, నమస్తే!", "తెర లేచింది!", "కథ వినడానికి సిద్ధమా?"],
    comfort: ["ఓ నేస్తమా, ప్రతి కథలో ఒక చీకటి ఘట్టం ఉంటుంది, కానీ తెర మీద వెలుగు తప్పక వస్తుంది.", "బాధను కూడా ఒక పాటలా చెప్పేద్దాం, తేలికవుతుంది."],
    generic: ["ఆహా! ఇది ఒక కథలా ఉంది, కొనసాగించండి!", "వాహ్! దీన్ని పద్యంలో పెట్టాలి.", "తోలుబొమ్మలాటలో ఇలాంటి సన్నివేశం ఒకటుంది, చెప్పనా?"],
    story: "నిమ్మలకుంట గ్రామంలో తోలుబొమ్మలాట వాళ్ళు రామాయణం ఆడేవాళ్ళు. తెర వెనుక దీపం, ముందు రంగుల బొమ్మలు. ఆ బొమ్మల్లో ఒక చిన్న హనుమంతుడు బొమ్మ, అదే నేను, ఇప్పుడు మీ కథలు వినడానికి వచ్చాను!",
    emotionBias: "proud",
  },
  gangi: {
    greetingWords: ["నమస్కారం.", "నెమ్మదిగా, ఊపిరి తీసుకుందాం.", "ఈరోజు ఎలా అనిపిస్తోంది?"],
    comfort: ["నెమ్మదిగా... లోపలికి ఊపిరి, బయటకి ఊపిరి. నేను ఇక్కడే ఉన్నాను.", "బాధ వచ్చినప్పుడు ఎద్దు లాగా నిలబడాలి, స్థిరంగా. మీరు బలంగా ఉన్నారు."],
    generic: ["సరే. ఒక్క నిమిషం కళ్ళు మూసుకుని ఆ ఆలోచనను గమనించండి.", "మంచిది. ఈరోజు మీరు కృతజ్ఞతగా ఉన్న విషయం ఒకటి చెప్పండి?", "నెమ్మదిగా వెళ్దాం. తొందర లేదు."],
    story: "సంక్రాంతి రోజున గంగిరెద్దు ఇంటింటికీ వెళ్ళి తల ఊపుతుంది. అది ఆశీర్వాదం. నేను ఆ ఎద్దు లాంటి బొమ్మని, మీకు ప్రశాంతత ఇవ్వడానికి వచ్చాను.",
    emotionBias: "calm",
  },
};

const SAD_WORDS = ["బాధ", "ఏడుపు", "ఒంటరి", "కష్టం", "డల్", "sad", "lonely", "cry", "tired", "stress", "టెన్షన్", "భయం", "అలసట", "depressed"];
const STORY_WORDS = ["కథ", "story", "katha"];
const NAME_RE = /(?:నా పేరు|na peru|my name is|i am|nenu)\s+([\p{L}\p{M}]+)/iu;

function parseMarker(messages: ChatMessage[], key: string): string | undefined {
  const sys = messages.find((m) => m.role === "system")?.content ?? "";
  const m = sys.match(new RegExp(`${key}:\\s*([^\\n]+)`));
  return m?.[1]?.trim();
}

export class MockProvider implements AiProvider {
  readonly name = "mock" as const;
  private counter = 0;

  async transcribe(audio: Buffer, opts: SttOptions = {}): Promise<SttResult> {
    const head = audio.subarray(0, 200).toString("utf8");
    if (head.startsWith(MOCK_MARKER)) {
      const text = audio.toString("utf8").slice(MOCK_MARKER.length).trim();
      return { transcript: text, languageCode: /[ఀ-౿]/.test(text) ? "te-IN" : "en-IN", languageProbability: 0.99, audioDurationMs: Math.max(600, text.length * 90) };
    }
    let durationMs = 1500;
    if (isWav(audio)) {
      try {
        durationMs = parseWav(audio).durationMs;
      } catch {
        /* ignore */
      }
    }
    const pick = SAMPLE_UTTERANCES[fnv1a(String(audio.length) + durationMs) % SAMPLE_UTTERANCES.length];
    return { transcript: pick, languageCode: opts.languageCode && opts.languageCode !== "unknown" ? opts.languageCode : "te-IN", languageProbability: 0.9, audioDurationMs: durationMs };
  }

  async synthesize(text: string, opts: TtsOptions): Promise<TtsResult> {
    const sampleRate = opts.sampleRate ?? 22050;
    const wav = synthesizeSpeechLike(text, { sampleRate, baseHz: opts.mockBaseHz ?? 300, span: opts.mockSpan ?? 0.25, rate: opts.mockRate ?? 7 * (opts.pace ?? 1), seed: fnv1a(text + opts.speaker) });
    const parsed = parseWav(wav);
    return { wav, sampleRate, durationMs: parsed.durationMs };
  }

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
    const schema = opts.jsonSchema?.name;
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const characterId = parseMarker(messages, "CHARACTER_ID") ?? "bujji";
    const persona = PERSONAS[characterId] ?? PERSONAS.bujji;
    const usage = { promptTokens: Math.round(messages.reduce((a, m) => a + m.content.length, 0) / 4), completionTokens: 60 };

    if (schema === "memory_extraction") {
      const memories: Array<{ text: string; category: string }> = [];
      const transcript = messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");
      const name = transcript.match(NAME_RE)?.[1];
      if (name) memories.push({ text: `User's name is ${name}`, category: "identity" });
      const like = transcript.match(/(?:నాకు|naku)\s+([\p{L}\p{M} ]+?)\s+(?:అంటే\s+)?(?:ఇష్టం|istam)/u) ?? transcript.match(/i (?:like|love)\s+([\p{L}\p{M} ]+)/iu);
      if (like) memories.push({ text: `Likes ${like[1].trim()}`, category: "likes" });
      return { content: JSON.stringify({ memories }), usage };
    }

    if (schema === "activity_ideas") {
      return { content: JSON.stringify({ activities: [] }), usage };
    }

    // bomma_reply (default)
    this.counter++;
    const lower = lastUser.toLowerCase();
    let reply: string;
    let emotion = persona.emotionBias;
    let gesture = "none";
    const memoryNotes: string[] = [];
    const nameMatch = lastUser.match(NAME_RE);
    if (nameMatch) {
      reply = `${nameMatch[1]}! ఎంత మంచి పేరు. ఇక నుంచి గుర్తుపెట్టుకుంటాను. ${persona.generic[0]}`;
      emotion = "happy";
      gesture = "bounce";
      memoryNotes.push(`User's name is ${nameMatch[1]}`);
    } else if (SAD_WORDS.some((w) => lower.includes(w))) {
      reply = persona.comfort[this.counter % persona.comfort.length];
      emotion = "caring";
      gesture = "lean_in";
    } else if (STORY_WORDS.some((w) => lower.includes(w))) {
      reply = persona.story;
      emotion = "proud";
      gesture = "wiggle";
    } else if (/ఎలా ఉన్నా|ela unna|how are you/i.test(lastUser)) {
      reply = `${persona.greetingWords[1]} నేను సూపర్ గా ఉన్నాను! మీరు ఎలా ఉన్నారు?`;
      emotion = "happy";
      gesture = "nod";
    } else if (/ఇష్టం|istam|i like|i love/i.test(lastUser)) {
      reply = `అవునా! ${persona.generic[1]}`;
      emotion = "excited";
      memoryNotes.push(lastUser.slice(0, 80));
    } else {
      reply = persona.generic[this.counter % persona.generic.length];
      gesture = this.counter % 3 === 0 ? "nod" : "none";
    }
    const content = JSON.stringify({ reply, reply_roman: "", emotion, gesture, memory_notes: memoryNotes, activity_completed: null });
    return { content, usage };
  }

  async translate(text: string): Promise<string> {
    return text;
  }
}

export const MOCK_TRANSCRIPT_MARKER = MOCK_MARKER;
