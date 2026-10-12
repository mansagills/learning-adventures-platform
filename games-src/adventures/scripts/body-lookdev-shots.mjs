// Screenshots of the Body System Heroes look development pages (the cast
// sheet and the three inside-the-body areas). Needs `npx vite --port 5179` running.
//   node scripts/body-lookdev-shots.mjs [base] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/lookdev/', out = 'test-output/body-lookdev'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let errors = 0;
async function shot(name, query, vp, opts = {}) {
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: vp[2] ?? 1 });
  page.on('console', (m) => m.type() === 'error' && (errors++, console.log('[console]', name, m.text())));
  page.on('pageerror', (e) => (errors++, console.log('[pageerror]', name, e.message)));
  await page.goto(base + query);
  await page.waitForTimeout(opts.wait ?? 1500);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: !!opts.full });
  await page.close();
}
await shot('cast', '?view=body-cast', [1440, 900], { full: true });
await shot('cast-phone', '?view=body-cast', [390, 844, 2], { full: true });
for (const area of (process.env.AREAS ?? 'skin,mouth,lungs,blood,stomach').split(',')) {
  await shot(`${area}-desktop`, `?view=body&area=${area}&talk=0`, [1280, 720], { wait: 3000 });
  await shot(`${area}-talk`, `?view=body&area=${area}`, [1280, 720], { wait: 4000 });
  await shot(`${area}-phone`, `?view=body&area=${area}&talk=0`, [390, 844, 3], { wait: 3000 });
}
await browser.close();
console.log(errors ? `${errors} errors` : 'no errors');
process.exit(errors ? 1 : 0);
