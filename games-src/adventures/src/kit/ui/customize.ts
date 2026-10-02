import {
  BODIES,
  BODY_DEFAULT_HAIR,
  lookFromAppearance,
  paintCharacter,
  type Appearance,
  type BodyId,
  type CharacterLook,
  type Dir,
} from '../art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../art/palette';
import { audio } from '../systems/audio';
import { settings } from '../systems/settings';
import { h, Modal } from './dom';

type Key = keyof Appearance;

interface Group {
  key: string;
  legend: string;
  options: Array<{ id: string; name: string; color?: string }>;
}

/** A game's own clothing choices (a ninja's gi, mask and headband), stored apart from the shared look. */
export interface GearGroup extends Group {
  /** Used by "Surprise me"; defaults to every option. */
  random?: string[];
}

const GROUPS: Group[] = [
  { key: 'body', legend: "I'm a", options: BODIES.map((s) => ({ id: s.id, name: s.name })) },
  { key: 'skin', legend: 'Skin tone', options: SKIN_TONES.map((s) => ({ id: s.id, name: s.name, color: s.base })) },
  { key: 'hairStyle', legend: 'Hair style', options: HAIR_STYLES.map((s) => ({ id: s.id, name: s.name })) },
  { key: 'hairColor', legend: 'Hair color', options: HAIR_COLORS.map((s) => ({ id: s.id, name: s.name, color: s.base })) },
  { key: 'outfit', legend: 'Outfit color', options: OUTFIT_COLORS.map((s) => ({ id: s.id, name: s.name, color: s.base })) },
  { key: 'accessory', legend: 'Accessory (optional)', options: ACCESSORIES.map((s) => ({ id: s.id, name: s.name })) },
];

/**
 * Character creator (from Seeds of Genius). Every choice is purely how the
 * player's character looks; none of them changes gameplay. No name is asked
 * for. Picking Boy or Girl also switches to a matching starting hair style;
 * every style stays available.
 */
