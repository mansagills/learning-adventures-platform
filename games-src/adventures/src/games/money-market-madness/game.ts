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
import { setReadAloudDefault, speak } from '../../kit/systems/speech';
import { openCustomize } from '../../kit/ui/customize';
import { choose, h, Modal, stackTop } from '../../kit/ui/dom';
import { openGrownups } from '../../kit/ui/grownups';
import { mountToasts, toast, Toolbar } from '../../kit/ui/hud';
import { openSettings } from '../../kit/ui/settingsPanel';
import { Talk, type Speaker } from '../../kit/ui/talk';
import { showTitle } from '../../kit/ui/title';
import { paintItem, paintMoney } from './art';
import { CONTROLS_KEYS, CONTROLS_TOUCH, GROWNUPS, hintText, HOST_NAME, INTRO, LEAVE_LINES, mistakeLine, PRAISE, PROMPT, TIER_NAME, TIER_UP } from './content';
import { MARKET_SONG, SHOP_SONG } from './music';
import { pix } from './pix';
import { countUp, diagnoseChange, fewest, fmt, makeProblem, say, sum, VALUE, type Choice, type Misconception, type Money, type Problem, type Step, type Tier } from './problems';
import { freshSave, store, type MarketSave } from './save';
import { bonuses, customersPerDay, LINES, menu, nextIn, UPGRADES, type Upgrade } from './upgrades';
import { MarketWorld, type Customer } from './world';

const RULES: SkillRules = { maxTier: 4, masteryTier: 4, masteryCount: 5 };
const SKILL = 'money';
const BASE_TIP = 5;

const HOST_LOOK: CharacterLook = {
  build: 'adult',
  skin: { base: '#7a4a2e', shade: '#633b23' },
  hair: { style: 'puffs', base: '#2a1f1d', shade: '#1a1312', light: '#433331' },
  shirt: { base: '#f4f1e8', shade: '#d9d3c4' },
  pants: '#3a3550',
  shoes: '#2b1d1e',
  accessory: 'none',
  accent: '#e0823a',
  extras: { apron: '#e0823a' },
};

interface Order {
  items: Array<{ id: string; name: string; price: number }>;
  problem: Problem;
  step: number;
  tries: number;
  hintRung: number;
  allFirstTry: boolean;
  /** What the player has put in the change tray. */
  tray: Money[];
  paid: number;
}

interface Day {
  toArrive: number;
  total: number;
  arriveT: number;
  served: number;
  missed: number;
  startMoney: number;
  tips: number;
}

type Mode = 'title' | 'busy' | 'day' | 'summary' | 'shop' | 'paused';

export class Game {
  private readonly r: PixelRenderer;
  private readonly world: MarketWorld;
  private readonly talk: Talk;
  private readonly input = new Input();
  private save: MarketSave;
  private mode: Mode = 'title';
  private day: Day | null = null;
  private order: Order | null = null;
  private last = performance.now();
  private rnd = mulberry32(Date.now() % 100000);
  private readonly host: Speaker;
  // HUD and till
  private hud!: HTMLElement;
  private dayEl!: HTMLElement;
  private moneyEl!: HTMLElement;
  private lineEl!: HTMLElement;
  private tierEl!: HTMLElement;
  private till!: HTMLElement;
  private tillBody!: HTMLElement;
  private feedback!: HTMLElement;
  private hintBtn!: HTMLButtonElement;
  private serveBtn!: HTMLButtonElement;
  private bubble!: HTMLElement;
  private floats: Array<{ el: HTMLElement; life: number }> = [];
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private praiseN = 0;
  private lastCanServe = false;

  constructor(private readonly hostEl: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(false);
    this.save = store.exists() ? store.load() : freshSave();
    this.r = new PixelRenderer(hostEl);
    this.world = new MarketWorld(this.r);
    this.talk = new Talk(hostEl);
    const cache = new Map<string, string>();
    this.host = {
      name: HOST_NAME,
      role: 'Runs the market',
      voice: 220,
      portrait: (e: Expression) => {
        let u = cache.get(e);
        if (!u) cache.set(e, (u = paintPortrait(HOST_LOOK, e).toDataURL(3)));
        return u;
      },
    };
    audio.addSong('market', MARKET_SONG);
    audio.addSong('shop', SHOP_SONG);
    window.addEventListener('resize', () => {
      this.r.resize();
      this.layoutCamera();
    });
    this.input.onAction((a) => {
      if (a === 'mute') this.toggleMute();
      else if (a === 'menu' && this.mode === 'day') this.pause();
      else if (a === 'grownups' && this.mode === 'day') {
        this.pause();
        this.openGrownupsPage();
      } else if (a === 'hint' && this.mode === 'day' && this.order && !stackTop()) this.hint();
      else if (a === 'interact' && this.mode === 'day' && !this.order && !stackTop()) this.serve();
    });
    window.addEventListener('keydown', (e) => this.onKey(e));
    bus.on('settings:changed', () => {
      this.world.reducedMotion = settings.reducedMotion;
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
    });
    this.world.reducedMotion = settings.reducedMotion;
    this.buildHud();
    mountToasts(hostEl);
    (window as unknown as { __mm: unknown }).__mm = {
      state: () => this.debugState(),
      setMoney: (c: number) => {
        this.save.money = c;
        this.renderHud();
      },
      setTier: (t: Tier) => {
        skill(this.save.learner, SKILL).tier = t;
      },
      endDay: () => this.day && ((this.day.toArrive = 0), this.world.waiting.forEach((c) => this.world.leave(c, null, true))),
      drainPatience: () => this.world.waiting.forEach((c) => (c.patience = 0.01)),
    };
  }

