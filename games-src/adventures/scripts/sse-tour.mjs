// Dev helper: screenshot tour of Solar System Explorer: the title, the observatory, each open station at every level
// (the question, a wrong answer, the hint picture, the answer), the star map, a rocky stop (finds, the fact card,
// the question) and a cloud dive, the station list and the album.
//   node scripts/sse-tour.mjs <url> <outDir> [w] [h]
//   STATIONS=orrery,sunrise (default) · STOPS=mars,jupiter (default) · TIERS=1,2,3
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/sse', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__sse.state());
const wait = (ms) => page.waitForTimeout(ms);
const skipTalk = async () => {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await wait(150);
  }
};
await page.goto(url);
await wait(1800);
await shot('01-title');
await page.getByRole('button', { name: /start a new game/i }).click();
await wait(500);
await page.getByRole('button', { name: /i'm ready/i }).click();
await wait(900);
await shot('02-opening');
await skipTalk();
await wait(600);
await shot('03-observatory');
await page.evaluate(() => window.__sse.teleport(18.5, 13.6));
await wait(700);
await shot('04-sunrise-lab');
await page.evaluate(() => window.__sse.teleport(13, 12.4));
await wait(400);
const tiers = (process.env.TIERS ?? '1,2,3').split(',').map(Number);
for (const station of (process.env.STATIONS ?? 'orrery,sunrise').split(',').filter(Boolean)) {
  for (const tier of tiers) {
    await page.evaluate(([s, t]) => window.__sse.setTier(s, t), [station, tier]);
    await page.evaluate((s) => window.__sse.open(s), station);
    await wait(900);
    const tag = `${station}-t${tier}`;
    await shot(`${tag}-a`);
    let s = await st();
    const wrongIndex = [0, 1, 2].find((i) => i !== s.panel.right);
    await page.locator('.sse-choice').nth(wrongIndex).click();
    await wait(700);
    await shot(`${tag}-wrong`);
    await page.keyboard.press('h');
    await wait(300);
    await page.keyboard.press('h');
    await wait(500);
    await shot(`${tag}-hint`);
    s = await st();
    await page.locator('.sse-choice').nth(s.panel.right).click();
    await wait(800);
    await shot(`${tag}-right`);
    await page.keyboard.press('Escape');
    await wait(400);
  }
}
await page.keyboard.press('p');
await wait(600);
await shot('10-starmap');
await page.keyboard.press('Escape');
await wait(300);
for (const p of (process.env.STOPS ?? 'mars,jupiter').split(',').filter(Boolean)) {
  await page.evaluate((pl) => window.__sse.hop(pl), p);
  await wait(1300);
  await shot(`${p}-arrive`);
  await skipTalk();
  await wait(500);
  let s = await st();
  if (!s.dive) {
    await shot(`${p}-surface`);
    for (const kind of ['sample', 'fact', 'question']) {
      const spot = { sample: [8.5, 9.2], fact: [17, 12.2], question: [13.5, 15.7] }[kind];
      await page.evaluate(([x, y]) => window.__sse.teleport(x, y), spot);
      await wait(500);
      await shot(`${p}-${kind}-near`);
      await page.keyboard.press('Space');
      await wait(900);
      await shot(`${p}-${kind}`);
      if (kind === 'question') {
        s = await st();
        await page.locator('.sse-choice').nth(s.panel.right).click();
        await wait(600);
        await page.getByRole('button', { name: /^done/i }).click();
        await wait(800);
      } else if (kind === 'fact') {
        await page.getByRole('button', { name: /got it/i }).click();
        await wait(500);
      } else await skipTalk();
      await wait(400);
    }
    await wait(500);
    await shot(`${p}-postcard`);
    await page.getByRole('button', { name: /into the album/i }).click();
    await wait(500);
    await skipTalk();
    await wait(1500);
  } else {
    await wait(1500);
    await shot(`${p}-dive`);
    for (let i = 0; i < 3; i++) {
      s = await st();
      const f = s.dive?.finds?.[0];
      if (!f) break;
      for (let k = 0; k < 60 && !(await st()).dive?.paused; k++) {
        const now = (await st()).dive;
        if (!now?.finds?.length) break;
        await page.evaluate((x) => window.__sse.diveTo(x), now.finds[0].x);
        await wait(150);
      }
      await wait(400);
      await shot(`${p}-dive-find-${i + 1}`);
      s = await st();
      if (s.panel) {
        await page.locator('.sse-choice').nth(s.panel.right).click();
        await wait(500);
        await page.getByRole('button', { name: /^done/i }).click();
      } else if (await page.getByRole('button', { name: /got it/i }).count()) await page.getByRole('button', { name: /got it/i }).click();
      else await skipTalk();
      await wait(700);
    }
    await wait(600);
    await shot(`${p}-postcard`);
    if (await page.getByRole('button', { name: /into the album/i }).count()) await page.getByRole('button', { name: /into the album/i }).click();
    await wait(500);
    await skipTalk();
    await wait(1500);
  }
  await shot(`${p}-back`);
}
await page.keyboard.press('j');
await wait(400);
await shot('20-stations');
await page.keyboard.press('Escape');
await wait(300);
await page.keyboard.press('b');
await wait(400);
await shot('21-album');
await page.keyboard.press('Escape');
console.log(JSON.stringify(await st()));
await browser.close();
