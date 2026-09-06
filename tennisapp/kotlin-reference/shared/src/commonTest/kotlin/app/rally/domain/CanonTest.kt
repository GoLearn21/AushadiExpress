package app.rally.domain

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertIs
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

class CanonTest {

    private val match = MatchId("m-2026-08-27-0042")
    private val other = MatchId("m-2026-08-27-0043")

    private fun digest(id: MatchId, r: ScoreReport): Digest =
        assertIs<Either.Right<Digest>>(ScoreCanon.digest(id, r)).value

    // ---------------------------------------------------------------------------------------
    // Golden vectors. THESE ARE THE POINT OF THIS FILE.
    //
    // encodeV1 is documented FROZEN, but before these existed the only byte-level assertion was
    // on the first four bytes. Reordering the fields inside a variant - which invalidates every
    // digest in the ledger - passed the entire suite. Every other test here is an equality or
    // inequality between two things that move together, so they all survive a format change.
    //
    // If one of these fails, the encoder changed. That is not a test to update: it is either a
    // bug, or it is a new CanonVersion with a new function beside the old one.
    // ---------------------------------------------------------------------------------------

    @Test
    fun `golden - completed match`() {
        val r = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 6), SetScore(10, 7)), Outcome.Completed)
        assertEquals(
            "0000000100000011" + "6d2d323032362d30382d32372d30303432" + "01" + "03" + "0604" + "0306" + "0a07",
            ScoreCanon.encodeV1(match, r).toHex(),
        )
    }

    @Test
    fun `golden - retired`() {
        val r = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 2)), Outcome.Retired(Side.B))
        // tag 02, then the sets, then the retiring side. Side.B is wire value 01 - explicit,
        // never Side.ordinal, so reordering the enum cannot silently rewrite the ledger.
        assertEquals(
            "0000000100000011" + "6d2d323032362d30382d32372d30303432" + "02" + "02" + "0604" + "0302" + "01",
            ScoreCanon.encodeV1(match, r).toHex(),
        )
    }

    @Test
    fun `golden - walkover`() {
        val r = ScoreReport(emptyList(), Outcome.Walkover(absent = Side.A))
        assertEquals(
            "0000000100000011" + "6d2d323032362d30382d32372d30303432" + "03" + "00",
            ScoreCanon.encodeV1(match, r).toHex(),
        )
    }

    @Test
    fun `golden - double default`() {
        val r = ScoreReport(emptyList(), Outcome.DoubleDefault)
        assertEquals(
            "0000000100000011" + "6d2d323032362d30382d32372d30303432" + "04",
            ScoreCanon.encodeV1(match, r).toHex(),
        )
    }

    @Test
    fun `golden - the digest hex itself`() {
        val r = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 6), SetScore(10, 7)), Outcome.Completed)
        assertEquals(64, digest(match, r).hex.length)
        // Pinned separately from the byte vector so a change to the hash function is also caught.
        assertEquals(GOLDEN_COMPLETED_DIGEST, digest(match, r).hex)
    }

    // ---------------------------------------------------------------------------------------

    @Test
    fun `two players reporting the same match produce identical digests`() {
        val fromA = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 6), SetScore(10, 7)), Outcome.Completed)
        val fromB = ScoreCanonicalizer.mirror(
            ScoreReport(listOf(SetScore(4, 6), SetScore(6, 3), SetScore(7, 10)), Outcome.Completed)
        )
        assertEquals(digest(match, fromA), digest(match, fromB))
    }

    @Test
    fun `a digest is bound to its match and cannot be replayed`() {
        val r = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 4)), Outcome.Completed)
        assertNotEquals(digest(match, r), digest(other, r))
    }

    @Test
    fun `the encoding is self-delimiting`() {
        val two = ScoreReport(listOf(SetScore(6, 4), SetScore(6, 3)), Outcome.Completed)
        val three = ScoreReport(listOf(SetScore(6, 4), SetScore(3, 6), SetScore(6, 4)), Outcome.Completed)
        assertNotEquals(digest(match, two), digest(match, three))
    }

    @Test
    fun `outcome kind and side are part of the preimage`() {
        val sets = listOf(SetScore(6, 4), SetScore(3, 2))
        assertNotEquals(
            digest(match, ScoreReport(sets, Outcome.Completed)),
            digest(match, ScoreReport(sets, Outcome.Retired(Side.B))),
        )
        assertNotEquals(
            digest(match, ScoreReport(sets, Outcome.Retired(Side.A))),
            digest(match, ScoreReport(sets, Outcome.Retired(Side.B))),
        )
    }

    @Test
    fun `the version leads the preimage`() {
        val r = ScoreReport(listOf(SetScore(6, 0), SetScore(6, 0)), Outcome.Completed)
        assertEquals(CanonVersion.V1, digest(match, r).canon)
        assertEquals(listOf<Byte>(0, 0, 0, 1), ScoreCanon.encodeV1(match, r).take(4))
    }

    @Test
    fun `encoding is deterministic across repeated calls`() {
        val r = ScoreReport(listOf(SetScore(7, 6), SetScore(4, 6), SetScore(10, 8)), Outcome.Completed)
        val first = digest(match, r).hex
        repeat(50) { assertEquals(first, digest(match, r).hex) }
    }

    @Test
    fun `a match id that is not injective in the preimage is refused at construction`() {
        // An unpaired surrogate is substituted by encodeToByteArray - lossily, and with a
        // target-dependent substitute. Two different ids could digest identically on one target
        // and differently across two, manufacturing a dispute between honest players.
        assertFailsWith<IllegalArgumentException> { MatchId("\uD800") }
        // Composed vs decomposed forms of one visually identical id are different byte strings.
        assertFailsWith<IllegalArgumentException> { MatchId("café-1") }
        assertFailsWith<IllegalArgumentException> { MatchId("café-1") }
    }

    @Test
    fun `every version this build knows can still be computed`() {
        // Canon functions are append-only. A client that cannot compute V1 cannot verify old rows.
        assertTrue(CanonVersion.V1 in CanonVersion.ALL)
        assertEquals(CanonVersion.V1, CanonVersion.fromWireTag(1))
        assertEquals(null, CanonVersion.fromWireTag(99))
    }

    @Test
    fun `a canon version skew is a typed error and never a dispute`() {
        val err: AttestError = AttestError.CanonMismatch(CanonVersion.V1, CanonVersion.V1)
        val handled = when (err) {
            is AttestError.CanonMismatch -> "re-derive under ${err.stored.wireTag}"
            is AttestError.UnsupportedCanon -> "reject"
            is AttestError.NotAParticipant -> "reject"
            is AttestError.AlreadyAttested -> "reject"
            AttestError.WrongFrame -> "ask the client to normalise"
            AttestError.Frozen -> "reject"
        }
        assertEquals("re-derive under 1", handled)
    }

    private companion object {
        const val GOLDEN_COMPLETED_DIGEST =
            "f828f446b0c731c54c73b93ac94b9c17c82b2fcf5c1d438106f481128b79e1f0"
    }
}

private fun ByteArray.toHex(): String = joinToString("") {
    val v = it.toInt() and 0xFF
    "0123456789abcdef"[v ushr 4].toString() + "0123456789abcdef"[v and 15]
}
