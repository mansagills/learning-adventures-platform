// Browser check for Time Attack Clock: plays a new game from the title screen
// through all three town jobs to the finale with real clicks, drags and keys,
// then a Time Attack round, saving, the grown-ups report and the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-time-attack-clock.mjs [url]
//
// Writes test-output/tac-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/time-attack-clock/index.html';
const OUT = 'test-output/tac-e2e';
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
const st = (page) => page.evaluate(() => window.__tac.state());
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
  for (let i = 0; i < 14; i++) {
    const pt = await page.evaluate((d) => window.__tac.screenOf(d), id);
    if (pt.visible && pt.y > 90 && pt.y < 620 && pt.x > 40 && pt.x < 1240) {
      await page.mouse.click(pt.x, pt.y - 20);
      return;
    }
    const key = pt.y > 360 ? 'ArrowDown' : 'ArrowUp';
    await page.keyboard.down(key);
    await wait(page, 300);
    await page.keyboard.up(key);
  }
  throw new Error(`could not reach ${id}`);
}
const toMin = (t) => (t.h % 12) * 60 + t.m;
/** Drag the long hand on the clock canvas to a minute (the way a player would). */
async function dragMinuteTo(page, minute) {
  const box = await page.locator('.tac-clock-canvas.interactive').boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const r = box.width * 0.33;
  const s = await st(page);
  const cur = s.station.set;
  // grab the minute hand near its tip, then sweep round in small steps
  const a0 = (cur.m * 6 * Math.PI) / 180;
  await page.mouse.move(cx + Math.sin(a0) * r, cy - Math.cos(a0) * r);
  await page.mouse.down();
  let d = minute - cur.m;
  if (d > 30) d -= 60;
  if (d < -30) d += 60;
  const steps = Math.max(2, Math.ceil(Math.abs(d) / 4));
  for (let i = 1; i <= steps; i++) {
    const m = cur.m + (d * i) / steps;
    const a = (m * 6 * Math.PI) / 180;
    await page.mouse.move(cx + Math.sin(a) * r, cy - Math.cos(a) * r);
  }
  await page.mouse.up();
}
/** Answer the open question correctly. Set-the-clock questions use a real drag, then the hour buttons. */
async function solve(page) {
  const s = await st(page);
  const p = s.station.problem;
  if (p.kind === 'set') {
    await dragMinuteTo(page, p.time.m);
    let now = (await st(page)).station.set;
    const hours = Math.round(((toMin(p.time) - toMin(now) + 720) % 720) / 60) % 12;
    for (let i = 0; i < hours; i++) await page.locator('.tac-hand-row.hour .tac-hand-btn').nth(1).click();
    now = (await st(page)).station.set;
    if (toMin(now) !== toMin(p.time)) return { dragged: false, now, want: p.time };
    await page.keyboard.press('Enter');
    return { dragged: true };
  }
  const right = p.choices.find((c) => c.correct);
  const idx = p.choices.indexOf(right);
  await page.keyboard.press(String(idx + 1));
  return { dragged: false };
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1500);
  check('title screen shows', await page.getByText('Time Attack Clock').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  check('character creator opens', await page.getByRole('button', { name: /i'm ready/i }).isVisible());
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => page.locator('.dialogue').count());
  check('Mr. Tock opens the story', (await page.locator('.dialogue').textContent())?.includes('Tock'));
  await page.screenshot({ path: `${OUT}/01-opening.png` });
  await talkThrough(page);
  let s = await st(page);
  check('town is ready to walk', s.mode === 'world' && s.done.length === 0);
  check('tower starts broken', !s.tower.hands && !s.tower.bell && !s.tower.lights);
  const t0 = s.townTime;
  await wait(page, 1300);
  check('the stopped clock does not run', toMin((await st(page)).townTime) === toMin(t0));

  // walk with keys
  const p0 = s.player;
  await page.keyboard.down('ArrowLeft');
  await wait(page, 400);
  await page.keyboard.up('ArrowLeft');
  s = await st(page);
  check('arrow keys walk', s.player.x < p0.x - 0.5, `x ${p0.x.toFixed(1)} -> ${s.player.x.toFixed(1)}`);

  let dragUsed = false;
  for (const id of ['school', 'bus', 'bakery']) {
    await tapPerson(page, id);
    const opened = await waitFor(page, async () => (await page.locator('.dialogue').count()) || (await page.locator('.tac-panel').count()), 100);
    check(`tapping ${id} walks there and talks`, opened);
    await talkThrough(page);
    check(`${id} activity opens`, await page.locator('.tac-panel').count());
    if (id === 'school') {
      // a wrong answer, then a hint
      s = await st(page);
      const wrong = s.station.problem.choices.find((c) => !c.correct);
      await page.locator(`.tac-choice[data-value="${wrong.value}"]`).click();
      await wait(page, 200);
      check('a wrong answer explains the mistake', (await page.locator('.tac-feedback.try').count()) === 1, (await page.locator('.tac-feedback').textContent())?.slice(0, 70));
      check('the wrong choice is crossed out', await page.locator('.tac-choice.nope').count());
      await page.keyboard.press('h');
      await page.keyboard.press('h');
      await wait(page, 200);
      check('hint 2 shows the hour and the fives', (await st(page)).station.hintRung === 2);
      await page.screenshot({ path: `${OUT}/02-school-hint.png` });
    }
    if (id === 'bus') {
      s = await st(page);
      check('bus activity has a clock to set', s.station.problem.kind === 'set' && (await page.locator('.tac-clock-canvas.interactive').count()) === 1);
      const before = s.station.set;
      await page.locator('.tac-clock-canvas.interactive').focus();
      await page.keyboard.press('ArrowUp');
      check('arrow keys move the hands', toMin((await st(page)).station.set) === (toMin(before) + 60) % 720);
    }
    let guard = 0;
    while (guard++ < 40) {
      s = await st(page);
      if (!s.station) break;
      if (!s.station.answered) {
        const r = await solve(page);
        if (r.dragged) dragUsed = true;
        if (r.now) console.log('could not set clock', JSON.stringify(r));
        await wait(page, 200);
      }
      s = await st(page);
      if (!s.station) break;
      if (!s.station.answered) {
        // a slip while solving: use the hints until it is answered
        await page.keyboard.press('h');
        await wait(page, 100);
        continue;
      }
      await page.keyboard.press('Space');
      await wait(page, 300);
      if (await page.locator('.dialogue').count()) break;
    }
    if (id === 'bus') check('dragging the long hand sets the clock', dragUsed);
    await waitFor(page, async () => page.locator('.dialogue').count());
    await talkThrough(page);
    s = await st(page);
    check(`${id} job is done after 5 stars`, s.done.includes(id) && s.stars[id] >= 5, JSON.stringify(s.stars));
    await page.screenshot({ path: `${OUT}/03-${id}-done.png` });
  }
  s = await st(page);
  check('all three parts are back on the tower', s.tower.hands && s.tower.bell && s.tower.lights);
  const tt = s.townTime;
  await wait(page, 2200);
  check('the fixed clock runs', toMin((await st(page)).townTime) !== toMin(tt));
  check('evening is coming', s.night > 0.3, `night ${s.night}`);

  // the finale with Mr. Tock
  await tapPerson(page, 'tock');
  await waitFor(page, async () => page.locator('.dialogue').count(), 100);
  check('Mr. Tock rings the finale', (await page.locator('.dialogue').textContent())?.includes('BONG'));
  await page.screenshot({ path: `${OUT}/04-finale.png` });
  await talkThrough(page);
  s = await st(page);
  check('finale is saved and night falls', s.finaleSeen && s.night >= 0.7);

  // Time Attack
  await tapPerson(page, 'tock');
  await waitFor(page, async () => page.locator('.dialogue .choices button').count(), 100);
  await page.locator('.dialogue .choices button').first().click();
  await wait(page, 400);
  check('Time Attack opens', await page.getByRole('button', { name: 'Go!' }).isVisible());
  await page.getByRole('button', { name: 'Go!' }).click();
  await wait(page, 300);
  for (let i = 0; i < 6; i++) {
    s = await st(page);
    const idx = s.attack.problem.choices.findIndex((c) => c.correct);
    await page.keyboard.press(String(idx + 1));
    await wait(page, 380);
  }
  s = await st(page);
  check('Time Attack counts right answers', s.attack.score === 6, `score ${s.attack.score}`);
  const wrongIdx = s.attack.problem.choices.findIndex((c) => !c.correct);
  await page.keyboard.press(String(wrongIdx + 1));
  await wait(page, 200);
  check('a miss shows the right answer', await page.locator('.tac-attack .tac-choice.right').count());
  await page.evaluate(() => window.__tac.endAttack());
  await wait(page, 400);
  s = await st(page);
  check('the round ends with a medal and a best score', s.best === 6 && s.medals.includes('bronze'), JSON.stringify({ best: s.best, medals: s.medals }));
  await page.screenshot({ path: `${OUT}/05-attack-result.png` });
  await page.getByRole('button', { name: 'Done' }).click();
  await wait(page, 300);

  // grown-ups report (G)
  await page.keyboard.press('g');
  await wait(page, 400);
  const report = (await page.locator('.modal').last().textContent()) ?? '';
  check('grown-ups report lists the jobs', report.includes('School Bell') && report.includes('Bakery') && report.includes('3.MD.1'));
  await page.screenshot({ path: `${OUT}/05b-grownups.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // reload: progress is kept
  await page.reload();
  await wait(page, 1300);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 500);
  s = await st(page);
  check('saved game continues', s.done.length === 3 && s.best === 6 && s.finaleSeen && s.tower.lights);
  await page.screenshot({ path: `${OUT}/06-evening.png` });

  // phone layout
  const { page: ph } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ph.goto(URL);
  await wait(ph, 1300);
  // a fresh browser: start a new game
  await ph.getByRole('button', { name: /start a new game/i }).tap();
  await wait(ph, 400);
  await ph.getByRole('button', { name: /i'm ready/i }).tap();
  await wait(ph, 800);
  await talkThrough(ph);
  await ph.evaluate(() => window.__tac.open('bus'));
  await wait(ph, 600);
  await talkThrough(ph);
  const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
  check('phone: no sideways scrolling', sw <= 390, `scrollWidth ${sw}`);
  const chk = await ph.locator('.tac-check').boundingBox();
  check('phone: Check button is on screen', chk && chk.y + chk.height <= 844, JSON.stringify(chk));
  await ph.screenshot({ path: `${OUT}/07-phone-bus.png` });
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
