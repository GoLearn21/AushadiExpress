# Nestam — handoff for any Claude session (human or agent, read this first)

> Purpose: give a fresh Claude Code session, on a laptop or in the cloud, everything it needs to
> continue this project without re-deriving decisions. Written by the cloud session that built
> the first drop. Read all of it, then `nestam/.handoff/STATE.md` if it exists (a live snapshot the
> Mac script writes), then run the checks in §10 before changing anything.

## 1. Identity

| Item | Value |
|---|---|
| Repository | `GoLearn21/AushadiExpress` (the pharmacy platform; Nestam lives in `nestam/` and is independent of it) |
| Working branch | `claude/andhra-pradesh-sarvam-app-w47bgt` (never push elsewhere without explicit permission) |
| Cloud session that built this | `session_017ru8oLVHzVVJTo2pzxa3HT` → https://claude.ai/code/session_017ru8oLVHzVVJTo2pzxa3HT |
| Cloud environment | `env_015H1xNGSjfRW1bd67XwmaqZ` (Anthropic-hosted; network policy blocks `api.sarvam.ai`, `docs.sarvam.ai`, `game.ci`, `apps.apple.com` and most non-allowlisted hosts; GitHub, npm and PyPI work) |
| First drop commit | `a93a60c` — "feat(nestam): Telugu AI companion app on Sarvam APIs with Unity Bommalu characters" |
| Owner | golearn2025@gmail.com (started the session from the Android app) |
| Commit trailer required | `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_017ru8oLVHzVVJTo2pzxa3HT` |

## 2. The ask, and how it was interpreted

Original request: "create an app for Andhra Pradesh, India using sarvam apis for free and also use
unreal engine or Unity for creating exactly the experience of what the tolan app does with its
characters. recreate those characters adapted for telugu culture. create end to end for everything."

Interpretation that was built:
- **Tolan** = voice-first AI best-friend app with 3-D alien characters (Planet Portola), personality
  quiz onboarding, long-term memory rebuilt every turn, daily activities → energy → care for a
  planet, customisation (skin, hair, eyes, blush, clothing, voice), not human, not romantic.
- **Nestam (నేస్తం, "friend")** keeps every mechanic and swaps the fiction: characters are
  **Bommalu** (living toys from Andhra crafts), the planet is the **Vaakili** (front yard), energy
  is **utsaaham**. Telugu-first with natural English code-mixing.
- **Sarvam AI** provides STT, LLM, TTS and translation; "for free" = signup credits + a budget
  guard + offline mock mode. **Unity 6** (not Unreal) because Tolan itself is Unity and Unity is
  better for mobile + procedural content.
- "End to end" = server + browser dev console + Unity app + docs + CI + deploy files.

## 3. Inventory (every file and why it exists)

