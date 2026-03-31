# Educational Game PRD Template

> **Instructions**: Copy this template, replace all `[BRACKETED]` text with your specific content, then paste into your AI coding tool.

---

## 1. Overview

| Field | Value |
|-------|-------|
| **Game Title** | [YOUR GAME TITLE] |
| **Subject Category** | [math / science / english / history / interdisciplinary] |
| **Target Grade Levels** | [e.g., 3, 4, 5] |
| **Difficulty** | [easy / medium / hard] |
| **Estimated Play Time** | [X-Y mins] |
| **Content Type** | game |

### Brief Description
[Write 1-2 sentences describing the game. What does the player do? What makes it fun?]

---

## 2. Learning Objectives

### Primary Learning Objective
[What is the main thing students will learn or practice? Be specific and measurable.]

Example: "Students will correctly identify equivalent fractions with denominators up to 12."

### Supporting Objectives (2-4)
1. [Supporting objective 1]
2. [Supporting objective 2]
3. [Supporting objective 3]

### Skills Practiced
- [Skill 1]
- [Skill 2]
- [Skill 3]

### Curriculum Alignment (Optional)
[Reference to Common Core, state standards, or learning frameworks if applicable]

---

## 3. Game Design

### The 70/30 Rule

This game MUST follow the 70/30 entertainment-to-learning ratio:

