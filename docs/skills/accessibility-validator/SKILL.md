# Accessibility Validator Skill

## 🎯 Purpose
Ensure all educational content meets WCAG 2.1 AA accessibility standards, making the Learning Adventures platform usable by all students including those with disabilities. This skill provides comprehensive testing procedures, validation techniques, and remediation strategies for both HTML games and React components.

---

## 📚 When to Use This Skill

### ✅ Use This Skill For:
- **Pre-Launch Validation**: Testing new games/lessons before deployment
- **Content Audits**: Reviewing existing content for compliance issues
- **Bug Fixes**: Resolving accessibility-related user reports
- **Compliance Verification**: Ensuring WCAG 2.1 AA compliance
- **Platform Updates**: Validating changes to shared components
- **Educational Content**: Both HTML files and React components

### 📋 Required Standards:
- **WCAG 2.1 Level AA**: Primary accessibility standard
- **Section 508**: Federal accessibility requirements (USA)
- **ADA Compliance**: Americans with Disabilities Act requirements
- **Education-Specific**: Additional considerations for K-12 learners

---

## 🎓 WCAG 2.1 AA Principles (POUR)

### P - Perceivable
Information and user interface components must be presentable to users in ways they can perceive.

### O - Operable
User interface components and navigation must be operable.

### U - Understandable
Information and the operation of user interface must be understandable.

### R - Robust
Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.

---

## ✅ Critical Testing Checklist

### 1. Keyboard Navigation (CRITICAL - Level A)

#### Requirements:
- [ ] All interactive elements accessible via Tab key
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators clearly visible (minimum 3px, high contrast)
- [ ] No keyboard traps (can always escape)
- [ ] Enter/Space activates buttons and controls
- [ ] Arrow keys navigate menus and lists
- [ ] Escape key closes modals and popups
- [ ] Skip links available for navigation

#### Testing Procedure:
```
1. Disconnect mouse
2. Use only Tab, Shift+Tab, Enter, Space, Arrow keys, Esc
3. Navigate through entire game/lesson
4. Verify all functionality accessible
5. Check tab order matches visual order
6. Ensure focus always visible
```

#### Common Issues:
```html
<!-- ❌ Bad: onClick only, no keyboard support -->
<div onclick="handleClick()">Click me</div>

<!-- ✅ Good: Button with keyboard support -->
<button onclick="handleClick()">Click me</button>

<!-- ❌ Bad: Custom control without keyboard handling -->
<div class="card" onclick="selectCard()">Card</div>

<!-- ✅ Good: Keyboard accessible custom control -->
<div
  class="card"
  role="button"
  tabindex="0"
  onclick="selectCard()"
  onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCard()}"
>
  Card
</div>
```

---

### 2. Color Contrast (CRITICAL - Level AA)

#### Requirements:
- [ ] Normal text: Minimum 4.5:1 contrast ratio
- [ ] Large text (18pt+ or 14pt+ bold): Minimum 3:1 contrast ratio
- [ ] UI controls and graphics: Minimum 3:1 contrast ratio
- [ ] No information conveyed by color alone
- [ ] Links distinguishable from surrounding text

#### Testing Procedure:
```
1. Use browser inspector to check computed colors
2. Test with WebAIM Contrast Checker
3. Verify all text meets 4.5:1 threshold
4. Check UI elements meet 3:1 threshold
5. Review color-only indicators (add text/icons)
```

#### Recommended Color Palette:
```css
/* High contrast text colors */
:root {
  /* Dark text on light backgrounds */
  --text-primary: #1a1a1a;        /* 16.1:1 on white */
  --text-secondary: #4a4a4a;      /* 9.7:1 on white */
  --link-color: #0066cc;          /* 7.4:1 on white */

  /* Light text on dark backgrounds */
  --text-inverse: #ffffff;        /* 21:1 on black */
  --text-inverse-secondary: #e0e0e0; /* 14.6:1 on black */

  /* UI Controls */
  --button-primary: #0066cc;      /* 7.4:1 on white */
  --button-success: #00844A;      /* 4.6:1 on white */
  --button-warning: #cc6600;      /* 5.3:1 on white */
  --button-danger: #cc0000;       /* 5.9:1 on white */

  /* Borders and dividers */
  --border-color: #767676;        /* 4.5:1 on white */
}

/* Error state - don't rely on color alone */
.error {
  color: #cc0000;
  border: 2px solid #cc0000;
  padding-left: 30px;
  background: url('error-icon.svg') no-repeat 5px center;
}

/* Success state - icon + color */
.success {
  color: #00844A;
}
.success::before {
  content: '✓ ';
  font-weight: bold;
}
```

