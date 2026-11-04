import { iconImg } from '../../kit/art/icons';
import type { Appearance } from '../../kit/art/characters';
import type { Expression } from '../../kit/art/portraits';
import { bus } from '../../kit/core/events';
import { mulberry32 } from '../../kit/core/rng';
import { recordAnswer, skill, topMisconception, type SkillRules } from '../../kit/learning/mastery';
import { audio } from '../../kit/systems/audio';
import { applySettingsToDocument, isTouchDevice, settings, touchControlsVisible, updateSettings } from '../../kit/systems/settings';
import { setReadAloudDefault, speak, stopSpeaking } from '../../kit/systems/speech';
import { openCustomize } from '../../kit/ui/customize';
import { choose, h, Modal, stackTop } from '../../kit/ui/dom';
import { openGrownups } from '../../kit/ui/grownups';
import { mountToasts, toast, Toolbar } from '../../kit/ui/hud';
import { openSettings } from '../../kit/ui/settingsPanel';
import { Talk, type Speaker } from '../../kit/ui/talk';
import { showTitle } from '../../kit/ui/title';
import { HAIR16, look16FromAppearance, paintHero, paintPortrait16, type Look16, type Mood } from '../../kit/worlds';
import '../../kit/worlds/worlds.css';
import '../../kit/worlds/wild-lands/wild.css';
import { RANGER_TALA } from '../../kit/worlds/wild-lands/art';
import { IRIS_OKORO, NIMBUS, paintDrip, paintPowerIcon, paintThermometer, REGIONS, VILLAGERS, type Power, type Region } from '../../kit/worlds/wild-lands/weather-art';
import {
  hatOnPortrait,
  paintCloudChart,
  paintCloudPic,
  paintCycle,
  paintDew,
  paintEarth,
  paintGlass,
  paintHeight,
  paintKettle,
  paintMountain,
  paintPuddle,
  paintSalt,
  paintSnowflake,
  paintStates,
  paintSunShade,
  paintTherm,
  paintGearIcon,
} from './art';
import {
  BOOK,
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  DRIP_HELLO,
  FORECAST_RIGHT,
  GROWNUPS,
  HALF_DONE,
  IRIS_HELLO,
  MISCONCEPTION_WORDS,
  OPEN_REGIONS,
  OPENING,
  OPENING_END,
  PEOPLE,
  praise,
  REGION_INFO,
  STARS_PER_REGION,
  TALA_LINES,
  type BookPage,
  type PersonId,
} from './content';
import { CAMP, LEVELS, level, regionLevels, type LevelDef } from './levels';
import { BOOK_SONG, CAMP_SONG, CLOUDS_SONG, MOUNTAIN_SONG, SHORE_SONG } from './music';
import { pix } from './pix';
import { Play, type FinishResult } from './play';
import { bank, makeQuestion, type Choice, type CycleStage, type Misconception, type Question, type Tier } from './problems';
import { freshSave, store, type WeatherSave } from './save';
import { bonusFor, GEAR, POWER_CARDS, tryBuy, type Gear, type GearId } from './shop';

const POWER_KEYS: Power[] = ['sun', 'cool', 'wind', 'rain', 'cold'];
const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_REGION = 12;
const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };
const LOOKS: Record<Exclude<PersonId, 'drip'>, Look16> = { nimbus: NIMBUS, iris: IRIS_OKORO, tala: RANGER_TALA };
const SONG: Record<Region, string> = { shore: 'shore', clouds: 'clouds', mountain: 'mountain', river: 'camp', storm: 'camp' };

type Mode = 'title' | 'camp' | 'level' | 'busy' | 'panel';

interface Panel {
  modal: Modal;
  region: Region;
  /** A forecast stop (a couple of questions between a region's levels) or the Weather Book (until five stars). */
  kind: 'forecast' | 'book';
  rightNow: number;
  q: Question;
  hintRung: number;
  tries: number;
  recorded: boolean;
  answered: boolean;
  pic: HTMLElement;
  model: HTMLElement;
  feedback: HTMLElement;
  hintBtn: HTMLButtonElement;
  next: HTMLButtonElement;
  choices: HTMLElement;
  stars: HTMLElement;
  level: HTMLElement;
  prompt: HTMLElement;
}

/** The apprentice's look: the player's choices, in a wizard's robe. */
function apprentice(a: Appearance): Look16 {
  const l = look16FromAppearance(a);
  return { ...l, top: { ...l.top, kind: 'robe' }, badge: undefined };
}

