# Campus Demo — Art Asset Inventory

**Purpose.** Two questions this answers: *what art is in this repo, where did it
come from, and what is its licence?* — and *if we replace a pack, what breaks?*

Written to support two decisions: how widely the prototype can be shared, and
what to tell a game developer rebuilding this from scratch.

**Scope.** All 110 PNG files under `public/game-assets/`.

> **Status: §5's first and fifth recommendations have been applied.** The
> 36 unloaded files were deleted from `demo/la-campus-demo/`, taking that
> tree from 110 files / 50.7 MB to **74 files / 1.4 MB**, and the misleading
> header on `modernTiles.ts` was corrected. The root `public/game-assets/`
> still holds all 110. Everything measured below describes the state before
> that deletion, so the numbers still explain *why* it was done; §6 records
> what changed.

> **Method note.** Provenance below comes from the repo's own docs and git
> history — not from reading the vendors' licence text. The "measured" columns
> are from decoding the PNGs directly (dimensions, distinct colour values,
> byte size). Anything marked **unknown** is genuinely unrecorded, not merely
> unchecked. This is an engineering inventory, not legal advice.

---

## 1. The headline

The campus demo loads **74 files / 1.4 MB** of art.

The deployment ships **110 files / 50.7 MB**.

| | Files | Bytes | Share of bytes |
|---|---:|---:|---:|
| Loaded by the campus demo | 74 | 1.4 MB | 3% |
| Shipped but never loaded | **36** | **49.3 MB** | **97%** |

Everything under `public/` is served verbatim by Next.js, so all 110 files are
fetchable at a plain URL (`/game-assets/tilemaps/grass-plain-1.png` returns the
image itself) whether or not the game ever requests them.

**This is the single most actionable finding.** 97% of the art exposure, and
almost all of the unknown-provenance art, belongs to files the demo does not
use. They can be deleted from the demo tree without changing a single pixel of
what an investor sees.

---

## 2. Inventory by directory

### `modern/` — 8 files, 2 KB — *flat colour swatches*

| Recorded source | LimeZu, "Modern Interiors / Exteriors" |
|---|---|
| Recorded licence | Game use permitted; redistributing raw asset files **not** permitted |
| Where recorded | `game/world/modernTiles.ts:5-14`, `GATHER_ASSET_INTEGRATION_GUIDE.md:17-23` |
| Used by | `GatherCampusScene` — **live in the demo** |

**Measured, and this contradicts the record:**

| File | Size | Distinct RGBA values |
|---|---:|---:|
| `dirt.png` | 155 B | **1** |
| `grass.png` | 155 B | **1** |
| `water.png` | 155 B | **1** |
| `wall-red.png` | 374 B | 3 |
| `wall-blue.png` | 369 B | 5 |
| `wall-green.png` | 306 B | 6 |
| `wall-grey.png` | 249 B | 6 |
| `sidewalk.png` | 631 B | 6 |

`modernTiles.ts` says these were "prepared from the packs — terrain Singles
copied directly, wall faces cut from the Room Builder 3d-walls sheet." Three of
them are a **single solid colour** across 48×48 pixels, and the rest have at
most six. Whatever the intent, these files do not contain LimeZu artwork now.
They are flat placeholder tiles.

**Consequence:** the LimeZu redistribution warning attached to this directory
appears to be over-cautious for these 8 files specifically. Confirm by eye
before relying on it.

### `modern/props/` — 58 files, 116 KB — *pixel art props*

| Recorded source | Same LimeZu attribution as above |
|---|---|
| Measured | 7–79 distinct RGBA values per file; sizes 300 B – 16 KB; varied dimensions (48×48 up to 2112×144 animation strips) |
| Used by | `game/world/campusDecorations.ts`, whole directory loaded — **live in the demo** |

Genuine limited-palette pixel art — benches, trees, lockers, vending machines,
the clock tower, animated strips (fountain, flag, butterflies). Unlike the base
tiles, these are real artwork and the LimeZu attribution is plausible. **This is
the directory where the redistribution question actually bites**, and it is
visible in every screenshot of the demo.

### `rcc/` — 3 files, 21 KB — *pixel art spritesheets, currently inactive*

| Recorded source | "RCC apartment pack" |
|---|---|
| Recorded licence | **None — the pack shipped without a licence file** (`GATHER_ASSET_INTEGRATION_GUIDE.md:21`) |
| Measured | 384×768, ~20 distinct colours each |
| Used by | `game/world/rccTiles.ts`, gated on `CAMPUS_ART === 'rcc'` |

`GatherCampusScene.ts:38` currently sets `CAMPUS_ART = 'modern'`, so **none of
these three files is loaded by the live demo.** One of the three
(`exterior-a5b.png`) is referenced nowhere in the codebase at all.

No licence file means no grant by default. Worth chasing or replacing
regardless of how the demo is gated — but note it costs nothing today, because
nothing uses it.

