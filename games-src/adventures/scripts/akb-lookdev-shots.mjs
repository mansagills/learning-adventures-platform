// Screenshots of the Kingdom Builders: Africa look preview (the map of
// Africa, the cast and buildings, Egypt in its three seasons and at dusk),
// at desktop and phone width, with checks that each page loads without
// errors, makes no requests to other websites, and has no sideways scroll.
// Needs `npx vite --port 5179` running.
//   node scripts/akb-lookdev-shots.mjs [base] [outDir]
// Set CHROMIUM to a Chromium executable if it is not at /opt/pw-browsers/chromium.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/lookdev/kingdoms/', out = 'test-output/akb-lookdev'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
let failed = 0;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed++;
};
const origin = new URL(base).origin;
async function shot(name, hash, vp, wait = 3500) {
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: vp[2] ?? 1 });
  const errors = [];
  const outside = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => !r.url().startsWith(origin) && !r.url().startsWith('data:') && outside.push(r.url()));
  await page.goto(base + hash);
  await page.waitForFunction(() => window.__akb?.ready, null, { timeout: 30000 });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: `${out}/${name}.png` });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(errors.length === 0, `${name}: no errors${errors.length ? ' (' + errors.join(' | ') + ')' : ''}`);
  check(outside.length === 0, `${name}: no requests to other websites${outside.length ? ' (' + outside.join(', ') + ')' : ''}`);
  check(sw <= 0, `${name}: no sideways scrolling`);
  await page.close();
}
const only = process.env.ONLY?.split(',');
const pages = [
  ['hub', '#hub'],
  ['cast', '#cast'],
  ['egypt-peret', '#egypt'],
  ['egypt-akhet-flood', '#egypt-flood'],
  ['egypt-shemu-harvest', '#egypt-harvest'],
  ['egypt-evening', '#egypt-evening'],
];
for (const [name, hash] of pages) {
  if (only && !only.includes(name)) continue;
  await shot(name, hash, [1280, 800]);
  await shot(`${name}-phone`, hash, [390, 844, 2]);
}
await browser.close();
console.log(failed ? `${failed} checks failed` : 'all checks passed');
process.exit(failed ? 1 : 0);
