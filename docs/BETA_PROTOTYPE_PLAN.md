# Beta Prototype Plan — Learning Adventures Campus
**Target Completion: 2–3 months (April–June 2026)**

---

## Overview

The beta prototype delivers a fully playable campus experience for students and parents. Players log in, create a character, meet their AI guides, and explore a multi-zone campus where each building contains real educational content linked to quests and an XP/reward economy.

**What's already built** (not listed in phases below):
- ✅ NextAuth.js authentication (login/signup/roles)
- ✅ Character creation flow (6 avatar options)
- ✅ XP + leveling system with streak tracking
- ✅ Shop modal (UI complete, needs seed data)
- ✅ Job board (UI + API complete, needs seed data)
- ✅ 9-zone open world map (OpenWorldScene, chunk streaming, 27 NPCs)
- ✅ Math building interior (5 stations, Ms. Numbers NPC)
- ✅ Prisma schema for all core models

**What the beta adds**:
- SPARK AI chatbot + Jaylen onboarding guide
- Quest system framing (syllabi-based quests)
- Daily XP for login
- Functioning store with real items + cosmetics
- Science, Business/Entrepreneurship, and Reading/English interior rooms
- "Under Construction" zones properly labeled
- Seed data for all game systems
- Polish: XP notifications, level-up celebrations, quest markers

---

## Phase 1 — Foundation & Onboarding
**Duration: 2 weeks**
**Goal: First-time user flow is complete and polished**

### 1A — Parent/Student Login Polish (3 days)

**What to build:**
- Add **parent-specific onboarding screen** after signup (COPPA compliance acknowledgment, child account setup)
- Student login flow: redirect to character creation if no character exists, else go to world
- Parent login flow: redirect to parent dashboard with child account management
- Role-specific welcome screens ("Welcome, [Name]! Ready to explore?" for students)

**Files to touch:**
- `components/AuthModal.tsx` — add role-specific post-login redirects
- `app/api/auth/signup/route.ts` — trigger onboarding flag on first login
- `components/world/CharacterCreator.tsx` — wire as mandatory first step for students
- New: `components/onboarding/ParentDashboard.tsx`

**Database:**
- Add `hasCompletedOnboarding` boolean to User model (migration)

---

### 1B — Jaylen: Game Onboarding Assistant (4 days)

**What to build:**
- Jaylen is an NPC guide who appears the **first time a student enters the world**
- Jaylen walks the player through: moving around, talking to NPCs, finding the first quest, visiting a building, earning XP
- Implemented as a **guided tour overlay** (step-by-step modal/tooltip sequence) layered over the Phaser canvas
- Steps: Welcome → Controls tutorial → Find the Quest Board → Visit Math Building → First XP earned → Dismissed
- Jaylen appears in a character portrait (speech bubble style) for each step
- After onboarding completes, Jaylen's statue/mailbox remains in the quad for revisiting tips

**Files to touch:**
- New: `components/onboarding/JaylenGuide.tsx` — guided tour overlay component
- `app/world/page.tsx` — show JaylenGuide if `hasCompletedOnboarding === false`
- `game/scenes/OpenWorldScene.ts` — add Jaylen NPC statue at Town Square
- `app/api/character/create/route.ts` — trigger onboarding start after character created

**Content needed:**
- Jaylen character portrait art (can use emoji/placeholder initially)
- 6–8 dialog lines for the tour sequence

---

### 1C — SPARK AI Chatbot (5 days)

**What to build:**
- SPARK is the always-available AI learning assistant accessible from a button in the HUD
- Complete the existing `ChatInterface.tsx` by wiring it to Claude API via `/api/agents/spark/chat`
- SPARK's persona: encouraging, campus-themed ("Great question, Explorer!"), knowledgeable about the subjects
- SPARK can: answer subject questions, explain quest objectives, give hints on games, motivate the student
- Floating button in corner of world page opens/closes SPARK panel (slide-in from right)
- Chat history persists per session using existing `AgentConversation` model

**Files to touch:**
- New: `app/api/agents/spark/chat/route.ts` — streaming Claude API endpoint with SPARK system prompt
- `components/agents/ChatInterface.tsx` — already built, just needs API wired
- New: `components/world/SparkButton.tsx` — floating chat toggle button
- `app/world/page.tsx` — add SparkButton to HUD layer
- `lib/agents/sparkPrompt.ts` — SPARK system prompt definition

**SPARK system prompt pillars:**
- Persona: enthusiastic academic guide, age-appropriate for K–12
- Knowledge: aware of campus zones, subject areas, quest system
- Limits: does not do homework for students, guides with hints
- Tone: warm, encouraging, campus-branded