#### Contrast Testing Tools:
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Chrome DevTools**: Inspect element → Color picker shows contrast ratio
- **Lighthouse**: Automated contrast testing in audit report

---

### 3. Screen Reader Support (CRITICAL - Level A/AA)

#### Requirements:
- [ ] All images have meaningful alt text
- [ ] Decorative images have empty alt (`alt=""`)
- [ ] Form inputs have associated labels
- [ ] Buttons have descriptive text or aria-label
- [ ] Heading structure is logical (h1 → h2 → h3, no skips)
- [ ] ARIA landmarks identify page regions
- [ ] ARIA roles used appropriately
- [ ] Status messages announced with aria-live
- [ ] Links have meaningful text (no "click here")

#### Testing Procedure:
```
1. Install screen reader:
   - Windows: NVDA (free) or JAWS
   - Mac: VoiceOver (built-in)
   - Mobile: TalkBack (Android) or VoiceOver (iOS)

2. Close eyes and navigate entire experience
3. Verify all content announced clearly
4. Check announcements make sense
5. Ensure interactive elements identifiable
```

#### Image Alt Text Examples:
```html
<!-- ❌ Bad: Generic alt text -->
<img src="math-game.png" alt="image">
<img src="science-icon.png" alt="icon">

<!-- ✅ Good: Descriptive alt text -->
<img src="math-game.png" alt="Student solving addition problems on a tablet">
<img src="science-icon.png" alt="Chemistry beaker icon">

<!-- ❌ Bad: Decorative image with alt text -->
<img src="border-decoration.png" alt="decorative border">

<!-- ✅ Good: Decorative image with empty alt -->
<img src="border-decoration.png" alt="">

<!-- ❌ Bad: Important information in image without alt -->
<img src="instructions.png">

<!-- ✅ Good: Alt text conveys information -->
<img src="instructions.png" alt="Step 1: Click the answer. Step 2: Press submit.">
```

#### Form Label Examples:
```html
<!-- ❌ Bad: No label -->
<input type="text" placeholder="Enter your name">

<!-- ✅ Good: Explicit label -->
<label for="student-name">Student Name:</label>
<input type="text" id="student-name" placeholder="Enter your name">

<!-- ✅ Good: aria-label for icon-only button -->
<button aria-label="Close dialog">×</button>

<!-- ✅ Good: aria-labelledby for complex labeling -->
<div id="question-text">What is 2 + 2?</div>
<input type="number" aria-labelledby="question-text">
```

#### Heading Structure:
```html
<!-- ❌ Bad: Skipped heading levels -->
<h1>Math Challenge</h1>
<h3>Question 1</h3>  <!-- Skipped h2 -->

<!-- ✅ Good: Logical hierarchy -->
<h1>Math Challenge</h1>
<h2>Addition Section</h2>
<h3>Question 1</h3>
<h3>Question 2</h3>
<h2>Subtraction Section</h2>
```

#### ARIA Landmarks:
```html
<header role="banner">
  <nav role="navigation">
    <!-- Navigation links -->
  </nav>
</header>

<main role="main">
  <article role="article">
    <!-- Main content -->
  </article>

  <aside role="complementary">
    <!-- Related content -->
  </aside>
</main>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

#### Live Regions for Announcements:
```html
<!-- Score updates -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  Score: <span id="score-value">0</span> points
</div>

<!-- Error messages -->
<div aria-live="assertive" role="alert" class="error-message">
  <!-- Error text inserted here -->
</div>

<!-- Timer updates (less intrusive) -->
<div aria-live="off" id="timer">
  Time: <span>60</span>
</div>

<!-- Screen reader only class -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
```

---

### 4. Focus Management (Level AA)

#### Requirements:
- [ ] Focus indicators have minimum 3px width
- [ ] Focus indicators have 3:1 contrast ratio
- [ ] Focus never hidden or removed
- [ ] Focus moved appropriately (modals, dynamic content)
- [ ] Custom focus styles visible

#### Focus Styling:
```css
/* ❌ Bad: Focus hidden */
*:focus {
  outline: none; /* Never do this! */
}

