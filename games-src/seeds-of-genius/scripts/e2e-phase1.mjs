// Phase 1 check-in test: Chapter 1 "A Seed Is Planted / Curiosity Collector".
// Starts from a real Phase 0 (version 1) save, plays the chapter with real
// keyboard and mouse input, checks each acceptance criterion and captures
// the check-in screenshots.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/e2e-phase1.mjs [baseUrl]
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
} from './e2e-lib.mjs';

const BASE = process.argv[2] ?? 'http://localhost:4173/';
const OUT = 'test-output/phase1';
mkdirSync(OUT, { recursive: true });
const browser = await launch();

// A save exactly as Phase 0 wrote it (version 1): practice quest complete.
const PHASE0_SAVE = {
  version: 1,
  createdAt: 1,
  savedAt: 1,
  customized: true,
  appearance: { skin: 'skin5', hairStyle: 'locs', hairColor: 'darkbrown', outfit: 'purple', accessory: 'headband' },
  world: { scene: 'hub', x: 19.5, y: 9.6, facing: 'up' },
  time: { minutes: 9 * 60, day: 2, paused: true },
  progress: {
    xp: 50,
    seeds: 10,
    chapters: { practice: { stage: 'complete', stepsDone: ['get_seeds'], flags: [], rewarded: true } },
    inventory: [{ itemId: 'seed_packet', from: 'mae', obtainedAt: 1, used: true, usedIn: 'Given to Carver to plant', inspected: true }],
  },
  learner: {},
  log: [],
  tips: ['move', 'findCarver', 'talk', 'journal', 'bag', 'rest'],
};

const GUESS_WORDS = ['must have', 'because it likes', 'is hungry', 'sad because', 'will take', 'hiding from', 'last night'];
const isGuess = (text) => GUESS_WORDS.some((w) => text.toLowerCase().includes(w));

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

async function talk(page) {
  await page.keyboard.press('e');
  for (let i = 0; i < 20 && !(await page.locator('.dialogue').count()); i++) await sleep(page, 100);
}

async function inspectHere(page, zoneLabel, wrongFirst) {
  await page.keyboard.press('e');
  await page.locator('.inspect-modal').waitFor({ timeout: 3000 });
  await page.getByRole('button', { name: zoneLabel }).click();
  await sleep(page, 200);
  let fb = '';
  if (wrongFirst) {
    // Pick the entry that is not the specific observation: the shortest one is the vague one.
    const texts = await page.locator('.write .choices button').allInnerTexts();
    const shortest = texts.reduce((a, b) => (b.length < a.length ? b : a));
    await page.locator('.write .choices button', { hasText: shortest.replace(/^\d\s*/, '').trim() }).click();
    await sleep(page, 250);
    fb = (await page.locator('.write .feedback').textContent()) ?? '';
  }
  return fb;
}

async function recordObservation(page) {
  const texts = await page.locator('.write .choices button:not([disabled])').allInnerTexts();
  const longest = texts.reduce((a, b) => (b.length > a.length ? b : a));
  await page.locator('.write .choices button', { hasText: longest.replace(/^\d\s*/, '').trim() }).click();
  await sleep(page, 300);
  return (await page.locator('.write .feedback').textContent()) ?? '';
}

async function closeModal(page) {
  await page.keyboard.press('Escape');
  await sleep(page, 300);
}

// =====================================================================
// Desktop, 1280x720
// =====================================================================
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
watch(page, 'desktop');
await openWithSave(page, PHASE0_SAVE);
let s = await state(page);
check('A Phase 0 (v1) save loads and is upgraded to v2', s.version === 2 && s.practice.stage === 'complete' && s.xp === 50, `v${s.version}`);
check('Chapter 1 is unlocked and Carver offers it', s.chapters.ch1 === 'available' && /Carver/.test(s.objective), s.objective);

