// Screenshot tour of Number Line Ninja: every belt, a wrong answer, the hint
// ladder, the black-belt question, the belt scroll, grown-ups, and a phone.
//   node scripts/tour.mjs <url> <outDir>
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/tour'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
async function open(viewport, save) {
  const { hasTouch, isMobile, deviceScaleFactor, ...size } = viewport;
  const ctx = await browser.newContext({ viewport: size, hasTouch, isMobile, deviceScaleFactor });
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  if (save) await page.addInitScript((s) => localStorage.setItem('numberLineNinja.save', JSON.stringify(s)), save);
  await page.goto(url);
  await page.waitForTimeout(1200);
  return page;
}
const st = (page) => page.evaluate(() => window.__nln.state());
async function finishTalk(page) {
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    if (await page.locator('.choices button:not([disabled])').count()) await page.locator('.choices button:not([disabled])').first().click();
    else await page.keyboard.press('Space');
    await page.waitForTimeout(180);
  }
  await page.waitForTimeout(300);
}
async function hops(page, list) {
  for (const h of list) {
    const p = (await st(page)).problem;
    const key = Math.abs(h) > 1 ? (h > 0 ? 'ArrowUp' : 'ArrowDown') : h > 0 ? 'ArrowRight' : 'ArrowLeft';
    await page.keyboard.press(key);
    await page.waitForTimeout(60);
  }
  for (let i = 0; i < 80 && (await st(page)).busy; i++) await page.waitForTimeout(50);
  await page.waitForTimeout(250);
}
const base = (belt, earned) => ({ version: 1, appearance: { body: 'boy', skin: 'skin3', hairStyle: 'short', hairColor: 'black', outfit: 'red', accessory: 'headband' }, earned, stars: { white: 5, yellow: 5, orange: 5, green: 2, black: 1 }, played: {}, current: belt, learner: {}, introduced: ['white', 'yellow', 'orange', 'green', 'black'], seed: 1234 });

// 1. White belt: wrong answer, then the hint ladder
let page = await open({ width: 1280, height: 720 }, base('white', []));
await page.getByRole('button', { name: /continue/i }).click();
await page.waitForTimeout(900);
let s = await st(page);
console.log('white', s.problem.equation);
// land one stone past the answer: a wrong landing
await hops(page, [...s.worked, 1]);
await page.keyboard.press('Space');
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/10-wrong-feedback.png` });
await finishTalk(page);
for (const n of [1, 2, 3]) {
  await page.keyboard.press('h');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/1${n}-hint-${n}.png` });
}
await hops(page, (await st(page)).worked);
await page.keyboard.press('Space');
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/14-result-after-hints.png` });
await page.keyboard.press('b');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/15-belt-scroll.png` });
await page.keyboard.press('Escape');
await page.keyboard.press('g');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/16-grownups.png` });
await page.getByRole('tab', { name: /how it is going/i }).click();
await page.waitForTimeout(200);
await page.screenshot({ path: `${out}/17-grownups-progress.png` });
await page.context().close();

// 2. Yellow, orange, green, black: one clean answer each
for (const [belt, earned] of [
  ['yellow', ['white']],
  ['orange', ['white', 'yellow']],
  ['green', ['white', 'yellow', 'orange']],
  ['black', ['white', 'yellow', 'orange', 'green']],
]) {
  page = await open({ width: 1280, height: 720 }, base(belt, earned));
  await page.getByRole('button', { name: /continue/i }).click();
  await page.waitForTimeout(1000);
  s = await st(page);
  console.log(belt, s.problem.equation);
  await page.screenshot({ path: `${out}/2${['yellow', 'orange', 'green', 'black'].indexOf(belt)}-${belt}-start.png` });
  await hops(page, s.worked);
  await page.screenshot({ path: `${out}/2${['yellow', 'orange', 'green', 'black'].indexOf(belt)}-${belt}-hopped.png` });
  await page.keyboard.press('Space');
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/2${['yellow', 'orange', 'green', 'black'].indexOf(belt)}-${belt}-landed.png` });
  await page.context().close();
}

// 3. Phone, 390 x 844, touch
page = await open({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }, base('yellow', ['white']));
await page.getByRole('button', { name: /continue/i }).tap();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${out}/30-phone-play.png` });
s = await st(page);
for (const h of s.worked) {
  await page.locator(h > 0 ? '.pad-btn.one >> nth=1' : '.pad-btn.one >> nth=0').tap();
  await page.waitForTimeout(60);
}
for (let i = 0; i < 80 && (await st(page)).busy; i++) await page.waitForTimeout(50);
await page.screenshot({ path: `${out}/31-phone-hopped.png` });
await page.locator('.pad-btn.land').tap();
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/32-phone-result.png` });
const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
console.log('phone sideways scroll:', sideways);
await page.context().close();

console.log('errors:', errors.length ? errors : 'none');
await browser.close();