/* ✅ Good: Clear focus indicators */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 3px solid #f093fb;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Custom focus with box-shadow */
.custom-control:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(240, 147, 251, 0.5);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  *:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }
}
```

#### Focus Management in Modals:
```javascript
// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const previousFocus = document.activeElement;

  // Store previous focus
  modal.dataset.previousFocus = previousFocus.id || 'body';

  // Show modal
  modal.style.display = 'block';
  modal.setAttribute('aria-hidden', 'false');

  // Focus first focusable element
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  firstFocusable?.focus();

  // Trap focus in modal
  modal.addEventListener('keydown', trapFocus);
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);

  // Hide modal
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');

  // Return focus
  const previousFocusId = modal.dataset.previousFocus;
  const previousElement = document.getElementById(previousFocusId) || document.body;
  previousElement.focus();

  // Remove trap
  modal.removeEventListener('keydown', trapFocus);
}

// Focus trap implementation
function trapFocus(e) {
  if (e.key !== 'Tab') return;

  const modal = e.currentTarget;
  const focusableElements = modal.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault();
    lastElement.focus();
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault();
    firstElement.focus();
  }
}
```

---

### 5. Text Resizing (Level AA)

#### Requirements:
- [ ] Text resizable up to 200% without loss of content or functionality
- [ ] Use relative units (rem, em) instead of px
- [ ] No horizontal scrolling at 200% zoom
- [ ] Layout remains readable

#### Responsive Typography:
```css
/* ❌ Bad: Fixed pixel sizes */
body {
  font-size: 16px;
}
h1 {
  font-size: 32px;
}

/* ✅ Good: Relative sizing */
html {
  font-size: 16px; /* Base size */
}
body {
  font-size: 1rem; /* 16px */
}
h1 {
  font-size: 2rem; /* 32px, scales with base */
}
h2 {
  font-size: 1.5rem; /* 24px */
}
p {
  font-size: 1rem;
  line-height: 1.5; /* Unitless for better scaling */
}

/* Responsive breakpoints */
@media (min-width: 768px) {
  html {
    font-size: 18px; /* Larger base on tablets */
  }
}

@media (min-width: 1024px) {
  html {
    font-size: 20px; /* Larger base on desktop */
  }
}
```

---

### 6. Touch Targets (Level AAA, Best Practice)

#### Requirements:
- [ ] Minimum 44×44 CSS pixels for all touch targets
- [ ] Adequate spacing between touch targets
- [ ] Mobile-friendly interface

#### Touch Target Sizing:
```css
/* ❌ Bad: Small touch targets */
button {
  width: 30px;
  height: 30px;
}

/* ✅ Good: Minimum 44x44px */
button {
  min-width: 44px;
  min-height: 44px;
  padding: 8px 16px;
}

/* Touch target spacing */
.button-group button {
  margin: 4px; /* Prevents accidental touches */
}

