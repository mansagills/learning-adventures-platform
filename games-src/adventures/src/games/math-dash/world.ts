import * as THREE from 'three';
import { lookFromAppearance, type Appearance, type CharacterLook } from '../../kit/art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../../kit/art/palette';
import { paintSparkle } from '../../kit/art/sparkle';
import { mulberry32 } from '../../kit/core/rng';
import { K, PX, type PixelRenderer } from '../../kit/render/pixelRenderer';
import type { Input } from '../../kit/systems/input';
import { Actor } from '../../kit/world/actor';
import { Lighting, billboard, glowSprite, lightPool, pixelTexture } from '../../kit/world/sceneKit';
import { CollisionGrid } from '../../kit/world/walk';
import {
  paintBackWall,
  paintBookcase,
  paintDesk,
  paintFloor,
  paintFloorBook,
  paintFloorLamp,
  paintGlobe,
  paintOpenBook,
  paintPlane,
  paintPlant,
  paintReturnCart,
  paintSideWall,
  paintSign,
  paintStack,
  paintTable,
  ringCanvas,
  rugAuraCanvas,
  SPINES,
  type Rug,
} from './art';

export const MAP = { w: 34, h: 26 };

/** Where bookcases stand (left tile, front row). Row A against the back, row B near the front. */
export const SPOTS = [
  { x: 4, y: 6 },
  { x: 15, y: 6 },
  { x: 26, y: 6 },
  { x: 4, y: 22 },
  { x: 15, y: 22 },
  { x: 26, y: 22 },
];
/** Which spots are used for 4, 5 or 6 shelves (read left to right, top row first). */
const SPOT_SETS: Record<number, number[]> = { 4: [0, 2, 3, 5], 5: [0, 1, 2, 3, 5], 6: [0, 1, 2, 3, 4, 5] };

const RUGS: Rug[] = [
  { x: 6, y: 10, w: 6, h: 5, color: '#4f7a5a', edge: '#f2c94c' },
  { x: 22, y: 10, w: 6, h: 5, color: '#7a4f6e', edge: '#f2c94c' },
  { x: 13, y: 15, w: 8, h: 3, color: '#3e5a88', edge: '#e0823a' },
];
const TABLES = [
  { x: 9, y: 13 },
  { x: 25, y: 13 },
];
const DESK = { x: 17, y: 12 };
const DOORS = [
  { x: 1.6, y: 9 },
  { x: 1.6, y: 17.5 },
  { x: 32.4, y: 9 },
  { x: 32.4, y: 17.5 },
];
export const START = { x: 17, y: 16.4 };

export interface Book {
  id: number;
  n: number;
  x: number;
  y: number;
  color: string;
  mesh: THREE.Mesh;
  born: number;
  /** Shelving attempts that missed (for the glowing-sign hint). */
  tries: number;
  firstTryDone: boolean;
}

export type StudentKind = 'chat' | 'runner' | 'friend';
export type StudentState = 'chat' | 'calm' | 'seated' | 'leaving';

export interface Student {
  id: number;
  actor: Actor;
  kind: StudentKind;
  state: StudentState;
  speed: number;
  dir: { x: number; y: number };
  seat: { x: number; y: number; taken: boolean } | null;
  bookMesh: THREE.Mesh | null;
  stuck: number;
}

interface Effect {
  mesh: THREE.Mesh;
  t: number;
  life: number;
  kind: 'ring' | 'sparkle' | 'puff';
  radius?: number;
  frame?: number;
}

interface Note {
  mesh: THREE.Mesh;
  x: number;
  y: number;
  target: Student;
  speed: number;
  life: number;
}

export type WorldEvent =
  | { type: 'pickup'; book: Book }
  | { type: 'shelf'; index: number }
  | { type: 'bump'; student: Student }
  | { type: 'calmed'; student: Student };

/** What the world needs from the run each frame (from the power-ups). */
export interface RunTuning {
  speed: number;
  pickup: number;
  canCarry: boolean;
  rugRadius: number;
  rugSlow: number;
  shield: boolean;
  invulnerable: boolean;
}

const r16 = (n: number) => n / PX;

/**
 * The library: room, furniture, bookcases with signs, books on the floor,
 * students, and the power-up effects. The rules (which shelf is right,
 * scores, Focus) live in game.ts; this file moves things and reports events.
 */
