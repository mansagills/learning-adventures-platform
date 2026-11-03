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
import { AMARA_OSEI, HABITATS, paintBinoculars, paintKikiPortrait, type Habitat } from '../../kit/worlds/wild-lands/animal-art';
import { RANGER_TALA } from '../../kit/worlds/wild-lands/art';
import type { Critter } from '../../kit/worlds/wild-lands/habitats';
import { animal, HABITAT_INFO, JOURNAL_ORDER, OPEN_TRIPS, RAINFOREST_LAYERS, toSpot, TRIP_ANIMALS, TRIPS, type Trip } from './animals';
import { paintAnimalCard, paintDayNight, paintHabitatCard, paintLayers, paintNeeds, paintPair, paintPatch } from './art';
import {
  AMARA_HELLO,
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  GROWNUPS,
  HALF_DONE,
  KIKI,
  KIKI_HELLO,
  KIKI_HELP_DONE,
  KIKI_JOINS,
  OPENING,
  OPENING_END,
  PEOPLE,
  praise,
  RESCUE_AGAIN,
  RESCUE_EMPTY,
  STARS_PER_TRIP,
  TRIP_INFO,
  type PersonId,
} from './content';
import { CAMP_SONG, DESERT_SONG, FOREST_SONG, JOURNAL_SONG } from './music';
import { pix } from './pix';
import { bank, makeQuestion, STATIONS, type Choice, type Misconception, type Question, type Tier } from './problems';
import { pickRescues } from './rescue';
import { openRescue, type RescueHandle } from './rescueUi';
import { freshSave, store, type AnimalSave } from './save';
import { openSpot, type SpotHandle } from './spotUi';
import { AnimalWorld, CAMP_PEOPLE, MAP_SIGN, type Area, type Target } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_TRIP = 12;

const LOOKS: Record<PersonId, Look16> = { tala: RANGER_TALA, amara: AMARA_OSEI };
const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };
const AREA_NAME: Record<Area, string> = { camp: 'the field camp', rainforest: 'the rainforest', desert: 'the desert', poles: 'the Poles', wetland: 'the wetland' };

type Mode = 'title' | 'world' | 'busy' | 'panel' | 'job';

