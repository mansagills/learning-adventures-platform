// Phase 2 check-in test: Chapter 2 "Science Against the Odds / Choose the Path".
// Starts from a real Phase 1 save (Chapter 1 complete), plays the chapter with
// real keyboard and mouse input, checks each acceptance criterion and captures
// the check-in screenshots.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/e2e-phase2.mjs [baseUrl]
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
const OUT = 'test-output/phase2';
mkdirSync(OUT, { recursive: true });
const browser = await launch();

// A save exactly as Phase 1 wrote it: Chapter 1 complete, Chapter 2 'locked'
// (it was not built yet), player by Carver.
const PHASE1_SAVE = {
  version: 2,
  createdAt: 1,
  savedAt: 1,
  customized: true,
  appearance: { skin: 'skin5', hairStyle: 'locs', hairColor: 'darkbrown', outfit: 'purple', accessory: 'headband' },
  world: { scene: 'hub', x: 19.5, y: 9.6, facing: 'up' },
  time: { minutes: 10 * 60, day: 3, paused: true },
  progress: {
    xp: 210,
    seeds: 33,
    chapters: {
      practice: { stage: 'complete', stepsDone: ['get_seeds'], flags: [], rewarded: true },
      ch1: { stage: 'complete', stepsDone: ['get_notebook', 'get_lens', 'observe_sort'], flags: [], rewarded: true },
      ch2: { stage: 'locked', stepsDone: [], flags: [], rewarded: false },
    },
    inventory: [
      { itemId: 'seed_packet', from: 'mae', obtainedAt: 1, used: true, usedIn: 'Given to Carver to plant', inspected: true },
      { itemId: 'field_notebook', from: 'hattie', obtainedAt: 2, used: true, usedIn: 'x', inspected: true },
      { itemId: 'magnifying_lens', from: 'theo', obtainedAt: 3, used: true, usedIn: 'x', inspected: true },
      { itemId: 'nature_card', from: 'carver', obtainedAt: 4, used: false, inspected: true },
    ],
  },
  learner: {},
  log: [],
  tips: ['move', 'findCarver', 'talk', 'journal', 'bag', 'rest'],
  chapterData: { ch1: { observations: [{ spot: 'carrots', text: 'The carrot leaves have yellow tips.' }] } },
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

async function toCarver(page) {
  const { player } = await state(page);
  if (Math.abs(player.y - 9.6) > 0.3) await walkPath(page, [[player.x, 9.6]]);
  await walkPath(page, [[19.5, 9.6], [19.5, 7.5], [20.3, 7.5]]);
  await tapKey(page, 'ArrowRight', 30);
}

async function closeModal(page) {
  await page.keyboard.press('Escape');
  await sleep(page, 300);
}

/** Walk inside the schoolhouse along the free aisles (rows 3, 5, 7 and columns 2, 7, 11/12). */
async function schoolTo(page, x, y) {
  const s = await state(page);
  const side = (v) => (v < 7 ? 2.4 : v > 7 ? 11.6 : 7);
  if (Math.abs(s.player.x - x) > 0.3) {
    await walkPath(page, [[side(s.player.x), 5.5], [7, 5.5], [side(x), 5.5]]);
  }
  await walkPath(page, [[x, y]]);
}

async function openDisplay(page) {
  await page.keyboard.press('e');
  await page.locator('.display-modal').waitFor({ timeout: 3000 });
  await sleep(page, 200);
}

/** Wait (without pressing anything) for the dialogue text to match. */
async function sees(page, re) {
  for (let i = 0; i < 30; i++) {
    if (re.test(await dialogueText(page))) return true;
    await sleep(page, 100);
  }
  return false;
}

const sensitiveVisible = (page) => page.locator('.dialogue .sensitive-note:not([hidden])').isVisible();

// =====================================================================
// Desktop, 1280x720
// =====================================================================
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
watch(page, 'desktop');
await openWithSave(page, PHASE1_SAVE);
let s = await state(page);
check('A Phase 1 save loads; Chapter 2 opens and Carver offers it', s.chapters.ch2 === 'available' && /Carver/.test(s.objective), s.objective);

// --- Carver assigns, with a sensitive part the player can skip (read it here) ---
await toCarver(page);
await talk(page);
check('Carver opens Chapter 2 about his school years', (await sees(page, /Last time I told you/)));
await advanceUntil(page, /school in Diamond/);
check('The line about racism carries a skip note and button', (await sensitiveVisible(page)) && (await page.getByRole('button', { name: 'Skip this part' }).isVisible()));
check('Carver names racism plainly and says it was not his fault', (await sees(page, /racism/)) && (await sees(page, /not my fault/)));
await page.screenshot({ path: `${OUT}/01-carver-assignment.png` });
await clickChoice(page, /not fair/);
check('Choice "That\'s not fair!" gets its own answer', (await sees(page, /You're right, it was not fair/)));
check('The skip note goes away on ordinary lines', !(await sensitiveVisible(page)));
await advanceUntil(page, /Put my journey in order/);
await finishDialogue(page);
s = await state(page);
check('Quest accepted; next task is Ms. Nelson', s.ch2.stage === 'active' && /Nelson/.test(s.objective), s.objective);

// --- Ada gives the botanical sketch (both her branches are checked on the phone below) ---
await walkPath(page, [[19.5, 9.6], [15.5, 9.6], [15.5, 11.3]]);
await tapKey(page, 'ArrowDown', 30);
s = await state(page);
check('Ada is reachable in the town square', /Ada/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /painter before he was a scientist/);
await clickChoice(page, /Tell me more/);
check('Ada tells the Etta Budd story', (await sees(page, /Etta Budd/)));
await advanceUntil(page, /take my leaf sketch/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/02-ada-gives-sketch.png` });
await finishDialogue(page);
s = await state(page);
check('Ada grants the botanical sketch', s.inventory.some((e) => e.itemId === 'botanical_sketch' && e.from === 'ada'));

// --- Carver's waiting talk: the nudge follows what is missing; skip a sensitive answer ---
await toCarver(page);
await talk(page);
check("Carver's nudge points to Ms. Nelson", (await sees(page, /Ms. Nelson is by the schoolhouse door/)), (await dialogueText(page)).slice(0, 80));
await clickChoice(page, /Why was the school rule unfair/);
check('A follow-up about racism is marked and skippable', await sensitiveVisible(page));
await page.getByRole('button', { name: 'Skip this part' }).click();
await sleep(page, 300);
check('Skipping ends that part safely', !(await page.locator('.dialogue').count()));

// --- Ms. Nelson gives the school records ---
await walkPath(page, [[19.5, 9.6], [11.5, 9.6], [11.5, 26.55], [5.6, 26.55]]);
await tapKey(page, 'ArrowUp', 30);
s = await state(page);
if (!/Nelson/.test(s.target?.label ?? '')) {
  await tapKey(page, 'ArrowLeft', 30);
  s = await state(page);
}
check('Ms. Nelson is reachable by the schoolhouse', /Nelson/.test(s.target?.label ?? ''), s.target?.label);
await talk(page);
await advanceUntil(page, /folder of copies/);
await clickChoice(page, /What is a record/);
check('Ms. Nelson explains what a record is', (await sees(page, /written down at the time/)));
await advanceUntil(page, /Here is the folder/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/03-teacher-gives-record.png` });
await finishDialogue(page);
s = await state(page);
check('Ms. Nelson grants the school records', s.inventory.some((e) => e.itemId === 'school_record' && e.from === 'ruth'));
check('Next task: the storybook displays (0/6)', /0\/6/.test(s.objective), s.objective);

// --- Into the schoolhouse ---
await walkPath(page, [[6.5, 26.55]]);
await tapKey(page, 'ArrowUp', 30);
await page.keyboard.press('e');
await sleep(page, 1200);
s = await state(page);
check('The schoolhouse door opens into the journey room', s.scene === 'school', s.scene);

// Display 1 (sensitive): skip for now.
await schoolTo(page, 2.5, 3.3);
await openDisplay(page);
check('A display about racism starts with a note and a choice', /A note before you read/.test((await page.locator('.display-modal').textContent()) ?? ''));
await page.getByRole('button', { name: 'Skip for now' }).click();
await sleep(page, 400);
s = await state(page);
check('Skipping a display still counts as a visit', s.ch2Data.visited.includes('reading') && s.ch2Data.skipped.includes('reading'));
await page.screenshot({ path: `${OUT}/04-journey-scene.png` });

// Display 2: Neosho.
await schoolTo(page, 11.5, 3.3);
await openDisplay(page);
const neo = (await page.locator('.display-modal').textContent()) ?? '';
check('Displays show the story, the clue and a history label', /Mariah Watkins/.test(neo) && /after he learned to read/.test(neo) && /A memory from Carver's life/.test(neo));
await page.getByRole('button', { name: 'Back to the schoolhouse' }).click();
await sleep(page, 300);
// Display 4 (sensitive): read it.
await schoolTo(page, 11.7, 4.5);
await openDisplay(page);
await page.getByRole('button', { name: 'Read this display' }).click();
await sleep(page, 300);
const hl = (await page.locator('.display-modal').textContent()) ?? '';
check('Reading the Highland display: racism named, record date shown', /That was racism, and it was wrong/.test(hl) && /about 1885/.test(hl));
await page.screenshot({ path: `${OUT}/05-display-highland.png` });
await closeModal(page);
// Display 6, 5, 3.
await schoolTo(page, 11.7, 6.5);
await openDisplay(page);
await closeModal(page);
await schoolTo(page, 2.3, 6.5);
await openDisplay(page);
check("Ada's sketch adds a clue on the Simpson display", /Ada's sketch/.test((await page.locator('.display-modal').textContent()) ?? ''));
await closeModal(page);
await schoolTo(page, 2.3, 4.5);
await openDisplay(page);
await closeModal(page);
s = await state(page);
check('All six displays visited', s.ch2Data.visited.length === 6, JSON.stringify(s.ch2Data.visited));
check('Next task: build the timeline', /chalkboard/.test(s.objective), s.objective);

// Come back to the skipped display: it offers the note again, and can be read now.
await schoolTo(page, 2.5, 3.3);
await openDisplay(page);
check('A skipped display remembers it was skipped', /You skipped this display earlier/.test((await page.locator('.display-modal').textContent()) ?? ''));
await page.getByRole('button', { name: 'Read this display' }).click();
await sleep(page, 200);
await closeModal(page);
s = await state(page);
check('Reading it later clears the "skipped" mark', !s.ch2Data.skipped.includes('reading'));

// --- The timeline at the chalkboard ---
await schoolTo(page, 7, 3.8);
await tapKey(page, 'ArrowUp', 30);
await page.keyboard.press('e');
await page.locator('.timeline-modal').waitFor({ timeout: 3000 });
check('The timeline shows six cards plus the fixed Tuskegee ending', (await page.locator('.timeline-card[data-stage]').count()) === 6 && /Tuskegee/.test((await page.locator('.timeline-card.finale').textContent()) ?? ''));
await page.getByRole('button', { name: 'Check my order' }).click();
await sleep(page, 300);
let fb = (await page.locator('.timeline-modal .feedback').textContent()) ?? '';
check('Hint 1: how many are right, and start with the dated cards', /of 6 cards are in the right place/.test(fb) && /dates/.test(fb), fb.slice(0, 90));
await page.screenshot({ path: `${OUT}/06-timeline-activity.png` });
await page.getByRole('button', { name: 'Check my order' }).click();
await sleep(page, 300);
fb = (await page.locator('.timeline-modal .feedback').textContent()) ?? '';
check('Hint 2: the first card out of place is moved and locked', /locked/.test(fb) && (await page.locator('.timeline-card.locked').count()) >= 1, fb.slice(0, 90));
const orderBefore = (await state(page)).ch2Data.order.join(',');
const lockedBefore = (await state(page)).ch2Data.locked;

// Reload in the middle of the activity.
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Reload mid-activity: back in the schoolhouse, order and lock kept', s.scene === 'school' && s.ch2Data.order.join(',') === orderBefore && s.ch2Data.locked === lockedBefore, s.scene);
await waitTarget(page, /timeline/);
await page.keyboard.press('e');
await page.locator('.timeline-modal').waitFor({ timeout: 3000 });
await page.getByRole('button', { name: 'Check my order' }).click();
await sleep(page, 300);
check('Hint 3: a worked example shows where every card goes', (await page.locator('.tl-goes').count()) === 6 - (await state(page)).ch2Data.locked || (await page.locator('.tl-goes').count()) > 0);

// Solve it with the Move up buttons (keyboard-free, like a mouse player).
const RIGHT = ['reading', 'neosho', 'kansas', 'highland', 'simpson', 'iowastate'];
for (let i = 0; i < RIGHT.length; i++) {
  for (let guard = 0; guard < 8; guard++) {
    const order = (await state(page)).ch2Data.order;
    if (order.indexOf(RIGHT[i]) <= i) break;
    await page.locator(`.timeline-card[data-stage="${RIGHT[i]}"]`).getByRole('button', { name: /^Move up/ }).click();
    await sleep(page, 80);
  }
}
await page.getByRole('button', { name: 'Check my order' }).click();
await sleep(page, 400);
check('Right order moves on to "What stood in his way?"', /What stood in his way/.test((await page.locator('.timeline-modal h2').textContent()) ?? ''));
const note = (await page.locator('.timeline-modal .content-note').textContent()) ?? '';
check('An age-appropriate note names racism as unjust, never his fault', /racism/.test(note) && /never his fault/.test(note));
await page.locator('.timeline-modal .choices button', { hasText: 'He liked to paint plants' }).click();
await sleep(page, 300);
fb = (await page.locator('.timeline-modal .feedback').textContent()) ?? '';
check('A wrong barrier gets an explanation and is crossed out', /Not quite/.test(fb) && (await page.locator('.timeline-modal .choices button[disabled]').count()) === 1, fb.slice(0, 80));
await page.screenshot({ path: `${OUT}/07-barrier-choice.png` });
await page.locator('.timeline-modal .choices button', { hasText: 'Highland College turned him away' }).click();
await sleep(page, 300);
check('The barrier is named; on to supports', /Who helped him/.test((await page.locator('.timeline-modal h2').textContent()) ?? ''));
await page.locator('.timeline-modal .choices button', { hasText: 'acceptance letter' }).click();
await sleep(page, 300);
check('A wrong support is explained (the letter was not real help)', /barrier, not support/.test((await page.locator('.timeline-modal .feedback').textContent()) ?? ''));
await page.locator('.timeline-modal .choices button', { hasText: 'Mariah Watkins' }).click();
await sleep(page, 400);
check('Finished: the full journey and both picks are shown', /Your journey timeline/.test((await page.locator('.timeline-modal h2').textContent()) ?? '') && /Mariah Watkins/.test((await page.locator('.timeline-modal').textContent()) ?? ''));
await page.getByRole('button', { name: 'Back to the schoolhouse' }).click();
await sleep(page, 400);
s = await state(page);
check('Minigame step completes and both items are marked used', s.ch2.stepsDone.includes('build_timeline') && ['school_record', 'botanical_sketch'].every((id) => s.inventory.find((e) => e.itemId === id)?.used));
check('Next task: return to Carver', /Return to Carver/.test(s.objective), s.objective);

// --- Out of the schoolhouse and back to Carver ---
await schoolTo(page, 7, 7.3);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1200);
s = await state(page);
check('Walking out through the door returns to the town', s.scene === 'hub', s.scene);
await walkPath(page, [[6.5, 26.55], [11.5, 26.55], [11.5, 9.6]]);
await toCarver(page);
await talk(page);
await advanceUntil(page, /You named a barrier/);
const c2 = await dialogueText(page);
check("Carver's reflection uses the barrier the player chose", /Highland College turned me away/.test(c2), c2.slice(0, 90));
check('The barrier reflection is skippable', await sensitiveVisible(page));
await page.keyboard.press('Space');
await advanceUntil(page, /someone who helped/);
const c3 = await dialogueText(page);
check("Carver thanks the helper the player chose (Mariah Watkins)", /Mariah Watkins/.test(c3) && /learn all I could/.test(c3), c3.slice(0, 90));
await page.keyboard.press('Space');
await advanceUntil(page, /Why do you think learning mattered/);
await clickChoice(page, /school was easy/);
const qfb = (await page.locator('.dialogue .feedback').textContent()) ?? '';
check('A wrong answer to the discussion question gets a kind hint', /not easy at all/.test(qfb), qfb.slice(0, 70));
await clickChoice(page, /tools to help farmers/);
await page.keyboard.press('Space');
await advanceUntil(page, /changed your answer/);
check('Carver notices the changed answer', (await sees(page, /changed your answer/)));
await page.keyboard.press('Space');
await advanceUntil(page, /Journey Card/);
await sleep(page, 400);
await page.screenshot({ path: `${OUT}/08-carver-reflection.png` });
await finishDialogue(page);
await sleep(page, 500);
s = await state(page);
check('Chapter 2 complete; Carver gave the Journey Card', s.ch2.stage === 'complete' && s.inventory.some((e) => e.itemId === 'journey_card' && e.from === 'carver'));
check('Rewards: +150 XP and +20 Seeds', s.xp === 210 + 150 && s.seeds === 33 + 20, `xp ${s.xp}, seeds ${s.seeds}`);
check('Chapter 3 opens next, and Carver offers it', s.chapters.ch3 === 'available' && /Carver/.test(s.objective), s.objective);
check('Learner model records the journey objective', !!s.learner.journey && s.learner.journey.correct >= 3, JSON.stringify(s.learner.journey ?? {}));

// --- Journal: timeline, picks, grown-up note, Journey Card, replay ---
await page.keyboard.press('j');
await sleep(page, 400);
const jt = (await page.locator('.modal .content').textContent()) ?? '';
check('Journal shows the journey, picks, grown-up note and activity', /Carver's journey/.test(jt) && /A barrier you named/.test(jt) && /For grown-ups/.test(jt) && /Journey Card/.test(jt));
await page.getByText('For grown-ups: about this chapter').click();
await page.getByRole('heading', { name: /Carver's journey/ }).scrollIntoViewIfNeeded();
await sleep(page, 200);
await page.screenshot({ path: `${OUT}/09-journal-journey.png` });
await page.locator('.activity', { hasText: 'Journey Card' }).getByRole('button', { name: 'Open the printable card' }).click();
await sleep(page, 300);
check('Printable Journey Card opens', /My Learning Journey Card/.test((await page.locator('.print-card').textContent()) ?? ''));
await page.screenshot({ path: `${OUT}/10-journey-card.png` });
await closeModal(page);
await page.getByRole('tab', { name: /Talks/ }).click().catch(() => {});
await sleep(page, 200);
const replayBtn = page.getByRole('button', { name: /Replay: Carver: The road to school/ });
check('The opening talk can be replayed from the journal', (await replayBtn.count()) === 1);
await replayBtn.click();
await sleep(page, 400);
await advanceUntil(page, /school in Diamond/);
check('Replayed sensitive line still offers the skip button', await sensitiveVisible(page));
await page.getByRole('button', { name: 'Skip this part' }).click();
await sleep(page, 200);
check('Skipping in a replay jumps past the hard part', (await sees(page, /school records with dates/)));
await finishDialogue(page);
s = await state(page);
check('Replays never change progress or rewards', s.xp === 360 && s.seeds === 53 && s.ch2.stage === 'complete', `xp ${s.xp}`);

// --- Replay the timeline: no duplicate rewards ---
await walkPath(page, [[19.5, 9.6], [11.5, 9.6], [11.5, 26.55], [6.5, 26.55]]);
await tapKey(page, 'ArrowUp', 30);
await page.keyboard.press('e');
await sleep(page, 1200);
await schoolTo(page, 7, 3.8);
await page.keyboard.press('e');
await page.locator('.timeline-modal').waitFor({ timeout: 3000 });
check('The timeline can be played again after finishing', /Put the journey in order/.test((await page.locator('.timeline-modal h2').textContent()) ?? ''));
await closeModal(page);
await reloadAndContinue(page);
s = await state(page);
check('Chapter completion survives reload, with no duplicate rewards', s.ch2.stage === 'complete' && s.xp === 360 && s.seeds === 53, `xp ${s.xp}`);
await ctx.close();

// =====================================================================
// The other dialogue branches: skip Carver's hard part; "What did you do?"
// =====================================================================
const ctxB = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const pb = await ctxB.newPage();
watch(pb, 'branches');
await openWithSave(pb, PHASE1_SAVE);
await toCarver(pb);
await talk(pb);
await advanceUntil(pb, /school in Diamond/);
await pb.getByRole('button', { name: 'Skip this part' }).click();
await sleep(pb, 300);
check('Skipping Carver\'s hard part jumps to the assignment', (await sees(pb, /Ms. Nelson, the teacher/)), (await dialogueText(pb)).slice(0, 60));
await finishDialogue(pb);
s = await state(pb);
check('The quest is still accepted after skipping', s.ch2.stage === 'active');
await pb.keyboard.press('j');
await sleep(pb, 300);
await pb.getByRole('tab', { name: /Talks/ }).click().catch(() => {});
await sleep(pb, 200);
await pb.getByRole('button', { name: /Replay: Carver: The road to school/ }).click();
await sleep(pb, 300);
await advanceUntil(pb, /school in Diamond/);
await clickChoice(pb, /What did you do/);
check('Choice "What did you do?" gets its own answer', (await sees(pb, /kept looking for a school/)));
await finishDialogue(pb);
// Ada's other branch.
await walkPath(pb, [[19.5, 9.6], [15.5, 9.6], [15.5, 11.3]]);
await tapKey(pb, 'ArrowDown', 30);
await talk(pb);
await advanceUntil(pb, /painter before he was a scientist/);
await clickChoice(pb, /Why are you drawing a leaf/);
check('Ada\'s second branch also explains Etta Budd', (await sees(pb, /look really closely/)) && (await sees(pb, /Etta Budd/)));
await finishDialogue(pb);
// The schoolhouse is open once the chapter starts; the board explains what is missing.
await walkPath(pb, [[15.5, 9.6], [11.5, 9.6], [11.5, 26.55], [6.5, 26.55]]);
await tapKey(pb, 'ArrowUp', 30);
await pb.keyboard.press('e');
await sleep(pb, 1200);
await schoolTo(pb, 7, 3.8);
await pb.keyboard.press('e');
await sleep(pb, 400);
check('The chalkboard says what is still needed (records, displays)', (await sees(pb, /Ms. Nelson's school records/)) && (await sees(pb, /more displays/)), (await dialogueText(pb)).slice(0, 100));
await finishDialogue(pb);
await ctxB.close();

// =====================================================================
// Narrow phone, 390x844, touch
// =====================================================================
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await phone.newPage();
watch(p2, 'narrow');
const mid = JSON.parse(JSON.stringify(PHASE1_SAVE));
mid.world = { scene: 'school', x: 7, y: 3.8, facing: 'up' };
mid.progress.chapters.ch2 = { stage: 'active', stepsDone: ['get_record', 'get_sketch'], flags: [], rewarded: false };
mid.progress.inventory.push(
  { itemId: 'school_record', from: 'ruth', obtainedAt: 5, used: false, inspected: true },
  { itemId: 'botanical_sketch', from: 'ada', obtainedAt: 6, used: false, inspected: true },
);
mid.chapterData.ch2 = { visited: ['reading', 'neosho', 'kansas', 'highland', 'simpson', 'iowastate'], seed: 11 };
await openWithSave(p2, mid);
await p2.screenshot({ path: `${OUT}/11-narrow-schoolhouse.png` });
check('No clipped or off-screen UI at 390x844 (schoolhouse)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
await p2.locator('.touch-act').tap();
await p2.locator('.timeline-modal').waitFor({ timeout: 3000 });
await sleep(p2, 300);
const first = await p2.locator('.timeline-card[data-stage]').nth(1).getAttribute('data-stage');
await p2.locator('.timeline-card[data-stage]').nth(1).getByRole('button', { name: /^Move up/ }).tap();
await sleep(p2, 300);
check('Timeline cards move with touch on a phone', (await state(p2)).ch2Data.order[0] === first);
await p2.screenshot({ path: `${OUT}/12-narrow-timeline.png` });
check('No clipped or off-screen UI at 390x844 (timeline)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
const overflow = await p2.evaluate(() => document.querySelector('.timeline-modal').scrollWidth - document.querySelector('.timeline-modal').clientWidth);
check('The timeline panel has no sideways scrolling on a phone', overflow <= 1, String(overflow));
await closeModal(p2);
await phone.close();

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();
const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, passed, total: results.length, results, consoleErrors }, null, 2));
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
