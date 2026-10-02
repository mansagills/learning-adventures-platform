import type { Expression } from '../art/portraits';
import { audio } from '../systems/audio';
import { charsPerSecond } from '../systems/settings';
import { h } from './dom';

/** A character who can talk in the talk box. */
export interface Speaker {
  name: string;
  role: string;
  /** A data URL for the portrait with this expression. */
  portrait(expression: Expression): string;
  /** Voice pitch in Hz for the typing blips. */
  voice: number;
}

export interface AskOption {
  text: string;
  correct?: boolean;
  /** Said right after this option is picked. */
  feedback: string;
  /** A short id for the mistake behind a wrong option (for the learner model). */
  misconception?: string;
}

export interface Question {
  text: string;
  options: AskOption[];
  /** The hint ladder: a nudge, then a model, then the worked answer. */
  hints: [string, string, string];
}

export interface AskResult {
  tries: number;
  /** Ids of the wrong ideas the player picked, in order. */
  misconceptions: string[];
}

/**
 * The talk box (from Seeds of Genius): a portrait, name and role, text that
 * types itself out (Space, Enter, click or tap shows it all at once), and
 * choices that are real buttons (click, tap, number keys, arrow keys).
 *
 * Questions never fail: a wrong answer gets feedback and the next rung of
 * the hint ladder, that option is greyed out, and at the last rung the right
 * answer is outlined. The box stays open between calls until `end()`.
 */
export class Talk {
  private el: HTMLElement | null = null;
  private portrait!: HTMLImageElement;
  private nameEl!: HTMLElement;
  private roleEl!: HTMLElement;
  private textEl!: HTMLElement;
  private live!: HTMLElement;
  private feedbackEl!: HTMLElement;
  private choicesEl!: HTMLElement;
  private footerHint!: HTMLElement;
  private typing = false;
  private finishTyping: (() => void) | null = null;
  private resolveAdvance: (() => void) | null = null;
  private voice = 220;
  private readonly keyHandler = (e: KeyboardEvent) => this.onKey(e);

  constructor(private readonly host: HTMLElement) {}

  get isOpen(): boolean {
    return !!this.el;
  }

  /** Say one or more lines; each waits for the player to continue. */
  async say(who: Speaker, lines: string | string[], expression: Expression = 'smile'): Promise<void> {
    this.open();
    for (const line of Array.isArray(lines) ? lines : [lines]) {
      this.speaker(who, expression);
      await this.type(line);
      await this.waitAdvance();
    }
  }

  /** Offer choices that are all fine (no right answer). Returns the index. */
  async offer(who: Speaker, text: string, labels: string[], expression: Expression = 'smile'): Promise<number> {
    this.open();
    this.speaker(who, expression);
    await this.type(text);
    const i = await this.choose(labels);
    this.choicesEl.replaceChildren();
    return i;
  }

  /** Ask a check-for-understanding question; there is no failure state. */
  async ask(who: Speaker, q: Question, onHint?: (rung: number) => void): Promise<AskResult> {
    this.open();
    this.speaker(who, 'thinking');
    await this.type(q.text);
    const correctIdx = q.options.findIndex((o) => o.correct);
    const disabled = new Set<number>();
    const misconceptions: string[] = [];
    let highlight: number | undefined;
    let tries = 0;
    for (;;) {
      const pick = await this.choose(
        q.options.map((o) => o.text),
        { disabled, highlight },
      );
      tries++;
      const opt = q.options[pick];
      this.choicesEl.replaceChildren();
      this.feedbackEl.hidden = false;
      if (opt.correct) {
        audio.correct();
        this.speaker(who, 'proud');
        this.feedbackEl.className = 'feedback good';
        this.feedbackEl.textContent = opt.feedback;
        this.live.textContent = opt.feedback;
        await this.waitAdvance();
        this.feedbackEl.hidden = true;
        return { tries, misconceptions };
      }
      audio.retry();
      if (opt.misconception) misconceptions.push(opt.misconception);
      const rung = Math.min(3, tries);
      onHint?.(rung);
      this.feedbackEl.className = 'feedback try';
      this.feedbackEl.textContent = `${opt.feedback} ${q.hints[rung - 1]}`;
      this.live.textContent = this.feedbackEl.textContent;
      disabled.add(pick);
      if (rung >= 3) highlight = correctIdx;
    }
  }

  /** Close the box (safe to call when it is already closed). */
  end(): void {
    if (!this.el) return;
    window.removeEventListener('keydown', this.keyHandler, true);
    this.el.remove();
    this.el = null;
    this.resolveAdvance = null;
    delete document.documentElement.dataset.talking;
    audio.close();
  }

  // ------------------------------------------------------------ layout

