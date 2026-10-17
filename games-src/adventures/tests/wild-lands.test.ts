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
