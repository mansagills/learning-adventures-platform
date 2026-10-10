# Learning Adventures games (Adventure Kit)

The rebuilt Learning Adventures games: 2D retro pixel art rendered with
Three.js, in the style of Seeds of Genius. Every game is built on the shared
**Adventure Kit** (`src/kit/`), so each new game starts with the renderer,
art tools, talk box, hint ladder, learner model, sound, settings, saving and
the "For grown-ups" page already done.

- **Plan, quality bar and status:** [`docs/GAMES_3D_UPGRADE_PLAN.md`](../../docs/GAMES_3D_UPGRADE_PLAN.md)
- **Where it is served:** the build writes every game to
  `public/games/play/<slug>/index.html`, with shared code in
  `public/games/play/assets/`. It has to live under `/games/`, because the
  site only lets `/games/` and `/lessons/` pages be embedded in its player.
  Each game is listed in `lib/content/games.ts` with
  `htmlPath: '/games/play/<slug>/index.html'`.

## Run and build

```bash
cd games-src/adventures
npm install
npm run dev          # http://localhost:5173/number-line-ninja/
npm test             # unit tests (vitest)
npm run build        # typecheck + build into ../../public/games/play
npx vite preview --port 4174 &
node scripts/e2e-number-line-ninja.mjs   # plays the game in a real browser (29 checks)
node scripts/e2e-counting-carnival.mjs   # a whole Counting Carnival game, title to finale (28 checks)
node scripts/cc-tour.mjs <url> <outDir> [w] [h]    # screenshots of every booth, a miss and hints
node scripts/cc-tiers.mjs <url> <outDir> [w] [h]   # every booth at levels 2 and 3
node scripts/e2e-math-dash.mjs           # a Library Rush shift from the title to the summary (34 checks)
node scripts/md-tour.mjs <url> <outDir> [w] [h]     # Library Rush screenshots: start, shelving, level-up, rush, summary
node scripts/md-stages.mjs <url> <outDir> [w] [h]   # each stage's signs, a wrong shelf, the hint, a late shift
node scripts/e2e-money-market.mjs        # a Money Market day: serving, change, the shop, day 2, saving (20 checks)
node scripts/mm-tour.mjs <url> <outDir> [w] [h]     # Money Market screenshots: every level, hints, the shop, the upgraded stand
node scripts/e2e-time-attack-clock.mjs   # a whole Time Attack Clock game, title to finale and a Time Attack (37 checks)
node scripts/tac-tour.mjs <url> <outDir> [w] [h]    # every job at levels 1-3 with a miss and hints, then a Time Attack
node scripts/e2e-math-race-rally.mjs     # Math Race Rally: a race with right and wrong gates, the pit stop, the garage, a second race where two misses let Dash pass (29 checks)
node scripts/rr-tour.mjs <url> <outDir> [w] [h]     # Math Race Rally screenshots: race, results, pit stop, garage, tracks
node scripts/e2e-math-adventure-island.mjs   # a whole Math Adventure Island game: four torches, a treasure hunt with a wrong dig, the Quiz Show and the finale (49 checks)
node scripts/mai-tour.mjs <url> <outDir> [w] [h]    # Math Adventure Island screenshots: every zone at levels 1-3 with a miss and hints, a clue and dig, the Quiz Show
node scripts/e2e-geometry-builder-challenge.mjs   # Shape Town Builders: all four jobs (incl. a 3-step L-shaped garden), Chip and Rush, The Big Build and the opening, saving, phone (46 checks)
node scripts/stb-tour.mjs <url> <outDir> [w] [h]    # Shape Town Builders screenshots: all four jobs at levels 1-3 with a miss and hints, Rush, The Big Build and the opening
node scripts/e2e-pizza-fraction-frenzy.mjs   # Forum Fraction Feast: all four jobs (walking, the job list), misses, hints, debriefs, the Festival Feast and finale, a Frenzy round, Anser, saving, phone (51 checks)
node scripts/fff-tour.mjs <url> <outDir> [w] [h]    # Forum Fraction Feast screenshots: the forum, all four jobs at levels 1-3 with a miss and hints, the feast and Frenzy
node scripts/e2e-multiplication-space-quest.mjs   # Multiplication Space Quest: the deck, a whole Formations flight (keys, Space, clicks, a miss, hints), the sector cleared, an Engines two-step question, the tow beam, upgrades, the Star Map, saving, Cargo, Constellations, the Bingo Boss, the landing, Meteor Run, phone (66 checks)
node scripts/msq-tour.mjs <url> <outDir> [w] [h]    # Multiplication Space Quest screenshots: the deck, all four sectors at levels 1-3 with a miss and hints (SECTORS=cargo,constellations for some), the Static core, upgrades, the Star Map, the Bingo Boss, the landing and Meteor Run
node scripts/gear-shots.mjs <url> <outDir>   # pictures of ninja gear combinations from every side
node scripts/tour.mjs <url> <outDir>     # screenshots of every belt, hints and a phone
```

