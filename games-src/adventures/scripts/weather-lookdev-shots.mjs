// Screenshots of the Weather Wizard Battle look development pages (the cast
// and powers, the five regions side on, and the playable test level), plus a
// check that the test level can be finished with the keyboard alone.
// Needs `npx vite --port 5179` running.
//   node scripts/weather-lookdev-shots.mjs [base] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/lookdev/', out = 'test-output/weather-lookdev'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
let errors = 0;
let failed = 0;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed++;
};
async function open(name, query, vp) {
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: vp[2] ?? 1 });
  page.on('console', (m) => m.type() === 'error' && (errors++, console.log('[console]', name, m.text())));
  page.on('pageerror', (e) => (errors++, console.log('[pageerror]', name, e.message)));
  await page.goto(base + query);
  return page;
}
async function shot(name, query, vp, opts = {}) {
  const page = await open(name, query, vp);
  await page.waitForTimeout(opts.wait ?? 1500);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: !!opts.full });
  await page.close();
}
const only = process.env.ONLY?.split(',');
const want = (n) => !only || only.includes(n);
if (want('cast')) {
  await shot('cast', '#weather-cast', [1440, 900], { full: true, wait: 3000 });
  await shot('cast-phone', '#weather-cast', [390, 844, 2], { full: true, wait: 3000 });
}
for (const r of ['shore', 'clouds', 'mountain', 'river', 'storm']) if (want(r)) await shot(r, `#weather-${r}`, [1280, 800], { wait: 2000 });
if (want('shore-storm')) await shot('shore-storm', '#weather-shore-storm', [1280, 800], { wait: 2000 });

if (want('play')) {
  const page = await open('play', '#weather-play', [1280, 800]);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/play-start.png` });
  const st = () => page.evaluate(() => window.__ww.state());
  const body = () => page.evaluate(() => ({ x: window.__ww.body.x, y: window.__ww.body.y, g: window.__ww.body.onGround, on: window.__ww.body.standingOn }));
  const hold = async (key, ms) => {
    await page.keyboard.down(key);
    await page.waitForTimeout(ms);
    await page.keyboard.up(key);
  };
  /** Run right until x passes `x` (jumping when blocked), up to `ms`. */
  const runTo = async (x, ms = 8000, jumpAt = []) => {
    await page.keyboard.down('ArrowRight');
    const t0 = Date.now();
    let jumps = [...jumpAt];
    while (Date.now() - t0 < ms) {
      const b = await body();
      if (b.x >= x) break;
      if (jumps.length && b.x >= jumps[0] && b.g) {
        jumps.shift();
        await page.keyboard.down('Space');
        await page.waitForTimeout(260);
        await page.keyboard.up('Space');
      }
      await page.waitForTimeout(16);
    }
    await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(200);
    return body();
  };
  let b = await runTo(5.2, 3000);
  check((await st()).carried >= 2, 'collects the first droplets');
  b = await runTo(11, 6000, [5.6, 10.2]);
  check(b.x > 10, 'jumps up the step and runs on');
  b = await runTo(16, 4000, [10.4]);
  check((await st()).falls === 0 && b.x > 15, 'jumps the small gap');
  check((await st()).respawn.x === 17 || (await runTo(17.6, 2000)).x > 17, 'reaches the first weather vane');
  await page.screenshot({ path: `${out}/play-ledges.png` });
  b = await runTo(31.2, 9000, [23.8]);
  // the crab may bump us back; keep going
  for (let i = 0; i < 3 && b.x < 31; i++) b = await runTo(31.2, 6000, [b.x + 0.3]);
  check(b.x >= 31, 'gets past the crab to the tide pool');
  await page.keyboard.press('Digit2');
  await page.waitForTimeout(200);
  check((await st()).cloud === null, 'cool air alone makes no cloud (no vapor yet)');
  await page.keyboard.press('Digit1');
  await page.waitForTimeout(300);
  check((await st()).vapor, 'the Sun makes vapor from the tide pool');
  await page.screenshot({ path: `${out}/play-vapor.png` });
  await page.keyboard.press('Digit2');
  await page.waitForTimeout(300);
  check((await st()).cloud !== null, 'cool air turns the vapor into a cloud');
  // jump onto the cloud
  await page.keyboard.down('Space');
  await page.waitForTimeout(300);
  await page.keyboard.up('Space');
  await page.waitForTimeout(700);
  b = await body();
  check(b.on === 'cloud', 'stands on the cloud');
  await page.screenshot({ path: `${out}/play-cloud.png` });
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Digit3');
    await page.waitForTimeout(2300);
    if ((await st()).cloud.x >= 42.9) break;
  }
  check((await st()).cloud.x >= 42.9, 'the wind pushes the cloud across the sea');
  b = await body();
  check(b.on === 'cloud', 'rides the cloud across');
  b = await runTo(48.6, 4000, [44.6]);
  check((await st()).falls === 0 && b.x > 47, 'jumps off the cloud onto the far shore');
  await page.keyboard.press('Digit4');
  await page.waitForTimeout(200);
  b = await runTo(59.6, 8000, [51.2, 54.2]);
  check(b.x > 59, 'climbs the mountain steps and comes down');
  await page.keyboard.press('Digit4');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/play-frozen.png` });
  b = await runTo(72.6, 8000);
  check((await st()).falls === 0 && b.x > 72, 'walks across the frozen river');
  b = await runTo(74.6, 3000);
  check(b.x < 74.7, 'the ice wall blocks the way');
  await page.keyboard.press('Digit1');
  await page.waitForTimeout(2200);
  check((await st()).iceGone, 'the Sun melts the ice wall');
  b = await runTo(90, 12000, [79.4, 84.4]);
  for (let i = 0; i < 3 && !(await st()).done; i++) b = await runTo(90, 6000, [b.x + 0.3]);
  const s = await st();
  check(s.done, `reaches the flag (droplets ${s.carried}/${s.total}, falls ${s.falls})`);
  await page.screenshot({ path: `${out}/play-done.png` });
  // a fall into the water goes back to the vane and drops droplets
  await page.click('.ww-done button');
  await page.waitForTimeout(300);
  await page.evaluate(() => window.__ww.teleport(12, 8));
  await page.waitForTimeout(800);
  const f = await st();
  check(f.falls === 1, 'falling in the water counts a fall and goes back to the start');
  await page.close();
  const phone = await open('play-phone', '#weather-play', [844, 390, 2]);
  await phone.waitForTimeout(1500);
  await phone.screenshot({ path: `${out}/play-phone.png` });
  const sideways = await phone.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(!sideways, 'no sideways scrolling on a phone held sideways');
  await phone.close();
}
await browser.close();
console.log(errors ? `${errors} errors` : 'no errors');
console.log(failed ? `${failed} checks failed` : 'all checks passed');
process.exit(errors || failed ? 1 : 0);
