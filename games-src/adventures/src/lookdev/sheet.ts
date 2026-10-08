import type { PixelBuffer } from '../kit/art/pixel';
import { h } from '../kit/ui/dom';

type Kid = Node | string;
const H = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, kids: Kid[] = []) => h(tag, attrs, ...kids);
import { MOODS, VERSIONS, newPortrait, todayPortrait, type Version } from './characters';
import type { Dir16 } from './hero';
import { SLICE_WORLDS, paintSlice } from './slices';
import { currentToken, pageNav } from './nav';

/** Zoom that brings every version to the same 144 px height for comparing detail. */
const SAME_HEIGHT: Record<Version['id'], number> = { today: 6, a: 6, b: 4, c: 3 };
/** Screen pixels per art pixel in a game on a 1280x720 laptop (see the scene renderer). */
export const IN_GAME: Record<Version['id'], number> = { today: 3, a: 3, b: 2, c: 2 };

function cv(b: PixelBuffer, scale: number, cls = ''): HTMLCanvasElement {
  const c = b.toCanvas(scale);
  c.className = `px ${cls}`;
  return c;
}

export function showSheet(host: HTMLElement, q: URLSearchParams): void {
  document.body.classList.add('lookdev');
  const only = q.get('part');
  const page = H('main', { class: 'sheet' });
  if (!only) page.append(H('h1', {}, ['Game worlds: look development']), pageNav(currentToken()));
  host.appendChild(page);
  const dirs: Dir16[] = ['down', 'right', 'up', 'left'];

  if (!only || only === 'compare') {
    const sec = H('section', { class: 'block', id: 'compare' }, [H('h2', {}, ['1. The same child at each level (zoomed to the same height)'])]);
    const row = H('div', { class: 'versions' });
    VERSIONS.forEach((v) => {
      const sprites = H('div', { class: 'sprites' });
      dirs.forEach((d) => sprites.appendChild(cv(v.sprite(d, 0, false), SAME_HEIGHT[v.id])));
      row.appendChild(H('figure', { class: `card v-${v.id}` }, [sprites, H('figcaption', {}, [H('strong', {}, [v.label]), H('span', {}, [v.note])])]));
    });
    sec.appendChild(row);
    page.appendChild(sec);
  }

  if (!only || only === 'walk') {
    const sec = H('section', { class: 'block', id: 'walk' }, [H('h2', {}, ['2. Walking and blinking (every frame)'])]);
    VERSIONS.forEach((v) => {
      const frames = H('div', { class: 'sprites' });
      const walkDirs: Dir16[] = ['down', 'right'];
      walkDirs.forEach((d) => {
        const n = v.id === 'today' || v.id === 'a' ? 3 : 4;
        for (let w = 0; w < n; w++) frames.appendChild(cv(v.sprite(d, v.id === 'today' || v.id === 'a' ? [0, 1, 2][w] : w, false), SAME_HEIGHT[v.id] - (v.id === 'c' ? 1 : 2)));
      });
      if (v.id === 'b' || v.id === 'c') frames.appendChild(cv(v.sprite('down', 0, true), SAME_HEIGHT[v.id] - (v.id === 'c' ? 1 : 2), 'blink'));
      sec.appendChild(H('div', { class: 'walkrow' }, [H('div', { class: 'tag' }, [v.label]), frames]));
    });
    page.appendChild(sec);
  }

  if (!only || only === 'portraits') {
    const sec = H('section', { class: 'block', id: 'portraits' }, [H('h2', {}, ['3. Talk-box portraits'])]);
    const row = H('div', { class: 'portraits' });
    row.appendChild(H('figure', { class: 'card' }, [cv(todayPortrait(), 3, 'pframe'), H('figcaption', {}, [H('strong', {}, ['Today: 48 x 48']), H('span', {}, ['One expression shown'])])]));
    MOODS.forEach((m) => row.appendChild(H('figure', { class: 'card' }, [cv(newPortrait(m), 2, 'pframe new'), H('figcaption', {}, [H('strong', {}, [`New: 72 x 72, ${m}`])])])));
    sec.appendChild(row);
    page.appendChild(sec);
  }

  if (!only || only === 'slices') {
    const sec = H('section', { class: 'block', id: 'slices' }, [
      H('h2', {}, ['4. Standing in the new worlds, at the size they would be in a game (laptop)']),
      H('p', { class: 'hint' }, ['Each slice is painted at that level’s pixels per tile: 16 for today and (a), 24 for (b), 32 for (c).']),
    ]);
    SLICE_WORLDS.forEach((world) =>
      (['day', 'evening'] as const).forEach((time) => {
        const row = H('div', { class: 'slices' });
        VERSIONS.forEach((v) => {
          row.appendChild(H('figure', { class: 'card' }, [cv(paintSlice(world, v, time), IN_GAME[v.id], 'slice'), H('figcaption', {}, [H('strong', {}, [v.label])])]));
        });
        sec.appendChild(H('h3', {}, [`${world === 'star' ? 'Star Station' : 'Ancient Kingdoms'}, ${time}`]));
        sec.appendChild(row);
      }),
    );
    page.appendChild(sec);
  }
}
