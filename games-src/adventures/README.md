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
  world/                   pixel textures, billboards, glows, walking characters
  learning/mastery.ts      the learner model: tiers, streaks, mastery, misconceptions
  systems/                 sound (made in code), settings (shared by all games), saving
  ui/                      talk box, title, character creator, settings, grown-ups page, toolbar, toasts
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
