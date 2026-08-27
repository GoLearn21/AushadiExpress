# Issue tracker

**Choice: local markdown under `.scratch/<feature>/`.**

*Recommended, and written as the working default — say "GitHub" and this flips in one edit.*

## Why not GitHub, when there is a GitHub remote

The `git remote` points at `GoLearn21/AushadiExpress`, and the skills default to GitHub when
one exists. It is declined here for one specific reason: **this repository hosts two unrelated
projects.** `AushadiExpress` is a pharmaceutical marketplace; the tennis product lives in
`docs/tennis-app/` and `tennis-app/` and shares nothing with it but a git history. Filing tennis
specs into the AushadiExpress issue tracker would put them in front of the wrong readers and
mix two backlogs that have no relationship.

Local markdown is also the documented option for solo projects, which this is.

## Layout

```
.scratch/
└── <feature>/
    ├── spec.md          ← the to-spec output
    └── NNN-<slug>.md    ← tickets from to-tickets
```

Each ticket file carries YAML front matter:

```yaml
---
title: <one line>
status: ready-for-agent   # see docs/agents/triage-labels.md
spec: ./spec.md
---
```

`.scratch/` is git-ignored by default in many setups. **Here it is tracked**, because the spec
is the artifact that survives a cleared context window — the entire reason `to-spec` exists —
and an untracked artifact does not survive anything.

## PRs as a request surface

**Off.** Solo project; there are no external contributors whose PRs would need triage.

## If this moves to GitHub later

Flip this file to the GitHub template and the skills switch to `gh issue create` with no other
change. The `.scratch/` history stays as a record.
