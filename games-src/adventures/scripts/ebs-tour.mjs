// Dev helper: screenshot tour of Equation Balance Scale: the title, the outpost, each job at every level (the question, a wrong answer, the hint picture, the answer), and the job list.
//   node scripts/ebs-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/ebs', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__ebs.state());
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
await shot('02-customize');
await page.getByRole('button', { name: /i'm ready/i }).click();
await wait(900);
await shot('03-opening');
await skipTalk();
await wait(600);
await shot('04-outpost');
await page.evaluate(() => window.__ebs.teleport(15.2, 16.6));
await wait(700);
await shot('05-rover');
await page.evaluate(() => window.__ebs.teleport(20.4, 14.6));
await wait(700);
await shot('06-dome');
await page.evaluate(() => window.__ebs.teleport(12.4, 12.6));
await wait(500);
for (const job of (process.env.JOBS ?? 'weigh,rover').split(',')) {
  for (const tier of [1, 2, 3]) {
    await page.evaluate(([j, t]) => window.__ebs.setTier(j, t), [job, tier]);
    await page.evaluate((j) => window.__ebs.open(j), job);
    await wait(900);
    const tag = `${job}-t${tier}`;
    await shot(`${tag}-a`);
    let s = await st();
    const wrongIndex = [0, 1, 2].find((i) => i !== s.panel.right_);
    await page.locator('.ebs-choice').nth(wrongIndex).click();
    await wait(1000);
    await shot(`${tag}-wrong`);
    await wait(1500);
    await page.keyboard.press('h');
    await wait(300);
    await page.keyboard.press('h');
    await wait(400);
    await shot(`${tag}-hint`);
    s = await st();
    await page.locator('.ebs-choice').nth(s.panel.right_).click();
    await wait(1000);
    await shot(`${tag}-right`);
    await page.keyboard.press('Escape');
    await wait(400);
  }
}
await page.keyboard.press('j');
await wait(400);
await shot('20-jobs');
await browser.close();
