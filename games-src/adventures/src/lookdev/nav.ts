import { h } from '../kit/ui/dom';

/**
 * Links between the look development pages. They use a plain #token (for
 * example #star-day or #ancient-evening-talk) as well as the ?query form, so
 * the pages also work where only a #token can be passed, such as a shared page.
 */
export const PAGES: Array<[string, string]> = [
  ['sheet', 'Character test'],
  ['station-deck-day', 'Station deck'],
  ['station-deck-evening-talk', 'Deck at night'],
  ['alien-planet-day', 'Alien planet'],
  ['alien-planet-evening-talk', 'Planet at night'],
  ['river-market-day', 'River market'],
  ['river-market-evening-talk', 'Market at dusk'],
  ['roman-forum-day', 'Roman forum'],
  ['roman-forum-evening-talk', 'Forum at dusk'],
];

const SETTING_IDS = ['station-deck', 'alien-planet', 'river-market', 'roman-forum'];

/** Read the page settings from ?query, or else from a #token. */
export function pageParams(): URLSearchParams {
  if (location.search) return new URLSearchParams(location.search);
  const q = new URLSearchParams();
  const token = location.hash.slice(1);
  if (!token || token === 'sheet') return q;
  const id = SETTING_IDS.find((sid) => token.startsWith(sid)) ?? 'station-deck';
  const [time, ...rest] = token.slice(id.length + 1).split('-');
  q.set('view', 'scene');
  q.set('setting', id);
  q.set('time', time || 'day');
  for (const r of rest) {
    if (r === 'talk') q.set('talk', '1');
    if (r === 'a' || r === 'b' || r === 'c') q.set('level', r);
  }
  return q;
}

/** Links to every page (a row of buttons on the character test; a compact menu on scenes). */
export function pageNav(current: string, compact = false): HTMLElement {
  if (compact) {
    const sel = h('select', { id: 'ld-page', 'aria-label': 'Show another test page' });
    for (const [token, label] of PAGES) sel.append(h('option', { value: token, text: label }));
    sel.value = current;
    sel.addEventListener('change', () => (location.hash = sel.value));
    return h('label', { class: 'ld-pick', for: 'ld-page' }, h('span', { text: 'Show:' }), sel);
  }
  const nav = h('nav', { class: 'ld-nav', 'aria-label': 'Test pages' });
  for (const [token, label] of PAGES) nav.append(h('a', { href: `#${token}`, class: token === current ? 'on' : '', text: label }));
  return nav;
}

export function currentToken(): string {
  return location.search ? '' : location.hash.slice(1) || 'sheet';
}
