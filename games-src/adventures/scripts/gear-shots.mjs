// Screenshots of ninja gear combinations in the character creator.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/gear'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1280, height: 760 } });
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto(url);
await p.waitForTimeout(1200);
await p.getByRole('button', { name: /start a new game/i }).click();
await p.waitForTimeout(500);
await p.addStyleTag({ content: '*{animation:none!important}' });
await p.screenshot({ path: `${out}/00-creator.png` });
const combos = [
  ['Girl', 'Shadow black', 'Ninja hood', 'Red'],
  ['Boy', 'Crimson', 'Face mask', 'Gold'],
  ['Girl', 'Snow white', 'No mask', 'Sky blue'],
  ['Boy', 'Forest green', 'Ninja hood', 'White'],
  ['Girl', 'Royal purple', 'Face mask', 'Blossom pink'],
  ['Boy', 'Sunset orange', 'No mask', 'Black'],
];
let i = 0;
for (const [body, gi, mask, band] of combos) {
  await p.getByRole('radio', { name: body, exact: true }).click();
  const pickIn = (key, name) => p.locator(`[aria-labelledby="leg-${key}"]`).getByRole('radio', { name, exact: true }).click();
  await pickIn('gi', gi);
  await pickIn('mask', mask);
  await pickIn('headband', band);
  for (const d of [0, 1, 2, 3]) {
    await p.locator('.customize .preview canvas').screenshot({ path: `${out}/c${i}-d${d}.png` });
    await p.getByRole('button', { name: 'Turn left' }).click();
  }
  i++;
}
await p.screenshot({ path: `${out}/01-creator-last.png` });
console.log('errors', errors);
await b.close();
