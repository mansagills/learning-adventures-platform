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
import { CRYSTAL, paintBeaconIcon, paintGloopPortrait, paintJobIcon, paintWeight } from './art';
import {
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  DOME_SOON,
  GLOOP,
  GLOOP_AFTER,
  GLOOP_HELLO,
  GLOOP_LINES,
  GROWNUPS,
  hintText,
  JOB_INFO,
  mistakeLine,
  OPENING,
  PEOPLE,
  PERSON_OF,
  praise,
  ROVER_TIP_KEYS,
  ROVER_TIP_TOUCH,
  SCALE_TIP_KEYS,
  SCALE_TIP_TOUCH,
  STARS_PER_JOB,
  WEIGHIN_READY,
  type PersonId,
} from './content';
import { BEACON_SONG, OUTPOST_SONG, WEIGH_SONG } from './music';
import { pix } from './pix';
import { makeProblem, OPEN_JOBS, panWeights, type Choice, type Job, type Misconception, type Problem, type Tier } from './problems';
import { freshSave, store, type ScaleSave } from './save';
import { ScaleView } from './scale';
import { OutpostWorld, type Target, type TargetId } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_JOB = 12;

/** The outpost crew: Ranger Kiri (the host), Mechanic Juno and Botanist Pax, in Star Station work suits. */
const LOOKS: Record<PersonId, Look16> = {
  kiri: { build: 'adult', skin: '#7a4a2e', hair: { style: 'locs', color: '#2a1f1d', tie: '#ffcf6a' }, top: { color: '#2e8f6c', trim: '#ffcf6a', kind: 'jumpsuit' }, legs: '#2e8f6c', shoes: '#4a5266', sole: '#c9d1de', belt: '#ffcf6a', badge: '#ffcf6a', headset: '#4a5266' },
  juno: { build: 'adult', skin: '#e0b48c', hair: { style: 'short', color: '#c0502e' }, top: { color: '#ef8a3c', trim: '#2c3350', kind: 'jumpsuit' }, legs: '#2c3350', shoes: '#2c3350', sole: '#c9d1de', belt: '#2c3350', badge: '#5fe3ff', headset: '#2c3350' },
  pax: { build: 'adult', skin: '#b07a52', hair: { style: 'puffs', color: '#3b2a24', tie: '#7dea8a' }, top: { color: '#e7ecf6', trim: '#7dea8a', kind: 'jumpsuit' }, legs: '#7dea8a', shoes: '#4a5266', sole: '#e7ecf6', belt: '#4a5266', badge: '#7dea8a', headset: '#4a5266' },
};

const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };

type Mode = 'title' | 'world' | 'busy' | 'job';

interface Panel {
  modal: Modal;
  job: Job;
  problem: Problem;
  scale: ScaleView;
  hintRung: number;
  tries: number;
  recorded: boolean;
  answered: boolean;
  /** A wrong crystal is in the gap and the scale is showing it (the next try waits for it to come back out). */
  showing: boolean;
  feedback: HTMLElement;
  hintBtn: HTMLButtonElement;
  next: HTMLButtonElement;
  body: HTMLElement;
  choices: HTMLElement;
  stars: HTMLElement;
  level: HTMLElement;
  prompt: HTMLElement;
}