  start(): void {
    this.world.build(this.playerLook(), this.save.owned);
    this.layoutCamera();
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

  private get tier(): Tier {
    return Math.max(1, Math.min(4, skill(this.save.learner, SKILL).tier)) as Tier;
  }

  // ------------------------------------------------------------ title

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    this.till.hidden = true;
    audio.play('shop');
    this.titleEl = showTitle(this.hostEl, {
      title: 'Money Market Madness',
      subtitle: 'Run a snack stand, count the money',
      intro: [
        'Customers line up at your market stand. Count their coins, check if they paid enough, and make change. Spend what you earn on new food, drinks, toppings and a fancier stand!',
        `Grades 1 to 4: coins, dollars and making change.${this.save.day > 1 ? ` You are on market day ${this.save.day} with ${fmt(this.save.money)} in the till.` : ''}`,
      ],
      hasSave: store.exists() && this.save.introSeen,
      continueGame: () => {
        audio.unlock();
        void this.startDay();
      },
      newGame: () => {
        audio.unlock();
        void this.newGame();
      },
      settings: () => this.openSettingsPanel(),
      grownups: () => this.openGrownupsPage(),
    });
  }

  private async newGame(): Promise<void> {
    if (store.exists() && this.save.introSeen) {
      const ok = await choose(this.hostEl, 'Start a new game?', 'This erases your money, upgrades and days in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
      this.world.refreshStall(this.save.owned);
    }
    this.titleEl?.remove();
    this.titleEl = null;
    openCustomize(this.hostEl, this.save.appearance, { firstTime: true, noun: 'stand owner' }, (a) => {
      this.save.appearance = a;
      this.persist();
      this.world.player.setLook(this.playerLook());
      void this.startDay();
    });
  }

  // ------------------------------------------------------------ a market day

  private async startDay(): Promise<void> {
    this.titleEl?.remove();
    this.titleEl = null;
    this.world.clearCustomers();
    const total = customersPerDay(this.save.owned);
    this.day = { toArrive: total, total, arriveT: 2.5, served: 0, missed: 0, startMoney: this.save.money, tips: 0 };
    this.order = null;
    this.hud.hidden = false;
    this.till.hidden = false;
    this.world.setEvening(0);
    this.renderHud();
    this.renderTill();
    this.mode = 'busy';
    audio.play('market');
    if (!this.save.introSeen) {
      await this.talk.say(this.host, INTRO);
      await this.talk.say(this.host, isTouchDevice() ? CONTROLS_TOUCH : CONTROLS_KEYS, 'curious');
      this.talk.end();
      this.save.introSeen = true;
      this.persist();
      this.day.arriveT = 0.3;
    } else toast(`Market day ${this.save.day}! ${total} customers today.`, 'info');
    this.mode = 'day';
  }

  private frame(dt: number): void {
    const active = this.mode === 'day' && !stackTop() && !this.talk.isOpen;
    if (active && this.day) {
      const d = this.day;
      d.arriveT -= dt;
      if (d.arriveT <= 0 && d.toArrive > 0 && this.world.waiting.length < 5) {
        d.toArrive--;
        d.arriveT = 5 + this.rnd() * 4;
        this.world.addCustomer(45 + bonuses(this.save.owned).patience * 5);
      }
      const ranOut = this.world.update(dt, true);
      for (const c of ranOut) this.customerLeaves(c);
      // the serve button wakes up when someone reaches the counter
      const canServe = !this.order && !!this.world.front;
      if (!this.order && canServe !== this.lastCanServe) {
        this.lastCanServe = canServe;
        this.renderTill();
      }
      if (d.toArrive === 0 && this.world.waiting.length === 0 && !this.order) void this.endDay();
      this.world.setEvening((d.served + d.missed) / d.total);
    } else this.world.update(dt, false);
    this.updateOverlays(dt);
    this.world.render();
  }

  private customerLeaves(c: Customer): void {
    if (!this.day) return;
    this.day.missed++;
    this.world.leave(c, null, false);
    this.floatAt(c.actor.x, c.actor.y, 2.2, LEAVE_LINES[Math.floor(this.rnd() * LEAVE_LINES.length)], 'sad');
    audio.retry();
    this.renderHud();
  }

  // ------------------------------------------------------------ serving

  private serve(): void {
    const c = this.world.front;
    if (!c || this.order) return;
    audio.click();
    const problem = makeProblem(this.tier, this.rnd);
    this.order = { items: this.itemsFor(problem), problem, step: 0, tries: 0, hintRung: 0, allFirstTry: true, tray: [], paid: 0 };
    this.renderTill();
    this.say(PROMPT[problem.steps[0].kind]);
  }

  /** Names the prices with things on the menu (food or drink; a topping or drink as the second item). */
  private itemsFor(p: Problem): Order['items'] {
    const m = menu(this.save.owned);
    const pickFrom = (list: Upgrade[]) => list[Math.floor(this.rnd() * list.length)];
    const first = pickFrom(this.rnd() < 0.6 ? m.food : m.drink);
    const items = [{ id: first.id, name: first.name, price: p.prices[0] }];
    if (p.prices.length > 1) {
      const pool = m.topping.length && this.rnd() < 0.5 ? m.topping : first.line === 'food' ? m.drink : m.food;
      const second = pickFrom(pool);
      items.push({ id: second.id, name: second.name, price: p.prices[1] });
    }
    return items;
  }

  private get step(): Step | null {
    return this.order ? this.order.problem.steps[this.order.step] : null;
  }

  private answer(correct: boolean, mis: Misconception | null, given: number | boolean): void {
    const o = this.order;
    const step = this.step;
    if (!o || !step) return;
    if (o.tries === 0) {
      const out = recordAnswer(this.save.learner, SKILL, { correct, hintRung: o.hintRung, misconception: mis }, RULES);
      if (out.tierChange > 0 && TIER_UP[out.record.tier]) toast(TIER_UP[out.record.tier], 'reward');
      if (out.tierChange < 0) toast('Let us practise a little more at an easier level.', 'hint');
    }
    if (!correct) {
      o.tries++;
      o.allFirstTry = false;
      audio.retry();
      const line = mistakeLine(step, mis ?? 'other', given);
      this.showFeedback(line, 'try');
      this.say(line);
      if (step.kind === 'change') o.tray = [];
      this.renderStep(true);
      if (o.tries >= 2) this.hint(Math.min(3, o.tries));
      this.persist();
      return;
    }
    audio.correct();
    if (step.kind === 'count') o.paid = step.answer;
    o.step++;
    o.tries = 0;
    o.hintRung = 0;
    if (o.step < o.problem.steps.length) {
      this.showFeedback('Right! Next step.', 'good');
      this.renderTill();
      this.say(PROMPT[o.problem.steps[o.step].kind]);
      return;
    }
    this.finishOrder();
  }

  private finishOrder(): void {
    const o = this.order!;
    const c = this.world.front;
    const sale = o.items.reduce((a, i) => a + i.price, 0);
    const tip = o.allFirstTry ? BASE_TIP + bonuses(this.save.owned).tip : 0;
    this.save.money += sale + tip;
    this.save.served++;
    if (this.day) {
      this.day.served++;
      this.day.tips += tip;
    }
    audio.itemGet();
    if (c) {
      this.world.leave(c, o.items[0].id, true);
      this.floatAt(c.actor.x, c.actor.y, 2.3, PRAISE[this.praiseN++ % PRAISE.length], 'good');
    }
    const cp = this.world.counterPoint();
    this.floatAt(cp.x, cp.y - 1.4, 2.6, `+${fmt(sale + tip)}${tip ? ` (tip ${fmt(tip)})` : ''}`, 'money');
    this.order = null;
    this.persist();
    this.renderHud();
    this.renderTill();
  }

  private hint(force?: number): void {
    const o = this.order;
    const step = this.step;
    if (!o || !step) return;
    const next = Math.min(3, force ?? o.hintRung + 1);
    if (next <= o.hintRung && force === undefined) {
      toast('That is every hint. The answer is outlined!', 'hint');
      return;
    }
    o.hintRung = Math.max(o.hintRung, next);
    audio.hint();
    if (o.hintRung >= 3 && step.kind === 'change') o.tray = fewest(step.answer, step.allowed);
    this.renderStep(false);
    const text = `Hint ${o.hintRung} of 3: ${hintText(step, o.hintRung)}`;
    this.showFeedback(text, 'hint');
    this.say(text);
  }

  // ------------------------------------------------------------ end of the day and the shop

  private async endDay(): Promise<void> {
    if (!this.day || this.mode !== 'day') return;
    this.mode = 'summary';
    this.till.hidden = true;
    const d = this.day;
    const earned = this.save.money - d.startMoney;
    if (earned > this.save.bestDay) this.save.bestDay = earned;
    this.save.day++;
    this.persist();
    audio.play('shop');
    audio.levelUp();
    const stat = (label: string, value: string) => h('div', { class: 'mm-stat' }, h('span', { text: label }), h('strong', { text: value }));
    const go = h('button', { class: 'btn primary', type: 'button', text: 'Open the upgrade shop', onclick: () => {
      modal.close();
      this.openShop();
    } });
    const root = h(
      'div',
      { class: 'panel modal mm-summary', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mm-sum-title' },
      h('header', {}, h('h2', { id: 'mm-sum-title', text: `Market day ${this.save.day - 1} is done!` })),
      h(
        'div',
        { class: 'content' },
        h('div', { class: 'mm-host-line' }, h('img', { src: this.host.portrait('proud'), alt: HOST_NAME, width: 72, height: 72 }), h('p', { text: d.served ? `You served ${d.served} ${d.served === 1 ? 'customer' : 'customers'}. Let us see what your money can buy!` : 'No sales today. Tomorrow will be better!' })),
        h('div', { class: 'mm-stats' }, stat('Customers served', `${d.served} of ${d.total}`), stat('Money earned today', fmt(earned)), stat('Tips (first try)', fmt(d.tips)), stat('Money in the till', fmt(this.save.money))),
      ),
      h('footer', { class: 'mm-foot' }, go),
    );
    const modal = new Modal(this.hostEl, root, undefined, { closeOnBackdrop: false, escapeCloses: false });
    requestAnimationFrame(() => go.focus());
  }

  private openShop(): void {
    this.mode = 'shop';
    const content = h('div', { class: 'content mm-shop' });
    const startBtn = h('button', { class: 'btn primary', type: 'button', text: `Start market day ${this.save.day}`, onclick: () => {
      modal.close();
      void this.startDay();
    } });
    const render = () => {
      const rows = LINES.map((line) => {
        const owned = UPGRADES.filter((u) => u.line === line.id && this.save.owned.includes(u.id));
        const next = nextIn(line.id, this.save.owned);
        const afford = next ? this.save.money >= next.cost : false;
        return h(
          'section',
          { class: 'mm-line', 'aria-label': line.name },
          h('h3', { text: line.name }),
          h('div', { class: 'mm-owned', 'aria-label': `You have: ${owned.map((u) => u.name).join(', ') || 'nothing yet'}` }, ...owned.map((u) => h('span', { class: 'mm-owned-item', title: u.name }, pix(`item-${u.id}`, () => paintItem(u.id), 2)))),
          next
            ? h(
                'div',
                { class: `mm-offer${afford ? '' : ' cant'}` },
                pix(`item-${next.id}`, () => paintItem(next.id), 3),
                h('div', { class: 'mm-offer-info' }, h('strong', { text: next.name }), h('span', { text: next.text }), h('span', { class: 'mm-after', text: afford ? `${fmt(this.save.money)} − ${fmt(next.cost)} = ${fmt(this.save.money - next.cost)} left` : `You need ${fmt(next.cost - this.save.money)} more` })),
                h('button', {
                  class: `btn${afford ? ' primary' : ''}`,
                  type: 'button',
                  'data-buy': next.id,
                  disabled: !afford,
                  text: `Buy ${fmt(next.cost)}`,
                  onclick: () => {
                    this.save.money -= next.cost;
                    this.save.owned.push(next.id);
                    this.persist();
                    audio.itemGet();
                    this.world.refreshStall(this.save.owned);
                    toast(`${next.name} added to your stand!`, 'reward');
                    render();
                    this.renderHud();
                  },
                }),
              )
            : h('p', { class: 'small-note', text: 'All done in this line!' }),
        );
      });
      content.replaceChildren(h('p', { class: 'mm-wallet' }, h('span', { text: 'Money in the till: ' }), h('strong', { text: fmt(this.save.money) })), ...rows);
    };
    render();
    const root = h(
      'div',
      { class: 'panel modal mm-shopmodal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mm-shop-title' },
      h('header', {}, h('h2', { id: 'mm-shop-title', text: 'Upgrade shop' })),
      content,
      h('footer', { class: 'mm-foot' }, startBtn),
    );
    const modal = new Modal(this.hostEl, root, undefined, { closeOnBackdrop: false, escapeCloses: false });
    requestAnimationFrame(() => (root.querySelector('[data-buy]:not([disabled])') as HTMLElement | null ?? startBtn).focus());
  }

  // ------------------------------------------------------------ the till panel

  private buildHud(): void {
    this.dayEl = h('strong', { class: 'mm-day' });
    this.moneyEl = h('strong', { class: 'mm-money' });
    this.lineEl = h('span', { class: 'mm-linecount' });
    this.tierEl = h('span', { class: 'mm-tier' });
    const top = h('div', { class: 'panel mm-top' }, this.dayEl, h('span', { class: 'mm-till-label' }, pix('money-quarter', () => paintMoney('quarter'), 1), this.moneyEl), this.lineEl, this.tierEl);
    this.tillBody = h('div', { class: 'mm-till-body' });
    this.feedback = h('div', { class: 'mm-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    this.hintBtn = h('button', { class: 'btn', type: 'button', onclick: () => this.hint() }, iconImg('bulb', '', 22), h('span', { text: 'Hint' }), h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }));
    this.serveBtn = h('button', { class: 'btn primary mm-serve', type: 'button', onclick: () => this.serve() });
    this.till = h('section', { class: 'panel mm-tillpanel', 'aria-label': 'Your till', hidden: true }, this.tillBody, this.feedback, h('div', { class: 'mm-till-foot' }, this.hintBtn, this.serveBtn));
    this.bubble = h('div', { class: 'mm-bubble', hidden: true, 'aria-hidden': 'true' });
    this.hud = h('div', { class: 'hud mm-hud', hidden: true }, top, this.bubble);
    this.hostEl.append(this.hud, this.till);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'pause', label: 'Pause', icon: 'gear', key: 'Esc', onClick: () => this.pause() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
    ]);
  }

  /** Keep the stand visible beside the till (wide screens) or above it (phones). */
  private layoutCamera(): void {
    const { w } = this.r.hostSize;
    const pxPerTile = (16 * this.r.scale) / (window.devicePixelRatio || 1);
    if (w > 760) this.world.camOffset = { x: Math.min(460, w * 0.42) / 2 / pxPerTile, y: 0 };
    else this.world.camOffset = { x: 0, y: (window.innerHeight * 0.64) / 2 / pxPerTile };
  }

  private renderHud(): void {
    const d = this.day;
    this.dayEl.textContent = `Day ${this.save.day}`;
    this.moneyEl.textContent = fmt(this.save.money);
    this.lineEl.textContent = d ? `Customers: ${d.served + d.missed}/${d.total}` : '';
    this.tierEl.textContent = TIER_NAME[this.tier];
  }

  private renderTill(): void {
    const o = this.order;
    const front = this.world.front;
    this.feedback.hidden = true;
    this.hintBtn.hidden = !o;
    this.serveBtn.hidden = !!o;
    this.serveBtn.disabled = !front;
    this.serveBtn.replaceChildren(h('span', { text: front ? 'Serve the next customer' : 'Waiting for customers…' }), front && !isTouchDevice() ? h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'Space' }) : '');
    if (!o) {
      const m = menu(this.save.owned);
      this.tillBody.replaceChildren(
        h('h2', { class: 'mm-till-title', text: 'Your stand' }),
        h('p', { class: 'small-note', text: front ? 'A customer is at the counter!' : 'Customers are on their way.' }),
        h('div', { class: 'mm-menu' }, ...[...m.food, ...m.drink, ...m.topping].map((u) => h('span', { class: 'mm-menu-item' }, pix(`item-${u.id}`, () => paintItem(u.id), 2), h('span', { text: u.name })))),
      );
      return;
    }
    this.renderStep(false);
  }

