# 03 · Architecture

```
┌────────────────────────┐        multipart wav / json         ┌──────────────────────────────┐
│  Unity 6 app (iOS/And) │ ───────────────────────────────────▶ │  nestam/server (Node 22, TS)  │
│  • MicRecorder 16 kHz  │                                      │  routes/api.ts                │
│  • BommaController     │ ◀─────────────────────────────────── │  conversation/engine.ts       │
│    emotion/gesture/    │   ReplyDto: text, emotion, gesture,  │   ├─ prompts.ts  (persona,    │
│    lip-sync envelope   │   wav (base64), envelope[50 Hz],     │   │   memories, time, fests)  │
│  • VaakiliWorld        │   memoryUpdates, bond, safety        │   ├─ memory.ts  (merge/dedupe)│
│  • UI Toolkit screens  │                                      │   ├─ activities.ts (vaakili)  │
└────────────────────────┘                                      │   └─ emotion.ts (JSON parse)  │
┌────────────────────────┐                                      │  sarvam/client.ts ──────────┐ │
│  Browser dev console   │  same API                            │  sarvam/mock.ts   (offline) │ │
│  public/bomma.js (2-D) │ ───────────────────────────────────▶ │  sarvam/budget.ts (₹ guard) │ │
└────────────────────────┘                                      │  store/store.ts (JSON+cache)│ │
                                                                └─────────────┬───────────────┘ │
                                                                              ▼                 │
                                                          https://api.sarvam.ai  ◀──────────────┘
                                                          /speech-to-text  (saaras:v3)
                                                          /v1/chat/completions (sarvam-105b, JSON schema)
                                                          /text-to-speech  (bulbul:v3)
                                                          /translate       (mayura:v1, optional)
```

## Request lifecycle: one spoken turn

1. **Client** records while the button is held (16 kHz mono), trims silence, uploads WAV
   (`POST /api/voice`, field `audio`).
2. **STT** — `saaras:v3`, `mode=transcribe`, `language_code=unknown`. The detected language
   (te-IN / en-IN) decides the reply language policy.
3. **Prompt** — `buildSystemPrompt()` regenerates the whole system message: persona, cultural
   voice rules, address style, up to 40 memories, IST date/time, festivals within 3 days, bond
   level/streak, today's activities, crisis block if triggered. Last 14 turns follow.
4. **LLM** — `sarvam-105b` with `response_format: json_schema` (`bomma_reply`):
   `{reply, reply_roman, emotion, gesture, memory_notes[], activity_completed}`.
   `parseReply()` tolerates fenced JSON, `<think>` blocks and plain text with a `[tag]`.
5. **Bookkeeping** — turns appended, bond points +1, streak/energy on a new day, memory notes
   merged (Jaccard ≥ 0.6 = duplicate), activity completion credited. Every 6 turns a background
   `memory_extraction` call consolidates durable facts (skipped in thrifty mode).
6. **TTS** — `bulbul:v3`, character speaker, `te-IN` if the reply contains Telugu script else
   `en-IN`; long text is chunked at sentence boundaries (2,500-char limit) and concatenated.
   Greetings/poke lines are cached on disk by SHA-1 of (model, speaker, language, pace, text).
7. **Envelope** — RMS per 20 ms window, peak-normalised, sqrt-compressed, 3-decimal floats.
   The client indexes it by `audioSource.time` for lip-sync; if absent it falls back to live RMS.
8. **Reply** — a single JSON `ReplyDto` (see `engine.ts`), JsonUtility-friendly (no maps).

Latency budget with a real key (typical): STT 0.6–1.2 s · LLM 0.8–1.5 s · TTS 0.5–1.0 s.

## Data model (JSON store, `data/nestam-db.json`)

```
users[id]     name, town, language, addressStyle, characterId, appearance{}, memories[],
              vaakili{level, points, energy, muggu, tulasi, tree, birds, deepam},
              streak{count, lastDate}, activities{date: [...]}, totalTurns, timestamps
sessions[id]  userId, characterId, turns[≤60]{role, content, at, emotion}, turnsSinceExtraction
usage[date]   inr, sttSeconds, ttsSeconds, llmInputTokens, llmOutputTokens, calls{}
tts-cache/    <sha1>.wav
```

Writes are debounced (80 ms) and atomic (temp file + rename). Persist `NESTAM_DATA_DIR` as a
volume on Railway/Fly. Swapping to Postgres means re-implementing the `Store` class only.

## API contract (all JSON unless noted)

| Method & path | Purpose |
|---|---|
| `GET /api/status` | health, provider (mock/sarvam), models, IST time, thrifty flag |
| `GET /api/characters` | roster + customisation options |
| `GET /api/onboarding/quiz` · `POST /api/onboarding/match {answers}` | quiz & match |
| `POST /api/session {userId?, characterId, name?, language?, addressStyle?, appearance?, silent?}` | create/refresh user, new session, spoken greeting |
| `POST /api/chat {sessionId, text}` | text turn → ReplyDto |
| `POST /api/voice` multipart `audio` + `sessionId` (mock: `mockTranscript`) | voice turn → ReplyDto with transcript |
| `POST /api/poke {sessionId}` | canned reaction, cached TTS |
| `POST /api/tts {text, characterId, appearance?}` (`?format=wav`) | utility TTS |
| `GET/PATCH/DELETE /api/users/:id` | profile, appearance, language |
| `GET/POST /api/users/:id/memories` · `DELETE …/memories/:mid` | memory management |
| `GET /api/users/:id/activities` · `POST …/activities/:aid/complete` | daily activities |
| `GET /api/users/:id/vaakili` · `POST …/vaakili/care {action}` | yard growth |
| `GET /api/festivals` · `GET /api/usage` | calendar, budget |

Errors: `{error: {code, message}}` with 400/404/409/429/502.

## Unity architecture

- `Core/NestamApi` — coroutine HTTP client (UnityWebRequest) mirroring the routes above.
- `Core/MicRecorder`, `AudioPlayback`, `WavUtility` — capture, playback, lip-sync value.
- `Character/BommaBuilder` — primitives + `MeshUtil` (shaped sphere, torus, ribbon, cone) +
  `ProceduralTextures` → a `BommaRig`; `BommaController` animates it; `BommaChirps` synthesises
  sounds; `BommaTouch` handles pokes and eye-tracking.
- `World/VaakiliWorld` + `MugguTexture` + `SkyController` — the growing front yard, IST lighting.
- `UI/NestamUI` — UI Toolkit screens built in C# (Advanced Text Generator for Telugu).
- `App/NestamApp` — the state machine (onboarding → session → talk → present).
- `Editor/*` — one-click scene, font installer, build menu.

## Security & privacy notes
- The Sarvam key lives only on the server; clients never see it.
- Audio is not stored; transcripts and replies are kept in the session log (last 60 turns).
- Memories are user-visible and deletable; `DELETE /api/users/:id` wipes everything.
- Crisis detection runs server-side on every turn and is surfaced in `safety`.
