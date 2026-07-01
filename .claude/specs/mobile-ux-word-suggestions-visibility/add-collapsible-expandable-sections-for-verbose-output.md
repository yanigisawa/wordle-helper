# Spec: Add collapsible/expandable sections for verbose output
> From: .claude/tasks/mobile-ux-word-suggestions-visibility.md

## Objective

Wrap the "Word Options" list and "Remaining Word Stats" sections in Bootstrap 5 collapse components so that mobile users can see all output section headers at a glance without scrolling through long lists. Each section header acts as a toggle button that displays the section title along with an item count, and expands/collapses the content on tap. No additional JavaScript is needed because Bootstrap 5's `data-bs-toggle="collapse"` and `data-bs-target` attributes handle the interaction entirely via the already-loaded Bootstrap JS bundle (line 134-136 of `index.html`).

## Current State

### index.html (lines 85-119)

Three output sections are rendered unconditionally below the input controls:

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
```

- All three sections are always fully expanded. On mobile, a large word list and a 26-item stats list push useful content far below the fold.
- `wordCount` (a `<span>` inside the "Word Options" `<h2>`) is updated by `filterResults()` in `script.js` (line 156): `wordCountSpan.innerHTML = \`(${results.length})\`;`
- `wordStats` (a `<ul>`) is populated by `displayStats()` (lines 288-292).
- `recommdedStartingWords` (a `<ul>`) is populated by `refreshRecommendations()` (lines 294-300).
- Bootstrap 5 CSS and JS are already loaded (lines 22-23 and 134-136).

### style.css

- No existing styles target the output section headers or their collapse behavior.
- There is a dead rule `#wordOptionDiv { display: none; }` (line 185-187) referencing a mismatched ID (`wordOptionDiv` vs the actual `wordOptionDiv1`).

### script.js

- `showResults()` (lines 6-9) targets `wordOptionDiv` by ID — the same mismatched ID — meaning it currently has no effect on the actual `wordOptionDiv1` element.
- `filterResults()` writes to `wordList` (`<p>`) and calls `displayStats()`.
- `displayStats()` writes to `wordStats` (`<ul>`).
- `refreshRecommendations()` writes to `recommdedStartingWords` (`<ul>`).

## Requirements

1. The "Word Options" section header must become a clickable toggle that expands and collapses the word list (`#wordList`).
2. The "Remaining Word Stats" section header must become a clickable toggle that expands and collapses the stats list (`#wordStats`).
3. The "Starting Words" section header must become a clickable toggle that expands and collapses the starting words list (`#recommdedStartingWords`). (This section is not explicitly called out in the task description but is structurally identical and benefits from the same treatment for consistency.)
4. Each toggle header must display the section title and, where a count is already computed, the item count (e.g., "Word Options (42)").
5. Sections must use Bootstrap 5's `data-bs-toggle="collapse"` and `data-bs-target` attributes — no custom JavaScript event listeners for the expand/collapse behavior.
6. The collapse/expand must work on both mobile and desktop without JavaScript changes.
7. Each section's collapsed/expanded state must be visually distinguishable (e.g., a chevron icon or Bootstrap's default indicator).
8. "Word Options" and "Remaining Word Stats" should default to collapsed on page load so the headers-only view is the initial mobile experience. "Starting Words" may default to expanded since it is populated on page load by `refreshRecommendations()` and is the primary action a new user will want.
9. The refresh buttons inside "Word Options" and "Starting Words" must remain functional after the restructure; they must not be removed or broken by wrapping them in collapse containers.
10. The existing `id` attributes on content elements (`wordList`, `wordStats`, `recommdedStartingWords`, `wordCount`) must remain unchanged so `script.js` DOM lookups continue to work without modification.

## Implementation Details

### index.html changes (lines 85-119)

Replace each section's flat header + content pattern with a Bootstrap collapse structure. The general pattern for each section is:

```html
<div class="section-collapse-header">
  <button class="btn btn-link section-toggle w-100 text-start d-flex align-items-center"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseWordOptions"
          aria-expanded="false"
          aria-controls="collapseWordOptions">
    <h2 class="mb-0">Word Options <span id="wordCount"></span></h2>
    <span class="collapse-chevron ms-auto"></span>
  </button>
  <!-- refresh button placed outside the collapse target, inside the header row -->
  <button type="button" onclick="refreshOptions()" ...>
    <img src="refresh.svg" ... />
  </button>
</div>
<div class="collapse" id="collapseWordOptions">
  <p id="wordList"></p>
</div>
<hr />
```

Specific sections to wrap:

1. **Word Options** — collapse ID `collapseWordOptions`, defaults to collapsed (`aria-expanded="false"`), keep `id="wordCount"` span inside the button label, keep the refresh button in the header row but outside the collapse target div.
2. **Remaining Word Stats** — collapse ID `collapseWordStats`, defaults to collapsed (`aria-expanded="false"`), no refresh button.
3. **Starting Words** — collapse ID `collapseStartingWords`, defaults to expanded (`show` class on the collapse div, `aria-expanded="true"`), keep the refresh button in the header row but outside the collapse target div.

