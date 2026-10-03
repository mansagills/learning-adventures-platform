import type { CharacterLook } from '../../kit/art/characters';
import { iconImg } from '../../kit/art/icons';
import { paintPortrait, type Expression } from '../../kit/art/portraits';
import { bus } from '../../kit/core/events';
import { mulberry32 } from '../../kit/core/rng';
import { recordAnswer, skill, topMisconception, type SkillRules } from '../../kit/learning/mastery';
import { audio } from '../../kit/systems/audio';
import { applySettingsToDocument, isTouchDevice, settings, updateSettings } from '../../kit/systems/settings';
import { setReadAloudDefault, speak, stopSpeaking } from '../../kit/systems/speech';
import { choose, h, Modal, stackTop } from '../../kit/ui/dom';
import { openGrownups } from '../../kit/ui/grownups';
import { mountToasts, toast, Toolbar } from '../../kit/ui/hud';
import { openSettings } from '../../kit/ui/settingsPanel';
import { Talk, type Speaker } from '../../kit/ui/talk';
import { showTitle } from '../../kit/ui/title';
import { paintBoltIcon, paintCar, paintTrophy, type Theme } from './art';
import { BOOST_WORDS, CONTROLS_KEYS, CONTROLS_TOUCH, GROWNUPS, hintFor, INTRO, KOFI, MEMORY_PAIRS, mistakeLine, QUESTIONS_PER_RACE, resultLine, RIVAL_NAME, TIER_NAME, TIER_UP, WIN_BOLTS } from './content';
import { buy, PARTS, partById, RIVAL_LOOK, SLOT_NAME, SLOTS, TRACKS, type CarLook, type Slot } from './cosmetics';
import { GARAGE_SONG, RACE_SONG } from './music';
import { pix } from './pix';
import { boltsFor, makeProblem, memoryBoard, nextLevel, speedFor, type MemoryCard, type Problem, type Tier } from './problems';
import { RaceScene, type Gate, type RaceEvent } from './race';
import { freshSave, store, type RaceSave } from './save';

const SKILL = 'race';
const RULES: SkillRules = { maxTier: 5, masteryTier: 4, masteryCount: 5 };
/** Thinking time (seconds) between gates at top speed, by level. Slower speeds give more. */
const THINK: Record<Tier, number> = { 1: 4.2, 2: 4.4, 3: 5, 4: 6, 5: 6.5 };

