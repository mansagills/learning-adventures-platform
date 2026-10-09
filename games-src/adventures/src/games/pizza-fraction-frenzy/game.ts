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
import { PICTURE_BG, paintBrazierIcon, paintGoosePortrait, paintLoaf, paintLoafIcon, paintMilestoneIcon, paintRoad, postAt } from './art';
import { ANSER, ANSER_LINES, CONTROLS_TIP_KEYS, CONTROLS_TIP_TOUCH, GROWNUPS, HALF_ONE_DONE, HOST, hintText, mistakeLine, OPENING, PARTY_COUNT, praise, promptFor, STARS_PER_STATION, STATION_INFO } from './content';
import { FORUM_SONG, WORK_SONG } from './music';
import { pix } from './pix';
import { makeProblem, partyProblem, STATIONS, type Choice, type Loaf, type Misconception, type Problem, type Station, type Tier } from './problems';
import { freshSave, store, type FeastSave } from './save';
import { BRAZIERS, ForumWorld, type PersonId, type Target } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_STATION = 12;

/** Baker Livia (the host, and the bakery) and Marcus the road surveyor. */
const LOOKS: Record<Station, Look16> = {
  bakery: {
    build: 'adult',
    skin: '#9c6440',
    hair: { style: 'wrap', color: '#2f4f9e', tie: '#f2b53a' },
    top: { color: '#c45a44', trim: '#f1e3c2', kind: 'robe' },
    legs: '#c45a44',
    shoes: '#8a5a3a',
    clavi: '#f1e3c2',
    beads: ['#f2b53a', '#2f4f9e'],
  },
  road: {
    build: 'adult',
    skin: '#5a3825',
    hair: { style: 'short', color: '#b9b7b4' },
    top: { color: '#d89a4c', trim: '#2f4f9e', kind: 'robe' },
    legs: '#d89a4c',
    shoes: '#6a4a32',
    clavi: '#2f4f9e',
    belt: '#7a4a2e',
  },
};

const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };

type Mode = 'title' | 'world' | 'busy' | 'station';

