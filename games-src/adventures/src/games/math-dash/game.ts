import { lookFromAppearance, type CharacterLook } from '../../kit/art/characters';
import { iconImg } from '../../kit/art/icons';
import { paintPortrait, type Expression } from '../../kit/art/portraits';
import { bus } from '../../kit/core/events';
import { mulberry32 } from '../../kit/core/rng';
import { recordAnswer, skill, topMisconception, type SkillRules } from '../../kit/learning/mastery';
import { PixelRenderer } from '../../kit/render/pixelRenderer';
import { audio } from '../../kit/systems/audio';
import { Input } from '../../kit/systems/input';
import { applySettingsToDocument, isTouchDevice, settings, updateSettings } from '../../kit/systems/settings';
import { setReadAloudDefault, speak, stopSpeaking } from '../../kit/systems/speech';
import { openCustomize } from '../../kit/ui/customize';
import { choose, h, Modal, stackTop } from '../../kit/ui/dom';
import { openGrownups } from '../../kit/ui/grownups';
import { mountToasts, toast, Toolbar } from '../../kit/ui/hud';
import { openSettings } from '../../kit/ui/settingsPanel';
import { Talk, type Speaker } from '../../kit/ui/talk';
import { showTitle } from '../../kit/ui/title';
import { paintPowerIcon, type PowerId } from './art';
import { pix } from './pix';
import { CALMED, CHATTER, CONTROLS_KEYS, CONTROLS_TOUCH, GROWNUPS, LIBRARIAN_INTRO, mistakeLine, POWERS, PRACTICE_TIP, PRAISE, SNACK, STAGE_INFO } from './content';
import { QUIET_SONG, RUSH_SONG } from './music';
import { booksForLevel, MAX_LEVEL, offerChoices, startingPowers, stats, type PowerLevels } from './powers';
import { BOOKS_PER_STAGE, diagnose, makeBookNumber, makeShelves, shelfFor, SKILL_ID, type Misconception, type Shelf, type Stage } from './problems';
import { freshSave, store, type LibrarySave } from './save';
import { LibraryWorld, type Book, type Student } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 1, masteryCount: 10 };
const MAX_FOCUS = 100;

