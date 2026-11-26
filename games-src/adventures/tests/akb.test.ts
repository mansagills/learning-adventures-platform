import { describe, expect, it } from 'vitest';
import { biomeAt, distToRiver, isWater, onLand, RIVERS } from '../src/games/african-kingdoms-builder/africa';
import { CAST, CHAPTERS, SEASONS } from '../src/games/african-kingdoms-builder/content';
import { MOUNDS, riverX, isFlooded, zoneAt, heightAt, WATER_LEVEL } from '../src/games/african-kingdoms-builder/egyptMap';
import { hubTiles } from '../src/games/african-kingdoms-builder/hubScene';

describe('Kingdom Builders: the map of Africa', () => {
  it('puts every chapter on land, and the river kingdoms on their rivers', () => {
    for (const c of CHAPTERS) {
      expect(onLand([c.lon, c.lat]), c.name).toBe(true);
      expect(isWater([c.lon, c.lat], 0), c.name).toBe(false); // not in a lake
    }
    const at = (id: string) => CHAPTERS.find((c) => c.id === id)!;
    expect(distToRiver([at('egypt').lon, at('egypt').lat], RIVERS.nile)).toBeLessThan(1);
    expect(distToRiver([at('kush').lon, at('kush').lat], RIVERS.nile)).toBeLessThan(1);
    expect(distToRiver([at('mali').lon, at('mali').lat], RIVERS.niger)).toBeLessThan(1);
    // The highland and grassland peoples live away from the big rivers.
    for (const id of ['aksum', 'zulu', 'maasai']) expect(isWater([at(id).lon, at(id).lat]), id).toBe(false);
  });

  it('shows the big lands of Africa in the right places', () => {
    expect(biomeAt([10, 25])).toBe('desert'); // the Sahara
    expect(biomeAt([2, 15])).toBe('sahel');
    expect(biomeAt([20, 0])).toBe('rainforest'); // the Congo Basin
    expect(biomeAt([39, 10])).toBe('highland'); // Ethiopia
    expect(biomeAt([35, -5])).toBe('savanna'); // the Serengeti
    expect(biomeAt([19, -24])).toBe('dry'); // the Kalahari
  });

  it('draws the Nile as a green strip through the desert', () => {
    const tiles = hubTiles();
    const nearNile = tiles.filter((t) => t.lonlat[1] > 20 && t.lonlat[1] < 29 && distToRiver(t.lonlat, RIVERS.nile) < 1);
    expect(nearNile.length).toBeGreaterThan(5);
    expect(nearNile.every((t) => t.kind === 'oasis' || t.kind === 'water')).toBe(true);
    const farFromNile = tiles.filter((t) => t.lonlat[1] > 20 && t.lonlat[1] < 29 && t.lonlat[0] < 20);
    expect(farFromNile.filter((t) => t.kind === 'desert').length / farFromNile.length).toBeGreaterThan(0.85);
  });

  it('keeps the chapters in time order with real dates', () => {
    for (const c of CHAPTERS) {
      expect(c.from).toBeLessThan(c.to);
      if (c.today) expect(c.to).toBeGreaterThanOrEqual(2025);
    }
    expect(CHAPTERS.find((c) => c.id === 'egypt')!.from).toBe(-3100);
    expect(CHAPTERS.find((c) => c.id === 'mali')!.from).toBe(1235);
  });
});

describe('Kingdom Builders: the Nile in Egypt', () => {
  it('floods the fields in Akhet but not the villages on their mounds', () => {
    for (const m of MOUNDS) expect(isFlooded(m.x, m.z, 'akhet')).toBe(false);
    for (const z of [-20, -5, 10, 20]) {
      const x = riverX(z) + 5;
      if (zoneAt(x, z) !== 'kemet') continue;
      expect(isFlooded(x, z, 'akhet')).toBe(true);
      expect(isFlooded(x, z, 'peret')).toBe(false);
      expect(isFlooded(x, z, 'shemu')).toBe(false);
    }
  });

  it('never floods the desert or the plateau', () => {
    for (const z of [-20, 0, 20]) {
      expect(zoneAt(riverX(z) + 20, z)).toBe('deshret');
      expect(isFlooded(riverX(z) + 20, z, 'akhet')).toBe(false);
      expect(zoneAt(riverX(z) - 18, z)).toBe('plateau');
      expect(heightAt(riverX(z) - 18, z)).toBeGreaterThan(1.5);
    }
  });

  it('keeps water in the river all year, lowest at harvest time', () => {
    for (const z of [-20, 0, 20]) expect(isFlooded(riverX(z), z, 'shemu')).toBe(true);
    expect(WATER_LEVEL.shemu).toBeLessThan(WATER_LEVEL.peret);
    expect(WATER_LEVEL.peret).toBeLessThan(WATER_LEVEL.akhet);
  });
});

describe('Kingdom Builders: the words', () => {
  const words = JSON.stringify({ CHAPTERS, CAST, SEASONS });
  it('has no emoji', () => {
    expect(/\p{Extended_Pictographic}/u.test(words)).toBe(false);
  });
  it('names the three Nile seasons', () => {
    expect(Object.values(SEASONS).map((s) => s.name)).toEqual(['Akhet', 'Peret', 'Shemu']);
  });
});
