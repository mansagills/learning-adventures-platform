// Dev helper: screenshot tour of Math Adventure Island.
//   node scripts/mai-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/mai', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__mai.state());
const wait = (ms) => page.waitForTimeout(ms);
const skipTalk = async () => {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await wait(150);
  }
};
const pickRight = async () => {
  const s = await st();
  await page.locator(`.mai-choice[data-value="${s.panel.right}"]`).first().click();
  await wait(320);
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
await shot('03-island');
for (const zone of ['add', 'sub', 'mul', 'div']) {
  for (const tier of [1, 2, 3]) {
    if (phone && tier !== 2) continue;
    await page.evaluate(([z, t]) => window.__mai.setTier(z, t), [zone, tier]);
    await page.evaluate((z) => window.__mai.open(z), zone);
    await wait(500);
    await skipTalk();
    await wait(400);
    await shot(`${zone}-t${tier}-a`);
    // a wrong pick at step 2, hints, then right
    await pickRight();
    const s = await st();
    const wrong = s.panel.problem.trap ?? ['+', '−', '×', '÷'].find((o) => o !== s.panel.problem.op);
    await page.locator(`.mai-choice[data-value="${wrong}"]`).click();
    await wait(300);
    await page.keyboard.press('h');
    await wait(150);
    await page.keyboard.press('h');
    await wait(300);
    await shot(`${zone}-t${tier}-hint`);
    await pickRight();
    await pickRight();
    await shot(`${zone}-t${tier}-done`);
    await page.keyboard.press('Escape');
    await wait(300);
  }
}
// treasure clue
await page.evaluate(() => window.__mai.teleport(20.5, 22.5));
await page.evaluate(() => window.__mai.clue());
await wait(500);
await skipTalk();
await wait(400);
await shot('clue-a');
await pickRight();
await pickRight();
await shot('clue-check');
await pickRight();
await shot('clue-done');
await page.locator('.mai-foot .btn.primary').click();
await wait(400);
let s = await st();
const sq = s.hunt.squares[s.hunt.found];
const c = await page.evaluate(([a, b]) => window.__mai.squareCenter(a, b), [sq.col, sq.row]);
await page.evaluate(([x, y]) => window.__mai.teleport(x, y), [c.x, c.y]);
await wait(500);
await shot('dig-prompt');
await page.keyboard.press('Space');
await wait(600);
await shot('dig-found');
await skipTalk();
await page.keyboard.press('Escape');
await wait(300);
// quiz
await page.evaluate(() => window.__mai.quiz());
await wait(600);
await shot('quiz-board');
await page.locator('.mai-tile').nth(5).click();
await wait(400);
await shot('quiz-question');
s = await st();
await page.locator(`.mai-question > .mai-choices .mai-choice[data-value="${s.quiz.right}"]`).click();
await wait(400);
await shot('quiz-right');
await page.keyboard.press('Escape');
await wait(300);
await page.evaluate(() => window.__mai.teleport(18, 13));
await wait(500);
await shot('stage');
await browser.close();
