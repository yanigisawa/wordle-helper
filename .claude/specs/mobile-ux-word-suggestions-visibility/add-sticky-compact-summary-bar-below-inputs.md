# Spec: Add sticky compact summary bar below inputs
> From: .claude/tasks/mobile-ux-word-suggestions-visibility.md

## Objective

Add a small sticky/fixed bar that remains visible on mobile just below the input controls as the user scrolls down through word results and stats. The bar surfaces the three most actionable pieces of information at a glance: how many words still match, which letters appear most often in those words, and a couple of concrete word guesses to try. This eliminates the need to scroll back to the top to check the word count or scroll past a long word list to see the stats section.

## Current State

### index.html

The page is structured as a single `.wrapper > .content > .instructions` column. The input controls live at the top of `.instructions`:

- Two `.input-group` rows: `#exclude` (exclude letters) and `#include` (include letters).
- `#letterBoxes` — five `.singleLetters` inputs for known positions.
- `#exLetterBoxes` — five `.singleLetters` inputs for "include but not here".

Below the inputs is `#wordOptionDiv1`, which contains:
- `<h2>Word Options <span id="wordCount"></span></h2>` — the current match count.
- `<p id="wordList">` — up to 200 matching words followed by `...` if truncated.

Further below are `#wordStats` (letter frequency list) and `#recommdedStartingWords` (starting word suggestions). All of these scroll off-screen on a phone once the word list grows long.

There is no existing sticky/summary element in the markup.

### style.css

The file uses Bootstrap 5 (CDN) plus custom rules. No `position: sticky` or `position: fixed` rules exist today. The page is laid out as a normal block flow inside `.wrapper`. There are no existing `@media` breakpoints in the custom CSS — all layout is responsive via Bootstrap's utility classes applied directly in HTML. `--wrapper-height: 87vh` is set on `:root`.

### script.js — filterResults() (lines 146–173)

```js
function filterResults() {
  let results = filterExcludeLetters(words);
  results = filterIncludeLetters(results);
  results = filterLetterPositions(results);
  results = filterIncludedLettersButNotHere(results);
  randomizeResults(results);

  const pTag = document.getElementById("wordList");

  let wordCountSpan = document.getElementById("wordCount");
  wordCountSpan.innerHTML = `(${results.length})`;
  if (results.length === 0) {
    pTag.innerHTML = "<b>No results found. ...</b>"
    return;
  }
  // ... builds possibleWords array, calls displayStats(results)
  pTag.innerHTML = possibleWords.join('');
}
```

`getWordListStats(wordList)` returns an array of `[letter, count]` pairs sorted descending by frequency. `displayStats()` renders them into `#wordStats`.

`randomizeResults()` shuffles the results array in place (Fisher-Yates). After shuffling, `results[0]`, `results[1]`, `results[2]` are three random matching words.

## Requirements

1. A summary bar element with `id="summaryBar"` must be added to `index.html` inside `.instructions`, immediately after the `#exLetterBoxes` div and before `#wordOptionDiv1`.
2. The summary bar must be hidden by default and only visible on mobile viewports (max-width: 767px).
3. On mobile, the bar must use `position: sticky` with a `top` value that places it flush below the last input row so it sticks at that position as the user scrolls.
4. The bar must display three pieces of information, each in a visually distinct inline region:
   a. **Word count** — the same count shown in `#wordCount`, formatted as e.g. `243 words`.
   b. **Top letters** — the 3 to 5 letters with the highest frequency in the current filtered word list, shown as a compact comma-separated or badge-style list (e.g. `e, a, r, s, t`).
   c. **Word suggestions** — 2 to 3 random words drawn from the filtered results, shown as a short space-separated list (e.g. `crane stern`).
5. `filterResults()` in `script.js` must be updated to populate the summary bar every time it runs, including when the result count is zero (bar should show `0 words` and empty letter/word suggestion regions).
6. The bar must not appear on desktop (min-width: 768px); it must be either `display: none` or fully hidden via a media query on larger screens.
7. The bar must have a visible background (not transparent) so it does not visually blend into the word list below it when sticky.
8. The bar must not require any new JavaScript libraries or build steps.

