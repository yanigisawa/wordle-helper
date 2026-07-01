# Spec: Improve touch targets and mobile input UX
> From: .claude/tasks/mobile-ux-word-suggestions-visibility.md

## Objective

On mobile devices, the ten single-letter input boxes (5 for "Known Letter Positions" and 5 for "Include But NOT HERE") are currently 40x45px, which falls below Apple's recommended 44pt minimum touch target size. This task increases those tap targets to meet accessibility guidelines, adds `inputmode="text"` to each single-letter input to optimize the on-screen keyboard, and adds `scroll-into-view` behavior so the mobile keyboard does not obscure the focused input when it slides up.

## Current State

### style.css — `.singleLetters` rule (lines 169–179)

```css
input.singleLetters {
  font-family: inherit;
  font-size: 100%;
  background: #FFFFFF;
  border: 1px solid #000000;
  box-sizing: border-box;
  border-radius: 4px;
  width: 40px;
  height: 45px;
  margin: 0.25rem 0.5rem;
}
```

The inputs are rendered at a fixed 40×45px at all viewport sizes. No mobile-specific overrides or media queries exist anywhere in the file.

### index.html — single-letter inputs (lines 63–67 and 76–83)

Known Letter Positions group (`#letterBoxes`):
```html
<input type="text" maxlength="1" id="first"    class="singleLetters" autocapitalize="none" autocorrect="off" />
<input type="text" maxlength="1" id="second"   class="singleLetters" autocapitalize="none" autocorrect="off" />
<input type="text" id="third"    maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" />
<input type="text" id="fourth"   maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" />
<input type="text" id="fifth"    maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" />
```

Include But NOT HERE group (`#exLetterBoxes`):
```html
<input type="text" maxlength="1" id="exFirst"  class="singleLetters" autocapitalize="none" autocorrect="off" />
<input type="text" maxlength="1" id="exSecond" class="singleLetters" autocapitalize="none" autocorrect="off" />
<input type="text" id="exThird"  maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" />
<input type="text" id="exFourth" maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" />
<input type="text" id="exFifth"  maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" />
```

None of the single-letter inputs currently have an `inputmode` attribute. The `groupLetters` inputs (exclude, include) already have `autocapitalize="none"` and `autocorrect="off"` but likewise lack `inputmode`.

There is no JavaScript `focus` event listener for scroll-into-view behavior anywhere in `script.js`.

## Requirements

1. All ten `.singleLetters` inputs must have a minimum tappable area of 44px wide × 50px tall on viewports 768px wide and below.
2. All ten `.singleLetters` inputs must have `inputmode="text"` added as an HTML attribute so mobile browsers open a standard text keyboard (not a numeric or special keyboard).
3. When any `.singleLetters` input receives focus on a mobile device, it must scroll smoothly into view so the virtual keyboard does not obscure it.
4. The desktop appearance (40×45px) must remain unchanged on viewports wider than 768px.
5. No existing functionality (filtering, autocapitalize, autocorrect, maxlength) may be broken.

## Implementation Details

### File: `style.css`

Add a mobile media query block at the end of the file (after the existing `p` rule on line 231):

```css
@media (max-width: 768px) {
  input.singleLetters {
    width: 44px;
    height: 50px;
    margin: 0.25rem 0.35rem; /* tighten horizontal margin slightly so 5 boxes fit comfortably */
  }
}
```

