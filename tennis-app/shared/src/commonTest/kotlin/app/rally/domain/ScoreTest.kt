package app.rally.domain

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertIs

class ScoreTest {

    private val match = MatchId("m-0001")

    private fun compare(first: ScoreReport, second: ScoreReport?) =
        DualAttestation.compare(match, first, second)

    @Test
    fun `mirroring is an involution across every outcome`() {
        val reports = listOf(
            ScoreReport(listOf(SetScore(6, 4), SetScore(6, 3)), Outcome.Completed),
            ScoreReport(listOf(SetScore(6, 4), SetScore(3, 2)), Outcome.Retired(Side.A)),
            ScoreReport(listOf(SetScore(6, 4), SetScore(3, 2)), Outcome.Retired(Side.B)),
            ScoreReport(emptyList(), Outcome.Walkover(Side.A)),
            ScoreReport(emptyList(), Outcome.Walkover(Side.B)),
            ScoreReport(emptyList(), Outcome.DoubleDefault),
        )
        for (r in reports) {
            assertEquals(r, ScoreCanonicalizer.mirror(ScoreCanonicalizer.mirror(r)), "mirror twice: $r")
            assertEquals(r.winner?.other, ScoreCanonicalizer.mirror(r).winner, "winner flips: $r")
        }
    }

    @Test
    fun `the winner is derived, never stored`() {
        assertEquals(Side.A, ScoreReport(listOf(SetScore(6, 4), SetScore(6, 3)), Outcome.Completed).winner)
        assertEquals(Side.B, ScoreReport(listOf(SetScore(4, 6), SetScore(3, 6)), Outcome.Completed).winner)
        // Retiring means losing, whatever the score said at the time.
        assertEquals(Side.A, ScoreReport(listOf(SetScore(2, 6)), Outcome.Retired(by = Side.B)).winner)
        assertEquals(Side.B, ScoreReport(emptyList(), Outcome.Walkover(absent = Side.A)).winner)
        assertEquals(null, ScoreReport(emptyList(), Outcome.DoubleDefault).winner)
    }

    @Test
    fun `a completed match with no winner cannot be constructed`() {
        // Nonsense refused at construction is what lets the rest of the domain skip validation.
        assertFailsWith<IllegalArgumentException> {
            ScoreReport(listOf(SetScore(6, 4), SetScore(4, 6)), Outcome.Completed)
        }
        assertFailsWith<IllegalArgumentException> {
            ScoreReport(listOf(SetScore(0, 0)), Outcome.Completed)
        }
    }

    @Test
    fun `a played match needs sets and a walkover must not have them`() {
        assertFailsWith<IllegalArgumentException> { ScoreReport(emptyList(), Outcome.Completed) }
        assertFailsWith<IllegalArgumentException> { ScoreReport(emptyList(), Outcome.Retired(Side.A)) }
        assertFailsWith<IllegalArgumentException> {
            ScoreReport(listOf(SetScore(6, 0)), Outcome.Walkover(Side.A))
        }
    }

    @Test
    fun `a single report awaits a countersignature`() {
        val r = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 4)), Outcome.Completed)
        val a = assertIs<Either.Right<Attestation>>(compare(r, null)).value
        assertIs<Attestation.AwaitingCountersign>(a)
    }

    @Test
    fun `identical accounts agree`() {
        val r = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 4)), Outcome.Completed)
        assertIs<Attestation.Agreed>(assertIs<Either.Right<Attestation>>(compare(r, r)).value)
    }

    @Test
    fun `genuinely different accounts dispute`() {
        val a = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 4)), Outcome.Completed)
        val b = ScoreReport(listOf(SetScore(6, 4), SetScore(4, 6), SetScore(6, 4)), Outcome.Completed)
        assertIs<Attestation.Disputed>(assertIs<Either.Right<Attestation>>(compare(a, b)).value)
    }

    @Test
    fun `an unmirrored submission is caught before it becomes a dispute`() {
        val a = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 3)), Outcome.Completed)
        val err = assertIs<Either.Left<AttestError>>(compare(a, ScoreCanonicalizer.mirror(a)))
        assertEquals(AttestError.WrongFrame, err.error)
    }

    @Test
    fun `set scores reject impossible game counts`() {
        assertFailsWith<IllegalArgumentException> { SetScore(-1, 6) }
        assertFailsWith<IllegalArgumentException> { SetScore(6, 21) }
    }
}
