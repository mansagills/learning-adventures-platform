// Browser check for Multiplication Space Quest (half 1): plays a new game
// from the title screen with real clicks and keys. It walks the station deck
// to Pilot Mei, flies the Formations mission (steering with the arrow keys and
// beaming with Space, keys 1-3 and mouse clicks; a wrong rock, the hints that
// pause the flight), clears the sector and its debrief, flies the Engines
// mission with its two-step shortcut questions, gets towed home when the
// shield runs out, buys an upgrade and a paint job, opens the Star Map, the
// mission list and the grown-ups report, reloads, and checks the phone layout.
//
//   npm run build && (cd ../../public/games/play && python3 -m http.server 8811 &)
//   node scripts/e2e-multiplication-space-quest.mjs [url]
//
// Writes test-output/msq-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:8811/multiplication-space-quest/index.html';
const OUT = 'test-output/msq-e2e';
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
const st = (page) => page.evaluate(() => window.__msq.state());
const info = (page) => page.evaluate(() => window.__msq.flightInfo());
const wait = (page, ms) => page.waitForTimeout(ms);
/** Click through the talk box; for a question, pick the first option still enabled. */
async function talkThrough(page, pick = null) {
  for (let i = 0; i < 60 && (await page.locator('.dialogue').count()); i++) {
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) {
      const want = pick ? opt.filter({ hasText: pick }) : opt;
      await ((await want.count()) ? want.first() : opt.first()).click();
    } else await page.keyboard.press('Space');
    await wait(page, 160);
  }
  await wait(page, 250);
}
async function waitFor(page, fn, ms = 10000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await fn()) return true;
    await wait(page, 100);
  }
  return false;
}
/** Wait until the answer lands: the question number or the step changes. */
async function answered(page, before) {
  return waitFor(page, async () => {
    const s = await st(page);
    return !s.flight || s.flight.q !== before.q || s.flight.step !== before.step || s.talking;
  }, 5000);
}
const ready = (page) => waitFor(page, async () => {
  const s = await st(page);
  return !!s.flight && s.flight.ready && !s.flight.between && !s.talking;
});
/** Steer the ship under rock `i` with the arrow keys, then press Space. */
async function steerAndBeam(page, i) {
  for (let k = 0; k < 60; k++) {
    const f = await info(page);
    const dx = f.rocks[i].x - f.shipX;
    if (Math.abs(dx) < 6) break;
    const key = dx > 0 ? 'ArrowRight' : 'ArrowLeft';
    await page.keyboard.down(key);
    await wait(page, Math.min(160, Math.max(30, Math.abs(dx) * 3)));
    await page.keyboard.up(key);
  }
  await page.keyboard.press('Space');
  await wait(page, 500);
}
/** Answer whatever is asked, right first time, until the flight ends (by number key). */
async function flyClean(page, maxQ = 12) {
  for (let q = 0; q < maxQ; q++) {
    const ok = await ready(page);
    const s = await st(page);
    if (!s.flight) return;
    if (!ok) break;
    await page.keyboard.press(String(s.flight.right + 1));
    await wait(page, 700);
  }
  await waitFor(page, async () => (await st(page)).talking || (await st(page)).mode === 'deck', 6000);
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1500);
  check('title screen shows', await page.getByRole('heading', { name: /multiplication space quest/i }).isVisible());
  await page.screenshot({ path: `${OUT}/01-title.png` });
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  check('customize screen calls the player a pilot', (await page.locator('body').innerText()).toLowerCase().includes('pilot'));
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await wait(page, 700);
  check('Commander Ayo opens the game', (await page.locator('.dialogue').innerText()).includes('Commander Ayo'));
  await talkThrough(page);
  let s = await st(page);
  check('the opening ends on the deck', s.mode === 'deck' && !s.talking, s.mode);

  // walk on the deck with the arrow keys, then click Pilot Mei
  const before = s.player;
  await page.keyboard.down('ArrowDown');
  await wait(page, 500);
  await page.keyboard.up('ArrowDown');
  s = await st(page);
  check('arrow keys walk the player on the deck', s.player.y > before.y + 0.5, `${before.y.toFixed(2)} -> ${s.player.y.toFixed(2)}`);
  await page.screenshot({ path: `${OUT}/02-deck.png` });
  const mei = await page.evaluate(() => window.__msq.screenOf('mei'));
  await page.mouse.click(mei.x, mei.y - 20);
  check('clicking Pilot Mei walks there and Mei talks', await waitFor(page, async () => (await st(page)).talking, 8000));
  await talkThrough(page, 'Launch');
  check('the Formations flight starts', await ready(page));
  s = await st(page);
  check('the first flight is level 1 Formations', s.flight.sector === 'formations' && s.flight.tier === 1, `${s.flight.sector} ${s.flight.tier}`);
  const f0 = await info(page);
  check('the flight shows three rocks and the stranded ships', f0.rocks.length === 3 && f0.supplies > 0, `${f0.rocks.length} rocks, ${f0.supplies} ships`);
  await page.screenshot({ path: `${OUT}/03-flight.png` });

  // question 1: steer with the arrow keys and beam with Space
  const first = s.flight;
  await steerAndBeam(page, s.flight.right);
  await answered(page, first);
  s = await st(page);
  check('steering under the right rock and pressing Space answers it', s.stars.formations === 1 && s.flight.stars === 1, JSON.stringify(s.stars));
  check('rescued ships join the fleet', s.fleet > 0, String(s.fleet));
  check('the fact lights up on the Star Map', s.starMap >= 1);

  // question 2: a wrong rock (key), a reason, hints that pause the flight, then a mouse click on the right rock
  await ready(page);
  s = await st(page);
  await page.keyboard.press(String(s.flight.wrong[0] + 1));
  await waitFor(page, async () => (await page.locator('.msq-rock.nope').count()) === 1, 4000);
  await wait(page, 200);
  const note = await page.locator('.msq-note').innerText();
  check('a wrong rock gets a sentence about the mistake', note.length > 15, note);
  check('the wrong rock is crossed out', (await page.locator('.msq-rock.nope').count()) === 1);
  await page.screenshot({ path: `${OUT}/04-wrong.png` });
  await page.keyboard.press('h');
  await wait(page, 300);
  check('H opens a hint and pauses the flight', (await page.locator('.msq-hint').count()) === 1 && (await info(page)).paused);
  await page.keyboard.press('h');
  await wait(page, 300);
  check('rung 2 shows a picture', (await page.locator('.msq-hint .msq-dots, .msq-hint .msq-groups').count()) > 0);
  await page.screenshot({ path: `${OUT}/05-hint.png` });
  await page.keyboard.press('h');
  await wait(page, 300);
  check('rung 3 outlines the right rock', (await page.locator('.msq-rock.worked').count()) === 1);
  await page.keyboard.press('Space');
  await wait(page, 300);
  check('Space closes the hint and the flight goes on', (await page.locator('.msq-hint').count()) === 0 && !(await info(page)).paused);
  s = await st(page);
  await page.locator(`.msq-rock >> nth=${s.flight.right}`).click();
  await answered(page, s.flight);
  s = await st(page);
  check('clicking the right rock answers it; no star after a miss', s.stars.formations === 1 && s.flight.q === 2, `stars ${s.stars.formations}, q ${s.flight.q}`);

  // the rest of the flight, right first time with keys 1-3, up to the Static core
  let sawCore = false;
  for (let q = 0; q < 10; q++) {
    if (!(await ready(page))) break;
    s = await st(page);
    if (!s.flight) break;
    if (s.flight.q === 7) {
      sawCore = true;
      await page.screenshot({ path: `${OUT}/06-core.png` });
    }
    await page.keyboard.press(String(s.flight.right + 1));
    await answered(page, s.flight);
  }
  check('the last question has the Static core', sawCore);
  check('the flight ends with the chief’s report', await waitFor(page, async () => (await st(page)).talking, 6000));
  await talkThrough(page, 'Yes. Same ships');
  s = await st(page);
  check('five stars and level 2 clear the Formations sector (with its debrief)', s.done.includes('formations') && s.mode === 'deck', JSON.stringify({ done: s.done, stars: s.stars }));
  check('stardust is earned', s.dust > 20, String(s.dust));
  await page.screenshot({ path: `${OUT}/07-cleared.png` });

  // Engines at level 2: two-step shortcut questions
  await page.evaluate(() => window.__msq.setTier('engines', 2));
  await page.evaluate(() => window.__msq.launch('engines'));
  await wait(page, 400);
  await talkThrough(page);
  await ready(page);
  s = await st(page);
  check('Engines level 2 asks for the shortcut first', s.flight.sector === 'engines' && s.flight.kind === 'shortcut' && s.flight.step === 0, `${s.flight.kind} step ${s.flight.step}`);
  await page.screenshot({ path: `${OUT}/08-shortcut.png` });
  await page.keyboard.press(String(s.flight.right + 1));
  await answered(page, s.flight);
  await ready(page);
  s = await st(page);
  check('then the answer, with new rocks', s.flight.step === 1 && s.flight.q === 0, `step ${s.flight.step}`);
  await page.keyboard.press(String(s.flight.right + 1));
  await waitFor(page, async () => (await st(page)).flight?.q === 1, 4000);
  s = await st(page);
  check('both steps right first time win a star', s.stars.engines === 1 && s.flight.q === 1, JSON.stringify(s.stars));

  // bumps: the shield runs out and the tow beam brings the ship home with what it earned
  const fleetBefore = s.fleet;
  for (let i = 0; i < 3; i++) await page.evaluate(() => window.__msq.bump());
  await wait(page, 600);
  check('an empty shield tows the ship home', (await page.locator('.dialogue').innerText()).toLowerCase().includes('tow'));
  await talkThrough(page);
  s = await st(page);
  check('back on the deck, stars and ships are kept', s.mode === 'deck' && s.stars.engines === 1 && s.fleet === fleetBefore, `${s.mode} ${s.stars.engines} ${s.fleet}`);

  // Rafi's upgrade bay
  await page.evaluate(() => window.__msq.addDust(60));
  await page.evaluate(() => window.__msq.teleport(5.5, 9));
  await wait(page, 400);
  await page.keyboard.press('Space');
  await wait(page, 500);
  await talkThrough(page, 'Upgrade bay');
  check('Rafi opens the upgrade bay', (await page.locator('.msq-bay').count()) === 1);
  const dust0 = (await st(page)).dust;
  await page.locator('.msq-bay .belt-row', { hasText: 'Twin blaster' }).getByRole('button', { name: 'Buy' }).click();
  await wait(page, 200);
  await page.locator('.msq-paint', { hasText: '15 stardust' }).first().click();
  await wait(page, 200);
  s = await st(page);
  check('buying an upgrade and a paint job spends stardust', s.upgrades.includes('twin') && s.paint !== 'teal' && s.dust === dust0 - 45, JSON.stringify({ up: s.upgrades, paint: s.paint, dust: s.dust }));
  await page.screenshot({ path: `${OUT}/09-upgrades.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // the mission list and the Star Map
  await page.keyboard.press('j');
  await wait(page, 300);
  check('J opens the missions, with Cargo and Constellations still to come', (await page.locator('.belt-row.soon').count()) === 2);
  await page.getByRole('button', { name: 'The Star Map' }).click();
  await wait(page, 300);
  const lit = await page.locator('.msq-map-cell.lit').count();
  check('the Star Map shows the facts learned', lit >= 2, `${lit} cells lit`);
  await page.screenshot({ path: `${OUT}/10-starmap.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // the grown-ups report
  await page.keyboard.press('g');
  await wait(page, 400);
  await page.getByRole('tab', { name: /how it is going/i }).click();
  await wait(page, 200);
  const rows = await page.locator('.progress-table tbody tr').count();
  check('grown-ups report has a row per sector', rows === 2, String(rows));
  await page.screenshot({ path: `${OUT}/11-grownups.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // a flight with the twin blaster: frame rate on this machine's software rendering
  await page.evaluate(() => window.__msq.launch('formations'));
  await wait(page, 400);
  await talkThrough(page);
  await ready(page);
  const fps = await page.evaluate(
    () =>
      new Promise((res) => {
        let n = 0;
        const t0 = performance.now();
        const tick = () => {
          n++;
          if (performance.now() - t0 < 2000) requestAnimationFrame(tick);
          else res(Math.round((n * 1000) / (performance.now() - t0)));
        };
        requestAnimationFrame(tick);
      }),
  );
  check('the flight runs at 30 frames a second or more', fps >= 30, `${fps} fps`);
  await page.screenshot({ path: `${OUT}/12-twin.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.getByRole('button', { name: /fly home/i }).click();
  await wait(page, 600);
  await talkThrough(page);

  // reload: progress is kept
  await page.reload();
  await wait(page, 1300);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 500);
  s = await st(page);
  check('a saved game continues with the sector, upgrade and paint', s.done.includes('formations') && s.upgrades.includes('twin') && s.paint !== 'teal' && s.starMap >= 1);

  // phone layout
  const { page: ph } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ph.goto(URL);
  await wait(ph, 1300);
  await ph.getByRole('button', { name: /start a new game/i }).tap();
  await wait(ph, 400);
  await ph.getByRole('button', { name: /i'm ready/i }).tap();
  await wait(ph, 800);
  await talkThrough(ph);
  await ph.screenshot({ path: `${OUT}/13-phone-deck.png` });
  await ph.evaluate(() => window.__msq.setTier('formations', 3));
  await ph.evaluate(() => window.__msq.launch('formations'));
  await wait(ph, 500);
  await talkThrough(ph);
  await ready(ph);
  const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
  check('phone: no sideways scrolling', sw <= 390, `scrollWidth ${sw}`);
  const boxes = await ph.locator('.msq-rock').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ l: r.left, r: r.right, t: r.top, b: r.bottom })));
  check('phone: all three rocks are on screen and big enough to tap', boxes.length === 3 && boxes.every((b) => b.l >= 0 && b.r <= 390 && b.r - b.l >= 44 && b.b - b.t >= 44), JSON.stringify(boxes.map((b) => [Math.round(b.l), Math.round(b.r)])));
  const banner = await ph.locator('.msq-banner').boundingBox();
  const status = await ph.locator('.msq-status').boundingBox();
  check('phone: the banner and status row fit, above the rocks', banner.x >= 0 && banner.x + banner.width <= 390 && status.y + status.height < Math.min(...boxes.map((b) => b.t)), JSON.stringify({ banner, status }));
  s = await st(ph);
  await ph.locator(`.msq-rock >> nth=${s.flight.right}`).tap();
  await answered(ph, s.flight);
  s = await st(ph);
  check('phone: tapping the right rock answers it', s.flight && (s.flight.step === 1 || s.flight.q === 1), JSON.stringify(s.flight && { q: s.flight.q, step: s.flight.step }));
  await ph.screenshot({ path: `${OUT}/14-phone-flight.png` });
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
