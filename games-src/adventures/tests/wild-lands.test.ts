import { describe, expect, it } from 'vitest';
import { WORLD_STYLES } from '../src/kit/worlds/styles';
import { OCEAN_ZONES, depthAtRow, rowOfDepth, sunlightAt, viewSpan } from '../src/kit/worlds/wild-lands/ocean';
import { WILD_LANDS } from '../src/kit/worlds/wild-lands/style';

describe('Wild Lands (look development)', () => {
  it('uses the 16-bit style of the other new worlds', () => {
    expect(WILD_LANDS.px).toBe(24);
    expect(WILD_LANDS.characters).toBe('16bit');
    expect(Object.keys(WILD_LANDS.glow)).toEqual(expect.arrayContaining(['firefly', 'mushroom', 'plankton']));
  });

  it('stays out of the shared world list until the look is approved', () => {
    expect(Object.keys(WORLD_STYLES)).not.toContain('wild-lands');
  });

  it('names the ocean zones in order, with no gaps (sunlight 0-200 m, twilight to 1000 m, midnight to 4000 m)', () => {
    expect(OCEAN_ZONES.map((z) => z.id)).toEqual(['sunlight', 'twilight', 'midnight']);
    expect(OCEAN_ZONES[0].top).toBe(0);
    for (let i = 1; i < OCEAN_ZONES.length; i++) expect(OCEAN_ZONES[i].top).toBe(OCEAN_ZONES[i - 1].bottom);
    expect(OCEAN_ZONES.map((z) => z.bottom)).toEqual([200, 1000, 4000]);
    for (const z of OCEAN_ZONES) expect(z.view).toBeGreaterThanOrEqual(z.top);
  });

  it('lets less sunlight through the deeper you go, and none in the midnight zone', () => {
    let last = 2;
    for (let m = 0; m <= 1200; m += 25) {
      expect(sunlightAt(m)).toBeLessThanOrEqual(last);
      last = sunlightAt(m);
    }
    expect(sunlightAt(0)).toBe(1);
    expect(sunlightAt(200)).toBeLessThan(0.2);
    expect(sunlightAt(1000)).toBe(0);
  });

  it('maps screen rows to depths and back', () => {
    for (const depth of [27, 520, 1900]) {
      expect(depthAtRow(110, 220, depth)).toBeCloseTo(depth);
      expect(rowOfDepth(depthAtRow(40, 220, depth), 220, depth)).toBeCloseTo(40);
      expect(viewSpan(depth)).toBeGreaterThanOrEqual(60);
    }
  });
});

import { CLIFF_LAYERS, DIG_LAYOUT, DIG_SITE, DIG_SPOTS, QUARRY, SLAB } from '../src/kit/worlds/wild-lands/dig';
import { FOSSIL_IDS, SKELETON_PARTS, glowsUnderUV, paintFossil, paintSkeleton } from '../src/kit/worlds/wild-lands/dig-art';
import { LAYER_FOSSILS, sampleQuarry } from '../src/kit/worlds/wild-lands/dig-views';

describe('the dig site (Fossil Dig Adventure, look development)', () => {
  it('is a Wild Lands setting that stays out of the shared list', () => {
    expect(DIG_SITE.world).toBe('wild-lands');
    expect(DIG_SITE.id).toBe('dig-site');
  });

  it('stacks the cliff’s five layers oldest at the bottom, filling the whole cliff', () => {
    expect(CLIFF_LAYERS.map((l) => l.id)).toEqual(['sea', 'swamp', 'river', 'ice', 'today']);
    expect(CLIFF_LAYERS.reduce((a, l) => a + l.h, 0)).toBeCloseTo(1);
    // sea animals in the oldest layer, mammoths near the top, nothing in today's soil
    expect(LAYER_FOSSILS.sea).toContain('trilobite');
    expect(LAYER_FOSSILS.ice).toContain('mammoth-tusk');
    expect(LAYER_FOSSILS.today).toEqual([]);
  });

  it('has 16 different fossils, each painted, and only some glow under ultraviolet light', () => {
    expect(new Set(FOSSIL_IDS).size).toBe(16);
    for (const id of FOSSIL_IDS) {
      const b = paintFossil(id, 1);
      let filled = 0;
      for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) if (b.get(x, y)) filled++;
      expect(filled, id).toBeGreaterThan(20);
    }
    const glowing = FOSSIL_IDS.filter(glowsUnderUV);
    expect(glowing.length).toBeGreaterThan(8);
    expect(glowing.length).toBeLessThan(16);
    expect(glowsUnderUV('coprolite')).toBe(false);
  });

  it('builds the Triceratops from four parts', () => {
    expect(SKELETON_PARTS).toEqual(['skull', 'backbone', 'legs', 'tail']);
    expect(paintSkeleton(1, []).w).toBe(paintSkeleton(1).w);
  });

  it('keeps every station and person on the map, with the quarry and the slab on the ground', () => {
    for (const [k, s] of Object.entries(DIG_SPOTS)) {
      expect(s.x, k).toBeGreaterThan(0);
      expect(s.x, k).toBeLessThan(DIG_LAYOUT.w);
      expect(s.y, k).toBeGreaterThan(DIG_LAYOUT.floorTop);
      expect(s.y, k).toBeLessThan(DIG_LAYOUT.h);
    }
    expect(QUARRY.x1).toBeGreaterThan(QUARRY.x0 + 4);
    expect(SLAB.y1).toBeLessThan(DIG_LAYOUT.h - 2);
    expect(sampleQuarry().length).toBe(48);
  });
});
