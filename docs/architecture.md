# Architecture

## Project name: Coined, not Codelf (2026-09-15)

This project is called **Coined**, not Codelf. The original `unbug/codelf` is still live — repo, VS Code extension, Vim plugin all still exist, just functionally broken (see below). Shipping an unrelated codebase under the identical name risked looking like squatting on someone else's brand rather than original work. "Codelf" below and throughout these docs refers to the legacy project being analyzed, not this one.

## Legacy analysis (why the original Codelf is broken)

Cloned and inspected [unbug/codelf](https://github.com/unbug/codelf) (2026-09-14) to find the real root cause before designing a replacement.

**What it actually is:** a pure client-side React 16 SPA (Gulp + Webpack build, class-based "Model"/"Store" pub-sub pattern, no Redux). No backend of its own.

**What it actually does — and the real root cause:** despite the README claiming it searches "Github, Bitbucket, Google Code, Codeplex, Sourceforge, Fedora Project, GitLab," the app itself only ever calls **one** upstream: `searchcode.com`'s free public JSONP/REST API (`src/models/SearchCodeModel.js`). Those other source names were just what searchcode.com itself indexed under the hood — Codelf never talked to them directly. **searchcode.com's public code-search API was shut down** (confirmed via web search: the creator killed it because users wouldn't pay for it, then rebooted the whole site in 2026 as an LLM/MCP-oriented code-intelligence service — not a public search API anymore). That single dead dependency is the entire reason Codelf stopped working. Everything else in the app (UI, routing, caching) still runs fine.

**Core logic worth reusing (data-source agnostic):** `_parseVariableList()` in `SearchCodeModel.js` takes raw code-search results (lines of matching code) and regex-extracts identifier-shaped tokens around the search keyword, dedupes them case-insensitively, filters out links/base64 blobs/overlong tokens, and groups matches by source repo. This logic doesn't care where the code lines came from — it's the one piece worth porting conceptually into the rebuild.

**Scope creep in the legacy app (informs our v1 cut list, see [features/variable-search.md](features/variable-search.md)):** the same codebase also bundles a "Daily Algorithm Copybook" (typing-practice tool) and a "GitHub stars/repos tagger and organizer" — two unrelated features that dilute what Codelf is actually known for. Also bundles inline Chinese→English query translation via Baidu/Youdao/Bing JSONP endpoints (three *more* undocumented third-party dependencies, same fragility pattern that killed the core feature).

## New architecture

**Root design rule this project exists to satisfy:** the legacy app died because the browser called an undocumented third-party API directly, with no fallback and no owner-controlled layer in between. The rebuild's #1 architectural constraint is to never repeat that. See [rules.md](rules.md).

```
Browser (Next.js React frontend)
        |
        v
Next.js API routes (serverless, our backend)
        |  - proxies + caches upstream calls
        |  - owns API keys, never exposed to client
        |  - can swap/fallback upstream source without a client rebuild
        v
Upstream code-search source(s) — see stack.md for the primary/fallback decision
```

- Frontend calls only our own `/api/*` routes, never a third party directly.
- The API route layer is the single place that knows which upstream(s) exist, handles caching, and can fail over from one source to another.
- Search-result-to-variable-list extraction (the reusable logic identified above) lives in a shared JS module, callable from the API route, unit-testable in isolation from any network call.

## Deployment shape

Single Next.js app, deployed as one unit (frontend + serverless API routes together) — see [stack.md](stack.md) for the specific host decision.
