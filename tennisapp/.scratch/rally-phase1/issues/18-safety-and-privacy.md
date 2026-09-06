# 18: Safety and privacy

**What to build:** A Player blocks in one tap and the block propagates through matching permanently and in both directions, never explained. A report applies an immediate mutual soft-block, a severity class, per-pair de-duplication, and a 48-hour human SLA; "in danger" pages. A photo is required before the first confirmed match. The 18+ gate is at sign-up. A Player can delete their account — identity erased, match facts kept against "Former player" — and export everything held about them. Every personal-data column is classified in code and checked in CI.

**Blocked by:** 12

**Status:** ready-for-agent

- [ ] Block is bidirectional, permanent, and invisible to both parties; the Matcher never surfaces a blocked pair
- [ ] Report → soft block, severity, de-dupe, SLA queue; 'in danger' writes a paging notification; safety reports never share a queue with app feedback
- [ ] Photo required before first confirmation, resized and EXIF-stripped on upload; 18+ gate at sign-up
- [ ] Delete tombstones and pseudonymises; Attestations persist against 'Former player'; export produces everything held
- [ ] A PII classification exists for every column and a CI check fails on an unclassified column
- [ ] A Player blocked out of a thin Market triggers an Operator alert and is never told why
