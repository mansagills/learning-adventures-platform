# Game Worlds: proposal and handoff

> Status: **APPROVED IN PRINCIPLE (2026-10-06)**. The direction and the order of work are decided (section 2a). The world designs, their names and which games go in each are still open (section 6).
> **Next session: start with section 9 (the handoff).** Work continues on the branch `claude/elegant-clarke-hlzflj` in a new session.

## 1. The idea (the owner's words, summarized)

Today every remastered game lives in the same kind of place: a sunny, cozy, Earth-like setting drawn in the Seeds of Genius pixel style (a carnival, a market stall, a clock tower, a building yard, an island). The owner wants **different worlds** with their own look, for example a **sci-fi world** and an **ancient world**, so games feel more varied and **children get to choose the environment** they want to play in. Open question from the owner: should worlds follow the **subject** (all history games in the ancient world), or should **any game live in any world** that suits it?

## 2. Recommendation in one paragraph

Group games into a small number of **themed worlds chosen by story fit, not by subject**. Each world holds games from several subjects, and children **pick a world first** (on the site and on a world map), then a game inside it. Every world keeps the house rules that make the games feel like one family: the same pixel art scale and camera, the same fonts, panels, controls, hint ladder, grown-ups page and accessibility. **The pixel style is the constant, and the setting is what changes.** Re-skinning one game into every world is not recommended as the main plan (it multiplies the art work and breaks each game's story), but a few arcade-style modes can offer optional **skins** later.

## 2a. Owner decisions (2026-10-06)

1. **Worlds, with games placed by the owner and the team.** Games are grouped into themed worlds (option B below). **The owner and the team decide which game goes in which world.** Claude may suggest a world when planning a game, but the owner's choice is final. The table in section 4 is only a starting suggestion.
2. **Not every game in every world.** Re-skinning each game for each world (option C) is not feasible and is not the plan. Each game lives in one world.
3. **Order of work:**
   1. **Design the new worlds first:** their look, palette, props and music, plus a world theme layer in the Adventure Kit. The owner approves each world's look from screenshots.
   2. **Build the remaining games inside their worlds**, so each world has at least a few games:
      - Math: M6 Fractions (Pizza Fraction Frenzy, with Fraction Pizza Party merged in). M7 Multiplication and equations (Multiplication Space Quest, with Multiplication Bingo Bonanza and Multiplication Tables Adventure merged in; and Equation Balance Scale).
      - Then Science (14 games), English (Spelling Bee Challenge) and History (Ancient Egypt Explorer).
   3. **Then the site:** bring the Season 1 "Echo" narrative onto the site and redesign it so that **choosing a world feels interactive** (a world map with doors, Jaylen and S.P.A.R.K. as guides).
4. **A richer 16-bit look for the new worlds** (added 2026-10-06). The new worlds keep pixel art, but **characters (and their worlds) are more refined and colorful, in a 16-bit console style**. **Sunny Town and the games already in it stay exactly as they are.** See section 4a.
5. **Same branch, new session.** The next session continues on `claude/elegant-clarke-hlzflj`, with a fresh draft PR to `main` for each piece of work.

## 3. Options compared

| Option | What it means | Good | Not so good |
|---|---|---|---|
| **A. Worlds by subject** | Math = town, Science = sci-fi, History = ancient, … | Simple to explain; the site already sorts by subject | Children can't choose a world without also choosing a subject. Some games fit badly (a space game is science, but a math racer would also suit a space track). Five worlds would sit unevenly (Math has 11 games, English and History have 1 each). |
| **B. Worlds by story fit (chosen; the owner and team place the games)** | Each game is placed in the world that suits its story; a world mixes subjects | Children can choose by mood ("I want space!"); every world gets a healthy mix; designers pick the best setting per game | Needs a `world` field on each game and a world-picking screen; the subject filter stays for parents and teachers |
| **C. Choose the world for any game (skins): not the plan** | The same game can be played in any world the child picks | Maximum choice | Every game needs art for every world (4 worlds × 27 games = 108 sets of art), and each game's characters and story only make sense in one place. Best kept for small arcade modes (see section 5, "Later"). |

## 4. Proposed worlds (names are drafts; the owner and team choose the worlds and place the games)

The Season 1 lore already has a hook for this: children enter **"Echo" pocket worlds** from the Academy campus (`docs/lore/QUEST_DEV_BRIEF.md`, `docs/lore/SEASON_1_ARC.md`). Each world could be an Echo, with **Jaylen and S.P.A.R.K.** as the guides who open the doors. Every game keeps its own host character, as decided on 2026-10-01.

| World | Look and feel | Fits games about | Games that could go there (suggestions only) |
|---|---|---|---|
| **Sunny Town** (today's look) | Cozy streets, markets, parks, daytime | Everyday maths, money, time, building | Counting Carnival, Money Market Madness, Time Attack Clock, Shape Town Builders, Library Rush |
| **Star Station** (sci-fi) | Space station, neon panels, robots, planets out the window | Space, forces and energy, light and sound, fast arcade maths | Solar System Explorer, Magnet Power Puzzle, Light Laboratory Escape, Sound Wave Surfer; Math Race Rally could move here as a space track |
| **Ancient Kingdoms** | Sandstone, river villages, markets of Mali, Egypt and Kush, torches at dusk | History, early number systems, trade | Ancient Egypt Explorer; future history games; a natural home for Seeds-of-Genius-style stories |
| **Wild Lands** (nature) | Jungles, reefs, volcanoes, caves, weather | Life science, Earth science, oceans, ecology | Ocean Depth Diver, Fossil Dig Adventure, Ecosystem Building Tycoon, Volcano Explorer Lab, Math Adventure Island |
| *(optional)* **Storybook Realm** | Paper-cut fairy-tale forest, ink and letters | English and reading | Spelling Bee Challenge, future reading games |

Number Line Ninja (a dojo) could join Ancient Kingdoms or stay in Sunny Town; that's an owner call.

## 4a. Art direction for the new worlds (owner, 2026-10-06)

**The goal:** still pixel art, but a step up from today's look, closer to 16-bit console games. That means more refined, more colorful characters and richer scenes. Sunny Town is not changed.

**Where we start from:** today's Adventure Kit characters are small and simple. Children are 16×24 pixels and adults 16×28, with three walk frames. Dialogue portraits are 48×48. The world uses 16 pixels per tile (`PX = 16` in `src/kit/render/pixelRenderer.ts`). Each color has about 2 or 3 shades, with a dark outline.

**What "more refined and 16-bit" should mean** (to try out in W0, then pick with the owner):
- **More detail per character:** larger sprites (for example about 24×36 to 32×48), with clear faces, hands, clothing folds, hair shapes and accessories, plus a few more walk and idle frames (blinking, breathing).
- **Richer color:** 4–5 shades per material, warm highlights, cool shadows, and colored outlines (a darker shade of each part) instead of one flat dark outline. Bolder, more saturated palettes for each world. Careful dithering on large surfaces.
- **Richer scenes to match:** more detailed tiles and props, backgrounds with several layers (parallax), glow and light effects (neon in Star Station, torchlight in Ancient Kingdoms), and small ambient animations (steam, sparks, banners, water).
- **Bigger portraits:** for example 64×64 or 72×72, with more expressions.
- **Keep it consistent within a world:** a world must not mix pixel sizes. If characters get more detail, the tiles and props of that world are drawn at the same finer pixel scale, for example 24 or 32 pixels per tile in that world's theme. The kit then needs a per-world pixel scale; Sunny Town keeps 16.

**How to decide:** in W0, paint the same character (for example a host or the player) in three versions and show them side by side with today's Sunny Town character: (a) today's size with richer color and shading only, (b) about 24×36, (c) about 32×48. Show each standing in a slice of the new world, day and evening, at desktop and phone size. The owner picks one, and that becomes the standard for every new world.

**What stays the same:** pixel art painted in code (no photos or AI images in the games), the house fonts and panels, the camera feel, readable text, and the learning design. Characters stay friendly and kid-appropriate, with diverse skin tones and hair, as in today's games.

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

## 6. Still open (ask the owner at the start of the next session)

Decided already (see section 2a): worlds rather than subject areas; the owner and team place the games; no re-skinning of every game; the order of work.

1. **Which new worlds to design first, and their names?** Suggested: Star Station (sci-fi) and Ancient Kingdoms, since those are the two the owner named. Then Wild Lands (nature) once the life and Earth science games are near. Storybook Realm is optional. Sunny Town (today's look) already exists.
2. **Where do the remaining Math games go?** The owner and team decide. Possibilities: M6 Fractions (a pizzeria) in Sunny Town or Ancient Kingdoms (a market bakery), and M7 Multiplication Space Quest in Star Station (it is already a space theme). Equation Balance Scale could go anywhere: a space cargo scale, or an ancient market scale.
3. **Do any finished games move to a new world?** For example, Math Race Rally or Math Adventure Island. Suggested: only if the owner wants it, and only by changing the backdrop, never by rewriting an approved game.
4. **Skins for arcade modes** (a space track for Math Race Rally, say): later, or never?
5. **The team's QA feedback** on the finished games: fold it in before or alongside the world work?

## 7. Phases (in the owner's order)

| Phase | What | Done when |
|---|---|---|
| **W0 Look development** | First the 16-bit character test from section 4a: the same character at three detail levels next to today's Sunny Town character, so the owner picks the standard. Then, for each new world, paint a test scene in the kit at that standard (ground, props, skyline, characters standing in it, a panel open), day and evening, desktop and phone. Send screenshots to the owner. | The owner picks the character standard and approves the look of each world |
| **W1 Theme layer in the kit** | `src/kit/worlds/`: the Sunny Town theme pulled out of the existing games, plus the approved new themes. That includes a per-world pixel scale and the refined 16-bit characters and portraits for the new worlds. Existing games keep looking exactly the same (check with their e2e scripts and screenshots). | All existing e2e scripts still pass; no visual change to shipped games |
| **W2 Games in their worlds** | Build the remaining games with the `remaster-game` skill (updated with a "World" step), each in the world the owner and team chose: Math M6 and M7 first, then Science, English and History. Aim for at least a few games per world. | Each game scores 8.5+ on the rubric and is owner-approved, one PR per batch as before |
| **W3 The site: Echoes and the world map** | `lib/content/worlds.ts` and a `world` field on games. An interactive world map where children pick a world (doors that open, Jaylen and S.P.A.R.K. as guides, the Echo story from `docs/lore/`). `/worlds/[world]` pages, world badges on cards and a homepage entrance. The subject pages stay. | `npm test`, lint, build with no env vars; phone layout and keyboard checked; owner-approved |

Each phase is one or more PRs to `main`, approved by the owner, like the UX-4 batches.

## 8. Things that must not change

- **One family look:** pixel art painted in code (no emoji), the camera feel, Pixelify Sans and Atkinson Hyperlegible fonts and `kit.css` panels. The new worlds use the richer 16-bit character and scene style from section 4a; Sunny Town and its games keep today's look unchanged.
- **Learning design:** the standard stays the same in every world: levels, misconception-based wrong answers, the three-step hint ladder, debriefs and the grown-ups page.
- **Accessibility:** read-aloud, keyboard and touch, reduced motion, and text contrast (WCAG AA) in every palette. Dark sci-fi and evening scenes need extra contrast checks.
- **Content and characters:** worlds are friendly and never scary (the lore's rule: the "threat" is boredom and grayness, not danger). Each game keeps its own host character.
- **The site:** no backend, no accounts, `npm` only. Old links keep working.

## 9. Handoff for the next session

**Where things stand (2026-10-06):**
- **8 of the 11 Math games are rebuilt and live:** Number Line Ninja, Counting Carnival, Library Rush, Money Market Madness, Time Attack Clock, Math Race Rally, Math Adventure Island and Shape Town Builders. All are in today's "Sunny Town" look. Their status and scores are in `docs/GAMES_3D_UPGRADE_PLAN.md`.
- **Still to build:** Math M6 Fractions and M7 Multiplication and equations, then Science (14), English (1) and History (1). The learning specs for each batch are in the same plan.
- The owner's team is doing QA on the finished games. Feedback may arrive at any time; handle it as normal fixes.

**Prompt to start the next session:**

> We're continuing on the branch `claude/elegant-clarke-hlzflj`. Read `docs/GAME_WORLDS_PROPOSAL.md` (especially sections 2a, 6 and 7), `docs/GAMES_3D_UPGRADE_PLAN.md` (rubric, merge map and status) and `games-src/adventures/README.md`. Ask me the open questions in section 6 of the proposal. Then start phase W0: first the 16-bit character test from section 4a (the new worlds get more refined, colorful 16-bit-style characters and scenes; Sunny Town stays as it is), then design the new worlds as test scenes in the Adventure Kit, send screenshots, and wait for my approval before W1. My team and I decide which games go in which world. Work on the branch with a draft PR to `main`, and explain things in plain language (I'm new to coding).
