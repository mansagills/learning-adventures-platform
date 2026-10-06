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

### Phase 1: Math (11 games, from 20): IN PROGRESS

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
| **M6 Fractions (2–4)** | Pizza Fraction Frenzy (2–4) | Pizza fractions | A 3D pizzeria: equal shares, unit fractions, fractions on a number line (2.G.3, 3.NF.1, 3.NF.2) |
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
