# Seeds of Genius: George Washington Carver and the Power of Science
## Technical specification for a Three.js pixel adventure

**Version:** 1.1  
**Audience:** ages 8–13, roughly grades 3–8  
**Subjects:** science, history, design thinking  
**Build target:** a complete, single-player browser game with seven story chapters  
**Production rule:** finish, test, show, score, and obtain user approval for each phase before starting the next.

## 1. Product vision and boundaries

The player enters a small, welcoming storybook town, creates a character, and meets **George Washington Carver as the main recurring NPC, mentor, and quest giver**. Carver starts every lesson with a concrete problem, sends the player to talk with other NPCs and collect useful items or clues, guides the chapter minigame, and receives the player's findings at the end. The final chapter asks the player to develop and explain an invention of their own. A gentle day/night cycle, warm audio, a field journal, and cosmetic rewards make the world feel lived in.

This is a **cozy single-player adventure**, not a campus, MMO, life simulator, or open-world building game. One compact hub, a few reusable interiors and field scenes, and short chapter-specific minigames are enough. A small personal room may display earned objects and allow rest; it does not require house construction. No combat, real-money purchases, chat, accounts, leaderboard, or infinite procedural world.

Carver appears as an **adult storybook guide** in the hub and chapter spaces. For childhood and education chapters, he introduces playable memory scenes or displays from his past; he is not falsely shown as an adult present at his childhood events. Historical scenes are clearly identified as moments from Carver's life. The player does not change historical events. Fictional townspeople and quests are labeled as story framing. Carver's invented dialogue is presented as game dialogue, not historical quotation. The education chapter treats racism truthfully and age-appropriately, without turning discrimination into a challenge the child is rewarded for enduring.

## 2. Learning design

By the end, a player should be able to:

1. Record at least three specific observations about a plant or environment and distinguish an observation from a guess.
2. Place key stages of Carver's educational journey in order and explain one barrier and one source of support in his pursuit of learning.
3. Compare repeated single-crop planting with a crop-rotation plan and explain, in age-appropriate terms, why soil care matters.
4. Test multiple potential uses for a crop against a stated need, choose a promising idea, and explain evidence and tradeoffs.
5. Match a farmer's practical problem to a feasible science-based recommendation and explain who benefits.
6. Form a testable question and hypothesis, change one variable, record results, and revise a conclusion.
7. Present an original, community-minded invention with a need, proposed solution, test plan, and revision.

Learning must be demonstrated through actions and explanations inside the game. A correct answer alone does not complete a chapter if the player has not performed its core investigation. Wrong attempts receive useful feedback and an immediate way to retry. No lives or punitive failure states.

Each chapter also has a printable or screen-free activity in a learning packet: L1 nature observation card; L2 journey timeline and reflection; L3 cup-of-soil or paper crop-rotation planner; L4 household-material invention sketch; L5 interview or observation of a local growing need; L6 safe one-variable seed/plant experiment plan; L7 final invention poster and test log. The game should unlock or display the matching activity, but paper completion is optional and never blocks progress.

## 3. Experience and systems

### Presentation and controls

- Use Three.js for a **2.5D, 16-bit-inspired pixel world**: low-poly tile geometry, pixel textures, sprite characters, an orthographic camera, nearest-neighbor filtering, integer-scale rendering where possible, and a restrained palette. Text and interface remain crisp at normal display resolution.
- Design desktop-first for current Chrome, Edge, Safari, and Firefox. Keyboard movement (WASD/arrows), an interact key, mouse/touch clicks for menus and minigames, and visible controls are required. Give touch devices an optional on-screen movement pad and interaction button if the layout supports it.
- Provide character customization at start and in the hub: skin tone, hair, outfit color, and optional accessory. Keep skin tones and hair choices inclusive. Choices have no gameplay advantage.
- NPCs offer short, readable dialogue with at least occasional choices, visible quest markers, and an optional dialogue replay in the journal. Provide a skip/fast-text control.
- Give Carver a recognizable sprite, portrait, location marker, and warm, curious voice in the writing. He is always easy to find through a map marker or journal shortcut. Supporting NPCs have distinct roles and provide quest items through conversations, exchanges, or tasks rather than serving as decoration.
- Day/night changes light, sky, ambient sound, and some NPC presence. It must never lock a lesson or force the player to wait. The room's bed advances time; a menu switch can pause the cycle.
- Use gentle music loops and contextual sounds, with independent music/effects sliders and mute. The game must remain understandable without sound. Avoid flashing effects and allow reduced motion.