**70% Entertainment** - The game should be genuinely fun:
- [Describe what makes this game enjoyable]
- [What's the core "fun" mechanic?]
- [Why would a student WANT to play this?]

**30% Learning** - Educational content is visible but natural:
- [How is learning embedded in gameplay?]
- [How are skills practiced through play?]
- [How does success in the game = learning success?]

### Core Game Mechanic

[Describe the main gameplay loop. What does the player DO?]

Example: "Players drag fraction pieces onto pizzas to complete customer orders. Each correct match earns tips (points) and unlocks new pizza toppings."

### Player Actions
- [Primary action - e.g., "Click/tap to select"]
- [Secondary action - e.g., "Drag to position"]
- [Additional actions as needed]

### Win/Success Conditions
[How does the player "win" or complete the game?]

### Challenge/Fail Conditions
[What makes it challenging? What happens on mistakes? Note: Avoid punishing failures - redirect gently]

---

## 4. Progression System

### Levels/Stages
| Level | Description | Difficulty | New Elements |
|-------|-------------|------------|--------------|
| 1 | [Description] | [easy/medium/hard] | [What's introduced] |
| 2 | [Description] | [easy/medium/hard] | [What's introduced] |
| 3 | [Description] | [easy/medium/hard] | [What's introduced] |
| [Add more as needed] |

### Scoring System
- [How are points earned?]
- [Any multipliers or bonuses?]
- [Score thresholds for success?]

### Rewards and Achievements
- [What rewards does the player earn?]
- [Any unlockables?]
- [Achievement badges?]

### Adaptive Difficulty (Recommended)
[How does difficulty adjust based on player performance?]

Example:
- If accuracy > 80%: Increase difficulty (harder problems, less time)
- If accuracy < 50%: Decrease difficulty (easier problems, hints available)
- Target sweet spot: 60-80% accuracy

---

## 5. Game States and Screens

### Start Screen
- Game title and engaging visual
- Brief tagline or description
- "Play" button (prominent)
- "How to Play" button
- Difficulty selector (if applicable)

### How to Play / Tutorial
[What instructions does the player need?]
- Step 1: [Instruction]
- Step 2: [Instruction]
- Step 3: [Instruction]

### Main Gameplay Screen
[Describe the layout and elements visible during play]
- [Element 1 - e.g., "Game board in center"]
- [Element 2 - e.g., "Score display top-right"]
- [Element 3 - e.g., "Timer top-left"]
- [Element 4 - e.g., "Current level indicator"]

### Pause Screen (if applicable)
- Resume button
- Restart button
- Exit button
- Current progress shown

### Game Over / Level Complete
- Score summary
- Stars or rating earned
- Educational summary (what was learned)
- "Play Again" button
- "Next Level" button (if applicable)
- "Exit" button

### Victory / Completion Screen
- Celebration animation
- Final score and achievements
- Facts learned summary
- "Play Again" or "Exit" options

---

## 6. Feedback Systems

### Correct Answer Feedback
- [Visual feedback - e.g., "Green glow, checkmark animation"]
- [Sound effect - optional, e.g., "Cheerful ding"]
- [Points awarded]
- [Encouraging message - e.g., "Great job!", "You got it!"]

### Incorrect Answer Feedback
- [Visual feedback - e.g., "Gentle shake, try again prompt"]
- [Sound effect - optional, e.g., "Soft buzz"]
- [Show correct answer or hint]
- [Encouraging message - e.g., "Almost! Try again", "Good try!"]

**Important**: Never punish or shame for wrong answers. Keep it encouraging.

### Progress Feedback
- [How does player see their progress?]
- [Progress bar, level indicator, score display?]

### Streak/Combo Feedback (Optional)
- [Bonus for consecutive correct answers?]
- [Visual celebration for streaks?]

---

## 7. Educational Content

### Content Examples
[Provide 5-10 specific examples of questions/challenges the player will encounter]

**Level 1 Examples:**
1. [Example problem/challenge]
2. [Example problem/challenge]
3. [Example problem/challenge]

**Level 2 Examples:**
1. [Example problem/challenge]
2. [Example problem/challenge]

**Level 3 Examples:**
1. [Example problem/challenge]
2. [Example problem/challenge]

### Educational Facts to Display
[List 5-10 facts that can be shown during gameplay or on completion]
1. [Fact 1]
2. [Fact 2]
3. [Fact 3]
4. [Fact 4]
5. [Fact 5]

### Hint System
[What hints are available for struggling players?]
- Hint 1: [Type of hint - e.g., "Visual clue"]
- Hint 2: [Type of hint - e.g., "Partial answer"]
- Hint 3: [Type of hint - e.g., "Step-by-step guidance"]

---

## 8. Visual Design

### Theme and Style
[Describe the visual theme]
- Setting: [e.g., "Space station", "Underwater", "Kitchen"]
- Art style: [e.g., "Colorful cartoon", "Friendly characters"]
- Mood: [e.g., "Playful and exciting", "Calm and focused"]

### Color Palette
- Primary color: [e.g., "#667eea - Purple-blue"]
- Secondary color: [e.g., "#10b981 - Green"]
- Accent color: [e.g., "#f59e0b - Orange"]
- Background: [e.g., "#f0f4ff - Light blue-gray"]
- Success color: #22c55e (green)
- Error color: #ef4444 (red)

### Key Visual Elements
- [Character/mascot if any]
- [Main game board/area description]
- [Interactive elements description]
- [Background elements]

### Animations
- [Start animation]
- [Success animation - e.g., "Confetti burst"]
- [Incorrect animation - e.g., "Gentle wobble"]
- [Transition animations]
- [Victory celebration]

---

## 9. Technical Requirements

### File Format
- Single HTML file with embedded CSS and JavaScript
- No external dependencies (no CDN, no external fonts, no external images)
- File size under 2MB (target under 500KB)

### Performance
- Load time under 3 seconds
- Smooth animations (60 FPS target)
- No memory leaks during extended play
- Works offline after initial load

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Chrome Android 90+

### Responsive Design
- Desktop (1920px down to 1024px)
- Tablet (768px)
- Mobile (375px down to 320px)
- Touch-friendly controls

---

## 10. Accessibility Requirements (WCAG 2.1 AA)

### Keyboard Navigation
- All interactive elements reachable via Tab
- Enter/Space activates buttons
- Escape closes modals
- Arrow keys for navigation (where appropriate)
- No keyboard traps

### Visual Accessibility
- Color contrast 4.5:1 for text
- Color contrast 3:1 for UI elements
- Focus indicators visible (3px minimum)
- No information conveyed by color alone

### Screen Reader Support
- All images have alt text
- Buttons have descriptive labels
- ARIA labels on custom controls
- Live regions for dynamic updates

### Motion
- Respect prefers-reduced-motion
- No content flashing more than 3 times/second
- Animations can be disabled

### Touch
- Touch targets minimum 44x44 pixels
- Adequate spacing between targets

---

## 11. Catalog Metadata

```typescript
{
  id: '[game-id-lowercase-hyphens]',
  title: '[Game Title]',
  description: '[1-2 sentence engaging description]',
  type: 'game',
  category: '[math|science|english|history|interdisciplinary]',
  gradeLevel: ['[grade1]', '[grade2]', '[grade3]'],
  difficulty: '[easy|medium|hard]',
  skills: ['[Skill 1]', '[Skill 2]', '[Skill 3]'],
  estimatedTime: '[X-Y mins]',
  featured: [true|false],
  htmlPath: '/games/[game-id].html'
}
```

---

## 12. Quality Checklist

Before considering this game complete, verify:

### Technical
- [ ] Single HTML file, no external dependencies
- [ ] Works on Chrome, Firefox, Safari, mobile
- [ ] Loads in under 3 seconds
- [ ] Works offline
- [ ] No console errors

### Accessibility
- [ ] Full keyboard navigation
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader compatible
- [ ] Touch targets 44x44px

### Educational
- [ ] Learning objectives are met
- [ ] 70% entertainment, 30% learning
- [ ] Age-appropriate content
- [ ] Immediate, encouraging feedback
- [ ] Difficulty is accurate

### User Experience
- [ ] Instructions are clear
- [ ] All game states work (start, play, complete)
- [ ] Restart and exit work
- [ ] No placeholder content

---

## 13. AI Tool Prompt

When using this PRD with an AI coding tool, use this prompt structure:

```
I need you to create an educational game for an elementary education platform.
Please follow this PRD exactly:

[PASTE FILLED PRD HERE]

Create a complete, working HTML file with:
- All CSS embedded in a <style> tag
- All JavaScript embedded in a <script> tag
- No external dependencies whatsoever
- Full keyboard accessibility
- Mobile responsive design

The game should be genuinely fun while teaching [PRIMARY LEARNING OBJECTIVE].
```

---

*Template Version: 1.0 | Last Updated: January 2026*
