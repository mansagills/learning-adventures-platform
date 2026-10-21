import { iconImg } from '../../kit/art/icons';
import { audio } from '../../kit/systems/audio';
import { isTouchDevice } from '../../kit/systems/settings';
import { speak } from '../../kit/systems/speech';
import { h, Modal } from '../../kit/ui/dom';
import { toast } from '../../kit/ui/hud';
import { paintOcean } from '../../kit/worlds/wild-lands/ocean';
import { paintCreature } from './art';
import { DESIGNER } from './content';
import {
  CHALLENGES,
  TEST_ZONES,
  CHECK_NAMES,
  creatureName,
  GRADE_WORDS,
  meets,
  PART_KEYS,
  PART_NAMES,
  PART_OPTIONS,
  START_PARTS,
  testCreature,
  type ChallengeId,
  type PartKey,
  type Parts,
  type TestResult,
  type TestZone,
} from './designer';
import { pix } from './pix';

export interface DesignerOptions {
  /** Challenges already met. */
  met: ChallengeId[];
  /** Zones open for test dives (each deep zone opens after its dive). */
  openZones: TestZone[];
  /** How many creatures are already saved. */
  saved: number;
  maxSaved: number;
  seed: number;
  onMeet: (id: ChallengeId) => void;
  onSave: (name: string, parts: Parts) => void;
  onClose: () => void;
}

const ZONE_LABEL: Record<TestZone, string> = { sunlight: 'The sunny reef', twilight: 'The twilight zone', midnight: 'The midnight zone' };
const ZONE_DEPTH: Record<TestZone, number> = { sunlight: 27, twilight: 520, midnight: 1900 };

/**
 * The lab tent's Creature Designer: pick a body, eyes, skin, lights and a
 * mouth, then test-dive the creature in a zone. The results show three
 * checks (find food, hide, stay safe), each with the reason, and tick off
 * Dr. Lani's challenges when they are met.
 */
