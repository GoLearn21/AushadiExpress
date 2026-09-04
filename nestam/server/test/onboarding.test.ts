import { describe, expect, it } from "vitest";
import { QUIZ, matchCharacter } from "../src/conversation/onboarding.js";

const all = (opt: string) => Object.fromEntries(QUIZ.map((q) => [q.id, opt]));

describe("onboarding quiz", () => {
  it("has five questions with Telugu and English text", () => {
    expect(QUIZ.length).toBe(5);
    for (const q of QUIZ) {
      expect(q.text.te.length).toBeGreaterThan(0);
      expect(q.options.length).toBe(4);
    }
  });

  it("matches archetypes", () => {
    expect(matchCharacter({ q1: "d", q2: "d", q3: "b", q4: "a", q5: "d" }).characterId).toBe("gangi");
    expect(matchCharacter({ q1: "c", q2: "c", q3: "a", q4: "c", q5: "c" }).characterId).toBe("mirchi");
    expect(matchCharacter({ q1: "b", q2: "a", q3: "a", q4: "b", q5: "b" }).characterId).toBe("chitti");
    expect(matchCharacter({ q1: "a", q2: "a", q3: "d", q4: "a", q5: "a" }).characterId).toBe("bujji");
    expect(matchCharacter({ q1: "a", q2: "b", q3: "c", q4: "d", q5: "b" }).characterId).toBe("tholu");
  });

  it("returns sorted scores for all six bommalu even with no answers", () => {
    const r = matchCharacter({});
    expect(r.scores.length).toBe(6);
    for (let i = 1; i < r.scores.length; i++) expect(r.scores[i - 1].score).toBeGreaterThanOrEqual(r.scores[i].score);
    expect(all("a")).toBeTruthy();
  });
});
