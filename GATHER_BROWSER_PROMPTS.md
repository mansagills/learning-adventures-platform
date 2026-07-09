# Gather Campus Browser Demo — Fable 5 Prompts (Copy-Paste)

**Total Prompts**: 8  
**Estimated Time**: 1.5–2 hours with Fable 5  
**Total Tokens**: ~12k (plenty of headroom)

Use these in order. Keep Fable 5 selected.

---

## DAY 1: CORE GAME

### Prompt 1: Phaser Campus Scene

```
You are building a single-player campus exploration game in Phaser 3.

Task: Create a Phaser scene (CampusScene.ts) that:
1. Loads a tilemap from campus.json (Tiled export in JSON format)
2. Creates a tile layer for the ground tiles
3. Spawns a player avatar sprite at (100, 100) — use a 32x32 placeholder rectangle or simple sprite
4. Implements WASD + arrow key movement (tile-grid based, 32px steps)
5. Keeps camera centered on player with smooth follow
6. Integrates collision from a collision layer in the tilemap (checks walkability before moving)

Use Phaser 3 in TypeScript.
Single player, no multiplayer.
Keep it under 160 lines.

Output: scenes/CampusScene.ts

Return TypeScript code only, no explanation. Include all imports (Phaser).
```

**What It Does**:

- Player avatar moves with WASD/arrows
- Camera follows
- Can't walk through walls
- Top-down pixel-art view

---

## DAY 2: INTERACTION & PROGRESS

### Prompt 2: Interactive Zones System

```
You are adding interactable objects to the Phaser campus scene.

Task: Create a system (interactiveZones.ts) that:
1. Defines an array of objects: each has {id, x, y, type, title, description}
   - Types: 'whiteboard', 'desk', 'book', 'experiment', 'door'
2. Renders them as visible indicators on the map (colored rectangles or simple shapes)
3. Detects when player is nearby (distance < 50px)
4. Shows a "Press E to interact" prompt when close
5. Emits an 'objectInteract' event (with object data) when player presses E
6. Exports a function to get all objects and a function to check proximity

Keep under 80 lines.
Use TypeScript.

Output: lib/interactiveZones.ts

Return TypeScript code only, no explanation.
```

**What It Does**:

- Defines campusObjects array (buildings, whiteboards, etc.)
- Detects player proximity
- Triggers interaction events

### Prompt 3: Interaction Modal Component

```
You are creating a React component to display interaction content.

Task: Build InteractionModal.tsx that:
1. Takes props: object (id, title, description, type), onClose callback
2. Displays a modal with:
   - Object title (e.g., "Math Whiteboard")
   - Description (e.g., "Learn algebra here!")
   - An icon or emoji based on type
   - A "Learn More" button (non-functional for demo, just logs)
   - A "Close" button
3. Uses Tailwind CSS
4. Centered overlay, dark background
5. Minimal, clean design

Keep under 70 lines.
Use TypeScript + React.

Output: components/spatial/InteractionModal.tsx

Return TypeScript/JSX code only, no explanation.
```

**What It Does**:

- Shows when player clicks on an object
- Displays object name + description
- Player clicks "Close" to dismiss

### Prompt 4: Progress Tracker Hook

```
You are creating a progress tracker for the campus demo.

Task: Create useProgressTracker.ts hook that:
1. Uses localStorage to persist state
2. Exports functions:
   - visitRoom(roomId: string): void — marks room as visited
   - getRoomsVisited(): string[] — returns list of visited room IDs
   - getProgress(): number — returns 0-100 percentage of campus explored
   - isRoomVisited(roomId: string): boolean
3. Saves to localStorage on every change
4. Loads from localStorage on mount

Keep under 50 lines.
Use TypeScript.

Output: lib/useProgressTracker.ts

Return TypeScript code only, no explanation.
```

**What It Does**:

- Tracks which rooms/buildings student visited
- Persists in browser localStorage
- Calculates overall progress %

### Prompt 5: Progress Overlay UI Component

```
You are creating a progress display for the campus demo.

Task: Build ProgressOverlay.tsx that:
1. Takes props: roomsVisited (array of room IDs), progress (0-100 number)
2. Displays in top-left corner as a semi-transparent overlay
3. Shows list of 5 buildings:
   - Math Tower, Science Lab, English Library, History Museum, Innovation Hub
4. Next to each, show ✓ if visited, or - if not
5. Show "Progress: X%" at bottom
6. Uses Tailwind CSS
7. Minimal, doesn't block gameplay

Keep under 60 lines.
Use TypeScript + React.

Output: components/spatial/ProgressOverlay.tsx

Return TypeScript/JSX code only, no explanation.
```

**What It Does**:

- Shows in corner during gameplay
- Displays visited buildings with checkmarks
- Shows overall progress %

### Prompt 6: Wire Everything in Scene

```
You are updating CampusScene to integrate interactiveZones + modals.

Task: Add to CampusScene.ts:
1. Import interactiveZones, InteractionModal component
2. On scene update, check player proximity to all objects using proximityCheck()
3. Show "E to interact" text when nearby
4. On E keypress, trigger modal (via state or callback)
5. Handle modal close (hide modal, resume game)

Do NOT replace existing scene code—just add this integration logic.
Keep under 80 lines.

Output: Return code snippet to add to CampusScene.ts

Return TypeScript code only, no explanation.
```