### Core loop and progression

`Talk to Carver → accept his quest → explore and talk to supporting NPCs → collect needed items/clues → use them in the minigame → return to Carver with findings → earn XP and Seeds → unlock the next story beat.`

- Every lesson must have three visible beats: **Carver assigns**, **NPCs help the player gather**, **Carver debriefs**. Carver should respond to what the player actually discovered or tried, including mistakes and revisions. The first conversation states the goal and why it matters; the closing conversation connects the result to Carver's science and the next chapter.
- A small quest inventory holds chapter objects (samples, notes, tools, letters, plans), separate from cosmetic currency. The journal shows each item's source, purpose, and whether it has been used. Items can be inspected, and conversations remain replayable. Required items cannot be sold, lost, or missed permanently; an NPC remains reachable regardless of time of day.
- Quest items are earned through meaningful NPC dialogue or a simple favor, not random drops. At least two supporting NPC interactions are required in each lesson. Their information must affect the minigame or the player's explanation. Optional conversations add worldbuilding but never hide mandatory facts.

| Lesson | Carver's quest | Supporting NPC conversations and collectible items | Use of items / return to Carver |
|---|---|---|---|
| 1. Curiosity | Investigate what a garden is telling us. | Gardener gives a **field notebook**; young naturalist shares a **magnifying lens** after discussing what they noticed. | Inspect three sites, sort observation cards, and show Carver the completed notes. |
| 2. Education | Reconstruct how a curious learner found a path to science. | Teacher shares a **school record**; artist/student shares a **botanical sketch** and a story of encouragement. | Place the evidence on a timeline, identify a barrier and support, and discuss the journey with Carver. |
| 3. Soil | Find a better plan for tired farmland. | Farmer provides **soil samples** and a crop history; seed keeper provides **crop cards**. | Compare plots and test rotation plans, then present the evidence to Carver. |
| 4. Invention | Find a useful new purpose for a crop. | Cook shares a **community need card**; craftsperson provides a **materials kit** and constraints. | Build and test two prototypes, revise one, and explain the choice to Carver. |
| 5. Farmers | Help neighbors with different growing problems. | Two farmers each give a **farm report**; outreach helper provides a **resource map**. | Recommend feasible solutions for both farms and report whose needs each solves. |
| 6. Method | Design a fair test for an unanswered question. | Lab assistant provides a **measurement tool**; gardener shares **trial notes/seeds**. | Set one variable, collect trial results, and review the conclusion with Carver. |
| 7. Capstone | Use what you learned to help your own community. | Two neighbors share **need cards** or feedback; maker offers a **prototype kit**. | Create, test-plan, revise, and present a project card to Carver for the final conversation. |

- **XP** shows chapter and overall progress. **Seeds** are earned through quests and can buy only cosmetics or room decorations; they cannot purchase answers or lesson access. Every required item is free. No grinding is needed to finish.
- The field journal holds Carver's current assignment, NPC leads, collected item checklist, experiment records, historical context, analog activities, and a seven-chapter map. The next action is always visible.
- Chapters unlock in order. The player may revisit completed chapters and replay activities without duplicating one-time rewards. A chapter ending includes a short reflection and a clear next destination.
- Save automatically after customization, dialogue milestones, minigame state changes, and chapter completion. Include manual save/export and an explicit reset confirmation. Use local browser storage for the initial release; no child account or personal identifier is required.
- Store progress in a versioned save schema. Handle invalid or old saves gracefully; avoid corrupting progress. Provide a visible save indicator.

### Adaptive learning and AI

