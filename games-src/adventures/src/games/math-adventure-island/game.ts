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
import { paintChest, paintMapPiece, paintPipPortrait, paintTorch, paintTrophy } from './art';
import {
  clueHint,
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  FINALE,
  GROWNUPS,
  mistakeLine,
  OP_NAMES,
  OPENING,
  PIECES,
  PIP,
  PIP_GROANS,
  PIP_TAUNTS,
  praise,
  QUIZ_INTRO,
  STAGE_LOCKED,
  STARS_PER_ZONE,
  STEP_TITLES,
  TREASURE_DONE,
  TREASURE_INTRO,
  wordHint,
  ZONE_INFO,
  ZURI,
} from './content';
import { ISLAND_SONG, NIGHT_SONG, QUIZ_SONG } from './music';
import { pix } from './pix';
import {
  BONUS_POINTS,
  CATEGORIES,
  digMistake,
  digSquares,
  makeClue,
  makeQuizQuestion,
  makeWordProblem,
  opMistake,
  OPS,
  quizWinner,
  squareName,
  VALUES,
  ZONES,
  type Category,
  type Misconception,
  type Model,
  type QuizQuestion,
  type Tier,
  type TreasureClue,
  type WordProblem,
  type Zone,
} from './problems';
import { freshSave, store, type IslandSave } from './save';
import { IslandWorld, type Target } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_ZONE = 12;

type Who = Zone | 'zuri';