- The breakpoint of `768px` aligns with Bootstrap 5's `md` breakpoint, below which the layout is considered mobile.
- Width increases from 40px to 44px (meets Apple's 44pt minimum).
- Height increases from 45px to 50px (provides additional vertical tap area and visual comfort).
- Horizontal margin is reduced slightly (from `0.5rem` to `0.35rem`) to prevent the 5 boxes from overflowing on narrow screens. If overflow is still observed, `margin` can be reduced further or a `max-width` container constraint applied to `#letterBoxes` / `#exLetterBoxes`.

### File: `index.html`

Add `inputmode="text"` to all ten `.singleLetters` inputs. The attribute should be placed consistently after `autocorrect="off"`:

Known Letter Positions (lines 63–67):
```html
<input type="text" maxlength="1" id="first"    class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
<input type="text" maxlength="1" id="second"   class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
<input type="text" id="third"    maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
<input type="text" id="fourth"   maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
<input type="text" id="fifth"    maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
```

Include But NOT HERE (lines 76–83):
```html
<input type="text" maxlength="1" id="exFirst"  class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
<input type="text" maxlength="1" id="exSecond" class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
<input type="text" id="exThird"  maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
<input type="text" id="exFourth" maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
<input type="text" id="exFifth"  maxlength="1" class="singleLetters" autocapitalize="none" autocorrect="off" inputmode="text" />
```

### File: `script.js`

Add a delegated `focus` event listener after the existing event listener setup (do not replace any existing listeners). This listener fires when any `.singleLetters` input is focused and scrolls it into the visible viewport:

```js
// Scroll single-letter inputs into view when focused on mobile so the
// virtual keyboard does not obscure the active input.
document.querySelectorAll('input.singleLetters').forEach(function(input) {
  input.addEventListener('focus', function() {
    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
```

- `block: 'center'` centers the focused input vertically in the remaining viewport above the keyboard, preventing it from being right at the keyboard edge.
- `behavior: 'smooth'` avoids a jarring jump.
- This code runs on all devices but is harmless on desktop (the viewport never obscures inputs there).
- The listener must be attached after the DOM is fully parsed. Because `script.js` is loaded with `defer` (see `index.html` line 30), `document.querySelectorAll` will already see all inputs when the script executes.

## Dependencies

- Blocked by: Group 2 tasks (as specified in the task description). This task should not be implemented until Group 2 tasks are complete.
- Blocking: None. This task does not block any other tasks.

## Risks & Edge Cases

- **Five boxes overflowing on very narrow screens (< 320px):** At 44px width + 2×0.35rem margin per box, five boxes total roughly 290px plus margins (~35px) = ~325px. On a 320px screen this may be tight. Mitigation: reduce margin further to `0.2rem` at a tighter breakpoint (e.g., `max-width: 360px`), or add `overflow-x: auto` to `#letterBoxes` / `#exLetterBoxes` as a safety net.
- **`scrollIntoView` timing on iOS:** iOS Safari may fire `scrollIntoView` before the keyboard fully opens, causing incomplete scrolling. If this is observed during verification, a short `setTimeout` (e.g., 300ms) can wrap the `scrollIntoView` call, though this adds complexity and should only be added if the issue is reproducible.
- **`inputmode` browser support:** `inputmode="text"` is broadly supported in modern mobile browsers (iOS Safari 12.2+, Android Chrome 66+). Older browsers silently ignore the attribute, so there is no regression risk.
- **Bootstrap 5 form-control overrides:** The `groupLetters` inputs use Bootstrap's `.form-control` class which may impose its own sizing. The `.singleLetters` inputs do not use `.form-control`, so Bootstrap interference is not expected, but should be confirmed during verification.
- **Attribute ordering inconsistency:** The existing HTML has `id` and `maxlength` in inconsistent order across inputs (compare `id="third"` appearing after `type` on line 65 vs. after `maxlength` on line 63). The `inputmode` attribute should simply be appended after `autocorrect="off"` on each input without reordering other attributes, to minimize diff noise.

## Verification

1. Open `index.html` on a physical iOS or Android device (or browser DevTools with a mobile device profile at 375px width).
2. Inspect any `.singleLetters` input in DevTools; confirm computed `width` is at least 44px and `height` is at least 50px.
3. Inspect the same input's HTML; confirm `inputmode="text"` is present as an attribute.
4. Tap a single-letter input and confirm:
   - The standard alphabetic keyboard opens (not numeric or emoji).
   - The focused input is visible above the keyboard (not obscured).
   - The page scrolls smoothly to center the input if it was near the bottom.
5. Resize the browser to > 768px (desktop) and confirm `.singleLetters` inputs remain at 40×45px.
6. Enter letters in each of the ten single-letter inputs and confirm the existing filtering behavior (known positions and "include but not here") still works correctly.
7. Confirm the five boxes in each row fit horizontally without horizontal scrolling on a 375px-wide viewport.
