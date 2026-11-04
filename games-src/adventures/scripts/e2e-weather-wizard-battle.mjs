// Browser checks for Weather Wizard Battle: plays from the title screen
// through the camp and every level of half 1 with the keyboard (running,
// jumping and the weather powers), the villager requests, the forecast stops
// and the Weather Book questions, then checks saving, the map, the Book, the
// grown-ups page, easy jumps and a phone. Needs `npx vite --port 5179` running.
//   node scripts/e2e-weather-wizard-battle.mjs [base] [outDir]
//   ONLY=shore,clouds,mountain,extras picks parts (each part loads a save that starts there)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/weather-wizard-battle/index.html', out = 'test-output/wwb-e2e'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
let errors = 0;
let failed = 0;
let passed = 0;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (ok) passed++;
  else failed++;
};
const only = process.env.ONLY?.split(',');
const want = (n) => !only || only.includes(n);

async function openPage(vp = [1280, 800, 1]) {
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, deviceScaleFactor: vp[2] ?? 1 });
  page.on('console', (m) => m.type() === 'error' && (errors++, console.log('[console]', m.text())));
  page.on('pageerror', (e) => (errors++, console.log('[pageerror]', e.message)));
  return page;
}

function helpers(p) {
  const st = () => p.evaluate(() => window.__wwb.state());
  const ps = () => p.evaluate(() => window.__wwb.play());
  const talking = async () => (await st()).talking;
  /** Click through talks; also close a power card or the Weather Shop if one opens (counted in seen). */
  const seen = { cards: 0, shops: 0 };
  const talkThrough = async (max = 60) => {
    for (let i = 0; i < max; i++) {
      if (await talking()) {
        await p.keyboard.press('Space');
        await p.waitForTimeout(200);
      } else if (await p.isVisible('.wwb-cards')) {
        seen.cards++;
        await p.click('.wwb-cards button.primary');
        await p.waitForTimeout(250);
      } else if (await p.isVisible('.wwb-shop')) {
        seen.shops++;
        await p.keyboard.press('Escape');
        await p.waitForTimeout(250);
      } else return;
    }
  };
  /** Press jump and hold it until the top of the jump (so a slow frame rate never cuts it short). */
  const fullJump = async () => {
    await p.keyboard.down('Space');
    let left = false;
    let prev = Infinity;
    for (let i = 0; i < 80; i++) {
      const s = await ps();
      if (!s) break;
      if (!s.onGround) left = true;
      if (left && (s.y > prev || s.onGround)) break;
      prev = s.y;
      await p.waitForTimeout(25);
    }
    await p.keyboard.up('Space');
  };
  /** Hold right until x passes `x` (jumping at each x in `jumps` when on the ground). Talks are clicked through. */
  const runTo = async (x, ms = 9000, jumps = [], dir = 'ArrowRight') => {
    const t0 = Date.now();
    const js = [...jumps];
    const startLevel = (await ps())?.level;
    await p.keyboard.down(dir);
    while (Date.now() - t0 < ms) {
      if (await talking()) {
        await p.keyboard.up(dir);
        await talkThrough();
        await p.keyboard.down(dir);
      }
      const s = await ps();
      if (!s || s.done || s.level !== startLevel) break;
      if (dir === 'ArrowRight' ? s.x >= x : s.x <= x) break;
      if (process.env.TRACE) console.log('trace', s.level, s.x.toFixed(2), s.y.toFixed(2), s.onGround, s.falls, s.paused);
      if (js.length && (dir === 'ArrowRight' ? s.x >= js[0] : s.x <= js[0]) && s.onGround) {
        js.shift();
        await fullJump();
      }
      await p.waitForTimeout(16);
    }
    if (process.env.TRACE || process.env.ENDS) console.log('runTo end', x, Date.now() - t0, JSON.stringify(await ps()).slice(0, 160));
    await p.keyboard.up(dir);
    await p.waitForTimeout(120);
    // if the target was passed in mid-jump, wait for the landing before checking anything
    for (let i = 0; i < 40; i++) {
      const e = await ps();
      if (!e || e.done || e.level !== startLevel || e.onGround || e.standingOn) break;
      await p.waitForTimeout(40);
    }
    return ps();
  };
  /** Keep going right past crabs: a bump only knocks you back a little. */
  const pushOn = async (x, jumps = [], tries = 4) => {
    let s = await runTo(x, 9000, jumps);
    const lv = s?.level;
    for (let i = 0; i < tries && s && !s.done && s.level === lv && s.x < x; i++) s = await runTo(x, 6000, [s.x]);
    return s;
  };
  const jump = async () => fullJump();
  const face = async (d) => {
    await p.evaluate((dd) => window.__wwb.face(dd), d);
  };
  /** Jump onto the newest cloud: steer over its middle while in the air, the way a player would. */
  const hopOn = async () => {
    for (let i = 0; i < 40; i++) {
      const s = await ps();
      if (s.onGround && Math.abs(s.x - (await ps()).x) < 0.01) break;
      await p.waitForTimeout(30);
    }
    const s0 = await ps();
    const cl = s0.clouds[s0.clouds.length - 1];
    const mid = cl.x + 1.5;
    // the cloud may have formed right under the wizard's feet: then there is nothing to jump to
    if (s0.standingOn === cl.id) return;
    await p.keyboard.down('Space');
    let held = null;
    let left = false;
    let prev = Infinity;
    let released = false;
    for (let i = 0; i < 120; i++) {
      const s = await ps();
      if (!s) break;
      const cx = s.x + 0.31;
      if (process.env.HOP) console.log('hop', mid.toFixed(2), s.x.toFixed(2), s.y.toFixed(2), s.onGround, s.standingOn, s.falls);
      const want = cx < mid - 0.4 ? 'ArrowRight' : cx > mid + 0.4 ? 'ArrowLeft' : null;
      if (want !== held) {
        if (held) await p.keyboard.up(held);
        if (want) await p.keyboard.down(want);
        held = want;
      }
      if (!s.onGround) left = true;
      if (!released && left && s.y > prev) {
        await p.keyboard.up('Space');
        released = true;
      }
      prev = s.y;
      if (s.standingOn) break;
      if (left && s.onGround) break;
      await p.waitForTimeout(25);
    }
    if (held) await p.keyboard.up(held);
    if (!released) await p.keyboard.up('Space');
    await p.waitForTimeout(250);
  };
  const power = async (n, wait = 350) => {
    await p.keyboard.press(`Digit${n}`);
    await p.waitForTimeout(wait);
    await talkThrough();
  };
  /** Answer the open question panel until it closes (right answer first; a wrong one now and then to test the hints). */
  const answerUntilClosed = async (max = 30, wrongFirst = false) => {
    for (let i = 0; i < max; i++) {
      const s = await st();
      if (!s.panel) return i;
      if (wrongFirst && i === 0) {
        await p.click(`.wwb-choice[data-value="${s.panel.wrong[0].value}"]`);
        await p.waitForTimeout(150);
      }
      const btns = await p.$$('.wwb-choice');
      await btns[s.panel.right].click();
      await p.waitForTimeout(150);
      await p.keyboard.press('Space');
      await p.waitForTimeout(250);
    }
    return max;
  };
  /** Click through a talk with a question in it, picking the option that matches. */
  const debrief = async (right) => {
    for (let i = 0; i < 40 && (await st()).talking; i++) {
      const opts = await p.$$('.dialogue .choices button:not([disabled])');
      if (opts.length) {
        const texts = await Promise.all(opts.map((o) => o.textContent()));
        const k = texts.findIndex((t) => right.test(t));
        await opts[Math.max(0, k)].click();
      } else await p.keyboard.press('Space');
      await p.waitForTimeout(250);
    }
  };
  return { debrief, st, ps, talking, talkThrough, runTo, pushOn, jump, hopOn, face, power, answerUntilClosed, seen };
}

