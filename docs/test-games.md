# Test Games - Pre-Catalog Testing Area

This document tracks games that are registered and testable but **not yet added to the public catalog**. Use this as a testing playground before promoting games to production.

---

## 📋 Current Test Games

### React Component Games

These games are registered in `lib/gameLoader.ts` and accessible via direct URL but not yet in `lib/catalogData.ts`.

| Game Name | URL | Status | Notes |
|-----------|-----|--------|-------|
| **Ecosystem Builder** | [http://localhost:3000/games/ecosystem-builder](http://localhost:3000/games/ecosystem-builder) | ✅ Testing | Science game about food chains and ecosystem balance. Uses useGameState hook, real-time simulation. |

### HTML-Based Games

These games exist in `public/games/` but are not yet cataloged.

| Game Name | URL | Status | Notes |
|-----------|-----|--------|-------|
| **Multiplication Space Quest** | [http://localhost:3000/games/multiplication-space-quest.html](http://localhost:3000/games/multiplication-space-quest.html) | ✅ Testing | Space-themed multiplication game for grades 3-4. Single HTML file, WCAG 2.1 AA compliant. |
| **Solar System Explorer** | [http://localhost:3000/games/solar-system-explorer.html](http://localhost:3000/games/solar-system-explorer.html) | ✅ Testing | Science game about planets and their properties. 8 planets to explore, quiz format, streak system. WCAG 2.1 AA compliant. |

### HTML-Based Lessons

These lessons exist in `public/lessons/` but are not yet cataloged.

| Lesson Name | URL | Status | Notes |
|-------------|-----|--------|-------|
| *(None currently)* | - | - | - |

---

## 🎮 How to Test Games

### For React Component Games:
1. Navigate to the game URL (e.g., `/games/ecosystem-builder`)
2. Play through the entire game
3. Test all features:
   - Score tracking
   - Level progression
   - Achievement system
   - Exit button
   - Pause/Resume (if applicable)
   - Game over state
4. Test on mobile/tablet (responsive design)
5. Use the Quality Assurance agent for comprehensive testing

### For HTML Games/Lessons:
1. Navigate to the HTML file URL (e.g., `/games/multiplication-space-quest.html`)
2. Test all game mechanics
3. Verify accessibility (keyboard navigation, screen reader support)
4. Test on different browsers (Chrome, Firefox, Safari, Edge)
5. Test responsive design (mobile, tablet, desktop)
6. Use the Quality Assurance agent for WCAG validation

---

## ➕ How to Add a New Test Game

### Adding a React Component Game:

1. **Create the game directory:**
   ```
   components/games/[game-name]/
   ├── [GameName].tsx
   └── index.ts
   ```

2. **Register the game in `lib/gameLoader.ts`:**
   ```typescript
   await import('@/components/games/[game-name]');
   ```

3. **Add to this document** in the "React Component Games" table

4. **Test at:** `http://localhost:3000/games/[game-id]`

5. **DO NOT add to `lib/catalogData.ts` yet** - that's for production!

### Adding an HTML Game/Lesson:

1. **Save HTML file:**
   - Games: `public/games/[game-name].html`
   - Lessons: `public/lessons/[lesson-name].html`

2. **Add to this document** in the appropriate table

3. **Test at:** `http://localhost:3000/games/[game-name].html`

4. **DO NOT add to `lib/catalogData.ts` yet**

---

## ✅ Testing Checklist

Before promoting a game to the catalog, ensure it passes all these tests:

### Educational Quality
- [ ] Learning objectives are clear
- [ ] Content is age-appropriate for target grade level
- [ ] Immediate feedback is provided
- [ ] Difficulty progression is logical
- [ ] 70/30 engagement-to-learning ratio

### Technical Quality
- [ ] No console errors or warnings
- [ ] All features work correctly
- [ ] Game loads within 3 seconds
- [ ] Performance is smooth (60 FPS)
- [ ] No memory leaks

### Accessibility (WCAG 2.1 AA)
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Focus indicators are visible (3px minimum)
- [ ] Color contrast meets 4.5:1 (normal text) or 3:1 (large text)
- [ ] Screen reader compatible (ARIA labels present)
- [ ] Text resizable to 200% without horizontal scroll
- [ ] Touch targets are 44×44px minimum
- [ ] Supports prefers-reduced-motion
- [ ] Form errors are clear and announced

### User Experience
- [ ] Instructions are clear
- [ ] Visual feedback on interactions
- [ ] Exit button works correctly
- [ ] Game over/completion state works
- [ ] Mobile responsive (works on phones/tablets)

### For React Component Games Only
- [ ] Uses shared components (GameContainer, GameButton, etc.)
- [ ] Uses platform hooks (useGameState, useGameTimer)
- [ ] Implements GameProps interface (onExit, onComplete)
- [ ] Properly registered in gameLoader.ts

---

## 🚀 How to Promote a Game to Production

Once a game passes all tests, follow these steps to make it publicly available:

### Step 1: Use the Catalog Integration Agent

Ask Claude to act as the Catalog Integration agent:
```
"You are the Catalog Integration agent. Add [game-name] to the catalog."
```

The agent will:
- Read the catalog-metadata-formatter skill
- Create proper metadata following the schema
- Add the entry to `lib/catalogData.ts` in the correct category array
- Validate all required fields

### Step 2: Verify Metadata

Ensure the catalog entry has:

**For React Component Games:**
```typescript
{
  id: 'ecosystem-builder',           // Matches game registration ID
  title: 'Ecosystem Builder',
  description: '...',
  type: 'game',
  category: 'science',
  gradeLevel: ['3', '4', '5', '6'],
  difficulty: 'medium',
  skills: ['Food Chains', 'Ecosystem Balance', ...],
  estimatedTime: '15 mins',
  featured: false,                   // Set to true for homepage
  componentGame: true,               // REQUIRED for React games
  // NO htmlPath property
}
```

**For HTML Games/Lessons:**
```typescript
{
  id: 'multiplication-space-quest',
  title: 'Multiplication Space Quest',
  // ... other fields
  htmlPath: '/games/multiplication-space-quest.html',  // REQUIRED
  // NO componentGame property
}
```

### Step 3: Test in Catalog

1. Navigate to http://localhost:3000/catalog
2. Find the game in the appropriate category
3. Click to launch
4. Verify it opens correctly
5. Test the full gameplay experience

### Step 4: Move from Test to Production

1. **Remove from this document** (test-games.md)
2. **Mark as complete** in your development tracking
3. **Update COMPREHENSIVE_PLATFORM_PLAN.md** if part of a phase
4. **Commit changes** with descriptive message:
   ```bash
   git add .
   git commit -m "Add [game-name] to catalog - [category]"
   ```

---

## 📊 Test Games Statistics

**Total Test Games:** 3
- React Component Games: 1
- HTML Games: 2
- HTML Lessons: 0

**Catalog Statistics:**
- Total Cataloged: 85 adventures
- Math: 25 adventures
- Science: 30 adventures
- English: 10 adventures
- History: 10 adventures
- Interdisciplinary: 10 adventures

---

## 🔗 Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Platform development instructions
- [GAME_DEVELOPMENT.md](../GAME_DEVELOPMENT.md) - Game creation workflow
- [COMPREHENSIVE_PLATFORM_PLAN.md](../COMPREHENSIVE_PLATFORM_PLAN.md) - Development roadmap
- [agents/README.md](./agents/README.md) - AI agent documentation
- [skills/README.md](./skills/README.md) - Claude Code skills documentation
- [workflows/agent-skill-integration.md](./workflows/agent-skill-integration.md) - How agents use skills

---

## 💡 Tips

- **Test Early, Test Often:** Don't wait until a game is "perfect" to start testing
- **Get Feedback:** Share test URLs with teachers, parents, or students
- **Document Issues:** Keep notes on bugs or improvements needed
- **Use QA Agent:** Let the Quality Assurance agent do comprehensive accessibility testing
- **Version Control:** Commit test games frequently so you can revert if needed
- **Mobile First:** Always test on actual mobile devices, not just browser devtools

---

**Last Updated:** October 2025
**Maintained By:** Learning Adventures Platform Team
**Questions?** Check the related documentation above or ask the Interactive Content Builder agent for help.
