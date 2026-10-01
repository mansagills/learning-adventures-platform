// Phase 6 check-in test: Chapter 6 "A Scientist's Method / Design Your Own Experiment".
// Starts from a real Phase 5 save (Chapter 5 complete), plays the chapter
// with real keyboard and mouse input, checks each acceptance criterion and
// captures the check-in screenshots.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/e2e-phase6.mjs [baseUrl]
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
const OUT = 'test-output/phase6';
mkdirSync(OUT, { recursive: true });
const browser = await launch();

const done = (steps = []) => ({ stage: 'complete', stepsDone: steps, flags: [], rewarded: true });
// A save exactly as Phase 5 wrote it: Chapter 5 complete, Chapter 6 'locked'.
const PHASE5_SAVE = {
  version: 2,
  createdAt: 1,
  savedAt: 1,
  customized: true,
  appearance: { skin: 'skin2', hairStyle: 'locs', hairColor: 'black', outfit: 'blue', accessory: 'glasses' },
  world: { scene: 'hub', x: 19.5, y: 9.6, facing: 'up' },
  time: { minutes: 10 * 60, day: 8, paused: true },
  progress: {
    xp: 830,
    seeds: 93,
    chapters: {
      practice: done(['get_seeds']),
      ch1: done(['get_notebook', 'get_lens', 'observe_sort']),
      ch2: done(['get_record', 'get_sketch', 'build_timeline']),
      ch3: done(['get_samples', 'get_cards', 'soil_lab']),
      ch4: done(['get_need', 'get_kit', 'invent']),
      ch5: done(['get_map', 'get_report_watts', 'get_report_pryor', 'help']),
      ch6: { stage: 'locked', stepsDone: [], flags: [], rewarded: false },
    },
    inventory: [
      { itemId: 'nature_card', from: 'carver', obtainedAt: 4, used: false, inspected: true },
      { itemId: 'journey_card', from: 'carver', obtainedAt: 8, used: false, inspected: true },
      { itemId: 'rotation_card', from: 'carver', obtainedAt: 12, used: false, inspected: true },
      { itemId: 'invention_card', from: 'carver', obtainedAt: 16, used: false, inspected: true },
      { itemId: 'interview_card', from: 'carver', obtainedAt: 20, used: false, inspected: true },
    ],
  },
  learner: {},
  log: [],
  tips: ['move', 'findCarver', 'talk', 'journal', 'bag', 'rest'],
  chapterData: {},
  memories: ['childhood', 'tuskegee_soil', 'peanut_lab', 'movable_school'],
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
  // From Miss Lottie, step around the square's bench first.
  if (player.y > 10.5 && player.y < 17 && player.x > 21 && player.x < 26) {
    await walkPath(page, [[22.4, player.y]]);
    player = (await state(page)).player;
  }
  // From the south road, go along it to the east road first.
  if (player.y > 25) {
    await walkPath(page, [[27.5, player.y]]);
    player = (await state(page)).player;
  }
  if (Math.abs(player.y - 9.6) > 0.3) await walkPath(page, [[player.x, 9.6]]);
}
async function toCarver(page) {
  await toRoad(page);
  await walkPath(page, [[19.5, 9.6], [19.5, 7.5], [20.3, 7.5]]);
  await tapKey(page, 'ArrowRight', 30);
}
async function toHattie(page) {
  await toRoad(page);
  await walkPath(page, [[13.5, 9.6]]);
  await tapKey(page, 'ArrowUp', 30);
}
async function intoGreenhouse(page) {
  await toRoad(page);
  await walkPath(page, [[19.5, 9.6], [19.5, 7.0]]);
  await tapKey(page, 'ArrowUp', 30);
  const ok = await waitTarget(page, /Greenhouse door/);
  await page.keyboard.press('e');
  await sleep(page, 1200);
  return ok;
}
/** Inside the greenhouse: along row 6.6 (below Mr. Reed), then up or down. */
async function ghTo(page, x, y, face = 'ArrowUp') {
  const { player } = await state(page);
  if (Math.abs(player.x - x) > 0.3) await walkPath(page, [[player.x, 6.6], [x, 6.6]]);
  await walkPath(page, [[x, y]]);
  if (face) await tapKey(page, face, 30);
}
async function openBench(page) {
  await ghTo(page, 7, 5.3);
  await waitTarget(page, /experiment bench/i);
  await page.keyboard.press('e');
  await page.locator('.lab-modal').waitFor({ timeout: 3000 });
}
async function click(page, sel) {
  await page.locator(sel).click();
  await sleep(page, 150);
}
const msg = async (page) => (await page.locator('.lab-modal [data-msg]').textContent().catch(() => '')) ?? '';

