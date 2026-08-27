# Context Map

This repository hosts two unrelated products that share a git history and nothing else.

## Contexts

- [AushadiExpress](./CONTEXT.md): multi-tenant B2C pharmaceutical marketplace — customers
  search medicines and order from local pharmacies; retailers run POS and inventory;
  wholesalers handle B2B. See `CLAUDE.md` for its architecture.
- [Rally](./docs/tennis-app/CONTEXT.md): recreational tennis matchmaking — gets two specific
  people onto a court this weekend. Code in `tennis-app/`, documents in `docs/tennis-app/`.

## Relationships

**None.** These contexts share no types, no events, no database, and no deployment. They are
co-located, not integrated. A term defined in one carries no meaning in the other — "order"
means a medicine purchase in AushadiExpress and means nothing at all in Rally.

Treat a cross-context reference in code or docs as a mistake, not a dependency.

## ADR location

Rally's decisions live in `docs/tennis-app/decisions/adr/ADR-INDEX.md` — a single indexed file
rather than `docs/adr/NNNN-*.md`. This predates the skills being installed and is left as-is:
the index carries 29 accepted ADRs with supersession chains already threaded through it, and
splitting them into files would break every existing cross-reference for no gain.
