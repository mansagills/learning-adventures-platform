// Dev helper: screenshot tour of Shape Town Builders (geometry-builder-challenge).
//   node scripts/stb-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/stb', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__stb.state());
const wait = (ms) => page.waitForTimeout(ms);
const skipTalk = async () => {
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) await opt.last().click();
    else await page.keyboard.press('Space');
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
await wait(400);
await shot('03-yard');
const answerSteps = async () => {
  for (let k = 0; k < 4; k++) {
    const s = await st();
    if (!s.panel) return;
    await page.locator(`.st-choice[data-value="${s.panel.right}"]`).click();
    await wait(350);
    const after = await st();
    if (!after.panel || after.panel.step === after.panel.steps - 1) return;
    await page.keyboard.press('Space');
    await wait(300);
  }
};
for (const station of ['arcade', 'blocks', 'blueprint', 'garden']) {
  for (const tier of [1, 2, 3]) {
    if (phone && tier !== (station === 'garden' ? 3 : 2)) continue;
    await page.evaluate(([s, t]) => window.__stb.setTier(s, t), [station, tier]);
    // for the Garden Yard's top level, look for an L-shaped garden (three steps)
    for (let tries = 0; tries < 12; tries++) {
      await page.evaluate((s) => window.__stb.open(s), station);
      await wait(500);
      await skipTalk();
      await wait(500);
      const s0 = await st();
      if (!(station === 'garden' && tier === 3) || s0.panel.problem.kind === 'L') break;
      await page.keyboard.press('Escape');
      await wait(250);
      await page.evaluate(([s, t]) => window.__stb.setTier(s, t), [station, tier]);
    }
    await wait(300);
    await shot(`${station}-t${tier}-a`);
    const s = await st();
    const stepChoices = s.panel.problem.steps ? s.panel.problem.steps[0].choices : s.panel.problem.choices;
    const wrong = stepChoices.find((c) => !c.correct);
    await page.locator(`.st-choice[data-value="${wrong.value}"]`).click();
    await wait(300);
    await page.keyboard.press('h');
    await wait(150);
    await page.keyboard.press('h');
    await wait(400);
    await shot(`${station}-t${tier}-hint`);
    if (s.panel.steps > 1) {
      await page.locator(`.st-choice[data-value="${s.panel.right}"]`).click();
      await wait(400);
      await page.keyboard.press('Space');
      await wait(400);
      await shot(`${station}-t${tier}-step2`);
    }
    await answerSteps();
    await wait(600);
    await shot(`${station}-t${tier}-done`);
    await page.keyboard.press('Escape');
    await wait(300);
  }
}
await page.evaluate(() => window.__stb.rush());
await wait(500);
await shot('rush-intro');
await page.getByRole('button', { name: 'Go!' }).click();
await wait(600);
for (let i = 0; i < 4; i++) {
  const s = await st();
  await page.locator(`.st-choices.bins .st-choice[data-value="${s.rush.right}"]`).click();
  await wait(450);
}
await shot('rush-play');
await page.evaluate(() => window.__stb.endRush());
await wait(500);
await shot('rush-end');
await page.keyboard.press('Escape');
await wait(300);
await page.evaluate(() => window.__stb.teleport(23.5, 14.5));
await wait(600);
await shot('right-side');
await page.evaluate(() => window.__stb.teleport(12.5, 21.5));
await wait(600);
await shot('left-bottom');

// The Big Build: finish every job, fit the four pieces, then the clubhouse opens
await page.evaluate(() => window.__stb.finishJobs());
await wait(400);
await shot('all-parts');
await page.evaluate(() => window.__stb.finale());
await wait(600);
for (let piece = 0; piece < 4; piece++) {
  await shot(`finale-${piece + 1}`);
  await answerSteps();
  await wait(400);
  await page.keyboard.press('Space');
  await wait(600);
}
await wait(400);
// keep reading the opening (it pauses while the sun sets)
for (let i = 0, idle = 0; i < 16 && idle < 8; i++) {
  if (!(await page.locator('.dialogue').count())) {
    idle++;
    await wait(500);
    continue;
  }
  idle = 0;
  await shot(`opening-${i}`);
  await page.keyboard.press('Space');
  await wait(450);
}
await wait(500);
await shot('opened');
await browser.close();