/* Icon buttons need explicit size */
.icon-button {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

### 7. Motion and Animation (Level A/AAA)

#### Requirements:
- [ ] No auto-playing media
- [ ] No flashing content (≤3 flashes per second)
- [ ] Animations can be paused
- [ ] Respect prefers-reduced-motion

#### Motion Preferences:
```css
/* Default animations */
.animated {
  animation: slideIn 0.3s ease-out;
  transition: transform 0.3s, opacity 0.3s;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### Pausable Animations in JavaScript:
```javascript
// Detect user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Only animate if user allows
if (!prefersReducedMotion) {
  startAnimation();
}

// Provide pause button
const pauseButton = document.createElement('button');
pauseButton.textContent = 'Pause Animation';
pauseButton.setAttribute('aria-label', 'Pause background animation');
pauseButton.onclick = () => {
  document.body.style.animationPlayState = 'paused';
};
```

---

### 8. Forms and Error Handling (Level A/AA)

#### Requirements:
- [ ] All inputs have labels
- [ ] Error messages are descriptive
- [ ] Errors announced to screen readers
- [ ] Error prevention for critical actions
- [ ] Clear instructions provided

#### Accessible Forms:
```html
<!-- Complete form example -->
<form>
  <!-- Text input with label -->
  <div class="form-group">
    <label for="student-name">Student Name (Required)</label>
    <input
      type="text"
      id="student-name"
      name="student-name"
      required
      aria-required="true"
      aria-describedby="name-help name-error"
    >
    <small id="name-help">Enter your first and last name</small>
    <div id="name-error" role="alert" class="error" style="display:none;">
      <!-- Error message inserted here -->
    </div>
  </div>

  <!-- Radio buttons -->
  <fieldset>
    <legend>Choose your grade level</legend>
    <label>
      <input type="radio" name="grade" value="k-2" required>
      K-2nd Grade
    </label>
    <label>
      <input type="radio" name="grade" value="3-5">
      3rd-5th Grade
    </label>
  </fieldset>

  <!-- Submit with confirmation -->
  <button type="submit">
    Submit Answer
  </button>
</form>
```

#### Error Handling:
```javascript
function validateForm(form) {
  const errors = [];
  const nameInput = form.querySelector('#student-name');
  const nameError = document.getElementById('name-error');

  // Validate name
  if (!nameInput.value.trim()) {
    errors.push({
      field: nameInput,
      message: 'Student name is required'
    });
  }

  // Display errors
  if (errors.length > 0) {
    errors.forEach(error => {
      const errorDiv = error.field.nextElementSibling;
      errorDiv.textContent = error.message;
      errorDiv.style.display = 'block';
      error.field.setAttribute('aria-invalid', 'true');
      error.field.classList.add('error');
    });

    // Focus first error
    errors[0].field.focus();

    return false;
  }

  return true;
}
```

---

## 🔧 Common Fixes and Patterns

### Fix 1: Add Keyboard Support to Custom Elements
```javascript
// Make custom card clickable with keyboard
const cards = document.querySelectorAll('.game-card');

cards.forEach(card => {
  // Make focusable
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');

  // Add keyboard handler
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.click();
    }
  });
});
```

### Fix 2: Improve Button Accessibility
```html
<!-- Before -->
<div class="btn" onclick="submit()">Submit</div>

<!-- After -->
<button type="button" onclick="submit()">
  Submit Answer
</button>
```

### Fix 3: Add Skip Navigation Link
```html
<body>
  <!-- Skip link (visually hidden until focused) -->
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>

  <header>
    <!-- Navigation -->
  </header>

  <main id="main-content" tabindex="-1">
    <!-- Main content -->
  </main>
</body>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

### Fix 4: Announce Dynamic Content Changes
```javascript
// Announce score updates
function updateScore(newScore) {
  const scoreElement = document.getElementById('score');
  const announcement = document.getElementById('score-announcement');

  // Update display
  scoreElement.textContent = newScore;

  // Announce to screen readers
  announcement.textContent = `Your score is now ${newScore} points`;
}
```

```html
<div class="score-display">
  Score: <span id="score">0</span>
</div>

<!-- Hidden announcement for screen readers -->
<div id="score-announcement" aria-live="polite" class="sr-only"></div>
```

---

## 📊 Testing Tools and Procedures

### Automated Testing Tools

#### 1. Lighthouse (Chrome DevTools)
```
1. Open Chrome DevTools (F12)
2. Navigate to "Lighthouse" tab
3. Select "Accessibility" category
4. Click "Generate report"
5. Review issues and recommendations
6. Target score: 95+ (100 ideal)
```

#### 2. WAVE Browser Extension
```
1. Install WAVE from WebAIM
2. Navigate to your game/lesson
3. Click WAVE extension icon
4. Review errors, alerts, and features
5. Fix all errors, address alerts
```

#### 3. axe DevTools
```
1. Install axe DevTools extension
2. Open DevTools, select "axe DevTools" tab
3. Click "Scan ALL of my page"
4. Review critical, serious, and moderate issues
5. Follow remediation guidance
```

### Manual Testing Procedures

#### Keyboard Navigation Test
```
Time: 10-15 minutes per page

Steps:
1. Disconnect mouse or move it aside
2. Start at top of page
3. Press Tab to move forward
4. Press Shift+Tab to move backward
5. Press Enter/Space to activate buttons
6. Press Esc to close modals
7. Use Arrow keys in lists/menus

Check:
✓ Can reach all interactive elements
✓ Tab order is logical
✓ Focus always visible
✓ No keyboard traps
✓ All functionality works
```

