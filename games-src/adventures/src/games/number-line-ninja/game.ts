import { lookFromAppearance, type CharacterLook } from '../../kit/art/characters';
import { iconImg } from '../../kit/art/icons';
import { paintPortrait, type Expression } from '../../kit/art/portraits';
import { bus } from '../../kit/core/events';
import { recordAnswer, skill, topMisconception, type SkillRules } from '../../kit/learning/mastery';
import { PixelRenderer } from '../../kit/render/pixelRenderer';
import { audio } from '../../kit/systems/audio';
import { applySettingsToDocument, settings, updateSettings } from '../../kit/systems/settings';
import { openCustomize } from '../../kit/ui/customize';
import { choose, h, Modal } from '../../kit/ui/dom';
import { openGrownups } from '../../kit/ui/grownups';
import { mountToasts, toast, Toolbar } from '../../kit/ui/hud';
import { openSettings } from '../../kit/ui/settingsPanel';
import { Talk, type Speaker } from '../../kit/ui/talk';
import { showTitle } from '../../kit/ui/title';
import { BELT_INFO, CONTROLS_TIP, GROWNUPS, OPENING, STARS_PER_BELT, cleanPraise, hintText, mistakeLine } from './content';
import { DOJO_SONG, NIGHT_SONG } from './music';
import { BELTS, checkLanding, gapOptions, makeProblem, workedHops, type BeltId, type Misconception, type Problem } from './problems';
import { freshSave, store, type NinjaSave } from './save';
import { NinjaScene } from './scene';

/** The belt rules for the learner model: tiers 1-3, mastery counted from tier 2. */
const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
/** A belt is earned with 5 stars once the player has reached tier 2, or after 14 challenges. */
const MAX_PER_BELT = 14;

const SENSEI_LOOK: CharacterLook = {
  build: 'adult',
  skin: { base: '#7a4a2e', shade: '#633b23' },
  hair: { style: 'bun', base: '#c9c6c2', shade: '#9a9692', light: '#e6e3df' },
  shirt: { base: '#2f6f6a', shade: '#245652' },
  pants: '#2e3346',
  shoes: '#3a2a22',
  accessory: 'glasses',
  accent: '#f2c94c',
  extras: { belt: '#2b2b33' },
};

const PRACTICE_SASH = '#a8977c';

type Mode = 'title' | 'busy' | 'play' | 'result';

