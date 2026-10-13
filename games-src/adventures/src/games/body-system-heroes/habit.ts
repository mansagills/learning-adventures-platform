import type { PixelBuffer } from '../../kit/art/pixel';
import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { paintHero, type Look16 } from '../../kit/worlds/hero16';
import { paintBigHeart, paintHands, paintKnee, paintProduce, paintScrubber, paintSmile, paintSpeck } from './art';
import type { Mission } from './problems';

/**
 * The healthy-habit mini-games, played in the med bay after a mission's
 * first heal (and again from the body map). Each one scrubs germs off a
 * picture with a soap bubble, a toothbrush or clean water, moved with the
 * mouse, a finger or the arrow keys:
 *   - skin: rinse the scrape clean, then put on a bandage
 *   - mouth: brush every tooth (two minutes, sped up)
 *   - lungs: wash both hands with soap for a real 20 seconds (Happy Birthday twice)
 *   - gut: rinse the dirt off fruit and vegetables, then put the milk back in the fridge
 *   - heart: a jump-rope game (its own screen, below): the heart rate climbs as you jump
 */

interface HabitDef {
  title: string;
  steps: string[];
  picture: () => PixelBuffer;
  speck: 'germ' | 'dirt' | 'plaque';
  tool: 'soap' | 'brush' | 'water';
  count: number;
  /** Seconds the child must keep going (0 = just clean every speck). */
  seconds: number;
  /** What the timer bar says. */
  timer?: string;
  /** Where specks may go: a test on the picture's pixel color (null = anywhere painted). */
  where?: (c: string, x: number, y: number) => boolean;
  /** A second step: a button that finishes the habit (and a new picture to show). */
  step2?: { button: string; picture?: () => PixelBuffer };
  done: string;
}

const SCALE = 3;

/** How light a color is (0-255). */
const lum = (c: string) => {
  const n = parseInt(c.slice(1), 16);
  return 0.3 * ((n >> 16) & 255) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255);
};

export const HABITS: Partial<Record<Mission, HabitDef>> = {
  skin: {
    title: 'Clean and cover',
    steps: ['First, rinse the dirt and germs out of the scrape with clean water.', 'Now cover it with a bandage, to keep new germs out.'],
    picture: () => paintKnee(false),
    speck: 'dirt',
    tool: 'water',
    count: 9,
    seconds: 0,
    where: (_c, x, y) => Math.hypot((x - 64) / 22, (y - 48) / 13) < 1,
    step2: { button: 'Put on the bandage', picture: () => paintKnee(true) },
    done: 'Clean and covered! Now the scrape can heal. Leave the scab alone when it comes.',
  },
  mouth: {
    title: 'Brush every tooth',
    steps: ['Brush every tooth until the plaque is gone. Real brushing takes two minutes, twice a day.'],
    picture: paintSmile,
    speck: 'plaque',
    tool: 'brush',
    count: 14,
    seconds: 15,
    timer: 'Two minutes of brushing (sped up)',
    // only on the teeth (the light pixels)
    where: (c) => lum(c) > 190,
    done: 'Sparkling! Brush like that for two minutes, every morning and every night.',
  },
  lungs: {
    title: 'Wash your hands',
    steps: ['Scrub every germ off both hands with soap. Keep scrubbing for 20 seconds: sing Happy Birthday twice!'],
    picture: paintHands,
    speck: 'germ',
    tool: 'soap',
    count: 16,
    seconds: 20,
    timer: 'Happy Birthday, sung twice (20 seconds)',
    done: 'Squeaky clean! Soap and 20 seconds of scrubbing lift the germs off. Then rinse them away.',
  },
  gut: {
    title: 'Keep food safe',
    steps: ['Rinse the dirt off the fruit and vegetables with clean water.', 'Germs grow fast in warm food. Cold slows them down. Put the milk back in the fridge.'],
    picture: paintProduce,
    speck: 'dirt',
    tool: 'water',
    count: 12,
    seconds: 0,
    // only on the food (not the cutting board)
    where: (c) => {
      const n = parseInt(c.slice(1), 16);
      const r = (n >> 16) & 255;
      const g = (n >> 8) & 255;
      // green leaves, or red and orange fruit (not the brown board)
      return g > r || r - g > 80;
    },
    step2: { button: 'Put the milk in the fridge' },
    done: 'Clean food, cold milk! And always wash your hands before you eat, too.',
  },
};

