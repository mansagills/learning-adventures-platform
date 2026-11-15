// Screenshots of the Pollution Solution Squad look development pages (the
// cast, trash and fixes, the four stretches before and after, the Nature
// Center), plus a check that the crafting test can be played through: gather
// the materials with the keyboard, free Ollie, craft a drain net, build it,
// see a weak design half work, improve it, and build in the Nature Center.
// Needs `npx vite --port 5179` running.
//   node scripts/coast-lookdev-shots.mjs [base] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/lookdev/', out = 'test-output/coast-lookdev'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
let errors = 0;
let failed = 0;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed++;
};
async function open(name, query, vp) {
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: vp[2] ?? 1 });
  page.on('console', (m) => m.type() === 'error' && (errors++, console.log('[console]', name, m.text())));
  page.on('pageerror', (e) => (errors++, console.log('[pageerror]', name, e.message)));
  await page.goto(base + query);
  return page;
}
async function shot(name, query, vp, opts = {}) {
  const page = await open(name, query, vp);
  await page.waitForTimeout(opts.wait ?? 1500);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: !!opts.full });
  if (opts.noScroll) {
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(sw <= 0, `${name}: no sideways scrolling`);
  }
  await page.close();
}
const only = process.env.ONLY?.split(',');
const want = (n) => !only || only.includes(n);
if (want('cast')) {
  await shot('cast', '#coast-cast', [1440, 900], { full: true, wait: 3500 });
  await shot('cast-phone', '#coast-cast', [390, 844, 2], { full: true, wait: 3500, noScroll: true });
}
for (const s of ['beach', 'harbor', 'wetland', 'town'])
  if (want(s)) {
    await shot(s, `#coast-${s}`, [1280, 800], { wait: 2000 });
    await shot(`${s}-clean`, `#coast-${s}-clean`, [1280, 800], { wait: 2000 });
  }
if (want('nature')) {
  const page = await open('nature', '#coast-nature', [1280, 800]);
  await page.waitForTimeout(1500);
  await page.click('button[data-piece="batbox"]');
  await page.evaluate(() => window.__cn.place('batbox', 4));
  await page.waitForTimeout(400);
  const seen = await page.evaluate(() => [...window.__cn.nb.seen]);
  check(seen.includes('bat'), 'a bat comes to the bat box');
  check(seen.includes('heron') && seen.includes('frog'), 'the heron and the frog come to the cattails in the pond');
  const before = await page.evaluate(() => window.__cn.nb.placed.length);
  await page.evaluate(() => window.__cn.place('bench', 10));
  check((await page.evaluate(() => window.__cn.nb.placed.length)) === before, 'a bench cannot go in the pond');
  await page.screenshot({ path: `${out}/nature.png` });
  await page.close();
  await shot('nature-phone', '#coast-nature', [390, 844, 2], { wait: 2000, noScroll: true });
}

