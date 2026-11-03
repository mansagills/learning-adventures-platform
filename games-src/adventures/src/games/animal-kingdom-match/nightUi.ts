import { iconImg } from '../../kit/art/icons';
import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { isTouchDevice, settings } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { paintFlashlight } from '../../kit/worlds/wild-lands/animal-art';
import { paintNightAnimal, paintNightForest } from './art';
import { BEAM_R, NIGHT_ANIMALS, NIGHT_H, NIGHT_W, nearestNight, shineHit, whereIs, type NightAnimal, type NightId } from './night';
import { pix } from './pix';
import { shuffle, type Misconception } from './problems';

/**
 * The Night Safari: the dark forest beyond the camp, seen through a
 * flashlight. Move the beam with the mouse, a finger or the arrow keys;
 * two dots of eye shine give each night animal away. Shine the light
 * (Space, the Shine button, or a tap) on the eyes to see the animal, read
 * its fact and answer one question about life at night. Kiki can point to
 * the nearest eyes. Nothing is timed.
 */

export interface NightOptions {
  seed: number;
  onAnswer: (id: NightId, correct: boolean, misconception: Misconception | null) => void;
  /** Every night animal found and its question answered. */
  onAllFound: () => void;
  onClose: (finished: boolean) => void;
}

export interface NightHandle {
  modal: Modal;
  /** For the browser test. */
  state: () => { found: NightId[]; beam: { x: number; y: number }; asking: NightId | null; right: number; answered: boolean };
  aim: (id: NightId) => void;
  move: (x: number, y: number) => void;
  shine: () => boolean;
  answer: (i: number) => void;
}

const SPEED = 5;

