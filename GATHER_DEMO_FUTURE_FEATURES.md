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
