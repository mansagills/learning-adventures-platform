// Screenshots of Ocean Depth Diver's question pictures: one question of each
// picture kind, before answering and with hint 2 (which adds labels or a
// model picture). Needs `npx vite --port 5181` (or a preview) running.
//   node scripts/odd-question-shots.mjs [url] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [URL = 'http://localhost:5181/ocean-depth-diver/index.html', OUT = 'test-output/odd-questions'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let errors = 0;
async function run(vp, suffix) {
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: vp[2] ?? 1 });
  page.on('pageerror', (e) => (errors++, console.log('[pageerror]', e.message)));
  page.on('console', (m) => m.type() === 'error' && (errors++, console.log('[console]', m.text())));
  await page.goto(URL);
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: /start a new game/i }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await page.waitForTimeout(300);
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(120);
  }
  const qs = [
    ['sunlight', 'sun-zone-name'],
    ['sunlight', 'sun-chain-less'],
    ['sunlight', 'sun-red-fades'],
    ['sunlight', 'sun-dials-down'],
    ['sunlight', 'sun-coral-animal'],
    ['sunlight', 'sun-plankton-what'],
    ['twilight', 'tw-belly-lights'],
    ['twilight', 'tw-migrate-when'],
    ['twilight', 'tw-big-eyes'],
  ];
  for (const [s, id] of qs) {
    await page.evaluate(([st, q]) => window.__odd.ask(st, q), [s, id]);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${id}${suffix}.png` });
    await page.keyboard.press('h');
    await page.keyboard.press('h');
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${id}-hint2${suffix}.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await page.close();
}
await run([1280, 720], '');
await run([390, 844, 2], '-phone');
await browser.close();
console.log(errors ? `${errors} errors` : 'no errors');
process.exit(errors ? 1 : 0);
