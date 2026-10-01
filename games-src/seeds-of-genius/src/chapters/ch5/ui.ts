import { iconImg } from '../../art/icons';
import { paintPortrait } from '../../art/portraits';
import { npcById } from '../../content/npcs';
import { escalateHint, recordAttempt } from '../../learning/learnerModel';
import type { RuntimeContext } from '../../quests/runtime';
import type { Expression } from '../../quests/types';
import { h, Modal } from '../../ui/dom';
import {
  EXAMPLE,
  FARMER_ORDER,
  FARMERS,
  LOOKS_NEEDED,
  NEED_TEXT,
  OPTION_ORDER,
  OPTIONS,
  SPOTS,
  judgePlan,
  planText,
  reasonOptions,
  type FarmerId,
  type OptionId,
  type PlanResult,
  type Spot,
} from './data';
import { bothHelped, ch5State, lookedAt, type Ch5State } from './state';

function fill(el: HTMLElement, ...kids: Array<Node | null | false>): void {
  el.replaceChildren(...kids.filter((k): k is Node => !!k));
}

function whenClosed(make: (done: () => void) => Modal): Promise<void> {
  return new Promise((resolve) => {
    make(resolve);
  });
}

function portrait(id: FarmerId, expression: Expression): HTMLCanvasElement {
  const cv = paintPortrait(npcById(id)!.look, expression).toCanvas();
  cv.className = 'farmer-portrait';
  cv.setAttribute('aria-hidden', 'true');
  return cv;
}

// ================================================================ looking around

/** Look closely at one spot on a farm. */
export async function inspectSpot(ctx: RuntimeContext, spot: Spot): Promise<void> {
  const st = ch5State(ctx.data);
  const first = !st.looked.includes(spot.id);
  await ctx.say(spot.lines.map((text) => ({ speaker: 'narrator' as const, text })));
  if (!first) return;
  st.looked.push(spot.id);
  ctx.persist();
  const n = lookedAt(st, spot.farmer);
  ctx.sound('item');
  ctx.toast(`Clue added to your journal. ${FARMERS[spot.farmer].short}'s farm: ${Math.min(n, LOOKS_NEEDED)}/${LOOKS_NEEDED}`, 'info');
}

// ================================================================ the demonstration table

const HINT_2: Record<FarmerId, string> = {
  watts: 'Two problems: rain on a hill, and tired soil. Which card changes how the rows run on a slope? And which free card feeds soil with what she already has?',
  pryor: 'Two problems: tired soil, and not enough food. His field is flat, so skip anything for hills. Which free cards feed the soil, and which put food on the table?',
};

/**
 * Recommend two ideas for each farmer, check them against the report and
 * the resource map, then explain the plan to the farmer.
 */
