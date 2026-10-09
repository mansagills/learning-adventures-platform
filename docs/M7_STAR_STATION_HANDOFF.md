# M7 handoff: Multiplication and equations in Star Station

> Written 2026-10-09, right after M6 (Forum Fraction Feast) was approved and merged in PR #220. Read this first when starting M7 in a new session.

## 1. Where things stand

- **9 of the 11 Math games are rebuilt and live.**
  - **Sunny Town (16 px, classic characters):** Number Line Ninja, Counting Carnival, Library Rush, Money Market Madness, Time Attack Clock, Math Race Rally, Math Adventure Island, Shape Town Builders.
  - **Ancient Kingdoms (24 px, 16-bit):** Forum Fraction Feast (M6), set in the Roman forum.
- **Game worlds:**
  - W0 (look development) is COMPLETED ✅.
  - W1 (the theme layer in the kit, `games-src/adventures/src/kit/worlds/`) is COMPLETED ✅.
  - W2 (games in their worlds) is in progress: M6 is done, and **M7 is next**.
- **M7 is the last Math batch.** The owner placed it in **Star Station**. The approved settings there are:
  - `station-deck`, the W0 observation deck
  - `alien-planet`, the owner's chosen proof setting

  The rule is one style per world, many settings, so an M7 game can use either setting, or a new one in the same style.

- **QA:** the owner's team is doing QA on the finished games as a separate process. If feedback arrives, handle it as normal fixes.

## 2. What M7 is (from the merge map in `docs/GAMES_3D_UPGRADE_PLAN.md`)

M7 becomes **two games**, which makes 11 Math games in total.

| New game (surviving slug)      | Grades | Replaces (old files)                                                                                                                                                            | Learning goals from the plan                                                                                                                                                                                                                                               |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **multiplication-space-quest** | 3–5    | `public/games/multiplication-space-quest.html` (881 lines), `public/games/multiplication-bingo-bonanza.html` (626 lines), `public/lessons/multiplication-tables-adventure.html` | Arrays and equal groups as a space fleet, then strategies (doubles, x9 patterns) (3.OA.1, 3.OA.7); division facts and missing factors, the inverse (3.OA.4, 3.OA.6); fact practice where the learner model picks the facts that need work, with a fact-family map (3.OA.7) |
| **equation-balance-scale**     | 3–5    | `public/games/equation-balance-scale.html` (273 lines)                                                                                                                          | A balance with weights: the equals sign as "same as", missing numbers, then two-step problems (1.OA.7, 3.OA.4, 4.OA.3)                                                                                                                                                     |

**On the site:**

- `lib/content/games.ts` lists `multiplication-space-quest`, `multiplication-bingo-bonanza` and `equation-balance-scale`.
- Once the merged game is listed, remove the Bingo listing and add redirects in `next.config.js`:
  - `/games/multiplication-bingo-bonanza` → `/games/multiplication-space-quest`
  - `/games/multiplication-tables-adventure` → `/games/multiplication-space-quest`, if the activity is listed

## 3. Steps for the new session

Follow the `remaster-game` skill (`.claude/skills/remaster-game/SKILL.md`). Its "World" step means building in Star Station.

### Half 1: study and plan, then stop

1. **Branch.**
   - Work on the branch the session names.
   - If its last PR has been merged, start from the latest `main`.
   - If `git checkout -B <branch> origin/main` is blocked by permissions, merge `origin/main` into the branch instead. This session did that after the squash-merge of #220: the files were identical, so the merge added no changes.
2. **Read** these files:
   - `CLAUDE.md` (handoff notes)
   - this file
   - `docs/GAME_WORLDS_PROPOSAL.md`, sections 2a, 4a, 4b, 7a and 7b
   - in `docs/GAMES_3D_UPGRADE_PLAN.md`: the rubric, the merge map, and the M6 section (the model for a plan in a new world)
   - `games-src/adventures/README.md`
   - `games-src/adventures/src/kit/worlds/README.md`
3. **Study the four originals.**
   - Play each one in a browser and read the HTML.
   - Run `node .claude/skills/remaster-game/scripts/audit-game.mjs <file>` on each.
   - **Check every answer key.** If any answer is wrong, flag it to the owner rather than silently fixing it.
4. **Write the M7 plan** with `templates/plan.md`, as a new M7 section in `docs/GAMES_3D_UPGRADE_PLAN.md`. For each game, cover:
   - the setting
   - a host and helpers with names (never Jaylen or S.P.A.R.K.)
   - the play loop
   - 3 levels per skill
   - the mistakes each wrong answer targets
   - the hint ladder (nudge → picture → answer outlined)
   - a debrief question
   - the standards
   - how progress shows
   - the finale
   - any timed mode (one at most, and optional, as in Frenzy and Rush)
