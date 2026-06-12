# Gather-Style Campus (Alternative World)

Branch: `feature/campus-gather-style`

An alternative version of the campus world, styled after Gather.town: a
continuous 16-bit pixel map where characters **walk up and talk** to each
other instead of pressing a key to open dialogs.

It runs on the **same expanded 96×72 zoned campus** as the classic `/world`
(Nexus Plaza hub, Quantum Lab, Science Nexus, Chronicle Archive, Stellar
Commons — defined in `game/world/campusLayout.ts`), so both worlds share one
source of truth for zones, buildings, and NPCs. The Gather variant
(`GatherCampusScene`) extends `OpenWorldScene` and swaps the press-SPACE NPC
markers for walk-up-and-talk characters plus per-zone learning stations.

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
| Talking | Press SPACE near an NPC marker | **Automatic**: walk up → conversation starts, walk away → it ends |
| Dialogue UI | `WorldDialog` panel | In-canvas typewriter speech bubble + React chat panel |
| NPCs | Door-colored circles | Animated 16-bit character sprites with name tags + connection rings |
| Stations | Math Hall interior only | Per-zone walk-up stations across the overworld |

## Mechanics

- **Walk-up-and-talk**: every NPC has a connection ring (150px) and a talk
  radius (85px). Entering the talk radius auto-starts their dialogue; SPACE/E
  **or tap/click** advances lines; walking away (130px) ends it. Only one
  conversation at a time, with an exit latch so a finished conversation doesn't
  instantly restart. The six campus guides (Jaylen, Professor Ivy, Professor
  Numbers, Dr. Spark, Story Sage, Commons Host) come straight from
  `campusLayout.ts` — same characters and dialogue as the classic world.
- **Learning stations**: 13 arcade cabinets/desks spread across the four
  learning zones. SPACE/tap launches the game in the existing `AdventureEmbed`
  iframe; completion awards XP/coins via `/api/world/award`.
- **Quest board & shop**: the campus buildings and Professor Numbers' final
  dialogue line open the Job/Quest board and shop, same as `/world`.
- **Zone banners**: crossing a zone boundary fires `zone-changed` (from the
  inherited `ZoneManager`) and shows a neon banner with that zone's accent.
- **Buildings**: Math Hall's door still enters `MathBuildingScene`; its exit
  returns to whichever variant you came from.
- **Position persistence**: reuses `/api/character/update`; returning players
  respawn where they left off if their `lastScene` is `GatherCampusScene`.

## Key Files

- `game/scenes/GatherCampusScene.ts` — extends `OpenWorldScene`; swaps in
  TalkableNPCs + stations, keeps chunk streaming, zones, doors, collectibles
- `game/world/gatherPresentation.ts` — Gather presentation layer over the
  shared `campusLayout.ts`: character sprite + patrol per NPC, per-zone stations
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
