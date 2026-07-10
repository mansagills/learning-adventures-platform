# Sorceress.games — Platform Assessment for Learning Adventures

**Date:** March 2026
**Platform:** [sorceress.games](https://sorceress.games) / [sorceress.gamemaker.academy](https://sorceress.gamemaker.academy)
**Status:** Signed up, API keys connected

---

## What Sorceress.games Is

Sorceress is a **browser-based game creation suite** designed as a companion to local IDEs (VS Code, Cursor, Windsurf). It is NOT a general-purpose web app framework — it is specifically optimized for **browser-based HTML/JS game development**.

**Core capabilities:**

| Area | What It Does |
|---|---|
| AI Coding Agent | Write, edit, debug HTML/JS game code in-browser with AI assistance |
| Asset Processing | Sprite sheet creation, background removal, animation extraction, image slicing |
| AI Generation | Text-to-image art, animated pixel art sprites, seamless tilesets/textures, video→animation |
| Audio Editing | Trim, fade, volume adjust, export clean SFX clips |
| Game Preview | Live preview with device size simulation (iframe-based) |
| Publishing | Sorceress Play Arcade + GitHub Pages deployment |

**Pricing:** $49 lifetime (early supporter). Uses your own API keys — no markup on AI generation.

**Important architectural note:** Sorceress works as a *local companion tool* alongside your IDE. It does NOT replace Claude Code or the Next.js development workflow.

---

## Fit Assessment: Learning Adventures Platform

### ✅ HIGH FIT — Mini-Game Development (HTML files)

The 34 games in `public/games/` and 7 lessons in `public/lessons/` are **exactly** what Sorceress is built for:

- Standalone HTML files with embedded CSS + JavaScript
- Child-friendly interactive elements
- Games like `counting-carnival.html`, `crystal-cave-chemistry.html`, etc.

**How Sorceress helps here:**
1. **AI coding agent** — Rapidly prototype new HTML game files, iterate on game logic, debug issues
2. **Live preview** — Test games at various device sizes without manually copying to `public/games/`
3. **Asset generation** — Create sprite sheets, pixel art characters, and background images for game visuals
4. **Audio** — Generate/edit sound effect clips for game feedback
5. **Phaser 3 support** — If upgrading simple HTML games to use the Phaser framework for more complex mechanics

**Workflow:**
```
Design game in Sorceress → Test with preview → Export HTML →
Copy to public/games/ → Add to catalogData.ts via Claude Code
```

---

### ✅ MODERATE FIT — Game Asset Pipeline

Even for games developed with Claude Code directly, Sorceress's asset tools add value:
- Generate character/icon art for games (text-to-image)
- Convert video clips to sprite sheets
- Remove backgrounds from assets
- Create seamless tilesets for side-scrolling or tile-based games

---

### ❌ LOW FIT — Main Next.js App

Sorceress **cannot help** with:
- Next.js app infrastructure (routing, layouts, components)
- Authentication (NextAuth.js), database (Prisma/PostgreSQL), API routes
- TypeScript/React component games (`components/games/`)
- The progress tracking system, achievement system, user dashboard
- Catalog integration (`lib/catalogData.ts`)

This work stays in **Claude Code** as the primary tool.

---

### ❌ LOW FIT — React Component Games

The two React component games (`sample-math-game`, `ecosystem-builder`) use TypeScript, shared hooks, and the Next.js component system. Sorceress's coding agent is for vanilla HTML/JS, not React/TypeScript.

---

## Recommended Integration Strategy

### Two-Track Development Workflow

**Track 1: Main App → Claude Code (current workflow)**
- Next.js infrastructure, auth, database, API routes
- React component games
- Catalog system, progress tracking, achievements
- All TypeScript/React work

**Track 2: New Mini-Games → Sorceress + Claude Code**
- Use Sorceress's AI coding agent to rapidly build new HTML mini-games
- Use Sorceress asset tools to generate sprites/audio/backgrounds for game content
- Export finished HTML files → drop into `public/games/` or `public/lessons/`
- Use Claude Code to add catalog metadata in `catalogData.ts`

### Game Creation with Sorceress: Practical Steps
1. Start new game project in Sorceress cloud workspace
2. Use AI coding agent to generate the game HTML (describe the game mechanic + subject)
3. Use asset generation for any images/sprites needed
4. Preview and test in Sorceress's device simulator
5. Export/copy the final `index.html` content
6. Save as `public/games/[game-name].html` in the Learning Adventures app
7. Register in `catalogData.ts` (Claude Code handles this)

---

## Key Limitations to Know

1. **No direct Next.js awareness** — Sorceress doesn't know about your catalog, routes, or `htmlPath` conventions. You'll need to manually integrate exported games.
2. **Cloud vs. local** — Sorceress uses cloud project storage; your main app is local. These are separate environments.
3. **Phaser 3 specificity** — Some visual effect tools are Phaser 3-specific. Your current mini-games use vanilla JS, so this would require a framework migration if you want those features.
4. **No TypeScript** — Not suitable for React/TypeScript component games.
5. **API key cost** — AI generation uses your own API keys, so image/video generation will have direct costs.

---

## The 2D Top-Down Game World (Phaser 3 Campus)

This is the **highest-value use case for Sorceress** — and it's already partially in progress.

### What's Being Built
A Stardew Valley / Necesse-style **top-down pixel art school campus** in Phaser 3 where students:
- Explore campus, walk between subject buildings
- Enter buildings to play embedded mini-games
- Earn XP and coins from adventures and daily jobs
- Buy cosmetics/items from an in-game shop

### Current Implementation Status (partially built)

| File | Status |
|---|---|
| `game/main.ts` | ✅ Phaser 3 config, arcade physics (top-down) |
| `game/scenes/WorldScene.ts` | ✅ Campus with placeholder tiles |
| `game/scenes/MathBuildingScene.ts` | ✅ Math building interior skeleton |
| `game/entities/Player.ts` | ✅ WASD movement, collision, position saving |
| `game/entities/Door.ts` | ✅ Interactive door system |
| `game/entities/NPC.ts` | ✅ NPC base system |
| `components/phaser/PhaserGame.tsx` | ✅ React/Phaser bridge |
| `components/phaser/EventBus.ts` | ✅ React ↔ Phaser event bridge |
| `app/world/page.tsx` | ✅ Auth-gated world page with HUD |

### What Still Needs Assets (Phase 2–6)
- 8–12 character sprite sheets (16×32 or 32×32 px, 4-direction walk animations)
- Campus tileset (grass, dirt paths, building exterior tiles)
- Building interiors (Math, Science, English, History floor/wall tiles)
- NPC sprites (Math Teacher, Cafeteria Worker, etc.)
- Shop item icons and cosmetic overlays
- Decorative environment elements (trees, benches, signs)
- Particle effects (XP gain, level-up, sparkles)

### Sorceress Tools for the 2D World

This is where Sorceress shines most — it has **Phaser 3-specific tooling**:

| Sorceress Tool | Use for 2D World |
|---|---|
| **Spritely** | Generate character sprite sheets with 4-direction walk cycles |
| **ImGen** | AI-generate building exteriors, NPC portraits, campus art |
| **Tileset Generator** | Create seamless grass, path, and floor tile textures |
| **Sprite Analyzer** | Upload generated spritesheets → detect animation frames → extract frame data for Phaser |
| **Slicer** | Slice spritesheets into individual frames for Phaser animation config |
| **Phaser 3 Effects Editor** | Design particle effects (XP gain, sparkles, level-up) directly for Phaser 3 |
| **Audio Editor** | Create/edit SFX for footsteps, door opens, item pickups, level-up jingles |
| **Background Removal** | Clean up generated character art for transparent PNG sprites |

**Critical advantage:** The Sprite Analyzer + Slicer pipeline directly produces the frame data Phaser 3's `this.anims.create()` needs — cutting out manual sprite sheet configuration work.

### Asset Pipeline for 2D World

```
ImGen / Spritely (generate art)
       ↓
Background Remover (clean sprites to transparent PNG)
       ↓
Sprite Analyzer (detect grid, preview animations)
       ↓
Slicer (extract frames)
       ↓
Export as PNG spritesheet + JSON frame data
       ↓
Load into Phaser via game/scenes/WorldScene.ts
```

### Specific Asset Needs × Sorceress Tools

**Character sprites** (Phase 2 priority)
- Use Spritely or ImGen to generate 8–12 child character designs
- 32×32 px pixel art, 4-direction, 3-frame walk cycle each
- Sprite Analyzer confirms frame layout before import into Phaser

**Campus tileset** (Phase 2 priority)
- Use Tileset Generator for: grass base tile, dirt path tile, building wall tile, building floor tile
- Seamless AI texture generation ensures tiles connect properly
- Export as a single tileset PNG for Phaser Tilemaps

**NPC sprites** (Phase 3)
- Math Teacher, Cafeteria Worker, Shop Owner
- Same pipeline as character sprites

**Building art** (Phase 3)
- ImGen for building facade art (Math building = calculator motif, Science = beaker motif, etc.)
- Used as decorative overlays on placeholder tile buildings

**Particle effects** (Phase 6)
- Phaser 3 Effects Editor directly exports JSON configs usable in Phaser's particle system
- XP gain burst, level-up fireworks, sparkle trails

---

## Verdict

**Sorceress adds value across three distinct areas of Learning Adventures:**

| Area | Value | Primary Sorceress Tools |
|---|---|---|
| **2D Campus World (Phaser 3)** | ⭐⭐⭐ HIGHEST | Spritely, ImGen, Tileset Generator, Sprite Analyzer, Slicer, Effects Editor |
| **HTML Mini-Games** | ⭐⭐ HIGH | AI Coding Agent, Live Preview, ImGen, Audio Editor |
| **Main Next.js App** | ⭐ N/A | Not applicable |

**The $49 lifetime cost is clearly justified** — Sorceress directly addresses the most asset-intensive upcoming phase (2D game world) and accelerates the ongoing mini-game content pipeline.

### Clean Division of Labor Going Forward

| Work | Primary Tool |
|---|---|
| 2D world code (Phaser scenes, entities, React bridge) | Claude Code |
| 2D world assets (sprites, tilesets, effects, audio) | **Sorceress** |
| New HTML mini-games (creation + iteration) | Sorceress + Claude Code |
| Catalog integration (`catalogData.ts`) | Claude Code |
| Next.js app infrastructure | Claude Code |

---

## Key Files Referenced

| File | Description |
|---|---|
| `game/main.ts` | Phaser 3 configuration |
| `game/scenes/WorldScene.ts` | Campus scene (placeholder tiles, needs real tileset) |
| `game/scenes/MathBuildingScene.ts` | Math building interior |
| `game/entities/Player.ts` | Player movement and controls |
| `components/phaser/PhaserGame.tsx` | React/Phaser bridge |
| `components/phaser/EventBus.ts` | React ↔ Phaser event communication |
| `app/world/page.tsx` | Auth-gated world route with HUD |
| `2D_GAME_WORLD_PLAN.md` | Full 833-line spec for 2D campus world |
| `public/games/` | 34 HTML mini-game files |
| `public/lessons/` | 7 HTML lesson files |
| `lib/catalogData.ts` | Catalog metadata (Claude Code managed) |
