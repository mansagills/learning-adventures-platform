// Screenshots of the Solar System Explorer look development pages (the cast
// sheet, the observatory, the Mars and Mercury stops and the Jupiter dive).
// Needs `npx vite --port 5179` running.
//   node scripts/space-lookdev-shots.mjs [base] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/lookdev/', out = 'test-output/space-lookdev'] = process.argv.slice(2);
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
const only = process.env.ONLY?.split(',');
const want = (n) => !only || only.includes(n);
if (want('cast')) {
  await shot('cast', '?view=space-cast', [1440, 900], { full: true, wait: 3000 });
  await shot('cast-phone', '?view=space-cast', [390, 844, 2], { full: true, wait: 3000 });
}
for (const area of ['observatory', 'mars', 'mercury']) {
  if (!want(area)) continue;
  await shot(`${area}-desktop`, `?view=space&area=${area}&talk=0`, [1280, 720], { wait: 4000 });
  await shot(`${area}-talk`, `?view=space&area=${area}`, [1280, 720], { wait: 5000 });
  await shot(`${area}-phone`, `?view=space&area=${area}&talk=0`, [390, 844, 3], { wait: 4000 });
}
if (want('jupiter')) {
  await shot('jupiter-top', '?view=space-jupiter&talk=0', [1280, 720], { wait: 800 });
  await shot('jupiter-deep', '?view=space-jupiter', [1280, 720], { wait: 12000 });
  await shot('jupiter-phone', '?view=space-jupiter&talk=0', [390, 844, 3], { wait: 6000 });
}
await browser.close();
console.log(errors ? `${errors} errors` : 'no errors');
process.exit(errors ? 1 : 0);
