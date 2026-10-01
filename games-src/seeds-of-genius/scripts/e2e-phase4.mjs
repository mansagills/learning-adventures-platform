// Phase 4 check-in test: Chapter 4 "The Peanut Isn't Just a Peanut / Inventor's Workshop".
// Starts from a real Phase 3 save (Chapter 3 complete), plays the chapter
// with real keyboard and mouse input, checks each acceptance criterion and
// captures the check-in screenshots.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/e2e-phase4.mjs [baseUrl]
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
const OUT = 'test-output/phase4';
mkdirSync(OUT, { recursive: true });
const browser = await launch();

const done = (steps = []) => ({ stage: 'complete', stepsDone: steps, flags: [], rewarded: true });
// A save exactly as Phase 3 wrote it: Chapter 3 complete, Chapter 4 'locked'.
const PHASE3_SAVE = {
  version: 2,
  createdAt: 1,
  savedAt: 1,
  customized: true,
  appearance: { skin: 'skin5', hairStyle: 'locs', hairColor: 'darkbrown', outfit: 'purple', accessory: 'headband' },
  world: { scene: 'hub', x: 19.5, y: 9.6, facing: 'up' },
  time: { minutes: 10 * 60, day: 5, paused: true },
  progress: {
    xp: 510,
    seeds: 73,
    chapters: {
      practice: done(['get_seeds']),
      ch1: done(['get_notebook', 'get_lens', 'observe_sort']),
      ch2: done(['get_record', 'get_sketch', 'build_timeline']),
      ch3: done(['get_samples', 'get_cards', 'soil_lab']),
      ch4: { stage: 'locked', stepsDone: [], flags: [], rewarded: false },
    },
    inventory: [
      { itemId: 'nature_card', from: 'carver', obtainedAt: 4, used: false, inspected: true },
      { itemId: 'journey_card', from: 'carver', obtainedAt: 8, used: false, inspected: true },
      { itemId: 'rotation_card', from: 'carver', obtainedAt: 12, used: false, inspected: true },
    ],
  },
  learner: {},
  log: [],
  tips: ['move', 'findCarver', 'talk', 'journal', 'bag', 'rest'],
  chapterData: {},
  memories: ['childhood', 'tuskegee_soil'],
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
/** Walk inside the workshop along row 5.5. */
async function shopTo(page, x, y) {
  const { player } = await state(page);
  if (Math.abs(player.x - x) > 0.3) await walkPath(page, [[player.x, 5.5], [x, 5.5]]);
  await walkPath(page, [[x, y]]);
  await tapKey(page, 'ArrowUp', 30);
}
async function pick(page, opt) {
  await page.locator(`[data-opt="${opt}"]`).click();
}
async function build(page) {
  await page.locator('[data-build]').click();
  await sleep(page, 300);
  return {
    card: (await page.locator('.result-card').textContent()) ?? '',
    msg: (await page.locator('.bench-modal [data-msg]').textContent()) ?? '',
  };
}

// =====================================================================
// Desktop, 1280x720
// =====================================================================
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
watch(page, 'desktop');
await openWithSave(page, PHASE3_SAVE);
let s = await state(page);
check('A Phase 3 save loads; Chapter 4 opens and Carver offers it', s.chapters.ch4 === 'available' && /Carver/.test(s.objective), s.objective);

// --- Carver assigns ---
await toCarver(page);
await talk(page);
check('Carver opens Chapter 4: a crop only helps if it can be used', await sees(page, /use it or sell it/));
await advanceUntil(page, /job for an inventor/);
await clickChoice(page, /peanut butter/);
check('Carver says plainly he did not invent peanut butter', await sees(page, /No, I did not/));
await advanceUntil(page, /Miss Lottie, the cook/);
await sleep(page, 300);
await page.screenshot({ path: `${OUT}/01-carver-quest.png` });
await finishDialogue(page);
s = await state(page);
check('Quest accepted; next task is Miss Lottie', s.chapters.ch4 === 'active' && /Lottie/.test(s.objective), s.objective);

// --- Miss Lottie gives the need card ---
await toLottie(page);
s = await state(page);
check('Miss Lottie is in the town square', /Lottie/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /hungry/);
await clickChoice(page, /fridge/);
check('Branch: the snack must keep a week on a shelf', await sees(page, /at least a week/));
await advanceUntil(page, /wrote it all on this card/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/02-cook-gives-need-card.png` });
await finishDialogue(page);
s = await state(page);
check('Miss Lottie grants the need card', s.inventory.some((e) => e.itemId === 'need_card' && e.from === 'lottie'));

// --- Carver's waiting talk ---
await toCarver(page);
await talk(page);
check("Carver's nudge points to Mr. Brooks", await sees(page, /Mr\. Brooks is outside the workshop/));
await clickChoice(page, /doesn't work/);
check('Branch: a failed test tells you what to change', await sees(page, /tells you what to change/));
await finishDialogue(page);

// --- Mr. Brooks gives the materials kit ---
await toWorkshopRoad(page, 35.5);
s = await state(page);
check('Mr. Brooks is outside the workshop', /Brooks/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /hand mill/);
await clickChoice(page, /fry/);
check('Branch: no frying, hot oil is too dangerous', await sees(page, /Hot oil is too dangerous/));
await advanceUntil(page, /materials kit/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/03-craftsperson-gives-kit.png` });
await finishDialogue(page);
s = await state(page);
check('Mr. Brooks grants the materials kit', s.inventory.some((e) => e.itemId === 'materials_kit' && e.from === 'wendell'));
check('Next task: the crop shelf in the workshop (0/3)', /0\/3/.test(s.objective), s.objective);

