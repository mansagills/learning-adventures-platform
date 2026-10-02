// Browser check for Counting Carnival: plays a new game from the title screen
// to the night-time finale with real clicks and keys, then checks saving,
// the grown-ups report and the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-counting-carnival.mjs [url]
//
// Writes test-output/cc-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/counting-carnival/index.html';
const OUT = 'test-output/cc-e2e';
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
const st = (page) => page.evaluate(() => window.__cc.state());
const wait = (page, ms) => page.waitForTimeout(ms);
async function talkThrough(page, pick = '1') {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    if (await page.locator('.dialogue .choices button:not([disabled])').count()) await page.keyboard.press(pick);
    else await page.keyboard.press('Space');
    await wait(page, 150);
  }
  await wait(page, 250);
}
/** Walk with the arrow keys until a target is on screen, then tap it. */
async function tapTarget(page, kind, id) {
  for (let i = 0; i < 12; i++) {
    const pt = await page.evaluate(([k, d]) => window.__cc.screenOf(k, d), [kind, id]);
    if (pt.visible && pt.y > 80 && pt.y < 640) {
      await page.mouse.click(pt.x, pt.y - 20);
      return;
    }
    await page.keyboard.down(pt.y > 360 ? 'ArrowDown' : 'ArrowUp');
    await wait(page, 300);
    await page.keyboard.up(pt.y > 360 ? 'ArrowDown' : 'ArrowUp');
  }
  throw new Error(`could not reach ${kind}`);
}
/** Answer the open challenge correctly, the way a player would. */
async function solve(page) {
  const p = (await st(page)).booth.problem;
  if (p.mode === 'build') {
    for (let i = 0; i < p.tens; i++) await page.getByRole('button', { name: 'Add a strip of 10 tickets' }).click();
    for (let i = 0; i < p.ones; i++) await page.getByRole('button', { name: 'Add 1 ticket' }).click();
    await page.locator('.cc-pay').click();
  } else if (p.mode === 'compare') await page.locator(`.cc-plate[data-value="${p.answer}"]`).click();
  else await page.locator(`.cc-option[data-value="${p.options.find((o) => o.correct).value}"]`).click();
  await wait(page, 200);
}
/** Play a booth with clean answers until it lights up. Returns challenges played. */
async function finishBooth(page, booth) {
  let n = 0;
  for (; n < 30; n++) {
    const s = await st(page);
    if (s.done.includes(booth)) break;
    if (!s.booth) {
      await talkThrough(page);
      continue;
    }
    await solve(page);
    await page.keyboard.press('Space');
    await wait(page, 250);
  }
  await talkThrough(page);
  return n;
}

