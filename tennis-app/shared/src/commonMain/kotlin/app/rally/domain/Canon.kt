package app.rally.domain

import kotlin.jvm.JvmInline
import okio.ByteString
import okio.ByteString.Companion.toByteString

/**
 * Version of the canonical encoding. Written *inside* the preimage, so a digest carries the rules
 * it was produced under.
 *
 * A canon function is never edited. A rule change is a new version and a new function, and the old
 * one stays callable forever. See [ScoreCanon].
 */
@JvmInline
value class CanonVersion(val value: Int) {
    init { require(value >= 1) { "canon versions start at 1" } }
}

/** A score fingerprint, inseparable from the version that produced it. */
data class Digest(val bytes: ByteString, val canon: CanonVersion) {
    val hex: String get() = bytes.hex()
}

/**
 * Canonical byte encoding of a score report.
 *
 * The digest is the only thing dual attestation compares, so this encoder is the single point where
 * a client/server disagreement would silently convert an *agreement* into a *dispute*. Five
 * properties are therefore load-bearing, and each rules out a specific failure:
 *
 *  1. **Integer-only, hand-written bytes — never JSON.** JSON is not canonical: whitespace,
 *     escaping, number formatting, key order, and `encodeDefaults` all vary by serializer config
 *     and library version, so two correct implementations can disagree.
 *  2. **Match-absolute sides, never reporter-relative.** Both players must produce identical bytes
 *     for the same match. Callers normalise with [ScoreCanonicalizer.mirror] before encoding.
 *  3. **Version inside the preimage.** Changing the encoder later would otherwise silently
 *     invalidate every stored digest.
 *  4. **Match id inside the preimage.** Binds a digest to one match; a digest cannot be replayed
 *     against another.
 *  5. **Length-prefixed, self-delimiting.** `[[6,4],[3,6]]` cannot encode to the same bytes as any
 *     other set list.
 *
 * No floats appear anywhere: `kotlin.math` transcendentals are not guaranteed bit-identical between
 * the JVM and Kotlin/Native, so a `Double` in a preimage would eventually diverge across targets.
 */
object ScoreCanon {

    val V1 = CanonVersion(1)

    /** Every version this client can compute. A client must be able to speak older versions. */
    val SUPPORTED: Set<CanonVersion> = setOf(V1)

    fun digest(matchId: MatchId, report: ScoreReport, canon: CanonVersion = V1): Digest {
        require(canon in SUPPORTED) { "unsupported canon version ${canon.value}" }
        val bytes = when (canon) {
            V1 -> encodeV1(matchId, report)
            else -> error("unreachable: SUPPORTED and this when must agree")
        }
        return Digest(bytes.toByteString().sha256(), canon)
    }

    /** FROZEN. Never edit this function — add V2 beside it. */
    internal fun encodeV1(matchId: MatchId, report: ScoreReport): ByteArray {
        val out = ArrayList<Byte>(64)
        out.writeInt(V1.value)
        out.writeLengthPrefixedUtf8(matchId.raw)
        when (val o = report.outcome) {
            Outcome.Completed -> { out.add(1); out.writeSets(report.sets) }
            is Outcome.Retired -> { out.add(2); out.writeSets(report.sets); out.add(o.by.ordinal.toByte()) }
            is Outcome.Walkover -> { out.add(3); out.add(o.absent.ordinal.toByte()) }
            Outcome.DoubleDefault -> { out.add(4) }
        }
        return out.toByteArray()
    }

    private fun MutableList<Byte>.writeInt(v: Int) {
        add((v ushr 24).toByte()); add((v ushr 16).toByte()); add((v ushr 8).toByte()); add(v.toByte())
    }

    /** Length-prefixed so an id containing a delimiter cannot shift the following fields. */
    private fun MutableList<Byte>.writeLengthPrefixedUtf8(s: String) {
        val b = s.encodeToByteArray()
        writeInt(b.size)
        b.forEach { add(it) }
    }

    private fun MutableList<Byte>.writeSets(sets: List<SetScore>) {
        add(sets.size.toByte())
        sets.forEach { add(it.a.toByte()); add(it.b.toByte()) }
    }
}

/** Why an attestation could not be applied. A typed error, so no caller can mistake it for a dispute. */
sealed interface AttestError {
    data class NotAParticipant(val who: PlayerId) : AttestError
    data class AlreadyAttested(val who: PlayerId) : AttestError

    /**
     * The two attestations were computed under different canon versions.
     *
     * This is the offline sharp edge: two honest players at the same court, one on app v9 and one
     * on v10, would otherwise produce different digests for an *identical* score and the protocol
     * would manufacture a dispute out of an agreement. With a 10–14 day update tail on a no-OTA
     * platform, two client versions are in the field every week, so this is routine, not exotic.
     *
     * The server resolves it by re-deriving both sides from the stored raw payloads under the older
     * version. It is never a dispute.
     */
    data class CanonMismatch(val stored: CanonVersion, val incoming: CanonVersion) : AttestError

    /** The result is already terminal; attestations are append-only and never overwritten. */
    data object Frozen : AttestError
}