- Keep a local learner model per objective: attempts, hint level used, common misconception, and evidence of mastery. Start with rule-based adaptation so the core game works offline and without an API key.
- After a struggle, offer one contextual hint at a time: notice a clue, narrow choices, then show a worked example. Reduce complexity or add a visual aid without removing the core learning action. For confident players, offer an optional deeper challenge.
- Architect an optional AI hint/reflection service behind a server-side endpoint. If configured, it may rephrase hints for reading level and interests and give feedback on the capstone using a fixed rubric. It must use a curated fact bank, never invent historical facts, never block progression, and fall back to authored content on error. Do not put model credentials in the browser.
- Collect no names, birth dates, chat transcripts, or external analytics by default. Explain any future cloud data use before enabling it. Keep any free-text capstone input local unless a parent/teacher explicitly enables cloud feedback.

### Source and content checks

Use authoritative sources to review historical copy before release. The National Park Service documents Carver's education, his Tuskegee role, and his work teaching crop rotation; its Tuskegee page documents the Jesup Wagon outreach. The USDA National Agricultural Library hosts his soil-improvement material. These references guide factual review, not verbatim dialogue: [NPS biography](https://www.nps.gov/people/george-washington-carver.htm), [NPS Tuskegee history](https://www.nps.gov/tuin/learn/historyculture/george-washington-carver.htm), [USDA soil collection](https://www.nal.usda.gov/exhibits/ipd/carver/exhibits/show/soil/soil-productivity).

Avoid the myths that Carver invented peanut butter or that one legume instantly restores all soil nutrients. Show crop rotation as a longer-term practice whose outcome depends on conditions. Provide an in-game source/credits panel and a brief adult-facing context note for the education chapter.

## 4. Technical architecture and deliverables

- Use TypeScript with Vite and Three.js. Separate the renderer, world/navigation, interaction/dialogue, quest/progression, inventory, minigames, content data, audio, accessibility settings, adaptation, and persistence. Use data-driven chapter definitions; do not hard-code each chapter into one large scene file. Each chapter definition must identify Carver's opening and closing dialogue, supporting NPCs, required item grants, item uses, and completion conditions.
- Build a reusable scene kit: town paths, garden, classroom, lab/workshop, farm, room, NPC sprite rig, crops, soil plots, UI panels, and transitions. Reuse this kit across chapters to keep asset scope realistic.
- Use authored quests and bounded minigame data. Any procedural variation must remain curriculum-aligned and reproducible from a seed. Provide a debug menu to jump to chapters and reset a test save; hide it in release builds.
- Target smooth play on an ordinary laptop, with a practical target of 60 fps and a floor of 30 fps on the agreed test device. Keep startup and asset sizes modest; lazy-load later chapter assets. Avoid blurry pixels, clipped UI, and unreadable text at 1280×720 and a narrow mobile viewport.
- Include a README with local run/build steps, an asset/license list, a content source list, a phase checklist, and known issues. Supply a playable URL or local preview for every check-in.
- Required asset set: a distinct Carver sprite, portrait, and dialogue expressions; consistent player and supporting NPC sprites and animations; tiles and props; quest item icons; seven minigame UI kits; journal icons; at least one music loop per major mood plus short interaction sounds; accessible font and UI icons. Use original or properly licensed assets. Possible production tools: WizardGenie and Three.js, plus an art/audio editor or generator as needed; Unity is outside this browser build.

## 5. Universal phase gate

**After each phase, stop.** Deliver a runnable preview, a concise change summary, test results, a list of known issues, screenshots embedded in chat, and a self-score. Ask the user to test that phase and wait for explicit approval. Fix reported defects, retest, rescore, and send updated screenshots. Do not begin the next phase until approval is received. If a phase scores below 8.5/10, iterate before asking for approval.

Score each phase out of 10 using the same rubric: gameplay/feel **2.5**, learning accuracy and clarity **2.0**, visual/audio polish **1.5**, usability/accessibility **1.5**, technical reliability **1.5**, phase completeness **1.0**. Explain the score in one sentence per category and give evidence. **Gate passes only if total ≥8.5/10, every acceptance criterion passes, there are no blocking bugs, screenshots are provided, and the user explicitly approves.** A high score cannot override a failed criterion. For Phase 0, score learning architecture/readiness instead of a full lesson.

