import { describe, expect, it } from "vitest";
import { detectCrisis } from "../src/characters/prompts.js";
import { guessLanguage, hasTeluguScript, istDateKey, looksLikeTenglish, timeOfDay, upcomingFestivals } from "../src/util/telugu.js";

describe("telugu utils", () => {
  it("computes IST time of day", () => {
    expect(timeOfDay(new Date("2026-09-05T01:30:00Z"))).toBe("morning"); // 07:00 IST
    expect(timeOfDay(new Date("2026-09-05T08:00:00Z"))).toBe("afternoon"); // 13:30 IST
    expect(timeOfDay(new Date("2026-09-05T12:00:00Z"))).toBe("evening"); // 17:30 IST
    expect(timeOfDay(new Date("2026-09-05T17:00:00Z"))).toBe("night"); // 22:30 IST
    expect(istDateKey(new Date("2026-09-04T20:00:00Z"))).toBe("2026-09-05");
  });

  it("finds Sankranti festivals in January", () => {
    const f = upcomingFestivals(new Date("2026-01-12T06:00:00Z"), 3).map((x) => x.id);
    expect(f).toEqual(["bhogi", "sankranti", "kanuma"]);
    expect(upcomingFestivals(new Date("2026-03-19T06:00:00Z"), 0)[0]?.id).toBe("ugadi");
  });

  it("detects scripts and Tenglish", () => {
    expect(hasTeluguScript("హాయ్")).toBe(true);
    expect(guessLanguage("hello there")).toBe("en");
    expect(guessLanguage("హాయ్ bro")).toBe("mixed");
    expect(looksLikeTenglish("nenu bagunnanu, nuvvu ela unnav")).toBe(true);
    expect(looksLikeTenglish("the weather is nice")).toBe(false);
  });

  it("detects crisis language in Telugu and English", () => {
    expect(detectCrisis("నాకు బతకాలని లేదు")).toBe(true);
    expect(detectCrisis("I want to die")).toBe(true);
    expect(detectCrisis("I want to dye my hair")).toBe(false);
  });
});