### `sprites/` — 6 files, 116 KB — *character spritesheets*

| Recorded source | **Unknown** — see §3 |
|---|---|
| Measured | 384×384, ~20 distinct colours each (pixel art) |
| Used by | `CharacterCreator`, `ConversationPanel`, `WelcomeOverlay`, `OpenWorldScene`, `WorldScene`, `MathBuildingScene` — **live in the demo** |

`cat-orange`, `human-1`, `human-2`, `knight-silver`, `robot-blue`,
`wizard-purple`. These are the playable characters and the faces on the pop-up
cards. Prominent, and of unrecorded origin.

### `tilemaps/` — 35 files, 50.4 MB — *high-colour 1024×1024 images*

| Recorded source | **Unknown** — see §3 |
|---|---|
| Measured | Every file 1024×1024. 32 of 35 carry **4,000–58,000 distinct colours** in their top 160 rows alone, at 1–2.3 MB each |
| Used by | 2 files in the campus demo; the rest only by scenes the demo does not expose |

Colour counts in the tens of thousands at 1024×1024 mean these are **not pixel
art tiles**. They are photographic or generated textures. That matters twice
over: it is a different licensing question from a pixel-art pack, and it is why
50 MB of a 50.7 MB asset tree sits in one directory.

Three files are the exception and look like pixel art: `arcade-cabinet.png`
(618 colours), `npc-teacher.png` (169), `desk-computer.png` (133).

**Only two of the 35 are loaded by the campus demo:** `arcade-cabinet.png` and
`desk-computer.png`.

---

## 3. The provenance gap

`sprites/` and `tilemaps/` — 41 files, 50.5 MB, including every character the
player can be — entered the repo in commit `ce35a4e` (2026-03-12). The entire
commit message is:

```
Updated assets
```

No source, no pack name, no licence, no URL. `GATHER_ASSET_INTEGRATION_GUIDE.md`
describes *how to go and download* tilesets from itch.io collections but never
records which one was actually used.

**A licence you cannot identify cannot be cleared.** This is a larger unknown
than the two named packs, and it covers the more prominent art — the characters
and, for the non-demo scenes, all the ground and buildings.

Resolving it means either finding the original download, or replacing the files.
Given the plan to rebuild, replacing is likely cheaper than archaeology.

---

## 4. What breaks if a pack is swapped

Only `GatherCampusScene` is reachable in the deployed demo — its routes are `/`
and `/dev/campus-sandbox` only. The other scenes exist in the codebase and ship
their assets, but have no route.

| Scene / component | Route | Reachable in demo? | Art it depends on |
|---|---|---|---|
| `GatherCampusScene` | `/dev/campus-sandbox` | **Yes** | `modern/` (8), `modern/props/` (58), `sprites/` (6), `tilemaps/arcade-cabinet` + `desk-computer` |
| `WorldScene` | `/world` | No | 18 `tilemaps/` files + all `sprites/` |
| `OpenWorldScene` | `/world` (open variant) | No | 14 `tilemaps/` files + all `sprites/` |
| `MathBuildingScene` | math building interior | No | 11 `tilemaps/` files + all `sprites/` |
| `CharacterCreator` | `/world/create` | No | all 6 `sprites/` |

**So: replacing all 35 `tilemaps/` files would change nothing an investor sees
except the arcade cabinet and the desk computer.** Replacing `modern/props/` or
`sprites/` would visibly change the demo.

The swap mechanism is already built. `GATHER_ASSET_INTEGRATION_GUIDE.md:38-52`
documents it: textures are loaded under stable keys (`ground-grass-1..3`,
`wall-math-1`, `ground-path`, …) and a replacement pack is wired in by loading
new files under the same keys — no change to the map generator.

### Files referenced nowhere in the demo codebase — 12 files, 16.3 MB

`grass-flowers-3`, `dirt-earth-2`, `science-building-2`, `science-building-3`,
`english-building-2`, `english-building-3`, `stone-path-2`, `stone-path-3`,
`stone-floor-2`, `stone-floor-3`, `water-2` (all `tilemaps/`), and
`rcc/exterior-a5b.png`.

Deletable today with no code change at all.

---

## 5. Recommendations

**1. Delete the 36 unloaded files from the demo tree.** Removes 49.3 MB — 97% of
the deployed art — and with it most of the unknown-provenance exposure, without
altering a pixel of the demo. Keep them in the root tree if the `/world` scenes
are still wanted there.

**2. Treat `modern/props/` and `sprites/` as the real question.** They are small
(174 KB combined), live, and visible. `props` carries a named pack with a stated
no-redistribution term; `sprites` has no recorded origin at all.

**3. Chase or drop RCC.** No licence file, and nothing currently loads it.
Deleting the 3 files costs nothing while `CAMPUS_ART = 'modern'`.

**4. For the rebuild brief, say this plainly:**

