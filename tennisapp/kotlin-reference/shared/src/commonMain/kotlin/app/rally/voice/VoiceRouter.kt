package app.rally.voice

/**
 * A statement the agent is permitted to say, rendered from a server-computed template.
 *
 * The agent is a **selector over server-computed statements, never a generator of them.** Voice
 * makes fabrication considerably more dangerous than text: it is transient, there is no
 * screenshot, and a spoken number carries more authority than a rendered one. So the audio path
 * inherits the same evidence discipline as the screen — if no claim exists for something, the
 * correct behaviour is to say so, not to produce a plausible number.
 */
data class Claim(val template: String, val params: Map<String, String>, val tier: EvidenceTier)

/** Where a claim's authority comes from. Spoken confidence must track this, not fluency. */
enum class EvidenceTier {
    /** Recorded fact: a score both players attested, a slot the player declared. */
    FACT,

    /** A player said it. True that they said it; not necessarily true. */
    PLAYER_REPORT,

    /** Computed by us from facts — a rating, a reliability band, a standings position. */
    MODELED,

    /** A guess. **May never be spoken as though it were any of the above.** */
    INFERRED,
}

/**
 * What the app decided to do about a tool call.
 *
 * Sealed, because the whole point is that a caller cannot accidentally treat a proposal as a
 * commitment: the two are different types and the compiler enforces the branch.
 */
sealed interface VoiceAction {

    /** A read. Safe to satisfy immediately; the result is spoken. */
    data class Answered(val callId: ToolCallId, val claims: List<Claim>) : VoiceAction

    /**
     * A state change the agent asked for and the app has staged but **not committed.**
     *
     * The user confirms with a tap. This is not a UX apology — it is the same
     * `ProposedAction` + `commit_action` path the GUI's confirm flows already use, so the voice
     * surface inherits a hardened commit path rather than opening a second one.
     */
    data class Proposed(
        val callId: ToolCallId,
        val summary: Claim,
        val actionToken: String,
    ) : VoiceAction

    /** The model asked for something that does not exist. A bug, and never spoken verbatim. */
    data class Refused(val callId: ToolCallId, val reason: VoiceError) : VoiceAction
}

/**
 * Decides what happens when the model asks for a tool.
 *
 * Deliberately pure and free of I/O so the policy — which is the security-relevant part — is
 * testable without a network, a provider, or a microphone.
 */
class VoiceRouter(private val declared: List<VoiceTool>) {

    private val byName = declared.associateBy { it.name }

    init {
        require(declared.map { it.name }.toSet().size == declared.size) {
            "duplicate tool names would make routing ambiguous"
        }
    }

    /**
     * @param stage called only for a mutating tool, to stage the action and mint its token.
     *   Returning null means the app declined to stage it.
     * @param read called only for a non-mutating tool, returning the claims to speak.
     */
    fun route(
        call: VoiceEvent.ToolCall,
        stage: (VoiceEvent.ToolCall) -> Pair<Claim, String>?,
        read: (VoiceEvent.ToolCall) -> List<Claim>,
    ): VoiceAction {
        val tool = byName[call.name]
            ?: return VoiceAction.Refused(call.callId, VoiceError.UnknownTool(call.name))

        return if (tool.mutating) {
            val staged = stage(call)
                ?: return VoiceAction.Refused(
                    call.callId,
                    VoiceError.ProviderEnded("action declined", resumable = true),
                )
            VoiceAction.Proposed(call.callId, staged.first, staged.second)
        } else {
            VoiceAction.Answered(call.callId, read(call))
        }
    }
}

/**
 * Renders claims into speakable text.
 *
 * The filter exists because the model is not the last line of defence — this is. An [INFERRED]
 * claim is downgraded in wording rather than dropped, because silently omitting an answer reads
 * as a bug to the user while hedged wording reads as honesty.
 */
object ClaimSpeech {

    fun speak(claims: List<Claim>): String =
        if (claims.isEmpty()) DONT_KNOW
        else claims.joinToString(" ") { render(it) }

    /** Said when no claim supports an answer. Saying this is always better than improvising one. */
    const val DONT_KNOW = "I don't have that."

    private fun render(claim: Claim): String {
        val filled = claim.params.entries.fold(claim.template) { acc, (k, v) ->
            acc.replace("{$k}", v)
        }
        return when (claim.tier) {
            EvidenceTier.FACT, EvidenceTier.MODELED -> filled
            EvidenceTier.PLAYER_REPORT -> "They said $filled"
            EvidenceTier.INFERRED -> "My guess is $filled"
        }
    }

    /** True if a template still has unfilled placeholders — always a bug, never spoken. */
    fun isWellFormed(claim: Claim): Boolean =
        !Regex("\\{[a-zA-Z_][a-zA-Z0-9_]*\\}").containsMatchIn(
            claim.params.entries.fold(claim.template) { acc, (k, v) -> acc.replace("{$k}", v) },
        )
}
