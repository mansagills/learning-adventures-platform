import { iconImg } from '../art/icons';
import { bus } from '../core/events';
import { levelFor } from '../quests/engine';
import { clockLabel } from '../systems/dayNight';
import { settings } from '../systems/settings';
import { h } from './dom';

export interface HudActions {
  journal(): void;
  bag(): void;
  menu(): void;
  toggleMute(): void;
  interact(): void;
}

/**
 * The always-visible layer: the one "Next" objective, level/XP, Seeds,
 * clock, save indicator, the toolbar, the interaction prompt, the arrow that
 * points to an off-screen target, toasts and onboarding tips.
 */
export class Hud {
  readonly root: HTMLElement;
  private objText: HTMLElement;
  private objCard: HTMLButtonElement;
  private levelEl: HTMLElement;
  private xpFill: HTMLElement;
  private xpLabel: HTMLElement;
  private seedsEl: HTMLElement;
  private clockIcon: HTMLImageElement;
  private clockText: HTMLElement;
  private saveInd: HTMLElement;
  private saveText: HTMLElement;
  private muteBtn: HTMLButtonElement;
  private prompt: HTMLButtonElement;
  private promptText: HTMLElement;
  private arrow: HTMLElement;
  private arrowHead: HTMLElement;
  private arrowText: HTMLElement;
  private toasts: HTMLElement;
  private tip: HTMLElement;
  private tipText: HTMLElement;
  readonly vignette: HTMLElement;
  readonly fade: HTMLElement;
  private saveTimer = 0;
  private lastObjective = '';

  constructor(host: HTMLElement, actions: HudActions) {
    this.objText = h('div', { class: 'text' });
    this.objCard = h(
      'button',
      { class: 'panel objective', type: 'button', 'aria-label': 'Next step. Open journal', onclick: () => actions.journal() },
      iconImg('leaf', '', 28),
      h('div', { style: 'text-align:left' }, h('div', { class: 'label', text: 'Next' }), this.objText),
    );
    this.levelEl = h('span', { text: 'Lv 1' });
    this.xpFill = h('div', { style: 'width:0%' });
    this.xpLabel = h('span', { class: 'sr-only' });
    this.seedsEl = h('span', { text: '0' });
    this.clockIcon = iconImg('sun', '', 22);
    this.clockText = h('span', { class: 'clock-text' });
    this.saveText = h('span', { text: 'Saved' });
    this.saveInd = h('div', { class: 'panel stat save-ind', role: 'status', 'aria-live': 'polite' }, iconImg('check', '', 20), this.saveText);
    const stats = h(
      'div',
      { class: 'stats' },
      this.saveInd,
      h('div', { class: 'panel stat', title: 'Level and XP' }, iconImg('star', '', 22), this.levelEl, h('div', { class: 'xpbar', 'aria-hidden': 'true' }, this.xpFill), this.xpLabel),
      h('div', { class: 'panel stat', title: 'Seeds (for decorations)' }, iconImg('seed', '', 22), this.seedsEl, h('span', { class: 'sr-only', text: 'Seeds' })),
      h('div', { class: 'panel stat', title: 'Time of day' }, this.clockIcon, this.clockText),
    );

    this.muteBtn = h('button', { class: 'btn', type: 'button', onclick: () => actions.toggleMute() });
    const tb = (icon: string, label: string, key: string, fn: () => void) =>
      h(
        'button',
        { class: 'btn', type: 'button', onclick: fn, 'aria-label': `${label} (${key})` },
        iconImg(icon, '', 26),
        h('span', { text: label }),
        h('span', { class: 'kbd', text: key, 'aria-hidden': 'true' }),
      );
    const toolbar = h(
      'nav',
      { class: 'toolbar', 'aria-label': 'Game menu' },
      tb('journal', 'Journal', 'J', () => actions.journal()),
      tb('bag', 'Bag', 'I', () => actions.bag()),
      this.muteBtn,
      tb('gear', 'Settings', 'Esc', () => actions.menu()),
    );

    this.promptText = h('span');
    this.prompt = h(
      'button',
      { class: 'panel prompt', type: 'button', hidden: true, onclick: () => actions.interact() },
      h('span', { class: 'kbd', text: 'E', 'aria-hidden': 'true' }),
      this.promptText,
    );
    this.arrowHead = h('div', { class: 'arrow' });
    this.arrowText = h('span');
    this.arrow = h('div', { class: 'panel edge-arrow', hidden: true, 'aria-hidden': 'true' }, this.arrowHead, this.arrowText);
    this.toasts = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    this.tipText = h('span');
    this.tip = h('div', { class: 'panel tip', hidden: true, role: 'note' }, iconImg('talk', '', 26), this.tipText);
    this.vignette = h('div', { class: 'night-vignette' });
    this.fade = h('div', { class: 'fade' });

    this.root = h('div', { class: 'hud' }, this.vignette, this.objCard, stats, toolbar, this.prompt, this.arrow, this.toasts, this.tip);
    host.append(this.root, this.fade);
    this.refreshMute();

    bus.on('save:status', (e) => this.showSave(e.status, e.message));
    bus.on('toast', (e) => this.toast(e.text, e.kind));
    bus.on('settings:changed', () => this.refreshMute());
  }

