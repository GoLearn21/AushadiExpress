package app.rally.domain

import kotlin.math.abs
import kotlin.math.exp
import kotlin.math.min
import kotlin.math.sqrt

/**
 * What a player wants out of a match. The product must not assume everyone wants an even contest:
 * a returning player often wants a winnable match, and a competitive player wants a stretch.
 */
enum class MatchIntent(val bandLow: Double, val bandHigh: Double) {
    /**
     * Default, *after* the placement window. Asymmetric upward: a mild stretch for a player who
     * has three results on record and has seen the product work.
     */
    BALANCED(-0.25, 0.75),
    CHALLENGE_ME(0.0, 1.0),
    KEEP_IT_FRIENDLY(-0.75, 0.25),

    /**
     * No score kept. The cheapest churn reducer available: it removes the losing-badly risk
     * entirely for exactly the players most at risk of it.
     */
    JUST_A_HIT(-0.75, 0.75),
    ;

    companion object {
        /** Matches 1-3. A result inside this window moves the band and never demotes. */
        const val PLACEMENT_WINDOW_MATCHES = 3

        /**
         * The band for the placement window, and it is the **mirror** of [BALANCED].
         *
         * An earlier draft applied -0.25/+0.75 from match one. Reviewed against the target
         * persona -- returning after years off, rusty, will churn permanently on one bad first
         * match -- that default is pointed at the player it claims to protect: it systematically
         * offers a rusty stranger someone stronger, in public, on their first outing. The stretch
         * is worth having and is **earned after match 3**, not imposed before match 1.
         *
         * Hard exclusion also tightens inside the window: see [MatchFit.HARD_EXCLUSION_GAP].
         */
        val PLACEMENT_BAND_LOW = -0.75
        val PLACEMENT_BAND_HIGH = 0.25
        const val PLACEMENT_HARD_EXCLUSION_GAP = 1.0
    }
}

/** The band actually applied to a seeker, which depends on how much history they have. */
fun MatchIntent.bandFor(matchesCounted: Int): ClosedFloatingPointRange<Double> =
    if (this == MatchIntent.JUST_A_HIT || matchesCounted >= MatchIntent.PLACEMENT_WINDOW_MATCHES)
        bandLow..bandHigh
    else
        MatchIntent.PLACEMENT_BAND_LOW..MatchIntent.PLACEMENT_BAND_HIGH

/** Hard exclusion is tighter while a player is still being placed. */
fun hardExclusionGapFor(matchesCounted: Int): Double =
    if (matchesCounted >= MatchIntent.PLACEMENT_WINDOW_MATCHES) MatchFit.HARD_EXCLUSION_GAP
    else MatchIntent.PLACEMENT_HARD_EXCLUSION_GAP

/**
 * A reason a pairing was surfaced. Phase 1 shows these instead of a percentage: with only four of
 * the seven intended dimensions available, a precise-looking number would be false precision in
 * exactly the feature whose job is to earn trust.
 */
data class FitReason(val text: String)

data class FitResult(val score: Double, val reasons: List<FitReason>, val feasibleSlots: List<Int>) {
    val isFeasible: Boolean get() = feasibleSlots.isNotEmpty()
}

data class Candidate(
    val playerId: PlayerId,
    val rating: Glicko,
    val availability: PlayerAvailability,
    val travelMinutes: Int,
    val reliability: ReliabilityBand,
    val matchesTogetherLast90Days: Int,
)

/** A band, never a number. A numeric reliability score invites gaming and reads as punitive. */
enum class ReliabilityBand(val weight: Double, val label: String) {
    RELIABLE(1.0, "Reliable"),
    MOSTLY_RELIABLE(0.9, "Mostly reliable"),
    BUILDING_HISTORY(0.85, "Building history"),   // neutral, never a penalty — new players must not be throttled
    LIMITED_HISTORY(0.7, "Limited history");
}

object MatchFit {

