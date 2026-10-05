---
name: remaster-game
description: Remaster a Learning Adventures game into the house style, the 2D retro pixel art in Three.js of Seeds of Genius (the George Washington Carver game), and raise its learning design (levels, misconception-based wrong answers, hint ladder, debrief, grown-ups page) to the same standard. Use this skill whenever a partner's game has been submitted (an HTML file in games-src/submissions/), whenever the owner asks to "upgrade", "remaster", "restyle", "rebuild", "polish" or "Carver-ify" a game, wants "the next game" in the UX-4 games upgrade, or asks to bring any game in public/games/ up to the Seeds of Genius standard, even if they only name the game and say "do the usual". Covers the whole job: studying the original, a design plan for the owner to approve, building it on the Adventure Kit in games-src/adventures/, tests, screenshots, scoring against the rubric, listing it on the site and opening the PR.
---

# Remaster a game to the Learning Adventures standard

Partners write games that focus on **what children learn**. This skill turns
one of those games, or an old game already on the site, into a finished
Learning Adventures game:

- 2D pixel art drawn with Three.js on the shared Adventure Kit
- its own characters and setting
- levels that adapt to the player
- wrong answers built from real mistakes, each with an explanation
- hints, a talk-it-through debrief and a grown-ups page
- tests, then listed on the site

The owner, Mansa, is new to coding. Explain what you did and why in plain
language. Keep jargon out of chat, the PR and the docs, or explain a word
the first time you use it.

## The job, in order

The work has two halves, separated by the owner's approval. Do not start
building before the plan is approved. Twice the owner has redesigned a game
at the plan stage: Math Dash became a survivors-style action game, and Math
Race Rally became a behind-the-car racer. Code written before that approval
gets thrown away.

**Half 1: study and plan, then stop.**

1. **Find the game and the context.**
   - Partner games are single HTML files in `games-src/submissions/` (partners read `games-src/submissions/README.md`). An old site game is `public/games/<slug>.html`, listed in `lib/content/games.ts`.
   - Read `CLAUDE.md` (handoff notes) and the status section of `docs/GAMES_3D_UPGRADE_PLAN.md`. They tell you what is in progress, which branch to use, and whether this game is part of a planned merge (the merge map in section 4).
   - If a PR for the previous game is still open and unmerged, say so before starting a new branch.
2. **Study the original.**
   - Play it in a browser (see `references/testing.md`) and read the HTML.
   - Write down what it teaches: grade, skills, question types, any levels, any feedback. Also note what it lacks against the standard.
   - **The partner's learning content is the heart of the game. Keep it.** Keep their questions, facts, word lists and skill sequence. Your job is to deepen and present them, not to replace the subject.
   - Run `node .claude/skills/remaster-game/scripts/audit-game.mjs <file.html>` for a quick inventory: emoji, network requests, question-like content, canvas or Three.js use.
3. **Design it.** Read `references/learning-design.md` and `references/game-genres.md`. Then decide:
   - the setting
   - a host and helper characters with names (each game has its own, never Jaylen or S.P.A.R.K.)
   - the core play loop, and which existing game to model the code on
   - 3 levels per skill
   - the mistakes each wrong answer targets
   - the hint ladder and the debrief
   - the standards it teaches
   - how progress shows (stars, torches, pieces, belts)
   - the finale

   **Raise the difficulty and depth to the grade band.** Partner games are usually one level of random questions. They should end up with three levels that climb to the top of the grade band, plus traps that catch real misconceptions. Respect the grade the partner chose, but fill the whole band.
4. **Write the plan and stop.**
   - Fill in `templates/plan.md`.
   - Add it as a new section in `docs/GAMES_3D_UPGRADE_PLAN.md` (or a partner-games section if the game is not in the merge map).
   - Show it to the owner in chat in plain language, with 2–3 alternative directions if there is a real choice to make (for example "walking world or arcade?"). Use AskUserQuestion when the choice is a clean pick between options.
   - Then end your turn and wait for approval or changes.

