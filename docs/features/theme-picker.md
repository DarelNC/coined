# Feature: Theme picker

Status: built, 2026-09-16.

## What it does

Three visually distinct themes — Maximalist (default), Editorial, Brutalist — all sharing the same real search behavior. A small dot picker fixed top-right switches between them instantly. The choice persists in `localStorage` only: no cookie, no server sync, no cache. A fresh browser (or private window) always starts on Maximalist.

## Why this shape

The three themes started as separate uncommitted experiment routes (`app/style-*`) built to explore genuinely different UI/UX directions per `docs/design.md`. Once the user wanted to actually pick between them at runtime rather than in code, duplicating the search/copy/pagination logic three times became a real maintenance risk — a bug fixed in one theme's copy-to-clipboard handler wouldn't reach the other two.

Fix: extracted all of it into `lib/useSearch.js`, a single hook with no rendering opinion at all (search, language filter, copy-to-clipboard, pagination — the same logic `docs/rules.md`'s architecture principle already called for keeping separate from where the data comes from, applied here to where the UI renders it instead). Each theme component (`app/themes/*.js`) is purely presentational, calling the same hook. `app/page.js` is now just the picker plus whichever theme component is active.

## Implementation notes

- **Hydration:** the picker's persisted choice is read in a `useEffect` after mount, not during initial render — server and the first client render always agree on the default (Maximalist), so there's no hydration mismatch, at the cost of a possible one-frame flash to a saved non-default theme on reload. Accepted tradeoff for "local only, no cache" simplicity; would need a cookie read on the server to avoid entirely, which wasn't asked for.
- Hit a real ESLint rule (`react-hooks/set-state-in-effect`) on the "read localStorage, then setState" pattern — a legitimate one-time external-store sync, not the derived-state-from-props anti-pattern the rule exists to catch. Scoped `eslint-disable-next-line` with a comment, rather than restructuring into something worse just to satisfy the linter.
- Switching themes remounts the active theme component, so in-progress search state resets — acceptable, not treated as a bug (no user has mid-search state worth preserving across a full visual reskin).
- All three themes kept full feature parity (search, language filter x7, copy-to-clipboard, real pagination) — the two experiment themes didn't have copy-to-clipboard or real pagination in their mockup form; both were added here so switching themes never loses functionality.
