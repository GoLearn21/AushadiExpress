package app.rally.domain

import okio.ByteString
import okio.ByteString.Companion.toByteString

/**
 * Version of the canonical encoding, written *inside* the preimage so a digest carries the rules
 * it was produced under.
 *
 * **Sealed, not a value class over Int.** A `when` over an `Int` wrapper can never be exhaustive,
 * so it needs an `else`, and an `else` in the one function that must never fail is exactly the
 * "silently absorbs new states" hazard ADR-027 exists to prevent: add V2, forget a branch, and it
 * compiles and fails at runtime. Sealed makes the omission a compile error.
 *
 * The [wireTag] is explicit and permanent. Never derive a wire value from an ordinal — reordering
 * a declaration would silently invalidate every stored digest.
 */
sealed interface CanonVersion {
    val wireTag: Int

    data object V1 : CanonVersion { override val wireTag: Int = 1 }

    companion object {
        val ALL: List<CanonVersion> = listOf(V1)
        fun fromWireTag(tag: Int): CanonVersion? = ALL.firstOrNull { it.wireTag == tag }
    }
}

/** A score fingerprint, inseparable from the version that produced it. */
data class Digest(val bytes: ByteString, val canon: CanonVersion) {
    val hex: String get() = bytes.hex()
}

/**
 * Canonical byte encoding of a score report.
 *
 * The digest is the only thing dual attestation compares, so this is the single point where a
 * client/server disagreement would silently convert an *agreement* into a *dispute*. Five
 * properties are load-bearing, each ruling out a specific failure:
 *
 *  1. **Integer-only, hand-written bytes — never JSON.** JSON is not canonical: whitespace,
 *     escaping, number formatting, key order and `encodeDefaults` all vary by serializer config
 *     and library version, so two correct implementations can disagree.
 *  2. **Match-absolute sides, never reporter-relative.** Both players must produce identical bytes
 *     for the same match. Callers normalise with [ScoreCanonicalizer.mirror] before encoding.
 *  3. **Version inside the preimage.** Otherwise changing the encoder silently invalidates every
 *     stored digest.
 *  4. **Match id inside the preimage.** Binds a digest to one match, so it cannot be replayed
 *     against another. [MatchId] is charset-restricted precisely so this binding is injective.
 *  5. **Length-prefixed and self-delimiting**, with explicit permanent tags — never enum ordinals.
 *
 * No floats appear anywhere: `kotlin.math` transcendentals are not guaranteed bit-identical
 * between the JVM and Kotlin/Native, so a `Double` in a preimage would eventually diverge.
 */
object ScoreCanon {

    /** The version this client writes. It can still *read* every version in [CanonVersion.ALL]. */
    val ACTIVE: CanonVersion = CanonVersion.V1

    /**
     * Compute a digest under [canon].
     *
     * Returns an [AttestError.UnsupportedCanon] rather than throwing, because the version is
     * **data supplied by a peer**, not a programmer error. On a platform with no over-the-air
     * updates there are two client versions in the field every week, so this is the routine path.
     */
    fun digest(
        matchId: MatchId,
        report: ScoreReport,
        canon: CanonVersion = ACTIVE,
    ): Either<AttestError, Digest> {
        val bytes = when (canon) {
            CanonVersion.V1 -> encodeV1(matchId, report)
        }
        return Either.Right(Digest(bytes.toByteString().sha256(), canon))
    }

    /** For callers that have already established the version is supported. */
    fun digestOrNull(matchId: MatchId, report: ScoreReport, canon: CanonVersion = ACTIVE): Digest? =
        (digest(matchId, report, canon) as? Either.Right)?.value

    // --- Outcome wire tags. Permanent. Never reordered, never derived from an ordinal. ---
    private const val TAG_COMPLETED = 1.toByte().toInt()
    private const val TAG_RETIRED = 2
    private const val TAG_WALKOVER = 3
    private const val TAG_DOUBLE_DEFAULT = 4

