# World theme layer (`src/kit/worlds/`)

The game worlds from `docs/GAME_WORLDS_PROPOSAL.md`. **A world is a style; a
setting is a place inside it.** A game picks one world and one setting.

| World | Pixels per tile | Characters | Settings so far |
|---|---|---|---|
| Sunny Town | 16 | classic (16x24) | none here: the eight finished Math games keep their own scene code, unchanged |
| Star Station | 24 | 16-bit (24x36) | `station-deck`, `alien-planet` |
| Ancient Kingdoms | 24 | 16-bit (24x36) | `river-market`, `roman-forum` |

## What is in each file

| File | What it does |
|---|---|
| `styles.ts` | The three world styles: pixels per tile, character type, day and evening light, glow colors, talk-box accent, theme music |
| `types.ts` | `WorldStyle`, `Setting`, `SettingScene`, `SceneCtx` |
| `index.ts` | The list of settings (`SETTINGS`, `settingById`, `settingsIn`) and everything a game imports |
| `shade.ts` | The 16-bit painter: 5 hue-shifted shades per color, shapes lit from the top left, soft seams, colored outlines |
| `hero16.ts` | 24x36 children and 24x42 adults in four directions, a 4-frame walk and a blink, and 72x72 portraits with four moods |
| `stage.ts` | The 45-degree pixel camera with a pixels-per-tile setting (the kit's own renderer stays at 16 for Sunny Town), plus billboards, glows, light pools and shadows at any pixel size |
| `figure.ts`, `place.ts` | A standing character with frames, and shortcuts for placing props |
| `walker.ts` | `Walker16`: a walking 16-bit character (four directions, a 4-frame walk, blinking, the "!" and "?" markers), the new worlds' version of the kit's `Actor` |
| `worlds.css` | The talk-box accent for each world (the parchment panel itself never changes) |
| `star-station/` | `art.ts` (the station palette and deck props), `deck.ts`, `planet.ts` |
| `ancient-kingdoms/` | `art.ts` (the world palette, the shared sky and the Mali horizon), `market.ts`, `forum.ts` |

## Using a setting in a game

```ts
import * as THREE from 'three';
import { Lighting } from '../../kit/world/sceneKit';
import { Figure, Stage, WORLD_STYLES, paintHero, settingById } from '../../kit/worlds';
import '../../kit/worlds/worlds.css';

const setting = settingById('roman-forum');
const style = WORLD_STYLES[setting.world];
document.body.classList.add(style.panelClass);

const stage = new Stage(host, style.px);
const ctx = { scene: new THREE.Scene(), lighting: new Lighting(), px: style.px, time: 'day' as const };
const built = setting.build(ctx);
stage.renderer.setClearColor(new THREE.Color(built.clear), 1);
ctx.lighting.set(style.tint.day, 0);

const frames = [paintHero(myPlayer, 1.5, 'down'), paintHero(myPlayer, 1.5, 'down', { blink: true })].map((b) => b.toCanvas());
const player = new Figure(ctx, frames, built.spots.player.x, built.spots.player.y);
// each frame: built.update(seconds, stage.target.x); stage.render(ctx.scene);
```

For the evening, use `style.tint.evening` and `ctx.lighting.set(tint, 1)`; that also
turns on every glow (neon, torches, crystals). Register the world's music
with `audio.addSong(style.id, style.music)`.

## A walking game in a 16-bit world

Forum Fraction Feast (`src/games/pizza-fraction-frenzy/world.ts`) is the
model; Multiplication Space Quest's deck (`src/games/multiplication-space-quest/world.ts`)
does the same in Star Station. The settings with walking pieces are `roman-forum` and
`station-deck` (the deck can also leave out its drone: `omit: ['drone']`). The pieces:

- `Walker16(ctx, look, x, y)` for the player and the people, with
  `look16FromAppearance(appearance)` turning the customize screen's choices
  into a 16-bit player.
- The setting's `walk` (where walking is allowed) and `blocks` (solid
  footprints) to fill the kit's `CollisionGrid`, and `omit: ['braziers']` in
  the `SceneCtx` when the game draws something itself (it lights its own
  braziers one by one).
- `Stage.maxTilesTall` (off by default) caps how many rows show top to
  bottom; Multiplication Space Quest sets it to 24 so a tall phone never sees
  past the station deck.
- `Stage.lookAt(x, y, false, smooth)` to follow the player, and
  `Stage.screenToTile` / `Stage.project` for tap-to-walk and labels.
- `openCustomize(..., { paint, only: { hairStyle: HAIR16 }, hide: ['accessory'] })`
  so the character creator shows the 16-bit player and only the hair styles
  it can draw.

## Adding a setting

1. Make `<world>/<place>.ts`. Paint everything with `Paint` and `ramp` from
   `shade.ts`, and take sizes from `T` (pixels per tile; designs are written at
   16 per tile and scaled by `u = T / 16`). Reuse the world's palette in its
   `art.ts`, the world's glow colors and, for Ancient Kingdoms,
   `paintAncientSky` with your own horizon.
2. Export a `Setting` with `inspiredBy`, plus `sources` for anything historical,
   and add it to `SETTINGS` in `index.ts`.
3. Add it to `tests/worlds.test.ts` and to the look development pages
   (`src/lookdev/nav.ts`, `cast.ts`), then check it day and evening with
   `node scripts/lookdev-shots.mjs`.

Keep the style: no new pixel sizes, no flat black outlines, and the world's
own light and glow colors.
