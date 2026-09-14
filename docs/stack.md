# Stack

## Frontend + backend: Next.js (App Router) + JavaScript

One framework, one deploy target. API routes give us the "our own backend" proxy layer required by [architecture.md](architecture.md) without standing up a separate service — right-sized for a solo-maintained, free-forever tool. Plain JavaScript throughout (personal preference over TS) — ES modules, JSDoc comments where a type genuinely clarifies a function's contract, but no build-time type checker.

## Styling: Tailwind CSS

Fast to build and theme, standard pairing with Next.js, no design-system decisions to make up front.

## Search data source — the key decision

Legacy Codelf died because its one upstream (searchcode.com's free API) got shut down with no warning and no fallback. Picking a single upstream again would just reset the clock on the same failure. Decision:

- **Primary: Sourcegraph's public code-search GraphQL API.** Free, no auth/API key required for anonymous public-code search, actively maintained, covers a huge swath of public repos. This is the closest modern equivalent of what searchcode.com used to offer.
- **Secondary/fallback: GitHub's REST code-search API**, used when a user (or eventually, our own account) supplies a personal access token — GitHub's unauthenticated code-search rate limit is too low (10 req/min) to rely on alone, but it's a legitimate second source and it's official, so it won't disappear the way a scrappy free API did.
- The API-route proxy layer owns the decision of which upstream answers a given request and can fail over between them — this is exactly the flexibility the legacy client-only architecture didn't have.

**This is a first-draft decision, not locked in** — flag before scaffolding if you want to weigh alternatives (e.g. grep.app has no documented public API so it's excluded; a self-hosted search index was considered and rejected as out of scope for v1).

## Caching

Upstream calls get cached (same query = same result, no need to re-hit Sourcegraph/GitHub every time). Start with in-memory caching inside the API route for v1; revisit a shared store (e.g. Upstash Redis / Vercel KV) once real traffic makes cross-invocation cache misses a measurable cost — not needed on day one.

## Hosting: Vercel

Free tier fits a small public tool, zero-config for Next.js, serverless functions are a natural fit for the API-route proxy layer.

## Testing: Vitest + React Testing Library

Lightweight, standard for a Vite/Next-shaped JS project. The keyword-extraction logic ported from legacy (see architecture.md) is the highest-value thing to unit test first — it's pure, data-source-agnostic, and was the one part of the legacy app that actually worked.

## License: MIT

Legacy Codelf's license field is a non-standard value ("snts") with no clear terms. MIT is the standard, most fork/star-friendly choice for a public dev tool and removes any ambiguity for contributors.