// --- Into the workshop ---
await toWorkshopRoad(page, 33.5);
await walkPath(page, [[33.5, 26.1]]);
check('The workshop door offers to open', await waitTarget(page, /Workshop door/), (await state(page)).target?.label);
await page.keyboard.press('e');
await sleep(page, 1200);
s = await state(page);
check('The workshop door opens', s.scene === 'workshop', s.scene);
await shopTo(page, 7, 5.4);
await waitTarget(page, /workbench/);
await page.keyboard.press('e');
await sleep(page, 400);
check('The workbench asks you to explore the crops first', await sees(page, /try a test on every crop/));
await finishDialogue(page);

// Explore crop properties.
await shopTo(page, 3, 3.4);
await waitTarget(page, /crop shelf/);
await page.keyboard.press('e');
await page.locator('.shelf-modal').waitFor({ timeout: 3000 });
for (const t of ['peanuts:press', 'peanuts:label', 'sweetpotato:cut', 'cowpeas:bite']) await page.locator(`[data-test="${t}"]`).click();
const shelf = (await page.locator('.shelf-modal').textContent()) ?? '';
check('Crop tests reveal properties: oil, allergy, wet inside, hard dry beans', /full of oil/.test(shelf) && /allergic/.test(shelf) && /orange and wet/.test(shelf) && /hard as pebbles/.test(shelf));
await page.screenshot({ path: `${OUT}/04-crop-properties.png` });
await closeModal(page);

// --- The workbench ---
await shopTo(page, 7, 5.4);
await waitTarget(page, /workbench/);
await page.keyboard.press('e');
await page.locator('.bench-modal').waitFor({ timeout: 3000 });
check('The need card and workshop rules are shown on the bench', /keeps 7\+ days/.test((await page.locator('.need-strip').textContent()) ?? '') && /no frying/.test((await page.locator('.need-strip').textContent()) ?? ''));
let r = await build(page); // default: peanuts, boil, open bowl
check('Trial 1 (boiled peanuts in a bowl): spoils and needs a label, explained', /About 1 day/.test(r.card) && /allergy label/.test(r.card) && /Look at what the test showed/.test(r.msg), r.msg.slice(0, 80));
check('Every prototype is marked as a game invention', /Game invention: made up for this story/.test(r.card));
await page.screenshot({ path: `${OUT}/05-workshop-assembly.png` });
await page.getByRole('button', { name: /Stop improving/ }).click();
await pick(page, 'crop:cowpeas');
await pick(page, 'step1:roast');
await pick(page, 'box:jar');
r = await build(page);
check('Trial 2 (roasted dry cowpeas): rock hard and unsafe; hint 2 says cook in water first', /rock hard/.test(r.card) && /cooked in water/.test(r.msg), r.msg.slice(0, 90));

// Reload in the middle of the workshop.
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Reload mid-workshop: still in the workshop, both trials kept', s.scene === 'workshop' && s.ch4Data?.trials?.length === 2, JSON.stringify(s.ch4Data?.trials?.length));
await shopTo(page, 7, 5.4);
await waitTarget(page, /workbench/);
await page.keyboard.press('e');
await page.locator('.bench-modal').waitFor({ timeout: 3000 });
check('The trial log reopens with both trials', (await page.locator('.trial-log tbody tr').count()) === 2);

await pick(page, 'crop:sweetpotato');
r = await build(page);
check('Trial 3 (roasted sweet potato): still moist, spoils; hint 3 is a worked example', /About 2 days/.test(r.card) && /Worked example/.test(r.msg) && (await page.getByRole('button', { name: 'Fill in the example' }).count()) === 1, r.msg.slice(0, 80));

