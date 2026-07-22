# Handover: How to Do This Job

*Written 2026-07-05 by the outgoing model, at the end of the session that
built the Gather campus demo. You — whoever picks this up — are inheriting a
working demo, a happy user, and a set of habits that got us here. This is
not a rulebook. It's how to think about the work, with the scars that taught
each lesson. The project facts are at the bottom; the judgment is the front.*

---

## 0. The situation you're walking into

The user is Mansa — a founder building an educational platform, currently
raising funding. He works through chat, ships through you, and manages a
real usage budget: when he says "check in with me after each task," that is
a financial constraint, not a style preference. Honor it literally: one
task, verify it, commit it, report it, **stop**. Do not helpfully start the
next thing.

Two demos exist in parallel: this one (branch `claude-demo-gather`, built by
this lineage) and a separate one built with Codex (`demos/campus-sim-demo`,
branch `codex/simulated-students-campus-demo`). They are intentionally
separate. Don't reconcile them, don't touch his, don't be confused by his
uncommitted files appearing in shared worktrees.

The public artifact is a Vercel deployment from `demo/la-campus-demo/` on
`main` — a trimmed, zero-backend snapshot. It does **not** auto-sync with
the branch. Every batch of demo work ends with the question "does the
snapshot need re-syncing?" and usually the answer is yes.

---

## 1. Interpreting requests: what is actually being asked

The words of a request describe a desired end-state, not an implementation
spec. Nearly every "build X" in this project turned out to be something
else once the codebase was consulted:

- "Build the demo per Prompt 1" → the demo already existed; the real gap
  was ambient students. The plan documents were written before the code;
  the code had moved on.
- "Add a minimap" → a Minimap component already existed on another page;
  the job was mounting it plus one enhancement.
- "Add sound" → no audio assets existed and none could be downloaded; the
  right move was synthesizing sound with Web Audio, which nobody asked for
  but which delivered what was actually wanted.
- "Run it from a public Vercel URL" → first pass kept placeholder env vars;
  the user corrected: *nothing* connected to Supabase or secrets. The real
  request was "a link I can send anyone that just works," and the placeholder
  approach technically deployed but violated the spirit.

So before writing code, translate the request into: **what does the user
want to be true afterward, and for whom?** For this user, "for whom" is
usually "an investor watching a pitch" — which means visible impact beats
engineering purity, kid-friendly beats clever, and repeatable beats fancy
(hence the demo-reset button mattering as much as any feature).

When to ask vs. act: act on anything reversible and derivable from context.
Ask when the action is hard to reverse or outward-facing (pushing to `main`,
publishing, deleting), or when two defensible interpretations genuinely
diverge in cost. Asking which of three tile-art directions he prefers?
Don't ask — build the switcher, show screenshots, let him flip a constant.
Asking before restructuring `main` for the deploy? Correct to ask, and he
appreciated the three-question structure (scope / contents / method).

He gives layered instructions that persist across turns: "check in after
each task," "don't move on without confirming," "commit as you go." Treat
these as standing orders until revoked. He notices when they're honored.

## 2. Decomposing problems: find the seam

This codebase has one architectural seam and it makes every feature
decompose the same way: **the EventBus** (`components/phaser/EventBus.ts`).
Phaser world on one side, React HUD on the other, and pure-TypeScript state
modules in the middle (`mathQuest.ts`, `demoEconomy.ts`,
`explorationState.ts`, `welcomeState.ts`, `campusAudio.ts`). The recipe that
worked eleven features in a row:

1. **Pure state module** — no Phaser, no React. Holds state, persists to
   localStorage with try/catch guards, emits snapshot events on change,
   exposes `announce()` for HUD hydration and `reset()` for the demo-reset
   flow.
2. **Scene wiring** — GatherCampusScene listens/emits, adds sprites, and
   cleans up in `cleanupGather()` (every `EventBus.on` needs its `off`,
   every timer its `remove` — the scene restarts on hot reload and leaks
   compound).
3. **React chip** — small component listening to the snapshot event, styled
   with the shared `hudPanel` neon look, mounted on **both** pages (sandbox
   AND `/world/campus` — forgetting the second consumer is a recurring trap).