export class Game {
  private readonly talk: Talk;
  private save: WeatherSave;
  private mode: Mode = 'title';
  private play: Play | null = null;
  private hud!: HTMLElement;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<PersonId, Speaker>;
  private panel: Panel | null = null;
  private praiseCount = 0;
  private talaLine = 0;
  private lastFinish: (FinishResult & { level: string }) | null = null;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-wild');
    this.save = store.exists() ? store.load() : freshSave();
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: Exclude<PersonId, 'drip'>, voice: number): Speaker => ({
      name: PEOPLE[id].name,
      role: PEOPLE[id].role,
      voice,
      portrait: (e: Expression) => {
        const key = `${id}-${e}`;
        let u = cache.get(key);
        if (!u) {
          const p = paintPortrait16(LOOKS[id], MOOD[e]);
          cache.set(key, (u = (id === 'nimbus' ? hatOnPortrait(p) : p).toDataURL(2)));
        }
        return u;
      },
    });
    this.speakers = {
      nimbus: speaker('nimbus', 140),
      iris: speaker('iris', 210),
      tala: speaker('tala', 160),
      drip: {
        name: PEOPLE.drip.name,
        role: PEOPLE.drip.role,
        voice: 420,
        portrait: () => {
          let u = cache.get('drip');
          if (!u) cache.set('drip', (u = dripPortrait()));
          return u;
        },
      },
    };
    audio.addSong('camp', CAMP_SONG);
    audio.addSong('shore', SHORE_SONG);
    audio.addSong('clouds', CLOUDS_SONG);
    audio.addSong('mountain', MOUNTAIN_SONG);
    audio.addSong('book', BOOK_SONG);
    bus.on('settings:changed', () => {
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
      this.play?.showTouch(touchControlsVisible());
    });
    this.buildHud();
    mountToasts(host);
    window.addEventListener('keydown', (e) => {
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) return this.onPanelKey(e);
      if (document.querySelector('.modal-back') || this.talk.isOpen) return;
      if (this.mode !== 'camp' && this.mode !== 'level') return;
      const k = e.key.toLowerCase();
      if (k === 'j') this.openMap();
      else if (k === 'b') this.openBook();
      else if (k === 'p') void this.openShop();
      else if (k === 'm') this.toggleMute();
    });
    (window as unknown as { __wwb: unknown }).__wwb = {
      state: () => this.debugState(),
      play: () => this.play?.state() ?? null,
      startLevel: (id: string) => (this.mode === 'camp' || this.mode === 'level') && void this.startLevel(level(id)),
      teleport: (x: number, y: number) => this.play?.teleport(x, y),
      face: (d: 1 | -1) => this.play?.face(d),
      use: (p: Power) => this.play?.use(p),
      camp: () => this.mode !== 'title' && this.enterCamp(),
      open: (r: Region, kind: 'forecast' | 'book' = 'book') => this.mode === 'camp' && this.openPanel(r, kind),
      setTier: (s: string, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      /** Open one question by its id (for screenshots). */
      ask: (s: Region, id: string) => {
        const d = bank(s).find((x) => x.id === id);
        if (!d || this.mode !== 'camp') return false;
        skill(this.save.learner, s).tier = d.tier;
        this.save.recent[s] = bank(s)
          .filter((x) => x.id !== id)
          .map((x) => x.id);
        this.openPanel(s, 'book');
        return true;
      },
      /** Mark levels as reached (for screenshots of later parts). */
      finishLevels: (ids: string[]) => {
        for (const id of ids) if (!this.save.levelsDone.includes(id)) this.save.levelsDone.push(id);
        this.persist();
      },
      /** Mark regions as finished. */
      finishRegions: (rs: Region[]) => {
        for (const r of rs) {
          for (const l of regionLevels(r)) if (!this.save.levelsDone.includes(l.id)) this.save.levelsDone.push(l.id);
          if (!this.save.done.includes(r)) this.save.done.push(r);
          this.save.stars[r] = STARS_PER_REGION;
          this.save.forecast[r] = FORECAST_RIGHT;
        }
        this.persist();
      },
    };
  }

  start(): void {
    this.mountCamp();
    this.play!.paused = true;
    this.showTitleScreen();
  }

  private get look(): Look16 {
    return apprentice(this.save.appearance);
  }

  // ------------------------------------------------------------ what is open

  /** A region is open when the one before it is finished. */
  private regionOpen(r: Region): boolean {
    const i = REGIONS.indexOf(r);
    return OPEN_REGIONS.includes(r) && (i === 0 || this.save.done.includes(REGIONS[i - 1]));
  }

  private levelOpen(l: LevelDef): boolean {
    if (!this.regionOpen(l.region)) return false;
    if (l.num === 1) return true;
    const first = regionLevels(l.region)[0];
    return this.save.levelsDone.includes(first.id);
  }

  /** The region being worked on (the first open one not finished). */
  private get current(): Region | null {
    return OPEN_REGIONS.find((r) => this.regionOpen(r) && !this.save.done.includes(r)) ?? null;
  }

  /** What the current region needs next. */
  private nextStep(): { kind: 'level'; level: LevelDef } | { kind: 'forecast' | 'book'; region: Region } | null {
    const r = this.current;
    if (!r) return null;
    const [l1, l2] = regionLevels(r);
    const sv = this.save;
    if (!sv.levelsDone.includes(l1.id)) return { kind: 'level', level: l1 };
    if (sv.forecast[r] < FORECAST_RIGHT && !sv.levelsDone.includes(l2.id)) return { kind: 'forecast', region: r };
    if (!sv.levelsDone.includes(l2.id)) return { kind: 'level', level: l2 };
    return { kind: 'book', region: r };
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Weather Wizard Battle',
      subtitle: 'Follow a drop of water round the world',
      intro: [
        'Be the apprentice of Professor Nimbus, a make-believe weather wizard, and follow Drip the water droplet round the water cycle. Run and jump through Sunny Shore, Cloud Heights and Mountain Pass, and use the Sun, cool air, wind, rain and cold to get past each puzzle, just the way nature does.',
        'For grades 3 to 5. No lives and no game over: a fall just takes you back to the last weather vane.',
      ],
      hasSave: store.exists(),
      continueGame: () => {
        audio.unlock();
        this.enterCamp();
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
        noun: 'weather wizard',
        hide: ['accessory'],
        only: { hairStyle: HAIR16 },
        paint: (a, dir, frame) => paintHero(apprentice(a), 1.5, dir, { walk: frame === 0 ? 1 : frame === 1 ? 0 : 2 }),
      },
      (a) => {
        this.save.appearance = a;
        this.persist();
        this.play?.setLook(this.look);
        done();
      },
    );
  }

  private async newGame(): Promise<void> {
    if (store.exists()) {
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your Weather Book and badges in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
    }
    this.titleEl?.remove();
    this.titleEl = null;
    this.customize(true, () => this.enterCamp());
  }

  // ------------------------------------------------------------ the camp

  private mountCamp(): void {
    this.play?.destroy();
    this.play = new Play(this.host, CAMP, { easy: this.save.easy, look: this.look, requestDone: true, gear: [] }, this.callbacks(CAMP));
    this.play.showTouch(touchControlsVisible());
  }

  private enterCamp(): void {
    this.titleEl?.remove();
    this.titleEl = null;
    this.closePanelQuietly();
    this.talk.end();
    this.mountCamp();
    this.hud.hidden = false;
    this.mode = 'camp';
    audio.play('camp');
    if (!this.save.openingSeen) void this.opening();
  }

  private async busy(f: () => Promise<void>): Promise<void> {
    const was = this.mode;
    this.mode = 'busy';
    if (this.play) {
      this.play.paused = true;
      this.play.release();
    }
    try {
      await f();
    } finally {
      this.talk.end();
      if (this.mode === 'busy') this.mode = was === 'busy' ? 'camp' : was;
      if (this.play && (this.mode === 'camp' || this.mode === 'level')) this.play.paused = false;
    }
  }

  private async opening(): Promise<void> {
    await this.busy(async () => {
      await this.talk.say(this.speakers.nimbus, OPENING, 'smile');
      await this.talk.say(this.speakers.drip, DRIP_HELLO, 'smile');
      await this.talk.say(this.speakers.nimbus, OPENING_END, 'proud');
      await this.talk.say(this.speakers.nimbus, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
      this.save.openingSeen = true;
      this.persist();
    });
  }

  private onTalk(id: string): void {
    if (this.mode !== 'camp') return;
    if (id === 'X') this.openMap();
    else if (id === 'N') void this.talkToNimbus();
    else if (id === 'J') void this.talkToIris();
    else void this.talkToTala();
  }

  private async talkToNimbus(): Promise<void> {
    const step = this.nextStep();
    await this.busy(async () => {
      const n = this.speakers.nimbus;
      if (!step) {
        if (!this.save.halfDoneSeen && OPEN_REGIONS.every((r) => this.save.done.includes(r))) {
          await this.talk.say(n, HALF_DONE, 'proud');
          this.save.halfDoneSeen = true;
          this.persist();
        } else await this.talk.say(n, 'Play any level again from the map, and try to bring every droplet to the flag!', 'smile');
        return;
      }
      if (step.kind === 'level') await this.talk.say(n, `Next: ${step.level.name}, in ${REGION_INFO[step.level.region].name}. Open the map when you are ready.`, 'smile');
      else
        await this.talk.say(
          n,
          `Dr. Iris has ${step.kind === 'forecast' ? 'a forecast question or two' : 'your Weather Book questions'} for ${REGION_INFO[step.region].name}. She is at the weather station.`,
          'smile',
        );
    });
  }

  private async talkToIris(): Promise<void> {
    const step = this.nextStep();
    const iris = this.speakers.iris;
    if (!this.save.irisMet) {
      await this.busy(async () => {
        await this.talk.say(iris, IRIS_HELLO, 'smile');
        this.save.irisMet = true;
        this.persist();
      });
    }
    if (step && step.kind !== 'level') return this.openPanel(step.region, step.kind);
    // practice: any finished region can be asked again
    const any = OPEN_REGIONS.filter((r) => this.save.levelsDone.some((id) => level(id).region === r));
    if (any.length && this.save.irisMet) {
      const pickId = await choose(this.host, 'Weather Book questions', 'Which region would you like to practise?', [
        ...any.map((r) => ({ id: r, label: REGION_INFO[r].name })),
        { id: 'none' as Region, label: 'Not now' },
      ]);
      if (pickId && pickId !== ('none' as Region)) this.openPanel(pickId, 'book');
      return;
    }
    await this.busy(() => this.talk.say(iris, 'Play the first level at Sunny Shore, then come back to me for a forecast question.', 'smile'));
  }

  private async talkToTala(): Promise<void> {
    await this.busy(() => this.talk.say(this.speakers.tala, TALA_LINES[this.talaLine++ % TALA_LINES.length], 'smile'));
  }

  // ------------------------------------------------------------ the map

  private openMap(): void {
    if (this.mode !== 'camp' && this.mode !== 'level') return;
    const sv = this.save;
    const regionBox = (r: Region) => {
      const info = REGION_INFO[r];
      const open = this.regionOpen(r);
      const done = sv.done.includes(r);
      const rows = regionLevels(r).map((l) => {
        const reached = sv.levelsDone.includes(l.id);
        const lo = this.levelOpen(l);
        const status = reached
          ? `Done. Best: ${sv.bestDrops[l.id] ?? 0} droplets.${sv.requests.includes(l.id) ? ' Helped the villager.' : ''}`
          : lo
            ? 'Ready to play.'
            : 'Opens after the level before.';
        return h(
          'div',
          { class: 'wwb-lv' },
          h('strong', { text: `${l.num}. ${l.name}` }),
          h('span', { text: status }),
          lo ? h('button', { class: `btn small${!reached ? ' primary' : ''}`, type: 'button', text: reached ? 'Play again' : 'Play', onclick: () => go(l) }) : null,
        );
      });
      const forecast = open && sv.levelsDone.includes(regionLevels(r)[0].id) && !done;
      return h(
        'section',
        { class: `wwb-region${open ? '' : ' soon'}` },
        h('h3', {}, h('span', { text: info.name }), h('span', { class: 'stage', text: `${info.stage}${done ? ': done!' : ''}` })),
        ...(OPEN_REGIONS.includes(r)
          ? open
            ? rows
            : [h('span', { class: 'small-note', text: `Opens after ${REGION_INFO[REGIONS[REGIONS.indexOf(r) - 1]].name}.` })]
          : [h('span', { class: 'small-note', text: 'Coming soon.' })]),
        forecast ? h('span', { class: 'small-note', text: `Weather Book: ${sv.stars[r]} of ${STARS_PER_REGION} stars. Visit Dr. Iris at the weather station.` }) : null,
      );
    };
    const go = (l: LevelDef) => {
      modal.close();
      void this.startLevel(l);
    };
    const root = h(
      'div',
      { class: 'panel modal wwb-map', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'map-title' },
      h(
        'header',
        {},
        h('h2', { id: 'map-title', text: 'The water cycle map' }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h('p', {
          class: 'small-note',
          style: 'margin:0 0 10px',
          text: 'Follow Drip round the water cycle. Each region has two levels. Between them, Dr. Iris asks a forecast question; after them, earn 5 stars in the Weather Book to finish the region.',
        }),
        ...REGIONS.map(regionBox),
        this.mode === 'level' ? h('button', { class: 'btn', type: 'button', text: 'Back to camp', onclick: () => (modal.close(), this.enterCamp()) }) : null,
      ),
    );
    const modal = new Modal(this.host, root);
    this.pauseFor(modal);
  }

  /** Pause the level while a menu is open. */
  private pauseFor(modal: Modal): void {
    if (!this.play) return;
    const p = this.play;
    p.paused = true;
    p.release();
    const check = () => {
      if (modal.closed) {
        if (this.play === p && (this.mode === 'camp' || this.mode === 'level') && !this.talk.isOpen && !document.querySelector('.modal-back')) p.paused = false;
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }

  // ------------------------------------------------------------ a level

  private callbacks(def: LevelDef) {
    return {
      onFinish: (r: FinishResult) => void this.finishLevel(def, r),
      onTalk: (id: string) => this.onTalk(id),
      onRequest: (stage: 'ask' | 'done') => void this.request(def, stage),
      onEasy: (on: boolean) => {
        this.save.easy = on;
        this.persist();
      },
      onMenu: () => this.openSettingsPanel(),
      onSound: (k: string) => {
        if (k === 'jump') audio.hop(true);
        else if (k === 'land') audio.land();
        else if (k === 'drop') audio.blip(84);
        else if (k === 'cast')
          audio.fx(
            [
              [72, 0, 0.08],
              [79, 0.06, 0.1],
            ],
            'triangle',
            0.1,
          );
        else if (k === 'fail') audio.retry();
        else if (k === 'splash')
          audio.fx(
            [
              [60, 0, 0.1],
              [55, 0.08, 0.14],
              [48, 0.18, 0.2],
            ],
            'sine',
            0.12,
          );
        else if (k === 'vane') audio.correct();
        else if (k === 'bump') audio.hop(false);
      },
    };
  }

  private async startLevel(def: LevelDef): Promise<void> {
    if (!this.levelOpen(def)) return;
    this.closePanelQuietly();
    this.play?.destroy();
    this.play = new Play(this.host, def, { easy: this.save.easy, look: this.look, requestDone: this.save.requests.includes(def.id), gear: this.activeGear() }, this.callbacks(def));
    this.play.showTouch(touchControlsVisible());
    this.play.paused = true;
    this.mode = 'level';
    this.hud.hidden = false;
    audio.play(SONG[def.region]);
    const host = REGION_INFO[def.region].host === 'iris' ? this.speakers.iris : this.speakers.nimbus;
    await this.busy(async () => {
      if (!this.save.introSeen.includes(def.id)) {
        await this.talk.say(host, def.intro, 'smile');
        this.save.introSeen.push(def.id);
        this.persist();
      } else await this.talk.say(host, `${def.name} again! Try to bring every droplet to the flag.`, 'smile');
    });
    await this.showPowerCards(def);
  }

  private activeGear(): GearId[] {
    return this.save.gear.filter((g) => !this.save.gearOff.includes(g));
  }

  // ------------------------------------------------------------ power cards and the Weather Shop

  /** The first time a level gives a power, its card says what it does in the game and the real science behind it. */
  private showPowerCards(def: LevelDef): Promise<void> {
    const sv = this.save;
    const fresh = def.powers.filter((p) => !sv.powersSeen.includes(p));
    if (!fresh.length || this.mode !== 'level') return Promise.resolve();
    return new Promise((resolve) => {
      const many = fresh.length > 1;
      const cards = fresh.map((p) => {
        const c = POWER_CARDS[p];
        return h(
          'section',
          { class: 'wwb-card' },
          pix(`card-${p}`, () => paintPowerIcon(48, p), 1.5, ''),
          h(
            'div',
            {},
            h('h3', { text: `${c.name} (key ${POWER_KEYS.indexOf(p) + 1})` }),
            h('p', {}, h('strong', { text: 'In the game: ' }), c.game),
            h('p', {}, h('strong', { text: 'The science: ' }), c.science),
            h('p', { class: 'small-note' }, h('strong', { text: 'When it won’t work: ' }), c.limit),
          ),
        );
      });
      const root = h(
        'div',
        { class: 'panel modal wwb-cards', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cards-title' },
        h('header', {}, h('h2', { id: 'cards-title', text: many ? 'Your weather powers' : `New power: ${POWER_CARDS[fresh[0]].name}!` })),
        h('div', { class: 'content' }, ...cards, h('button', { class: 'btn primary', type: 'button', text: 'Got it!', 'data-autofocus': true, onclick: () => modal.close() })),
      );
      const modal = new Modal(this.host, root, () => {
        for (const p of fresh) if (!sv.powersSeen.includes(p)) sv.powersSeen.push(p);
        this.persist();
        stopSpeaking();
        resolve();
      });
      this.pauseFor(modal);
      speak(fresh.map((p) => `${POWER_CARDS[p].name}. ${POWER_CARDS[p].game} ${POWER_CARDS[p].science}`).join(' '));
    });
  }

  /** Add droplets to spend in the Weather Shop. */
  private earn(n: number): void {
    if (n <= 0) return;
    this.save.wallet += n;
    this.persist();
  }

  /**
   * The Weather Shop: power-ups bought with droplets. None is needed to
   * finish a level; each one comes with the science behind it. It opens
   * after a level's questions, and from the toolbar at camp.
   */
  openShop(): Promise<void> {
    if (this.mode !== 'camp') {
      if (this.mode === 'level') toast('The Weather Shop is back at camp. Finish the level, or use the map to go back.', 'hint');
      return Promise.resolve();
    }
    if (document.querySelector('.modal-back')) return Promise.resolve();
    const sv = this.save;
    return new Promise((resolve) => {
      const wallet = h('p', { class: 'wwb-wallet' });
      const list = h('div', { class: 'wwb-shop-list' });
      const note = h('p', { class: 'small-note', role: 'status' });
      const render = () => {
        wallet.replaceChildren(
          pix('shop-drop', () => paintDrip(16, 'drop', 0, false), 2, ''),
          h('span', { text: `You have ${sv.wallet} droplets to spend.` }),
        );
        list.replaceChildren(...GEAR.map(row));
      };
      const row = (g: Gear) => {
        const owned = sv.gear.includes(g.id);
        const on = owned && !sv.gearOff.includes(g.id);
        const short = g.cost - sv.wallet;
        const btn = owned
          ? h('button', {
              class: `btn small${on ? ' primary' : ''}`,
              type: 'button',
              'aria-pressed': String(on),
              'data-gear': g.id,
              text: on ? 'On' : 'Off',
              onclick: () => {
                if (on) sv.gearOff.push(g.id);
                else sv.gearOff = sv.gearOff.filter((x) => x !== g.id);
                this.persist();
                note.textContent = `${g.name} is ${on ? 'off' : 'on'} for your next level.`;
                render();
                (list.querySelector(`[data-gear="${g.id}"]`) as HTMLElement | null)?.focus();
              },
            })
          : h('button', {
              class: `btn small${short <= 0 ? ' primary' : ''}`,
              type: 'button',
              'data-gear': g.id,
              disabled: short > 0,
              text: short > 0 ? `Need ${short} more` : `Buy: ${g.cost}`,
              onclick: () => void buy(g),
            });
        return h(
          'div',
          { class: `wwb-gear${owned ? ' owned' : ''}` },
          pix(`gear-${g.id}`, () => paintGearIcon(g.id), 3, ''),
          h('div', {}, h('strong', { text: `${g.name}${owned ? '' : ` (${g.cost} droplets)`}` }), h('span', { text: g.short })),
          btn,
        );
      };
      const buy = async (g: Gear) => {
        const r = tryBuy(sv.wallet, sv.gear, g.id);
        if (!r.ok) return;
        sv.wallet = r.wallet;
        sv.gear.push(g.id);
        this.persist();
        audio.levelUp();
        toast(`New power-up: ${g.name}!`, 'reward');
        render();
        await this.gearCard(g);
        (list.querySelector(`[data-gear="${g.id}"]`) as HTMLElement | null)?.focus();
      };
      const root = h(
        'div',
        { class: 'panel modal wwb-shop', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'shop-title' },
        h(
          'header',
          {},
          h('h2', { id: 'shop-title', text: 'Weather Shop' }),
          h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
        ),
        h(
          'div',
          { class: 'content' },
          wallet,
          list,
          note,
          h('p', {
            class: 'small-note',
            text: 'Earn droplets by bringing them to the flag, and by answering Dr. Iris’s questions (more for getting it right the first time). Power-ups make the game easier, but you never need one to finish a level. Each one comes with the science behind it.',
          }),
        ),
      );
      const modal = new Modal(this.host, root, () => resolve());
      render();
    });
  }

  /** The science card for a power-up just bought. */
  private gearCard(g: Gear): Promise<void> {
    return new Promise((resolve) => {
      const root = h(
        'div',
        { class: 'panel modal wwb-cards', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'gear-title' },
        h('header', {}, h('h2', { id: 'gear-title', text: `You got ${g.name}!` })),
        h(
          'div',
          { class: 'content' },
          h(
            'section',
            { class: 'wwb-card' },
            pix(`gear-big-${g.id}`, () => paintGearIcon(g.id), 4, ''),
            h('div', {}, h('p', {}, h('strong', { text: 'In the game: ' }), g.game), h('p', {}, h('strong', { text: 'The science: ' }), g.science)),
          ),
          h('button', { class: 'btn primary', type: 'button', text: 'Got it!', 'data-autofocus': true, onclick: () => modal.close() }),
        ),
      );
      const modal = new Modal(this.host, root, () => {
        stopSpeaking();
        resolve();
      });
      speak(`${g.name}. ${g.game} ${g.science}`);
    });
  }

  /** After a level's questions, open the shop if there is something new to buy or switch. */
  private async shopAfterLevel(): Promise<void> {
    if (this.save.gear.length === GEAR.length && this.save.wallet === 0) return;
    if (!GEAR.some((g) => !this.save.gear.includes(g.id) && g.cost <= this.save.wallet)) return;
    await this.openShop();
  }

  private villagerSpeaker(def: LevelDef): Speaker {
    const r = def.request!;
    const url = paintPortrait16(VILLAGERS[r.look], 'smile').toDataURL(2);
    return { name: r.name, role: 'A villager', voice: 240, portrait: () => url };
  }

  private async request(def: LevelDef, stage: 'ask' | 'done'): Promise<void> {
    const r = def.request;
    if (!r || this.mode !== 'level') return;
    const who = this.villagerSpeaker(def);
    await this.busy(async () => {
      if (stage === 'ask') await this.talk.say(who, this.save.requests.includes(def.id) || this.play?.requestDone ? r.thanks : r.ask, 'smile');
      else {
        await this.talk.say(who, r.thanks, 'proud');
        if (!this.save.requests.includes(def.id)) {
          this.save.requests.push(def.id);
          this.persist();
          audio.levelUp();
          toast(`Weather Book badge: ${r.badge}!`, 'reward');
        }
      }
    });
  }

  private async finishLevel(def: LevelDef, r: FinishResult): Promise<void> {
    const sv = this.save;
    const first = !sv.levelsDone.includes(def.id);
    if (first) sv.levelsDone.push(def.id);
    sv.bestDrops[def.id] = Math.max(sv.bestDrops[def.id] ?? 0, r.drops);
    sv.wallet += r.drops;
    this.persist();
    this.lastFinish = { ...r, level: def.id };
    audio.levelUp();
    const region = def.region;
    const host = REGION_INFO[region].host === 'iris' ? this.speakers.iris : this.speakers.nimbus;
    const all = r.drops === r.total;
    await this.busy(async () => {
      await this.talk.say(
        host,
        `You made it! You brought ${r.drops} of ${r.total} droplets to the flag${all ? ', every single one' : ''}. They go in your Weather Shop purse.${first ? ` ${newPages(def.id)}` : ''}`,
        'proud',
      );
    });
    const step = this.nextStep();
    if (step && step.kind !== 'level' && step.region === region) {
      if (step.kind === 'forecast') await this.busy(() => this.talk.say(this.speakers.iris, 'Forecast stop! Before the next level, a question or two from the weather station.', 'smile'));
      else await this.busy(() => this.talk.say(host, REGION_INFO[region].book, 'smile'));
      this.enterCamp();
      this.openPanel(step.region, step.kind);
      return;
    }
    this.enterCamp();
    await this.shopAfterLevel();
  }

  // ------------------------------------------------------------ the Weather Book questions

  private openPanel(region: Region, kind: 'forecast' | 'book'): void {
    if (!bank(region).length) return;
    this.mode = 'panel';
    if (this.play) {
      this.play.paused = true;
      this.play.release();
    }
    audio.play('book');
    const who = this.speakers[kind === 'forecast' ? 'iris' : REGION_INFO[region].host];
    const level = h('span', { class: 'wwb-level' });
    const stars = h('span', { class: 'wwb-stars', role: 'img' });
    const prompt = h('p', { class: 'wwb-prompt' });
    const speakBtn = h('button', { class: 'btn small wwb-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => {
      const q = this.panel?.q;
      speak(q ? `${q.ask} ${q.choices.map((c, i) => `${i + 1}: ${c.label}.`).join(' ')}` : '', { force: true });
    });
    const feedback = h('div', { class: 'wwb-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const pic = h('div', { class: 'wwb-pic' });
    const model = h('div', { class: 'wwb-model', hidden: true });
    const choices = h('div', { class: 'wwb-choices' });
    const hintBtn = h(
      'button',
      { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' },
      iconImg('bulb', '', 22),
      h('span', { text: 'Hint' }),
      h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }),
    ) as HTMLButtonElement;
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' }) as HTMLButtonElement;
    const face = h('img', { class: 'wwb-host', src: who.portrait('smile'), alt: who.name, width: 64, height: 64 });
    const title = kind === 'forecast' ? `Forecast stop: ${REGION_INFO[region].name}` : `Weather Book: ${REGION_INFO[region].name}`;
    const root = h(
      'div',
      { class: `panel modal wwb-panel wwb-${region}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'wwb-title' },
      h(
        'header',
        {},
        h('h2', { id: 'wwb-title', text: title }),
        h(
          'div',
          { class: 'wwb-head-right' },
          level,
          stars,
          h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }),
        ),
      ),
      h('div', { class: 'wwb-ask' }, face, prompt, speakBtn),
      h('div', { class: 'wwb-body' }, pic, model),
      choices,
      feedback,
      h('footer', { class: 'wwb-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closePanel(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = {
      modal,
      region,
      kind,
      rightNow: 0,
      q: null as unknown as Question,
      hintRung: 0,
      tries: 0,
      recorded: false,
      answered: false,
      pic,
      model,
      feedback,
      hintBtn,
      next,
      choices,
      stars,
      level,
      prompt,
    };
    this.nextQuestion();
  }

  private nextQuestion(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const st = pnl.region;
    const tier = skill(this.save.learner, st).tier as Tier;
    const q = makeQuestion(st, tier, mulberry32(this.save.seed++), this.save.recent[st]);
    this.save.recent[st] = [...this.save.recent[st].filter((x) => x !== q.id), q.id].slice(-40);
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
        { class: 'wwb-options' },
        ...q.choices.map((c, i) =>
          h(
            'button',
            { class: 'btn wwb-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), 'aria-label': `${i + 1}: ${c.label}`, onclick: () => this.pick(c) },
            h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
            h('span', { class: 'wwb-choice-text', text: c.label }),
          ),
        ),
      ),
    );
    this.renderStars();
    speak(`${q.ask} ${q.choices.map((c, i) => `${i + 1}: ${c.label}.`).join(' ')}`);
    requestAnimationFrame(() => pnl.choices.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
  }

  private tag(text: string, x: number, y: number, cls = ''): HTMLElement {
    return h('span', { class: `wwb-tag${cls ? ` ${cls}` : ''}`, style: `left:${x * 100}%;top:${y * 100}%`, text });
  }

  private renderPic(): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.pic.replaceChildren(this.buildPic(pnl.q, pnl.answered || pnl.hintRung >= 2));
    if (pnl.hintRung >= 2 && !pnl.answered) this.renderModel();
  }

  private buildPic(q: Question, labels: boolean): HTMLElement {
    const W = 176;
    const H = 96;
    const p = q.pic;
    const sky = (...els: Array<HTMLElement | null>) => h('div', { class: 'wwb-sky' }, ...els);
    const deg = (c: number) => `${c < 0 ? '−' : ''}${Math.abs(c)} °C`;
    switch (p.k) {
      case 'cycle':
        return this.cyclePic(p.stage, labels || p.stage !== null, 2);
      case 'puddle':
        return sky(pix('puddle', () => paintPuddle(W, H), 2, 'A puddle in the sun, with a faint shimmer of warm air rising from it'));
      case 'sunshade':
        return sky(
          pix(
            `sunshade-${p.thing}`,
            () => paintSunShade(W, H, p.thing),
            2,
            p.thing === 'towel' ? 'Two wet towels: one in the sun, one in the shade of a tree' : 'Two cups of water: one warm in the sun, one cold in the shade',
          ),
          this.tag('In the sun', 0.3, 0.02, 'small'),
          this.tag('In the shade', 0.72, 0.02, 'small'),
        );
      case 'states':
        return this.statesPic(2);
      case 'kettle':
        return sky(
          pix('kettle', () => paintKettle(W, H), 2, 'A boiling kettle: a clear gap at the spout, then a white cloud of steam'),
          this.tag('Clear gap', 0.5, 0.42, 'small'),
          this.tag('White steam', 0.8, 0.02, 'small'),
        );
      case 'salt':
        return sky(pix('salt', () => paintSalt(W, H), 2, 'A tide pool drying in the sun, with a ring of white crystals on the rocks'));
      case 'earth':
        return sky(
          pix('earth', () => paintEarth(W, H), 2, '100 drops of water: 97 blue, 2 white and 1 light blue'),
          this.tag('Blue: salty', 0.14, 0.02, 'small'),
          this.tag(labels ? 'White: frozen fresh water' : 'White and light blue: fresh', 0.78, 0.86, 'small'),
        );
      case 'therm':
        return sky(
          pix(`therm-${p.c}`, () => paintTherm(W, H, p.c), 2, `A thermometer reading ${deg(p.c)}`),
          this.tag(deg(p.c), 0.66, 0.4),
          this.tag('0 °C line', 0.3, 0.55, 'small'),
        );
      case 'cloud':
        return sky(
          pix(`cloud-${p.kind}`, () => paintCloudPic(W, H, p.kind), 2, CLOUD_ALT[p.kind]),
          labels ? this.tag(CLOUD_NAME[p.kind], 0.5, 0.02, 'small') : null,
        );
      case 'glass':
        return sky(pix('glass', () => paintGlass(W, H), 2, 'A glass of ice water on a sunny day, with drops on the outside'));
      case 'mountain':
        return sky(
          pix('mountain', () => paintMountain(W, H), 2, 'A mountain: damp air blows up the green left side, where a grey cloud rains; the right side is dry and sandy'),
          this.tag('Wet side', 0.22, 0.86, 'small'),
          this.tag('Dry side', 0.8, 0.86, 'small'),
        );
      case 'height':
        return sky(
          pix('height', () => paintHeight(W, H), 2, `A mountain with snow on top; the thermometer at the bottom reads ${deg(p.bottom)}`),
          this.tag(`Bottom: ${deg(p.bottom)}`, 0.2, 0.62, 'small'),
          this.tag('Top', 0.55, 0.02, 'small'),
        );
      case 'snowflake':
        return sky(pix('snowflake', () => paintSnowflake(W, H), 2, 'A big snowflake with six arms'));
      case 'dew':
        return sky(
          pix(`dew-${p.fog}`, () => paintDew(W, H, p.fog), 2, p.fog ? 'Fog lying over a lake at sunrise' : 'Grass with drops of dew at sunrise'),
          this.tag('Early morning', 0.5, 0.02, 'small'),
        );
    }
  }

  private cyclePic(stage: CycleStage | null, labels: boolean, scale: number): HTMLElement {
    const { buf, at } = paintCycle(176, 96, stage);
    const names: Record<string, string> = { evaporation: 'Evaporation', condensation: 'Condensation', precipitation: 'Precipitation', collection: 'Collection' };
    return h(
      'div',
      { class: 'wwb-sky' },
      pix(`cycle-${stage}`, () => buf, scale, 'The water cycle: the Sun warms the sea, invisible vapor rises, a grey cloud forms, rain falls on a hill, and a river runs back to the sea'),
      ...(labels ? (Object.keys(at) as Array<keyof typeof at>).filter((s) => !stage || s === stage || labels).map((s) => this.tag(names[s], at[s][0], at[s][1], 'small')) : []),
    );
  }

  private statesPic(scale: number): HTMLElement {
    return h(
      'div',
      { class: 'wwb-sky' },
      pix('states', () => paintStates(176, 64), scale, 'Three kinds of water: an ice cube (solid), water in a glass (liquid), and a jar that looks empty (water vapor, an invisible gas)'),
      this.tag('Solid: ice', 1 / 6, 0.02, 'small'),
      this.tag('Liquid', 0.5, 0.02, 'small'),
      this.tag('Gas: vapor (invisible)', 5 / 6, 0.02, 'small'),
    );
  }

  /** Hint 2's picture, when the question's own picture does not already show it. */
  private renderModel(): void {
    const pnl = this.panel!;
    const q = pnl.q;
    const show = (...els: HTMLElement[]) => {
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('div', { class: 'wwb-row wwb-model-row' }, ...els));
    };
    if (q.model === 'cycle' && q.pic.k !== 'cycle') show(this.cyclePic(null, true, 1.3));
    else if (q.model === 'states' && q.pic.k !== 'states') show(this.statesPic(1.3));
    else if (q.model === 'therm' && q.pic.k !== 'therm')
      show(
        h(
          'div',
          { class: 'wwb-sky' },
          pix('therm-model', () => paintThermometer(48, 0), 1.4, 'A thermometer with its 0 °C line'),
          this.tag('0 °C: water freezes', 0.5, 0.92, 'small'),
        ),
      );
    else if (q.model === 'clouds')
      show(
        h(
          'div',
          { class: 'wwb-sky' },
          pix('chart', () => paintCloudChart(176, 64), 1.4, 'The cloud chart: cumulus, stratus and cumulonimbus'),
          this.tag('Cumulus: fair', 1 / 6, 0.02, 'small'),
          this.tag('Stratus: grey day', 0.5, 0.02, 'small'),
          this.tag('Cumulonimbus: storms', 5 / 6, 0.02, 'small'),
        ),
      );
    else if (q.model === 'fact') {
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('p', { class: 'wwb-model-fact', text: q.hints[1] }));
    }
  }

  private pick(c: Choice): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered) return;
    const btn = pnl.choices.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(c.value)}"]`);
    if (btn?.disabled) return;
    if (c.correct) this.onRight(btn);
    else this.onWrong(btn, c);
  }

  private onRight(btn: HTMLButtonElement | null): void {
    const pnl = this.panel!;
    const q = pnl.q;
    pnl.answered = true;
    const clean = pnl.tries === 0 && pnl.hintRung <= 1;
    let tierChange = 0;
    if (!pnl.recorded) {
      pnl.recorded = true;
      tierChange = recordAnswer(this.save.learner, pnl.region, { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
    }
    const st = pnl.region;
    this.save.played[st]++;
    pnl.rightNow++;
    if (pnl.kind === 'forecast') this.save.forecast[st] = Math.max(this.save.forecast[st], pnl.rightNow);
    if (clean && this.save.stars[st] < STARS_PER_REGION) this.save.stars[st]++;
    const bonus = bonusFor(pnl.kind, clean);
    this.save.wallet += bonus;
    this.persist();
    if (clean) audio.itemGet();
    else audio.correct();
    const msg = `${clean ? `${praise(this.praiseCount++)} You win a star` : 'You got it! Stars are for getting it right the first time, but you still earn'} and ${bonus} droplet${bonus === 1 ? '' : 's'} for the shop.`;
    this.showFeedback(`${msg} ${q.explain}`, 'good');
    pnl.next.hidden = false;
    pnl.hintBtn.disabled = true;
    btn?.classList.add('right');
    pnl.choices.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
    pnl.model.hidden = true;
    this.renderPic();
    this.renderStars();
    if (tierChange > 0) toast('Level up! Trickier questions.', 'reward');
    requestAnimationFrame(() => pnl.next.focus());
  }

  private onWrong(btn: HTMLButtonElement | null, c: Choice): void {
    const pnl = this.panel!;
    pnl.tries++;
    if (!pnl.recorded) {
      pnl.recorded = true;
      const o = recordAnswer(this.save.learner, pnl.region, { correct: false, hintRung: pnl.hintRung, misconception: (c.misconception ?? null) as Misconception | null }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let’s practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(`Not quite. ${c.why ?? ''}`, 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.choices.querySelector<HTMLButtonElement>('.wwb-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `wwb-feedback ${kind}`;
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
    const n = this.save.stars[pnl.region];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_REGION }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_REGION} stars`);
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    const st = pnl.region;
    const sv = this.save;
    if (pnl.kind === 'forecast' && pnl.rightNow >= FORECAST_RIGHT) {
      pnl.modal.close();
      void this.afterForecast(st);
      return;
    }
    const rec = skill(sv.learner, st);
    const bothLevels = regionLevels(st).every((l) => sv.levelsDone.includes(l.id));
    const ready = sv.stars[st] >= STARS_PER_REGION && (rec.tier >= 2 || sv.played[st] >= MAX_PER_REGION);
    if (ready && bothLevels && !sv.done.includes(st)) {
      pnl.modal.close();
      void this.finishRegion(st);
    } else this.nextQuestion();
  }

  private async afterForecast(r: Region): Promise<void> {
    const l2 = regionLevels(r)[1];
    await this.busy(() => this.talk.say(this.speakers.iris, `That is a good forecast! ${l2.name} is open now. Off you go!`, 'proud'));
    await this.shopAfterLevel();
    const go = await choose(this.host, `${REGION_INFO[r].name}: ${l2.name}`, 'Play the next level now?', [
      { id: 'go', label: 'Play it now', kind: 'primary' },
      { id: 'camp', label: 'Stay at camp' },
    ]);
    if (go === 'go') void this.startLevel(l2);
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
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.wwb-choice')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closePanel(): void {
    stopSpeaking();
    this.panel = null;
    if (this.mode === 'panel') {
      this.mode = 'camp';
      audio.play('camp');
      if (this.play) this.play.paused = false;
    }
  }

  private closePanelQuietly(): void {
    if (this.panel) this.panel.modal.close();
  }

  private async finishRegion(r: Region): Promise<void> {
    const info = REGION_INFO[r];
    const who = this.speakers[info.host];
    await this.busy(async () => {
      audio.play('camp');
      await this.talk.say(who, 'Five stars! Before we finish, one question to talk through.', 'proud');
      const res = await this.talk.ask(who, info.debrief, () => audio.hint());
      recordAnswer(this.save.learner, `${r}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
      const bonus = bonusFor('talk', res.tries === 1);
      this.earn(bonus);
      toast(`+${bonus} droplets for the Weather Shop`, 'reward');
      this.save.done.push(r);
      this.persist();
      audio.levelUp();
      toast(`${info.badge} for ${info.name}!`, 'reward');
      await this.talk.say(who, info.done, 'proud');
      if (OPEN_REGIONS.every((x) => this.save.done.includes(x)) && !this.save.halfDoneSeen) {
        await this.talk.say(this.speakers.nimbus, HALF_DONE, 'proud');
        this.save.halfDoneSeen = true;
        this.persist();
      }
    });
    await this.shopAfterLevel();
  }

  // ------------------------------------------------------------ the Weather Book (pages and badges)

  private openBook(): void {
    if (this.mode !== 'camp' && this.mode !== 'level') return;
    const sv = this.save;
    const page = (p: BookPage) => {
      const got = sv.levelsDone.includes(p.from);
      if (!got) return h('div', { class: 'wwb-page' }, h('div', { class: 'wwb-guide-empty', text: '?', style: 'width:96px;flex:none' }), h('p', { text: `Found in ${level(p.from).name}.` }));
      return h('div', { class: 'wwb-page' }, this.bookPic(p.pic), h('div', {}, h('strong', { text: p.title }), h('p', { text: p.facts[0] }), h('p', { text: p.facts[1] })));
    };
    const badges = [...OPEN_REGIONS.filter((r) => sv.done.includes(r)).map((r) => REGION_INFO[r].badge), ...LEVELS.filter((l) => sv.requests.includes(l.id) && l.request).map((l) => l.request!.badge)];
    const step = this.nextStep();
    const root = h(
      'div',
      { class: 'panel modal wwb-guide', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'book-title' },
      h(
        'header',
        {},
        h('h2', { id: 'book-title', text: 'Weather Book' }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h('p', { class: 'small-note', style: 'margin:0', text: `Stars: ${OPEN_REGIONS.map((r) => `${REGION_INFO[r].name} ${sv.stars[r]}/${STARS_PER_REGION}`).join(', ')}.` }),
        h(
          'div',
          { class: 'wwb-badges' },
          ...(badges.length ? badges.map((b) => h('span', { class: 'wwb-badge', text: b })) : [h('span', { class: 'small-note', text: 'No badges yet. Help a villager, or finish a region.' })]),
        ),
        step && step.kind !== 'level' && this.mode === 'camp'
          ? h('button', {
              class: 'btn primary',
              type: 'button',
              text: step.kind === 'forecast' ? 'Answer the forecast questions' : `Answer the ${REGION_INFO[step.region].name} questions`,
              onclick: () => {
                modal.close();
                this.openPanel(step.region, step.kind);
              },
            })
          : null,
        h('div', { class: 'wwb-guide-grid', style: 'grid-template-columns:repeat(auto-fill,minmax(260px,1fr));margin-top:10px' }, ...BOOK.map(page)),
        sv.gear.length
          ? h(
              'div',
              {},
              h('h3', { text: 'Your power-ups', style: 'margin:14px 0 6px' }),
              h(
                'div',
                { class: 'wwb-guide-grid', style: 'grid-template-columns:repeat(auto-fill,minmax(260px,1fr))' },
                ...GEAR.filter((g) => sv.gear.includes(g.id)).map((g) =>
                  h(
                    'div',
                    { class: 'wwb-page' },
                    pix(`gear-bk-${g.id}`, () => paintGearIcon(g.id), 4, ''),
                    h('div', {}, h('strong', { text: g.name }), h('p', { text: g.science })),
                  ),
                ),
              ),
            )
          : null,
      ),
    );
    const modal = new Modal(this.host, root);
    this.pauseFor(modal);
  }

  private bookPic(key: string): HTMLElement {
    const [k, arg] = key.split(':');
    if (k === 'power') return pix(`bk-${arg}`, () => paintPowerIcon(48, arg as Power), 1.5, '');
    if (k === 'cycle') return pix(`bk-cycle-${arg}`, () => paintCycle(176, 96, arg as CycleStage).buf, 0.6, '');
    if (k === 'cloud') return pix(`bk-cloud-${arg}`, () => paintCloudPic(176, 96, arg as 'cumulus'), 0.6, '');
    if (k === 'states') return pix('bk-states', () => paintStates(176, 64), 0.6, '');
    if (k === 'salt') return pix('bk-salt', () => paintSalt(176, 96), 0.6, '');
    if (k === 'therm') return pix('bk-therm', () => paintThermometer(32, -3), 1.5, '');
    if (k === 'snowflake') return pix('bk-flake', () => paintSnowflake(176, 96), 0.6, '');
    return pix('bk-height', () => paintHeight(176, 96), 0.6, '');
  }

  // ------------------------------------------------------------ HUD, settings, grown-ups

  private buildHud(): void {
    this.hud = h('div', { class: 'hud wwb-tools', hidden: true });
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'map', label: 'Map', icon: 'scroll', key: 'J', onClick: () => this.openMap() },
      { id: 'book', label: 'Book', icon: 'star', key: 'B', onClick: () => this.openBook() },
      { id: 'shop', label: 'Shop', icon: 'bulb', key: 'P', onClick: () => void this.openShop() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
  }

  private toggleMute(): void {
    updateSettings({ muted: !settings.muted });
    if (settings.muted) stopSpeaking();
    toast(settings.muted ? 'Sound off (M to turn it back on)' : 'Sound on');
  }

  private openSettingsPanel(): void {
    if (this.mode === 'title' || this.mode === 'busy' || document.querySelector('.modal-back')) return;
    const m = openSettings(this.host, {
      changeLook: () => this.customize(false, () => undefined),
      grownups: () => this.openGrownups(),
      resetSave: async () => {
        const ok = await choose(this.host, 'Start over?', 'This erases your Weather Book and badges in this browser. Settings are kept.', [
          { id: 'yes', label: 'Yes, erase my progress', kind: 'danger' },
          { id: 'no', label: 'No, keep playing' },
        ]);
        if (ok === 'yes') {
          store.reset();
          window.location.reload();
        }
      },
    });
    this.pauseFor(m);
  }

  private openGrownups(): void {
    const m = openGrownups(this.host, GROWNUPS, () => this.progressReport());
    if (this.mode !== 'title') this.pauseFor(m);
  }

  private progressReport(): HTMLElement {
    const sv = this.save;
    const row = (name: string, status: string, rec: ReturnType<typeof skill> | undefined, mis: string | null) =>
      h(
        'tr',
        {},
        h('th', { scope: 'row', text: name }),
        h('td', { text: status }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? (MISCONCEPTION_WORDS[mis] ?? '–') : '–' }),
      );
    const rows = OPEN_REGIONS.map((r) => {
      const rec = sv.learner[r];
      const mis = topMisconception(rec) ?? topMisconception(sv.learner[`${r}-talk`]);
      const lv = regionLevels(r).filter((l) => sv.levelsDone.includes(l.id)).length;
      const status = sv.done.includes(r) ? 'Done' : !this.regionOpen(r) ? 'Not open yet' : `${lv} of 2 levels, ${sv.stars[r]} of ${STARS_PER_REGION} stars`;
      return row(`${REGION_INFO[r].name} (${REGION_INFO[r].skill.toLowerCase()})`, status, rec, mis);
    });
    const drops = LEVELS.reduce((s, l) => s + (sv.bestDrops[l.id] ?? 0), 0);
    return h(
      'div',
      {},
      h('p', {
        text: `This summary is kept only in this browser. Regions finished: ${sv.done.length} of 3 (of 5 when the game is complete). Levels reached the flag on: ${sv.levelsDone.length} of ${LEVELS.length}. Villagers helped: ${sv.requests.length}. Droplets brought to the flag (best runs): ${drops}.${sv.easy ? ' Easy jumps are on.' : ''}`,
      }),
      h(
        'div',
        { class: 'table-wrap' },
        h(
          'table',
          { class: 'progress-table' },
          h('thead', {}, h('tr', {}, ...['Part', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))),
          h('tbody', {}, ...rows),
        ),
      ),
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
      talking: this.talk.isOpen,
      levelsDone: [...this.save.levelsDone],
      requests: [...this.save.requests],
      stars: { ...this.save.stars },
      forecast: { ...this.save.forecast },
      done: [...this.save.done],
      bestDrops: { ...this.save.bestDrops },
      easy: this.save.easy,
      wallet: this.save.wallet,
      gear: [...this.save.gear],
      powersSeen: [...this.save.powersSeen],
      next: (() => {
        const s = this.nextStep();
        return s ? (s.kind === 'level' ? `level:${s.level.id}` : `${s.kind}:${s.region}`) : null;
      })(),
      lastFinish: this.lastFinish,
      panel:
        pnl && q
          ? {
              region: pnl.region,
              kind: pnl.kind,
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

const CLOUD_NAME: Record<string, string> = { cumulus: 'Cumulus', grey: 'A full, grey cloud', cumulonimbus: 'Cumulonimbus', stratus: 'Stratus' };
const CLOUD_ALT: Record<string, string> = {
  cumulus: 'Small, puffy white clouds with flat bottoms on a sunny day',
  grey: 'A thick, dark grey cloud with rain falling from it',
  cumulonimbus: 'A very tall, dark cloud with a flat, spread-out top like an anvil, and rain beneath',
  stratus: 'A flat, grey sheet of cloud covering the whole sky, with light drizzle',
};

/** The words for what a finished level adds to the Weather Book. */
function newPages(levelId: string): string {
  const pages = BOOK.filter((p) => p.from === levelId).map((p) => p.title.toLowerCase());
  if (!pages.length) return '';
  return `New in your Weather Book: ${pages.join(', ')}.`;
}

/** Drip's talk-box picture: the droplet, big, on a sea-blue background. */
function dripPortrait(): string {
  const c = document.createElement('canvas');
  c.width = 72;
  c.height = 72;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#bfe8f8';
  ctx.fillRect(0, 0, 72, 72);
  ctx.imageSmoothingEnabled = false;
  const d = paintDrip(56, 'drop').toCanvas(1);
  ctx.drawImage(d, Math.round((72 - d.width) / 2), Math.round((72 - d.height) / 2) + 4);
  const out = document.createElement('canvas');
  out.width = 144;
  out.height = 144;
  const o = out.getContext('2d')!;
  o.imageSmoothingEnabled = false;
  o.drawImage(c, 0, 0, 144, 144);
  return out.toDataURL();
}
