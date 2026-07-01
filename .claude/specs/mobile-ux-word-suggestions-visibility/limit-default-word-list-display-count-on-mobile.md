# Spec: Limit default word list display count on mobile
> From: .claude/tasks/mobile-ux-word-suggestions-visibility.md

## Objective

Reduce the vertical space consumed by the word list on mobile devices by initially displaying only 10-20 matching words instead of the current maximum of 200. A "Show more" button or link will allow users to expand to the full list on demand. The total match count is already visible in `#wordCount`, so users are not left without context about how many words remain hidden.

## Current State

`filterResults()` in `script.js` (lines 146-173) builds the displayed word list with a hard cap of 200 words:

```js
// script.js lines 161-168
let possibleWords = [];
for (let r of results) {
  if (possibleWords.length > 200) {
    possibleWords.push("...<br/>")
    break;
  }
  possibleWords.push(`${r.toLowerCase()} - `);
}
// ...
pTag.innerHTML = possibleWords.join('');
```

The total result count is written to `#wordCount` (line 156):

```js
wordCountSpan.innerHTML = `(${results.length})`;
```

The word list is rendered into `<p id="wordList">` in `index.html` (line 96), which sits inside `#wordOptionDiv1`. There is no pagination, truncation hint beyond `...`, or expand control. On mobile this 200-word block can be extremely long, pushing stats and starting-word sections far below the viewport.

The descriptive paragraph at line 122 of `index.html` currently reads:

> "Once you type at least 1 letter, the top 200 alphabetically remaining words will appear above."

## Requirements

1. By default, `filterResults()` must display at most 15 words (the "initial limit").
2. When the full result set contains more words than the initial limit, a "Show more" control must be rendered immediately after the truncated list.
3. Activating the "Show more" control must expand the list to display up to 200 words (the existing maximum). If more than 200 words match, the existing `...` overflow indicator must still appear.
4. Activating "Show more" must not trigger a full page re-filter; it only changes what is displayed from the already-filtered result set.
5. After expanding, the "Show more" control must be replaced by (or toggled to) a "Show less" control that collapses the list back to the initial 15-word view.
6. The `#wordCount` span must always show the true total number of matching words, regardless of how many are currently displayed.
7. The feature must work without any build step (vanilla JS, no bundler).
8. The descriptive paragraph in `index.html` must be updated to reflect the new default display count.

## Implementation Details

### `script.js`

**Module-level state variable**

Add a boolean flag (or a numeric `displayLimit` variable) at module scope to track whether the list is expanded:

```js
let wordListExpanded = false;
```

Also store the most recent filtered result set so the expand/collapse handler can re-render without re-running filters:

```js
let lastFilteredResults = [];
```

**Refactor `filterResults()`**

Extract word-rendering into a dedicated helper `renderWordList(results, expanded)` so it can be called both from `filterResults()` and from the show-more/show-less click handler.

```js
const INITIAL_LIMIT = 15;
const MAX_LIMIT = 200;

function renderWordList(results, expanded) {
  const pTag = document.getElementById("wordList");
  if (results.length === 0) {
    pTag.innerHTML = "<b>No results found. Check that you are not including and excluding the same letters</b>";
    return;
  }

  const limit = expanded ? MAX_LIMIT : INITIAL_LIMIT;
  let possibleWords = [];
  for (let r of results) {
    if (possibleWords.length >= limit) break;
    possibleWords.push(`${r.toLowerCase()} - `);
  }

  let html = possibleWords.join('');

  if (!expanded && results.length > INITIAL_LIMIT) {
    html += `<br/><a href="#" id="wordListToggle">Show more</a>`;
  } else if (expanded && results.length > INITIAL_LIMIT) {
    if (results.length > MAX_LIMIT) {
      html += "...<br/>";
    }
    html += `<br/><a href="#" id="wordListToggle">Show less</a>`;
  }

  pTag.innerHTML = html;

  const toggle = document.getElementById("wordListToggle");
  if (toggle) {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      wordListExpanded = !wordListExpanded;
      renderWordList(lastFilteredResults, wordListExpanded);
    });
  }
}
```

