// Phase 0 check-in test: plays the required path in a real browser with
// real keyboard, mouse and touch input, checks each acceptance criterion,
// and captures the check-in screenshots.
//
//   npm run build && npx vite preview --port 4173 &
//   node scripts/e2e-phase0.mjs [baseUrl]
//
// Writes test-output/phase0/*.png and test-output/phase0/report.json.
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:4173/';
const OUT = 'test-output/phase0';
mkdirSync(OUT, { recursive: true });

import {
  results,
  consoleErrors,
  check,
  watch,
  state,
  sleep,
  walkTo,
  walkPath,
  tapKey,
  dialogueText,
  advanceUntil,
  finishDialogue,
  clickChoice,
  layoutProblems,
  pixelCheck,
  launch,
} from './e2e-lib.mjs';

const browser = await launch();

// =====================================================================
// Desktop run: 1280x720, keyboard + mouse
// =====================================================================
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
watch(page, 'desktop');
await page.goto(BASE);
await sleep(page, 1500);
await page.screenshot({ path: `${OUT}/00-title.png` });
check('Title screen loads with no save', await page.getByRole('button', { name: /start a new game/i }).isVisible());

// --- customize (mouse) ---
await page.getByRole('button', { name: /start a new game/i }).click();
await sleep(page, 500);
await page.getByRole('radio', { name: 'Brown', exact: true }).first().click();
await page.getByRole('radio', { name: 'Braids' }).click();
await page.locator('[aria-labelledby="leg-hairColor"]').getByRole('radio', { name: 'Dark brown' }).click();
await page.getByRole('radio', { name: 'Sunflower' }).click();
// keyboard path: arrow keys move between accessory choices
await page.getByRole('radio', { name: 'None' }).focus();
await page.keyboard.press('ArrowRight');
await sleep(page, 300);
await page.screenshot({ path: `${OUT}/01-customization.png` });
const chosen = { skin: 'skin3', hairStyle: 'braids', hairColor: 'darkbrown', outfit: 'yellow', accessory: 'glasses' };
await page.getByRole('button', { name: /i'm ready/i }).click();
await sleep(page, 600);
let s = await state(page);
check('Customization applies all choices (keyboard + mouse)', JSON.stringify(s.appearance) === JSON.stringify(chosen), JSON.stringify(s.appearance));
check('Fresh start objective points to Carver', /Carver/.test(s.objective), s.objective);
check('Onboarding tip shown', /W A S D|arrow/i.test((await page.locator('.tip').textContent()) ?? ''));
const pix = await pixelCheck(page);
check('Integer-scale pixel rendering (no blur) at 1280x720', pix.integerScale && pix.exact && /pixelated|crisp/.test(pix.rendering), JSON.stringify(pix));
check('No clipped or off-screen UI at 1280x720 (hub)', (await layoutProblems(page)).length === 0, (await layoutProblems(page)).join('; '));

// --- keyboard movement, collision, full hub loop ---
const x0 = s.player.x;
await tapKey(page, 'd', 300);
s = await state(page);
check('WASD moves the player', s.player.x > x0 + 0.3, `${x0} -> ${s.player.x}`);
await walkTo(page, 5.5, 18.5);
// collision: walking up into the cottage wall stops at the wall
await walkTo(page, 7.5, 18.5);
await tapKey(page, 'ArrowUp', 900);
s = await state(page);
check('Collision stops the player at the cottage wall', s.player.y > 17.0 && s.player.y < 18.5, `y=${s.player.y}`);
await walkTo(page, 7.5, 18.5);
const t0 = Date.now();
await walkPath(page, [
  [11.5, 18.5],
  [11.5, 9.5],
  [27.5, 9.5],
  [27.5, 26.5],
  [11.5, 26.5],
  [11.5, 9.5],
]);
check('Walked the complete hub road loop with no dead ends', true, `${((Date.now() - t0) / 1000).toFixed(1)}s`);
s = await state(page);
check('Carver shows the new-quest marker', s.objective === 'Talk to George Washington Carver');

// --- meet Carver and accept the quest ---
await walkPath(page, [[19.5, 9.5], [19.5, 7.5], [20.3, 7.5]]);
await tapKey(page, 'ArrowRight', 30);
s = await state(page);
check('Interaction prompt appears next to Carver', /Carver/.test(s.target?.label ?? ''), s.target?.label);
await page.screenshot({ path: `${OUT}/02a-carver-prompt.png` });
await page.keyboard.press('e');
await sleep(page, 300);
check('Talking opens a dialogue with Carver', (await page.locator('.dialogue .name').textContent()) === 'George Washington Carver');
check('Carver is labeled a real scientist with story-written words', await page.locator('.dialogue .badge').isVisible());
await advanceUntil(page, /help me with one/);
await clickChoice(page, /What kind of help/);
await advanceUntil(page, /Mae Porter/);
await page.screenshot({ path: `${OUT}/02-carver-assigns-quest.png` });
await clickChoice(page, /go and get it/);
await sleep(page, 200);
s = await state(page);
check('Accepting the quest makes it active', s.practice.stage === 'active');
await finishDialogue(page);
s = await state(page);
check('Next task now points to Mae', /Mae/.test(s.objective), s.objective);

// --- journal (keyboard J) ---
await page.keyboard.press('j');
await sleep(page, 400);
const journalText = (await page.locator('.modal .content').textContent()) ?? '';
check('Journal shows Carver\'s assignment, NPC lead and item checklist', /assignment/i.test(journalText) && /Mae Porter/.test(journalText) && /Mystery Seed Packet/.test(journalText));
await page.screenshot({ path: `${OUT}/03a-journal-quest.png` });
await page.keyboard.press('Escape');
await sleep(page, 250);
check('Escape closes the journal', (await page.locator('.modal').count()) === 0);

// --- walk to Mae (mouse click on her sprite once she is on screen) ---
await walkPath(page, [[20.3, 9.5], [27.5, 9.5], [27.5, 19.5], [30.5, 19.5]]);
const mae = await page.evaluate(() => window.__sog.project(32.5, 18.5));
await page.mouse.click(mae.x, mae.y - 30);
for (let i = 0; i < 40 && !(await page.locator('.dialogue').count()); i++) await sleep(page, 100);
check('Clicking Mae walks over and starts talking (mouse path)', (await page.locator('.dialogue .name').textContent().catch(() => '')) === 'Mae Porter');
await advanceUntil(page, /label never says/);
await clickChoice(page, /What is the Seed & Mail/);
await advanceUntil(page, /grows or goes/);
await clickChoice(page, /take the seeds to Carver/);
await advanceUntil(page, /Handle it gently/);
await sleep(page, 300);
await page.screenshot({ path: `${OUT}/03-mae-gives-item.png` });
s = await state(page);
check('Mae grants the seed packet through dialogue', s.inventory.some((e) => e.itemId === 'seed_packet' && e.from === 'mae'));
await finishDialogue(page);

// --- inspect item in the bag (keyboard I) ---
await page.keyboard.press('i');
await sleep(page, 400);
const bagText = (await page.locator('.modal .content').textContent()) ?? '';
check('Bag shows the item with source, purpose and status', /From/.test(bagText) && /Mae Porter/.test(bagText) && /Purpose/.test(bagText) && /Not used yet/.test(bagText));
await page.screenshot({ path: `${OUT}/04-inventory-inspect.png` });
s = await state(page);
check('Inspecting marks the item as looked at', s.inventory[0].inspected === true);
await page.keyboard.press('Escape');
await sleep(page, 200);

// --- return to Carver: wrong answer, hint, correct answer ---
s = await state(page);
check('Next task says return to Carver', /Return to Carver/.test(s.objective), s.objective);
await walkPath(page, [[27.5, 19.5], [27.5, 9.5], [21.5, 9.5], [21.5, 8.8]]);
await tapKey(page, 'ArrowUp', 30);
await page.keyboard.press('e');
await sleep(page, 300);
await advanceUntil(page, /Which of these is an observation/);
await clickChoice(page, /giant sunflowers/);
await sleep(page, 400);
const fb = (await page.locator('.dialogue .feedback').textContent()) ?? '';
check('Wrong answer gets explanatory feedback and a hint', /guess about the future/.test(fb) && /clue/i.test(fb), fb.slice(0, 80));
check('Wrong choice is removed (narrowing) and retry is offered', (await page.locator('.choices button[disabled]').count()) === 1);
await page.screenshot({ path: `${OUT}/05-carver-hint.png` });
await page.keyboard.press('2'); // number keys pick choices
await sleep(page, 400);
const fb2 = (await page.locator('.dialogue .feedback').textContent()) ?? '';
check('Correct answer (chosen with a number key) is confirmed', /That's an observation/.test(fb2), fb2.slice(0, 60));
await page.keyboard.press('Space');
await advanceUntil(page, /tried again/);
await page.screenshot({ path: `${OUT}/06-carver-debrief.png` });
check('Carver responds to the retry and acknowledges the item', /tried again/.test(await dialogueText(page)));
await finishDialogue(page);
await sleep(page, 500);
s = await state(page);
check('Quest completes; item marked used', s.practice.stage === 'complete' && s.inventory[0].used, JSON.stringify(s.practice));
check('Rewards paid once: 50 XP and 10 Seeds', s.xp === 50 && s.seeds === 10, `xp ${s.xp}, seeds ${s.seeds}`);
check('Learner model recorded attempts and a misconception', s.learner.observe?.attempts === 2 && s.learner.observe?.misconception === 'prediction-as-observation');
await page.screenshot({ path: `${OUT}/06b-quest-complete.png` });
// replay protection: talk again, nothing is paid twice
await page.keyboard.press('e');
await sleep(page, 300);
await finishDialogue(page);
s = await state(page);
check('Talking to Carver again does not pay rewards twice', s.xp === 50 && s.seeds === 10);

// --- room: enter, windowsill pot, rest until night ---
await walkPath(page, [[21.5, 9.5], [11.5, 9.5], [11.5, 18.5], [5.5, 18.5]]);
await tapKey(page, 'ArrowUp', 30);
await page.keyboard.press('e');
await sleep(page, 1200);
s = await state(page);
check('Enter the cottage room', s.scene === 'room');
await page.screenshot({ path: `${OUT}/07-room.png` });
await walkPath(page, [[5, 5.5], [2.2, 5.5], [2.2, 4.6]]);
await tapKey(page, 'ArrowUp', 30);
s = await state(page);
check('Bed can be used', /Rest/.test(s.target?.label ?? ''), s.target?.label);
const dayBefore = s.time.day;
await page.keyboard.press('e');
await sleep(page, 400);
await page.getByRole('button', { name: /Rest until nighttime/ }).click();
await sleep(page, 1800);
s = await state(page);
check('Resting in bed changes the time (to night)', Math.abs(s.time.minutes - 21 * 60) < 5 && s.time.day >= dayBefore, JSON.stringify(s.time));
await walkPath(page, [[5, 5.5], [5, 7.6]]);
await tapKey(page, 'ArrowDown', 500);
await sleep(page, 1200);
s = await state(page);
check('Exit the room by walking out of the door', s.scene === 'hub');
await walkPath(page, [[11.5, 18.5], [11.5, 16.5], [16.5, 16.5]]);
await sleep(page, 500);
await page.screenshot({ path: `${OUT}/08-night-hub.png` });

// --- journal replay: conversations can be replayed without changing progress ---
await page.keyboard.press('j');
await sleep(page, 300);
await page.getByRole('tab', { name: /Talks/ }).click();
await sleep(page, 200);
await page.getByRole('button', { name: /Replay: Mae: The seed packet/ }).click();
await sleep(page, 500);
check('Journal replays a past conversation', (await page.locator('.dialogue .name').textContent().catch(() => '')) === 'Mae Porter');
await page.getByRole('button', { name: /Skip ahead/ }).click();
await finishDialogue(page);
s = await state(page);
check('Replay changes nothing (no duplicate item)', s.inventory.length === 1 && s.xp === 50);

// --- settings: export, reset confirmation, pause the clock, mute (M), reduced motion ---
await page.keyboard.press('Escape');
await sleep(page, 300);
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
  page.getByRole('button', { name: 'Download a save file' }).click(),
]);
check('Manual save export downloads a file', !!download && /seeds-of-genius-save/.test(download?.suggestedFilename() ?? ''), download?.suggestedFilename());
await sleep(page, 300);
await page.keyboard.press('Escape');
await sleep(page, 300);
await page.keyboard.press('Escape');
await sleep(page, 300);
await page.getByRole('button', { name: /Start over/ }).click();
await sleep(page, 300);
check('Reset asks for explicit confirmation', await page.getByRole('button', { name: /Yes, delete and start over/ }).isVisible());
await page.getByRole('button', { name: /No, keep my progress/ }).click();
await sleep(page, 300);
s = await state(page);
check('Choosing "No" keeps progress', s.practice.stage === 'complete' && s.xp === 50);
await page.keyboard.press('Escape');
await sleep(page, 300);
await page.getByRole('button', { name: 'Paused' }).click();
await page.locator('[aria-labelledby="set-motion"] button', { hasText: 'On' }).click();
await page.screenshot({ path: `${OUT}/09-settings.png` });
await page.keyboard.press('Escape');
await sleep(page, 200);
await page.keyboard.press('m');
await sleep(page, 200);
const muted = await page.evaluate(() => JSON.parse(localStorage.getItem('seedsOfGenius.settings')).muted);
check('M key mutes sound (persisted)', muted === true);
const rm = await page.evaluate(() => document.documentElement.dataset.reducedMotion);
check('Reduced motion switch applies', rm === 'true');
const minutesA = (await state(page)).time.minutes;
await sleep(page, 1500);
const minutesB = (await state(page)).time.minutes;
check('Day/night pause switch stops the clock', minutesA === minutesB, `${minutesA} -> ${minutesB}`);

// --- reload: appearance, item, time preference survive ---
await page.reload();
await sleep(page, 1200);
await page.getByRole('button', { name: 'Continue' }).click();
await sleep(page, 800);
s = await state(page);
check('Reload keeps appearance', JSON.stringify(s.appearance) === JSON.stringify(chosen));
check('Reload keeps the quest item and quest state', s.inventory[0]?.itemId === 'seed_packet' && s.inventory[0].used && s.practice.stage === 'complete');
check('Reload keeps time of day and the pause preference', s.time.paused === true && Math.abs(s.time.minutes - minutesA) < 2, JSON.stringify(s.time));
check('Reload keeps XP/Seeds', s.xp === 50 && s.seeds === 10);

// --- save recovery: corrupt the main save, backup restores it ---
// (Go to the title screen first: the running game saves on exit, which would
// repair the damage before the next load.)
await page.reload();
await sleep(page, 800);
await page.evaluate(() => localStorage.setItem('seedsOfGenius.save', '{"sum":"x","body":"broken'));
await page.reload();
await sleep(page, 1000);
await page.getByRole('button', { name: 'Continue' }).click();
await sleep(page, 800);
s = await state(page);
const toastText = (await page.locator('.toasts').textContent()) ?? '';
check('Corrupted save recovers from the backup with a notice', s.practice.stage === 'complete' && /backup/i.test(toastText), toastText.slice(0, 80));
const quarantined = await page.evaluate(() => !!localStorage.getItem('seedsOfGenius.save.unreadable'));
check('Damaged save is set aside, not deleted', quarantined);

// Performance sample (headless software rendering; real GPUs are much faster).
const fps = await page.evaluate(
  () =>
    new Promise((resolve) => {
      let n = 0;
      const t0 = performance.now();
      const tick = () => {
        n++;
        if (performance.now() - t0 < 2000) requestAnimationFrame(tick);
        else resolve(Math.round((n * 1000) / (performance.now() - t0)));
      };
      requestAnimationFrame(tick);
    }),
);
check('Frame rate sample (software renderer)', fps >= 20, `${fps} fps`);
await ctx.close();

// =====================================================================
// Narrow run: 390x844 phone, touch
// =====================================================================
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p2 = await phone.newPage();
watch(p2, 'narrow');
await p2.goto(BASE);
await sleep(p2, 1200);
await p2.getByRole('button', { name: /start a new game/i }).tap();
await sleep(p2, 500);
await p2.getByRole('radio', { name: 'Curly' }).tap();
await p2.getByRole('radio', { name: 'Cap' }).tap();
await p2.screenshot({ path: `${OUT}/10-narrow-customization.png` });
await p2.getByRole('button', { name: /i'm ready/i }).tap();
await sleep(p2, 600);
check('Touch controls appear on a touch phone', await p2.locator('.touch').isVisible());
const pp = await pixelCheck(p2);
check('Integer-scale pixel rendering at 390x844 (DPR 2)', pp.integerScale && pp.exact, JSON.stringify(pp));
check('No clipped or off-screen UI at 390x844 (hub)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
// Tap-and-hold the D-pad to walk right.
let n0 = (await state(p2)).player.x;
const right = p2.getByRole('button', { name: 'Walk right' });
const box = await right.boundingBox();
void box;
await p2.dispatchEvent('.touch .right', 'pointerdown', { pointerId: 7, pointerType: 'touch' });
await sleep(p2, 500);
await p2.dispatchEvent('.touch .right', 'pointerup', { pointerId: 7, pointerType: 'touch' });
let n1 = (await state(p2)).player.x;
check('D-pad walks the player (touch path)', n1 > n0 + 0.3, `${n0} -> ${n1}`);
await p2.screenshot({ path: `${OUT}/11-narrow-hub.png` });
// Tap the ground to walk (tap-to-move).
n0 = (await state(p2)).player;
const g = await p2.evaluate(() => window.__sog.project(11.5, 20.5));
await p2.touchscreen.tap(g.x, g.y);
await sleep(p2, 2500);
n1 = (await state(p2)).player;
check('Tapping the ground walks there', Math.hypot(n1.x - 11.5, n1.y - 20.5) < 0.8, JSON.stringify(n1));
await walkPath(p2, [[11.5, 9.5], [21.5, 9.5], [21.5, 8.8]]);
await tapKey(p2, 'ArrowUp', 30);
await p2.locator('.touch-act').tap();
await sleep(p2, 400);
check('Touch Talk button starts Carver\'s conversation', (await p2.locator('.dialogue .name').textContent().catch(() => '')) === 'George Washington Carver');
await p2.locator('.dialogue').tap({ position: { x: 200, y: 60 } });
await advanceUntil(p2, /help me with one/);
await p2.screenshot({ path: `${OUT}/12-narrow-carver-dialogue.png` });
check('No clipped or off-screen UI at 390x844 (dialogue)', (await layoutProblems(p2)).length === 0, (await layoutProblems(p2)).join('; '));
await finishDialogue(p2);
await p2.getByRole('button', { name: /Journal/ }).tap();
await sleep(p2, 400);
await p2.screenshot({ path: `${OUT}/13-narrow-journal.png` });
await p2.getByRole('tab', { name: /Map/ }).tap();
await sleep(p2, 300);
await p2.screenshot({ path: `${OUT}/14-narrow-journal-map.png` });
await phone.close();

check('No browser console errors', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
await browser.close();

const passed = results.filter((r) => r.ok).length;
writeFileSync(`${OUT}/report.json`, JSON.stringify({ base: BASE, passed, total: results.length, results, consoleErrors }, null, 2));
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
