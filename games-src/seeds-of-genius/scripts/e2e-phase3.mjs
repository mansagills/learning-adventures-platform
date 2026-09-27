// Phase 3 check-in test: Chapter 3 "The Soil Speaks / Virtual Soil Lab".
// Starts from a real Phase 2 save (Chapter 2 complete), plays the chapter
// with real keyboard and mouse input, checks each acceptance criterion and
// captures the check-in screenshots.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/e2e-phase3.mjs [baseUrl]
import { mkdirSync, writeFileSync } from 'node:fs';
import {
  results,
  consoleErrors,
  check,
  watch,
  state,
  sleep,
  walkPath,
  tapKey,
  dialogueText,
  advanceUntil,
  finishDialogue,
  clickChoice,
  layoutProblems,
  launch,
  waitTarget,
} from './e2e-lib.mjs';

const BASE = process.argv[2] ?? 'http://localhost:4173/';
const OUT = 'test-output/phase3';
mkdirSync(OUT, { recursive: true });
const browser = await launch();

const done = (steps = []) => ({ stage: 'complete', stepsDone: steps, flags: [], rewarded: true });
// A save exactly as Phase 2 wrote it: Chapter 2 complete, Chapter 3 'locked'.
const PHASE2_SAVE = {
  version: 2,
  createdAt: 1,
  savedAt: 1,
  customized: true,
  appearance: { skin: 'skin5', hairStyle: 'locs', hairColor: 'darkbrown', outfit: 'purple', accessory: 'headband' },
  world: { scene: 'hub', x: 19.5, y: 9.6, facing: 'up' },
  time: { minutes: 10 * 60, day: 4, paused: true },
  progress: {
    xp: 360,
    seeds: 53,
    chapters: {
      practice: done(['get_seeds']),
      ch1: done(['get_notebook', 'get_lens', 'observe_sort']),
      ch2: done(['get_record', 'get_sketch', 'build_timeline']),
      ch3: { stage: 'locked', stepsDone: [], flags: [], rewarded: false },
    },
    inventory: [
      { itemId: 'seed_packet', from: 'mae', obtainedAt: 1, used: true, usedIn: 'x', inspected: true },
      { itemId: 'nature_card', from: 'carver', obtainedAt: 4, used: false, inspected: true },
      { itemId: 'journey_card', from: 'carver', obtainedAt: 8, used: false, inspected: true },
    ],
  },
  learner: {},
  log: [],
  tips: ['move', 'findCarver', 'talk', 'journal', 'bag', 'rest'],
  chapterData: { ch2: { visited: ['reading', 'neosho', 'kansas', 'highland', 'simpson', 'iowastate'], phase: 'done', barrier: 'highland', support: 'budd' } },
  memories: ['childhood'],
};

async function openWithSave(page, save) {
  await page.goto(BASE);
  await page.evaluate((s) => {
    localStorage.clear();
    localStorage.setItem('seedsOfGenius.save', JSON.stringify(s));
  }, save);
  await page.reload();
  await sleep(page, 900);
  await page.getByRole('button', { name: 'Continue' }).click();
  for (let i = 0; i < 30 && !(await state(page)).runtimesReady; i++) await sleep(page, 100);
  await sleep(page, 400);
}
async function reloadAndContinue(page) {
  await page.reload();
  await sleep(page, 900);
  await page.getByRole('button', { name: 'Continue' }).click();
  for (let i = 0; i < 30 && !(await state(page)).runtimesReady; i++) await sleep(page, 100);
  await sleep(page, 400);
}
async function talk(page) {
  await page.keyboard.press('e');
  for (let i = 0; i < 20 && !(await page.locator('.dialogue').count()); i++) await sleep(page, 100);
}
async function sees(page, re) {
  for (let i = 0; i < 30; i++) {
    if (re.test(await dialogueText(page))) return true;
    await sleep(page, 100);
  }
  return false;
}
async function closeModal(page) {
  await page.keyboard.press('Escape');
  await sleep(page, 300);
}
async function toRoad(page) {
  const { player } = await state(page);
  if (Math.abs(player.y - 9.6) > 0.3) await walkPath(page, [[player.x, 9.6]]);
}
async function toCarver(page) {
  await toRoad(page);
  await walkPath(page, [[19.5, 9.6], [19.5, 7.5], [20.3, 7.5]]);
  await tapKey(page, 'ArrowRight', 30);
}
/** Walk the farm on its paths: row 8.5 across, column 7.9 up and down. */
async function farmTo(page, x, y) {
  const { player } = await state(page);
  if (Math.abs(player.x - x) > 0.3) await walkPath(page, [[player.x, 8.5], [x, 8.5]]);
  await walkPath(page, [[x, y]]);
}
async function planner(page) {
  return page.locator('.planner-modal');
}
async function testPlan(page, plan) {
  for (let i = 0; i < 4; i++) await page.locator(`[data-slot="${i}"][data-crop="${plan[i]}"]`).click();
  await page.locator('.planner-modal [data-test]').click();
  for (let i = 0; i < 40 && !(await page.locator('.planner-modal [data-msg]').count()); i++) await sleep(page, 100);
  await sleep(page, 200);
  return (await page.locator('.planner-modal [data-msg]').textContent()) ?? '';
}
const msg = async (page) => (await page.locator('.planner-modal [data-msg]').textContent()) ?? '';

