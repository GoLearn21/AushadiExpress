package app.rally.design

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ContrastTest {

    @Test
    fun `known WCAG reference ratios are computed correctly`() {
        // Black on white is the defined maximum.
        assertEquals(21.0, Contrast.ratio(0x000000, 0xFFFFFF), 0.01)
        // A colour against itself is the defined minimum.
        assertEquals(1.0, Contrast.ratio(0x777777, 0x777777), 0.001)
        // Order must not matter.
        assertEquals(
            Contrast.ratio(0x120507, 0xFF6B4A),
            Contrast.ratio(0xFF6B4A, 0x120507),
            1e-9,
        )
    }

    @Test
    fun `the defect this suite exists to prevent is still a failure`() {
        // White on the original accent measured 3.97:1 and shipped in five places in a mockup.
        // If a future change makes this pass, the threshold has been weakened, not the bug fixed.
        val ratio = Contrast.ratio(0xFFFFFF, 0xE8442A)
        assertTrue(ratio < Contrast.AA_NORMAL, "expected the known-bad pair to fail, got $ratio")
        assertEquals(3.97, ratio, 0.01)
    }

    @Test
    fun `every declared token pair meets its threshold`() {
        val failures = RallyColors.PAIRS.filterNot { it.passes }
        assertTrue(
            failures.isEmpty(),
            "contrast failures:\n" + failures.joinToString("\n") {
                "  ${it.name}: ${(it.ratio * 100).toInt() / 100.0}:1 (needs ${it.threshold})"
            },
        )
    }

    @Test
    fun `alpha compositing is applied before measuring, not after`() {
        // A 12% white divider over the base surface is a light grey, not white.
        val composited = Contrast.over(0xFFFFFF, 0.12, RallyColors.BG)
        assertTrue(
            Contrast.ratio(composited, RallyColors.BG) < 2.0,
            "a 12% overlay cannot have meaningful contrast against what it sits on",
        )
        // And measuring the uncomposited colour would have wrongly claimed it passes.
        assertTrue(Contrast.ratio(0xFFFFFF, RallyColors.BG) > Contrast.AA_NORMAL)
    }

    @Test
    fun `accent ink is dark, because white does not pass on this hue`() {
        // The design decision, asserted: we changed the ink, not the brand colour.
        assertTrue(Contrast.passes(RallyColors.ON_ACCENT, RallyColors.ACCENT_GRADIENT_LIGHT))
        assertTrue(Contrast.passes(RallyColors.ON_ACCENT, RallyColors.ACCENT_GRADIENT_DARK))
        assertTrue(!Contrast.passes(0xFFFFFF, RallyColors.ACCENT_GRADIENT_LIGHT))
    }
}