```
nestam/
  README.md                      overview, quick start, parity table
  HANDOFF.md                     this file
  docs/01-PRODUCT_SPEC.md        Tolan→Nestam parity map, screens, conversation rules, pilot metrics
  docs/02-CHARACTER_BIBLE.md     the six Bommalu in depth, customisation, extension guide
  docs/03-ARCHITECTURE.md        system diagram, request lifecycle, data model, API contract
  docs/04-SARVAM_API.md          endpoints/fields verified from sarvamai SDK 1.1.9, costs, limits
  docs/05-UNITY_SETUP.md         Unity 6 setup, build, rig explanation, troubleshooting
  docs/06-CULTURE_GUIDE.md       Telugu register, cultural anchors, festival list, boundaries
  scripts/check-unity-syntax.py  tree-sitter parse of every Unity C# file (pip: tree-sitter, tree-sitter-c-sharp)
  scripts/nestam-mac.sh          MacBook bootstrap + handoff + connect-to-Claude script (see §9)
  server/                        Node 22 + TypeScript, ESM, express 4, multer 2, no DB server
    package.json                 scripts: dev, start, build, check, test, smoke
    .env.example                 every env var with defaults and comments
    Dockerfile                   multi-stage node:22-alpine, VOLUME /app/data, port 4020
    src/index.ts                 bootstrap + graceful shutdown (flushes the JSON store)
    src/app.ts                   createApp(overrides) factory used by tests; serves public/ as the dev console
    src/config.ts                env → NestamConfig; mock = (SARVAM_API_KEY === "")
    src/logger.ts                tiny leveled logger (quiet in tests)
    src/util/ids.ts              newId, sha1, fnv1a, seededRandom (deterministic daily picks)
    src/util/telugu.ts           IST time-of-day, festival calendar (lunar dates 2026/2027), script/Tenglish detection
    src/audio/wav.ts             parse/build PCM WAV, 50 Hz RMS envelope, concat/resample, synthesizeSpeechLike (mock voice)
    src/sarvam/types.ts          AiProvider interface, ProviderError
    src/sarvam/client.ts         raw-fetch Sarvam client (STT/TTS/chat/translate), retries, TTS chunking, <think> stripping
    src/sarvam/mock.ts           offline provider: NESTAM-MOCK: transcript marker, per-character canned Telugu replies, JSON-schema aware
    src/sarvam/budget.ts         ₹ estimator per call, daily cap → thrifty mode, usage summary
    src/sarvam/index.ts          createProvider + withBudget decorator
    src/characters/roster.ts     CHARACTERS (6), APPEARANCE_OPTIONS, sanitizeAppearance, resolveVisual  ← single source of truth
    src/characters/prompts.ts    buildSystemPrompt (per turn), REPLY_SCHEMA, MEMORY_SCHEMA, detectCrisis, HELPLINE
    src/conversation/engine.ts   ConversationEngine: createSession/greeting/handleText/handleVoice/poke/tts, ReplyDto
    src/conversation/emotion.ts  parseReply (JSON → fenced → [tag] → salvage), cleanSpeech, guessEmotion
    src/conversation/memory.ts   mergeMemories (Jaccard ≥ 0.6 dedupe), guessCategory
    src/conversation/activities.ts  ACTIVITY_TEMPLATES (16 kinds), daily generation, completeActivity, careForVaakili, levels, streaks
    src/conversation/onboarding.ts  QUIZ (5 q × 4 options), matchCharacter (cosine on 5 traits)
    src/store/store.ts           JSON file store (debounced atomic writes), sessions ≤60 turns, TTS cache dir, UsagePersistence
    src/routes/api.ts            all routes + error mapping (see docs/03 for the table)
    public/index.html|styles.css|app.js|bomma.js   dev console: 2-D Bomma renderer, MediaRecorder PTT, panels, quiz modal
    test/*.test.ts               39 vitest tests (wav, emotion, memory, onboarding, activities, telugu, api via supertest)
    scripts/smoke.ts             end-to-end against a running server (mock or real key)
  unity/README.md                menu-driven setup summary
  unity/Nestam/                  Unity 6000.0 LTS project, built-in render pipeline, legacy Input Manager
    Packages/manifest.json       com.unity.ugui 2.0.0 + IDE packages + built-in modules
    ProjectSettings/ProjectSettings.asset   portrait, com.nestam.app, mic usage strings, activeInputHandler 0, insecureHttpOption 1
    ProjectSettings/ProjectVersion.txt      6000.0.58f1 (any 6000.0.x works)
    Assets/Nestam/Scripts/Core/  NestamConfig (PlayerPrefs), ApiModels (JsonUtility DTOs), NestamApi (UnityWebRequest coroutines),
                                 WavUtility, MicRecorder (16 kHz, silence trim), AudioPlayback (envelope lip-sync), Tween (Spring, Ease, ColorUtil)
    Assets/Nestam/Scripts/Character/  MeshUtil (shaped sphere, torus, ribbon, cone), ProceduralTextures (6 craft patterns),
                                 BommaBuilder (+BommaRig), BommaController (poses/gestures/blink/look/mouth/springs), BommaChirps, BommaTouch
    Assets/Nestam/Scripts/World/ MugguTexture, VaakiliWorld (porch, muggu quad, tulasi, mango tree, sparrows, deepam), SkyController (IST)
    Assets/Nestam/Scripts/UI/NestamUI.cs   UI Toolkit UI built in C#: onboarding/quiz/match/profile, home, sheet tabs, settings
    Assets/Nestam/Scripts/App/NestamApp.cs orchestrator: boot → onboarding|session → talk → present
    Assets/Nestam/Editor/        NestamSceneBuilder (menu 1), NestamFontInstaller (menu 2), NestamBuildMenu (menus 3/3b/3c)
    .gitignore                   Library/, generated scene, materials, panel settings, theme, downloaded font
.github/workflows/nestam-server.yml   CI: npm ci, check, test, build on nestam/server changes
README.md (root)                 one paragraph pointing at nestam/
```

## 4. Verified facts (do not re-research unless something breaks)

