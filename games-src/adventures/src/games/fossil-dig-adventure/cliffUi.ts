import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { paintFossil, type FossilId } from '../../kit/worlds/wild-lands/dig-art';
import { paintLayerSwatch, paintMatch } from './art';
import { CLIFF_TEXT } from './content';
import { layerCards, layerWhy, rightLayer, rightSlot, slotWhy, type LayerCard } from './dig-logic';
import { aFossil, FOSSILS, LAYER_INFO, LAYERS, layerInText, nameInText, type LayerId } from './fossils';
import { pix } from './pix';
import { shuffle, type Misconception, type Tier } from './problems';

/**
 * The Cliff Wall's hands-on puzzles, with Hana: first build the cliff by
 * putting the five layer cards in order from the bottom up (older is
 * lower); then put each fossil into the layer it came from; then, from
 * level 2, find the layer that matches across the canyon (the same fossil
 * means the same layer). Wrong picks explain why, without giving the
 * answer away.
 */

export interface CliffOptions {
  tier: Tier;
  /** The fossils to place (from the cliff's finds). */
  fossils: FossilId[];
  seed: number;
  /** A wrong pick, with the mistake behind it (for the grown-ups page). */
  onSlip: (m: Misconception) => void;
  /** A fossil placed in its layer (it goes into the Fossil Drawer). */
  onPlace: (id: FossilId) => void;
  /** All the puzzles done; `clean` counts the picks right the first time. */
  onDone: (clean: number, total: number) => void;
  onClose: (finished: boolean) => void;
}

export interface CliffHandle {
  modal: Modal;
  /** For the browser test: what is being asked now, and the right answer's button. */
  state: () => { phase: 'order' | 'fossils' | 'match' | 'done'; right: number };
}

const MATCH_FOSSILS: FossilId[] = ['ammonite', 'fern', 'trike-horn', 'mammoth-tusk'];

