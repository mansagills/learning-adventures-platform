import { h } from './dom';

export interface TitleOptions {
  title: string;
  subtitle: string;
  /** One or two short paragraphs about the game. */
  intro: Array<string | Node>;
  hasSave: boolean;
  continueGame(): void;
  newGame(): void;
  settings(): void;
  grownups(): void;
}

/** The title card shown over the game's scene (the Seeds of Genius layout). */
export function showTitle(host: HTMLElement, o: TitleOptions): HTMLElement {
  const screen = h(
    'div',
    { class: 'screen', role: 'main' },
    h(
      'div',
      { class: 'panel title-card' },
      h('h1', { class: 'logo', text: o.title }),
      h('p', { class: 'sub', text: o.subtitle }),
      h('div', { class: 'intro' }, ...o.intro.map((p) => (typeof p === 'string' ? h('p', { text: p }) : p))),
      h(
        'div',
        { class: 'buttons' },
        o.hasSave ? h('button', { class: 'btn primary', type: 'button', text: 'Continue', onclick: () => o.continueGame() }) : null,
        h('button', { class: `btn${o.hasSave ? '' : ' primary'}`, type: 'button', text: o.hasSave ? 'New game' : 'Start a new game', onclick: () => o.newGame() }),
        h(
          'div',
          { class: 'title-row' },
          h('button', { class: 'btn', type: 'button', text: 'Settings', onclick: () => o.settings() }),
          h('button', { class: 'btn', type: 'button', text: 'For grown-ups', onclick: () => o.grownups() }),
        ),
      ),
      h('p', { class: 'small-note', text: 'Saves stay in this browser. No accounts, no names, nothing sent online.' }),
    ),
  );
  host.append(screen);
  requestAnimationFrame(() => (screen.querySelector('.btn') as HTMLElement | null)?.focus());
  return screen;
}
