import { h } from '../kit/ui/dom';

/**
 * Links between the look development pages. They use a plain #token (for
 * example #star-day or #ancient-evening-talk) as well as the ?query form, so
 * the pages also work where only a #token can be passed, such as a shared page.
 */
export const PAGES: Array<[string, string]> = [
  ['sheet', 'Character test'],
  ['star-day', 'Star Station: day'],
  ['star-evening-talk', 'Star Station: night + talk box'],
  ['ancient-day', 'Ancient Kingdoms: day'],
  ['ancient-evening-talk', 'Ancient Kingdoms: dusk + talk box'],
];

/** Read the page settings from ?query, or else from a #token. */
export function pageParams(): URLSearchParams {
  if (location.search) return new URLSearchParams(location.search);
  const q = new URLSearchParams();
  const token = location.hash.slice(1);
  if (!token || token === 'sheet') return q;
  const [world, time, ...rest] = token.split('-');
  q.set('view', 'scene');
  q.set('world', world);
  q.set('time', time ?? 'day');
  for (const r of rest) {
    if (r === 'talk') q.set('talk', '1');
    if (r === 'a' || r === 'b' || r === 'c') q.set('level', r);
  }
  return q;
}

export function pageNav(current: string): HTMLElement {
  const nav = h('nav', { class: 'ld-nav', 'aria-label': 'Test pages' });
  for (const [token, label] of PAGES) nav.append(h('a', { href: `#${token}`, class: token === current ? 'on' : '', text: label }));
  return nav;
}

export function currentToken(): string {
  return location.search ? '' : location.hash.slice(1) || 'sheet';
}
