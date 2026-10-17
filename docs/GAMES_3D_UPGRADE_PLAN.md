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

### Phase 0: Adventure Kit and a pilot game: COMPLETED ✅ (owner approved 2026-10-02)

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

### Phase 1: Math (11 games, from 20): COMPLETED ✅ (all seven batches owner-approved and merged; the last, M7, on 2026-10-11 in PR #226)

Batches group games that share skills, so each batch also builds a question generator that the next batch reuses. Where the table lists two or three old games in one batch, they become the single merged game from the merge map. The "Upgrade" column is a starting idea, to be refined in the game's learning spec.

| Batch | Game (grades) | Today | Upgrade (grade-level focus) |
|---|---|---|---|
| **M1 Counting and early number (K–2)** | Counting Carnival (K–1) | Count items | Carnival booths in 3D: count to 20, one-to-one counting, "how many more to make 10", subitizing dots (K.CC, K.OA) |
| | Number Monster Feeding (K–2) | Feed matching numbers | Monsters ask for "more than / less than / 1 more / 10 more"; ten-frame food trays (K.CC, 1.NBT) |
| **M2 Place value and ordering (1–3)** | Math Dash: Library Sorter (1–3) | Sort 5 numbers | **Changed by the owner (2026-10-02):** "Library Rush", a Vampire Survivors-style action game. See the M2 section below |
| | Number Line Ninja (1–3) | Number line jumps | Done in Phase 0 |
| | Math Memory Match (1–3) | Match facts | Moved to M4: the merge map folds it into Math Race Rally (fact strategies and fluency) |
| **M3 Money and time (1–4)** | Money Market Madness (1–3) | Pay with coins | A 3D market: count coins and bills, fewest coins, "can I afford it?" (2.MD.8) |
| | Cafeteria Cashier (2–4) | Make change | Make change by counting up, with multi-item orders and a two-step word problem (2.MD.8, 3.OA.8) |
| | Time Attack Clock (1–3) | Read a clock | A 3D clock tower: half hours, then 5 minutes, then to the minute, plus elapsed time ("the bus leaves in 15 minutes") (1.MD.3, 2.MD.7, 3.MD.1) |
| **M4 Addition, subtraction and mixed operations (2–5)** | Math Race Rally (2–5) | Speed questions | A 3D kart race where strategies boost speed: make-a-ten, compensation, regrouping; levels by grade (2.NBT.5, 3.NBT.2) |
| | Math Adventure Island (2–4) | Mixed questions | An island map with one zone per operation and word problems with a "what's the question asking?" step (2.OA.1, 3.OA.8) |
| | Treasure Hunt Calculator (2–4) | Solve to dig | Grid coordinates and estimation: estimate first, then calculate, then check whether the answer is reasonable (3.NBT, 3.OA.8) |
| | Math Jeopardy Junior (2–5) | Quiz board | A 3D game show with categories by strand and a "show your strategy" bonus round (mixed) |
| **M5 Geometry (K–4)** | Shape Sorting Arcade (K–2) | Sort shapes | 3D shapes on a conveyor: sort by sides, corners, and flat vs solid shapes (K.G, 1.G.1, 2.G.1) |
| | Geometry Builder Challenge (2–4) | Build with shapes | Build blueprints from shapes, then perimeter and area on a grid; right angles and quadrilaterals (3.MD.7, 3.MD.8, 3.G.1) |
| **M6 Fractions (2–4)** | Pizza Fraction Frenzy (2–4) | Pizza fractions | Built as **Forum Fraction Feast** in the Ancient Kingdoms world (Roman forum): equal shares, unit fractions, fractions on a number line (2.G.3, 3.NF.1, 3.NF.2) |
| | Fraction Pizza Party (activity, 2–4) | Slice and compare | Compare and find equivalent fractions with the "bigger denominator, smaller piece" misconception (3.NF.3, 4.NF.1, 4.NF.2) |
| **M7 Multiplication and equations (3–5)** | Multiplication Space Quest (3–5) | Times tables | Arrays and equal groups as a space fleet, then strategies (doubles, ×9 patterns) (3.OA.1, 3.OA.7) |
| | Multiplication Bingo Bonanza (3–5) | Bingo | Bingo with the inverse: division facts and missing factors (3.OA.4, 3.OA.6) |
| | Multiplication Tables Adventure (activity, 3–5) | Step through tables | Structured practice with the mastery model choosing the facts that need work; a fact-family map (3.OA.7) |
| | Equation Balance Scale (3–5) | Balance a scale | A 3D balance with weights: the equals sign as "same as", missing numbers, then two-step (1.OA.7, 3.OA.4, 4.OA.3) |

#### M1 Counting Carnival: COMPLETED ✅ (owner approved and merged 2026-10-02 in PR #208)

Counting Carnival and Number Monster Feeding are now one game, **Counting Carnival** (K–2), slug `counting-carnival`. The old `/games/number-monster-feeding` link redirects to it (`next.config.js`), and the ebook *Jaylen and the Frozen Numbers* now lists it as a companion game in place of Number Monster Feeding.

**How it plays.** The player makes a "carnival kid" and walks around a fairground (arrow keys, WASD, tap-to-walk or the touch pad). Ringmaster Rosa runs the carnival; Munch, a purple snack monster from the old game, runs one booth. Each booth has three levels. The game moves a player up after two clean answers and back down after two misses.

| Booth (host) | Level 1 | Level 2 | Level 3 |
|---|---|---|---|
| Duck Pond (Rosa) | Count 2–5 ducks in a row; tapping a duck says its number | 6–10 scattered ducks; the number tags fade | 11–20: a full row of ten plus more; count on from 10 |
| Ring Toss (Rosa) | How many rings on a ten-frame (1–5) | Quick look: the frame is covered after 2 seconds (6–10) | How many more rings make 10 |
| Munch's Snack Stand (Munch) | Which plate has more or fewer, with a trap: big cookies that look like more | 1 more or 1 less within 20 | 10 more or 10 less |
| Prize Counter (Rosa) | Count strips of ten | Tens and ones | Build a price (21–120) with strips and single tickets, then pay |

