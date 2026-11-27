# Kingdom Builders: Africa (History, H1): game plan and learning design

**Status: PLAN APPROVED (2026-11-25). Look preview BUILT (2026-11-25), waiting for the owner’s look before part 1.** Part of Phase 3 in [`GAMES_3D_UPGRADE_PLAN.md`](GAMES_3D_UPGRADE_PLAN.md).

## Context

The owner wants a new History game: a kid-friendly, peaceful city builder ("Age of Empires without the conquering") set in African kingdoms and peoples: Egypt, Kush, Mali, the Dogon, the Zulu Kingdom, the Maasai and others. Children manage resources, grow a settlement, and learn how each people's land shaped their food, farming, homes, trade, knowledge and way of life. It should look **more modern (low-poly 3D / 2.5D)** than the pixel-art Adventure Kit games, still built with Three.js.

Today the History subject has one planned game (Phase 3 "Ancient Egypt Explorer" in `docs/GAMES_3D_UPGRADE_PLAN.md`, not started). This plan creates the first real History game and follows the same proven process as the Science games: **plan → look preview → built in parts**, owner check-in after each.

Repo facts this plan builds on:
- Rebuilt games live in `games-src/adventures/` (Vite + TS + `three@0.180`), one folder per game in `src/games/<slug>/`, entry `<slug>/index.html`, build output `public/games/play/<slug>/` (committed; Vercel serves it static).
- Shared **Adventure Kit** (`src/kit/`) gives us, ready-made: talk box (`ui/talk.ts`), hint ladder + learner model (`learning/mastery.ts`), saving (`systems/save.ts`), settings incl. reduced motion/text size/mute (`systems/settings.ts`, `ui/settingsPanel.ts`), sound made in code (`systems/audio.ts`), read-aloud (`systems/speech.ts`), grown-ups page (`ui/grownups.ts`), touch pad, toasts, title screen.
- Closest existing game: **Ecosystem Building Tycoon** (`src/games/ecosystem-building-tycoon/`: `board.ts`, `rules.ts`, `problems.ts`, `content.ts`, `save.ts`) — tile placing, pure-function rules with unit tests, milestones, research cards. Reuse its structure.
- Listing: `lib/content/games.ts` (`htmlPath: '/games/play/<slug>/index.html'`), card art via `npm run thumbnails -- --only <slug>`. Not `lib/catalogData.ts` (old platform).
- Quality bar: section 2 + rubric in `docs/GAMES_3D_UPGRADE_PLAN.md` (8.5/10 to pass, no network requests, no emoji, keyboard/mouse/touch, 390px phone, unit + browser tests, sourced facts, For grown-ups page).

**Owner's choices (2026-11-25):** low-poly 3D look; chapters on an Africa map + timeline; **eight chapters** (Egypt, Kush, Mali, Dogon, Zulu Kingdom, Maasai, Great Zimbabwe, Aksum); this game **replaces** the planned Ancient Egypt Explorer (`ancient-egypt-explorer`, currently `hidden: true` in `lib/content/games.ts` → `/lessons/ancient-egypt-explorer.html`), and `/games/ancient-egypt-explorer` redirects to the new game in `next.config.js` when it ships.

---

## 1. The game

**Working title:** *Kingdom Builders: Africa* (alternatives: *Griot's Kingdoms*, *Roots of the Kingdoms*). Grades **3–5** (stretches to 6). Slug `african-kingdoms-builder`.

**Host:** **Jeli Awa**, a young griot (jeli, the Mande storyteller-historians of West Africa) with a kora. Her songs carry you through time to each place — which also teaches that oral history is real history. **Sidekick:** **Koko**, a ground hornbill who flies ahead, spots problems ("The granary is almost empty!") and points at combos. Each chapter adds a local guide (a farmer, scribe, iron-smith, trader, herder) from that people.

**Structure: a campaign of chapters on a map of Africa.** These peoples lived thousands of years apart (Egypt ~3100 BCE; Mali 1235–1600 CE; the Zulu Kingdom 1800s; the Maasai today), so instead of one map, the **hub is a 3D map of Africa with a timeline ribbon**. Each chapter is its own build map in that people's real landscape. A placed pin on the map + the timeline teaches *where* and *when*.

**Core loop (one chapter, ~20–30 min, saved between visits):**
1. **Arrive** on a small map in the real biome (Nile floodplain, Sahel river bend, cliff escarpment, grassland hills, savanna).
2. **Villagers gather** the local resources (AoE-style little workers walking to fields, river, quarry): food, water, building material (mud brick, stone, grass/reed, timber) and one **signature resource** (Nile silt, iron, salt and gold, millet, cattle).
3. **Build** homes, fields, granaries, workshops, markets, schools, places to gather. Buildings are the real ones (mud-brick houses, shaduf, granary, iron furnace, beehive houses, enkang).
4. **Keep people well:** a **Prosperity** wheel with five needs — Food, Water, Shelter, Joy (music, festivals), Knowledge. Children see *why* a need drops.
5. **The land sets the rhythm:** seasons that matter to that people (Egypt's three Nile seasons Akhet/Peret/Shemu; the Sahel's rainy and dry season; Maasai long and short rains). Natural challenges replace enemies: a low flood, drought, locusts, overgrazing, cutting too many trees.
6. **Milestones** (like AoE age-ups, but peaceful): "Village → Town → City → Golden Age". Each needs a target + answering the chapter's **Story Questions** (Jeli Awa's questions, with the kit's hint ladder). Each milestone unlocks a building and a **story card** (fact + "How do we know?").
7. **Trade, not war:** caravans, river boats and dhows connect to neighbors; you trade surplus for what your land lacks (salt for gold). Diplomacy = gifts and festivals.
8. **Wonder + finale:** each chapter ends by completing that people's **great work** (a pyramid, Djenné's mosque, Dogon granaries and the togu na, a royal homestead) and a celebration scene; Jeli Awa sings the chapter's story, and a debrief "talk it through" question.