export function openDesigner(host: HTMLElement, o: DesignerOptions): Modal {
  const parts: Parts = { ...START_PARTS };
  let zone: TestZone = 'sunlight';
  let seed = o.seed;
  let name = creatureName(seed);
  let saved = o.saved;
  const met = new Set(o.met);
  let last: TestResult | null = null;

  const preview = h('div', { class: 'odd-creature-view' });
  const nameEl = h('strong', { class: 'odd-creature-name' });
  const renameBtn = h('button', {
    class: 'btn small',
    type: 'button',
    text: 'New name',
    onclick: () => {
      seed += 7;
      name = creatureName(seed);
      renderPreview();
    },
  });
  const partRows = h('div', { class: 'odd-parts' });
  const zoneRow = h('div', { class: 'odd-zone-pick', role: 'radiogroup', 'aria-label': 'Where to test it' });
  const challengeList = h('ul', { class: 'odd-challenges' });
  const results = h('div', { class: 'odd-results', role: 'status', 'aria-live': 'polite' });
  const testBtn = h('button', { class: 'btn primary', type: 'button', onclick: () => runTest() }, iconImg('arrowDown', '', 20), h('span', { text: 'Test dive!' }));
  const saveBtn = h('button', { class: 'btn', type: 'button', text: 'Save to my field guide', onclick: () => saveCreature() });

  const backgrounds = new Map<TestZone, string>();
  const bg = (z: TestZone) => {
    let u = backgrounds.get(z);
    if (!u) backgrounds.set(z, (u = paintOcean(160, 90, { depth: ZONE_DEPTH[z], span: z === 'sunlight' ? 40 : 200, noAnimals: true, noSnow: z === 'sunlight', frame: 3 }).toDataURL(1)));
    return u;
  };

  function renderPreview(): void {
    const key = `cr-${PART_KEYS.map((k) => parts[k]).join('-')}`;
    const img = pix(key, () => paintCreature(parts, 3, 0, true), 1, `Your creature: ${describe(parts)}`);
    img.classList.add('odd-creature-img');
    if (zone !== 'sunlight') img.classList.add(zone === 'twilight' ? 'dim' : 'dark');
    preview.style.backgroundImage = `url(${bg(zone)})`;
    preview.replaceChildren(img);
    nameEl.textContent = name;
  }

  function renderParts(): void {
    partRows.replaceChildren(
      ...PART_KEYS.map((k) =>
        h(
          'div',
          { class: 'odd-part-row', role: 'radiogroup', 'aria-label': PART_NAMES[k] },
          h('span', { class: 'odd-part-name', text: PART_NAMES[k] }),
          ...(PART_OPTIONS[k] as Array<{ id: string; label: string }>).map((opt) =>
            h('button', {
              class: `btn small odd-part${parts[k] === opt.id ? ' on' : ''}`,
              type: 'button',
              role: 'radio',
              'aria-checked': String(parts[k] === opt.id),
              'data-part': k,
              'data-value': opt.id,
              text: opt.label,
              onclick: () => {
                (parts as unknown as Record<PartKey, string>)[k] = opt.id;
                audio.click();
                results.replaceChildren();
                last = null;
                renderParts();
                renderPreview();
              },
            }),
          ),
        ),
      ),
    );
  }

  function renderZones(): void {
    zoneRow.replaceChildren(
      h('span', { class: 'odd-part-name', text: 'Test it in' }),
      ...TEST_ZONES.map((z) => {
        const locked = !o.openZones.includes(z);
        return h(
          'button',
          {
            class: `btn small odd-part${zone === z ? ' on' : ''}${locked ? ' locked' : ''}`,
            type: 'button',
            role: 'radio',
            'aria-checked': String(zone === z),
            'data-zone': z,
            onclick: () => {
              if (locked) {
                toast(DESIGNER.locked[z], 'hint');
                return;
              }
              zone = z;
              results.replaceChildren();
              last = null;
              renderZones();
              renderPreview();
            },
          },
          ...(locked ? [iconImg('lock', '', 16)] : []),
          h('span', { text: ZONE_LABEL[z] }),
        );
      }),
    );
  }

  function renderChallenges(): void {
    challengeList.replaceChildren(
      ...CHALLENGES.map((c) => {
        const locked = !o.openZones.includes(c.zone);
        const done = met.has(c.id);
        const hint = h('span', { class: 'odd-ch-hint', hidden: true, text: c.hint });
        return h(
          'li',
          { class: `odd-ch${done ? ' done' : ''}${locked ? ' locked' : ''}`, 'data-ch': c.id },
          iconImg(done ? 'check' : locked ? 'lock' : 'starEmpty', '', 18),
          h('span', { class: 'odd-ch-text' }, h('span', { text: locked ? `${c.text} (opens after the ${c.zone} dive)` : c.text }), hint),
          ...(!done && !locked
            ? [
                h(
                  'button',
                  {
                    class: 'btn small',
                    type: 'button',
                    'aria-label': `Hint: ${c.text}`,
                    onclick: () => {
                      hint.hidden = false;
                      speak(c.hint);
                    },
                  },
                  iconImg('bulb', '', 16),
                ),
              ]
            : []),
        );
      }),
    );
  }

  function runTest(): void {
    const r = testCreature(parts, zone);
    last = r;
    audio.click();
    const chips = r.checks.map((c) =>
      h('li', { class: `odd-check g${c.grade}`, 'data-check': c.id }, h('strong', { text: `${CHECK_NAMES[c.id]}: ${GRADE_WORDS[c.grade]}` }), h('span', { text: c.why })),
    );
    results.replaceChildren(h('p', { class: `odd-summary ${r.overall}`, text: r.summary }), h('ul', { class: 'odd-checks' }, ...chips));
    preview.classList.remove('swim');
    void preview.offsetWidth;
    preview.classList.add('swim');
    speak(`${r.summary} ${r.checks.map((c) => `${CHECK_NAMES[c.id]}: ${GRADE_WORDS[c.grade]}. ${c.why}`).join(' ')}`);
    if (r.overall === 'thrives') audio.itemGet();
    else if (r.overall === 'struggles') audio.retry();
    else audio.correct();
    for (const c of CHALLENGES) {
      if (met.has(c.id) || !meets(c, r)) continue;
      met.add(c.id);
      o.onMeet(c.id);
      toast(`Challenge met: ${c.text}`, 'reward');
      audio.levelUp();
    }
    renderChallenges();
  }

  function saveCreature(): void {
    if (saved >= o.maxSaved) toast(`Your field guide keeps your newest ${o.maxSaved} creatures. The oldest one makes room.`, 'hint');
    o.onSave(name, { ...parts });
    saved = Math.min(o.maxSaved, saved + 1);
    toast(`${name} is in your field guide!`, 'reward');
    audio.itemGet();
    seed += 13;
    name = creatureName(seed);
    renderPreview();
    void last;
  }

  const root = h(
    'div',
    { class: 'panel modal odd-designer', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'odd-designer-title' },
    h(
      'header',
      {},
      h('h2', { id: 'odd-designer-title', text: 'The Creature Designer' }),
      h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', onclick: () => modal.close() }),
    ),
    h(
      'div',
      { class: 'content odd-designer-body' },
      h('div', { class: 'odd-designer-left' }, preview, h('div', { class: 'odd-name-row' }, nameEl, renameBtn), zoneRow, h('div', { class: 'odd-test-row' }, testBtn, saveBtn), results),
      h('div', { class: 'odd-designer-right' }, partRows, h('h3', { class: 'odd-ch-head', text: 'Dr. Lani’s challenges' }), challengeList),
    ),
  );
  const modal = new Modal(host, root, () => o.onClose(), { closeOnBackdrop: false });
  renderParts();
  renderZones();
  renderChallenges();
  renderPreview();
  return modal;
}

/** The creature in words (for its picture's description). */
export function describe(p: Parts): string {
  const find = <K extends PartKey>(k: K) => (PART_OPTIONS[k] as Array<{ id: string; label: string }>).find((x) => x.id === p[k])!.label.toLowerCase();
  return `${find('body')} body, ${find('eyes')}, ${find('skin')} skin, ${find('light')}, ${find('mouth')}`;
}
