import { DEFAULT_APPEARANCE, DIRS, type Appearance, type Dir } from '../art/characters';
import { ACCESSORIES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, SKIN_TONES } from '../art/palette';
import type { ProgressState } from '../quests/engine';
import type { ChapterProgress, InventoryEntry } from '../quests/types';
import type { LearnerState, ObjectiveRecord } from '../learning/learnerModel';
import type { SceneId } from '../world/map';

/**
 * Versioned save file, kept in this browser's localStorage only. No names,
 * accounts or personal details are stored: just the look the player chose,
 * where they are, and what they have done.
 */

export const SAVE_VERSION = 2;
export const SAVE_KEY = 'seedsOfGenius.save';
export const BACKUP_KEY = 'seedsOfGenius.save.backup';
export const QUARANTINE_KEY = 'seedsOfGenius.save.unreadable';

export interface DialogueLogEntry {
  conversationId: string;
  npcId: string;
  at: number;
}

export interface SaveData {
  version: typeof SAVE_VERSION;
  createdAt: number;
  savedAt: number;
  customized: boolean;
  appearance: Appearance;
  world: { scene: SceneId; x: number; y: number; facing: Dir };
  time: { minutes: number; day: number; paused: boolean };
  progress: ProgressState;
  learner: LearnerState;
  log: DialogueLogEntry[];
  /** Onboarding tips already shown. */
  tips: string[];
  /** Each chapter's own saved state (minigame progress, notes). Added in version 2. */
  chapterData: Record<string, Record<string, unknown>>;
  /** Memories from Carver's life the player has seen. Added in version 2. */
  memories: string[];
  /** Cosmetic decorations bought with Seeds (the workshop). Added in Phase 4; missing means none. */
  cosmetics: string[];
}

export function freshSave(now = Date.now()): SaveData {
  return {
    version: SAVE_VERSION,
    createdAt: now,
    savedAt: now,
    customized: false,
    appearance: { ...DEFAULT_APPEARANCE },
    world: { scene: 'hub', x: 5.5, y: 18.5, facing: 'down' },
    time: { minutes: 8 * 60, day: 1, paused: false },
    progress: { xp: 0, seeds: 0, chapters: {}, inventory: [] },
    learner: {},
    log: [],
    tips: [],
    chapterData: {},
    memories: [],
    cosmetics: [],
  };
}

// ------------------------------------------------------------ validation

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown, d: number, min = -Infinity, max = Infinity) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d;
const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T): T => (list.includes(v as T) ? (v as T) : d);
const strList = (v: unknown, max = 500) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, max) : []);

function cleanAppearance(v: unknown): Appearance {
  const a = isObj(v) ? v : {};
  const d = DEFAULT_APPEARANCE;
  return {
    skin: oneOf(a.skin, SKIN_TONES.map((s) => s.id), d.skin),
    hairStyle: oneOf(a.hairStyle, HAIR_STYLES.map((s) => s.id), d.hairStyle),
    hairColor: oneOf(a.hairColor, HAIR_COLORS.map((s) => s.id), d.hairColor),
    outfit: oneOf(a.outfit, OUTFIT_COLORS.map((s) => s.id), d.outfit),
    accessory: oneOf(a.accessory, ACCESSORIES.map((s) => s.id), d.accessory),
  };
}

function cleanChapter(v: unknown): ChapterProgress | null {
  if (!isObj(v)) return null;
  return {
    stage: oneOf(v.stage, ['locked', 'available', 'active', 'complete'] as const, 'locked'),
    stepsDone: strList(v.stepsDone, 50),
    flags: strList(v.flags, 100),
    rewarded: v.rewarded === true,
    completedAt: typeof v.completedAt === 'number' ? v.completedAt : undefined,
  };
}

function cleanInventory(v: unknown): InventoryEntry[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: InventoryEntry[] = [];
  for (const e of v) {
    if (!isObj(e) || typeof e.itemId !== 'string' || seen.has(e.itemId)) continue;
    seen.add(e.itemId);
    out.push({
      itemId: e.itemId,
      from: str(e.from, 'unknown'),
      obtainedAt: num(e.obtainedAt, 0),
      used: e.used === true,
      usedIn: typeof e.usedIn === 'string' ? e.usedIn : undefined,
      inspected: e.inspected === true,
    });
  }
  return out;
}