**Between chapters:** the **Griot's Book** (a collection of story cards, artifacts and the people's map pins), the timeline filling in, and a **Trade Map finale** linking every chapter's kingdom along real trade routes (Nile, trans-Saharan, Indian Ocean). After that: **Free Build** sandbox for replay.

**Peaceful by design:** no armies, no battles, no conquest. Where history included conflict (Shaka's Zulu, Kush and Rome), the game doesn't hide it but leaves it to the For grown-ups page with a talking point; the game focuses on daily life, farming, building, trade, knowledge and art.

---

## 2. What children learn (learning design)

### 2.1 Big ideas across the whole game (C3 framework, grades 3–5)
| Big idea | How the game teaches it | Standards |
|---|---|---|
| **The land shapes how people live** (geography → food, homes, materials) | Each map's biome decides what you can farm and build with; wrong-biome choices simply don't work and Koko says why | D2.Geo.4.3-5, D2.Geo.6.3-5 |
| **Surplus and specialization** (extra food frees people to be scribes, smiths, builders) | Jobs unlock only when the granary has surplus | D2.Eco.1.3-5, D2.His.2.3-5 |
| **Trade connects people** (goods *and* ideas move) | Caravans carry salt/gold and also bring books, scholars, new crops | D2.Geo.7.3-5 (standard codes double-checked against the C3 framework when the plan PR is written) |
| **Living with the environment** (sustainability) | Overgrazing, deforestation (Meroë's iron furnaces), water storage | D2.Geo.5.3-5 |
| **How do we know?** (evidence: artifacts, buildings, writing, oral history) | Every story card names its evidence: hieroglyphs, Meroitic script, Timbuktu manuscripts, griot songs, archaeology | D2.His.10.3-5, D2.His.12.3-5 |
| **Time and place** (Africa is a continent of many peoples across thousands of years) | Map pins + timeline ribbon | D2.His.1.3-5, D2.Geo.2.3-5 |

### 2.2 Chapter by chapter
| Chapter (guide) | Land & signature resource | Food & farming | Way of life & homes | Knowledge & achievements | Great work |
|---|---|---|---|---|---|
| **Ancient Egypt** (~3100–30 BCE) | Nile valley in desert; **flood silt** | Nile flood calendar, basin irrigation, shaduf; wheat, barley, flax, papyrus | Mud-brick houses, farming families, scribes | Hieroglyphs, papyrus, 365-day calendar, paid pyramid workers (Giza workers' village) | A pyramid (and the workers' town) |
| **Kush / Meroë** (~2500 BCE–350 CE) | Nile south of Egypt; **iron** | Sorghum, cattle, river farming | Kandakes (ruling queens), towns along the river | Iron smelting, Meroitic script, Kush ruled Egypt (25th Dynasty), more pyramids than Egypt | Meroë's steep pyramids + iron works |
| **Mali Empire** (1235–1600 CE) | Niger River bend, Sahel; **salt ↔ gold** trade | Rice, millet, sorghum, fishing | Market towns, griots, Sundiata's story | Timbuktu scholars & manuscripts, Mansa Musa (1324), trans-Saharan camel caravans | Djenné's mud mosque + the yearly community replastering festival |
| **Dogon** (cliff villages since ~1400s, living people today) | Bandiagara Escarpment; **millet** + scarce water | Millet terraces, small dams, onion fields | Cliff villages, granaries with straw roofs, the **togu na** (low-roofed meeting place where you sit to talk calmly) | Farming dry land, masks and dance traditions (shown respectfully) | The village with granaries and togu na |
| **Zulu Kingdom** (1800s, people today) | Green rolling hills of KwaZulu-Natal; **cattle** | Sorghum, maize, pumpkins, amasi (sour milk) | The circular homestead (umuzi) with the cattle enclosure (isibaya) in the center, grass beehive houses | Beadwork colors carrying messages, cattle as wealth | A royal homestead |
| **Maasai** (living people of Kenya and Tanzania) | Great Rift Valley savanna; **cattle** + grass | Herding, milk; moving herds with the rains | Semi-nomadic; enkang homes built by women from branches, mud and dung; age sets | Rotating grazing (sustainability), living alongside wildlife | A thriving enkang and healthy grasslands (no building wonder — the lesson is balance) |
| **Aksum** (~100–940 CE; Ethiopia/Eritrea) | Highlands near the Red Sea; **trade goods + coins** | Teff (injera), wheat, terraced highland farming | Stone towns, Red Sea port of Adulis, traders from Rome, Arabia, India | Its own coins, Ge'ez script (still used today), one of the great powers of its time | The tall carved stelae |
| **Great Zimbabwe** (~1100–1450 CE) | Southern plateau grasslands; **gold + cattle** | Sorghum, millet, cattle herding | Hilltop and valley enclosures, family homesteads | Dry-stone walls built with no mortar; gold traded to the Swahili coast (Chinese pottery and Persian beads found there = evidence) | The Great Enclosure |

*Later expansions (not in this release):* Kingdom of Benin (bronze-casting guilds, city walls), Swahili Coast (monsoon dhow trade, coral-stone towns).

The eight chapters unlock in time order on the timeline (Egypt → Kush → Aksum → Great Zimbabwe → Mali → Dogon → Zulu → Maasai), but a child can replay any open chapter.

Note for accuracy: the Dogon and Maasai are **peoples**, not empires, and are living cultures — the game speaks about them in the present tense and calls the series "kingdoms and peoples".

### 2.3 Mistakes the wrong answers come from (misconceptions to correct)
- Africa is one country / everyone in Africa lived the same way
- Africa is all jungle or all desert
- Egypt isn't really part of Africa
- Kush was just a part of Egypt (Kush also ruled Egypt)
- African history began when Europeans arrived
- There was no writing in Africa (hieroglyphs, Meroitic, Ge'ez, Arabic manuscripts in Timbuktu)
- Mud buildings are "primitive" (Djenné is the largest mud-brick building in the world and is maintained by engineering + community)
- The pyramids were built by enslaved people (evidence points to paid, fed workers)
- Oral history isn't real history (griots kept history for centuries)
- The Maasai and Dogon only existed in the past
- More cattle/more trees cut is always better (overgrazing, deforestation)

### 2.4 Learning loop details (kit standard)
- **Story Questions** at milestones and in the Griot's Book, 3 levels per chapter, mastery model adapts (`kit/learning/mastery.ts`).
- **Hint ladder:** nudge ("What does the river bring each year?") → picture (the flood animation on the map) → answer + explanation.
- **Debrief** at each chapter's end: "Why did Mali's traders want salt so much?"
- **For grown-ups page:** what each chapter teaches, standards, sources, a talking point, and the sensitive topics left out (conflict, the slave trades, colonialism) with guidance.
- **Sources** listed in-game (Smithsonian NMAfA, British Museum, UNESCO World Heritage, Metropolitan Museum, Oriental Institute, academic Africanist sources). A cultural/history review before shipping.

---

## 3. Look and tech: a modern low-poly 3D look

- **Style:** stylized **low-poly 3D with soft lighting** (flat-shaded, warm earth palette per biome, gentle shadows, tilt-shift depth of field, day/night and season tints). A tilted, rotatable city-builder camera (perspective, zoom, 90° rotate, pan; one-finger pan/pinch on touch).
- **Models built in code** (procedural Three.js geometry: mud-brick houses, beehive huts, granaries, palms, cattle, villagers), consistent with the repo rule "art made for the game, nothing from other websites". Larger wonders can optionally be modeled in Blender and bundled as local `.glb` (still no network requests).
- **Performance:** `InstancedMesh` for villagers, crops, trees and herds; merged static geometry; a low-detail mode (no shadows/DOF) in settings; 60 fps target, 30 fps floor.
- **New piece of kit:** `src/kit/render/lowpolyRenderer.ts` (scene, lights, camera rig, picking, grid) + `src/kit/world/lowpoly/` (procedural model helpers). The pixel renderer stays untouched. UI keeps the kit's systems but gets a cleaner modern skin (rounded panels, Atkinson Hyperlegible, a display font bundled locally).
- **Game files** (`src/games/african-kingdoms-builder/`), mirroring Ecosystem Building Tycoon: `main.ts`, `game.ts` (state, loop), `map.ts` (grid, terrain), `sim.ts` (gathering, needs, seasons — pure functions), `buildings.ts`, `chapters/<people>.ts` (data per chapter), `problems.ts` (questions), `content.ts` (all words, reviewable on their own), `models.ts`, `save.ts`, `guide.ts` (grown-ups).

---

## 4. How it gets built (each step ends with an owner look)

0. **Branch:** worktree off `origin/main` outside OneDrive (e.g. `C:/tmp/la-african-kingdoms`), branch `claude/african-kingdoms-builder`; `npm ci`, `npx prisma generate`, `npm --prefix games-src/adventures install`.
1. **Plan PR:** add this design as a History section in `docs/GAMES_3D_UPGRADE_PLAN.md` (Phase 3) with the owner's choices recorded.
2. **Look preview:** the low-poly renderer + the Egypt map by day and in the flood season, villagers walking, a few buildings, Jeli Awa and Koko, the Africa hub map. Screenshots desktop + phone.
3. **Part 1:** the core sim (gathering, needs, seasons, building, milestones, trade), the hub map and timeline, **Egypt, Kush and Aksum**, Story Questions, saving, grown-ups page.
4. **Part 2:** **Great Zimbabwe, Mali and the Dogon**, the Griot's Book.
5. **Part 3:** **Zulu Kingdom and Maasai**, the Trade Map finale, Free Build, site listing in `lib/content/games.ts` (replacing the `ancient-egypt-explorer` entry) + redirect + thumbnail, deleting `/lessons/ancient-egypt-explorer.html`.

## 5. Verification
- `npm --prefix games-src/adventures test`: unit tests for every sim rule (gathering rates, needs, Nile flood season, overgrazing), milestone math, that each chapter is winnable from a seeded start, and every question at every level (correct answer present, distractors from the misconception list).
- Browser test `scripts/e2e-african-kingdoms-builder.mjs` (Playwright, like the other e2e scripts): title → hub → a full Egypt chapter → a trade → a milestone with a miss + hints → save/reload → phone width.
- `npm --prefix games-src/adventures run build`, check no network requests and no emoji (site content test `tests/content/`), FPS check, screenshots, rubric score ≥ 8.5, then owner check-in.

## 6. Look preview (built 2026-11-25)

Open with `npx vite --port 5179` in `games-src/adventures`, at `/lookdev/kingdoms/` (not part of the site build):

| Page | What it shows |
|---|---|
| `#hub` | Africa as a board of hexagon tiles colored by land (desert, Sahel, savanna, rainforest, highlands, Kalahari), the Nile, Niger, Congo, Zambezi and Orange rivers and the big lakes, the green Nile strip through the desert, snowy Kilimanjaro, the Giza pyramids, a pin for each of the eight chapters, and the "When they lived" timeline on one scale (an arrow for peoples who live on today) |
| `#cast` | Jeli Awa with her kora, Koko the ground hornbill, Nebet, villagers, and the Egypt pieces: mud-brick house, granary, wheat field, date palm, papyrus, shaduf, reed boat, a pyramid going up |
| `#egypt` | Peret, the growing season: the Nile, Kemet (the black land) and Deshret (the red land), green fields with canals, two villages on mounds, shadufs lifting water, boats, a pyramid with its ramp, the builders’ town and bakery, villagers carrying water and working, the resource bar, the season wheel, Prosperity, the build bar and Jeli Awa’s talk card |
| `#egypt-flood` | Akhet: the flood covers the fields but not the villages on their mounds; more people at the pyramid |
| `#egypt-harvest` | Shemu: gold wheat, the river at its lowest |
| `#egypt-evening` | Dusk light with lamps in the villages |

Built: `src/kit/render/lowpolyRenderer.ts` (new kit renderer; the pixel renderer is not changed), `src/kit/world/lowpoly/shapes.ts`, and in `src/games/african-kingdoms-builder/`: `africa.ts` (the picture geography), `egyptMap.ts` (the Nile, zones and the flood as pure functions), `models.ts`, `egyptScene.ts`, `hubScene.ts`, `content.ts`, `icons.ts`, `portrait.ts`, `akb.css`. The display font Fredoka is bundled from `@fontsource/fredoka` (no requests to other websites).

Checks: 10 unit tests in `tests/akb.test.ts` (chapters on land and the river kingdoms on their rivers, the biomes, the Nile strip, the dates, the flood never reaching the mounds, desert or plateau, no emoji); `scripts/akb-lookdev-shots.mjs` loads all six pages at 1280×800 and 390×844 with no errors, no requests to other websites and no sideways scrolling (36/36).

Not in the preview yet (part 1): placing buildings, gathering and the needs actually changing, Story Questions, saving, sound and the For grown-ups page. The numbers in the top bar are for show.
