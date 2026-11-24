import { iconImg } from '../../kit/art/icons';
import type { Appearance } from '../../kit/art/characters';
import type { Expression } from '../../kit/art/portraits';
import { bus } from '../../kit/core/events';
import { mulberry32 } from '../../kit/core/rng';
import { add, type Inventory } from '../../kit/craft/workbench';
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
import {
  BIN_NAME,
  MARISOL_VEGA,
  NATURE,
  RAFI_HADDAD,
  ROSA_DELGADO,
  WEN_LI,
  TRASH,
  TRASH_IDS,
  VISITOR_NAME,
  VISITOR_NEEDS,
  paintBin,
  paintOlliePortrait,
  paintTrash,
  paintVisitor,
  type BinKind,
  type TrashId,
  type VisitorId,
} from '../../kit/worlds/wild-lands/coast-art';
import { FH, FW, paintBars, paintBins4, paintFinale, paintLoop, paintPath, paintScene } from './art';
import {
  BIG_RAIN,
  BUILT_LINE,
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  FINALE_END,
  GROWNUPS,
  MISCONCEPTION_WORDS,
  OLLIE_FREED,
  OPEN_STRETCHES,
  OPENING,
  OPENING_END,
  PEOPLE,
  praise,
  RAFI_HELLO,
  RING_LESSON,
  STARS_PER_STRETCH,
  STRETCH_INFO,
  TALA_LINES,
  TEST_RIGHT,
  type PersonId,
} from './content';
import { CAMP, LEVELS, level, stretchLevels, type LevelDef } from './levels';
import { BEACH_SONG, CAMP_SONG, FINALE_SONG, HARBOR_SONG, JOURNAL_SONG, TOWN_SONG, WETLAND_SONG } from './music';
import { unlocked } from './nature';
import { pix } from './pix';
import { designPic, Play, type FinishResult, type SoundKind } from './play';
import { bank, binFor, isMaterial, makeQuestion, RECIPES, sortWhy, STATIONS, type Choice, type Misconception, type Question, type RecipeId, type Station, type Tier } from './problems';
import { freshSave, store, type SquadSave } from './save';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_STRETCH = 12;
const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };
const LOOKS: Record<Exclude<PersonId, 'ollie'>, Look16> = { marisol: MARISOL_VEGA, rafi: RAFI_HADDAD, tala: RANGER_TALA, wen: WEN_LI, rosa: ROSA_DELGADO };
const SONG: Record<Station, string> = { beach: 'beach', harbor: 'harbor', wetland: 'wetland', town: 'town' };
const BINS: BinKind[] = ['recycle', 'compost', 'trash', 'hazard'];

type Mode = 'title' | 'camp' | 'level' | 'busy' | 'panel';
type PanelKind = 'test' | 'journal';

