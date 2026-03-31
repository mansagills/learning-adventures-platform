# File Format Standards

## Overview

All educational content for the Learning Adventures platform must be delivered as **self-contained HTML files** with embedded CSS and JavaScript. This ensures reliable offline functionality, consistent behavior across browsers, and easy deployment.

---

## Core Requirements

### Single File Architecture

```
✅ CORRECT: One HTML file with everything embedded
┌─────────────────────────────────────────┐
│  game.html                              │
│  ├── <style> CSS embedded </style>      │
│  ├── <body> HTML content </body>        │
│  └── <script> JavaScript </script>      │
└─────────────────────────────────────────┘

❌ INCORRECT: Multiple files with dependencies
┌─────────────────────────────────────────┐
│  game.html                              │
│  ├── styles.css (external)              │
│  ├── game.js (external)                 │
│  └── images/ (external folder)          │
└─────────────────────────────────────────┘
```

### No External Dependencies

**Prohibited:**
- CDN links (Bootstrap, jQuery, Tailwind, etc.)
- External JavaScript libraries
- External CSS frameworks
- Google Fonts or other external fonts
- External images or assets
- External API calls during gameplay

**Why:** Content must work offline in schools with limited/no internet.

---

## HTML Structure Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Content Title] - Learning Adventures</title>

    <!-- Platform metadata for catalog integration -->
    <meta name="description" content="[Brief description]">
    <meta name="content-type" content="[game|lesson]">
    <meta name="subject" content="[math|science|english|history|interdisciplinary]">
    <meta name="grade-level" content="[comma-separated grades: 3,4,5]">
    <meta name="difficulty" content="[easy|medium|hard]">
    <meta name="skills" content="[Skill 1, Skill 2, Skill 3]">
    <meta name="estimated-time" content="[X-Y mins]">

    <style>
        /* ========================================
           ALL CSS EMBEDDED HERE
           ======================================== */

        /* Reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Base styles */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 16px;
            line-height: 1.5;
        }

        /* Layout styles */
        /* Component styles */
        /* Animation styles */
        /* Responsive styles */

        @media (max-width: 768px) {
            /* Tablet styles */
        }

        @media (max-width: 480px) {
            /* Mobile styles */
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation: none !important;
                transition: none !important;
            }
        }
    </style>
</head>
<body>
    <!-- ========================================
         ALL HTML CONTENT HERE
         ======================================== -->

    <main id="game-container" role="main">
        <!-- Game/Lesson content -->
    </main>

    <script>
        /* ========================================
           ALL JAVASCRIPT EMBEDDED HERE
           ======================================== */

        // Configuration
        const CONFIG = {
            // Game settings
        };

        // State
        let gameState = {
            // Current state
        };

        // Utility functions
        // Game logic functions
        // UI update functions
        // Event handlers

        // Initialize on load
        document.addEventListener('DOMContentLoaded', init);

        function init() {
            // Setup game
        }
    </script>
</body>
</html>
```

---

## File Size Limits

| Metric | Target | Maximum |
|--------|--------|---------|
| File size | Under 500KB | 2MB absolute max |
| Load time | Under 2 seconds | 3 seconds max |
| DOM elements | Under 500 | 1000 max |

### Size Optimization Tips

1. **CSS**: Use classes instead of inline styles; remove unused rules
2. **JavaScript**: Minify if needed; avoid large libraries
3. **Images**: Use inline SVG; keep SVGs simple; use CSS shapes when possible
4. **Fonts**: Use system fonts only (see typography section)

---

## Typography

### System Font Stack

Use system fonts to avoid external dependencies:

```css
/* Primary font stack */
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

/* Child-friendly alternative */
font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive, sans-serif;

/* Monospace for code/numbers */
font-family: 'Courier New', Courier, monospace;
```

### Font Sizes

| Element | Minimum | Recommended |
|---------|---------|-------------|
| Body text | 16px | 18px |
| Buttons | 16px | 18-20px |
| Headings | 24px | 28-36px |
| Small text | 14px | 16px |

**Important:** Never use font sizes below 14px for any text.

---

## Images and Graphics

### Inline SVG (Preferred)

```html
<!-- ✅ Inline SVG - works offline, scalable -->
<svg width="50" height="50" viewBox="0 0 50 50" role="img" aria-label="Star icon">
    <polygon points="25,5 30,20 45,20 33,30 38,45 25,35 12,45 17,30 5,20 20,20"
             fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
