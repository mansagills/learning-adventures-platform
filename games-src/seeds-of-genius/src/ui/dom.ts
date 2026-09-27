/** Small DOM helpers so the UI code stays readable. */

type Attrs = Record<string, string | number | boolean | EventListener | undefined>;
type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (k === 'class') el.className = String(v);
    else if (k === 'text') el.textContent = String(v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * A modal layer that keeps keyboard focus inside itself, closes on Escape,
 * and hands focus back to where it came from.
 */
export class Modal {
  readonly back: HTMLDivElement;
  private readonly returnFocus: Element | null;
  private readonly onKey: (e: KeyboardEvent) => void;
  closed = false;

  constructor(
    host: HTMLElement,
    readonly root: HTMLElement,
    private readonly onClose?: () => void,
    opts: { closeOnBackdrop?: boolean; escapeCloses?: boolean } = {},
  ) {
    this.returnFocus = document.activeElement;
    this.back = h('div', { class: 'modal-back' });
    this.back.append(root);
    if (opts.closeOnBackdrop !== false)
      this.back.addEventListener('pointerdown', (e) => {
        if (e.target === this.back) this.close();
      });
    this.onKey = (e) => {
      if (e.key === 'Escape' && opts.escapeCloses !== false) {
        e.stopPropagation();
        e.preventDefault();
        this.close();
      } else if (e.key === 'Tab') this.trap(e);
    };
    this.back.addEventListener('keydown', this.onKey);
    host.append(this.back);
    requestAnimationFrame(() => {
      const first = (root.querySelector('[data-autofocus]') as HTMLElement | null) ?? (root.querySelector(FOCUSABLE) as HTMLElement | null);
      first?.focus();
    });
  }

  private trap(e: KeyboardEvent): void {
    const items = Array.from(this.root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.back.remove();
    if (this.returnFocus instanceof HTMLElement && document.contains(this.returnFocus)) this.returnFocus.focus();
    this.onClose?.();
  }
}

/** A simple choice dialog (used for rest times, confirmations). */
export function choose<T extends string>(
  host: HTMLElement,
  title: string,
  text: string,
  options: Array<{ id: T; label: string; kind?: 'primary' | 'danger' }>,
): Promise<T | null> {
  return new Promise((resolve) => {
    let picked: T | null = null;
    const titleId = `dlg-${Math.random().toString(36).slice(2)}`;
    const body = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, style: 'width:min(480px,100%)' },
      h('header', {}, h('h2', { id: titleId, text: title })),
      h('div', { class: 'content' }, h('p', { style: 'margin:0 0 14px;line-height:1.45', text })),
    );
    const row = h('div', { style: 'display:flex;flex-direction:column;gap:10px;padding:0 16px 16px' });
    options.forEach((o, i) =>
      row.append(
        h('button', {
          class: `btn ${o.kind ?? ''}`,
          text: o.label,
          'data-autofocus': i === 0 ? true : undefined,
          onclick: () => {
            picked = o.id;
            modal.close();
          },
        }),
      ),
    );
    body.append(row);
    const modal = new Modal(host, body, () => resolve(picked));
  });
}
