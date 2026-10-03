import { lookFromAppearance, type CharacterLook } from '../../kit/art/characters';
import { iconImg } from '../../kit/art/icons';
import { paintPortrait, type Expression } from '../../kit/art/portraits';
import { bus } from '../../kit/core/events';
import { mulberry32 } from '../../kit/core/rng';
import { recordAnswer, skill, topMisconception, type SkillRules } from '../../kit/learning/mastery';
import { PixelRenderer } from '../../kit/render/pixelRenderer';
import { audio } from '../../kit/systems/audio';
import { Input } from '../../kit/systems/input';
import { applySettingsToDocument, isTouchDevice, settings, touchControlsVisible, updateSettings } from '../../kit/systems/settings';
import { setReadAloudDefault, speak, stopSpeaking } from '../../kit/systems/speech';
import { openCustomize } from '../../kit/ui/customize';
import { choose, h, Modal, stackTop } from '../../kit/ui/dom';
import { openGrownups } from '../../kit/ui/grownups';
import { mountToasts, toast, Toolbar } from '../../kit/ui/hud';
import { openSettings } from '../../kit/ui/settingsPanel';
import { Talk, type Speaker } from '../../kit/ui/talk';
import { TouchControls } from '../../kit/ui/touch';
import { showTitle } from '../../kit/ui/title';
import { paintClockIcon, paintGear, paintMedal } from './art';
import { ClockWidget } from './clockface';
import { ATTACK_INTRO, ATTACK_SECONDS, CONTROLS_TIP_KEYS, CONTROLS_TIP_TOUCH, FINALE, GROWNUPS, hintText, mistakeLine, OPENING, praise, promptFor, STARS_PER_STATION, STATION_INFO, TOCK } from './content';
import { ATTACK_SONG, EVENING_SONG, TOWN_SONG } from './music';
import { pix } from './pix';
import { attackProblem, countOn, diagnoseSet, fmt, fmtDuration, makeProblem, medalFor, STATIONS, words, type Choice, type Misconception, type Problem, type Station, type Tier } from './problems';
import { freshSave, store, type ClockSave } from './save';
import { TownWorld, type Target } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_STATION = 12;

