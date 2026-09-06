package app.rally.design

/**
 * The Phase 1 colour tokens, derived from mockup v01 "Midnight Ace" after the contrast pass.
 *
 * Two values here are corrections rather than choices, and both are recorded because the original
 * looked fine and was not:
 *
 *  - [ACCENT_GRADIENT_LIGHT] / [ACCENT_GRADIENT_DARK] replace a gradient running #FF3B30 to
 *    #C42D18 with white text. White measured 3.55:1 at the light stop and 3.97:1 at the mid stop,
 *    both below the 4.5:1 needed for normal text.
 *  - [ON_ACCENT] is a near-black ink, not white. It clears 5.04:1 at the darkest stop and 7.10:1
 *    at the lightest, so the accent keeps its heat instead of being desaturated to accommodate
 *    white text.
 *
 * Reliability colours are deliberately absent. Reliability is rendered as a label, never as amber
 * or red: colouring a new player's status is a decline trigger aimed at precisely the cohort the
 * product promises not to penalise, and it would also be colour-carrying-meaning, which the
 * accessibility gate forbids.
 */
object RallyColors {

    // surfaces
    const val BG = 0x0B0B0FL
    const val BG_ELEVATED = 0x141419L
    const val SURFACE = 0x1B1B22L

    // text
    const val TEXT = 0xF5F5F1L
    const val TEXT_DIM = 0xC9C9CEL
    const val MUTED = 0x8C8C95L

    // accent
    const val ACCENT = 0xE8442AL
    const val ACCENT_HOT = 0xFF3B30L
    const val ACCENT_GRADIENT_LIGHT = 0xFF6B4AL
    const val ACCENT_GRADIENT_DARK = 0xE8442AL
    const val ON_ACCENT = 0x120507L

    // state
    const val UP = 0x3DD68CL
    const val GOLD = 0xF5C518L

    /**
     * Every pairing the UI paints. `ContrastTest` asserts all of them, so a token nudge that breaks
     * contrast fails the build rather than reaching a screen.
     */
    val PAIRS: List<TokenPair> = listOf(
        TokenPair("text on bg", TEXT, BG),
        TokenPair("text on elevated", TEXT, BG_ELEVATED),
        TokenPair("text on surface", TEXT, SURFACE),
        TokenPair("dim on bg", TEXT_DIM, BG),
        TokenPair("dim on elevated", TEXT_DIM, BG_ELEVATED),
        TokenPair("dim on surface", TEXT_DIM, SURFACE),
        TokenPair("muted on bg", MUTED, BG),
        TokenPair("muted on elevated", MUTED, BG_ELEVATED),
        TokenPair("accent on bg", ACCENT, BG),
        TokenPair("accent-hot on bg", ACCENT_HOT, BG),
        TokenPair("accent-hot on elevated", ACCENT_HOT, BG_ELEVATED),
        TokenPair("on-accent over gradient light stop", ON_ACCENT, ACCENT_GRADIENT_LIGHT),
        TokenPair("on-accent over gradient dark stop", ON_ACCENT, ACCENT_GRADIENT_DARK),
        TokenPair("up on bg", UP, BG),
        TokenPair("gold on bg", GOLD, BG),
        // Focus ring and dividers are non-text objects: SC 1.4.11, 3:1.
        TokenPair("focus ring on bg", ACCENT_HOT, BG, Contrast.AA_NON_TEXT),
        TokenPair("focus ring on surface", ACCENT_HOT, SURFACE, Contrast.AA_NON_TEXT),
    )
}