At every check-in test: launch and basic navigation, Carver's quest assignment, required NPC conversations and item grants, item use, Carver's closing conversation, the phase's primary interaction, correct/incorrect/hint flows, save/reload where relevant, keyboard and mouse paths, audio mute, reduced motion, text legibility, and browser console errors. Capture screenshots at the specified moments at 1280×720 and at least one narrow viewport. Use real runtime captures, not mockups.

## 6. Gated build phases

### Phase 0 — Playable foundation

**Scope:** establish the project, pixel rendering, compact hub, avatar creation, controls, dialogue shell, journal shell, quest marker, room, day/night atmosphere, sound settings, and versioned save.

**Requirements:** an avatar can walk a complete hub loop, meet Carver, accept a small practice quest from him, talk with a supporting NPC to receive an item, inspect that item in the quest inventory, and return to Carver to complete the quest. The player can also enter/exit the room, rest to change time, view the journal, and save/reload. Include camera bounds, collision, focus states, onboarding prompts, and reduced-motion/mute controls. Stub the chapter data interface and adaptation state.

**Acceptance:** Carver is recognizable and clearly functions as the central quest giver; the supporting NPC grants an item through dialogue and Carver acknowledges it; no dead ends or impassable required path; character appearance, quest item, and time preference survive reload; one obvious next-task indicator; no blurry sprites or clipped text at target viewports; chapter content can be added without rewriting the hub.

**Testing/check-in:** fresh start → customize → meet Carver → accept quest → talk to NPC → collect/inspect item → return to Carver → sleep → reload; verify keyboard and touch/click UI paths, save recovery, and settings. Stop for player feedback on movement speed, camera, Carver's presence, art, and readability.

**Screenshots:** customization, Carver assigning the practice quest, supporting NPC giving the item, inventory/journal, nighttime hub; include a narrow viewport capture. **Quality gate:** score ≥8.5/10 under the universal rubric and receive approval.

### Phase 1 — Lesson 1: A Seed Is Planted / Curiosity Collector

**Scope:** Carver's childhood curiosity and the skill of observing nature. This first lesson is the vertical slice for final chapter quality.

**Requirements:** Carver asks the player to investigate the garden. The gardener gives a field notebook and a young naturalist gives a magnifying lens through conversation. Use both to inspect plants/soil/insects, collect three specific observations, and sort observation cards from guesses in a short minigame. Journal records evidence; hints highlight observable details. Return to Carver for reflection and the nature observation card.

**Acceptance:** player obtains and uses both NPC items, makes at least three observations, distinguishes evidence from inference with explanatory feedback, and debriefs with Carver; optional exploration feels rewarding; chapter completion saves and unlocks Lesson 2.

**Testing/check-in:** test first-time path, all observation hotspots, wrong-card recovery, each hint level, replay, reward duplication protection, and reload. Ask the user to judge whether the first five minutes feel cozy and fun.

**Screenshots:** Carver's quest dialogue, gardener/naturalist item conversation, garden inspection, card challenge with feedback, Carver debrief/journal; include one narrow capture. **Quality gate:** ≥8.5/10 and approval.

### Phase 2 — Lesson 2: Science Against the Odds / Choose the Path

**Scope:** Carver's pursuit of education amid racial barriers, presented respectfully through a guided story journey.

**Requirements:** Carver asks the player to reconstruct his journey from a set of storybook memory displays. A teacher shares a school record and an artist/student shares a botanical sketch and encouragement through conversations. The player uses these items to arrange key educational stages in order and identify ways Carver kept learning and found support. Include an age-appropriate note naming racism as an unjust barrier. Choices affect dialogue and understanding, never rewrite history or imply that injustice was Carver's fault. Carver closes with a reflective conversation.

**Acceptance:** player gathers both NPC items, places the timeline correctly, identifies one barrier and one support, and discusses why education mattered to Carver's science with him. Historical vs fictional framing is clear, and a skip/replay control is available for sensitive dialogue.

**Testing/check-in:** review factual copy against source list; test every dialogue branch, timeline recovery, skipping, text readability, and reload. Ask the user to review tone and age fit before proceeding.