/** A fresh game with a save that starts at a region (earlier regions finished). */
async function startAt(p, regions = [], extra = {}) {
  await p.goto(base);
  await p.evaluate(
    ([rs, ex]) => {
      const lv = { shore: ['shore-1', 'shore-2'], clouds: ['clouds-1', 'clouds-2'], mountain: ['mountain-1', 'mountain-2'] };
      const zero = { shore: 0, clouds: 0, mountain: 0, river: 0, storm: 0 };
      const save = {
        version: 1,
        appearance: { body: 'girl', skin: 'deep', hairStyle: 'puffs', hairColor: 'black', outfit: 'teal', accessory: 'none' },
        levelsDone: rs.flatMap((r) => lv[r]),
        bestDrops: {},
        requests: [],
        stars: { ...zero, ...Object.fromEntries(rs.map((r) => [r, 5])) },
        played: { ...zero },
        forecast: { ...zero, ...Object.fromEntries(rs.map((r) => [r, 2])) },
        done: rs,
        introSeen: [],
        openingSeen: true,
        irisMet: true,
        halfDoneSeen: false,
        easy: false,
        recent: {},
        learner: {},
        seed: 7,
        ...ex,
      };
      localStorage.setItem('weatherWizardBattle.save', JSON.stringify(save));
    },
    [regions, extra],
  );
  await p.reload();
  await p.waitForTimeout(800);
  await p.click('text=Continue');
  await p.waitForTimeout(500);
}

// ---------------------------------------------------------------- the title, a new game and the camp

