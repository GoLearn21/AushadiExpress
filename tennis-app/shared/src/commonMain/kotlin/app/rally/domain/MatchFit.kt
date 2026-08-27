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
    /** Default. Asymmetric: easier for a stronger player to join than a weaker one, which protects
     *  the weaker player from a blowout while giving the stronger one a mild stretch. */
    BALANCED(-0.25, 0.75),
    CHALLENGE_ME(0.0, 1.0),
    KEEP_IT_FRIENDLY(-0.75, 0.25),
}

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
    ): FitResult? {
        val gap = candidate.rating.mu - seeker.rating.mu
        if (abs(gap) > HARD_EXCLUSION_GAP) return null
        if (candidate.travelMinutes > maxTravelMinutes) return null

        val overlapHard = (seeker.availability.hard and candidate.availability.hard).contiguous(requiredConsecutiveSlots)
        if (overlapHard.isEmpty) return null
        val overlapPreferred = (seeker.availability.preferred and candidate.availability.preferred).contiguous(requiredConsecutiveSlots)

        val reasons = mutableListOf<FitReason>()

        // Skill: Gaussian around the *centre of the intent band*, not around zero.
        val bandCentre = (intent.bandLow + intent.bandHigh) / 2.0
        val sigma = sqrt(seeker.rating.phi * seeker.rating.phi + candidate.rating.phi * candidate.rating.phi).coerceAtLeast(0.25)
        val skill = exp(-((gap - bandCentre) * (gap - bandCentre)) / (2 * sigma * sigma))
        if (gap in intent.bandLow..intent.bandHigh) reasons += FitReason(
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

        val reliability = candidate.reliability.weight
        if (candidate.reliability == ReliabilityBand.RELIABLE) reasons += FitReason("Reliable — shows up")

        // Novelty: damp repeats so a pair cannot dominate each other's feed (and cannot farm rating).
        val novelty = 1.0 / (1.0 + 0.4 * candidate.matchesTogetherLast90Days)
        if (candidate.matchesTogetherLast90Days > 0) reasons += FitReason("You've played ${candidate.matchesTogetherLast90Days}x recently")

        val score = 0.35 * skill + 0.30 * time + 0.15 * travel + 0.12 * reliability + 0.08 * novelty
        return FitResult(score, reasons, overlapHard.setSlots())
    }
}
