# Visual Design Guidelines

## Overview

Learning Adventures content should be visually engaging, child-friendly, and accessible. These guidelines ensure consistent, high-quality visual design across all games and lessons.

**Design Philosophy:**
- Fun and engaging for children ages 5-12
- Clear and intuitive interfaces
- Consistent visual language across the platform
- Accessible to all users
- Performant (no heavy graphics)

---

## Color System

### Primary Palette

Use these colors as your foundation:

| Color | Hex | Use Case |
|-------|-----|----------|
| **Primary Blue** | `#3b82f6` | Primary actions, links, highlights |
| **Primary Purple** | `#8b5cf6` | Alternative primary, magic/creative themes |
| **Success Green** | `#22c55e` | Correct answers, success states |
| **Error Red** | `#ef4444` | Incorrect (gentle), warnings |
| **Warning Orange** | `#f59e0b` | Caution, time warnings |
| **Info Blue** | `#0ea5e9` | Information, hints |

### Subject-Specific Palettes

**Math:**
```css
--math-primary: #8b5cf6;    /* Purple */
--math-secondary: #a78bfa;
--math-accent: #f59e0b;     /* Orange */
--math-background: #faf5ff;
```

**Science:**
```css
--science-primary: #10b981; /* Emerald green */
--science-secondary: #34d399;
--science-accent: #3b82f6;  /* Blue */
--science-background: #ecfdf5;
```

**English:**
```css
--english-primary: #f59e0b; /* Amber */
--english-secondary: #fbbf24;
--english-accent: #8b5cf6;  /* Purple */
--english-background: #fffbeb;
```

**History:**
```css
--history-primary: #b45309; /* Warm brown */
--history-secondary: #d97706;
--history-accent: #dc2626;  /* Red */
--history-background: #fef3c7;
```

### Neutral Colors

```css
/* Backgrounds */
--bg-white: #ffffff;
--bg-light: #f8fafc;
--bg-subtle: #f1f5f9;

/* Text */
--text-primary: #1e293b;    /* Main text */
--text-secondary: #475569;  /* Secondary text */
--text-muted: #94a3b8;      /* Disabled, hints */

/* Borders */
--border-light: #e2e8f0;
--border-medium: #cbd5e1;
```

### Color Accessibility

Always verify contrast ratios:

| Combination | Minimum Ratio | Status |
|-------------|---------------|--------|
| `#1e293b` on `#ffffff` | 12.6:1 | ✅ Excellent |
| `#3b82f6` on `#ffffff` | 4.5:1 | ✅ Passes |
| `#22c55e` on `#ffffff` | 2.7:1 | ⚠️ Large text only |
| `#ffffff` on `#22c55e` | 2.7:1 | ⚠️ Large text only |

**Safe text combinations:**
- Dark text (`#1e293b`) on light backgrounds
- White text on dark backgrounds
- White text on `#3b82f6`, `#8b5cf6`, `#0ea5e9`

---

## Typography

### Font Stack

Use system fonts for reliability:

```css
/* Primary font - clean and readable */
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

/* Playful alternative - for younger grades (K-2) */
font-family: 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;

/* Monospace - for code or numbers */
font-family: 'Courier New', Courier, monospace;
```

### Font Sizes

| Element | Mobile | Desktop | Line Height |
|---------|--------|---------|-------------|
| Body text | 16px | 18px | 1.5 |
| H1 (Page title) | 28px | 36px | 1.2 |
| H2 (Section title) | 24px | 28px | 1.3 |
| H3 (Subsection) | 20px | 24px | 1.3 |
| Button text | 16px | 18px | 1.2 |
| Small text | 14px | 14px | 1.4 |

**Minimum font size: 14px** (never smaller)

### Text Styling

```css
/* Headers */
h1, h2, h3 {
  font-weight: 700;
  color: var(--text-primary);
}

/* Body text */
p {
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-primary);
}

/* Key terms / vocabulary */
.key-term {
  font-weight: 600;
  color: var(--primary);
}

/* Instructions */
.instructions {
  font-size: 16px;
  color: var(--text-secondary);
}
```

---

## Layout

### Container Sizes

```css
/* Main content container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Game/lesson area */
.game-area {
  max-width: 900px;
  margin: 0 auto;
}

/* Card components */
.card {
  max-width: 400px;
}
```

### Spacing System

Use consistent spacing based on 4px units:

| Name | Size | Use Case |
|------|------|----------|
| xs | 4px | Tight spacing, icon gaps |
| sm | 8px | Related elements |
| md | 16px | Default spacing |
| lg | 24px | Section gaps |
| xl | 32px | Major sections |
| 2xl | 48px | Page sections |

