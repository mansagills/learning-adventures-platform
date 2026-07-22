# Simulated Students — Fake-Multiplayer Layer for Campus Demo

**Inspired by**: Erenshor's "SimPlayer" system — scripted NPCs that feel like real players without real networking or LLM costs.

**Goal**: Make the single-player browser demo *feel* like a populated campus with other students, without building multiplayer.

**Adds to**: [GATHER_BROWSER_DEMO_PLAN.md](GATHER_BROWSER_DEMO_PLAN.md) — treat this as Day 2.5 / bonus prompts, not a separate sprint.

---

## Design: What Makes It Feel "Alive"

Erenshor's trick isn't complex AI — it's **persistent-feeling scripted behavior** + **secondhand narrative** ("they told you they were in a dungeon"). Three techniques, adapted for campus:

### 1. Wandering NPC Students (Ambient Life)
- 8–12 NPC sprites patrol fixed paths between buildings (quad → library → cafeteria → back)
- Each has a name, a "subject interest" (Math, Science, etc.), and an idle animation
- They don't need pathfinding — pre-baked waypoint loops are enough

### 2. Stationed NPCs (Activity Illusion)
- NPCs "working" at objects — one sitting at a desk in the Math Tower, one at a telescope in Science Lab
- Reinforces that rooms are "in use," not empty stage sets
- Same trick as Erenshor SimPlayers "in a dungeon" — the player doesn't need to see the activity, just infer it

### 3. Scripted Interaction (No LLM Needed)
- Walk near an NPC → speech bubble triggers from a small scripted pool (not random chat spam, contextual to location)
- Example: near Math Tower NPC → "Ugh, this fraction homework is killing me 😩"
- Optional: player can "wave" (press E) → NPC waves back, maybe a canned line
- This is **exactly** Erenshor's approach: zero AI generation cost, all pre-written, still reads as "someone's here"

### 4. Secondhand Presence (Optional, Cheap Win)
- A campus "activity feed" widget (like a tiny corner ticker): *"Jordan finished the Algebra Challenge"*, *"Priya joined the Science Club"*
- Purely cosmetic, cycling through a scripted list — no simulation needed
- Sells the "other students exist and are doing things" feeling for near-zero implementation cost

---

## What NOT to Build (Scope Guard)

- ❌ No pathfinding AI — waypoint loops only
- ❌ No LLM-generated dialogue — scripted pools only (Erenshor's own reasoning: cost)
- ❌ No NPC-to-NPC simulated relationships — that's Erenshor's deep endgame system, way overkill for a demo
- ❌ No combat/quests — not needed for an educational campus

---

## Fable 5 Prompts (Add to Day 2 or Day 3)

### Prompt A: NPC Student Data + Waypoints
```
You are creating ambient NPC data for a campus exploration game.

Task: Create a JSON file (npcStudents.json) with 10 NPC students, each:
{
  id, name, spriteVariant (1-5, for reusing a small sprite set),
  waypoints: [{x, y}, ...] (3-4 points forming a patrol loop),
  moveSpeed: number,
  dialoguePool: [3-4 short, casual, contextual lines related to their "subject"]
  subject: one of Math/Science/English/History/Innovation
}

Make dialogue feel like real students (casual, funny, relatable), not generic NPC text.

Output: lib/npcStudents.json

Return JSON only, no explanation.
```

### Prompt B: NPC Wander/Patrol System
```
You are building an NPC movement system for a Phaser 3 scene.

Task: Create npcController.ts that:
1. Takes an array of NPC definitions (id, waypoints, moveSpeed)
2. For each NPC, moves their sprite along the waypoint loop (linear movement, loop back to start)
3. Flips sprite direction based on movement direction (left/right)
4. Exports a function createNPCs(scene, npcData) that spawns sprites and starts their patrol
5. Uses Phaser tweens or simple delta-time movement, whichever is simpler

Keep under 90 lines.
Use TypeScript.

Output: lib/npcController.ts

Return TypeScript code only, no explanation.
```

### Prompt C: Speech Bubble / Interaction System
```
You are adding scripted NPC dialogue to a Phaser 3 campus scene.

Task: Create npcDialogue.ts that:
1. Detects when player is within 60px of an NPC
2. Shows a small speech bubble (Phaser text + background rectangle) above the NPC with a random line from their dialoguePool
3. Bubble appears once per approach (not spamming every frame) — add a cooldown per NPC (~10 seconds)
4. Bubble auto-hides after 3 seconds
5. Exports checkNPCProximity(player, npcs) to call in scene update loop

Keep under 70 lines.
Use TypeScript.

Output: lib/npcDialogue.ts

Return TypeScript code only, no explanation.
```

### Prompt D: Activity Feed Widget (Optional, Cheap Win)
```
You are creating a cosmetic "campus activity feed" for a React overlay.

Task: Build ActivityFeed.tsx that:
1. Has a hardcoded array of ~15 activity messages (e.g., "Jordan finished the Algebra Challenge", "Priya joined the Science Club", "Marcus is exploring the History Museum")
2. Cycles through them one at a time, fading in/out, every 6 seconds (random order, no repeats until list exhausted)
3. Displays as a small ticker in the bottom-left corner, semi-transparent
4. Uses Tailwind CSS, subtle styling (shouldn't distract from gameplay)

Keep under 60 lines.
Use TypeScript + React.

Output: components/spatial/ActivityFeed.tsx

Return TypeScript/JSX code only, no explanation.
```

### Prompt E: Wire NPCs into CampusScene
```
You are integrating NPC students into the existing CampusScene.

Task: Add to CampusScene.ts:
1. Import npcStudents.json, npcController, npcDialogue
2. In create(), call createNPCs(this, npcStudentsData) to spawn all NPCs
3. In update(), call checkNPCProximity(player, npcs) each frame
4. Make sure NPC sprites render below player (correct depth/z-order)

Do NOT replace existing scene code — return only the snippet to add.
Keep under 40 lines.

Output: Return code snippet to add to CampusScene.ts

Return TypeScript code only, no explanation.
```

---

## Token Budget (Additive to Browser Demo Plan)

| Prompt | Task | Est. Tokens |
|--------|------|-------------|
| A | NPC data + dialogue pools | 2k |
| B | Patrol movement system | 2k |
| C | Speech bubble system | 1.5k |
| D | Activity feed (optional) | 1.5k |
| E | Scene integration | 1k |
| **Total** | | **~8k** |

Combined with the core browser demo (~12k), you're at **~20k total** — still comfortably under Fable 5 limits.

---

## Updated Deliverable

By end of Day 2/3, the demo now has:
- ✅ Player-controlled avatar exploring campus
- ✅ Interactive objects (whiteboards, books) with modals
- ✅ Progress tracking
- ✅ **10 NPC "students" patrolling campus, feeling alive**
- ✅ **Scripted speech bubbles when you walk near them**
- ✅ **Optional activity feed ticker showing "other students" doing things**

**Result**: A campus that feels populated and social — the core emotional hook of Gather.town — without a single line of networking code.

---

## Why This Matters for the Pitch

When you demo this, the narrative is:
> "This feels like other kids are here with you — exploring, chatting, working on stuff — but it's entirely client-side. No server costs, no multiplayer bugs, no LLM API bills. When we're ready to add *real* multiplayer, these NPCs become a fallback/filler layer so campus never feels empty even with low real user counts — exactly the same problem Erenshor solves for a solo player."

That last point is a legitimate long-term architecture insight: even in a real multiplayer version, keeping a SimStudent layer means the campus never feels dead during off-peak hours.
