# Feature: Variable/name search

Status: v1 built and working (frontend → `/api/search` → Sourcegraph → extraction → UI), verified live in browser 2026-09-14.

## What it does

User types a word or phrase (what they're trying to name — e.g. "debounce timer"). The app returns real-world variable/function names other developers used in that context, pulled from actual public code, grouped by source repo/language, with a link back to the source.

This is the entire value proposition of Codelf. Everything else is secondary.

## Flow

1. User submits a search term via the search bar.
2. Frontend calls our `/api/search` route (never an upstream directly — see [../rules.md](../rules.md)).
3. API route checks cache for this query; on miss, queries the primary upstream (Sourcegraph), falling back to the secondary (GitHub code search) on failure/rate-limit — see [../stack.md](../stack.md).
4. Raw code-search results are run through the keyword-extraction logic (ported concept from legacy `_parseVariableList`, rewritten in plain JS): regex-extract identifier-shaped tokens near the search term, dedupe case-insensitively, filter out links/base64/overlong tokens, group by repo.
5. Result list is cached and returned to the frontend.
6. Frontend renders the grouped variable list; clicking an entry shows the source line/repo link.

## Explicitly out of scope for v1

- Language filter (legacy had `&lan=` filtering) — worth adding later once the core loop works, not blocking v1.
- Query translation for non-English input — see [README.md](README.md) cut list.
- Pagination beyond a first page of results — revisit once real usage shows it's needed.

## Implementation notes (learned while building)

- Anonymous Sourcegraph GraphQL access works exactly as planned — confirmed live against `sourcegraph.com/.api/graphql` with no token, no rate-limit issues hit during v1 build/testing. GitHub fallback not needed yet; revisit if that changes.
- **Had to exclude prose files from the query** (`lib/sourcegraph.js`, `NON_CODE_FILES` constant: `-file:\.(md|mdx|txt|rst)$`). Without it, results were dominated by README/docs files that happen to mention the search term in prose, not actual variable declarations — defeats the point of "real-world code." Worth remembering if result quality regresses later: check this filter first.
- Files: `lib/extractVariables.js` (pure, ported from legacy, unit tested in `lib/__tests__/`), `lib/sourcegraph.js` (upstream client), `lib/searchCache.js` (in-memory query cache), `app/api/search/route.js` (the proxy route — the only thing the frontend calls), `app/page.js` (search UI).

## Open questions (not yet resolved)

- Exact result volume/`count:` tuning for a useful spread of variable names per search — currently `count:30`, not yet tuned against real usage.