export function openCustomize(
  host: HTMLElement,
  initial: Appearance,
  opts: {
    firstTime: boolean;
    /** What the player is called in this game ("explorer", "ninja", "chef"). */
    noun?: string;
    /** Shared choices this game does not use (for example its own gear replaces the outfit). */
    hide?: Key[];
    /** The game's own clothing choices and their current values. */
    gear?: { groups: GearGroup[]; values: Record<string, string> };
    /** Paints the game's pieces on top of the chosen look (a belt, a uniform, the gear). */
    dress?: (look: CharacterLook, gear: Record<string, string>) => CharacterLook;
  },
  onDone: (a: Appearance, gear: Record<string, string>) => void,
): Modal {
  const a: Appearance = { ...initial };
  const gear: Record<string, string> = { ...(opts.gear?.values ?? {}) };
  const noun = opts.noun ?? 'explorer';
  const groups: Group[] = [...GROUPS.filter((g) => !opts.hide?.includes(g.key as Key)), ...(opts.gear?.groups ?? [])];
  const isGear = (key: string) => !!opts.gear?.groups.some((g) => g.key === key);
  const value = (key: string) => (isGear(key) ? gear[key] : (a[key as Key] as string));
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 24;
  canvas.setAttribute('role', 'img');
  let dir: Dir = 'down';
  let frame = 0;
  let tick = 0;
  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 16, 24);
    const look = lookFromAppearance(a);
    paintCharacter(opts.dress ? opts.dress(look, gear) : look, dir, frame).drawTo(ctx, 0, 0);
    const names = groups.map((g) => g.options.find((o) => o.id === value(g.key))?.name).join(', ');
    canvas.setAttribute('aria-label', `Your ${noun}, facing ${dir}: ${names}`);
  };
  const turn = (step: number) => {
    const order: Dir[] = ['down', 'left', 'up', 'right'];
    dir = order[(order.indexOf(dir) + step + 4) % 4];
    draw();
  };
  const timer = window.setInterval(() => {
    if (settings.reducedMotion) return;
    tick++;
    frame = [0, 1, 0, 2][tick % 4];
    draw();
  }, 380);

  const groupsEl = h('div', { style: 'flex:1;min-width:0' });
  const radios = new Map<string, HTMLButtonElement[]>();
  const choose = (key: string, id: string) => {
    if (isGear(key)) gear[key] = id;
    else {
      if (key === 'body' && id !== a.body) a.hairStyle = BODY_DEFAULT_HAIR[id as BodyId];
      a[key as Key] = id as never;
    }
    refresh();
  };
  const refresh = () => {
    radios.forEach((btns, key) =>
      btns.forEach((b) => {
        const on = b.dataset.id === value(key);
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
      }),
    );
    draw();
  };

  groups.forEach((g) => {
    const legendId = `leg-${g.key}`;
    const row = h('div', { class: 'swatches', role: 'radiogroup', 'aria-labelledby': legendId });
    const btns: HTMLButtonElement[] = [];
    g.options.forEach((o, i) => {
      const b = h(
        'button',
        {
          class: `swatch${o.color && g.key !== 'hairStyle' ? ' color' : ''}`,
          type: 'button',
          role: 'radio',
          'data-id': o.id,
          'aria-label': o.name,
          title: o.name,
          style: o.color ? `background:${o.color}` : undefined,
          onclick: () => {
            choose(g.key, o.id);
            audio.click();
          },
          onkeydown: (e: Event) => {
            const k = (e as KeyboardEvent).key;
            if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(k)) return;
            e.preventDefault();
            const n = (i + (k === 'ArrowRight' || k === 'ArrowDown' ? 1 : g.options.length - 1)) % g.options.length;
            choose(g.key, g.options[n].id);
            btns[n].focus();
          },
        },
        o.color ? '' : o.name,
      );
      btns.push(b);
      row.append(b);
    });
    radios.set(g.key, btns);
    groupsEl.append(h('fieldset', {}, h('legend', { id: legendId, text: g.legend }), row));
  });

  const randomize = () => {
    const pick = <T>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
    a.body = pick(BODIES).id;
    a.skin = pick(SKIN_TONES).id;
    a.hairStyle = pick(HAIR_STYLES).id;
    a.hairColor = pick(HAIR_COLORS.slice(0, 5)).id;
    a.outfit = pick(OUTFIT_COLORS).id;
    a.accessory = Math.random() < 0.5 ? 'none' : pick(ACCESSORIES).id;
    for (const g of opts.gear?.groups ?? []) gear[g.key] = pick(g.random ?? g.options.map((o) => o.id));
    refresh();
  };

  const root = h(
    'div',
    { class: 'panel modal customize', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cust-title' },
    h(
      'header',
      {},
      h('h2', { id: 'cust-title', text: opts.firstTime ? `Create your ${noun}` : 'Change your look' }),
    ),
    h(
      'div',
      { class: 'cols' },
      h(
        'div',
        { class: 'preview' },
        canvas,
        h(
          'div',
          { style: 'display:flex;gap:8px' },
          h('button', { class: 'btn small', type: 'button', text: 'Turn left', onclick: () => turn(-1) }),
          h('button', { class: 'btn small', type: 'button', text: 'Turn right', onclick: () => turn(1) }),
        ),
      ),
      groupsEl,
    ),
    h(
      'footer',
      {},
      h('button', { class: 'btn', type: 'button', text: 'Surprise me', onclick: randomize }),
      h('button', {
        class: 'btn primary',
        type: 'button',
        'data-autofocus': true,
        text: opts.firstTime ? "I'm ready!" : 'Done',
        onclick: () => modal.close(),
      }),
    ),
  );
  const modal = new Modal(
    host,
    root,
    () => {
      window.clearInterval(timer);
      // Closing with Escape keeps the current choices (nothing is lost).
      onDone({ ...a }, { ...gear });
    },
    { closeOnBackdrop: false, escapeCloses: !opts.firstTime },
  );
  refresh();
  return modal;
}
