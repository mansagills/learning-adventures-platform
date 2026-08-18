# Stage 4 — Testing

**Question:** Is it stable, *and* is it fun?

Two separate verdicts. A rock-solid game that isn't fun has failed this stage, and no amount of
extra stability will fix it.

---

## Part A — Stability

Test every aspect of the game for bugs, glitches, exploits, and softlocks. The canonical
categories:

| Category | What you're hunting | Example failure |
|----------|--------------------|-----------------|
| **Solid environments** | Walking, breaking, or clipping through geometry | *Spyro: Enter the Dragonfly* — head-bashing a specific corner of the boss gate opens the final boss at any time |
| **Rendering & performance** | Objects appearing when and as intended; pop-in, fade-in, framerate under load | Framerate collapse when the screen fills with entities |
| **Exploits** | Mechanics used in unintended ways for unfair advantage | *Mega Man*'s Select Trick — one Thunder Beam plus Select-mashing kills the Yellow Devil outright |
| **Softlocks** | Player permanently stuck through no fault of their own | Gen-3 Pokémon returns your last Surf/Dive user rather than let you strand yourself on an island |
| **Difficulty** | Too hard, too easy, badly paced | *Kid Icarus* shipped to hit a 19 Dec 1986 deadline with no time to balance; it's been notorious ever since |
| **Script & performance errors** | Typos, wrong takes, broken triggers | *Oblivion* ships a take where the voice actor for Tandilwe audibly asks for a second one |

Also cover: save/load integrity, mid-session interruption (alt-tab, sleep, disconnect, low
battery), input devices, resolution and aspect ratios, accessibility settings, first-run
experience on a clean machine, and every supported platform separately.

Triage by severity — **game-breaking → progression-blocking → systemic → cosmetic** — and fix in
that order. Cosmetic bugs are allowed to ship. Progression blockers are not.

---

## Part B — Fun Factor

Fun factor is the thing that makes the game worth playing, and it is tested, not assumed. Story
engagement, mechanical satisfaction, and puzzle payoff matter exactly as much as technical
stability. If they aren't there, the game won't sell.

The test: name the one thing your game is. Spider-Man PS4 is web-swinging. Ōkami is the brush.
Now ask whether a fresh player finds that thing within minutes, and whether it stays good on the
hundredth repetition.

### Running a playtest

1. **Fresh players only** for first impressions — you get one per person.
2. **Say nothing.** No tutorials, no hints, no "oh you have to press X". Every word you have to
   say is a design bug.
3. **Watch hands and face**, not just the screen. Note where they hesitate, sigh, or lean in.
4. **Ask afterwards**, never during: What were you trying to do? Where were you confused? What
   was the best moment? Would you play again — and be alert to politeness inflating the answer.
5. **Measure**: time to first success, drop-off point, session length when nobody's watching.

### Turning results into fixes

Separate *"the mechanic is weak"* from *"the mechanic is unexplained"*. The second is a
UX/tutorial fix and is cheap. The first is a design fix and may be expensive — which is exactly
why the vertical slice existed in stage 2. Weakness discovered here that traces to a skipped
pre-production step is a genuine schedule risk; report it as one.

---

## Deliverables

- `docs/game/test-plan.md` — stability matrix by category and platform, plus playtest protocol
- Bug database, triaged by severity
- Playtest findings with named fixes, split into design vs. UX
- Difficulty curve reviewed against observed player data, not developer skill

---

## Exit Criteria

- [ ] Zero known game-breaking or progression-blocking bugs
- [ ] No reachable softlocks
- [ ] Known exploits either fixed or accepted in writing
- [ ] Performance holds on minimum-spec hardware under worst-case load
- [ ] Full pass on every supported platform and input device
- [ ] Save/load survives interruption
- [ ] Script proofread; final voice takes selected
- [ ] Difficulty tuned against fresh-player data
- [ ] Fun factor confirmed by playtesters who aren't on the team and don't owe you anything
- [ ] Remaining bugs are cosmetic and listed in priority order

**Do not enter pre-launch** without a stable beta build. Pre-launch means showing the game to
the public; a broken build shown publicly is a launch you can't take back.
