// Screenshots of the Wild Lands look development pages (the cast sheet, the
// field camp by day and at dusk, and the Ocean Depth Diver dive in each zone).
// Needs `npx vite --port 5179` running.
//   node scripts/wild-lookdev-shots.mjs [base] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/lookdev/', out = 'test-output/wild-lookdev'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
let errors = 0;
async function shot(name, query, vp, opts = {}) {
  const page = await browser.newPage({
    viewport: { width: vp[0], height: vp[1] },
    deviceScaleFactor: vp[2] ?? 1,
  });
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
  await shot('cast', '#wild-cast', [1440, 900], { full: true, wait: 3000 });
  await shot('cast-phone', '#wild-cast', [390, 844, 2], {
    full: true,
    wait: 3000,
  });
}
if (want('camp')) {
  await shot('camp-day', '#wild-camp-quiet', [1280, 720], { wait: 5000 });
  await shot('camp-day-talk', '#wild-camp', [1280, 720], { wait: 6000 });
  await shot('camp-evening', '#wild-camp-evening-quiet', [1280, 720], {
    wait: 5000,
  });
  await shot('camp-evening-talk', '#wild-camp-evening', [1280, 720], {
    wait: 6000,
  });
  await shot('camp-phone', '#wild-camp-quiet', [390, 844, 3], { wait: 5000 });
}
if (want('reef')) {
  for (const z of ['sunlight', 'twilight', 'midnight'])
    await shot(`reef-${z}`, `#wild-reef-${z}-quiet`, [1280, 720], {
      wait: 1500,
    });
  await shot('reef-talk', '#wild-reef-sunlight', [1280, 720], { wait: 3000 });
  await shot('reef-phone', '#wild-reef-twilight-quiet', [390, 844, 3], {
    wait: 1500,
  });
}
await browser.close();
console.log(errors ? `${errors} errors` : 'no errors');
process.exit(errors ? 1 : 0);
