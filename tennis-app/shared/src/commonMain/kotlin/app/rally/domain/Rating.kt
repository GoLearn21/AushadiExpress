package app.rally.domain

import kotlin.jvm.JvmInline
import kotlin.math.abs
import kotlin.math.exp
import kotlin.math.ln
import kotlin.math.sqrt

/**
 * Self-placement bands. The player picks one of these in onboarding; they never type a number.
 *
 * The `blurb` is deliberately behavioural rather than technical: recreational players cannot
 * self-assess against NTRP definitions but can reliably recognise a description of their own game.
 */
enum class RatingBand(val label: String, val ntrpEquivalent: Double, val blurb: String) {
    RUSTY("Rusty",        2.5, "I can rally a few balls but points end quickly. Coming back after a long break."),
    STEADY("Steady",      3.0, "I keep the ball in play and can serve underhand or over. Doubles is more fun than singles."),
    SOLID("Solid",        3.5, "I hold rallies, place shots on purpose, and my second serve mostly goes in."),
    SHARP("Sharp",        4.0, "I construct points, hit with spin, and can attack a short ball."),
    MATCH_TOUGH("Match-tough", 4.5, "I play regularly, hit with pace and margin, and close out tight sets.");

    /** Glicko-2 seed. Wide deviation because a self-placement is a guess, and the system must say so. */
    fun seed(): Glicko = Glicko(mu = ntrpEquivalent, phi = INITIAL_PHI, sigma = 0.06)

    companion object {
        /** ~0.9 NTRP of uncertainty at seed — deliberately wide. Narrows over the first ~20 matches. */
        const val INITIAL_PHI = 0.90
        const val RELIABLE_PHI = 0.30
    }
}

/**
 * A Glicko-2 rating expressed on the NTRP-like scale the product displays.
 *
 * `phi` (rating deviation) is not decoration — it is the reason the UI can refuse to show a point
 * estimate to a new player, and the reason the matchmaker widens the band for uncertain players.
 */
data class Glicko(val mu: Double, val phi: Double, val sigma: Double) {
    init {
        require(mu.isFinite() && phi.isFinite() && sigma.isFinite()) { "Glicko params must be finite" }
        require(phi > 0.0) { "phi must be positive" }
        // sigma = 0 is an absorbing state: ln(0) is -inf, so exp(-inf/2) is 0 and volatility can
        // never recover. A negative sigma is silently squared away by the solver and looks fine.
        require(sigma > 0.0) { "sigma must be positive" }
    }

    val isReliable: Boolean get() = phi <= RatingBand.RELIABLE_PHI

    /** 95% interval. The only thing the UI may show while the rating is provisional. */
    val confidenceInterval: ClosedFloatingPointRange<Double>
        get() = (mu - 1.96 * phi)..(mu + 1.96 * phi)
}

/**
 * When a point estimate may be shown, and how wide the matchmaking band is.
 *
 * **Server-supplied, never compiled in.** Two reasons, and the second is the one that matters:
 * this is a display rule we expect to tune, and on a no-OTA platform a compiled-in constant is
 * frozen for 10-14 days per change — and worse, any A/B test on it is uninterpretable, because
 * treatment reaches half the users in four days and update speed correlates with engagement.
 *
 * The gate is [maxPhiForPointEstimate], **not a match count**. An earlier draft used "no number
 * below 5 counted matches", inherited from a competitor's marketing copy. Our own measurements put
 * Glicko RD at roughly 144 after 5 matches -- a +/-283 Elo interval, nearly a full tier. A count is
 * a proxy for confidence; phi *is* confidence, so gating on it is both more correct and
 * self-adjusting for players who arrive with an unusually informative first few results.
 */
data class DisplayPolicy(
    val maxPhiForPointEstimate: Double,
    val minMatchesForReliabilityLabel: Int,
    /** Widest half-interval worth rendering. Beyond this a range stops informing a decision. */
    val maxDisplayedHalfWidth: Double = 0.5,
    val scaleFloor: Double = 2.0,
    val scaleCeiling: Double = 5.5,
) {
    init {
        require(maxPhiForPointEstimate > 0.0) { "phi threshold must be positive" }
        require(maxDisplayedHalfWidth > 0.0) { "displayed half-width must be positive" }
        require(scaleFloor < scaleCeiling) { "scale bounds inverted" }
    }

    companion object {
        /** Fallback only, for a cold client that has never reached the server. */
        val CONSERVATIVE_FALLBACK = DisplayPolicy(
            maxPhiForPointEstimate = RatingBand.RELIABLE_PHI,
            minMatchesForReliabilityLabel = 5,
        )
    }
}

/**
 * How a rating may be rendered. Making this a sealed type means a caller cannot accidentally
 * print a point estimate for a player who has not earned one — the compiler forces the branch.
 */
sealed interface RatingDisplay {
    data class Provisional(val range: ClosedFloatingPointRange<Double>, val matchesPlayed: Int) : RatingDisplay
    data class Established(val value: Double, val range: ClosedFloatingPointRange<Double>) : RatingDisplay
}

/**
 * The only constructor of a [RatingDisplay].
 *
 * `Provisional` has no point-estimate field, so a screen that should not show a number *cannot*
 * show one. Written as a rule, someone forgets it on one screen; written as a type, they cannot.
 */
fun Glicko.display(matchesCounted: Int, policy: DisplayPolicy): RatingDisplay =
    if (phi > policy.maxPhiForPointEstimate)
        RatingDisplay.Provisional(displayRange(policy), matchesCounted)
    else
        RatingDisplay.Established(mu, displayRange(policy))