function cleanLearner(v: unknown): LearnerState {
  const out: LearnerState = {};
  if (!isObj(v)) return out;
  for (const [k, r] of Object.entries(v)) {
    if (!isObj(r)) continue;
    const rec: ObjectiveRecord = {
      attempts: num(r.attempts, 0, 0),
      correct: num(r.correct, 0, 0),
      hintLevel: num(r.hintLevel, 0, 0, 3) as ObjectiveRecord['hintLevel'],
      misconception: typeof r.misconception === 'string' ? r.misconception : null,
      evidence: strList(r.evidence, 12),
      mastered: r.mastered === true,
    };
    out[k] = rec;
  }
  return out;
}

/**
 * Turn anything (an old save, a hand-edited file, a half-broken import)
 * into a valid current save. Unknown fields are dropped, missing ones get
 * defaults, and numbers are clamped to sensible ranges.
 */
export function sanitize(raw: Record<string, unknown>, now = Date.now()): SaveData {
  const base = freshSave(now);
  const world = isObj(raw.world) ? raw.world : {};
  const time = isObj(raw.time) ? raw.time : {};
  const progress = isObj(raw.progress) ? raw.progress : {};
  const chapters: Record<string, ChapterProgress> = {};
  if (isObj(progress.chapters))
    for (const [id, c] of Object.entries(progress.chapters)) {
      const clean = cleanChapter(c);
      if (clean) chapters[id] = clean;
    }
  return {
    version: SAVE_VERSION,
    createdAt: num(raw.createdAt, base.createdAt),
    savedAt: num(raw.savedAt, base.savedAt),
    customized: raw.customized === true,
    appearance: cleanAppearance(raw.appearance),
    world: {
      scene: oneOf(world.scene, ['hub', 'room', 'school', 'farm', 'workshop', 'creek'] as const, 'hub'),
      x: num(world.x, base.world.x, 0, 60),
      y: num(world.y, base.world.y, 0, 60),
      facing: oneOf(world.facing, DIRS, 'down'),
    },
    time: {
      minutes: num(time.minutes, base.time.minutes, 0, 1439.99),
      day: Math.floor(num(time.day, 1, 1, 100000)),
      paused: time.paused === true,
    },
    progress: {
      xp: Math.floor(num(progress.xp, 0, 0, 1e7)),
      seeds: Math.floor(num(progress.seeds, 0, 0, 1e7)),
      chapters,
      inventory: cleanInventory(progress.inventory),
    },
    learner: cleanLearner(raw.learner),
    log: Array.isArray(raw.log)
      ? raw.log
          .filter((e): e is Record<string, unknown> => isObj(e) && typeof e.conversationId === 'string')
          .slice(-200)
          .map((e) => ({ conversationId: e.conversationId as string, npcId: str(e.npcId, ''), at: num(e.at, 0) }))
      : [],
    tips: strList(raw.tips, 100),
    chapterData: cleanChapterData(raw.chapterData),
    memories: strList(raw.memories, 50),
    cosmetics: [...new Set(strList(raw.cosmetics, 50))],
  };
}

/** Chapter state is plain JSON owned by each chapter; keep it bounded. */
function cleanChapterData(v: unknown): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  if (!isObj(v)) return out;
  for (const [k, d] of Object.entries(v)) {
    if (!isObj(d)) continue;
    try {
      const text = JSON.stringify(d);
      if (text.length <= 50_000) out[k] = JSON.parse(text) as Record<string, unknown>;
    } catch {
      /* drop unserializable data */
    }
  }
  return out;
}

/**
 * Upgrade older save versions step by step. Version 0 was the pre-release
 * layout (flat position fields); version 1 was Phase 0 (no chapter state).
 */
export function migrate(raw: unknown): { data: SaveData | null; reason?: string } {
  if (!isObj(raw)) return { data: null, reason: 'not an object' };
  let d: Record<string, unknown> = { ...raw };
  let v = typeof d.version === 'number' ? d.version : 0;
  if (v > SAVE_VERSION) return { data: null, reason: `made by a newer version (${v})` };
  if (v === 0) {
    d = {
      ...d,
      world: { scene: d.scene ?? 'hub', x: d.x, y: d.y, facing: d.facing },
      time: { minutes: d.timeMinutes, paused: d.timePaused, day: 1 },
      version: 1,
    };
    v = 1;
  }
  if (v === 1) {
    // Version 2 added per-chapter state and seen memories (both start empty).
    d = { ...d, chapterData: d.chapterData ?? {}, memories: d.memories ?? [], version: 2 };
    v = 2;
  }
  return { data: sanitize(d) };
}

