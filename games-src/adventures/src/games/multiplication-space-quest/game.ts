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
import { PAINT_IDS, PAINTS, paintBlipPortrait, paintStaticCoreIcon, paintFleetIcon, paintMapStar, paintSectorIcon, paintShieldIcon, paintShip, paintStardustIcon, paintUpgradeIcon } from './art';
import {
  BLIP,
  BLIP_HELLO,
  BOSS_BLIP,
  BOSS_INTRO,
  BOSS_READY,
  BOSS_TIP_KEYS,
  BOSS_TIP_TOUCH,
  BLIP_LINES,
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  CREW_INFO,
  DUST,
  FLIGHT_TIP_KEYS,
  FLIGHT_TIP_TOUCH,
  GROWNUPS,
  hintText,
  LANDING,
  LANDING_AFTER,
  LANDING_BLIP,
  LAUNCH,
  METEOR_INTRO,
  METEOR_SECONDS,
  mistakeLine,
  OPENING,
  PAINT_COST,
  praise,
  QUESTIONS_PER_FLIGHT,
  REMATCH_INTRO,
  SECTOR_INFO,
  STARS_PER_SECTOR,
  TOWED,
  UPGRADES,
  type UpgradeId,
} from './content';
import { FlightScene, type FlightEvent } from './flight';
import { LandingScene } from './landing';
import { BOSS_SONG, CLEAR_SONG, DECK_SONG, FLIGHT_SONG } from './music';
import { pix } from './pix';
import { bingoLine, bingoMistake, factKey, FREE, makeBingoCall, makeBingoCard, makeMeteor, makeProblem, SECTORS, type BingoCall, type BingoCard, type Misconception, type Problem, type Sector, type Tier } from './problems';
import { freshSave, store, type QuestSave } from './save';
import { CREW, DeckWorld, type CrewId, type Target } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_SECTOR = 12;
/** The four sectors of the route, in order. */
const ROUTE: Sector[] = SECTORS;

/** The crew of the Star Station (16-bit, in station jumpsuits with headsets). */
const LOOKS: Record<CrewId, Look16> = {
  ayo: { build: 'adult', skin: '#5a3825', hair: { style: 'short', color: '#2a1f1d' }, top: { color: '#3f4b9e', trim: '#f2c14c', kind: 'jumpsuit' }, legs: '#3f4b9e', shoes: '#2c3350', sole: '#c9d1de', belt: '#2c3350', badge: '#f2c14c', headset: '#2c3350' },
  mei: { build: 'adult', skin: '#e0b48c', hair: { style: 'short', color: '#1f1a1a' }, top: { color: '#ef8a3c', trim: '#e7ecf6', kind: 'jumpsuit' }, legs: '#ef8a3c', shoes: '#4a5266', sole: '#e7ecf6', belt: '#4a5266', badge: '#4fd6ff', headset: '#4a5266' },
  rafi: { build: 'adult', skin: '#b07a52', hair: { style: 'locs', color: '#3b2a24', tie: '#ffb547' }, top: { color: '#2e8f9c', trim: '#ffb547', kind: 'jumpsuit' }, legs: '#2e8f9c', shoes: '#4a5266', sole: '#c9d1de', belt: '#ffb547', badge: '#ffb547', headset: '#4a5266' },
  dot: { build: 'adult', skin: '#7a4a2e', hair: { style: 'puffs', color: '#2c2433', tie: '#ff5fa8' }, top: { color: '#8a6ad6', trim: '#ffcf6a', kind: 'jumpsuit' }, legs: '#8a6ad6', shoes: '#4a5266', sole: '#c9d1de', belt: '#4a5266', badge: '#ffcf6a', headset: '#4a5266' },
  sol: { build: 'adult', skin: '#f0c8a0', hair: { style: 'short', color: '#d9d9d9' }, top: { color: '#253a6e', trim: '#7ff0ff', kind: 'jumpsuit' }, legs: '#253a6e', shoes: '#2c3350', sole: '#c9d1de', belt: '#2c3350', badge: '#7ff0ff', headset: '#2c3350' },
};

const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };

type Mode = 'title' | 'deck' | 'busy' | 'flight' | 'result' | 'landing';

/** The Bingo Boss: Blip's card, what is marked, the call, and the keyboard target. */
interface Boss {
  card: BingoCard;
  marked: boolean[];
  call: BingoCall;
  calls: number;
  tries: number;
  rung: number;
  cursor: number;
  grid: HTMLElement;
  squares: HTMLButtonElement[];
  won: boolean;
}

interface Flight {
  /** A mission (8 questions in a sector), Meteor Run (60 seconds of quick facts) or the Bingo Boss. */
  kind: 'mission' | 'meteor' | 'boss';
  sector: Sector;
  q: number;
  problem: Problem;
  step: number;
  tries: number;
  hintRung: number;
  recorded: boolean;
  /** The current question is answered (waiting for the next one). */
  between: boolean;
  stars: number;
  rescued: number;
  dust: number;
  seed: number;
  hint: Modal | null;
  pause: Modal | null;
  ended: boolean;
  /** Meteor Run: seconds left and right answers. */
  timeLeft: number;
  score: number;
  boss: Boss | null;
}