export class Game {
  private readonly r: PixelRenderer;
  private readonly world: NinjaScene;
  private readonly talk: Talk;
  private save: NinjaSave;
  private mode: Mode = 'title';
  private problem: Problem | null = null;
  private hintRung = 0;
  private tries = 0;
  private firstResult: { correct: boolean; misconception: Misconception | null } | null = null;
  /** Each challenge is recorded once, on its first landing. */
  private recorded = false;
  private cleanCount = 0;
  /** Clean landings in a row, for the streak cheer. */
  private streak = 0;
  private last = performance.now();
  private hud!: HTMLElement;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private els!: {
    card: HTMLElement;
    beltChip: HTMLElement;
    level: HTMLElement;
    equation: HTMLElement;
    prompt: HTMLElement;
    log: HTMLElement;
    hint: HTMLElement;
    hintText: HTMLElement;
    stars: HTMLElement;
    place: HTMLElement;
    pad: HTMLElement;
    bigBack: HTMLButtonElement;
    bigFwd: HTMLButtonElement;
    result: HTMLElement;
  };
  private readonly sensei: Speaker;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    this.save = store.exists() ? store.load() : freshSave();
    this.r = new PixelRenderer(host);
    this.world = new NinjaScene(this.r);
    this.talk = new Talk(host);
    const portraits = new Map<Expression, string>();
    this.sensei = {
      name: 'Sensei Rio',
      role: 'Number line teacher',
      voice: 196,
      portrait: (e) => {
        let url = portraits.get(e);
        if (!url) portraits.set(e, (url = paintPortrait(SENSEI_LOOK, e, { elder: true }).toDataURL(3)));
        return url;
      },
    };
    audio.addSong('dojo', DOJO_SONG);
    audio.addSong('night', NIGHT_SONG);
    this.world.onHopStart = (d) => audio.hop(d > 0, Math.abs(d) > 1);
    this.world.onLand = (n) => {
      audio.land();
      this.updateLog(n);
    };
    window.addEventListener('resize', () => this.r.resize());
    window.addEventListener('keydown', (e) => this.onKey(e));
    host.addEventListener('pointerdown', (e) => this.onPointer(e));
    bus.on('settings:changed', () => {
      this.world.reducedMotion = settings.reducedMotion;
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
    });
    this.world.reducedMotion = settings.reducedMotion;
    this.buildHud();
    mountToasts(host);
    // A read-only window for the browser tests (no cheats: it cannot change the game).
    (window as unknown as { __nln: unknown }).__nln = { state: () => this.debugState(), stoneScreen: (n: number) => this.world.stoneScreen(n) };
  }

  start(): void {
    this.world.build('white', 20, this.ninjaLook(), SENSEI_LOOK);
    this.world.setProblem(makeProblem('white', 1, 1));
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.world.update(dt);
      this.world.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // ------------------------------------------------------------ looks

  private ninjaLook(): CharacterLook {
    return this.dress(lookFromAppearance(this.save.appearance));
  }

  /** The player's look plus the belt they have earned. */
  private dress = (look: CharacterLook): CharacterLook => {
    const top = this.save.earned[this.save.earned.length - 1];
    return { ...look, extras: { ...(look.extras ?? {}), belt: top ? BELT_INFO[top].color : PRACTICE_SASH } };
  };

  // ------------------------------------------------------------ title

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Number Line Ninja',
      subtitle: 'Hop, count and earn your belts',
      intro: [
        'Train with Sensei Rio by the river. The stepping stones are a number line: hop to find numbers, add, subtract and take big hops of ten.',
        'Earn five belts, from White to Black. For grades 1 to 3.',
      ],
      hasSave: store.exists(),
      continueGame: () => {
        audio.unlock();
        this.closeTitle();
        void this.enterBelt(this.save.current);
      },
      newGame: () => {
        audio.unlock();
        void this.newGame();
      },
      settings: () => openSettings(this.host, { grownups: () => this.openGrownups() }),
      grownups: () => this.openGrownups(),
    });
  }

  private closeTitle(): void {
    this.titleEl?.remove();
    this.titleEl = null;
    this.hud.hidden = false;
  }

  private async newGame(): Promise<void> {
    if (store.exists()) {
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your belts and stars in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
    }
    this.closeTitle();
    this.hud.hidden = true;
    openCustomize(this.host, this.save.appearance, { firstTime: true, noun: 'ninja', dress: this.dress }, (a) => {
      this.save.appearance = a;
      this.persist();
      this.world.ninja.setLook(this.ninjaLook());
      this.hud.hidden = false;
      void this.enterBelt('white');
    });
  }

  // ------------------------------------------------------------ belts

  private async enterBelt(belt: BeltId): Promise<void> {
    this.mode = 'busy';
    this.save.current = belt;
    this.persist();
    const info = BELT_INFO[belt];
    audio.play(belt === 'black' ? 'night' : 'dojo');
    this.hud.dataset.belt = belt;
    this.els.place.textContent = info.place;
    this.updateStars();
    this.nextProblem(false);
    if (!this.save.introduced.includes(belt)) {
      this.mode = 'busy';
      if (belt === 'white') await this.talk.say(this.sensei, OPENING);
      await this.talk.say(this.sensei, info.intro);
      if (belt === 'white') await this.talk.say(this.sensei, CONTROLS_TIP, 'curious');
      this.talk.end();
      this.save.introduced.push(belt);
      this.persist();
    } else toast(`${info.name}: ${info.skill}`);
    this.mode = 'play';
    this.focusPad();
  }

  /** Pick the next challenge for the current belt at the player's tier. */
  private nextProblem(announce = true): void {
    const belt = this.save.current;
    const p = makeProblem(belt, skill(this.save.learner, belt).tier, this.save.seed++);
    // The place changes with the belt; the black belt starts on a 0-20 line, then uses 0-100.
    if (this.world.theme.id !== belt || this.world.lineMax !== p.lineMax) this.world.build(belt, p.lineMax, this.ninjaLook(), SENSEI_LOOK);
    this.problem = p;
    this.hintRung = 0;
    this.tries = 0;
    this.firstResult = null;
    this.recorded = false;
    this.world.setProblem(p);
    this.els.result.hidden = true;
    this.els.hint.hidden = true;
    this.renderCard();
    this.persist();
    if (announce) this.mode = 'play';
  }

  private renderCard(): void {
    const p = this.problem!;
    const info = BELT_INFO[p.belt];
    this.els.beltChip.textContent = info.name;
    this.els.beltChip.style.background = info.color;
    this.els.beltChip.style.color = info.ink;
    this.els.level.textContent = `Level ${p.tier} of 3`;
    this.els.equation.textContent = p.equation;
    this.els.prompt.textContent = p.prompt;
    this.els.bigBack.hidden = this.els.bigFwd.hidden = !p.bigHop;
    this.els.bigBack.querySelector('.n')!.textContent = String(p.bigHop);
    this.els.bigFwd.querySelector('.n')!.textContent = String(p.bigHop);
    this.els.bigBack.setAttribute('aria-label', `Hop back ${p.bigHop} (Down arrow)`);
    this.els.bigFwd.setAttribute('aria-label', `Hop forward ${p.bigHop} (Up arrow)`);
    this.updateLog(p.start);
    this.els.card.classList.remove('pulse');
    void this.els.card.offsetWidth;
    if (!settings.reducedMotion) this.els.card.classList.add('pulse');
  }

  private updateLog(at: number): void {
    const p = this.problem;
    if (!p) return;
    const hops = this.world.hopsMade;
    const sum = hops.reduce((a, b) => a + b, 0);
    const parts = hops.map((d) => (d > 0 ? `+${d}` : `−${-d}`));
    this.els.log.textContent = hops.length
      ? `On ${at}. Hops: ${parts.join(' ')} (${sum >= 0 ? '+' : '−'}${Math.abs(sum)} in all)`
      : `On ${at}. No hops yet.`;
  }

  private updateStars(): void {
    const belt = this.save.current;
    const n = this.save.stars[belt];
    this.els.stars.replaceChildren(
      ...Array.from({ length: STARS_PER_BELT }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 22)),
    );
    this.els.stars.setAttribute('aria-label', `${n} of ${STARS_PER_BELT} stars toward the ${BELT_INFO[belt].name}`);
  }

  // ------------------------------------------------------------ hopping and landing

  private async hopBy(dist: number): Promise<void> {
    if (this.mode !== 'play' || !this.problem) return;
    if (this.world.busy && Math.abs(this.world.finalStone - this.world.ninjaStone) > 30) return;
    audio.unlock();
    const ok = await this.world.queueHop(dist);
    if (!ok) {
      audio.retry();
      toast(dist > 0 ? `Stone ${this.world.lineMax} is the end of the line.` : 'Stone 0 is the start of the line.');
    }
  }

  /** Tap or click a stone: hop there with big hops first, then small ones. */
  private hopTo(n: number): void {
    const p = this.problem;
    if (!p || this.mode !== 'play') return;
    let d = n - this.world.finalStone;
    const dir = Math.sign(d);
    while (p.bigHop && Math.abs(d) >= p.bigHop) {
      void this.hopBy(dir * p.bigHop);
      d -= dir * p.bigHop;
    }
    for (let i = 0; i < Math.abs(d); i++) void this.hopBy(dir);
  }

  private async land(): Promise<void> {
    if (this.mode !== 'play' || !this.problem) return;
    this.mode = 'busy';
    while (this.world.busy) await new Promise((r) => setTimeout(r, 30));
    const p = this.problem;
    const landed = this.world.ninjaStone;
    if (landed === p.start && !this.world.hopsMade.length) {
      // Pressing Land before hopping is not a wrong answer, just a reminder.
      toast(p.kind === 'find' ? `Hop along to ${p.target} first, then land.` : 'Hop first, then land!', 'hint');
      this.mode = 'play';
      return;
    }
    const check = checkLanding(p, landed);
    if (p.kind === 'gap' && check.correct) {
      await this.askHowFar(p);
      return;
    }
    if (check.correct) this.succeed(p, landed);
    else await this.miss(p, landed, check.misconception ?? 'other');
  }

  private async askHowFar(p: Problem): Promise<void> {
    const hops = this.world.hopsMade;
    const opts = gapOptions(p, hops, this.save.seed);
    const res = await this.talk.ask(
      this.sensei,
      {
        text: `You reached the flag! Your hops: ${hops.map((d) => (d > 0 ? `+${d}` : `−${-d}`)).join(' ')}. How far is it from ${p.start} to ${p.target}?`,
        options: opts.map((o) => ({
          text: String(o.value),
          correct: o.correct,
          misconception: o.misconception,
          feedback: o.correct
            ? `Yes! It is ${Math.abs(p.change)} from ${p.start} to ${p.target}. ${p.equation.replace('?', String(Math.abs(p.change)))}.`
            : o.misconception === 'added-numbers'
              ? `That is ${p.start} + ${p.target}. We want the space between them, not the two numbers added.`
              : o.misconception === 'counted-stones'
                ? 'That counts the stones, including the one you started on. Count the spaces you hopped.'
                : o.misconception === 'counted-hops'
                  ? 'That is how many hops you made. Some hops were big! Add up the size of each hop.'
                  : 'Not quite. Add up the sizes of your hops.',
        })),
        hints: [
          'Add up the numbers on your hop arcs.',
          `Your hops add up like this: ${hops.map((d) => Math.abs(d)).join(' + ')}.`,
          'The answer is outlined.',
        ],
      },
      () => audio.hint(),
    );
    this.talk.end();
    const firstTry = res.tries === 1;
    if (!this.firstResult) this.firstResult = { correct: firstTry, misconception: firstTry ? null : 'other' };
    this.succeed(p, p.target, res.tries - 1);
  }

  private succeed(p: Problem, landed: number, extraHints = 0): void {
    const rung = Math.max(this.hintRung, extraHints);
    const first = this.firstResult ?? { correct: true, misconception: null };
    let tierChange = 0;
    if (!this.recorded) {
      this.recorded = true;
      tierChange = recordAnswer(this.save.learner, p.belt, { correct: first.correct, hintRung: rung, misconception: first.misconception }, RULES).tierChange;
    }
    this.save.played[p.belt]++;
    const earnedStar = first.correct && rung <= 1;
    if (earnedStar && this.save.stars[p.belt] < STARS_PER_BELT) this.save.stars[p.belt]++;
    this.persist();
    this.world.clearGhosts();
    this.world.celebrate();
    this.world.pop(String(landed), landed, '#fff1b8');
    if (earnedStar) audio.itemGet();
    else audio.correct();
    this.streak = earnedStar ? this.streak + 1 : 0;
    if (this.streak >= 3 && this.streak % 3 === 0) toast(`${this.streak} clean landings in a row. Ninja streak!`, 'reward');
    this.updateStars();
    const eq = p.kind === 'find' ? `You found ${p.target}!` : p.equation.replace('?', String(p.kind === 'gap' ? Math.abs(p.change) : p.target));
    const praise = earnedStar ? `${cleanPraise(this.cleanCount++)} You earned a star.` : this.tries ? 'You got there! Practice makes ninjas. (Stars are for landing it the first time.)' : 'Nice work using the hints. Try the next one on your own for a star!';
    this.showResult(eq, praise, earnedStar);
    if (tierChange > 0) toast('Level up! The hops get trickier.', 'reward');
    if (tierChange < 0) toast('Let us practice a little more at an easier level.', 'hint');
    this.mode = 'result';
  }

  private async miss(p: Problem, landed: number, m: Misconception): Promise<void> {
    this.tries++;
    if (!this.firstResult) this.firstResult = { correct: false, misconception: m };
    if (!this.recorded) {
      // one record per challenge: the first landing counts
      this.recorded = true;
      const outcome = recordAnswer(this.save.learner, p.belt, { correct: false, hintRung: this.hintRung, misconception: m }, RULES);
      this.persist();
      if (outcome.tierChange < 0) toast('Let us practice a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.streak = 0;
    await this.talk.say(this.sensei, mistakeLine(p, m, landed), 'thinking');
    this.talk.end();
    this.world.backToStart();
    this.updateLog(p.start);
    // After a second miss, Sensei shows the next rung of the hint ladder.
    if (this.tries >= 2) this.showHint(Math.min(3, this.tries));
    this.mode = 'play';
    this.focusPad();
  }

  private showResult(equation: string, praise: string, star: boolean): void {
    const r = this.els.result;
    r.replaceChildren(
      h('div', { class: 'res-eq', text: equation }),
      h('p', { class: 'res-praise' }, star ? iconImg('star', '', 24) : null, h('span', { text: praise })),
      h('button', { class: 'btn primary', type: 'button', 'data-next': true, text: 'Next challenge (Space)', onclick: () => this.afterResult() }),
    );
    r.hidden = false;
    requestAnimationFrame(() => (r.querySelector('button') as HTMLElement | null)?.focus());
  }

  private afterResult(): void {
    if (this.mode !== 'result') return;
    this.els.result.hidden = true;
    const belt = this.save.current;
    const rec = skill(this.save.learner, belt);
    const ready = this.save.stars[belt] >= STARS_PER_BELT && (rec.tier >= 2 || this.save.played[belt] >= MAX_PER_BELT);
    if (ready && !this.save.earned.includes(belt)) void this.finishBelt(belt);
    else {
      this.nextProblem();
      this.focusPad();
    }
  }

  // ------------------------------------------------------------ hints

  private showHint(rung: number): void {
    const p = this.problem;
    if (!p) return;
    this.hintRung = Math.max(this.hintRung, rung);
    audio.hint();
    this.els.hintText.textContent = `Hint ${this.hintRung} of 3: ${hintText(p, this.hintRung)}`;
    this.els.hint.hidden = false;
    const hops = workedHops(p);
    if (this.hintRung === 2) {
      // a model: the first part of the path
      const part = p.kind === 'find' ? hops.filter((d) => Math.abs(d) > 1) : p.kind === 'tens' ? hops.filter((d) => Math.abs(d) > 1) : hops.slice(0, Math.min(2, hops.length));
      this.world.showGhostHops(p.start, part.length ? part : hops.slice(0, 1));
      if (p.kind === 'find') {
        const step = p.labels === 'tens' ? 10 : 5;
        const bench = Math.round(p.target / step) * step;
        this.world.markStone(bench, { label: String(bench) });
      }
    } else if (this.hintRung >= 3) {
      this.world.showGhostHops(p.start, hops);
      this.world.markStone(p.target, { glow: true, label: String(p.target) });
    }
  }

  private askHint(): void {
    if (this.mode !== 'play' || !this.problem) return;
    if (this.hintRung >= 3) {
      toast('That is every hint. Follow the dotted hops to the glowing stone!', 'hint');
      return;
    }
    this.showHint(this.hintRung + 1);
  }

  // ------------------------------------------------------------ finishing a belt

  private async finishBelt(belt: BeltId): Promise<void> {
    this.mode = 'busy';
    const info = BELT_INFO[belt];
    await this.talk.say(this.sensei, 'Five stars! Before I tie on your new belt, let us talk it through.', 'proud');
    const res = await this.talk.ask(this.sensei, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${belt}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.earned.push(belt);
    this.persist();
    this.world.ninja.setLook(this.ninjaLook());
    this.world.celebrate();
    audio.levelUp();
    toast(`You earned the ${info.name}!`, 'reward');
    await this.talk.say(this.sensei, info.earned, 'proud');
    const next = BELTS[BELTS.indexOf(belt) + 1];
    if (next) {
      const pick = await this.talk.offer(this.sensei, `Ready for the ${BELT_INFO[next].name} at ${BELT_INFO[next].place}?`, [
        `Yes, on to ${BELT_INFO[next].place}!`,
        `Practice the ${info.name} more`,
      ]);
      this.talk.end();
      if (pick === 0) void this.enterBelt(next);
      else {
        this.nextProblem();
        this.focusPad();
      }
    } else {
      await this.talk.say(this.sensei, [
        'You have earned every belt, from White to Black. You can find numbers, add, subtract, take big hops of ten, and find the gap between any two numbers.',
        'Come back any time to practice. Every belt is open on the belt scroll.',
      ], 'proud');
      this.talk.end();
      this.nextProblem();
      this.openBelts();
    }
  }

  private openBelts(): void {
    if (this.mode === 'busy' || this.mode === 'title') return;
    const rows = BELTS.map((b, i) => {
      const info = BELT_INFO[b];
      const earned = this.save.earned.includes(b);
      const open = i <= this.save.earned.length;
      const stars = this.save.stars[b];
      return h(
        'li',
        { class: `belt-row${open ? '' : ' locked'}${b === this.save.current ? ' current' : ''}` },
        h('span', { class: 'belt-swatch', style: `background:${info.color}` }),
        h('div', { class: 'belt-info' }, h('strong', { text: info.name }), h('span', { text: `${info.skill} · ${info.place}` }), h('span', { class: 'belt-stars', 'aria-label': `${stars} of ${STARS_PER_BELT} stars` }, ...Array.from({ length: STARS_PER_BELT }, (_, k) => iconImg(k < stars ? 'star' : 'starEmpty', '', 18)))),
        earned ? iconImg('check', 'Earned', 26) : open ? null : iconImg('lock', 'Locked', 26),
        h('button', {
          class: `btn small${open && !earned ? ' primary' : ''}`,
          type: 'button',
          disabled: !open,
          text: !open ? 'Locked' : earned ? 'Practice' : b === this.save.current ? 'Keep going' : 'Start',
          'aria-label': open ? `${earned ? 'Practice' : 'Start'} the ${info.name}` : `${info.name} is locked. Earn the belt before it first.`,
          onclick: () => {
            modal.close();
            if (b !== this.save.current || !this.problem) void this.enterBelt(b);
          },
        }),
      );
    });
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'belts-title', style: 'width:min(640px,100%)' },
      h('header', {}, h('h2', { id: 'belts-title', text: 'Belt scroll' }), h('button', { class: 'btn small', type: 'button', text: 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', style: 'margin:0 0 10px', text: 'Earn 5 stars to earn each belt. A star is for landing on the right stone the first time, using at most one hint.' }), h('ul', { class: 'belt-list' }, ...rows)),
    );
    const modal = new Modal(this.host, root, () => this.focusPad());
  }

  // ------------------------------------------------------------ grown-ups

  private openGrownups(): void {
    openGrownups(this.host, GROWNUPS, () => this.progressReport());
  }

  private progressReport(): HTMLElement {
    const MISCONCEPTION_WORDS: Record<string, string> = {
      'counted-start': 'counting the starting stone as a hop (lands one short when adding)',
      'one-off': 'miscounting by one',
      'wrong-way': 'hopping the wrong way (forward for take-away, or back for add)',
      'tens-as-ones': 'treating tens as ones (2 small hops for 20)',
      'ten-off': 'one big hop too many or too few',
      landmark: 'counting from the wrong landmark',
      reversed: 'swapping the tens and ones digits (41 for 14)',
      'no-hop': 'landing before hopping',
    };
    const rows = BELTS.map((b) => {
      const rec = this.save.learner[b];
      const info = BELT_INFO[b];
      const status = this.save.earned.includes(b) ? 'Earned' : rec ? 'In progress' : 'Not started';
      const mis = topMisconception(rec);
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: info.name }),
        h('td', { text: status }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? MISCONCEPTION_WORDS[mis] ?? '–' : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', { text: 'This summary is kept only in this browser. "Right first time" counts the first landing on each challenge; the level goes up after two clean answers in a row and down after two misses.' }),
      h(
        'div',
        { class: 'table-wrap' },
        h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Belt', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows)),
      ),
    );
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    const padBtn = (cls: string, icon: string, label: string, aria: string, onclick: () => void, n?: string) =>
      h('button', { class: `btn pad-btn ${cls}`, type: 'button', 'aria-label': aria, onclick: () => { audio.unlock(); onclick(); } }, iconImg(icon, '', 24), n !== undefined ? h('span', { class: 'n', text: n }) : null, h('span', { class: 'pad-label', text: label }));
    const bigBack = padBtn('big', 'arrowLeft2', 'Back', 'Hop back (Down arrow)', () => void this.hopBy(-(this.problem?.bigHop || 10)), '10') as HTMLButtonElement;
    const bigFwd = padBtn('big', 'arrowRight2', 'Forward', 'Hop forward (Up arrow)', () => void this.hopBy(this.problem?.bigHop || 10), '10') as HTMLButtonElement;
    const pad = h(
      'div',
      { class: 'pad', role: 'group', 'aria-label': 'Hop controls' },
      bigBack,
      padBtn('one', 'arrowLeft', 'Back', 'Hop back 1 (Left arrow)', () => void this.hopBy(-1), '1'),
      padBtn('land', 'land', 'Land here', 'Land here (Space)', () => void this.land()),
      padBtn('one', 'arrowRight', 'Forward', 'Hop forward 1 (Right arrow)', () => void this.hopBy(1), '1'),
      bigFwd,
    );
    const beltChip = h('span', { class: 'belt-chip' });
    const level = h('span', { class: 'level' });
    const equation = h('div', { class: 'equation', 'aria-live': 'polite' });
    const prompt = h('div', { class: 'prompt-text' });
    const log = h('div', { class: 'hop-log', 'aria-live': 'polite' });
    const card = h('section', { class: 'panel card', 'aria-label': 'Challenge' }, h('div', { class: 'card-top' }, beltChip, level), equation, prompt, log);
    const hintTextEl = h('span', {});
    const hint = h('div', { class: 'panel hint-box', role: 'status', hidden: true }, iconImg('bulb', '', 26), hintTextEl);
    const stars = h('div', { class: 'stars', role: 'img' });
    const place = h('div', { class: 'place' });
    const meter = h('div', { class: 'panel meter' }, place, stars);
    const result = h('div', { class: 'panel result', role: 'status', hidden: true });
    this.hud = h('div', { class: 'hud', hidden: true }, card, hint, meter, pad, result);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'hint', label: 'Hint', icon: 'bulb', key: 'H', onClick: () => this.askHint() },
      { id: 'belts', label: 'Belts', icon: 'scroll', key: 'B', onClick: () => this.openBelts() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    this.els = { card, beltChip, level, equation, prompt, log, hint, hintText: hintTextEl, stars, place, pad, bigBack, bigFwd, result };
  }

  private focusPad(): void {
    requestAnimationFrame(() => {
      if (document.querySelector('.modal-back, .dialogue')) return;
      (this.els.pad.querySelector('.land') as HTMLElement | null)?.focus({ preventScroll: true });
    });
  }

  private toggleMute(): void {
    updateSettings({ muted: !settings.muted });
    toast(settings.muted ? 'Sound off (M to turn it back on)' : 'Sound on');
  }

  private openSettingsPanel(): void {
    if (this.mode === 'title') return;
    openSettings(
      this.host,
      {
        changeLook: () =>
          openCustomize(this.host, this.save.appearance, { firstTime: false, noun: 'ninja', dress: this.dress }, (a) => {
            this.save.appearance = a;
            this.persist();
            this.world.ninja.setLook(this.ninjaLook());
          }),
        grownups: () => this.openGrownups(),
        resetSave: async () => {
          const ok = await choose(this.host, 'Start over?', 'This erases your belts and stars in this browser. Settings are kept.', [
            { id: 'yes', label: 'Yes, erase my progress', kind: 'danger' },
            { id: 'no', label: 'No, keep playing' },
          ]);
          if (ok === 'yes') {
            this.save = store.reset();
            this.talk.end();
            this.hud.hidden = true;
            this.world.build('white', 20, this.ninjaLook(), SENSEI_LOOK);
            this.world.setProblem(makeProblem('white', 1, 1));
            this.showTitleScreen();
          }
        },
      },
      () => this.focusPad(),
    );
  }

  // ------------------------------------------------------------ input

  private onKey(e: KeyboardEvent): void {
    if (document.querySelector('.modal-back')) return; // a window is open; it handles its own keys
    if (this.talk.isOpen || this.mode === 'title') return;
    const k = e.key;
    const big = this.problem?.bigHop || 0;
    if (this.mode === 'result') {
      if (k === ' ' || k === 'Enter') {
        e.preventDefault();
        this.afterResult();
        return;
      }
      // Menus still work while the result is showing; hopping does not.
      if (!['b', 'g', 'm', 'Escape'].includes(k.length === 1 ? k.toLowerCase() : k)) return;
    }
    const act: Record<string, () => void> = {
      ArrowRight: () => void this.hopBy(1),
      d: () => void this.hopBy(1),
      ArrowLeft: () => void this.hopBy(-1),
      a: () => void this.hopBy(-1),
      ArrowUp: () => big && void this.hopBy(big),
      w: () => big && void this.hopBy(big),
      ArrowDown: () => big && void this.hopBy(-big),
      s: () => big && void this.hopBy(-big),
      ' ': () => void this.land(),
      Enter: () => void this.land(),
      h: () => this.askHint(),
      b: () => this.openBelts(),
      m: () => this.toggleMute(),
      Escape: () => this.openSettingsPanel(),
      g: () => this.openGrownups(),
      r: () => {
        if (this.mode === 'play' && !this.world.busy) {
          this.world.backToStart();
          this.updateLog(this.problem!.start);
        }
      },
    };
    const fn = act[k] ?? act[k.toLowerCase()];
    if (!fn) return;
    // Space and Enter on a focused button press that button instead.
    if ((k === ' ' || k === 'Enter') && (e.target as HTMLElement)?.tagName === 'BUTTON' && !(e.target as HTMLElement).classList.contains('land')) return;
    e.preventDefault();
    if (e.repeat && this.world.busy && !k.startsWith('Arrow')) return;
    fn();
  }

  private onPointer(e: PointerEvent): void {
    if (this.mode !== 'play' || this.talk.isOpen) return;
    if ((e.target as HTMLElement).closest('button, .panel, .modal-back')) return;
    const rect = this.host.getBoundingClientRect();
    const n = this.world.stoneAt(e.clientX - rect.left, e.clientY - rect.top);
    if (n !== null) {
      audio.unlock();
      this.hopTo(n);
    }
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const p = this.problem;
    return {
      mode: this.mode,
      belt: this.save.current,
      problem: p,
      stone: this.world.ninjaStone,
      busy: this.world.busy,
      hintRung: this.hintRung,
      stars: { ...this.save.stars },
      earned: [...this.save.earned],
      tier: skill(this.save.learner, this.save.current).tier,
      talking: this.talk.isOpen,
      worked: p ? workedHops(p) : [],
      hops: this.world.hopsMade,
    };
  }
}