export interface HabitResult {
  finished: boolean;
}

/** Which missions have a habit game. */
export const HABIT_MISSIONS: Mission[] = ['skin', 'mouth', 'lungs', 'gut', 'heart'];

/** Play a habit mini-game; resolves when it is done or the child leaves. */
export function playHabit(host: HTMLElement, m: Mission, seed: number, look?: Look16): Promise<HabitResult> {
  if (m === 'heart') return playJump(host, look);
  const def = HABITS[m]!;
  return new Promise((resolve) => {
    const r = mulberry32(seed);
    let pic = def.picture();
    const W = pic.w * SCALE;
    const H = pic.h * SCALE;
    const cv = h('canvas', { class: 'bsh-habit-canvas', width: W, height: H, 'aria-label': `${def.title}: move the ${def.tool === 'brush' ? 'toothbrush' : def.tool === 'soap' ? 'soap bubble' : 'water'} over the ${def.speck === 'plaque' ? 'plaque' : 'germs'} to clean them off.` }) as HTMLCanvasElement;
    cv.setAttribute('role', 'img');
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    const step = h('p', { class: 'bsh-habit-step', text: def.steps[0] });
    const barFill = h('span', { class: 'bsh-habit-fill' });
    const bar = h('div', { class: 'bsh-habit-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-label': def.timer ?? 'Cleaned' }, barFill);
    const barLabel = h('span', { class: 'bsh-habit-label', text: def.timer ?? 'Cleaned' });
    const bandage = h('button', { class: 'btn primary', type: 'button', hidden: true, text: def.step2?.button ?? 'Next' });
    const doneBtn = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Done' : 'Done (Space)' });
    const leave = h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)' });
    const root = h(
      'div',
      { class: 'panel modal bsh-habit', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bsh-habit-title' },
      h('header', {}, h('h2', { id: 'bsh-habit-title', text: `Healthy habit: ${def.title}` }), leave),
      h('div', { class: 'content' }, step, h('div', { class: 'bsh-habit-stage' }, cv), h('div', { class: 'bsh-habit-meter' }, barLabel, bar), h('p', { class: 'small-note', text: isTouchDevice() ? 'Rub your finger over the picture.' : 'Move the mouse over the picture, or use the arrow keys.' })),
      h('footer', { class: 'bsh-habit-foot' }, bandage, doneBtn),
    );
    let finished = false;
    const modal = new Modal(host, root, () => {
      stop = true;
      window.removeEventListener('keydown', onKey);
      resolve({ finished });
    });
    leave.addEventListener('click', () => modal.close());
    speak(def.steps[0]);

    // the specks, on painted pixels of the picture (or where the habit says)
    const specks: Array<{ x: number; y: number; img: HTMLCanvasElement }> = [];
    for (let tries = 0; specks.length < def.count && tries < 4000; tries++) {
      const x = Math.floor(r() * pic.w);
      const y = Math.floor(r() * pic.h);
      const c = pic.get(x, y);
      if (!c || (def.where && !def.where(c, x, y))) continue;
      if (specks.some((s) => Math.hypot(s.x - x, s.y - y) < 8)) continue;
      specks.push({ x, y, img: paintSpeck(def.speck, specks.length).toCanvas() });
    }
    const total = specks.length;
    const tool = paintScrubber(def.tool).toCanvas();
    const picCanvas = () => pic.toCanvas(SCALE);
    let picImg = picCanvas();
    let cursor = { x: pic.w / 2, y: pic.h / 2 };
    let scrubbing = 0;
    let stage = 0;
    let stop = false;
    let last = performance.now();
    const keys = new Set<string>();

    const toArt = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      return { x: ((e.clientX - b.left) / b.width) * pic.w, y: ((e.clientY - b.top) / b.height) * pic.h };
    };
    cv.addEventListener('pointermove', (e) => {
      cursor = toArt(e);
      scrubbing = 0.25;
    });
    cv.addEventListener('pointerdown', (e) => {
      cv.setPointerCapture(e.pointerId);
      cursor = toArt(e);
      scrubbing = 0.25;
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.type === 'keyup') {
        keys.delete(e.key);
        return;
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keys.add(e.key);
        e.preventDefault();
      } else if ((e.key === ' ' || e.key === 'Enter') && !doneBtn.hidden) {
        e.preventDefault();
        doneBtn.click();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);

    const finish = () => {
      finished = true;
      audio.levelUp();
      step.textContent = def.done;
      speak(def.done);
      doneBtn.hidden = false;
      requestAnimationFrame(() => doneBtn.focus());
    };
    bandage.addEventListener('click', () => {
      if (def.step2?.picture) {
        pic = def.step2.picture();
        picImg = picCanvas();
      }
      bandage.hidden = true;
      audio.itemGet();
      finish();
    });
    doneBtn.addEventListener('click', () => modal.close());

    let held = 0;
    const tick = (now: number) => {
      if (stop) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // arrow keys move the scrubber
      const kx = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
      const ky = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
      if (kx || ky) {
        cursor = { x: Math.min(pic.w, Math.max(0, cursor.x + kx * 70 * dt)), y: Math.min(pic.h, Math.max(0, cursor.y + ky * 70 * dt)) };
        scrubbing = 0.25;
      }
      if (scrubbing > 0 && stage === 0) {
        scrubbing -= dt;
        held += dt;
        for (const s of [...specks])
          if (Math.hypot(s.x - cursor.x, s.y - cursor.y) < 9) {
            specks.splice(specks.indexOf(s), 1);
            audio.fx([[84 + (specks.length % 5), 0, 0.05]], 'sine', 0.04);
          }
      }
      const cleaned = total ? 1 - specks.length / total : 1;
      const timeDone = def.seconds ? Math.min(1, held / def.seconds) : 1;
      const prog = def.seconds ? Math.min(cleaned, timeDone) : cleaned;
      barFill.style.width = `${Math.round(prog * 100)}%`;
      bar.setAttribute('aria-valuenow', String(Math.round(prog * 100)));
      if (def.seconds) barLabel.textContent = `${def.timer}: ${Math.min(def.seconds, Math.floor(held))} of ${def.seconds}${specks.length ? `, ${specks.length} germs left` : ''}`;
      if (stage === 0 && cleaned >= 1 && timeDone >= 1) {
        stage = 1;
        if (def.step2 && def.steps[1]) {
          step.textContent = def.steps[1];
          speak(def.steps[1]);
          bandage.hidden = false;
          requestAnimationFrame(() => bandage.focus());
        } else finish();
      }
      // draw
      g.clearRect(0, 0, W, H);
      g.drawImage(picImg, 0, 0);
      for (const s of specks) g.drawImage(s.img, Math.round(s.x - 4.5) * SCALE, Math.round(s.y - 4.5) * SCALE, s.img.width * SCALE, s.img.height * SCALE);
      if (stage === 0) {
        g.globalAlpha = 0.9;
        g.drawImage(tool, Math.round(cursor.x - 7) * SCALE, Math.round(cursor.y - 7) * SCALE, tool.width * SCALE, tool.height * SCALE);
        if (scrubbing > 0 && def.tool !== 'brush')
          for (let k = 0; k < 3; k++) {
            const a = now / 200 + k * 2;
            g.drawImage(tool, Math.round(cursor.x + Math.cos(a) * 8 - 3) * SCALE, Math.round(cursor.y + Math.sin(a) * 6 - 3) * SCALE, tool.width * 1.2, tool.height * 1.2);
          }
        g.globalAlpha = 1;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    Object.assign(window, { __bshHabit: { left: () => specks.length, held: () => held, scrubAll: () => specks.splice(0), addTime: (s: number) => (held += s) } });
  });
}

// ------------------------------------------------------------------ the heart: jump rope

const JUMPS = 12;

/**
 * Jump rope: the rope swings round, and the child jumps (Space, a tap or a
 * click) as it reaches the feet. Every good jump makes the heart beat a
 * little faster, from 80 beats a minute up to about 140. A miss costs
 * nothing: the rope just comes round again.
 */
function playJump(host: HTMLElement, look?: Look16): Promise<HabitResult> {
  return new Promise((resolve) => {
    const W = 128 * SCALE;
    const H = 96 * SCALE;
    const cv = h('canvas', { class: 'bsh-habit-canvas', width: W, height: H, 'aria-label': 'Jump rope: jump when the rope reaches your feet.' }) as HTMLCanvasElement;
    cv.setAttribute('role', 'img');
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    const intro = `Moving makes your heart beat faster. Jump over the rope ${JUMPS} times! Jump when the rope reaches your feet.`;
    const step = h('p', { class: 'bsh-habit-step', text: intro });
    const barFill = h('span', { class: 'bsh-habit-fill' });
    const bar = h('div', { class: 'bsh-habit-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(JUMPS), 'aria-label': 'Jumps' }, barFill);
    const barLabel = h('span', { class: 'bsh-habit-label', text: `Jumps: 0 of ${JUMPS}. Heartbeat: 80 a minute` });
    const jumpBtn = h('button', { class: 'btn primary', type: 'button', text: isTouchDevice() ? 'Jump!' : 'Jump! (Space)' });
    const doneBtn = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Done' : 'Done (Enter)' });
    const leave = h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)' });
    const root = h(
      'div',
      { class: 'panel modal bsh-habit', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bsh-habit-title' },
      h('header', {}, h('h2', { id: 'bsh-habit-title', text: 'Healthy habit: Get moving' }), leave),
      h('div', { class: 'content' }, step, h('div', { class: 'bsh-habit-stage' }, cv), h('div', { class: 'bsh-habit-meter' }, barLabel, bar), h('p', { class: 'small-note', text: 'The rope glows when it is close to your feet.' })),
      h('footer', { class: 'bsh-habit-foot' }, jumpBtn, doneBtn),
    );
    let finished = false;
    let stop = false;
    const modal = new Modal(host, root, () => {
      stop = true;
      window.removeEventListener('keydown', onKey);
      resolve({ finished });
    });
    leave.addEventListener('click', () => modal.close());
    speak(intro);

    const hero = look ? [paintHero(look, 1, 'down').toCanvas(), paintHero(look, 1, 'down', { walk: 1 }).toCanvas()] : null;
    const hearts = [paintBigHeart(0).toCanvas(), paintBigHeart(1).toCanvas()];
    let jumps = 0;
    let bpm = 80;
    let air = 0;
    let angle = 0;
    let crossed = false;
    let flash = '';
    let flashT = 0;
    let beatT = 0;
    let last = performance.now();
    const jump = () => {
      if (finished || air > 0) return;
      air = 0.5;
      audio.fx([[76, 0, 0.06]], 'square', 0.04);
    };
    jumpBtn.addEventListener('click', jump);
    cv.addEventListener('pointerdown', jump);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && !finished) {
        e.preventDefault();
        jump();
      } else if (e.key === 'Enter' && finished) {
        e.preventDefault();
        modal.close();
      }
    };
    window.addEventListener('keydown', onKey);
    doneBtn.addEventListener('click', () => modal.close());

    const finish = () => {
      finished = true;
      audio.levelUp();
      const text = `Your heart sped up from 80 to ${bpm} beats a minute! Moving makes your heart stronger. Kids need about an hour of active play every day.`;
      step.textContent = text;
      speak(text);
      jumpBtn.hidden = true;
      doneBtn.hidden = false;
      requestAnimationFrame(() => doneBtn.focus());
    };
    const tick = (now: number) => {
      if (stop) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      air = Math.max(0, air - dt);
      flashT = Math.max(0, flashT - dt);
      if (!finished) {
        // one turn of the rope about every 1.3 seconds; the bottom of the swing is angle PI
        const before = angle % (Math.PI * 2);
        angle += dt * ((Math.PI * 2) / 1.3);
        const after = angle % (Math.PI * 2);
        if (before < Math.PI && after >= Math.PI && !crossed) {
          crossed = true;
          if (air > 0) {
            jumps++;
            bpm = Math.min(140, 80 + jumps * 5);
            flash = 'Jump!';
            audio.fx([[84 + (jumps % 5), 0, 0.08]], 'sine', 0.05);
            barFill.style.width = `${Math.round((jumps / JUMPS) * 100)}%`;
            bar.setAttribute('aria-valuenow', String(jumps));
            barLabel.textContent = `Jumps: ${jumps} of ${JUMPS}. Heartbeat: ${bpm} a minute`;
            if (jumps >= JUMPS) finish();
          } else flash = 'Oops! Try the next one.';
          flashT = 0.8;
        }
        if (after < Math.PI) crossed = false;
      }
      // draw: floor, rope, child, heart
      g.fillStyle = '#e2f3f6';
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#b7d7a8';
      g.fillRect(0, 76 * SCALE, W, 20 * SCALE);
      const cx = 52;
      const feet = 76;
      const lift = air > 0 ? Math.sin((1 - air / 0.5) * Math.PI) * 12 : 0;
      const ropeY = feet - 22 + Math.cos(angle) * -26;
      const near = !finished && Math.abs(((angle % (Math.PI * 2)) - Math.PI)) < 0.7;
      g.strokeStyle = near ? '#ff6fc0' : '#7a5ab8';
      g.lineWidth = SCALE * 1.5;
      g.beginPath();
      g.moveTo((cx - 22) * SCALE, (feet - 30) * SCALE);
      // a quadratic curve through the rope's lowest (or highest) point in the middle
      g.quadraticCurveTo(cx * SCALE, (2 * ropeY - (feet - 30)) * SCALE, (cx + 22) * SCALE, (feet - 30) * SCALE);
      g.stroke();
      if (hero) {
        const img = hero[air > 0 ? 1 : 0];
        g.drawImage(img, Math.round(cx - img.width / 2) * SCALE, Math.round(feet - img.height - lift) * SCALE, img.width * SCALE, img.height * SCALE);
      } else {
        g.fillStyle = '#3f4b9e';
        g.fillRect((cx - 6) * SCALE, (feet - 30 - lift) * SCALE, 12 * SCALE, 30 * SCALE);
      }
      // the heart beats at the current rate
      beatT += dt * (bpm / 60);
      const big = beatT % 1 < 0.2 ? 1 : 0;
      g.drawImage(hearts[big], 92 * SCALE, 8 * SCALE, 40 * SCALE * 0.8, 36 * SCALE * 0.8);
      g.fillStyle = '#1d1a30';
      g.font = `bold ${7 * SCALE}px sans-serif`;
      g.fillText(`${bpm}`, 98 * SCALE, 48 * SCALE);
      g.font = `${4 * SCALE}px sans-serif`;
      g.fillText('beats a minute', 90 * SCALE, 54 * SCALE);
      if (flashT > 0) {
        g.font = `bold ${6 * SCALE}px sans-serif`;
        g.fillStyle = flash === 'Jump!' ? '#2f6b2c' : '#6a3d06';
        g.fillText(flash, 6 * SCALE, 14 * SCALE);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    Object.assign(window, { __bshHabit: { left: () => JUMPS - jumps, held: () => 0, scrubAll: () => undefined, addTime: () => undefined, addJumps: (n: number) => { jumps = Math.min(JUMPS - 1, jumps + n); }, jumps: () => jumps } });
  });
}
