# Feature: Color palette picker

Status: built, 2026-09-16 (corrected from a first attempt — see below).

## What it does

Four color palettes for the Maximalist theme — Grape (default), Sunset, Forest, Midnight — each a full background/foreground/accent/4-pop-color set. A small swatch picker top-right switches between them instantly, no reload. Persisted in `localStorage` only: no cookie, no server sync, no cache. A fresh browser always starts on Grape.

## Correction: this isn't what got built first

The first pass misread "theme picker" as switching between the three *different UI/UX styles* explored earlier (Maximalist/Editorial/Brutalist) — built and shipped that, then the user corrected it: they meant color palettes *within* Maximalist specifically, not a switcher between entirely different designs. Reverted `app/page.js` back to rendering only `MaximalistTheme`; the Editorial/Brutalist components stay in `app/themes/` (unreferenced, not deleted — real work, might come back as a separate "layout" dimension later) but nothing in the UI currently links to them.

## Implementation

- `lib/palettes.js`: each palette is a flat object of CSS custom property overrides (`--background`, `--foreground`, `--muted`, `--accent`, `--pop-1..4`) plus a label and a swatch color for the picker itself.
- Applied via inline `style` on `MaximalistTheme`'s root element — since every existing Tailwind class already resolves through these CSS variables (`bg-background`, `bg-accent`, `bg-pop-1`, ...), switching the palette repaints the whole page with zero markup/class changes.
- Renamed the CSS variable slots from color-specific names (`--pop-pink`, `--pop-cyan`, ...) to generic ones (`--pop-1..4`) in `app/globals.css` — the old names stopped making sense once the hue at each slot became palette-dependent.
- Same hydration-safe pattern as before: default palette matches server render, `localStorage` is read after mount in a `useEffect` (scoped `eslint-disable` on the `react-hooks/set-state-in-effect` line — a legitimate one-time external-store read, not the anti-pattern that rule exists to catch).
- Unlike the (reverted) full theme switcher, picking a palette does **not** remount the search state — it's the same component, just restyled, so an in-progress search survives a palette change. That's a genuine improvement over the first attempt's behavior, not just a smaller feature.
