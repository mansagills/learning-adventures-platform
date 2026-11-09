// Browser checks for Ecosystem Building Tycoon: plays from the title screen
// through the opening, the Field Notebook, a whole short run on Meadow Island
// (keys, mouse, Bramble's sniff, new tiles, leaving and carrying on, the
// milestone questions and research cards, the census at night and the
// talk-it-through question), a run on Pond Island that misses a target (the
// gentle ending), a restored Pond Island, a long run, the Woods (autumn
// leaves), the Wetland (too many snails), the Archipelago (the drought and
// Open Day), the Field Guide, the food web board, the grown-ups page and a
// phone. Needs `npx vite --port 5179` running.
//   node scripts/e2e-ecosystem-building-tycoon.mjs [base] [outDir]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/ecosystem-building-tycoon/index.html', out = 'test-output/ebt-e2e'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let errors = 0;
let failed = 0;
let passed = 0;
const check = (ok, what) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (ok) passed++;
  else failed++;
};

async function openPage(vp = [1280, 800]) {
  const page = await browser.newPage({ viewport: { width: vp[0], height: vp[1] }, hasTouch: !!vp[2], isMobile: !!vp[2] });
  page.on('console', (m) => m.type() === 'error' && (errors++, console.log('[console]', m.text())));
  page.on('pageerror', (e) => (errors++, console.log('[pageerror]', e.message)));
  return page;
}

function helpers(p) {
  const st = () => p.evaluate(() => window.__ebt.state());
  const rs = () => p.evaluate(() => window.__ebt.run());
  /** Click through talks. A talk-it-through question gets a wrong answer first, then the right one (always the first option). */
  const asked = { debriefs: 0 };
  const talkThrough = async (max = 80) => {
    for (let i = 0; i < max; i++) {
      const choices = await p.$$('.dialogue .choices button:not([disabled])');
      if (choices.length) {
        const all = await p.$$('.dialogue .choices button');
        if (choices.length === all.length && all.length > 1) {
          asked.debriefs++;
          await all[all.length - 1].click();
        } else await all[0].click();
        await p.waitForTimeout(250);
        continue;
      }
      if ((await st()).talking) {
        await p.keyboard.press('Space');
        await p.waitForTimeout(160);
      } else return;
    }
  };
  const waitIdle = async (ms = 6000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const r = await rs();
      if (!r || !r.busy || r.done) return r;
      if ((await st()).talking || (await p.$('.ebt-panel, .ebt-research, .ebt-census'))) return r;
      await p.waitForTimeout(100);
    }
    return rs();
  };
  /** Answer the open Field Notebook question right (after `wrongFirst` wrong tries) and press Next. */
  const answer = async (wrongFirst = 0) => {
    const s = await st();
    const pnl = s.panel;
    for (let i = 0; i < wrongFirst; i++) await p.click(`.ebt-choice[data-value="${pnl.wrong[i].value}"]`);
    await p.click('.ebt-choice[data-value="right"]');
    await p.waitForTimeout(150);
    await p.click('.ebt-foot .btn.primary');
    await p.waitForTimeout(250);
  };
  /** Play one season the careful way (Bramble's best move; new tiles when nothing helps), handling milestones. */
  const careful = { rerolled: 0, research: 0, questions: 0 };
  const season = async (useKeys = false) => {
    let r = await waitIdle();
    if (!r || r.done) return r;
    if (r.best && r.best.gain <= 1 && r.rerolls > 0) {
      await p.keyboard.press('r');
      careful.rerolled++;
      await p.waitForTimeout(150);
      r = await rs();
    }
    if (useKeys) {
      await p.keyboard.press(String(r.best.card + 1));
      await p.waitForTimeout(80);
      // walk the cursor to the cell, then press Enter
      await p.evaluate((c) => window.__ebt.place(c), r.best.cell);
    } else await p.evaluate((m) => (window.__ebt.pick(m.card), window.__ebt.place(m.cell)), r.best);
    await p.waitForTimeout(450);
    for (let k = 0; k < 40; k++) {
      await talkThrough();
      if (await p.$('.ebt-panel')) {
        careful.questions++;
        await answer(careful.questions % 2);
        continue;
      }
      if (await p.$('.ebt-research')) {
        careful.research++;
        await p.click('.ebt-research-card');
        await p.waitForTimeout(300);
        continue;
      }
      const x = await rs();
      if (!x || x.done || !x.busy) break;
      await p.waitForTimeout(150);
    }
    return rs();
  };
  return { st, rs, talkThrough, waitIdle, answer, season, careful, asked };
}

