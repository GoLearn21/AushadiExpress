package app.rally.voice

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertIs
import kotlin.test.assertTrue

class VoiceRouterTest {

    private val readScore = VoiceTool("get_next_match", "", "{}", mutating = false)
    private val cancel = VoiceTool("cancel_match", "", "{}", mutating = true)
    private val router = VoiceRouter(listOf(readScore, cancel))

    private fun call(name: String) =
        VoiceEvent.ToolCall(ToolCallId("c1"), name, "{}")

    private val neverStage: (VoiceEvent.ToolCall) -> Pair<Claim, String>? =
        { throw AssertionError("must not stage a non-mutating tool") }
    private val neverRead: (VoiceEvent.ToolCall) -> List<Claim> =
        { throw AssertionError("must not read a mutating tool") }

    @Test
    fun `a mutating tool is proposed, never executed`() {
        // The safety property of the whole voice surface: a mis-heard "cancel" must not go
        // through. It becomes a staged action with a token, awaiting a tap.
        val action = router.route(
            call("cancel_match"),
            stage = { Claim("Cancel Saturday with {who}?", mapOf("who" to "Jordan"), EvidenceTier.FACT) to "tok-1" },
            read = neverRead,
        )
        val proposed = assertIs<VoiceAction.Proposed>(action)
        assertEquals("tok-1", proposed.actionToken)
    }

    @Test
    fun `a read-only tool is answered directly`() {
        val action = router.route(
            call("get_next_match"),
            stage = neverStage,
            read = { listOf(Claim("Saturday at 9 with {who}", mapOf("who" to "Jordan"), EvidenceTier.FACT)) },
        )
        assertIs<VoiceAction.Answered>(action)
    }

    @Test
    fun `an undeclared tool is refused, not improvised`() {
        val action = router.route(call("delete_account"), stage = neverStage, read = neverRead)
        val refused = assertIs<VoiceAction.Refused>(action)
        assertIs<VoiceError.UnknownTool>(refused.reason)
    }

    @Test
    fun `the app may decline to stage an action`() {
        val action = router.route(call("cancel_match"), stage = { null }, read = neverRead)
        assertIs<VoiceAction.Refused>(action)
    }

    @Test
    fun `duplicate tool names are rejected at construction`() {
        // Ambiguous routing on a mutating tool is a security bug, so it fails loudly and early.
        assertFailsWith<IllegalArgumentException> {
            VoiceRouter(listOf(readScore, readScore.copy(mutating = true)))
        }
    }
}

class ClaimSpeechTest {

    @Test
    fun `with no claim the agent says it does not know`() {
        // The single most important behaviour here. An agent with nothing true to say must say
        // nothing rather than produce a plausible number.
        assertEquals(ClaimSpeech.DONT_KNOW, ClaimSpeech.speak(emptyList()))
    }

    @Test
    fun `a guess is spoken as a guess`() {
        val spoken = ClaimSpeech.speak(
            listOf(Claim("about a 3.5", emptyMap(), EvidenceTier.INFERRED)),
        )
        assertTrue(spoken.startsWith("My guess is"), spoken)
    }

    @Test
    fun `a player's claim is attributed to the player`() {
        val spoken = ClaimSpeech.speak(
            listOf(Claim("they play twice a week", emptyMap(), EvidenceTier.PLAYER_REPORT)),
        )
        assertTrue(spoken.startsWith("They said"), spoken)
    }

    @Test
    fun `facts and computed values are spoken plainly`() {
        val fact = ClaimSpeech.speak(listOf(Claim("6-4, 3-6, 10-7", emptyMap(), EvidenceTier.FACT)))
        assertEquals("6-4, 3-6, 10-7", fact)
    }

    @Test
    fun `params are substituted`() {
        val spoken = ClaimSpeech.speak(
            listOf(Claim("{day} at {time}", mapOf("day" to "Saturday", "time" to "9am"), EvidenceTier.FACT)),
        )
        assertEquals("Saturday at 9am", spoken)
    }

    @Test
    fun `an unfilled placeholder is detectable, because speaking one is a bug`() {
        val bad = Claim("{day} at {time}", mapOf("day" to "Saturday"), EvidenceTier.FACT)
        assertTrue(!ClaimSpeech.isWellFormed(bad))
        assertTrue(ClaimSpeech.isWellFormed(bad.copy(params = bad.params + ("time" to "9am"))))
    }
}
