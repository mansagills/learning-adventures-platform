// Dev helper: screenshot tour of Multiplication Space Quest: title, the deck, a flight in each sector at every level (a miss, the hint picture, the answer), upgrades and the Star Map.
//   node scripts/msq-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/msq', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__msq.state());
const wait = (ms) => page.waitForTimeout(ms);
const skipTalk = async () => {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await wait(150);
  }
};
const until = async (fn, ms = 8000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (await fn(await st())) return true;
    await wait(100);
  }
  return false;
};
await page.goto(url);
await wait(1800);
await shot('01-title');
await page.getByRole('button', { name: /start a new game/i }).click();
await wait(500);
await shot('02-customize');
await page.getByRole('button', { name: /i'm ready/i }).click();
await wait(900);
await shot('03-opening');
await skipTalk();
await wait(500);
await shot('04-deck');
await page.evaluate(() => window.__msq.teleport(17.6, 15.6));
await wait(700);
await shot('05-ship');
await page.evaluate(() => window.__msq.teleport(5.6, 9));
await wait(700);
await shot('06-rafi');
for (const sector of (process.env.SECTORS ?? 'formations,engines,cargo,constellations').split(',')) {
  for (const tier of [1, 2, 3]) {
    await page.evaluate(([s, t]) => window.__msq.setTier(s, t), [sector, tier]);
    await page.evaluate((s) => window.__msq.launch(s), sector);
    await wait(400);
    await skipTalk();
    await until((s) => s.flight && s.flight.ready && !s.flight.between);
    await wait(300);
    const tag = `${sector}-t${tier}`;
    await shot(`${tag}-a`);
    let s = await st();
    await page.evaluate((i) => window.__msq.fire(i), s.flight.wrong[0]);
    await wait(900);
    await shot(`${tag}-wrong`);
    await page.keyboard.press('h');
    await wait(250);
    await page.keyboard.press('h');
    await wait(500);
    await shot(`${tag}-hint`);
    await page.keyboard.press('Escape');
    await wait(300);
    s = await st();
    await page.evaluate((i) => window.__msq.fire(i), s.flight.right);
    await wait(700);
    await shot(`${tag}-right`);
    s = await st();
    if (s.flight && s.flight.step === 1) {
      await until((x) => x.flight && x.flight.ready && !x.flight.between);
      await wait(300);
      await shot(`${tag}-step2`);
      s = await st();
      await page.evaluate((i) => window.__msq.fire(i), s.flight.right);
      await wait(700);
    }
    await page.evaluate(() => window.__msq.endFlight());
    await wait(400);
    await skipTalk();
    await wait(600);
  }
}
// the finale: the Bingo Boss, then the landing on the planet
await page.evaluate(() => window.__msq.finishAll());
await wait(500);
await shot('20-night-shift');
await page.evaluate(() => window.__msq.boss());
await until((s) => s.flight && s.flight.boss);
await wait(900);
await shot('21-boss');
let st0 = await st();
// a wrong square first, for the screenshot
const wrongIdx = [0, 1, 2, 3, 4, 5].find((i) => i !== st0.flight.boss.rightIndex && i !== 12);
await page.locator('.msq-square').nth(wrongIdx).click();
await wait(500);
await shot('22-boss-wrong');
await page.keyboard.press('h');
await wait(200);
await page.keyboard.press('h');
await wait(400);
await shot('23-boss-hint');
for (let i = 0; i < 26; i++) {
  const s = await st();
  if (!s.flight || !s.flight.boss || s.flight.boss.won) break;
  await page.evaluate(() => window.__msq.pickRight());
  await wait(1400);
  if (i === 5) await shot('24-boss-marked');
}
await wait(800);
await shot('25-bingo');
await until((s) => s.mode === 'landing', 8000);
await wait(1500);
await shot('26-landing');
for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
  await page.keyboard.press('Space');
  await wait(200);
  if (i === 6) await shot('27-landing-talk');
}
await wait(800);
await shot('28-deck-after');
// Meteor Run
await page.evaluate(() => window.__msq.meteor());
await until((s) => s.flight && s.flight.ready);
await wait(500);
await shot('29-meteor');
st0 = await st();
await page.keyboard.press(String(st0.flight.right + 1));
await wait(900);
await page.evaluate(() => window.__msq.setTime(0.5));
await wait(1500);
await shot('30-meteor-end');
for (let i = 0; i < 20 && (await page.locator('.dialogue').count()); i++) {
  await page.keyboard.press('Space');
  await wait(200);
}
await page.evaluate(() => window.__msq.addDust(80));
await page.keyboard.press('j');
await wait(400);
await shot('21-missions');
await page.getByRole('button', { name: 'Upgrade bay' }).click();
await wait(400);
await shot('22-upgrades');
await page.keyboard.press('Escape');
await wait(300);
await page.keyboard.press('j');
await wait(300);
await page.getByRole('button', { name: 'The Star Map' }).click();
await wait(400);
await shot('23-starmap');
await page.keyboard.press('Escape');
await wait(300);
await browser.close();
