# Gather Campus Browser Demo — 2–3 Day Plan (Fable 5)

**Scope**: Single-player, browser-only, no backend  
**What It Does**: Walk around a pixel-art campus, explore rooms, interact with content  
**Duration**: 2–3 days (much lighter than multiplayer version)  
**Token Budget**: ~10–15k (well under Fable 5 limits)

---

## What You're Building

A **playable browser demo** where:

1. Player controls an avatar with WASD / arrow keys
2. Moves around a campus (top-down view, 32×32 tiles)
3. Enters buildings/rooms (transition or zoom)
4. Sees interactive objects (whiteboards, books, experiments)
5. Clicks objects to "interact" (opens a modal with lesson content, or just shows a message)
6. Progress is tracked locally (which rooms visited, shown as a checklist)

**Not included**:

- ❌ Multiplayer (single player only)
- ❌ Audio/video (not needed)
- ❌ Backend server (all client-side)
- ❌ Real-time sync (progress saved to localStorage)

---

## Tech Stack (Minimal)

| Layer          | Choice                                       | Why                                       |
| -------------- | -------------------------------------------- | ----------------------------------------- |
| **Rendering**  | Phaser 3 (browser)                           | 2D game engine, handles tilemaps natively |
| **Map Editor** | Tiled (free)                                 | Export JSON, load into Phaser             |
| **Assets**     | Free itch.io tilesets                        | 32×32 pixel art                           |
| **Hosting**    | Next.js page at `/campus` or standalone HTML | Already in Learning Adventures            |
| **State**      | localStorage                                 | Track visited rooms locally               |

**No backend. No database. No WebSockets. Just HTML + Phaser.**

---

## 2–3 Day Sprint

### **Day 1: Phaser Scene + Basic Movement**

**Goal**: Walking around a campus map works  
**Fable 5 Prompts**: 2–3

#### 1.1 Phaser Scene with Tilemap + Avatar

**Prompt 1** (Fable 5, ~2.5k tokens):

```
You are building a single-player campus exploration game in Phaser 3.

Task: Create a Phaser scene (CampusScene.ts) that:
1. Loads a tilemap from campus.json (Tiled export)
2. Creates a tile layer for the ground
3. Spawns a player avatar sprite at (100, 100) — use a 32x32 placeholder or simple rectangle
4. Implements WASD + arrow key movement (tile-grid based, 32px steps)
5. Keeps camera centered on player
6. Handles collision from a collision layer (walkable = true, wall = false)

Use Phaser 3 in TypeScript.
Keep it under 150 lines.

Output: scenes/CampusScene.ts

Return TypeScript code only, no explanation.
```

**What You Get**:
✅ Player can move around campus  
✅ Camera follows  
✅ Can't walk through walls

#### 1.2 Stub Tilemap JSON

**Prompt 2** (manual, or quick Fable):
Create a minimal `campus.json` (Tiled export):

- 60×60 tiles (1920×1920 pixels)
- Ground layer (all tile ID 1)
- Collision layer (edges solid, interior walkable)
- 4 building placeholders (rects marked as non-walkable)

(You can use the stub from the original sprint plan, just expand it)

**Deliverable by EOD Day 1**:

- ✅ Scene renders campus map
- ✅ Player moves with WASD
- ✅ Collision works
- ✅ Commit: `feat(phaser): campus scene with movement`

---

### **Day 2: Interactive Objects + UI**

**Goal**: Click objects, see content, track progress  
**Fable 5 Prompts**: 3–4

#### 2.1 Interactive Zones System

**Prompt 3** (Fable 5, ~2k tokens):

```
You are adding interactable objects to the Phaser scene.

Task: Create a system that:
1. Defines a list of objects: {id, x, y, type, title, description}
   - Types: 'whiteboard', 'desk', 'book', 'experiment'
2. Renders them as visible rectangles/sprites on the map
3. Detects when player is nearby (distance < 50px)
4. Shows a "Press E to interact" prompt
5. On E key press, emits an 'objectInteract' event with object id

Keep logic under 80 lines.

Output: lib/interactiveZones.ts

Return TypeScript code only, no explanation.
```

#### 2.2 Interaction Modal Component

**Prompt 4** (Fable 5, ~2k tokens):

