/**
 * Canonical score encoding, version 1 — the TypeScript port of the Kotlin reference.
 *
 * The digest is the only thing dual attestation compares, so this is the single point where a
 * client/server disagreement silently converts an agreement into a dispute. It is verified
 * against the same fixture file as the Kotlin suite (Seam 2); the fixtures are the contract.
 *
 * FROZEN. Never edit encodeV1 — add encodeV2 beside it and new fixtures beside the old.
 */
import { createHash } from "node:crypto";

/** Match-absolute sides. 0 is A, 1 is B. Never "me" and "them". */
export type Side = 0 | 1;

export type ScoreReport =
  | { outcome: "completed"; sets: ReadonlyArray<readonly [number, number]> }
  | { outcome: "retired"; sets: ReadonlyArray<readonly [number, number]>; side: Side }
  | { outcome: "walkover"; side: Side }
  | { outcome: "double_default" };

export const CANON_V1 = 1;

/** Outcome wire tags. Permanent constants, never derived from an enum position. */
const TAG = { completed: 1, retired: 2, walkover: 3, double_default: 4 } as const;

const MATCH_ID = /^[ -~]{1,64}$/; // printable ASCII: injective in the preimage, no lossy encoding

export function encodeV1(matchId: string, report: ScoreReport): Uint8Array {
  if (!MATCH_ID.test(matchId)) throw new Error("matchId must be printable ASCII (digest safety)");
  const out: number[] = [];
  writeU32(out, CANON_V1);
  writeU32(out, matchId.length);
  for (const ch of matchId) out.push(ch.charCodeAt(0));
  switch (report.outcome) {
    case "completed":
      out.push(TAG.completed); writeSets(out, report.sets); break;
    case "retired":
      out.push(TAG.retired); writeSets(out, report.sets); out.push(report.side); break;
    case "walkover":
      out.push(TAG.walkover); out.push(report.side); break;
    case "double_default":
      out.push(TAG.double_default); break;
    default: {
      const never: never = report; // exhaustive: a new outcome fails to compile
      throw new Error(`unknown outcome ${String(never)}`);
    }
  }
  return Uint8Array.from(out);
}

export function digest(matchId: string, report: ScoreReport): { hex: string; canon: number } {
  const bytes = encodeV1(matchId, report);
  return { hex: createHash("sha256").update(bytes).digest("hex"), canon: CANON_V1 };
}

/** Flip a report entered from the other player's perspective into match-absolute sides. */
export function mirror(report: ScoreReport): ScoreReport {
  switch (report.outcome) {
    case "completed": return { outcome: "completed", sets: report.sets.map(([a, b]) => [b, a] as const) };
    case "retired": return { outcome: "retired", sets: report.sets.map(([a, b]) => [b, a] as const), side: other(report.side) };
    case "walkover": return { outcome: "walkover", side: other(report.side) };
    case "double_default": return report;
  }
}

const other = (s: Side): Side => (s === 0 ? 1 : 0);

function writeU32(out: number[], v: number) {
  out.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
}
function writeSets(out: number[], sets: ReadonlyArray<readonly [number, number]>) {
  if (sets.length > 0xff) throw new Error("set count would truncate to a byte");
  out.push(sets.length);
  for (const [a, b] of sets) {
    if (a < 0 || a > 99 || b < 0 || b > 99) throw new Error("game count out of range");
    out.push(a, b);
  }
}
