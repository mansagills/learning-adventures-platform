// Shared helpers for the check-in browser tests (e2e-phase*.mjs).
import { chromium } from 'playwright-core';

export const results = [];
export const consoleErrors = [];
export function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}


export function watch(page, label) {
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(`[${label}] ${m.text()}`);
  });
  page.on('pageerror', (e) => consoleErrors.push(`[${label}] pageerror: ${e.message}`));
}

export const state = (page) => page.evaluate(() => window.__sog.state());
export const sleep = (page, ms) => page.waitForTimeout(ms);

/**
 * Wait until the game has drawn `n` more frames. A frame can stall for a
 * second or more with software rendering (right after Continue, or a new
 * scene); a key pressed and released inside that stall is never seen.
 */
export const frames = (page, n = 2) =>
  page.evaluate(
    (count) =>
      new Promise((done) => {
        let k = 0;
        const tick = () => (++k >= count ? done() : requestAnimationFrame(tick));
        requestAnimationFrame(tick);
      }),
    n,
  );

/** Walk with the keyboard, one axis at a time, like a player would. */
export async function walkTo(page, x, y, tol = 0.2) {
  for (const axis of ['x', 'y']) {
    let last = null;
    let stuck = 0;
    for (let guard = 0; guard < 300; guard++) {
      const s = await state(page);
      const cur = s.player[axis];
      const goal = axis === 'x' ? x : y;
      const d = goal - cur;
      if (Math.abs(d) <= tol) break;
      if (last !== null && Math.abs(cur - last) < 0.01) {
        if (++stuck > 6) throw new Error(`stuck walking ${axis} toward ${goal} at ${JSON.stringify(s.player)}`);
      } else stuck = 0;
      last = cur;
      const key = axis === 'x' ? (d > 0 ? 'ArrowRight' : 'ArrowLeft') : d > 0 ? 'ArrowDown' : 'ArrowUp';
      await frames(page); // never press during a stalled frame
      await page.keyboard.down(key);
      await sleep(page, Math.min(260, Math.max(25, (Math.abs(d) / 4.2) * 700)));
      await page.keyboard.up(key);
    }
  }
}

/**
 * Wait until the game offers a prompt matching `re`. The first frames after
 * loading a scene can be slow with software rendering, so a key pressed
 * right away may arrive before the game has found what you are next to.
 */
export async function waitTarget(page, re, tries = 40) {
  for (let i = 0; i < tries; i++) {
    if (re.test((await state(page)).target?.label ?? '')) return true;
    await sleep(page, 100);
  }
  return false;
}

export async function walkPath(page, pts) {
  for (const [x, y] of pts) await walkTo(page, x, y);
}

export async function tapKey(page, key, ms = 40) {
  await page.keyboard.down(key);
  await sleep(page, ms);
  await frames(page);
  await page.keyboard.up(key);
}

export async function dialogueText(page) {
  return (await page.locator('.dialogue .text').textContent({ timeout: 2000 }).catch(() => '')) ?? '';
}

/** Press Space until the text matches, choices appear, or the talk ends. */
export async function advanceUntil(page, re, max = 30) {
  for (let i = 0; i < max; i++) {
    await sleep(page, 120);
    if (!(await page.locator('.dialogue').count())) return false;
    const text = await dialogueText(page);
    const hint = (await page.locator('.dialogue .footer .continue-hint').textContent().catch(() => '')) ?? '';
    if (re && re.test(text) && hint) return true;
    if (await page.locator('.choices button').count()) return re ? re.test(text) : true;
    await page.keyboard.press('Space');
  }
  return false;
}

export async function finishDialogue(page, max = 40) {
  for (let i = 0; i < max; i++) {
    if (!(await page.locator('.dialogue').count())) return true;
    if (await page.locator('.memory-modal').count()) await page.keyboard.press('Escape');
    else if (await page.locator('.choices button').count()) await page.locator('.choices button:not([disabled])').first().click();
    else await page.keyboard.press('Space');
    await sleep(page, 150);
  }
  return !(await page.locator('.dialogue').count());
}

export async function clickChoice(page, re) {
  await page.locator('.choices button', { hasText: re }).first().click();
  await sleep(page, 200);
}

/** Every visible HUD/dialogue/modal panel must be inside the viewport with no clipped text. */
export async function layoutProblems(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bad = [];
    document.querySelectorAll('.panel, .btn, .toast, .dialogue .text, .objective .text').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') return;
      if (el.closest('.modal .content')) return; // scrollable area
      if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) bad.push(`offscreen: ${el.className} ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`);
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'auto') bad.push(`clipped: ${el.className} "${(el.textContent || '').slice(0, 30)}"`);
    });
    return bad;
  });
}

export async function pixelCheck(page) {
  return page.evaluate(() => {
    const cv = document.querySelector('canvas.game-canvas');
    const s = window.__sog.state().internal;
    const dpr = window.devicePixelRatio || 1;
    const devW = Math.round(cv.getBoundingClientRect().width * dpr);
    return {
      integerScale: Number.isInteger(s.scale),
      exact: Math.abs(devW - s.w * s.scale) < 1,
      rendering: getComputedStyle(cv).imageRendering,
      scale: s.scale,
      internal: `${s.w}x${s.h}`,
    };
  });
}


export function launch() {
  return chromium.launch({
    executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
}