interface Panel {
  modal: Modal;
  station: Station;
  problem: Problem;
  promptText: string;
  hintRung: number;
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

export class Game {
  private readonly world: ForumWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: FeastSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private firesEl!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<Station | 'anser', Speaker>;
  private panel: Panel | null = null;
  private praiseCount = 0;
  private anserCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-ancient');
    this.save = store.exists() ? store.load() : freshSave();
    this.world = new ForumWorld(host);
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: Station, name: string, role: string, voice: number): Speaker => ({
      name,
      role,
      voice,
      portrait: (e: Expression) => {
        const key = `${id}-${e}`;
        let u = cache.get(key);
        if (!u) cache.set(key, (u = paintPortrait16(LOOKS[id], MOOD[e]).toDataURL(2)));
        return u;
      },
    });
    this.speakers = {
      bakery: speaker('bakery', HOST.name, HOST.role, 210),
      road: speaker('road', STATION_INFO.road.person.name, STATION_INFO.road.person.role, 140),
      anser: {
        name: ANSER.name,
        role: ANSER.role,
        voice: 320,
        portrait: (e: Expression) => {
          const key = `anser-${e === 'curious' ? 1 : 0}`;
          let u = cache.get(key);
          if (!u) cache.set(key, (u = paintGoosePortrait(e === 'curious').toDataURL(2)));
          return u;
        },
      },
    };
    audio.addSong('forum', FORUM_SONG);
    audio.addSong('work', WORK_SONG);
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
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) this.onStationKey(e);
    });
    (window as unknown as { __fff: unknown }).__fff = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      /** test helpers */
      open: (s: Station) => this.mode === 'world' && void this.openStation(s),
      setTier: (s: Station, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      skipParty: () => {
        this.save.party = PARTY_COUNT;
      },
      teleport: (x: number, y: number) => {
        this.world.player.x = x;
        this.world.player.y = y;
        this.world.follow();
      },
    };
  }

  start(): void {
    const names = { bakery: HOST.name, road: STATION_INFO.road.person.name };
    this.world.build(this.playerLook(), LOOKS, names, this.save.done);
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
    return look16FromAppearance(this.save.appearance, { clavi: true });
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Forum Fraction Feast',
      subtitle: 'Fair shares for the festival',
      intro: ['Help Baker Livia and friends get the Roman forum ready for the festival. Cut fair shares, mark the milestone road, and light the bronze braziers.', 'For grades 2 to 4. Every line can be read aloud.'],
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
        noun: 'helper',
        hide: ['accessory'],
        only: { hairStyle: HAIR16 },
        paint: (a, dir, frame) => paintHero(look16FromAppearance(a, { clavi: true }), 1.5, dir, { walk: frame === 0 ? 1 : frame === 1 ? 0 : 2 }),
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your stars and lit braziers in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.setLit([]);
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
    audio.play('forum');
    this.renderHud();
    if (!this.save.openingSeen) void this.opening();
  }

  private async opening(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers.bakery, OPENING.slice(0, 3));
    this.world.honk();
    await this.talk.say(this.speakers.bakery, OPENING[3], 'curious');
    await this.talk.say(this.speakers.anser, 'HONK!', 'curious');
    await this.talk.say(this.speakers.bakery, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
  }

  private updateMarkers(): void {
    this.world.setMarkers({
      bakery: this.save.done.includes('bakery') ? null : 'new',
      road: this.save.done.includes('road') ? null : 'new',
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
    const label = t.label;
    if (this.promptEl.dataset.label !== label) {
      this.promptEl.dataset.label = label;
      this.promptEl.replaceChildren(h('span', { text: label }), ...(isTouchDevice() ? [] : [h('span', { class: 'kbd', text: 'Space' })]));
    }
    const s = this.world.screenOf(t, t.id === 'anser' ? 1.6 : 2.9);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel('Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'station') return;
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
      const s = this.world.screenOf(t, t.id === 'anser' ? 0.4 : 1.0);
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
    if (t.id === 'anser') void this.helloAnser();
    else void this.openStation(t.id);
  }

  private async helloAnser(): Promise<void> {
    this.mode = 'busy';
    this.world.honk();
    audio.fx(
      [
        [71, 0, 0.12],
        [67, 0.14, 0.18],
      ],
      'square',
      0.08,
    );
    await this.talk.say(this.speakers.anser, ANSER_LINES[this.anserCount++ % ANSER_LINES.length], 'curious');
    this.talk.end();
    this.mode = 'world';
  }

  private changeLook(): void {
    this.customize(false, () => undefined);
  }

  // ------------------------------------------------------------ jobs (stations)

  private async openStation(station: Station): Promise<void> {
    this.mode = 'busy';
    const info = STATION_INFO[station];
    const who = this.speakers[station];
    if (!this.save.introduced.includes(station)) {
      await this.talk.say(who, info.intro);
      this.talk.end();
      this.save.introduced.push(station);
      this.persist();
    } else if (this.save.done.includes(station)) {
      const pick = await this.talk.offer(who, `The brazier is lit, thanks to you! Want to keep practising ${info.skill.toLowerCase()}?`, ['Yes, more please!', 'Change how I look', 'Not now']);
      this.talk.end();
      if (pick === 1) this.changeLook();
      if (pick !== 0) {
        this.mode = 'world';
        return;
      }
    }
    this.mode = 'station';
    this.touch?.setVisible(false);
    audio.play('work');
    const level = h('span', { class: 'fff-level' });
    const stars = h('span', { class: 'fff-stars', role: 'img' });
    const prompt = h('p', { class: 'fff-prompt' });
    const speakBtn = h('button', { class: 'btn small fff-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => speak(prompt.textContent ?? '', { force: true }));
    const feedback = h('div', { class: 'fff-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const body = h('div', { class: 'fff-body' });
    const hintBtn = h('button', { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' });
    const face = h('img', { class: 'fff-host', src: who.portrait('smile'), alt: who.name, width: 72, height: 72 });
    const root = h(
      'div',
      { class: `panel modal fff-panel fff-job-${station}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'fff-title' },
      h('header', {}, h('h2', { id: 'fff-title', text: info.name }), h('div', { class: 'fff-head-right' }, level, stars, h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }))),
      h('div', { class: 'fff-ask' }, face, prompt, speakBtn),
      body,
      feedback,
      h('footer', { class: 'fff-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closeStation(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = { modal, station, problem: null as unknown as Problem, promptText: '', hintRung: 0, tries: 0, recorded: false, answered: false, feedback, hintBtn, next, body, stars, level, prompt };
    this.nextChallenge();
  }

  private nextChallenge(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const seed = this.save.seed++;
    const tier = skill(this.save.learner, pnl.station).tier as Tier;
    // the ten Fraction Pizza Party problems come first at level 2 (with loaves instead of pizzas)
    const p: Problem = pnl.station === 'bakery' && tier === 2 && this.save.party < PARTY_COUNT ? partyProblem(this.save.party++, mulberry32(seed)) : makeProblem(pnl.station, tier, mulberry32(seed));
    this.persist();
    pnl.problem = p;
    pnl.hintRung = 0;
    pnl.tries = 0;
    pnl.recorded = false;
    pnl.answered = false;
    pnl.promptText = promptFor(p, seed);
    pnl.prompt.textContent = pnl.promptText;
    pnl.level.textContent = `Level ${p.tier} of 3`;
    pnl.feedback.hidden = true;
    pnl.next.hidden = true;
    pnl.hintBtn.disabled = false;
    pnl.body.replaceChildren(this.renderProblem(p));
    this.renderStars();
    speak(pnl.promptText);
    requestAnimationFrame(() => [...pnl.body.querySelectorAll<HTMLButtonElement>('button:not([disabled])')].find((b) => b.offsetParent !== null)?.focus());
  }

  private loafImg(loaf: Loaf, count = false, size = 64): HTMLElement {
    const key = `loaf-${loaf.shape}-${loaf.sizes.join('.')}-${loaf.gone.join('.')}-${loaf.shaded.join('.')}-${count}-${size}`;
    const what = loaf.shape === 'round' ? 'A round loaf' : 'A long loaf';
    const alt = `${what} cut into ${loaf.sizes.length} ${new Set(loaf.sizes).size > 1 ? 'pieces of different sizes' : 'equal pieces'}${loaf.gone.length ? `, with ${loaf.gone.length} gone` : ''}${loaf.shaded.length && loaf.shaded.length < loaf.sizes.length ? `, ${loaf.shaded.length} golden` : ''}`;
    return pix(key, () => paintLoaf(loaf, size, { count }), 3, alt);
  }

  private choiceButtons(choices: Choice[], onPick: (c: Choice) => void, pictures = false): HTMLElement {
    return h(
      'div',
      { class: `fff-choices${pictures ? ' pictures' : ''}` },
      ...choices.map((c, i) =>
        h(
          'button',
          { class: `btn fff-choice${pictures ? ' picture' : ''}`, type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), 'aria-label': pictures ? `${i + 1}: ${c.label}` : undefined, onclick: () => onPick(c) },
          h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          pictures && c.loaf ? this.loafImg(c.loaf) : h('span', { class: 'fff-choice-text', text: c.label }),
        ),
      ),
    );
  }

  private renderProblem(p: Problem): HTMLElement {
    const pick = (c: Choice) => this.onAnswer(c.correct, c.misconception ?? null, c.value);
    if (p.station === 'bakery') {
      if (p.kind === 'fair') return h('div', { class: 'fff-stage' }, this.choiceButtons(p.choices, pick, true));
      return h('div', { class: 'fff-stage' }, h('div', { class: 'fff-picture', style: `background:${PICTURE_BG}` }, this.loafImg(p.loaf)), this.choiceButtons(p.choices, pick));
    }
    // the milestone road
    const road = this.roadEl(p);
    if (p.kind === 'place') return h('div', { class: 'fff-stage' }, road, h('p', { class: 'fff-note', text: isTouchDevice() ? 'Tap a post to put the flag there.' : 'Click a post to put the flag there (or Tab to a post and press Enter).' }));
    return h('div', { class: 'fff-stage' }, road, this.choiceButtons(p.choices, pick));
  }

  /** The road picture, the 0 / 1 / 2 labels under the milestones, and (when placing) a button on every post. */
  private roadEl(p: Problem, stretches = 0): HTMLElement {
    if (p.station !== 'road') return h('div');
    const road = p.road;
    const key = `road-${road.d}-${road.end}-${road.marker ?? 'x'}-${stretches}`;
    const img = pix(key, () => paintRoad(road, { stretches, flag: p.kind === 'name' ? road.marker : null }), 3, `A road from the golden milestone at 0 to milestone ${road.end === 2 ? 'II at 2' : 'I at 1'}, with ${road.d * road.end} equal stretches`);
    const labels = h('div', { class: 'fff-road-labels', 'aria-hidden': 'true' }, ...Array.from({ length: road.end + 1 }, (_, m) => h('span', { style: `left:${postAt(road, m * road.d) * 100}%`, text: String(m) })));
    const wrap = h('div', { class: 'fff-road' }, img, labels);
    if (stretches) {
      const nums = h('div', { class: 'fff-road-count', 'aria-hidden': 'true' }, ...Array.from({ length: stretches }, (_, k) => h('span', { style: `left:${((postAt(road, k) + postAt(road, k + 1)) / 2) * 100}%`, text: String(k + 1) })));
      wrap.append(nums);
    }
    if (p.kind === 'place')
      p.choices.forEach((c, k) => {
        const btn = h('button', {
          class: 'fff-post',
          type: 'button',
          'data-value': c.value,
          style: `left:${postAt(road, k) * 100}%`,
          'aria-label': `Put the flag on post ${k} of ${road.d * road.end}${k % road.d === 0 ? ` (milestone ${k / road.d})` : ''}`,
          onclick: () => this.placeFlag(c, k),
        });
        wrap.append(btn);
      });
    return wrap;
  }

  private placeFlag(c: Choice, k: number): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered || pnl.problem.station !== 'road') return;
    // show the flag where it was put, then judge it
    const img = pnl.body.querySelector('.fff-road img') as HTMLImageElement | null;
    const road = pnl.problem.road;
    if (img) img.replaceWith(pix(`road-${road.d}-${road.end}-${k}-0-flag`, () => paintRoad(road, { flag: k }), 3, `The flag on post ${k}`));
    this.onAnswer(c.correct, c.misconception ?? null, c.value);
  }

  private renderStars(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const n = this.save.stars[pnl.station];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_STATION }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_STATION} stars`);
  }

  private onAnswer(correct: boolean, mis: Misconception | null, value: string): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered) return;
    const p = pnl.problem;
    const btn = pnl.body.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(value)}"]`);
    if (correct) {
      pnl.answered = true;
      const clean = pnl.tries === 0 && pnl.hintRung <= 1;
      let tierChange = 0;
      if (!pnl.recorded) {
        pnl.recorded = true;
        tierChange = recordAnswer(this.save.learner, p.station, { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
      }
      this.save.played[p.station]++;
      if (clean && this.save.stars[p.station] < STARS_PER_STATION) this.save.stars[p.station]++;
      this.persist();
      if (clean) audio.itemGet();
      else audio.correct();
      const msg = clean ? `${praise(this.praiseCount++)} You win a star.` : 'You got it! Stars are for getting it right the first time.';
      this.showFeedback(msg, 'good');
      pnl.next.hidden = false;
      pnl.hintBtn.disabled = true;
      btn?.classList.add('right');
      pnl.body.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
      this.renderStars();
      if (tierChange > 0) toast('Level up! Trickier fractions.', 'reward');
      requestAnimationFrame(() => pnl.next.focus());
      return;
    }
    pnl.tries++;
    if (!pnl.recorded) {
      pnl.recorded = true;
      const o = recordAnswer(this.save.learner, p.station, { correct: false, hintRung: pnl.hintRung, misconception: mis }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let us practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(mistakeLine(p, mis ?? 'other'), 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.body.querySelector<HTMLButtonElement>('.fff-choice:not([disabled]), .fff-post:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `fff-feedback ${kind}`;
    pnl.feedback.replaceChildren(kind === 'hint' ? iconImg('bulb', '', 22) : kind === 'good' ? iconImg('star', '', 22) : '', h('span', { text }));
    speak(text);
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
    const p = pnl.problem;
    const k = pnl.hintRung;
    if (k >= 2) this.hintPicture(p);
    if (k >= 3) pnl.body.querySelector(`[data-value="${CSS.escape(p.choices.find((c) => c.correct)!.value)}"]`)?.classList.add('worked');
    this.showFeedback(`Hint ${k} of 3: ${hintText(p, k)}`, 'hint');
  }

  /** Rung 2: dots to count the pieces, or the road's stretches colored and numbered. */
  private hintPicture(p: Problem): void {
    const pnl = this.panel;
    if (!pnl || pnl.body.dataset.hinted) return;
    pnl.body.dataset.hinted = '1';
    if (p.station === 'road') {
      const old = pnl.body.querySelector('.fff-road');
      // name: color up to the flag; place: color every stretch so they can be counted
      const stretches = p.kind === 'name' ? p.road.marker ?? 0 : p.road.d * p.road.end;
      const fresh = this.roadEl(p, stretches);
      // keep the posts already crossed out
      pnl.body.querySelectorAll<HTMLButtonElement>('.fff-post.nope').forEach((b) => fresh.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(b.dataset.value!)}"]`)?.classList.add('nope'));
      fresh.querySelectorAll<HTMLButtonElement>('.fff-post.nope').forEach((b) => (b.disabled = true));
      old?.replaceWith(fresh);
      return;
    }
    if (p.kind === 'fair') return;
    const loaf = p.kind === 'build' ? { ...p.loaf, gone: [], shaded: [0] } : p.loaf;
    pnl.body.querySelector('.fff-picture')?.replaceChildren(this.loafImg(loaf, p.kind !== 'build'));
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    const s = pnl.station;
    const rec = skill(this.save.learner, s);
    const ready = this.save.stars[s] >= STARS_PER_STATION && (rec.tier >= 2 || this.save.played[s] >= MAX_PER_STATION);
    delete pnl.body.dataset.hinted;
    if (ready && !this.save.done.includes(s)) {
      pnl.modal.close();
      void this.finishStation(s);
    } else this.nextChallenge();
  }

  private onStationKey(e: KeyboardEvent): void {
    const pnl = this.panel;
    if (!pnl) return;
    const k = e.key.toLowerCase();
    if (k === 'h') {
      e.preventDefault();
      this.hint();
    } else if ((k === ' ' || k === 'enter') && pnl.answered && document.activeElement !== pnl.next) {
      e.preventDefault();
      this.afterAnswer();
    } else if (/^[1-4]$/.test(k)) {
      const b = pnl.body.querySelectorAll<HTMLButtonElement>('.fff-choice')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closeStation(): void {
    stopSpeaking();
    this.panel = null;
    if (this.mode === 'station') {
      this.mode = 'world';
      audio.play('forum');
    }
    this.touch?.setVisible(touchControlsVisible());
    this.renderHud();
  }

  private async finishStation(s: Station): Promise<void> {
    this.mode = 'busy';
    audio.play('forum');
    const info = STATION_INFO[s];
    const who = this.speakers[s];
    await this.talk.say(who, 'Five stars! Before you go, one question.', 'proud');
    const res = await this.talk.ask(who, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${s}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(s);
    this.persist();
    this.world.setLit(this.save.done);
    this.updateMarkers();
    audio.levelUp();
    toast(`A brazier is lit! ${this.save.done.length} of 4`, 'reward');
    await this.talk.say(who, info.done, 'proud');
    if (STATIONS.every((x) => this.save.done.includes(x)) && !this.save.halfOneSeen) {
      await this.talk.say(this.speakers.bakery, HALF_ONE_DONE, 'proud');
      this.save.halfOneSeen = true;
      this.persist();
    } else if (s !== 'bakery') {
      const left = STATIONS.filter((x) => !this.save.done.includes(x));
      if (left.length) await this.talk.say(this.speakers.bakery, `Look at it burn! Now go and see ${STATION_INFO[left[0]].person.name}.`, 'proud');
    }
    this.talk.end();
    this.renderHud();
    this.mode = 'world';
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.firesEl = h('span', { class: 'fff-fires', role: 'img' });
    const bar = h('div', { class: 'panel fff-hudbar' }, this.firesEl);
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
    const lit = this.save.done.length;
    this.firesEl.replaceChildren(...BRAZIERS.map((_, i) => h('span', { class: `fff-fire${i < lit ? ' on' : ''}` }, pix(`brazier-${i < lit}`, () => paintBrazierIcon(i < lit), 2))));
    this.firesEl.setAttribute('aria-label', `${lit} of 4 braziers lit`);
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
  }

  private openJobList(): void {
    if (this.mode !== 'world') return;
    const icon: Record<Station, () => HTMLElement> = { bakery: () => pix('icon-loaf', () => paintLoafIcon(), 2), road: () => pix('icon-milestone', () => paintMilestoneIcon(), 2) };
    const rows = STATIONS.map((s) => {
      const info = STATION_INFO[s];
      const n = this.save.stars[s];
      const on = this.save.done.includes(s);
      return h(
        'li',
        { class: 'belt-row' },
        icon[s](),
        h('div', { class: 'belt-info' }, h('strong', { text: `${info.name}: ${info.skill} (${info.grades})` }), h('span', { text: on ? 'Done! Its brazier is lit.' : `Help ${info.person.name}. 5 stars lights a brazier.` }), h('span', { class: 'belt-stars', 'aria-label': `${n} of 5 stars` }, ...Array.from({ length: 5 }, (_, k) => iconImg(k < n ? 'star' : 'starEmpty', '', 18)))),
        h('button', {
          class: 'btn small',
          type: 'button',
          text: 'Walk there',
          onclick: () => {
            modal.close();
            const t = this.world.targets.find((x) => x.id === s);
            if (t) this.world.walkTo(t);
          },
        }),
      );
    });
    for (const [name, skillName] of [
      ['The Market Stall', 'comparing fractions'],
      ['The Mosaic', 'equal fractions'],
    ])
      rows.push(h('li', { class: 'belt-row soon' }, pix('brazier-false', () => paintBrazierIcon(false), 2), h('div', { class: 'belt-info' }, h('strong', { text: `${name}: ${skillName}` }), h('span', { text: 'Coming soon' }))));
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jobs-title', style: 'width:min(620px,100%)' },
      h('header', {}, h('h2', { id: 'jobs-title', text: 'Festival jobs' }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', style: 'margin:0 0 10px', text: 'Win 5 stars at a job to light one of the four braziers. A star is for getting it right the first time.' }), h('ul', { class: 'belt-list' }, ...rows)),
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
        const ok = await choose(this.host, 'Start over?', 'This erases your stars and lit braziers in this browser. Settings are kept.', [
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
      'unequal-parts': 'calling unequal pieces "fourths"',
      'wrong-count': 'not counting the pieces',
      'counted-cuts': 'counting the cut lines instead of the pieces',
      'part-over-part': 'eaten over left (2/6) instead of eaten over all the pieces (2/8)',
      'eaten-left-swap': 'mixing up the part eaten and the part left',
      'upside-down': 'writing a fraction upside down (8/2 for 2/8)',
      'whole-not-one': 'not seeing 4/4 as one whole',
      'gave-whole': 'giving each friend the whole loaf',
      'unit-only': 'looking at one piece only',
      'denominator-count': 'reading the bottom number as the pieces we have',
      'start-at-one': 'counting the first post as 1 on the number line',
      'count-posts': 'counting posts instead of the stretches between them',
      'off-by-one': 'counting one too many or too few',
      'from-end': 'counting from the wrong end of the number line',
      'whole-at-end': 'putting 1 whole at the end of the line',
      'whole-road': 'using the whole line (0 to 2) as one whole',
      'past-one-only': 'counting only the part past 1',
    };
    const rows = STATIONS.map((s) => {
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
      h('p', { text: `This summary is kept only in this browser. Braziers lit: ${this.save.done.length} of 4.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Job', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const pnl = this.panel;
    const right = pnl ? pnl.problem.choices.find((c) => c.correct) : null;
    return {
      mode: this.mode,
      player: { x: this.world.player.x, y: this.world.player.y },
      target: this.target ? (this.target.id as PersonId) : null,
      stars: { ...this.save.stars },
      done: [...this.save.done],
      lit: this.world.litCount,
      party: this.save.party,
      talking: this.talk.isOpen,
      panel: pnl
        ? {
            station: pnl.station,
            kind: pnl.problem.kind,
            problem: pnl.problem,
            hintRung: pnl.hintRung,
            answered: pnl.answered,
            tier: skill(this.save.learner, pnl.station).tier,
            right: right?.value ?? null,
            rightIndex: pnl.problem.choices.findIndex((c) => c.correct),
            wrong: pnl.problem.choices.filter((c) => !c.correct).map((c) => ({ value: c.value, misconception: c.misconception })),
          }
        : null,
      night: this.world.night,
    };
  }
}
