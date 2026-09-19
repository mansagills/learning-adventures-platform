# Gather Campus Demo — Feature Roadmap & Status

Originally captured 2026-07-05 as a ranked list of next features.
**Updated 2026-07-26: every feature on the original list is now built,
verified, and live on the public demo.** This file is now the status
record + the parking lot for what's next.

**Public demo:** https://learning-adventures-platform-2mxb.vercel.app
(Vercel project `learning-adventures-platform-2mxb`, Root Directory
`demo/la-campus-demo` on `main`, zero env vars.)

**Logistics that still apply:** new work lands on `claude-demo-gather`
first. The public deployment is a **manually synced snapshot** in
`demo/la-campus-demo/` on `main` — it does NOT auto-sync. See
"Snapshot sync procedure" at the bottom.

---

## ✅ Shipped (all live on the public demo)

| # | Feature | Branch commit | Synced to main |
|---|---|---|---|
| 1 | **Wearables** — shop gear shows on the avatar | `1ea5c43` | `aec907c` |
| 3 | **Player identity** — name + 6-sprite avatar picker | `9227bcc` | `67130cf` |
| 4 | **Cinematic intro** — full-campus flyover onto the player | `fdcd369` | `67130cf` |
| 6 | **Mobile touch controls** in the sandbox | `153588d` | `67130cf` |
| 2 | **Chapter 0 — "The First Spark"** (replaced the old generic "second quest" idea) | `25316e0` | `5372aa9` |
| — | **Null Run** — canvas side-scrolling math shooter | `101d8f8` + `32e4d8d` | `1ccb579` |
| — | **Chapter 1 — the Null field + Null Fragment** | `b51af1a` | `fdab4a3` |
| 7,8,9 | **Tier 3 ambient life** — hoops, greetings, day/night | `9857768` | `c1afc4f` |

### What the demo does now, end to end
1. Welcome card asks the player's **first name** and lets them pick one of
   six character sprites (`playerIdentity.ts`); the name rides above the
   avatar and personalizes the activity feed.
2. **Cinematic intro** opens zoomed out over the whole campus and glides
   down onto the player (all 36 chunks pre-loaded, streaming paused mid-pan).
3. **Chapter 0 — "The First Spark"** (`chapter0.ts`): Jaylen (the existing
   plaza guide NPC) onboards them, their **Spark ignites** with a VFX burst
   the moment they enter any building, and clearing *any* game completes it
   (+50 XP). Professor Numbers gates the Racing License quest behind it.
4. **Chapter 1 — the Null field** (`chapter1.ts`): Jaylen sends them to the
   **Null Run** arcade cabinet in Math Hall. Scoring **80+** clears it,
   granting the **Null Fragment** story item (first clear only,
   `storyItems.ts`, persists across reload, shown in a HUD chip) + 150 XP.
5. **Null Run** (`public/games/null-run.html`): the platform's first
   real-time canvas action game — a side-scrolling math shooter where the
   field starts frozen/grayscale and **doing math thaws the color back**.
   Mixed operations with Easy/Medium/Hard tiers, deterministic 0–100
   accuracy score (no RNG), shootable ice debris for bonus frost points,
   from-scratch touch controls.
6. **Ambient life**: students play basketball on the court (🏀 emotes + a
   ball arcing to the rim with a ✨ swish), sim students **wave 👋** as you
   walk past, and a slow **day→dusk→night** tint runs with the campus lamps
   glowing after dark.
7. Wearables, the Racing License side quest, the Campus Shop, exploration
   tracking, ambient chatter, and the demo-reset button all still work.

---

## Demo polish pass — character physics + character cards

Shipped on `claude/campus-sandbox-demo-polish-egidd9`.

### Physics: characters could stand on the buildings

Two separate causes, both fixed:

