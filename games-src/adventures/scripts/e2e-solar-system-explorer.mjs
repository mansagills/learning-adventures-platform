// Browser check for Solar System Explorer: plays a new game from the title
// screen with real clicks and keys. Navigator Sol and Vee open the story; the
// player walks, clicks Sol and plays the Orrery (a wrong answer is crossed out
// with a sentence about the mistake, the hint ladder adds a picture and then
// outlines the answer), finishes it with the debrief (a telescope lens
// lights), walks to Dr. Kofi from the station list and finishes the Sunrise
// Lab, turns Lumi's season dial and finishes the Star Dome (the Sun's bonus
// postcard), fires Tess's cannon (a slow shot lands, a just-right one orbits,
// a super fast one flies away) and finishes the Launch Bay (the Moon's
// postcard), then flies the Grand Tour: plots the route (a wrong planet
// first), photographs all eight planets, answers a question from each
// station, photographs the Pale Blue Dot, and ends at the star party (Pluto's
// postcard, and the game tells the site it is complete). Then it opens the
// star map, lands on Mars (drives the rover, picks up the sample, reads the
// fact card, answers the question, gets the postcard), dives into Neptune's
// clouds (steers with the keys, catches the three finds), leaves Venus early
// and comes back to a find that stays collected, opens the album and the
// grown-ups report, reloads, and checks the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-solar-system-explorer.mjs [url]
//
// Writes test-output/sse-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/solar-system-explorer/';
const OUT = 'test-output/sse-e2e';
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
const st = (page) => page.evaluate(() => window.__sse.state());
const wait = (page, ms) => page.waitForTimeout(ms);
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
/** Play the open station (right answers by number key) until its debrief starts. */
async function playStation(page) {
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
/** At a rocky planet stop: drive to a find (teleport just below it, then drive up with the keys until it is in reach) and press Space. */
async function pickUp(page, kind) {
  const spot = { sample: [8.5, 10.2], fact: [17, 13.2], question: [13.5, 16.6] }[kind];
  await page.evaluate(([x, y]) => window.__sse.teleport(x, y), spot);
  await wait(page, 150);
  for (let i = 0; i < 6 && (await st(page)).target !== kind; i++) {
    await page.keyboard.down('ArrowUp');
    await wait(page, 150);
    await page.keyboard.up('ArrowUp');
    await wait(page, 150);
  }
  await waitFor(page, async () => (await st(page)).target === kind, 30);
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.dialogue, .sse-card, .sse-panel').count()) > 0, 30);
  await wait(page, 300);
}

/** Answer whatever is on screen during the Grand Tour until the star party is over. */
async function flyTour(page, shots) {
  let photos = 0;
  let questions = 0;
  for (let guard = 0; guard < 400; guard++) {
    const s = await st(page);
    if (s.fly) photos = Math.max(photos, s.fly.photos);
    if (s.tourDone && s.mode === 'world' && !(await page.locator('.dialogue, .modal-back').count())) break;
    if (s.panel && !s.panel.answered) {
      questions++;
      await page.keyboard.press(String(s.panel.right + 1));
      await wait(page, 250);
      await page.getByRole('button', { name: /back to the flight/i }).click();
    } else if (await page.getByRole('button', { name: /into the album/i }).count()) {
      if (shots.party) await page.screenshot({ path: `${OUT}/${shots.party}` });
      await page.getByRole('button', { name: /into the album/i }).click();
    } else if (await page.locator('.dialogue').count()) {
      if (shots.dot && s.fly && !s.fly.planet && s.fly.photos === 9) {
        await page.screenshot({ path: `${OUT}/${shots.dot}` });
        shots.dot = null;
      }
      const opt = page.locator('.dialogue .choices button:not([disabled])');
      if (await opt.count()) await opt.first().click();
      else await page.keyboard.press('Space');
    } else if (s.fly?.phase === 'ready') {
      await wait(page, 350);
      if (shots.jupiter && s.fly.planet === 'jupiter') {
        await page.screenshot({ path: `${OUT}/${shots.jupiter}` });
        shots.jupiter = null;
      }
      await page.keyboard.press('Space');
    }
    await wait(page, 150);
  }
  return { photos, questions };
}

try {
  const { page } = await newPage();
  await page.addInitScript(() => {
    window.__complete = [];
    window.addEventListener('message', (e) => e.data?.type === 'game-complete' && window.__complete.push(e.data));
  });
  await page.goto(URL);
  await wait(page, 1600);
  check('title screen shows', await page.getByText('Solar System Explorer').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  const cv = await page.locator('.customize .preview canvas').evaluate((c) => [c.width, c.height]);
  check('the character creator shows a 16-bit character (24x36)', cv[0] === 24 && cv[1] === 36, cv.join('x'));
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => page.locator('.dialogue').count());
  check('Navigator Sol opens the story', (await page.locator('.dialogue').textContent())?.includes('Navigator Sol'));
  let sawVee = false;
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    if ((await page.locator('.dialogue').textContent())?.includes('Vee')) sawVee = true;
    await page.keyboard.press('Space');
    await wait(page, 160);
  }
  check('Vee says hello in the opening', sawVee);
  await wait(page, 300);
  let s = await st(page);
  check('the observatory is ready to walk, no lenses lit', s.mode === 'world' && s.done.length === 0 && s.lit === '0000', s.lit);
  const p0 = s.player;
  await page.keyboard.down('ArrowLeft');
  await wait(page, 400);
  await page.keyboard.up('ArrowLeft');
  s = await st(page);
  check('arrow keys walk', s.player.x < p0.x - 0.5, `x ${p0.x.toFixed(1)} -> ${s.player.x.toFixed(1)}`);
  await page.screenshot({ path: `${OUT}/01-observatory.png` });

  // the Orrery, reached by clicking Sol
  await page.evaluate(() => window.__sse.teleport(13.5, 11));
  await wait(page, 300);
  const sol = await page.evaluate(() => window.__sse.screenOf('sol'));
  await page.mouse.click(sol.x, sol.y - 24);
  check('clicking Sol walks there and Sol talks', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 120));
  await talkThrough(page);
  check('the Orrery opens', await waitFor(page, async () => (await page.locator('.sse-orrery').count()) > 0));
  s = await st(page);
  check('level 1, three answers, and a picture above the question', s.panel.tier === 1 && (await page.locator('.sse-choice').count()) === 3 && (await page.locator('.sse-pic img').count()) === 1, s.panel.id);
  check('the question ends with one plain question', s.panel.ask.trim().endsWith('?') && s.panel.ask.split('?').length === 2);
  await page.screenshot({ path: `${OUT}/02-orrery.png` });
  const wrong = [0, 1, 2].find((i) => i !== s.panel.right);
  await page.locator('.sse-choice').nth(wrong).click();
  await wait(page, 400);
  check('a wrong answer is crossed out, with a sentence about the mistake', (await page.locator('.sse-choice.nope').count()) === 1 && (await page.locator('.sse-feedback.try').innerText()).length > 25);
  await page.keyboard.press('h');
  await wait(page, 200);
  check('hint 1 is a nudge (no answer outlined yet)', (await page.locator('.sse-choice.worked').count()) === 0 && (await page.locator('.sse-feedback.hint').count()) === 1);
  await page.keyboard.press('h');
  await wait(page, 300);
  s = await st(page);
  const model = s.panel.model || (await page.locator('.sse-pic img').getAttribute('width')) !== null;
  check('hint 2 adds a picture (a model, or a closer look)', model);
  await page.keyboard.press('h');
  await wait(page, 300);
  check('hint 3 outlines the right answer', (await page.locator('.sse-choice.worked').count()) === 1);
  await page.screenshot({ path: `${OUT}/03-orrery-hints.png` });
  s = await st(page);
  await page.keyboard.press(String(s.panel.right + 1));
  await wait(page, 500);
  s = await st(page);
  check('the right answer by number key, and no star after a miss', s.panel.answered && s.stars.orrery === 0 && (await page.locator('.sse-feedback.good').count()) === 1);
  await page.keyboard.press('Space');
  await wait(page, 400);
  await playStation(page);
  s = await st(page);
  check('five stars start Sol’s debrief', s.stars.orrery === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));
  await talkThrough(page);
  s = await st(page);
  check('the Orrery is done and the first telescope lens is lit', s.done.includes('orrery') && s.lit === '1000' && s.mode === 'world', `${s.done} ${s.lit}`);
  await page.screenshot({ path: `${OUT}/04-one-lens.png` });

  // the station list: walk to Kofi
  await page.keyboard.press('j');
  await wait(page, 300);
  check('J opens the station list: four stations and the Grand Tour (still locked)', (await page.locator('.belt-row').count()) === 5 && (await page.locator('.belt-row.soon').count()) === 1);
  await page.locator('.belt-row').nth(1).getByRole('button', { name: /walk there/i }).click();
  check('"Walk there" walks to Kofi and Kofi talks', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 150));
  await talkThrough(page);
  check('the Sunrise Lab opens', await waitFor(page, async () => (await page.locator('.sse-sunrise').count()) > 0));
  // level 3 is all about shadows: the flagpole scene shows East and West
  await page.keyboard.press('Escape');
  await wait(page, 300);
  for (let i = 0; i < 6; i++) {
    await page.evaluate(() => window.__sse.setTier('sunrise', 2));
    await page.evaluate(() => window.__sse.open('sunrise'));
    await wait(page, 400);
    if (await page.locator('.sse-sky').count()) break;
    await page.keyboard.press('Escape');
    await wait(page, 250);
  }
  check('a shadow question shows the flagpole with East and West', (await page.locator('.sse-compass.east').count()) === 1 && (await page.locator('.sse-compass.west').count()) === 1);
  await page.screenshot({ path: `${OUT}/05-sunrise-sky.png` });
  await playStation(page);
  s = await st(page);
  check('five stars start Kofi’s debrief', s.stars.sunrise === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));
  let sawNext = false;
  for (let i = 0; i < 60 && (await page.locator('.dialogue').count()); i++) {
    if ((await page.locator('.dialogue').textContent())?.includes('could use your help')) sawNext = true;
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) await opt.first().click();
    else await page.keyboard.press('Space');
    await wait(page, 160);
  }
  s = await st(page);
  check('the Sunrise Lab is done: two lenses lit, and Sol says who to help next', s.done.includes('sunrise') && s.lit === '1100' && sawNext, s.lit);

  // the Star Dome: Lumi's season dial, then the questions
  await page.evaluate(() => window.__sse.teleport(7.6, 8.5));
  await wait(page, 300);
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 30);
  check('Lumi introduces the Star Dome', (await page.locator('.dialogue').textContent())?.includes('Lumi'));
  await talkThrough(page);
  check('the season dial opens', await waitFor(page, async () => (await page.locator('.sse-dial-btn').count()) === 4, 40));
  for (const season of ['spring', 'summer', 'autumn']) {
    await page.locator(`.sse-dial-btn[data-season="${season}"]`).click();
    await wait(page, 250);
  }
  check('turning the dial changes the star picture (Scorpius in summer, all four seasons seen)', (await page.locator('.sse-toy-status').innerText()).includes('all the way round') && (await page.locator('.sse-toy img[alt*="Pegasus"]').count()) > 0);
  await page.screenshot({ path: `${OUT}/05b-season-dial.png` });
  await page.getByRole('button', { name: /^done/i }).click();
  await wait(page, 300);
  await talkThrough(page);
  check('the Star Dome questions open, with a picture', await waitFor(page, async () => (await page.locator('.sse-dome .sse-pic img').count()) > 0, 40));
  s = await st(page);
  check('the dial counts as done', s.dialDone);
  await page.keyboard.press('h');
  await wait(page, 150);
  await page.keyboard.press('h');
  await wait(page, 300);
  check('Star Dome hint 2 adds a picture or labels', (await page.locator('.sse-model:not([hidden]) img, .sse-pic .sse-tag').count()) > 0);
  await page.screenshot({ path: `${OUT}/05c-dome-hint.png` });
  await playStation(page);
  s = await st(page);
  check('five stars start Lumi’s debrief', s.stars.dome === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));
  await talkThrough(page);
  check('the Sun’s bonus postcard', await waitFor(page, async () => (await page.getByRole('button', { name: /into the album/i }).count()) > 0, 40));
  await page.getByRole('button', { name: /into the album/i }).click();
  await wait(page, 300);
  await talkThrough(page);
  s = await st(page);
  check('the Star Dome is done: three lenses lit', s.done.includes('dome') && s.lit === '1110' && s.bonus.includes('sun'), s.lit);

  // the Launch Bay: Tess's cannon (real gravity), then the questions
  const tess = await page.evaluate(() => window.__sse.screenOf('tess'));
  await page.mouse.click(tess.x, tess.y - 24);
  check('clicking Tess walks there and Tess talks', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 150));
  await talkThrough(page);
  check('the launch cannon opens', await waitFor(page, async () => (await page.locator('.sse-cannon-canvas').count()) > 0, 40));
  const shoot = async (n) => {
    await page.evaluate((v) => window.__sseCannon.set(v), n);
    await page.keyboard.press('f');
    await waitFor(page, () => page.evaluate(() => window.__sseCannon.outcome !== null), 120);
    return page.evaluate(() => window.__sseCannon.outcome);
  };
  check('a slow shot lands back on the planet', (await shoot(1)) === 'land');
  check('a just-right shot goes into orbit', (await shoot(4)) === 'orbit');
  await page.screenshot({ path: `${OUT}/05d-cannon-orbit.png` });
  check('a super fast shot flies off into space', (await shoot(6)) === 'escape');
  await page.getByRole('button', { name: /^done/i }).click();
  await wait(page, 300);
  await talkThrough(page);
  check('the Launch Bay questions open', await waitFor(page, async () => (await page.locator('.sse-launch .sse-pic img').count()) > 0, 40));
  s = await st(page);
  check('the cannon counts as done (an orbit was found)', s.cannonDone);
  await playStation(page);
  s = await st(page);
  check('five stars start Tess’s debrief', s.stars.launch === 5 && (await page.locator('.dialogue').count()) > 0, JSON.stringify(s.stars));
  await talkThrough(page);
  check('the Moon’s bonus postcard', await waitFor(page, async () => (await page.getByRole('button', { name: /into the album/i }).count()) > 0, 40));
  await page.getByRole('button', { name: /into the album/i }).click();
  await wait(page, 300);
  let sawTour = false;
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    const txt = (await page.locator('.dialogue').textContent()) ?? '';
    if (txt.includes('All four lenses')) sawTour = true;
    const opt = page.locator('.dialogue .choices button:not([disabled])', { hasText: 'Start the Grand Tour' });
    if (await opt.count()) {
      await opt.first().click();
      break;
    }
    await page.keyboard.press('Space');
    await wait(page, 160);
  }
  s = await st(page);
  check('all four lenses lit, and Sol offers the Grand Tour', s.lit === '1111' && sawTour, s.lit);

  // the Grand Tour: plot the route, then fly
  await talkThrough(page);
  check('the route planner opens with eight planets', await waitFor(page, async () => (await page.locator('.sse-route .sse-planet-btn').count()) === 8, 40));
  await page.locator('.sse-route .sse-planet-btn[data-planet="neptune"]').click();
  await wait(page, 250);
  check('a planet out of order is not placed, with a reason', (await page.locator('.sse-slot.filled').count()) === 0 && (await page.locator('.sse-route .sse-toy-status').innerText()).includes('farther out'));
  for (const p of ['mercury', 'venus', 'earth', 'mars']) {
    await page.locator(`.sse-route .sse-planet-btn[data-planet="${p}"]`).click();
    await wait(page, 120);
  }
  check('planets in order fill the route', (await page.locator('.sse-slot.filled').count()) === 4);
  await page.screenshot({ path: `${OUT}/05e-route.png` });
  for (const p of ['jupiter', 'saturn', 'uranus', 'neptune']) {
    await page.locator(`.sse-route .sse-planet-btn[data-planet="${p}"]`).click();
    await wait(page, 120);
  }
  check('the route is set and the flight starts', await waitFor(page, async () => (await st(page)).fly !== null || (await page.locator('.dialogue').count()) > 0, 60));
  const tour = await flyTour(page, { jupiter: '05f-flyby-jupiter.png', dot: '05g-pale-blue-dot.png', party: '05h-star-party.png' });
  s = await st(page);
  check('the Grand Tour: nine photos (eight planets and the Pale Blue Dot)', tour.photos === 9, String(tour.photos));
  check('the Grand Tour asks one question from each station', tour.questions === 4, String(tour.questions));
  check('the star party ends the game: Pluto’s postcard, and the site hears the game is complete', s.tourDone && s.bonus.length === 3 && (await page.evaluate(() => window.__complete.length)) === 1, `${s.bonus}`);
  check('back in the observatory after the star party', s.mode === 'world' && (await page.locator('.sse-party').count()) === 0);

  // the star map and Mars
  await page.keyboard.press('p');
  await wait(page, 400);
  check('P opens the star map with all eight planets', (await page.locator('.sse-planet-btn').count()) === 8);
  await page.screenshot({ path: `${OUT}/06-star-map.png` });
  await page.locator('.sse-planet-btn[data-planet="mars"]').click();
  check('Vee lands on Mars and says so', await waitFor(page, async () => (await page.locator('.dialogue').textContent().catch(() => ''))?.includes('Mars'), 60));
  await talkThrough(page);
  s = await st(page);
  check('on Mars: the stop bar, and three finds to collect', s.onStop === 'mars' && (await page.locator('.sse-stopbar:not([hidden])').count()) === 1 && s.targets.length === 3, s.targets.join(','));
  const r0 = s.player;
  await page.keyboard.down('ArrowRight');
  await wait(page, 400);
  await page.keyboard.up('ArrowRight');
  s = await st(page);
  check('the arrow keys drive the rover', s.player.x > r0.x + 0.5, `x ${r0.x.toFixed(1)} -> ${s.player.x.toFixed(1)}`);
  await page.screenshot({ path: `${OUT}/07-mars.png` });
  await pickUp(page, 'sample');
  check('the sample: Vee says what it is', (await page.locator('.dialogue').textContent())?.includes('rust'));
  await talkThrough(page);
  await pickUp(page, 'fact');
  check('the fact card shows distance, spin, year and moons', (await page.locator('.sse-facts tr').count()) === 5 && (await page.locator('.sse-card').innerText()).includes('687 Earth days'));
  await page.screenshot({ path: `${OUT}/08-fact-card.png` });
  await page.getByRole('button', { name: /got it/i }).click();
  await wait(page, 400);
  await pickUp(page, 'question');
  s = await st(page);
  check('the question opens in a panel, asked by Vee', s.panel?.station === 'stop' && (await page.locator('.sse-stop').count()) === 1);
  await page.keyboard.press(String(s.panel.right + 1));
  await wait(page, 400);
  await page.getByRole('button', { name: /^done/i }).click();
  check('all three finds: the postcard', await waitFor(page, async () => (await page.locator('.sse-postcard').count()) > 0, 40));
  await page.screenshot({ path: `${OUT}/09-postcard.png` });
  await page.getByRole('button', { name: /into the album/i }).click();
  await wait(page, 300);
  await talkThrough(page);
  check('back at the observatory with one postcard', await waitFor(page, async () => {
    const x = await st(page);
    return x.onStop === null && x.mode === 'world' && x.postcards.includes('mars');
  }, 40));

  // Neptune: the cloud dive
  await page.keyboard.press('p');
  await wait(page, 300);
  await page.locator('.sse-planet-btn[data-planet="neptune"]').click();
  check('Neptune is a dive into the clouds (no ground)', await waitFor(page, async () => (await page.locator('.sse-dive').count()) > 0, 40) && (await page.locator('.dialogue').textContent())?.includes('no ground'));
  await talkThrough(page);
  s = await st(page);
  const v0 = s.dive.vee;
  await page.keyboard.down('ArrowRight');
  await wait(page, 500);
  await page.keyboard.up('ArrowRight');
  s = await st(page);
  check('the arrow keys steer Vee in the dive', s.dive.vee > v0 + 10, `${v0.toFixed(0)} -> ${s.dive.vee.toFixed(0)}`);
  const d0 = s.dive.depth;
  await wait(page, 800);
  check('Vee sinks deeper', (await st(page)).dive.depth > d0);
  await page.screenshot({ path: `${OUT}/10-dive.png` });
  for (let i = 0; i < 3; i++) {
    for (let k = 0; k < 80; k++) {
      s = await st(page);
      if (!s.dive || s.dive.paused || s.mode !== 'dive' || !s.dive.finds.length) break;
      await page.evaluate((x) => window.__sse.diveTo(x), s.dive.finds[0].x);
      await wait(page, 120);
    }
    await wait(page, 400);
    s = await st(page);
    if (s.panel) {
      await page.keyboard.press(String(s.panel.right + 1));
      await wait(page, 300);
      await page.getByRole('button', { name: /^done/i }).click();
    } else if (await page.getByRole('button', { name: /got it/i }).count()) await page.getByRole('button', { name: /got it/i }).click();
    else await talkThrough(page);
    await wait(page, 500);
  }
  check('three finds in the clouds: the postcard', await waitFor(page, async () => (await page.locator('.sse-postcard').count()) > 0, 40));
  await page.getByRole('button', { name: /into the album/i }).click();
  await wait(page, 300);
  await talkThrough(page);
  check('back home from the dive with two postcards', await waitFor(page, async () => {
    const x = await st(page);
    return x.onStop === null && x.mode === 'world' && x.postcards.length === 2 && (await page.locator('.sse-dive').count()) === 0;
  }, 40));

  // Venus: leave early, come back, the find stays collected
  await page.evaluate(() => window.__sse.hop('venus'));
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 40);
  await talkThrough(page);
  await pickUp(page, 'sample');
  await talkThrough(page);
  await page.getByRole('button', { name: /back to the observatory/i }).click();
  check('"Back to the observatory" leaves a stop early', await waitFor(page, async () => (await st(page)).onStop === null, 40));
  await page.evaluate(() => window.__sse.hop('venus'));
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 40);
  await talkThrough(page);
  s = await st(page);
  check('back on Venus, the sample is still collected (two finds left)', s.targets.length === 2 && !s.targets.includes('sample') && s.finds.venus?.includes('sample'), s.targets.join(','));
  await page.getByRole('button', { name: /back to the observatory/i }).click();
  await waitFor(page, async () => (await st(page)).onStop === null, 40);

  // the album and the grown-ups page
  await page.keyboard.press('b');
  await wait(page, 300);
  check('B opens the album: two postcards, six to find, and three bonus postcards', (await page.locator('.sse-album-card').count()) === 11 && (await page.locator('.sse-album-card.empty').count()) === 6);
  await page.screenshot({ path: `${OUT}/11-album.png` });
  await page.keyboard.press('Escape');
  await wait(page, 200);
  await page.keyboard.press('g');
  await wait(page, 400);
  const gu = page.locator('.modal');
  check('the grown-ups page opens', (await gu.count()) > 0 && (await gu.innerText()).includes('NGSS'));
  const tab = page.getByRole('tab', { name: /how it is going|progress/i });
  if (await tab.count()) {
    await tab.first().click();
    await wait(page, 200);
  }
  check('the progress report has a row for each station, the planet stops and the Grand Tour', (await page.locator('.progress-table tbody tr').count()) === 6);
  await page.screenshot({ path: `${OUT}/12-grownups.png` });
  await page.keyboard.press('Escape');
  await wait(page, 200);

  // reload: Continue keeps everything
  await page.reload();
  await wait(page, 1500);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 600);
  s = await st(page);
  check('after a reload, Continue keeps the lenses, the postcards and the Grand Tour', s.lit === '1111' && s.postcards.length === 2 && s.finds.venus?.includes('sample') && s.tourDone && s.bonus.length === 3, `${s.lit} ${s.postcards}`);
  check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  check('no requests to other websites', offsite.length === 0, offsite.slice(0, 3).join(' | '));

  // a phone
  const ph = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await ph.page.goto(URL);
  await wait(ph.page, 1500);
  await ph.page.getByRole('button', { name: /start a new game/i }).click();
  await wait(ph.page, 400);
  await ph.page.getByRole('button', { name: /i'm ready/i }).click();
  await wait(ph.page, 600);
  await talkThrough(ph.page);
  await ph.page.screenshot({ path: `${OUT}/20-phone-observatory.png` });
  const wide = await ph.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check('phone: no sideways scrolling', !wide);
  await ph.page.evaluate(() => window.__sse.open('orrery'));
  await wait(ph.page, 600);
  const box = await ph.page.locator('.sse-panel').boundingBox();
  check('phone: the question panel fits on screen', box && box.width <= 390 && box.y + box.height <= 844 + 2, box ? `${Math.round(box.width)}x${Math.round(box.height)} at ${Math.round(box.y)}` : 'none');
  await ph.page.screenshot({ path: `${OUT}/21-phone-orrery.png` });
  await ph.page.keyboard.press('Escape');
  await wait(ph.page, 300);
  await ph.page.evaluate(() => window.__sse.hop('jupiter'));
  await wait(ph.page, 1500);
  await talkThrough(ph.page);
  await wait(ph.page, 500);
  check('phone: the dive fills the screen and the stop bar shows', (await ph.page.locator('.sse-dive').count()) === 1 && (await ph.page.locator('.sse-stopbar:not([hidden])').count()) === 1);
  await ph.page.screenshot({ path: `${OUT}/22-phone-dive.png` });
  // the route planner on a phone
  await ph.page.getByRole('button', { name: /back to the observatory/i }).click();
  await waitFor(ph.page, async () => (await st(ph.page)).onStop === null, 40);
  await ph.page.evaluate(() => {
    window.__sse.finishAll();
    window.__sse.tour();
  });
  await wait(ph.page, 600);
  await talkThrough(ph.page);
  const rbox = await ph.page.locator('.sse-route').boundingBox();
  check('phone: the route planner fits on screen', rbox && rbox.width <= 390 && rbox.y + rbox.height <= 844 + 2, rbox ? `${Math.round(rbox.width)}x${Math.round(rbox.height)} at ${Math.round(rbox.y)}` : 'none');
  await ph.page.screenshot({ path: `${OUT}/23-phone-route.png` });
  check('phone: no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
} catch (e) {
  check('the test ran to the end', false, String(e?.stack ?? e).slice(0, 400));
}
await browser.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify({ results, errors, offsite }, null, 2));
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
