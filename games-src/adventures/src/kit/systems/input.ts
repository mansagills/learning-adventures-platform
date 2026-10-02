/**
 * Keyboard and on-screen controls (from Seeds of Genius), merged into one "intent" the game reads
 * each frame. Movement keys are ignored while the player is typing in a
 * field or a menu has focus, so UI keyboard use never walks the avatar.
 */

export type Action = 'interact' | 'journal' | 'bag' | 'menu' | 'mute' | 'hint' | 'grownups';

export class Input {
  private held = new Set<string>();
  private virtual = { x: 0, y: 0 };
  private actionHandlers = new Set<(a: Action) => void>();
  /** Set by the game when menus/dialogue own the keyboard. */
  worldActive = true;
  run = false;

  constructor() {
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    window.addEventListener('blur', () => this.held.clear());
  }

  onAction(cb: (a: Action) => void): () => void {
    this.actionHandlers.add(cb);
    return () => this.actionHandlers.delete(cb);
  }

  emit(a: Action): void {
    this.actionHandlers.forEach((h) => h(a));
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
    const t = e.target as HTMLElement | null;
    const typing = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (typing) return;
    const k = e.key.toLowerCase();
    const move = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k);
    if (move) {
      if (down && this.worldActive) {
        this.held.add(k);
        e.preventDefault();
      } else this.held.delete(k);
      return;
    }
    if (k === 'shift') this.run = down;
    if (!down || e.repeat) return;
    // Buttons in the page (or dialogue) handle their own Enter/Space.
    const onButton = !!t && (t.tagName === 'BUTTON' || t.getAttribute('role') === 'button' || t.tagName === 'A');
    if ((k === 'e' || ((k === ' ' || k === 'enter') && !onButton)) && this.worldActive) {
      e.preventDefault();
      this.emit('interact');
    } else if (k === 'j') this.emit('journal');
    else if (k === 'i') this.emit('bag');
    else if (k === 'm') this.emit('mute');
    else if (k === 'h') this.emit('hint');
    else if (k === 'g') this.emit('grownups');
    else if (k === 'escape') this.emit('menu');
  }

  setVirtual(x: number, y: number): void {
    this.virtual.x = x;
    this.virtual.y = y;
  }

  clear(): void {
    this.held.clear();
    this.virtual.x = 0;
    this.virtual.y = 0;
  }

  /** Movement direction, normalised (tile units per second is up to the caller). */
  direction(): { x: number; y: number } {
    if (!this.worldActive) return { x: 0, y: 0 };
    let x = this.virtual.x;
    let y = this.virtual.y;
    const h = this.held;
    if (h.has('a') || h.has('arrowleft')) x -= 1;
    if (h.has('d') || h.has('arrowright')) x += 1;
    if (h.has('w') || h.has('arrowup')) y -= 1;
    if (h.has('s') || h.has('arrowdown')) y += 1;
    const len = Math.hypot(x, y);
    return len > 1 ? { x: x / len, y: y / len } : { x, y };
  }
}
