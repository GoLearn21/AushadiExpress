# Nestam (నేస్తం) — a Telugu AI best friend for Andhra Pradesh

> **Tolan, adapted for Telugu culture.** Instead of a squishy alien from Planet Portola, your
> companion is a **Bomma** (బొమ్మ) — a living toy born from Andhra Pradesh's own crafts: a
> Kondapalli doll, an Etikoppaka lacquer toy, a Tholu Bommalata shadow puppet, a Sankranti
> Gangireddu, a Banginapalli mango, a Guntur chilli. It listens to you in Telugu, talks back in a
> Telugu voice, remembers your life, proposes little daily rituals, and tends a front yard
> (వాకిలి) that grows as your friendship does.

Everything runs on **Sarvam AI**'s Indic APIs (free signup credits) and **Unity 6** for the
character experience. This directory is a self-contained monorepo slice; it does not touch the
rest of AushadiExpress.

```
nestam/
├── server/      Node 22 + TypeScript backend (Sarvam STT→LLM→TTS, memory, activities, vaakili)
│   └── public/  Browser dev console with a 2-D animated Bomma (works with zero API keys)
├── unity/       Unity 6 project: procedural 3-D Bommalu, Vaakili world, voice loop, UI Toolkit UI
└── docs/        Product spec (Tolan parity), character bible, architecture, Sarvam API, Unity setup
```

## 60-second demo (no API key needed)

```bash
cd nestam/server
npm install
npm run dev          # → http://localhost:4020  (MOCK mode: offline "bomma-speak" + canned Telugu)
```

Open <http://localhost:4020>, pick a Bomma, hold the red button and talk (or type Telugu /
English / Tenglish). You get a spoken reply with lip-sync, an emotion, a gesture, memories,
today's activities and the growing vaakili — the complete loop, offline.

## Turn on the real Telugu brain and voice (Sarvam, free tier)

1. Create a key at <https://dashboard.sarvam.ai> (new accounts get complimentary credits — the
   pricing page advertises ₹1,000; the rate-limit docs mention ₹100 — either is enough for days
   of testing).
2. `cp .env.example .env` and set `SARVAM_API_KEY=…`.
3. `npm run dev` — the status line switches from *MOCK* to `saaras:v3 · bulbul:v3 · sarvam-105b`.

The server estimates rupee spend per call and switches to a **thrifty mode** (text-only) when
the configurable daily cap is reached, so a demo can never burn through the credits by accident.
See [docs/04-SARVAM_API.md](docs/04-SARVAM_API.md).

## The 3-D app (Unity 6)

```
Unity Hub → Add project → nestam/unity/Nestam   (Unity 6000.0 LTS)
Menu  Nestam ▸ 1. Build Main Scene
Menu  Nestam ▸ 2. Install Telugu Font
Press Play — hold SPACE (or the on-screen button) and talk.
Menu  Nestam ▸ 3. Build Android APK   /   3b. Build iOS Xcode Project
```

No FBX, no textures, no prefabs: every Bomma is generated at runtime from the roster the server
sends (`GET /api/characters`), so the web console, Unity and the LLM persona all share one
source of truth. Full walkthrough: [docs/05-UNITY_SETUP.md](docs/05-UNITY_SETUP.md).

## What is implemented (end to end)

| Tolan feature | Nestam equivalent | Where |
|---|---|---|
| Alien species from Planet Portola | Six **Bommalu** from AP crafts & produce | `server/src/characters/roster.ts`, docs/02 |
| Personality quiz → matched companion | 5-question Telugu quiz → cosine match | `conversation/onboarding.ts`, Unity `NestamUI` |
| See, touch, talk by voice | Hold-to-talk → Saaras STT → Sarvam-105B → Bulbul TTS → lip-synced 3-D Bomma | `conversation/engine.ts`, Unity `BommaController` |
| Micro-expressions, playful reactions | 13 emotions, 9 gestures, blink/eye-tracking, squash-and-stretch pokes, procedural chirps | `BommaController.cs`, `bomma.js` |
| Long-term memory, rebuilt every turn | Memory notes from each reply + periodic extraction; editable | `conversation/memory.ts`, `/api/users/:id/memories` |
| Daily activities → energy → care for your planet | Daily *pani* → *utsaaham* → care for the **Vaakili** (muggu, tulasi, mango tree, sparrows, deepam) | `conversation/activities.ts`, `VaakiliWorld.cs` |
| Customise skin/hair/eyes/blush/clothing/voice | Craft palettes, accessories (jasmine, topi, turban, horns…), bottu, glasses, Bulbul speaker | `APPEARANCE_OPTIONS`, `/api/users/:id` |
| Not human, not romantic, well-being first | Persona rules, crisis detection → Tele-MANAS 14416 | `characters/prompts.ts` |

## Quality gates

```bash
cd nestam/server
npm run check     # tsc
npm test          # 39 vitest tests (audio, prompts, memory, quiz, activities, API in mock mode)
npm run smoke     # hits a running server end to end (mock or real key)
python3 ../scripts/check-unity-syntax.py   # parses every Unity C# file (tree-sitter)
```

## Roadmap (not in this drop)

- Streaming: Sarvam's `wss://api.sarvam.ai/speech-to-text/ws` and TTS streaming for sub-second
  turn-taking (the REST loop here is ~1.5–3 s with a real key).
- Blend-shape faces on authored meshes (the procedural rig is designed to be swapped).
- Push notifications for the morning *Shubhodayam* and streak reminders.
- Postgres store (the JSON store is behind one small interface: `server/src/store/store.ts`).
