# Feature: Variable/name search

Status: v1 built and working (frontend → `/api/search` → Sourcegraph → extraction → UI), verified live in browser 2026-09-14.

## What it does

User types a word or phrase (what they're trying to name — e.g. "debounce timer"). The app returns real-world variable/function names other developers used in that context, pulled from actual public code, grouped by source repo/language, with a link back to the source.

This is the entire value proposition of Coined. Everything else is secondary.

## Flow

1. User submits a search term via the search bar.
2. Frontend calls our `/api/search` route (never an upstream directly — see [../rules.md](../rules.md)).
3. API route checks cache for this query; on miss, queries the primary upstream (Sourcegraph), falling back to the secondary (GitHub code search) on failure/rate-limit — see [../stack.md](../stack.md).
4. Raw code-search results are run through the keyword-extraction logic (ported concept from legacy `_parseVariableList`, rewritten in plain JS): regex-extract identifier-shaped tokens near the search term, dedupe case-insensitively, filter out links/base64/overlong tokens, group by repo.
5. Result list is cached and returned to the frontend.
6. Frontend renders the grouped variable list; clicking an entry shows the source line/repo link.

## Explicitly out of scope for v1

- Query translation for non-English input — see [README.md](README.md) cut list.

## Language filter: built (2026-09-14)

No longer out of scope — done. `?lang=` param on `/api/search`, passed through to Sourcegraph's own `lang:` query syntax. UI is a row of bracket-style toggles (`[any] [js] [ts] [py] [go] [rust] [java]`, matching the existing `[ search ]` button) rather than a `<select>` — a short, deliberately non-exhaustive list, not a full language picker. Selecting a language re-runs an active search immediately. Cache key includes `lang` so filtered and unfiltered results for the same query don't collide.

## Pagination: built (2026-09-14)

No longer out of scope. Deliberately **not** a second network round-trip per page — the API already fetches up to `count:100` file matches in one request (see the result-count decision above), and extraction typically yields well over 10 unique variables from that. "Load more" just reveals more of the already-fetched, already-extracted list (10 at a time), client-side, instantly. Resets to the first page whenever a new search actually runs (new query or language change). If a query is popular enough to exhaust the full fetched set, the UI just says so (`// that's everything found`) rather than silently re-fetching at a higher count — a real second fetch is a bigger decision (more upstream load) that isn't needed yet.

## GitHub fallback: built (2026-09-14)

No longer a gap. `app/api/search/route.js` now tries an ordered list of sources (`SOURCES`) — Sourcegraph first, then GitHub if Sourcegraph throws — instead of having exactly one upstream, which was the legacy failure shape this whole project exists to avoid.

- **GitHub only activates with `GITHUB_TOKEN` set** (see `.env.example`). Confirmed live that GitHub's code search has zero anonymous access (flat `401`, not a rate limit) — `isGitHubConfigured()` checks for the token and skips GitHub entirely if it's absent, rather than making a doomed request every search. So a fresh clone of this repo with no token configured runs Sourcegraph-only, same as before — nothing breaks, the fallback just isn't active.
- **Verified live (2026-09-14)** once a token became available: real authenticated request against `api.github.com/search/code` for "debounce timer" returned the exact shape `lib/github.js` expects (`repository.html_url`, `path`, `text_matches[].fragment`), and running that response through the actual `extractVariables()` produced 13 correct unique variables (`debounced`, `debounceTimer`, `debounceDelay`, etc.) from 30 file matches. The earlier "unverified" caveat is resolved — both the request shape and the full pipeline are now confirmed against real data, not just mocks.
- `lib/languageFromPath.js` extracted as a shared util once a second upstream client needed the same path→language mapping Sourcegraph's client already had — avoids the two clients drifting out of sync.

## Implementation notes (learned while building)

- Anonymous Sourcegraph GraphQL access works exactly as planned — confirmed live against `sourcegraph.com/.api/graphql` with no token, no rate-limit issues hit during v1 build/testing.
- **Had to exclude prose files from the query** (`lib/sourcegraph.js`, `NON_CODE_FILES` constant: `-file:\.(md|mdx|txt|rst)$`). Without it, results were dominated by README/docs files that happen to mention the search term in prose, not actual variable declarations — defeats the point of "real-world code." Worth remembering if result quality regresses later: check this filter first.
- Files: `lib/extractVariables.js` (pure, ported from legacy, unit tested in `lib/__tests__/`), `lib/sourcegraph.js` (upstream client), `lib/searchCache.js` (in-memory query cache), `app/api/search/route.js` (the proxy route — the only thing the frontend calls), `app/page.js` (search UI).

## Result count: resolved (2026-09-14)

Tested `count:15/30/50/80/100/150/200` against 4 representative queries, measuring unique-variable yield and latency. Findings:

- **Latency stayed flat (~1.2-1.8s) across the whole range** — Sourcegraph's own query/ranking time dominates, not our payload size or parsing. So a higher count is effectively free in response-time terms.
- **Variable diversity kept climbing with count, no clear plateau** even at 200 (e.g. "user session": 34 unique variables at count:15 → 69 at count:200).
- The old default of `count:30` was a guess that undershot badly for some queries (2 unique variables for "debounce timer" vs. 10 at count:200).

**Decision: `count:100`**, not higher, despite latency allowing it. The objection that mattered: this is a free, anonymous, unauthenticated upstream we don't control — the same shape of dependency that killed legacy Codelf. Maximizing load on it by default just because it's currently cheap for us is a bad habit given the project's own founding lesson (see architecture.md). `count:100` gives a clear, measured improvement over the old arbitrary default (roughly 2-4x more unique variables in testing) without being the most aggressive option available.
