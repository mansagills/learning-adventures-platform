import { lookFromAppearance, type CharacterLook } from '../../kit/art/characters';
import { iconImg } from '../../kit/art/icons';
import { paintPortrait, type Expression } from '../../kit/art/portraits';
import { bus } from '../../kit/core/events';
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
import { BALLOON_COLORS, paintMunchPortrait, paintTicket } from './art';
import { makeStage, pix, type Answer, type Stage } from './booths';
import { BOOTH_INFO, CONTROLS_TIP_KEYS, CONTROLS_TIP_TOUCH, FINALE, GROWNUPS, OPENING, STARS_PER_BOOTH, hintText, mistakeLine, praise } from './content';
import { CARNIVAL_SONG, NIGHT_SONG } from './music';
import { BOOTHS, makeProblem, type Booth, type Misconception, type Problem } from './problems';
import { freshSave, store, type CarnivalSave } from './save';
import { CarnivalWorld, type Target } from './world';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MAX_PER_BOOTH = 12;

const ROSA_LOOK: CharacterLook = {
  build: 'adult',
  skin: { base: '#9c6440', shade: '#834f31' },
  hair: { style: 'curly', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
  shirt: { base: '#f4f1e8', shade: '#d9d3c4' },
  pants: '#2b2b33',
  shoes: '#2b1d1e',
  accessory: 'none',
  accent: '#f2c94c',
  extras: { jacket: { base: '#c0392b', shade: '#962d22' }, tie: '#f2c94c', lapelFlower: '#f2c94c' },
};

type Mode = 'title' | 'world' | 'busy' | 'booth';

export class Game {
  private readonly r: PixelRenderer;
  private readonly world: CarnivalWorld;
  private readonly input = new Input();
  private readonly talk: Talk;
  private touch: TouchControls | null = null;
  private save: CarnivalSave;
  private mode: Mode = 'title';
  private last = performance.now();
  private hud!: HTMLElement;
  private ticketsEl!: HTMLElement;
  private lightsEl!: HTMLElement;
  private promptEl!: HTMLButtonElement;
  private target: Target | null = null;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly rosa: Speaker;
  private readonly munch: Speaker;
  // the open booth
  private panel: { modal: Modal; booth: Booth; problem: Problem; stage: Stage; hintRung: number; tries: number; recorded: boolean; firstMis: Misconception | null; feedback: HTMLElement; hintBtn: HTMLButtonElement; next: HTMLButtonElement; body: HTMLElement; stars: HTMLElement; level: HTMLElement; prompt: HTMLElement } | null = null;
  private praiseCount = 0;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    this.save = store.exists() ? store.load() : freshSave();
    this.r = new PixelRenderer(host);
    this.world = new CarnivalWorld(this.r);
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const portrait = (key: string, paint: () => string) => {
      let u = cache.get(key);
      if (!u) cache.set(key, (u = paint()));
      return u;
    };
    this.rosa = { name: 'Ringmaster Rosa', role: 'Runs the carnival', voice: 230, portrait: (e: Expression) => portrait(`rosa-${e}`, () => paintPortrait(ROSA_LOOK, e).toDataURL(3)) };
    this.munch = { name: 'Munch', role: 'Very hungry snack monster', voice: 140, portrait: (e: Expression) => portrait(`munch-${e}`, () => paintMunchPortrait(e).toDataURL(3)) };
    audio.addSong('carnival', CARNIVAL_SONG);
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
    // booth shortcuts work wherever focus is (a greyed-out answer drops focus)
    window.addEventListener('keydown', (e) => {
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) this.onBoothKey(e);
    });
    (window as unknown as { __cc: unknown }).__cc = {
      state: () => this.debugState(),
      screenOf: (kind: string, id: string) => {
        const t = this.world.targets.find((x) => x.kind === kind && x.id === id);
        return t ? this.world.screenOf(t, 0) : null;
      },
      /** test helper: open a booth as if the player walked up to it */
      open: (booth: Booth) => this.mode === 'world' && void this.openBooth(booth),
    };
  }

  start(): void {
    this.world.build(this.playerLook(), ROSA_LOOK, new Set(this.save.done));
    this.world.setBalloon(this.carryingColor());
    if (this.save.finaleSeen) this.world.setNight(4, true);
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

  private carryingColor(): string | null {
    return BALLOON_COLORS.find((b) => b.id === this.save.carrying)?.color ?? null;
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Counting Carnival',
      subtitle: 'Count, compare and win at the fair',
      intro: ['Walk around the carnival with Ringmaster Rosa and Munch the snack monster. Count ducks, toss rings, feed Munch and count tickets at four booths.', 'For kindergarten to grade 2. Every line can be read aloud.'],
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your stars and tickets in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
    }
    this.titleEl?.remove();
    this.titleEl = null;
    openCustomize(this.host, this.save.appearance, { firstTime: true, noun: 'carnival kid' }, (a) => {
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
    audio.play(this.save.finaleSeen ? 'night' : 'carnival');
    this.renderHud();
    if (!this.save.openingSeen) void this.opening();
  }

  private async opening(): Promise<void> {
    this.mode = 'busy';
    await this.talk.say(this.rosa, OPENING);
    await this.talk.say(this.rosa, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'curious');
    this.talk.end();
    this.save.openingSeen = true;
    this.persist();
    this.mode = 'world';
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
    const label = t.kind === 'booth' ? `Play ${BOOTH_INFO[t.id as Booth].name}` : t.label;
    if (this.promptEl.dataset.label !== label) {
      this.promptEl.dataset.label = label;
      this.promptEl.replaceChildren(h('span', { text: label }), ...(isTouchDevice() ? [] : [h('span', { class: 'kbd', text: 'Space' })]));
    }
    const s = this.world.screenOf(t, t.kind === 'booth' ? 4.1 : 2.3);
    this.promptEl.style.left = `${s.x}px`;
    this.promptEl.style.top = `${s.y}px`;
    this.promptEl.hidden = !s.visible;
    this.touch?.setActLabel(t.kind === 'booth' ? 'Play' : 'Talk');
  }

  private onAction(a: string): void {
    if (this.mode === 'booth') return;
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
    // tap a booth, Rosa or Munch: walk there and use it
    let best: Target | null = null;
    let bd = 60;
    for (const t of this.world.targets) {
      const s = this.world.screenOf(t, t.kind === 'booth' ? 1.4 : 0.8);
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
    if (t.kind === 'booth') void this.openBooth(t.id as Booth);
    else if (t.kind === 'rosa') void this.talkToRosa();
    else void this.talkToMunch();
  }

  private async talkToRosa(): Promise<void> {
    this.mode = 'busy';
    const next = BOOTHS.find((b) => !this.save.done.includes(b));
    const pick = await this.talk.offer(this.rosa, next ? `Hello! Want a tip? Try the ${BOOTH_INFO[next].name} next.` : 'You lit up the whole carnival! What would you like to do?', ['Trade tickets for a balloon', 'Change how I look', 'Bye, Rosa!']);
    this.talk.end();
    this.mode = 'world';
    if (pick === 0) this.openBalloonShop();
    else if (pick === 1)
      openCustomize(this.host, this.save.appearance, { firstTime: false, noun: 'carnival kid' }, (a) => {
        this.save.appearance = a;
        this.persist();
        this.world.player.setLook(this.playerLook());
      });
  }

  private async talkToMunch(): Promise<void> {
    this.mode = 'busy';
    const done = this.save.done.includes('snacks');
    const pick = await this.talk.offer(this.munch, done ? 'MUNCH! You are my best snack helper. Play again?' : 'MUNCH! I am SO hungry. Will you help me pick snacks?', ['Yes, let us play!', 'Maybe later']);
    this.talk.end();
    this.mode = 'world';
    if (pick === 0) void this.openBooth('snacks');
  }

  // ------------------------------------------------------------ booths

  private async openBooth(booth: Booth): Promise<void> {
    this.mode = 'busy';
    const info = BOOTH_INFO[booth];
    const host = info.host === 'munch' ? this.munch : this.rosa;
    if (!this.save.introduced.includes(booth)) {
      await this.talk.say(host, info.intro);
      this.talk.end();
      this.save.introduced.push(booth);
      this.persist();
    }
    this.mode = 'booth';
    this.touch?.setVisible(false);
    const level = h('span', { class: 'cc-level' });
    const stars = h('span', { class: 'cc-stars', role: 'img' });
    const prompt = h('p', { class: 'cc-prompt' });
    const speakBtn = h('button', { class: 'btn small cc-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => speak(prompt.textContent ?? '', { force: true }));
    const feedback = h('div', { class: 'cc-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const body = h('div', { class: 'cc-body' });
    const hintBtn = h('button', { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' });
    const hostImg = h('img', { class: 'cc-host', src: host.portrait('smile'), alt: host.name, width: 96, height: 96 });
    const root = h(
      'div',
      { class: 'panel modal cc-panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cc-title' },
      h('header', {}, h('h2', { id: 'cc-title', text: info.name }), h('div', { class: 'cc-head-right' }, level, stars, h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }))),
      h('div', { class: 'cc-ask' }, hostImg, prompt, speakBtn),
      body,
      feedback,
      h('footer', { class: 'cc-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closeBooth(), { closeOnBackdrop: false });
    hintBtn.addEventListener('click', () => this.boothHint());
    next.addEventListener('click', () => this.afterBoothAnswer());
    this.panel = { modal, booth, problem: null as unknown as Problem, stage: null as unknown as Stage, hintRung: 0, tries: 0, recorded: false, firstMis: null, feedback, hintBtn, next, body, stars, level, prompt };
    audio.play('carnival');
    this.nextChallenge();
  }

  private nextChallenge(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const p = makeProblem(pnl.booth, skill(this.save.learner, pnl.booth).tier, this.save.seed++);
    this.persist();
    pnl.problem = p;
    pnl.hintRung = 0;
    pnl.tries = 0;
    pnl.recorded = false;
    pnl.firstMis = null;
    pnl.stage = makeStage(p, (a) => this.onBoothAnswer(a));
    pnl.body.replaceChildren(pnl.stage.el);
    pnl.prompt.textContent = p.prompt;
    pnl.level.textContent = `Level ${p.tier} of 3`;
    pnl.feedback.hidden = true;
    pnl.next.hidden = true;
    pnl.hintBtn.disabled = false;
    this.renderBoothStars();
    speak(p.prompt);
    requestAnimationFrame(() => [...pnl.body.querySelectorAll<HTMLButtonElement>('button:not([disabled])')].find((b) => b.offsetParent !== null)?.focus());
  }

  private renderBoothStars(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const n = this.save.stars[pnl.booth];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_BOOTH }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_BOOTH} stars`);
  }

  private onBoothAnswer(a: Answer): void {
    const pnl = this.panel;
    if (!pnl || !pnl.next.hidden) return;
    const p = pnl.problem;
    if (a.correct) {
      const clean = pnl.tries === 0 && pnl.hintRung <= 1;
      let tierChange = 0;
      if (!pnl.recorded) {
        pnl.recorded = true;
        tierChange = recordAnswer(this.save.learner, p.booth, { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
      }
      this.save.played[p.booth]++;
      if (clean && this.save.stars[p.booth] < STARS_PER_BOOTH) this.save.stars[p.booth]++;
      const won = clean ? 2 : 1;
      this.save.tickets += won;
      this.persist();
      pnl.stage.celebrate();
      if (clean) audio.itemGet();
      else audio.correct();
      const msg = clean ? `${praise(this.praiseCount++)} You win a star and ${won} tickets.` : `You got it! You win ${won} ticket. Stars are for getting it the first time.`;
      this.showBoothFeedback(msg, 'good');
      pnl.next.hidden = false;
      pnl.hintBtn.disabled = true;
      pnl.body.querySelector(`.cc-option[data-value="${a.value}"], .cc-plate[data-value="${a.value}"]`)?.classList.add('right');
      pnl.body.querySelectorAll('button').forEach((b) => ((b as HTMLButtonElement).disabled = true));
      this.renderBoothStars();
      this.renderHud();
      if (tierChange > 0) toast('Level up! Trickier counting.', 'reward');
      requestAnimationFrame(() => pnl.next.focus());
      return;
    }
    pnl.tries++;
    if (!pnl.recorded) {
      pnl.recorded = true;
      pnl.firstMis = a.misconception;
      const o = recordAnswer(this.save.learner, p.booth, { correct: false, hintRung: pnl.hintRung, misconception: a.misconception }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let us practice a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showBoothFeedback(mistakeLine(p, a.misconception ?? 'other', a.value), 'try');
    pnl.stage.reset();
    // wrong options are greyed out so the next try is a real choice
    const picked = pnl.body.querySelector<HTMLButtonElement>(`.cc-option[data-value="${a.value}"], .cc-plate[data-value="${a.value}"]`);
    if (picked) {
      picked.disabled = true;
      picked.classList.add('nope');
      pnl.body.querySelector<HTMLButtonElement>('.cc-option:not([disabled]), .cc-plate:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.boothHint(Math.min(3, pnl.tries));
  }

  private showBoothFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `cc-feedback ${kind}`;
    pnl.feedback.replaceChildren(kind === 'hint' ? iconImg('bulb', '', 22) : kind === 'good' ? iconImg('star', '', 22) : '', h('span', { text }));
    speak(text);
  }

  private boothHint(rung?: number): void {
    const pnl = this.panel;
    if (!pnl || !pnl.next.hidden) return;
    const nextRung = Math.min(3, rung ?? pnl.hintRung + 1);
    if (nextRung <= pnl.hintRung && rung === undefined) {
      toast('That is every hint. The answer is outlined!', 'hint');
      return;
    }
    pnl.hintRung = Math.max(pnl.hintRung, nextRung);
    audio.hint();
    pnl.stage.hint(pnl.hintRung);
    this.showBoothFeedback(`Hint ${pnl.hintRung} of 3: ${hintText(pnl.problem, pnl.hintRung)}`, 'hint');
  }

  private afterBoothAnswer(): void {
    const pnl = this.panel;
    if (!pnl || pnl.next.hidden) return;
    const b = pnl.booth;
    const rec = skill(this.save.learner, b);
    const ready = this.save.stars[b] >= STARS_PER_BOOTH && (rec.tier >= 2 || this.save.played[b] >= MAX_PER_BOOTH);
    if (ready && !this.save.done.includes(b)) {
      pnl.modal.close();
      void this.finishBooth(b);
    } else this.nextChallenge();
  }

  private onBoothKey(e: KeyboardEvent): void {
    const pnl = this.panel;
    if (!pnl) return;
    const k = e.key.toLowerCase();
    if (k === 'h') {
      e.preventDefault();
      this.boothHint();
    } else if ((k === ' ' || k === 'enter') && !pnl.next.hidden && document.activeElement !== pnl.next) {
      e.preventDefault();
      this.afterBoothAnswer();
    } else if (/^[1-3]$/.test(k)) {
      const btns = pnl.body.querySelectorAll<HTMLButtonElement>('.cc-option, .cc-plate');
      const b = btns[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closeBooth(): void {
    stopSpeaking();
    this.panel = null;
    if (this.mode === 'booth') this.mode = 'world';
    this.touch?.setVisible(touchControlsVisible());
    this.renderHud();
  }

  private async finishBooth(b: Booth): Promise<void> {
    this.mode = 'busy';
    const info = BOOTH_INFO[b];
    const host = info.host === 'munch' ? this.munch : this.rosa;
    await this.talk.say(host, 'Five stars! Before I light up this booth, one question.', 'proud');
    const res = await this.talk.ask(host, info.debrief, () => audio.hint());
    recordAnswer(this.save.learner, `${b}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
    this.save.done.push(b);
    this.save.tickets += 5;
    this.persist();
    this.world.setBoothLit(b, true);
    this.world.setNight(this.save.done.length);
    audio.levelUp();
    toast(`${info.name} is lit up! +5 tickets`, 'reward');
    await this.talk.say(host, info.done, 'proud');
    this.talk.end();
    this.renderHud();
    if (this.save.done.length === BOOTHS.length && !this.save.finaleSeen) await this.finale();
    this.mode = 'world';
  }

  private async finale(): Promise<void> {
    this.world.setNight(4, true);
    audio.play('night');
    await this.talk.say(this.rosa, FINALE, 'proud');
    this.talk.end();
    this.save.finaleSeen = true;
    this.persist();
  }

  // ------------------------------------------------------------ prizes

  private openBalloonShop(): void {
    const rows = BALLOON_COLORS.map((c) => {
      const owned = this.save.balloons.includes(c.id);
      const carrying = this.save.carrying === c.id;
      const b = h('button', {
        class: `btn${carrying ? ' primary' : ''}`,
        type: 'button',
        disabled: !owned && this.save.tickets < c.cost,
        text: carrying ? 'Carrying' : owned ? 'Carry' : `Trade ${c.cost} tickets`,
        onclick: () => {
          if (!owned) {
            this.save.tickets -= c.cost;
            this.save.balloons.push(c.id);
            audio.itemGet();
          }
          this.save.carrying = carrying ? null : c.id;
          this.persist();
          this.world.setBalloon(this.carryingColor());
          this.renderHud();
          modal.close();
        },
      });
      return h('li', { class: 'cc-shop-row' }, h('span', { class: 'cc-swatch', style: `background:${c.color}` }), h('strong', { text: c.name }), b);
    });
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'shop-title', style: 'width:min(520px,100%)' },
      h('header', {}, h('h2', { id: 'shop-title', text: 'Balloon stand' }), h('button', { class: 'btn small', type: 'button', text: 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', style: 'margin:0 0 10px', text: `You have ${this.save.tickets} tickets. Balloons are just for fun; they do not change the games.` }), h('ul', { class: 'cc-shop' }, ...rows)),
    );
    const modal = new Modal(this.host, root);
  }

  // ------------------------------------------------------------ HUD

  private buildHud(): void {
    this.ticketsEl = h('span', { class: 'cc-ticket-count' });
    this.lightsEl = h('span', { class: 'cc-lights', role: 'img' });
    const bar = h('div', { class: 'panel cc-hudbar' }, pix('hud-ticket', () => paintTicket(), 3), this.ticketsEl, h('span', { class: 'cc-sep', 'aria-hidden': 'true' }), this.lightsEl);
    this.promptEl = h('button', { class: 'panel prompt', type: 'button', hidden: true, onclick: () => this.target && this.use(this.target) });
    this.hud = h('div', { class: 'hud', hidden: true }, bar, this.promptEl);
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'booths', label: 'Booths', icon: 'scroll', key: 'B', onClick: () => this.openBoothList() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'b' && this.mode === 'world' && !document.querySelector('.modal-back') && !this.talk.isOpen) this.openBoothList();
    });
    this.touch = new TouchControls(this.hud, this.input, () => this.target && this.use(this.target));
    this.touch.setVisible(false);
  }

  private renderHud(): void {
    this.ticketsEl.textContent = `${this.save.tickets} tickets`;
    this.lightsEl.replaceChildren(...BOOTHS.map((b) => h('span', { class: `cc-bulb${this.save.done.includes(b) ? ' on' : ''}`, title: BOOTH_INFO[b].name })));
    this.lightsEl.setAttribute('aria-label', `${this.save.done.length} of 4 booths lit up`);
    this.touch?.setVisible(this.mode === 'world' && touchControlsVisible());
  }

  private openBoothList(): void {
    if (this.mode !== 'world') return;
    const rows = BOOTHS.map((b) => {
      const info = BOOTH_INFO[b];
      const s = this.save.stars[b];
      return h(
        'li',
        { class: 'belt-row' },
        h('span', { class: `cc-bulb big${this.save.done.includes(b) ? ' on' : ''}` }),
        h('div', { class: 'belt-info' }, h('strong', { text: info.name }), h('span', { text: info.skill }), h('span', { class: 'belt-stars', 'aria-label': `${s} of 5 stars` }, ...Array.from({ length: 5 }, (_, k) => iconImg(k < s ? 'star' : 'starEmpty', '', 18)))),
        h('button', {
          class: 'btn small',
          type: 'button',
          text: 'Walk there',
          onclick: () => {
            modal.close();
            const t = this.world.targets.find((x) => x.kind === 'booth' && x.id === b);
            if (t) this.world.walkTo(t);
          },
        }),
      );
    });
    const root = h(
      'div',
      { class: 'panel modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'booths-title', style: 'width:min(600px,100%)' },
      h('header', {}, h('h2', { id: 'booths-title', text: 'Carnival booths' }), h('button', { class: 'btn small', type: 'button', text: 'Close (Esc)', 'data-autofocus': true, onclick: () => modal.close() })),
      h('div', { class: 'content' }, h('p', { class: 'small-note', style: 'margin:0 0 10px', text: 'Win 5 stars at a booth to light it up. A star is for getting it right the first time.' }), h('ul', { class: 'belt-list' }, ...rows)),
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
      changeLook: () =>
        openCustomize(this.host, this.save.appearance, { firstTime: false, noun: 'carnival kid' }, (a) => {
          this.save.appearance = a;
          this.persist();
          this.world.player.setLook(this.playerLook());
        }),
      grownups: () => this.openGrownups(),
      resetSave: async () => {
        const ok = await choose(this.host, 'Start over?', 'This erases your stars, tickets and balloons in this browser. Settings are kept.', [
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
      skipped: 'skipping an object while counting',
      'double-counted': 'counting an object twice',
      miscount: 'miscounting by one on a quick look',
      'top-row-only': 'stopping at the full row of 5',
      'said-the-count': 'giving the rings there instead of the rings needed',
      'said-ten': 'answering 10 for "how many more make 10"',
      'wrong-way': 'mixing up more and less',
      'same-number': 'repeating the starting number',
      'one-for-ten': 'changing the ones instead of the tens',
      'ten-for-one': 'changing the tens instead of the ones',
      'bigger-looks-more': 'thinking bigger objects means more objects',
      'counted-strips': 'counting strips of 10 as 1 each',
      reversed: 'swapping tens and ones (74 for 47)',
      'added-digits': 'adding the digits (4 tens and 7 ones as 11)',
      'tens-off': 'one ten too many or too few',
    };
    const rows = BOOTHS.map((b) => {
      const rec = this.save.learner[b];
      const mis = topMisconception(rec);
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: BOOTH_INFO[b].name }),
        h('td', { text: this.save.done.includes(b) ? 'Lit up' : rec ? 'In progress' : 'Not started' }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? WORDS[mis] ?? '–' : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', { text: 'This summary is kept only in this browser. "Right first time" counts the first answer to each challenge; the level goes up after two clean answers in a row and down after two misses.' }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' }, h('thead', {}, h('tr', {}, ...['Booth', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))), h('tbody', {}, ...rows))),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const pnl = this.panel;
    return {
      mode: this.mode,
      player: { x: this.world.player.x, y: this.world.player.y },
      target: this.target ? { kind: this.target.kind, id: this.target.id } : null,
      tickets: this.save.tickets,
      stars: { ...this.save.stars },
      done: [...this.save.done],
      talking: this.talk.isOpen,
      booth: pnl ? { booth: pnl.booth, problem: pnl.problem, hintRung: pnl.hintRung, answered: !pnl.next.hidden, tier: skill(this.save.learner, pnl.booth).tier } : null,
      night: this.world.night,
    };
  }
}

