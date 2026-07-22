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

#### 🎯 Math Games (13 NEW from math-game-ideas.txt)
| Game Name | URL | Status | Notes |
|-----------|-----|--------|-------|
| **Number Monster Feeding** | [http://localhost:3000/games/number-monster-feeding.html](http://localhost:3000/games/number-monster-feeding.html) | ✅ Ready | Feed monsters correct numbers! Counting, addition, subtraction with cute animations. Grades K-3. |
| **Treasure Hunt Calculator** | [http://localhost:3000/games/treasure-hunt-calculator.html](http://localhost:3000/games/treasure-hunt-calculator.html) | ✅ Ready | Solve math problems to find buried treasure. Map-based adventure. Grades 2-5. |
| **Pizza Fraction Frenzy** | [http://localhost:3000/games/pizza-fraction-frenzy.html](http://localhost:3000/games/pizza-fraction-frenzy.html) | ✅ Ready | Fast-paced fraction ordering game. Serve customers correct pizza slices. Grades 3-5. Time pressure! |
| **Multiplication Bingo Bonanza** | [http://localhost:3000/games/multiplication-bingo-bonanza.html](http://localhost:3000/games/multiplication-bingo-bonanza.html) | ✅ Ready | Interactive bingo with multiplication tables. Get 5 in a row to win! Grades 3-5. |
| **Shape Sorting Arcade** | [http://localhost:3000/games/shape-sorting-arcade.html](http://localhost:3000/games/shape-sorting-arcade.html) | ✅ Ready | Sort shapes by properties (sides, names). Fast-paced geometry. Grades K-4. |
| **Math Jeopardy Junior** | [http://localhost:3000/games/math-jeopardy-junior.html](http://localhost:3000/games/math-jeopardy-junior.html) | ✅ Ready | Game show format with 4 math categories. Answer questions for points. Grades 2-5. |
| **Number Line Ninja** | [http://localhost:3000/games/number-line-ninja.html](http://localhost:3000/games/number-line-ninja.html) | ✅ Ready | Jump ninja along number line to solve problems. Collect coins! Grades 1-4. |
| **Equation Balance Scale** | [http://localhost:3000/games/equation-balance-scale.html](http://localhost:3000/games/equation-balance-scale.html) | ✅ Ready | Visual algebra with balance scale. Find missing numbers. Grades 3-6. |
| **Math Memory Match** | [http://localhost:3000/games/math-memory-match.html](http://localhost:3000/games/math-memory-match.html) | ✅ Ready | Match problems with answers. Memory + math skills. Grades 1-4. |
| **Counting Carnival** | [http://localhost:3000/games/counting-carnival.html](http://localhost:3000/games/counting-carnival.html) | ✅ Ready | Carnival-themed counting games. Ring toss, duck pond, ball throw. Grades K-2. |
| **Geometry Builder Challenge** | [http://localhost:3000/games/geometry-builder-challenge.html](http://localhost:3000/games/geometry-builder-challenge.html) | ✅ Ready | Build structures using geometric shapes. Count shapes needed. Grades 2-5. |
| **Money Market Madness** | [http://localhost:3000/games/money-market-madness.html](http://localhost:3000/games/money-market-madness.html) | ✅ Ready | Buy items and calculate change. Real-world money skills. Grades 2-4. |
| **Time Attack Clock** | [http://localhost:3000/games/time-attack-clock.html](http://localhost:3000/games/time-attack-clock.html) | ✅ Ready | Match analog clocks to digital times. Learn to read time! Grades 1-3. |

#### 🔬 Previously Created Games
| Game Name | URL | Status | Notes |
|-----------|-----|--------|-------|
| **Math Race Rally** | [http://localhost:3000/games/math-race-rally.html](http://localhost:3000/games/math-race-rally.html) | ✅ Testing | Race car moves forward by solving problems. Multiple difficulty levels. |
| **Multiplication Space Quest** | [http://localhost:3000/games/multiplication-space-quest.html](http://localhost:3000/games/multiplication-space-quest.html) | ✅ Testing | Space-themed multiplication game for grades 3-4. Single HTML file, WCAG 2.1 AA compliant. |
| **Solar System Explorer** | [http://localhost:3000/games/solar-system-explorer.html](http://localhost:3000/games/solar-system-explorer.html) | ✅ Testing | Science game about planets and their properties. 8 planets to explore, quiz format, streak system. WCAG 2.1 AA compliant. |
| **Math Adventure Island** | [http://localhost:3000/games/math-adventure-island.html](http://localhost:3000/games/math-adventure-island.html) | ✅ Testing | Pirate-themed addition/subtraction game. 3 difficulty levels, treasure hunt format, streak bonuses. WCAG 2.1 AA compliant. |
| **Ocean Conservation Heroes** | [http://localhost:3000/games/ocean-conservation-heroes.html](http://localhost:3000/games/ocean-conservation-heroes.html) | ✅ Testing | Science/environmental game about ocean conservation. |

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

**Total Test Games:** 19
- React Component Games: 1
- HTML Games: 18 (13 NEW math games + 5 previously created)
- HTML Lessons: 0

**New Math Games Created** (from math-game-ideas.txt):
- 13 complete, WCAG 2.1 AA compliant HTML games
- Covering all difficulty levels (K-6)
- Topics: counting, fractions, multiplication, geometry, money, time, algebra basics

**Catalog Statistics:**
- Total Cataloged: 85 adventures (not including new games)
- Math: 25 adventures (+ 13 ready to add)
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

**Last Updated:** November 2025
**Maintained By:** Learning Adventures Platform Team
**Latest Addition:** 13 new math games from math-game-ideas.txt (Nov 16, 2025)
**Questions?** Check the related documentation above or ask the Interactive Content Builder agent for help.
