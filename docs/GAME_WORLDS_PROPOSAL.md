# Game Worlds: proposal and handoff

> Status: **PROPOSAL, waiting for the owner's decisions** (written 2026-10-06, after Math phase M5 shipped in PR #214).
> Start the next session by reading this file, then ask the owner the questions in section 6 before building anything.

## 1. The idea (the owner's words, summarized)

Today every remastered game lives in the same kind of place: a sunny, cozy, Earth-like setting drawn in the Seeds of Genius pixel style (a carnival, a market stall, a clock tower, a building yard, an island). The owner wants **different worlds** with their own look, for example a **sci-fi world** and an **ancient world**, so games feel more varied and **children get to choose the environment** they want to play in. Open question from the owner: should worlds follow the **subject** (all history games in the ancient world), or should **any game live in any world** that suits it?

## 2. Recommendation in one paragraph

Group games into a small number of **themed worlds chosen by story fit, not by subject**. Each world holds games from several subjects, and children **pick a world first** (on the site and on a world map), then a game inside it. Every world keeps the house rules that make the games feel like one family: the same pixel art scale and camera, the same fonts, panels, controls, hint ladder, grown-ups page and accessibility. **The pixel style is the constant, and the setting is what changes.** Re-skinning one game into every world is not recommended as the main plan (it multiplies the art work and breaks each game's story), but a few arcade-style modes can offer optional **skins** later.

## 3. Options compared

| Option | What it means | Good | Not so good |
|---|---|---|---|
| **A. Worlds by subject** | Math = town, Science = sci-fi, History = ancient, … | Simple to explain; the site already sorts by subject | Children can't choose a world without also choosing a subject. Some games fit badly (a space game is science, but a math racer would also suit a space track). Five worlds would sit unevenly (Math has 11 games, English and History have 1 each). |
| **B. Worlds by story fit (recommended)** | Each game is placed in the world that suits its story; a world mixes subjects | Children can choose by mood ("I want space!"); every world gets a healthy mix; designers pick the best setting per game | Needs a `world` field on each game and a world-picking screen; the subject filter stays for parents and teachers |
| **C. Choose the world for any game (skins)** | The same game can be played in any world the child picks | Maximum choice | Every game needs art for every world (4 worlds × 27 games = 108 sets of art), and each game's characters and story only make sense in one place. Best kept for small arcade modes (see section 5, "Later"). |

## 4. Proposed worlds (names are drafts for the owner)

The Season 1 lore already has a hook for this: children enter **"Echo" pocket worlds** from the Academy campus (`docs/lore/QUEST_DEV_BRIEF.md`, `docs/lore/SEASON_1_ARC.md`). Each world could be an Echo, with **Jaylen and S.P.A.R.K.** as the guides who open the doors. Every game keeps its own host character, as decided on 2026-10-01.

| World | Look and feel | Fits games about | Games that would go there (draft) |
|---|---|---|---|
| **Sunny Town** (today's look) | Cozy streets, markets, parks, daytime | Everyday maths, money, time, building | Counting Carnival, Money Market Madness, Time Attack Clock, Shape Town Builders, Library Rush |
| **Star Station** (sci-fi) | Space station, neon panels, robots, planets out the window | Space, forces and energy, light and sound, fast arcade maths | Solar System Explorer, Magnet Power Puzzle, Light Laboratory Escape, Sound Wave Surfer; Math Race Rally could move here as a space track |
| **Ancient Kingdoms** | Sandstone, river villages, markets of Mali, Egypt and Kush, torches at dusk | History, early number systems, trade | Ancient Egypt Explorer; future history games; a natural home for Seeds-of-Genius-style stories |
| **Wild Lands** (nature) | Jungles, reefs, volcanoes, caves, weather | Life science, Earth science, oceans, ecology | Ocean Depth Diver, Fossil Dig Adventure, Ecosystem Building Tycoon, Volcano Explorer Lab, Math Adventure Island |
| *(optional)* **Storybook Realm** | Paper-cut fairy-tale forest, ink and letters | English and reading | Spelling Bee Challenge, future reading games |

Number Line Ninja (a dojo) could join Ancient Kingdoms or stay in Sunny Town; that's an owner call.

## 5. How it would work

**For children (the site)**
- A new **world map** (a page like `/worlds`, also reachable from the homepage): a pixel-art map with one door per world. Picking a world shows its games, whatever the subject.
- The current pages stay: `/games` and `/subjects/[subject]` still filter by subject for parents and teachers. A game's card and page show a small world badge.
- The site can remember "my favorite world" in the browser only (`localStorage`). No accounts, no backend, which matches the v1 rules.

**For the games (the code)**
- Add a **world theme layer** to the Adventure Kit (`games-src/adventures/src/kit/worlds/`). Each world provides:
  - its color palette and evening lighting
  - ground and path tiles, and a skyline or backdrop painter
  - a prop set (sci-fi: consoles, pipes, holo-signs, plants in domes; ancient: palms, obelisks, clay pots, market awnings)
  - music in a matching style
  - an accent color for panels
- Games call the theme instead of hard-coding their own trees and skylines. Today each game copies its painters (for example, Shape Town Builders has local copies of the skyline and tree painters), so this also cleans up repetition.
- Add a `world` field to each entry in `lib/content/games.ts`, plus a new `lib/content/worlds.ts` (name, description, colors, door art). The content test checks every game names a real world.
- Update the `remaster-game` skill: "the Carver pixel style, always" stays, plus a new step, "pick the world (or ask the owner) and use its theme".

**Later (optional):** skins for arcade modes that don't depend on a story, such as the Rush modes or Math Race Rally tracks. A child could race on a town road, a space track or a desert road. This is the small, affordable part of option C.

## 6. Decisions for the owner (ask these first next session)

1. **Worlds by story fit (B), or by subject (A)?** Recommended: B.
2. **Which worlds, and their names?** Recommended to start with three: Sunny Town (exists), Star Station and Ancient Kingdoms. Add Wild Lands when the life and Earth science games are built. Storybook Realm is optional.
3. **Tie it to the lore?** Worlds as "Echoes" opened by Jaylen and S.P.A.R.K., or a plain world map without story?
4. **Move existing games?** For example, Math Race Rally to Star Station or Math Adventure Island to Wild Lands. Recommended: move only by re-theming the backdrop, never by rewriting a finished, approved game, and only if the owner wants it.
5. **Order of work versus the games plan:** build the worlds before Science starts (recommended, so the Science space games are born in Star Station), or after the team's QA round?
6. **Skins for arcade modes:** now, later or never? Recommended: later.

## 7. Suggested phases (for the next session to refine)

| Phase | What | Done when |
|---|---|---|
| **W0 Look development** | For each new world, paint a test scene in the kit (ground, props, skyline, a character standing in it, a panel open), day and evening. Send screenshots to the owner. | The owner approves the look of each world |
| **W1 Theme layer in the kit** | `src/kit/worlds/` with the Sunny Town theme pulled out of the existing games, plus the approved new themes. Existing games keep looking exactly the same (check with their e2e scripts and screenshots). | All existing e2e scripts still pass; no visual change to shipped games |
| **W2 Site world map** | `lib/content/worlds.ts`, `world` field on games, `/worlds` and `/worlds/[world]` pages, world badges on cards, homepage link, content test | `npm test`, lint, build with no env vars; phone layout checked |
| **W3 First game in a new world** | Build the next game (Science S1 Space: Solar System Explorer + Planet Explorer Quest) in Star Station with the `remaster-game` skill | Scores 8.5+ on the rubric, owner-approved |
| **W4 Skill and docs** | Update the `remaster-game` skill (pick a world), `CLAUDE.md` and the games README | The skill's plan template has a "World" line |

Each phase is one PR to `main`, approved by the owner, like the UX-4 batches.

## 8. Things that must not change

- **One family look:** the Seeds of Genius pixel style, PixelRenderer scale and camera, Pixelify Sans and Atkinson Hyperlegible fonts, `kit.css` panels, art painted in code, no emoji.
- **Learning design:** the standard stays the same in every world: levels, misconception-based wrong answers, the three-step hint ladder, debriefs and the grown-ups page.
- **Accessibility:** read-aloud, keyboard and touch, reduced motion, and text contrast (WCAG AA) in every palette. Dark sci-fi and evening scenes need extra contrast checks.
- **Content and characters:** worlds are friendly and never scary (the lore's rule: the "threat" is boredom and grayness, not danger). Each game keeps its own host character.
- **The site:** no backend, no accounts, `npm` only. Old links keep working.

## 9. Handoff prompt for the next session

> Read `docs/GAME_WORLDS_PROPOSAL.md`, `docs/GAMES_3D_UPGRADE_PLAN.md` (rubric and status) and `games-src/adventures/README.md`. Ask the owner the questions in section 6 of the proposal (use the recommended answers as the first options). Record the answers in the proposal, then start phase W0: paint test scenes for the chosen new worlds in the Adventure Kit, send screenshots, and wait for the owner's approval before W1. Work on a feature branch off `main` with a draft PR. The owner is new to coding, so explain things in plain language.
