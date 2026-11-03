import { audio } from '../../kit/systems/audio';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak, stopSpeaking } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { paintBinoculars } from '../../kit/worlds/wild-lands/animal-art';
import type { Critter } from '../../kit/worlds/wild-lands/habitats';
import { animal, RAINFOREST_LAYERS } from './animals';
import { paintLensView } from './art';
import { pix } from './pix';

/**
 * The binoculars: the animal is blurry at first. Turn the focus (the slider,
 * the − and + buttons, or the arrow keys) until it is sharp, then snap its
 * photo for the Ranger Journal. The card then shows its name and two facts,
 * read aloud. Nothing is timed.
 */

export interface SpotOptions {
  who: Critter;
  /** Where the focus is sharp (1 to 9; the slider starts at 0). */
  sharpAt: number;
  /** Is it new in the Ranger Journal? */
  isNew: boolean;
  onSnap: () => void;
  onClose: (snapped: boolean) => void;
}

export interface SpotHandle {
  modal: Modal;
  /** For the browser test. */
  setFocus: (v: number) => void;
  snap: () => boolean;
  state: () => { focus: number; sharpAt: number; sharp: boolean; snapped: boolean };
}

const MAX = 10;

export function openSpot(host: HTMLElement, o: SpotOptions): SpotHandle {
  const a = animal(o.who);
  let focus = 0;
  let snapped = false;
  const touch = isTouchDevice();
  const img = pix(`lens-${o.who}`, () => paintLensView(o.who), 3, `A blurry shape through the binoculars`);
  img.classList.add('akm-lens-img');
  const lens = h('div', { class: 'akm-lens' }, img, h('div', { class: 'akm-lens-ring', 'aria-hidden': 'true' }));
  const status = h('p', { class: 'akm-spot-status', role: 'status', 'aria-live': 'polite' });
  const slider = h('input', {
    type: 'range',
    min: '0',
    max: String(MAX),
    step: '1',
    value: '0',
    class: 'akm-focus',
    'aria-label': 'Focus',
    'aria-valuetext': 'Blurry',
  }) as HTMLInputElement;
  const less = h('button', { class: 'btn akm-focus-btn', type: 'button', 'aria-label': 'Turn the focus down', text: '−', onclick: () => setFocus(focus - 1) });
  const more = h('button', { class: 'btn akm-focus-btn', type: 'button', 'aria-label': 'Turn the focus up', text: '+', onclick: () => setFocus(focus + 1) });
  const snapBtn = h('button', { class: 'btn primary akm-snap', type: 'button', disabled: true, text: touch ? 'Snap the photo' : 'Snap the photo (Space)', onclick: () => snap() }) as HTMLButtonElement;
  const controls = h('div', { class: 'akm-focus-row' }, h('span', { class: 'akm-focus-label', text: 'Focus' }), less, slider, more);
  const body = h('div', { class: 'content akm-spot-body' }, lens, status, controls);
  const closeBtn = h('button', { class: 'btn small', type: 'button', text: touch ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() });
  const foot = h('footer', { class: 'akm-foot' }, h('span', { class: 'small-note', text: 'Turn the focus until the picture is sharp.' }), snapBtn);
  const root = h(
    'div',
    { class: 'panel modal akm-spot', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'spot-title' },
    h(
      'header',
      {},
      h(
        'h2',
        { id: 'spot-title' },
        pix('binoculars', () => paintBinoculars(2), 1.5),
        h('span', { text: 'Binoculars' }),
      ),
      closeBtn,
    ),
    body,
    foot,
  );
  const modal = new Modal(host, root, () => {
    stopSpeaking();
    window.removeEventListener('keydown', onKey, true);
    o.onClose(snapped);
  });
  const sharp = () => Math.abs(focus - o.sharpAt) < 1;
  function render(): void {
    const off = Math.abs(focus - o.sharpAt);
    img.style.filter = off < 1 ? 'none' : `blur(${Math.min(9, off * 1.5).toFixed(1)}px)`;
    slider.value = String(focus);
    slider.setAttribute('aria-valuetext', off < 1 ? 'Sharp' : off < 3 ? 'Almost sharp' : 'Blurry');
    snapBtn.disabled = !sharp() || snapped;
    status.textContent = snapped ? '' : off < 1 ? `Sharp! It is ${a.the}. Snap the photo!` : off < 3 ? 'Nearly there...' : 'Still blurry. Turn the focus.';
    if (off < 1) img.alt = `${a.name}, seen through the binoculars`;
  }
  function setFocus(v: number): void {
    if (snapped) return;
    const was = sharp();
    focus = Math.max(0, Math.min(MAX, Math.round(v)));
    render();
    if (!was && sharp()) {
      audio.hint();
      speak(status.textContent ?? '');
    }
  }
  slider.addEventListener('input', () => setFocus(Number(slider.value)));
  function snap(): boolean {
    if (!sharp() || snapped) return false;
    snapped = true;
    audio.itemGet();
    lens.classList.add('flash');
    o.onSnap();
    const layer = a.layer ? ` Layer: ${RAINFOREST_LAYERS[a.layer].name.toLowerCase()}.` : '';
    controls.remove();
    status.remove();
    body.append(
      h(
        'div',
        { class: 'akm-spot-card' },
        h('h3', { text: `${a.name}${o.isNew ? ' (new in your Ranger Journal!)' : ''}` }),
        h('p', { text: a.facts[0] }),
        h('p', { text: a.facts[1] }),
        ...(layer ? [h('p', { class: 'small-note', text: layer.trim() })] : []),
      ),
    );
    foot.replaceChildren(h('span', { class: 'small-note', text: 'Saved in your Ranger Journal.' }), h('button', { class: 'btn primary', type: 'button', text: 'Done', onclick: () => modal.close() }));
    (foot.querySelector('button') as HTMLButtonElement).focus();
    speak(`${a.name}. ${a.facts[0]} ${a.facts[1]}`);
    return true;
  }
  const onKey = (e: KeyboardEvent) => {
    if (modal.closed || snapped) return;
    if ((e.key === ' ' || e.key === 'Enter') && sharp() && document.activeElement !== closeBtn) {
      e.preventDefault();
      e.stopPropagation();
      snap();
    } else if ((e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === '+') && document.activeElement !== slider) {
      e.preventDefault();
      setFocus(focus + 1);
    } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === '-') && document.activeElement !== slider) {
      e.preventDefault();
      setFocus(focus - 1);
    }
  };
  window.addEventListener('keydown', onKey, true);
  render();
  requestAnimationFrame(() => slider.focus());
  speak('Turn the focus until the picture is sharp.');
  return { modal, setFocus, snap, state: () => ({ focus, sharpAt: o.sharpAt, sharp: sharp(), snapped }) };
}
