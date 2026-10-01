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
- A real **Three.js** scene in the Learning Adventures pixel-art style: the same crisp, integer-scaled pixels, warm palette, readable fonts (Pixelify Sans for titles, Atkinson Hyperlegible for reading) and wood-and-parchment panels as Seeds of Genius. Each game gets its own setting (a carnival, a space station, a reef, a pyramid).
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

- **`games-src/adventure-kit/`**: a shared engine built from the proven parts of Seeds of Genius: the pixel renderer and camera, the art helpers (sprites, palettes, icons), panels and dialogue, the hint ladder, the mastery model, audio, settings, saving, the For grown-ups page, and the browser-test helpers. Seeds of Genius itself is **not changed**; the kit starts as a copy, so the finished game can't break.
- **`games-src/adventures/`**: one Vite + TypeScript project holding every rebuilt game, one folder per game (`src/games/<slug>/`). One build writes each game to `public/games/<slug>/index.html`. Shared code (three.js and the kit) is split into shared files, so a player who has opened one game loads the next one faster.
- **Shared question generators** per skill family (for example comparing numbers, money, fractions, multiplication facts). Each one has unit tests showing every question is correct, at the right level, and offers only plausible wrong answers.

### 3.2 Site changes when a game ships

- Its entry in `lib/content/games.ts` points `htmlPath` to `/games/<slug>/index.html`. The slug and URL stay the same, so links, the sitemap and search results keep working.
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

### Phase 0: Adventure Kit and a pilot game: NOT STARTED

- Build `games-src/adventure-kit/` and `games-src/adventures/` (section 3.1), with the build writing to `public/games/<slug>/`.
- Rebuild **one pilot game, Number Line Ninja** (grades 1–3). It is small but uses most of the kit: a 3D scene, a character, a number line the player moves along, levels, hints, misconception feedback and a debrief.
- Publish it on its existing slug and add the content tests (no emoji, no network).
- **Owner check:** the look, the feel and the level of challenge. Every later game copies what is approved here, so this is the most important check-in.

### Phase 1: Math (20): NOT STARTED

Batches group games that share skills, so each batch also builds a question generator that the next batch reuses. Each game keeps its slug. The "Upgrade" column is a starting idea, to be refined in the game's learning spec.

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

### Phase 2: Science (21): NOT STARTED

Detailed learning specs are written at the start of this phase, aligned to NGSS. Proposed batches:

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

Final pass over all 43: new card pictures, homepage featured games, the player guide, the speed and size report, and the cleanup of the old HTML files and the old Google Fonts links.

## 5. Decisions for the owner

These are recommended defaults. The plan follows them unless the owner says otherwise.

1. **Art style:** the same pixel-art Three.js look as Seeds of Genius for every game, so the site feels like one family. *(The alternative is smooth low-poly 3D, which is more work per game.)*
2. **Overlapping games:** keep all 43, but make the overlapping ones clearly different (for example, Fraction Pizza Party becomes the "compare and equivalent fractions" activity). *(The alternative is merging them into fewer, deeper games, which would change some links.)*
3. **Subject order:** Math → Science → English and History.
4. **Batch size and approvals:** one PR per batch (2 to 5 games), with an owner check-in after each.
5. **Characters:** use the Learning Adventures characters (Jaylen and S.P.A.R.K.) as hosts where it fits, or give each game its own host. *(Needs the owner's call; it affects the art.)*

## 6. Risks and how we handle them

| Risk | How we handle it |
|---|---|
| 43 games is a lot of work; quality could slip toward the end | The shared kit and question generators carry most of the load; every game gets the same scoring gate and owner check-in |
| The test machine has no graphics card, so measured speed is lower than real laptops | Measure on the test machine (software rendering) as a worst case, and the owner spot-checks on a real device per batch |
| A rebuilt game is worse than the old one for some players (for example, slower on old tablets) | The old file stays until the new game is approved; a low-detail mode is part of the kit |
| Changing a live game breaks links | Slugs and URLs stay the same; the content test checks every listed file exists |
| Factual errors in Science and History | A sources list per game, and a fact review in every check-in |

## 7. Progress log

- **2026-10-01:** Plan written. Games audited (43 to rebuild, emoji counts, no Three.js, Google Fonts loaded at play time). "Before" screenshots captured. Waiting for the owner's answers to section 5, then Phase 0.
