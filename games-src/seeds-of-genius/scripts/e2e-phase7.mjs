// Phase 7 check-in test: Chapter 7 "Your Turn to Plant the Seeds / My Carver Project".
// Starts from a real Phase 6 save (Chapter 6 complete), plays the chapter
// and the ending with real keyboard and mouse input, checks each acceptance
// criterion and captures the check-in screenshots.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/e2e-phase7.mjs [baseUrl]
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
const OUT = 'test-output/phase7';
mkdirSync(OUT, { recursive: true });
const browser = await launch();

const done = (steps = []) => ({ stage: 'complete', stepsDone: steps, flags: [], rewarded: true });
// A save exactly as Phase 6 wrote it: Chapter 6 complete, Chapter 7 'locked'.
const PHASE6_SAVE = {
  version: 2,
  createdAt: 1,
  savedAt: 1,
  customized: true,
  appearance: { skin: 'skin4', hairStyle: 'puffs', hairColor: 'darkbrown', outfit: 'purple', accessory: 'sunhat' },
  world: { scene: 'hub', x: 19.5, y: 9.6, facing: 'up' },
  time: { minutes: 10 * 60, day: 9, paused: true },
  progress: {
    xp: 1030,
    seeds: 123,
    chapters: {
      practice: done(['get_seeds']),
      ch1: done(['get_notebook', 'get_lens', 'observe_sort']),
      ch2: done(['get_record', 'get_sketch', 'build_timeline']),
      ch3: done(['get_samples', 'get_cards', 'soil_lab']),
      ch4: done(['get_need', 'get_kit', 'invent']),
      ch5: done(['get_map', 'get_report_watts', 'get_report_pryor', 'help']),
      ch6: done(['get_tool', 'get_seeds', 'experiment']),
      ch7: { stage: 'locked', stepsDone: [], flags: [], rewarded: false },
    },
    inventory: ['nature_card', 'journey_card', 'rotation_card', 'invention_card', 'interview_card', 'experiment_card'].map((itemId, i) => ({ itemId, from: 'carver', obtainedAt: i + 1, used: false, inspected: true })),
  },
  learner: {},
  log: [],
  tips: ['move', 'findCarver', 'talk', 'journal', 'bag', 'rest'],
  chapterData: {},
  memories: ['childhood', 'tuskegee_soil', 'peanut_lab', 'movable_school', 'experiment_station'],
  cosmetics: ['fern'],
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
  for (let i = 0; i < 60; i++) {
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
  let { player } = await state(page);
  if (player.y > 17.5) await walkPath(page, [[27.5, player.y]]);
  else if (player.y > 10.5 && player.x < 26) await walkPath(page, [[22.4, player.y]]);
  player = (await state(page)).player;
  if (Math.abs(player.y - 9.6) > 0.3) await walkPath(page, [[player.x, 9.6]]);
}
async function toCarver(page) {
  await toRoad(page);
  await walkPath(page, [[19.5, 9.6], [19.5, 7.5], [20.3, 7.5]]);
  await tapKey(page, 'ArrowRight', 30);
}
async function toTheo(page) {
  await toRoad(page);
  await walkPath(page, [[27.5, 9.6], [27.5, 19.5], [26.6, 19.5]]);
  await tapKey(page, 'ArrowLeft', 30);
}
async function toLottie(page) {
  await toRoad(page);
  await walkPath(page, [[22.5, 9.6], [22.5, 14.5], [23.4, 14.5]]);
  await tapKey(page, 'ArrowRight', 30);
}
async function toWorkshopRoad(page, x) {
  const { player } = await state(page);
  if (player.y > 25) {
    await walkPath(page, [[x, 26.55]]);
    await tapKey(page, 'ArrowUp', 30);
    return;
  }
  await toRoad(page);
  await walkPath(page, [[27.5, 9.6], [27.5, 26.55], [x, 26.55]]);
  await tapKey(page, 'ArrowUp', 30);
}
async function toTable(page) {
  await toRoad(page);
  await walkPath(page, [[22.4, 9.6], [22.4, 16.5], [17, 16.5]]);
  await tapKey(page, 'ArrowUp', 30);
}
async function openTable(page) {
  await toTable(page);
  await waitTarget(page, /Carver Project|fair table/i);
  await page.keyboard.press('e');
  await page.locator('.project-modal').waitFor({ timeout: 3000 });
}
async function click(page, sel) {
  await page.locator(sel).first().click();
  await sleep(page, 150);
}
const msg = async (page) => (await page.locator('.project-modal [data-msg]').textContent().catch(() => '')) ?? '';
async function pickAll(page, opts) {
  for (const o of opts) await click(page, `[data-opt="${o}"]`);
}

// =====================================================================
// Desktop, 1280x720
// =====================================================================
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true });
const page = await ctx.newPage();
watch(page, 'desktop');
await openWithSave(page, PHASE6_SAVE);
let s = await state(page);
check('A Phase 6 save loads; Chapter 7 opens and Carver offers it', s.chapters.ch7 === 'available' && /Carver/.test(s.objective), s.objective);