// --- Carver assigns, with a memory from his childhood ---
await walkPath(page, [[19.5, 7.5], [20.3, 7.5]]);
await tapKey(page, 'ArrowRight', 30);
await talk(page);
check("Carver opens Chapter 1's quest", /community garden/.test(await dialogueText(page)) || (await advanceUntil(page, /community garden/)));
await advanceUntil(page, /see a memory/);
await clickChoice(page, /show me the memory/);
await page.locator('.memory-modal').waitFor({ timeout: 3000 });
const memText = (await page.locator('.memory-modal').textContent()) ?? '';
check('The memory is labeled as history, with place and time', /A memory from Carver's life/.test(memText) && /Diamond, Missouri/.test(memText));
check('The memory shows young George (born around 1864), with imagined pictures noted', /born into slavery around 1864/.test(memText) && /pictures are imagined/.test(memText));
await page.screenshot({ path: `${OUT}/01a-carver-memory.png` });
await page.getByRole('button', { name: 'Next page' }).click();
await page.getByRole('button', { name: 'Next page' }).click();
const page3 = (await page.locator('.memory-caption').textContent()) ?? '';
check("Memory page 3: the 'plant doctor'", /plant doctor/.test(page3));
await page.getByRole('button', { name: 'Close the memory' }).click();
await sleep(page, 300);
check('Dialogue continues after the memory closes', await page.locator('.dialogue').isVisible());
await advanceUntil(page, /Hattie Bell/);
await page.screenshot({ path: `${OUT}/01-carver-quest.png` });
await finishDialogue(page);
s = await state(page);
check('Quest accepted; next task is Hattie', s.ch1.stage === 'active' && /Hattie/.test(s.objective), s.objective);
check('Memory is remembered for the journal', s.memories.includes('childhood'));

// --- Hattie gives the field notebook ---
await walkPath(page, [[19.5, 9.6], [13.5, 9.6]]);
await tapKey(page, 'ArrowUp', 30);
await talk(page);
check('Hattie talks about her garden', (await page.locator('.dialogue .name').textContent()) === 'Hattie Bell');
await advanceUntil(page, /nibbling my beans/);
await clickChoice(page, /What should I look for/);
await advanceUntil(page, /Here is the field notebook/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/02-hattie-gives-notebook.png` });
await finishDialogue(page);
s = await state(page);
check('Hattie grants the field notebook', s.inventory.some((e) => e.itemId === 'field_notebook' && e.from === 'hattie'));
check('Next task is Theo', /Theo/.test(s.objective), s.objective);

// --- Theo gives the lens after a ladybug question (wrong answer first) ---
await walkPath(page, [[27.5, 9.6], [27.5, 19.5], [26.8, 19.5]]);
await tapKey(page, 'ArrowLeft', 30);
await talk(page);
await advanceUntil(page, /notice, not a guess/);
await clickChoice(page, /looking for its family/);
const tfb = (await page.locator('.dialogue .feedback').textContent()) ?? '';
check("Theo explains a wrong answer and gives a hint", /guess/.test(tfb) && /clue/i.test(tfb), tfb.slice(0, 70));
await clickChoice(page, /seven black spots/);
await page.keyboard.press('Space');
await advanceUntil(page, /borrow my magnifying lens/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/03-theo-gives-lens.png` });
await finishDialogue(page);
s = await state(page);
check('Theo grants the magnifying lens', s.inventory.some((e) => e.itemId === 'magnifying_lens' && e.from === 'theo'));
check('Next task points to the garden (0/3)', /0\/3/.test(s.objective), s.objective);

// --- Inspect the garden with notebook + lens ---
await walkPath(page, [[27.5, 9.6], [11.8, 9.6], [11.8, 6.2]]);
s = await state(page);
check('Standing by a sparkling garden spot shows a prompt', /Look closely/.test(s.target?.label ?? ''), s.target?.label);
const fb1 = await inspectHere(page, 'Look at the tips of the carrot leaves', true);
check('A vague entry gets feedback and the hint highlights the details', /specific|describe|check/i.test(fb1) && (await page.locator('.zone.glow').count()) > 0, fb1.slice(0, 70));
await page.screenshot({ path: `${OUT}/04-garden-inspection.png` });
const ok1 = await recordObservation(page);
check('The specific observation is recorded', /Recorded in your notebook/.test(ok1));
await closeModal(page);
await walkPath(page, [[10.0, 6.2]]);
await inspectHere(page, 'Look at the holes in the big leaf', false);
await page.getByRole('button', { name: 'Look under the big leaf' }).click();
await recordObservation(page);
await closeModal(page);
await walkPath(page, [[13.0, 6.3]]);
await inspectHere(page, 'Look at the pink shape in the soil', false);
const ok3 = await recordObservation(page);
check('Third observation tells you to sort at the potting bench', /potting bench/.test(ok3));
await closeModal(page);
s = await state(page);
check('Three observations recorded (plants, soil and insects/worm)', s.ch1Data.observations.length === 3, JSON.stringify(s.ch1Data.observations.map((o) => o.spot)));
check('Next task points to the potting bench', /potting bench/.test(s.objective), s.objective);

