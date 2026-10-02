// Measures frames per second while playing (software rendering on this machine is a worst case).
import { chromium } from 'playwright-core';
const url = process.argv[2] ?? 'http://localhost:4174/number-line-ninja/index.html';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const belt of ['white', 'green', 'black']) {
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.addInitScript((belt) => localStorage.setItem('numberLineNinja.save', JSON.stringify({ version: 1, earned: ['white', 'yellow', 'orange', 'green'].slice(0, ['white', 'yellow', 'orange', 'green', 'black'].indexOf(belt)), current: belt, introduced: ['white', 'yellow', 'orange', 'green', 'black'], learner: { [belt]: { tier: 2 } } })), belt);
  await p.goto(url);
  await p.waitForTimeout(1000);
  await p.getByRole('button', { name: /continue/i }).click();
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => new Promise((done) => {
    const t = [];
    let last = performance.now();
    const f = (now) => { t.push(now - last); last = now; if (t.length < 240) requestAnimationFrame(f); else done(t); };
    requestAnimationFrame(f);
  }));
  r.sort((a, c) => a - c);
  const avg = r.reduce((a, c) => a + c, 0) / r.length;
  console.log(`${belt}: ${(1000 / avg).toFixed(0)} fps average, slowest frames ${r[Math.floor(r.length * 0.95)].toFixed(0)} ms (95th percentile)`);
  await p.close();
}
await b.close();
