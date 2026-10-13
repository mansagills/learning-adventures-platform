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
import { COMMANDER_AYO, DR_AMA, paintNibPortrait } from '../../kit/worlds/star-station/body-art';
import { GERM_IDS, ORGAN_INDEX, UPGRADE_IDS, paintFactCard, paintGermPortrait, paintMissionIcon, paintUpgradeIcon, type UpgradeId } from './art';
import {
  AYO_LINES,
  BACK_HOME,
  BUMP_LINES,
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  EXPLORE_ARRIVE,
  FACT_CARDS,
  FINALE_DONE,
  FINALE_GO,
  FLY_TIP_KEYS,
  FLY_TIP_TOUCH,
  GROWNUPS,
  HEAL_GO,
  HEALED,
  HELPER_HIT,
  HELPERS_SAFE,
  hintText,
  MISSION_INFO,
  mistakeLine,
  NEST_FOUND,
  NEST_LOCKED,
  NIB,
  NIB_HELLO,
  NIB_LINES,
  OPENING,
  PEOPLE,
  praise,
  RELAYS,
  SCANS_PER_DIVE,
  STARS_PER_MISSION,
  UPGRADES,
  type FactCard,
  type MissionInfo,
  type PersonId,
} from './content';
import { BodyFlight, type FlightEvent } from './flight';
import { HABIT_MISSIONS, playHabit } from './habit';
import { BODY_SONG, HEAL_SONG, MEDBAY_SONG } from './music';
import { pix } from './pix';
import { makeQuestion, MISSIONS, ORGAN_MISSIONS, type Choice, type Kind, type Misconception, type Mission, type Question, type Tier } from './problems';
import { freshSave, store, type HeroesSave } from './save';
import { MedBayWorld, type Target, type TargetId } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_MISSION = 12;

const LOOKS: Record<PersonId, Look16> = { ama: DR_AMA, ayo: COMMANDER_AYO };
const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };

type Mode = 'title' | 'world' | 'busy' | 'flight' | 'question';

interface Dive {
  mission: Mission;
  info: MissionInfo;
  /** Free exploring (no questions, fact cards to find). */
  explore: boolean;
  /** The question being asked (scan spot index, or -1 for the nest). */
  asking: number | null;
  germsLeft: number;
}

interface Panel {
  modal: Modal;
  q: Question;
  kind: Kind;
  hintRung: number;
  tries: number;
  recorded: boolean;
  answered: boolean;
  feedback: HTMLElement;
  hintBtn: HTMLButtonElement;
  next: HTMLButtonElement;
  choices: HTMLElement;
  stars: HTMLElement;
  prompt: HTMLElement;
}

