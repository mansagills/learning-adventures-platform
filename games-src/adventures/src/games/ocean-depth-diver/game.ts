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
import { LANI_KAHALE, RANGER_TALA, paintFinnPortrait } from '../../kit/worlds/wild-lands/art';
import { ANIMAL_ORDER, ANIMALS, ANIMALS_IN, dials, ZONE_INFO, type AnimalId, type Zone } from './animals';
import { paintAnimalCard, paintBelow, paintChain, paintColors, paintCoralHead, paintCreature, paintDesignerIcon, paintDialFaces, paintMigrate, paintZoneBadge, paintZoneChart } from './art';
import {
  ALL_DONE,
  CHASE_DONE,
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  DESIGNER,
  DESIGNER_LOCKED,
  DIVE_TIP_KEYS,
  DIVE_TIP_TOUCH,
  EXPEDITIONS,
  FINN,
  FINN_HELLO,
  GROWNUPS,
  OPENING,
  OPENING_END,
  PEOPLE,
  praise,
  STARS_PER_STATION,
  SURFACE_LINE,
  TWILIGHT_LOCKED,
  type PersonId,
} from './content';
import { CHALLENGES, type ChallengeId } from './designer';
import { describe, openDesigner } from './designerUi';
import { OceanDive } from './dive';
import { CAMP_SONG, DEEP_SONG, LAB_SONG, REEF_SONG } from './music';
import { pix } from './pix';
import { bank, makeQuestion, STATIONS, type ChainLink, type Choice, type Misconception, type Question, type Station, type Tier } from './problems';
import { freshSave, MAX_CREATURES, PARTS, store, type DiverSave, type Part } from './save';
import { CampWorld, PEOPLE_SPOTS, type Target } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_STATION = 12;

const LOOKS: Record<PersonId, Look16> = { lani: LANI_KAHALE, tala: RANGER_TALA };
const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };
const PART_NAME: Record<Part, string> = { sunlight: 'The sunlight zone', twilight: 'The twilight zone', designer: 'The Creature Designer' };
const LINK_NAME: Record<ChainLink, string> = {
  sun: 'Sun',
  plankton: 'Plankton',
  smallfish: 'Small fish',
  bigfish: 'Bigger fish',
  seagrass: 'Seagrass',
  turtle: 'Sea turtle',
  lanternfish: 'Lanternfish',
};

