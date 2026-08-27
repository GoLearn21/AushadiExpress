package app.rally.domain

import kotlin.test.*

class ScoreTest {

    private val fromA = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 6), SetScore(10, 7)), Outcome.Completed)

    @Test fun `mirrored reports produce identical digests`() {
        // This is the property the whole dual-attestation scheme depends on: two honest players
        // entering the same match from opposite perspectives must agree byte-for-byte.
        val fromBPerspective = ScoreReport(listOf(SetScore(4, 6), SetScore(6, 3), SetScore(7, 10)), Outcome.Completed)
        val normalised = ScoreCanonicalizer.mirror(fromBPerspective)
        assertEquals(ScoreCanonicalizer.digest(fromA), ScoreCanonicalizer.digest(normalised))
    }

    @Test fun `genuinely different scores disagree`() {
        val other = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 3)), Outcome.Completed)
        assertNotEquals(ScoreCanonicalizer.digest(fromA), ScoreCanonicalizer.digest(other))
    }

    @Test fun `mirror is its own inverse`() {
        assertEquals(fromA, ScoreCanonicalizer.mirror(ScoreCanonicalizer.mirror(fromA)))
    }

    @Test fun `winner is computed from sets won not games won`() {
        assertEquals(Side.A, fromA.winner)
    }

    @Test fun `retirement hands the match to the other side`() {
        val r = ScoreReport(listOf(SetScore(6, 4), SetScore(1, 2)), Outcome.Retired(by = Side.B))
        assertEquals(Side.A, r.winner)
    }

    @Test fun `walkover carries no sets`() {
        assertFailsWith<IllegalArgumentException> {
            ScoreReport(listOf(SetScore(6, 0)), Outcome.Walkover(absent = Side.B))
        }
    }

    @Test fun `agreement and dispute are distinguishable`() {
        assertIs<Attestation.Agreed>(DualAttestation.compare(fromA, fromA))
        val disagreeing = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 4)), Outcome.Completed)
        assertIs<Attestation.Disputed>(DualAttestation.compare(fromA, disagreeing))
        assertIs<Attestation.AwaitingCountersign>(DualAttestation.compare(fromA, null))
    }
}