```
You are creating a React component to show interaction content.

Task: Build an InteractionModal that:
1. Takes props: object (id, title, description, type), onClose
2. Displays object name, description, maybe an icon
3. If type='whiteboard', show "Click to open lesson" button (non-functional for now)
4. If type='book', show "Click to read" button
5. Has a Close button
6. Uses Tailwind, minimal design

Keep it under 70 lines.

Output: components/spatial/InteractionModal.tsx

Return TypeScript/JSX code only, no explanation.
```

#### 2.3 Progress Tracker (localStorage)

**Prompt 5** (Fable 5, ~1.5k tokens):

```
You are creating a progress tracker for the campus demo.

Task: Create a hook useProgressTracker that:
1. Loads visited rooms from localStorage
2. Exports: visitRoom(roomId), getRoomsVisited(), getProgress() -> percentage
3. Tracks: which objects interacted with, rooms entered
4. Saves to localStorage on every update

Keep it under 50 lines.

Output: lib/useProgressTracker.ts

Return TypeScript code only, no explanation.
```

#### 2.4 Progress UI Component

**Prompt 6** (Fable 5, ~1.5k tokens):

```
You are creating a simple progress UI overlay for the campus demo.

Task: Build a ProgressOverlay component that:
1. Shows in top-left corner
2. Displays list of buildings/rooms (Math, Science, English, History, Innovation)
3. Marks which ones visited with ✓ checkmark
4. Shows overall progress percentage
5. Uses Tailwind

Keep it under 60 lines.

Output: components/spatial/ProgressOverlay.tsx

Return TypeScript/JSX code only, no explanation.
```

**Deliverable by EOD Day 2**:

- ✅ Click objects to interact
- ✅ Modal shows content
- ✅ Progress tracked (localStorage)
- ✅ UI shows visited rooms
- ✅ Commit: `feat(interaction): objects, modals, progress tracking`

---

### **Day 3 (Optional): Polish + Assets + Styling**

**Goal**: Look polished, real assets, integrated with Learning Adventures  
**Fable 5 Prompts**: 2–3 (mostly integration, not code generation)

#### 3.1 Integrate Real Tilesets

**Manual work** (not Fable):

- Download free 32×32 tilesets from itch.io (links in AssetDownloader.md)
- Import into Phaser (texture loader)
- Update tilemap JSON with real tile IDs
- Test locally

#### 3.2 Wrap as Next.js Page

**Prompt 7** (Fable 5, ~1.5k tokens):

```
You are wrapping a Phaser game in a Next.js page component.

Task: Create a page (app/campus/page.tsx or pages/campus.tsx) that:
1. Imports and mounts the Phaser game
2. Passes user data from NextAuth (username)
3. Shows title "Campus Explorer"
4. Has a "Back to Home" link
5. Handles responsive layout (game scales to fit)

Keep it under 60 lines.

Output: app/campus/page.tsx (or pages/campus.tsx)

Return TypeScript/JSX code only, no explanation.
```

#### 3.3 Add Campus Descriptions

**Prompt 8** (Fable 5, ~1k tokens):

```
You are creating flavor text for campus buildings.

Task: Return a JSON object with 5 buildings:
{
  buildings: [
    {id: 'math', title: 'Math Tower', description: '...', color: '#hex'},
    {id: 'science', title: 'Science Lab', ...},
    ...
  ]
}

For each building, write a fun, educational 1-2 sentence description (for display).

Output: lib/campusData.json

Return JSON only, no explanation.
```

**Deliverable by EOD Day 3** (optional polish):

- ✅ Real pixel-art tilesets
- ✅ Integrated as `/campus` route
- ✅ User data from auth
- ✅ Flavor text for buildings
- ✅ Commit: `feat(campus): real assets, Next.js integration`

---

## File Structure

```
learning-adventures-platform/
├── app/
│   └── campus/
│       └── page.tsx (or pages/campus.tsx for Pages Router)
├── scenes/
│   └── CampusScene.ts
├── lib/
│   ├── interactiveZones.ts
│   ├── useProgressTracker.ts
│   └── campusData.json
├── components/spatial/
│   ├── InteractionModal.tsx
│   ├── ProgressOverlay.tsx
│   └── CampusGame.tsx (Phaser container)
├── public/
│   ├── maps/
│   │   └── campus.json (Tiled export)
│   └── assets/
│       ├── tilesets/ (free 32x32 packs)
│       └── sprites/ (avatar, objects)
└── docs/
    └── CAMPUS_DEMO_README.md
```

