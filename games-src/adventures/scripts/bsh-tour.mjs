// Dev helper: screenshot tour of Body System Heroes: the title, the med bay, then each mission's dive
// (flight, a scan question with a wrong answer, a hint and the answer, the nest, the heal, the way out),
// the healthy-habit game, the body map and the germ file.
//   node scripts/bsh-tour.mjs <url> <outDir> [w] [h]      MISSIONS=skin,mouth,lungs
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/bsh', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__bsh.state());
const info = () => page.evaluate(() => window.__bsh.flightInfo());
const wait = (ms) => page.waitForTimeout(ms);
const skipTalk = async (max = 40) => {
  for (let i = 0; i < max && (await page.locator('.dialogue').count()); i++) {
    await page.keyboard.press('Space');
    await wait(150);
  }
};
const waitMode = async (mode, ms = 8000) => {
  for (let t = 0; t < ms; t += 100) {
    if ((await st()).mode === mode) return true;
    await wait(100);
  }
  console.log(`[tour] timed out waiting for ${mode}; mode is ${(await st()).mode}`);
  return false;
};
// answer the open question: optionally a wrong answer and the hints first
const answer = async (tag, practice) => {
  await page.locator('.bsh-panel').waitFor();
  await wait(500);
  if (tag) await shot(`${tag}-a`);
  let s = await st();
  if (practice) {
    const wrong = [0, 1, 2].find((i) => i !== s.panel.right_);
    await page.locator('.bsh-choice').nth(wrong).click();
    await wait(900);
    if (tag) await shot(`${tag}-wrong`);
    await wait(1400);
    await page.keyboard.press('h');
    await wait(400);
    if (tag) await shot(`${tag}-hint`);
    s = await st();
  }
  await page.locator('.bsh-choice').nth(s.panel.right_).click();
  await wait(900);
  if (tag) await shot(`${tag}-right`);
  await page.keyboard.press('Space');
  await wait(500);
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
await wait(700);
await shot('04-medbay');

const missions = (process.env.MISSIONS ?? 'skin,mouth,lungs').split(',');
for (const m of missions) {
  for (let dive = 0; dive < 2; dive++) {
    const first = dive === 0;
    await page.evaluate((x) => window.__bsh.fly(x), m);
    await wait(700);
    if (first) await shot(`${m}-10-briefing`);
    await skipTalk();
    await waitMode('flight');
    await wait(600);
    if (first) await shot(`${m}-11-flight`);
    let f = await info();
    // fly to each scan spot
    for (let i = 0; i < f.scans.length; i++) {
      f = await info();
      const sc = f.scans[i];
      await page.evaluate(([x, y]) => window.__bsh.teleport(x, y), [sc.x, sc.y]);
      await page.locator('.bsh-panel').waitFor({ timeout: 4000 }).catch(() => console.log('[tour] no scan panel', m, i));
      await answer(first && i === 0 ? `${m}-12-scan` : null, first && i === 0);
      await waitMode('flight');
    }
    // the nest
    f = await info();
    await page.evaluate(([x, y]) => window.__bsh.teleport(x, y + 0.2), [f.nest.x, f.nest.y]);
    await wait(700);
    if (first) await shot(`${m}-13-nest-talk`);
    await skipTalk();
    await answer(first ? `${m}-14-diagnose` : null, false);
    await waitMode('flight');
    await wait(900);
    if (first) await shot(`${m}-15-heal`);
    // fly at the germs for a moment, then clear the rest
    f = await info();
    if (f.germs[0]) await page.evaluate(([x, y]) => window.__bsh.teleport(x + 1, y), [f.germs[0].x, f.germs[0].y]);
    await wait(1200);
    if (first) await shot(`${m}-16-fight`);
    await page.evaluate(() => window.__bsh.healNow());
    await wait(1500);
    if (first) await shot(`${m}-17-healed`);
    f = await info();
    await page.evaluate(([x, y]) => window.__bsh.teleport(x, y), [f.exit.x, f.exit.y]);
    await wait(900);
    if (first) await shot(`${m}-18-home`);
    await skipTalk();
    // the habit game (first time only)
    if (await page.locator('.bsh-habit').count()) {
      await wait(600);
      // scrub a little by mouse
      const box = await page.locator('.bsh-habit-canvas').boundingBox();
      for (let k = 0; k < 20; k++) await page.mouse.move(box.x + box.width * (0.3 + 0.02 * k), box.y + box.height * (0.4 + 0.01 * k));
      await wait(300);
      await shot(`${m}-20-habit`);
      await page.evaluate(() => {
        window.__bshHabit.scrubAll();
        window.__bshHabit.addTime(30);
      });
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await wait(700);
      if (await page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /bandage/i }).count()) {
        await shot(`${m}-21-habit-step2`);
        await page.locator('.bsh-habit-foot .btn', { hasText: /bandage/i }).click();
        await wait(600);
      }
      await shot(`${m}-22-habit-done`);
      await page.locator('.bsh-habit-foot .btn', { hasText: /done/i }).click();
      await wait(500);
    }
    // the debrief question, the germ file
    for (let k = 0; k < 30; k++) {
      if (await page.locator('.bsh-file').count()) {
        await shot(`${m}-30-germ-file`);
        await page.keyboard.press('Escape');
        await wait(300);
      } else if (await page.locator(".dialogue .choices button").count()) {
        if (k < 3) await shot(`${m}-29-debrief`);
        // pick each until the talk moves on
        const btns = page.locator(".dialogue .choices button");
        const n = await btns.count();
        for (let b = 0; b < n; b++) {
          if (!(await btns.nth(b).isVisible().catch(() => false))) continue;
          await btns.nth(b).click().catch(() => {});
          await wait(400);
          break;
        }
      } else if (await page.locator('.dialogue').count()) {
        await page.keyboard.press('Space');
        await wait(150);
      } else if ((await st()).mode === "world" && !(await page.locator(".modal").count())) break;
      else { if (process.env.DEBUG) console.log("[tour] waiting", JSON.stringify((await st()).mode), await page.locator(".modal h2").allTextContents()); await wait(200); }
    }
    const s = await st();
    console.log(`[tour] ${m} dive ${dive + 1}: stars ${s.stars[m]}, played ${s.played[m]}, done ${s.done.join(',')}, upgrades ${s.upgrades.join(',')}`);
    if (s.done.includes(m)) break;
  }
  await wait(400);
  await shot(`${m}-40-medbay-after`);
}
await page.keyboard.press('j');
await wait(500);
await shot('50-body-map');
await page.keyboard.press('Escape');
await wait(300);
await browser.close();
