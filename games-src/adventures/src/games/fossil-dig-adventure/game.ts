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
import '../../kit/worlds/wild-lands/wild.css';
import { RANGER_TALA } from '../../kit/worlds/wild-lands/art';
import { HANA_SATO, MATEO_RUIZ, SAM_BELLO, SKELETON_PARTS, paintFossil, paintPebblePortrait, paintSkeleton, type FossilId, type SkeletonPart } from '../../kit/worlds/wild-lands/dig-art';
import { paintCliffView, paintQuarryView, sampleQuarry } from '../../kit/worlds/wild-lands/dig-views';
import { paintBadge, paintDrawerIcon, paintFormStep, paintMatch, paintStack, paintTools } from './art';
import { openCliff, type CliffHandle } from './cliffUi';
import {
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  GROWNUPS,
  HALF_DONE,
  JACKET,
  LOCKED,
  OPENING,
  OPENING_END,
  PEBBLE,
  PEBBLE_HELLO,
  PEOPLE,
  praise,
  STARS_PER_STATION,
  STATION_INFO,
  type PersonId,
} from './content';
import { CLIFF_FINDS, DRAWER_ORDER, FOSSILS, LAYER_INFO, LAYERS, QUARRY_FINDS, type LayerId } from './fossils';
import { CAMP_SONG, DIG_SONG, LAB_SONG } from './music';
import { pix } from './pix';
import { bank, makeQuestion, shuffle, STATIONS, type Choice, type Misconception, type Question, type Station, type Tier } from './problems';
import { openQuarry, type QuarryHandle } from './quarryUi';
import { freshSave, store, type DigSave } from './save';
import { DigWorld, type Target } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_STATION = 12;
/** Finds hidden in one quarry square. */
const FINDS_PER_DIG = 4;
/** Fossils to place at the cliff, each time. */
const CLIFF_FOSSILS = 3;

const LOOKS: Record<PersonId, Look16> = { mateo: MATEO_RUIZ, hana: HANA_SATO, sam: SAM_BELLO, tala: RANGER_TALA };
const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };
/** Who runs each station. */
const HOST: Record<Station, PersonId> = { quarry: 'mateo', cliff: 'hana' };
/** The skeleton piece each station gives to the field museum (the Prep Lab and the Trackway give the rest in the next part). */
const PIECE: Record<Station, SkeletonPart> = { quarry: 'skull', cliff: 'backbone' };
/** The four stations of the whole game, for the badges (the last two open in the next part). */
const ALL_STATIONS = ['quarry', 'cliff', 'lab', 'trackway'] as const;
const ALL_NAMES: Record<(typeof ALL_STATIONS)[number], string> = { quarry: 'The Quarry', cliff: 'The Cliff Wall', lab: 'The Prep Lab', trackway: 'The Trackway' };
const FORM_STEPS = ['Alive', 'Buried in mud', 'Turned to stone', 'Uncovered'];

type Mode = 'title' | 'world' | 'busy' | 'panel' | 'job';

