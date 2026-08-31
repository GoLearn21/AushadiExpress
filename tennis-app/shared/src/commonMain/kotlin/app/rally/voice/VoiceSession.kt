package app.rally.voice

import kotlinx.coroutines.flow.Flow

/**
 * The entire contract the app is allowed to know about a voice provider.
 *
 * **Abstract the session, not the socket.** A byte-level adapter — "send bytes, get bytes" —
 * leaks every difference that actually varies between providers: sample rate, framing, event
 * names, turn semantics, reconnection model. Swapping providers under a byte-level adapter means
 * rewriting the app. Swapping under this one is a backend config change plus one implementation.
 *
 * Everything below the line stays inside an implementation and never reaches app code:
 * sample rate and framing (the app hands over device-native PCM; nothing above the adapter knows
 * 24 kHz exists) · transport (WebRTC for one provider, WebSocket for another) · turn-detection
 * strategy (server VAD, semantic VAD, end-of-turn models all collapse into [VoiceEvent.Turn]) ·
 * tool-schema translation · credential minting · reconnection and context replay · session-length
 * caps.
 *
 * What deliberately stays *outside*: the tool implementations and the action stack. Those are the
 * product. If they migrate into an adapter, we have built a framework instead of a swap.
 *
 * ## The constraint this interface exists to survive
 *
 * Realtime providers do not let a session return speech *and* structured data at once. Gemini's
 * Live API is explicit — a session is `TEXT` **or** `AUDIO`, never both, and native-audio models
 * support audio only. So the UI cannot be driven by a parallel data channel: it must be driven by
 * **tool calls**. And on at least one major provider those calls are **synchronous** — the model
 * will not resume speaking until [sendToolResult] returns.
 *
 * Two consequences the app must be built around, not discover:
 *
 *  1. **Every UI update costs conversational dead air.** A tool handler that touches the network
 *     is silence the user hears. Handlers should answer from cache and reconcile afterwards.
 *  2. **Transcripts are a separate stream from the audio**, which is why [VoiceEvent] carries
 *     [VoiceEvent.UserTranscript] and [VoiceEvent.AgentTranscript] as first-class events rather
 *     than assuming text falls out of the audio channel.
 *
 * The alternative design — a second, parallel non-Live pass over the same audio purely to extract
 * structured intent — is legitimate and materially more expensive. It is not what this interface
 * assumes, and adopting it would be an ADR, not an implementation detail.
 */
interface VoiceSession {

    /** Everything the session tells the app. Cold until [start]. */
    val events: Flow<VoiceEvent>

    suspend fun start(config: VoiceConfig)

    /** Answer a [VoiceEvent.ToolCall]. The payload is already-serialised JSON. */
    suspend fun sendToolResult(callId: ToolCallId, resultJson: String)

    /**
     * Steer the conversation out of band — without the user having said anything.
     *
     * This is how screen context reaches the model: when the user opens a match, the app injects
     * "the user is looking at the match against Jordan on Saturday", so "move it to Sunday"
     * resolves without the user naming anything.
     */
    suspend fun injectContext(text: String)

    /** The user cut the agent off deliberately. Distinct from the model detecting barge-in. */
    suspend fun interrupt()

    /**
     * Open or close the microphone gate.
     *
     * **This is the highest-leverage cost control in the system, and it is counter-intuitive.**
     * Speech-to-speech providers bill audio actually sent; streaming STT vendors bill connection
     * wall-clock. So gating cuts a realtime bill by 60–70% and cuts an STT bill by nothing —
     * which inverts the usual "pipelines are cheaper" advice at conversational duty cycles.
     * It is also a privacy control: a closed gate is a mic that is provably not transmitting.
     */
    suspend fun setMicGate(open: Boolean)

    suspend fun close()
}

/**
 * What the app hands a session at start.
 *
 * There is no provider field, no model name, no API key, and no URL. Those are the adapter's
 * business, and the credential is minted server-side — **no provider key ever ships in the app**,
 * so switching providers is a backend change.
 */
