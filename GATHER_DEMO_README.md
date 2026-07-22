# Gather Campus Browser Demo — Complete Plan & Prompts

**Branch**: `claude-demo-gather`  
**Duration**: 2–3 days (Fable 5, ~20k tokens)  
**Goal**: Single-player, browser-based campus exploration demo with simulated student NPCs

---

## 📋 What You're Building

A playable `/campus` route where students:
- Walk around a pixel-art campus with WASD/arrow keys
- Click on buildings/objects to interact (opens modals with content)
- See "other students" (scripted NPCs) patrolling campus, creating a multiplayer feel
- Progress is tracked locally (which rooms visited, shown in corner UI)
- No backend, no multiplayer networking — all client-side, Phaser 3 + localStorage

---

## 📁 Documents in This Branch (Read in Order)

### Phase 0: Planning & Assets (Read First)
1. **[GATHER_BROWSER_DEMO_PLAN.md](GATHER_BROWSER_DEMO_PLAN.md)** ← START HERE
   - 2–3 day sprint breakdown
   - What's built each day
   - Success criteria
   - Token budget

2. **[GATHER_ASSET_INTEGRATION_GUIDE.md](GATHER_ASSET_INTEGRATION_GUIDE.md)**
   - Download itch.io tilesets + sprites
   - Organize in public/assets/
   - Wire into Phaser
   - ~40 minutes, no coding required

### Phase 1: Core Game (Fable 5 Prompts)
3. **[GATHER_BROWSER_PROMPTS.md](GATHER_BROWSER_PROMPTS.md)** ← COPY-PASTE PROMPTS
   - 8 Fable 5 prompts (Prompts 1–8)
   - Day 1: Scene + movement (Prompt 1)
   - Day 2: Interaction + progress (Prompts 2–6)
   - Day 3: Polish (Prompts 7–8)
   - Each prompt is scoped for ~2–3k tokens

### Phase 2 (Bonus): Simulated Students (Fable 5 Prompts A–E)
4. **[GATHER_SIMULATED_STUDENTS_PLAN.md](GATHER_SIMULATED_STUDENTS_PLAN.md)** ← IF TIME ALLOWS
   - Inspired by Erenshor's SimPlayer system
   - 10 NPC students patrolling campus
   - Scripted speech bubbles
   - Activity feed ticker
   - 5 more Fable prompts (A–E), ~8k tokens
   - Makes single-player demo feel populated

### Reference (Strategy & Deep Dives)
5. [GATHER_CLONE_STRATEGY.md](GATHER_CLONE_STRATEGY.md) — Full multiplayer version (for context/future)
6. [GATHER_FABLE_5DAY_SPRINT.md](GATHER_FABLE_5DAY_SPRINT.md) — Original multiplayer sprint plan (for context/future)

---

## 🚀 Quick Start (Right Now)

```bash
# You're already on the branch, just need to set up folders
mkdir -p scenes lib/colyseus components/spatial public/maps public/assets/{tilesets,sprites}

# Install Phaser
npm install phaser
```

---

## 📅 Phase-by-Phase Checklist

### Phase 0: Assets (Manual, ~40 min)
- [ ] Read [GATHER_ASSET_INTEGRATION_GUIDE.md](GATHER_ASSET_INTEGRATION_GUIDE.md)
- [ ] Download itch.io tilesets + sprites (Step 1–2)
- [ ] Organize in `public/assets/` (Step 3–4)
- [ ] Create tileset metadata JSON (Step 5)
- [ ] Update campus.json (Step 6)
- [ ] Test locally: assets load, no console errors

### Phase 1: Core Game (Fable 5, ~2–3 days)
**Day 1: Phaser Scene + Movement**
- [ ] Use Fable 5, run **Prompt 1** → `scenes/CampusScene.ts`
- [ ] Create stub `public/maps/campus.json` (use template from GATHER_BROWSER_DEMO_PLAN.md)
- [ ] Test: Move avatar with WASD, camera follows, collision works
- [ ] Commit: `feat(phaser): campus scene with movement`

**Day 2: Interaction & Progress**
- [ ] Run **Prompts 2–6** (interactive zones, modals, progress tracker, UI, integration)
- [ ] Wire everything into CampusScene
- [ ] Test: Click objects, modals appear, progress updates, localStorage persists
- [ ] Commit: `feat(interaction): objects, modals, progress tracking`

**Day 3 (Optional): Polish & Integration**
- [ ] Run **Prompts 7–8** (Next.js page, campus data)
- [ ] Swap in real itch.io tilesets (from Phase 0)
- [ ] Test full flow: sign in → `/campus` → explore → progress saves
- [ ] Commit: `feat(campus): real assets, Next.js integration`

