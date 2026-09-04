/** Provider abstraction over Sarvam AI (real) and the offline mock. */

export interface SttOptions {
  mimeType?: string;
  /** BCP-47 like "te-IN" or "unknown" for auto-detect. */
  languageCode?: string;
  /** saaras:v3 modes. `codemix` keeps English words in Latin script inside Telugu text. */
  mode?: "transcribe" | "translate" | "verbatim" | "translit" | "codemix";
}

export interface SttResult {
  transcript: string;
  languageCode: string;
  languageProbability?: number;
  /** Duration of the input audio in ms (for budgeting). */
  audioDurationMs: number;
}

export interface TtsOptions {
  languageCode: string;
  speaker: string;
  model?: string;
  pace?: number;
  /** bulbul:v3 expressiveness 0.01–2.0 */
  temperature?: number;
  /** bulbul:v2 only */
  pitch?: number;
  /** bulbul:v2 only */
  loudness?: number;
  sampleRate?: number;
  /** Mock synthesis hint: fundamental frequency of the voice. */
  mockBaseHz?: number;
  mockSpan?: number;
  mockRate?: number;
}

export interface TtsResult {
  wav: Buffer;
  sampleRate: number;
  durationMs: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface JsonSchemaSpec {
  name: string;
  schema: Record<string, unknown>;
}

export interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: "low" | "medium" | "high";
  /** Ask for structured output (Sarvam supports response_format json_schema). */
  jsonSchema?: JsonSchemaSpec;
  model?: string;
}

export interface ChatResult {
  content: string;
  usage?: { promptTokens: number; completionTokens: number };
  model?: string;
}

export interface TranslateOptions {
  mode?: "formal" | "modern-colloquial" | "classic-colloquial" | "code-mixed";
  speakerGender?: "Male" | "Female";
  model?: string;
}

export interface AiProvider {
  readonly name: "sarvam" | "mock";
  transcribe(audio: Buffer, opts?: SttOptions): Promise<SttResult>;
  synthesize(text: string, opts: TtsOptions): Promise<TtsResult>;
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<ChatResult>;
  translate(text: string, from: string, to: string, opts?: TranslateOptions): Promise<string>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown,
    public readonly endpoint?: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
