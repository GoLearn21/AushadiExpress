package app.rally.domain

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class CanonTest {

    private val match = MatchId("m-2026-08-27-0042")
    private val other = MatchId("m-2026-08-27-0043")

    @Test
    fun `two players reporting the same match produce identical digests`() {
        // A reports 6-4 3-6 10-7 from their own side; B reports the mirror image.
        val fromA = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 6), SetScore(10, 7)), Outcome.Completed)
        val fromB = ScoreCanonicalizer.mirror(
            ScoreReport(listOf(SetScore(4, 6), SetScore(6, 3), SetScore(7, 10)), Outcome.Completed)
        )
        assertEquals(ScoreCanon.digest(match, fromA), ScoreCanon.digest(match, fromB))
    }

    @Test
    fun `a digest is bound to its match and cannot be replayed`() {
        val report = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 4)), Outcome.Completed)
        assertNotEquals(ScoreCanon.digest(match, report), ScoreCanon.digest(other, report))
    }

    @Test
    fun `the encoding is self-delimiting`() {
        // Without a length prefix these two could collide once flattened to bytes.
        val twoSets = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 6)), Outcome.Completed)
        val threeSets = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 6), SetScore(6, 4)), Outcome.Completed)
        assertNotEquals(ScoreCanon.digest(match, twoSets), ScoreCanon.digest(match, threeSets))
    }

    @Test
    fun `outcome kind is part of the preimage`() {
        val sets = listOf(SetScore(6, 4), SetScore(3, 2))
        val completed = ScoreReport(sets, Outcome.Completed)
        val retired = ScoreReport(sets, Outcome.Retired(Side.B))
        assertNotEquals(ScoreCanon.digest(match, completed), ScoreCanon.digest(match, retired))
    }

    @Test
    fun `which side retired is part of the preimage`() {
        val sets = listOf(SetScore(6, 4), SetScore(3, 2))
        assertNotEquals(
            ScoreCanon.digest(match, ScoreReport(sets, Outcome.Retired(Side.A))),
            ScoreCanon.digest(match, ScoreReport(sets, Outcome.Retired(Side.B))),
        )
    }

    @Test
    fun `the version is inside the preimage and travels with the digest`() {
        val report = ScoreReport(listOf(SetScore(6, 0)), Outcome.Completed)
        val d = ScoreCanon.digest(match, report)
        assertEquals(ScoreCanon.V1, d.canon)
        // The version bytes lead the encoding, so a V2 could never collide with a V1.
        val bytes = ScoreCanon.encodeV1(match, report)
        assertEquals(listOf<Byte>(0, 0, 0, 1), bytes.take(4))
    }

    @Test
    fun `encoding is deterministic across repeated calls`() {
        val report = ScoreReport(listOf(SetScore(7, 6), SetScore(4, 6), SetScore(10, 8)), Outcome.Completed)
        val first = ScoreCanon.digest(match, report).hex
        repeat(50) { assertEquals(first, ScoreCanon.digest(match, report).hex) }
    }

    @Test
    fun `digest is a full SHA-256`() {
        val d = ScoreCanon.digest(match, ScoreReport(emptyList(), Outcome.Walkover(Side.A)))
        assertEquals(64, d.hex.length)
        assertTrue(d.hex.all { it in "0123456789abcdef" })
    }

    @Test
    fun `a canon version skew is a typed error, never a dispute`() {
        // The point of the type: a caller pattern-matching on AttestError cannot land in the
        // dispute branch when the real cause is two clients on different app versions.
        val err: AttestError = AttestError.CanonMismatch(CanonVersion(1), CanonVersion(2))
        val handled = when (err) {
            is AttestError.CanonMismatch -> "re-derive under ${err.stored.value}"
            is AttestError.NotAParticipant -> "reject"
            is AttestError.AlreadyAttested -> "reject"
            AttestError.Frozen -> "reject"
        }
        assertEquals("re-derive under 1", handled)
    }

    @Test
    fun `a client must be able to compute every version it knows`() {
        // Canon functions are append-only. A client that has forgotten V1 cannot verify old rows.
        assertTrue(ScoreCanon.V1 in ScoreCanon.SUPPORTED)
    }
}