5. **Ask the owner with AskUserQuestion**, then stop and wait for approval. Likely questions:
   - **Order:** build both games in one PR, or one game at a time? (Recommended: Multiplication Space Quest first, in two halves, then Equation Balance Scale.)
   - **Setting for each game:** the station deck, the alien planet, or a new Star Station place (for example a ship's bridge or a docking bay)?
   - **Game shape for Space Quest:** a walking world with jobs (like Forum Fraction Feast), or a more arcade-like fleet game? The owner has redesigned games at this stage twice before (Library Rush and Math Race Rally), so offer 2–3 real directions.
   - **Names**, for the games and their hosts.

### Half 2: build, test, score, ship (after approval)

6. **Kit work Star Station needs first.**
   - Only the Roman forum has the walking pieces so far:
     - `walk`: where walking is allowed
     - `blocks`: solid footprints
     - `setTime`: the evening sky
     - `omit`: lets a game draw a prop itself
   - Add the same pieces to whichever Star Station setting the game uses (`src/kit/worlds/star-station/deck.ts` or `planet.ts`), following `ancient-kingdoms/forum.ts`.
   - **Check that the Sunny Town games' build output does not change** (Sunny Town stays exactly as it is).
7. **Build.**
   - Start with `scripts/new-game.sh <slug> pizza-fraction-frenzy`. Forum Fraction Feast is the model for a walking 16-bit game: `Walker16`, `look16FromAppearance`, the customize screen's `paint` / `only` / `hide` options, the camera follow, and the evening change through `setTime`.
   - Write `problems.ts` and its unit tests first.
8. **Test.**
   - Unit tests over hundreds of seeds.
   - A browser script from the title screen to the finale.
   - Screenshot tours at 1280x720 and 390x844. **Look at every screenshot yourself and fix what reads badly.**
   - Rebuilding can rename every game's built files, so **re-run every game's browser test** after the build.
9. **Score** against the rubric (8.5 to pass). Name the weakest points honestly.
10. **Ship.**
    - Listing, redirects and the card picture.
    - The root checks.
    - Update the docs: the plan status, `CLAUDE.md`, `docs/V1_WEBSITE_REBUILD_PLAN.md`, `docs/GAME_WORLDS_PROPOSAL.md` and the adventures README.
    - Commit and push, open a **draft** PR and subscribe to its activity.
    - Send the screenshots and a plain-language report, then wait for the owner.

## 4. Practical lessons from M6 (they save time)

- **Browser tests:** serve `public/games/play` with `python3 -m http.server <port>` and pass the game's URL to the e2e script. `vite preview` made Math Adventure Island fail for reasons unrelated to the game.
- **Chromium:** use `/opt/pw-browsers/chromium`; do not run `playwright install`. For card pictures:
  ```
  CHROMIUM_PATH=/opt/pw-browsers/chromium npm run thumbnails -- --only <slug>
  ```
  If the picture lands on the title or the opening talk, add an override in `scripts/capture-game-thumbnails.ts` (Forum Fraction Feast clicks `.dialogue` 18 times and waits 2500 ms).
- **Site build with no app settings,** keeping only the network proxy settings:
  ```
  env -i PATH="$PATH" HOME="$HOME" HTTPS_PROXY="$HTTPS_PROXY" HTTP_PROXY="$HTTP_PROXY" https_proxy="$https_proxy" http_proxy="$http_proxy" NO_PROXY="$NO_PROXY" NODE_EXTRA_CA_CERTS="$NODE_EXTRA_CA_CERTS" SSL_CERT_FILE="$SSL_CERT_FILE" npm run build
  ```
- **Root checks before pushing:**
  - `npx tsc --noEmit`
  - `npm run lint` (0 errors, 6 known warnings)
  - `npm test` (91)
  - the build above
- **Stopping processes:** never use `pkill -f` with a pattern that also appears in the same command line, or it kills its own shell.
- **Pictures must teach.** In M6, the plate under eaten pieces first looked like crust, and shaded pieces were hard to tell apart. Check every picture in the screenshots at phone size.
- **Dark scenes need contrast checks.** Star Station's night shift and neon need text that passes WCAG AA, and readable panels over a dark sky.
- **Rules for the owner's content:** no emoji, no network requests, npm only, no gendered pronouns for characters. Explain everything in plain language (the owner is new to coding).

## 5. Prompt to start the next session

> We're continuing the game worlds work (phase W2) with Math M7 in the Star Station world. Read `docs/M7_STAR_STATION_HANDOFF.md` first, then `CLAUDE.md`, `docs/GAME_WORLDS_PROPOSAL.md` and the rubric, merge map and M6 section of `docs/GAMES_3D_UPGRADE_PLAN.md`. Use the `remaster-game` skill. Study Multiplication Space Quest, Multiplication Bingo Bonanza, Multiplication Tables Adventure and Equation Balance Scale, check their answer keys, and write the M7 plan as a new section in the upgrade plan. Ask me the open choices (order, settings, game shape, names), then stop and wait for my approval before building. Work on the session's branch (start it from the latest `main`) with a draft PR to `main`, and explain things in plain language (I'm new to coding).
