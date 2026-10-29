// Screenshots of the Animal Kingdom Match look development pages (the cast
// and animals, the camp with the Rescue Center, and the four habitat trips,
// by day and at dusk). Needs `npx vite --port 5179` running.
//   node scripts/animal-lookdev-shots.mjs [base] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/lookdev/', out = 'test-output/animal-lookdev'] = process.argv.slice(2);
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
  await shot('cast', '#animal-cast', [1440, 900], { full: true, wait: 3000 });
  await shot('cast-phone', '#animal-cast', [390, 844, 2], { full: true, wait: 3000 });
}
for (const area of ['camp', 'rainforest', 'desert', 'polar', 'wetland']) {
  if (!want(area)) continue;
  await shot(`${area}-day`, `#animal-${area}-quiet`, [1280, 720], { wait: 5000 });
  await shot(`${area}-evening`, `#animal-${area}-evening-quiet`, [1280, 720], { wait: 5000 });
}
if (want('talk')) {
  await shot('polar-talk', '#animal-polar', [1280, 720], { wait: 6000 });
  await shot('camp-kiki', '#animal-camp-kiki', [1280, 720], { wait: 6000 });
  await shot('rainforest-phone', '#animal-rainforest-quiet', [390, 844, 3], { wait: 5000 });
}
await browser.close();
console.log(errors ? `${errors} errors` : 'no errors');
process.exit(errors ? 1 : 0);
