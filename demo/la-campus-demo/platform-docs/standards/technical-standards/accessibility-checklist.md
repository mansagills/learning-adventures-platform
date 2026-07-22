# Accessibility Checklist (WCAG 2.1 AA)

## Overview

All Learning Adventures content must meet **WCAG 2.1 Level AA** accessibility standards. This ensures our educational content is usable by all students, including those with disabilities.

**Why This Matters:**
- Students with visual impairments use screen readers
- Students with motor disabilities use keyboards only
- Students with cognitive disabilities need clear, simple interfaces
- Schools may be legally required to provide accessible content
- Accessible design benefits ALL users

---

## Quick Reference Checklist

Print this checklist and verify each item:

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab key
- [ ] Tab order follows logical reading order (left→right, top→bottom)
- [ ] Enter or Space activates buttons and links
- [ ] Escape closes modals, popups, and overlays
- [ ] Arrow keys work for navigation within components
- [ ] No keyboard traps (can always Tab away)
- [ ] Focus is never lost or hidden off-screen

### Focus Indicators
- [ ] Focus ring visible on ALL interactive elements
- [ ] Focus indicator is at least 3px thick
- [ ] Focus color contrasts with background (3:1 minimum)
- [ ] Focus visible in all states (normal, hover, active)

### Color Contrast
- [ ] Normal text: 4.5:1 contrast ratio
- [ ] Large text (18px+ or 14px bold): 3:1 contrast ratio
- [ ] UI components: 3:1 contrast ratio
- [ ] Focus indicators: 3:1 contrast ratio

### Color Independence
- [ ] No information conveyed by color alone
- [ ] Correct/incorrect uses icons AND color
- [ ] Charts/graphs have patterns, not just colors
- [ ] Links distinguishable without color (underline)

### Images and Media
- [ ] All meaningful images have descriptive alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Complex images have detailed descriptions
- [ ] No images of text (use real text)

### Forms and Inputs
- [ ] All inputs have visible labels
- [ ] Labels are associated with inputs (`<label for="">`)
- [ ] Required fields are indicated
- [ ] Error messages are clear and helpful
- [ ] Error messages are announced to screen readers

### Screen Reader Support
- [ ] Semantic HTML used (`<button>`, `<nav>`, `<main>`)
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] ARIA labels on custom controls
- [ ] Live regions announce dynamic content
- [ ] Page has main landmark

### Motion and Animation
- [ ] No flashing more than 3 times per second
- [ ] `prefers-reduced-motion` is respected
- [ ] Animations can be paused
- [ ] Auto-playing content has controls

### Touch and Mobile
- [ ] Touch targets are 44×44 pixels minimum
- [ ] Adequate spacing between targets
- [ ] Content works in portrait and landscape
- [ ] Pinch-to-zoom not disabled

---

## Detailed Requirements

### 1. Keyboard Navigation

**All interactive elements must be keyboard accessible.**

#### Focusable Elements
These should be naturally focusable:
- `<button>`
- `<a href="...">`
- `<input>`, `<select>`, `<textarea>`
- Elements with `tabindex="0"`

#### Custom Controls
For custom interactive elements (divs acting as buttons):

```html
<!-- ❌ NOT accessible -->
<div class="button" onclick="handleClick()">Click me</div>

<!-- ✅ Accessible custom button -->
<div class="button"
     role="button"
     tabindex="0"
     onclick="handleClick()"
     onkeydown="if(event.key==='Enter'||event.key===' '){handleClick()}">
  Click me
</div>

<!-- ✅ Best: Just use a real button -->
<button onclick="handleClick()">Click me</button>
```

#### Tab Order
Ensure logical tab order:

```html
<!-- ✅ Natural left-to-right, top-to-bottom order -->
<header>
  <nav>
    <button>Home</button>
    <button>Help</button>
  </nav>
</header>
<main>
  <button>Start Game</button>
  <button>Settings</button>
</main>
```

#### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Tab | Move to next focusable element |
| Shift+Tab | Move to previous focusable element |
| Enter | Activate button/link |
| Space | Activate button, toggle checkbox |
| Escape | Close modal/popup |
| Arrow keys | Navigate within component (menus, tabs) |

### 2. Focus Indicators

**Focus must be visible at all times.**

```css
/* ✅ Good focus indicator */
button:focus,
a:focus,
[tabindex]:focus {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

/* ✅ Alternative focus style */
.card:focus {
  box-shadow: 0 0 0 3px #005fcc;
}

/* ❌ NEVER do this without replacement */
button:focus {
  outline: none; /* Removes accessibility! */
}

/* ✅ If removing default, provide alternative */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px #005fcc;
}
```

