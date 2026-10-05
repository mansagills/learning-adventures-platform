# Testing

## Contents

1. Playing the original
2. Unit tests
3. Serving the built game locally
4. The screenshot tour
5. The end-to-end browser test
6. Card picture
7. Root site checks

## 1. Playing the original

Serve `public/` and open the old file:

```bash
cd /home/user/learning-adventures-platform   # repo root
(nohup python3 -m http.server 8811 --directory public >/dev/null 2>&1 &)
# old game:      http://localhost:8811/games/<slug>.html
# submission:    copy it into public/games/_submission-<slug>.html first, or serve games-src/submissions on another port
```

This little server sometimes dies between commands. If a page won't load,
check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:8811/`
and restart it.

Use Playwright (`playwright-core`, already installed in
`games-src/adventures`) with the bundled Chromium:

```js
chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
```

The swiftshader flags give WebGL without a graphics card. Never run
`playwright install`. Take a few screenshots of the original for the plan,
and log any console errors.

## 2. Unit tests (`games-src/adventures/tests/<short>-problems.test.ts`)

Loop over **every skill × every level × 100–300 seeds** and check:

- the answer is a valid value (a positive integer, a real time, a real word)
- exactly one choice is correct, and the choices are distinct
- every wrong choice has a misconception tag
- the story's numbers really produce the answer with the stated operation
- special rules hold (remainders round the right way, traps differ from the
  real operation)
- diagnosis helpers return the right misconception for known mistakes
- the save cleaner survives junk input

Run `cd games-src/adventures && npx vitest run`. All tests must pass,
including the other games' tests.

## 3. Serving the built game locally

```bash
cd games-src/adventures && npm run build     # tsc + vite build into public/games/play
# with the 8811 server running at the repo root:
# http://localhost:8811/games/play/<slug>/index.html
```

## 4. The screenshot tour (`scripts/<short>-tour.mjs`)

Copy `scripts/mai-tour.mjs` and adapt it. It:

- starts a new game (click "Start a new game", then "I'm ready!") and skips
  the talk box with Space while `.dialogue` exists
- opens each station at each level through the debug hooks (`setTier` then
  `open`), makes one wrong pick, presses H twice, and screenshots the hint
  and the solved state
- does each special mode (side quest, finale mode)

Run it at 1280×720 and at 390×844 (pass `390 844`; the script turns on touch
and mobile for widths under 600). **Open the PNGs with the Read tool and
look at them**: cut-off buildings, labels under trees, the player hidden,
text overflow, toasts covering things, empty-looking areas. Fix them and run
again. This step finds most of the problems a reviewer would.

## 5. The end-to-end browser test (`scripts/e2e-<slug>.mjs`)

Copy `scripts/e2e-math-adventure-island.mjs`. It has `check(name, ok,
detail)`, `talkThrough`, `tapTarget` (walks with arrow keys until the target
is on screen, then clicks it), `pickRight` (presses the number key of the
right answer read from `state().panel.right`) and a report file. It should:

1. Start from the title screen with **real input** (clicks, keys, at least
   one walk-by-clicking).
2. Show a wrong answer giving a reason, a hint showing the picture, a slip
   costing the star, a clean answer earning it.
3. Finish every station (the debug `open` is fine after the first, which is
   reached by walking).
4. Play every special mode once, including a wrong attempt.
5. Play the finale and check the world's finished state.
6. Reload, press Continue, and check progress was saved.
7. Open the grown-ups page, click the "How it is going" tab, and count the
   progress rows.
8. Check the phone layout: no sideways scroll (`scrollWidth <= 390`) and the
   key buttons fully on screen.
9. Check there are no console errors and nothing loaded from another origin.

Aim for 30–50 checks. Run it against the 8811 server URL. It must end with
every check passing; record the count for the docs and PR.

## 6. Card picture

```bash
CHROMIUM_PATH=/opt/pw-browsers/chromium npm run thumbnails -- --only <slug>   # at the repo root
```

Add an `overrides` entry in `scripts/capture-game-thumbnails.ts`: click
"Start a new game", then "I'm ready!", then `...Array(18).fill('.dialogue')`,
with `delay` set to 1500. Look at
`public/games/thumbnails/<slug>.jpg`. If it's mostly empty grass, move the
start position or the camera look-ahead so the main landmark is in view.

## 7. Root site checks (at the repo root, before pushing)

```bash
npx tsc --noEmit
npm run lint                          # 0 errors; 6 known warnings are fine
npm test                              # content test: files exist, no emoji, no external requests in rebuilt games
env -i PATH="$PATH" HOME="$HOME" npm run build   # builds with no env vars (backend-free site)
```
