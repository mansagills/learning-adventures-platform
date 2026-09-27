import { paintingCanvas } from '../art/sceneArt';
import { MEMORIES } from '../content/memories';
import { audio } from '../systems/audio';
import { h, Modal } from './dom';

/**
 * A memory from Carver's life, shown as storybook pages. Always labeled as
 * history, with a note that the pictures are imagined and the facts come
 * from the National Park Service.
 */
export function openMemory(host: HTMLElement, memoryId: string): Promise<void> {
  const mem = MEMORIES[memoryId];
  if (!mem) return Promise.resolve();
  audio.open();
  return new Promise((resolve) => {
    let page = 0;
    const view = document.createElement('canvas');
    view.width = 96;
    view.height = 64;
    view.className = 'painting memory-painting';
    view.setAttribute('role', 'img');
    const caption = h('p', { class: 'memory-caption', 'aria-live': 'polite' });
    const count = h('span', { class: 'memory-count' });
    const back = h('button', { class: 'btn small', type: 'button', text: 'Back', onclick: () => go(-1) });
    const next = h('button', { class: 'btn small primary', type: 'button', 'data-autofocus': true, onclick: () => go(1) });

    const render = () => {
      const p = mem.pages[page];
      const g = view.getContext('2d')!;
      g.clearRect(0, 0, 96, 64);
      g.drawImage(paintingCanvas(p.art), 0, 0);
      view.setAttribute('aria-label', `Illustration, page ${page + 1}: ${p.caption}`);
      caption.textContent = p.caption;
      count.textContent = `Page ${page + 1} of ${mem.pages.length}`;
      back.disabled = page === 0;
      next.textContent = page === mem.pages.length - 1 ? 'Close the memory' : 'Next page';
    };
    const go = (d: number) => {
      if (page + d >= mem.pages.length) return modal.close();
      page = Math.max(0, page + d);
      audio.click();
      render();
      next.focus();
    };

    const root = h(
      'div',
      { class: 'panel modal memory-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mem-title' },
      h(
        'header',
        {},
        h(
          'div',
          {},
          h('span', { class: 'badge history', text: "A memory from Carver's life" }),
          h('h2', { id: 'mem-title', text: mem.title }),
          h('p', { class: 'memory-setting', text: mem.setting }),
        ),
        h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        view,
        caption,
        h('div', { class: 'memory-nav' }, back, count, next),
        h('p', { class: 'small memory-note', text: 'The pictures are imagined. The facts come from the National Park Service.' }),
      ),
    );
    const modal = new Modal(host, root, () => {
      audio.close();
      resolve();
    });
    render();
  });
}
