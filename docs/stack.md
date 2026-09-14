# Stack

## Frontend + backend: Next.js (App Router) + JavaScript

One framework, one deploy target. API routes give us the "our own backend" proxy layer required by [architecture.md](architecture.md) without standing up a separate service — right-sized for a solo-maintained, free-forever tool. Plain JavaScript throughout (personal preference over TS) — ES modules, JSDoc comments where a type genuinely clarifies a function's contract, but no build-time type checker.

## Styling: Tailwind CSS

Fast to build and theme, standard pairing with Next.js, no design-system decisions to make up front.

## Search data source — the key decision

Legacy Codelf died because its one upstream (searchcode.com's free API) got shut down with no warning and no fallback. Picking a single upstream again would just reset the clock on the same failure. Decision:

- **Primary: Sourcegraph's public code-search GraphQL API.** Free, no auth/API key required for anonymous public-code search, actively maintained, covers a huge swath of public repos. This is the closest modern equivalent of what searchcode.com used to offer.
- **Secondary/fallback: GitHub's REST code-search API**, used only when `GITHUB_TOKEN` is configured. **Correction (2026-09-14, tested live):** the original assumption here was wrong — GitHub's code search endpoint has no anonymous access at all (confirmed: an unauthenticated request gets a flat `401 Requires authentication`, not just a low rate limit). So this fallback is opt-in by nature: without a token it's skipped entirely rather than attempted and failing. Still worth having — it's official and won't disappear the way a scrappy free API did — but it's not a safety net that works out of the box for every clone of this repo.
- The API-route proxy layer owns the decision of which upstream answers a given request and can fail over between them (see `SOURCES` in `app/api/search/route.js`) — this is exactly the flexibility the legacy client-only architecture didn't have.

Built 2026-09-14 — no longer a first-draft decision. Alternatives considered and rejected at the time: grep.app (no documented public API), a self-hosted search index (out of scope for a solo-maintained free tool).

## Caching

Upstream calls get cached (same query = same result, no need to re-hit Sourcegraph/GitHub every time). Start with in-memory caching inside the API route for v1; revisit a shared store (e.g. Upstash Redis / Vercel KV) once real traffic makes cross-invocation cache misses a measurable cost — not needed on day one.

## Hosting: Vercel

Free tier fits a small public tool, zero-config for Next.js, serverless functions are a natural fit for the API-route proxy layer.

## Testing: Vitest + React Testing Library

Lightweight, standard for a Vite/Next-shaped JS project. The keyword-extraction logic ported from legacy (see architecture.md) is the highest-value thing to unit test first — it's pure, data-source-agnostic, and was the one part of the legacy app that actually worked.

## License: MIT

Legacy Codelf's license field is a non-standard value ("snts") with no clear terms. MIT is the standard, most fork/star-friendly choice for a public dev tool and removes any ambiguity for contributors.
