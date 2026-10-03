import { iconImg } from '../../kit/art/icons';
import { PixelBuffer } from '../../kit/art/pixel';
import { paintText, textWidth } from '../../kit/art/pixelFont';
import { h } from '../../kit/ui/dom';
import { fromMinutes, handAngles, say, toMinutes, type Time } from './problems';

/**
 * The clock face used in every activity: painted as pixel art, with a short
 * navy hour hand and a long red minute hand (different lengths AND colors, so
 * they are never confused). An interactive clock lets the player drag either
 * hand; dragging the minute hand moves the hour hand too, just like a real
 * clock, so going past 12 changes the hour. Buttons and arrow keys do the same
 * for anyone who cannot drag.
 */

export const HOUR_COLOR = '#2b3a67';
export const MINUTE_COLOR = '#d2453a';
const FACE = '#fdf6e3';
const RIM = '#c9a227';
const RIM_DARK = '#8a6a12';
const INK = '#3a2a26';
const WEDGE = '#ffe58a';
const GHOST = '#3fae5a';
const MINUTE_LABEL = '#2f6fb0';

const S = 120;
const C = 60;
const R = 44;

export interface ClockHints {
  /** Show 5, 10, 15 ... around the outside (counting minutes by fives). */
  minuteNumbers?: boolean;
  /** Shade the space the hour hand is in, between the hour it passed and the next. */
  hourWedge?: boolean;
  /** Faint green hands showing a time (the answer, at the last hint). */
  ghost?: Time | null;
}

/** Draw a hand: a thick line from the center at `deg` degrees clockwise from 12. */
export function drawHand(b: PixelBuffer, cx: number, cy: number, deg: number, len: number, width: number, color: string, dotted = false): void {
  const a = (deg * Math.PI) / 180;
  const sx = Math.sin(a);
  const sy = -Math.cos(a);
  for (let t = 0; t <= len; t += 0.5) {
    if (dotted && Math.floor(t / 3) % 2 === 1) continue;
    const x = cx + sx * t;
    const y = cy + sy * t;
    const w = t > len - 3 && width > 2 ? width - 1 : width;
    b.rect(Math.round(x - w / 2), Math.round(y - w / 2), w, w, color);
  }
}

export function paintClock(t: Time, hints: ClockHints = {}): PixelBuffer {
  const b = new PixelBuffer(S, S);
  // rim and face
  b.ellipse(C - R - 5, C - R - 5, (R + 5) * 2, (R + 5) * 2, RIM_DARK);
  b.ellipse(C - R - 4, C - R - 4, (R + 4) * 2, (R + 4) * 2, RIM);
  b.ellipse(C - R, C - R, R * 2, R * 2, FACE);
  const ang = handAngles(t);
  // the hour wedge: from the hour that has passed to the next one
  if (hints.hourWedge) {
    const from = (t.h % 12) * 30;
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const dx = x - C + 0.5;
        const dy = y - C + 0.5;
        const d = Math.hypot(dx, dy);
        if (d < 8 || d > R - 1) continue;
        let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
        if (a < 0) a += 360;
        const rel = (a - from + 360) % 360;
        if (rel <= 30) b.set(x, y, WEDGE);
      }
  }
  // minute ticks, longer every five
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180;
    const long = i % 5 === 0;
    for (let rr = long ? R - 6 : R - 3; rr <= R - 1; rr += 0.5) b.set(Math.round(C - 0.5 + Math.sin(a) * rr), Math.round(C - 0.5 - Math.cos(a) * rr), long ? INK : '#9b8c78');
  }
  // the hour numbers
  for (let n = 1; n <= 12; n++) {
    const a = (n * 30 * Math.PI) / 180;
    const label = String(n);
    const x = Math.round(C - 0.5 + Math.sin(a) * (R - 13) - textWidth(label) / 2 + 0.5);
    const y = Math.round(C - 0.5 - Math.cos(a) * (R - 13) - 2);
    const passed = hints.hourWedge && n === (t.h % 12 || 12);
    paintText(b, label, x, y, passed ? HOUR_COLOR : INK);
  }
  // minutes counted by fives, outside the rim
  if (hints.minuteNumbers) {
    for (let n = 0; n < 12; n++) {
      const a = (n * 30 * Math.PI) / 180;
      const label = n === 0 ? '0' : String(n * 5);
      const x = Math.round(C - 0.5 + Math.sin(a) * (R + 10) - textWidth(label) / 2 + 0.5);
      const y = Math.round(C - 0.5 - Math.cos(a) * (R + 10) - 2);
      b.rect(x - 1, y - 1, textWidth(label) + 2, 7, '#ffffff');
      paintText(b, label, x, y, MINUTE_LABEL);
    }
  }
  if (hints.ghost) {
    const g = handAngles(hints.ghost);
    drawHand(b, C - 0.5, C - 0.5, g.minute, R - 6, 2, GHOST, true);
    drawHand(b, C - 0.5, C - 0.5, g.hour, R - 20, 3, GHOST, true);
  }
  drawHand(b, C - 0.5, C - 0.5, ang.hour, R - 20, 4, HOUR_COLOR);
  drawHand(b, C - 0.5, C - 0.5, ang.minute, R - 5, 2, MINUTE_COLOR);
  b.rect(C - 2, C - 2, 4, 4, RIM_DARK);
  b.rect(C - 1, C - 1, 2, 2, RIM);
  return b;
}