- **Mistakes get a reason.** Each wrong answer is matched to a likely mistake (skipped one, counted one twice, said the count instead of how many more, swapped the digits, picked the bigger cookies, and others), and the game explains it in one sentence. Wrong answers are crossed out so the next try is a real choice.
- **Hint ladder** (H or the Hint button): 1 = a tip, 2 = a picture helper (numbers on the rings, a counting line, the row of ten boxed), 3 = the answer is outlined. A second miss gives a hint automatically.
- **Stars and tickets:** a star only for a first-try answer with no picture hint; tickets for every answer. Five stars light a booth after a short question about the idea (for example "Pip said five last. How many ducks?"). Each lit booth brings evening closer. All four bring night, glowing booths and a finale.
- **Tickets buy balloons** from Rosa (just for fun) and the player carries one around.
- **Read-aloud is on by default** (it's a K–2 game): questions, feedback, hints and the numbers as ducks are tapped. It uses only voices on the device; nothing is sent online. It can be turned off in Settings.
- **Grown-ups report**: what each booth teaches, standards (K.CC.4–7, K.OA.3–4, 1.NBT.1–3, 1.NBT.5), progress per booth and the most common mistake.

**Kit additions (reused by later games):** walking with collision and A* paths (`kit/world/walk.ts`), keyboard actions (`kit/systems/input.ts`), an on-screen touch pad (`kit/ui/touch.ts`), read-aloud (`kit/systems/speech.ts`, with a Settings row), and `stackTop()` for modal keyboard handling.

**Checks:** 7 unit tests for the question generator (every level, every booth, answers always among the choices, the cookie trap appears), 28 browser checks (`scripts/e2e-counting-carnival.mjs`: a full game from the title screen to the finale, plus saving, the grown-ups report and the phone layout), about 41 fps with software rendering. Site checks: type-check, lint (0 errors), `npm test`, `npm run build` with no env vars.

**Self-score**

| Category | First build | After fixes |
|---|---|---|
| Gameplay and fun (2.5) | 1.7 | 2.0 |
| Learning quality (2.0) | 1.7 | 1.9 |
| Visual and audio polish (1.5) | 1.0 | 1.3 |
| Usability and accessibility (1.5) | 1.0 | 1.4 |
| Technical reliability (1.5) | 1.0 | 1.4 |
| Completeness (1.0) | 0.8 | 0.9 |
| **Total** | **7.2** | **8.9** |

Problems found in the first build, all fixed:

- the player started hidden under the entrance arch
- keyboard shortcuts stopped working after a wrong answer (focus fell off the panel)
- the rings looked like bug faces; they now sit around the peg
- every button looked crossed out after a right answer
- the "fewer cookies" trap gave the wrong explanation
- the duck sparkle hint was too faint to see
- walking up to Munch could stop one step short without opening his booth
- the night finale looked grey; finished booths now glow

Known issues (none blocking):

| # | Issue | Severity |
|---|---|---|
| 1 | The booths are mostly "pick the number" with a picture; a later polish pass could add more hands-on moves (dragging rings or cookies) | Low |
| 2 | On a laptop the camera follows the player, so the Ferris wheel and big top show only near the top of the fair | Low |
| 3 | The old `number-monster-feeding.html` and `counting-carnival.html` files stay until Phase 4 (the World demo and the hidden account features still use them) | Low |

#### M2 Math Dash: Library Rush: COMPLETED ✅ (owner tested, approved and merged 2026-10-03 in PR #209)

**Owner request (2026-10-02):** turn Math Dash into a game like Vampire Survivors. You are a student working in the library who collects and sorts books while avoiding other students, who drain you when you run into them. Power-ups work like the ones in Vampire Survivors but are library-themed. It must still use Three.js; the style may change a little.

**Owner decisions (2026-10-02):**

- Same pixel art, with more action: a closer camera, lamp lighting, particles and screen shake
- Books are sorted by number range: carry each book to the shelf whose range fits
- The "other students" are friendly, chatty students. Bumping into one drains Focus. Power-ups calm them; there is no fighting.
- Runs are endless: play until Focus runs out and try to beat your best score

**Design (slug stays `math-dash`; title "Math Dash: Library Rush", grades 1–3):**

- **Moving:** walk anywhere in a big library that scrolls with you (arrow keys, WASD, or drag anywhere on a touch screen). Books appear on the floor, carts and tables. Walking over a book picks it up, up to what your cart can hold.
- **Sorting (the math):** the book in your hands shows its call number above your head and on the HUD. Walk into a shelf to shelve it:
  - Right shelf: points, a combo, and the Sorting meter fills.
  - Wrong shelf: the book bounces back with a one-line reason (for example, "247 has 2 hundreds, so it goes on 200–299"). Q or the Swap button changes which book is in your hands.
  - Two misses on the same book make the right shelf sign glow.
- **Stages grow during a run:**
  - Picture Books: 0–59, one shelf per ten
  - Chapter Books: 100–599, one shelf per hundred
  - Reference: 0–999 with shelves such as "< 250", "250 to 399", "> 399" (comparing three-digit numbers and the < > symbols)
  - Each stage moves on after 12 right answers. A run starts at the highest stage you have mastered.
- **Focus:** this is your health bar. A bump costs Focus, gives a short break with no bumps, and the student says something chatty. When Focus runs out, the shift is over and the game shows a summary (books shelved, best combo, score, best score, the mistake to practice).
- **Students:** they get more numerous and faster as the run goes on:
  - chatty walkers who drift toward you
  - runners who cross the room in a straight line
  - friend groups
  - Calmed students sit down at a table and read, so the room fills with readers.
- **Power-ups:** a full Sorting meter lets you pick 1 of 3. Each has 5 levels.
  - **Shush Bell** (you start with it): a calming wave around you every few seconds
  - **Paper Notes:** a note flies to the nearest student and calms them
  - **Story Rug:** students near you slow down to listen
  - **Bookmark Magnet:** picks up books from farther away
  - **Book Cart:** carry more books
  - **Sneakers:** move faster
  - **Reading Glasses:** book labels show hundreds, tens and ones in color
  - **Cocoa Break:** Focus comes back slowly
  - **Library Card:** blocks one bump now and then
- **Host:** Librarian Mx. Okafor gives a 20-second calm start with a short tutorial on the first run.
- **Learning model:** one skill per stage. Each book's first shelving attempt is recorded. Mistakes that are diagnosed:
  - reading the last digit
  - the middle digit
  - reading a 2-digit number as hundreds
  - the next shelf over, or a range boundary
  - flipping < and >
- **Standards:** 1.NBT.2, 1.NBT.3, 2.NBT.1, 2.NBT.4.

**Build notes (2026-10-02):**

- **Code:** `games-src/adventures/src/games/math-dash/`:
  - `problems.ts`: shelves, book numbers, mistake diagnosis
  - `powers.ts`: power-up levels to numbers
  - `world.ts`: the library and everything that moves
  - `game.ts`: rules, HUD, level-ups, the end-of-shift summary
  - `content.ts`: all the words
- **Kit additions:**
  - a camera zoom option
  - `<`, `>` and `s` in the pixel font
  - repeated toasts no longer stack
- **Site:**
  - the listing points to `/games/play/math-dash/index.html` (same slug, so old links still work)
  - new card picture
  - the old `public/games/math-dash.html` stays until Phase 4 (the World demo still uses it)
- **Checks:**
  - 12 unit tests: every book has exactly one shelf, the traps appear, the mistakes are diagnosed, the power-up rules hold
  - 34 browser checks (`scripts/e2e-math-dash.mjs`): a full shift from the title screen, a wrong and a right shelf, the hint arrow, a level-up, the stage change, students and bumps, the Shush Bell, pause, the grown-ups page, the end of the shift, saving, and the phone joystick and layout
  - about 46 fps with 36 students on screen (software rendering)

**Self-score**

| Category | First build | After fixes |
|---|---|---|
| Gameplay and fun (2.5) | 1.7 | 2.1 |
| Learning quality (2.0) | 1.6 | 1.8 |
| Visual and audio polish (1.5) | 0.9 | 1.3 |
| Usability and accessibility (1.5) | 0.9 | 1.3 |
| Technical reliability (1.5) | 1.0 | 1.4 |
| Completeness (1.0) | 0.9 | 0.95 |
| **Total** | **7.0** | **8.85** |

Problems found in the first build, all fixed:

- the shelf signs were blank
- the camera was too close to plan a route
- the front-row bookcases hid the player and the readers behind them
- "30–39" and "250 to 399" could not be drawn in the pixel font
- "500s" looked like "5005"
- holding a key after a wrong shelf counted two misses
- the front-row shelves could be "touched" from behind
- the glowing hint sign could be off screen (an arrow now points to it)
- the same tip stacked three times
- books appeared behind the librarian's desk
- on phones, the stage banner and the tips covered the top of the screen

Known issues (none blocking):

| # | Issue | Severity |
|---|---|---|
| 1 | When a right book is shelved, any next books in hand that belong on the same shelf are shelved too (and count as right). This keeps the game fast but gives a little less practice per book | Low |
| 2 | Students walk straight at you and can bunch up behind tables. That is fine for a survivors game, but they could path around furniture | Low |
| 3 | Tips appear as text at the top during action. Read-aloud is off by default for this grade band (it can be turned on in Settings) | Low |
| 4 | Frame rate measured with software rendering only; check on a real device | Low |

#### M3 Money and time: COMPLETED ✅ (owner tested, approved and merged 2026-10-03 in PR #210)

**Owner decisions (2026-10-03):**

- **Money Market:** the player earns coins by getting the money math right and spends them to upgrade what the stand serves: food, drinks and condiments. The more math they get right, the more coins they have for upgrades.
- **Time Attack Clock:** build the proposed design (a town clock tower that keeps the town on schedule). The owner will test it and suggest changes.

**Money Market Madness (slug `money-market-madness`, grades 1–4; Cafeteria Cashier merged in, and its old link redirects):**

- **Running the stand:**
  - Each market day has a line of customers.
  - Each customer orders from your menu. You take their money, and at higher levels you make change.
  - A customer's patience only runs down while they wait in line, never while you are serving them.
- **The math, by level (one learner skill, 4 tiers):**
  1. Count the coins a customer hands over (pennies, nickels, dimes; up to 50¢).
  2. Count coins with quarters up to $1, and answer "Is it enough?" for the price.
  3. The customer pays with a $1 bill: make change by tapping coins into the change tray (counting up).
  4. Two items: add the total, then make change from $5 with bills and coins.
- **Mistakes that are diagnosed:**
  - counting coins instead of their value
  - a nickel/dime mix-up (the bigger coin is worth less)
  - a quarter counted as 20¢
  - giving the price instead of the change
  - change off by 10¢ or by $1
- **Earning and upgrades:**
  - Every sale's money goes into the till, with a tip for a first-try answer.
  - Between days you spend it in the upgrade shop:
    - **Food** (popcorn, then pretzels, hot dogs, tacos, pizza)
    - **Drinks** (water, then lemonade, fruit punch, smoothies, hot cocoa)
    - **Condiments and toppings** (salt, ketchup, mustard, cheese, sprinkles), which customers can add to orders
    - **Stall looks** (awning, lights, sign, plants)
  - New items bring more customers and bigger tips, and the stand looks fancier. Prices on the menu follow the learner's level, so the math stays at the right grade.
- **Standards:** 1.MD (counting coins), 2.MD.8, 3.OA.8 (two-step), 4.MD.2 (money with decimals).

**Money Market as built:** Chef Amara hands the player the stand. A market day has 6 to 14 customers (more with upgrades). Each one orders from the menu, and the till panel walks through the steps for the player's level. Money and tips go in the till, and between days the upgrade shop sells 19 upgrades on four lines:

| Line | Items, in order |
|---|---|
| Food | popcorn (free), pretzels, hot dogs, tacos, pizza |
| Drinks | water (free), lemonade, fruit punch, smoothies, hot cocoa |
| Toppings | salt, ketchup, mustard, cheese, sprinkles |
| Stall | awning, sign, flower pots, string lights |

Every purchase shows on the stand, and the shop shows the subtraction ("$25.00 − $1.50 = $23.50 left"). Hints: a tip, then coin values and running totals (or the count-up path for change), then the answer filled in. Code: `games-src/adventures/src/games/money-market-madness/`. Self-score 8.9/10 (11 unit tests, 20 browser checks).

**Time Attack Clock (slug `time-attack-clock`, grades 1–3), as built:**

- **The story:** the town clock tower has stopped. Mr. Tock the clockmaker asks the player (a "time keeper") to help three people in the square. Each job finished with 5 stars brings back one part of the tower, and the day moves toward evening:

  | Place (person) | Skill | Level 1 | Level 2 | Level 3 | Fixes |
  |---|---|---|---|---|---|
  | School Bell (Ms. Rivera) | Read a clock | hours and half hours | five-minute steps, "quarter past/to" | to the minute | the hands |
  | Bus Stop (Driver Dee) | Set a clock by dragging the hands | hours and half hours | five-minute steps | to the minute | the bell |
  | Bakery (Baker Bo) | How long? (elapsed time) | whole hours | minutes inside one hour | across the hour (2:50 to 3:15) | the lights |

- **The clock:** pixel art with a short navy hour hand and a long red minute hand. Dragging the minute hand moves the hour hand too, like a real clock, so going past 12 changes the hour. Arrow buttons and arrow keys do the same.
- **Mistakes that are diagnosed:** hands swapped; the hour hand read as the next hour (2:45 as 3:45); the number the minute hand points to read as minutes (on the 4 = 4 minutes); counting backwards; "past" and "to" mixed up; "quarter to 2" for 2:45; subtracting times like ordinary numbers (3:15 − 2:50 = 65); 2:75; keeping the old hour.
- **Hints:** a tip, then a picture helper (the hour shaded yellow, the minutes counted by fives round the clock, or the count-on jumps), then the answer (or green "ghost" hands to copy).
- **Time Attack:** Mr. Tock's 60-second round of reading clocks near the player's level, with a best score and bronze, silver and gold medals. It is the only timer in the game.
- **Finale:** all three parts back, Mr. Tock rings the bell, and the town lights up for the evening.
- **Standards:** 1.MD.3, 2.MD.7, 3.MD.1.
- Code: `games-src/adventures/src/games/time-attack-clock/`. Self-score 9.0/10 (11 unit tests, 37 browser checks).

#### M4 Addition, subtraction and mixed operations: COMPLETED ✅

**Owner decisions (2026-10-03):**

- The plans for both M4 games are approved. The owner especially likes Math Adventure Island (Treasure Hunt Calculator and Math Jeopardy Junior merged in).
- **Math Race Rally should feel like a real racing game:**
  - You steer the car all the time and it never stops moving.
  - Questions appear, and you race toward the answer on the track.
  - A right answer speeds you up; a wrong one slows you down.
  - You race a CPU car.
- **Math Memory Match is the pit stop at the end of every race.** Correct matches earn cosmetic upgrades for the car (paint color, style, type of car and more).
- **View:** behind the car (classic arcade racer), picked over a top-down track.
- The games are built one at a time: Math Race Rally first, then Math Adventure Island.

**Math Race Rally (slug `math-race-rally`, grades 1–5; Math Memory Match merged in, and its old link redirects):**

- **The race:**
  - A pixel-art road seen from behind the car, with curves and hills, drawn with Three.js at low resolution and scaled up into crisp pixels.
  - The car always drives forward. The player steers left and right with the arrow keys, A/D, or on-screen buttons. Number keys 1–3 (or tapping an answer) steer to that lane for players who find steering hard.
- **The questions:**
  - Each question appears at the top with three answer gates ahead, one per lane. Driving through the right gate gives a boost and raises the speed level; the wrong gate slows the car one level, never to a stop.
  - The gates are placed far enough ahead to give real thinking time at any speed.
  - After two misses in a row, the next question shows a strategy hint.
- **The rival:**
  - A CPU car drives the same road at a steady pace.
  - Getting most answers right is how you pass it.
  - Winning races unlocks new tracks: Sunny Hills, Desert Canyon, Seaside and Neon City at night.
- **The math, by level (one learner skill, five tiers):**
  1. Add and subtract within 10.
  2. Within 20, with make-a-ten and doubles.
  3. Two-digit and one-digit numbers, and adding or subtracting tens.
  4. Two-digit numbers with regrouping.
  5. Three-digit numbers.
- **Mistakes that are diagnosed:**
  - counting on from the first number (off by one)
  - forgetting to regroup
  - taking the smaller digit from the bigger (52 − 27 = 35)
  - adding instead of subtracting
  - mixing up tens and ones
- **After the finish:**
  - A results card with your place and your answers.
  - A review of missed questions, each with the strategy that solves it.
- **The pit stop (Math Memory Match):**
  - Flip cards to match each fact with its answer. The facts come from the race, with missed ones first.
  - Each match earns bolts. The garage spends bolts on cosmetics:
    - paint colors
    - stripes and decals
    - wheels
    - spoilers
    - car types (kart, roadster, pickup truck, bubble car, rocket)
- **Standards:** 1.OA.6, 2.OA.2, 2.NBT.5, 2.NBT.7, 3.NBT.2.
- **Status: COMPLETED ✅** (owner tested, approved and merged 2026-10-03 in PR #211). Code: `games-src/adventures/src/games/math-race-rally/`. Self-score 9.0/10 (15 unit tests, 29 browser checks).
- **Owner feedback (2026-10-03):** "This actually plays really well." One change: after you pass Dash, a couple of wrong answers should let Dash pass you again.
  - **Done:** Dash now follows your momentum. It goes up 1 for each right answer and down 2 for each wrong one, and stays between −3 and +3.
  - After a run of right answers he sits well behind. One miss lets him close right in, two misses in a row and he passes, and a few right answers in a row put you back in front.
  - A message says when Dash passes you.
  - Races now stay close to the finish: 5–6 right answers out of 10 loses, and 8 or more wins.

**Math Adventure Island (slug `math-adventure-island`, grades 2–5; Treasure Hunt Calculator and Math Jeopardy Junior merged in, and their old links redirect). COMPLETED ✅ (owner tested, approved and merged 2026-10-05 in PR #212):**

- **The story:**
  - The player is an explorer on an island with Captain Zuri.
  - Four zones each have a helper with word problems for one operation.
  - The Treasure Hunt beach hides four map pieces.
  - The Quiz Show stage opens once all four zone torches are lit.
- **Word problems, in three steps:**
  1. **What is the question asking?** Pick the right restatement ("How many more shells does Mia have than Leo?").
  2. **Which operation?** Pick +, −, × or ÷. Some problems are built so the key word is a trap (they "got more" but you subtract to find what they started with).
  3. **Solve**, with wrong answers made from real mistakes.
  - The hints are a tip, then a picture model (a bar model or an array), then the answer.
  - A star needs every step right the first time. Five stars light the zone's torch.
- **The zones** (one learner skill each, three tiers):

  | Zone (helper) | Tier 1 | Tier 2 | Tier 3 |
  |---|---|---|---|
  | Shell Hut, + (Mo) | join within 100 | missing part: start + ? = end | three-digit, start unknown |
  | Fishing Boat, − (Ana) | take away within 100 | compare: how many more or fewer | bigger numbers, how many more needed |
  | Coconut Grove, × (Tavi) | equal groups of 2, 5 and 10 | arrays and facts to 10 × 10 | two-digit × one-digit, "times as many" |
  | Mango Stall, ÷ (Bao) | share equally (facts) | how many groups | remainders: how many boats (round up) or full bags (drop the rest) |

- **Treasure Hunt (Treasure Hunt Calculator):**
  - Each clue is estimate first, then calculate, then a reasonableness check ("Pip got 1,699. Is that reasonable?").
  - The clue then gives a grid square (B3, or (3, 4) at the top level). The player walks to that square on the beach grid and digs.
  - Four dig sites give four map pieces, which lead to the island's hidden treasure.
- **The Quiz Show finale (Math Jeopardy Junior):**
  - A board of 4 categories × 3 point values, against Pip the parrot. Pip scores on the questions you miss.
  - After a right answer on a 200- or 300-point tile comes a **"Show your strategy"** bonus: which strategy works for this problem?
  - Beating Pip wins the island trophy.
- **Standards:** 2.OA.1, 2.NBT.5, 2.NBT.7, 3.OA.3, 3.OA.8, 3.NBT.1, 3.NBT.2, 4.OA.2, 4.OA.3, 4.NBT.5, 5.G.1.
- **How it was built:**
  - The island is a walking world like Time Attack Clock: Captain Zuri in the middle, the four zones around her, Pip the parrot on a perch by the beach grid, and the Quiz Show stage at the top with a tiki torch for each zone.
  - The beach grid has letters A–E along the bottom (with 1–5 under them for the (across, up) clues) and 1–4 up the side. The player walks onto a square and presses Dig; a wrong square says why (swapped across and up, or just the wrong square).
  - Digging all four map pieces shows the pirate's chest next to Pip, with the golden coconut inside. Pip offers new hunts afterwards for practice.
  - The Quiz Show gives one try per question. A wrong answer gives Pip the points and shows the explanation. Winning the first time plays the finale: night falls and the torches blaze. Rematches are always open.
  - The picture hints: a bar model for joining, missing parts and comparing; equal groups or an array of dots for multiplying; sharing boxes (with a "left over?" box) for dividing. When a problem is solved, the "?" in the picture fills in with the answer.
- **Status: COMPLETED ✅** (merged 2026-10-05 in PR #212). Code: `games-src/adventures/src/games/math-adventure-island/`. 12 unit tests, 49 browser checks (`scripts/e2e-math-adventure-island.mjs` plays a new game through all four torches, a whole treasure hunt with a wrong dig, and a winning Quiz Show to the finale).
- **Score (Seeds of Genius rubric): 9.0/10.**

  | Category | Score | Evidence |
  |---|---|---|
  | Gameplay and feel (2.5) | 2.15 | Three different kinds of play (helping islanders, a treasure hunt where you walk to the square and dig, a game show against a cheeky parrot), and the torches and map pieces show progress on screen. Nothing is timed. |
  | Learning accuracy and clarity (2.0) | 1.9 | Every word problem is split into "what is it asking", "which operation", "solve", so a slip shows where it happened. Key-word traps, regrouping, remainders and place value each get their own sentence. |
  | Visual and audio polish (1.5) | 1.3 | Pixel-art island with a hut, boat, grove, mango stall, game-show stage with curtains, lit tiki torches and Pip in two frames; three songs. The finale is a night scene, not an animation. |
  | Usability and accessibility (1.5) | 1.35 | Number keys, H for hints, read-aloud on every line, tap to walk, all four operation buttons in one row on a phone, 0 sideways scrolling at 390 px. |
  | Technical reliability (1.5) | 1.35 | 12 unit tests (every zone and tier for 300 seeds), 49 browser checks, no console errors, nothing loaded from the internet. |
  | Completeness (1.0) | 0.95 | Own characters (Captain Zuri, Mo, Ana, Tavi, Bao, Pip), grown-ups page with standards and a progress table, save and continue, old links redirect. |

#### M5 Geometry: COMPLETED ✅ (owner-approved and merged: half 1 in PR #213, half 2 in PR #214, 2026-10-06)

**Owner decisions (2026-10-05):** a walking world (A); the building yard and clubhouse setting; built in two halves (first the yard, the Shape Sorting Arcade and the Block Shop for a quick look, then the Blueprint Workshop, the Garden Yard and The Big Build); the Garden Yard's top level includes grade 4 (4.MD.3). Working title "Shape Town Builders" (the owner can rename it).

**Shape Town Builders (slug `geometry-builder-challenge`, grades K–4; Shape Sorting Arcade merged in, and its old link redirects)**

> Source: the old site games `public/games/shape-sorting-arcade.html` (K–2) and `public/games/geometry-builder-challenge.html` (2–4).
> Merge (from the merge map in section 4): **geometry-builder-challenge** survives; `/games/shape-sorting-arcade` redirects to it. Shape Sorting Arcade lives on as the arcade machine inside the game. The working title "Shape Town Builders" is a suggestion; the owner picks the final name (see Choices).

##### What the originals do

- **Shape Sorting Arcade teaches:** naming 2D shapes and counting their sides (K.G.2, 1.G.1). One screen, endless random questions of two kinds: "What shape is this?" (4 name bins) and "How many sides?" (4 number bins). Score, streak, and a "Level" that goes up every 100 points but changes nothing.
- **Geometry Builder Challenge teaches (in intent):** composing pictures from shapes. Five fixed challenges (house: 1 triangle roof, robot: 2 squares for the body, car: 4 circle wheels, castle: 4 rectangle towers, tree: 3 circle leaves), each answered by typing a number.
- **Keeps (the learning content):**
  - the five shapes and the two question types from Shape Sorting Arcade (name it, count its sides) as level 1–2 of the sorting station
  - the "drop the shape in the right bin" action, now on a conveyor in an arcade machine
  - score, streak and a reason to beat your best, as the arcade machine's high score
  - the five blueprints (house, robot, car, castle, tree) and their shape counts, as the first blueprints in the workshop
- **Missing against the standard (checked 2026-10-05):**
  - **Geometry Builder Challenge shows no picture.** "How many circles for leaves?" can only be guessed (the answer is 3, but nothing on screen says so). Every question needs a drawn blueprint.
  - Shape Sorting Arcade draws only regular shapes pointing up, all the same size. There are no circles, rectangles, irregular or turned shapes, so the classic mistakes ("a turned square is a diamond", "a skinny triangle isn't a triangle") are never tested. (Its square is always drawn standing on a corner, so a child who calls it a "diamond" is marked wrong with no explanation of why it is still a square.)
  - Wrong "how many sides" choices are random numbers from 3 to 10 (for a triangle: 3, 6, 4, 7), not real mistakes. Feedback is "Wrong! Correct: pentagon".
  - Neither game ends (the Game Over screen is never reached), and neither covers the top of the K–4 band: no 3D shapes, composing, area or perimeter.
  - No levels that adapt, hints, debrief, grown-ups page, saves, sound, keyboard shortcuts or read-aloud. Emoji are the art (9 and 8 emoji); the bins are 📦 emoji.
  - Good: no console errors, no network requests, no sideways scrolling at 390 px.

##### The game

- **Setting:** Shape Town, a sunny building yard where the town is putting up a new clubhouse, with an arcade, a block shop, a carpenter's workshop and a garden yard around the empty building site.
- **Characters:**
  - **Host: Master Builder Odette**, the town's chief builder: older, dark brown skin, grey locs under a yellow hard hat, orange safety vest, a rolled-up blueprint under one arm. She explains the clubhouse, hands out jobs and cuts the ribbon at the end.
  - **Kofi** runs the Shape Sorting Arcade (teen, red cap, arcade-token apron).
  - **Lupe** runs the Block Shop of solid shapes (young woman, curly black hair, green apron).
  - **Mr. Haruto** runs the Blueprint Workshop (older man, glasses, grey beard, tool belt).
  - **Priya** runs the Garden Yard, where fences and tiles are measured (sun hat, measuring tape, overalls).
  - **Chip the beaver**, the cheeky sidekick, "helps" by chewing blocks into the wrong shapes and offering wrong ideas the player corrects ("That one's turned, so it's a diamond, not a square!"). Chip is the rival in the arcade's Rush mode. Own 48×48 portrait.
  - The story text uses names, not "he" or "she".
- **How it plays:**
  - The player walks the yard (arrow keys, WASD, tap to walk). A sign over a person marks a job. Talking opens that station's panel of challenges.
  - Each station has 3 levels picked by the learner model. Five stars at a station delivers a part of the clubhouse, which appears on the building site in the middle: walls (Kofi), pillars and blocks (Lupe), roof and windows (Mr. Haruto), garden and fence (Priya).
  - **The arcade machine (Shape Sorting Arcade):** shapes ride a conveyor towards bins with labels ("3 sides", "4 sides", "curved"). The player sends each shape to a bin with 1–3, the arrow keys or a tap. In the normal mode the belt waits for you. An optional 60-second **Rush** mode against Chip keeps a best score (nothing on the main path is timed).
  - **Finale, "The Big Build":** when all four parts are in, Odette lays out the final blueprint. The player fits the last pieces: each piece is one mixed challenge from the four stations at the player's current level. Then the clubhouse opens at sunset: lanterns light up, the townsfolk gather, Odette cuts the ribbon and the finale song plays.
  - **Replay:** Arcade Rush best score, new blueprints in the workshop, new garden plans from Priya, and cosmetic hard hat and vest colors earned from stars.
- **Modeled on:** `time-attack-clock` (a walking world where each job delivers a part of one big building, then a finale at the tower), with the station panels and multi-step `StepDef` from `math-adventure-island` and the 60-second challenge mode from Time Attack. The conveyor is a small new scene inside the arcade panel.

##### Learning design

| Station (helper) | Skill | Level 1 | Level 2 | Level 3 | Standards |
|---|---|---|---|---|---|
| Shape Sorting Arcade (Kofi) | 2D shapes and their attributes | Name triangle, square, rectangle, circle, hexagon, drawn in **different sizes, colors and turns**, plus skinny and upside-down triangles | Count sides and corners, including irregular pentagons and hexagons and the original's octagon. "Is it a shape?" sorts with a gap or a curved side | Sort by rules: "4 sides" vs "4 equal sides" vs "4 square corners"; a square belongs in the rectangle bin too; spot the odd one out | K.G.2, K.G.4, 1.G.1, 2.G.1, 3.G.1 |
| Block Shop (Lupe) | 3D solid shapes | Flat or solid? Name cube, sphere, cone, cylinder, box (rectangular prism) | Roll, stack or slide? Match everyday things (a can, a ball, an ice cream cone, a dice) | Faces: how many flat faces, and which flat shape is each face (a cube's faces are squares; a cylinder's are circles), counting the faces you can't see | K.G.1, K.G.2, K.G.3, K.G.4, 1.G.2 |
| Blueprint Workshop (Mr. Haruto) | Composing and partitioning | Count the shapes in a drawn blueprint (the original five: house, robot, car with all 4 wheels shown, castle, tree, plus new ones) | Compose: which pieces fill the outline (2 triangles make a square, 3 triangles make a trapezoid, 6 triangles make a hexagon) | Partition a rectangle into rows and columns of same-size squares and count them | K.G.6, 1.G.2, 2.G.1, 2.G.2 |
| Garden Yard (Priya) | Area and perimeter on a grid | Area by counting unit squares; perimeter by counting the fence pieces around a garden on a grid | Area of a rectangle as rows × columns; perimeter of a rectangle with labeled sides | L-shaped gardens split into two rectangles (area), a missing side length, and "same area, different fence" (3 × 4 and 2 × 6 both make 12, but the fences are 14 and 16) | 3.MD.5, 3.MD.6, 3.MD.7, 3.MD.8, 4.MD.3 |

(Level 3 of the arcade is the top of grade 2 and the start of 3.G.1: no parallel-sides wording, only sides, equal sides and square corners.)

- **Mistakes the wrong answers come from** (each wrong choice carries one tag, and each tag has a sentence in `content.ts`):
  1. **turned-not-same**: a square on its corner is called a "diamond", not a square. "Turning a shape doesn't change it. Count: still 4 equal sides and 4 square corners."
  2. **only-the-usual-one**: a skinny or upside-down triangle is "not a triangle". "Any closed shape with 3 straight sides is a triangle, even a skinny one."
  3. **size-or-color**: a big shape is picked as a different shape from a small one. "Size and color don't change a shape's name."
  4. **sides-vs-corners**: counts corners when asked for sides, or the other way (they differ for open shapes and for a circle, which has no corners). "Sides are the straight edges. Corners are where two sides meet."
  5. **count-slip**: one side counted twice or skipped (the answer is one off). "Start at the dot and touch each side once."
  6. **open-or-curved**: a shape with a gap or a curved side sorted as a triangle or square. "A triangle needs its sides closed up and straight."
  7. **square-not-rectangle**: "a square can't be a rectangle". "A rectangle needs 4 square corners. A square has them too!"
  8. **flat-name-for-solid**: a cube called a "square", a sphere a "circle". "Square is flat. This one is solid, so it's a cube."
  9. **visible-faces-only**: counts the 3 faces you can see on a cube. "Some faces hide at the back and bottom."
  10. **roll-stack**: thinks a cone can't roll, or a sphere can stack.
  11. **missed-hidden-or-double**: in a blueprint, counts the same piece twice or misses the back wheels.
  12. **pieces-make-bigger**: thinks two triangles that make a square make a bigger square.
  13. **area-perimeter-swap**: gives the area when asked for the fence, or the other way.
  14. **perimeter-counts-squares**: counts the squares along the edge (corners twice or missed) instead of the edges.
  15. **two-sides-only**: adds length + width once (7 instead of 14).
  16. **add-for-area**: adds the sides for area (3 + 4 = 7 instead of 12).
  17. **missing-side / overlap-double**: in an L-shape, forgets an unlabeled side, or counts the overlap twice.
- **Steps** (multi-step, Garden Yard level 3 only): which rectangles make the L? → area of each part → add them. A star needs all three right first time.
- **Hint ladder** (H or the Hint button; a second miss opens the next rung):
  - nudge: "Count the corners. Does turning it change them?" · "Is the fence around the garden, or the ground inside it?"
  - picture: the shape's corners light up one by one with numbers; a cube unfolds into its net of 6 squares; the blueprint pieces are outlined in color; the garden's fence pieces are numbered around the edge, or the rows are shaded one at a time (the last count is left to the child)
  - answer: the right choice is outlined with its explanation
- **Debriefs** (`talk.ask`, one per station, recorded as `<skill>-talk`):
  - Kofi: "Chip turned this square on its corner. Is it still a square?" → yes, the sides and corners didn't change / no, it's a diamond now (turned-not-same) / only if it's big (size-or-color)
  - Lupe: "Why can a cylinder roll AND stack?" → it has a curved side and flat faces / it's light / it's round all over (roll-stack)
  - Mr. Haruto: "Two triangles made this square. Is the square bigger than the two triangles together?" → no, same space / yes (pieces-make-bigger) / depends on the color
  - Priya: "Two gardens both cover 12 squares. Do they need the same fence?" → not always (3 × 4 needs 14, 2 × 6 needs 16) / yes, same area means same fence (area-perimeter-swap) / the bigger number always needs less
- **Progress and finale:** 5 stars per station (a star is a clean first try with at most the first hint), plus level 2 or 12 questions played, unlocks that station's clubhouse part, shown on the building site and in the top-left HUD. All four parts open The Big Build. The arcade, new blueprints and garden plans stay open afterwards.
- **Where to start:** all four stations are open from the start. The job list suggests a path by grade (K–1: Kofi and Lupe, 2: Mr. Haruto, 3–4: Priya), and each station's level adapts, so a kindergartner and a fourth grader both finish.
- **Difficulty change from the originals:** from one question type at the bottom of K–2 (and five unanswerable questions for 2–4) to the full K–4 band: turned and irregular shapes, rule-based sorting and the square-is-a-rectangle idea, 3D solids and hidden faces, composing and partitioning, and area and perimeter up to L-shapes and "same area, different perimeter". Harder by structure (rules, steps, hidden parts), never by speed; only the optional Rush mode has a timer.

##### Choices for the owner

1. **The kind of game.**
   - **A. Walking world with an arcade inside (recommended):** the building yard with four stations and the clubhouse, as above. The conveyor arcade is one station plus an optional Rush mode. Fits the K–4 mix of skills best and gives the youngest players time to think.
   - **B. Arcade-first factory:** a Library Rush-style action game. The player runs around a toy factory catching shapes off conveyors and carrying them to the right bins while dodging Chip, with blueprint and garden rounds between stages. More action, but it suits the older half of the band better than kindergartners, and area and perimeter fit awkwardly into a run.
   - **C. Don't merge:** rebuild Shape Sorting Arcade on its own (K–2, arcade only) now, and Geometry Builder Challenge (2–4) as a separate game later. That changes the merge map (Math would end with 12 games instead of 11).
2. **The name.** "Shape Town Builders" (new), "Geometry Builder Challenge" (keep the old title), or "Shape Sorting Arcade" (the name you used). The address stays `/games/geometry-builder-challenge` either way, and `/games/shape-sorting-arcade` redirects.
3. **Top of the band.** Stop at grade 3 area and perimeter (3.MD.5–8), or also include 4.MD.3 (the area and perimeter formulas with bigger numbers) at level 3 of the Garden Yard, as planned above.

4. **Build in two halves?** It's a big game (four stations, K–4). Recommended: build the yard, the Shape Sorting Arcade and the Block Shop first (the K–2 half) for a quick look from you, then the Blueprint Workshop, the Garden Yard and The Big Build.
5. **Setting.** The building yard and clubhouse above, or a toy factory getting ready for a Toy Parade (Foreman Tess and Cubby the robot), with the same four stations.

##### Half 1 built (2026-10-05): the yard, the Shape Sorting Arcade and the Block Shop

- **The yard:** a walking world with the clubhouse on its site in the middle, scaffolding at first. Each finished job adds a part: walls from the arcade, pillars and steps from the block shop (the roof and the garden come in half 2). Odette in a hard hat, Kofi, Lupe, Mr. Haruto and Priya (the last two say their places open soon), and Chip the beaver (two frames, his own portrait).
- **Kofi's Shape Sorting Arcade:** each shape slides in on a moving conveyor belt; the player sends it to one of three bins (number keys, click or tap). Right: it drops into the bin. Wrong: it wobbles and the reason appears. Level 1 naming (squares on a corner, skinny and upside-down triangles, long rectangles, circles); level 2 counting sides and corners, and "is it a real triangle?" (gaps, curved sides, slanted corners); level 3 rule bins ("4 square corners": the square goes in too) and odd-one-out from three shapes. Hint 2 numbers every corner on the shape.
- **Lupe's Block Shop:** a block on her counter. Level 1 flat or solid and naming solids (a cube is not "a square"); level 2 roll, stack or both, and everyday things (a soup can is a cylinder); level 3 flat faces, including the hidden ones (dashed edges in hint 2), and the shape of a face (a cone's face is a circle, not a triangle).
- **Rush mode with Chip:** 60 seconds of quick naming and counting against Chip's steady score; best score saved, a gold hard hat for a win. The only timer in the game.
- **Tests:** 9 unit tests (every level over 400 seeds: one right bin, every wrong bin tagged with its mistake, a turned square is always a square, a square fits "4 square corners"); browser test `scripts/e2e-geometry-builder-challenge.mjs` 28/28 (title → Kofi by walking → wrong bin, hints, star rules → walls → pillars → a coming-soon helper → Chip → Rush → reload → grown-ups → phone layout); screenshot tour `scripts/stb-tour.mjs`.
- **Not yet:** the site still lists the old Geometry Builder Challenge; the new game replaces it (and Shape Sorting Arcade's link redirects) when half 2 ships. Try it at `/games/play/geometry-builder-challenge/index.html` on the PR's preview.
- Half 1 merged by the owner in PR #213 (2026-10-06). The owner is collecting full team QA feedback on all the remastered games and asked to carry on with half 2 meanwhile.

##### Half 2 built (2026-10-06): the Blueprint Workshop, the Garden Yard and The Big Build

- **Mr. Haruto's Blueprint Workshop** (blueprints on blue paper):
  - Level 1: count one kind of shape in a blueprint. The original five builds are kept (house, robot, car with all 4 wheels, castle with 4 rectangle towers, tree with 3 circle leaves) and three are new (rocket, train, flower). The car's two back wheels peek out from behind the body. The game never asks for rectangles when squares are in the picture, because a square is a rectangle too.
  - Level 2: how many pieces fill a shape (2 triangles make a square, 3 make a trapezoid, 6 make a hexagon, 2 trapezoids make a hexagon, 4 small triangles make a big one), with the piece drawn beside the shape at the same size.
  - Level 3: rows and columns of window panes, and a floor with only its first row and column of tiles drawn.
  - Wrong answers come from real mistakes: missing a hidden piece, counting one twice, counting every piece, counting a square door as a square, counting the big shape's corners, adding rows and columns, counting only the drawn tiles.
  - Hint 2 colors in and numbers the asked shapes (with dashed outlines for hidden ones), draws dashed lines where the pieces meet, or shades the rows.
- **Priya's Garden Yard** (garden plans):
  - Level 1: count the grass squares (area), or the fence pieces all the way round (perimeter), on a grid with a fence and posts.
  - Level 2: a garden with labelled sides. Multiply for area; add all four sides for the fence.
  - Level 3:
    - L-shaped gardens in three steps: which two rectangles, the area of the tall part, then the whole L. A star needs all three steps right.
    - Missing side lengths from the area or the fence (4.MD.3, sides up to 12).
    - "Same area, different fence": two gardens of 12 to 24 squares.
  - Wrong answers: area and perimeter swapped, edge squares counted instead of fence pieces, only two sides added, sides added for area, the notch left out, the overlap counted twice, and "same area means same fence".
  - Hint 2 numbers the squares or fence pieces, draws the grid inside, labels all four sides, or colors the two parts of the L.
- **The Big Build:** once all four parts are in, Odette offers the finale: four pieces of the final blueprint, one question from each job at the player's level (no stars, nothing timed). Then the sun sets, the four helpers and Odette gather in front of the clubhouse, bunting and lanterns appear and Odette cuts the ribbon (Chip "helped" by chewing it). After that the yard stays in the evening and every job stays open.
- **Debriefs:** Mr. Haruto ("Is the square bigger than the two triangles put together?") and Priya ("Two gardens both cover 12 squares. Same fence?").
- **Site:** listed as "Shape Town Builders" (grades K–4) at `/games/geometry-builder-challenge`, with a new card picture. `/games/shape-sorting-arcade` redirects there, and the old Shape Sorting Arcade listing is gone. The old HTML files stay until the Phase 4 cleanup.
- **Tests:**
  - 16 unit tests (7 new): blueprint counts match the drawing; every composition's pieces cover the shape exactly (checked by area); every level over 400 seeds has one right answer, and every wrong answer is tagged with its mistake; the L's answer equals the whole rectangle minus the notch; same-area pairs really have the same area and different fences.
  - Browser test `scripts/e2e-geometry-builder-challenge.mjs`: 46/46. It covers title → all four jobs (Mr. Haruto reached by walking, a three-step L-shaped garden) → Chip and Rush → The Big Build → the opening at sunset → reload → grown-ups (four jobs) → phone layout for all four panels.
- **Score: 9.1/10** (gameplay 2.2, learning 1.9, look and sound 1.25, ease of use 1.4, reliability 1.4, completeness 0.95). It loses points on: a lot of the play is answering in panels (but with four kinds of pictures and a finale), the evening tint is gentle, and the card picture shows the yard before building starts.

##### Checks it will ship with

Unit tests for every station, level and step over 300 random seeds (one correct choice, every wrong choice tagged, blueprint counts match the drawing, area and perimeter checked); a browser test playing title → all four stations → The Big Build → a Rush round; screenshots at 1280×720 and 390×844 reviewed by eye; a score against the rubric (8.5 to pass).

#### M6 Fractions: Forum Fraction Feast COMPLETED ✅ (owner approved and merged 2026-10-09 in PR #220)

The first game built in a new world (game worlds phase W2, `docs/GAME_WORLDS_PROPOSAL.md`). The owner placed M6 in **Ancient Kingdoms**, and approved the **Roman forum** setting from the kit (`src/kit/worlds/ancient-kingdoms/forum.ts`), so this game is set there: 24 pixels per tile, 16-bit characters, the forum's day and dusk light.

##### "Forum Fraction Feast" (slug `pizza-fraction-frenzy`, grades 2–4)

> Source: the old site game `public/games/pizza-fraction-frenzy.html`; merges the activity `public/lessons/fraction-pizza-party.html` (its link will redirect). The final name is an owner choice (below); the slug stays so the old link keeps working.

##### What the originals do

- **Pizza Fraction Frenzy (game, 2–4) teaches:** matching a fraction (1/2, 1/3, 2/3, 1/4, 3/4, 1/8, 3/8, 5/8, 7/8) to a pizza drawing, against a 60-second timer, for points.
- **Fraction Pizza Party (activity, 2–4) teaches:** naming the fraction eaten or left of a pizza cut into 3, 4, 6 or 8 slices (10 fixed word problems), plus a pizza you tap to eat slice by slice while the fraction counts down from 8/8.
- **Answers checked:** all 10 Fraction Pizza Party answers and all 9 Frenzy fractions are correct.
- **Kept:** the nine Frenzy fractions as the level 1–2 set, every Pizza Party word problem (eaten vs left, "three friends share", "the whole is 4/4"), the tap-to-eat demo (it becomes the opening with the goose), the serving loop and the 60-second race (it becomes the optional Frenzy mode).
- **Missing against the standard:**
  - Both games print the fraction under or on the picture, so a child can match symbols without reading the picture at all.
  - One level, no equal-shares, number line, comparing or equivalence work, although the merge map gives this game all of them.
  - Wrong answers are random fractions, with "Oops" or "The correct answer is…" as the only feedback.
  - No hints, debrief, grown-ups page, saves, pixel art or music; emoji throughout; the main game is timed.

##### The game

- **Setting:** a Roman forum on a festival day. The bakery has to feed the whole festival, and every job in the forum is about sharing fairly. The Romans really did this: loaves found at Pompeii are scored into eight equal wedges before baking (a fact for the grown-ups page, checked against museum sources when built).
- **Characters** (all new, all in the 16-bit style, varied skin tones and ages):
  - **Host: Baker Livia**, who runs the forum bakery (flour-dusted apron, headscarf). Explains the festival and opens and closes the game.
  - **Marcus the road surveyor** at the milestone road (Roman surveyors measured roads with a pole and markers).
  - **Cornelia** at the market stall (fruit, cheese, loaves).
  - **Tullia the mosaic maker** in the middle of the forum, laying tile strips.
  - **Anser the goose** (Latin for goose; Rome's geese were famous for honking the alarm). A cheeky sidekick who steals slices, which is where the "how much is left?" questions come from.
- **How it plays:** the player walks around the forum (arrow keys, WASD, tap-to-walk or the touch pad). A sign over a person marks a job. Talking opens a panel with a picture to read: a loaf to cut, a road to mark, two shares to compare, two tile strips to match. Each job has 3 levels that adapt to the player. Five stars at a job lights one of the forum's four bronze braziers. With all four lit, dusk falls and the **Festival Feast** finale starts: a line of customers, each with an order from one job at the player's level (nothing timed). Then the braziers blaze, everyone gathers at the bakery, and Anser steals the last slice.
- **Replay:** **Frenzy mode** (the original game's name and race): 60 seconds of quick orders for a personal best. Optional and kept separate, because the main path is never timed.
- **Modeled on:** `time-attack-clock` and `geometry-builder-challenge` (a walking world with jobs, a finale, the grown-ups page and saves), with the scene, characters and camera from the new world kit (`src/kit/worlds/`). This is the first game at 24 pixels per tile, so the walking, tap-to-walk and the "talk to this person" sign get adapted to the world kit's camera in this game.

##### Learning design

Each job covers its own part of the grade band, and the grown-ups page says which grades each job is for.

| Job (helper) | Skill | Level 1 | Level 2 | Level 3 | Standards |
|---|---|---|---|---|---|
| Bakery (Livia), grades 2–3 | Equal shares and naming fractions | Which loaf is cut fairly? Halves, thirds and fourths (equal vs unequal cuts) | Name the part: "Anser ate 2 of the 8 pieces. What fraction did Anser eat? What is left?" (the Pizza Party problems, plus 6ths) | The whole: "4/4 is how much loaf?"; build the whole from one piece ("this piece is 1/3; how many make a loaf?"); 1/b vs a/b | 2.G.3, 3.NF.1 |
| Milestone road (Marcus), grade 3 | Fractions on a number line | Put a marker at 1/2, 1/3 or 1/4 of the way to the next milestone | Put a/b (3/4, 5/8, 2/6) on the road; the road is cut into equal stretches | Past 1 (5/4, 3/2, 6/4) and the classic trap: count the stretches, not the posts | 3.NF.2 |
| Market stall (Cornelia), grades 3–4 | Comparing fractions | Same bottom number: 3/8 or 5/8 of a loaf? | Same top number: 1/4 or 1/8? ("bigger number, smaller piece") | Different tops and bottoms against 1/2 (3/8 vs 4/6), and "only fair if the wholes are the same size" | 3.NF.3d, 4.NF.2 |
| Mosaic (Tullia), grades 3–4 | Equivalent fractions | Match tile strips: 1/2 = 2/4, 1/3 = 2/6 | Find the missing number: 3/4 = ?/8; whole numbers as fractions (4/4 = 1, 3/1 = 3) | Make equivalents by multiplying top and bottom (2/3 = 8/12), and spot the false one | 3.NF.3a–c, 4.NF.1 |

- **Mistakes the wrong answers come from:**
  - *Unequal parts:* calls 4 pieces "fourths" when the pieces are different sizes.
  - *Part over part:* writes eaten over left (2/6) instead of eaten over all pieces (2/8).
  - *Eaten vs left swap:* gives 6/8 when the question asks what Anser ate.
  - *Upside down:* 8/2 for 2/8.
  - *Counting posts, not stretches:* puts 1/4 at the first of four posts, as if the road had five parts.
  - *Starting at the wrong place:* counts from the first post instead of from 0.
  - *Bigger bottom, bigger piece:* thinks 1/8 is more than 1/4.
  - *Top number only:* thinks 3/8 is more than 2/3 because 3 is more than 2.
  - *Adding to top and bottom:* thinks 1/2 = 2/3 (added 1 to each).
  - *A whole isn't a fraction:* doesn't see 4/4 as one whole loaf.
- **Hint ladder:** a nudge question ("Are all the pieces the same size?", "Count the stretches between the posts") → a picture with a worked step (the cuts numbered, the road's stretches colored, the two shares stacked side by side, the tile strips lined up) → the answer outlined with its explanation.
- **Debriefs** (one "why" question per helper):
  - Livia: "This loaf is cut into 4 pieces of different sizes. Is each piece a fourth?"
  - Marcus: "Where does 4/4 go on the road?"
  - Cornelia: "Why is 1/8 smaller than 1/4 when 8 is bigger than 4?"
  - Tullia: "1/2 and 2/4 cover the same tiles. Why?"
- **Progress and finale:** five stars per job lights its brazier; a job is done after 5 stars and level 2 (or 12 questions played), so a child who struggles still finishes. The Festival Feast mixes all four jobs, then the forum stays at dusk with every job open. Frenzy mode gives a reason to come back.
- **Difficulty change from the originals:** from one level of picture matching up to the top of grade 4 (comparing unlike fractions with 1/2, and equivalence by multiplying); the fraction is never printed on the picture, so the child has to read the picture; the timer moves to an optional mode.

##### Choices for the owner

**Owner answers (2026-10-08):** the name is **Forum Fraction Feast**; a **walking forum with four jobs**; built in **two halves** (bakery and road first). **The owner approved the plan as written (2026-10-08)** and asked for the first half.

1. **The name.** Pizza did not exist in ancient Rome, so the game uses Roman loaves and flatbreads. Options: a new name such as "Forum Fraction Feast" (recommended, same link), or keep "Pizza Fraction Frenzy" with the bakery making flatbread "pizzas" (the ancestors of pizza).
2. **The kind of game.** A walking forum with four jobs and a finale (recommended: it uses the new world, and it gives each fraction skill its own picture), or a bakery shop where customers order fractions and the player earns coins for bakery upgrades (closer to the original Frenzy, but much like Money Market Madness).
3. **Build in two halves** (recommended for four jobs): the forum, Livia's bakery and Marcus's road first, for a quick look; then Cornelia, Tullia, the finale and Frenzy mode.

##### Half 1: COMPLETED ✅ (the owner looked and said to go ahead with half 2; merged 2026-10-09 in PR #220)

- **What is playable:** the title, the character creator (now showing the 16-bit player), Livia's opening, walking the forum (keys, tap-to-walk, the touch pad), **the Bakery** and **Milestone Road** at all three levels with hints, debriefs and stars, two of the four braziers lighting up, Anser the goose, the job list, saving and the grown-ups page. Cornelia's stall, Tullia's mosaic, the Festival Feast and Frenzy mode are half 2.
- **Not listed on the site yet:** the old Pizza Fraction Frenzy stays on `/games` until the whole game is done. The new one plays at `/games/play/pizza-fraction-frenzy/index.html` (also on the PR's Vercel preview).
- **New in the kit** (used by this game, available to every 16-bit world): `Walker16` (a walking 16-bit character with markers), `look16FromAppearance`, `Stage.project` / `screenToTile` / smooth follow, the setting's `walk` and `blocks` (what is solid) and `omit`, an unlit brazier, and the customize screen's `paint` and `only` options. Sunny Town games are unaffected (their code paths did not change; all their browser tests were re-run).
- **Fixed after looking at the screenshots:** the plate under eaten pieces was the same color as the crust (now pale glazed clay with a blue rim and faint lines where each piece was); the counting dots were too small; Livia's white headscarf looked like a chef's hat (now indigo); a phone could see past the top of the sky; the game now opens on a wide shot of the temple and basilica, then pans down to the player.
- **Tests:** 15 unit tests for the fraction logic (every job and level over 400 seeds, all ten Fraction Pizza Party answers checked again, the classic road mistakes), 3 new kit tests, and the browser test `scripts/e2e-pizza-fraction-frenzy.mjs` (35/35).
- **Score:** given at the end of half 2 (below).

##### Half 2: COMPLETED ✅ (merged 2026-10-09 in PR #220)

- **The Market Stall** (Cornelia, grades 3–4): which share of the same size loaf is bigger (or, now and then, smaller). Level 1 has the same bottom number (3/8 or 5/8), level 2 the same top number (1/4 or 1/8), level 3 different tops and bottoms compared with one half (3/8 or 2/3, 3/10 or 2/3) and pairs that are equal (2/4 and 3/6). "They are the same" is always a choice. The hint picture puts a same-length strip under each share. Mistakes named: "bigger bottom number, bigger piece", comparing only the top numbers, picking the share with fewer same-size pieces, and calling different shares the same.
- **The Mosaic** (Tullia, grades 3–4): tile strips that are always the same length. Level 1: which strip covers the same as 1/2 (or 1/3, 2/3, 3/4); level 2: the missing number (3/4 = ?/8) and whole numbers as fractions (4/4 = 1, 6/3 = 2); level 3: multiply top and bottom (2/3 = 8/12, 2/5 = 4/?) and spot the one that is not equal. The hint lines every strip up under the first one. Mistakes named: adding the same number to the top and bottom (1/2 = 2/3), changing only the bottom number, multiplying the top and bottom by different numbers, reading 6/3 as 3 or 4/4 as 4, and not seeing 2/4 and 1/2 as equal.
- **The Festival Feast:** once all four braziers burn, the day turns to dusk and Livia calls the player back. The feast is four orders, one from each job at the player's level, with no stars and nothing timed. Then the braziers blaze, the sky turns to evening, and Anser steals the last slice. The forum stays at dusk afterwards, with every job still open.
- **Frenzy mode** (the old Pizza Fraction Frenzy race), from Livia once the bakery is done: 60 seconds of orders ("2/5 of a loaf"). The player picks the loaf with the right golden pieces from three. The wrong loaves are real mistakes: the pieces left instead of the golden ones, the right count of a differently cut loaf, or unequal pieces. A miss shows the right loaf for a moment. The best score is saved.
- **Site:** listed as "Forum Fraction Feast" (grades 2–4) at `/games/pizza-fraction-frenzy` with a new card picture. `/games/fraction-pizza-party` redirects there, and the old Fraction Pizza Party listing is gone. The ebook *Jaylen and the Frozen Numbers* keeps the game as a companion (same slug). The old HTML files stay until the Phase 4 cleanup.
- **New in the kit:** a setting can switch its painted sky (`setTime('evening')`), used for the feast at dusk.
- **Fixed after looking at the screenshots:** the golden loaf pieces were hard to tell from the plain crust in Frenzy (now flat honey-yellow with sesame seeds against darker crust); the tile strips' shading made one tile look like three (now flat tiles with clear grout); the mosaic hint now really lines the strips up at the same length; on a phone at dusk the sky stayed daytime blue.
- **Tests:**
  - 27 unit tests for the fraction logic (12 new): every comparison checked with exact fractions, level 1 and 2 pairs share a bottom or top number, every mosaic answer truly equal and every trap not, the "add the same number" trap really adds, and every Frenzy order has exactly one fair loaf with the right golden pieces.
  - Browser test `scripts/e2e-pizza-fraction-frenzy.mjs`: 51/51. It covers title → the bakery (reached by walking) → the road → the market stall → the mosaic (reached from the job list) → the Festival Feast with one order from each job → the finale at dusk → a Frenzy round with a miss → Anser → grown-ups (four rows) → reload → phone layout.
- **Score: 9.1/10** (gameplay 2.2, learning 1.9, look and sound 1.35, ease of use 1.35, reliability 1.4, completeness 0.9). It loses points on:
  - most of the play is answering in panels (but with four kinds of pictures and a walking world)
  - the finale is a dusk scene with dialogue, not an animation
  - the debrief questions have no picture
  - the road's posts are small targets on a phone (22 px wide)

##### Checks it will ship with

Unit tests for every job and level over 300 random seeds (one correct choice, every wrong choice tagged with its mistake and computed from it, every number-line answer and every comparison checked with exact fractions); a browser test playing title → all four jobs → the Festival Feast → a Frenzy round → reload → grown-ups page; screenshots at 1280×720 and 390×844 reviewed by eye; a score against the rubric (8.5 to pass).

#### M7 Multiplication and equations: COMPLETED ✅ (owner approved and merged 2026-10-11: Multiplication Space Quest in PR #224, Equation Balance Scale in PRs #225 and #226)

The last Math batch, and the first in the **Star Station** world (game worlds phase W2, `docs/GAME_WORLDS_PROPOSAL.md`). It is set at 24 pixels per tile, with 16-bit characters and the station's day and night-shift light. M7 becomes **two games**, which makes 11 Math games:

- **Multiplication Space Quest**, with Multiplication Bingo Bonanza and Multiplication Tables Adventure merged into it
- **Equation Balance Scale**

The names, settings and kind of game are owner choices (see "Choices for the owner" below).

##### What the originals do (studied and played 2026-10-09)

| Original (grades) | What it teaches | Answers checked |
|---|---|---|
| **Multiplication Space Quest** (game, 3–5) | Random times-table facts typed into a box: Easy 2–5, Medium 2–10, Hard 2–12. A timer (90/60/45 s) and a rocket that moves toward a planet with each right answer. Three hints ("4 groups of 2", "count by 2s, 4 times", "between 3 and 13") | **Correct.** Every answer is `a × b`. |
| **Multiplication Bingo Bonanza** (game, 3–5) | A 5x5 card of products from 2–12 times 2–12 and a FREE middle. A random fact is called, and the child clicks its product. Up to 3 Bingos | **Correct, but the game often can't be won.** The card holds 24 of the 53 possible products, but the called fact is drawn from all of them. **About 55% of calls have no right square on the card** (23 of 40 in a browser test), and there is no skip. The child can only click squares that are all "wrong". |
| **Multiplication Tables Adventure** (activity, 3–5) | Pick a table from 1 to 12 and type answers. Ten right answers "masters" a table. | **Correct.** One flaw: after a wrong answer it shows the answer and keeps the same question. The child can type the answer just shown and have it count toward mastering the table. |
| **Equation Balance Scale** (game, 3–5) | `a + b = ?` or `a − b = ?` with a and b from 1 to 10, picked from 6 buttons. "Level" goes up every 10, but nothing else changes. | **Correct, but out of the grade band, and it freezes.** About 1 in 4 questions is a subtraction with a negative answer (`3 − 8 = −5`), and grades 3–5 don't do negative numbers. On those questions the wrong-answer maker can never find 6 different choices, so **the page freezes** (it froze on question 8 in a browser test). It also never asks about a balance: every question is "a + b = ?", the "= means the answer comes next" habit the merge map wants this game to fix. |

**Flagged for the owner:** the Bingo and Balance Scale problems are in the live games today. They go away when the new games replace them, so this plan doesn't fix the old files separately (say if you'd like a quick fix sooner).

- **Kept:**
  - the space story, the rocket's journey and the three-step hint idea from Space Quest
  - **Bingo**, as the finale and a replay mode, now fair: every call has its answer on the card
  - the table-by-table practice and the "mastered" table from Tables Adventure, as the Star Map, where the game picks the facts that need work
  - the balance and the missing number from the Balance Scale
  - the 60-second race, as one optional timed mode
- **Missing against the standard:**
  - one level of random facts; no arrays, strategies, division, fact families or remainders, although the merge map gives this game all of them
  - wrong answers are the child's typing, with "Not quite! The answer is…" as the only feedback
  - no debrief, grown-ups page, saves, pixel art or music; emoji throughout
  - the main path is timed

##### Game 1: "Multiplication Space Quest" (slug `multiplication-space-quest`, grades 3–5): a space shooter

> **Revised 2026-10-09 after the owner's first answers:** the main game is a **space shooter** built around multiplication. The station deck and the alien planet are where it starts and ends. Name kept. The first draft (a walking station with four jobs) is replaced.

- **Setting:** three places, in the Star Station style.
  - **Home base:** the **observation deck** (`station-deck`).
  - **The main game:** **space flight**, a new scrolling space scene with the nebula and the ringed planet from the deck's window.
  - **The goal:** the **alien planet** (`alien-planet`).

  The story: a cloud of gray space rocks called **the Static** has drifted across the route to the alien planet's outpost. The rocks drain the color and power out of everything they touch, and a fleet of little supply ships is stranded inside the cloud. The player's ship flies out to clear the way and bring the stranded ships home. Nothing is hurt: rocks break into sparkles, and stranded ships light up and join the player's fleet. This is the same "friendly, no fighting" rule as Library Rush.
- **Characters** (all new, 16-bit, varied skin tones and ages; names are drafts):
  - **Host: Commander Ayo**, who runs the station. Gives the mission and the launch order.
  - Four mission chiefs on the deck, one per sector:
    - **Pilot Mei** (formations)
    - **Engineer Rafi** (engines and power-ups)
    - **Quartermaster Dot** (cargo)
    - **Navigator Sol** (the Star Map)
  - **Blip**, a friendly little floating alien who rides along, chats during flights and calls the Bingo numbers in the finale.
- **How it plays:**
  - **On the deck (home base):** the player walks the deck and talks to a chief to start that chief's mission.
    - Chiefs give the short briefing before a flight and the debrief question after it.
    - Rafi's **upgrade bay** spends stars on ship upgrades.
    - Sol's **Star Map** shows every fact learned.
    - The player launches from the hangar.
  - **In flight (the main game):** a vertical shooter, with the player's ship at the bottom of the screen.
    - **Moving:** arrow keys or WASD, or drag a finger. The ship fires on its own, so a child only steers.
    - **Dodging:** small gray rocks drift down. Bumping one costs a bit of **shield**.
    - **Each question:** a question appears in a banner at the top (it is read aloud), and a row of big **answer rocks** floats in. Each rock carries a number.
      - **Right rock:** it bursts into sparkles, a stranded ship lights up and joins the fleet behind the player, and the star meter fills.
      - **Wrong rock:** the ship bounces back and a one-line reason appears ("4 groups of 3 isn't 7: that adds the numbers").
    - **No time pressure on answers:** answer rocks wait for the player and never fly off. Only the small rocks move, so there is action but **no time limit on answers**.
    - **Phone:** tapping a rock also fires at it, so a phone player can aim without fine steering.
  - **Pictures come from the game itself.** In the formations sector, the stranded ships drift in **as the array or equal groups the question asks about** (4 rows of 6 ships), so the child reads the picture to answer. Cargo questions show crates dropping into ships. The fact-family questions are constellations.
  - **A flight** is about 8 questions, ending with a mini-boss: a big Static rock with one two-step question. Then the ship docks for the debrief on the deck.
  - **Five stars in a sector** (a star is a right first try without the picture hint) clears that sector of the route. With all four cleared, the route to the planet is open for the finale.
  - **The finale, Bingo Boss:**
    - The heart of the Static cloud is a huge rock with a 5x5 **Bingo shield** of numbers.
    - Blip calls facts (×, ÷ and missing factors at the player's level), and the player shoots the matching shield tile. **Every call has its answer on the shield.**
    - Five in a row (a Bingo) breaks the shield. The cloud clears, the whole rescued fleet flies down to the **alien planet**, and the outpost's lights come on at the night-shift party.
  - **Upgrades** (stars earned in flight): a wider beam, a second wing ship, a stronger shield, faster steering, and cosmetic paint and trails. They make flying more fun, never the math easier.
  - **Shield:** when the shield runs out, the ship tows home to the deck with everything already earned (nothing is lost) and can launch again.
- **Replay:**
  - **Bingo Boss** rematch with a new shield (best: fewest calls to a Bingo).
  - **Meteor Run** (the old Space Quest race), from Rafi once his sector is cleared: 60 seconds of quick facts chosen from the ones the player finds hardest, for a personal best. Optional and separate; the main path is never timed.
  - The Star Map's unlit stars.
- **Modeled on:**
  - `math-race-rally`, for a game with its own flight scene and camera next to the kit's normal one, plus upgrades for stars.
  - `math-dash` (Library Rush), for action with a shield-like meter, dodging, and no fighting.
  - `pizza-fraction-frenzy`, for walking the 16-bit deck.

  The flight scene is new: a top-down scrolling space scene drawn at the Star Station pixel size (24 pixels per tile) with its palette and neon glows.

**Learning design** (each sector covers its own part of the band, and the grown-ups page says which grades each sector is for):

| Sector (chief) | Skill | Level 1 | Level 2 | Level 3 | Standards |
|---|---|---|---|---|---|
| Formations (Mei), grade 3 | Equal groups and arrays | Stranded ships in equal groups: "4 groups of 3 ships. How many ships?" and "Which times sentence matches?" | Formations (arrays): rows × columns, and a formation that turns on its side (6 × 4 = 4 × 6) | A big formation splits in two: 7 × 8 = 7 × 5 + 7 × 3. Shoot the split that matches the picture | 3.OA.1, 3.OA.3, 3.OA.5 |
| Engines (Rafi), grades 3–4 | Fact strategies | ×2 (doubles), ×5 (half of ×10), ×10, ×1 and ×0 | ×4 (double, then double again), ×9 (ten groups take away one), ×3 (double plus one more group). First shoot the shortcut rock, then the answer | ×6, ×7, ×8 from a fact you know (6 × 7 = 5 × 7 + 7), and the 11s and 12s as a stretch | 3.OA.5, 3.OA.7, 3.OA.9 |
| Cargo (Dot), grades 3–4 | Division and the missing factor | Crates drop into ships equally: "24 crates, 4 ships. How many on each ship?" | The missing factor: ? × 6 = 42, so 42 ÷ 6 = 7. Plus "how many groups?" stories next to "how many in each?" stories | Leftovers: "29 crew, 4 seats per shuttle. How many shuttles?" (one more for the leftover crew), "How many full crates?", "How many left over?" | 3.OA.2, 3.OA.4, 3.OA.6, 4.OA.3 |
| Constellations (Sol), grades 3–5 | Fact families and factors | Finish the family: 3, 4 and 12 make 3 × 4, 4 × 3, 12 ÷ 3, 12 ÷ 4 (shoot the missing fact) | Which fact doesn't belong? (3 ÷ 12 = 4 sneaks in) | Every way to park 24 ships in a rectangle (factor pairs), "Is 7 a factor of 42?", prime or not | 3.OA.6, 3.OA.7, 4.OA.4 |

- **The Star Map** (Tables Adventure merged in): a 10x10 chart on Sol's console where each fact is a star.
  - A star lights up when the player answers that fact cleanly in any flight.
  - Flights and Meteor Run mix in the facts the player has missed or not seen yet.
  - A row lights up fully when that table is mastered.
  - The grown-ups page shows the map.
- **Mistakes the wrong answer rocks come from** (each wrong rock is built from one of these):
  - *Added instead:* 4 groups of 3 → 7.
  - *Group size or group count only:* 4 groups of 3 → 3, or 4.
  - *One group off:* 7 × 8 → 49 or 63 (a neighboring fact).
  - *Times zero keeps the number:* 6 × 0 → 6.
  - *Times one makes one:* 9 × 1 → 1.
  - *Nines flipped:* 9 × 7 → 36 instead of 63.
  - *Doubled only once for ×4:* 4 × 7 → 14.
  - *Split both numbers:* 7 × 8 = 7 × 5 + 8 × 3.
  - *Multiplied or subtracted instead of dividing:* 42 ÷ 6 → 252, or 36.
  - *Leftovers:* gives the leftover as the answer, or forgets that the leftover crew still need a shuttle.
  - *Backwards division:* 3 ÷ 12 = 4.
  - *Odd means prime:* thinks 9 is prime; forgets that 1 × 24 is a factor pair.
- **Hint ladder in flight:** the Hint button (or H) **pauses the flight**. Rung 1 is a nudge ("How many groups? How many in each?"). Rung 2 is a picture panel with a worked step: the ships grouped with the rows numbered, the formation split in two colors, crates dealt into ships one by one, the fact-family triangle. Rung 3 outlines the right rock with its explanation. After two misses on one question, the flight pauses and the next rung opens by itself.
- **Reading and pace:** the question banner stays on screen and is read aloud. The small rocks slow down while a question is new. Reduced motion slows everything and turns off screen shake.
- **Debriefs** (back on the deck, one "why" question per chief):
  - Mei: "I turned a 3-by-5 formation on its side. Is it still 15 ships? Why?"
  - Rafi: "Why is 9 × 6 the same as 10 × 6 take away 6?"
  - Dot: "29 crew, 4 seats per shuttle. Seven shuttles leave 1 crew member behind. What do we do?"
  - Sol: "If you know 6 × 8 = 48, which division facts do you know for free?"
- **Progress and finale:**
  - **What shows progress:** the rescued fleet growing behind the ship, the route map clearing sector by sector, the Star Map, and upgrades.
  - **When a sector is done:** after 5 stars and level 2, or 12 questions played, so a child who struggles still finishes.
  - **The finale:** Bingo Boss, then the landing on the alien planet at the night-shift party.
- **Difficulty change from the originals:** from one level of random facts to all of grade 3's multiplication and division (equal groups, arrays, strategies, the inverse, fact families), up to grade 4's leftovers and factor pairs. The 60-second timer moves to the optional Meteor Run.

##### Game 2: "Equation Balance Scale" (slug `equation-balance-scale`, grades 3–5)

- **Setting:** the **alien planet** outpost (`alien-planet`, approved in W1). The outpost weighs its glowing crystals on a big balance scale before they go up to the station. A smaller game than Space Quest: 3 jobs, 15–25 minutes.
- **Characters** (drafts):
  - **Host: Ranger Kiri**, who runs the outpost's weigh station.
  - **Mechanic Juno** at the rover, loading crystal crates.
  - **Botanist Pax** at the habitat dome, packing seed pods.
  - **Gloop**, the planet's friendly critter (already in the setting), who loves to sit on the scale.
- **How it plays:** the player walks the outpost. At each job, the player **drags crystal weights onto the pans and watches the scale tip** (keyboard and tap also work), or picks the number that balances it. The scale is the picture for every question: the two sides of an equation are the two pans. Five stars per job lights one part of the outpost's beacon. With all three lit, evening falls (the aurora comes out) and **The Big Weigh-in** finale starts: Gloop sits on the scale, and the player balances one problem from each job. Then the beacon shines up to the station.
- **Modeled on:** `pizza-fraction-frenzy` (walking world, jobs and finale), with a new balance-scale model that can be dragged.

| Job (helper) | Skill | Level 1 | Level 2 | Level 3 | Standards |
|---|---|---|---|---|---|
| Weigh Station (Kiri), grades 3–4 | The equals sign means "the same as" | Is it balanced? Crystals on each pan (5 + 3 and 8). Which pan is heavier? | True or false with numbers on both sides: 7 + 2 = 4 + 5, 9 = 9, 6 + 4 = 10 + 1 | With × and ÷: 3 × 4 = 2 × 6? 20 ÷ 4 = 10 − 5? | 1.OA.7 (warm-up), 3.OA.7 |
| Rover (Juno), grades 3–4 | The missing number, anywhere | 7 + ? = 12, ? − 6 = 9 | ? × 4 = 24, 36 ÷ ? = 9 | Unknowns with something on both sides: 8 + 4 = ? + 5, 3 × 8 = 6 × ?, 15 − 7 = ? − 10 | 1.OA.8, 3.OA.4 |
| Dome (Pax), grades 4–5 | Two-step problems with a letter for the unknown | Two steps of + and −: pick the equation, then solve | × then + or −: "3 bags of 6 pods and 4 more" → 3 × 6 + 4 = p | Pick the equation that matches the story, check if an answer is reasonable, and balance boxes: "2 boxes and 3 crystals balance 11 crystals. What does one box weigh?" (take the same off both pans) | 3.OA.8, 4.OA.3, 5.OA.2 |

- **Mistakes the wrong answers come from:**
  - *"=" means "the answer comes next":* 8 + 4 = ? + 5 → 12.
  - *Added everything:* 8 + 4 = ? + 5 → 17.
  - *Wrong operation for a missing number:* ? − 6 = 9 → 3.
  - *A number alone can't be on the left:* thinks 9 = 4 + 5 is "backwards" and false.
  - *Looked at one pan only:* calls 6 + 4 = 10 + 1 true because 6 + 4 is 10.
  - *Did one step only:* 3 × 6 + 4 → 18.
  - *The letter in the wrong place:* picks 3 + 6 × 4 = p for "3 bags of 6 and 4 more".
  - *Took weight off one pan only:* 2 boxes + 3 = 11 → each box is 7.
- **Hint ladder:** a nudge ("Both pans must weigh the same. What does the left pan weigh?") → a picture (the crystals on each pan counted and grouped, or a bar model under the scale) → the answer outlined with its explanation.
- **Debriefs:**
  - Kiri: "What does the = sign tell us?"
  - Juno: "Why isn't 12 the answer to 8 + 4 = ? + 5?"
  - Pax: "Why did we need two steps?"
- **Progress and finale:** five stars per job lights a part of the beacon (done after 5 stars and level 2, or 12 questions). The Big Weigh-in, then the outpost stays in the evening with every job open. No timed mode (the old game had none, and this skill is about care, not speed).
- **Difficulty change from the original:** from "a + b = ?" (one level, negative answers by accident) to the equals sign as balance, unknowns in every position, × and ÷, and two-step problems with a letter for the unknown, with no negative numbers anywhere.

**Owner answers for the Balance Scale (2026-10-11):**
- **Kind of game:** the walking outpost, as drafted above (not a puzzle-level or action game).
- **Names:** keep Ranger Kiri, Mechanic Juno, Botanist Pax and Gloop.
- **Letters:** a letter for the unknown (like `3 × 6 + 4 = p`) only at the Dome's level 3 (4.OA.3); everything else keeps `?` or a box.
- **Halves:** half 1 is the outpost (walking, with the kit's walking pieces added to the `alien-planet` setting), the Weigh Station and the Rover; half 2 is the Dome, The Big Weigh-in finale, and listing the game on the site with a new card picture. The owner tries half 1 on the preview before half 2.
- **Wording:** the owner's rule from Space Quest applies to every question: short sentences, the facts first, then one plain question, in words that match the picture ("the left pan", "the right pan") and with no game jargon.

##### Balance Scale half 1: COMPLETED ✅ (the owner merged PR #225 on 2026-10-11 and asked for half 2)

- **What is playable:**
  - the title and the character creator (16-bit player)
  - Ranger Kiri's opening, with Gloop
  - walking the outpost (keys, tap-to-walk, the touch pad) to Kiri, Juno, Pax and Gloop
  - **the Weigh Station** at all three levels: "Is 7 + 2 = 4 + 5 true?" with three answers that never move ("True: it balances", "False: the left is heavier", "False: the right is heavier"). The scale stays locked while the child thinks, and after a wrong answer, so it never gives the answer away; a right answer lets it go and it tips (or stays level) to show why.
  - **the Rover** at all three levels: the missing number anywhere (7 + ? = 12, ? − 6 = 9, ? × 4 = 24, 36 ÷ ? = 9, then 8 + 4 = ? + 5, 3 × 8 = 6 × ?, 15 − 7 = ? − 10). The child drags a crystal weight into the gap (or clicks, taps or presses 1–3). A wrong crystal tips the scale and gets a sentence ("Try it: 13 + 8 = 21, not 13. The left pan is too heavy."), then comes back out.
  - a sentence for every wrong answer, three hints (a nudge; what each pan weighs, shown under the scale; the answer outlined with its reason), and a debrief per job
  - the outpost beacon: one lamp per finished job, also in the HUD
  - the job list (J), saving and the grown-ups page
- **Half 2:** Botanist Pax and the Dome (two-step problems, a letter for the unknown at level 3), The Big Weigh-in finale at evening, the site listing and a card picture. Pax already stands at the dome and says the seed pods are still growing.
- **Not listed on the site yet:** the old Equation Balance Scale stays on `/games` until the whole game is done. The new one plays at `/games/play/equation-balance-scale/index.html` (also on the PR's Vercel preview).
- **New in the kit:** the `alien-planet` setting got the walking pieces the deck and the forum have: `walk`, `blocks` (each prop's footprint), `omit` (`beacon`, `critter`, `drone`) and `setTime`. **The Sunny Town games' built files are byte-for-byte unchanged.** Forum Fraction Feast's game file was only renamed (it shares the world code file); its only change is the name it imports. Space Quest's landing uses the planet as before (66/66 browser checks).
- **Fixed after looking at the screenshots:**
  - Kiri's weigh-station scale was too small to notice (now 1.6 times bigger)
  - at level 2 one pan showed 12 loose crystals next to weights on the other (only level 1 uses loose crystals now)
  - a wrong answer at the Weigh Station let the scale tip and showed the answer (it stays locked now)
  - "32 ÷ 256 does not come out even" was vague (now "is less than 1, not 8")
  - the level 1 crystals were small (a third bigger)
- **Tests:**
  - 9 unit tests over 2,400 questions: one right answer and three different choices; no number ever below zero; the Weigh Station's answer is what the scale really does; each wrong answer comes from its mistake ("the answer comes next" is the other pan's weight, "added everything" adds every number); the right crystal balances and every wrong one tips; level 1 balances about half the time.
  - The browser test `scripts/e2e-equation-balance-scale.mjs` (41/41).
  - `scripts/ebs-tour.mjs` takes 31 screenshots at 1280×720 and 390×844, reviewed by eye.
- **Score so far: 8.6/10, provisional** (the final score comes at the end of half 2):
  - gameplay 1.9
  - learning 1.95
  - look and sound 1.3
  - ease of use 1.35
  - reliability 1.4
  - completeness 0.7 (two of three jobs, no finale yet)

  It loses points on:
  - most of the play is answering on a panel (but the scale moves, and the Rover's crystals are dragged)
  - the level 1 crystal piles are wide for 10 or more crystals
  - Gloop doesn't sit on the scale yet (that comes with The Big Weigh-in)

##### Balance Scale half 2: COMPLETED ✅ (the owner merged PR #226 on 2026-10-11)

- **Botanist Pax's Dome** (grades 4–5, two-step problems; 3.OA.8, 4.OA.3, 5.OA.2). Every Dome question is a little story with two parts, played in two steps:
  1. **Pick the equation that tells the story.** The scale's pans stay empty while the child picks, so they do not give the answer away. A wrong equation gets a sentence ("That equation only tells the first part of the story. What happens next?").
  2. **Solve it on the scale.** The right equation goes onto the pans (the story on the left, the unknown alone on the right), and the child drags the crystal that balances it into the gap, as at the Rover.
  - level 1: two steps of + and − ("Pax has 12 seed pods. She picks 4 more. Then she plants 7 of them. How many pods are left?" → 12 + 4 − 7 = ?)
  - level 2: groups, then one more step ("Pax packs 3 bags. Each bag holds 6 pods. Then she adds 4 more pods." → 3 × 6 + 4 = ?; and pots of pods, then Gloop eats some: 5 × 4 − 5 = ?)
  - level 3, as the owner chose: **a letter for the unknown** (3 × 6 + 4 = p, "p is the number of pods"), with bigger numbers; and **boxes on a pan**: "Left pan: 2 boxes and a weight of 3. Right pan: 11. All the boxes weigh the same. Which crystal weighs the same as one box?" The boxes are green seed-pod crates marked b (b + b + 3 = 11). One crystal dropped on a box fills both boxes, because they weigh the same.
  - mistakes named: doing only the first step (3 × 6 + 4 → 18), the numbers in the wrong places (3 + 6 × 4), the wrong sign, adding every number, and for boxes taking weight off one pan only (b + b + 3 = 11 → 7) or forgetting to share between the boxes (→ 8)
  - each step has its own hints: "The story has two parts. What happens first? What happens next?", then the two parts written out; on step 2, "Do the first step: what is 3 × 6?", then "3 × 6 = 18. Now work out 18 + 4." The scale does not show what the pans weigh on a story, because that would be the answer. For boxes: "Take 3 off both pans. The scale still balances. What do the 2 boxes weigh?"
  - a star still needs a clean first try on both steps (at most hint 1)
  - Pax's debrief: "Pax packs 3 bags of 6 pods, then adds 4 more. Why do we need two steps?"
- **The Big Weigh-in** (the finale): when the third beacon lamp lights, evening falls on the outpost (the planet's evening sky) and Kiri calls The Big Weigh-in ("Start The Big Weigh-in!" or "Not yet"; Kiri asks again later, with a marker over her head). Gloop climbs up and sits on top of the big weigh-station scale in the outpost, and on top of every scale in the panel. Kiri explains why Gloop doesn't tip it: Gloop sits right above the post, so Gloop pushes both sides the same. Then three scales, one from each job in order (the Weigh Station, the Rover, the Dome), each asked by its own helper, at the child's level, with no stars and nothing timed. After the third, the beacon shines a beam of light up to the Star Station, Gloop does a happy dance, and the game tells the site player it is complete ("Nice work!"). The outpost stays in the evening, with the beam, and every job stays open for practice.
- **Site:** `/games/equation-balance-scale` now plays the new game (grades 3–5, 20–30 min), with a new description, skills and card picture (the outpost with Kiri's scale, the three helpers and Gloop). The slug is the same, so no redirect is needed; the old HTML file stays until the Phase 4 cleanup, as for M6 and Space Quest.
- **Grown-ups page:** three jobs in the progress table, the Dome in "what it teaches" (with the letter and the boxes), The Big Weigh-in in the summary, three new mistakes in "most common slip", a two-part story idea to try at home, and the standards 3.OA.8, 4.OA.3 and 5.OA.2.
- **No kit changes in half 2.** The Sunny Town games, Forum Fraction Feast and Space Quest are byte-for-byte unchanged (only Equation Balance Scale's own files were rebuilt).
- **Fixed after looking at the screenshots:**
  - three boxes on one pan did not fit at a size that can be read (the boxes are now always two, as in the plan's example)
  - three weights on a pan touched the edge of the scale's frame (each pan's load now sits a little toward the middle)
  - a wrong-sign sentence talked about "bags" when the story was about pots (it now fits every story)
  - a story could repeat a number ("Gloop eats 3. Then Pax adds 3."): the numbers in a story are now different
  - Kiri's marker stayed up during the finale
- **Tests:**
  - 11 unit tests (2 new) over 3,600 questions: the right equation is exactly what goes on the pans; every number in it comes from the story; the right crystal balances and every wrong one tips; "did one step only" is the first part worked out; a letter only at level 3 (and never "?" there); boxes balance when the same is taken off both pans; every hint and explanation is there for both steps.
  - The browser test `scripts/e2e-equation-balance-scale.mjs` (62/62, 21 new) adds: the Dome with empty pans while the equation is picked, a wrong equation, the right one going on the scale, a one-step crystal that tips it and says so, the letter p at level 3, a real drag onto a box that fills both boxes, five stars and Pax's debrief, evening and Kiri's call, Gloop on the scale, The Big Weigh-in (one scale from each job, in order), the beam and the "game complete" message, three rows on the grown-ups page, a reload that keeps the evening and the beam, and a Dome story on a phone.
  - `scripts/ebs-tour.mjs` now takes both steps of each Dome question and the whole finale (37 screenshots for the Dome and The Big Weigh-in), all reviewed by eye.
- **Score: 8.9/10** (gameplay 1.95, learning 2.0, look and sound 1.3, ease of use 1.35, reliability 1.4, completeness 0.9). It loses points on:
  - most of the play is answering on a panel (the scale moves, and crystals are dragged, but the outpost itself is only for walking between jobs)
  - the Dome's stories have no picture of their own (the pods, bags and pots are only words until the equation is on the scale)
  - the level 1 crystal piles are wide for 10 or more crystals
  - the beam to the station is a simple line of light

##### Choices for the owner

**Owner answers (2026-10-09):**
- **Order:** build Multiplication Space Quest first.
- **Settings:** the deck and the planet.
- **Kind of game:** "Station + flying cockpit", with the main game played as a **space shooter** built around multiplication, so the fleet launches as spaceships and the station and planet are involved too.
- **Names:** keep both names.

Game 1 above was rewritten to match. **Second answers (2026-10-09): a vertical shooter, the friendly Static rocks, and the two halves below. The owner approved the revised plan and asked for half 1.** The questions were:

1. **The shooter's direction:** vertical, with the ship at the bottom (recommended: it fits a phone held upright and leaves room for the question banner), or side-scrolling, with the ship on the left.
2. **What the player fires at:** gray Static rocks that burst into sparkles while stranded ships are rescued (recommended, friendly like Library Rush), or classic asteroids and alien drones.
3. **Halves:** half 1 is the deck (home base), the flight scene, the Formations and Engines sectors, upgrades and saving; half 2 is Cargo, Constellations, Bingo Boss, the landing on the planet and Meteor Run. Equation Balance Scale follows in its own PR, still on the alien planet.

##### Space Quest half 1: COMPLETED ✅ (the owner played it on the PR preview and said it plays well, 2026-10-10)

- **What is playable:**
  - the title and the character creator (16-bit player)
  - Commander Ayo's opening with Blip
  - walking the station deck (keys, tap-to-walk, the touch pad) to the five crew members
  - **the Formations and Engines missions**, flown as a vertical shooter:
    - steer with the arrow keys or A and D, or drag
    - the blaster fires by itself at the gray Static pebbles
    - answer with the charge beam: Space under a rock, keys 1–3, or a click or tap on the rock
    - the stranded ships fly in as the picture (equal groups in docking rings, a formation, a formation split by a line) and join the fleet when the answer is right
    - a mistake sentence for every wrong rock
    - hints that pause the flight, with a dot picture at rung 2
    - two-step questions (pick the split or the shortcut, then the answer)
    - the Static core as the 8th question
    - a shield; the tow beam brings the ship home with everything earned
  - each sector's debrief when it is cleared
  - Rafi's upgrade bay (twin blaster, rapid fire, two extra shields, thrusters, four paint jobs, paid with stardust)
  - Sol's Star Map (55 facts)
  - the mission list (J), saving and the grown-ups page with its progress table
- **Half 2:** Quartermaster Dot (Cargo), the Constellations sector, Bingo Boss, the landing on the alien planet and Meteor Run (built, see below).
- **New in the kit:**
  - the station deck now has `walk` and `blocks` (each prop's footprint, worked out from its picture) and can leave out its drone (`omit: ['drone']`)
  - the world camera can cap how many rows show top to bottom (`Stage.maxTilesTall`, off unless a game sets it), so a tall phone never sees past the deck
  - **The eight Sunny Town games' built files are byte-for-byte unchanged.** Forum Fraction Feast's files were renamed (its world code now sits in a file shared with this game), so its browser test was re-run.
- **Fixed after looking at the screenshots:**
  - the stranded ships sat under the question banner and the status row (now measured, with the banner kept at a fixed height)
  - big formations were drawn by shrinking the ships, which smeared them into gray bars; there is now a small ship painted at its own size, and the powered-down gray is lighter
  - a crossed-out rock was hard to see (now a red X)
  - pop-up messages covered the status row
  - on a phone the flight was drawn at 1 screen pixel per art pixel (tiny rocks), and the deck showed black space above the wall
- **Tests:**
  - 10 unit tests over 3,000 questions. They found and fixed two traps that turned into right answers: "split both numbers" on a square formation, and "a double plus 3" for 3 × 3.
  - The browser test `scripts/e2e-multiplication-space-quest.mjs` (41/41) covers title → deck → Mei (by walking) → a whole Formations flight with keys, Space, clicks and hints → the sector cleared with its debrief → an Engines two-step question → towed home → upgrades and paint → missions → the Star Map → grown-ups → reload → phone (rocks on screen and tappable, no sideways scrolling).
  - The flight runs at 44 frames a second on the test machine's software rendering.
- **Score so far: 8.7/10, provisional** (the final score comes at the end of half 2):
  - gameplay 2.1
  - learning 1.85
  - look and sound 1.3
  - ease of use 1.35
  - reliability 1.4
  - completeness 0.7 (half the sectors, no finale yet)

  It loses points on:
  - the Engines questions have no picture in flight (only in the hint), so the top of the screen is empty
  - the small gray ships in a 9-row formation are only 12 pixels wide
  - steering by dragging on a phone was checked by hand in the code, not by the browser test (the test taps the rocks)
  - the debrief questions have no picture

##### Space Quest half 2: COMPLETED ✅ (the owner approved it after the simpler-wording change and merged PR #224 on 2026-10-11)

- **Cargo with Quartermaster Dot** (grades 3–4, division as sharing and grouping):
  - level 1: share crates equally ("24 crates shared between 4 ships"), and the missing factor (4 × ? = 24)
  - level 2: how many groups ("30 crates, 5 to a ship: how many ships?")
  - level 3: two-step word problems with a remainder: round up ("27 crew, 4 seats to a shuttle: how many shuttles?"), how many full crates, and how many left over
  - the crates fly in as the picture: rows of 10 with a gap after 5, and on level 1 the empty docking rings of the ships they are shared between
  - mistakes named: subtracting or multiplying instead of dividing, swapping the numbers, ignoring the left-over, giving the remainder as the answer, rounding when you should not, and giving the number of groups when the question asks for what is left
- **Constellations with Navigator Sol** (grades 3–4, fact families and factors):
  - level 1: the missing fact of a family (whole facts on the rocks, like "18 ÷ 9 = 2"), and the fact that is not in the family
  - level 2: missing factor pairs, and "is 6 a factor of 42?"
  - level 3: primes (which number has exactly two factors)
  - mistakes named: dividing the small number by the big one (4 ÷ 12), not seeing division as part of the family, counting a turned pair (12 × 2 after 2 × 12) as a new pair, picking a number that does not divide evenly, mixing up factors and multiples, thinking every odd number is prime, and thinking 1 is prime
- **The Bingo Boss** (Bingo Bonanza merged in): when all four sectors are clear, the night shift starts and Commander Ayo calls the player. The Static's last shield is a 5 × 5 Bingo card (a free middle, 8 small numbers and 16 products). Blip calls a fact ("7 × 6" or "42 ÷ 7"); the player beams the square with its answer (a click, a tap, or the arrow keys and Space). **Every call's answer is on the card**, which fixes the old game's bug where about 55% of calls had no answer. A wrong square shakes and says what went wrong. Three hints in the banner, so the card stays in view; the third outlines the square in gold. Five in a row breaks the shield. The number of calls it took is saved as the best Bingo, and Ayo offers a rematch.
- **The landing on the alien planet:** the whole fleet flies down to the outpost for the night-shift party. The player's ship sits on the landing pad, the rescued supply ships park in rows with their lights on, and the crew and Blip gather in front of the outpost while Ayo and Blip talk. Then back to the deck, which stays at night. The game tells the site player it is complete ("Nice work!").
- **Meteor Run** (Tables Adventure's speed practice), from Rafi once the Engines sector is clear: 60 seconds of quick facts, three out of four from facts not yet lit on the Star Map. The only timed part of the game. When time is up the rocks clear and Rafi gives the score; the best is saved.
- **Site:** listed at `/games/multiplication-space-quest` (grades 3–5, 30–45 min) with a new description and card picture (the station deck). `/games/multiplication-bingo-bonanza` and `/games/multiplication-tables-adventure` redirect to it, and their listings are gone. No ebook lists them as companions. The old HTML files stay until the Phase 4 cleanup, as for M6.
- **Grown-ups page:** four sectors in the progress table, the Bingo and Meteor Run in "what it teaches", and the standards 3.OA.2, 3.OA.4, 3.OA.6, 4.OA.3 and 4.OA.4 added.
- **No kit changes in half 2.** The landing uses the alien planet setting as it is, with `Stage.maxTilesTall` from half 1. The Sunny Town games and Forum Fraction Feast are byte-for-byte unchanged by half 2.
- **Fixed after looking at the screenshots:**
  - when Meteor Run's time ran out, a new question and its rocks still showed behind Rafi's message (now cleared, with "Time!" in the banner)
  - on the Bingo card, the keyboard cursor and the hint's answer were both outlined in gold (the cursor is now white)
- **Tests:**
  - 15 unit tests (5 new) over thousands of questions: every Cargo and Constellations answer worked out again from the numbers; every wrong choice computed from its mistake; a missing factor pair is never a square shown as "turned"; every Bingo call over 300 seeds per level has its answer on the card and unmarked; every Meteor Run fact is right.
  - The browser test `scripts/e2e-multiplication-space-quest.mjs` (66/66, 25 new) adds: a Cargo flight with crates, a Constellations flight with whole facts on the rocks, the night shift, the Bingo Boss (the card, a call on the card, a wrong square, three hints, marking squares to Bingo), the landing on the planet, back on the deck with the Boss beaten, Meteor Run (the clock runs, a right answer scores, time up clears the rocks, the best is saved), the mission list with nothing locked, four rows on the grown-ups page, and on a phone the whole Bingo card on screen with squares big enough to tap.
  - The flight runs at 53 frames a second on the test machine's software rendering.
  - `scripts/msq-tour.mjs` takes 70 screenshots at 1280×720 and 390×844 (every sector and level: question, wrong, hint, right; the boss; the landing; Meteor Run), all reviewed by eye.
- **Score: 9.1/10** (gameplay 2.2, learning 1.95, look and sound 1.35, ease of use 1.35, reliability 1.4, completeness 0.85). It loses points on:
  - the Constellations questions have no picture in flight (the top of the screen is empty), like Engines
  - the landing is a still scene with dialogue, not an animation of the fleet flying down
  - the debrief questions have no picture
  - the Bingo Boss is played on a card over the flight, so it feels less like a shooter than the sectors
  - Equation Balance Scale is still to come (its own PR)

##### Kit work for half 2 (after approval)

Only the Roman forum has the walking pieces (`walk`, `blocks`, `setTime`, `omit`). The station deck (Space Quest's home base) and the alien planet (the landing, and later the Balance Scale) need the same, following `ancient-kingdoms/forum.ts`. Space Quest also needs a new flight scene: top-down scrolling space at 24 pixels per tile, with the Star Station palette and glows. The Sunny Town games' build output must not change; it is checked after the kit work.

##### Site changes when it ships

- `/games/multiplication-space-quest` plays the new game.
- `/games/multiplication-bingo-bonanza` and `/games/multiplication-tables-adventure` redirect to it, and their listings are removed.
- `/games/equation-balance-scale` plays the new Balance Scale.
- New card pictures. The old HTML files stay until the Phase 4 cleanup, as for M6.

##### Checks it will ship with

- Unit tests for every job and level over 300+ random seeds:
  - one correct choice
  - every wrong choice tagged with its mistake and computed from it
  - every Bingo call's answer on the card
  - no negative numbers anywhere in the Balance Scale
  - every equation's two sides checked
- A browser test for each game. For Space Quest: the title, the deck, a flight in every sector (steering, a wrong rock, a hint that pauses the flight), upgrades, Bingo Boss, the landing, Meteor Run, a reload and the grown-ups page. For the Balance Scale: every job, the finale, a reload and the grown-ups page. Plus a frame-rate check of the flight scene (30+ fps).
- Screenshots at 1280×720 and 390×844, reviewed by eye, with extra contrast checks on the dark night shift.
- A score against the rubric (8.5 to pass).

### Phase 2: Science (14 games, from 21): IN PROGRESS (Body System Heroes and Solar System Explorer are COMPLETED ✅; 2 of 14 done)

Detailed learning specs are written at the start of this phase, aligned to NGSS. Proposed batches (merged games follow the merge map):

| Batch | Games |
|---|---|
| **S1 Space** | Solar System Explorer, Planet Explorer Quest |
| **S2 Earth** | Rock Cycle Racing, Fossil Dig Adventure, Volcano Explorer Lab (activity), Weather Wizard Battle, Water Cycle Journey (activity) |
| **S3 Life** | Animal Kingdom Match, Plant Growing Championship, Body System Heroes, Ecosystem Building Tycoon |
| **S4 Ocean and environment** | Ocean Depth Diver, Ocean Conservation Heroes, Pollution Solution Squad |
| **S5 Matter and chemistry** | States of Matter Mixer, Crystal Cave Chemistry |
| **S6 Forces, energy and waves** | Magnet Power Puzzle, Simple Machines Construction, Simple Machines Lab (activity), Light Laboratory Escape, Sound Wave Surfer |

#### S3 first: Body System Heroes, the owner's inside-the-body idea: PLAN APPROVED (2026-10-12), look APPROVED, COMPLETED ✅ (half 1 in PR #228, half 2 in PR #229, merged 2026-10-13)

The owner proposed a new Science game: children fly a microscopic ship through the human body, learn what each organ does, find out which germ is making it sick, then heal it and earn upgrades, mission by mission, with a sense of growth like *Spore*. One mission is the flu: learn how it spreads and why handwashing matters, then clear the germs from the lungs.

The review (2026-10-12) scored the idea as first described at about **7.95/10**: a strong hook, but the learning came before the play instead of driving it. With the changes below, the projected score is about **9.2**. The owner liked the direction and answered:

- **World:** Star Station, with a **new "inside the body" setting** in that world (one style per world, many settings).
- **How the flying plays:** **free exploring in all directions**, like *Spore* (not a vertical shooter).
- **Replace Body System Heroes:** the new game takes over the slug `body-system-heroes` (the same web address), and the grades widen from 4–5 to **3–5**.
- **Names:** draft them (below) for the owner to pick.

##### What the original does

- **Teaches:** grades 4–5, five body systems (heart and blood, lungs, digestion, brain and nerves, muscles and bones) as twelve multiple-choice questions, two per system, with points and a health bar. One level, no hints, no explanations, emoji art.
- **Keeps:** the facts that are right. The heart pumps blood; red blood cells carry oxygen; we breathe in oxygen; oxygen enters the blood in the lungs; most digestion happens in the small intestine; stomach acid helps break down food; the brain is the control center; nerves carry messages; adults have 206 bones; the skull protects the brain.
- **Drops or fixes two wrong facts:**
  - "How many muscles does it take to smile?" is a myth with no real answer. **Dropped.**
  - "Which muscle never gets tired? → the heart" is too simple. **Fixed** to the true fact: heart muscle rests a little between every beat.
- **Missing against the standard:** levels, wrong answers built from real mistakes, hints, debriefs, the pixel art, sound, a phone layout, saving and the grown-ups page.

##### The game

- **Setting:** the Star Station's med bay (home base), and the new **inside-the-body setting** of Star Station. Each organ is its own area to fly around: the tiny air sacs of the lungs, the tunnels of the blood vessels, the stomach and the gut, the gums and teeth, a scraped patch of skin and the nerve network of the brain. The 16-bit Star Station look, 24 pixels per tile, glowing and colorful, never gory.
- **Characters (drafts for the owner to pick from; see the choices below):** a host scientist in the med bay who shrinks the ship and briefs each mission; a tiny co-pilot who rides along, scans cells and gives hints; the patient, a friendly station crew member who is feeling unwell (the body we fly through); good cells who help (white blood cells, red blood cells, the gut's good bacteria); and the **Grime Gang**, goofy, gloopy germ villains (one per mission), never scary.
- **How it plays:** each mission has five beats.
  1. **Briefing in the med bay:** the host shows the patient's symptoms and the organ on a body map, with one or two facts about what the organ does.
  2. **Shrink and explore:** the ship flies freely in every direction around the organ. Children steer by **how the organ works**: air flows one way into the lungs, blood flows one way through the heart (the valves close behind you), and food moves through the gut.
  3. **Scan and diagnose:** the co-pilot scans cells. The child answers what is wrong (virus or bacteria? which organ part?) before healing. This is where most questions live.
  4. **Heal:** use the right defense on the germs while protecting the good cells. Zapping the gut's good bacteria hurts your score.
  5. **Back in the med bay:** a quick **healthy-habit mini-game** (for example, scrub hands for 20 seconds: the length of "Happy Birthday" sung twice), a talk-it-through debrief, a "wanted poster" for the germ (the body remembers it) and a ship upgrade.
- **The *Spore* feeling:** the **ship grows** mission by mission with the body's own defenses as upgrades:
  - **Scanner** (start): reads cells and shows what each organ does
  - **Mucus net** (lungs): traps germs, like the sticky lining of the airways
  - **Cilia sweepers** (lungs): tiny brushes that sweep trapped germs out
  - **Antibody darts** (gut, heart): stick only to the matching germ, like a key in a lock (a shape-matching puzzle)
  - **White blood cell escorts** (heart and blood): friendly cells that follow the ship and help
  - **Fever booster** (finale): the brain turns up the heat to slow germs down

  The **body map** fills in as organs heal, like *Spore*'s galaxy. Healed organs stay open to explore freely and collect **body fact cards**.
- **Modeled on:**
  - **Library Rush** for free movement in every direction and enemies that swarm
  - **Multiplication Space Quest** for the ship, the flight controls and the Star Station look
  - **Equation Balance Scale** for the walking hub, the jobs and the finale pattern

##### Missions (grades 3–5)

| Mission | Organ | The problem (the germ) | What it teaches | Healthy habit |
|---|---|---|---|---|
| 1 | Skin | A scraped knee lets bacteria in | Skin is the body's biggest organ and its first wall; a scab protects the cut while it heals | Clean a cut, cover it, don't pick the scab |
| 2 | Mouth and teeth | Cavity bacteria feast on sugar and make acid | Teeth start digestion by chewing; acid from bacteria makes holes in enamel | Brush twice a day, fewer sugary snacks |
| 3 | Nose and lungs | **The flu** (a virus) | The airway (nose → windpipe → lungs → tiny air sacs), where oxygen enters the blood | **Wash hands for 20 seconds**, cough into your elbow, rest |
| 4 | Stomach and gut | Food-poisoning bacteria (and the good gut bacteria to protect) | Chewing → stomach acid → small intestine (where most digestion happens) → large intestine; most gut bacteria are helpers | Wash hands before eating, cook food well |
| 5 | Heart and blood | A germ riding through the blood | The heart has four chambers and pumps one way; red blood cells carry oxygen; white blood cells fight germs and are made in the bone marrow | Exercise keeps the heart strong |
| Finale | Brain and nerves | **The Big Defense:** the whole body works together | The brain is the control center: nerves carry its messages, the skull protects it, and it can turn on a fever to fight germs | Sleep, and tell a grown-up when you feel sick |

##### Learning design

| Mission | Level 1 (grade 3) | Level 2 (grade 4) | Level 3 (grade 5) | Standards |
|---|---|---|---|---|
| Each mission | **Name it:** which part is this, and what does it do? ("Which part takes in oxygen?") | **How it works:** put the steps in order or follow the path (nose → windpipe → lungs → air sacs; chew → stomach → small intestine) | **Cause and effect across systems:** what happens if this part is sick or missing? ("The lungs can't get oxygen into the blood. What happens to the muscles?") | NGSS **4-LS1-1** (internal structures support survival), **5-LS1-1** stretch and **MS-LS1-3** as a top-level preview (body systems working together); National Health Education Standards 1 and 7 (disease prevention, healthy habits) |

- **Mistakes the wrong answers come from:**
  - *Antibiotics cure the flu:* they work on bacteria, not on viruses like the flu.
  - *All germs are bad:* most of the bacteria in the gut are helpers.
  - *You catch a cold or the flu from cold weather:* you catch it from a virus, spread by coughs, sneezes and hands.
  - *Rinsing hands with water is enough:* soap and 20 seconds of scrubbing remove the germs.
  - *The stomach does all the digesting:* most digestion happens in the small intestine.
  - *Lungs are like two empty balloons:* they are made of millions of tiny air sacs.
  - *Blood in your veins is blue:* blood is always red; veins only look blue through skin.
  - *A fever is the sickness:* a fever is the body fighting the germs.
  - *The brain only does thinking:* it also runs breathing and the heartbeat without you thinking about it.
  - *A scab is bad, so pick it off:* the scab protects the cut while new skin grows.
- **Diagnose before healing:** the scan asks what the problem is (a virus or bacteria? which part of the organ?) and which defense will work. The wrong defense bounces off, with a sentence why: "Antibody darts only stick to the germ they match. This one has a different shape."
- **Hint ladder:**
  1. A nudge from the co-pilot: "What does this organ do? Look at where the air is flowing."
  2. A picture: the ship's scanner shows the organ diagram with the right part glowing.
  3. The answer outlined, with its reason.
- **Debriefs** (one per mission, the child picks the best reason):
  - Skin: "Why does a cut need to be cleaned and covered?"
  - Mouth: "Why do sugary snacks make cavities more likely?"
  - Lungs: "Why does washing your hands help stop the flu?"
  - Gut: "Why didn't we zap the good bacteria?"
  - Heart: "Why does the blood need to flow in one direction?"
  - Finale: "How did the brain help the whole body fight back?"
- **Progress and finale:**
  - 5 stars per mission heals that organ on the body map and gives a ship upgrade (done after 5 stars and level 2, or 12 questions, so a child who struggles still finishes).
  - **The finale, The Big Defense:** in the brain, a message race along the nerves calls every defense the ship has collected to the patient's aid. The patient gets well, the crew cheers in the med bay, and the game tells the site it is complete.
  - **Replay:** free exploring in every healed organ to collect body fact cards, and harder levels.
- **Difficulty change from the original:** from one level of twelve recall questions (grades 4–5) to three levels across grades 3–5: naming parts, then how each organ works, then how the body systems depend on each other. Healthy habits are tied to each germ. Every wrong answer is named and explained.
- **Kid-friendly rules:**
  - The germs are goofy and gloopy, never scary. No blood, gore or needles.
  - Being sick is normal; nobody is blamed for catching a germ. The message is "tell a grown-up."
  - The grown-ups page says it is a learning game, not medical advice.
- **Facts checked against:** CDC (handwashing and how flu spreads), NIH MedlinePlus, Nemours KidsHealth, NIH NIDCR (teeth and cavities) and the Smithsonian. They are listed in the grown-ups page credits.

##### How it would be built (three steps, each with an owner look)

1. **Look development for the new setting** (like W0 and W1 for the other settings): a preview page with the med bay, the ship, the co-pilot, two Grime Gang germs and three inside-the-body areas (the lungs' air sacs, a blood vessel tunnel, the stomach). The owner approves the look before the game is built. The setting goes into the world kit as `inside-body`, part of Star Station; the other games stay byte-for-byte unchanged.
2. **Half 1:** the med bay hub, free flight in every direction (keys, mouse and touch: drag to steer on a phone), scanning, the first three missions (skin, mouth, lungs with the flu), the first ship upgrades, the body map, saving and the grown-ups page.
3. **Half 2:** the gut and heart missions, the finale, free exploring and body fact cards, the site listing (replacing the old game at the same address), the card picture and the final score.

**Owner answers (2026-10-12):** "Go with your picks and start the look preview." So:
- the ship is the **Micro-Scout**
- the host is **Dr. Ama Okafor**, the station's doctor and inventor of the shrink beam
- the co-pilot is **Nib**, a tiny round nanobot with one big eye
- the patient is **Commander Ayo** from Multiplication Space Quest
- the germs are the **Grime Gang**: Sniffles, Plaque Jack, Scrapes McGee, Queasy Louie and the Blood Bandit
- the title stays **Body System Heroes**

The plan is approved, and the look preview for the new setting comes first.

##### Look preview: APPROVED (2026-10-12)

The new **inside-the-body setting** of Star Station and the cast, on the look development pages (dev server only, not in the site build: `npm run games` in the repo root, then `/lookdev/#body-cast`, `#body-lungs`, `#body-blood` and `#body-stomach`):
- **The cast sheet:**
  - the Micro-Scout, resting, thrusting and facing left
  - Nib, in flight and in the talk box (happy and thinking)
  - Dr. Ama Okafor, in a white coat and teal headwrap, with a portrait
  - Commander Ayo, the patient
  - two of the Grime Gang: Sniffles the flu virus (covered in knobby spikes, like the real virus) and Plaque Jack the cavity bacteria (a rod with a sugar-cube hat)
  - the body's helpers: red blood cells, a white blood cell, good gut bacteria, oxygen bubbles and mucus
  - the med bay: the shrink beam with the Micro-Scout being shrunk, the med bed, and the body map with the lungs lit
- **Three areas to fly in** (Three.js scenes at 24 pixels per tile, with the Micro-Scout flying a loop and Nib alongside, plus a talk box from Nib):
  - **the lungs:** an airway lined with cilia across the middle, bunches of air sacs wrapped in tiny blood vessels, oxygen bubbles drifting by, mucus, and three Sniffles
  - **a blood vessel:** red blood cells streaming one way, flow streaks on the vessel wall, and a white blood cell on patrol
  - **the stomach:** soft folds, a glowing pool of stomach acid with rising bubbles, bits of food, the valve that opens into the small intestine, and good gut bacteria waiting there
- **Code:**
  - `src/kit/worlds/star-station/body-art.ts` (the cast and props)
  - `src/kit/worlds/star-station/body.ts` (the settings `body-lungs`, `body-blood` and `body-stomach`)
  - `src/lookdev/body.ts` (the pages)
  - `scripts/body-lookdev-shots.mjs` (screenshots)

  The new settings are **not in the shared settings list yet**, so the finished games' built files are byte-for-byte unchanged. They join the list when the game is built.
- **Fixed after looking at the screenshots:**
  - the camera showed mostly the back wall instead of the floor where the ship flies
  - the lungs' air-sac pattern was too busy
  - the air-sac bunches stood on stems like trees
  - the stomach's folds were too bold
  - Dr. Ama had the same hair puffs as the default player (now a teal headwrap)

##### Half 1: BUILT and MERGED (2026-10-12, PR #228)

The owner approved the look ("I like the look of the inside of the body and it's kid friendly. The germs aren't scary, and the ship looks good") and asked for half 1.

**What a child does:**
1. **The med bay** (the station deck, walked like the other Star Station games). Dr. Ama Okafor explains that Commander Ayo is sick. Nib the nanobot says hello. The body map on its stand shows which parts are healed. Talk to Dr. Ama or step onto the shrink beam to pick a mission.
2. **The dive.** The Micro-Scout shrinks and flies inside Commander Ayo. It flies freely in every direction: arrow keys or WASD, holding the mouse (the ship flies toward it), or the touch pad on a phone. In the lungs the air flow gently pushes the ship.
3. **Scan three spots.** Each glowing ring opens a question from Nib about what this part of the body does. A wrong answer is crossed out, with one sentence about the mix-up. Hints come in three steps: the first two never give the answer away, the third outlines it. Leave closes the question and the spot stays open for later.
4. **The germs' nest.** It stays locked until the three spots are scanned. Then Nib asks a question about the germ (for example, why we rinse a scrape, or why antibiotics do not work on the flu).
5. **The heal.** The germs scatter. Fly close and the ship's cleaning beam zaps them. Germs bump the ship, but nothing is ever lost. When they are all gone, the spot glows green and a ring takes the ship home.
6. **The healthy habit**, back in the med bay (the first time, and again from the body map):
   - **Skin:** rinse the dirt out of a scraped knee with water, then put on a bandage.
   - **Mouth:** brush the plaque off every tooth (two minutes of brushing, sped up to 15 seconds).
   - **Lungs:** scrub every germ off both hands with soap for a real 20 seconds ("Happy Birthday" sung twice). It cannot be finished early, even when every germ is gone.
7. **Healed!** After 5 stars (and level 2, or 12 questions), Dr. Ama asks one debrief question. Then the organ lights up on the body map, a "germ file" (a wanted poster: what it is, where it lives, how to stop it) opens, and the ship gets an upgrade.

**The three missions and their upgrades** (the plan's upgrade list was matched to the missions that come first):

| Mission | Germ | Upgrade earned | What it does |
|---|---|---|---|
| The Scraped Knee (skin) | Scrapes McGee (bacteria) | **White blood cell escort** | A white blood cell flies along and zaps germs too |
| The Sugar Trap (mouth and teeth) | Plaque Jack (cavity bacteria) | **Saliva wave** (E, Space or the Wave button) | A wave that washes over nearby germs, then fills up again |
| The Flu (nose and lungs) | Sniffles (the flu virus) | **Mucus net** | Sticky mucus that slows germs down, like the lining of the airways |

The gut, heart and brain missions show on the body map as "coming soon".

**Questions:** 18 per mission (54 in all): 6 per level, 4 about the body part (scan) and 2 about the germ (nest). Every wrong answer names a mix-up (for example "virus or bacteria", "antibiotics for a virus", "cold weather causes the flu", "water is enough", "pick the scab"). The grown-ups page shows each mission's most common mix-up. The standards are NGSS 4-LS1-1 (structures and their jobs) and the National Health Education Standards 1 and 7 (health facts and healthy habits), with a preview of MS-LS1-3 (body systems working together). Facts were checked against the CDC, NIH MedlinePlus, Nemours KidsHealth and the American Dental Association.

**Code:**
- `games-src/adventures/body-system-heroes/` (the page)
- `src/games/body-system-heroes/`:
  - `game.ts` (the flow)
  - `world.ts` (the med bay)
  - `flight.ts` (the dive)
  - `habit.ts` (the habit games)
  - `problems.ts` (the questions)
  - `content.ts` (the words)
  - `art.ts`, `save.ts`, `music.ts` and the CSS
- The kit gained the skin and mouth areas (`body-skin`, `body-mouth`) and Scrapes McGee. The body settings are still kept out of the shared settings list.
- Adding a new game makes the bundler reorder the shared code files, so their names change. The finished games' own code is unchanged, and all 12 games were loaded in a browser with no errors.

**Checks:**
- 7 unit tests for the questions. They check:
  - the wording rule (facts first, one question, short sentences)
  - that hints never contain the answer
  - that there are no he/she pronouns
  - that a question doesn't repeat until all have been shown
- A browser playthrough of the whole of half 1, with real keys, mouse and scrubbing (`scripts/e2e-body-system-heroes.mjs`, 52/52 checks, including a phone check).
- A screenshot tour (`scripts/bsh-tour.mjs`) at desktop and phone size.
- 34 fps in the lungs with software rendering (the slow worst case on this machine).

**Fixed after looking at the screenshots:**
- the knee in the clean-and-cover game looked like stripes (it is now a leg seen from the front)
- the healed spot now glows green with a burst of sparkles
- on a phone, the action button now sends the saliva wave
- "practise" became "practice"

**Provisional score: 8.7/10:**
- gameplay and feel 2.15/2.5 (no finale until half 2)
- learning 1.85/2.0
- visual and audio 1.35/1.5
- usability 1.35/1.5
- technical 1.35/1.5
- completeness 0.65/1.0 (three of six missions, not yet listed on the site)

**Not yet:** the game is not listed on the site until half 2, so the old Body System Heroes still plays at its address.

##### Half 2: COMPLETED ✅ (built 2026-10-12, owner merged PR #229 on 2026-10-13)

The owner merged half 1 and asked for half 2.

**The two new missions:**

| Mission | Germ | Area | What is new in the play | Habit | Upgrade |
|---|---|---|---|---|---|
| The Tummy Trouble (stomach and gut) | Queasy Louie, food-poisoning bacteria in a chef's hat | the stomach | Good gut bacteria wander near the germs. The beam zaps whatever cell is closest, so the child steers until the germs are closer than the helpers. Hitting a helper only pauses the beam, with a line from Nib. | Keep food safe: rinse the dirt off fruit and vegetables, then put the milk in the fridge | **Gut buddies**: two good bacteria fly with the ship and slow nearby germs |
| The Blood Bandit (heart and blood) | The Blood Bandit, a germ in a bandit mask riding a red blood cell | a blood vessel | The blood flows one way and pushes the ship in beats, about 72 a minute | Get moving: a jump-rope game, where every jump raises the heart rate from 80 to up to 140 beats a minute | **Antibody darts**: every few seconds a dart sticks to one germ, and the beam clears it twice as fast |

(The plan's upgrade list was matched to the missions: the white blood cell escort came from the skin in half 1, and "cilia sweepers" and the "fever booster" were folded into the mucus net and the finale's fever.)

**The finale, The Big Defense** (opens when the five organs are healed):
- **The brain:** a new area of the inside-the-body setting (`body-brain`). Its floor is soft folds of brain tissue, crossed by nerve cells and glowing nerve paths with sparks (messages) running along them, and the skull sits at the back.
- **The nerve relays:** five relays light up one at a time. Each asks a "whole body" question, and answering sends the brain's call to one part of the body (the skin, the airways, the bone marrow, the stomach, then a fever for the whole body).
- **The last stand:** the whole Grime Gang comes out together, every upgrade helps, and the fever slows every germ down.
- **The ending:** back in the med bay comes the last debrief ("How did the brain help the whole body fight back?"). Then Commander Ayo is well, the crew cheers, the Grime Gang's germ file is added, and the game tells the site it is complete.

**Free exploring and body fact cards:**
- Every healed part of the body has an **Explore** button on the body map: fly in with no questions and no germs.
- Find the three gold **fact cards** in each part (18 in all, for example "Your heart beats about 100,000 times a day").
- The body map keeps the collection.

**On the site:** the game is now listed at its old address (`/games/body-system-heroes`, grades 3–5) and replaces the old game. Its card picture shows the Micro-Scout and Nib flying through the airway toward three Sniffles.

**Questions:** 108 in all, 18 per mission (6 per level). The gut and heart add mix-ups such as "all bacteria are bad", "blood in the veins is blue" and "the heart gets tired and stops to rest". The finale adds "the brain only does thinking". The 7 unit tests now check all six missions.

**Code:**
- `src/kit/worlds/star-station/body.ts` gained the brain area (`BRAIN_NEURONS`, `BRAIN_PATHS`).
- `body-art.ts` gained Queasy Louie, the Blood Bandit and a nerve cell.
- In the game folder:
  - `flight.ts` gained the helpers, buddies, darts, pulse, relays, fever and fact cards
  - `habit.ts` gained the food game and the jump-rope game
  - `content.ts` gained the missions, the relays and the fact cards
- The body settings are still kept out of the shared settings list.

**Testing:** `scripts/e2e-body-system-heroes.mjs` passes 73 of 73 browser checks with no console errors. It plays the whole game from a new save: every mission, both new habits, the finale, free exploring, the body map, the grown-ups page and the save. The tour (`scripts/bsh-tour.mjs`) screenshots were reviewed. There are 180 game unit tests and 94 site tests.

**Two speed fixes found while testing:**
- **Graphics memory:** each dive used to build a new copy of its body area and never freed the old one, so the game got slower after many dives (44 down to 24 frames a second after 12 dives). Each body area is now built once and reused, and everything made for a dive goes in one group that is freed when the next dive starts. It stays at about 50 frames a second.
- **The fever glow:** the kit draws a glow one pixel at a time. The finale's fever glow is wide enough (576 pixels) that the browser hands that drawing to the graphics chip, and on computers without a strong one (including the test browser) the finale dropped to half a frame a second. The game now builds that one glow with all its pixels in one step (`feverPool` in `flight.ts`), and the finale runs at about 40 frames a second. Every other glow in the game is under 256 pixels and is not affected. The kit's `glowCanvas` was left alone so the finished games stay unchanged.

**Self-score (provisional, the owner decides): 9.2 / 10.** It is the biggest game so far: six missions, two new kinds of play in the gut and heart, a finale that ties the body systems together, and free exploring with fact cards. It is held back by reading load for grade 3 in the finale's "whole body" questions.

##### Choices for the owner (answered above)

1. **The ship's name** (drafts):
   - **Micro-Scout** (recommended: says what it does, easy to read aloud)
   - **The Pocket Comet** (fun and space-y)
   - **The Tiny Titan** (sounds brave)
2. **The host**, the med bay scientist who shrinks the ship and briefs each mission (drafts):
   - **Dr. Ama Okafor**, the station's doctor and inventor of the shrink beam (recommended)
   - **Medic Rio Tan**, a young station medic on their first big case
   - **Professor Bea Quill**, an excited scientist who loves body facts
3. **The co-pilot**, who rides in the ship, scans cells and gives hints (drafts):
   - **Nib**, a tiny round nanobot with one big eye (recommended: a robot fits Star Station and can't be confused with a germ)
   - **Dot**, a friendly white blood cell who joined the crew
   - **Zip**, a speedy little scanner drone
4. **The patient** (drafts): **Commander Ayo** from Multiplication Space Quest (recommended: links the two Star Station games), or a new crew member such as **Chef Bruno**.
5. **The Grime Gang** (germ villain drafts):
   - **Sniffles** the flu virus
   - **Plaque Jack** the cavity bacteria
   - **Scrapes McGee** for the cut
   - **Queasy Louie** for food poisoning
   - **The Blood Bandit** for the heart mission
6. **The title:** keep **Body System Heroes** (the same name and address), or rename it, for example **Micro-Scout: Inside the Body**. The address stays the same either way.


#### S1 Space: Solar System Explorer: COMPLETED ✅ (owner merged PR #231 on 2026-10-17; both halves, 9.3/10)

> Source: the old site games `public/games/solar-system-explorer.html` (grades 2–5) and `public/games/planet-explorer-quest.html` (grades 3–5). They merge into one game at the surviving slug **`solar-system-explorer`**, grades **2–5**; `/games/planet-explorer-quest` redirects to it.
>
> The owner picked this game on 2026-10-13 (option A: the Star Station world is already built, and it finishes the S1 Space group with one game). **Wild Lands, the nature world, comes right after it** (owner, 2026-10-13), because most of S2–S4 belongs there.

##### What the originals do (studied 2026-10-13)

- **Solar System Explorer** (grades 2–5) shows the 8 planets in order, one fact each, then one recall question per planet ("Which planet is the Red Planet?"). There's one level and a skip button. A wrong answer only shows the right one and moves on. Emoji art, no saving.
- **Planet Explorer Quest** (grades 3–5) shows a click-to-fly map of the solar system with a ship. Each planet opens a fact card (distance from the Sun, day length, year length, moons), one "why" question with a short explanation, and a fun fact. Its fuel counter goes down but never matters, and the orbits are drawn evenly spaced, which hides the real pattern (the gaps grow hugely farther out).
- **Keeps:** the planet order and each planet's headline fact (Mercury smallest and closest; Venus hottest with thick clouds; Earth with liquid water and life; Mars red from rusty soil, with the biggest volcano; Jupiter biggest, with the Great Red Spot storm; Saturn's rings of ice and rock, and it's less dense than water; Uranus on its side; Neptune windiest, found by math first). Also the "why" questions and the fact cards (distance, day, year), which become the planet postcards.
- **Fixes (facts that are wrong or out of date, checked against NASA):**
  - *"Mercury is the fastest planet because it has less distance to travel."* That explains its short **year**, not its **speed**. It moves fastest because the Sun's gravity pulls hardest close in. **Fixed.**
  - *Uranus: "rotates on its side" vs the wrong answer "rotates backwards".* Uranus really does spin backwards too (like Venus), so that wrong answer is also true. **Fixed** with a wrong answer that is really wrong.
  - *The Great Red Spot "has been raging for over 400 years".* NASA says it has been watched since at least the 1830s, so that is more than 150 years. Older sightings are uncertain. **Fixed** to "more than 150 years".
  - *Olympus Mons is "3 times taller than Mount Everest".* NASA says about two and a half times. **Fixed.**
  - *Moon counts* (Jupiter "95+", Saturn "146+", Uranus 28). These are out of date: in 2025 NASA counted 274 for Saturn, and Uranus got a 29th. **Replaced** with "dozens" or "hundreds", and "scientists keep finding more", which teaches something true about science.
  - *"Day length: 59 Earth days" (Mercury), "243" (Venus).* Those are one full **spin**. Sunrise to sunrise is longer (176 Earth days on Mercury). The postcards say "one spin" so the numbers stay right.
- **Missing against the standard:** levels, wrong answers built from real mistakes, hints, debriefs, anything about the Sun, stars, day and night, shadows or gravity (the grade 5 standards), the pixel art, sound, a phone layout, saving and the grown-ups page.

##### The game

- **Setting:** the **Star Station observatory**, a new walking area on the station (part of the Star Station world): a big glass dome with a telescope, a working model of the solar system (an orrery), a globe lab and a planetarium. From the observatory the ship hops to the planets on Navigator Sol's star map. The 16-bit Star Station look, 24 pixels per tile. Rocky planets reuse the alien-planet setting's walking pieces with each planet's own colors and sky (grey craters on Mercury, orange haze on Venus, red dust on Mars). The giant planets get a cloud-dive view instead, because **there's no ground to land on**.
- **Characters (drafts for the owner to pick from; see the choices below):**
  - **Host: Navigator Sol**, "Keeper of the Star Map" from Multiplication Space Quest, now running the observatory. This links the Star Station games.
  - **Station helpers, one per station:** an astronomer at the planetarium, an Earth scientist at the globe lab, and a launch engineer at the launch bay.
  - **Sidekick:** a small probe robot that flies the planet hops with you, takes the postcards and gives hints. It is the star of the finale.
  - Commander Ayo, Dr. Ama and Gloop can appear at the finale's star party.
- **How it plays:** walk the observatory and talk to people with a "!" over them, as at the outpost in Equation Balance Scale. Each station is a hands-on **space model** you play with, not a quiz panel:
  1. **The Orrery (Planet Tour):** drag the planets onto their orbits in the right order. Then the model runs, and you can see that close planets go round faster. From here, **hop to a planet** on the star map (a short hop, not a shooter). On a rocky planet you drive the probe's little rover over a patch of ground (people could not survive on Venus or Mercury, but robots have landed on them) to find three things: a sample, a fact card and a question. On a giant planet the probe dives through the cloud bands. Every planet visited adds a **planet postcard** to your album. This is where Planet Explorer Quest lives on.
  2. **The Sunrise Lab (day and night):** a big globe with a tiny pixel town on it and a lamp for the Sun. Turn the crank to spin Earth and watch the town go from sunrise to night. Then the **shadow puzzles**: drag the Sun across the sky over a flagpole and pick where its shadow falls and how long it is.
  3. **The Star Dome (the Sun and stars):** a planetarium. Find out the Sun is a star, why it looks so much bigger and brighter than the others (two lamps at different distances), and turn the season dial to see which star pictures are up on winter nights and on summer nights.
  4. **The Launch Bay (gravity and orbits):** a launch cannon on a little planet. Too slow and the probe falls back; just right and it falls *around* the planet: that's an orbit. Drop balls from people standing all around a globe: "down" always means toward the middle. Farther planets take longer to go round, so their years are longer.
- **Finale: The Grand Tour.** Plot the probe's route from the Sun out to Neptune in order, then launch. The probe flies past each planet (a gentle flyby where you tap to take its photo, with one mixed question from every station). At the edge it turns round to take a picture of Earth as a tiny dot, like the real Voyager 1 "Pale Blue Dot" photo from 1990. Then the dome opens at night for a **star party** where the whole crew looks at your photos, and the game tells the site it's complete.
- **Replay:** the postcard album (8 planets, plus the Sun, the Moon and Pluto as a dwarf planet), harder levels, and every model stays free to play with.
- **Modeled on:**
  - **Equation Balance Scale** for the walking hub on Star Station, the jobs with a scale you drag things onto, and the finale pattern
  - **Multiplication Space Quest** for the star map, the ship and the landing on the alien planet
  - **Shape Town Builders** for drag-to-place building (the orrery)

##### Learning design

The space standards in NGSS sit in grade 1 (patterns of the Sun, Moon and stars) and grade 5 (the Sun is a star, day and night, shadows, seasonal stars, gravity). So **level 1 is grades 2–3** (names, order, the basic patterns), **level 2 is grade 4** (comparing and explaining patterns), and **level 3 is grade 5**, with a little middle-school preview (scale, why we have seasons).

| Station (helper) | Skill | Level 1 (grades 2–3) | Level 2 (grade 4) | Level 3 (grade 5) | Standards |
|---|---|---|---|---|---|
| The Orrery (Navigator Sol) | The planets: order, kinds, what makes each one special | Name the planet from its picture and one fact; put Mercury to Mars in order | All 8 in order; rocky planets vs giant planets; the planet-postcard "why" questions (why is Mars red?) | Patterns and scale: farther out = colder and slower, with Venus as the trap; you can't land on a giant; how far apart they really are | 5-ESS1-1 (stretch), MS-ESS1-3 (scale, preview) |
| The Sunrise Lab (Earth scientist) | Day and night, and shadows | Day on the side facing the Sun; the Sun rises in the east and sets in the west | Earth spins once a day, so the Sun only *seems* to move; a shadow points away from the Sun | Shadow length through the day (long in the morning, shortest near midday, long again in the evening); which way it points at each time | 1-ESS1-1, **5-ESS1-2** |
| The Star Dome (astronomer) | The Sun and other stars | The Sun is a star; stars are still there in the daytime, the Sun's light just hides them | The Sun looks biggest and brightest because it is the closest star; the Moon shines with reflected sunlight | Some star pictures are seen only in some seasons, because Earth goes round the Sun (Orion on winter nights, Scorpius on summer nights, from the northern half of Earth) | 1-ESS1-1, **5-ESS1-1**, **5-ESS1-2** |
| The Launch Bay (launch engineer) | Gravity, orbits and years | Gravity pulls things down; one trip round the Sun = one year | "Down" means toward the middle of Earth, everywhere on Earth; farther planets have longer years | Orbits: moving sideways fast enough, the probe falls *around* the planet; astronauts float because they are falling round Earth, not because there's no gravity; seasons come from Earth's tilt, not its distance from the Sun (preview) | **5-PS2-1**, MS-ESS1-1 (seasons, preview) |

- **Mistakes the wrong answers come from:**
  - *The Sun moves around Earth:* day and night come from Earth spinning.
  - *The Sun goes away at night:* it is shining on the other side of Earth.
  - *The closest planet is the hottest:* Venus is hotter than Mercury, because its thick air traps heat.
  - *The Sun isn't a star (or it's the biggest star):* it's a medium-sized star that looks big because it's close.
  - *Stars aren't there in the daytime:* the bright sky hides them.
  - *Seasons happen because Earth gets closer to the Sun:* it's the tilt. Earth is actually closest to the Sun in early January, during northern winter.
  - *The planets are evenly spaced:* the gaps get much bigger farther out.
  - *A shadow points toward the Sun, or stays the same length all day.*
  - *People at the bottom of Earth would fall off:* "down" is always toward the middle.
  - *There's no gravity in space:* gravity keeps the Moon and the planets in orbit.
  - *You can land on Jupiter:* the giant planets have no solid surface to stand on.
  - *Pluto is the ninth planet, or the Moon is a planet:* Pluto has been a dwarf planet since 2006, and the Moon goes round Earth.
- **Hint ladder:**
  1. A nudge from the probe: "Where is the Sun's light shining?"
  2. A picture: the station's own model shows it, such as the globe with the lit half glowing, the orrery with one orbit lit, two lamps at different distances, or the probe's path curving round the planet.
  3. The answer outlined, with its reason.
- **Debriefs** (one per station, the child picks the best reason):
  - Orrery: "Mercury is closest to the Sun. Why is Venus hotter?"
  - Sunrise Lab: "Why does the Sun seem to cross the sky every day?"
  - Star Dome: "Why does the Sun look so much bigger and brighter than other stars?"
  - Launch Bay: "Why doesn't the probe in orbit fall back down?"
- **Progress and finale:** 5 stars per station lights one of the dome's four big **telescope lenses**. A station counts as done after 5 stars and level 2, or after 12 questions, so a child who struggles still finishes. All four lenses unlock the Grand Tour. Planet postcards fill the album as you go.
- **Question wording** (the owner's rule from 2026-10-10): short sentences, facts first, then one plain question, in words that match the picture, with no game jargon. For example: "The Sun is on this side. Which side of Earth has day?"
- **Difficulty change from the original:** from one level of 8 recall questions to three levels across grades 2–5 and four skills. The old games only covered planet facts. The new one adds the grade 5 standards on the Sun, stars, day and night, shadows and gravity, with hands-on models, named mistakes, hints and debriefs.
- **Facts checked against:** NASA Science (Solar System Exploration, planet fact sheets, Voyager), the NASA Space Place pages for kids, NOAA (seasons) and the IAU (Pluto as a dwarf planet). They're listed in the grown-ups page credits.

##### How it would be built (three steps, each with an owner look, as for Body System Heroes)

1. **Look preview:** a lookdev page with the observatory (the dome, telescope, orrery, globe lab, planetarium and launch bay), the cast, the probe, the star map, two rocky planet surfaces (Mars and Mercury) and one giant planet's cloud dive (Jupiter). The owner approves the look before the game is built. The observatory goes into the world kit as a new Star Station setting; the other games stay byte-for-byte unchanged.
2. **Half 1:** the observatory, the Orrery with the star-map hops, all 8 planet stops and the postcard album, the Sunrise Lab, saving and the grown-ups page.
3. **Half 2:** the Star Dome, the Launch Bay, the Grand Tour finale and star party, the site listing (with `/games/planet-explorer-quest` redirecting), the card picture and the final score.

##### Choices for the owner

1. **The kind of game:**
   - **(a) Walking observatory with hands-on space models, plus short hops to the planets** (recommended). It plays differently from the last two games, which were both flying games, and the models are what actually teach the grade 5 ideas (spinning Earth, shadows, orbits).
   - **(b) Free flight round a big solar system**, like Body System Heroes, with each station on a planet. This is more action, but it would be the third flying game in a row, and day and night or shadows are hard to teach from a ship.
   - **(c) Just the orrery and star map** (a smaller game, like the old ones but deeper). It would be quicker to build, but it would score lower on variety and leave out the grade 5 standards.
2. **The host:** **Navigator Sol** from Multiplication Space Quest (recommended), or a new astronomer.
3. **The helpers** (drafts):
   - Star Dome astronomer: **Astronomer Lumi Reyes** (recommended), or **Stargazer Oona**
   - Sunrise Lab Earth scientist: **Dr. Kofi Mensah** (recommended), or **Professor Hana Ito**
   - Launch Bay engineer: **Engineer Tess Rocket** (recommended), or **Chief Bolt**
4. **The probe sidekick** (drafts): **Vee** (recommended: short for Voyager, and easy to read aloud), **Comet** or **Blink**.
5. **The title:** keep **Solar System Explorer** (recommended; the same address either way), or something like **Sol's Observatory: Solar System Explorer**.
6. **Two halves**, with a quick look in between (recommended, as for the last games), or all at once.

**Owner answer (2026-10-15):** "This is a good use of updating the old games. I'll go with your picks." So:
- **(a)** the walking observatory with hands-on space models and short hops to the planets
- the host is **Navigator Sol**; the helpers are **Astronomer Lumi Reyes** (Star Dome), **Dr. Kofi Mensah** (Sunrise Lab) and **Engineer Tess Rocket** (Launch Bay)
- the probe is **Vee**
- the title stays **Solar System Explorer**
- built in **two halves**, with a look preview first

##### Look preview: APPROVED (2026-10-15: the owner said "Build half 1")

Open with `cd games-src/adventures && npm run dev`, then `/lookdev/#space-cast`, `#space-observatory`, `#space-mars`, `#space-mercury` and `#space-jupiter`. `node scripts/space-lookdev-shots.mjs` saves the screenshots to `test-output/space-lookdev/`.

- **The cast sheet:**
  - Vee (hovering, thrusting, facing left, blinking, and in the talk box)
  - the crew and the player
  - the Sun, the eight planets, the Moon and Pluto
  - the space models: the orrery running, the globe lab turning from day to night, the star projector, the launch cannon and the big telescope with its lenses dark and lit
  - Navigator Sol's star map and three postcards
  - the three finds and the Jupiter cloud dive
- **The observatory:** a domed room with an arched window onto the stars, the Milky Way, the Moon and Earth's blue edge. The telescope stands in the middle, with the models and their helpers round it, the Star Dome door on the left and the Launch Bay hatch on the right.
- **Mars:** rusty dust, dark boulders and craters, a butterscotch sky with a small Sun, and Olympus Mons as a long, low hill on the horizon. The rover, Vee and the three finds are there.
- **Mercury:** grey craters and long cliffs, a black sky even in the day, and a big Sun.
- **Jupiter:** Vee dives through cloud bands that blow in opposite directions. It gets darker deeper down, with lightning.
- **Code:**
  - `src/kit/worlds/star-station/space-art.ts` (the crew, Vee, the planets, the models, the star map and postcards)
  - `observatory.ts` (the observatory setting)
  - `surfaces.ts` (the planet stops and the cloud dive)
  - `src/lookdev/space.ts`
  - These are kept out of the shared settings list, so the other games stay unchanged (all 180 unit tests pass).

##### Half 1: BUILT (2026-10-15), APPROVED (2026-10-16: the owner said "It works now and plays well. Build half 2")

What a child can do now (not listed on the site yet; it opens at `/games/play/solar-system-explorer/index.html`; the address needs the `index.html`, because the site drops a slash at the end):

- **The observatory:** walk round the domed room with Vee following.
  - Navigator Sol stands by the big telescope. Its four lenses light up one per finished station, in each station's own color.
  - Lumi and Tess say their stations open soon (half 2).
- **The Orrery (Navigator Sol): 27 questions.**
  - Level 1: name a planet from its picture, and "which planet goes on the glowing ring" for the first four rings.
  - Level 2: all eight in order, rocky planets and giants, and the old games' "why" questions with the facts fixed.
  - Level 3: the patterns: longer years far out, Mercury fastest because the Sun's pull is strongest close in, Venus hotter than Mercury, no ground on a giant, the gaps grow, Pluto, cold Neptune.
  - The debrief: "Why is Venus hotter than Mercury?"
- **The Sunrise Lab (Dr. Kofi Mensah): 18 questions.**
  - A globe lit by a lamp. The lamp is on the right and the globe turns like the real Earth, so the town comes out of the night at the front: a sunrise.
  - A flagpole with East and West labels, for shadows.
  - Level 1: the lit half has day; sunrise in the east and sunset in the west; a shadow falls away from the Sun.
  - Level 2: one spin is about 24 hours; the Sun only seems to move; why we have night; which way a shadow points in the morning and the evening.
  - Level 3: shadow length through the day; a sundial; midnight on the far side of Earth.
  - The debrief: "Why does the Sun seem to cross the sky?"
- **The star map and all 8 planet stops.**
  - On Mercury, Venus, Earth and Mars, drive the rover to three finds: a sample (Vee says what it is), a fact card (distance, one spin, one year, moons) and a question.
  - On Jupiter, Saturn, Uranus and Neptune there is no ground, so Vee dives into the clouds. The child steers with the arrow keys or a finger to catch the three finds. It gets darker deeper down, with lightning.
  - Three finds earn a postcard for the album (B).
  - Leaving early keeps the finds already collected.
  - New surfaces for Venus (an orange sky with the Sun hidden by clouds, flat dark rocks) and Earth (grass, ponds, flowers, a blue sky with clouds).
- **Hints** go from a nudge, to a picture, to the answer outlined. The picture is one of:
  - the planets in a row, with the asked one hidden behind a "?"
  - the rocky and giant groups
  - the lamp's rays on the globe
  - the Sun's rays past the flagpole to the shadow's tip
  - the Sun's path across the sky
- **Saving and the grown-ups page:** progress rows for the two stations and the planet stops, the standards, talking points and what the game simplifies.
- **Checks:**
  - 10 unit tests (`tests/sse-problems.test.ts`). They also make sure the old games' mistakes cannot come back.
  - 51/51 browser checks (`scripts/e2e-solar-system-explorer.mjs`).
  - 49 fps in the observatory, 55 on Mars and 60 in a dive, even with the slow software rendering on the test machine.
  - The other Star Station games still pass all their browser checks (Equation Balance Scale 62/62, Body System Heroes 73/73, Multiplication Space Quest 66/66).

Provisional score (half 1): 8.75/10.

| Category | Points | Evidence |
|---|---|---|
| Gameplay and feel | 2.2 / 2.5 | Walking, driving the rover, steering a dive and collecting postcards give real variety. The weakest point: the stations are answered with buttons, and the orrery and globe models move on their own rather than being dragged or cranked by the child. |
| Learning accuracy and clarity | 1.85 / 2.0 | 69 questions across three levels. Every wrong answer names a real misconception. Hint 2 always adds a picture, and both stations have a debrief. Facts were checked against NASA. |
| Visual and audio polish | 1.35 / 1.5 | New 16-bit art for the observatory, four surfaces and four cloud palettes, plus three songs. The orrery picture in the panel is small next to the planet pictures. |
| Usability and accessibility | 1.35 / 1.5 | Keyboard, mouse and touch all work, read-aloud is on, the phone layout fits (51 checks include a phone), and reduced motion stills the bands and the bobbing. |
| Technical reliability | 1.4 / 1.5 | No console errors, no requests to other websites, smooth on software rendering, and saves are checked when loaded. |
| Completeness | 0.6 / 1.0 | Half 1 only: the Star Dome, the Launch Bay, the Grand Tour, the site listing and the redirect come in half 2. |

##### Half 2: BUILT (2026-10-16), merged by the owner in PR #231 (2026-10-17)

What half 2 adds (the game is now listed on the site at `/games/solar-system-explorer`, replacing the old one, and `/games/planet-explorer-quest` redirects to it):

- **The Star Dome (Astronomer Lumi Reyes): 18 questions** and a hands-on **season dial**.
  - The dial: turn it to each season. A picture from above shows Earth on its trip round the Sun, with its night side looking out at that season's star picture (Orion in winter, Leo in spring, Scorpius in summer, Pegasus in autumn), next to that evening's sky.
  - Level 1: the Sun is a star (the closest one); the stars are still there in the daytime; only the Sun makes its own light; star pictures are called constellations.
  - Level 2: the Sun looks biggest and brightest because it is closest (two lamps that are just the same, one close and one far away); the Moon and Venus shine with reflected sunlight; the Sun and the Moon look the same size because the Sun is about 400 times wider and about 400 times farther away.
  - Level 3: star pictures come and go with the seasons because Earth goes round the Sun; Scorpius is in the day sky in winter; the stars are very far apart (the next closest star is about 270,000 times farther away than the Sun).
  - The debrief: "Why does the Sun look so much bigger and brighter than the other stars?" Finishing earns the Sun's bonus postcard.
- **The Launch Bay (Engineer Tess Rocket): 18 questions** and a hands-on **launch cannon** worked out with real gravity (Isaac Newton's thought experiment).
  - The cannon: pick a speed and fire. Too slow and the probe lands; just right and it falls all the way round (an orbit); super fast and it flies off into space. Finding an orbit finishes it.
  - Level 1: gravity pulls things down; the Sun's gravity keeps the planets going round; one trip round the Sun is a year (eight birthdays, eight trips).
  - Level 2: "down" means toward the middle of Earth, even for a child on the bottom of the globe; farther planets have longer years (Mars 687 days, Neptune about 165 years); Earth's gravity keeps the Moon going round; you could jump about six times higher on the Moon.
  - Level 3: orbits (the probe falls but the ground curves away); astronauts float because they are falling round Earth with the station; a super fast probe gets away; the seasons come from Earth's tilt, not its distance (Earth is closest to the Sun in early January).
  - The debrief: "Why doesn't a probe in orbit fall back down?" Finishing earns the Moon's bonus postcard.
- **Hint pictures for the new stations:** the two lamps (labelled close and far away), the day sky with the hidden stars drawn faintly, Earth's trip past the star pictures, the sunlight's path to the Moon and on to Earth, the cannon's three paths (too slow, just right, too fast), arrows from every child's ball to the middle of Earth, each planet's year under the row of planets, and tilted Earth in December and June.
- **The Grand Tour (the finale)**, once all four lenses are lit:
  1. Plot the route: tap the planets in order from the Sun. A planet out of order is not placed, with a reason; after two misses the next one is outlined.
  2. Fly: each planet glides past, Vee says one thing about it, and the child takes its photo (Space or Enter, a click or a tap). On the way Sol, Kofi, Lumi and Tess each radio one question from their station (four in all, no stars to lose).
  3. Past Neptune, Vee turns round and photographs Earth as a tiny blue dot in a sunbeam, like the real Voyager 1 "Pale Blue Dot" photo from 1990.
  4. The star party: the crew under the open dome with the Milky Way overhead and the nine photos pinned up. Each crew member says one line, Pluto's bonus postcard goes into the album, and the game tells the site it is complete.
  - "End the flight" stops the tour at any photo. The tour can be flown again any time from Navigator Sol.
- **The album** now has the eight planets plus three bonus postcards (the Sun, the Moon and Pluto). **The grown-ups page** covers all four stations, the planet stops and the Grand Tour, with 5-PS2-1 and the seasons preview added to the standards.
- **Code:** `toys.ts` (the season dial and the cannon), `physics.ts` (the cannon's gravity), `tour.ts` (the Grand Tour flight), new pictures in `art.ts`, and two new songs (the tour and the star party).
- **Checks:**
  - 18 unit tests (`tests/sse-problems.test.ts`), including the cannon's physics (slow lands, just right orbits, super fast flies away, and the circle stays round) and the tricky facts (the Sun is not the biggest star, seasons come from the tilt, astronauts are falling).
  - 77/77 browser checks (`scripts/e2e-solar-system-explorer.mjs`), which now play all four stations, the dial, three cannon shots, the whole Grand Tour and the star party.

Score (both halves): **9.3/10.**

| Category | Points | Evidence |
|---|---|---|
| Gameplay and feel | 2.3 / 2.5 | Walking, driving, steering a dive, the season dial, a cannon with real gravity, plotting the route and taking photos on the flyby. The orrery and globe still move on their own, and the station questions are answered with buttons. |
| Learning accuracy and clarity | 1.85 / 2.0 | 105 questions (81 at the stations, 24 at the planet stops) across three levels, four debriefs, every wrong answer names a real mistake, and hint 2 always adds a picture. Facts checked against NASA Science and NASA Space Place. |
| Visual and audio polish | 1.35 / 1.5 | New 16-bit pictures for every question type, the flyby, the Pale Blue Dot and the star party, and five songs. The children on the "down" globe are small. |
| Usability and accessibility | 1.4 / 1.5 | Keyboard, mouse and touch everywhere (the dial turns with the arrow keys, F fires the cannon), read-aloud, reduced motion, and the phone layout fits (the browser checks include the route planner on a phone). |
| Technical reliability | 1.4 / 1.5 | No console errors, no requests to other websites, and saves are checked when loaded. |
| Completeness | 1.0 / 1.0 | Both halves, the site listing, the redirect and a new card picture. |

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
- **2026-10-02:** Owner check-in: look and learning approved; asked for ninja outfits. Added gi colors, ninja masks (face mask or hood) and headbands. Owner approved Phase 0 (look, learning and ninja gear). Next: Math batch M1 on a fresh branch off `main` once this PR is merged.
- **2026-10-02:** Math batch M1 built: Counting Carnival (with Number Monster Feeding merged in), 8.9/10 self-score, 7 unit tests and 28 browser checks. Waiting for the owner's check-in before M2.
- **2026-10-02:** Owner tested Counting Carnival, approved it and merged PR #208. M1 COMPLETED ✅. Next: M2 (Math Dash: Library Sorter; Math Memory Match moves to M4 with Math Race Rally, as the merge map says).
- **2026-10-02:** The owner redesigned M2: Math Dash becomes "Library Rush", a Vampire Survivors-style game: pixel art with more action, books sorted by number range, chatty students, endless runs. The design is in the M2 section.
- **2026-10-02:** M2 built: Math Dash: Library Rush, 8.85/10 self-score, 12 unit tests and 34 browser checks. Waiting for the owner's check-in.
- **2026-10-03:** Owner tested Library Rush ("it plays really well"), approved it and merged PR #209. M2 COMPLETED ✅. Next: M3, Money and time (Money Market Madness with Cafeteria Cashier merged in, then Time Attack Clock).
- **2026-10-03:** Owner decisions for M3: Money Market gets an upgrade shop (food, drinks, condiments) paid for with the money earned; Time Attack Clock is built as proposed. M3 started.
- **2026-10-03:** M3 built: Money Market Madness (Cafeteria Cashier merged in; the old link redirects), 8.9/10, 11 unit tests and 20 browser checks; Time Attack Clock, 9.0/10, 11 unit tests and 37 browser checks. Waiting for the owner's check-in.
- **2026-10-03:** Owner tested both games ("they play well"), approved them and merged PR #210. M3 COMPLETED ✅. Next: M4, addition, subtraction and mixed operations (Math Race Rally with Math Memory Match merged in, Math Adventure Island, Treasure Hunt Calculator, Math Jeopardy Junior; merges follow the merge map).
- **2026-10-03:** M4 started. Owner decisions: Math Race Rally becomes a behind-the-car arcade racer (always moving, steer into the answer gate, boost or slow down, race a CPU car), with Math Memory Match as the pit stop after each race that earns cosmetic car upgrades. Math Race Rally built: 9.0/10, 12 unit tests and 27 browser checks. Waiting for the owner's check-in.
- **2026-10-03:** Owner tested Math Race Rally ("plays really well") and asked that a couple of wrong answers let Dash pass you again. Done with a momentum rule (see the M4 section); 15 unit tests and 29 browser checks.
- **2026-10-03:** Owner tested Math Race Rally again, approved it and merged PR #211. Math Adventure Island built (Treasure Hunt Calculator and Math Jeopardy Junior merged in): 9.0/10, 12 unit tests and 49 browser checks. Waiting for the owner's check-in.
- **2026-10-05:** Owner tested Math Adventure Island, approved it and merged PR #212 (with the new `remaster-game` skill). M4 COMPLETED ✅. M5 Geometry plan written with the skill (Shape Sorting Arcade merged into Geometry Builder Challenge). Owner approved: walking world, building yard, two halves, up to grade 4. Half 1 started.
- **2026-10-05:** M5 half 1 built (yard, Shape Sorting Arcade with a conveyor belt, Block Shop, Rush mode with Chip): 9 unit tests, 28 browser checks. Waiting for the owner's quick look before half 2.
- **2026-10-06:** Owner merged half 1 (PR #213) and asked to carry on; full team QA feedback on all the remastered games comes later. M5 half 2 built (Blueprint Workshop, Garden Yard up to 4.MD.3 with three-step L-shapes, The Big Build and the clubhouse opening), and the site now lists Shape Town Builders (Shape Sorting Arcade redirects). 9.1/10, 16 unit tests and 46 browser checks. Waiting for the owner's check-in.
- **2026-10-06:** Owner merged half 2 (PR #214). M5 COMPLETED ✅: 8 of the 11 Math games are done, and M6 (Fractions) and M7 (Multiplication and equations) remain. The team is doing QA on the finished games. The owner decided to add **game worlds** (a sci-fi world, an ancient world and more, chosen by children), with the owner and team placing each game in a world. Order: design the worlds, then build M6, M7 and the other subjects inside them, then the Echo narrative and an interactive world map on the site. Details and the handoff: `docs/GAME_WORLDS_PROPOSAL.md`.
- **2026-10-08:** Game worlds W1 approved. M6 plan written with the `remaster-game` skill; owner chose the name Forum Fraction Feast, a walking Roman forum with four jobs, built in two halves. Half 1 (the Bakery and Milestone Road) built.
- **2026-10-09:** Half 2 built (the Market Stall, the Mosaic, the Festival Feast and Frenzy mode); the site lists Forum Fraction Feast and `/games/fraction-pizza-party` redirects. 9.1/10, 27 unit tests and 51 browser checks. Owner approved and merged PR #220. **M6 COMPLETED ✅: 9 of the 11 Math games are done.** Next: M7 (Multiplication Space Quest with Multiplication Bingo Bonanza and Multiplication Tables Adventure merged in, and Equation Balance Scale) in the Star Station world, plan first. Handoff: `docs/M7_STAR_STATION_HANDOFF.md`.
- **2026-10-09:** M7 plan written (the M7 section above), after studying and playing the four originals. Found two problems in the live games: about 55% of Bingo Bonanza's calls have no answer on the card, and the Balance Scale freezes on subtraction with a negative answer. Waiting for the owner's choices and approval.
- **2026-10-09:** Owner's first answers: Space Quest first, kept names, the deck and the planet, and **the main game becomes a space shooter** (with the station and planet around it). Game 1 of the M7 plan was rewritten as a shooter: flights through the Static cloud, answer rocks, rescued ships joining the fleet, a Bingo Boss finale and a landing on the alien planet. Waiting for approval of the revised plan.
- **2026-10-09:** Owner chose a vertical shooter and the friendly Static rocks, and **approved the revised plan**. Building Space Quest half 1.
- **2026-10-09:** Space Quest half 1 built: the station deck, the Formations and Engines flights, upgrades, the Star Map, saving and the grown-ups page. 10 unit tests, 41/41 browser checks, 44 fps. Provisional score 8.7. Waiting for the owner's look before half 2.
- **2026-10-10:** The owner played half 1 on the preview ("it plays well") and asked for half 2. Space Quest half 2 built: Cargo with Quartermaster Dot, Constellations with Navigator Sol, the Bingo Boss at the night shift (every call's answer on the card), the landing on the alien planet, and Meteor Run. The site now lists the new game, and Bingo Bonanza and Tables Adventure redirect to it. 9.1/10, 15 unit tests and 66/66 browser checks. Waiting for the owner's look; Equation Balance Scale comes next in its own PR.
- **2026-10-10:** Counting Carnival fix (found when re-running every game's browser test): tapping Munch from some angles left the player sliding round his personal space forever, so his talk never opened. Now the player arrives once close enough to talk (within 1.2 tiles). Its browser test is back to 28/28.
- **2026-10-10:** The owner asked for simpler question wording in Space Quest (the math stays the same). Every banner question was rewritten: short sentences with the facts first and one plain question; words that match the picture ("the blue line", "left part" and "right part" instead of "split the 6 by 7 formation after 5 columns"); no game jargon ("Charge the engine", "Fill the cargo log", "Shortcut for…"); and the same pattern for similar questions (for example "3 rows. 4 ships in each row. How many ships in all?"). The mistake sentences and hints lost "formation", "columns" and "on the banner" too. Math facts in the banner no longer break across two lines on a phone. 15 unit tests and 66/66 browser checks still pass.
- **2026-10-11:** The owner merged PR #224. **Multiplication Space Quest COMPLETED ✅: 10 of the 11 Math games are done.** Next: Equation Balance Scale on the alien planet (Game 2 above), in its own PR. Started by re-checking its open choices with the owner.
- **2026-10-11:** Owner chose the walking outpost as drafted, kept the names, letters only at the Dome's top level, and two halves. Building Balance Scale half 1 (the outpost, the Weigh Station and the Rover).
- **2026-10-11:** Balance Scale half 1 built: the outpost (the alien planet got walking pieces), the Weigh Station and the Rover, with a scale that tips and crystals that can be dragged into the gap. 9 unit tests, 41/41 browser checks. Provisional score 8.6. Waiting for the owner's look before half 2.
- **2026-10-11:** The owner merged half 1 (PR #225) and asked for half 2. Balance Scale half 2 built: Botanist Pax's Dome (two-step stories: pick the equation on empty pans, then solve it on the scale; the letter p and boxes at level 3), The Big Weigh-in at evening with Gloop on the scale and the beam to the station, and the site now plays the new game. 8.9/10, 11 unit tests and 62/62 browser checks. Waiting for the owner's look.
- **2026-10-11:** The owner merged PR #226. **Equation Balance Scale COMPLETED ✅ and M7 COMPLETED ✅. Phase 1 (Math) is COMPLETED ✅: all 11 Math games are rebuilt** (Number Line Ninja, Counting Carnival, Library Rush, Money Market Madness, Time Attack Clock, Math Race Rally, Math Adventure Island, Shape Town Builders, Forum Fraction Feast, Multiplication Space Quest and Equation Balance Scale). The team is doing QA on the finished games. Next: Phase 2 (Science), plan first, with the owner and team choosing which world each Science game goes in (game worlds W2), when the owner is ready.
- **2026-10-12:** The owner proposed the first Science game: a microscopic ship exploring inside the human body (organ missions, germs to clear, healthy habits like handwashing for the flu, growth like *Spore*). Reviewed against the rubric (about 7.95 as first described, about 9.2 with the suggested changes). The owner chose Star Station with a new inside-the-body setting, free exploring in all directions, and replacing Body System Heroes. The plan is in the S3 section above, with draft names; waiting for the owner's approval and name picks.
- **2026-10-12:** The owner approved the look ("the germs aren't scary, and the ship looks good") and asked for half 1. Body System Heroes half 1 built: the med bay, free flight, scanning, the skin, mouth and lungs missions (54 questions), the nest and the heal, three healthy-habit games (clean and cover, brushing, 20-second handwashing), three ship upgrades, the body map, germ files, saving and the grown-ups page. 7 unit tests, 52/52 browser checks, 34 fps (software). Provisional score 8.7. Waiting for the owner's look before half 2.
- **2026-10-13:** The owner merged PR #229. **Body System Heroes COMPLETED ✅** (both halves; self-score 9.2/10; 73/73 browser checks). It replaces the old game on the site at the same address. That is the first of the 14 Science games. Next: the owner picks the next Science game; plan first, with the owner and team choosing its world.
- **2026-10-13:** The owner picked the next Science game: **Solar System Explorer** (S1 Space, in Star Station; Planet Explorer Quest merges in), and decided that **Wild Lands**, the nature world, comes right after it. Both old games were studied and their facts checked against NASA: six facts are fixed (Mercury's speed, the Uranus wrong answer that is also true, the Great Red Spot's age, Olympus Mons's height, out-of-date moon counts, and day length meaning one spin). The plan is in the S1 section above (a walking observatory with four hands-on space models, hops to every planet and a Grand Tour finale; grades 2–5). Waiting for the owner's choices and approval.
- **2026-10-15:** The owner approved the Solar System Explorer plan with Claude's picks: the walking observatory, Navigator Sol, Lumi Reyes, Kofi Mensah, Tess Rocket, Vee, the same title, and two halves. The look preview is built (the cast, the observatory, Mars, Mercury and the Jupiter dive). Waiting for the owner's look before half 1.
- **2026-10-15:** The owner looked at the preview and said "Build half 1". Half 1 built: the walkable observatory with Vee, the Orrery and the Sunrise Lab (45 questions and two debriefs), the star map, all 8 planet stops (a rover on the rocky planets, a cloud dive on the giants, 24 stop questions, fact cards, postcards and the album), saving and the grown-ups page. 10 unit tests, 51/51 browser checks, provisional score 8.75. Waiting for the owner's look before half 2.
- **2026-10-16:** The owner played half 1 on the preview ("It works now and plays well") and said "Build half 2". Half 2 built: the Star Dome with Lumi's season dial and the Launch Bay with Tess's cannon (36 more questions, two debriefs, the Sun's and the Moon's bonus postcards), the Grand Tour (plot the route, photograph every planet, a question from each station, the Pale Blue Dot) and the star party (Pluto's bonus postcard; the game tells the site it is complete). The game now replaces the old one at `/games/solar-system-explorer`, `/games/planet-explorer-quest` redirects to it, and it has a new card picture. 18 unit tests, 77/77 browser checks, score 9.3. Waiting for the owner's look.
- **2026-10-17:** The owner merged PR #231. **Solar System Explorer COMPLETED ✅** (both halves; 9.3/10; 77/77 browser checks). It replaces the old game at `/games/solar-system-explorer`, and `/games/planet-explorer-quest` redirects to it. That is 2 of the 14 Science games. Next (the owner's choice): plan the **Wild Lands** nature world, where most of S2–S4 goes.
- **2026-10-17:** The Wild Lands plan is written (section 7c of `docs/GAME_WORLDS_PROPOSAL.md`): the world's style (24 px, 16-bit, leaf greens and sea blues, living light as its glow), eight settings, a shared set of animals, eight suggested games from S2–S4, and choices for the owner. Waiting for the owner's choices before the look preview.