    /** Side wire values, explicit for the same reason: `Side.ordinal` is a declaration detail. */
    private fun sideTag(side: Side): Byte = when (side) { Side.A -> 0; Side.B -> 1 }

    /** FROZEN. Never edit this function — add V2 beside it. Golden vectors in `CanonTest`. */
    internal fun encodeV1(matchId: MatchId, report: ScoreReport): ByteArray {
        val out = ArrayList<Byte>(64)
        out.writeInt(CanonVersion.V1.wireTag)
        out.writeLengthPrefixedAscii(matchId.raw)
        when (val o = report.outcome) {
            Outcome.Completed -> { out.add(TAG_COMPLETED.toByte()); out.writeSets(report.sets) }
            is Outcome.Retired -> { out.add(TAG_RETIRED.toByte()); out.writeSets(report.sets); out.add(sideTag(o.by)) }
            is Outcome.Walkover -> { out.add(TAG_WALKOVER.toByte()); out.add(sideTag(o.absent)) }
            Outcome.DoubleDefault -> { out.add(TAG_DOUBLE_DEFAULT.toByte()) }
        }
        return out.toByteArray()
    }

    private fun MutableList<Byte>.writeInt(v: Int) {
        add((v ushr 24).toByte()); add((v ushr 16).toByte()); add((v ushr 8).toByte()); add(v.toByte())
    }

    /**
     * Length-prefixed ASCII. [MatchId] guarantees the charset, so this cannot be lossy — but the
     * check is repeated here because this function is frozen and may one day be called by a
     * re-derivation path that did not come through [MatchId].
     */
    private fun MutableList<Byte>.writeLengthPrefixedAscii(s: String) {
        check(s.all { it in ' '..'~' }) { "non-ASCII in a frozen preimage" }
        writeInt(s.length)
        s.forEach { add(it.code.toByte()) }
    }

    private fun MutableList<Byte>.writeSets(sets: List<SetScore>) {
        check(sets.size <= 0xFF) { "set count would truncate to a byte" }
        add(sets.size.toByte())
        sets.forEach { add(it.a.toByte()); add(it.b.toByte()) }
    }
}

/**
 * A minimal `Either`, so domain functions return failures instead of throwing.
 *
 * ADR-027 calls for Arrow's `Either`/`Raise`. This stands in until Arrow is a dependency, and
 * carries the property that matters: a `when` over it is exhaustive, so a caller cannot forget the
 * failure branch. `kotlin.Result` is explicitly rejected — it erases the error to `Throwable`, so
 * `when` over it is *not* exhaustive, which discards the entire point.
 */
sealed interface Either<out E, out T> {
    data class Left<out E>(val error: E) : Either<E, Nothing>
    data class Right<out T>(val value: T) : Either<Nothing, T>

    fun getOrNull(): T? = when (this) {
        is Right -> value
        is Left -> null
    }
}

/** Why an attestation could not be applied. Typed, so no caller can mistake one for a dispute. */
sealed interface AttestError {
    data class NotAParticipant(val who: PlayerId) : AttestError
    data class AlreadyAttested(val who: PlayerId) : AttestError

    /**
     * The two attestations were computed under different canon versions.
     *
     * The offline sharp edge: two honest players at the same court, one on app v9 and one on v10,
     * would otherwise produce different digests for an identical score and the protocol would
     * manufacture a dispute out of an agreement. The server resolves it by re-deriving both from
     * the stored raw payloads under the older version. **Never a dispute.**
     */
    data class CanonMismatch(val stored: CanonVersion, val incoming: CanonVersion) : AttestError

    /** A version this build does not know how to compute. Also never a dispute. */
    data class UnsupportedCanon(val wireTag: Int) : AttestError

    /** A player submitted from their own perspective rather than match-absolute sides. */
    data object WrongFrame : AttestError

    /** The result is already terminal; attestations are append-only and never overwritten. */
    data object Frozen : AttestError
}
