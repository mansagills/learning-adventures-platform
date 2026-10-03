// Dev helper: screenshot tour of Money Market Madness.
//   node scripts/mm-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/mm', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__mm.state());
const wait = (ms) => page.waitForTimeout(ms);
const waitFront = async () => {
  for (let i = 0; i < 80 && !(await st()).front; i++) await wait(150);
};
await page.goto(url);
await wait(1500);
await shot('01-title');
await page.getByRole('button', { name: /start a new game/i }).click();
await wait(400);
await page.getByRole('button', { name: /i'm ready/i }).click();
await wait(900);
await shot('02-intro');
for (let i = 0; i < 20 && (await page.locator('.dialogue').count()); i++) {
  await page.keyboard.press('Space');
  await wait(150);
}
await waitFront();
await wait(400);
await shot('03-customer');
for (const tier of [1, 2, 3, 4]) {
  await page.evaluate((t) => window.__mm.setTier(t), tier);
  await waitFront();
  await page.locator('.mm-serve').click();
  await wait(400);
  await shot(`t${tier}-a`);
  let s = await st();
  const step = s.order.steps[0];
  if (step.kind === 'count' || step.kind === 'total') {
    const wrong = step.choices.find((c) => !c.correct);
    await page.locator(`.mm-choice[data-value="${wrong.value}"]`).click();
    await wait(300);
    await shot(`t${tier}-wrong`);
  } else if (step.kind === 'change') {
    await page.locator('.mm-coinbtn[data-money="quarter"]').click();
    await page.locator('.mm-give').click();
    await wait(300);
    await shot(`t${tier}-wrong`);
  }
  await page.keyboard.press('h');
  await wait(200);
  await page.keyboard.press('h');
  await wait(300);
  await shot(`t${tier}-hint`);
  // solve each remaining step
  for (let k = 0; k < 3; k++) {
    s = await st();
    if (!s.order) break;
    const cur = s.order.steps[s.order.step];
    if (cur.kind === 'count' || cur.kind === 'total') await page.locator(`.mm-choice[data-value="${cur.answer}"]`).click();
    else if (cur.kind === 'enough') await page.locator(`.mm-choice[data-value="${cur.answer ? 'yes' : 'no'}"]`).click();
    else {
      await page.keyboard.press('h');
      await page.keyboard.press('h');
      await page.keyboard.press('h');
      await wait(200);
      if (tier === 4 && k === 1) await shot('t4-change');
      await page.locator('.mm-give').click();
    }
    await wait(350);
  }
  await shot(`t${tier}-done`);
}
await page.evaluate(() => window.__mm.endDay());
for (let i = 0; i < 40 && (await st()).mode !== 'summary'; i++) await wait(150);
await wait(400);
await shot('10-summary');
await page.evaluate(() => window.__mm.setMoney(2500));
await page.getByRole('button', { name: /upgrade shop/i }).click();
await wait(400);
await shot('11-shop');
for (let i = 0; i < 6; i++) {
  const b = page.locator('[data-buy]:not([disabled])').first();
  if (!(await b.count())) break;
  await b.click();
  await wait(200);
}
await shot('12-shop-bought');
await page.getByRole('button', { name: /start market day/i }).click();
await wait(4000);
await shot('13-upgraded-stall');
console.log(JSON.stringify(await st()).slice(0, 300));
await browser.close();