Update `filterResults()` to reset the expanded state on each new filter run and delegate to `renderWordList`:

```js
function filterResults() {
  let results = filterExcludeLetters(words);
  results = filterIncludeLetters(results);
  results = filterLetterPositions(results);
  results = filterIncludedLettersButNotHere(results);
  randomizeResults(results);

  lastFilteredResults = results;
  wordListExpanded = false;          // collapse on each new filter input

  const wordCountSpan = document.getElementById("wordCount");
  wordCountSpan.innerHTML = `(${results.length})`;

  renderWordList(results, wordListExpanded);
  displayStats(results);
}
```

### `index.html`

Update the descriptive paragraph (line 122) to reflect the new default:

```html
<p>
  Once you type at least 1 letter, up to 15 matching words will appear above.
  Tap "Show more" to see up to 200 words. As you guess more letters in Wordle,
  enter them here to exclude or include, and the list will narrow down.
</p>
```

No new HTML elements are required; the "Show more / Show less" link is injected dynamically into `<p id="wordList">` by `renderWordList()`.

### `style.css` (optional, low priority)

Consider adding a rule to make the toggle link visually distinct and easy to tap on mobile:

```css
#wordListToggle {
  display: inline-block;
  margin-top: 4px;
  font-size: 0.9rem;
}
```

## Dependencies

- Blocked by: "Reorganize page layout to prioritize output sections on mobile" — this task assumes the word list container is in its final position before the initial limit is tuned.
- Blocking: none.

## Risks & Edge Cases

- **Re-randomization on expand**: `randomizeResults()` is called inside `filterResults()` and mutates the array in place. Because `lastFilteredResults` stores a reference to the already-shuffled array, expanding the list reveals more words from the same random order rather than re-shuffling. This is the correct behavior.
- **Collapse scroll position**: Collapsing back to 15 words with "Show less" may leave the user scrolled past the word list. This is acceptable for an initial implementation; a `scrollIntoView()` call on the word list heading could be added as a follow-up if user feedback warrants it.
- **Zero or few results**: When `results.length <= INITIAL_LIMIT`, `renderWordList` must not render any toggle control at all. The condition `results.length > INITIAL_LIMIT` guards this correctly.
- **Exactly 200 results when expanded**: The `...` overflow indicator appears only when `results.length > MAX_LIMIT` in expanded mode, which is correct.
- **`refreshOptions()` interaction**: `refreshOptions()` calls `filterResults()`, which resets `wordListExpanded = false`. This is intentional; a manual refresh should start from the collapsed view.
- **`wordListExpanded` state on filter change**: Any new character typed in an input field calls `filterResults()`, resetting the expansion state. This is correct — a new filter result is a fresh context.
- **Accessibility**: The injected `<a href="#">` element is keyboard-focusable and announces as a link. The `e.preventDefault()` prevents spurious scroll-to-top. No ARIA changes are required for this level of implementation.

## Verification

1. Open `index.html` in a browser (or via `python -m http.server`).
2. Type a single common letter (e.g., `e`) in the "Include These Letters" field.
3. Confirm that exactly 15 words appear in `#wordList`.
4. Confirm that `#wordCount` shows a number substantially greater than 15.
5. Confirm that a "Show more" link appears immediately below the 15 words.
6. Click "Show more" and confirm up to 200 words appear, and the link changes to "Show less".
7. Click "Show less" and confirm the list collapses back to 15 words with "Show more" visible again.
8. Type an additional letter to change the filter and confirm the list resets to the collapsed (15-word) view.
9. Enter highly specific criteria that yield fewer than 15 results; confirm no toggle link appears.
10. Enter criteria that yield exactly 0 results; confirm the "no results" message appears and no toggle link is rendered.
11. Resize the browser to a narrow viewport (~375 px) and confirm the word list no longer dominates the screen on initial load.
