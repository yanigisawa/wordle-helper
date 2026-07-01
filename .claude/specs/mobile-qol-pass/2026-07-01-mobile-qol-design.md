# Mobile QoL Pass — Design

**Date:** 2026-07-01
**Status:** Approved
**Scope source:** Remaining items from `.claude/tasks/mobile-ux-word-suggestions-visibility.md` (Groups 2–3) plus new findings from a fresh mobile review. The sticky summary bar (Group 3) and PWA/home-screen support were explicitly descoped.

## Goal

Make the Wordle Helper faster and less error-prone to use on a phone: less scrolling, bigger tap targets, fewer manual steps between puzzles, and no silent filter failures from mobile keyboard capitalization.

## Changes

### 1. Case-insensitive position filters (bug fix)

`filterLetterPositions()` and `filterIncludedLettersButNotHere()` in `script.js` compare raw input values against word characters (`w[0] !== firstLetter`). A capitalized letter — easy to produce on a mobile keyboard despite `autocapitalize="none"` — silently returns zero matches.

**Fix:** lowercase both sides at comparison time (`w[0].toLowerCase() !== firstLetter.toLowerCase()`), consistent with `filterIncludeLetters()` which already lowercases.

### 2. Condensed letter frequency stats

`displayStats()` renders all letters (including zero counts) as vertical `<li>` items — up to 26 rows of scroll on mobile.

**Change:**
- Only render letters with count > 0. Keep the existing known-letter exclusion.
- Render as a flex-wrapped row of compact chips (e.g. `E 342`, `A 289`) instead of a vertical list.
- Replace `<ul id="wordStats">` in `index.html` with a `<div id="wordStats">`; add a `.stat-chip` CSS class (badge-like: small padding, border-radius, background) and flex-wrap on the container.

Result: ~26 lines collapse into 2–3.

### 3. Collapsible output sections

Wrap the Word Options list body and the Letter Stats body in Bootstrap 5 collapse components (Bootstrap JS is already loaded via CDN — no custom JS needed).

- Section headers become full-width tap targets with `data-bs-toggle="collapse"` / `data-bs-target`, showing the section title, the existing count, and a chevron indicator.
- Both sections default to **expanded** (`.collapse.show`) so current behavior is preserved; collapsing is opt-in.
- The existing refresh button stays functional next to the Word Options header (it must not toggle the collapse — keep it outside the toggle element or stop propagation via markup placement).

### 4. Clear All button

A single "Clear All" button placed near the input controls that:
- Empties all 12 inputs (`exclude`, `include`, the 5 position boxes, the 5 "not here" boxes).
- Resets the display to initial state (hides `#wordOptionDiv`, resets stats to the full word list, resets `wordListExpanded`).
- Focuses the `exclude` input.

No confirmation dialog: re-entering a few letters is cheap, and blocking dialogs are a worse experience on mobile. Button must meet the 44px touch target.

### 5. Backspace navigation in letter boxes

Add a `keydown` listener to `.singleLetters` inputs: when Backspace is pressed in an **empty** box, move focus to the previous sibling input and select its content (standard OTP-style pattern). Complements the existing auto-advance in `handleSingleInput()`.

### 6. Touch target sizing

In the `@media (max-width: 768px)` block of `style.css`:
- Single-letter boxes: 32×38px → **44×50px** (5 × 44px + existing margins still fits a 320px viewport; verify no wrap at 320px).
- Refresh button: 30×30 → **44×44** (adjust the inline style in `index.html`; prefer moving it to a CSS class).
- "Show all" / "Show less" link: add padding so its tap area is ≥ ~44px tall.

### 7. Backlog housekeeping

In `.claude/tasks/mobile-ux-word-suggestions-visibility.md`:
- Check off "Limit default word list display count on mobile" (already implemented in `script.js` as `INITIAL_LIMIT = 50` / `MAX_LIMIT = 200`).
- Check off "Condense letter frequency stats display", "Add collapsible/expandable sections", and "Improve touch targets and mobile input UX" once implemented.
- Leave "Add sticky compact summary bar" unchecked — descoped for this pass, remains in backlog.

## Error handling

- Filters already handle empty inputs (early return of full list); no change.
- Backspace handler must not interfere with normal deletion (only act when the box is already empty).
- Clear All must leave the app in the same state as first page load.

## Testing

Manual only, per repo convention and the `verifier-manual-only` skill:
1. Open `index.html` in a browser; repeat checks at desktop width and ~375px (and 320px for letter-box fit).
2. Uppercase input in position boxes filters correctly (case bug fix).
3. Stats show only nonzero letters as wrapped chips; known letters still excluded.
4. Both collapse toggles expand/collapse; refresh button still works and doesn't toggle collapse.
5. Clear All empties everything and resets the view.
6. Backspace in an empty letter box moves focus backward; typing still auto-advances.
7. All interactive elements comfortably tappable at mobile width.

## Out of scope

- Sticky summary bar (Group 3 backlog item — deferred).
- PWA manifest / apple-touch-icon.
- Any refactor of the filtering pipeline beyond the case fix.
- Automated tests (repo has none by design).
