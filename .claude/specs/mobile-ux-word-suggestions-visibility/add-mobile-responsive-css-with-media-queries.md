# Spec: Add mobile-responsive CSS with media queries
> From: .claude/tasks/mobile-ux-word-suggestions-visibility.md

## Objective

Add `@media` query rules to `style.css` that activate at `max-width: 768px` to improve the layout and usability of the Wordle Helper on narrow phone viewports. Without these rules, heading text is oversized, vertical spacing is excessive, the five single-letter input boxes risk overflowing or wasting horizontal space, the `.wrapper` side margins waste screen width, and paragraph text is larger than necessary for dense information display on small screens.

## Current State

All relevant rules are in `/Users/jalexander/src/wordle-helper/style.css`. No `@media` queries exist in the file today.

Key measurements from the current stylesheet:

- **`.wrapper`** (line 119-122): `margin: 0 1rem` — adds 1rem of horizontal margin on both sides on every screen size.
- **`.title`** (line 132-139): `font-size: 100px` — a decorative class, not used on the current `<h1>` in `index.html`, but present in the stylesheet.
- **`h2, h1`** (line 202-204): No explicit `font-size` is set; sizing falls back to the browser / Bootstrap defaults (Bootstrap sets `h1` ≈ 2.5rem, `h2` ≈ 2rem). These headings consume significant vertical space on mobile.
- **`input.singleLetters`** (lines 169-179): `width: 40px; height: 45px; margin: 0.25rem 0.5rem`. Five boxes in a flex row at this width + margins = 5 × (40 + 2 × 8px) ≈ 280px of minimum space, which fits narrow viewports but leaves very little room once borders and the container's own margin are factored in. Reducing box size and/or horizontal margin on mobile provides cleaner presentation.
- **`p`** (lines 230-233): `font-size: 1.25em` — slightly large for dense text on a narrow screen.

Key measurements from `/Users/jalexander/src/wordle-helper/index.html`:

- **Line 70**: A bare `<br />` sits between the two groups of single-letter input boxes (`#letterBoxes` and `#exLetterBoxes`). This adds extra vertical gap that is proportionally larger on a short phone screen.
- **`mb-3` Bootstrap class** (lines 47, 53): Applied to the two `.input-group` wrappers around the exclude/include text inputs. `mb-3` is `margin-bottom: 1rem`; on mobile this spacing can be reduced.

The `index.html` viewport meta tag (`width=device-width, initial-scale=1`) is already present (line 11), so media queries will behave correctly on real devices.

## Requirements

1. A single `@media (max-width: 768px)` block is appended at the end of `style.css`.
2. Inside that block, `h1` font size is reduced to no more than `1.75rem`.
3. Inside that block, `h2` font size is reduced to no more than `1.35rem`.
4. Inside that block, `.wrapper` horizontal margin is reduced to `0` (or `0 0.25rem`) so the full viewport width is available to content.
5. Inside that block, `input.singleLetters` width is reduced (target: `32px`–`36px`), height is reduced (target: `38px`–`42px`), and horizontal margin is reduced (target: `0.1rem`–`0.25rem` per side) so all five boxes fit comfortably within a 320px–375px viewport without overflow.
6. Inside that block, `p` font size is reduced to no more than `1em`.
7. No changes are made to `index.html`. Spacing introduced by `<br />` (line 70) and Bootstrap `mb-3` classes is accepted as-is; the spec scope is CSS only.
8. No existing rules outside the new `@media` block are modified.
9. The new `@media` block does not affect any layout at viewport widths wider than 768px.

## Implementation Details

**File to modify:** `/Users/jalexander/src/wordle-helper/style.css`

**Where to add:** Append a new `@media` block after the last existing rule (currently `p { color: ...; font-size: 1.25em; }` at line 230).

**Contents of the new block (representative — exact values may be tuned during implementation):**

```css
@media (max-width: 768px) {
  h1 {
    font-size: 1.75rem;
  }

  h2 {
    font-size: 1.35rem;
  }

  .wrapper {
    margin: 0;
  }

  input.singleLetters {
    width: 34px;
    height: 40px;
    margin: 0.25rem 0.15rem;
  }

  p {
    font-size: 1em;
  }
}
```

**Integration points:**

