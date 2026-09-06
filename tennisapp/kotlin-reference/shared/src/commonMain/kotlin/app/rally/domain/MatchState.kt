package app.rally.domain

/**
 * The match lifecycle as a sealed hierarchy.
 *
 * The alternative — a `String status` plus nullable fields for score, dispute and cancellation —
 * permits states that cannot exist (a Scheduled match carrying a dispute; a Confirmed match with
 * no result). Modelling it this way means those states are not merely discouraged, they are
 * unrepresentable, and every `when` over them is checked at compile time.
 */
sealed interface MatchState {
    data class Proposed(val expiresAtEpochSeconds: Long) : MatchState
    data class Scheduled(val startEpochSeconds: Long, val venueId: VenueId, val confirmedBy: Set<Side>) : MatchState
    data class AwaitingResult(val startedEpochSeconds: Long) : MatchState
    data class AwaitingCountersign(val first: ScoreReport, val digest: Digest, val submittedBy: Side, val deadlineEpochSeconds: Long) : MatchState
    data class Disputed(val first: ScoreReport, val second: ScoreReport) : MatchState
    data class Confirmed(val result: MatchResult) : MatchState
    data class Cancelled(val by: Side?, val noticeHours: Int, val reason: CancelReason) : MatchState
}

enum class CancelReason { PLAYER_CANCELLED, WEATHER, COURT_UNAVAILABLE, NO_SHOW, ADMIN }

/** How a confirmed result came to be. Drives rating weight and the audit trail. */
enum class Resolution { MUTUAL, AUTO_CONFIRMED, ADMIN_RESOLVED, WALKOVER, FORFEIT_NO_SHOW, VOIDED }

data class MatchResult(
    val report: ScoreReport,
    val resolution: Resolution,
    val confirmedAtEpochSeconds: Long,
    val rulesetVersion: String,
) {
    /**
     * A no-show must destroy reliability and leave rating untouched. Awarding the present player a
     * rating gain for an opponent who never arrived corrupts the rating with a non-event — the
     * opposite of what a naive "opponent wins by forfeit" rule does.
     */
    val ratingWeight: Double get() = when (resolution) {
        Resolution.MUTUAL, Resolution.AUTO_CONFIRMED, Resolution.ADMIN_RESOLVED -> 1.0
        Resolution.WALKOVER, Resolution.FORFEIT_NO_SHOW, Resolution.VOIDED -> 0.0
    }

    val countsTowardReliability: Boolean get() = resolution != Resolution.VOIDED
}

/**
 * Legal transitions, in one place.
 *
 * Failures are typed rather than `null`. An earlier version returned `null` for every illegal
 * transition, which made "not permitted here", "not your turn" and "already terminal"
 * indistinguishable to the caller — and the operator console has to tell a player which one it was.
 */
object MatchTransitions {

    fun confirm(state: MatchState.Scheduled, by: Side): MatchState.Scheduled =
        state.copy(confirmedBy = state.confirmedBy + by)

    fun start(state: MatchState.Scheduled, nowEpochSeconds: Long): Either<TransitionError, MatchState> =
        if (state.confirmedBy.size == 2) Either.Right(MatchState.AwaitingResult(nowEpochSeconds))
        else Either.Left(TransitionError.NotYetConfirmed(missing = Side.entries.toSet() - state.confirmedBy))

    /**
     * Which resolution a report implies.
     *
     * **This is derived, never assumed.** An earlier version hard-coded `MUTUAL` for every mutually
     * agreed result, so a walkover both players agreed on carried full rating weight — awarding a
     * rating gain against an opponent who never arrived, which is precisely what [MatchResult]'s
     * own documentation says must not happen. The `when` is exhaustive with no `else`, so a new
     * outcome cannot silently inherit the wrong weight.
     */
    private fun resolutionFor(outcome: Outcome): Resolution = when (outcome) {
        Outcome.Completed -> Resolution.MUTUAL
        is Outcome.Retired -> Resolution.MUTUAL       // a retirement is a played match; it counts
        is Outcome.Walkover -> Resolution.WALKOVER    // nobody played; rating weight 0
        Outcome.DoubleDefault -> Resolution.VOIDED    // neither arrived; counts for nothing
    }

