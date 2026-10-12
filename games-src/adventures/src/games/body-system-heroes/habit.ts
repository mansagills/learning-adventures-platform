import type { PixelBuffer } from '../../kit/art/pixel';
import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { paintHands, paintKnee, paintScrubber, paintSmile, paintSpeck } from './art';
import type { Mission } from './problems';

/**
 * The healthy-habit mini-games, played in the med bay after a mission's
 * first heal (and again from the body map). Each one scrubs germs off a
 * picture with a soap bubble, a toothbrush or clean water, moved with the
 * mouse, a finger or the arrow keys:
 *   - skin: rinse the scrape clean, then put on a bandage
 *   - mouth: brush every tooth (two minutes, sped up)
 *   - lungs: wash both hands with soap for a real 20 seconds (Happy Birthday twice)
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
};

export interface HabitResult {
  finished: boolean;
}

/** Play a habit mini-game; resolves when it is done or the child leaves. */
export function playHabit(host: HTMLElement, m: Mission, seed: number): Promise<HabitResult> {
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
    const bandage = h('button', { class: 'btn primary', type: 'button', hidden: true, text: 'Put on the bandage' });
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
      pic = paintKnee(true);
      picImg = picCanvas();
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
        if (def.steps[1]) {
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