---

## Phase 2 — Quest System (Syllabi-Based)
**Duration: 2 weeks**
**Goal: Students have clear learning objectives tied to in-world quests**

### 2A — Quest Data Model (2 days)

**What to build:**
- Add `Quest` model to Prisma schema linked to subjects/buildings
- Add `QuestCompletion` model for tracking per-user progress
- Seed 3 quest chains (one per active building: Math, Science, Business)

**Prisma additions:**
```prisma
model Quest {
  id          String   @id @default(cuid())
  questId     String   @unique
  title       String
  description String
  subject     String   // MATH, SCIENCE, BUSINESS, ENGLISH
  buildingId  String   // which building grants this quest
  xpReward    Int
  coinReward  Int
  objectives  Json     // array of objective steps
  prerequisites String[] // questIds that must be complete first
  createdAt   DateTime @default(now())
  completions QuestCompletion[]
}

model QuestCompletion {
  id          String   @id @default(cuid())
  userId      String
  questId     String
  completedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  quest       Quest    @relation(fields: [questId], references: [id])
  @@unique([userId, questId])
}
```

**Seed quests (initial 9):**
- Math: "Fraction Fundamentals" → "Multiplication Mastery" → "Math Champion"
- Science: "Lab Safety Basics" → "Scientific Method Explorer"
- Business: "Entrepreneurship 101" → "Business Plan Basics"

---

### 2B — Quest Log UI (2 days)

**What to build:**
- Quest log panel accessible from HUD (📋 button)
- Shows: Active quests, Completed quests, Available quests per subject
- Each quest shows: title, subject icon, objectives checklist, XP/coin reward
- Quest objectives auto-check when player completes linked game or activity

**Files to touch:**
- New: `components/world/QuestLog.tsx`
- New: `app/api/quests/active/route.ts`
- New: `app/api/quests/complete/route.ts`
- `app/world/page.tsx` — add QuestLog button to HUD

---

### 2C — Quest Markers in World (2 days)

**What to build:**
- Yellow `!` markers above NPC heads when they have an available quest
- Green `✓` markers when a quest is complete and reward can be claimed
- Each subject building teacher NPC issues the quest for their subject
- Quest acceptance: player walks up to NPC → dialog → "Accept Quest?" option

**Files to touch:**
- `game/scenes/OpenWorldScene.ts` — add quest marker rendering to NPC update loop
- `game/entities/NPC.ts` — add `questId` property and marker display
- `components/phaser/EventBus.ts` — add `quest-offer` and `quest-accept` events

---

### 2D — Daily Login XP (1 day)

**What to build:**
- On login, check if `DailyXP` record exists for today
- If not: award 25 XP + streak bonus (already calculated in `lib/courses/xpCalculations.ts`)
- Show a "Daily Bonus!" toast/modal on first world load of the day
- Display current streak in HUD ("🔥 5-day streak!")

**Files to touch:**
- New: `app/api/world/daily-login/route.ts`
- `app/world/page.tsx` — call daily-login on mount, show toast
- New: `components/world/DailyBonusModal.tsx`
- `lib/courses/xpCalculations.ts` — already has streak logic, just needs API endpoint

---

## Phase 3 — Campus Zones
**Duration: 3 weeks**
**Goal: 3 active subject buildings + all "coming soon" zones labeled**

### 3A — Math Building: Final Polish (3 days)

**What to build:**
- The 5 game stations are defined. Link each to an actual game file:
  - Station 1: Pizza Fraction Frenzy → `/games/pizza-fraction-frenzy.html`
  - Station 2: Math Race Rally → `/games/math-race-rally.html` *(team provides)*
  - Station 3: Multiplication Bingo Bonanza → `/games/multiplication-bingo-bonanza.html` *(team provides)*
  - Station 4: Number Monster Feeding → `/games/number-monster-feeding.html` *(team provides)*
  - Station 5: Math Jeopardy Junior → `/games/math-jeopardy-junior.html` *(team provides)*
- For any games not yet provided by team: use existing HTML games from `/public/games/` as placeholders
- Wire postMessage XP award: game completion → 50 XP + quest objective tick
- Add Ms. Numbers as the quest-giver for Math quests (already in scene as NPC)

**Note:** Team will provide final game files. Placeholders will be used until then.

**Files to touch:**
- `game/scenes/MathBuildingScene.ts` — update gameId strings to match HTML file names
- `components/world/AdventureEmbed.tsx` — verify GAME_MAP entries match
- `app/api/world/award/route.ts` — already exists, verify XP award flow