**Screenshots:** Carver's assignment, teacher or artist/student item conversation, journey scene, timeline activity, Carver reflection/journal; include one narrow capture. **Quality gate:** ≥8.5/10 and approval.

### Phase 3 — Lesson 3: The Soil Speaks / Virtual Soil Lab

**Scope:** soil health, repeated cropping, and crop rotation.

**Requirements:** Carver asks the player to help diagnose tired farmland. A farmer supplies soil samples and crop history; a seed keeper supplies crop cards after explaining available choices. The player uses these items to examine two plots, compare clues, plan multiple seasons using cotton and alternative crops including a legume, and see a simple, labeled model of soil condition, crop output, and uncertainty. Include a magnified soil view and feedback that explains the mechanism in child-friendly terms. The player brings the rotation plan back to Carver.

**Acceptance:** player obtains and uses the farmer's and seed keeper's items, tests at least two plans, identifies why a repeated single-crop plan can deplete soil, and presents a rotation and explanation to Carver. The model does not teach instant or guaranteed nutrient restoration.

**Testing/check-in:** verify all crop combinations cannot bypass the learning step; inspect simulation labels, hint path, season transitions, and save/reload mid-lab. Ask the user whether the soil changes are understandable without reading a long paragraph.

**Screenshots:** Carver's quest, farmer/seed keeper item handoff, depleted plot and soil inspection, rotation planner, Carver debrief with comparison; include one narrow capture. **Quality gate:** ≥8.5/10 and approval.

### Phase 4 — Lesson 4: The Peanut Isn't Just a Peanut / Inventor's Workshop

**Scope:** plant experimentation and practical invention.

**Requirements:** Carver asks the player to find a useful purpose for a crop. A cook shares a community need card; a craftsperson gives a materials kit and explains constraints. The player uses these items to explore crop properties, combine a crop/material with a process, test at least two ideas, and compare outcomes for usefulness, effort, and safety. Use plausible fictional prototypes, clearly marked as game inventions; avoid attributing invented products to Carver. The player returns to Carver with a revised prototype. Unlock cosmetic workshop objects with earned Seeds.

**Acceptance:** player collects the need card and materials kit, records two trials, revises one idea using test evidence, and explains to Carver why the chosen design fits the need. No single memorized combination should be the only path to success.

**Testing/check-in:** test valid/invalid recipes, consequence feedback, hint ladder, inventory state, cosmetics purchase and reload. Ask the user whether experimentation feels playful rather than like a recipe quiz.

**Screenshots:** Carver's quest, cook/craftsperson item conversation, workshop and idea assembly, two trial results, revised invention with Carver/journal; include one narrow capture. **Quality gate:** ≥8.5/10 and approval.

### Phase 5 — Lesson 5: Science for the People / Farm Helper

**Scope:** using science to help farmers and communities, inspired by Carver's outreach.

**Requirements:** Carver asks the player to help two neighbors. Visit a compact farm and talk to both farmers to collect their distinct farm reports; speak with an outreach helper to collect a resource map. Inspect plots/resources, use the reports and map to select feasible recommendations, and explain each choice to the farmers and Carver. Include a story reference to Carver sharing practical knowledge beyond the classroom. Rewards come from helping, not selling advice.

**Acceptance:** player gathers and uses both farm reports and the resource map, chooses solutions suited to both farmers' actual needs and limits, and debriefs with Carver; game feedback states who benefits and why; a superficially attractive but impractical option is explained rather than simply marked wrong.

**Testing/check-in:** test each farmer state, dialogue path, recommendation combinations, journal rationale, and save/reload. Ask the user whether the human stakes are clear and the tasks remain fun.

**Screenshots:** Carver's quest, farm overview, farmer/outreach helper item conversation, recommendation screen, outcome and Carver debrief; include one narrow capture. **Quality gate:** ≥8.5/10 and approval.

### Phase 6 — Lesson 6: A Scientist's Method / Design Your Own Experiment

**Scope:** a full scientific investigation using prior chapter knowledge.

