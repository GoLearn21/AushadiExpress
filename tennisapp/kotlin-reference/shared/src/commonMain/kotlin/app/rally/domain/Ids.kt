package app.rally.domain

import kotlin.jvm.JvmInline

/**
 * Identifiers are value classes, not Strings.
 *
 * Rationale (type discipline, ADR-026): a bare `String` id lets you pass a PlayerId where a
 * MatchId is expected and the compiler will not stop you. In a domain where matches, players,
 * divisions and courts are all referenced together, that is a real defect class. Value classes
 * cost nothing at runtime (inlined) and eliminate it at compile time.
 */
@JvmInline value class PlayerId(val raw: String) { init { require(raw.isNotBlank()) { "PlayerId must not be blank" } } }
/**
 * A match identifier, restricted to printable ASCII.
 *
 * The restriction is not fussiness. [MatchId] is written into the canonical digest preimage, and
 * `String.encodeToByteArray()` is **lossy for unpaired surrogates** — it substitutes, so two
 * different ids can encode to identical bytes and produce the same digest. Worse, the substitution
 * byte differs by target (`'?'` on the JVM, U+FFFD in the common stdlib contract), so the same id
 * could digest differently on iOS and on the server. Unicode normalisation is the same problem
 * again: NFC and NFD forms of one visually identical id digest differently.
 *
 * Every one of those manufactures a dispute between two honest players. Constraining the charset
 * removes the whole class at the only place it can be removed cheaply — construction.
 */
@JvmInline value class MatchId(val raw: String) {
    init {
        require(raw.isNotBlank()) { "MatchId must not be blank" }
        require(raw.length <= MAX_LENGTH) { "MatchId too long: ${raw.length}" }
        require(raw.all { it in ' '..'~' }) { "MatchId must be printable ASCII (digest safety)" }
    }
    companion object { const val MAX_LENGTH = 64 }
}
@JvmInline value class MarketId(val raw: String) { init { require(raw.isNotBlank()) { "MarketId must not be blank" } } }
@JvmInline value class VenueId(val raw: String) { init { require(raw.isNotBlank()) { "VenueId must not be blank" } } }
@JvmInline value class DivisionId(val raw: String) { init { require(raw.isNotBlank()) { "DivisionId must not be blank" } } }

/** Which side of a match. Side is *match-absolute*, never "me" vs "them" — see [ScoreCanonicalizer]. */
enum class Side { A, B;
    val other: Side get() = if (this == A) B else A
}