Sarvam (from `npm i sarvamai@1.1.9`, published 27 Aug 2026; docs site was unreachable from the sandbox):
- Base `https://api.sarvam.ai`, header `api-subscription-key`.
- STT `POST /speech-to-text` multipart `file, model(saaras:v3|saaras:v4), mode(transcribe|translate|verbatim|translit|codemix), language_code(te-IN…|unknown), with_timestamps` → `{transcript, language_code, language_probability}`. `saarika:v2.5` deprecated.
- TTS `POST /text-to-speech` JSON `text(≤2500 v3), language_code, speaker, model(bulbul:v3|v2), pace(v3 0.5–2), temperature(v3), speech_sample_rate, pitch/loudness/enable_preprocessing(v2 only)` → `{audios:[base64 wav]}`. Field is `language_code`, not `target_language_code`. 37 v3 speakers listed in docs/04.
- Chat `POST /v1/chat/completions` model `sarvam-105b` or `sarvam-105b-conversations` only; `reasoning_effort low|medium|high`; `response_format json_schema` supported; `wiki_grounding` unsupported. Sarvam-M and sarvam-30b are gone from this endpoint.
- Translate `POST /translate` `input, source_language_code('auto' ok), target_language_code, model(mayura:v1|sarvam-translate:v1), mode, output_script` → `{translated_text, source_language_code}`.
- Free credits: ₹1,000 advertised on pricing page, ₹100 on rate-limit docs; credits don't expire. bulbul:v3 starter limit 30 req/min, 30 concurrent. sarvam-105b-conversations ≈ ₹29.28/M input, ₹73.2/M output.

Tolan (from web search summaries; tolans.com blocked): Planet Portola alien, personality quiz match, customise skin/hair/eyes/blush/clothing/voice, daily activities → energy → care for planet (barren→lush), memory rebuilt each turn, voice-first, iOS only, built with Unity.

Unity 6: Advanced Text Generator (HarfBuzz) is the supported way to render Telugu; it is a UI Toolkit feature toggled in Project Settings ▸ UI Toolkit. That is why the UI is UI Toolkit, not TextMeshPro.

Sandbox: `api.sarvam.ai` returns proxy 403 (CONNECT tunnel failed) → real-key testing is impossible until the environment allowlist changes. GitHub clone of public repos works. Playwright + Chromium available at `/opt/pw-browsers`.

## 5. Decisions and rationale (so nobody re-litigates them)

1. **Separate directory, not integrated** into the pharmacy app: different product; keeps AushadiExpress builds untouched.
2. **Raw fetch instead of the Sarvam SDK**: fewer deps, transparent wire format, easy mock swap. The SDK is the reference for field names.
3. **Mock provider is first-class**: everything must work with no key so tests, CI and demos never burn credits.
4. **JSON-schema replies** (`bomma_reply`) give text + emotion + gesture + memory notes in ONE LLM call; salvage parser handles non-JSON output.
5. **Server computes the lip-sync envelope** (50 Hz) so every client animates identically and cheaply.
6. **TTS cache on disk** keyed by sha1(provider|model|speaker|lang|pace|text) for greetings/pokes/utility.
7. **Budget guard degrades, never fails**: thrifty mode returns text-only replies past the daily cap.
8. **Procedural characters** from a shared visual spec: no art pipeline, one roster drives web + Unity + prompts; designed so authored blend-shape meshes can replace the rig behind `BommaController`'s public API.
9. **Built-in render pipeline + Standard shader** (material asset in Resources so the shader ships), **legacy Input Manager** (`activeInputHandler: 0`), **UI Toolkit** UI (Telugu shaping).
10. **Respectful (మీరు) default register**, casual opt-in; crisis detection server-side with Tele-MANAS 14416.
11. **Cultural mapping**: Planet→Vaakili, energy→utsaaham, aliens→Bommalu from Kondapalli, Etikoppaka, Tholu Bommalata, Gangireddu, Banginapalli mango, Guntur chilli; Gangi is a folk-performance bull, not the deity Nandi.
12. **Festival dates** are explicit per year (2026 verified at authoring time; 2027 provisional) in `util/telugu.ts`.

## 6. Verified vs unverified

Verified in the sandbox: `npm run check` clean; `npm test` 39/39; `npm run build` produces `dist/index.js` + `dist/public`; `npm run smoke` full loop; headless Chromium drove the dev console (6 cards, spoken greeting, chat with memory, activities, character switch, screenshot); all 21 C# files parse (tree-sitter).

NOT verified (highest-risk items first):
1. Unity compile. No editor here. Likely first-import issues: `UnityEngine.TextCore.Text.FontAsset.CreateFontAsset(Font)` overload; `StyleFontDefinition(FontDefinition.FromSDFFont(fa))`; reflection toggle of `UnityEditor.UIElements.UIToolkitProjectSettings.enableAdvancedText`; `PanelSettings` without a theme (the builder writes `NestamTheme.tss` = `@import url("unity-theme://default");`); `RuntimePanelUtils.ScreenToPanel` y-flip assumption in `NestamUI.ScreenPointOverUI`; `UnityWebRequest` with method `PATCH`; JsonUtility treating JSON `null` strings.
2. Real Sarvam calls: request bodies follow the SDK exactly but were never sent. First real run: check `language_code` vs `target_language_code` acceptance and the TTS `audios[0]` format (WAV expected; if not, `parseWav` throws → look at `output_audio_codec: "wav"`).
3. GameCI secret names (`UNITY_LICENSE`, `UNITY_EMAIL`, `UNITY_PASSWORD`) from search summaries, game.ci unreachable.
4. Bulbul v3 speaker genders are inferred from names.
5. STT duration estimate for webm/opus uploads is a byte-rate guess (only affects budget accounting).