**What It Does**:

- Hooks up interactiveZones to the scene
- Shows interaction prompt
- Opens modal on E key
- Tracks visited rooms

---

## DAY 3 (OPTIONAL): POLISH & INTEGRATION

### Prompt 7: Next.js Page Wrapper

```
You are wrapping the Phaser campus game in a Next.js page.

Task: Create page.tsx (app/campus/page.tsx or pages/campus.tsx) that:
1. Imports CampusScene and Phaser config
2. Initializes Phaser game on page load
3. Passes user data from NextAuth session (optional: username)
4. Shows a title "Campus Explorer"
5. Has a "Back to Home" link
6. Game scales responsively (max-width: 100vw, max-height: 100vh)
7. Uses auth to ensure only logged-in users access

Keep under 80 lines.
Use TypeScript + React + Next.js.

Output: app/campus/page.tsx

Return TypeScript/JSX code only, no explanation.
```

**What It Does**:

- Mounts Phaser game in Next.js
- Requires authentication
- Shows title + navigation

### Prompt 8: Campus Buildings Data

```
You are creating flavor text data for campus buildings.

Task: Return a JSON object (campusData.json) with 5 buildings and 10 interactive objects:

{
  buildings: [
    {
      id: 'math',
      title: 'Math Tower',
      description: '...fun, 1-2 sentence flavor text...',
      color: '#FF6B6B'
    },
    // science, english, history, innovation
  ],
  objects: [
    {
      id: 'obj1',
      roomId: 'math',
      title: 'Algebra Whiteboard',
      description: '...',
      type: 'whiteboard',
      x: 150,
      y: 200
    },
    // ... 9 more
  ]
}

Write engaging, educational 1-2 sentence descriptions for each.

Output: lib/campusData.json

Return JSON only, no explanation.
```

**What It Does**:

- Defines 5 campus buildings + their locations
- Defines 10 interactive objects (desks, whiteboards, books, etc.)
- Provides flavor text for display

---

## Usage Order

**Day 1** (right now):

1. Create branch & folders
2. Run **Prompt 1** → CampusScene.ts
3. Create stub campus.json (from original sprint plan)
4. Test: move avatar around

**Day 2**:

1. Run **Prompt 2** → lib/interactiveZones.ts
2. Run **Prompt 3** → components/spatial/InteractionModal.tsx
3. Run **Prompt 4** → lib/useProgressTracker.ts
4. Run **Prompt 5** → components/spatial/ProgressOverlay.tsx
5. Run **Prompt 6** → add integration code to CampusScene
6. Test: click objects, see modal, progress updates

**Day 3** (optional, polish):

1. Run **Prompt 7** → app/campus/page.tsx
2. Run **Prompt 8** → lib/campusData.json
3. Download real tilesets, swap in assets
4. Test full flow: sign in → go to /campus → explore → progress saves

---

## Testing Checklist

After each prompt:

**Post-Prompt 1**:

- [ ] npm run dev
- [ ] Scene loads (console no errors)
- [ ] Move with WASD (avatar moves)
- [ ] Walk into wall (stops)
- [ ] Camera follows

**Post-Prompt 6** (after all integration):

- [ ] Click near an object (interaction prompt shows)
- [ ] Press E (modal opens)
- [ ] Modal displays object name + description
- [ ] Click Close (modal disappears)
- [ ] localStorage has visited rooms

**Post-Prompt 7** (full integration):

- [ ] Sign in to Learning Adventures
- [ ] Click "Campus" link
- [ ] Game loads (should show campus)
- [ ] Move, interact, progress updates
- [ ] Refresh page (progress persists)

---

## If You Hit Rate Limits

Fable 5 is tight. If you get rate-limited:

1. **Wait 5–10 minutes**, retry
2. **Simplify**: Remove optional requirements (e.g., "keep it under 50 lines" instead of 80)
3. **Split it**: Break Prompt 6 into 2 smaller prompts if too complex
4. **Use copy-paste**: Reuse boilerplate from prior outputs

You have a lot of token room (~30k available, only using ~12k), so you shouldn't hit limits. But if you do, these tricks help.

---

## Estimated Timing

- **Prompt 1**: 10 min (write, test)
- **Prompt 2**: 5 min (write, integrate)
- **Prompt 3**: 5 min
- **Prompt 4**: 5 min
- **Prompt 5**: 5 min
- **Prompt 6**: 15 min (integration, testing)
- **Prompt 7**: 5 min
- **Prompt 8**: 5 min

**Total Fable time**: ~1.5–2 hours  
**Total coding/testing**: ~8–10 hours over 2–3 days

---

## Deliverables

**By July 3, EOD**:

- Playable browser demo at `localhost:3000/campus`
- Player can walk around, interact with objects
- Progress tracked (localStorage)
- Ready to show to team

**By July 4** (optional):

- Real pixel-art tilesets
- Integrated with NextAuth
- Full Next.js route `/campus`
- Demo-ready for screenshots/video

No backend. No database. No multiplayer complexity. Just a fun, playable campus to explore.
