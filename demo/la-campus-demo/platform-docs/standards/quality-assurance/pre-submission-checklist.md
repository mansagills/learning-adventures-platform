# Pre-Submission Quality Assurance Checklist

## Instructions

Complete **ALL** items in this checklist before submitting content for platform integration. This checklist applies regardless of which AI coding tool was used to create the content.

**Tip:** Print this checklist or copy to a new document and check off items as you verify them.

---

## 1. File Format Validation

### File Structure
- [ ] Single HTML file with all CSS and JavaScript embedded
- [ ] No separate CSS files referenced
- [ ] No separate JavaScript files referenced
- [ ] File extension is `.html`

### No External Dependencies
- [ ] No CDN links (Bootstrap, jQuery, Tailwind, FontAwesome, etc.)
- [ ] No external JavaScript libraries
- [ ] No Google Fonts or external font references
- [ ] No external image URLs
- [ ] No external API calls during gameplay

### File Size and Naming
- [ ] File size is under 2MB (preferably under 500KB)
- [ ] File name is lowercase with hyphens: `my-game-name.html`
- [ ] File name matches the `id` in catalog metadata

### File Location
- [ ] Games saved to: `/public/games/[name].html`
- [ ] Lessons saved to: `/public/lessons/[name].html`

---

## 2. Technical Validation

### Browser Testing
Test in ALL of these browsers:

- [ ] **Chrome** (latest) - Desktop
- [ ] **Firefox** (latest) - Desktop
- [ ] **Safari** (latest) - Desktop/Mac
- [ ] **Edge** (latest) - Desktop
- [ ] **iOS Safari** - iPhone or iPad
- [ ] **Chrome** - Android phone

### Performance
- [ ] Page loads in under 3 seconds
- [ ] No lag or jank during interactions
- [ ] Animations run smoothly (target 60 FPS)
- [ ] No console errors (open DevTools > Console)
- [ ] No console warnings (review any that appear)

### Offline Functionality
- [ ] Disconnect from internet
- [ ] Refresh the page
- [ ] Verify all features still work
- [ ] Reconnect to internet

### Responsive Design
Test at these viewport widths:

- [ ] **Desktop** (1920px) - Full screen
- [ ] **Laptop** (1366px)
- [ ] **Tablet** (768px)
- [ ] **Mobile** (375px) - iPhone size
- [ ] **Small Mobile** (320px) - Minimum supported

---

## 3. Accessibility Validation (WCAG 2.1 AA)

### Keyboard Navigation
- [ ] Press **Tab** through entire interface - all interactive elements reachable
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] **Enter** or **Space** activates buttons
- [ ] **Escape** closes any modals or popups
- [ ] No keyboard traps (can always Tab away from elements)
- [ ] Focus never gets lost or hidden

### Focus Indicators
- [ ] Focus ring is visible on all interactive elements
- [ ] Focus indicator is at least 3px thick
- [ ] Focus color has sufficient contrast with background
- [ ] Focus indicator is visible in all states/screens

### Color Contrast
Use a contrast checker tool (e.g., WebAIM Contrast Checker):

- [ ] Normal text (under 18px): **4.5:1** contrast ratio minimum
- [ ] Large text (18px+ or 14px+ bold): **3:1** contrast ratio minimum
- [ ] UI components (buttons, inputs): **3:1** contrast ratio minimum
- [ ] Focus indicators: **3:1** contrast ratio minimum

### Color Independence
- [ ] No information is conveyed by color alone
- [ ] Correct/incorrect feedback uses icons or text, not just color
- [ ] All states are distinguishable without color

### Touch Targets
- [ ] All clickable elements are at least **44x44 pixels**
- [ ] Adequate spacing between touch targets (no accidental taps)
- [ ] Touch areas match visible button size

### Screen Reader Compatibility
Test with a screen reader (VoiceOver on Mac, NVDA on Windows):

- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Form inputs have associated `<label>` elements
- [ ] Buttons have descriptive text or `aria-label`
- [ ] Dynamic content updates are announced (use `aria-live`)
- [ ] Headings use proper hierarchy (`h1` > `h2` > `h3`)
- [ ] Page has a main landmark (`<main>` or `role="main"`)

### Motion and Animation
- [ ] No content flashes more than 3 times per second
- [ ] Animations can be paused (if long-running)
- [ ] `prefers-reduced-motion` is respected

```css
/* Should be present in CSS */
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}
```

---

## 4. Educational Validation

### Learning Objectives
- [ ] Learning objective(s) are clearly defined
- [ ] Content directly supports the stated objectives
- [ ] Objectives are appropriate for target grade level
- [ ] Student can understand what they're learning

### Age Appropriateness
- [ ] Language is appropriate for target age group
- [ ] Concepts match cognitive development level
- [ ] Reading level matches target grades
- [ ] Visuals are engaging but not distracting
- [ ] No inappropriate content or themes

### Difficulty Level
- [ ] Stated difficulty matches actual challenge level
- [ ] Easy: Achievable by most students with minimal help
- [ ] Medium: Requires focus but achievable independently
- [ ] Hard: Challenging, may require some struggle

### Feedback and Scaffolding
- [ ] All interactions provide immediate feedback
- [ ] Correct answers are clearly celebrated
- [ ] Incorrect answers provide gentle guidance (not punishment)
- [ ] Hints or help available for struggling students
- [ ] Progress is visible and encouraging

