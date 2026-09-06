# Research Stream 11 — Realtime Voice: Providers, Cost, and KMP Reality

**Date:** 2026-08-27
**Purpose:** Evidence base for the voice experience and for ADR-030.
**Full report with per-figure provenance chips:** `voice/VOICE-STACK-RESEARCH.html`

**Verification constraint — read first.** The egress proxy returned 403 for **every** direct
page fetch, including `platform.openai.com`, `developers.openai.com`, `ai.google.dev`,
`docs.livekit.io`, `docs.aws.amazon.com`, and even `en.wikipedia.org`. Web *search* worked, so
every figure below is extracted from search results, usually domain-restricted to the vendor.
**No primary page was opened.** Prices marked ⚠️ must be re-verified against the vendor's own
pricing page before they enter a financial model.

---

## 1. The latency budget — the threshold is tighter than assumed

The canonical source is **Stivers et al., PNAS 106(26), 2009**, "Universals and cultural
variation in turn-taking in conversation," measured across ten languages: modal turn-transition
offset is **0–200 ms**.

The half that matters more for design: **gaps beyond roughly 700 ms read cross-culturally as
*dispreferred*.** A slow agent does not read as slow — it reads as **evasive**. That reframes
the latency target from a performance nicety into a trust property, which for this product is
the same axis everything else is measured on.

Realistic speech-to-speech p50 is **500–800 ms**, and **the dominant term is end-of-turn
detection, not model inference.** Optimising the model while leaving VAD untuned optimises the
wrong term.

---

## 2. Speech-to-speech providers (August 2026)

| Provider | Model | Transport | Price | Note |
|---|---|---|---|---|
| OpenAI | `gpt-realtime-2.1` | **WebRTC** + WS | ⚠️ $32/$64 per 1M audio in/out | Ephemeral client secrets |
| OpenAI | `gpt-realtime-2.1-mini` | **WebRTC** + WS | ⚠️ $10/$20 per 1M | Prompt caching $0.30/1M cached audio — a 33× discount |
| Google | Gemini Live | WebSocket only | ⚠️ $3/$12 per 1M @ 25 tok/s | Cheapest per minute; `contextWindowCompression`; resumption handles |
| xAI | Grok Voice Agent | WS, **OpenAI-Realtime wire-compatible** (`wss://api.x.ai/v1/realtime`) | ⚠️ $0.08/min flat | Wire compatibility makes it nearly free to add as a second adapter |
| Amazon | Nova 2 Sonic | HTTP/2 | ⚠️ $3/$12 per 1M — **tokens-per-second not found, so $/min is genuinely unknown** | Cannot be costed |

**The composable pipeline alternative** (STT → LLM → TTS): AssemblyAI ⚠️ $0.15/hr,
Deepgram Nova-3 ⚠️ $0.0077/min, Deepgram Aura-2 ⚠️ $0.030/1k chars. More control over
turn-taking; more parts to operate.

---

## 3. The billing asymmetry that inverts the usual advice

**Speech-to-speech APIs bill audio tokens actually sent. Streaming STT vendors bill connection
wall-clock.**

Consequence: **client-side mic gating cuts a realtime API bill by 60–70% and cuts a Deepgram or
AssemblyAI bill by exactly zero.** The conventional wisdom that pipelines are cheaper is
therefore wrong at conversational duty cycles, where a user is silent most of the session.

Gated, `gpt-realtime-2.1-mini` lands at ⚠️ **$0.046/session → ~$18/month at 100 users, ~$1,840/month
at 10,000** — cheaper than the pipeline at both scales.

**Mic gating is worth more than vendor choice.** That is the single most actionable finding here.

### The cost every pricing table omits

Both OpenAI and Gemini **re-bill conversation context every turn, at audio-token rates**. A
Google forum thread reports Gemini Live cost scaling with turn count rather than call duration.
**Budget 1.5–3× naive** unless prompt caching (OpenAI) and `contextWindowCompression` (Google)
are explicitly enabled.

At 100 users the entire monthly bill for *every* option lands between roughly **$14 and $165**.
**Price is not the pilot decision.**

---

## 4. KMP reality — where a solo founder loses a month

**WebRTC on KMP is in better shape than expected, and one option is first-party.**
- **Ktor 3.3.0 ships an experimental multiplatform WebRTC client** — Android via Stream's
  precompiled library, iOS via the WebRTC SDK plus AVFoundation. Peer connections, data
  channels, and **media tracks with configurable echo-cancellation constraints**. Signalling is
  not included; Ktor WebSockets to our own Ktor backend is the obvious answer.
- **`webrtc-kmp`** (shepeliev, M125) is the fallback. On iOS the WebRTC SDK is not transitive —
  it must be added manually via SPM.