data class VoiceConfig(
    val tools: List<VoiceTool>,
    val instructions: String,
    val locale: String,
    /** Start with the mic closed. Default true: a session that opens hot is a privacy surprise. */
    val startGated: Boolean = true,
)

/**
 * A tool declared once, provider-neutrally. The adapter translates to whatever shape its provider
 * wants — the app never writes a provider-shaped declaration.
 *
 * [parametersJsonSchema] is a JSON Schema string rather than a typed structure because that is
 * genuinely the lowest common denominator across every provider, and inventing a typed schema DSL
 * here would be a second thing to maintain for no gain.
 */
data class VoiceTool(
    val name: String,
    val description: String,
    val parametersJsonSchema: String,
    /**
     * Whether invoking this tool changes committed state.
     *
     * Voice proposes; a tap commits. A tool marked [mutating] must route through the existing
     * `ProposedAction` + `commit_action` path rather than taking effect when the model asks for
     * it — a mis-heard "cancel" that goes straight through costs another player their Saturday.
     */
    val mutating: Boolean = false,
)

@kotlin.jvm.JvmInline
value class ToolCallId(val raw: String) {
    init { require(raw.isNotBlank()) { "tool call id cannot be blank" } }
}

enum class Speaker { USER, AGENT }

enum class TurnPhase { STARTED, SPEAKING, ENDED }

enum class ConnState { CONNECTING, LIVE, RECONNECTING, CLOSED }

/** Everything a session can tell the app. Sealed, so a new event type breaks every consumer. */
sealed interface VoiceEvent {

    /**
     * What the user said. **Always kept distinct from [AgentTranscript] and always surfaced.**
     * A voice UI that does not show what it heard gives the user no way to catch a mishearing
     * before it becomes an action.
     */
    data class UserTranscript(val text: String, val final: Boolean) : VoiceEvent

    /** What the agent said. Shown for accessibility and for the same auditability reason. */
    data class AgentTranscript(val text: String, val final: Boolean) : VoiceEvent

    /** Whose turn it is. Drives every affordance in the UI — the listening state, the waveform. */
    data class Turn(val who: Speaker, val phase: TurnPhase) : VoiceEvent

    /** The UI-driving channel: the model asking the app to do something. */
    data class ToolCall(val callId: ToolCallId, val name: String, val argsJson: String) : VoiceEvent

    /** Barge-in as an explicit event, never inferred from overlapping turn events. */
    data object Interrupted : VoiceEvent

    /**
     * Connection state, carrying the one distinction that matters to a user mid-sentence.
     *
     * [resumable] hides a real provider difference: some hand back a resumption handle, others
     * cannot resume at all. Resumable means "we are reconnecting, keep talking"; not resumable
     * means the session is gone and the app must say so rather than silently swallowing speech.
     */
    data class Connection(val state: ConnState, val resumable: Boolean) : VoiceEvent

    /**
     * Usage, **normalised to seconds — never vendor token units.**
     *
     * Token units differ per provider and per model, so exposing them would leak the provider
     * into every budget calculation and cost dashboard in the app.
     */
    data class Usage(val heardSec: Double, val spokenSec: Double) : VoiceEvent

    /** A typed failure. Sealed rather than an exception, so callers must handle it. */
    data class Failed(val error: VoiceError) : VoiceEvent
}

sealed interface VoiceError {
    /** The mic permission was refused or revoked. */
    data object MicrophoneDenied : VoiceError
    /** The backend would not mint a session credential. */
    data class CredentialRejected(val detail: String) : VoiceError
    /** The provider ended the session — hit a length cap, rate limit, or its own error. */
    data class ProviderEnded(val detail: String, val resumable: Boolean) : VoiceError
    /** The network went away and could not be recovered within the session. */
    data object NetworkLost : VoiceError
    /** The model asked for a tool the app never declared. Always a bug; never surfaced raw. */
    data class UnknownTool(val name: String) : VoiceError
}
