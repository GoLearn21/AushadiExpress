package app.rally.domain

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
        // A Completed match with no winner is not a match anyone played. Refusing it at
        // construction is what lets the rest of the domain contain no validation: an Outcome that
        // exists is an Outcome that means something.
        if (outcome is Outcome.Completed) {
            val a = sets.count { it.winner == Side.A }
            val b = sets.count { it.winner == Side.B }
            require(a != b) { "a completed match must have a winner" }
        }
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
 * Perspective normalisation.
 *
 * Player A enters "6-4 3-6 10-7"; player B enters "4-6 6-3 7-10". Both describe the same match.
 * Clients map their own perspective onto match-absolute sides before hashing, so agreement is an
 * equality check on bytes rather than a fuzzy comparison.
 *
 * There is no `digest` here any more. Digests come only from [ScoreCanon], which binds the match
 * id and the canon version into the preimage. An earlier version of this file computed a digest
 * over the score alone: identical scores in different matches produced identical digests, which is
 * a replay, and there was no version in the preimage to detect skew with.
 */
object ScoreCanonicalizer {

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
    data class Agreed(val report: ScoreReport, val digest: Digest) : Attestation
    data class Disputed(val first: ScoreReport, val second: ScoreReport) : Attestation
    data class AwaitingCountersign(val first: ScoreReport, val digest: Digest) : Attestation
}

object DualAttestation {

    /**
     * Compare two accounts of one match.
     *
     * Both digests are computed over the same [matchId] and the same canon version, so a mismatch
     * here means the players genuinely disagree — not that one of them is on a different app build
     * and not that the same score was reported for a different match.
     */
    fun compare(
        matchId: MatchId,
        first: ScoreReport,
        second: ScoreReport?,
        canon: CanonVersion = ScoreCanon.ACTIVE,
    ): Either<AttestError, Attestation> {
        val d1 = when (val r = ScoreCanon.digest(matchId, first, canon)) {
            is Either.Left -> return r
            is Either.Right -> r.value
        }
        if (second == null) return Either.Right(Attestation.AwaitingCountersign(first, d1))

        val d2 = when (val r = ScoreCanon.digest(matchId, second, canon)) {
            is Either.Left -> return r
            is Either.Right -> r.value
        }
        if (d1 == d2) return Either.Right(Attestation.Agreed(first, d1))

        // Before calling it a dispute, rule out the benign explanation: one client submitted from
        // its own perspective instead of match-absolute sides. That is a client bug, and reporting
        // it as a disagreement between two honest players is exactly the failure this protocol
        // exists to prevent.
        val mirrored = ScoreCanon.digest(matchId, ScoreCanonicalizer.mirror(second), canon).getOrNull()
        if (mirrored != null && mirrored == d1) return Either.Left(AttestError.WrongFrame)

        return Either.Right(Attestation.Disputed(first, second))
    }
}
