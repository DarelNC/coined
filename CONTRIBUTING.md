# Contributing

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`. The core search works out of the box (anonymous Sourcegraph, no setup needed). The GitHub fallback is optional — copy `.env.example` to `.env.local` and set `GITHUB_TOKEN` (a classic PAT with zero scopes) if you want to exercise that path too.

```bash
npm run lint
npm test
```

Both run in CI on every push/PR — a red check blocks merge.

## Before opening a PR

This repo keeps a written decision log under `docs/` (architecture, stack, rules, design, one file per feature) — read `docs/rules.md` first, it's short. The two things that actually matter:

1. **If your change is a real decision** (a new dependency, a scope change, an architecture/UX call — not a typo fix or a small bug fix), update the relevant doc under `docs/` as part of the same PR. The commit/PR shouldn't be the first place a decision is recorded.
2. **v1 scope is the search feature.** Adding something outside that (a new feature entirely) needs its own doc under `docs/features/` and should be raised as an issue first, not just shipped in a PR — see `docs/features/README.md` for what's already been deliberately cut and why.

UI changes are bound by `docs/design.md` — skim it before touching anything visual, it's specifically about avoiding the generic "AI-generated SaaS" look.

## Everything else

Small fixes, typos, dependency bumps — just open a PR, no ceremony needed.
