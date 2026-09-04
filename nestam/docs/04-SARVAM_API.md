# 04 · Sarvam AI integration (verified against `sarvamai` SDK 1.1.9, Aug 2026)

The public docs site was unreachable from the build sandbox, so every endpoint, field name and
limit below was taken from the official TypeScript SDK's type definitions and compiled client
(`npm i sarvamai@1.1.9`). Base URL `https://api.sarvam.ai`, header `api-subscription-key`.

## Endpoints Nestam uses

### Speech-to-text — `POST /speech-to-text` (multipart)
| field | value |
|---|---|
| `file` | WAV/MP3/AAC/OGG/OPUS/FLAC/M4A/WebM…; 16 kHz works best; REST is for clips < 30 s |
| `model` | `saaras:v3` (default, recommended) or `saaras:v4` |
| `mode` | `transcribe` (used), `translate`, `verbatim`, `translit`, `codemix` |
| `language_code` | `te-IN`, `en-IN`, … or `unknown` (auto-detect, used) |
| `with_timestamps` | `false` |

Response: `{ transcript, language_code, language_probability }`.
`saarika:v2.5` is deprecated — do not use it.

### Text-to-speech — `POST /text-to-speech` (JSON)
| field | value |
|---|---|
| `text` | ≤ 2,500 chars for `bulbul:v3` (≤ 1,500 for v2); code-mixed OK; numbers with commas |
| `language_code` | `te-IN` / `en-IN` (note: `language_code`, not the older `target_language_code`) |
| `speaker` | v3: `shubh`(default) `aditya ritu priya neha rahul pooja rohan simran kavya amit dev ishita shreya ratan varun manan sumit roopa kabir aayan ashutosh advait anand tanya tarun sunny mani gokul vijay shruti suhani mohit kavitha rehan soham rupali`; v2: `anushka manisha vidya arya abhilash karun hitesh` |
| `model` | `bulbul:v3` (used) or `bulbul:v2` |
| `pace` | v3 0.5–2.0 |
| `temperature` | v3 only, 0.01–2.0 (default 0.6) |
| `pitch`, `loudness`, `enable_preprocessing` | v2 only |
| `speech_sample_rate` | 8000/16000/22050/24000 (REST also 32000/44100/48000); Nestam uses 22050 |

Response: `{ audios: [base64 WAV] }`. Streaming variants exist (`/text-to-speech/stream`,
`wss://api.sarvam.ai/text-to-speech/ws`) — roadmap.

### Chat — `POST /v1/chat/completions` (OpenAI-compatible)
- `model`: `sarvam-105b` (128K context) or `sarvam-105b-conversations`. **Sarvam-M and
  sarvam-30b are no longer served by this endpoint.**
- `reasoning_effort`: `low | medium | high` (Nestam: `low` for latency).
- `response_format: { type: "json_schema", json_schema: {name, schema} }` — used for
  `bomma_reply` and `memory_extraction`.
- `wiki_grounding` is not supported on 105B — never sent.
- Response: standard `choices[0].message.content` (+ optional `reasoning_content`, which Nestam
  ignores; `<think>` blocks are stripped defensively).

### Translate — `POST /translate` (available, optional)
`{ input, source_language_code ('auto' ok), target_language_code, model: 'mayura:v1' |
'sarvam-translate:v1', mode: formal | modern-colloquial | classic-colloquial | code-mixed,
output_script }` → `{ translated_text, source_language_code }`. Limits: 1,000 chars (mayura),
2,000 (sarvam-translate).

## Free tier & costs
- New accounts get complimentary credits (₹1,000 per the pricing page; the rate-limits page says
  ₹100 — treat ₹100 as the floor). Credits do not expire. A startup programme offers 6–12 months
  of credits.
- Public list prices used by the budget guard (override in `.env`): speech APIs ≈ ₹30/hour,
  `sarvam-105b-conversations` ≈ ₹29.28 per 1M input tokens / ₹73.2 per 1M output, translation
  ₹0.005/char.
- A typical voice turn ≈ 6 s STT + 8 s TTS + 1.8K tokens ≈ **₹0.20**. ₹100 ≈ 500 turns;
  ₹1,000 ≈ 5,000 turns.
- Rate limits: `bulbul:v3` starter tier 30 req/min, 30 concurrent; 429 on excess (the client
  retries with backoff, honouring `Retry-After`).

## How Nestam keeps it free
1. **Mock mode** (`SARVAM_API_KEY` empty) exercises every code path with zero calls.
2. **TTS cache**: greetings, poke lines and utility TTS are cached to disk by content hash.
3. **Budget guard**: `NESTAM_DAILY_BUDGET_INR` (default ₹30). Past the cap the server returns
   text-only replies (`thrifty: true`) and skips memory consolidation instead of failing.
4. **Short replies**: `max_tokens` 350 and a persona rule of ≤ 60 words keep TTS seconds low.
5. **No-LLM features**: daily activities, greetings, pokes, quiz matching and the Vaakili loop
   are template/rule based.
6. `GET /api/usage` and the Settings screen show the running estimate.

## Upgrading to streaming (roadmap)
Sarvam ships WebSocket STT (`/speech-to-text/ws`) and TTS streaming. The engine is structured so
`provider.transcribe/synthesize` can be replaced by streaming variants; the client already
supports envelope-less playback (falls back to live RMS lip-sync).
