import { iconImg } from '../../kit/art/icons';
import { mulberry32 } from '../../kit/core/rng';
import { audio } from '../../kit/systems/audio';
import { isTouchDevice, settings } from '../../kit/systems/settings';
import { h, stackTop } from '../../kit/ui/dom';
import { PIECES, ROLE_COLOR, ROLE_NAME, type PieceId } from '../../kit/worlds/wild-lands/eco-art';
import { brambleCanvas, cardCanvas, EDGE, fireflyCanvas, glowCanvas, groundCanvas, hungryCanvas, pieceCanvas, seaCanvas, T } from './art';
import { PIECE_FACT, RULE_TEXT, UPGRADES } from './content';
import {
  bestMove,
  canPlace,
  census,
  dealHand,
  deck,
  diagnose,
  HABITAT,
  makeIsland,
  place,
  removeVines,
  RUNS,
  score,
  seasonName,
  spotsFor,
  spreadVines,
  VINE_EVERY,
  yearOf,
  type Board,
  type Census,
  type Link,
  type Rule,
  type RunSpec,
  type Score,
  type Trouble,
  type UpgradeId,
} from './rules';
import type { RunSave } from './save';

export interface RunHooks {
  /** A target was reached (not the last one): the game asks a Field Notebook question and offers research. Resolves with the upgrade picked. */
  milestone(reached: number, of: number): Promise<UpgradeId | null>;
  /** The run is over: restored (every target reached) or not (a target missed). */
  finished(won: boolean, trouble: Trouble | null, health: number, census: Census): void;
  /** Save the run so it can be picked up later. */
  persist(run: RunSave): void;
  /** A tile was placed for the first time ever. */
  firstPlace(id: PieceId): void;
}

interface Pop {
  el: HTMLElement;
  until: number;
}

/** Points by rule (for the preview and the popups). */
function byRule(s: Score): Map<Rule, number> {
  const m = new Map<Rule, number>();
  for (const p of s.pieces) for (const r of p.reasons) m.set(r.rule, (m.get(r.rule) ?? 0) + r.pts);
  for (const b of s.bonuses) m.set(b.rule, (m.get(b.rule) ?? 0) + b.pts);
  return m;
}

/** What changed between two scores, rule by rule, biggest first. */
export function ruleDeltas(before: Score, after: Score): Array<[Rule, number]> {
  const a = byRule(before);
  const z = byRule(after);
  const out: Array<[Rule, number]> = [];
  for (const k of new Set([...a.keys(), ...z.keys()])) {
    const d = (z.get(k) ?? 0) - (a.get(k) ?? 0);
    if (d) out.push([k, d]);
  }
  return out.sort((x, y) => Math.abs(y[1]) - Math.abs(x[1]));
}

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/**
 * The run: the island seen from above, the hand of tiles, the island's
 * health and the next target. Placing a tile scores the whole island again;
 * the popups name every reason the health changed, and the arrows show the
 * energy moving from food to eater.
 */
export class RunView {
  readonly root: HTMLElement;
  private readonly stage: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly hudEl: HTMLElement;
  private readonly tipEl: HTMLElement;
  private readonly handEl: HTMLElement;
  private readonly rerollBtn: HTMLButtonElement;
  private readonly sniffBtn: HTMLButtonElement;
  private readonly webBtn: HTMLButtonElement;
  private readonly placeBtn: HTMLButtonElement;
  private board: Board;
  private sc: Score;
  private readonly spec: RunSpec;
  private readonly pool: PieceId[];
  private selected = -1;
  private cursor = -1;
  /** On touch screens the first tap on a square shows what would happen; a second tap places. */
  private armed = -1;
  private lastPlaced = -1;
  private showWeb = false;
  private busy = false;
  private done = false;
  paused = false;
  private raf = 0;
  private pops: Pop[] = [];
  private bounce = { cell: -1, t0: 0 };
  private bramble = { x: 0, y: 0, tx: 0, ty: 0, face: 'right' as 'left' | 'right' };
  private rulesTold = new Set<Rule>();
  private view = { w: 480, h: 270, ox: 18, oy: 26, tall: false };
  private night = false;
  private readonly keyHandler = (e: KeyboardEvent) => this.onKey(e);
  private readonly resizeHandler = () => this.fit();

