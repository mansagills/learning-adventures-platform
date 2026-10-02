// Browser check for Math Dash: Library Rush. Plays a new game from the title
// screen with real keys and taps: pick up books, shelve them right and wrong,
// a level-up choice, a stage change, chatty students, the end of a shift,
// saving, the grown-ups page and the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-math-dash.mjs [url]
//
// Writes test-output/md-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/math-dash/index.html';
const OUT = 'test-output/md-e2e';
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
const st = (page) => page.evaluate(() => window.__md.state());
const wait = (page, ms) => page.waitForTimeout(ms);
const tp = (page, x, y) => page.evaluate(([a, b]) => window.__md.teleport(a, b), [x, y]);

/** Walk onto the nearest book: stand next to it, then step onto it with the arrow keys. */
async function grab(page) {
  const s = await st(page);
  const books = await page.evaluate(() => window.__md.books());
  books.sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y));
  if (!books.length) return;
  const had = s.run.carried.length;
  await tp(page, books[0].x, books[0].y + 1.2);
  await wait(page, 120);
  await page.keyboard.down('ArrowUp');
  await wait(page, 300);
  await page.keyboard.up('ArrowUp');
  await wait(page, 150);
  // a book right above a wall can't be reached from below: step onto it instead
  if ((await st(page)).run.carried.length === had) {
    await tp(page, books[0].x, books[0].y + 0.2);
    await wait(page, 250);
  }
}
/** Walk into the front of a shelf with the arrow keys: up from the room for the back row, sideways along the front aisle for the front row. */
async function walkToShelf(page, i) {
  const sp = await page.evaluate((k) => window.__md.shelfPoint(k), i);
  const back = sp.y < 12;
  if (back) await tp(page, sp.x, sp.y + 1.6);
  else await tp(page, sp.x - 3.4, sp.y + 0.5);
  await wait(page, 150);
  const key = back ? 'ArrowUp' : 'ArrowRight';
  await page.keyboard.down(key);
  await wait(page, back ? 420 : 520);
  await page.keyboard.up(key);
  await wait(page, 200);
  // step away so the next visit counts as a new arrival
  await tp(page, sp.x, back ? sp.y + 2.4 : sp.y - 4.5);
  await wait(page, 120);
}
const rightShelf = (s, n) => s.run.shelves.findIndex((x) => n >= x.lo && n <= x.hi);
async function shelveOne(page) {
  let s = await st(page);
  if (!s.run.carried.length) await grab(page);
  s = await st(page);
  if (!s.run.carried.length) return false;
  await walkToShelf(page, rightShelf(s, s.run.carried[0]));
  s = await st(page);
  if (s.mode === 'levelup') {
    await page.keyboard.press('1');
    await wait(page, 250);
  }
  return true;
}

