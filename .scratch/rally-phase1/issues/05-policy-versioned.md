# 05: Policy, versioned

**What to build:** Fit weights, display policy, reason templates, the copy bundle and feature flags live in a versioned `policy` table with an effective-from date, are served as an immutable versioned JSON document on the CDN, and every response, event and log line carries the version that was live. The Operator can publish a new version and roll back to a previous one, and both actions are audited. A learning can change the product without a release, and every effect is attributable.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] `policy` rows are versioned and immutable; a new version has an effective-from; rollback publishes the prior version as a new row
- [ ] The document is served at a versioned URL with a long cache lifetime; the client carries a baked-in fallback
- [ ] `policy_version` is on every response, every emitted event, and every log line
- [ ] Operator `set policy` and `rollback policy` capabilities exist, are audited with who and when, and record elapsed time
- [ ] A test proves two policy versions produce different reason templates for the same Offer, each stamped with its version