interface Panel {
  modal: Modal;
  station: Station;
  kind: PanelKind;
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

/** The cadet’s look: the player’s choices, in the Squad’s jumpsuit. */
function cadet(a: Appearance): Look16 {
  const l = look16FromAppearance(a);
  return { ...l, top: { ...l.top, kind: 'jumpsuit' }, belt: '#5a3a24', badge: undefined };
}

export class Game {
  private readonly talk: Talk;
  private save: SquadSave;
  private mode: Mode = 'title';
  private play: Play | null = null;
  private hud!: HTMLElement;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<PersonId, Speaker>;
  private panel: Panel | null = null;
  private praiseCount = 0;
  private talaLine = 0;
  private sorting: { items: TrashId[]; i: number; firstTry: boolean } | null = null;
  private lastFinish: (FinishResult & { level: string }) | null = null;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-wild');
    this.save = store.exists() ? store.load() : freshSave();
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: Exclude<PersonId, 'ollie'>, voice: number): Speaker => ({
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
      marisol: speaker('marisol', 200),
      rafi: speaker('rafi', 150),
      tala: speaker('tala', 170),
      wen: speaker('wen', 190),
      rosa: speaker('rosa', 165),
      ollie: {
        name: PEOPLE.ollie.name,
        role: PEOPLE.ollie.role,
        voice: 420,
        portrait: () => {
          let u = cache.get('ollie');
          if (!u) cache.set('ollie', (u = paintOlliePortrait(true).toDataURL(2)));
          return u;
        },
      },
    };
    audio.addSong('camp', CAMP_SONG);
    audio.addSong('beach', BEACH_SONG);
    audio.addSong('harbor', HARBOR_SONG);
    audio.addSong('journal', JOURNAL_SONG);
    audio.addSong('wetland', WETLAND_SONG);
    audio.addSong('town', TOWN_SONG);
    audio.addSong('finale', FINALE_SONG);
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
      if (this.play?.isBuilding) return;
      const k = e.key.toLowerCase();
      if (k === 'j') this.openMap();
      else if (k === 'b') this.openJournal();
      else if (k === 'm') this.toggleMute();
    });
    (window as unknown as { __pss: unknown }).__pss = {
      state: () => this.debugState(),
      play: () => this.play?.state() ?? null,
      startLevel: (id: string) => (this.mode === 'camp' || this.mode === 'level') && void this.startLevel(level(id)),
      teleport: (x: number, y?: number) => this.play?.teleport(x, y),
      face: (d: 1 | -1) => this.play?.face(d),
      grab: () => this.play?.grab(),
      use: () => this.play?.use(),
      camp: () => this.mode !== 'title' && this.enterCamp(),
      finale: () => this.mode === 'camp' && void this.bigRain(),
      open: (s: Station, kind: PanelKind = 'journal') => this.mode === 'camp' && this.openPanel(s, kind),
      setTier: (s: string, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      /** Open one question by its id (for screenshots). */
      ask: (s: Station, id: string) => {
        const d = bank(s).find((x) => x.id === id);
        if (!d || this.mode !== 'camp') return false;
        skill(this.save.learner, s).tier = d.tier;
        this.save.recent[s] = bank(s)
          .filter((x) => x.id !== id)
          .map((x) => x.id);
        this.openPanel(s, 'journal');
        return true;
      },
      /** Mark levels as finished (for screenshots of later parts). */
      finishLevels: (ids: string[]) => {
        for (const id of ids) if (!this.save.levelsDone.includes(id)) this.save.levelsDone.push(id);
        this.save.ollie = true;
        this.persist();
      },
      finishStretches: (ss: Station[]) => {
        for (const s of ss) {
          for (const l of stretchLevels(s)) if (!this.save.levelsDone.includes(l.id)) this.save.levelsDone.push(l.id);
          if (!this.save.done.includes(s)) this.save.done.push(s);
          this.save.stars[s] = STARS_PER_STRETCH;
          this.save.tests[s] = TEST_RIGHT;
        }
        this.save.ollie = true;
        this.persist();
      },
      giveBag: (bag: Inventory) => {
        this.save.bag = { ...this.save.bag, ...bag };
        this.persist();
      },
      sort: (bin: BinKind) => this.sortPick(bin),
      nature: () => this.play?.openNature(),
      pickNature: (id: string) => this.play?.pickNature(id as never),
      placeNature: (x: number) => this.play?.placeAt(x),
    };
  }

  start(): void {
    this.mountCamp();
    this.play!.paused = true;
    this.showTitleScreen();
  }

  private get look(): Look16 {
    return cadet(this.save.appearance);
  }

  // ------------------------------------------------------------ what is open

  private stretchOpen(s: Station): boolean {
    const i = STATIONS.indexOf(s);
    return OPEN_STRETCHES.includes(s) && (i === 0 || this.save.done.includes(STATIONS[i - 1]));
  }

  private levelOpen(l: LevelDef): boolean {
    if (!this.stretchOpen(l.stretch)) return false;
    if (l.num === 1) return true;
    return this.save.levelsDone.includes(stretchLevels(l.stretch)[0].id);
  }

  private get current(): Station | null {
    return OPEN_STRETCHES.find((s) => this.stretchOpen(s) && !this.save.done.includes(s)) ?? null;
  }

  private nextStep(): { kind: 'level'; level: LevelDef } | { kind: PanelKind; station: Station } | null {
    const s = this.current;
    if (!s) return null;
    const [l1, l2] = stretchLevels(s);
    const sv = this.save;
    if (!sv.levelsDone.includes(l1.id)) return { kind: 'level', level: l1 };
    if (sv.tests[s] < TEST_RIGHT && !sv.levelsDone.includes(l2.id)) return { kind: 'test', station: s };
    if (!sv.levelsDone.includes(l2.id)) return { kind: 'level', level: l2 };
    return { kind: 'journal', station: s };
  }

  /** Trash in the backpack still to sort (everything that isn’t a crafting material). */
  private toSort(): TrashId[] {
    const out: TrashId[] = [];
    for (const id of TRASH_IDS) if (!isMaterial(id) && id !== 'tire') for (let k = 0; k < (this.save.bag[id] ?? 0); k++) out.push(id);
    return out;
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Pollution Solution Squad',
      subtitle: 'Follow the trash to where it starts',
      intro: [
        'Join the Pollution Solution Squad at Beach Camp. Trash keeps washing up on Turtle Beach, so follow it upstream. Run and jump along the coast, pick up trash, free Ollie the river otter, and use what you find to build fixes at Rafi’s Workbench. Pick a design, test it, and make it better.',
        'For grades 3 to 5. No lives and no game over: a fall into the water just takes you back to the last Squad flag.',
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
        noun: 'Squad cadet',
        hide: ['accessory'],
        only: { hairStyle: HAIR16 },
        paint: (a, dir, frame) => paintHero(cadet(a), 1.5, dir, { walk: frame === 0 ? 1 : frame === 1 ? 0 : 2 }),
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your Squad Journal, your backpack and your Nature Center in this browser.', [
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

  // ------------------------------------------------------------ Beach Camp

  private mountCamp(): void {
    this.play?.destroy();
    this.play = new Play(
      this.host,
      CAMP,
      {
        easy: this.save.easy,
        look: this.look,
        bag: this.save.bag,
        ollie: this.save.ollie,
        levelDone: true,
        nature: { placed: this.save.nature, unlocked: unlocked(this.save.levelsDone), seen: this.save.visitors },
      },
      this.callbacks(CAMP),
    );
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
      await this.talk.say(this.speakers.marisol, OPENING, 'smile');
      await this.talk.say(this.speakers.rafi, RAFI_HELLO, 'smile');
      await this.talk.say(this.speakers.marisol, OPENING_END, 'smile');
      await this.talk.say(this.speakers.marisol, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
      this.save.openingSeen = true;
      this.persist();
    });
  }

  private onTalk(id: string): void {
    if (this.mode !== 'camp') return;
    if (id === 'Q') this.openMap();
    else if (id === 'J') this.openJournal();
    else if (id === 'S') void this.sortingStation();
    else if (id === 'M') void this.talkToMarisol();
    else if (id === 'R') void this.talkToRafi();
    else void this.busy(() => this.talk.say(this.speakers.tala, TALA_LINES[this.talaLine++ % TALA_LINES.length], 'smile'));
  }

  private async talkToMarisol(): Promise<void> {
    const step = this.nextStep();
    if (step && step.kind !== 'level') return this.openPanel(step.station, step.kind);
    await this.busy(async () => {
      const m = this.speakers.marisol;
      if (!step) {
        await this.talk.say(m, 'The whole coast is clean, from the hills to the sea! Play any level again from the map to find hidden trash, or build in the Nature Center.', 'smile');
        if (this.save.finaleSeen) {
          const again = await choose(this.host, 'The Big Rain', 'Would you like to watch The Big Rain and Clean Coast Day again?', [
            { id: 'yes', label: 'Watch it again' },
            { id: 'no', label: 'Not now' },
          ]);
          if (again === 'yes') await this.bigRain();
        }
        return;
      }
      await this.talk.say(m, `Next: ${step.level.name}, at ${STRETCH_INFO[step.level.stretch].name}. Open the map when you are ready.`, 'smile');
    });
    // practice: any stretch with a finished level can be asked again
    const any = OPEN_STRETCHES.filter((s) => this.save.levelsDone.some((id) => level(id).stretch === s));
    if (any.length) {
      const pickId = await choose(this.host, 'Squad Journal questions', 'Would you like to practise some questions?', [
        ...any.map((s) => ({ id: s, label: STRETCH_INFO[s].name })),
        { id: 'none' as Station, label: 'Not now' },
      ]);
      if (pickId && pickId !== ('none' as Station)) this.openPanel(pickId, 'journal');
    }
  }

  private async talkToRafi(): Promise<void> {
    const built = this.save.built.length;
    const line = !built
      ? 'Every level has a Workbench near its blueprint stake. Gather the materials on the way, pick a design, build it, and we’ll test it together.'
      : `${built} fix${built === 1 ? '' : 'es'} built so far! Spare wood, rope and bottles can go into the Nature Center: a bench made of recycled bottles, bird boxes, a bee hotel.`;
    await this.busy(() => this.talk.say(this.speakers.rafi, line, 'smile'));
  }

  // ------------------------------------------------------------ the map

  private openMap(): void {
    if (this.mode !== 'camp' && this.mode !== 'level') return;
    const sv = this.save;
    const box = (s: Station) => {
      const info = STRETCH_INFO[s];
      const open = this.stretchOpen(s);
      const done = sv.done.includes(s);
      const rows = stretchLevels(s).map((l) => {
        const reached = sv.levelsDone.includes(l.id);
        const lo = this.levelOpen(l);
        return h(
          'div',
          { class: 'pss-lv' },
          h('strong', { text: `${l.num}. ${l.name}` }),
          h('span', { text: reached ? 'Done.' : lo ? 'Ready to play.' : 'Opens after the level before.' }),
          lo ? h('button', { class: `btn small${!reached ? ' primary' : ''}`, type: 'button', 'data-level': l.id, text: reached ? 'Play again' : 'Play', onclick: () => go(l) }) : null,
        );
      });
      return h(
        'section',
        { class: `pss-region${open ? '' : ' soon'}` },
        h('h3', {}, h('span', { text: info.name }), h('span', { class: 'stage', text: `${info.problem}${done ? ': done!' : ''}` })),
        ...(open ? rows : [h('span', { class: 'small-note', text: `Opens after ${STRETCH_INFO[STATIONS[STATIONS.indexOf(s) - 1]].name}.` })]),
        open && sv.levelsDone.includes(stretchLevels(s)[0].id) && !done
          ? h('span', { class: 'small-note', text: `Squad Journal: ${sv.stars[s]} of ${STARS_PER_STRETCH} stars. Talk to Marisol.` })
          : null,
      );
    };
    const go = (l: LevelDef) => {
      modal.close();
      void this.startLevel(l);
    };
    const root = h(
      'div',
      { class: 'panel modal pss-map', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'map-title' },
      h(
        'header',
        {},
        h('h2', { id: 'map-title', text: 'The coast map' }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h('p', {
          class: 'small-note',
          style: 'margin:0 0 10px',
          text: 'Follow the trash upstream. Each stretch of the coast has two levels. Between them comes a water test; after them, earn 5 stars in the Squad Journal to finish the stretch.',
        }),
        ...STATIONS.map(box),
        this.mode === 'level' ? h('button', { class: 'btn', type: 'button', text: 'Back to camp', onclick: () => (modal.close(), this.enterCamp()) }) : null,
      ),
    );
    const modal = new Modal(this.host, root);
    this.pauseFor(modal);
  }

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
      onStory: (key: 'ollie' | 'built', recipe?: RecipeId) => void this.story(key, recipe),
      onTested: (recipe: RecipeId, design: string, works: boolean) => {
        const t = (this.save.tried[recipe] ??= []);
        if (!t.includes(design)) t.push(design);
        if (works && !this.save.built.includes(recipe)) this.save.built.push(recipe);
        this.persist();
      },
      onPickup: (id: TrashId) => {
        if (!this.save.found.includes(id)) {
          this.save.found.push(id);
          this.persist();
        }
      },
      onNature: (placed: { id: never; x: number }[], bag: Inventory, fresh: VisitorId[]) => {
        this.save.nature = placed;
        this.save.bag = bag;
        for (const v of fresh) if (!this.save.visitors.includes(v)) this.save.visitors.push(v);
        this.persist();
        if (fresh.length) toast(`New in your Visitor Book: ${VISITOR_NAME[fresh[0]]}`, 'reward');
      },
      onEasy: (on: boolean) => {
        this.save.easy = on;
        this.persist();
      },
      onMenu: () => this.openSettingsPanel(),
      onSound: (k: SoundKind) => this.sound(k),
    };
  }

  private sound(k: SoundKind): void {
    if (k === 'jump') audio.hop(true);
    else if (k === 'land') audio.land();
    else if (k === 'grab') audio.itemGet();
    else if (k === 'build' || k === 'place') audio.click();
    else if (k === 'works') audio.levelUp();
    else if (k === 'half' || k === 'nope') audio.retry();
    else if (k === 'flag') audio.correct();
    else if (k === 'bump') audio.hop(false);
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
  }

  private async story(key: 'ollie' | 'built', recipe?: RecipeId): Promise<void> {
    await this.busy(async () => {
      if (key === 'ollie') {
        this.save.ollie = true;
        this.persist();
        await this.talk.say(this.speakers.ollie, OLLIE_FREED, 'smile');
        await this.talk.say(this.speakers.marisol, RING_LESSON, 'smile');
      } else if (recipe) await this.talk.say(this.speakers.rafi, BUILT_LINE[recipe], 'proud');
    });
  }

  private async startLevel(def: LevelDef): Promise<void> {
    if (!this.levelOpen(def)) return;
    this.closePanelQuietly();
    this.play?.destroy();
    const done = this.save.levelsDone.includes(def.id);
    this.play = new Play(this.host, def, { easy: this.save.easy, look: this.look, bag: this.save.bag, ollie: this.save.ollie, levelDone: done }, this.callbacks(def));
    this.play.showTouch(touchControlsVisible());
    this.play.paused = true;
    this.mode = 'level';
    this.hud.hidden = false;
    audio.play(SONG[def.stretch]);
    const host = this.speakers[STRETCH_INFO[def.stretch].host];
    await this.busy(async () => {
      if (!this.save.introSeen.includes(def.id)) {
        await this.talk.say(host, def.intro, 'smile');
        this.save.introSeen.push(def.id);
        this.persist();
      } else await this.talk.say(host, `${def.name} again! The fixes here are already working. Pick up any new trash on the way to the flag.`, 'smile');
    });
  }

  private async finishLevel(def: LevelDef, r: FinishResult): Promise<void> {
    const sv = this.save;
    const first = !sv.levelsDone.includes(def.id);
    if (first) sv.levelsDone.push(def.id);
    sv.bag = r.bag;
    this.persist();
    this.lastFinish = { ...r, level: def.id };
    audio.levelUp();
    const host = this.speakers[STRETCH_INFO[def.stretch].host];
    const newPieces = first ? unlocked(sv.levelsDone).filter((id) => !unlocked(sv.levelsDone.filter((x) => x !== def.id)).includes(id)) : [];
    await this.busy(async () => {
      await this.talk.say(
        host,
        `You made it to the flag! ${r.picked.length ? `You picked up ${r.picked.length} piece${r.picked.length === 1 ? '' : 's'} of trash.` : ''}${newPieces.length ? ` New for the Nature Center: ${newPieces.map((id) => NATURE[id].name.toLowerCase()).join(', ')}.` : ''}`,
        'proud',
      );
    });
    this.enterCamp();
    if (this.toSort().length) await this.sortingStation(true);
    const step = this.nextStep();
    if (step && step.kind !== 'level' && step.station === def.stretch) {
      if (step.kind === 'test') await this.busy(() => this.talk.say(this.speakers.marisol, 'Water test! Before the next level, let’s check what you know about this stretch of coast.', 'smile'));
      else await this.busy(() => this.talk.say(host, STRETCH_INFO[def.stretch].journal, 'smile'));
      this.openPanel(step.station, step.kind);
    }
  }

  // ------------------------------------------------------------ the sorting station

  private sortingStation(afterLevel = false): Promise<void> {
    const items = this.toSort();
    if (!items.length) {
      return this.busy(() => this.talk.say(this.speakers.marisol, 'Nothing to sort right now. Bring back trash from the levels, and sort it here.', 'smile'));
    }
    return new Promise((resolve) => {
      this.mode = 'panel';
      if (this.play) {
        this.play.paused = true;
        this.play.release();
      }
      this.sorting = { items, i: 0, firstTry: true };
      const item = h('div', { class: 'pss-sort-item' });
      const say = h('p', { class: 'pss-prompt' });
      const feedback = h('div', { class: 'pss-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
      const count = h('span', { class: 'pss-level' });
      const bins = h(
        'div',
        { class: 'pss-bins' },
        ...BINS.map((b, i) =>
          h(
            'button',
            { class: 'btn pss-binbtn', type: 'button', 'data-bin': b, 'aria-keyshortcuts': String(i + 1), onclick: () => this.sortPick(b) },
            pix(`bin-${b}`, () => paintBin(24, b), 2, ''),
            h('span', { text: BIN_NAME[b] }),
            h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          ),
        ),
      );
      const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' }) as HTMLButtonElement;
      const root = h(
        'div',
        { class: 'panel modal pss-panel pss-sort', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sort-title' },
        h('header', {}, h('h2', { id: 'sort-title', text: 'The sorting station' }), h('div', { class: 'pss-head-right' }, count)),
        h('div', { class: 'pss-ask' }, h('img', { class: 'pss-host', src: this.speakers.marisol.portrait('smile'), alt: 'Marisol', width: 64, height: 64 }), say),
        item,
        bins,
        feedback,
        h('footer', { class: 'pss-foot' }, next),
      );
      const show = () => {
        const so = this.sorting!;
        const id = so.items[so.i];
        so.firstTry = true;
        count.textContent = `${so.i + 1} of ${so.items.length}`;
        item.replaceChildren(
          pix(`sort-${id}`, () => paintTrash(id, 24), 4, TRASH[id].name),
          h('strong', { text: TRASH[id].name }),
        );
        say.textContent = `Which bin does the ${TRASH[id].name.toLowerCase()} go in?`;
        feedback.hidden = true;
        next.hidden = true;
        bins.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = false));
        speak(say.textContent);
        requestAnimationFrame(() => bins.querySelector<HTMLButtonElement>('button')?.focus());
      };
      const advance = () => {
        const so = this.sorting!;
        so.i++;
        if (so.i >= so.items.length) {
          modal.close();
          return;
        }
        show();
      };
      next.addEventListener('click', advance);
      (root as HTMLElement & { _pick?: (b: BinKind) => void })._pick = (b: BinKind) => {
        const so = this.sorting;
        if (!so || !next.hidden) return;
        const id = so.items[so.i];
        const right = binFor(id) === b;
        const why = sortWhy(id, b);
        if (so.firstTry) {
          recordAnswer(this.save.learner, 'sort', { correct: right, hintRung: 0, misconception: right ? null : 'bin-mixup' }, RULES);
          this.save.sorted++;
          if (right) this.save.sortedRight++;
        }
        feedback.hidden = false;
        if (right) {
          audio.correct();
          this.save.bag = add(this.save.bag, id, -1);
          if (!this.save.bag[id]) delete this.save.bag[id];
          this.persist();
          feedback.className = 'pss-feedback good';
          feedback.replaceChildren(iconImg('star', '', 22), h('span', { text: `${BIN_NAME[b]}! ${why}` }));
          speak(`${BIN_NAME[b]}! ${why}`);
          bins.querySelectorAll('button').forEach((x) => ((x as HTMLButtonElement).disabled = true));
          next.hidden = false;
          requestAnimationFrame(() => next.focus());
        } else {
          audio.retry();
          so.firstTry = false;
          feedback.className = 'pss-feedback try';
          feedback.replaceChildren(h('span', { text: `Not that bin. ${why}` }));
          speak(`Not that bin. ${why}`);
          const btn = bins.querySelector<HTMLButtonElement>(`[data-bin="${b}"]`);
          if (btn) btn.disabled = true;
          this.persist();
        }
      };
      const modal = new Modal(this.host, root, () => {
        this.sorting = null;
        stopSpeaking();
        if (this.mode === 'panel') {
          this.mode = 'camp';
          if (this.play) this.play.paused = false;
        }
        resolve();
      });
      root.addEventListener('keydown', (e) => {
        const k = e.key;
        if (/^[1-4]$/.test(k)) {
          e.preventDefault();
          this.sortPick(BINS[Number(k) - 1]);
        } else if ((k === ' ' || k === 'Enter') && !next.hidden && document.activeElement !== next) {
          e.preventDefault();
          advance();
        }
      });
      this.sortRoot = root;
      say.textContent = afterLevel ? 'Let’s sort what you picked up. Materials stay in your backpack for crafting.' : '';
      show();
    });
  }

  private sortRoot: HTMLElement | null = null;

  private sortPick(b: BinKind): void {
    (this.sortRoot as (HTMLElement & { _pick?: (b: BinKind) => void }) | null)?._pick?.(b);
  }

  // ------------------------------------------------------------ the water test and the Squad Journal

  private openPanel(station: Station, kind: PanelKind): void {
    if (!bank(station).length) return;
    this.mode = 'panel';
    if (this.play) {
      this.play.paused = true;
      this.play.release();
    }
    audio.play('journal');
    const who = this.speakers[kind === 'test' ? 'marisol' : STRETCH_INFO[station].host];
    const level = h('span', { class: 'pss-level' });
    const stars = h('span', { class: 'pss-stars', role: 'img' });
    const prompt = h('p', { class: 'pss-prompt' });
    const speakBtn = h('button', { class: 'btn small pss-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => {
      const q = this.panel?.q;
      speak(q ? `${q.ask} ${q.choices.map((c, i) => `${i + 1}: ${c.label}.`).join(' ')}` : '', { force: true });
    });
    const feedback = h('div', { class: 'pss-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const pic = h('div', { class: 'pss-pic' });
    const model = h('div', { class: 'pss-model', hidden: true });
    const choices = h('div', { class: 'pss-choices' });
    const hintBtn = h(
      'button',
      { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' },
      iconImg('bulb', '', 22),
      h('span', { text: 'Hint' }),
      h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }),
    ) as HTMLButtonElement;
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' }) as HTMLButtonElement;
    const face = h('img', { class: 'pss-host', src: who.portrait('smile'), alt: who.name, width: 64, height: 64 });
    const title = kind === 'test' ? `Water test: ${STRETCH_INFO[station].name}` : `Squad Journal: ${STRETCH_INFO[station].name}`;
    const root = h(
      'div',
      { class: `panel modal pss-panel pss-${station}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'pss-title' },
      h(
        'header',
        {},
        h('h2', { id: 'pss-title', text: title }),
        h(
          'div',
          { class: 'pss-head-right' },
          level,
          stars,
          h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }),
        ),
      ),
      h('div', { class: 'pss-ask' }, face, prompt, speakBtn),
      h('div', { class: 'pss-body' }, pic, model),
      choices,
      feedback,
      h('footer', { class: 'pss-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closePanel(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = {
      modal,
      station,
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
    const st = pnl.station;
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
    pnl.pic.replaceChildren(this.buildPic(q));
    pnl.choices.replaceChildren(
      h(
        'div',
        { class: 'pss-options' },
        ...q.choices.map((c, i) =>
          h(
            'button',
            { class: 'btn pss-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), 'aria-label': `${i + 1}: ${c.label}`, onclick: () => this.pick(c) },
            h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
            h('span', { class: 'pss-choice-text', text: c.label }),
          ),
        ),
      ),
    );
    this.renderStars();
    speak(`${q.ask} ${q.choices.map((c, i) => `${i + 1}: ${c.label}.`).join(' ')}`);
    requestAnimationFrame(() => pnl.choices.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
  }

  private tag(text: string, x: number, y: number, cls = ''): HTMLElement {
    return h('span', { class: `pss-tag${cls ? ` ${cls}` : ''}`, style: `left:${x * 100}%;top:${y * 100}%`, text });
  }

  private buildPic(q: Question): HTMLElement {
    const p = q.pic;
    if (p.k === 'bars') {
      const n = p.vals.length;
      return h(
        'div',
        { class: 'pss-sky' },
        pix(`bars-${q.id}`, () => paintBars(p.vals, p.labels, p.unit, p.mark), 2, `A bar graph of the ${p.unit}: ${p.labels.map((l, i) => `${l} ${p.vals[i]}`).join(', ')}.`),
        ...p.labels.map((l, i) => this.tag(l, (36 + i * Math.floor(120 / n) + (Math.floor(120 / n) - 8) / 2) / 176, 0.86, 'small')),
        this.tag(p.unit, 0.02, 0.0, 'small'),
        p.mark !== undefined ? this.tag(p.markLabel ?? 'Net on', (32 + p.mark * Math.floor(120 / n) - 4) / 176, 0.0, 'small mark') : null,
      );
    }
    return h(
      'div',
      { class: 'pss-sky' },
      pix(`scene-${p.s}`, () => paintScene(p.s), 2, SCENE_ALT[p.s] ?? ''),
    );
  }

  private renderModel(): void {
    const pnl = this.panel!;
    const q = pnl.q;
    const show = (...els: HTMLElement[]) => {
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('div', { class: 'pss-row pss-model-row' }, ...els));
    };
    if (q.model === 'path')
      show(
        h(
          'div',
          { class: 'pss-sky' },
          pix('model-path', () => paintPath(null), 1.6, 'The path trash takes: from the town, into a street drain, down the river, onto the beach and into the sea'),
          this.tag('Town', 0.12, 0.05, 'small'),
          this.tag('Drain', 0.32, 0.25, 'small'),
          this.tag('River', 0.55, 0.42, 'small'),
          this.tag('Beach', 0.72, 0.55, 'small'),
          this.tag('Sea', 0.9, 0.62, 'small'),
        ),
      );
    else if (q.model === 'bins')
      show(
        h(
          'div',
          { class: 'pss-sky' },
          pix('model-bins', () => paintBins4(), 1.6, 'The four bins: recycling, compost, trash and hazardous waste'),
          ...BINS.map((b, i) => this.tag(BIN_NAME[b], (22 + i * 44) / 176, 0.9, 'small')),
        ),
      );
    else if (q.model === 'loop')
      show(
        h(
          'div',
          { class: 'pss-sky' },
          pix('model-loop', () => paintLoop(), 1.6, 'The engineering loop: problem, design, test, improve'),
          this.tag('1 Problem', 0.5, 0.0, 'small'),
          this.tag('2 Design', 0.84, 0.42, 'small'),
          this.tag('3 Test', 0.5, 0.86, 'small'),
          this.tag('4 Improve', 0.12, 0.42, 'small'),
        ),
      );
    else {
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('p', { class: 'pss-model-fact', text: q.hints[1] }));
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
      tierChange = recordAnswer(this.save.learner, pnl.station, { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
    }
    const st = pnl.station;
    this.save.played[st]++;
    pnl.rightNow++;
    if (pnl.kind === 'test') this.save.tests[st] = Math.max(this.save.tests[st], pnl.rightNow);
    if (clean && this.save.stars[st] < STARS_PER_STRETCH) this.save.stars[st]++;
    this.persist();
    if (clean) audio.itemGet();
    else audio.correct();
    const msg = clean ? `${praise(this.praiseCount++)} You win a star.` : 'You got it! Stars are for getting it right the first time.';
    this.showFeedback(`${msg} ${q.explain}`, 'good');
    pnl.next.hidden = false;
    pnl.hintBtn.disabled = true;
    btn?.classList.add('right');
    pnl.choices.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
    pnl.model.hidden = true;
    this.renderStars();
    if (tierChange > 0) toast('Level up! Trickier questions.', 'reward');
    requestAnimationFrame(() => pnl.next.focus());
  }

  private onWrong(btn: HTMLButtonElement | null, c: Choice): void {
    const pnl = this.panel!;
    pnl.tries++;
    if (!pnl.recorded) {
      pnl.recorded = true;
      const o = recordAnswer(this.save.learner, pnl.station, { correct: false, hintRung: pnl.hintRung, misconception: (c.misconception ?? null) as Misconception | null }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let’s practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(`Not quite. ${c.why ?? ''}`, 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.choices.querySelector<HTMLButtonElement>('.pss-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `pss-feedback ${kind}`;
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
    if (k >= 2) this.renderModel();
    if (k >= 3) pnl.choices.querySelector(`[data-value="${CSS.escape(q.choices.find((c) => c.correct)!.value)}"]`)?.classList.add('worked');
    const text = k === 1 ? q.hints[0] : k === 2 ? q.hints[1] : `The answer is outlined. ${q.explain}`;
    this.showFeedback(`Hint ${k} of 3: ${text}`, 'hint');
  }

  private renderStars(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const n = this.save.stars[pnl.station];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_STRETCH }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_STRETCH} stars`);
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    const st = pnl.station;
    const sv = this.save;
    if (pnl.kind === 'test' && pnl.rightNow >= TEST_RIGHT) {
      pnl.modal.close();
      void this.afterTest(st);
      return;
    }
    const rec = skill(sv.learner, st);
    const both = stretchLevels(st).every((l) => sv.levelsDone.includes(l.id));
    const ready = sv.stars[st] >= STARS_PER_STRETCH && (rec.tier >= 2 || sv.played[st] >= MAX_PER_STRETCH);
    if (ready && both && !sv.done.includes(st)) {
      pnl.modal.close();
      void this.finishStretch(st);
    } else this.nextQuestion();
  }

  private async afterTest(s: Station): Promise<void> {
    const l2 = stretchLevels(s)[1];
    await this.busy(() => this.talk.say(this.speakers.marisol, `Water test done! ${l2.name} is open now.`, 'proud'));
    const go = await choose(this.host, `${STRETCH_INFO[s].name}: ${l2.name}`, 'Play the next level now?', [
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
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.pss-choice')[Number(k) - 1];
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

  private async finishStretch(s: Station): Promise<void> {
    const info = STRETCH_INFO[s];
    const who = this.speakers[info.host];
    await this.busy(async () => {
      audio.play('camp');
      await this.talk.say(who, 'Five stars! Before we finish, one question to talk through.', 'proud');
      const res = await this.talk.ask(who, info.debrief, () => audio.hint());
      recordAnswer(this.save.learner, `${s}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
      this.save.done.push(s);
      this.persist();
      audio.levelUp();
      toast(`${info.badge}!`, 'reward');
      await this.talk.say(who, info.done, 'proud');
    });
    if (OPEN_STRETCHES.every((x) => this.save.done.includes(x)) && !this.save.finaleSeen) await this.bigRain();
  }

  // ------------------------------------------------------------ the finale: The Big Rain and Clean Coast Day

  /** The storm follows the water from the hills to the sea past every fix, then Clean Coast Day and the hatchlings. */
  private async bigRain(): Promise<void> {
    if (this.play) this.play.paused = true;
    this.mode = 'busy';
    audio.play('finale');
    const img = h('canvas', { class: 'pss-finale-pic', width: FW, height: FH, role: 'img' }) as HTMLCanvasElement;
    const ctx = img.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const who = h('strong', { class: 'pss-finale-who' });
    const line = h('p', { class: 'pss-finale-line', 'aria-live': 'polite' });
    const count = h('span', { class: 'pss-level' });
    const next = h('button', { class: 'btn primary', type: 'button', 'data-autofocus': true, text: 'Next' }) as HTMLButtonElement;
    const root = h(
      'div',
      { class: 'panel modal pss-finale', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'finale-title' },
      h('header', {}, h('h2', { id: 'finale-title', text: 'The Big Rain' }), count),
      h('div', { class: 'content' }, img, h('div', { class: 'pss-finale-text' }, who, line), h('div', { class: 'pss-row' }, next)),
    );
    let i = 0;
    let raf = 0;
    let frame = 0;
    const frames = new Map<string, HTMLCanvasElement>();
    const draw = () => {
      frame++;
      const f = Math.floor(frame / 10) % 8;
      const key = `${i}-${f}`;
      let c = frames.get(key);
      if (!c) frames.set(key, (c = paintFinale(i, f).toCanvas(1)));
      ctx.drawImage(c, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    const titles = ['The Big Rain', 'The Big Rain', 'The Big Rain', 'The Big Rain', 'The Big Rain', 'The morning after', 'Clean Coast Day', 'Hatchling night'];
    const ALT = [
      'Rain pouring onto the houses and the green fields of the valley',
      'Rain on a green field, a wide strip of tall plants and clear water in the river',
      'Rain on the houses, the rain garden full of water, a marked storm drain and the mill with its filter and clean steam',
      'Rain on the wetland: tall reeds, fish swimming in clear water, and a heron',
      'Rain on the harbor: the patched fishing boat and the net bin on the dock',
      'Turtle Beach the morning after the storm, clean, with the drain net in place',
      'The Squad, Rosa, Dr. Wen and townsfolk on the clean beach under the Squad flag',
      'Night on the beach: amber lights, and turtle hatchlings crawling toward the moonlit sea',
    ];
    const show = () => {
      const b = BIG_RAIN[i];
      const p = PEOPLE[b.who];
      who.textContent = p.name;
      line.textContent = b.text;
      count.textContent = `${i + 1} of ${BIG_RAIN.length}`;
      (root.querySelector('#finale-title') as HTMLElement).textContent = titles[i] ?? 'The Big Rain';
      img.setAttribute('aria-label', ALT[i] ?? '');
      next.textContent = i === BIG_RAIN.length - 1 ? 'The end' : 'Next';
      speak(`${p.name}. ${b.text}`);
    };
    await new Promise<void>((resolve) => {
      const modal = new Modal(this.host, root, () => {
        cancelAnimationFrame(raf);
        stopSpeaking();
        resolve();
      });
      next.addEventListener('click', () => {
        if (i < BIG_RAIN.length - 1) {
          i++;
          show();
        } else modal.close();
      });
      show();
      draw();
    });
    const first = !this.save.finaleSeen;
    this.save.finaleSeen = true;
    this.persist();
    await this.busy(async () => {
      audio.play('camp');
      if (first) {
        audio.levelUp();
        toast('Clean Coast badge!', 'reward');
      }
      await this.talk.say(this.speakers.marisol, FINALE_END, 'proud');
    });
    if (first) window.parent?.postMessage({ type: 'game-complete', score: OPEN_STRETCHES.reduce((n, x) => n + this.save.stars[x], 0) }, '*');
  }

  // ------------------------------------------------------------ the Squad Journal (pages and badges)

  private openJournal(): void {
    if (this.mode !== 'camp' && this.mode !== 'level') return;
    const sv = this.save;
    const badges = OPEN_STRETCHES.filter((s) => sv.done.includes(s)).map((s) => STRETCH_INFO[s].badge);
    const step = this.nextStep();
    const trashCard = (id: TrashId) =>
      sv.found.includes(id)
        ? h(
            'div',
            { class: 'pss-page' },
            pix(`j-${id}`, () => paintTrash(id, 24), 2, ''),
            h('div', {}, h('strong', { text: TRASH[id].name }), h('p', { text: TRASH[id].material })),
          )
        : h('div', { class: 'pss-page' }, h('div', { class: 'pss-guide-empty', text: '?' }), h('p', { text: 'Not found yet.' }));
    const fixes = (Object.keys(RECIPES) as RecipeId[]).filter((r) => (sv.tried[r]?.length ?? 0) > 0);
    const fixCard = (r: RecipeId) => {
      const best = RECIPES[r].designs.find((d) => d.outcome === 'works')!;
      const tried = sv.tried[r] ?? [];
      return h(
        'div',
        { class: 'pss-page' },
        pix(`jf-${r}`, () => designPic(r, sv.built.includes(r) ? best.id : tried[0]), 2, ''),
        h(
          'div',
          {},
          h('strong', { text: RECIPES[r].name }),
          h('p', { text: `Designs tried: ${tried.map((d) => RECIPES[r].designs.find((x) => x.id === d)!.name.toLowerCase()).join(', ')}.` }),
          h('p', { text: sv.built.includes(r) ? `Works: ${best.name.toLowerCase()}.` : 'Not working yet.' }),
        ),
      );
    };
    const visitorCard = (v: VisitorId) =>
      h(
        'div',
        { class: 'pss-page' },
        pix(`jv-${v}`, () => paintVisitor(v, 24, 0), 3, ''),
        h('div', {}, h('strong', { text: VISITOR_NAME[v] }), h('p', { text: VISITOR_NEEDS[v].fact })),
      );
    const root = h(
      'div',
      { class: 'panel modal pss-guide', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'journal-title' },
      h(
        'header',
        {},
        h('h2', { id: 'journal-title', text: 'Squad Journal' }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h('p', {
          class: 'small-note',
          style: 'margin:0',
          text: `Stars: ${OPEN_STRETCHES.map((s) => `${STRETCH_INFO[s].name} ${sv.stars[s]}/${STARS_PER_STRETCH}`).join(', ')}. Sorted: ${sv.sortedRight} of ${sv.sorted} right first time.`,
        }),
        h(
          'div',
          { class: 'pss-badges' },
          ...(badges.length ? badges.map((b) => h('span', { class: 'pss-badge', text: b })) : [h('span', { class: 'small-note', text: 'No badges yet. Finish a stretch of the coast.' })]),
        ),
        step && step.kind !== 'level' && this.mode === 'camp'
          ? h('button', {
              class: 'btn primary',
              type: 'button',
              text: step.kind === 'test' ? 'Take the water test' : `Answer the ${STRETCH_INFO[step.station].name} questions`,
              onclick: () => {
                modal.close();
                this.openPanel(step.station, step.kind);
              },
            })
          : null,
        h('h3', { text: 'Trash found', style: 'margin:12px 0 6px' }),
        h('div', { class: 'pss-guide-grid' }, ...TRASH_IDS.filter((id) => id !== 'tire').map(trashCard)),
        h('h3', { text: 'Fixes', style: 'margin:12px 0 6px' }),
        fixes.length ? h('div', { class: 'pss-guide-grid' }, ...fixes.map(fixCard)) : h('p', { class: 'small-note', text: 'Build a fix at a blueprint stake and it will appear here.' }),
        h('h3', { text: 'Nature Center visitors', style: 'margin:12px 0 6px' }),
        sv.visitors.length
          ? h('div', { class: 'pss-guide-grid' }, ...sv.visitors.map(visitorCard))
          : h('p', { class: 'small-note', text: 'Build in the Nature Center next to camp, and see who comes to visit.' }),
      ),
    );
    const modal = new Modal(this.host, root);
    this.pauseFor(modal);
  }

  // ------------------------------------------------------------ HUD, settings, grown-ups

  private buildHud(): void {
    this.hud = h('div', { class: 'hud pss-tools', hidden: true });
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'map', label: 'Map', icon: 'scroll', key: 'J', onClick: () => this.openMap() },
      { id: 'journal', label: 'Journal', icon: 'star', key: 'B', onClick: () => this.openJournal() },
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
    if (this.play?.isBuilding) {
      this.play.leaveBuild();
      return;
    }
    const m = openSettings(this.host, {
      changeLook: () => this.customize(false, () => undefined),
      grownups: () => this.openGrownups(),
      resetSave: async () => {
        const ok = await choose(this.host, 'Start over?', 'This erases your Squad Journal, backpack and Nature Center in this browser. Settings are kept.', [
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
    const rows = OPEN_STRETCHES.map((s) => {
      const rec = sv.learner[s];
      const mis = topMisconception(rec) ?? topMisconception(sv.learner[`${s}-talk`]);
      const lv = stretchLevels(s).filter((l) => sv.levelsDone.includes(l.id)).length;
      const status = sv.done.includes(s) ? 'Done' : !this.stretchOpen(s) ? 'Not open yet' : `${lv} of 2 levels, ${sv.stars[s]} of ${STARS_PER_STRETCH} stars`;
      return row(`${STRETCH_INFO[s].name} (${STRETCH_INFO[s].skill.toLowerCase()})`, status, rec, mis);
    });
    rows.push(row('Sorting station (recycling, compost, trash, hazardous waste)', `${sv.sorted} sorted`, sv.learner.sort, topMisconception(sv.learner.sort)));
    const tried = Object.values(sv.tried).reduce((n, l) => n + (l?.length ?? 0), 0);
    return h(
      'div',
      {},
      h('p', {
        text: `This summary is kept only in this browser. Stretches finished: ${sv.done.length} of 4.${sv.finaleSeen ? ' The Big Rain finale is done.' : ''} Levels reached the flag on: ${sv.levelsDone.length} of ${LEVELS.length}. Fixes built that work: ${sv.built.length} (designs tried: ${tried}). Kinds of trash found: ${sv.found.length}. Nature Center pieces: ${sv.nature.length}; visitors: ${sv.visitors.length}.${sv.easy ? ' Easy jumps are on.' : ''}`,
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
      stars: { ...this.save.stars },
      tests: { ...this.save.tests },
      done: [...this.save.done],
      finaleSeen: this.save.finaleSeen,
      bag: { ...this.save.bag },
      found: [...this.save.found],
      built: [...this.save.built],
      tried: { ...this.save.tried },
      ollie: this.save.ollie,
      sorted: this.save.sorted,
      sortedRight: this.save.sortedRight,
      sorting: this.sorting ? { item: this.sorting.items[this.sorting.i], left: this.sorting.items.length - this.sorting.i, right: binFor(this.sorting.items[this.sorting.i]) } : null,
      nature: this.save.nature.length,
      visitors: [...this.save.visitors],
      easy: this.save.easy,
      next: (() => {
        const s = this.nextStep();
        return s ? (s.kind === 'level' ? `level:${s.level.id}` : `${s.kind}:${s.station}`) : null;
      })(),
      lastFinish: this.lastFinish,
      panel:
        pnl && q
          ? {
              station: pnl.station,
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

const SCENE_ALT: Record<string, string> = {
  turtle: 'A sea turtle swimming, a plastic bag floating in the water, and a jellyfish. The bag and the jellyfish look alike.',
  shell: 'A pink shell and a red plastic bottle cap on the sand',
  can: 'An empty drink can on the sand',
  peel: 'A banana peel on the sand',
  battery: 'An old battery on the sand',
  'bottle-years': 'A plastic bottle on the sand, then broken into pieces, then into tiny bits',
  refill: 'One refillable water bottle, and a pile of single-use plastic bottles',
  yogurt: 'A yogurt pot with old yogurt inside and the recycling arrows on its side',
  ring: 'A six-pack ring in one piece, and one cut apart',
  drain: 'A storm drain in the curb with a fish and a line painted beside it',
  'beach-again': 'The beach on Monday, clean, and on Tuesday, with trash again',
  nets: 'Three nets across the drain pipe: big holes, tiny holes and medium holes',
  blocked: 'A net with tiny holes across the drain pipe, blocked with leaves, with the water spilling over the top',
  families: 'A row of houses, each with a bag of picked-up litter outside',
  'oil-glass': 'A glass of water with a yellow layer of oil floating on top',
  feather: 'A clean white feather, and a grey feather clumped with oil',
  boat: 'A fishing boat in the harbor with fuel dripping from its tank, and a dark patch of oil on the water',
  ghost: 'An old green fishing net caught on the rocks, and a sea turtle swimming nearby',
  boom: 'A ring of floats on a rope around a dark patch of oil on the water',
  pads: 'Three white pads on the dock, soaked grey with oil',
  spread: 'A small drop of oil on the water, then a wider patch, then a wide, thin layer with a rainbow shine',
  bottles: 'A sealed bottle floating on the water, and an open bottle sunk below it',
  patches: 'Three fixes on a tank: tape peeling off, a bucket full of fuel, and a metal patch',
  netbin: 'A green slatted bin with a lid on the dock, full of old nets',
  soap: 'A bowl of soapy water, with the oil broken into tiny drops and bubbles',
  park: 'The path from the town on the hill: a street drain, the river, the beach and the sea, with trash along the way',
  rivermouth: 'The town on the hill, the river flowing down to the harbor, and the sea',
  booms: 'Three booms: a plain rope under the water, open bottles sinking, and sealed bottles floating',
  skirt: 'A boom of floats with a curtain hanging down under the water',
  'harbor-people': 'Rafi, townsfolk, Marisol and Rosa standing together on the dock',
  'reeds-clean': 'Brown, muddy water flowing into a clump of reeds, and clear water flowing out the other side',
  sponge: 'Storm rain falling on a wetland full of reeds, soaking into the ground, with houses safe beside it',
  muddy: 'Sunlight shining down into clear water to green plants, and stopping near the top of brown, muddy water above brown plants',
  gasp: 'Three fish with their mouths open at the surface of thick green water',
  nursery: 'Reeds in clear water, with young fish, frog eggs and a frog among them',
  reeds: 'Tall reeds and brown cattails growing in shallow water',
  'green-pond': 'A pond covered in a thick green layer, a fish gasping, and a sack of fertilizer beside a field',
  'two-glasses': 'Two glasses of clear water that look the same, each with a test strip: one green, one red',
  fertilizer: 'A sack of fertilizer by a field of crops, with an arrow down to a green river',
  channel: 'Trash piled in a channel, blocking the water from flowing into the reeds',
  filters: 'Three filters: sand on top, everything mixed, and stones, gravel and sand from top to bottom',
  'heron-fish': 'A heron standing by a green pond, and fish swimming away from it',
  'bare-field': 'Rain on a bare, plowed field, with brown water running off it into the river',
  'mill-bus': 'The mill with smoke pouring from its chimney, and a bus waiting with smoke from its engine',
  buffer: 'A field of crops, then a wide strip of tall plants, then the river',
  'cover-crop': 'A bare field on the left, and a field covered in a green cover crop on the right',
  'rain-garden': 'Rain on a house, with an arrow to a low garden full of plants collecting the water',
  barrel: 'A house with a rain barrel under the gutter',
  mills: 'Three chimneys: a very tall one with smoke, a white one with smoke, and one with a filter and only a little steam',
  council: 'Rosa, townsfolk, Dr. Wen and Marisol standing together',
  valley: 'The valley from the hills to the sea: the town, a street drain, the river, the beach and the sea, with arrows downhill',
};
