import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { iconImg } from '../../kit/art/icons';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { HABITATS, type Habitat } from '../../kit/worlds/wild-lands/animal-art';
import type { Critter } from '../../kit/worlds/wild-lands/habitats';
import { animal, cap, HABITAT_INFO } from './animals';
import { paintAnimalCard, paintHabitatCard } from './art';
import { pix } from './pix';
import type { Misconception, Tier } from './problems';
import { stepsFor, wrongHomeReason, type RescueStep } from './rescue';

/**
 * The Wildlife Rescue Center: Dr. Amara's animals go home one by one. For
 * each: pick its home on the Wild Lands map (four habitat cards); then, at
 * level 2, what that home gives it; at level 3, which body part helps it
 * there. Wrong answers get a gentle reason and are greyed out; after two
 * misses the right answer is outlined. Nothing is timed.
 */

export interface RescueOptions {
  animals: Critter[];
  tier: Tier;
  seed: number;
  /** Dr. Amara's portrait for the talk line. */
  face: string;
  intro: string;
  /** Every answer (first try or not), for the learner model. */
  onAnswer: (kind: 'home' | RescueStep['kind'], correct: boolean, misconception: Misconception | null) => void;
  /** An animal went home. */
  onHome: (id: Critter) => void;
  onClose: (finished: boolean) => void;
}

export interface RescueHandle {
  modal: Modal;
  /** For the browser test: what is being asked now. */
  state: () => { index: number; who: Critter | null; step: 'home' | RescueStep['kind'] | 'done'; right: number; options: string[] };
  /** Pick option i (as listed in `state().options`). */
  pick: (i: number) => void;
}