- The `h1` rule overrides Bootstrap's default heading scale for `h1` elements (Bootstrap targets `.h1` and the element selector `h1` in its reboot/typography). Because `style.css` is loaded after Bootstrap (see `index.html` lines 22-26), the element-level rule in `style.css` wins without needing `!important`.
- The `h2` rule similarly overrides Bootstrap's `h2` default at this breakpoint.
- `.wrapper` — `margin: 0` overrides the `margin: 0 1rem` set at line 121 of `style.css`.
- `input.singleLetters` — all three properties (`width`, `height`, `margin`) are already declared in the base rule, so the `@media` values simply override them at narrow widths. The `.singleLetters` class has higher specificity than a plain element selector, so no specificity conflicts exist.
- `p` — overrides the base `font-size: 1.25em` set at line 232. The `color` property from the base rule is not touched.

**No new HTML, JavaScript, or additional CSS files are needed.**

## Dependencies

- Blocked by: None — this task is non-blocking and can be implemented independently.
- Blocking: Any task that adds new UI components should be authored with the mobile breakpoint in mind, but this task does not need to complete before those tasks begin.

## Risks & Edge Cases

- **Bootstrap specificity conflicts**: Bootstrap's utility classes (e.g., `mb-3`) use low-specificity element/class selectors. The heading and paragraph overrides in the new `@media` block should win without `!important` because `style.css` is declared after Bootstrap's stylesheet in `index.html`. If a conflict is found during testing, increase specificity by qualifying with `.instructions h1` etc. rather than adding `!important`.
- **Five-box overflow at very narrow widths (320px)**: At 320px viewport width with `margin: 0` on `.wrapper`, the five `.singleLetters` boxes at `34px` width + `0.15rem` (≈2.4px) per side margin × 2 sides × 5 boxes = 5 × (34 + 4.8) ≈ 194px — well within 320px. Verify on a real 320px-wide device or browser dev tools to ensure no overflow occurs.
- **The `#letterBoxes` and `#exLetterBoxes` flex containers**: Both use `display: flex` (defined in `#letterBoxes` at line 181; `#exLetterBoxes` inherits the same class indirectly via `.singleLetters`). If the boxes are still too wide at minimum breakpoints, adding `flex-wrap: wrap` on `#letterBoxes` and `#exLetterBoxes` within the `@media` block is an acceptable fallback, though it should not be needed at the recommended sizes.
- **`.title` class**: The `font-size: 100px` rule on `.title` (line 136) is not used by the current `index.html` `<h1>` element (which has no `.title` class), so it does not need a mobile override in this task. If `.title` is later applied to a heading, it should receive its own `@media` rule at that time.
- **`<br />` vertical spacing**: The `<br />` at line 70 of `index.html` is outside the scope of this task (CSS-only change). If the extra gap remains objectionable on mobile after this task ships, a follow-up task should target it with `br { display: none; }` inside the `@media` block or by removing the element from the HTML.
- **Viewport meta tag**: Already present in `index.html` (`width=device-width, initial-scale=1`), so media queries will function correctly on iOS Safari and Android Chrome without any further changes.

## Verification

1. Open `index.html` in a browser (Chrome/Firefox/Safari DevTools or a real device).
2. Activate responsive mode and set the viewport to 375px wide (iPhone SE / standard phone width).
3. Confirm `h1` ("Wordle Helper") renders noticeably smaller than on desktop — target: ≤ 1.75rem.
4. Confirm both `h2` headings ("Known Letter Positions", "Include But NOT HERE", etc.) render noticeably smaller — target: ≤ 1.35rem.
5. Confirm the five `.singleLetters` boxes in `#letterBoxes` (and `#exLetterBoxes`) all fit on a single row without horizontal scroll at 375px viewport width.
6. Confirm no horizontal scroll bar appears at 320px viewport width.
7. Confirm the `.wrapper` container has no visible side margin / gap at 375px — content reaches to (or very close to) the edge of the viewport.
8. Confirm paragraph text below the `<hr />` is rendered at approximately `1em` (≈16px) rather than `1.25em` (≈20px).
9. Switch to a desktop viewport (≥ 769px) and verify all measurements revert to their pre-existing values — heading sizes, box sizes, paragraph size, and wrapper margin — confirming the `@media` block does not affect desktop layout.