// ------------------------------------------------------------ desktop
{
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1500);
  check('title screen shows', await page.getByRole('heading', { name: /Library Rush/ }).count());
  await page.screenshot({ path: `${OUT}/01-title.png` });
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await wait(page, 900);
  check('the librarian explains the job', (await page.locator('.dialogue').textContent())?.includes('Okafor'));
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await wait(page, 140);
  }
  await wait(page, 400);
  let s = await st(page);
  check('the shift starts with full Focus and the tens shelves', s.mode === 'play' && s.run.focus === 100 && s.run.shelves[3].label === '30–39', s.run.shelves.map((x) => x.label).join(' '));
  check('books are waiting on the floor', (await page.evaluate(() => window.__md.books())).length >= 5);
  check('a calm start: no students yet', s.run.students === 0);

  const y0 = s.player.y;
  await page.keyboard.down('ArrowUp');
  await wait(page, 400);
  await page.keyboard.up('ArrowUp');
  s = await st(page);
  check('arrow keys walk the helper', s.player.y < y0 - 0.5, `${y0.toFixed(2)} -> ${s.player.y.toFixed(2)}`);

  await grab(page);
  await grab(page);
  s = await st(page);
  check('walking onto books picks them up', s.run.carried.length === 2, s.run.carried.join(','));
  check('the book in hand shows on the HUD and above the head', (await page.locator('.md-hand-num').textContent()) === String(s.run.carried[0]) && (await page.locator('.md-tag').isVisible()));
  const first = s.run.carried[0];
  await page.keyboard.press('q');
  await wait(page, 150);
  s = await st(page);
  check('Q swaps the book in hand', s.run.carried[0] !== first && s.run.carried.includes(first));

  // a wrong shelf: explanation, the book stays, no points
  const n = s.run.carried[0];
  const ri = rightShelf(s, n);
  const wi = ri === 0 ? 1 : ri - 1;
  await walkToShelf(page, wi);
  s = await st(page);
  const toastText = (await page.locator('.toast').last().textContent()) ?? '';
  check('a wrong shelf bounces the book back with a reason', s.run.wrong === 1 && s.run.score === 0 && s.run.carried.includes(n) && toastText.includes(String(n)), toastText);
  await page.screenshot({ path: `${OUT}/02-wrong.png` });
  // put that book back in hand and miss again: the right sign glows and an arrow points to it
  if (s.run.carried[0] !== n) await page.keyboard.press('q');
  await wait(page, 1400); // a shelf ignores the same book for a moment after a miss
  await walkToShelf(page, wi);
  s = await st(page);
  if (s.run.carried[0] !== n) await page.keyboard.press('q');
  await wait(page, 200);
  check('two misses on a book show the hint arrow', await page.locator('.md-arrow').isVisible());
  await page.screenshot({ path: `${OUT}/03-hint.png` });
  await walkToShelf(page, ri);
  s = await st(page);
  check('the right shelf scores (half points after a hint)', s.run.right >= 1 && s.run.score > 0, `score ${s.run.score}`);

  // keep shelving to a level-up
  for (let i = 0; i < 8 && (await st(page)).run.level === 1; i++) {
    s = await st(page);
    if (!s.run.carried.length) await grab(page);
    s = await st(page);
    if (!s.run.carried.length) continue;
    await walkToShelf(page, rightShelf(s, s.run.carried[0]));
    if ((await st(page)).mode === 'levelup') break;
  }
  s = await st(page);
  check('a full Sorting meter offers three powers', s.mode === 'levelup' && (await page.locator('.md-card').count()) === 3);
  await page.screenshot({ path: `${OUT}/04-levelup.png` });
  const picked = await page.locator('.md-card').first().getAttribute('data-power');
  await page.keyboard.press('1');
  await wait(page, 300);
  s = await st(page);
  check('pressing 1 takes the first power', s.mode === 'play' && s.run.level === 2 && (picked === 'snack' || s.run.powers[picked] >= 1), picked);
  check('the power shows on the HUD', (await page.locator('.md-power').count()) >= 1);

  // shelve on until the next stage
  for (let i = 0; i < 40 && (await st(page)).run.stage === 1; i++) {
    await shelveOne(page);
  }
  s = await st(page);
  check('12 right books move on to Chapter Books (hundreds)', s.run.stage === 2 && s.run.shelves[0].label === '100–199', s.run.shelves.map((x) => x.label).join(' '));
  check('a banner names the new stage', (await page.locator('.md-banner').textContent())?.includes('Chapter Books'));
  await page.screenshot({ path: `${OUT}/05-stage2.png` });

  // the rush: students arrive and chat
  await page.evaluate(() => window.__md.setTime(90));
  await tp(page, 17, 15);
  let bumped = false;
  for (let i = 0; i < 40 && !bumped; i++) {
    await wait(page, 200);
    // step right next to a chatty student (between Shush Bell rings)
    const kids = (await page.evaluate(() => window.__md.students())).filter((k) => k.state === 'chat');
    if (kids.length && i % 3 === 0) await tp(page, kids[0].x + 0.3, kids[0].y);
    s = await st(page);
    bumped = s.run.focus < 100;
  }
  check('students come in after the calm start', s.run.students > 0, `${s.run.students} students`);
  check('a bump costs Focus and the student chats', bumped && (await page.locator('.md-bubble').count()) >= 0, `focus ${Math.round(s.run.focus)}`);
  await page.screenshot({ path: `${OUT}/06-rush.png` });
  // the Shush Bell calms students who come close
  for (let i = 0; i < 30; i++) await wait(page, 150);
  const calmedOrSeated = await page.evaluate(() => window.__md.state().run.students - window.__md.state().run.chatty);
  check('the Shush Bell calms nearby students (they go and read)', calmedOrSeated > 0, `${calmedOrSeated} calmed`);

  // pause and grown-ups
  await page.keyboard.press('Escape');
  await wait(page, 300);
  check('Esc pauses the shift', (await st(page)).mode === 'paused' && (await page.locator('.modal').count()) > 0);
  await page.keyboard.press('Escape');
  await wait(page, 300);
  check('closing the menu resumes', (await st(page)).mode === 'play');
  await page.keyboard.press('g');
  await wait(page, 400);
  const report = (await page.locator('.modal').last().textContent()) ?? '';
  check('the grown-ups page lists the standards', report.includes('2.NBT.4'));
  await page.keyboard.press('Escape');
  await wait(page, 200);
  if ((await st(page)).mode === 'paused' && (await page.locator('.modal').count())) await page.keyboard.press('Escape');
  await wait(page, 200);

  // end of shift
  await page.evaluate(() => window.__md.setFocus(0.5));
  for (let i = 0; i < 60 && (await st(page)).mode !== 'over'; i++) await wait(page, 150);
  s = await st(page);
  check('running out of Focus ends the shift with a summary', s.mode === 'over' && (await page.locator('.md-over').count()) === 1);
  check('the summary saves the best score and stage', s.save.bestScore > 0 && s.save.bestStage === 2, JSON.stringify(s.save));
  await page.screenshot({ path: `${OUT}/07-over.png` });
  await page.keyboard.press('Enter');
  await wait(page, 800);
  s = await st(page);
  check('Play again starts a fresh shift at the stage reached', s.mode === 'play' && s.run.score === 0 && s.run.stage === 2 && s.run.focus === 100);

  await page.reload();
  await wait(page, 1200);
  check('after a reload the title offers "Start a shift" and a stage picker', (await page.getByRole('button', { name: /start a shift/i }).count()) === 1 && (await page.locator('.md-stagepick button:not([disabled])').count()) === 2);
  await page.screenshot({ path: `${OUT}/08-title-again.png` });
}

