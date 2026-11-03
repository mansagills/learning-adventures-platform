import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { HABITATS } from '../../kit/worlds/wild-lands/animal-art';
import type { Critter } from '../../kit/worlds/wild-lands/habitats';
import { animal, HABITAT_INFO } from './animals';
import { paintAnimalCard, paintHabitatCard } from './art';
import { SPEED_SECONDS } from './night';
import { pix } from './pix';
import { shuffle } from './problems';
import { wrongHomeReason } from './rescue';

/**
 * Speed Match, the optional replay for children who loved racing the clock
 * in the old game: 60 seconds to send as many animals home as possible
 * (four habitat buttons, keys 1 to 4). A wrong home costs nothing but time:
 * it is greyed out with the reason, and the animal waits. Opens only after
 * the whole game is finished; the trips themselves are never timed.
 */

export interface SpeedOptions {
  animals: Critter[];
  seed: number;
  best: number;
  onDone: (score: number) => void;
  onClose: () => void;
}

export interface SpeedHandle {
  modal: Modal;
  /** For the browser test. */
  state: () => { who: Critter | null; right: number; score: number; left: number; over: boolean };
  pick: (i: number) => void;
  /** End the round now (as if the clock ran out). */
  finish: () => void;
}

export function openSpeed(host: HTMLElement, o: SpeedOptions): SpeedHandle {
  const r = mulberry32(o.seed);
  const touch = isTouchDevice();
  let deck = shuffle(r, o.animals);
  let who: Critter | null = null;
  let score = 0;
  let over = false;
  let started = false;
  let left = SPEED_SECONDS;
  let timer = 0;
  const clock = h('span', { class: 'akm-speed-clock', role: 'timer', 'aria-live': 'off' });
  const scoreEl = h('span', { class: 'akm-level' });
  const card = h('div', { class: 'akm-rescue-card' });
  const homes = h('div', { class: 'akm-homes' });
  const fb = h('div', { class: 'akm-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
  const startBtn = h('button', { class: 'btn primary', type: 'button', text: 'Start the clock', onclick: () => start() }) as HTMLButtonElement;
  const body = h('div', { class: 'akm-rescue-body' }, card, homes);
  const root = h(
    'div',
    { class: 'panel modal akm-rescue akm-speed', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'speed-title' },
    h(
      'header',
      {},
      h('h2', { id: 'speed-title', text: 'Speed Match' }),
      h('div', { class: 'akm-head-right' }, scoreEl, clock, h('button', { class: 'btn small', type: 'button', text: touch ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() })),
    ),
    h('p', { class: 'akm-speed-intro', text: `Send as many animals home as you can in ${SPEED_SECONDS} seconds. Best so far: ${o.best}.` }),
    body,
    fb,
    h('footer', { class: 'akm-foot' }, h('span', { class: 'small-note', text: 'Just for fun. A wrong home costs only a little time.' }), startBtn),
  );
  const modal = new Modal(host, root, () => {
    window.clearInterval(timer);
    stopSpeaking();
    window.removeEventListener('keydown', onKey, true);
    o.onClose();
  });
  const buttons = HABITATS.map((hab, i) => {
    const info = HABITAT_INFO[hab];
    const b = h(
      'button',
      { class: 'btn akm-home', type: 'button', disabled: true, 'aria-label': `${i + 1}: ${info.name}`, onclick: () => pick(i) },
      pix(`hab-${hab}`, () => paintHabitatCard(hab, 96, 56), 1.2),
      h('strong', { text: `${touch ? '' : `${i + 1}. `}${info.name}` }),
    ) as HTMLButtonElement;
    homes.append(b);
    return b;
  });
  const renderTop = () => {
    clock.textContent = `${left} s`;
    scoreEl.textContent = `Home: ${score}`;
  };

  function next(): void {
    if (!deck.length) deck = shuffle(r, o.animals);
    who = deck.pop()!;
    const a = animal(who);
    card.replaceChildren(
      pix(`card-${who}`, () => paintAnimalCard(who!, 96, 72), 2, a.name),
      h('strong', { text: a.name }),
    );
    buttons.forEach((b) => {
      b.disabled = false;
      b.classList.remove('nope', 'right');
    });
  }

  function start(): void {
    if (started) return;
    started = true;
    startBtn.remove();
    audio.levelUp();
    next();
    buttons[0].focus();
    timer = window.setInterval(() => {
      left--;
      renderTop();
      if (left <= 0) finish();
    }, 1000);
  }

  function pick(i: number): void {
    if (!started || over || !who || buttons[i].disabled) return;
    const hab = HABITATS[i];
    if (animal(who).home !== hab) {
      audio.retry();
      buttons[i].disabled = true;
      buttons[i].classList.add('nope');
      fb.hidden = false;
      fb.className = 'akm-feedback try';
      fb.textContent = wrongHomeReason(who, hab);
      return;
    }
    audio.correct();
    score++;
    fb.hidden = true;
    renderTop();
    next();
  }

  function finish(): void {
    if (over) return;
    over = true;
    window.clearInterval(timer);
    buttons.forEach((b) => (b.disabled = true));
    who = null;
    const best = score > o.best;
    audio.itemGet();
    o.onDone(score);
    const text = `Time! You sent ${score} ${score === 1 ? 'animal' : 'animals'} home.${best ? ' A new best!' : ''}`;
    body.replaceChildren(h('p', { class: 'akm-speed-result', text }));
    fb.hidden = true;
    const done = h('button', { class: 'btn primary', type: 'button', text: 'Done', onclick: () => modal.close() });
    root.querySelector('.akm-foot')!.append(done);
    done.focus();
    speak(text);
  }

  const onKey = (e: KeyboardEvent) => {
    if (modal.closed) return;
    if (/^[1-4]$/.test(e.key) && started && !over) {
      e.preventDefault();
      pick(Number(e.key) - 1);
    }
  };
  window.addEventListener('keydown', onKey, true);
  renderTop();
  speak(`Speed Match. Send as many animals home as you can in ${SPEED_SECONDS} seconds.`);
  requestAnimationFrame(() => startBtn.focus());
  return {
    modal,
    state: () => ({ who, right: who ? HABITATS.indexOf(animal(who).home) : -1, score, left, over }),
    pick: (i: number) => (started ? pick(i) : start()),
    finish,
  };
}