// ------------------------------------------------------------ desktop: a whole game
{
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1500);
  await page.screenshot({ path: `${OUT}/01-title.png` });
  check('title screen shows', await page.getByRole('heading', { name: 'Counting Carnival' }).count());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  check('customize screen opens', await page.getByRole('button', { name: /i'm ready/i }).count());
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await wait(page, 900);
  check('Rosa welcomes the player', (await page.locator('.dialogue').textContent())?.includes('Rosa'));
  await talkThrough(page);
  let s = await st(page);
  check('opening ends in the world', s.mode === 'world' && !s.talking, s.mode);

  // walk with the keyboard
  const y0 = s.player.y;
  await page.keyboard.down('ArrowUp');
  await wait(page, 500);
  await page.keyboard.up('ArrowUp');
  s = await st(page);
  check('arrow keys walk the player', s.player.y < y0 - 0.5, `${y0.toFixed(2)} -> ${s.player.y.toFixed(2)}`);

  // tap the Duck Pond: walk there and open it
  const pt = await page.evaluate(() => window.__cc.screenOf('booth', 'ducks'));
  await page.mouse.click(pt.x, pt.y - 20);
  for (let i = 0; i < 60 && !(await page.locator('.dialogue').count()); i++) await wait(page, 100);
  check('tapping a booth walks there and opens it', await page.locator('.dialogue').count());
  await talkThrough(page);
  s = await st(page);
  check('Duck Pond panel opens at level 1', s.booth?.booth === 'ducks' && s.booth.tier === 1);
  await page.screenshot({ path: `${OUT}/02-duck-pond.png` });

  // tap ducks to count them
  await page.locator('.cc-duck').nth(0).click({ force: true });
  await page.locator('.cc-duck').nth(1).click({ force: true });
  const tags = await page.locator('.cc-duck.counted .cc-tag').allTextContents();
  check('tapping ducks counts them 1, 2', tags.join(',') === '1,2', tags.join(','));

  // a wrong answer: feedback, crossed out, no star
  const wrong = s.booth.problem.options.find((o) => !o.correct);
  await page.locator(`.cc-option[data-value="${wrong.value}"]`).click();
  await wait(page, 200);
  check('a wrong answer explains the mistake', (await page.locator('.cc-feedback.try').count()) && (await page.locator('.cc-option.nope').count()), await page.locator('.cc-feedback').textContent());
  await page.keyboard.press('h');
  await wait(page, 200);
  s = await st(page);
  check('H gives a hint after a miss', s.booth.hintRung >= 1, `rung ${s.booth.hintRung}`);
  const ticketsBefore = s.tickets;
  await solve(page);
  s = await st(page);
  check('a helped answer wins 1 ticket and no star', s.tickets === ticketsBefore + 1 && s.stars.ducks === 0, `${ticketsBefore} -> ${s.tickets}, stars ${s.stars.ducks}`);
  check('the right answer is highlighted', await page.locator('.cc-option.right').count());
  await page.keyboard.press('Space');
  await wait(page, 250);

  // two clean answers level up
  for (let i = 0; i < 2; i++) {
    await solve(page);
    await page.keyboard.press('Space');
    await wait(page, 250);
  }
  s = await st(page);
  check('two clean answers move up to level 2', s.booth?.tier === 2 && s.stars.ducks === 2, `tier ${s.booth?.tier}, stars ${s.stars.ducks}`);

  // number keys answer
  const p = s.booth.problem;
  const idx = p.options.findIndex((o) => o.correct);
  await page.keyboard.press(String(idx + 1));
  await wait(page, 200);
  check('number keys pick an answer', (await st(page)).stars.ducks === 3);
  await page.keyboard.press('Space');
  await wait(page, 250);

  // finish the booth: debrief question and the booth lights up
  const t0 = (await st(page)).tickets;
  await finishBooth(page, 'ducks');
  s = await st(page);
  check('five stars finish the Duck Pond', s.done.includes('ducks') && s.stars.ducks === 5);
  check('finishing a booth pays 5 bonus tickets', s.tickets >= t0 + 5, `${t0} -> ${s.tickets}`);
  check('evening starts to fall', s.night > 0, `night ${s.night}`);
  await page.screenshot({ path: `${OUT}/03-duck-pond-lit.png` });

  // Munch opens the snack stand
  await tapTarget(page, 'munch', 'munch');
  for (let i = 0; i < 60 && !(await page.locator('.dialogue .choices button:not([disabled])').count()); i++) await wait(page, 100);
  await page.keyboard.press('1');
  await wait(page, 300);
  await talkThrough(page);
  s = await st(page);
  check('Munch opens his Snack Stand', s.booth?.booth === 'snacks');
  await page.screenshot({ path: `${OUT}/04-snacks.png` });
  await finishBooth(page, 'snacks');

  for (const b of ['rings', 'tickets']) {
    await page.evaluate((x) => window.__cc.open(x), b);
    await wait(page, 400);
    await talkThrough(page);
    if (b === 'tickets') await page.screenshot({ path: `${OUT}/05-tickets.png` });
    await finishBooth(page, b);
  }
  await talkThrough(page);
  s = await st(page);
  check('all four booths lit', s.done.length === 4, s.done.join(','));
  check('the finale brings night', s.night === 1);
  await page.screenshot({ path: `${OUT}/06-night.png` });

  // trade tickets for a balloon
  await tapTarget(page, 'rosa', 'rosa');
  for (let i = 0; i < 60 && !(await page.locator('.dialogue .choices button:not([disabled])').count()); i++) await wait(page, 100);
  await page.keyboard.press('1');
  await wait(page, 400);
  await page.screenshot({ path: `${OUT}/06b-rosa.png` });
  const tBefore = (await st(page)).tickets;
  await page.locator('.cc-shop-row button:not([disabled])').first().click();
  await wait(page, 300);
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('countingCarnival.save')));
  check('tickets buy a balloon to carry', save.carrying && save.tickets < tBefore, `${tBefore} -> ${save.tickets}, ${save.carrying}`);
  await page.screenshot({ path: `${OUT}/07-balloon.png` });

  // grown-ups report
  await page.keyboard.press('g');
  await wait(page, 400);
  const report = await page.locator('.modal').last().textContent();
  check('grown-ups report lists the skills', report.includes('Duck Pond') && report.includes('Prize Counter'));
  await page.screenshot({ path: `${OUT}/08-grownups.png` });
  await page.keyboard.press('Escape');

  // reload: continue keeps progress
  await page.reload();
  await wait(page, 1200);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 500);
  s = await st(page);
  check('the save survives a reload', s.done.length === 4 && s.tickets === save.tickets);
}

// ------------------------------------------------------------ phone
{
  const { page } = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(URL);
  await wait(page, 1200);
  await page.getByRole('button', { name: /start a new game/i }).tap();
  await wait(page, 400);
  await page.getByRole('button', { name: /i'm ready/i }).tap();
  await wait(page, 800);
  for (let i = 0; i < 20 && (await page.locator('.dialogue').count()); i++) {
    await page.locator('.dialogue').tap();
    await wait(page, 150);
  }
  check('phone: touch pad shows in the world', await page.locator('.touch').isVisible());
  await page.screenshot({ path: `${OUT}/09-phone-world.png` });
  await page.evaluate(() => window.__cc.open('rings'));
  await wait(page, 400);
  for (let i = 0; i < 20 && (await page.locator('.dialogue').count()); i++) {
    await page.locator('.dialogue').tap();
    await wait(page, 150);
  }
  await solve(page);
  check('phone: Next button has no keyboard hint', (await page.locator('.cc-foot .btn.primary').textContent()) === 'Next');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth || [...document.querySelectorAll('.cc-panel *')].some((e) => e.getBoundingClientRect().right > window.innerWidth + 1));
  check('phone: nothing spills off the side', !overflow);
  await page.screenshot({ path: `${OUT}/10-phone-rings.png` });
}

check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
check('nothing loads from other sites', offsite.length === 0, offsite.slice(0, 3).join(' '));
await browser.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify({ results, errors, offsite }, null, 2));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
