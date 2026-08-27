package app.rally.domain

import kotlin.jvm.JvmInline

/**
 * A rolling availability window as a bitmask: [DAYS] days x [SLOTS_PER_DAY] half-hour buckets.
 *
 * Why a bitmask and not a list of intervals: intersecting two players' availability is the inner
 * loop of matchmaking. As bits it is a handful of ANDs. As interval lists it is a merge per pair,
 * and the matchmaker does this hundreds of times per player per pass.
 *
 * Bit i corresponds to (day = i / SLOTS_PER_DAY, slot = i % SLOTS_PER_DAY) counting forward from
 * `horizonStart` in the *market's* timezone. Timezone expansion happens once, upstream, when rules
 * are materialised — never here. This type is pure bits and has no notion of wall-clock time.
 */
class AvailabilityMask private constructor(private val words: LongArray) {

    /**
     * Hand-written, because this cannot be a `@JvmInline value class`.
     *
     * A value class derives equality from its underlying value, and `LongArray.equals` is
     * *reference* equality — so two masks with identical bits compared as unequal, `EMPTY` did not
     * equal `EMPTY`, and a `Set` of masks never deduplicated. Nothing caught it because every
     * assertion in the suite went through `.setSlots()` or `.cardinality` rather than comparing
     * masks directly. The moment the matchmaker caches intersections by mask, that is a silent
     * cache miss on every lookup.
     */
    override fun equals(other: Any?): Boolean =
        this === other || (other is AvailabilityMask && words.contentEquals(other.words))

    override fun hashCode(): Int = words.contentHashCode()

    override fun toString(): String = "AvailabilityMask(${cardinality} slots)"


    val cardinality: Int get() = words.sumOf { it.countOneBits() }
    val isEmpty: Boolean get() = words.all { it == 0L }

    operator fun get(index: Int): Boolean {
        require(index in 0 until TOTAL_SLOTS) { "slot index out of range: $index" }
        return (words[index ushr 6] ushr (index and 63)) and 1L == 1L
    }

    infix fun and(other: AvailabilityMask): AvailabilityMask =
        AvailabilityMask(LongArray(WORDS) { words[it] and other.words[it] })

    infix fun or(other: AvailabilityMask): AvailabilityMask =
        AvailabilityMask(LongArray(WORDS) { words[it] or other.words[it] })

    /**
     * Slots where this player is free for [consecutive] back-to-back buckets *within the same day*.
     *
     * A 90-minute match needs 3 contiguous 30-minute buckets. Naively that is `m and (m shr 1) and
     * (m shr 2)` — but a right-shift crosses the day boundary, so 23:30 Monday would chain into
     * 00:00 Tuesday. The per-day boundary mask removes those false positives.
     */
    fun contiguous(consecutive: Int): AvailabilityMask {
        require(consecutive >= 1) { "consecutive must be >= 1" }
        if (consecutive == 1) return this
        var acc = this
        for (shift in 1 until consecutive) acc = acc and shiftRightWithinDay(shift)
        return acc
    }

    /** Right-shift by [n] buckets, zeroing any bit that would have crossed a day boundary. */
    private fun shiftRightWithinDay(n: Int): AvailabilityMask {
        val out = LongArray(WORDS)
        for (i in 0 until TOTAL_SLOTS) {
            val src = i + n
            if (src >= TOTAL_SLOTS) continue
            if (src / SLOTS_PER_DAY != i / SLOTS_PER_DAY) continue // would cross midnight
            if ((words[src ushr 6] ushr (src and 63)) and 1L == 1L) out[i ushr 6] = out[i ushr 6] or (1L shl (i and 63))
        }
        return AvailabilityMask(out)
    }

    /** Indices of every set bit. Used to turn an intersection into concrete proposable slots. */
    fun setSlots(): List<Int> = buildList {
        for (w in 0 until WORDS) {
            var word = words[w]
            while (word != 0L) {
                val bit = word.countTrailingZeroBits()
                val idx = (w shl 6) + bit
                if (idx < TOTAL_SLOTS) add(idx)
                word = word and (word - 1)
            }
        }
    }

    fun toByteArray(): ByteArray = ByteArray(WORDS * 8).also { out ->
        for (w in 0 until WORDS) for (b in 0 until 8) out[w * 8 + b] = ((words[w] ushr (b * 8)) and 0xFF).toByte()
    }

    companion object {
        const val DAYS = 21
        const val SLOTS_PER_DAY = 48                    // 30-minute buckets
        const val TOTAL_SLOTS = DAYS * SLOTS_PER_DAY    // 1008
        const val WORDS = (TOTAL_SLOTS + 63) / 64       // 16 longs = 128 bytes

        val EMPTY: AvailabilityMask get() = AvailabilityMask(LongArray(WORDS))

        fun of(vararg slots: Int): AvailabilityMask = ofSlots(slots.asIterable())

        fun ofSlots(slots: Iterable<Int>): AvailabilityMask {
            val words = LongArray(WORDS)
            for (s in slots) {
                require(s in 0 until TOTAL_SLOTS) { "slot index out of range: $s" }
                words[s ushr 6] = words[s ushr 6] or (1L shl (s and 63))
            }
            return AvailabilityMask(words)
        }

        fun fromByteArray(bytes: ByteArray): AvailabilityMask {
            require(bytes.size == WORDS * 8) { "expected ${WORDS * 8} bytes, got ${bytes.size}" }
            val words = LongArray(WORDS)
            for (w in 0 until WORDS) {
                var v = 0L
                for (b in 7 downTo 0) v = (v shl 8) or (bytes[w * 8 + b].toLong() and 0xFF)
                words[w] = v
            }
            // Bits 1008..1023 are past the horizon and every other constructor keeps them zero.
            // Wire bytes are not trusted to: with them set, cardinality and isEmpty popcount all
            // 16 words while setSlots filters to TOTAL_SLOTS, so the three disagree. A mask can
            // then report itself non-empty, pass the feasibility gate, and reach the user as a
            // match offer with zero proposable slots.
            require(words[WORDS - 1] and TAIL_GARBAGE_MASK == 0L) {
                "bits beyond the ${TOTAL_SLOTS}-slot horizon were set"
            }
            return AvailabilityMask(words)
        }

        /** The 16 unused high bits of the last word. */
        private val TAIL_GARBAGE_MASK: Long = ((1L shl (TOTAL_SLOTS and 63)) - 1L).inv()

        fun slotIndex(day: Int, halfHourOfDay: Int): Int {
            require(day in 0 until DAYS) { "day out of range: $day" }
            require(halfHourOfDay in 0 until SLOTS_PER_DAY) { "slot out of range: $halfHourOfDay" }
            return day * SLOTS_PER_DAY + halfHourOfDay
        }
    }
}

/**
 * Two masks per player. Collapsing them into one loses the distinction between "I *can* play at
 * 7am" and "I *want* to play at 7am" — which is the difference between a match played and a match
 * no-showed. `hard` gives feasibility; `preferred` gives quality.
 */
data class PlayerAvailability(
    val playerId: PlayerId,
    val hard: AvailabilityMask,
    val preferred: AvailabilityMask,
    val declaredSlots: Int,
    val staleDays: Int,
) {
    init { require(declaredSlots >= 0) { "declaredSlots must be >= 0" } }

    /** Stale availability is the top source of declined offers. Decay, don't ignore. */
    val freshnessWeight: Double get() = when {
        staleDays <= 7 -> 1.0
        staleDays <= 14 -> 0.85
        staleDays <= 21 -> 0.6
        else -> 0.35
    }
}