// =====================================================================
// Desktop, 1280x720
// =====================================================================
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
watch(page, 'desktop');
await openWithSave(page, PHASE5_SAVE);
let s = await state(page);
check('A Phase 5 save loads; Chapter 6 opens and Carver offers it', s.chapters.ch6 === 'available' && /Carver/.test(s.objective), s.objective);

// --- The greenhouse is shut until Carver asks ---
check('The greenhouse door offers to open', await intoGreenhouse(page));
check('Before the quest, the greenhouse stays shut', await sees(page, /Carver has a question/));
await finishDialogue(page);

// --- Carver assigns ---
await toCarver(page);
await talk(page);
check("Carver: Hattie's seedlings grow differently in different spots", await sees(page, /Hattie has a puzzle/));
await advanceUntil(page, /designs a fair test/);
await clickChoice(page, /What makes a test fair/);
check('Carver: change only ONE thing', await sees(page, /change only ONE thing/));
await advanceUntil(page, /greenhouse is open/);
await sleep(page, 300);
await page.screenshot({ path: `${OUT}/01-carver-quest.png` });
await finishDialogue(page);
s = await state(page);
check('Quest accepted; next task is Mr. Reed', s.chapters.ch6 === 'active' && /Reed/.test(s.objective), s.objective);

// --- Mr. Reed in the greenhouse ---
check('The greenhouse opens now', await intoGreenhouse(page));
s = await state(page);
check('Inside the greenhouse', s.scene === 'greenhouse', s.scene);
await ghTo(page, 9.5, 6.6);
s = await state(page);
check('Mr. Reed is inside', /Reed/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /lab assistant/);
await clickChoice(page, /Why measure at all/);
check('Branch: "It looks taller" is a guess; centimeters are data', await sees(page, /is data/));
await advanceUntil(page, /measuring kit/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/02-lab-assistant-gives-kit.png` });
await finishDialogue(page);
s = await state(page);
check('Mr. Reed grants the measuring kit', s.inventory.some((e) => e.itemId === 'measuring_tool' && e.from === 'isaac'));

// --- Observe with the ruler ---
await ghTo(page, 3, 3.3);
check('The sunny bench seedling can be measured', await waitTarget(page, /sunny bench/));
await page.keyboard.press('e');
check('Observation: 9 cm, dark green', await sees(page, /9 centimeters/));
await finishDialogue(page);
await ghTo(page, 11, 3.3);
await waitTarget(page, /shady shelf/);
await page.keyboard.press('e');
check('Observation: 16 cm, but pale and floppy', await sees(page, /16 centimeters/));
await finishDialogue(page);
s = await state(page);
check('Both observations saved', s.ch6Data?.observed?.length === 2);

// --- The bench waits for Hattie's seeds ---
await ghTo(page, 7, 5.3);
await waitTarget(page, /bench/i);
await page.keyboard.press('e');
check("The bench asks for Hattie's notes and seeds first", await sees(page, /Hattie's trial notes/));
await finishDialogue(page);

// --- Hattie ---
await ghTo(page, 7, 7.3, null);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1200);
s = await state(page);
check('Walking out returns to town by the greenhouse', s.scene === 'hub', s.scene);
await toHattie(page);
s = await state(page);
check('Hattie is at the community garden', /Hattie/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /shady fig tree/);
await clickChoice(page, /who is right/);
check('Branch: it is an open question nobody has tested', await sees(page, /open question/));
await advanceUntil(page, /pouch of bean seeds/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/03-gardener-gives-seeds.png` });
await finishDialogue(page);
s = await state(page);
check('Hattie grants the trial notes and seeds', s.inventory.some((e) => e.itemId === 'trial_seeds' && e.from === 'hattie'));
check('Next task: the experiment bench', /experiment bench/.test(s.objective), s.objective);

// --- Carver's waiting talk ---
await toCarver(page);
await talk(page);
check("Carver's nudge points to the bench", await sees(page, /testable question|question you can really test/));
await clickChoice(page, /hypothesis is wrong/);
check('Branch: a hypothesis is a guess you test, not a promise', await sees(page, /not a promise/));
await finishDialogue(page);

