package app.rally.domain

import kotlin.math.abs
import kotlin.test.*

class RatingTest {

    @Test fun `a new player is never shown a point estimate`() {
        val seed = RatingBand.SOLID.seed()
        val d = seed.display(matchesCounted = 3)
        assertIs<RatingDisplay.Provisional>(d, "below 5 matches the UI must show a range only")
    }

    @Test fun `an established player gets a point estimate with its interval`() {
        val settled = Glicko(mu = 3.5, phi = 0.2, sigma = 0.06)
        val d = settled.display(matchesCounted = 20)
        assertIs<RatingDisplay.Established>(d)
        assertTrue(d.range.start < d.value && d.value < d.range.endInclusive)
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
