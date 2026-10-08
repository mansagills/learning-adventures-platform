import { describe, expect, it } from 'vitest';
import type { PixelBuffer } from '../src/kit/art/pixel';
import { SETTINGS, WORLD_STYLES, settingById, settingsIn } from '../src/kit/worlds';
import { ANCIENT_HOST, FORUM_HOST, PLAYER16, STATION_HOST, paintHero, paintPortrait16, size16, type Dir16 } from '../src/kit/worlds/hero16';
import { ramp, toHsl } from '../src/kit/worlds/shade';
import { paintArch, paintBrazier, paintFountain, paintForumBuildings, paintRomanStall, paintStatue } from '../src/kit/worlds/ancient-kingdoms/forum';
import { paintStall, paintTorch } from '../src/kit/worlds/ancient-kingdoms/art';
import { paintBeacon, paintCritter, paintCrystals, paintHabitat, paintMushroomTree, paintRover } from '../src/kit/worlds/star-station/planet';
import { paintConsole, paintDrone } from '../src/kit/worlds/star-station/art';

const painted = (b: PixelBuffer) => b.px.filter((c) => c !== null).length;
const HEX = /^#[0-9a-f]{6}$/;
const allHex = (b: PixelBuffer) => b.px.every((c) => c === null || HEX.test(c));

describe('world styles', () => {
  it('the new worlds use the owner-approved standard: 24 px per tile and 16-bit characters', () => {
    for (const id of ['star-station', 'ancient-kingdoms'] as const) {
      expect(WORLD_STYLES[id].px).toBe(24);
      expect(WORLD_STYLES[id].characters).toBe('16bit');
      expect(WORLD_STYLES[id].music).toBeDefined();
    }
  });

  it('Sunny Town keeps today’s 16 px tiles and classic characters', () => {
    expect(WORLD_STYLES['sunny-town'].px).toBe(16);
    expect(WORLD_STYLES['sunny-town'].characters).toBe('classic');
    expect(settingsIn('sunny-town')).toHaveLength(0);
  });

  it('evenings are never brighter than days', () => {
    for (const s of Object.values(WORLD_STYLES)) s.tint.evening.forEach((v, i) => expect(v).toBeLessThanOrEqual(s.tint.day[i]));
  });

  it('every world song has one chord and one bass note per bar and 8 melody steps per bar', () => {
    for (const s of Object.values(WORLD_STYLES)) {
      if (!s.music) continue;
      expect(s.music.bass).toHaveLength(s.music.chords.length);
      expect(s.music.melody.length % 8).toBe(0);
    }
  });
});

describe('world settings', () => {
  it('have unique ids, belong to a new world, and each world has at least two settings', () => {
    const ids = SETTINGS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SETTINGS) expect(['star-station', 'ancient-kingdoms']).toContain(s.world);
    expect(settingsIn('star-station').length).toBeGreaterThanOrEqual(2);
    expect(settingsIn('ancient-kingdoms').length).toBeGreaterThanOrEqual(2);
    expect(settingById('roman-forum').name).toBe('Roman forum');
    expect(() => settingById('nowhere')).toThrow();
  });

  it('historical settings list the sources their details were checked against', () => {
    for (const s of settingsIn('ancient-kingdoms')) {
      expect(s.inspiredBy.length).toBeGreaterThan(20);
      expect(s.sources?.length ?? 0).toBeGreaterThan(0);
    }
  });
});

describe('the 16-bit painter', () => {
  it('makes 5 shades per color, darkest first, with the base color in the middle', () => {
    for (const base of ['#2f9a94', '#c9844c', '#7a4a2e', '#e7ecf6']) {
      const r = ramp(base);
      expect(r).toHaveLength(5);
      expect(r[2]).toBe(base);
      for (let i = 1; i < 5; i++) expect(toHsl(r[i])[2]).toBeGreaterThan(toHsl(r[i - 1])[2]);
    }
  });

  it('paints characters at the chosen standard (24x36 children, 24x42 adults) in every direction', () => {
    expect(size16(PLAYER16, 1.5)).toEqual({ w: 24, h: 36 });
    expect(size16(STATION_HOST, 1.5)).toEqual({ w: 24, h: 42 });
    const dirs: Dir16[] = ['down', 'left', 'right', 'up'];
    for (const look of [PLAYER16, STATION_HOST, ANCIENT_HOST, FORUM_HOST])
      for (const d of dirs)
        for (let w = 0; w < 4; w++) {
          const b = paintHero(look, 1.5, d, { walk: w });
          expect([b.w, b.h]).toEqual([size16(look, 1.5).w, size16(look, 1.5).h]);
          expect(painted(b)).toBeGreaterThan(b.w * b.h * 0.25);
          expect(allHex(b)).toBe(true);
        }
  });

  it('a blink changes the face, and the portraits are 72x72', () => {
    const open = paintHero(PLAYER16, 1.5, 'down');
    const shut = paintHero(PLAYER16, 1.5, 'down', { blink: true });
    expect(open.px.join()).not.toBe(shut.px.join());
    const p = paintPortrait16(FORUM_HOST, 'smile');
    expect([p.w, p.h]).toEqual([72, 72]);
  });

  it('paints every new prop at 24 px per tile with only solid colors', () => {
    const T = 24;
    const props: PixelBuffer[] = [
      paintArch(T),
      paintBrazier(T, 1),
      paintFountain(T, 2),
      paintStatue(T),
      paintRomanStall(T),
      paintStall(T),
      paintTorch(T),
      paintHabitat(T, 1),
      paintRover(T),
      paintBeacon(T),
      paintCrystals(T, 1),
      paintMushroomTree(T, 2),
      paintCritter(T, 1),
      paintConsole(T),
      paintDrone(T),
    ];
    for (const b of props) {
      expect(b.w % 3).toBe(0); // designs are on a 16-per-tile grid, scaled by 1.5
      expect(painted(b)).toBeGreaterThan(50);
      expect(allHex(b)).toBe(true);
    }
    const row = paintForumBuildings(T);
    expect(row.w).toBe(26 * T);
  });
});