**Requirements:** Carver asks the player to design a fair test. A lab assistant supplies a measurement tool; a gardener shares trial notes and seeds after discussing the open question. The player uses these items to choose a testable question, state a hypothesis, set a comparison, change one variable, run several trials, record results in a visual table, and draw a conclusion. If more than one variable changes, Carver explains why interpretation becomes hard and offers a reset. A chart is supported by text labels. Return to Carver with the conclusion.

**Acceptance:** player gathers and uses the tool and trial notes/seeds, completes the sequence observation → question/hypothesis → controlled test → results → conclusion/revision, and explains the conclusion to Carver. It must refer to collected data, including when the hypothesis is not supported.

**Testing/check-in:** test variable-control guardrails, outcomes with differing results, table/chart accessibility, hint levels, restart, and mid-experiment save/reload. Ask the user to complete it without guidance and report confusion.

**Screenshots:** Carver's quest, lab assistant/gardener item conversation, experiment setup, variable warning or hint, results table/chart, Carver conclusion; include one narrow capture. **Quality gate:** ≥8.5/10 and approval.

### Phase 7 — Lesson 7: Your Turn to Plant the Seeds / My Carver Project

**Scope:** student invention capstone and story ending.

**Requirements:** Carver gives the final quest: use science to help a community. Two neighbors share need cards or prototype feedback through conversation; a maker provides a prototype kit. The player picks a modern local need from a small authored set or enters a short custom need, uses the collected items to sketch/assemble a proposed solution from bounded components, describes how to test it, gets rubric-based feedback, revises once, and shares a printable/exportable project card. The player presents it to Carver, who celebrates the process and community purpose without claiming historical equivalence. Show the seven-chapter journey and final rewards.

**Acceptance:** player talks to the supporting NPCs and uses their need/feedback and prototype kit; project card contains the need, idea, evidence or prior learning, test plan, and one revision; Carver receives it in a final conversation. The player can complete without AI or free-text typing by using guided choices. Any AI feedback is optional, source-bounded, safe, and has a deterministic fallback.

**Testing/check-in:** test guided and typed paths, blank/unsafe input handling, feedback fallback, revision, export/print, ending, and reload. Ask the user to judge whether the ending feels earned and open-ended.

**Screenshots:** Carver's final quest, neighbor/maker item conversation, need selection, invention builder, feedback/revision, final project card and Carver ending; include one narrow capture. **Quality gate:** ≥8.5/10 and approval.

### Phase 8 — Whole-game polish and release candidate

**Scope:** finish art/audio consistency, content review, performance, accessibility, save migration, and release packaging.

**Requirements:** all seven chapters link correctly through Carver's assignments and debriefs; all required NPC conversations, quest item grants, uses, and inventory/journal states work; rewards remain coherent; credits and historical sources are visible; analog packet links work; settings persist; optional AI service degrades gracefully. Remove debug UI from release. Produce a short player guide and build instructions.

**Acceptance:** a new player can find Carver, complete his quests by gathering and using items from supporting NPCs, and finish the entire game without developer help; no blocking bugs, missing assets, lost progress, factual errors, or unreadable screens; performance meets the agreed device target. Teacher/parent context is available for Lesson 2 and the analog activities.

**Testing/check-in:** run a complete fresh-save playthrough and a resume-from-each-chapter smoke test, including every Carver assignment/debrief, supporting NPC handoff, and required item use; verify desktop browsers, a narrow viewport, keyboard-only operation, mute, reduced motion, print/export, offline/fallback paths, and source/asset credits. Record remaining minor issues with severity and owner. Stop for final user playtest and approval before release.

**Screenshots:** hub day/night with Carver, one Carver quest and NPC item exchange, one representative moment from each lesson, journal/inventory/progress, capstone card with Carver, settings/credits; include narrow captures of hub, minigame, and card. **Quality gate:** ≥8.5/10 and final approval.

## 7. Definition of done for any chapter

A chapter is done only when Carver assigns its quest, at least two supporting NPC conversations provide required items or clues, those items matter in the minigame, Carver reacts to the player's result, and the story entry, feedback/hints, learning evidence, journal entry, XP/Seeds reward, analog activity, save/replay behavior, sound/visual polish, accessibility path, and chapter transition all work in the actual running build. Temporary art or a narrated mockup does not pass a chapter gate.