// =====================================================================
// Desktop, 1280x720
// =====================================================================
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
watch(page, 'desktop');
await openWithSave(page, PHASE2_SAVE);
let s = await state(page);
check('A Phase 2 save loads; Chapter 3 opens and Carver offers it', s.chapters.ch3 === 'available' && /Carver/.test(s.objective), s.objective);

// --- Carver assigns the soil quest ---
await toCarver(page);
await talk(page);
check('Carver opens Chapter 3 about the tired field', await sees(page, /Mr\. Hill/));
await advanceUntil(page, /asks the soil/);
await clickChoice(page, /How can soil be alive/);
check('Branch: Carver explains that soil is alive', await sees(page, /roots, worms/));
await advanceUntil(page, /Mae at the Seed & Mail/);
await sleep(page, 300);
await page.screenshot({ path: `${OUT}/01-carver-quest.png` });
await finishDialogue(page);
s = await state(page);
check('Quest accepted; next task is Mr. Hill', s.chapters.ch3 === 'active' && /Mr\. Hill/.test(s.objective), s.objective);

// --- Mr. Hill gives the soil samples and the crop history ---
await toRoad(page);
await walkPath(page, [[31.5, 9.6], [31.5, 9.5]]);
await tapKey(page, 'ArrowUp', 30);
s = await state(page);
check('Mr. Hill is by the farm gate', /Mr\. Hill/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /five years running/);
await clickChoice(page, /Why not plant something else/);
check("Mr. Hill states his need: the plan must still grow cotton", await sees(page, /still need some cotton/));
await advanceUntil(page, /two jars of soil/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/02-farmer-gives-samples.png` });
await finishDialogue(page);
s = await state(page);
check('Mr. Hill grants the soil samples and the crop history', ['soil_samples', 'crop_history'].every((id) => s.inventory.some((e) => e.itemId === id && e.from === 'amos')));
check('Next task: Mae', /Mae/.test(s.objective), s.objective);

// --- Carver's waiting talk ---
await toCarver(page);
await talk(page);
check("Carver's nudge points to Mae", await sees(page, /Mae at the Seed & Mail has the crop cards/));
await clickChoice(page, /What is nitrogen/);
check('Branch: Carver explains nitrogen in kid terms', await sees(page, /pantry/));
await finishDialogue(page);

// --- Mae gives the crop cards ---
await toRoad(page);
await walkPath(page, [[27.5, 9.6], [27.5, 19.6], [32.5, 19.6]]);
await tapKey(page, 'ArrowUp', 30);
await talk(page);
check('Mae offers crop cards', await sees(page, /crop cards for Mr\. Hill/));
await advanceUntil(page, /Four crops grow well/);
await clickChoice(page, /What is a legume/);
check('Mae explains legumes and root bumps', await sees(page, /bacteria turn air into nitrogen/));
await advanceUntil(page, /Take the whole set/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/03-seed-keeper-gives-cards.png` });
await finishDialogue(page);
s = await state(page);
check('Mae grants the crop cards', s.inventory.some((e) => e.itemId === 'crop_cards' && e.from === 'mae'));
check('Next task: the soil samples in Hilltop Farm (0/2)', /0\/2/.test(s.objective), s.objective);

// --- Through the farm gate ---
await walkPath(page, [[27.5, 19.6], [27.5, 9.6], [33.9, 9.6], [33.9, 8.4]]);
await tapKey(page, 'ArrowUp', 30);
await page.keyboard.press('e');
await sleep(page, 1200);
s = await state(page);
check('The farm gate opens onto the fields', s.scene === 'farm', s.scene);

