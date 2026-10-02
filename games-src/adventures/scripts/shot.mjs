// Dev helper: open a game and take screenshots while driving it.
//   node scripts/shot.mjs <url> <outDir>
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/shots'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(url);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/01-title.png` });
await page.getByRole('button', { name: /start a new game/i }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/02-customize.png` });
await page.getByRole('button', { name: /i'm ready/i }).click();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/03-intro.png` });
for (let i = 0; i < 12 && (await page.locator('.dialogue').count()); i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(250);
  await page.keyboard.press('Space');
  await page.waitForTimeout(250);
}
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/04-play.png` });
const st = await page.evaluate(() => window.__nln.state());
console.log(JSON.stringify(st.problem));
for (const h of st.worked) {
  await page.keyboard.press(h > 1 ? 'ArrowUp' : h > 0 ? 'ArrowRight' : h < -1 ? 'ArrowDown' : 'ArrowLeft');
  await page.waitForTimeout(80);
}
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/05-hopped.png` });
await page.keyboard.press('Space');
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/06-result.png` });
await browser.close();