#### Focus Indicator Requirements
- Minimum 3px thickness
- Contrast ratio of 3:1 against adjacent colors
- Visible on all backgrounds (light and dark)
- Consistent across all interactive elements

### 3. Color Contrast

**Use a contrast checker tool** (WebAIM, Colour Contrast Analyser, Chrome DevTools)

#### Minimum Ratios

| Content Type | Minimum Ratio | Example |
|--------------|---------------|---------|
| Normal text (<18px) | 4.5:1 | Dark gray #333 on white |
| Large text (≥18px or ≥14px bold) | 3:1 | Medium gray #666 on white |
| UI components | 3:1 | Button borders, icons |
| Focus indicators | 3:1 | Focus rings |

#### High Contrast Color Palette

```css
/* ✅ Pre-verified accessible combinations */

/* Dark text on light backgrounds */
--text-primary: #1e293b;      /* On white: 12.6:1 */
--text-secondary: #475569;    /* On white: 7.0:1 */

/* Light text on dark backgrounds */
--text-on-dark: #ffffff;      /* On #1e293b: 12.6:1 */
--text-on-primary: #ffffff;   /* On #3b82f6: 4.5:1 */

/* UI Colors with sufficient contrast */
--success: #15803d;           /* On white: 5.1:1 */
--error: #dc2626;             /* On white: 4.5:1 */
--warning: #ca8a04;           /* On white: 3.1:1 (large text only) */
--info: #0369a1;              /* On white: 5.4:1 */
```

### 4. Color Independence

**Never use color as the only indicator.**

```html
<!-- ❌ Color only -->
<div class="answer correct" style="background: green;">
  Answer A
</div>

<!-- ✅ Color + icon -->
<div class="answer correct" style="background: green;">
  ✓ Answer A
</div>

<!-- ✅ Color + text -->
<div class="answer correct" style="background: green;">
  Answer A (Correct!)
</div>
```

#### Common Fixes

| Pattern | Bad | Good |
|---------|-----|------|
| Correct/incorrect | Green/red only | Green+checkmark / Red+X |
| Required fields | Red asterisk only | Red asterisk + "(required)" text |
| Links in text | Blue color only | Blue color + underline |
| Status indicators | Color dots only | Color + icon or text label |

### 5. Images and Alt Text

**Every image needs appropriate alt text.**

```html
<!-- Meaningful image: describe it -->
<img src="fraction-diagram.svg"
     alt="A circle divided into 4 equal parts with 3 parts shaded, representing 3/4">

<!-- Decorative image: empty alt -->
<img src="decorative-border.png" alt="">

<!-- Icon with text: empty alt (text provides meaning) -->
<button>
  <img src="play-icon.svg" alt="">
  Play Game
</button>

<!-- Icon alone: needs alt -->
<button aria-label="Play game">
  <img src="play-icon.svg" alt="Play">
</button>

<!-- Complex image: detailed description -->
<figure>
  <img src="water-cycle.png"
       alt="Diagram of the water cycle"
       aria-describedby="water-cycle-desc">
  <figcaption id="water-cycle-desc">
    The water cycle shows evaporation from oceans, condensation forming clouds,
    precipitation as rain, and collection back into bodies of water.
  </figcaption>
</figure>
```

#### Alt Text Guidelines
- Be concise but descriptive (under 125 characters if possible)
- Describe the content and function, not appearance
- Don't start with "Image of..." or "Picture of..."
- Include text shown in the image
- For charts/graphs, describe the data and trends

### 6. Forms and Inputs

**Every input needs a label.**

```html
<!-- ✅ Visible label -->
<label for="answer">Your answer:</label>
<input type="text" id="answer" name="answer">

<!-- ✅ Hidden label (when visual label isn't appropriate) -->
<label for="search" class="visually-hidden">Search</label>
<input type="search" id="search" placeholder="Search...">

<!-- ✅ ARIA label alternative -->
<input type="text" aria-label="Enter your answer">

<!-- ❌ No label - NOT accessible -->
<input type="text" placeholder="Answer">
```

#### Error Messages

```html
<!-- ✅ Accessible error handling -->
<label for="answer">Your answer:</label>
<input type="text"
       id="answer"
       aria-describedby="answer-error"
       aria-invalid="true">
<p id="answer-error" class="error" role="alert">
  Please enter a number between 1 and 10
</p>
```

