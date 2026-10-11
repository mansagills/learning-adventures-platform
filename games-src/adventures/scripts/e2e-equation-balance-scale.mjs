// Browser check for Equation Balance Scale: plays a new game from the title
// screen with real clicks, keys and real drags. It walks to Ranger Kiri,
// answers at the Weigh Station (a wrong answer keeps the scale locked, the hints
// show what each pan weighs, a right answer lets the scale go and it tips the
// right way), finishes the job and its debrief, walks to Mechanic Juno from the
// job list, drags a wrong crystal into the gap (the scale tips, then the crystal
// comes back out) and the right one (it balances), finishes the Rover, then
// Botanist Pax's Dome (a story's equation picked on empty pans, then solved on
// the scale; boxes and the letter p at level 3), plays The Big Weigh-in at
// evening with Gloop on the scale, sees the beam, visits Gloop, opens the
// grown-ups report, reloads, and checks the phone layout.
//
//   npm run build && (cd ../../public/games/play && python3 -m http.server 8811 &)
//   node scripts/e2e-equation-balance-scale.mjs [url]
//
// Writes test-output/ebs-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:8811/equation-balance-scale/index.html';
const OUT = 'test-output/ebs-e2e';
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
const st = (page) => page.evaluate(() => window.__ebs.state());
const wait = (page, ms) => page.waitForTimeout(ms);
/** Click through the talk box; for a question, pick the first option still enabled. */
async function talkThrough(page) {
  for (let i = 0; i < 60 && (await page.locator('.dialogue').count()); i++) {
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) await opt.first().click();
    else await page.keyboard.press('Space');
    await wait(page, 160);
  }
  await wait(page, 250);
}
async function waitFor(page, fn, tries = 80) {
  for (let i = 0; i < tries; i++) {
    if (await fn()) return true;
    await wait(page, 100);
  }
  return false;
}
/** Tap a person on screen (walking there with the arrow keys first if needed). */
async function tapPerson(page, id) {
  for (let i = 0; i < 16; i++) {
    const pt = await page.evaluate((d) => window.__ebs.screenOf(d), id);
    if (pt.visible && pt.y > 120 && pt.y < 600 && pt.x > 60 && pt.x < 1220) {
      await page.mouse.click(pt.x, pt.y - 24);
      return;
    }
    const key = pt.y > 360 ? 'ArrowDown' : 'ArrowUp';
    await page.keyboard.down(key);
    await wait(page, 300);
    await page.keyboard.up(key);
  }
  throw new Error(`could not reach ${id}`);
}
/** Play the open job (right answers by number key) until its debrief starts. */
async function playJob(page) {
  for (let guard = 0; guard < 60; guard++) {
    let s = await st(page);
    if (!s.panel) break;
    if (!s.panel.answered) {
      if (s.panel.showing) {
        await wait(page, 300);
        continue;
      }
      await page.keyboard.press(String(s.panel.right_ + 1));
      await wait(page, 250);
    }
    s = await st(page);
    if (!s.panel) break;
    if (!s.panel.answered) continue;
    await page.keyboard.press('Space');
    await wait(page, 300);
    if (await page.locator('.dialogue').count()) break;
  }
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1600);
  check('title screen shows', await page.getByText('Equation Balance Scale').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  const cv = await page.locator('.customize .preview canvas').evaluate((c) => [c.width, c.height]);
  check('the character creator shows a 16-bit character (24x36)', cv[0] === 24 && cv[1] === 36, cv.join('x'));
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => page.locator('.dialogue').count());
  check('Ranger Kiri opens the story', (await page.locator('.dialogue').textContent())?.includes('Kiri'));
  let sawGloop = false;
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    if ((await page.locator('.dialogue').textContent())?.includes('Gloop')) sawGloop = true;
    await page.keyboard.press('Space');
    await wait(page, 160);
  }
  check('Gloop says hello in the opening', sawGloop);
  await wait(page, 300);
  let s = await st(page);
  check('the outpost is ready to walk, no beacon lamps lit', s.mode === 'world' && s.done.length === 0 && s.lit === 0);
  const p0 = s.player;
  await page.keyboard.down('ArrowLeft');
  await wait(page, 400);
  await page.keyboard.up('ArrowLeft');
  s = await st(page);
  check('arrow keys walk', s.player.x < p0.x - 0.5, `x ${p0.x.toFixed(1)} -> ${s.player.x.toFixed(1)}`);
  await page.screenshot({ path: `${OUT}/01-outpost.png` });

  // the Weigh Station, reached by clicking Kiri
  await tapPerson(page, 'kiri');
  check('clicking Kiri walks there and Kiri talks', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 120));
  await talkThrough(page);
  check('the Weigh Station opens', await waitFor(page, async () => (await page.locator('.ebs-panel').count()) > 0));
  s = await st(page);
  check('level 1 asks "is it true?" about crystals on both pans', s.panel.job === 'weigh' && s.panel.kind === 'tip' && s.panel.ask.includes(' true?'), s.panel.ask);
  check('the pans show real crystals at level 1', (await page.locator('.ebs-pile .px-icon').count()) >= 2);
  check('three answers: true, left heavier, right heavier', (await page.locator('.ebs-choice').allInnerTexts()).join('|').replace(/\d\n?/g, '').includes('True: it balances'));
  check('the scale is locked while you think', (await page.locator('.ebs-scale.locked').count()) === 1);
  await page.screenshot({ path: `${OUT}/02-weigh.png` });

  // a wrong answer: a sentence about it, and the scale stays locked
  const wrong = [0, 1, 2].find((i) => i !== s.panel.right_);
  await page.locator('.ebs-choice').nth(wrong).click();
  await wait(page, 400);
  s = await st(page);
  check('a wrong answer gets a sentence about the mistake', (await page.locator('.ebs-feedback.try').count()) === 1 && (await page.locator('.ebs-feedback').innerText()).length > 20);
  check('a wrong answer is crossed out and the scale stays locked (no answer given away)', (await page.locator('.ebs-choice.nope').count()) === 1 && s.panel.tilt === 'level' && (await page.locator('.ebs-scale.locked').count()) === 1);

  // hints: rung 2 shows what the pans weigh, rung 3 outlines the answer
  await page.keyboard.press('h');
  await wait(page, 200);
  await page.keyboard.press('h');
  await wait(page, 300);
  check('the second hint shows what each pan weighs', (await page.locator('.ebs-weighs:not([hidden])').count()) === 2);
  await page.keyboard.press('h');
  await wait(page, 300);
  check('the third hint outlines the right answer', (await page.locator('.ebs-choice.worked').count()) === 1);
  await page.screenshot({ path: `${OUT}/03-weigh-hints.png` });

  // the right answer by number key: the scale is let go and tips the right way
  s = await st(page);
  await page.keyboard.press(String(s.panel.right_ + 1));
  await wait(page, 900);
  s = await st(page);
  const want = s.panel.answer === 'balanced' ? 'level' : s.panel.answer === 'left' ? 'left-down' : 'right-down';
  check('the right answer lets the scale go, and it tips the right way', s.panel.answered && s.panel.tilt === want && (await page.locator('.ebs-scale.locked').count()) === 0, `${s.panel.answer} -> ${s.panel.tilt}`);
  check('no star after a miss', s.stars.weigh === 0);
  await page.screenshot({ path: `${OUT}/04-weigh-right.png` });
  await page.keyboard.press('Space');
  await wait(page, 500);

  // finish the job: five clean answers and level 2
  await playJob(page);
  s = await st(page);
  check('five stars start Kiri’s debrief', s.stars.weigh === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));
  await talkThrough(page);
  s = await st(page);
  check('the Weigh Station is done and the first beacon lamp is lit', s.done.includes('weigh') && s.lit === 1 && s.mode === 'world', JSON.stringify({ done: s.done, lit: s.lit }));
  await page.screenshot({ path: `${OUT}/05-one-lamp.png` });

  // the job list: walk to Juno
  await page.keyboard.press('j');
  await wait(page, 300);
  check('J opens the job list: three jobs, and The Big Weigh-in still to come', (await page.locator('.belt-row').count()) === 4 && (await page.locator('.belt-row.soon').count()) === 1 && (await page.locator('.belt-row.soon').innerText()).includes('Big Weigh-in'));
  await page.locator('.belt-row').nth(1).getByRole('button', { name: /walk there/i }).click();
  check('"Walk there" walks to Juno and Juno talks', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 120));
  await talkThrough(page);
  check('the Rover opens', await waitFor(page, async () => (await page.locator('.ebs-job-rover').count()) > 0));
  s = await st(page);
  check('the Rover asks for a missing number, with a gap on a pan', s.panel.kind === 'missing' && (await page.locator('.ebs-gap').count()) === 1, s.panel.ask);

  // drag a wrong crystal into the gap: the scale tips, then the crystal comes back out
  const gapBox = await page.locator('.ebs-gap').boundingBox();
  const wrongR = [0, 1, 2].find((i) => i !== s.panel.right_);
  const fromBox = await page.locator('.ebs-choice').nth(wrongR).boundingBox();
  await page.mouse.move(fromBox.x + fromBox.width / 2, fromBox.y + fromBox.height / 2);
  await page.mouse.down();
  for (let k = 1; k <= 8; k++) await page.mouse.move(fromBox.x + fromBox.width / 2 + ((gapBox.x + gapBox.width / 2 - fromBox.x - fromBox.width / 2) * k) / 8, fromBox.y + fromBox.height / 2 + ((gapBox.y + gapBox.height / 2 - fromBox.y - fromBox.height / 2) * k) / 8);
  await page.screenshot({ path: `${OUT}/06-drag.png` });
  await page.mouse.up();
  await wait(page, 900);
  s = await st(page);
  check('dragging a wrong crystal into the gap tips the scale', s.panel.tilt !== 'level' && (await page.locator('.ebs-gap.filled').count()) === 1, s.panel.tilt);
  check('and says what happened ("Try it: ... too heavy" or "too light")', /Try it:.*too (heavy|light)/.test(await page.locator('.ebs-feedback').innerText()));
  await page.screenshot({ path: `${OUT}/07-rover-wrong.png` });
  check('the wrong crystal comes back out and the scale locks level again', await waitFor(page, async () => {
    const x = await st(page);
    return !x.panel.showing && x.panel.tilt === 'level' && (await page.locator('.ebs-gap.filled').count()) === 0;
  }, 40));
  // the right crystal by click: the scale balances
  await page.locator('.ebs-choice').nth(s.panel.right_).click();
  await wait(page, 900);
  s = await st(page);
  check('the right crystal makes the scale balance', s.panel.answered && s.panel.tilt === 'level' && (await page.locator('.ebs-feedback.good').count()) === 1);
  await page.screenshot({ path: `${OUT}/08-rover-right.png` });
  await page.keyboard.press('Space');
  await wait(page, 400);

  // level 3: something on both sides
  await page.evaluate(() => window.__ebs.setTier('rover', 3));
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.evaluate(() => window.__ebs.open('rover'));
  await wait(page, 500);
  s = await st(page);
  check('Rover level 3 has numbers on both pans', s.panel.kind === 'both-sides' && /\d/.test(s.panel.left) && /\d/.test(s.panel.right), `${s.panel.left} = ${s.panel.right}`);
  await page.screenshot({ path: `${OUT}/09-rover-level3.png` });
  await playJob(page);
  s = await st(page);
  check('five stars start Juno’s debrief', s.stars.rover === 5 && (await page.locator('.dialogue').count()) > 0);
  let sawNext = false;
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    if ((await page.locator('.dialogue').textContent())?.includes('Botanist Pax could use your help')) sawNext = true;
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) await opt.first().click();
    else await page.keyboard.press('Space');
    await wait(page, 160);
  }
  s = await st(page);
  check('the Rover is done: two beacon lamps lit, and Kiri sends you to Pax', s.done.includes('rover') && s.lit === 2 && sawNext, JSON.stringify({ done: s.done, lit: s.lit }));
  await page.screenshot({ path: `${OUT}/10-two-lamps.png` });

  // Botanist Pax and the Dome
  await page.evaluate(() => window.__ebs.teleport(21.4, 14.4));
  await wait(page, 400);
  await page.keyboard.press('Space');
  await wait(page, 400);
  check('Botanist Pax explains the Dome', (await page.locator('.dialogue').textContent())?.includes('Pax'));
  await talkThrough(page);
  check('the Dome opens', await waitFor(page, async () => (await page.locator('.ebs-job-dome').count()) > 0));
  s = await st(page);
  check('level 1 is a two-part story: pick the equation first', s.panel.kind === 'two-step' && s.panel.step === 0 && s.panel.steps === 2 && s.panel.ask.includes('Which equation matches the story?'), s.panel.ask);
  check('the pans stay empty while the equation is picked (they would give it away)', (await page.locator('.ebs-load .ebs-token').count()) === 0 && (await page.locator('.ebs-plate').allInnerTexts()).every((t) => t === '?'));
  check('the three answers are equations', (await page.locator('.ebs-choice-text').allInnerTexts()).every((t) => / = \?$/.test(t.replace(/ /g, ' '))));
  await page.screenshot({ path: `${OUT}/11-dome-story.png` });
  const wrongEq = [0, 1, 2].find((i) => i !== s.panel.right_);
  const wrongEqMis = s.panel.wrong[0].misconception;
  await page.locator('.ebs-choice').nth(wrongEq).click();
  await wait(page, 400);
  s = await st(page);
  check('a wrong equation gets a sentence, and the pans stay empty', (await page.locator('.ebs-feedback.try').count()) === 1 && s.panel.step === 0 && (await page.locator('.ebs-load .ebs-token').count()) === 0, wrongEqMis);
  await page.locator('.ebs-choice').nth(s.panel.right_).click();
  check('the right equation goes on the scale, and step 2 asks to solve it', await waitFor(page, async () => {
    const x = await st(page);
    return x.panel.step === 1 && x.panel.ask.startsWith('Now solve it') && (await page.locator('.ebs-gap').count()) === 1 && (await page.locator('.ebs-load .ebs-token').count()) >= 4;
  }, 30));
  check('it says the equation tells the story', (await page.locator('.ebs-feedback.good').innerText()).includes('tells the story'));
  await page.screenshot({ path: `${OUT}/12-dome-solve.png` });
  s = await st(page);
  const oneStep = s.panel.wrong.find((w) => w.misconception === 'one-step');
  const wrongCrystal = oneStep ? s.panel.wrong.indexOf(oneStep) : 0;
  const wrongValue = s.panel.wrong[wrongCrystal].value;
  const idx = (await page.locator('.ebs-choice').evaluateAll((els) => els.map((e) => e.dataset.value))).indexOf(wrongValue);
  await page.locator('.ebs-choice').nth(idx).click();
  await wait(page, 800);
  s = await st(page);
  check('a crystal from doing only the first step tips the scale and says so', s.panel.tilt !== 'level' && (!oneStep || (await page.locator('.ebs-feedback').innerText()).includes('only the first step')), await page.locator('.ebs-feedback').innerText());
  await waitFor(page, async () => !(await st(page)).panel.showing, 40);
  await page.locator('.ebs-choice').nth(s.panel.right_).click();
  await wait(page, 900);
  s = await st(page);
  check('the right crystal balances the story’s scale (no star after a miss)', s.panel.answered && s.panel.tilt === 'level' && s.stars.dome === 0);
  await page.keyboard.press('Space');
  await wait(page, 400);

  // level 3: a letter for the unknown, and boxes
  await page.evaluate(() => window.__ebs.setTier('dome', 3));
  let sawLetter = false;
  let sawBoxes = false;
  for (let k = 0; k < 16 && !(sawLetter && sawBoxes); k++) {
    await page.keyboard.press('Escape');
    await wait(page, 250);
    await page.evaluate(() => window.__ebs.open('dome'));
    await wait(page, 450);
    s = await st(page);
    if (s.panel.kind === 'two-step' && !sawLetter) {
      sawLetter = s.panel.right === 'p' && (await page.locator('.ebs-choice-text').allInnerTexts()).every((t) => / = p$/.test(t.replace(/ /g, ' ')));
      if (sawLetter) await page.screenshot({ path: `${OUT}/13-dome-letter.png` });
    }
    if (s.panel.kind === 'boxes' && !sawBoxes) {
      check('boxes: two boxes marked b on the left pan', (await page.locator('.ebs-gap.box').count()) === 2 && s.panel.left.startsWith('b + b'), s.panel.left);
      // drag the right crystal onto a box: both boxes get it, and the scale balances
      const box = await page.locator('.ebs-gap.box').first().boundingBox();
      const from = await page.locator('.ebs-choice').nth(s.panel.right_).boundingBox();
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
      await page.mouse.down();
      for (let n = 1; n <= 8; n++) await page.mouse.move(from.x + from.width / 2 + ((box.x + box.width / 2 - from.x - from.width / 2) * n) / 8, from.y + from.height / 2 + ((box.y + box.height / 2 - from.y - from.height / 2) * n) / 8);
      await page.mouse.up();
      await wait(page, 900);
      s = await st(page);
      sawBoxes = s.panel.answered && s.panel.tilt === 'level' && (await page.locator('.ebs-gap.box.filled').count()) === 2;
      check('boxes: dragging the right crystal onto a box fills both boxes and balances', sawBoxes);
      await page.screenshot({ path: `${OUT}/14-dome-boxes.png` });
    }
  }
  check('level 3 uses the letter p for the unknown', sawLetter);
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.evaluate(() => window.__ebs.open('dome'));
  await wait(page, 500);
  await playJob(page);
  s = await st(page);
  check('five stars start Pax’s debrief', s.stars.dome === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));

  // the whole beacon: evening, and Kiri calls The Big Weigh-in
  await page.evaluate(() => {
    window.__done = null;
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'game-complete') window.__done = e.data;
    });
  });
  let sawCall = false;
  for (let i = 0; i < 40 && !(await page.locator('.ebs-weighin').count()); i++) {
    if (await page.locator('.dialogue').count()) {
      if ((await page.locator('.dialogue').textContent())?.includes('The Big Weigh-in')) sawCall = true;
      const opt = page.locator('.dialogue .choices button:not([disabled])');
      if (await opt.count()) await opt.first().click();
      else await page.keyboard.press('Space');
    }
    await wait(page, 180);
  }
  s = await st(page);
  check('all three lamps lit: evening falls and Kiri calls The Big Weigh-in', s.lit === 3 && s.night === 1 && s.done.length === 3 && sawCall, JSON.stringify({ lit: s.lit, night: s.night }));
  check('Gloop sits on the big scale in the outpost', s.gloopOnScale);
  check('The Big Weigh-in opens: scale 1 of 3, Gloop on the scale, no stars', (await page.locator('.ebs-weighin').count()) === 1 && (await page.locator('.ebs-level').innerText()).includes('Scale 1 of 3') && (await page.locator('.ebs-gloop').count()) === 1 && (await page.locator('.ebs-stars img').count()) === 0);
  await page.screenshot({ path: `${OUT}/15-weighin.png` });
  const jobsSeen = [];
  for (let guard = 0; guard < 30 && (await page.locator('.ebs-weighin').count()); guard++) {
    s = await st(page);
    if (!s.panel) break;
    if (!jobsSeen.includes(s.panel.job)) jobsSeen.push(s.panel.job);
    if (s.panel.showing) {
      await wait(page, 300);
      continue;
    }
    if (!s.panel.answered) {
      await page.keyboard.press(String(s.panel.right_ + 1));
      await wait(page, 300);
      continue;
    }
    await page.keyboard.press('Space');
    await wait(page, 500);
  }
  check('one scale from each job, in order', jobsSeen.join(',') === 'weigh,rover,dome', jobsSeen.join(','));
  check('the finale: Kiri says The Big Weigh-in is done', await waitFor(page, async () => ((await page.locator('.dialogue').textContent()) ?? '').includes('Weigh-in is done'), 40));
  let sawStation = false;
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    await wait(page, 250);
    if (((await page.locator('.dialogue').textContent()) ?? '').includes('shining up to the Star Station')) sawStation = true;
    await page.keyboard.press('Space');
  }
  await wait(page, 300);
  check('and that the beacon is shining up to the Star Station', sawStation);
  s = await st(page);
  const done = await page.evaluate(() => window.__done);
  check('after The Big Weigh-in: the beam shines, Gloop hops down, and the game says it is complete', s.beam && !s.gloopOnScale && s.weighinSeen && s.mode === 'world' && done && done.score === 3, JSON.stringify(done));
  await page.screenshot({ path: `${OUT}/16-beam.png` });

  const g = await page.evaluate(() => window.__ebs.state().player);
  const gl = await page.evaluate(() => window.__ebs.screenOf('gloop'));
  await page.mouse.click(gl.x, gl.y - 8);
  check('Gloop says something when visited', await waitFor(page, async () => ((await page.locator('.dialogue').textContent()) ?? '').includes('Bloop'), 120), `from ${g.x.toFixed(1)},${g.y.toFixed(1)}`);
  await talkThrough(page);

  // the grown-ups report
  await page.keyboard.press('g');
  await wait(page, 400);
  await page.getByRole('tab', { name: /how it is going/i }).click();
  await wait(page, 200);
  check('grown-ups report has a row per job, and says The Big Weigh-in is done', (await page.locator('.progress-table tbody tr').count()) === 3 && (await page.locator('.grownups, .modal').last().innerText()).includes('Big Weigh-in is done'));
  await page.screenshot({ path: `${OUT}/17-grownups.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // reload: progress is kept
  await page.reload();
  await wait(page, 1300);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 600);
  s = await st(page);
  check('a saved game continues at evening: three lamps lit and the beam shining', s.done.length === 3 && s.lit === 3 && s.night === 1 && s.beam);

  // phone layout
  const { page: ph } = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ph.goto(URL);
  await wait(ph, 1300);
  await ph.getByRole('button', { name: /start a new game/i }).tap();
  await wait(ph, 400);
  await ph.getByRole('button', { name: /i'm ready/i }).tap();
  await wait(ph, 800);
  await talkThrough(ph);
  await ph.evaluate(() => window.__ebs.setTier('rover', 2));
  await ph.evaluate(() => window.__ebs.open('rover'));
  await wait(ph, 700);
  const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
  check('phone: no sideways scrolling', sw <= 390, `scrollWidth ${sw}`);
  const scaleBox = await ph.locator('.ebs-scale').boundingBox();
  check('phone: the whole scale is on screen', scaleBox.x >= 0 && scaleBox.x + scaleBox.width <= 390 && scaleBox.y + scaleBox.height <= 844, JSON.stringify(scaleBox));
  const boxes = await ph.locator('.ebs-choice').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ w: r.width, h: r.height, b: r.bottom })));
  check('phone: three crystals big enough to tap, above the bottom of the screen', boxes.length === 3 && boxes.every((b) => b.w >= 44 && b.h >= 44 && b.b <= 844), JSON.stringify(boxes));
  s = await st(ph);
  await ph.locator('.ebs-choice').nth(s.panel.right_).tap();
  await wait(ph, 800);
  s = await st(ph);
  check('phone: tapping the right crystal balances the scale', s.panel.answered && s.panel.tilt === 'level');
  await ph.screenshot({ path: `${OUT}/18-phone.png` });
  // phone: a Dome story fits too
  await ph.locator('.ebs-panel button', { hasText: 'Leave' }).tap();
  await wait(ph, 400);
  await ph.evaluate(() => window.__ebs.setTier('dome', 2));
  await ph.evaluate(() => window.__ebs.open('dome'));
  await wait(ph, 700);
  s = await st(ph);
  await ph.locator('.ebs-choice').nth(s.panel.right_).tap();
  await wait(ph, 1100);
  const sw2 = await ph.evaluate(() => document.documentElement.scrollWidth);
  const tokens = await ph.locator('.ebs-load .ebs-token').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).every((r) => r.left >= 0 && r.right <= 390));
  check('phone: a Dome story’s equation fits on the scale', sw2 <= 390 && tokens && (await st(ph)).panel.step === 1);
  await ph.screenshot({ path: `${OUT}/19-phone-dome.png` });
} catch (e) {
  check('no crash', false, String(e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e));
}
check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
check('nothing loaded from other websites', offsite.length === 0, offsite.slice(0, 3).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok);
writeFileSync(`${OUT}/report.json`, JSON.stringify({ results, errors, offsite }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
