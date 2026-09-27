import { iconImg } from '../../art/icons';
import { PAINT_H, PAINT_W, paintingCanvas } from '../../art/sceneArt';
import { escalateHint, recordAttempt } from '../../learning/learnerModel';
import type { RuntimeContext } from '../../quests/runtime';
import { h, Modal } from '../../ui/dom';
import { BENCH, REQUIRED_OBSERVATIONS, buildDeck, cardFor, shuffle, type Card, type Spot } from './data';
import { ch1State, spotState } from './state';

/** Resolve when a modal closes. */
function whenClosed(make: (done: () => void) => Modal): Promise<void> {
  return new Promise((resolve) => {
    make(resolve);
  });
}

// ================================================================ inspect a spot

/**
 * The close-up view of one garden spot. The player uses Theo's lens on
 * parts of the picture to reveal details, then chooses the notebook entry
 * that states exactly what they saw.
 */
export function inspectSpot(ctx: RuntimeContext, spot: Spot): Promise<void> {
  const st = ch1State(ctx.data);
  const ss = spotState(st, spot.id);
  ctx.sound('open');

  return whenClosed((done) => {
    const titleId = `spot-${spot.id}`;
    const paint = paintingCanvas(spot.art);
    const view = document.createElement('canvas');
    view.width = PAINT_W;
    view.height = PAINT_H;
    view.getContext('2d')!.drawImage(paint, 0, 0);
    view.className = 'painting';
    view.setAttribute('role', 'img');
    view.setAttribute('aria-label', `A close look at: ${spot.title}`);

    const lens = document.createElement('canvas');
    lens.width = 120;
    lens.height = 120;
    lens.className = 'lens-view';
    lens.setAttribute('aria-hidden', 'true');
    const lensText = h('p', { class: 'lens-text', 'aria-live': 'polite', text: 'Choose a part of the picture to look at it through the lens.' });
    const noticed = h('ul', { class: 'noticed' });
    const zonesWrap = h('div', { class: 'paint-wrap' }, view);
    const zoneButtons: HTMLButtonElement[] = [];

    const drawLens = (z: Spot['zones'][number]) => {
      const g = lens.getContext('2d')!;
      g.imageSmoothingEnabled = false;
      g.clearRect(0, 0, 120, 120);
      g.save();
      g.beginPath();
      g.arc(60, 60, 56, 0, Math.PI * 2);
      g.clip();
      const size = Math.max(z.w, z.h) + 6;
      const cx = z.x + z.w / 2;
      const cy = z.y + z.h / 2;
      g.fillStyle = '#e8dcc0';
      g.fillRect(0, 0, 120, 120);
      g.drawImage(paint, cx - size / 2, cy - size / 2, size, size, 0, 0, 120, 120);
      g.restore();
      g.lineWidth = 6;
      g.strokeStyle = '#5b5f6b';
      g.beginPath();
      g.arc(60, 60, 56, 0, Math.PI * 2);
      g.stroke();
    };

    const renderNoticed = () => {
      noticed.replaceChildren(
        ...spot.zones.filter((z) => ss.looked.includes(z.id)).map((z) => h('li', { text: z.detail })),
      );
    };

    spot.zones.forEach((z) => {
      const btn = h('button', {
        class: 'zone',
        type: 'button',
        'aria-label': z.label,
        style: `left:${(z.x / PAINT_W) * 100}%;top:${(z.y / PAINT_H) * 100}%;width:${(z.w / PAINT_W) * 100}%;height:${(z.h / PAINT_H) * 100}%`,
        onclick: () => {
          drawLens(z);
          lensText.textContent = z.detail;
          if (!ss.looked.includes(z.id)) ss.looked.push(z.id);
          btn.classList.add('seen');
          renderNoticed();
          write.hidden = false;
          ctx.persist();
        },
      });
      if (ss.looked.includes(z.id)) btn.classList.add('seen');
      zoneButtons.push(btn);
      zonesWrap.append(btn);
    });

    // ---- the notebook entry
    const feedback = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
    const options = shuffle(
      [
        { kind: 'obs' as const, text: spot.observation.text },
        { kind: 'vague' as const, text: spot.vague.text },
        { kind: 'guess' as const, text: spot.guess.text },
      ],
      st.seed + spot.id.length * 13,
    );
    const optionList = h('ul', { class: 'choices' });
    const optionButtons: HTMLButtonElement[] = [];
    options.forEach((o, i) => {
      const b = h(
        'button',
        { class: 'btn', type: 'button', onclick: () => choose(i) },
        h('span', { class: 'num', text: `${i + 1}` }),
        h('span', { text: o.text }),
      );
      optionButtons.push(b);
      optionList.append(h('li', {}, b));
    });

    const write = h(
      'div',
      { class: 'write', hidden: ss.looked.length === 0 && !ss.recorded },
      h('h3', {}, iconImg('notebook', '', 22), ' Write it in your notebook'),
      h('p', { class: 'small', text: 'Choose the entry that says exactly what you saw.' }),
      optionList,
      feedback,
    );

    const backBtn = h('button', { class: 'btn small', type: 'button', text: 'Back to the garden', onclick: () => modal.close() });
    const showRecorded = () => {
      optionButtons.forEach((b) => (b.disabled = true));
      const idx = options.findIndex((o) => o.kind === 'obs');
      optionButtons[idx].classList.add('picked');
      // The focused button was just disabled; keep keyboard focus in the panel.
      if (root && !root.contains(document.activeElement)) backBtn.focus();
    };

    const choose = (i: number) => {
      const o = options[i];
      feedback.hidden = false;
      if (o.kind === 'obs') {
        recordAttempt(ctx.learner, 'observe', { correct: true, evidence: `Wrote: "${o.text}"` });
        ss.recorded = true;
        if (!st.observations.some((x) => x.spot === spot.id)) st.observations.push({ spot: spot.id, text: o.text });
        ctx.sound('correct');
        feedback.className = 'feedback good';
        const count = st.observations.length;
        let msg = `Recorded in your notebook! That's a specific observation: it names ${spot.observation.details
          .map((d) => `"${d}"`)
          .join(' and ')}.`;
        if (spot.fact) msg += ` Fun fact: ${spot.fact}`;
        if (count === REQUIRED_OBSERVATIONS) msg += ` You have ${count} observations. Sort them at Hattie's potting bench, or keep exploring.`;
        feedback.textContent = msg;
        if (spot.bonus && ctx.grantBonus(`ch1:bonus:${spot.id}`, 3, 10)) {
          if (!st.bonus.includes(spot.id)) st.bonus.push(spot.id);
          ctx.toast('Bonus find! +3 Seeds, +10 XP', 'reward');
        }
        showRecorded();
        ctx.persist();
        return;
      }
      // Wrong: explain, then climb the hint ladder (notice → narrow → example).
      ss.tries += 1;
      recordAttempt(ctx.learner, 'observe', {
        correct: false,
        misconception: o.kind === 'guess' ? 'guess-as-observation' : 'vague-observation',
      });
      escalateHint(ctx.learner, 'observe');
      ctx.sound('retry');
      feedback.className = 'feedback try';
      const why = o.kind === 'guess' ? spot.guess.feedback : spot.vague.feedback;
      // Each spot has two wrong entries: the first mistake highlights the
      // details to check; the second (by then only one entry is left)
      // shows it as a worked example.
      let hint = '';
      if (ss.tries === 1) {
        hint = 'Hint: the glowing parts of the picture show details you can check. Which entry names them?';
        zoneButtons.forEach((z) => z.classList.add('glow'));
      } else {
        const idx = options.findIndex((x) => x.kind === 'obs');
        optionButtons[idx].classList.add('worked');
        hint = `Worked example: the marked entry names things you can check, ${spot.observation.details
          .map((d) => `"${d}"`)
          .join(' and ')}. That's what makes it an observation.`;
      }
      optionButtons[i].disabled = true;
      feedback.textContent = `${why} ${hint}`;
      ctx.persist();
    };

    let root!: HTMLElement;
    if (ss.recorded) {
      feedback.hidden = false;
      feedback.className = 'feedback good';
      feedback.textContent = 'Already in your notebook. You can look again as much as you like.';
      showRecorded();
    }
    renderNoticed();

    root = h(
      'div',
      { class: 'panel modal inspect-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
      h(
        'header',
        {},
        h('h2', { id: titleId }, iconImg('lens', '', 24), ` ${spot.title}`),
        backBtn,
      ),
      h(
        'div',
        { class: 'content' },
        h('p', { class: 'intro', text: spot.intro }),
        h(
          'div',
          { class: 'inspect-grid' },
          zonesWrap,
          h('div', { class: 'lens-side' }, lens, lensText, h('h3', { text: 'What you noticed' }), noticed),
        ),
        write,
      ),
    );
    const modal = new Modal(ctx.host, root, () => {
      ctx.sound('close');
      done();
    });
    return modal;
  });
}

// ================================================================ sort the cards

function markText(card: Card, rung: number): Node[] {
  // Highlight checkable details (rung 1+) and guess words (rung 2+).
  const marks: Array<{ word: string; cls: string }> = [];
  if (rung >= 1) card.details.forEach((w) => marks.push({ word: w, cls: 'mark-detail' }));
  if (rung >= 2) card.guessWords.forEach((w) => marks.push({ word: w, cls: 'mark-guess' }));
  let parts: Node[] = [document.createTextNode(card.text)];
  for (const m of marks) {
    const next: Node[] = [];
    for (const p of parts) {
      if (!(p instanceof Text)) {
        next.push(p);
        continue;
      }
      const t = p.data;
      const i = t.toLowerCase().indexOf(m.word.toLowerCase());
      if (i < 0) {
        next.push(p);
        continue;
      }
      next.push(document.createTextNode(t.slice(0, i)));
      next.push(h('mark', { class: m.cls, text: t.slice(i, i + m.word.length) }));
      next.push(document.createTextNode(t.slice(i + m.word.length)));
    }
    parts = next;
  }
  return parts;
}

/**
 * "Observation or Guess?" Hattie's card game. Wrong placements get an
 * explanation and the next hint: 1) highlight details you can check,
 * 2) highlight words that give guesses away, 3) a worked example.
 * Progress is saved after every card, so a reload resumes mid-game.
 */
export function sortCards(ctx: RuntimeContext, onFinished: (mistakes: number, firstTime: boolean) => void): Promise<void> {
  const st = ch1State(ctx.data);
  if (!st.sort || st.sort.done) {
    st.rounds += st.sort?.done ? 1 : 0;
    st.sort = {
      deck: buildDeck(
        st.observations.map((o) => o.spot).filter((id) => !id.startsWith('snail') && !id.startsWith('mushrooms')),
        st.seed + st.rounds * 101,
      ),
      placed: {},
      mistakes: 0,
      rung: 0,
      done: false,
    };
    ctx.persist();
  }
  const sort = st.sort;
  ctx.sound('open');

  return whenClosed((done) => {
    const progress = h('p', { class: 'sort-progress', 'aria-live': 'polite' });
    const cardsEl = h('ul', { class: 'sort-cards' });
    const obsBasket = h('ul', { class: 'basket-list' });
    const guessBasket = h('ul', { class: 'basket-list' });
    const feedback = h('div', { class: 'feedback', hidden: true, 'aria-live': 'polite' });
    let workedCard: string | null = null;

    const render = () => {
      const remaining = sort.deck.filter((id) => !sort.placed[id]);
      progress.textContent = `${sort.deck.length - remaining.length} of ${sort.deck.length} cards sorted`;
      cardsEl.replaceChildren(
        ...remaining.map((id) => {
          const c = cardFor(id)!;
          const btn = (ans: 'obs' | 'guess', label: string) =>
            h('button', {
              class: `btn small${workedCard === id && c.answer === ans ? ' worked' : ''}`,
              type: 'button',
              text: label,
              'aria-label': `${label}: ${c.text}`,
              onclick: () => place(id, ans),
            });
          return h(
            'li',
            { class: `sort-card${workedCard === id ? ' focus' : ''}` },
            h('p', {}, ...markText(c, sort.rung)),
            h('div', { class: 'sort-actions' }, btn('obs', 'Observation'), btn('guess', 'Guess')),
          );
        }),
      );
      const fill = (el: HTMLElement, ans: 'obs' | 'guess') =>
        el.replaceChildren(
          ...sort.deck.filter((id) => sort.placed[id] === ans).map((id) => h('li', {}, iconImg('check', '', 16), ` ${cardFor(id)!.text}`)),
        );
      fill(obsBasket, 'obs');
      fill(guessBasket, 'guess');
      if (!remaining.length) finish();
    };

    const place = (id: string, ans: 'obs' | 'guess') => {
      const c = cardFor(id)!;
      feedback.hidden = false;
      if (c.answer === ans) {
        sort.placed[id] = ans;
        recordAttempt(ctx.learner, 'observe', { correct: true });
        ctx.sound('correct');
        feedback.className = 'feedback good';
        feedback.textContent =
          ans === 'obs' ? `Yes, an observation: anyone could check "${c.details[0] ?? 'it'}".` : 'Yes, a guess: it says more than anyone saw.';
        if (workedCard === id) workedCard = null;
      } else {
        sort.mistakes += 1;
        sort.rung = Math.min(3, sort.rung + 1);
        recordAttempt(ctx.learner, 'observe', {
          correct: false,
          misconception: c.answer === 'guess' ? 'guess-as-observation' : 'observation-as-guess',
        });
        escalateHint(ctx.learner, 'observe');
        ctx.sound('retry');
        feedback.className = 'feedback try';
        let hint = '';
        if (sort.rung === 1) hint = 'Hint: details you can check are now highlighted in green.';
        else if (sort.rung === 2) hint = 'Hint: words that give a guess away (like "must have", "because" and "will") are now highlighted in yellow.';
        else {
          workedCard = id;
          hint = `Worked example: this card ${
            c.answer === 'guess' ? `says "${c.guessWords[0]}", which is more than anyone saw, so it is a Guess` : `names things you can check, so it is an Observation`
          }. The right button is marked.`;
        }
        feedback.textContent = `Not quite. ${c.wrongFeedback} ${hint} Try again: the card stays until it's in the right basket.`;
      }
      ctx.persist();
      render();
    };

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const firstTime = st.firstSortMistakes === null;
      sort.done = true;
      if (firstTime) st.firstSortMistakes = sort.mistakes;
      ctx.persist();
      feedback.hidden = false;
      feedback.className = 'feedback good';
      feedback.textContent =
        sort.mistakes === 0
          ? 'All sorted, and every card right the first time! Take your notebook back to Carver.'
          : `All sorted! You fixed ${sort.mistakes} card${sort.mistakes === 1 ? '' : 's'} along the way. ${firstTime ? 'Take your notebook back to Carver.' : ''}`;
      onFinished(sort.mistakes, firstTime);
    };

    const root = h(
      'div',
      { class: 'panel modal sort-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sort-title' },
      h(
        'header',
        {},
        h('h2', { id: 'sort-title', text: 'Observation or Guess?' }),
        h('button', { class: 'btn small', type: 'button', text: 'Close (progress is saved)', onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h(
          'div',
          { class: 'rule-cards' },
          h('div', { class: 'rule obs' }, h('strong', { text: 'Observation' }), h('span', { text: 'Something anyone can check right now: see it, count it, touch it.' })),
          h('div', { class: 'rule guess' }, h('strong', { text: 'Guess' }), h('span', { text: 'An idea about why, what will happen, or what happened when nobody was looking.' })),
        ),
        progress,
        feedback,
        cardsEl,
        h(
          'div',
          { class: 'baskets' },
          h('section', { class: 'basket', 'aria-label': 'Observation basket' }, h('h3', { text: 'Observations' }), obsBasket),
          h('section', { class: 'basket', 'aria-label': 'Guess basket' }, h('h3', { text: 'Guesses' }), guessBasket),
        ),
      ),
    );
    const modal = new Modal(ctx.host, root, () => {
      ctx.sound('close');
      done();
    });
    render();
    return modal;
  });
}

// ================================================================ printable activity card

export function openActivityCard(ctx: RuntimeContext): Promise<void> {
  return whenClosed((done) => {
    const box = (label: string, icon: string) =>
      h('div', { class: 'pc-box' }, h('div', { class: 'pc-label' }, iconImg(icon, '', 22), ` ${label}`), h('div', { class: 'pc-lines' }));
    const card = h(
      'div',
      { class: 'print-card' },
      h('h2', { text: 'Nature Observation Card' }),
      h('p', { text: 'Go outside with a grown-up. Find one thing for each box. Write what is there, not what you think happened.' }),
      h('div', { class: 'pc-grid' }, box('I SAW', 'lens'), box('I HEARD', 'soundOn'), box('I TOUCHED', 'leaf')),
      h('p', { class: 'pc-tip', text: 'Try to include a number, a color or a size in each one. Example: "5 white petals", not "a pretty flower".' }),
      h('p', { class: 'pc-foot', text: 'Seeds of Genius · Chapter 1: A Seed Is Planted. Doing this card is optional.' }),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pc-title', style: 'width:min(720px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'pc-title', text: 'Off-screen activity' }),
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

export { BENCH };