```css
/* Spacing variables */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

### Grid and Flexbox

```css
/* Centered content */
.centered {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Card grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

/* Button row */
.button-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
```

---

## Components

### Buttons

```css
/* Base button */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.button:active {
  transform: translateY(0);
}

.button:focus {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

/* Primary button */
.button-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

/* Success button */
.button-success {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

/* Secondary button */
.button-secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}
```

### Cards

```css
.card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Interactive card */
.card-interactive {
  cursor: pointer;
}

.card-interactive:focus {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}
```

### Modals

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  text-align: center;
}
```

### Progress Indicators

```css
/* Progress bar */
.progress-bar {
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 6px;
  transition: width 0.3s ease;
}

/* Star rating */
.stars {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 32px;
  color: #cbd5e1;
}

.star.filled {
  color: #fbbf24;
}
```

### Form Elements

```css
/* Text input */
.input {
  width: 100%;
  padding: 12px 16px;
  font-size: 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* Select dropdown */
.select {
  padding: 12px 16px;
  font-size: 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
}
```

---

## Feedback States

### Correct/Success

```css
.feedback-correct {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border: 2px solid #22c55e;
  color: #166534;
}

/* Animation */
@keyframes correct-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.correct-animation {
  animation: correct-pulse 0.3s ease;
}
```

### Incorrect/Try Again

```css
.feedback-incorrect {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 2px solid #ef4444;
  color: #991b1b;
}

/* Animation - gentle shake */
@keyframes gentle-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.incorrect-animation {
  animation: gentle-shake 0.3s ease;
}
```

### Loading

```css
.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Animations

### General Principles

1. **Purpose**: Animations should guide attention and provide feedback
2. **Duration**: 200-500ms for most transitions
3. **Easing**: Use `ease`, `ease-out`, or `ease-in-out`
4. **Respect preferences**: Always include `prefers-reduced-motion`

### Common Animations

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Bounce */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Celebration confetti burst */
@keyframes confetti {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Victory/Celebration

```css
.celebration-screen {
  text-align: center;
}

.trophy {
  font-size: 80px;
  animation: bounce 1s ease infinite;
}

.celebration-text {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeIn 0.5s ease;
}
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */

/* Small phones (320px - 374px) */
/* Base styles apply */

/* Standard phones (375px+) */
@media (min-width: 375px) {
  /* Slightly larger text and spacing */
}

/* Tablets (768px+) */
@media (min-width: 768px) {
  /* Two-column layouts */
  /* Larger touch targets */
}

/* Desktops (1024px+) */
@media (min-width: 1024px) {
  /* Full layouts */
  /* Hover effects */
}
```

### Mobile Considerations

```css
/* Touch-friendly sizing */
button, .clickable {
  min-width: 44px;
  min-height: 44px;
}

/* Prevent zoom on input focus (iOS) */
input, select, textarea {
  font-size: 16px;
}

/* Safe area for notched phones */
.container {
  padding-left: max(20px, env(safe-area-inset-left));
  padding-right: max(20px, env(safe-area-inset-right));
}

/* Stack buttons on mobile */
@media (max-width: 480px) {
  .button-row {
    flex-direction: column;
  }

  .button-row button {
    width: 100%;
  }
}
```

---

## Icons and Graphics

### Inline SVG (Preferred)

```html
<!-- Simple icons as inline SVG -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>
```

### Common Game Icons

Create these using inline SVG or CSS:
- ✓ Checkmark (correct)
- ✗ X mark (incorrect)
- ★ Star (rating, achievement)
- ♦ Diamond (points, gems)
- ❤ Heart (lives)
- ⏱ Timer
- 🎯 Target
- 🏆 Trophy

### CSS-Only Shapes

```css
/* Circle */
.circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #3b82f6;
}

/* Triangle */
.triangle {
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 50px solid #22c55e;
}

/* Star using clip-path */
.star {
  width: 50px;
  height: 50px;
  background: #fbbf24;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}
```

---

## Examples

### Game Header

```html
<header class="game-header">
  <div class="score">Score: <span id="score">0</span></div>
  <h1 class="game-title">Fraction Pizza Party</h1>
  <div class="level">Level: <span id="level">1</span></div>
</header>
```

```css
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 0 0 20px 20px;
}

.game-title {
  font-size: 24px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.score, .level {
  font-size: 18px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
}
```

### Answer Card Grid

```html
<div class="answer-grid">
  <button class="answer-card" data-answer="a">A) 1/4</button>
  <button class="answer-card" data-answer="b">B) 1/2</button>
  <button class="answer-card" data-answer="c">C) 3/4</button>
  <button class="answer-card" data-answer="d">D) 1/3</button>
</div>
```

```css
.answer-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 500px;
  margin: 0 auto;
}

.answer-card {
  padding: 20px;
  font-size: 20px;
  font-weight: 600;
  background: white;
  border: 3px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.answer-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.answer-card:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.answer-card.correct {
  background: #dcfce7;
  border-color: #22c55e;
}

.answer-card.incorrect {
  background: #fee2e2;
  border-color: #ef4444;
}
```

---

## Design Checklist

- [ ] Colors meet contrast requirements
- [ ] Fonts are readable (18px+ body)
- [ ] Touch targets are 44×44px minimum
- [ ] Buttons have hover, focus, and active states
- [ ] Feedback states are visually distinct
- [ ] Animations respect prefers-reduced-motion
- [ ] Layout works at all breakpoints
- [ ] Focus indicators are visible
- [ ] Visual hierarchy is clear
- [ ] Style is consistent throughout

---

*Last Updated: January 2026*
