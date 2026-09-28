import { iconImg } from '../../art/icons';
import { CHAPTERS } from '../../content/chapters';
import { ITEMS } from '../../content/items';
import { npcById } from '../../content/npcs';
import { escalateHint, recordAttempt } from '../../learning/learnerModel';
import type { RuntimeContext } from '../../quests/runtime';
import { portraitURL } from '../../ui/dialogue';
import { h, Modal } from '../../ui/dom';
import {
  CATEGORY_TEXT,
  COMPARES,
  EVIDENCE,
  EVIDENCE_ORDER,
  EXTRAS,
  EXTRA_ORDER,
  MAINS,
  MAIN_ORDER,
  MATERIALS,
  MATERIAL_ORDER,
  MEASURES,
  MEASURE_ORDER,
  NEEDS,
  REPEATS,
  TRYOUT,
  changesBetween,
  checkTyped,
  example,
  rubric,
  upgradeFor,
  type Category,
  type Design,
  type Neighbor,
} from './data';
import { ch7State, need, passesRevision, restart, step, type Ch7State } from './state';

function fill(el: HTMLElement, ...kids: Array<Node | null | false>): void {
  el.replaceChildren(...kids.filter((k): k is Node => !!k));
}

function whenClosed(make: (done: () => void) => Modal): Promise<void> {
  return new Promise((resolve) => {
    make(resolve);
  });
}

const NEIGHBOR_NAME: Record<Neighbor, string> = { theo: 'Theo', lottie: 'Miss Lottie' };
/** The keepsake each chapter gives at the end. */
const REWARD_CARD: Record<string, string> = {
  ch1: 'nature_card',
  ch2: 'journey_card',
  ch3: 'rotation_card',
  ch4: 'invention_card',
  ch5: 'interview_card',
  ch6: 'experiment_card',
  ch7: 'golden_seed',
};
const CATS: Category[] = ['water', 'shade', 'waste', 'nature'];
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

// ================================================================ the project, in words

export interface ProjectCard {
  name: string;
  need: string;
  from: string;
  idea: string;
  evidence: string[];
  test: string;
  revision: string;
}

export function projectCard(st: Ch7State): ProjectCard | null {
  const n = need(st);
  const d = st.final;
  if (!n || !d || !st.first || !d.main || !d.material || !d.extra || !d.measure || !d.compare || !d.repeat) return null;
  const up = upgradeFor(d);
  const changes = changesBetween(st.first, d).filter((c) => !up || c !== lower(up.text));
  return {
    name: st.name ?? `${MAINS[d.main].name} for ${n.who}`,
    need: n.text,
    from: st.needId === 'custom' ? 'A need I noticed myself' : `From ${NEIGHBOR_NAME[n.from]}'s need cards`,
    idea: `${MAINS[d.main].name}. ${MAINS[d.main].text} Made from: ${lower(MATERIALS[d.material].name)}. Plus: ${lower(EXTRAS[d.extra].name)}.`,
    evidence: d.evidence.map((e) => EVIDENCE[e]),
    test: `${MEASURES[d.measure].name}. ${COMPARES[d.compare]}. ${REPEATS[d.repeat]}.`,
    revision: `When ${NEIGHBOR_NAME[n.from]} tried the first version: ${lower(TRYOUT[d.main].finding)} So I decided to ${lower(up!.text)}.${changes.length ? ` I also ${changes.join(', and ')}.` : ''}`,
  };
}

export function cardText(c: ProjectCard): string {
  return [
    `MY CARVER PROJECT: ${c.name}`,
    '',
    `The need: ${c.need} (${c.from})`,
    `My idea: ${c.idea}`,
    `Why I think it will work: ${c.evidence.join('; ')}`,
    `How I will test it: ${c.test}`,
    `What I changed after testing: ${c.revision}`,
    '',
    'Seeds of Genius, Chapter 7: Your Turn to Plant the Seeds.',
  ].join('\n');
}