interface Panel {
  modal: Modal;
  trip: Trip;
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
  private readonly world: AnimalWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: AnimalSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private badgeEl!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<PersonId | 'kiki', Speaker>;
  private panel: Panel | null = null;
  private spot: SpotHandle | null = null;
  private rescue: RescueHandle | null = null;
  /** The trip being walked now (null at camp). */
  private trip: Trip | null = null;
  /** Animals (by index in the trip's list) spotted on this visit. */
  private spottedNow = new Set<number>();
  private praiseCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-wild');
    this.save = store.exists() ? store.load() : freshSave();
    this.world = new AnimalWorld(host);
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
      tala: speaker('tala', 160),
      amara: speaker('amara', 200),
      kiki: {
        name: KIKI.name,
        role: KIKI.role,
        voice: 380,
        portrait: (e: Expression) => {
          const key = `kiki-${e === 'thinking' ? 0 : 1}`;
          let u = cache.get(key);
          if (!u) cache.set(key, (u = paintKikiPortrait(e !== 'thinking').toDataURL(2)));
          return u;
        },
      },
    };
    audio.addSong('camp', CAMP_SONG);
    audio.addSong('forest', FOREST_SONG);
    audio.addSong('desert', DESERT_SONG);
    audio.addSong('journal', JOURNAL_SONG);
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
    (window as unknown as { __akm: unknown }).__akm = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      teleport: (x: number, y: number) => this.world.placePlayer(x, y),
      travel: (area: Area) => this.mode === 'world' && void this.travel(area),
      /** Open the binoculars on animal i of this trip (from anywhere in the habitat). */
      spot: (i: number) => {
        const t = this.world.targets.find((x) => x.id === `animal:${i}`);
        if (!t || this.mode !== 'world') return false;
        this.startSpot(t);
        return true;
      },
      focus: (v: number) => this.spot?.setFocus(v),
      snap: () => this.spot?.snap() ?? false,
      spotState: () => this.spot?.state() ?? null,
      closeModal: () => (stackTop() as Modal | undefined)?.close(),
      rescue: () => this.mode === 'world' && this.startRescue(),
      rescueState: () => this.rescue?.state() ?? null,
      rescuePick: (i: number) => this.rescue?.pick(i),
      open: (t: Trip) => this.mode === 'world' && this.openPanel(t),
      setTier: (s: string, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      /** Open one question by its id (for screenshots). */
      ask: (s: Trip, id: string) => {
        const d = bank(s).find((x) => x.id === id);
        if (!d || this.mode !== 'world') return false;
        skill(this.save.learner, s).tier = d.tier;
        this.save.recent[s] = bank(s)
          .filter((x) => x.id !== id)
          .map((x) => x.id);
        this.openPanel(s);
        return true;
      },
      journal: () => this.mode === 'world' && this.openJournal(),
      map: () => this.world.debugMap(),
    };
  }

  start(): void {
    const names = Object.fromEntries((Object.keys(PEOPLE) as PersonId[]).map((id) => [id, PEOPLE[id].name])) as Record<PersonId, string>;
    this.world.setCast(this.playerLook(), LOOKS, names);
    this.world.load('camp', { lit: this.save.done });
    this.updateMarkers();
    this.world.establishing = true;
    this.world.follow();
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.input.worldActive = this.mode === 'world' && !document.querySelector('.modal-back') && !this.talk.isOpen;
      this.world.establishing = this.mode === 'title' || (!this.save.openingSeen && this.mode === 'busy' && this.world.area === 'camp');
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

  /** Is this trip open (built, and the one before it is finished)? */
  private isOpen(t: Trip): boolean {
    const i = TRIPS.indexOf(t);
    return OPEN_TRIPS.includes(t) && (i === 0 || this.save.done.includes(TRIPS[i - 1]));
  }

  /** What a trip needs next: spotting its animals, the Rescue Center, the Ranger Journal, or nothing. */
  private stepOf(t: Trip): 'spot' | 'rescue' | 'journal' | null {
    const sv = this.save;
    if (!this.isOpen(t) || sv.done.includes(t)) return null;
    if (!sv.spottedAll.includes(t)) return 'spot';
    if (!sv.rescued.includes(t)) return 'rescue';
    return 'journal';
  }

  /** The trip being worked on (the first open one not finished). */
  private get current(): Trip | null {
    return OPEN_TRIPS.find((t) => this.stepOf(t) !== null) ?? null;
  }

  private get halfDone(): boolean {
    return OPEN_TRIPS.every((t) => this.save.done.includes(t));
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Animal Kingdom Match',
      subtitle: 'Spot them, then help them home',
      intro: [
        'Be a Junior Ranger with Ranger Tala, Dr. Amara Osei and Kiki the kinkajou. Visit the rainforest and the desert, spot their animals with your binoculars, and help lost animals get back home at the Wildlife Rescue Center.',
        'For grades 1 to 4. Everything can be read aloud, and nothing is timed.',
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
        noun: 'Junior Ranger',
        hide: ['accessory'],
        only: { hairStyle: HAIR16 },
        paint: (a, dir, frame) => paintHero(look16FromAppearance(a), 1.5, dir, { walk: frame === 0 ? 1 : frame === 1 ? 0 : 2 }),
      },
      (a) => {
        this.save.appearance = a;
        this.persist();
        this.world.setPlayerLook(this.playerLook());
        done();
      },
    );
  }

  private async newGame(): Promise<void> {
    if (store.exists()) {
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your Ranger Journal and patches in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.load('camp', { lit: [] });
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
    const tala = this.speakers.tala;
    await this.talk.say(tala, OPENING);
    await this.talk.say(this.speakers.kiki, KIKI_HELLO, 'smile');
    await this.talk.say(tala, KIKI_JOINS, 'smile');
    await this.talk.say(tala, OPENING_END, 'proud');
    await this.talk.say(tala, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
    this.updateMarkers();
  }

  private updateMarkers(): void {
    if (this.world.area !== 'camp') {
      this.world.setMarkers({ tala: null, amara: null });
      return;
    }
    const cur = this.current;
    const step = cur ? this.stepOf(cur) : null;
    this.world.setMarkers({
      tala: step === 'spot' || step === 'journal' || (this.halfDone && !this.save.halfDoneSeen) ? 'new' : null,
      amara: step === 'rescue' || !this.save.amaraMet ? (step === 'rescue' ? 'turnin' : 'new') : null,
    });
  }

  // ------------------------------------------------------------ walking about

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
    const s = this.world.screenOf(t, t.who ? 1.6 : 2.9);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel(t.who ? 'Look' : t.id === 'map' ? 'Map' : 'Talk');
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
      if (t.who && this.spottedNow.has(Number(t.id.split(':')[1]))) continue;
      const s = this.world.screenOf(t, t.who ? 0.6 : 1.0);
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
    if (t.who) return this.startSpot(t);
    if (t.id === 'map') return void this.openMap();
    if (this.world.area !== 'camp') return void this.talkToHost();
    if (t.id === 'tala') void this.talkToTala();
    else void this.talkToAmara();
  }

  private async sayOnce(who: Speaker, text: string | string[], e: Expression = 'smile'): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(who, text, e);
    this.talk.end();
    this.mode = 'world';
  }

  // ------------------------------------------------------------ the camp: Ranger Tala, the map and Dr. Amara

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
    const cur = this.current;
    const step = cur ? this.stepOf(cur) : null;
    const options: Array<{ label: string; run: () => void }> = [];
    if (cur && step === 'spot') options.push({ label: `Go to ${AREA_NAME[cur]}`, run: () => void this.goOnTrip(cur) });
    if (cur && step === 'journal') options.push({ label: `Write up ${AREA_NAME[cur]} in the journal`, run: () => this.openPanel(cur) });
    for (const t of OPEN_TRIPS) if (sv.done.includes(t)) options.push({ label: `Journal practice: ${AREA_NAME[t]}`, run: () => this.openPanel(t) });
    options.push(
      { label: 'Open the Ranger Journal', run: () => this.openJournal() },
      { label: 'Change how I look', run: () => this.customize(false, () => undefined) },
      { label: 'Not now', run: () => undefined },
    );
    const tip = !cur
      ? 'You can visit any habitat again from the map, or practise in your Ranger Journal.'
      : step === 'spot'
        ? `${TRIP_INFO[cur].name} is next. Shall we go?`
        : step === 'rescue'
          ? 'Dr. Amara is waiting at the Rescue Center tent, by the beach path.'
          : `Let’s write up ${AREA_NAME[cur]} in your Ranger Journal. Five stars earns the patch.`;
    const i = await this.talk.offer(
      tala,
      tip,
      options.map((o) => o.label),
    );
    this.talk.end();
    this.mode = 'world';
    options[i].run();
  }

  /** The Wild Lands map: pick a habitat to visit. */
  private async openMap(): Promise<void> {
    this.mode = 'busy';
    const tala = this.speakers.tala;
    const trips = OPEN_TRIPS.filter((t) => this.isOpen(t));
    const locked = TRIPS.filter((t) => !this.isOpen(t)).map((t) => TRIP_INFO[t].name);
    const note = locked.length ? ` ${locked.join(' and ')} ${locked.length > 1 ? 'open' : 'opens'} later.` : '';
    const labels = [...trips.map((t) => `${TRIP_INFO[t].name}${this.save.done.includes(t) ? ' (patch earned)' : ''}`), 'Not now'];
    const i = await this.talk.offer(tala, `The map shows the four habitats of the Wild Lands. Where shall we go?${note}`, labels);
    this.talk.end();
    this.mode = 'world';
    if (i < trips.length) void this.goOnTrip(trips[i]);
  }

  private async talkToAmara(): Promise<void> {
    this.mode = 'busy';
    const amara = this.speakers.amara;
    const sv = this.save;
    if (!sv.amaraMet) {
      await this.talk.say(amara, AMARA_HELLO);
      sv.amaraMet = true;
      this.persist();
      this.updateMarkers();
    }
    const cur = this.current;
    if (cur && this.stepOf(cur) === 'rescue') {
      this.talk.end();
      this.mode = 'world';
      this.startRescue();
      return;
    }
    if (!sv.rescued.length) {
      await this.talk.say(amara, RESCUE_EMPTY);
      this.talk.end();
      this.mode = 'world';
      return;
    }
    const i = await this.talk.offer(amara, RESCUE_AGAIN, ['Help them get home', 'Not now']);
    this.talk.end();
    this.mode = 'world';
    if (i === 0) this.startRescue();
  }

  // ------------------------------------------------------------ travel

  private async travel(area: Area): Promise<void> {
    this.mode = 'busy';
    this.touch?.setVisible(false);
    const veil = h('div', { class: 'akm-travel', role: 'status', 'aria-live': 'polite' }, h('span', { text: area === 'camp' ? 'Back to camp...' : `Off to ${AREA_NAME[area]}...` }));
    this.host.append(veil);
    await new Promise((r) => window.setTimeout(r, 380));
    this.trip = area === 'camp' ? null : area;
    // a habitat whose animals are not all spotted yet keeps the ones already in the journal; afterwards every visit starts fresh
    const sv = this.save;
    this.spottedNow = new Set(area !== 'camp' && !sv.spottedAll.includes(area) ? TRIP_ANIMALS[area].map((a, i) => (sv.journal.includes(a.who) ? i : -1)).filter((i) => i >= 0) : []);
    const host = area === 'camp' ? undefined : TRIP_INFO[area].host;
    this.world.load(area, { lit: sv.done, host, spotted: [...this.spottedNow] });
    this.updateMarkers();
    audio.play(area === 'camp' ? 'camp' : area === 'desert' ? 'desert' : 'forest');
    this.renderHud();
    veil.classList.add('out');
    window.setTimeout(() => veil.remove(), 420);
    this.mode = 'world';
    this.touch?.setVisible(touchControlsVisible());
  }

  private async goOnTrip(t: Trip): Promise<void> {
    await this.travel(t);
    const sv = this.save;
    const info = TRIP_INFO[t];
    const who = this.speakers[info.host];
    this.mode = 'busy';
    if (!sv.visited.includes(t)) {
      await this.talk.say(who, info.arrive);
      sv.visited.push(t);
      this.persist();
    } else await this.talk.say(who, sv.spottedAll.includes(t) ? `${info.again} Every animal is back in its place, ready for new photos.` : info.again);
    this.talk.end();
    this.mode = 'world';
  }

  /** The trip's host, in the habitat. */
  private async talkToHost(): Promise<void> {
    const t = this.trip;
    if (!t) return;
    this.mode = 'busy';
    const who = this.speakers[TRIP_INFO[t].host];
    const left = this.world.unspotted().length;
    const text = left ? `${left} ${left === 1 ? 'animal' : 'animals'} still to spot here. Kiki can help you look!` : 'You have spotted every animal here. Ready to go back?';
    const options = left ? ['Ask Kiki for help', 'Back to camp', 'Keep looking'] : ['Back to camp', 'Stay a little longer'];
    const i = await this.talk.offer(who, text, options);
    this.talk.end();
    this.mode = 'world';
    const pick = options[i];
    if (pick === 'Ask Kiki for help') void this.kikiHelp();
    else if (pick === 'Back to camp') void this.travel('camp');
  }

  /** Kiki points the way to the nearest animal still to spot. */
  private async kikiHelp(): Promise<void> {
    if (this.mode !== 'world') return;
    const kiki = this.speakers.kiki;
    if (!this.trip) return this.sayOnce(kiki, this.campTip(), 'smile');
    const next = this.world.unspotted()[0];
    if (!next?.who) return this.sayOnce(kiki, KIKI_HELP_DONE, 'smile');
    await this.sayOnce(kiki, `Chirp! Kiki points her tail. ${animal(next.who).where}`, 'smile');
  }

  private campTip(): string {
    const cur = this.current;
    const step = cur ? this.stepOf(cur) : null;
    if (step === 'spot') return 'Chirp! Kiki points her tail at the map by the campfire. Time for a trip!';
    if (step === 'rescue') return 'Chirp! Kiki points her tail at the Rescue Center tent. Dr. Amara needs help.';
    if (step === 'journal') return 'Chirp! Kiki points her tail at Ranger Tala. Time to write up the trip.';
    return 'Chirp! Kiki curls up happily. Visit a habitat again from the map, or open your Ranger Journal.';
  }

  // ------------------------------------------------------------ spotting with the binoculars

  private startSpot(t: Target): void {
    if (!t.who || !this.trip) return;
    const i = Number(t.id.split(':')[1]);
    if (this.spottedNow.has(i)) return;
    const id = t.who;
    this.mode = 'job';
    this.touch?.setVisible(false);
    this.promptEl.hidden = true;
    const isNew = !this.save.journal.includes(id);
    const r = mulberry32(this.save.seed++);
    this.spot = openSpot(this.host, {
      who: id,
      sharpAt: 3 + Math.floor(r() * 6),
      isNew,
      onSnap: () => {
        if (isNew) this.save.journal.push(id);
        this.spottedNow.add(i);
        this.world.markSpotted(i);
        this.persist();
        this.renderHud();
      },
      onClose: (snapped) => {
        this.spot = null;
        void this.afterSpot(snapped);
      },
    });
  }

  private async afterSpot(snapped: boolean): Promise<void> {
    this.backToWorld();
    const t = this.trip;
    if (!snapped || !t) return;
    const sv = this.save;
    if (this.world.unspotted().length || sv.spottedAll.includes(t)) return;
    // every animal spotted: back to camp, where Dr. Amara needs help
    sv.spottedAll.push(t);
    this.persist();
    this.mode = 'busy';
    audio.levelUp();
    await this.talk.say(this.speakers[TRIP_INFO[t].host], TRIP_INFO[t].allSpotted, 'proud');
    this.talk.end();
    this.mode = 'world';
    await this.travel('camp');
    this.world.placePlayer(CAMP_PEOPLE.amara.x - 1.6, CAMP_PEOPLE.amara.y - 0.4, 'right');
  }

  // ------------------------------------------------------------ the Rescue Center

  private startRescue(): void {
    const sv = this.save;
    const cur = this.current;
    const due = cur && this.stepOf(cur) === 'rescue' ? cur : null;
    const r = mulberry32(sv.seed++);
    // the trip just spotted, or for practice any trip already helped
    const trip = due ?? sv.rescued[Math.floor(r() * sv.rescued.length) % sv.rescued.length];
    if (!trip) return;
    this.mode = 'job';
    this.touch?.setVisible(false);
    this.promptEl.hidden = true;
    audio.play('journal');
    const latest = sv.done[sv.done.length - 1];
    const tier = Math.max(skill(sv.learner, 'rescue').tier, latest ? skill(sv.learner, latest).tier : 1) as Tier;
    this.rescue = openRescue(this.host, {
      animals: pickRescues(trip, sv.rescued, r),
      tier,
      seed: sv.seed++,
      face: this.speakers.amara.portrait('smile'),
      intro: due ? TRIP_INFO[trip].rescue : RESCUE_AGAIN,
      onAnswer: (kind, correct, misconception) => {
        recordAnswer(sv.learner, kind === 'home' ? 'rescue' : `rescue-${kind}`, { correct, hintRung: 0, misconception }, RULES);
        this.persist();
      },
      onHome: () => {
        sv.homes++;
        this.persist();
      },
      onClose: (finished) => {
        this.rescue = null;
        void this.afterRescue(finished, due);
      },
    });
  }

  private async afterRescue(finished: boolean, due: Trip | null): Promise<void> {
    audio.play('camp');
    const sv = this.save;
    if (!finished || !due) {
      this.backToWorld();
      return;
    }
    sv.rescued.push(due);
    this.persist();
    this.mode = 'busy';
    await this.talk.say(this.speakers.amara, TRIP_INFO[due].journal, 'proud');
    this.talk.end();
    this.backToWorld();
    this.openPanel(due);
  }

  private backToWorld(): void {
    this.mode = 'world';
    this.updateMarkers();
    this.renderHud();
    this.touch?.setVisible(touchControlsVisible());
  }

  // ------------------------------------------------------------ the Ranger Journal's questions

  private openPanel(trip: Trip): void {
    if (!STATIONS.includes(trip)) return;
    this.mode = 'panel';
    this.touch?.setVisible(false);
    audio.play('journal');
    const who = this.speakers[TRIP_INFO[trip].host];
    const level = h('span', { class: 'akm-level' });
    const stars = h('span', { class: 'akm-stars', role: 'img' });
    const prompt = h('p', { class: 'akm-prompt' });
    const speakBtn = h('button', { class: 'btn small akm-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => {
      const q = this.panel?.q;
      speak(q ? `${q.ask} ${q.choices.map((c, i) => `${i + 1}: ${c.label}.`).join(' ')}` : '', { force: true });
    });
    const feedback = h('div', { class: 'akm-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const pic = h('div', { class: 'akm-pic' });
    const model = h('div', { class: 'akm-model', hidden: true });
    const choices = h('div', { class: 'akm-choices' });
    const hintBtn = h(
      'button',
      { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' },
      iconImg('bulb', '', 22),
      h('span', { text: 'Hint' }),
      h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }),
    ) as HTMLButtonElement;
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' }) as HTMLButtonElement;
    const face = h('img', { class: 'akm-host', src: who.portrait('smile'), alt: who.name, width: 64, height: 64 });
    const root = h(
      'div',
      { class: `panel modal akm-panel akm-${trip}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'akm-title' },
      h(
        'header',
        {},
        h('h2', { id: 'akm-title', text: `Ranger Journal: ${AREA_NAME[trip]}` }),
        h(
          'div',
          { class: 'akm-head-right' },
          level,
          stars,
          h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }),
        ),
      ),
      h('div', { class: 'akm-ask' }, face, prompt, speakBtn),
      h('div', { class: 'akm-body' }, pic, model),
      choices,
      feedback,
      h('footer', { class: 'akm-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closePanel(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = { modal, trip, q: null as unknown as Question, hintRung: 0, tries: 0, recorded: false, answered: false, pic, model, feedback, hintBtn, next, choices, stars, level, prompt };
    this.nextQuestion();
  }

  private nextQuestion(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const st = pnl.trip;
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
        { class: 'akm-options' },
        ...q.choices.map((c, i) =>
          h(
            'button',
            { class: 'btn akm-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), 'aria-label': `${i + 1}: ${c.label}`, onclick: () => this.pick(c) },
            h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
            h('span', { class: 'akm-choice-text', text: c.label }),
          ),
        ),
      ),
    );
    this.renderStars();
    // grades 1 and 2: the answers are read aloud too
    speak(`${q.ask} ${q.choices.map((c, i) => `${i + 1}: ${c.label}.`).join(' ')}`);
    requestAnimationFrame(() => pnl.choices.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
  }

  private tag(text: string, x: number, y: number, cls = ''): HTMLElement {
    return h('span', { class: `akm-tag${cls ? ` ${cls}` : ''}`, style: `left:${x * 100}%;top:${y * 100}%`, text });
  }

  private renderPic(): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.pic.replaceChildren(this.buildPic(pnl.q, pnl.answered || (pnl.hintRung >= 2 && pnl.q.model === 'layers')));
    if (pnl.hintRung >= 2 && !pnl.answered) this.renderModel();
  }

  private buildPic(q: Question, labels: boolean): HTMLElement {
    const pic = q.pic;
    if (pic.k === 'animal') {
      const a = animal(pic.id);
      return h(
        'div',
        { class: 'akm-sky' },
        pix(`card-${pic.id}`, () => paintAnimalCard(pic.id, 96, 72), 2.4, a.name),
        this.tag(a.name, 0.5, 0.86, 'small'),
      );
    }
    if (pic.k === 'pair') {
      const names: Partial<Record<Critter, string>> = { fennec: 'Fennec fox (desert)', 'arctic-fox': 'Arctic fox (Arctic)' };
      return h(
        'div',
        { class: 'akm-sky' },
        pix(`pair-${pic.a}-${pic.b}`, () => paintPair(pic.a, pic.b, 176, 80), 2, `A ${names[pic.a] ?? pic.a} and an ${names[pic.b] ?? pic.b} side by side`),
        this.tag(names[pic.a] ?? pic.a, 0.25, 0.86, 'small'),
        this.tag(names[pic.b] ?? pic.b, 0.75, 0.86, 'small'),
      );
    }
    if (pic.k === 'scene') return this.habitatPic(pic.hab, 2.2);
    if (pic.k === 'layers') return this.layersPic(labels, 2);
    return this.dayNightPic(2);
  }

  private habitatPic(hab: Habitat, scale: number): HTMLElement {
    const info = HABITAT_INFO[hab];
    return h(
      'div',
      { class: 'akm-sky' },
      pix(`hab-${hab}-big`, () => paintHabitatCard(hab, 128, 80), scale, `${info.name}: ${info.short.toLowerCase()}`),
      this.tag(info.name, 0.5, 0.02, 'small'),
    );
  }

  private layersPic(labels: boolean, scale: number): HTMLElement {
    const { buf, labels: at } = paintLayers(136, 120);
    return h(
      'div',
      { class: 'akm-sky' },
      pix('layers', () => buf, scale, 'The rainforest’s layers: the canopy at the top, the understory in the middle and the forest floor at the bottom, with animals in each'),
      ...(labels
        ? (['canopy', 'understory', 'floor'] as const).map((l) => this.tag(RAINFOREST_LAYERS[l].name, at[l][0], at[l][1], 'small'))
        : [this.tag('Top', 0.92, 0.02, 'small'), this.tag('Bottom', 0.9, 0.88, 'small')]),
    );
  }

  private dayNightPic(scale: number): HTMLElement {
    return h(
      'div',
      { class: 'akm-sky' },
      pix('daynight', () => paintDayNight(168, 80), scale, 'The desert by day, hot, with a fox asleep in its burrow; and by night, cool, with the fox out hunting'),
      this.tag('Day: hot', 0.25, 0.02, 'small'),
      this.tag('Night: cool', 0.75, 0.02, 'small'),
    );
  }

  private needsPic(scale: number): HTMLElement {
    return h(
      'div',
      { class: 'akm-sky akm-needs' },
      pix('needs', () => paintNeeds(34), scale, 'The four needs: food, water, shelter and space'),
      ...['Food', 'Water', 'Shelter', 'Space'].map((t, i) => this.tag(t, (i + 0.5) / 4, 0.98, 'small')),
    );
  }

  /** Hint 2's picture, when the question's own picture does not already show it. */
  private renderModel(): void {
    const pnl = this.panel!;
    const q = pnl.q;
    const show = (...els: HTMLElement[]) => {
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('div', { class: 'akm-row akm-model-row' }, ...els));
    };
    if (q.model === 'needs') show(this.needsPic(1.6));
    else if (q.model === 'layers' && q.pic.k !== 'layers') show(this.layersPic(true, 1.2));
    else if (q.model === 'map') show(...HABITATS.map((hab) => this.habitatPic(hab, 1)));
    else if (q.model === 'daynight' && q.pic.k !== 'daynight') show(this.dayNightPic(1.2));
    else if (q.model === 'card' && (q.pic.k === 'animal' || q.pic.k === 'pair')) {
      const id = q.pic.k === 'animal' ? q.pic.id : q.pic.a;
      const a = animal(id);
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('p', { class: 'akm-model-fact', text: `From your Ranger Journal: ${a.facts[0]} ${a.facts[1]}` }));
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
      tierChange = recordAnswer(this.save.learner, pnl.trip, { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
    }
    const st = pnl.trip;
    this.save.played[st]++;
    if (clean && this.save.stars[st] < STARS_PER_TRIP) this.save.stars[st]++;
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
      const o = recordAnswer(this.save.learner, pnl.trip, { correct: false, hintRung: pnl.hintRung, misconception: (c.misconception ?? null) as Misconception | null }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let’s practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(`Not quite. ${c.why ?? ''}`, 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.choices.querySelector<HTMLButtonElement>('.akm-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `akm-feedback ${kind}`;
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
    const n = this.save.stars[pnl.trip];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_TRIP }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_TRIP} stars`);
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    const st = pnl.trip;
    const rec = skill(this.save.learner, st);
    const ready = this.save.stars[st] >= STARS_PER_TRIP && (rec.tier >= 2 || this.save.played[st] >= MAX_PER_TRIP);
    if (ready && !this.save.done.includes(st) && this.save.rescued.includes(st)) {
      pnl.modal.close();
      void this.finishTrip(st);
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
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.akm-choice')[Number(k) - 1];
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
      this.mode = 'world';
      audio.play(this.world.area === 'camp' ? 'camp' : this.world.area === 'desert' ? 'desert' : 'forest');
    }
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
    this.renderHud();
  }

  private async finishTrip(t: Trip): Promise<void> {
    this.mode = 'busy';
    audio.play('camp');
    const info = TRIP_INFO[t];
    const who = this.speakers[info.host];
    await this.talk.say(who, 'Five stars! Before we finish, one question to talk through.', 'proud');
    const res = await this.talk.ask(who, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${t}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(t);
    this.persist();
    this.world.setMapLit(this.save.done);
    this.updateMarkers();
    audio.levelUp();
    toast(`Junior Ranger patch: ${info.name}! It lights up on the map.`, 'reward');
    await this.talk.say(who, info.done, 'proud');
    if (this.halfDone && !this.save.halfDoneSeen) {
      await this.talk.say(this.speakers.tala, HALF_DONE, 'proud');
      this.save.halfDoneSeen = true;
      this.persist();
    }
    this.talk.end();
    this.updateMarkers();
    this.renderHud();
    this.mode = 'world';
  }

  // ------------------------------------------------------------ the Ranger Journal's animal cards

  private openJournal(): void {
    if (this.mode !== 'world') return;
    const sv = this.save;
    const card = (id: Critter) => {
      const a = animal(id);
      if (!sv.journal.includes(id)) return h('figure', { class: 'akm-guide-card' }, h('div', { class: 'akm-guide-empty', text: '?' }), h('figcaption', { text: 'Not spotted yet' }));
      return h(
        'button',
        {
          class: 'btn akm-guide-card',
          type: 'button',
          'aria-label': `${a.name}: read its card`,
          onclick: () => {
            modal.close();
            void this.animalCard(id).then(() => this.openJournal());
          },
        },
        pix(`card-${id}`, () => paintAnimalCard(id, 96, 72), 1.4, a.name),
        h('span', { text: a.name }),
      );
    };
    const section = (t: Trip) => {
      const list = toSpot(t);
      const got = list.filter((id) => sv.journal.includes(id)).length;
      return [
        h(
          'h3',
          { class: 'akm-guide-head' },
          pix(`patch-${t}-${sv.done.includes(t)}`, () => paintPatch(t, sv.done.includes(t)), 1.4),
          h('span', { text: `${TRIP_INFO[t].name}: ${got} of ${list.length}` }),
        ),
        h('div', { class: 'akm-guide-grid' }, ...list.map(card)),
      ];
    };
    const root = h(
      'div',
      { class: 'panel modal akm-guide', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'journal-title' },
      h(
        'header',
        {},
        h('h2', { id: 'journal-title', text: `Ranger Journal: ${sv.journal.length} of ${JOURNAL_ORDER.length} animals` }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h('div', { class: 'content' }, h('p', { class: 'small-note', text: `Patches: ${sv.done.length} of 4. The Poles and the Wetland and Sea come next.` }), ...OPEN_TRIPS.flatMap(section)),
    );
    const modal = new Modal(this.host, root);
  }

  /** One animal's card, read aloud. */
  private animalCard(id: Critter): Promise<void> {
    const a = animal(id);
    return new Promise((resolve) => {
      const root = h(
        'div',
        { class: 'panel modal akm-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'card-title' },
        h('header', {}, h('h2', { id: 'card-title', text: a.name })),
        h(
          'div',
          { class: 'content akm-card-body' },
          pix(`card-big-${id}`, () => paintAnimalCard(id, 128, 96), 2, a.name),
          h(
            'div',
            {},
            h('p', { class: 'akm-card-lives', text: `Lives in ${HABITAT_INFO[a.home].the}${a.layer ? ` (${RAINFOREST_LAYERS[a.layer].name.toLowerCase()})` : ''}.` }),
            h('p', { text: a.facts[0] }),
            h('p', { text: a.facts[1] }),
            h('p', { class: 'small-note', text: `What helps it there: ${a.part.charAt(0).toLowerCase()}${a.part.slice(1)}.` }),
          ),
        ),
        h('footer', { class: 'akm-foot' }, h('span', {}), h('button', { class: 'btn primary', type: 'button', text: 'Back', 'data-autofocus': true, onclick: () => modal.close() })),
      );
      const modal = new Modal(this.host, root, () => {
        stopSpeaking();
        resolve();
      });
      speak(`${a.name}. ${a.facts[0]} ${a.facts[1]}`);
    });
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.badgeEl = h('span', { class: 'akm-badges', role: 'img' });
    const bar = h('div', { class: 'panel akm-hudbar' }, this.badgeEl);
    this.promptEl = h('button', { class: 'panel prompt', type: 'button', hidden: true, onclick: () => this.target && this.use(this.target) });
    this.hud = h('div', { class: 'hud', hidden: true }, bar, this.promptEl);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'jobs', label: 'Trips', icon: 'scroll', key: 'J', onClick: () => this.openJobList() },
      { id: 'journal', label: 'Journal', icon: 'star', key: 'B', onClick: () => this.openJournal() },
      { id: 'kiki', label: 'Kiki', icon: 'question', key: 'K', onClick: () => void this.kikiHelp() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    window.addEventListener('keydown', (e) => {
      if (this.mode !== 'world' || document.querySelector('.modal-back') || this.talk.isOpen) return;
      const k = e.key.toLowerCase();
      if (k === 'j') this.openJobList();
      else if (k === 'b') this.openJournal();
      else if (k === 'k') void this.kikiHelp();
    });
    this.touch = new TouchControls(this.hud, this.input, () => this.target && this.use(this.target));
    this.touch.setVisible(false);
  }

  private renderHud(): void {
    const sv = this.save;
    const t = this.trip;
    const here = t ? TRIP_ANIMALS[t].length : 0;
    const seen = t ? this.spottedNow.size : 0;
    this.badgeEl.replaceChildren(
      ...HABITATS.map((hab) => pix(`patch-${hab}-${sv.done.includes(hab)}-${this.isOpen(hab)}`, () => paintPatch(hab, sv.done.includes(hab), this.isOpen(hab)), 1.4)),
      pix('binoculars', () => paintBinoculars(2), 1),
      h('span', { class: 'akm-badge-text', text: t ? `Spotted ${seen} of ${here}` : `Journal ${sv.journal.length}/${JOURNAL_ORDER.length}` }),
    );
    this.badgeEl.setAttribute(
      'aria-label',
      `${sv.done.length} of 4 patches. ${t ? `${seen} of ${here} animals spotted in ${AREA_NAME[t]}.` : `${sv.journal.length} of ${JOURNAL_ORDER.length} animals in the Ranger Journal.`}`,
    );
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
  }

  private openJobList(): void {
    if (this.mode !== 'world') return;
    const sv = this.save;
    const status = (t: Trip): string => {
      if (sv.done.includes(t)) return 'Patch earned!';
      if (!OPEN_TRIPS.includes(t)) return 'Coming soon.';
      if (!this.isOpen(t)) return `Opens after ${AREA_NAME[TRIPS[TRIPS.indexOf(t) - 1]]}.`;
      const step = this.stepOf(t);
      if (step === 'spot') return `Spot the animals: ${toSpot(t).filter((id) => sv.journal.includes(id)).length} of ${toSpot(t).length} in your journal.`;
      if (step === 'rescue') return 'Help Dr. Amara at the Rescue Center.';
      return `Ranger Journal: ${sv.stars[t]} of ${STARS_PER_TRIP} stars.`;
    };
    const go = (t: Trip) => () => {
      modal.close();
      const step = this.stepOf(t);
      if (this.world.area !== 'camp' && step !== 'spot') return void this.travel('camp');
      if (step === 'rescue') {
        const amara = this.world.targets.find((x) => x.id === 'amara');
        if (amara) this.world.walkTo(amara);
      } else if (step === 'journal') this.openPanel(t);
      else void this.goOnTrip(t);
    };
    const rows = TRIPS.map((t) => {
      const done = sv.done.includes(t);
      const open = this.isOpen(t);
      return h(
        'li',
        { class: `belt-row${open || done ? '' : ' soon'}` },
        pix(`patch-${t}-${done}-${open}`, () => paintPatch(t, done, open), 2),
        h('div', { class: 'belt-info' }, h('strong', { text: TRIP_INFO[t].name }), h('span', { text: status(t) })),
        open && !done && this.trip !== t ? h('button', { class: 'btn small', type: 'button', text: 'Go', onclick: go(t) }) : null,
      );
    });
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jobs-title', style: 'width:min(640px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'jobs-title', text: 'Habitat trips' }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h('p', {
          class: 'small-note',
          style: 'margin:0 0 10px',
          text: 'On each trip: spot the animals with your binoculars, help lost animals home at the Rescue Center, then earn 5 stars in your Ranger Journal. A star is for getting it right the first time. Each trip earns a Junior Ranger patch.',
        }),
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
        const ok = await choose(this.host, 'Start over?', 'This erases your Ranger Journal and patches in this browser. Settings are kept.', [
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
      'live-anywhere': 'thinking any animal could live anywhere',
      'just-a-place': 'thinking a home is just a place, not food, water, shelter and space',
      'needs-mixup': 'mixing up what an animal needs',
      'habitat-mixup': 'mixing up what a habitat is like',
      'layer-mixup': 'mixing up the rainforest’s layers',
      'change-color': 'thinking animals change color whenever they like',
      'bright-safe': 'thinking bright colors mean safe or friendly',
      'trees-no-matter': 'thinking losing its trees would not matter to an animal',
      'choose-body': 'thinking an animal can choose or change its body',
      'part-mixup': 'picking a body part that helps somewhere else',
      'hump-water': 'thinking a camel’s hump holds water',
      'always-hot': 'thinking every desert is hot all the time',
      'night-mixup': 'mixing up when and why animals are busy',
      'wrong-reason': 'picking a reason that does not explain it',
    };
    const sv = this.save;
    const row = (name: string, status: string, rec: ReturnType<typeof skill> | undefined, mis: string | null, level = true) =>
      h(
        'tr',
        {},
        h('th', { scope: 'row', text: name }),
        h('td', { text: status }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec && level ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? (WORDS[mis] ?? '–') : '–' }),
      );
    const rows = OPEN_TRIPS.map((t) => {
      const rec = sv.learner[t];
      const mis = topMisconception(rec) ?? topMisconception(sv.learner[`${t}-talk`]);
      const step = this.stepOf(t);
      const status = sv.done.includes(t)
        ? 'Done'
        : step === 'spot'
          ? sv.visited.includes(t)
            ? 'Spotting animals'
            : 'Not started'
          : step === 'rescue'
            ? 'Rescue Center next'
            : step === 'journal'
              ? 'Ranger Journal in progress'
              : 'Not open yet';
      return row(`${TRIP_INFO[t].name} (${TRIP_INFO[t].skill.toLowerCase()})`, status, rec, mis);
    });
    const res = sv.learner.rescue;
    const resMis = topMisconception(res) ?? topMisconception(sv.learner['rescue-gives']) ?? topMisconception(sv.learner['rescue-part']);
    rows.push(row('The Rescue Center (matching animals with their homes)', `${sv.homes} animals taken home`, res, resMis));
    return h(
      'div',
      {},
      h('p', {
        text: `This summary is kept only in this browser. Patches: ${sv.done.length} of 4 (the Poles and the Wetland and Sea come in the next update). Ranger Journal: ${sv.journal.length} of ${JOURNAL_ORDER.length} animals photographed. Animals taken home from the Rescue Center: ${sv.homes}.`,
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
      area: this.world.area,
      player: { x: this.world.me.x, y: this.world.me.y },
      target: this.target ? this.target.id : null,
      stars: { ...this.save.stars },
      played: { ...this.save.played },
      done: [...this.save.done],
      visited: [...this.save.visited],
      spottedAll: [...this.save.spottedAll],
      rescued: [...this.save.rescued],
      journal: [...this.save.journal],
      spottedNow: [...this.spottedNow],
      unspotted: this.world.unspotted().map((t) => t.who),
      kikiPoints: this.world.kikiPoints,
      homes: this.save.homes,
      talking: this.talk.isOpen,
      spot: this.spot ? this.spot.state() : null,
      rescue: this.rescue ? this.rescue.state() : null,
      halfDoneSeen: this.save.halfDoneSeen,
      mapAt: MAP_SIGN,
      panel:
        pnl && q
          ? {
              trip: pnl.trip,
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