// --- Carver assigns ---
await toCarver(page);
await talk(page);
check('Carver looks back at everything the player has done', await sees(page, /Look at all you have done/));
await advanceUntil(page, /Community Fair/);
await clickChoice(page, /What should I make/);
check('Carver: start with a real need', await sees(page, /start where every good invention starts/));
await advanceUntil(page, /Get the need cards/);
await sleep(page, 300);
await page.screenshot({ path: `${OUT}/01-carver-final-quest.png` });
await finishDialogue(page);
s = await state(page);
check('Quest accepted; next task is Theo', s.chapters.ch7 === 'active' && /Theo/.test(s.objective), s.objective);

// --- The fair table waits for the cards and the kit ---
await toTable(page);
check('The fair table stands in the square', await waitTarget(page, /fair table/i), (await state(page)).target?.label);
await page.keyboard.press('e');
check('The fair table asks for the need cards and the kit first', await sees(page, /Theo's need cards/));
await finishDialogue(page);

// --- Theo ---
await toTheo(page);
s = await state(page);
check('Theo is by the pond', /Theo/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /two problems/);
await clickChoice(page, /What did you notice/);
check('Branch: the garden dries out, and no shade at the bus stop', await sees(page, /bus stop/));
await advanceUntil(page, /need cards/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/02-neighbor-gives-need-cards.png` });
await finishDialogue(page);
s = await state(page);
check("Theo grants the kids' need cards", s.inventory.some((e) => e.itemId === 'need_cards' && e.from === 'theo'));

// --- Miss Lottie ---
await toLottie(page);
await talk(page);
await advanceUntil(page, /one is out in the gardens/);
await clickChoice(page, /Why do bees matter/);
check('Branch: bees carry pollen, so fewer bees means less food', await sees(page, /carry pollen/));
await finishDialogue(page);
s = await state(page);
check("Miss Lottie grants the neighbors' need cards", s.inventory.some((e) => e.itemId === 'neighbor_needs' && e.from === 'lottie'));

// --- Carver's waiting talk ---
await toCarver(page);
await talk(page);
check("Carver's nudge points to Mr. Brooks", await sees(page, /Mr\. Brooks, outside his workshop/));
await clickChoice(page, /my own need/);
check('Branch: yes, you can write your own need', await sees(page, /Of course/));
await finishDialogue(page);

// --- Mr. Brooks, the maker ---
await toWorkshopRoad(page, 35.5);
await talk(page);
await advanceUntil(page, /prototype kit for the fair/);
await clickChoice(page, /rule/);
check('Branch: build it, let someone try it, fix it, build it again', await sees(page, /fix what they find/));
await advanceUntil(page, /fair table is set up/);
await sleep(page, 300);
await page.screenshot({ path: `${OUT}/03-maker-gives-kit.png` });
await finishDialogue(page);
s = await state(page);
check('Mr. Brooks grants the prototype kit', s.inventory.some((e) => e.itemId === 'prototype_kit' && e.from === 'wendell'));
check('Next task: the fair table', /fair table/.test(s.objective), s.objective);

// --- The project table: choosing a need (typed path guardrails, then a card) ---
await walkPath(page, [[27.5, 26.55], [27.5, 9.6]]);
await openTable(page);
check('The project steps are shown', (await page.locator('.project-modal .stepper li').count()) === 4);
await click(page, '[data-own]');
check('A blank typed need is handled', /empty/.test(await msg(page)));
await page.locator('#own-need').fill('The kids at the park are stupid');
await click(page, '[data-own]');
check('Unkind words are turned away gently', /kind and safe/.test(await msg(page)));
await page.locator('#own-need').fill('Call my mom at 5551234567 about the park');
await click(page, '[data-own]');
check('Phone numbers are kept out', /phone numbers/.test(await msg(page)));
await page.locator('.need-cards').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/04-need-selection.png` });
await click(page, '[data-need="garden"]');
check("Choosing Theo's garden need moves on to the design", (await page.locator('[data-show]').count()) === 1);

// --- Design a first version (with problems) ---
await click(page, '[data-show]');
check('Showing an unfinished design lists what is missing', /Still to choose|Almost ready/.test(await msg(page)));
await pickAll(page, ['main:barrel', 'mat:new', 'extra:lock', 'ev:free', 'meas:likes', 'cmp:before_after', 'rep:once']);
await page.locator('.proj-builder').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/05-invention-builder.png` });
await click(page, '[data-show]');
const fb = (await page.locator('[data-feedback]').textContent()) ?? '';
check("Theo tries it: the barrel overflowed", /overflowed/.test(fb));
check('Rubric feedback: cost, the lock, and a plan that is hard to measure', /costs money/.test(fb) && /lock keeps neighbors out/.test(fb) && /hard to measure/.test(fb));
await page.locator('[data-feedback]').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/06-feedback.png` });

