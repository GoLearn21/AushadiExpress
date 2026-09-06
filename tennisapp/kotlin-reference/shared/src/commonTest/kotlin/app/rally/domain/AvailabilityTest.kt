package app.rally.domain

import kotlin.test.*

class AvailabilityTest {

    @Test fun `intersection keeps only shared slots`() {
        val a = AvailabilityMask.of(10, 11, 12, 200)
        val b = AvailabilityMask.of(11, 12, 13, 900)
        assertEquals(listOf(11, 12), (a and b).setSlots())
    }

    @Test fun `contiguity finds a 90 minute window`() {
        // three back-to-back 30-min buckets on day 0
        val m = AvailabilityMask.of(20, 21, 22)
        assertEquals(listOf(20), m.contiguous(3).setSlots(), "only slot 20 starts a 3-slot run")
    }

    @Test fun `contiguity rejects a gap`() {
        val m = AvailabilityMask.of(20, 21, 23)
        assertTrue(m.contiguous(3).isEmpty)
    }

    @Test fun `contiguity does not chain across midnight`() {
        // last two buckets of day 0 and the first of day 1 are adjacent as bit indices
        // but are NOT a playable contiguous window.
        val last = AvailabilityMask.SLOTS_PER_DAY - 1
        val m = AvailabilityMask.of(last - 1, last, AvailabilityMask.SLOTS_PER_DAY)
        assertTrue(m.contiguous(3).isEmpty, "a window must not straddle a day boundary")
    }

    @Test fun `byte round trip is lossless`() {
        val m = AvailabilityMask.of(0, 63, 64, 500, AvailabilityMask.TOTAL_SLOTS - 1)
        assertEquals(m.setSlots(), AvailabilityMask.fromByteArray(m.toByteArray()).setSlots())
    }

    @Test fun `mask is 128 bytes so a 500 candidate pass fits in 64KB`() {
        assertEquals(128, AvailabilityMask.EMPTY.toByteArray().size)
        assertEquals(1008, AvailabilityMask.TOTAL_SLOTS)
    }

    @Test fun `out of range slot is rejected at construction`() {
        assertFailsWith<IllegalArgumentException> { AvailabilityMask.of(AvailabilityMask.TOTAL_SLOTS) }
    }

    @Test fun `declaring more slots strictly increases overlap opportunity`() {
        // The product claim behind the availability picker: more declared slots -> more reachable
        // opponents. Verify the mechanism rather than the marketing number.
        val opponent = AvailabilityMask.ofSlots((0 until 300).filter { it % 7 == 0 })
        val two = AvailabilityMask.of(0, 7)
        val four = AvailabilityMask.of(0, 7, 14, 21)
        assertTrue((four and opponent).cardinality > (two and opponent).cardinality)
    }
}

/**
 * Value semantics and wire hardening.
 *
 * Nothing in the original suite compared two masks directly — every assertion went through
 * `.setSlots()` or `.cardinality` — so it never noticed that `AvailabilityMask` did not equal
 * itself. As a `@JvmInline value class` over a `LongArray` it inherited `LongArray.equals`, which
 * is reference equality.
 */
class AvailabilityMaskIdentityTest {

    @Test
    fun `two masks with the same bits are equal`() {
        assertEquals(AvailabilityMask.of(11, 12), AvailabilityMask.of(11, 12))
        assertEquals(AvailabilityMask.EMPTY, AvailabilityMask.EMPTY)
    }

    @Test
    fun `masks deduplicate in a set and work as map keys`() {
        // The matchmaker caches intersections. Under reference equality every lookup missed.
        val set = setOf(
            AvailabilityMask.of(11, 12),
            AvailabilityMask.of(11, 12),
        )
        assertEquals(1, set.size)
        val map = mapOf(AvailabilityMask.of(1, 2) to "a")
        assertEquals("a", map[AvailabilityMask.of(1, 2)])
    }

    @Test
    fun `an intersection equals the mask it should produce`() {
        val a = AvailabilityMask.of(10, 11, 12)
        val b = AvailabilityMask.of(11, 12, 13)
        assertEquals(AvailabilityMask.of(11, 12), a and b)
    }

    @Test
    fun `equal masks hash equally`() {
        assertEquals(
            AvailabilityMask.of(5, 500, 1007).hashCode(),
            AvailabilityMask.of(5, 500, 1007).hashCode(),
        )
    }

    @Test
    fun `wire bytes with bits past the horizon are rejected`() {
        // Accepted, those bits made cardinality and isEmpty disagree with setSlots: a mask could
        // report itself non-empty, clear the feasibility gate, and reach a player as a match
        // offer with no proposable slots in it.
        val bytes = ByteArray(128)
        bytes[127] = 0xFF.toByte()          // sets bits 1016..1023, past the 1008-slot horizon
        assertFailsWith<IllegalArgumentException> { AvailabilityMask.fromByteArray(bytes) }
    }

    @Test
    fun `a legitimate round trip still works`() {
        val original = AvailabilityMask.of(0, 47, 48, 1007)
        assertEquals(original, AvailabilityMask.fromByteArray(original.toByteArray()))
    }
}
