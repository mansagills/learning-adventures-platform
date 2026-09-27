import * as THREE from 'three';
import { lookFromAppearance, type Dir } from './art/characters';
import { paintGround } from './art/tiles';
import { P } from './art/palette';
import { bus } from './core/events';
import { CHAPTERS } from './content/chapters';
import { CONVERSATIONS, PLACE_LINES } from './content/conversations';
import { ITEMS } from './content/items';
import { NPCS, npcById, type NpcDefinition } from './content/npcs';
import { QuestEngine } from './quests/engine';
import type { Conversation, DialogueEffect } from './quests/types';
import { K, PixelRenderer } from './render/pixelRenderer';
import { audio } from './systems/audio';
import { REAL_SECONDS_PER_GAME_MINUTE, isPresent, lightAt, timeOfDay } from './systems/dayNight';
import { Input } from './systems/input';
import { SaveStore, freshSave, type SaveData } from './systems/save';
import { applySettingsToDocument, isTouchDevice, settings, touchControlsVisible, updateSettings } from './systems/settings';
import { Actor } from './world/actor';
import { findPath } from './world/collision';
import { buildFarmScene, buildHubScene, buildRoomScene, buildSchoolScene, buildWorkshopScene, type WorldScene } from './world/scenes';
import type { SceneId } from './world/map';
import { openCustomize } from './ui/customize';
import { DialogueUI } from './ui/dialogue';
import { choose, h, type Modal } from './ui/dom';
import { Hud } from './ui/hud';
import { openJournal, type JournalTab } from './ui/journal';
import { onSaveFileChosen, openSettings } from './ui/settingsPanel';
import { showTitle } from './ui/title';
import { TouchControls } from './ui/touch';
import { mountDebug } from './ui/debug';
import { openMemory } from './ui/memory';
import { MEMORIES } from './content/memories';
import type { ChapterRuntime, RuntimeContext, RuntimePlace } from './quests/runtime';
import { paintSparkle } from './art/sparkle';
import { pixelTexture } from './world/sceneKit';

const WALK_SPEED = 4.2;
const RUN_SPEED = 6.4;
const PLAYER_RADIUS = 0.28;
/** Characters keep a little personal space so the player never hides them. */
const NPC_SPACE = 0.85;

type Target =
  | { kind: 'npc'; id: string; label: string; x: number; y: number }
  | { kind: 'place'; id: string; label: string; x: number; y: number }
  | { kind: 'sign'; text: string; label: string; x: number; y: number }
  | { kind: 'rplace'; id: string; chapterId: string; label: string; x: number; y: number; radius: number };

/** Onboarding tips, shown one at a time until the player does the thing. */
type TipId = 'move' | 'findCarver' | 'talk' | 'journal' | 'bag' | 'rest';

export class Game {
  readonly host: HTMLElement;
  readonly renderer: PixelRenderer;
  readonly input = new Input();
  readonly store = new SaveStore();
  save: SaveData = freshSave();
  engine!: QuestEngine;
  readonly hub: WorldScene;
  readonly room: WorldScene;
  readonly school: WorldScene;
  readonly farm: WorldScene;
  readonly workshop: WorldScene;
  world: WorldScene;
  player!: Actor;
  private npcActors = new Map<string, Actor>();
  private hud!: Hud;
  private dialogue!: DialogueUI;
  private touch!: TouchControls;
  private uiLayer: HTMLElement;
  private modal: Modal | null = null;
  private running = false;
  private title: HTMLElement | null = null;
  private last = performance.now();
  private clock = 0;
  private path: Array<{ x: number; y: number }> | null = null;
  private pathGoal: Target | null = null;
  private target: Target | null = null;
  private guideUntil = 0;
  private autosaveTimer = 0;
  private stepSoundCooldown = 0;
  private transitioning = false;
  private movedDistance = 0;
  private hubGroundCanvas: HTMLCanvasElement;
  readonly debug: boolean;

