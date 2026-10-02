import { h, Modal } from './dom';

/**
 * The "For grown-ups" page every game has (from Seeds of Genius): what the
 * game teaches, the standards, talking points, how to help, how the child is
 * doing, and privacy and credits. It is always available, before and during
 * play.
 */
export interface GrownupsContent {
  game: string;
  grades: string;
  summary: string;
  teaches: Array<{ title: string; text: string }>;
  standards: Array<{ code: string; text: string }>;
  talk: string[];
  help: string[];
  /** Where the game simplifies on purpose. */
  simplifies?: string[];
  sources?: Array<{ name: string; url: string }>;
  credits: string[];
}

export function openGrownups(host: HTMLElement, c: GrownupsContent, progress?: () => HTMLElement, onClose?: () => void): Modal {
  type Tab = 'teaches' | 'progress' | 'help' | 'about';
  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'teaches', label: 'What it teaches' },
    ...(progress ? [{ id: 'progress' as Tab, label: 'How it is going' }] : []),
    { id: 'help', label: 'How to help' },
    { id: 'about', label: 'Privacy and credits' },
  ];
  const content = h('div', { class: 'content about', role: 'tabpanel', tabindex: '0' });
  const list = (items: string[]) => h('ul', { class: 'gu-list' }, ...items.map((t) => h('li', { text: t })));

  const render = (tab: Tab) => {
    tabBtns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
    content.setAttribute('aria-labelledby', `gu-tab-${tab}`);
    content.replaceChildren();
    if (tab === 'teaches') {
      content.append(
        h('p', {}, h('strong', { text: `${c.game} · Grades ${c.grades}. ` }), c.summary),
        h('h3', { text: 'Skills, level by level' }),
        h('ol', { class: 'gu-list' }, ...c.teaches.map((t) => h('li', {}, h('strong', { text: `${t.title}: ` }), t.text))),
        h('h3', { text: 'Standards' }),
        h('ul', { class: 'gu-list' }, ...c.standards.map((s) => h('li', {}, h('strong', { text: `${s.code}: ` }), s.text))),
      );
      if (c.simplifies?.length) content.append(h('h3', { text: 'Where the game keeps things simple' }), list(c.simplifies));
    } else if (tab === 'progress' && progress) {
      content.append(progress());
    } else if (tab === 'help') {
      content.append(h('h3', { text: 'Talk about it' }), list(c.talk), h('h3', { text: 'Helpful ways to play together' }), list(c.help));
    } else {
      content.append(
        h('h3', { text: 'Privacy' }),
        h('p', { text: 'No accounts, no names, no ads and no trackers. The game makes no network requests. Progress and settings are saved only in this browser, and "Start over" in Settings erases them.' }),
        h('h3', { text: 'Accessibility' }),
        h('p', { text: 'Every action works with a keyboard, a mouse or touch. Settings has reduced motion, larger text, text speed and separate music and effects volume. Nothing depends on sound alone, and there are no timers.' }),
      );
      if (c.sources?.length)
        content.append(h('h3', { text: 'Sources' }), h('ul', { class: 'gu-list' }, ...c.sources.map((s) => h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.name })))));
      content.append(h('h3', { text: 'Credits' }), list(c.credits));
    }
  };

  const tabBtns = tabs.map((t) =>
    h('button', {
      role: 'tab',
      type: 'button',
      id: `gu-tab-${t.id}`,
      'data-tab': t.id,
      text: t.label,
      onclick: () => render(t.id),
      onkeydown: (e: Event) => {
        const k = (e as KeyboardEvent).key;
        if (k !== 'ArrowRight' && k !== 'ArrowLeft') return;
        e.preventDefault();
        const i = tabs.findIndex((x) => x.id === t.id);
        const n = (i + (k === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        render(tabs[n].id);
        tabBtns[n].focus();
      },
    }),
  );
  const root = h(
    'div',
    { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gu-title' },
    h('header', {}, h('h2', { id: 'gu-title', text: 'For grown-ups' }), h('button', { class: 'btn small', type: 'button', text: 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
    h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'For grown-ups' }, ...tabBtns),
    content,
  );
  render('teaches');
  const modal = new Modal(host, root, onClose);
  return modal;
}