**Game worlds:** the world theme layer is in `src/kit/worlds/` (see its
README): the Star Station and Ancient Kingdoms styles and their settings.
Look development pages (not shipped): with `npx vite --port 5180` running,
open `/lookdev/` for the 16-bit character test, or
`/lookdev/?view=scene&setting=station-deck|alien-planet|river-market|roman-forum&time=day|evening[&talk=1]`
for each setting.
`node scripts/lookdev-shots.mjs` saves screenshots of all of them to
`test-output/lookdev/`. The `lookdev/` folder is left out of the build. See
`docs/GAME_WORLDS_PROPOSAL.md` section 7a.

From the repo root, the same things are `npm run games`, `npm run games:build`
and `npm run games:test`.

**Always run `npm run build` and commit `public/games/play/` after changing a
game.** Vercel only builds the Next.js site; it serves the committed game build
as static files.

## How it is organized

```
<slug>/index.html          one page per game (the build entry)
src/kit/                   the Adventure Kit, shared by every game
  render/pixelRenderer.ts  45-degree orthographic camera, whole-number pixel scaling
  art/                     pixel buffers, palette, characters, portraits, icons, a 3x5 number font
  world/                   pixel textures, billboards, glows, walking characters, walk.ts (collision + paths)
  learning/mastery.ts      the learner model: tiers, streaks, mastery, misconceptions
  systems/                 sound (made in code), settings (shared by all games), saving, keyboard input, read-aloud
  ui/                      talk box, title, character creator, settings, grown-ups page, toolbar, toasts, touch pad
src/games/<slug>/          one folder per game
  worlds/                  the world theme layer: world styles, settings, the 16-bit painter and characters
src/lookdev/               look development pages for the worlds (character test, every setting; not shipped)
tests/                     unit tests
scripts/                   browser tests and screenshot tours
```

Most of the kit started as a copy of Seeds of Genius code
(`games-src/seeds-of-genius/src/`), which is not changed.

## Making a new game

1. Make `<slug>/index.html` (copy `number-line-ninja/index.html`) and
   `src/games/<slug>/main.ts`.
2. Keep the learning logic in pure functions (like
   `src/games/number-line-ninja/problems.ts`) and unit-test it: every
   generated question is correct, at the right level, and its wrong answers
   come from real misconceptions.
3. Put the words in a content file (lines, hints, feedback, grown-ups page)
   so they can be reviewed on their own.
