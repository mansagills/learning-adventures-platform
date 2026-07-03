# Gather Campus Clone — Fable 5 Sprint Plan (July 2–7)

**Budget**: 5 days × Fable 5 (low rate limits) + existing campus code  
**Constraint**: Compensate for token limits with focused phases, short iterations  
**Handoff**: Complete setupby July 6, defer polish to post-July-7 on Sonnet/Haiku

---

## Overview: What You Already Have

✅ **Learning Adventures Platform** (Nextjs + NextAuth + Prisma + PostgreSQL)  
✅ **Campus V1 point-click plan** (basic campus structure, some world state)  
✅ **Subject catalog** (Math, Science, English, History, Interdisciplinary)  

**What's Missing**:
- Real-time multiplayer avatar sync (Colyseus)
- Phaser 2D rendering + tilemap integration
- WebRTC proximity audio/video
- Campus map in Tiled format
- Character sprite assets

---

## 5-Day Sprint Structure

### **Day 1 (Jul 2): Foundation — Colyseus Backend + Branch Setup**
**Goal**: Multiplayer server ready, basic room structure  
**Fable 5 Tasks**: 3–4 short, focused prompts

#### 1.1 Create Feature Branch
```bash
git checkout -b feature/gather-campus-spatial
```

#### 1.2 Install Colyseus (Minimal Setup)
- Add `colyseus`, `colyseus-schema`, `express-cors` to backend dependencies
- **Prompt 1** (Fable 5, ~2k tokens): "Set up a minimal Colyseus server in a new `api/colyseus/` folder. Include: basic WebSocket server on port 2567, a CampusRoom class with player state (id, username, x, y, direction), and connection/disconnection handlers. Use TypeScript. Return only the core room file + server bootstrap code."

#### 1.3 Define Campus Room State Schema
- **Prompt 2** (Fable 5, ~3k tokens): "Create a Colyseus schema file that defines: Players (Map), each with username/x/y/direction/animationState, and MapObjects (Array) with id/type/x/y/data. Use `@type.model` decorators. Include a join/leave handler that broadcasts player positions every 100ms. Return schema code only."

#### 1.4 Add to Existing Prisma User Model
- **Prompt 3** (Fable 5, ~2k tokens): "Add a `CampusSession` table to the Prisma schema: userId, roomId, joinedAt, position (JSON: x,y), lastHeartbeat. Include a migration file. Keep it minimal — only what's needed for tracking."

**Deliverables**:  
✅ Colyseus server running on `localhost:2567`  
✅ Room state schema defined  
✅ Prisma migration staged  
✅ All code committed to `feature/gather-campus-spatial`

**Token Budget**: ~7–8k (well under limit)

---

### **Day 2 (Jul 3): Frontend Setup — Phaser Scene Scaffold + Asset Pipeline**
**Goal**: Phaser scene rendering, placeholder tilemap loading  
**Fable 5 Tasks**: 3–4 short prompts

#### 2.1 Install Phaser 3 + Colyseus Client
```bash
npm install phaser colyseus.js colyseus-schema
```

#### 2.2 Create Phaser Scene for Campus
- **Prompt 4** (Fable 5, ~3k tokens): "Create a Phaser 3 scene file `CampusScene.ts` that: (1) loads a tilemap from a JSON file (assume `campus.json` exists), (2) creates a tileset layer, (3) spawns the player avatar at (100, 100), (4) listens for WASD input and emits 'move' events. Keep it under 150 lines. Include basic camera follow."

#### 2.3 Integrate Colyseus Client
- **Prompt 5** (Fable 5, ~2.5k tokens): "Create a Colyseus client hook `useColyseusCampus.ts` that: (1) connects to `ws://localhost:2567`, (2) joins a room named 'campus', (3) exposes `players$`, `myPlayer$`, `moveAvatar(x, y)`. Use Observable pattern. Return hook code only, ~80 lines."

