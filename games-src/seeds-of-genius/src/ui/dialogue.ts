import { paintPortrait } from '../art/portraits';
import { npcById, type NpcDefinition } from '../content/npcs';
import { escalateHint, recordAttempt, type LearnerState } from '../learning/learnerModel';
import { hintProvider } from '../learning/hints';
import type { Conversation, DialogueEffect, DialogueNode, Expression, LineNode, QuestionNode } from '../quests/types';
import { audio } from '../systems/audio';
import { charsPerSecond, settings } from '../systems/settings';
import { h } from './dom';

export interface DialogueHooks {
  apply(effect: DialogueEffect): void;
  learner: LearnerState;
  onLearningChanged(): void;
}

const portraitCache = new Map<string, string>();
function portraitURL(npc: NpcDefinition, expression: Expression): string {
  const key = `${npc.id}:${expression}`;
  let url = portraitCache.get(key);
  if (!url) {
    url = paintPortrait(npc.look, expression, { elder: npc.id === 'carver' || npc.id === 'odell' }).toDataURL(3);
    portraitCache.set(key, url);
  }
  return url;
}

/**
 * Shows a conversation one line at a time with a portrait, name and role.
 * Choices are real buttons (click, tap, arrow keys, number keys). The skip
 * button fast-forwards to the next choice without skipping any effects, so
 * a player can never skip past getting an item.
 */
export class DialogueUI {
  private el: HTMLElement | null = null;
  private live!: HTMLElement;
  private resolveAdvance: (() => void) | null = null;
  private typing = false;
  private finishTyping: (() => void) | null = null;
  private skipping = false;
  private keyHandler = (e: KeyboardEvent) => this.onKey(e);

  constructor(
    private readonly host: HTMLElement,
    private readonly hooks: DialogueHooks,
  ) {}

  get isOpen(): boolean {
    return !!this.el;
  }

  /** Play a conversation. In replay mode nothing changes in the game. */
  async run(conv: Conversation, opts: { replay?: boolean } = {}): Promise<void> {
    if (this.el) return;
    this.skipping = false;
    this.build();
    audio.open();
    window.addEventListener('keydown', this.keyHandler, true);
    let id: string | null = conv.start;
    let retried = false;
    let guard = 0;
    try {
      while (id && guard++ < 200) {
        const node: DialogueNode | undefined = conv.nodes[id];
        if (!node) break;
        if (!opts.replay) (node.effects ?? []).forEach((e) => this.hooks.apply(e));
        if (node.kind === 'question') {
          const tries = await this.ask(node, !!opts.replay);
          if (tries > 1) retried = true;
          id = node.next;
          continue;
        }
        const line = node as LineNode;
        const text = retried && line.textIfRetried ? line.textIfRetried : line.text;
        this.showSpeaker(node);
        await this.type(text);
        const choices = (line.choices ?? []).filter((c) => !c.requiresFlag);
        if (choices.length) {
          this.skipping = false;
          const pick = await this.choose(choices.map((c) => c.text));
          const choice = choices[pick];
          if (!opts.replay) (choice.effects ?? []).forEach((e) => this.hooks.apply(e));
          id = choice.next;
        } else {
          await this.waitAdvance();
          id = line.next ?? null;
        }
      }
    } finally {
      window.removeEventListener('keydown', this.keyHandler, true);
      (this.el as HTMLElement | null)?.remove();
      this.el = null;
      audio.close();
    }
  }

  // ------------------------------------------------------------ layout

  private portrait!: HTMLImageElement;
  private nameEl!: HTMLElement;
  private roleEl!: HTMLElement;
  private badgeEl!: HTMLElement;
  private textEl!: HTMLElement;
  private feedbackEl!: HTMLElement;
  private choicesEl!: HTMLElement;
  private footerHint!: HTMLElement;
  private skipBtn!: HTMLButtonElement;

