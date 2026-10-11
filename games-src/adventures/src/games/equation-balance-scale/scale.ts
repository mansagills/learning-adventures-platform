import { h } from '../../kit/ui/dom';
import { CRYSTAL, paintBeam, paintCrystal, paintGap, paintLock, paintPan, paintStand, paintWeight } from './art';
import { pix } from './pix';
import type { Pan, Problem } from './problems';

/**
 * The balance scale on the job panel, built from page elements so it can tip
 * smoothly: the stand, a beam that turns about the pivot, and two pans that
 * hang from its ends. Each pan carries its side of the equation: real crystals
 * at level 1 of the Weigh Station, otherwise a crystal weight for each number
 * (with the sign between them), and a dashed gap for the missing number. The
 * side's text is on a plate under the pan.
 *
 * The rig is laid out at 440 x 236 and scaled down to fit a phone.
 */

const RIG_W = 440;
const RIG_H = 236;
const PIVOT = { x: 220, y: 58 };
/** Half the distance between the two hooks at the ends of the beam. */
const ARM = 150;
const BEAM_SCALE = 2.5;
const PAN_SCALE = 2;
const MAX_TILT = 12;

export type Tilt = number;

/** How far the beam tips (degrees; positive = the right pan goes down) for two pan weights. */
export function tiltFor(left: number, right: number): Tilt {
  if (!Number.isFinite(left) || !Number.isFinite(right)) return 0;
  if (left === right) return 0;
  const big = Math.max(left, right, 1);
  const k = Math.min(1, (Math.abs(right - left) / big) * 3);
  return Math.sign(right - left) * (5 + (MAX_TILT - 5) * k);
}

interface PanView {
  el: HTMLElement;
  load: HTMLElement;
  plate: HTMLElement;
  weightTag: HTMLElement;
  gap: HTMLElement | null;
}

export class ScaleView {
  readonly root: HTMLElement;
  private readonly rig: HTMLElement;
  private readonly beam: HTMLElement;
  private readonly lockEl: HTMLElement;
  private readonly left: PanView;
  private readonly right: PanView;
  private tilt = 0;
  private resizeObs: ResizeObserver | null = null;

