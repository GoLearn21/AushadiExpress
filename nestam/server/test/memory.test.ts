import { describe, expect, it } from "vitest";
import { guessCategory, mergeMemories, similarity } from "../src/conversation/memory.js";
import type { Memory } from "../src/store/store.js";

describe("memory", () => {
  it("dedupes near-identical facts", () => {
    const mem: Memory[] = [];
    const first = mergeMemories(mem, [{ text: "User's name is Ravi" }, { text: "Likes gongura pachadi" }]);
    expect(first.added.length).toBe(2);
    const second = mergeMemories(mem, [{ text: "The user's name is Ravi" }, { text: "Works at TCS in Vijayawada" }]);
    expect(second.added.length).toBe(1);
    expect(second.skipped).toBe(1);
    expect(mem.length).toBe(3);
  });

  it("caps the list and drops tiny strings", () => {
    const mem: Memory[] = [];
    const facts = ["Plays cricket on Sundays", "Mother is a teacher in Guntur", "Studying B.Tech at Andhra University", "Allergic to peanuts", "Wants to learn Carnatic music", "Sister's wedding is in December", "Runs a kirana shop in Tenali", "Loves Chiranjeevi movies", "Drinks filter coffee every morning", "Afraid of dogs", "Saving money for a bike", "Grandfather was a farmer in Konaseema"];
    mergeMemories(mem, [...facts.map((text) => ({ text })), { text: "ab" }], () => new Date(), 10);
    expect(mem.length).toBe(10);
  });

  it("guesses categories in Telugu and English", () => {
    expect(guessCategory("User's name is Ravi")).toBe("identity");
    expect(guessCategory("అమ్మ పుట్టినరోజు రేపు")).toBe("family");
    expect(guessCategory("Works at an office in Guntur")).toBe("work");
    expect(guessCategory("Likes cricket")).toBe("likes");
    expect(guessCategory("నాకు పాలు ఇష్టం లేదు")).toBe("dislikes");
  });

  it("similarity is symmetric and bounded", () => {
    expect(similarity("red apple tree", "tree apple red")).toBe(1);
    expect(similarity("hello world", "goodbye moon")).toBe(0);
  });
});
