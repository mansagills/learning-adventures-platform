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
node scripts/gear-shots.mjs <url> <outDir>   # pictures of ninja gear combinations from every side
node scripts/tour.mjs <url> <outDir>     # screenshots of every belt, hints and a phone
```

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
