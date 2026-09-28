// Phase 5 check-in test: Chapter 5 "Science for the People / Farm Helper".
// Starts from a real Phase 4 save (Chapter 4 complete), plays the chapter
// with real keyboard and mouse input, checks each acceptance criterion and
// captures the check-in screenshots.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/e2e-phase5.mjs [baseUrl]
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
const OUT = 'test-output/phase5';
mkdirSync(OUT, { recursive: true });
const browser = await launch();

const done = (steps = []) => ({ stage: 'complete', stepsDone: steps, flags: [], rewarded: true });
// A save exactly as Phase 4 wrote it: Chapter 4 complete, Chapter 5 'locked'.
const PHASE4_SAVE = {
  version: 2,
  createdAt: 1,
  savedAt: 1,
  customized: true,
  appearance: { skin: 'skin3', hairStyle: 'puffs', hairColor: 'black', outfit: 'green', accessory: 'none' },
  world: { scene: 'hub', x: 19.5, y: 9.6, facing: 'up' },
  time: { minutes: 10 * 60, day: 7, paused: true },
  progress: {
    xp: 660,
    seeds: 68,
    chapters: {
      practice: done(['get_seeds']),
      ch1: done(['get_notebook', 'get_lens', 'observe_sort']),
      ch2: done(['get_record', 'get_sketch', 'build_timeline']),
      ch3: done(['get_samples', 'get_cards', 'soil_lab']),
      ch4: done(['get_need', 'get_kit', 'invent']),
      ch5: { stage: 'locked', stepsDone: [], flags: [], rewarded: false },
    },
    inventory: [
      { itemId: 'nature_card', from: 'carver', obtainedAt: 4, used: false, inspected: true },
      { itemId: 'journey_card', from: 'carver', obtainedAt: 8, used: false, inspected: true },
      { itemId: 'rotation_card', from: 'carver', obtainedAt: 12, used: false, inspected: true },
      { itemId: 'invention_card', from: 'carver', obtainedAt: 16, used: false, inspected: true },
    ],
  },
  learner: {},
  log: [],
  tips: ['move', 'findCarver', 'talk', 'journal', 'bag', 'rest'],
  chapterData: {},
  memories: ['childhood', 'tuskegee_soil', 'peanut_lab'],
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
async function toClara(page) {
  await toRoad(page);
  await walkPath(page, [[27.7, 9.6], [27.7, 7.95]]);
  await tapKey(page, 'ArrowRight', 30);
}
async function rideOut(page) {
  await toRoad(page);
  await walkPath(page, [[26, 9.6], [26, 8.7]]);
  await tapKey(page, 'ArrowUp', 30);
  const ok = await waitTarget(page, /wagon to Two Creeks/);
  await page.keyboard.press('e');
  await sleep(page, 1200);
  return ok;
}
/** Inside Two Creeks: go along the cross path (y 9.4) or the lane (x 8.9). */
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
async function look(page, x, y, re) {
  await creekTo(page, x, y);
  const ok = await waitTarget(page, re);
  await page.keyboard.press('e');
  await sleep(page, 300);
  await finishDialogue(page);
  return ok;
}
async function openTable(page) {
  await creekTo(page, 7.3, 9.35);
  await waitTarget(page, /demonstration table/i);
  await page.keyboard.press('e');
  await page.locator('.table-modal').waitFor({ timeout: 3000 });
}
async function rec(page, id) {
  await page.locator(`[data-rec="${id}"]`).click();
}
async function checkPlan(page) {
  await page.locator('[data-check]').click();
  await sleep(page, 300);
  return {
    card: (await page.locator('.table-modal [data-result]').textContent()) ?? '',
    msg: (await page.locator('.table-modal [data-msg]').textContent()) ?? '',
  };
}

// =====================================================================
// Desktop, 1280x720
// =====================================================================
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
watch(page, 'desktop');
await openWithSave(page, PHASE4_SAVE);
let s = await state(page);
check('A Phase 4 save loads; Chapter 5 opens and Carver offers it', s.chapters.ch5 === 'available' && /Carver/.test(s.objective), s.objective);

// --- Carver assigns ---
await toCarver(page);
await talk(page);
check('Carver: science matters most when it helps real families', await sees(page, /helps real families/));
await advanceUntil(page, /Two Creeks/);
await clickChoice(page, /tell them what to buy/);
check('Carver: advice that costs money they do not have is no help', await sees(page, /no help at all/));
await advanceUntil(page, /Miss Clara drives/);
await sleep(page, 300);
await page.screenshot({ path: `${OUT}/01-carver-quest.png` });
await advanceUntil(page, /do not sell advice/);
check('Carver: we do not sell advice, we share it', /share it/.test(await dialogueText(page)));
await finishDialogue(page);
s = await state(page);
check('Quest accepted; next task is Miss Clara', s.chapters.ch5 === 'active' && /Clara/.test(s.objective), s.objective);

// --- Miss Clara gives the resource map ---
await toClara(page);
s = await state(page);
check('Miss Clara stands by the wagon in town', /Clara/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /movable school/);
await clickChoice(page, /Why a wagon/);
check('Branch: the school goes to the farmers', await sees(page, /the school goes to them/));
await advanceUntil(page, /resource map/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/02-outreach-helper-gives-map.png` });
await finishDialogue(page);
s = await state(page);
check('Miss Clara grants the resource map', s.inventory.some((e) => e.itemId === 'resource_map' && e.from === 'clara'));
check('Next task points to Mrs. Watts at Two Creeks', /Watts/.test(s.objective), s.objective);

// --- Carver's waiting talk ---
await toCarver(page);
await talk(page);
check("Carver's nudge sends you to the farm reports", await sees(page, /farm reports/));
await clickChoice(page, /costs money/);
check('Branch: the best idea is the one a family can use', await sees(page, /can really use/));
await finishDialogue(page);

// --- Ride the wagon ---
check('The wagon offers a ride to Two Creeks', await rideOut(page));
s = await state(page);
check('The wagon takes you to Two Creeks', s.scene === 'creek', s.scene);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/03-farm-overview.png` });

