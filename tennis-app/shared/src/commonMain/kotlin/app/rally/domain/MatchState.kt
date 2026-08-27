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
    data class AwaitingCountersign(val first: ScoreReport, val digest: String, val submittedBy: Side, val deadlineEpochSeconds: Long) : MatchState
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

/** Legal transitions, in one place. Returns null when a transition is not permitted. */
object MatchTransitions {

    fun confirm(state: MatchState.Scheduled, by: Side): MatchState.Scheduled =
        state.copy(confirmedBy = state.confirmedBy + by)

    fun start(state: MatchState.Scheduled, nowEpochSeconds: Long): MatchState? =
        if (state.confirmedBy.size == 2) MatchState.AwaitingResult(nowEpochSeconds) else null

    fun submitResult(
        state: MatchState,
        report: ScoreReport,
        by: Side,
        nowEpochSeconds: Long,
        countersignWindowSeconds: Long = 7 * 24 * 3600,
        rulesetVersion: String = "v1",
    ): MatchState? = when (state) {
        is MatchState.AwaitingResult -> MatchState.AwaitingCountersign(
            first = report,
            digest = ScoreCanonicalizer.digest(report),
            submittedBy = by,
            deadlineEpochSeconds = nowEpochSeconds + countersignWindowSeconds,
        )
        is MatchState.AwaitingCountersign -> {
            if (by == state.submittedBy) null // a player cannot countersign their own submission
            else when (val cmp = DualAttestation.compare(state.first, report)) {
                is Attestation.Agreed -> MatchState.Confirmed(
                    MatchResult(cmp.report, Resolution.MUTUAL, nowEpochSeconds, rulesetVersion)
                )
                is Attestation.Disputed -> MatchState.Disputed(cmp.first, cmp.second)
                is Attestation.AwaitingCountersign -> null
            }
        }
        else -> null
    }

    /** Fires when the countersign window lapses. Full rating weight — silence must not punish the submitter. */
    fun autoConfirm(state: MatchState.AwaitingCountersign, nowEpochSeconds: Long, rulesetVersion: String = "v1"): MatchState? =
        if (nowEpochSeconds >= state.deadlineEpochSeconds)
            MatchState.Confirmed(MatchResult(state.first, Resolution.AUTO_CONFIRMED, nowEpochSeconds, rulesetVersion))
        else null
}
