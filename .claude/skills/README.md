# Vendored skills

`ask-matt`, `code-review`, `codebase-design`, `diagnosing-bugs`, `domain-modeling`,
`grill-me`, `grill-with-docs`, `grilling`, `handoff`, `implement`,
`improve-codebase-architecture`, `migrate-to-shoehorn`, `prototype`, `research`,
`resolving-merge-conflicts`, `setup-matt-pocock-skills`, `tdd`, `teach`,
`to-questionnaire`, `to-spec`, `to-tickets`, `triage`, `wait-what`, `wayfinder`, `wizard`,
`writing-for-agents`, and the two setup skills are vendored **verbatim** from
[github.com/mattpocock/skills](https://github.com/mattpocock/skills) at commit
`6654f6b60cd9d5be8b54c6fafe44346dabeb3b76` (2026-08-24), MIT licensed — see
`LICENSE-mattpocock-skills`.

**They are unmodified. Do not edit them in place.** If a local variation is ever needed,
add a separate skill that composes them rather than forking one, so upstream stays pullable.

## Two things to know before invoking these

**`grill-me` delegates.** It is a six-line stub whose entire body is *"Call the Skill tool
with 'grilling'."* The algorithm lives in `grilling/`. Both must be installed or `grill-me`
silently does nothing — upstream documents this as a real and unfixed rough edge. The tell
that it failed is a session that asks everything at once with no recommendations attached:
that is improvisation, not the skill.

**`grilling` interviews the *user*, not other agents.** Its rule is explicit: *"Finding
facts is your job, never the user's... The decisions are the user's: put each to them and
wait."* Sub-agents are for fact-finding only. A panel of agents debating each other is a
different technique and must not be described as a grilling — the failure mode grilling
exists to prevent is passivity, and a debate the user only reads is passivity with extra
steps.

**`to-spec` does not interview.** *"Do NOT interview the user; just synthesize what you
already know."* It runs in the same conversation as the grilling, without `/clear` or
`/compact` in between, because the context built during the grilling is the input.

## Not grillable

Upstream draws a line worth repeating: *"How should this interaction feel?"* is
**ungrillable** — it needs something to react to. When a question is ungrillable, stop
grilling and build a throwaway with `prototype`. This applies directly to the voice
experience work in `docs/tennis-app/voice/`.

## Repo configuration these skills read

`setup-matt-pocock-skills` writes `docs/agents/`. See `docs/agents/issue-tracker.md` and
`docs/agents/triage-labels.md`.