export function openCliff(host: HTMLElement, o: CliffOptions): CliffHandle {
  const r = mulberry32(o.seed);
  const touch = isTouchDevice();
  let phase: 'order' | 'fossils' | 'match' | 'done' = 'order';
  let clean = 0;
  let total = 0;
  let missed = false;
  // the order puzzle
  const cards = shuffle(r, layerCards(o.tier));
  const placed: LayerId[] = [];
  // the fossil puzzle
  let fIndex = 0;
  // the match puzzle (level 2 and up)
  const matchId = MATCH_FOSSILS[Math.floor(r() * MATCH_FOSSILS.length) % MATCH_FOSSILS.length];
  const withMatch = o.tier >= 2;

  const slots = h('div', { class: 'fda-slots', 'aria-label': 'The cliff, top to bottom' });
  const right = h('div', { class: 'fda-cards' });
  const status = h('p', { class: 'fda-dig-status', role: 'status', 'aria-live': 'polite' });
  const leave = h('button', { class: 'btn small', type: 'button', text: touch ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() });
  const root = h(
    'div',
    { class: 'panel modal fda-cliff', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cliff-title' },
    h('header', {}, h('h2', { id: 'cliff-title', text: 'The Cliff Wall' }), leave),
    h('div', { class: 'content' }, h('div', {}, slots), h('div', {}, right, status)),
  );

  const say = (text: string) => {
    status.textContent = text;
    speak(text);
  };

  /** The cliff so far, top (youngest) to bottom (oldest). */
  function renderSlots(): void {
    const next = placed.length;
    const rows: HTMLElement[] = [h('div', { class: 'fda-slot-end', text: 'Top: youngest' })];
    for (let slot = LAYERS.length - 1; slot >= 0; slot--) {
      const id = placed[slot];
      rows.push(
        h(
          'div',
          { class: `fda-slot${id ? ' filled' : ''}${phase === 'order' && slot === next ? ' cur' : ''}`, 'aria-current': phase === 'order' && slot === next ? 'step' : undefined },
          ...(id
            ? [pix(`sw-${id}`, () => paintLayerSwatch(id), 1.2), h('span', { text: LAYER_INFO[id].name })]
            : [h('span', { text: slot === next && phase === 'order' ? 'Next layer goes here' : '' })]),
        ),
      );
    }
    rows.push(h('div', { class: 'fda-slot-end', text: 'Bottom: oldest' }));
    slots.replaceChildren(...rows);
  }

  function choiceBtn(i: number, label: HTMLElement[], onPick: (b: HTMLButtonElement) => void): HTMLButtonElement {
    const b = h(
      'button',
      { class: 'btn fda-card-btn fda-choice', type: 'button', 'aria-keyshortcuts': String(i + 1) },
      ...(touch ? [] : [h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) })]),
      ...label,
    ) as HTMLButtonElement;
    b.addEventListener('click', () => !b.disabled && onPick(b));
    return b;
  }

  function wrong(b: HTMLButtonElement, why: string, m: Misconception): void {
    missed = true;
    audio.retry();
    o.onSlip(m);
    b.disabled = true;
    b.classList.add('nope');
    say(`Not quite. ${why}`);
    right.querySelector<HTMLButtonElement>('.fda-choice:not([disabled])')?.focus();
  }

  function scored(): void {
    total++;
    if (!missed) clean++;
    missed = false;
  }

  // ---------------------------------------------------------- 1. put the layers in order

  function renderOrder(): void {
    const slot = placed.length;
    const left = cards.filter((c) => !placed.includes(c.id));
    right.replaceChildren(
      h('h3', { text: slot === 0 ? CLIFF_TEXT.orderStart : `Which layer goes next, on top of ${layerInText(placed[slot - 1])}?` }),
      ...left.map((c: LayerCard, i) =>
        choiceBtn(i, [pix(`sw-${c.id}`, () => paintLayerSwatch(c.id), 1.6), h('span', { text: c.clue })], (b) => {
          if (rightSlot(c.id, slot)) {
            audio.correct();
            placed.push(c.id);
            scored();
            if (placed.length === LAYERS.length) {
              audio.itemGet();
              phase = 'fossils';
              say(CLIFF_TEXT.orderDone);
              renderSlots();
              renderFossil();
            } else {
              status.textContent = '';
              renderSlots();
              renderOrder();
            }
          } else wrong(b, slotWhy(c.id, slot), LAYERS.indexOf(c.id) > slot ? 'young-bottom' : 'layers-random');
        }),
      ),
    );
    focusFirst();
  }

  // ---------------------------------------------------------- 2. each fossil into its layer

  function renderFossil(): void {
    const id = o.fossils[fIndex];
    const f = FOSSILS[id];
    right.replaceChildren(
      h('h3', { text: CLIFF_TEXT.fossilAsk(aFossil(id)) }),
      h(
        'div',
        { class: 'fda-cliff-fossil' },
        pix(`fossil-${id}`, () => paintFossil(id, 1.4), 2, f.name),
        h('strong', { text: f.name }),
      ),
      ...[...LAYERS].reverse().map((layer, i) =>
        choiceBtn(i, [pix(`sw-${layer}`, () => paintLayerSwatch(layer), 1.2), h('span', { text: LAYER_INFO[layer].name })], (b) => {
          if (rightLayer(id, layer)) {
            audio.correct();
            scored();
            o.onPlace(id);
            fIndex++;
            if (fIndex < o.fossils.length) {
              say(CLIFF_TEXT.fossilRight(nameInText(id), layerInText(layer)));
              renderFossil();
            } else if (withMatch) {
              phase = 'match';
              say(CLIFF_TEXT.fossilRight(nameInText(id), layerInText(layer)));
              renderMatch();
            } else finish();
          } else wrong(b, layerWhy(id, layer), layer === 'today' ? 'fast-fossil' : 'rock-env');
        }),
      ),
    );
    focusFirst();
  }

  // ---------------------------------------------------------- 3. the same layer across the canyon

  function renderMatch(): void {
    const { buf } = paintMatch(matchId, 140, 72);
    const name = nameInText(matchId);
    const options: LayerId[] = ['ice', 'river', 'swamp', 'sea'];
    right.replaceChildren(
      h('h3', { text: CLIFF_TEXT.matchAsk(name) }),
      pix(`match-${matchId}`, () => buf, 2, `Two cliffs across a valley, with ${name} fossils in the same layer of each`),
      ...options.map((layer, i) =>
        choiceBtn(i, [pix(`sw-${layer}`, () => paintLayerSwatch(layer), 1.2), h('span', { text: LAYER_INFO[layer].name })], (b) => {
          if (FOSSILS[matchId].layer === layer) {
            audio.correct();
            scored();
            finish();
          } else wrong(b, CLIFF_TEXT.matchWhy(name), 'index-mixup');
        }),
      ),
    );
    focusFirst();
  }

  function finish(): void {
    phase = 'done';
    audio.itemGet();
    right.replaceChildren(h('h3', { text: CLIFF_TEXT.allDone }), h('button', { class: 'btn primary', type: 'button', text: 'Back to Hana', onclick: () => modal.close() }));
    say(CLIFF_TEXT.allDone);
    focusFirst();
    o.onDone(clean, total);
  }

  function focusFirst(): void {
    requestAnimationFrame(() => right.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
  }

  const onKey = (e: KeyboardEvent) => {
    if (modal.closed || e.repeat || !/^[1-5]$/.test(e.key)) return;
    const b = right.querySelectorAll<HTMLButtonElement>('.fda-choice')[Number(e.key) - 1];
    if (b && !b.disabled) {
      e.preventDefault();
      b.click();
    }
  };
  window.addEventListener('keydown', onKey);
  const modal = new Modal(
    host,
    root,
    () => {
      window.removeEventListener('keydown', onKey);
      stopSpeaking();
      o.onClose(phase === 'done');
    },
    { closeOnBackdrop: false },
  );
  renderSlots();
  renderOrder();
  say(CLIFF_TEXT.orderStart);

  return {
    modal,
    state: () => {
      if (phase === 'order') {
        const left = cards.filter((c) => !placed.includes(c.id));
        return { phase, right: left.findIndex((c) => rightSlot(c.id, placed.length)) };
      }
      if (phase === 'fossils') return { phase, right: [...LAYERS].reverse().indexOf(FOSSILS[o.fossils[fIndex]].layer) };
      if (phase === 'match') return { phase, right: ['ice', 'river', 'swamp', 'sea'].indexOf(FOSSILS[matchId].layer) };
      return { phase, right: -1 };
    },
  };
}