4. Art is painted in code with `PixelBuffer`. No emoji, no stock icons, nothing
   loaded from another website (the site's content test checks this).
5. Build, list it in `lib/content/games.ts`, run
   `npm run thumbnails -- --only <slug>`, and add a browser test.

## Number Line Ninja (pilot, grades 1–3)

Hop a ninja across a river of stepping stones that form a number line. Five
belts: find numbers (White), add by counting on (Yellow), subtract by counting
back (Orange), big hops of ten to 100 (Green), and the missing gap between two
numbers (Black). Every hop is drawn as an arc with its size, so the screen
shows the number-line model used in class. Hints go from a nudge, to Sensei
drawing the first hops, to the whole path; wrong landings are explained by
the mistake behind them (counting the starting stone, hopping the wrong way,
treating tens as ones). Players dress their ninja in a gi (8 colors), a face mask or hood, and a headband
(`gear.ts`); the earned belt is worn over the gi. Code: `src/games/number-line-ninja/`.

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Hop 1 | Left / Right arrows (or A / D) | Hop buttons, or click a stone |
| Big hop (5 or 10) | Up / Down arrows (or W / S) | Big hop buttons |
| Land | Space or Enter | Land here |
| Back to the start stone | R | – |
| Hint | H | Hint |
| Belts | B | Belts |
| Grown-ups | G | Settings → For grown-ups |
| Mute | M | Sound |
| Settings | Esc | Settings |

## Counting Carnival (Math batch M1, grades K–2)

Walk around a carnival with Ringmaster Rosa and Munch the snack monster (from
the old Number Monster Feeding game, which is merged in). Four booths, three
levels each: **Duck Pond** (one-to-one counting to 20, counting on from a row
of ten), **Ring Toss** (ten-frames: how many, a quick look, how many more make
10), **Munch's Snack Stand** (more and fewer with a big-cookie trap, 1 more/less,
10 more/less) and the **Prize Counter** (strips of ten and single tickets, then
building a price to 120). Five first-try stars light a booth; all four bring
night and a finale. Tickets buy balloons to carry. Read-aloud is on by default
and uses only voices on the device. Code: `src/games/counting-carnival/`
(`problems.ts` is the question generator, `content.ts` the words, `booths.ts`
the booth screens, `world.ts` the fairground).

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Walk | Arrow keys or WASD | Tap the ground, or the touch pad |
| Play a booth / talk | Space or Enter | Tap the booth or person |
| Pick an answer | 1, 2, 3 | Tap it |
| Hint | H | Hint |
| Next challenge | Space | Next |
| Leave a booth | Esc | Leave |
| Booth list | B | Booths |
| Grown-ups | G | Settings → For grown-ups |
| Mute | M | Sound |

## Math Dash: Library Rush (Math batch M2, grades 1–3)

A survivors-style action game (an owner redesign of Math Dash: Library Sorter).
You are a library helper. Walk over books to pick them up. The number of the
book in your hands shows above your head. Walk into the shelf whose sign fits
that number:

- Shelves go by tens at first (Picture Books, 0–59).
- Then by hundreds (Chapter Books, 100–599).
- Then by ranges with < and > (Reference, up to 999).

A wrong shelf bounces the book back with a reason. After two misses on the same
book, the right sign glows and an arrow points to it.

Chatty classmates drift toward you, and a bump costs Focus. Every few books you
pick one of three library powers, each with five levels:

- Shush Bell (you start with it)
- Paper Notes
- Story Rug
- Bookmark Magnet
- Book Cart
- Quiet Sneakers
- Reading Glasses (colors the digits by place value)
- Cocoa Break
- Library Card

Calmed students sit down and read. Runs are endless: the shift ends when Focus
runs out. The best score and stage are saved, and the next run starts at the
stage you reached. Code: `src/games/math-dash/`. The slug stays `math-dash`.

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Move | Arrow keys or WASD | Drag anywhere (a joystick appears) |
| Swap the book in your hands | Q or Tab | Swap |
| Pick a power | 1, 2, 3 | Tap a card |
| Pause / settings | Esc | Pause |
| Grown-ups | G | Pause → For grown-ups |
| Mute | M | Sound |

## Money Market Madness (Math batch M3, grades 1–4)

Run a snack stand at the market for Chef Amara (Cafeteria Cashier is merged
in, and `/games/cafeteria-cashier` redirects here). Customers line up, order
from the menu and pay. The till panel on the right (a bottom sheet on phones)
asks for the math at the player's level:

1. Count the coins (pennies, nickels, dimes, up to 50¢).
2. Count coins with quarters, then: is it enough for the price?
3. They pay with $1: tap coins into the change tray (count up from the price).
4. Two items: add the total, then make change from $5.

