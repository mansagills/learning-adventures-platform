import { settings, updateSettings, type Settings } from '../systems/settings';
import { audio } from '../systems/audio';
import { h, Modal } from './dom';

export interface SettingsActions {
  /** Shown only when a game is running (not on the title screen). */
  changeLook?: () => void;
  /** Wipes this game's progress after the game confirms it. */
  resetSave?: () => void;
  grownups?: () => void;
}

function seg<T extends string>(label: string, id: string, options: Array<{ v: T; label: string }>, get: () => T, set: (v: T) => void): HTMLElement {
  const group = h('div', { class: 'seg', role: 'group', 'aria-labelledby': id });
  const render = () => group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === get())));
  options.forEach((o) =>
    group.append(
      h('button', {
        type: 'button',
        'data-v': o.v,
        text: o.label,
        onclick: () => {
          set(o.v);
          audio.click();
          render();
        },
      }),
    ),
  );
  render();
  return h('div', { class: 'setting-row' }, h('span', { class: 'lbl', id, text: label }), group);
}

function slider(label: string, id: string, key: 'musicVolume' | 'sfxVolume'): HTMLElement {
  const out = h('span', { style: 'min-width:3.5em;text-align:right', text: `${Math.round(settings[key] * 100)}%` });
  const input = h('input', {
    type: 'range',
    id,
    min: '0',
    max: '100',
    step: '5',
    value: String(Math.round(settings[key] * 100)),
    oninput: (e: Event) => {
      const v = Number((e.target as HTMLInputElement).value) / 100;
      updateSettings({ [key]: v } as Partial<Settings>);
      out.textContent = `${Math.round(v * 100)}%`;
    },
    onchange: () => audio.click(),
  });
  return h('div', { class: 'setting-row' }, h('label', { for: id, text: label }), h('div', { style: 'display:flex;gap:10px;align-items:center' }, input, out));
}

/**
 * The settings window (from Seeds of Genius). Sound, comfort and reading
 * settings are shared by every Learning Adventures game.
 */
export function openSettings(host: HTMLElement, act: SettingsActions, onClose?: () => void): Modal {
  const onOff = [
    { v: 'on' as const, label: 'On' },
    { v: 'off' as const, label: 'Off' },
  ];
  const content = h(
    'div',
    { class: 'content' },
    h('h3', { text: 'Sound' }),
    seg('Sound', 'set-mute', onOff, () => (settings.muted ? 'off' : 'on'), (v) => updateSettings({ muted: v === 'off' })),
    slider('Music volume', 'set-music', 'musicVolume'),
    slider('Effects volume', 'set-sfx', 'sfxVolume'),
    h('h3', { style: 'margin-top:14px', text: 'Comfort and reading' }),
    seg('Reduce motion', 'set-motion', onOff, () => (settings.reducedMotion ? 'on' : 'off'), (v) => updateSettings({ reducedMotion: v === 'on' })),
    seg(
      'Text speed',
      'set-speed',
      [
        { v: 'slow', label: 'Slow' },
        { v: 'normal', label: 'Normal' },
        { v: 'fast', label: 'Fast' },
        { v: 'instant', label: 'Instant' },
      ],
      () => settings.textSpeed,
      (v) => updateSettings({ textSpeed: v }),
    ),
    seg(
      'Text size',
      'set-size',
      [
        { v: 'normal', label: 'Normal' },
        { v: 'large', label: 'Large' },
      ],
      () => settings.textSize,
      (v) => updateSettings({ textSize: v }),
    ),
    h('p', { class: 'small-note', text: 'Sound, comfort and reading settings apply to every Learning Adventures game in this browser.' }),
  );

  const row = (label: string, btn: HTMLElement) => h('div', { class: 'setting-row' }, h('span', { class: 'lbl', text: label }), btn);
  if (act.changeLook)
    content.append(
      row(
        'Your look',
        h('button', {
          class: 'btn small',
          type: 'button',
          text: 'Change appearance',
          onclick: () => {
            modal.close();
            act.changeLook!();
          },
        }),
      ),
    );
  if (act.grownups)
    content.append(
      row(
        'Parents and teachers',
        h('button', {
          class: 'btn small',
          type: 'button',
          text: 'For grown-ups',
          onclick: () => {
            modal.close();
            act.grownups!();
          },
        }),
      ),
    );
  if (act.resetSave)
    content.append(
      h('h3', { style: 'margin-top:14px', text: 'Saving' }),
      h('p', { class: 'small-note', text: 'The game saves by itself. Saves stay in this browser only: no accounts, no names, nothing sent online.' }),
      row(
        'Progress',
        h('button', {
          class: 'btn small danger',
          type: 'button',
          text: 'Start over…',
          onclick: () => {
            modal.close();
            act.resetSave!();
          },
        }),
      ),
    );

  const root = h(
    'div',
    { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'set-title', style: 'width:min(680px,100%)' },
    h('header', {}, h('h2', { id: 'set-title', text: 'Settings' }), h('button', { class: 'btn small', type: 'button', text: 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
    content,
  );
  const modal = new Modal(host, root, onClose);
  return modal;
}