---

### 3B — Science Building: 1 Room (4 days)

**What to build:**
- New `ScienceBuildingScene.ts` with 1 interactive room
- Layout: Lab tables, science equipment decorations, 1 game station (Science Lab Sim)
- NPC: Dr. Chen (science teacher) — issues Science quests, provides hints
- 1 game station: links to an existing science HTML game (e.g., `body-system-heroes.html` or `crystal-cave-chemistry.html`)
- Exit door back to campus

**Room design:**
- 8×8 tile interior
- Lab tables as obstacles
- 1 interactive station (microscope/computer)
- Science poster decorations (text-based with current tile system)

**Files to create:**
- `game/scenes/ScienceBuildingScene.ts`
- Update `game/main.ts` to register new scene
- Update `game/scenes/OpenWorldScene.ts` — wire Science building door to ScienceBuildingScene

---

### 3C — Business/Entrepreneurship Building: 1 Room (4 days)

**What to build:**
- New `BusinessBuildingScene.ts` with 1 interactive room
- Layout: Office desks, whiteboard, 1 game/activity station
- NPC: Ms. Rivera (business teacher) — issues Business quests
- 1 station: links to a business/math crossover game or a new simple "pitch your idea" activity
- Exit door back to campus

**Room design:**
- 8×8 tile interior
- Office desk rows as obstacles
- 1 computer station for activities
- "Open for Business" sign

**Files to create:**
- `game/scenes/BusinessBuildingScene.ts`
- Update `game/main.ts`
- Update `OpenWorldScene.ts` — wire door

---

### 3D — Reading/English Building: 1 Room (4 days)

**What to build:**
- New `EnglishBuildingScene.ts` with 1 interactive room
- Layout: Library shelves, reading nook, 1 activity station
- NPC: Mr. Brooks (reading teacher) — issues Reading quests
- 1 station: links to a reading comprehension HTML game or vocabulary game
- Exit door back to campus

**Room design:**
- 8×8 tile interior
- Bookshelf walls as obstacles
- Reading chairs in corners
- 1 interactive podium/station

**Files to create:**
- `game/scenes/EnglishBuildingScene.ts`
- Update `game/main.ts`
- Update `OpenWorldScene.ts` — wire door

---

### 3E — "Under Construction" Zones (2 days)

**What to build:**
- For all zones not active in beta (English literary, History, Music Electives, Maintenance, PhysEd, Shops), add a visible "Under Construction" interaction
- Player walks up to door → NPC with hard hat appears → "Coming Soon! Check back next semester"
- Display banner/sign on building exterior
- Show a "Coming Soon" modal with a short teaser description of what the zone will contain

**Zones to label:**
- English (literary) — "Writing & Literature — Coming Soon"
- History — "History & Culture — Coming Soon"
- Music Electives — "Music & Arts — Coming Soon"
- Maintenance — "Campus Maintenance — Coming Soon"
- Shops (Market Zone) — "Campus Shops — Coming Soon"
- PhysEd (Nature Park) — "Physical Education — Coming Soon"

**Files to touch:**
- `game/scenes/OpenWorldScene.ts` — replace placeholder "Coming Soon NPC" dialogs with proper under-construction interactions
- New: `components/world/ComingSoonModal.tsx` — modal with zone preview info

---

## Phase 4 — Economy & Rewards
**Duration: 1 week**
**Goal: Store and XP feel rewarding and functional**

### 4A — Seed Store with Real Items (2 days)

**Items to create (seed data):**
- **Consumables**: XP Potion (2x XP for 30 min, 50 coins), Streak Shield (protect streak for 1 day, 100 coins), Study Boost (hint tokens for games, 25 coins)
- **Cosmetics**: 6 hat options (Graduation Cap, Wizard Hat, Baseball Cap, Crown, Beanie, Bow), 4 backpack options
- **Pets**: Campus Cat, Study Owl, Probability Dog (cosmetic only for beta)

**Files to touch:**
- New: `prisma/seeds/shopItems.ts`
- `prisma/seed.ts` — add shop items seeding
- `components/world/ShopModal.tsx` — verify cosmetics tab renders correctly

---

### 4B — Cosmetics Apply to Character (2 days)

**What to build:**
- Purchased hats/accessories update the character's `equipment` JSON field in DB
- The equipped item renders as an overlay on the player sprite in the world
- Simple implementation: tinted rectangle overlay above player sprite (matches placeholder art style)

