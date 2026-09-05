import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { encodeV1, digest, mirror, type ScoreReport } from "../src/canon.js";

/**
 * Seam 2. The fixture file is the contract shared with the Kotlin reference suite.
 * If this test and the Kotlin test disagree about the same file, the build is red.
 */
const fx = JSON.parse(readFileSync(new URL("../../fixtures/canon/v1.json", import.meta.url), "utf8"));

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

describe("canonical score encoder v1 against the shared fixtures", () => {
  for (const c of fx.cases as Array<{ name: string; report: ScoreReport; preimageHex: string; digestHex?: string }>) {
    it(`encodes: ${c.name}`, () => {
      expect(hex(encodeV1(fx.matchId, c.report))).toBe(c.preimageHex);
    });
    if (c.digestHex) {
      it(`digests: ${c.name}`, () => {
        expect(digest(fx.matchId, c.report).hex).toBe(c.digestHex);
      });
    }
  }

  it("two honest players on opposite sides produce identical digests", () => {
    const a = digest(fx.matchId, fx.mirror.fromA as ScoreReport).hex;
    const b = digest(fx.matchId, mirror(fx.mirror.fromBAsEntered as ScoreReport)).hex;
    expect(a).toBe(b);
  });
});
