import { iconImg } from '../../kit/art/icons';
import type { Expression } from '../../kit/art/portraits';
import { bus } from '../../kit/core/events';
import { mulberry32 } from '../../kit/core/rng';
import { recordAnswer, skill, topMisconception, type SkillRules } from '../../kit/learning/mastery';
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
import { HAIR16, look16FromAppearance, paintHero, paintPortrait16, type Look16, type Mood } from '../../kit/worlds';
import '../../kit/worlds/worlds.css';
import { KOFI_MENSAH, LUMI_REYES, NAVIGATOR_SOL, TESS_ROCKET, paintGlobeLab, paintOrrery, paintPlanet, paintPostcard, paintStarMap, paintVeePortrait } from '../../kit/worlds/star-station/space-art';
import { CONSTELLATION_NAME, LAMP_TAGS, paintCannon, paintConstellation, paintDown, paintLamps, paintLensIcon, paintMoonlight, paintPlanetButton, paintPlanetRow, paintSeasonOrbit, paintSkyScene, paintStarParty, paintStarSky, paintStationIcon, paintSunArc, paintTilt, YEARS } from './art';
import {
  ALL_DONE,
  arrival,
  BONUS,
  BONUS_ORDER,
  FLYBY,
  PALE_DOT,
  PALE_DOT_FACT,
  PARTY_END,
  PARTY_LINES,
  ROUTE_DONE,
  ROUTE_TIP,
  SNAP_TIP_KEYS,
  SNAP_TIP_TOUCH,
  START_TOUR,
  TOUR_INTRO,
  TOUR_QUESTION_LINE,
  TOUR_QUESTIONS,
  type Bonus,
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  DIVE_TIP_KEYS,
  DIVE_TIP_TOUCH,
  DRIVE_TIP_KEYS,
  DRIVE_TIP_TOUCH,
  GROWNUPS,
  MAP_TIP,
  OPENING,
  OPENING_END,
  PEOPLE,
  PERSON_OF,
  postcardLine,
  praise,
  STARS_PER_STATION,
  STATION_INFO,
  STATION_OF,
  VEE,
  VEE_HELLO,
  type PersonId,
} from './content';
import { CloudDive, FIND_ORDER, type FindKind } from './dive';
import { pix } from './pix';
import { bank, FACTS, makeQuestion, OPEN_STATIONS, PLANET_ORDER, STATIONS, stopQuestion, type Choice, type Misconception, type PlanetId, type Question, type Station, type Tier } from './problems';
import { freshSave, store, type ExplorerSave } from './save';
import { OBSERVATORY_SONG, PARTY_SONG, PLANET_SONG, STATION_SONG, TOUR_SONG } from './music';
import { Flyby } from './tour';
import { openCannon, openSeasonDial } from './toys';
import { ExplorerWorld, type Target } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_STATION = 12;
const T = 24;

const LOOKS: Record<PersonId, Look16> = { sol: NAVIGATOR_SOL, kofi: KOFI_MENSAH, lumi: LUMI_REYES, tess: TESS_ROCKET };
const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };
const PLANET_NAME: Record<PlanetId, string> = Object.fromEntries(PLANET_ORDER.map((p) => [p, FACTS[p].name])) as Record<PlanetId, string>;

type Mode = 'title' | 'world' | 'busy' | 'panel' | 'dive' | 'tour';

interface Panel {
  modal: Modal;
  /** A station, or 'stop' for a planet stop's question. */
  station: Station | 'stop';
  planet?: PlanetId;
  q: Question;
  hintRung: number;
  tries: number;
  recorded: boolean;
  answered: boolean;
  root: HTMLElement;
  pic: HTMLElement;
  model: HTMLElement;
  feedback: HTMLElement;
  hintBtn: HTMLButtonElement;
  next: HTMLButtonElement;
  choices: HTMLElement;
  stars: HTMLElement;
  level: HTMLElement;
  prompt: HTMLElement;
  /** A Grand Tour question: one question, no stars, then back to the flight. */
  tour: boolean;
  /** Called when a stop or Grand Tour question is answered and closed. */
  onDone?: () => void;
}

