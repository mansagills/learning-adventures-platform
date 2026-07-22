# Gather Campus — Fable 5 Prompt Reference (Copy-Paste Ready)

Use these prompts in order. Keep Fable 5 model selected. Each prompt is designed to stay well under token limits with "return code only" constraints.

---

## DAY 1: BACKEND FOUNDATION

### Prompt 1: Colyseus Server Bootstrap
```
You are building a multiplayer Gather.town-inspired campus using Colyseus + Node.js.

Task: Create a minimal Colyseus WebSocket server that listens on port 2567 and bootstraps the CampusRoom.

Requirements:
- Use Express for HTTP server
- Listen on ws://localhost:2567
- Import and register CampusRoom (we'll create it next)
- Handle CORS for localhost:3000
- Use TypeScript
- Keep it under 40 lines

Output the file: api/colyseus/server.ts

Return TypeScript code only, no explanation.
```

### Prompt 2: Campus Room State Schema
```
You are building a Colyseus room for a shared campus game.

Task: Create a Colyseus @schema class that defines:
1. A Map of players (key=sessionId, value=Player)
   - Player has: username (string), x (number), y (number), direction (string: 'up'|'down'|'left'|'right'), animationState (string)
2. An Array of MapObjects
   - MapObject has: id (string), type (string), x (number), y (number), data (object)
3. A join handler that broadcasts "playerJoin" and sends existing players to new client
4. A leave handler that broadcasts "playerLeave"
5. A movePlayer(sessionId, x, y, direction) handler that updates state

Use @type.model and @type.array decorators.
Keep it under 100 lines.

Output the file: api/colyseus/rooms/CampusRoom.ts

Return TypeScript code only, no explanation. Include import statements.
```

### Prompt 3: Prisma CampusSession Schema
```
You are extending the Prisma schema to track campus sessions.

Task: Add a new CampusSession model to the existing schema.prisma file with:
- id (string, @id, @default(uuid()))
- userId (string, @db.Uuid, foreign key to User)
- roomId (string, default: "campus")
- position (JSON, for {x: number, y: number})
- lastHeartbeat (DateTime, @default(now()), @updatedAt)
- joinedAt (DateTime, @default(now()))
- createdAt (DateTime, @default(now()))

Include the relation to User (one user → many sessions).

Keep it minimal, under 15 lines.

Output: Return ONLY the CampusSession model block in Prisma syntax. No explanation.
```

---

## DAY 2: FRONTEND SCAFFOLD

### Prompt 4: Phaser Campus Scene
```
You are building a Phaser 3 game scene for the campus.

Task: Create a scene that:
1. Loads campus.json tilemap (assume it exists in public/maps/)
2. Creates a static layer from the first tileset
3. Spawns player avatar sprite at (100, 100)
4. Sets up camera to follow player
5. Listens for WASD input
6. Emits a 'move' event with new x, y when player presses arrow/WASD
7. Animates the player sprite to the new position (no physics, just tween over 100ms)

Use TypeScript.
Keep it under 150 lines.
Include these lifecycle methods: preload, create, update.

Output the file: scenes/CampusScene.ts

Return TypeScript code only, no explanation. Include all imports.
```

### Prompt 5: Colyseus Client Hook
```
You are building a React hook to connect to the Colyseus campus room.

Task: Create a custom hook useColyseusCampus that:
1. Connects to ws://localhost:2567 on mount
2. Joins the room "campus"
3. Returns observables: playersMap$, myPlayer$
4. Exports function: moveAvatar(newX, newY, direction) that sends to server
5. Handles connection/disconnection events
6. Cleans up on unmount

Use BehaviorSubject for state.
Use TypeScript.
Keep it under 100 lines.

Output the file: lib/colyseus/useColyseusCampus.ts

Return TypeScript code only, no explanation.
```

### Prompt 6: Asset Registry (Stub)
```
You are creating an asset manifest for the campus game.

Task: Create a file that exports an object with paths to all assets needed:
- tileset paths (assume exist in public/assets/tilesets/)
- character sprite paths (public/assets/sprites/)
- map JSON path (public/maps/)
- audio paths (public/assets/audio/)

Include comments showing expected folder structure.
Keep it under 50 lines.

Output the file: lib/assetManager.ts

Return TypeScript code only with comments, no explanation.
```

---

## DAY 3: MULTIPLAYER SYNC

### Prompt 7: Server Movement Validation
```
You are extending the CampusRoom to validate player movement.

Task: Add a method movePlayer to CampusRoom that:
1. Takes sessionId, newX, newY, direction as parameters
2. Validates newX, newY are within bounds (0-1600, 0-1600)
3. For now, assume all positions are walkable (we'll add collision later)
4. Updates player.x, player.y, player.direction in the room state
5. Broadcasts the updated player position to all clients

Do NOT use physics. Just update numbers.
Keep it under 50 lines.

Output: Return the movePlayer method code only for the CampusRoom class.

Return TypeScript code only, no explanation.
```

### Prompt 8: Client Avatar Interpolation
```
You are updating the Phaser scene to smoothly animate remote avatar movements.

Task: Add to CampusScene:
1. A handler that listens to state changes on other players
2. When another player's (x, y) changes, tween their sprite from old to new position over 150ms
3. Use Phaser.Tweens.Tween
4. Update the player's direction based on direction value
5. Handle the case where the avatar sprite doesn't exist yet (create it)

Keep it under 100 lines.
Use TypeScript.

Output: Return the code to add to CampusScene.ts (the state change listener + tween logic).

Return TypeScript code only, no explanation.
```

