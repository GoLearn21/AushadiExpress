# Research Stream 13 — Verifying the Gemini Voice Recommendation

**Date:** 2026-08-27
**Claim under test:** build the voice feature on **Gemini 1.5 Flash**, for "near-instantaneous
multimodal processing (it can ingest audio directly and output structured JSON)," suitable for a
hands-free bidirectional conversation that also drives the UI.

**Verdict: REFUTED on both counts. The recommendation is not suboptimal — it is unbuildable as
written.**

## Access note

Every Google documentation domain was egress-blocked: `ai.google.dev`, `blog.google`,
`cloud.google.com`, `firebase.google.com`, `developers.googleblog.com`, `deepmind.google`.
One primary channel worked: **`github.com/google-gemini/gemini-skills`**, Google's own maintained
skill repository, read via raw GitHub. It carries most of the load below.

---

## 1. Gemini 1.5 Flash has been retired for roughly eleven months

| Event | Date | Confidence |
|---|---|---|
| Announced at Google I/O | 2024-05-14 | SECONDARY |
| GA | 2024-06 | SECONDARY |
| **Closed to new projects** | **2025-04-29** | SECONDARY |
| **Retired; returns errors** | **2025-09-24** | SECONDARY, multiply corroborated |

The April 2025 cutoff answers the question directly: from that date the 1.5 models were *"not
available in projects with no prior usage of these models, including new projects."* **A greenfield
feature could never have used it, even before retirement.**

**PRIMARY confirmation**, verbatim from Google's own `gemini-api-dev` skill:

> Models like `gemini-2.5-*`, `gemini-2.0-*`, `gemini-1.5-*` are legacy and deprecated. Never use
> them.

with the guardrail: *"If a user asks for a deprecated model, use `gemini-3.7-flash` instead and
note the substitution."* **Google now ships an agent skill whose specific job is preventing this
mistake.**

## 2. It was never a bidirectional model — the category postdates it

The first Live model was `gemini-2.0-flash-live-001`. **There has never been a 1.5-series Live
model.** So this is not a wrong tuning choice; it is a category error.

**Non-Live (what 1.5 Flash actually did):** upload or inline-base64 an audio blob as a content
part, in one HTTPS request. The model reads the whole clip and returns one complete response. No
stream in, no partial commitment, no interruption. **The user must stop talking before anything
begins.** This is *transcribe-then-answer*.

**Live API:** a persistent WebSocket. Audio in as raw PCM, 16-bit mono little-endian at 16 kHz;
audio out at 24 kHz. Hybrid VAD with an `audioStreamEnd` signal for turn-taking. Interruption
signals the client handles by clearing its playback queue — that is barge-in. Tool calls
mid-conversation.

**The recommendation collapses "accepts audio" into "converses." Those are different products.**

## 3. The corrected choices

**Realtime voice — our prior report was correct.** `gemini-3.1-flash-live-preview` is verified
(PRIMARY): *"Optimized for low-latency, real-time dialogue. Native audio output, thinking (via
`thinkingLevel`). 128k context. **This is the recommended model for all Live API use cases.**"*
Status: preview; no GA variant found. Siblings: `gemini-3.5-transcribe-live`,
`gemini-3.5-live-translate-preview`.

**Retired Live models, shutdown 2025-12-09:** `gemini-2.5-flash-native-audio-preview-12-2025`,
`gemini-live-2.5-flash-preview`, `gemini-2.0-flash-live-001`. Any document recommending these is
stale.

**Audio-blob → JSON:** `gemini-3.7-flash` is Google's own default substitute. Cheaper:
`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`. Pure STT with diarization: `gemini-3.5-transcribe`.

**Pricing: UNVERIFIED — do not quote a number.** Third-party aggregators contradicted each other
within a single source. Audio tokens bill at a different, higher rate than text on every tier, so
no headline figure is what you would actually pay. Get it from the console.

## 4. The structured-output mechanism changed, and this is what will bite

`response_mime_type` + `responseSchema` is **legacy**. Google replaced `generateContent` with the
**Interactions API** (GA around June 2026; `generateContent` still supported but labelled legacy).

A **May 2026 breaking change removed `response_mime_type`**, consolidating into a polymorphic
`response_format`:

```python
response_format={"type": "text", "mime_type": "application/json", "schema": Recipe.model_json_schema()}
```

`mime_type` survives but is *nested*; `responseSchema` became `schema`. The SDK was also renamed to
`google-genai` / `@google/genai`. **Code written against the old shape is wrong at the import line.**

### The real architectural blocker

Two PRIMARY constraints on the Live API, and together they break the proposed UX:

> Only `TEXT` **or** `AUDIO` per session, not both. Native audio models only support audio.

> Async function calling — Not yet supported; function calling is synchronous only. The model will
> not start responding until you've sent the tool response.

Structured output is absent from the Live API documentation entirely.

**So an agent that talks back *and* updates the UI from structured data cannot get both from one
Live session.** UI updates must come through **function calling**, and those calls are
**synchronous — every UI update costs conversational dead air.** The alternative is a second,
parallel non-Live extraction pass over the same audio, which is a legitimate design and a more
expensive one that nobody has costed.

This is the constraint the `VoiceSession` adapter must be designed around, and it is why the
adapter abstracts a *session with tool calls*, not a socket.

## 5. Latency: 1.5 seconds is form-filling, not conversation — and Live does not automatically fix it

PRIMARY: the Live API defaults to `thinkingLevel: minimal` explicitly for lowest latency.

SECONDARY (a TTFT benchmark published 2026-08-30, plus vendor reviews): time-to-first-audio runs
**300 ms to 2.3 s depending on thinking level**, with `gemini-3.1-flash-live` measured at
**0.96 s (minimal) to 2.99 s (high)**. Native-audio tokenisation on TPU adds 100–200 ms. Vendor
latency claims generally exclude network, and cross-region routing can dominate.

Against the ~700 ms dispreferred-turn threshold from `research/11`:

- **1.5 s is not a conversation.** It is roughly 2× the threshold, and it is a *floor*: it assumes
  the user has already stopped speaking, and excludes upload and render.
- **But the Live API does not automatically buy sub-700 ms either.** At minimal thinking, ~0.96 s
  TTFA still lands above it.

**What the Live API actually buys is different and arguably more important:** barge-in, VAD-driven
turn boundaries, and streamed output — so the *perceived* gap is time-to-first-audio-byte rather
than time-to-complete-response, and the user can interrupt. That is what makes it feel
conversational when the raw number is not 700 ms.

**Do not over-correct.** The honest product may be *"hands-free with fast confirmation"*, with
true conversation as a stretch. The levers are `thinkingLevel: minimal`, region co-location, and
streaming playback.

---

## Could not verify

- No direct read of Google's deprecations or pricing pages. The 2025-04-29 and 2025-09-24 dates
  are SECONDARY, multiply corroborated; the *direction* is PRIMARY-confirmed.
- All pricing UNVERIFIED; third-party sources conflict.
- GA-vs-preview for `gemini-3.7-flash` is inferred from its being the recommended substitute.
- Live latency figures are SECONDARY benchmarks; no Google-published SLA was found.
