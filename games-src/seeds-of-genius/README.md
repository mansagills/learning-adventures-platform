# Seeds of Genius: George Washington Carver and the Power of Science

A cozy, single-player, 16-bit-style pixel adventure built with Three.js,
TypeScript and Vite. George Washington Carver is the recurring guide and
quest giver. The player talks to him, gathers items and clues from
townspeople, uses them, and returns to him to talk it through.

- **Spec (source of truth):** [`docs/sorceress-prompts/carver-game/Carver_Adventure_Technical_Spec.md`](../../docs/sorceress-prompts/carver-game/Carver_Adventure_Technical_Spec.md)
- **Plan and phase status:** [`docs/SEEDS_OF_GENIUS_PLAN.md`](../../docs/SEEDS_OF_GENIUS_PLAN.md)
- **Where it is served:** the build is copied to `public/games/seeds-of-genius/`,
  so it opens at `/games/seeds-of-genius/index.html` on the site and every Vercel
  preview. It is **not listed** in `lib/content/games.ts` yet.

## Run and build

```bash
cd games-src/seeds-of-genius
npm install
npm run dev          # http://localhost:5173 (debug menu on)
npm test             # unit tests (vitest)
npm run build        # typecheck + build into ../../public/games/seeds-of-genius
npx vite preview --port 4173 &   # serve the build
npm run e2e -- http://localhost:4173/   # Phase 0 browser check-in (Playwright)
node scripts/e2e-phase1.mjs http://localhost:4173/   # Phase 1 check-in (Chapter 1)
node scripts/e2e-phase2.mjs http://localhost:4173/   # Phase 2 check-in (Chapter 2)
node scripts/e2e-phase3.mjs http://localhost:4173/   # Phase 3 check-in (Chapter 3)
node scripts/e2e-phase4.mjs http://localhost:4173/   # Phase 4 check-in (Chapter 4)
node scripts/e2e-phase5.mjs http://localhost:4173/   # Phase 5 check-in (Chapter 5)
node scripts/e2e-phase6.mjs http://localhost:4173/   # Phase 6 check-in (Chapter 6)
```

From the repo root, the same things are `npm run game:carver`,
`npm run game:carver:build` and `npm run game:carver:test`.

**Always run `npm run build` and commit `public/games/seeds-of-genius/` after
changing the game.** Vercel only builds the Next.js site; it serves the
committed game build as static files.

Add `?debug` to the URL to show the debug menu (jump to Carver/Mae/room,
change the time, finish the practice quest, reset the test save). It is
always on in `npm run dev`, and will be removed from the release build in
Phase 8.

## Controls

| Action | Keyboard | Mouse | Touch |
|---|---|---|---|
| Walk | W A S D or arrow keys (Shift to hurry) | Click the ground | Arrow pad, or tap the ground |
| Talk / use | E, Space or Enter | Click a person, sign or door (or the prompt) | Talk button |
| Choose an answer | 1-3, arrow keys + Enter | Click | Tap |
| Journal / Bag | J / I | Toolbar | Toolbar |
| Mute | M | Toolbar | Toolbar |
| Settings | Esc | Toolbar | Toolbar |

**Rewards.** XP shows progress. Seeds (earned from quests) only buy cosmetic
decorations for the workshop; they never buy answers or lessons.

## How it is built

```
src/
  main.ts, game.ts        boot + the orchestrator (loop, scenes, interaction, saving)
  render/pixelRenderer.ts 45-degree orthographic camera, integer-scaled pixels
  world/                  map data, collision + pathfinding, scene kit, actors, scenes
  art/                    every sprite, tile, portrait and icon, painted in code
  quests/                 chapter/item/dialogue types, the QuestEngine, the chapter runtime interface
  chapters/ch1/           Chapter 1's code: garden spots, close-up inspection, card game (lazy-loaded)
  chapters/ch2/           Chapter 2's code: schoolhouse displays, journey timeline, barrier/support (lazy-loaded)
  chapters/ch3/           Chapter 3's code: soil close-ups, the soil model, the rotation planner (lazy-loaded)
  chapters/ch4/           Chapter 4's code: crop tests, invention rules, workbench, decorations shop (lazy-loaded)
  chapters/ch5/           Chapter 5's code: farm clues, recommendation rules, demonstration table (lazy-loaded)
  chapters/ch6/           Chapter 6's code: seedling model, fair-test checks, experiment bench, results chart (lazy-loaded)
  content/                chapters, conversations, items, NPCs, sources (data only)
  learning/               learner model (per objective) + hint providers
  systems/                save (versioned), settings, audio, day/night, input
  ui/                     HUD, dialogue, journal, customization, settings, title, touch
tests/                    vitest unit tests
scripts/e2e-phase0.mjs    Playwright check-in test + screenshots
```

