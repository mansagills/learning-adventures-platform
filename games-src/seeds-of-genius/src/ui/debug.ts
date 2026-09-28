import { CHAPTERS } from '../content/chapters';
import { bus } from '../core/events';
import type { Game } from '../game';
import { h } from './dom';

/**
 * Developer menu: jump around, change time, jump to chapters, reset a test
 * save. Only loaded in `npm run dev`; release builds do not include it.
 */
export function mountDebug(host: HTMLElement, game: Game): void {
  if (host.querySelector('.debug')) return;
  const b = (label: string, fn: () => void) => h('button', { class: 'btn', type: 'button', text: label, onclick: fn });
  const body = h(
    'div',
    { style: 'display:none;flex-direction:column;gap:4px' },
    b('Morning', () => game.setTime(7 * 60)),
    b('Noon', () => game.setTime(12 * 60)),
    b('Evening', () => game.setTime(18.75 * 60)),
    b('Night', () => game.setTime(22 * 60)),
    b('Go: Carver', () => game.teleport(21.5, 9.3)),
    b('Go: Mae', () => game.teleport(32.5, 19.6)),
    b('Go: Cottage', () => game.teleport(5.5, 18.5)),
    b('Go: Room', () => game.teleport(5, 6, 'room')),
    b('Finish practice', () => game.debugComplete()),
    ...CHAPTERS.filter((c) => c.number > 0).map((c) =>
      b(`Chapter ${c.number}`, () => {
        if (c.status === 'playable') {
          game.debugJumpTo(c.number);
          bus.emit('toast', { text: `Chapter ${c.number} is ready: talk to Carver.`, kind: 'info' });
        } else bus.emit('toast', { text: `Chapter ${c.number} is not built yet (Phase ${c.number}).`, kind: 'info' });
      }),
    ),
    b('Reset test save', () => {
      localStorage.removeItem('seedsOfGenius.save');
      localStorage.removeItem('seedsOfGenius.save.backup');
      location.reload();
    }),
  );
  const toggle = h('button', {
    class: 'btn',
    type: 'button',
    text: 'Debug',
    'aria-expanded': 'false',
    onclick: () => {
      const open = body.style.display === 'none';
      body.style.display = open ? 'flex' : 'none';
      toggle.setAttribute('aria-expanded', String(open));
    },
  });
  const panel = h('div', { class: 'panel debug', 'aria-label': 'Debug menu' }, toggle, body);
  host.append(panel);
}