  private build(): void {
    this.portrait = h('img', { class: 'portrait', alt: '' });
    this.nameEl = h('span', { class: 'name' });
    this.roleEl = h('span', { class: 'role' });
    this.badgeEl = h('span', { class: 'badge', text: 'Real scientist · words written for this story' });
    this.textEl = h('div', { class: 'text', 'aria-hidden': 'true' });
    this.live = h('div', { class: 'sr-only', 'aria-live': 'polite' });
    this.feedbackEl = h('div', { class: 'feedback', hidden: true });
    this.choicesEl = h('ul', { class: 'choices' });
    this.footerHint = h('span', { class: 'continue-hint' });
    this.skipBtn = h('button', {
      class: 'btn small',
      type: 'button',
      text: 'Skip ahead',
      'aria-label': 'Skip ahead to the next choice (items are still given)',
      onclick: (e: Event) => {
        e.stopPropagation();
        this.skipping = true;
        this.advance();
      },
    });
    this.el = h(
      'section',
      { class: 'panel dialogue', role: 'dialog', 'aria-label': 'Conversation' },
      this.portrait,
      h(
        'div',
        { class: 'body' },
        h('div', { class: 'nameplate' }, this.nameEl, this.roleEl, this.badgeEl),
        this.textEl,
        this.live,
        this.feedbackEl,
        this.choicesEl,
        h('div', { class: 'footer' }, this.footerHint, this.skipBtn),
      ),
    );
    this.el.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('button')) return;
      this.advance();
    });
    this.host.append(this.el);
  }

  private showSpeaker(node: DialogueNode): void {
    const npc = npcById(node.speaker);
    if (npc) {
      this.portrait.src = portraitURL(npc, node.expression ?? 'neutral');
      this.portrait.alt = `${npc.name}, looking ${node.expression ?? 'friendly'}`;
      this.portrait.hidden = false;
      this.nameEl.textContent = npc.name;
      this.roleEl.textContent = npc.role;
      this.badgeEl.hidden = npc.id !== 'carver';
      this.voice = npc.voice;
    } else {
      this.portrait.hidden = true;
      this.nameEl.textContent = '';
      this.roleEl.textContent = '';
      this.badgeEl.hidden = true;
    }
  }

  private voice = 220;

  // ------------------------------------------------------------ typing

  private type(text: string): Promise<void> {
    this.choicesEl.replaceChildren();
    this.feedbackEl.hidden = true;
    this.live.textContent = `${this.nameEl.textContent}: ${text}`;
    this.footerHint.textContent = '';
    const cps = charsPerSecond();
    if (cps === 0 || this.skipping) {
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
    if (this.skipping) return Promise.resolve();
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
    const k = e.key;
    const target = e.target as HTMLElement | null;
    const onButton = target?.tagName === 'BUTTON';
    if ((k === ' ' || k === 'Enter' || k.toLowerCase() === 'e') && !onButton) {
      e.preventDefault();
      e.stopPropagation();
      this.advance();
      return;
    }
    const btns = Array.from(this.choicesEl.querySelectorAll<HTMLButtonElement>('button:not([disabled])'));
    if (/^[1-9]$/.test(k) && btns.length) {
      // Number keys match the numbers printed on the choices.
      const b = this.choicesEl.querySelectorAll<HTMLButtonElement>('button')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        e.stopPropagation();
        b.click();
      }
      return;
    }
    if ((k === 'ArrowDown' || k === 'ArrowUp') && btns.length) {
      e.preventDefault();
      e.stopPropagation();
      const i = btns.indexOf(document.activeElement as HTMLButtonElement);
      const next = k === 'ArrowDown' ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length;
      btns[next].focus();
      return;
    }
    // Keep world keys (J, I, M, WASD) from acting while talking.
    if (['j', 'i', 'w', 'a', 's', 'd'].includes(k.toLowerCase()) || k.startsWith('Arrow')) e.stopPropagation();
    if (k === 'Escape') e.stopPropagation();
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

  /**
   * Ask a check-for-understanding question. Returns how many tries it took.
   * Wrong answers get feedback plus the next hint rung, then a retry; there
   * is no failure state.
   */
  private async ask(node: QuestionNode, replay: boolean): Promise<number> {
    this.showSpeaker(node);
    const correctIdx = node.options.findIndex((o) => o.correct);
    if (replay) {
      await this.type(node.text);
      this.feedbackEl.hidden = false;
      this.feedbackEl.className = 'feedback good';
      this.feedbackEl.textContent = `Answer: ${node.options[correctIdx].text}`;
      await this.waitAdvance();
      return 1;
    }
    await this.type(node.text);
    const disabled = new Set<number>();
    let highlight: number | undefined;
    let tries = 0;
    for (;;) {
      this.skipping = false;
      const pick = await this.choose(
        node.options.map((o) => o.text),
        { disabled, highlight },
      );
      tries++;
      const opt = node.options[pick];
      recordAttempt(this.hooks.learner, node.objectiveId, {
        correct: opt.correct,
        misconception: opt.misconception,
        evidence: opt.correct ? `Chose "${opt.text}"` : undefined,
      });
      this.hooks.onLearningChanged();
      this.choicesEl.replaceChildren();
      this.feedbackEl.hidden = false;
      if (opt.correct) {
        audio.correct();
        this.feedbackEl.className = 'feedback good';
        this.feedbackEl.textContent = opt.feedback;
        this.live.textContent = opt.feedback;
        await this.waitAdvance();
        this.feedbackEl.hidden = true;
        return tries;
      }
      audio.retry();
      const rung = escalateHint(this.hooks.learner, node.objectiveId);
      this.hooks.onLearningChanged();
      const hint = await hintProvider.getHint({ objectiveId: node.objectiveId, rung, authoredHint: node.hints[rung - 1] });
      this.feedbackEl.className = 'feedback try';
      this.feedbackEl.textContent = `${opt.feedback} ${hint}`;
      this.live.textContent = this.feedbackEl.textContent;
      // Rung 2 narrows the choices; rung 3 shows a worked example.
      disabled.add(pick);
      if (rung >= 3) highlight = correctIdx;
      this.textEl.textContent = node.text;
      if (settings.textSpeed === 'instant') this.footerHint.textContent = '';
    }
  }
}
