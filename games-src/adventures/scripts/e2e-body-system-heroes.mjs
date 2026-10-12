// Browser check for Body System Heroes (half 1): plays a new game from the
// title screen. It walks to Dr. Ama, picks the skin mission, flies with the
// arrow keys and by holding the mouse, finds the nest locked before the scans,
// answers scan questions (a wrong answer is crossed out with a sentence about
// it, hints never give the answer away before the last one, Leave reopens the
// spot), answers the nest question, clears the germs with the cleaning beam,
// flies home, plays the clean-and-cover habit with real mouse scrubbing, dives
// again until the skin is healed (debrief, germ file, white blood cell
// escort), then the mouth (saliva wave, used with E) and the lungs (the
// handwashing timer cannot be skipped: 20 real seconds). It checks the body map
// list, the grown-ups report, a reload, and the phone layout.
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
  await page.locator('.bsh-panel').waitFor({ timeout: 5000 });
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
      else {
        await page.evaluate(() => {
          window.__bshHabit.scrubAll();
          window.__bshHabit.addTime(30);
        });
        await wait(page, 300);
        const band = page.locator('.bsh-habit-foot .btn:not([hidden])', { hasText: /bandage/i });
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
  check('the HUD shows the body map: 0 of 3 healed', (await page.locator('.bsh-map').innerText()).includes('0 of 3'));
  await page.screenshot({ path: `${OUT}/01-medbay.png` });

  // click Dr. Ama: she asks where to fly; pick the skin
  const pt = await page.evaluate(() => window.__bsh.screenOf('ama'));
  await page.mouse.click(pt.x, pt.y - 24);
  check('clicking Dr. Ama walks there and the talk opens', await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 120));
  await waitFor(page, async () => (await page.locator('.dialogue .choices button').count()) >= 3, 80);
  check('Dr. Ama offers the three open missions', (await page.locator('.dialogue .choices').innerText()).match(/Skin[\s\S]*Mouth[\s\S]*Lungs/i));
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
  check('the HUD says 1 of 3 healed', (await page.locator('.bsh-map').innerText()).includes('1 of 3'));

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
  check('the lungs are healed: mucus net; all three healed', s.done.length === 3 && s.upgrades.includes('net'));
  check('every habit was practised', s.habits.length === 3);

  // the body map list
  await page.keyboard.press('j');
  await wait(page, 400);
  const rows = await page.locator('.belt-row').count();
  const soon = await page.locator('.belt-row.soon').count();
  check('the body map lists 6 missions, 3 coming soon', rows === 6 && soon === 3, `${rows} rows, ${soon} soon`);
  check('the body map shows all three upgrades', (await page.locator('.bsh-up:not(.soon)').count()) === 3);
  await page.screenshot({ path: `${OUT}/07-body-map.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // grown-ups report (G), on the "how it is going" tab
  await page.keyboard.press('g');
  await wait(page, 400);
  await page.getByRole('tab', { name: /how it is going/i }).click();
  await wait(page, 300);
  check('the grown-ups report has a row per mission, all healed', (await page.locator('.progress-table tbody tr').count()) === 3 && (await page.locator('.progress-table').innerText()).match(/Healed/g)?.length === 3);
  await page.screenshot({ path: `${OUT}/08-grownups.png` });

  // reload: the save comes back
  await page.reload();
  await wait(page, 1500);
  check('after a reload the title offers Continue', await page.getByRole('button', { name: /continue/i }).isVisible());
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 800);
  await talkThrough(page);
  s = await st(page);
  check('the save kept the healed organs and upgrades', s.done.length === 3 && s.upgrades.length === 3);
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
