package app.rally.domain

import kotlin.math.abs
import kotlin.test.*

class RatingTest {

    private val policy = DisplayPolicy.CONSERVATIVE_FALLBACK

    @Test fun `a new player is never shown a point estimate`() {
        val seed = RatingBand.SOLID.seed()
        val d = seed.display(matchesCounted = 3, policy = policy)
        assertIs<RatingDisplay.Provisional>(d, "while phi is wide the UI must show a range only")
    }

    @Test fun `an established player gets a point estimate with its interval`() {
        val settled = Glicko(mu = 3.5, phi = 0.2, sigma = 0.06)
        val d = settled.display(matchesCounted = 20, policy = policy)
        assertIs<RatingDisplay.Established>(d)
        assertTrue(d.range.start < d.value && d.value < d.range.endInclusive)
    }

    @Test fun `the display gate is confidence, not a match count`() {
        // The correction: an earlier draft hid the number below 5 counted matches, a constant
        // inherited from a competitor's marketing copy. Our own measurements put Glicko RD near
        // 144 at 5 matches -- roughly a full tier of uncertainty. Two players can have the same
        // match count and very different confidence, and the display must follow the confidence.
        val confidentAtFour = Glicko(mu = 3.5, phi = 0.15, sigma = 0.06)
        val vagueAtThirty = Glicko(mu = 3.5, phi = 0.55, sigma = 0.06)
        assertIs<RatingDisplay.Established>(confidentAtFour.display(4, policy))
        assertIs<RatingDisplay.Provisional>(vagueAtThirty.display(30, policy))
    }

    @Test fun `the display policy is data, so it can be tuned without a release`() {
        val vague = Glicko(mu = 3.5, phi = 0.5, sigma = 0.06)
        assertIs<RatingDisplay.Provisional>(vague.display(10, DisplayPolicy(0.30, 5)))
        assertIs<RatingDisplay.Established>(vague.display(10, DisplayPolicy(0.60, 5)))
    }

    @Test fun `beating a stronger opponent raises the rating`() {
        val me = Glicko(3.5, 0.5, 0.06)
        val stronger = Glicko(4.0, 0.3, 0.06)
        val after = Glicko2.update(me, listOf(Glicko2.Opponent(stronger, score = 1.0)))
        assertTrue(after.mu > me.mu, "expected rating to rise, was ${after.mu}")
    }

    @Test fun `losing to a weaker opponent lowers the rating`() {
        val me = Glicko(3.5, 0.5, 0.06)
        val weaker = Glicko(3.0, 0.3, 0.06)
        val after = Glicko2.update(me, listOf(Glicko2.Opponent(weaker, score = 0.0)))
        assertTrue(after.mu < me.mu)
    }

    @Test fun `playing narrows uncertainty`() {
        val me = RatingBand.SOLID.seed()
        val opp = Glicko(3.5, 0.3, 0.06)
        val after = Glicko2.update(me, List(4) { Glicko2.Opponent(opp, if (it % 2 == 0) 1.0 else 0.0) })
        assertTrue(after.phi < me.phi, "phi should shrink with evidence: ${me.phi} -> ${after.phi}")
    }

    @Test fun `results within a rating period are order independent`() {
        // ADR-023: this is why late-arriving offline results are not a correctness hazard.
        val me = Glicko(3.5, 0.4, 0.06)
        val a = Glicko2.Opponent(Glicko(3.8, 0.3, 0.06), 1.0)
        val b = Glicko2.Opponent(Glicko(3.2, 0.35, 0.06), 0.0)
        val forward = Glicko2.update(me, listOf(a, b))
        val reversed = Glicko2.update(me, listOf(b, a))
        assertTrue(abs(forward.mu - reversed.mu) < 1e-9, "order changed mu")
        assertTrue(abs(forward.phi - reversed.phi) < 1e-9, "order changed phi")
    }

    @Test fun `inactivity widens uncertainty without moving the rating`() {
        val me = Glicko(3.5, 0.3, 0.06)
        val after = Glicko2.update(me, emptyList())
        assertEquals(me.mu, after.mu)
        assertTrue(after.phi > me.phi)
    }

    @Test fun `every band has player facing copy`() {
        RatingBand.entries.forEach {
            assertTrue(it.blurb.isNotBlank() && it.label.isNotBlank(), "${it.name} needs copy")
        }
    }
}

/**
 * Tests that cross the update/display boundary and anchor magnitudes to an independent source.
 *
 * Every assertion in [RatingTest] is either directional (`after.mu > me.mu`) or a display check on
 * a hand-built [Glicko]. Nothing composed the two, and nothing pinned a number to anything
 * outside this file. That is precisely how an inverted scale conversion survived: the two
 * conversions were consistent inverses, so every directional test passed while the implied mapping
 * was roughly 7,500 Elo per NTRP point.
 */
class RatingScaleTest {

    private val policy = DisplayPolicy.CONSERVATIVE_FALLBACK

