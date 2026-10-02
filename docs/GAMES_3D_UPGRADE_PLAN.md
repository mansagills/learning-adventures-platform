# Games 3D Upgrade: rebuild every game to the Seeds of Genius standard

**Request (owner, 2026-10-01):** "All the Learning Adventure games are playable, but they are all basic and use the same free icons." Rebuild every game with Three.js, replace the stock icons, and improve the learning challenges for each game's grade level. Every game should reach the quality of **Seeds of Genius** (the George Washington Carver game). Build to a high standard, score each part of the work out of 10 and keep improving it until it scores **8.5 or higher**. Send screenshots in chat. Work **one subject at a time**.

**Branch:** `claude/elegant-clarke-hlzflj` (this plan). Each later phase gets its own branch off `main` and its own PR.
**Tracked in:** `docs/V1_WEBSITE_REBUILD_PLAN.md` → UX changes → UX-4.

---

## 1. Where we start (audit, 2026-10-01)

**43 games and activities need rebuilding.** The 44th listed game, Seeds of Genius, is the quality bar and is not touched.

| Subject | Games | Activities | Total | Notes |
|---|---|---|---|---|
| Math | 18 | 2 | **20** | Several overlap (4 multiplication, 2 fraction pizza, 2 money) |
| Science | 18 | 3 | **21** | Two simple-machines and two solar-system titles overlap |
| English | 0 | 1 | **1** | Spelling Bee only |
| History | 0 | 1 | **1** | Ancient Egypt (Seeds of Genius is the bar) |
| Interdisciplinary | 0 | 0 | 0 | Nothing to rebuild yet |

What every current game has in common (measured, not guessed):

- **One HTML page built from standard web elements (buttons, text, CSS).** None use Three.js or 3D. Only 2 use a drawing canvas.
- **Emoji are the artwork.** The files hold between 4 and 82 emoji each (Pollution Solution Squad has 82, Weather Wizard Battle 62). On the website itself, UX-1 already replaced emoji with our own art; the games never got that treatment.
- **They load fonts from Google** at play time. Seeds of Genius builds its fonts in and makes no network requests. For a kids' site, the rebuilt games should do the same.
- **Thin learning design.** Most are a short run of random questions with right/wrong feedback. Few have a hint ladder, mistakes that teach the misconception behind a wrong answer, levels that adapt to the player, or a note for grown-ups. Seeds of Genius has all of these.
- **No saves, no settings, and few accessibility options** (reduced motion, text size, mute, keyboard play).

