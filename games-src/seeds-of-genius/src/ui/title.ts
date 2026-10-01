import { h } from './dom';

export interface TitleActions {
  hasSave: boolean;
  continueGame(): void;
  newGame(): void;
  settings(): void;
}

export function showTitle(host: HTMLElement, act: TitleActions): HTMLElement {
  const screen = h(
    'div',
    { class: 'screen', role: 'main' },
    h(
      'div',
      { class: 'panel title-card' },
      h('h1', { class: 'logo', text: 'Seeds of Genius' }),
      h('p', { class: 'sub', text: 'George Washington Carver and the Power of Science' }),
      h(
        'p',
        { class: 'intro' },
        'Move into the little town of Sweetgum Hollow and meet George Washington Carver, a real scientist who appears here as your storybook guide. ',
        'Help him with quests, talk to your neighbors, and learn to think like a scientist. ',
        h('strong', { text: 'His lines are written for this game, and the townspeople are made up.' }),
      ),
      h(
        'div',
        { class: 'buttons' },
        act.hasSave ? h('button', { class: 'btn primary', type: 'button', text: 'Continue', 'data-autofocus': true, onclick: () => act.continueGame() }) : null,
        h('button', { class: `btn${act.hasSave ? '' : ' primary'}`, type: 'button', text: act.hasSave ? 'New game' : 'Start a new game', onclick: () => act.newGame() }),
        h('button', { class: 'btn', type: 'button', text: 'Settings', onclick: () => act.settings() }),
      ),
      h(
        'p',
        { style: 'margin:14px 0 0;font-size:var(--text-small);color:var(--ink-soft)' },
        'Saves stay in this browser. No accounts, no names, nothing sent online.',
      ),
    ),
  );
  host.append(screen);
  requestAnimationFrame(() => (screen.querySelector('.btn') as HTMLElement | null)?.focus());
  return screen;
}