---

## Day-by-Day Checklist

### **Day 1 (Jul 2)**

- [ ] Create feature branch `feature/gather-campus-demo`
- [ ] Run Prompt 1 (Phaser scene) → `scenes/CampusScene.ts`
- [ ] Create stub `campus.json` tilemap
- [ ] Test: `npm run dev`, navigate to test page, move avatar around
- [ ] Commit: `feat(phaser): campus scene with movement`

### **Day 2 (Jul 3)**

- [ ] Run Prompt 3 (interactive zones) → `lib/interactiveZones.ts`
- [ ] Run Prompt 4 (modal) → `components/spatial/InteractionModal.tsx`
- [ ] Run Prompt 5 (progress tracker) → `lib/useProgressTracker.ts`
- [ ] Run Prompt 6 (progress UI) → `components/spatial/ProgressOverlay.tsx`
- [ ] Wire everything together in CampusScene
- [ ] Test: click objects, modals appear, progress updates
- [ ] Commit: `feat(interaction): objects, modals, progress tracking`

### **Day 3 (Jul 3–4, optional)**

- [ ] Download tilesets from itch.io
- [ ] Update Phaser texture loader with real assets
- [ ] Run Prompt 7 (Next.js page) → `app/campus/page.tsx`
- [ ] Run Prompt 8 (building data) → `lib/campusData.json`
- [ ] Test full integration: sign in, go to `/campus`, explore, progress saves
- [ ] Commit: `feat(campus): real assets, Next.js integration`

---

## Token Budget

| Prompt    | Task              | Est. Tokens | Notes                    |
| --------- | ----------------- | ----------- | ------------------------ |
| 1         | Phaser scene      | 2.5k        | Core game loop           |
| 2         | Interactive zones | 2k          | Click detection          |
| 3         | Modal             | 2k          | Interaction UI           |
| 4         | Progress tracker  | 1.5k        | localStorage             |
| 5         | Progress overlay  | 1.5k        | Visual feedback          |
| 6         | Next.js page      | 1.5k        | Integration              |
| 7         | Campus data       | 1k          | JSON descriptions        |
| **Total** |                   | **~12k**    | Well under Fable 5 limit |

---

## Success Criteria

✅ **Day 1 Done**: Player avatar moves around campus map, collision works  
✅ **Day 2 Done**: Can click objects, modals appear, progress tracked  
✅ **Day 3 Done** (optional): Real tilesets, integrated in Learning Adventures, user auth connected

---

## Demo Ready by July 4

By **EOD July 3**, you have a **playable demo** you can show:

- "Walk around campus with WASD"
- "Click on buildings to see what's there"
- "Progress saves (check localStorage)"
- "No backend needed, just Phaser in the browser"

---

## Post-Demo Enhancements (After July 7)

- [ ] Add walk animations + idle
- [ ] More buildings (expand campus)
- [ ] Link objects to actual Learning Adventures lessons (modal opens a lesson)
- [ ] NPC placement (teacher avatars with dialogue)
- [ ] Sound/ambient audio
- [ ] Mobile touch controls
- [ ] **Later**: Add multiplayer back in (Colyseus) if desired

---

## Quick Start (Right Now)

```bash
# Create branch
git checkout -b feature/gather-campus-demo

# Create folders
mkdir -p scenes lib/colyseus components/spatial public/maps public/assets/{tilesets,sprites}

# Create stub campus.json
# (paste JSON from original sprint plan, expand to 60x60)

# Install Phaser
npm install phaser

# Run Prompt 1 when ready
```

**Estimated total Fable 5 time**: 1.5–2 hours  
**Estimated total implementation**: 8–12 hours over 2–3 days  
**Result**: Fully playable browser demo, no backend

---

## Why This Is Better

- **No backend complexity** = faster iteration
- **No multiplayer sync bugs** = less debugging
- **Smaller scope** = ships faster
- **Still shows spatial exploration** = proves the concept
- **Easy to scale later** = add multiplayer/backend when ready
- **Works offline** = no network dependency for demo

You can literally send someone a link and they click around campus. Done.
