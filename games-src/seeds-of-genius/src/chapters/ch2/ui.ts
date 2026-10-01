import { iconImg } from '../../art/icons';
import { PAINT_H, PAINT_W, paintingCanvas } from '../../art/sceneArt';
import { escalateHint, recordAttempt } from '../../learning/learnerModel';
import type { RuntimeContext } from '../../quests/runtime';
import { h, Modal } from '../../ui/dom';
import { BARRIERS, FINALE, STAGES, SUPPORTS, stageById, type Pick, type Stage } from './data';
import { ch2State, isCorrect, lockNextCard, moveCard, rightPlaces, type Ch2State } from './state';

/** Replace an element's children, skipping empty slots. */
function fill(el: HTMLElement, ...kids: Array<Node | null>): void {
  el.replaceChildren(...kids.filter((k): k is Node => k !== null));
}

/** Resolve when a modal closes. */
function whenClosed(make: (done: () => void) => Modal): Promise<void> {
  return new Promise((resolve) => {
    make(resolve);
  });
}

function painting(art: string, label: string): HTMLCanvasElement {
  const view = document.createElement('canvas');
  view.width = PAINT_W;
  view.height = PAINT_H;
  view.getContext('2d')!.drawImage(paintingCanvas(art), 0, 0);
  view.className = 'painting memory-painting';
  view.setAttribute('role', 'img');
  view.setAttribute('aria-label', label);
  return view;
}

const SOURCE_NOTE = 'The pictures are imagined. The facts come from the National Park Service.';

/** The short, plain note shown before a display about racism. */
export const RACISM_NOTE =
  'This part of the story is about racism: people treating George unfairly because he was Black. It was never his fault.';

function hasRecord(ctx: RuntimeContext): boolean {
  return ctx.engine.hasItem('school_record');
}
function hasSketch(ctx: RuntimeContext): boolean {
  return ctx.engine.hasItem('botanical_sketch');
}

/** The clue lines a display (or a timeline card) can show right now. */
export function clueLines(ctx: RuntimeContext, stage: Stage): string[] {
  const out: string[] = [];
  if (stage.recordDate)
    out.push(hasRecord(ctx) ? `Ms. Nelson's records: ${stage.recordDate}.` : "Ms. Nelson's records have a date for this one.");
  if (stage.clue) out.push(stage.clue);
  if (stage.sketchClue && hasSketch(ctx)) out.push(stage.sketchClue);
  return out;
}

// ================================================================ a storybook display

/**
 * One storybook display in the schoolhouse. Displays about racism open with
 * a short note and a choice to read now or skip for now. Skipping still
 * counts as a visit, so no one is forced through it to finish the chapter.
 */
export function viewDisplay(ctx: RuntimeContext, stage: Stage): Promise<void> {
  const st = ch2State(ctx.data);
  ctx.sound('open');
  const visit = () => {
    if (!st.visited.includes(stage.id)) st.visited.push(stage.id);
    ctx.persist();
  };

  return whenClosed((done) => {
    const titleId = `disp-${stage.id}`;
    const body = h('div', { class: 'content' });
    const showStory = () => {
      visit();
      st.skipped = st.skipped.filter((id) => id !== stage.id);
      ctx.persist();
      const clues = clueLines(ctx, stage);
      fill(body, 
        painting(stage.art, `Illustration: ${stage.title}`),
        h('p', { class: 'memory-caption', text: stage.caption }),
        clues.length
          ? h('div', { class: 'clue-box' }, h('strong', { text: 'Timeline clues' }), h('ul', {}, ...clues.map((c) => h('li', { text: c }))))
          : null,
        h(
          'div',
          { class: 'memory-nav' },
          h('span', { class: 'small', text: `${st.visited.length} of ${STAGES.length} displays visited` }),
          h('button', { class: 'btn small primary', type: 'button', 'data-autofocus': true, text: 'Back to the schoolhouse', onclick: () => modal.close() }),
        ),
        h('p', { class: 'small memory-note', text: SOURCE_NOTE }),
      );
      (body.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
    };
    const showNote = () => {
      const again = st.skipped.includes(stage.id);
      fill(body, 
        h(
          'div',
          { class: 'content-note', role: 'note' },
          h('strong', { text: 'A note before you read' }),
          h('p', { text: RACISM_NOTE }),
          h('p', {
            class: 'small',
            text: again
              ? 'You skipped this display earlier. You can read it now, or keep going without it.'
              : 'You can read it now, or skip it for now and come back any time. Skipping still counts as a visit.',
          }),
          h(
            'div',
            { class: 'note-actions' },
            h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, text: 'Read this display', onclick: () => showStory() }),
            h('button', {
              class: 'btn',
              type: 'button',
              text: 'Skip for now',
              onclick: () => {
                visit();
                if (!st.skipped.includes(stage.id)) st.skipped.push(stage.id);
                ctx.persist();
                ctx.toast('Skipped for now. The display will be here if you want to come back.', 'info');
                modal.close();
              },
            }),
          ),
        ),
      );
    };

    const root = h(
      'div',
      { class: 'panel modal memory-modal display-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
      h(
        'header',
        {},
        h(
          'div',
          {},
          h('span', { class: 'badge history', text: "A memory from Carver's life" }),
          h('h2', { id: titleId, text: stage.title }),
          h('p', { class: 'memory-setting', text: stage.place }),
        ),
        h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() }),
      ),
      body,
    );
    const modal = new Modal(ctx.host, root, () => {
      ctx.sound('close');
      done();
    });
    if (stage.sensitive) showNote();
    else showStory();
    return modal;
  });
}