</svg>
```

### Data URI (For Simple Images)

```html
<!-- ✅ Data URI - embedded, works offline -->
<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'...%3C/svg%3E"
     alt="Description">
```

### CSS Shapes (When Possible)

```css
/* ✅ Pure CSS shapes - no images needed */
.circle {
    width: 50px;
    height: 50px;
    background: #4CAF50;
    border-radius: 50%;
}

.triangle {
    width: 0;
    height: 0;
    border-left: 25px solid transparent;
    border-right: 25px solid transparent;
    border-bottom: 50px solid #FF5722;
}
```

### What NOT to Use

```html
<!-- ❌ External image URL -->
<img src="https://example.com/image.png">

<!-- ❌ Local file reference (won't work in deployment) -->
<img src="./images/star.png">

<!-- ❌ External icon library -->
<i class="fa fa-star"></i>
```

---

## Audio (Optional)

If audio is needed, use embedded base64:

```javascript
// ✅ Embedded audio (keep short - under 50KB per sound)
const sounds = {
    correct: new Audio('data:audio/wav;base64,UklGRl...'),
    wrong: new Audio('data:audio/wav;base64,UklGRl...')
};

// Play with user interaction (required by browsers)
function playSound(name) {
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play().catch(() => {}); // Ignore autoplay errors
    }
}
```

**Note:** Audio is optional. Many school environments have sound disabled. Never require audio for gameplay.

---

## Browser Compatibility

### Supported Browsers

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |
| iOS Safari | 14+ |
| Chrome Android | 90+ |

### JavaScript Compatibility

Use ES6+ features supported by all target browsers:
- `const` / `let`
- Arrow functions
- Template literals
- Array methods (`map`, `filter`, `reduce`, `find`)
- `async` / `await`
- Classes
- Spread operator
- Destructuring

**Avoid or polyfill:**
- Optional chaining (`?.`) - limited Safari support
- Nullish coalescing (`??`) - limited Safari support
- Top-level await

### CSS Compatibility

Safe to use:
- Flexbox
- CSS Grid
- CSS Variables (custom properties)
- `calc()`
- Transforms and transitions
- `@media` queries
- `@keyframes` animations

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */

/* Base styles (mobile: 320px+) */
.container {
    padding: 10px;
    font-size: 16px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
    .container {
        padding: 20px;
        font-size: 18px;
    }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
    .container {
        padding: 30px;
        max-width: 1200px;
        margin: 0 auto;
    }
}
```

### Touch Support

```css
/* Touch-friendly targets */
button, .clickable {
    min-width: 44px;
    min-height: 44px;
    padding: 12px 20px;
}

/* Disable hover effects on touch devices */
@media (hover: none) {
    button:hover {
        /* Remove hover state */
        background: inherit;
    }
}
```

---

## Performance Guidelines

### JavaScript Performance

```javascript
// ✅ Use requestAnimationFrame for animations
function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

// ✅ Debounce resize handlers
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
});

// ✅ Use event delegation
document.getElementById('game-board').addEventListener('click', (e) => {
    if (e.target.matches('.card')) {
        handleCardClick(e.target);
    }
});
```

### CSS Performance

```css
/* ✅ Use transform for animations (GPU accelerated) */
.animated {
    transform: translateX(100px);
    transition: transform 0.3s ease;
}

/* ❌ Avoid animating these properties */
.slow {
    /* These cause layout recalculation */
    width: 100px;
    height: 100px;
    top: 50px;
    left: 50px;
}
```

---

## File Naming Convention

```
[content-id].html

Examples:
- math-race-rally.html
- fraction-pizza-party.html
- planet-explorer-quest.html
- grammar-detective-lesson.html
```

**Rules:**
- Lowercase only
- Hyphens for word separation (no underscores, spaces)
- Descriptive but concise
- Match the `id` field in catalog metadata

---

## Validation Checklist

Before submission, verify:

- [ ] Single HTML file with embedded CSS/JS
- [ ] No external CDN or library references
- [ ] No external font references
- [ ] No external image references
- [ ] File size under 2MB
- [ ] Loads in under 3 seconds
- [ ] Works offline (disconnect internet and test)
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on mobile devices
- [ ] No console errors
- [ ] All meta tags present

---

*Last Updated: January 2026*
