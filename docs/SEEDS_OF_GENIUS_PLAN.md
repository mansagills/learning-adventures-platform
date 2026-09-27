# Seeds of Genius: build plan and phase status

**Game:** Seeds of Genius: George Washington Carver and the Power of Science
**Spec (source of truth):** `docs/sorceress-prompts/carver-game/Carver_Adventure_Technical_Spec.md` (v1.1)
**Code:** `games-src/seeds-of-genius/` (Vite + TypeScript + Three.js). See its README.
**Build output:** `public/games/seeds-of-genius/`, served unlisted at `/games/seeds-of-genius/index.html` (the `index.html` is needed: Next.js does not serve folder index files from `public/`).

## How we work

One numbered phase at a time. At the end of each phase: run the tests, fix
failures, score the phase with the spec's rubric (it must reach at least
8.5/10 and pass every acceptance criterion), send the owner a playable
preview, test report, known issues, scores and real in-game screenshots
(including a narrow viewport), then **stop and wait for the owner's
explicit approval**. A passing self-score is not approval.

## Phase status

| Phase | Status |
|---|---|
| 0: Playable foundation | **COMPLETED ✅** (owner approved 2026-09-27: movement, camera, Carver, art and readability) |
| 1: A Seed Is Planted / Curiosity Collector | **COMPLETED ✅** (owner approved 2026-09-27: "still feels cozy and fun") |
| 2: Science Against the Odds / Choose the Path | **COMPLETED ✅** (owner approved 2026-09-27 after reviewing tone and age fit) |
| 3: The Soil Speaks / Virtual Soil Lab | **COMPLETED ✅** (owner approved 2026-09-27 after viewing screenshots and testing in the app) |
| 4: The Peanut Isn't Just a Peanut / Inventor's Workshop | In progress |
| 5-8 | Not started |

## Phase 0: playable foundation

**Deliverables (from the spec):**

- [x] Project set up: Vite + TypeScript + Three.js, integer-scaled pixel rendering
- [x] Compact hub (Sweetgum Hollow) with a full road loop, camera bounds and collision
- [x] Avatar creation: skin tone, hair style, hair color, outfit, optional accessory (also from the wardrobe and Settings)
- [x] Controls: keyboard, mouse click-to-move and click-to-talk, touch pad and Talk button
- [x] Dialogue shell: portraits with expressions, choices, fast text and skip, replay from the journal
- [x] Carver as the central quest giver: sprite, portrait, quest markers, map pin, "find Carver" shortcut
- [x] Practice quest: Carver assigns → Mae gives the seed packet → inspect it in the bag → Carver debriefs (observation question with the hint ladder)
- [x] Quest inventory and journal (assignment, NPC leads, item checklist, map, chapter path, talks, sources)
- [x] Room: enter/exit, bed changes the time, wardrobe, windowsill seed pot reward
- [x] Day/night: light, lamps, fireflies, sounds, day-only and night-only townsfolk; pause switch
- [x] Sound settings: music and effects sliders, mute (M)
- [x] Reduced motion, text size and speed, focus states, onboarding tips
- [x] Versioned save with autosave, backup and recovery, migration, export/import, reset confirmation, save indicator
- [x] Chapter data interface (all 7 chapters outlined) and learner model / hint-provider stubs
- [x] Debug menu (`?debug`)

**Tests:** `npm test` (31 unit tests), `npm run e2e` (57 browser checks), with screenshots in `games-src/seeds-of-genius/test-output/phase0/` (not committed).

## Phase 1: A Seed Is Planted / Curiosity Collector

**Deliverables (from the spec):**

