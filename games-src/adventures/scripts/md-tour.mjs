// Dev helper: screenshot tour of Library Rush.
//   node scripts/md-tour.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/md', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const st = () => page.evaluate(() => window.__md.state());
const wait = (ms) => page.waitForTimeout(ms);
await page.goto(url);
await wait(1500);
await shot('01-title');
await page.getByRole('button', { name: /start a new game/i }).click();
await wait(400);
await page.getByRole('button', { name: /i'm ready/i }).click();
await wait(1000);
await shot('02-intro');
for (let i = 0; i < 20 && (await page.locator('.dialogue').count()); i++) {
  await page.keyboard.press('Space');
  await wait(150);
}
await wait(600);
await shot('03-start');
// walk to the nearest book and pick it up
for (let k = 0; k < 3; k++) {
  const s = await st();
  const books = await page.evaluate(() => window.__md.books());
  const p = s.player;
  books.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
  await page.evaluate(([x, y]) => window.__md.teleport(x, y + 0.6), [books[0].x, books[0].y]);
  await wait(500);
}
await shot('04-carrying');
let s = await st();
console.log('carrying', s.run.carried, s.run.shelves.map((x) => x.label).join(' | '));
// wrong shelf first
const n = s.run.carried[0];
const right = s.run.shelves.findIndex((x) => n >= x.lo && n <= x.hi);
const wrong = right === 0 ? 1 : 0;
let sp = await page.evaluate((i) => window.__md.shelfPoint(i), wrong);
await page.evaluate(([x, y]) => window.__md.teleport(x, y + 2), [sp.x, sp.y]);
await wait(200);
await page.evaluate(([x, y]) => window.__md.teleport(x, y + 0.4), [sp.x, sp.y]);
await wait(500);
await shot('05-wrong');
// the right one
s = await st();
for (let k = 0; k < 4 && s.run.carried.length; k++) {
  const m = s.run.carried[0];
  const ri = s.run.shelves.findIndex((x) => m >= x.lo && m <= x.hi);
  sp = await page.evaluate((i) => window.__md.shelfPoint(i), ri);
  await page.evaluate(([x, y]) => window.__md.teleport(x, y + 2), [sp.x, sp.y]);
  await wait(150);
  await page.evaluate(([x, y]) => window.__md.teleport(x, y + 0.4), [sp.x, sp.y]);
  await wait(350);
  if (k === 0) await shot('06-right');
  s = await st();
  if (s.mode === 'levelup') break;
}
await page.evaluate(() => window.__md.giveXp());
// shelve one more to trigger a level-up
for (let k = 0; k < 6 && s.mode !== 'levelup'; k++) {
  const books = await page.evaluate(() => window.__md.books());
  await page.evaluate(([x, y]) => window.__md.teleport(x, y + 0.6), [books[0].x, books[0].y]);
  await wait(400);
  s = await st();
  const m = s.run.carried[0];
  if (m === undefined) continue;
  const ri = s.run.shelves.findIndex((x) => m >= x.lo && m <= x.hi);
  sp = await page.evaluate((i) => window.__md.shelfPoint(i), ri);
  await page.evaluate(([x, y]) => window.__md.teleport(x, y + 2), [sp.x, sp.y]);
  await wait(150);
  await page.evaluate(([x, y]) => window.__md.teleport(x, y + 0.4), [sp.x, sp.y]);
  await wait(400);
  s = await st();
}
await shot('07-levelup');
await page.keyboard.press('2');
await wait(300);
// let the rush run with students
await page.evaluate(() => window.__md.setTime(120));
await page.evaluate(() => window.__md.teleport(17, 14));
for (let i = 0; i < 6; i++) {
  await page.keyboard.down(i % 2 ? 'ArrowLeft' : 'ArrowRight');
  await wait(700);
  await page.keyboard.up(i % 2 ? 'ArrowLeft' : 'ArrowRight');
}
await shot('08-rush');
s = await st();
console.log('rush', JSON.stringify({ students: s.run.students, chatty: s.run.chatty, focus: s.run.focus, score: s.run.score, level: s.run.level }));
await page.evaluate(() => window.__md.setFocus(1));
for (let i = 0; i < 40 && (await st()).mode === 'play'; i++) {
  await page.keyboard.down('ArrowDown');
  await wait(150);
  await page.keyboard.up('ArrowDown');
}
await wait(600);
await shot('09-over');
await browser.close();