if (want('play')) {
  const page = await open('play', '#coast-play', [1280, 800]);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/play-start.png` });
  const st = () => page.evaluate(() => window.__cs.state());
  const body = () => page.evaluate(() => ({ x: window.__cs.body.x, y: window.__cs.body.y, g: window.__cs.body.onGround }));
  const cx = async () => {
    const b = await body();
    return b.x + 0.31;
  };
  /** Run right until the middle of the body passes `x`, jumping at the given points. */
  const runTo = async (x, ms = 8000, jumpAt = []) => {
    const jumps = [...jumpAt];
    await page.keyboard.down('ArrowRight');
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const b = await body();
      if (b.x + 0.31 >= x) break;
      if (jumps.length && b.x + 0.31 >= jumps[0] && b.g) {
        jumps.shift();
        await page.keyboard.down('Space');
        await page.waitForTimeout(280);
        await page.keyboard.up('Space');
      }
      await page.waitForTimeout(16);
    }
    await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(350);
    return body();
  };
  const total = async () => Object.values((await st()).inv).reduce((a, n) => a + n, 0);
  /** Stand just before a piece of trash and grab it. */
  const grabAt = async (itemX, jumpAt = []) => {
    const n0 = await total();
    await runTo(itemX - 0.75, 8000, jumpAt);
    await page.keyboard.press('g');
    await page.waitForTimeout(250);
    return (await total()) > n0;
  };

  check(await grabAt(37.5), 'grabs the first bottle');
  await runTo(39.0, 2000);
  await page.keyboard.press('g');
  await page.waitForTimeout(300);
  check((await page.textContent('.cs-talk')).includes('Leave that shell'), 'a shell is left alone: take only trash');
  check(await grabAt(41.5), 'grabs a can');
  check(await grabAt(47.5, [42.4]), 'jumps the tide channel and grabs a wrapper');
  check((await st()).ollieFree === false, 'Ollie is tangled in a six-pack ring');
  await runTo(48.7, 2000);
  await page.keyboard.press('g');
  await page.waitForTimeout(300);
  let s = await st();
  check(s.ollieFree && s.inv.ring === 1, 'frees Ollie (the ring goes in the backpack)');
  await page.screenshot({ path: `${out}/play-ollie.png` });
  check(await grabAt(55.5, [53.6]), 'jumps up the dune step and grabs the old fishing net');
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(60);
  await page.keyboard.down('Space');
  await page.waitForTimeout(300);
  await page.keyboard.up('Space');
  await page.waitForTimeout(250);
  await page.keyboard.up('ArrowRight');
  await page.waitForTimeout(500);
  let b = await body();
  check(b.y < 5.5 && b.g, 'jumps up onto the driftwood ledges');
  check(await grabAt(59.5), 'grabs the rope on the ledge');
  check(await grabAt(60.5), 'grabs the scrap wood on the ledge');
  await page.screenshot({ path: `${out}/play-ledges.png` });
  await runTo(62.2, 3000);
  await page.waitForTimeout(900);
  check((await page.textContent('.cs-talk')).includes('Sniff'), 'Ollie sniffs out the buried wood');
  await page.screenshot({ path: `${out}/play-sniff.png` });
  check(await grabAt(63.5), 'grabs the buried wood that Ollie found');
  check(await grabAt(65.5), 'grabs another bottle');
  s = await st();
  check(s.inv.net === 1 && s.inv.wood === 2 && s.inv.rope === 1, `has the drain net materials (${JSON.stringify(s.inv)})`);
  await runTo(70.6, 4000, [65.2]);
  await page.screenshot({ path: `${out}/play-drain.png` });
  // the walk back is the same path: go straight to the Workbench
  await page.evaluate(() => window.__cs.teleport(28.6));
  await page.waitForTimeout(600);
  await page.keyboard.press('e');
  await page.waitForTimeout(500);
  check(await page.isVisible('.cs-sheet'), 'the Workbench opens');
  await page.screenshot({ path: `${out}/play-bench.png` });
  await page.click('button[data-design="big"]');
  await page.waitForTimeout(300);
  s = await st();
  check(s.carrying === 'big' && s.inv.net === 0, 'crafts a net with big holes (the materials are used)');
  await page.evaluate(() => window.__cs.teleport(71.5));
  await page.waitForTimeout(500);
  await page.keyboard.press('e');
  await page.waitForTimeout(1500);
  check((await st()).net === 'big', 'builds the net on the drain pipe');
  await page.screenshot({ path: `${out}/play-test.png` });
  await page.waitForTimeout(4500);
  check((await page.textContent('.cs-sheet')).includes('half works'), 'the big holes only half work');
  await page.screenshot({ path: `${out}/play-result-half.png` });
  await page.click('.cs-sheet .row button:not(.alt)');
  await page.waitForTimeout(300);
  s = await st();
  check(s.net === 'none' && s.inv.net === 1 && s.inv.wood === 2, 'takes it down and gets the materials back');
  await page.evaluate(() => window.__cs.teleport(28.6));
  await page.waitForTimeout(500);
  await page.keyboard.press('e');
  await page.waitForTimeout(400);
  await page.click('button[data-design="medium"]');
  await page.evaluate(() => window.__cs.teleport(71.5));
  await page.waitForTimeout(500);
  await page.keyboard.press('e');
  await page.waitForTimeout(6000);
  check((await page.textContent('.cs-sheet')).includes('it works'), 'the medium holes work');
  await page.screenshot({ path: `${out}/play-result-works.png` });
  await page.click('.cs-sheet .row button');
  await page.waitForTimeout(400);
  check((await st()).fixed, 'the drain is fixed');
  // the Nature Center
  await page.evaluate(() => window.__cs.teleport(15.6));
  await page.waitForTimeout(500);
  await page.keyboard.press('e');
  await page.waitForTimeout(800);
  check((await st()).mode === 'build', 'the Nature Center sign opens the build mode');
  await page.evaluate(() => {
    window.__cs.place('milkweed', 3);
    window.__cs.place('birdbox', 5);
    window.__cs.place('cattails', 10);
  });
  // and one piece placed by clicking the lot
  await page.click('button[data-piece="sunflower"]');
  const box = await page.locator('.cs-canvas').boundingBox();
  await page.mouse.click(box.x + (box.width * (7.5 + 2)) / 20, box.y + box.height * 0.8);
  await page.waitForTimeout(600);
  s = await st();
  check(s.visitors.includes('butterfly') && s.visitors.includes('wren') && s.visitors.includes('frog'), `visitors come (${s.visitors.join(', ')})`);
  check(s.visitors.includes('bee'), 'placing a sunflower by clicking brings a bee');
  await page.screenshot({ path: `${out}/play-nature.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  check((await st()).mode === 'play', 'Esc leaves the build mode');
  // falling in the sea goes back to the last Squad flag
  await page.evaluate(() => window.__cs.teleport(80));
  await page.waitForTimeout(1200);
  b = await body();
  check(b.x < 66 && b.x > 63, 'a fall in the sea goes back to the last Squad flag');
  await page.close();
  const phone = await open('play-phone', '#coast-play', [844, 390, 2]);
  await phone.waitForTimeout(2000);
  await phone.screenshot({ path: `${out}/play-phone.png` });
  const sw = await phone.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(sw <= 0, 'phone held sideways: no sideways scrolling');
  await phone.evaluate(() => window.__cs.teleport(28.6));
  await phone.waitForTimeout(400);
  await phone.keyboard.press('e');
  await phone.waitForTimeout(500);
  await phone.screenshot({ path: `${out}/play-phone-bench.png` });
  await phone.close();
}
await browser.close();
console.log(`${failed ? `${failed} FAILED` : 'all ok'}, ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