4. **Test hook** — extend `window.__campusTest` so the feature is drivable
   without hands. This is not optional; it's how you verify (see §3).

Beyond the seam, two ordering principles:

- **Do the unknown first.** Before building the whole animated-props system,
  check one sheet's dimensions and derive the frame math. Before restructuring
  `main`, run the actual production build. The risky 10% decides the shape of
  the safe 90%.
- **Grep before you build.** Half the features requested already existed in
  some form. `TalkableNPC` grew emotes, chatter, quest dialogue, and
  celebrations across four separate requests — each time the right move was
  extending it, not building a sibling.

And one physical constraint that governs all world-content decomposition:
**NPC patrol tweens do not collide.** Waypoints must lie on provably clear
straight lines — outdoors that's the two path bands (cols 47-48, rows 35-36
of the 96×72 grid), indoors it's carved floor away from station collision
bodies. Props must also never block station tiles, doorways, quest power-cell
spawns (`QUEST_ITEM_POSITIONS`), or patrol lines. Every placement bug this
session traced back to one of these.

## 3. Verifying work: watch it behave, or you don't know

This is the section that matters most, because it's where a less careful
model will quietly fail. `tsc --noEmit` passing means the code compiles. It
does not mean the feature works. **A change is done when you have watched it
do the thing** — through the browser preview, via the test hooks, with
evidence you can quote back to the user.

**The test-hook pattern is your hands.** The sandbox page installs
`window.__campusTest` with: `teleport(x,y)`, `move(x,y)`, `conversation`,
`quest`, `exploration`, `getEconomy()`, `buyItem(id)`, `openShop()`,
`completeAdventure(id, score)`, `resetDemo()`, `resetWelcome()`, `audio.*`.
Canvas clicks advance conversations (synthetic SPACE keydowns do NOT reach
Phaser — no keyCode). With these you can run the entire quest loop —
accept, collect three cells, turn in, fail with 70, pass with 90, buy an
item — and read the state at each step. Do that after anything touching
quest/economy/NPC code. When you add state, add a hook.

**Reproduce bugs before fixing them.** The one crash report this project got
("unhandled runtime error when encountering NPCs") came with no stack. The
wrong move is reading the code for suspects and patching what looks off. The
right move, which worked: install capture hooks
(`window.addEventListener('error'/'unhandledrejection', …)` — Next's dev
overlay is unreadable through eval and Phaser swallows things), then sweep
teleports across every NPC's territory until the real stack appears. It
named the exact line: `Tween.pause` on a completed tween whose reference was
never cleared — an NPC paused between waypoints is the *common* case, so it
fired constantly. Fix, then **re-run the identical sweep** and watch all 13
NPCs converse cleanly. The fix is only proven by the reproduction running
green.

**Verify assets with your eyes, not arithmetic.** The LimeZu prop sheets are
numbered files with no names. I built labeled contact sheets, picked indices
— and planted school desks on top of walls, because the label row in my
contact sheet was offset by one row from the images. The recovery: `Read`
the actual copied PNGs (they render as images), see they're wrong, derive
the real offset (+10 or +12 depending on column count), re-verify by eye.
Never trust index math on unlabeled sprites; always look at the pixels you
shipped, in-game, via screenshot.

**Environment failures impersonate code bugs.** Before touching code, rule
these out — each cost real time this session:

- **Hidden browser tab = frozen Phaser.** RAF stops; teleports "do nothing";
  screenshots time out. Check `document.hidden` and count animation frames
  before concluding anything is broken.
- **Dev server port changes = fresh localStorage origin.** Progress looks
  "wiped" but isn't — `localhost:3000` and `localhost:57186` are different
  storage origins.
- **Stale Next error overlays.** The homepage crashes without Supabase env
  (pre-existing, `AuthModal`); its error toast persists into the sandbox and
  looks like *your* bug. Read the component stack: if it says `AuthModal`/
  `LandingPage`, it's the old homepage crash, not the campus.
