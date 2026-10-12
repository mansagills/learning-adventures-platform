// Browser check for Body System Heroes: plays a new game from the
// title screen. It walks to Dr. Ama, picks the skin mission, flies with the
// arrow keys and by holding the mouse, finds the nest locked before the scans,
// answers scan questions (a wrong answer is crossed out with a sentence about
// it, hints never give the answer away before the last one, Leave reopens the
// spot), answers the nest question, clears the germs with the cleaning beam,
// flies home, plays the clean-and-cover habit with real mouse scrubbing, dives
// again until the skin is healed (debrief, germ file, white blood cell
// escort), then the mouth (saliva wave, used with E) and the lungs (the
// handwashing timer cannot be skipped: 20 real seconds); then the gut (the beam
// hits a good bacterium if it is the closest cell; washing food and the fridge;
// gut buddies), the heart (the blood's flow pushes the ship in beats; the
// jump-rope game raises the heart rate; antibody darts tag germs), the finale
// in the brain (relays in order, the whole gang, the fever, the game tells the
// site it is complete), and free exploring for fact cards. It checks the body
// map list, the grown-ups report, a reload, and the phone layout.
//
//   npm run build && (cd ../../public/games/play && python3 -m http.server 8811 &)
//   node scripts/e2e-body-system-heroes.mjs [url]
//
// Writes test-output/bsh-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:8811/body-system-heroes/index.html';
const OUT = 'test-output/bsh-e2e';
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
const st = (page) => page.evaluate(() => window.__bsh.state());
const fi = (page) => page.evaluate(() => window.__bsh.flightInfo());
const tp = (page, x, y) => page.evaluate(([a, b]) => window.__bsh.teleport(a, b), [x, y]);
const wait = (page, ms) => page.waitForTimeout(ms);
async function waitFor(page, fn, tries = 80) {
  for (let i = 0; i < tries; i++) {
    if (await fn()) return true;
    await wait(page, 100);
  }
  return false;
}
/** Click through the talk box; for a question, pick the first option still enabled. */
async function talkThrough(page, pickLabel) {
  for (let i = 0; i < 60 && (await page.locator('.dialogue').count()); i++) {
    const opt = page.locator('.dialogue .choices button:not([disabled])');
    if (await opt.count()) {
      const want = pickLabel ? opt.filter({ hasText: pickLabel }) : opt;
      if (pickLabel && (await want.count())) await want.first().click();
      else await opt.first().click();
    } else await page.keyboard.press('Space');
    await wait(page, 160);
  }
  await wait(page, 250);
}
/** Answer the open question panel right (by number key) and fly on. */
async function answerRight(page) {
  try {
    await page.locator('.bsh-panel').waitFor({ timeout: 5000 });
  } catch (e) {
    const f = await fi(page);
    const s = await st(page);
    const t1 = (await fi(page)).time;
    const frames = await page.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 500) requestAnimationFrame(f); else r(n); }; requestAnimationFrame(f); }));
    const t2 = (await fi(page)).time;
    console.log('[debug] loop', JSON.stringify({ t1, t2, frames, vis: await page.evaluate(() => document.visibilityState), active: await page.evaluate(() => document.activeElement?.className) }));
    await page.screenshot({ path: `${OUT}/debug-no-panel.png` });
    if (process.env.PROFILE) {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Profiler.enable');
      await cdp.send('Profiler.start');
      await wait(page, 3000);
      const { profile } = await cdp.send('Profiler.stop');
      const self = new Map();
      const dt = profile.timeDeltas;
      const byId = new Map(profile.nodes.map((n) => [n.id, n]));
      profile.samples.forEach((id, i) => {
        const n = byId.get(id);
        const k = `${n.callFrame.functionName || '(anon)'} ${n.callFrame.url.split('/').pop()}:${n.callFrame.lineNumber}`;
        self.set(k, (self.get(k) ?? 0) + (dt[i] ?? 0));
      });
      console.log('[profile]', JSON.stringify([...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => [k, Math.round(v / 1000)])));
      console.log('[counts]', JSON.stringify(await page.evaluate(() => ({ nodes: document.querySelectorAll('*').length, canvases: document.querySelectorAll('canvas').length, toasts: document.querySelectorAll('.toast').length }))));
    }
    console.log('[debug] modal', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.modal-back')].map((m) => ({ cls: m.firstElementChild?.className, text: m.textContent?.slice(0, 120), shown: getComputedStyle(m).display })))));
    console.log('[debug] no panel', JSON.stringify({ mode: s.mode, talking: s.talking, dive: s.dive, ship: f.ship, phase: f.phase, next: f.nextRelay, scans: f.scans, paused: f.paused, time: f.time, modals: await page.locator('.modal-back').count(), toasts: await page.locator('.toast').allInnerTexts() }));
    throw e;
  }
  const s = await st(page);
  await page.keyboard.press(String(s.panel.right_ + 1));
  await wait(page, 300);
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.bsh-panel').count()) === 0);
  await wait(page, 200);
}
/** One whole dive: the scans, the nest, the heal (the first germ by the beam, the rest by the debug hook), home. */
async function dive(page, m, opts = {}) {
  await page.evaluate((x) => window.__bsh.fly(x), m);
  await talkThrough(page);
  await waitFor(page, async () => (await st(page)).mode === 'flight');
  let f = await fi(page);
  for (let i = 0; i < f.scans.length; i++) {
    f = await fi(page);
    await tp(page, f.scans[i].x, f.scans[i].y);
    await answerRight(page);
  }
  f = await fi(page);
  await tp(page, f.nest.x, f.nest.y + 0.2);
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await answerRight(page);
  await waitFor(page, async () => (await fi(page)).phase === 'heal');
  if (opts.beforeHeal) await opts.beforeHeal();
  await page.evaluate(() => window.__bsh.healNow());
  await waitFor(page, async () => (await fi(page)).phase === 'healed');
  f = await fi(page);
  await tp(page, f.exit.x, f.exit.y);
  await waitFor(page, async () => (await st(page)).mode !== 'flight', 40);
}
/** After a dive: the med bay talk, the habit (if it opens), the debrief and germ file. */
async function afterDive(page, habit) {
  for (let i = 0; i < 80; i++) {
    if (await page.locator('.bsh-habit').count()) {
      if (habit) await habit();
      else if (await page.locator('#bsh-habit-title', { hasText: /moving/i }).count()) {
        await page.evaluate(() => window.__bshHabit.addJumps(20));
        for (let k = 0; k < 10 && !(await page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /done/i }).count()); k++) {
          await page.keyboard.press('Space');
          await wait(page, 650);
        }
        await page.locator('.bsh-habit-foot .btn', { hasText: /done/i }).click();
      } else {
        await page.evaluate(() => {
          window.__bshHabit.scrubAll();
          window.__bshHabit.addTime(30);
        });
        await wait(page, 300);
        const band = page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /bandage|fridge/i });
        if (await band.count()) await band.click();
        await wait(page, 300);
        await page.locator('.bsh-habit-foot .btn', { hasText: /done/i }).click();
      }
      await wait(page, 300);
    } else if (await page.locator('.bsh-file').count()) {
      await page.keyboard.press('Escape');
      await wait(page, 300);
    } else if (await page.locator('.dialogue').count()) await talkThrough(page);
    else if ((await st(page)).mode === 'world' && !(await page.locator('.modal').count())) return;
    else await wait(page, 150);
  }
}

