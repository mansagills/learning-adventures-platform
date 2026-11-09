import { iconImg } from '../../kit/art/icons';
import type { Expression } from '../../kit/art/portraits';
import { bus } from '../../kit/core/events';
import { mulberry32 } from '../../kit/core/rng';
import { recordAnswer, skill, topMisconception, type SkillRules } from '../../kit/learning/mastery';
import { audio } from '../../kit/systems/audio';
import { applySettingsToDocument, isTouchDevice, settings, updateSettings } from '../../kit/systems/settings';
import { setReadAloudDefault, speak, stopSpeaking } from '../../kit/systems/speech';
import { choose, h, Modal, stackTop } from '../../kit/ui/dom';
import { openGrownups } from '../../kit/ui/grownups';
import { mountToasts, toast, Toolbar } from '../../kit/ui/hud';
import { openSettings } from '../../kit/ui/settingsPanel';
import { Talk, type Speaker } from '../../kit/ui/talk';
import { showTitle } from '../../kit/ui/title';
import { paintPortrait16, type Look16, type Mood } from '../../kit/worlds';
import '../../kit/worlds/worlds.css';
import '../../kit/worlds/wild-lands/wild.css';
import { LUPE_FONOTI, NIA_ACHIENG, paintBoat, paintBramblePortrait, paintPiece, paintSea, PIECE_IDS, PIECES, THEO_PARK, type PieceId } from '../../kit/worlds/wild-lands/eco-art';
import { RunView, wait } from './board';
import {
  BRAMBLE_HELLO,
  CONTROLS_TIP_KEYS,
  CONTROLS_TIP_TOUCH,
  GROWNUPS,
  DROUGHT_END,
  DROUGHT_START,
  FINALE_OPEN,
  OPEN_DAY,
  ISLAND_INFO,
  MISCONCEPTION_WORDS,
  OPENING,
  OPENING_END,
  PEOPLE,
  PIECE_FACT,
  STARS_PER_ISLAND,
  TROUBLE_TEXT,
  UPGRADES,
  type PersonId,
} from './content';
import { FINALE_SONG, MEADOW_SONG, NIGHT_SONG, NOTEBOOK_SONG, POND_SONG, STATION_SONG, WETLAND_SONG, WOODS_SONG } from './music';
import { openFieldGuide, openWebBoard, webLinksAmong } from './guide';
import { buildModel, buildPic } from './pics';
import { pix } from './pix';
import { bank, makeQuestion, shuffle, type Choice, type Misconception, type Question, type Tier } from './problems';
import { deck, HOME_KINDS, ISLAND_KINDS, type HomeKind, makeIsland, RUNS, UNLOCK_ORDER, UPGRADE_IDS, type Census, type IslandKind, type RunLength, type Trouble, type UpgradeId } from './rules';
import { freshSave, store, type EcoSave, type RunSave } from './save';

const RULES: SkillRules = { maxTier: 3, masteryTier: 2, masteryCount: 3 };
const MOOD: Record<Expression, Mood> = { neutral: 'neutral', smile: 'smile', curious: 'curious', proud: 'smile', thinking: 'thinking' };
const LOOKS: Record<Exclude<PersonId, 'bramble'>, Look16> = { nia: NIA_ACHIENG, lupe: LUPE_FONOTI, theo: THEO_PARK };
const SONG: Record<IslandKind, string> = { meadow: 'meadow', pond: 'pond', woods: 'woods', wetland: 'wetland', archipelago: 'finale' };
/** The picture on each island's card at the station. */
const ISLAND_ART: Record<IslandKind, PieceId> = { meadow: 'flowers', pond: 'lilies', woods: 'oak', wetland: 'reeds', archipelago: 'heron' };

type Mode = 'title' | 'station' | 'run' | 'busy' | 'panel';

interface Panel {
  modal: Modal;
  island: HomeKind;
  /** One question at a milestone, or the Field Notebook (as many as the child likes). */
  kind: 'milestone' | 'notebook';
  q: Question;
  hintRung: number;
  tries: number;
  recorded: boolean;
  answered: boolean;
  /** Right on the first try, with at most the first hint (a milestone question then offers one more research card). */
  clean: boolean;
  pic: HTMLElement;
  model: HTMLElement;
  feedback: HTMLElement;
  hintBtn: HTMLButtonElement;
  next: HTMLButtonElement;
  choices: HTMLElement;
  stars: HTMLElement;
  level: HTMLElement;
  prompt: HTMLElement;
  done?: (clean: boolean) => void;
}

export class Game {
  private readonly talk: Talk;
  private save: EcoSave;
  private mode: Mode = 'title';
  private runView: RunView | null = null;
  private stationEl: HTMLElement | null = null;
  private hud!: HTMLElement;
  private toolbar!: Toolbar;
  private titleEl: HTMLElement | null = null;
  private readonly speakers: Record<PersonId, Speaker>;
  private panel: Panel | null = null;
  private praiseCount = 0;
  private lastEnd: { won: boolean; trouble: Trouble | null; health: number; unlocked: PieceId | null } | null = null;

