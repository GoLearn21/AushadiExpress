# This folder is an export snapshot

The tennis product (Rally) moved to its own repository on 2026-09-06 (ADR-036). This folder is
the exact standalone tree as exported — the same content as `tennisapp.zip` — kept here only so
the relocation survives if the zip is lost.

**Canonical home:** the `tennisapp` GitHub repository (create it from the Mac; `HANDOFF.md` §4).

To recover from this folder instead of the zip:

```bash
git clone -b claude/tennis-app-research-lm585j https://github.com/GoLearn21/AushadiExpress.git
mv AushadiExpress/tennisapp ~/tennisapp && cd ~/tennisapp && rm RELOCATED.md
git init -b main && git add -A && git commit -m "Rally: standalone tennisapp repository"
```

The older copies elsewhere in this branch (`docs/tennis-app/`, `tennis-app/`, `rally/`,
`.scratch/`) predate the export and are superseded by this folder. They can be deleted from the
AushadiExpress branch once the new repository is live.