export interface ClockOptions {
  time: Time;
  interactive?: boolean;
  /** Minutes per step when dragging or using the buttons. */
  step?: number;
  /** Shown size in CSS pixels. */
  size?: number;
  caption?: string;
  onChange?: (t: Time) => void;
}

export class ClockWidget {
  readonly el: HTMLElement;
  time: Time;
  private readonly cv: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private hints: ClockHints = {};
  private locked = false;
  private dragging: 'hour' | 'minute' | null = null;
  private readonly step: number;

  constructor(private readonly opts: ClockOptions) {
    this.time = { ...opts.time };
    this.step = opts.step ?? 5;
    const size = opts.size ?? 240;
    this.cv = h('canvas', { width: S, height: S, class: 'tac-clock-canvas', style: `width:${size}px;height:${size}px` }) as HTMLCanvasElement;
    this.ctx = this.cv.getContext('2d')!;
    const parts: HTMLElement[] = [this.cv];
    if (opts.caption) parts.unshift(h('span', { class: 'tac-clock-caption', text: opts.caption }));
    if (opts.interactive) {
      this.cv.tabIndex = 0;
      this.cv.setAttribute('role', 'application');
      this.cv.setAttribute('aria-roledescription', 'clock you can set');
      this.cv.classList.add('interactive');
      this.cv.addEventListener('pointerdown', (e) => this.onDown(e));
      this.cv.addEventListener('pointermove', (e) => this.onMove(e));
      this.cv.addEventListener('pointerup', () => this.onUp());
      this.cv.addEventListener('pointercancel', () => this.onUp());
      this.cv.addEventListener('keydown', (e) => this.onKey(e));
      const btn = (label: string, icon: string, fn: () => void, cls: string) =>
        h('button', { class: `btn small tac-hand-btn ${cls}`, type: 'button', 'aria-label': label, onclick: () => !this.locked && fn() }, iconImg(icon, '', 18));
      parts.push(
        h(
          'div',
          { class: 'tac-hand-controls' },
          h('div', { class: 'tac-hand-row minute' }, btn('Move the long minute hand back', 'arrowLeft', () => this.nudge(-this.step), 'minute'), h('span', { text: 'Long hand (minutes)' }), btn('Move the long minute hand forward', 'arrowRight', () => this.nudge(this.step), 'minute')),
          h('div', { class: 'tac-hand-row hour' }, btn('Move the short hour hand back', 'arrowLeft', () => this.nudge(-60), 'hour'), h('span', { text: 'Short hand (hours)' }), btn('Move the short hour hand forward', 'arrowRight', () => this.nudge(60), 'hour')),
        ),
      );
    }
    this.el = h('div', { class: 'tac-clock' }, ...parts);
    this.draw();
  }

