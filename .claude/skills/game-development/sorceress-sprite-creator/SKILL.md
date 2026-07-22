---
name: sorceress-sprite-creator
description: Full workflow orchestrator for creating Sorceress.games sprites and integrating them into the Learning Adventures Phaser 3 campus world. Covers three phases: asset design, bulk Sorceress prompt generation, and automatic Phaser integration after export. Use when you need character sprites, tilesets, NPCs, or UI art for the 2D world.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# Sorceress Sprite Creator — Full Workflow Orchestrator

> Coordinates `game-designer` + `game-developer` agents to design assets, generate Sorceress-ready prompts in bulk, and auto-wire exported assets into Phaser 3 scenes.

**Key limitation:** Sorceress has no public API. This skill cannot call Sorceress programmatically. It generates structured, copy-paste-ready prompts for the Sorceress UI, then handles all Phaser integration code automatically after the user exports files.

---

## When to Use This Skill

- "create sprites for the campus world"
- "I need character sprites for Sorceress"
- "generate asset prompts for [scene / NPC / tileset]"
- "bulk sprite workflow"
- "I finished generating in Sorceress, integrate the assets"
- Any time new art assets are needed for `WorldScene`, `MathBuildingScene`, or any Phaser scene

---

## Three-Phase Workflow

```
Phase 1: DESIGN    → game-designer agent produces Asset Manifest
Phase 2: GENERATE  → game-developer agent writes Sorceress Prompt Cards → docs/sorceress-prompts/
Phase 3: INTEGRATE → game-developer agent writes Phaser preload/animation code after user drops in files
```

---

## Phase 1 — Asset Design

**Who runs it:** `game-designer` agent

**Trigger phrases:** "create sprites for…", "what sprites do I need…", "design assets for…"

### What the game-designer agent must read

Before producing anything, the agent reads:

| File | Purpose |
|------|---------|
| `2D_GAME_WORLD_PLAN.md` | Visual targets, zone layout, character system |
| `game/entities/Player.ts` | Existing character keys and animation structure |
| `game/world/TilemapGenerator.ts` | Existing `TILE_ASSET_KEYS` — avoid key conflicts |
| `game/scenes/WorldScene.ts` | All `this.load.*()` calls to find what's missing |
| `game/scenes/MathBuildingScene.ts` | Interior scene asset requirements |
| `SORCERESS_ASSESSMENT.md` | Sorceress tool names and capabilities |

### Output: Asset Manifest

The agent produces a structured markdown table. Example format:

```markdown
## Asset Manifest — Campus World (2026-04-09)

### Characters (Priority: CRITICAL)
| Asset Key | Type | Tool | Frame Spec | Animations | Priority |
|-----------|------|------|------------|------------|----------|
| player-human-1 | Character spritesheet | Spritely | 96×96px, 4 cols × 4 rows | walk-up/side/down, idle | CRITICAL |
| player-human-2 | Character spritesheet | Spritely | 96×96px, 4 cols × 4 rows | walk-up/side/down, idle | CRITICAL |
| player-robot-blue | Character spritesheet | Spritely | 96×96px, 4 cols × 4 rows | walk-up/side/down, idle | CRITICAL |
...

### Ground Tiles (Priority: HIGH)
| Asset Key | Type | Tool | Spec | Priority |
|-----------|------|------|------|----------|
| ground-grass-1 | Tileset tile | Tileset Generator | 64×64px, seamless | HIGH |
...

### Building Walls (Priority: HIGH)
| Asset Key | Type | Tool | Spec | Priority |
|-----------|------|------|------|----------|
| wall-math-1 | Building wall tile | ImGen | 64×64px, top-down | HIGH |
...
```

**Style constraints for ALL assets** (reference these in every prompt):
- Pixel art style, retro palette
- Top-down perspective (camera above, slight angle)
- Child-friendly, vibrant colors
- Transparent PNG background (no white)
- Campus/school theme

---

## Phase 2 — Bulk Prompt Generation

**Who runs it:** `game-developer` agent

**Trigger:** After Phase 1 produces the Asset Manifest, or "generate Sorceress prompts for [asset list]"

### Sorceress Tools Reference