export function openNight(host: HTMLElement, o: NightOptions): NightHandle {
  const r = mulberry32(o.seed);
  const touch = isTouchDevice();
  const found: NightId[] = [];
  const beam = { x: NIGHT_W / 2, y: NIGHT_H / 2 };
  let asking: NightAnimal | null = null;
  let options: Array<{ label: string; correct: boolean; why: string; mis: Misconception | null; btn: HTMLButtonElement }> = [];
  let answered = false;
  let firstTry = true;
  let finished = false;
  let hintUntil = 0;
  let hintAt: NightAnimal | null = null;
  let t0 = performance.now();
  const dark = paintNightForest(NIGHT_W, NIGHT_H, false).toCanvas();
  const lit = paintNightForest(NIGHT_W, NIGHT_H, true).toCanvas();
  const pics = new Map(NIGHT_ANIMALS.map((a) => [a.id, paintNightAnimal(a.id, a.size).toCanvas()]));
  const canvas = h('canvas', { class: 'akm-night-canvas', width: NIGHT_W, height: NIGHT_H, role: 'img', 'aria-label': 'The dark forest at night, lit by your flashlight' }) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  const count = h('span', { class: 'akm-level' });
  const status = h('p', { class: 'akm-spot-status', role: 'status', 'aria-live': 'polite' });
  const shineBtn = h(
    'button',
    { class: 'btn primary', type: 'button' },
    pix('flashlight', () => paintFlashlight(2, true), 1),
    h('span', { text: touch ? 'Shine' : 'Shine (Space)' }),
  ) as HTMLButtonElement;
  const kikiBtn = h('button', { class: 'btn', type: 'button' }, iconImg('question', '', 22), h('span', { text: touch ? 'Kiki, help!' : 'Kiki, help! (K)' })) as HTMLButtonElement;
  const askBox = h('div', { class: 'akm-night-ask', hidden: true });
  const controls = h('div', { class: 'akm-night-controls' }, kikiBtn, shineBtn);
  const root = h(
    'div',
    { class: 'panel modal akm-night', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'night-title' },
    h(
      'header',
      {},
      h('h2', { id: 'night-title', text: 'The Night Safari' }),
      h('div', { class: 'akm-head-right' }, count, h('button', { class: 'btn small', type: 'button', text: touch ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() })),
    ),
    h('div', { class: 'content akm-night-body' }, canvas, status, controls, askBox),
  );
  const modal = new Modal(host, root, () => {
    stopSpeaking();
    window.removeEventListener('keydown', onKey, true);
    cancelAnimationFrame(raf);
    o.onClose(finished);
  });

  const say = (text: string) => {
    status.textContent = text;
    speak(text);
  };
  const renderCount = () => (count.textContent = `Found ${found.length} of ${NIGHT_ANIMALS.length}`);

  function move(x: number, y: number): void {
    if (asking) return;
    beam.x = Math.max(0, Math.min(NIGHT_W, x));
    beam.y = Math.max(0, Math.min(NIGHT_H, y));
  }

  function shine(): boolean {
    if (asking || finished) return false;
    const a = shineHit(beam.x, beam.y, found);
    if (!a) {
      audio.retry();
      say('Nothing there. Look for two shining eyes in the dark.');
      return false;
    }
    found.push(a.id);
    renderCount();
    audio.itemGet();
    ask(a);
    return true;
  }

  function ask(a: NightAnimal): void {
    asking = a;
    root.classList.add('asking');
    answered = false;
    firstTry = true;
    status.textContent = '';
    controls.hidden = true;
    options = shuffle(r, [
      { label: a.right, correct: true, why: '', mis: null as Misconception | null },
      ...a.wrong.map(([label, mis, why]) => ({ label, correct: false, why, mis: mis as Misconception | null })),
    ]).map((op, i) => ({
      ...op,
      btn: h(
        'button',
        { class: 'btn akm-choice', type: 'button', onclick: () => answer(i) },
        ...(touch ? [] : [h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) })]),
        h('span', { text: op.label }),
      ) as HTMLButtonElement,
    }));
    const fb = h('div', { class: 'akm-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    askBox.hidden = false;
    askBox.replaceChildren(
      h('h3', { text: a.name }),
      h('p', { text: a.fact }),
      h('p', { class: 'akm-night-q', text: a.ask }),
      h('div', { class: 'akm-step-choices' }, ...options.map((x) => x.btn)),
      fb,
    );
    speak(`${a.name}. ${a.fact} ${a.ask} ${options.map((x, i) => `${i + 1}: ${x.label}.`).join(' ')}`);
    requestAnimationFrame(() => options[0]?.btn.focus());
  }

  function answer(i: number): void {
    const a = asking;
    const op = options[i];
    if (!a || !op || op.btn.disabled || answered) return;
    const fb = askBox.querySelector('.akm-feedback') as HTMLElement;
    fb.hidden = false;
    if (!op.correct) {
      if (firstTry) o.onAnswer(a.id, false, op.mis);
      firstTry = false;
      audio.retry();
      op.btn.disabled = true;
      op.btn.classList.add('nope');
      fb.className = 'akm-feedback try';
      fb.replaceChildren(iconImg('bulb', '', 22), h('span', { text: `Not quite. ${op.why}` }));
      speak(`Not quite. ${op.why}`);
      if (options.filter((x) => x.btn.disabled).length >= 2) options.find((x) => x.correct)?.btn.classList.add('worked');
      return;
    }
    if (firstTry) o.onAnswer(a.id, true, null);
    answered = true;
    audio.correct();
    op.btn.classList.add('right');
    options.forEach((x) => (x.btn.disabled = true));
    fb.className = 'akm-feedback good';
    fb.replaceChildren(iconImg('star', '', 22), h('span', { text: `Yes! ${a.explain}` }));
    speak(`Yes! ${a.explain}`);
    const all = found.length === NIGHT_ANIMALS.length;
    const next = h('button', {
      class: 'btn primary',
      type: 'button',
      text: all ? 'See the whole Wild Lands' : touch ? 'Keep looking' : 'Keep looking (Space)',
      onclick: () => {
        if (all) {
          finished = true;
          o.onAllFound();
          modal.close();
          return;
        }
        asking = null;
        root.classList.remove('asking');
        askBox.hidden = true;
        controls.hidden = false;
        say('Move the light. Look for more shining eyes.');
        shineBtn.focus();
      },
    });
    askBox.append(next);
    requestAnimationFrame(() => next.focus());
  }

  function kikiHelp(): void {
    if (asking) return;
    const a = nearestNight(beam.x, beam.y, found);
    if (!a) return;
    hintAt = a;
    hintUntil = performance.now() + 2600;
    audio.hint();
    say(`Chirp! Kiki points her tail ${whereIs(a)}.`);
  }

  shineBtn.addEventListener('click', () => shine());
  kikiBtn.addEventListener('click', () => kikiHelp());
  const toScene = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * NIGHT_W, y: ((e.clientY - b.top) / b.height) * NIGHT_H };
  };
  canvas.addEventListener('pointermove', (e) => {
    const p = toScene(e);
    move(p.x, p.y);
  });
  canvas.addEventListener('pointerdown', (e) => {
    const p = toScene(e);
    move(p.x, p.y);
    shine();
  });
  const held = new Set<string>();
  const onKey = (e: KeyboardEvent) => {
    if (modal.closed) return;
    if (asking) {
      if (/^[1-3]$/.test(e.key) && !answered) {
        e.preventDefault();
        answer(Number(e.key) - 1);
      } else if ((e.key === ' ' || e.key === 'Enter') && answered && !(document.activeElement instanceof HTMLButtonElement)) {
        e.preventDefault();
        (askBox.querySelector('button.primary') as HTMLButtonElement | null)?.click();
      }
      return;
    }
    const dirs: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1] };
    const d = dirs[e.key];
    if (d) {
      e.preventDefault();
      held.add(e.key);
      move(beam.x + d[0] * SPEED, beam.y + d[1] * SPEED);
    } else if (e.key === ' ' || e.key === 'Enter') {
      // a focused button (Shine, Kiki, Leave) does its own job
      if (document.activeElement instanceof HTMLButtonElement) return;
      e.preventDefault();
      e.stopPropagation();
      shine();
    } else if (e.key.toLowerCase() === 'k') {
      e.preventDefault();
      kikiHelp();
    }
  };
  window.addEventListener('keydown', onKey, true);

  let raf = 0;
  const draw = (now: number) => {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, NIGHT_W, NIGHT_H);
    ctx.drawImage(dark, 0, 0);
    // found animals stay faintly visible
    ctx.globalAlpha = 0.75;
    for (const a of NIGHT_ANIMALS) if (found.includes(a.id)) drawAnimal(a);
    ctx.globalAlpha = 1;
    // fireflies
    if (!settings.reducedMotion)
      for (let i = 0; i < 12; i++) {
        const fx = (i * 53 + Math.sin(t * 0.6 + i) * 18 + NIGHT_W) % NIGHT_W;
        const fy = 40 + ((i * 37) % 110) + Math.cos(t * 0.8 + i * 2) * 8;
        if (Math.sin(t * 2 + i * 3) > -0.2) {
          ctx.fillStyle = '#f6ff8a';
          ctx.fillRect(Math.round(fx), Math.round(fy), 1, 1);
        }
      }
    // the flashlight beam shows the moonlit forest and everything in it
    ctx.save();
    ctx.beginPath();
    ctx.arc(beam.x, beam.y, BEAM_R, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(lit, 0, 0);
    for (const a of NIGHT_ANIMALS) drawAnimal(a);
    ctx.fillStyle = 'rgba(255, 246, 176, 0.12)';
    ctx.fillRect(0, 0, NIGHT_W, NIGHT_H);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255, 246, 176, 0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(beam.x, beam.y, BEAM_R, 0, Math.PI * 2);
    ctx.stroke();
    // eye shine: two bright dots for every animal still to find (they blink now and then)
    for (const a of NIGHT_ANIMALS) {
      if (found.includes(a.id)) continue;
      const blink = !settings.reducedMotion && (t + a.eyes.x * 0.03) % 4.2 > 4.0;
      if (blink) continue;
      ctx.fillStyle = a.eyes.color;
      for (const dx of [-a.eyes.gap / 2, a.eyes.gap / 2]) ctx.fillRect(Math.round(a.eyes.x + dx - 1), Math.round(a.eyes.y - 1), 2, 2);
    }
    // Kiki's hint: a pulsing ring where to look
    if (hintAt && now < hintUntil) {
      const pulse = settings.reducedMotion ? 0 : Math.sin(now / 120) * 2;
      ctx.strokeStyle = '#9affc8';
      ctx.beginPath();
      ctx.arc(hintAt.eyes.x, hintAt.eyes.y, 12 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
    raf = requestAnimationFrame(draw);
  };
  function drawAnimal(a: NightAnimal): void {
    const c = pics.get(a.id)!;
    ctx.drawImage(c, Math.round(a.x - c.width / 2), Math.round(a.y - c.height));
  }
  t0 = performance.now();
  raf = requestAnimationFrame(draw);
  renderCount();
  say('The forest is dark. Move your flashlight and look for shining eyes. Then shine the light on them.');
  requestAnimationFrame(() => shineBtn.focus());
  return {
    modal,
    state: () => ({ found: [...found], beam: { ...beam }, asking: asking?.id ?? null, right: options.findIndex((x) => x.correct), answered }),
    aim: (id: NightId) => {
      const a = NIGHT_ANIMALS.find((x) => x.id === id);
      if (a) move(a.eyes.x, a.eyes.y);
    },
    move,
    shine,
    answer,
  };
}
