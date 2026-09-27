import { describe, expect, it } from 'vitest';
import { BACKUP_KEY, QUARANTINE_KEY, SAVE_KEY, SaveStore, deserialize, freshSave, migrate, serialize, type StorageLike } from '../src/systems/save';

class MemStorage implements StorageLike {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

describe('save system', () => {
  it('round-trips appearance, quest items and time preference', () => {
    const mem = new MemStorage();
    const store = new SaveStore(mem);
    const d = freshSave();
    d.appearance = { skin: 'skin4', hairStyle: 'locs', hairColor: 'auburn', outfit: 'purple', accessory: 'glasses' };
    d.progress.inventory.push({ itemId: 'seed_packet', from: 'mae', obtainedAt: 1, used: false, inspected: true });
    d.time = { minutes: 21 * 60, day: 3, paused: true };
    d.world = { scene: 'room', x: 5, y: 6, facing: 'up' };
    store.save(d);
    const r = new SaveStore(mem).load();
    expect(r.status).toBe('loaded');
    expect(r.data.appearance).toEqual(d.appearance);
    expect(r.data.progress.inventory[0].itemId).toBe('seed_packet');
    expect(r.data.time).toEqual({ minutes: 1260, day: 3, paused: true });
    expect(r.data.world.scene).toBe('room');
  });

  it('keeps the schoolhouse scene and Chapter 2 data, and drops unknown scenes', () => {
    const mem = new MemStorage();
    const d = freshSave();
    d.world = { scene: 'school', x: 7, y: 7.3, facing: 'up' };
    d.chapterData.ch2 = { visited: ['reading'], skipped: ['reading'] };
    new SaveStore(mem).save(d);
    const r = new SaveStore(mem).load();
    expect(r.data.world.scene).toBe('school');
    expect(r.data.chapterData.ch2).toEqual({ visited: ['reading'], skipped: ['reading'] });
    const farm = freshSave();
    farm.world = { scene: 'farm', x: 7.9, y: 10.2, facing: 'up' };
    const memFarm = new MemStorage();
    new SaveStore(memFarm).save(farm);
    expect(new SaveStore(memFarm).load().data.world.scene).toBe('farm');
    const bad = freshSave();
    (bad.world as { scene: string }).scene = 'castle';
    const mem2 = new MemStorage();
    new SaveStore(mem2).save(bad);
    expect(new SaveStore(mem2).load().data.world.scene).toBe('hub');
  });

  it('starts fresh with no save', () => {
    expect(new SaveStore(new MemStorage()).load().status).toBe('fresh');
  });

  it('recovers from a corrupted main save using the backup', () => {
    const mem = new MemStorage();
    const store = new SaveStore(mem);
    const d = freshSave();
    d.progress.xp = 50;
    store.save(d);
    d.progress.xp = 60;
    store.save(d); // backup now holds xp 50, main xp 60
    mem.setItem(SAVE_KEY, mem.getItem(SAVE_KEY)!.slice(0, 40)); // truncate
    const r = new SaveStore(mem).load();
    expect(r.status).toBe('recovered');
    expect(r.data.progress.xp).toBe(50);
    expect(mem.getItem(QUARANTINE_KEY)).toBeTruthy(); // damaged copy kept, not deleted
  });

  it('detects tampering via checksum', () => {
    const text = serialize(freshSave());
    const tampered = text.replace('"xp\\":0', '"xp\\":999');
    expect(tampered).not.toBe(text);
    expect(deserialize(tampered).data).toBeNull();
  });

  it('reports unreadable when both copies are broken', () => {
    const mem = new MemStorage();
    mem.setItem(SAVE_KEY, '{nope');
    mem.setItem(BACKUP_KEY, 'also nope');
    expect(new SaveStore(mem).load().status).toBe('unreadable');
  });

  it('migrates a version 0 save and cleans bad values', () => {
    const r = migrate({ x: 12, y: 9, facing: 'left', timeMinutes: 99999, timePaused: true, appearance: { skin: 'purple-alien', hairStyle: 'curly' }, progress: { xp: -5, inventory: [{ itemId: 'seed_packet' }, { itemId: 'seed_packet' }, 7] } });
    expect(r.data).not.toBeNull();
    const d = r.data!;
    expect(d.version).toBe(2);
    expect(d.chapterData).toEqual({});
    expect(d.world).toMatchObject({ x: 12, y: 9, facing: 'left' });
    expect(d.time.minutes).toBeLessThan(1440);
    expect(d.time.paused).toBe(true);
    expect(d.appearance.skin).toBe('skin2'); // invalid → default
    expect(d.appearance.hairStyle).toBe('curly');
    expect(d.progress.xp).toBe(0);
    expect(d.progress.inventory).toHaveLength(1); // duplicates dropped
  });

  it('migrates a Phase 0 (version 1) save, keeping progress', () => {
    const v1 = { version: 1, appearance: { skin: 'skin4', hairStyle: 'locs', hairColor: 'black', outfit: 'red', accessory: 'cap' }, progress: { xp: 50, seeds: 10, chapters: { practice: { stage: 'complete', stepsDone: ['get_seeds'], flags: [], rewarded: true } }, inventory: [{ itemId: 'seed_packet', from: 'mae', used: true }] } };
    const d = migrate(v1).data!;
    expect(d.version).toBe(2);
    expect(d.progress.xp).toBe(50);
    expect(d.progress.chapters.practice.stage).toBe('complete');
    expect(d.chapterData).toEqual({});
    expect(d.memories).toEqual([]);
  });

  it('keeps chapter state and drops junk', () => {
    const d = migrate({ version: 2, chapterData: { ch1: { observations: [{ spot: 'beans', text: 'x' }] }, bad: 7 }, memories: ['childhood', 3] }).data!;
    expect(d.chapterData.ch1).toEqual({ observations: [{ spot: 'beans', text: 'x' }] });
    expect(d.chapterData.bad).toBeUndefined();
    expect(d.memories).toEqual(['childhood']);
  });

  it('refuses saves from a newer version instead of corrupting them', () => {
    expect(migrate({ version: 99 }).data).toBeNull();
  });

  it('imports its own export', () => {
    const store = new SaveStore(new MemStorage());
    const d = freshSave();
    d.progress.seeds = 10;
    const r = store.importText(store.exportText(d));
    expect(r.data?.progress.seeds).toBe(10);
    expect(store.importText('hello').data).toBeNull();
  });

  it('works when storage is unavailable', () => {
    const store = new SaveStore(null);
    expect(store.load().status).toBe('fresh');
    expect(store.save(freshSave())).toBe(false);
  });
});