/** Click a cell of the island with the mouse. */
async function clickCell(p, cell) {
  const r = await p.evaluate(() => window.__ebt.run());
  const box = await p.locator('.ebt-board').boundingBox();
  const x = (cell % r.w) * 24 + 12 + r.view.ox;
  const y = Math.floor(cell / r.w) * 24 + 12 + r.view.oy;
  await p.mouse.click(box.x + (x / r.view.w) * box.width, box.y + (y / r.view.h) * box.height);
}

// ------------------------------------------------------------ the title, the opening, the Field Notebook
const p = await openPage();
const H = helpers(p);
await p.goto(base);
await p.waitForTimeout(700);
check(await p.isVisible('text=Ecosystem Building Tycoon'), 'title screen shows');
await p.screenshot({ path: `${out}/01-title.png` });
await p.click('text=Start a new game');
await p.waitForTimeout(500);
check((await H.st()).talking, 'Warden Nia starts the opening');
await p.screenshot({ path: `${out}/02-opening.png` });
await H.talkThrough();
let s = await H.st();
check(s.mode === 'station', 'the ranger station after the opening');
check(await p.isVisible('[data-run="meadow-short"]'), 'Meadow Island offers a short run');
check(await p.isVisible('[data-run="meadow-long"]'), 'Meadow Island offers a long run');
check(!(await p.isVisible('[data-run="pond-short"]')), 'Pond Island is locked at first');
await p.screenshot({ path: `${out}/03-station.png` });

await p.click('[data-notebook="meadow"]');
await p.waitForTimeout(400);
s = await H.st();
check(s.panel?.island === 'meadow' && s.panel.tier === 1, 'the Field Notebook asks a level 1 Meadow question');
await p.click(`.ebt-choice[data-value="${s.panel.wrong[0].value}"]`);
await p.waitForTimeout(150);
check(await p.isVisible('.ebt-feedback.try'), 'a wrong answer explains the likely mistake');
await p.keyboard.press('h');
await p.keyboard.press('h');
await p.waitForTimeout(200);
check((await H.st()).panel.hintRung === 2, 'two hints');
await p.screenshot({ path: `${out}/04-notebook-hint.png` });
await p.click('.ebt-choice[data-value="right"]');
await p.waitForTimeout(150);
check(await p.isVisible('.ebt-feedback.good'), 'the right answer is praised and explained');
check((await H.st()).stars.meadow === 0, 'no star after a wrong first try');
await p.keyboard.press('Space');
await p.waitForTimeout(300);
await H.answer(0);
check((await H.st()).stars.meadow === 1, 'a star for a clean answer');
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
check((await H.st()).mode === 'station', 'Esc leaves the Field Notebook');

// ------------------------------------------------------------ a short run on Meadow Island
await p.evaluate(() => window.__ebt.start('meadow', 'short', 4242));
await p.waitForTimeout(500);
check((await H.st()).talking, 'Lupe introduces Meadow Island');
await H.talkThrough();
let r = await H.rs();
check(r && r.season === 1 && r.hand.length === 3, 'season 1 with three tiles in the hand');
check(r.targets.length === 3, 'a short run has three targets');
check(r.pieces.includes('vine'), 'the meadow starts with an invasive vine');
await p.screenshot({ path: `${out}/05-run-start.png` });

