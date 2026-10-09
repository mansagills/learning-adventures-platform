// Dev helper: screenshot tour of Forum Fraction Feast (half 1: the bakery and the milestone road).
//   node scripts/fff-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/fff', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__fff.state());
const wait = (ms) => page.waitForTimeout(ms);
const skipTalk = async () => {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await wait(150);
  }
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
await wait(400);
await shot('04-forum');
await page.evaluate(() => window.__fff.teleport(6.5, 15.6));
await wait(600);
await shot('05-bakery-area');
await page.evaluate(() => window.__fff.teleport(13, 17));
await wait(600);
await shot('06-road-area');
await page.evaluate(() => window.__fff.skipParty());
for (const station of ['bakery', 'road']) {
  for (const tier of [1, 2, 3]) {
    for (let rep = 0; rep < (station === 'bakery' ? 2 : 2); rep++) {
      await page.evaluate(([s, t]) => window.__fff.setTier(s, t), [station, tier]);
      await page.evaluate((s) => window.__fff.open(s), station);
      await wait(500);
      await skipTalk();
      await wait(400);
      const tag = `${station}-t${tier}-${rep}`;
      await shot(`${tag}-a`);
      const s = await st();
      const p = s.panel.problem;
      const wrong = p.choices.find((c) => !c.correct);
      await page.locator(`[data-value="${wrong.value}"]`).click();
      await wait(300);
      await shot(`${tag}-wrong`);
      await page.keyboard.press('h');
      await wait(150);
      await page.keyboard.press('h');
      await wait(400);
      await shot(`${tag}-hint`);
      await page.locator(`[data-value="${s.panel.right}"]`).click();
      await wait(300);
      await shot(`${tag}-done`);
      const after = await st();
      if (!after.panel.answered) console.log('NOT ANSWERED', tag, JSON.stringify(after.panel).slice(0, 300));
      await page.keyboard.press('Escape');
      await wait(300);
    }
  }
}
console.log(JSON.stringify(await st()).slice(0, 400));
await browser.close();
