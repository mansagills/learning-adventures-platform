---
name: game-dev-stages
description: Run a game project through the seven stages of game development — Planning, Pre-production, Production, Testing, Pre-launch, Launch, Post-launch. Use when starting a new game, deciding what to work on next, checking whether a game is ready to move to the next stage, or when the user mentions game scope, proof of concept, vertical slice, playtesting, fun factor, beta, release, DLC, or patches. Routes to a specialist agent per stage.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# The Seven Stages Of Game Development

> Stage model from GameMaker's "The Seven Stages Of Game Development" (Ross Bramble, 2023).
> This skill turns that model into a working process: each stage has an owner agent,
> required deliverables, and hard exit criteria you must meet before advancing.

---

## The Stages

| # | Stage | Question it answers | Owner agent |
|---|-------|--------------------|-------------|
| 1 | Planning | What is this game, and can we afford to build it? | `game-planning-lead` |
| 2 | Pre-production | Does the idea survive contact with a prototype? | `game-preproduction-lead` |
| 3 | Production | Build the actual game. | `game-production-lead` |
| 4 | Testing | Is it stable, and is it fun? | `game-testing-lead` |
| 5 | Pre-launch | Will anyone know it exists? | `game-prelaunch-lead` |
| 6 | Launch | Ship it, carefully. | `game-launch-lead` |
| 7 | Post-launch | Keep it alive. | `game-postlaunch-lead` |

The stages overlap in practice — production and testing especially. What must not overlap is
**decisions**: a fundamental locked in stage 1 or 2 that gets reopened in stage 3 is the single
most expensive mistake in the model. Conker's Bad Fur Day changed tone during production and paid
for it with two extra years.

---

## How To Use This Skill

### Step 1 — Locate the project in the stage model

Ask, or infer from the repo:

- No code, no design doc → **Planning**
- Concept written, nothing playable → **Pre-production**
- Prototype proved fun, building content → **Production**
- Feature complete, hunting bugs → **Testing**
- Stable beta build exists → **Pre-launch**
- Release date set → **Launch**
- Shipped → **Post-launch**

If the project claims a stage but hasn't met the prior stage's exit criteria, say so. Skipping
backwards later costs more than pausing now.

### Step 2 — Read that stage's reference

| Stage | Reference |
|-------|-----------|
| Planning | `references/1-planning.md` |
| Pre-production | `references/2-preproduction.md` |
| Production | `references/3-production.md` |
| Testing | `references/4-testing.md` |
| Pre-launch | `references/5-prelaunch.md` |
| Launch | `references/6-launch.md` |
| Post-launch | `references/7-postlaunch.md` |

### Step 3 — Delegate to the stage's owner agent

Spawn the owner agent from the table above when the work is substantial (a full concept doc, a
prototype plan, a test pass, a launch checklist). Handle small in-stage questions yourself using
the reference file.

Agents live in `.claude/agents/`. Invoke with the Agent tool, e.g.
`subagent_type: "game-planning-lead"`.

### Step 4 — Gate before advancing

Every reference file ends with **Exit Criteria**. Do not declare a stage complete without
walking that list item by item and stating which items are met, which are not, and what the
gap is. An unmet criterion is a decision for the user, not something to wave through.

---

## Stage Artifacts

The skill expects these to accumulate in `docs/game/` (create it if absent):

```
docs/game/
  concept.md          # Stage 1 — genre, hook, pillars, answers to the big six
  proof-of-concept.md # Stage 1 — cost, funding, timeline, team, monetisation, platforms
  gdd.md              # Stage 2 — the living design doc
  tech-constraints.md # Stage 2 — engine limits the team must design within
  scope-ledger.md     # Stages 2-3 — what's in, what's cut, what's deferred
  test-plan.md        # Stage 4 — stability matrix + fun-factor protocol
  launch-checklist.md # Stages 5-6
  post-launch-plan.md # Stage 7 — patch cadence, DLC, balance
```

Templates for each are in `templates/`.

---

## Non-Negotiables

1. **Answer the big six before writing code.** Genre, 2D/3D, art style, core mechanics,
   protagonist/antagonist, engine. Changing any of these after pre-production is a re-plan,
   not a tweak — call it that.
2. **A proof of concept is a budget, not a demo.** Cost, funding, timeline, team, monetisation,
   platforms. Without those numbers you have a wish.
3. **Fun is a test criterion.** A stable game that isn't fun failed testing. Test the fun factor
   explicitly and separately from stability.
4. **Cut early, cut loudly.** Every cut goes in the scope ledger with a reason. Cuts made in
   pre-production are free; cuts made in production cost whatever you already spent.
5. **Late changes are allowed but escorted.** Sonic's ring-based health landed two weeks before
   ship. That's a real option — with a rollback plan and a regression pass, not on a hunch.
6. **The solo dev wears all the hats, not none of them.** If working alone, run each role's
   checklist in pre-production anyway; the constraints don't disappear because there's no one
   to voice them.

---

## Common Failure Modes

| Symptom | Actual stage problem |
|---------|---------------------|
| "We'll figure out the art style once it's playable" | Planning skipped |
| Prototype keeps growing new features | Pre-production never closed |
| Six months in, still no vertical slice | Production without a scope ledger |
| "It's basically done, just needs polish" | Testing not started |
| Ship date set, no trailer, no store page | Pre-launch skipped |
| Day-one patch bigger than the game | Testing exit criteria waived |
| Player counts crater in week two | No post-launch plan |