  setVisible(v: boolean): void {
    this.root.style.display = v ? '' : 'none';
  }

  refreshMute(): void {
    const muted = settings.muted;
    this.muteBtn.replaceChildren(
      iconImg(muted ? 'soundOff' : 'soundOn', '', 26),
      h('span', { text: muted ? 'Sound off' : 'Sound on' }),
      h('span', { class: 'kbd', text: 'M', 'aria-hidden': 'true' }),
    );
    this.muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    this.muteBtn.setAttribute('aria-label', `Mute sound (M). Sound is ${muted ? 'off' : 'on'}`);
  }

  setObjective(text: string): void {
    if (text === this.lastObjective) return;
    const first = this.lastObjective === '';
    this.lastObjective = text;
    this.objText.textContent = text;
    this.objCard.setAttribute('aria-label', `Next: ${text}. Open journal`);
    if (!first) {
      this.objCard.classList.remove('pulse');
      void this.objCard.offsetWidth;
      this.objCard.classList.add('pulse');
    }
  }

  setStats(xp: number, seeds: number): void {
    const l = levelFor(xp);
    this.levelEl.textContent = `Lv ${l.level}`;
    this.xpFill.style.width = `${(l.into / l.needed) * 100}%`;
    this.xpLabel.textContent = `${l.into} of ${l.needed} XP to the next level`;
    this.seedsEl.textContent = String(seeds);
  }

  setClock(minutes: number, night: number, paused: boolean): void {
    const icon = night > 0.6 ? 'moon' : night > 0.05 ? 'sunset' : 'sun';
    if (this.clockIcon.dataset.icon !== icon) {
      const img = iconImg(icon, '', 22);
      this.clockIcon.src = img.src;
      this.clockIcon.dataset.icon = icon;
    }
    this.clockText.textContent = clockLabel(minutes) + (paused ? ' (paused)' : '');
    this.vignette.style.opacity = String(night * 0.9);
  }

  showSave(status: 'saving' | 'saved' | 'error' | 'recovered', message?: string): void {
    this.saveText.textContent =
      message ?? { saving: 'Saving…', saved: 'Saved', error: 'Could not save', recovered: 'Save restored' }[status];
    this.saveInd.classList.add('show');
    window.clearTimeout(this.saveTimer);
    if (status !== 'error') this.saveTimer = window.setTimeout(() => this.saveInd.classList.remove('show'), 1800);
  }

  setPrompt(text: string | null, x = 0, y = 0): void {
    if (!text) {
      this.prompt.hidden = true;
      return;
    }
    this.prompt.hidden = false;
    this.promptText.textContent = text;
    this.prompt.setAttribute('aria-label', `${text} (E)`);
    const w = this.root.clientWidth;
    this.prompt.style.left = `${Math.min(w - 90, Math.max(90, x))}px`;
    this.prompt.style.top = `${Math.max(56, y)}px`;
  }

  /** Point at an off-screen target from the screen edge. */
  setArrow(label: string | null, fromX = 0, fromY = 0, toX = 0, toY = 0): void {
    if (!label) {
      this.arrow.hidden = true;
      return;
    }
    const w = this.root.clientWidth;
    const hgt = this.root.clientHeight;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const margin = 70;
    const tx = dx === 0 ? Infinity : ((dx > 0 ? w - margin : margin) - fromX) / dx;
    const ty = dy === 0 ? Infinity : ((dy > 0 ? hgt - 110 : 90) - fromY) / dy;
    const t = Math.min(tx, ty);
    const x = fromX + dx * t;
    const y = fromY + dy * t;
    this.arrow.hidden = false;
    this.arrow.style.left = `${x}px`;
    this.arrow.style.top = `${y}px`;
    this.arrowHead.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    this.arrowText.textContent = label;
  }

  toast(text: string, kind: 'item' | 'info' | 'reward' | 'hint' = 'info'): void {
    const icon = kind === 'item' ? 'bag' : kind === 'reward' ? 'star' : kind === 'hint' ? 'leaf' : 'talk';
    const t = h('div', { class: `panel toast ${kind}` }, iconImg(icon, '', 24), h('span', { text }));
    this.toasts.append(t);
    while (this.toasts.children.length > 3) this.toasts.firstElementChild?.remove();
    window.setTimeout(() => t.remove(), 4200);
  }

  showTip(text: string | null): void {
    this.tip.hidden = !text;
    if (text) this.tipText.textContent = text;
  }
}
