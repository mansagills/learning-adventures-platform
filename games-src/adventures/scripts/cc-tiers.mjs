// Dev helper: screenshot every booth at tiers 2 and 3, with hints and a right answer.
//   node scripts/cc-tiers.mjs <url> <outDir> [width] [height]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/cc-tiers', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const rec = (tier) => ({ attempts: 4, correct: 4, streak: 0, missStreak: 0, tier, cleanAtTop: 0, hintsUsed: 0, misconceptions: {}, mastered: false });
for (const tier of [2, 3]) {
  await page.goto(url);
  await page.evaluate((t) => {
    const learner = {};
    for (const b of ['ducks', 'rings', 'snacks', 'tickets']) learner[b] = t;
    localStorage.setItem('countingCarnival.save', JSON.stringify({ version: 1, openingSeen: true, introduced: ['ducks', 'rings', 'snacks', 'tickets'], learner, tickets: 12, seed: 7 + t.tier }));
  }, rec(tier));
  await page.reload();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /continue/i }).click();
  await page.waitForTimeout(600);
  for (const booth of ['ducks', 'rings', 'snacks', 'tickets']) {
    await page.evaluate((b) => window.__cc.open(b), booth);
    await page.waitForTimeout(900);
    const st = await page.evaluate(() => window.__cc.state());
    if (!st.booth) {
      console.log('no booth', booth, JSON.stringify(st));
      continue;
    }
    console.log(tier, booth, JSON.stringify(st.booth.problem).slice(0, 200));
    await page.screenshot({ path: `${out}/t${tier}-${booth}-a.png` });
    await page.keyboard.press('h');
    await page.waitForTimeout(250);
    await page.keyboard.press('h');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/t${tier}-${booth}-hint2.png` });
    await page.keyboard.press('h');
    await page.waitForTimeout(500);
    // answer right
    const p = st.booth.problem;
    if (p.mode === 'build') await page.locator('.cc-pay').click();
    else if (p.mode === 'compare') await page.locator(`.cc-plate >> nth=${p.answer}`).click();
    else await page.locator(`.cc-option[data-value="${p.options.find((o) => o.correct).value}"]`).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${out}/t${tier}-${booth}-right.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }
}
await browser.close();