const LOOKS: Record<Station | 'tock', CharacterLook> = {
  tock: {
    build: 'adult',
    skin: { base: '#7a4a2e', shade: '#633b23' },
    hair: { style: 'short', base: '#b9b7b4', shade: '#8f8c89', light: '#dedbd6' },
    shirt: { base: '#f4f1e8', shade: '#d9d3c4' },
    pants: '#3a3a46',
    shoes: '#2b1d1e',
    accessory: 'glasses',
    accent: '#c9a227',
    extras: { mustache: '#dedbd6', apron: '#84502f' },
  },
  school: {
    build: 'adult',
    skin: { base: '#c08a5c', shade: '#a47049' },
    hair: { style: 'bun', base: '#4a2f22', shade: '#352016', light: '#664433' },
    shirt: { base: '#2f9a94', shade: '#237872' },
    pants: '#2b3a67',
    shoes: '#2b1d1e',
    accessory: 'none',
    accent: '#f2c94c',
    extras: { skirt: { base: '#2b3a67', shade: '#202c4f' } },
  },
  bus: {
    build: 'adult',
    skin: { base: '#5a3825', shade: '#462a1b' },
    hair: { style: 'short', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
    shirt: { base: '#4b7fcf', shade: '#3a64a6' },
    pants: '#2b2b33',
    shoes: '#2b1d1e',
    accessory: 'cap',
    accent: '#f2c94c',
    extras: { beard: '#2a1f1d' },
  },
  bakery: {
    build: 'adult',
    skin: { base: '#f0c9a4', shade: '#d9ab86' },
    hair: { style: 'curly', base: '#9c4a2c', shade: '#7a3620', light: '#bd6440' },
    shirt: { base: '#f4f1e8', shade: '#d9d3c4' },
    pants: '#5c3822',
    shoes: '#2b1d1e',
    accessory: 'none',
    accent: '#e47aa6',
    extras: { apron: '#e47aa6' },
  },
};

type Mode = 'title' | 'world' | 'busy' | 'station' | 'attack';

interface Panel {
  modal: Modal;
  station: Station;
  problem: Problem;
  promptText: string;
  hintRung: number;
  tries: number;
  recorded: boolean;
  answered: boolean;
  clocks: ClockWidget[];
  setClock: ClockWidget | null;
  feedback: HTMLElement;
  hintBtn: HTMLButtonElement;
  check: HTMLButtonElement;
  next: HTMLButtonElement;
  body: HTMLElement;
  stars: HTMLElement;
  level: HTMLElement;
  prompt: HTMLElement;
}

interface Attack {
  modal: Modal;
  score: number;
  endsAt: number;
  problem: Problem;
  clock: ClockWidget;
  choices: HTMLElement;
  bar: HTMLElement;
  scoreEl: HTMLElement;
  locked: boolean;
  done: boolean;
  seed: number;
}

export class Game {
  private readonly r: PixelRenderer;
  private readonly world: TownWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: ClockSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private partsEl!: HTMLElement;
  private bestEl!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<Station | 'tock', Speaker>;
  private panel: Panel | null = null;
  private attack: Attack | null = null;
  private praiseCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    this.save = store.exists() ? store.load() : freshSave();
    this.r = new PixelRenderer(host);
    this.world = new TownWorld(this.r);
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: Station | 'tock', name: string, role: string, voice: number): Speaker => ({
      name,
      role,
      voice,
      portrait: (e: Expression) => {
        const key = `${id}-${e}`;
        let u = cache.get(key);
        if (!u) cache.set(key, (u = paintPortrait(LOOKS[id], e).toDataURL(3)));
        return u;
      },
    });
    this.speakers = {
      tock: speaker('tock', TOCK.name, TOCK.role, 150),
      school: speaker('school', STATION_INFO.school.person.name, STATION_INFO.school.person.role, 240),
      bus: speaker('bus', STATION_INFO.bus.person.name, STATION_INFO.bus.person.role, 130),
      bakery: speaker('bakery', STATION_INFO.bakery.person.name, STATION_INFO.bakery.person.role, 200),
    };
    audio.addSong('town', TOWN_SONG);
    audio.addSong('attack', ATTACK_SONG);
    audio.addSong('evening', EVENING_SONG);
    this.world.onArrive = (t) => this.use(t);
    this.world.onChime = (hour) => this.chime(Math.min(3, hour));
    window.addEventListener('resize', () => this.r.resize());
    this.r.canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    this.input.onAction((a) => this.onAction(a));
    bus.on('settings:changed', () => {
      this.world.reducedMotion = settings.reducedMotion;
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
      this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
    });
    this.world.reducedMotion = settings.reducedMotion;
    this.buildHud();
    mountToasts(host);
    window.addEventListener('keydown', (e) => {
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) this.onStationKey(e);
      else if (this.attack && stackTop() === this.attack.modal) this.onAttackKey(e);
    });
    (window as unknown as { __tac: unknown }).__tac = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      /** test helpers */
      open: (s: Station) => this.mode === 'world' && void this.openStation(s),
      attack: () => this.mode === 'world' && this.openAttack(),
      setTier: (s: Station, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      endAttack: () => this.attack && (this.attack.endsAt = performance.now()),
    };
  }

  start(): void {
    const names = { tock: TOCK.name, school: STATION_INFO.school.person.name, bus: STATION_INFO.bus.person.name, bakery: STATION_INFO.bakery.person.name };
    this.world.build(this.playerLook(), LOOKS, names, this.save.done);
    if (this.save.finaleSeen) this.world.setFixed(this.save.done, true);
    this.updateMarkers();
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.input.worldActive = this.mode === 'world' && !document.querySelector('.modal-back') && !this.talk.isOpen;
      this.world.update(dt, this.mode === 'world' ? this.input : null);
      this.updatePrompt();
      if (this.attack) this.tickAttack(now);
      this.world.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private playerLook(): CharacterLook {
    return lookFromAppearance(this.save.appearance);
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Time Attack Clock',
      subtitle: 'Fix the town clock tower',
      intro: ['The clock tower has stopped! Help the school, the bus stop and the bakery with their clocks, and each job brings back part of the tower.', 'For grades 1 to 3. Every line can be read aloud.'],
      hasSave: store.exists(),
      continueGame: () => {
        audio.unlock();
        this.enterWorld();
      },
      newGame: () => {
        audio.unlock();
        void this.newGame();
      },
      settings: () => openSettings(this.host, { grownups: () => this.openGrownups() }),
      grownups: () => this.openGrownups(),
    });
  }

  private async newGame(): Promise<void> {
    if (store.exists()) {
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your stars and medals in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.setFixed([]);
      this.updateMarkers();
    }
    this.titleEl?.remove();
    this.titleEl = null;
    openCustomize(this.host, this.save.appearance, { firstTime: true, noun: 'time keeper' }, (a) => {
      this.save.appearance = a;
      this.persist();
      this.world.player.setLook(this.playerLook());
      this.enterWorld();
    });
  }

  private enterWorld(): void {
    this.titleEl?.remove();
    this.titleEl = null;
    this.hud.hidden = false;
    this.mode = 'world';
    audio.play(this.save.finaleSeen ? 'evening' : 'town');
    this.renderHud();
    if (!this.save.openingSeen) void this.opening();
  }

  private async opening(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers.tock, OPENING);
    await this.talk.say(this.speakers.tock, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'curious');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
  }

  private updateMarkers(): void {
    const all = STATIONS.every((s) => this.save.done.includes(s));
    this.world.setMarkers({
      school: this.save.done.includes('school') ? null : 'new',
      bus: this.save.done.includes('bus') ? null : 'new',
      bakery: this.save.done.includes('bakery') ? null : 'new',
      tock: all && !this.save.finaleSeen ? 'turnin' : null,
    });
  }

  // ------------------------------------------------------------ the world

  private updatePrompt(): void {
    const t = this.mode === 'world' ? this.world.nearest() : null;
    this.target = t;
    if (!t) {
      this.promptEl.hidden = true;
      this.touch?.setActLabel(null);
      return;
    }
    const label = t.label;
    if (this.promptEl.dataset.label !== label) {
      this.promptEl.dataset.label = label;
      this.promptEl.replaceChildren(h('span', { text: label }), ...(isTouchDevice() ? [] : [h('span', { class: 'kbd', text: 'Space' })]));
    }
    const s = this.world.screenOf(t, 2.6);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel('Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'station' || this.mode === 'attack') return;
    if (a === 'interact' && this.mode === 'world' && this.target) this.use(this.target);
    else if (a === 'mute') this.toggleMute();
    else if (a === 'menu' && this.mode === 'world') this.openSettingsPanel();
    else if (a === 'grownups' && this.mode !== 'title') this.openGrownups();
  }

  private onPointer(e: PointerEvent): void {
    if (this.mode !== 'world' || this.talk.isOpen) return;
    audio.unlock();
    const rect = this.host.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    let best: Target | null = null;
    let bd = 60;
    for (const t of this.world.targets) {
      const s = this.world.screenOf(t, 0.8);
      const d = Math.hypot(s.x - cx, s.y - cy);
      if (d < bd) {
        bd = d;
        best = t;
      }
    }
    if (best) return this.world.walkTo(best);
    const tile = this.world.tileAt(cx, cy);
    if (tile) this.world.walkTo(null, tile);
  }

  private use(t: Target): void {
    if (this.mode !== 'world') return;
    this.world.stopWalking();
    if (t.id === 'tock') void this.talkToTock();
    else void this.openStation(t.id);
  }

  private async talkToTock(): Promise<void> {
    this.mode = 'busy';
    const all = STATIONS.every((s) => this.save.done.includes(s));
    if (all && !this.save.finaleSeen) {
      await this.finale();
      this.mode = 'world';
      return;
    }
    const next = STATIONS.find((s) => !this.save.done.includes(s));
    const text = next ? `Hello, time keeper! ${STATION_INFO[next].person.name} at the ${STATION_INFO[next].name} still needs help. Or would you like a Time Attack?` : `The whole town is on time, thanks to you! Your best Time Attack is ${this.save.best}. Want to try again?`;
    const pick = await this.talk.offer(this.speakers.tock, text, ['Time Attack!', 'Change how I look', 'Bye, Mr. Tock!']);
    this.talk.end();
    this.mode = 'world';
    if (pick === 0) this.openAttack();
    else if (pick === 1) this.changeLook();
  }

  private changeLook(): void {
    openCustomize(this.host, this.save.appearance, { firstTime: false, noun: 'time keeper' }, (a) => {
      this.save.appearance = a;
      this.persist();
      this.world.player.setLook(this.playerLook());
    });
  }

  // ------------------------------------------------------------ stations

  private async openStation(station: Station): Promise<void> {
    this.mode = 'busy';
    const info = STATION_INFO[station];
    const who = this.speakers[station];
    if (!this.save.introduced.includes(station)) {
      await this.talk.say(who, info.intro);
      this.talk.end();
      this.save.introduced.push(station);
      this.persist();
    }
    this.mode = 'station';
    this.touch?.setVisible(false);
    const level = h('span', { class: 'tac-level' });
    const stars = h('span', { class: 'tac-stars', role: 'img' });
    const prompt = h('p', { class: 'tac-prompt' });
    const speakBtn = h('button', { class: 'btn small tac-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => speak(prompt.textContent ?? '', { force: true }));
    const feedback = h('div', { class: 'tac-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const body = h('div', { class: 'tac-body' });
    const hintBtn = h('button', { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' });
    const check = h('button', { class: 'btn primary tac-check', type: 'button', hidden: true }, iconImg('check', '', 22), h('span', { text: 'Check my clock' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'Enter' }));
    check.addEventListener('click', () => this.checkSet());
    const face = h('img', { class: 'tac-host', src: who.portrait('smile'), alt: who.name, width: 96, height: 96 });
    const root = h(
      'div',
      { class: `panel modal tac-panel tac-${station}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tac-title' },
      h('header', {}, h('h2', { id: 'tac-title', text: info.name }), h('div', { class: 'tac-head-right' }, level, stars, h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }))),
      h('div', { class: 'tac-ask' }, face, prompt, speakBtn),
      body,
      feedback,
      h('footer', { class: 'tac-foot' }, hintBtn, check, next),
    );
    const modal = new Modal(this.host, root, () => this.closeStation(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = { modal, station, problem: null as unknown as Problem, promptText: '', hintRung: 0, tries: 0, recorded: false, answered: false, clocks: [], setClock: null, feedback, hintBtn, check, next, body, stars, level, prompt };
    this.nextChallenge();
  }

  private clockSize(): number {
    return Math.max(170, Math.min(250, Math.floor(Math.min(window.innerWidth * 0.55, window.innerHeight * 0.34))));
  }

  private nextChallenge(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const seed = this.save.seed++;
    const p = makeProblem(pnl.station, skill(this.save.learner, pnl.station).tier as Tier, mulberry32(seed));
    this.persist();
    pnl.problem = p;
    pnl.hintRung = 0;
    pnl.tries = 0;
    pnl.recorded = false;
    pnl.answered = false;
    pnl.clocks = [];
    pnl.setClock = null;
    pnl.promptText = promptFor(p, seed);
    pnl.prompt.textContent = pnl.promptText;
    pnl.level.textContent = `Level ${p.tier} of 3`;
    pnl.feedback.hidden = true;
    pnl.next.hidden = true;
    pnl.hintBtn.disabled = false;
    pnl.check.hidden = p.kind !== 'set';
    pnl.body.replaceChildren(this.renderProblem(p));
    this.renderStars();
    speak(pnl.promptText);
    requestAnimationFrame(() => {
      if (pnl.setClock) pnl.setClock.focus();
      else [...pnl.body.querySelectorAll<HTMLButtonElement>('button:not([disabled])')].find((b) => b.offsetParent !== null)?.focus();
    });
  }

  private choiceButtons(choices: Choice[], onPick: (c: Choice) => void): HTMLElement {
    return h(
      'div',
      { class: 'tac-choices' },
      ...choices.map((c, i) =>
        h(
          'button',
          { class: 'btn tac-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), onclick: () => onPick(c) },
          h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          h('span', { class: 'tac-choice-text', text: c.label }),
        ),
      ),
    );
  }

  private renderProblem(p: Problem): HTMLElement {
    const pnl = this.panel!;
    const size = this.clockSize();
    if (p.kind === 'read') {
      const clock = new ClockWidget({ time: p.time, size });
      pnl.clocks.push(clock);
      return h('div', { class: 'tac-stage' }, clock.el, legend(), this.choiceButtons(p.choices, (c) => this.onAnswer(c.correct, c.misconception ?? null, c.value)));
    }
    if (p.kind === 'set') {
      const clock = new ClockWidget({ time: p.start, size, interactive: true, step: p.step, onChange: () => audio.click() });
      pnl.clocks.push(clock);
      pnl.setClock = clock;
      const target = h('div', { class: 'tac-target' }, h('span', { text: 'Make it' }), h('strong', { class: 'tac-target-time', text: p.words ? words(p.time) : fmt(p.time) }));
      return h('div', { class: 'tac-stage' }, target, clock.el);
    }
    // elapsed: the start clock, and either the end clock or "+ 25 minutes"
    const small = Math.max(140, Math.floor(size * 0.72));
    const start = new ClockWidget({ time: p.start, size: small, caption: `In the oven: ${fmt(p.start)}` });
    pnl.clocks.push(start);
    let second: HTMLElement;
    if (p.ask === 'duration') {
      const end = new ClockWidget({ time: p.end, size: small, caption: `Out of the oven: ${fmt(p.end)}` });
      pnl.clocks.push(end);
      second = end.el;
    } else second = h('div', { class: 'tac-mystery', style: `width:${small}px;height:${small}px` }, h('span', { class: 'tac-plus', text: `+ ${fmtDuration(p.minutes)}` }), h('span', { class: 'tac-q', text: '?' }), h('span', { class: 'tac-mystery-note', text: 'Ready at...' }));
    const path = h('div', { class: 'tac-path', hidden: true, 'aria-label': 'Count on' });
    return h('div', { class: 'tac-stage' }, h('div', { class: 'tac-pair' }, start.el, h('span', { class: 'tac-arrow', 'aria-hidden': 'true' }, iconImg('arrowRight', '', 28)), second), path, this.choiceButtons(p.choices, (c) => this.onAnswer(c.correct, c.misconception ?? null, c.value)));
  }

  private renderStars(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const n = this.save.stars[pnl.station];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_STATION }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_STATION} stars`);
  }

  private checkSet(): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered || pnl.problem.kind !== 'set' || !pnl.setClock) return;
    const mis = diagnoseSet(pnl.setClock.time, pnl.problem.time);
    this.onAnswer(mis === null, mis, fmt(pnl.setClock.time));
  }

  private onAnswer(correct: boolean, mis: Misconception | null, value: string): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered) return;
    const p = pnl.problem;
    if (correct) {
      pnl.answered = true;
      const clean = pnl.tries === 0 && pnl.hintRung <= 1;
      let tierChange = 0;
      if (!pnl.recorded) {
        pnl.recorded = true;
        tierChange = recordAnswer(this.save.learner, p.station, { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
      }
      this.save.played[p.station]++;
      if (clean && this.save.stars[p.station] < STARS_PER_STATION) this.save.stars[p.station]++;
      this.persist();
      if (clean) audio.itemGet();
      else audio.correct();
      if (p.station === 'bus') this.world.callBus();
      const msg = clean ? `${praise(this.praiseCount++)} You win a star.` : 'You got it! Stars are for getting it right the first time.';
      this.showFeedback(msg, 'good');
      pnl.next.hidden = false;
      pnl.check.hidden = true;
      pnl.hintBtn.disabled = true;
      pnl.body.querySelector(`.tac-choice[data-value="${CSS.escape(value)}"]`)?.classList.add('right');
      pnl.body.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
      pnl.setClock?.setLocked(true);
      pnl.setClock?.el.classList.add('right');
      this.renderStars();
      if (tierChange > 0) toast('Level up! Trickier clocks.', 'reward');
      requestAnimationFrame(() => pnl.next.focus());
      return;
    }
    pnl.tries++;
    if (!pnl.recorded) {
      pnl.recorded = true;
      const o = recordAnswer(this.save.learner, p.station, { correct: false, hintRung: pnl.hintRung, misconception: mis }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let us practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(mistakeLine(p, mis ?? 'other'), 'try');
    const picked = pnl.body.querySelector<HTMLButtonElement>(`.tac-choice[data-value="${CSS.escape(value)}"]`);
    if (picked) {
      picked.disabled = true;
      picked.classList.add('nope');
      pnl.body.querySelector<HTMLButtonElement>('.tac-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `tac-feedback ${kind}`;
    pnl.feedback.replaceChildren(kind === 'hint' ? iconImg('bulb', '', 22) : kind === 'good' ? iconImg('star', '', 22) : '', h('span', { text }));
    speak(text);
  }

  private hint(rung?: number): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered) return;
    const nextRung = Math.min(3, rung ?? pnl.hintRung + 1);
    if (nextRung <= pnl.hintRung && rung === undefined) {
      toast('That is every hint. The answer is shown!', 'hint');
      return;
    }
    pnl.hintRung = Math.max(pnl.hintRung, nextRung);
    audio.hint();
    const p = pnl.problem;
    const k = pnl.hintRung;
    if (p.kind === 'read') {
      if (k >= 2) pnl.clocks[0].setHints({ hourWedge: true, minuteNumbers: p.tier > 1 });
      if (k >= 3) pnl.body.querySelector(`.tac-choice[data-value="${CSS.escape(p.choices.find((c) => c.correct)!.value)}"]`)?.classList.add('worked');
    } else if (p.kind === 'set') {
      if (k >= 2) pnl.setClock?.setHints({ minuteNumbers: true });
      if (k >= 3) pnl.setClock?.setHints({ ghost: p.time });
    } else {
      if (k >= 2) {
        pnl.clocks.forEach((c) => c.setHints({ minuteNumbers: true }));
        this.renderPath(p);
      }
      if (k >= 3) pnl.body.querySelector(`.tac-choice[data-value="${CSS.escape(p.choices.find((c) => c.correct)!.value)}"]`)?.classList.add('worked');
    }
    this.showFeedback(`Hint ${k} of 3: ${hintText(p, k)}`, 'hint');
  }

  /** The count-on jumps under the clocks (the last time stays a "?" when it is the answer). */
  private renderPath(p: Problem): void {
    const pnl = this.panel;
    if (!pnl || p.kind !== 'elapsed') return;
    const el = pnl.body.querySelector<HTMLElement>('.tac-path');
    if (!el) return;
    const steps = countOn(p.start, p.end);
    const parts: HTMLElement[] = [h('span', { class: 'tac-path-time', text: fmt(p.start) })];
    steps.forEach((s, i) => {
      const last = i === steps.length - 1;
      parts.push(h('span', { class: 'tac-path-add', text: p.ask === 'duration' && steps.length === 1 ? '+ ?' : s.add % 60 === 0 ? `+${s.add / 60} hr` : `+${s.add} min` }));
      parts.push(h('span', { class: 'tac-path-time', text: p.ask === 'end' && last ? '?' : fmt(s.to) }));
    });
    el.replaceChildren(...parts);
    el.hidden = false;
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    const s = pnl.station;
    const rec = skill(this.save.learner, s);
    const ready = this.save.stars[s] >= STARS_PER_STATION && (rec.tier >= 2 || this.save.played[s] >= MAX_PER_STATION);
    if (ready && !this.save.done.includes(s)) {
      pnl.modal.close();
      void this.finishStation(s);
    } else this.nextChallenge();
  }

  private onStationKey(e: KeyboardEvent): void {
    const pnl = this.panel;
    if (!pnl) return;
    const k = e.key.toLowerCase();
    if (k === 'h') {
      e.preventDefault();
      this.hint();
    } else if ((k === ' ' || k === 'enter') && pnl.answered && document.activeElement !== pnl.next) {
      e.preventDefault();
      this.afterAnswer();
    } else if (k === 'enter' && !pnl.answered && pnl.problem.kind === 'set' && !(document.activeElement instanceof HTMLButtonElement && !document.activeElement.classList.contains('tac-hand-btn'))) {
      // Enter checks the clock, even right after using the hand arrows (instead of pressing that arrow again)
      e.preventDefault();
      this.checkSet();
    } else if (/^[1-3]$/.test(k)) {
      const b = pnl.body.querySelectorAll<HTMLButtonElement>('.tac-choice')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closeStation(): void {
    stopSpeaking();
    this.panel = null;
    if (this.mode === 'station') this.mode = 'world';
    this.touch?.setVisible(touchControlsVisible());
    this.renderHud();
  }

  private async finishStation(s: Station): Promise<void> {
    this.mode = 'busy';
    const info = STATION_INFO[s];
    const who = this.speakers[s];
    await this.talk.say(who, 'Five stars! Before you go, one question.', 'proud');
    const res = await this.talk.ask(who, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${s}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(s);
    this.persist();
    this.world.setFixed(this.save.done);
    this.updateMarkers();
    audio.levelUp();
    toast(`${info.fixName[0].toUpperCase()}${info.fixName.slice(1)} ${info.fixes === 'hands' ? 'are' : 'is'} back on the tower!`, 'reward');
    await this.talk.say(who, info.done, 'proud');
    const left = STATIONS.filter((x) => !this.save.done.includes(x));
    await this.talk.say(this.speakers.tock, left.length ? `Look! ${info.fixName[0].toUpperCase()}${info.fixName.slice(1)} ${info.fixes === 'hands' ? 'are' : 'is'} fixed. ${left.length} more job${left.length === 1 ? '' : 's'} to go!` : 'That was the last part! Come and see me at the tower.', 'proud');
    this.talk.end();
    this.renderHud();
    this.mode = 'world';
  }

  private async finale(): Promise<void> {
    this.world.setFixed(this.save.done, true);
    audio.play('evening');
    this.chime(3);
    await this.talk.say(this.speakers.tock, FINALE, 'proud');
    this.talk.end();
    this.save.finaleSeen = true;
    this.persist();
    this.updateMarkers();
  }

  /** The tower bell: BONG, a few times. */
  private chime(times: number): void {
    const notes: Array<[number, number, number]> = [];
    for (let i = 0; i < times; i++) notes.push([60, i * 0.7, 0.55], [67, i * 0.7, 0.55]);
    audio.fx(notes, 'sine', 0.14);
  }

  // ------------------------------------------------------------ Time Attack

  private openAttack(): void {
    if (this.mode !== 'world') return;
    this.mode = 'attack';
    this.touch?.setVisible(false);
    const bar = h('div', { class: 'tac-timer-fill' });
    const scoreEl = h('strong', { class: 'tac-attack-score', text: '0' });
    const choices = h('div', { class: 'tac-choices' });
    const clock = new ClockWidget({ time: { h: 12, m: 0 }, size: Math.min(230, this.clockSize()) });
    const startBtn = h('button', { class: 'btn primary big', type: 'button', text: 'Go!', 'data-autofocus': true });
    const intro = h('div', { class: 'tac-attack-intro' }, h('p', { text: ATTACK_INTRO }), h('p', { class: 'small-note', text: `Your best: ${this.save.best}` }), startBtn);
    const play = h('div', { class: 'tac-stage', hidden: true }, clock.el, choices);
    const root = h(
      'div',
      { class: 'panel modal tac-panel tac-attack', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'tac-attack-title' },
      h('header', {}, h('h2', { id: 'tac-attack-title', text: 'Time Attack' }), h('div', { class: 'tac-head-right' }, h('span', { text: 'Clocks: ' }), scoreEl, h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Stop' : 'Stop (Esc)', onclick: () => modal.close() }))),
      h('div', { class: 'tac-timer', role: 'progressbar', 'aria-label': 'Time left' }, bar),
      h('div', { class: 'tac-body' }, intro, play),
    );
    const modal = new Modal(this.host, root, () => this.closeAttack(), { closeOnBackdrop: false });
    this.attack = { modal, score: 0, endsAt: Infinity, problem: null as unknown as Problem, clock, choices, bar, scoreEl, locked: true, done: false, seed: this.save.seed };
    speak(ATTACK_INTRO);
    startBtn.addEventListener('click', () => {
      const a = this.attack;
      if (!a) return;
      stopSpeaking();
      intro.hidden = true;
      play.hidden = false;
      a.endsAt = performance.now() + ATTACK_SECONDS * 1000;
      audio.play('attack');
      this.nextAttack();
    });
  }

  private nextAttack(): void {
    const a = this.attack;
    if (!a || a.done) return;
    const tier = Math.max(1, Math.min(3, skill(this.save.learner, 'school').tier)) as Tier;
    a.problem = attackProblem(tier, mulberry32(a.seed++));
    if (a.problem.kind !== 'read') return;
    a.clock.setTime(a.problem.time);
    a.choices.replaceChildren(
      ...a.problem.choices.map((c, i) =>
        h(
          'button',
          { class: 'btn tac-choice', type: 'button', 'data-value': c.value, onclick: () => this.attackPick(c) },
          h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          h('span', { class: 'tac-choice-text', text: c.label }),
        ),
      ),
    );
    a.locked = false;
    a.choices.querySelector<HTMLButtonElement>('button')?.focus();
  }

  private attackPick(c: Choice): void {
    const a = this.attack;
    if (!a || a.locked || a.done) return;
    a.locked = true;
    const btn = a.choices.querySelector(`.tac-choice[data-value="${CSS.escape(c.value)}"]`);
    if (c.correct) {
      a.score++;
      a.scoreEl.textContent = String(a.score);
      audio.correct();
      btn?.classList.add('right');
      setTimeout(() => this.nextAttack(), 260);
    } else {
      audio.retry();
      btn?.classList.add('nope');
      // show the right one for a moment, so a miss still teaches
      if (a.problem.kind === 'read') {
        const right = a.problem.choices.find((x) => x.correct)!;
        a.choices.querySelector(`.tac-choice[data-value="${CSS.escape(right.value)}"]`)?.classList.add('right');
      }
      setTimeout(() => this.nextAttack(), 1100);
    }
  }

  private tickAttack(now: number): void {
    const a = this.attack;
    if (!a || a.done || a.endsAt === Infinity) return;
    const left = Math.max(0, a.endsAt - now);
    a.bar.style.width = `${(left / (ATTACK_SECONDS * 1000)) * 100}%`;
    a.bar.classList.toggle('low', left < 10000);
    if (left <= 0) this.finishAttack();
  }

  private finishAttack(): void {
    const a = this.attack;
    if (!a || a.done) return;
    a.done = true;
    a.locked = true;
    const score = a.score;
    const isBest = score > this.save.best;
    if (isBest) this.save.best = score;
    const medal = medalFor(score);
    if (medal && !this.save.medals.includes(medal)) this.save.medals.push(medal);
    this.save.seed = a.seed;
    this.persist();
    audio.play(this.save.finaleSeen ? 'evening' : 'town');
    if (medal) audio.levelUp();
    else audio.correct();
    const again = h('button', { class: 'btn primary', type: 'button', text: 'Play again', 'data-autofocus': true });
    const done = h('button', { class: 'btn', type: 'button', text: 'Done' });
    const line = `Time! You read ${score} clock${score === 1 ? '' : 's'}.${isBest && score > 0 ? ' That is your new best!' : ` Your best is ${this.save.best}.`}`;
    const note = medal ? `You win a ${medal} medal!` : 'Read 6 clocks to win a bronze medal.';
    const body = a.modal.root.querySelector('.tac-body')!;
    body.replaceChildren(h('div', { class: 'tac-attack-result' }, medal ? pix(`medal-${medal}`, () => paintMedal(medal), 5, `${medal} medal`) : pix('clock-icon', () => paintClockIcon(), 5), h('p', { class: 'tac-result-line', text: line }), h('p', { text: note }), h('div', { class: 'tac-result-buttons' }, again, done)));
    speak(`${line} ${note}`);
    again.addEventListener('click', () => {
      a.modal.close();
      requestAnimationFrame(() => this.openAttack());
    });
    done.addEventListener('click', () => a.modal.close());
    again.focus();
    this.renderHud();
  }

  private onAttackKey(e: KeyboardEvent): void {
    const a = this.attack;
    if (!a || a.done) return;
    if (/^[1-3]$/.test(e.key)) {
      const b = a.choices.querySelectorAll<HTMLButtonElement>('.tac-choice')[Number(e.key) - 1];
      if (b) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closeAttack(): void {
    stopSpeaking();
    if (this.attack && !this.attack.done) audio.play(this.save.finaleSeen ? 'evening' : 'town');
    this.attack = null;
    if (this.mode === 'attack') this.mode = 'world';
    this.touch?.setVisible(touchControlsVisible());
    this.renderHud();
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.partsEl = h('span', { class: 'tac-parts', role: 'img' });
    this.bestEl = h('span', { class: 'tac-best' });
    const bar = h('div', { class: 'panel tac-hudbar' }, this.partsEl, h('span', { class: 'tac-sep', 'aria-hidden': 'true' }), pix('hud-clock', () => paintClockIcon(), 2), this.bestEl);
    this.promptEl = h('button', { class: 'panel prompt', type: 'button', hidden: true, onclick: () => this.target && this.use(this.target) });
    this.hud = h('div', { class: 'hud', hidden: true }, bar, this.promptEl);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'jobs', label: 'Jobs', icon: 'scroll', key: 'J', onClick: () => this.openJobList() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'j' && this.mode === 'world' && !document.querySelector('.modal-back') && !this.talk.isOpen) this.openJobList();
    });
    this.touch = new TouchControls(this.hud, this.input, () => this.target && this.use(this.target));
    this.touch.setVisible(false);
  }

  private renderHud(): void {
    const parts = STATIONS.map((s) => {
      const on = this.save.done.includes(s);
      return h('span', { class: `tac-part${on ? ' on' : ''}`, title: STATION_INFO[s].fixName }, pix(`gear-${on}`, () => paintGear(on ? '#e0b13a' : '#7d7368'), 2));
    });
    this.partsEl.replaceChildren(...parts);
    this.partsEl.setAttribute('aria-label', `${this.save.done.length} of 3 tower parts fixed`);
    this.bestEl.textContent = `Best ${this.save.best}`;
    this.bestEl.title = 'Best Time Attack score';
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
  }

  private openJobList(): void {
    if (this.mode !== 'world') return;
    const rows = STATIONS.map((s) => {
      const info = STATION_INFO[s];
      const n = this.save.stars[s];
      const on = this.save.done.includes(s);
      return h(
        'li',
        { class: 'belt-row' },
        pix(`gear-${on}`, () => paintGear(on ? '#e0b13a' : '#7d7368'), 2),
        h('div', { class: 'belt-info' }, h('strong', { text: `${info.name}: ${info.skill}` }), h('span', { text: on ? `Done! You fixed ${info.fixName}.` : `Help ${info.person.name} to fix ${info.fixName}.` }), h('span', { class: 'belt-stars', 'aria-label': `${n} of 5 stars` }, ...Array.from({ length: 5 }, (_, k) => iconImg(k < n ? 'star' : 'starEmpty', '', 18)))),
        h('button', {
          class: 'btn small',
          type: 'button',
          text: 'Walk there',
          onclick: () => {
            modal.close();
            const t = this.world.targets.find((x) => x.id === s);
            if (t) this.world.walkTo(t);
          },
        }),
      );
    });
    const medals = this.save.medals.length ? this.save.medals.map((m) => pix(`medal-${m}`, () => paintMedal(m), 2, `${m} medal`)) : [h('span', { text: 'No medals yet' })];
    rows.push(
      h(
        'li',
        { class: 'belt-row' },
        pix('clock-icon', () => paintClockIcon(), 2),
        h('div', { class: 'belt-info' }, h('strong', { text: 'Time Attack with Mr. Tock' }), h('span', { text: `Best: ${this.save.best} clocks in ${ATTACK_SECONDS} seconds` }), h('span', { class: 'belt-stars' }, ...medals)),
        h('button', {
          class: 'btn small',
          type: 'button',
          text: 'Walk there',
          onclick: () => {
            modal.close();
            const t = this.world.targets.find((x) => x.id === 'tock');
            if (t) this.world.walkTo(t);
          },
        }),
      ),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jobs-title', style: 'width:min(620px,100%)' },
      h('header', {}, h('h2', { id: 'jobs-title', text: 'Town jobs' }), h('button', { class: 'btn small', type: 'button', text: 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', style: 'margin:0 0 10px', text: 'Win 5 stars at a job to fix part of the clock tower. A star is for getting it right the first time.' }), h('ul', { class: 'belt-list' }, ...rows)),
    );
    const modal = new Modal(this.host, root);
  }

  private toggleMute(): void {
    updateSettings({ muted: !settings.muted });
    if (settings.muted) stopSpeaking();
    toast(settings.muted ? 'Sound off (M to turn it back on)' : 'Sound on');
  }

  private openSettingsPanel(): void {
    if (this.mode === 'title') return;
    openSettings(this.host, {
      changeLook: () => this.changeLook(),
      grownups: () => this.openGrownups(),
      resetSave: async () => {
        const ok = await choose(this.host, 'Start over?', 'This erases your stars and medals in this browser. Settings are kept.', [
          { id: 'yes', label: 'Yes, erase my progress', kind: 'danger' },
          { id: 'no', label: 'No, keep playing' },
        ]);
        if (ok === 'yes') {
          store.reset();
          window.location.reload();
        }
      },
    });
  }

  private openGrownups(): void {
    openGrownups(this.host, GROWNUPS, () => this.progressReport());
  }

  private progressReport(): HTMLElement {
    const WORDS: Record<string, string> = {
      swapped: 'swapping the hour and minute hands',
      'next-hour': 'reading the next hour when the hour hand is close to it (2:45 as 3:45)',
      'prev-hour': 'reading one hour too few',
      'by-ones': 'reading the number the minute hand points to as minutes (on the 4 = 4 minutes)',
      backwards: 'counting minutes the wrong way round',
      'half-hour': "mixing up o'clock and half past",
      'past-to': 'mixing up "past" and "to"',
      'to-hour': '"quarter to" with the wrong hour',
      'off-five': 'one five-minute step off',
      'off-one': 'a minute or two off',
      'off-hour': 'an hour off',
      'gave-start': 'giving the start time',
      'hundred-minutes': 'subtracting times like ordinary numbers (65 minutes from 2:50 to 3:15)',
      'minutes-only': 'taking away only the minute numbers',
      'no-carry': 'going past 60 minutes (2:75)',
      'same-hour': 'keeping the old hour after passing it',
    };
    const rows = STATIONS.map((s) => {
      const rec = this.save.learner[s];
      const mis = topMisconception(rec);
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: `${STATION_INFO[s].name} (${STATION_INFO[s].skill})` }),
        h('td', { text: this.save.done.includes(s) ? 'Done' : rec ? 'In progress' : 'Not started' }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? WORDS[mis] ?? '–' : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', { text: `This summary is kept only in this browser. Best Time Attack: ${this.save.best} clocks in ${ATTACK_SECONDS} seconds.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Job', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const pnl = this.panel;
    const a = this.attack;
    return {
      mode: this.mode,
      player: { x: this.world.player.x, y: this.world.player.y },
      target: this.target ? this.target.id : null,
      stars: { ...this.save.stars },
      done: [...this.save.done],
      best: this.save.best,
      medals: [...this.save.medals],
      talking: this.talk.isOpen,
      station: pnl ? { station: pnl.station, problem: pnl.problem, hintRung: pnl.hintRung, answered: pnl.answered, tier: skill(this.save.learner, pnl.station).tier, set: pnl.setClock?.time ?? null } : null,
      attack: a ? { score: a.score, done: a.done, problem: a.problem, running: a.endsAt !== Infinity } : null,
      townTime: this.world.townTime,
      tower: this.world.towerParts,
      busX: this.world.busPosition,
      night: this.world.night,
      finaleSeen: this.save.finaleSeen,
    };
  }
}

/** The key for the two hands, under each clock. */
function legend(): HTMLElement {
  return h('div', { class: 'tac-legend', 'aria-hidden': 'true' }, h('span', { class: 'tac-key hour' }, h('i', {}), 'Short hand: hour'), h('span', { class: 'tac-key minute' }, h('i', {}), 'Long hand: minutes'));
}

