import { iconImg, iconURL } from '../art/icons';
import { CONVERSATIONS } from '../content/conversations';
import { npcById, NPCS, shortName } from '../content/npcs';
import { SOURCES } from '../content/sources';
import type { QuestEngine } from '../quests/engine';
import type { SaveData } from '../systems/save';
import { h, Modal } from './dom';

export type JournalTab = 'quest' | 'bag' | 'map' | 'talks' | 'about';

export interface JournalContext {
  engine: QuestEngine;
  save: SaveData;
  mapCanvas: HTMLCanvasElement;
  mapSize: { w: number; h: number };
  buildings: Array<{ x: number; y: number; w: number; d: number; label: string; roof: string }>;
  playerPos: () => { x: number; y: number; scene: string };
  replay(conversationId: string): void;
  findCarver(): void;
  onInspect(itemId: string): void;
  /** Extra Quest-tab sections supplied by chapter code (notebook, activities). */
  extraSections(): HTMLElement[];
  /** Memories the player has seen, to view again. */
  memories: Array<{ id: string; title: string; setting: string }>;
  openMemory(id: string): void;
}

const TABS: Array<{ id: JournalTab; label: string; icon: string }> = [
  { id: 'quest', label: 'Quest', icon: 'leaf' },
  { id: 'bag', label: 'Bag', icon: 'bag' },
  { id: 'map', label: 'Map', icon: 'map' },
  { id: 'talks', label: 'Talks', icon: 'talk' },
  { id: 'about', label: 'About', icon: 'journal' },
];

/**
 * The field journal: Carver's current assignment, NPC leads, item
 * checklist, the bag (inspect items), the town and chapter map,
 * replayable conversations and the source/credits page.
 */
