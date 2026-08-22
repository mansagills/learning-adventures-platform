# Stage 6 — Launch

**Question:** Is the final coat of polish on, and can you ship without breaking it?

Release day is close. This stage is polish and risk management — nothing else.

---

## What Launch Stage Is For

1. **Squash remaining bugs, in priority order.** Studios keep the known-bug list ranked:
   game-breakers affecting stability and performance at the top, minor cosmetic issues at the
   bottom. Work top-down and stop when the risk of fixing exceeds the cost of the bug.
2. **Simple quality-of-life improvements.** Cheap, contained, high perceived value: remappable
   keys, a skip button on the intro, clearer tooltips, a difficulty option, better checkpointing.
3. **Final artistic touches.** Last polish pass on models, environments, lighting, UI, audio mix.

---

## Late Changes

Sonic the Hedgehog's ring-based health — survive any hit while holding at least one ring, a core
mechanic of the entire franchise — was added two weeks before the 1991 launch.

So late changes can be the best decision you make. But this is the point of maximum blast radius,
so escort them:

- Is it contained, or does it touch shared systems?
- Full regression pass afterwards, not a spot check.
- Rollback plan, decided before the change lands.
- A named person makes the call — not consensus drift at 2am.

Anything failing those four is a post-launch patch. That's what stage 7 is for.

---

## Ship Mechanics

- **Release builds** made from a tagged commit, reproducible, symbols archived.
- **Certification** cleared on every console/store platform (build times measured in weeks).
- **Store assets** final: pricing, regional pricing, age ratings, launch discount, release timing
  across time zones.
- **Day-one patch** built and submitted if needed — and note that a large day-one patch means
  stage 4's exit criteria were waived.
- **Live monitoring** ready: crash reporting, analytics, support inbox, community channels
  staffed for launch day.
- **Rollback path** for the store build itself.
- **Comms** ready: launch post, press notification, creator embargo lift, social schedule.

---

## Deliverables

- Gold/release build from a tagged commit
- Completed `docs/game/launch-checklist.md`
- Known-issues list, published if appropriate
- Support and monitoring live
- Day-one patch prepared or explicitly not needed

---

## Exit Criteria

- [ ] Zero open game-breaking or progression-blocking bugs
- [ ] Every late change regression-tested, with rollback available
- [ ] Certification passed on all platforms
- [ ] Store listings final: price, ratings, assets, regions, timing
- [ ] Build tagged, reproducible, archived
- [ ] Crash reporting and analytics verified working in the release build
- [ ] Support and community coverage staffed for launch window
- [ ] Post-launch plan already drafted (stage 7 starts on day one, not week three)