// --- Mrs. Watts ---
await creekTo(page, 4.5, 9.4, 'ArrowDown');
s = await state(page);
check('Mrs. Watts is by her hillside field', /Watts/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /runs down this hill/);
await clickChoice(page, /help on the farm/);
check('Branch: she works alone', await sees(page, /do it myself/));
await advanceUntil(page, /nothing fancy/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/04-farmer-gives-report.png` });
await finishDialogue(page);
s = await state(page);
check("Mrs. Watts grants her farm report", s.inventory.some((e) => e.itemId === 'farm_report_a' && e.from === 'watts'));

// --- Mr. Pryor ---
await creekTo(page, 13.5, 9.4, 'ArrowDown');
s = await state(page);
check('Mr. Pryor is by his creek field', /Pryor/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /cornbread/);
await clickChoice(page, /store fertilizer/);
check('Branch: store fertilizer left him owing the store', await sees(page, /still owe the store/));
await finishDialogue(page);
s = await state(page);
check("Mr. Pryor grants his farm report (a different report)", s.inventory.some((e) => e.itemId === 'farm_report_b' && e.from === 'pryor'));
check('Next task: look around both farms (0/4)', /0\/4/.test(s.objective), s.objective);

// --- The table is not ready before looking ---
await creekTo(page, 7.3, 9.35);
await waitTarget(page, /table/i);
await page.keyboard.press('e');
await sleep(page, 300);
check('The table asks you to look around both farms first', await sees(page, /look around Mrs\. Watts's farm/));
await finishDialogue(page);

// --- Look around ---
check('Look: the gully on the hill', await look(page, 2.5, 9.35, /ditch/));
check('Look: the hillside soil', await look(page, 3.6, 7.4, /hillside soil/));
check("Look: Mr. Pryor's creek-bank muck", await look(page, 14.5, 9.4, /creek bank/));
check("Look: Mr. Pryor's cotton", await look(page, 12.5, 8.4, /cotton/));
s = await state(page);
check('Four clues saved; the table is next', s.ch5Data?.looked?.length === 4 && /table/.test(s.objective), s.objective);

// --- The demonstration table: Mrs. Watts ---
await openTable(page);
const strip = (await page.locator('.report-strip').textContent()) ?? '';
check("The table shows the farmer's report, clues and the resource map", /rain washing the soil away/.test(strip) && /Resource map/.test(strip) && /\$12/.test(strip) && /gullies/.test(strip));
await rec(page, 'fertilizer');
await rec(page, 'contour');
let r = await checkPlan(page);
check('Store fertilizer is explained, not just marked wrong ($3 vs $12, washes away, next year)', /\$12/.test(r.card) && /\$3/.test(r.card) && /next year/.test(r.card) && /cannot really do/.test(r.card), r.card.slice(0, 120));
check('Hint 1 points back to the report', /Look at Mrs\. Watts's report/.test(r.msg), r.msg.slice(0, 80));
await page.locator('[data-result]').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/05-recommendation-screen.png` });
await rec(page, 'fertilizer');
await rec(page, 'cowpeas');
await rec(page, 'garden');
check('Only two cards per farmer', /Two cards per farmer/.test((await page.locator('[data-msg]').textContent()) ?? ''));
r = await checkPlan(page);
check('Plow across the slope + cowpeas fits Mrs. Watts', /This plan fits Mrs\. Watts/.test(r.card), r.card.slice(0, 80));
await page.locator('[data-reason="fancy"]').click();
await sleep(page, 200);
check('A weak reason gets a gentle correction', /"New" is not a reason/.test((await page.locator('[data-reason-msg]').textContent()) ?? ''));
await page.locator('[data-reason="fits"]').click();
await sleep(page, 300);
const helped = (await page.locator('.helped').textContent()) ?? '';
check('Mrs. Watts reacts and the card says who benefits', /Who benefits/.test(helped) && /Mr\. Pryor/.test(helped), helped.slice(0, 100));
check('She offers to pay', /three dollars/.test(helped));
await page.locator('[data-decline]').click();
await sleep(page, 200);
check('You help for free', /the way neighbors do/.test((await page.locator('.helped').textContent()) ?? ''));