function cardView(c: ProjectCard): HTMLElement {
  const row = (label: string, ...body: Array<Node | string>) => h('div', { class: 'pc-box' }, h('div', { class: 'pc-label', text: label }), h('div', { class: 'pc-body' }, ...body));
  return h(
    'div',
    { class: 'print-card project-card' },
    h('h2', { text: `My Carver Project: ${c.name}` }),
    row('The need', `${c.need} `, h('span', { class: 'small', text: `(${c.from})` })),
    row('My idea', c.idea),
    row('Why I think it will work', h('ul', {}, ...c.evidence.map((e) => h('li', { text: e })))),
    row('How I will test it', c.test),
    row('What I changed after testing', c.revision),
    h('p', { class: 'pc-foot', text: 'Seeds of Genius · Chapter 7: Your Turn to Plant the Seeds' }),
  );
}

function download(c: ProjectCard): void {
  const blob = new Blob([cardText(c)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: 'my-carver-project.txt' });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ================================================================ the project table

export function openProjectTable(ctx: RuntimeContext, onPresented: (firstTime: boolean) => void): Promise<void> {
  const st = ch7State(ctx.data);
  ctx.sound('open');

  return whenClosed((done) => {
    const body = h('div', { class: 'content project-body' });
    let message: { kind: 'good' | 'try'; text: string } | null = null;
    let typedNeed = st.customNeed ?? '';
    let typedCategory: Category | null = st.customCategory;
    let typedName = st.name ?? '';

    const say = (kind: 'good' | 'try', text: string) => (message = { kind, text });

    const optButton = (group: string, id: string, label: string, on: boolean, pickIt: () => void, icon?: string) =>
      h(
        'button',
        {
          class: `btn small opt${on ? ' on' : ''}`,
          type: 'button',
          'aria-pressed': on ? 'true' : 'false',
          'data-opt': `${group}:${id}`,
          onclick: () => {
            pickIt();
            message = null;
            ctx.persist();
            render(`[data-opt="${group}:${id}"]`);
          },
        },
        icon ? iconImg(icon, '', 20) : null,
        ` ${label}`,
      );

    const group = (title: string, hint: string | null, ...buttons: HTMLElement[]) =>
      h('fieldset', { class: 'proj-group' }, h('legend', { text: title }), hint ? h('p', { class: 'small', text: hint }) : null, h('div', { class: 'opt-wrap' }, ...buttons));

    const needStrip = () => {
      const n = need(st)!;
      return h(
        'div',
        { class: 'need-strip', role: 'note' },
        iconImg('needcard', '', 24),
        h('span', {}, h('strong', { text: 'The need: ' }), n.text, h('span', { class: 'small', text: ` (${st.needId === 'custom' ? 'your own need' : `from ${NEIGHBOR_NAME[n.from]}`})` })),
      );
    };

    // ------------------------------------------------ 1. choose a need
    const needView = () =>
      h(
        'section',
        { class: 'lab-step' },
        h('h3', { text: 'Choose a need to help with' }),
        h('p', { class: 'small', text: 'These come from your neighbors. Pick one, or write a need you have noticed yourself.' }),
        h(
          'ul',
          { class: 'rec-cards need-cards' },
          ...NEEDS.map((n) =>
            h(
              'li',
              {},
              h(
                'button',
                {
                  class: 'rec-card',
                  type: 'button',
                  'data-need': n.id,
                  onclick: () => {
                    st.needId = n.id;
                    recordAttempt(ctx.learner, 'capstone', { correct: true, evidence: `Chose a community need: ${n.text}` });
                    say('good', `Good choice. ${NEIGHBOR_NAME[n.from]} will be glad. Now design your project.`);
                    ctx.sound('correct');
                    ctx.persist();
                    render('[data-msg]');
                  },
                },
                h('span', { class: 'rec-title' }, h('img', { class: 'mini-portrait', src: portraitURL(npcById(n.from)!, 'smile'), alt: '' }), h('strong', { text: `From ${NEIGHBOR_NAME[n.from]}` })),
                h('span', { class: 'rec-text', text: n.text }),
                h('span', { class: 'rec-cost', text: `Helps ${n.who}` }),
              ),
            ),
          ),
        ),
        h(
          'div',
          { class: 'typed-need' },
          h('label', { for: 'own-need', text: 'Or write your own need (optional):' }),
          h('input', {
            id: 'own-need',
            type: 'text',
            maxlength: 120,
            autocomplete: 'off',
            placeholder: 'Example: The park has no place to recycle bottles.',
            value: typedNeed,
            oninput: (e: Event) => (typedNeed = (e.target as HTMLInputElement).value),
          }),
          h(
            'div',
            { class: 'opt-wrap', role: 'group', 'aria-label': 'What kind of problem is it most like?' },
            h('span', { class: 'small', text: 'It is most like: ' }),
            ...CATS.map((c) =>
              h('button', {
                class: `btn small opt${typedCategory === c ? ' on' : ''}`,
                type: 'button',
                'aria-pressed': typedCategory === c ? 'true' : 'false',
                'data-cat': c,
                text: CATEGORY_TEXT[c],
                onclick: () => {
                  typedCategory = c;
                  render(`[data-cat="${c}"]`);
                },
              }),
            ),
          ),
          h('button', {
            class: 'btn small primary',
            type: 'button',
            'data-own': true,
            text: 'Use my need',
            onclick: () => {
              const r = checkTyped(typedNeed, { min: 10, max: 120, words: 3 });
              if (!r.ok) say('try', r.reason);
              else if (!typedCategory) say('try', 'Choose what kind of problem it is most like, so your neighbors can give you feedback.');
              else {
                st.needId = 'custom';
                st.customNeed = r.text;
                st.customCategory = typedCategory;
                recordAttempt(ctx.learner, 'capstone', { correct: true, evidence: `Wrote a community need: ${r.text}` });
                say('good', 'A need you noticed yourself! Now design your project.');
                ctx.sound('correct');
              }
              ctx.persist();
              render('[data-msg]');
            },
          }),
        ),
      );

    // ------------------------------------------------ 2. build (also used to revise)
    const builder = () => {
      const d = st.draft;
      const set = (fn: (x: Design) => void) => () => fn(d);
      return h(
        'div',
        { class: 'builder proj-builder' },
        group('1. Main part', 'From the prototype kit.', ...MAIN_ORDER.map((m) => optButton('main', m, MAINS[m].name, d.main === m, set((x) => {
          if (x.main !== m) x.upgrade = null;
          x.main = m;
        }), MAINS[m].icon))),
        d.main ? h('p', { class: 'small step-notes', text: MAINS[d.main].text }) : null,
        group('2. Made from', null, ...MATERIAL_ORDER.map((m) => optButton('mat', m, MATERIALS[m].name, d.material === m, set((x) => (x.material = m))))),
        group('3. One extra', null, ...EXTRA_ORDER.map((e) => optButton('extra', e, EXTRAS[e].name, d.extra === e, set((x) => (x.extra = e))))),
        group(
          '4. Why I think it will work',
          'Pick one or two things you learned on your journey.',
          ...EVIDENCE_ORDER.map((e) =>
            optButton('ev', e, EVIDENCE[e], d.evidence.includes(e), set((x) => {
              if (x.evidence.includes(e)) x.evidence = x.evidence.filter((y) => y !== e);
              else x.evidence = [...x.evidence, e].slice(-2);
            })),
          ),
        ),
        group('5. How I will test it: what to measure', null, ...MEASURE_ORDER.map((m) => optButton('meas', m, MEASURES[m].name, d.measure === m, set((x) => (x.measure = m))))),
        group('How to compare', null, ...(['before_after', 'with_without'] as const).map((c) => optButton('cmp', c, COMPARES[c], d.compare === c, set((x) => (x.compare = c))))),
        group('How many times', null, ...(['once', 'several'] as const).map((r) => optButton('rep', r, REPEATS[r], d.repeat === r, set((x) => (x.repeat = r))))),
        h(
          'div',
          { class: 'typed-need' },
          h('label', { for: 'proj-name', text: 'Name your project (optional):' }),
          h('input', {
            id: 'proj-name',
            type: 'text',
            maxlength: 40,
            autocomplete: 'off',
            placeholder: 'Example: The Rain Saver',
            value: typedName,
            oninput: (e: Event) => (typedName = (e.target as HTMLInputElement).value),
            onchange: () => {
              if (!typedName.trim()) {
                st.name = null;
                return ctx.persist();
              }
              const r = checkTyped(typedName, { min: 2, max: 40 });
              if (r.ok) {
                st.name = r.text;
                say('good', `Project name saved: "${r.text}".`);
              } else say('try', r.reason);
              ctx.persist();
              render('[data-msg]');
            },
          }),
        ),
      );
    };

    const missing = (d: Design): string[] => {
      const out: string[] = [];
      if (!d.main) out.push('a main part');
      if (!d.material) out.push('what it is made from');
      if (!d.extra) out.push('an extra');
      if (!d.evidence.length) out.push('why it will work');
      if (!d.measure || !d.compare || !d.repeat) out.push('the test plan');
      return out;
    };

    const buildView = () => {
      const n = need(st)!;
      return h(
        'section',
        { class: 'lab-step' },
        needStrip(),
        h('h3', { text: 'Design your project' }),
        builder(),
        h(
          'div',
          { class: 'planner-actions' },
          h('button', {
            class: 'btn primary',
            type: 'button',
            'data-show': true,
            text: `Show it to ${NEIGHBOR_NAME[n.from]}`,
            onclick: () => {
              const miss = missing(st.draft);
              if (miss.length) {
                say('try', `Almost ready. Still to choose: ${miss.join(', ')}.`);
                render('[data-msg]');
                return;
              }
              st.first = JSON.parse(JSON.stringify(st.draft)) as Design;
              st.rung = 0;
              ctx.sound('item');
              say('good', `${NEIGHBOR_NAME[n.from]} tried your first version. Read the feedback, then improve it.`);
              ctx.persist();
              render('[data-feedback]');
            },
          }),
        ),
      );
    };

    const feedbackPanel = () => {
      const n = need(st)!;
      const first = st.first!;
      const r = rubric(first, n.category);
      return h(
        'div',
        { class: 'explain-card feedback-card', 'data-feedback': true, tabindex: -1 },
        h('img', { class: 'warn-portrait', src: portraitURL(npcById(n.from)!, 'thinking'), alt: `${NEIGHBOR_NAME[n.from]}, thinking` }),
        h(
          'div',
          { class: 'explain-body' },
          h('p', {}, h('strong', { text: `${NEIGHBOR_NAME[n.from]} tried it: ` }), `"${TRYOUT[first.main!].finding}"`),
          h('h4', { text: 'Feedback on your first version' }),
          h(
            'ul',
            { class: 'checks' },
            ...r.map((c) => h('li', { class: c.ok ? 'ok' : 'no' }, h('span', { class: 'mark', text: c.ok ? '✓' : '!' }), h('span', {}, h('strong', { text: `${c.name}: ` }), c.note))),
          ),
        ),
      );
    };

    const reviseView = () => {
      const n = need(st)!;
      const d = st.draft;
      return h(
        'section',
        { class: 'lab-step' },
        needStrip(),
        feedbackPanel(),
        h('h3', { text: 'Improve it (revise once)' }),
        d.main
          ? group(
              `Fix what ${NEIGHBOR_NAME[n.from]} noticed`,
              TRYOUT[d.main].finding,
              ...TRYOUT[d.main].upgrades.map((u) => optButton('up', u.id, u.text, d.upgrade === u.id, () => (d.upgrade = u.id))),
            )
          : null,
        h('p', { class: 'small', text: 'You can also change any other part below, if the feedback says so.' }),
        builder(),
        h(
          'div',
          { class: 'planner-actions' },
          h('button', { class: 'btn primary', type: 'button', 'data-retest': true, text: 'Test the new version', onclick: () => retest() }),
          st.rung >= 3
            ? h('button', {
                class: 'btn',
                type: 'button',
                text: 'Fill in a suggested fix',
                onclick: () => {
                  const ex = example(n.category);
                  ex.upgrade = TRYOUT[ex.main!].upgrades.find((u) => u.ok)!.id;
                  ex.evidence = d.evidence.length ? d.evidence : ex.evidence;
                  st.draft = ex;
                  ctx.persist();
                  render('[data-retest]');
                },
              })
            : null,
        ),
      );
    };

    const retest = () => {
      const n = need(st)!;
      const d = st.draft;
      const miss = missing(d);
      if (miss.length) {
        say('try', `Still to choose: ${miss.join(', ')}.`);
        render('[data-msg]');
        return;
      }
      if (passesRevision(d, n.category)) {
        st.final = JSON.parse(JSON.stringify(d)) as Design;
        const up = upgradeFor(d)!;
        recordAttempt(ctx.learner, 'capstone', { correct: true, evidence: `Revised the project: ${up.text}` });
        ctx.sound('complete');
        say('good', `It works! ${up.why} Your project card is ready.`);
        ctx.persist();
        render('[data-msg]');
        return;
      }
      st.rung = Math.min(3, st.rung + 1);
      escalateHint(ctx.learner, 'capstone');
      ctx.sound('retry');
      const up = upgradeFor(d);
      const bad = rubric(d, n.category).find((c) => !c.ok);
      let text: string;
      if (!up) text = `First choose how to fix what ${NEIGHBOR_NAME[n.from]} noticed.`;
      else if (!up.ok) text = `${up.why} Try a different fix.`;
      else text = `${bad!.name}: ${bad!.note}`;
      recordAttempt(ctx.learner, 'capstone', { correct: false, misconception: up && !up.ok ? `fix-${up.id}` : bad ? `rubric-${bad.id}` : 'fix-missing' });
      if (st.rung >= 3) text += ' Press "Fill in a suggested fix" to see one that works.';
      say('try', text);
      ctx.persist();
      render('[data-msg]');
    };

    // ------------------------------------------------ 3. the project card
    const cardStep = () => {
      const c = projectCard(st)!;
      return h(
        'section',
        { class: 'lab-step' },
        h('h3', { text: 'Your project card' }),
        cardView(c),
        h(
          'div',
          { class: 'planner-actions' },
          h('button', { class: 'btn', type: 'button', text: 'Print', onclick: () => window.print() }),
          h('button', { class: 'btn', type: 'button', 'data-download': true, text: 'Save as a file', onclick: () => download(c) }),
          h('button', {
            class: 'btn primary',
            type: 'button',
            'data-present': true,
            disabled: st.presented,
            text: st.presented ? 'Ready for Carver' : 'Get it ready for Carver',
            onclick: () => {
              const first = !st.presented;
              st.presented = true;
              ctx.sound('complete');
              say('good', 'Your project card is ready. Take it to Carver, beside his greenhouse.');
              ctx.persist();
              render('[data-msg]');
              onPresented(first);
            },
          }),
        ),
      );
    };

    const render = (focus?: string) => {
      const cur = step(st);
      const view = { need: needView, build: buildView, revise: reviseView, card: cardStep }[cur]();
      fill(
        body,
        h(
          'ol',
          { class: 'stepper', 'aria-label': 'Project steps' },
          ...(['Need', 'Design', 'Feedback and revise', 'Project card'] as const).map((name, i) => {
            const at = ['need', 'build', 'revise', 'card'].indexOf(cur);
            return h('li', { class: i < at ? 'done' : i === at ? 'now' : '', 'aria-current': i === at ? 'step' : undefined, text: `${i + 1}. ${name}` });
          }),
        ),
        view,
        message ? h('div', { class: `feedback ${message.kind}`, role: 'status', 'data-msg': true, text: message.text }) : null,
        cur !== 'need' && !st.presented
          ? h(
              'p',
              { class: 'small restart-row' },
              h('button', {
                class: 'btn small',
                type: 'button',
                'data-restart': true,
                text: 'Start over with a different need',
                onclick: () => {
                  restart(st);
                  typedNeed = '';
                  typedCategory = null;
                  typedName = '';
                  say('good', 'Starting over. Choose a need.');
                  ctx.persist();
                  render('[data-need]');
                },
              }),
            )
          : null,
      );
      if (focus) body.querySelector<HTMLElement>(focus)?.focus();
    };

    const root = h(
      'div',
      { class: 'panel modal planner-modal project-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'proj-title' },
      h(
        'header',
        {},
        h('h2', { id: 'proj-title' }, iconImg('kit', '', 24), ' My Carver Project'),
        h('button', { class: 'btn small', type: 'button', text: 'Close (progress is saved)', onclick: () => modal.close() }),
      ),
      body,
    );
    const modal = new Modal(ctx.host, root, () => {
      ctx.sound('close');
      done();
    });
    render();
    return modal;
  });
}

// ================================================================ printable card (journal)

export function openProjectCard(ctx: RuntimeContext): Promise<void> {
  const c = projectCard(ch7State(ctx.data));
  return whenClosed((done) => {
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pcard-title', style: 'width:min(720px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'pcard-title', text: 'My project card' }),
        h(
          'div',
          { style: 'display:flex;gap:8px;flex-wrap:wrap' },
          h('button', { class: 'btn small primary', type: 'button', text: 'Print', onclick: () => window.print() }),
          c ? h('button', { class: 'btn small', type: 'button', text: 'Save as a file', onclick: () => download(c) }) : null,
          h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() }),
        ),
      ),
      h('div', { class: 'content' }, c ? cardView(c) : h('p', { text: 'Finish your project at the fair table first.' })),
    );
    const modal = new Modal(ctx.host, root, done);
    return modal;
  });
}