export class Game {
  private readonly world: MedBayWorld;
  private readonly flight: BodyFlight;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: HeroesSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private mapEl!: HTMLElement;
  private flightBar!: HTMLElement;
  private waveBtn!: HTMLButtonElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<PersonId | 'nib', Speaker>;
  private dive: Dive | null = null;
  private panel: Panel | null = null;
  private praiseCount = 0;
  private nibCount = 0;
  private bumpCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-star');
    this.save = store.exists() ? store.load() : freshSave();
    this.world = new MedBayWorld(host);
    this.flight = new BodyFlight(host);
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: PersonId, voice: number): Speaker => ({
      name: PEOPLE[id].name,
      role: PEOPLE[id].role,
      voice,
      portrait: (e: Expression) => {
        const key = `${id}-${e}`;
        let u = cache.get(key);
        if (!u) cache.set(key, (u = paintPortrait16(LOOKS[id], id === 'ayo' && this.save.done.length < MISSIONS.length && e === 'smile' ? 'thinking' : MOOD[e]).toDataURL(2)));
        return u;
      },
    });
    const nibHappy = paintNibPortrait(true).toDataURL(2);
    const nibThink = paintNibPortrait(false).toDataURL(2);
    this.speakers = {
      ama: speaker('ama', 190),
      ayo: speaker('ayo', 150),
      nib: { name: NIB.name, role: NIB.role, voice: 320, portrait: (e: Expression) => (e === 'thinking' ? nibThink : nibHappy) },
    };
    audio.addSong('medbay', MEDBAY_SONG);
    audio.addSong('body', BODY_SONG);
    audio.addSong('heal', HEAL_SONG);
    this.world.onArrive = (t) => this.use(t);
    this.flight.onEvent = (e) => this.onFlightEvent(e);
    window.addEventListener('resize', () => {
      this.world.resize();
      this.flight.resize();
    });
    this.world.stage.canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    // fly toward the held pointer (mouse or finger)
    const fc = this.flight.stage.canvas;
    const steer = (e: PointerEvent) => {
      if (this.mode !== 'flight' || this.flight.paused) return;
      const r = this.host.getBoundingClientRect();
      this.flight.pointer = this.flight.tileAt(e.clientX - r.left, e.clientY - r.top);
    };
    fc.addEventListener('pointerdown', (e) => {
      audio.unlock();
      fc.setPointerCapture(e.pointerId);
      steer(e);
    });
    fc.addEventListener('pointermove', (e) => e.buttons && steer(e));
    const release = () => (this.flight.pointer = null);
    fc.addEventListener('pointerup', release);
    fc.addEventListener('pointercancel', release);
    this.input.onAction((a) => this.onAction(a));
    bus.on('settings:changed', () => {
      this.world.reducedMotion = settings.reducedMotion;
      this.flight.reducedMotion = settings.reducedMotion;
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
      this.updateTouch();
    });
    this.world.reducedMotion = settings.reducedMotion;
    this.flight.reducedMotion = settings.reducedMotion;
    this.buildHud();
    mountToasts(host);
    window.addEventListener('keydown', (e) => {
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) this.onPanelKey(e);
      else if (this.mode === 'flight' && !this.talk.isOpen && !document.querySelector('.modal-back') && e.key.toLowerCase() === 'e') this.wave();
    });
    (window as unknown as { __bsh: unknown }).__bsh = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      fly: (m: Mission) => this.mode === 'world' && void this.startMission(m),
      explore: (m: Mission) => this.mode === 'world' && void this.startExplore(m),
      setTier: (m: Mission, t: Tier) => {
        skill(this.save.learner, m).tier = t;
      },
      setStars: (m: Mission, n: number) => {
        this.save.stars[m] = n;
        this.persist();
      },
      finishAll: (withFinale = false) => {
        for (const m of withFinale ? MISSIONS : ORGAN_MISSIONS) if (!this.save.done.includes(m)) this.save.done.push(m);
        this.save.upgrades = [...UPGRADE_IDS];
        this.save.habits = [...HABIT_MISSIONS];
        this.persist();
        this.world.setHealed(this.healedOrgans());
        this.updateMarkers();
        this.renderHud();
      },
      markDone: (ms: Mission[]) => {
        for (const m of ms) {
          if (!this.save.done.includes(m)) this.save.done.push(m);
          const up = MISSION_INFO[m].upgrade;
          if (m !== 'brain' && !this.save.upgrades.includes(up)) this.save.upgrades.push(up);
          if (HABIT_MISSIONS.includes(m) && !this.save.habits.includes(m)) this.save.habits.push(m);
          if (!this.save.briefed.includes(m)) this.save.briefed.push(m);
        }
        this.persist();
        this.world.setHealed(this.healedOrgans());
        this.updateMarkers();
        this.renderHud();
      },
      teleport: (x: number, y: number) => {
        if (this.mode === 'flight' || this.mode === 'question') this.flight.teleport(x, y);
        else {
          this.world.player.x = x;
          this.world.player.y = y;
          this.world.follow();
        }
      },
      flightInfo: () => this.flight.debug(),
      healNow: () => {
        for (const g of this.flight.germs) g.hp = 0;
      },
      lastMessage: () => this.lastComplete,
    };
  }

  start(): void {
    const names = { ama: PEOPLE.ama.name, ayo: PEOPLE.ayo.name };
    this.world.build(this.playerLook(), LOOKS, names, this.healedOrgans());
    this.updateMarkers();
    this.world.establishing = true;
    this.world.follow();
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      const free = !document.querySelector('.modal-back') && !this.talk.isOpen;
      this.input.worldActive = (this.mode === 'world' || this.mode === 'flight') && free;
      if (this.mode === 'flight' || this.mode === 'question' || (this.mode === 'busy' && this.dive)) {
        this.flight.paused = this.mode !== 'flight' || !free;
        this.flight.update(dt, this.mode === 'flight' && free ? this.input.direction() : { x: 0, y: 0 });
        this.flight.render();
        this.updateFlightHud();
        this.promptEl.hidden = true;
      } else {
        this.world.establishing = this.mode === 'title' || (!this.save.openingSeen && this.mode === 'busy');
        this.world.update(dt, this.mode === 'world' ? this.input : null);
        this.updatePrompt();
        this.world.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private playerLook(): Look16 {
    return look16FromAppearance(this.save.appearance);
  }

  private healedOrgans(): number[] {
    return this.save.done.map((m) => ORGAN_INDEX[m]);
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Body System Heroes',
      subtitle: 'A tiny ship on a big mission inside the body',
      intro: ['Shrink down in the Micro-Scout and fly inside Commander Ayo’s body. Learn how the skin, teeth, lungs, gut, heart and brain work, find the germs, and help the body heal.', 'For grades 3 to 5. Every line can be read aloud.'],
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
        noun: 'pilot',
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your stars, upgrades and healed organs in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.setHealed([]);
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
    audio.play('medbay');
    this.renderHud();
    if (!this.save.openingSeen) void this.opening();
  }

  private async opening(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers.ama, OPENING.slice(0, 3));
    this.world.cheer();
    await this.talk.say(this.speakers.nib, NIB_HELLO, 'smile');
    await this.talk.say(this.speakers.ama, OPENING[3], 'proud');
    await this.talk.say(this.speakers.ama, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
  }

  /** The missions that can be flown now: the five organs, then the finale once they are all healed. */
  private available(): Mission[] {
    return this.finaleOpen() ? MISSIONS : ORGAN_MISSIONS;
  }

  private finaleOpen(): boolean {
    return ORGAN_MISSIONS.every((m) => this.save.done.includes(m));
  }

  private updateMarkers(): void {
    const left = this.available().some((m) => !this.save.done.includes(m));
    this.world.setMarkers({ ama: left ? 'new' : null, ayo: null });
  }

  // ------------------------------------------------------------ the med bay

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
    const s = this.world.screenOf(t, t.id === 'nib' ? 1.6 : t.id === 'beam' ? 2.4 : 2.9);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel(t.id === 'beam' ? 'Fly' : t.id === 'map' ? 'Look' : 'Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'question') return;
    if (a === 'interact' && this.mode === 'world' && this.target) this.use(this.target);
    else if (a === 'interact' && this.mode === 'flight' && this.flight.hasWave) this.wave();
    else if (a === 'mute') this.toggleMute();
    else if (a === 'menu' && (this.mode === 'world' || this.mode === 'flight')) this.openSettingsPanel();
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
      const s = this.world.screenOf(t, t.id === 'nib' ? 1 : 1.0);
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
    void this.useTarget(t.id);
  }

  private async useTarget(id: TargetId): Promise<void> {
    this.mode = 'busy';
    if (id === 'nib') {
      this.world.cheer();
      await this.talk.say(this.speakers.nib, NIB_LINES[this.nibCount++ % NIB_LINES.length], 'smile');
    } else if (id === 'ayo') {
      await this.talk.say(this.speakers.ayo, AYO_LINES[Math.min(6, this.save.done.length)], this.save.done.length >= MISSIONS.length ? 'proud' : 'thinking');
    } else if (id === 'map') {
      this.talk.end();
      this.mode = 'world';
      this.openMissionList();
      return;
    } else {
      // Dr. Ama or the shrink beam: where shall we fly?
      const missions = this.available();
      const labels = missions.map((m) => (m === 'brain' ? `The Big Defense (brain)${this.save.done.includes(m) ? ' (won)' : ''}` : `${MISSION_INFO[m].organ}${this.save.done.includes(m) ? ' (healed)' : ''}`));
      const text = this.save.done.length >= MISSIONS.length
        ? 'Every part of the body is healed! Fly back in for more practice, or explore from the body map to find fact cards.'
        : this.finaleOpen() && !this.save.done.includes('brain')
          ? 'The whole Grime Gang is back! Fly into the brain for The Big Defense, or pick another part.'
          : 'Where shall we fly? Pick a part of the body.';
      const pick = await this.talk.offer(id === 'beam' ? this.speakers.nib : this.speakers.ama, text, [...labels, 'Not now']);
      if (pick < missions.length) {
        this.talk.end();
        void this.startMission(missions[pick]);
        return;
      }
    }
    this.talk.end();
    this.mode = 'world';
  }

  // ------------------------------------------------------------ a dive into the body

  private async startMission(m: Mission): Promise<void> {
    const info = MISSION_INFO[m];
    this.mode = 'busy';
    if (!this.save.briefed.includes(m)) {
      await this.talk.say(this.speakers.ama, info.briefing);
      this.save.briefed.push(m);
      this.persist();
    }
    this.talk.end();
    const tier = skill(this.save.learner, m).tier as Tier;
    this.shrink({ mission: m, info, asking: null, germsLeft: info.germs + 2 * (tier - 1), explore: false });
    this.flight.start({
      area: info.area,
      germ: info.finale ? GERM_IDS : info.germ,
      scans: info.finale ? info.scans : info.scans.slice(0, SCANS_PER_DIVE),
      nest: info.nest,
      start: info.start,
      exit: info.exit,
      upgrades: this.save.upgrades,
      flow: info.flow,
      pulse: info.pulse,
      helpers: info.helpers,
      ordered: info.finale,
      fever: info.finale,
    });
    await this.arrive(info.arrive);
  }

  /** Free exploring in a healed part of the body: no questions, just the fact cards still to find. */
  private async startExplore(m: Mission): Promise<void> {
    const info = MISSION_INFO[m];
    this.mode = 'busy';
    this.shrink({ mission: m, info, asking: null, germsLeft: 0, explore: true });
    const cards = this.cardsLeftIn(m);
    this.exploreCards = cards;
    this.flight.start({ area: info.area, germ: info.germ, scans: [], nest: info.nest, start: info.start, exit: info.exit, upgrades: this.save.upgrades, flow: info.flow, pulse: info.pulse, helpers: info.helpers, explore: true, cards: cards.map((c) => ({ x: c.x, y: c.y })) });
    await this.arrive(cards.length ? EXPLORE_ARRIVE : 'Every fact card here is found! Fly around as long as you like, then fly to the glowing ring to go home.');
  }

  private exploreCards: FactCard[] = [];

  private cardsLeftIn(m: Mission): FactCard[] {
    return FACT_CARDS.filter((c) => c.mission === m && !this.save.cards.includes(c.id));
  }

  /** The shrink beam: the med bay gives way to the inside of the body. */
  private shrink(d: Dive): void {
    audio.fx(
      [
        [72, 0, 0.12],
        [79, 0.1, 0.12],
        [84, 0.2, 0.12],
        [91, 0.3, 0.2],
      ],
      'sine',
      0.08,
    );
    toast('Shrinking!', 'reward');
    this.dive = d;
  }

  private async arrive(line: string): Promise<void> {
    this.world.setVisible(false);
    this.flight.setVisible(true);
    this.flight.resize();
    audio.play('body');
    this.renderHud();
    await this.talk.say(this.speakers.nib, line, 'smile');
    if (!this.save.flyTipSeen) {
      await this.talk.say(this.speakers.nib, isTouchDevice() ? FLY_TIP_TOUCH : FLY_TIP_KEYS, 'smile');
      this.save.flyTipSeen = true;
      this.persist();
    }
    this.talk.end();
    this.mode = 'flight';
    this.updateTouch();
  }

  private onFlightEvent(e: FlightEvent): void {
    const d = this.dive;
    if (!d) return;
    if (e.type === 'scan') {
      d.asking = e.index;
      this.openQuestion('scan');
    } else if (e.type === 'nest-locked') {
      const line = d.info.finale ? 'The Grime Gang is hiding in the middle. Send every message along the nerves first!' : NEST_LOCKED;
      toast(line, 'hint');
      speak(line);
    } else if (e.type === 'nest') {
      d.asking = -1;
      void this.nestFound();
    } else if (e.type === 'pop') {
      audio.fx([[88 + (e.left % 4), 0, 0.08]], 'square', 0.05);
      this.renderHud();
    } else if (e.type === 'bump') {
      audio.retry();
      toast(BUMP_LINES[this.bumpCount++ % BUMP_LINES.length]);
    } else if (e.type === 'helper') {
      audio.retry();
      toast(HELPER_HIT, 'hint');
      speak(HELPER_HIT);
    } else if (e.type === 'card') {
      void this.collectCard(e.index);
    } else if (e.type === 'healed') {
      audio.levelUp();
      audio.play('body');
      const safe = (d.info.helpers ?? 0) > 0 && this.flight.helperHits === 0 ? ` ${HELPERS_SAFE}` : '';
      toast(`${HEALED}${safe}`, 'reward');
      speak(`${HEALED}${safe}`);
      this.renderHud();
    } else if (e.type === 'exit') void this.endDive();
  }

  /** A fact card was found while exploring: show it. */
  private async collectCard(i: number): Promise<void> {
    const card = this.exploreCards[i];
    if (!card || this.save.cards.includes(card.id)) return;
    this.save.cards.push(card.id);
    this.persist();
    audio.itemGet();
    this.mode = 'busy';
    await this.showCard(card, true);
    this.mode = 'flight';
    this.renderHud();
  }

  private showCard(card: FactCard, fresh: boolean): Promise<void> {
    return new Promise((resolve) => {
      const close = h('button', { class: 'btn primary', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() });
      const n = this.save.cards.length;
      const root = h(
        'div',
        { class: 'panel modal bsh-file bsh-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bsh-card-title' },
        h('header', {}, h('h2', { id: 'bsh-card-title', text: fresh ? `Fact card ${n} of ${FACT_CARDS.length}: ${card.title}` : card.title })),
        h('div', { class: 'content bsh-file-body' }, pix(`mission-${card.mission}-true`, () => paintMissionIcon(card.mission, true), 4, ''), h('p', { class: 'bsh-card-text', text: card.text })),
        h('footer', { class: 'bsh-file-foot' }, close),
      );
      const modal = new Modal(this.host, root, () => resolve());
      speak(`${card.title}. ${card.text}`);
    });
  }

  private async nestFound(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers.nib, NEST_FOUND, 'curious');
    this.talk.end();
    this.openQuestion('diagnose');
  }

  private wave(): void {
    if (this.mode !== 'flight') return;
    if (this.flight.useWave()) {
      audio.fx(
        [
          [67, 0, 0.12],
          [74, 0.08, 0.16],
        ],
        'sine',
        0.1,
      );
    } else if (this.flight.hasWave && this.flight.phase === 'heal') toast('The saliva wave is filling up again.');
  }

  private async endDive(): Promise<void> {
    const d = this.dive;
    if (!d) return;
    this.mode = 'busy';
    this.dive = null;
    this.flight.setVisible(false);
    this.world.setVisible(true);
    this.world.resize();
    audio.play('medbay');
    this.renderHud();
    this.updateTouch();
    const m = d.mission;
    if (d.explore) {
      const left = this.cardsLeftIn(m).length;
      await this.talk.say(this.speakers.ama, `Welcome back, explorer! You have ${this.save.cards.length} of ${FACT_CARDS.length} body fact cards.${left ? ` There ${left === 1 ? 'is 1 more' : `are ${left} more`} in that part of the body.` : ''}`, 'smile');
      this.talk.end();
      this.mode = 'world';
      this.updateTouch();
      return;
    }
    await this.talk.say(this.speakers.ama, BACK_HOME, 'smile');
    if (!this.save.habits.includes(m) && HABIT_MISSIONS.includes(m)) {
      await this.talk.say(this.speakers.ama, `Now let’s practice the healthy habit that keeps ${d.info.germName} away.`, 'smile');
      this.talk.end();
      const res = await playHabit(this.host, m, this.save.seed++, this.playerLook());
      if (res.finished) {
        this.save.habits.push(m);
        this.persist();
      }
    }
    if (d.info.finale) {
      // the finale is won by finishing it once
      if (!this.save.done.includes(m)) await this.finishFinale();
      else await this.talk.say(this.speakers.ama, 'The Grime Gang is beaten again! Great practice.', 'proud');
    } else {
      const rec = skill(this.save.learner, m);
      const ready = this.save.stars[m] >= STARS_PER_MISSION && (rec.tier >= 2 || this.save.played[m] >= MAX_PER_MISSION);
      if (ready && !this.save.done.includes(m)) await this.finishMission(m);
      else if (!this.save.done.includes(m)) await this.talk.say(this.speakers.ama, `${this.save.stars[m]} of ${STARS_PER_MISSION} stars for this mission. Fly in again to win the rest!`, 'smile');
    }
    this.talk.end();
    this.mode = 'world';
    this.updateTouch();
  }

  private async finishMission(m: Mission): Promise<void> {
    const info = MISSION_INFO[m];
    await this.talk.say(this.speakers.ama, 'Five stars! Before we celebrate, one question.', 'proud');
    const res = await this.talk.ask(this.speakers.ama, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${m}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(m);
    if (!this.save.upgrades.includes(info.upgrade)) this.save.upgrades.push(info.upgrade);
    this.persist();
    this.world.setHealed(this.healedOrgans());
    this.world.cheer();
    this.updateMarkers();
    audio.levelUp();
    toast(`${info.organ} healed! New upgrade: ${UPGRADES[info.upgrade].name}`, 'reward');
    await this.talk.say(this.speakers.ama, info.done, 'proud');
    this.talk.end();
    await this.showGermFile(m, true);
    await this.talk.say(this.speakers.nib, `${UPGRADES[info.upgrade].name}: ${UPGRADES[info.upgrade].what}`, 'smile');
    await this.talk.say(this.speakers.nib, 'You can fly back in from the body map to explore. Look for the gold fact cards!', 'smile');
    if (this.finaleOpen()) {
      await this.talk.say(this.speakers.ayo, AYO_LINES[5], 'thinking');
      await this.talk.say(this.speakers.ama, ['Oh no. The scanners show the whole Grime Gang coming back, all at once!', 'This needs the whole body working together. And the brain is the control center.', 'When you are ready, fly into the brain for The Big Defense.'], 'thinking');
    }
    this.renderHud();
  }

  /** The finale is won: the debrief, Commander Ayo well again, the crew cheers, and the site hears the game is complete. */
  private async finishFinale(): Promise<void> {
    const info = MISSION_INFO.brain;
    await this.talk.say(this.speakers.ama, 'You did it! One last question, the biggest one.', 'proud');
    const res = await this.talk.ask(this.speakers.ama, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, 'brain-talk', { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push('brain');
    this.persist();
    this.world.setHealed(this.healedOrgans());
    this.updateMarkers();
    audio.levelUp();
    this.world.cheer();
    toast('The Big Defense is won! Commander Ayo is well again.', 'reward');
    await this.talk.say(this.speakers.ama, info.done, 'proud');
    await this.talk.say(this.speakers.ayo, FINALE_DONE[0], 'proud');
    this.world.cheer();
    await this.talk.say(this.speakers.ama, FINALE_DONE[1], 'proud');
    await this.talk.say(this.speakers.nib, FINALE_DONE[2], 'smile');
    this.talk.end();
    await this.showGermFile('brain', true);
    const stars = MISSIONS.reduce((n, m) => n + this.save.stars[m], 0);
    this.lastComplete = { type: 'game-complete', score: stars };
    try {
      window.parent?.postMessage(this.lastComplete, '*');
    } catch {
      /* not in the site's player */
    }
    this.renderHud();
  }

  private lastComplete: { type: string; score: number } | null = null;

  /** The germ file: a wanted poster for a germ beaten on a mission. */
  private showGermFile(m: Mission, fresh = false): Promise<void> {
    const info = MISSION_INFO[m];
    return new Promise((resolve) => {
      const close = h('button', { class: 'btn primary', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() });
      const root = h(
        'div',
        { class: 'panel modal bsh-file', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bsh-file-title' },
        h('header', {}, h('h2', { id: 'bsh-file-title', text: fresh ? `New germ file: ${info.germName}` : `Germ file: ${info.germName}` })),
        h(
          'div',
          { class: 'content bsh-file-body' },
          pix(`germ-portrait-${info.germ}`, () => paintGermPortrait(info.germ), 2, info.germName),
          h('dl', {}, h('dt', { text: 'What it is' }), h('dd', { text: info.file.what }), h('dt', { text: 'Where it lives' }), h('dd', { text: info.file.where }), h('dt', { text: 'How to stop it' }), h('dd', { text: info.file.stop })),
        ),
        h('footer', { class: 'bsh-file-foot' }, close),
      );
      const modal = new Modal(this.host, root, () => resolve());
      speak(`${info.germName}. ${info.file.what} ${info.file.stop}`);
    });
  }

  // ------------------------------------------------------------ the question panel

  private openQuestion(kind: Kind): void {
    const d = this.dive!;
    const m = d.mission;
    this.mode = 'question';
    this.flight.pointer = null;
    const tier = skill(this.save.learner, m).tier as Tier;
    const q = makeQuestion(m, tier, kind, mulberry32(this.save.seed++), this.save.recent);
    this.save.recent = [...this.save.recent.filter((x) => x !== q.id), q.id].slice(-40);
    this.persist();
    const stars = h('span', { class: 'bsh-stars', role: 'img' });
    const prompt = h('p', { class: 'bsh-prompt', text: q.ask });
    const speakBtn = h('button', { class: 'btn small bsh-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => speak(q.ask, { force: true }));
    const feedback = h('div', { class: 'bsh-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const hintBtn = h('button', { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Fly on' : 'Fly on (Space)' });
    const choices = h(
      'div',
      { class: 'bsh-options' },
      ...q.choices.map((c, i) => {
        const b = h('button', { class: 'btn bsh-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1) }, h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }), h('span', { class: 'bsh-choice-text', text: c.label }));
        b.addEventListener('click', () => this.pick(c));
        return b;
      }),
    );
    const total = d.info.finale ? d.info.scans.length : SCANS_PER_DIVE;
    const title = kind === 'scan' ? `${d.info.finale ? 'Nerve relay' : 'Scan'} ${total - this.flight.scansLeft + 1} of ${total}` : d.info.finale ? 'The last stand: the Grime Gang' : `The nest: ${d.info.germName}`;
    const root = h(
      'div',
      { class: `panel modal bsh-panel bsh-${kind}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bsh-q-title' },
      h('header', {}, h('h2', { id: 'bsh-q-title', text: title }), h('div', { class: 'bsh-head-right' }, h('span', { class: 'bsh-level', text: `Level ${q.tier} of 3` }), stars, h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }))),
      h('div', { class: 'bsh-ask' }, kind === 'diagnose' ? pix(`germ-portrait-${d.info.germ}`, () => paintGermPortrait(d.info.germ), 1, d.info.germName) : h('img', { class: 'bsh-host', src: this.speakers.nib.portrait('smile'), alt: 'Nib', width: 64, height: 64 }), prompt, speakBtn),
      choices,
      feedback,
      h('footer', { class: 'bsh-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closeQuestion(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => modal.close());
    this.panel = { modal, q, kind, hintRung: 0, tries: 0, recorded: false, answered: false, feedback, hintBtn, next, choices, stars, prompt };
    this.renderStars();
    speak(q.ask);
    requestAnimationFrame(() => choices.querySelector<HTMLButtonElement>('button')?.focus());
  }

  private pick(c: Choice): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered) return;
    const btn = pnl.choices.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(c.value)}"]`);
    if (btn?.disabled) return;
    const m = this.dive!.mission;
    if (c.correct) {
      pnl.answered = true;
      const clean = pnl.tries === 0 && pnl.hintRung <= 1;
      let tierChange = 0;
      if (!pnl.recorded) {
        pnl.recorded = true;
        tierChange = recordAnswer(this.save.learner, m, { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
      }
      this.save.played[m]++;
      if (clean && this.save.stars[m] < STARS_PER_MISSION) this.save.stars[m]++;
      this.persist();
      if (clean) audio.itemGet();
      else audio.correct();
      const msg = clean ? `${praise(this.praiseCount++)} You win a star.` : 'You got it! Stars are for getting it right the first time.';
      this.showFeedback(`${msg} ${pnl.q.explain}`, 'good');
      btn?.classList.add('right');
      pnl.choices.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
      pnl.hintBtn.disabled = true;
      pnl.next.hidden = false;
      this.renderStars();
      if (tierChange > 0) toast('Level up! Trickier questions.', 'reward');
      requestAnimationFrame(() => pnl.next.focus());
      return;
    }
    pnl.tries++;
    if (!pnl.recorded) {
      pnl.recorded = true;
      const o = recordAnswer(this.save.learner, m, { correct: false, hintRung: pnl.hintRung, misconception: (c.misconception ?? null) as Misconception | null }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let’s practice a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(mistakeLine(c), 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.choices.querySelector<HTMLButtonElement>('.bsh-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
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
    if (pnl.hintRung >= 3) pnl.choices.querySelector(`[data-value="${CSS.escape(pnl.q.choices.find((c) => c.correct)!.value)}"]`)?.classList.add('worked');
    this.showFeedback(`Hint ${pnl.hintRung} of 3: ${hintText(pnl.q, pnl.hintRung)}`, 'hint');
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `bsh-feedback ${kind}`;
    pnl.feedback.replaceChildren(kind === 'hint' ? iconImg('bulb', '', 22) : kind === 'good' ? iconImg('star', '', 22) : '', h('span', { text }));
    speak(text);
  }

  private renderStars(): void {
    const pnl = this.panel;
    const d = this.dive;
    if (!pnl || !d) return;
    const n = this.save.stars[d.mission];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_MISSION }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_MISSION} stars`);
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
      pnl.modal.close();
    } else if (/^[1-3]$/.test(k) && !e.repeat) {
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.bsh-choice')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closeQuestion(): void {
    stopSpeaking();
    const pnl = this.panel;
    const d = this.dive;
    this.panel = null;
    if (!pnl || !d) return;
    const i = d.asking;
    d.asking = null;
    if (pnl.kind === 'scan' && i !== null && i >= 0) {
      if (pnl.answered) this.flight.completeScan(i);
      else this.flight.reopenScan(i);
      this.mode = 'flight';
      if (pnl.answered && d.info.finale) {
        // each relay sends the brain's call to one part of the body
        const line = this.flight.scansLeft === 0 ? `${RELAYS[RELAYS.length - 1]} Now fly to the middle: the Grime Gang is there!` : `${RELAYS[(d.info.scans.length - this.flight.scansLeft - 1) % RELAYS.length]} On to the next relay!`;
        toast(line, 'reward');
        speak(line);
      } else if (pnl.answered && this.flight.scansLeft === 0) {
        toast('Every spot is scanned! Now find the germs’ nest.', 'reward');
        speak('Every spot is scanned! Now find the germs’ nest.');
      }
    } else if (pnl.kind === 'diagnose') {
      if (pnl.answered) {
        this.flight.startHeal(d.germsLeft);
        audio.play('heal');
        const go = d.info.finale ? FINALE_GO : HEAL_GO;
        toast(go, 'reward');
        speak(go);
      } else this.flight.reopenNest();
      this.mode = 'flight';
    }
    this.renderHud();
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.mapEl = h('span', { class: 'bsh-map', role: 'img' });
    this.flightBar = h('span', { class: 'bsh-flightbar', hidden: true });
    this.waveBtn = h('button', { class: 'btn small bsh-wave', type: 'button', hidden: true, 'aria-keyshortcuts': 'E', onclick: () => this.wave() }, pix('up-wave', () => paintUpgradeIcon('wave'), 2), h('span', { text: 'Wave' }), h('span', { class: 'kbd', text: 'E' }));
    const bar = h('div', { class: 'panel bsh-hudbar' }, this.mapEl, this.flightBar, this.waveBtn);
    this.promptEl = h('button', { class: 'panel prompt', type: 'button', hidden: true, onclick: () => this.target && this.use(this.target) });
    this.hud = h('div', { class: 'hud', hidden: true }, bar, this.promptEl);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'missions', label: 'Missions', icon: 'scroll', key: 'J', onClick: () => this.openMissionList() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'j' && this.mode === 'world' && !document.querySelector('.modal-back') && !this.talk.isOpen) this.openMissionList();
    });
    this.touch = new TouchControls(this.hud, this.input, () => {
      if (this.mode === 'flight') this.wave();
      else if (this.target) this.use(this.target);
    });
    this.touch.setVisible(false);
  }

  private updateTouch(): void {
    const on = (this.mode === 'world' || this.mode === 'flight') && touchControlsVisible();
    this.touch?.setVisible(on);
    if (this.mode === 'flight') this.touch?.setActLabel(this.flight.hasWave ? 'Wave' : null);
  }

  private renderHud(): void {
    const done = this.save.done;
    this.mapEl.replaceChildren(...MISSIONS.map((m) => pix(`mission-${m}-${done.includes(m)}`, () => paintMissionIcon(m, done.includes(m)), 2)), h('span', { class: 'bsh-map-text', text: `${done.length} of ${MISSIONS.length} healed` }));
    this.mapEl.setAttribute('aria-label', `${done.length} of ${MISSIONS.length} body parts healed`);
    this.updateFlightHud(true);
  }

  private flightHudKey = '';
  private updateFlightHud(force = false): void {
    const d = this.dive;
    const inFlight = !!d && this.mode !== 'world';
    const ph = this.flight.phase;
    const text = !d
      ? ''
      : d.explore
        ? `Fact cards here: ${this.flight.cardsLeft} left. The ring takes you home.`
        : ph === 'heal'
          ? `Germs left: ${this.flight.germs.length}`
          : ph === 'healed'
            ? 'All clear! Fly to the ring'
            : this.flight.scansLeft > 0
              ? d.info.finale
                ? `Nerve relays left: ${this.flight.scansLeft}`
                : `Scan spots left: ${this.flight.scansLeft}`
              : d.info.finale
                ? 'Find the Grime Gang in the middle'
                : 'Find the germs’ nest';
    const key = `${inFlight}|${text}|${ph}|${Math.ceil(this.flight.waveCooldown)}|${this.save.cards.length}`;
    if (!force && key === this.flightHudKey) return;
    this.flightHudKey = key;
    this.flightBar.hidden = !inFlight;
    this.flightBar.textContent = text;
    this.waveBtn.hidden = !(inFlight && this.flight.hasWave && ph === 'heal');
    this.waveBtn.disabled = this.flight.waveCooldown > 0;
    this.mapEl.hidden = inFlight;
  }

  private openMissionList(): void {
    if (this.mode !== 'world') return;
    const go = (fn: () => Promise<void>) => () => {
      modal.close();
      void fn();
    };
    const rows = MISSIONS.map((m) => {
      const info = MISSION_INFO[m];
      const open = this.available().includes(m);
      const n = this.save.stars[m];
      const on = this.save.done.includes(m);
      const cardsHere = FACT_CARDS.filter((c) => c.mission === m);
      const got = cardsHere.filter((c) => this.save.cards.includes(c.id)).length;
      const status = !open
        ? 'Opens when the other five are healed.'
        : m === 'brain'
          ? on
            ? 'Won! Every defense worked together.'
            : 'The finale: carry the brain’s message along the nerves, then beat the whole Grime Gang.'
          : on
            ? `Healed! Upgrade: ${UPGRADES[info.upgrade].name}.`
            : `Germ: ${info.germName}. 5 stars heals it.`;
      return h(
        'li',
        { class: `belt-row${open ? '' : ' soon'}` },
        pix(`mission-${m}-${open}`, () => paintMissionIcon(m, open), 2),
        h(
          'div',
          { class: 'belt-info' },
          h('strong', { text: `${info.name}: ${info.organ}` }),
          h('span', { text: status }),
          ...(open && m !== 'brain' ? [h('span', { class: 'belt-stars', 'aria-label': `${n} of 5 stars` }, ...Array.from({ length: 5 }, (_, k) => iconImg(k < n ? 'star' : 'starEmpty', '', 18)))] : []),
          ...(on ? [h('span', { text: `Fact cards: ${got} of ${cardsHere.length}` })] : []),
        ),
        ...(open
          ? [
              h(
                'div',
                { class: 'bsh-row-btns' },
                h('button', { class: 'btn small primary', type: 'button', text: m === 'brain' ? 'Fly to the brain' : 'Fly in', onclick: go(() => this.startMission(m)) }),
                ...(on ? [h('button', { class: 'btn small', type: 'button', text: 'Explore', onclick: go(() => this.startExplore(m)) })] : []),
                ...(this.save.habits.includes(m) && HABIT_MISSIONS.includes(m) ? [h('button', { class: 'btn small', type: 'button', text: 'Habit', onclick: () => void playHabit(this.host, m, this.save.seed++, this.playerLook()) })] : []),
                ...(on ? [h('button', { class: 'btn small', type: 'button', text: 'Germ file', onclick: () => void this.showGermFile(m) })] : []),
              ),
            ]
          : []),
      );
    });
    const ups = UPGRADE_IDS.map((u: UpgradeId) => {
      const has = this.save.upgrades.includes(u);
      return h('li', { class: `bsh-up${has ? '' : ' soon'}` }, pix(`up-${u}-${has}`, () => paintUpgradeIcon(u, has), 2), h('span', { text: has ? `${UPGRADES[u].name}: ${UPGRADES[u].what}` : `${UPGRADES[u].name}: not yet` }));
    });
    const cards = h(
      'ul',
      { class: 'bsh-cards' },
      ...FACT_CARDS.map((c) => {
        const got = this.save.cards.includes(c.id);
        return h(
          'li',
          {},
          got
            ? h('button', { class: 'bsh-card-btn', type: 'button', 'aria-label': `Fact card: ${c.title}`, onclick: () => void this.showCard(c, false) }, pix('fact-card', () => paintFactCard(16, 0), 2, ''), h('span', { text: c.title }))
            : h('span', { class: 'bsh-card-btn soon', 'aria-label': 'A fact card still to find' }, pix('fact-card-off', () => paintMissionIcon(c.mission, false), 2, ''), h('span', { text: '?' })),
        );
      }),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'missions-title', style: 'width:min(720px,100%)' },
      h('header', {}, h('h2', { id: 'missions-title', text: 'The body map' }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h(
        'div',
        { class: 'content' },
        h('p', { class: 'small-note', style: 'margin:0 0 10px', text: 'Win 5 stars in a mission to heal that part of the body. A star is for getting a question right the first time. Explore a healed part to find its fact cards.' }),
        h('ul', { class: 'belt-list' }, ...rows),
        h('h3', { class: 'bsh-up-title', text: 'Ship upgrades' }),
        h('ul', { class: 'bsh-ups' }, ...ups),
        h('h3', { class: 'bsh-up-title', text: `Body fact cards: ${this.save.cards.length} of ${FACT_CARDS.length}` }),
        cards,
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
        const ok = await choose(this.host, 'Start over?', 'This erases your stars, upgrades and healed organs in this browser. Settings are kept.', [
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
      'wrong-part': 'mixing up which body part is which',
      'wrong-job': 'mixing up what a body part does',
      'wrong-order': 'getting the steps or the path in the wrong order',
      'helper-or-germ': 'mixing up the body’s helper cells and germs',
      'virus-bacteria': 'mixing up viruses and bacteria',
      'antibiotics-virus': 'thinking antibiotics fight viruses like the flu',
      'cold-weather': 'thinking cold weather causes the flu',
      'water-only': 'thinking a quick rinse cleans hands',
      'fever-sickness': 'thinking a fever is the sickness itself',
      'pick-scab': 'thinking a scab should be picked',
      'heals-itself': 'thinking a problem fixes itself',
      'skip-habit': 'thinking a healthy habit can be skipped',
      'sugar-ok': 'thinking sugar does not matter for teeth',
      'stomach-only': 'thinking digestion starts in the stomach',
      'lungs-balloons': 'thinking the lungs are two empty bags',
      'all-germs-bad': 'thinking all bacteria are bad',
      'blue-blood': 'thinking blood in the veins is blue',
      'heart-tired': 'thinking the heart gets tired or stops to rest',
      'brain-thinking-only': 'thinking the brain only does thinking',
    };
    const rows = MISSIONS.map((m) => {
      const rec = this.save.learner[m];
      const mis = topMisconception(rec);
      const info = MISSION_INFO[m];
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: `${info.name} (${info.organ})` }),
        h('td', { text: this.save.done.includes(m) ? 'Healed' : rec ? 'In progress' : 'Not started' }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? (WORDS[mis] ?? '–') : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', { text: `This summary is kept only in this browser. Body parts healed: ${this.save.done.length} of ${MISSIONS.length}${this.save.done.includes('brain') ? ' (the finale is won)' : ''}. Healthy habits practiced: ${this.save.habits.length} of ${HABIT_MISSIONS.length}. Body fact cards found: ${this.save.cards.length} of ${FACT_CARDS.length}.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Mission', 'Status', 'Answers', 'Level now', 'Most common mix-up'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const pnl = this.panel;
    return {
      mode: this.mode,
      player: { x: this.world.player.x, y: this.world.player.y },
      target: this.target ? this.target.id : null,
      stars: { ...this.save.stars },
      played: { ...this.save.played },
      done: [...this.save.done],
      habits: [...this.save.habits],
      upgrades: [...this.save.upgrades],
      talking: this.talk.isOpen,
      cards: [...this.save.cards],
      dive: this.dive ? { mission: this.dive.mission, explore: this.dive.explore, phase: this.flight.phase, scansLeft: this.flight.scansLeft, germs: this.flight.germs.length } : null,
      panel: pnl
        ? {
            kind: pnl.kind,
            id: pnl.q.id,
            tier: pnl.q.tier,
            ask: pnl.q.ask,
            answered: pnl.answered,
            hintRung: pnl.hintRung,
            right_: pnl.q.choices.findIndex((c) => c.correct),
            wrong: pnl.q.choices.filter((c) => !c.correct).map((c) => ({ value: c.value, misconception: c.misconception })),
          }
        : null,
    };
  }
}