// Improve trial 1 using the evidence: roast after boiling, a jar, and a label.
await page.locator('[data-improve="0"]').click();
check('"Improve this idea" loads trial 1 into the bench', /Improving trial 1/.test((await page.locator('.improving').textContent()) ?? ''));
await pick(page, 'step2:roast');
await pick(page, 'box:jar');
await pick(page, 'label:yes');
r = await build(page);
check('The revised design passes every part of the need', /It fits the kitchen's need/.test(r.card) && /Your improved design works/.test(r.msg), r.msg.slice(0, 80));
await page.locator('.trial-log').scrollIntoViewIfNeeded();
await sleep(page, 200);
await page.screenshot({ path: `${OUT}/06-trial-results.png` });
check('Only the real revision can go to Carver', (await page.locator('[data-choose]').count()) === 1);
await page.locator('[data-choose="3"]').click();
await sleep(page, 300);
await closeModal(page);
s = await state(page);
check('Minigame step completes and both items are marked used', s.chapters.ch4 === 'active' && ['need_card', 'materials_kit'].every((id) => s.inventory.find((e) => e.itemId === id)?.used));
check('Next task: return to Carver', /Return to Carver/.test(s.objective), s.objective);

// --- Decorations with Seeds ---
await shopTo(page, 12, 3.4);
await waitTarget(page, /decorations/);
await page.keyboard.press('e');
await page.locator('.decor-list').waitFor({ timeout: 3000 });
await page.locator('[data-buy="fern"]').click();
await page.locator('[data-buy="poster"]').click();
await sleep(page, 200);
s = await state(page);
check('Buying decorations spends Seeds once each', s.seeds === 73 - 30 && s.cosmetics.join() === 'fern,poster', `${s.seeds} ${s.cosmetics}`);
check('Owned decorations cannot be bought twice', await page.locator('[data-buy="fern"]').isDisabled());
await closeModal(page);
await walkPath(page, [[12, 5.5], [9, 5.5], [9, 6.5]]);
await page.screenshot({ path: `${OUT}/07-workshop-decor.png` });

// --- Back to Carver ---
await walkPath(page, [[7, 6.5], [7, 7.3]]);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1200);
s = await state(page);
check('Walking out returns to town by the workshop', s.scene === 'hub', s.scene);
await walkPath(page, [[33.5, 26.55], [27.5, 26.55], [27.5, 9.6]]);
await toCarver(page);
await talk(page);
check('Carver names the invention', await sees(page, /boiled, then roasted peanuts/));
await page.keyboard.press('Space');
await advanceUntil(page, /You started with/);
const rev = await dialogueText(page);
check('Carver tells the revision story from the tests', /boiled peanuts/.test(rev) && /added an allergy label/.test(rev), rev.slice(0, 120));
await page.screenshot({ path: `${OUT}/08-carver-revised-invention.png` });
await page.keyboard.press('Space');
await advanceUntil(page, /You tested 4 ideas/);
check('Carver counts the trials and notices the allergy label', /allergy label/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /why does your final design fit/);
await clickChoice(page, /most steps/);
check('A wrong explanation gets a clear correction', /More steps meant more work/.test((await page.locator('.dialogue .feedback').textContent()) ?? ''));
await clickChoice(page, /keeps a week/);
await page.keyboard.press('Space');
await advanceUntil(page, /thought again/);
check('Carver notices the changed answer', /need first, then test, then improve/i.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /see a memory/);
await clickChoice(page, /show me the memory/);
await page.locator('.memory-modal').waitFor({ timeout: 3000 });
check('Memory 1: new uses for crops in his laboratory', /laboratory/.test((await page.locator('.memory-caption').textContent()) ?? ''));
await page.getByRole('button', { name: 'Next page' }).click();
check('Memory 2: Congress in 1921, and he did not invent peanut butter', /1921/.test((await page.locator('.memory-caption').textContent()) ?? '') && /did not/.test((await page.locator('.memory-caption').textContent()) ?? ''));
await page.getByRole('button', { name: 'Close the memory' }).click();
await sleep(page, 300);
await advanceUntil(page, /Invention Sketch Card/);
await finishDialogue(page);
await sleep(page, 500);
s = await state(page);
check('Chapter 4 complete; Carver gave the Invention Sketch Card', s.chapters.ch4 === 'complete' && s.inventory.some((e) => e.itemId === 'invention_card' && e.from === 'carver'));
check('Rewards: +150 XP and +25 Seeds', s.xp === 510 + 150 && s.seeds === 43 + 25, `xp ${s.xp}, seeds ${s.seeds}`);
check('Chapter 5 is offered next', s.chapters.ch5 === 'available', s.objective);
check('Learner model records the invent objective', !!s.learner.invent && s.learner.invent.correct >= 3, JSON.stringify(s.learner.invent ?? {}));

