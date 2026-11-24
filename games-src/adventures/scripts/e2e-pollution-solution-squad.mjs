// Browser checks for Pollution Solution Squad: plays from the title screen
// through Beach Camp and all eight levels with the keyboard (running,
// jumping, grabbing trash, freeing Ollie, crafting at the Workbench, building
// and testing fixes, the kayak, the boardwalk and the stepping stones), the
// sorting station, the water tests, the Squad Journal questions and the
// talk-it-through questions, The Big Rain finale, then the Nature Center,
// saving, the map, the Journal, the grown-ups page and a phone.
// Needs `npx vite --port 5179` running.
//   node scripts/e2e-pollution-solution-squad.mjs [base] [outDir]
//   ONLY=beach,harbor,wetland,town,nature,extras picks parts (each part loads a save that starts there)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const [base = 'http://localhost:5179/pollution-solution-squad/index.html', out = 'test-output/pss-e2e'] = process.argv.slice(2);
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
  const st = () => p.evaluate(() => window.__pss.state());
  const ps = () => p.evaluate(() => window.__pss.play());
  const talking = async () => (await st()).talking;
  const talkThrough = async (max = 60) => {
    for (let i = 0; i < max; i++) {
      if (!(await talking())) return;
      await p.keyboard.press('Space');
      await p.waitForTimeout(200);
    }
  };
  /** Press jump and hold it until the top of the jump. */
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
  /** Hold a direction until the middle of the body passes `x`, jumping at each x in `jumps`. Talks are clicked through. */
  const runTo = async (x, ms = 9000, jumps = [], dir = 'ArrowRight') => {
    const t0 = Date.now();
    const js = [...jumps];
    const lv = (await ps())?.level;
    await p.keyboard.down(dir);
    while (Date.now() - t0 < ms) {
      if (await talking()) {
        await p.keyboard.up(dir);
        await talkThrough();
        await p.keyboard.down(dir);
      }
      const s = await ps();
      if (!s || s.done || s.level !== lv || s.modal) break;
      const cx = s.x + 0.31;
      if (dir === 'ArrowRight' ? cx >= x : cx <= x) break;
      if (js.length && (dir === 'ArrowRight' ? cx >= js[0] : cx <= js[0]) && (s.onGround || s.standingOn)) {
        js.shift();
        await fullJump();
      }
      await p.waitForTimeout(16);
    }
    await p.keyboard.up(dir);
    await p.waitForTimeout(120);
    for (let i = 0; i < 40; i++) {
      const e = await ps();
      if (!e || e.done || e.onGround || e.standingOn) break;
      await p.waitForTimeout(40);
    }
    return ps();
  };
  /** Keep going right past crabs (a bump knocks you back a little). */
  const pushOn = async (x, jumps = [], tries = 4) => {
    let s = await runTo(x, 9000, jumps);
    for (let i = 0; i < tries && s && !s.done && s.x + 0.31 < x; i++) s = await runTo(x, 6000);
    return s;
  };
  const total = async () => Object.values((await ps()).bag).reduce((a, n) => a + n, 0);
  /** Stand just before a piece of trash and grab it. */
  const grabAt = async (itemX, jumps = []) => {
    const n0 = await total();
    await pushOn(itemX - 0.75, jumps);
    await p.evaluate(() => window.__pss.face(1));
    await p.keyboard.press('g');
    await p.waitForTimeout(250);
    await talkThrough();
    if ((await total()) > n0) return true;
    // A slide after landing can carry you past it: turn round and try once more.
    await p.evaluate(() => window.__pss.face(-1));
    await p.keyboard.press('g');
    await p.waitForTimeout(250);
    await talkThrough();
    return (await total()) > n0;
  };
  /** At a Workbench: open it and pick a design. */
  const craft = async (design) => {
    await p.keyboard.press('e');
    await p.waitForTimeout(400);
    const open = await p.isVisible('.pss-bench');
    if (!open) return false;
    const btn = p.locator(`.pss-design[data-design="${design}"]`);
    if (await btn.isDisabled()) {
      console.log('  (the design button is disabled: materials are missing)', JSON.stringify((await ps()).bag));
      await p.keyboard.press('Escape');
      return false;
    }
    await btn.click();
    await p.waitForTimeout(300);
    return true;
  };
  /** At a stake: build what is carried, wait for the test, and read the result. */
  const buildAndTest = async () => {
    await p.keyboard.press('e');
    await p.waitForTimeout(600);
    for (let i = 0; i < 40 && !(await p.isVisible('.pss-result')); i++) await p.waitForTimeout(200);
    return p.isVisible('.pss-result') ? p.textContent('.pss-result') : '';
  };
  /** Answer the open question panel until it closes (right answer first; a wrong one first now and then). */
  const answerUntilClosed = async (max = 30, wrongFirst = false) => {
    for (let i = 0; i < max; i++) {
      const s = await st();
      if (!s.panel) return i;
      if (wrongFirst && i === 0) {
        await p.click(`.pss-choice[data-value="${s.panel.wrong[0].value}"]`);
        await p.waitForTimeout(150);
      }
      const btns = await p.$$('.pss-choice');
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
  /** Sort everything at the sorting station (one wrong pick first, if asked). */
  const sortAll = async (wrongFirst = false) => {
    for (let i = 0; i < 20; i++) {
      const s = await st();
      if (!s.sorting) return;
      if (wrongFirst && i === 0) {
        const wrong = ['recycle', 'compost', 'trash', 'hazard'].find((b) => b !== s.sorting.right);
        await p.evaluate((b) => window.__pss.sort(b), wrong);
        await p.waitForTimeout(150);
      }
      await p.evaluate((b) => window.__pss.sort(b), s.sorting.right);
      await p.waitForTimeout(150);
      await p.keyboard.press('Space');
      await p.waitForTimeout(200);
    }
  };
  /** Finish a level: run to the flag, then click through the talks. */
  const toFlag = async (x, jumps = []) => {
    await pushOn(x, jumps);
    for (let i = 0; i < 30 && (await st()).mode === 'level'; i++) await p.waitForTimeout(100);
    await talkThrough();
  };
  return { st, ps, talking, talkThrough, runTo, pushOn, grabAt, craft, buildAndTest, answerUntilClosed, debrief, sortAll, toFlag, fullJump };
}

/** A fresh game with a save that starts at a stretch (earlier ones finished). */
async function startAt(p, stretches = [], extra = {}) {
  await p.goto(base);
  await p.evaluate(
    ([ss, ex]) => {
      const lv = { beach: ['beach-1', 'beach-2'], harbor: ['harbor-1', 'harbor-2'], wetland: ['wetland-1', 'wetland-2'], town: ['town-1', 'town-2'] };
      const zero = { beach: 0, harbor: 0, wetland: 0, town: 0 };
      const save = {
        version: 1,
        appearance: { body: 'girl', skin: 'deep', hairStyle: 'puffs', hairColor: 'black', outfit: 'green', accessory: 'none' },
        levelsDone: ss.flatMap((s) => lv[s]),
        stars: { ...zero, ...Object.fromEntries(ss.map((s) => [s, 5])) },
        played: { ...zero },
        tests: { ...zero, ...Object.fromEntries(ss.map((s) => [s, 2])) },
        done: ss,
        introSeen: [],
        openingSeen: true,
        halfDoneSeen: false,
        ollie: ss.length > 0,
        easy: false,
        recent: {},
        learner: {},
        seed: 7,
        bag: {},
        found: [],
        tried: {},
        built: [],
        sorted: 0,
        sortedRight: 0,
        nature: [],
        visitors: [],
        ...ex,
      };
      localStorage.setItem('pollutionSolutionSquad.save', JSON.stringify(save));
    },
    [stretches, extra],
  );
  await p.reload();
  await p.waitForTimeout(800);
  await p.click('text=Continue');
  await p.waitForTimeout(500);
  // Wait until the camp is ready (slower on a small screen).
  for (let i = 0; i < 40 && (await p.evaluate(() => window.__pss.state().mode)) !== 'camp'; i++) await p.waitForTimeout(150);
}

// ---------------------------------------------------------------- Turtle Beach (from a new game)

if (want('beach')) {
  const p = await openPage();
  const { st, ps, talkThrough, runTo, pushOn, grabAt, craft, buildAndTest, answerUntilClosed, debrief, sortAll, toFlag } = helpers(p);
  await p.goto(base);
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForTimeout(1200);
  check(await p.isVisible('text=Pollution Solution Squad'), 'the title screen shows');
  await p.screenshot({ path: `${out}/01-title.png` });
  await p.click('text=Start a new game');
  await p.waitForTimeout(500);
  check(await p.isVisible('.modal'), 'the look picker opens for a new game');
  await p.screenshot({ path: `${out}/01b-customize.png` });
  await p.click('.modal button.primary');
  await p.waitForTimeout(500);
  let s = await st();
  check(s.talking && s.mode === 'busy', 'Marisol greets the new cadet');
  await p.screenshot({ path: `${out}/02-opening.png` });
  await talkThrough();
  s = await st();
  check(s.mode === 'camp' && s.next === 'level:beach-1', 'the opening ends at Beach Camp, with Turtle Beach next');
  await p.screenshot({ path: `${out}/03-camp.png` });
  // the sorting station has nothing to sort yet
  await runTo(30.7, 6000);
  check((await ps()).target === 'S', 'a Sort prompt shows at the sorting station');
  await p.keyboard.press('KeyE');
  await p.waitForTimeout(300);
  check((await st()).talking, 'with nothing to sort, Marisol says so');
  await talkThrough();
  // the map
  await runTo(36.7, 6000);
  check((await ps()).target === 'Q', 'a Map prompt shows at the map board');
  await p.keyboard.press('KeyE');
  await p.waitForTimeout(300);
  check(await p.isVisible('.pss-map'), 'the map opens');
  await p.screenshot({ path: `${out}/04-map.png` });
  check((await p.$$('.pss-map .pss-lv button')).length === 1, 'only the first level is open at the start');
  await p.click('.pss-map button[data-level="beach-1"]');
  await p.waitForTimeout(500);
  check((await st()).talking, 'the level starts with Marisol’s welcome');
  await talkThrough();
  check((await ps()).level === 'beach-1', 'Turtle Beach level 1, The Tide Line, is playing');

  // ---- beach-1: grab trash, leave shells, free Ollie, Ollie sniffs, the bin lids
  check(await grabAt(4.5), 'grabs a plastic bottle with G');
  await runTo(5.6, 2000);
  await p.keyboard.press('g');
  await p.waitForTimeout(250);
  check((await p.textContent('.pss-msg')).includes('Leave that shell'), 'a shell is left alone: take only trash');
  check(await grabAt(9.5), 'grabs a can');
  check(await grabAt(12.5, [10.2]), 'jumps up the step and grabs a banana peel');
  check(await grabAt(15.5), 'grabs a battery');
  await p.screenshot({ path: `${out}/05-beach1.png` });
  check(await grabAt(23.5, [16.3]), 'jumps the tide channel and grabs a wrapper');
  check((await ps()).respawn.x === 21, 'touching a Squad flag makes it the checkpoint');
  check(await grabAt(25.5), 'grabs a plastic bag');
  check(!(await ps()).ollie.free, 'Ollie is tangled in a six-pack ring');
  await pushOn(29.75);
  await p.keyboard.press('g');
  await p.waitForTimeout(400);
  check((await st()).talking, 'freeing Ollie starts a talk');
  await p.screenshot({ path: `${out}/06-ollie.png` });
  await talkThrough();
  s = await st();
  check(s.ollie && (await ps()).ollie.free && (await ps()).bag.ring === 1, 'Ollie is free, and the ring is in the backpack');
  await runTo(32.4, 3000);
  await p.waitForTimeout(600);
  check((await ps()).ollie.sniff, 'Ollie sniffs out a buried bottle');
  await p.screenshot({ path: `${out}/07-sniff.png` });
  check(await grabAt(33.5), 'grabs the bottle Ollie found');
  check(await grabAt(35.5), 'grabs a bottle cap');
  check(await grabAt(37.5, [35.8]), 'jumps onto the driftwood and grabs scrap wood');
  check(await grabAt(38.5), 'grabs more scrap wood');
  check(await grabAt(46.5, [40.6]), 'gets past the crab and grabs an old rope');
  await runTo(47.6, 2000);
  check((await ps()).target === 'W', 'a Workbench prompt shows');
  check(await craft('loose'), 'the Workbench opens with the bin lid blueprint');
  s = await ps();
  check((s.carrying?.design === 'loose' && s.bag.rope === undefined) || s.bag.rope === 0, 'crafts a loose lid (the materials are used)');
  await runTo(50.6, 3000);
  let res = await buildAndTest();
  check(/half works/.test(res) && /wind/.test(res), 'the loose lid only half works: the wind lifts it');
  await p.screenshot({ path: `${out}/08-result-half.png` });
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  s = await ps();
  check(s.stakes[0].design === null && s.bag.wood >= 1 && s.bag.rope === 1, 'taking it down gives the materials back');
  await runTo(47.6, 3000, [], 'ArrowLeft');
  await craft('clip');
  await runTo(50.6, 3000);
  res = await buildAndTest();
  check(/it works/.test(res), 'the clip-shut lid works');
  await p.screenshot({ path: `${out}/09-result-works.png` });
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  check((await st()).talking, 'Rafi says what the fix does');
  await talkThrough();
  s = await st();
  check(s.built.includes('bin-lids') && s.tried['bin-lids'].length === 2, 'the Journal remembers both designs tried, and the one that works');
  await toFlag(63, [57.4]);
  s = await st();
  check(s.levelsDone.includes('beach-1'), 'reaches the flag: The Tide Line is done');
  check(!!s.sorting, 'the sorting station opens with what was picked up');
  await p.screenshot({ path: `${out}/10-sorting.png` });
  const before = s.sorting.left;
  await sortAll(true);
  s = await st();
  check(s.sorted >= before && s.sortedRight === s.sorted - 1, `sorts everything (${s.sortedRight} of ${s.sorted} right first time)`);
  check(!s.bag.can && !s.bag.battery && s.bag.bottle === 2, 'sorted trash leaves the backpack; bottles stay as materials');
  for (let i = 0; i < 20 && !(await st()).panel; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  s = await st();
  check(s.panel?.kind === 'test' && s.panel.station === 'beach', 'the water test opens');
  await p.screenshot({ path: `${out}/11-water-test.png` });
  // one wrong answer: a sentence about the mistake and the next hint
  const wrong = s.panel.wrong[0];
  await p.click(`.pss-choice[data-value="${wrong.value}"]`);
  await p.waitForTimeout(200);
  check((await p.textContent('.pss-feedback')).startsWith('Not quite.'), 'a wrong answer explains the likely mistake');
  await p.keyboard.press('h');
  await p.keyboard.press('h');
  await p.waitForTimeout(300);
  s = await st();
  check(s.panel.hintRung === 2 && s.panel.model, 'hint 2 shows a picture model');
  await p.screenshot({ path: `${out}/12-hint.png` });
  await answerUntilClosed();
  await p.waitForTimeout(300);
  await talkThrough();
  await p.waitForTimeout(300);
  check(await p.isVisible('text=Play the next level now?'), 'after the water test, the next level is offered');
  await p.click('text=Play it now');
  await p.waitForTimeout(500);
  await talkThrough();
  check((await ps()).level === 'beach-2', 'The Drain Pipe is playing, with Ollie along');

  // ---- beach-2: the drain net (big holes, then medium)
  check(await grabAt(4.5), 'grabs a bottle');
  check(await grabAt(6.5), 'grabs a glass bottle');
  check(await grabAt(14.5, [9.3]), 'jumps the channel and grabs a can');
  check(await grabAt(20.5, [18.2]), 'jumps up the dune step and grabs the old fishing net');
  check(await grabAt(24.5, [21.4]), 'jumps across to the driftwood and grabs the rope');
  check(await grabAt(25.5), 'grabs the scrap wood');
  await pushOn(31.2);
  await p.waitForTimeout(500);
  check((await ps()).ollie.sniff, 'Ollie sniffs out the buried wood');
  check(await grabAt(32.5), 'grabs the buried wood');
  check(await grabAt(40.5, [35.3]), 'jumps the next channel and grabs a wrapper');
  check(await grabAt(46.5, [41.2, 43.6]), 'up the step and the ledge for more wood');
  check(await grabAt(49.5), 'grabs a banana peel');
  await runTo(53.6, 3000);
  check(await craft('big'), 'the drain net blueprint opens');
  await runTo(57.2, 3000, [55.8]);
  await runTo(62.6, 3000);
  await p.screenshot({ path: `${out}/13-drain.png` });
  res = await buildAndTest();
  check(/half works/.test(res) && /slip through/.test(res), 'big holes only half work: small trash slips through');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await runTo(53.6, 4000, [61.6, 57.8], 'ArrowLeft');
  await craft('medium');
  await runTo(62.6, 4000, [55.8]);
  res = await buildAndTest();
  check(/it works/.test(res), 'medium holes work');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await talkThrough();
  await toFlag(78, [70.4]);
  s = await st();
  check(s.levelsDone.includes('beach-2') && s.built.includes('drain-net'), 'The Drain Pipe is done, and the drain net works');
  await sortAll();
  for (let i = 0; i < 20 && !(await st()).panel; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  s = await st();
  check(s.panel?.kind === 'journal' && s.panel.station === 'beach', 'the Squad Journal questions open');
  await p.screenshot({ path: `${out}/14-journal-q.png` });
  const asked = await answerUntilClosed(30);
  await p.waitForTimeout(300);
  check((await st()).talking, `after ${asked} questions, Marisol asks a talk-it-through question`);
  await p.screenshot({ path: `${out}/15-debrief.png` });
  await debrief(/upstream/);
  await talkThrough();
  s = await st();
  check(s.done.includes('beach') && s.next === 'level:harbor-1', 'Turtle Beach is done; the Harbor is next');
  await p.close();
}

// ---------------------------------------------------------------- The Harbor

if (want('harbor')) {
  const p = await openPage();
  const { st, ps, talkThrough, runTo, pushOn, grabAt, craft, buildAndTest, answerUntilClosed, debrief, sortAll, toFlag, fullJump } = helpers(p);
  await startAt(p, ['beach'], { bag: { wood: 1 } });
  await p.evaluate(() => window.__pss.startLevel('harbor-1'));
  await p.waitForTimeout(500);
  await talkThrough();
  check((await ps()).level === 'harbor-1', 'The Leaky Boat is playing');
  check(await grabAt(4.5), 'grabs a can on the dock');
  check(await grabAt(7.5), 'grabs a bottle');
  check(await grabAt(12.5, [8.4]), 'jumps the gap and grabs another can');
  check(await grabAt(15.5, [13.2]), 'jumps onto the crates for a bottle');
  check(await grabAt(18.5), 'grabs a rope');
  check(await grabAt(24.5), 'grabs a bottle');
  check(await grabAt(29.5, [25.4]), 'jumps the gap and grabs a bottle');
  check(await grabAt(31.5), 'grabs another rope');
  await runTo(34.6, 3000);
  await p.screenshot({ path: `${out}/20-harbor.png` });
  check(await craft('tape'), 'the Workbench shows the fuel tank fix first');
  await runTo(37.6, 3000);
  let res = await buildAndTest();
  check(/half works/.test(res) && /tape/.test(res.toLowerCase()), 'tape only half works: water loosens it');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await runTo(34.6, 3000, [], 'ArrowLeft');
  await craft('patch');
  await runTo(37.6, 3000);
  res = await buildAndTest();
  check(/it works/.test(res), 'the metal patch stops the leak');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await talkThrough();
  await runTo(34.6, 3000, [], 'ArrowLeft');
  check(await craft('rope'), 'then the oil boom blueprint');
  // across the boat deck and the mooring post to the far dock
  let s = await runTo(57.2, 9000, [39.6, 47.4, 52.4]);
  check(s.x + 0.31 > 56 && s.falls === 0, 'jumps along the boat’s deck and the mooring post to the far dock');
  res = await buildAndTest();
  check(/half works/.test(res) && /sinks/.test(res), 'a rope alone only half works: it sinks');
  await p.screenshot({ path: `${out}/21-boom-half.png` });
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  // back to the Workbench and over again with sealed bottles
  await p.evaluate(() => window.__pss.teleport(34.6));
  await p.waitForTimeout(200);
  await craft('sealed');
  await runTo(57.2, 9000, [39.6, 47.4, 52.4]);
  res = await buildAndTest();
  check(/it works/.test(res), 'sealed bottles on a rope work');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await talkThrough();
  await p.screenshot({ path: `${out}/22-boom.png` });
  check(await grabAt(61.5), 'grabs spare wood');
  await toFlag(77, [62.4, 68.6]);
  s = await st();
  check(s.levelsDone.includes('harbor-1') && s.built.includes('tank-patch') && s.built.includes('boom'), 'The Leaky Boat is done: the leak is fixed and the boom holds');
  await sortAll();
  for (let i = 0; i < 20 && !(await st()).panel; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  check((await st()).panel?.kind === 'test', 'the Harbor water test opens');
  await answerUntilClosed();
  await talkThrough();
  await p.waitForTimeout(300);
  await p.click('text=Play it now');
  await p.waitForTimeout(500);
  await talkThrough();
  check((await ps()).level === 'harbor-2', 'The River Mouth is playing');

  // ---- harbor-2: the kayak and the ghost nets, then the net bin
  check(await grabAt(3.5), 'grabs a wrapper');
  check(await grabAt(5.5), 'grabs a can');
  s = await runTo(10.6, 4000);
  check(s.kayak.aboard, 'steps into the kayak');
  for (const gx of [17.5, 29.5, 41.5, 52.5]) {
    const n0 = (await ps()).ghosts.length;
    await runTo(gx - 1.9, 9000);
    await p.keyboard.press('g');
    await p.waitForTimeout(300);
    check((await ps()).ghosts.length === n0 - 1, `paddles to a ghost net and grabs it (${4 - n0 + 1} of 4)`);
  }
  await p.screenshot({ path: `${out}/23-kayak.png` });
  s = await runTo(60.4, 9000);
  check(!s.kayak.aboard && s.x > 58.5 && s.falls === 0, 'paddles to the far side and steps out onto the dock');
  check(await grabAt(62.5), 'grabs wood');
  check(await grabAt(65.5, [63.4]), 'grabs wood on the ledge');
  await runTo(67.6, 3000);
  check(await craft('crate'), 'the net bin blueprint opens');
  await runTo(71.6, 3000);
  res = await buildAndTest();
  check(/half works/.test(res) && /wind/.test(res), 'an open crate only half works: the wind tugs nets out');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  check((await grabAt(70.5, [])) || true, 'picks up the wood by the stake');
  await runTo(67.6, 3000, [], 'ArrowLeft');
  await craft('lid');
  await runTo(71.6, 3000);
  res = await buildAndTest();
  check(/it works/.test(res), 'a bin with a lid works');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await talkThrough();
  await p.screenshot({ path: `${out}/24-netbin.png` });
  await toFlag(83);
  s = await st();
  check(s.levelsDone.includes('harbor-2') && s.built.includes('net-bin'), 'The River Mouth is done');
  await sortAll();
  for (let i = 0; i < 20 && !(await st()).panel; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  check((await st()).panel?.kind === 'journal', 'the Harbor Journal questions open');
  await answerUntilClosed(30);
  await p.waitForTimeout(300);
  await debrief(/source/);
  for (let i = 0; i < 10; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  s = await st();
  check(s.done.includes('harbor') && s.next === 'level:wetland-1', 'the Harbor is done; the Wetland is next');
  await p.screenshot({ path: `${out}/25-harbor-done.png` });
  await p.close();
}

// ---------------------------------------------------------------- The Wetland

if (want('wetland')) {
  const p = await openPage();
  const h = helpers(p);
  const { st, ps, talkThrough, runTo, grabAt, craft, buildAndTest, answerUntilClosed, debrief, sortAll, toFlag } = h;
  await startAt(p, ['beach', 'harbor'], { bag: {} });
  await p.evaluate(() => window.__pss.startLevel('wetland-1'));
  await p.waitForTimeout(500);
  await talkThrough();
  check((await ps()).level === 'wetland-1', 'The Green Pond is playing, with Dr. Wen Li');
  check(await grabAt(4.5), 'grabs a bottle');
  check(await grabAt(6.5), 'grabs a wrapper');
  check(await grabAt(10.5, [8.2]), 'jumps up the muddy bank for scrap wood');
  check(await grabAt(19.5, [12.2]), 'jumps the ditch and grabs a can');
  check(await grabAt(22.5), 'grabs a banana peel');
  check(await grabAt(25.5), 'grabs an old rope');
  check(await grabAt(28.5), 'grabs a plastic bag');
  await p.screenshot({ path: `${out}/60-green-pond.png` });
  check(await grabAt(38.5, [29.4, 34.2]), 'jumps along the old boardwalk for scrap wood');
  check(await grabAt(44.5, [40.2]), 'jumps the next gap for a bottle cap');
  let s = await runTo(50.6, 6000, [45.2]);
  check(s.falls === 0 && s.x > 48, 'gets across the green pond without falling in');
  check(await craft('lawn'), 'the wetland plants blueprint opens');
  await runTo(54.6, 3000);
  let res = await buildAndTest();
  check(/half works/.test(res) && /drowns/.test(res), 'lawn grass only half works: it drowns in the mud');
  await p.screenshot({ path: `${out}/61-lawn-half.png` });
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await p.keyboard.press('e');
  await p.waitForTimeout(300);
  await talkThrough();
  check((await ps()).stakes[0].design === null, 'takes the grass down to get the materials back');
  await runTo(50.6, 3000, [], 'ArrowLeft');
  await craft('native');
  await runTo(54.6, 3000);
  res = await buildAndTest();
  check(/it works/.test(res), 'native reeds and cattails work');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await talkThrough();
  await p.evaluate(() => window.__pss.teleport(40.4, 8));
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/62-reeds.png` });
  check((await ps()).gauge < 0.2, 'the pond clears: the oxygen gauge turns green');
  await p.evaluate(() => window.__pss.teleport(56));
  await p.waitForTimeout(200);
  check(await grabAt(58.5), 'grabs a battery');
  check(await grabAt(61.5), 'grabs a glass bottle');
  check(await grabAt(64.5, [62.2]), 'jumps up the log for a bottle');
  await p.waitForTimeout(400);
  check(await grabAt(67.5), 'grabs the bottle Ollie sniffed out');
  await toFlag(77, [69.4]);
  s = await st();
  check(s.levelsDone.includes('wetland-1') && s.built.includes('reeds'), 'The Green Pond is done');
  await sortAll();
  for (let i = 0; i < 20 && !(await st()).panel; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  s = await st();
  check(s.panel?.kind === 'test' && s.panel.station === 'wetland', 'Dr. Wen’s water test opens');
  await p.screenshot({ path: `${out}/63-wetland-test.png` });
  await answerUntilClosed();
  await talkThrough();
  await p.waitForTimeout(300);
  await p.click('text=Play it now');
  await p.waitForTimeout(500);
  await talkThrough();
  check((await ps()).level === 'wetland-2', 'The Filter is playing');

  check(await grabAt(4.5), 'grabs a wrapper');
  check(await grabAt(6.5), 'grabs scrap wood');
  check(await grabAt(16.5, [8.4, 13.8]), 'jumps the stream and onto the log for a bottle');
  check(await grabAt(19.5), 'grabs a can');
  check(await grabAt(22.5), 'grabs a bag');
  check(await grabAt(30.5, [23.4]), 'jumps the stream; Ollie sniffs out buried wood');
  check(await grabAt(36.5), 'grabs a peel');
  check(await grabAt(39.5, [37.0]), 'jumps up for another bottle');
  check(await grabAt(43.5), 'grabs a rope');
  check(await grabAt(45.5), 'grabs a cap');
  await runTo(50.6, 3000);
  check(await craft('sand-top'), 'the filter blueprint opens');
  await runTo(53.6, 3000);
  res = await buildAndTest();
  check(/half works/.test(res) && /clogs/.test(res), 'sand on top only half works: it clogs');
  await p.screenshot({ path: `${out}/64-filter-half.png` });
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await p.keyboard.press('e');
  await p.waitForTimeout(300);
  await talkThrough();
  await runTo(50.6, 3000, [], 'ArrowLeft');
  await craft('coarse');
  await runTo(53.6, 3000);
  res = await buildAndTest();
  check(/it works/.test(res), 'stones, gravel, then sand: clear water flows out');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await talkThrough();
  await p.screenshot({ path: `${out}/65-filter.png` });
  check(await grabAt(70.5, [55.4, 59.4, 63.4]), 'crosses the stepping stones and grabs a battery');
  check(await grabAt(73.5), 'grabs a glass bottle');
  await toFlag(81, [74.4]);
  s = await st();
  check(s.levelsDone.includes('wetland-2') && s.built.includes('filter'), 'The Filter is done');
  await sortAll();
  for (let i = 0; i < 20 && !(await st()).panel; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  check((await st()).panel?.kind === 'journal', 'the Wetland Journal questions open');
  await answerUntilClosed(30, true);
  await p.waitForTimeout(300);
  await debrief(/farms/);
  for (let i = 0; i < 10; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  s = await st();
  check(s.done.includes('wetland') && s.next === 'level:town-1', 'the Wetland is done; Farm and Town are next');
  await p.close();
}

// ---------------------------------------------------------------- Farm and Town, and the finale

if (want('town')) {
  const p = await openPage();
  const h = helpers(p);
  const { st, ps, talkThrough, runTo, grabAt, craft, buildAndTest, answerUntilClosed, debrief, sortAll, toFlag } = h;
  let messages = [];
  await p.exposeFunction('__note', (m) => messages.push(m));
  await startAt(p, ['beach', 'harbor', 'wetland'], { bag: {} });
  await p.evaluate(() => window.addEventListener('message', (e) => window.__note(e.data?.type)));
  await p.evaluate(() => window.__pss.startLevel('town-1'));
  await p.waitForTimeout(500);
  await talkThrough();
  check((await ps()).level === 'town-1', 'The Farm is playing, with Rosa Delgado');
  check(await grabAt(6.5), 'grabs a bag');
  check(await grabAt(9.5), 'grabs a can');
  check(await grabAt(15.5), 'grabs a rope by the bare field');
  check(await grabAt(20.5, [18.2]), 'jumps up the field bank for wood');
  check(await grabAt(26.5), 'grabs a peel');
  check(await grabAt(31.5), 'grabs a wrapper');
  check(await grabAt(39.5, [34.4]), 'jumps the ditch for wood');
  check(await grabAt(43.5, [41.0]), 'jumps onto the hay wagon for a cap');
  check(await grabAt(50.5), 'grabs the wood Ollie sniffed out');
  await runTo(52.6, 3000);
  check(await craft('fence'), 'the riverbank strip blueprint opens');
  await runTo(56.6, 3000);
  let res = await buildAndTest();
  check(/half works/.test(res) && /under/.test(res), 'a fence only half works: the muddy water flows under it');
  await p.screenshot({ path: `${out}/70-fence-half.png` });
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await p.keyboard.press('e');
  await p.waitForTimeout(300);
  await talkThrough();
  await runTo(52.6, 3000, [], 'ArrowLeft');
  await craft('strip');
  await runTo(56.6, 3000);
  res = await buildAndTest();
  check(/it works/.test(res), 'a wide strip of native plants works');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await talkThrough();
  await p.screenshot({ path: `${out}/71-strip.png` });
  check(await grabAt(73.5, [58.4]), 'crosses the bridge over a clear river and grabs a battery');
  check(await grabAt(75.5), 'grabs a glass bottle');
  await toFlag(79);
  let s = await st();
  check(s.levelsDone.includes('town-1') && s.built.includes('buffer'), 'The Farm is done');
  await sortAll(true);
  for (let i = 0; i < 20 && !(await st()).panel; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  check((await st()).panel?.kind === 'test', 'Rosa’s water test opens');
  await answerUntilClosed();
  await talkThrough();
  await p.waitForTimeout(300);
  await p.click('text=Play it now');
  await p.waitForTimeout(500);
  await talkThrough();
  check((await ps()).level === 'town-2', 'Main Street is playing');

  check(await grabAt(8.5), 'grabs a can');
  check(await grabAt(11.5, [9.0]), 'jumps onto the shop awning for wood');
  check(await grabAt(15.5), 'grabs a bag');
  check(await grabAt(16.5), 'grabs more wood');
  await runTo(17.6, 3000);
  check(await craft('pipe'), 'the rain garden blueprint opens');
  await runTo(22.6, 3000);
  res = await buildAndTest();
  check(/half works/.test(res) && /faster/.test(res), 'a pipe to the drain only half works: the water rushes to the river faster');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await p.keyboard.press('e');
  await p.waitForTimeout(300);
  await talkThrough();
  await runTo(17.6, 3000, [], 'ArrowLeft');
  await craft('garden');
  await runTo(22.6, 3000);
  res = await buildAndTest();
  check(/it works/.test(res), 'a rain garden works');
  await p.screenshot({ path: `${out}/72-rain-garden.png` });
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await talkThrough();
  check(await grabAt(31.5), 'grabs a can');
  check(await grabAt(37.5, [32.4]), 'jumps the canal for wood');
  check(await grabAt(43.5), 'grabs a peel by the waiting bus');
  check(await grabAt(46.5, [44.0]), 'jumps up for a can');
  await runTo(51.6, 3000);
  check(await craft('tall'), 'the chimney fix blueprint opens');
  await runTo(55.6, 3000);
  res = await buildAndTest();
  check(/half works/.test(res) && /farther/.test(res), 'a taller chimney only half works: the smoke just goes farther');
  await p.screenshot({ path: `${out}/73-tall-half.png` });
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await p.keyboard.press('e');
  await p.waitForTimeout(300);
  await talkThrough();
  await runTo(51.6, 3000, [], 'ArrowLeft');
  await craft('filter');
  await runTo(55.6, 3000);
  res = await buildAndTest();
  check(/it works/.test(res), 'a smoke filter works');
  await p.click('.pss-result .btn.primary');
  await p.waitForTimeout(300);
  await talkThrough();
  await p.screenshot({ path: `${out}/74-mill.png` });
  check(await grabAt(65.5), 'grabs a cap');
  check(await grabAt(67.5), 'grabs a glass bottle');
  check(await grabAt(70.5), 'grabs a battery');
  await toFlag(86);
  s = await st();
  check(s.levelsDone.includes('town-2') && s.built.includes('rain-garden') && s.built.includes('mill-filter'), 'Main Street is done');
  await sortAll();
  for (let i = 0; i < 20 && !(await st()).panel; i++) {
    await talkThrough();
    await p.waitForTimeout(150);
  }
  check((await st()).panel?.kind === 'journal', 'the Farm and Town Journal questions open');
  await p.screenshot({ path: `${out}/75-town-q.png` });
  await answerUntilClosed(30);
  await p.waitForTimeout(300);
  await debrief(/before it starts/);
  for (let i = 0; i < 20 && !(await p.isVisible('.pss-finale')); i++) {
    await talkThrough();
    await p.waitForTimeout(200);
  }
  check(await p.isVisible('.pss-finale'), 'every stretch is done: The Big Rain begins');
  for (let i = 0; i < 8; i++) {
    await p.waitForTimeout(500);
    if ([0, 3, 6, 7].includes(i)) await p.screenshot({ path: `${out}/8${i}-finale.png` });
    await p.click('.pss-finale .btn.primary');
  }
  await p.waitForTimeout(400);
  check(!(await p.isVisible('.pss-finale')), 'the storm follows the water past every fix, then Clean Coast Day and the hatchlings');
  await talkThrough();
  await p.waitForTimeout(300);
  s = await st();
  check(s.finaleSeen && s.done.length === 4 && s.next === null, 'the game is finished, and saved');
  check(messages.includes('game-complete'), 'the game tells the site it is complete');
  await p.close();
}

// ---------------------------------------------------------------- the Nature Center

if (want('nature')) {
  const p = await openPage();
  const { st, ps, runTo, talkThrough } = helpers(p);
  await startAt(p, ['beach', 'harbor'], { bag: { wood: 8, rope: 2, bottle: 4 } });
  await talkThrough();
  await runTo(15.6, 6000, [], 'ArrowLeft');
  check((await ps()).target === 'N', 'a Build prompt shows at the Nature Center sign');
  await p.keyboard.press('KeyE');
  await p.waitForTimeout(400);
  check((await ps()).building && (await p.isVisible('.pss-palette')), 'the Nature Center build mode opens with its pieces');
  await p.click('[data-piece="milkweed"]');
  await p.evaluate(() => window.__pss.placeNature(3));
  await p.click('[data-piece="birdbox"]');
  await p.evaluate(() => window.__pss.placeNature(5));
  await p.click('[data-piece="cattails"]');
  await p.evaluate(() => window.__pss.placeNature(10));
  await p.evaluate(() => window.__pss.placeNature(11));
  await p.click('[data-piece="compost"]');
  await p.evaluate(() => window.__pss.placeNature(14));
  // and the bench, placed by clicking the lot
  await p.click('[data-piece="bench"]');
  const box = await p.locator('.pss-canvas').boundingBox();
  const cam = -1.5;
  await p.mouse.click(box.x + ((7 - cam + 0.5) / 20) * box.width, box.y + box.height * 0.8);
  await p.waitForTimeout(500);
  let s = await st();
  check(s.nature === 6, `six pieces are built (${s.nature})`);
  check(
    ['butterfly', 'wren', 'frog', 'heron', 'worm'].every((v) => s.visitors.includes(v)),
    `visitors come for what is built (${s.visitors.join(', ')})`,
  );
  check(s.bag.wood === 4 && s.bag.bottle === 1, 'built pieces use spare materials from the backpack');
  await p.screenshot({ path: `${out}/30-nature.png` });
  await p.click('[data-piece="bench"]');
  await p.evaluate(() => window.__pss.placeNature(10));
  check((await p.textContent('.pss-msg')).includes('pond'), 'a bench can’t go in the pond');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  check(!(await ps()).building, 'Esc leaves the build mode');
  await p.reload();
  await p.waitForTimeout(800);
  await p.click('text=Continue');
  await p.waitForTimeout(600);
  s = await st();
  check(s.nature === 6 && s.visitors.length >= 5, 'the Nature Center and the Visitor Book are saved');
  await p.close();
}

// ---------------------------------------------------------------- the map, the Journal, grown-ups, a phone

if (want('extras')) {
  const p = await openPage();
  const { st, talkThrough } = helpers(p);
  await startAt(p, ['beach'], { found: ['bottle', 'can', 'peel'], tried: { 'drain-net': ['big', 'medium'] }, built: ['drain-net'], visitors: ['butterfly'] });
  await talkThrough();
  await p.keyboard.press('KeyB');
  await p.waitForTimeout(400);
  check(await p.isVisible('.pss-guide'), 'B opens the Squad Journal');
  const jt = await p.textContent('.pss-guide');
  check(/Turtle Beach badge/.test(jt) && /Drain net/.test(jt) && /Monarch/.test(jt), 'the Journal shows badges, fixes and visitors');
  await p.screenshot({ path: `${out}/40-journal.png` });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.evaluate(() => window.__pss.ask('harbor', 'h-graph'));
  await p.waitForTimeout(500);
  check((await st()).panel?.id === 'h-graph', 'a bar graph question opens');
  await p.screenshot({ path: `${out}/41-graph-q.png` });
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await p.click('.pss-tools button[aria-label^="Settings"]');
  await p.waitForTimeout(300);
  await p.click('text=For grown-ups');
  await p.waitForTimeout(400);
  check(await p.isVisible('text=How it is going'), 'the grown-ups page has a progress tab');
  await p.click('text=How it is going');
  await p.waitForTimeout(300);
  check(/Turtle Beach/.test(await p.textContent('.progress-table')), 'the progress table lists the stretches');
  await p.screenshot({ path: `${out}/42-grownups.png` });
  await p.close();
  for (const [name, vp] of [
    ['phone', [390, 844, 2]],
    ['phone-side', [844, 390, 2]],
  ]) {
    const q = await openPage(vp);
    const hq = helpers(q);
    await startAt(q, [], { ollie: true, levelsDone: ['beach-1'] });
    await q.evaluate(() => window.__pss.startLevel('beach-2'));
    for (let i = 0; i < 40 && (await q.evaluate(() => window.__pss.play()?.level)) !== 'beach-2'; i++) await q.waitForTimeout(150);
    await q.waitForTimeout(500);
    await hq.talkThrough();
    await q.waitForTimeout(400);
    await q.screenshot({ path: `${out}/50-${name}.png` });
    const sw = await q.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(sw <= 0, `${name}: no sideways scrolling`);
    await q.evaluate(() => window.__pss.teleport(53.6));
    await q.waitForTimeout(200);
    await q.keyboard.press('e');
    await q.waitForTimeout(500);
    await q.screenshot({ path: `${out}/51-${name}-bench.png` });
    check(await q.isVisible('.pss-bench'), `${name}: the Workbench fits`);
    await q.close();
  }
}

await browser.close();
console.log(`${passed} passed, ${failed} failed, ${errors} console errors`);
process.exit(failed || errors ? 1 : 0);