  private orderHeader(): HTMLElement {
    const o = this.order!;
    return h(
      'div',
      { class: 'mm-order' },
      // level 1 customers pay exactly the price, so the tag stays hidden until the coins are counted
      ...o.items.map((it) => h('div', { class: 'mm-order-item' }, pix(`item-${it.id}`, () => paintItem(it.id), 3), h('span', { class: 'mm-order-name', text: it.name }), h('span', { class: 'mm-tag', text: o.problem.tier === 1 && o.step === 0 ? '?' : fmt(it.price) }))),
    );
  }

  private moneyImg(m: Money, scale = 3): HTMLImageElement {
    return pix(`money-${m}`, () => paintMoney(m), scale, NAME_FOR(m));
  }

  private renderStep(keepFeedback: boolean): void {
    const o = this.order;
    const step = this.step;
    if (!o || !step) return;
    if (!keepFeedback) this.feedback.hidden = this.feedback.hidden || false;
    const stepNo = o.problem.steps.length > 1 ? h('span', { class: 'mm-stepno', text: `Step ${o.step + 1} of ${o.problem.steps.length}` }) : '';
    const promptRow = h('div', { class: 'mm-prompt' }, h('p', { text: PROMPT[step.kind] }), stepNo, h('button', { class: 'btn small', type: 'button', 'aria-label': 'Read the question aloud', onclick: () => speak(this.spokenPrompt(), { force: true }) }, iconImg('speak', '', 20)));
    let body: HTMLElement;
    if (step.kind === 'count') {
      let run = 0;
      const coins = h(
        'div',
        { class: `mm-hand${o.hintRung >= 2 ? ' show-values' : ''}`, role: 'img', 'aria-label': `The customer gives you: ${step.coins.map((c) => NAME_FOR(c)).join(', ')}` },
        ...step.coins.map((c) => {
          run += VALUE[c];
          return h('div', { class: 'mm-coin' }, this.moneyImg(c, 3), h('span', { class: 'mm-coin-val', text: `${VALUE[c]}¢` }), h('span', { class: 'mm-coin-run', text: fmt(run) }));
        }),
      );
      body = h('div', { class: 'mm-step' }, h('p', { class: 'mm-label', text: 'The customer gives you:' }), coins, this.choiceRow(step.choices, step.answer));
    } else if (step.kind === 'enough') {
      const yes = h('button', { class: 'btn mm-choice', type: 'button', 'data-value': 'yes', 'aria-keyshortcuts': '1 Y', onclick: () => this.answer(step.answer === true, step.answer ? null : 'said-yes', true) }, h('span', { class: 'mm-num', text: 'Yes, enough' }));
      const no = h('button', { class: 'btn mm-choice', type: 'button', 'data-value': 'no', 'aria-keyshortcuts': '2 N', onclick: () => this.answer(step.answer === false, step.answer ? 'said-no' : null, false) }, h('span', { class: 'mm-num', text: 'No, not enough' }));
      if (o.hintRung >= 3) (step.answer ? yes : no).classList.add('worked');
      body = h(
        'div',
        { class: 'mm-step' },
        h('div', { class: 'mm-compare' }, h('div', { class: 'mm-amount' }, h('span', { text: 'They paid' }), h('strong', { text: fmt(step.paid) })), h('span', { class: 'mm-vs', text: o.hintRung >= 2 ? (step.paid > step.price ? '>' : step.paid < step.price ? '<' : '=') : '?' }), h('div', { class: 'mm-amount' }, h('span', { text: 'The price' }), h('strong', { text: fmt(step.price) }))),
        h('div', { class: 'mm-choices' }, yes, no),
      );
    } else if (step.kind === 'total') {
      body = h(
        'div',
        { class: 'mm-step' },
        h('div', { class: 'mm-sum' }, h('strong', { text: fmt(step.prices[0]) }), h('span', { text: '+' }), h('strong', { text: fmt(step.prices[1]) }), h('span', { text: '=' }), h('strong', { text: '?' })),
        o.hintRung >= 2 ? h('p', { class: 'mm-helper', text: hintText(step, 2) }) : '',
        this.choiceRow(step.choices, step.answer),
      );
    } else {
      const change = sum(o.tray);
      const tray = h(
        'div',
        { class: 'mm-tray', 'aria-label': `Change in the tray: ${o.tray.length ? o.tray.map((m) => NAME_FOR(m)).join(', ') : 'nothing yet'}` },
        ...o.tray.map((m, i) =>
          h('button', { class: 'mm-tray-coin', type: 'button', 'aria-label': `Take back the ${NAME_FOR(m)}`, onclick: () => {
            o.tray.splice(i, 1);
            audio.click();
            this.renderStep(true);
          } }, this.moneyImg(m, m === 'dollar' ? 2 : 3)),
        ),
      );
      const path = countUp(step.price, step.paid);
      const pathEl = o.hintRung >= 2 ? h('div', { class: 'mm-path', 'aria-label': `Count up: ${path.map((p) => fmt(p.reach)).join(', ')}` }, h('span', { class: 'mm-path-start', text: fmt(step.price) }), ...path.map((p) => h('span', { class: 'mm-path-step' }, this.moneyImg(p.coin, p.coin === 'dollar' ? 1 : 2), h('span', { text: fmt(p.reach) })))) : '';
      const buttons = h(
        'div',
        { class: 'mm-coinbtns', role: 'group', 'aria-label': 'Coins to give' },
        ...[...step.allowed].reverse().map((m) =>
          h('button', { class: 'btn mm-coinbtn', type: 'button', 'data-money': m, 'aria-label': `Add a ${NAME_FOR(m)}`, onclick: () => {
            if (o.tray.length >= 14) return;
            o.tray.push(m);
            o.tray.sort((a, b) => VALUE[b] - VALUE[a]);
            audio.fx([[76 + Math.min(o.tray.length, 10), 0, 0.05]], 'square', 0.05);
            this.renderStep(true);
          } }, this.moneyImg(m, m === 'dollar' ? 1 : 2), h('span', { text: m === 'dollar' ? '$1' : `${VALUE[m]}¢` })),
        ),
      );
      const give = h('button', { class: 'btn primary mm-give', type: 'button', disabled: o.tray.length === 0, onclick: () => {
        const given = sum(o.tray);
        const mis = diagnoseChange(step.price, step.paid, given);
        if (mis === null && o.tray.length === fewest(step.answer, step.allowed).length && o.tries === 0) toast('Fewest coins too. Nice!', 'reward');
        this.answer(mis === null, mis, given);
      } }, h('span', { text: 'Give change' }), !isTouchDevice() ? h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'Enter' }) : '');
      if (o.hintRung >= 3) give.classList.add('worked');
      body = h(
        'div',
        { class: 'mm-step' },
        h('div', { class: 'mm-paidwith' }, h('span', { text: `Price ${fmt(step.price)}. They paid with` }), ...step.paidWith.map((m) => this.moneyImg(m, 2))),
        pathEl,
        h('p', { class: 'mm-label', text: 'Change tray (tap a coin to take it back):' }),
        tray,
        o.hintRung >= 2 ? h('p', { class: 'mm-sofar', text: `Change so far: ${fmt(change)}` }) : '',
        buttons,
        give,
      );
    }
    this.tillBody.replaceChildren(this.orderHeader(), promptRow, body);
    requestAnimationFrame(() => (this.tillBody.querySelector('.mm-choice:not([disabled]), .mm-coinbtn') as HTMLElement | null)?.focus({ preventScroll: true }));
  }

  private choiceRow(choices: Choice[], answer: number): HTMLElement {
    const o = this.order!;
    return h(
      'div',
      { class: 'mm-choices' },
      ...choices.map((c, i) => {
        const b = h('button', { class: 'btn mm-choice', type: 'button', 'data-value': String(c.value), 'aria-keyshortcuts': String(i + 1), onclick: () => {
          b.disabled = true;
          b.classList.add(c.correct ? 'right' : 'nope');
          this.answer(c.correct, c.correct ? null : (c.misconception ?? 'other'), c.value);
        } }, h('span', { class: 'mm-num', text: c.label }));
        if (o.hintRung >= 3 && c.value === answer) b.classList.add('worked');
        return b;
      }),
    );
  }

  private spokenPrompt(): string {
    const o = this.order;
    const step = this.step;
    if (!o || !step) return '';
    const items = o.items.map((i) => `${i.name}, ${say(i.price)}`).join(' and ');
    return `${items}. ${PROMPT[step.kind]}`;
  }

  private say(text: string): void {
    speak(text);
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    this.feedback.hidden = false;
    this.feedback.className = `mm-feedback ${kind}`;
    this.feedback.replaceChildren(kind === 'hint' ? iconImg('bulb', '', 20) : kind === 'good' ? iconImg('star', '', 20) : '', h('span', { text }));
  }

  private onKey(e: KeyboardEvent): void {
    if (this.mode !== 'day' || stackTop() || this.talk.isOpen || !this.order) return;
    const step = this.step;
    if (!step) return;
    const k = e.key.toLowerCase();
    if (/^[1-3]$/.test(k)) {
      const btns = this.tillBody.querySelectorAll<HTMLButtonElement>('.mm-choice:not([disabled])');
      const all = this.tillBody.querySelectorAll<HTMLButtonElement>('.mm-choice');
      const b = all[Number(k) - 1];
      if (b && !b.disabled && btns.length) {
        e.preventDefault();
        b.click();
      }
    } else if (step.kind === 'enough' && (k === 'y' || k === 'n')) {
      e.preventDefault();
      (this.tillBody.querySelector(`[data-value="${k === 'y' ? 'yes' : 'no'}"]`) as HTMLButtonElement | null)?.click();
    } else if (step.kind === 'change' && k === 'enter' && document.activeElement?.tagName !== 'BUTTON') {
      e.preventDefault();
      (this.tillBody.querySelector('.mm-give') as HTMLButtonElement | null)?.click();
    }
  }

  // ------------------------------------------------------------ overlays

  private floatAt(x: number, y: number, lift: number, text: string, kind: 'good' | 'sad' | 'money'): void {
    const el = h('div', { class: `mm-float ${kind}`, text, 'aria-hidden': 'true' });
    const s = this.world.screenOf(x, y, lift);
    el.style.left = `${Math.round(s.x)}px`;
    el.style.top = `${Math.round(s.y)}px`;
    this.hud.append(el);
    this.floats.push({ el, life: 1.4 });
  }

  private updateOverlays(dt: number): void {
    // the order bubble over the customer at the counter
    const c = this.world.front;
    if (c && this.mode === 'day') {
      const s = this.world.screenOf(c.actor.x, c.actor.y, 2.3);
      const icons = this.order ? this.order.items.map((i) => i.id) : null;
      const key = icons ? icons.join(',') : 'wait';
      if (this.bubble.dataset.k !== key) {
        this.bubble.dataset.k = key;
        this.bubble.replaceChildren(...(icons ? icons.map((id) => pix(`item-${id}`, () => paintItem(id), 2)) : [h('span', { text: 'Hi!' })]));
      }
      this.bubble.hidden = false;
      this.bubble.style.transform = `translate(${Math.round(s.x)}px, ${Math.round(s.y)}px) translate(-50%, -100%)`;
    } else this.bubble.hidden = true;
    for (const f of [...this.floats]) {
      f.life -= dt;
      f.el.style.translate = `-50% ${Math.round(-(1.4 - f.life) * 30)}px`;
      if (f.life < 0.3) f.el.style.opacity = String(Math.max(0, f.life / 0.3));
      if (f.life <= 0) {
        f.el.remove();
        this.floats.splice(this.floats.indexOf(f), 1);
      }
    }
  }

  // ------------------------------------------------------------ menus

  private pause(): void {
    if (this.mode !== 'day') return;
    this.mode = 'paused';
    this.openSettingsPanel(() => {
      if (this.mode === 'paused') this.mode = 'day';
    });
  }

  private toggleMute(): void {
    updateSettings({ muted: !settings.muted });
  }

  private openSettingsPanel(onClose?: () => void): void {
    openSettings(
      this.hostEl,
      {
        changeLook: () =>
          openCustomize(this.hostEl, this.save.appearance, { firstTime: false, noun: 'stand owner' }, (a) => {
            this.save.appearance = a;
            this.persist();
            this.world.player.setLook(this.playerLook());
          }),
        grownups: () => this.openGrownupsPage(),
        resetSave: async () => {
          const ok = await choose(this.hostEl, 'Start over?', 'This erases your money, upgrades and days in this browser. Settings are kept.', [
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
    openGrownups(this.hostEl, GROWNUPS, () => this.progressReport());
  }

  private progressReport(): HTMLElement {
    const WORDS: Record<string, string> = {
      'coin-count': 'counting coins instead of their values',
      'size-value': 'mixing up nickels and dimes (size versus value)',
      'quarter-20': 'counting a quarter as 20¢',
      miscount: 'a slip of one coin',
      'said-yes': 'saying "enough" when it was not',
      'said-no': 'saying "not enough" when it was',
      'gave-price': 'giving the price instead of the change',
      'off-one': 'change off by a penny',
      'off-five': 'change off by 5¢',
      'off-ten': 'change off by 10¢',
      'off-dollar': 'change off by a dollar',
      'no-regroup': 'not carrying 100 cents into a dollar',
      'dollars-only': 'adding only the dollars',
    };
    const rec = this.save.learner[SKILL];
    const mis = topMisconception(rec);
    return h(
      'div',
      {},
      h('p', { text: `Market days finished: ${this.save.day - 1}. Customers served: ${this.save.served}. Best day: ${fmt(this.save.bestDay)}. Money in the till: ${fmt(this.save.money)}. Upgrades bought: ${this.save.owned.length - 2} of ${UPGRADES.length - 2}.` }),
      h('div', { class: 'table-wrap' }, h('table', { class: 'progress-table' },
        h('thead', {}, h('tr', {}, ...['Level now', 'First tries', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))),
        h('tbody', {}, h('tr', {}, h('td', { text: `${this.tier}: ${TIER_NAME[this.tier]}` }), h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right` : 'Not started' }), h('td', { text: mis ? WORDS[mis] ?? '–' : '–' }))),
      )),
      h('p', { class: 'small-note', text: 'This summary is kept only in this browser. The level goes up after two right first tries in a row and down after two misses.' }),
    );
  }

  private persist(): void {
    store.save(this.save);
  }

  private debugState() {
    const o = this.order;
    return {
      mode: this.mode,
      money: this.save.money,
      dayNo: this.save.day,
      owned: [...this.save.owned],
      tier: this.tier,
      day: this.day ? { ...this.day } : null,
      front: !!this.world.front,
      waiting: this.world.waiting.length,
      order: o ? { items: o.items, step: o.step, steps: o.problem.steps, tries: o.tries, hintRung: o.hintRung, tray: [...o.tray] } : null,
      introSeen: this.save.introSeen,
      talking: this.talk.isOpen,
    };
  }
}

function NAME_FOR(m: Money): string {
  return { penny: 'penny', nickel: 'nickel', dime: 'dime', quarter: 'quarter', dollar: 'one-dollar bill', five: 'five-dollar bill' }[m];
}