  constructor(
    host: HTMLElement,
    private readonly run: RunSave,
    unlocked: readonly PieceId[],
    private readonly hooks: RunHooks,
  ) {
    const fresh = makeIsland(run.kind, mulberry32(run.seed));
    this.board = { island: fresh.island, pieces: run.pieces.length === fresh.pieces.length ? [...run.pieces] : fresh.pieces };
    this.run.pieces = [...this.board.pieces];
    this.spec = RUNS[run.kind][run.length];
    this.pool = deck(run.kind, unlocked);
    this.sc = score(this.board, run.upgrades);

    this.canvas = h('canvas', { class: 'ebt-board px', 'aria-label': 'The island. Pick a tile from your hand, then a square to place it on.' });
    this.ctx = this.canvas.getContext('2d')!;
    this.hudEl = h('section', { class: 'panel ebt-hud', 'aria-live': 'polite' });
    this.tipEl = h('div', { class: 'panel ebt-tip', role: 'status', 'aria-live': 'polite' });
    this.handEl = h('div', { class: 'ebt-hand', role: 'group', 'aria-label': 'Your tiles this season' });
    const tool = (label: string, key: string, icon: string, on: () => void) => {
      const b = h(
        'button',
        { class: 'btn ebt-tool', type: 'button', 'aria-keyshortcuts': key, onclick: on },
        iconImg(icon, '', 22),
        h('span', { text: label }),
        h('span', { class: 'kbd', 'aria-hidden': 'true', text: key }),
      ) as HTMLButtonElement;
      return b;
    };
    this.rerollBtn = tool('New tiles', 'R', 'scroll', () => this.reroll());
    this.sniffBtn = tool('Sniff', 'S', 'bulb', () => this.sniff());
    this.webBtn = tool('Food web', 'F', 'star', () => this.toggleWeb());
    this.placeBtn = h('button', { class: 'btn primary ebt-place', type: 'button', hidden: true, text: 'Place it here', onclick: () => this.placeAt(this.armed) }) as HTMLButtonElement;
    const boardBox = h('div', { class: 'ebt-boardbox' }, this.canvas);
    this.stage = h(
      'div',
      { class: 'ebt-stage' },
      boardBox,
      h('div', { class: 'ebt-side' }, this.hudEl, this.tipEl, this.handEl, h('div', { class: 'ebt-tools-row' }, this.rerollBtn, this.sniffBtn, this.webBtn), this.placeBtn),
    );
    this.root = h('div', { class: 'ebt-run' }, this.stage);
    host.append(this.root);

    this.canvas.addEventListener('pointermove', (e) => this.onPointer(e, false));
    this.canvas.addEventListener('pointerdown', (e) => this.onPointer(e, true));
    this.canvas.addEventListener('pointerleave', () => {
      if (!isTouchDevice()) this.setCursor(-1);
    });
    window.addEventListener('keydown', this.keyHandler);
    window.addEventListener('resize', this.resizeHandler);
    this.fit();
    // Bramble starts on the beach
    this.goHome(true);
    if (!run.hand.length) this.deal();
    this.renderAll();
    this.tip(
      this.run.season === 1
        ? isTouchDevice()
          ? 'Tap a tile in your hand, then tap a square on the island.'
          : 'Pick a tile from your hand (1, 2 or 3), then a square on the island.'
        : 'Welcome back! Your island is just as you left it.',
    );
    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.draw();
    };
    loop();
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.keyHandler);
    window.removeEventListener('resize', this.resizeHandler);
    this.root.remove();
  }

  get health(): number {
    return this.sc.total;
  }

  /** Show the island at night with fireflies (the end of a restored run). */
  setNight(on: boolean): void {
    this.night = on;
  }

  // ------------------------------------------------------------ layout

  private fit(): void {
    const is = this.board.island;
    const tall = innerHeight > innerWidth * 1.1 || innerWidth < 700;
    const v = tall ? { w: is.w * T + 16, h: is.h * T + EDGE + 14, ox: 8, oy: 6, tall } : { w: is.w * T + 28, h: is.h * T + EDGE + 24, ox: 14, oy: 12, tall };
    this.view = v;
    this.canvas.width = v.w;
    this.canvas.height = v.h;
    this.root.classList.toggle('tall', tall);
    let s: number;
    if (tall) s = Math.min((innerWidth - 8) / v.w, 3);
    else {
      const room = Math.min(innerWidth - 360, innerWidth * 0.68);
      s = Math.max(1, Math.floor(Math.min(room / v.w, (innerHeight - 16) / v.h) * 2) / 2);
    }
    this.canvas.style.width = `${Math.floor(v.w * s)}px`;
    this.canvas.style.height = `${Math.floor(v.h * s)}px`;
  }

  // ------------------------------------------------------------ dealing

  private deal(): void {
    const size = this.run.upgrades.includes('big-hand') ? 4 : 3;
    this.run.hand = dealHand(this.board, this.pool, size, mulberry32(this.run.seed * 31 + this.run.deals * 977 + 1));
    this.run.deals++;
    this.selected = -1;
    this.armed = -1;
    if (!this.run.hand.length) {
      // nowhere at all to put anything (the island is full): the season passes
      void this.afterPlace(null);
    }
  }

  reroll(): void {
    if (this.busy || this.done || this.paused) return;
    if (this.run.rerolls <= 0) {
      this.tip('No more new tiles this run. Pick the one that helps most, or ask Bramble to sniff.');
      audio.retry();
      return;
    }
    this.run.rerolls--;
    audio.click();
    this.deal();
    this.hooks.persist(this.run);
    this.renderAll();
    this.tip('New tiles! Your other tiles went back in the bag.');
  }

  // ------------------------------------------------------------ choosing and placing

  pickCard(i: number): void {
    if (this.busy || this.done || i < 0 || i >= this.run.hand.length) return;
    this.selected = i;
    this.armed = -1;
    audio.blip(60 + i * 4);
    this.renderHand();
    this.placeBtn.hidden = true;
    if (this.selected >= 0) {
      const id = this.run.hand[i];
      const spots = spotsFor(this.board, id).length;
      this.tip(`${PIECES[id].name}: ${PIECE_FACT[id]}${spots ? '' : ' There is nowhere for it to go right now.'}`);
      if (this.cursor < 0 || !canPlace(this.board, id, this.cursor)) {
        const best = bestMove(this.board, [id], this.run.upgrades);
        if (best && !isTouchDevice()) this.setCursor(best.cell, true);
      } else this.setCursor(this.cursor, true);
    }
  }

  private setCursor(i: number, quiet = false): void {
    this.cursor = i;
    if (this.selected < 0 || i < 0) return;
    const id = this.run.hand[this.selected];
    if (!canPlace(this.board, id, i)) {
      if (!quiet) this.tip(`${PIECES[id].name} cannot go there. ${whereText(id)}`);
      return;
    }
    const after = score(place(this.board, id, i), this.run.upgrades);
    const d = after.total - this.sc.total;
    const parts = ruleDeltas(this.sc, after)
      .slice(0, 4)
      .map(([r, n]) => `${RULE_TEXT[r].name} ${signed(n)}`);
    this.tip(`${PIECES[id].name} here: ${signed(d)} health${parts.length ? ` (${parts.join(', ')})` : ''}.`);
  }

  private onPointer(e: PointerEvent, down: boolean): void {
    if (this.busy || this.done || this.paused) return;
    const r = this.canvas.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * this.view.w - this.view.ox;
    const py = ((e.clientY - r.top) / r.height) * this.view.h - this.view.oy;
    const is = this.board.island;
    const x = Math.floor(px / T);
    const y = Math.floor(py / T);
    const cell = x >= 0 && y >= 0 && x < is.w && y < is.h ? y * is.w + x : -1;
    if (!down) {
      if (e.pointerType === 'mouse' && cell !== this.cursor) this.setCursor(cell);
      return;
    }
    if (cell < 0) return;
    if (this.selected < 0) {
      this.tipAbout(cell);
      return;
    }
    if (e.pointerType === 'mouse') {
      this.cursor = cell;
      this.placeAt(cell);
      return;
    }
    // touch and pen: first tap previews, second tap places
    if (this.armed === cell) this.placeAt(cell);
    else {
      this.armed = cell;
      this.setCursor(cell);
      this.placeBtn.hidden = !canPlace(this.board, this.run.hand[this.selected], cell);
    }
  }

  /** Tapping a placed tile (with no tile picked) says what it is and how it is doing. */
  private tipAbout(cell: number): void {
    const id = this.board.pieces[cell];
    if (!id) return;
    const p = this.sc.pieces.find((x) => x.i === cell);
    const why = p?.reasons.map((r) => `${RULE_TEXT[r.rule].name} ${signed(r.pts)}`).join(', ');
    this.tip(`${PIECES[id].name}: ${PIECE_FACT[id]}${why ? ` Now: ${why}.` : ''}`);
  }

  placeAt(cell: number): void {
    if (this.busy || this.done || this.selected < 0 || cell < 0) return;
    const id = this.run.hand[this.selected];
    if (!canPlace(this.board, id, cell)) {
      audio.retry();
      this.tip(`${PIECES[id].name} cannot go there. ${whereText(id)}`);
      return;
    }
    const before = this.sc;
    this.board = place(this.board, id, cell);
    this.sc = score(this.board, this.run.upgrades);
    this.run.pieces = [...this.board.pieces];
    this.lastPlaced = cell;
    this.bounce = { cell, t0: performance.now() };
    this.placeBtn.hidden = true;
    this.armed = -1;
    this.hooks.firstPlace(id);
    const deltas = ruleDeltas(before, this.sc);
    const gained = this.sc.total - before.total;
    if (gained > 0) audio.itemGet();
    else audio.land();
    this.popAt(cell, `${signed(gained)}`, gained > 0 ? 'good' : gained < 0 ? 'bad' : '');
    // the big combos get their own popup
    for (const b of this.sc.bonuses) {
      const had = before.bonuses.some((x) => x.rule === b.rule && x.cells.join() === b.cells.join());
      if (!had && b.pts > 0) this.popAt(b.cells[b.cells.length - 1] ?? cell, b.rule === 'circle' ? `Circle of life! +${b.pts}` : `${RULE_TEXT[b.rule].name}! +${b.pts}`, 'big');
    }
    this.goHome();
    // Bramble explains a rule the first time it comes up this run
    const fresh = deltas.find(([r, n]) => n !== 0 && !this.rulesTold.has(r) && r !== 'sun');
    if (fresh) {
      this.rulesTold.add(fresh[0]);
      this.tip(`${RULE_TEXT[fresh[0]].name} ${signed(fresh[1])}: ${RULE_TEXT[fresh[0]].tip}`);
    } else this.tip(deltas.length ? deltas.map(([r, n]) => `${RULE_TEXT[r].name} ${signed(n)}`).join(', ') : `${PIECES[id].name} placed.`);
    this.selected = -1;
    void this.afterPlace(id);
  }

  private async afterPlace(_id: PieceId | null): Promise<void> {
    this.busy = true;
    this.renderAll();
    await wait(350);
    // the vine creeps every other season
    if (this.run.season % VINE_EVERY === 0 && this.board.pieces.includes('vine')) {
      const { board, spread } = spreadVines(this.board);
      if (spread.length) {
        this.board = board;
        this.sc = score(this.board, this.run.upgrades);
        this.run.pieces = [...this.board.pieces];
        this.popAt(spread[0], 'The vine crept!', 'bad');
        this.bounce = { cell: spread[0], t0: performance.now() };
        audio.retry();
        this.renderAll();
        await wait(500);
      }
    }
    const target = this.spec.targets[this.run.reached];
    if (target && this.run.season >= target.season) {
      if (this.sc.total >= target.health) {
        this.run.reached++;
        audio.levelUp();
        if (this.run.reached >= this.spec.targets.length) {
          this.finish(true);
          return;
        }
        this.run.season++;
        this.hooks.persist(this.run);
        this.renderHud();
        await wait(300);
        const up = await this.hooks.milestone(this.run.reached, this.spec.targets.length);
        if (up) this.applyUpgrade(up);
      } else {
        this.finish(false);
        return;
      }
    } else this.run.season++;
    this.deal();
    this.hooks.persist(this.run);
    this.busy = false;
    this.renderAll();
  }

  applyUpgrade(up: UpgradeId): void {
    if (!this.run.upgrades.includes(up)) this.run.upgrades.push(up);
    if (up === 'reroll') this.run.rerolls += 2;
    if (up === 'volunteers') {
      const had = this.board.pieces.filter((p) => p === 'vine').length;
      this.board = removeVines(this.board);
      this.run.pieces = [...this.board.pieces];
      if (had) this.tip(`Volunteer day! ${had} vine tile${had === 1 ? '' : 's'} pulled up. Now plant natives in the gaps.`);
    }
    this.sc = score(this.board, this.run.upgrades);
    this.renderAll();
  }

  private finish(won: boolean): void {
    this.done = true;
    this.busy = true;
    this.selected = -1;
    this.renderAll();
    const trouble = won ? null : diagnose(this.board, this.run.upgrades);
    this.hooks.finished(won, trouble, this.sc.total, census(this.board));
  }

  // ------------------------------------------------------------ Bramble, the food web

  sniff(): void {
    if (this.busy || this.done || this.paused) return;
    const m = bestMove(this.board, this.run.hand, this.run.upgrades);
    if (!m) return;
    audio.hint();
    this.selected = m.card;
    this.renderHand();
    this.cursor = m.cell;
    this.armed = m.cell;
    this.moveBramble(m.cell);
    const id = this.run.hand[m.card];
    const after = score(place(this.board, id, m.cell), this.run.upgrades);
    const why = ruleDeltas(this.sc, after)
      .filter(([, n]) => n > 0)
      .slice(0, 2)
      .map(([r]) => RULE_TEXT[r].name.toLowerCase());
    this.tip(
      m.gain > 0
        ? `Bramble sniffs... the ${PIECES[id].name.toLowerCase()} on the glowing square: ${signed(m.gain)} health${why.length ? ` (${why.join(' and ')})` : ''}.`
        : `Bramble sniffs... nothing helps much this season. The ${PIECES[id].name.toLowerCase()} on the glowing square does least harm. Try new tiles?`,
    );
    this.placeBtn.hidden = !isTouchDevice();
  }

  toggleWeb(): void {
    this.showWeb = !this.showWeb;
    this.webBtn.classList.toggle('on', this.showWeb);
    this.webBtn.setAttribute('aria-pressed', String(this.showWeb));
    if (this.showWeb) this.tip('The food web: each arrow goes from the food to the eater (the way the energy goes). Green arrows are pollination; purple arrows are decomposers recycling.');
  }

  /** Bramble waits on the beach at the front of the island. */
  private goHome(now = false): void {
    const is = this.board.island;
    const sand = is.ground.map((g, i) => (g === 'sand' && !this.board.pieces[i] ? i : -1)).filter((i) => i >= 0);
    const home = sand.reduce((best, i) => (Math.floor(i / is.w) * 100 - (i % is.w) > Math.floor(best / is.w) * 100 - (best % is.w) ? i : best), sand[0] ?? 0);
    this.moveBramble(home, now, 0, 0);
  }

  private moveBramble(cell: number, now = false, offX = 14, offY = 8): void {
    const is = this.board.island;
    const x = (cell % is.w) * T + T / 2;
    const y = Math.floor(cell / is.w) * T + T - 2;
    // Bramble stands just below the square, so the tile stays in view
    this.bramble.face = x < this.bramble.x ? 'left' : 'right';
    this.bramble.tx = x + offX;
    this.bramble.ty = y + offY;
    if (now) {
      this.bramble.x = this.bramble.tx;
      this.bramble.y = this.bramble.ty;
    }
  }

  // ------------------------------------------------------------ keys

  private onKey(e: KeyboardEvent): void {
    if (this.paused || this.done || document.querySelector('.modal-back') || stackTop() || document.querySelector('.dialogue')) return;
    const k = e.key.toLowerCase();
    const is = this.board.island;
    if (/^[1-4]$/.test(k)) {
      e.preventDefault();
      this.pickCard(Number(k) - 1);
    } else if (k === 'r') this.reroll();
    else if (k === 's') this.sniff();
    else if (k === 'f') this.toggleWeb();
    else if (k.startsWith('arrow')) {
      e.preventDefault();
      if (this.selected < 0) this.pickCard(0);
      let c = this.cursor < 0 ? Math.floor(is.h / 2) * is.w + Math.floor(is.w / 2) : this.cursor;
      const x = c % is.w;
      const y = Math.floor(c / is.w);
      if (k === 'arrowleft' && x > 0) c--;
      if (k === 'arrowright' && x < is.w - 1) c++;
      if (k === 'arrowup' && y > 0) c -= is.w;
      if (k === 'arrowdown' && y < is.h - 1) c += is.w;
      this.setCursor(c);
    } else if ((k === 'enter' || k === ' ') && this.selected >= 0 && this.cursor >= 0) {
      e.preventDefault();
      this.placeAt(this.cursor);
    }
  }

  // ------------------------------------------------------------ the panel, the tip and the hand

  private tip(text: string): void {
    this.tipEl.replaceChildren(h('img', { class: 'ebt-tip-face', src: brambleCanvas(0, 'right').toDataURL(), alt: '', width: 48, height: 48 }), h('p', { text }));
  }

  private renderAll(): void {
    this.renderHud();
    this.renderHand();
  }

  private renderHud(): void {
    const s = this.spec;
    const season = Math.min(this.run.season, s.seasons);
    const t = s.targets[this.run.reached];
    const max = Math.max(s.targets[s.targets.length - 1].health * 1.1, this.sc.total);
    const meter = h('div', { class: 'ebt-meter', role: 'img', 'aria-label': `Island health ${this.sc.total}${t ? `, next target ${t.health}` : ''}` }, h('div', { class: 'ebt-fill' }));
    (meter.firstChild as HTMLElement).style.width = `${Math.min(100, (this.sc.total / max) * 100)}%`;
    s.targets.forEach((x, i) => {
      const m = h('div', { class: `ebt-mark${i === this.run.reached ? ' next' : i < this.run.reached ? ' done' : ''}` });
      m.style.left = `${(x.health / max) * 100}%`;
      meter.append(m);
    });
    const left = t ? t.season - season : 0;
    const islandName = this.run.kind === 'meadow' ? 'Meadow Island' : 'Pond Island';
    this.hudEl.replaceChildren(
      h('div', { class: 'ebt-run-name', text: `${islandName} · ${this.run.length === 'short' ? 'Short run' : 'Long run'}` }),
      h('div', { class: 'ebt-season', text: `${seasonName(season)}, year ${yearOf(season)} · season ${season} of ${s.seasons}` }),
      h('div', { class: 'ebt-health' }, h('span', { text: `Island health ${this.sc.total}` }), t ? h('span', { class: 'ebt-target', text: `Target ${t.health}` }) : null),
      meter,
      h('div', {
        class: 'ebt-next',
        text: t
          ? `Target ${this.run.reached + 1} of ${s.targets.length}: reach ${t.health} by the end of ${seasonName(t.season).toLowerCase()}, year ${yearOf(t.season)} (${left === 0 ? 'this season' : `${left + 1} seasons left`}).`
          : this.done
            ? 'Every target reached!'
            : '',
      }),
      h('div', { class: 'ebt-ups', hidden: !this.run.upgrades.length }, ...this.run.upgrades.map((u) => h('span', { class: 'ebt-up', text: UPGRADES[u].name, title: UPGRADES[u].game }))),
    );
    this.rerollBtn.querySelector('span:not(.kbd)')!.textContent = `New tiles (${this.run.rerolls})`;
    this.rerollBtn.disabled = this.run.rerolls <= 0 || this.done;
    this.sniffBtn.disabled = this.done;
  }

  private renderHand(): void {
    this.handEl.replaceChildren(
      ...this.run.hand.map((id, i) => {
        const role = PIECES[id].role;
        const b = h(
          'button',
          {
            class: `ebt-card${i === this.selected ? ' on' : ''}`,
            type: 'button',
            'aria-pressed': String(i === this.selected),
            'aria-keyshortcuts': String(i + 1),
            'aria-label': `${i + 1}: ${PIECES[id].name}, ${ROLE_NAME[role]}`,
            disabled: this.busy || this.done,
            onclick: () => this.pickCard(i),
          },
          h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
          cardCanvas(id, i === this.selected).cloneNode() as HTMLCanvasElement,
          h('strong', { text: PIECES[id].name }),
          h('span', { class: 'ebt-role', text: ROLE_NAME[role].split(' (')[0] }),
        );
        const cv = b.querySelector('canvas') as HTMLCanvasElement;
        cv.getContext('2d')!.drawImage(cardCanvas(id, i === this.selected), 0, 0);
        cv.className = 'px';
        b.style.setProperty('--role', ROLE_COLOR[role]);
        return b;
      }),
    );
  }

  // ------------------------------------------------------------ popups

  private popAt(cell: number, text: string, kind: '' | 'good' | 'bad' | 'big'): void {
    const is = this.board.island;
    const x = this.view.ox + (cell % is.w) * T + T / 2;
    const y = this.view.oy + Math.floor(cell / is.w) * T;
    const el = h('div', { class: `ebt-pop ${kind}`, text, 'aria-hidden': 'true' });
    el.style.left = `${(x / this.view.w) * 100}%`;
    el.style.top = `${(y / this.view.h) * 100}%`;
    this.canvas.parentElement!.append(el);
    this.pops.push({ el, until: performance.now() + (kind === 'big' ? 2600 : 1600) });
  }

  // ------------------------------------------------------------ drawing

  private draw(): void {
    const now = performance.now();
    for (const p of this.pops.filter((x) => x.until < now)) p.el.remove();
    this.pops = this.pops.filter((x) => x.until >= now);
    const { ctx } = this;
    const v = this.view;
    const is = this.board.island;
    const frame = Math.floor(now / 400);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(seaCanvas(is, v.w, v.h, v.ox, v.oy, frame), 0, 0);
    ctx.drawImage(groundCanvas(is), v.ox, v.oy);
    const cellXY = (i: number) => [v.ox + (i % is.w) * T, v.oy + Math.floor(i / is.w) * T];

    // where the picked tile can go
    if (this.selected >= 0 && !this.done) {
      const id = this.run.hand[this.selected];
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      for (const i of spotsFor(this.board, id)) {
        const [x, y] = cellXY(i);
        ctx.fillRect(x + 1, y + 1, T - 2, T - 2);
      }
    }
    // the cursor
    if (this.cursor >= 0 && !this.done) {
      const [x, y] = cellXY(this.cursor);
      const ok = this.selected >= 0 && canPlace(this.board, this.run.hand[this.selected], this.cursor);
      ctx.fillStyle = this.selected < 0 ? '#ffffff' : ok ? '#ffe27a' : '#ff8a8a';
      for (let k = 0; k < T; k++) {
        if ((k + frame) % 4 === 3) continue;
        ctx.fillRect(x + k, y, 1, 1);
        ctx.fillRect(x + k, y + T - 1, 1, 1);
        ctx.fillRect(x, y + k, 1, 1);
        ctx.fillRect(x + T - 1, y + k, 1, 1);
      }
    }
    // the tiles, back row first
    const zero = new Set(this.sc.pieces.filter((p) => p.reasons.some((r) => r.rule === 'hungry' || r.rule === 'idle')).map((p) => p.i));
    for (let i = 0; i < this.board.pieces.length; i++) {
      const id = this.board.pieces[i];
      if (!id) continue;
      const c = pieceCanvas(id, frame + i);
      const [x, y] = cellXY(i);
      let lift = 0;
      if (this.bounce.cell === i && !settings.reducedMotion) {
        const t = (now - this.bounce.t0) / 300;
        if (t < 1) lift = Math.round(Math.sin(t * Math.PI) * 5);
      }
      ctx.drawImage(c, Math.round(x + T / 2 - c.width / 2), Math.round(y + T * 0.8 - c.height) - lift);
      if (zero.has(i) && !this.night) ctx.drawImage(hungryCanvas(), x + T - 12, y - 8 + (frame % 2));
    }
    // Bramble
    const b = this.bramble;
    const ease = settings.reducedMotion ? 1 : 0.15;
    b.x += (b.tx - b.x) * ease;
    b.y += (b.ty - b.y) * ease;
    const moving = Math.abs(b.tx - b.x) + Math.abs(b.ty - b.y) > 1;
    const bc = brambleCanvas(moving ? frame : 0, b.face);
    ctx.drawImage(bc, Math.round(v.ox + b.x - bc.width / 2), Math.round(v.oy + b.y - bc.height));
    // arrows
    const focus = this.showWeb ? null : this.cursor >= 0 && this.selected < 0 ? this.cursor : this.lastPlaced;
    const links = this.showWeb ? this.sc.links : this.sc.links.filter((l) => l.from === focus || l.to === focus);
    for (const l of links) this.arrow(l, frame);
    if (this.night) this.drawNight(frame);
  }

  private arrow(l: Link, frame: number): void {
    const is = this.board.island;
    const v = this.view;
    const c = (i: number): [number, number] => [v.ox + (i % is.w) * T + T / 2, v.oy + Math.floor(i / is.w) * T + T / 2];
    const [x1, y1] = c(l.from);
    const [x2, y2] = c(l.to);
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len < 1) return;
    const dx = (x2 - x1) / len;
    const dy = (y2 - y1) / len;
    const color = l.kind === 'eat' ? '#ffe27a' : l.kind === 'pollinate' ? '#9af07a' : '#d8a8ff';
    const ctx = this.ctx;
    const dot = (x: number, y: number) => {
      ctx.fillStyle = '#2a1a10';
      ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
    };
    for (let t = 6 + (frame % 3); t < len - 7; t += 3) dot(x1 + dx * t, y1 + dy * t);
    const hx = x2 - dx * 6;
    const hy = y2 - dy * 6;
    for (let s = 0; s < 4; s++) {
      dot(hx - dx * s - dy * s * 0.8, hy - dy * s + dx * s * 0.8);
      dot(hx - dx * s + dy * s * 0.8, hy - dy * s - dx * s * 0.8);
    }
  }

  private drawNight(frame: number): void {
    const ctx = this.ctx;
    const v = this.view;
    const is = this.board.island;
    ctx.fillStyle = 'rgba(20,26,68,0.55)';
    ctx.fillRect(0, 0, v.w, v.h);
    const glow = glowCanvas();
    this.board.pieces.forEach((p, i) => {
      if (p === 'mushrooms' || p === 'log') ctx.drawImage(glow, v.ox + (i % is.w) * T, v.oy + Math.floor(i / is.w) * T + 4);
    });
    const fly = fireflyCanvas();
    for (let i = 0; i < 18; i++) {
      if ((i + frame) % 5 === 0) continue;
      const x = v.ox + ((i * 53 + frame * (i % 3 ? 2 : -2) + 400) % (is.w * T));
      const y = v.oy + ((i * 37 + Math.round(Math.sin(frame * 0.5 + i) * 4) + 200) % (is.h * T));
      ctx.drawImage(fly, x, y);
    }
  }

  /** For the browser tests. */
  state() {
    return {
      season: this.run.season,
      seasons: this.spec.seasons,
      health: this.sc.total,
      reached: this.run.reached,
      targets: this.spec.targets,
      hand: [...this.run.hand],
      selected: this.selected,
      rerolls: this.run.rerolls,
      busy: this.busy,
      done: this.done,
      upgrades: [...this.run.upgrades],
      best: bestMove(this.board, this.run.hand, this.run.upgrades),
      w: this.board.island.w,
      pieces: [...this.board.pieces],
      ground: [...this.board.island.ground],
      view: { ...this.view },
    };
  }
}

function whereText(id: PieceId): string {
  const habitat = { land: 'It lives on grass or soil.', water: 'It lives in the pond water.', edge: 'It lives in the water or on the muddy edge.', any: 'It goes on any dry square.' } as const;
  return habitat[HABITAT[id]];
}

export function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
