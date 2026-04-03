## Summary

<!-- What does this PR do? Which phase/feature does it complete? -->

## Phase
- [ ] Phase 1 — Foundation & Onboarding
- [ ] Phase 2 — Quest System
- [ ] Phase 3 — Campus Zones
- [ ] Phase 4 — Economy & Rewards
- [ ] Phase 5 — Polish & Beta Readiness

---

## QA Checklist

### Automated (must all pass before merge)
- [ ] All unit tests pass (`npm test`)
- [ ] TypeScript type check passes (`npx tsc --noEmit`)
- [ ] Lint passes (`npm run lint`)
- [ ] Next.js build succeeds (`npm run build`)

### Manual Testing
- [ ] Feature works end-to-end in local dev (`npm run dev`)
- [ ] Student login → world → tested feature works correctly
- [ ] Parent login → no access to student world (correct redirect)
- [ ] No console errors in browser
- [ ] Mobile layout is not broken (resize browser to 375px)

### Phase-Specific Checks

#### Phase 1 — Onboarding
- [ ] New student signup triggers character creation
- [ ] Jaylen guide appears on first world load only
- [ ] Jaylen guide does NOT appear on subsequent logins
- [ ] SPARK chat opens, sends a message, receives a response
- [ ] SPARK chat history persists within the session
- [ ] Parent signup shows parent dashboard (not game world)

#### Phase 2 — Quests
- [ ] Quest log opens from HUD
- [ ] Quest markers visible above NPC heads
- [ ] Accepting a quest adds it to active quests
- [ ] Daily login XP awards once per day (not on every page load)
- [ ] Streak counter increments correctly

#### Phase 3 — Campus Zones
- [ ] All 3 new building interiors load (Science, Business, English)
- [ ] Game stations in buildings launch correct HTML game
- [ ] XP is awarded when a game is completed
- [ ] All "Under Construction" doors show correct modal

#### Phase 4 — Economy
- [ ] Shop displays seeded items with correct prices
- [ ] Purchasing an item deducts coins from balance
- [ ] Cosmetic items appear equipped on player sprite
- [ ] XP toast appears when XP is earned
- [ ] Level-up modal appears when leveling up

#### Phase 5 — Polish
- [ ] Full seed runs without errors (`npm run db:seed`)
- [ ] All test accounts work (student/teacher/parent/admin @test.com)
- [ ] Complete student flow tested top-to-bottom

---

## Screenshots / Demo

<!-- Add screenshots or a short Loom/screen recording for visual changes -->

## Notes for Reviewer

<!-- Anything the reviewer should know: known issues, follow-up tickets, dependencies -->
