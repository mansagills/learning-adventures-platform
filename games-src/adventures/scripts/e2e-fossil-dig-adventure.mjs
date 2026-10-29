// Browser check for Fossil Dig Adventure (half 1): plays a new game from the
// title screen with real clicks and keys. Ranger Tala and Pebble open the
// story; Hana and Sam are not ready yet; the player clicks Dr. Mateo, who
// sends them into the quarry. In the dig: the brush is too soft for loose
// dirt, the shovel bounces off hard rock, the pick breaks it, Pebble sniffs
// out the nearest find, a find dug out with the shovel is chipped and the
// rest are brushed out clean; the finds go into the Fossil Drawer and the
// logbook opens (a wrong answer is crossed out with a sentence about the
// mistake, the hint ladder adds a picture and then outlines the answer)
// until five stars and the debrief finish the Quarry. Hana's Cliff Wall:
// a wrong layer at the bottom is crossed out, the five layers are stacked
// oldest first, three fossils go into their layers, and the logbook and
// debrief finish the Cliff Wall. Ranger Tala's goodbye for this part, the
// Fossil Drawer with the skeleton's first two parts, the level 3 cliff with
// the match across the valley, the grown-ups report, a reload, and the
// phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-fossil-dig-adventure.mjs [url]
//
// Writes test-output/fda-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/fossil-dig-adventure/index.html';
const OUT = 'test-output/fda-e2e';
mkdirSync(OUT, { recursive: true });
const results = [];
const errors = [];
const offsite = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...opts });
  const page = await ctx.newPage();
  const origin = new globalThis.URL(URL).origin;
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (!r.url().startsWith(origin) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) offsite.push(r.url());
  });
  return { ctx, page };
}
const st = (page) => page.evaluate(() => window.__fda.state());
const wait = (page, ms) => page.waitForTimeout(ms);
async function waitFor(page, fn, tries = 80) {
  for (let i = 0; i < tries; i++) {
    if (await fn()) return true;
    await wait(page, 100);
  }
  return false;
}
/** Click through the talk box (the first open choice when there is one). */
async function talkThrough(page, seen = []) {
  for (let i = 0; i < 60 && (await page.locator('.dialogue').count()); i++) {
    seen.push((await page.locator('.dialogue').textContent()) ?? '');
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) await opt.first().click();
    else await page.keyboard.press('Space');
    await wait(page, 160);
  }
  await wait(page, 250);
  return seen.join(' ');
}
/** Skip text until the talk box offers choices, then pick the one matching `re`. */
async function choose(page, re) {
  for (let i = 0; i < 40; i++) {
    const opt = page.locator('.dialogue .choices button', { hasText: re });
    if (await opt.count()) {
      await opt.first().click();
      await wait(page, 250);
      return true;
    }
    if (!(await page.locator('.dialogue').count())) return false;
    await page.keyboard.press('Space');
    await wait(page, 160);
  }
  return false;
}
/** Play the open logbook (right answers by number key) until its debrief starts. */
async function playLogbook(page) {
  for (let guard = 0; guard < 60; guard++) {
    let s = await st(page);
    if (!s.panel) break;
    if (!s.panel.answered) {
      await page.keyboard.press(String(s.panel.right + 1));
      await wait(page, 200);
    }
    s = await st(page);
    if (!s.panel) break;
    if (!s.panel.answered) continue;
    await page.keyboard.press('Space');
    await wait(page, 300);
    if (await page.locator('.dialogue').count()) break;
  }
}
/** Walk up to someone by clicking them (from nearby), and wait for the talk box. */
async function clickPerson(page, id, from) {
  await page.evaluate(([x, y]) => window.__fda.teleport(x, y), from);
  await wait(page, 300);
  const p = await page.evaluate((i) => window.__fda.screenOf(i), id);
  await page.mouse.click(p.x, p.y - 24);
  return waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 120);
}
/** Play the cliff puzzle with right answers (by number key); returns the phases seen (a screenshot at the first match). */
async function playCliff(page, shot = '') {
  const seen = new Set();
  for (let guard = 0; guard < 40; guard++) {
    const c = await page.evaluate(() => window.__fda.cliffState());
    if (!c || c.phase === 'done') break;
    if (c.phase === 'match' && !seen.has('match') && shot) {
      await wait(page, 200);
      await page.screenshot({ path: shot });
    }
    seen.add(c.phase);
    await page.keyboard.press(String(c.right + 1));
    await wait(page, 180);
  }
  return [...seen];
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1600);
  check('title screen shows', await page.getByText('Fossil Dig Adventure').first().isVisible());
  await page.screenshot({ path: `${OUT}/00-title.png` });
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  const cv = await page.locator('.customize .preview canvas').evaluate((c) => [c.width, c.height]);
  check('the character creator shows a 16-bit character (24x36)', cv[0] === 24 && cv[1] === 36, cv.join('x'));
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => page.locator('.dialogue').count());
  check('Ranger Tala opens the story', (await page.locator('.dialogue').textContent())?.includes('Ranger Tala'));
  const opening = await talkThrough(page);
  check('Pebble the sniffer dog says hello', opening.includes('sniffer dog'));
  let s = await st(page);
  check('the dig site is ready to walk, nothing done yet', s.mode === 'world' && s.done.length === 0 && s.drawer.length === 0);
  const p0 = s.player;
  await page.keyboard.down('ArrowRight');
  await wait(page, 400);
  await page.keyboard.up('ArrowRight');
  s = await st(page);
  check('arrow keys walk', s.player.x > p0.x + 0.5, `x ${p0.x.toFixed(1)} -> ${s.player.x.toFixed(1)}`);
  await page.screenshot({ path: `${OUT}/01-dig-site.png` });

  // Hana waits for the quarry; Sam's lab opens in the next part
  await page.evaluate(() => window.__fda.teleport(6.4, 9.4));
  await wait(page, 300);
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  check('Hana waits until the quarry is done', (await page.locator('.dialogue').textContent())?.includes('quarry first'));
  await talkThrough(page);
  await page.evaluate(() => window.__fda.teleport(21.6, 8.2));
  await wait(page, 300);
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  check('Sam’s Prep Lab opens in the next part', (await page.locator('.dialogue').textContent())?.includes('opens soon'));
  await talkThrough(page);

  // Dr. Mateo, reached by clicking: the intro, then the quarry dig
  check('clicking Dr. Mateo walks there and Mateo talks', await clickPerson(page, 'mateo', [16.4, 12.6]));
  const intro = await talkThrough(page);
  check('Dr. Mateo explains the grid and the map', /grid strings/.test(intro) && /map/.test(intro));
  check('the quarry dig opens', await waitFor(page, async () => (await page.locator('.fda-dig').count()) > 0, 40));
  check('three tools, Pebble’s sniff and 48 grid squares', (await page.locator('.fda-tool').count()) === 4 && (await page.locator('.fda-cell').count()) === 48);
  let q = await page.evaluate(() => window.__fda.quarry());
  check('four finds are hidden in the square', q.finds.length === 4, q.finds.join(','));
  const empty = q.cells.findIndex((c) => !c.find);
  // the brush on loose dirt, then the shovel, then the shovel on rock, then the pick
  await page.keyboard.press('3');
  await page.locator('.fda-cell').nth(empty).click();
  await wait(page, 200);
  check('the brush is too slow and soft for loose dirt', /too slow/.test(await page.locator('.fda-dig-status').innerText()));
  await page.keyboard.press('1');
  await page.locator('.fda-cell').nth(empty).click();
  await wait(page, 200);
  q = await page.evaluate(() => window.__fda.quarry());
  check('the shovel moves the loose dirt', q.cells[empty].left === 2 && /Hard rock/.test(await page.locator('.fda-dig-status').innerText()));
  await page.locator('.fda-cell').nth(empty).click();
  await wait(page, 200);
  check('the shovel bounces off hard rock', /bounces off/.test(await page.locator('.fda-dig-status').innerText()));
  await page.keyboard.press('2');
  await page.keyboard.press('Space');
  await wait(page, 200);
  q = await page.evaluate(() => window.__fda.quarry());
  check('the rock pick (key 2, Space on the square) breaks the rock', q.cells[empty].left === 1, String(q.cells[empty].left));
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('p');
  await wait(page, 200);
  q = await page.evaluate(() => window.__fda.quarry());
  check('Pebble sniffs out the nearest find (paw marks on its square)', q.cells.some((c) => c.sniffed && c.find) && /Pebble sniffs/.test(await page.locator('.fda-dig-status').innerText()));
  await page.screenshot({ path: `${OUT}/02-quarry-dig.png` });
  // the first find dug right down with the shovel and the pick: chipped
  const spots = q.cells.map((c, i) => (c.find ? i : -1)).filter((i) => i >= 0);
  await page.evaluate((i) => {
    window.__fda.digWith(i, 'shovel');
    window.__fda.digWith(i, 'pick');
    window.__fda.digWith(i, 'pick');
  }, spots[0]);
  await wait(page, 200);
  s = await st(page);
  check('a find dug out with the rock pick is chipped (but still found)', s.chipped.length === 1 && s.drawer.length === 1 && /chipped/.test(await page.locator('.fda-dig-status').innerText()));
  for (const i of spots.slice(1, 3)) await page.evaluate((k) => window.__fda.digOut(k), i);
  await wait(page, 200);
  await page.screenshot({ path: `${OUT}/03-quarry-finds.png` });
  await page.evaluate((k) => window.__fda.digOut(k), spots[3]);
  check('the last find ends the dig: the finds go into the drawer', await waitFor(page, async () => (await page.getByText('Your finds from the quarry').count()) > 0, 40));
  s = await st(page);
  check('four finds in the drawer, one of them chipped', s.drawer.length === 4 && s.chipped.length === 1 && s.digs === 1);
  await page.screenshot({ path: `${OUT}/04-finds.png` });
  await page.getByRole('button', { name: /^done$/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  const jacket = await talkThrough(page);
  check('Dr. Mateo explains the plaster jacket and the map', /plaster jacket/.test(jacket));
  check('then the quarry logbook opens', await waitFor(page, async () => (await page.locator('.fda-quarry.fda-panel').count()) > 0, 40));
  s = await st(page);
  check(
    'level 1, three answers, and a picture above the question',
    s.panel.tier === 1 && (await page.locator('.fda-choice').count()) === 3 && (await page.locator('.fda-pic img').count()) === 1,
    s.panel.id,
  );
  check('the question ends with one plain question', s.panel.ask.trim().endsWith('?') && s.panel.ask.split('?').length === 2);
  await page.screenshot({ path: `${OUT}/05-logbook.png` });
  const wrong = [0, 1, 2].find((i) => i !== s.panel.right);
  await page.locator('.fda-choice').nth(wrong).click();
  await wait(page, 400);
  check(
    'a wrong answer is crossed out, with a sentence about the mistake',
    (await page.locator('.fda-choice.nope').count()) === 1 && (await page.locator('.fda-feedback.try').innerText()).length > 25,
  );
  await page.keyboard.press('h');
  await wait(page, 200);
  check('hint 1 is a nudge (no answer outlined yet)', (await page.locator('.fda-choice.worked').count()) === 0 && (await page.locator('.fda-feedback.hint').count()) === 1);
  await page.keyboard.press('h');
  await wait(page, 300);
  s = await st(page);
  check('hint 2 adds a picture or labels', s.panel.model || (await page.locator('.fda-pic .fda-tag').count()) > 1);
  await page.keyboard.press('h');
  await wait(page, 300);
  check('hint 3 outlines the right answer', (await page.locator('.fda-choice.worked').count()) === 1);
  await page.screenshot({ path: `${OUT}/06-logbook-hints.png` });
  s = await st(page);
  await page.keyboard.press(String(s.panel.right + 1));
  await wait(page, 500);
  s = await st(page);
  check('the right answer by number key, and no star after a miss', s.panel.answered && s.stars.quarry === 0 && (await page.locator('.fda-feedback.good').count()) === 1);
  await page.keyboard.press('Space');
  await wait(page, 400);
  await playLogbook(page);
  s = await st(page);
  check('five stars start Dr. Mateo’s debrief', s.stars.quarry === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));
  const deb = await talkThrough(page);
  s = await st(page);
  check('the debrief asks why jellyfish fossils are rare, and the Quarry is done', /jellyfish/.test(deb) && s.done.includes('quarry'));

  // the Cliff Wall with Hana
  check('Hana talks now', await clickPerson(page, 'hana', [11, 7.6]));
  const hIntro = await talkThrough(page);
  check('Hana explains the layers (the bottom one is the oldest)', /bottom layer is the oldest/.test(hIntro));
  check('the cliff puzzle opens', await waitFor(page, async () => (await page.locator('.fda-cliff').count()) > 0, 40));
  check('five empty slots and five layer cards', (await page.locator('.fda-slot').count()) === 5 && (await page.locator('.fda-choice').count()) === 5);
  let c = await page.evaluate(() => window.__fda.cliffState());
  const bad = [0, 1, 2, 3, 4].find((i) => i !== c.right);
  await page.locator('.fda-choice').nth(bad).click();
  await wait(page, 300);
  check(
    'a wrong layer at the bottom is crossed out, with the reason',
    (await page.locator('.fda-choice.nope').count()) === 1 && /(older|younger)/.test(await page.locator('.fda-cliff .fda-dig-status').innerText()),
  );
  await page.screenshot({ path: `${OUT}/07-cliff-order.png` });
  for (let k = 0; k < 5; k++) {
    c = await page.evaluate(() => window.__fda.cliffState());
    if (c.phase !== 'order') break;
    await page.keyboard.press(String(c.right + 1));
    await wait(page, 200);
  }
  c = await page.evaluate(() => window.__fda.cliffState());
  check('the five layers are stacked, oldest at the bottom: on to the fossils', c.phase === 'fossils' && (await page.locator('.fda-slot.filled').count()) === 5);
  const fbad = [0, 1, 2, 3, 4].find((i) => i !== c.right);
  await page.locator('.fda-choice').nth(fbad).click();
  await wait(page, 300);
  check('a fossil in the wrong layer gets a reason', (await page.locator('.fda-choice.nope').count()) === 1);
  await page.screenshot({ path: `${OUT}/08-cliff-fossils.png` });
  await playCliff(page);
  c = await page.evaluate(() => window.__fda.cliffState());
  check('three fossils placed: the cliff is done (no match at level 1)', c.phase === 'done');
  await page.getByRole('button', { name: /back to hana/i }).click();
  check('the cliff’s fossils go into the drawer', await waitFor(page, async () => (await page.getByText('Fossils from the cliff').count()) > 0, 30));
  await page.getByRole('button', { name: /^done$/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  await talkThrough(page);
  check('then the cliff logbook opens', await waitFor(page, async () => (await page.locator('.fda-cliff.fda-panel').count()) > 0, 40));
  await page.screenshot({ path: `${OUT}/09-cliff-logbook.png` });
  await playLogbook(page);
  s = await st(page);
  check('five stars start Hana’s debrief', s.stars.cliff === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));
  const deb2 = await talkThrough(page);
  s = await st(page);
  check('the debrief asks how sea shells got into the cliff, and the Cliff Wall is done', /shells/i.test(deb2) && s.done.includes('cliff'));

  // Ranger Tala's goodbye for this part, and the Fossil Drawer
  check('Ranger Tala talks', await clickPerson(page, 'tala', [19.6, 12.2]));
  const bye = await talkThrough(page);
  check('Tala says the Prep Lab and the Trackway come next', /Prep Lab and the Trackway/.test(bye));
  await page.keyboard.press('b');
  await wait(page, 400);
  s = await st(page);
  check(
    'B opens the Fossil Drawer: 16 places, the finds so far and the skeleton with 2 of 4 parts',
    (await page.locator('.fda-guide-card').count()) === 16 && (await page.getByText(/2 of 4 parts/).count()) > 0,
    `${s.drawer.length} found`,
  );
  await page.screenshot({ path: `${OUT}/10-drawer.png` });
  await page.locator('button.fda-guide-card').first().click();
  await wait(page, 300);
  check('a drawer card opens with its facts', (await page.locator('.fda-card-body p').count()) >= 3);
  await page.screenshot({ path: `${OUT}/11-fossil-card.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // level 3 at the cliff: no ages on the cards, and the match across the valley
  await page.evaluate(() => {
    window.__fda.setTier('cliff', 3);
    window.__fda.cliff();
  });
  await wait(page, 400);
  check('at level 3 the layer cards give no ages', !(await page.locator('.fda-cliff').innerText()).includes('million years old'));
  const phases = await playCliff(page, `${OUT}/12-cliff-match.png`);
  check('the level 3 cliff ends with the match across the valley', phases.includes('match'), phases.join(','));
  c = await page.evaluate(() => window.__fda.cliffState());
  check('the level 3 cliff is finished', c && c.phase === 'done');
  await page.getByRole('button', { name: /back to hana/i }).click();
  await wait(page, 300);
  if (await page.getByRole('button', { name: /^done$/i }).count()) await page.getByRole('button', { name: /^done$/i }).click();
  await wait(page, 300);
  await talkThrough(page);
  s = await st(page);
  check('back on the dig site, two cliffs rebuilt', s.mode === 'world' && s.cliffs === 2, `${s.mode} ${s.cliffs}`);

  // the grown-ups report
  await page.keyboard.press('g');
  await wait(page, 400);
  const gu = page.locator('.modal');
  check('G opens the grown-ups page (with the NGSS standards)', (await gu.count()) > 0 && (await gu.innerText()).includes('NGSS 4-ESS1-1'));
  const tab = page.getByRole('tab', { name: /how it is going|progress/i });
  if (await tab.count()) {
    await tab.first().click();
    await wait(page, 200);
  }
  check('the grown-ups report lists the Quarry and the Cliff Wall', (await page.locator('.progress-table tbody tr').count()) === 2);
  await page.screenshot({ path: `${OUT}/13-grownups.png` });
  await page.keyboard.press('Escape');
  await wait(page, 200);

  // a reload keeps everything
  const before = await st(page);
  await page.reload();
  await wait(page, 1500);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 500);
  s = await st(page);
  check('a reload keeps the drawer, the stars and the stations', s.drawer.length === before.drawer.length && s.done.length === 2 && s.stars.quarry === 5);

  // the phone layout: the dig site, the quarry and the cliff
  const phone = await newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await phone.page.goto(URL);
  await wait(phone.page, 1500);
  await phone.page.getByRole('button', { name: /start a new game/i }).click();
  await wait(phone.page, 300);
  await phone.page.getByRole('button', { name: /i'm ready/i }).click();
  await wait(phone.page, 300);
  await talkThrough(phone.page);
  await phone.page.screenshot({ path: `${OUT}/14-phone-site.png` });
  await phone.page.evaluate(() => window.__fda.dig());
  await wait(phone.page, 600);
  await phone.page.screenshot({ path: `${OUT}/15-phone-dig.png` });
  let sideways = await phone.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  await phone.page.keyboard.press('Escape');
  await wait(phone.page, 300);
  await phone.page.evaluate(() => window.__fda.cliff());
  await wait(phone.page, 600);
  await phone.page.screenshot({ path: `${OUT}/16-phone-cliff.png` });
  sideways = sideways && (await phone.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  check('no sideways scrolling at phone width', sideways);
} catch (err) {
  check('the run finished without a crash', false, String(err?.message ?? err));
}
check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
check('no requests to other websites', offsite.length === 0, offsite.slice(0, 3).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok);
writeFileSync(`${OUT}/report.json`, JSON.stringify({ results, errors, offsite }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