#### 2.4 Stub Asset Loader
- **Prompt 6** (Fable 5, ~1.5k tokens): "Create an `AssetManager.ts` file that lists all assets needed: tileset PNG paths, sprite sheet paths, audio files. Don't load them yet—just define the registry. Include a comment showing expected structure (tilesets/, sprites/, maps/, audio/)."

**Deliverables**:  
✅ Phaser scene scaffold  
✅ Colyseus client hook  
✅ Asset manifest (not yet populated)  
✅ Basic WASD movement event emitted  

**Token Budget**: ~7–8k (well under limit)

---

### **Day 3 (Jul 4): Multiplayer Sync — Avatar Movement + Interpolation**
**Goal**: 2 players can see each other move in real-time  
**Fable 5 Tasks**: 3 focused prompts

#### 3.1 Server-Side Movement Validation
- **Prompt 7** (Fable 5, ~2.5k tokens): "Add to CampusRoom: a `movePlayer(sessionId, newX, newY)` method that: (1) validates new position against collision map (assume hard-coded walkable zones for now), (2) updates player state, (3) broadcasts to all clients. Handle velocity/direction. Return method code only, ~50 lines."

#### 3.2 Client Interpolation
- **Prompt 8** (Fable 5, ~2.5k tokens): "Add to CampusScene: smooth movement interpolation so avatars don't teleport. Use Phaser tweens to animate avatar from old (x,y) to new (x,y) over 150ms when a remote player moves. Include the onStateChange handler. Return code only, ~60 lines."

#### 3.3 Test Harness / Local Play Script
- **Prompt 9** (Fable 5, ~2k tokens): "Create a simple `test-multiplayer.md` script (bash commands) that: (1) starts the Colyseus server, (2) opens 2 browser tabs to `localhost:3000/campus`, (3) lists manual test steps (move in tab 1, verify appears in tab 2, etc.). Keep it simple."

**Deliverables**:  
✅ Server validates & broadcasts moves  
✅ Client interpolates smoothly  
✅ Manual test documented  
✅ 2 concurrent users working (verified locally)

**Token Budget**: ~7k

---

### **Day 4 (Jul 5): Proximity Audio Stub + Basic Assets**
**Goal**: Audio/video plumbing ready, minimal asset integration  
**Fable 5 Tasks**: 3–4 prompts (lighter, defer heavy implementation)

#### 4.1 Proximity Calculation Service
- **Prompt 10** (Fable 5, ~2k tokens): "Create a `proximityEngine.ts` file that: (1) exports a function `getNearbyPlayers(myX, myY, players[], threshold=200)` returning nearby players, (2) exports a function `shouldCallUser(distance, currentCalls)` returning true if call should activate. Return code only, ~40 lines. Don't integrate WebRTC yet—just return player IDs."

#### 4.2 Stub Proximity UI
- **Prompt 11** (Fable 5, ~1.5k tokens): "Create a `ProximityIndicator.tsx` React component (overlay) that shows: list of nearby players (names + distance), button to 'call' each (non-functional for now). Style with Tailwind. Keep it minimal, ~60 lines."

#### 4.3 Placeholder Assets Folder Structure
- **Prompt 12** (Fable 5, ~1k tokens): "Create an `AssetDownloader.md` guide (not code) that lists: (1) 3 free 32x32 tileset sources (itch.io links), (2) character sprite packs, (3) how to name/organize them in public/assets/. Include exact folder names. This is reference docs, not code."

#### 4.4 Stub Campus.json (Minimal Map)
- **Prompt 13** (Fable 5, ~1.5k tokens): "Generate a minimal `campus.json` Tiled export (JSON format) that: (1) is 50×50 tiles, (2) has 1 layer of floor tiles (all tile ID 1), (3) has a collision layer marking edges as solid. Output raw JSON only, ready to place in `public/maps/`. Make it valid Tiled JSON structure."

**Deliverables**:  
✅ Proximity engine (business logic, no WebRTC)  
✅ Proximity UI component (visual, no calls yet)  
✅ Asset sourcing guide  
✅ Stub tilemap JSON  