| Tool in Sorceress UI | Use For |
|----------------------|---------|
| **Spritely** | Character/NPC spritesheets — generates 4-direction walk cycles |
| **ImGen** | Static art — building walls, backgrounds, UI elements, props |
| **Tileset Generator** | Seamless repeating tiles — grass, path, floor, water |
| **Background Remover** | Strip white/solid background from any generated asset |
| **Sprite Analyzer** | Auto-detect frame grid from a spritesheet PNG |
| **Slicer** | Extract frames and export JSON frame data (Phaser atlas format) |
| **Phaser 3 Effects Editor** | Particle effects — XP pickup, level-up sparkles |
| **Audio Editor** | SFX clips — footsteps, door opens, coin pickup |

### Prompt Card Format

Each asset gets one prompt card. Write all cards to a single file:

**Output path:** `docs/sorceress-prompts/YYYY-MM-DD-[batch-name].md`

```markdown
---
Batch: Campus World Phase 2
Date: 2026-04-09
Total assets: 24
---

=== ASSET 1/24: player-human-1 ===
Sorceress Tool: Spritely
Copy-paste prompt:
> "Top-down pixel art young student character, tan skin, blue hoodie, dark jeans, white sneakers. Retro pixel style, vibrant colors, child-friendly. 96×96px per frame. 4-direction walk cycle in this exact row order: Row 0 = walk UP (back of character), Row 1 = walk SIDE (left-facing, will be mirrored for right), Row 2 = walk DOWN (front-facing), Row 3 = idle poses. 4 frames per row, 16 frames total (4 cols × 4 rows). Transparent background."

Export settings:
- Sheet layout: 4 columns × 4 rows
- Frame size: 96×96px
- Background: transparent PNG (run Background Remover if needed)
- Export as: PNG spritesheet only (no JSON needed — uniform grid)

File name: human-1.png
Destination: public/assets/sprites/
Phaser load key: player-human-1

Post-export steps:
1. Background Remover → ensure transparent PNG
2. Verify 4×4 grid layout in Sprite Analyzer
3. Drop in public/assets/sprites/human-1.png
4. Run Phase 3 integration

---

=== ASSET 2/24: ground-grass-1 ===
Sorceress Tool: Tileset Generator
Copy-paste prompt:
> "Seamless top-down pixel art grass tile, bright green, retro pixel style, 64×64px. Slight texture variation — not flat. Child-friendly, vibrant. Campus lawn aesthetic."

Export settings:
- Size: 64×64px single tile
- Must be seamless (no visible edge when tiled)
- Background: none (solid tile, no transparency needed)
- Export as: PNG

File name: ground-grass-1.png
Destination: public/assets/tilemaps/
Phaser load key: ground-grass-1

---
[... continue for all assets ...]

## Completion Checklist
- [ ] player-human-1 → public/assets/sprites/
- [ ] player-human-2 → public/assets/sprites/
- [ ] player-robot-blue → public/assets/sprites/
- [ ] ground-grass-1 → public/assets/tilemaps/
- [ ] ground-path → public/assets/tilemaps/
- [ ] wall-math-1 → public/assets/tilemaps/
[... one checkbox per asset ...]
```

---

## Phase 3 — Phaser Integration

**Who runs it:** `game-developer` agent

**Trigger:** "I finished generating in Sorceress, integrate the assets" OR when user confirms files are dropped into `public/assets/`

### Step 1 — Detect new files

Scan `public/assets/sprites/` and `public/assets/tilemaps/` for PNGs not yet referenced in any Phaser scene. Compare against existing `this.load.spritesheet()` and `this.load.image()` calls in:
- `game/scenes/WorldScene.ts`
- `game/scenes/MathBuildingScene.ts`
- `game/scenes/OpenWorldScene.ts`

### Step 2 — Write preload calls

**For character spritesheets** (uniform 4×4 grid, 96×96 frames):

Add to `WorldScene.preload()`:
```typescript
// Character sprites — 96×96px frames, 4 cols × 4 rows
this.load.spritesheet('player-human-1', '/assets/sprites/human-1.png', {
  frameWidth: 96, frameHeight: 96
});
```

**For tile images** (single tile PNGs, used via `renderTexture`):

Add to `WorldScene.preload()`:
```typescript
this.load.image('ground-grass-1', '/assets/tilemaps/ground-grass-1.png');
```

**For atlas (if Sorceress Slicer was used to export JSON):**
```typescript
this.load.atlas('player-human-1', '/assets/sprites/human-1.png', '/assets/sprites/human-1.json');
```

### Step 3 — Write animation definitions

Add to `Player.createAnimations()` following the existing pattern in [game/entities/Player.ts](game/entities/Player.ts):

