# Security

## Reporting a vulnerability

Please don't open a public issue for a security concern. Instead:

- Use GitHub's [private vulnerability reporting](https://github.com/DarelNC/coined/security/advisories/new) for this repo, or
- Email **darelchcrespo@hotmail.com** directly.

Include what you found and, if possible, how to reproduce it. This is a small, actively-maintained open-source project — expect an initial response within a few days.

## Scope

This project proxies public code search (Sourcegraph, optionally GitHub) and holds no user accounts, no user-submitted data, and no secrets beyond an optional server-side `GITHUB_TOKEN` (zero-scope, never exposed to the client — see `docs/rules.md`). Most relevant reports would be about that boundary, or about denial-of-service-shaped abuse of the search endpoint.