export class Game {
  private readonly world: DeckWorld;
  private readonly flightScene: FlightScene;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: QuestSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private routeEl!: HTMLElement;
  private fleetEl!: HTMLElement;
  private dustEl!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<CrewId | 'blip', Speaker>;
  private flight: Flight | null = null;
  private fhud!: HTMLElement;
  private bannerFace!: HTMLImageElement;
  private bannerText!: HTMLElement;
  private bannerNote!: HTMLElement;
  private shieldEl!: HTMLElement;
  private fFleetEl!: HTMLElement;
  private dotsEl!: HTMLElement;
  private praiseCount = 0;
  private blipCount = 0;
  private landing: LandingScene | null = null;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-star');
    this.save = store.exists() ? store.load() : freshSave();
    this.world = new DeckWorld(host);
    this.flightScene = new FlightScene(host);
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: CrewId, voice: number): Speaker => ({
      name: CREW_INFO[id].name,
      role: CREW_INFO[id].role,
      voice,
      portrait: (e: Expression) => {
        const key = `${id}-${e}`;
        let u = cache.get(key);
        if (!u) cache.set(key, (u = paintPortrait16(LOOKS[id], MOOD[e]).toDataURL(2)));
        return u;
      },
    });
    this.speakers = {
      ayo: speaker('ayo', 150),
      mei: speaker('mei', 230),
      rafi: speaker('rafi', 170),
      dot: speaker('dot', 210),
      sol: speaker('sol', 130),
      blip: {
        name: BLIP.name,
        role: BLIP.role,
        voice: 340,
        portrait: (e: Expression) => {
          const key = `blip-${e === 'curious' ? 1 : 0}`;
          let u = cache.get(key);
          if (!u) cache.set(key, (u = paintBlipPortrait(e === 'curious').toDataURL(2)));
          return u;
        },
      },
    };
    audio.addSong('deck', DECK_SONG);
    audio.addSong('flight', FLIGHT_SONG);
    audio.addSong('clear', CLEAR_SONG);
    audio.addSong('boss', BOSS_SONG);
    this.world.onArrive = (t) => this.use(t);
    this.flightScene.onEvent = (e) => this.onFlightEvent(e);
    window.addEventListener('resize', () => {
      this.world.resize();
      this.landing?.resize();
      this.flightScene.resize();
      this.fitFlightTop();
    });
    this.world.stage.canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    this.input.onAction((a) => this.onAction(a));
    bus.on('settings:changed', () => {
      this.world.reducedMotion = settings.reducedMotion;
      this.flightScene.reducedMotion = settings.reducedMotion;
      if (this.landing) this.landing.reducedMotion = settings.reducedMotion;
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
      this.touch?.setVisible(this.mode === 'deck' && touchControlsVisible());
    });
    this.world.reducedMotion = settings.reducedMotion;
    this.flightScene.reducedMotion = settings.reducedMotion;
    this.buildHud();
    this.buildFlightHud();
    mountToasts(host);
    window.addEventListener('keydown', (e) => this.onFlightKey(e));
    (window as unknown as { __msq: unknown }).__msq = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      launch: (s: Sector) => this.mode === 'deck' && void this.launch(s),
      setTier: (s: Sector, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      fire: (i: number) => this.flightScene.fireAt(i),
      endFlight: () => this.flight && void this.endFlight(false),
      /** The next question is the last one (the Static core). */
      lastQuestion: () => this.flight && (this.flight.q = QUESTIONS_PER_FLIGHT - 2),
      bump: () => this.flight && this.onFlightEvent({ type: 'bump', shield: (this.flightScene.shield = Math.max(0, this.flightScene.shield - 1)) }),
      addDust: (n: number) => {
        this.save.dust += n;
        this.persist();
        this.renderHud();
      },
      teleport: (x: number, y: number) => {
        this.world.player.x = x;
        this.world.player.y = y;
        this.world.follow();
      },
      flightInfo: () => this.flightScene.debug(),
      /** Clear all four sectors (for testing the finale). */
      finishAll: () => {
        for (const x of SECTORS) if (!this.save.done.includes(x)) this.save.done.push(x);
        this.save.bossCalled = true;
        this.persist();
        this.updateMarkers();
        this.renderHud();
        this.world.setNight(0.5);
      },
      boss: () => this.mode === 'deck' && this.startFlight('formations', 'boss'),
      meteor: () => this.mode === 'deck' && this.startFlight('engines', 'meteor'),
      /** Beam the right Bingo square (with a click, like a player). */
      pickRight: () => {
        const b = this.flight?.boss;
        if (b) b.squares[b.card.values.indexOf(b.call.answer)].click();
      },
      setTime: (sec: number) => this.flight && (this.flight.timeLeft = sec),
    };
  }

  start(): void {
    const names = Object.fromEntries(CREW.map((id) => [id, CREW_INFO[id].name])) as Record<CrewId, string>;
    this.world.build(this.playerLook(), LOOKS, names, this.save.paint);
    this.updateMarkers();
    if (this.save.bossSeen) this.world.setNight(1);
    else if (this.save.bossCalled) this.world.setNight(0.5);
    this.world.establishing = true;
    this.world.follow();
    this.flightScene.resize();
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      const free = !document.querySelector('.modal-back') && !this.talk.isOpen;
      this.input.worldActive = (this.mode === 'deck' || (this.mode === 'flight' && !!this.flight && !this.flightScene.paused)) && free;
      if (this.mode === 'landing' && this.landing) {
        this.landing.update(dt);
        this.landing.render();
      } else if (this.mode === 'flight' || this.mode === 'result') {
        const f = this.flight;
        this.flightScene.paused = !!f?.hint || !!f?.pause || this.talk.isOpen || this.mode === 'result';
        this.flightScene.update(dt, f?.kind === 'boss' ? 0 : this.input.direction().x);
        this.flightScene.render();
        if (f && f.kind === 'meteor' && !f.ended && !f.between && !this.flightScene.paused && f.timeLeft < Infinity) {
          f.timeLeft = Math.max(0, f.timeLeft - dt);
          this.renderTimer();
          if (f.timeLeft <= 0) void this.endFlight(false);
        }
      } else {
        this.world.establishing = this.mode === 'title' || (!this.save.openingSeen && this.mode === 'busy');
        this.world.update(dt, this.mode === 'deck' ? this.input : null);
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

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Multiplication Space Quest',
      subtitle: 'Clear the Static, rescue the fleet',
      intro: ['Fly out from the Star Station, clear the gray Static and rescue a fleet of stranded supply ships. Count them in groups and rows, find the shortcuts, and beam the rock with the right answer.', 'For grades 3 to 5. Every line can be read aloud.'],
      hasSave: store.exists(),
      continueGame: () => {
        audio.unlock();
        this.enterDeck();
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your stars, your fleet and your upgrades in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.setPaint(this.save.paint);
      this.world.setNight(0);
      this.updateMarkers();
    }
    this.titleEl?.remove();
    this.titleEl = null;
    this.customize(true, () => this.enterDeck());
  }

  private enterDeck(): void {
    this.titleEl?.remove();
    this.titleEl = null;
    this.hud.hidden = false;
    this.mode = 'deck';
    audio.play('deck');
    this.renderHud();
    if (!this.save.openingSeen) void this.opening();
  }

  private async opening(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers.ayo, OPENING.slice(0, 3));
    this.world.cheer();
    await this.talk.say(this.speakers.blip, BLIP_HELLO, 'curious');
    await this.talk.say(this.speakers.ayo, OPENING.slice(3), 'smile');
    await this.talk.say(this.speakers.ayo, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'deck';
  }

  private get allDone(): boolean {
    return SECTORS.every((s) => this.save.done.includes(s));
  }

  private updateMarkers(): void {
    const open = (s: Sector) => (this.save.done.includes(s) ? null : 'new');
    // Ayo calls everyone to the Bingo Boss once all four sectors are clear
    this.world.setMarkers({ mei: open('formations'), rafi: open('engines'), dot: open('cargo'), sol: open('constellations'), ayo: this.allDone && !this.save.bossSeen ? 'turnin' : null });
  }

  // ------------------------------------------------------------ the deck

  private updatePrompt(): void {
    const t = this.mode === 'deck' ? this.world.nearest() : null;
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
    const s = this.world.screenOf(t, t.id === 'blip' ? 2.2 : t.id === 'ship' ? 2.6 : 2.9);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel(t.id === 'ship' ? 'Launch' : 'Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'flight') {
      const f = this.flight;
      if (a === 'interact' && f && !f.between && f.kind !== 'boss') this.flightScene.fireAbove();
      else if (a === 'hint' && f && !f.between && f.kind === 'mission') this.openHint();
      else if (a === 'hint' && f?.boss) this.bossHint();
      else if (a === 'menu' && this.flight && !this.flight.hint && !this.flight.pause) this.openPause();
      else if (a === 'mute') this.toggleMute();
      return;
    }
    if (a === 'interact' && this.mode === 'deck' && this.target) this.use(this.target);
    else if (a === 'mute') this.toggleMute();
    else if (a === 'menu' && this.mode === 'deck') this.openSettingsPanel();
    else if (a === 'grownups' && this.mode !== 'title') this.openGrownups();
    else if (a === 'journal' && this.mode === 'deck' && !document.querySelector('.modal-back') && !this.talk.isOpen) this.openMissions();
  }

  private onPointer(e: PointerEvent): void {
    if (this.mode !== 'deck' || this.talk.isOpen) return;
    audio.unlock();
    const rect = this.host.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    let best: Target | null = null;
    let bd = 64;
    for (const t of this.world.targets) {
      const s = this.world.screenOf(t, t.id === 'blip' ? 0.8 : 1.0);
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
    if (this.mode !== 'deck') return;
    this.world.stopWalking();
    if (t.id === 'blip') void this.helloBlip();
    else if (t.id === 'ship') void this.atShip();
    else void this.talkTo(t.id);
  }

  private async helloBlip(): Promise<void> {
    this.mode = 'busy';
    this.world.cheer();
    audio.fx(
      [
        [79, 0, 0.08],
        [86, 0.1, 0.12],
      ],
      'square',
      0.07,
    );
    await this.talk.say(this.speakers.blip, BLIP_LINES[this.blipCount++ % BLIP_LINES.length], 'curious');
    this.talk.end();
    this.mode = 'deck';
  }

  /** The next sector to fly (the first one not cleared yet). */
  private get nextSector(): Sector {
    return SECTORS.find((s) => !this.save.done.includes(s)) ?? SECTORS[0];
  }

  private async atShip(): Promise<void> {
    this.mode = 'busy';
    const labels = SECTORS.map((s) => `${SECTOR_INFO[s].name}${this.save.done.includes(s) ? ' (cleared)' : ''}`);
    const pick = await this.talk.offer(this.speakers.blip, 'Bleep! Where are we flying?', [...labels, 'Not now'], 'curious');
    this.talk.end();
    this.mode = 'deck';
    if (pick < SECTORS.length) void this.launch(SECTORS[pick]);
  }

  private async talkTo(id: CrewId): Promise<void> {
    this.mode = 'busy';
    const who = this.speakers[id];
    if (id === 'ayo') {
      if (this.allDone && !this.save.bossSeen) {
        await this.talk.say(who, BOSS_INTRO, 'proud');
        await this.talk.say(this.speakers.blip, BOSS_BLIP, 'curious');
        await this.talk.say(this.speakers.blip, isTouchDevice() ? BOSS_TIP_TOUCH : BOSS_TIP_KEYS, 'curious');
        this.talk.end();
        this.mode = 'deck';
        this.startFlight('formations', 'boss');
        return;
      }
      if (this.save.bossSeen) {
        const pick = await this.talk.offer(who, `The Static is gone, and your fleet has ${this.save.fleet} ships! ${this.save.bingoBest ? `Your best Bingo took ${this.save.bingoBest} calls.` : ''} Want a Bingo rematch with Blip?`, ['Bingo rematch!', 'Not now']);
        if (pick === 0) {
          await this.talk.say(this.speakers.blip, REMATCH_INTRO, 'curious');
          this.talk.end();
          this.mode = 'deck';
          this.startFlight('formations', 'boss');
          return;
        }
        this.talk.end();
        this.mode = 'deck';
        return;
      }
      const s = this.nextSector;
      await this.talk.say(who, `Your fleet has ${this.save.fleet} ships so far. Next: talk to ${CREW_INFO[SECTOR_INFO[s].chief].name} for the ${SECTOR_INFO[s].name} mission.`, 'smile');
      this.talk.end();
      this.mode = 'deck';
      return;
    }
    const sector: Sector = id === 'mei' ? 'formations' : id === 'rafi' ? 'engines' : id === 'dot' ? 'cargo' : 'constellations';
    const info = SECTOR_INFO[sector];
    if (id === 'rafi') {
      const meteor = this.save.done.includes('engines');
      const options = ['Fly the Engines mission', ...(meteor ? ['Meteor Run!'] : []), 'Upgrade bay', 'Change how I look', 'Not now'];
      const pick = options[await this.talk.offer(who, `Ready for the Engines mission? Or visit my upgrade bay: you have ${this.save.dust} stardust.${meteor ? ` Your best Meteor Run is ${this.save.best}.` : ''}`, options)];
      if (pick === 'Meteor Run!') {
        await this.talk.say(who, METEOR_INTRO);
        this.talk.end();
        this.mode = 'deck';
        this.startFlight('engines', 'meteor');
        return;
      }
      this.talk.end();
      this.mode = 'deck';
      if (pick === 'Fly the Engines mission') void this.launch('engines');
      else if (pick === 'Upgrade bay') this.openUpgrades();
      else if (pick === 'Change how I look') this.customize(false, () => undefined);
      return;
    }
    const options = ['Launch!', ...(id === 'sol' ? ['Show me the Star Map'] : []), 'Not now'];
    const pick = options[await this.talk.offer(who, this.save.introduced.includes(sector) ? info.again : `${info.intro[0]} Ready for the ${info.name} mission?`, options)];
    this.talk.end();
    this.mode = 'deck';
    if (pick === 'Launch!') void this.launch(sector);
    else if (pick === 'Show me the Star Map') this.openStarMap();
  }

  // ------------------------------------------------------------ a flight

  private async launch(sector: Sector): Promise<void> {
    if (this.mode !== 'deck') return;
    this.mode = 'busy';
    const info = SECTOR_INFO[sector];
    const who = this.speakers[info.chief];
    if (!this.save.introduced.includes(sector)) {
      await this.talk.say(who, info.intro);
      this.save.introduced.push(sector);
      this.persist();
    }
    if (!this.save.flightTipSeen) {
      await this.talk.say(who, isTouchDevice() ? FLIGHT_TIP_TOUCH : FLIGHT_TIP_KEYS);
      this.save.flightTipSeen = true;
      this.persist();
    } else await this.talk.say(who, LAUNCH);
    this.talk.end();
    this.startFlight(sector);
  }

  private startFlight(sector: Sector, kind: Flight['kind'] = 'mission'): void {
    this.mode = 'flight';
    this.hud.hidden = true;
    this.touch?.setVisible(false);
    this.world.stage.canvas.hidden = true;
    this.flightScene.setVisible(true);
    this.flightScene.resize();
    this.fhud.hidden = false;
    document.body.classList.add('msq-flying');
    this.fitFlightTop();
    audio.play(kind === 'boss' ? 'boss' : 'flight');
    const up = this.save.upgrades;
    this.flightScene.start(
      { paint: this.save.paint, twin: up.includes('twin'), rapid: up.includes('rapid'), thrusters: up.includes('thrusters'), shieldMax: 3 + (up.includes('shield1') ? 1 : 0) + (up.includes('shield2') ? 1 : 0), wingmen: Math.min(6, Math.floor(this.save.fleet / 10)) },
      this.save.seed,
    );
    this.flightScene.intensity = kind === 'boss' ? 0.5 : kind === 'meteor' ? 1.1 : 0.8 + 0.15 * (skill(this.save.learner, sector).tier - 1);
    const who = kind === 'boss' ? this.speakers.blip : this.speakers[SECTOR_INFO[sector].chief];
    this.bannerFace.src = who.portrait('smile');
    this.bannerFace.alt = who.name;
    this.fhud.dataset.kind = kind;
    this.flight = { kind, sector, q: 0, problem: null as unknown as Problem, step: 0, tries: 0, hintRung: 0, recorded: false, between: true, stars: 0, rescued: 0, dust: 0, seed: this.save.seed, hint: null, pause: null, ended: false, timeLeft: kind === 'meteor' ? METEOR_SECONDS : Infinity, score: 0, boss: null };
    this.renderFlightHud();
    if (kind === 'boss') setTimeout(() => this.startBoss(), 700);
    else setTimeout(() => this.nextQuestion(), kind === 'meteor' ? 600 : 900);
  }

  /** Keep the stranded ships below the banner. */
  private fitFlightTop(): void {
    const banner = this.fhud.querySelector('.msq-status') as HTMLElement | null;
    const bottom = banner ? banner.getBoundingClientRect().bottom - this.host.getBoundingClientRect().top : 80;
    this.flightScene.topReserve = Math.ceil(((bottom + 8) * (window.devicePixelRatio || 1)) / this.flightScene.scale);
  }

  private nextQuestion(): void {
    const f = this.flight;
    if (!f || f.ended) return;
    const tier = skill(this.save.learner, f.sector).tier as Tier;
    const seed = this.save.seed++;
    f.seed = seed;
    f.problem = f.kind === 'meteor' ? makeMeteor(this.save.starMap, mulberry32(seed)) : makeProblem(f.sector, tier, mulberry32(seed));
    f.step = 0;
    f.tries = 0;
    f.hintRung = 0;
    f.recorded = false;
    f.between = false;
    this.persist();
    this.flightScene.showPicture(f.problem.picture);
    this.flightScene.showRocks(f.problem.steps[0].choices, f.kind === 'mission' && f.q === QUESTIONS_PER_FLIGHT - 1);
    this.flightScene.clearness = f.kind === 'meteor' ? 0.5 : f.q / QUESTIONS_PER_FLIGHT;
    this.setBanner(f.problem.steps[0].ask);
    this.renderFlightHud();
  }

  private setBanner(text: string, note = '', kind: '' | 'good' | 'try' | 'hint' = ''): void {
    this.bannerText.textContent = text;
    this.bannerNote.textContent = note;
    this.bannerNote.hidden = !note;
    this.bannerNote.className = `msq-note ${kind}`;
    this.fitFlightTop();
    speak(note || text);
  }

  private onFlightEvent(e: FlightEvent): void {
    const f = this.flight;
    if (!f || f.ended) return;
    if (e.type === 'pebble') {
      f.dust += DUST.pebble;
      this.renderFlightHud();
    } else if (e.type === 'bump') {
      audio.fx(
        [
          [45, 0, 0.12],
          [40, 0.08, 0.16],
        ],
        'sawtooth',
        0.06,
      );
      this.renderFlightHud();
      if (e.shield <= 0) void this.endFlight(true);
    } else if (e.type === 'empty') {
      if (!f.between) this.bannerNote.textContent || toast(isTouchDevice() ? 'Tap a rock to beam it.' : 'Fly under a rock first, or press 1, 2 or 3.', 'hint');
    } else if (e.type === 'hit') this.onHit(e.index);
  }

  private onHit(index: number): void {
    const f = this.flight;
    if (!f || f.between) return;
    const p = f.problem;
    const step = p.steps[f.step];
    const c = step.choices[index];
    if (!c) return;
    if (f.kind === 'meteor') {
      f.between = true;
      if (c.correct) {
        f.score++;
        audio.correct();
        this.flightScene.win(index);
        this.setBanner(step.ask, `${praise(this.praiseCount++)} ${f.score} so far.`, 'good');
      } else {
        audio.retry();
        this.flightScene.miss(index);
        this.flightScene.outline(step.choices.findIndex((x) => x.correct));
        this.setBanner(step.ask, step.explain, 'try');
      }
      this.renderFlightHud();
      setTimeout(() => this.flight === f && !f.ended && this.nextQuestion(), c.correct ? 500 : 1300);
      return;
    }
    if (c.correct) {
      if (f.step < p.steps.length - 1) {
        // the first step is done: the next rocks fly in for step two
        audio.correct();
        this.flightScene.win(index, true);
        f.step++;
        f.between = true;
        this.setBanner(p.steps[f.step].ask, `${praise(this.praiseCount++)} ${step.explain}`, 'good');
        setTimeout(() => {
          if (!this.flight || this.flight !== f || f.ended) return;
          f.between = false;
          this.flightScene.showRocks(p.steps[f.step].choices, f.q === QUESTIONS_PER_FLIGHT - 1);
        }, 1400);
        return;
      }
      this.solved(index);
      return;
    }
    f.tries++;
    if (!f.recorded) {
      f.recorded = true;
      const o = recordAnswer(this.save.learner, f.sector, { correct: false, hintRung: f.hintRung, misconception: (c.misconception as Misconception) ?? null }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let us practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.flightScene.miss(index);
    this.setBanner(step.ask, mistakeLine(p, f.step, (c.misconception as Misconception) ?? 'other'), 'try');
    if (f.tries >= 2) setTimeout(() => this.flight === f && !f.between && this.openHint(Math.min(3, f.tries)), 900);
  }

  /** The last step of a question is right. */
  private solved(index: number): void {
    const f = this.flight!;
    const p = f.problem;
    f.between = true;
    const clean = f.tries === 0 && f.hintRung <= 1;
    let tierChange = 0;
    if (!f.recorded) {
      f.recorded = true;
      tierChange = recordAnswer(this.save.learner, f.sector, { correct: true, hintRung: f.hintRung }, RULES).tierChange;
    }
    this.save.played[f.sector]++;
    if (clean) {
      if (this.save.stars[f.sector] < STARS_PER_SECTOR) this.save.stars[f.sector]++;
      f.stars++;
      for (const k of p.facts) if (!this.save.starMap.includes(k)) this.save.starMap.push(k);
    }
    // formations rescue the ships in the picture; the other sectors free 2 ships a question
    const ships = p.picture && p.picture.kind !== 'crates' ? p.answer : 2;
    f.rescued += ships;
    this.save.fleet += ships;
    f.dust += clean ? DUST.clean : DUST.right;
    this.persist();
    if (clean) audio.itemGet();
    else audio.correct();
    this.flightScene.win(index);
    const last = p.steps[p.steps.length - 1];
    this.setBanner(last.ask, `${praise(this.praiseCount++)} ${clean ? 'You win a star.' : 'Stars are for getting it right the first time.'} ${last.explain}`, 'good');
    if (tierChange > 0) toast('Level up! Trickier questions.', 'reward');
    this.renderFlightHud();
    f.q++;
    setTimeout(() => {
      if (this.flight !== f || f.ended) return;
      if (f.q >= QUESTIONS_PER_FLIGHT) void this.endFlight(false);
      else this.nextQuestion();
    }, 2600);
  }

  private openHint(rung?: number): void {
    const f = this.flight;
    if (!f || f.between || f.ended) return;
    const next = Math.min(3, rung ?? f.hintRung + 1);
    if (next <= f.hintRung && rung === undefined && f.hint) return;
    f.hintRung = Math.max(f.hintRung, next);
    audio.hint();
    const p = f.problem;
    const k = f.hintRung;
    if (k >= 2 && p.picture) this.flightScene.tintPicture();
    if (k >= 3) this.flightScene.outline(p.steps[f.step].choices.findIndex((c) => c.correct));
    const text = `Hint ${k} of 3: ${hintText(p, f.step, k)}`;
    f.hint?.close();
    const more = h('button', { class: 'btn', type: 'button', hidden: k >= 3 }, iconImg('bulb', '', 20), h('span', { text: 'Next hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    const back = h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, text: isTouchDevice() ? 'Back to flying' : 'Back to flying (Space)' });
    const model = k >= 2 ? this.modelFor(p) : null;
    const root = h(
      'div',
      { class: 'panel modal msq-hint', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'msq-hint-title' },
      h('header', {}, h('h2', { id: 'msq-hint-title', text: 'Flight paused: a hint' })),
      h('div', { class: 'msq-hint-body' }, h('img', { class: 'msq-hint-face', src: this.bannerFace.src, alt: '', width: 56, height: 56 }), h('p', { class: 'msq-hint-text', text })),
      ...(model ? [model] : []),
      h('footer', {}, more, back),
    );
    const modal = new Modal(this.host, root, () => {
      if (this.flight && this.flight.hint === modal) this.flight.hint = null;
    }, { closeOnBackdrop: true });
    f.hint = modal;
    speak(text);
    more.addEventListener('click', () => this.openHint());
    back.addEventListener('click', () => modal.close());
    root.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        e.stopPropagation();
        if (f.hintRung < 3) this.openHint();
      }
    });
  }

  /** Rung 2's picture: dots in groups or rows, colored to show the shortcut or the split. */
  private modelFor(p: Problem): HTMLElement | null {
    const grid = (rows: number, cols: number, color: (r: number, c: number) => string, label: string) => {
      const g = h('div', { class: 'msq-dots', role: 'img', 'aria-label': label, style: `grid-template-columns:repeat(${cols},1fr)` });
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) g.append(h('span', { class: `msq-dot ${color(r, c)}` }));
      return g;
    };
    const { a, b } = p;
    if (p.kind === 'groups-count' || p.kind === 'groups-sentence') {
      const wrap = h('div', { class: 'msq-groups', role: 'img', 'aria-label': `${a} groups of ${b} dots` });
      for (let g = 0; g < a; g++) wrap.append(grid(1, b, () => `c${g % 5}`, ''));
      return wrap;
    }
    if (p.kind === 'array-count' || p.kind === 'array-turn') return grid(a, b, (r) => (r % 2 ? 'c1' : 'c0'), `${a} rows of ${b} dots, every other row colored`);
    if (p.kind === 'split') return grid(a, b, (_, c) => (c < 5 ? 'c0' : 'c2'), `${a} rows of ${b} dots: 5 columns in one color and ${b - 5} in another`);
    if (p.kind === 'shortcut') {
      const t = [4, 9, 3].find((x) => x === a || x === b)!;
      const n = a === t ? b : a;
      if (t === 9) return grid(10, n, (r) => (r === 9 ? 'gone' : 'c0'), `10 rows of ${n} dots with the last row crossed out`);
      return grid(t, n, (r) => (t === 4 ? (r < 2 ? 'c0' : 'c1') : r < 2 ? 'c0' : 'c2'), t === 4 ? `4 rows of ${n} dots: two rows, and two rows again` : `3 rows of ${n} dots: a double and one more row`);
    }
    if (p.kind === 'break-apart') return grid(a, b, (r) => (r < 5 ? 'c0' : 'c2'), `${a} rows of ${b} dots: 5 rows in one color and ${a - 5} in another`);
    if (p.sector === 'cargo') {
      // every crate as a dot, in rows of the group size: the full rows are the groups, the last row the leftovers
      const rows = Math.ceil(a / b);
      return grid(rows, b, (r, c) => (r * b + c >= a ? 'gone' : r * b + c >= Math.floor(a / b) * b ? 'c2' : r % 2 ? 'c1' : 'c0'), `${a} dots in rows of ${b}${a % b ? `, with ${a % b} in the last row` : ''}`);
    }
    if (p.kind === 'family-missing' || p.kind === 'odd-fact') return grid(a, b, (r) => (r % 2 ? 'c1' : 'c0'), `${a} rows of ${b} dots: ${a * b} in all`);
    if (p.kind === 'basic') {
      const t = [0, 1, 2, 5, 10].find((x) => x === a || x === b) ?? b;
      const n = a === t ? b : a;
      if (t === 0) return h('p', { class: 'msq-model-note', text: 'No groups, or empty groups: nothing to count.' });
      if (t === 5) return grid(10, n, (r) => (r < 5 ? 'c0' : 'gone'), `10 rows of ${n} dots with half of them crossed out`);
      return grid(Math.min(t, 10), n, (r) => (r % 2 ? 'c1' : 'c0'), `${t} rows of ${n} dots`);
    }
    return null;
  }

  private openPause(): void {
    const f = this.flight;
    if (!f) return;
    const resume = h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, text: 'Keep flying' });
    const home = h('button', { class: 'btn', type: 'button', text: 'Fly home (keep what I earned)' });
    const root = h('div', { class: 'panel modal msq-pause', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'msq-pause-title' }, h('header', {}, h('h2', { id: 'msq-pause-title', text: 'Paused' })), h('div', { class: 'content' }, h('p', { text: f.kind === 'meteor' ? `Meteor Run: ${f.score} right so far. The clock is stopped.` : f.kind === 'boss' ? 'The Bingo Boss is waiting. Flying home ends this game; you can try again any time.' : `Question ${Math.min(QUESTIONS_PER_FLIGHT, f.q + 1)} of ${QUESTIONS_PER_FLIGHT}. Stars this flight: ${f.stars}.` }), h('div', { class: 'msq-pause-buttons' }, resume, home)));
    const modal = new Modal(this.host, root, () => {
      if (this.flight && this.flight.pause === modal) this.flight.pause = null;
    });
    f.pause = modal;
    resume.addEventListener('click', () => modal.close());
    home.addEventListener('click', () => {
      modal.close();
      void this.endFlight(false, true);
    });
  }

  private onFlightKey(e: KeyboardEvent): void {
    const f = this.flight;
    if (this.mode !== 'flight' || !f || e.repeat) return;
    if (f.hint && stackTop() === f.hint && (e.key === ' ' || e.key === 'Enter') && !(e.target instanceof HTMLButtonElement)) {
      e.preventDefault();
      f.hint.close();
      return;
    }
    if (document.querySelector('.modal-back') || this.talk.isOpen) return;
    if (f.boss) {
      // the Bingo shield: arrows move the target, Space or Enter beams it
      const k = e.key;
      const moves: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1] };
      if (moves[k]) {
        e.preventDefault();
        this.moveCursor(...moves[k]);
      } else if ((k === ' ' || k === 'Enter') && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        this.pickSquare(f.boss.cursor);
      }
      return;
    }
    if (/^[1-3]$/.test(e.key) && !f.between) {
      e.preventDefault();
      this.flightScene.fireAt(Number(e.key) - 1);
    }
  }

  private async endFlight(towed: boolean, early = false): Promise<void> {
    const f = this.flight;
    if (!f || f.ended) return;
    f.ended = true;
    f.hint?.close();
    f.pause?.close();
    this.mode = 'result';
    if (f.kind === 'meteor') {
      // Meteor Run: the score and the best, then home (no stars: it is practice for speed)
      this.flightScene.clearRocks();
      this.bannerText.textContent = towed ? '' : 'Time!';
      this.bannerNote.hidden = true;
      const isBest = f.score > this.save.best;
      if (isBest) this.save.best = f.score;
      this.save.dust += f.dust;
      this.persist();
      if (isBest && f.score > 0) audio.levelUp();
      else audio.correct();
      await this.talk.say(this.speakers.rafi, towed ? TOWED : `Time! ${f.score} right ${f.score === 1 ? 'answer' : 'answers'} in ${METEOR_SECONDS} seconds.${isBest && f.score > 0 ? ' That is your new best!' : ` Your best is ${this.save.best}.`}`, 'proud');
      this.talk.end();
      this.leaveFlight();
      return;
    }
    if (f.kind === 'boss') {
      // towed home or flown home before a Bingo: Ayo is still waiting
      this.persist();
      await this.talk.say(this.speakers.ayo, towed ? TOWED : 'Back to the deck. The Bingo Boss will wait for you: talk to me when you are ready.', 'thinking');
      this.talk.end();
      this.leaveFlight();
      return;
    }
    this.save.dust += f.dust + (towed || early ? 0 : DUST.flight);
    this.save.flights++;
    this.persist();
    const s = f.sector;
    const rec = skill(this.save.learner, s);
    const cleared = !this.save.done.includes(s) && this.save.stars[s] >= STARS_PER_SECTOR && (rec.tier >= 2 || this.save.played[s] >= MAX_PER_SECTOR);
    const who = this.speakers[SECTOR_INFO[s].chief];
    if (towed) await this.talk.say(who, TOWED, 'thinking');
    else if (!early) {
      audio.levelUp();
      await this.talk.say(who, `Flight complete! ${f.stars} ${f.stars === 1 ? 'star' : 'stars'}, ${f.rescued} ships rescued and ${f.dust + DUST.flight} stardust. Heading home!`, 'proud');
    }
    this.talk.end();
    this.leaveFlight();
    if (cleared) await this.finishSector(s);
  }

  /** Back to the station deck from any flight. */
  private leaveFlight(): void {
    this.flight?.boss?.grid.remove();
    this.flightScene.stop();
    this.flightScene.setVisible(false);
    this.fhud.hidden = true;
    document.body.classList.remove('msq-flying');
    this.world.stage.canvas.hidden = false;
    this.flight = null;
    this.mode = 'deck';
    this.hud.hidden = false;
    audio.play('deck');
    this.renderHud();
    this.world.resize();
  }

  // ------------------------------------------------------------ the Bingo Boss (the finale)

  private bossTier(): Tier {
    const t = SECTORS.reduce((sum, x) => sum + skill(this.save.learner, x).tier, 0) / SECTORS.length;
    return Math.max(1, Math.min(3, Math.round(t))) as Tier;
  }

  private startBoss(): void {
    const f = this.flight;
    if (!f || f.ended) return;
    const r = mulberry32(this.save.seed++);
    const card = makeBingoCard(this.bossTier(), r);
    const marked = card.values.map((_, i) => i === FREE);
    const squares: HTMLButtonElement[] = [];
    const grid = h('div', { class: 'msq-bingo', role: 'grid', 'aria-label': 'The Bingo shield' });
    card.values.forEach((v, i) => {
      const b = h('button', { class: `msq-square${i === FREE ? ' free on' : ''}`, type: 'button', 'data-index': String(i), 'aria-label': i === FREE ? 'Free space' : `Square ${v}`, disabled: i === FREE }, h('span', { text: i === FREE ? 'FREE' : String(v) }));
      b.addEventListener('click', () => this.pickSquare(i));
      squares.push(b);
      grid.append(b);
    });
    this.fhud.append(grid);
    f.boss = { card, marked, call: makeBingoCall(card, marked, r), calls: 0, tries: 0, rung: 0, cursor: 6, grid, squares, won: false };
    f.between = false;
    // the Static core sits behind the shield
    requestAnimationFrame(() => {
      const box = grid.getBoundingClientRect();
      const host = this.host.getBoundingClientRect();
      this.flightScene.showCore(this.flightScene.fromCss(box.left - host.left + box.width / 2, box.top - host.top + box.height / 2));
    });
    this.renderBoss();
    this.callOut();
  }

  private callOut(): void {
    const b = this.flight?.boss;
    if (!b) return;
    b.tries = 0;
    b.rung = 0;
    b.squares.forEach((q) => q.classList.remove('worked'));
    this.setBanner(`Blip calls: ${b.call.text}`);
  }

  private renderBoss(): void {
    const b = this.flight?.boss;
    if (!b) return;
    b.squares.forEach((q, i) => {
      q.classList.toggle('on', b.marked[i]);
      q.classList.toggle('cursor', i === b.cursor && !isTouchDevice());
    });
    this.renderFlightHud();
  }

  private pickSquare(i: number): void {
    const f = this.flight;
    const b = f?.boss;
    if (!f || !b || f.between || f.ended || b.won || b.marked[i] || this.flightScene.paused) return;
    b.cursor = i;
    const sq = b.squares[i];
    const box = sq.getBoundingClientRect();
    const host = this.host.getBoundingClientRect();
    const at = this.flightScene.fromCss(box.left - host.left + box.width / 2, box.top - host.top + box.height);
    this.flightScene.zap(at.x, at.y);
    const v = b.card.values[i];
    const c = b.call;
    if (v === c.answer) {
      const clean = b.tries === 0 && b.rung <= 1;
      b.marked[i] = true;
      b.calls++;
      if (clean && c.kind === 'times') {
        const k = factKey(c.a, c.b);
        if (k && !this.save.starMap.includes(k)) this.save.starMap.push(k);
      }
      audio.correct();
      sq.classList.add('hit');
      const line = bingoLine(b.marked);
      this.renderBoss();
      if (line) {
        b.won = true;
        f.between = true;
        line.forEach((k) => b.squares[k].classList.add('line'));
        this.setBanner('BINGO!', `Five in a row! The shield breaks. ${b.calls} calls.`, 'good');
        audio.levelUp();
        setTimeout(() => {
          this.flightScene.breakCore();
          b.grid.classList.add('broken');
        }, 700);
        setTimeout(() => void this.bossWon(), 2400);
        return;
      }
      f.between = true;
      this.setBanner(`Blip calls: ${c.text}`, `${praise(this.praiseCount++)} ${c.answer} is right.`, 'good');
      setTimeout(() => {
        if (this.flight !== f || f.ended) return;
        b.call = makeBingoCall(b.card, b.marked, mulberry32(this.save.seed++));
        f.between = false;
        this.callOut();
      }, 1200);
      return;
    }
    b.tries++;
    audio.retry();
    sq.classList.remove('shake');
    void sq.offsetWidth;
    sq.classList.add('shake');
    this.setBanner(`Blip calls: ${c.text}`, this.bingoLine(c, v), 'try');
    if (b.tries >= 2) this.bossHint(3);
  }

  /** One sentence about a wrong Bingo square. */
  private bingoLine(c: BingoCall, picked: number): string {
    const mis = bingoMistake(c, picked);
    if (mis === 'added') return `That adds ${c.a} and ${c.b}. Times means ${c.a} groups of ${c.b}.`;
    if (mis === 'one-group-off') return c.kind === 'times' ? 'So close! That is one group too many or too few.' : 'So close! Check it: multiply your answer back.';
    if (mis === 'nines-flipped') return 'The digits are flipped! Look again.';
    if (mis === 'subtracted') return `That takes ${c.b} away from ${c.a}. How many ${c.b}s make ${c.a}?`;
    if (mis === 'swapped') return `That is the number you divide by. How many ${c.b}s make ${c.a}?`;
    return c.kind === 'times' ? `Not that one. What is ${c.a} groups of ${c.b}?` : `Not that one. What times ${c.b} makes ${c.a}?`;
  }

  /** H in the Bingo Boss: a nudge, then a counting tip, then the square outlined. */
  private bossHint(rung?: number): void {
    const b = this.flight?.boss;
    if (!b || this.flight?.between) return;
    b.rung = Math.min(3, rung ?? b.rung + 1);
    audio.hint();
    const c = b.call;
    const text =
      b.rung === 1
        ? c.kind === 'times'
          ? `Hint 1 of 3: ${c.a} groups of ${c.b}. Is there a shortcut you know?`
          : `Hint 1 of 3: what times ${c.b} makes ${c.a}?`
        : b.rung === 2
          ? c.kind === 'times'
            ? `Hint 2 of 3: count by ${c.b}s, ${c.a} times: ${c.b}, ${c.b * 2}, …`
            : `Hint 2 of 3: count by ${c.b}s up to ${c.a} and count the jumps: ${c.b}, ${c.b * 2}, …`
          : `Hint 3 of 3: the square is outlined. ${c.kind === 'times' ? `${c.a} × ${c.b} = ${c.answer}` : `${c.answer} × ${c.b} = ${c.a}`}.`;
    if (b.rung >= 3) b.squares[b.card.values.indexOf(c.answer)].classList.add('worked');
    this.setBanner(`Blip calls: ${c.text}`, text, 'hint');
  }

  private moveCursor(dx: number, dy: number): void {
    const b = this.flight?.boss;
    if (!b) return;
    const x = Math.max(0, Math.min(4, (b.cursor % 5) + dx));
    const y = Math.max(0, Math.min(4, Math.floor(b.cursor / 5) + dy));
    b.cursor = y * 5 + x;
    this.renderBoss();
    const box = b.squares[b.cursor].getBoundingClientRect();
    const host = this.host.getBoundingClientRect();
    this.flightScene.steer(this.flightScene.fromCss(box.left - host.left + box.width / 2, 0).x);
  }

  private async bossWon(): Promise<void> {
    const f = this.flight;
    const b = f?.boss;
    if (!f || !b) return;
    f.ended = true;
    const first = !this.save.bossSeen;
    if (!this.save.bingoBest || b.calls < this.save.bingoBest) this.save.bingoBest = b.calls;
    this.save.bossSeen = true;
    this.save.fleet += 10;
    this.persist();
    this.leaveFlight();
    this.updateMarkers();
    this.world.setNight(1);
    if (first) await this.landingScene();
    else {
      this.mode = 'busy';
      await this.talk.say(this.speakers.blip, `Bingo in ${b.calls} calls! ${b.calls <= this.save.bingoBest ? 'That is your best!' : `Your best is ${this.save.bingoBest}.`} Bleep!`, 'curious');
      this.talk.end();
      this.mode = 'deck';
    }
  }

  /** The finale: the fleet lands on the planet for the night-shift party, then back to the deck. */
  private async landingScene(): Promise<void> {
    this.mode = 'landing';
    this.hud.hidden = true;
    this.touch?.setVisible(false);
    if (!this.landing) {
      this.landing = new LandingScene(this.host);
      this.landing.reducedMotion = settings.reducedMotion;
      this.landing.build(this.playerLook(), LOOKS, this.save.paint, this.save.fleet);
    }
    this.world.stage.canvas.hidden = true;
    this.landing.setVisible(true);
    this.landing.resize();
    audio.play('clear');
    audio.levelUp();
    await this.talk.say(this.speakers.ayo, LANDING, 'proud');
    await this.talk.say(this.speakers.blip, LANDING_BLIP, 'curious');
    await this.talk.say(this.speakers.ayo, LANDING_AFTER, 'smile');
    this.talk.end();
    toast('The Static is gone! The whole fleet is home.', 'reward');
    window.parent?.postMessage({ type: 'game-complete', score: this.save.fleet }, '*');
    this.landing.setVisible(false);
    this.world.stage.canvas.hidden = false;
    this.world.resize();
    this.hud.hidden = false;
    this.mode = 'deck';
    audio.play('deck');
    this.renderHud();
  }

  private async finishSector(s: Sector): Promise<void> {
    this.mode = 'busy';
    const info = SECTOR_INFO[s];
    const who = this.speakers[info.chief];
    audio.play('clear');
    await this.talk.say(who, 'Five stars in this sector! Before the next mission, one question.', 'proud');
    const res = await this.talk.ask(who, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${s}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(s);
    this.persist();
    this.updateMarkers();
    audio.levelUp();
    toast(`Sector cleared! ${this.save.done.length} of 4`, 'reward');
    await this.talk.say(who, info.done, 'proud');
    const left = SECTORS.filter((x) => !this.save.done.includes(x));
    if (left.length) await this.talk.say(this.speakers.ayo, `Brilliant flying! Next: ${CREW_INFO[SECTOR_INFO[left[0]].chief].name} has the ${SECTOR_INFO[left[0]].name} mission for you.`, 'proud');
    else if (!this.save.bossCalled) {
      // all four sectors: the night shift starts and Ayo calls the Bingo Boss
      this.world.setNight(0.5);
      await this.talk.say(this.speakers.ayo, BOSS_READY, 'proud');
      this.save.bossCalled = true;
      this.persist();
      this.updateMarkers();
    }
    this.talk.end();
    audio.play('deck');
    this.renderHud();
    this.mode = 'deck';
  }

  // ------------------------------------------------------------ Rafi's upgrade bay, Sol's Star Map, the mission list

  private openUpgrades(): void {
    const dustLine = h('p', { class: 'msq-dustline' });
    const list = h('ul', { class: 'belt-list' });
    const paints = h('div', { class: 'msq-paints' });
    const render = () => {
      dustLine.replaceChildren(pix('dust', () => paintStardustIcon(), 2), h('span', { text: `You have ${this.save.dust} stardust. Pebbles give 1, answers give 2 to 5, a whole flight gives 10.` }));
      list.replaceChildren(
        ...UPGRADES.map((u) => {
          const have = this.save.upgrades.includes(u.id);
          const locked = !!u.needs && !this.save.upgrades.includes(u.needs);
          const can = !have && !locked && this.save.dust >= u.cost;
          return h(
            'li',
            { class: 'belt-row' },
            pix(`up-${u.icon}`, () => paintUpgradeIcon(u.icon), 2),
            h('div', { class: 'belt-info' }, h('strong', { text: `${u.name} (${u.cost} stardust)` }), h('span', { text: locked ? 'Buy Shield +1 first.' : u.text })),
            have ? h('span', { class: 'msq-owned', text: 'Fitted' }) : h('button', { class: 'btn small', type: 'button', disabled: !can, text: 'Buy', onclick: () => this.buy(u.id, u.cost, render) }),
          );
        }),
      );
      paints.replaceChildren(
        ...PAINT_IDS.map((id) => {
          const owned = this.save.paints.includes(id);
          const on = this.save.paint === id;
          const b = h(
            'button',
            { class: `btn msq-paint${on ? ' on' : ''}`, type: 'button', 'aria-pressed': on ? 'true' : 'false', disabled: !owned && this.save.dust < PAINT_COST, 'aria-label': `${PAINTS[id].name}${owned ? '' : `, ${PAINT_COST} stardust`}` },
            pix(`ship-icon-${id}`, () => paintShip(id, 0), 2),
            h('span', { text: owned ? PAINTS[id].name : `${PAINT_COST} stardust` }),
          );
          b.addEventListener('click', () => {
            if (!owned) {
              if (this.save.dust < PAINT_COST) return;
              this.save.dust -= PAINT_COST;
              this.save.paints.push(id);
              audio.itemGet();
            }
            this.save.paint = id;
            this.world.setPaint(id);
            this.persist();
            this.renderHud();
            render();
          });
          return b;
        }),
      );
    };
    render();
    const root = h(
      'div',
      { class: 'panel modal msq-bay', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'bay-title' },
      h('header', {}, h('h2', { id: 'bay-title', text: 'Rafi’s upgrade bay' }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, dustLine, list, h('h3', { text: 'Paint your ship' }), paints, h('p', { class: 'small-note', text: 'Upgrades make flying more fun. The math stays the same!' })),
    );
    const modal = new Modal(this.host, root);
  }

  private buy(id: UpgradeId, cost: number, render: () => void): void {
    if (this.save.dust < cost || this.save.upgrades.includes(id)) return;
    this.save.dust -= cost;
    this.save.upgrades.push(id);
    this.persist();
    audio.levelUp();
    toast('Upgrade fitted!', 'reward');
    this.renderHud();
    render();
  }

  private openStarMap(): void {
    const grid = h('div', { class: 'msq-map', role: 'grid', 'aria-label': 'The Star Map: times facts from 1 × 1 to 10 × 10' });
    grid.append(h('span', { class: 'msq-map-head', text: '×' }));
    for (let c = 1; c <= 10; c++) grid.append(h('span', { class: 'msq-map-head', text: String(c) }));
    for (let r = 1; r <= 10; r++) {
      grid.append(h('span', { class: 'msq-map-head', text: String(r) }));
      for (let c = 1; c <= 10; c++) {
        const lit = this.save.starMap.includes(factKey(r, c)!);
        grid.append(h('span', { class: `msq-map-cell${lit ? ' lit' : ''}`, role: 'gridcell', 'aria-label': `${r} × ${c} = ${r * c}${lit ? ', lit' : ''}`, title: `${r} × ${c} = ${r * c}` }, pix(`map-${lit}`, () => paintMapStar(lit), 2)));
      }
    }
    const lit = this.save.starMap.length;
    const root = h(
      'div',
      { class: 'panel modal msq-starmap', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'map-title' },
      h('header', {}, h('h2', { id: 'map-title', text: 'The Star Map' }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', text: `${lit} of 55 facts lit. A star lights up when you answer its fact right the first time. 3 × 7 and 7 × 3 are the same fact, so they light up together.` }), grid),
    );
    const modal = new Modal(this.host, root);
  }

  private openMissions(): void {
    if (this.mode !== 'deck') return;
    const launchBtn = (label: string, go: () => void) =>
      h('button', {
        class: 'btn small',
        type: 'button',
        text: label,
        onclick: () => {
          modal.close();
          go();
        },
      });
    const rows = ROUTE.map((s) => {
      const sec = SECTOR_INFO[s];
      const n = this.save.stars[s];
      const done = this.save.done.includes(s);
      return h(
        'li',
        { class: 'belt-row' },
        pix(`sector-${s}-true`, () => paintSectorIcon(s, true), 2),
        h(
          'div',
          { class: 'belt-info' },
          h('strong', { text: `${sec.name}: ${sec.skill} (${sec.grades})` }),
          h('span', { text: done ? 'Cleared! Fly again any time.' : `Fly with ${CREW_INFO[sec.chief].name}. 5 stars clears the sector.` }),
          h('span', { class: 'belt-stars', 'aria-label': `${n} of 5 stars` }, ...Array.from({ length: 5 }, (_, k) => iconImg(k < n ? 'star' : 'starEmpty', '', 18))),
        ),
        launchBtn('Launch', () => void this.launch(s)),
      );
    });
    rows.push(
      h(
        'li',
        { class: `belt-row${this.allDone ? '' : ' soon'}` },
        pix('sector-boss', () => paintStaticCoreIcon(), 2),
        h('div', { class: 'belt-info' }, h('strong', { text: 'The Bingo Boss' }), h('span', { text: this.save.bossSeen ? `Beaten! Best Bingo: ${this.save.bingoBest} calls. Ask Ayo for a rematch.` : this.allDone ? 'All four sectors are clear. Talk to Commander Ayo!' : 'Clear all four sectors first.' })),
        ...(this.allDone ? [launchBtn(this.save.bossSeen ? 'Rematch' : 'Go!', () => this.startFlight('formations', 'boss'))] : []),
      ),
      h(
        'li',
        { class: `belt-row${this.save.done.includes('engines') ? '' : ' soon'}` },
        pix('up-rapid', () => paintUpgradeIcon('rapid'), 2),
        h('div', { class: 'belt-info' }, h('strong', { text: 'Meteor Run with Rafi' }), h('span', { text: this.save.done.includes('engines') ? `${METEOR_SECONDS} seconds of quick facts. Best: ${this.save.best}` : 'Clear the Engines sector to unlock it.' })),
        ...(this.save.done.includes('engines') ? [launchBtn('Go!', () => this.startFlight('engines', 'meteor'))] : []),
      ),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'missions-title', style: 'width:min(620px,100%)' },
      h('header', {}, h('h2', { id: 'missions-title', text: 'Missions' }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h(
        'div',
        { class: 'content' },
        h('p', { class: 'small-note', style: 'margin:0 0 10px', text: `Win 5 stars in a sector to clear it. A star is for getting it right the first time. Fleet: ${this.save.fleet} ships.` }),
        h('ul', { class: 'belt-list' }, ...rows),
        h('div', { class: 'msq-mission-extra' }, h('button', { class: 'btn small', type: 'button', text: 'The Star Map', onclick: () => (modal.close(), this.openStarMap()) }), h('button', { class: 'btn small', type: 'button', text: 'Upgrade bay', onclick: () => (modal.close(), this.openUpgrades()) })),
      ),
    );
    const modal = new Modal(this.host, root);
  }

  // ------------------------------------------------------------ HUDs

  private buildHud(): void {
    this.routeEl = h('span', { class: 'msq-route', role: 'img' });
    this.fleetEl = h('span', { class: 'msq-count' });
    this.dustEl = h('span', { class: 'msq-count' });
    const bar = h('div', { class: 'panel msq-hudbar' }, this.routeEl, h('span', { class: 'msq-sep', 'aria-hidden': 'true' }), this.fleetEl, this.dustEl);
    this.promptEl = h('button', { class: 'panel prompt', type: 'button', hidden: true, onclick: () => this.target && this.use(this.target) });
    this.hud = h('div', { class: 'hud', hidden: true }, bar, this.promptEl);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'missions', label: 'Missions', icon: 'scroll', key: 'J', onClick: () => this.openMissions() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    this.touch = new TouchControls(this.hud, this.input, () => this.target && this.use(this.target));
    this.touch.setVisible(false);
  }

  private renderHud(): void {
    this.routeEl.replaceChildren(...ROUTE.map((s) => h('span', { class: `msq-sector${this.save.done.includes(s as Sector) ? ' on' : ''}` }, pix(`sector-${s}-${this.save.done.includes(s as Sector)}`, () => paintSectorIcon(s, this.save.done.includes(s as Sector)), 2))));
    this.routeEl.setAttribute('aria-label', `${this.save.done.length} of 4 sectors cleared`);
    this.fleetEl.replaceChildren(pix('fleet', () => paintFleetIcon(), 2), h('span', { text: String(this.save.fleet) }));
    this.fleetEl.setAttribute('aria-label', `Fleet: ${this.save.fleet} ships`);
    this.dustEl.replaceChildren(pix('dust', () => paintStardustIcon(), 2), h('span', { text: String(this.save.dust) }));
    this.dustEl.setAttribute('aria-label', `Stardust: ${this.save.dust}`);
    this.touch?.setVisible(this.mode === 'deck' && touchControlsVisible());
  }

  private buildFlightHud(): void {
    this.bannerFace = h('img', { class: 'msq-banner-face', alt: '', width: 48, height: 48 });
    this.bannerText = h('p', { class: 'msq-ask', 'aria-live': 'polite' });
    this.bannerNote = h('p', { class: 'msq-note', role: 'status', hidden: true });
    const speakBtn = h('button', { class: 'btn small msq-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 20));
    speakBtn.addEventListener('click', () => speak(`${this.bannerText.textContent ?? ''} ${this.bannerNote.hidden ? '' : this.bannerNote.textContent}`, { force: true }));
    this.shieldEl = h('span', { class: 'msq-shield', role: 'img' });
    this.fFleetEl = h('span', { class: 'msq-count' });
    this.dotsEl = h('span', { class: 'msq-qdots', role: 'img' });
    const hintBtn = h('button', { class: 'btn small msq-hint-btn', type: 'button', 'aria-keyshortcuts': 'H', onclick: () => (this.flight?.boss ? this.bossHint() : this.flight?.kind === 'mission' && !this.flight.between && this.openHint()) }, iconImg('bulb', '', 20), h('span', { class: 'msq-btn-label', text: 'Hint' }));
    const pauseBtn = h('button', { class: 'btn small', type: 'button', 'aria-label': 'Pause', onclick: () => this.flight && !this.flight.pause && this.openPause() }, h('span', { class: 'msq-pause-icon', 'aria-hidden': 'true' }), h('span', { class: 'msq-btn-label', text: 'Pause' }));
    this.fhud = h(
      'div',
      { class: 'msq-fhud', hidden: true },
      h('div', { class: 'panel msq-banner' }, this.bannerFace, h('div', { class: 'msq-banner-words' }, this.bannerText, this.bannerNote), speakBtn),
      h('div', { class: 'msq-status' }, h('div', { class: 'panel msq-stats' }, this.shieldEl, this.fFleetEl, this.dotsEl), h('div', { class: 'msq-flight-buttons' }, hintBtn, pauseBtn)),
    );
    this.host.append(this.fhud);
  }

  private renderFlightHud(): void {
    const f = this.flight;
    if (!f) return;
    const max = 3 + (this.save.upgrades.includes('shield1') ? 1 : 0) + (this.save.upgrades.includes('shield2') ? 1 : 0);
    const left = this.flightScene.shield;
    this.shieldEl.replaceChildren(...Array.from({ length: max }, (_, i) => pix(`shield-${i < left}`, () => paintShieldIcon(i < left), 2)));
    this.shieldEl.setAttribute('aria-label', `Shield: ${left} of ${max}`);
    this.fFleetEl.replaceChildren(pix('fleet', () => paintFleetIcon(), 2), h('span', { text: String(this.save.fleet) }));
    this.fFleetEl.setAttribute('aria-label', `Fleet: ${this.save.fleet} ships`);
    if (f.kind === 'meteor') return this.renderTimer();
    if (f.kind === 'boss') {
      const n = f.boss ? f.boss.marked.filter(Boolean).length - 1 : 0;
      this.dotsEl.replaceChildren(h('span', { class: 'msq-score', text: `Marked: ${n}` }));
      this.dotsEl.setAttribute('aria-label', `${n} squares marked`);
      return;
    }
    this.dotsEl.replaceChildren(...Array.from({ length: QUESTIONS_PER_FLIGHT }, (_, i) => h('span', { class: `msq-qdot${i < f.q ? ' done' : i === f.q ? ' now' : ''}${i === QUESTIONS_PER_FLIGHT - 1 ? ' core' : ''}` })));
    this.dotsEl.setAttribute('aria-label', `Question ${Math.min(QUESTIONS_PER_FLIGHT, f.q + 1)} of ${QUESTIONS_PER_FLIGHT}`);
  }

  /** Meteor Run: the time bar and the score. */
  private renderTimer(): void {
    const f = this.flight;
    if (!f || f.kind !== 'meteor') return;
    let bar = this.dotsEl.querySelector<HTMLElement>('.msq-timer-fill');
    let score = this.dotsEl.querySelector<HTMLElement>('.msq-score');
    if (!bar || !score) {
      bar = h('span', { class: 'msq-timer-fill' });
      score = h('span', { class: 'msq-score' });
      this.dotsEl.replaceChildren(h('span', { class: 'msq-timer', role: 'progressbar', 'aria-label': 'Time left' }, bar), score);
    }
    const left = Math.max(0, f.timeLeft === Infinity ? METEOR_SECONDS : f.timeLeft);
    bar.style.width = `${(left / METEOR_SECONDS) * 100}%`;
    bar.classList.toggle('low', left < 10);
    score.textContent = `${f.score} right · ${Math.ceil(left)} s`;
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
        const ok = await choose(this.host, 'Start over?', 'This erases your stars, fleet and upgrades in this browser. Settings are kept.', [
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
      added: 'adding the numbers instead of multiplying (4 groups of 3 as 7)',
      'group-size': 'giving the size of one group instead of all the groups',
      'group-count': 'counting the groups but not the ships in them',
      'one-group-off': 'one group too many or too few (a neighbouring fact)',
      'counted-edge': 'counting only the edge of a formation',
      'turn-changes': 'thinking a turned formation has a different number',
      'split-both': 'splitting both numbers when breaking a formation apart',
      'split-forgot': 'forgetting to multiply the second part of a split',
      'zero-keeps': 'thinking a number times 0 is the number',
      'one-makes-one': 'thinking a number times 1 is 1',
      'rules-mixed': 'mixing up the times 0 and times 1 rules',
      'half-forgot': 'doing times 10 instead of times 5',
      'extra-zero': 'putting two zeros on for times 10',
      'double-once': 'doubling only once for times 4',
      'nine-minus-one': 'taking away 1 instead of a whole group for times 9',
      'nines-flipped': 'flipping the digits of a nines answer (36 for 63)',
      'plus-three': 'adding 3 instead of one more group for times 3',
      subtracted: 'subtracting instead of dividing',
      multiplied: 'multiplying instead of dividing',
      swapped: 'giving the number of groups instead of how many in each',
      'leftover-ignored': 'forgetting that the leftover crew still need a shuttle',
      'remainder-answer': 'giving the leftover as the answer',
      'rounded-up': 'counting a part-full crate as full',
      'gave-quotient': 'giving the number of groups when asked what is left over',
      'missing-to-fill': 'giving how many more would fill a group, not what is left over',
      'backwards-division': 'dividing the small number by the big one (4 ÷ 12)',
      'division-not-family': 'not seeing division facts as part of a times family',
      'repeated-pair': 'counting a turned pair (12 × 2 after 2 × 12) as a new factor pair',
      'not-a-factor': 'picking a number that does not divide evenly as a factor',
      'multiple-not-factor': 'mixing up factors and multiples',
      'odd-means-prime': 'thinking every odd number is prime',
      'one-is-prime': 'thinking 1 is prime',
    };
    const rows = SECTORS.map((s) => {
      const rec = this.save.learner[s];
      const mis = topMisconception(rec);
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: `${SECTOR_INFO[s].name} (${SECTOR_INFO[s].skill})` }),
        h('td', { text: this.save.done.includes(s) ? 'Cleared' : rec ? 'In progress' : 'Not started' }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? (WORDS[mis] ?? '–') : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', { text: `This summary is kept only in this browser. Sectors cleared: ${this.save.done.length} of 4.${this.save.bossSeen ? ` The Bingo Boss is beaten (best: ${this.save.bingoBest} calls).` : ''} Flights: ${this.save.flights}. Ships rescued: ${this.save.fleet}. Star Map: ${this.save.starMap.length} of 55 facts lit (each lit fact was answered right first time). Best Meteor Run: ${this.save.best} in ${METEOR_SECONDS} seconds.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Sector', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const f = this.flight;
    const step = f?.problem?.steps[f.step];
    return {
      mode: this.mode,
      player: { x: this.world.player.x, y: this.world.player.y },
      target: this.target?.id ?? null,
      stars: { ...this.save.stars },
      played: { ...this.save.played },
      done: [...this.save.done],
      fleet: this.save.fleet,
      dust: this.save.dust,
      upgrades: [...this.save.upgrades],
      paint: this.save.paint,
      starMap: this.save.starMap.length,
      talking: this.talk.isOpen,
      bossCalled: this.save.bossCalled,
      bossSeen: this.save.bossSeen,
      bingoBest: this.save.bingoBest,
      best: this.save.best,
      night: this.world.night,
      flight: f
        ? {
            mode: f.kind,
            score: f.score,
            timeLeft: f.timeLeft,
            boss: f.boss ? { calls: f.boss.calls, call: f.boss.call.text, answer: f.boss.call.answer, rightIndex: f.boss.card.values.indexOf(f.boss.call.answer), marked: f.boss.marked.filter(Boolean).length, won: f.boss.won, cursor: f.boss.cursor } : null,
            sector: f.sector,
            q: f.q,
            step: f.step,
            kind: f.problem?.kind ?? null,
            tier: skill(this.save.learner, f.sector).tier,
            between: f.between,
            hintRung: f.hintRung,
            hintOpen: !!f.hint,
            paused: this.flightScene.paused,
            ask: step?.ask ?? null,
            right: step ? step.choices.findIndex((c) => c.correct) : -1,
            wrong: step ? step.choices.map((c, i) => (c.correct ? -1 : i)).filter((i) => i >= 0) : [],
            ready: this.flightScene.rocksReady,
            stars: f.stars,
            shield: this.flightScene.shield,
          }
        : null,
    };
  }
}