### style.css changes

Add styles to:

1. Remove the underline and default link color from the `.section-toggle` button so it looks like a section header rather than a hyperlink.
2. Style the `.collapse-chevron` pseudo-element (or an inline SVG/Unicode character) to rotate when the section is expanded. Bootstrap 5 sets `aria-expanded` on the toggle button automatically; use the CSS attribute selector to drive the rotation:

```css
.section-toggle[aria-expanded="true"] .collapse-chevron::before {
  transform: rotate(180deg);
}
.collapse-chevron::before {
  content: "▾";
  display: inline-block;
  transition: transform 0.2s ease;
}
```

3. Remove or update the dead rule `#wordOptionDiv { display: none; }` (line 185-187) — it targets a non-existent ID and can be deleted without side effects.

### script.js changes

No behavioral changes are required. However, the `showResults()` function (lines 6-9) currently targets `#wordOptionDiv`, which does not match any element in the HTML (`#wordOptionDiv1` is the actual ID). This has been a silent no-op. After this change the section visibility is controlled by Bootstrap collapse, so `showResults()` can either be:

- Left as-is (harmless no-op), or
- Removed and its two call sites (`handleGroupInput` and `refreshOptions`) cleaned up.

Removing it is low risk since it has never functioned, but it is out of scope for this task. Document the dead code rather than removing it here to keep the diff minimal.

## Dependencies

- Blocked by: "Reorganize page layout to prioritize output sections on mobile" — this task assumes the section order established by that reorganization task. The collapse wrappers must be applied to whatever final section order that task produces in `index.html`.
- Blocking: none.

## Risks & Edge Cases

1. **Item count in header while collapsed** — The `wordCount` span is updated by `filterResults()` every time the user types. Because the span lives inside the toggle button (which is always visible), the count remains readable even when the section is collapsed. No special handling is needed.

2. **Expanding a section after filtering** — When the user types and results update while the Word Options section is collapsed, the content is updated in the DOM but not visible. This is acceptable UX: the count in the header updates immediately, and the user taps the header to see the list. If the section should auto-expand on filter activity, that would require a small JS change (`bootstrap.Collapse.getOrCreateInstance(el).show()`), but this is not required by the task.

3. **Refresh buttons must not be inside the collapse target** — If either refresh button (`refreshOptions`, `refreshRecommendations`) is placed inside `<div class="collapse">`, it becomes hidden when the section is collapsed and unreachable. Both buttons must stay in the always-visible header row, outside the collapse target.

4. **Bootstrap JS bundle requirement** — The collapse component requires `bootstrap.min.js` (already present at line 134-136). The CDN integrity hash must not be changed; no additional scripts are needed.

5. **Dead CSS rule** — The existing `#wordOptionDiv { display: none; }` in `style.css` targets a non-existent ID and is harmless, but it is confusing. It should be removed as part of this change to avoid misleading future maintainers.

6. **Keyboard accessibility** — Using a `<button>` element for the toggle (rather than a `<div>` or `<span>`) ensures keyboard users can activate the collapse with Enter/Space. The `aria-expanded` attribute, managed automatically by Bootstrap, provides correct screen reader feedback.

7. **Initial page load state for Starting Words** — `refreshRecommendations()` runs on page load (line 303 of `script.js`) and populates the starting words list before the user interacts. If this section defaults to collapsed, that initial content is hidden. Therefore this section should default to expanded (`class="collapse show"`, `aria-expanded="true"`) so returning users and first-time users immediately see suggested starting words.

## Verification

1. Open `index.html` in a browser (mobile viewport simulation via DevTools or on-device).
2. Confirm that on initial load, "Word Options" and "Remaining Word Stats" section headers are visible but their content areas are hidden.
3. Confirm that "Starting Words" is visible and expanded on initial load with the generated word list showing.
4. Tap the "Word Options" header — confirm the word list expands smoothly.
5. Tap the "Word Options" header again — confirm the word list collapses.
6. Type a letter into the "Exclude" input. Confirm:
   - The word list updates (visible when expanded).
   - The count in the "Word Options" header (`#wordCount`) updates correctly regardless of collapsed/expanded state.
7. Click the refresh icon button inside "Word Options" — confirm it calls `refreshOptions()` and updates results without toggling the collapse state.
8. Expand "Remaining Word Stats" — confirm all 26 letter frequency entries appear as a list.
9. Click the refresh icon button inside "Starting Words" — confirm it calls `refreshRecommendations()` and updates the list without interfering with collapse state.
10. Verify on desktop viewport that all three sections are fully usable and the chevron indicators rotate correctly on expand/collapse.
11. Tab through the page with keyboard only — confirm each section header button is reachable and activatable with Enter/Space.
12. Inspect the DOM and confirm `id="wordList"`, `id="wordStats"`, `id="recommdedStartingWords"`, and `id="wordCount"` are all still present and unchanged.
