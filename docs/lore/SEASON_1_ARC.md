# The Spark Chronicles — Season 1 Story Bible (Outline)

**Status:** Arc outline / structure. Full chapter-by-chapter narrative script is the next drafting phase — Chapter 0 will be the first fully-scripted chapter, targeted for the demo build.

---

## World Model

**Hub — the Academy campus.** Persistent, shared, multiplayer. Structurally unchanged by story progress. All existing systems (subject buildings, quest board, SPARK AI buddy, XP/coins, Campus Shop) work exactly as already built. Story progress surfaces only as small additive cosmetics (a trophy, a title, a mural) — nothing is ever removed or restructured for other players.

**Echoes — instanced story quests.** Each story chapter is entered from the hub (via Jaylen or a quest trigger) and drops the player into a **solo, private instance**: a corrupted mirror of a real campus building. The real building in the hub stays untouched; the Echo is where the actual quest gameplay, subject content, and boss fights happen. Echoes can look/behave nothing like the real building (grayscale, glitchy, genre-shifted) without ever affecting what other players see in the hub. Solo-only for this build; co-op/open squads are a future addition, not required for Season 1.

## Core Lore

Every student who enrolls at the Academy carries a **Spark** — an ember of curiosity that's the real source of their in-game power. Nobody explains this on day one; a student's Spark "wakes up" the first time they get genuinely curious about something in a subject building, which is when their first power unlocks.

**Jaylen** was the first student this ever happened to. He's not the player's avatar — players create their own characters — but he's stayed on as the guide who helps new Sparks recognize what's happening to them, matching his existing role as the campus onboarding NPC. **SPARK**, the AI study buddy, is in-world lore as well: a fragment of the very first Spark, still active, which is why it's able to help students today.

## The Villain

**The Hush** doesn't attack the school. It drains it, quietly. It's a fog that doesn't hurt anyone — it just makes wonder go quiet. A kid stops mid-question and forgets what they were asking. A hallway loses color for an hour and nobody notices they didn't notice. The Hush has been doing this in small, deniable ways for a long time. Jaylen is the only one who's pieced together that it's one thing, not many random glitches — because he was there when it started.

Kid-appropriate stakes: nobody is hurt or in danger of dying. The threat is a world with no curiosity left in it — grayness, boredom, forgetting how to ask "why." Visually rich (color draining, glitchy repetition, frozen patterns) without being scary in a harmful way.

**Lieutenants** (one per subject, one per season quarter):

| Lieutenant | Subject | Corrupts... |
|---|---|---|
| **Null** | Math | pattern and possibility — freezes things into rigid, lifeless order |
| **Static** | Science | curiosity-driven discovery — jams experiments before they spark anything |
| **The Blot** | English / Language | story and voice — drinks stories so nothing comes out the other side |
| **The Loop** | History | progress — traps a place repeating the same mistake forever |

Interdisciplinary powers are held back as a later unlock (a fusion of two subjects a player has already leveled up in) rather than tied to a Season 1 lieutenant — a natural seed for DLC.

## Season 1 Structure (one continuous story; DLC = future chapters, same arc)

- **Chapter 0 — Orientation.** Player enrolls, meets Jaylen, first Spark ignition tied to whichever subject building draws them in first. Low stakes, personal and small. Jaylen shares — carefully, kid-appropriately — that something's been "off" at the Academy for a while. **This is the chapter being scripted first for the demo.**
- **Chapters 1–2 (Math wing).** Dead zones appear where things stop making sense — patterns break, numbers stop behaving. Player powers up through Math-themed Echoes. **Quarterly cinematic 1:** confrontation with Null — first real proof the Hush is real.
- **Chapters 3–4 (Science wing).** Experiments that used to spark excitement fizzle for no reason. **Quarterly cinematic 2:** Static.
- **Chapters 5–6 (English wing).** A Blot-touched section of the library where stories go in and nothing comes out. **Quarterly cinematic 3:** the Blot.
- **Chapters 7–8 (History wing).** A hallway stuck literally repeating the same day. **Quarterly cinematic 4 — season finale:** the Loop, and the reveal that all four lieutenants report to the Hush itself, which turns out to be tied to Jaylen's own origin. Ends on a cliffhanger (the Hush retreats, not destroyed) to set up the next season/DLC.

## Reward Economy Tie-In

Every chapter is delivered as one or more Quests per the Quest Dev Brief (`docs/lore/QUEST_DEV_BRIEF.md`): fixed XP/points on every clear, a guaranteed non-random story item on first clear only, replays for points/cosmetics grinding. No new economy systems needed — this plugs directly into the existing XP/coins/Campus Shop already planned for the platform.

## Next Steps

1. Draft full narrative script for **Chapter 0** (dialogue, beats, briefing/debrief text) — feeds directly into the demo build.
2. Draft narrative scripts for Chapters 1–8 and the four quarterly cinematics.
3. Share this bible + the Quest Dev Brief with the partner dev team building quest games.