Money and tips (for first-try answers) go in the till. After each day, the
upgrade shop sells new food, drinks, toppings and stand decorations, and each
one shows on the stand. Customers only lose patience while waiting in line,
never while being served. Code: `src/games/money-market-madness/`
(`problems.ts` is the money math, `upgrades.ts` the shop).

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Serve the next customer | Space or Enter | Serve |
| Pick an answer | 1, 2, 3 (Y / N for "enough?") | Tap |
| Hint | H | Hint |
| Pause / settings | Esc | Pause |
| Mute | M | Sound |

## Time Attack Clock (Math batch M3, grades 1–3)

The town clock tower has stopped. Walk around the square (like Counting
Carnival) and help three people; 5 stars at a job fixes one part of the tower:

- **School Bell** (Ms. Rivera): read a clock. Hours and half hours, then five
  minutes ("quarter past", "quarter to"), then to the minute.
- **Bus Stop** (Driver Dee): set a clock by dragging the hands. The hour hand
  moves with the minute hand, like a real clock. Arrow buttons and arrow keys
  work too.
- **Bakery** (Baker Bo): elapsed time by counting on. Whole hours, then inside
  one hour, then across the hour.

Mr. Tock runs a 60-second Time Attack (read as many clocks as you can) with a
best score and medals. Fixing all three parts brings the evening finale.
Code: `src/games/time-attack-clock/` (`problems.ts` is the clock math,
`clockface.ts` the clock you can drag).

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Walk | Arrow keys or WASD | Tap where to go, or the pad |
| Talk | Space | Tap a person |
| Move the clock hands | Left/right (long hand), up/down (short hand) | Drag a hand, or the arrow buttons |
| Check the clock | Enter | Check my clock |
| Pick an answer | 1, 2, 3 | Tap |
| Hint | H | Hint |
| Town jobs list | J | Jobs |
| Grown-ups | G | Settings → For grown-ups |


## Math Race Rally (Math batch M4, grades 1–5)

An arcade racer seen from behind the car (Math Memory Match is merged in as
the pit stop, and `/games/math-memory-match` redirects here). The car never
stops. A question appears with three answer gates ahead, one per lane. Steer
through the right one to boost up a speed level; the wrong one slows the car
a level (never to a stop) and explains the likely mistake. After two misses
in a row the next question shows a strategy hint. Dash, the CPU rival, follows
your momentum (+1 for a right answer, -2 for a wrong one): a run of right answers
leaves him behind, and a couple of misses in a row let him pass you again.

Levels: facts to 10, facts to 20 (make a ten, doubles), tens and ones,
two-digit with regrouping, three-digit. After each race: results with pit
notes (the strategy for each missed question), then the pit stop, where
matching facts to answers earns bolts. Bolts buy car types, paint, styles,
wheels and spoilers in the garage; they never change speed. Wins open new
tracks (Sunny Hills, Desert Canyon, Seaside, Neon City).

The road is real Three.js geometry drawn into a small canvas (`race.ts`,
built from `track.ts`), not the kit's 45-degree renderer. Code:
`src/games/math-race-rally/`.

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Steer | Left/right arrows or A/D | Hold the arrow buttons |
| Drive to a lane | 1, 2, 3 | Tap an answer at the top |
| Pause / settings | Esc | Pause |
| Mute | M | Sound |

## Math Adventure Island (Math batch M4, grades 2–5)

An island to walk around (Treasure Hunt Calculator and Math Jeopardy Junior
are merged in, and both old links redirect here). Captain Zuri explains that
the four torches on the Quiz Show stage blew out. Each zone lights one torch:

| Zone (helper) | Operation | Top level |
|---|---|---|
| Shell Hut (Mo) | adding, including missing parts ("found some more, now has 50") | three-digit, start unknown |
| Fishing Boat (Ana) | subtracting, take away and "how many more" | how many more fit in the boat |
| Coconut Grove (Tavi) | equal groups and arrays | two-digit × one-digit, "times as many" |
| Mango Stall (Bao) | sharing and grouping | remainders: boats round up, full bags drop the rest |

