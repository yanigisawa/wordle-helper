# Spec: Condense letter frequency stats display
> From: .claude/tasks/mobile-ux-word-suggestions-visibility.md

## Objective

Replace the verbose 26-item vertical list in the "Remaining Word Stats" section with a compact, horizontal badge/chip layout that only shows letters with at least one occurrence. This reduces a large block of mostly-zero entries (especially after filters are applied) down to a 2-3 line display on mobile. The change improves scannability and saves significant vertical space, which is critical for mobile usability.

## Current State

### script.js — `displayStats()` (lines 288–292)

```js
function displayStats(wordList) {
  const wordStatsElem = document.getElementById("wordStats");
  const wordStats = getWordListStats(wordList);
  wordStatsElem.innerHTML = "<li>" + wordStats.join("</li><li>");
}
```

`getWordListStats()` (lines 239–286) returns an array of `[letter, count]` pairs sorted by count descending, covering all 26 letters including those with a count of 0. Each pair is serialized via `.join()` which calls `.toString()` on the inner array, producing `"e,342"` style strings. The result is rendered as a `<ul>` with one `<li>` per letter.

### index.html — stats container (lines 105–106)

```html
<ul id="wordStats">
</ul>
```

The container is a plain `<ul>`. No classes or layout attributes are applied.

### style.css

There are no existing styles targeting `#wordStats` or its children. Bootstrap 5 is loaded via CDN and its utility classes (e.g., `d-flex`, `flex-wrap`, `badge`, `me-1`, `mb-1`) are available for use.

### Behavior note

`displayStats()` is called in two places:
1. `filterResults()` (line 170) — called on every filter input event, passing the current filtered word list.
2. `refreshRecommendations()` (line 299) — called on page load and on manual refresh, passing the full `words` array.

When the full word list is used (on page load), all 26 letters will have non-zero counts. The zero-filtering primarily helps once filters are applied and the candidate set shrinks.

## Requirements

1. Only letters with a count greater than 0 must be rendered; letters with count 0 must be omitted entirely.
2. The stats must be displayed in a horizontal, flex-wrapped layout so that multiple entries appear side by side and wrap naturally.
3. Each letter entry must be visually distinct as a chip or badge showing the letter and its count in the format `LETTER: count` (e.g., `E: 342`).
4. By default, at most 10 letters must be shown (the top 10 by frequency, since `getWordListStats()` already returns results sorted descending by count).
5. The display must update correctly every time `displayStats()` is called (on filter change and on page load).
6. The `<ul id="wordStats">` element in `index.html` must be replaced with a container element appropriate for the new layout (e.g., a `<div>`), since `<ul>/<li>` semantics are no longer appropriate for badge chips.
7. The implementation must not introduce any new JavaScript libraries or dependencies.

## Implementation Details

### index.html

- Replace `<ul id="wordStats"></ul>` (lines 105–106) with `<div id="wordStats" class="word-stats-container"></div>`.
- No other changes to `index.html` are required.

### script.js — `displayStats()` rewrite

Replace the current `displayStats` body with logic that:

1. Calls `getWordListStats(wordList)` to get the sorted `[letter, count]` pairs.
2. Filters the result to only entries where `count > 0` (i.e., `pair[1] > 0`).
3. Slices to the first 10 entries (top 10 by frequency).
4. Maps each `[letter, count]` pair to an HTML `<span>` element with:
   - The class `stats-badge` (defined in `style.css`).
   - Inner text in the format `LETTER: count`, e.g., `E: 342` (letter uppercased).
5. Joins all spans and sets `wordStatsElem.innerHTML`.
6. If the filtered list is empty (e.g., no words remain), sets `innerHTML` to an empty string or a brief placeholder.

Example implementation sketch:

```js
function displayStats(wordList) {
  const wordStatsElem = document.getElementById("wordStats");
  const wordStats = getWordListStats(wordList);
  const visible = wordStats.filter(pair => pair[1] > 0).slice(0, 10);
  if (visible.length === 0) {
    wordStatsElem.innerHTML = '';
    return;
  }
  wordStatsElem.innerHTML = visible
    .map(pair => `<span class="stats-badge">${pair[0].toUpperCase()}: ${pair[1]}</span>`)
    .join('');
}
```

