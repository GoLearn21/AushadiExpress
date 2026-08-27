package app.rally.domain

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertTrue

class MatchTest {

    private val match = MatchId("m-0001")

    private fun submit(state: MatchState, r: ScoreReport, by: Side, now: Long = 100) =
        MatchTransitions.submitResult(match, state, r, by, now)

    private fun awaiting(r: ScoreReport, by: Side, now: Long = 100): MatchState.AwaitingCountersign =
        assertIs<MatchState.AwaitingCountersign>(
            assertIs<Either.Right<MatchState>>(submit(MatchState.AwaitingResult(0), r, by, now)).value
        )

    private val straightSets = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 3)), Outcome.Completed)

    @Test
    fun `a result awaits the opponent's countersignature`() {
        val s = awaiting(straightSets, Side.A)
        assertEquals(Side.A, s.submittedBy)
        assertEquals(CanonVersion.V1, s.digest.canon)
    }

    @Test
    fun `a player cannot countersign their own submission`() {
        val s = awaiting(straightSets, Side.A)
        val err = assertIs<Either.Left<TransitionError>>(submit(s, straightSets, Side.A))
        val attest = assertIs<TransitionError.Attest>(err.error)
        assertIs<AttestError.AlreadyAttested>(attest.error)
    }

    @Test
    fun `matching reports confirm the match`() {
        val s = awaiting(straightSets, Side.A)
        val next = assertIs<Either.Right<MatchState>>(submit(s, straightSets, Side.B)).value
        val confirmed = assertIs<MatchState.Confirmed>(next)
        assertEquals(Resolution.MUTUAL, confirmed.result.resolution)
        assertEquals(1.0, confirmed.result.ratingWeight)
    }

    @Test
    fun `differing reports freeze into a dispute`() {
        val s = awaiting(straightSets, Side.A)
        // Not the mirror - that is a frame bug, tested separately. This is B claiming a
        // three-set win where A recorded a straight-sets loss for them.
        val different = ScoreReport(
            listOf(SetScore(4, 6), SetScore(6, 3), SetScore(4, 6)), Outcome.Completed,
        )
        val next = assertIs<Either.Right<MatchState>>(submit(s, different, Side.B)).value
        assertIs<MatchState.Disputed>(next)
    }

    @Test
    fun `a wrong-frame submission is a typed error, not a dispute`() {
        // Both players are honest; one client simply failed to normalise to match-absolute sides.
        // Reporting that as a disagreement is the exact failure the protocol exists to prevent.
        val s = awaiting(straightSets, Side.A)
        val mirrored = ScoreCanonicalizer.mirror(straightSets)
        val err = assertIs<Either.Left<TransitionError>>(submit(s, mirrored, Side.B))
        assertEquals(AttestError.WrongFrame, assertIs<TransitionError.Attest>(err.error).error)
    }

    // ---- resolution is derived from the outcome, not assumed ------------------------------
    // An earlier version hard-coded MUTUAL for every agreed result, so a walkover both players
    // agreed on carried full rating weight: a rating gain against an opponent who never arrived.
    // The old test built a MatchResult by hand and asserted the weight table back to itself,
    // which is a test of the `when`, not of the transition that chooses the resolution.

    @Test
    fun `an agreed walkover carries no rating weight`() {
        val wo = ScoreReport(emptyList(), Outcome.Walkover(absent = Side.B))
        val s = awaiting(wo, Side.A)
        val confirmed = assertIs<MatchState.Confirmed>(
            assertIs<Either.Right<MatchState>>(submit(s, wo, Side.B)).value
        )
        assertEquals(Resolution.WALKOVER, confirmed.result.resolution)
        assertEquals(0.0, confirmed.result.ratingWeight, "a match nobody played cannot move a rating")
        assertTrue(confirmed.result.countsTowardReliability, "but it must still cost reliability")
    }

    @Test
    fun `a retirement is a played match and does count`() {
        val ret = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 2)), Outcome.Retired(by = Side.B))
        val s = awaiting(ret, Side.A)
        val confirmed = assertIs<MatchState.Confirmed>(
            assertIs<Either.Right<MatchState>>(submit(s, ret, Side.B)).value
        )
        assertEquals(1.0, confirmed.result.ratingWeight)
    }

    @Test
    fun `a double default counts for nothing at all`() {
        val dd = ScoreReport(emptyList(), Outcome.DoubleDefault)
        val s = awaiting(dd, Side.A)
        val confirmed = assertIs<MatchState.Confirmed>(
            assertIs<Either.Right<MatchState>>(submit(s, dd, Side.B)).value
        )
        assertEquals(Resolution.VOIDED, confirmed.result.resolution)
        assertEquals(0.0, confirmed.result.ratingWeight)
        assertTrue(!confirmed.result.countsTowardReliability)
    }

    @Test
    fun `auto-confirm still respects the outcome`() {
        val wo = ScoreReport(emptyList(), Outcome.Walkover(absent = Side.B))
        val s = awaiting(wo, Side.A, now = 0)
        val confirmed = assertIs<MatchState.Confirmed>(
            assertIs<Either.Right<MatchState>>(
                MatchTransitions.autoConfirm(s, nowEpochSeconds = s.deadlineEpochSeconds)
            ).value
        )
        // Silence must not punish the submitter, but it also must not launder a walkover into a
        // rated result just because nobody objected.
        assertEquals(Resolution.WALKOVER, confirmed.result.resolution)
        assertEquals(0.0, confirmed.result.ratingWeight)
    }

    @Test
    fun `auto-confirm before the deadline is refused, and says why`() {
        val s = awaiting(straightSets, Side.A, now = 0)
        val err = assertIs<Either.Left<TransitionError>>(MatchTransitions.autoConfirm(s, 1))
        assertIs<TransitionError.DeadlineNotReached>(err.error)
    }

    @Test
    fun `an uncontested completed result auto-confirms with full weight`() {
        val s = awaiting(straightSets, Side.A, now = 0)
        val confirmed = assertIs<MatchState.Confirmed>(
            assertIs<Either.Right<MatchState>>(
                MatchTransitions.autoConfirm(s, s.deadlineEpochSeconds)
            ).value
        )
        assertEquals(Resolution.AUTO_CONFIRMED, confirmed.result.resolution)
        assertEquals(1.0, confirmed.result.ratingWeight)
    }

    @Test
    fun `refusals are distinguishable from one another`() {
        // The operator console has to tell a player which refusal it was, so "not permitted",
        // "not your turn" and "already terminal" cannot all be the same null.
        val scheduled = MatchState.Scheduled(0, VenueId("v1"), setOf(Side.A))
        assertIs<TransitionError.NotYetStarted>(
            assertIs<Either.Left<TransitionError>>(submit(scheduled, straightSets, Side.A)).error
        )
        assertIs<TransitionError.WrongState>(
            assertIs<Either.Left<TransitionError>>(
                submit(MatchState.Proposed(0), straightSets, Side.A)
            ).error
        )
        assertIs<TransitionError.NotYetConfirmed>(
            assertIs<Either.Left<TransitionError>>(MatchTransitions.start(scheduled, 1)).error
        )
    }

    @Test
    fun `a match starts once both sides confirm`() {
        var s = MatchState.Scheduled(0, VenueId("v1"), emptySet())
        s = MatchTransitions.confirm(s, Side.A)
        s = MatchTransitions.confirm(s, Side.A)   // idempotent
        assertIs<Either.Left<TransitionError>>(MatchTransitions.start(s, 1))
        s = MatchTransitions.confirm(s, Side.B)
        assertIs<MatchState.AwaitingResult>(
            assertIs<Either.Right<MatchState>>(MatchTransitions.start(s, 1)).value
        )
    }
}
