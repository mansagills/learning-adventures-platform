// Dev helper: screenshot tour of Math Race Rally.
//   node scripts/rr-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/rr', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__rr.state());
const wait = (ms) => page.waitForTimeout(ms);
await page.goto(url);
await wait(1500);
await shot('01-title');
await page.getByRole('button', { name: /start a new game/i }).click();
await wait(800);
await shot('02-intro');
for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
  await page.keyboard.press('Space');
  await wait(150);
}
await wait(900);
await shot('03-countdown');
await wait(2000);
await shot('04-race-start');
// race: answer by driving to the right lane (one wrong on purpose)
let shots = 0;
for (let i = 0; i < 400; i++) {
  const s = await st();
  if (s.race && s.race.playerDone) break;
  if (s.race && s.race.problem) {
    const p = s.race.problem;
    const wrongOnPurpose = s.race.q === 2;
    const lane = p.choices.findIndex((c) => (wrongOnPurpose ? !c.correct : c.correct));
    await page.keyboard.press(String(lane + 1));
    const dist = s.race.gateS - s.player.s;
    if (shots === 0 && dist < 25 && dist > 5) {
      await shot('05-gate-near');
      shots++;
    }
    if (s.race.q === 3 && shots === 1) {
      await shot('06-after-miss');
      shots++;
    }
  }
  if (i === 20) await page.evaluate(() => window.__rr.setTimeScale(3));
  await wait(120);
}
await page.evaluate(() => window.__rr.setTimeScale(1));
await wait(1800);
await shot('07-results');
console.log(JSON.stringify((await st()).race));
await page.getByRole('button', { name: /pit stop/i }).click();
await wait(500);
await shot('08-pit');
// play the memory match: find pairs by flipping
const n = await page.locator('.rr-card').count();
const faces = [];
for (let i = 0; i < n; i++) faces.push(await page.locator('.rr-card').nth(i).locator('.rr-card-face').textContent());
const solveFace = (f) => {
  const m = f.match(/^(\d+) ([+−]) (\d+)$/);
  if (!m) return null;
  return String(m[2] === '+' ? Number(m[1]) + Number(m[3]) : Number(m[1]) - Number(m[3]));
};
// one miss first
await page.locator('.rr-card').nth(0).click();
const wrongIdx = faces.findIndex((f, i) => i > 0 && f !== solveFace(faces[0]) && solveFace(f) === null && solveFace(faces[0]) !== null ? false : i > 0 && f !== solveFace(faces[0]) && faces[0] !== solveFace(f));
await page.locator('.rr-card').nth(wrongIdx > 0 ? wrongIdx : 1).click();
await wait(300);
await shot('09-pit-miss');
await wait(1100);
const used = new Set();
for (let i = 0; i < n; i++) {
  if (used.has(i)) continue;
  const a = solveFace(faces[i]);
  const j = faces.findIndex((f, k) => k !== i && !used.has(k) && (a !== null ? f === a : solveFace(f) === faces[i]));
  if (j < 0) continue;
  used.add(i).add(j);
  await page.locator('.rr-card').nth(i).click();
  await page.locator('.rr-card').nth(j).click();
  await wait(250);
}
await wait(400);
await shot('10-pit-done');
await page.getByRole('button', { name: /garage/i }).click();
await wait(400);
await page.evaluate(() => window.__rr.setBolts(200));
await page.getByRole('tab', { name: 'Car type' }).click();
await wait(300);
await shot('11-garage');
for (const id of ['roadster', 'blue', 'flames', 'goldrims', 'wing']) {
  const tabFor = { roadster: 'Car type', blue: 'Paint', flames: 'Style', goldrims: 'Wheels', wing: 'Spoiler' }[id];
  await page.getByRole('tab', { name: tabFor }).click();
  await page.locator(`[data-buy="${id}"]`).click();
  await wait(150);
}
await shot('12-garage-bought');
await page.getByRole('button', { name: 'Next race' }).click();
await wait(400);
await shot('13-tracks');
await page.evaluate(() => window.__rr.setWins(5));
console.log(JSON.stringify(await st()).slice(0, 300));
await browser.close();