### 7. Screen Reader Support

**Use semantic HTML and ARIA where needed.**

#### Semantic HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Fraction Game - Learning Adventures</title>
</head>
<body>
  <header>
    <h1>Fraction Pizza Party</h1>
    <nav aria-label="Game navigation">
      <button>Instructions</button>
      <button>Settings</button>
    </nav>
  </header>

  <main id="game-area" role="main">
    <h2>Level 1</h2>
    <!-- Game content -->
  </main>

  <footer>
    <p>Score: <span aria-live="polite">0 points</span></p>
  </footer>
</body>
</html>
```

#### ARIA Live Regions

For dynamic content that should be announced:

```html
<!-- Polite: announces when user is idle -->
<div aria-live="polite" id="feedback">
  <!-- Updated when answer is submitted -->
  Correct! Great job!
</div>

<!-- Assertive: announces immediately (use sparingly) -->
<div aria-live="assertive" id="timer-warning">
  <!-- Updated when time is almost up -->
  Warning: 10 seconds remaining!
</div>
```

#### ARIA Labels for Custom Controls

```html
<!-- Custom slider -->
<div role="slider"
     aria-label="Difficulty level"
     aria-valuemin="1"
     aria-valuemax="3"
     aria-valuenow="2"
     aria-valuetext="Medium"
     tabindex="0">
</div>

<!-- Custom checkbox -->
<div role="checkbox"
     aria-checked="false"
     aria-label="Enable sound effects"
     tabindex="0">
</div>
```

### 8. Motion and Animation

**Respect user preferences for reduced motion.**

```css
/* ✅ Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ✅ Or provide alternative */
.celebration {
  animation: bounce 0.5s ease;
}

@media (prefers-reduced-motion: reduce) {
  .celebration {
    animation: none;
    transform: scale(1.1); /* Static alternative */
  }
}
```

#### Animation Safety
- No content flashing more than 3 times per second
- Provide pause controls for auto-playing animations
- Keep animations subtle and purposeful
- Test with reduced motion preference enabled

### 9. Touch and Mobile

**Ensure touch-friendly design.**

```css
/* ✅ Adequate touch targets */
button,
a,
.clickable {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
}

/* ✅ Adequate spacing */
.button-group button {
  margin: 8px; /* Prevents accidental taps */
}

/* ✅ Don't disable zoom */
/* Never use: user-scalable=no or maximum-scale=1 */
```

---

## Testing Procedures

### 1. Keyboard Testing
1. Unplug mouse or disable trackpad
2. Navigate entire interface using only keyboard
3. Verify all actions can be completed
4. Check for keyboard traps
5. Verify focus is always visible

### 2. Screen Reader Testing

**VoiceOver (Mac):**
1. Enable: Cmd + F5
2. Navigate with VO + arrow keys
3. Verify all content is announced
4. Check that form labels are read
5. Verify live regions announce updates

**NVDA (Windows):**
1. Download free from nvaccess.org
2. Navigate with arrow keys
3. Use Tab for interactive elements
4. Verify content is announced correctly

### 3. Color Contrast Testing
1. Use browser DevTools (Chrome: Inspect → Color picker shows ratio)
2. Or use WebAIM Contrast Checker
3. Test all text against its background
4. Test UI components and focus indicators

### 4. Motion Testing
1. Enable reduced motion in OS settings
2. Reload the page
3. Verify animations are reduced/eliminated
4. Check that functionality still works

---

## Common Fixes

### Fix: Missing Focus Indicator
```css
/* Add to your CSS */
:focus {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}
```

### Fix: Non-Keyboard-Accessible Div
```html
<!-- Change this -->
<div onclick="handleClick()">Click me</div>

<!-- To this -->
<button onclick="handleClick()">Click me</button>
```

### Fix: Missing Alt Text
```html
<!-- Add meaningful alt -->
<img src="star.png" alt="Gold star - correct answer">

<!-- Or empty alt for decorative -->
<img src="decoration.png" alt="">
```

### Fix: Low Contrast Text
```css
/* Change this */
color: #999999; /* 2.8:1 - fails */

/* To this */
color: #595959; /* 7.0:1 - passes */
```

### Fix: Color-Only Indication
```html
<!-- Add icon alongside color -->
<span class="correct">✓ Correct!</span>
<span class="incorrect">✗ Try again</span>
```

---

## Resources

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

*Last Updated: January 2026*
