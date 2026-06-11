# Gather-Style Campus (Alternative World)

Branch: `feature/campus-gather-style`

An alternative version of the campus world, styled after Gather.town: one
continuous 16-bit pixel map where characters **walk up and talk** to each
other instead of pressing a key to open dialogs.

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

| | `/world` (open world) | `/world/campus` (Gather-style) |
|---|---|---|
| Map | 96×72 chunked open world | 40×30 continuous campus, open-front buildings |
| Buildings | Doors teleport to interior scenes | Walk straight into rooms — no scene changes |
| Talking | Press SPACE near an NPC | **Automatic**: walk up → conversation starts, walk away → it ends |
| Dialogue UI | (unwired) | In-canvas typewriter speech bubble + React chat panel |
| NPCs | Colored circles | Animated 16-bit character sprites with name tags |

## Mechanics

- **Walk-up-and-talk**: every NPC has a connection ring (150px) and a talk
  radius (85px). Entering the talk radius auto-starts their dialogue; SPACE/E
  **or tap/click** advances lines; walking away (130px) ends it. Only one
  conversation at a time, with an exit latch so a finished conversation doesn't
  instantly restart.
- **Learning stations**: 13 arcade cabinets/desks across Math Hall, Discovery
  Lab, Story Grove, and The Commons. SPACE launches the game in the existing
  `AdventureEmbed` iframe; completion awards XP/coins via `/api/world/award`.
- **Merchant Mo** (The Commons) opens the shop when you finish his dialogue.
- **Position persistence**: reuses `/api/character/update`; returning players
  respawn where they left off if their `lastScene` is `GatherCampusScene`.

## Key Files

- `game/world/GatherCampusMap.ts` — map data, NPC and station definitions
  (IDs follow `docs/CAMPUS_V1_POINT_CLICK_SPEC.md` zone naming)
- `game/entities/TalkableNPC.ts` — proximity conversation entity
- `game/scenes/GatherCampusScene.ts` — the scene
- `components/world/ConversationPanel.tsx` — React chat panel
- `app/world/campus/page.tsx` — the route
- `game/main.ts` — `createPhaserGame(parent, bootstrap, variant)` selects the
  scene list (`'open'` default, `'gather'` for this world)

## Note on Assets

`public/game-assets` was a broken symlink to a machine-specific macOS path.
The real assets were moved from `game/assets/` into `public/game-assets/` so
sprites and tiles load on every platform (and on Vercel).