#### Screen Reader Test
```
Time: 20-30 minutes per page

Setup (Windows + NVDA):
1. Download NVDA (free)
2. Install and launch
3. Close eyes or look away
4. Navigate with keyboard only

Setup (Mac + VoiceOver):
1. Press Cmd+F5 to enable
2. Close eyes or look away
3. Navigate with keyboard

Commands:
- Next item: ↓ or Tab
- Previous item: ↑ or Shift+Tab
- Headings list: Insert+F7 (NVDA) or Cmd+U (VO)
- Links list: Insert+F7 (NVDA) or Cmd+U (VO)
- Read all: Insert+↓ (NVDA) or Cmd+A (VO)

Check:
✓ All content announced
✓ Images described
✓ Buttons/links clear
✓ Form labels present
✓ Headings logical
✓ Can complete all tasks
```

#### Color Contrast Test
```
Time: 5-10 minutes

Method 1: Browser DevTools
1. Inspect element
2. Click color in Styles panel
3. View contrast ratio
4. Ensure ≥4.5:1 for text, ≥3:1 for UI

Method 2: WebAIM Checker
1. Visit webaim.org/resources/contrastchecker/
2. Enter foreground and background colors
3. Check pass/fail for AA and AAA
4. Adjust colors if needed
```

#### Mobile/Touch Test
```
Time: 10 minutes

Steps:
1. Open on mobile device or use DevTools device mode
2. Attempt to tap all interactive elements
3. Measure target sizes (should be ≥44×44px)
4. Check spacing between targets

Check:
✓ All buttons easy to tap
✓ No accidental activation
✓ Adequate spacing
✓ Works with one hand
```

---

## 🎯 Priority Levels and Remediation

### Critical (Fix Immediately)
- Missing keyboard navigation
- Insufficient color contrast (<3:1)
- Missing alt text on informative images
- Missing form labels
- Keyboard traps
- Focus not visible

**Impact**: Completely blocks some users from accessing content.

### High (Fix Before Release)
- Incorrect heading structure
- Missing ARIA labels
- Unclear error messages
- Small touch targets (<44px)
- Information by color alone

**Impact**: Significantly impairs usability for some users.

### Medium (Fix in Next Update)
- Non-descriptive link text
- Missing landmark roles
- Redundant alt text
- Minor contrast issues (3:1-4.5:1 on non-critical text)

**Impact**: Reduces usability but doesn't block access.

### Low (Nice to Have)
- AAA contrast levels (≥7:1)
- Extra large touch targets (≥48px)
- Enhanced ARIA descriptions
- Multiple input methods

**Impact**: Improves experience beyond baseline requirements.

---

## 📋 Comprehensive Test Report Template

```markdown
# Accessibility Test Report

**Content**: [Game/Lesson Name]
**Date**: [Test Date]
**Tester**: [Your Name]
**WCAG Level**: AA (2.1)

## Executive Summary
- Overall Status: [Pass/Fail/Needs Work]
- Critical Issues: [Number]
- High Priority: [Number]
- Medium Priority: [Number]
- Lighthouse Score: [XX/100]

## Test Results

### 1. Keyboard Navigation
- [ ] All elements reachable: Pass/Fail
- [ ] Tab order logical: Pass/Fail
- [ ] Focus visible: Pass/Fail
- [ ] No traps: Pass/Fail
**Issues Found**:
- [List any issues]

### 2. Color Contrast
- [ ] Text contrast ≥4.5:1: Pass/Fail
- [ ] UI contrast ≥3:1: Pass/Fail
- [ ] No color-only info: Pass/Fail
**Issues Found**:
- [List any issues]

### 3. Screen Reader
- [ ] Images have alt text: Pass/Fail
- [ ] Forms labeled: Pass/Fail
- [ ] Headings logical: Pass/Fail
- [ ] ARIA used correctly: Pass/Fail
**Issues Found**:
- [List any issues]

### 4. Other Requirements
- [ ] Text resizable 200%: Pass/Fail
- [ ] Touch targets ≥44px: Pass/Fail
- [ ] No auto-play: Pass/Fail
- [ ] Motion respectful: Pass/Fail
**Issues Found**:
- [List any issues]

## Detailed Issues

### Critical (P0)
1. [Issue description]
   - Location: [Where]
   - Fix: [Remediation steps]

### High (P1)
1. [Issue description]
   - Location: [Where]
   - Fix: [Remediation steps]

### Medium (P2)
[List medium priority issues]

## Recommendations
1. [Improvement suggestion]
2. [Improvement suggestion]

## Next Steps
- [ ] Fix all critical issues
- [ ] Re-test critical fixes
- [ ] Address high priority items
- [ ] Schedule follow-up review
```

---

## 🎓 Educational Content Specific Considerations