```typescript
// Existing pattern — frame layout: 4 cols × 4 rows, 96×96 per frame
// Row 0 (frames 0-3):  walk-up
// Row 1 (frames 4-7):  walk-side (left-facing; right uses flipX)
// Row 2 (frames 8-11): walk-down
// Row 3 (frames 12-15): idle

// New characters use the SAME pattern — just add their key to the chars array:
const chars = ['human-1', 'human-2', 'robot-blue', 'wizard-purple', 'cat-orange', 'knight-silver'];
// → simply add new keys: 'elf-green', 'knight-gold', etc.
```

### Step 4 — Update TilemapGenerator for new tile types

If new tile PNGs were added that need to appear in the world:

In [game/world/TilemapGenerator.ts](game/world/TilemapGenerator.ts):

```typescript
// Add new tile index constants to TILE object
export const TILE = {
  // ... existing tiles ...
  GRASS_FLOWER_3: 12, // ground-flowers-3 (new)
  WATER_DEEP:     13, // ground-water-deep (new)
} as const;

// Add to TILE_ASSET_KEYS
export const TILE_ASSET_KEYS: _TileCoverage = {
  // ... existing ...
  12: 'ground-flowers-3',
  13: 'ground-water-deep',
};
```

Note: The type alias `_TileCoverage` enforces that every TILE index has a matching asset key — TypeScript will error at compile time if you forget one.

### Step 5 — Output verification checklist

After writing integration code, output this to the user:

```
## Integration Complete — Verify in Browser

1. Start dev server: npm run dev
2. Navigate to /world
3. Check browser console — no 404 errors for asset URLs
4. Player spawns with correct sprite (not colored rectangle fallback)
5. Walk in all 4 directions — animations play correctly
6. Left movement mirrors right animation (flipX)
7. Idle animation plays when standing still
8. Tile grid renders correctly — no seams or gaps
9. Camera follows player within world bounds

If you see colored rectangles: assets still using tint fallback in Player.ts
→ Check that texture key in load.spritesheet() matches key used in Player constructor
```

---

## Key File References

| File | What to read / modify |
|------|-----------------------|
| [game/entities/Player.ts](game/entities/Player.ts) | `chars` array in `createAnimations()` — add new character keys |
| [game/world/TilemapGenerator.ts](game/world/TilemapGenerator.ts) | `TILE` constants + `TILE_ASSET_KEYS` — add new tile types |
| [game/scenes/WorldScene.ts](game/scenes/WorldScene.ts) | `preload()` — add new `load.spritesheet()` / `load.image()` calls |
| [game/scenes/MathBuildingScene.ts](game/scenes/MathBuildingScene.ts) | `preload()` — interior scene assets |
| [.claude/skills/game-development/sprite-integration/SKILL.md](.claude/skills/game-development/sprite-integration/SKILL.md) | Phaser loading patterns reference |
| [2D_GAME_WORLD_PLAN.md](2D_GAME_WORLD_PLAN.md) | Visual targets + priority asset list |
| [SORCERESS_ASSESSMENT.md](SORCERESS_ASSESSMENT.md) | Sorceress tool names and export workflow |
| [docs/sorceress-prompts/](docs/sorceress-prompts/) | Output directory for generated prompt batches |

---

## Existing Asset Keys (Do Not Conflict)

### Characters already defined in Player.ts
```
player-human-1, player-human-2, player-robot-blue,
player-wizard-purple, player-cat-orange, player-knight-silver
```
Frame spec: 96×96px, 4 cols × 4 rows, 16 frames total

### Tiles already defined in TilemapGenerator.ts
```
ground-grass-1, ground-grass-2, ground-grass-3,
ground-flowers-1, ground-flowers-2, ground-path, ground-dirt,
ground-water, wall-math-1, wall-science-1, wall-english-1, wall-brick-1
```
Tile size: 64×64px

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---------|-----|
| Sorceress generates 3 frames/row instead of 4 | Phaser's `start`/`end` frame numbers will be off — count actual frames in exported PNG |
| White box around character | Run Sorceress Background Remover before exporting |
| Asset key in `load.spritesheet()` doesn't match key in `Player` constructor | Keys must match exactly — `player-human-1` not `human-1` |
| New tile added to `TILE` but not `TILE_ASSET_KEYS` | TypeScript will error — `_TileCoverage` type enforces coverage |
| Frame dimensions wrong in prompt | Sorceress may round — always verify with Sprite Analyzer after generation |

---

> Also consult: `game-development/sprite-integration` (Phaser loading patterns), `game-development/game-art` (art principles), `game-development/2d-world-dev` (scene structure).