1. **The player's collision box was misaligned with the sprite.** A 40×40
   body at offset (28, 40) on a 96×96 frame drawn at 64×64 is, after the
   0.667 scale, a 26.7×26.7 world-pixel box centred on the sprite's
   **middle**. Measured against four walls, the feet overlapped a wall tile
   by ~11px walking down and the head/torso by ~27px walking up. Characters
   draw above the tile layer, so that overlap is what read as walking on the
   building — the tile collision itself was working the whole time.
2. **NPCs had no physics body at all.** `TalkableNPC` was a Container moved
   by position tweens, so all 16 characters passed through walls, furniture
   and each other. Patrol routes were hand-drawn along wall-free lines to
   hide it (the placement rule at the top of `simStudents.ts`).

New `game/world/characterBody.ts` owns one feet-shaped footprint (36×20
world px) and converts it into the two coordinate spaces Phaser wants —
source-frame px for a Sprite, world px for a Container. `TalkableNPC` now
takes an Arcade body and moves by velocity steering instead of tweens
(a tween writes straight past the physics step). NPC bodies are
`pushable: false`, so the player is blocked by an NPC without shoving them
off route, and a 2.5s stuck timer retires a blocked leg since there is no
pathfinding to route around an obstacle.

Also fixed a **collider leak**: every wall tile registered its own player
collider on chunk load and chunk teardown never removed it. Walls now live
in one static group with one collider per colliding party, and solid
props/stations likewise — which is also what lets NPCs collide with
furniture rather than only the player.

Verified in-browser: player stops exactly on the wall edge in all four
directions; all 16 NPCs carry the correct 36×20 box and 12 still patrol;
the player is blocked exactly 36px from an NPC and the NPC does not shift;
colliders hold flat at 6 across three full map laps.

### Character pop-up cards

`ConversationPanel` was a flat text box — name, line, dot progress — so a
player meeting Professor Numbers learned nothing about her. It is now a
character card: portrait, role, location and a one-line blurb above the
dialogue. The blurb shows only while the first line is on screen, so it
introduces the character once then gets out of the way.

Portraits are cropped from the existing walk sheets (384×384, 4×4 grid of
96×96 frames; frame 8 is the facing-camera pose) — no new art needed.
Copy lives in `game/world/characterCards.ts`, drawn from the Spark
Chronicles bible so the demo and the story stay in step; the 10 simulated
students fall back to a generic "Academy Student" card.

### Other polish

- **Site chrome removed from the campus routes.** `HeaderFooterWrapper` only
  hid chrome on `/login`, so the full-screen `h-screen` canvas rendered
  under the marketing nav bar with the footer below it — the page ran
  1210px tall and scrolled. `/world/*` and `/dev/campus-sandbox` now render
  full-bleed (measured: body height exactly matches the viewport).
- **HUD overlaps fixed.** The quest card overlapped the exploration
  checklist by 7px when the objective wrapped to three lines, and the
  activity feed ran behind the conversation card. Measured every HUD box in
  the browser: now zero overlaps.
- **In-world labels enlarged** — station names 6px → 10px, building signs
  8px → 12px. A pixel face at 6px is unreadable at this zoom.
- **Speech bubbles no longer cover the player** — the in-canvas bubble flips
  below the NPC when the player stands above them, which is most of the time
  for the room hosts since you enter from the doorway side.
- **Dark letterbox** — the page behind the fixed 16:9 canvas was cream, so
  the FIT bars read as a rendering bug on any other aspect ratio.

### Known, deliberately not done

- **Mobile canvas is small.** Phaser is configured `Scale.FIT` at a fixed
  1280×720, so at phone widths the world occupies a ~236px strip between
  letterbox bars. Fixing it properly means `Scale.RESIZE` plus auditing
  everything that reads `cam.width/height` (the intro flyover zoom, the
  screen-space quest arrow, the night overlay). That is a scale-architecture
  change, not polish, so it is flagged rather than rushed into a demo build.