try {
  const { page } = await newPage();
  await page.goto(URL);
  await wait(page, 1600);
  check('title screen shows', await page.getByText('Body System Heroes').first().isVisible());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  const cv = await page.locator('.customize .preview canvas').evaluate((c) => [c.width, c.height]);
  check('the character creator shows a 16-bit character (24x36)', cv[0] === 24 && cv[1] === 36, cv.join('x'));
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => page.locator('.dialogue').count());
  check('Dr. Ama opens the story', (await page.locator('.dialogue').textContent())?.includes('Ama'));
  let sawNib = false;
  for (let i = 0; i < 30 && (await page.locator('.dialogue').count()); i++) {
    if ((await page.locator('.dialogue .name').textContent())?.includes('Nib')) sawNib = true;
    await page.keyboard.press('Space');
    await wait(page, 160);
  }
  check('Nib says hello in the opening', sawNib);
  await wait(page, 300);
  let s = await st(page);
  check('the med bay is ready to walk, nothing healed', s.mode === 'world' && s.done.length === 0);
  const p0 = s.player;
  await page.keyboard.down('ArrowLeft');
  await wait(page, 400);
  await page.keyboard.up('ArrowLeft');
  s = await st(page);
  check('arrow keys walk', s.player.x < p0.x - 0.5, `x ${p0.x.toFixed(1)} -> ${s.player.x.toFixed(1)}`);
  check('the HUD shows the body map: 0 of 6 healed', (await page.locator('.bsh-map').innerText()).includes('0 of 6'));
  await page.screenshot({ path: `${OUT}/01-medbay.png` });

  // click Dr. Ama: she asks where to fly; pick the skin
  const pt = await page.evaluate(() => window.__bsh.screenOf('ama'));
  await page.mouse.click(pt.x, pt.y - 24);
  check('clicking Dr. Ama walks there and the talk opens', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 120));
  await waitFor(page, async () => (await page.locator('.dialogue .choices button').count()) >= 3, 80);
  const offered = await page.locator('.dialogue .choices').innerText();
  check('Dr. Ama offers the five organ missions (the brain waits)', /Skin[\s\S]*Mouth[\s\S]*Lungs[\s\S]*gut[\s\S]*Heart/i.test(offered) && !/brain/i.test(offered));
  await talkThrough(page, /skin/i);
  check('the skin dive starts', await waitFor(page, async () => (await st(page)).mode === 'flight'));
  s = await st(page);
  check('the flight bar says 3 scan spots', (await page.locator('.bsh-flightbar').innerText()).includes('Scan spots left: 3'));
  await page.screenshot({ path: `${OUT}/02-skin-flight.png` });

  // fly with keys, then by holding the mouse
  let f = await fi(page);
  const sx = f.ship.x;
  await page.keyboard.down('ArrowRight');
  await wait(page, 500);
  await page.keyboard.up('ArrowRight');
  f = await fi(page);
  check('arrow keys fly the ship', f.ship.x > sx + 0.8, `x ${sx.toFixed(1)} -> ${f.ship.x.toFixed(1)}`);
  const sy = f.ship.y;
  await page.mouse.move(640, 680);
  await page.mouse.down();
  await wait(page, 600);
  await page.mouse.up();
  f = await fi(page);
  check('holding the mouse below the ship flies it down', f.ship.y > sy + 0.6, `y ${sy.toFixed(1)} -> ${f.ship.y.toFixed(1)}`);

  // the nest is locked until the scans are done
  await tp(page, f.nest.x, f.nest.y + 0.2);
  await wait(page, 500);
  check('the nest is locked before the scans (no question, a hint toast)', (await page.locator('.bsh-panel').count()) === 0 && (await page.locator('.toast').allInnerTexts()).join(' ').length > 0);
  await tp(page, f.start?.x ?? 3, f.start?.y ?? 10);

  // the first scan: a wrong answer, hints, Leave reopens the spot
  f = await fi(page);
  await tp(page, f.scans[0].x, f.scans[0].y);
  check('a scan spot opens a scan question', await waitFor(page, async () => (await page.locator('.bsh-panel.bsh-scan').count()) > 0));
  s = await st(page);
  check('three answers, one right', (await page.locator('.bsh-choice').count()) === 3 && s.panel.right_ >= 0);
  check('the question ends with one question mark', s.panel.ask.trim().endsWith('?') && s.panel.ask.split('?').length === 2, s.panel.ask);
  const rightText = (await page.locator('.bsh-choice').nth(s.panel.right_).innerText()).replace(/^\d\s*/, '').trim();
  const wrong = [0, 1, 2].find((i) => i !== s.panel.right_);
  await page.locator('.bsh-choice').nth(wrong).click();
  await wait(page, 400);
  check('a wrong answer is crossed out with a sentence about the mistake', (await page.locator('.bsh-choice.nope').count()) === 1 && (await page.locator('.bsh-feedback.try').innerText()).length > 20);
  await page.keyboard.press('h');
  await wait(page, 300);
  const hint1 = await page.locator('.bsh-feedback').innerText();
  check('hint 1 does not give the answer away', hint1.includes('Hint') && !hint1.toLowerCase().includes(rightText.toLowerCase().replace(/\.$/, '')), hint1);
  await page.keyboard.press('Escape');
  await wait(page, 400);
  f = await fi(page);
  check('Leave closes the question and reopens the scan spot', (await page.locator('.bsh-panel').count()) === 0 && f.scans[0].state === 'open' && (await st(page)).mode === 'flight');
  await tp(page, f.scans[0].x + 3, f.scans[0].y);
  await wait(page, 300);
  await tp(page, f.scans[0].x, f.scans[0].y);
  await page.locator('.bsh-panel').waitFor({ timeout: 4000 });
  s = await st(page);
  await page.keyboard.press(String(s.panel.right_ + 1));
  await wait(page, 300);
  check('a right answer turns green', (await page.locator('.bsh-choice.right').count()) === 1);
  await page.screenshot({ path: `${OUT}/03-scan-right.png` });
  await page.keyboard.press('Space');
  await waitFor(page, async () => (await st(page)).mode === 'flight');
  f = await fi(page);
  check('the answered scan spot is done', f.scans[0].state !== 'open');
  for (let i = 1; i < f.scans.length; i++) {
    f = await fi(page);
    await tp(page, f.scans[i].x, f.scans[i].y);
    await answerRight(page);
  }
  check('after the scans the bar says find the nest', (await page.locator('.bsh-flightbar').innerText()).includes('nest'));
  f = await fi(page);
  await tp(page, f.nest.x, f.nest.y + 0.2);
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  check('the nest opens a germ question with the germ in the picture', await waitFor(page, async () => (await page.locator('.bsh-panel.bsh-diagnose').count()) > 0));
  await answerRight(page);
  await waitFor(page, async () => (await fi(page)).phase === 'heal');
  f = await fi(page);
  check('the heal starts with 5 germs at level 1-2', f.germs.length >= 5, `${f.germs.length} germs`);
  // fly next to a germ: the cleaning beam zaps it
  const g0 = f.germs.length;
  let popped = false;
  for (let k = 0; k < 40 && !popped; k++) {
    f = await fi(page);
    if (!f.germs[0]) break;
    await tp(page, f.germs[0].x + 0.6, f.germs[0].y);
    await wait(page, 150);
    popped = (await fi(page)).germs.length < g0;
  }
  check('flying close lets the cleaning beam pop a germ', popped);
  await page.screenshot({ path: `${OUT}/04-heal.png` });
  await page.evaluate(() => window.__bsh.healNow());
  check('when every germ is gone the area is healed', await waitFor(page, async () => (await fi(page)).phase === 'healed'));
  check('the bar says fly to the ring', (await page.locator('.bsh-flightbar').innerText()).includes('ring'));
  f = await fi(page);
  await tp(page, f.exit.x, f.exit.y);
  check('the ring brings the ship home', await waitFor(page, async () => (await st(page)).mode !== 'flight'));
  // the habit: clean and cover, with real mouse scrubbing
  for (let i = 0; i < 20 && !(await page.locator('.bsh-habit').count()); i++) {
    if (await page.locator('.dialogue').count()) await page.keyboard.press('Space');
    await wait(page, 200);
  }
  check('the clean-and-cover habit opens after the first heal', (await page.locator('.bsh-habit').count()) === 1);
  const left0 = await page.evaluate(() => window.__bshHabit.left());
  const box = await page.locator('.bsh-habit-canvas').boundingBox();
  for (let y = 0.3; y <= 0.7; y += 0.05) for (let x = 0.25; x <= 0.75; x += 0.04) await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
  await wait(page, 300);
  const left1 = await page.evaluate(() => window.__bshHabit.left());
  check('scrubbing with the mouse washes dirt away', left1 < left0, `${left0} -> ${left1}`);
  await page.evaluate(() => window.__bshHabit.scrubAll());
  await page.mouse.move(box.x + 5, box.y + 5);
  check('when it is clean, the bandage step appears', await waitFor(page, async () => (await page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /bandage/i }).count()) === 1));
  await page.locator('.bsh-habit-foot .btn', { hasText: /bandage/i }).click();
  check('the bandage finishes the habit', await waitFor(page, async () => (await page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /done/i }).count()) === 1));
  await page.screenshot({ path: `${OUT}/05-habit.png` });
  await page.locator('.bsh-habit-foot .btn', { hasText: /done/i }).click();
  await afterDive(page);
  s = await st(page);
  check('one dive is not enough to heal the skin', !s.done.includes('skin') && s.stars.skin >= 3, `stars ${s.stars.skin}`);

  // more dives until the skin is healed
  for (let k = 0; k < 4 && !(await st(page)).done.includes('skin'); k++) {
    await dive(page, 'skin');
    await afterDive(page);
  }
  s = await st(page);
  check('the skin is healed: white blood cell escort', s.done.includes('skin') && s.upgrades.includes('escort'), `stars ${s.stars.skin}, played ${s.played.skin}`);
  check('the HUD says 1 of 6 healed', (await page.locator('.bsh-map').innerText()).includes('1 of 6'));

  // the mouth: the escort flies along; then the saliva wave
  let escortSeen = false;
  await dive(page, 'mouth', { beforeHeal: async () => (escortSeen = (await fi(page)).escort) });
  check('the white blood cell escort flies along on the next mission', escortSeen);
  await afterDive(page);
  for (let k = 0; k < 4 && !(await st(page)).done.includes('mouth'); k++) {
    await dive(page, 'mouth');
    await afterDive(page);
  }
  s = await st(page);
  check('the mouth is healed: saliva wave', s.done.includes('mouth') && s.upgrades.includes('wave'));

  // the lungs: the wave with E, and handwashing that takes 20 real seconds
  let waveUsed = false;
  let waveBtn = false;
  await dive(page, 'lungs', {
    beforeHeal: async () => {
      waveBtn = await page.locator('.bsh-wave:not([hidden])').count();
      await page.keyboard.press('e');
      await wait(page, 300);
      waveUsed = (await fi(page)).waveCooldown > 0;
    },
  });
  check('the wave button shows during the heal', waveBtn === 1);
  check('E sends the saliva wave (then it fills up again)', waveUsed);
  let early = null;
  await afterDive(page, async () => {
    await page.evaluate(() => window.__bshHabit.scrubAll());
    const b = await page.locator('.bsh-habit-canvas').boundingBox();
    for (let k = 0; k < 10; k++) await page.mouse.move(b.x + b.width * (0.3 + k * 0.04), b.y + b.height * 0.5);
    await wait(page, 600);
    early = await page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /done/i }).count();
    await page.evaluate(() => window.__bshHabit.addTime(25));
    for (let k = 0; k < 4; k++) await page.mouse.move(b.x + b.width * (0.5 + k * 0.02), b.y + b.height * 0.5);
    await waitFor(page, async () => (await page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /done/i }).count()) === 1);
    await page.screenshot({ path: `${OUT}/06-handwashing.png` });
    await page.locator('.bsh-habit-foot .btn', { hasText: /done/i }).click();
  });
  check('handwashing is not done before 20 seconds, even with every germ gone', early === 0);
  for (let k = 0; k < 4 && !(await st(page)).done.includes('lungs'); k++) {
    await dive(page, 'lungs');
    await afterDive(page);
  }
  s = await st(page);
  check('the lungs are healed: mucus net', s.done.includes('lungs') && s.upgrades.includes('net'));

  // the gut: protect the good bacteria
  let hitHelper = false;
  let helperToast = false;
  await dive(page, 'gut', {
    beforeHeal: async () => {
      // park the ship right on a helper, far from every germ: the beam hits the helper
      const f = await fi(page);
      const far = f.helpers.map((h) => ({ h, d: Math.min(...f.germs.map((g) => Math.hypot(g.x - h.x, g.y - h.y))) })).sort((a, b) => b.d - a.d)[0];
      for (let k = 0; k < 10 && !hitHelper; k++) {
        const now = (await fi(page)).helpers;
        const h = now.reduce((a, b) => (Math.hypot(a.x - far.h.x, a.y - far.h.y) < Math.hypot(b.x - far.h.x, b.y - far.h.y) ? a : b));
        await tp(page, h.x + 0.4, h.y);
        await wait(page, 200);
        hitHelper = (await fi(page)).helperHits > 0;
      }
      helperToast = (await page.locator('.toast').allInnerTexts()).join(' ').includes('good bacterium');
    },
  });
  check('in the gut, the beam hits a good bacterium when it is the closest cell', hitHelper);
  check('and Nib says to steer so the germs are closer', helperToast);
  let fridge = false;
  await afterDive(page, async () => {
    check('the keep-food-safe habit opens after the gut', await page.locator('#bsh-habit-title', { hasText: /food safe/i }).isVisible());
    const left0 = await page.evaluate(() => window.__bshHabit.left());
    const b = await page.locator('.bsh-habit-canvas').boundingBox();
    for (let y = 0.35; y <= 0.7; y += 0.05) for (let x = 0.1; x <= 0.95; x += 0.04) await page.mouse.move(b.x + b.width * x, b.y + b.height * y);
    check('rinsing with the mouse washes dirt off the food', (await page.evaluate(() => window.__bshHabit.left())) < left0);
    await page.evaluate(() => window.__bshHabit.scrubAll());
    await page.mouse.move(b.x + 4, b.y + 4);
    fridge = await waitFor(page, async () => (await page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /fridge/i }).count()) === 1);
    await page.locator('.bsh-habit-foot .btn', { hasText: /fridge/i }).click();
    await waitFor(page, async () => (await page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /done/i }).count()) === 1);
    await page.locator('.bsh-habit-foot .btn', { hasText: /done/i }).click();
  });
  check('then the milk goes in the fridge', fridge);
  for (let k = 0; k < 4 && !(await st(page)).done.includes('gut'); k++) {
    await dive(page, 'gut');
    await afterDive(page);
  }
  s = await st(page);
  check('the gut is healed: gut buddies', s.done.includes('gut') && s.upgrades.includes('buddies'));

  // the heart: the blood pushes in beats; the jump-rope game
  let drift = 0;
  let buddies = 0;
  await page.evaluate(() => window.__bsh.fly('heart'));
  await talkThrough(page);
  await waitFor(page, async () => (await st(page)).mode === 'flight');
  {
    const f0 = await fi(page);
    buddies = f0.buddies;
    await wait(page, 1500);
    drift = (await fi(page)).ship.x - f0.ship.x;
  }
  check('in the blood, the flow carries the ship along', drift > 0.8, `drift ${drift.toFixed(2)}`);
  check('the gut buddies fly with the ship', buddies === 2);
  // finish this dive
  {
    let f = await fi(page);
    for (let i = 0; i < f.scans.length; i++) {
      f = await fi(page);
      await tp(page, f.scans[i].x, f.scans[i].y);
      await answerRight(page);
    }
    f = await fi(page);
    await tp(page, f.nest.x, f.nest.y + 0.2);
    await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
    await talkThrough(page);
    await answerRight(page);
    await waitFor(page, async () => (await fi(page)).phase === 'heal');
    await page.evaluate(() => window.__bsh.healNow());
    await waitFor(page, async () => (await fi(page)).phase === 'healed');
    f = await fi(page);
    await tp(page, f.exit.x, f.exit.y);
  }
  let jumped = 0;
  let bpmUp = false;
  await afterDive(page, async () => {
    check('the get-moving habit opens after the heart', await page.locator('#bsh-habit-title', { hasText: /moving/i }).isVisible());
    // real jumps: press Space and see whether any land as the rope reaches the feet
    for (let k = 0; k < 14; k++) {
      await page.keyboard.press('Space');
      await wait(page, 330);
    }
    jumped = await page.evaluate(() => window.__bshHabit.jumps());
    bpmUp = !(await page.locator('.bsh-habit-label').innerText()).includes('Heartbeat: 80 ');
    await page.evaluate(() => window.__bshHabit.addJumps(20));
    for (let k = 0; k < 10 && !(await page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /done/i }).count()); k++) {
      await page.keyboard.press('Space');
      await wait(page, 650);
    }
    await page.screenshot({ path: `${OUT}/07-jump-rope.png` });
    await page.locator('.bsh-habit-foot .btn', { hasText: /done/i }).click();
  });
  check('jumping with Space counts jumps and the heart rate climbs', jumped > 0 && bpmUp, `${jumped} jumps`);
  for (let k = 0; k < 4 && !(await st(page)).done.includes('heart'); k++) {
    await dive(page, 'heart');
    await afterDive(page);
  }
  s = await st(page);
  check('the heart is healed: antibody darts; the finale opens', s.done.length === 5 && s.upgrades.includes('darts'));

  // the finale: The Big Defense in the brain
  await page.evaluate(() => window.__bsh.fly('brain'));
  await talkThrough(page);
  await waitFor(page, async () => (await st(page)).mode === 'flight');
  f = await fi(page);
  check('the finale has 5 nerve relays, lit one at a time', f.scans.length === 5 && f.nextRelay === 0);
  await tp(page, f.scans[2].x, f.scans[2].y);
  await wait(page, 500);
  check('a relay out of order does not open a question', (await page.locator('.bsh-panel').count()) === 0);
  for (let i = 0; i < 5; i++) {
    f = await fi(page);
    await tp(page, f.scans[i].x, f.scans[i].y);
    await answerRight(page);
  }
  f = await fi(page);
  await tp(page, f.nest.x, f.nest.y + 0.2);
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await answerRight(page);
  await waitFor(page, async () => (await fi(page)).phase === 'heal');
  f = await fi(page);
  check('the whole Grime Gang comes out (at least four kinds of germ)', new Set(f.germs.map((g) => g.kind)).size >= 4, `${f.germs.length} germs`);
  await tp(page, f.germs[0].x + 2, f.germs[0].y);
  await wait(page, 3500);
  check('antibody darts tag germs', (await fi(page)).germs.some((g) => g.tagged) || (await fi(page)).germs.length < f.germs.length);
  await page.screenshot({ path: `${OUT}/08-finale.png` });
  await page.evaluate(() => window.__bsh.healNow());
  await waitFor(page, async () => (await fi(page)).phase === 'healed');
  f = await fi(page);
  await tp(page, f.exit.x, f.exit.y);
  await afterDive(page);
  s = await st(page);
  const done = await page.evaluate(() => window.__bsh.lastMessage());
  check('the finale is won: every part healed', s.done.length === 6);
  check('the game tells the site it is complete', done?.type === 'game-complete');
  check('the HUD says 6 of 6 healed', (await page.locator('.bsh-map').innerText()).includes('6 of 6'));

  // free exploring: fact cards
  await page.evaluate(() => window.__bsh.explore('lungs'));
  await talkThrough(page);
  await waitFor(page, async () => (await st(page)).mode === 'flight');
  f = await fi(page);
  check('exploring shows 3 fact cards and no germs', f.cards.length === 3 && f.germs.length === 0 && f.phase === 'free');
  await tp(page, f.cards[0].x, f.cards[0].y);
  check('flying into a card shows the fact', await waitFor(page, async () => (await page.locator('.bsh-card').count()) === 1));
  await page.screenshot({ path: `${OUT}/09-fact-card.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);
  s = await st(page);
  check('the card is saved', s.cards.length === 1);
  f = await fi(page);
  await tp(page, f.exit.x, f.exit.y);
  await afterDive(page);

  // the body map list
  await page.keyboard.press('j');
  await wait(page, 400);
  const rows = await page.locator('.belt-row').count();
  const soon = await page.locator('.belt-row.soon').count();
  check('the body map lists 6 missions, all open', rows === 6 && soon === 0, `${rows} rows, ${soon} soon`);
  check('the body map shows all five upgrades', (await page.locator('.bsh-up:not(.soon)').count()) === 5);
  check('the body map shows the fact cards found (1 of 18)', (await page.locator('.bsh-up-title', { hasText: '1 of 18' }).count()) === 1);
  await page.screenshot({ path: `${OUT}/10-body-map.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // grown-ups report (G), on the "how it is going" tab
  await page.keyboard.press('g');
  await wait(page, 400);
  await page.getByRole('tab', { name: /how it is going/i }).click();
  await wait(page, 300);
  check('the grown-ups report has a row per mission, all healed', (await page.locator('.progress-table tbody tr').count()) === 6 && (await page.locator('.progress-table').innerText()).match(/Healed/g)?.length === 6);
  await page.screenshot({ path: `${OUT}/11-grownups.png` });

  // reload: the save comes back
  await page.reload();
  await wait(page, 1500);
  check('after a reload the title offers Continue', await page.getByRole('button', { name: /continue/i }).isVisible());
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 800);
  await talkThrough(page);
  s = await st(page);
  check('the save kept the healed organs, upgrades and fact cards', s.done.length === 6 && s.upgrades.length === 5 && s.cards.length === 1);
} catch (e) {
  check('no crash', false, String(e).slice(0, 300));
}