Every word problem has three steps: what is the question asking, which
operation (+ − × ÷), then solve. A star needs all three right the first time;
five stars and a last talk question light the torch. Hint 2 shows a picture
(bar model, equal groups, an array, or sharing boxes).

Pip the parrot sets treasure clues: estimate (round first), work it out, then
decide whether Pip's answer is reasonable. The clue names a square on the beach
grid (B3, or (2, 3) at the top level); walk onto it and press Dig. Four pieces
open the pirate's chest. With all four torches lit, the Quiz Show opens: a
4 × 3 board against Pip, one try per question, a wrong answer gives Pip the
points, and 200/300 tiles in two categories have a "which way also works?"
strategy bonus. Winning plays the finale. Code: `src/games/math-adventure-island/`.

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Walk | Arrow keys or WASD | Tap the ground, or the pad |
| Talk / dig | Space | Tap a person, or the Dig button |
| Answer | 1–4 | Tap an answer |
| Hint | H | Hint |
| Island jobs list | J | Jobs |
| Grown-ups | G | Settings → For grown-ups |

## Shape Town Builders (Math batch M5, grades K–4)

The geometry game (slug `geometry-builder-challenge`; Shape Sorting Arcade is
merged in and its old link redirects). A building yard puts up a clubhouse,
and each helper's job adds a part:

- **Kofi's Shape Sorting Arcade:** flat shapes ride a conveyor belt into
  bins (naming in any size and turn, sides and corners, real vs. not-quite
  shapes, rule bins).
- **Lupe's Block Shop:** solid shapes (flat or solid, names, roll or stack,
  everyday things, faces you can't see).
- **Mr. Haruto's Blueprint Workshop:** count the shapes in a blueprint (the
  original five plus three new, with the car's back wheels hiding), how many
  pieces fill a shape, and rows and columns of squares.
- **Priya's Garden Yard:** area and perimeter on a grid, then with labelled
  sides, then L-shaped gardens in three steps, missing sides and "same area,
  different fence" (up to 4.MD.3).

Other features:

- **Rush mode** against Chip the beaver (60 seconds).
- **The Big Build** finale: one question from each job, then the clubhouse
  opens at sunset.

Code: `src/games/geometry-builder-challenge/`.

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Walk | Arrow keys or WASD | Tap the ground, or the pad |
| Talk | Space | Tap a person |
| Pick an answer (bin) | 1–3 | Tap it |
| Hint | H | Hint |
| Jobs list | J | Jobs |
| Grown-ups | G | Settings → For grown-ups |

## Forum Fraction Feast (Math batch M6, grades 2–4)

The fractions game (slug `pizza-fraction-frenzy`; Fraction Pizza Party is
merged in and its old link redirects). It is the **first game in a new
world**: Ancient Kingdoms, in the kit's `roman-forum` setting (24 pixels per
tile, 16-bit characters; see `src/kit/worlds/`). Baker Livia's festival needs
four jobs done; each one lights a bronze brazier round the mosaic. Anser the
goose steals bread.

- **The Bakery** (Baker Livia, grades 2–3): fair shares (which loaf is cut
  into fair fourths, what equal slices are called), the fraction eaten or left
  (all ten Fraction Pizza Party problems come first at level 2, with loaves
  instead of pizzas), sharing, 4/4 as one whole, and a/b as a pieces of 1/b.
- **Milestone Road** (Marcus the surveyor, grade 3): put a flag at a fraction
  between the golden milestone (0) and milestone I (1), or name where a flag
  is; level 3 goes past 1 on a road to milestone II.
- **The Market Stall** (Cornelia, grades 3–4): which share of the same size
  loaf is bigger or smaller, from the same bottom number to comparing with 1/2.
- **The Mosaic** (Tullia, grades 3–4): equal fractions with tile strips, the
  missing number, whole numbers as fractions, and the one that is not equal.
- **The Festival Feast** finale: one order from each job, then dusk, blazing
  braziers and Anser with the last slice.
- **Frenzy mode** (the old Pizza Fraction Frenzy race): 60 seconds of serving
  the loaf with the right golden pieces, with a best score.