export class LibraryWorld {
  readonly scene = new THREE.Scene();
  readonly lighting = new Lighting();
  readonly grid = new CollisionGrid(MAP.w, MAP.h);
  player!: Actor;
  librarian!: Actor;
  readonly books = new Map<number, Book>();
  readonly students: Student[] = [];
  private pool: Actor[] = [];
  private cases: THREE.Mesh[] = [];
  private signs: Array<THREE.Mesh | null> = [];
  private signText: string[] = [];
  private signGlow = -1;
  /** Shelf index → spot index for the current stage. */
  activeSpots: number[] = [];
  private effects: Effect[] = [];
  private notes: Note[] = [];
  private stack!: THREE.Mesh;
  private stackCount = -1;
  private rug!: THREE.Mesh;
  private shieldRing!: THREE.Mesh;
  private seats: Array<{ x: number; y: number; taken: boolean }> = [];
  private nextId = 1;
  private rnd = mulberry32(42);
  private inShelf = -1;
  private knock = { x: 0, y: 0 };
  time = 0;
  reducedMotion = false;
  private bookTex = new Map<string, HTMLCanvasElement>();
  private ringTex: THREE.CanvasTexture | null = null;
  private sparkleTex: THREE.CanvasTexture[] = [];

  constructor(private readonly r: PixelRenderer) {}