// ================================================================ the timeline activity

const HINTS = {
  1: "Hint: start with the cards that have dates from Ms. Nelson's records and put those in order. Then use each card's clue to fit the others around them.",
  2: 'Hint: I moved the first card that was out of place to where it belongs and locked it.',
  3: 'Worked example: every card now shows where it goes. The dated cards run 1870s, about 1885, 1890, then 1891 to 1896. "Neosho" comes right after reading at home, and "Kansas" right after Neosho.',
} as const;

/**
 * Ms. Nelson's chalkboard: put the six stages in order, then name one
 * barrier and one support. Progress is saved after every move, so closing
 * or reloading picks up at the same screen.
 */
export function buildTimeline(ctx: RuntimeContext, onFinished: (firstTime: boolean) => void): Promise<void> {
  const st = ch2State(ctx.data);
  // Replaying after finishing: start a fresh shuffle but keep the answers.
  if (st.phase === 'done') {
    st.phase = 'order';
    st.locked = 0;
    st.rung = 0;
    st.wrongPicks = [];
    st.order = [...st.order].reverse();
    ctx.persist();
  }
  const replay = !!(st.barrier && st.support);
  ctx.sound('open');

  return whenClosed((done) => {
    const body = h('div', { class: 'content timeline-body' });
    const heading = h('h2', { id: 'tl-title' });
    let feedback: { kind: 'good' | 'try'; text: string } | null = null;
    let focusAfter: string | null = null;

    const fb = () => (feedback ? h('div', { class: `feedback ${feedback.kind}`, role: 'status', text: feedback.text }) : null);

    // ------------------------------------------------ order
    const renderOrder = () => {
      heading.textContent = 'Put the journey in order';
      const list = h('ol', { class: 'timeline-list', 'aria-label': 'Your timeline, earliest first' });
      st.order.forEach((id, i) => {
        const s = stageById(id)!;
        const locked = i < st.locked;
        const place = (dir: -1 | 1, label: string, key: string) =>
          h('button', {
            class: 'btn small',
            type: 'button',
            text: label,
            'data-key': `${id}:${key}`,
            'aria-label': `${label}: ${s.title}`,
            disabled: locked || (dir === -1 ? i - 1 < st.locked : i === st.order.length - 1),
            onclick: () => {
              if (moveCard(st, i, dir)) {
                ctx.sound('item');
                feedback = null;
                focusAfter = `${id}:${key}`;
                ctx.persist();
                render();
              }
            },
          });
        const clues = clueLines(ctx, s).filter((c) => st.visited.includes(id) || c.startsWith("Ms. Nelson's records:"));
        list.append(
          h(
            'li',
            { class: `timeline-card${locked ? ' locked' : ''}`, 'data-stage': id },
            h('span', { class: 'tl-num', 'aria-hidden': 'true', text: String(i + 1) }),
            h(
              'div',
              { class: 'tl-text' },
              h('span', {}, h('strong', { text: s.title }), h('span', { class: 'small tl-place', text: s.place })),
              ...clues.map((c) => h('span', { class: 'tl-clue', text: c })),
              !st.visited.includes(id) ? h('span', { class: 'tl-clue', text: 'Visit this display to see its clue.' }) : null,
              st.rung >= 3 ? h('span', { class: 'tl-goes', text: `Goes at number ${s.order}` }) : null,
            ),
            locked
              ? h('span', { class: 'tl-lock' }, iconImg('lock', 'Locked in place', 18), ' Locked')
              : h('div', { class: 'tl-actions' }, place(-1, 'Move up', 'up'), place(1, 'Move down', 'down')),
          ),
        );
      });
      list.append(
        h(
          'li',
          { class: 'timeline-card finale' },
          h('span', { class: 'tl-num', 'aria-hidden': 'true' }, iconImg('star', '', 18)),
          h(
            'div',
            { class: 'tl-text' },
            h('strong', { text: `${FINALE.title} (the end of this journey)` }),
            h('span', { class: 'small', text: `${FINALE.place} · ${FINALE.date}` }),
          ),
        ),
      );
      fill(body, 
        h('p', { class: 'tl-intro', text: 'Earliest at the top. Use the dates from the school records and the clues from the displays.' }),
        list,
        fb(),
        h('div', { class: 'tl-footer' }, h('button', { class: 'btn primary', type: 'button', text: 'Check my order', 'data-check': true, onclick: () => check() })),
      );
    };

    const check = () => {
      if (isCorrect(st.order)) {
        recordAttempt(ctx.learner, 'journey', { correct: true, evidence: 'Put the six stages of Carver\'s education in order' });
        ctx.sound('correct');
        st.phase = 'barrier';
        feedback = {
          kind: 'good',
          text:
            st.checks === 0
              ? 'Every card is in the right place, first try! Now look at the journey as a whole.'
              : 'Every card is in the right place! Now look at the journey as a whole.',
        };
        ctx.persist();
        render();
        return;
      }
      st.checks += 1;
      st.rung = Math.min(3, st.rung + 1);
      escalateHint(ctx.learner, 'journey');
      recordAttempt(ctx.learner, 'journey', { correct: false, misconception: 'timeline-order' });
      ctx.sound('retry');
      let hint: string = HINTS[st.rung as 1 | 2 | 3];
      if (st.rung === 2) {
        const moved = lockNextCard(st);
        if (moved) hint = `Hint: I moved "${stageById(moved)!.title}" to where it belongs and locked it.`;
      }
      const n = rightPlaces(st.order);
      feedback = { kind: 'try', text: `Not quite yet: ${n} of ${STAGES.length} cards are in the right place. ${hint}` };
      ctx.persist();
      render();
      body.querySelector('.feedback')?.scrollIntoView({ block: 'nearest' });
      body.querySelector<HTMLButtonElement>('[data-check]')?.focus();
    };

    // ------------------------------------------------ barrier and support
    const renderPick = (kind: 'barrier' | 'support') => {
      const picks: Pick[] = kind === 'barrier' ? BARRIERS : SUPPORTS;
      heading.textContent = kind === 'barrier' ? 'What stood in his way?' : 'Who helped him?';
      const intro =
        kind === 'barrier'
          ? h(
              'div',
              { class: 'content-note', role: 'note' },
              h('strong', { text: 'A note about fairness' }),
              h('p', {
                text: 'Some of the barriers George faced came from racism: unfair rules and choices that treated Black people as less than others. They were wrong, even when they were the law. They were never his fault.',
              }),
            )
          : h('p', { class: 'tl-intro', text: 'A support is a person or thing that helped him keep learning.' });
      const list = h('ul', { class: 'choices' });
      picks.forEach((p, i) => {
        const wrong = st.wrongPicks.includes(p.id);
        list.append(
          h(
            'li',
            {},
            h(
              'button',
              {
                class: 'btn',
                type: 'button',
                disabled: wrong,
                'data-autofocus': i === 0 ? true : undefined,
                onclick: () => choose(kind, p),
              },
              h('span', { class: 'num', text: `${i + 1}.` }),
              ` ${p.text}${wrong ? ' (not this one)' : ''}`,
            ),
          ),
        );
      });
      fill(body, 
        h('p', { class: 'tl-intro', text: kind === 'barrier' ? 'Choose one barrier from the journey. A barrier is something that blocked him.' : 'Now choose one support from the journey.' }),
        intro,
        fb(),
        list,
      );
    };

    const choose = (kind: 'barrier' | 'support', p: Pick) => {
      if (!p.ok) {
        if (!st.wrongPicks.includes(p.id)) st.wrongPicks.push(p.id);
        recordAttempt(ctx.learner, 'journey', { correct: false, misconception: kind === 'barrier' ? 'barrier-vs-interest' : 'support-vs-barrier' });
        ctx.sound('retry');
        feedback = { kind: 'try', text: `Not quite. ${p.feedback} Try another.` };
        ctx.persist();
        render();
        return;
      }
      ctx.sound('correct');
      recordAttempt(ctx.learner, 'journey', { correct: true, evidence: kind === 'barrier' ? 'Named a barrier Carver faced' : 'Named a person who supported Carver' });
      feedback = { kind: 'good', text: p.feedback };
      if (kind === 'barrier') {
        st.barrier = p.id;
        st.phase = 'support';
      } else {
        st.support = p.id;
        st.phase = 'done';
      }
      ctx.persist();
      render();
      if (st.phase === 'done') onFinished(!replay);
    };

    // ------------------------------------------------ done
    const renderDone = () => {
      heading.textContent = 'Your journey timeline';
      const b = BARRIERS.find((x) => x.id === st.barrier);
      const s = SUPPORTS.find((x) => x.id === st.support);
      fill(body, 
        fb(),
        timelineSummary(),
        h(
          'dl',
          { class: 'tl-picks' },
          h('dt', { text: 'A barrier' }),
          h('dd', { text: b?.text ?? '' }),
          h('dt', { text: 'A support' }),
          h('dd', { text: s?.text ?? '' }),
        ),
        h('p', { class: 'tl-intro', text: replay ? 'All done again. Carver is by his garden if you want to talk.' : 'Take your timeline back to Carver and tell him what you found.' }),
        h('div', { class: 'tl-footer' }, h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, text: 'Back to the schoolhouse', onclick: () => modal.close() })),
      );
      (body.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
    };

    const render = () => {
      if (st.phase === 'order') renderOrder();
      else if (st.phase === 'barrier') renderPick('barrier');
      else if (st.phase === 'support') renderPick('support');
      else renderDone();
      if (focusAfter) {
        const el = body.querySelector<HTMLButtonElement>(`[data-key="${focusAfter}"]`);
        const alt = focusAfter.endsWith(':up') ? focusAfter.replace(':up', ':down') : focusAfter.replace(':down', ':up');
        (el && !el.disabled ? el : body.querySelector<HTMLButtonElement>(`[data-key="${alt}"]`))?.focus();
        focusAfter = null;
      } else if (st.phase === 'barrier' || st.phase === 'support') {
        body.querySelector<HTMLButtonElement>('.choices .btn:not([disabled])')?.focus();
      }
    };

    const root = h(
      'div',
      { class: 'panel modal timeline-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tl-title' },
      h('header', {}, heading, h('button', { class: 'btn small', type: 'button', text: 'Close (progress is saved)', onclick: () => modal.close() })),
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

/** The finished timeline as a plain list (panel and journal). */
export function timelineSummary(): HTMLElement {
  return h(
    'ol',
    { class: 'notebook-list journey-list' },
    ...STAGES.map((s) => h('li', {}, h('strong', { text: `${s.title}` }), ` · ${s.place}${s.recordDate ? ` · ${s.recordDate}` : ''}`)),
    h('li', {}, h('strong', { text: FINALE.title }), ` · ${FINALE.place} · ${FINALE.date}`),
  );
}

export function barrierPick(st: Ch2State): Pick | undefined {
  return BARRIERS.find((b) => b.id === st.barrier);
}
export function supportPick(st: Ch2State): Pick | undefined {
  return SUPPORTS.find((b) => b.id === st.support);
}

// ================================================================ printable Journey Card

export function openJourneyCard(ctx: RuntimeContext): Promise<void> {
  return whenClosed((done) => {
    const step = (n: number) => h('div', { class: 'pc-box jc-step' }, h('div', { class: 'pc-label', text: `Step ${n}` }), h('div', { class: 'pc-lines short' }));
    const card = h(
      'div',
      { class: 'print-card' },
      h('h2', { text: 'My Learning Journey Card' }),
      h('p', { text: 'Think of something you learned to do, like reading, riding a bike or drawing. Draw or write the steps in order.' }),
      h('div', { class: 'pc-grid jc-grid' }, step(1), step(2), step(3), step(4)),
      h(
        'div',
        { class: 'pc-grid jc-pair' },
        h('div', { class: 'pc-box' }, h('div', { class: 'pc-label' }, iconImg('star', '', 22), ' Something that was hard'), h('div', { class: 'pc-lines short' })),
        h('div', { class: 'pc-box' }, h('div', { class: 'pc-label' }, iconImg('talk', '', 22), ' Someone who helped me'), h('div', { class: 'pc-lines short' })),
      ),
      h('p', { class: 'pc-tip', text: 'Ask a grown-up about their own learning journey, too. Who helped them?' }),
      h('p', { class: 'pc-foot', text: 'Seeds of Genius · Chapter 2: Science Against the Odds. Doing this card is optional.' }),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jc-title', style: 'width:min(720px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'jc-title', text: 'Off-screen activity' }),
        h(
          'div',
          { style: 'display:flex;gap:8px' },
          h('button', { class: 'btn small primary', type: 'button', text: 'Print', onclick: () => window.print() }),
          h('button', { class: 'btn small', type: 'button', text: 'Close', onclick: () => modal.close() }),
        ),
      ),
      h('div', { class: 'content' }, card),
    );
    const modal = new Modal(ctx.host, root, done);
    return modal;
  });
}