**The camera trick.** The camera looks down at 45 degrees. World depth and
heights are both stretched by K = sqrt(2), which cancels the foreshortening,
so a ground tile and a wall tile each come out exactly 16 screen pixels. The
scene renders into a small canvas (427x240 on a 1280x720 screen) that the
browser scales up by a whole number with nearest-neighbor filtering.

**Layout rule.** In a 3/4 view a building hides the ground up to
(height + depth) rows north of its front wall. Roads are kept out of those
rows (a unit test enforces it), so the player never walks behind a roof on a
required path.

## Adding a chapter (no hub changes)

1. Add its items to `src/content/items.ts`.
2. Add its NPCs to `src/content/npcs.ts` (required NPCs must be `presence: 'always'`).
3. Write its conversations in `src/content/conversations.ts`: Carver's
   `opening` (ends with `acceptQuest`), `waiting`, `closing` (uses items, ends
   with `completeChapter`) and `after`, plus one talk per supporting NPC (with
   `grantItem` + `completeStep`).
4. Fill in the chapter's outline in `src/content/chapters.ts`: `steps`
   (talks and minigames), `requiredItems`, `itemUses`, `rewards`, and set
   `status: 'playable'`.
5. Put its minigame in `src/chapters/<id>/runtime.ts` (a `ChapterRuntime`: world
   places, dialogue `{tokens}`, objective line, journal section) and point
   `loadRuntime` at it with a dynamic `import()`, so it loads lazily.
6. Mark any dialogue line about a hard subject with `sensitive: { skipTo }`.
   The player gets a note and a "Skip this part" button; the lines it can skip
   must not carry effects (a test checks this).
7. Run `npm test`: `tests/content.test.ts` checks that every conversation,
   NPC, item, step and effect a chapter names really exists, and that Carver
   opens and closes every playable chapter.

## Assets and licenses

| Asset | Source | License |
|---|---|---|
| All pixel art (characters, Carver sprite and portraits, tiles, props, buildings, icons, quest markers) | Original, painted in code in `src/art/` | Project-owned |
| Music and sound effects | Original, synthesized live with the Web Audio API in `src/systems/audio.ts` | Project-owned |
| three.js | npm `three` | MIT |
| Atkinson Hyperlegible (body text) | Braille Institute, via `@fontsource/atkinson-hyperlegible` | SIL Open Font License 1.1 |
| Pixelify Sans (names and headings) | via `@fontsource/pixelify-sans` | SIL Open Font License 1.1 |

No assets are downloaded at runtime; the game makes no network requests.

## Content sources (for fact checking)

Historical copy is checked against these; the game does not quote them.

