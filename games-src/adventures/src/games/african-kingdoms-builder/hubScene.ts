import * as THREE from 'three';
import type { LowpolyRenderer } from '../../kit/render/lowpolyRenderer';
import { ModelBuilder, mat, rand } from '../../kit/world/lowpoly/shapes';
import { BIOME_COLOR, RIVERS, biomeAt, distToRiver, heightAt, isWater, onLand, toScene, type LonLat } from './africa';
import { CHAPTERS, type Chapter } from './content';
import { C, acacia, datePalm, miniPyramids, rainforestTree } from './models';

/**
 * The hub: Africa as a board of hexagon tiles, colored by the kind of land,
 * with the rivers and lakes, small trees, and a pin for every chapter.
 */

export const HEX_R = 0.6;

export interface HubTile {
  lonlat: LonLat;
  x: number;
  z: number;
  h: number;
  kind: keyof typeof BIOME_COLOR;
}

/** Every hex tile of the continent (pure: used by the scene and the tests). */
export function hubTiles(): HubTile[] {
  const tiles: HubTile[] = [];
  const dx = Math.sqrt(3) * HEX_R;
  const dz = 1.5 * HEX_R;
  let row = 0;
  for (let lat = 38; lat > -36; lat -= dz, row++) {
    for (let lon = -19 + (row % 2 ? dx / 2 : 0); lon < 52; lon += dx) {
      const p: LonLat = [lon, lat];
      if (!onLand(p)) continue;
      const { x, z } = toScene(p);
      if (isWater(p)) {
        tiles.push({ lonlat: p, x, z, h: 0.16, kind: 'water' });
        continue;
      }
      let kind: HubTile['kind'] = biomeAt(p);
      // The green strip along the Nile through the desert.
      if ((kind === 'desert' || kind === 'sahel') && distToRiver(p, RIVERS.nile) < 1.25) kind = 'oasis';
      if (kind === 'sahel' && distToRiver(p, RIVERS.niger) < 1.1) kind = 'oasis';
      tiles.push({ lonlat: p, x, z, h: heightAt(p), kind });
    }
  }
  return tiles;
}

function instanced(geo: THREE.BufferGeometry, color: number, list: THREE.Matrix4[]): THREE.InstancedMesh {
  const m = new THREE.InstancedMesh(geo, mat(color), list.length);
  list.forEach((mx, i) => m.setMatrixAt(i, mx));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Copy a small model onto many spots, one InstancedMesh per color part. */
function scatter(model: THREE.Group, spots: THREE.Matrix4[], into: THREE.Group): void {
  if (!spots.length) return;
  for (const child of model.children) {
    if (!(child instanceof THREE.Mesh)) continue;
    const color = (child.material as THREE.MeshStandardMaterial).color.getHex();
    into.add(instanced(child.geometry, color, spots));
  }
}

export interface HubPin {
  chapter: Chapter;
  /** World position of the top of the pin (for the label). */
  top: THREE.Vector3;
  group: THREE.Group;
}

export function buildHub(lp: LowpolyRenderer): { pins: HubPin[]; tiles: HubTile[] } {
  const root = new THREE.Group();
  lp.scene.add(root);

  // The ocean: a soft blue table with a lighter band near the coast.
  const ocean = new THREE.Mesh(new THREE.CircleGeometry(240, 48), mat(0x5aa7c9, { roughness: 0.5 }));
  ocean.rotation.x = -Math.PI / 2;
  ocean.receiveShadow = true;
  root.add(ocean);

  const tiles = hubTiles();
  const hex = new THREE.CylinderGeometry(HEX_R * 0.985, HEX_R * 0.985, 1, 6);
  hex.translate(0, 0.5, 0);
  const mesh = new THREE.InstancedMesh(hex, new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), tiles.length);
  const m = new THREE.Matrix4();
  const col = new THREE.Color();
  const r = rand(5);
  tiles.forEach((t, i) => {
    m.compose(new THREE.Vector3(t.x, 0, t.z), new THREE.Quaternion(), new THREE.Vector3(1, t.h * 1.6, 1));
    mesh.setMatrixAt(i, m);
    col.set(BIOME_COLOR[t.kind]).offsetHSL(0, (r() - 0.5) * 0.04, (r() - 0.5) * 0.05);
    // Snow on top of Kilimanjaro.
    if (t.h > 1.15) col.set(0xf4f4f2);
    mesh.setColorAt(i, col);
  });
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  root.add(mesh);

  // Little trees and palms on some tiles, so each land is easy to tell apart.
  const spots: Record<string, THREE.Matrix4[]> = { forest: [], acacia: [], palm: [], olive: [] };
  for (const t of tiles) {
    const top = t.h * 1.6;
    const s = 0.42 + r() * 0.15;
    const mx = () => new THREE.Matrix4().compose(new THREE.Vector3(t.x + (r() - 0.5) * 0.4, top, t.z + (r() - 0.5) * 0.4), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 6, 0)), new THREE.Vector3(s, s, s));
    if (t.kind === 'rainforest' && r() < 0.6) spots.forest.push(mx());
    else if (t.kind === 'savanna' && r() < 0.14) spots.acacia.push(mx());
    else if (t.kind === 'oasis' && r() < 0.3) spots.palm.push(mx());
    else if ((t.kind === 'mediterranean' || t.kind === 'highland' || t.kind === 'fynbos') && r() < 0.16) spots.olive.push(mx());
  }
  scatter(rainforestTree(3), spots.forest, root);
  scatter(acacia(4), spots.acacia, root);
  scatter(datePalm(5, 1.6), spots.palm, root);
  scatter(new ModelBuilder().cyl(C.woodDark, 0.05, 0.07, 0.5, 5).ball(C.olive, 0.4, 0, { y: 0.7 }).build(), spots.olive, root);

  // The pyramids at Giza, as a landmark.
  const giza = toScene([31.1, 29.9]);
  const pyr = miniPyramids();
  pyr.scale.setScalar(0.55);
  pyr.position.set(giza.x - 0.7, heightAt([31.1, 29.9]) * 1.6, giza.z + 0.2);
  root.add(pyr);

  // Pins for the chapters.
  const pins: HubPin[] = CHAPTERS.map((chapter, i) => {
    const { x, z } = toScene([chapter.lon, chapter.lat]);
    const base = heightAt([chapter.lon, chapter.lat]) * 1.6;
    const color = new THREE.Color(chapter.color).getHex();
    const group = new ModelBuilder()
      .cyl(0xf6f1e6, 0.06, 0.06, 1.6, 6)
      .ball(color, 0.38, 1, { y: 1.85 })
      .cyl(color, 0.5, 0.5, 0.06, 12, { y: 0 })
      .build();
    group.position.set(x, base, z);
    root.add(group);
    const top = new THREE.Vector3(x, base + 2.4, z);
    lp.onFrame((_dt, t) => {
      group.position.y = base + Math.abs(Math.sin(t * 1.6 + i)) * 0.12;
    });
    return { chapter, top, group };
  });

  return { pins, tiles };
}
