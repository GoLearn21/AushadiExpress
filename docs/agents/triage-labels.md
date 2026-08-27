# Triage labels

**Defaults kept**, unmodified. The five canonical roles, each label string equal to its name:

| Label | Meaning |
|---|---|
| `needs-triage` | Arrived, not yet assessed. |
| `needs-info` | Blocked on a human answer. Cannot proceed without it. |
| `ready-for-agent` | Fully specified. An agent can pick this up and finish it. |
| `ready-for-human` | Requires judgment, taste, or an out-of-band action an agent cannot take. |
| `wontfix` | Deliberately declined. The reason is recorded on the ticket, never just closed. |

Because the tracker is local markdown (`docs/agents/issue-tracker.md`), a label is the
`status:` field in a ticket's front matter rather than a tracker-side label object.

## One local convention

A ticket may carry **`needs-info` and a proposed answer at the same time.** That is not a
contradiction: the grilling discipline is that the agent finds the *facts* and the user makes
the *decisions*, so a well-formed `needs-info` ticket states what was found and what is
recommended, and waits only for the decision. A `needs-info` ticket with no recommendation
attached is an unfinished ticket.