// keys: pick a card, move the cursor
await p.keyboard.press('1');
await p.waitForTimeout(100);
r = await H.rs();
check(r.selected === 0, 'key 1 picks the first tile');
await p.keyboard.press('ArrowLeft');
await p.waitForTimeout(80);
check((await p.textContent('.ebt-tip')).length > 10, 'the tip says what the tile would do there');
// the mouse: place Bramble's best spot for that card
const best0 = await p.evaluate(() => {
  const r = window.__ebt.run();
  return r.best;
});
await p.evaluate((c) => window.__ebt.pick(c), best0.card);
await clickCell(p, best0.cell);
await p.waitForTimeout(500);
r = await H.waitIdle();
check(r.season === 2 && r.pieces[best0.cell] !== null, 'a mouse click places the tile, and the season moves on');
// sniff and new tiles
await p.keyboard.press('s');
await p.waitForTimeout(200);
check((await p.textContent('.ebt-tip')).includes('Bramble sniffs'), 'Bramble sniffs out the best square');
await p.screenshot({ path: `${out}/06-sniff.png` });
const before = (await H.rs()).rerolls;
await p.keyboard.press('r');
await p.waitForTimeout(150);
check((await H.rs()).rerolls === before - 1, 'R deals new tiles (one fewer left)');
await p.keyboard.press('f');
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/07-food-web.png` });
await p.keyboard.press('f');
// leave and carry on
await p.keyboard.press('t');
await p.waitForTimeout(200);
await p.click('text=Yes, go back');
await p.waitForTimeout(400);
check((await H.st()).mode === 'station' && (await H.st()).hasRun, 'T goes back to the station, and the run is saved');
await p.click('[data-resume]');
await p.waitForTimeout(400);
r = await H.rs();
check(r.season === 2 && r.pieces[best0.cell] !== null, 'Carry on picks the run up where it was');

for (let i = 0; i < 30; i++) {
  r = await H.season(i % 3 === 0);
  if (process.env.TRACE)
    console.log('trace', JSON.stringify({ season: r?.season, health: r?.health, reached: r?.reached, busy: r?.busy, done: r?.done, best: r?.best }), JSON.stringify((await H.st()).mode));
  if (i === 1) await p.screenshot({ path: `${out}/08-combo.png` });
  if (!r || r.done) break;
}
for (let k = 0; k < 40 && !(await p.$('.ebt-census')); k++) {
  await H.talkThrough();
  await p.waitForTimeout(200);
}
check(await p.isVisible('.ebt-census'), 'a restored island ends with the census');
await p.screenshot({ path: `${out}/09-census.png` });
await p.click('.ebt-census .btn.primary');
await p.waitForTimeout(300);
await H.talkThrough();
for (let k = 0; k < 20 && (await H.st()).mode !== 'station'; k++) await p.waitForTimeout(200);
s = await H.st();
check(s.restored.includes('meadow') && s.lastEnd?.won, 'Meadow Island is restored');
check(H.careful.questions >= 2 && H.careful.research >= 2, `a question and a research card at each milestone (${H.careful.questions} questions, ${H.careful.research} research)`);
check(H.asked.debriefs >= 1, 'the talk-it-through question is asked');
check(s.unlocked.includes('owl'), 'the owl is unlocked');
check(await p.isVisible('[data-run="pond-short"]'), 'Pond Island opens');
await p.screenshot({ path: `${out}/10-station-after.png` });

// ------------------------------------------------------------ a careless run on Pond Island (missing a target)
await p.evaluate(() => window.__ebt.start('pond', 'short', 99));
await p.waitForTimeout(500);
check((await H.st()).talking, 'Theo introduces Pond Island');
await H.talkThrough();
for (let i = 0; i < 8; i++) {
  r = await H.waitIdle();
  if (!r || r.done) break;
  // the worst move: the first tile on its last spot
  await p.evaluate(() => {
    const r = window.__ebt.run();
    const id = r.hand.find((x) => ['fox', 'hawk', 'heron', 'fish', 'frog'].includes(x)) ?? r.hand[0];
    const card = r.hand.indexOf(id);
    window.__ebt.pick(card);
    const ground = r.ground;
    const land = ['grass', 'soil', 'rich', 'mud'];
    for (let c = r.pieces.length - 1; c >= 0; c--) {
      const g = ground[c];
      if (!g || r.pieces[c]) continue;
      window.__ebt.place(c);
      if (window.__ebt.run().season !== r.season || window.__ebt.run().busy) return;
    }
    void land;
  });
  await p.waitForTimeout(500);
}
for (let k = 0; k < 30 && !(await H.st()).talking; k++) await p.waitForTimeout(200);
check((await H.st()).talking, 'a missed target ends the run with Warden Nia');
const say = await p.textContent('.dialogue');
check(/target was/.test(say ?? ''), 'Nia says the health and the target');
await p.screenshot({ path: `${out}/11-missed.png` });
await H.talkThrough();
for (let k = 0; k < 20 && (await H.st()).mode !== 'station'; k++) await p.waitForTimeout(200);
s = await H.st();
check(s.lastEnd && !s.lastEnd.won && !!s.lastEnd.trouble, `the run ends gently with a reason (${s.lastEnd?.trouble})`);
check(s.unlocked.includes('deer'), 'a tile is unlocked even after a missed target');
check(!s.hasRun, 'the finished run is cleared');

// ------------------------------------------------------------ a restored Pond Island
await p.evaluate(() => window.__ebt.start('pond', 'short', 2424));
await p.waitForTimeout(400);
await H.talkThrough();
for (let i = 0; i < 30; i++) {
  r = await H.season();
  if (i === 6) await p.screenshot({ path: `${out}/12-pond.png` });
  if (!r || r.done) break;
}
for (let k = 0; k < 40 && !(await p.$('.ebt-census')); k++) {
  await H.talkThrough();
  await p.waitForTimeout(200);
}
if (await p.$('.ebt-census')) await p.click('.ebt-census .btn.primary');
await p.waitForTimeout(300);
await H.talkThrough();
for (let k = 0; k < 20 && (await H.st()).mode !== 'station'; k++) await p.waitForTimeout(200);
s = await H.st();
check(s.restored.includes('pond'), 'Pond Island is restored');
check(H.asked.debriefs >= 2, 'the pond talk-it-through question is asked');

// a level 3 pond question with its web picture
await p.evaluate(() => window.__ebt.ask('pond', 'p-algae'));
await p.waitForTimeout(300);
check(await p.isVisible('.ebt-web'), 'the pond food web picture');
await p.keyboard.press('h');
await p.keyboard.press('h');
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/13-web-question.png` });
await p.keyboard.press('Escape');
await p.waitForTimeout(200);