- **Windows specifics:** robocopy exit code 1 means *success*; PowerShell
  5.1 has no `&&`; long paths break under the deep worktree/scratchpad
  nesting (extract archives to `C:\tmp\...`-style short paths); CRLF
  warnings on commit are noise; junction removal fights you — a leftover
  `node_modules` junction is harmless because `.gitignore` covers it.

**Prove the deploy path, not just the code.** The Vercel snapshot was
validated by running the real `next build` and `curl`ing the real
`next start` — which surfaced two classes of failure `tsc` and dev mode
never would: routes that throw at import time on missing secrets
(`CHILD_SESSION_SECRET`), and pages that call Supabase during static
prerender. The final state (zero env vars) is only credible because the
build and a live 307→200 smoke test ran with a genuinely empty environment.

## 4. Communicating conclusions

**Lead with what happened.** First sentence: the outcome ("Fixed and
committed (`3ecffa6`)", "Quest loop is done, verified end-to-end"). The user
scans; the first line carries the message, the rest is for when he wants
depth.

**Report evidence, not confidence.** "Verified: ran the full quest — 100 XP
landed, helmet purchase deducted to 20, re-buy rejected" is a different
claim than "this should work now," and he can feel the difference. When
something was *not* verified (e.g., ambient chatter's exact timing was
trusted from a shared code path rather than caught on camera), say so in
one honest clause rather than hiding it.

**Screenshots close arguments.** For anything visual — tile picks, prop
placement, HUD layout — one screenshot replaces three paragraphs and lets
him redirect cheaply ("frame picks are one-line changes in rccTiles.ts").

**Surface the decisions that are his; absorb the ones that aren't.**
Licensing exposure (LimeZu forbids raw-asset redistribution; RCC shipped no
license), pushing to `main`, what a public deploy should require — his
calls, flag them crisply. Which frame index the teal panel is — yours; just
pick and show.

**Commit messages are the institutional memory.** This project's history
reads as documentation: what changed, *why* (the user-visible reason), what
was verified and how, plus gotchas discovered ("contact-sheet numbering was
offset by one row"). Future sessions — including you — will reconstruct
context from `git log`. Write for that reader. Multi-line messages go
through a file (`git commit -F`); inline `-m` with special characters gets
mangled by PowerShell.

## 5. Self-review: the checklist before "done"

Run this before every report-back. It's short because each item has drawn
blood:

1. **Did I watch it behave?** Not compile — behave. If no, it isn't done.
2. **Who else consumes this?** Both pages mount the HUD components. State
   modules feed sandbox *and* authed campus. The authed page's XP is real
   server data — demo-reset must never mount there.
3. **Did I clean up?** EventBus `off`s and timer removals in
   `cleanupGather()`; test servers killed (check the port responds 000);
   temp junctions/`.next` removed before committing.
4. **Is the diff exactly what I mean?** Shared worktrees contain other
   sessions' litter (`demos/` edits, `asset-review/`). Stage paths
   explicitly, then read `git status --short` and confirm zero unrelated
   files staged. Grep the staged list for env/secret-looking names; open
   anything suspicious (TEST_CREDENTIALS.md turned out to be seed-data docs
   — fine, but only because I looked).
5. **Do the world constraints still hold?** Patrols on clear lines, props
   off stations/doorways/cell spawns, quest targets reachable.
6. **Does the public snapshot need syncing?** If the change touches `game/`,
   `components/world/`, `components/phaser/`, or the sandbox page — yes.
7. **Am I about to keep working past a check-in point?** Stop instead.

## 6. Failure modes to watch in yourself

- **Pattern-matching APIs.** The tween crash existed because code *looked*
  right — pause the tween when talking starts. Phaser's actual contract
  (completed tweens are torn down; `.pause()` throws) had to be learned from
  the stack trace. When an API misbehaves, read the error, not your prior.
- **Trusting labels over pixels** (the contact-sheet offset). Any time an
  index, ID, or coordinate maps to something visual, verify one sample
  end-to-end before doing the batch.
- **Fixing at the wrong layer.** Placeholder env vars made the deploy build
  pass — but the actual requirement was "no backend, period," and the right
  fix was deleting 31 API route groups and every auth page. When a fix
  feels like appeasing a symptom, ask what the deployment/user actually
  needs and cut at that level.
- **Forgetting the second consumer.** Sandbox and `/world/campus` are near-
  twins; a feature mounted on one and not the other is a latent bug report.
- **Helpful overreach.** Don't bundle the next task into this one, don't
  redesign what wasn't asked about, don't "improve" his standing orders.
  The check-in cadence *is* the deliverable cadence.
- **Concluding from a silent tab.** If verification suddenly goes quiet
  (nothing moves, hooks return stale data), suspect the environment first —
  §3's list — before rewriting working code.
- **Blind sweeps that increment state.** Conversation encounters rotate
  `lineSets`; teleport sweeps consume rotations. Fine — but know that your
  probing mutates the world, and account for it when reading results.

## 7. Project cheat sheet (the facts)

- **Branch:** `claude-demo-gather` — all demo work. History is descriptive;
  read `git log --oneline` for the feature inventory.
- **Public deploy:** Vercel project `claude-campus-demo`, Root Directory
  `demo/la-campus-demo` on `main`. Zero env vars needed (verified). `/`
  307-redirects to `/dev/campus-sandbox`. Its README documents what was
  removed and how to re-sync. **Sync is manual**: copy `game/`,
  `components/world/`, `components/phaser/`, `app/dev/campus-sandbox/` —
  do NOT re-copy `app/api`, `middleware.ts`, or other pages (that's what
  required the trim).
- **Sandbox:** `/dev/campus-sandbox` — no auth, full test hooks, the page
  investors see. Authed twin: `/world/campus` (needs Supabase + character;
  Supabase has graceful-degradation guards in `lib/supabase/middleware.ts`
  and `hooks/useAuth.ts`, but the marketing homepage still crashes without
  env — known, pre-existing).
- **Art:** `CAMPUS_ART` constant in `GatherCampusScene.ts` —
  `'modern'` (LimeZu, current) | `'rcc'` | `'procedural'` (always loaded as
  fallback). Tiles swap behind fixed texture keys; packs live in
  `public/game-assets/{modern,rcc}/`. **Licenses:** LimeZu = no raw-asset
  redistribution (private repo OK, user accepts for funding demo; own
  assets planned before any public redistribution); RCC = no license file
  shipped.
- **State modules & localStorage keys:** `gather-demo-xp`,
  `gather-demo-inventory`, `gather-exploration-v1`,
  `gather-demo-welcome-seen`, `gather-demo-audio-muted`. Quest state is
  in-memory (resets on reload, by design). `demoReset.ts` wipes everything.
- **Quest:** `mathQuest.ts` — available→gather→return→play→complete;
  Professor Numbers (`npc_professor_numbers`, stands ~(960, 1984));
  pass = score ≥ 80 in `math-race-rally` (game posts 10 pts × correct/10);
  reward 100 XP via `quest-completed` event (sandbox → demoEconomy; authed
  → `/api/world/award`).
- **Useful test coordinates:** prof (960, 2040); cells (1920, 2272),
  (3040, 768), (3040, 3520); central plaza (3040, 2272); Math Hall interior
  ~(752, 1900); `TILE_SIZE = 64`, world 6144×4608.
- **Docs:** `GATHER_DEMO_FUTURE_FEATURES.md` (next features, ranked — the
  user's chosen reference), `GATHER_ASSET_INTEGRATION_GUIDE.md` (art
  options, licenses, swap procedure), plus the original GATHER_* planning
  suite (partly obsolete — the code is ahead of the plans; trust code).

---

## Closing

The pattern under everything above: this job is not producing plausible
code, it's producing *demonstrated outcomes* for a person with limited time
and budget who is betting his pitch on what you ship. Read what he means,
cut the problem at its seam, watch every change behave, tell him what
happened in one honest sentence, and stop when the task is done. Do that
and the capability gap between you and me won't matter much — most of what
I got right was discipline, not brilliance.

Good luck. The campus is in good shape. Don't let Leo win at Bingo too
easily.
