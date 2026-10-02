// Browser check for Number Line Ninja: plays a new game with real input and
// checks each part of the pilot's acceptance list.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-number-line-ninja.mjs [url]
//
// Writes test-output/nln-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/number-line-ninja/index.html';
const OUT = 'test-output/nln-e2e';
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
const st = (page) => page.evaluate(() => window.__nln.state());
const wait = (page, ms) => page.waitForTimeout(ms);
async function idle(page) {
  for (let i = 0; i < 100 && (await st(page)).busy; i++) await wait(page, 40);
  await wait(page, 120);
}
async function talkThrough(page, pickCorrect = true) {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    const choices = page.locator('.choices button:not([disabled])');
    if (await choices.count()) {
      // the first option is the right one in every authored debrief; pick by number key
      await page.keyboard.press(pickCorrect ? '1' : String(await choices.count()));
    } else await page.keyboard.press('Space');
    await wait(page, 160);
  }
  await wait(page, 250);
}
async function hop(page, list) {
  for (const h of list) {
    await page.keyboard.press(Math.abs(h) > 1 ? (h > 0 ? 'ArrowUp' : 'ArrowDown') : h > 0 ? 'ArrowRight' : 'ArrowLeft');
    await wait(page, 40);
  }
  await idle(page);
}
async function solve(page) {
  const s = await st(page);
  await hop(page, s.worked);
  await page.keyboard.press('Space');
  await wait(page, 500);
  if (s.problem.kind === 'gap') await talkThrough(page);
  return s;
}