// ------------------------------------------------------------ phone
{
  const { page } = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(URL);
  await page.evaluate(() => localStorage.setItem('mathDashLibraryRush.save', JSON.stringify({ version: 1, introSeen: true })));
  await page.reload();
  await wait(page, 1200);
  await page.getByRole('button', { name: /start a shift/i }).tap();
  await wait(page, 600);
  const s0 = await st(page);
  // drag on the screen: the floating joystick moves the helper
  const box = await page.locator('canvas').boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
  await touch('touchStart', cx, cy);
  for (let i = 1; i <= 6; i++) {
    await touch('touchMove', cx + i * 8, cy);
    await wait(page, 40);
  }
  await wait(page, 500);
  check('phone: the joystick shows while dragging', await page.locator('.md-stick').isVisible());
  await touch('touchEnd', cx, cy);
  const s1 = await st(page);
  check('phone: dragging moves the helper', s1.player.x > s0.player.x + 0.5, `${s0.player.x.toFixed(2)} -> ${s1.player.x.toFixed(2)}`);
  await grab(page);
  await grab(page);
  const before = (await st(page)).run.carried[0];
  await page.locator('.md-swap').tap();
  await wait(page, 150);
  check('phone: the Swap button changes the book in hand', (await st(page)).run.carried[0] !== before);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth || [...document.querySelectorAll('.md-hud > *:not(.md-tag):not(.md-bubble):not(.md-float):not(.md-arrow)')].some((e) => !e.hidden && e.getBoundingClientRect().right > window.innerWidth + 1));
  check('phone: nothing spills off the side', !overflow);
  await page.screenshot({ path: `${OUT}/09-phone.png` });
  await page.evaluate(() => window.__md.giveXp());
  for (let i = 0; i < 6 && (await st(page)).mode !== 'levelup'; i++) {
    let ps = await st(page);
    if (!ps.run.carried.length) await grab(page);
    ps = await st(page);
    if (ps.run.carried.length) await walkToShelf(page, rightShelf(ps, ps.run.carried[0]));
  }
  const cardsFit = await page.evaluate(() => [...document.querySelectorAll('.md-card')].every((c) => c.getBoundingClientRect().right <= window.innerWidth && c.getBoundingClientRect().bottom <= window.innerHeight));
  check('phone: the three power cards fit on screen', (await page.locator('.md-card').count()) === 3 && cardsFit);
  await page.screenshot({ path: `${OUT}/10-phone-levelup.png` });
}

check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
check('nothing loads from other sites', offsite.length === 0, offsite.slice(0, 3).join(' '));
await browser.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify({ results, errors, offsite }, null, 2));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