// phone
try {
  const { page } = await newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await page.goto(URL);
  await wait(page, 1500);
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await wait(page, 600);
  await talkThrough(page);
  await page.evaluate(() => window.__bsh.fly('lungs'));
  await talkThrough(page);
  await waitFor(page, async () => (await st(page)).mode === 'flight');
  check('phone: the touch pad shows in flight', await page.locator('.touch-controls:not([hidden]), .touch:not([hidden])').first().isVisible().catch(() => false));
  const f = await fi(page);
  await tp(page, f.scans[0].x, f.scans[0].y);
  await page.locator('.bsh-panel').waitFor({ timeout: 4000 });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  const pb = await page.locator('.bsh-panel').boundingBox();
  check('phone: the question panel fits with no sideways scroll', sw <= 390 && pb.width <= 390 && pb.x >= 0, `scrollWidth ${sw}, panel ${Math.round(pb.width)}`);
  await page.screenshot({ path: `${OUT}/09-phone-question.png` });
} catch (e) {
  check('phone: no crash', false, String(e).slice(0, 300));
}

check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
check('no requests leave the site', offsite.length === 0, offsite.slice(0, 3).join(' '));
await browser.close();
writeFileSync(`${OUT}/report.json`, JSON.stringify({ results, errors, offsite }, null, 2));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} of ${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