// ------------------------------------------------------------ a long run
await p.click('[data-run="meadow-long"]');
await p.waitForTimeout(400);
await H.talkThrough();
r = await H.rs();
check(r.targets.length === 5 && r.seasons === 20, 'a long run has five targets over 20 seasons');
check((await p.textContent('.ebt-hud')).includes('Long run'), 'the panel says Long run');
await p.keyboard.press('t');
await p.waitForTimeout(200);
await p.click('text=Yes, go back');
await p.waitForTimeout(300);

// ------------------------------------------------------------ half 2: the Woods, the Wetland and the Archipelago
/** Play one island carefully to the end (trying the next seed if a run misses a target). `each` runs after every season. */
async function playIsland(kind, seeds, each = async () => {}) {
  for (const seed of seeds) {
    await p.evaluate(([k, sd]) => window.__ebt.start(k, 'short', sd), [kind, seed]);
    await p.waitForTimeout(400);
    await H.talkThrough();
    for (let i = 0; i < 30; i++) {
      r = await H.season();
      await each(i, r);
      if (!r || r.done) break;
    }
    for (let k = 0; k < 40 && !(await p.$('.ebt-census')) && (await H.st()).mode !== 'station'; k++) {
      await H.talkThrough();
      await p.waitForTimeout(200);
    }
    if (await p.$('.ebt-census')) {
      if (kind === 'archipelago') await p.screenshot({ path: `${out}/22-archipelago-census.png` });
      await p.click('.ebt-census .btn.primary');
    }
    await p.waitForTimeout(300);
    for (let k = 0; k < 40 && (await H.st()).mode !== 'station'; k++) {
      await H.talkThrough();
      await p.waitForTimeout(200);
    }
    if ((await H.st()).restored.includes(kind)) return seed;
    console.log(`(the ${kind} run with seed ${seed} missed a target; trying another island)`);
  }
  return null;
}