const LOOKS: Record<Who, CharacterLook> = {
  zuri: {
    build: 'adult',
    skin: { base: '#5a3825', shade: '#462a1b' },
    hair: { style: 'locs', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
    shirt: { base: '#f4f1e8', shade: '#d9d3c4' },
    pants: '#2b3a67',
    shoes: '#2b1d1e',
    accessory: 'cap',
    accent: '#2b3a67',
    extras: { jacket: { base: '#2b3a67', shade: '#202c4f' }, belt: '#c9a227' },
  },
  add: {
    build: 'adult',
    skin: { base: '#9c6440', shade: '#834f31' },
    hair: { style: 'curly', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
    shirt: { base: '#e8832e', shade: '#bb652a' },
    pants: '#f0dca8',
    shoes: '#84502f',
    accessory: 'none',
    accent: '#f2c94c',
    extras: { beard: '#2a1f1d' },
  },
  sub: {
    build: 'adult',
    skin: { base: '#dcaa7e', shade: '#c38f65' },
    hair: { style: 'braids', base: '#4a2f22', shade: '#352016', light: '#664335' },
    shirt: { base: '#d2453a', shade: '#a2362f' },
    pants: '#2b3a67',
    shoes: '#2b1d1e',
    accessory: 'sunhat',
    accent: '#f2c94c',
  },
  mul: {
    build: 'adult',
    skin: { base: '#7a4a2e', shade: '#633b23' },
    hair: { style: 'short', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
    shirt: { base: '#4f9a4a', shade: '#3c7b39' },
    pants: '#5c3822',
    shoes: '#2b1d1e',
    accessory: 'headband',
    accent: '#f2c94c',
  },
  div: {
    build: 'adult',
    skin: { base: '#f0c9a4', shade: '#d9ab86' },
    hair: { style: 'long', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
    shirt: { base: '#f2c94c', shade: '#c29a2c' },
    pants: '#2f9a94',
    shoes: '#2b1d1e',
    accessory: 'none',
    accent: '#e8832e',
    extras: { apron: '#e8832e' },
  },
};

type Mode = 'title' | 'world' | 'busy' | 'panel' | 'quiz';

interface StepChoice {
  value: string;
  label: string;
  sub?: string;
  correct: boolean;
  misconception?: Misconception;
}

interface StepDef {
  title: string;
  /** Said under the title (for example Pip's answer to check). */
  note?: string;
  layout: 'wide' | 'ops' | 'nums';
  choices: StepChoice[];
  hint(rung: number): string;
  mistake(m: Misconception): string;
  /** The chip shown once the step is done. */
  done: string;
}

/** One word problem (zones) or treasure clue (Pip), solved in steps. */
interface Panel {
  modal: Modal;
  kind: 'zone' | 'clue';
  zone: Zone | null;
  problem: WordProblem | null;
  clue: TreasureClue | null;
  steps: StepDef[];
  step: number;
  rung: number;
  maxRung: number;
  tries: number;
  missed: boolean;
  recorded: boolean;
  complete: boolean;
  pictureShown: boolean;
  story: HTMLElement;
  chips: HTMLElement;
  stepTitle: HTMLElement;
  stepNote: HTMLElement;
  choices: HTMLElement;
  picture: HTMLElement;
  feedback: HTMLElement;
  hintBtn: HTMLButtonElement;
  next: HTMLButtonElement;
  stars: HTMLElement;
  level: HTMLElement;
}

interface Quiz {
  modal: Modal;
  seed: number;
  you: number;
  pip: number;
  used: Set<string>;
  body: HTMLElement;
  youEl: HTMLElement;
  pipEl: HTMLElement;
  pipLine: HTMLElement;
  question: QuizQuestion | null;
  phase: 'board' | 'question' | 'bonus' | 'reveal' | 'over';
}

const CATEGORY_NAMES: Record<Category, string> = { addsub: 'Add & Subtract', muldiv: 'Times & Share', words: 'Word Problems', estimate: 'Estimate' };

export class Game {
  private readonly r: PixelRenderer;
  private readonly world: IslandWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: IslandSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private torchesEl!: HTMLElement;
  private piecesEl!: HTMLElement;
  private trophyEl!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<Who | 'pip', Speaker>;
  private panel: Panel | null = null;
  private quiz: Quiz | null = null;
  private praiseCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    this.save = store.exists() ? store.load() : freshSave();
    this.r = new PixelRenderer(host);
    this.world = new IslandWorld(this.r);
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: Who | 'pip', name: string, role: string, voice: number): Speaker => ({
      name,
      role,
      voice,
      portrait: (e: Expression) => {
        const key = `${id}-${e}`;
        let u = cache.get(key);
        if (!u) cache.set(key, (u = (id === 'pip' ? paintPipPortrait(e) : paintPortrait(LOOKS[id], e)).toDataURL(id === 'pip' ? 2 : 3)));
        return u;
      },
    });
    this.speakers = {
      zuri: speaker('zuri', ZURI.name, ZURI.role, 150),
      add: speaker('add', ZONE_INFO.add.person.name, ZONE_INFO.add.person.role, 130),
      sub: speaker('sub', ZONE_INFO.sub.person.name, ZONE_INFO.sub.person.role, 230),
      mul: speaker('mul', ZONE_INFO.mul.person.name, ZONE_INFO.mul.person.role, 140),
      div: speaker('div', ZONE_INFO.div.person.name, ZONE_INFO.div.person.role, 210),
      pip: speaker('pip', PIP.name, PIP.role, 420),
    };
    audio.addSong('island', ISLAND_SONG);
    audio.addSong('quiz', QUIZ_SONG);
    audio.addSong('night', NIGHT_SONG);
    this.world.onArrive = (t) => this.use(t);
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
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) this.onPanelKey(e);
      else if (this.quiz && stackTop() === this.quiz.modal) this.onQuizKey(e);
    });
    (window as unknown as { __mai: unknown }).__mai = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      squareScreen: (col: number, row: number) => this.world.screenOf(this.world.squareCenter({ col, row }), 0),
      /** test helpers */
      open: (z: Zone) => this.mode === 'world' && void this.openZone(z),
      clue: () => this.mode === 'world' && void this.openClue(),
      quiz: () => this.mode === 'world' && this.openQuiz(),
      setTier: (key: string, t: Tier) => {
        skill(this.save.learner, key).tier = t;
      },
      teleport: (x: number, y: number) => {
        this.world.stopWalking();
        this.world.player.x = x;
        this.world.player.y = y;
      },
      squareCenter: (col: number, row: number) => this.world.squareCenter({ col, row }),
    };
  }

  start(): void {
    const names = { zuri: ZURI.name, add: ZONE_INFO.add.person.name, sub: ZONE_INFO.sub.person.name, mul: ZONE_INFO.mul.person.name, div: ZONE_INFO.div.person.name };
    this.world.build(this.playerLook(), LOOKS, names, this.save.lit);
    if (this.save.finaleSeen) this.world.setNight(0.75);
    const hunt = this.save.hunt;
    for (let i = 0; i < hunt.found; i++) this.world.addHole(hunt.squares[i]);
    if (this.save.chestOpened) this.world.showChest(true);
    this.updateMarkers();
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.input.worldActive = this.mode === 'world' && !document.querySelector('.modal-back') && !this.talk.isOpen;
      this.world.update(dt, this.mode === 'world' ? this.input : null);
      this.updatePrompt();
      this.world.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private playerLook(): CharacterLook {
    return lookFromAppearance(this.save.appearance);
  }

  private worldSong(): string {
    return this.save.finaleSeen ? 'night' : 'island';
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Math Adventure Island',
      subtitle: 'Light the torches, find the treasure, win the Quiz Show',
      intro: ['Help four islanders with word problems, solve Pip the parrot\'s treasure clues, then beat Pip at the Island Quiz Show.', 'For grades 2 to 5. Every line can be read aloud.'],
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your torches, treasure and trophy in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.setLit([]);
      this.world.setNight(0);
      this.world.clearHoles();
      this.updateMarkers();
    }
    this.titleEl?.remove();
    this.titleEl = null;
    openCustomize(this.host, this.save.appearance, { firstTime: true, noun: 'explorer' }, (a) => {
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
    audio.play(this.worldSong());
    this.renderHud();
    if (!this.save.openingSeen) void this.opening();
  }

  private async opening(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers.zuri, OPENING);
    await this.talk.say(this.speakers.zuri, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'curious');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
  }

  private updateMarkers(): void {
    const all = this.save.lit.length === 4;
    this.world.setMarkers({
      add: this.save.lit.includes('add') ? null : 'new',
      sub: this.save.lit.includes('sub') ? null : 'new',
      mul: this.save.lit.includes('mul') ? null : 'new',
      div: this.save.lit.includes('div') ? null : 'new',
      zuri: all && !this.save.quizWon ? 'turnin' : null,
    });
  }

  // ------------------------------------------------------------ the world

  private digTarget(): Target | null {
    if (!this.save.hunt.digging) return null;
    const sq = this.world.squareUnderPlayer();
    if (!sq) return null;
    return { kind: 'dig', id: 'dig', x: this.world.player.x, y: this.world.player.y, label: `Dig at ${squareName(sq, this.save.hunt.ordered)}` };
  }

  private updatePrompt(): void {
    const t = this.mode === 'world' ? this.digTarget() ?? this.world.nearest() : null;
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
    const s = this.world.screenOf(t, t.kind === 'dig' ? 2.2 : t.kind === 'stage' ? 3.2 : 2.6);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel(t.kind === 'dig' ? 'Dig' : t.kind === 'stage' ? 'Go' : 'Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'panel' || this.mode === 'quiz') return;
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
    if (t.kind === 'dig') void this.dig();
    else if (t.kind === 'pip') void this.talkToPip();
    else if (t.kind === 'stage') void this.useStage();
    else if (t.id === 'zuri') void this.talkToZuri();
    else void this.openZone(t.id as Zone);
  }

  private async talkToZuri(): Promise<void> {
    this.mode = 'busy';
    const lit = this.save.lit.length;
    const next = ZONES.find((z) => !this.save.lit.includes(z));
    const text = this.save.quizWon
      ? 'Champion! The island will talk about your Quiz Show for years. Pip wants a rematch any time you like.'
      : lit === 4
        ? 'All four torches are blazing! The Quiz Show is ready. Head up to the stage and beat that parrot!'
        : `${lit ? `${lit} torch${lit === 1 ? '' : 'es'} lit, ${4 - lit} to go!` : 'No torches lit yet.'} ${ZONE_INFO[next!].person.name} at the ${ZONE_INFO[next!].name} needs help.`;
    const options = lit === 4 ? ['Walk me to the stage', 'Change how I look', 'Bye, Captain!'] : ['Change how I look', 'Bye, Captain!'];
    const pick = await this.talk.offer(this.speakers.zuri, text, options);
    this.talk.end();
    this.mode = 'world';
    const label = options[pick];
    if (label === 'Change how I look') this.changeLook();
    else if (label === 'Walk me to the stage') {
      const s = this.world.targets.find((x) => x.id === 'stage');
      if (s) this.world.walkTo(s);
    }
  }

  private changeLook(): void {
    openCustomize(this.host, this.save.appearance, { firstTime: false, noun: 'explorer' }, (a) => {
      this.save.appearance = a;
      this.persist();
      this.world.player.setLook(this.playerLook());
    });
  }

  // ------------------------------------------------------------ the step panel (zones and clues)

  private async openZone(zone: Zone): Promise<void> {
    this.mode = 'busy';
    const info = ZONE_INFO[zone];
    const who = this.speakers[zone];
    if (!this.save.introduced.includes(zone)) {
      await this.talk.say(who, info.intro);
      this.talk.end();
      this.save.introduced.push(zone);
      this.persist();
    }
    this.buildPanel('zone', zone, info.name, who);
    this.nextProblem();
  }

  private buildPanel(kind: 'zone' | 'clue', zone: Zone | null, title: string, who: Speaker): void {
    this.mode = 'panel';
    this.touch?.setVisible(false);
    const level = h('span', { class: 'mai-level' });
    const stars = h('span', { class: 'mai-stars', role: 'img' });
    const story = h('p', { class: 'mai-story' });
    const speakBtn = h('button', { class: 'btn small mai-speak', type: 'button', 'aria-label': 'Read the problem aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => {
      const pnl = this.panel;
      if (pnl) speak(`${pnl.story.textContent ?? ''} ${pnl.stepTitle.textContent ?? ''} ${pnl.stepNote.textContent ?? ''}`, { force: true });
    });
    const chips = h('div', { class: 'mai-chips' });
    const stepTitle = h('h3', { class: 'mai-step-title' });
    const stepNote = h('p', { class: 'mai-step-note', hidden: true });
    const choices = h('div', { class: 'mai-choices' });
    const picture = h('div', { class: 'mai-picture', hidden: true, 'aria-label': 'Picture hint' });
    const feedback = h('div', { class: 'mai-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const hintBtn = h('button', { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' });
    const face = h('img', { class: 'mai-host', src: who.portrait('smile'), alt: who.name, width: 96, height: 96 });
    const root = h(
      'div',
      { class: `panel modal mai-panel mai-${zone ?? 'pip'}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mai-title' },
      h('header', {}, h('h2', { id: 'mai-title', text: title }), h('div', { class: 'mai-head-right' }, level, stars, h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }))),
      h('div', { class: 'mai-ask' }, face, story, speakBtn),
      h('div', { class: 'mai-body' }, chips, picture, h('div', { class: 'mai-step' }, stepTitle, stepNote, choices)),
      feedback,
      h('footer', { class: 'mai-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closePanel(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterProblem());
    this.panel = { modal, kind, zone, problem: null, clue: null, steps: [], step: 0, rung: 0, maxRung: 0, tries: 0, missed: false, recorded: false, complete: false, pictureShown: false, story, chips, stepTitle, stepNote, choices, picture, feedback, hintBtn, next, stars, level };
  }

  private resetPanel(pnl: Panel, story: string, steps: StepDef[], tier: Tier): void {
    pnl.steps = steps;
    pnl.step = 0;
    pnl.rung = 0;
    pnl.maxRung = 0;
    pnl.tries = 0;
    pnl.missed = false;
    pnl.recorded = false;
    pnl.complete = false;
    pnl.pictureShown = false;
    pnl.story.textContent = story;
    pnl.chips.replaceChildren();
    pnl.picture.hidden = true;
    pnl.picture.replaceChildren();
    pnl.feedback.hidden = true;
    pnl.next.hidden = true;
    pnl.hintBtn.disabled = false;
    pnl.level.textContent = `Level ${tier} of 3`;
    this.renderStars();
    this.renderStep(true);
  }

  private nextProblem(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.zone) return;
    const seed = this.save.seed++;
    this.persist();
    const tier = skill(this.save.learner, pnl.zone).tier as Tier;
    const p = makeWordProblem(pnl.zone, tier, mulberry32(seed));
    pnl.problem = p;
    const ask = p.ask.find((c) => c.correct)!;
    const steps: StepDef[] = [
      {
        title: STEP_TITLES[0],
        layout: 'wide',
        choices: p.ask.map((c) => ({ value: c.value, label: c.label, correct: c.correct, misconception: c.misconception })),
        hint: (k) => wordHint(p, 0, k),
        mistake: (m) => mistakeLine(p, m),
        done: ask.label,
      },
      {
        title: STEP_TITLES[1],
        layout: 'ops',
        choices: OPS.map((o) => ({ value: o, label: o, sub: OP_NAMES[o], correct: o === p.op, misconception: opMistake(p, o) ?? undefined })),
        hint: (k) => wordHint(p, 1, k),
        mistake: (m) => mistakeLine(p, m),
        done: `${OP_NAMES[p.op]} (${p.op})`,
      },
      {
        title: STEP_TITLES[2],
        layout: 'nums',
        choices: p.choices.map((c) => ({ value: String(c.value), label: String(c.value), sub: p.unit, correct: c.correct, misconception: c.misconception })),
        hint: (k) => wordHint(p, 2, k),
        mistake: (m) => mistakeLine(p, m),
        done: `${p.answer} ${p.unit}`,
      },
    ];
    this.resetPanel(pnl, p.story, steps, tier);
  }

  private renderStep(first = false): void {
    const pnl = this.panel;
    if (!pnl) return;
    const st = pnl.steps[pnl.step];
    pnl.rung = 0;
    pnl.tries = 0;
    pnl.stepTitle.textContent = `${pnl.step + 1}. ${st.title}`;
    pnl.stepNote.textContent = st.note ?? '';
    pnl.stepNote.hidden = !st.note;
    pnl.choices.className = `mai-choices ${st.layout}`;
    pnl.choices.replaceChildren(
      ...st.choices.map((c, i) =>
        h(
          'button',
          { class: 'btn mai-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), onclick: () => this.pick(c) },
          h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          h('span', { class: 'mai-choice-text', text: c.label }),
          ...(c.sub ? [h('span', { class: 'mai-choice-sub', text: c.sub })] : []),
        ),
      ),
    );
    speak(first ? `${pnl.story.textContent} ${st.title} ${st.note ?? ''}` : `${st.title} ${st.note ?? ''}`);
    requestAnimationFrame(() => pnl.choices.querySelector<HTMLButtonElement>('button')?.focus());
  }

  private pick(c: StepChoice): void {
    const pnl = this.panel;
    if (!pnl || pnl.complete) return;
    const st = pnl.steps[pnl.step];
    const btn = pnl.choices.querySelector<HTMLButtonElement>(`.mai-choice[data-value="${CSS.escape(c.value)}"]`);
    if (c.correct) {
      audio.correct();
      pnl.chips.append(h('span', { class: 'mai-chip' }, iconImg('check', '', 18), h('span', { text: st.done })));
      pnl.feedback.hidden = true;
      if (pnl.step < pnl.steps.length - 1) {
        btn?.classList.add('right');
        pnl.step++;
        setTimeout(() => this.panel === pnl && this.renderStep(), 220);
        return;
      }
      this.completeProblem(c.value);
      return;
    }
    pnl.tries++;
    pnl.missed = true;
    const mis = c.misconception ?? 'other';
    if (!pnl.recorded) {
      pnl.recorded = true;
      const o = recordAnswer(this.save.learner, this.panelKey(pnl), { correct: false, hintRung: pnl.maxRung, misconception: mis }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let us practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(st.mistake(mis), 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.choices.querySelector<HTMLButtonElement>('.mai-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private panelKey(pnl: Panel): string {
    return pnl.kind === 'zone' ? pnl.zone! : 'treasure';
  }

  private completeProblem(value: string): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.complete = true;
    const clean = !pnl.missed && pnl.maxRung <= 1;
    let tierChange = 0;
    if (!pnl.recorded) {
      pnl.recorded = true;
      tierChange = recordAnswer(this.save.learner, this.panelKey(pnl), { correct: true, hintRung: pnl.maxRung }, RULES).tierChange;
    }
    pnl.choices.querySelector(`.mai-choice[data-value="${CSS.escape(value)}"]`)?.classList.add('right');
    pnl.choices.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
    pnl.hintBtn.disabled = true;
    if (pnl.kind === 'zone' && pnl.zone) {
      const z = pnl.zone;
      this.save.played[z]++;
      if (clean && this.save.stars[z] < STARS_PER_ZONE) this.save.stars[z]++;
      this.persist();
      if (clean) audio.itemGet();
      this.showFeedback(clean ? `${praise(this.praiseCount++)} You win a star. ${pnl.problem!.strategy}` : `You got it! ${pnl.problem!.strategy} Stars are for getting every step right the first time.`, 'good');
      this.renderStars();
      if (pnl.pictureShown) pnl.picture.replaceChildren(modelPicture(pnl.problem!.model, pnl.problem!.answer));
      if (tierChange > 0) toast('Level up! Trickier problems.', 'reward');
      pnl.next.hidden = false;
      requestAnimationFrame(() => pnl.next.focus());
      return;
    }
    // a treasure clue: now go and dig
    const c = pnl.clue!;
    this.save.hunt.digging = true;
    this.save.hunt.ordered = c.ordered;
    this.persist();
    audio.itemGet();
    if (tierChange > 0) toast('Level up! Trickier clues.', 'reward');
    const name = squareName(c.square, c.ordered);
    this.showFeedback(`${clean ? praise(this.praiseCount++) : 'Solved!'} The map piece is buried at ${name}. ${c.ordered ? `Go ${c.square.col + 1} across, then ${c.square.row + 1} up.` : ''} Walk onto the beach grid and dig!`, 'good');
    pnl.next.textContent = `Go dig at ${name}!`;
    pnl.next.hidden = false;
    this.renderHud();
    requestAnimationFrame(() => pnl.next.focus());
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `mai-feedback ${kind}`;
    pnl.feedback.replaceChildren(kind === 'hint' ? iconImg('bulb', '', 22) : kind === 'good' ? iconImg('star', '', 22) : '', h('span', { text }));
    speak(text);
  }

  private hint(rung?: number): void {
    const pnl = this.panel;
    if (!pnl || pnl.complete) return;
    const nextRung = Math.min(3, rung ?? pnl.rung + 1);
    if (nextRung <= pnl.rung && rung === undefined) {
      toast('That is every hint. The answer is outlined!', 'hint');
      return;
    }
    pnl.rung = Math.max(pnl.rung, nextRung);
    pnl.maxRung = Math.max(pnl.maxRung, pnl.rung);
    audio.hint();
    const st = pnl.steps[pnl.step];
    if (pnl.rung >= 2 && pnl.problem && !pnl.pictureShown) {
      pnl.pictureShown = true;
      pnl.picture.replaceChildren(modelPicture(pnl.problem.model));
      pnl.picture.hidden = false;
    }
    if (pnl.rung >= 3) {
      const right = st.choices.find((c) => c.correct)!;
      pnl.choices.querySelector(`.mai-choice[data-value="${CSS.escape(right.value)}"]`)?.classList.add('worked');
    }
    this.showFeedback(`Hint ${pnl.rung} of 3: ${st.hint(pnl.rung)}`, 'hint');
  }

  private renderStars(): void {
    const pnl = this.panel;
    if (!pnl) return;
    if (pnl.kind === 'clue') {
      const n = this.save.hunt.found;
      pnl.stars.replaceChildren(...Array.from({ length: PIECES }, (_, i) => pix(`piece-${i}-${i < n}`, () => paintMapPiece(i, i < n), 1)));
      pnl.stars.setAttribute('aria-label', `${n} of ${PIECES} map pieces`);
      return;
    }
    const n = this.save.stars[pnl.zone!];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_ZONE }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_ZONE} stars`);
  }

  private afterProblem(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.complete) return;
    if (pnl.kind === 'clue') {
      pnl.modal.close();
      return;
    }
    const z = pnl.zone!;
    const rec = skill(this.save.learner, z);
    const ready = this.save.stars[z] >= STARS_PER_ZONE && (rec.tier >= 2 || this.save.played[z] >= MAX_PER_ZONE);
    if (ready && !this.save.lit.includes(z)) {
      pnl.modal.close();
      void this.finishZone(z);
    } else this.nextProblem();
  }

  private onPanelKey(e: KeyboardEvent): void {
    const pnl = this.panel;
    if (!pnl) return;
    const k = e.key.toLowerCase();
    if (k === 'h') {
      e.preventDefault();
      this.hint();
    } else if ((k === ' ' || k === 'enter') && pnl.complete && document.activeElement !== pnl.next) {
      e.preventDefault();
      this.afterProblem();
    } else if (/^[1-4]$/.test(k)) {
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.mai-choice')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closePanel(): void {
    stopSpeaking();
    this.panel = null;
    if (this.mode === 'panel') this.mode = 'world';
    this.touch?.setVisible(touchControlsVisible());
    this.renderHud();
  }

  private async finishZone(z: Zone): Promise<void> {
    this.mode = 'busy';
    const info = ZONE_INFO[z];
    const who = this.speakers[z];
    await this.talk.say(who, 'Five stars! Before I light my torch, one last puzzle.', 'proud');
    const res = await this.talk.ask(who, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${z}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.lit.push(z);
    this.persist();
    this.world.setLit(this.save.lit);
    this.updateMarkers();
    audio.levelUp();
    toast(`The ${info.name} torch is lit!`, 'reward');
    await this.talk.say(who, info.done, 'proud');
    const left = 4 - this.save.lit.length;
    await this.talk.say(this.speakers.zuri, left ? `I can see the ${info.name} torch from here! ${left} more to go.` : 'All four torches are lit! The Quiz Show is open. Meet Pip on the stage!', 'proud');
    this.talk.end();
    this.renderHud();
    this.mode = 'world';
  }

  // ------------------------------------------------------------ the treasure hunt

  private async talkToPip(): Promise<void> {
    this.mode = 'busy';
    const pip = this.speakers.pip;
    const hunt = this.save.hunt;
    if (!this.save.introduced.includes('pip')) {
      await this.talk.say(pip, TREASURE_INTRO, 'proud');
      this.save.introduced.push('pip');
      this.persist();
    }
    if (hunt.digging) {
      const sq = hunt.squares[hunt.found];
      const pick = await this.talk.offer(pip, `Squawk! Dig at ${squareName(sq, hunt.ordered)}! Walk onto the beach grid and press Dig.`, ['How does the grid work?', 'OK, Pip!'], 'curious');
      if (pick === 0)
        await this.talk.say(
          pip,
          hunt.ordered ? ['In (2, 3), the first number goes ACROSS the bottom. The second number goes UP the side.', 'So go across to 2, then up to 3. Across first, then up!'] : ['The letters go across the bottom. The numbers go up the side.', `For ${squareName(sq, false)}: find ${squareName(sq, false)[0]} along the bottom, then go up to ${sq.row + 1}.`],
          'smile',
        );
      this.talk.end();
      this.mode = 'world';
      return;
    }
    const fresh = hunt.squares.length === 0 || hunt.found >= PIECES;
    const text = fresh ? (this.save.chestOpened ? 'Squawk! I hid more treasure. Want another hunt?' : 'Ready to hunt for treasure? Squawk!') : `You have ${hunt.found} of ${PIECES} map pieces. Ready for the next clue?`;
    const pick = await this.talk.offer(pip, text, [fresh ? 'Start a treasure hunt!' : 'Next clue!', 'Not now, Pip']);
    this.talk.end();
    this.mode = 'world';
    if (pick !== 0) return;
    if (fresh) {
      this.save.hunt = { squares: digSquares(mulberry32(this.save.seed++)), found: 0, digging: false, ordered: false };
      this.world.clearHoles();
      this.persist();
    }
    void this.openClue();
  }

  private async openClue(): Promise<void> {
    if (this.save.hunt.squares.length === 0 || this.save.hunt.found >= PIECES) {
      this.save.hunt = { squares: digSquares(mulberry32(this.save.seed++)), found: 0, digging: false, ordered: false };
      this.world.clearHoles();
    }
    this.buildPanel('clue', null, `Treasure clue ${this.save.hunt.found + 1} of ${PIECES}`, this.speakers.pip);
    const pnl = this.panel!;
    const seed = this.save.seed++;
    this.persist();
    const tier = skill(this.save.learner, 'treasure').tier as Tier;
    const c = makeClue(tier, mulberry32(seed), this.save.hunt.squares[this.save.hunt.found]);
    pnl.clue = c;
    const ctx = { estimate: c.estimate };
    const steps: StepDef[] = [
      {
        title: 'Estimate first. Round the numbers. About how much?',
        layout: 'nums',
        choices: c.estimateChoices.map((x) => ({ value: String(x.value), label: `about ${x.value}`, correct: x.correct, misconception: x.misconception })),
        hint: (k) => clueHint(c, 0, k),
        mistake: (m) => mistakeLine(null, m, ctx),
        done: `About ${c.estimate}`,
      },
      {
        title: 'Now work it out exactly.',
        layout: 'nums',
        choices: c.computeChoices.map((x) => ({ value: String(x.value), label: String(x.value), correct: x.correct, misconception: x.misconception })),
        hint: (k) => clueHint(c, 1, k),
        mistake: (m) => mistakeLine(null, m, ctx),
        done: `Exactly ${c.exact}`,
      },
      {
        title: `Pip says: "Squawk! I got ${c.pipAnswer}!" Is Pip's answer reasonable?`,
        note: `Compare it with your estimate of ${c.estimate}.`,
        layout: 'wide',
        choices: [
          { value: 'yes', label: 'Yes, it is close to my estimate', correct: c.reasonable, misconception: c.reasonable ? undefined : 'said-reasonable' },
          { value: 'no', label: 'No, it is way off', correct: !c.reasonable, misconception: c.reasonable ? 'said-unreasonable' : undefined },
        ],
        hint: (k) => clueHint(c, 2, k),
        mistake: (m) => mistakeLine(null, m, ctx),
        done: c.reasonable ? `Pip's ${c.pipAnswer} is reasonable` : `Pip's ${c.pipAnswer} is way off!`,
      },
    ];
    this.resetPanel(pnl, c.story, steps, tier);
  }

  private async dig(): Promise<void> {
    const hunt = this.save.hunt;
    const sq = this.world.squareUnderPlayer();
    if (!hunt.digging || !sq) return;
    this.mode = 'busy';
    const target = hunt.squares[hunt.found];
    const mis = digMistake(sq, target);
    const pip = this.speakers.pip;
    audio.fx(
      [
        [40, 0, 0.08],
        [44, 0.12, 0.08],
        [40, 0.24, 0.08],
      ],
      'square',
      0.1,
    );
    if (mis) {
      recordAnswer(this.save.learner, 'treasure-dig', { correct: false, hintRung: 0, misconception: mis }, RULES);
      this.persist();
      audio.retry();
      await this.talk.say(pip, [`Only sand at ${squareName(sq, hunt.ordered)}! Squawk!`, mistakeLine(null, mis, { square: target, ordered: hunt.ordered, dug: sq })], 'thinking');
      this.talk.end();
      this.mode = 'world';
      return;
    }
    recordAnswer(this.save.learner, 'treasure-dig', { correct: true, hintRung: 0 }, RULES);
    this.world.addHole(sq);
    hunt.found++;
    hunt.digging = false;
    this.persist();
    audio.itemGet();
    this.renderHud();
    toast(`Map piece ${hunt.found} of ${PIECES}!`, 'reward');
    if (hunt.found < PIECES) {
      const pick = await this.talk.offer(pip, `Squawk! A map piece! That makes ${hunt.found} of ${PIECES}. Ready for the next clue?`, ['Next clue!', 'Later, Pip'], 'proud');
      this.talk.end();
      this.mode = 'world';
      if (pick === 0) void this.openClue();
      return;
    }
    // every piece found: the chest
    if (!this.save.chestOpened) {
      this.world.showChest(false);
      await this.talk.say(pip, TREASURE_DONE[0], 'proud');
      this.world.showChest(true);
      audio.levelUp();
      this.save.chestOpened = true;
      this.persist();
      toast('You found the pirate\'s golden coconut!', 'reward');
      await this.talk.say(pip, TREASURE_DONE[1], 'proud');
    } else await this.talk.say(pip, 'Squawk! Another whole map! You are a treasure-hunting pro.', 'proud');
    this.talk.end();
    this.renderHud();
    this.mode = 'world';
  }

  // ------------------------------------------------------------ the quiz show

  private async useStage(): Promise<void> {
    if (this.save.lit.length < 4) {
      this.mode = 'busy';
      await this.talk.say(this.speakers.zuri, STAGE_LOCKED(this.save.lit.length), 'thinking');
      this.talk.end();
      this.mode = 'world';
      return;
    }
    if (!this.save.introduced.includes('quiz')) {
      this.mode = 'busy';
      await this.talk.say(this.speakers.zuri, QUIZ_INTRO, 'proud');
      this.talk.end();
      this.save.introduced.push('quiz');
      this.persist();
      this.mode = 'world';
    }
    this.openQuiz();
  }

  private openQuiz(): void {
    if (this.mode !== 'world') return;
    this.mode = 'quiz';
    this.touch?.setVisible(false);
    audio.play('quiz');
    const youEl = h('strong', { class: 'mai-score you', text: '0' });
    const pipEl = h('strong', { class: 'mai-score pip', text: '0' });
    const pipLine = h('p', { class: 'mai-pip-line', 'aria-live': 'polite', text: 'Squawk! Pick a question!' });
    const body = h('div', { class: 'mai-quiz-body' });
    const root = h(
      'div',
      { class: 'panel modal mai-panel mai-quiz', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mai-quiz-title' },
      h('header', {}, h('h2', { id: 'mai-quiz-title', text: 'Island Quiz Show' }), h('div', { class: 'mai-head-right' }, h('span', { class: 'mai-scorebox' }, h('span', { text: 'You ' }), youEl), h('span', { class: 'mai-scorebox' }, h('span', { text: 'Pip ' }), pipEl), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => modal.close() }))),
      h('div', { class: 'mai-pip-strip' }, h('img', { src: this.speakers.pip.portrait('smile'), alt: 'Pip', width: 56, height: 56 }), pipLine),
      body,
    );
    const modal = new Modal(this.host, root, () => this.closeQuiz(), { closeOnBackdrop: false });
    this.quiz = { modal, seed: this.save.seed, you: 0, pip: 0, used: new Set(), body, youEl, pipEl, pipLine, question: null, phase: 'board' };
    this.save.seed += 40;
    this.persist();
    this.renderBoard();
  }

  private pipSays(text: string, face: Expression = 'smile'): void {
    const q = this.quiz;
    if (!q) return;
    q.pipLine.textContent = text;
    q.modal.root.querySelector<HTMLImageElement>('.mai-pip-strip img')!.src = this.speakers.pip.portrait(face);
  }

  private renderBoard(): void {
    const q = this.quiz;
    if (!q) return;
    q.phase = 'board';
    q.question = null;
    q.youEl.textContent = String(q.you);
    q.pipEl.textContent = String(q.pip);
    if (q.used.size === CATEGORIES.length * VALUES.length) return this.endQuiz();
    const cells: HTMLElement[] = CATEGORIES.map((c) => h('div', { class: 'mai-cat', text: CATEGORY_NAMES[c] }));
    for (const v of VALUES)
      for (const c of CATEGORIES) {
        const id = `${c}-${v}`;
        const used = q.used.has(id);
        cells.push(h('button', { class: `btn mai-tile${used ? ' used' : ''}`, type: 'button', disabled: used, 'aria-label': `${CATEGORY_NAMES[c]} for ${v}`, text: used ? '' : String(v), onclick: () => this.openQuestion(c, v) }));
      }
    q.body.replaceChildren(h('div', { class: 'mai-board' }, ...cells));
    requestAnimationFrame(() => q.body.querySelector<HTMLButtonElement>('.mai-tile:not([disabled])')?.focus());
  }

  private openQuestion(cat: Category, value: number): void {
    const q = this.quiz;
    if (!q || q.phase !== 'board') return;
    q.used.add(`${cat}-${value}`);
    const question = makeQuizQuestion(cat, value, mulberry32(q.seed++));
    q.question = question;
    q.phase = 'question';
    audio.click();
    const choices = h(
      'div',
      { class: 'mai-choices nums' },
      ...question.choices.map((c, i) => h('button', { class: 'btn mai-choice', type: 'button', 'data-value': String(c.value), onclick: () => this.answerQuiz(c.correct, String(c.value)) }, h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }), h('span', { class: 'mai-choice-text', text: c.label }))),
    );
    q.body.replaceChildren(
      h('div', { class: 'mai-question' }, h('p', { class: 'mai-q-head', text: `${CATEGORY_NAMES[cat]} for ${value}` }), h('p', { class: 'mai-q-text', text: question.text }), h('button', { class: 'btn small mai-speak', type: 'button', 'aria-label': 'Read the question aloud', onclick: () => speak(question.text, { force: true }) }, iconImg('speak', '', 22)), choices, h('div', { class: 'mai-q-result', hidden: true })),
    );
    this.pipSays('One try only. Squawk!', 'curious');
    speak(question.text);
    requestAnimationFrame(() => choices.querySelector<HTMLButtonElement>('button')?.focus());
  }

  private answerQuiz(correct: boolean, value: string): void {
    const q = this.quiz;
    const qq = q?.question;
    if (!q || !qq || q.phase !== 'question') return;
    q.phase = 'reveal';
    const buttons = q.body.querySelectorAll<HTMLButtonElement>('.mai-choice');
    buttons.forEach((b) => (b.disabled = true));
    const right = String(qq.choices.find((c) => c.correct)!.value);
    q.body.querySelector(`.mai-choice[data-value="${CSS.escape(right)}"]`)?.classList.add('right');
    recordAnswer(this.save.learner, `quiz-${qq.category}`, { correct, hintRung: 0, misconception: correct ? null : (qq.choices.find((c) => String(c.value) === value)?.misconception ?? 'other') }, RULES);
    this.persist();
    const result = q.body.querySelector<HTMLElement>('.mai-q-result')!;
    result.hidden = false;
    if (correct) {
      q.you += qq.value;
      audio.correct();
      this.pipSays(PIP_GROANS[q.used.size % PIP_GROANS.length], 'thinking');
      if (qq.bonus) {
        q.phase = 'bonus';
        const bonus = qq.bonus;
        result.replaceChildren(
          h('p', { class: 'mai-q-good', text: `Right! +${qq.value}. ${qq.explain}` }),
          h('p', { class: 'mai-q-bonus', text: `${bonus.text} (+${BONUS_POINTS})` }),
          h('div', { class: 'mai-choices wide' }, ...bonus.options.map((o, i) => h('button', { class: 'btn mai-choice bonus', type: 'button', 'data-value': o.value, onclick: () => this.answerBonus(o.correct, o.value) }, h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }), h('span', { class: 'mai-choice-text', text: o.label })))),
        );
        speak(`Right! ${bonus.text}`);
        requestAnimationFrame(() => result.querySelector<HTMLButtonElement>('.bonus')?.focus());
      } else {
        result.replaceChildren(h('p', { class: 'mai-q-good', text: `Right! +${qq.value} points. ${qq.explain}` }), this.boardButton());
        speak(`Right! ${qq.explain}`);
      }
    } else {
      q.pip += qq.value;
      audio.retry();
      buttons.forEach((b) => b.dataset.value === value && b.classList.add('nope'));
      this.pipSays(PIP_TAUNTS[q.used.size % PIP_TAUNTS.length], 'proud');
      result.replaceChildren(h('p', { class: 'mai-q-try', text: `Pip steals ${qq.value} points. ${qq.explain}` }), this.boardButton());
      speak(`Pip steals the points. ${qq.explain}`);
    }
    q.youEl.textContent = String(q.you);
    q.pipEl.textContent = String(q.pip);
  }

  private answerBonus(correct: boolean, value: string): void {
    const q = this.quiz;
    const qq = q?.question;
    if (!q || !qq || q.phase !== 'bonus' || !qq.bonus) return;
    q.phase = 'reveal';
    const result = q.body.querySelector<HTMLElement>('.mai-q-result')!;
    result.querySelectorAll<HTMLButtonElement>('.bonus').forEach((b) => {
      b.disabled = true;
      if (b.dataset.value === value && !correct) b.classList.add('nope');
    });
    const right = qq.bonus.options.find((o) => o.correct)!;
    result.querySelector(`.bonus[data-value="${CSS.escape(right.value)}"]`)?.classList.add('right');
    recordAnswer(this.save.learner, 'quiz-strategy', { correct, hintRung: 0, misconception: correct ? null : 'wrong-strategy' }, RULES);
    this.persist();
    if (correct) {
      q.you += BONUS_POINTS;
      audio.itemGet();
      this.pipSays('Two ways to solve it? Show-off! Squawk!', 'thinking');
    } else {
      audio.retry();
      this.pipSays(`No bonus! ${right.label} is the other way. Squawk!`, 'proud');
    }
    const line = correct ? `Strategy bonus! +${BONUS_POINTS}.` : `${mistakeLine(null, 'wrong-strategy')} ${right.label} also works.`;
    result.append(h('p', { class: correct ? 'mai-q-good' : 'mai-q-try', text: line }), this.boardButton());
    speak(line);
    q.youEl.textContent = String(q.you);
  }

  private boardButton(): HTMLButtonElement {
    const b = h('button', { class: 'btn primary', type: 'button', text: isTouchDevice() ? 'Back to the board' : 'Back to the board (Space)', onclick: () => this.renderBoard() });
    requestAnimationFrame(() => b.focus());
    return b;
  }

  private endQuiz(): void {
    const q = this.quiz;
    if (!q) return;
    q.phase = 'over';
    const w = quizWinner(q.you, q.pip);
    const firstWin = w === 'you' && !this.save.quizWon;
    if (q.you > this.save.quizBest) this.save.quizBest = q.you;
    if (w === 'you') this.save.quizWon = true;
    this.persist();
    const line = w === 'you' ? `You win, ${q.you} to ${q.pip}!` : w === 'tie' ? `A tie, ${q.you} to ${q.pip}! So close.` : `Pip wins this time, ${q.pip} to ${q.you}.`;
    const note = w === 'you' ? (firstWin ? 'The Quiz Show trophy is yours!' : `Your best score is ${this.save.quizBest}.`) : 'Every question you miss gives Pip points. Try a rematch: you have got this!';
    this.pipSays(w === 'you' ? 'Squawk! Rematch! I demand a rematch!' : 'Squawk! Pip is the champion!', w === 'you' ? 'thinking' : 'proud');
    if (w === 'you') audio.levelUp();
    const again = h('button', { class: 'btn primary', type: 'button', text: firstWin ? 'Collect the trophy' : 'Rematch' });
    const done = h('button', { class: 'btn', type: 'button', text: 'Done' });
    q.body.replaceChildren(h('div', { class: 'mai-result' }, w === 'you' ? pix('trophy', () => paintTrophy(), 5, 'Trophy') : pix('chest-shut', () => paintChest(false), 4), h('p', { class: 'mai-result-line', text: line }), h('p', { text: note }), h('div', { class: 'mai-result-buttons' }, again, ...(firstWin ? [] : [done]))));
    speak(`${line} ${note}`);
    again.addEventListener('click', () => {
      q.modal.close();
      if (firstWin) void this.finale();
      else requestAnimationFrame(() => this.openQuiz());
    });
    done.addEventListener('click', () => q.modal.close());
    requestAnimationFrame(() => again.focus());
    this.renderHud();
  }

  private onQuizKey(e: KeyboardEvent): void {
    const q = this.quiz;
    if (!q) return;
    const k = e.key;
    if (/^[1-3]$/.test(k) && (q.phase === 'question' || q.phase === 'bonus')) {
      const sel = q.phase === 'question' ? '.mai-question > .mai-choices .mai-choice' : '.bonus';
      const b = q.body.querySelectorAll<HTMLButtonElement>(sel)[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    } else if ((k === ' ' || k === 'Enter') && q.phase === 'reveal' && !(document.activeElement instanceof HTMLButtonElement)) {
      e.preventDefault();
      this.renderBoard();
    }
  }

  private closeQuiz(): void {
    stopSpeaking();
    this.quiz = null;
    if (this.mode === 'quiz') this.mode = 'world';
    audio.play(this.worldSong());
    this.touch?.setVisible(touchControlsVisible());
    this.renderHud();
    this.updateMarkers();
  }

  private async finale(): Promise<void> {
    this.mode = 'busy';
    this.save.finaleSeen = true;
    this.persist();
    this.world.setNight(0.75);
    audio.play('night');
    toast('Quiz Show champion!', 'reward');
    await this.talk.say(this.speakers.zuri, FINALE, 'proud');
    await this.talk.say(this.speakers.pip, 'Squawk! Next time, Pip wins! ...Probably. Squawk!', 'thinking');
    this.talk.end();
    this.updateMarkers();
    this.renderHud();
    this.mode = 'world';
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.torchesEl = h('span', { class: 'mai-torches', role: 'img' });
    this.piecesEl = h('span', { class: 'mai-pieces', role: 'img' });
    this.trophyEl = h('span', { class: 'mai-trophy', hidden: true }, pix('hud-trophy', () => paintTrophy(), 1, 'Quiz Show trophy'));
    const bar = h('div', { class: 'panel mai-hudbar' }, this.torchesEl, h('span', { class: 'mai-sep', 'aria-hidden': 'true' }), this.piecesEl, this.trophyEl);
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
    this.torchesEl.replaceChildren(...ZONES.map((z) => pix(`torch-${this.save.lit.includes(z)}`, () => paintTorch(this.save.lit.includes(z)), 1)));
    this.torchesEl.setAttribute('aria-label', `${this.save.lit.length} of 4 torches lit`);
    const n = this.save.hunt.found;
    this.piecesEl.replaceChildren(...Array.from({ length: PIECES }, (_, i) => pix(`piece-${i}-${i < n}`, () => paintMapPiece(i, i < n), 2)));
    this.piecesEl.setAttribute('aria-label', `${n} of ${PIECES} map pieces`);
    this.trophyEl.hidden = !this.save.quizWon;
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
  }

  private openJobList(): void {
    if (this.mode !== 'world') return;
    const walk = (id: string) => () => {
      modal.close();
      const t = this.world.targets.find((x) => x.id === id);
      if (t) this.world.walkTo(t);
    };
    const rows = ZONES.map((z) => {
      const info = ZONE_INFO[z];
      const n = this.save.stars[z];
      const on = this.save.lit.includes(z);
      return h(
        'li',
        { class: 'belt-row' },
        pix(`torch-${on}`, () => paintTorch(on), 1),
        h('div', { class: 'belt-info' }, h('strong', { text: `${info.name}: ${info.skill}` }), h('span', { text: on ? 'Done! The torch is lit.' : `Help ${info.person.name} to light the torch.` }), h('span', { class: 'belt-stars', 'aria-label': `${n} of 5 stars` }, ...Array.from({ length: 5 }, (_, k) => iconImg(k < n ? 'star' : 'starEmpty', '', 18)))),
        h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walk(z) }),
      );
    });
    const n = this.save.hunt.found;
    rows.push(
      h(
        'li',
        { class: 'belt-row' },
        pix(`chest-${this.save.chestOpened}`, () => paintChest(this.save.chestOpened), 1),
        h('div', { class: 'belt-info' }, h('strong', { text: 'Treasure hunt with Pip' }), h('span', { text: this.save.hunt.digging ? `Dig at ${squareName(this.save.hunt.squares[n], this.save.hunt.ordered)} on the beach grid.` : this.save.chestOpened ? 'You found the golden coconut! Pip has more clues.' : 'Estimate, solve and check Pip\'s answers to find the map.' }), h('span', { class: 'belt-stars', 'aria-label': `${n} of ${PIECES} map pieces` }, ...Array.from({ length: PIECES }, (_, i) => pix(`piece-${i}-${i < n}`, () => paintMapPiece(i, i < n), 1)))),
        h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walk('pip') }),
      ),
      h(
        'li',
        { class: 'belt-row' },
        pix('trophy', () => paintTrophy(), 1),
        h('div', { class: 'belt-info' }, h('strong', { text: 'Island Quiz Show' }), h('span', { text: this.save.quizWon ? `Champion! Best score: ${this.save.quizBest}.` : this.save.lit.length === 4 ? 'The stage is open. Beat Pip!' : `Opens when all 4 torches are lit (${this.save.lit.length} of 4).` })),
        h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walk('stage') }),
      ),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jobs-title', style: 'width:min(620px,100%)' },
      h('header', {}, h('h2', { id: 'jobs-title', text: 'Island jobs' }), h('button', { class: 'btn small', type: 'button', text: 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', style: 'margin:0 0 10px', text: 'Win 5 stars at a place to light its torch. A star is for getting every step right the first time.' }), h('ul', { class: 'belt-list' }, ...rows)),
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
        const ok = await choose(this.host, 'Start over?', 'This erases your torches, treasure and trophy in this browser. Settings are kept.', [
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
      'wrong-question': 'answering a different question than the one asked',
      'keyword-trap': 'choosing the operation from a key word ("more" means add)',
      'wrong-op': 'choosing another operation',
      'no-regroup': 'forgetting to carry',
      'smaller-from-bigger': 'taking the smaller digit from the bigger (52 − 27 = 35)',
      'off-one': 'a slip in the ones',
      'off-ten': 'a slip in the tens',
      'added-instead': 'adding the numbers in a multiplication or division story',
      'fact-slip': 'a times-table slip (one group off)',
      'place-value': 'writing partial products side by side (24 × 6 = 1224)',
      'remainder-ignored': 'dropping leftovers that need one more group',
      'remainder-kept': 'counting a part-full bag as full',
      'remainder-as-answer': 'giving the leftovers as the answer',
      'round-wrong': 'rounding the wrong way',
      'not-rounded': 'giving the exact answer when asked to estimate',
      'said-reasonable': 'accepting a far-off answer',
      'said-unreasonable': 'rejecting a good answer',
      'swapped-xy': 'swapping across and up on the grid',
      'wrong-square': 'finding the wrong grid square',
      'wrong-strategy': 'choosing a strategy that gives a different answer',
    };
    const row = (key: string, name: string, status: string) => {
      const rec = this.save.learner[key];
      const mis = topMisconception(rec);
      return h('tr', {}, h('th', { scope: 'row', text: name }), h('td', { text: status }), h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }), h('td', { text: rec ? `Level ${rec.tier}` : '–' }), h('td', { text: mis ? (WORDS[mis] ?? '–') : '–' }));
    };
    const rows = ZONES.map((z) => row(z, `${ZONE_INFO[z].name} (${ZONE_INFO[z].skill})`, this.save.lit.includes(z) ? 'Done' : this.save.learner[z] ? 'In progress' : 'Not started'));
    rows.push(row('treasure', 'Treasure clues (estimate and check)', this.save.chestOpened ? 'Done' : this.save.learner.treasure ? 'In progress' : 'Not started'));
    rows.push(row('treasure-dig', 'Finding grid squares', `${this.save.hunt.found} of ${PIECES} pieces in this hunt`));
    for (const c of CATEGORIES) rows.push(row(`quiz-${c}`, `Quiz Show: ${CATEGORY_NAMES[c]}`, this.save.quizWon ? 'Won' : this.save.learner[`quiz-${c}`] ? 'Played' : 'Not played'));
    return h(
      'div',
      {},
      h('p', { text: `This summary is kept only in this browser. Best Quiz Show score: ${this.save.quizBest}.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Activity', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const pnl = this.panel;
    const q = this.quiz;
    return {
      mode: this.mode,
      player: { x: this.world.player.x, y: this.world.player.y },
      target: this.target ? this.target.id : null,
      square: this.world.squareUnderPlayer(),
      stars: { ...this.save.stars },
      lit: [...this.save.lit],
      hunt: JSON.parse(JSON.stringify(this.save.hunt)) as IslandSave['hunt'],
      chestOpened: this.save.chestOpened,
      talking: this.talk.isOpen,
      panel: pnl
        ? {
            kind: pnl.kind,
            zone: pnl.zone,
            step: pnl.step,
            complete: pnl.complete,
            rung: pnl.rung,
            tier: skill(this.save.learner, this.panelKey(pnl)).tier,
            right: pnl.steps[pnl.step]?.choices.find((c) => c.correct)?.value ?? null,
            problem: pnl.problem,
            clue: pnl.clue,
          }
        : null,
      quiz: q ? { you: q.you, pip: q.pip, phase: q.phase, used: q.used.size, right: q.question ? String(q.question.choices.find((c) => c.correct)!.value) : null, bonusRight: q.question?.bonus?.options.find((o) => o.correct)?.value ?? null } : null,
      quizWon: this.save.quizWon,
      finaleSeen: this.save.finaleSeen,
      night: this.world.night,
    };
  }
}

// ------------------------------------------------------------ picture hints

const bar = (text: string, width: number, kind: string) => h('div', { class: `mai-bar ${kind}`, style: `flex:${Math.max(1, width)} 1 0` }, h('span', { text }));

/** The picture behind a word problem: a bar model, groups, an array or sharing boxes. */
function modelPicture(m: Model, answer?: number): HTMLElement {
  const q = answer === undefined ? '?' : String(answer);
  if (m.kind === 'join') {
    const [a, b] = m.parts;
    const total = m.total ?? (a ?? 0) + (b ?? 0);
    const known = (a ?? 0) + (b ?? 0);
    const wa = a ?? total - known;
    const wb = b ?? total - known;
    return h(
      'div',
      { class: 'mai-model' },
      h('div', { class: 'mai-bars' }, bar(m.total === null ? `${q} ${m.unit}` : `${m.total} ${m.unit} in all`, 1, 'whole')),
      h('div', { class: 'mai-bars' }, bar(a === null ? q : String(a), wa, a === null ? 'unknown' : 'part'), bar(b === null ? q : String(b), wb, b === null ? 'unknown' : 'part')),
      h('p', { class: 'mai-model-note', text: m.total === null ? 'Two parts make the whole.' : 'The whole is split into two parts. One part is missing.' }),
    );
  }
  if (m.kind === 'compare') {
    return h(
      'div',
      { class: 'mai-model' },
      h('div', { class: 'mai-bars' }, h('span', { class: 'mai-bar-label', text: m.label[0] }), bar(String(m.big), m.big, 'part')),
      h('div', { class: 'mai-bars' }, h('span', { class: 'mai-bar-label', text: m.label[1] }), bar(String(m.small), m.small, 'part alt'), bar(q, m.big - m.small, 'unknown')),
      h('p', { class: 'mai-model-note', text: 'The dashed piece is how many more.' }),
    );
  }
  if (m.kind === 'groups') {
    const showDots = m.each <= 10;
    const groups = Array.from({ length: Math.min(m.groups, 10) }, () => h('div', { class: 'mai-group' }, ...(showDots ? Array.from({ length: m.each }, () => h('i', { class: 'mai-dot' })) : [h('span', { text: String(m.each) })])));
    return h('div', { class: 'mai-model' }, h('div', { class: 'mai-groups' }, ...groups), h('p', { class: 'mai-model-note', text: `${m.groups} groups of ${m.each} ${m.unit}` }));
  }
  if (m.kind === 'array') {
    const grid = h('div', { class: 'mai-array', style: `grid-template-columns:repeat(${m.cols}, 12px)` }, ...Array.from({ length: m.rows * m.cols }, () => h('i', { class: 'mai-dot' })));
    return h('div', { class: 'mai-model' }, grid, h('p', { class: 'mai-model-note', text: `${m.rows} rows of ${m.cols} ${m.unit}` }));
  }
  // sharing
  if (m.askGroups) {
    const full = Math.floor(m.total / m.size);
    const rem = m.total % m.size;
    const shown = Math.min(full, 3);
    const boxes = Array.from({ length: shown }, () => h('div', { class: 'mai-box' }, h('span', { text: String(m.size) })));
    return h(
      'div',
      { class: 'mai-model' },
      h('div', { class: 'mai-bars' }, bar(`${m.total} ${m.unit}`, 1, 'whole')),
      h('div', { class: 'mai-boxes' }, ...boxes, h('div', { class: 'mai-box unknown' }, h('span', { text: answer === undefined ? '...?' : `${answer} groups` })), ...(rem ? [h('div', { class: 'mai-box left' }, h('span', { text: 'left over?' }))] : [])),
      h('p', { class: 'mai-model-note', text: `Groups of ${m.size}. How many groups?` }),
    );
  }
  const boxes = Array.from({ length: m.size }, () => h('div', { class: 'mai-box unknown' }, h('span', { text: q })));
  return h('div', { class: 'mai-model' }, h('div', { class: 'mai-bars' }, bar(`${m.total} ${m.unit}`, 1, 'whole')), h('div', { class: 'mai-boxes' }, ...boxes), h('p', { class: 'mai-model-note', text: `Share ${m.total} into ${m.size} equal groups.` }));
}

