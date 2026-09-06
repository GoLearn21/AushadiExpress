# 06: Onboarding, complete

**What to build:** A Returner opens the app, sees the Market before being asked for anything, picks a Band from five behavioural descriptions, answers how long since they played regularly, and is seeded below their declared Band with wide uncertainty. A Player who knows their NTRP types it. The account wall appears only when they tap a specific person after the reveal. Abandoning mid-way and returning resumes. No point estimate is ever shown while the model is not confident, and the range shown sits inside the real scale and is narrow enough to act on.

**Blocked by:** 02, 05

**Status:** ready-for-agent

- [ ] Five description-anchored Band cards, no numbers; the rust adjuster; a typed NTRP/UTR bypass stored as self-declared
- [ ] The seeded rating is below the declared Band; the Glicko port passes the Glickman worked example and the display-clamp fixtures at Seam 2
- [ ] Display gates on φ against the served policy threshold, never a match count; the provisional display has no point-estimate field
- [ ] Every seed's displayed range is inside the scale and at most ~1 band wide
- [ ] The first three Matches are the Placement window; a result inside it never moves the Band down; copy is 'we found your level'
- [ ] Account creation is deferred to the tap on a person after the reveal; each onboarding step persists so abandonment resumes