- National Park Service, [George Washington Carver](https://www.nps.gov/people/george-washington-carver.htm)
- National Park Service, [Carver at Tuskegee Institute](https://www.nps.gov/tuin/learn/historyculture/george-washington-carver.htm)
- USDA National Agricultural Library, [Carver and soil productivity](https://www.nal.usda.gov/exhibits/ipd/carver/exhibits/show/soil/soil-productivity)

Carver's lines are written for the game (the dialogue box labels him "Real
scientist · words written for this story"). Sweetgum Hollow and its people
are fictional.

## Privacy

Saves live in this browser's `localStorage` only (`seedsOfGenius.save`, a
backup copy, and `seedsOfGenius.settings`). No names, accounts, analytics or
network calls. The optional AI hint service (`src/learning/hints.ts`) is off
unless a same-origin server endpoint is configured at build time, never
holds keys in the browser, and falls back to authored hints on any error.

## Phase checklist

| Phase | Scope | Status |
|---|---|---|
| 0 | Playable foundation | Approved ✅ |
| 1 | A Seed Is Planted / Curiosity Collector | Approved ✅ |
| 2 | Science Against the Odds / Choose the Path | Approved ✅ |
| 3 | The Soil Speaks / Virtual Soil Lab | Approved ✅ |
| 4 | The Peanut Isn't Just a Peanut / Inventor's Workshop | Approved ✅ |
| 5 | Science for the People / Farm Helper | Approved ✅ |
| 6 | A Scientist's Method / Design Your Own Experiment | Built, awaiting owner review |
| 7 | Your Turn to Plant the Seeds / My Carver Project | Not started |
| 8 | Whole-game polish and release candidate | Not started |

## Known issues (Phase 6)

- The seedling growth numbers are a simple model (two weeks, bean seeds,
  three pots per tray). Real experiments vary more from pot to pot.
- The hypothesis step offers taller / shorter / about the same; there is
  no free-text "because" yet (Phase 7 adds optional typing).
- Tray A must stay "the usual way" (sunny, ½ cup, plain soil). Some
  players might want to pick their own comparison; the game explains why
  instead.
- Printing the Fair-Test Plan Card works on the website; the Claude
  artifact preview can't open the print dialog.

## Known issues (Phase 5)

- The farm rules are a simple model for the game (for example, "plow
  across the slope" stands for contour plowing plus a winter cover crop).
  They are not real advice for any one farm.
- Two Creeks is reached only by the wagon; the map pins in the journal
  show town people only, so Mrs. Watts and Mr. Pryor are not pinned there.
- The table on a phone is a long scrolling list (the farmer's report, six
  cards, then the result). It works, but it is a lot of scrolling.
- Printing the Interview Card works on the website; the Claude artifact
  preview can't open the print dialog.

## Known issues (Phase 4)

- The invention rules are simple kitchen science (wet spoils, dry keeps,
  beans need cooking). They are not a full food-safety guide; real cooking
  needs a grown-up.
- If a test fails, the next test automatically counts as improving it (a
  banner says so, and "Stop improving" starts a fresh idea). Some players
  may not notice the banner at first.
- Decorations appear only in the workshop for now (not in your cottage).
- Printing the Invention Sketch Card works on the website; the Claude
  artifact preview can't open the print dialog.

## Known issues (Phase 3)

- The soil model is deliberately simple (whole-number soil points, four
  crops, one plot). It is labeled as a model in the game; real results
  depend on weather, soil type and care.
- On phones, the planner is a long scrolling panel (crop cards, four season
  pickers, results, chart and table).
- In automated tests with software rendering, the first frames after
  loading into the farm can take about a second; on a normal graphics card
  this is not noticeable.
- Printing the Crop-Rotation Planner works on the website; the Claude
  artifact preview can't open the print dialog.

## Known issues (Phase 2)

- On phones, the timeline is a long scrolling list (six cards with two
  buttons each). Everything is reachable, but you scroll to reach "Check my
  order".
- Cards move one step at a time with Move up / Move down (no drag and drop
  yet). This works the same with a mouse, keyboard, touch or a screen reader.
- The storybook paintings are small 96x64 pixel scenes; people in them are
  simple figures, not portraits of the real people.
- Printing the Journey Card works on the website; the Claude artifact preview
  can't open the print dialog.

## Known issues (Phase 1)

- On phones, the garden close-up and the card game scroll inside their panel
  (the picture, the lens and the notebook don't all fit on one screen).
- Printing the Nature Observation Card works on the website; the Claude
  artifact preview can't open the print dialog.
- Carver's portrait uses the same few expressions as Phase 0.

## Known issues (Phase 0)

- Only Chromium was available for automated testing. Edge should match;
  Safari and Firefox need a manual check.
- Frame rate was measured only with a software renderer (about 49 fps at
  1280x720). It still needs checking on the agreed test laptop.
- Music is simple synthesized loops. The automated tests confirm that sound
  settings and mute work, but not how the music sounds.
- If you stand directly below someone, your character can still cover their
  legs. Characters keep some space around them, and the camera frames both
  speakers during a conversation.
- Chapters 1-7 show as "coming in a later update" on the journal map. The
  objective line says so after the practice quest.
- The debug menu (`?debug`) is still available in this phase's build.