  constructor(private readonly host: HTMLElement) {
    applySettingsToDocument();
    setReadAloudDefault(true);
    document.body.classList.add('world-wild');
    this.save = store.exists() ? store.load() : freshSave();
    this.talk = new Talk(host);
    const cache = new Map<string, string>();
    const speaker = (id: Exclude<PersonId, 'bramble'>, voice: number): Speaker => ({
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
      nia: speaker('nia', 190),
      lupe: speaker('lupe', 230),
      theo: speaker('theo', 170),
      bramble: {
        name: PEOPLE.bramble.name,
        role: PEOPLE.bramble.role,
        voice: 400,
        portrait: (e: Expression) => {
          const key = `bramble-${e === 'thinking' ? 0 : 1}`;
          let u = cache.get(key);
          if (!u) cache.set(key, (u = paintBramblePortrait(e !== 'thinking').toDataURL(2)));
          return u;
        },
      },
    };
    audio.addSong('station', STATION_SONG);
    audio.addSong('meadow', MEADOW_SONG);
    audio.addSong('pond', POND_SONG);
    audio.addSong('notebook', NOTEBOOK_SONG);
    audio.addSong('night', NIGHT_SONG);
    audio.addSong('woods', WOODS_SONG);
    audio.addSong('wetland', WETLAND_SONG);
    audio.addSong('finale', FINALE_SONG);
    bus.on('settings:changed', () => {
      this.toolbar?.setIcon('sound', settings.muted ? 'soundOff' : 'soundOn', settings.muted ? 'Sound off' : 'Sound');
    });
    this.buildHud();
    mountToasts(host);
    window.addEventListener('keydown', (e) => {
      if (this.panel && !this.talk.isOpen && stackTop() === this.panel.modal) return this.onPanelKey(e);
      if (document.querySelector('.modal-back') || this.talk.isOpen) return;
      if (this.mode !== 'station' && this.mode !== 'run') return;
      const k = e.key.toLowerCase();
      if (k === 'm') this.toggleMute();
      else if (k === 'escape') this.openSettingsPanel();
    });
    (window as unknown as { __ebt: unknown }).__ebt = {
      state: () => this.debugState(),
      run: () => this.runView?.state() ?? null,
      start: (kind: IslandKind, length: RunLength, seed?: number) => (this.mode === 'station' ? void this.startRun(kind, length, seed) : false),
      pick: (i: number) => this.runView?.pickCard(i),
      place: (cell: number) => this.runView?.placeAt(cell),
      sniff: () => this.runView?.sniff(),
      reroll: () => this.runView?.reroll(),
      notebook: (k: HomeKind) => this.mode === 'station' && this.openPanel(k, 'notebook'),
      setTier: (s: string, t: Tier) => {
        skill(this.save.learner, s).tier = t;
      },
      /** Open one question by its id (for screenshots). */
      ask: (k: HomeKind, id: string) => {
        const d = bank(k).find((x) => x.id === id);
        if (!d || this.mode !== 'station') return false;
        skill(this.save.learner, k).tier = d.tier;
        this.save.recent[k] = bank(k)
          .filter((x) => x.id !== id)
          .map((x) => x.id);
        this.openPanel(k, 'notebook');
        return true;
      },
      /** Mark islands as restored (for testing later parts). */
      guide: () => this.mode === 'station' && this.openGuide(),
      web: () => this.mode === 'station' && this.openWeb(),
      /** Mark tiles as found (for testing the Field Guide and the food web board). */
      see: (ids: PieceId[]) => {
        for (const id of ids) if (!this.save.seen.includes(id)) this.save.seen.push(id);
        this.persist();
      },
      restore: (ks: IslandKind[]) => {
        for (const k of ks) {
          if (!this.save.restored.includes(k)) this.save.restored.push(k);
          if (!this.save.debriefs.includes(k)) this.save.debriefs.push(k);
          this.save.runs[k] = Math.max(1, this.save.runs[k]);
        }
        this.save.openingSeen = true;
        this.persist();
        if (this.mode === 'station') this.renderStation();
      },
    };
  }

  start(): void {
    this.showTitleScreen();
  }

  // ------------------------------------------------------------ title and start

  private showTitleScreen(): void {
    this.mode = 'title';
    this.hud.hidden = true;
    audio.play('title');
    this.titleEl = showTitle(this.host, {
      title: 'Ecosystem Building Tycoon',
      subtitle: 'Bring the islands of the Wild Lands back to life',
      intro: [
        'Be a Junior Ranger with Warden Nia Achieng and Bramble the hedgehog. Each run is a new island: every season, place one plant, animal or decomposer where it can live well. Living things that help each other make combos (food chains, pollination, decomposers making rich soil) and the island grows healthier.',
        'For grades 3 to 5. Pick a short run (about 10 to 15 minutes) or a long one (about 25 to 30). If an island does not reach a target, you keep everything you have learned and unlocked.',
      ],
      hasSave: store.exists(),
      continueGame: () => {
        audio.unlock();
        this.enterStation();
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
      const ok = await choose(this.host, 'Start a new game?', 'This replaces your islands, badges and unlocked tiles in this browser.', [
        { id: 'yes', label: 'Yes, start over', kind: 'danger' },
        { id: 'no', label: 'No, go back' },
      ]);
      if (ok !== 'yes') return;
      this.save = store.reset();
    }
    this.enterStation();
  }

  // ------------------------------------------------------------ the ranger station

  private enterStation(): void {
    this.titleEl?.remove();
    this.titleEl = null;
    this.closePanelQuietly();
    this.talk.end();
    this.runView?.destroy();
    this.runView = null;
    this.hud.hidden = false;
    this.toolbar.button('station')!.hidden = true;
    this.mode = 'station';
    audio.play('station');
    this.renderStation();
    if (!this.save.openingSeen) void this.opening();
  }

  private async busy(f: () => Promise<void>): Promise<void> {
    const was = this.mode;
    this.mode = 'busy';
    if (this.runView) this.runView.paused = true;
    try {
      await f();
    } finally {
      this.talk.end();
      if (this.mode === 'busy') this.mode = was;
      if (this.runView) this.runView.paused = false;
    }
  }

  private async opening(): Promise<void> {
    await this.busy(async () => {
      await this.talk.say(this.speakers.nia, OPENING, 'smile');
      await this.talk.say(this.speakers.bramble, BRAMBLE_HELLO, 'smile');
      await this.talk.say(this.speakers.nia, OPENING_END, 'smile');
      await this.talk.say(this.speakers.bramble, isTouchDevice() ? CONTROLS_TIP_TOUCH : CONTROLS_TIP_KEYS, 'smile');
    });
    this.save.openingSeen = true;
    this.persist();
    this.renderStation();
  }

  /** Each island opens when the one before it is restored; the Archipelago when all four are. */
  private islandOpen(k: IslandKind): boolean {
    if (k === 'archipelago') return HOME_KINDS.every((x) => this.save.restored.includes(x));
    const i = HOME_KINDS.indexOf(k);
    return i === 0 || this.save.restored.includes(HOME_KINDS[i - 1]);
  }

  private stationBackground(): HTMLElement {
    const c = paintSea(320, 180, 0);
    const boat = paintBoat(24);
    c.blit(boat, 250, 128);
    c.blit(paintPiece('lilies', 24), 30, 140);
    return pix('station-sea', () => c, 1, '');
  }

  private renderStation(): void {
    this.stationEl?.remove();
    const sv = this.save;
    const run = sv.run;
    const card = (k: IslandKind) => {
      const info = ISLAND_INFO[k];
      const open = this.islandOpen(k);
      const stars = h(
        'span',
        { class: 'ebt-stars', role: 'img', 'aria-label': `${sv.stars[k]} of ${STARS_PER_ISLAND} Field Notebook stars` },
        ...Array.from({ length: STARS_PER_ISLAND }, (_, i) => iconImg(i < sv.stars[k] ? 'star' : 'starEmpty', '', 18)),
      );
      const art = pix(`island-${k}`, () => paintPiece(ISLAND_ART[k], 24), 3, '');
      const runHere = run?.kind === k;
      return h(
        'section',
        { class: `panel ebt-island-card${open ? '' : ' locked'}`, 'data-island': k },
        h('div', { class: 'ebt-island-head' }, art, h('div', {}, h('h2', { text: info.name }), h('p', { class: 'ebt-skill', text: info.skill }))),
        h(
          'p',
          { class: 'ebt-island-status' },
          open
            ? sv.restored.includes(k)
              ? `${info.badge} earned. Best health: ${sv.best[k]}. Runs: ${sv.runs[k]}.`
              : sv.runs[k]
                ? `Not restored yet. Best health: ${sv.best[k]}. Runs: ${sv.runs[k]}.`
                : 'A bare island, waiting for you.'
            : k === 'archipelago'
              ? 'Restore all four islands to open the finale.'
              : `Restore ${ISLAND_INFO[HOME_KINDS[HOME_KINDS.indexOf(k as HomeKind) - 1]].name} to open this one.`,
        ),
        open && !runHere
          ? h(
              'div',
              { class: 'ebt-run-buttons' },
              h(
                'button',
                { class: `btn${sv.lastLength === 'short' ? ' primary' : ''}`, type: 'button', 'data-run': `${k}-short`, onclick: () => void this.chooseRun(k, 'short') },
                h('strong', { text: 'Short run' }),
                h('small', { text: '10–15 min · 3 targets' }),
              ),
              h(
                'button',
                { class: `btn${sv.lastLength === 'long' ? ' primary' : ''}`, type: 'button', 'data-run': `${k}-long`, onclick: () => void this.chooseRun(k, 'long') },
                h('strong', { text: 'Long run' }),
                h('small', { text: '25–30 min · 5 targets' }),
              ),
            )
          : null,
        open && k !== 'archipelago'
          ? h(
              'button',
              { class: 'btn ebt-notebook-btn', type: 'button', 'data-notebook': k, onclick: () => this.openPanel(k as HomeKind, 'notebook') },
              iconImg('scroll', '', 22),
              h('span', { text: 'Field Notebook' }),
              stars,
            )
          : null,
        !open ? h('p', { class: 'ebt-lock' }, iconImg('lock', '', 22), h('span', { text: 'Locked' })) : null,
      );
    };
    const nextUnlock = UNLOCK_ORDER.find((u) => !sv.unlocked.includes(u));
    const resume = run
      ? h(
          'section',
          { class: 'panel ebt-resume' },
          h('p', { text: `Your run on ${ISLAND_INFO[run.kind].name} is waiting: season ${run.season} of ${RUNS[run.kind][run.length].seasons}.` }),
          h(
            'div',
            { class: 'ebt-run-buttons' },
            h('button', { class: 'btn primary', type: 'button', 'data-resume': '1', onclick: () => this.openRun(run) }, h('strong', { text: 'Carry on' })),
            h('button', { class: 'btn', type: 'button', onclick: () => void this.abandonRun() }, h('span', { text: 'Give up this run' })),
          ),
        )
      : null;
    const found = sv.seen.length;
    const links = webLinksAmong(sv.seen);
    const drawn = links.filter((l) => sv.webLinks.includes(l)).length;
    this.stationEl = h(
      'div',
      { class: 'ebt-station' },
      h('div', { class: 'ebt-station-bg' }, this.stationBackground()),
      h(
        'main',
        { class: 'ebt-station-main' },
        h(
          'header',
          { class: 'panel ebt-station-head' },
          h('img', { src: this.speakers.nia.portrait('smile'), alt: '', width: 72, height: 72 }),
          h('div', {}, h('h1', { text: 'Ranger Station' }), h('p', { text: 'Pick an island and a run. Each season, place one tile. Reach the health targets to restore the island.' })),
          h('button', { class: 'btn', type: 'button', onclick: () => void this.chatNia() }, h('span', { text: 'Talk to Nia' })),
        ),
        resume,
        h('div', { class: 'ebt-island-row' }, ...ISLAND_KINDS.map(card)),
        h(
          'section',
          { class: 'panel ebt-tiles ebt-hut' },
          h('h2', { text: 'The research hut' }),
          h(
            'div',
            { class: 'ebt-run-buttons' },
            h(
              'button',
              { class: 'btn', type: 'button', 'data-hut': 'guide', onclick: () => this.openGuide() },
              h('strong', { text: 'Field Guide' }),
              h('small', { text: `${found} of ${PIECE_IDS.length} living things and habitats found` }),
            ),
            h(
              'button',
              { class: 'btn', type: 'button', 'data-hut': 'web', onclick: () => this.openWeb() },
              h('strong', { text: 'Food web board' }),
              h('small', { text: links.length ? `${drawn} of ${links.length} arrows drawn` : 'Place some tiles first' }),
            ),
          ),
          h('p', {
            class: 'ebt-small',
            text: nextUnlock ? `Finish a run (restored or not) to unlock a new tile: the ${PIECES[nextUnlock].name.toLowerCase()}.` : 'You have unlocked every tile.',
          }),
        ),
      ),
    );
    this.host.insertBefore(this.stationEl, this.hud);
  }

  private openGuide(): void {
    this.mode = 'panel';
    audio.play('notebook');
    openFieldGuide(this.host, this.save.seen, () => this.backToStation());
  }

  private openWeb(): void {
    this.mode = 'panel';
    audio.play('notebook');
    openWebBoard(this.host, this.save.seen, this.save.webLinks, {
      found: (link) => {
        if (!this.save.webLinks.includes(link)) this.save.webLinks.push(link);
        this.persist();
      },
      close: () => this.backToStation(),
    });
  }

  private backToStation(): void {
    if (this.mode !== 'panel') return;
    this.mode = 'station';
    audio.play('station');
    this.renderStation();
  }

  private async chatNia(): Promise<void> {
    const sv = this.save;
    const line = !sv.restored.includes('meadow')
      ? 'Start with a short run on Meadow Island. Put plants down first: every food chain starts with them. Then add animals right next to the plants they eat.'
      : !sv.restored.includes('pond')
        ? 'Pond Island is open! Pond tiles only go in the water, and the muddy edge. Follow the food web: lily pads, snails, fish, then the heron.'
        : !sv.restored.includes('woods')
          ? 'Woods Island is open. Every autumn the oaks drop their leaves. Give them decomposers, or the leaves pile up.'
          : !sv.restored.includes('wetland')
            ? 'Wetland Island is out of balance: too many snails. Add water plants, and hunters to keep the plant-eaters in check.'
            : !sv.restored.includes('archipelago')
              ? 'The Archipelago is waiting: all four habitats on one island, and the weather station warns of a dry spell.'
              : 'Every island is restored! Try a long run, beat your best health, or finish the food web board in the research hut.';
    await this.busy(() => this.talk.say(this.speakers.nia, line, 'smile'));
  }

  private async abandonRun(): Promise<void> {
    const ok = await choose(this.host, 'Give up this run?', 'The island is cleared. You keep your badges, stars and tiles.', [
      { id: 'yes', label: 'Yes, give it up', kind: 'danger' },
      { id: 'no', label: 'No, keep it' },
    ]);
    if (ok !== 'yes') return;
    this.save.run = null;
    this.persist();
    this.renderStation();
  }

  // ------------------------------------------------------------ runs

  private async chooseRun(k: IslandKind, length: RunLength): Promise<void> {
    if (this.mode !== 'station') return;
    await this.startRun(k, length);
  }

  private async startRun(k: IslandKind, length: RunLength, seed?: number): Promise<void> {
    const sv = this.save;
    sv.lastLength = length;
    const s = seed ?? Math.floor(mulberry32(sv.seed++)() * 2 ** 31);
    const board = makeIsland(k, mulberry32(s));
    const spec = RUNS[k][length];
    // the living things already on the island count as found (the Field Guide and the food web board)
    for (const id of board.pieces) if (id && !sv.seen.includes(id)) sv.seen.push(id);
    sv.run = { kind: k, length, seed: s, pieces: board.pieces, season: 1, hand: [], rerolls: spec.rerolls, deals: 0, upgrades: [], reached: 0, drought: 0, droughtDone: false };
    this.persist();
    this.openRun(sv.run);
    if (sv.runs[k] === 0) {
      const info = ISLAND_INFO[k];
      await this.busy(() => this.talk.say(this.speakers[info.host], info.intro, 'smile'));
    }
  }

  private openRun(run: RunSave): void {
    this.stationEl?.remove();
    this.stationEl = null;
    this.runView?.destroy();
    this.mode = 'run';
    this.toolbar.button('station')!.hidden = false;
    audio.play(SONG[run.kind]);
    this.runView = new RunView(this.host, run, this.save.unlocked, {
      persist: (r) => {
        this.save.run = r;
        this.persist();
      },
      firstPlace: (id) => {
        if (!this.save.seen.includes(id)) {
          this.save.seen.push(id);
          this.persist();
        }
      },
      milestone: (reached, of) => this.milestone(run.kind, reached, of),
      event: (kind) => this.islandEvent(kind),
      finished: (won, trouble, health, census) => void this.runOver(run, won, trouble, health, census),
    });
    this.host.insertBefore(this.runView.root, this.hud);
  }

  /** The drought on the Archipelago starting or ending: Theo explains. */
  private async islandEvent(kind: 'drought-start' | 'drought-end'): Promise<void> {
    const was = this.mode;
    this.mode = 'busy';
    await this.talk.say(this.speakers.theo, kind === 'drought-start' ? DROUGHT_START : DROUGHT_END, kind === 'drought-start' ? 'thinking' : 'smile');
    this.talk.end();
    this.mode = was;
  }

  /** A target reached: a Field Notebook question, then a research choice (one more card for a clean answer). */
  private async milestone(k: IslandKind, reached: number, of: number): Promise<UpgradeId | null> {
    this.mode = 'busy';
    const info = ISLAND_INFO[k];
    await this.talk.say(
      this.speakers[info.host],
      `Target ${reached} of ${of} reached! The research team sends a question from the Field Notebook. Answer it well and you get an extra research card to pick from.`,
      'proud',
    );
    this.talk.end();
    const station: HomeKind = k === 'archipelago' ? HOME_KINDS[(reached + this.save.runs.archipelago) % HOME_KINDS.length] : k;
    const clean = await new Promise<boolean>((resolve) => this.openPanel(station, 'milestone', resolve));
    const up = await this.research(k, clean);
    this.mode = 'run';
    audio.play(SONG[k]);
    return up;
  }

  private research(k: IslandKind, extra: boolean): Promise<UpgradeId | null> {
    const run = this.save.run;
    const board = run ? { pieces: run.pieces } : { pieces: [] as Array<PieceId | null> };
    const owned = run?.upgrades ?? [];
    const pool = deck(k, this.save.unlocked);
    const fits = (u: UpgradeId) => {
      if (owned.includes(u)) return false;
      if (u === 'volunteers') return board.pieces.includes('vine');
      if (u === 'reed-cover') return pool.includes('reeds');
      if (u === 'hawk-eye') return pool.includes('hawk') || pool.includes('owl');
      return true;
    };
    const options = shuffle(mulberry32(this.save.seed++), UPGRADE_IDS.filter(fits)).slice(0, extra ? 4 : 3);
    this.persist();
    if (!options.length) return Promise.resolve(null);
    audio.play('notebook');
    return new Promise((resolve) => {
      const body = h(
        'div',
        { class: 'panel modal ebt-research', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ebt-research-title' },
        h('h2', { id: 'ebt-research-title', text: 'Research: pick one' }),
        h('p', { text: extra ? 'Great answer! You get four cards to choose from. Each one lasts for the rest of this run.' : 'Pick one card. It lasts for the rest of this run.' }),
        h(
          'div',
          { class: 'ebt-research-cards' },
          ...options.map((u, i) =>
            h(
              'button',
              { class: 'btn ebt-research-card', type: 'button', 'data-upgrade': u, 'aria-keyshortcuts': String(i + 1), onclick: () => pick(u) },
              h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
              h('strong', { text: UPGRADES[u].name }),
              h('span', { class: 'ebt-research-game', text: UPGRADES[u].game }),
              h('span', { class: 'ebt-research-sci', text: `The science: ${UPGRADES[u].science}` }),
            ),
          ),
        ),
      );
      let chosen: UpgradeId | null = null;
      const modal = new Modal(this.host, body, () => resolve(chosen), { closeOnBackdrop: false });
      const keys = (e: KeyboardEvent) => {
        if (stackTop() !== modal) return;
        const n = Number(e.key);
        if (n >= 1 && n <= options.length) {
          e.preventDefault();
          pick(options[n - 1]);
        }
      };
      window.addEventListener('keydown', keys);
      const pick = (u: UpgradeId) => {
        chosen = u;
        window.removeEventListener('keydown', keys);
        audio.itemGet();
        toast(`${UPGRADES[u].name}: ${UPGRADES[u].game}`, 'reward');
        modal.close();
      };
      speak(`Research: pick one. ${options.map((u, i) => `${i + 1}: ${UPGRADES[u].name}. ${UPGRADES[u].game}`).join(' ')}`);
      requestAnimationFrame(() => body.querySelector<HTMLButtonElement>('.ebt-research-card')?.focus());
    });
  }

  private async runOver(run: RunSave, won: boolean, trouble: Trouble | null, health: number, census: Census): Promise<void> {
    const sv = this.save;
    const k = run.kind;
    const info = ISLAND_INFO[k];
    sv.runs[k]++;
    sv.best[k] = Math.max(sv.best[k], health);
    sv.run = null;
    const firstRestore = won && !sv.restored.includes(k);
    if (won && !sv.restored.includes(k)) sv.restored.push(k);
    const unlock = UNLOCK_ORDER.find((u) => !sv.unlocked.includes(u)) ?? null;
    if (unlock) sv.unlocked.push(unlock);
    this.lastEnd = { won, trouble, health, unlocked: unlock };
    this.persist();
    await this.busy(async () => {
      if (won) {
        this.runView?.setNight(true);
        audio.play('night');
        await wait(600);
        await this.talk.say(this.speakers[info.host], firstRestore ? `Every target reached! ${info.done}` : `Every target reached! ${info.name} is alive again, with health ${health}.`, 'proud');
        this.talk.end();
        await this.censusPanel(census, health);
        if (firstRestore && !sv.debriefs.includes(k)) {
          await this.talk.say(this.speakers[info.host], 'Before you go, one question to talk through.', 'smile');
          const res = await this.talk.ask(this.speakers[info.host], info.debrief, () => audio.hint());
          recordAnswer(sv.learner, `${k}-talk`, { correct: res.tries === 1, hintRung: res.tries - 1, misconception: res.misconceptions[0] ?? null }, RULES);
          sv.debriefs.push(k);
          toast(`${info.badge} earned!`, 'reward');
        }
      } else {
        const spec = RUNS[k][run.length];
        const t = spec.targets[run.reached];
        audio.retry();
        await this.talk.say(
          this.speakers.nia,
          [
            `The island reached health ${health}, but the target was ${t?.health ?? '?'}. That is all right: real ecologists try many times.`,
            `Here is what held it back. ${TROUBLE_TEXT[trouble ?? 'few-plants']}`,
          ],
          'thinking',
        );
      }
      if (unlock) await this.talk.say(this.speakers.bramble, `Snuffle! A new tile for your bag: the ${PIECES[unlock].name.toLowerCase()}. ${PIECE_FACT[unlock]}`, 'smile');
      else await this.talk.say(this.speakers.nia, 'You keep your badges, stars and tiles. Ready for another island?', 'smile');
      if (firstRestore && k === 'archipelago') {
        audio.play('finale');
        await this.talk.say(this.speakers.nia, OPEN_DAY, 'proud');
        await this.talk.say(this.speakers.lupe, 'The meadow and the woods are full of life. The plants are where it all starts!', 'smile');
        await this.talk.say(this.speakers.theo, 'And the ponds and the wetland are a whole web again. Thank you, Junior Ranger.', 'smile');
        await this.talk.say(this.speakers.bramble, 'Snuffle snuffle! Best island ever!', 'smile');
      } else if (HOME_KINDS.every((x) => sv.restored.includes(x)) && !sv.finaleOpenSeen) {
        await this.talk.say(this.speakers.nia, FINALE_OPEN, 'proud');
        sv.finaleOpenSeen = true;
      }
    });
    this.persist();
    this.enterStation();
  }

  /** The end-of-run census: a bar chart of the living things, and what it shows about the energy pyramid. */
  private censusPanel(c: Census, health: number): Promise<void> {
    return new Promise((resolve) => {
      const max = Math.max(1, c.plants, c.plantEaters, c.hunters, c.decomposers);
      const bar = (label: string, n: number, color: string) => {
        const fill = h('span', { class: 'ebt-bar-fill' });
        fill.style.width = `${(n / max) * 100}%`;
        fill.style.background = color;
        return h('div', { class: 'ebt-bar' }, h('span', { class: 'ebt-bar-label', text: label }), h('span', { class: 'ebt-bar-track' }, fill), h('strong', { text: String(n) }));
      };
      const pyramid = c.plants >= c.plantEaters && c.plantEaters >= c.hunters;
      const body = h(
        'div',
        { class: 'panel modal ebt-census', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ebt-census-title' },
        h('h2', { id: 'ebt-census-title', text: `Island census: health ${health}` }),
        h('p', { text: 'Ecologists count the living things on an island. Here is yours.' }),
        h(
          'div',
          { class: 'ebt-bars' },
          bar('Plants', c.plants, '#3fae5a'),
          bar('Plant-eaters', c.plantEaters, '#f2c94c'),
          bar('Meat-eaters', c.hunters, '#e0503a'),
          bar('Decomposers', c.decomposers, '#9a62d0'),
        ),
        h('p', {
          class: 'ebt-census-note',
          text: !c.hunters
            ? 'Lots of plants feeding the plant-eaters: a strong start. No meat-eaters lived here this time. Next run, try a hunter next to its prey: a food chain scores a big bonus. There are always fewer hunters than the animals they eat.'
            : pyramid
              ? 'Look: the most plants, fewer plant-eaters, and the fewest meat-eaters. That is the energy pyramid: only some of the energy passes up each step of a food chain, so each step feeds fewer animals.'
              : 'In nature there are usually more plants than plant-eaters, and more plant-eaters than meat-eaters. Each step up a food chain passes on only some of the energy.',
        }),
        h('button', { class: 'btn primary', type: 'button', text: 'Back to the station', onclick: () => modal.close() }),
      );
      const modal = new Modal(this.host, body, () => resolve(), { closeOnBackdrop: false });
      speak(`Island census. Plants: ${c.plants}. Plant-eaters: ${c.plantEaters}. Meat-eaters: ${c.hunters}. Decomposers: ${c.decomposers}.`);
      requestAnimationFrame(() => body.querySelector<HTMLButtonElement>('.btn')?.focus());
    });
  }

  // ------------------------------------------------------------ the Field Notebook (questions)

  private openPanel(island: HomeKind, kind: 'milestone' | 'notebook', done?: (clean: boolean) => void): void {
    if (!bank(island).length) return;
    if (kind === 'notebook') this.mode = 'panel';
    audio.play('notebook');
    const who = this.speakers[ISLAND_INFO[island].host];
    const level = h('span', { class: 'ebt-level' });
    const stars = h('span', { class: 'ebt-stars', role: 'img' });
    const prompt = h('p', { class: 'ebt-prompt' });
    const speakBtn = h('button', { class: 'btn small ebt-speak', type: 'button', 'aria-label': 'Read the question aloud' }, iconImg('speak', '', 22));
    speakBtn.addEventListener('click', () => {
      const q = this.panel?.q;
      speak(q ? `${q.ask} ${q.choices.map((c, i) => `${i + 1}: ${c.label}.`).join(' ')}` : '', { force: true });
    });
    const feedback = h('div', { class: 'ebt-feedback', role: 'status', 'aria-live': 'polite', hidden: true });
    const pic = h('div', { class: 'ebt-pic' });
    const model = h('div', { class: 'ebt-model', hidden: true });
    const choices = h('div', { class: 'ebt-choices' });
    const hintBtn = h(
      'button',
      { class: 'btn', type: 'button', 'aria-keyshortcuts': 'H' },
      iconImg('bulb', '', 22),
      h('span', { text: 'Hint' }),
      h('span', { class: 'kbd', 'aria-hidden': 'true', text: 'H' }),
    ) as HTMLButtonElement;
    const next = h('button', { class: 'btn primary', type: 'button', hidden: true, text: isTouchDevice() ? 'Next' : 'Next (Space)' }) as HTMLButtonElement;
    const face = h('img', { class: 'ebt-host', src: who.portrait('smile'), alt: who.name, width: 64, height: 64 });
    const title = kind === 'milestone' ? `Field Notebook: ${ISLAND_INFO[island].name}` : `Field Notebook: ${ISLAND_INFO[island].name}`;
    const root = h(
      'div',
      { class: `panel modal ebt-panel`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ebt-title' },
      h(
        'header',
        {},
        h('h2', { id: 'ebt-title', text: title }),
        h(
          'div',
          { class: 'ebt-head-right' },
          level,
          stars,
          kind === 'notebook' ? h('button', { class: 'btn small', type: 'button', text: isTouchDevice() ? 'Leave' : 'Leave (Esc)', onclick: () => this.panel?.modal.close() }) : null,
        ),
      ),
      h('div', { class: 'ebt-ask' }, face, prompt, speakBtn),
      h('div', { class: 'ebt-body' }, pic, model),
      choices,
      feedback,
      h('footer', { class: 'ebt-foot' }, hintBtn, next),
    );
    const modal = new Modal(this.host, root, () => this.closePanel(), { closeOnBackdrop: false, escapeCloses: kind === 'notebook' });
    hintBtn.addEventListener('click', () => this.hint());
    next.addEventListener('click', () => this.afterAnswer());
    this.panel = {
      modal,
      island,
      kind,
      q: null as unknown as Question,
      hintRung: 0,
      tries: 0,
      recorded: false,
      answered: false,
      clean: false,
      pic,
      model,
      feedback,
      hintBtn,
      next,
      choices,
      stars,
      level,
      prompt,
      done,
    };
    this.nextQuestion();
  }

  private nextQuestion(): void {
    const pnl = this.panel;
    if (!pnl) return;
    const st = pnl.island;
    const tier = skill(this.save.learner, st).tier as Tier;
    const q = makeQuestion(st, tier, mulberry32(this.save.seed++), this.save.recent[st]);
    this.save.recent[st] = [...this.save.recent[st].filter((x) => x !== q.id), q.id].slice(-40);
    this.persist();
    Object.assign(pnl, { q, hintRung: 0, tries: 0, recorded: false, answered: false, clean: false });
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
        { class: 'ebt-options' },
        ...q.choices.map((c, i) =>
          h(
            'button',
            { class: 'btn ebt-choice', type: 'button', 'data-value': c.value, 'aria-keyshortcuts': String(i + 1), 'aria-label': `${i + 1}: ${c.label}`, onclick: () => this.pick(c) },
            h('span', { class: 'kbd', 'aria-hidden': 'true', text: String(i + 1) }),
            h('span', { class: 'ebt-choice-text', text: c.label }),
          ),
        ),
      ),
    );
    this.renderStars();
    speak(`${q.ask} ${q.choices.map((c, i) => `${i + 1}: ${c.label}.`).join(' ')}`);
    requestAnimationFrame(() => pnl.choices.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus());
  }

  private renderPic(): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.pic.replaceChildren(buildPic(pnl.q.pic, pnl.answered || pnl.hintRung >= 2));
    if (pnl.hintRung >= 2 && !pnl.answered) {
      const m = buildModel(pnl.q);
      if (m) {
        pnl.model.hidden = false;
        pnl.model.replaceChildren(m);
      }
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
    pnl.clean = clean;
    let tierChange = 0;
    if (!pnl.recorded) {
      pnl.recorded = true;
      tierChange = recordAnswer(this.save.learner, pnl.island, { correct: true, hintRung: pnl.hintRung }, RULES).tierChange;
    }
    const st = pnl.island;
    this.save.played[st]++;
    if (clean && this.save.stars[st] < STARS_PER_ISLAND) this.save.stars[st]++;
    this.persist();
    if (clean) audio.itemGet();
    else audio.correct();
    const extra =
      pnl.kind === 'milestone'
        ? clean
          ? ' You earn an extra research card.'
          : ' You still get to pick a research card.'
        : clean
          ? ' You win a star.'
          : ' Stars are for getting it right the first time.';
    this.showFeedback(`${clean ? praise(this.praiseCount++) : 'You got it!'}${extra} ${q.explain}`, 'good');
    pnl.next.hidden = false;
    pnl.next.textContent = pnl.kind === 'milestone' ? (isTouchDevice() ? 'To the research cards' : 'To the research cards (Space)') : isTouchDevice() ? 'Next' : 'Next (Space)';
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
      const o = recordAnswer(this.save.learner, pnl.island, { correct: false, hintRung: pnl.hintRung, misconception: (c.misconception ?? null) as Misconception | null }, RULES);
      this.persist();
      if (o.tierChange < 0) toast('Let’s practise a little more at an easier level.', 'hint');
    }
    audio.retry();
    this.showFeedback(`Not quite. ${c.why ?? ''}`, 'try');
    if (btn) {
      btn.disabled = true;
      btn.classList.add('nope');
      pnl.choices.querySelector<HTMLButtonElement>('.ebt-choice:not([disabled])')?.focus();
    }
    if (pnl.tries >= 2) this.hint(Math.min(3, pnl.tries));
  }

  private showFeedback(text: string, kind: 'good' | 'try' | 'hint'): void {
    const pnl = this.panel;
    if (!pnl) return;
    pnl.feedback.hidden = false;
    pnl.feedback.className = `ebt-feedback ${kind}`;
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
    const n = this.save.stars[pnl.island];
    pnl.stars.replaceChildren(...Array.from({ length: STARS_PER_ISLAND }, (_, i) => iconImg(i < n ? 'star' : 'starEmpty', '', 20)));
    pnl.stars.setAttribute('aria-label', `${n} of ${STARS_PER_ISLAND} stars`);
  }

  private afterAnswer(): void {
    const pnl = this.panel;
    if (!pnl || !pnl.answered) return;
    if (pnl.kind === 'milestone') {
      pnl.modal.close();
      return;
    }
    this.nextQuestion();
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
      const b = pnl.choices.querySelectorAll<HTMLButtonElement>('.ebt-choice')[Number(k) - 1];
      if (b && !b.disabled) {
        e.preventDefault();
        b.click();
      }
    }
  }

  private closePanel(): void {
    stopSpeaking();
    const pnl = this.panel;
    this.panel = null;
    if (!pnl) return;
    if (pnl.kind === 'milestone') {
      pnl.done?.(pnl.answered && pnl.clean);
      return;
    }
    if (this.mode === 'panel') {
      this.mode = 'station';
      audio.play('station');
      this.renderStation();
    }
  }

  private closePanelQuietly(): void {
    if (this.panel?.kind === 'notebook') this.panel.modal.close();
  }

  // ------------------------------------------------------------ toolbar, settings, grown-ups

  private buildHud(): void {
    this.hud = h('div', { class: 'hud ebt-tools', hidden: true });
    this.host.append(this.hud);
    this.toolbar = new Toolbar(this.hud, [
      { id: 'station', label: 'Station', icon: 'arrowLeft', key: 'T', onClick: () => void this.leaveRun() },
      { id: 'sound', label: settings.muted ? 'Sound off' : 'Sound', icon: settings.muted ? 'soundOff' : 'soundOn', key: 'M', onClick: () => this.toggleMute() },
      { id: 'settings', label: 'Settings', icon: 'gear', key: 'Esc', onClick: () => this.openSettingsPanel() },
    ]);
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 't' && this.mode === 'run' && !document.querySelector('.modal-back') && !this.talk.isOpen) void this.leaveRun();
    });
  }

  private async leaveRun(): Promise<void> {
    if (this.mode !== 'run' || !this.runView) return;
    const st = this.runView.state();
    if (st.busy || st.done) return;
    this.runView.paused = true;
    const ok = await choose(this.host, 'Back to the station?', 'Your island is saved. You can carry on from the station any time.', [
      { id: 'yes', label: 'Yes, go back', kind: 'primary' },
      { id: 'no', label: 'No, keep playing' },
    ]);
    if (this.runView) this.runView.paused = false;
    if (ok === 'yes') this.enterStation();
  }

  private toggleMute(): void {
    updateSettings({ muted: !settings.muted });
    if (settings.muted) stopSpeaking();
    toast(settings.muted ? 'Sound off (M to turn it back on)' : 'Sound on');
  }

  /** Pause the run while a menu is open. */
  private pauseFor(modal: Modal): void {
    const rv = this.runView;
    if (!rv) return;
    rv.paused = true;
    const check = () => {
      if (modal.closed) {
        if (this.runView === rv && this.mode === 'run' && !this.talk.isOpen && !document.querySelector('.modal-back')) rv.paused = false;
        return;
      }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }

  private openSettingsPanel(): void {
    if (this.mode === 'title' || this.mode === 'busy' || document.querySelector('.modal-back')) return;
    const m = openSettings(this.host, {
      grownups: () => this.openGrownups(),
      resetSave: async () => {
        const ok = await choose(this.host, 'Start over?', 'This erases your islands, badges and tiles in this browser. Settings are kept.', [
          { id: 'yes', label: 'Yes, erase my progress', kind: 'danger' },
          { id: 'no', label: 'No, keep playing' },
        ]);
        if (ok === 'yes') {
          store.reset();
          window.location.reload();
        }
      },
    });
    this.pauseFor(m);
  }

  private openGrownups(): void {
    const m = openGrownups(this.host, GROWNUPS, () => this.progressReport());
    if (this.mode !== 'title') this.pauseFor(m);
  }

  private progressReport(): HTMLElement {
    const sv = this.save;
    const rows = ISLAND_KINDS.map((k) => {
      const rec = sv.learner[k];
      const mis = topMisconception(rec) ?? topMisconception(sv.learner[`${k}-talk`]);
      const status = !this.islandOpen(k)
        ? 'Not open yet'
        : sv.restored.includes(k)
          ? `Restored (best health ${sv.best[k]}), ${sv.stars[k]} of ${STARS_PER_ISLAND} stars`
          : `${sv.runs[k]} run${sv.runs[k] === 1 ? '' : 's'} so far, ${sv.stars[k]} of ${STARS_PER_ISLAND} stars`;
      return h(
        'tr',
        {},
        h('th', { scope: 'row', text: `${ISLAND_INFO[k].name} (${ISLAND_INFO[k].skill.toLowerCase()})` }),
        h('td', { text: status }),
        h('td', { text: rec ? `${rec.correct} of ${rec.attempts} right first time` : '–' }),
        h('td', { text: rec ? `Level ${rec.tier}` : '–' }),
        h('td', { text: mis ? (MISCONCEPTION_WORDS[mis] ?? '–') : '–' }),
      );
    });
    return h(
      'div',
      {},
      h('p', {
        text: `This summary is kept only in this browser. Islands restored: ${sv.restored.length} of 5 (four islands and the Archipelago). Runs played: ${ISLAND_KINDS.reduce((n, k) => n + sv.runs[k], 0)}. Food web arrows drawn: ${sv.webLinks.length}. Tiles unlocked: ${sv.unlocked.length} of ${UNLOCK_ORDER.length}. Different tiles placed: ${sv.seen.length}.`,
      }),
      h(
        'div',
        { class: 'table-wrap' },
        h(
          'table',
          { class: 'progress-table' },
          h('thead', {}, h('tr', {}, ...['Island', 'Status', 'Answers', 'Level now', 'Most common slip'].map((t) => h('th', { scope: 'col', text: t })))),
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
      talking: this.talk.isOpen,
      restored: [...this.save.restored],
      runs: { ...this.save.runs },
      best: { ...this.save.best },
      stars: { ...this.save.stars },
      unlocked: [...this.save.unlocked],
      seen: this.save.seen.length,
      webLinks: this.save.webLinks.length,
      hasRun: !!this.save.run,
      lastEnd: this.lastEnd,
      research: [...document.querySelectorAll<HTMLElement>('.ebt-research-card')].map((b) => b.dataset.upgrade),
      census: !!document.querySelector('.ebt-census'),
      panel:
        pnl && q
          ? {
              island: pnl.island,
              kind: pnl.kind,
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

const PRAISE = ['Spot on!', 'Brilliant!', 'Exactly right!', 'Yes! Great thinking.', 'You’ve got it!', 'Super ecologist!'];
function praise(n: number): string {
  return PRAISE[n % PRAISE.length];
}
