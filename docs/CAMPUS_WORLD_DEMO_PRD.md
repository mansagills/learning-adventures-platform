# PRD: Finishing the Gather-Style 2D Campus World Demo

**Status**: Draft, reconciled against actual code as of commit `438ff44` on `claude/learning-adventures-demo-spec-fqgztv` (2026-09-04).
**Supersedes, for status purposes**: `GATHER_DEMO_FUTURE_FEATURES.md`, `docs/CAMPUS_WORLD_MANUAL_TEST_PLAN.md`, `docs/campus-demo-stakeholder-guide.md`, and the campus-world sections of `COMPREHENSIVE_PLATFORM_PLAN.md` and `2D_GAME_WORLD_PLAN.md` — all four are stale or contradicted by the code as detailed in Appendix A. Do not treat them as current status going forward; this document is.
**Companion doc**: `docs/OPUS_FABLE_PROMPTING_GUIDE.md` — use its templates when prompting Opus 5 / Fable 5.1 to execute items from this PRD.

---

## 1. Why this document exists

This repo has three separate artifacts that all answer to "the campus world demo," and its planning docs disagree about which one is finished:

| Artifact | What it is | Actual state |
|---|---|---|
| **A. Production authenticated world** — `app/world/*`, `game/*`, real Prisma/auth backend | The real, long-term product surface — where a logged-in student's progress, quests, and purchases actually persist | **Currently build-broken.** Three compile errors (below) block the entire Phaser bundle. Cannot be demoed until fixed. |
| **B. Public demo snapshot** — `demo/la-campus-demo/` | A trimmed, backend-free, manually-synced copy of the world code, frozen before the bug above was introduced, deployed standalone on Vercel | Working, and is what `GATHER_DEMO_FUTURE_FEATURES.md`'s "fully built and live" claim actually refers to. Not the same code as (A) and has drifted out of sync since 2026-07-26. |
| **C. `demos/campus-sim-demo/`** | A separate, non-Next.js vanilla-JS demo built on a different track ("Codex") | Explicitly unfinished per its own `progress.md`; a parallel experiment, not integrated with (A) or (B). |

**Decision needed from you, the reader, before work starts on anything beyond the P0 fix below**: which artifact is "the demo" this PRD should drive to completion?

- **Recommended**: treat **(A) the production world** as the real target, since it's the only one that persists real student data and is the only one with a future — but budget for re-syncing (B) from it afterward so the artifact people actually see stays current, per the existing "Snapshot sync procedure" in `GATHER_DEMO_FUTURE_FEATURES.md`.
- Alternative: keep polishing (B) only, and treat (A) as a slower-moving backend track. This is faster to a fresh public demo but doesn't fix the fact that the real product underneath is currently broken.
- (C) is out of scope either way unless you decide otherwise — nothing links it to (A) or (B) today.

Everything below assumes the recommended path (finish A, keep B in sync) unless you say otherwise.

---

## 2. P0 — Fix the build (do this before anything else)

The production world does not currently build. This blocks every other item in this PRD from being demoed or even manually tested, so it comes before phase work, not as part of it.

| # | File:Line | Defect | Fix |
|---|---|---|---|
| P0-1 | `game/entities/NPC.ts:41` | Duplicate `onFinalDialogLine` — declared as a constructor param (line 40) and again as a `private readonly` class field (line 41), a leftover from a bad merge in PR #158. `tsc --noEmit` fails with `TS1005: ',' expected`. This single error breaks `game/main.ts`'s bundle for **both** `/world` and `/world/campus`, since it unconditionally imports the scenes that import `NPC`. | Remove the duplicate declaration, keep whichever one is actually referenced elsewhere in the class body. |
| P0-2 | `app/world/page.tsx:188-226` | `handleCollectibleCollected`, `handleNpcDialog`, and `handleZoneChanged` are each declared twice as `const` in the same scope inside a `useEffect`. One `handleCollectibleCollected` (line 188) has a real implementation; a second, dead one (line 219) is a no-op stub labeled "Placeholder for Phase D collectible handling." | Delete the duplicate declarations. For `handleCollectibleCollected` specifically, keep the real (first) implementation — verify it's the one that calls `/api/world/award`, not the placeholder. |
| P0-3 | `app/world/page.tsx:437,442` | `<QuestLog>` and `<QuestOfferDialog>` are used in JSX but never imported. | Add the missing imports from `components/world/`. |

**Acceptance criteria for P0**: `npx tsc --noEmit` passes, `npm run build` succeeds, and `/world` and `/world/campus` both load in a local dev server without console errors for a logged-in test student.

This is an Opus 5 task (small, well-scoped code fix in existing files) — see Template A in the prompting guide.

---

## 3. Phase breakdown

Phases below match the structure already in this repo's PR template (`.github/pull_request_template.md`) and `docs/BETA_PROTOTYPE_PLAN.md`, so existing PRs and QA checklists line up with this PRD without renaming anything.

