# Feature: Copy-to-clipboard on results

Status: built and verified (mechanically — see caveat below), 2026-09-14.

## What it does

Clicking a result's keyword copies it to the clipboard. No icon — the affordance is a hover animation only: brackets fade in around the word (reusing the existing `[ search ]`/`[ js ]` bracket-button visual language rather than inventing a new one) and the text turns accent-colored, matching every other interactive element already in the UI. On click, the word briefly swaps to "copied" as feedback, then reverts.

## Why the row had to change shape

Previously the entire result row was one `<a>` linking to the source repo. Making the keyword itself clickable-to-copy meant it couldn't also be the thing that navigates — one click can't mean two different things. Split it: the keyword is now its own `<button>` (the chip), and the repo/language meta text on the right is the actual link to source. Both still live under one `<li>` with a shared hover-highlighted left border.

## Implementation notes

- `navigator.clipboard.writeText()`, wrapped in try/catch — a silent no-op on failure rather than a false "copied" claim. Real browsers allow this from a genuine user click without a permission prompt; it only fails in unusual cases (denied permission, non-secure context), where staying silent is the honest behavior.
- **Caveat:** verified the click handler fires, the request reaches `navigator.clipboard.writeText`, and the hover animation renders correctly — but couldn't visually confirm the actual clipboard write or the "copied" text swap in this session's environment, because the automated browser sandbox used for testing denies clipboard permissions outright (`NotAllowedError: Write permission denied`, confirmed by calling the API directly). This is a testing-environment limitation, not an app bug — worth a real manual click-and-paste check in an actual browser at some point.
- Fixed a real accessibility bug caught while building this: the copy button's accessible name was defaulting to the generic `title` text ("click to copy") for every single row — a screen reader would hear the same label repeated with no way to tell results apart. Now uses `aria-label` with the actual keyword ("copy retryCounter", etc).
