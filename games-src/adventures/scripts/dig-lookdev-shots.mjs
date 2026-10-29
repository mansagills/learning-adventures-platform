// Screenshots of the Fossil Dig Adventure look development pages (the cast
// and fossils, the dig site by day and at dusk, and the four station views).
// Needs `npx vite --port 5179` running.
//   node scripts/dig-lookdev-shots.mjs [base] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/lookdev/', out = 'test-output/dig-lookdev'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
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
  await shot('cast', '#dig-cast', [1440, 900], { full: true, wait: 3000 });
  await shot('cast-phone', '#dig-cast', [390, 844, 2], { full: true, wait: 3000 });
}
if (want('site')) {
  await shot('site-day', '#dig-site-quiet', [1280, 720], { wait: 5000 });
  await shot('site-day-talk', '#dig-site', [1280, 720], { wait: 6000 });
  await shot('site-evening', '#dig-site-evening-quiet', [1280, 720], { wait: 5000 });
  await shot('site-phone', '#dig-site-quiet', [390, 844, 3], { wait: 5000 });
}
if (want('views')) {
  for (const v of ['quarry', 'cliff', 'trackway', 'glow', 'glow-uv']) await shot(`view-${v}`, `#dig-${v}-quiet`, [1280, 720], { wait: 1500 });
  await shot('view-cliff-talk', '#dig-cliff', [1280, 720], { wait: 3000 });
  await shot('view-glow-uv-talk', '#dig-glow-uv', [1280, 720], { wait: 3000 });
  await shot('view-cliff-phone', '#dig-cliff-quiet', [390, 844, 3], { wait: 1500 });
}
await browser.close();
console.log(errors ? `${errors} errors` : 'no errors');
process.exit(errors ? 1 : 0);