  private open(): void {
    if (this.el) return;
    this.portrait = h('img', { class: 'portrait', alt: '' });
    this.nameEl = h('span', { class: 'name' });
    this.roleEl = h('span', { class: 'role' });
    this.textEl = h('div', { class: 'text', 'aria-hidden': 'true' });
    this.live = h('div', { class: 'sr-only', 'aria-live': 'polite' });
    this.feedbackEl = h('div', { class: 'feedback', hidden: true });
    this.choicesEl = h('ul', { class: 'choices' });
    this.footerHint = h('span', { class: 'continue-hint' });
    this.el = h(
      'section',
      { class: 'panel dialogue', role: 'dialog', 'aria-label': 'Conversation' },
      this.portrait,
      h(
        'div',
        { class: 'body' },
        h('div', { class: 'nameplate' }, this.nameEl, this.roleEl),
        this.textEl,
        this.live,
        this.feedbackEl,
        this.choicesEl,
        h('div', { class: 'footer' }, this.footerHint),
      ),
    );
    this.el.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      this.advance();
    });
    window.addEventListener('keydown', this.keyHandler, true);
    this.host.append(this.el);
    // Lets a game hide controls that sit under the talk box.
    document.documentElement.dataset.talking = 'true';
    audio.open();
  }

  private speaker(who: Speaker, expression: Expression): void {
    this.portrait.src = who.portrait(expression);
    this.portrait.alt = `${who.name}, looking ${expression === 'neutral' ? 'friendly' : expression}`;
    this.nameEl.textContent = who.name;
    this.roleEl.textContent = who.role;
    this.voice = who.voice;
  }

  // ------------------------------------------------------------ typing

  private type(text: string): Promise<void> {
    this.choicesEl.replaceChildren();
    this.feedbackEl.hidden = true;
    this.live.textContent = `${this.nameEl.textContent}: ${text}`;
    this.footerHint.textContent = '';
    const cps = charsPerSecond();
    if (cps === 0) {
      this.textEl.textContent = text;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.typing = true;
      let shown = 0;
      let last = performance.now();
      let acc = 0;
      const done = () => {
        this.typing = false;
        this.finishTyping = null;
        this.textEl.textContent = text;
        resolve();
      };
      this.finishTyping = done;
      const tick = (now: number) => {
        if (!this.typing) return;
        acc += ((now - last) / 1000) * cps;
        last = now;
        const n = Math.min(text.length, shown + Math.floor(acc));
        if (n > shown) {
          acc -= n - shown;
          if (Math.floor(n / 3) !== Math.floor(shown / 3) && /\S/.test(text[n - 1] ?? '')) audio.blip(this.voice);
          shown = n;
          this.textEl.textContent = text.slice(0, shown);
        }
        if (shown >= text.length) done();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  private waitAdvance(): Promise<void> {
    this.footerHint.textContent = 'Click, or press Space, to continue';
    return new Promise((r) => (this.resolveAdvance = r));
  }

  private advance(): void {
    if (this.typing && this.finishTyping) {
      this.finishTyping();
      return;
    }
    const r = this.resolveAdvance;
    this.resolveAdvance = null;
    r?.();
  }

  private onKey(e: KeyboardEvent): void {
    if (!this.el) return;
    // A window opened on top (settings, grown-ups) gets the keys instead.
    if (document.querySelector('.modal-back')) return;
    const k = e.key;
    const onButton = (e.target as HTMLElement | null)?.tagName === 'BUTTON';
    if ((k === ' ' || k === 'Enter') && !onButton) {
      e.preventDefault();
      e.stopPropagation();
      this.advance();
      return;
    }
    const btns = Array.from(this.choicesEl.querySelectorAll<HTMLButtonElement>('button'));
    if (/^[1-9]$/.test(k) && btns.length) {
      // Number keys match the numbers printed on the choices.
      const b = btns[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        e.stopPropagation();
        b.click();
      }
      return;
    }
    const enabled = btns.filter((b) => !b.disabled);
    if ((k === 'ArrowDown' || k === 'ArrowUp') && enabled.length) {
      e.preventDefault();
      e.stopPropagation();
      const i = enabled.indexOf(document.activeElement as HTMLButtonElement);
      const next = k === 'ArrowDown' ? (i + 1) % enabled.length : (i - 1 + enabled.length) % enabled.length;
      enabled[next].focus();
      return;
    }
    // Keep game keys (arrows, letters) from acting while someone is talking.
    if (k.startsWith('Arrow') || /^[a-z]$/i.test(k)) e.stopPropagation();
  }

  // ------------------------------------------------------------ choices

  private choose(labels: string[], opts: { disabled?: Set<number>; highlight?: number } = {}): Promise<number> {
    this.footerHint.textContent = 'Choose an answer';
    return new Promise((resolve) => {
      this.choicesEl.replaceChildren();
      labels.forEach((label, i) => {
        const btn = h(
          'button',
          {
            class: `btn${opts.highlight === i ? ' worked' : ''}`,
            type: 'button',
            disabled: opts.disabled?.has(i),
            onclick: () => {
              audio.click();
              resolve(i);
            },
          },
          h('span', { class: 'num', text: `${i + 1}` }),
          h('span', { text: label }),
        );
        this.choicesEl.append(h('li', {}, btn));
      });
      requestAnimationFrame(() => (this.choicesEl.querySelector('button:not([disabled])') as HTMLElement | null)?.focus());
    });
  }
}

/** True while the talk box is waiting (useful for tests and the HUD). */
export function talkOpen(): boolean {
  return !!document.querySelector('.dialogue');
}