- **No Y-depth sorting.** Characters are a fixed depth 10 and props 1–7, so
  a character never passes behind a tall bookcase. The feet box makes wall
  overlap read correctly, which was the actual complaint; y-sorting is the
  next increment if the demo needs it.

---

## Parking lot — ideas not yet started

Nothing here is committed to; these are the natural next moves.

### Story
- **Chapter 2** — the Null Fragment explicitly teases it ("Chapter's just
  getting started"). Per `SEASON_1_ARC.md`, Chapters 1–2 are both the Math
  wing, with the **quarterly cinematic vs. Null** as the payoff. The
  chapter modules are now a proven pattern: copy `chapter1.ts`.
- **Chapters 3–8** — Science (Static), English (The Blot), History (The
  Loop). Each wants its own quest game.

### Games (the genre-range pitch)
- **A second Null-style game for another subject wing** — the strongest
  remaining proof that any genre plugs into the hub. Science/Static is the
  natural next (the Discovery Lab is already built and unused for quests).
- **Catalog Null Run** in `lib/catalogData.ts` so it appears in the public
  catalog, not just inside the campus. (Deliberately not done — the
  "Registered ≠ Cataloged" rule.)

### Polish
- **Mobile HUD collision on the authed page** — `TouchControls` defaults to
  bottom-left, which sits under the Minimap on phone widths. The sandbox
  passes `side="right"` + `bottomOffset={96}` to dodge this; `/world/campus`
  still has the collision. Pre-existing, flagged, not fixed.
- **Sound for the new systems** — Null Run is silent; the campus has
  `campusAudio.ts` (Web Audio, synthesized) that it could borrow from.
- **Own art** — LimeZu/RCC packs still have redistribution limits (see
  `GATHER_ASSET_INTEGRATION_GUIDE.md`); repo must stay private until the
  user commissions original assets.

---

## Snapshot sync procedure (manual, every time)

1. `cd C:/tmp/learning-adventures-platform-main-demo` (a worktree on `main`),
   `git fetch origin main && git merge --ff-only origin/main`.
2. Diff branch vs snapshot to get the exact delta:
   `git diff --stat "origin/main:demo/la-campus-demo/<path>" "HEAD:<path>"`
   for `game`, `components/world`, `app/dev/campus-sandbox`, `public/games`.
3. Copy changed files **wholesale** — EXCEPT `app/dev/campus-sandbox/page.tsx`.
4. **Hand-merge `page.tsx`.** Never copy it: the source page has a
   `if (process.env.NODE_ENV === 'production') return null` guard and a red
   DEV banner that would **blank the public demo**. Port only the feature
   lines; keep the snapshot's indigo "Campus Demo Preview" banner.
5. Prove the deploy path: `npm run build` then `npx next start` in
   `demo/la-campus-demo/` with **zero env vars**, and drive the feature with
   headless Playwright against that production build *before* pushing.
6. Commit + `git push origin main`, wait for Vercel, then verify against the
   **public alias** `learning-adventures-platform-2mxb.vercel.app` — NOT the
   deployment-specific `...-<hash>.vercel.app` URL, which is gated by
   deployment-protection auth and will never return 200.

---

## Test hooks (`window.__campusTest`, sandbox only)

`teleport(x,y)`, `move(x,y)`, `position`, `conversation`, `quest`,
`exploration`, `getEconomy()`, `buyItem(id)`, `wearable()`,
`completeAdventure(id, score)`, `openShop()`, `identity()`,
`setIdentity(name, avatarId)`, `chapter0()`, `chapter1()`, `storyItems()`,
`playIntro()`, `setDayPhase(0..1|null)`, `shootHoops()`, `dayNight`,
`audio.*`, `hasSeenWelcome`, `resetWelcome()`, `resetDemo()`.

Null Run has its own: `window.__nullRun` — `start(diff)`, `state()`,
`pick(v)`, `pickCorrect()`, `pickWrong()`, `autoWin()`, `spawnIce()`.