**Token Budget**: ~6k

---

### **Day 5 (Jul 6): Integration + Handoff Docs**
**Goal**: Everything wired together, clear README for post-July-7 work  
**Fable 5 Tasks**: 2–3 short prompts

#### 5.1 Connect Everything in Dev Mode
- Manual edits (not Fable):
  - Wire Phaser scene to load stub `campus.json`
  - Wire Colyseus hook to CampusScene
  - Mount ProximityIndicator component over Phaser canvas
  - Test end-to-end locally (2 players, movement sync, proximity UI updates)

#### 5.2 Create Handoff Document
- **Prompt 14** (Fable 5, ~2k tokens): "Create a `GATHER_FABLE_HANDOFF.md` that outlines: (1) what was built in 5 days, (2) what works (multiplayer movement sync), (3) what's stubbed (no audio yet), (4) exact next steps for post-July-7 (Fable 5 rate limit over): integrate simple-peer WebRTC, populate assets, add collision detection. Keep it clear and actionable."

#### 5.3 Update COMPREHENSIVE_PLATFORM_PLAN.md
- Note this phase in the plan
- Mark "Phase 2D — Spatial Campus MVP (Colyseus foundation)" as COMPLETED

**Deliverables**:  
✅ All components wired and tested locally  
✅ Handoff document (next developer or Sonnet pickup)  
✅ Branch ready to merge after July 7  

**Token Budget**: ~2k

---

## Daily Token Budgets

| Day | Focus | Prompts | Est. Tokens | Notes |
|-----|-------|---------|-------------|-------|
| Jul 2 | Backend foundation | 3–4 | 7–8k | Colyseus + schema |
| Jul 3 | Frontend scaffold | 4 | 7–8k | Phaser scene + client hook |
| Jul 4 | Multiplayer sync | 3 | ~7k | Movement + interpolation |
| Jul 5 | Audio stub + assets | 4 | ~6k | Proximity logic + UI placeholder |
| Jul 6 | Integration + handoff | 2–3 | ~2k | Wire everything, document |
| **Total** | | **16–18 prompts** | **~29–31k tokens** | Well under Fable 5 limits |

**Fable 5 Rate Limit Strategy**:
- Keep prompts short and focused (no multi-part "do 5 things in one prompt")
- Avoid asking for full front-end components (use Prompt 11 as minimal example)
- Prefer "return code only, ~X lines" to cut context
- Batch heavy async work (assets) into reference docs, not code generation

---

## Branch Strategy

**Primary Branch**: `feature/gather-campus-spatial`

```
feature/gather-campus-spatial
├── api/colyseus/
│   ├── server.ts (main Colyseus server)
│   ├── rooms/CampusRoom.ts
│   └── schema/CampusSchema.ts
├── lib/
│   ├── proximityEngine.ts
│   ├── colyseus/useColyseusCampus.ts
│   └── assetManager.ts
├── components/
│   ├── spatial/
│   │   ├── CampusCanvas.tsx (Phaser container)
│   │   └── ProximityIndicator.tsx
├── public/
│   ├── maps/campus.json (stub)
│   ├── assets/
│   │   ├── tilesets/ (empty, to be populated)
│   │   ├── sprites/ (empty)
│   │   └── audio/ (empty)
├── scenes/
│   └── CampusScene.ts
└── docs/
    ├── GATHER_FABLE_HANDOFF.md
    └── AssetDownloader.md
```

**Commits** (daily):
```
Day 1: "feat(colyseus): backend room + schema setup"
Day 2: "feat(phaser): campus scene scaffold + colyseus hook"
Day 3: "feat(multiplayer): avatar movement sync + interpolation"
Day 4: "feat(proximity): audio/video stub + basic UI + assets guide"
Day 5: "feat(integration): wire all components + handoff docs"
```

---

## What Gets Deferred (Post-July-7)

**WebRTC Integration**
- Need Sonnet/Haiku for complex negotiation code
- Implement `simple-peer` + signaling logic
- Test with real browser media permissions