/**
 * The range a player is actually shown, which is **not** the raw 95% interval.
 *
 * At seed, phi is deliberately wide — we genuinely know almost nothing — and 1.96 * 0.90 gives
 * +/-1.76 NTRP. Rendered literally, a self-declared Rusty player is told they are "0.7 to 4.3":
 * a range wider than the entire recreational scale, extending below its floor. That is
 * statistically honest and completely useless, and a useless number erodes trust exactly as fast
 * as a wrong one.
 *
 * So the statistics stay untouched and the *presentation* is clamped: to the scale's real bounds,
 * and to a width a person can act on. A player who sees "around 3.0 to 3.7" can decide whether to
 * accept a match. A player who sees "0.7 to 4.3" learns nothing.
 */
fun Glicko.displayRange(policy: DisplayPolicy): ClosedFloatingPointRange<Double> {
    val half = (1.96 * phi).coerceAtMost(policy.maxDisplayedHalfWidth)
    val low = (mu - half).coerceAtLeast(policy.scaleFloor)
    val high = (mu + half).coerceAtMost(policy.scaleCeiling)
    return low..high
}

/**
 * Glicko-2 over a *rating period* (ADR-023). Results inside a period are simultaneous, so update
 * order cannot affect the outcome — which is why concurrency and late-arriving offline results are
 * not a correctness hazard here.
 */
object Glicko2 {
    private const val SCALE = 173.7178
    private const val TAU = 0.5
    private const val EPS = 1e-6

    data class Opponent(val rating: Glicko, val score: Double) {
        init { require(score in 0.0..1.0) { "score must be in [0,1]" } }
    }

    fun update(player: Glicko, results: List<Opponent>): Glicko {
        if (results.isEmpty()) {
            // No games: deviation grows toward uncertainty, rating unchanged.
            val phiStar = sqrt(toPhi(player.phi).let { it * it } + player.sigma * player.sigma)
            return player.copy(phi = fromPhi(phiStar))
        }
        val mu = toMu(player.mu); val phi = toPhi(player.phi); val sigma = player.sigma

        var vInv = 0.0; var deltaSum = 0.0
        for (r in results) {
            val muJ = toMu(r.rating.mu); val phiJ = toPhi(r.rating.phi)
            val g = g(phiJ); val e = e(mu, muJ, phiJ)
            vInv += g * g * e * (1 - e)
            deltaSum += g * (r.score - e)
        }
        val v = 1.0 / vInv
        val delta = v * deltaSum

        val sigmaPrime = newSigma(phi, v, delta, sigma)
        val phiStar = sqrt(phi * phi + sigmaPrime * sigmaPrime)
        val phiPrime = 1.0 / sqrt(1.0 / (phiStar * phiStar) + 1.0 / v)
        val muPrime = mu + phiPrime * phiPrime * deltaSum

        return Glicko(mu = fromMu(muPrime), phi = fromPhi(phiPrime), sigma = sigmaPrime)
    }

    /** Illinois-algorithm root find for the new volatility, per Glickman's published procedure. */
    private fun newSigma(phi: Double, v: Double, delta: Double, sigma: Double): Double {
        val a = ln(sigma * sigma)
        fun f(x: Double): Double {
            val ex = exp(x); val d2 = delta * delta; val p2 = phi * phi
            return ex * (d2 - p2 - v - ex) / (2 * (p2 + v + ex) * (p2 + v + ex)) - (x - a) / (TAU * TAU)
        }
        var lo = a
        var hi = if (delta * delta > phi * phi + v) ln(delta * delta - phi * phi - v) else run {
            var k = 1; while (f(a - k * TAU) < 0) k++; a - k * TAU
        }
        var fLo = f(lo); var fHi = f(hi)
        var guard = 0
        while (abs(hi - lo) > EPS && guard++ < 200) {
            val mid = lo + (lo - hi) * fLo / (fHi - fLo)
            val fMid = f(mid)
            if (fMid * fHi <= 0) { lo = hi; fLo = fHi } else { fLo /= 2 }
            hi = mid; fHi = fMid
        }
        return exp(lo / 2)
    }

    private fun g(phi: Double) = 1.0 / sqrt(1.0 + 3.0 * phi * phi / (kotlin.math.PI * kotlin.math.PI))
    private fun e(mu: Double, muJ: Double, phiJ: Double) = 1.0 / (1.0 + exp(-g(phiJ) * (mu - muJ)))
    /**
     * NTRP-ish display scale <-> Glicko-2 internal scale.
     *
     * Glicko-2's internal scale is *Elo divided by 173.7178*. An earlier version of this file
     * multiplied instead, and because the two conversions were consistent inverses every test
     * passed while the implied mapping was 1 NTRP point = SCALE^2/4 ~= 7,544 Elo. The consequences
     * were all silent: ratings moved ~3x too far on one upset, uncertainty shrank ~2.7x too fast
     * (a point estimate appeared after two matches with a band wider than a full tier), volatility
     * was numerically inert because sigma sat ~650:1 against phi instead of ~33:1, and an inactive
     * player needed roughly a thousand years of idle rating periods to return to seed uncertainty.
     *
     * [ELO_PER_NTRP] is the one genuinely chosen constant here. 350 Elo per NTRP point puts the
     * 2.5-4.5 band range across ~700 Elo, which matches how these populations actually separate.
     */
    private const val ELO_PER_NTRP = 350.0
    private const val CENTRE_NTRP = 3.0

    private fun toMu(v: Double) = (v - CENTRE_NTRP) * ELO_PER_NTRP / SCALE
    private fun fromMu(v: Double) = v * SCALE / ELO_PER_NTRP + CENTRE_NTRP
    private fun toPhi(v: Double) = v * ELO_PER_NTRP / SCALE
    private fun fromPhi(v: Double) = v * SCALE / ELO_PER_NTRP
}