if (want('shore')) {
  const p = await openPage();
  const { debrief, st, ps, talkThrough, runTo, pushOn, jump, hopOn, face, power, answerUntilClosed, seen } = helpers(p);
  await p.goto(base);
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForTimeout(1200);
  check(await p.isVisible('text=Weather Wizard Battle'), 'the title screen shows');
  await p.screenshot({ path: `${out}/01-title.png` });
  await p.click('text=Start a new game');
  await p.waitForTimeout(500);
  check(await p.isVisible('.modal'), 'the look picker opens for a new game');
  await p.click('.modal button.primary');
  await p.waitForTimeout(500);
  let s = await st();
  check(s.talking && s.mode === 'busy', 'Professor Nimbus greets the new apprentice');
  await talkThrough();
  s = await st();
  check(s.mode === 'camp' && s.next === 'level:shore-1', 'the opening ends at camp, with Sunny Shore next');
  await p.screenshot({ path: `${out}/02-camp.png` });
  // walk to Dr. Iris and talk
  let c = await runTo(16.6, 6000);
  check((await ps()).target === 'J', 'a Talk prompt shows next to Dr. Iris');
  await p.keyboard.press('KeyE');
  await p.waitForTimeout(300);
  check((await st()).talking, 'pressing E talks to Dr. Iris');
  await talkThrough();
  // the map
  await p.keyboard.press('KeyJ');
  await p.waitForTimeout(300);
  check(await p.isVisible('.wwb-map'), 'J opens the water cycle map');
  await p.screenshot({ path: `${out}/03-map.png` });
  const playButtons = await p.$$eval('.wwb-map .wwb-lv button', (b) => b.map((x) => x.textContent));
  check(playButtons.length === 1, 'only the first level is open at the start');
  await p.click('.wwb-map .wwb-lv button');
  await p.waitForTimeout(500);
  s = await st();
  check(s.mode === 'busy' && s.talking, 'the level starts with Professor Nimbus’s welcome');
  for (let i = 0; i < 60 && (await st()).talking; i++) {
    await p.keyboard.press('Space');
    await p.waitForTimeout(200);
  }
  check(await p.isVisible('.wwb-cards'), 'a power card opens for the first power');
  const cardText = await p.textContent('.wwb-cards');
  check(/Sun/.test(cardText) && /In the game/.test(cardText) && /The science/.test(cardText) && /evaporates/.test(cardText), 'the Sun card says what it does in the game and the real science');
  await p.screenshot({ path: `${out}/04b-power-card.png` });
  await p.click('.wwb-cards button.primary');
  await p.waitForTimeout(300);
  check((await st()).powersSeen.includes('sun') && !(await p.isVisible('.wwb-cards')), 'Got it closes the card, and it is not shown again');
  await talkThrough();
  check((await ps()).level === 'shore-1', 'Sunny Shore level 1, The Beach, is playing');

  // ---- shore-1: run, jump, a gap, ledges, a crab, warm air up the cliff, the washing, the flag
  c = await runTo(17, 9000, [6.6, 12.6]);
  check(c.x > 15 && c.falls === 0, 'runs, jumps up the step and over the gap');
  check(c.carried >= 4, 'collects droplets on the way');
  c = await runTo(19, 3000);
  check(c.respawn.x === 18, 'touching the weather vane makes it the checkpoint');
  await p.screenshot({ path: `${out}/04-shore1.png` });
  c = await pushOn(34, [25.6]);
  check(c.x >= 33.5, 'gets past the crab to the tide pool');
  await face(1);
  await power(2, 200);
  check((await ps()).vapors === 0, 'keys for powers not learned yet do nothing');
  await power(1, 250);
  c = await ps();
  check(c.vapors === 1, 'the Sun on the tide pool makes rising warm air (vapor)');
  await p.screenshot({ path: `${out}/05-sun.png` });
  await p.keyboard.down('ArrowRight');
  for (let i = 0; i < 80; i++) {
    c = await ps();
    if (c.onGround && c.y < 4) break;
    await p.waitForTimeout(40);
  }
  await p.keyboard.up('ArrowRight');
  check(c.onGround && c.y < 4, 'the warm air carries the wizard up onto the cliff');
  c = await runTo(43.4, 5000);
  await talkThrough();
  s = await st();
  c = await ps();
  check(c.x > 42.5, 'the villager asks for help on the cliff');
  await face(1);
  await power(1, 1400);
  await talkThrough();
  s = await st();
  check(s.requests.includes('shore-1'), 'the Sun dries the washing: request done, a badge in the Weather Book');
  c = await pushOn(79, [55.2, 63.8, 68.4]);
  await p.waitForTimeout(300);
  s = await st();
  check(s.levelsDone.includes('shore-1'), 'reaches the finish flag');
  await p.screenshot({ path: `${out}/06-finish.png` });
  await talkThrough();
  await p.waitForTimeout(400);
  await talkThrough();
  s = await st();
  check(s.panel && s.panel.kind === 'forecast', 'Dr. Iris’s forecast stop opens after level 1');
  await p.screenshot({ path: `${out}/07-forecast.png` });
  // a wrong answer, then hints
  const q = s.panel;
  await p.click(`.wwb-choice[data-value="${q.wrong[0].value}"]`);
  await p.waitForTimeout(200);
  check(await p.isVisible('.wwb-feedback.try'), 'a wrong answer gets a reason');
  await p.keyboard.press('KeyH');
  await p.waitForTimeout(200);
  check((await st()).panel.hintRung >= 1, 'H gives a hint');
  await p.keyboard.press('KeyH');
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${out}/08-hint.png` });
  const before = (await st()).wallet;
  await answerUntilClosed(8);
  await p.waitForTimeout(300);
  for (let i = 0; i < 40 && (await st()).talking; i++) {
    await p.keyboard.press('Space');
    await p.waitForTimeout(200);
  }
  s = await st();
  check(s.forecast.shore >= 2, 'two right answers finish the forecast stop');
  check(s.wallet > before, `right answers add droplets to the purse (${before} → ${s.wallet})`);
  check(await p.isVisible('.wwb-shop'), 'the Weather Shop opens after the forecast stop');
  await p.screenshot({ path: `${out}/08b-shop.png` });
  check(await p.isDisabled('.wwb-shop [data-gear="glider"]'), 'a power-up that costs too much cannot be bought yet');
  const w0 = s.wallet;
  await p.click('.wwb-shop [data-gear="radar"]');
  await p.waitForTimeout(300);
  check(await p.isVisible('.wwb-cards'), 'buying a power-up shows its science card');
  check(/radio waves/.test(await p.textContent('.wwb-cards')), 'the Weather Radar card explains how real radar works');
  await p.click('.wwb-cards button.primary');
  await p.waitForTimeout(250);
  s = await st();
  check(s.gear.includes('radar') && s.wallet === w0 - 12, 'the radar is bought for 12 droplets');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  const goNow = await p.isVisible('text=Play it now');
  check(goNow, 'it offers the next level');
  await p.click('text=Play it now');
  await p.waitForTimeout(500);
  await talkThrough();
  await p.waitForTimeout(300);

  // ---- shore-2: warm air to the ledges, then a cloud over the sea, carried by the breeze
  c = await ps();
  check(c.level === 'shore-2', 'Sunny Shore level 2, The Tide Pools, is playing');
  check(c.gear.includes('radar'), 'the power-up is on in the next level');
  await power(1, 250);
  check((await ps()).vapors === 1, 'the Sun warms the first tide pool');
  c = await runTo(6.3, 1500);
  for (let i = 0; i < 60; i++) {
    c = await ps();
    if (c.onGround && c.y < 4) break;
    await p.waitForTimeout(40);
  }
  check(c.carried >= 2 || c.y < 4, 'warm air lifts the wizard to the high ledge droplets');
  c = await runTo(13.2, 6000);
  await face(1);
  await power(2, 300);
  check((await ps()).clouds.length === 0, 'Cool air alone makes no cloud: there is no vapor yet');
  await power(1, 300);
  check((await ps()).vapors >= 1, 'the Sun on the sea makes vapor');
  await power(2, 300);
  c = await ps();
  check(c.clouds.length === 1, 'Cool air turns the vapor into a cloud');
  await p.waitForTimeout(1500);
  // (if the warm air had lifted the wizard, the cloud forms under their feet and sets off with them at once)
  const aboard = c.standingOn === c.clouds[0].id || (await ps()).standingOn === c.clouds[0].id;
  check(aboard || Math.abs((await ps()).clouds[0].x - c.clouds[0].x) < 0.01, 'the cloud waits for the wizard before the breeze takes it');
  await hopOn();
  c = await ps();
  check(c.standingOn && c.standingOn.startsWith('made'), 'stands on the cloud');
  await p.screenshot({ path: `${out}/09-cloud.png` });
  for (let i = 0; i < 200; i++) {
    c = await ps();
    if (c.clouds[0] && c.clouds[0].x > 24.5) break;
    await p.waitForTimeout(50);
  }
  check(c.clouds[0].x > 24.5 && c.standingOn, 'the sea breeze carries the cloud (and the wizard) across');
  c = await runTo(30, 4000, [26]);
  check(c.x > 28 && c.falls === 0, 'jumps off onto the far beach');
  c = await pushOn(41.2, [32.6]);
  await talkThrough();
  await face(1);
  await power(1, 300);
  await power(2, 1500);
  await talkThrough();
  check((await st()).requests.includes('shore-2'), 'a cloud for the picnic’s shade: request done');
  c = await runTo(46.4, 5000);
  await face(1);
  await power(1, 300);
  await power(2, 300);
  await hopOn();
  for (let i = 0; i < 160; i++) {
    c = await ps();
    if (c.clouds.some((k) => k.x > 53.5)) break;
    await p.waitForTimeout(50);
  }
  c = await pushOn(70, [57, 60.5]);
  // the flag may be reached in mid-jump: wait for the landing
  for (let i = 0; i < 30 && !(await st()).levelsDone.includes('shore-2'); i++) await p.waitForTimeout(100);
  s = await st();
  if (process.env.ENDS) console.log('after shore-2', JSON.stringify(await ps()).slice(0, 600), JSON.stringify(s).slice(0, 300));
  check(s.levelsDone.includes('shore-2') && (await ps()).falls === 0, 'crosses the second stretch of sea and reaches the flag');
  await talkThrough();
  await p.waitForTimeout(400);
  await talkThrough();
  s = await st();
  check(s.panel && s.panel.kind === 'book', 'the Weather Book questions open after level 2');
  await answerUntilClosed(20);
  await p.waitForTimeout(400);
  // the talk-it-through question
  s = await st();
  check(s.talking, 'five stars lead to a talk-it-through question');
  await debrief(/Sun warmed it/);
  await talkThrough();
  s = await st();
  check(s.done.includes('shore') && s.next === 'level:clouds-1', 'Sunny Shore is finished and Cloud Heights opens');
  check(seen.cards >= 1, 'the Cool air card showed when the power was new');
  await p.close();
}

// ---------------------------------------------------------------- Cloud Heights

const cloud = (c, id) => c.clouds.find((q) => q.id === id) ?? { x: -1, kind: 'gone' };

/** Ride the cloud under the wizard with Wind until it is past x (or it stops). */
async function rideWind(p, h, untilX, gusts = 4) {
  let c = await h.ps();
  const id = c.standingOn;
  const at = () => c.clouds.find((q) => q.id === id);
  for (let i = 0; i < gusts; i++) {
    const before = at()?.x ?? -1;
    await h.power(3, 200);
    for (let k = 0; k < 70; k++) {
      await p.waitForTimeout(40);
      c = await h.ps();
      if (process.env.HOP) console.log('ride', id, at()?.x.toFixed(2), c.x.toFixed(2), c.y.toFixed(2), c.standingOn, c.falls);
      if (!at() || at().x > untilX) return c;
    }
    if (Math.abs((at()?.x ?? -1) - before) < 0.05 && i >= 5) return c;
  }
  return c;
}

/** Jump straight up until standing at or above row y (climbing a vine or icy steps). */
async function climb(p, h, y, tries = 6) {
  let c = await h.ps();
  for (let i = 0; i < tries && !(c.onGround && c.y + 1.36 <= y + 0.05); i++) {
    await h.jump();
    for (let k = 0; k < 40; k++) {
      await p.waitForTimeout(30);
      c = await h.ps();
      if (c.onGround) break;
    }
  }
  return c;
}

/** Hold a direction for a moment. */
async function nudge(p, dir, ms) {
  await p.keyboard.down(dir);
  await p.waitForTimeout(ms);
  await p.keyboard.up(dir);
  await p.waitForTimeout(150);
}

/** Jump while holding a direction (from a ledge up onto a cliff top). */
async function jumpOver(p, h, dir = 'ArrowRight') {
  await p.keyboard.down(dir);
  await h.jump();
  for (let k = 0; k < 40; k++) {
    await p.waitForTimeout(30);
    if ((await h.ps()).onGround) break;
  }
  await p.keyboard.up(dir);
  await p.waitForTimeout(150);
}

if (want('clouds')) {
  const p = await openPage();
  const h = helpers(p);
  const { st, ps, talkThrough, runTo, pushOn, hopOn, face, power, answerUntilClosed, debrief } = h;
  await startAt(p, ['shore']);
  let s = await st();
  check(s.mode === 'camp' && s.next === 'level:clouds-1', 'a save with Sunny Shore done continues at camp, with Cloud Heights next');
  await p.evaluate(() => window.__wwb.startLevel('clouds-1'));
  await p.waitForTimeout(400);
  await talkThrough();
  let c = await ps();
  check(c.level === 'clouds-1' && c.temp < 20, 'Cloud Heights level 1 plays, cooler up high');
  // the white cloud across the first gap
  c = await runTo(14.2, 6000);
  check(c.standingOn === 'cloud0', 'walks onto the white cloud');
  await face(1);
  c = await rideWind(p, h, 18.5, 3);
  check(c.clouds.find((q) => q.id === 'cloud0').x > 18, 'Wind pushes the white cloud across the gap');
  await p.screenshot({ path: `${out}/20-wind.png` });
  c = await runTo(24.6, 5000);
  check(c.x > 23 && c.falls === 0 && c.respawn.x === 24, 'steps off onto the next island and touches its weather vane');
  // make a cloud over the second gap
  c = await runTo(31.6, 5000);
  await face(1);
  await power(4, 200);
  check((await ps()).vapors === 0, 'Rain is not learned yet on this level');
  await power(1, 250);
  await power(2, 250);
  c = await ps();
  check(
    c.clouds.some((q) => q.made),
    'Sun then Cool air makes a cloud over the gap',
  );
  await hopOn();
  c = await ps();
  check(!!c.standingOn, 'stands on the new cloud');
  await p.evaluate(() => (window.__wwbTrace = []));
  c = await rideWind(p, h, 44.5, 6);
  if ((await ps()).falls) console.log('TRACE', JSON.stringify(await p.evaluate(() => window.__wwbTrace)));
  check(c.clouds.find((q) => q.id === c.standingOn)?.x > 44 || (c.x > 43 && c.falls === 0), 'Wind blows the cloud across the long gap');
  await p.screenshot({ path: `${out}/21-ride.png` });
  c = await runTo(49.6, 4000);
  check(c.x > 48 && c.falls === 0, 'drops onto the last island');
  c = await runTo(52.4, 4000);
  await talkThrough();
  await face(1);
  await power(3, 1500);
  await talkThrough();
  s = await st();
  check(s.requests.includes('clouds-1'), 'Wind turns the windmill: request done');
  await p.screenshot({ path: `${out}/22-windmill.png` });
  c = await runTo(62, 5000);
  await p.waitForTimeout(300);
  s = await st();
  check(s.levelsDone.includes('clouds-1'), 'reaches the flag of Cloud Heights level 1');
  await talkThrough();
  await p.waitForTimeout(400);
  await talkThrough();
  s = await st();
  check(s.panel && s.panel.kind === 'forecast' && s.panel.region === 'clouds', 'the Cloud Heights forecast stop opens');
  await p.screenshot({ path: `${out}/23-cloud-question.png` });
  await answerUntilClosed(8);
  await p.waitForTimeout(300);
  await talkThrough();
  await p.waitForTimeout(300);
  await p.click('text=Play it now');
  await p.waitForTimeout(500);
  await talkThrough();
  await p.waitForTimeout(300);

  // ---- clouds-2: grey clouds, rain, vines
  c = await ps();
  check(c.level === 'clouds-2', 'Cloud Heights level 2, The Grey Clouds, plays');
  await face(1);
  await power(3, 300);
  for (let k = 0; k < 80; k++) {
    c = await ps();
    if (cloud(c, 'cloud1').x > 7.9) break;
    await p.waitForTimeout(40);
  }
  check(cloud(c, 'cloud1').kind === 'grey' && cloud(c, 'cloud1').x > 5.5, 'Wind blows the grey cloud over the seed');
  await power(4, 300);
  c = await ps();
  check(c.vines[0] > 0, 'Rain from the grey cloud grows the seed into a vine');
  await p.screenshot({ path: `${out}/24-rain.png` });
  await p.waitForTimeout(2700);
  c = await ps();
  check(cloud(c, 'cloud1').kind === 'cumulus', 'after raining, the cloud is small and white');
  c = await runTo(9.4, 3000);
  c = await climb(p, h, 3, 6);
  check(c.y + 1.36 <= 3.1, 'climbs the vine to the top of the wall');
  c = await runTo(16.5, 5000);
  check(c.x > 15 && c.respawn.x === 16, 'over the wall and on to the next weather vane');
  c = await runTo(19, 3000);
  await talkThrough();
  await face(1);
  await power(3, 300);
  for (let k = 0; k < 80; k++) {
    c = await ps();
    if (cloud(c, 'cloud2').x > 23) break;
    await p.waitForTimeout(40);
  }
  await power(4, 1500);
  await talkThrough();
  check((await st()).requests.includes('clouds-2'), 'rain on the dry field: request done');
  c = await runTo(31.4, 5000);
  await face(1);
  await power(1, 250);
  await power(2, 250);
  await p.evaluate(() => (window.__wwbTrace = []));
  await hopOn();
  c = await rideWind(p, h, 40.5, 6);
  if ((await ps()).falls) console.log('TRACE2', JSON.stringify(await p.evaluate(() => window.__wwbTrace)));
  c = await runTo(44, 5000);
  check(c.x > 42 && c.falls === 0, 'crosses the pond on a cloud');
  c = await runTo(46.2, 3000);
  await face(1);
  await power(3, 300);
  for (let k = 0; k < 80; k++) {
    c = await ps();
    if (cloud(c, 'cloud0').x > 48.5) break;
    await p.waitForTimeout(40);
  }
  check(cloud(c, 'cloud0').x > 48.5, 'Wind picks the grey cloud (not the cloud just ridden)');
  await power(4, 400);
  c = await ps();
  check(c.vines[1] > 0, 'the second vine grows');
  c = await runTo(50.4, 3000);
  c = await climb(p, h, 5, 5);
  await jumpOver(p, h);
  c = await pushOn(69);
  await p.waitForTimeout(300);
  s = await st();
  check(s.levelsDone.includes('clouds-2'), 'over the second wall and to the flag');
  await talkThrough();
  await p.waitForTimeout(400);
  await talkThrough();
  await answerUntilClosed(20);
  await p.waitForTimeout(400);
  await debrief(/no drops of water/);
  s = await st();
  check(s.done.includes('clouds') && s.next === 'level:mountain-1', 'Cloud Heights is finished and Mountain Pass opens');
  await p.close();
}

// ---------------------------------------------------------------- Mountain Pass

if (want('mountain')) {
  const p = await openPage();
  const h = helpers(p);
  const { st, ps, talkThrough, runTo, pushOn, hopOn, face, power, answerUntilClosed, debrief } = h;
  await startAt(p, ['shore', 'clouds']);
  await p.evaluate(() => window.__wwb.startLevel('mountain-1'));
  await p.waitForTimeout(400);
  let s = await st();
  check(s.talking, 'Dr. Iris welcomes the apprentice to Mountain Pass');
  await talkThrough();
  let c = await ps();
  check(c.level === 'mountain-1' && c.temp === 8, 'Mountain Pass level 1 starts at 8 °C');
  c = await runTo(21, 8000, [8.4]);
  check(c.x > 20 && c.falls === 0, 'jumps the stream');
  c = await runTo(33.2, 8000, [24.4, 27.4]);
  check(c.temp === 2, 'higher up, the thermometer reads 2 °C');
  await face(1);
  await power(5, 300);
  c = await ps();
  check(c.vapors === 0 && /2 °C/.test(await p.textContent('.wwb-msg')), 'Cold will not freeze the pond at 2 °C, and says why');
  await power(1, 250);
  await power(2, 250);
  await hopOn();
  c = await rideWind(p, h, 40, 3);
  c = await runTo(44.6, 5000);
  check(c.x > 43 && c.falls === 0, 'crosses the pond on a cloud instead');
  c = await runTo(58.3, 8000, [46.4, 49.4]);
  check(c.temp === -6, 'at the top it is −6 °C');
  await p.screenshot({ path: `${out}/30-snow.png` });
  await face(1);
  await power(5, 300);
  await p.screenshot({ path: `${out}/31-freeze.png` });
  c = await runTo(71.5, 8000);
  check(c.x > 70 && c.falls === 0, 'Cold freezes the river, and the wizard walks across the ice');
  c = await runTo(73.4, 3000);
  await talkThrough();
  await face(1);
  await power(4, 1500);
  await talkThrough();
  s = await st();
  check(s.requests.includes('mountain-1'), 'Rain from the grey cloud falls as snow below 0 °C: request done');
  await p.screenshot({ path: `${out}/32-snowfall.png` });
  c = await runTo(80.9, 4000);
  await face(1);
  await power(5, 300);
  c = await ps();
  check(c.fallsFrozen[0], 'Cold freezes the waterfall into icy steps');
  c = await runTo(81.1, 2000);
  c = await climb(p, h, 3, 4);
  await jumpOver(p, h);
  c = await pushOn(89);
  await p.waitForTimeout(300);
  s = await st();
  check(s.levelsDone.includes('mountain-1'), 'climbs the frozen waterfall to the flag');
  await talkThrough();
  await p.waitForTimeout(400);
  await talkThrough();
  check((await st()).panel?.kind === 'forecast', 'the Mountain Pass forecast stop opens');
  await answerUntilClosed(8);
  await p.waitForTimeout(300);
  await talkThrough();
  await p.waitForTimeout(300);
  await p.click('text=Play it now');
  await p.waitForTimeout(500);
  await talkThrough();
  await p.waitForTimeout(300);

  // ---- mountain-2: an ice wall, a waterfall, the snowbank, the warm valley river
  c = await ps();
  check(c.level === 'mountain-2' && c.temp === -5, 'Mountain Pass level 2 starts at −5 °C');
  c = await runTo(12.6, 5000);
  await face(1);
  await power(1, 2000);
  c = await ps();
  check(c.iceGone[0], 'the Sun melts the ice wall');
  c = await runTo(20.9, 5000);
  await face(1);
  await power(5, 300);
  check((await ps()).fallsFrozen[0], 'Cold freezes the waterfall');
  c = await runTo(21.1, 2000);
  c = await climb(p, h, 2, 4);
  c = await runTo(34, 5000);
  check(c.respawn.x === 33, 'up the icy steps onto the cliff');
  c = await runTo(43, 6000);
  check(c.temp === 4, 'down in the valley it is 4 °C');
  await face(1);
  await power(1, 3200);
  await talkThrough();
  c = await ps();
  check(c.melted === true, 'the Sun melts the snowbank');
  s = await st();
  check(s.requests.includes('mountain-2'), 'the meltwater fills the dry stream: request done');
  await p.screenshot({ path: `${out}/33-melt.png` });
  c = await runTo(58.6, 6000, [51]);
  check(c.respawn.x === 58 && c.falls === 0, 'jumps the full stream to the next weather vane');
  c = await runTo(62.2, 3000);
  await face(1);
  await power(5, 300);
  check(/4 °C/.test(await p.textContent('.wwb-msg')), 'the warm valley river will not freeze');
  await power(1, 250);
  await power(2, 250);
  await hopOn();
  c = await rideWind(p, h, 71, 4);
  c = await pushOn(81);
  await p.waitForTimeout(300);
  s = await st();
  check(s.levelsDone.includes('mountain-2') && (await ps())?.falls === 0, 'crosses the river on a cloud and reaches the last flag');
  await talkThrough();
  await p.waitForTimeout(400);
  await talkThrough();
  await answerUntilClosed(20);
  await p.waitForTimeout(400);
  await debrief(/below 0 °C at the top/);
  await p.waitForTimeout(300);
  await talkThrough();
  s = await st();
  check(s.done.includes('mountain'), 'Mountain Pass is finished');
  check(s.next === null, 'all three regions of half 1 are done');
  await p.screenshot({ path: `${out}/34-done.png` });
  await p.close();
}

// ---------------------------------------------------------------- the Book, saving, easy jumps, the grown-ups page and a phone

if (want('extras')) {
  const p = await openPage();
  const h = helpers(p);
  const { st, ps, talkThrough } = h;
  await startAt(p, ['shore'], { requests: ['shore-1'] });
  await p.keyboard.press('KeyB');
  await p.waitForTimeout(300);
  check(await p.isVisible('.wwb-guide'), 'B opens the Weather Book');
  const pages = await p.$$eval('.wwb-page strong', (e) => e.map((x) => x.textContent));
  check(pages.includes('Water vapor') && pages.includes('Salt stays behind'), 'the Book has the pages from finished levels');
  check(await p.isVisible('text=Dry washing'), 'the Book shows the villager badges');
  await p.screenshot({ path: `${out}/40-book.png` });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.evaluate(() => {
    const sv = JSON.parse(localStorage.getItem('weatherWizardBattle.save'));
    localStorage.setItem('weatherWizardBattle.save', JSON.stringify({ ...sv, wallet: 40 }));
  });
  await p.reload();
  await p.waitForTimeout(800);
  await p.click('text=Continue');
  await p.waitForTimeout(500);
  await p.keyboard.press('KeyP');
  await p.waitForTimeout(300);
  check(await p.isVisible('.wwb-shop'), 'P opens the Weather Shop at camp');
  check(/40 droplets/.test(await p.textContent('.wwb-wallet')), 'the shop shows the purse');
  await p.click('.wwb-shop [data-gear="bigcloud"]');
  await p.waitForTimeout(300);
  check(/More water vapor/.test(await p.textContent('.wwb-cards')), 'the Big Clouds card explains the science');
  await p.click('.wwb-cards button.primary');
  await p.waitForTimeout(250);
  await p.click('.wwb-shop [data-gear="bigcloud"]');
  await p.waitForTimeout(250);
  let sv = await st();
  check(sv.gear.includes('bigcloud') && sv.wallet === 10, 'Big Clouds bought for 30 droplets');
  check((await p.getAttribute('.wwb-shop [data-gear="bigcloud"]', 'aria-pressed')) === 'false', 'a bought power-up can be switched off');
  await p.click('.wwb-shop [data-gear="bigcloud"]');
  await p.waitForTimeout(200);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.keyboard.press('KeyB');
  await p.waitForTimeout(300);
  check(await p.isVisible('text=Your power-ups'), 'the Weather Book lists the power-ups with their science');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.evaluate(() => window.__wwb.startLevel('clouds-1'));
  await p.waitForTimeout(300);
  await talkThrough();
  await p.click('.wwb-easy');
  await p.waitForTimeout(200);
  check((await ps()).easy && (await st()).easy, 'Easy jumps turns on, and is saved');
  await p.reload();
  await p.waitForTimeout(800);
  check(await p.isVisible('text=Continue'), 'the save is kept after a reload');
  await p.click('text=For grown-ups');
  await p.waitForTimeout(300);
  check(await p.isVisible('text=What it teaches'), 'the grown-ups page opens from the title screen');
  await p.click('text=How it is going');
  await p.waitForTimeout(200);
  check(await p.isVisible('.progress-table'), 'it shows how the child is doing');
  await p.screenshot({ path: `${out}/41-grownups.png` });
  await p.close();

  const phone = await openPage([844, 390, 2]);
  const ph = helpers(phone);
  await startAt(phone, ['shore']);
  await phone.evaluate(() => window.__wwb.startLevel('clouds-1'));
  await phone.waitForTimeout(400);
  await ph.talkThrough();
  await phone.screenshot({ path: `${out}/42-phone.png` });
  const sideways = await phone.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check(!sideways, 'no sideways scrolling on a phone held sideways');
  await phone.close();
}

await browser.close();
console.log(errors ? `${errors} errors` : 'no errors');
console.log(`${passed} passed, ${failed} failed`);
process.exit(errors || failed ? 1 : 0);
