import type { Input } from '../systems/input';
import { h } from './dom';

/** On-screen movement pad and a big action button for touch screens. */
export class TouchControls {
  readonly pad: HTMLElement;
  readonly act: HTMLButtonElement;
  private held = new Set<string>();

  constructor(host: HTMLElement, private readonly input: Input, onAct: () => void) {
    const dirBtn = (cls: string, label: string, dx: number, dy: number) => {
      const b = h('button', { class: cls, type: 'button', 'aria-label': `Walk ${label}`, text: { up: '▲', down: '▼', left: '◀', right: '▶' }[cls] });
      const on = (e: Event) => {
        e.preventDefault();
        this.held.add(cls);
        this.push(dx, dy, true);
        try {
          b.setPointerCapture((e as PointerEvent).pointerId);
        } catch {
          /* synthetic or already-released pointer */
        }
      };
      const off = (e: Event) => {
        e.preventDefault();
        this.held.delete(cls);
        this.push(dx, dy, false);
      };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointercancel', off);
      b.addEventListener('lostpointercapture', off);
      return b;
    };
    this.pad = h(
      'div',
      { class: 'touch', role: 'group', 'aria-label': 'Movement pad' },
      dirBtn('up', 'up', 0, -1),
      dirBtn('left', 'left', -1, 0),
      dirBtn('right', 'right', 1, 0),
      dirBtn('down', 'down', 0, 1),
    );
    this.act = h('button', { class: 'btn primary touch-act', type: 'button', text: 'Talk', onclick: () => onAct() });
    host.append(this.pad, this.act);
  }

  private vx = 0;
  private vy = 0;
  private push(dx: number, dy: number, down: boolean): void {
    const s = down ? 1 : -1;
    this.vx = Math.max(-1, Math.min(1, this.vx + dx * s));
    this.vy = Math.max(-1, Math.min(1, this.vy + dy * s));
    if (!this.held.size) {
      this.vx = 0;
      this.vy = 0;
    }
    this.input.setVirtual(this.vx, this.vy);
  }

  private shown: boolean | null = null;

  setVisible(v: boolean): void {
    if (v === this.shown) return;
    this.shown = v;
    if (!v) {
      this.held.clear();
      this.input.setVirtual(0, 0);
    }
    this.pad.style.display = v ? '' : 'none';
    this.act.style.display = v ? '' : 'none';
  }

  setActLabel(text: string | null): void {
    this.act.textContent = text ?? 'Act';
    this.act.disabled = !text;
  }
}