export class Game {
  private readonly world: OutpostWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: ScaleSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private beaconEl!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<PersonId | 'gloop', Speaker>;
  private panel: Panel | null = null;
  private praiseCount = 0;
  private gloopCount = 0;
  private drag: { choice: Choice; ghost: HTMLElement; from: HTMLElement; startX: number; startY: number; moved: boolean } | null = null;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-star');
    this.save = store.exists() ? store.load() : freshSave();
    this.world = new OutpostWorld(host);
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
      kiri: speaker('kiri', 180),
      juno: speaker('juno', 230),
      pax: speaker('pax', 150),
      gloop: {
        name: GLOOP.name,
        role: GLOOP.role,
        voice: 360,
        portrait: (e: Expression) => {
          const key = `gloop-${e === 'curious' ? 1 : 0}`;
          let u = cache.get(key);
          if (!u) cache.set(key, (u = paintGloopPortrait(e === 'curious').toDataURL(2)));
          return u;
        },
      },
    };
    audio.addSong('outpost', OUTPOST_SONG);
    audio.addSong('weigh', WEIGH_SONG);
    audio.addSong('beacon', BEACON_SONG);
    this.world.onArrive = (t) => this.use(t);
    window.addEventListener('resize', () => {
      this.world.resize();
      this.panel?.scale.fit();
    });
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
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) this.onJobKey(e);
    });
    window.addEventListener('pointermove', (e) => this.onDragMove(e));
    window.addEventListener('pointerup', (e) => this.onDragEnd(e));
    (window as unknown as { __ebs: unknown }).__ebs = {
      state: () => this.debugState(),
      screenOf: (id: string) => {
        const t = this.world.targets.find((x) => x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      /** test helpers */
      open: (j: Job) => this.mode === 'world' && this.openPanel(j),
      setTier: (j: Job, t: Tier) => {
        skill(this.save.learner, j).tier = t;
      },
      finishAll: () => {
        for (const j of OPEN_JOBS) if (!this.save.done.includes(j)) this.save.done.push(j);
        this.persist();
        this.world.setLit(this.save.done.length);
        this.updateMarkers();
        this.renderHud();
      },
      teleport: (x: number, y: number) => {
        this.world.player.x = x;
        this.world.player.y = y;
        this.world.follow();
      },
      setNight: (n: number) => this.world.setNight(n),
    };
  }

  start(): void {
    const names = { kiri: PEOPLE.kiri.name, juno: PEOPLE.juno.name, pax: PEOPLE.pax.name };
    this.world.build(this.playerLook(), LOOKS, names, this.save.done.length);
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

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Equation Balance Scale',
      subtitle: 'Weigh the crystals at the outpost',
      intro: ['Help Ranger Kiri and the outpost crew weigh glowing crystals on big balance scales. Find out when both sides weigh the same, find the missing numbers, and light the beacon.', 'For grades 3 to 5. Every line can be read aloud.'],
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
        noun: 'ranger',
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your stars and the lit beacon in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.setLit(0);
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
    audio.play('outpost');
    this.renderHud();
    if (!this.save.openingSeen) void this.opening();
  }

  private async opening(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.speakers.kiri, OPENING.slice(0, 3));
    this.world.cheer();
    await this.talk.say(this.speakers.gloop, GLOOP_HELLO, 'curious');
    await this.talk.say(this.speakers.kiri, GLOOP_AFTER, 'smile');
    await this.talk.say(this.speakers.kiri, OPENING[3], 'proud');
    await this.talk.say(this.speakers.kiri, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
  }

  private updateMarkers(): void {
    const mark = (j: Job) => (this.save.done.includes(j) ? null : 'new');
    this.world.setMarkers({ kiri: mark('weigh'), juno: mark('rover'), pax: null });
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
    const s = this.world.screenOf(t, t.id === 'gloop' ? 1.4 : 2.9);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel('Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'job') return;
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
      const s = this.world.screenOf(t, t.id === 'gloop' ? 0.4 : 1.0);
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
    if (t.id === 'gloop') void this.helloGloop();
    else void this.talkTo(t.id);
  }

  private async helloGloop(): Promise<void> {
    this.mode = 'busy';
    this.world.cheer();
    audio.fx(
      [
        [76, 0, 0.1],
        [83, 0.12, 0.14],
      ],
      'sine',
      0.09,
    );
    await this.talk.say(this.speakers.gloop, GLOOP_LINES[this.gloopCount++ % GLOOP_LINES.length], 'curious');
    this.talk.end();
    this.mode = 'world';
  }

  private async talkTo(id: TargetId): Promise<void> {
    if (id === 'gloop') return;
    this.mode = 'busy';
    const who = this.speakers[id];
    if (id === 'pax') {
      // the Dome opens in half 2 of the build
      await this.talk.say(who, DOME_SOON, 'smile');
      this.talk.end();
      this.mode = 'world';
      return;
    }
    const job: Job = id === 'kiri' ? 'weigh' : 'rover';
    const info = JOB_INFO[job];
    if (!this.save.introduced.includes(job)) {
      await this.talk.say(who, info.intro);
      this.save.introduced.push(job);
      this.persist();
    } else {
      const done = this.save.done.includes(job);
      const options = [done ? 'More practice!' : 'Let’s weigh!', 'Change how I look', 'Not now'];
      const text = done ? `This part of the beacon is lit, thanks to you! Want to keep practising ${info.skill.toLowerCase()}?` : info.again;
      const pick = options[await this.talk.offer(who, text, options)];
      if (pick === 'Change how I look') {
        this.talk.end();
        this.mode = 'world';
        this.customize(false, () => undefined);
        return;
      }
      if (pick === 'Not now') {
        this.talk.end();
        this.mode = 'world';
        return;
      }
    }
    if (!this.save.scaleTipSeen || (job === 'rover' && this.save.played.rover === 0)) {
      const tip = job === 'rover' ? (isTouchDevice() ? ROVER_TIP_TOUCH : ROVER_TIP_KEYS) : isTouchDevice() ? SCALE_TIP_TOUCH : SCALE_TIP_KEYS;
      await this.talk.say(who, tip, 'smile');
      this.save.scaleTipSeen = true;
      this.persist();
    }
    this.talk.end();
    this.openPanel(job);
  }

  // ------------------------------------------------------------ the job panel (a scale)

  private openPanel(job: Job): void {
    const info = JOB_INFO[job];
    const who = this.speakers[PERSON_OF[job]];
    this.mode = 'job';
    this.touch?.setVisible(false);
    audio.play('weigh');
    const level = h('span', { class: 'ebs-level' });
    const stars = h('span', { class: 'ebs-stars', role: 'img' });
    const prompt = h('p', { class: 'ebs-prompt' });
    const speakBtn = h('button', { class: 'btn small ebs-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => speak(prompt.textContent ?? '', { force: true }));
    const feedback = h('div', { class: 'ebs-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const body = h('div', { class: 'ebs-body' });
    const choices = h('div', { class: 'ebs-choices' });
    const hintBtn = h('button', { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' });
    const face = h('img', { class: 'ebs-host', src: who.portrait('smile'), alt: who.name, width: 64, height: 64 });
    const root = h(
      'div',
      { class: `panel modal ebs-panel ebs-job-${job}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ebs-title' },
      h('header', {}, h('h2', { id: 'ebs-title', text: info.name }), h('div', { class: 'ebs-head-right' }, level, stars, h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }))),
      h('div', { class: 'ebs-ask' }, face, prompt, speakBtn),
      body,
      choices,
      feedback,
      h('footer', { class: 'ebs-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closePanel(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = { modal, job, problem: null as unknown as Problem, scale: null as unknown as ScaleView, hintRung: 0, tries: 0, recorded: false, answered: false, showing: false, feedback, hintBtn, next, body, choices, stars, level, prompt };
    this.nextChallenge();
  }

  private nextChallenge(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const seed = this.save.seed++;
    const tier = skill(this.save.learner, pnl.job).tier as Tier;
    const p = makeProblem(pnl.job, tier, mulberry32(seed));
    this.persist();
    pnl.scale?.dispose();
    pnl.problem = p;
    pnl.hintRung = 0;
    pnl.tries = 0;
    pnl.recorded = false;
    pnl.answered = false;
    pnl.showing = false;
    pnl.prompt.textContent = keepFacts(p.steps[0].ask);
    pnl.level.textContent = `Level ${p.tier} of 3`;
    pnl.feedback.hidden = true;
    pnl.next.hidden = true;
    pnl.hintBtn.disabled = false;
    pnl.scale = new ScaleView(p);
    pnl.scale.setLocked(true);
    pnl.body.replaceChildren(pnl.scale.root);
    pnl.choices.replaceChildren(this.choiceButtons(p));
    this.renderStars();
    speak(p.steps[0].ask);
    requestAnimationFrame(() => {
      pnl.scale.fit();
      pnl.choices.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus();
    });
  }

  /** The Weigh Station's three answers, or the Rover's three crystal weights (which can be dragged into the gap). */
  private choiceButtons(p: Problem): HTMLElement {
    const crystals = p.job !== 'weigh';
    return h(
      'div',
      { class: `ebs-options${crystals ? ' crystals' : ''}` },
      ...p.steps[0].choices.map((c, i) => {
        const b = h(
          'button',
          {
            class: `btn ebs-choice${crystals ? ' crystal' : ''}`,
            type: 'button',
            'data-value': c.value,
            'aria-keyshortcuts': String(i + 1),
            'aria-label': crystals ? `${i + 1}: a crystal that weighs ${c.label}` : `${i + 1}: ${c.label}`,
          },
          h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          crystals ? h('span', { class: 'ebs-token' }, pix('weight-gold', () => paintWeight(CRYSTAL.gold), 1.5), h('span', { class: 'ebs-num', text: c.label })) : h('span', { class: 'ebs-choice-text', text: c.label }),
        );
        if (crystals) b.addEventListener('pointerdown', (e) => this.onDragStart(e, c, b));
        b.addEventListener('click', () => {
          // a drag that ended on the gap has already answered
          if (!b.dataset.dragged) this.pick(c);
          delete b.dataset.dragged;
        });
        return b;
      }),
    );
  }

  // ------------------------------------------------------------ dragging a crystal into the gap

  private onDragStart(e: PointerEvent, c: Choice, from: HTMLElement): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered || pnl.showing || (from as HTMLButtonElement).disabled || e.button > 0) return;
    const ghost = from.querySelector('.ebs-token')!.cloneNode(true) as HTMLElement;
    ghost.classList.add('ebs-ghost');
    ghost.hidden = true;
    document.body.append(ghost);
    this.drag = { choice: c, ghost, from, startX: e.clientX, startY: e.clientY, moved: false };
  }

  private overGap(x: number, y: number): boolean {
    const gap = this.panel?.scale.gapEl;
    if (!gap) return false;
    const r = gap.getBoundingClientRect();
    const pad = 24;
    return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;
  }

  private onDragMove(e: PointerEvent): void {
    const d = this.drag;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 8) return;
    d.moved = true;
    d.ghost.hidden = false;
    d.ghost.style.left = `${e.clientX}px`;
    d.ghost.style.top = `${e.clientY}px`;
    this.panel?.scale.setDropHover(this.overGap(e.clientX, e.clientY));
  }

  private onDragEnd(e: PointerEvent): void {
    const d = this.drag;
    if (!d) return;
    this.drag = null;
    d.ghost.remove();
    this.panel?.scale.setDropHover(false);
    if (!d.moved) return;
    // a real drag: the click that follows must not answer again
    d.from.dataset.dragged = '1';
    setTimeout(() => delete d.from.dataset.dragged, 0);
    if (this.overGap(e.clientX, e.clientY)) this.pick(d.choice);
  }

  // ------------------------------------------------------------ answering

  private pick(c: Choice): void {
    const pnl = this.panel;
    if (!pnl || pnl.answered || pnl.showing) return;
    const p = pnl.problem;
    const btn = pnl.choices.querySelector<HTMLButtonElement>(`[data-value="${CSS.escape(c.value)}"]`);
    if (btn?.disabled) return;
    if (p.job === 'weigh') {
      // the scale stays locked after a wrong answer (letting it go would give the answer away);
      // a right answer and Kiri lets it go, so it tips (or stays level) to show it
      if (c.correct) {
        pnl.scale.setLocked(false);
        const w = panWeights(p);
        pnl.scale.showWeights(w.left, w.right);
        this.onRight(btn);
      } else this.onWrong(btn, c);
      return;
    }
    // the Rover: the crystal goes in the gap and the scale tips
    const v = Number(c.value);
    pnl.scale.fillGap(v);
    pnl.scale.setLocked(false);
    const w = panWeights(p, v);
    pnl.scale.showWeights(w.left, w.right);
    if (c.correct) {
      this.onRight(btn);
      return;
    }
    this.onWrong(btn, c);
    pnl.showing = true;
    setTimeout(() => {
      if (this.panel !== pnl || pnl.answered) return;
      pnl.scale.fillGap(null);
      pnl.scale.setLocked(true);
      pnl.showing = false;
    }, 2200);
  }

  private onRight(btn: HTMLButtonElement | null): void {
    const pnl = this.panel!;
    const p = pnl.problem;
    pnl.answered = true;
    const clean = pnl.tries === 0 && pnl.hintRung <= 1;
    let tierChange = 0;
    if (!pnl.recorded) {
      pnl.recorded = true;
      tierChange = recordAnswer(this.save.learner, p.job, { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
    }
    this.save.played[p.job]++;
    if (clean && this.save.stars[p.job] < STARS_PER_JOB) this.save.stars[p.job]++;
    this.persist();
    if (clean) audio.itemGet();
    else audio.correct();
    const msg = clean ? `${praise(this.praiseCount++)} You win a star.` : 'You got it! Stars are for getting it right the first time.';
    this.showFeedback(`${msg} ${p.steps[0].explain}`, 'good');
    pnl.next.hidden = false;
    pnl.hintBtn.disabled = true;
    btn?.classList.add('right');
    pnl.choices.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
    this.renderStars();
    if (tierChange > 0) toast('Level up! Trickier scales.', 'reward');
    requestAnimationFrame(() => pnl.next.focus());
  }

  private onWrong(btn: HTMLButtonElement | null, c: Choice): void {
    const pnl = this.panel!;
    const p = pnl.problem;
    pnl.tries++;
    if (!pnl.recorded) {
      pnl.recorded = true;
      const o = recordAnswer(this.save.learner, p.job, { correct: false, hintRung: pnl.hintRung, misconception: (c.misconception ?? null) as Misconception | null }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let us practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(mistakeLine(p, c.misconception ?? 'miscounted', c.value), 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.choices.querySelector<HTMLButtonElement>('.ebs-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `ebs-feedback ${kind}`;
    pnl.feedback.replaceChildren(kind === 'hint' ? iconImg('bulb', '', 22) : kind === 'good' ? iconImg('star', '', 22) : '', h('span', { text: keepFacts(text) }));
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
    if (k >= 2) pnl.scale.revealWeights();
    if (k >= 3) pnl.choices.querySelector(`[data-value="${CSS.escape(p.steps[0].choices.find((c) => c.correct)!.value)}"]`)?.classList.add('worked');
    this.showFeedback(`Hint ${k} of 3: ${hintText(p, k)}`, 'hint');
  }

  private renderStars(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const n = this.save.stars[pnl.job];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_JOB }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_JOB} stars`);
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    const j = pnl.job;
    const rec = skill(this.save.learner, j);
    const ready = this.save.stars[j] >= STARS_PER_JOB && (rec.tier >= 2 || this.save.played[j] >= MAX_PER_JOB);
    if (ready && !this.save.done.includes(j)) {
      pnl.modal.close();
      void this.finishJob(j);
    } else this.nextChallenge();
  }

  private onJobKey(e: KeyboardEvent): void {
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
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.ebs-choice')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closePanel(): void {
    stopSpeaking();
    this.panel?.scale.dispose();
    this.panel = null;
    if (this.mode === 'job') {
      this.mode = 'world';
      audio.play(this.save.done.length >= OPEN_JOBS.length ? 'beacon' : 'outpost');
    }
    this.touch?.setVisible(touchControlsVisible());
    this.renderHud();
  }

  private async finishJob(j: Job): Promise<void> {
    this.mode = 'busy';
    audio.play('outpost');
    const info = JOB_INFO[j];
    const who = this.speakers[PERSON_OF[j]];
    await this.talk.say(who, 'Five stars! Before you go, one question.', 'proud');
    const res = await this.talk.ask(who, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${j}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(j);
    this.persist();
    this.world.setLit(this.save.done.length);
    this.world.cheer();
    this.updateMarkers();
    audio.levelUp();
    toast(`A beacon lamp is lit! ${this.save.done.length} of 3`, 'reward');
    await this.talk.say(who, info.done, 'proud');
    const left = OPEN_JOBS.filter((x) => !this.save.done.includes(x));
    if (left.length) await this.talk.say(this.speakers.kiri, `Look at it glow! Next, ${PEOPLE[PERSON_OF[left[0]]].name} could use your help.`, 'proud');
    else if (!this.save.weighinCalled) {
      audio.play('beacon');
      await this.talk.say(this.speakers.kiri, WEIGHIN_READY, 'proud');
      this.save.weighinCalled = true;
      this.persist();
    }
    this.talk.end();
    this.renderHud();
    this.mode = 'world';
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.beaconEl = h('span', { class: 'ebs-beacon', role: 'img' });
    const bar = h('div', { class: 'panel ebs-hudbar' }, this.beaconEl);
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
    this.beaconEl.replaceChildren(pix(`beacon-icon-${lit}`, () => paintBeaconIcon(lit), 2), h('span', { class: 'ebs-beacon-text', text: `${lit} of 3` }));
    this.beaconEl.setAttribute('aria-label', `${lit} of 3 beacon lamps lit`);
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
  }

  private openJobList(): void {
    if (this.mode !== 'world') return;
    const walkTo = (id: PersonId) => () => {
      modal.close();
      const t = this.world.targets.find((x) => x.id === id);
      if (t) this.world.walkTo(t);
    };
    const rows = (['weigh', 'rover', 'dome'] as Job[]).map((j) => {
      const info = JOB_INFO[j];
      const open = OPEN_JOBS.includes(j);
      const n = this.save.stars[j];
      const on = this.save.done.includes(j);
      const person = PEOPLE[info.person].name;
      return h(
        'li',
        { class: `belt-row${open ? '' : ' soon'}` },
        pix(`job-${j}-${open}`, () => paintJobIcon(j, open), 2),
        h(
          'div',
          { class: 'belt-info' },
          h('strong', { text: `${info.name}: ${info.skill} (${info.grades})` }),
          h('span', { text: !open ? `${person}’s seed pods are still growing. Opens soon!` : on ? 'Done! Its beacon lamp is lit.' : `Help ${person}. 5 stars lights a beacon lamp.` }),
          ...(open ? [h('span', { class: 'belt-stars', 'aria-label': `${n} of 5 stars` }, ...Array.from({ length: 5 }, (_, k) => iconImg(k < n ? 'star' : 'starEmpty', '', 18)))] : []),
        ),
        ...(open ? [h('button', { class: 'btn small', type: 'button', text: 'Walk there', onclick: walkTo(info.person) })] : []),
      );
    });
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'jobs-title', style: 'width:min(620px,100%)' },
      h('header', {}, h('h2', { id: 'jobs-title', text: 'Outpost jobs' }), h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Close' : 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', style: 'margin:0 0 10px', text: 'Win 5 stars at a job to light one of the beacon’s lamps. A star is for getting it right the first time.' }), h('ul', { class: 'belt-list' }, ...rows)),
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
        const ok = await choose(this.host, 'Start over?', 'This erases your stars and the lit beacon in this browser. Settings are kept.', [
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
      'answer-next': 'reading = as "the answer comes next" (8 + 4 = ? + 5 → 12)',
      'added-all': 'adding every number shown',
      'wrong-operation': 'working the wrong way to find a missing number',
      'add-change': 'adding instead of multiplying (3 × 8 = 6 × ? → 5)',
      'one-pan': 'checking only part of one side (6 + 4 = 10 + 1 called true)',
      backwards: 'thinking a number alone on the left is "backwards"',
      'tipped-wrong-way': 'mixing up which side is heavier',
      miscounted: 'a slip working out one side',
      'one-off': 'a near miss by one',
    };
    const rows = OPEN_JOBS.map((j) => {
      const rec = this.save.learner[j];
      const mis = topMisconception(rec);
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: `${JOB_INFO[j].name} (${JOB_INFO[j].skill})` }),
        h('td', { text: this.save.done.includes(j) ? 'Done' : rec ? 'In progress' : 'Not started' }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? (WORDS[mis] ?? '–') : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', { text: `This summary is kept only in this browser. Beacon lamps lit: ${this.save.done.length} of 3.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Job', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const pnl = this.panel;
    const p = pnl?.problem;
    return {
      mode: this.mode,
      player: { x: this.world.player.x, y: this.world.player.y },
      target: this.target ? this.target.id : null,
      stars: { ...this.save.stars },
      played: { ...this.save.played },
      done: [...this.save.done],
      lit: this.world.litCount,
      talking: this.talk.isOpen,
      night: this.world.night,
      panel:
        pnl && p
          ? {
              job: pnl.job,
              kind: p.kind,
              tier: skill(this.save.learner, pnl.job).tier,
              left: p.left.text,
              right: p.right.text,
              answer: p.answer,
              ask: p.steps[0].ask,
              hintRung: pnl.hintRung,
              answered: pnl.answered,
              showing: pnl.showing,
              tilt: pnl.scale.root.dataset.tilt,
              right_: p.steps[0].choices.findIndex((c) => c.correct),
              wrong: p.steps[0].choices.filter((c) => !c.correct).map((c) => ({ value: c.value, misconception: c.misconception })),
            }
          : null,
    };
  }
}

/** Keeps each math fact on one line ("7 + ? = 12" never breaks after a sign) by joining it with no-break spaces. */
function keepFacts(t: string): string {
  return t.replace(/ (?=[×÷=+−])|(?<=[×÷=+−]) /g, ' ');
}