// Reload in the middle of the table.
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Reload mid-chapter: still at Two Creeks with Mrs. Watts helped', s.scene === 'creek' && s.ch5Data?.explained?.watts === true && s.ch5Data?.plan?.watts?.join() === 'contour,cowpeas', JSON.stringify(s.ch5Data?.plan));

// --- Mr. Pryor ---
await openTable(page);
check('The table reopens on Mr. Pryor', /Mr\. Pryor's report/.test((await page.locator('.report-strip').textContent()) ?? ''));
await rec(page, 'contour');
await rec(page, 'compost');
r = await checkPlan(page);
check('Plowing across a flat field is "not his problem"', /field is flat/.test(r.card) && /does not match a problem/.test(r.card), r.card.slice(0, 100));
await rec(page, 'contour');
await rec(page, 'garden');
r = await checkPlan(page);
check('Compost + garden fits Mr. Pryor', /This plan fits Mr\. Pryor/.test(r.card));
await page.locator('[data-reason="fits"]').click();
await sleep(page, 300);
check('Mr. Pryor reacts, and the card says who benefits', /Who benefits/.test((await page.locator('.helped').textContent()) ?? ''));
await page.locator('.helped').scrollIntoViewIfNeeded();
await page.screenshot({ path: `${OUT}/06-farmer-outcome.png` });
await page.locator('[data-decline]').click();
await closeModal(page);
s = await state(page);
check('Minigame step completes and all three items are marked used', s.chapters.ch5 === 'active' && ['farm_report_a', 'farm_report_b', 'resource_map'].every((id) => s.inventory.find((e) => e.itemId === id)?.used));
check('Helping gives a small XP thank-you (twice, no Seeds)', s.xp === 660 + 20 && s.seeds === 68, `xp ${s.xp} seeds ${s.seeds}`);
check('Next task: return to Carver', /Return to Carver/.test(s.objective), s.objective);

// --- The farmers react afterwards ---
await creekTo(page, 13.5, 9.4, 'ArrowDown');
await talk(page);
check('Mr. Pryor talks about the new plan', await sees(page, /make compost and vegetable garden/));
await finishDialogue(page);

// --- Back to town and Carver ---
await creekTo(page, 8.9, 10.3);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1200);
s = await state(page);
check('Walking back to the wagon returns to town', s.scene === 'hub', s.scene);
await toCarver(page);
await talk(page);
check('Carver hears the news', await sees(page, /both farms are busy/));
await page.keyboard.press('Space');
await advanceUntil(page, /For Mrs\. Watts/);
check("Carver repeats your plan for Mrs. Watts", /plow across the slope and plant cowpeas/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /For Mr\. Pryor/);
await page.keyboard.press('Space');
await advanceUntil(page, /fertilizer/);
check('Carver noticed you tried fertilizer, then changed your mind', /changed your mind/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /why didn't you recommend store fertilizer/);
await clickChoice(page, /always bad/);
check('A wrong answer gets a clear correction', /Fertilizer can help plants grow/.test((await page.locator('.dialogue .feedback').textContent()) ?? ''));
await clickChoice(page, /costs money they do not have/);
await page.keyboard.press('Space');
await advanceUntil(page, /thought it through again/);
check('Carver notices the changed answer', /science for the people/i.test(await dialogueText(page)));
await page.screenshot({ path: `${OUT}/07-carver-debrief.png` });
await page.keyboard.press('Space');
await advanceUntil(page, /see a memory/);
await clickChoice(page, /show me the memory/);
await page.locator('.memory-modal').waitFor({ timeout: 3000 });
check('Memory 1: the Jesup Wagon, 1906', /1906/.test((await page.locator('.memory-caption').textContent()) ?? '') && /Jesup Wagon/.test((await page.locator('.memory-caption').textContent()) ?? ''));
await page.screenshot({ path: `${OUT}/08-memory-wagon.png` });
await page.getByRole('button', { name: 'Next page' }).click();
check('Memory 2: free compost from leaves, muck and manure', /compost/.test((await page.locator('.memory-caption').textContent()) ?? ''));
await page.getByRole('button', { name: 'Close the memory' }).click();
await sleep(page, 300);
await advanceUntil(page, /Interview Card/);
await finishDialogue(page);
await sleep(page, 500);
s = await state(page);
check('Chapter 5 complete; Carver gave the Interview Card', s.chapters.ch5 === 'complete' && s.inventory.some((e) => e.itemId === 'interview_card' && e.from === 'carver'));
check('Rewards: +150 XP and +25 Seeds', s.xp === 680 + 150 && s.seeds === 68 + 25, `xp ${s.xp}, seeds ${s.seeds}`);
check('Chapter 6 shows as unlocked, arriving next', s.chapters.ch6 === 'locked' && /Chapter 6 is unlocked/.test(s.objective), s.objective);
check('Learner model records the help objective', !!s.learner.help && s.learner.help.correct >= 3, JSON.stringify(s.learner.help ?? {}));

// --- Journal ---
await page.keyboard.press('j');
await sleep(page, 400);
const jt = (await page.locator('.modal .content').textContent()) ?? '';
check('Journal shows clues, both plans with reasons and who benefits, and the activity', /Farm helper notes/.test(jt) && /Who benefits/.test(jt) && /Why not store fertilizer/.test(jt) && /Growing-Need Interview/.test(jt));
await page.getByRole('heading', { name: /Farm helper notes/ }).scrollIntoViewIfNeeded();
await sleep(page, 200);
await page.screenshot({ path: `${OUT}/09-journal-farm-helper.png` });
await page.locator('.activity', { hasText: 'Growing-Need Interview' }).getByRole('button', { name: 'Open the printable card' }).click();
await sleep(page, 300);
check('Printable Interview Card opens', /My Growing-Need Interview/.test((await page.locator('.print-card').textContent()) ?? ''));
await closeModal(page);
await closeModal(page);

// --- Replay and reload: no duplicate rewards ---
await rideOut(page);
await openTable(page);
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Replay gives no duplicate rewards; completion survives reload', s.chapters.ch5 === 'complete' && s.xp === 830 && s.seeds === 93, `xp ${s.xp} seeds ${s.seeds}`);
await ctx.close();

// =====================================================================
// The other dialogue branches
// =====================================================================
const ctxB = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const pb = await ctxB.newPage();
watch(pb, 'branches');
await openWithSave(pb, PHASE4_SAVE);
await toCarver(pb);
await talk(pb);
await advanceUntil(pb, /Two Creeks/);
await clickChoice(pb, /How can I help/);
check('Branch: listen first', await sees(pb, /Listen first/));
await finishDialogue(pb);
await toClara(pb);
await talk(pb);
await advanceUntil(pb, /movable school/);
await clickChoice(pb, /What's in it/);
check("Branch: Miss Clara's wagon carries seed samples and a plow", await sees(pb, /Seed samples/));
await finishDialogue(pb);
await rideOut(pb);
await creekTo(pb, 4.5, 9.4, 'ArrowDown');
await talk(pb);
await advanceUntil(pb, /runs down this hill/);
await clickChoice(pb, /work with/);
check('Branch: Mrs. Watts has Buttercup, leaves and three dollars', await sees(pb, /three dollars/));
await finishDialogue(pb);
await creekTo(pb, 13.5, 9.4, 'ArrowDown');
await talk(pb);
await advanceUntil(pb, /cornbread/);
await clickChoice(pb, /plenty of/);
check('Branch: Mr. Pryor has muck and leaves', await sees(pb, /black muck/));
await finishDialogue(pb);
check('Look: the leaf piles', await look(pb, 13.0, 3.1, /leaf piles/));
check("Look: Mrs. Watts's cow", await look(pb, 7.1, 2.4, /cow/));
await ctxB.close();

// =====================================================================
// Narrow phone, 390x844, touch
// =====================================================================
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await phone.newPage();
watch(p2, 'narrow');
const mid = JSON.parse(JSON.stringify(PHASE4_SAVE));
mid.world = { scene: 'creek', x: 7.3, y: 9.35, facing: 'up' };
mid.progress.chapters.ch5 = { stage: 'active', stepsDone: ['get_map', 'get_report_watts', 'get_report_pryor'], flags: [], rewarded: false };
for (const [id, from] of [['resource_map', 'clara'], ['farm_report_a', 'watts'], ['farm_report_b', 'pryor']]) mid.progress.inventory.push({ itemId: id, from, obtainedAt: 9, used: false, inspected: true });
mid.chapterData.ch5 = { looked: ['gully', 'cow', 'muck', 'leaves'] };
await openWithSave(p2, mid);
await waitTarget(p2, /table/i);
await p2.screenshot({ path: `${OUT}/10-narrow-farm.png` });
check('No clipped or off-screen UI at 390x844 (Two Creeks)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
await p2.locator('.touch-act').tap();
await p2.locator('.table-modal').waitFor({ timeout: 3000 });
await p2.locator('[data-rec="contour"]').tap();
await p2.locator('[data-rec="compost"]').tap();
await p2.locator('[data-check]').tap();
await sleep(p2, 400);
check('Recommending works with touch on a phone', /This plan fits Mrs\. Watts/.test((await p2.locator('[data-result]').textContent()) ?? ''));
await p2.locator('[data-result]').scrollIntoViewIfNeeded();
await p2.screenshot({ path: `${OUT}/11-narrow-table.png` });
check('No clipped or off-screen UI at 390x844 (table)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
const overflow = await p2.evaluate(() => {
  const m = document.querySelector('.table-modal');
  return m.scrollWidth - m.clientWidth;
});
check('The table has no sideways scrolling on a phone', overflow <= 1, String(overflow));
await closeModal(p2);
await phone.close();

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();
const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, passed, total: results.length, results, consoleErrors }, null, 2));
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
