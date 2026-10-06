// Browser check for Shape Town Builders: plays a new game from the title
// screen through all four jobs (Kofi's arcade, Lupe's block shop, Mr.
// Haruto's blueprints and Priya's gardens, including a three-step L-shaped
// garden), Chip and a Rush round, then The Big Build and the clubhouse
// opening, with real clicks, walking and keys. Then saving, the grown-ups
// report and the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-geometry-builder-challenge.mjs [url]
//
// Writes test-output/stb-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/geometry-builder-challenge/index.html';
const OUT = 'test-output/stb-e2e';
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
const st = (page) => page.evaluate(() => window.__stb.state());
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
    const pt = await page.evaluate((d) => window.__stb.screenOf(d), id);
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
/** Press the number key of the right bin. */
async function pickRight(page) {
  const s = await st(page);
  const vals = await page.locator('.st-panel .st-choice').evaluateAll((bs) => bs.map((b) => b.dataset.value));
  await page.keyboard.press(String(vals.indexOf(s.panel.right) + 1));
  await wait(page, 300);
}
/** Keep solving until the panel closes (the job is done). */
async function finishJob(page, station) {
  for (let i = 0; i < 40; i++) {
    const s = await st(page);
    if (!s.panel) break;
    await pickRight(page);
    await page.keyboard.press('Space');
    await wait(page, 400);
  }
  await talkThrough(page);
  return (await st(page)).done.includes(station);
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1500);
  check('title screen shows', await page.getByText('Shape Town Builders').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await wait(page, 800);
  check('Master Builder Odette opens the game', (await page.locator('.dialogue').textContent()).includes('Odette'));
  await talkThrough(page);
  let s = await st(page);
  check('the yard is playable after the opening', s.mode === 'world');
  await page.screenshot({ path: `${OUT}/01-yard.png` });

  // Kofi's arcade, reached with a real click
  await tapTarget(page, 'arcade');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 80);
  check('Kofi explains the arcade', (await page.locator('.dialogue').textContent()).includes('belt'));
  await talkThrough(page);
  s = await st(page);
  check('the arcade panel opens with a shape on the belt', s.panel && s.panel.station === 'arcade' && (await page.locator('.st-belt .st-shape').count()) >= 1);
  const wrong = s.panel.problem.choices.find((c) => !c.correct);
  await page.locator(`.st-choice[data-value="${wrong.value}"]`).click();
  await wait(page, 300);
  check('a wrong bin gets a reason', await page.locator('.st-feedback.try').isVisible(), (await page.locator('.st-feedback').textContent()).slice(0, 80));
  await page.keyboard.press('h');
  await wait(page, 150);
  await page.keyboard.press('h');
  await wait(page, 300);
  check('hint 2 is a picture hint', (await page.locator('.st-feedback.hint').textContent()).includes('Hint 2'));
  await page.screenshot({ path: `${OUT}/02-arcade-hint.png` });
  await pickRight(page);
  s = await st(page);
  check('solved, but no star after a slip', s.panel.answered && s.stars.arcade === 0);
  await page.keyboard.press('Space');
  await wait(page, 400);
  await pickRight(page);
  s = await st(page);
  check('a clean sort wins a star', s.stars.arcade === 1);
  await page.keyboard.press('Space');
  await wait(page, 400);
  check('the arcade job delivers the walls', await finishJob(page, 'arcade'));
  await page.screenshot({ path: `${OUT}/03-walls.png` });

  // Lupe's block shop
  await page.evaluate(() => window.__stb.open('blocks'));
  await wait(page, 500);
  check('Lupe explains the block shop', (await page.locator('.dialogue').textContent()).toLowerCase().includes('solid'));
  await talkThrough(page);
  check('the block shop shows a block on the counter', (await page.locator('.st-counter img').count()) === 1);
  check('the block shop job delivers the pillars', await finishJob(page, 'blocks'));
  s = await st(page);
  check('two clubhouse parts are built', s.done.length === 2);

  // Mr. Haruto's Blueprint Workshop, reached with a real click
  await tapTarget(page, 'blueprint');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 80);
  check('Mr. Haruto explains blueprints', (await page.locator('.dialogue').textContent()).toLowerCase().includes('blueprint'));
  await talkThrough(page);
  s = await st(page);
  check('the workshop shows a blueprint', s.panel && s.panel.station === 'blueprint' && (await page.locator('.st-paper img').count()) === 1);
  const bw = s.panel.problem.choices.find((c) => !c.correct);
  await page.locator(`.st-choice[data-value="${bw.value}"]`).click();
  await wait(page, 300);
  check('a wrong blueprint count gets a reason', await page.locator('.st-feedback.try').isVisible(), (await page.locator('.st-feedback').textContent()).slice(0, 80));
  await pickRight(page);
  await page.keyboard.press('Space');
  await wait(page, 400);
  check('the workshop job delivers the roof and windows', await finishJob(page, 'blueprint'));

  // Priya's Garden Yard at the top level: find an L-shaped garden (three steps)
  await page.evaluate(() => window.__stb.setTier('garden', 3));
  let gotL = false;
  for (let i = 0; i < 15 && !gotL; i++) {
    await page.evaluate(() => window.__stb.open('garden'));
    await wait(page, 450);
    await talkThrough(page);
    s = await st(page);
    gotL = s.panel && s.panel.steps === 3;
    if (!gotL) {
      await page.keyboard.press('Escape');
      await wait(page, 250);
      await page.evaluate(() => window.__stb.setTier('garden', 3));
    }
  }
  check('Priya gives an L-shaped garden in three steps', gotL);
  check('step 1 of 3 is shown', (await page.locator('.st-prompt').textContent()).startsWith('Step 1 of 3'));
  await page.screenshot({ path: `${OUT}/04-garden-L.png` });
  await pickRight(page);
  check('a right step leads to the next step, not a star yet', (await st(page)).stars.garden === 0 && (await page.locator('.st-panel .st-foot .btn.primary').textContent()).includes('Next step'));
  await page.keyboard.press('Space');
  await wait(page, 350);
  s = await st(page);
  check('step 2 of 3 follows', s.panel.step === 1 && (await page.locator('.st-prompt').textContent()).startsWith('Step 2 of 3'));
  await pickRight(page);
  await page.keyboard.press('Space');
  await wait(page, 350);
  await pickRight(page);
  s = await st(page);
  check('three clean steps win one star', s.stars.garden === 1);
  await page.keyboard.press('Space');
  await wait(page, 400);
  check('the garden job delivers the garden and fence', await finishJob(page, 'garden'));
  s = await st(page);
  check('all four clubhouse parts are built', s.done.length === 4);

  // Chip and a Rush round
  await page.evaluate(() => window.__stb.teleport(15.5, 15.5));
  await wait(page, 400);
  await page.keyboard.press('Space');
  await wait(page, 500);
  // Chip introduces himself the first time, then offers the race
  let offered = false;
  for (let i = 0; i < 8 && !offered; i++) {
    offered = (await page.locator('.dialogue').textContent()).includes('Rush mode');
    if (!offered) {
      await page.keyboard.press('Space');
      await wait(page, 250);
    }
  }
  check('Chip offers a Rush race', offered);
  await talkThrough(page, 0);
  await wait(page, 400);
  s = await st(page);
  check('Rush mode opens', s.mode === 'rush');
  await page.getByRole('button', { name: 'Go!' }).click();
  await wait(page, 500);
  for (let i = 0; i < 6; i++) {
    s = await st(page);
    const vals = await page.locator('.st-rush .st-choice').evaluateAll((bs) => bs.map((b) => b.dataset.value));
    await page.keyboard.press(String(vals.indexOf(s.rush.right) + 1));
    await wait(page, 420);
  }
  s = await st(page);
  check('Rush counts sorted shapes', s.rush.score === 6, `score ${s.rush.score}`);
  await page.evaluate(() => window.__stb.endRush());
  await wait(page, 500);
  check('Rush ends with a result', await page.locator('.st-result-line').isVisible(), await page.locator('.st-result-line').textContent());
  await page.screenshot({ path: `${OUT}/04-rush.png` });
  await page.getByRole('button', { name: 'Done' }).click();
  await wait(page, 300);
  s = await st(page);
  check('the Rush best is saved', s.rushBest === 6);

  // The Big Build: Odette offers it once all four parts are in
  await page.evaluate(() => window.__stb.teleport(20.5, 14.6));
  await wait(page, 400);
  await page.keyboard.press('Space');
  await wait(page, 500);
  check('Odette offers The Big Build', (await page.locator('.dialogue').textContent()).includes('Big Build'));
  await talkThrough(page, 0);
  s = await st(page);
  check('The Big Build opens with piece 1 from the arcade', s.panel && s.panel.finale === 0 && s.panel.station === 'arcade');
  const order = [];
  for (let i = 0; i < 40; i++) {
    s = await st(page);
    if (!s.panel) break;
    if (!order.includes(s.panel.station)) order.push(s.panel.station);
    await pickRight(page);
    await page.keyboard.press('Space');
    await wait(page, 400);
  }
  check('one piece from every job, in order', order.join() === 'arcade,blocks,blueprint,garden', order.join());
  // the opening: talk, the sun sets, then more talk
  await waitFor(
    page,
    async () => {
      if (await page.locator('.dialogue').count()) await page.keyboard.press('Space');
      return (await st(page)).finaleSeen && (await st(page)).mode === 'world';
    },
    150,
  );
  s = await st(page);
  check('the clubhouse opens at sunset', s.finaleSeen && s.night > 0.5, `night ${s.night}`);
  await page.screenshot({ path: `${OUT}/05-opened.png` });

  // saving
  await page.reload();
  await wait(page, 1500);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 600);
  s = await st(page);
  check('progress is saved', s.done.length === 4 && s.rushBest === 6 && s.finaleSeen && s.night > 0.5);

  // grown-ups report
  await page.keyboard.press('g');
  await wait(page, 400);
  await page.getByRole('tab', { name: /how it is going/i }).or(page.getByRole('button', { name: /how it is going/i })).first().click();
  await wait(page, 300);
  const rows = await page.locator('.progress-table tbody tr').count();
  check('the grown-ups report lists all four jobs', rows === 4, `${rows} rows`);

  // phone layout
  const { page: ph } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ph.goto(URL);
  await wait(ph, 1300);
  await ph.getByRole('button', { name: /start a new game/i }).tap();
  await wait(ph, 400);
  await ph.getByRole('button', { name: /i'm ready/i }).tap();
  await wait(ph, 800);
  await talkThrough(ph);
  for (const station of ['arcade', 'blocks', 'blueprint', 'garden']) {
    await ph.evaluate((x) => window.__stb.open(x), station);
    await wait(ph, 600);
    await talkThrough(ph);
    const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
    check(`phone ${station}: no sideways scrolling`, sw <= 390, `scrollWidth ${sw}`);
    const boxes = await ph.locator('.st-panel .st-choice').evaluateAll((bs) => bs.map((b) => b.getBoundingClientRect()).map((r) => ({ l: r.left, r: r.right, b: r.bottom })));
    check(`phone ${station}: every bin fits on screen`, boxes.length >= 2 && boxes.every((o) => o.l >= 0 && o.r <= 390 && o.b <= 844), JSON.stringify(boxes));
    await ph.screenshot({ path: `${OUT}/06-phone-${station}.png` });
    await ph.keyboard.press('Escape');
    await wait(ph, 300);
  }
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
