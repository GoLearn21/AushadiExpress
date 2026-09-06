import { describe, it, expect, afterAll } from "vitest";
import { harness } from "./harness.js";

const h = harness();
afterAll(() => h.close());

describe("status capability (ticket 01)", () => {
  it("returns the served policy version, the minimum supported client, and a request id", async () => {
    const res = await h.call("/status");
    expect(res.status).toBe(200);
    // Every response carries a request id the client can show on its "couldn't sync" state.
    expect(res.headers.get("x-rally-req")).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/); // ULID
    // Authenticated or not, nothing here is cacheable by an intermediary.
    expect(res.headers.get("cache-control")).toBe("private");
    const body = await res.json();
    expect(body).toEqual({
      policyVersion: expect.any(Number),
      minSupportedClient: expect.any(String),
      database: "ok",
    });
  });

  it("proves the harness is on a real database, not a stub", async () => {
    const [row] = await h.sql`select 1 as one`;
    expect(row?.one).toBe(1);
  });
});
