// Browser check for Money Market Madness: plays a new game from the title
// screen through a whole market day with real clicks (counting coins, "is it
// enough?", making change by tapping coins), the summary, the upgrade shop
// and the next day, then a customer running out of patience, saving and the
// phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-money-market.mjs [url]
//
// Writes test-output/mm-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/money-market-madness/index.html';
const OUT = 'test-output/mm-e2e';
mkdirSync(OUT, { recursive: true });
const results = [];
const errors = [];
const offsite = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};
const VALUE = { penny: 1, nickel: 5, dime: 10, quarter: 25, dollar: 100, five: 500 };

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
const st = (page) => page.evaluate(() => window.__mm.state());
const wait = (page, ms) => page.waitForTimeout(ms);
async function waitFor(page, fn, tries = 120) {
  for (let i = 0; i < tries; i++) {
    if (await fn()) return true;
    await wait(page, 150);
  }
  return false;
}
async function talkThrough(page) {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await wait(page, 150);
  }
  await wait(page, 250);
}
/** Solve the current step the way a player would: pick the answer, or tap the fewest coins into the tray. */
async function solveStep(page, step) {
  if (step.kind === 'count' || step.kind === 'total') await page.locator(`.mm-choice[data-value="${step.answer}"]`).click();
  else if (step.kind === 'enough') await page.locator(`.mm-choice[data-value="${step.answer ? 'yes' : 'no'}"]`).click();
  else {
    let left = step.answer;
    const allowed = [...step.allowed].sort((a, b) => VALUE[b] - VALUE[a]);
    for (const m of allowed)
      while (left >= VALUE[m]) {
        await page.locator(`.mm-coinbtn[data-money="${m}"]`).click();
        left -= VALUE[m];
      }
    await page.locator('.mm-give').click();
  }
  await wait(page, 300);
}
/** Serve the customer at the counter, every step right the first time. */
async function serveOne(page) {
  await waitFor(page, async () => (await st(page)).front);
  await page.locator('.mm-serve').click();
  await wait(page, 300);
  for (let k = 0; k < 4; k++) {
    const s = await st(page);
    if (!s.order) break;
    await solveStep(page, s.order.steps[s.order.step]);
  }
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1500);
  check('title screen shows', await page.getByText('Money Market Madness').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => page.locator('.dialogue').count());
  check('Chef Amara explains the stand', (await page.locator('.dialogue').textContent())?.includes('Amara'));
  await talkThrough(page);
  let s = await st(page);
  check('market day 1 starts', s.mode === 'day' && s.dayNo === 1 && s.money === 0);
  check('the stand starts with popcorn and water', s.owned.includes('popcorn') && s.owned.includes('water'));

  // first customer: a wrong answer, a hint, then the right one
  await waitFor(page, async () => (await st(page)).front);
  check('a customer comes to the counter', (await st(page)).front);
  await page.locator('.mm-serve').click();
  await wait(page, 300);
  s = await st(page);
  const step0 = s.order.steps[0];
  check('level 1 asks to count the coins', step0.kind === 'count');
  const wrong = step0.choices.find((c) => !c.correct);
  await page.locator(`.mm-choice[data-value="${wrong.value}"]`).click();
  await wait(page, 250);
  const fb = (await page.locator('.mm-feedback').textContent()) ?? '';
  check('a wrong count gets a reason', fb.length > 10, fb.slice(0, 70));
  await page.keyboard.press('h');
  await page.keyboard.press('h');
  await wait(page, 200);
  check('hint 2 shows each coin value', (await page.locator('.mm-coin-val').count()) > 0);
  await page.screenshot({ path: `${OUT}/01-hint.png` });
  for (let k = 0; k < 4; k++) {
    s = await st(page);
    if (!s.order) break;
    await solveStep(page, s.order.steps[s.order.step]);
  }
  s = await st(page);
  check('the sale goes in the till', s.money > 0, `money ${s.money}`);
  const afterFirst = s.money;

  // the rest of the day, all right first time (the level rises, so change-making comes in)
  let sawChange = false;
  let sawChangeShot = false;
  for (let i = 0; i < 12; i++) {
    s = await st(page);
    if (s.mode !== 'day') break;
    if (s.day && s.day.served + s.day.missed >= s.day.total) break;
    if (!s.front && s.day.toArrive === 0 && s.waiting === 0) break;
    if (i === 2) await page.evaluate(() => window.__mm.setTier(3));
    await waitFor(page, async () => (await st(page)).front);
    s = await st(page);
    if (s.mode !== 'day') break;
    await page.locator('.mm-serve').click();
    await wait(page, 300);
    for (let k = 0; k < 4; k++) {
      s = await st(page);
      if (!s.order) break;
      const step = s.order.steps[s.order.step];
      if (step.kind === 'change') {
        sawChange = true;
        // (one picture of the change tray)
        if (!sawChangeShot) await page.screenshot({ path: `${OUT}/02-change.png` });
        sawChangeShot = true;
      }
      await solveStep(page, step);
    }
  }
  check('making change by tapping coins works', sawChange);
  s = await st(page);
  check('first-try answers earn tips', s.money > afterFirst, `money ${s.money}`);
  await waitFor(page, async () => (await st(page)).mode === 'summary', 200);
  s = await st(page);
  check('the day ends with a summary', s.mode === 'summary');
  await page.screenshot({ path: `${OUT}/03-summary.png` });

  // the upgrade shop
  await page.evaluate(() => window.__mm.setMoney(1000));
  await page.getByRole('button', { name: /upgrade shop/i }).click();
  await wait(page, 400);
  const before = (await st(page)).owned.length;
  const buy = page.locator('[data-buy]:not([disabled])').first();
  const label = (await buy.textContent()) ?? '';
  await buy.click();
  await wait(page, 300);
  s = await st(page);
  check('buying an upgrade spends the money', s.owned.length === before + 1 && s.money < 1000, `${label} -> money ${s.money}`);
  await page.screenshot({ path: `${OUT}/04-shop.png` });
  await page.getByRole('button', { name: /start market day/i }).click();
  await wait(page, 600);
  s = await st(page);
  check('market day 2 starts', s.mode === 'day' && s.dayNo === 2);

  // a waiting customer runs out of patience
  await waitFor(page, async () => (await st(page)).waiting >= 2, 200);
  const missed0 = (await st(page)).day.missed;
  await page.evaluate(() => window.__mm.drainPatience());
  await wait(page, 600);
  s = await st(page);
  check('a customer who waits too long leaves', s.day.missed === missed0 + 1);
  await serveOne(page);
  await page.screenshot({ path: `${OUT}/05-day2.png` });

  // reload: progress is kept
  const saved = await st(page);
  await page.reload();
  await wait(page, 1300);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 600);
  s = await st(page);
  check('saved game continues', s.owned.length === saved.owned.length && s.dayNo >= 2, JSON.stringify({ owned: s.owned.length, day: s.dayNo }));

  // phone
  const { page: ph } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ph.goto(URL);
  await wait(ph, 1300);
  await ph.getByRole('button', { name: /start a new game/i }).tap();
  await wait(ph, 400);
  await ph.getByRole('button', { name: /i'm ready/i }).tap();
  await wait(ph, 800);
  await talkThrough(ph);
  await waitFor(ph, async () => (await st(ph)).front);
  await ph.locator('.mm-serve').tap();
  await wait(ph, 400);
  const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
  check('phone: no sideways scrolling', sw <= 390, `scrollWidth ${sw}`);
  const box = await ph.locator('.mm-choice').first().boundingBox();
  check('phone: answers are on screen', box && box.y + box.height <= 844, JSON.stringify(box));
  await ph.screenshot({ path: `${OUT}/06-phone.png` });
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
