import { settings, updateSettings, type Settings } from '../systems/settings';
import { audio } from '../systems/audio';
import { h, Modal } from './dom';

export interface SettingsActions {
  timePaused(): boolean;
  setTimePaused(p: boolean): void;
  saveNow(): void;
  exportSave(): void;
  importSave(text: string): void;
  resetSave(): void;
  changeLook(): void;
  about(): void;
  /** Title-screen use hides the in-game rows. */
  inGame: boolean;
}

function seg<T extends string>(label: string, id: string, options: Array<{ v: T; label: string }>, get: () => T, set: (v: T) => void): HTMLElement {
  const group = h('div', { class: 'seg', role: 'group', 'aria-labelledby': id });
  const render = () =>
    group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === get())));
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
    seg(
      'Touch controls',
      'set-touch',
      [
        { v: 'auto', label: 'Auto' },
        { v: 'on', label: 'Show' },
        { v: 'off', label: 'Hide' },
      ],
      () => settings.touchControls,
      (v) => updateSettings({ touchControls: v }),
    ),
  );

  if (act.inGame) {
    content.append(
      h('h3', { style: 'margin-top:14px', text: 'World' }),
      seg(
        'Day and night',
        'set-time',
        [
          { v: 'flow', label: 'Flowing' },
          { v: 'paused', label: 'Paused' },
        ],
        () => (act.timePaused() ? 'paused' : 'flow'),
        (v) => act.setTimePaused(v === 'paused'),
      ),
      h(
        'div',
        { class: 'setting-row' },
        h('span', { class: 'lbl', text: 'Your look' }),
        h('button', {
          class: 'btn small',
          type: 'button',
          text: 'Change appearance',
          onclick: () => {
            modal.close();
            act.changeLook();
          },
        }),
      ),
      h('h3', { style: 'margin-top:14px', text: 'Saving' }),
      h('p', { style: 'margin:0 0 6px;font-size:var(--text-small)', text: 'The game saves by itself after each important moment. Saves stay in this browser only.' }),
      h(
        'div',
        { class: 'setting-row' },
        h('button', { class: 'btn small', type: 'button', text: 'Save now', onclick: () => act.saveNow() }),
        h('button', { class: 'btn small', type: 'button', text: 'Download a save file', onclick: () => act.exportSave() }),
        h(
          'label',
          { class: 'btn small', style: 'cursor:pointer', tabindex: '0', role: 'button', onkeydown: (e: Event) => {
            const k = (e as KeyboardEvent).key;
            if (k === 'Enter' || k === ' ') {
              e.preventDefault();
              fileInput.click();
            }
          } },
          'Load a save file',
          (() => fileInput)(),
        ),
        h('button', { class: 'btn small danger', type: 'button', text: 'Start over…', onclick: () => act.resetSave() }),
      ),
    );
  }
  content.append(
    h(
      'div',
      { class: 'setting-row' },
      h('span', { class: 'lbl', text: 'Sources, privacy and credits' }),
      h('button', {
        class: 'btn small',
        type: 'button',
        text: 'Open',
        onclick: () => {
          modal.close();
          act.about();
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

const fileInput = (() => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json,text/plain';
  input.hidden = true;
  return input;
})();

/** Wire the hidden file input once; the settings panel's label opens it. */
export function onSaveFileChosen(cb: (text: string) => void): void {
  fileInput.onchange = async () => {
    const f = fileInput.files?.[0];
    fileInput.value = '';
    if (!f || f.size > 1_000_000) return;
    cb(await f.text());
  };
}
