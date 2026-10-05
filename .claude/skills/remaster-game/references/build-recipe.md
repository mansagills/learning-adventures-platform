# Build recipe

All code lives in `games-src/adventures/` (one Vite + TypeScript project).
Its README describes every game and script. Read the section about the
reference game you're copying.

## Contents

1. Files for a new game
2. The Adventure Kit, part by part
3. Order of work
4. Patterns to copy
5. Layout and art gotchas (learned the hard way)

## 1. Files for a new game

```
games-src/adventures/<slug>/index.html          entry page (auto-discovered by vite.config.ts)
games-src/adventures/src/games/<slug>/
  main.ts        fonts + kit.css + <game>.css, then new Game(host).start(), with a WebGL fallback message
  problems.ts    pure learning logic (no DOM): generators, choices with misconceptions, diagnosis helpers
  content.ts     every word: people, intros, debriefs, mistake lines, hints, praise, GROWNUPS
  art.ts         PixelBuffer painters: ground, buildings, props, sidekick + portrait, icons
  world.ts       the Three.js scene: map, collision, people (Actor), targets, camera, walkTo/nearest/update
  game.ts        the flow: title → customize → opening → world ↔ panels → finale; HUD, job list, grown-ups, debug hooks
  save.ts        the save type, freshSave(), cleanSave() (validates every field) and a SaveStore with a unique key
  music.ts       2–3 Song objects
  pix.ts         copy as is (pixel picture → <img>, cached)
  <game>.css     the panel, choices, HUD and game-specific styles, with a 640 px phone block
games-src/adventures/tests/<short>-problems.test.ts
games-src/adventures/scripts/e2e-<slug>.mjs and <short>-tour.mjs
```

`.claude/skills/remaster-game/scripts/new-game.sh <slug> <reference-slug> "<Title>"`
creates the folders. It copies `index.html`, `main.ts`, `pix.ts` and a
renamed CSS file from the reference game, so you start from working
boilerplate. Every other file you write fresh, using the reference game's
files as the model.

## 2. The Adventure Kit (`src/kit/`), part by part

- **render/pixelRenderer.ts**: `PixelRenderer(host)`. 45° orthographic
  camera, constant `K` (√2) for vertical scale, `PX = 16` pixels per tile.
  Main calls: `setBounds(w, h)`, `lookAt(x, y, lerp)` (clamped to the map),
  `project`, `screenToTile`, `render`. Sprite heights are multiplied by `K`.
- **world/sceneKit.ts**: `Lighting` (tint plus night), `billboard(L, canvas,
  x, y)`, `pixelTexture`, `glowSprite`, `lightPool`, `blobShadow`.
- **world/actor.ts**: `Actor(L, look, x, y, facing)` walks and animates,
  with `setMarker('new' | 'turnin' | null)` for the sign over the head and
  `setLook`.
- **world/walk.ts**: `CollisionGrid(w, h)` with `block`, `setBlocker(id, x,
  y, r)`, `setDynamic(id, tiles)` and `move`; `findPath(grid, from, to)`.
