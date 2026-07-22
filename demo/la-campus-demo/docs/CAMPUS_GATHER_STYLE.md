# Gather-Style Campus (Alternative World)

Branch: `feature/campus-gather-style`

An alternative version of the campus world, styled after Gather.town: a
continuous 16-bit pixel map where characters **walk up and talk** to each
other instead of pressing a key to open dialogs.

It runs on the **same expanded 96×72 zoned campus** as the classic `/world`
(Nexus Plaza hub, Quantum Lab, Science Nexus, Chronicle Archive, Stellar
Commons — defined in `game/world/campusLayout.ts`), so both worlds share one
source of truth for zones and NPCs. The Gather variant (`GatherCampusScene`)
extends `OpenWorldScene` and Gather-ifies it:

- **Open walk-in buildings.** Instead of doors that teleport to interior
  scenes, the four learning buildings are **open rooms carved into the map**
  (perimeter walls + a 2-tile doorway + stone floor). You walk in and out
  seamlessly — no scene transitions, no loading. Each room holds that
  subject's learning stations and its host NPC.
- **Walk-up-and-talk NPCs** with animated sprites replace the press-SPACE
  markers.
- **Math Hall** contains the full Math Lab game set (Pizza Fractions, Math
  Race Rally, Multiplication Bingo, Number Monsters, Math Jeopardy) and
  **Professor Numbers**, the quest giver: finishing his dialogue opens the
  Quest Board to start the Math Race Rally quest (100 XP + Math Explorer
  badge), exactly as in the classic world's `MathBuildingScene` — but inline,
  no interior scene.

## How to Test

1. `npm run dev`
2. Log in (e.g. `student@test.com` / `password123`) and create a character if
   prompted.
3. Visit **http://localhost:3000/world/campus** (or click the **🏫 Campus**
   button in the classic world HUD).

No-auth sandbox (development only, renders nothing in production):
**http://localhost:3000/dev/campus-sandbox** — mounts the scene without
login/character so the mechanics can be tested in isolation. Exposes
`window.__campusTest` (position, conversation, adventure, `move(x, y)`) for
automated browser tests.

## What's Different from `/world`

Both worlds use the **same** 96×72 zoned map; only the interaction layer differs.

| | `/world` (open world) | `/world/campus` (Gather-style) |
|---|---|---|
| Map | 96×72 chunked zoned campus | **same** 96×72 chunked zoned campus |
| Buildings | Doors teleport to interior scenes | **Open rooms you walk into** — no scene change |
| Talking | Press SPACE near an NPC marker | **Automatic**: walk up → conversation starts, walk away → it ends |
| Dialogue UI | `WorldDialog` panel | In-canvas typewriter speech bubble + React chat panel |
| NPCs | Door-colored circles | Animated 16-bit character sprites with name tags + connection rings |
| Stations | Math Hall interior scene only | Inside every open room (Math Hall games included inline) |

## Mechanics

- **Walk-up-and-talk**: every NPC has a connection ring (150px) and a talk
  radius (85px). Entering the talk radius auto-starts their dialogue; SPACE/E
  **or tap/click** advances lines; walking away (130px) ends it. Only one
  conversation at a time, with an exit latch so a finished conversation doesn't
  instantly restart. The six campus guides (Jaylen, Professor Ivy, Professor
  Numbers, Dr. Spark, Story Sage, Commons Host) come straight from
  `campusLayout.ts` — same characters and dialogue as the classic world.
- **Open walk-in rooms**: the four learning buildings are carved into the map
  as hollow rooms (`carveGatherRooms`) — perimeter walls (with collision), a
  stone floor, and a 2-tile doorway. Walls block; only the doorway passes.
  Each room's host NPC and stations live inside.
- **Learning stations**: 14 arcade cabinets/desks placed inside the rooms
  (5 in Math Hall, 4 in Discovery Lab, 3 in Story Grove, 2 in The Commons).
  SPACE/tap launches the game in the existing `AdventureEmbed` iframe;
  completion awards XP/coins via `/api/world/award`.
- **Quest loop**: Professor Numbers (in Math Hall) gives the Math Race Rally
  quest; his final dialogue line opens the Quest Board (`open-job-board`),
  which runs the same `/api/jobs/*` flow as the classic world. Math Race Rally
  is also a station inside the room for direct play.
- **Quest board & shop**: open via the hub Quest Board building, the shop
  inside The Commons, and Professor Numbers' final line — same events as
  `/world`.
- **Zone banners**: crossing a zone boundary fires `zone-changed` (from the
  inherited `ZoneManager`) and shows a neon banner with that zone's accent.
- **Position persistence**: reuses `/api/character/update`; returning players
  respawn where they left off if their `lastScene` is `GatherCampusScene`.

## Key Files

- `game/scenes/GatherCampusScene.ts` — extends `OpenWorldScene`; carves open
  rooms (`generateMap`), suppresses teleport doors (`createBuildingInteractable`),
  swaps in TalkableNPCs + in-room stations; keeps chunk streaming, zones,
  collectibles
- `game/world/gatherPresentation.ts` — Gather presentation layer over the
  shared `campusLayout.ts`: open-room geometry + carving, character sprite and
  in-room placement per NPC, and the in-room stations
- `game/scenes/OpenWorldScene.ts` — base scene, made subclass-friendly with
  `generateMap()` and `createBuildingInteractable()` hooks
- `game/entities/TalkableNPC.ts` — proximity conversation entity
- `game/world/campusLayout.ts` — shared zone/building/NPC source of truth
  (from the merged zone branch; used by both world variants)
- `components/world/ConversationPanel.tsx` — React chat panel
- `app/world/campus/page.tsx` — the route (zone banner, minimap, quest board)
- `game/main.ts` — `createPhaserGame(parent, bootstrap, variant)` selects the
  scene list (`'open'` default, `'gather'` for this world)

## Note on Assets

`public/game-assets` was a broken symlink to a machine-specific macOS path.
The real assets were moved from `game/assets/` into `public/game-assets/` so
sprites and tiles load on every platform (and on Vercel).
