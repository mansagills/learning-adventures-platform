import { lookFromAppearance, type CharacterLook } from '../../kit/art/characters';
import { iconImg } from '../../kit/art/icons';
import type { PixelBuffer } from '../../kit/art/pixel';
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
import { paintBin, paintChipPortrait, paintHardHat, paintPartIcon, paintShapePic, paintSolid, paintThing, type ClubParts } from './art';
import { ALL_OPEN_DONE, CHIP, CHIP_JOKES, COMING_SOON, CONTROLS_TIP_KEYS, CONTROLS_TIP_TOUCH, GROWNUPS, hintText, mistakeLine, ODETTE, OPENING, praise, RUSH_INTRO, STARS_PER_STATION, STATION_INFO } from './content';
import { EVENING_SONG, RUSH_SONG, YARD_SONG } from './music';
import { pix } from './pix';
import { chipScore, makeProblem, makeRush, OPEN_STATIONS, RUSH_SECONDS, STATIONS, type ArcadeProblem, type Choice, type Misconception, type Problem, type Station, type Tier } from './problems';
import { freshSave, store, type YardSave } from './save';
import { YardWorld, type Target, type Who } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_STATION = 12;
const BLOCK_COLORS = ['#e8bd3f', '#4b7fcf', '#d2453a', '#2f9a94', '#8a5cc4', '#e8832e'];
const BIN_COLORS = ['#d2453a', '#4b7fcf', '#4f9a4a'];

