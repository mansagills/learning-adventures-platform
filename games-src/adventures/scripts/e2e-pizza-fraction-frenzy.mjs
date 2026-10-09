// Browser check for Forum Fraction Feast (half 1): plays a new game from the
// title screen through the bakery and the milestone road with real clicks and
// keys, then Anser, the grown-ups report, saving and the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-pizza-fraction-frenzy.mjs [url]
//
// Writes test-output/fff-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/pizza-fraction-frenzy/index.html';
const OUT = 'test-output/fff-e2e';
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
const st = (page) => page.evaluate(() => window.__fff.state());
const wait = (page, ms) => page.waitForTimeout(ms);
/** Click through the talk box; for a question, pick the first option still enabled. */
async function talkThrough(page) {
  for (let i = 0; i < 60 && (await page.locator('.dialogue').count()); i++) {
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) await opt.first().click();
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
async function tapPerson(page, id) {
  for (let i = 0; i < 16; i++) {
    const pt = await page.evaluate((d) => window.__fff.screenOf(d), id);
    if (pt.visible && pt.y > 120 && pt.y < 600 && pt.x > 60 && pt.x < 1220) {
      await page.mouse.click(pt.x, pt.y - 24);
      return;
    }
    const key = pt.y > 360 ? 'ArrowDown' : 'ArrowUp';
    await page.keyboard.down(key);
    await wait(page, 300);
    await page.keyboard.up(key);
  }
  throw new Error(`could not reach ${id}`);
}
/** Answer the open question correctly: click the right post on the road, or press the right number key. */
async function solve(page) {
  const s = await st(page);
  if (s.panel.kind === 'place') await page.locator(`.fff-post[data-value="${s.panel.right}"]`).click();
  else await page.keyboard.press(String(s.panel.rightIndex + 1));
}
/** Play a job until its debrief starts. */
async function playJob(page, id) {
  let partySeen = false;
  let guard = 0;
  while (guard++ < 60) {
    let s = await st(page);
    if (!s.panel) break;
    if (s.panel.problem.text) partySeen = true;
    if (!s.panel.answered) {
      await solve(page);
      await wait(page, 200);
    }
    s = await st(page);
    if (!s.panel) break;
    if (!s.panel.answered) {
      await page.keyboard.press('h');
      await wait(page, 100);
      continue;
    }
    await page.keyboard.press('Space');
    await wait(page, 300);
    if (await page.locator('.dialogue').count()) break;
  }
  await waitFor(page, async () => page.locator('.dialogue').count());
  // "Five stars! Before you go, one question." then the question itself
  for (let i = 0; i < 10 && !(await page.locator('.dialogue .choices button').count()); i++) {
    await page.keyboard.press('Space');
    await wait(page, 250);
  }
  return { partySeen, rounds: guard };
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1600);
  check('title screen shows', await page.getByText('Forum Fraction Feast').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  check('character creator opens', await page.getByRole('button', { name: /i'm ready/i }).isVisible());
  const cv = await page.locator('.customize .preview canvas').evaluate((c) => [c.width, c.height]);
  check('the preview is a 16-bit character (24x36)', cv[0] === 24 && cv[1] === 36, cv.join('x'));
  check('only the hair styles the 16-bit world can draw are offered', (await page.locator('[aria-labelledby="leg-hairStyle"] button').count()) === 3);
  await page.getByRole('radio', { name: 'Boy' }).click();
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => page.locator('.dialogue').count());
  check('Baker Livia opens the story', (await page.locator('.dialogue').textContent())?.includes('Livia'));
  await page.screenshot({ path: `${OUT}/01-opening.png` });
  await talkThrough(page);
  let s = await st(page);
  check('the forum is ready to walk, no braziers lit', s.mode === 'world' && s.done.length === 0 && s.lit === 0);
  const p0 = s.player;
  await page.keyboard.down('ArrowLeft');
  await wait(page, 400);
  await page.keyboard.up('ArrowLeft');
  s = await st(page);
  check('arrow keys walk', s.player.x < p0.x - 0.5, `x ${p0.x.toFixed(1)} -> ${s.player.x.toFixed(1)}`);

  // the bakery, reached by clicking Livia
  await tapPerson(page, 'bakery');
  const opened = await waitFor(page, async () => (await page.locator('.dialogue').count()) || (await page.locator('.fff-panel').count()), 120);
  check('clicking Livia walks there and talks', opened);
  await talkThrough(page);
  check('the bakery opens', await page.locator('.fff-panel').count());
  s = await st(page);
  const wrong = s.panel.wrong[0];
  await page.locator(`[data-value="${wrong.value}"]`).click();
  await wait(page, 200);
  check('a wrong answer explains the mistake', (await page.locator('.fff-feedback.try').count()) === 1, (await page.locator('.fff-feedback').textContent())?.slice(0, 80));
  check('the wrong choice is crossed out', await page.locator('.fff-choice.nope').count());
  const before = await page.locator('.fff-body img').first().getAttribute('src');
  await page.keyboard.press('h');
  await page.keyboard.press('h');
  await wait(page, 250);
  s = await st(page);
  const after = await page.locator('.fff-body img').first().getAttribute('src');
  check('hint 2 changes the picture (or explains the fair cut)', s.panel.hintRung === 2 && (after !== before || s.panel.kind === 'fair'), s.panel.kind);
  await page.screenshot({ path: `${OUT}/02-bakery-hint.png` });
  await page.keyboard.press('h');
  await wait(page, 150);
  check('hint 3 outlines the answer', await page.locator('.worked').count());
  await solve(page);
  await wait(page, 200);
  s = await st(page);
  check('a slip costs the star', s.panel.answered && s.stars.bakery === 0);
  await page.keyboard.press('Space');
  await wait(page, 300);
  await solve(page);
  await wait(page, 200);
  s = await st(page);
  check('a clean answer wins a star', s.stars.bakery === 1);
  await page.keyboard.press('Space');
  await wait(page, 300);
  const bake = await playJob(page, 'bakery');
  check('the Fraction Pizza Party problems are asked at level 2', bake.partySeen, `party ${(await st(page)).party}`);
  check('Livia asks the debrief question', (await page.locator('.dialogue').textContent())?.includes('fourth'));
  await page.screenshot({ path: `${OUT}/03-debrief.png` });
  await talkThrough(page);
  s = await st(page);
  check('the bakery is done and its brazier is lit', s.done.includes('bakery') && s.lit === 1 && s.stars.bakery >= 5, JSON.stringify(s.stars));

  // the milestone road, reached by clicking Marcus
  await tapPerson(page, 'road');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) || (await page.locator('.fff-panel').count()), 140);
  await talkThrough(page);
  check('the milestone road opens', await page.locator('.fff-road').count());
  // make sure a "place the flag" question gets a wrong post first
  for (let i = 0; i < 8; i++) {
    s = await st(page);
    if (s.panel.kind === 'place') break;
    await solve(page);
    await wait(page, 150);
    await page.keyboard.press('Space');
    await wait(page, 250);
  }
  s = await st(page);
  if (s.panel.kind === 'place') {
    await page.locator(`.fff-post[data-value="${s.panel.wrong[0].value}"]`).click();
    await wait(page, 200);
    check('a wrong post gets a reason', (await page.locator('.fff-feedback.try').count()) === 1, (await page.locator('.fff-feedback').textContent())?.slice(0, 80));
    await page.keyboard.press('h');
    await page.keyboard.press('h');
    await wait(page, 250);
    check('hint 2 colors and numbers the stretches', (await page.locator('.fff-road-count span').count()) > 0);
    await page.screenshot({ path: `${OUT}/04-road-hint.png` });
  } else check('a place-the-flag question came up', false);
  await playJob(page, 'road');
  check('Marcus asks the debrief question', (await page.locator('.dialogue').textContent())?.includes('4/4'));
  await talkThrough(page);
  s = await st(page);
  check('the road is done: two braziers lit', s.done.includes('road') && s.lit === 2);
  check('the day moves toward dusk', s.night > 0.1, `night ${s.night}`);
  await page.screenshot({ path: `${OUT}/05-two-braziers.png` });

  // Anser
  await tapPerson(page, 'anser');
  await waitFor(page, async () => page.locator('.dialogue').count(), 120);
  check('Anser honks hello', /HONK|Anser/.test((await page.locator('.dialogue').textContent()) ?? ''));
  await talkThrough(page);

  // grown-ups report (G)
  await page.keyboard.press('g');
  await wait(page, 400);
  const report = (await page.locator('.modal').last().textContent()) ?? '';
  check('grown-ups page lists the jobs and standards', report.includes('The Bakery') && report.includes('3.NF.2'), report.slice(0, 80));
  await page.getByRole('tab', { name: /credits/i }).click();
  await wait(page, 200);
  const credits = (await page.locator('.modal').last().textContent()) ?? '';
  check('grown-ups credits name the original games and the sources', credits.includes('Fraction Pizza Party') && credits.includes('British Museum'));
  const tab = page.getByRole('tab', { name: /how it is going/i });
  if (await tab.count()) {
    await tab.click();
    await wait(page, 200);
    check('the progress table has a row per job', (await page.locator('.progress-table tbody tr').count()) === 2);
  }
  await page.screenshot({ path: `${OUT}/06-grownups.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // reload: progress is kept
  await page.reload();
  await wait(page, 1300);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 500);
  s = await st(page);
  check('saved game continues with both braziers lit', s.done.length === 2 && s.lit === 2);

  // phone layout
  const { page: ph } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ph.goto(URL);
  await wait(ph, 1300);
  await ph.getByRole('button', { name: /start a new game/i }).tap();
  await wait(ph, 400);
  await ph.getByRole('button', { name: /i'm ready/i }).tap();
  await wait(ph, 800);
  await talkThrough(ph);
  await ph.screenshot({ path: `${OUT}/07-phone-forum.png` });
  await ph.evaluate(() => window.__fff.setTier('road', 3));
  await ph.evaluate(() => window.__fff.open('road'));
  await wait(ph, 600);
  await talkThrough(ph);
  const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
  check('phone: no sideways scrolling', sw <= 390, `scrollWidth ${sw}`);
  const road = await ph.locator('div.fff-road').boundingBox();
  check('phone: the whole road fits', road && road.x >= 0 && road.x + road.width <= 390, JSON.stringify(road));
  const hint = await ph.getByRole('button', { name: /hint/i }).boundingBox();
  check('phone: the Hint button is on screen', hint && hint.y + hint.height <= 844, JSON.stringify(hint));
  await ph.screenshot({ path: `${OUT}/08-phone-road.png` });
  await ph.keyboard.press('Escape');
  await wait(ph, 300);
  await ph.evaluate(() => window.__fff.setTier('bakery', 1));
  for (let i = 0; i < 6; i++) {
    await ph.evaluate(() => window.__fff.open('bakery'));
    await wait(ph, 500);
    await talkThrough(ph);
    if ((await st(ph)).panel?.kind === 'fair') break;
    await ph.keyboard.press('Escape');
    await wait(ph, 300);
  }
  if ((await st(ph)).panel?.kind === 'fair') {
    const pics = await ph.locator('.fff-choice.picture').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().right));
    check('phone: the three loaf pictures fit side by side', pics.length === 3 && Math.max(...pics) <= 390, pics.join(','));
    await ph.screenshot({ path: `${OUT}/09-phone-fair.png` });
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
