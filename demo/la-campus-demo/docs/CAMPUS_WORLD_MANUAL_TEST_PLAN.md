# Campus World Manual Test Plan

**Feature:** Campus World v1 layout  
**Primary route:** `http://localhost:3000/world`  
**Recommended test account:** `student@test.com` / `password123`

Use this plan to verify the new campus world after layout, zone, building, NPC, minimap, or scene-transition changes.

---

## Current Test Status

- Test Suite 1 - Login And World Boot: PASS
- Test Suite 2 - Spawn And Save Migration: PASS
- Test Suite 3 - Campus Zones: PASS
- Continue testing from Test Suite 4 - Buildings And Interactions

---

## Setup

1. Confirm `.env.local` contains the required local values:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CHILD_SESSION_SECRET`
2. Install dependencies if needed:
   ```bash
   npm ci
   ```
3. Generate Prisma client:
   ```bash
   npm exec prisma -- generate
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000` in a fresh browser profile or private window.
6. Keep DevTools open on the Console tab and note any red errors.

---

## Test Suite 1 - Login And World Boot - PASS

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Open `http://localhost:3000/world` while logged out | Redirects to `/login?callbackUrl=/world` | | |
| 2 | Log in as `student@test.com` / `password123` | Login succeeds | | |
| 3 | Wait for `/world` to load | The campus canvas renders, not a blank page | | |
| 4 | Confirm HUD appears | Player name, level, XP, coins, Bag, Shop, Quests, Exit World, SPARK, controls hint, and minimap are visible | | |
| 5 | Check Console | No blocking Phaser, React, auth, or API errors | | |

---

## Test Suite 2 - Spawn And Save Migration - PASS

The seeded student currently has a legacy `WorldScene` saved position. This should normalize into the new Main Hub.

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Log in as the seeded student | Player spawns in the new campus, not an old/blank scene | | |
| 2 | Observe the minimap label | Active zone starts at or quickly updates to `Main Hub` | | |
| 3 | Move a few steps with WASD or arrow keys | Camera follows smoothly and the player remains visible | | |
| 4 | Refresh the page | World reloads without crashing | | |
| 5 | Move again after refresh | Movement, camera, and HUD still work | | |

---

## Test Suite 3 - Campus Zones - PASS

Verify that each v1 zone exists, is reachable, and updates the minimap/zone label.

| Zone | Direction From Main Hub | Expected Result | Pass/Fail | Notes |
|------|--------------------------|-----------------|-----------|-------|
| Main Hub | Start area | Green central campus area; Quest Board nearby | | |
| Math Hall | West | Purple/math zone appears; Math Hall building and Professor Numbers are visible | | |
| Discovery Lab | North | Teal/science zone appears; Discovery Lab and Dr. Spark are visible | | |
| Story Grove | East | Pink/story zone appears; Story Grove and Story Sage are visible | | |
| Commons | South | Amber/commons zone appears; Campus Shop and Commons Host are visible | | |

Additional checks:

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Walk between zones using paths | Player can travel without getting stuck on invisible walls | | |
| 2 | Watch the minimap while crossing zone boundaries | Highlight and label update to the current zone | | |
| 3 | Walk to each map edge | Camera respects world bounds; no void/blank area appears | | |

---

## Test Suite 4 - Buildings And Interactions

| Building | Location | Action | Expected Result | Pass/Fail | Notes |
|----------|----------|--------|-----------------|-----------|-------|
| Math Hall | West zone | Walk through the door | Enters `MathBuildingScene` | | |
| Discovery Lab | North zone | Stand near marker and press Space | Placeholder dialog appears; no scene crash | | |
| Story Grove | East zone | Stand near marker and press Space | Placeholder dialog appears; no scene crash | | |
| Quest Board | Main Hub | Stand near board and press Space | Quest Board modal opens | | |
| Campus Shop | Commons | Stand near shop and press Space | Shop modal opens | | |

Regression checks:

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Open Shop from the HUD button | Shop modal opens and can close | | |
| 2 | Open Quests from the HUD button | Quest Board opens and can close | | |
| 3 | Open Bag from the HUD button | Inventory opens and can close | | |
| 4 | Open SPARK | Chat panel opens over the world without breaking movement after close | | |
| 5 | Press Escape or close controls where available | Modal closes cleanly or remains stable if Escape is unsupported | | |

---

## Test Suite 5 - Math Hall Interior Loop

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Enter Math Hall from the campus | Math Hall interior loads | | |
| 2 | Verify player avatar | Avatar renders; invalid saved avatar falls back safely | | |
| 3 | Talk to Professor Numbers | He introduces Math Race Rally and opens the Quest Board after the handoff | | |
| 4 | Start Math Race Rally from the Quest Board | Math Race Rally opens as an embedded activity | | |
| 5 | Complete Math Race Rally | Awards 100 XP and unlocks the Math Explorer badge on first completion | | |
| 6 | Interact with other available math stations | Activity/adventure opens | | |
| 7 | Close or complete an activity | Returns to the Math Hall flow without crashing | | |
| 8 | Walk through the Math Hall exit | Returns to `OpenWorldScene` near the Math Hall door | | |
| 9 | Move after returning | Player can move and camera follows | | |

---

## Test Suite 6 - NPC Dialog

