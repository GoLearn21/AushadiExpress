package app.rally.domain

import kotlin.test.Test
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
}