// --- The experiment bench ---
await intoGreenhouse(page);
await openBench(page);
check('The bench shows the steps and your observations', (await page.locator('.stepper li').count()) === 5 && /9 cm/.test((await page.locator('.obs-strip').textContent()) ?? ''));
await click(page, '[data-q="pretty"]');
check('An untestable question is explained ("prettiest" is an opinion)', /opinion/.test(await msg(page)));
await click(page, '[data-q="light"]');
check('A testable question moves on to the hypothesis', /Make a prediction/.test((await page.locator('.lab-step h3').first().textContent()) ?? ''));
await click(page, '[data-pred="shorter"]');
check('Hypothesis saved as an if/then sentence', /If bean seedlings grow on the shady shelf, they will grow shorter/.test((await page.locator('.lab-step').textContent()) ?? ''));
await click(page, '[data-set="b:light:shade"]');
await click(page, '[data-set="b:water:lots"]');
await click(page, '[data-plant]');
check('Changing two things: Carver explains why the result could not be read, and offers a reset', /which change caused it/.test((await page.locator('[data-warn]').textContent()) ?? '') && (await page.locator('[data-reset]').count()) === 1);
await page.locator('[data-warn]').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/04-variable-warning.png` });
await click(page, '[data-reset]');
check('The reset puts tray B back except for light', !(await page.locator('[data-set="b:water:lots"]').getAttribute('class')).includes(' on'));
await page.locator('.trays').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/05-experiment-setup.png` });
await click(page, '[data-plant]');
check('A fair test is accepted and planted', /A fair test/.test(await msg(page)));
for (const i of [0, 1, 2]) await click(page, `[data-measure="${i}"]`);