    /** Beyond this rating gap a match is near-certain to be lopsided; exclude rather than rank low. */
    const val HARD_EXCLUSION_GAP = 2.0

    fun score(
        seeker: Candidate,
        candidate: Candidate,
        intent: MatchIntent,
        requiredConsecutiveSlots: Int,
        maxTravelMinutes: Int,
        /**
         * How many counted matches the *seeker* has. Not optional, and deliberately has no default:
         * an earlier version omitted it, so [MatchIntent.bandFor] and [hardExclusionGapFor] existed,
         * were tested in isolation, and were called by nothing. The placement-window inversion that
         * protects a returning player on their first outing was dead code, and the band that
         * actually shipped was the one it was written to replace.
         */
        seekerMatchesCounted: Int,
    ): FitResult? {
        require(maxTravelMinutes > 0) { "maxTravelMinutes must be positive" }
        require(seekerMatchesCounted >= 0) { "match count cannot be negative" }

        val gap = candidate.rating.mu - seeker.rating.mu
        if (abs(gap) > hardExclusionGapFor(seekerMatchesCounted)) return null
        if (candidate.travelMinutes > maxTravelMinutes) return null

        val band = intent.bandFor(seekerMatchesCounted)

        val overlapHard = (seeker.availability.hard and candidate.availability.hard).contiguous(requiredConsecutiveSlots)
        if (overlapHard.isEmpty) return null
        val overlapPreferred = (seeker.availability.preferred and candidate.availability.preferred).contiguous(requiredConsecutiveSlots)

        val reasons = mutableListOf<FitReason>()

        // Skill: Gaussian around the *centre of the intent band*, not around zero.
        val bandCentre = (band.start + band.endInclusive) / 2.0
        val sigma = sqrt(seeker.rating.phi * seeker.rating.phi + candidate.rating.phi * candidate.rating.phi).coerceAtLeast(0.25)
        val skill = exp(-((gap - bandCentre) * (gap - bandCentre)) / (2 * sigma * sigma))
        if (gap in band) reasons += FitReason(
            when {
                gap > 0.35 -> "A step up — good stretch for you"
                gap < -0.35 -> "Slightly below your level"
                else -> "Similar level"
            }
        )

        // Time: preferred overlap is worth more than mere feasibility, decayed by staleness.
        val freshness = min(seeker.availability.freshnessWeight, candidate.availability.freshnessWeight)
        val time = (if (overlapPreferred.isEmpty) 0.55 else 1.0) * freshness
        if (!overlapPreferred.isEmpty) reasons += FitReason("You both prefer these times")

        // Travel: linear decay to the cap.
        val travel = 1.0 - (candidate.travelMinutes.toDouble() / maxTravelMinutes).coerceIn(0.0, 1.0)
        reasons += FitReason("${candidate.travelMinutes} min away")

        // Normalised across the band's real range. Raw weights span 0.7..1.0, so a nominal 0.12
        // weight was worth only 0.036 of the score - less than 15 minutes of travel, on the one
        // signal the product treats as a safety obligation.
        val reliability = (candidate.reliability.weight - ReliabilityBand.LIMITED_HISTORY.weight) /
            (ReliabilityBand.RELIABLE.weight - ReliabilityBand.LIMITED_HISTORY.weight)
        if (candidate.reliability == ReliabilityBand.RELIABLE) reasons += FitReason("Reliable — shows up")

        // Novelty: damp repeats so a pair cannot dominate each other's feed (and cannot farm rating).
        val novelty = 1.0 / (1.0 + 0.4 * candidate.matchesTogetherLast90Days)
        if (candidate.matchesTogetherLast90Days > 0) reasons += FitReason("You've played ${candidate.matchesTogetherLast90Days}x recently")

        val score = 0.35 * skill + 0.30 * time + 0.15 * travel + 0.12 * reliability + 0.08 * novelty
        return FitResult(score, reasons, overlapHard.setSlots())
    }
}
