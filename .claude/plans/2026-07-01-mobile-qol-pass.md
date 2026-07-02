# Mobile QoL Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Wordle Helper faster and less error-prone on phones: case-insensitive filters, condensed stats, collapsible sections, a Clear All button, backspace navigation, and 44px touch targets.

**Architecture:** Static client-side app with no build step. All changes are direct edits to `index.html`, `script.js`, and `style.css`. Collapsible sections use Bootstrap 5's collapse component (already loaded via CDN) with zero custom JS.

**Tech Stack:** Vanilla JavaScript (ES6+), Bootstrap 5.3.2 via CDN, plain CSS.

**Spec:** `.claude/specs/mobile-qol-pass/2026-07-01-mobile-qol-design.md`

## Global Constraints

- No build process, no npm, no new JS libraries. Bootstrap 5.3.2 CDN only.
- No automated tests — this repo verifies manually in a browser (see `CLAUDE.md` and `.claude/skills/verifier-manual-only/SKILL.md`). Each task's verification is a manual browser check plus `node --check script.js` as a syntax gate when `script.js` changed.
- To view the app: `python3 -m http.server 8000` from the repo root, then open `http://localhost:8000`, or open `index.html` directly.
- Mobile checks happen at ~375px viewport width (browser devtools responsive mode); letter-box fit is checked at 320px.
- Match existing code style: plain functions, `getElementById`, event listeners attached at the bottom of `script.js`.

---

### Task 1: Case-insensitive position filters (bug fix)

**Files:**
- Modify: `script.js:59-98` (`filterLetterPositions`) and `script.js:100-137` (`filterIncludedLettersButNotHere`)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: no signature changes — both functions keep the shape `filterX(wordList) -> string[]`.

Bug: both functions compare raw input values against word characters (`w[0] !== firstLetter`). A capitalized letter from a mobile keyboard silently returns zero matches. Fix by lowercasing the input values once and the word once per iteration, consistent with `filterIncludeLetters()`.

- [ ] **Step 1: Rewrite `filterLetterPositions` with lowercased comparisons**

Replace the whole function with:

```js
function filterLetterPositions(wordList) {
  const firstLetter = document.getElementById("first").value.toLowerCase();
  const secondLetter = document.getElementById("second").value.toLowerCase();
  const thirdLetter = document.getElementById("third").value.toLowerCase();
  const fourthLetter = document.getElementById("fourth").value.toLowerCase();
  const fifthLetter = document.getElementById("fifth").value.toLowerCase();

  if (!firstLetter && !secondLetter && !thirdLetter && !fourthLetter && !fifthLetter) {
    return wordList;
  }

  let results = [];
  for (let w of wordList) {
    const word = w.toLowerCase();
    if (firstLetter && word[0] !== firstLetter) {
      continue;
    }

    if (secondLetter && word[1] !== secondLetter) {
      continue;
    }

    if (thirdLetter && word[2] !== thirdLetter) {
      continue;
    }

    if (fourthLetter && word[3] !== fourthLetter) {
      continue;
    }

    if (fifthLetter && word[4] !== fifthLetter) {
      continue;
    }

    results.push(w);
  }

  return results;
}
```

- [ ] **Step 2: Rewrite `filterIncludedLettersButNotHere` with lowercased comparisons**

Replace the whole function with:

```js
function filterIncludedLettersButNotHere(wordList) {
  const firstLetter = document.getElementById("exFirst").value.toLowerCase();
  const secondLetter = document.getElementById("exSecond").value.toLowerCase();
  const thirdLetter = document.getElementById("exThird").value.toLowerCase();
  const fourthLetter = document.getElementById("exFourth").value.toLowerCase();
  const fifthLetter = document.getElementById("exFifth").value.toLowerCase();

  if (!firstLetter && !secondLetter && !thirdLetter && !fourthLetter && !fifthLetter) {
    return wordList;
  }

  let results = [];
  for (let w of wordList) {
    const word = w.toLowerCase();
    if (firstLetter && word[0] === firstLetter) {
      continue;
    }

    if (secondLetter && word[1] === secondLetter) {
      continue;
    }

    if (thirdLetter && word[2] === thirdLetter) {
      continue;
    }

    if (fourthLetter && word[3] === fourthLetter) {
      continue;
    }

    if (fifthLetter && word[4] === fifthLetter) {
      continue;
    }

    results.push(w);
  }

  return results;
}
```

- [ ] **Step 3: Syntax gate**

Run: `node --check script.js`
Expected: no output, exit code 0.

- [ ] **Step 4: Manual verification**