  setTime(t: Time): void {
    this.time = { ...t };
    this.draw();
  }

  setHints(hints: ClockHints): void {
    this.hints = { ...this.hints, ...hints };
    this.draw();
  }

  setLocked(v: boolean): void {
    this.locked = v;
    this.el.classList.toggle('locked', v);
    this.el.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = v));
  }

  focus(): void {
    this.cv.focus();
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, S, S);
    this.ctx.drawImage(paintClock(this.time, this.hints).toCanvas(), 0, 0);
    this.cv.setAttribute('aria-label', `${this.opts.interactive ? 'Clock you can set. ' : 'Clock. '}It shows ${say(this.time)}.${this.opts.interactive ? ' Left and right arrows move the long hand, up and down move the short hand.' : ''}`);
  }

  private nudge(minutes: number): void {
    this.setTime(fromMinutes(toMinutes(this.time) + minutes));
    this.opts.onChange?.(this.time);
  }

  private onKey(e: KeyboardEvent): void {
    if (this.locked) return;
    const k = e.key;
    if (k === 'ArrowRight') this.nudge(this.step);
    else if (k === 'ArrowLeft') this.nudge(-this.step);
    else if (k === 'ArrowUp') this.nudge(60);
    else if (k === 'ArrowDown') this.nudge(-60);
    else return;
    e.preventDefault();
    e.stopPropagation();
  }

  /** Pointer position as an angle (degrees clockwise from 12) and distance from the center (0-1 of the face). */
  private polar(e: PointerEvent): { a: number; d: number } {
    const rect = this.cv.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * S - C;
    const y = ((e.clientY - rect.top) / rect.height) * S - C;
    let a = (Math.atan2(x, -y) * 180) / Math.PI;
    if (a < 0) a += 360;
    return { a, d: Math.hypot(x, y) / R };
  }

  private onDown(e: PointerEvent): void {
    if (this.locked) return;
    const { a, d } = this.polar(e);
    if (d > 1.35) return;
    const ang = handAngles(this.time);
    const diff = (x: number) => Math.min(Math.abs(x - a), 360 - Math.abs(x - a));
    // the hour hand is short: grab it when pressing near the middle on its side
    this.dragging = diff(ang.hour) < diff(ang.minute) && (d < 0.7 || diff(ang.hour) < 12) ? 'hour' : 'minute';
    this.cv.setPointerCapture(e.pointerId);
    this.cv.focus();
    this.el.classList.add(`drag-${this.dragging}`);
    this.onMove(e);
    e.preventDefault();
  }

  private onMove(e: PointerEvent): void {
    if (!this.dragging || this.locked) return;
    const { a } = this.polar(e);
    const cur = this.time;
    let next: Time;
    if (this.dragging === 'minute') {
      const m = (Math.round(a / 6 / this.step) * this.step) % 60;
      let d = m - cur.m;
      if (d > 30) d -= 60;
      if (d < -30) d += 60;
      next = fromMinutes(toMinutes(cur) + d);
    } else {
      const idx = Math.round((a - cur.m * 0.5) / 30);
      next = { h: ((((idx - 1) % 12) + 12) % 12) + 1, m: cur.m };
    }
    if (next.h !== cur.h || next.m !== cur.m) {
      this.setTime(next);
      this.opts.onChange?.(next);
    }
  }

  private onUp(): void {
    if (!this.dragging) return;
    this.el.classList.remove(`drag-${this.dragging}`);
    this.dragging = null;
  }
}
