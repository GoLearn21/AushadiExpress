# Release Notes

## 2026-09-04 — Governor's decisions; Phase 1 platform revised

**Decided (ADR-030–033).** Backend stays TypeScript with managed Postgres/Auth; ADR-026
withdrawn after its central claim measured at ~400 lines. **Phase 1 client is a mobile web app;
native is earned at the city gate** behind a one-week CMP-versus-SwiftUI spike — this overrides
the earlier KMP-first directive for Phase 1, on evidence that did not exist when the directive was
given, and is recorded for veto. Kotlin domain retained as reference; dual-run logic ported to
TypeScript against shared fixtures. Voice: adapter and prototype only in Phase 1.

**Added.** `design/DESIGN-PHILOSOPHY.md` — binding tokens, the five moments, the copy table, the
component allowlist. `research/12`–`16`: competitive verification (Tenisime unverifiable; sixteen
competitors, none with liquidity), Gemini model verification (1.5 Flash retired eleven months;
Live API returns audio *or* structured data), the Quality Match adjudication (composite rejected;
rematch-CTA tap and in-app-originated share adopted), the KMP one-codebase reality check, and the
backend adjudication.

**Corrected.** Three earlier statements of mine: JetBrains names six CMP shared-UI adopters, not
two; iOS binary size is 110–140 MB, not 38–51; and the exit hatch is officially documented, not
our own precaution. Also: my acceptance of an advisor's Tenisime correction was unwarranted —
the claim is unverified in both directions.

**PRD v2.1.** Platform header, §5 (server-ranks rule kept as a choice rather than a constraint),
§7.2, §8.5 (quality drivers), §10 (spike moved to city gate; backend closed).

## 2026-08-27 — Governance review closed; ten defects fixed

Five panels. ADR-025–029 written. PRD v2.0. Ten defects found by running the code rather than
reading it, including an inverted Glicko-2 scale, a live attestation path using a digest with no
match id, and a placement band that was dead code. 92 tests.

## 2026-08-23–26 — Research corpus, mockups, dossier

Ten research streams, ten mockups, IC memo and response, the complete dossier.
