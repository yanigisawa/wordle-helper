# Spec: Fix showResults() element ID mismatch
> From: .claude/tasks/mobile-ux-word-suggestions-visibility.md

## Objective

Ensure the `showResults()` function can locate the word-options container element in the DOM so that the results section becomes visible when the user interacts with any filter input. Currently `showResults()` silently fails on every call because the ID it looks up does not exist, leaving the results section permanently hidden.

## Current State

Three locations reference the same logical element with inconsistent IDs:

**`script.js` line 7** — looks up a non-existent element:
```js
function showResults() {
  const d = document.getElementById("wordOptionDiv");
  d.style.display = "block";   // d is null; throws TypeError or silently fails
}
```

`showResults()` is called in three places within `script.js`:
- Line 178: `handleGroupInput()` — fires on every `input` event from the group letter text boxes
- Line 190: `refreshOptions()` — fires when the refresh button is clicked
- Line 196: `handleSingleInput()` — fires on every `input` event from the single-letter position boxes

**`index.html` line 85** — the actual element uses a different ID:
```html
<div id="wordOptionDiv1">
```

**`style.css` lines 185-187** — the `display: none` rule targets the non-existent ID:
```css
#wordOptionDiv {
  display: none;
}
```

Because the CSS selector `#wordOptionDiv` never matches any element, `wordOptionDiv1` has no `display: none` rule, which means the results section is currently always visible rather than hidden on initial load. When `showResults()` is called, `document.getElementById("wordOptionDiv")` returns `null`, and the subsequent `d.style.display = "block"` throws an uncaught `TypeError`, aborting any remaining logic in the calling function.

## Requirements

- The ID used by `document.getElementById()` in `showResults()` in `script.js` must exactly match the `id` attribute on the corresponding `<div>` in `index.html`.
- The CSS selector in `style.css` that applies `display: none` must exactly match the same ID so that the element is hidden on page load and only shown after `showResults()` is called.
- All three references (JS, HTML, CSS) must use the same, single, consistent ID value.
- `showResults()` must not throw a `TypeError` when called.
- The results section (`wordOptionDiv` container including the "Word Options" heading, word count span, refresh button, and word list paragraph) must be hidden when the page first loads and must become visible the first time any filter input receives input.
- No other behavior, styling, or element structure should change as part of this fix.

## Implementation Details

The simplest fix is to update the two references in JS and CSS to match the ID already present in the HTML (`wordOptionDiv1`), avoiding any change to the HTML.

**Files to modify:**

1. `/Users/jalexander/src/wordle-helper/script.js` — line 7
   - Change `document.getElementById("wordOptionDiv")` to `document.getElementById("wordOptionDiv1")`.

2. `/Users/jalexander/src/wordle-helper/style.css` — lines 185-187
   - Change the selector `#wordOptionDiv` to `#wordOptionDiv1`.

**Alternative approach** (equally valid): rename the HTML element's `id` from `wordOptionDiv1` to `wordOptionDiv` in `index.html` line 85, and leave JS and CSS unchanged. This approach is cleaner because `wordOptionDiv` (without the trailing `1`) is the more descriptive name, and no other element in the HTML uses that base name, so there is no reason for the `1` suffix. Either approach resolves the bug; the implementation should pick one and apply it consistently across all three files.

**No new functions, types, or interfaces are required.** The change is purely a string correction.

## Dependencies

- Blocked by: None
- Blocking: Any future layout or show/hide work that relies on the word-options container being correctly toggled (the results section cannot be reliably shown or hidden programmatically until this is fixed)

## Risks & Edge Cases

- **Choosing the wrong direction**: Whichever ID value is chosen must be applied consistently to all three locations simultaneously. A partial fix (e.g., updating JS but not CSS) will restore `showResults()` functionality but leave the element visible on initial page load instead of hidden, which changes perceived UX.
- **Other references to the old ID**: A codebase-wide search for both `wordOptionDiv` and `wordOptionDiv1` should be done before committing to confirm no additional references (e.g., in comments, future script additions, or inline `onclick` attributes) are left pointing to the old name.
- **No automated tests**: Because the project has no test suite, the fix must be verified manually in a browser. The TypeError currently thrown by `showResults()` may be swallowed silently in some browser configurations; manual verification is the only reliable confirmation.

## Verification

1. Open `index.html` in a browser (directly or via `python -m http.server`).
2. Confirm the "Word Options" section is **not visible** on initial page load (the `display: none` CSS rule must apply).
3. Type any letter into the "Exclude These Letters" or "Include These Letters" text box.
4. Confirm the "Word Options" section **becomes visible** and displays a filtered word list.
5. Open the browser developer console and confirm **no `TypeError`** is thrown when interacting with the inputs.
6. Click the refresh button inside the results section and confirm results update without console errors.
7. Type a letter into any single-letter position box and confirm results update and remain visible without console errors.
8. Perform a text search across the entire repository for both `wordOptionDiv` and `wordOptionDiv1` to confirm all three locations (JS, HTML, CSS) use exactly one consistent ID value and no stale reference remains.