const KOFI_LOOK: CharacterLook = {
  build: 'adult',
  skin: { base: '#5a3825', shade: '#462a1b' },
  hair: { style: 'short', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
  shirt: { base: '#d2453a', shade: '#a3302a' },
  pants: '#2b2b33',
  shoes: '#2b1d1e',
  accessory: 'cap',
  accent: '#f2c94c',
  extras: { beard: '#2a1f1d' },
};

type Mode = 'title' | 'menu' | 'countdown' | 'race' | 'paused' | 'after';

interface RaceState {
  theme: Theme;
  tier: Tier;
  spacing: number;
  firstGate: number;
  q: number;
  problem: Problem | null;
  gate: Gate | null;
  correct: number;
  streak: number;
  bestStreak: number;
  missStreak: number;
  hinted: boolean;
  missed: Problem[];
  seen: Problem[];
  playerDone: boolean;
  rivalDone: boolean;
  place: number;
  seed: number;
  elapsed: number;
}

export class Game {
  private readonly scene: RaceScene;
  private readonly talk: Talk;
  private save: RaceSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private titleEl: HTMLElement | null = null;
  private readonly kofi: Speaker;
  private race: RaceState | null = null;
  private keys = { left: false, right: false };
  private touchSteer = 0;
  private timeScale = 1;
  // HUD
  private hud!: HTMLElement;
  private qEl!: HTMLElement;
  private answersEl!: HTMLElement;
  private hintEl!: HTMLElement;
  private feedEl!: HTMLElement;
  private speedEl!: HTMLElement;
  private placeEl!: HTMLElement;
  private countEl!: HTMLElement;
  private progressYou!: HTMLElement;
  private progressRival!: HTMLElement;
  private bigEl!: HTMLElement;
  private boltsEl!: HTMLElement;
  private toolbar!: Toolbar;
  private feedTimer = 0;
  private boostWord = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    this.save = store.exists() ? store.load() : freshSave();
    this.scene = new RaceScene(host);
    this.scene.reducedMotion = settings.reducedMotion;
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    this.kofi = {
      name: KOFI.name,
      role: KOFI.role,
      voice: 150,
      portrait: (e: Expression) => {
        let u = cache.get(e);
        if (!u) cache.set(e, (u = paintPortrait(KOFI_LOOK, e).toDataURL(3)));
        return u;
      },
    };
    audio.addSong('race', RACE_SONG);
    audio.addSong('garage', GARAGE_SONG);
    window.addEventListener('resize', () => this.scene.resize());
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
    window.addEventListener('blur', () => (this.keys = { left: false, right: false }));
    bus.on('settings:changed', () => {
      this.scene.reducedMotion = settings.reducedMotion;
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
    });
    this.buildHud();
    mountToasts(host);
    (window as unknown as { __rr: unknown }).__rr = {
      state: () => this.debugState(),
      setTier: (t: Tier) => {
        skill(this.save.learner, SKILL).tier = t;
      },
      setTimeScale: (n: number) => (this.timeScale = n),
      setBolts: (n: number) => {
        this.save.bolts = n;
        this.persist();
      },
      /** test helper: close any menus and start a race on a track */
      race: (id: string) => {
        for (let m = stackTop(); m; m = stackTop()) m.close();
        this.closeTitle();
        this.talk.end();
        this.startRace(id);
      },
      setWins: (n: number) => {
        this.save.wins = n;
        this.persist();
      },
    };
  }

  start(): void {
    this.scene.build({ theme: 'hills', seed: 7, finishS: 900, playerLook: this.save.look, rivalLook: RIVAL_LOOK });
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000) * this.timeScale;
      this.last = now;
      this.frame(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // ------------------------------------------------------------ title and menus

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Math Race Rally',
      subtitle: 'Race to the right answer',
      intro: [
        'Steer your car through the gate with the right answer to speed up and beat your rival. After every race, match facts at the pit stop to win bolts for new paint, styles and cars!',
        `Grades 1 to 5: adding and subtracting, from facts to 10 up to three-digit numbers.${this.save.races ? ` You have raced ${this.save.races} time${this.save.races === 1 ? '' : 's'} and won ${this.save.wins}.` : ''}`,
      ],
      hasSave: store.exists() && this.save.introSeen,
      continueGame: () => {
        audio.unlock();
        this.closeTitle();
        this.openTrackPicker();
      },
      newGame: () => {
        audio.unlock();
        void this.newGame();
      },
      settings: () => this.openSettingsPanel(),
      grownups: () => this.openGrownupsPage(),
    });
  }

  private closeTitle(): void {
    this.titleEl?.remove();
    this.titleEl = null;
  }

  private async newGame(): Promise<void> {
    if (store.exists() && this.save.introSeen) {
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your bolts, car upgrades and wins in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
    }
    this.closeTitle();
    this.mode = 'menu';
    await this.talk.say(this.kofi, INTRO);
    await this.talk.say(this.kofi, isTouchDevice() ? CONTROLS_TOUCH : CONTROLS_KEYS, 'curious');
    this.talk.end();
    this.save.introSeen = true;
    this.persist();
    this.startRace(TRACKS[0].id);
  }

  private openTrackPicker(): void {
    this.mode = 'menu';
    this.hud.hidden = true;
    audio.play('garage');
    const rows = TRACKS.map((t) => {
      const open = this.save.wins >= t.wins;
      return h(
        'li',
        { class: `rr-track${open ? '' : ' locked'}` },
        h('div', { class: 'rr-track-info' }, h('strong', { text: t.name }), h('span', { text: open ? (t.id === this.save.track ? 'Your last track' : 'Open') : `Win ${t.wins} race${t.wins === 1 ? '' : 's'} to open (you have ${this.save.wins})` })),
        open
          ? h('button', { class: 'btn primary', type: 'button', text: 'Race here', 'data-track': t.id, onclick: () => (modal.close(), this.startRace(t.id)) })
          : h('span', { class: 'rr-lock' }, iconImg('lock', 'Locked', 22)),
      );
    });
    const root = h(
      'div',
      { class: 'panel modal rr-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rr-tracks-title' },
      h('header', {}, h('h2', { id: 'rr-tracks-title', text: 'Pick a track' }), h('div', { class: 'rr-head-right' }, this.boltsChip(), h('button', { class: 'btn small', type: 'button', text: 'Garage', onclick: () => (modal.close(), this.openGarage()) }))),
      h('div', { class: 'content' }, h('div', { class: 'rr-car-preview' }, pix(`car-${JSON.stringify(this.save.look)}`, () => paintCar(this.save.look), 4, 'Your car')), h('ul', { class: 'rr-tracks' }, ...rows)),
    );
    const modal = new Modal(this.host, root, undefined, { closeOnBackdrop: false, escapeCloses: false });
  }

  private boltsChip(): HTMLElement {
    return h('span', { class: 'rr-bolts', 'aria-label': `${this.save.bolts} bolts` }, pix('bolt', () => paintBoltIcon(), 2), h('strong', { text: String(this.save.bolts) }));
  }

  // ------------------------------------------------------------ the race

  private startRace(trackId: string): void {
    const t = TRACKS.findIndex((x) => x.id === trackId);
    const theme = (TRACKS[t]?.id ?? 'hills') as Theme;
    this.save.track = theme;
    const tier = skill(this.save.learner, SKILL).tier as Tier;
    const spacing = Math.round(speedFor(6) * THINK[tier]);
    const firstGate = 60;
    const finishS = firstGate + spacing * (QUESTIONS_PER_RACE - 1) + Math.round(spacing * 0.7);
    const seed = this.save.seed++;
    this.persist();
    this.scene.build({ theme, seed, finishS, playerLook: this.save.look, rivalLook: RIVAL_LOOK });
    // the rival gets a little quicker with each win (up to a point)
    this.scene.rivalSpeed = speedFor(3.6 + Math.min(0.9, this.save.wins * 0.12) + t * 0.05);
    this.race = { theme, tier, spacing, firstGate, q: 0, problem: null, gate: null, correct: 0, streak: 0, bestStreak: 0, missStreak: 0, hinted: false, missed: [], seen: [], playerDone: false, rivalDone: false, place: 0, seed, elapsed: 0 };
    this.hud.hidden = false;
    this.feedEl.hidden = true;
    this.hintEl.hidden = true;
    this.renderHud();
    this.nextQuestion();
    void this.countdown();
  }

  private async countdown(): Promise<void> {
    this.mode = 'countdown';
    audio.play(null);
    for (const n of ['3', '2', '1']) {
      this.big(n, 'count');
      audio.fx([[72, 0, 0.12]], 'square', 0.08);
      await new Promise((r) => setTimeout(r, 650 / this.timeScale));
    }
    this.big('GO!', 'go');
    audio.fx([[84, 0, 0.3]], 'square', 0.1);
    this.scene.running = true;
    this.mode = 'race';
    audio.play('race');
    if (this.race?.problem) speak(this.sayProblem(this.race.problem));
  }

  private big(text: string, kind: string): void {
    this.bigEl.textContent = text;
    this.bigEl.className = `rr-big ${kind}`;
    this.bigEl.hidden = false;
    clearTimeout(this.feedTimer);
    window.setTimeout(() => {
      if (this.bigEl.textContent === text) this.bigEl.hidden = true;
    }, 700 / this.timeScale);
  }

  private sayProblem(p: Problem): string {
    return `${p.a} ${p.op === '+' ? 'plus' : 'minus'} ${p.b}`;
  }

  /** Put up the next question and its gate (the gates are evenly spaced, so the finish line is fixed). */
  private nextQuestion(): void {
    const r = this.race;
    if (!r) return;
    if (r.q >= QUESTIONS_PER_RACE) {
      r.problem = null;
      r.gate = null;
      this.renderQuestion();
      return;
    }
    const tier = skill(this.save.learner, SKILL).tier as Tier;
    const p = makeProblem(tier, mulberry32(r.seed * 31 + r.q * 7 + 1));
    r.problem = p;
    r.hinted = r.missStreak >= 2;
    const s = r.firstGate + r.q * r.spacing;
    r.gate = this.scene.addGate(s, p.choices.map((c) => c.value));
    this.renderQuestion();
    if (this.mode === 'race') speak(this.sayProblem(p));
  }

  private renderQuestion(): void {
    const r = this.race;
    const p = r?.problem;
    if (!r || !p) {
      this.qEl.textContent = r && r.q >= QUESTIONS_PER_RACE ? 'Race to the finish!' : '';
      this.answersEl.replaceChildren();
      this.hintEl.hidden = true;
      return;
    }
    this.qEl.textContent = `${p.text} = ?`;
    const names = ['Left lane', 'Middle lane', 'Right lane'];
    this.answersEl.replaceChildren(
      ...p.choices.map((c, i) =>
        h(
          'button',
          { class: 'btn rr-answer', type: 'button', 'data-lane': String(i), 'aria-label': `${c.value}, ${names[i]}`, onclick: () => this.goLane(i) },
          h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          h('span', { class: 'rr-answer-num', text: String(c.value) }),
        ),
      ),
    );
    this.hintEl.hidden = !r.hinted;
    if (r.hinted) this.hintEl.replaceChildren(iconImg('bulb', '', 20), h('span', { text: hintFor(p) }));
    this.countEl.textContent = `Question ${r.q + 1} of ${QUESTIONS_PER_RACE}`;
  }

  private goLane(i: number): void {
    if (this.mode !== 'race' && this.mode !== 'countdown') return;
    this.scene.player.targetLane = i;
    this.answersEl.querySelectorAll('.rr-answer').forEach((b, k) => b.classList.toggle('aimed', k === i));
  }

  private frame(dt: number): void {
    const racing = this.mode === 'race' || (this.mode === 'after' && this.race !== null && !this.race.playerDone);
    const steer = (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0) + this.touchSteer;
    const events = this.mode === 'paused' ? [] : this.scene.update(dt, racing ? Math.max(-1, Math.min(1, steer)) : 0);
    for (const ev of events) this.onRaceEvent(ev);
    if (this.race && this.mode === 'race') {
      this.race.elapsed += dt;
      this.renderLive();
      this.scene.removeOldGates();
    }
    this.scene.render();
  }

  private onRaceEvent(ev: RaceEvent): void {
    const r = this.race;
    if (!r) return;
    if (ev.type === 'gate' && r.problem && ev.gate === r.gate) this.passGate(ev.lane);
    else if (ev.type === 'finish') {
      r.playerDone = true;
      r.place = r.rivalDone ? 2 : 1;
      void this.finishRace();
    } else if (ev.type === 'rival-finish') r.rivalDone = true;
    else if (ev.type === 'bump') audio.fx([[45, 0, 0.12]], 'square', 0.08);
    else if (ev.type === 'pass') {
      if (ev.ahead) this.flash(`You passed ${RIVAL_NAME}!`, 'good');
    }
  }

  private passGate(lane: number): void {
    const r = this.race!;
    const p = r.problem!;
    const choice = p.choices[lane];
    const correct = choice.correct;
    const rightLane = p.choices.findIndex((c) => c.correct);
    this.scene.paintGateState(r.gate!, { picked: lane, correct: rightLane });
    const o = recordAnswer(this.save.learner, SKILL, { correct, hintRung: r.hinted ? 2 : 0, misconception: correct ? null : choice.misconception ?? 'other' }, RULES);
    r.seen.push(p);
    if (correct) {
      r.correct++;
      r.streak++;
      r.bestStreak = Math.max(r.bestStreak, r.streak);
      r.missStreak = 0;
      this.scene.boost(nextLevel(this.scene.player.level, true));
      audio.itemGet();
      this.flash(`${BOOST_WORDS[this.boostWord++ % BOOST_WORDS.length]} ${p.text} = ${p.answer}`, 'good');
    } else {
      r.streak = 0;
      r.missStreak++;
      r.missed.push(p);
      this.scene.slow(nextLevel(this.scene.player.level, false));
      audio.retry();
      this.flash(mistakeLine(choice.misconception, p), 'try');
      speak(mistakeLine(choice.misconception, p));
    }
    if (o.tierChange > 0) toast(TIER_UP[o.record.tier] ?? 'Level up!', 'reward');
    if (o.tierChange < 0) toast('Let us practise easier questions for a bit.', 'hint');
    this.persist();
    r.q++;
    this.answersEl.querySelectorAll('.rr-answer').forEach((b) => b.classList.remove('aimed'));
    this.scene.player.targetLane = null;
    this.nextQuestion();
  }

  private flash(text: string, kind: 'good' | 'try'): void {
    this.feedEl.textContent = text;
    this.feedEl.className = `rr-feed ${kind}`;
    this.feedEl.hidden = false;
    clearTimeout(this.feedTimer);
    this.feedTimer = window.setTimeout(() => (this.feedEl.hidden = true), (kind === 'try' ? 3200 : 1600) / this.timeScale);
  }

  private renderLive(): void {
    const s = this.scene;
    const lvl = s.player.level;
    this.speedEl.replaceChildren(...Array.from({ length: 6 }, (_, i) => h('span', { class: `rr-pip${i < lvl ? ' on' : ''}${s.player.boostT > 0 && i === lvl - 1 ? ' boost' : ''}` })));
    this.speedEl.setAttribute('aria-label', `Speed ${lvl} of 6`);
    const ahead = s.player.s >= s.rival.s;
    const place = ahead ? '1st' : '2nd';
    if (this.placeEl.textContent !== place) {
      this.placeEl.textContent = place;
      this.placeEl.classList.toggle('first', ahead);
    }
    const pr = s.progress();
    this.progressYou.style.left = `${pr.player * 100}%`;
    this.progressRival.style.left = `${pr.rival * 100}%`;
  }

  private renderHud(): void {
    this.boltsEl.replaceChildren(pix('bolt', () => paintBoltIcon(), 2), h('strong', { text: String(this.save.bolts) }));
  }

  private async finishRace(): Promise<void> {
    const r = this.race!;
    this.mode = 'after';
    this.big(r.place === 1 ? 'You win!' : 'Finish!', r.place === 1 ? 'go' : 'count');
    audio.play(null);
    if (r.place === 1) audio.levelUp();
    else audio.correct();
    this.save.races++;
    if (r.place === 1) {
      this.save.wins++;
      this.save.bolts += WIN_BOLTS;
    }
    this.save.bestCorrect = Math.max(this.save.bestCorrect, r.correct);
    this.persist();
    await new Promise((res) => setTimeout(res, 1400 / this.timeScale));
    this.showResults();
  }

  private showResults(): void {
    const r = this.race!;
    this.hud.hidden = true;
    const unlocked = TRACKS.find((t) => t.wins === this.save.wins && r.place === 1 && t.wins > 0);
    const line = resultLine(r.place, r.correct);
    const review = r.missed.length
      ? h(
          'div',
          { class: 'rr-review' },
          h('h3', { text: 'Pit notes: the ones to practise' }),
          h('ul', {}, ...r.missed.map((p) => h('li', {}, h('strong', { text: `${p.text} = ${p.answer}` }), h('span', { text: p.strategy })))),
        )
      : h('p', { class: 'rr-perfect', text: 'No missed questions. Perfect driving!' });
    const go = h('button', { class: 'btn primary', type: 'button', text: 'To the pit stop', 'data-autofocus': true });
    const root = h(
      'div',
      { class: 'panel modal rr-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rr-result-title' },
      h('header', {}, h('h2', { id: 'rr-result-title', text: r.place === 1 ? 'You won the race!' : `${RIVAL_NAME} won this time` })),
      h(
        'div',
        { class: 'content' },
        h('div', { class: 'rr-result-top' }, pix(`trophy-${r.place}`, () => paintTrophy(r.place), 4, r.place === 1 ? 'Gold trophy' : 'Silver trophy'), h('p', { class: 'rr-result-line', text: line })),
        h(
          'div',
          { class: 'rr-stats' },
          h('div', { class: 'rr-stat' }, h('strong', { text: `${r.correct} of ${QUESTIONS_PER_RACE}` }), h('span', { text: 'right answers' })),
          h('div', { class: 'rr-stat' }, h('strong', { text: String(r.bestStreak) }), h('span', { text: 'best streak' })),
          h('div', { class: 'rr-stat' }, h('strong', { text: r.place === 1 ? `+${WIN_BOLTS}` : '0' }), h('span', { text: 'bolts for winning' })),
        ),
        unlocked ? h('p', { class: 'rr-unlock', text: `New track open: ${unlocked.name}!` }) : '',
        review,
      ),
      h('footer', { class: 'rr-foot' }, go),
    );
    const modal = new Modal(this.host, root, undefined, { closeOnBackdrop: false, escapeCloses: false });
    speak(line);
    go.addEventListener('click', () => {
      modal.close();
      this.openPitStop();
    });
  }

  // ------------------------------------------------------------ the pit stop (memory match)

  private openPitStop(): void {
    const r = this.race!;
    this.hud.hidden = true;
    audio.play('garage');
    const tier = skill(this.save.learner, SKILL).tier as Tier;
    const cards = memoryBoard(MEMORY_PAIRS, r.missed, r.seen, tier, mulberry32(r.seed + 5));
    let first: number | null = null;
    let lock = false;
    let matches = 0;
    let misses = 0;
    const done = new Set<number>();
    const status = h('p', { class: 'rr-pit-status', role: 'status', 'aria-live': 'polite', text: 'Flip two cards. Match each fact with its answer.' });
    const earned = h('strong', { class: 'rr-pit-bolts', text: '0' });
    const finish = h('button', { class: 'btn primary', type: 'button', text: 'To the garage', hidden: true });
    const btns = cards.map((c, i) =>
      h('button', { class: 'rr-card', type: 'button', 'data-i': String(i), 'aria-label': `Card ${i + 1}, face down`, onclick: () => flip(i) }, h('span', { class: 'rr-card-face', text: c.face })),
    );
    const show = (i: number, up: boolean) => {
      btns[i].classList.toggle('up', up);
      btns[i].setAttribute('aria-label', up ? `Card ${i + 1}: ${cards[i].face}` : `Card ${i + 1}, face down`);
    };
    const flip = (i: number) => {
      if (lock || done.has(i) || first === i) return;
      audio.click();
      show(i, true);
      if (first === null) {
        first = i;
        return;
      }
      const a = cards[first];
      const b = cards[i];
      const j = first;
      first = null;
      if (a.pair === b.pair && a.kind !== b.kind) {
        done.add(i).add(j);
        matches++;
        btns[i].classList.add('matched');
        btns[j].classList.add('matched');
        audio.correct();
        const fact = (a.kind === 'fact' ? a : b) as MemoryCard;
        const ans = (a.kind === 'answer' ? a : b) as MemoryCard;
        status.textContent = `Match! ${fact.face} = ${ans.face}`;
        earned.textContent = String(matches);
        if (matches === MEMORY_PAIRS) {
          const bolts = boltsFor(matches, misses, MEMORY_PAIRS);
          this.save.bolts += bolts;
          this.persist();
          audio.levelUp();
          status.textContent = `All matched! You earned ${bolts} bolts${bolts > matches ? ` (${bolts - matches} bonus for a tidy board)` : ''}.`;
          earned.textContent = String(bolts);
          speak(status.textContent);
          finish.hidden = false;
          finish.focus();
        }
      } else {
        misses++;
        lock = true;
        audio.retry();
        status.textContent = 'Not a match. Remember where they are!';
        window.setTimeout(() => {
          show(i, false);
          show(j, false);
          lock = false;
        }, 950 / this.timeScale);
      }
    };
    const root = h(
      'div',
      { class: 'panel modal rr-panel rr-pit', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rr-pit-title' },
      h('header', {}, h('h2', { id: 'rr-pit-title', text: 'Pit stop: Memory Match' }), h('div', { class: 'rr-head-right' }, pix('bolt', () => paintBoltIcon(), 2), h('span', { text: 'Bolts won:' }), earned)),
      h('div', { class: 'content' }, status, h('div', { class: 'rr-cards' }, ...btns)),
      h('footer', { class: 'rr-foot' }, finish),
    );
    const modal = new Modal(this.host, root, undefined, { closeOnBackdrop: false, escapeCloses: false });
    finish.addEventListener('click', () => {
      modal.close();
      this.openGarage();
    });
    speak('Pit stop! Flip two cards to match each fact with its answer.');
  }

  // ------------------------------------------------------------ the garage

  private openGarage(slot: Slot = 'paint'): void {
    this.mode = 'menu';
    this.hud.hidden = true;
    audio.play('garage');
    const preview = h('div', { class: 'rr-car-preview big' });
    const bolts = h('div', { class: 'rr-head-right' });
    const tabs = h('div', { class: 'rr-tabs', role: 'tablist' });
    const list = h('ul', { class: 'rr-parts', role: 'tabpanel' });
    let current = slot;
    const render = () => {
      preview.replaceChildren(pix(`car-${JSON.stringify(this.save.look)}`, () => paintCar(this.save.look), 5, 'Your car'));
      bolts.replaceChildren(this.boltsChip());
      tabs.replaceChildren(
        ...SLOTS.map((s) => h('button', { class: `btn small rr-tab${s === current ? ' primary' : ''}`, type: 'button', role: 'tab', 'aria-selected': String(s === current), text: SLOT_NAME[s], onclick: () => ((current = s), render()) })),
      );
      list.replaceChildren(
        ...PARTS.filter((p) => p.slot === current).map((p) => {
          const owned = this.save.owned.includes(p.id);
          const using = this.save.look[p.slot] === p.id;
          const afford = this.save.bolts >= p.cost;
          const tryLook = { ...this.save.look, [p.slot]: p.id };
          const action = using
            ? h('span', { class: 'rr-using', text: 'Using' })
            : owned
              ? h('button', { class: 'btn small', type: 'button', text: 'Use', onclick: () => equip(p.id) })
              : h('button', { class: 'btn small primary', type: 'button', disabled: !afford, 'data-buy': p.id, text: `Buy: ${p.cost}`, onclick: () => purchase(p.id) });
          const note = owned ? '' : afford ? `${this.save.bolts} − ${p.cost} = ${this.save.bolts - p.cost} bolts left` : `You need ${p.cost - this.save.bolts} more bolts`;
          return h(
            'li',
            { class: `rr-part${using ? ' using' : ''}` },
            pix(`car-${JSON.stringify(tryLook)}`, () => paintCar(tryLook), 2, ''),
            h('div', { class: 'rr-part-info' }, h('strong', { text: p.name }), note ? h('span', { class: afford ? 'rr-math' : 'rr-need', text: note }) : ''),
            action,
          );
        }),
      );
    };
    const equip = (id: string) => {
      const p = partById(id)!;
      this.save.look = { ...this.save.look, [p.slot]: id } as CarLook;
      this.persist();
      audio.click();
      render();
    };
    const purchase = (id: string) => {
      const res = buy(this.save.bolts, this.save.owned, id);
      if (!res) return;
      this.save.bolts = res.bolts;
      this.save.owned = res.owned;
      audio.itemGet();
      toast(`New: ${partById(id)!.name}!`, 'reward');
      equip(id);
    };
    const next = h('button', { class: 'btn primary', type: 'button', text: 'Next race', 'data-autofocus': true });
    const root = h(
      'div',
      { class: 'panel modal rr-panel rr-garage', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'rr-garage-title' },
      h('header', {}, h('h2', { id: 'rr-garage-title', text: 'Garage' }), bolts),
      h('div', { class: 'content' }, preview, h('p', { class: 'small-note', text: 'Upgrades change how your car looks. Speed always comes from right answers!' }), tabs, list),
      h('footer', { class: 'rr-foot' }, next),
    );
    const modal = new Modal(this.host, root, undefined, { closeOnBackdrop: false, escapeCloses: false });
    render();
    next.addEventListener('click', () => {
      modal.close();
      this.scene.setPlayerLook(this.save.look);
      this.openTrackPicker();
    });
  }

  // ------------------------------------------------------------ input and HUD

  private onKey(e: KeyboardEvent, down: boolean): void {
    if (this.talk.isOpen) return;
    const k = e.key;
    const inRace = this.mode === 'race' || this.mode === 'countdown';
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
      if (inRace) e.preventDefault();
      this.keys.left = down && inRace;
    } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
      if (inRace) e.preventDefault();
      this.keys.right = down && inRace;
    } else if (down && inRace && /^[1-3]$/.test(k) && !stackTop()) {
      e.preventDefault();
      this.goLane(Number(k) - 1);
    } else if (down && k === 'Escape' && this.mode === 'race' && !stackTop()) this.pause();
    else if (down && (k === 'm' || k === 'M') && this.mode !== 'title') this.toggleMute();
  }

  private buildHud(): void {
    this.qEl = h('div', { class: 'rr-q', 'aria-live': 'polite' });
    this.answersEl = h('div', { class: 'rr-answers' });
    this.hintEl = h('div', { class: 'rr-hint', hidden: true });
    this.feedEl = h('div', { class: 'rr-feed', role: 'status', 'aria-live': 'polite', hidden: true });
    this.speedEl = h('div', { class: 'rr-speed', role: 'img' });
    this.placeEl = h('div', { class: 'rr-place' });
    this.countEl = h('div', { class: 'rr-count' });
    this.boltsEl = h('div', { class: 'rr-bolts' });
    this.progressYou = h('span', { class: 'rr-dot you', title: 'You' });
    this.progressRival = h('span', { class: 'rr-dot rival', title: RIVAL_NAME });
    this.bigEl = h('div', { class: 'rr-big', hidden: true, 'aria-hidden': 'true' });
    const steerBtn = (dir: -1 | 1) => {
      const b = h('button', { class: `btn rr-steer ${dir < 0 ? 'left' : 'right'}`, type: 'button', 'aria-label': dir < 0 ? 'Steer left' : 'Steer right' }, iconImg(dir < 0 ? 'arrowLeft' : 'arrowRight', '', 34));
      const on = (e: Event) => {
        e.preventDefault();
        this.touchSteer = dir;
      };
      const off = () => {
        if (this.touchSteer === dir) this.touchSteer = 0;
      };
      b.addEventListener('pointerdown', on);
      b.addEventListener('pointerup', off);
      b.addEventListener('pointerleave', off);
      b.addEventListener('pointercancel', off);
      return b;
    };
    const card = h('div', { class: 'panel rr-qcard' }, h('div', { class: 'rr-qtop' }, this.countEl), this.qEl, this.answersEl, this.hintEl);
    const side = h('div', { class: 'panel rr-side' }, h('div', { class: 'rr-side-row' }, h('span', { text: 'Place' }), this.placeEl), h('div', { class: 'rr-side-row' }, h('span', { text: 'Speed' }), this.speedEl), this.boltsEl);
    const progress = h('div', { class: 'rr-progress', 'aria-hidden': 'true' }, h('span', { class: 'rr-flag' }), this.progressRival, this.progressYou);
    this.hud = h('div', { class: 'hud rr-hud', hidden: true }, card, side, this.feedEl, this.bigEl, progress, steerBtn(-1), steerBtn(1));
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'pause', label: 'Pause', icon: 'gear', key: 'Esc', onClick: () => this.pause() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
    ]);
  }

  private pause(): void {
    if (this.mode !== 'race') return;
    this.mode = 'paused';
    this.keys = { left: false, right: false };
    this.touchSteer = 0;
    stopSpeaking();
    this.openSettingsPanel(() => {
      if (this.mode === 'paused') this.mode = 'race';
    });
  }

  private toggleMute(): void {
    updateSettings({ muted: !settings.muted });
    if (settings.muted) stopSpeaking();
  }

  private openSettingsPanel(onClose?: () => void): void {
    openSettings(
      this.host,
      {
        grownups: () => this.openGrownupsPage(),
        resetSave: async () => {
          const ok = await choose(this.host, 'Start over?', 'This erases your bolts, car upgrades and wins in this browser. Settings are kept.', [
            { id: 'yes', label: 'Yes, erase my progress', kind: 'danger' },
            { id: 'no', label: 'No, keep playing' },
          ]);
          if (ok === 'yes') {
            store.reset();
            window.location.reload();
          }
        },
      },
      onClose,
    );
  }

  private openGrownupsPage(): void {
    openGrownups(this.host, GROWNUPS, () => this.progressReport());
  }

  private progressReport(): HTMLElement {
    const WORDS: Record<string, string> = {
      'off-one': 'off by one (counting the starting number)',
      'wrong-op': 'adding instead of subtracting, or the other way round',
      'no-regroup': 'forgetting to carry the ten',
      'smaller-from-bigger': 'taking the smaller digit from the bigger (52 − 27 = 35)',
      'tens-ones': 'adding a ones number to the tens',
      'off-ten': 'a ten too many or too few',
      'off-hundred': 'a hundred too many or too few',
    };
    const rec = this.save.learner[SKILL];
    const mis = topMisconception(rec);
    return h(
      'div',
      {},
      h('p', { text: 'This summary is kept only in this browser.' }),
      h(
        'div',
        { class: 'table-wrap' },
        h(
          'table',
          { class: 'progress-table' },
          h('tbody', {}, ...[
            ['Races', `${this.save.races} (won ${this.save.wins})`],
            ['Level now', rec ? `${rec.tier}: ${TIER_NAME[rec.tier]}` : 'Not started'],
            ['Answers', rec ? `${rec.correct} of ${rec.attempts} right` : '–'],
            ['Most right in one race', `${this.save.bestCorrect} of ${QUESTIONS_PER_RACE}`],
            ['Most common slip', mis ? WORDS[mis] ?? '–' : '–'],
          ].map(([k, v]) => h('tr', {}, h('th', { scope: 'row', text: k }), h('td', { text: v })))),
        ),
      ),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const r = this.race;
    const s = this.scene;
    return {
      mode: this.mode,
      bolts: this.save.bolts,
      owned: [...this.save.owned],
      look: { ...this.save.look },
      wins: this.save.wins,
      races: this.save.races,
      tier: skill(this.save.learner, SKILL).tier,
      introSeen: this.save.introSeen,
      talking: this.talk.isOpen,
      race: r ? { q: r.q, problem: r.problem, correct: r.correct, missed: r.missed.length, place: r.place, playerDone: r.playerDone, rivalDone: r.rivalDone, hinted: r.hinted, theme: r.theme, gateS: r.gate?.s ?? null } : null,
      player: { s: s.player.s, x: s.player.x, level: s.player.level, speed: s.player.speed },
      rival: { s: s.rival.s, x: s.rival.x },
      finishS: s.finishS,
    };
  }
}
