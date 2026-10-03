// Browser check for Math Race Rally: plays a new game from the title screen
// with real keys (steering, lanes), through a race with right and wrong
// gates, the results, the memory-match pit stop and the garage, then a second
// race, saving and the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-math-race-rally.mjs [url]
//
// Writes test-output/rr-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/math-race-rally/index.html';
const OUT = 'test-output/rr-e2e';
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
const st = (page) => page.evaluate(() => window.__rr.state());
const wait = (page, ms) => page.waitForTimeout(ms);
async function waitFor(page, fn, tries = 150) {
  for (let i = 0; i < tries; i++) {
    if (await fn()) return true;
    await wait(page, 100);
  }
  return false;
}
async function talkThrough(page) {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await wait(page, 150);
  }
}
/** Drive the rest of the race: pick the right lane, or the wrong one where `wrongAt` says. */
async function driveRace(page, wrongAt = new Set()) {
  const log = [];
  let last = -1;
  for (let i = 0; i < 3000; i++) {
    const s = await st(page);
    if (s.race.playerDone) break;
    if (log.length) log[log.length - 1].dashAhead ||= s.rival.s > s.player.s;
    if (s.race.problem && s.race.q !== last) {
      last = s.race.q;
      const lane = s.race.problem.choices.findIndex((c) => (wrongAt.has(s.race.q) ? !c.correct : c.correct));
      await page.keyboard.press(String(lane + 1));
      log.push({ q: s.race.q, level: s.player.level, hinted: s.race.hinted });
    }
    await wait(page, 50);
  }
  return log;
}
/** Solve the pit stop board the way a player with a good memory would. */
async function playPit(page) {
  const n = await page.locator('.rr-card').count();
  const faces = [];
  for (let i = 0; i < n; i++) faces.push((await page.locator('.rr-card-face').nth(i).textContent()) ?? '');
  const val = (f) => {
    const m = f.match(/^(\d+) ([+−]) (\d+)$/);
    return m ? String(m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3])) : null;
  };
  const used = new Set();
  for (let i = 0; i < n; i++) {
    if (used.has(i)) continue;
    const a = val(faces[i]);
    const j = faces.findIndex((f, k) => k !== i && !used.has(k) && (a !== null ? f === a : val(f) === faces[i]));
    if (j < 0) continue;
    used.add(i).add(j);
    await page.locator('.rr-card').nth(i).click();
    await page.locator('.rr-card').nth(j).click();
    await wait(page, 200);
  }
  return n;
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1500);
  check('title screen shows', await page.getByText('Math Race Rally').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await waitFor(page, async () => page.locator('.dialogue').count());
  check('Crew Chief Kofi explains the race', (await page.locator('.dialogue').textContent())?.includes('Kofi'));
  await talkThrough(page);
  await waitFor(page, async () => (await st(page)).mode === 'countdown');
  check('a countdown starts the race', (await st(page)).mode === 'countdown');
  await waitFor(page, async () => (await st(page)).mode === 'race');
  let s = await st(page);
  check('the race is running, car moving', s.mode === 'race' && s.race.problem !== null);
  await wait(page, 600);
  const s1 = await st(page);
  check('the car keeps moving on its own', s1.player.s > s.player.s + 2, `${s.player.s.toFixed(1)} -> ${s1.player.s.toFixed(1)}`);
  check('the question shows with three answers', (await page.locator('.rr-answer').count()) === 3);
  // steer with the arrow keys
  const x0 = s1.player.x;
  await page.keyboard.down('ArrowLeft');
  await wait(page, 350);
  await page.keyboard.up('ArrowLeft');
  check('arrow keys steer', (await st(page)).player.x < x0 - 0.2);
  await page.screenshot({ path: `${OUT}/01-race.png` });
  await page.evaluate(() => window.__rr.setTimeScale(3));

  // question 1 right, 2 and 3 wrong (then a hint), the rest right
  const level0 = (await st(page)).player.level;
  const log = await driveRace(page, new Set([1, 2]));
  s = await st(page);
  check('a right gate speeds you up', log[1].level > level0, `level ${level0} -> ${log[1].level}`);
  check('a wrong gate slows you down (never to a stop)', log[2].level < log[1].level && log[3].level >= 1, log.slice(0, 4).map((l) => l.level).join(','));
  check('two misses in a row bring a strategy hint', log[3].hinted === true);
  check('all ten questions were asked', log.length === 10, `${log.length}`);
  check('the race counts right answers', s.race.correct === 8 && s.race.missed === 2, `${s.race.correct} right, ${s.race.missed} missed`);
  await page.evaluate(() => window.__rr.setTimeScale(1));
  await waitFor(page, async () => page.getByRole('button', { name: /pit stop/i }).isVisible().catch(() => false));
  const resultText = (await page.locator('.modal').last().textContent()) ?? '';
  check('results show the place and pit notes', /won/i.test(resultText) && resultText.includes('Pit notes'), resultText.slice(0, 60));
  await page.screenshot({ path: `${OUT}/02-results.png` });
  const boltsBefore = (await st(page)).bolts;

  // the pit stop
  await page.getByRole('button', { name: /pit stop/i }).click();
  await wait(page, 400);
  check('the pit stop has 12 cards', (await page.locator('.rr-card').count()) === 12);
  // a miss flips back
  const f0 = (await page.locator('.rr-card-face').nth(0).textContent()) ?? '';
  let other = 1;
  for (let k = 1; k < 12; k++) {
    const f = (await page.locator('.rr-card-face').nth(k).textContent()) ?? '';
    const m0 = f0.match(/^(\d+) ([+−]) (\d+)$/);
    const mk = f.match(/^(\d+) ([+−]) (\d+)$/);
    if ((m0 && mk) || (!m0 && !mk)) {
      other = k;
      break;
    }
  }
  await page.locator('.rr-card').nth(0).click();
  await page.locator('.rr-card').nth(other).click();
  await wait(page, 1300);
  check('a mismatch flips back', (await page.locator('.rr-card.up').count()) === 0);
  await playPit(page);
  await wait(page, 300);
  s = await st(page);
  check('matching every pair earns bolts', s.bolts > boltsBefore, `${boltsBefore} -> ${s.bolts}`);
  await page.screenshot({ path: `${OUT}/03-pit.png` });

  // the garage
  await page.getByRole('button', { name: /to the garage/i }).click();
  await wait(page, 300);
  const boltsNow = (await st(page)).bolts;
  const buyBtn = page.locator('[data-buy]:not([disabled])').first();
  const canBuy = (await buyBtn.count()) > 0;
  if (canBuy) {
    const id = await buyBtn.getAttribute('data-buy');
    await buyBtn.click();
    await wait(page, 200);
    s = await st(page);
    check('buying a part spends bolts and puts it on the car', s.bolts < boltsNow && s.owned.includes(id) && Object.values(s.look).includes(id), `${id}: ${boltsNow} -> ${s.bolts}`);
  } else check('buying a part spends bolts and puts it on the car', false, `nothing affordable with ${boltsNow}`);
  await page.getByRole('tab', { name: 'Car type' }).click();
  check('a car type you cannot afford is locked', await page.locator('[data-buy="rocket"]').isDisabled());
  await page.screenshot({ path: `${OUT}/04-garage.png` });
  await page.getByRole('button', { name: 'Next race' }).click();
  await wait(page, 300);
  const trackText = (await page.locator('.modal').last().textContent()) ?? '';
  check('track picker shows locked tracks', trackText.includes('Neon City') && trackText.includes('to open'));

  // a second race on the newly opened desert track
  const desert = page.locator('[data-track="desert"]');
  if (await desert.count()) await desert.click();
  else await page.locator('[data-track="hills"]').click();
  await waitFor(page, async () => (await st(page)).mode === 'race');
  await page.evaluate(() => window.__rr.setTimeScale(3));
  await wait(page, 300);
  await page.screenshot({ path: `${OUT}/05-race2.png` });
  // six right in a row puts you in front; then two misses in a row let Dash pass you
  const log2 = await driveRace(page, new Set([6, 7]));
  s = await st(page);
  check('a run of right answers puts you ahead of Dash', log2[5] && !log2[5].dashAhead);
  check('two misses in a row let Dash pass you again', log2.slice(7).some((l) => l.dashAhead), log2.map((l) => (l.dashAhead ? 'D' : 'Y')).join(''));
  check('a second race finishes', s.race.playerDone && s.races === 2, `races ${s.races}`);
  await page.evaluate(() => window.__rr.setTimeScale(1));

  // grown-ups report from the pause menu
  await waitFor(page, async () => page.getByRole('button', { name: /pit stop/i }).isVisible().catch(() => false));
  const saved = await st(page);

  // reload: progress is kept
  await page.reload();
  await wait(page, 1300);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 500);
  s = await st(page);
  check('saved game continues with bolts, parts and wins', s.bolts === saved.bolts && s.owned.length === saved.owned.length && s.wins === saved.wins && s.mode === 'menu', JSON.stringify({ bolts: s.bolts, wins: s.wins }));

  // phone
  const { page: ph } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ph.goto(URL);
  await wait(ph, 1300);
  await ph.getByRole('button', { name: /start a new game/i }).tap();
  await wait(ph, 600);
  await talkThrough(ph);
  await waitFor(ph, async () => (await st(ph)).mode === 'race');
  const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
  check('phone: no sideways scrolling', sw <= 390, `scrollWidth ${sw}`);
  check('phone: steering buttons show', await ph.locator('.rr-steer.left').isVisible());
  const px0 = (await st(ph)).player.x;
  const box = await ph.locator('.rr-steer.right').boundingBox();
  // hold a finger on the button (a real touch, not a mouse)
  const cdp = await ph.context().newCDPSession(ph);
  const tp = [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: tp });
  await wait(ph, 400);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  check('phone: the steer button steers', (await st(ph)).player.x > px0 + 0.2);
  await ph.locator('.rr-answer').nth(0).tap();
  await wait(ph, 900);
  check('phone: tapping an answer drives to its lane', (await st(ph)).player.x < 0);
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