const LOOKS: Record<Who, CharacterLook> = {
  odette: {
    build: 'adult',
    skin: { base: '#5a3825', shade: '#462a1b' },
    hair: { style: 'locs', base: '#b9b7b4', shade: '#8f8c89', light: '#dedbd6' },
    shirt: { base: '#e8832e', shade: '#bb652a' },
    pants: '#2b3a67',
    shoes: '#5c3822',
    accessory: 'cap',
    accent: '#e8bd3f',
    extras: { jacket: { base: '#e8832e', shade: '#bb652a' }, belt: '#5c3822' },
  },
  arcade: {
    build: 'kid',
    skin: { base: '#7a4a2e', shade: '#633b23' },
    hair: { style: 'short', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
    shirt: { base: '#3b5fa8', shade: '#2e4c8a' },
    pants: '#3a3a46',
    shoes: '#d2453a',
    accessory: 'cap',
    accent: '#d2453a',
  },
  blocks: {
    build: 'adult',
    skin: { base: '#c08a5c', shade: '#a47049' },
    hair: { style: 'curly', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
    shirt: { base: '#f4f1e8', shade: '#d9d3c4' },
    pants: '#2f6b2c',
    shoes: '#2b1d1e',
    accessory: 'none',
    accent: '#4f9a4a',
    extras: { apron: '#4f9a4a' },
  },
  blueprint: {
    build: 'adult',
    skin: { base: '#f0c9a4', shade: '#d9ab86' },
    hair: { style: 'short', base: '#b9b7b4', shade: '#8f8c89', light: '#dedbd6' },
    shirt: { base: '#4b7fcf', shade: '#3a64a6' },
    pants: '#5c3822',
    shoes: '#2b1d1e',
    accessory: 'glasses',
    accent: '#c9a227',
    extras: { beard: '#b9b7b4', belt: '#84502f' },
  },
  garden: {
    build: 'adult',
    skin: { base: '#9c6440', shade: '#834f31' },
    hair: { style: 'braids', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
    shirt: { base: '#e8bd3f', shade: '#c29a2c' },
    pants: '#3a64a6',
    shoes: '#2b1d1e',
    accessory: 'sunhat',
    accent: '#4f9a4a',
  },
};

type Mode = 'title' | 'world' | 'busy' | 'panel' | 'rush';

interface Panel {
  modal: Modal;
  station: Station;
  problem: Problem;
  rung: number;
  tries: number;
  recorded: boolean;
  answered: boolean;
  feedback: HTMLElement;
  hintBtn: HTMLButtonElement;
  next: HTMLButtonElement;
  body: HTMLElement;
  stars: HTMLElement;
  level: HTMLElement;
  prompt: HTMLElement;
}

interface Rush {
  modal: Modal;
  score: number;
  startedAt: number;
  endsAt: number;
  problem: ArcadeProblem | null;
  belt: HTMLElement;
  bins: HTMLElement;
  bar: HTMLElement;
  youEl: HTMLElement;
  chipEl: HTMLElement;
  locked: boolean;
  done: boolean;
  seed: number;
}

/** A pixel picture as a crisp, scaled-up image. */
function picImg(buf: PixelBuffer, scale: number, cls: string, alt = ''): HTMLImageElement {
  const img = h('img', { src: buf.toDataURL(1), alt, width: buf.w * scale, height: buf.h * scale, class: `px-icon ${cls}`, draggable: 'false' });
  if (!alt) img.setAttribute('aria-hidden', 'true');
  return img;
}

export class Game {
  private readonly r: PixelRenderer;
  private readonly world: YardWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: YardSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private partsEl!: HTMLElement;
  private bestEl!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<Who | 'chip', Speaker>;
  private panel: Panel | null = null;
  private rush: Rush | null = null;
  private praiseCount = 0;
  private jokeCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    this.save = store.exists() ? store.load() : freshSave();
    this.r = new PixelRenderer(host);
    this.world = new YardWorld(this.r);
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: Who | 'chip', name: string, role: string, voice: number): Speaker => ({
      name,
      role,
      voice,
      portrait: (e: Expression) => {
        const key = `${id}-${e}`;
        let u = cache.get(key);
        if (!u) cache.set(key, (u = (id === 'chip' ? paintChipPortrait(e).toDataURL(2) : paintPortrait(LOOKS[id], e).toDataURL(3))));
        return u;
      },
    });
    this.speakers = {
      odette: speaker('odette', ODETTE.name, ODETTE.role, 150),
      arcade: speaker('arcade', STATION_INFO.arcade.person.name, STATION_INFO.arcade.person.role, 260),
      blocks: speaker('blocks', STATION_INFO.blocks.person.name, STATION_INFO.blocks.person.role, 220),
      blueprint: speaker('blueprint', STATION_INFO.blueprint.person.name, STATION_INFO.blueprint.person.role, 120),
      garden: speaker('garden', STATION_INFO.garden.person.name, STATION_INFO.garden.person.role, 200),
      chip: speaker('chip', CHIP.name, CHIP.role, 380),
    };
    audio.addSong('yard', YARD_SONG);
    audio.addSong('rush', RUSH_SONG);
    audio.addSong('evening', EVENING_SONG);
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
      else if (this.rush && stackTop() === this.rush.modal) this.onRushKey(e);
    });
    (window as unknown as { __stb: unknown }).__stb = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      /** test helpers */
      open: (s: Station) => this.mode === 'world' && void this.openStation(s),
      rush: () => this.mode === 'world' && this.openRush(),
      endRush: () => this.rush && (this.rush.endsAt = performance.now()),
      setTier: (s: Station, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      teleport: (x: number, y: number) => {
        this.world.stopWalking();
        this.world.player.x = x;
        this.world.player.y = y;
      },
    };
  }

  start(): void {
    const names: Record<Who, string> = { odette: ODETTE.name, arcade: STATION_INFO.arcade.person.name, blocks: STATION_INFO.blocks.person.name, blueprint: STATION_INFO.blueprint.person.name, garden: STATION_INFO.garden.person.name };
    this.world.build(this.playerLook(), LOOKS, names, this.parts(), OPEN_STATIONS);
    if (this.save.finaleSeen) {
      this.world.setNight(0.7);
      this.world.setParts(this.parts(), true);
    }
    this.updateMarkers();
    this.showTitleScreen();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.input.worldActive = this.mode === 'world' && !document.querySelector('.modal-back') && !this.talk.isOpen;
      this.world.update(dt, this.mode === 'world' ? this.input : null);
      this.updatePrompt();
      if (this.rush) this.tickRush(now);
      this.world.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private playerLook(): CharacterLook {
    return lookFromAppearance(this.save.appearance);
  }

  private parts(): ClubParts {
    const d = this.save.done;
    return { walls: d.includes('arcade'), pillars: d.includes('blocks'), roof: d.includes('blueprint'), garden: d.includes('garden') };
  }

  private worldSong(): string {
    return this.save.finaleSeen ? 'evening' : 'yard';
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Shape Town Builders',
      subtitle: 'Sort shapes, pick blocks, build the clubhouse',
      intro: ['Shape Town is building a clubhouse! Help the builders with flat shapes and solid blocks, and each job adds a part to the building.', 'For grades K to 4. Every line can be read aloud.'],
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your stars and the clubhouse in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.setNight(0);
      this.world.setParts(this.parts());
      this.updateMarkers();
    }
    this.titleEl?.remove();
    this.titleEl = null;
    openCustomize(this.host, this.save.appearance, { firstTime: true, noun: 'builder' }, (a) => {
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
    await this.talk.say(this.speakers.odette, OPENING);
    await this.talk.say(this.speakers.odette, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'curious');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
  }

  private updateMarkers(): void {
    const all = STATIONS.every((s) => this.save.done.includes(s));
    this.world.setMarkers({
      arcade: this.save.done.includes('arcade') ? null : 'new',
      blocks: this.save.done.includes('blocks') ? null : 'new',
      blueprint: null,
      garden: null,
      odette: all && !this.save.finaleSeen ? 'turnin' : null,
    });
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
    const s = this.world.screenOf(t, t.kind === 'chip' ? 1.6 : 2.6);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel('Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'panel' || this.mode === 'rush') return;
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
    if (t.kind === 'chip') void this.talkToChip();
    else if (t.id === 'odette') void this.talkToOdette();
    else {
      const s = t.id as Station;
      if (OPEN_STATIONS.includes(s)) void this.openStation(s);
      else void this.comingSoon(s);
    }
  }

  private async comingSoon(s: Station): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers[s], COMING_SOON[s] ?? 'Coming soon!');
    this.talk.end();
    this.mode = 'world';
  }

  private async talkToOdette(): Promise<void> {
    this.mode = 'busy';
    const openLeft = OPEN_STATIONS.filter((s) => !this.save.done.includes(s));
    const text = openLeft.length
      ? `${this.save.done.length ? `${this.save.done.length} part${this.save.done.length === 1 ? '' : 's'} of the clubhouse done!` : 'The clubhouse is just a slab so far.'} ${STATION_INFO[openLeft[0]].person.name} at the ${STATION_INFO[openLeft[0]].name} needs help.`
      : ALL_OPEN_DONE;
    const pick = await this.talk.offer(this.speakers.odette, text, ['Change how I look', 'Bye, Odette!']);
    this.talk.end();
    this.mode = 'world';
    if (pick === 0) this.changeLook();
  }

  private async talkToChip(): Promise<void> {
    this.mode = 'busy';
    const chip = this.speakers.chip;
    if (!this.save.introduced.includes('chip')) {
      await this.talk.say(chip, ["Hi! I'm Chip. I chew wood into shapes for the clubhouse.", 'I know EVERYTHING about shapes. Well... almost everything.'], 'proud');
      this.save.introduced.push('chip');
      this.persist();
    }
    const joke = CHIP_JOKES[this.jokeCount++ % CHIP_JOKES.length];
    const canRush = this.save.introduced.includes('arcade');
    const pick = await this.talk.offer(chip, canRush ? `${joke} Want to race me in Rush mode?` : `${joke} Visit Kofi's arcade, then come race me!`, canRush ? ['Rush mode!', 'Not now, Chip'] : ['OK, Chip!'], 'curious');
    this.talk.end();
    this.mode = 'world';
    if (canRush && pick === 0) this.openRush();
  }

  private changeLook(): void {
    openCustomize(this.host, this.save.appearance, { firstTime: false, noun: 'builder' }, (a) => {
      this.save.appearance = a;
      this.persist();
      this.world.player.setLook(this.playerLook());
    });
  }

  // ------------------------------------------------------------ stations

  private async openStation(station: Station): Promise<void> {
    this.mode = 'busy';
    const info = STATION_INFO[station];
    const who = this.speakers[station];
    if (!this.save.introduced.includes(station)) {
      await this.talk.say(who, info.intro);
      this.talk.end();
      this.save.introduced.push(station);
      this.persist();
    }
    this.mode = 'panel';
    this.touch?.setVisible(false);
    const level = h('span', { class: 'st-level' });
    const stars = h('span', { class: 'st-stars', role: 'img' });
    const prompt = h('p', { class: 'st-prompt' });
    const speakBtn = h('button', { class: 'btn small st-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => speak(prompt.textContent ?? '', { force: true }));
    const feedback = h('div', { class: 'st-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const body = h('div', { class: 'st-body' });
    const hintBtn = h('button', { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' });
    const face = h('img', { class: 'st-host', src: who.portrait('smile'), alt: who.name, width: 96, height: 96 });
    const root = h(
      'div',
      { class: `panel modal st-panel st-${station}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'st-title' },
      h('header', {}, h('h2', { id: 'st-title', text: info.name }), h('div', { class: 'st-head-right' }, level, stars, h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }))),
      h('div', { class: 'st-ask' }, face, prompt, speakBtn),
      body,
      feedback,
      h('footer', { class: 'st-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closePanel(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = { modal, station, problem: null as unknown as Problem, rung: 0, tries: 0, recorded: false, answered: false, feedback, hintBtn, next, body, stars, level, prompt };
    this.nextChallenge();
  }

  private nextChallenge(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const seed = this.save.seed++;
    this.persist();
    const tier = skill(this.save.learner, pnl.station).tier as Tier;
    const p = makeProblem(pnl.station, tier, mulberry32(seed));
    pnl.problem = p;
    pnl.rung = 0;
    pnl.tries = 0;
    pnl.recorded = false;
    pnl.answered = false;
    pnl.prompt.textContent = p.prompt;
    pnl.level.textContent = `Level ${tier} of 3`;
    pnl.feedback.hidden = true;
    pnl.next.hidden = true;
    pnl.hintBtn.disabled = false;
    pnl.body.replaceChildren(this.renderProblem(p, seed));
    this.renderStars();
    speak(p.prompt);
    requestAnimationFrame(() => pnl.body.querySelector<HTMLButtonElement>('.st-choice:not([disabled])')?.focus());
  }

  private phone(): boolean {
    return window.innerWidth < 640;
  }

  /** The picture for a problem: shapes on the belt, or a block on Lupe's counter. */
  private picture(p: Problem, withHint = false): HTMLElement {
    const phone = this.phone();
    if (p.station === 'arcade') {
      const multi = p.shapes.length > 1;
      // one shape: a 72-pixel picture at 3x (2x on a phone); three shapes: 48 pixels at 3x (2x)
      const size = multi ? 48 : 72;
      const sc = phone ? 2 : 3;
      return h(
        'div',
        { class: `st-belt${multi ? ' multi' : ''}` },
        ...p.shapes.map((s, i) =>
          h('div', { class: 'st-belt-item' }, picImg(paintShapePic(s, size, { numbers: withHint && !multi && s.kind !== 'circle' }), sc, 'st-shape', multi ? `Shape ${'ABC'[i]}` : 'The shape on the belt'), ...(multi ? [h('span', { class: 'st-letter', text: 'ABC'[i] })] : [])),
        ),
        h('div', { class: 'st-belt-rail', 'aria-hidden': 'true' }),
      );
    }
    const color = BLOCK_COLORS[(p.prompt.length + p.choices.length) % BLOCK_COLORS.length];
    const pic = p.picture;
    const buf = pic.thing ? paintThing(pic.thing) : pic.solid ? paintSolid(pic.solid, color, 48, withHint && (p.kind === 'faces' || p.kind === 'face-shape')) : paintShapePic(pic.flat!, 48);
    return h('div', { class: 'st-counter' }, picImg(buf, phone ? 3 : 4, 'st-block', 'The block on the counter'));
  }

  private renderProblem(p: Problem, seed: number): HTMLElement {
    const bins = p.station === 'arcade';
    const choices = h(
      'div',
      { class: `st-choices${bins ? ' bins' : ''}${p.choices.some((c) => c.label.length > 14) ? ' wide' : ''}` },
      ...p.choices.map((c, i) =>
        h(
          'button',
          { class: 'btn st-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), onclick: () => this.onAnswer(c) },
          h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          ...(bins ? [pix(`bin-${i}`, () => paintBin(BIN_COLORS[i % 3]), 2)] : []),
          h('span', { class: 'st-choice-text', text: c.label }),
        ),
      ),
    );
    void seed;
    return h('div', { class: 'st-stage' }, h('div', { class: 'st-pic' }, this.picture(p)), choices);
  }

  private renderStars(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const n = this.save.stars[pnl.station];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_STATION }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_STATION} stars`);
  }

  private onAnswer(c: Choice): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered) return;
    const p = pnl.problem;
    const btn = pnl.body.querySelector<HTMLButtonElement>(`.st-choice[data-value="${CSS.escape(c.value)}"]`);
    if (c.correct) {
      pnl.answered = true;
      const clean = pnl.tries === 0 && pnl.rung <= 1;
      let tierChange = 0;
      if (!pnl.recorded) {
        pnl.recorded = true;
        tierChange = recordAnswer(this.save.learner, pnl.station, { correct: true, hintRung: pnl.rung }, RULES).tierChange;
      }
      this.save.played[pnl.station]++;
      if (clean && this.save.stars[pnl.station] < STARS_PER_STATION) this.save.stars[pnl.station]++;
      this.persist();
      if (clean) audio.itemGet();
      else audio.correct();
      btn?.classList.add('right');
      // the shape drops into its bin (or the block hops)
      pnl.body.querySelector('.st-pic')?.classList.remove('wobble');
      pnl.body.querySelector('.st-pic')?.classList.add('done');
      pnl.body.querySelectorAll('.st-choice').forEach((b) => ((b as HTMLButtonElement).disabled = true));
      this.showFeedback(clean ? `${praise(this.praiseCount++)} You win a star. ${p.explain}` : `You got it! ${p.explain} Stars are for getting it right the first time.`, 'good');
      pnl.next.hidden = false;
      pnl.hintBtn.disabled = true;
      this.renderStars();
      if (tierChange > 0) toast('Level up! Trickier shapes.', 'reward');
      requestAnimationFrame(() => pnl.next.focus());
      return;
    }
    pnl.tries++;
    const mis: Misconception = c.misconception ?? 'other';
    if (!pnl.recorded) {
      pnl.recorded = true;
      const o = recordAnswer(this.save.learner, pnl.station, { correct: false, hintRung: pnl.rung, misconception: mis }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let us practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(mistakeLine(p, mis), 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
    }
    pnl.body.querySelector('.st-pic')?.classList.remove('wobble');
    void (pnl.body.querySelector('.st-pic') as HTMLElement | null)?.offsetWidth;
    pnl.body.querySelector('.st-pic')?.classList.add('wobble');
    pnl.body.querySelector<HTMLButtonElement>('.st-choice:not([disabled])')?.focus();
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `st-feedback ${kind}`;
    pnl.feedback.replaceChildren(kind === 'hint' ? iconImg('bulb', '', 22) : kind === 'good' ? iconImg('star', '', 22) : '', h('span', { text }));
    speak(text);
  }

  private hint(rung?: number): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered) return;
    const nextRung = Math.min(3, rung ?? pnl.rung + 1);
    if (nextRung <= pnl.rung && rung === undefined) {
      toast('That is every hint. The answer is outlined!', 'hint');
      return;
    }
    pnl.rung = Math.max(pnl.rung, nextRung);
    audio.hint();
    const p = pnl.problem;
    if (pnl.rung >= 2) pnl.body.querySelector('.st-pic')?.replaceChildren(this.picture(p, true));
    if (pnl.rung >= 3) {
      const right = p.choices.find((c) => c.correct)!;
      pnl.body.querySelector(`.st-choice[data-value="${CSS.escape(right.value)}"]`)?.classList.add('worked');
    }
    this.showFeedback(`Hint ${pnl.rung} of 3: ${hintText(p, pnl.rung)}`, 'hint');
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    const s = pnl.station;
    const rec = skill(this.save.learner, s);
    const ready = this.save.stars[s] >= STARS_PER_STATION && (rec.tier >= 2 || this.save.played[s] >= MAX_PER_STATION);
    if (ready && !this.save.done.includes(s)) {
      pnl.modal.close();
      void this.finishStation(s);
    } else this.nextChallenge();
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
    } else if (/^[1-3]$/.test(k)) {
      const b = pnl.body.querySelectorAll<HTMLButtonElement>('.st-choice')[Number(k) - 1];
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

  private async finishStation(s: Station): Promise<void> {
    this.mode = 'busy';
    const info = STATION_INFO[s];
    const who = this.speakers[s];
    await this.talk.say(who, 'Five stars! Before you go, one last question.', 'proud');
    if (info.debrief) {
      const res = await this.talk.ask(who, info.debrief, () => audio.hint());
      recordAnswer(this.save.learner, `${s}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    }
    this.save.done.push(s);
    this.persist();
    this.world.setParts(this.parts());
    this.updateMarkers();
    audio.levelUp();
    toast(`${info.partName[0].toUpperCase()}${info.partName.slice(1)} ${info.part === 'walls' || info.part === 'pillars' ? 'are' : 'is'} on the clubhouse!`, 'reward');
    await this.talk.say(who, info.done, 'proud');
    const openLeft = OPEN_STATIONS.filter((x) => !this.save.done.includes(x));
    const allDone = STATIONS.every((x) => this.save.done.includes(x));
    await this.talk.say(this.speakers.odette, allDone ? 'The last part is in! Come and see me at the clubhouse.' : openLeft.length ? `Look! ${info.partName[0].toUpperCase()}${info.partName.slice(1)} went up. ${STATION_INFO[openLeft[0]].person.name} needs you next.` : ALL_OPEN_DONE, 'proud');
    this.talk.end();
    this.renderHud();
    this.mode = 'world';
  }

  // ------------------------------------------------------------ Rush mode

  private openRush(): void {
    if (this.mode !== 'world') return;
    this.mode = 'rush';
    this.touch?.setVisible(false);
    const bar = h('div', { class: 'st-timer-fill' });
    const youEl = h('strong', { class: 'st-score you', text: '0' });
    const chipEl = h('strong', { class: 'st-score chip', text: '0' });
    const belt = h('div', { class: 'st-pic' });
    const bins = h('div', { class: 'st-choices bins' });
    const startBtn = h('button', { class: 'btn primary big', type: 'button', text: 'Go!', 'data-autofocus': true });
    const intro = h('div', { class: 'st-rush-intro' }, h('img', { src: this.speakers.chip.portrait('proud'), alt: 'Chip', width: 72, height: 72, class: 'st-chip-face' }), h('p', { text: RUSH_INTRO }), h('p', { class: 'small-note', text: `Your best: ${this.save.rushBest}` }), startBtn);
    const play = h('div', { class: 'st-stage', hidden: true }, h('p', { class: 'st-prompt st-rush-prompt' }), belt, bins);
    const root = h(
      'div',
      { class: 'panel modal st-panel st-rush', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'st-rush-title' },
      h('header', {}, h('h2', { id: 'st-rush-title', text: 'Rush mode' }), h('div', { class: 'st-head-right' }, h('span', { class: 'st-scorebox' }, h('span', { text: 'You ' }), youEl), h('span', { class: 'st-scorebox' }, h('span', { text: 'Chip ' }), chipEl), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Stop' : 'Stop (Esc)', onclick: () => modal.close() }))),
      h('div', { class: 'st-timer', role: 'progressbar', 'aria-label': 'Time left' }, bar),
      h('div', { class: 'st-body' }, intro, play),
    );
    const modal = new Modal(this.host, root, () => this.closeRush(), { closeOnBackdrop: false });
    this.rush = { modal, score: 0, startedAt: 0, endsAt: Infinity, problem: null, belt, bins, bar, youEl, chipEl, locked: true, done: false, seed: this.save.seed };
    if (!this.save.introduced.includes('rush')) {
      this.save.introduced.push('rush');
      this.persist();
    }
    speak(RUSH_INTRO);
    startBtn.addEventListener('click', () => {
      const r = this.rush;
      if (!r) return;
      stopSpeaking();
      intro.hidden = true;
      play.hidden = false;
      r.startedAt = performance.now();
      r.endsAt = r.startedAt + RUSH_SECONDS * 1000;
      audio.play('rush');
      this.nextRush();
    });
  }

  private nextRush(): void {
    const r = this.rush;
    if (!r || r.done) return;
    const tier = Math.max(1, Math.min(3, skill(this.save.learner, 'arcade').tier)) as Tier;
    const p = makeRush(tier, mulberry32(r.seed++));
    r.problem = p;
    r.modal.root.querySelector('.st-rush-prompt')!.textContent = p.prompt.replace(' Send it to the right bin.', '');
    r.belt.className = 'st-pic';
    r.belt.replaceChildren(this.picture(p));
    r.bins.replaceChildren(
      ...p.choices.map((c, i) =>
        h(
          'button',
          { class: 'btn st-choice', type: 'button', 'data-value': c.value, onclick: () => this.rushPick(c) },
          h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          pix(`bin-${i}`, () => paintBin(BIN_COLORS[i % 3]), 2),
          h('span', { class: 'st-choice-text', text: c.label }),
        ),
      ),
    );
    r.locked = false;
  }

  private rushPick(c: Choice): void {
    const r = this.rush;
    if (!r || r.locked || r.done || !r.problem) return;
    r.locked = true;
    const btn = r.bins.querySelector(`.st-choice[data-value="${CSS.escape(c.value)}"]`);
    if (c.correct) {
      r.score++;
      r.youEl.textContent = String(r.score);
      audio.correct();
      btn?.classList.add('right');
      r.belt.classList.add('done');
      setTimeout(() => this.nextRush(), 280);
    } else {
      audio.retry();
      btn?.classList.add('nope');
      const right = r.problem.choices.find((x) => x.correct)!;
      r.bins.querySelector(`.st-choice[data-value="${CSS.escape(right.value)}"]`)?.classList.add('right');
      setTimeout(() => this.nextRush(), 1000);
    }
  }

  private tickRush(now: number): void {
    const r = this.rush;
    if (!r || r.done || r.endsAt === Infinity) return;
    const left = Math.max(0, r.endsAt - now);
    r.bar.style.width = `${(left / (RUSH_SECONDS * 1000)) * 100}%`;
    r.bar.classList.toggle('low', left < 10000);
    r.chipEl.textContent = String(chipScore((Math.min(now, r.endsAt) - r.startedAt) / 1000));
    if (left <= 0) this.finishRush();
  }

  private finishRush(): void {
    const r = this.rush;
    if (!r || r.done) return;
    r.done = true;
    r.locked = true;
    const chip = chipScore(RUSH_SECONDS);
    r.chipEl.textContent = String(chip);
    const won = r.score > chip;
    const isBest = r.score > this.save.rushBest;
    if (isBest) this.save.rushBest = r.score;
    if (won) this.save.rushWins++;
    this.save.seed = r.seed;
    this.persist();
    audio.play(this.worldSong());
    if (won) audio.levelUp();
    else audio.correct();
    const line = won ? `You sorted ${r.score} shapes and beat Chip's ${chip}!` : r.score === chip ? `A tie! ${r.score} shapes each.` : `You sorted ${r.score}. Chip sorted ${chip}. So close!`;
    const note = isBest && r.score > 0 ? 'That is your new best!' : `Your best is ${this.save.rushBest}.`;
    const again = h('button', { class: 'btn primary', type: 'button', text: 'Play again', 'data-autofocus': true });
    const done = h('button', { class: 'btn', type: 'button', text: 'Done' });
    r.modal.root.querySelector('.st-body')!.replaceChildren(h('div', { class: 'st-rush-intro' }, won ? pix('hat-gold', () => paintHardHat(), 5, 'Gold hard hat') : h('img', { src: this.speakers.chip.portrait('proud'), alt: 'Chip', width: 72, height: 72, class: 'st-chip-face' }), h('p', { class: 'st-result-line', text: line }), h('p', { text: note }), h('div', { class: 'st-result-buttons' }, again, done)));
    speak(`${line} ${note}`);
    again.addEventListener('click', () => {
      r.modal.close();
      requestAnimationFrame(() => this.openRush());
    });
    done.addEventListener('click', () => r.modal.close());
    again.focus();
    this.renderHud();
  }

  private onRushKey(e: KeyboardEvent): void {
    const r = this.rush;
    if (!r || r.done) return;
    if (/^[1-3]$/.test(e.key)) {
      const b = r.bins.querySelectorAll<HTMLButtonElement>('.st-choice')[Number(e.key) - 1];
      if (b) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closeRush(): void {
    stopSpeaking();
    if (this.rush && !this.rush.done) audio.play(this.worldSong());
    this.rush = null;
    if (this.mode === 'rush') this.mode = 'world';
    this.touch?.setVisible(touchControlsVisible());
    this.renderHud();
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.partsEl = h('span', { class: 'st-parts', role: 'img' });
    this.bestEl = h('span', { class: 'st-best' });
    const bar = h('div', { class: 'panel st-hudbar' }, this.partsEl, h('span', { class: 'st-sep', 'aria-hidden': 'true' }), pix('hud-hat', () => paintHardHat(), 2), this.bestEl);
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
    const parts = this.parts();
    this.partsEl.replaceChildren(...(['walls', 'pillars', 'roof', 'garden'] as const).map((k) => pix(`part-${k}-${parts[k]}`, () => paintPartIcon(k, parts[k]), 2)));
    this.partsEl.setAttribute('aria-label', `${this.save.done.length} of 4 clubhouse parts built`);
    this.bestEl.textContent = `Rush ${this.save.rushBest}`;
    this.bestEl.title = 'Best Rush score';
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
  }

  private openJobList(): void {
    if (this.mode !== 'world') return;
    const walk = (id: string) => () => {
      modal.close();
      const t = this.world.targets.find((x) => x.id === id);
      if (t) this.world.walkTo(t);
    };
    const rows = STATIONS.map((s) => {
      const info = STATION_INFO[s];
      const n = this.save.stars[s];
      const on = this.save.done.includes(s);
      const open = OPEN_STATIONS.includes(s);
      return h(
        'li',
        { class: `belt-row${open ? '' : ' soon'}` },
        pix(`part-${info.part}-${on}`, () => paintPartIcon(info.part, on), 2),
        h(
          'div',
          { class: 'belt-info' },
          h('strong', { text: `${info.name}: ${info.skill} (grades ${info.grades})` }),
          h('span', { text: !open ? 'Opening soon.' : on ? `Done! ${info.partName[0].toUpperCase()}${info.partName.slice(1)} went up.` : `Help ${info.person.name} to build ${info.partName}.` }),
          ...(open ? [h('span', { class: 'belt-stars', 'aria-label': `${n} of 5 stars` }, ...Array.from({ length: 5 }, (_, k) => iconImg(k < n ? 'star' : 'starEmpty', '', 18)))] : []),
        ),
        h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walk(s) }),
      );
    });
    rows.push(
      h(
        'li',
        { class: 'belt-row' },
        pix('hat-gold', () => paintHardHat(), 2),
        h('div', { class: 'belt-info' }, h('strong', { text: 'Rush mode with Chip' }), h('span', { text: `Best: ${this.save.rushBest} shapes in ${RUSH_SECONDS} seconds. Wins against Chip: ${this.save.rushWins}.` })),
        h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walk('chip') }),
      ),
    );
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jobs-title', style: 'width:min(640px,100%)' },
      h('header', {}, h('h2', { id: 'jobs-title', text: 'Building jobs' }), h('button', { class: 'btn small', type: 'button', text: 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', style: 'margin:0 0 10px', text: 'Win 5 stars at a job to add a part to the clubhouse. A star is for getting it right the first time.' }), h('ul', { class: 'belt-list' }, ...rows)),
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
        const ok = await choose(this.host, 'Start over?', 'This erases your stars and the clubhouse in this browser. Settings are kept.', [
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
      'turned-not-same': 'thinking a turned shape is a different shape (a "diamond")',
      'only-the-usual-one': 'not counting skinny or upside-down triangles',
      'square-rect-mix': 'mixing up squares and rectangles',
      'square-not-rectangle': 'thinking a square cannot be a rectangle',
      'corners-not-checked': 'forgetting to check for square corners',
      'count-slip': 'counting one side or corner too many or too few',
      'sides-vs-corners': 'counting a curve as a side or corner',
      'open-or-curved': 'counting a shape with a gap or a curved side',
      'too-strict': 'rejecting a real shape because it looked unusual',
      'flat-name-for-solid': 'calling a solid by a flat name (a cube "a square")',
      'flat-or-solid': 'mixing up flat and solid',
      'solid-mixup': 'mixing up two solids',
      'roll-stack': 'mixing up what rolls and what stacks',
      'visible-faces-only': 'counting only the faces you can see',
      'side-view': 'naming a face from the side view (a cone face "a triangle")',
    };
    const rows = STATIONS.filter((s) => OPEN_STATIONS.includes(s)).map((s) => {
      const rec = this.save.learner[s];
      const mis = topMisconception(rec);
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: `${STATION_INFO[s].name} (${STATION_INFO[s].skill})` }),
        h('td', { text: this.save.done.includes(s) ? 'Done' : rec ? 'In progress' : 'Not started' }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? (WORDS[mis] ?? '–') : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', { text: `This summary is kept only in this browser. Best Rush score: ${this.save.rushBest} shapes in ${RUSH_SECONDS} seconds.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Job', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const pnl = this.panel;
    const r = this.rush;
    return {
      mode: this.mode,
      player: { x: this.world.player.x, y: this.world.player.y },
      target: this.target ? this.target.id : null,
      stars: { ...this.save.stars },
      done: [...this.save.done],
      rushBest: this.save.rushBest,
      talking: this.talk.isOpen,
      panel: pnl ? { station: pnl.station, problem: pnl.problem, rung: pnl.rung, answered: pnl.answered, tier: skill(this.save.learner, pnl.station).tier, right: pnl.problem.choices.find((c) => c.correct)!.value } : null,
      rush: r ? { score: r.score, done: r.done, running: r.endsAt !== Infinity, right: r.problem?.choices.find((c) => c.correct)?.value ?? null } : null,
      night: this.world.night,
    };
  }
}