// ================================================================ the journey

export function openJourney(ctx: RuntimeContext): Promise<void> {
  ctx.sound('open');
  return whenClosed((done) => {
    const p = ctx.save.progress;
    const chapters = CHAPTERS.filter((c) => c.number >= 1);
    const cards = chapters.map((c) => {
      const doneCh = ctx.engine.progress(c.id).stage === 'complete';
      const card = ITEMS[REWARD_CARD[c.id] ?? ''];
      return h(
        'li',
        { class: `journey-card${doneCh ? ' done' : ''}` },
        h('span', { class: 'journey-num', text: String(c.number) }),
        h(
          'div',
          {},
          h('strong', { text: `${c.title}` }),
          h('span', { class: 'small', text: ` · ${c.subtitle}` }),
          h('p', { class: 'small', text: doneCh ? (c.reflection ?? '') : 'Not finished yet.' }),
          card && doneCh ? h('p', { class: 'small journey-reward' }, iconImg(card.icon, '', 18), ` ${card.name}`) : null,
        ),
      );
    });
    const all = chapters.every((c) => ctx.engine.progress(c.id).stage === 'complete');
    const root = h(
      'div',
      { class: 'panel modal journey-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'journey-title' },
      h('header', {}, h('h2', { id: 'journey-title' }, iconImg('star', '', 24), ' Your journey'), h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() })),
      h(
        'div',
        { class: 'content' },
        all
          ? h(
              'p',
              { class: 'journey-banner' },
              iconImg('seed', '', 28),
              h('span', {}, h('strong', { text: 'You planted every seed. ' }), 'Seven chapters: observe, learn, care for soil, invent, help, test, and now your own project.'),
            )
          : null,
        h('ol', { class: 'journey-list' }, ...cards),
        h(
          'p',
          { class: 'journey-totals' },
          h('strong', { text: 'Your totals: ' }),
          `${p.xp} XP, ${p.seeds} Seeds, ${p.inventory.length} items collected, ${ctx.save.memories.length} memories of Carver's life.`,
        ),
        all ? h('p', { class: 'small', text: 'The story is finished, but the town is still yours. Visit Carver, replay any activity, or start a new project at the fair table.' }) : null,
      ),
    );
    const modal = new Modal(ctx.host, root, () => {
      ctx.sound('close');
      done();
    });
    return modal;
  });
}
