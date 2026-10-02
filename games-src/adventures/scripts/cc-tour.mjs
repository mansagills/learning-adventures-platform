// Dev helper: screenshot tour of Counting Carnival.
//   node scripts/cc-tour.mjs <url> <outDir> [width] [height]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/cc', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const state = () => page.evaluate(() => window.__cc.state());
const skipTalk = async () => {
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    if (await page.locator('.dialogue .choices .btn').count()) return;
    await page.keyboard.press('Space');
    await page.waitForTimeout(160);
  }
};
await page.goto(url);
await page.waitForTimeout(1500);
await shot('01-title');
await page.getByRole('button', { name: /start a new game/i }).click();
await page.waitForTimeout(500);
await shot('02-customize');
await page.getByRole('button', { name: /i'm ready/i }).click();
await page.waitForTimeout(1200);
await shot('03-opening');
await skipTalk();
await page.waitForTimeout(800);
await shot('04-world');
for (const booth of ['ducks', 'rings', 'snacks', 'tickets']) {
  await page.evaluate((b) => window.__cc.open(b), booth);
  await page.waitForTimeout(700);
  if (booth === 'ducks') await shot(`05-${booth}-intro`);
  await skipTalk();
  await page.waitForTimeout(700);
  await shot(`06-${booth}-panel`);
  // a wrong answer, then a hint
  const st = await state();
  const p = st.booth.problem;
  const wrong = p.options?.find((o) => !o.correct);
  if (wrong && p.mode !== 'build') {
    const sel = booth === 'snacks' && p.mode === 'compare' ? `.cc-plate >> nth=${p.options.indexOf(wrong)}` : `.cc-option[data-value="${wrong.value}"]`;
    await page.locator(sel).click();
    await page.waitForTimeout(500);
    await shot(`07-${booth}-wrong`);
  }
  await page.keyboard.press('h');
  await page.waitForTimeout(300);
  await page.keyboard.press('h');
  await page.waitForTimeout(300);
  await page.keyboard.press('h');
  await page.waitForTimeout(500);
  await shot(`08-${booth}-hint`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  if (await page.locator('.cc-panel').count()) await page.getByRole('button', { name: /leave/i }).click();
  await page.waitForTimeout(400);
}
// make the next booth deliver a level 3 challenge for a look at the harder modes
for (const booth of ['ducks', 'tickets', 'snacks', 'rings']) {
  await page.evaluate((b) => {
    const s = JSON.parse(localStorage.getItem('countingCarnival.save'));
    return s;
  }, booth);
}
await shot('09-world-after');
await browser.close();