### Phase 1 — Foundation & Onboarding

| Item | Status | Remaining work |
|---|---|---|
| Character creation on signup | Per handover doc, shipped in the demo snapshot (B) | Verify present and working in production (A) once P0 is fixed; port if missing |
| First-load guide/intro overlay (`WelcomeOverlay.tsx`) | Component exists | Verify it fires once, not on every login, in (A) |
| SPARK AI chat | **CONFIRMED WORKING** — `components/world/SparkChat.tsx` → `app/api/agents/spark/chat/route.ts` calls the real Anthropic SDK (`claude-haiku-4-5-20251001`, streaming), gated behind real auth, with a graceful fallback message on error | None identified — lowest-risk item in this whole PRD. Re-verify after P0 fix that the chat UI still mounts correctly given the `page.tsx` changes. |
| Chapter 0/1 story quests, cinematic intro | Shipped in demo snapshot (B) per handover §8 | Not present in production (A) — needs porting if (A) is the target |

### Phase 2 — Quest System

| Item | Status | Remaining work |
|---|---|---|
| Quest completion API (`/api/quests/complete`) | **CONFIRMED WORKING** — real Prisma transaction: validates prerequisites, records completion, awards XP/currency | None |
| XP/level award API (`/api/world/award`) | **CONFIRMED WORKING** — real Prisma upsert with level-up bonus logic | None |
| Quest-giver NPCs & markers (`OpenWorldScene.ts`) | Defined for math/science/business buildings | Blocked end-to-end verification by P0; re-test once fixed |
| Quest UI (`QuestLog`, `QuestTracker`, `QuestOfferDialog`) | Components exist, wired into `page.tsx` (once imports are fixed) | Manual playtest after P0: accept a quest, see it in the log, complete it, confirm XP/coins land |
| `docs/CAMPUS_WORLD_MANUAL_TEST_PLAN.md` | Stale — predates the Phase 2 quest UI rename, only Suites 1-3 were ever run (and only as unfilled templates) | Rewrite against current UI once P0 is fixed; actually execute it this time and record real pass/fail per row |

### Phase 3 — Campus Zones

| Item | Status | Remaining work |
|---|---|---|
| Math building interior (`MathBuildingScene.ts`) | **CONFIRMED WORKING** — 5 real stations mapped to real catalog games (`pizza-fraction-frenzy`, `math-race-rally`, `multiplication-bingo-bonanza`, `number-monster-feeding`, `math-jeopardy-junior`), embeds via `AdventureEmbed`, awards XP on completion via `/api/world/award` | Re-verify after P0 fix; otherwise done |
| Science building interior ("Discovery Lab") | **STUBBED ONLY** — `OpenWorldScene.ts` has building geometry and a quest-giver entry, but no interior scene exists. The only "content" is a "Coming Soon!" dialog line, and it's in dead code (`WorldScene.ts`, not wired into `game/main.ts`) — so even the placeholder isn't currently reachable | Build a real interior scene (Fable 5.1 task — Phaser scene work) with its own set of embedded science mini-games, following the `MathBuildingScene.ts` pattern |
| English/business building interior ("Story Grove" / library) | **STUBBED ONLY** — same situation as science | Same treatment — new interior scene + embedded English/language-arts games |
| "Coming soon" door state | Confirmed as an intentional, modeled state (`TilemapGenerator.ts:60`, `targetScene: null`), not just leftover text | Once science/English interiors exist, remove their "coming soon" flag in the tilemap data |
| Character sprite animation | **PLACEHOLDER** — `Player.ts:53,232` explicitly notes walk-cycle animation isn't wired up yet, despite real sprite sheets already existing on disk (`public/game-assets/sprites/`, 6 real character spritesheets) | Wire up proper animation states (idle/walk in 4 directions) from the existing spritesheets — Fable 5.1 task |
| Campus tileset/props | **Real assets already present** — `public/game-assets/modern/` (LimeZu-style tileset + 25+ props: basketball court, fountain, vending machines, etc.) and `public/game-assets/rcc/`. `COMPREHENSIVE_PLATFORM_PLAN.md`'s claim that these are still pending is stale. | No asset-sourcing work needed. See the licensing risk in §5 — this is a legal item, not a build item. |

### Phase 4 — Economy & Rewards

| Item | Status | Remaining work |
|---|---|---|
| Shop routes (`/api/shop/items`, `/api/shop/purchase`) | **CONFIRMED WORKING** — real routes, no TODO/mock found | None found at the API layer |
| Inventory routes (`/api/inventory`, `/api/inventory/equip`) | **CONFIRMED WORKING** | None found at the API layer |
| Shop/Inventory UI (`ShopModal.tsx`, `InventoryPanel.tsx`, `DemoShop.tsx`) | Components exist | Manual playtest after P0: purchase an item, confirm coin balance updates, confirm cosmetic equips on the player sprite (this last part depends on the animation work in Phase 3 landing first) |
| Jobs system (`/api/jobs`, `JobBoard.tsx`) | API layer has no TODO/mock hits | Manual playtest after P0 |

