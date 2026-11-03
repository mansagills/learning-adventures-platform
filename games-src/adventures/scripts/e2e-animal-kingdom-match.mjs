// Browser check for Animal Kingdom Match (half 1): plays a new game from the
// title screen with real clicks and keys. Ranger Tala and Kiki open the
// story; Dr. Amara has no one to take home yet; the Wild Lands map sends the
// player to the rainforest, where Ranger Tala explains the layers. Kiki
// points her tail near an animal and the Kiki button says where to look.
// The binoculars start blurry; the arrow keys turn the focus until it is
// sharp, and Space snaps the photo (the card goes into the Ranger Journal).
// With all seven animals spotted, it is back to camp, where Dr. Amara's
// Rescue Center has three rainforest animals to take home: a wrong home is
// greyed out with a reason naming what the animal needs. Then the Ranger
// Journal: a wrong answer is crossed out with a sentence about the mistake,
// the hint ladder adds a picture and then outlines the answer, and five
// stars plus the talk-it-through question earn the Rainforest patch, which
// lights the map. The desert trip runs at level 3: the Rescue Center adds
// "what does its home give it" and "which body part helps", one animal from
// the rainforest comes too. The Poles: four Arctic animals, then the
// research boat (walk up, Space) sails to Antarctica for the penguins and
// the seal. The Wetland and Sea: the dolphin and whale are spotted from the
// beach. The fourth patch sets the sun over the camp, and Ranger Tala
// starts the Night Safari: an empty shine says to look for eyes, Kiki
// points, the arrow keys move the beam, a click shines it, and each of the
// five night animals has a question (bats are not blind). Every animal then
// appears on the lit map, the game tells the site player it is complete,
// and Speed Match opens at the Rescue Center (a 60-second round, a best
// score). Then the Ranger Journal's cards, the trip list, the grown-ups
// report, a reload, and the phone layout.
//
//   npm run build && npx vite preview --port 4174 &
//   node scripts/e2e-animal-kingdom-match.mjs [url]
//
// Writes test-output/akm-e2e/*.png and report.json. Exits 1 on any failure.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const URL = process.argv[2] ?? 'http://localhost:4174/animal-kingdom-match/index.html';
const OUT = 'test-output/akm-e2e';
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
const st = (page) => page.evaluate(() => window.__akm.state());
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
async function choose(page, re, seen = []) {
  for (let i = 0; i < 40; i++) {
    const opt = page.locator('.dialogue .choices button', { hasText: re });
    if (await opt.count()) {
      seen.push((await page.locator('.dialogue').textContent()) ?? '');
      await opt.first().click();
      await wait(page, 250);
      return true;
    }
    if (!(await page.locator('.dialogue').count())) return false;
    seen.push((await page.locator('.dialogue').textContent()) ?? '');
    await page.keyboard.press('Space');
    await wait(page, 160);
  }
  return false;
}
/** Walk up to someone or something by clicking it (from nearby), and wait for the talk box. */
async function clickTarget(page, id, from) {
  await page.evaluate(([x, y]) => window.__akm.teleport(x, y), from);
  await wait(page, 300);
  const p = await page.evaluate((i) => window.__akm.screenOf(i), id);
  await page.mouse.click(p.x, p.y - 24);
  return waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 120);
}
/** Play the open Ranger Journal (right answers by number key) until its debrief starts. */
async function playJournal(page) {
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
/** Answer the talk-it-through question: first a wrong option (when asked), then the right one. */
async function debrief(page, wrongFirst) {
  const seen = [];
  for (let i = 0; i < 40 && (await page.locator('.dialogue').count()); i++) {
    const opts = page.locator('.dialogue .choices button:not([disabled])');
    if ((await opts.count()) >= 2) {
      const texts = await opts.allTextContents();
      const right = texts.findIndex((t) => /needs tall trees|for the cold|whole world is between|breathes air, so/i.test(t));
      const pickI = wrongFirst && !seen.includes('wrong') ? texts.findIndex((t, k) => k !== right) : right;
      if (pickI !== right) seen.push('wrong');
      await opts.nth(pickI).click();
      await wait(page, 300);
      seen.push((await page.locator('.dialogue').textContent()) ?? '');
      continue;
    }
    seen.push((await page.locator('.dialogue').textContent()) ?? '');
    await page.keyboard.press('Space');
    await wait(page, 200);
  }
  return seen.join(' ');
}
/** Spot animal i of this trip: open the binoculars, turn the focus with the arrow keys, snap with Space, close the card. */
async function spotWithKeys(page, i) {
  await page.evaluate((k) => window.__akm.spot(k), i);
  await waitFor(page, async () => !!(await st(page)).spot);
  const s0 = (await st(page)).spot;
  for (let k = 0; k < s0.sharpAt; k++) {
    await page.keyboard.press('ArrowRight');
    await wait(page, 40);
  }
  await page.keyboard.press('Space');
  await wait(page, 250);
  const snapped = (await st(page)).spot?.snapped;
  await page.getByRole('button', { name: /^done$/i }).click();
  await wait(page, 250);
  return snapped;
}
/** Play the Rescue Center with right answers; returns how many steps were asked of each kind. */
async function playRescue(page) {
  const kinds = { home: 0, gives: 0, part: 0 };
  for (let guard = 0; guard < 40; guard++) {
    const r = await page.evaluate(() => window.__akm.rescueState());
    if (!r || r.step === 'done') break;
    kinds[r.step]++;
    await page.evaluate((i) => window.__akm.rescuePick(i), r.right);
    await wait(page, 150);
    await page.keyboard.press('Space');
    await wait(page, 550);
  }
  return kinds;
}

// ---------------------------------------------------------------- a new game
{
  const { ctx, page } = await newPage();
  await page.goto(URL);
  await wait(page, 2500);
  await page.screenshot({ path: `${OUT}/01-title.png` });
  check('title screen', await page.getByRole('heading', { name: 'Animal Kingdom Match' }).count());
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await page.screenshot({ path: `${OUT}/02-opening.png` });
  const opening = await talkThrough(page);
  check('Ranger Tala and Kiki open the story: food, water, shelter and space', /food, water, shelter and space/.test(opening) && /kinkajou/.test(opening), opening.slice(0, 80));
  let s = await st(page);
  check('the camp, with Ranger Tala and Dr. Amara marked', s.area === 'camp' && s.mode === 'world');
  await page.screenshot({ path: `${OUT}/03-camp.png` });

  // Dr. Amara: the Rescue Center has no one to take home yet
  await clickTarget(page, 'amara', [13.4, 12]);
  const amara = await talkThrough(page);
  check('Dr. Amara introduces the Rescue Center, with no one to take home yet', /Rescue Center/.test(amara) && /Go on a trip/.test(amara));

  // the map: off to the rainforest
  await clickTarget(page, 'map', [10.4, 12.4]);
  const mapSeen = [];
  await choose(page, /The Rainforest/, mapSeen);
  check('the map offers the rainforest; the other trips open later', /open later/.test(mapSeen.join(' ')));
  await waitFor(page, async () => (await st(page)).area === 'rainforest' && (await page.locator('.dialogue').count()) > 0, 60);
  await page.screenshot({ path: `${OUT}/04-rainforest-arrive.png` });
  const arrive = await talkThrough(page);
  check('the rainforest: Ranger Tala explains the layers', (await st(page)).area === 'rainforest' && /treetops/.test(arrive));
  await page.screenshot({ path: `${OUT}/05-rainforest.png` });

  // Kiki points near an animal, and the Kiki button says where to look
  await page.evaluate(() => window.__akm.teleport(9.8, 7.4));
  await wait(page, 800);
  s = await st(page);
  check('Kiki points her tail when an animal is near, and the prompt offers the binoculars', s.kikiPoints && s.target === 'animal:4');
  await page.screenshot({ path: `${OUT}/06-kiki-points.png` });
  await page.keyboard.press('k');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  const kiki = await talkThrough(page);
  check('the Kiki button says where to look for the nearest animal', /Look up! High in a big tree on the left/.test(kiki), kiki.slice(0, 90));

  // the first animal by walking up and pressing Space
  await page.keyboard.press('Space');
  await waitFor(page, async () => !!(await st(page)).spot);
  s = await st(page);
  check('Space opens the binoculars, blurry at first', s.spot && !s.spot.sharp && s.spot.focus === 0);
  await page.screenshot({ path: `${OUT}/07-binoculars-blurry.png` });
  const blur = await page.locator('.akm-lens-img').evaluate((el) => el.style.filter);
  check('the picture is blurred until the focus is right', /blur/.test(blur), blur);
  await page.keyboard.press('Space');
  await wait(page, 200);
  check('Space cannot snap a blurry photo', !(await st(page)).spot.snapped);
  for (let k = 0; k < s.spot.sharpAt; k++) {
    await page.keyboard.press('ArrowRight');
    await wait(page, 50);
  }
  s = await st(page);
  check('the arrow keys turn the focus until it is sharp', s.spot.sharp && (await page.locator('.akm-snap').isEnabled()));
  await page.screenshot({ path: `${OUT}/08-binoculars-sharp.png` });
  await page.keyboard.press('Space');
  await wait(page, 600);
  s = await st(page);
  check(
    'the photo goes into the Ranger Journal, with its card read aloud',
    s.spot.snapped && s.journal.includes('monkey') && /hang by its tail/.test(await page.locator('.akm-spot-card').textContent()),
  );
  await page.screenshot({ path: `${OUT}/09-snapped.png` });
  await page.getByRole('button', { name: /^done$/i }).click();
  await wait(page, 300);
  check('the HUD counts the animals spotted here', /Spotted 1 of 7/.test(await page.locator('.akm-badge-text').textContent()));

  // the rest of the rainforest (one through the + button and the Snap button)
  await page.evaluate(() => window.__akm.spot(0));
  await waitFor(page, async () => !!(await st(page)).spot);
  const s1 = (await st(page)).spot;
  for (let k = 0; k < s1.sharpAt; k++) await page.getByRole('button', { name: 'Turn the focus up' }).click();
  await page.getByRole('button', { name: /snap the photo/i }).click();
  await wait(page, 300);
  check('the + button and the Snap button work too', (await st(page)).journal.includes('jaguar'));
  await page.getByRole('button', { name: /^done$/i }).click();
  await wait(page, 300);
  for (const i of [1, 2, 3, 5]) await spotWithKeys(page, i);
  s = await st(page);
  check('six animals spotted, one to go', s.journal.length === 6 && s.unspotted.length === 1 && s.unspotted[0] === 'toucan', s.unspotted.join());
  await spotWithKeys(page, 6);
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  const all = await talkThrough(page);
  await waitFor(page, async () => (await st(page)).area === 'camp', 60);
  s = await st(page);
  check('all seven spotted: back to camp, where Dr. Amara needs help', /spotted all seven/.test(all) && s.area === 'camp' && s.spottedAll.includes('rainforest'));
  await page.screenshot({ path: `${OUT}/10-back-at-camp.png` });

  // the Rescue Center: a wrong home is greyed out with a reason
  await clickTarget(page, 'amara', [13.4, 12]);
  await waitFor(page, async () => !!(await st(page)).rescue, 60);
  s = await st(page);
  check('the Rescue Center opens with three rainforest animals', s.rescue && s.rescue.step === 'home');
  await page.screenshot({ path: `${OUT}/11-rescue.png` });
  const r0 = s.rescue;
  const wrongI = r0.options.findIndex((o, i) => i !== r0.right);
  await page.locator('.akm-home').nth(wrongI).click();
  await wait(page, 250);
  const fb = await page.locator('.akm-feedback').textContent();
  check('a wrong home is greyed out, with a reason naming what the animal needs', /needs/.test(fb) && (await page.locator('.akm-home').nth(wrongI).isDisabled()), fb.slice(0, 100));
  await page.screenshot({ path: `${OUT}/12-rescue-wrong.png` });
  await page.locator('.akm-home').nth(r0.right).click();
  await wait(page, 250);
  check('the right home: "Yes!" and the next button', /^Yes!/.test((await page.locator('.akm-feedback').textContent()).trim()));
  await page.keyboard.press('Space');
  await wait(page, 600);
  const k1 = await playRescue(page);
  check('level 1: only the home is asked for each animal', k1.home === 2 && k1.gives === 0, JSON.stringify(k1));
  await page.screenshot({ path: `${OUT}/13-rescue-done.png` });
  await page.getByRole('button', { name: /^done$/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await waitFor(page, async () => !!(await st(page)).panel, 40);
  s = await st(page);
  check('three animals home; the Ranger Journal opens', s.homes === 3 && s.rescued.includes('rainforest') && s.panel?.trip === 'rainforest');

  // the Ranger Journal: a wrong answer, then hints
  const wrong = s.panel.wrong[0];
  await page.locator(`.akm-choice[data-value="${wrong.value}"]`).click();
  await wait(page, 250);
  const why = await page.locator('.akm-feedback').textContent();
  check('a wrong answer is crossed out with a sentence about the mistake', /Not quite/.test(why) && (await page.locator(`.akm-choice[data-value="${wrong.value}"]`).isDisabled()), why.slice(0, 90));
  await page.keyboard.press('h');
  await wait(page, 200);
  check('hint 1 is a nudge', /Hint 1 of 3/.test(await page.locator('.akm-feedback').textContent()));
  await page.keyboard.press('h');
  await wait(page, 250);
  s = await st(page);
  check('hint 2 adds a picture (or labels the layers)', s.panel.hintRung >= 2 && (s.panel.model || (await page.locator('.akm-tag').count()) > 0));
  await page.screenshot({ path: `${OUT}/14-journal-hint.png` });
  await page.keyboard.press('h');
  await wait(page, 200);
  check('hint 3 outlines the answer', (await page.locator('.akm-choice.worked').count()) === 1);
  await page.keyboard.press(String(s.panel.right + 1));
  await wait(page, 200);
  check('no star after hints', (await st(page)).stars.rainforest === 0);
  await page.keyboard.press('Space');
  await wait(page, 300);
  await page.screenshot({ path: `${OUT}/15-journal.png` });
  await playJournal(page);
  const rf = await debrief(page, true);
  s = await st(page);
  check('five stars and the talk-it-through question earn the Rainforest patch', s.done.includes('rainforest') && s.stars.rainforest === 5 && /Rainforest patch/.test(rf), rf.slice(-90));
  check('the talk-it-through question answers a wrong idea with a reason', /Trying cannot change|Each animal needs a home/.test(rf));
  await page.screenshot({ path: `${OUT}/16-patch.png` });

  // the desert at level 3: the Rescue Center adds the needs and the body part
  await page.evaluate(() => {
    window.__akm.setTier('rescue', 3);
    window.__akm.setTier('desert', 3);
  });
  await clickTarget(page, 'tala', [10.6, 12.4]);
  await choose(page, /Go to the desert/);
  await waitFor(page, async () => (await st(page)).area === 'desert' && (await page.locator('.dialogue').count()) > 0, 60);
  const desert = await talkThrough(page);
  check('the desert: Dr. Amara on shade and saving water', /very little rain/.test(desert));
  await page.screenshot({ path: `${OUT}/17-desert.png` });
  for (const i of [0, 1, 2, 3]) await spotWithKeys(page, i);
  await spotWithKeys(page, 4);
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await waitFor(page, async () => (await st(page)).area === 'camp', 60);
  check('five desert animals spotted; twelve in the journal', (await st(page)).journal.length === 12);
  await clickTarget(page, 'amara', [13.4, 12]);
  await waitFor(page, async () => !!(await st(page)).rescue, 60);
  const animals = new Set();
  const kinds = { home: 0, gives: 0, part: 0 };
  let sawGives = false;
  for (let guard = 0; guard < 40; guard++) {
    const r = await page.evaluate(() => window.__akm.rescueState());
    if (!r || r.step === 'done') break;
    animals.add(r.who);
    kinds[r.step]++;
    if (r.step === 'gives' && !sawGives) {
      sawGives = true;
      await page.screenshot({ path: `${OUT}/18-rescue-gives.png` });
    }
    if (r.step === 'part' && kinds.part === 1) await page.screenshot({ path: `${OUT}/19-rescue-part.png` });
    await page.evaluate((i) => window.__akm.rescuePick(i), r.right);
    await wait(page, 150);
    await page.keyboard.press('Space');
    await wait(page, 550);
  }
  check('level 3: home, then what it gives, then the body part, for each animal', kinds.home === 3 && kinds.gives === 3 && kinds.part === 3, JSON.stringify(kinds));
  check('two desert animals and one from the rainforest', animals.size === 3 && ['camel', 'fennec', 'gecko', 'tortoise', 'roadrunner'].filter((a) => animals.has(a)).length === 2, [...animals].join());
  await page.getByRole('button', { name: /^done$/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await waitFor(page, async () => !!(await st(page)).panel, 40);
  s = await st(page);
  check('the desert journal asks level 3 questions', s.panel?.trip === 'desert' && s.panel.tier === 3);
  await page.screenshot({ path: `${OUT}/20-desert-journal.png` });
  await playJournal(page);
  const ds = await debrief(page, false);
  s = await st(page);
  check('the Desert patch', s.done.includes('desert') && /Desert patch/.test(ds));
  await page.screenshot({ path: `${OUT}/21-two-patches.png` });

  // the Poles: the Arctic first, then the research boat to Antarctica
  await clickTarget(page, 'tala', [10.6, 12.4]);
  await choose(page, /Go to the Poles/);
  await waitFor(page, async () => (await st(page)).area === 'poles' && (await page.locator('.dialogue').count()) > 0, 60);
  const poles = await talkThrough(page);
  check('the Poles: the Arctic at the top of the world, Antarctica across the sea', /top of the world/.test(poles) && /Antarctica/.test(poles));
  await page.screenshot({ path: `${OUT}/40-poles-arctic.png` });
  for (const i of [0, 1, 2, 3]) await spotWithKeys(page, i);
  s = await st(page);
  check(
    'the four Arctic animals are spotted; the penguins and the seal are across the sea',
    s.unspotted.length === 2 && s.unspotted.includes('penguin') && s.unspotted.includes('seal') && s.player.x < 13.6,
  );
  const boat = await page.evaluate(() => window.__akm.screenOf('ship-south'));
  await page.evaluate(() => window.__akm.teleport(11.6, 11.2));
  await wait(page, 300);
  await page.mouse.click(boat.x, boat.y - 10);
  await waitFor(page, async () => (await st(page)).target === 'ship-south' || (await page.locator('.dialogue').count()) > 0, 60);
  if (!(await page.locator('.dialogue').count())) await page.keyboard.press('Space');
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0, 60);
  const sail = await talkThrough(page);
  s = await st(page);
  check('the research boat sails to Antarctica, and Ranger Tala says how far it really is', s.player.x > 16.4 && /15,000 kilometers/.test(sail), `x ${s.player.x.toFixed(1)}`);
  await page.screenshot({ path: `${OUT}/41-poles-antarctica.png` });
  await spotWithKeys(page, 4);
  await spotWithKeys(page, 5);
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await waitFor(page, async () => (await st(page)).area === 'camp', 60);
  check('all six polar animals spotted; back at camp', (await st(page)).spottedAll.includes('poles'));
  await clickTarget(page, 'amara', [13.4, 12]);
  await waitFor(page, async () => !!(await st(page)).rescue, 60);
  const pk = await playRescue(page);
  check('the Poles’ Rescue Center: three animals home', pk.home === 3, JSON.stringify(pk));
  await page.getByRole('button', { name: /^done$/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await waitFor(page, async () => !!(await st(page)).panel, 40);
  s = await st(page);
  check('the Poles journal opens', s.panel?.trip === 'poles');
  await page.evaluate(() => window.__akm.closeModal());
  await wait(page, 300);
  await page.evaluate(() => window.__akm.ask('poles', 'p-penguins'));
  await wait(page, 300);
  await page.screenshot({ path: `${OUT}/42-poles-globe.png` });
  s = await st(page);
  const pw = s.panel.wrong.find((w) => w.misconception === 'penguin-north');
  await page.locator(`.akm-choice[data-value="${pw.value}"]`).click();
  await wait(page, 250);
  check('“penguins live in the Arctic” is answered with a reason', /No wild penguins live in the Arctic/.test(await page.locator('.akm-feedback').textContent()));
  await page.keyboard.press(String(s.panel.right + 1));
  await wait(page, 200);
  await page.keyboard.press('Space');
  await wait(page, 300);
  await playJournal(page);
  const pd = await debrief(page, true);
  check('the Poles patch, after the talk-it-through question about polar bears and penguins', (await st(page)).done.includes('poles') && /opposite|top of the Earth/.test(pd));

  // the Wetland and Sea: the dolphin and the whale from the beach
  await clickTarget(page, 'tala', [10.6, 12.4]);
  await choose(page, /Go to the wetland/);
  await waitFor(page, async () => (await st(page)).area === 'wetland' && (await page.locator('.dialogue').count()) > 0, 60);
  const wet = await talkThrough(page);
  check('the wetland: fresh water in the pond, salt water in the sea', /fresh water/.test(wet) && /salty/.test(wet));
  await page.screenshot({ path: `${OUT}/43-wetland.png` });
  s = await st(page);
  check('the wetland has six animals to spot (its tree frog is already in the journal)', s.unspotted.length === 6 && !s.unspotted.includes('frog'));
  await page.evaluate(() => window.__akm.teleport(20.6, 11.4));
  await wait(page, 600);
  s = await st(page);
  check('from the beach, the binoculars reach the dolphin out at sea', s.target === 'animal:4', s.target);
  for (const i of [0, 1, 2, 3, 4]) await spotWithKeys(page, i);
  await spotWithKeys(page, 5);
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await waitFor(page, async () => (await st(page)).area === 'camp', 60);
  await clickTarget(page, 'amara', [13.4, 12]);
  await waitFor(page, async () => !!(await st(page)).rescue, 60);
  await playRescue(page);
  await page.getByRole('button', { name: /^done$/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await waitFor(page, async () => !!(await st(page)).panel, 40);
  check('the wetland journal opens', (await st(page)).panel?.trip === 'wetland');
  await page.evaluate(() => window.__akm.closeModal());
  await wait(page, 300);
  await page.evaluate(() => window.__akm.ask('wetland', 'w-cycle'));
  await wait(page, 300);
  await page.screenshot({ path: `${OUT}/44-life-cycle.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.evaluate(() => window.__akm.ask('wetland', 'w-salty'));
  await wait(page, 300);
  await page.screenshot({ path: `${OUT}/45-fresh-salt.png` });
  await playJournal(page);
  const wd = await debrief(page, true);
  s = await st(page);
  check('the fourth patch: the sun sets over the camp and Ranger Tala hands over the flashlight', s.done.length === 4 && s.timeOfDay === 'evening' && s.allDoneSeen && /Night Safari/.test(wd));
  check('the dolphin talk-it-through question: a mammal that breathes air', /breathe air/.test(wd));
  await page.screenshot({ path: `${OUT}/46-camp-dusk.png` });

  // the Night Safari
  await clickTarget(page, 'tala', [10.6, 12.4]);
  await choose(page, /Start the Night Safari/);
  await waitFor(page, async () => !!(await st(page)).night, 60);
  await wait(page, 400);
  await page.screenshot({ path: `${OUT}/47-night-dark.png` });
  await page.evaluate(() => window.__akm.nightShine());
  await wait(page, 200);
  check('shining at nothing says to look for eyes', /Look for two shining eyes/.test(await page.locator('.akm-night .akm-spot-status').textContent()));
  await page.keyboard.press('k');
  await wait(page, 300);
  check('Kiki points where to look', /Kiki points her tail/.test(await page.locator('.akm-night .akm-spot-status').textContent()));
  const b0 = (await st(page)).night.beam;
  await page
    .locator('.akm-night-canvas')
    .focus()
    .catch(() => {});
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let k = 0; k < 4; k++) await page.keyboard.press('ArrowRight');
  const b1 = (await st(page)).night.beam;
  check('the arrow keys move the flashlight', b1.x > b0.x, `${b0.x} → ${b1.x}`);
  // the owl with a real click on its eyes
  const canvasBox = await page.locator('.akm-night-canvas').boundingBox();
  await page.mouse.click(canvasBox.x + (62 / 320) * canvasBox.width, canvasBox.y + (52 / 180) * canvasBox.height);
  await wait(page, 300);
  s = await st(page);
  check('clicking on the owl’s shining eyes finds it, with a question', s.night.found.includes('owl') && s.night.asking === 'owl');
  await page.screenshot({ path: `${OUT}/48-night-owl.png` });
  await page.keyboard.press(String(s.night.right + 1));
  await wait(page, 250);
  await page.keyboard.press('Space');
  await wait(page, 250);
  // the bat: a wrong answer first
  await page.evaluate(() => window.__akm.nightAim('bat'));
  await page.evaluate(() => window.__akm.nightShine());
  await wait(page, 250);
  s = await st(page);
  const wrongBat = [0, 1, 2].find((i) => i !== s.night.right);
  await page.evaluate((i) => window.__akm.nightAnswer(i), wrongBat);
  await wait(page, 250);
  check('a wrong answer about bats gets a reason', /Not quite/.test(await page.locator('.akm-night-ask .akm-feedback').textContent()));
  await page.evaluate((i) => window.__akm.nightAnswer(i), s.night.right);
  await wait(page, 250);
  await page.screenshot({ path: `${OUT}/49-night-bat.png` });
  await page.keyboard.press('Space');
  await wait(page, 250);
  for (const id of ['frog', 'kinkajou', 'jaguar']) {
    await page.evaluate((x) => window.__akm.nightAim(x), id);
    await page.evaluate(() => window.__akm.nightShine());
    await wait(page, 200);
    const n = (await st(page)).night;
    await page.evaluate((i) => window.__akm.nightAnswer(i), n.right);
    await wait(page, 200);
    if (id !== 'jaguar') {
      await page.keyboard.press('Space');
      await wait(page, 200);
    }
  }
  check('all five night animals found', (await st(page)).night.found.length === 5);
  await page.getByRole('button', { name: /see the whole wild lands/i }).click();
  await waitFor(page, async () => (await page.locator('.akm-finale').count()) > 0, 40);
  await wait(page, 300);
  await page.screenshot({ path: `${OUT}/50-finale.png` });
  s = await st(page);
  check(
    'every animal on the lit map, and the game tells the site player it is complete',
    s.nightDone && s.complete?.type === 'game-complete' && s.complete.score === 24 && (await page.locator('.akm-finale-animals img').count()) === 24,
  );
  await page.getByRole('button', { name: /^done$/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  const fin = await talkThrough(page);
  check('Ranger Tala names a full Junior Ranger, and Dr. Amara offers Speed Match', /full Junior Ranger/.test(fin) && /Speed Match/.test(fin));

  // Speed Match
  await clickTarget(page, 'amara', [13.4, 12]);
  await choose(page, /Speed Match/);
  await waitFor(page, async () => !!(await st(page)).speed, 40);
  await page.screenshot({ path: `${OUT}/51-speed-start.png` });
  await page.evaluate(() => window.__akm.speedPick(0));
  await wait(page, 200);
  for (let k = 0; k < 4; k++) {
    const sp = (await st(page)).speed;
    await page.keyboard.press(String(sp.right + 1));
    await wait(page, 120);
  }
  const sp = (await st(page)).speed;
  await page.keyboard.press(String(((sp.right + 1) % 4) + 1));
  await wait(page, 150);
  check('Speed Match: a wrong home just costs time, with the reason', /needs/.test(await page.locator('.akm-speed .akm-feedback').textContent()) && (await st(page)).speed.score === 4);
  await page.screenshot({ path: `${OUT}/52-speed.png` });
  await page.evaluate(() => window.__akm.speedFinish());
  await wait(page, 300);
  check('Speed Match ends with the score, and keeps the best', /4 animals home/.test(await page.locator('.akm-speed-result').textContent()) && (await st(page)).speedBest === 4);
  await page.getByRole('button', { name: /^done$/i }).click();
  await wait(page, 400);

  // a question by id (the pair picture), the journal, the trip list and the grown-ups page
  await page.evaluate(() => window.__akm.ask('desert', 'd-arctic-ears'));
  await wait(page, 400);
  await page.screenshot({ path: `${OUT}/22-pair-question.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.evaluate(() => window.__akm.ask('rainforest', 'r-layers'));
  await wait(page, 300);
  await page.keyboard.press('h');
  await page.keyboard.press('h');
  await wait(page, 300);
  check('the layers picture is labeled after hint 2', (await page.locator('.akm-tag', { hasText: 'The canopy' }).count()) === 1);
  await page.screenshot({ path: `${OUT}/23-layers.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.keyboard.press('b');
  await wait(page, 400);
  check('the Ranger Journal shows 24 of 24 animals', /24 of 24/.test(await page.locator('#journal-title').textContent()));
  await page.screenshot({ path: `${OUT}/24-journal-cards.png` });
  await page.locator('.akm-guide-card', { hasText: 'Camel' }).click();
  await wait(page, 300);
  check('an animal card has its home and two facts', /hump stores fat/.test(await page.locator('.akm-card').textContent()));
  await page.screenshot({ path: `${OUT}/25-camel-card.png` });
  await page.getByRole('button', { name: /^back$/i }).click();
  await wait(page, 300);
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.keyboard.press('j');
  await wait(page, 300);
  const trips = await page.locator('.belt-list').textContent();
  check('the trip list: four patches', (trips.match(/Patch earned/g) ?? []).length === 4);
  await page.screenshot({ path: `${OUT}/26-trips.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);
  await page.keyboard.press('g');
  await wait(page, 400);
  const gu = page.locator('.modal');
  check('G opens the grown-ups page (with the NGSS standards)', (await gu.count()) > 0 && (await gu.innerText()).includes('NGSS K-ESS3-1') && (await gu.innerText()).includes('NGSS 3-LS4-3'));
  const gp = page.getByRole('tab', { name: /how it is going|progress/i });
  if (await gp.count()) await gp.first().click();
  await wait(page, 300);
  const report = (await page.locator('.progress-table').textContent()) ?? '';
  check(
    'the grown-ups report lists the four trips, the Rescue Center and the Night Safari',
    (await page.locator('.progress-table tbody tr').count()) === 6 && /The Poles/.test(report) && /12 animals taken home/.test(report) && /Night Safari/.test(report),
  );
  await page.screenshot({ path: `${OUT}/27-grownups.png` });
  await page.keyboard.press('Escape');
  await wait(page, 300);

  // reload: the save comes back
  await page.reload();
  await wait(page, 2000);
  await page.getByRole('button', { name: /continue/i }).click();
  await wait(page, 800);
  s = await st(page);
  check(
    'after a reload the patches, the journal, the Night Safari and the best Speed Match are kept',
    s.done.length === 4 && s.journal.length === 24 && s.homes === 12 && s.nightDone && s.speedBest === 4 && s.timeOfDay === 'evening',
  );
  await ctx.close();
}

// ---------------------------------------------------------------- the phone layout
{
  const { ctx, page } = await newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(URL);
  await wait(page, 2500);
  await page.getByRole('button', { name: /start a new game/i }).click();
  await wait(page, 400);
  await page.getByRole('button', { name: /i'm ready/i }).click();
  await waitFor(page, async () => (await page.locator('.dialogue').count()) > 0);
  await talkThrough(page);
  await page.evaluate(() => window.__akm.travel('rainforest'));
  await waitFor(page, async () => (await st(page)).area === 'rainforest' && (await page.locator('.dialogue').count()) > 0, 60);
  await talkThrough(page);
  await page.screenshot({ path: `${OUT}/30-phone-rainforest.png` });
  await page.evaluate(() => window.__akm.spot(1));
  await wait(page, 500);
  await page.screenshot({ path: `${OUT}/31-phone-binoculars.png` });
  const wide = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  check('phone: the binoculars fit with no sideways scrolling', wide);
  await page.evaluate(() => window.__akm.closeModal());
  await wait(page, 300);
  await page.evaluate(() => window.__akm.travel('camp'));
  await wait(page, 1200);
  await page.evaluate(() => window.__akm.rescue());
  await wait(page, 300);
  // nothing to take home yet: nothing opens
  check('phone: the Rescue Center stays shut before any trip is spotted', !(await st(page)).rescue);
  await page.evaluate(() => window.__akm.ask('rainforest', 'r-layers'));
  await wait(page, 400);
  await page.screenshot({ path: `${OUT}/32-phone-journal.png` });
  const fits = await page.evaluate(() => {
    const m = document.querySelector('.akm-panel');
    return m ? m.getBoundingClientRect().right <= window.innerWidth + 1 : false;
  });
  check('phone: the Ranger Journal fits the screen', fits);
  await ctx.close();
}

check('no console errors', errors.length === 0, errors.slice(0, 3).join(' | '));
check('nothing loaded from other websites', offsite.length === 0, offsite.slice(0, 3).join(' '));
await browser.close();
const failed = results.filter((r) => !r.ok);
writeFileSync(`${OUT}/report.json`, JSON.stringify({ passed: results.length - failed.length, total: results.length, results, errors, offsite }, null, 2));
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
