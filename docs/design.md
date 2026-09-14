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

Codelf is a tool built by a developer, for developers, to search real code. The design should say that, not pretend to be a generic SaaS product:

- **Typography with real hierarchy.** Pair a distinct display/serif or characterful sans for headings with a monospace face for anything code-related (search input, results, keywords) — the monospace isn't decoration here, it's literally showing code.
- **A deliberate, non-default color system** tied to the product, not the default purple/blue AI-gradient palette. Pick real values, name them, use them consistently.
- **Let the actual data be the visual centerpiece.** The search results (real variable names, real repos) are the interesting content — design around making *that* compelling, not around decorative chrome surrounding an empty state.
- **Asymmetry and real layout decisions** over "centered content in a max-w container with generous padding" as the only move.
- **Motion with intent** — real hover/focus states and transitions that read as craft, not a static card grid.
- **Custom or heavily adapted iconography/visual details** if icons are used at all, rather than default library icons in default circles.

## Self-check before shipping UI work

Ask: *"Would this specific choice look identical on a random AI-generated SaaS landing page?"* If yes, it's not done yet.

## Current implementation (v1 redesign, 2026-09-14)

Concrete system actually shipped, so future changes have a baseline to react to instead of the abstract principles above:

- **Palette:** warm near-black background (`#0c0b09`), warm off-white text (`#efe9dd`), single accent amber (`#e2a63c`) used only for the prompt caret, hover states, and the active result's left border — not decoratively. No purple/blue anywhere.
- **Type:** two faces only. Source Serif 4 (italic) for the wordmark, used exactly once. IBM Plex Mono for literally everything else — input, buttons, results, body copy — since the product's whole subject is code identifiers.
- **Layout:** left-aligned throughout, no centered hero. The page reads like a terminal session: a prompt-style search line (`>` caret, no rounded pill input), results as a plain list with a left-border accent (diff/blame-gutter style) rather than cards in a grid.
- **Empty state:** real example queries the user can click (`// try: debounce timer`), not a decorative illustration.
- **No dark/light toggle** — this dark palette is the fixed brand identity, not a default left on. Revisit only as a deliberate decision, not because it's an obvious gap.
- Fonts loaded via `next/font/google` in `app/layout.js`; tokens defined in `app/globals.css` (`--background`, `--foreground`, `--muted`, `--border`, `--accent`).