// --- Optional exploration: a hidden bonus spot ---
await walkPath(page, [[12.0, 9.6], [6.5, 9.6], [6.5, 4.6]]);
s = await state(page);
check('A hidden bonus spot is found by wandering', /Under an old board/.test(s.target?.label ?? ''), s.target?.label);
const seedsBefore = s.seeds;
await inspectHere(page, 'Look at the snail', false);
const bonusFb = await recordObservation(page);
await closeModal(page);
s = await state(page);
check('Bonus find rewards Seeds once, with a fun fact', s.seeds === seedsBefore + 3 && /Fun fact/.test(bonusFb), `${seedsBefore} -> ${s.seeds}`);

// --- Card game: wrong placements climb the hint ladder; reload mid-game ---
await walkPath(page, [[6.5, 9.6], [9.5, 9.6]]);
await page.keyboard.press('e');
await page.locator('.sort-modal').waitFor({ timeout: 3000 });
check('Card game shows 8 cards', (await page.locator('.sort-card').count()) === 8);
async function placeWrong() {
  const card = page.locator('.sort-card').first();
  const text = (await card.locator('p').textContent()) ?? '';
  await card.getByRole('button', { name: new RegExp(`^${isGuess(text) ? 'Observation' : 'Guess'}:`) }).click();
  await sleep(page, 250);
}
async function placeRight(n) {
  for (let i = 0; i < n; i++) {
    const card = page.locator('.sort-card').first();
    if (!(await card.count())) return;
    const text = (await card.locator('p').textContent()) ?? '';
    await card.getByRole('button', { name: new RegExp(`^${isGuess(text) ? 'Guess' : 'Observation'}:`) }).click();
    await sleep(page, 200);
  }
}
await placeWrong();
const sfb = (await page.locator('.sort-modal .feedback').textContent()) ?? '';
check('A wrong card gets an explanation (hint 1: details highlighted)', /Not quite/.test(sfb) && (await page.locator('mark.mark-detail').count()) > 0, sfb.slice(0, 80));
await page.screenshot({ path: `${OUT}/05-card-challenge-feedback.png` });
await placeWrong();
check('Hint 2 highlights words that give guesses away', (await page.locator('mark.mark-guess').count()) > 0);
await placeWrong();
check('Hint 3 shows a worked example on the card', (await page.locator('.sort-actions .btn.worked').count()) === 1);
await placeRight(3);
const progressText = (await page.locator('.sort-progress').textContent()) ?? '';
await closeModal(page);
await page.reload();
await sleep(page, 900);
await page.getByRole('button', { name: 'Continue' }).click();
for (let i = 0; i < 30 && !(await state(page)).runtimesReady; i++) await sleep(page, 100);
await sleep(page, 300);
await page.keyboard.press('e');
await page.locator('.sort-modal').waitFor({ timeout: 3000 });
check('Reload mid-game resumes the card game where it was', ((await page.locator('.sort-progress').textContent()) ?? '') === progressText, progressText);
await placeRight(8);
await sleep(page, 300);
check('All cards sorted', /All sorted/.test((await page.locator('.sort-modal .feedback').textContent()) ?? ''));
await closeModal(page);
s = await state(page);
check('Minigame step completes and both items are marked used', s.ch1.stepsDone.includes('observe_sort') && ['field_notebook', 'magnifying_lens'].every((id) => s.inventory.find((e) => e.itemId === id)?.used));
check('Next task: return to Carver', /Return to Carver/.test(s.objective), s.objective);