    @Test
    fun `Glickman's published worked example reproduces`() {
        // The only assertion in this suite anchored outside this codebase. From Glickman's
        // "Example of the Glicko-2 system": a 1500/200/0.06 player against 1400/30 (win),
        // 1550/100 (loss), 1700/300 (loss) yields r'=1464.06, RD'=151.52, sigma'=0.05999.
        fun elo(r: Double) = (r - 1500.0) / 350.0 + 3.0   // Elo -> our NTRP-ish display scale
        fun rd(d: Double) = d / 350.0

        val me = Glicko(mu = elo(1500.0), phi = rd(200.0), sigma = 0.06)
        val after = Glicko2.update(
            me,
            listOf(
                Glicko2.Opponent(Glicko(elo(1400.0), rd(30.0), 0.06), score = 1.0),
                Glicko2.Opponent(Glicko(elo(1550.0), rd(100.0), 0.06), score = 0.0),
                Glicko2.Opponent(Glicko(elo(1700.0), rd(300.0), 0.06), score = 0.0),
            ),
        )
        val rPrime = (after.mu - 3.0) * 350.0 + 1500.0
        val rdPrime = after.phi * 350.0

        assertTrue(abs(rPrime - 1464.06) < 0.5, "expected r' near 1464.06, got $rPrime")
        assertTrue(abs(rdPrime - 151.52) < 1.0, "expected RD' near 151.52, got $rdPrime")
        assertTrue(abs(after.sigma - 0.05999) < 0.0005, "expected sigma' near 0.05999, got ${after.sigma}")
    }

    @Test
    fun `a point estimate does not appear after two matches`() {
        // The product's headline promise. Under the inverted scale, phi crossed the reliability
        // threshold at match 2 with a 95% interval more than a full tier wide.
        var g = RatingBand.SOLID.seed()
        val opponent = Glicko(3.5, 0.30, 0.06)
        repeat(4) { i ->
            g = Glicko2.update(g, listOf(Glicko2.Opponent(opponent, score = if (i % 2 == 0) 1.0 else 0.0)))
            assertIs<RatingDisplay.Provisional>(
                g.display(i + 1, policy),
                "a point estimate appeared after ${i + 1} match(es), phi=${g.phi}",
            )
        }
    }

    @Test
    fun `every seed shows a range a person can act on`() {
        // Raw 1.96*phi at seed is +/-1.76 NTRP, so a Rusty player was told "0.7 to 4.3" - wider
        // than the whole recreational scale, and below its floor.
        for (band in RatingBand.entries) {
            val range = band.seed().displayRange(policy)
            assertTrue(range.start >= 2.0, "${band.label} range starts below the scale: $range")
            assertTrue(range.endInclusive <= 5.5, "${band.label} range ends above the scale: $range")
            assertTrue(
                range.endInclusive - range.start <= 1.05,
                "${band.label} range is too wide to inform a decision: $range",
            )
        }
    }

    @Test
    fun `an idle rating loses confidence within a plausible time`() {
        // Under the inverted scale this took ~377,000 nightly periods - a thousand years - so a
        // player who had not touched a racquet in two years was still matched as a confident one.
        var g = Glicko(mu = 3.5, phi = 0.10, sigma = 0.06)
        var periods = 0
        while (g.phi < RatingBand.RELIABLE_PHI && periods < 5000) {
            g = Glicko2.update(g, emptyList())
            periods++
        }
        assertTrue(periods in 1..2000, "idle decay took $periods rating periods to become unreliable")
    }

    @Test
    fun `volatility responds to surprise, and does not to expected results`() {
        // sigma sat ~650:1 against phi instead of Glickman's ~33:1, so the Illinois solver - the
        // most intricate code in the file - computed a value it could never move.
        //
        // Asserted as a comparison rather than against a threshold, because the absolute number
        // is a property of tau (0.5) rather than of correctness: Glicko-2 volatility is
        // deliberately slow. What must be true is that surprise moves it further than routine.
        val strong = Glicko(4.9, 0.30, 0.06)
        val weak = Glicko(2.1, 0.30, 0.06)

        var surprised = Glicko(mu = 3.5, phi = 0.30, sigma = 0.06)
        var expected = Glicko(mu = 3.5, phi = 0.30, sigma = 0.06)
        repeat(20) { i ->
            // Upsets: beats the strong player, loses to the weak one.
            surprised = Glicko2.update(
                surprised,
                listOf(Glicko2.Opponent(if (i % 2 == 0) strong else weak, score = if (i % 2 == 0) 1.0 else 0.0)),
            )
            // Form: loses to the strong player, beats the weak one.
            expected = Glicko2.update(
                expected,
                listOf(Glicko2.Opponent(if (i % 2 == 0) strong else weak, score = if (i % 2 == 0) 0.0 else 1.0)),
            )
        }
        assertTrue(
            surprised.sigma > expected.sigma,
            "upsets must raise volatility above routine results: ${surprised.sigma} vs ${expected.sigma}",
        )
        assertTrue(
            surprised.sigma > 0.0601,
            "volatility barely moved under 20 upsets: ${surprised.sigma}",
        )
    }

    @Test
    fun `a degenerate volatility is refused at construction`() {
        // sigma = 0 is absorbing: ln(0) is -inf, so exp(-inf/2) is 0 and it can never recover.
        assertFailsWith<IllegalArgumentException> { Glicko(3.0, 0.5, 0.0) }
        assertFailsWith<IllegalArgumentException> { Glicko(3.0, 0.5, -0.5) }
    }
}