  constructor(private readonly p: Problem) {
    this.beam = h('div', { class: 'ebs-beam' }, pix('scale-beam', () => paintBeam(), BEAM_SCALE));
    this.lockEl = h('div', { class: 'ebs-lock', title: 'The scale is locked while you think' }, pix('scale-lock', () => paintLock(false), 2));
    this.left = this.panView(p.left, 'left');
    this.right = this.panView(p.right, 'right');
    const stand = h('div', { class: 'ebs-stand' }, pix('scale-stand', () => paintStand(), 2));
    this.rig = h('div', { class: 'ebs-rig', style: `width:${RIG_W}px;height:${RIG_H}px` }, stand, this.left.el, this.right.el, this.beam, this.lockEl);
    this.root = h('div', { class: 'ebs-scale', role: 'img', 'aria-label': this.describe() }, this.rig);
    this.place(0);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObs = new ResizeObserver(() => this.fit());
      this.resizeObs.observe(this.root);
    }
    requestAnimationFrame(() => this.fit());
  }

  /** The gap element (where a dragged crystal is dropped), if this question has one. */
  get gapEl(): HTMLElement | null {
    return this.left.gap ?? this.right.gap;
  }

  /** Scale the rig down to fit the panel's width (never up). */
  fit(): void {
    const w = this.root.clientWidth || RIG_W;
    const k = Math.min(1, w / RIG_W);
    this.rig.style.transform = `scale(${k})`;
    this.root.style.height = `${Math.round(RIG_H * k)}px`;
  }

  /** Locked: the beam is held level (the Weigh Station before an answer, the Rover before a crystal goes in). */
  setLocked(on: boolean): void {
    this.lockEl.replaceChildren(pix(`scale-lock-${on}`, () => paintLock(!on), 2));
    this.lockEl.classList.toggle('open', !on);
    this.root.classList.toggle('locked', on);
    if (on) this.place(0);
  }

  /** Tip the beam to show what the pans weigh (with the chosen number in the gap, for the Rover). */
  showWeights(left: number, right: number): void {
    this.place(tiltFor(left, right));
  }

  /** Put a crystal with this number in the gap (or take it out with null). */
  fillGap(value: number | null): void {
    const gap = this.gapEl;
    if (!gap) return;
    gap.classList.toggle('filled', value !== null);
    gap.replaceChildren(value === null ? pix('scale-gap', () => paintGap(), 1.5) : pix('weight-gold', () => paintWeight(CRYSTAL.gold), 1.5), h('span', { class: 'ebs-num', text: value === null ? '?' : String(value) }));
    this.root.setAttribute('aria-label', this.describe(value));
  }

  /** Hint picture: what each pan weighs, under its plate (only the full pan when there is a gap). */
  revealWeights(): void {
    for (const [view, pan] of [
      [this.left, this.p.left],
      [this.right, this.p.right],
    ] as const) {
      if (pan.gap) continue;
      view.weightTag.textContent = `weighs ${pan.weight(0)}`;
      view.weightTag.hidden = false;
    }
  }

  /** Mark the gap as a drop target while a crystal is dragged over it. */
  setDropHover(on: boolean): void {
    this.gapEl?.classList.toggle('hover', on);
  }

  dispose(): void {
    this.resizeObs?.disconnect();
  }

  // ------------------------------------------------------------ building

  private panView(pan: Pan, side: 'left' | 'right'): PanView {
    let gap: HTMLElement | null = null;
    const load = h('div', { class: 'ebs-load' });
    if (pan.piles) {
      // real crystals, one pile per number
      const color = CRYSTAL[side];
      pan.piles.forEach((n, i) => {
        if (i > 0) load.append(h('span', { class: 'ebs-op', text: '+' }));
        load.append(h('span', { class: 'ebs-pile', 'data-count': String(n) }, ...Array.from({ length: n }, () => pix(`crystal-${side}`, () => paintCrystal(color), 2))));
      });
    } else {
      // a crystal weight for each number, a gap for the missing one, and the signs between
      for (const tok of pan.text.split(' ')) {
        if (tok === '?') {
          gap = h('span', { class: 'ebs-token ebs-gap', 'data-gap': '1' }, pix('scale-gap', () => paintGap(), 1.5), h('span', { class: 'ebs-num', text: '?' }));
          load.append(gap);
        } else if (/^\d+$/.test(tok)) load.append(h('span', { class: 'ebs-token' }, pix(`weight-${side}`, () => paintWeight(CRYSTAL[side]), 1.5), h('span', { class: 'ebs-num', text: tok })));
        else load.append(h('span', { class: 'ebs-op', text: tok }));
      }
    }
    const plate = h('div', { class: `ebs-plate ${side}`, text: pan.text });
    const weightTag = h('div', { class: 'ebs-weighs', hidden: true });
    const el = h('div', { class: `ebs-pan ${side}` }, pix(`scale-pan-${side}`, () => paintPan(side), PAN_SCALE), load, plate, weightTag);
    return { el, load, plate, weightTag, gap };
  }

  /** Turn the beam and hang the pans from its ends. */
  private place(tilt: Tilt): void {
    this.tilt = tilt;
    const a = (tilt * Math.PI) / 180;
    const dx = ARM * Math.cos(a);
    const dy = ARM * Math.sin(a);
    this.beam.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
    this.beam.style.left = `${PIVOT.x}px`;
    this.beam.style.top = `${PIVOT.y}px`;
    const hang = (v: PanView, x: number, y: number) => {
      v.el.style.left = `${x}px`;
      v.el.style.top = `${y}px`;
    };
    hang(this.left, PIVOT.x - dx, PIVOT.y - dy);
    hang(this.right, PIVOT.x + dx, PIVOT.y + dy);
    this.root.dataset.tilt = tilt === 0 ? 'level' : tilt > 0 ? 'right-down' : 'left-down';
  }

  /** What a screen reader hears: both pans, and which way the scale tips. */
  private describe(chosen?: number | null): string {
    const fill = (pan: Pan) => (pan.gap && chosen != null ? pan.text.replace('?', String(chosen)) : pan.text);
    const state = this.tilt === 0 ? 'level' : this.tilt > 0 ? 'tipped down on the right' : 'tipped down on the left';
    return `A balance scale. Left pan: ${fill(this.p.left)}. Right pan: ${fill(this.p.right)}. The scale is ${state}.`;
  }
}