// --- Carver debriefs, reacting to the player's notes and mistakes ---
await walkPath(page, [[19.5, 9.6], [19.5, 7.5], [20.3, 7.5]]);
await tapKey(page, 'ArrowRight', 30);
await talk(page);
await advanceUntil(page, /You wrote/);
const quoted = await dialogueText(page);
check("Carver quotes the player's own first observation", /yellow tips/.test(quoted), quoted.slice(0, 90));
await page.keyboard.press('Space');
await advanceUntil(page, /moved 3 cards/);
check('Carver responds to the mistakes the player fixed', /moved 3 cards/.test(await dialogueText(page)));
await page.keyboard.press('Space');
await advanceUntil(page, /One more question/);
await clickChoice(page, /nobody saw a rabbit/);
await page.keyboard.press('Space');
await advanceUntil(page, /Nature Observation Card/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/06-carver-debrief.png` });
await finishDialogue(page);
await sleep(page, 500);
s = await state(page);
check('Chapter 1 complete; Carver gave the Nature Observation Card', s.ch1.stage === 'complete' && s.inventory.some((e) => e.itemId === 'nature_card' && e.from === 'carver'));
check('Rewards: +150 XP and +20 Seeds (plus the bonus)', s.xp === 50 + 150 + 10 && s.seeds === 10 + 20 + 3, `xp ${s.xp}, seeds ${s.seeds}`);
check('Chapter 2 shows as unlocked', s.chapters.ch2 === 'locked' && /Chapter 2 is unlocked/.test(s.objective), s.objective);

// --- Journal: evidence, memory, activity card ---
await page.keyboard.press('j');
await sleep(page, 400);
const jt = (await page.locator('.modal .content').textContent()) ?? '';
check('Journal shows the notebook, reflection, memory and activity', /Your field notebook/.test(jt) && /yellow tips/.test(jt) && /Chapter reflection/.test(jt) && /Memories from Carver/.test(jt) && /Nature Observation Card/.test(jt));
await page.getByRole('heading', { name: /Your field notebook/ }).scrollIntoViewIfNeeded();
await sleep(page, 200);
await page.screenshot({ path: `${OUT}/07-journal-notebook.png` });
await page.getByRole('button', { name: 'Open the printable card' }).click();
await sleep(page, 300);
check('Printable Nature Observation Card opens', await page.locator('.print-card').isVisible());
await page.screenshot({ path: `${OUT}/08-activity-card.png` });
await closeModal(page);
await page.getByRole('tab', { name: /Map/ }).click();
await sleep(page, 200);
check('Chapter map shows Chapter 2 as unlocked', /Unlocked · arrives in the next update/.test((await page.locator('.modal .content').textContent()) ?? ''));
await closeModal(page);

// --- Replay: card game again, no duplicate rewards ---
await walkPath(page, [[19.5, 9.6], [9.5, 9.6]]);
await page.keyboard.press('e');
await page.locator('.sort-modal').waitFor({ timeout: 3000 });
await placeRight(8);
await closeModal(page);
await walkPath(page, [[19.5, 9.6], [19.5, 7.5], [20.3, 7.5]]);
await tapKey(page, 'ArrowRight', 30);
await talk(page);
check("Carver's after-chapter talk", /Nature Observation Card is in your bag/.test(await dialogueText(page)) || (await advanceUntil(page, /in your bag/)));
await finishDialogue(page);
s = await state(page);
check('Replaying gives no duplicate rewards', s.xp === 210 && s.seeds === 33, `xp ${s.xp}, seeds ${s.seeds}`);
await page.reload();
await sleep(page, 900);
await page.getByRole('button', { name: 'Continue' }).click();
await sleep(page, 600);
s = await state(page);
check('Chapter completion survives reload', s.ch1.stage === 'complete' && s.ch1Data.observations.length >= 3 && s.xp === 210);
await ctx.close();

// =====================================================================
// Narrow phone, 390x844, touch
// =====================================================================
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await phone.newPage();
watch(p2, 'narrow');
const mid = JSON.parse(JSON.stringify(PHASE0_SAVE));
mid.version = 2;
mid.world = { scene: 'hub', x: 11.8, y: 6.2, facing: 'up' };
mid.progress.chapters.ch1 = { stage: 'active', stepsDone: ['get_notebook', 'get_lens'], flags: [], rewarded: false };
mid.progress.inventory.push(
  { itemId: 'field_notebook', from: 'hattie', obtainedAt: 2, used: false, inspected: true },
  { itemId: 'magnifying_lens', from: 'theo', obtainedAt: 3, used: false, inspected: true },
);
mid.chapterData = {};
mid.memories = ['childhood'];
await openWithSave(p2, mid);
await p2.screenshot({ path: `${OUT}/09-narrow-garden.png` });
check('No clipped or off-screen UI at 390x844 (garden)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
await p2.locator('.touch-act').tap();
await p2.locator('.inspect-modal').waitFor({ timeout: 3000 });
await p2.getByRole('button', { name: 'Look at the tips of the carrot leaves' }).tap();
await sleep(p2, 300);
await p2.screenshot({ path: `${OUT}/10-narrow-inspection.png` });
check('Inspection works with touch on a phone', /yellow and crispy/.test((await p2.locator('.lens-text').textContent()) ?? ''));
await closeModal(p2);
await phone.close();

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();
const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, passed, total: results.length, results, consoleErrors }, null, 2));
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