type Mode = 'title' | 'world' | 'busy' | 'panel' | 'dive';

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
  private readonly world: CampWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: DiverSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private badgeEl!: HTMLElement;
  private diveBar!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<PersonId | 'finn', Speaker>;
  private panel: Panel | null = null;
  private dive: OceanDive | null = null;
  private designer: Modal | null = null;
  private praiseCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-wild');
    this.save = store.exists() ? store.load() : freshSave();
    this.world = new CampWorld(host);
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
      lani: speaker('lani', 200),
      tala: speaker('tala', 160),
      finn: {
        name: FINN.name,
        role: FINN.role,
        voice: 320,
        portrait: (e: Expression) => {
          const key = `finn-${e === 'thinking' ? 0 : 1}`;
          let u = cache.get(key);
          if (!u) cache.set(key, (u = paintFinnPortrait(e !== 'thinking').toDataURL(2)));
          return u;
        },
      },
    };
    audio.addSong('camp', CAMP_SONG);
    audio.addSong('reef', REEF_SONG);
    audio.addSong('deep', DEEP_SONG);
    audio.addSong('lab', LAB_SONG);
    this.world.onArrive = (t) => this.use(t);
    window.addEventListener('resize', () => {
      this.world.resize();
      this.dive?.resize();
    });
    this.world.stage.canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    this.input.onAction((a) => this.onAction(a));
    bus.on('settings:changed', () => {
      this.world.reducedMotion = settings.reducedMotion;
      if (this.dive) this.dive.reducedMotion = settings.reducedMotion;
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
      this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
    });
    this.world.reducedMotion = settings.reducedMotion;
    this.buildHud();
    mountToasts(host);
    window.addEventListener('keydown', (e) => {
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) this.onPanelKey(e);
    });
    (window as unknown as { __odd: unknown }).__odd = {
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
      dive: (z: Station) => this.mode === 'world' && void this.startDive(z),
      diveTo: (x: number, m: number) => this.dive?.teleport(x, m),
      critter: (id: AnimalId) => this.dive?.critterAt(id) ?? null,
      photo: () => this.dive?.photo(),
      designer: () => this.mode === 'world' && void this.useDesigner(),
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
      evening: () => this.world.setTime('evening'),
    };
  }

  start(): void {
    const names = Object.fromEntries((Object.keys(PEOPLE) as PersonId[]).map((id) => [id, PEOPLE[id].name])) as Record<PersonId, string>;
    this.world.build(this.playerLook(), LOOKS, names);
    this.world.setLabOpen(this.save.dived.includes('sunlight'));
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

  private playerLook(): Look16 {
    return look16FromAppearance(this.save.appearance);
  }

  private get allDone(): boolean {
    return PARTS.every((p) => this.save.done.includes(p));
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Ocean Depth Diver',
      subtitle: 'A dive into the ocean’s layers',
      intro: [
        'Join Dr. Lani Kahale and Finn the robot camera at a field camp by the sea. Steer the Little Nautilus down through the ocean’s layers, photograph the animals that live there, and design your own sea creatures.',
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
        noun: 'diver',
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your photos, stars and creatures in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.setLabOpen(false);
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
    await this.talk.say(this.speakers.finn, FINN_HELLO, 'smile');
    await this.talk.say(this.speakers.tala, OPENING_END, 'proud');
    await this.talk.say(this.speakers.tala, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
  }

  /** What Dr. Lani has next: an expedition to start, or a logbook to write up. */
  private laniNext(): Station | null {
    for (const s of STATIONS) {
      if (s === 'twilight' && !this.save.done.includes('sunlight')) return null;
      if (!this.save.done.includes(s)) return s;
    }
    return null;
  }

  private updateMarkers(): void {
    const tala = this.allDone && !this.save.allDoneSeen ? 'new' : null;
    this.world.setMarkers({ lani: this.laniNext() ? 'new' : null, tala });
  }

  // ------------------------------------------------------------ the camp

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
    this.touch?.setActLabel(t.id === 'designer' ? 'Open' : 'Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'panel' || this.mode === 'dive') return;
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
    if (t.id === 'designer') void this.useDesigner();
    else if (t.id === 'lani') void this.talkToLani();
    else void this.talkToTala();
  }

  private async talkToLani(): Promise<void> {
    this.mode = 'busy';
    const lani = this.speakers.lani;
    const sv = this.save;
    // the first time: the sunlight zone's intro, then straight into the sub
    if (!sv.introduced.includes('sunlight')) {
      await this.talk.say(lani, EXPEDITIONS.sunlight.intro);
      sv.introduced.push('sunlight');
      this.persist();
      this.talk.end();
      void this.startDive('sunlight');
      return;
    }
    const options: Array<{ label: string; run: () => void | Promise<void> }> = [];
    for (const s of STATIONS) {
      const info = EXPEDITIONS[s];
      if (s === 'twilight' && !sv.done.includes('sunlight')) continue;
      const dived = sv.dived.includes(s);
      const done = sv.done.includes(s);
      if (dived && !done) options.push({ label: `Write up the logbook: ${info.name.toLowerCase()}`, run: () => this.openPanel(s) });
      if (s === 'twilight' && !sv.introduced.includes('twilight'))
        options.push({
          label: 'Dive deeper: the twilight zone',
          run: async () => {
            this.mode = 'busy';
            await this.talk.say(lani, EXPEDITIONS.twilight.intro);
            sv.introduced.push('twilight');
            this.persist();
            this.talk.end();
            void this.startDive('twilight');
          },
        });
      else options.push({ label: `${dived ? 'Dive again' : 'Dive'}: ${info.name.toLowerCase()}`, run: () => void this.startDive(s) });
      if (done) options.push({ label: `Logbook practice: ${info.name.toLowerCase()}`, run: () => this.openPanel(s) });
    }
    options.push({ label: 'Not now', run: () => undefined });
    const next = this.laniNext();
    const text = !next
      ? 'You have explored both zones! Dive again any time, or practise with the logbook.'
      : sv.dived.includes(next)
        ? `Your photos from ${EXPEDITIONS[next].name.toLowerCase()} are ready. Let’s write up the logbook!`
        : next === 'twilight' && !sv.introduced.includes('twilight')
          ? 'The sunlight zone is done. Ready to go deeper?'
          : EXPEDITIONS[next].again;
    const i = await this.talk.offer(
      lani,
      text,
      options.map((o) => o.label),
    );
    const pick = options[i];
    if (pick.label.startsWith('Dive deeper')) {
      await pick.run();
      return;
    }
    this.talk.end();
    this.mode = 'world';
    await pick.run();
  }

  private async talkToTala(): Promise<void> {
    this.mode = 'busy';
    const tala = this.speakers.tala;
    if (this.allDone && !this.save.allDoneSeen) {
      await this.talk.say(tala, ALL_DONE, 'proud');
      this.save.allDoneSeen = true;
      this.persist();
      this.updateMarkers();
    }
    const next = this.laniNext();
    const tip = !this.save.dived.includes('sunlight')
      ? 'Dr. Lani is waiting on the dock, by the sub.'
      : !this.save.done.includes('designer') && this.save.dived.includes('sunlight') && this.save.done.includes('sunlight') && !next
        ? 'Have you tried all of Dr. Lani’s challenges in the Creature Designer? The lab tent is just over there.'
        : next
          ? `Next: ${EXPEDITIONS[next].name.toLowerCase()}, with Dr. Lani on the dock.`
          : !this.save.done.includes('designer')
            ? 'Have you tried all of Dr. Lani’s challenges in the Creature Designer? The lab tent is just over there.'
            : 'You have done everything here for now. Great diving!';
    const options = ['Open the field guide', 'Change how I look', 'Not now'];
    const pick = options[await this.talk.offer(tala, tip, options)];
    this.talk.end();
    this.mode = 'world';
    if (pick === options[0]) this.openGuide();
    else if (pick === options[1]) this.customize(false, () => undefined);
  }

  // ------------------------------------------------------------ the Creature Designer

  private async useDesigner(): Promise<void> {
    const sv = this.save;
    if (!sv.dived.includes('sunlight')) {
      this.mode = 'busy';
      await this.talk.say(this.speakers.finn, DESIGNER_LOCKED, 'thinking');
      this.talk.end();
      this.mode = 'world';
      return;
    }
    if (!sv.introduced.includes('designer')) {
      this.mode = 'busy';
      await this.talk.say(this.speakers.lani, DESIGNER.intro);
      this.talk.end();
      sv.introduced.push('designer');
      this.persist();
    }
    this.mode = 'busy';
    this.touch?.setVisible(false);
    audio.play('lab');
    this.designer = openDesigner(this.host, {
      met: [...sv.challenges],
      twilightOpen: sv.dived.includes('twilight'),
      saved: sv.creatures.length,
      maxSaved: MAX_CREATURES,
      seed: sv.seed++,
      onMeet: (id: ChallengeId) => {
        if (!sv.challenges.includes(id)) sv.challenges.push(id);
        this.persist();
      },
      onSave: (name, parts) => {
        sv.creatures = [...sv.creatures, { name, parts }].slice(-MAX_CREATURES);
        this.persist();
      },
      onClose: () => {
        this.designer = null;
        audio.play('camp');
        void this.afterDesigner();
      },
    });
  }

  private async afterDesigner(): Promise<void> {
    const sv = this.save;
    if (!sv.done.includes('designer') && CHALLENGES.every((c) => sv.challenges.includes(c.id))) {
      this.mode = 'busy';
      const lani = this.speakers.lani;
      await this.talk.say(lani, 'All four challenges met! Before you go, one question.', 'proud');
      const res = await this.talk.ask(lani, DESIGNER.debrief, () => audio.hint());
      recordAnswer(sv.learner, 'designer-talk', { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
      sv.done.push('designer');
      this.persist();
      audio.levelUp();
      toast('The Creature Designer badge is yours!', 'reward');
      await this.talk.say(lani, DESIGNER.done, 'proud');
      this.talk.end();
      this.updateMarkers();
    }
    this.renderHud();
    this.mode = 'world';
    this.touch?.setVisible(touchControlsVisible());
  }

  // ------------------------------------------------------------ the dive

  private async startDive(zone: Station): Promise<void> {
    if (zone === 'twilight' && !this.save.done.includes('sunlight')) {
      this.mode = 'busy';
      await this.talk.say(this.speakers.lani, TWILIGHT_LOCKED);
      this.talk.end();
      this.mode = 'world';
      return;
    }
    this.mode = 'dive';
    this.touch?.setVisible(false);
    this.promptEl.hidden = true;
    this.renderHud();
    audio.play(zone === 'sunlight' ? 'reef' : 'deep');
    // a dive always starts fresh: every animal is there to photograph again
    const dive = new OceanDive(this.host, zone, [], this.hud);
    dive.reducedMotion = settings.reducedMotion;
    this.dive = dive;
    const shots = new Set<AnimalId>();
    this.renderDiveBar(zone, shots);
    dive.onPhoto = (id) => {
      shots.add(id);
      void this.photoCard(id).then(() => {
        this.renderDiveBar(zone, shots);
        dive.resume();
      });
    };
    dive.onAllPhotos = async () => {
      const info = EXPEDITIONS[zone];
      if (zone === 'sunlight') await this.talk.say(this.speakers.finn, info.allPhotos, 'smile');
      else {
        await this.talk.say(this.speakers.lani, info.allPhotos, 'smile');
        dive.startChase();
      }
      this.talk.end();
      this.renderDiveBar(zone, shots);
      dive.resume();
    };
    dive.onSurface = async () => {
      await this.talk.say(this.speakers.finn, SURFACE_LINE, 'smile');
      this.talk.end();
      await this.finishDive(zone);
    };
    dive.onChaseDone = async () => {
      await this.talk.say(this.speakers.finn, CHASE_DONE, 'smile');
      this.talk.end();
      await this.finishDive(zone);
    };
    if (!this.save.diveTipSeen) {
      dive.paused = true;
      await this.talk.say(this.speakers.finn, isTouchDevice() ? DIVE_TIP_TOUCH : DIVE_TIP_KEYS, 'smile');
      this.talk.end();
      this.save.diveTipSeen = true;
      this.persist();
      dive.resume();
    }
  }

  /** The dive's work is done: back to camp, and on to the logbook. */
  private async finishDive(zone: Station): Promise<void> {
    if (!this.save.dived.includes(zone)) this.save.dived.push(zone);
    this.persist();
    this.leaveDive(zone === 'twilight' ? 'evening' : 'day');
    if (zone === 'sunlight') this.world.setLabOpen(true);
    if (!this.save.done.includes(zone)) {
      this.mode = 'busy';
      await this.talk.say(this.speakers.lani, EXPEDITIONS[zone].logbook, 'smile');
      this.talk.end();
      this.mode = 'world';
      this.openPanel(zone);
    }
  }

  /** Back to the camp from the dive (the photos taken are kept). */
  private leaveDive(time: 'day' | 'evening' = 'day'): void {
    this.dive?.dispose();
    this.dive = null;
    this.world.setTime(time);
    const s = PEOPLE_SPOTS.lani;
    this.world.placePlayer(s.x - 1.4, s.y, 'right');
    this.diveBar.hidden = true;
    this.mode = 'world';
    audio.play('camp');
    this.updateMarkers();
    this.renderHud();
    this.touch?.setVisible(touchControlsVisible());
  }

  private renderDiveBar(zone: Station, shots: Set<AnimalId>): void {
    const list = ANIMALS_IN[zone];
    const st = this.dive?.state;
    this.diveBar.hidden = false;
    const parts: HTMLElement[] = [h('strong', { text: EXPEDITIONS[zone].name })];
    if (st?.chase)
      parts.push(
        h(
          'span',
          { class: 'odd-meter' },
          h('span', { text: 'Follow the lanternfish' }),
          h(
            'span',
            { class: 'odd-meter-bar', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(st.chase.progress * 100)) },
            h('span', { style: `width:${Math.round(st.chase.progress * 100)}%` }),
          ),
        ),
      );
    else
      parts.push(
        ...list.map((id) => h('span', { class: `odd-shot${shots.has(id) ? ' got' : ''}`, text: ANIMALS[id].name })),
        h('span', { class: 'odd-shot-count', text: `Photos ${list.filter((id) => shots.has(id)).length} of ${list.length}` }),
      );
    parts.push(
      h('button', { class: 'btn small', type: 'button', text: 'Back to camp', onclick: () => this.mode === 'dive' && !this.talk.isOpen && !document.querySelector('.modal-back') && this.leaveDive() }),
    );
    this.diveBar.replaceChildren(...parts);
    if (st?.chase?.on) {
      // keep the meter moving while the chase is on
      requestAnimationFrame(() => setTimeout(() => this.dive && this.dive.state.chase?.on && this.renderDiveBar(zone, shots), 250));
    }
  }

  /** Finn's photo: the animal's card goes into the field guide. */
  private photoCard(id: AnimalId): Promise<void> {
    const a = ANIMALS[id];
    const isNew = !this.save.photos.includes(id);
    if (isNew) {
      this.save.photos.push(id);
      this.persist();
    }
    audio.itemGet();
    return new Promise((resolve) => {
      const root = h(
        'div',
        { class: 'panel modal odd-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'card-title' },
        h('header', {}, h('h2', { id: 'card-title', text: isNew ? `New photo: ${a.name}` : `Photo: ${a.name}` })),
        h(
          'div',
          { class: 'content odd-card-body' },
          pix(`card-${id}`, () => paintAnimalCard(id, a.zone), 3, a.name),
          h('div', {}, h('p', { class: 'odd-card-lives', text: `${ZONE_INFO[a.zone].name}. Lives: ${a.lives}.` }), h('p', { text: a.facts[0] }), h('p', { text: a.facts[1] })),
        ),
        h(
          'footer',
          { class: 'odd-foot' },
          h('span', { class: 'small-note', text: isNew ? `In the field guide: ${this.save.photos.length} of ${ANIMAL_ORDER.length}` : 'Already in the field guide' }),
          h('button', { class: 'btn primary', type: 'button', text: 'Keep diving', 'data-autofocus': true, onclick: () => modal.close() }),
        ),
      );
      const modal = new Modal(this.host, root, () => {
        stopSpeaking();
        resolve();
      });
      speak(`${a.name}. ${a.facts[0]} ${a.facts[1]}`);
    });
  }

  // ------------------------------------------------------------ the logbook (the question panel)

  private openPanel(station: Station): void {
    const prevMode = this.mode;
    this.mode = 'panel';
    this.touch?.setVisible(false);
    audio.play('lab');
    const who = this.speakers.lani;
    const level = h('span', { class: 'odd-level' });
    const stars = h('span', { class: 'odd-stars', role: 'img' });
    const prompt = h('p', { class: 'odd-prompt' });
    const speakBtn = h('button', { class: 'btn small odd-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => speak(prompt.textContent ?? '', { force: true }));
    const feedback = h('div', { class: 'odd-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const pic = h('div', { class: 'odd-pic' });
    const model = h('div', { class: 'odd-model', hidden: true });
    const choices = h('div', { class: 'odd-choices' });
    const hintBtn = h(
      'button',
      { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' },
      iconImg('bulb', '', 22),
      h('span', { text: 'Hint' }),
      h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }),
    );
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' });
    const face = h('img', { class: 'odd-host', src: who.portrait('smile'), alt: who.name, width: 64, height: 64 });
    const root = h(
      'div',
      { class: `panel modal odd-panel odd-${station}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'odd-title' },
      h(
        'header',
        {},
        h('h2', { id: 'odd-title', text: `Logbook: ${EXPEDITIONS[station].name.toLowerCase()}` }),
        h(
          'div',
          { class: 'odd-head-right' },
          level,
          stars,
          h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }),
        ),
      ),
      h('div', { class: 'odd-ask' }, face, prompt, speakBtn),
      h('div', { class: 'odd-body' }, pic, model),
      choices,
      feedback,
      h('footer', { class: 'odd-foot' }, hintBtn, next),
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
        { class: 'odd-options' },
        ...q.choices.map((c, i) =>
          h(
            'button',
            { class: 'btn odd-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), 'aria-label': `${i + 1}: ${c.label}`, onclick: () => this.pick(c) },
            h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
            h('span', { class: 'odd-choice-text', text: c.label }),
          ),
        ),
      ),
    );
    this.renderStars();
    speak(q.ask);
    requestAnimationFrame(() => pnl.choices.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
  }

  private tag(text: string, x: number, y: number, cls = ''): HTMLElement {
    return h('span', { class: `odd-tag${cls ? ` ${cls}` : ''}`, style: `left:${x * 100}%;top:${y * 100}%`, text });
  }

  /** The picture above the question; hint 2 can add labels or a model picture under it. */
  private renderPic(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const q = pnl.q;
    const done = pnl.answered;
    const hinted = (m: typeof q.model) => pnl.hintRung >= 2 && !done && q.model === m;
    const pic = q.pic;
    let el: HTMLElement;
    if (pic.k === 'animal') {
      const a = ANIMALS[pic.id];
      el = h(
        'div',
        { class: 'odd-sky' },
        pix(`card-${pic.id}`, () => paintAnimalCard(pic.id, a.zone), 3, a.name),
        this.tag(a.name, 0.5, 0.86, 'small'),
      );
    } else if (pic.k === 'coral') {
      const show = done || hinted('zones');
      el = h(
        'div',
        { class: 'odd-sky' },
        pix('coral', () => paintCoralHead(120, 72), 2.5, 'A coral head up close, with tiny algae inside'),
        ...(show ? [this.tag('Tiny algae live inside', 0.8, 0.52, 'small')] : []),
        this.tag('Coral (tiny animals)', 0.36, 0.86, 'small'),
      );
    } else if (pic.k === 'zones') {
      el = this.zoneChart(pic.mark, done || hinted('zones'));
    } else if (pic.k === 'chain') {
      const blank = done || hinted('chain') ? -1 : (pic.blank ?? -1);
      const { buf, xs } = paintChain(150, 44, pic.links, blank);
      el = h(
        'div',
        { class: 'odd-sky' },
        pix(`chain-${pic.links.join('.')}-${blank}`, () => buf, 2.5, 'A food chain'),
        ...pic.links.map((l, i) => this.tag(i === blank ? '?' : LINK_NAME[l], xs[i], 0.8, 'small')),
        ...(done || hinted('chain') ? [this.tag('The arrows mean "is eaten by"', 0.5, 0.02, 'small')] : []),
      );
    } else if (pic.k === 'colors') {
      const show = done || hinted('colors');
      el = h(
        'div',
        { class: 'odd-sky' },
        pix('colors', () => paintColors(120, 72), 2.5, 'Sunlight going down into the sea, losing its colors'),
        ...(show ? [this.tag('Red is gone first', 0.24, 0.26, 'small'), this.tag('Blue goes deepest', 0.74, 0.84, 'small')] : []),
      );
    } else if (pic.k === 'below') {
      const glow = pic.glow || done;
      el = h(
        'div',
        { class: 'odd-sky' },
        pix(
          `below-${glow}`,
          () => paintBelow(120, 72, glow),
          2.5,
          glow ? 'A fish seen from below, its glowing belly matching the light above' : 'A fish seen from below, a dark shape against the light above',
        ),
        this.tag('Looking up from below', 0.5, 0.04, 'small'),
        this.tag('A hunter below', 0.78, 0.66, 'small'),
      );
    } else if (pic.k === 'dials') {
      el = this.dialPic(pic.depth);
    } else {
      el = h(
        'div',
        { class: 'odd-sky' },
        pix('migrate', () => paintMigrate(140, 72), 2.5, 'Lanternfish deep down in the day, and near the top at night'),
        this.tag('Day', 0.25, 0.86, 'small'),
        this.tag('Night', 0.75, 0.86, 'small'),
      );
    }
    pnl.pic.replaceChildren(el);
    if (pnl.hintRung >= 2 && !done) this.renderModel();
  }

  private zoneChart(mark: Zone | null, labels: boolean, scale = 2.2): HTMLElement {
    const { buf, mids } = paintZoneChart(140, 84, mark);
    const tags = labels
      ? (['sunlight', 'twilight', 'midnight', 'vents'] as Zone[]).map((z) => this.tag(`${ZONE_INFO[z].name}: ${ZONE_INFO[z].depth}`, 0.42, Math.max(0.02, mids[z] - 0.08), 'small'))
      : [this.tag('The sub is here', 0.78, Math.max(0.02, mids[mark ?? 'sunlight'] + 0.06), 'small')];
    return h(
      'div',
      { class: 'odd-sky' },
      pix(`zones-${mark}`, () => buf, scale, 'The ocean’s layers, from the sunny top to the dark deep'),
      ...tags,
    );
  }

  private dialPic(depth: number, scale = 2.5): HTMLElement {
    const d = dials(depth);
    return h(
      'div',
      { class: 'odd-sky' },
      pix('dials', () => paintDialFaces(120, 48), scale, `The sub’s dials at ${depth} meters`),
      this.tag(`${d.depth} m`, 0.18, 0.32),
      this.tag(`${d.temp} °C`, 0.5, 0.32),
      this.tag(`${d.pressure}×`, 0.82, 0.32),
      this.tag('Depth', 0.18, 0.82, 'small'),
      this.tag('Water', 0.5, 0.82, 'small'),
      this.tag('Pressure', 0.82, 0.82, 'small'),
    );
  }

  /** Hint 2's picture, when the question's own picture does not already show it. */
  private renderModel(): void {
    const pnl = this.panel!;
    const q = pnl.q;
    const show = (...els: HTMLElement[]) => {
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('div', { class: 'odd-row odd-model-row' }, ...els));
    };
    if (q.model === 'zones' && q.pic.k !== 'zones') show(this.zoneChart(null, true, 1.6));
    else if (q.model === 'chain' && q.pic.k !== 'chain') {
      const links: ChainLink[] = ['sun', 'plankton', 'smallfish', 'bigfish'];
      const { buf, xs } = paintChain(150, 44, links);
      show(
        h(
          'div',
          { class: 'odd-sky' },
          pix('chain-model', () => buf, 1.8, 'A food chain: the Sun, plankton, small fish, bigger fish'),
          ...links.map((l, i) => this.tag(LINK_NAME[l], xs[i], 0.8, 'small')),
        ),
      );
    } else if (q.model === 'colors' && q.pic.k !== 'colors')
      show(
        h(
          'div',
          { class: 'odd-sky' },
          pix('colors', () => paintColors(120, 72), 1.6, 'Sunlight losing its colors as it goes down'),
          this.tag('Red is gone first', 0.24, 0.26, 'small'),
          this.tag('Blue goes deepest', 0.74, 0.84, 'small'),
        ),
      );
    else if (q.model === 'below')
      show(
        h(
          'div',
          { class: 'odd-sky' },
          pix('below-false', () => paintBelow(120, 72, false), 1.4, 'From below, a fish with no lights shows as a dark shape'),
          this.tag('No belly lights', 0.5, 0.04, 'small'),
        ),
        h(
          'div',
          { class: 'odd-sky' },
          pix('below-true', () => paintBelow(120, 72, true), 1.4, 'From below, a fish with a glowing belly blends into the light'),
          this.tag('Belly lights on', 0.5, 0.04, 'small'),
        ),
      );
    else if (q.model === 'migrate' && q.pic.k !== 'migrate')
      show(
        h(
          'div',
          { class: 'odd-sky' },
          pix('migrate', () => paintMigrate(140, 72), 1.6, 'Lanternfish deep down in the day, and near the top at night'),
          this.tag('Day', 0.25, 0.86, 'small'),
          this.tag('Night', 0.75, 0.86, 'small'),
        ),
      );
    else if (q.model === 'dials')
      show(
        h('div', { class: 'odd-sky' }, this.dialPic(10, 1.6), this.tag('At 10 meters', 0.5, 0.02, 'small')),
        h(
          'div',
          { class: 'odd-sky' },
          this.dialPic(q.pic.k === 'dials' && q.pic.depth !== 200 ? q.pic.depth : 200, 1.6),
          this.tag(`At ${q.pic.k === 'dials' && q.pic.depth !== 200 ? q.pic.depth : 200} meters`, 0.5, 0.02, 'small'),
        ),
      );
    else if (q.model === 'card' && q.pic.k === 'animal') {
      const a = ANIMALS[q.pic.id];
      pnl.model.hidden = false;
      pnl.model.replaceChildren(h('p', { class: 'odd-model-fact', text: `From the field guide: ${a.facts[0]}` }));
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
      pnl.choices.querySelector<HTMLButtonElement>('.odd-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `odd-feedback ${kind}`;
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
      void this.finishExpedition(st);
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
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.odd-choice')[Number(k) - 1];
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

  private async finishExpedition(st: Station): Promise<void> {
    this.mode = 'busy';
    audio.play('camp');
    const info = EXPEDITIONS[st];
    const lani = this.speakers.lani;
    await this.talk.say(lani, 'Five stars! Before you go, one question.', 'proud');
    const res = await this.talk.ask(lani, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${st}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(st);
    this.persist();
    this.updateMarkers();
    audio.levelUp();
    toast(`${info.name} is on the zone chart! ${this.save.done.length} of 3`, 'reward');
    await this.talk.say(lani, info.done, 'proud');
    this.talk.end();
    this.renderHud();
    if (this.allDone) {
      await this.talk.say(this.speakers.tala, 'Wow, you have done it all! Come and see me by the campfire.', 'proud');
      this.talk.end();
    }
    this.mode = 'world';
  }

  // ------------------------------------------------------------ the field guide

  private openGuide(): void {
    if (this.mode !== 'world') return;
    const card = (id: AnimalId) => {
      const a = ANIMALS[id];
      const got = this.save.photos.includes(id);
      if (!got) return h('figure', { class: 'odd-guide-card' }, h('div', { class: 'odd-guide-empty', text: '?' }), h('figcaption', { text: 'Not photographed yet' }));
      return h(
        'button',
        {
          class: 'btn odd-guide-card',
          type: 'button',
          'aria-label': `${a.name}: read its card`,
          onclick: () => {
            modal.close();
            void this.photoCardView(id);
          },
        },
        pix(`card-${id}`, () => paintAnimalCard(id, a.zone), 1.5, a.name),
        h('span', { text: a.name }),
      );
    };
    const section = (z: Zone) => {
      const list = ANIMALS_IN[z];
      const got = list.filter((id) => this.save.photos.includes(id)).length;
      return [
        h(
          'h3',
          { class: 'odd-guide-head' },
          pix(`badge-${z}-${this.save.done.includes(z as Station)}`, () => paintZoneBadge(z, this.save.done.includes(z as Station)), 2),
          h('span', { text: `${ZONE_INFO[z].name} (${ZONE_INFO[z].depth}): ${got} of ${list.length}` }),
        ),
        h('div', { class: 'odd-guide-grid' }, ...list.map(card)),
      ];
    };
    const creatures = this.save.creatures.length
      ? h(
          'div',
          { class: 'odd-guide-grid' },
          ...this.save.creatures.map((c) =>
            h(
              'figure',
              { class: 'odd-guide-card' },
              pix(`cr-${c.parts.body}-${c.parts.eyes}-${c.parts.skin}-${c.parts.light}-${c.parts.mouth}`, () => paintCreature(c.parts, 2, 0, true), 1.4, `${c.name}: ${describe(c.parts)}`),
              h('figcaption', { text: c.name }),
            ),
          ),
        )
      : h('p', { class: 'odd-guide-soon', text: 'Creatures you save in the Creature Designer show up here.' });
    const root = h(
      'div',
      { class: 'panel modal odd-guide', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'guide-title' },
      h(
        'header',
        {},
        h('h2', { id: 'guide-title', text: `Field guide: ${this.save.photos.length} of ${ANIMAL_ORDER.length} photos` }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        ...section('sunlight'),
        ...section('twilight'),
        h('h3', { class: 'odd-guide-head', text: 'Deeper down' }),
        h('p', { class: 'odd-guide-soon', text: 'The midnight zone and the deep sea floor come with the next expeditions.' }),
        h('h3', { class: 'odd-guide-head', text: `My creatures: ${this.save.creatures.length} of ${MAX_CREATURES}` }),
        creatures,
      ),
    );
    const modal = new Modal(this.host, root);
  }

  /** Read a field guide card again (from the guide). */
  private async photoCardView(id: AnimalId): Promise<void> {
    await this.photoCard(id);
    this.openGuide();
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.badgeEl = h('span', { class: 'odd-badges', role: 'img' });
    const bar = h('div', { class: 'panel odd-hudbar' }, this.badgeEl);
    this.diveBar = h('div', { class: 'panel odd-divebar', hidden: true });
    this.promptEl = h('button', { class: 'panel prompt', type: 'button', hidden: true, onclick: () => this.target && this.use(this.target) });
    this.hud = h('div', { class: 'hud', hidden: true }, bar, this.diveBar, this.promptEl);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'jobs', label: 'Expeditions', icon: 'scroll', key: 'J', onClick: () => this.openJobList() },
      { id: 'guide', label: 'Field guide', icon: 'star', key: 'B', onClick: () => this.openGuide() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    window.addEventListener('keydown', (e) => {
      if (this.mode !== 'world' || document.querySelector('.modal-back') || this.talk.isOpen) return;
      const k = e.key.toLowerCase();
      if (k === 'j') this.openJobList();
      else if (k === 'b') this.openGuide();
    });
    this.touch = new TouchControls(this.hud, this.input, () => this.target && this.use(this.target));
    this.touch.setVisible(false);
  }

  private renderHud(): void {
    const sv = this.save;
    const n = sv.done.length;
    this.badgeEl.replaceChildren(
      pix(`badge-sunlight-${sv.done.includes('sunlight')}`, () => paintZoneBadge('sunlight', sv.done.includes('sunlight')), 2),
      pix(`badge-twilight-${sv.done.includes('twilight')}`, () => paintZoneBadge('twilight', sv.done.includes('twilight')), 2),
      pix(`designer-${sv.done.includes('designer')}`, () => paintDesignerIcon(sv.done.includes('designer')), 1.4),
      h('span', { class: 'odd-badge-text', text: `${n} of 3 · Photos ${sv.photos.length}/${ANIMAL_ORDER.length}` }),
    );
    this.badgeEl.setAttribute('aria-label', `${n} of 3 done. ${sv.photos.length} of ${ANIMAL_ORDER.length} photos in the field guide.`);
    const away = this.mode === 'dive';
    for (const id of ['jobs', 'guide']) {
      const b = this.toolbar.button(id);
      if (b) b.hidden = away;
    }
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
    const rows = PARTS.map((p) => {
      const done = sv.done.includes(p);
      const isZone = p !== 'designer';
      const open = p === 'sunlight' || (p === 'twilight' && sv.done.includes('sunlight')) || (p === 'designer' && sv.dived.includes('sunlight'));
      const status = done
        ? 'Done!'
        : !open
          ? p === 'twilight'
            ? 'Opens after the sunlight zone.'
            : 'Opens after your first dive.'
          : isZone
            ? sv.dived.includes(p as Station)
              ? `Photos done. Logbook: ${sv.stars[p as Station]} of 5 stars.`
              : `Dive with Dr. Lani and photograph ${ANIMALS_IN[p as Zone].length} animals.`
            : `Challenges met: ${sv.challenges.length} of ${CHALLENGES.length}.`;
      return h(
        'li',
        { class: `belt-row${open ? '' : ' soon'}` },
        p === 'designer' ? pix(`designer-${done}`, () => paintDesignerIcon(done), 1.4) : pix(`badge-${p}-${done}-${open}`, () => paintZoneBadge(p as Zone, done, open), 2),
        h('div', { class: 'belt-info' }, h('strong', { text: PART_NAME[p] }), h('span', { text: status })),
        h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walkTo(p === 'designer' ? 'designer' : 'lani') }),
      );
    });
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jobs-title', style: 'width:min(640px,100%)' },
      h(
        'header',
        {},
        h('h2', { id: 'jobs-title', text: 'Expeditions' }),
        h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() }),
      ),
      h(
        'div',
        { class: 'content' },
        h('p', {
          class: 'small-note',
          style: 'margin:0 0 10px',
          text: 'Each expedition is a dive with photos, then the logbook with Dr. Lani: 5 stars finishes it. A star is for getting it right the first time. The Creature Designer is finished when all four challenges are met.',
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
        const ok = await choose(this.host, 'Start over?', 'This erases your photos, stars and creatures in this browser. Settings are kept.', [
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
      'zone-order': 'mixing up the ocean’s layers',
      'plants-eat': 'thinking plants catch their food',
      'food-from-soil': 'thinking plants get their food from the sand',
      'diet-mixup': 'mixing up what an animal eats',
      'no-food': 'thinking an animal does not need food',
      'anemone-plant': 'thinking a sea anemone is a plant',
      'wrong-reason': 'picking a reason that does not explain it',
      'color-purpose': 'mixing up what an animal’s color is for',
      'deep-crowded': 'thinking most ocean life lives deep down',
      'chain-backward': 'reading a food chain the wrong way round',
      'water-food': 'thinking water is the source of energy',
      'plankton-alive': 'thinking plankton is not alive',
      'plankton-fish': 'thinking phytoplankton are baby fish',
      'oxygen-trees': 'thinking all our oxygen comes from trees',
      'red-visible': 'thinking red stays bright red deep down',
      'pressure-less': 'thinking the water presses less deeper down',
      'structure-function': 'mixing up what a body part is for',
      'coral-plant': 'thinking coral is a plant',
      'salty-deep': 'thinking deep water is too salty for reefs',
      'chain-link': 'not seeing how one link affects the next',
      'turtle-gills': 'thinking sea turtles have gills',
      'warm-deep': 'thinking deep water is warm',
      'animals-make-food': 'thinking animals make food from sunlight',
      'partner-harm': 'thinking a partnership hurts one partner',
      'clown-stung': 'mixing up the clownfish and the anemone',
      'plants-deep': 'thinking plants grow in the dim deep',
      'eyes-scary': 'thinking big eyes are for looking scary',
      'glow-sun': 'thinking the deep glow is sunlight',
      'glow-battery': 'thinking living light works like a battery',
      'glow-only-attract': 'thinking lights only make an animal easier to see',
      'glow-food': 'thinking living light can make food',
      'migrate-day': 'mixing up when the nightly trip happens',
      'migrate-never': 'thinking deep animals never swim up',
      'migrate-warm': 'thinking the nightly trip is about warmth',
      'snow-literal': 'thinking marine snow is frozen snow',
      'light-carried': 'thinking fish carry sunlight down',
      'bright-hide': 'thinking a bright fish hides well from below',
      'pressure-push': 'thinking deep animals push the water away',
      'one-best': 'thinking one creature design is best everywhere',
    };
    const rows = [...STATIONS, 'designer' as const].map((s) => {
      const rec = this.save.learner[s === 'designer' ? 'designer-talk' : s];
      const mis = topMisconception(rec);
      const name = s === 'designer' ? 'The Creature Designer (challenges and the talk-it-through question)' : `${EXPEDITIONS[s].name} (${EXPEDITIONS[s].skill.toLowerCase()})`;
      const status = this.save.done.includes(s)
        ? 'Done'
        : s === 'designer'
          ? `${this.save.challenges.length} of ${CHALLENGES.length} challenges`
          : this.save.dived.includes(s)
            ? 'Dived; logbook in progress'
            : rec
              ? 'In progress'
              : 'Not started';
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: name }),
        h('td', { text: status }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec && s !== 'designer' ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? (WORDS[mis] ?? '–') : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', {
        text: `This summary is kept only in this browser. Done: ${this.save.done.length} of 3. Field guide photos: ${this.save.photos.length} of ${ANIMAL_ORDER.length}. Creatures saved: ${this.save.creatures.length}.`,
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
      player: { x: this.world.me.x, y: this.world.me.y },
      target: this.target ? this.target.id : null,
      stars: { ...this.save.stars },
      played: { ...this.save.played },
      done: [...this.save.done],
      dived: [...this.save.dived],
      photos: [...this.save.photos],
      challenges: [...this.save.challenges],
      creatures: this.save.creatures.length,
      talking: this.talk.isOpen,
      time: this.world.timeOfDay,
      designer: !!this.designer,
      dive: this.dive ? this.dive.state : null,
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