// ------------------------------------------------------------ new game, keyboard only
const { ctx, page } = await newPage();
await page.goto(URL);
await wait(page, 1500);
check('Title screen shows with no save', await page.getByRole('button', { name: /start a new game/i }).isVisible());
await page.screenshot({ path: `${OUT}/01-title.png` });
await page.keyboard.press('Enter'); // the first button has focus
await wait(page, 500);
check('Character creator opens', await page.getByRole('heading', { name: /create your ninja/i }).isVisible());
await page.getByRole('radio', { name: 'Boy', exact: true }).click();
const gearPick = (key, name) => page.locator(`[aria-labelledby="leg-${key}"]`).getByRole('radio', { name, exact: true }).click();
check('Ninja gear choices replace the general outfit', (await page.locator('[aria-labelledby="leg-gi"] [role=radio]').count()) === 8 && (await page.locator('[aria-labelledby="leg-outfit"]').count()) === 0);
await gearPick('gi', 'Crimson');
await gearPick('mask', 'Ninja hood');
await gearPick('headband', 'Gold');
await page.screenshot({ path: `${OUT}/02-customize.png` });
await page.getByRole('button', { name: /i'm ready/i }).click();
await wait(page, 600);
check('Sensei Rio introduces the dojo', /Sensei Rio/.test(await page.locator('.dialogue .name').textContent()));
await page.screenshot({ path: `${OUT}/03-sensei.png` });
await talkThrough(page);
let s = await st(page);
check('First challenge is the white belt, level 1', s.mode === 'play' && s.belt === 'white' && s.tier === 1, s.problem?.equation);
check('Hop controls have focus for keyboard play', await page.evaluate(() => document.activeElement?.classList.contains('land')));

// Land before hopping: a reminder, not a wrong answer
await page.keyboard.press('Space');
await wait(page, 300);
s = await st(page);
check('Landing before hopping is not counted as a miss', s.mode === 'play' && !s.talking);

// A wrong landing: one past the answer
await hop(page, [...s.worked, 1]);
await page.keyboard.press('Space');
await wait(page, 700);
check('Wrong landing gets Sensei feedback', (await st(page)).talking);
await page.screenshot({ path: `${OUT}/04-wrong.png` });
await talkThrough(page);
s = await st(page);
check('After a miss the ninja goes back to the start', s.stone === s.problem.start && s.hops.length === 0);
// Hint ladder
for (const rung of [1, 2, 3]) {
  await page.keyboard.press('h');
  await wait(page, 250);
  check(`Hint ${rung} shows`, (await page.locator('.hint-box').textContent()).includes(`Hint ${rung} of 3`));
}
await page.screenshot({ path: `${OUT}/05-hint3.png` });
await solve(page);
s = await st(page);
check('Answer after hints is accepted without a star', s.mode === 'result' && s.stars.white === 0);
await page.keyboard.press('Space');
await wait(page, 400);

// Earn the white belt with clean answers
let guard = 0;
let whiteTier = 1;
let whiteStars = 0;
while (!(await st(page)).earned.includes('white') && guard++ < 20) {
  s = await st(page);
  if (s.belt === 'white') {
    whiteTier = Math.max(whiteTier, s.tier);
    whiteStars = s.stars.white;
  }
  if (s.talking) {
    await talkThrough(page);
    continue;
  }
  if (s.mode === 'result') {
    await page.keyboard.press('Space');
    await wait(page, 400);
    continue;
  }
  await solve(page);
  if (guard === 3) await page.screenshot({ path: `${OUT}/06-clean.png` });
}
s = await st(page);
check('Five clean landings earn stars and raise the level', s.stars.white === 5 && whiteTier >= 2, `reached level ${whiteTier}, ${whiteStars} stars before the last landing`);
await page.screenshot({ path: `${OUT}/07-belt-talk.png` });
check('White belt earned after the talk-it-through question', s.earned.includes('white'));
// "Yes, on to Bamboo Creek"
await talkThrough(page);
await wait(page, 800);
s = await st(page);
check('Going on opens the yellow belt at Bamboo Creek', s.belt === 'yellow' && s.problem.kind === 'add', s.problem?.equation);
await page.screenshot({ path: `${OUT}/08-yellow.png` });

// ------------------------------------------------------------ reload keeps progress
await page.reload();
await wait(page, 1500);
await page.getByRole('button', { name: /^continue$/i }).click();
await wait(page, 900);
await talkThrough(page);
s = await st(page);
check('Reload keeps belts and the current belt', s.earned.includes('white') && s.belt === 'yellow');
check('Reload keeps the ninja gear', await page.evaluate(() => {
  const g = JSON.parse(localStorage.getItem('numberLineNinja.save')).gear;
  return g.gi === 'crimson' && g.mask === 'hood' && g.headband === 'gold';
}));

// Settings persist and reduced motion applies
await page.keyboard.press('Escape');
await wait(page, 300);
await page.getByRole('group', { name: /reduce motion/i }).getByRole('button', { name: 'On' }).click();
await page.getByRole('group', { name: /text size/i }).getByRole('button', { name: 'Large' }).click();
await page.keyboard.press('Escape');
await page.reload();
await wait(page, 1200);
check('Settings survive a reload', await page.evaluate(() => document.documentElement.dataset.reducedMotion === 'true' && document.documentElement.dataset.textSize === 'large'));
await page.getByRole('button', { name: /^continue$/i }).click();
await wait(page, 800);
await talkThrough(page);
await page.screenshot({ path: `${OUT}/09-large-text.png` });
await page.keyboard.press('m');
await wait(page, 200);
check('M mutes the sound', await page.evaluate(() => JSON.parse(localStorage.getItem('learningAdventures.settings')).muted === true));

// Grown-ups and belt scroll
await page.keyboard.press('g');
await wait(page, 300);
check('Grown-ups page opens with standards', (await page.locator('.modal').textContent()).includes('2.MD.6'));
await page.getByRole('tab', { name: /how it is going/i }).click();
await page.screenshot({ path: `${OUT}/10-grownups.png` });
check('Progress report lists the white belt as earned', (await page.locator('.progress-table').textContent()).includes('Earned'));
await page.keyboard.press('Escape');
await page.keyboard.press('b');
await wait(page, 300);
check('Belt scroll shows yellow open and orange locked', (await page.locator('.belt-row').nth(2).textContent()).includes('Locked'));
await page.keyboard.press('Escape');

// Click a stone to hop there (big hops first, then small ones)
s = await st(page);
const at = await page.evaluate((n) => window.__nln.stoneScreen(n), s.problem.target);
await page.mouse.click(at.x, at.y);
await idle(page);
s = await st(page);
check('Clicking a stone hops the ninja there', s.stone === s.problem.target, `${s.hops.join(' ')}`);
await ctx.close();

// ------------------------------------------------------------ touch on a phone
const phone = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 });
await phone.page.goto(URL);
await wait(phone.page, 1500);
await phone.page.getByRole('button', { name: /start a new game/i }).tap();
await wait(phone.page, 400);
await phone.page.getByRole('button', { name: /i'm ready/i }).tap();
await wait(phone.page, 500);
for (let i = 0; i < 30 && (await phone.page.locator('.dialogue').count()); i++) {
  await phone.page.locator('.dialogue').tap({ position: { x: 20, y: 20 } });
  await wait(phone.page, 150);
}
s = await st(phone.page);
for (const h of s.worked) {
  const sel = Math.abs(h) > 1 ? (h > 0 ? '.pad-btn.big >> nth=1' : '.pad-btn.big >> nth=0') : h > 0 ? '.pad-btn.one >> nth=1' : '.pad-btn.one >> nth=0';
  await phone.page.locator(sel).tap();
  await wait(phone.page, 40);
}
await idle(phone.page);
await phone.page.locator('.pad-btn.land').tap();
await wait(phone.page, 600);
check('Touch: hop buttons and Land work on a phone', (await st(phone.page)).mode === 'result');
await phone.page.screenshot({ path: `${OUT}/11-phone.png` });
const layout = await phone.page.evaluate(() => {
  const bad = [];
  if (document.documentElement.scrollWidth > window.innerWidth) bad.push('sideways scroll');
  document.querySelectorAll('.panel, .btn').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || el.closest('[hidden]')) return;
    if (r.left < -1 || r.right > window.innerWidth + 1 || r.bottom > window.innerHeight + 1) bad.push(`offscreen ${el.className}`);
  });
  const res = document.querySelector('.result')?.getBoundingClientRect();
  document.querySelectorAll('.toolbar .btn').forEach((b) => {
    const r = b.getBoundingClientRect();
    if (res && r.bottom > res.top && r.top < res.bottom && r.right > res.left && r.left < res.right) bad.push('toolbar covers the result');
  });
  return bad;
});
check('Phone layout: nothing off screen or covered', layout.length === 0, layout.join(', '));
// tap a stone
await phone.page.locator('.result button').tap();
await wait(phone.page, 500);
s = await st(phone.page);
const tp = await phone.page.evaluate((n) => window.__nln.stoneScreen(n), s.problem.target);
await phone.page.touchscreen.tap(tp.x, tp.y);
await idle(phone.page);
s = await st(phone.page);
check('Tapping a stone hops the ninja there', s.stone === s.problem.target);
await phone.ctx.close();

check('No console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
check('No requests to other sites (works offline, no trackers)', offsite.length === 0, offsite.slice(0, 3).join(' '));
writeFileSync(`${OUT}/report.json`, JSON.stringify({ results, errors, offsite }, null, 2));
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