**Existing KMP audio libraries are the wrong shape.** `kmp-audio-recorder-player` and
`kmp-record` are file-based record-then-play, not low-latency streaming PCM. **We write the
`expect`/`actual` ourselves — roughly 400 lines per platform.**

**Sample-rate conversion is the number-one time sink.** OpenAI demands 24 kHz PCM16 mono
little-endian and nothing else; Gemini wants 16 kHz in / 24 kHz out; device hardware runs at
44.1 or 48 kHz. On iOS `setPreferredSampleRate()` is a **request the system may ignore** — read
`AVAudioEngine.inputNode.inputFormat(forBus:)` at runtime and convert with `AVAudioConverter`,
never hardcode. **Connecting a Bluetooth headset can force the session to 8 or 16 kHz
mid-conversation**, so the resampler must be reconfigurable at runtime, not configured once at
session start.

**Acoustic echo cancellation — the failure mode is worse than "bad audio."** Without AEC,
server VAD fires on the agent's own voice, the model transcribes itself as user input, and
responds to itself: a **self-interruption loop**. It **never reproduces on headphones**, which
is exactly why it reaches production. iOS `.playAndRecord` + `.voiceChat` handles it well;
Android's `AcousticEchoCanceler` is OEM-dependent and most production apps bypass it in favour
of WebRTC's AEC3.

---

## 5. Store review and law

**A foreground, user-initiated, visibly-indicated voice session is unremarkable to both
stores.** Almost everything else in this area is avoidable by not asking for it:

- **Do not request iOS background mic.** Apple rejects `UIBackgroundModes: audio` where the app
  cannot play audible content in the background, and has rejected background recording on
  appeal where the use case did not justify it. A tennis matchmaking app cannot justify it.
- Android needs a foreground service with `foregroundServiceType="microphone"` and a persistent
  notification.
- `NSMicrophoneUsageDescription` wording **is read by reviewers** — state that audio is sent to
  an AI service to run the conversation.
- **Wake words are a different product.** A hotword detector implies a genuinely always-on mic
  and invites scrutiny on both stores. **Use a button.**

**Privacy disclosure.** Google Play Data Safety explicitly covers "audio files," and data
handled by third-party SDKs and backends **counts as ours to declare** — streaming audio to
OpenAI or Google is **sharing**, not merely collection. Apple's label needs Audio Data declared
as linked to the user, since sessions are tied to an account. The privacy policy **must name the
processor**; "a third-party AI provider" is not sufficient under GDPR.

**Two-party consent.** CIPA carries **$5,000 per violation with a private right of action**, and
courts have held at the pleading stage that a vendor merely *being able* to train on content
supports a claim. **Our structural protection is that one user talking to a bot has no
intercepted second party.** Three consequences: **never build a mode where two players talk to
the agent together**; get logged in-app consent naming the provider; negotiate zero-retention
and no-training terms and keep the paper.

---

## 6. The UI-driving pattern

**No public Zillow engineering write-up exists** — searched, not found. The full report's
section 6 is explicitly labelled synthesis, drawn from OpenAI's `openai-realtime-agents` demo
and the generative-UI literature, where **AG-UI's event taxonomy** is the best available
checklist.

---

## 7. Recommendation

**(a) Pilot, 100 users: OpenAI `gpt-realtime-2.1-mini` over WebRTC.** Not because it is
cheapest — Gemini Live is — but because **WebRTC is the only transport that supplies AEC, jitter
buffering, packet-loss concealment, and mid-utterance network recovery without our writing
them**, and on mobile that plumbing is where the month goes. Ephemeral client secrets let the
phone connect directly; the Ktor backend only mints tokens. ~$26–100/month.

**(b) At scale: Gemini Live, or a self-orchestrated Pipecat/LiveKit pipeline.** The switch
trigger is **not** per-minute price — the spread is under 2× across sane options. It is
**control**: turn-taking tuning and context-cost containment. Reassess at ~1,500 users.

**(c) Adapter: abstract the session, not the socket.** Byte-level abstraction is the trap;
every provider differs in sample rate, framing, event names, and turn semantics, and a
byte-level adapter leaks all of it.

**Build the second adapter before it is needed.** Implement OpenAI, then implement Gemini Live
as a stub that runs the same integration tests. It takes a day, and it is the only way to know
the interface is provider-neutral rather than an OpenAI wrapper with different names. **Every
abstraction written against one implementation is a wrapper.**

---

## Flagged for re-verification before entering a financial model

- OpenAI's 10-in/20-out tokens-per-second — **every OpenAI $/min figure here depends on it**
- Gemini Live rates on `gemini-3.1-flash-live-preview` specifically — sources conflict, one
  claiming $1/1M in at 32 tok/s
- Nova 2 Sonic's token rate — absent, so its $/min is unknown
- Gemini's audio sample rates
- Cartesia pricing — sources spread $5–37/M chars
- Groq Whisper's $0.03/hr — traces to June 2024, and it is batch, not streaming
