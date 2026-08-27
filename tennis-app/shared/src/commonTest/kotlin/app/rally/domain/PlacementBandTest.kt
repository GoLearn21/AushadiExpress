package app.rally.domain

import kotlin.test.Test
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class PlacementBandTest {

    @Test
    fun `a brand-new player is offered easier opponents, not harder ones`() {
        // The correction: the default band used to be -0.25/+0.75 from match one, which pointed
        // a rusty returner at stronger strangers on their first outing in public.
        val band = MatchIntent.BALANCED.bandFor(matchesCounted = 0)
        assertTrue(band.start < 0.0 && band.endInclusive <= 0.25)
        assertTrue(-band.start > band.endInclusive, "the placement band must lean easier, not harder")
    }

    @Test
    fun `the stretch is earned after the placement window`() {
        assertEquals(-0.75..0.25, MatchIntent.BALANCED.bandFor(2))
        assertEquals(-0.25..0.75, MatchIntent.BALANCED.bandFor(3))
    }

    @Test
    fun `hard exclusion is tighter while a player is being placed`() {
        assertTrue(hardExclusionGapFor(0) < hardExclusionGapFor(5))
        assertEquals(1.0, hardExclusionGapFor(0))
    }

    @Test
    fun `a player who explicitly wants a challenge still waits out the placement window`() {
        // Intent is a preference, not an override: the first three matches are how we learn their
        // level, and a self-declared level is the least reliable input we have.
        assertEquals(-0.75..0.25, MatchIntent.CHALLENGE_ME.bandFor(1))
        assertEquals(0.0..1.0, MatchIntent.CHALLENGE_ME.bandFor(3))
    }

    @Test
    fun `just a hit is exempt, because there is no result to be embarrassed by`() {
        assertEquals(-0.75..0.75, MatchIntent.JUST_A_HIT.bandFor(0))
    }

    // ---------------------------------------------------------------------------------------
    // The tests above assert bandFor and hardExclusionGapFor in isolation. That is exactly how
    // this bug survived: both helpers existed, both were tested, and MatchFit.score called
    // neither. The band that actually shipped was the -0.25/+0.75 default the placement window
    // was written to replace, so a rusty returner's first offer was systematically someone
    // stronger. These tests go through the matchmaker, which is the only thing that matters.
    // ---------------------------------------------------------------------------------------

    private fun candidate(ntrp: Double, travel: Int = 5): Candidate = Candidate(
        playerId = PlayerId("p-$ntrp-$travel"),
        rating = Glicko(mu = ntrp, phi = 0.30, sigma = 0.06),
        availability = PlayerAvailability(
            playerId = PlayerId("p-$ntrp-$travel"),
            hard = AvailabilityMask.of(10, 11, 12, 13),
            preferred = AvailabilityMask.of(10, 11, 12, 13),
            declaredSlots = 4,
            staleDays = 0,
        ),
        travelMinutes = travel,
        reliability = ReliabilityBand.RELIABLE,
        matchesTogetherLast90Days = 0,
    )

    private fun fit(seekerMatches: Int, opponent: Candidate) = MatchFit.score(
        seeker = candidate(3.5),
        candidate = opponent,
        intent = MatchIntent.BALANCED,
        requiredConsecutiveSlots = 2,
        maxTravelMinutes = 30,
        seekerMatchesCounted = seekerMatches,
    )

    @Test
    fun `inside the placement window the matchmaker prefers the easier opponent`() {
        val weaker = fit(0, candidate(3.0))!!.score
        val stronger = fit(0, candidate(4.0))!!.score
        assertTrue(weaker > stronger, "placement window ranked the stronger player first: weaker=$weaker stronger=$stronger")
    }

    @Test
    fun `after the placement window the stretch is restored`() {
        val weaker = fit(5, candidate(3.0))!!.score
        val stronger = fit(5, candidate(4.0))!!.score
        assertTrue(stronger > weaker, "after placement the mild stretch should win: weaker=$weaker stronger=$stronger")
    }

    @Test
    fun `the tightened exclusion actually excludes`() {
        // 1.5 NTRP above a new player: inside the standard 2.0 gap, outside the placement 1.0.
        assertNull(fit(0, candidate(5.0)), "a new player must not be offered a 1.5-tier gap")
        assertNotNull(fit(5, candidate(5.0)), "an established player may be")
    }

    @Test
    fun `a zero travel cap is refused rather than producing NaN`() {
        // 0.0/0 is NaN, NaN.coerceIn returns NaN, and Kotlin's total order sorts NaN ABOVE
        // every real score - so the single most broken candidate ranked best.
        assertFailsWith<IllegalArgumentException> {
            MatchFit.score(candidate(3.5), candidate(3.5), MatchIntent.BALANCED, 2, 0, 5)
        }
    }

    @Test
    fun `a feasible result always has proposable slots`() {
        val r = fit(5, candidate(3.5))
        assertNotNull(r)
        assertTrue(r.isFeasible && r.feasibleSlots.isNotEmpty())
    }
}