export class Game {
  private readonly world: ExplorerWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: ExplorerSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private lensEl!: HTMLElement;
  private stopBar!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<PersonId | 'vee', Speaker>;
  private panel: Panel | null = null;
  private dive: CloudDive | null = null;
  private fly: Flyby | null = null;
  private praiseCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-star');
    this.save = store.exists() ? store.load() : freshSave();
    this.world = new ExplorerWorld(host);
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: PersonId, voice: number): Speaker => ({
      name: PEOPLE[id].name,
      role: PEOPLE[id].role,
      voice,
      portrait: (e: Expression) => {
        const key = `${id}-${e}`;
        let u = cache.get(key);
        if (!u) cache.set(key, (u = paintPortrait16(LOOKS[id], MOOD[e]).toDataURL(2)));
        return u;
      },
    });
    this.speakers = {
      sol: speaker('sol', 130),
      kofi: speaker('kofi', 150),
      lumi: speaker('lumi', 210),
      tess: speaker('tess', 240),
      vee: {
        name: VEE.name,
        role: VEE.role,
        voice: 300,
        portrait: (e: Expression) => {
          const key = `vee-${e === 'thinking' ? 0 : 1}`;
          let u = cache.get(key);
          if (!u) cache.set(key, (u = paintVeePortrait(e !== 'thinking').toDataURL(2)));
          return u;
        },
      },
    };
    audio.addSong('observatory', OBSERVATORY_SONG);
    audio.addSong('station', STATION_SONG);
    audio.addSong('planet', PLANET_SONG);
    audio.addSong('tour', TOUR_SONG);
    audio.addSong('party', PARTY_SONG);
    this.world.onArrive = (t) => this.use(t);
    window.addEventListener('resize', () => {
      this.world.resize();
      this.dive?.resize();
      this.fly?.resize();
    });
    this.world.stage.canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    this.input.onAction((a) => this.onAction(a));
    bus.on('settings:changed', () => {
      this.world.reducedMotion = settings.reducedMotion;
      if (this.dive) this.dive.reducedMotion = settings.reducedMotion;
      if (this.fly) this.fly.reducedMotion = settings.reducedMotion;
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
      this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
    });
    this.world.reducedMotion = settings.reducedMotion;
    this.buildHud();
    mountToasts(host);
    window.addEventListener('keydown', (e) => {
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) this.onPanelKey(e);
    });
    (window as unknown as { __sse: unknown }).__sse = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      open: (s: Station) => this.mode === 'world' && !this.world.onStop && this.openPanel(s),
      setTier: (s: string, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      finishAll: () => {
        for (const s of OPEN_STATIONS) if (!this.save.done.includes(s)) this.save.done.push(s);
        this.persist();
        this.world.setLit(this.litArray());
        this.updateMarkers();
        this.renderHud();
      },
      hop: (p: PlanetId) => (this.mode === 'world' || this.mode === 'dive') && void this.hop(p),
      teleport: (x: number, y: number) => {
        const me = this.world.me as { x: number; y: number };
        me.x = x;
        me.y = y;
        this.world.follow();
      },
      diveTo: (x: number) => this.dive?.setVee(x),
      map: () => this.openStarMap(),
      tour: () => this.mode === 'world' && !this.world.onStop && this.allDone && void this.startTour(),
      /** Open one question by its id (for screenshots). */
      ask: (s: Station, id: string) => {
        const d = bank(s).find((x) => x.id === id);
        if (!d || this.mode !== 'world' || this.world.onStop) return false;
        skill(this.save.learner, s).tier = d.tier;
        this.save.recent[s] = bank(s).filter((x) => x.id !== id).map((x) => x.id);
        this.openPanel(s);
        return true;
      },
      snap: () => this.fly?.snap(),
    };
  }

  start(): void {
    const names = Object.fromEntries((Object.keys(PEOPLE) as PersonId[]).map((id) => [id, PEOPLE[id].name])) as Record<PersonId, string>;
    this.world.build(this.playerLook(), LOOKS, names, this.litArray());
    this.updateMarkers();
    this.world.establishing = true;
    this.world.follow();
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.input.worldActive = this.mode === 'world' && !document.querySelector('.modal-back') && !this.talk.isOpen;
      this.world.establishing = this.mode === 'title' || (!this.save.openingSeen && this.mode === 'busy');
      if (this.mode !== 'dive') {
        this.world.update(dt, this.mode === 'world' ? this.input : null);
        this.updatePrompt();
        this.world.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private litArray(): boolean[] {
    return STATIONS.map((s) => this.save.done.includes(s));
  }

  private get allDone(): boolean {
    return STATIONS.every((s) => this.save.done.includes(s));
  }

  private playerLook(): Look16 {
    return look16FromAppearance(this.save.appearance);
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Solar System Explorer',
      subtitle: 'An observatory among the stars',
      intro: ['Explore the observatory on the Star Station with Navigator Sol and Vee the probe. Put the planets in order, spin a globe to make day and night, and fly off to visit all eight planets.', 'For grades 2 to 5. Every line can be read aloud.'],
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

  private customize(firstTime: boolean, done: () => void): void {
    openCustomize(
      this.host,
      this.save.appearance,
      {
        firstTime,
        noun: 'explorer',
        hide: ['accessory'],
        only: { hairStyle: HAIR16 },
        paint: (a, dir, frame) => paintHero(look16FromAppearance(a), 1.5, dir, { walk: frame === 0 ? 1 : frame === 1 ? 0 : 2 }),
      },
      (a) => {
        this.save.appearance = a;
        this.persist();
        this.world.player.setLook(this.playerLook());
        done();
      },
    );
  }

  private async newGame(): Promise<void> {
    if (store.exists()) {
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your stars, lenses and postcards in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.setLit(this.litArray());
      this.updateMarkers();
    }
    this.titleEl?.remove();
    this.titleEl = null;
    this.customize(true, () => this.enterWorld());
  }

  private enterWorld(): void {
    this.titleEl?.remove();
    this.titleEl = null;
    this.hud.hidden = false;
    this.mode = 'world';
    audio.play('observatory');
    this.renderHud();
    if (!this.save.openingSeen) void this.opening();
  }

  private async opening(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers.sol, OPENING);
    await this.talk.say(this.speakers.vee, VEE_HELLO, 'smile');
    await this.talk.say(this.speakers.sol, OPENING_END, 'proud');
    await this.talk.say(this.speakers.sol, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
  }

  private updateMarkers(): void {
    const mark = (s: Station) => (this.save.done.includes(s) ? null : 'new');
    // Sol gets a "!" again when the Grand Tour is ready
    this.world.setMarkers({ sol: mark('orrery') ?? (this.allDone && !this.save.tourDone ? 'new' : null), kofi: mark('sunrise'), lumi: mark('dome'), tess: mark('launch') });
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
    if (this.promptEl.dataset.label !== t.label) {
      this.promptEl.dataset.label = t.label;
      this.promptEl.replaceChildren(h('span', { text: t.label }), ...(isTouchDevice() ? [] : [h('span', { class: 'kbd', text: 'Space' })]));
    }
    const s = this.world.screenOf(t, this.world.onStop ? 1.3 : 2.9);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel(this.world.onStop ? 'Pick up' : 'Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'panel') return;
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
    let bd = 64;
    for (const t of this.world.targets) {
      const s = this.world.screenOf(t, this.world.onStop ? 0.4 : 1.0);
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
    if (this.world.onStop) void this.collectFind(t.id as FindKind);
    else void this.talkTo(t.id as PersonId);
  }

  private async talkTo(id: PersonId): Promise<void> {
    this.mode = 'busy';
    const who = this.speakers[id];
    const station = STATION_OF[id];
    const info = STATION_INFO[station];
    const TOY: Partial<Record<Station, string>> = { dome: 'Turn the season dial', launch: 'Fire the cannon' };
    if (!this.save.introduced.includes(station)) {
      await this.talk.say(who, info.intro);
      this.save.introduced.push(station);
      this.persist();
      // Lumi and Tess show their models first; the questions come after
      if (TOY[station]) {
        this.talk.end();
        await this.playToy(station);
        await this.talk.say(who, 'Now let’s see what you know!', 'smile');
      }
    } else {
      const done = this.save.done.includes(station);
      const tour = id === 'sol' && this.allDone ? [this.save.tourDone ? 'Fly the Grand Tour again' : START_TOUR] : [];
      const options = [...tour, done ? 'More practice!' : 'Let’s go!', ...(TOY[station] ? [TOY[station]!] : []), ...(id === 'sol' ? ['Open the star map'] : []), 'Change how I look', 'Not now'];
      const text = id === 'sol' && this.allDone && !this.save.tourDone ? 'All four lenses are lit. Vee is ready for the Grand Tour!' : done ? `This lens is lit, thanks to you! Want to keep practising ${info.skill.toLowerCase()}?` : info.again;
      const pick = options[await this.talk.offer(who, text, options)];
      if (pick === START_TOUR || pick === 'Fly the Grand Tour again') {
        this.talk.end();
        void this.startTour();
        return;
      }
      if (pick === TOY[station]) {
        this.talk.end();
        await this.playToy(station);
        this.mode = 'world';
        this.touch?.setVisible(touchControlsVisible());
        return;
      }
      if (pick === 'Open the star map') {
        this.talk.end();
        this.mode = 'world';
        this.openStarMap();
        return;
      }
      if (pick === 'Change how I look') {
        this.talk.end();
        this.mode = 'world';
        this.customize(false, () => undefined);
        return;
      }
      if (pick === 'Not now') {
        this.talk.end();
        this.mode = 'world';
        return;
      }
    }
    this.talk.end();
    this.openPanel(station);
  }

  /** The Star Dome's season dial or the Launch Bay's cannon (the hands-on models). */
  private async playToy(station: Station): Promise<void> {
    this.mode = 'busy';
    this.touch?.setVisible(false);
    if (station === 'dome') {
      if (await openSeasonDial(this.host)) this.save.dialDone = true;
    } else if (await openCannon(this.host)) this.save.cannonDone = true;
    this.persist();
  }

  // ------------------------------------------------------------ the question panel

  private openPanel(station: Station | 'stop', stop?: { planet?: PlanetId; onDone: () => void; tour?: boolean }): void {
    const isStop = station === 'stop';
    const tour = !!stop?.tour;
    const person = isStop ? null : PERSON_OF[station];
    const who = isStop ? this.speakers.vee : this.speakers[person!];
    const prevMode = this.mode;
    this.mode = 'panel';
    this.touch?.setVisible(false);
    if (!isStop && !tour) audio.play('station');
    const level = h('span', { class: 'sse-level' });
    const stars = h('span', { class: 'sse-stars', role: 'img' });
    const prompt = h('p', { class: 'sse-prompt' });
    const speakBtn = h('button', { class: 'btn small sse-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => speak(prompt.textContent ?? '', { force: true }));
    const feedback = h('div', { class: 'sse-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const pic = h('div', { class: 'sse-pic' });
    const model = h('div', { class: 'sse-model', hidden: true });
    const choices = h('div', { class: 'sse-choices' });
    const hintBtn = h('button', { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' });
    const face = h('img', { class: 'sse-host', src: who.portrait('smile'), alt: who.name, width: 64, height: 64 });
    const title = isStop ? `${PLANET_NAME[stop!.planet!]}: the question` : tour ? `Grand Tour: a question from ${STATION_INFO[station].name}` : STATION_INFO[station].name;
    const root = h(
      'div',
      { class: `panel modal sse-panel sse-${station}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sse-title' },
      h('header', {}, h('h2', { id: 'sse-title', text: title }), h('div', { class: 'sse-head-right' }, level, stars, h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }))),
      h('div', { class: 'sse-ask' }, face, prompt, speakBtn),
      h('div', { class: 'sse-body' }, pic, model),
      choices,
      feedback,
      h('footer', { class: 'sse-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closePanel(prevMode), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = { modal, station, planet: stop?.planet, q: null as unknown as Question, hintRung: 0, tries: 0, recorded: false, answered: false, root, pic, model, feedback, hintBtn, next, choices, stars, level, prompt, tour, onDone: stop?.onDone };
    this.nextQuestion();
  }

  private nextQuestion(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const seed = this.save.seed++;
    let q: Question;
    if (pnl.station === 'stop') {
      const tier = skill(this.save.learner, 'tour').tier as Tier;
      q = stopQuestion(pnl.planet!, tier, mulberry32(seed));
    } else if (pnl.tour) {
      // a question from this station at the level the child reached there
      const st = pnl.station;
      q = makeQuestion(st, skill(this.save.learner, st).tier as Tier, mulberry32(seed), this.save.recent[st]);
    } else {
      const st = pnl.station;
      const tier = skill(this.save.learner, st).tier as Tier;
      q = makeQuestion(st, tier, mulberry32(seed), this.save.recent[st]);
      this.save.recent[st] = [...this.save.recent[st].filter((x) => x !== q.id), q.id].slice(-40);
    }
    this.persist();
    pnl.q = q;
    pnl.hintRung = 0;
    pnl.tries = 0;
    pnl.recorded = false;
    pnl.answered = false;
    pnl.prompt.textContent = q.ask;
    pnl.level.textContent = `Level ${q.tier} of 3`;
    pnl.feedback.hidden = true;
    pnl.next.hidden = true;
    pnl.hintBtn.disabled = false;
    pnl.model.hidden = true;
    pnl.model.replaceChildren();
    this.renderPic();
    pnl.choices.replaceChildren(
      h(
        'div',
        { class: 'sse-options' },
        ...q.choices.map((c, i) =>
          h(
            'button',
            { class: 'btn sse-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), 'aria-label': `${i + 1}: ${c.label}`, onclick: () => this.pick(c) },
            h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
            h('span', { class: 'sse-choice-text', text: c.label }),
          ),
        ),
      ),
    );
    this.renderStars();
    speak(q.ask);
    requestAnimationFrame(() => pnl.choices.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
  }

  /** The picture above the question; hint 2 can add a model picture under it. */
  private renderPic(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const q = pnl.q;
    const rung = pnl.hintRung;
    const done = pnl.answered;
    const pic = q.pic;
    /** Hint 2 for this question changes the picture itself (rays, arrows, paths). */
    const hinted = (m: typeof q.model) => rung >= 2 && !done && q.model === m;
    const tag = (text: string, x: number, y: number, cls = '') => h('span', { class: `sse-tag${cls ? ` ${cls}` : ''}`, style: `left:${x * 100}%;top:${y * 100}%`, text });
    let el: HTMLElement;
    if (pic.k === 'orrery') {
      const glow = pic.glow ?? -1;
      const placed = done && glow >= 0 && pic.placed < 8 ? pic.placed + 1 : pic.placed;
      el = pix(`orr-${placed}-${done ? -1 : glow}`, () => paintOrrery(T, 0.12, placed, done ? -1 : glow), 2.5, 'The orrery: a model of the solar system');
    } else if (pic.k === 'planet') {
      el = pix(`planet-${pic.body}`, () => paintPlanet(pic.body, 30, 0.1), rung >= 2 && q.model === 'card' ? 4 : 3, '');
    } else if (pic.k === 'globe') {
      const rays = rung >= 2 && q.model === 'daynight';
      el = pix(`globe-${pic.spin}-${rays}`, () => paintGlobeLab(T, pic.spin, rays), 2.5, 'The globe and the lamp');
    } else if (pic.k === 'sky') {
      const rays = rung >= 2 && q.model === 'rays';
      const shadow = pic.shadow || done;
      el = h(
        'div',
        { class: 'sse-sky' },
        pix(`sky-${pic.sun}-${shadow}-${rays}`, () => paintSkyScene(120, 72, pic.sun, shadow, rays), 2.5, 'A flagpole in the sunshine'),
        h('span', { class: 'sse-compass east', text: 'East' }),
        h('span', { class: 'sse-compass west', text: 'West' }),
      );
    } else if (pic.k === 'lamps') {
      const show = done || hinted('lamps');
      el = h(
        'div',
        { class: 'sse-sky' },
        pix('lamps', () => paintLamps(120, 72), 2.5, 'Two lamps that are just the same: one close, one far away'),
        ...(show ? [tag('Close', LAMP_TAGS.near[0], LAMP_TAGS.near[1]), tag('Far away', LAMP_TAGS.far[0], LAMP_TAGS.far[1])] : []),
      );
    } else if (pic.k === 'starsky') {
      const ghosts = pic.day && (done || hinted('daysky'));
      el = h(
        'div',
        { class: 'sse-sky' },
        pix(`starsky-${pic.day}-${ghosts}`, () => paintStarSky(120, 72, pic.day, ghosts), 2.5, pic.day ? 'A town under a bright blue daytime sky' : 'A town under the night sky, full of stars'),
        ...(ghosts ? [tag('The stars are still there', 0.4, 0.12)] : []),
      );
    } else if (pic.k === 'season') {
      el = h(
        'div',
        { class: 'sse-sky' },
        pix(`const-${pic.season}`, () => paintConstellation(120, 72, pic.season), 2.5, `The star picture ${CONSTELLATION_NAME[pic.season]} in the night sky`),
        tag(`${CONSTELLATION_NAME[pic.season]}, on ${pic.season} evenings`, 0.5, 0.9, 'small'),
      );
    } else if (pic.k === 'moonlight') {
      const rays = done || hinted('moonlight');
      const orbit = hinted('paths');
      const name = pic.body === 'moon' ? 'The Moon' : 'Venus';
      el = h(
        'div',
        { class: 'sse-sky' },
        pix(`moonlight-${pic.body}-${rays}-${orbit}`, () => paintMoonlight(120, 72, pic.body, rays, orbit), 2.5, `The Sun, ${name.toLowerCase()} and Earth`),
        tag('Sun', 0.1, 0.12, 'small'),
        tag(name, 0.56, 0.08, 'small'),
        tag('Earth', 0.84, 0.92, 'small'),
      );
    } else if (pic.k === 'cannon') {
      const all = hinted('paths');
      const show = all ? 'all' : done ? pic.shot : 'none';
      const { buf, ends } = paintCannon(120, 80, show);
      const NAMES = { slow: 'Too slow', orbit: 'Just right: an orbit', escape: 'Too fast' } as const;
      el = h(
        'div',
        { class: 'sse-sky' },
        pix(`cannon-${show}`, () => buf, 2.5, 'Tess’s cannon on top of a mountain on a little planet'),
        ...(all ? (Object.keys(ends) as Array<keyof typeof NAMES>).map((k) => tag(NAMES[k], Math.min(0.86, Math.max(0.14, ends[k]![0] / 120)), Math.min(0.92, Math.max(0.08, ends[k]![1] / 80 + (k === 'orbit' ? 0.06 : -0.06))), 'small')) : []),
      );
    } else if (pic.k === 'down') {
      const arrows = done || hinted('down');
      el = h('div', { class: 'sse-sky' }, pix(`down-${pic.all}-${arrows}`, () => paintDown(120, 72, pic.all, arrows), 2.5, pic.all ? 'Children standing all the way round Earth, each dropping a ball' : 'A child on Earth dropping a ball'));
    } else {
      const lean = done || hinted('tilt');
      el = h(
        'div',
        { class: 'sse-sky' },
        pix('tilt', () => paintTilt(120, 72), 2.5, 'Tilted Earth on both sides of the Sun, in December and in June'),
        tag('December', 0.17, 0.12, 'small'),
        tag('June', 0.83, 0.12, 'small'),
        ...(lean ? [tag('North leans away', 0.17, 0.88, 'small'), tag('North leans toward the Sun', 0.78, 0.88, 'small')] : []),
      );
    }
    pnl.pic.replaceChildren(el);
    if (rung >= 2 && !done) this.renderModel();
  }

  /** Hint 2's picture: the planets in order (with their years), rocky and giant, the Sun's path, two lamps, or Earth's trip past the star pictures. */
  private renderModel(): void {
    const pnl = this.panel!;
    const q = pnl.q;
    const S = 1.5;
    if (q.model === 'shadow-day') {
      pnl.model.hidden = false;
      pnl.model.replaceChildren(
        h(
          'div',
          { class: 'sse-row' },
          pix('sun-arc', () => paintSunArc(160, 56), 2, 'The Sun’s path across the sky'),
          h('span', { class: 'sse-tag', style: 'left:12%;top:58%', text: 'Morning' }),
          h('span', { class: 'sse-tag', style: 'left:50%;top:6%', text: 'Midday' }),
          h('span', { class: 'sse-tag', style: 'left:88%;top:58%', text: 'Evening' }),
        ),
      );
      return;
    }
    if (q.model === 'lamps' && q.pic.k !== 'lamps') {
      pnl.model.hidden = false;
      pnl.model.replaceChildren(
        h(
          'div',
          { class: 'sse-row' },
          pix('lamps', () => paintLamps(120, 72), 1.6, 'Two lamps that are just the same: one close, one far away'),
          h('span', { class: 'sse-tag small', style: `left:${LAMP_TAGS.near[0] * 100}%;top:${LAMP_TAGS.near[1] * 100}%`, text: 'Close' }),
          h('span', { class: 'sse-tag small', style: `left:${LAMP_TAGS.far[0] * 100}%;top:${LAMP_TAGS.far[1] * 100}%`, text: 'Far away' }),
        ),
      );
      return;
    }
    if (q.model === 'daysky' && q.pic.k === 'starsky' && !q.pic.day) {
      // the night sky's question: the same stars, hidden in the bright day sky
      pnl.model.hidden = false;
      pnl.model.replaceChildren(
        h(
          'div',
          { class: 'sse-row' },
          pix('starsky-true-true', () => paintStarSky(120, 72, true, true), 1.6, 'The same town in the day: the stars are still there, hidden by the bright sky'),
          h('span', { class: 'sse-tag small', style: 'left:40%;top:10%', text: 'In the day, the same stars are hidden' }),
        ),
      );
      return;
    }
    if (q.model === 'seasons') {
      const season = q.pic.k === 'season' ? q.pic.season : 'winter';
      const W = 200;
      const H = 100;
      const { buf, spots, earth } = paintSeasonOrbit(W, H, season);
      const row = h('div', { class: 'sse-row' }, pix(`seasons-${season}`, () => buf, 1.6, 'Earth’s trip round the Sun, with star pictures far beyond'));
      for (const s of ['winter', 'spring', 'summer', 'autumn'] as const) {
        const [x, y] = spots[s];
        row.append(h('span', { class: 'sse-tag small', style: `left:${(x / W) * 100}%;top:${Math.min(94, Math.max(6, (y / H) * 100 + (s === 'autumn' ? 14 : s === 'spring' ? -14 : 16)))}%`, text: CONSTELLATION_NAME[s] }));
      }
      row.append(h('span', { class: 'sse-tag small', style: `left:${(earth[0] / W) * 100}%;top:${(earth[1] / H) * 100 + (earth[1] > H * 0.6 ? -16 : 8)}%`, text: `Earth in ${season}` }));
      pnl.model.hidden = false;
      pnl.model.replaceChildren(row);
      return;
    }
    if (q.model !== 'order' && q.model !== 'kinds' && q.model !== 'years') return;
    pnl.model.hidden = false;
    const W = 280;
    const H = 44;
    const focus = q.model === 'order' ? q.focus : 8;
    const { buf, xs } = paintPlanetRow(W, H, focus, q.model === 'order');
    const row = h('div', { class: 'sse-row', style: `width:${W * S}px` }, pix(`row-${focus}-${q.model}`, () => buf, S, 'The planets in order from the Sun'));
    const at = (i: number) => `${((xs[i] * S) / (W * S)) * 100}%`;
    if (q.model === 'order')
      PLANET_ORDER.forEach((p, i) => {
        if (focus === 8 || i < focus) row.append(h('span', { class: 'sse-tag small', style: `left:${at(i)};top:86%`, text: PLANET_NAME[p] }));
        if (i === focus) row.append(h('span', { class: 'sse-tag', style: `left:${at(i)};top:86%`, text: '?' }));
      });
    else if (q.model === 'years')
      // each planet's year, high and low in turn so the words do not bump
      PLANET_ORDER.forEach((p, i) => row.append(h('span', { class: 'sse-tag small', style: `left:${at(i)};top:${i % 2 ? 10 : 88}%`, text: `${PLANET_NAME[p]}: ${YEARS[i]}` })));
    else {
      row.append(h('span', { class: 'sse-tag', style: `left:${(((xs[0] + xs[3]) / 2) * S) / (W * S) * 100}%;top:86%`, text: 'Small and rocky' }));
      row.append(h('span', { class: 'sse-tag', style: `left:${(((xs[4] + xs[7]) / 2) * S) / (W * S) * 100}%;top:86%`, text: 'Giants' }));
    }
    pnl.model.replaceChildren(row);
  }

  private pick(c: Choice): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered) return;
    const btn = pnl.choices.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(c.value)}"]`);
    if (btn?.disabled) return;
    if (c.correct) this.onRight(btn);
    else this.onWrong(btn, c);
  }

  private skillId(pnl: Panel): string {
    return pnl.station === 'stop' ? 'tour' : pnl.tour ? 'grand' : pnl.station;
  }

  /** One question that is not part of a station's stars: a planet stop's, or the Grand Tour's. */
  private single(pnl: Panel): boolean {
    return pnl.station === 'stop' || pnl.tour;
  }

  private onRight(btn: HTMLButtonElement | null): void {
    const pnl = this.panel!;
    const q = pnl.q;
    pnl.answered = true;
    const clean = pnl.tries === 0 && pnl.hintRung <= 1;
    let tierChange = 0;
    if (!pnl.recorded) {
      pnl.recorded = true;
      tierChange = recordAnswer(this.save.learner, this.skillId(pnl), { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
    }
    if (pnl.station !== 'stop' && !pnl.tour) {
      const st = pnl.station;
      this.save.played[st]++;
      if (clean && this.save.stars[st] < STARS_PER_STATION) this.save.stars[st]++;
    }
    this.persist();
    if (clean) audio.itemGet();
    else audio.correct();
    const msg = this.single(pnl) ? `${praise(this.praiseCount++)}` : clean ? `${praise(this.praiseCount++)} You win a star.` : 'You got it! Stars are for getting it right the first time.';
    this.showFeedback(`${msg} ${q.explain}`, 'good');
    pnl.next.hidden = false;
    pnl.next.textContent = pnl.tour ? 'Back to the flight' : pnl.station === 'stop' ? 'Done' : isTouchDevice() ? 'Next' : 'Next (Space)';
    pnl.hintBtn.disabled = true;
    btn?.classList.add('right');
    pnl.choices.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
    pnl.model.hidden = true;
    this.renderPic();
    this.renderStars();
    if (tierChange > 0 && !this.single(pnl)) toast('Level up! Trickier questions.', 'reward');
    requestAnimationFrame(() => pnl.next.focus());
  }

  private onWrong(btn: HTMLButtonElement | null, c: Choice): void {
    const pnl = this.panel!;
    pnl.tries++;
    if (!pnl.recorded) {
      pnl.recorded = true;
      const o = recordAnswer(this.save.learner, this.skillId(pnl), { correct: false, hintRung: pnl.hintRung, misconception: (c.misconception ?? null) as Misconception | null }, RULES);
      this.persist();
      if (o.tierChange < 0 && !this.single(pnl)) toast('Let us practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(`Not quite. ${c.why ?? ''}`, 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.choices.querySelector<HTMLButtonElement>('.sse-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `sse-feedback ${kind}`;
    pnl.feedback.replaceChildren(kind === 'hint' ? iconImg('bulb', '', 22) : kind === 'good' ? iconImg('star', '', 22) : '', h('span', { text }));
    speak(text);
  }

  private hint(rung?: number): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered) return;
    const nextRung = Math.min(3, rung ?? pnl.hintRung + 1);
    if (nextRung <= pnl.hintRung && rung === undefined) {
      toast('That is every hint. The answer is outlined!', 'hint');
      return;
    }
    pnl.hintRung = Math.max(pnl.hintRung, nextRung);
    audio.hint();
    const q = pnl.q;
    const k = pnl.hintRung;
    if (k >= 2) this.renderPic();
    if (k >= 3) pnl.choices.querySelector(`[data-value="${CSS.escape(q.choices.find((c) => c.correct)!.value)}"]`)?.classList.add('worked');
    const text = k === 1 ? q.hints[0] : k === 2 ? q.hints[1] : `The answer is outlined. ${q.explain}`;
    this.showFeedback(`Hint ${k} of 3: ${text}`, 'hint');
  }

  private renderStars(): void {
    const pnl = this.panel;
    if (!pnl) return;
    if (this.single(pnl)) {
      pnl.stars.replaceChildren();
      pnl.stars.removeAttribute('aria-label');
      return;
    }
    const n = this.save.stars[pnl.station as Station];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_STATION }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_STATION} stars`);
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    if (this.single(pnl)) {
      const done = pnl.onDone;
      pnl.onDone = undefined;
      pnl.modal.close();
      done?.();
      return;
    }
    const st = pnl.station as Station;
    const rec = skill(this.save.learner, st);
    const ready = this.save.stars[st] >= STARS_PER_STATION && (rec.tier >= 2 || this.save.played[st] >= MAX_PER_STATION);
    if (ready && !this.save.done.includes(st)) {
      pnl.modal.close();
      void this.finishStation(st);
    } else this.nextQuestion();
  }

  private onPanelKey(e: KeyboardEvent): void {
    const pnl = this.panel;
    if (!pnl) return;
    const k = e.key.toLowerCase();
    if (k === 'h') {
      e.preventDefault();
      this.hint();
    } else if ((k === ' ' || k === 'enter') && pnl.answered && document.activeElement !== pnl.next) {
      e.preventDefault();
      this.afterAnswer();
    } else if (/^[1-3]$/.test(k) && !e.repeat) {
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.sse-choice')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closePanel(prevMode: Mode): void {
    stopSpeaking();
    const pnl = this.panel;
    this.panel = null;
    if (this.mode === 'panel') {
      // leaving a stop question early: back to the stop (the question stays on the ground, or in the clouds)
      if (pnl?.station === 'stop') {
        this.mode = prevMode === 'dive' ? 'dive' : 'world';
        // left before answering: the question floats back into the clouds (or stays on the ground)
        if (pnl.onDone && this.dive) {
          this.dive.release('question');
          this.dive.resume();
        }
      } else if (pnl?.tour) {
        // leaving a Grand Tour question early: the flight goes on
        this.mode = 'busy';
        const done = pnl.onDone;
        pnl.onDone = undefined;
        done?.();
      } else {
        this.mode = 'world';
        audio.play(this.world.onStop ? 'planet' : 'observatory');
      }
    }
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
    this.renderHud();
  }

  private async finishStation(st: Station): Promise<void> {
    this.mode = 'busy';
    audio.play('observatory');
    const info = STATION_INFO[st];
    const who = this.speakers[PERSON_OF[st]];
    await this.talk.say(who, 'Five stars! Before you go, one question.', 'proud');
    const res = await this.talk.ask(who, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${st}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(st);
    this.persist();
    this.world.setLit(this.litArray());
    this.updateMarkers();
    audio.levelUp();
    toast(`A telescope lens is lit! ${this.save.done.length} of 4`, 'reward');
    await this.talk.say(who, info.done, 'proud');
    // the Star Dome earns the Sun's postcard, and the Launch Bay the Moon's
    const bonus: Bonus | null = st === 'dome' ? 'sun' : st === 'launch' ? 'moon' : null;
    if (bonus && !this.save.bonus.includes(bonus)) {
      this.talk.end();
      await this.bonusCard(bonus);
    }
    this.renderHud();
    if (this.allDone) {
      await this.talk.say(this.speakers.sol, ALL_DONE, 'proud');
      const options = [START_TOUR, 'Not yet'];
      const pick = options[await this.talk.offer(this.speakers.sol, 'Shall we launch it now?', options)];
      this.talk.end();
      if (pick === START_TOUR) {
        void this.startTour();
        return;
      }
      this.mode = 'world';
      return;
    }
    const left = STATIONS.find((s) => !this.save.done.includes(s))!;
    await this.talk.say(this.speakers.sol, `Look at that lens glow! Next, ${PEOPLE[PERSON_OF[left]].name} could use your help.`, 'proud');
    this.talk.end();
    this.mode = 'world';
  }

  /** A bonus postcard (the Sun, the Moon or Pluto) goes into the album. */
  private bonusCard(b: Bonus): Promise<void> {
    if (!this.save.bonus.includes(b)) this.save.bonus = BONUS_ORDER.filter((x) => x === b || this.save.bonus.includes(x));
    this.persist();
    audio.itemGet();
    return new Promise((resolve) => {
      const root = h(
        'div',
        { class: 'panel modal sse-postcard', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bonus-title' },
        h('header', {}, h('h2', { id: 'bonus-title', text: 'A bonus postcard!' })),
        h('div', { class: 'content' }, pix(`postcard-${b}`, () => paintPostcard(b), 3, `A postcard from ${BONUS[b].name.toLowerCase()}`), h('p', { text: BONUS[b].text })),
        h('footer', { class: 'sse-foot' }, h('span', {}), h('button', { class: 'btn primary', type: 'button', text: 'Into the album!', 'data-autofocus': true, onclick: () => modal.close() })),
      );
      const modal = new Modal(this.host, root, () => {
        stopSpeaking();
        resolve();
      });
      speak(BONUS[b].text);
      toast(`Bonus postcard: ${BONUS[b].name}!`, 'reward');
    });
  }

  // ------------------------------------------------------------ the Grand Tour (the finale)

  private async startTour(): Promise<void> {
    if (this.mode !== 'world' && this.mode !== 'busy') return;
    if (this.world.onStop || this.dive) await this.backToObservatory(true);
    this.mode = 'busy';
    this.touch?.setVisible(false);
    await this.talk.say(this.speakers.sol, TOUR_INTRO, 'proud');
    this.talk.end();
    if (!(await this.plotRoute())) {
      this.mode = 'world';
      this.renderHud();
      return;
    }
    await this.talk.say(this.speakers.sol, ROUTE_DONE, 'proud');
    this.talk.end();
    await this.flight();
    audio.play('tour');
    this.hud.hidden = true;
    this.mode = 'tour';
    const fly = new Flyby(this.host, this.hud);
    this.fly = fly;
    fly.reducedMotion = settings.reducedMotion;
    fly.onQuit = () => this.quitTour();
    const gone = () => this.fly !== fly;
    for (const p of PLANET_ORDER) {
      await fly.arrive(p);
      if (gone()) return;
      const tip = p === 'mercury' && !this.save.snapTipSeen ? ` ${isTouchDevice() ? SNAP_TIP_TOUCH : SNAP_TIP_KEYS}` : '';
      await this.talk.say(this.speakers.vee, FLYBY[p] + tip, 'smile');
      this.talk.end();
      await fly.waitForSnap();
      if (gone()) return;
      if (tip) {
        this.save.snapTipSeen = true;
        this.persist();
      }
      const st = TOUR_QUESTIONS[p];
      if (st) {
        await this.talk.say(this.speakers.vee, TOUR_QUESTION_LINE[st], 'smile');
        this.talk.end();
        await new Promise<void>((resolve) => this.openPanel(st, { tour: true, onDone: resolve }));
        this.mode = 'tour';
      }
      await fly.leave();
      if (gone()) return;
    }
    // past Neptune: turn round for the Pale Blue Dot
    fly.turnRound();
    await this.talk.say(this.speakers.vee, PALE_DOT[0], 'smile');
    this.talk.end();
    await fly.waitForSnap();
    if (gone()) return;
    await this.talk.say(this.speakers.vee, PALE_DOT[1], 'smile');
    await this.talk.say(this.speakers.sol, PALE_DOT_FACT, 'proud');
    this.talk.end();
    this.mode = 'busy';
    const first = !this.save.tourDone;
    this.save.tourDone = true;
    this.persist();
    await this.flight();
    fly.dispose();
    this.fly = null;
    await this.starParty(first);
  }

  /** "End the flight": back to the observatory (only between talks and questions). */
  private quitTour(): void {
    const fly = this.fly;
    if (!fly || this.mode !== 'tour' || this.talk.isOpen || this.panel) return;
    this.fly = null;
    fly.dispose();
    this.hud.hidden = false;
    this.mode = 'world';
    audio.play('observatory');
    this.renderHud();
    toast('Back at the observatory. Talk to Navigator Sol to fly the Grand Tour again.', 'hint');
  }

  /** Plot the route: tap the planets in order from the Sun. Resolves false if the child closes it. */
  private plotRoute(): Promise<boolean> {
    return new Promise((resolve) => {
      let next = 0;
      let misses = 0;
      let finished = false;
      const r = mulberry32(this.save.seed++);
      const order = [...PLANET_ORDER];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      const slots = PLANET_ORDER.map((_, i) => h('li', { class: 'sse-slot', 'data-slot': String(i) }, h('span', { class: 'sse-slot-n', text: String(i + 1) })));
      const status = h('p', { class: 'sse-toy-status', role: 'status', 'aria-live': 'polite', text: ROUTE_TIP });
      const buttons = new Map<PlanetId, HTMLButtonElement>();
      const say = (text: string) => {
        status.textContent = text;
        speak(text);
      };
      const outline = () => {
        buttons.forEach((b) => b.classList.remove('worked'));
        buttons.get(PLANET_ORDER[next])?.classList.add('worked');
        say(next === 0 ? 'Hint: start with the planet closest to the Sun. It is outlined.' : `Hint: after ${PLANET_NAME[PLANET_ORDER[next - 1]]} comes the next planet out from the Sun. It is outlined.`);
        audio.hint();
      };
      const tap = (p: PlanetId) => {
        if (finished) return;
        const b = buttons.get(p)!;
        if (p === PLANET_ORDER[next]) {
          b.disabled = true;
          b.classList.remove('worked');
          b.classList.add('placed');
          slots[next].append(pix(`route-${p}`, () => paintPlanet(p, p === 'saturn' ? 5 : 7, 0.1), 2, ''), h('span', { class: 'sse-slot-name', text: PLANET_NAME[p] }));
          slots[next].classList.add('filled');
          next++;
          audio.correct();
          if (next === PLANET_ORDER.length) {
            finished = true;
            recordAnswer(this.save.learner, 'grand', { correct: misses === 0, hintRung: 0, misconception: misses ? 'order-swap' : null }, RULES);
            this.persist();
            audio.levelUp();
            say('The route is set!');
            setTimeout(() => modal.close(), settings.reducedMotion ? 300 : 900);
          } else {
            say(`Yes! ${PLANET_NAME[p]} is number ${next}. Which planet comes next?`);
            buttons.get(PLANET_ORDER[next])?.focus();
            const firstLeft = [...buttons.values()].find((x) => !x.disabled);
            firstLeft?.focus();
          }
          return;
        }
        misses++;
        audio.retry();
        b.classList.remove('nope');
        void b.offsetWidth;
        b.classList.add('nope');
        say(`Not yet. ${PLANET_NAME[p]} is farther out from the Sun.`);
        if (misses >= 2) outline();
      };
      for (const p of order) {
        const b = h('button', { class: 'btn sse-planet-btn', type: 'button', 'data-planet': p, onclick: () => tap(p) }, pix(`pbtn-${p}-false`, () => paintPlanetButton(p, false), 2), h('span', { text: PLANET_NAME[p] }));
        buttons.set(p, b);
      }
      const hintBtn = h('button', { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H', onclick: () => outline() }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }));
      const root = h(
        'div',
        { class: 'panel modal sse-map sse-route', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'route-title' },
        h('header', {}, h('h2', { id: 'route-title', text: 'Plot the Grand Tour' }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() })),
        h(
          'div',
          { class: 'content' },
          h('div', { class: 'sse-route-row' }, pix('route-sun', () => paintPlanet('sun', 9, 0), 2, 'The Sun'), h('ol', { class: 'sse-slots', 'aria-label': 'The route, from the Sun outward' }, ...slots)),
          status,
          h('div', { class: 'sse-planet-grid' }, ...order.map((p) => buttons.get(p)!)),
        ),
        h('footer', { class: 'sse-foot' }, hintBtn, h('span', {})),
      );
      root.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'h') {
          e.preventDefault();
          outline();
        }
      });
      const modal = new Modal(this.host, root, () => {
        stopSpeaking();
        resolve(finished);
      });
      speak(ROUTE_TIP);
    });
  }

  /** The star party under the open dome: the crew, the photos, and the end of the game. */
  private async starParty(first: boolean): Promise<void> {
    this.mode = 'busy';
    audio.play('party');
    const looks = [LOOKS.sol, LOOKS.kofi, this.playerLook(), LOOKS.lumi, LOOKS.tess];
    const a = this.save.appearance;
    const scene = h(
      'div',
      { class: 'sse-party' },
      pix(`party-${a.body}-${a.skin}-${a.hairStyle}-${a.hairColor}-${a.outfit}`, () => paintStarParty(320, 180, looks), 3, 'The star party: the crew under the open dome, with the stars and the Milky Way overhead'),
      h(
        'div',
        { class: 'sse-photos', role: 'list', 'aria-label': 'Your Grand Tour photos' },
        ...PLANET_ORDER.map((p) => h('figure', { class: 'sse-photo', role: 'listitem' }, pix(`photo-${p}`, () => paintPlanet(p, p === 'saturn' ? 6 : 9, 0.15), 2, ''), h('figcaption', { text: PLANET_NAME[p] }))),
        h('figure', { class: 'sse-photo dot', role: 'listitem' }, h('div', { class: 'sse-dot-pic', 'aria-hidden': 'true' }, h('span', {})), h('figcaption', { text: 'The Pale Blue Dot' })),
      ),
    );
    this.host.insertBefore(scene, this.hud);
    audio.levelUp();
    for (const [id, line] of PARTY_LINES) await this.talk.say(this.speakers[id], line, id === 'sol' ? 'proud' : 'smile');
    this.talk.end();
    if (first && !this.save.bonus.includes('pluto')) await this.bonusCard('pluto');
    toast('The Grand Tour is complete! You explored the whole solar system.', 'reward');
    window.parent?.postMessage({ type: 'game-complete', score: this.save.done.length + this.save.postcards.length }, '*');
    await this.talk.say(this.speakers.sol, PARTY_END, 'smile');
    this.talk.end();
    scene.remove();
    this.hud.hidden = false;
    this.updateMarkers();
    this.renderHud();
    audio.play('observatory');
    this.mode = 'world';
    this.touch?.setVisible(touchControlsVisible());
  }

  // ------------------------------------------------------------ the star map and the planet stops

  private openStarMap(): void {
    if (this.mode !== 'world' || this.world.onStop) return;
    const visited = this.save.postcards;
    const map = pix(`starmap-${visited.join('.')}`, () => paintStarMap(300, 70, visited, null, 0), 2, 'The star map: the Sun and the eight planets in order');
    const buttons = PLANET_ORDER.map((p) =>
      h(
        'button',
        { class: `btn sse-planet-btn${visited.includes(p) ? ' visited' : ''}`, type: 'button', 'data-planet': p, onclick: () => go(p) },
        pix(`pbtn-${p}-${visited.includes(p)}`, () => paintPlanetButton(p, visited.includes(p)), 2),
        h('span', { text: PLANET_NAME[p] }),
      ),
    );
    const root = h(
      'div',
      { class: 'panel modal sse-map', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'map-title' },
      h('header', {}, h('h2', { id: 'map-title', text: 'Navigator Sol’s star map' }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('div', { class: 'sse-map-pic' }, map), h('p', { class: 'small-note', text: `Pick a planet to visit with Vee. Postcards: ${visited.length} of 8.` }), h('div', { class: 'sse-planet-grid' }, ...buttons)),
    );
    const modal = new Modal(this.host, root);
    const go = (p: PlanetId) => {
      modal.close();
      void this.hop(p);
    };
    if (!this.save.mapTipSeen) {
      this.save.mapTipSeen = true;
      this.persist();
      speak(MAP_TIP);
      root.querySelector('.small-note')!.textContent = `${MAP_TIP} Postcards: ${visited.length} of 8.`;
    }
  }

  /** A hop: a short flight through the stars (a flash of light), then the planet stop or back home. */
  private async flight(): Promise<void> {
    const fx = h('div', { class: 'sse-hop', 'aria-hidden': 'true' });
    this.host.append(fx);
    audio.fx(
      [
        [60, 0, 0.1],
        [67, 0.1, 0.1],
        [72, 0.2, 0.1],
        [79, 0.3, 0.25],
      ],
      'square',
      0.06,
    );
    await new Promise((r) => setTimeout(r, settings.reducedMotion ? 250 : 650));
    setTimeout(() => fx.remove(), settings.reducedMotion ? 150 : 500);
  }

  private async hop(p: PlanetId): Promise<void> {
    if (this.world.onStop || this.dive) await this.backToObservatory(true);
    this.mode = 'busy';
    this.touch?.setVisible(false);
    await this.flight();
    const have = this.save.finds[p] ?? [];
    audio.play('planet');
    if (FACTS[p].stop === 'surface') {
      this.world.enterSurface(p, have);
      this.renderHud();
      await this.talk.say(this.speakers.vee, arrival(p), 'smile');
      if (!this.save.driveTipSeen) {
        await this.talk.say(this.speakers.vee, isTouchDevice() ? DRIVE_TIP_TOUCH : DRIVE_TIP_KEYS, 'smile');
        this.save.driveTipSeen = true;
        this.persist();
      }
      this.talk.end();
      this.mode = 'world';
      this.touch?.setVisible(touchControlsVisible());
    } else {
      this.dive = new CloudDive(this.host, p, have, this.hud);
      this.dive.reducedMotion = settings.reducedMotion;
      this.dive.paused = true;
      this.dive.onFind = (k) => void this.collectFind(k);
      this.mode = 'dive';
      this.renderHud();
      await this.talk.say(this.speakers.vee, arrival(p), 'smile');
      if (!this.save.diveTipSeen) {
        await this.talk.say(this.speakers.vee, isTouchDevice() ? DIVE_TIP_TOUCH : DIVE_TIP_KEYS, 'smile');
        this.save.diveTipSeen = true;
        this.persist();
      }
      this.talk.end();
      this.dive.resume();
    }
  }

  private get stopPlanet(): PlanetId | null {
    return this.world.onStop ?? this.dive?.planet ?? null;
  }

  /** A find at a planet stop: the sample, the fact card or the question. */
  private async collectFind(kind: FindKind): Promise<void> {
    const p = this.stopPlanet;
    if (!p) return;
    const inDive = !!this.dive;
    const back = () => {
      this.mode = inDive ? 'dive' : 'world';
      if (inDive) this.dive?.resume();
    };
    const keep = () => {
      const list = this.save.finds[p] ?? [];
      if (!list.includes(kind)) list.push(kind);
      this.save.finds[p] = FIND_ORDER.filter((k) => list.includes(k));
      this.persist();
      if (!inDive) this.world.collect(kind);
      this.renderHud();
    };
    if (kind === 'question') {
      this.mode = inDive ? 'dive' : 'world';
      this.openPanel('stop', {
        planet: p,
        onDone: () => {
          keep();
          void this.afterFind(p, back);
        },
      });
      return;
    }
    this.mode = 'busy';
    audio.itemGet();
    if (kind === 'sample') {
      keep();
      toast('Sample collected!', 'reward');
      await this.talk.say(this.speakers.vee, `Got it! ${FACTS[p].sample}`, 'smile');
      this.talk.end();
    } else {
      keep();
      await this.factCard(p);
    }
    await this.afterFind(p, back);
  }

  /** After a find: with all three, the postcard; otherwise back to exploring. */
  private async afterFind(p: PlanetId, back: () => void): Promise<void> {
    const have = this.save.finds[p] ?? [];
    if (FIND_ORDER.every((k) => have.includes(k))) {
      this.mode = 'busy';
      if (!this.save.postcards.includes(p)) this.save.postcards.push(p);
      delete this.save.finds[p];
      this.persist();
      audio.levelUp();
      await this.postcard(p);
      await this.talk.say(this.speakers.vee, postcardLine(p, this.save.postcards.length), 'smile');
      this.talk.end();
      await this.backToObservatory();
      return;
    }
    back();
  }

  private factCard(p: PlanetId): Promise<void> {
    const f = FACTS[p];
    return new Promise((resolve) => {
      const rows: Array<[string, string]> = [
        ['Kind', f.kind],
        ['Distance from the Sun', f.distance],
        ['One spin (a day)', f.spin],
        ['One trip round the Sun (a year)', f.year],
        ['Moons', f.moons],
      ];
      const root = h(
        'div',
        { class: 'panel modal sse-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'card-title' },
        h('header', {}, h('h2', { id: 'card-title', text: `Fact card: ${f.name}` })),
        h(
          'div',
          { class: 'content sse-card-body' },
          pix(`planet-${p}`, () => paintPlanet(p, 30, 0.1), 3, f.name),
          h('div', {}, h('p', { class: 'sse-card-fact', text: f.fact }), h('table', { class: 'progress-table sse-facts' }, h('tbody', {}, ...rows.map(([k, v]) => h('tr', {}, h('th', { scope: 'row', text: k }), h('td', { text: v })))))),
        ),
        h('footer', { class: 'sse-foot' }, h('span', {}), h('button', { class: 'btn primary', type: 'button', text: 'Got it!', 'data-autofocus': true, onclick: () => modal.close() })),
      );
      const modal = new Modal(this.host, root, () => {
        stopSpeaking();
        resolve();
      });
      speak(`${f.name}. ${f.fact} Distance from the Sun: ${f.distance}. One spin: ${f.spin}. One year: ${f.year}. Moons: ${f.moons}.`);
    });
  }

  private postcard(p: PlanetId): Promise<void> {
    return new Promise((resolve) => {
      const root = h(
        'div',
        { class: 'panel modal sse-postcard', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pc-title' },
        h('header', {}, h('h2', { id: 'pc-title', text: 'Postcard collected!' })),
        h('div', { class: 'content' }, pix(`postcard-${p}`, () => paintPostcard(p), 3, `A postcard from ${FACTS[p].name}`), h('p', { text: `Greetings from ${FACTS[p].name}! ${FACTS[p].fact}` })),
        h('footer', { class: 'sse-foot' }, h('span', {}), h('button', { class: 'btn primary', type: 'button', text: 'Into the album!', 'data-autofocus': true, onclick: () => modal.close() })),
      );
      const modal = new Modal(this.host, root, () => resolve());
      toast(`Postcard from ${FACTS[p].name}! ${this.save.postcards.length} of 8`, 'reward');
    });
  }

  private async backToObservatory(quick = false): Promise<void> {
    if (!this.world.onStop && !this.dive) return;
    this.mode = 'busy';
    this.touch?.setVisible(false);
    if (!quick) await this.flight();
    this.dive?.dispose();
    this.dive = null;
    this.world.leaveSurface();
    audio.play('observatory');
    this.renderHud();
    this.mode = 'world';
    this.touch?.setVisible(touchControlsVisible());
  }

  private openAlbum(): void {
    if (this.mode !== 'world') return;
    const cards = PLANET_ORDER.map((p) =>
      this.save.postcards.includes(p)
        ? h('figure', { class: 'sse-album-card' }, pix(`postcard-${p}`, () => paintPostcard(p), 1.5, `Postcard from ${FACTS[p].name}`), h('figcaption', { text: FACTS[p].name }))
        : h('figure', { class: 'sse-album-card empty' }, h('div', { class: 'sse-album-empty', text: '?' }), h('figcaption', { text: `${FACTS[p].name}: not visited yet` })),
    );
    const bonus = BONUS_ORDER.map((b) =>
      this.save.bonus.includes(b)
        ? h('figure', { class: 'sse-album-card' }, pix(`postcard-${b}`, () => paintPostcard(b), 1.5, `Postcard from ${BONUS[b].name.toLowerCase()}`), h('figcaption', { text: BONUS[b].name }))
        : h('figure', { class: 'sse-album-card empty' }, h('div', { class: 'sse-album-empty', text: '?' }), h('figcaption', { text: `${BONUS[b].name}: ${BONUS[b].how.toLowerCase()}` })),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'album-title', style: 'width:min(680px,100%)' },
      h('header', {}, h('h2', { id: 'album-title', text: `Postcard album: ${this.save.postcards.length} of 8` }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('div', { class: 'sse-album' }, ...cards), h('h3', { class: 'sse-album-head', text: `Bonus postcards: ${this.save.bonus.length} of 3` }), h('div', { class: 'sse-album' }, ...bonus)),
    );
    const modal = new Modal(this.host, root);
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.lensEl = h('span', { class: 'sse-lenses', role: 'img' });
    const bar = h('div', { class: 'panel sse-hudbar' }, this.lensEl);
    this.stopBar = h('div', { class: 'panel sse-stopbar', hidden: true });
    this.promptEl = h('button', { class: 'panel prompt', type: 'button', hidden: true, onclick: () => this.target && this.use(this.target) });
    this.hud = h('div', { class: 'hud', hidden: true }, bar, this.stopBar, this.promptEl);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'jobs', label: 'Stations', icon: 'scroll', key: 'J', onClick: () => this.openJobList() },
      { id: 'map', label: 'Star map', icon: 'land', key: 'P', onClick: () => this.openStarMap() },
      { id: 'album', label: 'Album', icon: 'star', key: 'B', onClick: () => this.openAlbum() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    window.addEventListener('keydown', (e) => {
      if (this.mode !== 'world' || document.querySelector('.modal-back') || this.talk.isOpen) return;
      const k = e.key.toLowerCase();
      if (k === 'j' && !this.world.onStop) this.openJobList();
      else if (k === 'p' && !this.world.onStop) this.openStarMap();
      else if (k === 'b') this.openAlbum();
    });
    this.touch = new TouchControls(this.hud, this.input, () => this.target && this.use(this.target));
    this.touch.setVisible(false);
  }

  private renderHud(): void {
    const lit = this.litArray();
    const n = lit.filter(Boolean).length;
    this.lensEl.replaceChildren(pix(`lens-${lit.join('.')}`, () => paintLensIcon(lit), 2), h('span', { class: 'sse-lens-text', text: `${n} of 4` }), h('span', { class: 'sse-cards', text: `Postcards ${this.save.postcards.length}/8` }));
    this.lensEl.setAttribute('aria-label', `${n} of 4 telescope lenses lit. ${this.save.postcards.length} of 8 postcards.`);
    const p = this.stopPlanet;
    const away = !!p;
    for (const id of ['jobs', 'map']) {
      const b = this.toolbar.button(id);
      if (b) b.hidden = away;
    }
    this.stopBar.hidden = !away;
    if (p) {
      const have = this.save.finds[p] ?? [];
      this.stopBar.replaceChildren(
        h('strong', { text: FACTS[p].name }),
        ...FIND_ORDER.map((k) => h('span', { class: `sse-find${have.includes(k) ? ' got' : ''}`, text: k === 'sample' ? 'Sample' : k === 'fact' ? 'Fact card' : 'Question' })),
        h('button', { class: 'btn small', type: 'button', text: 'Back to the observatory', onclick: () => this.mode !== 'busy' && !this.panel && void this.backToObservatory() }),
      );
    }
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
  }

  private openJobList(): void {
    if (this.mode !== 'world' || this.world.onStop) return;
    const walkTo = (id: PersonId) => () => {
      modal.close();
      const t = this.world.targets.find((x) => x.id === id);
      if (t) this.world.walkTo(t);
    };
    const rows: HTMLElement[] = STATIONS.map((s) => {
      const info = STATION_INFO[s];
      const open = OPEN_STATIONS.includes(s);
      const n = this.save.stars[s];
      const on = this.save.done.includes(s);
      return h(
        'li',
        { class: `belt-row${open ? '' : ' soon'}` },
        pix(`st-${s}-${open}`, () => paintStationIcon(s, open), 2),
        h(
          'div',
          { class: 'belt-info' },
          h('strong', { text: `${info.name}: ${info.skill}` }),
          h('span', { text: !open ? `${PEOPLE[info.person].name} is still setting up. Opens soon!` : on ? 'Done! Its telescope lens is lit.' : `Help ${PEOPLE[info.person].name}. 5 stars lights a telescope lens.` }),
          ...(open ? [h('span', { class: 'belt-stars', 'aria-label': `${n} of 5 stars` }, ...Array.from({ length: 5 }, (_, k) => iconImg(k < n ? 'star' : 'starEmpty', '', 18)))] : []),
        ),
        h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walkTo(info.person) }),
      );
    });
    rows.push(
      h(
        'li',
        { class: `belt-row${this.allDone ? '' : ' soon'}` },
        pix('tour-icon', () => paintPlanet('saturn', 4, 0.1), 2),
        h(
          'div',
          { class: 'belt-info' },
          h('strong', { text: 'The Grand Tour: fly past every planet' }),
          h('span', { text: this.save.tourDone ? 'Done! Fly it again any time with Navigator Sol.' : this.allDone ? 'Ready! Talk to Navigator Sol to launch.' : `Light all four telescope lenses to unlock it. ${this.save.done.length} of 4 lit.` }),
        ),
        h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walkTo('sol') }),
      ),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jobs-title', style: 'width:min(640px,100%)' },
      h('header', {}, h('h2', { id: 'jobs-title', text: 'Observatory stations' }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h(
        'div',
        { class: 'content' },
        h('p', { class: 'small-note', style: 'margin:0 0 10px', text: 'Win 5 stars at a station to light one of the big telescope’s lenses. A star is for getting it right the first time. Light all four for the Grand Tour. Open the star map (P) to visit the planets.' }),
        h('ul', { class: 'belt-list' }, ...rows),
      ),
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
      changeLook: () => this.customize(false, () => undefined),
      grownups: () => this.openGrownups(),
      resetSave: async () => {
        const ok = await choose(this.host, 'Start over?', 'This erases your stars, lenses and postcards in this browser. Settings are kept.', [
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
      'order-swap': 'mixing up the order of the planets',
      'look-alike': 'mixing up planets that look a bit alike',
      'moon-planet': 'calling the Moon a planet',
      'sun-planet': 'calling the Sun a planet',
      'pluto-planet': 'counting Pluto as the ninth planet',
      'rocky-giant': 'mixing up the rocky planets and the giants',
      'solid-giant': 'thinking a giant planet has ground',
      'wrong-feature': 'mixing up what makes a planet special',
      'size-mixup': 'mixing up how big things are',
      'closest-hottest': 'thinking the closest planet is the hottest',
      'far-faster': 'thinking far planets have shorter years',
      'path-speed': 'thinking a short path makes Mercury fast',
      'size-speed': 'thinking size sets a planet’s speed',
      'even-spacing': 'thinking the planets are evenly spaced',
      'far-hot': 'thinking far planets are warm',
      'spin-orbit': 'mixing up one spin (a day) and one trip round the Sun (a year)',
      'years-multiply': 'working out ages on another planet the wrong way round',
      'air-sky': 'not linking a blue sky to air',
      'sun-closer': 'thinking the Sun gets closer during the day',
      'sun-moves': 'thinking the Sun goes round Earth',
      'sun-off': 'thinking the Sun goes out at night',
      'moon-blocks': 'thinking the Moon causes night',
      'day-everywhere': 'thinking it is day all over Earth at once',
      'day-dark': 'mixing up the lit side and the dark side',
      'town-only': 'thinking the Sun lights only one place',
      'east-west': 'mixing up east and west',
      'rise-set': 'mixing up sunrise and sunset',
      'shadow-toward': 'thinking shadows point toward the Sun',
      'shadow-length': 'mixing up when shadows are long or short',
      'same-shadow': 'thinking a shadow stays the same all day',
      'no-shadow': 'thinking there is no shadow in sunlight',
      'pole-changes': 'thinking the pole itself changes',
      'air-cools': 'thinking thick air keeps a planet cool',
      'new-planet': 'thinking a planet appeared when first seen',
      'hollow-planet': 'thinking a giant planet is hollow',
      'sun-not-star': 'not seeing the Sun as the closest star',
      'sun-biggest': 'thinking the Sun is the biggest star',
      'stars-small': 'thinking other stars are small',
      'stars-gone': 'thinking stars go away in the day',
      'stars-same': 'thinking the same stars are up all year',
      'star-closer': 'thinking stars move closer or farther',
      'distance-bright': 'not linking distance with how bright a light looks',
      'moon-shines': 'thinking the Moon makes its own light',
      'planet-shines': 'thinking planets make their own light',
      'gravity-up': 'thinking things fall away from Earth',
      'no-gravity': 'thinking there is no gravity in space',
      'gravity-magnet': 'thinking air or magnets hold things down',
      'fall-off': 'thinking "down" is the bottom of the picture',
      'gravity-size': 'mixing up strong and weak gravity',
      'orbit-engine': 'thinking a probe in orbit needs its engines on',
      'season-distance': 'thinking seasons come from Earth’s distance to the Sun',
      'tilt-mixup': 'mixing up which way the tilt makes summer',
    };
    const rows = [...STATIONS, 'tour' as const, 'grand' as const].map((s) => {
      const rec = this.save.learner[s];
      const mis = topMisconception(rec);
      const name = s === 'tour' ? 'Planet stops (questions)' : s === 'grand' ? 'The Grand Tour (route and mixed questions)' : `${STATION_INFO[s].name} (${STATION_INFO[s].skill})`;
      const status = s === 'tour' ? `${this.save.postcards.length} of 8 postcards` : s === 'grand' ? (this.save.tourDone ? 'Done' : this.allDone ? 'Ready' : 'Opens after all four stations') : this.save.done.includes(s) ? 'Done' : rec ? 'In progress' : 'Not started';
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: name }),
        h('td', { text: status }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? (WORDS[mis] ?? '–') : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', { text: `This summary is kept only in this browser. Telescope lenses lit: ${this.save.done.length} of 4. Postcards: ${this.save.postcards.length} of 8, plus ${this.save.bonus.length} of 3 bonus postcards. Grand Tour: ${this.save.tourDone ? 'done' : 'not yet'}.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Part', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const pnl = this.panel;
    const q = pnl?.q;
    return {
      mode: this.mode,
      player: { x: this.world.me.x, y: this.world.me.y },
      target: this.target ? this.target.id : null,
      stars: { ...this.save.stars },
      played: { ...this.save.played },
      done: [...this.save.done],
      lit: this.world.litMask,
      talking: this.talk.isOpen,
      onStop: this.stopPlanet,
      finds: { ...this.save.finds },
      postcards: [...this.save.postcards],
      targets: this.world.targets.map((t) => t.id),
      dive: this.dive ? { depth: this.dive.depth, finds: this.dive.finds, vee: this.dive.vee, paused: this.dive.paused } : null,
      fly: this.fly ? this.fly.state : null,
      tourDone: this.save.tourDone,
      bonus: [...this.save.bonus],
      dialDone: this.save.dialDone,
      cannonDone: this.save.cannonDone,
      panel:
        pnl && q
          ? {
              station: pnl.station,
              id: q.id,
              tier: q.tier,
              ask: q.ask,
              hintRung: pnl.hintRung,
              answered: pnl.answered,
              right: q.choices.findIndex((c) => c.correct),
              wrong: q.choices.filter((c) => !c.correct).map((c) => ({ value: c.value, misconception: c.misconception })),
              model: !pnl.model.hidden,
            }
          : null,
    };
  }
}