| NPC | Zone | Action | Expected Result | Pass/Fail | Notes |
|-----|------|--------|-----------------|-----------|-------|
| Jaylen | Main Hub | Stand near NPC and press Space | Dialog introduces campus loop and Quest Board | | |
| Professor Ivy | Main Hub | Stand near NPC and press Space | Dialog sends the student to Professor Numbers for the first quest | | |
| Professor Numbers | Math Hall | Stand near NPC and press Space | Dialog introduces Math Race Rally and the 100 XP / Math Explorer reward | | |
| Dr. Spark | Discovery Lab | Stand near NPC and press Space | Dialog previews future Discovery Lab quests | | |
| Story Sage | Story Grove | Stand near NPC and press Space | Dialog previews reading/writing quests | | |
| Commons Host | Commons | Stand near NPC and press Space | Dialog previews shop/rewards/social spaces | | |

Dialog quality checks:

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Open and close each dialog | Dialog appears above the game layer and closes cleanly | | |
| 2 | Move away and return to an NPC | Prompt/dialog can be triggered again | | |
| 3 | Trigger NPC dialog after opening another modal | No stuck overlays or duplicate dialogs | | |

---

## Test Suite 7 - Visual And Collision QA

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Review each zone at normal zoom | Buildings, labels, NPCs, and paths are readable | | |
| 2 | Walk around every building footprint | Walls block the player where expected; doors/markers remain reachable | | |
| 3 | Walk along north/south/east/west paths | No one-tile traps, gaps, or unreachable zones | | |
| 4 | Observe chunk streaming while moving long distances | No visible flicker, blank chunks, or missing collision | | |
| 5 | Resize browser to tablet width | HUD remains readable and does not cover critical interaction prompts | | |
| 6 | Resize browser to phone width | Game remains usable enough for smoke testing; no text overlap in HUD buttons | | |

---

## Test Suite 8 - API And Persistence

| Step | Action | Expected Result | Pass/Fail | Notes |
|------|--------|-----------------|-----------|-------|
| 1 | Open Network tab and load `/world` | `/api/character` returns 200 for logged-in student | | |
| 2 | Open `/world` as logged-out user | Protected route redirects to login | | |
| 3 | Move around for at least 10 seconds | Position save requests do not spam errors in Console | | |
| 4 | Refresh after moving to another zone | Character remains valid; world reloads without bad avatar/scene errors | | |
| 5 | Test legacy saved scene value if available | `WorldScene` saved positions spawn in Main Hub, not at invalid old coordinates | | |

---

## Test Suite 9 - Browser Coverage

| Browser/Viewport | Expected Result | Pass/Fail | Notes |
|------------------|-----------------|-----------|-------|
| Chrome or Edge desktop, 1280x800 | Full campus flow works | | |
| Chrome or Edge desktop, 1920x1080 | HUD spacing remains balanced | | |
| Mobile emulation, 390x844 | HUD, modals, and controls remain readable | | |
| Reduced-motion OS/browser setting | UI remains usable; no motion-dependent tasks | | |

---

## Quick Regression Checklist

Use this shorter checklist for every campus-world PR.

- [ ] `/world` redirects unauthenticated users to login.
- [ ] `student@test.com` can log in and reach `/world`.
- [ ] Phaser campus canvas renders.
- [ ] HUD renders: player name, level, XP, coins, Bag, Shop, Quests, Exit World, SPARK, controls hint.
- [ ] Minimap renders five zones and updates zone label.
- [ ] Main Hub, Math Hall, Discovery Lab, Story Grove, and Commons are reachable.
- [ ] Walking through the Math Hall door enters the Math Hall interior.
- [ ] Walking through the Math Hall exit returns to the campus.
- [ ] Quest Board opens the Quest Board modal.
- [ ] Professor Ivy directs the student to Professor Numbers.
- [ ] Professor Numbers starts the Math Race Rally quest handoff.
- [ ] Math Race Rally completion awards 100 XP.
- [ ] Math Explorer badge unlocks on first Math Race Rally quest completion.
- [ ] Campus Shop opens the Shop modal.
- [ ] Bag opens inventory.
- [ ] SPARK opens and closes without breaking the game.
- [ ] Jaylen, Professor Ivy, Professor Numbers, Dr. Spark, Story Sage, and Commons Host can show dialog.
- [ ] Player cannot walk through building walls.
- [ ] Player does not get stuck on paths or door approaches.
- [ ] Legacy `WorldScene` saved positions normalize to Main Hub.
- [ ] Invalid avatar IDs fall back to a safe player sprite.
- [ ] Browser Console has no blocking red errors.
- [ ] `npm run build` passes before sign-off.

---

## Known Non-Blocking Items

- Discovery Lab and Story Grove are placeholder destinations in v1.
- NPCs currently use simple marker textures rather than final character art.
- The Quest Board may show no available quests if the database has not been seeded with quest/job records.
- The minimap is functional but intentionally compact; it is not a full-screen map.
- Google Font download warnings in restricted local environments are acceptable if fallback fonts render and the build still passes.

---

## Sign-Off

| Role | Name | Date | Result | Notes |
|------|------|------|--------|-------|
| QA | | | | |
| Design | | | | |
| Engineering | | | | |