// ------------------------------------------------------------ checksum

/** Small, fast string hash so a truncated or hand-damaged save is noticed. */
export function checksum(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function serialize(data: SaveData): string {
  const body = JSON.stringify(data);
  return JSON.stringify({ sum: checksum(body), body });
}

export function deserialize(text: string): { data: SaveData | null; reason?: string } {
  let outer: unknown;
  try {
    outer = JSON.parse(text);
  } catch {
    return { data: null, reason: 'not valid JSON' };
  }
  // Accept both the wrapped form and a bare save object (e.g. an old export).
  if (isObj(outer) && typeof outer.body === 'string') {
    if (outer.sum !== checksum(outer.body)) return { data: null, reason: 'checksum mismatch' };
    try {
      return migrate(JSON.parse(outer.body));
    } catch {
      return { data: null, reason: 'damaged body' };
    }
  }
  return migrate(outer);
}

// ------------------------------------------------------------ storage

export type LoadStatus = 'fresh' | 'loaded' | 'recovered' | 'unreadable';

export interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

function safeStorage(): StorageLike | null {
  try {
    const s = window.localStorage;
    const probe = '__sog_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export class SaveStore {
  private readonly storage: StorageLike | null;

  constructor(storage?: StorageLike | null) {
    this.storage = storage === undefined ? safeStorage() : storage;
  }

  get available(): boolean {
    return this.storage !== null;
  }

  hasSave(): boolean {
    try {
      return !!this.storage?.getItem(SAVE_KEY) || !!this.storage?.getItem(BACKUP_KEY);
    } catch {
      return false;
    }
  }

  /**
   * Load the main save, falling back to the backup copy. A save that can't
   * be read is set aside (never deleted) so a newer game version or a
   * grown-up can still rescue it.
   */
  load(): { data: SaveData; status: LoadStatus; reason?: string } {
    const s = this.storage;
    if (!s) return { data: freshSave(), status: 'fresh', reason: 'storage unavailable' };
    let main: string | null = null;
    let backup: string | null = null;
    try {
      main = s.getItem(SAVE_KEY);
      backup = s.getItem(BACKUP_KEY);
    } catch {
      return { data: freshSave(), status: 'fresh', reason: 'storage unavailable' };
    }
    if (!main && !backup) return { data: freshSave(), status: 'fresh' };
    if (main) {
      const r = deserialize(main);
      if (r.data) return { data: r.data, status: 'loaded' };
      this.quarantine(main);
      if (backup) {
        const b = deserialize(backup);
        if (b.data) {
          this.write(b.data);
          return { data: b.data, status: 'recovered', reason: r.reason };
        }
      }
      return { data: freshSave(), status: 'unreadable', reason: r.reason };
    }
    const b = deserialize(backup!);
    if (b.data) return { data: b.data, status: 'recovered', reason: 'main save missing' };
    return { data: freshSave(), status: 'unreadable', reason: b.reason };
  }

  save(data: SaveData, now = Date.now()): boolean {
    data.savedAt = now;
    return this.write(data);
  }

  private write(data: SaveData): boolean {
    if (!this.storage) return false;
    try {
      const text = serialize(data);
      // Keep the previous good save as the backup, then write the new one.
      const prev = this.storage.getItem(SAVE_KEY);
      if (prev && deserialize(prev).data) this.storage.setItem(BACKUP_KEY, prev);
      this.storage.setItem(SAVE_KEY, text);
      if (!prev) this.storage.setItem(BACKUP_KEY, text);
      return true;
    } catch {
      return false;
    }
  }

  private quarantine(text: string): void {
    try {
      this.storage?.setItem(QUARANTINE_KEY, text);
    } catch {
      /* storage full: nothing else we can do */
    }
  }

  /** Remove the save (after the player confirms). */
  reset(): void {
    try {
      this.storage?.removeItem(SAVE_KEY);
      this.storage?.removeItem(BACKUP_KEY);
    } catch {
      /* ignore */
    }
  }

  exportText(data: SaveData): string {
    return JSON.stringify({ game: 'seeds-of-genius', ...JSON.parse(serialize(data)) }, null, 0);
  }

  importText(text: string): { data: SaveData | null; reason?: string } {
    return deserialize(text);
  }
}