  constructor(host: HTMLElement) {
    this.host = host;
    applySettingsToDocument();
    this.renderer = new PixelRenderer(host);
    this.hub = buildHubScene();
    this.room = buildRoomScene();
    this.school = buildSchoolScene();
    this.farm = buildFarmScene();
    this.workshop = buildWorkshopScene();
    this.world = this.hub;
    this.hubGroundCanvas = paintGround(this.hub.map);
    this.uiLayer = h('div', { class: 'ui-layer' });
    host.append(this.uiLayer);
    this.debug = new URLSearchParams(location.search).has('debug') || import.meta.env.DEV;

    window.addEventListener('resize', () => this.renderer.resize());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.running) this.persist('quiet');
    });
    window.addEventListener('pagehide', () => this.running && this.persist('quiet'));

    this.renderer.canvas.addEventListener('pointerdown', (e) => this.onPointer(e));
    this.input.onAction((a) => this.onAction(a));
    onSaveFileChosen((text) => this.importSave(text));
    this.wireEvents();
    this.exposeTestHooks();
  }

  // ================================================================ boot

  start(): void {
    this.renderer.setBounds(this.hub.map.w, this.hub.map.h);
    this.renderer.lookAt(20, 14);
    requestAnimationFrame((t) => this.frame(t));
    this.showTitle();
  }

  private showTitle(): void {
    this.title = showTitle(this.uiLayer, {
      hasSave: this.store.hasSave(),
      continueGame: () => {
        audio.unlock();
        this.beginFromStore();
      },
      newGame: async () => {
        audio.unlock();
        if (this.store.hasSave()) {
          const ok = await choose(this.uiLayer, 'Start a new game?', 'This will replace the progress saved in this browser. You can download a save file first from Settings.', [
            { id: 'yes', label: 'Yes, start over', kind: 'danger' },
            { id: 'no', label: 'No, go back' },
          ]);
          if (ok !== 'yes') return;
          this.store.reset();
        }
        this.beginNew();
      },
      settings: () => {
        audio.unlock();
        openSettings(this.uiLayer, this.settingsActions(false));
      },
    });
    audio.setMood('title');
  }

  private closeTitle(): void {
    this.title?.remove();
    this.title = null;
  }

  private beginFromStore(): void {
    const r = this.store.load();
    this.closeTitle();
    this.enterGame(r.data);
    if (r.status === 'recovered') bus.emit('save:status', { status: 'recovered', message: 'Save restored from backup' });
    if (r.status === 'recovered') bus.emit('toast', { text: 'Your last save was damaged, so the backup copy was restored.', kind: 'info' });
    if (r.status === 'unreadable')
      bus.emit('toast', { text: "We couldn't read the old save. It was set aside safely, and a new game has started.", kind: 'info' });
  }

  private beginNew(): void {
    this.closeTitle();
    const data = freshSave();
    this.enterGame(data);
    this.openCustomizer(true);
  }

  private enterGame(data: SaveData): void {
    this.save = data;
    this.engine = new QuestEngine(CHAPTERS, ITEMS, this.save.progress, bus);
    const look = lookFromAppearance(this.save.appearance);
    if (!this.player) {
      this.player = new Actor(this.hub.lighting, look, data.world.x, data.world.y, data.world.facing);
      this.player.onStep(() => {
        if (this.stepSoundCooldown <= 0) {
          audio.step();
          this.stepSoundCooldown = 0.25;
        }
      });
    } else this.player.setLook(look);
    this.spawnNpcs();
    this.setScene(data.world.scene, { x: data.world.x, y: data.world.y }, data.world.facing);
    this.hud ??= new Hud(this.uiLayer, {
      journal: () => this.openJournal('quest'),
      bag: () => this.openJournal('bag'),
      menu: () => this.openSettingsPanel(),
      toggleMute: () => this.toggleMute(),
      interact: () => this.interact(),
    });
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const game = this;
    this.dialogue ??= new DialogueUI(this.uiLayer, {
      apply: (e) => (e.type === 'showMemory' ? this.showMemory(e.memoryId) : this.applyEffect(e)),
      resolve: (text) => this.resolveTokens(text),
      // A getter, because loading a save replaces the learner object.
      get learner() {
        return game.save.learner;
      },
      onLearningChanged: () => this.persist('quiet'),
    });
    this.touch ??= new TouchControls(this.uiLayer, this.input, () => this.interact());
    if (this.debug) mountDebug(this.uiLayer, this);
    this.hud.setVisible(true);
    this.ensureRuntimes();
    this.refreshHud();
    this.running = true;
    this.input.worldActive = true;
    this.updateMood();
  }

  // ================================================================ scenes

  private spawnNpcs(): void {
    if (this.npcActors.size) return;
    for (const n of NPCS) {
      const a = new Actor(this.hub.lighting, n.look, n.pos.x, n.pos.y, n.facing);
      a.group.name = `npc:${n.id}`;
      this.npcActors.set(n.id, a);
      this.hub.scene.add(a.group);
    }
    this.refreshNpcPresence(true);
  }

  private lanternState = new Map<string, boolean>();

  private refreshNpcPresence(force = false): void {
    const minutes = this.save.time.minutes;
    const night = lightAt(minutes).night > 0.5;
    this.hub.grid.clearDynamic();
    for (const n of NPCS) {
      const a = this.npcActors.get(n.id)!;
      const present = isPresent(n.presence, minutes);
      a.setVisible(present);
      if (present) {
        this.hub.grid.setDynamic(n.id, [[Math.floor(n.pos.x), Math.floor(n.pos.y)]]);
        this.hub.grid.setBlocker(n.id, n.pos.x, n.pos.y, NPC_SPACE);
      }
      const lantern = !!n.lanternAtNight && night;
      if (force || this.lanternState.get(n.id) !== lantern) {
        this.lanternState.set(n.id, lantern);
        a.setLook({ ...n.look, extras: { ...n.look.extras, lantern } });
      }
    }
  }

  private sceneById(id: SceneId): WorldScene {
    return { hub: this.hub, room: this.room, school: this.school, farm: this.farm, workshop: this.workshop }[id];
  }

  private setScene(id: SceneId, pos?: { x: number; y: number }, facing: Dir = 'down'): void {
    this.world = this.sceneById(id);
    const p = pos ?? this.world.map.spawn;
    // Never leave the player inside a wall (e.g. after a map update).
    const free = this.world.grid.isFree(p.x, p.y, PLAYER_RADIUS);
    this.player.x = free ? p.x : this.world.map.spawn.x;
    this.player.y = free ? p.y : this.world.map.spawn.y;
    this.player.facing = facing;
    this.world.scene.add(this.player.group);
    // Re-register the player's material with this scene's lighting.
    this.world.lighting.add(this.player.material);
    this.renderer.setBounds(this.world.map.w, this.world.map.h);
    this.renderer.lookAt(this.player.x, this.player.y);
    this.room.setPotPlanted?.(this.engine?.progress('practice').stage === 'complete');
    this.path = null;
    this.pathGoal = null;
    bus.emit('scene:changed', { scene: id });
  }

  private async transition(to: SceneId): Promise<void> {
    if (this.transitioning) return;
    this.transitioning = true;
    audio.door();
    this.input.clear();
    const fadeMs = settings.reducedMotion ? 0 : 280;
    this.hud.fade.classList.add('on');
    await wait(fadeMs);
    const from = this.world;
    if (to === 'hub') this.setScene('hub', from.map.exit?.at ?? this.hub.map.spawn, 'down');
    else this.setScene(to, this.sceneById(to).map.entry, 'up');
    this.persist('quiet');
    this.hud.fade.classList.remove('on');
    await wait(fadeMs);
    this.transitioning = false;
    if (to === 'room') this.markTip('rest');
  }

  // ================================================================ loop

  private frame(now: number): void {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.clock += dt;
    try {
      this.update(dt);
    } catch (err) {
      console.error('[game] update failed', err);
    }
    this.renderer.render(this.world.scene);
    requestAnimationFrame((t) => this.frame(t));
  }

  private get blocked(): boolean {
    return !this.running || this.dialogue?.isOpen || !!this.modal || this.transitioning || !!this.title;
  }

  private update(dt: number): void {
    const rm = settings.reducedMotion;
    if (!this.running) {
      // Title screen: a slow, gentle pan across the town.
      const t = rm ? 0 : this.clock * 0.25;
      this.renderer.lookAt(20 + Math.sin(t * 0.3) * 8, 14 + Math.cos(t * 0.2) * 3);
      this.applyLight(9 * 60);
      this.hub.update(dt, this.clock, 0, rm);
      return;
    }

    // Clock
    if (!this.save.time.paused && !this.blocked) {
      this.save.time.minutes += dt / REAL_SECONDS_PER_GAME_MINUTE;
      if (this.save.time.minutes >= 1440) {
        this.save.time.minutes -= 1440;
        this.save.time.day += 1;
      }
    }
    const light = this.applyLight(this.save.time.minutes);
    this.world.update(dt, this.clock, light.night, rm);
    if (Math.floor(this.clock * 2) !== Math.floor((this.clock - dt) * 2)) {
      this.refreshNpcPresence();
      this.updateMood();
    }

    this.stepSoundCooldown -= dt;
    this.movePlayer(dt);
    this.player.update(dt, rm);
    this.npcActors.forEach((a, id) => {
      if (this.world !== this.hub) return;
      const n = npcById(id)!;
      const d = Math.hypot(a.x - this.player.x, a.y - this.player.y);
      a.facing = d < 2.6 ? faceToward(a.x, a.y, this.player.x, this.player.y) : n.facing;
      a.setMarker(this.engine.markerFor(id));
      a.update(dt, rm);
    });

    this.renderer.lookAt(...this.cameraFocus(), rm ? 0 : 0.18);
    this.findTarget();
    this.updateSparkles();
    this.updatePromptAndArrow();
    this.updateTips();

    this.autosaveTimer += dt;
    if (this.autosaveTimer > 30 && !this.blocked) this.persist('quiet');
  }

  private talkingTo: string | null = null;

  /**
   * Where the camera looks. While talking, it frames the player and the
   * speaker in the space above the dialogue box so both stay visible.
   */
  private cameraFocus(): [number, number] {
    const p = this.player;
    const npc = this.talkingTo ? npcById(this.talkingTo) : null;
    const box = this.uiLayer.querySelector('.dialogue') as HTMLElement | null;
    if (!npc || !box || this.world !== this.hub) return [p.x, p.y];
    const dpr = window.devicePixelRatio || 1;
    const pxPerTile = (16 * this.renderer.scale) / dpr;
    const fx = (p.x + npc.pos.x) / 2;
    const fy = (p.y + npc.pos.y) / 2 - 0.6;
    return [fx, fy + box.offsetHeight / 2 / pxPerTile];
  }

  private applyLight(minutes: number): { night: number } {
    const l = lightAt(minutes);
    if (this.world.interior) {
      // Indoors a warm lamp keeps things cozy after dark.
      const warm: [number, number, number] = [1, 0.9, 0.78];
      const t = l.night * 0.7;
      const tint = l.tint.map((c, i) => c * (1 - t) + warm[i] * t) as [number, number, number];
      this.world.lighting.set(tint, l.night);
    } else this.world.lighting.set(l.tint, l.night);
    if (this.hud && this.running) {
      this.hud.setClock(minutes, this.world.interior ? 0 : l.night, this.save.time.paused);
      this.hud.vignette.style.opacity = String(this.world.interior ? 0 : l.night * 0.85);
    }
    return l;
  }

  private updateMood(): void {
    const night = lightAt(this.save.time.minutes).night > 0.5;
    audio.setMood(night ? 'night' : 'day');
    audio.setNightAmbience(night && this.world === this.hub);
  }

  // ================================================================ movement

  private movePlayer(dt: number): void {
    const p = this.player;
    let dir = this.blocked ? { x: 0, y: 0 } : this.input.direction();
    if (dir.x || dir.y) {
      this.path = null;
      this.pathGoal = null;
    } else if (this.path && !this.blocked) {
      // Close enough to talk? Stop and talk (NPCs keep a little space).
      const goal = this.pathGoal;
      if (goal && goal.kind === 'npc' && Math.hypot(goal.x - p.x, goal.y - p.y) < 1.5) {
        this.path = null;
        this.pathGoal = null;
        p.moving = false;
        p.facing = faceToward(p.x, p.y, goal.x, goal.y);
        this.findTarget();
        if (this.target && sameTarget(this.target, goal)) this.interact();
        return;
      }
      const wp = this.path[0];
      const dx = wp.x - p.x;
      const dy = wp.y - p.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.12) {
        this.path.shift();
        if (!this.path.length) {
          this.path = null;
          const goal = this.pathGoal;
          this.pathGoal = null;
          if (goal) {
            p.facing = faceToward(p.x, p.y, goal.x, goal.y);
            this.findTarget();
            if (this.target && sameTarget(this.target, goal)) this.interact();
          }
        }
      } else dir = { x: dx / d, y: dy / d };
    }
    const speed = this.input.run ? RUN_SPEED : WALK_SPEED;
    if (dir.x || dir.y) {
      const r = this.world.grid.move(p.x, p.y, dir.x * speed * dt, dir.y * speed * dt, PLAYER_RADIUS);
      const moved = Math.hypot(r.x - p.x, r.y - p.y);
      this.movedDistance += moved;
      p.x = r.x;
      p.y = r.y;
      p.moving = moved > 0.0005;
      p.facing = Math.abs(dir.x) > Math.abs(dir.y) ? (dir.x > 0 ? 'right' : 'left') : dir.y > 0 ? 'down' : 'up';
      if (!p.moving && this.path) this.path = null; // stuck: give up on the click-path
    } else p.moving = false;

    // Walking out through an interior's doorway.
    const ex = this.world.map.exit;
    if (ex && p.y > ex.y && p.x >= ex.x0 && p.x <= ex.x1 && !this.transitioning) void this.transition(ex.to);
  }

  private onPointer(e: PointerEvent): void {
    if (this.blocked) return;
    audio.unlock();
    const rect = this.host.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    // Clicked a character? (use their on-screen body box)
    for (const [id, a] of this.npcActors) {
      if (this.world !== this.hub || !a.group.visible) continue;
      const feet = this.renderer.project(new THREE.Vector3(a.group.position.x, 0, a.group.position.z));
      const head = this.renderer.project(a.headPoint());
      const half = (this.renderer.scale * 10) / (window.devicePixelRatio || 1);
      if (cx > feet.x - half && cx < feet.x + half && cy < feet.y + 4 && cy > head.y - 6) {
        const n = npcById(id)!;
        this.walkTo({ kind: 'npc', id, label: `Talk to ${shortName(n)}`, x: n.pos.x, y: n.pos.y });
        return;
      }
    }
    const tile = this.renderer.screenToTile(cx, cy);
    if (!tile) return;
    // Clicked near a place or sign? Walk there and use it.
    const near = this.targetsInScene().find((t) => t.kind !== 'npc' && Math.hypot(t.x - tile.x, t.y - tile.y) < 0.9);
    if (near) return this.walkTo(near);
    this.walkTo(null, tile);
  }

  walkTo(goal: Target | null, tile?: { x: number; y: number }): void {
    const dest = goal ? { x: goal.x, y: goal.y } : tile!;
    const path = findPath(this.world.grid, this.player, dest);
    if (!path) return;
    this.path = path.length ? path : null;
    this.pathGoal = goal;
    if (!path.length && goal) {
      this.findTarget();
      if (this.target && sameTarget(this.target, goal)) this.interact();
    }
  }

  // ================================================================ interaction

  private targetsInScene(): Target[] {
    const out: Target[] = [];
    if (this.world === this.hub) {
      for (const n of NPCS) {
        if (!isPresent(n.presence, this.save.time.minutes)) continue;
        out.push({ kind: 'npc', id: n.id, label: `Talk to ${shortName(n)}`, x: n.pos.x, y: n.pos.y });
      }
      for (const p of this.hub.map.props)
        if (p.kind === 'sign' && p.text) out.push({ kind: 'sign', text: p.text, label: 'Read the sign', x: p.x + 0.5, y: p.y + 0.5 });
    }
    for (const pl of this.world.map.places) out.push({ kind: 'place', id: pl.id, label: pl.label, x: pl.x, y: pl.y });
    for (const [chapterId, place] of this.runtimePlaces())
      if ((place.scene ?? 'hub') === this.world.id)
        out.push({ kind: 'rplace', id: place.id, chapterId, label: place.label, x: place.x, y: place.y, radius: place.radius });
    return out;
  }

  private findTarget(): void {
    if (this.blocked) return;
    const p = this.player;
    let best: Target | null = null;
    let bestD = Infinity;
    for (const t of this.targetsInScene()) {
      const d = Math.hypot(t.x - p.x, t.y - p.y);
      const reach =
        t.kind === 'npc'
          ? 1.7
          : t.kind === 'sign'
            ? 1.35
            : t.kind === 'rplace'
              ? t.radius
              : (this.world.map.places.find((q) => q.id === t.id)?.radius ?? 1);
      // Prefer things in front of the player.
      const ahead = facingBonus(p.facing, t.x - p.x, t.y - p.y);
      const score = d - ahead * 0.35;
      if (d <= reach && score < bestD) {
        best = t;
        bestD = score;
      }
    }
    this.target = best;
  }

  interact(): void {
    if (this.blocked) return;
    audio.unlock();
    const t = this.target;
    if (!t) return;
    this.path = null;
    if (t.kind === 'npc') void this.talkTo(t.id);
    else if (t.kind === 'sign') void this.say(t.text);
    else if (t.kind === 'rplace') void this.useRuntimePlace(t.chapterId, t.id);
    else void this.usePlace(t.id);
  }

  // ================================================================ chapter runtimes

  private runtimes = new Map<string, ChapterRuntime>();
  private loadingRuntimes = new Set<string>();

  /** Lazily load the code for every chapter the player has reached. */
  private ensureRuntimes(): void {
    for (const c of this.engine.allChapters()) {
      if (!c.loadRuntime || this.runtimes.has(c.id) || this.loadingRuntimes.has(c.id)) continue;
      if (this.engine.progress(c.id).stage === 'locked') continue;
      this.loadingRuntimes.add(c.id);
      c.loadRuntime()
        .then((m) => {
          this.runtimes.set(c.id, m.default);
          this.refreshHud();
        })
        .catch((err) => {
          console.error(`[game] could not load chapter ${c.id}`, err);
          bus.emit('toast', { text: 'Part of this chapter did not load. Please reload the page.', kind: 'info' });
        })
        .finally(() => this.loadingRuntimes.delete(c.id));
    }
  }

  get runtimesReady(): boolean {
    return this.loadingRuntimes.size === 0;
  }

  runtimeContext(chapterId: string): RuntimeContext {
    const data = (this.save.chapterData[chapterId] ??= {});
    return {
      host: this.uiLayer,
      engine: this.engine,
      save: this.save,
      data,
      learner: this.save.learner,
      apply: (e) => void this.applyEffect(e),
      persist: () => this.persist('quiet'),
      toast: (text, kind) => bus.emit('toast', { text, kind }),
      say: async (lines) => {
        const nodes: Conversation['nodes'] = {};
        lines.forEach((l, i) => (nodes[`n${i}`] = { id: `n${i}`, speaker: l.speaker, expression: l.expression, text: l.text, next: i + 1 < lines.length ? `n${i + 1}` : null }));
        await this.dialogue.run({ id: 'runtime', title: '', start: 'n0', nodes }, { replay: true });
      },
      grantBonus: (key, seeds, xp) => {
        const store = (this.save.chapterData.__bonus ??= {});
        if (store[key]) return false;
        store[key] = true;
        this.save.progress.seeds += seeds;
        this.save.progress.xp += xp;
        audio.itemGet();
        this.refreshHud();
        return true;
      },
      sound: (kind) => {
        if (kind === 'correct') audio.correct();
        else if (kind === 'retry') audio.retry();
        else if (kind === 'item') audio.itemGet();
        else if (kind === 'open') audio.open();
        else if (kind === 'close') audio.close();
        else audio.questComplete();
      },
    };
  }

  private *runtimePlaces(): Generator<[string, RuntimePlace]> {
    for (const [chapterId, rt] of this.runtimes) for (const p of rt.places(this.runtimeContext(chapterId))) yield [chapterId, p];
  }

  private async useRuntimePlace(chapterId: string, placeId: string): Promise<void> {
    const rt = this.runtimes.get(chapterId);
    if (!rt) return;
    await this.withModalGuard(() => rt.usePlace(placeId, this.runtimeContext(chapterId)));
    this.persist();
    this.refreshHud();
  }

  /** Fill {tokens} in dialogue from the chapter runtimes. */
  private resolveTokens(text: string): string {
    if (!text.includes('{')) return text;
    const tokens: Record<string, string> = {};
    for (const [chapterId, rt] of this.runtimes) Object.assign(tokens, rt.tokens(this.runtimeContext(chapterId)));
    return text.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
  }

  private async showMemory(id: string): Promise<void> {
    if (!this.save.memories.includes(id)) this.save.memories.push(id);
    await openMemory(this.uiLayer, id);
    this.persist('quiet');
  }

  /** The HUD's "Next" line and where the arrow should point. */
  private objective(): { text: string; npc?: string; point?: { x: number; y: number; label: string; scene: SceneId } } {
    const next = this.engine.nextAction();
    if (next.targetPlaceId) {
      const cur = this.engine.currentChapter();
      const rt = cur ? this.runtimes.get(cur.id) : undefined;
      const o = rt?.objective?.(this.runtimeContext(cur!.id));
      if (o) return { text: o.text, point: { x: o.x, y: o.y, label: o.label ?? 'Garden', scene: o.scene ?? 'hub' } };
    }
    return { text: next.text, npc: next.targetNpcId };
  }

  // Sparkles over chapter hotspots (clear for tasks, faint for hidden bonuses).
  private sparkles = new Map<string, THREE.Mesh>();
  private sparkleTex: THREE.CanvasTexture[] = [];
  private sparkleWorld: WorldScene | null = null;

  private updateSparkles(): void {
    if (!this.sparkleTex.length) this.sparkleTex = [0, 1].map((f) => pixelTexture(paintSparkle(f).toCanvas()));
    if (this.sparkleWorld !== this.world) {
      // Moved to another scene: take the old sparkles down.
      this.sparkles.forEach((m) => this.sparkleWorld?.scene.remove(m));
      this.sparkles.clear();
      this.sparkleWorld = this.world;
    }
    const seen = new Set<string>();
    for (const [, p] of this.runtimePlaces()) {
        if (!p.marker || (p.scene ?? 'hub') !== this.world.id) continue;
        const near = Math.hypot(p.x - this.player.x, p.y - this.player.y) < 3.2;
        if (p.marker === 'faint' && !near) continue;
        seen.add(p.id);
        let m = this.sparkles.get(p.id);
        if (!m) {
          const mat = new THREE.MeshBasicMaterial({ map: this.sparkleTex[0], transparent: true, depthWrite: false });
          m = new THREE.Mesh(new THREE.PlaneGeometry(11 / 16, 11 / 16), mat);
          m.rotation.x = -Math.PI / 4;
          m.renderOrder = 15;
          this.world.scene.add(m);
          this.sparkles.set(p.id, m);
        }
        const mat = m.material as THREE.MeshBasicMaterial;
        const frame = settings.reducedMotion ? 0 : Math.floor(this.clock * 2.5 + p.x) % 2;
        if (mat.map !== this.sparkleTex[frame]) {
          mat.map = this.sparkleTex[frame];
          mat.needsUpdate = true;
        }
        mat.opacity = p.marker === 'faint' ? 0.55 : 1;
        const bob = settings.reducedMotion ? 0 : Math.sin(this.clock * 3 + p.x) * 0.06;
        m.position.set(p.x, (0.9 + bob) * K, p.y * K + 0.05);
      }
    for (const [id, m] of this.sparkles)
      if (!seen.has(id)) {
        this.world.scene.remove(m);
        this.sparkles.delete(id);
      }
  }

  private async talkTo(npcId: string): Promise<void> {
    const npc = npcById(npcId);
    if (!npc) return;
    this.player.facing = faceToward(this.player.x, this.player.y, npc.pos.x, npc.pos.y);
    const convId = this.engine.conversationFor(npcId) ?? this.ambientFor(npc);
    const conv = CONVERSATIONS[convId];
    if (!conv) return;
    this.markTip('talk');
    this.markTip('findCarver');
    this.talkingTo = npcId;
    try {
      await this.runConversation(conv, npcId);
    } finally {
      this.talkingTo = null;
    }
  }

  private ambientFor(npc: NpcDefinition): string {
    const tod = timeOfDay(this.save.time.minutes);
    return npc.ambient[tod] ?? npc.ambient.default;
  }

  private async runConversation(conv: Conversation, npcId: string, replay = false): Promise<void> {
    this.input.clear();
    this.input.worldActive = false;
    this.hud.setPrompt(null);
    bus.emit('dialogue:started', { conversationId: conv.id });
    try {
      await this.dialogue.run(conv, { replay });
    } finally {
      this.input.worldActive = true;
      bus.emit('dialogue:ended', { conversationId: conv.id });
    }
    if (!replay) {
      this.save.log.push({ conversationId: conv.id, npcId, at: Date.now() });
      if (this.save.log.length > 200) this.save.log.shift();
      this.persist();
    }
    this.refreshHud();
  }

  /** A one-off line from the narrator (signs, doors, furniture). */
  private async say(text: string): Promise<void> {
    const conv: Conversation = { id: 'narrator', title: '', start: 'n', nodes: { n: { id: 'n', speaker: 'narrator', text, next: null } } };
    this.input.clear();
    this.input.worldActive = false;
    try {
      await this.dialogue.run(conv, { replay: true });
    } finally {
      this.input.worldActive = true;
    }
  }

  private async usePlace(id: string): Promise<void> {
    switch (id) {
      case 'cottage_door':
        return this.transition('room');
      case 'room_door':
      case 'school_exit':
      case 'farm_exit':
      case 'workshop_exit':
        return this.transition('hub');
      case 'workshop_door': {
        const st = this.engine.progress('ch4').stage;
        if (st === 'active' || st === 'complete') return this.transition('workshop');
        if (st === 'available') return this.say('The workshop is locked. Carver has an idea to share with you first.');
        return this.say(PLACE_LINES.workshop_door);
      }
      case 'farm_door': {
        const st = this.engine.progress('ch3').stage;
        if (st === 'active' || st === 'complete') return this.transition('farm');
        if (st === 'available') return this.say('The farm gate is latched. Carver has a question about this farm for you first.');
        return this.say(PLACE_LINES.farm_door);
      }
      case 'school_door': {
        const st = this.engine.progress('ch2').stage;
        if (st === 'active' || st === 'complete') return this.transition('school');
        if (st === 'available') return this.say('The schoolhouse is closed. Carver has something to tell you about school first.');
        return this.say(PLACE_LINES.school_door);
      }
      case 'bed':
        return this.rest();
      case 'wardrobe':
        return this.openCustomizer(false);
      case 'windowsill':
        return this.say(this.engine.progress('practice').stage === 'complete' ? PLACE_LINES.windowsill_planted : PLACE_LINES.windowsill_empty);
      default:
        if (PLACE_LINES[id]) return this.say(PLACE_LINES[id]);
    }
  }

  private async rest(): Promise<void> {
    const pick = await this.withModalGuard(() =>
      choose(this.uiLayer, 'Rest in bed', 'Resting moves time forward. Lessons never need a certain time of day.', [
        { id: 'morning', label: 'Sleep until morning' },
        { id: 'evening', label: 'Nap until evening' },
        { id: 'night', label: 'Rest until nighttime' },
        { id: 'cancel', label: 'Not now' },
      ]),
    );
    if (pick !== 'morning' && pick !== 'evening' && pick !== 'night') return;
    this.transitioning = true;
    this.hud.fade.classList.add('on');
    audio.rest();
    await wait(settings.reducedMotion ? 150 : 900);
    const t = this.save.time;
    const targetMin = { morning: 7 * 60, evening: 18 * 60, night: 21 * 60 }[pick];
    if (t.minutes >= targetMin) t.day += 1;
    t.minutes = targetMin;
    this.refreshNpcPresence();
    this.updateMood();
    this.persist();
    this.hud.fade.classList.remove('on');
    this.transitioning = false;
    const msg = {
      morning: 'You feel rested. Good morning!',
      evening: 'A cozy nap. The evening lamps are coming on.',
      night: 'The stars are out, and the lamps are glowing.',
    }[pick];
    bus.emit('toast', { text: msg, kind: 'info' });
  }

  // ================================================================ effects

  private applyEffect(e: DialogueEffect): void {
    this.engine.apply(e);
    if (e.type === 'acceptQuest') {
      audio.questAccept();
      const c = this.engine.getChapter(e.chapterId);
      bus.emit('toast', { text: `New quest from Carver: ${c?.title ?? ''}`, kind: 'reward' });
      this.markTipPending('journal');
    }
    if (e.type === 'useItem') bus.emit('toast', { text: `${ITEMS[e.itemId]?.name ?? 'Item'}: ${e.usedIn}`, kind: 'item' });
    this.refreshHud();
    this.persist();
  }

  private wireEvents(): void {
    bus.on('item:granted', ({ itemId, from }) => {
      audio.itemGet();
      const who = npcById(from)?.name ?? from;
      bus.emit('toast', { text: `New item: ${ITEMS[itemId]?.name} (from ${who})`, kind: 'item' });
      this.markTipPending('bag');
    });
    bus.on('chapter:completed', ({ chapterId, xp, seeds }) => {
      audio.questComplete();
      const c = this.engine.getChapter(chapterId);
      bus.emit('toast', { text: `Quest complete: ${c?.title}! +${xp} XP, +${seeds} Seeds`, kind: 'reward' });
      if (c?.rewards.unlock) bus.emit('toast', { text: `Unlocked: ${c.rewards.unlock}`, kind: 'reward' });
      if (chapterId === 'practice') {
        this.room.setPotPlanted?.(true);
        this.markTipPending('rest');
      }
    });
    bus.on('quest:changed', () => {
      this.ensureRuntimes();
      this.refreshHud();
    });
    bus.on('settings:changed', () => this.touch?.setVisible(touchControlsVisible() && this.running));
  }

  private refreshHud(): void {
    if (!this.hud || !this.engine) return;
    this.hud.setObjective(this.objective().text);
    this.hud.setStats(this.save.progress.xp, this.save.progress.seeds);
    this.touch?.setVisible(touchControlsVisible());
    this.workshop.setDecor?.(this.save.cosmetics);
  }

  private updatePromptAndArrow(): void {
    // The touch pad steps aside while talking or in a menu.
    this.touch.setVisible(touchControlsVisible() && !this.blocked);
    if (this.blocked) {
      this.hud.setPrompt(null);
      this.hud.setArrow(null);
      this.touch.setActLabel(null);
      return;
    }
    const t = this.target;
    if (t) {
      const actor = t.kind === 'npc' ? this.npcActors.get(t.id) : null;
      const pt = actor ? actor.headPoint().add(new THREE.Vector3(0, 0.35, 0)) : new THREE.Vector3(t.x, 1.4 * K, t.y * K);
      const s = this.renderer.project(pt);
      this.hud.setPrompt(t.label, s.x, s.y);
      this.touch.setActLabel(t.kind === 'npc' ? 'Talk' : t.kind === 'sign' ? 'Read' : 'Use');
    } else {
      this.hud.setPrompt(null);
      this.touch.setActLabel(null);
    }

    // Off-screen arrow to the next target (always Carver when asked to find him).
    const obj = this.objective();
    let targetNpc = obj.npc;
    if (this.clock < this.guideUntil) targetNpc = 'carver';
    const from = this.renderer.project(this.player.headPoint());
    const ex = this.world.map.exit;
    const pointHere = obj.point && obj.point.scene === this.world.id;
    if (ex && (targetNpc || (obj.point && !pointHere))) {
      // Inside, with the next task outside: point at the door.
      const door = this.renderer.project(new THREE.Vector3((ex.x0 + ex.x1) / 2, 0, (ex.y + 0.5) * K));
      this.hud.setArrow(door.visible ? null : 'Door', from.x, from.y, door.x, door.y);
      return;
    }
    if (obj.point && !pointHere && this.world === this.hub) {
      // The task is inside a building: point at its door.
      const doorPlace = this.hub.map.places.find((q) => q.id === `${obj.point!.scene}_door`);
      if (doorPlace) obj.point = { x: doorPlace.x, y: doorPlace.y, label: obj.point.label, scene: 'hub' };
    }
    const a = targetNpc ? this.npcActors.get(targetNpc) : null;
    if (a && this.world === this.hub) {
      const s = this.renderer.project(a.headPoint());
      const { w, h: hh } = this.renderer.hostSize;
      const onScreen = s.x > 40 && s.x < w - 40 && s.y > 60 && s.y < hh - 60;
      this.hud.setArrow(onScreen ? null : shortName(npcById(targetNpc!)!), from.x, from.y, s.x, s.y);
    } else if (obj.point && obj.point.scene === this.world.id) {
      const s = this.renderer.project(new THREE.Vector3(obj.point.x, 0.8 * K, obj.point.y * K));
      const { w, h: hh } = this.renderer.hostSize;
      const onScreen = s.x > 40 && s.x < w - 40 && s.y > 60 && s.y < hh - 60;
      this.hud.setArrow(onScreen ? null : obj.point.label, from.x, from.y, s.x, s.y);
    } else this.hud.setArrow(null);
  }

  // ================================================================ tips

  private markTipPending(id: TipId): void {
    if (!this.save.tips.includes(`pending:${id}`) && !this.save.tips.includes(id)) this.save.tips.push(`pending:${id}`);
  }

  markTip(id: TipId): void {
    this.save.tips = this.save.tips.filter((t) => t !== `pending:${id}`);
    if (!this.save.tips.includes(id)) this.save.tips.push(id);
  }

  private updateTips(): void {
    if (this.blocked) {
      this.hud.showTip(null);
      return;
    }
    const seen = (id: TipId) => this.save.tips.includes(id);
    const pending = (id: TipId) => this.save.tips.includes(`pending:${id}`);
    const touch = isTouchDevice();
    if (!seen('move')) {
      if (this.movedDistance > 2) this.markTip('move');
      else
        return this.hud.showTip(
          touch ? 'Use the arrow pad to walk, or tap the ground where you want to go.' : 'Walk with W A S D or the arrow keys. You can also click the ground.',
        );
    }
    const stage = this.engine.progress('practice').stage;
    if (stage === 'available' && !seen('findCarver') && this.world === this.hub) {
      if (this.target?.kind === 'npc' && this.target.id === 'carver')
        return this.hud.showTip(touch ? 'Tap Talk to speak with Carver.' : 'Press E (or click the prompt) to talk to Carver.');
      return this.hud.showTip('Follow the arrow to George Washington Carver, beside his greenhouse.');
    }
    if (pending('journal')) return this.hud.showTip(touch ? 'Tap Journal to see Carver\'s quest any time.' : 'Your journal (J) keeps track of Carver\'s quest.');
    if (pending('bag')) return this.hud.showTip(touch ? 'New item! Tap Bag to look at it closely.' : 'New item! Press I (or click Bag) to look at it closely.');
    if (pending('rest') && this.world === this.hub) return this.hud.showTip('Visit your cottage to see your new seed pot. You can rest in bed there.');
    this.hud.showTip(null);
  }

  // ================================================================ menus

  private async withModalGuard<T>(fn: () => Promise<T>): Promise<T> {
    this.input.clear();
    this.input.worldActive = false;
    const fake = { close() {}, closed: false } as unknown as Modal;
    this.modal = fake;
    try {
      return await fn();
    } finally {
      this.modal = null;
      this.input.worldActive = true;
    }
  }

  private onAction(a: string): void {
    if (!this.running || this.title) return;
    if (a === 'mute') return this.toggleMute();
    if (this.dialogue.isOpen || this.transitioning) return;
    if (this.modal) return;
    if (a === 'interact') this.interact();
    else if (a === 'journal') this.openJournal('quest');
    else if (a === 'bag') this.openJournal('bag');
    else if (a === 'menu') this.openSettingsPanel();
  }

  private toggleMute(): void {
    audio.unlock();
    updateSettings({ muted: !settings.muted });
    bus.emit('toast', { text: settings.muted ? 'Sound off' : 'Sound on', kind: 'info' });
  }

  openJournal(tab: JournalTab): void {
    if (this.modal || this.dialogue.isOpen) return;
    this.input.clear();
    this.input.worldActive = false;
    if (tab === 'bag') this.markTip('bag');
    this.markTip('journal');
    audio.open();
    this.modal = openJournal(
      this.uiLayer,
      {
        engine: this.engine,
        save: this.save,
        mapCanvas: this.hubGroundCanvas,
        mapSize: { w: this.hub.map.w, h: this.hub.map.h },
        buildings: this.hub.map.buildings.map((b) => ({
          x: b.x,
          y: b.y,
          w: b.w,
          d: b.d,
          label: b.label,
          roof: { red: P.roofRed1, blue: P.roofBlue1, green: P.roofGreen1, brown: P.roofBrown1, glass: P.glass2 }[b.roof],
        })),
        playerPos: () => ({ x: this.player.x, y: this.player.y, scene: this.world.id }),
        replay: (id) => {
          const conv = CONVERSATIONS[id];
          const speaker = conv ? Object.values(conv.nodes)[0].speaker : '';
          if (conv) window.setTimeout(() => void this.runConversation(conv, speaker, true), 0);
        },
        findCarver: () => {
          this.guideUntil = this.clock + 12;
          bus.emit('toast', { text: 'Follow the arrow to Carver.', kind: 'hint' });
        },
        extraSections: () => {
          // Newest chapter first, whatever order the chapters' code loaded in.
          const out: HTMLElement[] = [];
          for (const c of [...this.engine.allChapters()].reverse()) {
            const el = this.runtimes.get(c.id)?.journal?.(this.runtimeContext(c.id));
            if (el) out.push(el);
          }
          return out;
        },
        memories: this.save.memories.filter((id) => MEMORIES[id]).map((id) => ({ id, title: MEMORIES[id].title, setting: MEMORIES[id].setting })),
        openMemory: (id) => void this.showMemory(id),
        onInspect: (itemId) => {
          const e = this.engine.inventoryEntry(itemId);
          if (e && !e.inspected) {
            this.engine.markInspected(itemId);
            this.persist();
          }
        },
      },
      tab,
      () => {
        this.modal = null;
        this.input.worldActive = true;
        audio.close();
        this.refreshHud();
      },
    );
  }

  private settingsActions(inGame: boolean) {
    return {
      inGame,
      timePaused: () => this.save.time.paused,
      setTimePaused: (p: boolean) => {
        this.save.time.paused = p;
        this.persist();
      },
      saveNow: () => this.persist(),
      exportSave: () => this.exportSave(),
      importSave: (t: string) => this.importSave(t),
      resetSave: () => void this.confirmReset(),
      changeLook: () => this.openCustomizer(false),
      about: () => (inGame ? this.openJournal('about') : undefined),
    };
  }

  openSettingsPanel(): void {
    if (this.modal || this.dialogue.isOpen) return;
    this.input.clear();
    this.input.worldActive = false;
    audio.open();
    this.modal = openSettings(this.uiLayer, this.settingsActions(true), () => {
      this.modal = null;
      this.input.worldActive = true;
    });
  }

  private openCustomizer(firstTime: boolean): void {
    if (this.modal) return;
    this.input.clear();
    this.input.worldActive = false;
    this.modal = openCustomize(this.uiLayer, this.save.appearance, { firstTime }, (a) => {
      this.modal = null;
      this.input.worldActive = true;
      this.save.appearance = a;
      this.save.customized = true;
      this.player.setLook(lookFromAppearance(a));
      this.persist();
      if (firstTime) bus.emit('toast', { text: 'Welcome to Sweetgum Hollow!', kind: 'info' });
    });
  }

  private async confirmReset(): Promise<void> {
    this.modal?.close();
    const pick = await this.withModalGuard(() =>
      choose(this.uiLayer, 'Start over?', 'This deletes the progress saved in this browser: your look, items, quests and time. Settings stay the same. This cannot be undone.', [
        { id: 'keep', label: 'No, keep my progress' },
        { id: 'reset', label: 'Yes, delete and start over', kind: 'danger' },
      ]),
    );
    if (pick !== 'reset') return;
    this.store.reset();
    location.reload();
  }

  private exportSave(): void {
    this.persist('quiet');
    const text = this.store.exportText(this.save);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: `seeds-of-genius-save-day${this.save.time.day}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    bus.emit('toast', { text: 'Save file downloaded.', kind: 'info' });
  }

  private importSave(text: string): void {
    const r = this.store.importText(text);
    if (!r.data) {
      bus.emit('toast', { text: `That file isn't a Seeds of Genius save (${r.reason}). Nothing was changed.`, kind: 'info' });
      return;
    }
    this.modal?.close();
    this.store.save(r.data);
    location.reload();
  }

  // ================================================================ save

  persist(mode: 'normal' | 'quiet' = 'normal'): void {
    if (!this.running) return;
    this.autosaveTimer = 0;
    this.save.world = { scene: this.world.id, x: this.player.x, y: this.player.y, facing: this.player.facing };
    if (mode === 'normal') bus.emit('save:status', { status: 'saving' });
    const ok = this.store.save(this.save);
    if (!ok && this.store.available) bus.emit('save:status', { status: 'error' });
    else if (!this.store.available) {
      if (mode === 'normal') bus.emit('save:status', { status: 'error', message: 'Saving is off in this browser' });
    } else if (mode === 'normal') bus.emit('save:status', { status: 'saved' });
  }

  // ================================================================ debug / tests

  teleport(x: number, y: number, scene: SceneId = 'hub'): void {
    if (scene !== this.world.id) this.setScene(scene, { x, y });
    this.player.x = x;
    this.player.y = y;
    this.renderer.lookAt(x, y);
  }

  setTime(minutes: number): void {
    this.save.time.minutes = minutes;
    this.refreshNpcPresence();
    this.updateMood();
    this.persist('quiet');
  }

  /** Debug: make chapter N ready to start (earlier chapters marked complete, no rewards). */
  debugJumpTo(n: number): void {
    for (const c of this.engine.allChapters()) {
      const p = this.engine.progress(c.id);
      if (c.number < n) {
        p.stage = 'complete';
        p.rewarded = true;
        p.stepsDone = c.steps.map((s) => s.id);
        c.requiredItems.forEach((id) => this.engine.grantItem(id, 'debug') && this.engine.useItem(id, 'Skipped with debug'));
      } else if (c.number === n && c.status === 'playable') p.stage = 'available';
    }
    this.engine.refreshUnlocks();
    this.ensureRuntimes();
    this.refreshHud();
    this.persist();
  }

  debugComplete(): void {
    const e = this.engine;
    e.apply({ type: 'acceptQuest', chapterId: 'practice' });
    e.apply({ type: 'grantItem', itemId: 'seed_packet', from: 'mae' });
    e.apply({ type: 'completeStep', chapterId: 'practice', stepId: 'get_seeds' });
    e.apply({ type: 'useItem', itemId: 'seed_packet', usedIn: 'Given to Carver to plant' });
    e.apply({ type: 'completeChapter', chapterId: 'practice' });
    this.persist();
  }

  private exposeTestHooks(): void {
    const w = window as unknown as Record<string, unknown>;
    // Read-only snapshot for automated tests and support; changes nothing.
    w.__sog = {
      state: () => ({
        running: this.running,
        title: !!this.title,
        scene: this.world.id,
        player: this.player ? { x: +this.player.x.toFixed(2), y: +this.player.y.toFixed(2), facing: this.player.facing } : null,
        target: this.target ? { kind: this.target.kind, label: this.target.label } : null,
        dialogueOpen: !!this.dialogue?.isOpen,
        modalOpen: !!this.modal,
        objective: this.engine ? this.objective().text : undefined,
        practice: this.engine?.progress('practice'),
        chapters: this.engine ? Object.fromEntries(this.engine.allChapters().map((c) => [c.id, this.engine.progress(c.id).stage])) : {},
        ch1: this.engine?.progress('ch1'),
        ch1Data: this.save.chapterData.ch1 ?? null,
        ch2: this.engine?.progress('ch2'),
        ch2Data: this.save.chapterData.ch2 ?? null,
        ch3Data: this.save.chapterData.ch3 ?? null,
        ch4Data: this.save.chapterData.ch4 ?? null,
        cosmetics: this.save.cosmetics,
        memories: this.save.memories,
        runtimesReady: this.runtimesReady,
        version: this.save.version,
        inventory: this.save.progress.inventory,
        xp: this.save.progress.xp,
        seeds: this.save.progress.seeds,
        time: this.save.time,
        appearance: this.save.appearance,
        learner: this.save.learner,
        internal: { w: this.renderer.internalW, h: this.renderer.internalH, scale: this.renderer.scale },
      }),
      project: (x: number, y: number) => this.renderer.project(new THREE.Vector3(x, 0, y * K)),
      ...(this.debug ? { teleport: (x: number, y: number, s?: SceneId) => this.teleport(x, y, s), setTime: (m: number) => this.setTime(m) } : {}),
    };
  }
}

// ================================================================ helpers

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function faceToward(x: number, y: number, tx: number, ty: number): Dir {
  const dx = tx - x;
  const dy = ty - y;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
}

function facingBonus(f: Dir, dx: number, dy: number): number {
  const d = Math.hypot(dx, dy) || 1;
  const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[f];
  return (v[0] * dx + v[1] * dy) / d;
}

function sameTarget(a: Target, b: Target): boolean {
  if (a.kind !== b.kind) return false;
  if (a.kind === 'sign' && b.kind === 'sign') return a.text === b.text;
  return (a as { id: string }).id === (b as { id: string }).id;
}

function shortName(n: NpcDefinition): string {
  if (n.id === 'carver') return 'Carver';
  const words = n.name.split(' ');
  // "Mr. Odell" stays whole; "Ms. Ruth Nelson" becomes "Ms. Nelson"; "Miss Lottie Greene" becomes "Miss Lottie".
  if (words[0] === 'Miss') return `Miss ${words[1]}`;
  return /^(Mr|Ms|Mrs|Dr)\.$/.test(words[0]) ? `${words[0]} ${words[words.length - 1]}` : words[0];
}
