// Dev helper: Library Rush at each stage (signs, a wrong shelf, Reading Glasses), plus the rush late in a run.
//   node scripts/md-stages.mjs <url> <outDir> [w] [h]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [url, out = 'test-output/md-stages', w = '1280', hgt = '720'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const phone = Number(w) < 600;
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) }, hasTouch: phone, isMobile: phone });
page.on('console', (m) => m.type() === 'error' && console.log('[console]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const st = () => page.evaluate(() => window.__md.state());
const wait = (ms) => page.waitForTimeout(ms);
const toShelf = async (i) => {
  const sp = await page.evaluate((k) => window.__md.shelfPoint(k), i);
  const below = sp.y > 12;
  await page.evaluate(([x, y]) => window.__md.teleport(x, y), [sp.x, sp.y + (below ? -2.5 : 2)]);
  await wait(150);
  await page.evaluate(([x, y]) => window.__md.teleport(x, y), [sp.x, sp.y + 0.4]);
  await wait(450);
};
const grab = async () => {
  const s = await st();
  const books = await page.evaluate(() => window.__md.books());
  books.sort((a, b) => Math.hypot(a.x - s.player.x, a.y - s.player.y) - Math.hypot(b.x - s.player.x, b.y - s.player.y));
  await page.evaluate(([x, y]) => window.__md.teleport(x, y + 0.6), [books[0].x, books[0].y]);
  await wait(450);
};
for (const stage of [1, 2, 3]) {
  await page.goto(url);
  await page.evaluate((s) => localStorage.setItem('mathDashLibraryRush.save', JSON.stringify({ version: 1, introSeen: true, bestStage: 3, startStage: s, bestScore: 340 })), stage);
  await page.reload();
  await wait(1200);
  if (stage === 1) await page.screenshot({ path: `${out}/s0-title.png` });
  await page.getByRole('button', { name: /start a shift/i }).click();
  await wait(5000);
  await grab();
  let s = await st();
  const n = s.run.carried[0];
  const right = s.run.shelves.findIndex((x) => n >= x.lo && n <= x.hi);
  // the shelf the usual mistake would pick, else the next one
  await toShelf(right === 0 ? 1 : right - 1);
  await page.screenshot({ path: `${out}/s${stage}-wrong.png` });
  await toShelf(right === 0 ? 1 : right - 1);
  await toShelf(right === 0 ? 1 : right - 1);
  await page.screenshot({ path: `${out}/s${stage}-glow.png` });
  await toShelf(right);
  await page.screenshot({ path: `${out}/s${stage}-right.png` });
  s = await st();
  console.log(stage, s.run.shelves.map((x) => x.label).join(' | '), 'score', s.run.score);
}
// Reading Glasses and a busy late shift
await page.evaluate(() => window.__md.giveXp());
await grab();
let s = await st();
if (s.run.carried.length) {
  const m = s.run.carried[0];
  await toShelf(s.run.shelves.findIndex((x) => m >= x.lo && m <= x.hi));
}
s = await st();
if (s.mode === 'levelup') {
  const id = await page.locator('.md-card').evaluateAll((els) => els.map((e) => e.dataset.power));
  const gi = id.indexOf('glasses');
  await page.locator('.md-card').nth(gi >= 0 ? gi : 0).click();
}
await page.evaluate(() => window.__md.setTime(200));
await page.evaluate(() => window.__md.teleport(17, 15));
for (let i = 0; i < 8; i++) {
  await page.keyboard.down(['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp'][i % 4]);
  await wait(600);
  await page.keyboard.up(['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp'][i % 4]);
}
await page.screenshot({ path: `${out}/s4-late.png` });
s = await st();
console.log('late', JSON.stringify({ students: s.run.students, chatty: s.run.chatty, focus: Math.round(s.run.focus), powers: s.run.powers }));
await browser.close();
