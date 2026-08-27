package app.rally.domain

import kotlin.test.*

class MatchTest {

    private val report = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 3)), Outcome.Completed)

    private fun availability(vararg slots: Int, stale: Int = 0) = PlayerAvailability(
        playerId = PlayerId("p"), hard = AvailabilityMask.of(*slots),
        preferred = AvailabilityMask.of(*slots), declaredSlots = slots.size, staleDays = stale,
    )


    @Test fun `both sides must confirm before a match can start`() {
        var s = MatchState.Scheduled(0, VenueId("v"), emptySet())
        assertNull(MatchTransitions.start(s, 1))
        s = MatchTransitions.confirm(s, Side.A)
        assertNull(MatchTransitions.start(s, 1))
        s = MatchTransitions.confirm(s, Side.B)
        assertIs<MatchState.AwaitingResult>(MatchTransitions.start(s, 1))
    }

    @Test fun `a player cannot countersign their own submission`() {
        val awaiting = MatchState.AwaitingCountersign(report, ScoreCanonicalizer.digest(report), Side.A, 100)
        assertNull(MatchTransitions.submitResult(awaiting, report, by = Side.A, nowEpochSeconds = 1))
    }

    @Test fun `matching submissions confirm the result`() {
        val awaiting = MatchState.AwaitingCountersign(report, ScoreCanonicalizer.digest(report), Side.A, 100)
        val next = MatchTransitions.submitResult(awaiting, report, by = Side.B, nowEpochSeconds = 1)
        val confirmed = assertIs<MatchState.Confirmed>(next)
        assertEquals(Resolution.MUTUAL, confirmed.result.resolution)
        assertEquals(1.0, confirmed.result.ratingWeight)
    }

    @Test fun `conflicting submissions freeze into a dispute`() {
        val awaiting = MatchState.AwaitingCountersign(report, ScoreCanonicalizer.digest(report), Side.A, 100)
        val other = ScoreReport(listOf(SetScore(4, 6), SetScore(3, 6)), Outcome.Completed)
        assertIs<MatchState.Disputed>(MatchTransitions.submitResult(awaiting, other, Side.B, 1))
    }

    @Test fun `auto confirm only fires after the deadline and keeps full rating weight`() {
        val awaiting = MatchState.AwaitingCountersign(report, ScoreCanonicalizer.digest(report), Side.A, deadlineEpochSeconds = 100)
        assertNull(MatchTransitions.autoConfirm(awaiting, 99))
        val confirmed = assertIs<MatchState.Confirmed>(MatchTransitions.autoConfirm(awaiting, 100))
        assertEquals(Resolution.AUTO_CONFIRMED, confirmed.result.resolution)
        assertEquals(1.0, confirmed.result.ratingWeight, "silence must not punish the submitter")
    }

    @Test fun `a no show carries zero rating weight but still counts for reliability`() {
        val r = MatchResult(
            ScoreReport(emptyList(), Outcome.Walkover(absent = Side.B)),
            Resolution.FORFEIT_NO_SHOW, 0, "v1",
        )
        assertEquals(0.0, r.ratingWeight, "a no-show is not tennis and must not move a rating")
        assertTrue(r.countsTowardReliability)
    }

    @Test fun `a blowout mismatch is excluded rather than ranked low`() {
        val me = Candidate(PlayerId("me"), Glicko(3.5, 0.3, 0.06), availability(10, 11, 12), 5, ReliabilityBand.RELIABLE, 0)
        val farTooStrong = Candidate(PlayerId("x"), Glicko(6.0, 0.3, 0.06), availability(10, 11, 12), 5, ReliabilityBand.RELIABLE, 0)
        assertNull(MatchFit.score(me, farTooStrong, MatchIntent.BALANCED, 2, 20))
    }

    @Test fun `no shared availability means no match regardless of level`() {
        val me = Candidate(PlayerId("me"), Glicko(3.5, 0.3, 0.06), availability(10, 11), 5, ReliabilityBand.RELIABLE, 0)
        val perfectLevel = Candidate(PlayerId("x"), Glicko(3.5, 0.3, 0.06), availability(400, 401), 5, ReliabilityBand.RELIABLE, 0)
        assertNull(MatchFit.score(me, perfectLevel, MatchIntent.BALANCED, 2, 20))
    }

    @Test fun `intent shifts which opponent scores best`() {
        val me = Candidate(PlayerId("me"), Glicko(3.5, 0.3, 0.06), availability(10, 11, 12), 5, ReliabilityBand.RELIABLE, 0)
        val stronger = Candidate(PlayerId("s"), Glicko(4.1, 0.3, 0.06), availability(10, 11, 12), 5, ReliabilityBand.RELIABLE, 0)
        val gentler = Candidate(PlayerId("g"), Glicko(3.1, 0.3, 0.06), availability(10, 11, 12), 5, ReliabilityBand.RELIABLE, 0)

        val challenge = MatchFit.score(me, stronger, MatchIntent.CHALLENGE_ME, 2, 20)!!
        val friendlyForStronger = MatchFit.score(me, stronger, MatchIntent.KEEP_IT_FRIENDLY, 2, 20)!!
        assertTrue(challenge.score > friendlyForStronger.score, "a stretch opponent must rank higher under CHALLENGE_ME")

        val friendlyForGentler = MatchFit.score(me, gentler, MatchIntent.KEEP_IT_FRIENDLY, 2, 20)!!
        val challengeForGentler = MatchFit.score(me, gentler, MatchIntent.CHALLENGE_ME, 2, 20)!!
        assertTrue(friendlyForGentler.score > challengeForGentler.score, "a gentler opponent must rank higher under KEEP_IT_FRIENDLY")
    }

    @Test fun `fit surfaces reasons and never a bare percentage`() {
        val me = Candidate(PlayerId("me"), Glicko(3.5, 0.3, 0.06), availability(10, 11, 12), 5, ReliabilityBand.RELIABLE, 0)
        val them = Candidate(PlayerId("t"), Glicko(3.6, 0.3, 0.06), availability(10, 11, 12), 8, ReliabilityBand.RELIABLE, 0)
        val fit = MatchFit.score(me, them, MatchIntent.BALANCED, 2, 20)!!
        assertTrue(fit.reasons.isNotEmpty())
        assertTrue(fit.isFeasible)
        assertTrue(fit.reasons.none { it.text.contains('%') }, "Phase 1 must not surface a fit percentage")
    }

    @Test fun `stale availability lowers the score`() {
        val me = Candidate(PlayerId("me"), Glicko(3.5, 0.3, 0.06), availability(10, 11, 12), 5, ReliabilityBand.RELIABLE, 0)
        val fresh = Candidate(PlayerId("f"), Glicko(3.5, 0.3, 0.06), availability(10, 11, 12, stale = 0), 5, ReliabilityBand.RELIABLE, 0)
        val stale = Candidate(PlayerId("s"), Glicko(3.5, 0.3, 0.06), availability(10, 11, 12, stale = 30), 5, ReliabilityBand.RELIABLE, 0)
        assertTrue(MatchFit.score(me, fresh, MatchIntent.BALANCED, 2, 20)!!.score >
                   MatchFit.score(me, stale, MatchIntent.BALANCED, 2, 20)!!.score)
    }

    @Test fun `a new player is not penalised for having no history`() {
        assertTrue(ReliabilityBand.BUILDING_HISTORY.weight >= 0.85,
            "new players must not be throttled by unknown reliability")
    }
}
