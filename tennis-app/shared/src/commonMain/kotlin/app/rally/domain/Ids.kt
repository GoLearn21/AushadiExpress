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
@JvmInline value class MatchId(val raw: String) { init { require(raw.isNotBlank()) { "MatchId must not be blank" } } }
@JvmInline value class MarketId(val raw: String) { init { require(raw.isNotBlank()) { "MarketId must not be blank" } } }
@JvmInline value class VenueId(val raw: String) { init { require(raw.isNotBlank()) { "VenueId must not be blank" } } }
@JvmInline value class DivisionId(val raw: String) { init { require(raw.isNotBlank()) { "DivisionId must not be blank" } } }

/** Which side of a match. Side is *match-absolute*, never "me" vs "them" — see [ScoreCanonicalizer]. */
enum class Side { A, B;
    val other: Side get() = if (this == A) B else A
}
