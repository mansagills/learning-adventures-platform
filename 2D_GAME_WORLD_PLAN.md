# 2D Game World Transformation - Complete Implementation Plan

## Executive Summary

Transform the Learning Adventures platform into a **top-down 2D pixel art** educational game world (Necesse/Stardew Valley style). This proof of concept focuses on building ONE subject area (Math building) using Phaser.js integrated with the existing Next.js platform.

**Timeline:** 6-8 weeks
**Scope:** Math building with 3-5 embedded adventures + 2 native Phaser mini-games
**Tech Stack:** Phaser 3 + Next.js 14 + PostgreSQL + Prisma (existing)
**Visual Style:** Top-down retro pixel art sandbox (bird's-eye view, not side-scrolling)

---

## Project Vision

Students will:
- Login and create a customizable character
- Explore a **top-down 2D school campus** with subject-specific buildings (Necesse/Stardew Valley style)
- Walk around in **retro pixel art style** and interact with NPCs, doors, and objects
- Enter Math building to access educational games
- Earn XP from completing adventures
- Have daily jobs to earn currency
- Purchase character upgrades, cosmetics, and food items
- Play embedded HTML/React games AND native 2D mini-games

**Art Style:** Top-down pixel art sandbox (similar to Necesse, Stardew Valley, classic Zelda)
- Bird's-eye view of campus (not side-scrolling like Terraria)
- 16x16 or 32x32 tile-based world
- Character sprites with 4-direction movement (up, down, left, right)
- Retro aesthetic with modern polish

---

## Architecture Overview

### Phaser.js + Next.js Integration

**Component Structure:**
```
app/world/                          # NEW: 2D game world routes
components/phaser/                  # NEW: React-Phaser bridge
components/world/                   # NEW: World UI overlays (HUD, shop, jobs)
game/                               # NEW: Phaser game code
├── scenes/                         # Game scenes (WorldScene, MathBuildingScene)
├── entities/                       # Game objects (Player, NPC, InteractableObject)
├── systems/                        # Game systems (Inventory, Quest, Collision)
└── assets/                         # Sprites, tilemaps, audio
```

**Communication Layer:**
- **EventBus**: Singleton event emitter for React ↔ Phaser communication
- **postMessage**: For embedded HTML games → React communication
- **Direct API calls**: For saving progress, purchasing items, completing jobs

---

## Proof of Concept Scope

### 1. Main World Map (Top-Down View)
- **Top-down school campus** with tile-based layout (think Stardew Valley/Necesse)
- Math building prominently placed (unlocked)
- Other buildings visible but locked (future expansion teaser)
- NPCs: Welcome guide, shop keeper, job board manager
- Player spawn point in center courtyard
- Decorative elements: trees, paths, benches, grass tiles, water features
- Campus paths guide students between buildings
- **Tile-based grid:** 16x16 or 32x32 pixel tiles for ground, walls, decorations

### 2. Math Building Interior (Top-Down View)
**Layout:** Single floor with multiple rooms (easier than multi-floor in top-down)
- **Main Hall:** 2 game stations (arcade cabinets or computers)
- **Left Wing:** 2 more game stations
- **Right Wing:** 1 game station + Math Teacher NPC
- **Exit doors:** Return to campus

**Visual Style:**
- Top-down classroom/building interior
- Desks, computers, arcade cabinets viewed from above
- Walls create room boundaries
- Interactive objects glow or show prompt when player is nearby

**Embedded Adventures (from existing catalog):**
1. Fraction Pizza Party (HTML)
2. Math Race Rally (HTML)
3. Multiplication Bingo Bonanza (HTML)
4. Number Monster Feeding (HTML)
5. Pizza Fraction Frenzy (HTML)

### 3. Native Phaser Mini-Games (Top-Down Style)
**Game 1: Math Garden Maze** (Top-Down Puzzle)
- Navigate a garden maze from above
- Solve math problems at intersection gates to unlock paths
- Collect coins and XP at the center
- Difficulty scales with player level
- 5-minute gameplay loop
- **Fits top-down aesthetic perfectly**

**Game 2: Cafeteria Cashier** (Job Mini-Game - Top-Down)
- Top-down view of cafeteria counter
- Customers approach from above/sides
- Click customers to take orders
- Calculate change using on-screen calculator
- Timed challenge (30 seconds per customer)
- Earn currency for correct answers
- Teaches money math
- **Works great in top-down view**

---

## Character System

### Character Creation Flow
1. **Name Input:** Character display name
2. **Avatar Selection:** 8-12 pre-made sprites (humans, fantasy, animals)
3. **Grade Level:** Auto-filled from User.gradeLevel
4. **Enter World:** Spawn in campus center

### Character Customization
**Equipment Slots:**
- Hat (wizard hat, baseball cap, crown, headphones)
- Shirt (math t-shirt, science lab coat, superhero cape)
- Accessory (glasses, wings)
- Pet (follows player around)

**Visual System (Top-Down Pixel Art):**
- **16x16 or 32x32 pixel sprites** with 4-direction animations (up, down, left, right)
- **Top-down perspective:** Character viewed from above, similar to Necesse/Stardew Valley
- Layered rendering: base avatar → shirt → hat → accessory
- Pet as separate sprite entity following player
- **Animation states:**
  - `walk-up`, `walk-down`, `walk-left`, `walk-right` (3-4 frames each)
  - `idle-up`, `idle-down`, `idle-left`, `idle-right` (1-2 frames each)
- **Retro pixel art style** with clear silhouettes for readability

---

## Economy & Progression

### Currency System
**Dual Currency:**
- **XP** (existing): Earn from adventures → Level up → Unlock features
- **Coins** (new): Earn from jobs → Spend in shop → Buy cosmetics/consumables

**XP Sources:**
- Complete adventures: 50-100 XP
- Daily streaks: 25 XP
- Achievements: 100+ XP

**Coin Sources:**
- Daily jobs: 10-50 coins per job
- Adventure completion bonus: 5 coins per adventure
- Level up rewards: 100 coins per level

### Shop System
**Item Categories:**
- **Consumables:** XP potions, energy drinks, food (temporary boosts)
- **Cosmetics:** Hats, shirts, accessories (permanent, visual only)
- **Pets:** Companions that follow player (permanent)

**Shop Items (seeded):**
- XP Potion (20 coins) - +50 XP
- Pizza Slice (10 coins) - +5 XP
- Wizard Hat (100 coins) - Cosmetic
- Pet Robot (200 coins, requires Level 10) - Cosmetic

### Job System
**Daily Jobs:**
1. **Cafeteria Cashier** - Calculate change mini-game (30 coins, 25 XP, 24h cooldown)
2. **Math Tutor** - Answer 10 math problems (20 coins, 20 XP, 12h cooldown)
3. **Library Organizer** - Sort numbers in order (15 coins, 15 XP, 8h cooldown)

**Daily Limits:**
- Max 5 jobs per day
- Max 150 coins from jobs per day
- Max 50 coins from adventures per day
- Prevents grinding, encourages balanced gameplay

---

## Database Schema Changes

### New Models

**Character** - Player avatar and world state
```prisma
model Character {
  id          String   @id @default(cuid())
  userId      String   @unique
  avatarId    String   # 'robot-blue', 'human-1', etc.
  name        String   # Character display name
  position    Json     # { x, y, scene }
  equipment   Json?    # { hat, shirt, accessory, pet }
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  inventory   Inventory?
}
```

**Inventory** - Item storage
```prisma
model Inventory {
  id          String   @id @default(cuid())
  characterId String   @unique
  items       Json     # Array of InventoryItem
  capacity    Int      @default(20)

  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
}
```

**ShopItem** - Shop catalog
```prisma
model ShopItem {
  id              String   @id @default(cuid())
  itemId          String   @unique
  name            String
  description     String   @db.Text
  type            ItemType # CONSUMABLE, EQUIPMENT, COSMETIC, PET
  price           Int
  levelRequirement Int     @default(1)
  iconPath        String
  effects         Json?    # { xpBoost: 50 }
  isAvailable     Boolean  @default(true)
}
```

**Job** - Job definitions
```prisma
model Job {
  id            String   @id @default(cuid())
  jobId         String   @unique
  title         String
  description   String   @db.Text
  type          JobType  # MINI_GAME, QUIZ, CHALLENGE
  currencyReward Int
  xpReward      Int
  cooldownHours Int
  isActive      Boolean  @default(true)
  minLevel      Int      @default(1)

  completions   JobCompletion[]
}
```

**JobCompletion** - Job tracking
```prisma
model JobCompletion {
  id             String   @id @default(cuid())
  userId         String
  jobId          String
  completedAt    DateTime @default(now())
  currencyEarned Int
  xpEarned       Int

  user           User @relation(fields: [userId], references: [id], onDelete: Cascade)
  job            Job  @relation(fields: [jobId], references: [id], onDelete: Cascade)
}
```

### Extended Models

**UserLevel** - Add currency field
```prisma
model UserLevel {
  # ... existing fields ...
  currency Int @default(0) # NEW: Coins for shop
}
```

**DailyXP** - Add tracking fields
```prisma
model DailyXP {
  # ... existing fields ...
  currencyEarned Int @default(0) # NEW: Coins earned today
  jobsCompleted  Int @default(0) # NEW: Jobs done today
}
```

---

## Implementation Phases

### Phase 1: Phaser.js Setup + Basic World (Week 1)
**Duration:** 5-7 days

**Tasks:**
1. Install Phaser 3 and setup folder structure
2. Create PhaserGame.tsx bridge component
3. Create EventBus.ts singleton
4. Build WorldScene with placeholder map
5. Implement Player entity with keyboard controls
6. Add collision detection
7. Test on desktop and mobile

**Deliverable:** Player can walk around empty world map

**Critical Files:**
- `/learning-adventures-app/game/main.ts`
- `/learning-adventures-app/game/scenes/WorldScene.ts`
- `/learning-adventures-app/game/entities/Player.ts`
- `/learning-adventures-app/components/phaser/PhaserGame.tsx`
- `/learning-adventures-app/components/phaser/EventBus.ts`
- `/learning-adventures-app/app/world/page.tsx`

---

### Phase 2: Character System + Movement (Week 2)
**Duration:** 5-7 days

**Tasks:**
1. Create Character, Inventory models (Prisma migration)
2. Build CharacterCreator.tsx component
3. Design 8-12 character sprite sheets
4. Implement character animation system
5. Create /api/character/* routes
6. Save player position to backend (debounced)
7. Load character on world entry
8. Add touch controls for mobile

**Deliverable:** Players create characters, move around, state persists

**Critical Files:**
- `/learning-adventures-app/prisma/schema.prisma`
- `/learning-adventures-app/app/api/character/create/route.ts`
- `/learning-adventures-app/app/api/character/update/route.ts`
- `/learning-adventures-app/components/world/CharacterCreator.tsx`
- `/learning-adventures-app/game/assets/sprites/avatars/*`

---

### Phase 3: Math Building Interior + Embedded Games (Week 3)
**Duration:** 7-10 days

**Tasks:**
1. Design Math building tilemap
2. Create MathBuildingScene.ts
3. Add door interactions (scene transitions)
4. Build AdventureEmbed.tsx component
5. Modify 5 HTML games to send postMessage on complete
6. Create InteractableObject.ts base class
7. Place 5 game objects in Math building
8. Connect embedded games to progress API
9. Add Math Teacher NPC with dialog
10. Test full cycle: enter → play → earn XP → exit

**Deliverable:** Math building playable with embedded adventures

**Critical Files:**
- `/learning-adventures-app/game/scenes/MathBuildingScene.ts`
- `/learning-adventures-app/game/entities/InteractableObject.ts`
- `/learning-adventures-app/game/entities/Door.ts`
- `/learning-adventures-app/game/entities/NPC.ts`
- `/learning-adventures-app/components/world/AdventureEmbed.tsx`
- `/learning-adventures-app/public/games/fraction-pizza-party.html` (modified)
- `/learning-adventures-app/public/games/math-race-rally.html` (modified)

---

### Phase 4: Economy + Shop (Week 4)
**Duration:** 5-7 days

**Tasks:**
1. Add currency field to UserLevel model
2. Create ShopItem model and seed data (20+ items)
3. Create Inventory model
4. Build /api/shop/* routes
5. Build /api/inventory/* routes
6. Create ShopModal.tsx component
7. Implement item rendering in Phaser (equipped cosmetics)
8. Add currency to WorldHUD.tsx
9. Grant currency on adventure completion
10. Test purchase flow: earn → buy → equip

**Deliverable:** Working shop and inventory system

**Critical Files:**
- `/learning-adventures-app/app/api/shop/purchase/route.ts`
- `/learning-adventures-app/components/world/ShopModal.tsx`
- `/learning-adventures-app/components/world/InventoryPanel.tsx`
- `/learning-adventures-app/components/world/WorldHUD.tsx`
- `/learning-adventures-app/prisma/seed-shop-items.ts`

---

### Phase 5: Job System + Native Mini-Games (Week 5-6)
**Duration:** 10-12 days

**Job System (3-4 days):**
1. Create Job, JobCompletion models
2. Seed 3-5 job definitions
3. Build /api/jobs/* routes
4. Create JobBoard.tsx component
5. Extend DailyXP model with currency tracking
6. Implement daily limits and cooldowns
7. Add job board NPC/building to WorldScene

**Mini-Game 1: Math Dash (4-5 days):**
8. Create MathDashScene.ts
9. Implement platformer physics
10. Add math question UI overlay
11. Create platform spawning system
12. Add scoring and XP rewards
13. Test and balance difficulty

**Mini-Game 2: Cafeteria Cashier (3-4 days):**
14. Create CafeteriaCashierScene.ts
15. Design customer sprites and animations
16. Build order generation system
17. Create change calculation UI
18. Add timer and scoring
19. Connect to job system

**Deliverable:** Jobs system with 2 playable native games

**Critical Files:**
- `/learning-adventures-app/app/api/jobs/complete/route.ts`
- `/learning-adventures-app/components/world/JobBoard.tsx`
- `/learning-adventures-app/game/scenes/MathDashScene.ts`
- `/learning-adventures-app/game/scenes/CafeteriaCashierScene.ts`
- `/learning-adventures-app/prisma/seed-jobs.ts`

---

### Phase 6: Polish + Testing (Week 7-8)
**Duration:** 10-12 days

**UI/UX Polish (4-5 days):**
1. Add sound effects (footsteps, door open, coin collect)
2. Add background music (muted by default)
3. Improve transition animations
4. Add particle effects (XP gain sparkles)
5. Create tutorial NPC for first-time users
6. Add pause menu with settings
7. Improve mobile touch controls

**Performance Optimization (3-4 days):**
8. Optimize sprite sheet sizes
9. Implement asset lazy loading
10. Add loading screens with progress bars
11. Test on low-end devices
12. Optimize React-Phaser communication
13. Add error boundaries and fallbacks

**Testing & Bug Fixes (3-4 days):**
14. Cross-browser testing
15. Mobile testing (iOS Safari, Android Chrome)
16. Test with existing user accounts
17. Test progress persistence
18. Test daily limits and edge cases
19. Fix critical bugs
20. Security review

**Deliverable:** Production-ready proof of concept

---

## Risk Mitigation

### Avoiding Breaking Changes
**Strategy:** Parallel development
- Keep existing `/catalog` and `/dashboard` routes untouched
- Add new `/world` route as separate experience
- Users can switch between catalog view and world view
- Feature flag for gradual rollout

### Fallback Mechanisms
1. **Phaser fails to load** → Redirect to catalog with message
2. **Character data missing** → Redirect to character creation
3. **WebGL not supported** → Auto-fallback to Canvas renderer

### Performance Considerations
**Bundle Size:**
- Phaser adds ~3 MB to bundle
- Use dynamic imports to avoid SSR issues
- Show loading screen with progress bar

**Mobile Performance:**
- Lower resolution on mobile (720p)
- Reduce particle effects on low-end devices
- Cap framerate at 30fps on older devices
- Test on iPhone 8, Pixel 3 (minimum targets)

**Memory Target:**
- Desktop: <500 MB RAM
- Mobile: <250 MB RAM

### Browser Compatibility
**Tested Browsers:**
- Chrome 120+ ✅
- Safari 17+ ✅
- Firefox 120+ ✅
- Edge 120+ ✅

**Fallbacks:**
- Safari iOS <14: Canvas fallback
- Audio fallbacks: MP3 + OGG

---

## Content Integration Strategy

### Embedding Existing Games
**Pattern:** iframe + postMessage
```typescript
// AdventureEmbed.tsx - Modal wrapper
<iframe
  src={`/games/${adventureId}.html`}
  sandbox="allow-scripts allow-same-origin"
  onMessage={handleGameComplete}
/>
```

**Modification Required:**
Add to existing HTML games:
```javascript
function completeGame(score) {
  // Notify parent window
  window.parent.postMessage({
    type: 'game-complete',
    score: score,
    adventureId: 'fraction-pizza-party',
  }, '*');
}
```

### Native Phaser Games
**Direct integration** - Full access to:
- Player stats (level, XP, inventory)
- Physics engine
- Scene management
- No iframe overhead

---

## Verification & Testing

### End-to-End Test Scenarios

**Scenario 1: New User Journey**
1. User signs up → Auto-redirected to character creation
2. Creates character → Enters world at spawn point
3. Walks to Math building → Enters through door
4. Plays Fraction Pizza Party → Earns 50 XP + 5 coins
5. Exits building → Opens shop
6. Purchases Pizza Slice (10 coins) → Uses item (+5 XP)
7. Checks inventory → See remaining items
8. Closes app → Reopens → Character position saved

**Scenario 2: Job System Flow**
1. User walks to Job Board NPC
2. Opens job board → Sees 3 available jobs
3. Selects "Cafeteria Cashier" → Launches mini-game
4. Completes job (5/5 customers correct) → Earns 30 coins + 25 XP
5. Returns to job board → Job on cooldown (24h timer shown)
6. Attempts 5 more jobs → Hits daily limit
7. Gets message: "Come back tomorrow!"

**Scenario 3: Progress Persistence**
1. User plays 3 adventures → Earns 150 XP
2. Levels up (1 → 2) → Gets 100 coin reward
3. Equips wizard hat → Character sprite updates
4. Closes browser tab
5. Reopens → Character still wearing hat, currency intact
6. Position restored to last saved location

### Performance Benchmarks
- **Load time:** <3 seconds on 4G
- **FPS:** 60fps on desktop, 30fps minimum on mobile
- **Memory:** <500 MB desktop, <250 MB mobile
- **API response:** <200ms for character/inventory updates

---

## Success Metrics

### Proof of Concept Goals
- [ ] Players can create and customize characters
- [ ] Players can walk around world and enter Math building
- [ ] All 5 embedded Math games playable and track progress
- [ ] 2 native Phaser mini-games functional
- [ ] Shop system allows purchasing and equipping items
- [ ] Job system with daily limits working
- [ ] Progress persists across sessions
- [ ] Works on desktop and mobile browsers
- [ ] No breaking changes to existing platform

### Post-Launch Metrics (if approved for full rollout)
- **Engagement:** 2D world session time vs catalog session time
- **Completion:** % of adventures completed via world vs catalog
- **Retention:** 7-day retention for world users vs catalog-only users
- **Monetization:** (Future) conversion rate for premium cosmetics

---

## Next Steps After Proof of Concept

If proof of concept successful, expand with:

**Phase 7: Science Building** (Week 9-11)
- Build Science building with 33 embedded adventures
- Add 2 science-themed native mini-games (chemistry lab, ecosystem builder)
- Science-specific cosmetics (lab coat, goggles)

**Phase 8: Social Features** (Week 12-14)
- Multiplayer campus (see other players walking around)
- Friend system (visit friends' characters)
- Leaderboards for mini-games
- Study groups (shared progress)

**Phase 9: English & History Buildings** (Week 15-17)
- Build remaining subject buildings
- Complete the full campus

**Phase 10: Advanced Features** (Week 18-20)
- Seasonal events (Halloween math challenges)
- Limited-time shop items
- Character housing/customization
- Achievement showcase rooms

---

## Resources & References

**Phaser.js:**
- [Official Phaser Next.js Template](https://github.com/phaserjs/template-nextjs)
- [Phaser 3 Documentation](https://phaser.io/)

**Architecture:**
- EventBus pattern for React-Phaser communication
- postMessage API for iframe games
- Existing progress API for persistence

**Design Assets Needed:**
- 8-12 character sprite sheets (32x32, 4-direction)
- Campus tilemap (ground, walls, decorations)
- Math building tilemap (interior, furniture)
- Shop items (icons, sprites)
- UI elements (buttons, panels, HUD)
- Audio (footsteps, coins, door sounds, background music)

---

## Critical Files Reference

### Core Infrastructure
- `/learning-adventures-app/game/main.ts` - Phaser config
- `/learning-adventures-app/game/scenes/WorldScene.ts` - Main campus
- `/learning-adventures-app/game/scenes/MathBuildingScene.ts` - Math building
- `/learning-adventures-app/game/entities/Player.ts` - Player controller
- `/learning-adventures-app/components/phaser/PhaserGame.tsx` - React bridge
- `/learning-adventures-app/components/phaser/EventBus.ts` - Communication

### Character System
- `/learning-adventures-app/app/api/character/create/route.ts`
- `/learning-adventures-app/components/world/CharacterCreator.tsx`

### Economy
- `/learning-adventures-app/app/api/shop/purchase/route.ts`
- `/learning-adventures-app/app/api/inventory/equip/route.ts`
- `/learning-adventures-app/components/world/ShopModal.tsx`
- `/learning-adventures-app/components/world/WorldHUD.tsx`

### Jobs & Mini-Games
- `/learning-adventures-app/app/api/jobs/complete/route.ts`
- `/learning-adventures-app/game/scenes/MathDashScene.ts`
- `/learning-adventures-app/game/scenes/CafeteriaCashierScene.ts`

### Database
- `/learning-adventures-app/prisma/schema.prisma`
- `/learning-adventures-app/prisma/seed-shop-items.ts`
- `/learning-adventures-app/prisma/seed-jobs.ts`

---

## Technical Architecture Details

### React-Phaser Communication Flow

```typescript
// EventBus.ts - Singleton event emitter
class EventBus extends Phaser.Events.EventEmitter {
  // React → Phaser events
  enterBuilding(buildingId: string)
  purchaseItem(itemId: string)
  startJob(jobId: string)

  // Phaser → React events
  onXPGained(amount: number)
  onInventoryChanged(inventory: Item[])
  onAdventureCompleted(adventureId: string, score: number)
}
```

### Player Controller Architecture

```typescript
// game/entities/Player.ts
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, avatarId) {
    super(scene, x, y, `avatar-${avatarId}`);
    this.createAnimations();
    this.setupControls();
  }

  update() {
    this.handleMovement(); // Keyboard/touch input
    this.checkInteractions(); // Nearby objects
    this.syncToBackend(); // Save position every 10s
  }
}
```

### Scene Transition Pattern

```typescript
// Door interaction
enterBuilding() {
  // Save player position
  EventBus.emit('save-position', { x: this.x, y: this.y, scene: 'WorldScene' });

  // Fade transition
  this.scene.cameras.main.fadeOut(500);
  this.scene.cameras.main.once('camerafadeoutcomplete', () => {
    this.scene.scene.start('MathBuildingScene');
  });
}
```

---

## Design Guidelines

### Visual Style
- **Art Style:** Pixel art, colorful, child-friendly
- **Color Palette:** Warm cream backgrounds (#FFFDF5), vivid violet (#8B5CF6), teal (#14B8A6)
- **Sprite Size:** 32x32 pixels for characters, 16x16 for items
- **Animation:** 4-direction movement (up, down, left, right)
- **UI:** Clean, readable fonts (Outfit, Plus Jakarta Sans)

### UX Principles
1. **Clear Feedback:** Visual and audio confirmation for all actions
2. **Progressive Disclosure:** Tutorials appear contextually
3. **Error Prevention:** Confirmations before irreversible actions
4. **Accessibility:** Keyboard and touch controls, screen reader support
5. **Performance:** Smooth 60fps gameplay, fast load times

### Educational Design
1. **Intrinsic Motivation:** Exploration and discovery drive engagement
2. **Visible Progress:** XP bars, level ups, achievement notifications
3. **Safe Failure:** No penalties for mistakes, retry always available
4. **Social Learning:** (Future) Cooperative challenges and friend systems
5. **Real-world Context:** Math in cafeteria, science in labs, etc.

---

## Development Commands Reference

```bash
# Phaser.js setup
cd learning-adventures-app
npm install phaser@3.80.1

# Start development server
npm run dev

# Database operations
npx prisma generate
npx prisma db push
npx prisma migrate dev --name add_2d_world_models
npm run db:seed

# PostgreSQL management
brew services start postgresql@14
brew services stop postgresql@14

# Type checking and linting
npm run lint
npm run type-check

# Build for production
npm run build
npm start
```

---

## Migration Path for Existing Users

### Automatic Character Creation
```typescript
// On first visit to /world
if (!user.character) {
  redirect('/world/create');
}
```

### Data Migration Script
```typescript
// scripts/migrate-existing-users.ts
// Creates default characters for all existing users
// Preserves existing progress, XP, and achievements
// Grants starter currency based on current level
```

---

## Monitoring & Analytics

### Key Metrics to Track
- World entry rate (% of users who visit /world)
- Character creation completion rate
- Average session duration in world vs catalog
- Adventure completion rates (embedded vs native)
- Shop conversion rate (% users who purchase items)
- Job completion rates
- Daily active users (DAU) in world

### Error Tracking
- Phaser initialization failures
- Scene transition errors
- API call failures (character, inventory, shop, jobs)
- Performance issues (low FPS, high memory)

---

**Plan Status:** Approved and ready for implementation
**Estimated Timeline:** 6-8 weeks for proof of concept
**Risk Level:** Medium (new technology, well-supported framework)
**Breaking Changes:** None (parallel development approach)
**Next Step:** Begin Phase 1 - Phaser.js Setup + Basic World