## Implementation Details

### index.html

Insert the following element directly after the closing `</div>` of `#exLetterBoxes` and before `<div id="wordOptionDiv1">`:

```html
<div id="summaryBar" aria-live="polite" aria-label="Current filter summary">
  <span id="summaryCount"></span>
  <span id="summaryLetters"></span>
  <span id="summaryWords"></span>
</div>
```

`aria-live="polite"` lets screen readers announce updates without interrupting the user.

### style.css

Add a new block at the end of the file, inside a `@media (max-width: 767px)` breakpoint so the bar is strictly mobile-only:

```css
@media (max-width: 767px) {
  #summaryBar {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    align-items: center;
    position: sticky;
    top: 0;           /* adjust after measuring rendered input height if needed */
    z-index: 100;
    background-color: var(--color-bg); /* #F4F4F4 from :root */
    border-bottom: 1px solid #ccc;
    padding: 0.35rem 0.5rem;
    font-size: 0.85rem;
    color: var(--color-text-main);
  }

  #summaryCount {
    font-weight: bold;
    white-space: nowrap;
  }

  #summaryLetters {
    white-space: nowrap;
  }

  #summaryWords {
    white-space: nowrap;
    font-style: italic;
  }
}

/* Hide on desktop — default state is also hidden; media query above enables it */
#summaryBar {
  display: none;
}
```

Note: `top: 0` is the starting point. If sibling sticky headers (e.g. from dependent Group 2 tasks such as collapsible sections) add a sticky bar above this one, `top` will need to be adjusted to stack correctly. This value should be revisited after Group 2 tasks land.

### script.js — updateSummaryBar() helper and filterResults() changes

Add a new helper function `updateSummaryBar(results)` after `displayStats()` (around line 292):

```js
function updateSummaryBar(results) {
  const bar = document.getElementById("summaryBar");
  if (!bar) { return; }

  // Word count
  document.getElementById("summaryCount").textContent =
    results.length === 1 ? "1 word" : `${results.length} words`;

  // Top 3-5 letters from frequency stats
  const stats = getWordListStats(results);           // already sorted descending
  const topLetters = stats.slice(0, 5)
    .filter(pair => pair[1] > 0)                    // omit letters with zero count
    .map(pair => pair[0])
    .join(", ");
  document.getElementById("summaryLetters").textContent =
    topLetters ? `Letters: ${topLetters}` : "";

  // 2-3 random word suggestions (results already shuffled by randomizeResults)
  const suggestions = results.slice(0, 3).join(" ");
  document.getElementById("summaryWords").textContent =
    suggestions ? `Try: ${suggestions}` : "";
}
```

Modify `filterResults()` to call `updateSummaryBar(results)` in both the early-return (zero results) path and the normal path:

```js
function filterResults() {
  let results = filterExcludeLetters(words);
  results = filterIncludeLetters(results);
  results = filterLetterPositions(results);
  results = filterIncludedLettersButNotHere(results);
  randomizeResults(results);

  const pTag = document.getElementById("wordList");

  let wordCountSpan = document.getElementById("wordCount");
  wordCountSpan.innerHTML = `(${results.length})`;

  updateSummaryBar(results);   // <-- NEW

  if (results.length === 0) {
    pTag.innerHTML = "<b>No results found. Check that are are not including and excluding the same letters</b>";
    return;
  }
  // ... rest of function unchanged ...
  displayStats(results);
  pTag.innerHTML = possibleWords.join('');
}
```

`updateSummaryBar` must be defined before `filterResults` in the file, or hoisted as a function declaration (which is already the pattern used throughout `script.js`).

### Integration points