export function openRescue(host: HTMLElement, o: RescueOptions): RescueHandle {
  const r = mulberry32(o.seed);
  const touch = isTouchDevice();
  let index = 0;
  let step: 'home' | RescueStep['kind'] | 'done' = 'home';
  let steps: RescueStep[] = [];
  let stepI = 0;
  let misses = 0;
  let firstTry = true;
  let finished = false;
  let options: Array<{ label: string; correct: boolean; why: string; misconception: Misconception | null; btn: HTMLButtonElement }> = [];
  const say = h('p', { class: 'akm-rescue-say' });
  const sayBox = h('div', { class: 'akm-ask' }, h('img', { class: 'akm-host', src: o.face, alt: 'Dr. Amara Osei', width: 64, height: 64 }), say);
  const speakBtn = h('button', { class: 'btn small akm-speak', type: 'button', 'aria-label': 'Read it aloud' }, iconImg('speak', '', 22));
  speakBtn.addEventListener('click', () => speak(say.textContent ?? '', { force: true }));
  sayBox.append(speakBtn);
  const cardEl = h('div', { class: 'akm-rescue-card' });
  const progress = h('span', { class: 'akm-level' });
  const choices = h('div', { class: 'akm-rescue-choices' });
  const feedback = h('div', { class: 'akm-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
  const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: touch ? 'Next' : 'Next (Space)' }) as HTMLButtonElement;
  next.addEventListener('click', () => advance());
  const root = h(
    'div',
    { class: 'panel modal akm-rescue', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rescue-title' },
    h(
      'header',
      {},
      h('h2', { id: 'rescue-title', text: 'Wildlife Rescue Center' }),
      h('div', { class: 'akm-head-right' }, progress, h('button', { class: 'btn small', type: 'button', text: touch ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() })),
    ),
    sayBox,
    h('div', { class: 'akm-rescue-body' }, cardEl, choices),
    feedback,
    h('footer', { class: 'akm-foot' }, h('span', { class: 'small-note', text: 'Animals here are healthy and ready to go home.' }), next),
  );
  const modal = new Modal(host, root, () => {
    stopSpeaking();
    window.removeEventListener('keydown', onKey, true);
    o.onClose(finished);
  });

  const who = () => o.animals[index];
  function talk(text: string): void {
    say.textContent = text;
    speak(text);
  }
  function showFeedback(text: string, kind: 'good' | 'try'): void {
    feedback.hidden = false;
    feedback.className = `akm-feedback ${kind}`;
    feedback.replaceChildren(iconImg(kind === 'good' ? 'star' : 'bulb', '', 22), h('span', { text }));
    speak(text);
  }

  function showAnimal(): void {
    const id = who();
    const a = animal(id);
    progress.textContent = `Animal ${index + 1} of ${o.animals.length}`;
    cardEl.className = 'akm-rescue-card';
    cardEl.replaceChildren(
      pix(`card-${id}`, () => paintAnimalCard(id, 96, 72), 2, a.name),
      h('strong', { text: a.name }),
    );
    steps = stepsFor(id, o.tier, r);
    stepI = 0;
    askHome(index === 0 ? `${o.intro} First, ${a.the}.` : `Next, ${a.the}. Where does it live?`);
  }

  function askHome(text: string): void {
    step = 'home';
    misses = 0;
    firstTry = true;
    feedback.hidden = true;
    next.hidden = true;
    talk(text);
    const id = who();
    options = HABITATS.map((hab: Habitat) => {
      const info = HABITAT_INFO[hab];
      const btn = h(
        'button',
        { class: 'btn akm-home', type: 'button', 'aria-label': `${info.name}: ${info.short}` },
        pix(`hab-${hab}`, () => paintHabitatCard(hab, 96, 56), 1.5),
        h('strong', { text: info.name }),
        h('span', { class: 'small-note', text: info.short }),
      ) as HTMLButtonElement;
      return { label: info.name, correct: animal(id).home === hab, why: wrongHomeReason(id, hab), misconception: 'live-anywhere' as Misconception, btn };
    });
    renderChoices('akm-homes');
  }

  function askStep(): void {
    const s = steps[stepI];
    step = s.kind;
    misses = 0;
    firstTry = true;
    feedback.hidden = true;
    next.hidden = true;
    talk(s.ask);
    options = s.choices.map((c, i) => ({
      label: c.label,
      correct: c.correct,
      why: c.why ?? '',
      misconception: c.misconception ?? null,
      btn: h(
        'button',
        { class: 'btn akm-choice', type: 'button', 'aria-keyshortcuts': String(i + 1) },
        ...(touch ? [] : [h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) })]),
        h('span', { text: c.label }),
      ) as HTMLButtonElement,
    }));
    renderChoices('akm-step-choices');
  }

  function renderChoices(cls: string): void {
    options.forEach((op, i) => op.btn.addEventListener('click', () => pick(i)));
    choices.replaceChildren(h('div', { class: cls }, ...options.map((op) => op.btn)));
    requestAnimationFrame(() => options[0]?.btn.focus());
  }

  function pick(i: number): void {
    const op = options[i];
    if (!op || op.btn.disabled || !next.hidden || step === 'done') return;
    const kind = step;
    if (!op.correct) {
      if (firstTry) o.onAnswer(kind, false, op.misconception);
      firstTry = false;
      misses++;
      audio.retry();
      op.btn.disabled = true;
      op.btn.classList.add('nope');
      showFeedback(`Not quite. ${op.why}`, 'try');
      if (misses >= 2) options.find((x) => x.correct)?.btn.classList.add('worked');
      return;
    }
    if (firstTry) o.onAnswer(kind, true, null);
    audio.correct();
    op.btn.classList.add('right');
    options.forEach((x) => (x.btn.disabled = true));
    const a = animal(who());
    const explain = kind === 'home' ? `Yes! ${cap(a.the)} lives in ${HABITAT_INFO[a.home].the}. ${cap(a.the)} needs ${a.needs}.` : steps[stepI].explain;
    showFeedback(explain, 'good');
    next.hidden = false;
    requestAnimationFrame(() => next.focus());
  }

  function advance(): void {
    if (next.hidden) return;
    if (step === 'home' && steps.length) return askStep();
    if (step !== 'home' && stepI < steps.length - 1) {
      stepI++;
      return askStep();
    }
    // home it goes
    const id = who();
    o.onHome(id);
    audio.itemGet();
    cardEl.classList.add('going-home');
    if (index < o.animals.length - 1) {
      index++;
      window.setTimeout(showAnimal, 450);
      next.hidden = true;
      return;
    }
    finished = true;
    step = 'done';
    next.hidden = true;
    choices.replaceChildren();
    feedback.hidden = true;
    talk('Every animal is home. Thank you, Junior Ranger!');
    const done = h('button', { class: 'btn primary', type: 'button', text: 'Done', onclick: () => modal.close() });
    root.querySelector('.akm-foot')!.append(done);
    requestAnimationFrame(() => done.focus());
  }

  const onKey = (e: KeyboardEvent) => {
    if (modal.closed) return;
    if ((e.key === ' ' || e.key === 'Enter') && !next.hidden && document.activeElement !== next) {
      e.preventDefault();
      e.stopPropagation();
      advance();
    } else if (/^[1-4]$/.test(e.key) && !e.repeat && next.hidden) {
      const op = options[Number(e.key) - 1];
      if (op && !op.btn.disabled) {
        e.preventDefault();
        pick(Number(e.key) - 1);
      }
    }
  };
  window.addEventListener('keydown', onKey, true);
  showAnimal();
  return {
    modal,
    state: () => ({ index, who: step === 'done' ? null : who(), step, right: options.findIndex((x) => x.correct), options: options.map((x) => x.label) }),
    pick: (i: number) => (next.hidden ? pick(i) : advance()),
  };
}