Open the app in a browser:
1. Type `A` (uppercase) into the first "Known Letter Positions" box. Expected: word list appears and every listed word starts with "a". Before this fix, typing an uppercase letter returned `(0)` results.
2. Type `a` (lowercase) — same results as uppercase.
3. Put `A` in the first "Include But NOT HERE" box: no listed word starts with "a".

- [ ] **Step 5: Commit**

```bash
git add script.js
git commit -m "fix(filter): make letter position filters case-insensitive"
```

---

### Task 2: Condensed letter frequency stats

**Files:**
- Modify: `script.js:303-308` (`displayStats`)
- Modify: `index.html:106-107` (`<ul id="wordStats">` → `<div>`)
- Modify: `style.css` (append new rules)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `#wordStats` is now a `<div>` (flex-wrap container) filled with `<span class="stat-chip">` children. `displayStats(wordList)` signature unchanged. Task 3 wraps this `<div>` in a collapse container; Task 4 calls `displayStats(words)`.

- [ ] **Step 1: Replace the stats element in `index.html`**

Change:

```html
        <ul id="wordStats">
        </ul>
```

to:

```html
        <div id="wordStats">
        </div>
```

- [ ] **Step 2: Rewrite `displayStats` in `script.js`**

Replace the whole function with:

```js
function displayStats(wordList) {
  const wordStatsElem = document.getElementById("wordStats");
  const knownLetters = getKnownLetters();
  const wordStats = getWordListStats(wordList)
    .filter(s => !knownLetters.includes(s[0]))
    .filter(s => s[1] > 0);
  wordStatsElem.innerHTML = wordStats
    .map(s => `<span class="stat-chip">${s[0].toUpperCase()} ${s[1]}</span>`)
    .join("");
}
```

- [ ] **Step 3: Add chip styles to `style.css`**

Append after the `#wordListToggle` rule:

```css
#wordStats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0;
  margin: 0.5rem 0;
}

.stat-chip {
  background: #FFFFFF;
  border: 1px solid var(--color-text-main);
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-main);
  white-space: nowrap;
}
```

- [ ] **Step 4: Syntax gate**

Run: `node --check script.js`
Expected: no output, exit code 0.

- [ ] **Step 5: Manual verification**

1. Load the page: stats render as wrapped chips (`E 4382`-style), not a vertical list, and fit in a few lines at 375px width.
2. Type `xyz` into "Exclude These Letters": chips update; no chip shows a `0` count; no chips for x, y, z... (they are excluded letters — words containing them are gone, so their count is 0 and they are filtered out).
3. Type `e` into "Include These Letters": no `E` chip appears (known letters still excluded).

- [ ] **Step 6: Commit**

```bash
git add index.html script.js style.css
git commit -m "feat(ui): condense letter stats into wrapped chips, hide zero counts"
```

---

### Task 3: Collapsible output sections

**Files:**
- Modify: `index.html:85-107` (Word Options and Remaining Word Stats sections)
- Modify: `style.css` (append new rules)

**Interfaces:**
- Consumes: `<div id="wordStats">` from Task 2.
- Produces: new container ids `#wordListCollapse` and `#wordStatsCollapse` (Bootstrap `.collapse.show`); refresh button gets class `.refresh-btn` (44×44, inline styles removed). Existing ids `#wordOptionDiv`, `#wordCount`, `#wordList`, `#wordStats` are unchanged — `script.js` needs no edits.

- [ ] **Step 1: Rewrite the two output sections in `index.html`**

Replace this block (from `<div id="wordOptionDiv">` through `</div>` after the stats element):

```html
        <div id="wordOptionDiv">
          <hr />
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
        <div id="wordStats">
        </div>
```

with:

```html
        <div id="wordOptionDiv">
          <hr />
          <div class="section-header">
            <h2 class="collapse-toggle" data-bs-toggle="collapse" data-bs-target="#wordListCollapse"
              aria-expanded="true" aria-controls="wordListCollapse">
              Word Options <span id="wordCount"></span><span class="chevron"></span>
            </h2>
            <button type="button" class="refresh-btn" onclick="refreshOptions()" aria-label="Refresh word options">
              <img src="refresh.svg" width="16" height="16" alt="" />
            </button>
          </div>

          <div id="wordListCollapse" class="collapse show">
            <p id="wordList">
            </p>
          </div>
        </div>
        <hr />
        <div class="section-header">
          <h2 class="collapse-toggle" data-bs-toggle="collapse" data-bs-target="#wordStatsCollapse"
            aria-expanded="true" aria-controls="wordStatsCollapse">
            Remaining Word Stats<span class="chevron"></span>
          </h2>
        </div>
        <div id="wordStatsCollapse" class="collapse show">
          <div id="wordStats">
          </div>
        </div>
```