**Files to touch:**
- `app/api/shop/purchase/route.ts` — update Character.equipment on cosmetic purchase
- `game/entities/Player.ts` — read equipment from character data and render overlay

---

### 4C — XP Notifications & Level-Up (2 days)

**What to build:**
- Toast notification when earning XP: "+50 XP 🎉" (bottom-right, 2s duration)
- Level-up modal: full celebration screen when leveling up ("Level 5! New areas unlocked!")
- Streak UI: display current streak in top-right of HUD with fire emoji
- XP progress bar in HUD (current XP / XP to next level)

**Files to touch:**
- New: `components/world/XPToast.tsx`
- New: `components/world/LevelUpModal.tsx`
- `app/world/page.tsx` — subscribe to EventBus XP events, show toasts
- `components/phaser/EventBus.ts` — add `xp-earned` and `level-up` events

---

## Phase 5 — Polish & Beta Readiness
**Duration: 1 week**
**Goal: Stable, presentable, bug-free experience**

### 5A — HUD Cleanup (2 days)

**Complete HUD elements:**
- Top-left: Player name + level badge + XP bar
- Top-right: Coin balance + streak counter
- Bottom-right: SPARK button (AI chat)
- Bottom-left: Quest log button + minimap (if time allows)
- ESC menu: Settings, logout, return to menu

**Files to touch:**
- `app/world/page.tsx` — HUD layout
- `components/world/WorldHUD.tsx` — create unified HUD component

---

### 5B — Seed All Test Data (1 day)

**Run complete seed:**
- 4 test users (student, parent, teacher, admin)
- 1 character per test student with XP history
- All shop items
- All jobs (10-15 job catalog entries)
- All quests (9 starter quests)
- Sample course enrollments

**Files to touch:**
- `prisma/seed.ts` — consolidate all seeds
- `package.json` — verify `npm run db:seed` runs everything

---

### 5C — Bug Fixes & QA (2 days)

**Test checklist:**
- [ ] Student signup → character creation → world entry → quest accepted → game played → XP earned → store purchase
- [ ] Parent signup → child account visible in parent dashboard
- [ ] SPARK chat opens, responds, persists history in session
- [ ] Jaylen onboarding runs once on first login, not again
- [ ] All 3 active buildings load correctly (Math, Science, Business, English)
- [ ] All "under construction" doors show correct modal
- [ ] Shop purchase deducts coins, adds item to inventory
- [ ] Job board shows available jobs, completing awards XP
- [ ] Daily login bonus triggers once per day
- [ ] Streak increments correctly on consecutive logins

---

## Phase Timeline Summary

| Phase | Work | Duration | Target Date |
|-------|------|----------|-------------|
| **Phase 1** | Foundation & Onboarding (Login, Jaylen, SPARK) | 2 weeks | April 18 |
| **Phase 2** | Quest System (syllabi quests, daily XP, log UI) | 2 weeks | May 2 |
| **Phase 3** | Campus Zones (Math polish, 3 new rooms, under construction) | 3 weeks | May 23 |
| **Phase 4** | Economy & Rewards (store seed, cosmetics, XP UI) | 1 week | May 30 |
| **Phase 5** | Polish & Beta Readiness (HUD, seed data, QA) | 1 week | June 6 |

**Beta Launch Target: June 6, 2026**

---

## Team Dependencies

| Item | Owner | Needed By |
|------|-------|-----------|
| Math game files (5 HTML games) | Game team | May 2 (Phase 3A) |
| Jaylen character portrait art | Design | April 14 (Phase 1B) |
| SPARK persona/voice guidelines | Product | April 11 (Phase 1C) |
| Subject syllabus content for quests | Curriculum | April 25 (Phase 2A) |
| Store item list + descriptions | Product | May 16 (Phase 4A) |

---

## Key Files Reference

| System | Critical Files |
|--------|---------------|
| Auth | `components/AuthModal.tsx`, `app/api/auth/signup/route.ts` |
| Character | `components/world/CharacterCreator.tsx`, `app/api/character/create/route.ts` |
| World | `game/scenes/OpenWorldScene.ts`, `game/scenes/MathBuildingScene.ts` |
| XP | `lib/courses/xpCalculations.ts`, `app/api/world/award/route.ts` |
| Store | `components/world/ShopModal.tsx`, `app/api/shop/` |
| Jobs | `components/world/JobBoard.tsx`, `app/api/jobs/` |
| AI Chat | `components/agents/ChatInterface.tsx`, `app/api/agents/` |
| Schema | `prisma/schema.prisma`, `prisma/seed.ts` |

---

*Created: April 2026 | Target: June 2026 Beta Launch*