  build(playerLook: CharacterLook, librarianLook: CharacterLook): void {
    const L = this.lighting;
    this.r.setBounds(MAP.w, MAP.h);
    this.r.renderer.setClearColor(new THREE.Color('#2a1a10'), 1);

    const floor = paintFloor(MAP.w, MAP.h, RUGS);
    const gGeo = new THREE.PlaneGeometry(MAP.w, MAP.h * K);
    gGeo.rotateX(-Math.PI / 2);
    const g = new THREE.Mesh(gGeo, L.add(new THREE.MeshBasicMaterial({ map: pixelTexture(floor) })));
    g.position.set(MAP.w / 2, 0, (MAP.h / 2) * K);
    this.scene.add(g);

    // walls: the back wall stands along row 3; the sides and front are borders
    this.scene.add(billboard(L, paintBackWall(MAP.w), MAP.w / 2, 3));
    const side = paintSideWall(MAP.h);
    for (const x of [0.5, MAP.w - 0.5]) {
      const geo = new THREE.PlaneGeometry(1, MAP.h * K);
      geo.rotateX(-Math.PI / 2);
      const m = new THREE.Mesh(geo, L.add(new THREE.MeshBasicMaterial({ map: pixelTexture(side) })));
      m.position.set(x, 0.01, (MAP.h / 2) * K);
      this.scene.add(m);
    }
    this.grid.block(0, 0, MAP.w, 3);
    this.grid.block(0, 0, 1, MAP.h);
    this.grid.block(MAP.w - 1, 0, 1, MAP.h);
    this.grid.block(0, MAP.h - 2, MAP.w, 2);

    // daylight from the windows
    for (let wx = 3; wx < MAP.w - 3; wx += 8) this.scene.add(lightPool(L, wx + 0.9, 4.2, 2.2, '#fff4cf', 0.35));

    // bookcases (signs are added per stage)
    SPOTS.forEach((s, i) => {
      const m = billboard(L, paintBookcase(i + 1).toCanvas(), s.x + 2, s.y);
      this.cases.push(m);
      this.signs.push(null);
      this.signText.push('');
      this.scene.add(m);
      // the case itself, plus the gap behind back-row cases (you could hide there)
      this.grid.block(s.x, s.y - 1, 4, 1);
      if (s.y < 10) this.grid.block(s.x, 3, 4, s.y - 3);
      else this.grid.block(s.x, s.y - 3, 4, 2);
    });

    // tables with seats for calmed students
    const tableCanvas = paintTable().toCanvas();
    for (const t of TABLES) {
      this.scene.add(billboard(L, tableCanvas, t.x, t.y));
      this.grid.block(t.x - 1.5, t.y - 1, 3, 1);
      this.seats.push({ x: t.x - 1, y: t.y - 1.35, taken: false }, { x: t.x + 0.6, y: t.y - 1.35, taken: false });
      this.scene.add(billboard(L, paintFloorLamp().toCanvas(), t.x + 2.4, t.y - 0.4));
      this.scene.add(glowSprite(L, 40, '#ffe7a3', t.x + 2.4, t.y - 0.35, 2.3, 0.7));
      this.scene.add(lightPool(L, t.x, t.y - 0.6, 2.4, '#ffe7a3', 0.3));
    }
    // story-rug seats
    for (let i = 0; i < 6; i++) this.seats.push({ x: 13.8 + i * 1.3, y: 16.2, taken: false });
    for (let i = 0; i < 5; i++) this.seats.push({ x: 14.4 + i * 1.3, y: 17.4, taken: false });

    // the librarian's desk
    this.scene.add(billboard(L, paintDesk().toCanvas(), DESK.x, DESK.y));
    this.grid.block(DESK.x - 2.5, DESK.y - 2, 5, 2); // the desk and the librarian's spot behind it
    this.librarian = new Actor(L, librarianLook, DESK.x + 0.6, DESK.y - 1.3, 'down');
    this.scene.add(this.librarian.group);
    this.scene.add(billboard(L, paintGlobe().toCanvas(), DESK.x - 3.6, DESK.y - 0.1));
    this.grid.block(DESK.x - 4, DESK.y - 1, 1, 1);
    this.scene.add(billboard(L, paintReturnCart().toCanvas(), DESK.x + 3.8, DESK.y));
    this.grid.block(DESK.x + 3, DESK.y - 1, 2, 1);

    // plants in the corners
    [
      [1.8, 4.6],
      [32.2, 4.6],
      [1.8, 22.2],
      [32.2, 22.2],
      [12.6, 9.2],
      [21.4, 9.2],
    ].forEach(([x, y], i) => {
      this.scene.add(billboard(L, paintPlant(i + 3).toCanvas(), x, y));
      this.grid.block(Math.floor(x), Math.floor(y - 0.5), 1, 1);
    });

    // the player, with a stack of books above the head, a rug aura and a shield ring
    this.player = new Actor(L, playerLook, START.x, START.y, 'up');
    this.scene.add(this.player.group);
    this.stack = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.5 }));
    this.player.group.add(this.stack);
    this.setCarried(0);

    const rugGeo = new THREE.PlaneGeometry(2, 2 * K);
    rugGeo.rotateX(-Math.PI / 2);
    this.rug = new THREE.Mesh(rugGeo, new THREE.MeshBasicMaterial({ map: pixelTexture(rugAuraCanvas(64)), transparent: true, depthWrite: false }));
    this.rug.position.y = 0.025;
    this.rug.renderOrder = 1;
    this.rug.visible = false;
    this.scene.add(this.rug);

    const shGeo = new THREE.PlaneGeometry(1.6, 1.6 * K);
    shGeo.rotateX(-Math.PI / 2);
    this.shieldRing = new THREE.Mesh(shGeo, new THREE.MeshBasicMaterial({ map: pixelTexture(ringCanvas(26, '#5fd3c9')), transparent: true, depthWrite: false }));
    this.shieldRing.position.y = 0.03;
    this.shieldRing.renderOrder = 3;
    this.shieldRing.visible = false;
    this.scene.add(this.shieldRing);

    this.ringTex = pixelTexture(ringCanvas(96, '#ffe27a'));
    this.sparkleTex = [0, 1, 2].map((f) => pixelTexture(paintSparkle(f).toCanvas()));

    // a warm indoor light with lamp glows
    this.lighting.set([1, 0.97, 0.9], 0.55);
  }

  // ------------------------------------------------------------ shelves

  /** Put up the signs for a stage. Unused bookcases get a dust sheet. */
  setShelves(labels: string[]): void {
    this.activeSpots = SPOT_SETS[labels.length] ?? SPOT_SETS[6];
    SPOTS.forEach((s, spot) => {
      const shelf = this.activeSpots.indexOf(spot);
      const mat = this.cases[spot].material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.map = pixelTexture(paintBookcase(spot + 1, shelf < 0).toCanvas());
      mat.needsUpdate = true;
      const old = this.signs[spot];
      if (old) {
        this.scene.remove(old);
        (old.material as THREE.MeshBasicMaterial).map?.dispose();
      }
      this.signs[spot] = null;
      this.signText[spot] = '';
      if (shelf >= 0) {
        this.signText[spot] = labels[shelf];
        const sign = billboard(this.lighting, paintSign(labels[shelf], { fresh: true }).toCanvas(), s.x + 2, s.y + 0.05, { lift: 2.55 });
        sign.renderOrder = 4;
        this.signs[spot] = sign;
        this.scene.add(sign);
      }
    });
    this.signGlow = -1;
    window.setTimeout(() => this.refreshSigns(), 900);
  }

  /** Light up one shelf's sign (the hint), or none with -1. */
  glowShelf(index: number): void {
    if (index === this.signGlow) return;
    this.signGlow = index;
    this.refreshSigns();
  }

  private refreshSigns(): void {
    SPOTS.forEach((_, spot) => {
      const m = this.signs[spot];
      if (!m) return;
      const shelf = this.activeSpots.indexOf(spot);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.map = pixelTexture(paintSign(this.signText[spot], { glow: shelf === this.signGlow }).toCanvas());
      mat.needsUpdate = true;
    });
  }

  /** The shelf whose front the player is touching, or -1. */
  shelfAtPlayer(): number {
    const p = this.player;
    for (let i = 0; i < this.activeSpots.length; i++) {
      const s = SPOTS[this.activeSpots[i]];
      // back-row cases: the strip in front; front-row cases: the whole aisle along the front wall
      const depth = s.y > 12 ? 1.8 : 0.75;
      if (p.x > s.x - 0.25 && p.x < s.x + 4.25 && p.y > s.y - 0.2 && p.y < s.y + depth) return i;
    }
    return -1;
  }

  /** The middle of a shelf's front (for arrows, floating text). */
  shelfPoint(i: number): { x: number; y: number } {
    const s = SPOTS[this.activeSpots[i]];
    return { x: s.x + 2, y: s.y };
  }

  /** Push the player back off a shelf (a wrong book bounces you away). */
  bounceFromShelf(i: number): void {
    const s = SPOTS[this.activeSpots[i]];
    const side = this.player.x < s.x + 2 ? -1 : 1;
    if (s.y > 12) {
      // front row: slide back along the aisle
      this.knock.x = side * 7;
      this.knock.y = 0;
    } else {
      this.knock.y = 6;
      this.knock.x = side * 1.5;
    }
  }

  // ------------------------------------------------------------ books

  private bookCanvas(n: number, color: string, glasses: boolean): HTMLCanvasElement {
    const key = `${n}|${color}|${glasses ? 1 : 0}`;
    let cv = this.bookTex.get(key);
    if (!cv) {
      cv = paintFloorBook(n, color, glasses).toCanvas();
      this.bookTex.set(key, cv);
    }
    return cv;
  }

  /** Drop a new book somewhere open, not too close to the player. */
  spawnBook(n: number, glasses: boolean): Book | null {
    for (let tries = 0; tries < 40; tries++) {
      const x = 2 + this.rnd() * (MAP.w - 4);
      const y = 4.6 + this.rnd() * (MAP.h - 6.2);
      if (!this.grid.isFree(x, y, 0.45)) continue;
      if (Math.hypot(x - this.player.x, y - this.player.y) < 3) continue;
      if (Math.abs(x - DESK.x) < 4 && y < DESK.y + 0.5 && y > DESK.y - 3.5) continue; // not behind the desk
      if (this.shelfIndexAt(x, y) >= 0) continue;
      let crowded = false;
      for (const b of this.books.values()) if (Math.hypot(b.x - x, b.y - y) < 1.4) crowded = true;
      if (crowded) continue;
      const color = SPINES[Math.floor(this.rnd() * SPINES.length)];
      const mesh = billboard(this.lighting, this.bookCanvas(n, color, glasses), x, y);
      mesh.renderOrder = 3;
      const book: Book = { id: this.nextId++, n, x, y, color, mesh, born: this.time, tries: 0, firstTryDone: false };
      this.books.set(book.id, book);
      this.scene.add(mesh);
      this.puff(x, y);
      return book;
    }
    return null;
  }

  private shelfIndexAt(x: number, y: number): number {
    for (let i = 0; i < SPOTS.length; i++) {
      const s = SPOTS[i];
      if (x > s.x - 0.6 && x < s.x + 4.6 && y > s.y - 0.4 && y < s.y + 1.2) return i;
    }
    return -1;
  }

  removeBook(id: number, sparkle = true): void {
    const b = this.books.get(id);
    if (!b) return;
    this.scene.remove(b.mesh);
    b.mesh.geometry.dispose();
    (b.mesh.material as THREE.MeshBasicMaterial).map?.dispose();
    this.books.delete(id);
    if (sparkle) this.sparkle(b.x, b.y, 0.4);
  }

  clearBooks(): void {
    [...this.books.keys()].forEach((id) => this.removeBook(id, true));
  }

  /** Repaint every book's tag (when Reading Glasses are picked up). */
  relabelBooks(glasses: boolean): void {
    for (const b of this.books.values()) {
      const mat = b.mesh.material as THREE.MeshBasicMaterial;
      mat.map?.dispose();
      mat.map = pixelTexture(this.bookCanvas(b.n, b.color, glasses));
      mat.needsUpdate = true;
    }
  }

  setCarried(count: number): void {
    if (count === this.stackCount) return;
    this.stackCount = count;
    const cv = paintStack(count).toCanvas();
    const mat = this.stack.material as THREE.MeshBasicMaterial;
    mat.map?.dispose();
    mat.map = pixelTexture(cv);
    mat.needsUpdate = true;
    this.stack.geometry.dispose();
    const h = (cv.height / PX) * K;
    this.stack.geometry = new THREE.PlaneGeometry(cv.width / PX, h);
    this.stack.geometry.translate(0, h / 2, 0);
    this.stack.position.set(0, 1.62 * K, 0.05);
    this.stack.visible = count > 0;
  }

  // ------------------------------------------------------------ students

  private randomLook(): CharacterLook {
    const pick = <T>(a: readonly T[]) => a[Math.floor(this.rnd() * a.length)];
    const body = this.rnd() < 0.5 ? 'girl' : 'boy';
    const a: Appearance = {
      body,
      skin: pick(SKIN_TONES).id,
      hairStyle: pick(HAIR_STYLES).id,
      hairColor: pick(HAIR_COLORS.filter((h) => h.id !== 'gray')).id,
      outfit: pick(OUTFIT_COLORS).id,
      accessory: this.rnd() < 0.6 ? 'none' : pick(ACCESSORIES.filter((x) => x.id !== 'sunhat')).id,
    };
    return lookFromAppearance(a);
  }

  /** Bring a student in through a door. Groups of friends come in threes. */
  spawnStudent(kind: StudentKind, speed: number): Student {
    const door = DOORS[Math.floor(this.rnd() * DOORS.length)];
    let actor = this.pool.pop();
    if (actor) {
      actor.setLook(this.randomLook());
      actor.x = door.x;
      actor.y = door.y;
      actor.setVisible(true);
    } else {
      actor = new Actor(this.lighting, this.randomLook(), door.x, door.y, 'down');
      this.scene.add(actor.group);
    }
    let dir = { x: 0, y: 0 };
    if (kind === 'runner') {
      // run across the room toward the far side of the player
      const tx = this.player.x - door.x;
      const ty = this.player.y - door.y;
      const l = Math.hypot(tx, ty) || 1;
      dir = { x: tx / l, y: ty / l };
    }
    const s: Student = { id: this.nextId++, actor, kind, state: 'chat', speed, dir, seat: null, bookMesh: null, stuck: 0 };
    this.students.push(s);
    return s;
  }

  /** A student hears the bell (or gets a note): they go and sit down to read. */
  calm(s: Student): void {
    if (s.state !== 'chat') return;
    s.state = 'calm';
    const free = this.seats.filter((x) => !x.taken);
    if (free.length) {
      free.sort((a, b) => Math.hypot(a.x - s.actor.x, a.y - s.actor.y) - Math.hypot(b.x - s.actor.x, b.y - s.actor.y));
      s.seat = free[0];
      s.seat.taken = true;
    } else s.state = 'leaving';
  }

  private removeStudent(s: Student): void {
    s.actor.setVisible(false);
    if (s.bookMesh) {
      s.actor.group.remove(s.bookMesh);
      s.bookMesh = null;
    }
    if (s.seat) s.seat.taken = false;
    this.pool.push(s.actor);
    this.students.splice(this.students.indexOf(s), 1);
  }

  /** Readers stand up and leave so the seats free up (called now and then). */
  freeOldestReader(): void {
    const reader = this.students.find((s) => s.state === 'seated');
    if (!reader) return;
    if (reader.seat) reader.seat.taken = false;
    reader.seat = null;
    if (reader.bookMesh) {
      reader.actor.group.remove(reader.bookMesh);
      reader.bookMesh = null;
    }
    reader.state = 'leaving';
  }

  get chattyCount(): number {
    return this.students.filter((s) => s.state === 'chat').length;
  }

  // ------------------------------------------------------------ effects

  /** The Shush Bell: an expanding gold ring. Returns the students it reaches. */
  ring(radius: number): Student[] {
    const geo = new THREE.PlaneGeometry(2, 2 * K);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.ringTex, transparent: true, depthWrite: false }));
    mesh.position.set(this.player.x, 0.04, this.player.y * K);
    mesh.renderOrder = 6;
    this.scene.add(mesh);
    this.effects.push({ mesh, t: 0, life: 0.45, kind: 'ring', radius });
    return this.students.filter((s) => s.state === 'chat' && Math.hypot(s.actor.x - this.player.x, s.actor.y - this.player.y) <= radius);
  }

  /** Paper Notes: fly to the nearest chatty students. */
  launchNotes(count: number, speed: number): void {
    const targets = this.students
      .filter((s) => s.state === 'chat')
      .sort((a, b) => Math.hypot(a.actor.x - this.player.x, a.actor.y - this.player.y) - Math.hypot(b.actor.x - this.player.x, b.actor.y - this.player.y))
      .slice(0, count);
    for (const t of targets) {
      const mesh = billboard(this.lighting, paintPlane().toCanvas(), this.player.x, this.player.y, { lift: 0.9 });
      mesh.renderOrder = 7;
      this.scene.add(mesh);
      this.notes.push({ mesh, x: this.player.x, y: this.player.y, target: t, speed, life: 3 });
    }
  }

  sparkle(x: number, y: number, lift = 0.8): void {
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.PlaneGeometry(r16(9), r16(9) * K);
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.sparkleTex[0], transparent: true, depthWrite: false }));
      mesh.rotation.x = -Math.PI / 4;
      mesh.position.set(x + (this.rnd() - 0.5) * 1.2, (lift + this.rnd() * 0.8) * K, y * K + 0.3);
      mesh.renderOrder = 8;
      this.scene.add(mesh);
      this.effects.push({ mesh, t: -i * 0.06, life: 0.45, kind: 'sparkle', frame: 0 });
    }
  }

  private puff(x: number, y: number): void {
    const geo = new THREE.PlaneGeometry(r16(9), r16(9) * K);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: this.sparkleTex[1], transparent: true, depthWrite: false, opacity: 0.8 }));
    mesh.rotation.x = -Math.PI / 4;
    mesh.position.set(x, 0.5 * K, y * K + 0.2);
    this.scene.add(mesh);
    this.effects.push({ mesh, t: 0, life: 0.35, kind: 'puff' });
  }

  // ------------------------------------------------------------ the frame

  update(dt: number, input: Input | null, tune: RunTuning | null): WorldEvent[] {
    this.time += dt;
    const events: WorldEvent[] = [];
    const p = this.player;

    // move the player (and any knock-back)
    if (input && tune) {
      const d = input.direction();
      const kx = this.knock.x * dt;
      const ky = this.knock.y * dt;
      this.knock.x *= Math.pow(0.0015, dt);
      this.knock.y *= Math.pow(0.0015, dt);
      const n = this.grid.move(p.x, p.y, d.x * tune.speed * dt + kx, d.y * tune.speed * dt + ky, 0.3);
      p.moving = Math.abs(d.x) + Math.abs(d.y) > 0.05;
      if (p.moving) p.facing = Math.abs(d.x) > Math.abs(d.y) ? (d.x > 0 ? 'right' : 'left') : d.y > 0 ? 'down' : 'up';
      p.x = n.x;
      p.y = n.y;
    } else p.moving = false;
    p.update(dt, this.reducedMotion);
    this.librarian.facing = Math.abs(p.x - this.librarian.x) > Math.abs(p.y - this.librarian.y) ? (p.x > this.librarian.x ? 'right' : 'left') : 'down';
    this.librarian.update(dt, this.reducedMotion);

    if (tune) {
      // books: the magnet pulls them in, touching picks them up
      for (const b of this.books.values()) {
        const dx = p.x - b.x;
        const dy = p.y - b.y;
        const d = Math.hypot(dx, dy);
        if (!tune.canCarry) continue;
        if (d < tune.pickup) {
          const pull = Math.min(d, (6 + tune.pickup * 2) * dt);
          b.x += (dx / (d || 1)) * pull;
          b.y += (dy / (d || 1)) * pull;
          b.mesh.position.set(b.x, 0, b.y * K);
        }
        if (d < 0.5) {
          events.push({ type: 'pickup', book: b });
          break; // one at a time keeps the order clear
        }
      }

      // shelves: report entering a shelf's front
      const sh = this.shelfAtPlayer();
      if (sh !== this.inShelf) {
        this.inShelf = sh;
        if (sh >= 0) events.push({ type: 'shelf', index: sh });
      }

      // the rug aura and shield ring follow the player
      this.rug.visible = tune.rugRadius > 0;
      if (this.rug.visible) {
        this.rug.scale.set(tune.rugRadius, 1, tune.rugRadius);
        this.rug.position.set(p.x, 0.025, p.y * K);
      }
      this.shieldRing.visible = tune.shield;
      this.shieldRing.position.set(p.x, 0.03, p.y * K);
    }

    // students
    for (const s of [...this.students]) {
      const a = s.actor;
      let vx = 0;
      let vy = 0;
      let speed = s.speed;
      if (s.state === 'chat') {
        if (s.kind === 'runner') {
          vx = s.dir.x;
          vy = s.dir.y;
        } else {
          const dx = p.x - a.x;
          const dy = p.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          vx = dx / d;
          vy = dy / d;
          if (s.kind === 'friend') {
            vx += Math.sin(this.time * 2 + s.id) * 0.4;
            vy += Math.cos(this.time * 2 + s.id) * 0.4;
          }
        }
        // keep a little apart from other students
        for (const o of this.students) {
          if (o === s || o.state !== 'chat') continue;
          const ox = a.x - o.actor.x;
          const oy = a.y - o.actor.y;
          const od = Math.hypot(ox, oy);
          if (od > 0 && od < 0.8) {
            vx += (ox / od) * (0.8 - od) * 2;
            vy += (oy / od) * (0.8 - od) * 2;
          }
        }
        if (tune && tune.rugRadius > 0 && Math.hypot(p.x - a.x, p.y - a.y) < tune.rugRadius) speed *= 1 - tune.rugSlow;
        if (tune && !tune.invulnerable && Math.hypot(p.x - a.x, p.y - a.y) < 0.62) events.push({ type: 'bump', student: s });
      } else if (s.state === 'calm' && s.seat) {
        const dx = s.seat.x - a.x;
        const dy = s.seat.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.15) {
          s.state = 'seated';
          a.x = s.seat.x;
          a.y = s.seat.y;
          a.facing = 'down';
          const bm = billboard(this.lighting, paintOpenBook(SPINES[s.id % SPINES.length]).toCanvas(), 0, 0.05, { lift: 0.45 });
          a.group.add(bm);
          s.bookMesh = bm;
          events.push({ type: 'calmed', student: s });
        } else {
          vx = dx / d;
          vy = dy / d;
          speed = 3.2;
        }
      } else if (s.state === 'leaving') {
        const door = DOORS.reduce((best, d) => (Math.hypot(d.x - a.x, d.y - a.y) < Math.hypot(best.x - a.x, best.y - a.y) ? d : best));
        const dx = door.x - a.x;
        const dy = door.y - a.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.5) {
          this.removeStudent(s);
          continue;
        }
        vx = dx / d;
        vy = dy / d;
        speed = 3.4;
      }
      const l = Math.hypot(vx, vy);
      if (l > 0.01) {
        const mx = (vx / l) * speed * dt;
        const my = (vy / l) * speed * dt;
        // calmed students walk around furniture loosely (they may pass through to reach a seat)
        const n = s.state === 'calm' || s.state === 'leaving' ? { x: a.x + mx, y: a.y + my } : this.grid.move(a.x, a.y, mx, my, 0.28);
        const moved = Math.hypot(n.x - a.x, n.y - a.y);
        if (s.kind === 'runner' && s.state === 'chat' && moved < speed * dt * 0.3) {
          // a runner hit a wall: turn
          s.dir = { x: -s.dir.y + (this.rnd() - 0.5) * 0.4, y: s.dir.x };
        }
        a.x = n.x;
        a.y = n.y;
        a.moving = true;
        a.facing = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'right' : 'left') : vy > 0 ? 'down' : 'up';
      } else a.moving = false;
      if (s.kind === 'runner' && s.state === 'chat' && (a.x < 1.2 || a.x > MAP.w - 1.2 || a.y < 3.6 || a.y > MAP.h - 1.2)) s.state = 'leaving';
      a.update(dt, this.reducedMotion);
    }

    // notes in flight
    for (const n of [...this.notes]) {
      n.life -= dt;
      const t = n.target.actor;
      const dx = t.x - n.x;
      const dy = t.y - n.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.4 || n.target.state !== 'chat' || n.life <= 0) {
        if (d < 0.4 && n.target.state === 'chat') {
          this.calm(n.target);
          this.sparkle(t.x, t.y, 1);
        }
        this.scene.remove(n.mesh);
        this.notes.splice(this.notes.indexOf(n), 1);
        continue;
      }
      n.x += (dx / d) * n.speed * dt;
      n.y += (dy / d) * n.speed * dt;
      n.mesh.position.set(n.x, 0.9 * K, n.y * K + 0.1);
      n.mesh.scale.x = dx < 0 ? -1 : 1;
    }

    // effects
    for (const e of [...this.effects]) {
      e.t += dt;
      if (e.t < 0) {
        e.mesh.visible = false;
        continue;
      }
      e.mesh.visible = true;
      const k = e.t / e.life;
      const mat = e.mesh.material as THREE.MeshBasicMaterial;
      if (e.kind === 'ring') {
        const rr = (e.radius ?? 2) * Math.min(1, 0.2 + k * 1.1);
        e.mesh.scale.set(rr, 1, rr);
        e.mesh.position.set(p.x, 0.04, p.y * K);
        mat.opacity = 1 - k * k;
      } else if (e.kind === 'sparkle') {
        mat.map = this.sparkleTex[Math.min(2, Math.floor(k * 3))];
        e.mesh.position.y += dt * 0.8;
      } else {
        mat.opacity = 0.8 * (1 - k);
        e.mesh.position.y += dt * 0.6;
      }
      if (e.t >= e.life) {
        this.scene.remove(e.mesh);
        e.mesh.geometry.dispose();
        this.effects.splice(this.effects.indexOf(e), 1);
      }
    }

    // books bob gently so they catch the eye
    if (!this.reducedMotion) for (const b of this.books.values()) b.mesh.position.y = Math.round(Math.max(0, Math.sin(this.time * 3 + b.id)) * 1.5) / PX * K;

    this.r.lookAt(p.x, p.y - 0.6, 0.2);
    return events;
  }

  /** Push the player away from a student (a bump) and the student back a little. */
  knockBack(s: Student): void {
    const dx = this.player.x - s.actor.x;
    const dy = this.player.y - s.actor.y;
    const d = Math.hypot(dx, dy) || 1;
    this.knock.x = (dx / d) * 7;
    this.knock.y = (dy / d) * 7;
    const n = this.grid.move(s.actor.x, s.actor.y, (-dx / d) * 0.8, (-dy / d) * 0.8, 0.28);
    s.actor.x = n.x;
    s.actor.y = n.y;
  }

  /** Screen position above a world point (for HTML labels and bubbles). */
  screenOf(x: number, y: number, lift = 0): { x: number; y: number; visible: boolean } {
    return this.r.project(new THREE.Vector3(x, lift * K, y * K));
  }

  /** Remove every student and book (a new run). */
  reset(): void {
    [...this.students].forEach((s) => this.removeStudent(s));
    this.seats.forEach((x) => (x.taken = false));
    this.clearBooks();
    for (const n of this.notes) this.scene.remove(n.mesh);
    this.notes = [];
    this.player.x = START.x;
    this.player.y = START.y;
    this.player.facing = 'up';
    this.knock = { x: 0, y: 0 };
    this.inShelf = -1;
    this.setCarried(0);
  }

  render(): void {
    this.r.render(this.scene);
  }
}