### Prompt 9: Local Multiplayer Test Script
```
Create a simple markdown document (test-multiplayer.md) with bash commands to:
1. Start the Colyseus server
2. Start the Next.js dev server
3. Open 2 browser tabs
4. Manual test steps: move avatar in tab 1, verify it appears in tab 2

Keep it simple, clear, and actionable (no more than 20 lines).

Output the file: test-multiplayer.md

Return markdown only, no explanation.
```

---

## DAY 4: PROXIMITY & ASSETS

### Prompt 10: Proximity Engine
```
You are creating a proximity detection service for the campus.

Task: Create a file that exports:
1. getNearbyPlayers(myX: number, myY: number, players: Player[], threshold: number = 200): Player[]
   - Returns players whose distance to (myX, myY) is <= threshold
2. shouldActivateCall(distance: number, isCurrentlyOnCall: boolean): boolean
   - Returns true if distance <= threshold and not already on call
3. calculateDistance(x1, y1, x2, y2): number
   - Euclidean distance

Keep it under 40 lines.
Use TypeScript.

Output the file: lib/proximityEngine.ts

Return TypeScript code only, no explanation.
```

### Prompt 11: Proximity Indicator Component
```
You are creating a React component to show nearby players.

Task: Build a ProximityIndicator component that:
1. Takes props: nearbyPlayers: Array<{id, username, distance}>, onCallPlayer: (id) => void
2. Displays a fixed overlay (top-right corner)
3. Shows list of nearby players with name + distance
4. Each has a "Call" button (not functional yet, just calls onCallPlayer)
5. Uses Tailwind CSS
6. Minimal, clean design

Keep it under 80 lines.
Use TypeScript + React.

Output the file: components/spatial/ProximityIndicator.tsx

Return TypeScript/JSX code only, no explanation.
```

### Prompt 12: Asset Sourcing Guide
```
You are creating a reference guide for sourcing free 32x32 pixel art assets for the campus.

Task: Write a markdown document (AssetDownloader.md) that lists:
1. 3 free itch.io collections for 32x32 tilesets (with links)
2. 2 collections for character sprites (with links)
3. Expected folder structure: public/assets/tilesets/, sprites/, maps/
4. How to name tilesets (e.g., "campus_outdoor.png")
5. Brief note on licensing (all should be free for educational use)

Keep it under 30 lines.

Output the file: docs/AssetDownloader.md

Return markdown only, no explanation.
```

### Prompt 13: Stub Campus Tilemap JSON
```
You are creating a minimal Tiled map export for testing.

Task: Generate a campus.json file in Tiled JSON format that:
1. Is 50x50 tiles (1600x1600 pixels at 32x32 per tile)
2. Has one tileset layer named "ground" with all tiles set to ID 1 (floor)
3. Has one collision layer named "collision" with edges marked solid (tiles 2+)
4. Includes proper Tiled JSON structure (tilewidth, tileheight, infinite: false, etc.)
5. Single tileset reference: "tileset.png" (32x32 tiles)

Keep it valid Tiled JSON format.

Output the file: public/maps/campus.json

Return raw JSON only, no explanation.
```

---

## DAY 5: INTEGRATION & HANDOFF

### Prompt 14: Handoff Document
```
You are creating a handoff document for a Gather.town-inspired campus built with Fable 5 over 5 days.

Task: Write GATHER_FABLE_HANDOFF.md that includes:
1. What was built (Colyseus backend, Phaser scene, multiplayer sync)
2. What works: 2 players moving, real-time sync, proximity detection logic
3. What's stubbed: WebRTC not integrated, assets not populated, collision detection not integrated
4. Exact next steps for the developer picking this up on July 8 (with Sonnet/Haiku):
   a. Implement simple-peer WebRTC (with links to reference)
   b. Download and integrate real tilesets from itch.io
   c. Add Phaser physics collision
   d. Build 4-5 building maps
5. Current branch: feature/gather-campus-spatial
6. How to run locally: npm run dev + npm run colyseus

Keep it under 50 lines, actionable, clear.

Output the file: docs/GATHER_FABLE_HANDOFF.md

Return markdown only, no explanation.
```

---

## Usage Tips

1. **Model**: Keep Fable 5 selected throughout all 5 days
2. **Timing**: Space prompts out across the day to avoid rate limit hits
3. **Code review**: After each prompt, quickly scan the returned code for obvious issues
4. **Testing**: Test locally at end of each day (Day 1 = server runs, Day 2 = scene loads, Day 3 = 2-player sync works, etc.)
5. **Git**: Commit after each prompt success (or batch 2–3 related prompts, then commit)

---

## If You Hit Rate Limits

If Fable 5 rate limits you partway through a prompt:
1. **Wait 5–10 minutes** before retrying
2. **Simplify the prompt** (remove optional constraints, lower line limits)
3. **Split into 2 prompts** instead of 1 (e.g., "just the Player class" then "just the Map handler")
4. **Use copy-paste from prior outputs** to fill in boilerplate (imports, etc.)

---

## Estimated Timing

- **Prompt 1–3** (Day 1): 5–10 minutes each = 20–30 min total
- **Prompt 4–6** (Day 2): 5–10 minutes each = 20–30 min total
- **Prompt 7–9** (Day 3): 5–10 minutes each = 20–30 min total
- **Prompt 10–13** (Day 4): 5–10 minutes each = 20–40 min total (12 & 13 are docs, faster)
- **Prompt 14** (Day 5): 5 minutes

**Total Fable 5 time**: ~2 hours of actual prompting  
**Total coding/testing time**: ~10–15 hours across 5 days  

**You have plenty of time and token budget.**
