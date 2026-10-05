// Browser check for Math Adventure Island: plays a new game from the title
// screen through all four zones (torches), a whole treasure hunt (with a wrong
// dig), and the Quiz Show to the finale, with real clicks, walking and keys.
// Then saving, the grown-ups report and the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-math-adventure-island.mjs [url]
//
// Writes test-output/mai-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/math-adventure-island/index.html';
const OUT = 'test-output/mai-e2e';
mkdirSync(OUT, { recursive: true });
const results = [];
const errors = [];
const offsite = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...opts });
  const page = await ctx.newPage();
  const origin = new globalThis.URL(URL).origin;
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (!r.url().startsWith(origin) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) offsite.push(r.url());
  });
  return { ctx, page };
}
const st = (page) => page.evaluate(() => window.__mai.state());
const wait = (page, ms) => page.waitForTimeout(ms);
/** Click through the talk box; for a question or offer, pick the first option still enabled. */
async function talkThrough(page, pick = 0) {
  for (let i = 0; i < 60 && (await page.locator('.dialogue').count()); i++) {
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) await opt.nth(Math.min(pick, (await opt.count()) - 1)).click();
    else await page.keyboard.press('Space');
    await wait(page, 160);
  }
  await wait(page, 250);
}
async function waitFor(page, fn, tries = 80) {
  for (let i = 0; i < tries; i++) {
    if (await fn()) return true;
    await wait(page, 100);
  }
  return false;
}
/** Tap a person on screen (walking there with the arrow keys first if needed). */
async function tapTarget(page, id) {
  for (let i = 0; i < 16; i++) {
    const pt = await page.evaluate((d) => window.__mai.screenOf(d), id);
    if (pt.visible && pt.y > 90 && pt.y < 600 && pt.x > 60 && pt.x < 1220) {
      await page.mouse.click(pt.x, pt.y - 20);
      return;
    }
    const key = pt.y > 360 ? 'ArrowDown' : pt.y < 90 ? 'ArrowUp' : pt.x < 640 ? 'ArrowLeft' : 'ArrowRight';
    await page.keyboard.down(key);
    await wait(page, 300);
    await page.keyboard.up(key);
  }
  throw new Error(`could not reach ${id}`);
}
/** Press the number key of the right answer for the current step. */
async function pickRight(page) {
  const s = await st(page);
  const vals = await page.locator('.mai-step .mai-choice').evaluateAll((bs) => bs.map((b) => b.dataset.value));
  await page.keyboard.press(String(vals.indexOf(s.panel.right) + 1));
  await wait(page, 300);
}
async function solveProblem(page) {
  for (let k = 0; k < 3; k++) await pickRight(page);
}
/** Keep solving until the panel closes (the zone is done). */
async function finishZone(page, zone) {
  for (let i = 0; i < 14; i++) {
    const s = await st(page);
    if (!s.panel) break;
    await solveProblem(page);
    await page.keyboard.press('Space');
    await wait(page, 400);
  }
  await talkThrough(page);
  return (await st(page)).lit.includes(zone);
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1500);
  check('title screen shows', await page.getByText('Math Adventure Island').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  check('character creator opens', await page.getByRole('button', { name: /i'm ready/i }).isVisible());
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await wait(page, 800);
  check('Captain Zuri opens the game', (await page.locator('.dialogue').textContent()).includes('Captain Zuri'));
  await talkThrough(page);
  let s = await st(page);
  check('the island is playable after the opening', s.mode === 'world');
  await page.screenshot({ path: `${OUT}/01-island.png` });

  // the stage is dark until the torches are lit
  await tapTarget(page, 'stage');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 60);
  check('the Quiz Show stage is locked at first', (await page.locator('.dialogue').textContent()).includes('more torch'));
  await talkThrough(page);

  // Mo at the Shell Hut, reached with a real click
  await tapTarget(page, 'add');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 80);
  check('Mo explains the Shell Hut', (await page.locator('.dialogue').textContent()).includes('shell'));
  await talkThrough(page);
  s = await st(page);
  check('the Shell Hut panel opens at step 1', s.panel && s.panel.zone === 'add' && s.panel.step === 0);
  // step 1 right, then the wrong operation at step 2
  await pickRight(page);
  s = await st(page);
  const p = s.panel.problem;
  const wrongOp = ['+', '−', '×', '÷'].find((o) => o !== p.op);
  await page.locator(`.mai-step .mai-choice[data-value="${wrongOp}"]`).click();
  await wait(page, 300);
  check('a wrong operation gets a reason', await page.locator('.mai-feedback.try').isVisible(), (await page.locator('.mai-feedback').textContent()).slice(0, 80));
  await page.keyboard.press('h');
  await wait(page, 150);
  await page.keyboard.press('h');
  await wait(page, 250);
  check('hint 2 shows the picture', await page.locator('.mai-picture:not([hidden]) .mai-model').isVisible());
  await page.screenshot({ path: `${OUT}/02-shell-hut-hint.png` });
  await pickRight(page);
  await pickRight(page);
  s = await st(page);
  check('the problem is solved, but no star after a slip', s.panel.complete && s.stars.add === 0);
  await page.keyboard.press('Space');
  await wait(page, 400);
  await solveProblem(page);
  s = await st(page);
  check('a clean solve wins a star', s.stars.add === 1);
  await page.keyboard.press('Space');
  await wait(page, 400);
  check('the Shell Hut torch is lit', await finishZone(page, 'add'));
  await page.screenshot({ path: `${OUT}/03-first-torch.png` });

  for (const zone of ['sub', 'mul', 'div']) {
    await page.evaluate((z) => window.__mai.open(z), zone);
    await wait(page, 500);
    await talkThrough(page);
    check(`the ${zone} torch is lit`, await finishZone(page, zone));
  }
  s = await st(page);
  check('all four torches are lit', s.lit.length === 4);

  // the treasure hunt with Pip
  await tapTarget(page, 'pip');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 80);
  check('Pip offers a treasure hunt', (await page.locator('.dialogue').textContent()).toLowerCase().includes('treasure'));
  await talkThrough(page);
  let wrongDug = false;
  for (let piece = 0; piece < 4; piece++) {
    s = await st(page);
    check(`clue ${piece + 1} opens`, s.panel && s.panel.kind === 'clue');
    if (piece === 0) {
      // Pip's answer: pick the wrong yes/no first
      await pickRight(page);
      await pickRight(page);
      s = await st(page);
      await page.locator(`.mai-step .mai-choice[data-value="${s.panel.right === 'yes' ? 'no' : 'yes'}"]`).click();
      await wait(page, 300);
      check('a wrong reasonableness call explains with the estimate', (await page.locator('.mai-feedback').textContent()).includes(String(s.panel.clue.estimate)));
      await pickRight(page);
    } else await solveProblem(page);
    s = await st(page);
    check(`clue ${piece + 1} sends you to dig`, s.hunt.digging);
    await page.locator('.mai-foot .btn.primary').click();
    await wait(page, 400);
    const target = s.hunt.squares[s.hunt.found];
    if (!wrongDug) {
      // dig one square off first
      const off = { col: (target.col + 1) % 5, row: target.row };
      const c = await page.evaluate(([a, b]) => window.__mai.squareCenter(a, b), [off.col, off.row]);
      await page.evaluate(([x, y]) => window.__mai.teleport(x, y), [c.x, c.y]);
      await wait(page, 300);
      await page.keyboard.press('Space');
      await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 40);
      check('digging the wrong square finds only sand', (await page.locator('.dialogue').textContent()).includes('Only sand'));
      await talkThrough(page);
      s = await st(page);
      check('the dig is still waiting after a miss', s.hunt.digging && s.hunt.found === piece);
      wrongDug = true;
    }
    // walk onto the square with a real click on the ground
    const sp = await page.evaluate(([a, b]) => window.__mai.squareScreen(a, b), [target.col, target.row]);
    await page.mouse.click(sp.x, sp.y);
    const arrived = await waitFor(page, async () => {
      const q = (await st(page)).square;
      return q && q.col === target.col && q.row === target.row;
    }, 60);
    check(`walked onto square ${piece + 1}`, arrived);
    if (!arrived) {
      const c = await page.evaluate(([a, b]) => window.__mai.squareCenter(a, b), [target.col, target.row]);
      await page.evaluate(([x, y]) => window.__mai.teleport(x, y), [c.x, c.y]);
      await wait(page, 300);
    }
    if (piece === 0) await page.screenshot({ path: `${OUT}/04-dig.png` });
    await page.keyboard.press('Space');
    await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 40);
    s = await st(page);
    check(`map piece ${piece + 1} found`, s.hunt.found === piece + 1);
    // "Next clue!" for the first three, then the chest
    await talkThrough(page, 0);
    await wait(page, 300);
  }
  s = await st(page);
  check('the treasure chest is opened', s.chestOpened);
  await page.screenshot({ path: `${OUT}/05-chest.png` });

  // the quiz show
  await page.evaluate(() => window.__mai.teleport(18, 12.6));
  await wait(page, 300);
  await page.keyboard.press('Space');
  await wait(page, 500);
  check('Captain Zuri introduces the Quiz Show', (await page.locator('.dialogue').textContent()).includes('Quiz Show'));
  await talkThrough(page);
  s = await st(page);
  check('the quiz board opens', s.mode === 'quiz' && (await page.locator('.mai-tile').count()) === 12);
  await page.screenshot({ path: `${OUT}/06-quiz-board.png` });
  let bonuses = 0;
  for (let i = 0; i < 12; i++) {
    await page.locator('.mai-tile:not([disabled])').first().click();
    await wait(page, 250);
    s = await st(page);
    const vals = await page.locator('.mai-question > .mai-choices .mai-choice').evaluateAll((bs) => bs.map((b) => b.dataset.value));
    await page.keyboard.press(String(vals.indexOf(s.quiz.right) + 1));
    await wait(page, 250);
    s = await st(page);
    if (s.quiz.phase === 'bonus') {
      bonuses++;
      const bv = await page.locator('.bonus').evaluateAll((bs) => bs.map((b) => b.dataset.value));
      await page.keyboard.press(String(bv.indexOf(s.quiz.bonusRight) + 1));
      await wait(page, 250);
      if (bonuses === 1) await page.screenshot({ path: `${OUT}/07-quiz-bonus.png` });
    }
    await page.locator('.mai-q-result .btn.primary').click();
    await wait(page, 250);
  }
  s = await st(page);
  check('the board is finished with every bonus', s.quiz.phase === 'over' && bonuses === 4, `bonuses ${bonuses}`);
  check('you beat Pip', s.quiz.you === 2400 + 4 * 50 && s.quiz.pip === 0, `${s.quiz.you} to ${s.quiz.pip}`);
  await page.screenshot({ path: `${OUT}/08-quiz-win.png` });
  await page.getByRole('button', { name: /collect the trophy/i }).click();
  await wait(page, 500);
  check('the finale plays', (await page.locator('.dialogue').textContent()).includes('What a show'));
  await talkThrough(page);
  s = await st(page);
  check('night falls and the trophy is won', s.finaleSeen && s.quizWon && s.night > 0.5);
  await page.screenshot({ path: `${OUT}/09-finale.png` });

  // saving
  await page.reload();
  await wait(page, 1500);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 600);
  s = await st(page);
  check('progress is saved', s.lit.length === 4 && s.chestOpened && s.quizWon && s.finaleSeen);

  // grown-ups report
  await page.keyboard.press('g');
  await wait(page, 400);
  await page.getByRole('tab', { name: /how it is going/i }).or(page.getByRole('button', { name: /how it is going/i })).first().click();
  await wait(page, 300);
  const rows = await page.locator('.progress-table tbody tr').count();
  check('the grown-ups report lists every activity', rows >= 10, `${rows} rows`);
  await page.screenshot({ path: `${OUT}/10-grownups.png` });

  // phone layout
  const { page: ph } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ph.goto(URL);
  await wait(ph, 1300);
  await ph.getByRole('button', { name: /start a new game/i }).tap();
  await wait(ph, 400);
  await ph.getByRole('button', { name: /i'm ready/i }).tap();
  await wait(ph, 800);
  await talkThrough(ph);
  await ph.evaluate(() => window.__mai.open('mul'));
  await wait(ph, 600);
  await talkThrough(ph);
  await pickRight(ph);
  const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
  check('phone: no sideways scrolling', sw <= 390, `scrollWidth ${sw}`);
  const ops = await ph.locator('.mai-step .mai-choice').evaluateAll((bs) => bs.map((b) => b.getBoundingClientRect()).map((r) => ({ l: r.left, r: r.right, b: r.bottom })));
  check('phone: all four operation buttons fit', ops.length === 4 && ops.every((o) => o.l >= 0 && o.r <= 390 && o.b <= 844), JSON.stringify(ops));
  await ph.screenshot({ path: `${OUT}/11-phone-grove.png` });
} catch (e) {
  check('no crash', false, String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
}

check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
check('nothing loaded from other websites', offsite.length === 0, offsite.slice(0, 3).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok);
writeFileSync(`${OUT}/report.json`, JSON.stringify({ results, errors, offsite }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
