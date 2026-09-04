import { describe, expect, it } from "vitest";
import { careForVaakili, completeActivity, getTodaysActivities, levelForPoints, touchStreak } from "../src/conversation/activities.js";
import { getCharacter } from "../src/characters/roster.js";
import { newVaakili } from "../src/store/store.js";
import type { UserRecord } from "../src/store/store.js";

function user(): UserRecord {
  const now = new Date().toISOString();
  return { id: "usr_test", language: "te", addressStyle: "casual", characterId: "bujji", appearance: {}, memories: [], vaakili: newVaakili(), streak: { count: 0, lastDate: null }, activities: {}, totalTurns: 0, createdAt: now, lastSeenAt: now };
}

describe("activities", () => {
  it("generates three deterministic activities per day", () => {
    const u = user();
    const a = getTodaysActivities(u, getCharacter("bujji"), "2026-09-05");
    const b = getTodaysActivities(user(), getCharacter("bujji"), "2026-09-05");
    expect(a.length).toBe(3);
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
    expect(new Set(a.map((x) => x.kind)).size).toBe(3);
    expect(getTodaysActivities(u, getCharacter("bujji"), "2026-09-05")).toBe(a); // cached
  });

  it("completing an activity grants energy once", () => {
    const u = user();
    const [first] = getTodaysActivities(u, getCharacter("mirchi"), "2026-09-05");
    const before = u.vaakili.energy;
    expect(completeActivity(u, first.id, "2026-09-05")?.done).toBe(true);
    expect(u.vaakili.energy).toBe(before + first.energy);
    completeActivity(u, first.id, "2026-09-05");
    expect(u.vaakili.energy).toBe(before + first.energy);
    expect(completeActivity(u, "nope", "2026-09-05")).toBeNull();
  });

  it("caring for the vaakili spends energy and levels up", () => {
    const u = user();
    u.vaakili.energy = 2;
    expect(careForVaakili(u, "tree").ok).toBe(true);
    expect(u.vaakili.energy).toBe(0);
    expect(u.vaakili.tree).toBe(1);
    const denied = careForVaakili(u, "muggu");
    expect(denied.ok).toBe(false);
    expect(denied.reason).toBe("not_enough_energy");
    expect(levelForPoints(0)).toBe(1);
    expect(levelForPoints(6)).toBe(2);
    expect(levelForPoints(999)).toBe(10);
  });

  it("tracks streaks across consecutive days", () => {
    const u = user();
    expect(touchStreak(u, "2026-09-05")).toBe(true);
    expect(touchStreak(u, "2026-09-05")).toBe(false);
    touchStreak(u, "2026-09-06");
    expect(u.streak.count).toBe(2);
    touchStreak(u, "2026-09-09");
    expect(u.streak.count).toBe(1);
  });
});
