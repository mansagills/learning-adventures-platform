// Dev helper: screenshot tour of Time Attack Clock.
//   node scripts/tac-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/tac', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__tac.state());
const wait = (ms) => page.waitForTimeout(ms);
const skipTalk = async () => {
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await wait(150);
  }
};
await page.goto(url);
await wait(1500);
await shot('01-title');
await page.getByRole('button', { name: /start a new game/i }).click();
await wait(400);
await page.getByRole('button', { name: /i'm ready/i }).click();
await wait(900);
await shot('02-opening');
await skipTalk();
await wait(300);
await shot('03-town');
for (const station of ['school', 'bus', 'bakery']) {
  for (const tier of [1, 2, 3]) {
    await page.evaluate(([s, t]) => window.__tac.setTier(s, t), [station, tier]);
    await page.evaluate((s) => window.__tac.open(s), station);
    await wait(500);
    await skipTalk();
    await wait(400);
    await shot(`${station}-t${tier}-a`);
    let s = await st();
    const p = s.station.problem;
    if (p.kind === 'set') {
      // a wrong try with the hands as they start, then the hints
      await page.locator('.tac-check').click();
      await wait(300);
      await shot(`${station}-t${tier}-wrong`);
      await page.keyboard.press('h');
      await wait(150);
      await page.keyboard.press('h');
      await wait(150);
      await page.keyboard.press('h');
      await wait(300);
      await shot(`${station}-t${tier}-hint`);
      // set it with the arrow buttons: minutes first
      s = await st();
      const tm = (t) => (t.h % 12) * 60 + t.m;
      let diff = (tm(p.time) - tm(s.station.set) + 720) % 720;
      const hours = Math.floor(diff / 60);
      for (let i = 0; i < hours; i++) await page.locator('.tac-hand-row.hour .tac-hand-btn').nth(1).click();
      s = await st();
      diff = (tm(p.time) - tm(s.station.set) + 720) % 720;
      if (diff > 360) diff -= 720;
      const steps = Math.round(diff / p.step);
      const btn = page.locator('.tac-hand-row.minute .tac-hand-btn').nth(steps > 0 ? 1 : 0);
      for (let i = 0; i < Math.abs(steps); i++) await btn.click();
      await page.locator('.tac-check').click();
    } else {
      const wrong = p.choices.find((c) => !c.correct);
      await page.locator(`.tac-choice[data-value="${wrong.value}"]`).click();
      await wait(300);
      await shot(`${station}-t${tier}-wrong`);
      await page.keyboard.press('h');
      await wait(150);
      await page.keyboard.press('h');
      await wait(300);
      await shot(`${station}-t${tier}-hint`);
      const right = p.choices.find((c) => c.correct);
      await page.locator(`.tac-choice[data-value="${right.value}"]`).click();
    }
    await wait(300);
    await shot(`${station}-t${tier}-done`);
    s = await st();
    if (!s.station.answered) console.log('NOT ANSWERED', station, tier, JSON.stringify(s.station));
    await page.keyboard.press('Escape');
    await wait(300);
  }
}
// time attack
await page.evaluate(() => window.__tac.attack());
await wait(400);
await shot('20-attack-intro');
await page.getByRole('button', { name: 'Go!' }).click();
await wait(300);
for (let i = 0; i < 7; i++) {
  const s = await st();
  const right = s.attack.problem.choices.find((c) => c.correct);
  await page.locator(`.tac-choice[data-value="${right.value}"]`).click();
  await wait(400);
}
await shot('21-attack-play');
await page.evaluate(() => window.__tac.endAttack());
await wait(500);
await shot('22-attack-result');
console.log(JSON.stringify(await st()).slice(0, 400));
await browser.close();