### For K-2 (Ages 5-7)
- **Simpler language**: Use grade-appropriate vocabulary in alt text
- **Larger targets**: Prefer 48×48px minimum for younger users
- **Clear instructions**: Explicit, step-by-step guidance
- **Visual cues**: Icons + text labels (not color alone)
- **Error tolerance**: Forgiving interactions, undo options

### For 3-5 (Ages 8-10)
- **Reading level**: Alt text at appropriate reading level
- **Multi-modal**: Support both mouse and keyboard equally
- **Feedback**: Immediate, constructive feedback on errors
- **Independence**: Students should be able to self-navigate
- **Progress indicators**: Clear visual progress markers

### For All Grades
- **Consistent navigation**: Same patterns across all content
- **Help available**: Easy access to instructions
- **No distractions**: Minimize auto-playing or animated content
- **Student privacy**: No unnecessary data collection
- **Teacher controls**: Accessibility settings for classroom use

---

## 🔄 Continuous Accessibility Workflow

### Phase 1: Design
- [ ] Include accessibility in design requirements
- [ ] Use accessible color palette from start
- [ ] Plan keyboard navigation flow
- [ ] Design focus states
- [ ] Consider screen reader experience

### Phase 2: Development
- [ ] Use semantic HTML elements
- [ ] Add ARIA labels during development
- [ ] Test with keyboard continuously
- [ ] Run automated tests (Lighthouse, axe)
- [ ] Fix issues immediately

### Phase 3: Testing
- [ ] Complete manual keyboard test
- [ ] Complete screen reader test
- [ ] Check color contrast
- [ ] Test on mobile/touch devices
- [ ] User testing with assistive technologies

### Phase 4: Launch
- [ ] Final accessibility audit
- [ ] Document known issues
- [ ] Provide accessibility statement
- [ ] Train support team
- [ ] Monitor feedback

### Phase 5: Maintenance
- [ ] Periodic re-testing (quarterly)
- [ ] Address user-reported issues
- [ ] Update for new WCAG guidelines
- [ ] Review analytics for accessibility barriers
- [ ] Continuous improvement

---

## 📚 Resources and References

### WCAG Guidelines
- **WCAG 2.1 AA**: https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa
- **Understanding WCAG**: https://www.w3.org/WAI/WCAG21/Understanding/
- **WCAG Techniques**: https://www.w3.org/WAI/WCAG21/Techniques/

### Testing Tools
- **WAVE**: https://wave.webaim.org/extension/
- **axe DevTools**: https://www.deque.com/axe/devtools/
- **Lighthouse**: Built into Chrome DevTools
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **NVDA Screen Reader**: https://www.nvaccess.org/download/

### Educational Accessibility
- **Section 508**: https://www.section508.gov/
- **ADA Requirements**: https://www.ada.gov/
- **Accessibility for Students**: https://www.w3.org/WAI/teach-advocate/accessible-presentations/

### Learning Resources
- **WebAIM**: https://webaim.org/
- **A11y Project**: https://www.a11yproject.com/
- **Deque University**: https://dequeuniversity.com/
- **Google Accessibility**: https://www.google.com/accessibility/

---

## 🎓 Quick Reference Card

### Must-Have Checklist
```
KEYBOARD
□ Tab reaches all elements
□ Focus always visible
□ Enter/Space activate buttons
□ Escape closes modals

COLOR
□ Text 4.5:1 contrast
□ UI controls 3:1 contrast
□ No color-only information

SCREEN READERS
□ Alt text on images
□ Labels on form inputs
□ Logical headings (h1→h2→h3)
□ ARIA labels on custom controls

OTHER
□ Text resizes to 200%
□ Touch targets ≥44px
□ No auto-play media
□ Animations pausable
```

### Testing Shortcuts
```
KEYBOARD TEST (5 min)
- Tab through entire page
- Activate all buttons with Enter
- Close modals with Escape

SCREEN READER TEST (10 min)
- NVDA (Windows): Insert+↓ to read all
- VoiceOver (Mac): Cmd+A to read all

CONTRAST TEST (2 min)
- Inspect element → check color contrast ratio
- Must be ≥4.5:1 for text, ≥3:1 for UI

AUTOMATED TEST (2 min)
- DevTools → Lighthouse → Accessibility
- Target: 95+ score
```

---

**Version**: 2.0
**Last Updated**: October 2024
**Maintained By**: Learning Adventures Platform Team
**Next Review**: January 2025