// The bench says what is still needed.
await farmTo(page, 7.9, 3.8);
await tapKey(page, 'ArrowUp', 30);
await page.keyboard.press('e');
await sleep(page, 400);
check('The bench explains you must look at both samples first', await sees(page, /close look at the west plot soil/));
await finishDialogue(page);

// West plot: the tired soil, magnified.
await farmTo(page, 4.5, 7.6);
await page.keyboard.press('e');
await page.locator('.soil-modal').waitFor({ timeout: 3000 });
check("The magnified view shows Mr. Hill's ledger for this plot", /Cotton, cotton, cotton, cotton, cotton/.test((await page.locator('.soil-modal').textContent()) ?? ''));
for (const n of ['Look at the color of the soil', 'Look at the cracks on top', 'Look for roots and living things']) await page.getByRole('button', { name: n }).click();
await sleep(page, 200);
const west = (await page.locator('.soil-modal').textContent()) ?? '';
check('West soil: pale, crusted, almost lifeless', /Pale and dusty/.test(west) && /hard crust/.test(west) && /no worms/.test(west));
await page.screenshot({ path: `${OUT}/04-depleted-soil-view.png` });
await closeModal(page);

// East plot: healthy soil with root nodules.
await farmTo(page, 11.5, 7.6);
await page.keyboard.press('e');
await page.locator('.soil-modal').waitFor({ timeout: 3000 });
for (const n of ['Look at the color of the soil', 'Look at the wiggly thing', 'Look at the bumps on the old root']) await page.getByRole('button', { name: n }).click();
await sleep(page, 200);
const east = (await page.locator('.soil-modal').textContent()) ?? '';
check('East soil: dark, a worm, and nodules that turn air into nitrogen', /Dark brown/.test(east) && /earthworm/.test(east) && /nodules/.test(east));
check('After both samples, a side-by-side comparison appears', await page.locator('.soil-compare:not([hidden]) table').isVisible());
await closeModal(page);
s = await state(page);
check('Next task: test plans at the bench', /Test planting plans/.test(s.objective), s.objective);
await farmTo(page, 7.9, 8.5);
await page.screenshot({ path: `${OUT}/05-farm-plots.png` });

// --- The planner ---
await farmTo(page, 7.9, 3.8);
await tapKey(page, 'ArrowUp', 30);
await page.keyboard.press('e');
await page.locator('.planner-modal').waitFor({ timeout: 3000 });
check('Planner shows the crop cards with legumes marked, and Mr. Hill\'s need', (await page.locator('.crop-card.legume').count()) === 2 && /grow some cotton/.test((await page.locator('.planner-modal').textContent()) ?? ''));
let m = await testPlan(page, ['cotton', 'cotton', 'cotton', 'cotton']);
check("Mr. Hill's plan: soil falls to worn out, harvests shrink", /fell from 28 to 5/.test(m) && /smaller/.test(m), m.slice(0, 90));
check('Each season shows a labeled soil meter and a harvest range', (await page.locator('.season-row').count()) === 4 && (await page.locator('.meter.harvest .meter-range').count()) === 4);
check('The model is labeled as a simple model with uncertainty', /simple model, not a promise/.test((await page.locator('.planner-modal').textContent()) ?? ''));
check('No "why" question yet: one plan is not a comparison', (await page.locator('.why-panel').count()) === 0);
m = await testPlan(page, ['peanuts', 'cotton', 'sweetpotato', 'cotton']);
check('A plan whose soil still falls gets an explanation', /ends lower than it started/.test(m), m.slice(0, 90));

// Reload in the middle of the lab.
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Reload mid-lab: still in the farm, both tested plans kept', s.scene === 'farm' && s.ch3Data?.tested?.length === 2, JSON.stringify(s.ch3Data?.tested));
await farmTo(page, 7.9, 3.8);
await tapKey(page, 'ArrowUp', 30);
await waitTarget(page, /Plan the seasons/);
await page.keyboard.press('e');
await page.locator('.planner-modal').waitFor({ timeout: 3000 });
check('The planner reopens with the plans table and the soil chart', (await page.locator('.plans-table tbody tr').count()) === 2 && (await page.locator('.soil-chart polyline').count()) === 2);