// Reload in the middle of measuring.
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Reload mid-experiment: still in the greenhouse, 3 pots measured', s.scene === 'greenhouse' && s.ch6Data?.measured?.length === 3, JSON.stringify(s.ch6Data?.measured));
await openBench(page);
for (const i of [3, 4, 5]) await click(page, `[data-measure="${i}"]`);
check('Every pot measured: table shows averages', /15 cm/.test((await page.locator('.results-table').textContent()) ?? '') && /10 cm/.test((await page.locator('.results-table').textContent()) ?? ''));
check('The chart has text labels for both averages', /15 cm/.test((await page.locator('.results-chart').textContent()) ?? '') && /Tray A: 10.5 cm, 9 cm, 10.5 cm/.test((await page.locator('.chart-fig figcaption').textContent()) ?? ''));
await click(page, '[data-choice="taller:a"]');
check('Reading the table wrong gets a pointer back to the averages', /Average column/.test(await msg(page)));
await click(page, '[data-choice="taller:b"]');
await click(page, '[data-choice="supported:yes"]');
check('Claiming "supported" is corrected with the data', /Did tray B do that/.test(await msg(page)));
await click(page, '[data-choice="supported:no"]');
await click(page, '[data-choice="conclusion:one-pot"]');
check('A one-pot conclusion is explained (one pot can be a fluke)', /fluke/.test(await msg(page)));
await page.locator('.results-chart').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/06-results-chart.png` });
await click(page, '[data-choice="conclusion:data"]');
await click(page, '[data-choice="next:ignore"]');
check('"Ignore the data" is corrected: change the idea, never the data', /never the data/.test(await msg(page)));
await click(page, '[data-choice="next:revise"]');
check('The experiment is complete', (await page.locator('[data-bring]').count()) === 1);
await click(page, '[data-bring]');
await closeModal(page);
s = await state(page);
check('Minigame step completes and both items are marked used', s.chapters.ch6 === 'active' && ['measuring_tool', 'trial_seeds'].every((id) => s.inventory.find((e) => e.itemId === id)?.used));
check('Next task: return to Carver', /Return to Carver/.test(s.objective), s.objective);

// --- Back to Carver ---
await ghTo(page, 7, 7.3, null);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1200);
await toCarver(page);
await talk(page);
check('Carver repeats your question', await sees(page, /shady spot/));
await page.keyboard.press('Space');
await advanceUntil(page, /Tray B, on the shady shelf/);
check("Carver quotes your data", /averaged 15 cm/.test(await dialogueText(page)) && /averaged 10 cm/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /did not support/);
check('Carver: your hypothesis was not supported, and you said so honestly', /honestly/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /why did you change only the light/);
await clickChoice(page, /match my hypothesis/);
check('A wrong answer gets a clear correction', /not built to prove you right/.test((await page.locator('.dialogue .feedback').textContent()) ?? ''));
await clickChoice(page, /one change caused it/);
await page.keyboard.press('Space');
await advanceUntil(page, /You worked it out/);
await page.screenshot({ path: `${OUT}/07-carver-conclusion.png` });
await page.keyboard.press('Space');
await advanceUntil(page, /pale and floppy/);
check('Carver picks up the pale, floppy seedlings as a new question', /new question/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /see a memory/);
await clickChoice(page, /show me the memory/);
await page.locator('.memory-modal').waitFor({ timeout: 3000 });
check('Memory 1: test plots side by side, and careful records', /side by side/.test((await page.locator('.memory-caption').textContent()) ?? ''));
await page.screenshot({ path: `${OUT}/08-memory-records.png` });
await page.getByRole('button', { name: 'Next page' }).click();
check('Memory 2: Carver the teacher', /teacher/.test((await page.locator('.memory-caption').textContent()) ?? ''));
await page.getByRole('button', { name: 'Close the memory' }).click();
await sleep(page, 300);
await advanceUntil(page, /Fair-Test Plan Card/);
await finishDialogue(page);
await sleep(page, 500);
s = await state(page);
check('Chapter 6 complete; Carver gave the Fair-Test Plan Card', s.chapters.ch6 === 'complete' && s.inventory.some((e) => e.itemId === 'experiment_card' && e.from === 'carver'));
check('Rewards: +200 XP and +30 Seeds', s.xp === 830 + 200 && s.seeds === 93 + 30, `xp ${s.xp}, seeds ${s.seeds}`);
check('Chapter 7 is offered next', s.chapters.ch7 === 'available', s.objective);
check('Learner model records the method objective', !!s.learner.method && s.learner.method.correct >= 5, JSON.stringify(s.learner.method ?? {}).slice(0, 120));

// --- Journal ---
await page.keyboard.press('j');
await sleep(page, 400);
const jt = (await page.locator('.modal .content').textContent()) ?? '';
check('Journal shows observations, the experiment (not supported) and the card', /Lab notebook/.test(jt) && /Shady shelf: 16 cm/.test(jt) && /Not supported/.test(jt) && /Fair-Test Plan Card/.test(jt));
await page.getByRole('heading', { name: /Lab notebook/ }).scrollIntoViewIfNeeded();
await sleep(page, 200);
await page.screenshot({ path: `${OUT}/09-journal-lab-notebook.png` });
await page.locator('.activity', { hasText: 'Fair-Test Plan Card' }).getByRole('button', { name: 'Open the printable card' }).click();
await sleep(page, 300);
check('Printable Fair-Test Plan Card opens', /My Fair-Test Plan/.test((await page.locator('.print-card').textContent()) ?? ''));
await closeModal(page);
await closeModal(page);

// --- A second experiment with a different outcome; no duplicate rewards ---
await intoGreenhouse(page);
await openBench(page);
await click(page, '[data-new]');
await click(page, '[data-q="soil"]');
await click(page, '[data-pred="taller"]');
await click(page, '[data-set="b:soil:compost"]');
await click(page, '[data-plant]');
for (const i of [0, 1, 2, 3, 4, 5]) await click(page, `[data-measure="${i}"]`);
await click(page, '[data-choice="taller:same"]');
await click(page, '[data-choice="supported:no"]');
const comp = (await page.locator('[data-choice="conclusion:data"]').textContent()) ?? '';
check('Compost: about the same height in two weeks (a "no difference" result)', /about the same height/.test(comp) && /10.5 cm/.test(comp), comp.slice(0, 120));
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Replay gives no duplicate rewards; completion survives reload', s.chapters.ch6 === 'complete' && s.xp === 1030 && s.seeds === 123, `xp ${s.xp} seeds ${s.seeds}`);
await ctx.close();

// =====================================================================
// The other dialogue branches, and the water question
// =====================================================================
const ctxB = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const pb = await ctxB.newPage();
watch(pb, 'branches');
await openWithSave(pb, PHASE5_SAVE);
await toCarver(pb);
await talk(pb);
await advanceUntil(pb, /designs a fair test/);
await clickChoice(pb, /ask an expert/);
check('Branch: even experts test their ideas', await sees(pb, /even experts test/));
await finishDialogue(pb);
await toHattie(pb);
await talk(pb);
await advanceUntil(pb, /shady fig tree/);
await clickChoice(pb, /How could we find out/);
check('Branch: Hattie says only change one thing', await sees(pb, /only change one thing/));
await finishDialogue(pb);
await intoGreenhouse(pb);
await ghTo(pb, 9.5, 6.6);
await talk(pb);
await advanceUntil(pb, /lab assistant/);
await clickChoice(pb, /honest/);
check('Branch: measure the same way every time', await sees(pb, /Same way, every time/));
await finishDialogue(pb);
for (const [x, re] of [[3, /sunny bench/], [11, /shady shelf/]]) {
  await ghTo(pb, x, 3.3);
  await waitTarget(pb, re);
  await pb.keyboard.press('e');
  await sleep(pb, 300);
  await finishDialogue(pb);
}
await openBench(pb);
await click(pb, '[data-q="water"]');
check('Water question: choose more or less water first', (await pb.locator('[data-level]').count()) === 2 && (await pb.locator('[data-pred="taller"]').isDisabled()));
await click(pb, '[data-level="lots"]');
await click(pb, '[data-pred="taller"]');
await click(pb, '[data-set="b:light:shade"]');
await click(pb, '[data-plant]');
check('Changing the wrong thing is named', /question is about water, but you changed the light/.test((await pb.locator('[data-msg]').textContent()) ?? ''));
await click(pb, '[data-plant]');
await click(pb, '[data-plant]');
check('Hint level 3: a worked example and a "Fill in a fair setup" button', /Worked example/.test((await pb.locator('[data-msg]').textContent()) ?? '') && (await pb.getByRole('button', { name: 'Fill in a fair setup' }).count()) === 1);
await pb.getByRole('button', { name: 'Fill in a fair setup' }).click();
await click(pb, '[data-plant]');
for (const i of [0, 1, 2, 3, 4, 5]) await click(pb, `[data-measure="${i}"]`);
check('More water: tray B averaged 7 cm vs 10 cm (shorter, with yellow leaves)', /7 cm/.test((await pb.locator('.results-table').textContent()) ?? '') && /yellow/.test((await pb.locator('.results-table').textContent()) ?? ''));
await click(pb, '[data-restart]');
check('"Start over" goes back to the question step', (await pb.locator('[data-q]').count()) === 6);
await ctxB.close();

// =====================================================================
// Narrow phone, 390x844, touch
// =====================================================================
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await phone.newPage();
watch(p2, 'narrow');
const mid = JSON.parse(JSON.stringify(PHASE5_SAVE));
mid.world = { scene: 'greenhouse', x: 7, y: 5.3, facing: 'up' };
mid.progress.chapters.ch6 = { stage: 'active', stepsDone: ['get_tool', 'get_seeds'], flags: [], rewarded: false };
for (const [id, from] of [['measuring_tool', 'isaac'], ['trial_seeds', 'hattie']]) mid.progress.inventory.push({ itemId: id, from, obtainedAt: 9, used: false, inspected: true });
mid.chapterData.ch6 = { observed: ['sunny', 'shady'], question: 'soil', hyp: { level: 'compost', prediction: 'taller' } };
await openWithSave(p2, mid);
await waitTarget(p2, /bench/i);
await p2.screenshot({ path: `${OUT}/10-narrow-greenhouse.png` });
check('No clipped or off-screen UI at 390x844 (greenhouse)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
await p2.locator('.touch-act').tap();
await p2.locator('.lab-modal').waitFor({ timeout: 3000 });
await p2.locator('[data-set="b:soil:compost"]').tap();
await p2.locator('[data-plant]').tap();
for (const i of [0, 1, 2, 3, 4, 5]) await p2.locator(`[data-measure="${i}"]`).tap();
await sleep(p2, 300);
check('Measuring works with touch on a phone', /Average/.test((await p2.locator('.results-table').textContent()) ?? ''));
await p2.locator('.results-chart').scrollIntoViewIfNeeded();
await p2.screenshot({ path: `${OUT}/11-narrow-results.png` });
check('No clipped or off-screen UI at 390x844 (results)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
const overflow = await p2.evaluate(() => {
  const m = document.querySelector('.lab-modal');
  return m.scrollWidth - m.clientWidth;
});
check('The bench has no sideways scrolling on a phone', overflow <= 1, String(overflow));
await closeModal(p2);
await phone.close();

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();
const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, passed, total: results.length, results, consoleErrors }, null, 2));
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
