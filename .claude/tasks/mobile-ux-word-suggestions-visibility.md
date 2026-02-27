# Task Breakdown: Mobile UX - Word Suggestions Visibility

> Restructure the Wordle Helper layout so that word suggestions, letter frequency stats, and starting word recommendations are visible with minimal scrolling on mobile devices.

## Group 1 — Bug Fix and Layout Restructuring
_Tasks in this group can be done in parallel._

- [x] **Fix showResults() element ID mismatch** `[S]`
  The `showResults()` function in `script.js` line 7 references `document.getElementById("wordOptionDiv")`, but the HTML element at line 85 of `index.html` has `id="wordOptionDiv1"`. Additionally, there is a CSS rule for `#wordOptionDiv` with `display: none` at line 185-187 of `style.css` that never applies because the ID does not match. Either rename the HTML element to `wordOptionDiv` or update the JS and CSS references to `wordOptionDiv1`. This bug means `showResults()` currently fails silently every time it is called.
  Files: `script.js` (line 7), `index.html` (line 85), `style.css` (lines 185-187)
  Blocking: None (but should be fixed before any layout work that depends on show/hide behavior)

- [x] **Reorganize page layout to prioritize output sections on mobile** `[M]`
  Restructure `index.html` so that the most useful output sections (Remaining Word Stats, Starting Words, and a compact Word Options summary) appear closer to the inputs. The recommended approach is:
  1. Move "Remaining Word Stats" and "Starting Words" above the full "Word Options" word list.
  2. Alternatively, add a compact summary row immediately below the inputs showing: word count, top 5 most likely next letters, and 3-5 suggested words — so the user gets actionable information without scrolling at all.
  3. Keep the full word list further down for users who want to browse all options.

  The current order (inputs -> 200 words -> stats -> starting words) forces the most valuable information to the bottom. On mobile, the stats and starting words should be reachable within one thumb-scroll from the last input field.
  Files: `index.html` (lines 85-127)
  Blocking: "Add collapsible/expandable sections for verbose output", "Limit default word list display count on mobile"

- [x] **Add mobile-responsive CSS with media queries** `[M]`
  Add `@media` queries to `style.css` targeting typical phone viewports (max-width: 768px). Specific changes needed:
  1. Reduce heading sizes (`h1`, `h2`) for mobile — currently they are full-size and take considerable vertical space.
  2. Reduce vertical margins and padding throughout (the `<br />` tag at line 70 of `index.html` and `mb-3` Bootstrap classes add unnecessary spacing on mobile).
  3. Tighten spacing on the single-letter input boxes (currently 40x45px with 0.5rem horizontal margin at lines 169-179 of `style.css`) — on a narrow phone screen 5 boxes at this size with margins may overflow or waste space.
  4. Ensure the `.wrapper` and `.content` containers do not add unnecessary padding on small screens (`.wrapper` has `margin: 0 1rem` at line 122).
  5. Reduce font size on `<p>` elements (currently `font-size: 1.25em` at line 231) for denser information display on mobile.
  Files: `style.css`
  Blocking: None

## Group 2 — Output Optimization
_Depends on: Group 1 (specifically "Reorganize page layout")_

- [ ] **Limit default word list display count on mobile** `[S]`
  Currently `filterResults()` in `script.js` (lines 161-168) renders up to 200 words. On mobile, this creates an enormous scrollable block that pushes everything below it off-screen. Change the default display to show only 10-20 words initially, with a "Show more" button or link to expand to the full list. The total count is already shown in `#wordCount` (line 156), so users will know more words exist. This dramatically reduces the vertical space consumed by the word list on mobile.
  Files: `script.js` (lines 146-173), `index.html` (near line 96)
  Blocking: None

- [ ] **Condense letter frequency stats display** `[S]`
  The `displayStats()` function in `script.js` (lines 288-292) renders all 26 letters as individual `<li>` items, most of which have a count of 0 once filters are applied. Change this to:
  1. Only display letters with a count > 0.
  2. Show them in a compact horizontal format (e.g., a flex-wrapped row of badges or chips like "E: 342  A: 289  R: 241") rather than a vertical `<ul>` list.
  3. Optionally limit to the top 10 most frequent letters by default.

  This reduces 26 vertical list items to a compact block that fits in 2-3 lines on mobile.
  Files: `script.js` (lines 288-292), `index.html` (lines 105-106), `style.css` (new styles for compact stats)
  Blocking: None

- [ ] **Add collapsible/expandable sections for verbose output** `[M]`
  Use Bootstrap 5's collapse component (already loaded via CDN at line 22-23 of `index.html`) to make the Word Options list and full letter stats collapsible. Each section should have a toggle button/header that shows the section title and item count, and expands on tap. This lets mobile users see all section headers at a glance and expand only the section they need. Bootstrap 5's `data-bs-toggle="collapse"` and `data-bs-target` attributes make this straightforward without additional JS.
  Files: `index.html` (lines 85-119), `style.css` (minor styling for collapse toggles)
  Blocking: None

## Group 3 — Mobile Interaction Polish
_Depends on: Group 2_

- [ ] **Add sticky compact summary bar below inputs** `[M]`
  Add a small sticky/fixed-position summary area that appears just below the input controls on mobile. This bar should display:
  1. The current matching word count (from `#wordCount`).
  2. The top 3-5 most common remaining letters (extracted from `getWordListStats()`).
  3. 2-3 random word suggestions from the filtered results.

  This ensures the most actionable information is always visible on screen regardless of scroll position. Use CSS `position: sticky` with a `top` value just below the inputs area. Update `filterResults()` in `script.js` to also populate this summary element.
  Files: `index.html` (new element), `style.css` (sticky positioning, mobile-only display), `script.js` (update `filterResults()` around line 170)
  Blocking: None

- [ ] **Improve touch targets and mobile input UX** `[S]`
  On mobile, the single-letter input boxes (5 for known positions + 5 for "not here") are small tap targets. Increase their size slightly on mobile via media queries (e.g., 44x50px minimum, which meets Apple's 44pt recommended touch target). Also consider adding `inputmode="text"` attributes and ensuring the keyboard does not obscure inputs by using `scroll-into-view` behavior when inputs are focused.
  Files: `style.css` (media query additions), `index.html` (input attributes on lines 63-67, 76-83)
  Blocking: None