- `getWordListStats()` — called inside `updateSummaryBar`. No changes to the function itself.
- `randomizeResults()` — already called before `updateSummaryBar`, so `results[0..2]` are already randomised when `updateSummaryBar` reads them via `results.slice(0, 3)`.
- `displayStats()` — unchanged; continues to populate `#wordStats` in the full stats section.
- `refreshOptions()` already calls `filterResults()`, so the bar will update on manual refresh.
- `handleGroupInput()` and `handleSingleInput()` both call `filterResults()`, so all input events update the bar automatically.
- `refreshRecommendations()` calls `displayStats(words)` directly (not `filterResults`) so it does NOT need to update the summary bar — the bar reflects the filtered state, not the unfiltered starting word list.

## Dependencies

- Blocked by: Group 2 tasks — "Limit word list", "Condense stats", "Collapsible sections". Those tasks may introduce their own sticky headers or change layout measurements that affect the `top` value needed here. This spec's `top: 0` placeholder should be revisited once those tasks are merged.
- Blocking: None. This is a non-blocking UI enhancement.

## Risks & Edge Cases

1. **`top` offset collision with other sticky elements.** If Group 2 tasks add a sticky header above the input area, `top: 0` will cause this bar to scroll behind it. Mitigation: after Group 2 lands, measure the combined height of any sticky ancestors and set `top` accordingly, or use a CSS custom property (`--sticky-offset`) updated by JavaScript.

2. **Bar appears empty on initial page load.** `filterResults()` is not called on load — only `refreshRecommendations()` is. The summary bar will therefore be blank until the user types something. Mitigation: call `filterResults()` once at page load (after `refreshRecommendations()`), or accept the blank initial state as correct behaviour since there is no filter applied yet. The latter is the lower-risk approach.

3. **`results` array mutation.** `randomizeResults()` shuffles `results` in place. `updateSummaryBar` reads `results.slice(0, 3)` after that shuffle, which is the correct order of operations. If the call order inside `filterResults` is ever changed, the word suggestions may become non-random. The call to `updateSummaryBar` must always follow `randomizeResults`.

4. **Zero results edge case.** When `results.length === 0`, `getWordListStats([])` returns all letters with count 0. The `.filter(pair => pair[1] > 0)` guard in `updateSummaryBar` produces an empty `topLetters` string, so `summaryLetters` correctly shows nothing. `summaryWords` will also be empty. `summaryCount` will show `"0 words"`. This is the intended behaviour.

5. **`#summaryBar` not found.** The early guard `if (!bar) { return; }` inside `updateSummaryBar` prevents exceptions if the element is missing (e.g. during unit testing or if the HTML is not yet updated).

6. **Performance.** `getWordListStats` iterates over the entire filtered word list on every keystroke. It is already called once inside `displayStats` and will now be called a second time inside `updateSummaryBar`. To avoid the double pass, `filterResults` could call `getWordListStats` once, store the result in a local variable, and pass it to both `displayStats` and `updateSummaryBar`. This optimisation is low-priority given the list size (~10 000 words) and the synchronous JS context, but should be considered if input lag is observed on low-end devices.

7. **Bootstrap breakpoint alignment.** The custom CSS uses `max-width: 767px` to match Bootstrap 5's `sm` breakpoint boundary (Bootstrap's `md` starts at 768px). This keeps the mobile-only logic consistent with Bootstrap's responsive grid.

## Verification

1. Open `index.html` in a browser on a mobile device or with DevTools set to a viewport width of 375px (iPhone SE).
2. Confirm `#summaryBar` is visible below the "Include But NOT HERE" input row and above the "Word Options" heading.
3. Type a letter into the Exclude input. Confirm the bar updates immediately to show the correct word count, top letters, and 2-3 word suggestions.
4. Scroll down past the word list. Confirm the bar remains stuck at the top of the viewport throughout scrolling.
5. Type letters that reduce results to zero. Confirm the bar shows `0 words` and no letters or suggestions.
6. Set DevTools viewport to 1024px (desktop). Confirm `#summaryBar` is not visible (`display: none`).
7. Click the refresh button next to "Word Options". Confirm the word suggestions in the bar change (randomisation is re-applied).
8. Confirm `#wordCount` in the main heading and `summaryCount` in the bar always show the same number.