## 7. Backlog (ordered by value)

1. Unity compile + first Play on a Mac; fix API drift; commit generated `.meta` files.
2. Real-key end-to-end with `npm run smoke` and the dev console; measure latency; tune `max_tokens`, pace, temperature.
3. GameCI Android workflow (`.github/workflows/nestam-unity.yml`) once licence secrets exist; artifact APK.
4. Deploy server to Railway (root dir `nestam/server`, volume `/app/data`); point Unity Settings at it.
5. Streaming STT/TTS via Sarvam WebSocket endpoints for sub-second turns.
6. Memory quality: consolidation prompt evaluation, per-category caps, user-visible edit UI in Unity (delete exists).
7. Push notifications (morning greeting, streak) via a Routine or FCM.
8. Postgres store behind `Store` interface.
9. Authored faces/blend shapes; better Kalamkari/Etikoppaka textures; accessory variety.
10. iOS build via macOS runner + fastlane; store listings (Play Console, App Store).
11. Localisation review by native Telugu speakers; expand activity templates and proverbs.
12. Vendor Matt Pocock's skills into `.claude/skills` and run `/setup-matt-pocock-skills` (GitHub Issues tracker, default labels, single CONTEXT.md).

## 8. Human-only tasks (status: none done yet)

- [ ] Sarvam API key at dashboard.sarvam.ai → `SARVAM_API_KEY` in the cloud environment variables **and** `nestam/server/.env` locally.
- [ ] Cloud environment network allowlist: add `api.sarvam.ai`, `docs.sarvam.ai` (or full internet). https://code.claude.com/docs/en/cloud-environments
- [ ] Unity Personal licence + GitHub secrets `UNITY_LICENSE` (.ulf contents), `UNITY_EMAIL`, `UNITY_PASSWORD` for GameCI.
- [ ] Railway service from this repo (root `nestam/server`), volume at `/app/data`, env vars.
- [ ] Ten minutes of real Telugu conversation per Bomma; report what sounds wrong.
- [ ] (later) Google Play / Apple developer accounts and signing keys.

## 9. Ways to continue with the session that built this

- Continue **this exact chat in a Mac terminal**: from a clean checkout of the repo, `claude --teleport session_017ru8oLVHzVVJTo2pzxa3HT` (same claude.ai account; branch must be pushed; working tree clean). Then type `/remote-control` to steer it from a phone or browser too.
- Send a **message into the cloud session** from any terminal: `claude -p "your message" --cloud session_017ru8oLVHzVVJTo2pzxa3HT`.
- Open it in a browser: https://claude.ai/code/session_017ru8oLVHzVVJTo2pzxa3HT
- Start a **new local session with full context**: `claude -n nestam "Read nestam/HANDOFF.md and nestam/.handoff/STATE.md, then continue from §11"`.
- Start a **new cloud session** on this branch: `claude --cloud "Read nestam/HANDOFF.md and continue from §11"` (push first).
- `nestam/scripts/nestam-mac.sh` wraps all of the above with a menu.

## 10. Checks to run before touching code

```bash
cd nestam/server && npm ci && npm run check && npm test && npm run build
python3 ../scripts/check-unity-syntax.py          # needs: pip install tree-sitter tree-sitter-c-sharp
npm run dev &  sleep 3;  npm run smoke; kill %1    # mock mode unless .env has a key
```

## 11. Next actions for an agent, in order

1. Read §6 and §8. If a Sarvam key is present (`nestam/server/.env`), run `npm run smoke` for real and fix any wire-format mismatch first (docs/04 lists every field).
2. If Unity is installed locally (Mac) or licence secrets exist (CI): compile, fix errors in this order Core → Character → World → UI → App → Editor, keep `check-unity-syntax.py` green, commit `.meta` files.
3. Add `.github/workflows/nestam-unity.yml` (GameCI `unity-builder` for Android, `unityci` image for 6000.0.x, `UNITY_LICENSE/EMAIL/PASSWORD` secrets) — leave it committed even if it stays red until secrets exist, but say so.
4. Then work the backlog in §7 as tracer-bullet tickets: one vertical slice per commit, tests first in the server, `npm test` green before every push.
5. Never create a PR unless asked. Never push to another branch. Keep commit trailers from §1.