Screenshots of the "before" state are in the PR for this plan (every game's card, plus Math Dash at full size next to Seeds of Genius).

## 2. What "the Seeds of Genius standard" means for these games

Seeds of Genius is a ~24,000-line, nine-chapter adventure. The other games are shorter (10 to 30 minutes), so the bar is **quality, not length**. Every rebuilt game must have all of the following:

**Look and feel**
- A real **Three.js** scene in the **2D retro pixel-art style** of Seeds of Genius (owner decision, 2026-10-01): the same crisp, integer-scaled pixels, warm palette, readable fonts (Pixelify Sans for titles, Atkinson Hyperlegible for reading) and wood-and-parchment panels. Each game gets its own setting (a carnival, a space station, a reef, a pyramid).
- **Each game has its own host character** (owner decision). Jaylen and S.P.A.R.K. stay the site-wide theme, not the game hosts.
- **No emoji, no stock icons.** All art is drawn for the game in code (sprites, props, item icons, portraits), like Seeds of Genius's `src/art/`.
- Sound effects and a short music loop, with music and effects volume controls and mute (M).
- Animation with game feel: things squash, bounce and sparkle when you are right, and react gently (never harshly) when you are wrong. Reduced motion turns this down.

**Learning**
- A written **learning spec** per game: grade band, the standards it teaches (Common Core Math, NGSS, Common Core ELA, C3 for history), 3 to 5 levels that build the skill step by step, and the common mistakes it targets.
- **Wrong answers are built from real misconceptions** (for example, 1/3 > 1/2 "because 3 is bigger"), and the feedback explains the misconception.
- A **hint ladder** on every challenge: a nudge first, then a model (a picture or worked step), then the answer with an explanation. Hints never cost progress.
- **Adapts to the player:** a small mastery model moves a player up after a streak of correct answers and down (with more scaffolding) after repeated mistakes.
- A short **"talk it through" moment** at the end of each level (explain or choose a reason, not just an answer), like Carver's debriefs.
- A **For grown-ups** page: what the game teaches, the standards, a talking point, and how to help.
- Facts checked against reliable sources (NASA, NOAA, USGS, NPS, Smithsonian and similar) and listed in-game.

**Kid-safe and reliable**
- Works offline and makes **no network requests**. No sign-in, no names and no trackers. Saves and settings stay in the browser.
- Keyboard, mouse and touch all work. Works at 1280×720 and on a 390px-wide phone with no sideways scrolling and no clipped text.
- Reduced motion, larger text and mute settings that survive a reload.
- 60 fps target on an ordinary laptop, 30 fps floor. Small downloads: three.js is shared by all games, so it is cached after the first game.
- Unit tests for the learning logic (question generators, answer checking, mastery) and a browser test that plays the game from start to finish.

## 3. How the work is organized

### 3.1 One shared engine, one project for all games

Copying Seeds of Genius 43 times would be slow and hard to maintain. Instead:

- **`games-src/adventures/`**: one Vite + TypeScript project holding every rebuilt game.
  - **The Adventure Kit** (`src/kit/`) is the shared engine, built from the proven parts of Seeds of Genius: the pixel renderer and camera, the art helpers (sprites, characters, portraits, pixel digits), panels and talk boxes, the hint ladder, the mastery model, audio, settings, saving, the For grown-ups page, and the browser-test helpers.
  - Seeds of Genius itself is **not changed**. The kit starts as a copy, so the finished game can't break.
  - Each game has its own folder (`src/games/<slug>/` plus `<slug>/index.html`).
  - One build writes every game to `public/games/play/<slug>/index.html`. It has to live under `/games/`, because the site only lets `/games/` and `/lessons/` pages be embedded in its game player.
  - Shared code (three.js and the kit) is split into shared files under `public/games/play/assets/`, so a player who has opened one game loads the next one faster.
- **Shared question generators** per skill family (for example comparing numbers, money, fractions, multiplication facts). Each one has unit tests showing every question is correct, at the right level, and offers only plausible wrong answers.

### 3.2 Site changes when a game ships

- Its entry in `lib/content/games.ts` points `htmlPath` to `/games/play/<slug>/index.html`. The slug and URL stay the same, so links, the sitemap and search results keep working.
- When games are merged, the merged game keeps one of the old slugs. The other old addresses (`/games/<old-slug>`) redirect to it permanently (in `next.config.js`), so bookmarks and search results still land on a game.
- New card picture with `npm run thumbnails -- --only <slug>`.
- The old single-file HTML is deleted in the same PR, once the new game is approved.
- A new content test checks that rebuilt games contain no emoji and load nothing from the internet.

### 3.3 Scoring (the same rubric as Seeds of Genius)

Each game is scored out of 10, one sentence of evidence per category:

| Category | Points |
|---|---|
| Gameplay and feel (fun, pacing, game feel, replay) | 2.5 |
| Learning accuracy and clarity (grade fit, standards, misconceptions, hints) | 2.0 |
| Visual and audio polish (Three.js scene, original art, sound) | 1.5 |
| Usability and accessibility (controls, phone, text, reduced motion) | 1.5 |
| Technical reliability (no errors, offline, performance, tests) | 1.5 |
| Completeness against this plan's standard (section 2) | 1.0 |

**A game passes only when it scores 8.5 or more, meets every point in section 2, has no blocking bugs and has real screenshots.** If it scores below 8.5, the weakest category is improved and the game is scored again; the score history goes in the check-in. **A passing self-score is not approval.** The owner approves each batch.

### 3.4 Check-in after every batch

Each batch ends with screenshots in chat (title screen, gameplay, a hint, a wrong-answer explanation, the end-of-level debrief, the For grown-ups page, and a phone-width capture), the scores with evidence, test results and known issues. Then work stops until the owner approves.

## 4. Phases

Order: **engine and pilot → Math → Science → English and History.** Math goes first because it has the most games and the most reusable question generators. Science reuses the art and engine built for Math.

### Phase 0: Adventure Kit and a pilot game: BUILT, WAITING FOR THE OWNER'S CHECK-IN

- Build `games-src/adventures/` with the Adventure Kit (section 3.1), with the build writing to `public/games/play/<slug>/`.
- Rebuild **one pilot game, Number Line Ninja** (grades 1–3). It is small but uses most of the kit: a 3D scene, a character, a number line the player moves along, levels, hints, misconception feedback and a debrief.
- Publish it on its existing slug and add the content tests (no emoji, no network).
- **Owner check:** the look, the feel and the level of challenge. Every later game copies what is approved here, so this is the most important check-in.

**Built (2026-10-02):**

- [x] **Adventure Kit** in `games-src/adventures/src/kit/`, mostly copied from Seeds of Genius (Seeds itself is unchanged):
  - the pixel renderer, now with a fix for a half-pixel offset that could drop a column of pixels (a 9 could read as a 3)
  - pixel buffers (now much faster for big pictures), the palette, characters (with a new belt), portraits, a 3x5 number font
  - pixel UI icons: no emoji, no stock icons
  - the talk box with questions that never fail (feedback, then the next hint, then the answer outlined)
  - the learner model: up a level after two clean answers, down after two misses, and a count of which mistakes come up
  - sound made in code (each game adds its own songs), settings shared by every game, a versioned save with a backup
  - title screen, character creator, settings, the For grown-ups page (with a "How it is going" progress tab), toolbar and toasts
- [x] **One project for every game** (`games-src/adventures/`). It builds to `public/games/play/<slug>/index.html`, with shared code in `public/games/play/assets/`. Root scripts: `npm run games`, `npm run games:build`, `npm run games:test`. See its README.
- [x] **Number Line Ninja rebuilt** (grades 1–3, host: Sensei Rio):
  - five belts in five riverside places (Blossom Pond, Bamboo Creek, Maple Falls, Long River to 100, and Lantern River at night)
  - each belt has three levels chosen by the learner model:
    - White: find numbers using landmarks
    - Yellow: add by counting on, up to making ten
    - Orange: subtract by counting back, across 10
    - Green: tens and ones to 100, including crossing a ten
    - Black: the missing gap, as in 27 + ? = 45
  - every hop is drawn as an arc with its size (the classroom number-line model)
  - eight common mistakes are recognized and explained, for example counting the starting stone or treating tens as ones
  - hints: a nudge, then Sensei draws the first hops, then the whole path with the landing stone glowing
  - stars for clean first landings, a talk-it-through question before each belt is tied on, and the belt shows on the ninja
  - Standards: 1.OA.5, 1.OA.6, 1.OA.8, 1.NBT.1, 2.NBT.5, 2.MD.6, 2.OA.1
- [x] **Listed on the site** at its old slug (`/games/number-line-ninja`), with a new card picture and description. The old `public/games/number-line-ninja.html` stays for now, because the hidden account features (`lib/catalogData.ts`) and the test-game seed still point at it; Phase 4 removes it.
- [x] **Site guards:** the content test checks that rebuilt games contain no emoji and load nothing from other websites. Lint ignores the built `public/games/play/`.

**Tests:**

- Game unit tests: 22 in total, including every challenge generator at every level (600 seeds each), the mistake diagnosis, the "how far?" choices, the learner model and the save cleaner.
- Browser test `scripts/e2e-number-line-ninja.mjs`: 27 of 27 pass. It plays a new game with real keyboard, mouse and touch input:
  - character creator, Sensei's welcome, a wrong landing, all three hints
  - earning the White Belt, moving on to Bamboo Creek, then a reload
  - settings that persist, mute, the grown-ups page, the belt scroll
  - clicking and tapping stones, the phone layout
  - no console errors and no requests to other websites
- Site checks: `npx tsc --noEmit`, `npm run lint` (0 errors, the 6 known warnings), `npm test` (91), `npm run build` with no environment variables.

**Size and speed:**

- 157 KB of compressed script (three.js included), plus fonts. Nothing is loaded from the internet.
- 41–43 frames per second on the test machine. It has no graphics card (software rendering): a worst case. Seeds of Genius measured 48–53 there. A normal laptop should reach 60.

**Score (Seeds of Genius rubric):**

| Category | First build | After fixes |
|---|---|---|
| Gameplay and feel (2.5) | 1.7 | 2.0 |
| Learning accuracy and clarity (2.0) | 1.8 | 1.85 |
| Visual and audio polish (1.5) | 1.0 | 1.3 |
| Usability and accessibility (1.5) | 1.0 | 1.35 |
| Technical reliability (1.5) | 1.2 | 1.3 |
| Completeness (1.0) | 0.9 | 0.95 |
| **Total** | **7.6** | **8.75** |

The first build had these problems, all fixed:

- a 5 looked like an S in the pixel font
- the ninja's feet covered the stone numbers
- some digits lost a column of pixels
- the hop labels were too small to read
- the character creator lost its layout
- the phone toolbar covered the "Next" button
- pressing Space twice right after Sensei spoke counted as a miss

**Owner check-in (2026-10-02):** "Number Line Ninja looks great, and the learning is appropriate." One change was requested: make the outfits fit the ninja theme. Done:

- The character creator now offers ninja gear in place of the general outfit color and accessory:
  - **Gi color** (8): a top and trousers in one color, with a crossed collar
  - **Ninja mask**: none, a face mask over the nose and mouth, or a full hood that shows only the eyes
  - **Headband** (7 colors, or none): tied at the back, with tails
- The earned belt is worn over the gi. A light belt on the white gi gets a darker edge so it still shows.
- The kit's characters can now wear a gi, a mask and a headband. The creator can swap in each game's own clothing choices, so later games (a chef, an astronaut) can do the same.
- Saves keep the gear; older saves get the default gear.
- Tests: 24 unit tests and 29 browser checks pass, including that the gear choices appear and survive a reload.

Known issues (none blocking):

| # | Issue | Severity |
|---|---|---|
| 1 | On a phone the stones are small to tap (about 26 px). The big hop buttons are the main control there | Low |
| 2 | Frame rate measured with software rendering only; the owner should check on a real device | Low |
| 3 | The hint's dotted arcs are busy when there are many single hops | Low |
| 4 | The old HTML file stays until Phase 4 (hidden account features still use it) | Low |

### Merge map (owner decision: fewer, deeper games)

43 games and activities become **27 games** (Math 11, Science 14, English 1, History 1). Each merged game has levels that cover the full grade range of the games it replaces. Final titles are chosen when each batch starts; the slug that survives is in bold.

| Subject | Merged game (surviving slug in bold) | Replaces |
|---|---|---|
| Math | **counting-carnival** (K–2) | counting-carnival, number-monster-feeding |
| Math | **math-race-rally** (1–5): fact strategies and fluency | math-race-rally, math-memory-match |
| Math | **math-adventure-island** (2–5): word problems, estimation, a game-show finale | math-adventure-island, treasure-hunt-calculator, math-jeopardy-junior |
| Math | **money-market-madness** (1–4): coins, bills, then a cafeteria shift making change | money-market-madness, cafeteria-cashier |
| Math | **geometry-builder-challenge** (K–4): sort shapes, then build, perimeter and area | shape-sorting-arcade, geometry-builder-challenge |
| Math | **pizza-fraction-frenzy** (2–4) | pizza-fraction-frenzy, fraction-pizza-party |
| Math | **multiplication-space-quest** (3–5): multiplication, division, fact families | multiplication-space-quest, multiplication-bingo-bonanza, multiplication-tables-adventure |
| Science | **solar-system-explorer** | solar-system-explorer, planet-explorer-quest |
| Science | **rock-cycle-racing** (rocks, volcanoes, the rock cycle) | rock-cycle-racing, volcano-explorer-lab |
| Science | **weather-wizard-battle** (weather and the water cycle) | weather-wizard-battle, water-cycle-journey |
| Science | **pollution-solution-squad** (pollution and ocean conservation) | pollution-solution-squad, ocean-conservation-heroes |
| Science | **states-of-matter-mixer** (matter, mixtures, crystals) | states-of-matter-mixer, crystal-cave-chemistry |
| Science | **simple-machines-construction** | simple-machines-construction, simple-machines-lab |
| Science | **light-laboratory-escape** (light and sound waves) | light-laboratory-escape, sound-wave-surfer |

Not merged (each is distinct): Number Line Ninja, Math Dash, Time Attack Clock, Equation Balance Scale, Fossil Dig Adventure, Animal Kingdom Match, Plant Growing Championship, Body System Heroes, Ecosystem Building Tycoon, Ocean Depth Diver, Magnet Power Puzzle, Spelling Bee Challenge, Ancient Egypt Explorer.

### Phase 1: Math (11 games, from 20): NOT STARTED

Batches group games that share skills, so each batch also builds a question generator that the next batch reuses. Where the table lists two or three old games in one batch, they become the single merged game from the merge map. The "Upgrade" column is a starting idea, to be refined in the game's learning spec.

| Batch | Game (grades) | Today | Upgrade (grade-level focus) |
|---|---|---|---|
| **M1 Counting and early number (K–2)** | Counting Carnival (K–1) | Count items | Carnival booths in 3D: count to 20, one-to-one counting, "how many more to make 10", subitizing dots (K.CC, K.OA) |
| | Number Monster Feeding (K–2) | Feed matching numbers | Monsters ask for "more than / less than / 1 more / 10 more"; ten-frame food trays (K.CC, 1.NBT) |
| **M2 Place value and ordering (1–3)** | Math Dash: Library Sorter (1–3) | Sort 5 numbers | A 3D library: order by tens and hundreds, place-value blocks as hints, compare with < > = (1.NBT, 2.NBT) |
| | Number Line Ninja (1–3) | Number line jumps | Built in Phase 0 |
| | Math Memory Match (1–3) | Match facts | Match a fact to a model (ten frame, array, number line), so it's not just memory; fact strategies (1.OA, 2.OA) |
| **M3 Money and time (1–4)** | Money Market Madness (1–3) | Pay with coins | A 3D market: count coins and bills, fewest coins, "can I afford it?" (2.MD.8) |
| | Cafeteria Cashier (2–4) | Make change | Make change by counting up, with multi-item orders and a two-step word problem (2.MD.8, 3.OA.8) |
| | Time Attack Clock (1–3) | Read a clock | A 3D clock tower: half hours, then 5 minutes, then to the minute, plus elapsed time ("the bus leaves in 15 minutes") (1.MD.3, 2.MD.7, 3.MD.1) |
| **M4 Addition, subtraction and mixed operations (2–5)** | Math Race Rally (2–5) | Speed questions | A 3D kart race where strategies boost speed: make-a-ten, compensation, regrouping; levels by grade (2.NBT.5, 3.NBT.2) |
| | Math Adventure Island (2–4) | Mixed questions | An island map with one zone per operation and word problems with a "what's the question asking?" step (2.OA.1, 3.OA.8) |
| | Treasure Hunt Calculator (2–4) | Solve to dig | Grid coordinates and estimation: estimate first, then calculate, then check whether the answer is reasonable (3.NBT, 3.OA.8) |
| | Math Jeopardy Junior (2–5) | Quiz board | A 3D game show with categories by strand and a "show your strategy" bonus round (mixed) |
| **M5 Geometry (K–4)** | Shape Sorting Arcade (K–2) | Sort shapes | 3D shapes on a conveyor: sort by sides, corners, and flat vs solid shapes (K.G, 1.G.1, 2.G.1) |
| | Geometry Builder Challenge (2–4) | Build with shapes | Build blueprints from shapes, then perimeter and area on a grid; right angles and quadrilaterals (3.MD.7, 3.MD.8, 3.G.1) |
| **M6 Fractions (2–4)** | Pizza Fraction Frenzy (2–4) | Pizza fractions | A 3D pizzeria: equal shares, unit fractions, fractions on a number line (2.G.3, 3.NF.1, 3.NF.2) |
| | Fraction Pizza Party (activity, 2–4) | Slice and compare | Compare and find equivalent fractions with the "bigger denominator, smaller piece" misconception (3.NF.3, 4.NF.1, 4.NF.2) |
| **M7 Multiplication and equations (3–5)** | Multiplication Space Quest (3–5) | Times tables | Arrays and equal groups as a space fleet, then strategies (doubles, ×9 patterns) (3.OA.1, 3.OA.7) |
| | Multiplication Bingo Bonanza (3–5) | Bingo | Bingo with the inverse: division facts and missing factors (3.OA.4, 3.OA.6) |
| | Multiplication Tables Adventure (activity, 3–5) | Step through tables | Structured practice with the mastery model choosing the facts that need work; a fact-family map (3.OA.7) |
| | Equation Balance Scale (3–5) | Balance a scale | A 3D balance with weights: the equals sign as "same as", missing numbers, then two-step (1.OA.7, 3.OA.4, 4.OA.3) |

### Phase 2: Science (14 games, from 21): NOT STARTED

Detailed learning specs are written at the start of this phase, aligned to NGSS. Proposed batches (merged games follow the merge map):

| Batch | Games |
|---|---|
| **S1 Space** | Solar System Explorer, Planet Explorer Quest |
| **S2 Earth** | Rock Cycle Racing, Fossil Dig Adventure, Volcano Explorer Lab (activity), Weather Wizard Battle, Water Cycle Journey (activity) |
| **S3 Life** | Animal Kingdom Match, Plant Growing Championship, Body System Heroes, Ecosystem Building Tycoon |
| **S4 Ocean and environment** | Ocean Depth Diver, Ocean Conservation Heroes, Pollution Solution Squad |
| **S5 Matter and chemistry** | States of Matter Mixer, Crystal Cave Chemistry |
| **S6 Forces, energy and waves** | Magnet Power Puzzle, Simple Machines Construction, Simple Machines Lab (activity), Light Laboratory Escape, Sound Wave Surfer |

### Phase 3: English and History (2): NOT STARTED

- **Spelling Bee Challenge** (3–5): spelling patterns (vowel teams, prefixes and suffixes, homophones) with word meaning in context, not just memorizing lists (L.3.2, L.4.2).
- **Ancient Egypt Explorer** (3–5): explore a 3D Nile village and pyramid site with sourced facts, artifacts and "how do we know?" evidence questions (C3 D2.His).

### Phase 4: Wrap-up: NOT STARTED

Final pass over all 27: new card pictures, homepage featured games, the player guide, the speed and size report, and the cleanup of the old HTML files and the old Google Fonts links.

## 5. Owner decisions (answered 2026-10-01)

1. **Art style:** keep the Seeds of Genius look, **2D retro pixel art** rendered with Three.js.
2. **Overlapping games:** **merge them into fewer, deeper games** (see the merge map in section 4).
3. **Subject order:** Math → Science → English and History.
4. **Characters:** **each game has its own host character.** Jaylen and S.P.A.R.K. are the overarching theme of the site.
5. **Batches and approvals:** one PR per batch, with an owner check-in after each (recommended default; not changed).

## 6. Risks and how we handle them

| Risk | How we handle it |
|---|---|
| 43 games is a lot of work; quality could slip toward the end | The shared kit and question generators carry most of the load; every game gets the same scoring gate and owner check-in |
| The test machine has no graphics card, so measured speed is lower than real laptops | Measure on the test machine (software rendering) as a worst case, and the owner spot-checks on a real device per batch |
| A rebuilt game is worse than the old one for some players (for example, slower on old tablets) | The old file stays until the new game is approved; a low-detail mode is part of the kit |
| Changing a live game breaks links | Slugs and URLs stay the same; the content test checks every listed file exists |
| Factual errors in Science and History | A sources list per game, and a fact review in every check-in |

## 7. Progress log

- **2026-10-01:** Plan written. Games audited (43 to rebuild, emoji counts, no Three.js, Google Fonts loaded at play time). "Before" screenshots captured.
- **2026-10-01:** Owner answered section 5 (pixel art, merge into 27 games, Math first, a host per game). Phase 0 started.
- **2026-10-02:** Phase 0 built: Adventure Kit and Number Line Ninja (8.75/10 self-score; 22 unit tests, 27 browser checks). Waiting for the owner's check-in on look, feel and challenge level before Math batch M1.
- **2026-10-02:** Owner check-in: look and learning approved; asked for ninja outfits. Added gi colors, ninja masks (face mask or hood) and headbands. Waiting for the owner to confirm the gear, then Math batch M1.
