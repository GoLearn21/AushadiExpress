# Nestam has moved to its own repository

Everything under `nestam/` in AushadiExpress is the archived first drop. Development continues in
the standalone repository **GoLearn21/nestam** (private), which you create from your Mac:

```bash
curl -fsSL https://raw.githubusercontent.com/GoLearn21/AushadiExpress/claude/andhra-pradesh-sarvam-app-w47bgt/nestam/standalone/bootstrap-nestam-mac.sh -o bootstrap-nestam-mac.sh
bash bootstrap-nestam-mac.sh
```

`nestam.bundle` is a complete git bundle of that repository (full history: server with Vercel +
Supabase support, Unity 6 project, docs, vendored skills, the exported conversation). The bootstrap
clones it, runs `gh repo create GoLearn21/nestam --private`, pushes `main`, and hands over to
`scripts/nestam-mac.sh`.