### For Games: 70/30 Rule
- [ ] **70% Entertainment**: Game is genuinely fun to play
- [ ] **30% Learning**: Educational content is visible and integrated
- [ ] Learning is embedded in gameplay, not tacked on
- [ ] Students practice skills through play, not quizzes
- [ ] Achievable challenges with meaningful rewards

### For Lessons: Learning Progression
- [ ] Clear introduction with learning objectives
- [ ] Concepts build logically
- [ ] Multiple learning modalities (visual, interactive, text)
- [ ] Practice opportunities provided
- [ ] Assessment or reflection component
- [ ] Clear completion/success state

---

## 5. User Experience Validation

### Instructions
- [ ] Instructions are clear and visible
- [ ] Language is simple and age-appropriate
- [ ] "How to play" or help is easily accessible
- [ ] First-time users can understand what to do

### Game States (for games)
- [ ] **Start screen** displays and works correctly
- [ ] **Instructions/tutorial** is available
- [ ] **Playing state** functions properly
- [ ] **Pause** works (if applicable)
- [ ] **Game over** screen displays correctly
- [ ] **Victory/completion** screen celebrates success
- [ ] **Restart** button works
- [ ] **Exit** or back button works

### Lesson Flow (for lessons)
- [ ] **Welcome screen** with objectives displays
- [ ] **Progress indicator** shows advancement
- [ ] **Navigation** between sections works
- [ ] **Activities** function correctly
- [ ] **Assessment** (if any) works
- [ ] **Completion screen** celebrates finishing

### Error Handling
- [ ] Invalid inputs are handled gracefully
- [ ] Error messages are helpful, not technical
- [ ] App doesn't crash on unexpected actions
- [ ] User can recover from errors

---

## 6. Content Quality

### No Placeholder Content
- [ ] No "Lorem ipsum" or placeholder text
- [ ] No `TODO` comments visible to users
- [ ] All images/icons are final (no placeholders)
- [ ] All features are complete and functional

### Accuracy
- [ ] Educational content is factually correct
- [ ] Math problems have correct answers
- [ ] Science facts are accurate and current
- [ ] Grammar/spelling examples are correct
- [ ] No typos or grammatical errors

### Consistency
- [ ] Visual style is consistent throughout
- [ ] Terminology is consistent
- [ ] Feedback patterns are consistent
- [ ] Difficulty is consistent within level

---

## 7. Metadata Validation

Verify catalog metadata entry is complete and correct:

```typescript
{
  id: '[unique-id]',              // ✓ Lowercase, hyphens, matches filename
  title: '[Title]',              // ✓ Clear, descriptive
  description: '[Description]',   // ✓ 1-2 engaging sentences
  type: 'game' | 'lesson',       // ✓ Correct type
  category: '[category]',        // ✓ math|science|english|history|interdisciplinary
  gradeLevel: ['3', '4', '5'],   // ✓ Array of strings, not numbers
  difficulty: '[difficulty]',    // ✓ easy|medium|hard
  skills: ['Skill 1', '...'],    // ✓ 3-6 skills, Title Case
  estimatedTime: 'X-Y mins',     // ✓ Correct format
  htmlPath: '/games/[id].html'   // ✓ Matches actual file location
}
```

### Metadata Checklist
- [ ] `id` is unique (not used by any other content)
- [ ] `id` matches the filename exactly
- [ ] `title` is clear and engaging
- [ ] `description` is 1-2 complete sentences
- [ ] `type` is correct: `'game'` or `'lesson'`
- [ ] `category` is valid: `math`, `science`, `english`, `history`, or `interdisciplinary`
- [ ] `gradeLevel` is array of strings: `['3', '4', '5']` not `[3, 4, 5]`
- [ ] `difficulty` is valid: `'easy'`, `'medium'`, or `'hard'`
- [ ] `skills` has 3-6 relevant skills in Title Case
- [ ] `estimatedTime` uses format: `'X mins'` or `'X-Y mins'`
- [ ] `htmlPath` is correct path to file

---

## 8. Final Verification

### Local Testing
- [ ] Access content at `http://localhost:3000/games/[name].html` or `/lessons/[name].html`
- [ ] Play through entire content from start to finish
- [ ] Test all features and paths
- [ ] Verify completion state is reachable

### Documentation
- [ ] Added to `docs/test-games.md` for testing reference
- [ ] Metadata entry prepared for `lib/catalogData.ts`

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Content Creator | | | ☐ Approved |
| Technical Reviewer | | | ☐ Approved |
| Educational Reviewer | | | ☐ Approved |

---

## Notes and Issues

Record any issues found during review or special considerations:

```
[Space for notes]
```

---

## Quick Reference: Common Rejection Reasons

1. **External dependencies** - CDN links, external fonts
2. **Missing keyboard navigation** - Can't Tab through interface
3. **Poor color contrast** - Text hard to read
4. **Not mobile responsive** - Broken on phones/tablets
5. **Missing accessibility features** - No alt text, ARIA labels
6. **Incomplete features** - Placeholder content, broken buttons
7. **Incorrect metadata** - Wrong format, missing fields
8. **Educational issues** - Incorrect facts, inappropriate difficulty

---

*Last Updated: January 2026*