const LIBRARIAN_LOOK: CharacterLook = {
  build: 'adult',
  skin: { base: '#5a3825', shade: '#462a1b' },
  hair: { style: 'locs', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
  shirt: { base: '#f4f1e8', shade: '#d9d3c4' },
  pants: '#3a3550',
  shoes: '#2b1d1e',
  accessory: 'glasses',
  accent: '#e8bd3f',
  extras: { jacket: { base: '#2f7a5a', shade: '#235e45' }, lapelFlower: '#e8bd3f' },
};

interface Carried {
  n: number;
  tries: number;
  firstTryDone: boolean;
}

interface Run {
  stage: Stage;
  startStage: Stage;
  shelves: Shelf[];
  rightInStage: number;
  right: number;
  wrong: number;
  firstTryRight: number;
  firstTries: number;
  score: number;
  combo: number;
  bestCombo: number;
  time: number;
  /** Seconds since students started coming in (the difficulty clock). */
  rushTime: number;
  calmPeriod: number;
  focus: number;
  powers: PowerLevels;
  level: number;
  xp: number;
  carried: Carried[];
  bellT: number;
  notesT: number;
  cardT: number;
  shield: boolean;
  invuln: number;
  spawnT: number;
  bookT: number;
  readerT: number;
  calmed: number;
  mistakes: Partial<Record<Misconception, number>>;
}

interface Bubble {
  el: HTMLElement;
  s: Student | null;
  x: number;
  y: number;
  life: number;
}

type Mode = 'title' | 'busy' | 'play' | 'levelup' | 'paused' | 'over';

export class Game {
  private readonly r: PixelRenderer;
  private readonly world: LibraryWorld;
  private readonly talk: Talk;
  private readonly input = new Input();
  private save: LibrarySave;
  private mode: Mode = 'title';
  private run: Run | null = null;
  private last = performance.now();
  private readonly librarian: Speaker;
  private rnd = mulberry32(Date.now() % 100000);
  // HUD
  private hud!: HTMLElement;
  private focusFill!: HTMLElement;
  private focusText!: HTMLElement;
  private xpFill!: HTMLElement;
  private levelEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private bestEl!: HTMLElement;
  private timeEl!: HTMLElement;
  private stageEl!: HTMLElement;
  private comboEl!: HTMLElement;
  private handNum!: HTMLElement;
  private handQueue!: HTMLElement;
  private handCard!: HTMLElement;
  private swapBtn!: HTMLButtonElement;
  private tag!: HTMLElement;
  private powersEl!: HTMLElement;
  private banner!: HTMLElement;
  private arrow!: HTMLElement;
  private stick!: HTMLElement;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private bubbles: Bubble[] = [];
  private shake = 0;
  /** After a wrong shelf: that shelf ignores the same book for a moment (no double misses). */
  private shelfCool = { shelf: -1, n: -1, until: 0 };
  private praiseN = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(false);
    this.save = store.exists() ? store.load() : freshSave();
    this.r = new PixelRenderer(host);
    this.r.zoom = 1.05;
    this.r.resize();
    this.world = new LibraryWorld(this.r);
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    this.librarian = {
      name: 'Mx. Okafor',
      role: 'The librarian',
      voice: 200,
      portrait: (e: Expression) => {
        let u = cache.get(e);
        if (!u) cache.set(e, (u = paintPortrait(LIBRARIAN_LOOK, e).toDataURL(3)));
        return u;
      },
    };
    audio.addSong('rush', RUSH_SONG);
    audio.addSong('quiet', QUIET_SONG);
    window.addEventListener('resize', () => this.r.resize());
    this.input.onAction((a) => {
      if (a === 'mute') this.toggleMute();
      else if (a === 'menu' && this.mode === 'play') this.pause();
      else if (a === 'grownups' && this.mode === 'play') {
        this.pause();
        this.openGrownupsPage();
      }
    });
    window.addEventListener('keydown', (e) => {
      if (this.mode === 'play' && !stackTop() && (e.key === 'q' || e.key === 'Q' || e.key === 'Tab')) {
        e.preventDefault();
        this.swap();
      }
    });
    bus.on('settings:changed', () => {
      this.world.reducedMotion = settings.reducedMotion;
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
    });
    this.world.reducedMotion = settings.reducedMotion;
    this.buildHud();
    mountToasts(host);
    this.setupStick();
    (window as unknown as { __md: unknown }).__md = {
      state: () => this.debugState(),
      /** test helpers */
      teleport: (x: number, y: number) => {
        this.world.player.x = x;
        this.world.player.y = y;
      },
      shelfPoint: (i: number) => this.world.shelfPoint(i),
      books: () => [...this.world.books.values()].map((b) => ({ id: b.id, n: b.n, x: b.x, y: b.y })),
      students: () => this.world.students.map((x) => ({ x: x.actor.x, y: x.actor.y, state: x.state, kind: x.kind })),
      setFocus: (f: number) => this.run && (this.run.focus = f),
      setTime: (t: number) => {
        if (!this.run) return;
        this.run.rushTime = t;
        this.run.time = Math.max(this.run.time, this.run.calmPeriod + t);
      },
      giveXp: () => this.run && (this.run.xp = 999),
      givePower: (id: PowerId) => {
        if (!this.run) return;
        const had = stats(this.run.powers).glasses;
        this.run.powers[id] = Math.min(MAX_LEVEL, this.run.powers[id] + 1);
        if (!had && stats(this.run.powers).glasses) this.world.relabelBooks(true);
        this.renderPowers();
      },
    };
  }

  start(): void {
    this.world.build(this.playerLook(), LIBRARIAN_LOOK);
    this.world.setShelves(makeShelves(1).map((s) => s.sign));
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.frame(dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private playerLook(): CharacterLook {
    return lookFromAppearance(this.save.appearance);
  }

  // ------------------------------------------------------------ title

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('quiet');
    const intro: Array<string | Node> = [
      'Books are everywhere! Pick them up and shelve each one by its number, while you dodge chatty classmates. Choose a library power every few books. How long can you keep your Focus?',
      'Grades 1 to 3: tens, hundreds, and comparing numbers with < and >.',
    ];
    if (this.save.bestStage > 1) intro.push(this.stagePicker());
    if (this.save.bestScore > 0) intro.push(h('p', { class: 'md-best-line', text: `Best score: ${this.save.bestScore}` }));
    this.titleEl = showTitle(this.host, {
      title: 'Math Dash: Library Rush',
      subtitle: 'Sort the books, dodge the chatter',
      intro,
      hasSave: store.exists() && this.save.introSeen,
      continueGame: () => {
        audio.unlock();
        this.beginShift();
      },
      newGame: () => {
        audio.unlock();
        void this.newGame();
      },
      settings: () => this.openSettingsPanel(),
      grownups: () => this.openGrownupsPage(),
    });
    const cont = this.titleEl.querySelector('.buttons .btn.primary');
    if (cont && store.exists() && this.save.introSeen) cont.textContent = 'Start a shift';
  }

  private stagePicker(): HTMLElement {
    const wrap = h('div', { class: 'md-stagepick', role: 'radiogroup', 'aria-label': 'Start at' }, h('span', { text: 'Start at:' }));
    for (const st of [1, 2, 3] as Stage[]) {
      const locked = st > this.save.bestStage;
      const b = h('button', {
        class: `btn small${this.save.startStage === st ? ' primary' : ''}`,
        type: 'button',
        role: 'radio',
        'aria-checked': String(this.save.startStage === st),
        disabled: locked,
        text: STAGE_INFO[st].name,
        onclick: () => {
          this.save.startStage = st;
          this.persist();
          wrap.querySelectorAll('button').forEach((x, i) => {
            x.classList.toggle('primary', i + 1 === st);
            x.setAttribute('aria-checked', String(i + 1 === st));
          });
        },
      });
      wrap.append(b);
    }
    return wrap;
  }

  private async newGame(): Promise<void> {
    if (store.exists() && this.save.introSeen) {
      const ok = await choose(this.host, 'Start a new game?', 'This erases your best score and stages in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
    }
    this.titleEl?.remove();
    this.titleEl = null;
    openCustomize(this.host, this.save.appearance, { firstTime: true, noun: 'library helper' }, (a) => {
      this.save.appearance = a;
      this.persist();
      this.world.player.setLook(this.playerLook());
      this.beginShift();
    });
  }

  // ------------------------------------------------------------ a run

  private freshRun(stage: Stage): Run {
    return {
      stage,
      startStage: stage,
      shelves: makeShelves(stage, this.rnd),
      rightInStage: 0,
      right: 0,
      wrong: 0,
      firstTryRight: 0,
      firstTries: 0,
      score: 0,
      combo: 0,
      bestCombo: 0,
      time: 0,
      rushTime: 0,
      calmPeriod: this.save.introSeen ? 6 : 20,
      focus: MAX_FOCUS,
      powers: startingPowers(),
      level: 1,
      xp: 0,
      carried: [],
      bellT: 0,
      notesT: 0,
      cardT: 0,
      shield: false,
      invuln: 0,
      spawnT: 0,
      bookT: 0,
      readerT: 0,
      calmed: 0,
      mistakes: {},
    };
  }

  private async beginShift(): Promise<void> {
    this.titleEl?.remove();
    this.titleEl = null;
    this.world.reset();
    const run = this.freshRun(this.save.startStage);
    this.run = run;
    this.world.setShelves(run.shelves.map((s) => s.sign));
    for (let i = 0; i < 7; i++) this.spawnBook();
    this.hud.hidden = false;
    this.renderHud();
    this.mode = 'busy';
    audio.play('rush');
    if (!this.save.introSeen) {
      await this.talk.say(this.librarian, LIBRARIAN_INTRO);
      await this.talk.say(this.librarian, isTouchDevice() ? CONTROLS_TOUCH : CONTROLS_KEYS, 'curious');
      this.talk.end();
      this.save.introSeen = true;
      this.persist();
    }
    this.showBanner(STAGE_INFO[run.stage].name, STAGE_INFO[run.stage].arrive);
    this.mode = 'play';
  }

  private spawnBook(): void {
    const run = this.run;
    if (!run) return;
    // avoid repeating a number already on the floor or in hand
    const taken = new Set([...[...this.world.books.values()].map((b) => b.n), ...run.carried.map((c) => c.n)]);
    let n = makeBookNumber(run.stage, run.shelves, this.rnd);
    for (let i = 0; i < 6 && taken.has(n); i++) n = makeBookNumber(run.stage, run.shelves, this.rnd);
    this.world.spawnBook(n, stats(run.powers).glasses);
  }

  // ------------------------------------------------------------ the frame

  private frame(dt: number): void {
    const run = this.run;
    const playing = this.mode === 'play' && run && !stackTop() && !this.talk.isOpen;
    this.input.worldActive = !!playing;
    if (playing && run) {
      const st = stats(run.powers);
      run.time += dt;
      if (run.time > run.calmPeriod) run.rushTime += dt;
      run.invuln = Math.max(0, run.invuln - dt);
      const events = this.world.update(dt, this.input, {
        speed: st.speed,
        pickup: st.pickup,
        canCarry: run.carried.length < st.capacity,
        rugRadius: st.rugRadius,
        rugSlow: st.rugSlow,
        shield: run.shield,
        invulnerable: run.invuln > 0,
      });
      for (const e of events) {
        if (e.type === 'pickup') this.pickUp(e.book);
        else if (e.type === 'shelf') this.tryShelve(e.index);
        else if (e.type === 'bump') this.bump(e.student);
        else if (e.type === 'calmed') run.calmed++;
        if (this.mode !== 'play') break;
      }
      if (this.mode === 'play') this.tickPowers(dt, st);
      if (this.mode === 'play') this.tickSpawns(dt, st);
      run.focus = Math.min(MAX_FOCUS, run.focus + st.regen * dt);
      this.renderHud();
    } else if (this.mode === 'title') {
      this.world.update(dt, null, null);
    }
    this.updateOverlays(dt);
    this.world.render();
  }

  private tickPowers(dt: number, st: ReturnType<typeof stats>): void {
    const run = this.run!;
    if (st.bellEvery) {
      run.bellT += dt;
      if (run.bellT >= st.bellEvery) {
        run.bellT = 0;
        const hit = this.world.ring(st.bellRadius);
        audio.fx([[88, 0, 0.12], [93, 0.05, 0.22]], 'sine', 0.06);
        hit.forEach((s) => this.calmStudent(s));
      }
    }
    if (st.notesEvery) {
      run.notesT += dt;
      if (run.notesT >= st.notesEvery && this.world.chattyCount) {
        run.notesT = 0;
        this.world.launchNotes(st.notesCount, st.noteSpeed);
        audio.fx([[84, 0, 0.05]], 'triangle', 0.05);
      }
    }
    if (st.cardEvery && !run.shield) {
      run.cardT += dt;
      if (run.cardT >= st.cardEvery) {
        run.cardT = 0;
        run.shield = true;
      }
    }
  }

  private tickSpawns(dt: number, st: ReturnType<typeof stats>): void {
    const run = this.run!;
    // books: keep the floor stocked
    run.bookT += dt;
    const want = 6 + Math.min(5, st.capacity);
    if (this.world.books.size < want && run.bookT > 0.9) {
      run.bookT = 0;
      this.spawnBook();
    }
    // students: more and faster as the shift goes on (the difficulty clock never stops)
    if (run.time < run.calmPeriod) return;
    const t = run.rushTime;
    run.spawnT += dt;
    const every = Math.max(0.5, 2.6 - t / 50);
    const cap = Math.min(60, 4 + Math.floor(t / 5));
    const speed = Math.min(2.9, 1.3 + t / 140);
    if (run.spawnT >= every && this.world.chattyCount < cap) {
      run.spawnT = 0;
      const roll = this.rnd();
      if (t > 75 && roll < 0.16) for (let i = 0; i < 3; i++) this.world.spawnStudent('friend', speed * 0.95);
      else if (t > 40 && roll < 0.36) this.world.spawnStudent('runner', speed * 1.9);
      else this.world.spawnStudent('chat', speed * (0.85 + this.rnd() * 0.3));
    }
    run.readerT += dt;
    if (run.readerT > 22) {
      run.readerT = 0;
      this.world.freeOldestReader();
    }
  }

  // ------------------------------------------------------------ books and shelves

  private pickUp(b: Book): void {
    const run = this.run!;
    run.carried.push({ n: b.n, tries: 0, firstTryDone: false });
    this.world.removeBook(b.id, true);
    this.world.setCarried(run.carried.length);
    audio.fx([[76 + Math.min(run.carried.length, 8), 0, 0.06]], 'square', 0.06);
    this.updateHint();
  }

  private swap(): void {
    const run = this.run;
    if (!run || run.carried.length < 2) return;
    run.carried.push(run.carried.shift()!);
    audio.click();
    this.updateHint();
    this.handCard.classList.remove('swapped');
    void this.handCard.offsetWidth;
    this.handCard.classList.add('swapped');
  }

  private tryShelve(i: number): void {
    const run = this.run!;
    if (!run.carried.length) return;
    const shelf = run.shelves[i];
    const front = run.carried[0];
    const now = performance.now();
    if (this.shelfCool.shelf === i && now < this.shelfCool.until && run.carried.some((c) => c.n === this.shelfCool.n)) return;
    const m = diagnose(front.n, shelf, run.shelves, run.stage);
    if (m === null) {
      let shelvedHere = 0;
      // shelve the book in hand, then any next books that belong on this same shelf
      while (run.carried.length && diagnose(run.carried[0].n, shelf, run.shelves, run.stage) === null) {
        const c = run.carried.shift()!;
        this.shelveRight(c, i, shelvedHere);
        shelvedHere++;
      }
      this.world.setCarried(run.carried.length);
      this.updateHint();
      this.checkStage();
      if (this.mode === 'play' && run.xp >= booksForLevel(run.level)) this.levelUp();
      return;
    }
    // wrong shelf: the book bounces back and the reason shows
    this.shelfCool = { shelf: i, n: front.n, until: now + 1300 };
    run.wrong++;
    run.combo = 0;
    if (!front.firstTryDone) {
      front.firstTryDone = true;
      run.firstTries++;
      const out = recordAnswer(this.save.learner, SKILL_ID[run.stage], { correct: false, hintRung: 0, misconception: m }, RULES);
      void out;
    }
    front.tries++;
    run.mistakes[m] = (run.mistakes[m] ?? 0) + 1;
    const right = shelfFor(front.n, run.shelves)!;
    const line = mistakeLine(front.n, shelf, right, m, run.stage);
    toast(line, 'hint');
    speak(line);
    audio.retry();
    this.world.bounceFromShelf(i);
    this.floatText(this.world.player.x, this.world.player.y, 2.4, 'Not here!', 'bad');
    if (run.carried.length > 1) run.carried.push(run.carried.shift()!);
    this.updateHint();
    this.persist();
  }

  private shelveRight(c: Carried, i: number, chain: number): void {
    const run = this.run!;
    const st = stats(run.powers);
    if (!c.firstTryDone) {
      c.firstTryDone = true;
      run.firstTries++;
      run.firstTryRight++;
      recordAnswer(this.save.learner, SKILL_ID[run.stage], { correct: true, hintRung: 0 }, RULES);
    }
    run.right++;
    run.rightInStage++;
    run.combo++;
    run.bestCombo = Math.max(run.bestCombo, run.combo);
    run.xp++;
    const mult = 1 + Math.floor(run.combo / 5) * 0.5;
    const pts = Math.round(10 * mult * (1 + st.pointsBonus) * (c.tries ? 0.5 : 1));
    run.score += pts;
    this.save.totalShelved++;
    const p = this.world.shelfPoint(i);
    this.world.sparkle(p.x - 1 + chain * 0.6, p.y, 1.6);
    this.floatText(p.x, p.y, 2.4 + chain * 0.5, `+${pts}`, 'good');
    audio.fx([[72 + Math.min(run.combo, 12), 0, 0.08], [79 + Math.min(run.combo, 12), 0.07, 0.1]], 'triangle', 0.09);
    if (run.combo > 0 && run.combo % 5 === 0) toast(`${PRAISE[this.praiseN++ % PRAISE.length]} ${run.combo} in a row! Points x${mult.toFixed(1).replace('.0', '')}`, 'reward');
  }

  /** The hint: after two misses with the book in hand, its shelf sign glows. */
  private updateHint(): void {
    const run = this.run;
    const front = run?.carried[0];
    if (!run || !front || front.tries < 2) return this.world.glowShelf(-1);
    const right = shelfFor(front.n, run.shelves);
    this.world.glowShelf(right ? run.shelves.indexOf(right) : -1);
  }

  private checkStage(): void {
    const run = this.run!;
    if (run.stage >= 3 || run.rightInStage < BOOKS_PER_STAGE) return;
    run.stage = (run.stage + 1) as Stage;
    run.rightInStage = 0;
    run.shelves = makeShelves(run.stage, this.rnd);
    this.world.setShelves(run.shelves.map((s) => s.sign));
    // the old books go back to the cart; new ones arrive
    run.carried = [];
    this.world.setCarried(0);
    this.world.clearBooks();
    for (let i = 0; i < 6; i++) this.spawnBook();
    if (run.stage > this.save.bestStage) this.save.bestStage = run.stage;
    this.persist();
    audio.levelUp();
    this.showBanner(STAGE_INFO[run.stage].name, STAGE_INFO[run.stage].arrive);
    speak(STAGE_INFO[run.stage].arrive);
    this.updateHint();
  }

  // ------------------------------------------------------------ students

  private calmStudent(s: Student): void {
    if (s.state !== 'chat') return;
    this.world.calm(s);
    if (this.rnd() < 0.35) this.bubble(s, CALMED[Math.floor(this.rnd() * CALMED.length)], 'calm');
  }

  private bump(s: Student): void {
    const run = this.run!;
    if (run.invuln > 0) return;
    this.world.knockBack(s);
    if (run.shield) {
      run.shield = false;
      run.invuln = 0.8;
      this.world.sparkle(this.world.player.x, this.world.player.y, 1);
      this.bubble(null, 'Library Card!', 'calm');
      audio.fx([[84, 0, 0.08], [91, 0.06, 0.12]], 'square', 0.07);
      return;
    }
    const dmg = 12 + run.stage * 2;
    run.focus -= dmg;
    run.combo = 0;
    run.invuln = 1.1;
    this.shake = settings.reducedMotion ? 0 : 0.25;
    this.bubble(s, CHATTER[Math.floor(this.rnd() * CHATTER.length)], 'chat');
    audio.fx([[60, 0, 0.06], [63, 0.07, 0.06], [58, 0.14, 0.08]], 'sawtooth', 0.05);
    this.hud.classList.remove('hurt');
    void this.hud.offsetWidth;
    this.hud.classList.add('hurt');
    if (run.focus <= 0) {
      run.focus = 0;
      void this.gameOver();
    }
  }

  // ------------------------------------------------------------ level-up

  private levelUp(): void {
    const run = this.run!;
    run.xp = 0;
    run.level++;
    this.mode = 'levelup';
    audio.levelUp();
    const choices = offerChoices(run.powers, this.rnd);
    const pick = (id: PowerId | 'snack') => {
      if (id === 'snack') run.focus = Math.min(MAX_FOCUS, run.focus + 30);
      else {
        const before = stats(run.powers).glasses;
        run.powers[id] = Math.min(MAX_LEVEL, run.powers[id] + 1);
        if (id === 'card' && run.powers.card === 1) run.shield = true;
        if (!before && stats(run.powers).glasses) this.world.relabelBooks(true);
      }
      audio.itemGet();
      modal.close();
    };
    const cards = choices.map((id, i) => {
      const def = id === 'snack' ? null : POWERS.find((p) => p.id === id)!;
      const lvl = id === 'snack' ? 0 : run.powers[id];
      const name = def ? def.name : SNACK.name;
      const text = def ? def.levels[lvl] : SNACK.text;
      return h(
        'button',
        { class: 'md-card', type: 'button', 'data-power': id, 'aria-keyshortcuts': String(i + 1), onclick: () => pick(id) },
        h('span', { class: 'md-card-key', 'aria-hidden': 'true', text: String(i + 1) }),
        pix(`power-${id}`, () => paintPowerIcon(id), 4),
        h('strong', { text: name }),
        h('span', { class: 'md-card-lvl', text: def ? (lvl ? `Level ${lvl} → ${lvl + 1}` : 'New!') : 'Snack' }),
        h('span', { class: 'md-card-text', text }),
      );
    });
    const root = h(
      'div',
      { class: 'panel modal md-levelup', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'md-lv-title' },
      h('header', {}, h('h2', { id: 'md-lv-title', text: `Level ${run.level}! Choose a library power` })),
      h('div', { class: 'md-cards' }, ...cards),
    );
    root.addEventListener('keydown', (e) => {
      const k = Number(e.key);
      if (k >= 1 && k <= 3) {
        e.preventDefault();
        pick(choices[k - 1]);
      }
    });
    const modal = new Modal(this.host, root, () => {
      if (this.mode === 'levelup') this.mode = 'play';
      this.renderPowers();
    }, { closeOnBackdrop: false, escapeCloses: false });
    requestAnimationFrame(() => (cards[0] as HTMLElement).focus());
  }

  // ------------------------------------------------------------ end of shift

  private async gameOver(): Promise<void> {
    const run = this.run!;
    this.mode = 'over';
    stopSpeaking();
    audio.play('quiet');
    const newBest = run.score > this.save.bestScore;
    if (newBest) this.save.bestScore = run.score;
    this.save.runs++;
    this.save.lastRuns = [...this.save.lastRuns, { score: run.score, shelved: run.right, seconds: Math.round(run.time), stage: run.stage }].slice(-10);
    if (run.stage > this.save.bestStage) this.save.bestStage = run.stage;
    // start the next run where the player is comfortable: the highest stage reached, unless they pick otherwise
    this.save.startStage = this.save.bestStage;
    this.persist();
    let top: Misconception | null = null;
    let n = 0;
    for (const [k, v] of Object.entries(run.mistakes)) if ((v ?? 0) > n) {
      n = v ?? 0;
      top = k as Misconception;
    }
    const mins = Math.floor(run.time / 60);
    const secs = Math.round(run.time % 60);
    const accuracy = run.firstTries ? Math.round((run.firstTryRight / run.firstTries) * 100) : 0;
    const stat = (label: string, value: string) => h('div', { class: 'md-stat' }, h('span', { text: label }), h('strong', { text: value }));
    const again = h('button', { class: 'btn primary', type: 'button', text: 'Play again (Enter)', onclick: () => {
      modal.close();
      void this.beginShift();
    } });
    const root = h(
      'div',
      { class: 'panel modal md-over', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'md-over-title' },
      h('header', {}, h('h2', { id: 'md-over-title', text: 'Shift over!' }), newBest ? h('span', { class: 'md-newbest', text: 'New best!' }) : null),
      h(
        'div',
        { class: 'content' },
        h('div', { class: 'md-over-host' }, h('img', { src: this.librarian.portrait('proud'), alt: 'Mx. Okafor', width: 72, height: 72 }), h('p', { text: run.right ? `Great work, helper! You shelved ${run.right} ${run.right === 1 ? 'book' : 'books'} and reached ${STAGE_INFO[run.stage].name}.` : 'The chatter got you this time. Pick up a book and find its shelf!' })),
        h(
          'div',
          { class: 'md-stats' },
          stat('Score', String(run.score)),
          stat('Best score', String(this.save.bestScore)),
          stat('Books shelved', String(run.right)),
          stat('Right first try', run.firstTries ? `${accuracy}%` : '–'),
          stat('Best combo', String(run.bestCombo)),
          stat('Time', `${mins}:${String(secs).padStart(2, '0')}`),
        ),
        top ? h('p', { class: 'md-tip' }, iconImg('bulb', '', 22), h('span', { text: PRACTICE_TIP[top] })) : null,
      ),
      h('footer', { class: 'md-over-foot' }, h('button', { class: 'btn', type: 'button', text: 'Title screen', onclick: () => {
        modal.close();
        this.run = null;
        this.world.reset();
        this.showTitleScreen();
      } }), again),
    );
    const modal = new Modal(this.host, root, undefined, { closeOnBackdrop: false, escapeCloses: false });
    requestAnimationFrame(() => again.focus());
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.focusFill = h('span', { class: 'md-bar-fill' });
    this.focusText = h('span', { class: 'md-bar-num' });
    this.xpFill = h('span', { class: 'md-bar-fill xp' });
    this.levelEl = h('span', { class: 'md-lvl' });
    const left = h(
      'div',
      { class: 'panel md-meters' },
      h('div', { class: 'md-meter' }, h('span', { class: 'md-meter-label', text: 'Focus' }), h('span', { class: 'md-bar focus', role: 'img' }, this.focusFill), this.focusText),
      h('div', { class: 'md-meter' }, h('span', { class: 'md-meter-label', text: 'Sorting' }), h('span', { class: 'md-bar', role: 'img' }, this.xpFill), this.levelEl),
    );
    this.powersEl = h('div', { class: 'md-powers', 'aria-label': 'Your powers' });
    this.scoreEl = h('strong', { class: 'md-score' });
    this.bestEl = h('span', { class: 'md-best' });
    this.timeEl = h('span', { class: 'md-time' });
    this.stageEl = h('span', { class: 'md-stage' });
    this.comboEl = h('span', { class: 'md-combo' });
    const right = h('div', { class: 'panel md-scorebox' }, this.stageEl, h('div', { class: 'md-scoreline' }, this.scoreEl, this.comboEl), h('div', { class: 'md-subline' }, this.timeEl, this.bestEl));
    this.handNum = h('span', { class: 'md-hand-num' });
    this.handQueue = h('span', { class: 'md-hand-queue' });
    this.swapBtn = h('button', { class: 'btn small md-swap', type: 'button', onclick: () => this.swap() }, h('span', { text: 'Swap' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'Q' }));
    this.handCard = h('div', { class: 'panel md-hand', 'aria-live': 'polite' }, h('span', { class: 'md-hand-label', text: 'In your hands' }), this.handNum, this.handQueue, this.swapBtn);
    this.tag = h('div', { class: 'md-tag', 'aria-hidden': 'true' });
    this.banner = h('div', { class: 'md-banner', hidden: true });
    this.arrow = h('div', { class: 'md-arrow', hidden: true, 'aria-hidden': 'true' });
    this.hud = h('div', { class: 'hud md-hud', hidden: true }, left, this.powersEl, right, this.handCard, this.tag, this.arrow, this.banner);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'pause', label: 'Pause', icon: 'gear', key: 'Esc', onClick: () => this.pause() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
    ]);
  }

  private renderHud(): void {
    const run = this.run;
    if (!run) return;
    const f = Math.max(0, run.focus / MAX_FOCUS);
    this.focusFill.style.width = `${f * 100}%`;
    this.focusFill.classList.toggle('low', f < 0.3);
    this.focusText.textContent = String(Math.ceil(run.focus));
    this.xpFill.style.width = `${Math.min(1, run.xp / booksForLevel(run.level)) * 100}%`;
    this.levelEl.textContent = `Lv ${run.level}`;
    this.scoreEl.textContent = String(run.score);
    this.comboEl.textContent = run.combo >= 2 ? `x${run.combo}` : '';
    this.bestEl.textContent = `Best ${Math.max(this.save.bestScore, run.score)}`;
    const t = Math.floor(run.time);
    this.timeEl.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
    const info = STAGE_INFO[run.stage];
    const prog = run.stage < 3 ? `${run.rightInStage}/${BOOKS_PER_STAGE}` : 'endless';
    const stageText = `${info.name}|${prog}`;
    if (this.stageEl.dataset.v !== stageText) {
      this.stageEl.dataset.v = stageText;
      this.stageEl.replaceChildren(h('span', { class: 'full', text: info.name }), h('span', { class: 'short', text: info.short }), ` · ${prog}`);
    }
    const front = run.carried[0];
    const hand = front ? String(front.n) : '–';
    if (this.handNum.textContent !== hand) this.handNum.textContent = hand;
    const q = run.carried.slice(1).map((c) => c.n).join('  ');
    if (this.handQueue.textContent !== q) this.handQueue.textContent = q;
    this.handCard.classList.toggle('empty', !front);
    this.swapBtn.disabled = run.carried.length < 2;
    const cap = stats(run.powers).capacity;
    this.handCard.dataset.cap = `${run.carried.length}/${cap}`;
  }

  private renderPowers(): void {
    const run = this.run;
    if (!run) return;
    this.powersEl.replaceChildren(
      ...POWERS.filter((p) => run.powers[p.id] > 0).map((p) =>
        h('span', { class: 'md-power', title: `${p.name} level ${run.powers[p.id]}` }, pix(`power-${p.id}`, () => paintPowerIcon(p.id), 2), h('span', { class: 'md-power-lvl', text: String(run.powers[p.id]) })),
      ),
    );
  }

  private showBanner(title: string, text: string): void {
    this.banner.replaceChildren(h('strong', { text: title }), h('span', { text }));
    this.banner.hidden = false;
    this.banner.classList.remove('show');
    void this.banner.offsetWidth;
    this.banner.classList.add('show');
    window.setTimeout(() => (this.banner.hidden = true), 4200);
    this.renderPowers();
  }

  private floatText(x: number, y: number, lift: number, text: string, kind: 'good' | 'bad'): void {
    const el = h('div', { class: `md-float ${kind}`, text, 'aria-hidden': 'true' });
    this.hud.append(el);
    this.bubbles.push({ el, s: null, x, y: y - lift, life: 0.9 });
  }

  private bubble(s: Student | null, text: string, kind: 'chat' | 'calm'): void {
    const el = h('div', { class: `md-bubble ${kind}`, text, 'aria-hidden': 'true' });
    this.hud.append(el);
    const p = s ? s.actor : this.world.player;
    this.bubbles.push({ el, s, x: p.x, y: p.y, life: 1.6 });
  }

  private updateOverlays(dt: number): void {
    // the book number above the player's head
    const run = this.run;
    const front = run?.carried[0];
    const p = this.world.player;
    if (front && this.mode !== 'title') {
      const s = this.world.screenOf(p.x, p.y, 2.25 + Math.min(8, run!.carried.length) * 0.2);
      this.tag.hidden = false;
      this.tag.textContent = String(front.n);
      this.tag.style.transform = `translate(${Math.round(s.x)}px, ${Math.round(s.y)}px) translate(-50%, -100%)`;
      this.tag.classList.toggle('hinted', front.tries >= 2);
    } else this.tag.hidden = true;
    this.updateArrow(front && front.tries >= 2 ? front.n : null);
    for (const b of [...this.bubbles]) {
      b.life -= dt;
      const float = b.el.classList.contains('md-float');
      if (b.s) {
        b.x = b.s.actor.x;
        b.y = b.s.actor.y;
      }
      const s = this.world.screenOf(b.x, b.y, float ? 0 : 2.1);
      const rise = float ? (0.9 - b.life) * 40 : 0;
      b.el.style.transform = `translate(${Math.round(s.x)}px, ${Math.round(s.y - rise)}px) translate(-50%, -100%)`;
      if (b.life < 0.3) b.el.style.opacity = String(Math.max(0, b.life / 0.3));
      if (b.life <= 0) {
        b.el.remove();
        this.bubbles.splice(this.bubbles.indexOf(b), 1);
      }
    }
    // a short screen shake on a bump
    if (this.shake > 0) {
      this.shake -= dt;
      const k = Math.max(0, this.shake) * 16;
      this.r.canvas.style.translate = `${Math.round((this.rnd() - 0.5) * k)}px ${Math.round((this.rnd() - 0.5) * k)}px`;
    } else if (this.r.canvas.style.translate) this.r.canvas.style.translate = '';
  }

  /** The hint arrow: points at the glowing shelf, from the screen edge when it is out of view. */
  private updateArrow(n: number | null): void {
    const run = this.run;
    const right = run && n !== null ? shelfFor(n, run.shelves) : null;
    if (!run || !right || this.mode !== 'play') {
      this.arrow.hidden = true;
      return;
    }
    const sp = this.world.shelfPoint(run.shelves.indexOf(right));
    const s = this.world.screenOf(sp.x, sp.y, 3.6);
    const { w, h: hh } = this.r.hostSize;
    const m = 48;
    const inside = s.x > m && s.x < w - m && s.y > m + 60 && s.y < hh - m - 70;
    this.arrow.hidden = false;
    if (inside) {
      this.arrow.classList.add('over');
      this.arrow.style.transform = `translate(${Math.round(s.x)}px, ${Math.round(s.y)}px) translate(-50%, -100%) rotate(90deg)`;
      return;
    }
    this.arrow.classList.remove('over');
    const p = this.world.screenOf(this.world.player.x, this.world.player.y, 1);
    const ang = Math.atan2(s.y - p.y, s.x - p.x);
    const x = Math.max(m, Math.min(w - m, s.x));
    const y = Math.max(m + 60, Math.min(hh - m - 70, s.y));
    this.arrow.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -50%) rotate(${ang}rad)`;
  }

  /** Touch: drag anywhere on the game to move (a floating joystick). */
  private setupStick(): void {
    this.stick = h('div', { class: 'md-stick', hidden: true }, h('span', { class: 'md-stick-knob' }));
    this.host.append(this.stick);
    let id: number | null = null;
    let ox = 0;
    let oy = 0;
    const knob = this.stick.firstElementChild as HTMLElement;
    this.r.canvas.addEventListener('pointerdown', (e) => {
      if (this.mode !== 'play' || stackTop()) return;
      audio.unlock();
      id = e.pointerId;
      ox = e.clientX;
      oy = e.clientY;
      this.r.canvas.setPointerCapture(e.pointerId);
      const rect = this.host.getBoundingClientRect();
      this.stick.hidden = false;
      this.stick.style.left = `${ox - rect.left}px`;
      this.stick.style.top = `${oy - rect.top}px`;
      knob.style.transform = '';
    });
    this.r.canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - ox;
      const dy = e.clientY - oy;
      const d = Math.hypot(dx, dy);
      const max = 44;
      const k = d > max ? max / d : 1;
      knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
      const dead = 6;
      if (d < dead) this.input.setVirtual(0, 0);
      else this.input.setVirtual(Math.max(-1, Math.min(1, dx / max)), Math.max(-1, Math.min(1, dy / max)));
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      this.input.setVirtual(0, 0);
      this.stick.hidden = true;
    };
    this.r.canvas.addEventListener('pointerup', end);
    this.r.canvas.addEventListener('pointercancel', end);
  }

  // ------------------------------------------------------------ menus

  private pause(): void {
    if (this.mode !== 'play') return;
    this.mode = 'paused';
    this.input.setVirtual(0, 0);
    this.openSettingsPanel(() => {
      if (this.mode === 'paused') this.mode = 'play';
    });
  }

  private toggleMute(): void {
    updateSettings({ muted: !settings.muted });
  }

  private openSettingsPanel(onClose?: () => void): void {
    openSettings(
      this.host,
      {
        changeLook: () =>
          openCustomize(this.host, this.save.appearance, { firstTime: false, noun: 'library helper' }, (a) => {
            this.save.appearance = a;
            this.persist();
            this.world.player.setLook(this.playerLook());
          }),
        grownups: () => this.openGrownupsPage(),
        resetSave: async () => {
          const ok = await choose(this.host, 'Start over?', 'This erases your best score and stages in this browser. Settings are kept.', [
            { id: 'yes', label: 'Yes, erase my progress', kind: 'danger' },
            { id: 'no', label: 'No, keep playing' },
          ]);
          if (ok === 'yes') {
            store.reset();
            window.location.reload();
          }
        },
      },
      onClose,
    );
  }

  private openGrownupsPage(): void {
    openGrownups(this.host, GROWNUPS, () => this.progressReport());
  }

  private progressReport(): HTMLElement {
    const WORDS: Record<string, string> = {
      'last-digit': 'reading the last digit instead of the first',
      'middle-digit': 'reading the tens digit as the hundreds',
      'two-digit-big': 'thinking a two-digit number (like 98) is big',
      boundary: 'numbers right at the edge of a range',
      'symbol-flip': 'mixing up < and >',
      'next-shelf': 'landing one shelf off',
      other: 'other slips',
    };
    const rows = ([1, 2, 3] as Stage[]).map((st) => {
      const rec = this.save.learner[SKILL_ID[st]];
      const mis = topMisconception(rec);
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: `${STAGE_INFO[st].name} (${STAGE_INFO[st].short})` }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first try` : 'Not reached yet' }),
        h('td', { text: rec ? (rec.mastered ? 'Mastered' : 'Practising') : '–' }),
        h('td', { text: mis ? WORDS[mis] ?? '–' : '–' }),
      );
    });
    const recent = this.save.lastRuns.slice(-5).reverse();
    return h(
      'div',
      {},
      h('p', { text: `Shifts played: ${this.save.runs}. Books shelved in all: ${this.save.totalShelved}. Best score: ${this.save.bestScore}. This summary is kept only in this browser.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Stage', 'First tries', 'Status', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
      recent.length
        ? h('p', { class: 'small-note', text: `Recent shifts: ${recent.map((r) => `${r.shelved} books (${STAGE_INFO[r.stage].name})`).join(', ')}.` })
        : null,
      h('p', { class: 'small-note', text: '"Mastered" means 10 books shelved right on the first try at that stage.' }),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const run = this.run;
    return {
      mode: this.mode,
      player: { x: this.world.player.x, y: this.world.player.y },
      run: run
        ? {
            stage: run.stage,
            shelves: run.shelves.map((s) => ({ lo: s.lo, hi: s.hi, label: s.label })),
            carried: run.carried.map((c) => c.n),
            score: run.score,
            right: run.right,
            wrong: run.wrong,
            rightInStage: run.rightInStage,
            focus: run.focus,
            level: run.level,
            xp: run.xp,
            powers: { ...run.powers },
            students: this.world.students.length,
            chatty: this.world.chattyCount,
            combo: run.combo,
            shield: run.shield,
            time: run.time,
          }
        : null,
      save: { bestScore: this.save.bestScore, bestStage: this.save.bestStage, runs: this.save.runs, introSeen: this.save.introSeen },
      talking: this.talk.isOpen,
      tier: run ? skill(this.save.learner, SKILL_ID[run.stage]).tier : null,
    };
  }
}
