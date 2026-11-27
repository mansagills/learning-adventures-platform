import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import type { LowpolyRenderer } from '../src/kit/render/lowpolyRenderer';
import { buildMap } from '../src/games/rock-cycle-racing/map';
import { anaQuispe, beaLindqvist, blaze, boostPad, boulder, crystals, finishArch, gateArch, hoodoo, noorRahman, racer, rangerTala, scree, shrub, sioneTaufa, steamPuff } from '../src/games/rock-cycle-racing/models';
import { buildWorld } from '../src/games/rock-cycle-racing/scene';
import { buildTestTrack } from '../src/games/rock-cycle-racing/tracks';
import type { Rock } from '../src/games/rock-cycle-racing/cycle';

/**
 * The 3D pieces are drawn in a browser, but their shapes are built in plain
 * code. These tests build them without drawing, so a shape that breaks (a
 * missing piece, a point that is not a number) shows up here first.
 */

/** Just enough of the renderer for the builders: a scene to add things to. */
const fakeRenderer = () => ({ scene: new THREE.Scene() }) as unknown as LowpolyRenderer;

function badPoints(root: THREE.Object3D): number {
  let bad = 0;
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    const geo = (o as THREE.Mesh).geometry as THREE.BufferGeometry | undefined;
    const pos = geo?.getAttribute?.('position');
    if (!pos) return;
    for (let i = 0; i < pos.array.length; i++) if (!Number.isFinite(pos.array[i])) bad++;
  });
  return bad;
}

function meshCount(root: THREE.Object3D): number {
  let n = 0;
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) n++;
  });
  return n;
}

describe('Rock Cycle Racing 3D pieces', () => {
  it('builds the canyon, the volcano and the test track, in full and low detail', () => {
    for (const low of [false, true]) {
      const lp = fakeRenderer();
      const world = buildWorld(lp, buildTestTrack(), { low });
      expect(meshCount(lp.scene), `low ${low}`).toBeGreaterThan(20);
      expect(badPoints(lp.scene), `low ${low}`).toBe(0);
      expect(world.finishes.deep).toBeInstanceOf(THREE.Vector3);
      expect(world.finishes.erupt).toBeInstanceOf(THREE.Vector3);
      // A few seconds of moving parts (lava, steam, crystals) run without trouble.
      for (let i = 0; i < 30; i++) world.update(1 / 30, i / 30);
    }
  });

  it('builds the race map with its pins and labels', () => {
    const lp = fakeRenderer();
    const { pins, labels } = buildMap(lp, { low: false });
    expect(pins.length).toBeGreaterThanOrEqual(4);
    expect(labels.length).toBeGreaterThan(0);
    expect(badPoints(lp.scene)).toBe(0);
  });

  it('builds the racer in every rock form, the rival and the cast', () => {
    const forms: Rock[] = ['magma', 'granite', 'basalt', 'obsidian', 'pumice', 'sandstone', 'gravel', 'gneiss'];
    for (const rock of forms) {
      const r = racer(0.62, { light: true });
      r.setForm(rock);
      r.setHeat(rock === 'magma' ? 1 : 0);
      expect(badPoints(r.group), rock).toBe(0);
    }
    const all = [blaze().group, anaQuispe().group, noorRahman().group, beaLindqvist().group, sioneTaufa().group, rangerTala().group, scree()];
    for (const o of all) {
      expect(meshCount(o)).toBeGreaterThan(0);
      expect(badPoints(o)).toBe(0);
    }
  });

  it('builds the track props', () => {
    const props: THREE.Object3D[] = [crystals(3), boostPad(), gateArch(10), finishArch(10), boulder(4, 1.5, 0xa8462a), hoodoo(5, 6), shrub(6), steamPuff()];
    for (const o of props) expect(badPoints(o)).toBe(0);
  });
});
