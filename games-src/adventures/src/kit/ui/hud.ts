import { bus } from '../core/events';
import { iconImg } from '../art/icons';
import { h } from './dom';

/**
 * Shared HUD pieces: toasts (short messages that fade away) and the toolbar
 * of big labelled buttons in the bottom-right corner, each with its key.
 */

export function mountToasts(host: HTMLElement): HTMLElement {
  const box = h('div', { class: 'toasts', 'aria-live': 'polite' });
  host.append(box);
  bus.on('toast', ({ text, kind }) => {
    // the same message twice in a row: keep the one showing instead of stacking copies
    if ([...box.children].some((c) => c.textContent === text)) return;
    const t = h('div', { class: `panel toast ${kind ?? 'info'}` });
    if (kind === 'reward') t.append(iconImg('star', '', 22));
    if (kind === 'hint') t.append(iconImg('bulb', '', 22));
    t.append(h('span', { text }));
    box.append(t);
    while (box.children.length > 3) box.firstElementChild?.remove();
    window.setTimeout(() => t.remove(), 3200);
  });
  return box;
}

export function toast(text: string, kind?: 'info' | 'reward' | 'hint'): void {
  bus.emit('toast', { text, kind });
}

export interface ToolButton {
  id: string;
  label: string;
  icon: string;
  /** The key that does the same thing (shown on the button). */
  key?: string;
  onClick(): void;
}

export class Toolbar {
  readonly el: HTMLElement;
  private readonly buttons = new Map<string, HTMLButtonElement>();

  constructor(host: HTMLElement, items: ToolButton[]) {
    this.el = h('nav', { class: 'toolbar', 'aria-label': 'Game menu' });
    items.forEach((it) => {
      const b = h(
        'button',
        { class: 'btn', type: 'button', 'data-tool': it.id, 'aria-label': it.key ? `${it.label} (${it.key})` : it.label, onclick: () => it.onClick() },
        iconImg(it.icon, '', 24),
        h('span', { text: it.label }),
        it.key ? h('span', { class: 'kbd', 'aria-hidden': 'true', text: it.key }) : null,
      );
      this.buttons.set(it.id, b);
      this.el.append(b);
    });
    host.append(this.el);
  }

  setIcon(id: string, icon: string, label?: string): void {
    const b = this.buttons.get(id);
    if (!b) return;
    b.querySelector('img')?.replaceWith(iconImg(icon, '', 24));
    if (label) {
      const span = b.querySelector('span:not(.kbd)');
      if (span) span.textContent = label;
    }
  }

  button(id: string): HTMLButtonElement | undefined {
    return this.buttons.get(id);
  }
}