check(await p.isVisible('[data-run="woods-short"]'), 'Woods Island opens after Pond Island');
check(!(await p.isVisible('[data-run="wetland-short"]')), 'Wetland Island is still locked');
let leavesBefore = 0;
let autumnLeaves = false;
let woodsShot = false;
const woods = await playIsland('woods', [1111, 1212, 1313], async (i, x) => {
  if (!x) return;
  const leaves = x.pieces.filter((q) => q === 'leaves').length;
  if (x.season === 3) leavesBefore = leaves;
  if (x.season === 4 && leaves > leavesBefore) autumnLeaves = true;
  if (i === 7 && !woodsShot) {
    woodsShot = true;
    await p.screenshot({ path: `${out}/17-woods.png` });
  }
});
check(woods !== null, `Woods Island is restored (seed ${woods})`);
check(autumnLeaves, 'the oaks drop their leaves in autumn');

const wet0 = await p.evaluate(() => {
  window.__ebt.start('wetland', 'short', 5);
  return true;
});
void wet0;
await p.waitForTimeout(400);
await H.talkThrough();
r = await H.rs();
check(r.pieces.filter((q) => q === 'snail').length === 3, 'the wetland starts with too many snails');
check(await p.isVisible('.ebt-minibars'), 'the panel shows the island census (plants, plant-eaters, meat-eaters)');
await p.screenshot({ path: `${out}/18-wetland-start.png` });
await p.keyboard.press('t');
await p.waitForTimeout(200);
await p.click('text=Yes, go back');
await p.waitForTimeout(300);
const wetland = await playIsland('wetland', [2222, 2323, 2424]);
check(wetland !== null, `Wetland Island is restored (seed ${wetland})`);
s = await H.st();
check(s.restored.includes('wetland'), 'all four islands are restored');
check(await p.isVisible('[data-run="archipelago-short"]'), 'the Archipelago opens');
await p.screenshot({ path: `${out}/19-station-finale.png` });

let droughtSeen = false;
let droughtShot = false;
let droughtEnded = false;
const archi = await playIsland('archipelago', [3333, 3434, 3535], async (i, x) => {
  if (!x) return;
  if (x.drought > 0) {
    droughtSeen = true;
    if (!droughtShot) {
      droughtShot = true;
      check(await p.isVisible('.ebt-drought'), 'the panel counts down the drought');
      await p.screenshot({ path: `${out}/20-drought.png` });
    }
  }
  if (x.droughtDone) droughtEnded = true;
});
check(archi !== null, `the Archipelago is restored (seed ${archi})`);
check(droughtSeen && droughtEnded, 'the drought dries the east pond, then the rain comes back');
s = await H.st();
check(s.restored.includes('archipelago'), 'every island is restored');

// the research hut
await p.click('[data-hut="guide"]');
await p.waitForTimeout(300);
const pages = await p.$$eval('.ebt-guide-card', (els) => els.map((e) => e.classList.contains('locked')));
check(pages.length === 26 && pages.filter((x) => !x).length >= 15, `the Field Guide has a page for every tile (${pages.filter((x) => !x).length} found)`);
await p.screenshot({ path: `${out}/21-field-guide.png` });
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
await p.evaluate(() => window.__ebt.see(['log', 'mushrooms']));
await p.click('[data-hut="web"]');
await p.waitForTimeout(400);
await p.click('[data-web="grass"]');
await p.click('[data-web="rabbit"]');
await p.waitForTimeout(150);
check(await p.isVisible('.ebt-webpanel .ebt-feedback.good'), 'the food web board accepts grass to rabbit');
await p.click('[data-web="fox"]');
await p.click('[data-web="rabbit"]');
await p.waitForTimeout(150);
check((await p.textContent('.ebt-webpanel .ebt-feedback')).includes('Arrows point to the eater'), 'a backwards arrow gets a reminder that arrows point to the eater');
await p.click('[data-web="rabbit"]');
await p.click('[data-web="fox"]');
await p.click('[data-web="log"]');
await p.click('[data-web="mushrooms"]');
await p.waitForTimeout(200);
check((await H.st()).webLinks >= 3, 'right arrows are saved');
await p.screenshot({ path: `${out}/23-food-web-board.png` });
await p.keyboard.press('Escape');
await p.waitForTimeout(300);