### style.css — new `.stats-badge` rule and `.word-stats-container` rule

Add the following at the end of `style.css`:

```css
/* Compact letter frequency stats */
.word-stats-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.stats-badge {
  display: inline-block;
  background-color: #4357AD;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: bold;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}
```

The `.word-stats-container` uses `flex-wrap: wrap` so badges reflow naturally across multiple lines on narrow viewports. The `gap` property provides consistent spacing without relying on margin hacks. The badge color uses the existing brand blue (`#4357AD`) for visual consistency with headings.

### Integration points

- `getWordListStats()` does not need to change. Its return format (`Array<[string, number]>`) is already compatible with the new `displayStats` logic.
- Both call sites of `displayStats()` (`filterResults()` at line 170 and `refreshRecommendations()` at line 299) remain unchanged.
- The `id="wordStats"` attribute is preserved on the new `<div>`, so the JavaScript selector `document.getElementById("wordStats")` continues to work without modification.

## Dependencies

- Blocked by: "Reorganize page layout to prioritize output sections on mobile" — this task restructures the page layout that this section lives within, and the stats display should be implemented in the final layout context to avoid rework.
- Blocking: None. This task is self-contained and no other known tasks depend on it.

## Risks & Edge Cases

- **All words filtered out**: When all candidate words are eliminated, `filterResults()` returns early before calling `displayStats()` (line 157–160 in `script.js`). The stats container will retain its previous render. Consider whether it should be explicitly cleared in the no-results path; currently it is not — this is an existing behavior gap but out of scope for this task.
- **Page load (full word list)**: On initial load, `refreshRecommendations()` calls `displayStats(words)` with all 10,240 words. All 26 letters will have counts > 0, so the display will show only the top 10 most frequent letters. This is intentional and correct per requirement 4.
- **Single candidate word**: A single remaining word has exactly 5 unique letters (or fewer with repeats). The stats will show 3–5 badges, which is the most informative possible output — no issues expected.
- **`getWordListStats` letter counting quirk**: The function counts each letter at most once per word (it tracks `lettersUsed` per word). The badge counts therefore represent "number of words containing this letter," not total letter occurrences. The display format `LETTER: count` is neutral enough to be correct for both interpretations — no label change needed.
- **Bootstrap `<ul>` default styles**: Switching from `<ul>` to `<div>` removes any default browser list margins/padding that Bootstrap or the browser stylesheet may have applied to `#wordStats ul`. Verify visually that the new container aligns consistently with surrounding sections.
- **`toUpperCase()` on letter**: `getWordListStats` stores keys in lowercase. The badge renders them uppercase for readability. This is purely cosmetic and does not affect filtering logic.

## Verification

1. Open `index.html` in a browser with no filters applied. Confirm the "Remaining Word Stats" section shows exactly 10 badges in a horizontal, wrapping row (not a vertical list).
2. Enter letters in the exclude field to reduce the candidate set significantly (e.g., exclude `e`, `a`, `r`, `o`, `i`). Confirm that letters with zero occurrences in the remaining words do not appear as badges.
3. Enter enough exclude letters to leave only 1–3 candidate words. Confirm the stats section shows only badges for letters that appear in those words (typically 3–5 badges).
4. Click the "Remaining Word Stats" section on a mobile viewport (or browser devtools mobile emulation, e.g., 390px wide). Confirm the badges fit within 2–3 lines rather than a long scrollable list.
5. Click the refresh button next to "Starting Words" (which calls `refreshRecommendations()` and then `displayStats(words)`). Confirm the stats reset to showing the top 10 letters across the full word list.
6. Confirm no JavaScript errors appear in the browser console during any of the above interactions.
7. Confirm the badge color (`#4357AD`) and text color (white) render legibly and match the existing heading color scheme.
