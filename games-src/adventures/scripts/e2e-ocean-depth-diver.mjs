// Browser check for Ocean Depth Diver (half 1): plays a new game from the
// title screen with real clicks and keys. Ranger Tala and Finn open the
// story; the lab tent is still closed; the player clicks Dr. Lani, who sends
// them on the first dive. In the sub they steer with the keys, photograph the
// six reef animals (each one's card goes into the field guide), go back up
// to the surface, and write up the logbook (a wrong answer is crossed out
// with a sentence about the mistake, the hint ladder adds a picture and then
// outlines the answer) until five stars and the debrief finish the sunlight
// zone. The Creature Designer opens: a test dive meets the reef challenge,
// the twilight challenges are still locked, and a creature is saved. Then the
// twilight dive: the headlamp comes on, three animals are photographed, the
// lanternfish swim up at dusk and the sub follows them all the way, the camp
// is at dusk on the way back, and the logbook finishes the twilight zone. A
// twilight creature meets the last three challenges and the designer's
// debrief. Ranger Tala says goodbye for this part. Then the field guide, the
// grown-ups report, a reload, and the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-ocean-depth-diver.mjs [url]
//
// Writes test-output/odd-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/ocean-depth-diver/index.html';
const OUT = 'test-output/odd-e2e';
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
const st = (page) => page.evaluate(() => window.__odd.state());
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
/** In the sub: move next to an animal and press Space for Finn's photo, then keep diving. */
async function photograph(page, id) {
  const c = await page.evaluate((a) => window.__odd.critter(a), id);
  if (!c) return false;
  await page.evaluate(([x, m]) => window.__odd.diveTo(x - 18, m), [c.x, c.m]);
  await wait(page, 250);
  const ok = await waitFor(page, async () => !(await page.locator('.odd-photo').isHidden()), 20);
  await page.keyboard.press('Space');
  const card = await waitFor(page, async () => (await page.locator('.odd-card').count()) > 0, 30);
  if (card) {
    await page.getByRole('button', { name: /keep diving/i }).click();
    await wait(page, 250);
  }
  return ok && card;
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1600);
  check('title screen shows', await page.getByText('Ocean Depth Diver').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  const cv = await page.locator('.customize .preview canvas').evaluate((c) => [c.width, c.height]);
  check('the character creator shows a 16-bit character (24x36)', cv[0] === 24 && cv[1] === 36, cv.join('x'));
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => page.locator('.dialogue').count());
  check('Ranger Tala opens the story', (await page.locator('.dialogue').textContent())?.includes('Ranger Tala'));
  const opening = await talkThrough(page);
  check('Finn says hello in the opening', opening.includes('robot camera'));
  let s = await st(page);
  check('the camp is ready to walk, nothing done yet', s.mode === 'world' && s.done.length === 0 && s.photos.length === 0);
  const p0 = s.player;
  await page.keyboard.down('ArrowLeft');
  await wait(page, 400);
  await page.keyboard.up('ArrowLeft');
  s = await st(page);
  check('arrow keys walk', s.player.x < p0.x - 0.5, `x ${p0.x.toFixed(1)} -> ${s.player.x.toFixed(1)}`);
  await page.screenshot({ path: `${OUT}/01-camp.png` });

  // the lab tent is closed until the first dive
  await page.evaluate(() => window.__odd.teleport(10.4, 9.2));
  await wait(page, 300);
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  check('the lab tent waits for the first dive', (await page.locator('.dialogue').textContent())?.includes('after your first dive'));
  await talkThrough(page);

  // Dr. Lani, reached by clicking her: her intro, then the first dive
  await page.evaluate(() => window.__odd.teleport(21, 9.6));
  await wait(page, 300);
  const lani = await page.evaluate(() => window.__odd.screenOf('lani'));
  await page.mouse.click(lani.x, lani.y - 24);
  check('clicking Dr. Lani walks there and she talks', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 120));
  const intro = await talkThrough(page);
  check('she explains the ocean’s zones', /zones/.test(intro));
  check('the sunlight dive starts', await waitFor(page, async () => (await page.locator('.odd-dive-canvas').count()) > 0, 40));
  // (the talk box runs straight on from Dr. Lani's intro to Finn's tip)
  check('Finn explains how to steer and take photos', intro.includes('sonar'));
  s = await st(page);
  check('the dials show the depth, the water and the pressure', (await page.locator('.odd-dial').count()) === 3 && s.dive && s.dive.depth <= 5);
  const d0 = s.dive;
  await page.keyboard.down('ArrowDown');
  await page.keyboard.down('ArrowRight');
  await wait(page, 900);
  await page.keyboard.up('ArrowDown');
  await page.keyboard.up('ArrowRight');
  await wait(page, 200);
  s = await st(page);
  check('the arrow keys steer the sub down and sideways', s.dive.depth > d0.depth + 3 && s.dive.x > d0.x + 10, `${d0.depth}m,${d0.x} -> ${s.dive.depth}m,${s.dive.x}`);
  await page.screenshot({ path: `${OUT}/02-reef-dive.png` });
  const sun = ['plankton', 'turtle', 'seagrass', 'clownfish', 'octopus', 'ray'];
  let shots = 0;
  for (const id of sun.slice(0, 5)) if (await photograph(page, id)) shots++;
  s = await st(page);
  check('Finn photographs reef animals; each card goes into the field guide', shots === 5 && s.photos.length === 5, `${shots} ${s.photos}`);
  // the last photo: the card, then Finn says to head back up
  const ray = await page.evaluate(() => window.__odd.critter('ray'));
  await page.evaluate(([x, m]) => window.__odd.diveTo(x - 18, m), [ray.x, ray.m]);
  await wait(page, 300);
  await page.screenshot({ path: `${OUT}/03-photo-prompt.png` });
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.odd-card').count()) > 0, 30);
  await page.screenshot({ path: `${OUT}/04-photo-card.png` });
  await page.getByRole('button', { name: /keep diving/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  check('all six photos: Finn says to head back up', (await page.locator('.dialogue').textContent())?.includes('all six'));
  await talkThrough(page);
  await page.evaluate(() => window.__odd.diveTo(220, 8));
  await page.keyboard.down('ArrowUp');
  const surfaced = await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 60);
  await page.keyboard.up('ArrowUp');
  check('swimming up to the surface ends the dive', surfaced && (await page.locator('.dialogue').textContent())?.includes('back at the top'));
  await talkThrough(page);
  check('back at camp, the logbook opens', await waitFor(page, async () => (await page.locator('.odd-sunlight.odd-panel').count()) > 0, 40));
  s = await st(page);
  check(
    'level 1, three answers, and a picture above the question',
    s.panel.tier === 1 && (await page.locator('.odd-choice').count()) === 3 && (await page.locator('.odd-pic img').count()) === 1,
    s.panel.id,
  );
  check('the question ends with one plain question', s.panel.ask.trim().endsWith('?') && s.panel.ask.split('?').length === 2);
  await page.screenshot({ path: `${OUT}/05-logbook.png` });
  const wrong = [0, 1, 2].find((i) => i !== s.panel.right);
  await page.locator('.odd-choice').nth(wrong).click();
  await wait(page, 400);
  check(
    'a wrong answer is crossed out, with a sentence about the mistake',
    (await page.locator('.odd-choice.nope').count()) === 1 && (await page.locator('.odd-feedback.try').innerText()).length > 25,
  );
  await page.keyboard.press('h');
  await wait(page, 200);
  check('hint 1 is a nudge (no answer outlined yet)', (await page.locator('.odd-choice.worked').count()) === 0 && (await page.locator('.odd-feedback.hint').count()) === 1);
  await page.keyboard.press('h');
  await wait(page, 300);
  s = await st(page);
  check('hint 2 adds a picture or labels', s.panel.model || (await page.locator('.odd-pic .odd-tag').count()) > 0);
  await page.keyboard.press('h');
  await wait(page, 300);
  check('hint 3 outlines the right answer', (await page.locator('.odd-choice.worked').count()) === 1);
  await page.screenshot({ path: `${OUT}/06-logbook-hints.png` });
  s = await st(page);
  await page.keyboard.press(String(s.panel.right + 1));
  await wait(page, 500);
  s = await st(page);
  check('the right answer by number key, and no star after a miss', s.panel.answered && s.stars.sunlight === 0 && (await page.locator('.odd-feedback.good').count()) === 1);
  await page.keyboard.press('Space');
  await wait(page, 400);
  await playLogbook(page);
  s = await st(page);
  check('five stars start Dr. Lani’s debrief', s.stars.sunlight === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));
  await talkThrough(page);
  s = await st(page);
  check('the sunlight zone is done', s.done.includes('sunlight') && s.mode === 'world', `${s.done}`);

  // the Creature Designer
  await page.keyboard.press('j');
  await wait(page, 300);
  check('J opens the expedition list (twilight now open)', (await page.locator('.belt-row').count()) === 3 && (await page.locator('.belt-row.soon').count()) === 0);
  await page
    .locator('.belt-row')
    .nth(2)
    .getByRole('button', { name: /walk there/i })
    .click();
  check('"Walk there" walks to the lab tent and Dr. Lani explains the designer', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 160));
  await talkThrough(page);
  check('the Creature Designer opens', await waitFor(page, async () => (await page.locator('.odd-designer').count()) > 0, 30));
  await page.locator('.odd-part[data-part="body"][data-value="flat"]').click();
  await page.getByRole('button', { name: /test dive/i }).click();
  await wait(page, 400);
  s = await st(page);
  check('a test dive shows three checks with reasons, and meets the reef challenge', (await page.locator('.odd-check').count()) === 3 && s.challenges.includes('reef-hide'));
  check('the twilight zone is still locked for tests', (await page.locator('.odd-part.locked[data-zone="twilight"]').count()) === 1);
  await page.screenshot({ path: `${OUT}/07-designer.png` });
  await page.getByRole('button', { name: /save to my field guide/i }).click();
  await wait(page, 300);
  s = await st(page);
  check('a creature is saved to the field guide', s.creatures === 1);
  await page.keyboard.press('Escape');
  await wait(page, 400);
  s = await st(page);
  check('closing the designer goes back to the camp', s.mode === 'world' && !s.designer);

  // the twilight dive, with the night trip
  await page.evaluate(() => window.__odd.teleport(23.3, 9.6));
  await wait(page, 300);
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  check('Dr. Lani offers to go deeper', await choose(page, /dive deeper/i));
  const twIntro = await talkThrough(page);
  check('she explains the dim twilight zone', /twilight zone/.test(twIntro));
  check('the twilight dive starts', await waitFor(page, async () => (await page.locator('.odd-dive-canvas').count()) > 0, 40));
  let tw = 0;
  for (const id of ['combjelly', 'lanternfish']) if (await photograph(page, id)) tw++;
  s = await st(page);
  check('down in the twilight zone, the dials show cold water and high pressure', s.dive.depth > 300 && /°C/.test(await page.locator('.odd-dials').innerText()));
  await page.screenshot({ path: `${OUT}/08-twilight.png` });
  const hatch = await page.evaluate(() => window.__odd.critter('hatchetfish'));
  await page.evaluate(([x, m]) => window.__odd.diveTo(x - 18, m), [hatch.x, hatch.m]);
  await wait(page, 300);
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.odd-card').count()) > 0, 30);
  await page.getByRole('button', { name: /keep diving/i }).click();
  tw++;
  check('three twilight animals photographed', tw === 3 && (await st(page)).photos.length === 9);
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  check('Dr. Lani radios: the lanternfish are swimming up at dusk', (await page.locator('.dialogue').textContent())?.includes('lanternfish'));
  await talkThrough(page);
  s = await st(page);
  check('the night trip starts', !!s.dive?.chase?.on);
  // follow the school: keep the sub with it until it reaches the top
  let shot = false;
  for (let i = 0; i < 400; i++) {
    s = await st(page);
    if (!s.dive?.chase?.on) break;
    await page.evaluate(([x, m]) => window.__odd.diveTo(x, m), [s.dive.chase.x, s.dive.chase.m]);
    if (!shot && s.dive.chase.progress > 0.3) {
      await page.screenshot({ path: `${OUT}/09-night-trip.png` });
      shot = true;
    }
    await wait(page, 120);
  }
  const chaseLine = await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 40);
  check('following the lanternfish all the way up ends the night trip', chaseLine && (await page.locator('.dialogue').textContent())?.includes('biggest trip'));
  await talkThrough(page);
  s = await st(page);
  check('back at camp it is dusk, and the logbook opens', s.time === 'evening' && (await waitFor(page, async () => (await page.locator('.odd-twilight.odd-panel').count()) > 0, 40)));
  await page.screenshot({ path: `${OUT}/10-twilight-logbook.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.screenshot({ path: `${OUT}/11-camp-dusk.png` });
  await page.evaluate(() => window.__odd.open('twilight'));
  await wait(page, 400);
  await playLogbook(page);
  s = await st(page);
  check('five stars start the twilight debrief', s.stars.twilight === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));
  await talkThrough(page);
  s = await st(page);
  check('the twilight zone is done', s.done.includes('twilight'));

  // a twilight creature meets the last three challenges
  await page.evaluate(() => window.__odd.designer());
  check('the designer opens again', await waitFor(page, async () => (await page.locator('.odd-designer').count()) > 0, 30));
  for (const [k, v] of [
    ['body', 'sleek'],
    ['eyes', 'big'],
    ['skin', 'silver'],
    ['light', 'belly'],
  ])
    await page.locator(`.odd-part[data-part="${k}"][data-value="${v}"]`).click();
  await page.locator('.odd-part[data-zone="twilight"]').click();
  await page.getByRole('button', { name: /test dive/i }).click();
  await wait(page, 400);
  s = await st(page);
  check(
    'a sleek, big-eyed, silver fish with a glowing belly thrives in the twilight zone',
    s.challenges.length === 4 && (await page.locator('.odd-summary.thrives').count()) === 1,
    s.challenges.join(','),
  );
  await page.screenshot({ path: `${OUT}/12-designer-twilight.png` });
  await page.keyboard.press('Escape');
  check('all four challenges start the designer’s debrief', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30));
  await talkThrough(page);
  s = await st(page);
  check('the Creature Designer is done: 3 of 3', s.done.length === 3 && s.done.includes('designer'));
  await page.evaluate(() => window.__odd.teleport(13.4, 10.8));
  await wait(page, 300);
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  const bye = await talkThrough(page);
  check('Ranger Tala celebrates and says the midnight zone comes next time', /midnight zone/.test(bye));

  // the field guide and the grown-ups report
  await page.keyboard.press('b');
  await wait(page, 400);
  check('B opens the field guide: 9 of 9 photos and the saved creature', (await page.locator('.odd-guide-card').count()) >= 10 && (await page.getByText('9 of 9').count()) > 0);
  await page.screenshot({ path: `${OUT}/13-field-guide.png`, fullPage: false });
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.keyboard.press('g');
  await wait(page, 400);
  const gu = page.locator('.modal');
  check('G opens the grown-ups page (with the NGSS standards)', (await gu.count()) > 0 && (await gu.innerText()).includes('NGSS 3-LS4-3'));
  const tab = page.getByRole('tab', { name: /how it is going|progress/i });
  if (await tab.count()) {
    await tab.first().click();
    await wait(page, 200);
  }
  check('the grown-ups report lists both zones and the designer', (await page.locator('.progress-table tbody tr').count()) === 3);
  await page.screenshot({ path: `${OUT}/14-grownups.png` });
  await page.keyboard.press('Escape');
  await wait(page, 200);

  // a reload keeps everything
  await page.reload();
  await wait(page, 1500);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 500);
  s = await st(page);
  check('a reload keeps the photos, stars, challenges and creatures', s.photos.length === 9 && s.done.length === 3 && s.creatures === 1);

  // the phone layout: the camp, and a dive
  const phone = await newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await phone.page.goto(URL);
  await wait(phone.page, 1500);
  await phone.page.getByRole('button', { name: /start a new game/i }).click();
  await wait(phone.page, 300);
  await phone.page.getByRole('button', { name: /i'm ready/i }).click();
  await wait(phone.page, 300);
  await talkThrough(phone.page);
  await phone.page.screenshot({ path: `${OUT}/15-phone-camp.png` });
  await phone.page.evaluate(() => window.__odd.dive('sunlight'));
  await wait(phone.page, 600);
  await talkThrough(phone.page);
  await phone.page.evaluate(() => window.__odd.diveTo(160, 25));
  await wait(phone.page, 600);
  await phone.page.screenshot({ path: `${OUT}/16-phone-dive.png` });
  const sideways = await phone.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
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