// Reload with feedback given but not yet revised.
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Reload mid-project: the first version and feedback are kept', s.ch7Data?.first?.main === 'barrel' && !s.ch7Data?.final, JSON.stringify(s.ch7Data?.first ?? {}).slice(0, 80));
await openTable(page);

// --- Revise once ---
await click(page, '[data-retest]');
check('Testing again without a fix asks for one', /First choose how to fix/.test(await msg(page)));
await click(page, '[data-opt="up:paint"]');
await click(page, '[data-retest]');
check('A fix that does not solve the problem is explained', /still spill/.test(await msg(page)));
await click(page, '[data-opt="up:overflow"]');
await click(page, '[data-retest]');
check('The rubric still points at the next problem (cost)', /costs money/.test(await msg(page)));
await pickAll(page, ['mat:scrap', 'extra:signup', 'meas:soil', 'rep:several', 'ev:fair']);
await page.locator('#proj-name').fill('The Rain Saver');
await page.locator('#proj-name').press('Tab');
await sleep(page, 150);
await click(page, '[data-retest]');
check('The revised project passes every check', /It works!/.test(await msg(page)));
const card = (await page.locator('.project-card').textContent()) ?? '';
check('Project card: need, idea, evidence, test plan and one revision', /The Rain Saver/.test(card) && /school garden/.test(card) && /Rain barrel/.test(card) && /Chapter 5/.test(card) && /damp/.test(card) && /overflow hose/.test(card));
await page.locator('.project-card').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/07-project-card.png` });
const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('[data-download]').click()]);
const dlPath = `${OUT}/my-carver-project.txt`;
await dl.saveAs(dlPath);
const { readFileSync } = await import('node:fs');
const dlText = readFileSync(dlPath, 'utf8');
check('Saving the card as a file works', dl.suggestedFilename() === 'my-carver-project.txt' && /What I changed after testing/.test(dlText));
await click(page, '[data-present]');
await closeModal(page);
s = await state(page);
check('Minigame step completes and all three items are marked used', s.chapters.ch7 === 'active' && ['need_cards', 'neighbor_needs', 'prototype_kit'].every((id) => s.inventory.find((e) => e.itemId === id)?.used));
check('Next task: return to Carver', /Return to Carver/.test(s.objective), s.objective);

// --- The finale with Carver ---
await toCarver(page);
await talk(page);
check('Carver names the project', await sees(page, /The Rain Saver/));
await page.keyboard.press('Space');
await advanceUntil(page, /You listened to Theo/);
await page.keyboard.press('Space');
await advanceUntil(page, /Your first version had a problem/);
check("Carver tells the player's revision story", /overflow hose/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /most like being a scientist/);
await clickChoice(page, /Fixing it after feedback/);
check('Carver answers the reflection choice', await sees(page, /takes courage/));
await advanceUntil(page, /not the same as my life's work/);
check('Carver celebrates without claiming the player equals him', /It is yours, and your town needs it/.test(await dialogueText(page)));
await page.screenshot({ path: `${OUT}/08-carver-ending.png` });
await advanceUntil(page, /one last memory/);
await clickChoice(page, /show me the memory/);
await page.locator('.memory-modal').waitFor({ timeout: 3000 });
check('Memory 1: the 1940 foundation for young scientists', /1940/.test((await page.locator('.memory-caption').textContent()) ?? ''));
await page.getByRole('button', { name: 'Next page' }).click();
check('Memory 2: the national monument, 1943', /1943/.test((await page.locator('.memory-caption').textContent()) ?? '') && /first national monument/.test((await page.locator('.memory-caption').textContent()) ?? ''));
await page.getByRole('button', { name: 'Close the memory' }).click();
await sleep(page, 300);
await advanceUntil(page, /Golden Seed/);
await page.keyboard.press('Space');
await page.locator('.journey-modal').waitFor({ timeout: 5000 });
const jm = (await page.locator('.journey-modal').textContent()) ?? '';
check('The journey opens: all seven chapters, finished, with their keepsakes', (await page.locator('.journey-card.done').count()) === 7 && /You planted every seed/.test(jm) && /Golden Seed Medal/.test(jm));
await page.screenshot({ path: `${OUT}/09-journey.png` });
await closeModal(page);
await finishDialogue(page);
await sleep(page, 500);
s = await state(page);
check('Chapter 7 complete; Carver gave the Golden Seed', s.chapters.ch7 === 'complete' && s.inventory.some((e) => e.itemId === 'golden_seed' && e.from === 'carver'));
check('Final rewards: +250 XP and +40 Seeds', s.xp === 1030 + 250 && s.seeds === 123 + 40, `xp ${s.xp}, seeds ${s.seeds}`);
check('The HUD says every chapter is finished', /finished every chapter/.test(s.objective), s.objective);
check('Learner model records the capstone objective', !!s.learner.capstone && s.learner.capstone.correct >= 2, JSON.stringify(s.learner.capstone ?? {}).slice(0, 120));

// --- Journal and reload ---
await page.keyboard.press('j');
await sleep(page, 400);
const jt = (await page.locator('.modal .content').textContent()) ?? '';
check('Journal shows the project and a way back to the journey', /My Carver Project/.test(jt) && /The Rain Saver/.test(jt) && (await page.locator('[data-journey]').count()) === 1);
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('The ending survives a reload with no duplicate rewards', s.chapters.ch7 === 'complete' && s.xp === 1280 && s.seeds === 163, `xp ${s.xp} seeds ${s.seeds}`);
await toCarver(page);
await talk(page);
check('Afterwards Carver offers the journey again', await sees(page, /Your journey is on the shelf/));
await clickChoice(page, /Show me my journey/);
await page.locator('.journey-modal').waitFor({ timeout: 3000 });
check('"Show me my journey" opens it from Carver too', (await page.locator('.journey-card.done').count()) === 7);
await closeModal(page);
await finishDialogue(page);
await ctx.close();

// =====================================================================
// The ending shelf, the typed-need path and the other branches
// =====================================================================
const ctxB = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const pb = await ctxB.newPage();
watch(pb, 'branches');
const ended = JSON.parse(JSON.stringify(PHASE6_SAVE));
ended.world = { scene: 'room', x: 6.5, y: 4, facing: 'up' };
ended.progress.chapters.ch7 = done(['get_kids_needs', 'get_neighbor_needs', 'get_kit', 'project']);
ended.progress.inventory.push({ itemId: 'golden_seed', from: 'carver', obtainedAt: 99, used: false, inspected: true });
await openWithSave(pb, ended);
await waitTarget(pb, /shelf/i);
await pb.keyboard.press('e');
await pb.locator('.journey-modal').waitFor({ timeout: 3000 });
check('After the story, the cottage shelf opens the journey', (await pb.locator('.journey-card').count()) === 7);
await closeModal(pb);

await openWithSave(pb, PHASE6_SAVE);
await toCarver(pb);
await talk(pb);
await advanceUntil(pb, /Community Fair/);
await clickChoice(pb, /good enough/);
check('Branch: every idea starts rough', await sees(pb, /Every idea starts rough/));
await finishDialogue(pb);
await toTheo(pb);
await talk(pb);
await advanceUntil(pb, /two problems/);
await clickChoice(pb, /How did you find/);
check('Branch: Theo observed and wrote things down', await sees(pb, /like with the ladybugs/));
await finishDialogue(pb);
await toLottie(pb);
await talk(pb);
await advanceUntil(pb, /one is out in the gardens/);
await clickChoice(pb, /What are they/);
check('Branch: Miss Lottie names both needs', await sees(pb, /vegetable scraps/));
await finishDialogue(pb);
await toWorkshopRoad(pb, 35.5);
await talk(pb);
await advanceUntil(pb, /prototype kit for the fair/);
await clickChoice(pb, /Why let someone try/);
check('Branch: the person who uses it sees what you missed', await sees(pb, /sees what you missed/));
await finishDialogue(pb);
await walkPath(pb, [[27.5, 26.55], [27.5, 9.6]]);
await openTable(pb);
await pb.locator('#own-need').fill('The park has nowhere to recycle bottles and cans');
await click(pb, '[data-own]');
check('A typed need also needs a kind of problem', /Choose what kind of problem/.test((await pb.locator('[data-msg]').textContent()) ?? ''));
await click(pb, '[data-cat="waste"]');
await click(pb, '[data-own]');
check('A typed need is accepted', /noticed yourself/.test((await pb.locator('[data-msg]').textContent()) ?? ''));
check('The typed need shows on the design step', /recycle bottles/.test((await pb.locator('.need-strip').textContent()) ?? ''));
await pickAll(pb, ['main:compost', 'mat:borrowed', 'extra:guide', 'ev:soil', 'meas:scraps', 'cmp:with_without', 'rep:several']);
await click(pb, '[data-show]');
check('Miss Lottie tests the typed-need project: the bin smelled', /smelled bad/.test((await pb.locator('[data-feedback]').textContent()) ?? ''));
for (let i = 0; i < 3; i++) await click(pb, '[data-retest]');
check('Hint level 3 offers a suggested fix', (await pb.getByRole('button', { name: 'Fill in a suggested fix' }).count()) === 1);
await pb.getByRole('button', { name: 'Fill in a suggested fix' }).click();
await click(pb, '[data-retest]');
check('The suggested fix passes', /It works!/.test((await pb.locator('[data-msg]').textContent()) ?? ''));
await click(pb, '[data-present]');
await closeModal(pb);
await ctxB.close();

// =====================================================================
// Narrow phone, 390x844, touch
// =====================================================================
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await phone.newPage();
watch(p2, 'narrow');
const mid = JSON.parse(JSON.stringify(PHASE6_SAVE));
mid.world = { scene: 'hub', x: 17, y: 16.5, facing: 'up' };
mid.progress.chapters.ch7 = { stage: 'active', stepsDone: ['get_kids_needs', 'get_neighbor_needs', 'get_kit'], flags: [], rewarded: false };
for (const [id, from] of [['need_cards', 'theo'], ['neighbor_needs', 'lottie'], ['prototype_kit', 'wendell']]) mid.progress.inventory.push({ itemId: id, from, obtainedAt: 9, used: false, inspected: true });
mid.chapterData.ch7 = { needId: 'bees' };
await openWithSave(p2, mid);
await waitTarget(p2, /Carver Project/);
await p2.screenshot({ path: `${OUT}/10-narrow-fair-table.png` });
check('No clipped or off-screen UI at 390x844 (town square)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
await p2.locator('.touch-act').tap();
await p2.locator('.project-modal').waitFor({ timeout: 3000 });
for (const o of ['main:flowers', 'mat:scrap', 'extra:signup', 'ev:observe', 'meas:bees', 'cmp:before_after', 'rep:several']) await p2.locator(`[data-opt="${o}"]`).tap();
await p2.locator('[data-show]').tap();
await sleep(p2, 300);
check('Designing works with touch on a phone', /flowers faded/.test((await p2.locator('[data-feedback]').textContent()) ?? ''));
await p2.locator('[data-feedback]').scrollIntoViewIfNeeded();
await p2.screenshot({ path: `${OUT}/11-narrow-feedback.png` });
check('No clipped or off-screen UI at 390x844 (project table)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
const overflow = await p2.evaluate(() => {
  const m = document.querySelector('.project-modal');
  return m.scrollWidth - m.clientWidth;
});
check('The project table has no sideways scrolling on a phone', overflow <= 1, String(overflow));
await closeModal(p2);
await phone.close();

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();
const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, passed, total: results.length, results, consoleErrors }, null, 2));
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