// a woods question with the decomposer cycle, and a wetland graph
await p.evaluate(() => window.__ebt.ask('woods', 'w-energy-matter'));
await p.waitForTimeout(300);
check(await p.isVisible('.ebt-cycle'), 'the decomposer cycle picture');
await p.screenshot({ path: `${out}/24-woods-question.png` });
await p.keyboard.press('Escape');
await p.waitForTimeout(200);
await p.evaluate(() => window.__ebt.ask('wetland', 'n-rise-fall'));
await p.waitForTimeout(300);
check(await p.isVisible('.ebt-pop-graph'), 'the predator and prey graph');
await p.keyboard.press('h');
await p.keyboard.press('h');
await p.waitForTimeout(200);
await p.screenshot({ path: `${out}/25-wetland-question.png` });
await p.keyboard.press('Escape');
await p.waitForTimeout(200);

// ------------------------------------------------------------ the grown-ups page
await p.click('[data-tool="settings"]');
await p.waitForTimeout(300);
await p.click('text=For grown-ups');
await p.waitForTimeout(300);
const gu = await p.textContent('.modal-back');
check(gu.includes('NGSS 5-LS2-1'), 'the grown-ups page lists the standards');
await p.click('text=How it is going');
await p.waitForTimeout(200);
check(await p.isVisible('.progress-table'), 'the grown-ups page shows progress');
await p.screenshot({ path: `${out}/14-grownups.png` });
await p.close();

// ------------------------------------------------------------ a phone
const ph = await openPage([390, 844, true]);
await ph.goto(base);
await ph.evaluate(() => localStorage.clear());
await ph.reload();
await ph.waitForTimeout(500);
await ph.click('text=Start a new game');
const PH = helpers(ph);
await PH.talkThrough();
await ph.evaluate(() => window.__ebt.start('meadow', 'short', 4242));
await ph.waitForTimeout(400);
await PH.talkThrough();
check(await ph.evaluate(() => document.querySelector('.ebt-run').classList.contains('tall')), 'the phone layout stacks the panel, island and hand');
const wide = await ph.evaluate(() => Math.max(document.documentElement.scrollWidth, document.querySelector('.ebt-run').scrollWidth) <= innerWidth + 1);
check(wide, 'no sideways scrolling on a phone');
// tap a card, tap a square twice
r = await PH.rs();
await ph.tap(`.ebt-card >> nth=${r.best.card}`);
const box = await ph.locator('.ebt-board').boundingBox();
const tapCell = async (cell) => {
  const x = (cell % r.w) * 24 + 12 + r.view.ox;
  const y = Math.floor(cell / r.w) * 24 + 12 + r.view.oy;
  await ph.touchscreen.tap(box.x + (x / r.view.w) * box.width, box.y + (y / r.view.h) * box.height);
};
await tapCell(r.best.cell);
await ph.waitForTimeout(200);
check((await PH.rs()).season === 1 && (await ph.isVisible('.ebt-place')), 'the first tap shows what would happen, with a Place button');
await ph.screenshot({ path: `${out}/15-phone-preview.png` });
await tapCell(r.best.cell);
await ph.waitForTimeout(600);
check((await PH.rs()).season === 2, 'the second tap places the tile');
await ph.screenshot({ path: `${out}/16-phone-run.png`, fullPage: true });
await ph.evaluate(() => window.__ebt.start);
await ph.close();

await browser.close();
console.log(`\n${passed} passed, ${failed} failed, ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