// --- Journal ---
await page.keyboard.press('j');
await sleep(page, 400);
const jt = (await page.locator('.modal .content').textContent()) ?? '';
check('Journal shows the invention log, decorations, reflection and activity', /Invention log/.test(jt) && /Brought to Carver/.test(jt) && /potted fern/.test(jt) && /Invention Sketch Card/.test(jt));
await page.getByRole('heading', { name: /Invention log/ }).scrollIntoViewIfNeeded();
await sleep(page, 200);
await page.screenshot({ path: `${OUT}/09-journal-invention.png` });
await page.locator('.activity', { hasText: 'Invention Sketch Card' }).getByRole('button', { name: 'Open the printable card' }).click();
await sleep(page, 300);
check('Printable Invention Sketch Card opens', /My Invention Sketch Card/.test((await page.locator('.print-card').textContent()) ?? ''));
await closeModal(page);
await closeModal(page);

// --- Replay and reload: no duplicate rewards; decorations persist ---
await toWorkshopRoad(page, 33.5);
await walkPath(page, [[33.5, 26.1]]);
await waitTarget(page, /Workshop door/);
await page.keyboard.press('e');
await sleep(page, 1200);
await shopTo(page, 7, 5.4);
await waitTarget(page, /workbench/);
await page.keyboard.press('e');
await page.locator('.bench-modal').waitFor({ timeout: 3000 });
await build(page);
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Replay gives no duplicate rewards; completion and decorations survive reload', s.chapters.ch4 === 'complete' && s.xp === 660 && s.seeds === 68 && s.cosmetics.length === 2, `xp ${s.xp} seeds ${s.seeds}`);
await ctx.close();

// =====================================================================
// The other dialogue branches
// =====================================================================
const ctxB = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const pb = await ctxB.newPage();
watch(pb, 'branches');
await openWithSave(pb, PHASE3_SAVE);
await toCarver(pb);
await talk(pb);
await advanceUntil(pb, /job for an inventor/);
await clickChoice(pb, /What kind of purpose/);
check('Branch: an invention starts with a need', await sees(pb, /starts with a need/));
await finishDialogue(pb);
await toLottie(pb);
await talk(pb);
await advanceUntil(pb, /hungry/);
await clickChoice(pb, /kids like/);
check("Branch: Miss Lottie says kids like crunchy things", await sees(pb, /Crunchy things/));
await finishDialogue(pb);
await toWorkshopRoad(pb, 35.5);
await talk(pb);
await advanceUntil(pb, /hand mill/);
await clickChoice(pb, /rules/);
check('Branch: Mr. Brooks lists the three workshop rules', await sees(pb, /Three rules/));
await finishDialogue(pb);
await ctxB.close();

// =====================================================================
// Narrow phone, 390x844, touch
// =====================================================================
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await phone.newPage();
watch(p2, 'narrow');
const mid = JSON.parse(JSON.stringify(PHASE3_SAVE));
mid.world = { scene: 'workshop', x: 7, y: 5.4, facing: 'up' };
mid.progress.chapters.ch4 = { stage: 'active', stepsDone: ['get_need', 'get_kit'], flags: [], rewarded: false };
for (const [id, from] of [['need_card', 'lottie'], ['materials_kit', 'wendell']]) mid.progress.inventory.push({ itemId: id, from, obtainedAt: 9, used: false, inspected: true });
mid.chapterData.ch4 = { explored: { peanuts: ['press'], sweetpotato: ['cut'], cowpeas: ['bite'] } };
await openWithSave(p2, mid);
await waitTarget(p2, /workbench/);
await p2.screenshot({ path: `${OUT}/10-narrow-workshop.png` });
check('No clipped or off-screen UI at 390x844 (workshop)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
await p2.locator('.touch-act').tap();
await p2.locator('.bench-modal').waitFor({ timeout: 3000 });
await p2.locator('[data-opt="crop:sweetpotato"]').tap();
await p2.locator('[data-opt="step2:dry"]').tap();
await p2.locator('[data-opt="box:jar"]').tap();
await p2.locator('[data-build]').tap();
await sleep(p2, 400);
check('Building works with touch on a phone', /Sweet Potato Chips/.test((await p2.locator('.result-card').textContent()) ?? ''));
await p2.locator('.result-card').scrollIntoViewIfNeeded();
await p2.screenshot({ path: `${OUT}/11-narrow-bench.png` });
check('No clipped or off-screen UI at 390x844 (workbench)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
const overflow = await p2.evaluate(() => {
  const m = document.querySelector('.bench-modal');
  return m.scrollWidth - m.clientWidth;
});
check('The workbench has no sideways scrolling on a phone', overflow <= 1, String(overflow));
await closeModal(p2);
await phone.close();

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();
const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, passed, total: results.length, results, consoleErrors }, null, 2));
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
