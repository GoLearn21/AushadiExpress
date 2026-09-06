# Issue tracker

**Choice: local markdown under `.scratch/<feature>/`.**

*Written as the working default — say "GitHub" and this flips in one edit.*

## Why local markdown

This is a solo project. The spec and its tickets are the artifacts that survive a cleared
context window — the entire reason `to-spec` exists — so they live in the repository, next
to the code they describe, and are tracked in git. Local markdown is the documented option
for solo projects.

The repository is now standalone (`tennisapp`), so GitHub Issues is a legitimate alternative.
It is not the default only because the founder works through Claude Code sessions, and a
tracked file is what a fresh session can read without an API call.

## Layout

```
.scratch/
└── <feature>/
    ├── spec.md          ← the to-spec output
    └── issues/NN-<slug>.md   ← tickets from to-tickets
```

Each ticket file carries YAML front matter:

```yaml
---
title: <one line>
status: ready-for-agent   # see docs/agents/triage-labels.md
spec: ../spec.md
---
```

`.scratch/` is git-ignored by default in many setups. **Here it is tracked**, because an
untracked artifact does not survive anything.

## PRs as a request surface

**Off.** Solo project; there are no external contributors whose PRs would need triage.

## If this moves to GitHub later

Flip this file to the GitHub template and the skills switch to `gh issue create` with no other
change. The `.scratch/` history stays as a record.
