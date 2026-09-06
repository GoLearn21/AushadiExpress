import { describe, it, expect } from "vitest";
import tokens from "../src/tokens.json";
import { ratio } from "../src/contrast.js";

/** The design-token gate from DESIGN-PHILOSOPHY §7.1: every declared pair passes, by test, in both themes. */
describe("design tokens", () => {
  for (const theme of ["dark", "light"] as const) {
    for (const [fg, bg, min] of tokens.pairs as Array<[string, string, number]>) {
      it(`${theme}: ${fg} on ${bg} >= ${min}:1`, () => {
        const t = tokens[theme] as Record<string, string>;
        expect(ratio(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(min);
      });
    }
  }
  it("the defect this gate exists for is still a failure", () => {
    expect(ratio("#FFFFFF", "#E8442A")).toBeLessThan(4.5); // the shipped-mockup bug, 3.97:1
  });
});