Code: `src/games/pizza-fraction-frenzy/`. It uses the world kit's walking
16-bit character (`Walker16`), the camera's tap-to-walk (`Stage.screenToTile`)
and the customize screen's 16-bit preview (`paint` and `only` options).

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Walk | Arrow keys or WASD | Tap the ground, or the pad |
| Talk | Space | Tap a person (or Anser) |
| Pick an answer | 1–4 | Tap it |
| Put the flag on a post | Tab to the post, Enter | Tap the post |
| Hint | H | Hint |
| Jobs list | J | Jobs |
| Grown-ups | G | Settings → For grown-ups |


## Multiplication Space Quest (Math batch M7, grades 3–5)

The multiplication game (slug `multiplication-space-quest`; Multiplication
Bingo Bonanza and Multiplication Tables Adventure are merged in; their old
links redirect here). It is the
**first game in Star Station** and the first **space shooter**. The owner chose
a vertical shooter with friendly targets. The station deck (the kit's
`station-deck` setting) is home base, and the flight is its own scene
(`flight.ts`), drawn at the same pixel size. A cloud of gray space rocks, the
Static, has stranded a fleet of supply ships; each flight clears part of it.

- **On the deck:** Commander Ayo (host), Pilot Mei (Formations), Engineer Rafi
  (Engines, the upgrade bay and Meteor Run), Quartermaster Dot (Cargo), Navigator
  Sol (the Star Map) and Blip the alien. The player's ship sits on the docking
  ring.
- **In flight:** the blaster fires by itself at small gray pebbles (bumps cost
  shield). Each question arrives as three answer rocks that wait; the charge
  beam answers (only it can break them). The stranded ships fly in as the
  question's picture and join the fleet when the answer is right. Eight
  questions a flight; the last one sits on the Static core.
- **Formations** (grade 3): equal groups, arrays and turning them, splitting a
  formation (7 × 8 = 7 × 5 + 7 × 3). **Engines** (grades 3–4): ×2, ×5, ×10,
  ×1, ×0; then ×4, ×9 and ×3 shortcuts (pick the shortcut, then the answer);
  then 6–9 × 6–9 and the 11s and 12s.
- **The Star Map:** 55 facts (1 × 1 to 10 × 10); a fact lights up when it is
  answered right the first time.
- **Upgrades** (stardust from pebbles and answers): twin blaster, rapid fire,
  two extra shields, thrusters, paint jobs. They never change the math.
- **Cargo** (grades 3–4): sharing and grouping with crates, the missing
  factor, then word problems with a remainder (round up, full crates, left
  over). **Constellations** (grades 3–4): fact families, factor pairs, "is it
  a factor?", and primes.
- **The Bingo Boss** (once all four sectors are clear, at the night shift): a
  5 × 5 card; Blip calls a fact and the player beams the square with its
  answer. Every call's answer is on the card (`makeBingoCall` only picks
  unmarked card values). Five in a row wins.
- **The landing** (`landing.ts`): the kit's `alien-planet` setting at evening,
  with the player's ship on the pad, the rescued fleet parked, and the crew
  and Blip at the party. Then back to the deck at night.
- **Meteor Run** (from Rafi, after Engines): 60 seconds of quick facts, mostly
  ones not yet lit on the Star Map. The only timed part.

Code: `src/games/multiplication-space-quest/`. The deck uses `Walker16` and the
deck's `walk` and `blocks`, with `Stage.maxTilesTall` so a tall phone never
sees past the deck. The flight picks its own whole-number pixel scale (about
195 pixels wide on a phone).

| Action | Keyboard | Mouse / touch |
|---|---|---|
| Walk on the deck | Arrow keys or WASD | Tap the ground, or the pad |
| Talk, launch | Space | Tap a person or the ship |
| Steer in flight | Arrow keys or A and D | Drag |
| Beam a rock | Space (under it) or 1–3 | Click or tap the rock |
| Bingo square | Arrow keys, then Space | Click or tap the square |
| Hint (pauses the flight) | H | The light bulb |
| Pause | Esc | Pause |
| Missions | J | Missions |
| Grown-ups | G | Settings → For grown-ups |