- **art/**:
  - `PixelBuffer` (`rect`, `ellipse`, `hline`, `vline`, `set`, `blit`,
    `outline()`, `toCanvas`, `toDataURL`)
  - `P` (the palette) and `mix`
  - `CharacterLook`, `lookFromAppearance` and `DEFAULT_APPEARANCE`
  - `paintPortrait(look, expression)`
  - `iconImg(name)`: star, starEmpty, gear, check, soundOn/Off, lock, bulb,
    grownups, scroll, arrows, speak, question
  - `paintText`: a 3×5 font with digits and `+ - = ? < > s :` only. Draw
    letters yourself (see `paintLetter` in math-adventure-island/art.ts).
- **learning/mastery.ts**: `recordAnswer`, `skill(state, id)`,
  `topMisconception`, `cleanLearner`.
- **systems/**:
  - `audio` (`addSong`, `play(id)`, `fx(notes, type, vol)`, `correct`,
    `retry`, `hint`, `itemGet`, `levelUp`, `click`, `unlock`)
  - `Input` (direction, `onAction`)
  - settings (`settings`, `updateSettings`, `isTouchDevice`,
    `touchControlsVisible`, `applySettingsToDocument`)
  - speech (`speak`, `stopSpeaking`, `setReadAloudDefault(true)`)
  - `SaveStore`
- **ui/**:
  - `Talk` (`say`, `offer`, `ask`, `end`, `isOpen`)
  - `Modal` and `stackTop`, `h()` (DOM builder), `choose()` (confirm dialog)
  - `showTitle`, `openCustomize` (with `noun` for "explorer"/"time keeper")
  - `openSettings`, `openGrownups(host, content, progressFn)`
  - `Toolbar`, `toast`, `mountToasts`, `TouchControls`
- **core/**: `mulberry32`, `hash2` and the `bus` event emitter
  (`settings:changed`).

## 3. Order of work

1. `problems.ts` plus tests. Run `npx vitest run tests/<short>-problems.test.ts` until it's green.
2. `art.ts`: paint the ground, places, props, sidekick and portrait.
3. `world.ts`: build the map, blockers, people and targets, then get a first screenshot early (a minimal `game.ts`, or a tour script).
4. `content.ts`, `save.ts`, `music.ts`.
5. `game.ts` and CSS. Then `npx tsc --noEmit -p .` and `npm run build`.
6. The tour script for screenshots. Look, fix, repeat.
7. The e2e script.

## 4. Patterns to copy

- **Station panel** (time-attack-clock and math-adventure-island
  `game.ts`). A `Modal` with:
  - a header: name, level, stars, Leave
  - an ask row: helper portrait, prompt, read-aloud button
  - the body, then feedback, then a footer: Hint (H) and Next (Space)

  Keys 1–4 pick choices. Escape leaves.
- **Multi-step panel**: the `StepDef[]` structure in
  math-adventure-island (title, layout `wide | ops | nums`, choices, hint,
  mistake, done chip).
- **The first visit to a station plays the helper's intro** (with
  `introduced[]` in the save). Finishing a station runs: "Five stars!" → a
  `talk.ask` debrief → unlock the goal part in the world → a toast → the
  host comments.
- **Markers**: 'new' over people with unfinished jobs, and 'turnin' over the
  host when the finale is ready.
- **HUD**: top-left bar showing the goal progress icons. The Toolbar (Jobs J,
  Sound M, Settings Esc) sits bottom-right. A job list modal has "Walk
  there" buttons.
- **Debug hooks** on `window.__<short>`: `state()`, `screenOf(id)`,
  `open(station)`, `setTier(key, t)`, plus game-specific helpers (`teleport`,
  `quiz`, ...). The e2e and tour scripts depend on these. `state()` exposes
  the current panel's correct answer (`right`) so tests can answer without
  re-deriving it.
- **Save**: `cleanSave` validates every field and clamps numbers, so a
  corrupt or old save can never crash the game. Use a new localStorage key
  per game (`<camelSlug>.save`).
- **Finale**: `world.setNight(n)`, a song change, host lines, a toast, and
  markers updated. Afterwards the world stays in its finished state and
  replay stays open.

## 5. Layout and art gotchas (learned the hard way)

- **Camera clamping at the map edges** can hide things at the top or bottom.
  Leave 3–4 spare rows around anything important. Tune the camera
  look-ahead (`lookAt(p.x, p.y - k)`), and change it near places at the map
  edge so their labels stay in view.
- **Tall buildings hide the player or labels.** Keep the player below
  buildings, keep counters short, move props so they don't sit on labelled
  grids, and keep random palms away from grids and paths.
- **People on tile centers** (`x.5`) with `setBlocker` plus `setDynamic`,
  otherwise path-finding gets stuck on them. Don't put a person in the
  middle of a main path.
- **Start position**: make sure the player doesn't start on top of a prop,
  and that the first screenshot shows the main landmark (it becomes the
  card picture).
- **Toasts overlap the top HUD or prompts** in some layouts. Move them
  (`.toasts{top:…}`) if they do.
- **Phone width**: four buttons in a row need a CSS grid with `minmax(0,1fr)`
  and a smaller sub-label. Long panel titles wrap, so hide the level label
  under 640 px.
- **Enter and Space**: Enter must not re-press the last focused button when a
  panel expects "check". Handle keys in a panel-level keydown listener.
- **Hints must not give the answer away before rung 3.** Re-read every
  rung-2 text with a real problem.
- **Pronouns**: generated stories should use names, not "he" or "she",
  unless the art clearly matches.
- **TypeScript**: unused imports fail `tsc` (the build runs it). Keep
  variable names distinct from class fields.
