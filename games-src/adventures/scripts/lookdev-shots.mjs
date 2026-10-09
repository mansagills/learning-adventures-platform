// Screenshots of the world look development pages: the character test and
// every world setting in the kit (src/kit/worlds), day and evening. Needs `npx vite --port 5180` running.
//   node scripts/lookdev-shots.mjs [base] [outDir] [only]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5180/lookdev/', out = 'test-output/lookdev', only = ''] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let errors = 0;
async function shot(name, query, vp, opts = {}) {
  if (only && !name.includes(only)) return;
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: vp[2] ?? 1 });
  page.on('console', (m) => m.type() === 'error' && (errors++, console.log('[console]', name, m.text())));
  page.on('pageerror', (e) => (errors++, console.log('[pageerror]', name, e.message)));
  await page.goto(base + query);
  await page.waitForTimeout(opts.wait ?? 1200);
  if (opts.selector) await page.locator(opts.selector).screenshot({ path: `${out}/${name}.png` });
  else await page.screenshot({ path: `${out}/${name}.png`, fullPage: !!opts.full });
  await page.close();
}
const sheetParts = ['compare', 'walk', 'portraits', 'slices'];
for (const part of sheetParts) await shot(`sheet-${part}`, `?view=sheet&part=${part}`, [1440, 900], { selector: '.sheet' });
await shot('sheet-phone', '?view=sheet&part=slices', [390, 844, 2], { full: true });
for (const setting of ['station-deck', 'alien-planet', 'river-market', 'roman-forum'])
  for (const time of ['day', 'evening']) {
    const q = `?view=scene&setting=${setting}&time=${time}`;
    await shot(`scene-${setting}-${time}-desktop`, q, [1280, 720], { wait: 2500 });
    await shot(`scene-${setting}-${time}-phone`, q, [390, 844, 3], { wait: 2500 });
    await shot(`scene-${setting}-${time}-talk`, q + '&talk=1', [1280, 720], { wait: 3500 });
  }
await browser.close();
console.log(errors ? `${errors} errors` : 'no console errors');
