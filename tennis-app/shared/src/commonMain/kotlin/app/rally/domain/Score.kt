package app.rally.domain

import okio.ByteString.Companion.encodeUtf8

/** A completed set. Games are always recorded side-absolute: [a] is Side.A's games. */
data class SetScore(val a: Int, val b: Int) {
    init {
        require(a >= 0 && b >= 0) { "games cannot be negative" }
        require(a <= 20 && b <= 20) { "implausible game count" }
    }
    val winner: Side? get() = when { a > b -> Side.A; b > a -> Side.B; else -> null }
}

/** How a match ended. Sealed so downstream `when` blocks are exhaustive by construction. */
sealed interface Outcome {
    data object Completed : Outcome
    data class Retired(val by: Side) : Outcome
    data class Walkover(val absent: Side) : Outcome
    data object DoubleDefault : Outcome
}

/**
 * A player's account of what happened, already normalised to match-absolute sides.
 *
 * The whole dual-attestation scheme rests on this being canonical: two honest players who agree
 * must produce byte-identical digests even though each entered the score from their own
 * perspective. Anything non-semantic (who typed it, when, from which device) is excluded.
 */
data class ScoreReport(val sets: List<SetScore>, val outcome: Outcome) {
    init {
        when (outcome) {
            is Outcome.Completed, is Outcome.Retired -> require(sets.isNotEmpty()) { "a played match needs at least one set" }
            is Outcome.Walkover, Outcome.DoubleDefault -> require(sets.isEmpty()) { "a walkover has no sets" }
        }
        require(sets.size <= 5) { "too many sets" }
    }

    val winner: Side? get() = when (outcome) {
        is Outcome.Walkover -> outcome.absent.other
        is Outcome.Retired -> outcome.by.other
        Outcome.DoubleDefault -> null
        Outcome.Completed -> {
            val a = sets.count { it.winner == Side.A }
            val b = sets.count { it.winner == Side.B }
            when { a > b -> Side.A; b > a -> Side.B; else -> null }
        }
    }
}

/**
 * Turns a report into a comparable fingerprint.
 *
 * Player A enters "6-4 3-6 10-7"; player B enters "4-6 6-3 7-10". Both are describing the same
 * match. Once each client has mapped its own perspective onto match-absolute sides, the canonical
 * strings are identical and so are the digests — so agreement is an equality check, not a fuzzy
 * comparison, and disagreement is unambiguous.
 */
object ScoreCanonicalizer {

    fun canonicalString(report: ScoreReport): String {
        val outcomeToken = when (val o = report.outcome) {
            Outcome.Completed -> "C"
            is Outcome.Retired -> "R${o.by.name}"
            is Outcome.Walkover -> "W${o.absent.name}"
            Outcome.DoubleDefault -> "D"
        }
        val sets = report.sets.joinToString(",") { "${it.a}-${it.b}" }
        return "v1|$outcomeToken|$sets"
    }

    fun digest(report: ScoreReport): String = canonicalString(report).encodeUtf8().sha256().hex()

    /** Flip a report recorded from the other player's perspective into match-absolute sides. */
    fun mirror(report: ScoreReport): ScoreReport = ScoreReport(
        sets = report.sets.map { SetScore(a = it.b, b = it.a) },
        outcome = when (val o = report.outcome) {
            Outcome.Completed -> Outcome.Completed
            Outcome.DoubleDefault -> Outcome.DoubleDefault
            is Outcome.Retired -> Outcome.Retired(o.by.other)
            is Outcome.Walkover -> Outcome.Walkover(o.absent.other)
        },
    )
}

/** The result of comparing two attestations. Sealed: every caller must handle the dispute case. */
sealed interface Attestation {
    data class Agreed(val report: ScoreReport, val digest: String) : Attestation
    data class Disputed(val first: ScoreReport, val second: ScoreReport) : Attestation
    data class AwaitingCountersign(val first: ScoreReport, val digest: String) : Attestation
}

object DualAttestation {
    fun compare(first: ScoreReport, second: ScoreReport?): Attestation {
        val d1 = ScoreCanonicalizer.digest(first)
        if (second == null) return Attestation.AwaitingCountersign(first, d1)
        val d2 = ScoreCanonicalizer.digest(second)
        return if (d1 == d2) Attestation.Agreed(first, d1) else Attestation.Disputed(first, second)
    }
}
