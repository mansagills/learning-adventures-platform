# Stage 2 — Pre-production

**Question:** Does the idea survive contact with a prototype?

Pre-production is where ideas take form and where most of them die. The decisions made here are
the roots of the whole project — everything in production grows from them.

---

## The Work

**Scope it. Storyboard it. Prototype it. Cut it.**

### 1. Prototype the risk, not the game

Build the smallest thing that can prove or kill the riskiest assumption. Usually that's "is the
core mechanic fun?" — but it may be "can the engine render this at 60fps?" or "does the puzzle
generator produce solvable levels?"

A prototype is disposable. Say so out loud before starting, or it silently becomes the codebase.

Prototype rules:
- Placeholder art always. Programmer squares. No exceptions — pretty prototypes hide bad feel.
- One question per prototype, written down before you start.
- Timeboxed. When the box ends, answer the question: **yes, no, or needs another box.**

### 2. Vertical slice

Once the core proves out, build one small piece of the real game at final quality: one level,
one enemy, one full loop with real art, real audio, real UI. The vertical slice is the honest
answer to "what will this game actually be like," and it's what you show funders.

### 3. Run every role's checklist

Even solo — especially solo. Each discipline must state its constraints *now*, while changing
them is still free.

| Role | Must lock down |
|------|----------------|
| **Artists** | Art style, colour palette, and that both match theme and genre. A sinister horror game does not get a bright summery palette. Asset pipeline, resolution targets, animation budget. |
| **Developers** | Mechanics and physics. How objects, models, and entities are processed. Data formats. Save system. Anything a designer or writer will depend on. |
| **Engineers** | **The limits.** What the engine and target hardware cannot do — draw calls, entity counts, memory, load times, cinematic capability. This is the stage to say no, not during production. |
| **Writers** | Script, characters, world. Every one of these creates art assets, environments, and mechanics downstream, so the script's shape constrains the budget. |
| **Project lead** | Arbitration. Balance the teams' demands, make final calls, remove blockers, keep one shared version of the plan. |

Cross-discipline decisions get made jointly or they get made twice. If the writing team wants a
cinematic the engine can't render, that's resolved here, on paper.

### 4. The scope ledger

Open `docs/game/scope-ledger.md` now and never close it. Three columns: **In / Cut / Deferred**,
each with a one-line reason. Sacrifices are normal — it's rare that a game clears planning and
pre-production without them. Undocumented sacrifices come back as arguments in month eight.

---

## Deliverables

- `docs/game/gdd.md` — the living design doc (mechanics, systems, content list, UX, progression)
- `docs/game/tech-constraints.md` — engineering limits, written by whoever owns the engine
- `docs/game/scope-ledger.md` — in / cut / deferred
- Playable vertical slice
- Storyboards or level flow for the critical path

---

## Exit Criteria

- [ ] Riskiest assumption tested by prototype, and answered yes
- [ ] Vertical slice playable at intended final quality
- [ ] Art style and palette locked, with a style sheet
- [ ] Mechanics and physics locked; no "we'll decide during production" items on the critical path
- [ ] Engine constraints documented and acknowledged by design and writing
- [ ] Script and characters settled enough that the asset list is derivable
- [ ] Full asset list and content count (levels, enemies, items, minutes of audio, lines of dialogue)
- [ ] Production schedule built from that asset list — not from the calendar backwards
- [ ] Scope ledger open, with at least the first round of cuts recorded

**Do not enter production** until the vertical slice is fun. Production multiplies whatever you
have; multiplying a mediocre core just produces more of it.
