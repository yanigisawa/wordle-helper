# Spec: Reorganize page layout to prioritize output sections on mobile
> From: .claude/tasks/mobile-ux-word-suggestions-visibility.md

## Objective

Restructure `index.html` so that the most actionable output sections — Remaining Word Stats and Starting Words — appear immediately after the input controls, with the full Word Options word list moved further down the page. On a mobile device the current layout forces a user to scroll past up to 200 rendered words before reaching the letter-frequency stats and suggested starting words, which are the outputs that most directly guide the next guess. The reordering ensures that, after filling in the filter inputs, a single thumb-scroll reveals both the stats and the starting word suggestions without having to wade through the long word list first.

## Current State

### `index.html` lines 85-127 — output section order

```html
<div id="wordOptionDiv1">
  <span style="display: flex;">
    <h2>
      Word Options <span id="wordCount"></span>
    </h2>
    <button type="button" onclick="refreshOptions()"
      style="margin-left: 5px; height:30px; width: 30px; padding: 0">
      <img src="refresh.svg" width="16px" height="16px" />
    </button>
  </span>

  <p id="wordList">
  </p>
</div>
<hr />
<span style="display: flex;">
  <h2>
    Remaining Word Stats
  </h2>
</span>
<ul id="wordStats">
</ul>
<hr />
<span style="display: flex;">
  <h2>
    Starting Words
  </h2>
  <button type="button" onclick="refreshRecommendations()"
    style="margin-left: 5px; height:30px; width: 30px; padding: 0">
    <img src="refresh.svg" width="16px" height="16px" />
  </button>
</span>

<ul id="recommdedStartingWords">
</ul>
<hr />
<p>
  Once you type at least 1 letter, the top 200 alphabetically remaining
  words will appear above. As you guess more and more letters in wordle, you'll have more information to enter
  here to
  exclude or include.
</p>
```

The current render order is:
1. Word Options heading + word list (up to 200 words in `<p id="wordList">`)
2. Remaining Word Stats (`<ul id="wordStats">`)
3. Starting Words (`<ul id="recommdedStartingWords">`)
4. Explanatory paragraph

### `script.js` — functions that write to these elements

- `filterResults()` (lines 146-173): populates `#wordList`, `#wordCount`, and calls `displayStats()`.
- `displayStats()` (lines 288-292): populates `#wordStats` from the filtered word list.
- `refreshRecommendations()` (lines 294-300): populates `#recommdedStartingWords` and calls `displayStats(words)` with the full word list.

None of these functions depend on the DOM order of their target elements, so reordering the HTML sections does not require any JavaScript changes.

### `style.css` — relevant rule

```css
#wordOptionDiv {
  display: none;
}
```

Note: this CSS rule targets `#wordOptionDiv`, not `#wordOptionDiv1` (the actual element ID), so the hide-on-load behaviour is currently broken. This is tracked separately in the "Fix showResults() element ID mismatch" spec. The layout reorder spec should not attempt to fix that bug; it is listed as a dependency that must be resolved first.

### `script.js` — `showResults()` (line 6-9)

```js
function showResults() {
  const d = document.getElementById("wordOptionDiv");
  d.style.display = "block";
}
```

`showResults()` is responsible for making `#wordOptionDiv1` visible after the first user interaction. Because it currently looks up the wrong ID, this is also broken and tracked in the dependency spec. After the dependency is resolved, `showResults()` will correctly toggle the word-options container; the reorder must preserve the element structure that `showResults()` targets.

## Requirements

1. The "Remaining Word Stats" section (heading + `<ul id="wordStats">`) must appear in the DOM after the input controls and before the `#wordOptionDiv1` word-options container.
2. The "Starting Words" section (heading + refresh button + `<ul id="recommdedStartingWords">`) must appear after "Remaining Word Stats" and before `#wordOptionDiv1`.
3. The full "Word Options" container (`<div id="wordOptionDiv1">`, including the heading, word count, refresh button, and `<p id="wordList">`) must appear after "Starting Words".
4. The explanatory paragraph (`<p>Once you type at least 1 letter...`) must remain at the end of the output area, below the word list.
5. The `id`, `class`, and `onclick` attributes of every moved element must be preserved exactly as they are in the original HTML.
6. No JavaScript changes are required; the reorder must be achieved by HTML restructuring alone.
7. The visual appearance and functionality of each section must be identical to the current implementation after the reorder; only the vertical position on the page changes.
8. The `<hr />` separators between sections must be retained and placed between each reordered section in the new order.
9. The page must remain valid HTML5 after the change.

## Implementation Details

### File to modify

**`/Users/jalexander/src/wordle-helper/index.html`** — lines 85-127

Replace the current block (lines 85-127) with the same elements reordered as follows:

**New order:**

```
1. Remaining Word Stats (heading + <ul id="wordStats">)
<hr />
2. Starting Words (heading + refresh button + <ul id="recommdedStartingWords">)
<hr />
3. Word Options container (<div id="wordOptionDiv1"> ... </div>)
<hr />
4. Explanatory paragraph
```

The reordered HTML block should look like:

```html
<span style="display: flex;">
  <h2>
    Remaining Word Stats
  </h2>
</span>
<ul id="wordStats">
</ul>
<hr />
<span style="display: flex;">
  <h2>
    Starting Words
  </h2>
  <button type="button" onclick="refreshRecommendations()"
    style="margin-left: 5px; height:30px; width: 30px; padding: 0">
    <img src="refresh.svg" width="16px" height="16px" />
  </button>
</span>

<ul id="recommdedStartingWords">
</ul>
<hr />
<div id="wordOptionDiv1">
  <span style="display: flex;">
    <h2>
      Word Options <span id="wordCount"></span>
    </h2>
    <button type="button" onclick="refreshOptions()"
      style="margin-left: 5px; height:30px; width: 30px; padding: 0">
      <img src="refresh.svg" width="16px" height="16px" />
    </button>
  </span>

  <p id="wordList">
  </p>
</div>
<hr />
<p>
  Once you type at least 1 letter, the top 200 alphabetically remaining
  words will appear above. As you guess more and more letters in wordle, you'll have more information to enter
  here to
  exclude or include.
</p>
```

No other files need to be modified for this task.

### Integration points

- `displayStats()` writes to `#wordStats` — element ID is unchanged, no impact.
- `filterResults()` writes to `#wordList` and `#wordCount` — element IDs are unchanged, no impact.
- `showResults()` looks up `#wordOptionDiv` (broken until the dependency spec is resolved) and will look up `#wordOptionDiv1` after that fix — element ID is unchanged, no impact.
- `refreshRecommendations()` writes to `#recommdedStartingWords` — element ID is unchanged, no impact.
- The Bootstrap 5 JS bundle (loaded at line 134) is not affected.

## Dependencies

- Blocked by:
  - **Fix showResults() element ID mismatch** — The `#wordOptionDiv1` element's show/hide behaviour must be working correctly before layout changes are verified, because if the element is never hidden it cannot be confirmed that reveal-on-first-input still works after the reorder.
  - **Add collapsible/expandable sections for verbose output** — Listed in the task file as a downstream dependent. This spec should be completed and merged before the collapsible-sections work begins, as that task will wrap these same sections in Bootstrap collapse containers and the DOM structure established here is the baseline it operates on.
  - **Limit default word list display count on mobile** — Also a downstream dependent that modifies `filterResults()` and the word list container. The reordered position of `#wordOptionDiv1` is the starting point for that work.

- Blocking:
  - "Add collapsible/expandable sections for verbose output"
  - "Limit default word list display count on mobile"

## Risks & Edge Cases

- **`showResults()` ID mismatch**: Until the dependency spec is resolved, `#wordOptionDiv1` is not hidden on page load (the CSS rule targets `#wordOptionDiv`) and `showResults()` does not successfully show it. The reorder will not break any existing behaviour, but the show/hide verification step cannot be fully confirmed until that fix is applied. Do not attempt to fix the ID mismatch as part of this task.

- **`refreshRecommendations()` calls `displayStats(words)` on page load**: On initial page load, `refreshRecommendations()` (line 303 of `script.js`) is called immediately, which populates both `#recommdedStartingWords` and `#wordStats` with data derived from the full word list. This means both sections will have visible content before the user types anything. After the reorder, this content will appear near the top of the page, which is the desired behaviour — the user sees suggested starting words immediately. No code change is needed; this is a beneficial side effect of the reorder.

- **Explanatory paragraph context**: The paragraph currently says "the top 200 alphabetically remaining words will appear above." After the reorder, the word list is still above the paragraph, so the text remains accurate.

- **No build process**: This is a static site with no bundler or template engine. The edit is purely textual surgery on `index.html`. There is no risk of a build step silently reverting the change.

- **Scroll position on mobile after reorder**: Stats and starting words will now appear much earlier in the page flow, reducing the scroll distance to reach them. However, on very small viewports, the five single-letter input boxes in "Include But NOT HERE" (lines 76-83) still appear at the bottom of the input area. The first visible output (stats) will appear immediately after line 83's closing `</div>`, so it will be within one screen height of the last input on most phones.

- **Stale references in comments**: The `<p>` description block references "the top 200 alphabetically remaining words will appear above." If the "Limit default word list display count on mobile" task later changes the cap from 200 to a smaller number, that text will need updating — but that is out of scope for this task.

## Verification

1. Open `index.html` in a browser (directly or via `python -m http.server` from the project root).
2. Confirm the page renders without JavaScript errors in the browser console.
3. Confirm the vertical order of sections from top to bottom is:
   - Wordle Helper heading and input controls (unchanged)
   - "Remaining Word Stats" heading and letter frequency list
   - "Starting Words" heading with refresh button and recommended word list
   - "Word Options" heading with word count, refresh button, and word list
   - Explanatory paragraph
4. Confirm that "Remaining Word Stats" is populated on initial page load (populated by the `refreshRecommendations()` call in `script.js` line 303).
5. Confirm that "Starting Words" is populated on initial page load.
6. Type a letter into the "Exclude These Letters" input and confirm:
   - The "Word Options" section becomes visible (or remains visible, depending on whether the ID mismatch dependency has been resolved).
   - "Remaining Word Stats" updates to reflect the filtered letter frequencies.
   - "Word Options" shows a filtered word list.
7. On a real mobile device or in browser DevTools with a mobile viewport (e.g., 390px wide, iPhone 14 profile), confirm that after filling in at least one filter input, both "Remaining Word Stats" and "Starting Words" are visible within one scroll-gesture from the bottom of the input area.
8. Inspect `index.html` and confirm the IDs `wordStats`, `recommdedStartingWords`, `wordOptionDiv1`, `wordCount`, and `wordList` are all still present and unchanged.
9. Verify no `<hr />` separator has been lost or duplicated between sections.