export function openTable(ctx: RuntimeContext, onHelped: (firstTime: boolean) => void): Promise<void> {
  const st = ch5State(ctx.data);
  ctx.sound('open');

  return whenClosed((done) => {
    const body = h('div', { class: 'content table-body' });
    let who: FarmerId = FARMER_ORDER.find((f) => !st.explained[f]) ?? 'watts';
    let result: PlanResult | null = null;
    let message: { kind: 'good' | 'try'; text: string } | null = null;
    let reasonMsg: { kind: 'good' | 'try'; text: string } | null = null;
    /** The farmer who is offering to pay right now. */
    let paying: FarmerId | null = null;

    const switcher = () =>
      h(
        'div',
        { class: 'farmer-tabs', role: 'group', 'aria-label': 'Choose a farmer' },
        ...FARMER_ORDER.map((f) =>
          h(
            'button',
            {
              class: `btn small opt${who === f ? ' on' : ''}`,
              type: 'button',
              'aria-pressed': who === f ? 'true' : 'false',
              'data-farmer': f,
              onclick: () => {
                who = f;
                result = null;
                message = null;
                reasonMsg = null;
                render(`[data-farmer="${f}"]`);
              },
            },
            `${FARMERS[f].short}${st.explained[f] ? ' ✓' : ''}`,
          ),
        ),
      );

    const report = (f: FarmerId) => {
      const fm = FARMERS[f];
      const notes = SPOTS.filter((s) => s.farmer === f && st.looked.includes(s.id));
      return h(
        'div',
        { class: 'report-strip' },
        h(
          'div',
          { class: 'report-col' },
          h('h3', {}, iconImg('report', '', 22), ` ${fm.short}'s report`),
          h('p', {}, h('strong', { text: 'Problems: ' }), fm.needs.map((n) => NEED_TEXT[n]).join('; '), '.'),
          h('p', {}, h('strong', { text: 'Has: ' }), `${fm.has}. `, fm.limits),
          notes.length ? h('ul', { class: 'notebook-list small' }, ...notes.map((s) => h('li', { text: s.note.replace(/^\w+: /, '') }))) : null,
        ),
        h(
          'div',
          { class: 'report-col map-col' },
          h('h3', {}, iconImg('map', '', 22), ' Resource map'),
          h('p', {}, h('strong', { text: 'Free: ' }), 'creek muck, leaf piles, cowpea seeds at the Saturday seed swap, the canning day at Miss Lottie\'s kitchen.'),
          h('p', {}, h('strong', { text: 'Costs money: ' }), 'store fertilizer ($12 a sack). Quarry stone is free but far and heavy.'),
        ),
      );
    };

    const cards = (f: FarmerId) => {
      const picks = st.draft[f];
      const locked = st.plan[f] !== null;
      return h(
        'ul',
        { class: 'rec-cards', 'aria-label': 'Recommendation cards. Pick two.' },
        ...OPTION_ORDER.map((id) => {
          const o = OPTIONS[id];
          const on = picks.includes(id);
          return h(
            'li',
            {},
            h(
              'button',
              {
                class: `rec-card${on ? ' on' : ''}${o.tempting ? ' tempting' : ''}`,
                type: 'button',
                'aria-pressed': on ? 'true' : 'false',
                'data-rec': id,
                disabled: locked,
                onclick: () => toggle(id),
              },
              h('span', { class: 'rec-title' }, iconImg(o.icon, '', 24), h('strong', { text: o.name })),
              h('span', { class: 'rec-text', text: o.text }),
              h('span', { class: 'rec-cost', text: o.cost }),
              h('span', { class: 'rec-pick', text: on ? '✓ Picked' : 'Pick' }),
            ),
          );
        }),
      );
    };

    const resultCard = (r: PlanResult) =>
      h(
        'div',
        { class: `result-card${r.passes ? ' pass' : ''}`, 'data-result': true },
        h('p', { class: 'verdict', text: r.summary }),
        h(
          'ul',
          { class: 'checks' },
          ...r.picks.map((p) =>
            h(
              'li',
              { class: p.verdict === 'fits' ? 'ok' : 'no' },
              h('span', { class: 'mark', text: p.verdict === 'fits' ? '✓' : '✗' }),
              h('span', {}, h('strong', { text: `${OPTIONS[p.id].name}: ` }), p.why),
            ),
          ),
          ...r.missing.map((n) =>
            h('li', { class: 'no' }, h('span', { class: 'mark', text: '?' }), h('span', {}, h('strong', { text: 'Still a problem: ' }), `${NEED_TEXT[n]}.`)),
          ),
        ),
      );

    const explain = (f: FarmerId) => {
      const fm = FARMERS[f];
      if (st.explained[f]) return helpedCard(f);
      return h(
        'div',
        { class: 'explain-card' },
        portrait(f, 'curious'),
        h(
          'div',
          { class: 'explain-body' },
          h('p', { class: 'explain-say' }, h('strong', { text: `${fm.short}: ` }), `"So you think I should ${planText(st.plan[f]!)}? Why those two?"`),
          h(
            'div',
            { class: 'reason-list', role: 'group', 'aria-label': `Explain your plan to ${fm.short}` },
            ...reasonOptions(f).map((o) =>
              h('button', { class: 'btn small reason', type: 'button', 'data-reason': o.id, text: o.text, onclick: () => giveReason(f, o.id) }),
            ),
          ),
          reasonMsg ? h('div', { class: `feedback ${reasonMsg.kind}`, role: 'status', 'data-reason-msg': true, text: reasonMsg.text }) : null,
        ),
      );
    };

    const helpedCard = (f: FarmerId) => {
      const fm = FARMERS[f];
      const thanked = paying !== f;
      return h(
        'div',
        { class: 'explain-card helped' },
        portrait(f, 'smile'),
        h(
          'div',
          { class: 'explain-body' },
          h('p', { class: 'explain-say' }, h('strong', { text: `${fm.short}: ` }), f === 'watts'
            ? '"Rows across the hill... Why didn\'t anybody tell me that before? I can start this week, on my own. Thank you, child."'
            : '"Greens for the children and better soil, and I don\'t owe anybody a cent for it. That\'s the best news I\'ve had all year."'),
          h('div', { class: 'benefit', role: 'note' }, h('strong', { text: 'Who benefits: ' }), fm.benefits),
          thanked ? h('p', { class: 'small', text: `You helped for free, the way neighbors do. ${bothHelped(st) ? 'Both farmers are helped. Go tell Carver!' : 'Now help the other farmer.'}` }) : null,
        ),
      );
    };

    const toggle = (id: OptionId) => {
      const picks = st.draft[who];
      if (picks.includes(id)) st.draft[who] = picks.filter((p) => p !== id);
      else if (picks.length >= 2) {
        message = { kind: 'try', text: 'Two cards per farmer. Take one card off first, then pick another.' };
        render(`[data-rec="${id}"]`);
        return;
      } else st.draft[who] = [...picks, id];
      message = null;
      result = null;
      ctx.persist();
      render(`[data-rec="${id}"]`);
    };

    const check = () => {
      const f = who;
      const picks = st.draft[f];
      if (picks.length < 2) {
        message = { kind: 'try', text: `Pick two cards for ${FARMERS[f].short} first.` };
        render('[data-msg]');
        return;
      }
      st.attempts.push({ farmer: f, picks: [...picks] });
      if (st.attempts.length > 30) st.attempts.splice(0, st.attempts.length - 30);
      result = judgePlan(f, picks);
      if (result.passes) {
        st.plan[f] = [...picks];
        recordAttempt(ctx.learner, 'help', { correct: true, evidence: `Matched ${FARMERS[f].short}'s plan to the farm's needs and resources` });
        ctx.sound('correct');
        message = { kind: 'good', text: `That plan fits! Now explain it to ${FARMERS[f].short}.` };
      } else {
        const bad = result.picks.find((p) => p.verdict !== 'fits');
        st.rung[f] = Math.min(3, st.rung[f] + 1);
        recordAttempt(ctx.learner, 'help', { correct: false, misconception: bad ? `rec-${bad.id}` : 'rec-missing-need' });
        escalateHint(ctx.learner, 'help');
        ctx.sound('retry');
        const fm = FARMERS[f];
        const hint =
          st.rung[f] === 1
            ? `Look at ${fm.short}'s report: ${fm.pronoun.they} wrote down ${fm.needs.length} problems, ${fm.needs.map((n) => NEED_TEXT[n]).join(' and ')}. Does each one have a card that fixes it with free things?`
            : st.rung[f] === 2
              ? HINT_2[f]
              : `Worked example: for ${fm.short}, ${planText(EXAMPLE[f])} fits. Press "Fill in the example" to try it.`;
        message = { kind: 'try', text: `Good thinking to check! ${hint}` };
      }
      ctx.persist();
      render('[data-result]');
    };

    const giveReason = (f: FarmerId, id: string) => {
      const o = reasonOptions(f).find((x) => x.id === id)!;
      recordAttempt(ctx.learner, 'help', o.ok ? { correct: true, evidence: `Explained the plan to ${FARMERS[f].short}` } : { correct: false, misconception: `reason-${id}` });
      if (!o.ok) {
        ctx.sound('retry');
        reasonMsg = { kind: 'try', text: o.feedback };
        render('[data-reason-msg]');
        return;
      }
      const firstTime = !st.explained[f];
      st.explained[f] = true;
      reasonMsg = null;
      message = null;
      paying = firstTime ? f : null;
      ctx.sound('complete');
      finish(firstTime);
      render();
      if (firstTime) offerPay(f);
    };

    /** The farmer tries to pay; the player helps for free. */
    const offerPay = (f: FarmerId) => {
      const fm = FARMERS[f];
      const card = body.querySelector('.helped .explain-body');
      if (!card) return;
      const offer = h(
        'div',
        { class: 'pay-offer', 'data-pay': true },
        h('p', { text: f === 'watts' ? '"Let me pay you for your trouble. Here, take my three dollars."' : '"I can\'t pay you now, but I\'ll owe you. What do I owe you?"' }),
        h(
          'div',
          { class: 'reason-list' },
          h('button', { class: 'btn small primary', type: 'button', text: 'No thanks. Neighbors help neighbors.', 'data-decline': true, onclick: () => decline() }),
          h('button', {
            class: 'btn small',
            type: 'button',
            text: f === 'watts' ? 'Keep it for seeds and your garden.' : 'Nothing. Just pass the favor on to a neighbor someday.',
            onclick: () => decline(),
          }),
        ),
      );
      const decline = () => {
        paying = null;
        offer.replaceWith(
          h('p', { class: 'small', role: 'status', text: `${fm.short} smiles. "Then I'll pass it on." You helped for free, the way neighbors do. ${bothHelped(st) ? 'Both farmers are helped. Go tell Carver!' : 'Now help the other farmer.'}` }),
        );
      };
      card.append(offer);
      (offer.querySelector('[data-decline]') as HTMLElement | null)?.focus();
    };

    const finish = (firstTime: boolean) => {
      if (firstTime && ctx.grantBonus(`ch5-helped-${who}`, 0, 10)) ctx.toast(`+10 XP for helping ${FARMERS[who].short}`, 'reward');
      ctx.persist();
      if (bothHelped(st)) onHelped(firstTime);
    };

    const guidance = (): string => {
      const f = who;
      if (bothHelped(st)) return 'You helped both neighbors. Take the news to Carver in town.';
      if (st.explained[f]) return `${FARMERS[f].short} is helped. Switch to ${FARMERS[f === 'watts' ? 'pryor' : 'watts'].short} at the top.`;
      if (st.plan[f]) return `Explain your plan to ${FARMERS[f].short}.`;
      return `Pick the two ideas that fix ${FARMERS[f].short}'s problems with things ${FARMERS[f].pronoun.they} can really do, then press "Check this plan".`;
    };

    const render = (focus?: string) => {
      const f = who;
      const planned = st.plan[f] !== null;
      fill(
        body,
        switcher(),
        report(f),
        h('h3', { class: 'rec-head', text: planned ? `Your plan for ${FARMERS[f].short}` : `Pick two ideas for ${FARMERS[f].short}` }),
        cards(f),
        planned
          ? null
          : h(
              'div',
              { class: 'planner-actions' },
              h('button', { class: 'btn primary', type: 'button', text: 'Check this plan', 'data-check': true, onclick: () => check() }),
              st.rung[f] >= 3
                ? h('button', {
                    class: 'btn',
                    type: 'button',
                    text: 'Fill in the example',
                    onclick: () => {
                      st.draft[f] = [...EXAMPLE[f]];
                      result = null;
                      ctx.persist();
                      render('[data-check]');
                    },
                  })
                : null,
            ),
        result ? resultCard(result) : null,
        message ? h('div', { class: `feedback ${message.kind}`, role: 'status', 'data-msg': true, text: message.text }) : null,
        planned ? explain(f) : null,
        h('p', { class: 'next-hint', 'data-next': true, text: guidance() }),
      );
      if (focus) body.querySelector<HTMLElement>(focus)?.focus();
    };

    const root = h(
      'div',
      { class: 'panel modal planner-modal table-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'table-title' },
      h(
        'header',
        {},
        h('h2', { id: 'table-title' }, iconImg('map', '', 24), ' Demonstration table'),
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

// ================================================================ printable card

export function openInterviewCard(ctx: RuntimeContext): Promise<void> {
  return whenClosed((done) => {
    const box = (label: string) => h('div', { class: 'pc-box' }, h('div', { class: 'pc-label', text: label }), h('div', { class: 'pc-lines short' }));
    const card = h(
      'div',
      { class: 'print-card' },
      h('h2', { text: 'My Growing-Need Interview' }),
      h('p', { text: 'Ask a family member, neighbor or teacher about growing food or plants. Write or draw their answers.' }),
      h('div', { class: 'pc-grid jc-pair' }, box('Who I talked to'), box('What do you grow, or wish you could grow?')),
      h('div', { class: 'pc-grid jc-pair' }, box('What makes it hard?'), box('What do you already have that could help?')),
      box('One idea I could suggest (and why it fits them)'),
      h('p', { class: 'pc-tip', text: 'Only interview people you know, with a grown-up nearby.' }),
      h('p', { class: 'pc-foot', text: 'Seeds of Genius · Chapter 5: Science for the People. Doing this card is optional.' }),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'iv-title', style: 'width:min(720px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'iv-title', text: 'Off-screen activity' }),
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

export type { Ch5State };