- [x] Carver assigns the garden investigation, and offers a labeled memory from his childhood (storybook pages: young George, Diamond, Missouri, 1870s; facts from the NPS, pictures marked as imagined)
- [x] Hattie Bell (gardener) gives the **field notebook** in conversation; her clues point to the leaves and the damp soil
- [x] Theo (young naturalist) gives the **magnifying lens** after a ladybug "observation or guess?" question
- [x] Garden inspection: five sparkling spots (plants, soil, insects), each a close-up where the lens reveals details, then the player picks the specific notebook entry over a vague one and a guess
- [x] At least three observations required; two hidden bonus spots with fun facts and one-time Seeds
- [x] "Observation or Guess?" card game (8 cards built from the player's own notes, reproducible from a seed), with explanations and a 3-rung hint ladder: details highlighted, guess words highlighted, worked example
- [x] Carver's debrief quotes the player's first observation, reacts to mistakes they fixed, asks a why-question, and gives the Nature Observation Card
- [x] Journal: field notebook, chapter reflection, memory replay, printable Nature Observation Card (optional, never blocks)
- [x] Completion saves, pays +150 XP / +20 Seeds once, and unlocks Chapter 2 (arrives in Phase 2); replay without duplicate rewards
- [x] Save version 2 (per-chapter state) with migration from Phase 0 saves; mid-minigame save/reload
- [x] Chapter code loads lazily (`src/chapters/ch1/`) through the chapter runtime interface; the hub only gained a potting bench prop

**Tests:** 43 unit tests; `node scripts/e2e-phase1.mjs` (45 browser checks), plus the Phase 0 check-in (57) still passing. Screenshots in `games-src/seeds-of-genius/test-output/phase1/`.

## Phase 2: Science Against the Odds / Choose the Path

**Deliverables (from the spec):**

- [x] Carver assigns the chapter: reconstruct his school years from storybook displays. His opening names racism plainly ("That rule was unfair. It was racism, and it was not my fault"), with two answer branches ("That's not fair!" / "What did you do?")
- [x] Ms. Ruth Nelson (teacher) gives the **School Record Folder** (dates); Ada (young artist) gives the **botanical sketch** and her own story of encouragement. Either order works
- [x] The schoolhouse opens as a small room off the town square: six storybook displays on easels (each easel shows its own painting), and Ms. Nelson's chalkboard
- [x] Each display: a painting, a fact-checked caption, the place, and timeline clues (record dates if you hold the folder, sequence clues, the sketch clue). Labeled "A memory from Carver's life"; pictures marked as imagined
- [x] Timeline activity: put six stages in order (Move up / Move down, works with mouse, keyboard and touch), with Tuskegee fixed at the end. Hint ladder: count + "start with the dates" → the first misplaced card is moved and locked → worked example (every card shows its number)
- [x] Name one barrier and one support (two right answers each, one tempting wrong answer each, with explanations), after an age-appropriate note: racism was unjust and never his fault
- [x] Carver's reflection quotes the barrier and the helper the player chose, then asks why learning mattered for his science (question with hints), and gives the Journey Card
- [x] Sensitive content: every dialogue line about racism shows a note and a **Skip this part** button (also in journal replays); displays about racism open with a note and **Read this display / Skip for now** (skipping still counts, and the display can be read later)
- [x] Adult-facing note ("For grown-ups: about this chapter") in the journal, plus the printable Journey Card (optional, never blocks)
- [x] Completion saves, pays +150 XP / +20 Seeds once, and unlocks Chapter 3 (arrives in Phase 3); timeline can be replayed without duplicate rewards
- [x] Mid-activity save/reload (order, locks, hint level and picks are saved); Phase 1 saves open Chapter 2 on load
- [x] Chapter code loads lazily (`src/chapters/ch2/`); the hub only gained two NPCs and the schoolhouse door

**Facts used (checked against the National Park Service biography):** Susan Carver helped George learn to read; the Diamond school did not admit Black children; he left home at about 11 for a school for Black children in Neosho, where Mariah Watkins took him in; he worked his way through schools in Kansas and finished high school in Minneapolis, Kansas; Highland College accepted him by letter and refused him when he arrived because he was Black; at Simpson College (1890) he studied art and piano, and his art teacher Etta Budd encouraged him to study botany; at Iowa State (from 1891) he was the first Black student, earning a bachelor's degree (1894) and a master's (1896); in 1896 Booker T. Washington invited him to Tuskegee Institute. Ms. Nelson and Ada are fictional.

**Tests:** 62 unit tests; `node scripts/e2e-phase2.mjs` (68 browser checks), plus the Phase 0 and Phase 1 check-ins still passing. Screenshots in `games-src/seeds-of-genius/test-output/phase2/`.

## Phase 3: The Soil Speaks / Virtual Soil Lab

**Deliverables (from the spec):**

- [x] Carver assigns the chapter: Mr. Hill's west plot gets thinner cotton every year; "ask the soil". Two answer branches ("How can soil be alive?" / "What should I do?")
- [x] **Mr. Amos Hill** (farmer, new, by the Hilltop Farm gate) gives **Soil Sample Jars** and the **Crop History Ledger**, and states his need: any plan must still grow some cotton. **Mae** (the seed keeper at the Seed & Mail) explains the choices and what a legume is, then gives the **Crop Cards**
- [x] A new outdoor scene, **Hilltop Farm fields**, through the farm gate: a tired west plot (pale cracked soil, thin cotton) and a rotated east plot (dark soil, sturdy cotton, cowpea vines), signs with each plot's history, and a planning bench. Reusable for Chapter 5
- [x] **Magnified soil view** for each plot (lens close-ups): west = pale, crusted, almost lifeless; east = dark, crumbly, an earthworm, and root nodules that turn air into nitrogen. A side-by-side comparison appears after both
- [x] **Rotation planner**: four seasons × four crop cards (cotton, peanuts and cowpeas marked as legumes, sweet potatoes). Each test runs season by season with a plot picture, a labeled soil meter, a harvest range (weather) and a one-line reason. A "soil over four seasons" chart compares every tested plan at a glance, next to a table with the same numbers in words
- [x] **Honest model**: cotton uses soil (−6), legumes add a little (+6 / +9), sweet potatoes use a little (−2); a crop after itself loses harvest to pests. Labeled "a simple model, not a promise". No season adds more than +9, so nothing restores soil instantly (a unit test checks all 256 plans)
- [x] **Learning gate** (can't be bypassed): both samples looked at → Mr. Hill's plan and a legume plan both tested → "why did cotton every season wear the soil out?" answered → only then can a plan be chosen, and it must grow cotton, include a legume, and not let the soil fall. Many plans pass (no single memorized answer)
- [x] Hint ladder when a chosen plan doesn't fit: name the legumes → "legume, cotton, legume, cotton" → worked example filled in
- [x] Carver's debrief reads the player's own plan, compares it with cotton every season (soil and total cotton), asks what legumes did (the "instant fix" myth gets a clear correction), offers a Tuskegee memory (test plots; rotating cotton with peanuts and peas; plain-language booklets), and gives the printable **Crop-Rotation Planner** (with a cup-of-soil experiment)
- [x] Journal: soil lab notes, tested plans, chosen plan, the "why", reflection and the planner
- [x] Completion saves, pays +150 XP / +20 Seeds once, and unlocks Chapter 4 (arrives in Phase 4); the lab can be replayed without duplicate rewards; mid-lab save/reload keeps looks, tested plans, draft and hints

**Facts used (NPS biography and Tuskegee page; USDA NAL soil exhibit):** at Tuskegee Institute (from 1896) Carver worked with farmers whose soil had been worn out by growing cotton year after year; he used test plots; he taught crop rotation, alternating cotton with nitrogen-adding legumes such as peanuts and peas; he wrote plain-language bulletins for farmers. Legume root nodules hold bacteria that turn nitrogen from the air into a form plants use. Mr. Hill, Hilltop Farm and the numbers in the model are fictional.

**Tests:** 77 unit tests; `node scripts/e2e-phase3.mjs` (58 browser checks), plus the Phase 0, 1 and 2 check-ins still passing. Screenshots in `games-src/seeds-of-genius/test-output/phase3/`.

## Phase 4: The Peanut Isn't Just a Peanut / Inventor's Workshop

**Deliverables (from the spec):**

- [x] Carver assigns the chapter: the rotation farmers now grow lots of peanuts, sweet potatoes and cowpeas, and a crop only helps a family if they can use or sell it. Two answer branches, one of which is "Did you invent peanut butter?" ("No, I did not. People made peanut pastes long before me.")
- [x] **Miss Lottie Greene** (new cook, town square) gives the **Community Need Card**: an after-school snack that keeps 7+ days without a fridge, is filling, is easy enough for volunteers, and is safe for every kid (two kids are allergic to peanuts). **Mr. Wendell Brooks** (new craftsperson, by the workshop) gives the **Materials Kit** and explains the constraints (no frying, no electricity, a few steps)
- [x] The **workshop** opens as a new room: a crop shelf, a workbench (hand mill, jars), a drying rack, and a decoration shelf
- [x] **Explore crop properties** at the crop shelf (press, cut, tap, soak, read the seed tag): peanuts are oily, filling and an allergen; sweet potatoes are wet inside; dry cowpeas are rock hard until cooked in water
- [x] **Build and test** at the workbench: a crop, one or two steps (roast, boil, dry, grind) and a container (jar, paper bag, open bowl), plus an optional allergy label. Each prototype gets a pixel picture, a "game invention" label, and a check against every part of the need, each with a reason (ready to eat, keeps, filling, effort, safe)
- [x] Simple, honest kitchen rules decide the result (wet food spoils without a fridge; dry food keeps; dry beans need cooking in water; flour is not a snack; grinding by hand is a lot of work; an oily spread soaks through paper). **30 designs pass, across all three crops**, so there is no single memorized recipe
- [x] **Trial log** of every test; **"Improve this idea"** turns the next test into a revision (a failed test starts one automatically). A revision must pass and improve on its base. Only a real revision can go to Carver
- [x] Hint ladder on failed tests: what the test showed → a narrower suggestion for the failing part → a worked example you can fill in
- [x] **Seeds buy workshop decorations** (fern, stool, peanut-plant poster, wind chime) that appear in the room; each can be bought once; Seeds never buy answers. Saved in a new `cosmetics` save field (old saves start with none)
- [x] Carver's debrief names the invention, tells the revision story from the player's own tests ("You started with boiled peanuts... so you changed the steps, used a jar... and added an allergy label"), counts the trials, asks why the final design fits (wrong answers explained), offers a memory, and gives the printable **Invention Sketch Card**
- [x] Journal: invention log, decorations, reflection and the card. Completion pays +150 XP / +25 Seeds once and unlocks Chapter 5; replay gives no duplicate rewards; mid-workshop save/reload keeps everything

**Facts used (NPS biography and Tuskegee page):** at Tuskegee, Carver looked for many new uses for peanuts, sweet potatoes and other crops so farmers who rotated with them could use or sell them, and shared ideas and recipes in bulletins; in 1921 he spoke to a committee of the U.S. Congress about uses of the peanut; he did not invent peanut butter. Every prototype in the game is labeled as a made-up game invention. Miss Lottie, Mr. Brooks and the kitchen are fictional.

**Tests:** 93 unit tests; `node scripts/e2e-phase4.mjs` (54 browser checks), plus the Phase 0–3 check-ins still passing. Screenshots in `games-src/seeds-of-genius/test-output/phase4/`.