**Full Asset Integration**
- Download free tilesets from itch.io
- Import into Phaser (texture loading)
- Build 4–5 themed building maps in Tiled

**Collision Detection**
- Integrate Phaser physics with Tiled collision layer
- Test walk-through walls, corner cases

**Educational Features**
- Link campus rooms to actual courses
- NPC placement (teacher avatars)
- Progress tracking integration

**Animations**
- Walk cycles, idle states
- Avatar customization picker

---

## Success Criteria by July 7

✅ **Day 1 Complete**: Colyseus server running, schema defined  
✅ **Day 2 Complete**: Phaser scene loading stub map, WASD emits moves  
✅ **Day 3 Complete**: 2 players visible to each other, moving smoothly  
✅ **Day 4 Complete**: Proximity indicator shows nearby players (names + distance)  
✅ **Day 5 Complete**: Everything wired, tested locally, handoff doc written  

**Not Yet Done** (and that's ok):
- ❌ Real WebRTC audio/video (complex, deferred to Sonnet)
- ❌ Populated asset tilesets (download + integrate, not Fable generation)
- ❌ Full multi-building campus (stub is 1 room, will expand)
- ❌ Animations (deferred)

**Demo Readiness by July 7**:
- "Here's 2 players moving around a campus in real-time. Proximity logic is in place. Ready to add audio/video next week."

---

## Usage Notes for Each Day

### Day 1: Colyseus Setup
- Fable 5: Good at backend scaffolding, schemas
- Minimal UI in Day 1 → fewer tokens
- TypeScript helps because types are explicit (less back-and-forth)

### Day 2: Phaser
- Fable 5: Good at small scenes, hooks
- **Avoid** asking for full asset pipelines—just load placeholder
- Keep scene under 150 lines → Fable handles it well

### Day 3: Multiplayer
- Fable 5: Good at state management, movement math
- Break into 2 parts: server validation, client animation
- Don't ask for physics engine—just position tweens

### Day 4: Proximity + Assets
- Fable 5: Good at business logic (proximity calcs)
- **Don't** ask Fable to generate full tilesets or audio
- Use for logic + stub UI, reference guides for heavy assets
- Asset guide is docs, not code—saves tokens

### Day 5: Glue It Together
- Mostly manual work (no Fable)
- Only Fable prompts: final handoff doc + plan update
- Focus on clear, actionable next steps for July 8+

---

## Post-July-7 Pickup (Sonnet/Haiku)

Once Fable 5 rate limit expires:

1. **Week 1 (Jul 8–14)**
   - Integrate simple-peer WebRTC
   - Test P2P audio with 2–4 users
   - Populate real tilesets (itch.io community assets)
   - Build 4–5 building maps in Tiled

2. **Week 2 (Jul 15–21)**
   - Add animations (walk cycles, idle)
   - Integrate with progress tracking
   - NPC placement (teacher avatars)
   - Collision detection fine-tuning

3. **Week 3+ (Jul 22+)**
   - Polish & scale (SFU if needed)
   - Mobile responsiveness
   - Content integration (lessons → campus)

---

## Quick Reference: Fable 5 Prompt Template

```
You are building a Gather.town-inspired campus for Learning Adventures.

Context: [existing codebase brief]

Task: [specific, small task—ONE thing]

Constraints:
- Use TypeScript
- Keep it under [X] lines
- Return only the code, no explanation
- Follow the existing pattern in [file]

Output: [specific format: "return module.ts only", "return schema code only", etc.]
```

---

## Notes

- **Token limits**: Fable 5 is strict but manageable with short, focused prompts
- **Collaboration**: Consider pairing on Days 1–2 to validate schema design
- **Testing**: Run local tests each day (don't defer)
- **Commits**: Push daily to avoid loss; branch is safe to iterate on
- **Handoff clarity**: Whoever picks up July 8 should know exactly what's stubbed vs. complete

**You've got this. 5 days, focused scope, clear handoff.**
