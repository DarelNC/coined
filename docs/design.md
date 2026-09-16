# Design

## Role

When touching UI, act as a senior product UI/UX designer with a strong point of view — not as a tool that fills in a scaffold with defaults. Every visual decision (layout, type, color, spacing, motion) should be a decision, not a default.

## The constraint

**Do not ship anything that looks AI-generated.** Every AI-scaffolded site has converged on the same look, and it's now instantly recognizable as "someone let an AI build this." That recognizability is itself the problem this project cannot afford — a public tool asking to be starred/forked needs to look like it was made by a developer with taste, not assembled from a template.

The current `app/page.js` (v1 MVP) is itself already drifting toward this — centered container, `rounded-lg` on everything, plain black/white, default Tailwind spacing scale untouched. Treat it as a first draft to redesign, not a baseline to preserve.

## Banned patterns — if you catch yourself about to ship one of these, stop and redo it

- Purple-to-blue (or blue-to-pink) diagonal gradient backgrounds/buttons.
- A centered hero: big bold heading, subheading, two pill-shaped buttons ("Get Started" / "Learn More").
- Glassmorphism cards — `backdrop-blur` + translucent white border — used as generic decoration rather than for a real reason.
- Gradient text (`bg-clip-text text-transparent`) as a default heading treatment.
- Generic icon-in-a-colored-circle badges, especially from an untouched default icon set (Heroicons/Lucide) dropped in without a distinct visual system around them.
- The 3-column "feature grid": icon, bold title, one-line description, repeated identically three times.
- Stock abstract blob/grid-pattern SVG background decoration.
- Inter (or `font-sans` default) used everywhere with no typographic contrast — no second typeface, no mono accents, no scale personality.
- Neon glow text/borders on a plain dark background as the entire "modern" signal.
- A "Loved by developers" logo strip with no real content behind it.

None of these are wrong in isolation. The problem is that all of them together, untouched from defaults, is the tell. If a specific choice would look identical dropped into a random competitor's landing page, it's generic — change it.

## Do instead: lean into what this product actually is

Coined is a tool built by a developer, for developers, to search real code. The design should say that, not pretend to be a generic SaaS product:

- **Typography with real hierarchy.** Pair a distinct display/serif or characterful sans for headings with a monospace face for anything code-related (search input, results, keywords) — the monospace isn't decoration here, it's literally showing code.
- **A deliberate, non-default color system** tied to the product, not the default purple/blue AI-gradient palette. Pick real values, name them, use them consistently.
- **Let the actual data be the visual centerpiece.** The search results (real variable names, real repos) are the interesting content — design around making *that* compelling, not around decorative chrome surrounding an empty state.
- **Asymmetry and real layout decisions** over "centered content in a max-w container with generous padding" as the only move.
- **Motion with intent** — real hover/focus states and transitions that read as craft, not a static card grid.
- **Custom or heavily adapted iconography/visual details** if icons are used at all, rather than default library icons in default circles.

## Self-check before shipping UI work

Ask: *"Would this specific choice look identical on a random AI-generated SaaS landing page?"* If yes, it's not done yet.

## Previous implementation (v1 redesign, 2026-09-14 — superseded)

Terminal-inspired: warm near-black background, single amber accent, Source Serif 4 wordmark + IBM Plex Mono everything else, left-aligned diff-gutter result rows. Replaced below after exploring three genuinely different directions (editorial/print, neubrutalist, playful/maximalist — see git history for the editorial and brutalist experiments, both were built as real working routes and screenshotted before this one was picked) and choosing maximalist as the shipped default.

## Current implementation (maximalist, 2026-09-16)

- **Palette:** deep plum background (`#2b1a33`), warm cream text (`#fdf6e3`), a 5-color "pop" palette (yellow `--accent`, pink `--pop-pink`, cyan `--pop-cyan`, lime `--pop-lime`, orange `--pop-orange`) cycled per result/example — deliberately more colorful than the single-accent-only rule that governed the previous version, because color variety *is* the point of this direction. No purple/blue-gradient AI look regardless — these are flat, named, deliberate values, not a default gradient.
- **Type:** Fredoka (rounded, playful) for the wordmark and all UI chrome; JetBrains Mono only for the actual result keywords, since those are literally code identifiers.
- **Layout:** rounded pill/badge language throughout, used as a deliberate theme (not a default `rounded-lg` left untouched) — sticker-like result badges with slight per-item rotation, pill buttons and inputs.
- **Motion, added with intent, not decoration:** wordmark wiggles on hover only (not looping — a looping idle animation reads as noisy, not crafted); results pop in with a staggered scale/rotate entrance on arrival; a 3-dot bounce loader communicates the async wait during search. All defined as named keyframes in `app/globals.css` (`wiggle`, `pop-in`, `bounce-dot`), not ad-hoc inline animation.
- **New interaction:** a "🎲 surprise me" button in the idle state runs a random example query — a small bit of personality, not just a static example list.
- **Feature parity maintained:** copy-to-clipboard (click a result keyword), pagination ("show more"), and the full language filter list all carried over from the terminal version — a visual redesign never means losing functionality.
- **No dark/light toggle** — same reasoning as before: this palette is the fixed brand identity, not a default left on.
- Fonts loaded via `next/font/google` in `app/layout.js` (`--font-display`, `--font-mono`); tokens in `app/globals.css` (`--background`, `--foreground`, `--muted`, `--border`, `--accent`, `--pop-*`).
