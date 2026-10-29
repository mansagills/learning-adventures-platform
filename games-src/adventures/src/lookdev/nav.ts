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
  ['body-cast', 'Body: the cast'],
  ['body-skin', 'Body: a scraped knee'],
  ['body-mouth', 'Body: the mouth'],
  ['body-lungs', 'Body: the lungs'],
  ['body-blood', 'Body: a blood vessel'],
  ['body-stomach', 'Body: the stomach'],
  ['body-brain', 'Body: the brain'],
  ['space-cast', 'Space: the cast'],
  ['space-observatory', 'Space: the observatory'],
  ['space-mars', 'Space: Mars'],
  ['space-mercury', 'Space: Mercury'],
  ['space-jupiter', 'Space: Jupiter dive'],
  ['wild-cast', 'Wild Lands: the cast'],
  ['wild-camp', 'Wild Lands: the field camp'],
  ['wild-camp-evening', 'Field camp at dusk'],
  ['wild-reef', 'Wild Lands: the dive'],
  ['wild-reef-sunlight', 'Dive: sunlight zone'],
  ['wild-reef-twilight', 'Dive: twilight zone'],
  ['wild-reef-midnight', 'Dive: midnight zone'],
  ['dig-cast', 'Fossil Dig: the cast and fossils'],
  ['dig-site', 'Fossil Dig: the dig site'],
  ['dig-site-evening', 'Dig site at dusk'],
  ['dig-quarry', 'The Quarry'],
  ['dig-cliff', 'The Cliff Wall'],
  ['dig-trackway', 'The Trackway'],
  ['dig-glow', 'The Glow Room'],
  ['dig-glow-uv', 'Glow Room: ultraviolet lamp on'],
];

const SETTING_IDS = ['station-deck', 'alien-planet', 'river-market', 'roman-forum'];

/** Read the page settings from ?query, or else from a #token. */
export function pageParams(): URLSearchParams {
  if (location.search) return new URLSearchParams(location.search);
  const q = new URLSearchParams();
  const token = location.hash.slice(1);
  if (!token || token === 'sheet') return q;
  // Body System Heroes: #body-cast, or #body-<area> (add -quiet to hide the talk box)
  if (token.startsWith('body-')) {
    const [, area, flag] = token.split('-');
    if (area === 'cast') q.set('view', 'body-cast');
    else {
      q.set('view', 'body');
      q.set('area', area);
      if (flag === 'quiet') q.set('talk', '0');
    }
    return q;
  }
  // Solar System Explorer: #space-cast, #space-jupiter, or #space-<area> (add -quiet to hide the talk box)
  if (token.startsWith('space-')) {
    const [, area, flag] = token.split('-');
    if (area === 'cast') q.set('view', 'space-cast');
    else if (area === 'jupiter') q.set('view', 'space-jupiter');
    else {
      q.set('view', 'space');
      q.set('area', area);
    }
    if (flag === 'quiet') q.set('talk', '0');
    return q;
  }
  // Fossil Dig Adventure: #dig-cast, #dig-site[-evening], #dig-quarry, #dig-cliff, #dig-trackway, #dig-glow[-uv] (add -quiet to hide the talk box)
  if (token.startsWith('dig-')) {
    const [, area, ...rest] = token.split('-');
    q.set('view', area === 'cast' ? 'dig-cast' : area === 'site' ? 'dig-site' : 'dig-view');
    if (area !== 'cast' && area !== 'site') q.set('area', area);
    for (const r of rest) {
      if (r === 'evening') q.set('time', 'evening');
      else if (r === 'quiet') q.set('talk', '0');
      else if (r === 'uv') q.set('uv', '1');
    }
    return q;
  }
  // Wild Lands: #wild-cast, #wild-camp[-evening], #wild-reef[-sunlight|-twilight|-midnight] (add -quiet to hide the talk box)
  if (token.startsWith('wild-')) {
    const [, area, ...rest] = token.split('-');
    q.set('view', area === 'cast' ? 'wild-cast' : area === 'reef' ? 'wild-reef' : 'wild-camp');
    for (const r of rest) {
      if (r === 'evening') q.set('time', 'evening');
      else if (r === 'quiet') q.set('talk', '0');
      else q.set('zone', r);
    }
    return q;
  }
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
