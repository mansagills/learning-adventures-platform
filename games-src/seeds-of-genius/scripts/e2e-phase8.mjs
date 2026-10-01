// Phase 8 release-candidate test: a complete fresh-save playthrough of the
// whole game (new game → practice → Chapters 1 to 7 → the ending) with real
// keyboard and mouse input, then a resume-from-each-chapter smoke test using
// the real saves captured along the way, plus settings, save export, the
// grown-ups page, offline behaviour, a frame-rate sample and the release
// screenshots.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/e2e-phase8.mjs [baseUrl]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
  layoutProblems,
  launch,
  waitTarget,
} from './e2e-lib.mjs';

const BASE = process.argv[2] ?? 'http://localhost:4173/';
const OUT = 'test-output/phase8';
mkdirSync(OUT, { recursive: true });
const browser = await launch();
const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png` });

// ------------------------------------------------------------------ helpers

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
/** Play a conversation to its end: first open choice each time (wrong answers get disabled), close memories and the journey. */
async function finishAll(page, max = 120) {
  for (let i = 0; i < max; i++) {
    if (await page.locator('.memory-modal, .journey-modal').count()) {
      await page.keyboard.press('Escape');
      await sleep(page, 250);
      continue;
    }
    if (!(await page.locator('.dialogue').count())) return true;
    const open = page.locator('.choices button:not([disabled])');
    if (await open.count()) await open.first().click();
    else await page.keyboard.press('Space');
    await sleep(page, 150);
  }
  return false;
}
/** Keyboard only: Space to continue, number keys for choices. */
async function finishKeys(page, max = 80) {
  for (let i = 0; i < max; i++) {
    if (await page.locator('.memory-modal').count()) {
      await page.keyboard.press('Escape');
      await sleep(page, 250);
      continue;
    }
    if (!(await page.locator('.dialogue').count())) return true;
    if (await page.locator('.choices button:not([disabled])').count()) await page.keyboard.press('1');
    else await page.keyboard.press('Space');
    await sleep(page, 150);
  }
  return false;
}
async function closeModal(page) {
  await page.keyboard.press('Escape');
  await sleep(page, 300);
}
async function click(page, sel) {
  await page.locator(sel).first().click();
  await sleep(page, 150);
}
async function waitReady(page) {
  for (let i = 0; i < 40 && !(await state(page)).runtimesReady; i++) await sleep(page, 100);
  await sleep(page, 400);
}
async function reloadAndContinue(page) {
  await page.reload();
  await sleep(page, 900);
  await page.getByRole('button', { name: 'Continue' }).click();
  await waitReady(page);
}
const rawSave = (page) => page.evaluate(() => localStorage.getItem('seedsOfGenius.save'));

/** Back to the main east-west road (y 9.6) from anywhere in town. */
async function toRoad(page) {
  let { player } = await state(page);
  if ((player.y > 25 && player.x < 11) || (player.y > 17.5 && player.x < 12)) await walkPath(page, [[11.5, player.y]]);
  else if (player.y > 17.5) await walkPath(page, [[27.5, player.y]]);
  else if (player.y > 10.5 && player.x >= 16 && player.x < 26) await walkPath(page, [[22.4, player.y]]);
  // Standing beside Carver (where a debrief leaves you): leave by the column we arrive on.
  else if (player.y < 9 && player.x > 19 && player.x < 21.5) await walkPath(page, [[19.5, player.y]]);
  player = (await state(page)).player;
  if (Math.abs(player.y - 9.6) > 0.3) await walkPath(page, [[player.x, 9.6]]);
}
async function toCarver(page) {
  await toRoad(page);
  await walkPath(page, [[19.5, 9.6], [19.5, 7.5], [20.3, 7.5]]);
  await tapKey(page, 'ArrowRight', 30);
  await waitTarget(page, /Carver/);
}
async function carverTalk(page) {
  await toCarver(page);
  await talk(page);
  return finishAll(page);
}
async function npc(page, route, face, re) {
  await toRoad(page);
  await walkPath(page, route);
  if (face) await tapKey(page, face, 30);
  const ok = await waitTarget(page, re);
  await talk(page);
  await finishAll(page);
  return ok;
}
async function enter(page, route, re) {
  await toRoad(page);
  await walkPath(page, route);
  await tapKey(page, 'ArrowUp', 30);
  const ok = await waitTarget(page, re);
  await page.keyboard.press('e');
  await sleep(page, 1300);
  return ok;
}
async function leaveDown(page, route) {
  await walkPath(page, route);
  await tapKey(page, 'ArrowDown', 500);
  await sleep(page, 1300);
}
async function useHere(page, re, modal) {
  await waitTarget(page, re);
  await page.keyboard.press('e');
  if (modal) await page.locator(modal).waitFor({ timeout: 4000 });
  else await sleep(page, 300);
}
const done = (s, id) => s.chapters[id] === 'complete';

// Chapter 1 card sorting
const GUESS_WORDS = ['must have', 'because it likes', 'is hungry', 'sad because', 'will take', 'hiding from', 'last night'];
const isGuess = (text) => GUESS_WORDS.some((w) => text.toLowerCase().includes(w));
async function recordLongest(page) {
  const texts = await page.locator('.write .choices button:not([disabled])').allInnerTexts();
  const longest = texts.reduce((a, b) => (b.length > a.length ? b : a));
  await page.locator('.write .choices button', { hasText: longest.replace(/^\d\s*/, '').trim() }).click();
  await sleep(page, 300);
}
// Chapter 2 schoolhouse aisles
async function schoolTo(page, x, y) {
  const s = await state(page);
  const side = (v) => (v < 7 ? 2.4 : v > 7 ? 11.6 : 7);
  if (Math.abs(s.player.x - x) > 0.3) await walkPath(page, [[side(s.player.x), 5.5], [7, 5.5], [side(x), 5.5]]);
  await walkPath(page, [[x, y]]);
}
// Chapter 3 farm paths
async function farmTo(page, x, y) {
  const { player } = await state(page);
  if (Math.abs(player.x - x) > 0.3) await walkPath(page, [[player.x, 8.5], [x, 8.5]]);
  await walkPath(page, [[x, y]]);
}
async function testPlan(page, plan) {
  for (let i = 0; i < 4; i++) await page.locator(`[data-slot="${i}"][data-crop="${plan[i]}"]`).click();
  await page.locator('.planner-modal [data-test]').click();
  for (let i = 0; i < 40 && !(await page.locator('.planner-modal [data-msg]').count()); i++) await sleep(page, 100);
  await sleep(page, 200);
}
// Chapter 4 workshop row
async function shopTo(page, x, y) {
  const { player } = await state(page);
  if (Math.abs(player.x - x) > 0.3) await walkPath(page, [[player.x, 5.5], [x, 5.5]]);
  await walkPath(page, [[x, y]]);
  await tapKey(page, 'ArrowUp', 30);
}
// Chapter 5 Two Creeks paths
async function creekTo(page, x, y, face) {
  const { player } = await state(page);
  if (y < 5) {
    if (Math.abs(player.x - 8.9) > 0.3) await walkPath(page, [[player.x, 9.4], [8.9, 9.4]]);
    await walkPath(page, [[8.9, y], [x, y]]);
  } else {
    if (player.y < 5) await walkPath(page, [[8.9, player.y], [8.9, 9.4]]);
    else if (Math.abs(player.y - 9.4) > 0.3) await walkPath(page, [[player.x, 9.4]]);
    await walkPath(page, [[x, 9.4], [x, y]]);
  }
  if (face) await tapKey(page, face, 30);
}
// Chapter 6 greenhouse row
async function ghTo(page, x, y, face = 'ArrowUp') {
  const { player } = await state(page);
  if (Math.abs(player.x - x) > 0.3) await walkPath(page, [[player.x, 6.6], [x, 6.6]]);
  await walkPath(page, [[x, y]]);
  if (face) await tapKey(page, face, 30);
}

// =====================================================================
// 1. A complete fresh-save playthrough, 1280x720
// =====================================================================
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true });
const page = await ctx.newPage();
watch(page, 'playthrough');
const external = [];
page.on('request', (r) => {
  const u = new URL(r.url());
  if (!['localhost', '127.0.0.1'].includes(u.hostname) && !u.protocol.startsWith('data') && !u.protocol.startsWith('blob')) external.push(r.url());
});
const snapshots = {};
const started = Date.now();

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.reload();
await sleep(page, 1200);
await page.getByRole('button', { name: /start a new game/i }).click();
await sleep(page, 500);
await page.getByRole('radio', { name: 'Braids' }).click();
await page.getByRole('button', { name: /i'm ready/i }).click();
await sleep(page, 700);
let s = await state(page);
check('New game: the first objective points to Carver', /Carver/.test(s.objective), s.objective);
snapshots.practice = await rawSave(page);

// --- Practice quest ---
await toCarver(page);
await shot(page, '01-hub-day-carver');
await talk(page);
await finishAll(page);
check('Practice: Carver assigns the seed errand', (await state(page)).practice.stage === 'active');
check('Practice: Mae gives the seed packet', await npc(page, [[27.5, 9.6], [27.5, 19.6], [32.5, 19.6]], 'ArrowUp', /Mae/));
await carverTalk(page);
s = await state(page);
check('Practice complete, rewards paid', s.practice.stage === 'complete' && s.xp === 50, `xp ${s.xp}`);
snapshots.ch1 = await rawSave(page);

// --- Chapter 1 ---
await carverTalk(page);
check('Ch1: Carver assigns the garden quest', (await state(page)).chapters.ch1 === 'active');
await toRoad(page);
await walkPath(page, [[13.5, 9.6]]);
await tapKey(page, 'ArrowUp', 30);
await waitTarget(page, /Hattie/);
await talk(page);
await sees(page, /nibbling my beans/);
await finishAll(page, 4);
await shot(page, '02-npc-item-exchange');
await finishAll(page);
check('Ch1: Hattie gives the field notebook', (await state(page)).inventory.some((e) => e.itemId === 'field_notebook'));
check('Ch1: Theo gives the magnifying lens', await npc(page, [[27.5, 9.6], [27.5, 19.5], [26.8, 19.5]], 'ArrowLeft', /Theo/));
await toRoad(page);
await walkPath(page, [[11.8, 9.6], [11.8, 6.2]]);
for (const [x, y, zones] of [
  [11.8, 6.2, ['Look at the tips of the carrot leaves']],
  [10.0, 6.2, ['Look at the holes in the big leaf', 'Look under the big leaf']],
  [13.0, 6.3, ['Look at the pink shape in the soil']],
]) {
  await walkPath(page, [[x, y]]);
  await useHere(page, /Look closely/, '.inspect-modal');
  for (const z of zones) {
    await page.getByRole('button', { name: z }).click();
    await sleep(page, 200);
  }
  await recordLongest(page);
  await closeModal(page);
}
await walkPath(page, [[11.8, 6.3], [11.8, 9.6], [9.5, 9.6]]);
await useHere(page, /card game/, '.sort-modal');
for (let i = 0; i < 8; i++) {
  const card = page.locator('.sort-card').first();
  if (!(await card.count())) break;
  const text = (await card.locator('p').textContent()) ?? '';
  await card.getByRole('button', { name: new RegExp(`^${isGuess(text) ? 'Guess' : 'Observation'}:`) }).click();
  await sleep(page, 200);
  if (i === 3) await shot(page, '03-lesson1-sorting');
}
check('Ch1: observations recorded and sorted', /All sorted/.test((await page.locator('.sort-modal .feedback').textContent()) ?? ''));
await closeModal(page);
await carverTalk(page);
s = await state(page);
check('Ch1 complete; Chapter 2 offered', done(s, 'ch1') && s.chapters.ch2 === 'available', s.objective);
snapshots.ch2 = await rawSave(page);

// --- Chapter 2 ---
await carverTalk(page);
check('Ch2: Ada gives the botanical sketch', await npc(page, [[15.5, 9.6], [15.5, 11.3]], 'ArrowDown', /Ada/));
await toRoad(page);
await walkPath(page, [[11.5, 9.6], [11.5, 26.55], [5.6, 26.55]]);
await tapKey(page, 'ArrowUp', 30);
if (!(await waitTarget(page, /Nelson/, 10))) await tapKey(page, 'ArrowLeft', 30);
await talk(page);
await finishAll(page);
check('Ch2: Ms. Nelson gives the school record', (await state(page)).inventory.some((e) => e.itemId === 'school_record'));
await walkPath(page, [[6.5, 26.55]]);
await tapKey(page, 'ArrowUp', 30);
await waitTarget(page, /School/i);
await page.keyboard.press('e');
await sleep(page, 1300);
for (const [x, y] of [[2.5, 3.3], [11.5, 3.3], [2.3, 4.5], [11.7, 4.5], [2.3, 6.5], [11.7, 6.5]]) {
  await schoolTo(page, x, y);
  await page.keyboard.press('e');
  await page.locator('.display-modal').waitFor({ timeout: 4000 });
  await sleep(page, 200);
  const read = page.getByRole('button', { name: 'Read this display' });
  if (await read.count()) await read.click();
  await sleep(page, 150);
  await closeModal(page);
}
await schoolTo(page, 7, 3.8);
await tapKey(page, 'ArrowUp', 30);
await useHere(page, /timeline/i, '.timeline-modal');
const RIGHT = ['reading', 'neosho', 'kansas', 'highland', 'simpson', 'iowastate'];
for (let i = 0; i < RIGHT.length; i++)
  for (let guard = 0; guard < 8; guard++) {
    const order = (await state(page)).ch2Data.order;
    if (order.indexOf(RIGHT[i]) <= i) break;
    await page.locator(`.timeline-card[data-stage="${RIGHT[i]}"]`).getByRole('button', { name: /^Move up/ }).click();
    await sleep(page, 80);
  }
await page.getByRole('button', { name: 'Check my order' }).click();
await sleep(page, 400);
await shot(page, '04-lesson2-timeline');
await page.locator('.timeline-modal .choices button', { hasText: 'Highland College turned him away' }).click();
await sleep(page, 300);
await page.locator('.timeline-modal .choices button', { hasText: 'Mariah Watkins' }).click();
await sleep(page, 400);
await page.getByRole('button', { name: 'Back to the schoolhouse' }).click();
await sleep(page, 300);
await schoolTo(page, 7, 7.3);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1300);
await carverTalk(page);
s = await state(page);
check('Ch2 complete; Chapter 3 offered', done(s, 'ch2') && s.chapters.ch3 === 'available', s.objective);
snapshots.ch3 = await rawSave(page);

// --- Chapter 3 ---
await carverTalk(page);
check('Ch3: Mr. Hill gives soil samples', await npc(page, [[31.5, 9.6], [31.5, 9.5]], 'ArrowUp', /Hill/));
check('Ch3: Mae gives crop cards', await npc(page, [[27.5, 9.6], [27.5, 19.6], [32.5, 19.6]], 'ArrowUp', /Mae/));
await enter(page, [[27.5, 9.6], [33.9, 9.6], [33.9, 8.4]], /farm gate/i);
check('Ch3: the farm opens', (await state(page)).scene === 'farm');
for (const [x, names] of [
  [4.5, ['Look at the color of the soil', 'Look at the cracks on top', 'Look for roots and living things']],
  [11.5, ['Look at the color of the soil', 'Look at the wiggly thing', 'Look at the bumps on the old root']],
]) {
  await farmTo(page, x, 7.6);
  await useHere(page, /soil/i, '.soil-modal');
  for (const n of names) await page.getByRole('button', { name: n }).click();
  await closeModal(page);
}
await farmTo(page, 7.9, 3.8);
await tapKey(page, 'ArrowUp', 30);
await useHere(page, /Plan the seasons/, '.planner-modal');
await testPlan(page, ['cotton', 'cotton', 'cotton', 'cotton']);
await testPlan(page, ['peanuts', 'cotton', 'sweetpotato', 'cotton']);
await click(page, '[data-why="nitrogen"]');
await testPlan(page, ['cowpeas', 'cotton', 'peanuts', 'cotton']);
await page.locator('.soil-chart').scrollIntoViewIfNeeded();
await shot(page, '05-lesson3-soil-plans');
await click(page, '[data-choose="2"]');
await closeModal(page);
await leaveDown(page, [[7.9, 8.5], [7.9, 10.2]]);
await carverTalk(page);
s = await state(page);
check('Ch3 complete; Chapter 4 offered', done(s, 'ch3') && s.chapters.ch4 === 'available', s.objective);
snapshots.ch4 = await rawSave(page);

// --- Chapter 4 ---
await carverTalk(page);
check('Ch4: Miss Lottie gives the need card', await npc(page, [[22.5, 9.6], [22.5, 14.5], [23.4, 14.5]], 'ArrowRight', /Lottie/));
check('Ch4: Mr. Brooks gives the materials kit', await npc(page, [[27.5, 9.6], [27.5, 26.55], [35.5, 26.55]], 'ArrowUp', /Brooks/));
await walkPath(page, [[33.5, 26.55], [33.5, 26.1]]);
await tapKey(page, 'ArrowUp', 30);
await waitTarget(page, /Workshop door/);
await page.keyboard.press('e');
await sleep(page, 1300);
await shopTo(page, 3, 3.4);
await useHere(page, /crop shelf/, '.shelf-modal');
for (const t of ['peanuts:press', 'sweetpotato:cut', 'cowpeas:bite']) await click(page, `[data-test="${t}"]`);
await closeModal(page);
await shopTo(page, 7, 5.4);
await useHere(page, /workbench/, '.bench-modal');
await click(page, '[data-build]');
await page.getByRole('button', { name: /Stop improving/ }).click();
for (const o of ['crop:cowpeas', 'step1:roast', 'box:jar']) await click(page, `[data-opt="${o}"]`);
await click(page, '[data-build]');
await click(page, '[data-improve="0"]');
for (const o of ['step2:roast', 'box:jar', 'label:yes']) await click(page, `[data-opt="${o}"]`);
await click(page, '[data-build]');
await shot(page, '06-lesson4-workbench');
await click(page, '[data-choose]');
await closeModal(page);
await leaveDown(page, [[7, 6.5], [7, 7.3]]);
await carverTalk(page);
s = await state(page);
check('Ch4 complete; Chapter 5 offered', done(s, 'ch4') && s.chapters.ch5 === 'available', s.objective);
snapshots.ch5 = await rawSave(page);

// --- Chapter 5 ---
await carverTalk(page);
check('Ch5: Miss Clara gives the resource map', await npc(page, [[27.7, 9.6], [27.7, 7.95]], 'ArrowRight', /Clara/));
await enter(page, [[26, 9.6], [26, 8.7]], /wagon to Two Creeks/);
check('Ch5: the wagon rides to Two Creeks', (await state(page)).scene === 'creek');
for (const [x, re] of [[4.5, /Watts/], [13.5, /Pryor/]]) {
  await creekTo(page, x, 9.4, 'ArrowDown');
  await waitTarget(page, re);
  await talk(page);
  await finishAll(page);
}
for (const [x, y, re] of [[2.5, 9.35, /ditch/], [3.6, 7.4, /hillside soil/], [14.5, 9.4, /creek bank/], [12.5, 8.4, /cotton/]]) {
  await creekTo(page, x, y);
  await useHere(page, re);
  await finishAll(page);
}
await creekTo(page, 7.3, 9.35);
await useHere(page, /demonstration table/i, '.table-modal');
for (const [f, recs] of [['watts', ['contour', 'compost']], ['pryor', ['cowpeas', 'garden']]]) {
  await click(page, `[data-farmer="${f}"]`);
  for (const r of recs) await click(page, `[data-rec="${r}"]`);
  await click(page, '[data-check]');
  await click(page, '[data-reason="fits"]');
  if (f === 'pryor') await shot(page, '07-lesson5-farm-helper');
  await click(page, '[data-decline]');
}
await closeModal(page);
await creekTo(page, 8.9, 10.3);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1300);
await carverTalk(page);
s = await state(page);
check('Ch5 complete; Chapter 6 offered', done(s, 'ch5') && s.chapters.ch6 === 'available', s.objective);
snapshots.ch6 = await rawSave(page);

// --- Chapter 6 ---
await carverTalk(page);
await enter(page, [[19.5, 9.6], [19.5, 7.0]], /Greenhouse door/);
await ghTo(page, 9.5, 6.6);
await waitTarget(page, /Reed/);
await talk(page);
await finishAll(page);
check('Ch6: Mr. Reed gives the measuring kit', (await state(page)).inventory.some((e) => e.itemId === 'measuring_tool'));
for (const [x, re] of [[3, /sunny bench/], [11, /shady shelf/]]) {
  await ghTo(page, x, 3.3);
  await useHere(page, re);
  await finishAll(page);
}
await ghTo(page, 7, 7.3, null);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1300);
check('Ch6: Hattie gives trial notes and seeds', await npc(page, [[13.5, 9.6]], 'ArrowUp', /Hattie/));
await enter(page, [[19.5, 9.6], [19.5, 7.0]], /Greenhouse door/);
await ghTo(page, 7, 5.3);
await useHere(page, /experiment bench/i, '.lab-modal');
for (const sel of ['[data-q="light"]', '[data-pred="taller"]', '[data-set="b:light:shade"]', '[data-plant]']) await click(page, sel);
for (let i = 0; i < 6; i++) await click(page, `[data-measure="${i}"]`);
await page.locator('.results-chart').scrollIntoViewIfNeeded();
await shot(page, '08-lesson6-results');
for (const c of ['taller:b', 'supported:yes', 'conclusion:data', 'next:repeat']) await click(page, `[data-choice="${c}"]`);
await click(page, '[data-bring]');
await closeModal(page);
await ghTo(page, 7, 7.3, null);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1300);
await carverTalk(page);
s = await state(page);
check('Ch6 complete; Chapter 7 offered', done(s, 'ch6') && s.chapters.ch7 === 'available', s.objective);
snapshots.ch7 = await rawSave(page);

// --- Chapter 7 and the ending ---
await carverTalk(page);
check('Ch7: Theo gives the kids\' need cards', await npc(page, [[27.5, 9.6], [27.5, 19.5], [26.6, 19.5]], 'ArrowLeft', /Theo/));
check('Ch7: Miss Lottie gives the neighbors\' need cards', await npc(page, [[22.5, 9.6], [22.5, 14.5], [23.4, 14.5]], 'ArrowRight', /Lottie/));
check('Ch7: Mr. Brooks gives the prototype kit', await npc(page, [[27.5, 9.6], [27.5, 26.55], [35.5, 26.55]], 'ArrowUp', /Brooks/));
await toRoad(page);
await walkPath(page, [[22.4, 9.6], [22.4, 16.5], [17, 16.5]]);
await tapKey(page, 'ArrowUp', 30);
await useHere(page, /Carver Project/, '.project-modal');
await click(page, '[data-need="garden"]');
for (const o of ['main:barrel', 'mat:scrap', 'extra:signup', 'ev:free', 'ev:fair', 'meas:soil', 'cmp:before_after', 'rep:several']) await click(page, `[data-opt="${o}"]`);
await click(page, '[data-show]');
await click(page, '[data-opt="up:overflow"]');
await click(page, '[data-retest]');
await page.locator('.project-card').scrollIntoViewIfNeeded();
await shot(page, '09-lesson7-project-card');
await click(page, '[data-present]');
await closeModal(page);
await toCarver(page);
await talk(page);
await sees(page, /Show me your project/);
for (let i = 0; i < 40 && !/not the same as my life's work/.test(await dialogueText(page)); i++) {
  const open = page.locator('.choices button:not([disabled])');
  if (await open.count()) await open.first().click();
  else await page.keyboard.press('Space');
  await sleep(page, 150);
}
await shot(page, '10-capstone-carver-ending');
await finishAll(page);
await sleep(page, 500);
s = await state(page);
check('The whole game is finished from a fresh save', CHAPTERS_ALL_DONE(s) && /finished every chapter/.test(s.objective), s.objective);
check('Rewards add up across the whole game: 1270 XP (every chapter once, plus thank-yous for helping)', s.xp === 1270, `xp ${s.xp}, seeds ${s.seeds}`);
check('Every required item was collected and used', ['field_notebook', 'magnifying_lens', 'school_record', 'botanical_sketch', 'soil_samples', 'crop_history', 'crop_cards', 'need_card', 'materials_kit', 'farm_report_a', 'farm_report_b', 'resource_map', 'measuring_tool', 'trial_seeds', 'need_cards', 'neighbor_needs', 'prototype_kit'].every((id) => s.inventory.find((e) => e.itemId === id)?.used));
check('All seven keepsakes and the Golden Seed are in the bag', ['nature_card', 'journey_card', 'rotation_card', 'invention_card', 'interview_card', 'experiment_card', 'golden_seed'].every((id) => s.inventory.some((e) => e.itemId === id)));
check('Every memory from Carver\'s life was seen (6)', s.memories.length === 6, s.memories.join());
const playMinutes = ((Date.now() - started) / 60000).toFixed(1);
check('Complete playthrough finished', true, `${playMinutes} min of automated play`);
snapshots.ended = await rawSave(page);

// --- Journal, progress, grown-ups page, credits ---
await page.keyboard.press('j');
await sleep(page, 400);
await page.getByRole('tab', { name: /Map/ }).click();
await sleep(page, 300);
await shot(page, '11-journal-progress');
await page.getByRole('tab', { name: /Bag/ }).click();
await sleep(page, 300);
await shot(page, '12-bag');
await page.getByRole('tab', { name: /For grown-ups/ }).click();
await sleep(page, 300);
const gt = (await page.locator('.modal .content').textContent()) ?? '';
check('Grown-ups page: goals for all seven chapters, the Chapter 2 note and privacy', (await page.locator('.grownup-list > li').count()) === 7 && /racism/.test(gt) && /No accounts/.test(gt));
await shot(page, '13-grownups');
await click(page, '[data-printable="ch3"]');
await page.locator('.print-card').waitFor({ timeout: 4000 });
check('Grown-ups page opens a printable activity card', /Crop|rotation|season/i.test((await page.locator('.print-card').textContent()) ?? ''));
await closeModal(page);
await page.getByRole('tab', { name: /About/ }).click();
await sleep(page, 300);
const about = (await page.locator('.modal .content').textContent()) ?? '';
check('Credits and all four historical sources are visible', (await page.locator('.about a[href^="https://www.nps.gov"], .about a[href^="https://www.nal.usda.gov"]').count()) === 4 && /Credits/.test(about) && /Open Font License/.test(about));
await shot(page, '14-credits-sources');
await closeModal(page);

// --- The journey on the cottage shelf ---
await toRoad(page);
await walkPath(page, [[11.5, 9.6], [11.5, 18.5], [5.5, 18.5]]);
await tapKey(page, 'ArrowUp', 30);
await waitTarget(page, /cottage|door/i);
await page.keyboard.press('e');
await sleep(page, 1300);
check('Into the cottage', (await state(page)).scene === 'room');
await walkPath(page, [[6.5, 4]]);
await tapKey(page, 'ArrowUp', 30);
await useHere(page, /shelf/i, '.journey-modal');
check('The cottage shelf shows the finished journey', (await page.locator('.journey-card.done').count()) === 7);
await closeModal(page);

// --- Settings persist; mute; reduced motion; large text; export ---
await page.keyboard.press('Escape');
await page.locator('.modal', { hasText: 'Settings' }).waitFor({ timeout: 3000 });
await click(page, '[aria-labelledby="set-mute"] [data-v="off"]');
await click(page, '[aria-labelledby="set-motion"] [data-v="on"]');
await click(page, '[aria-labelledby="set-size"] [data-v="large"]');
await shot(page, '15-settings');
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download a save file' }).click()]);
await dl.saveAs(`${OUT}/save-export.json`);
const exported = JSON.parse(readFileSync(`${OUT}/save-export.json`, 'utf8'));
check('Save export downloads a readable save file', exported.game === 'seeds-of-genius' && typeof exported.body === 'string', dl.suggestedFilename());
await closeModal(page);
await reloadAndContinue(page);
const prefs = await page.evaluate(() => ({ size: document.documentElement.dataset.textSize, motion: document.documentElement.dataset.reducedMotion, saved: JSON.parse(localStorage.getItem('seedsOfGenius.settings') ?? '{}') }));
check('Settings survive a reload (sound off, reduced motion, large text)', prefs.size === 'large' && prefs.motion === 'true' && prefs.saved.muted === true, JSON.stringify(prefs));
check('The HUD shows sound is off', /Sound off/i.test((await page.locator('.hud').textContent()) ?? ''));
check('Progress survives the reload', CHAPTERS_ALL_DONE(await state(page)));
await page.keyboard.press('Escape');
await page.locator('.modal', { hasText: 'Settings' }).waitFor({ timeout: 3000 });
await click(page, '[aria-labelledby="set-mute"] [data-v="on"]');
await click(page, '[aria-labelledby="set-motion"] [data-v="off"]');
await click(page, '[aria-labelledby="set-size"] [data-v="normal"]');
await closeModal(page);

// --- Offline and performance ---
check('Works offline: no requests leave this computer', external.length === 0, external.slice(0, 3).join(' '));
await leaveDown(page, [[5, 6.5], [5, 7.4]]).catch(() => {});
const perf = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const times = [];
      let last = performance.now();
      const t0 = last;
      const f = (t) => {
        times.push(t - last);
        last = t;
        if (t - t0 < 3000) requestAnimationFrame(f);
        else {
          times.sort((a, b) => a - b);
          resolve({ fps: +(times.length / 3).toFixed(1), p95: +times[Math.floor(times.length * 0.95)].toFixed(1) });
        }
      };
      requestAnimationFrame(f);
    }),
);
check('Frame rate sample (software rendering in this test machine; a real laptop GPU is faster)', perf.fps >= 20, JSON.stringify(perf));
await ctx.close();

function CHAPTERS_ALL_DONE(st) {
  return ['practice', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7'].every((id) => st.chapters[id] === 'complete');
}

// =====================================================================
// 2. Resume from each chapter (real saves from the playthrough), keyboard only
// =====================================================================
const OPENERS = {
  ch1: /community garden/,
  ch2: /school/,
  ch3: /soil/,
  ch4: /use it or sell it/,
  ch5: /helps real families/,
  ch6: /Hattie has a puzzle/,
  ch7: /Look at all you have done/,
};
const FIRST_NPC = { ch1: /Hattie/, ch2: /Ada|Nelson/, ch3: /Hill/, ch4: /Lottie/, ch5: /Clara/, ch6: /Reed/, ch7: /Theo/ };
const rc = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const rp = await rc.newPage();
watch(rp, 'resume');
for (const id of Object.keys(OPENERS)) {
  await rp.goto(BASE);
  await rp.evaluate((raw) => {
    localStorage.clear();
    localStorage.setItem('seedsOfGenius.save', raw);
  }, snapshots[id]);
  await rp.reload();
  await sleep(rp, 900);
  await rp.getByRole('button', { name: 'Continue' }).click();
  await waitReady(rp);
  let r = await state(rp);
  const offered = r.chapters[id] === 'available' && /Carver/.test(r.objective);
  await toCarver(rp);
  await rp.keyboard.press('e');
  let opened = false;
  for (let i = 0; i < 20 && !opened; i++) {
    opened = OPENERS[id].test(await dialogueText(rp));
    if (!opened && (await rp.locator('.memory-modal').count())) {
      await rp.keyboard.press('Escape');
      await sleep(rp, 250);
    } else if (!opened) {
      await rp.keyboard.press((await rp.locator('.choices button:not([disabled])').count()) ? '1' : 'Space');
      await sleep(rp, 200);
    }
  }
  await finishKeys(rp);
  r = await state(rp);
  check(`Resume at ${id}: Carver assigns it (keyboard only) and points to the first helper`, offered && opened && r.chapters[id] === 'active' && FIRST_NPC[id].test(r.objective), r.objective);
}

// Night in town, with Carver and his lantern (the same save, set to night).
const night = JSON.parse(JSON.parse(snapshots.ch7).body);
night.time = { ...night.time, minutes: 22 * 60, paused: true };
night.world = { scene: 'hub', x: 20.3, y: 8.6, facing: 'up' };
await rp.goto(BASE);
await rp.evaluate((s) => {
  localStorage.clear();
  localStorage.setItem('seedsOfGenius.save', JSON.stringify(s));
}, night);
await rp.reload();
await sleep(rp, 900);
await rp.getByRole('button', { name: 'Continue' }).click();
await waitReady(rp);
await sleep(rp, 600);
await shot(rp, '16-hub-night-carver');
check('A night save loads and shows the town at night', (await state(rp)).time.minutes === 22 * 60);
await rc.close();

// =====================================================================
// 3. Narrow phone, 390x844, touch
// =====================================================================
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await phone.newPage();
watch(p2, 'narrow');
await p2.goto(BASE);
await p2.evaluate((raw) => {
  localStorage.clear();
  localStorage.setItem('seedsOfGenius.save', raw);
}, snapshots.ended);
await p2.reload();
await sleep(p2, 900);
await p2.getByRole('button', { name: 'Continue' }).click();
await waitReady(p2);
await shot(p2, '17-narrow-hub');
check('No clipped or off-screen UI at 390x844 (hub)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
const mid = JSON.parse(JSON.parse(snapshots.ch7).body);
mid.world = { scene: 'greenhouse', x: 7, y: 5.3, facing: 'up' };
await p2.goto(BASE); // back to the title first, so the running game cannot save over the swap
await p2.evaluate((s) => localStorage.setItem('seedsOfGenius.save', JSON.stringify(s)), mid);
await p2.reload();
await sleep(p2, 900);
await p2.getByRole('button', { name: 'Continue' }).click();
await waitReady(p2);
check('Phone: standing at the experiment bench offers to use it', await waitTarget(p2, /experiment bench/i));
await p2.locator('.touch-act').tap();
await p2.locator('.lab-modal').waitFor({ timeout: 4000 });
await p2.locator('.results-chart').scrollIntoViewIfNeeded();
await shot(p2, '18-narrow-minigame');
check('No clipped or off-screen UI at 390x844 (minigame)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
await closeModal(p2);
await p2.goto(BASE);
await p2.evaluate((raw) => localStorage.setItem('seedsOfGenius.save', raw), snapshots.ended);
await p2.reload();
await sleep(p2, 900);
await p2.getByRole('button', { name: 'Continue' }).click();
await waitReady(p2);
await p2.keyboard.press('j');
await sleep(p2, 400);
await p2.locator('.modal .content button', { hasText: 'Open the project card' }).first().tap();
await p2.locator('.project-card').waitFor({ timeout: 4000 });
await shot(p2, '19-narrow-card');
const overflow = await p2.evaluate(() => Math.max(...[...document.querySelectorAll('.modal')].map((m) => m.scrollWidth - m.clientWidth)));
check('The project card fits a phone with no sideways scrolling', overflow <= 1, String(overflow));
await phone.close();

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();
const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, passed, total: results.length, results, consoleErrors, perf, playMinutes }, null, 2));
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