### Phase 2 (Bonus): Simulated Students (Fable 5, ~1 day)
**If time allows after Phase 1:**
- [ ] Read [GATHER_SIMULATED_STUDENTS_PLAN.md](GATHER_SIMULATED_STUDENTS_PLAN.md)
- [ ] Run **Prompts A–E** (NPC data, patrol system, speech bubbles, activity feed, integration)
- [ ] Test: Walk near NPCs, see speech bubbles, activity ticker appears
- [ ] Commit: `feat(simulated-students): NPCs, dialogue, activity feed`

---

## 🎯 What You'll Have by End

**By EOD Day 2**:
- ✅ Playable single-player campus exploration
- ✅ Interactive objects with modals
- ✅ Progress tracking (localStorage)
- ✅ Works at `localhost:3000/campus`

**By EOD Day 3 (optional)**:
- ✅ Real pixel-art tilesets from itch.io
- ✅ Integrated into Next.js Learning Adventures app
- ✅ User auth required
- ✅ Demo-ready screenshots

**With Phase 2 (bonus)**:
- ✅ 10 NPC "students" patrolling campus
- ✅ Feels like other students are present
- ✅ Activity feed shows "other students" doing things

---

## 🔑 Key Files You'll Create

```
scenes/
└── CampusScene.ts (Phaser 3 scene)

lib/
├── interactiveZones.ts (click detection)
├── useProgressTracker.ts (localStorage hook)
├── proximityEngine.ts (distance calc, optional for simulated students)
├── npcController.ts (NPC patrol system, optional)
├── npcStudents.json (NPC data, optional)
└── campusData.json (buildings + dialogue)

components/spatial/
├── InteractionModal.tsx (modal UI)
├── ProgressOverlay.tsx (progress UI)
├── ActivityFeed.tsx (activity ticker, optional)
└── CampusGame.tsx (Phaser container)

public/
├── assets/
│   ├── tilesets/
│   │   ├── campus_outdoor.png (from itch.io)
│   │   └── tileset_metadata.json
│   └── sprites/
│       └── player_avatars.png (from itch.io)
└── maps/
    └── campus.json (Tiled export)

app/
└── campus/
    └── page.tsx (Next.js route)
```

---

## 💡 Tips for Phase 1 (Fable 5)

1. **Keep prompts short** — Each one in [GATHER_BROWSER_PROMPTS.md](GATHER_BROWSER_PROMPTS.md) is scoped to 2–3k tokens
2. **Copy-paste exactly** — Prompts are word-for-word ready to use
3. **Test after each day** — Don't batch all prompts, test locally after Day 1 and Day 2
4. **Save tokens for Phase 2** — You have ~20k available, using ~12k for core demo leaves 8k for simulated students
5. **Git commit daily** — Push to avoid losing work

---

## 🎮 Inspiration: Erenshor

The "Simulated Students" feature (Phase 2) is inspired by **Erenshor**, a single-player MMO that uses "SimPlayers" (scripted NPCs) to create a multiplayer feel without networking.

**Key insight**: No LLM needed — just scripted dialogue pools + waypoint-based movement = feels populated.

See [GATHER_SIMULATED_STUDENTS_PLAN.md](GATHER_SIMULATED_STUDENTS_PLAN.md) for design details.

---

## ⏱️ Timeline

- **Phase 0 (Assets)**: 40 min (manual, anytime)
- **Phase 1 (Core)**: 2–3 days, Fable 5
- **Phase 2 (Bonus)**: 1 day, Fable 5 (if time allows)
- **Total Fable 5**: ~20k tokens (well under limit)

---

## 🚢 When to Ship

- **EOD Day 2**: Core demo works, playable, ready to show
- **EOD Day 3**: Polished with real assets, integrated into Learning Adventures
- **With Phase 2**: Feels like a real multiplayer campus — ready for team feedback

---

## 📞 Next Steps (When Usage Resets)

1. Read [GATHER_BROWSER_DEMO_PLAN.md](GATHER_BROWSER_DEMO_PLAN.md) (5 min)
2. Do Phase 0 assets setup (40 min, no coding)
3. Switch to Fable 5 model
4. Copy Prompt 1 from [GATHER_BROWSER_PROMPTS.md](GATHER_BROWSER_PROMPTS.md)
5. Create `scenes/CampusScene.ts`
6. Test locally
7. Move to Prompt 2 next day

---

## 🎓 Learning Resources (If Curious)

- [Phaser 3 Docs](https://phaser.io/)
- [Tiled Map Editor](https://www.mapeditor.org/)
- [itch.io collections](https://itch.io/c/1904339)
- [Erenshor (inspiration)](https://erenshor.com/)

---

**Ready to start? Begin with [GATHER_BROWSER_DEMO_PLAN.md](GATHER_BROWSER_DEMO_PLAN.md) when your usage resets.**
