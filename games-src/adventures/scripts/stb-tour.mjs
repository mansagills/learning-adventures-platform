// Dev helper: screenshot tour of Shape Town Builders (geometry-builder-challenge).
//   node scripts/stb-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/stb', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__stb.state());
const wait = (ms) => page.waitForTimeout(ms);
const skipTalk = async () => {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) await opt.last().click();
    else await page.keyboard.press('Space');
    await wait(150);
  }
};
await page.goto(url);
await wait(1500);
await shot('01-title');
await page.getByRole('button', { name: /start a new game/i }).click();
await wait(400);
await page.getByRole('button', { name: /i'm ready/i }).click();
await wait(900);
await shot('02-opening');
await skipTalk();
await wait(400);
await shot('03-yard');
for (const station of ['arcade', 'blocks']) {
  for (const tier of [1, 2, 3]) {
    if (phone && tier !== 2) continue;
    await page.evaluate(([s, t]) => window.__stb.setTier(s, t), [station, tier]);
    await page.evaluate((s) => window.__stb.open(s), station);
    await wait(500);
    await skipTalk();
    await wait(700);
    await shot(`${station}-t${tier}-a`);
    const s = await st();
    const wrong = s.panel.problem.choices.find((c) => !c.correct);
    await page.locator(`.st-choice[data-value="${wrong.value}"]`).click();
    await wait(300);
    await page.keyboard.press('h');
    await wait(150);
    await page.keyboard.press('h');
    await wait(400);
    await shot(`${station}-t${tier}-hint`);
    await page.locator(`.st-choice[data-value="${s.panel.right}"]`).click();
    await wait(600);
    await shot(`${station}-t${tier}-done`);
    await page.keyboard.press('Escape');
    await wait(300);
  }
}
await page.evaluate(() => window.__stb.rush());
await wait(500);
await shot('rush-intro');
await page.getByRole('button', { name: 'Go!' }).click();
await wait(600);
for (let i = 0; i < 4; i++) {
  const s = await st();
  await page.locator(`.st-choices.bins .st-choice[data-value="${s.rush.right}"]`).click();
  await wait(450);
}
await shot('rush-play');
await page.evaluate(() => window.__stb.endRush());
await wait(500);
await shot('rush-end');
await page.keyboard.press('Escape');
await wait(300);
await page.evaluate(() => window.__stb.teleport(23.5, 14.5));
await wait(600);
await shot('right-side');
await page.evaluate(() => window.__stb.teleport(12.5, 21.5));
await wait(600);
await shot('left-bottom');
await browser.close();