> Do not carry over `public/game-assets/`. The prototype's art is a mix of
> licensed-for-use-but-not-redistribution pixel art and files of unrecorded
> origin. Source original, commissioned, or CC0 art (e.g. Kenney's CC0 packs,
> already noted in `GATHER_ASSET_INTEGRATION_GUIDE.md`) and load it under the
> existing texture keys.

**5. Correct `game/world/modernTiles.ts:5-14`**, which describes the 8 base
tiles as cut from LimeZu sheets when they are flat colour swatches.

---

## Appendix — every file

### `modern/` (8)
`dirt.png` · `grass.png` · `sidewalk.png` · `wall-blue.png` · `wall-green.png` ·
`wall-grey.png` · `wall-red.png` · `water.png`

### `modern/props/` (58)
`anim-butterfly-1` · `anim-butterfly-2` · `anim-canteen-fridge` ·
`anim-control-screens` · `anim-fountain` · `anim-pendulum-clock` ·
`anim-school-flag` · `basketball-1` · `basketball-2` · `basketball-court` ·
`basketball-net` · `bench` · `book-stand` · `bookcase-1` · `bookcase-2` ·
`bookcase-narrow` · `cafe-table` · `chalkboard` · `checkout-desk` ·
`clock-tower` · `corkboard` · `display-pedestal-1` · `display-pedestal-2` ·
`drinking-fountain` · `flower-bush-1` · `flower-bush-2` · `flower-pot` ·
`food-tray` · `fountain` · `globe` · `grate` · `hydrant` · `lab-desk-1` ·
`lab-desk-2` · `lab-plant` · `lab-robot` · `library-ladder` · `locker` ·
`manhole-1` · `manhole-2` · `poster-art` · `potted-plant-1` ·
`potted-plant-2` · `school-desk` · `school-flag` · `shrub-1` · `shrub-2` ·
`snack-fridge` · `specimen-shelf` · `stadium-light` · `stands` · `stool` ·
`street-lamp` · `tree-1` · `tree-2` · `vending-1` · `vending-2` · `world-map`

### `rcc/` (3)
`exterior-a5.png` · `exterior-a5b.png` *(unreferenced)* · `interior-a5.png`

### `sprites/` (6)
`cat-orange.png` · `human-1.png` · `human-2.png` · `knight-silver.png` ·
`robot-blue.png` · `wizard-purple.png`

### `tilemaps/` (35) — **bold** = loaded by the campus demo
**`arcade-cabinet`** · `brick-wall-1` · `brick-wall-2` · `brick-wall-3` ·
**`desk-computer`** · `dirt-earth-1` · `dirt-earth-2`* · `door-interior` ·
`english-building-1` · `english-building-2`* · `english-building-3`* ·
`grass-flowers-1` · `grass-flowers-2` · `grass-flowers-3`* · `grass-plain-1` ·
`grass-plain-2` · `grass-plain-3` · `math-wall-1` · `math-wall-2` ·
`math-wall-3` · `npc-teacher` · `science-building-1` · `science-building-2`* ·
`science-building-3`* · `stone-floor-1` · `stone-floor-2`* · `stone-floor-3`* ·
`stone-path-1` · `stone-path-2`* · `stone-path-3`* · `water-1` · `water-2`* ·
`wood-floor-1` · `wood-floor-2` · `wood-floor-3`

`*` = referenced nowhere in the codebase.

---

## 6. What was applied

Recommendations 1 and 5 were carried out; the rest remain open decisions.

**Deleted from `demo/la-campus-demo/` only** — 36 files, 49.3 MB:

- 33 of the 35 `tilemaps/` files. `arcade-cabinet.png` and `desk-computer.png`
  stay, because `GatherCampusScene` loads them.
- all 3 `rcc/` files, together with `game/world/rccTiles.ts` and the `'rcc'`
  branch of `CAMPUS_ART` in `GatherCampusScene.ts`. Deleting the files while
  leaving code that loads them would have been a trap, so both went together.
  `CAMPUS_ART` is now `'procedural' | 'modern'` in this tree.

The root `public/game-assets/` is untouched and still has all 110 files, so
nothing is lost — the `/world` scenes there keep working, and the demo can
restore any file from it.

**Verified after the deletion:** `tsc --noEmit` clean in both trees, root lint
0 errors / 6 warnings, 21 test files / 70 tests passing.

**One trap left deliberately, and signposted.** `OpenWorldScene` and
`MathBuildingScene` still exist in the demo tree and still reference tilemap
paths that are now absent there. They cannot run — `game/main.ts` only
registers them for the non-`gather` variant, and both of the demo's routes
(`/` and `/dev/campus-sandbox`) use `variant="gather"`. A comment at that
switch in `game/main.ts` says so, and says to restore the files from the root
tree before wiring up a route that renders them. Deleting those scenes
outright was out of scope here.

**Still open:** recommendations 2 (`modern/props/` and `sprites/` are the live,
visible art and the real licensing question), 3 (chase or drop RCC in the root
tree too), and 4 (the wording for the rebuild brief).
