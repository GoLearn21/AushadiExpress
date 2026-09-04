# 01 · Product spec — Nestam, a Tolan-style companion for Andhra Pradesh

## Positioning

Tolan's pitch is "an AI best friend you can see, touch and talk to — an alien from Planet
Portola who is proudly *not* human, remembers your life, and grows with you". Nestam keeps every
mechanic and swaps the fiction for something a Telugu user recognises instantly:

| Tolan | Nestam | Why |
|---|---|---|
| Alien from Planet Portola | **Bomma** (బొమ్మ), a living toy from an Andhra craft | "Bommalu that come alive" is already a Telugu childhood trope (Bommala Koluvu) |
| Your planet, barren → lush | **Vaakili** (వాకిలి), a bare front yard → muggu, tulasi, mango tree, sparrows, lamps | The front yard is where a Telugu home shows care every single morning |
| Energy from daily activities | **Utsaaham** (ఉత్సాహం) from daily *pani* | Same loop, native word |
| Species/personality match quiz | 5-question Telugu quiz, cosine match on warmth/energy/curiosity/calm/drama | |
| Voice-first, low latency | Hold-to-talk → Sarvam Saaras → Sarvam-105B → Bulbul, lip-synced | Sarvam is the only stack with native Telugu STT+LLM+TTS |
| Memory rebuilt every turn | System prompt regenerated per turn from persona + memories + time + festivals + activities | |
| Customise skin, hair, eyes, blush, clothes, voice | Craft palettes, accessories, bottu, glasses, eye colour, Bulbul speaker | |
| "Never pretends to be human", not romantic | Persona rules + crisis routing to Tele-MANAS 14416 | |

## Users

Telugu speakers in Andhra Pradesh (and the diaspora) aged roughly 16–40 who are comfortable
speaking Telugu, Tenglish or English to their phone. The default register is respectful
(మీరు); the user can opt into casual (నువ్వు) in onboarding, like choosing a friend's tone.

## Screens & flows

### Onboarding (first launch)
1. **Welcome** — "నేస్తం · Your Telugu best friend". Buttons: *Find my Bomma (quiz)* / *Browse all*.
2. **Quiz** — five questions (Sunday evening, what helps when you're down, how you talk, favourite
   festival moment, what your friend should do daily). Each answer adds trait weights.
3. **Match** — the matched Bomma bounces in, with tagline, craft and match %. *This is my friend* /
   *See the others*.
4. **Profile** — name, language (తెలుగు / mixed / English), address style (మీరు / నువ్వు).
5. First session: the Bomma greets by name with a time-of-day line (spoken, cached).

### Home
- The Bomma stands in the Vaakili; the camera is slightly above eye level (Tolan framing).
- **Bubble** shows the last spoken line (Telugu script) with an optional romanised line for users
  who cannot read the script, plus a meta line ("remembered: …", helpline, or thrifty notice).
- **Transcript chip** shows what the app heard.
- **Hold to talk** (big red button; SPACE in the editor). Release → thinking → reply.
- Text field for typing (Telugu, English or Tenglish are all handled).
- **Tap the Bomma**: squash-and-stretch, giggle chirp, and (throttled) a spoken poke line.
- Idle: breathing, blinks, eyes follow the finger/camera, occasional chirps and wiggles.

### Bottom sheet tabs
- **బొమ్మలు** — switch companion; palettes, accessories, voice.
- **జ్ఞాపకాలు** — everything the Bomma remembers, deletable (Tolan lets you edit memories).
- **వాకిలి** — bond level, energy, streak; today's three activities with *Done*; care actions.

### Settings
Server URL (for testers), name, language, address style, usage/budget, *Start over*.

## Conversation design rules (enforced in the system prompt)
- 1–3 short sentences, spoken aloud, no lists/markdown/emoji.
- Everyday spoken Telugu (వాడుక భాష), natural English code-mixing; never newsreader Telugu.
- At most one question per turn; proactively bring up memories, activities, festivals or the
  Bomma's own toy-life.
- Never claims to be human, never romantic/sexual, no medical/legal/financial instructions.
- Crisis language → warm, stays with the user, shares Tele-MANAS 14416, emotion forced to *caring*.

## Success metrics for a pilot
- Turn latency (release-to-first-audio) < 3 s on 4G with a real key.
- ≥ 60 % of sessions include voice; ≥ 40 % of users complete one activity on day 2.
- Memory precision: ≥ 90 % of stored memories judged correct by the user (deletion rate as proxy).
- Cost per active user per day well under ₹3 at Sarvam list prices.