Note: the refresh button sits outside the `h2` toggle, so tapping it refreshes without toggling the collapse.

- [ ] **Step 2: Add section header / toggle styles to `style.css`**

Append:

```css
.section-header {
  display: flex;
  align-items: center;
}

.collapse-toggle {
  cursor: pointer;
  flex: 1;
  margin-bottom: 0;
}

.collapse-toggle .chevron::after {
  content: "\25BE"; /* ▾ */
  font-size: 0.8em;
  margin-left: 0.35rem;
  display: inline-block;
  transition: transform 0.2s;
}

.collapse-toggle[aria-expanded="false"] .chevron::after {
  transform: rotate(-90deg);
}

.refresh-btn {
  margin-left: 0.5rem;
  height: 44px;
  width: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Manual verification**

1. Load the page and type a letter into "Include These Letters" so Word Options appears.
2. Both sections are expanded by default and look like before (plus chevrons).
3. Tap the "Word Options" heading: the word list collapses, chevron rotates. Tap again: expands.
4. Same for "Remaining Word Stats".
5. Tap the refresh button: the word order reshuffles and the section does NOT collapse.
6. At 375px width, headings are comfortable full-width tap targets; refresh button is 44×44.

- [ ] **Step 4: Commit**

```bash
git add index.html style.css
git commit -m "feat(ui): collapsible word list and stats sections via Bootstrap collapse"
```

---

### Task 4: Clear All button

**Files:**
- Modify: `index.html` (add button after `#exLetterBoxes` div, before `#wordOptionDiv`)
- Modify: `script.js` (add `clearAll()` and listener)
- Modify: `style.css` (append rule)

**Interfaces:**
- Consumes: `displayStats(wordList)` from Task 2 (called with the global `words` array from `words.js`).
- Produces: `#clearAll` button element; `clearAll()` function. Nothing downstream depends on them.

- [ ] **Step 1: Add the button to `index.html`**

Immediately after the closing `</div>` of `id="exLetterBoxes"` (before `<div id="wordOptionDiv">`), add:

```html
        <button type="button" id="clearAll" class="clear-all-btn">Clear All</button>
```

- [ ] **Step 2: Add `clearAll()` to `script.js`**

Add after the `refreshOptions()` function:

```js
function clearAll() {
  const inputIds = ["exclude", "include", "first", "second", "third", "fourth", "fifth",
                    "exFirst", "exSecond", "exThird", "exFourth", "exFifth"];
  for (let id of inputIds) {
    document.getElementById(id).value = "";
  }
  lastFilteredResults = [];
  wordListExpanded = false;
  document.getElementById("wordCount").innerHTML = "";
  document.getElementById("wordList").innerHTML = "";
  document.getElementById("wordOptionDiv").style.display = "none";
  displayStats(words);
  document.getElementById("exclude").focus();
}
```

At the bottom of `script.js` (next to the other listener wiring), add:

```js
const clearAllBtn = document.getElementById("clearAll");
if (clearAllBtn) {
  clearAllBtn.addEventListener('click', clearAll);
}
```

- [ ] **Step 3: Style the button in `style.css`**

Append:

```css
.clear-all-btn {
  display: block;
  margin: 0.75rem 0 0.25rem;
  min-height: 44px;
}
```

- [ ] **Step 4: Syntax gate**

Run: `node --check script.js`
Expected: no output, exit code 0.

- [ ] **Step 5: Manual verification**

1. Fill in several fields across all four input groups so the word list shows.
2. Tap "Clear All". Expected: every input is empty, the Word Options section is hidden, stats reset to the full-word-list chips (same as first page load), and the cursor is in the "Exclude These Letters" field.
3. Type a letter again: filtering works normally from the clean state.

- [ ] **Step 6: Commit**

```bash
git add index.html script.js style.css
git commit -m "feat(ui): add Clear All button to reset all inputs and results"
```

---

### Task 5: Backspace navigation in letter boxes ✅ (done in e24dd4b; also added a `beforeinput` fallback for mobile virtual keyboards that report Backspace keydown as "Unidentified")

**Files:**
- Modify: `script.js` (add `handleSingleKeydown`, wire into the existing `.singleLetters` loop)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing downstream.

- [x] **Step 1: Add the keydown handler**

Add after `handleSingleInput` in `script.js`:

```js
function handleSingleKeydown(e) {
  if (e.key === "Backspace" && e.target.value === "") {
    const prev = e.target.previousElementSibling;
    if (prev) {
      e.preventDefault();
      prev.focus();
      prev.select();
    }
  }
}
```

- [x] **Step 2: Wire it up**

Change the existing loop at the bottom of `script.js` from:

```js
const txtLetterBoxes = document.getElementsByClassName("singleLetters");
if (txtLetterBoxes) {
  for (let txt of txtLetterBoxes) {
    txt.addEventListener('input', handleSingleInput);
  }
}
```

to:

```js
const txtLetterBoxes = document.getElementsByClassName("singleLetters");
if (txtLetterBoxes) {
  for (let txt of txtLetterBoxes) {
    txt.addEventListener('input', handleSingleInput);
    txt.addEventListener('keydown', handleSingleKeydown);
  }
}
```

- [x] **Step 3: Syntax gate**

Run: `node --check script.js`
Expected: no output, exit code 0.

- [ ] **Step 4: Manual verification** *(pending — owner to verify per verifier-manual-only protocol)*

1. Type `ab` into the position boxes: focus auto-advances to box 3 (existing behavior intact).
2. Press Backspace in the empty box 3: focus moves to box 2 with "b" selected.
3. Press Backspace again: "b" is deleted, focus stays in box 2 (normal deletion untouched).
4. Press Backspace in the now-empty box 2: focus moves to box 1 with "a" selected.
5. Backspace in empty box 1 does nothing (no previous sibling).

- [x] **Step 5: Commit** *(e24dd4b, pushed to dev)*

```bash
git add script.js
git commit -m "feat(ux): backspace in empty letter box moves focus to previous box"
```

---

### Task 6: Mobile touch target sizing

**Files:**
- Modify: `style.css:246-264` (the `@media (max-width: 768px)` block and the `#wordListToggle` rule)

**Interfaces:**
- Consumes: `.refresh-btn` already sized 44×44 in Task 3 (all viewports); this task covers the remaining targets.
- Produces: nothing downstream.

- [ ] **Step 1: Enlarge letter boxes in the mobile media query**

In the `@media (max-width: 768px)` block, change:

```css
  input.singleLetters {
    width: 32px;
    height: 38px;
    margin: 0.2rem 0.3rem;
  }
```

to:

```css
  input.singleLetters {
    width: 44px;
    height: 50px;
    margin: 0.2rem 0.25rem;
    text-align: center;
  }
```

(5 × 44px + 10 × 4px box margins = 260px — fits a 320px viewport inside the 0.5rem wrapper margins.)

- [ ] **Step 2: Enlarge the Show all/Show less tap area**

Change the existing rule:

```css
#wordListToggle {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0;
  font-weight: bold;
  color: var(--color-text-main);
}
```

to:

```css
#wordListToggle {
  display: inline-block;
  margin-top: 0.25rem;
  padding: 0.75rem 0.5rem 0.75rem 0;
  font-weight: bold;
  color: var(--color-text-main);
}
```

- [ ] **Step 3: Manual verification**

1. At 320px viewport width: all 5 letter boxes in each row fit without wrapping or horizontal scroll.
2. At 375px: boxes are noticeably larger and comfortably tappable; typed letters are centered.
3. Trigger a result set of 50+ words: "Show all" link has a generous tap area and still toggles correctly.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat(ux): 44px touch targets for letter boxes and word list toggle"
```

---

### Task 7: Backlog housekeeping

**Files:**
- Modify: `.claude/tasks/mobile-ux-word-suggestions-visibility.md`

**Interfaces:**
- Consumes: Tasks 2, 3, and 6 being complete.
- Produces: nothing — documentation only.

- [ ] **Step 1: Check off completed items**

In `.claude/tasks/mobile-ux-word-suggestions-visibility.md`, change `- [ ]` to `- [x]` for:
- **Limit default word list display count on mobile** (implemented previously as `INITIAL_LIMIT = 50` / `MAX_LIMIT = 200` in `script.js`)
- **Condense letter frequency stats display** (Task 2)
- **Add collapsible/expandable sections for verbose output** (Task 3)
- **Improve touch targets and mobile input UX** (Tasks 5 and 6)

Leave **Add sticky compact summary bar below inputs** unchecked — descoped this pass, remains in backlog.

- [ ] **Step 2: Commit**

```bash
git add .claude/tasks/mobile-ux-word-suggestions-visibility.md
git commit -m "docs: check off completed mobile UX backlog items"
```
