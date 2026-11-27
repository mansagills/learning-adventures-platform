// Screenshots of the Rock Cycle Racing look preview (the cast, the canyon by
// day, at dusk and at night, the race map, and the test track), at desktop
// and phone width, with checks that each page loads without errors, makes
// no requests to other websites, and has no sideways scroll. Then it plays
// the test track with the keyboard twice: once to the granite finish (stay
// deep) and once to the basalt finish (erupt), answering the gate question.
// Needs `npx vite --port 5179` running.
//   node scripts/rcr-lookdev-shots.mjs [base] [outDir]
// Set CHROMIUM to a Chromium executable if it is not at /opt/pw-browsers/chromium.
// ONLY=cast,canyon,map,play,race picks parts.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/lookdev/rocks/', out = 'test-output/rcr-lookdev'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
let failed = 0;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed++;
};
const origin = new URL(base).origin;
const only = process.env.ONLY?.split(',');
const want = (part) => !only || only.includes(part);

async function open(hash, vp) {
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: vp[2] ?? 1 });
  const errors = [];
  const outside = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => !r.url().startsWith(origin) && !r.url().startsWith('data:') && !r.url().startsWith('blob:') && outside.push(r.url()));
  await page.goto(base + hash);
  await page.waitForFunction(() => window.__rocks?.ready, null, { timeout: 60000 });
  return { page, errors, outside };
}

async function finishChecks(name, { page, errors, outside }) {
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(errors.length === 0, `${name}: no errors${errors.length ? ' (' + errors.join(' | ') + ')' : ''}`);
  check(outside.length === 0, `${name}: no requests to other websites${outside.length ? ' (' + outside.join(', ') + ')' : ''}`);
  check(sw <= 0, `${name}: no sideways scrolling`);
  await page.close();
}

async function shot(name, hash, vp, wait = 4000) {
  const o = await open(hash, vp);
  await o.page.waitForTimeout(wait);
  await o.page.screenshot({ path: `${out}/${name}.png` });
  await finishChecks(name, o);
}

const pages = [
  ['cast', '#cast', 'cast'],
  ['canyon', '#canyon', 'canyon'],
  ['canyon-dusk', '#canyon-dusk', 'canyon'],
  ['canyon-night', '#canyon-night', 'canyon'],
  ['map', '#map', 'map'],
  ['play-intro', '#play', 'play'],
];
for (const [name, hash, part] of pages) {
  if (!want(part)) continue;
  await shot(name, hash, [1280, 800]);
  await shot(`${name}-phone`, hash, [390, 844, 2]);
}

/** Play the test track with the keyboard, steering toward one side of the fork. */
async function race(name, hash, side, expectRock, vp = [1280, 800]) {
  const o = await open(hash, vp);
  const { page } = o;
  await page.waitForFunction(() => window.__rcr?.ready, null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.keyboard.press('Enter'); // the Start button has focus
  await page.keyboard.down('ArrowUp');
  const shots = new Set();
  const snap = async (label) => {
    if (shots.has(label)) return;
    shots.add(label);
    await page.screenshot({ path: `${out}/${name}-${label}.png` });
  };
  const started = Date.now();
  let held = null;
  let answered = false;
  let state = null;
  while (Date.now() - started < 240000) {
    state = await page.evaluate(() => {
      const d = window.__rcr;
      return { phase: d.phase, path: d.path, s: d.s, x: d.x, forkAhead: d.forkAhead, targets: d.forkTargets, finished: d.finished, orderMet: d.orderMet, stars: d.stars, fps: d.fps, place: d.place };
    });
    if (state.phase === 'race' && state.path === 'vent' && state.s > 10) await snap('vent');
    if (state.phase === 'question' && !answered) {
      await snap('question');
      // A wrong answer first (to see the kind fix), then the right one with the keyboard.
      await page.keyboard.press('2');
      await page.waitForTimeout(400);
      await snap('question-fix');
      await page.keyboard.press('1');
      answered = true;
      await page.waitForTimeout(1500);
      continue;
    }
    if (state.finished) break;
    // Steer toward the chosen side as the fork comes up, then keep to the middle.
    const goal = state.path === 'vent' ? (state.forkAhead !== null && state.forkAhead < 40 ? state.targets[side] : 0) : 0;
    const key = state.x < goal - 0.5 ? 'ArrowRight' : state.x > goal + 0.5 ? 'ArrowLeft' : null;
    if (key !== held) {
      if (held) await page.keyboard.up(held);
      if (key) await page.keyboard.down(key);
      held = key;
    }
    if (state.path === 'vent' && state.forkAhead !== null && state.forkAhead < 22) await snap('fork');
    if (state.path === side && state.s > 30) await snap('after-fork');
    if (state.path === 'erupt' && state.s > 160) await snap('lava-flow');
    await page.waitForTimeout(80);
  }
  if (held) await page.keyboard.up(held);
  await page.keyboard.up('ArrowUp');
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${out}/${name}-finish.png` });
  console.log(`     ${name}: ${state?.fps ?? '?'} frames a second in this test browser (software drawing, so slower than a real device)`);
  check(state?.finished === expectRock, `${name}: finishes as ${expectRock} (got ${state?.finished})`);
  check(state?.orderMet === true, `${name}: meets the Order Card`);
  check(state?.stars === 0, `${name}: a wrong first answer earns no Cycle Star`);
  const panel = await page.locator('.rcr-finish').count();
  check(panel === 1, `${name}: shows the finish card`);
  await finishChecks(name, o);
}

if (want('race')) {
  await race('race-granite', '#play', 'deep', 'granite');
  await race('race-basalt', '#play-basalt', 'erupt', 'basalt');
}

await browser.close();
console.log(failed ? `${failed} checks failed` : 'all checks passed');
process.exit(failed ? 1 : 0);
