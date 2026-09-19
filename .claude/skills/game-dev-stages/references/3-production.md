# Stage 3 — Production

**Question:** Can you build it without losing the thing that made it good?

Production is the longest and most expensive stage. Most of the time and most of the money go
here, and this is where the ideas from pre-production get their real test.

---

## The Work

| Discipline | Production output |
|------------|------------------|
| **Developers / designers** | The world itself — environments coded and crafted to serve story, art direction, and mechanics simultaneously. Systems, tools, content pipelines. |
| **Character art** | Main characters and NPCs designed, modelled/drawn, rigged, animated. |
| **Voice** | Recording sessions — and re-records, because finding the right tone takes passes. |
| **Audio** | Soundtrack plus the full effects range: menu bleeps, footsteps, creaking floorboards, ambience, UI feedback. |
| **Writing** | Script cleanup and the long tail of copy — NPC names, item descriptions, tutorial text, error strings, store copy. |

Build in the order that keeps the game playable: **critical path first, then breadth, then
polish.** A game that is playable end-to-end at low quality can be cut down; a game that is
half-built at high quality cannot ship.

---

## Running Production Well

**Keep a playable build at all times.** If main is broken for more than a day, that's the
highest-priority bug in the project.

**Track content against the pre-production asset list.** Progress is "38 of 60 levels at final
quality", not "going well".

**Feed the scope ledger.** Production is where the tough calls land. Two shapes:

- *Small swaps* — Spyro's Balloonist was a Viking Boatman during production; changed because a
  boat makes no sense ferrying you to a floating sky island. Cheap, improves the game, do it.
- *Whole-segment cuts* — Simpsons Hit & Run cut dozens of cars, models, house interiors, and two
  entire levels to protect the schedule. Painful, necessary, and the right call when the
  alternative is shipping everything at half quality.

Both go in the ledger with a reason. Deferred items become the DLC and free-update candidates
in stage 7.

**Guard the pillars.** Every new feature request gets checked against the three pillars from
planning. Serves no pillar → defer or cut. This is what the pillars are for.

**Watch for the re-plan.** If someone proposes changing genre, dimension, art style, a core
mechanic, or the engine, stop. That's a return to stage 1, with a re-costed budget and schedule.
Name it as such rather than absorbing it silently.

---

## Start Testing Inside Production

Testing is stage 4, but it does not begin the day production ends. From the first playable
build: automated tests on systems that can carry them, a regular internal play session, and a
running bug list. Entering stage 4 with a clean-ish build is the difference between a testing
phase and a rescue operation.

---

## Deliverables

- Feature-complete build (every system present, content possibly incomplete)
- Content-complete build (every asset in, at final quality)
- Updated `docs/game/scope-ledger.md`
- Updated `docs/game/gdd.md` — the doc reflects the game as built, not as imagined
- Bug database with severity levels

---

## Exit Criteria

- [ ] Feature complete — no unimplemented systems
- [ ] Content complete — asset list fully delivered or explicitly cut
- [ ] Game completable start to finish without developer intervention
- [ ] All placeholder art and audio replaced or knowingly accepted
- [ ] Localisation strings externalised if shipping in more than one language
- [ ] Performance within target on the lowest supported hardware
- [ ] Scope ledger current; deferred list captured as post-launch candidates
- [ ] No open re-plan questions about the fundamentals

**Do not enter testing** with known-missing content. Testers will spend their passes
rediscovering what you already know is absent.