### Phase 5 — Polish & Beta Readiness

| Item | Status | Remaining work |
|---|---|---|
| Manual QA pass | Last real pass predates current UI (see Phase 2) | Full re-run of a rewritten manual test plan once Phases 1-4 land |
| Mobile HUD/collision | Flagged as a known gap in `GATHER_DEMO_FUTURE_FEATURES.md`'s parking lot | Scope and fix once desktop flow is stable |
| Sound for interactive moments (e.g. Null Run in the demo snapshot) | Flagged as not-yet-done in the demo snapshot's own parking lot | Low priority; only relevant once (B) is resynced from (A) |
| Snapshot resync — `demo/la-campus-demo/` | Currently frozen pre-P0-bug, pre-Phase-2 | Once (A) is fixed and Phases 1-4 land, manually resync the snapshot per the documented procedure in `GATHER_DEMO_FUTURE_FEATURES.md` so the public demo reflects the real product again |
| `docs/campus-demo-stakeholder-guide.md` | Stale — documents a `/world/campus?demo=1` no-login mode that does not exist in the current code | Either build that mode for real (useful for stakeholder walkthroughs without needing a login) or delete/rewrite the doc to match reality — recommend building it, since a no-login stakeholder path is genuinely valuable for demos and grant reviews |

---

## 4. Explicitly out of scope for this PRD

- `demos/campus-sim-demo/` — separate track, not touched unless you decide to bring it in scope.
- The catalog/LMS track (subjects, dashboard, ~64 catalog entries with no playable content behind them) — this was scoped out when you chose the campus-world track as the target for this PRD. A separate PRD would be needed if you want that addressed too.
- AI Agent Studio content-generation pipeline (`lib/agents/BaseAgent.ts` and friends) — largely stubbed, but unrelated to the campus world experience itself; SPARK's chat already has its own working, separate LLM integration.

---

## 5. Risks

1. **Asset licensing (real, unresolved, non-code)**: the campus tileset/props/sprites in `public/game-assets/` come from LimeZu (forbids raw-asset redistribution outside private use) and RCC (ships with no license file at all). The repo must stay private until these are replaced with original or properly licensed/commissioned art. This is a business decision, not an engineering task — flag it to whoever owns that call before any public, non-Vercel-gated distribution of this code.
2. **Doc sprawl will keep recurring** unless this PRD and the prompting guide are actually kept up to date (see the last section of `docs/OPUS_FABLE_PROMPTING_GUIDE.md`). The pattern that caused this reconciliation exercise — a doc claiming "fully built and live" for one artifact while readers assume it means all of them — will repeat if future sessions don't scope their status claims precisely.
3. **The two-artifact split (A vs B) is itself a source of drift.** Every feature built in (A) needs a manual resync into (B) to reach the public demo; there's no automation. If that resync step is skipped repeatedly, (B) will silently fall further behind, and stakeholders will eventually be shown something that doesn't reflect the real product.

---

## Appendix A — Doc reconciliation (what's current, what's not)

| Doc | Status | Notes |
|---|---|---|
| `CLAUDE_SUCCESSOR_HANDOVER.md` | Accurate, but scoped to artifact (B) only | Good source for engineering practices (EventBus pattern, verification discipline) even though its feature claims don't extend to (A) |
| `GATHER_DEMO_FUTURE_FEATURES.md` | Accurate for (B), misleading if read as covering (A) | Its "Snapshot sync procedure" section is the reference for keeping (B) current going forward |
| `GATHER_ASSET_INTEGRATION_GUIDE.md` | Still useful as a licensing/sourcing reference | Not a status doc |
| `GATHER_BROWSER_DEMO_PLAN.md`, `GATHER_BROWSER_PROMPTS.md`, `GATHER_CLONE_STRATEGY.md`, `GATHER_FABLE_5DAY_SPRINT.md`, `GATHER_SIMULATED_STUDENTS_PLAN.md` | Superseded / historical | Written before Phase 2 quests and the Chapter 0/1 sandbox work; describe plans, not current state |
| `2D_GAME_WORLD_PLAN.md` | Oldest doc (2026-05-28), but ironically the most accurate description of what `MathBuildingScene.ts` actually became | Keep as historical reference for the original math-building concept |
| `docs/CAMPUS_WORLD_MANUAL_TEST_PLAN.md` | Stale, effectively un-executed | Rewrite and actually run after P0 + Phase 2 land |
| `docs/campus-demo-stakeholder-guide.md` | Stale — documents a feature (`?demo=1`) that doesn't exist | Rewrite once/if that mode is built (see Phase 5) |
| `COMPREHENSIVE_PLATFORM_PLAN.md` (campus-world sections) | Stale on asset status specifically (claims Sorceress assets still pending; they're not — real LimeZu/RCC assets are already in place) | Update its campus-world status lines to point here instead of duplicating status |
