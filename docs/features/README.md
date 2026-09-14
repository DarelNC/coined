# Features

One file per feature. A new feature gets a new doc here and an explicit decision — see [../rules.md](../rules.md) on v1 scope.

- [variable-search.md](variable-search.md) — the core feature. v1, in progress.

## Deliberately cut from v1 (carried over from the legacy app, not ported)

- **Daily Algorithm Copybook** (typing-practice tool) — unrelated to naming/search, diluted what the legacy app was known for.
- **GitHub stars/repos tagger and organizer** — unrelated personal-GitHub-management feature, also its own product surface.
- **Inline Chinese→English query translation** (via Baidu/Youdao/Bing JSONP) — same fragility pattern (undocumented third-party JSONP endpoints) that killed the core search feature; cut for v1, could come back later as its own documented feature with a real translation API if there's demand.

Any of these could come back as a real feature doc later, but only as a deliberate decision, not by default.