export function openJournal(host: HTMLElement, ctx: JournalContext, start: JournalTab = 'quest', onClose?: () => void): Modal {
  const tabButtons = new Map<JournalTab, HTMLButtonElement>();
  const content = h('div', { class: 'content', role: 'tabpanel', tabindex: '0' });
  const tablist = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Journal sections' });
  let current: JournalTab = start;

  const select = (id: JournalTab, focus = false) => {
    current = id;
    tabButtons.forEach((b, k) => {
      b.setAttribute('aria-selected', String(k === id));
      b.tabIndex = k === id ? 0 : -1;
    });
    content.setAttribute('aria-labelledby', `tab-${id}`);
    content.replaceChildren(render(id));
    content.scrollTop = 0;
    if (focus) tabButtons.get(id)?.focus();
  };

  TABS.forEach((t, i) => {
    const b = h(
      'button',
      {
        role: 'tab',
        id: `tab-${t.id}`,
        type: 'button',
        onclick: () => select(t.id),
        onkeydown: (e: Event) => {
          const k = (e as KeyboardEvent).key;
          if (k === 'ArrowRight' || k === 'ArrowLeft') {
            e.preventDefault();
            const n = (i + (k === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
            select(TABS[n].id, true);
          }
        },
      },
      iconImg(t.icon, '', 20),
      ` ${t.label}`,
    );
    tabButtons.set(t.id, b);
    tablist.append(b);
  });

  const root = h(
    'div',
    { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'journal-title' },
    h(
      'header',
      {},
      h('h2', { id: 'journal-title' }, 'Field Journal'),
      h('button', { class: 'btn small', type: 'button', text: 'Close (Esc)', onclick: () => modal.close() }),
    ),
    tablist,
    content,
  );
  const modal = new Modal(host, root, onClose);
  select(current);
  requestAnimationFrame(() => tabButtons.get(current)?.focus());

  // ------------------------------------------------------------ tabs

  function render(id: JournalTab): HTMLElement {
    switch (id) {
      case 'quest':
        return questTab();
      case 'bag':
        return bagTab();
      case 'map':
        return mapTab();
      case 'talks':
        return talksTab();
      case 'about':
        return aboutTab();
    }
  }

  function questTab(): HTMLElement {
    const e = ctx.engine;
    const wrap = h('div');
    const next = e.nextAction();
    wrap.append(
      h('div', { class: 'section' }, h('div', { class: 'next-box' }, iconImg('leaf', '', 28), h('span', {}, h('span', { class: 'sr-only', text: 'Next: ' }), next.text))),
    );
    const chapter = e.currentChapter() ?? [...e.allChapters()].reverse().find((c) => e.progress(c.id).stage === 'complete');
    if (chapter) {
      const p = e.progress(chapter.id);
      const stageLabel = p.stage === 'complete' ? 'Complete' : p.stage === 'active' ? 'In progress' : 'Not started';
      wrap.append(
        h(
          'div',
          { class: 'section' },
          h('h3', {}, `${chapter.number === 0 ? 'Practice quest' : `Chapter ${chapter.number}`}: ${chapter.title}`),
          h('p', { style: 'margin:0 0 6px' }, h('strong', { text: "Carver's assignment: " }), chapter.assignment),
          h('p', { style: 'margin:0 0 6px' }, h('strong', { text: 'Why it matters: ' }), chapter.whyItMatters),
          h('p', { style: 'margin:0' }, h('strong', { text: 'Status: ' }), stageLabel),
          h('button', {
            class: 'btn small',
            type: 'button',
            style: 'margin-top:10px',
            text: 'Show me where Carver is',
            onclick: () => {
              modal.close();
              ctx.findCarver();
            },
          }),
        ),
      );
      if (p.stage !== 'available') {
        const leads = e.leads(chapter.id);
        wrap.append(
          h(
            'div',
            { class: 'section' },
            h('h3', { text: 'People to talk to' }),
            h(
              'ul',
              { class: 'checklist' },
              ...leads.map((l) => {
                const npc = npcById(l.npcId);
                return h(
                  'li',
                  {},
                  h('span', { class: `state${l.done ? ' done' : ''}`, text: l.done ? 'Talked' : 'To do' }),
                  h('span', {}, h('strong', { text: `${npc?.name ?? l.npcId}: ` }), l.lead),
                );
              }),
            ),
          ),
        );
        const items = e.itemChecklist(chapter.id);
        wrap.append(
          h(
            'div',
            { class: 'section' },
            h('h3', { text: 'Items for this quest' }),
            h(
              'ul',
              { class: 'checklist' },
              ...items.map((it) =>
                h(
                  'li',
                  {},
                  h('span', { class: `state${it.used ? ' done' : ''}`, text: it.used ? 'Used' : it.collected ? 'Collected' : 'Needed' }),
                  h('img', { src: iconURL(it.item.icon, 2), alt: '', width: 28, height: 28, class: 'px-icon' }),
                  h('span', {}, h('strong', { text: `${it.item.name}. ` }), it.used ? `${it.usedIn}.` : it.item.purpose),
                ),
              ),
            ),
          ),
        );
      }
      // Show the reflection of this chapter, or of the one just finished
      // while the next one waits to be started.
      const lastDone = [...e.allChapters()].reverse().find((c) => e.progress(c.id).stage === 'complete');
      const reflect = p.stage === 'complete' ? chapter : p.stage === 'available' ? lastDone : undefined;
      if (reflect) {
        wrap.append(
          h(
            'div',
            { class: 'section' },
            h('h3', { text: reflect === chapter ? 'Chapter reflection' : `Chapter reflection: ${reflect.title}` }),
            h('p', { style: 'margin:0 0 6px', text: `You earned ${reflect.rewards.xp} XP and ${reflect.rewards.seeds} Seeds.${reflect.rewards.unlock ? ` Unlocked: ${reflect.rewards.unlock}.` : ''}` }),
            reflect.reflection ? h('p', { style: 'margin:0', text: reflect.reflection }) : null,
          ),
        );
      }
    }
    ctx.extraSections().forEach((el) => wrap.append(el));
    if (ctx.memories.length)
      wrap.append(
        h(
          'div',
          { class: 'section' },
          h('h3', { text: "Memories from Carver's life" }),
          h(
            'ul',
            { class: 'checklist' },
            ...ctx.memories.map((m) =>
              h(
                'li',
                { style: 'align-items:center;justify-content:space-between' },
                h('span', {}, h('strong', { text: m.title }), ` (${m.setting})`),
                h('button', { class: 'btn small', type: 'button', text: 'View again', 'aria-label': `View again: ${m.title}`, onclick: () => ctx.openMemory(m.id) }),
              ),
            ),
          ),
        ),
      );
    const evidence = Object.entries(ctx.save.learner).flatMap(([, r]) => r.evidence).slice(-6);
    if (evidence.length)
      wrap.append(h('div', { class: 'section' }, h('h3', { text: 'Your science notes' }), h('ul', {}, ...evidence.map((t) => h('li', { text: t })))));
    return wrap;
  }

  function bagTab(): HTMLElement {
    const wrap = h('div');
    const inv = ctx.save.progress.inventory;
    wrap.append(
      h('p', { style: 'margin:0 0 12px', text: 'Quest items people have given you. They can never be lost or sold. Choose one to look at it closely.' }),
    );
    const slots = h('div', { class: 'slots', role: 'list' });
    const detail = h('div', { 'aria-live': 'polite' });
    const show = (itemId: string) => {
      const def = ctx.engine.itemDef(itemId);
      const e = ctx.engine.inventoryEntry(itemId);
      if (!def || !e) return;
      ctx.onInspect(itemId);
      slots.querySelectorAll('.slot').forEach((s) => s.setAttribute('aria-pressed', String((s as HTMLElement).dataset.item === itemId)));
      const from = npcById(e.from)?.name ?? e.from;
      detail.replaceChildren(
        h(
          'div',
          { class: 'inspect' },
          h('img', { src: iconURL(def.icon, 6), alt: '', width: 96, height: 96, class: 'px-icon' }),
          h(
            'div',
            {},
            h('h3', { text: def.name }),
            h('p', { style: 'margin:0 0 8px', text: def.description }),
            h('strong', { text: 'Looking closely, you notice:' }),
            h('ul', { style: 'margin:4px 0 0;padding-left:22px;line-height:1.45' }, ...def.lookCloser.map((t) => h('li', { text: t }))),
            h(
              'dl',
              {},
              h('dt', { text: 'From' }),
              h('dd', { text: from }),
              h('dt', { text: 'Purpose' }),
              h('dd', { text: def.purpose }),
              h('dt', { text: 'Status' }),
              h('dd', { text: e.used ? `Used: ${e.usedIn}` : 'Not used yet' }),
            ),
          ),
        ),
      );
    };
    inv.forEach((e) => {
      const def = ctx.engine.itemDef(e.itemId);
      if (!def) return;
      slots.append(
        h(
          'button',
          { class: 'slot', type: 'button', role: 'listitem', 'data-item': e.itemId, 'aria-pressed': 'false', onclick: () => show(e.itemId) },
          h('img', { src: iconURL(def.icon, 3), alt: '', width: 48, height: 48, class: 'px-icon' }),
          h('span', { text: def.name }),
          e.used ? h('span', { class: 'badge', text: 'Used' }) : !e.inspected ? h('span', { class: 'badge', text: 'New' }) : null,
        ),
      );
    });
    const empties = Math.max(3, 6 - inv.length);
    for (let i = 0; i < empties; i++) slots.append(h('div', { class: 'slot empty', role: 'listitem', 'aria-label': 'Empty slot', text: 'Empty' }));
    wrap.append(slots, detail);
    const firstNew = inv.find((e) => !e.inspected) ?? inv[0];
    if (firstNew) show(firstNew.itemId);
    return wrap;
  }

  function mapTab(): HTMLElement {
    const wrap = h('div');
    const { w, hgt } = { w: ctx.mapSize.w, hgt: ctx.mapSize.h };
    const cv = document.createElement('canvas');
    cv.width = ctx.mapCanvas.width / 2;
    cv.height = ctx.mapCanvas.height / 2;
    const g = cv.getContext('2d')!;
    g.imageSmoothingEnabled = false;
    g.drawImage(ctx.mapCanvas, 0, 0, cv.width, cv.height);
    const tp = cv.width / w;
    ctx.buildings.forEach((b) => {
      g.fillStyle = b.roof;
      g.fillRect(b.x * tp, b.y * tp, b.w * tp, b.d * tp);
      g.strokeStyle = '#2b1d1e';
      g.lineWidth = 2;
      g.strokeRect(b.x * tp + 1, b.y * tp + 1, b.w * tp - 2, b.d * tp - 2);
    });
    cv.className = 'minimap';
    cv.setAttribute('role', 'img');
    const pos = ctx.playerPos();
    const pinsWrap = h('div', { class: 'minimap-wrap' }, cv);
    const pin = (x: number, y: number, label: string, cls: string, icon?: string) => {
      pinsWrap.append(
        h(
          'div',
          { class: `map-pin ${cls}`, style: `left:${(x / w) * 100}%;top:${(y / hgt) * 100}%` },
          icon ? iconImg(icon, '', 16) : null,
          label,
        ),
      );
    };
    const next = ctx.engine.nextAction();
    NPCS.filter((n) => n.required && n.scene === 'hub').forEach((n) =>
      pin(n.pos.x, n.pos.y - 0.4, shortName(n), n.id === 'carver' ? 'carver' : '', next.targetNpcId === n.id ? 'leaf' : undefined),
    );
    const px = pos.scene === 'hub' ? pos : { x: 5.5, y: 17.5 };
    pin(px.x, px.y - 0.4, pos.scene === 'hub' ? 'You' : 'You (inside)', 'you');
    const described = ctx.buildings.map((b) => b.label).join(', ');
    cv.setAttribute('aria-label', `Map of Sweetgum Hollow showing ${described}, where you are, and where Carver is.`);
    wrap.append(h('div', { class: 'section' }, h('h3', { text: 'Sweetgum Hollow' }), pinsWrap));
    wrap.append(
      h('div', { class: 'section' }, h('p', { style: 'margin:6px 0 0', text: `Places: ${described}. The pond is south of the town square.` })),
    );

    const e = ctx.engine;
    const cur = e.currentChapter();
    wrap.append(
      h(
        'div',
        { class: 'section' },
        h('h3', { text: 'Your journey with Carver' }),
        h(
          'ol',
          { class: 'chapter-path' },
          ...e.allChapters().map((c) => {
            const st = e.progress(c.id).stage;
            const cls = st === 'complete' ? 'done' : cur?.id === c.id ? 'current' : '';
            const label =
              st === 'complete'
                ? 'Complete'
                : c.status === 'coming-soon'
                  ? e.isUnlocked(c.id)
                    ? 'Unlocked · arrives in the next update'
                    : 'Coming in a later update'
                  : st === 'locked'
                    ? 'Locked'
                    : st === 'active'
                      ? 'In progress'
                      : 'Ready to start';
            return h(
              'li',
              { class: cls },
              h('div', { class: 'num', text: c.number === 0 ? 'Practice' : `Chapter ${c.number}` }),
              h('strong', { text: c.title }),
              h('div', { style: 'font-size:var(--text-small);color:var(--ink-soft)', text: c.subtitle }),
              h('div', { style: 'margin-top:4px;font-size:var(--text-small);font-weight:700', text: label }),
              c.analogActivity && st !== 'locked'
                ? h('div', { style: 'font-size:var(--text-small)', text: `Off-screen activity: ${c.analogActivity.title}` })
                : null,
            );
          }),
        ),
      ),
    );
    return wrap;
  }

  function talksTab(): HTMLElement {
    const wrap = h('div');
    const seen = new Map<string, { npcId: string; at: number }>();
    [...ctx.save.log].reverse().forEach((e) => {
      if (!seen.has(e.conversationId)) seen.set(e.conversationId, { npcId: e.npcId, at: e.at });
    });
    if (!seen.size) {
      wrap.append(h('p', { text: 'Conversations you have will be saved here so you can replay them.' }));
      return wrap;
    }
    wrap.append(h('p', { style: 'margin:0 0 12px', text: 'Replay any conversation. Replays never change your progress.' }));
    const list = h('ul', { class: 'checklist' });
    seen.forEach((_v, id) => {
      const conv = CONVERSATIONS[id];
      if (!conv) return;
      list.append(
        h(
          'li',
          { style: 'align-items:center;justify-content:space-between' },
          h('span', { text: conv.title }),
          h('button', {
            class: 'btn small',
            type: 'button',
            text: 'Replay',
            'aria-label': `Replay: ${conv.title}`,
            onclick: () => {
              modal.close();
              ctx.replay(id);
            },
          }),
        ),
      );
    });
    wrap.append(list);
    return wrap;
  }

  function aboutTab(): HTMLElement {
    return h(
      'div',
      { class: 'about' },
      h('h3', { text: 'About this story' }),
      h(
        'p',
        {
          text: 'George Washington Carver (about 1864 to 1943) was a real scientist and teacher. He studied plants and soil, taught at Tuskegee Institute in Alabama, and helped farmers improve their land.',
        },
      ),
      h(
        'p',
        {
          text: "In this game he appears as a storybook guide. His lines are written for the game; they are not his real words. Sweetgum Hollow and its townspeople are made up. Scenes from Carver's life will always be labeled as memories from history.",
        },
      ),
      h('h3', { text: 'Sources used to check facts' }),
      h('ul', {}, ...SOURCES.map((s) => h('li', {}, h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer', text: s.title }), ` (${s.publisher})`))),
      h('h3', { text: 'Your privacy' }),
      h(
        'p',
        {
          text: 'This game saves your progress only in this browser. It does not ask for your name, does not use accounts, and sends nothing to the internet.',
        },
      ),
      h('h3', { text: 'Credits' }),
      h(
        'p',
        {
          text: 'Game, pixel art, music and sounds: made for Learning Adventures (original work, drawn and synthesized in code). Built with three.js (MIT license). Fonts: Atkinson Hyperlegible by the Braille Institute and Pixelify Sans (both SIL Open Font License).',
        },
      ),
    );
  }

  return modal;
}
