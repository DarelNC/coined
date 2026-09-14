# Rules

Lessons learned from the legacy analysis, made explicit so they don't get silently violated later.

## Never call a third-party API directly from the client

This is the one rule this whole rebuild exists to enforce. Legacy Codelf's browser code called `searchcode.com` directly via JSONP; when that free API shut down, the entire app died with no fallback and no way to recover without a full client rebuild. Every upstream call goes through our own `/api/*` route. No exceptions, even for "just one quick fetch."

## Prefer documented, stable APIs over scraping or undocumented endpoints

If an upstream doesn't publish a real API contract, treat it as a bonus fallback at best, never the primary source. See [stack.md](stack.md) for why grep.app was excluded on these grounds.

## Design for upstream failover from day one

The API-route layer must be able to try a secondary source when the primary fails or rate-limits, without a client deploy. Don't hardcode a single upstream assumption into the frontend.

## UI work follows design.md

Any visual/UI work is bound by [design.md](design.md) — no exceptions, no "just this once." See that file for the actual constraints; this is just the pointer so it doesn't get missed.

## v1 scope is the search feature only

Legacy Codelf bundled three unrelated features (variable search, a typing-practice "copybook," a GitHub-stars tagger) into one app. That dilution is part of why it's not clearly known for doing one thing well. New features get their own doc under `features/` and an explicit decision to add them — no silent scope creep back to "everything the old app did."

## Plain JavaScript, not TypeScript

Personal preference over JS. No build-time type checker — keep the tradeoff in check by keeping upstream-facing code (parsing Sourcegraph/GitHub responses) small, isolated, and covered by tests, since that's exactly where an untyped response shape is most likely to drift silently.

## No Claude attribution in commits or PRs

Already enforced globally via the root `CLAUDE.md` — restated here since this file is the durable project memory and that rule applies to every commit made while building this.

## Documentation and critical review are tiered by whether it's actually a decision

Applying full rigor to every single commit is its own failure mode on a solo project — it adds friction until the project stalls, which is worse than the sloppiness it's meant to prevent. So the bar scales with what kind of change it is:

- **Fast lane (most commits):** typo fixes, formatting, copy tweaks, small bug fixes, routine implementation of something already decided. Commit freely — no doc update, no review required.
- **Decision lane (only real decisions):** picking between real alternatives — a new dependency, an architecture/stack choice, a scope call, a UX direction, anything annoying to silently reverse later. For these: write it down in the relevant doc (architecture/stack/rules/feature) as part of the same unit of work, and do one honest adversarial pass — state the strongest reason it might be wrong, overengineered, or premature, before proceeding. If that pass genuinely finds nothing, say so and move on; don't manufacture an objection to look rigorous.
- **Publish gate:** documentation doesn't have to happen before every local commit — it has to be caught up before anything goes public (a push to the remote, a PR). Commit freely within a work session; do a doc-sync pass at the end of the session, before pushing, so nothing decision-worthy ships undocumented.
