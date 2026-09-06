package app.rally.design

import kotlin.math.pow

/**
 * sRGB relative luminance and WCAG 2.2 contrast ratio.
 *
 * This exists so contrast is a **test**, not a review comment. Ten mockups shipped with 25 failing
 * foreground/background pairs across six files -- including white on the primary accent at 3.97:1
 * -- and every one was found by eye, late. A design system that cannot assert its own contrast will
 * regress the first time someone nudges a brand colour.
 *
 * Deliberately dependency-free and in `commonMain`, so it runs on the JVM gate in CI without a
 * device, an emulator, or a screenshot.
 */
object Contrast {

    /** WCAG 2.2 SC 1.4.3: normal text. */
    const val AA_NORMAL = 4.5

    /** WCAG 2.2 SC 1.4.3: >=18.66px bold or >=24px. */
    const val AA_LARGE = 3.0

    /** WCAG 2.2 SC 1.4.11: UI components and graphical objects. */
    const val AA_NON_TEXT = 3.0

    /**
     * Contrast ratio between two opaque sRGB colours, in the range 1.0..21.0.
     *
     * Accepts 0xRRGGBB or 0xAARRGGBB; any alpha byte is ignored, because a ratio against a
     * translucent colour is a ratio against whatever happens to be behind it. Composite first,
     * then measure -- see [over].
     */
    fun ratio(foreground: Long, background: Long): Double {
        val a = luminance(foreground)
        val b = luminance(background)
        val hi = maxOf(a, b)
        val lo = minOf(a, b)
        return (hi + 0.05) / (lo + 0.05)
    }

    fun passes(foreground: Long, background: Long, threshold: Double = AA_NORMAL): Boolean =
        ratio(foreground, background) >= threshold

    /** Relative luminance per WCAG 2.x. */
    fun luminance(color: Long): Double {
        val r = channel((color ushr 16) and 0xFF)
        val g = channel((color ushr 8) and 0xFF)
        val b = channel(color and 0xFF)
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    private fun channel(byte: Long): Double {
        val c = byte / 255.0
        return if (c <= 0.03928) c / 12.92 else ((c + 0.055) / 1.055).pow(2.4)
    }

    /**
     * Composite a translucent colour over an opaque one, so the result can be measured.
     *
     * Translucent surface tokens are where contrast bugs hide: the token itself looks fine in
     * isolation and fails only over the surface it is actually painted on.
     */
    fun over(foreground: Long, alpha: Double, background: Long): Long {
        require(alpha in 0.0..1.0) { "alpha must be in 0..1" }
        fun mix(shift: Int): Long {
            val f = (foreground ushr shift) and 0xFF
            val b = (background ushr shift) and 0xFF
            return (f * alpha + b * (1 - alpha)).toLong().coerceIn(0, 255)
        }
        return (mix(16) shl 16) or (mix(8) shl 8) or mix(0)
    }
}

/**
 * A foreground/background pairing the product actually paints, with the rule it must satisfy.
 *
 * Every pair the design system uses is declared here and asserted in `ContrastTest`. A new token
 * combination that is not in this list is not a passing case -- it is an untested one, which is why
 * the test also asserts the list covers every declared surface.
 */
data class TokenPair(
    val name: String,
    val foreground: Long,
    val background: Long,
    val threshold: Double = Contrast.AA_NORMAL,
) {
    val ratio: Double get() = Contrast.ratio(foreground, background)
    val passes: Boolean get() = ratio >= threshold
}