interface Panel {
  modal: Modal;
  station: Station;
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

export class Game {
  private readonly world: DigWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: DigSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private badgeEl!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<PersonId | 'pebble', Speaker>;
  private panel: Panel | null = null;
  private quarry: QuarryHandle | null = null;
  private cliff: CliffHandle | null = null;
  private praiseCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-wild');
    this.save = store.exists() ? store.load() : freshSave();
    this.world = new DigWorld(host);
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
      mateo: speaker('mateo', 150),
      hana: speaker('hana', 220),
      sam: speaker('sam', 180),
      tala: speaker('tala', 160),
      pebble: {
        name: PEBBLE.name,
        role: PEBBLE.role,
        voice: 300,
        portrait: (e: Expression) => {
          const key = `pebble-${e === 'thinking' ? 0 : 1}`;
          let u = cache.get(key);
          if (!u) cache.set(key, (u = paintPebblePortrait(e !== 'thinking').toDataURL(2)));
          return u;
        },
      },
    };
    audio.addSong('camp', CAMP_SONG);
    audio.addSong('dig', DIG_SONG);
    audio.addSong('lab', LAB_SONG);
    this.world.onArrive = (t) => this.use(t);
    window.addEventListener('resize', () => this.world.resize());
    this.world.stage.canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
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
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) this.onPanelKey(e);
    });
    (window as unknown as { __fda: unknown }).__fda = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      teleport: (x: number, y: number) => this.world.placePlayer(x, y),
      open: (s: Station) => this.mode === 'world' && this.openPanel(s),
      setTier: (s: string, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      dig: () => this.mode === 'world' && this.startDig(),
      /** In the dig: dig a square right down with the right tools (the brush last). */
      digOut: (i: number) => {
        const q = this.quarry;
        if (!q) return null;
        const out = [];
        while (q.dig.cells[i].left > 0) out.push(q.use(i, q.dig.cells[i].left === 3 ? 'shovel' : q.dig.cells[i].left === 2 ? 'pick' : 'brush'));
        return out;
      },
      digWith: (i: number, tool: 'shovel' | 'pick' | 'brush') => this.quarry?.use(i, tool) ?? null,
      quarry: () => (this.quarry ? this.quarry.dig : null),
      cliff: () => this.mode === 'world' && this.startCliff(),
      cliffState: () => this.cliff?.state() ?? null,
      /** Open one question by its id (for screenshots). */
      ask: (s: Station, id: string) => {
        const d = bank(s).find((x) => x.id === id);
        if (!d || this.mode !== 'world') return false;
        skill(this.save.learner, s).tier = d.tier;
        this.save.recent[s] = bank(s)
          .filter((x) => x.id !== id)
          .map((x) => x.id);
        this.openPanel(s);
        return true;
      },
      drawer: () => this.mode === 'world' && this.openDrawer(),
      evening: () => this.world.setTime('evening'),
      /** The walkable map, one row per line ('#' blocked). */
      map: () => this.world.debugMap(),
    };
  }

  start(): void {
    const names = Object.fromEntries((Object.keys(PEOPLE) as PersonId[]).map((id) => [id, PEOPLE[id].name])) as Record<PersonId, string>;
    this.world.build(this.playerLook(), LOOKS, names);
    this.updateMarkers();
    this.world.establishing = true;
    this.world.follow();
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.input.worldActive = this.mode === 'world' && !document.querySelector('.modal-back') && !this.talk.isOpen;
      this.world.establishing = this.mode === 'title' || (!this.save.openingSeen && this.mode === 'busy');
      this.world.update(dt, this.mode === 'world' ? this.input : null);
      this.updatePrompt();
      this.world.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private playerLook(): Look16 {
    return look16FromAppearance(this.save.appearance);
  }

  private get halfDone(): boolean {
    return STATIONS.every((s) => this.save.done.includes(s));
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Fossil Dig Adventure',
      subtitle: 'Dig up the story in the rocks',
      intro: [
        'Join Dr. Mateo Ruiz, Hana Sato and Pebble the sniffer dog at a fossil dig in a dry, striped valley. Dig for fossils with the right tools, read the rock layers of a tall cliff, and fill the Fossil Drawer.',
        'For grades 3 to 5. Every line can be read aloud.',
      ],
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
        noun: 'fossil hunter',
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your fossils and stars in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
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
    audio.play('camp');
    this.renderHud();
    if (!this.save.openingSeen) void this.opening();
  }

  private async opening(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers.tala, OPENING);
    await this.talk.say(this.speakers.pebble, PEBBLE_HELLO, 'smile');
    await this.talk.say(this.speakers.tala, OPENING_END, 'proud');
    await this.talk.say(this.speakers.tala, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
  }

  /** Is this station open (the one before it is finished)? */
  private isOpen(s: Station): boolean {
    const i = STATIONS.indexOf(s);
    return i === 0 || this.save.done.includes(STATIONS[i - 1]);
  }

  /** A station with something to do next: open and not finished. */
  private needsYou(s: Station): boolean {
    return this.isOpen(s) && !this.save.done.includes(s);
  }

  private updateMarkers(): void {
    this.world.setMarkers({
      mateo: this.needsYou('quarry') ? 'new' : null,
      hana: this.needsYou('cliff') ? 'new' : null,
      tala: this.halfDone && !this.save.halfDoneSeen ? 'new' : null,
    });
  }

  // ------------------------------------------------------------ the dig site

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
    const s = this.world.screenOf(t, 2.9);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel(t.id === 'museum' ? 'Look' : 'Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'panel' || this.mode === 'job') return;
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
      const s = this.world.screenOf(t, 1.0);
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
    if (t.id === 'mateo') void this.talkToHost('quarry');
    else if (t.id === 'hana') void this.talkToHost('cliff');
    else if (t.id === 'tala') void this.talkToTala();
    else if (t.id === 'sam') void this.sayOnce(this.speakers.sam, LOCKED.sam);
    else void this.sayOnce(this.speakers.tala, LOCKED.museum);
  }

  private async sayOnce(who: Speaker, text: string | string[]): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(who, text);
    this.talk.end();
    this.mode = 'world';
  }

  /** Dr. Mateo at the quarry, or Hana at the cliff. */
  private async talkToHost(st: Station): Promise<void> {
    const who = this.speakers[HOST[st]];
    const sv = this.save;
    const info = STATION_INFO[st];
    if (!this.isOpen(st)) return this.sayOnce(who, LOCKED.cliff);
    this.mode = 'busy';
    // the first time: the intro, then straight into the hands-on job
    if (!sv.introduced.includes(st)) {
      await this.talk.say(who, info.intro);
      sv.introduced.push(st);
      this.persist();
      this.talk.end();
      this.mode = 'world';
      this.startJob(st);
      return;
    }
    const worked = sv.worked.includes(st);
    const done = sv.done.includes(st);
    const job = st === 'quarry' ? 'Dig a new square' : 'Rebuild the cliff';
    const options: Array<{ label: string; run: () => void }> = [];
    if (worked && !done) options.push({ label: 'Write up the logbook', run: () => this.openPanel(st) });
    options.push({ label: job, run: () => this.startJob(st) });
    if (done) options.push({ label: 'Logbook practice', run: () => this.openPanel(st) });
    options.push({ label: 'Not now', run: () => undefined });
    const text = !worked ? info.again : !done ? `${info.logbook}` : info.again;
    const i = await this.talk.offer(
      who,
      text,
      options.map((o) => o.label),
    );
    this.talk.end();
    this.mode = 'world';
    options[i].run();
  }

  private async talkToTala(): Promise<void> {
    this.mode = 'busy';
    const tala = this.speakers.tala;
    const sv = this.save;
    if (this.halfDone && !sv.halfDoneSeen) {
      await this.talk.say(tala, HALF_DONE, 'proud');
      sv.halfDoneSeen = true;
      this.persist();
      this.updateMarkers();
    }
    const tip = !sv.worked.includes('quarry')
      ? 'Dr. Mateo is waiting by the quarry, in the middle of the camp.'
      : !sv.done.includes('quarry')
        ? 'Dr. Mateo has the quarry logbook ready. Five stars finishes the Quarry.'
        : !sv.done.includes('cliff')
          ? 'Hana is at the Cliff Wall, on the left. The cliff tells the story of this valley.'
          : 'The quarry always has more to find. Can you fill the whole Fossil Drawer?';
    const options = ['Open the Fossil Drawer', 'Change how I look', 'Not now'];
    const pick = options[await this.talk.offer(tala, tip, options)];
    this.talk.end();
    this.mode = 'world';
    if (pick === options[0]) this.openDrawer();
    else if (pick === options[1]) this.customize(false, () => undefined);
  }

  // ------------------------------------------------------------ the hands-on jobs

  private startJob(st: Station): void {
    if (st === 'quarry') this.startDig();
    else this.startCliff();
  }

  /** Pick `n` fossils from `pool`, ones not yet in the drawer first. */
  private pickFinds(pool: FossilId[], n: number): FossilId[] {
    const r = mulberry32(this.save.seed++);
    const have = new Set(this.save.drawer.map((f) => f.id));
    const fresh = shuffle(
      r,
      pool.filter((id) => !have.has(id)),
    );
    const old = shuffle(
      r,
      pool.filter((id) => have.has(id)),
    );
    return [...fresh, ...old].slice(0, n);
  }

  /** Into the Fossil Drawer (a clean find replaces a chipped one). */
  private addToDrawer(id: FossilId, chipped: boolean, where: string): boolean {
    const had = this.save.drawer.find((f) => f.id === id);
    if (!had) this.save.drawer.push({ id, chipped, where });
    else if (had.chipped && !chipped) Object.assign(had, { chipped: false, where });
    this.persist();
    return !had;
  }

  private startDig(): void {
    this.mode = 'job';
    this.touch?.setVisible(false);
    this.promptEl.hidden = true;
    audio.play('dig');
    const finds: Array<{ id: FossilId; chipped: boolean; isNew: boolean; where: string }> = [];
    let finished = false;
    this.quarry = openQuarry(this.host, {
      finds: this.pickFinds(QUARRY_FINDS, FINDS_PER_DIG),
      seed: this.save.seed++,
      onFind: (id, chipped, square) => {
        const isNew = this.addToDrawer(id, chipped, square);
        finds.push({ id, chipped, isNew, where: square });
        recordAnswer(this.save.learner, 'quarry-dig', { correct: !chipped, hintRung: 0, misconception: chipped ? 'rough-tools' : null }, RULES);
        this.persist();
      },
      onSlip: () => undefined,
      onDone: () => {
        finished = true;
        this.quarry?.modal.close();
      },
      onClose: () => {
        this.quarry = null;
        void this.afterDig(finished, finds);
      },
    });
  }

  private async afterDig(finished: boolean, finds: Array<{ id: FossilId; chipped: boolean; isNew: boolean; where: string }>): Promise<void> {
    audio.play('camp');
    const sv = this.save;
    if (!finished) {
      this.backToWorld();
      return;
    }
    sv.digs++;
    const first = !sv.worked.includes('quarry');
    if (first) sv.worked.push('quarry');
    this.persist();
    await this.showFinds('Your finds from the quarry', finds);
    this.mode = 'busy';
    const mateo = this.speakers.mateo;
    if (first) await this.talk.say(mateo, JACKET, 'smile');
    if (!sv.done.includes('quarry')) {
      await this.talk.say(mateo, STATION_INFO.quarry.logbook, 'smile');
      this.talk.end();
      this.backToWorld();
      this.openPanel('quarry');
      return;
    }
    await this.talk.say(mateo, 'Every find is safe in its plaster jacket. Thank you, fossil hunter!', 'smile');
    this.talk.end();
    this.backToWorld();
  }

  private startCliff(): void {
    this.mode = 'job';
    this.touch?.setVisible(false);
    this.promptEl.hidden = true;
    audio.play('lab');
    const placed: Array<{ id: FossilId; chipped: boolean; isNew: boolean; where: string }> = [];
    let result: { clean: number; total: number } | null = null;
    this.cliff = openCliff(this.host, {
      tier: skill(this.save.learner, 'cliff').tier as Tier,
      fossils: this.pickFinds(CLIFF_FINDS, CLIFF_FOSSILS),
      seed: this.save.seed++,
      onSlip: (m: Misconception) => {
        recordAnswer(this.save.learner, 'cliff-puzzle', { correct: false, hintRung: 0, misconception: m }, RULES);
        this.persist();
      },
      onPlace: (id) => {
        const isNew = this.addToDrawer(id, false, 'The Cliff Wall');
        placed.push({ id, chipped: false, isNew, where: 'The Cliff Wall' });
      },
      onDone: (clean, total) => {
        result = { clean, total };
        recordAnswer(this.save.learner, 'cliff-puzzle', { correct: clean === total, hintRung: 0 }, RULES);
        this.persist();
      },
      onClose: () => {
        this.cliff = null;
        void this.afterCliff(result, placed);
      },
    });
  }

  private async afterCliff(result: { clean: number; total: number } | null, placed: Array<{ id: FossilId; chipped: boolean; isNew: boolean; where: string }>): Promise<void> {
    audio.play('camp');
    const sv = this.save;
    if (!result) {
      if (placed.length) await this.showFinds('Fossils from the cliff', placed);
      this.backToWorld();
      return;
    }
    sv.cliffs++;
    if (!sv.worked.includes('cliff')) sv.worked.push('cliff');
    this.persist();
    await this.showFinds('Fossils from the cliff', placed);
    if (!sv.done.includes('cliff')) {
      this.mode = 'busy';
      await this.talk.say(this.speakers.hana, STATION_INFO.cliff.logbook, 'smile');
      this.talk.end();
      this.backToWorld();
      this.openPanel('cliff');
      return;
    }
    this.backToWorld();
  }

  private backToWorld(): void {
    this.mode = 'world';
    this.updateMarkers();
    this.renderHud();
    this.touch?.setVisible(touchControlsVisible());
  }

  /** The finds from a dig (or the cliff), each with its picture and first fact. */
  private showFinds(title: string, finds: Array<{ id: FossilId; chipped: boolean; isNew: boolean; where: string }>): Promise<void> {
    if (!finds.length) return Promise.resolve();
    this.mode = 'busy';
    audio.itemGet();
    return new Promise((resolve) => {
      const root = h(
        'div',
        { class: 'panel modal fda-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'finds-title', style: 'width:min(640px,100%)' },
        h('header', {}, h('h2', { id: 'finds-title', text: title })),
        h(
          'div',
          { class: 'content' },
          h(
            'ul',
            { class: 'belt-list' },
            ...finds.map((f) =>
              h(
                'li',
                { class: 'belt-row' },
                pix(`fossil-${f.id}`, () => paintFossil(f.id, 1.4), 2, FOSSILS[f.id].name),
                h(
                  'div',
                  { class: 'belt-info' },
                  h('strong', { text: `${FOSSILS[f.id].name}${f.isNew ? ' (new in the drawer!)' : ''}` }),
                  h('span', { text: `${f.where.length <= 2 ? `Square ${f.where}. ` : ''}${f.chipped ? 'Chipped, but still a great find. ' : ''}${FOSSILS[f.id].facts[0]}` }),
                ),
              ),
            ),
          ),
        ),
        h(
          'footer',
          { class: 'fda-foot' },
          h('span', { class: 'small-note', text: `In the Fossil Drawer: ${this.save.drawer.length} of ${DRAWER_ORDER.length}` }),
          h('button', { class: 'btn primary', type: 'button', text: 'Done', 'data-autofocus': true, onclick: () => modal.close() }),
        ),
      );
      const modal = new Modal(this.host, root, () => {
        stopSpeaking();
        resolve();
      });
      speak(finds.map((f) => `${FOSSILS[f.id].name}. ${FOSSILS[f.id].facts[0]}`).join(' '));
    });
  }

  // ------------------------------------------------------------ the logbook (the question panel)

  private openPanel(station: Station): void {
    const prevMode = this.mode;
    this.mode = 'panel';
    this.touch?.setVisible(false);
    audio.play('lab');
    const who = this.speakers[HOST[station]];
    const level = h('span', { class: 'fda-level' });
    const stars = h('span', { class: 'fda-stars', role: 'img' });
    const prompt = h('p', { class: 'fda-prompt' });
    const speakBtn = h('button', { class: 'btn small fda-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => speak(prompt.textContent ?? '', { force: true }));
    const feedback = h('div', { class: 'fda-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const pic = h('div', { class: 'fda-pic' });
    const model = h('div', { class: 'fda-model', hidden: true });
    const choices = h('div', { class: 'fda-choices' });
    const hintBtn = h(
      'button',
      { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' },
      iconImg('bulb', '', 22),
      h('span', { text: 'Hint' }),
      h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }),
    );
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' });
    const face = h('img', { class: 'fda-host', src: who.portrait('smile'), alt: who.name, width: 64, height: 64 });
    const root = h(
      'div',
      { class: `panel modal fda-panel fda-${station}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'fda-title' },
      h(
        'header',
        {},
        h('h2', { id: 'fda-title', text: `Logbook: ${STATION_INFO[station].name.toLowerCase()}` }),
        h(
          'div',
          { class: 'fda-head-right' },
          level,
          stars,
          h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }),
        ),
      ),
      h('div', { class: 'fda-ask' }, face, prompt, speakBtn),
      h('div', { class: 'fda-body' }, pic, model),
      choices,
      feedback,
      h('footer', { class: 'fda-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closePanel(prevMode), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = { modal, station, q: null as unknown as Question, hintRung: 0, tries: 0, recorded: false, answered: false, pic, model, feedback, hintBtn, next, choices, stars, level, prompt };
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
    this.renderPic();
    pnl.choices.replaceChildren(
      h(
        'div',
        { class: 'fda-options' },
        ...q.choices.map((c, i) =>
          h(
            'button',
            { class: 'btn fda-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), 'aria-label': `${i + 1}: ${c.label}`, onclick: () => this.pick(c) },
            h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
            h('span', { class: 'fda-choice-text', text: c.label }),
          ),
        ),
      ),
    );
    this.renderStars();
    speak(q.ask);
    requestAnimationFrame(() => pnl.choices.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
  }

  private tag(text: string, x: number, y: number, cls = ''): HTMLElement {
    return h('span', { class: `fda-tag${cls ? ` ${cls}` : ''}`, style: `left:${x * 100}%;top:${y * 100}%`, text });
  }

  /** The picture above the question; hint 2 can add labels or a model picture under it. */
  private renderPic(): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.pic.replaceChildren(this.buildPic(pnl.q, pnl.answered, pnl.hintRung));
    if (pnl.hintRung >= 2 && !pnl.answered) this.renderModel();
  }

  private buildPic(q: Question, done: boolean, hintRung: number): HTMLElement {
    const hinted = (m: typeof q.model) => hintRung >= 2 && !done && q.model === m;
    const pic = q.pic;
    if (pic.k === 'fossil') {
      const f = FOSSILS[pic.id];
      return h(
        'div',
        { class: 'fda-sky' },
        pix(`fossil-big-${pic.id}`, () => paintFossil(pic.id, 3), 2, f.name),
        this.tag(f.name, 0.5, 0.88, 'small'),
      );
    }
    if (pic.k === 'quarry')
      return h(
        'div',
        { class: 'fda-sky' },
        pix('quarry-sample', () => paintQuarryView(216, 168, sampleQuarry()), 1.4, 'A quarry square from above, marked into a grid with strings, part dug'),
        this.tag('Grid strings', 0.5, 0.0, 'small'),
      );
    if (pic.k === 'tools') return this.toolsPic(2);
    if (pic.k === 'form') return this.formPic(pic.step, 2.2);
    if (pic.k === 'cliff') return this.cliffPic(pic.mark, done || hinted('cliff'), 2.2);
    return this.matchPic(2.2);
  }

  private toolsPic(scale: number): HTMLElement {
    return h(
      'div',
      { class: 'fda-sky' },
      pix('tools', () => paintTools(120, 60), scale, 'A shovel, a rock pick and a soft brush'),
      this.tag('Shovel', 0.2, 0.84, 'small'),
      this.tag('Rock pick', 0.5, 0.84, 'small'),
      this.tag('Brush', 0.8, 0.84, 'small'),
    );
  }

  private formPic(step: 0 | 1 | 2 | 3, scale: number): HTMLElement {
    return h(
      'div',
      { class: 'fda-sky' },
      pix(`form-${step}`, () => paintFormStep(step), scale, `How a fossil forms, step ${step + 1}: ${FORM_STEPS[step].toLowerCase()}`),
      this.tag(`${step + 1}. ${FORM_STEPS[step]}`, 0.5, 0.02, 'small'),
    );
  }

  private cliffPic(mark: LayerId | 'fault' | null, labels: boolean, scale: number): HTMLElement {
    const { buf, mids } = paintCliffView(140, 96, { mark });
    const tags = labels
      ? LAYERS.map((l) => this.tag(LAYER_INFO[l].name, 0.5, Math.max(0.02, mids[l] - 0.06), 'small'))
      : [this.tag('Older', 0.1, 0.9, 'small'), ...(mark === 'fault' ? [this.tag('A crack', 0.78, 0.4, 'small')] : [])];
    return h(
      'div',
      { class: 'fda-sky' },
      pix(`cliff-${mark}`, () => buf, scale, 'The cliff’s rock layers up close, oldest at the bottom'),
      ...tags,
    );
  }

  private matchPic(scale: number): HTMLElement {
    const { buf } = paintMatch('ammonite', 140, 72);
    return h(
      'div',
      { class: 'fda-sky' },
      pix('match-ammonite', () => buf, scale, 'Two cliffs far apart across a valley, with ammonites in the same layer of each'),
      this.tag('Cliff A', 0.17, 0.02, 'small'),
      this.tag('Cliff B', 0.83, 0.02, 'small'),
    );
  }

  /** Hint 2's picture, when the question's own picture does not already show it. */
  private renderModel(): void {
    const pnl = this.panel!;
    const q = pnl.q;
    const show = (...els: HTMLElement[]) => {
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('div', { class: 'fda-row fda-model-row' }, ...els));
    };
    if (q.model === 'form') show(...([0, 1, 2, 3] as const).map((s) => this.formPic(s, 1)));
    else if (q.model === 'cliff' && q.pic.k !== 'cliff') show(this.cliffPic(null, true, 1.4));
    else if (q.model === 'tools' && q.pic.k !== 'tools') show(this.toolsPic(1.4));
    else if (q.model === 'match' && q.pic.k !== 'match') show(this.matchPic(1.4));
    else if (q.model === 'stack') {
      const { buf, mids } = paintStack(100, 72);
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      show(
        h(
          'div',
          { class: 'fda-sky' },
          pix('stack', () => buf, 1.6, 'A stack of five newspapers, Monday’s at the bottom and Friday’s on top'),
          ...mids.map((m, i) => this.tag(days[i], 0.5, m - 0.06, 'small')),
        ),
        this.cliffPic(null, true, 1.1),
      );
    } else if (q.model === 'card' && q.pic.k === 'fossil') {
      const f = FOSSILS[q.pic.id];
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('p', { class: 'fda-model-fact', text: `From the Fossil Drawer: ${f.facts[0]}` }));
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
    if (clean && this.save.stars[st] < STARS_PER_STATION) this.save.stars[st]++;
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
      const o = recordAnswer(this.save.learner, pnl.station, { correct: false, hintRung: pnl.hintRung, misconception: (c.misconception ?? null) as Misconception | null }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let us practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(`Not quite. ${c.why ?? ''}`, 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.choices.querySelector<HTMLButtonElement>('.fda-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `fda-feedback ${kind}`;
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
    const n = this.save.stars[pnl.station];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_STATION }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_STATION} stars`);
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    const st = pnl.station;
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
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.fda-choice')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closePanel(_prevMode: Mode): void {
    stopSpeaking();
    this.panel = null;
    if (this.mode === 'panel') {
      this.mode = 'world';
      audio.play('camp');
    }
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
    this.renderHud();
  }

  private async finishStation(st: Station): Promise<void> {
    this.mode = 'busy';
    audio.play('camp');
    const info = STATION_INFO[st];
    const who = this.speakers[HOST[st]];
    await this.talk.say(who, 'Five stars! Before you go, one question.', 'proud');
    const res = await this.talk.ask(who, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${st}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(st);
    this.persist();
    this.updateMarkers();
    audio.levelUp();
    toast(`${info.name} badge! The skeleton’s ${PIECE[st] === 'skull' ? 'skull' : 'backbone'} goes to the museum.`, 'reward');
    await this.talk.say(who, info.done, 'proud');
    this.talk.end();
    this.renderHud();
    if (this.halfDone) {
      await this.talk.say(this.speakers.tala, 'You did it! Come and see me by the footprint slab.', 'proud');
      this.talk.end();
    }
    this.mode = 'world';
  }

  // ------------------------------------------------------------ the Fossil Drawer

  /** The skeleton pieces the finished stations have given (the skull, then the backbone; the rest come in the next part). */
  private pieces(): SkeletonPart[] {
    return SKELETON_PARTS.filter((p) => STATIONS.some((s) => PIECE[s] === p && this.save.done.includes(s)));
  }

  private openDrawer(): void {
    if (this.mode !== 'world') return;
    const sv = this.save;
    const card = (id: FossilId) => {
      const f = FOSSILS[id];
      const got = sv.drawer.find((x) => x.id === id);
      if (!got)
        return h(
          'figure',
          { class: 'fda-guide-card' },
          h('div', { class: 'fda-guide-empty', text: '?' }),
          h('figcaption', { text: f.where === 'trackway' ? 'Found at the Trackway (coming soon)' : 'Not found yet' }),
        );
      return h(
        'button',
        {
          class: 'btn fda-guide-card',
          type: 'button',
          'aria-label': `${f.name}: read its card`,
          onclick: () => {
            modal.close();
            void this.fossilCard(id).then(() => this.openDrawer());
          },
        },
        pix(`fossil-${id}`, () => paintFossil(id, 1.4), 2.4, f.name),
        h('span', { text: `${f.name}${got.chipped ? ' (chipped)' : ''}` }),
      );
    };
    const section = (l: LayerId) => {
      const list = DRAWER_ORDER.filter((id) => FOSSILS[id].layer === l);
      if (!list.length) return [];
      const got = list.filter((id) => sv.drawer.some((x) => x.id === id)).length;
      return [h('h3', { class: 'fda-guide-head', text: `${LAYER_INFO[l].name} (${LAYER_INFO[l].age}): ${got} of ${list.length}` }), h('div', { class: 'fda-guide-grid' }, ...list.map(card))];
    };
    const have = this.pieces();
    const root = h(
      'div',
      { class: 'panel modal fda-guide', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'drawer-title' },
      h(
        'header',
        {},
        h('h2', { id: 'drawer-title', text: `Fossil Drawer: ${sv.drawer.length} of ${DRAWER_ORDER.length}` }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h(
          'div',
          { class: 'fda-skeleton' },
          pix(`skeleton-${have.join('.')}`, () => paintSkeleton(2, have), 2, `The young Triceratops skeleton: ${have.length} of 4 parts ready`),
          h('p', {
            class: 'small-note',
            text: `The young Triceratops for the field museum: ${have.length} of 4 parts ready. Each finished station adds a part.`,
          }),
        ),
        ...[...LAYERS].reverse().flatMap(section),
      ),
    );
    const modal = new Modal(this.host, root);
  }

  /** One fossil's card, read aloud. */
  private fossilCard(id: FossilId): Promise<void> {
    const f = FOSSILS[id];
    const got = this.save.drawer.find((x) => x.id === id);
    return new Promise((resolve) => {
      const root = h(
        'div',
        { class: 'panel modal fda-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'card-title' },
        h('header', {}, h('h2', { id: 'card-title', text: f.name })),
        h(
          'div',
          { class: 'content fda-card-body' },
          pix(`fossil-big-${id}`, () => paintFossil(id, 3), 2, f.name),
          h(
            'div',
            {},
            h('p', { class: 'fda-card-lives', text: `${LAYER_INFO[f.layer].name}, ${LAYER_INFO[f.layer].age}. ${f.kind === 'trace' ? 'A trace fossil: a sign the animal left.' : 'A body fossil.'}` }),
            h('p', { text: f.facts[0] }),
            h('p', { text: f.facts[1] }),
            ...(got ? [h('p', { class: 'small-note', text: `Found at ${got.where.length <= 2 ? `quarry square ${got.where}` : got.where.toLowerCase()}${got.chipped ? ' (chipped)' : ''}.` })] : []),
          ),
        ),
        h('footer', { class: 'fda-foot' }, h('span', {}), h('button', { class: 'btn primary', type: 'button', text: 'Back', 'data-autofocus': true, onclick: () => modal.close() })),
      );
      const modal = new Modal(this.host, root, () => {
        stopSpeaking();
        resolve();
      });
      speak(`${f.name}. ${f.facts[0]} ${f.facts[1]}`);
    });
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.badgeEl = h('span', { class: 'fda-badges', role: 'img' });
    const bar = h('div', { class: 'panel fda-hudbar' }, this.badgeEl);
    this.promptEl = h('button', { class: 'panel prompt', type: 'button', hidden: true, onclick: () => this.target && this.use(this.target) });
    this.hud = h('div', { class: 'hud', hidden: true }, bar, this.promptEl);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'jobs', label: 'Stations', icon: 'scroll', key: 'J', onClick: () => this.openJobList() },
      { id: 'drawer', label: 'Fossil Drawer', icon: 'star', key: 'B', onClick: () => this.openDrawer() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    window.addEventListener('keydown', (e) => {
      if (this.mode !== 'world' || document.querySelector('.modal-back') || this.talk.isOpen) return;
      const k = e.key.toLowerCase();
      if (k === 'j') this.openJobList();
      else if (k === 'b') this.openDrawer();
    });
    this.touch = new TouchControls(this.hud, this.input, () => this.target && this.use(this.target));
    this.touch.setVisible(false);
  }

  private renderHud(): void {
    const sv = this.save;
    const n = sv.done.length;
    this.badgeEl.replaceChildren(
      ...ALL_STATIONS.map((s) => {
        const lit = (STATIONS as readonly string[]).includes(s) && sv.done.includes(s as Station);
        const open = (STATIONS as readonly string[]).includes(s) && this.isOpen(s as Station);
        return pix(`badge-${s}-${lit}-${open}`, () => paintBadge(s, lit, open), 2);
      }),
      pix('drawer-icon', () => paintDrawerIcon(), 1.4),
      h('span', { class: 'fda-badge-text', text: `${n} of ${ALL_STATIONS.length} · Fossils ${sv.drawer.length}/${DRAWER_ORDER.length}` }),
    );
    this.badgeEl.setAttribute('aria-label', `${n} of ${ALL_STATIONS.length} stations done. ${sv.drawer.length} of ${DRAWER_ORDER.length} fossils in the drawer.`);
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
  }

  private openJobList(): void {
    if (this.mode !== 'world') return;
    const sv = this.save;
    const walkTo = (id: Target['id']) => () => {
      modal.close();
      const t = this.world.targets.find((x) => x.id === id);
      if (t) this.world.walkTo(t);
    };
    const rows = ALL_STATIONS.map((s) => {
      const real = (STATIONS as readonly string[]).includes(s) ? (s as Station) : null;
      const done = !!real && sv.done.includes(real);
      const open = !!real && this.isOpen(real);
      const status = !real
        ? 'Opens in the next part of the game.'
        : done
          ? 'Done!'
          : !open
            ? 'Opens after the Quarry.'
            : sv.worked.includes(real)
              ? `Logbook: ${sv.stars[real]} of ${STARS_PER_STATION} stars.`
              : real === 'quarry'
                ? 'Dig a square of the quarry with Dr. Mateo.'
                : 'Rebuild the cliff with Hana.';
      return h(
        'li',
        { class: `belt-row${open || done ? '' : ' soon'}` },
        pix(`badge-${s}-${done}-${open}`, () => paintBadge(s, done, open), 2),
        h('div', { class: 'belt-info' }, h('strong', { text: ALL_NAMES[s] }), h('span', { text: status })),
        h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walkTo(s === 'quarry' ? 'mateo' : s === 'cliff' ? 'hana' : s === 'lab' ? 'sam' : 'tala') }),
      );
    });
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jobs-title', style: 'width:min(640px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'jobs-title', text: 'Stations' }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h('p', {
          class: 'small-note',
          style: 'margin:0 0 10px',
          text: 'Each station is a hands-on job, then the logbook: 5 stars finishes it. A star is for getting it right the first time. Each finished station adds a part to the Triceratops skeleton.',
        }),
        h(
          'ul',
          { class: 'belt-list' },
          ...rows,
          h(
            'li',
            { class: 'belt-row soon' },
            pix('badge-museum', () => paintBadge('museum', false, false), 2),
            h('div', { class: 'belt-info' }, h('strong', { text: 'Museum Night' }), h('span', { text: 'Opens when all four stations are done.' })),
            h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walkTo('museum') }),
          ),
        ),
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
        const ok = await choose(this.host, 'Start over?', 'This erases your fossils and stars in this browser. Settings are kept.', [
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
      'rock-fossil': 'thinking any old rock is a fossil',
      'fast-fossil': 'thinking fossils form in days or years',
      'soft-fossil': 'thinking soft bodies fossilize as easily as bones',
      'rough-tools': 'using big tools right next to a fossil',
      'people-dinos': 'thinking people and dinosaurs lived at the same time',
      'extinct-hiding': 'thinking extinct animals are hiding somewhere',
      'buried-needed': 'not seeing that quick burial is needed',
      'real-bone': 'thinking a fossil is the original bone',
      'all-dinosaurs': 'thinking every fossil is a dinosaur',
      'all-fossilize': 'thinking every living thing becomes a fossil',
      'map-pointless': 'not seeing why finds are mapped',
      'trace-not-fossil': 'thinking footprints and burrows are not fossils',
      'diet-mixup': 'mixing up what an animal ate',
      'wrong-reason': 'picking a reason that does not explain it',
      'young-bottom': 'thinking the bottom layer is the youngest',
      'layers-random': 'thinking rock layers have no order in time',
      'rock-env': 'not reading the past place from the rock and its fossils',
      'sea-carried': 'thinking sea fossils on land were carried there',
      'index-mixup': 'mixing up what matching fossils show',
      'thick-old': 'thinking a thicker layer is older',
      'fault-older': 'thinking a crack is older than the layers it cuts',
      'canyon-first': 'thinking the canyon formed before its layers',
      'gap-missing': 'not seeing that a layer can be worn away',
    };
    const rows = STATIONS.flatMap((s) => {
      const job = this.save.learner[s === 'quarry' ? 'quarry-dig' : 'cliff-puzzle'];
      const rec = this.save.learner[s];
      const mis = topMisconception(rec) ?? topMisconception(job);
      const info = STATION_INFO[s];
      const status = this.save.done.includes(s) ? 'Done' : this.save.worked.includes(s) ? `${s === 'quarry' ? 'Dug' : 'Rebuilt'}; logbook in progress` : rec ? 'In progress' : 'Not started';
      return [
        h(
          'tr',
          {},
          h('th', { scope: 'row', text: `${info.name} (${info.skill.toLowerCase()})` }),
          h('td', { text: status }),
          h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
          h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
          h('td', { text: mis ? (WORDS[mis] ?? '–') : '–' }),
        ),
      ];
    });
    const dig = this.save.learner['quarry-dig'];
    return h(
      'div',
      {},
      h('p', {
        text: `This summary is kept only in this browser. Stations done: ${this.save.done.length} of ${ALL_STATIONS.length} (the Prep Lab and the Trackway come in the next part). Fossil Drawer: ${this.save.drawer.length} of ${DRAWER_ORDER.length}. Quarry squares dug: ${this.save.digs}${dig ? ` (${dig.correct} of ${dig.attempts} finds dug out without a chip)` : ''}. Cliffs rebuilt: ${this.save.cliffs}.`,
      }),
      h(
        'div',
        { class: 'table-wrap' },
        h(
          'table',
          { class: 'progress-table' },
          h('thead', {}, h('tr', {}, ...['Station', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))),
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
      player: { x: this.world.me.x, y: this.world.me.y },
      target: this.target ? this.target.id : null,
      stars: { ...this.save.stars },
      played: { ...this.save.played },
      done: [...this.save.done],
      worked: [...this.save.worked],
      drawer: this.save.drawer.map((f) => f.id),
      chipped: this.save.drawer.filter((f) => f.chipped).map((f) => f.id),
      digs: this.save.digs,
      cliffs: this.save.cliffs,
      talking: this.talk.isOpen,
      time: this.world.timeOfDay,
      quarry: !!this.quarry,
      cliff: this.cliff ? this.cliff.state() : null,
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