    fun submitResult(
        matchId: MatchId,
        state: MatchState,
        report: ScoreReport,
        by: Side,
        nowEpochSeconds: Long,
        countersignWindowSeconds: Long = 7 * 24 * 3600,
        rulesetVersion: String = "v1",
    ): Either<TransitionError, MatchState> = when (state) {

        is MatchState.AwaitingResult -> {
            when (val d = ScoreCanon.digest(matchId, report)) {
                is Either.Left -> Either.Left(TransitionError.Attest(d.error))
                is Either.Right -> Either.Right(
                    MatchState.AwaitingCountersign(
                        first = report,
                        digest = d.value,
                        submittedBy = by,
                        deadlineEpochSeconds = nowEpochSeconds + countersignWindowSeconds,
                    )
                )
            }
        }

        is MatchState.AwaitingCountersign ->
            if (by == state.submittedBy) {
                Either.Left(TransitionError.Attest(AttestError.AlreadyAttested(PlayerId(by.name))))
            } else {
                when (val cmp = DualAttestation.compare(matchId, state.first, report)) {
                    is Either.Left -> Either.Left(TransitionError.Attest(cmp.error))
                    is Either.Right -> when (val a = cmp.value) {
                        is Attestation.Agreed -> Either.Right(
                            MatchState.Confirmed(
                                MatchResult(
                                    a.report,
                                    resolutionFor(a.report.outcome),
                                    nowEpochSeconds,
                                    rulesetVersion,
                                )
                            )
                        )
                        is Attestation.Disputed -> Either.Right(MatchState.Disputed(a.first, a.second))
                        is Attestation.AwaitingCountersign ->
                            Either.Left(TransitionError.Attest(AttestError.Frozen))
                    }
                }
            }

        // Exhaustive with no `else`, per ADR-027. A new MatchState breaks this at compile time
        // rather than falling silently into a rejection.
        is MatchState.Proposed -> Either.Left(TransitionError.WrongState("Proposed"))
        is MatchState.Scheduled -> Either.Left(TransitionError.NotYetStarted)
        is MatchState.Disputed -> Either.Left(TransitionError.Attest(AttestError.Frozen))
        is MatchState.Confirmed -> Either.Left(TransitionError.Attest(AttestError.Frozen))
        is MatchState.Cancelled -> Either.Left(TransitionError.WrongState("Cancelled"))
    }

    /** Fires when the countersign window lapses. Full rating weight — silence must not punish the
     *  submitter — but the outcome still decides the resolution, so an uncontested walkover is
     *  still weighted 0. */
    fun autoConfirm(
        state: MatchState.AwaitingCountersign,
        nowEpochSeconds: Long,
        rulesetVersion: String = "v1",
    ): Either<TransitionError, MatchState> =
        if (nowEpochSeconds >= state.deadlineEpochSeconds) {
            val resolution = when (state.first.outcome) {
                is Outcome.Walkover -> Resolution.WALKOVER
                Outcome.DoubleDefault -> Resolution.VOIDED
                Outcome.Completed, is Outcome.Retired -> Resolution.AUTO_CONFIRMED
            }
            Either.Right(
                MatchState.Confirmed(MatchResult(state.first, resolution, nowEpochSeconds, rulesetVersion))
            )
        } else {
            Either.Left(TransitionError.DeadlineNotReached(state.deadlineEpochSeconds))
        }
}

/** Why a transition was refused. Typed so the caller can say which refusal it was. */
sealed interface TransitionError {
    data class NotYetConfirmed(val missing: Set<Side>) : TransitionError
    data object NotYetStarted : TransitionError
    data class DeadlineNotReached(val atEpochSeconds: Long) : TransitionError
    data class WrongState(val state: String) : TransitionError
    data class Attest(val error: AttestError) : TransitionError
}