// The why question, wrong then right.
await page.locator('[data-why="bored"]').click();
await sleep(page, 200);
check('A wrong "why" answer is explained', /doesn't get bored/.test((await page.locator('.why-panel').textContent()) ?? ''));
await page.locator('[data-why="nitrogen"]').click();
await sleep(page, 300);
check('The right "why" answer unlocks choosing a plan', (await page.locator('[data-choose]').count()) === 2);

// Choosing plans that don't fit climbs the hint ladder to a worked example.
await page.locator('[data-choose="1"]').click();
await sleep(page, 200);
m = await msg(page);
check('Hint 1 names the legumes', /Peanuts and cowpeas are legumes/.test(m), m.slice(0, 90));
await page.locator('[data-choose="0"]').click();
await sleep(page, 200);
check('Hint 2 suggests legume, cotton, legume, cotton', /legume, cotton, legume, cotton/.test(await msg(page)));
await page.locator('[data-choose="0"]').click();
await sleep(page, 200);
check('Hint 3 fills in a worked example', /Worked example/.test(await msg(page)) && (await page.getByRole('button', { name: 'Fill in the example plan' }).count()) === 1);
m = await testPlan(page, ['cowpeas', 'cotton', 'peanuts', 'cotton']);
check('The rotation raises the soil a little, not all at once', /28 to 31/.test(m) && /slowly/.test(m), m.slice(0, 90));
await page.locator('.soil-chart').scrollIntoViewIfNeeded();
await sleep(page, 200);
await page.screenshot({ path: `${OUT}/06-rotation-planner.png` });
await page.locator('[data-choose="2"]').click();
await sleep(page, 400);
check('A good plan is accepted', /Great plan/.test(await msg(page)));
await closeModal(page);
s = await state(page);
check('Minigame step completes and all three items are marked used', s.chapters.ch3 === 'active' && ['soil_samples', 'crop_history', 'crop_cards'].every((id) => s.inventory.find((e) => e.itemId === id)?.used));
check('Next task: return to Carver', /Return to Carver/.test(s.objective), s.objective);

// --- Back to town and Carver ---
await farmTo(page, 7.9, 10.2);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1200);
s = await state(page);
check('Walking out the farm path returns to town by the gate', s.scene === 'hub' && Math.abs(s.player.x - 33.9) < 1, JSON.stringify(s.player));
await toCarver(page);
await talk(page);
check('Carver reads the plan the player chose', await sees(page, /cowpeas, cotton, peanuts, cotton/));
await page.keyboard.press('Space');
await advanceUntil(page, /Cotton every season would take/);
const cmp = await dialogueText(page);
check("Carver compares the player's plan with cotton every season", /down to 5: worn out/.test(cmp) && /Your plan ends at 31/.test(cmp), cmp.slice(0, 100));
await page.screenshot({ path: `${OUT}/07-carver-debrief-comparison.png` });
await page.keyboard.press('Space');
await advanceUntil(page, /Your plan plants cotton/);
check('Carver notes the plan grows more cotton in all', /more cotton in all/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /What did the legumes/);
await clickChoice(page, /fixed all of the soil/);
check('The "instant fix" myth gets a clear correction', /Not so fast/.test((await page.locator('.dialogue .feedback').textContent()) ?? ''));
await clickChoice(page, /a little nitrogen each season/);
await page.keyboard.press('Space');
await advanceUntil(page, /changed your answer/);
check('Carver notices the changed answer and says results depend on weather', /weather/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /see a memory/);
await clickChoice(page, /show me the memory/);
await page.locator('.memory-modal').waitFor({ timeout: 3000 });
const mem = (await page.locator('.memory-modal').textContent()) ?? '';
check('Memory: Tuskegee, test plots, labeled as history', /Tuskegee/.test(mem) && /test plots/.test(mem) && /A memory from Carver's life/.test(mem));
await page.getByRole('button', { name: 'Next page' }).click();
check('Memory page 2: rotating cotton with legumes', /peanuts or peas/.test((await page.locator('.memory-caption').textContent()) ?? ''));
await page.screenshot({ path: `${OUT}/08-memory-tuskegee.png` });
await page.getByRole('button', { name: 'Close the memory' }).click();
await sleep(page, 300);
await advanceUntil(page, /Crop-Rotation Planner/);
await finishDialogue(page);
await sleep(page, 500);
s = await state(page);
check('Chapter 3 complete; Carver gave the Crop-Rotation Planner', s.chapters.ch3 === 'complete' && s.inventory.some((e) => e.itemId === 'rotation_card' && e.from === 'carver'));
check('Rewards: +150 XP and +20 Seeds', s.xp === 360 + 150 && s.seeds === 53 + 20, `xp ${s.xp}, seeds ${s.seeds}`);
check('Chapter 4 shows as unlocked, arriving next', s.chapters.ch4 === 'locked' && /Chapter 4 is unlocked/.test(s.objective), s.objective);
check('Learner model records the soil objective', !!s.learner.soil && s.learner.soil.correct >= 4, JSON.stringify(s.learner.soil ?? {}));

// --- Journal ---
await page.keyboard.press('j');
await sleep(page, 400);
const jt = (await page.locator('.modal .content').textContent()) ?? '';
check('Journal shows the soil notes, tested plans, reflection and activity', /Soil lab notes/.test(jt) && /Your chosen plan/.test(jt) && /Chapter reflection/.test(jt) && /Crop-Rotation Planner/.test(jt));
await page.getByRole('heading', { name: /Soil lab notes/ }).scrollIntoViewIfNeeded();
await sleep(page, 200);
await page.screenshot({ path: `${OUT}/09-journal-soil.png` });
await page.locator('.activity', { hasText: 'Crop-Rotation Planner' }).getByRole('button', { name: 'Open the printable card' }).click();
await sleep(page, 300);
check('Printable Crop-Rotation Planner opens', /My Crop-Rotation Planner/.test((await page.locator('.print-card').textContent()) ?? ''));
await closeModal(page);
await closeModal(page);

// --- Replay: the planner still works, no duplicate rewards ---
await toRoad(page);
await walkPath(page, [[33.9, 9.6], [33.9, 8.4]]);
await tapKey(page, 'ArrowUp', 30);
await page.keyboard.press('e');
await sleep(page, 1200);
await farmTo(page, 7.9, 3.8);
await page.keyboard.press('e');
await page.locator('.planner-modal').waitFor({ timeout: 3000 });
await testPlan(page, ['cotton', 'cowpeas', 'cotton', 'peanuts']);
await page.locator('[data-choose]').last().click();
await sleep(page, 300);
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Replaying the lab gives no duplicate rewards; completion survives reload', s.chapters.ch3 === 'complete' && s.xp === 510 && s.seeds === 73, `xp ${s.xp}`);
await ctx.close();

// =====================================================================
// Narrow phone, 390x844, touch
// =====================================================================
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await phone.newPage();
watch(p2, 'narrow');
const mid = JSON.parse(JSON.stringify(PHASE2_SAVE));
mid.world = { scene: 'farm', x: 7.9, y: 3.8, facing: 'up' };
mid.progress.chapters.ch3 = { stage: 'active', stepsDone: ['get_samples', 'get_cards'], flags: [], rewarded: false };
for (const [id, from] of [['soil_samples', 'amos'], ['crop_history', 'amos'], ['crop_cards', 'mae']])
  mid.progress.inventory.push({ itemId: id, from, obtainedAt: 9, used: false, inspected: true });
mid.chapterData.ch3 = { looked: { west: ['color', 'crust', 'life'], east: ['color', 'worm', 'nodules'] } };
await openWithSave(p2, mid);
await waitTarget(p2, /Plan the seasons/);
await p2.screenshot({ path: `${OUT}/10-narrow-farm.png` });
check('No clipped or off-screen UI at 390x844 (farm)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
await p2.locator('.touch-act').tap();
await p2.locator('.planner-modal').waitFor({ timeout: 3000 });
await p2.locator('[data-slot="0"][data-crop="cowpeas"]').tap();
await p2.locator('.planner-modal [data-test]').tap();
await sleep(p2, 2600);
check('Planning works with touch on a phone', (await p2.locator('.season-row').count()) === 4);
await p2.locator('.season-results').scrollIntoViewIfNeeded();
await p2.screenshot({ path: `${OUT}/11-narrow-planner.png` });
check('No clipped or off-screen UI at 390x844 (planner)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
const overflow = await p2.evaluate(() => {
  const m = document.querySelector('.planner-modal');
  return m.scrollWidth - m.clientWidth;
});
check('The planner has no sideways scrolling on a phone', overflow <= 1, String(overflow));
await closeModal(p2);
await phone.close();

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();
const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, passed, total: results.length, results, consoleErrors }, null, 2));
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