**Half 2: build, test, score, ship** (after the owner approves).

5. **Branch.** Use the branch the session names. If its last PR has been merged, restart the branch from `main` (see `references/shipping.md`).
6. **Build** following `references/build-recipe.md`.
   - Start with `scripts/new-game.sh <slug> <reference-game>`. It copies the boilerplate from the closest existing game.
   - Write the pure learning logic (`problems.ts`) and its unit tests first, then the art, the world, the words (`content.ts`), save, music, the game flow and CSS.
7. **Test** following `references/testing.md`:
   - unit tests for every level and many random seeds
   - a browser script that plays the whole game from the title screen to the finale with real clicks and keys
   - a screenshot tour at desktop and phone width
   - **Look at the screenshots yourself and fix what looks wrong** (cut-off art, overlapping labels, a hidden player, text that wraps badly) before showing anyone.
8. **Score** with the rubric in `references/quality-bar.md`.
   - Below 8.5, improve the weakest category and score again.
   - Be honest. Name the weakest thing in the evidence, so the owner can trust the number.
9. **Ship** following `references/shipping.md`:
   - list the game in `lib/content/games.ts` and add redirects for merged slugs
   - make the card picture
   - run the root checks
   - update the docs (the plan's status, the `CLAUDE.md` handoff, `docs/V1_WEBSITE_REBUILD_PLAN.md`, the adventures README)
   - commit, push, open a **draft** PR, and subscribe to its activity
10. **Check in.** Send the screenshots with SendUserFile: title, gameplay, a hint, a wrong-answer explanation, the debrief or finale, the grown-ups page and a phone capture. Then write a short, plain-language summary:
    - how the game plays now
    - what was kept from the partner's version
    - the score, with its weakest point
    - what the owner should try when testing

    Then wait. **A passing self-score is not approval**; the owner tests and merges.

When the owner asks for changes after testing ("if you pass Dash, a couple of
wrong answers should let him pass you again"), make them on the same branch.
Re-run the tests and record the feedback and the fix in the plan doc. Say
what changed and why it now works the way they asked.

## Things that matter more than they look

- **No emoji, stock icons, Google Fonts or network requests** in a rebuilt game. Every picture is painted in code with `PixelBuffer`. The site's content test fails otherwise, and it's a kids' site with no trackers.
- **Three levels per skill, picked by the learner model** (`recordAnswer` in `src/kit/learning/mastery.ts`): up after two clean answers, down after two misses. A star is for a clean first try. Wrong answers never cost progress; they cost the star.
- **Every wrong answer gets a sentence about the likely mistake**, not just "try again". That needs a misconception tag on every wrong choice (see `references/learning-design.md`).
- **Read-aloud is on by default**: keep sentences short and clear for young readers.
- **Phone width (390 px) must work** with no sideways scrolling and nothing hidden behind the toolbar.
- **Credit the partner** by name in the grown-ups page credits (`GROWNUPS.credits`), e.g. "Learning design by <name>. Art, music and sound by Learning Adventures, made in code." The submissions README promises this.
- **Commit the build** (`public/games/play/`). Vercel serves it as static files and does not rebuild the games.
- **Don't name gendered pronouns for characters** in generated story text unless the art matches. Use the character's name instead (an earlier game said "he" over a character drawn with long hair).

## Reference files

| File | Read it when |
|---|---|
| `references/quality-bar.md` | Designing (what every game must have) and scoring (the rubric) |
| `references/learning-design.md` | Turning the partner's content into levels, mistakes, hints and debriefs; raising difficulty |
| `references/game-genres.md` | Choosing the kind of game and which existing game's code to copy |
| `references/build-recipe.md` | Building: file layout, the kit's parts, patterns, gotchas |
| `references/testing.md` | Local server, browser tests, screenshot tours, thumbnails, root checks |
| `references/shipping.md` | Site listing, redirects, docs, git, PR and the check-in |
| `templates/plan.md` | Writing the design plan for the owner |
