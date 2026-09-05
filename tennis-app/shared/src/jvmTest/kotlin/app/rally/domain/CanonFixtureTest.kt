package app.rally.domain

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.int
import java.io.File
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/**
 * Seam 2, from the Kotlin side. The same fixture file the TypeScript suite reads.
 *
 * `CanonTest` keeps its inline golden vectors because commonTest cannot read files portably and
 * the frozen encoder must be guarded on every target. This test binds those vectors to the shared
 * file, so there is one contract: if the file and the inline vectors ever disagree, this fails.
 */
class CanonFixtureTest {

    private val file = sequenceOf("../../rally/fixtures/canon/v1.json", "../rally/fixtures/canon/v1.json", "rally/fixtures/canon/v1.json")
        .map { File(it) }.first { it.exists() }
    private val fx = Json.parseToJsonElement(file.readText()).jsonObject
    private val match = MatchId(fx["matchId"]!!.jsonPrimitive.content)

    private fun report(o: kotlinx.serialization.json.JsonObject): ScoreReport {
        val sets = o["sets"]?.jsonArray?.map { s -> SetScore(s.jsonArray[0].jsonPrimitive.int, s.jsonArray[1].jsonPrimitive.int) } ?: emptyList()
        val side = o["side"]?.jsonPrimitive?.int?.let { if (it == 0) Side.A else Side.B }
        return when (val k = o["outcome"]!!.jsonPrimitive.content) {
            "completed" -> ScoreReport(sets, Outcome.Completed)
            "retired" -> ScoreReport(sets, Outcome.Retired(side!!))
            "walkover" -> ScoreReport(emptyList(), Outcome.Walkover(side!!))
            "double_default" -> ScoreReport(emptyList(), Outcome.DoubleDefault)
            else -> error("unknown outcome in fixture: $k")
        }
    }

    private fun ByteArray.hex() = joinToString("") { "%02x".format(it) }

    @Test
    fun `every fixture case encodes and digests identically to the shared file`() {
        assertEquals(1, fx["canonVersion"]!!.jsonPrimitive.int)
        val cases = fx["cases"]!!.jsonArray
        assertTrue(cases.size >= 4)
        for (c in cases.map { it.jsonObject }) {
            val name = c["name"]!!.jsonPrimitive.content
            val r = report(c["report"]!!.jsonObject)
            assertEquals(c["preimageHex"]!!.jsonPrimitive.content, ScoreCanon.encodeV1(match, r).hex(), "preimage: $name")
            c["digestHex"]?.let { d ->
                val got = (ScoreCanon.digest(match, r) as Either.Right<Digest>).value.hex
                assertEquals(d.jsonPrimitive.content, got, "digest: $name")
            }
        }
    }

    @Test
    fun `mirror case agrees across sides`() {
        val m = fx["mirror"]!!.jsonObject
        val a = ScoreCanon.digestOrNull(match, report(m["fromA"]!!.jsonObject))!!
        val b = ScoreCanon.digestOrNull(match, ScoreCanonicalizer.mirror(report(m["fromBAsEntered"]!!.jsonObject)))!!
        assertEquals(a, b)
    }
}
