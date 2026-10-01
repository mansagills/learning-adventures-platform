import { hash2 } from '../core/rng';
import { P } from './palette';
import { TILE_PX, type GroundKind, type MapDef } from '../world/map';

/**
 * Paints a map's whole ground into one canvas (16 px per tile). One texture
 * for the ground keeps draw calls tiny. Edges between ground kinds get soft
 * pixel fringes so paths and ponds look hand-placed rather than gridded.
 */
export function paintGround(map: MapDef, seed = 7): HTMLCanvasElement {
  const T = TILE_PX;
  const cv = document.createElement('canvas');
  cv.width = map.w * T;
  cv.height = map.h * T;
  const ctx = cv.getContext('2d')!;
  const at = (x: number, y: number): GroundKind | null =>
    x < 0 || y < 0 || x >= map.w || y >= map.h ? null : map.ground[y][x];

  const px = (x: number, y: number, c: string) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, 1, 1);
  };

  for (let ty = 0; ty < map.h; ty++)
    for (let tx = 0; tx < map.w; tx++) {
      const k = map.ground[ty][tx];
      const ox = tx * T;
      const oy = ty * T;
      const r = (i: number) => hash2(tx * 31 + i, ty * 17 + i * 3, seed);
      switch (k) {
        case 'grass':
        case 'flowers': {
          ctx.fillStyle = mixGrass(r(0));
          ctx.fillRect(ox, oy, T, T);
          for (let i = 0; i < 6; i++) {
            const x = ox + Math.floor(r(i + 1) * 15);
            const y = oy + Math.floor(r(i + 9) * 14) + 1;
            px(x, y, P.grass2);
            px(x + 1, y - 1, P.grass2);
          }
          for (let i = 0; i < 3; i++) px(ox + Math.floor(r(i + 20) * 16), oy + Math.floor(r(i + 30) * 16), P.grass3);
          if (k === 'flowers' || r(40) > 0.9) {
            const colors = [P.flowerRed, P.flowerYellow, P.flowerWhite, P.flowerPink, P.flowerPurple, P.flowerBlue];
            const n = k === 'flowers' ? 5 : 1;
            for (let i = 0; i < n; i++) {
              const x = ox + 2 + Math.floor(r(i + 50) * 12);
              const y = oy + 2 + Math.floor(r(i + 60) * 12);
              const c = colors[Math.floor(r(i + 70) * colors.length)];
              px(x, y - 1, c);
              px(x - 1, y, c);
              px(x + 1, y, c);
              px(x, y + 1, c);
              px(x, y, P.flowerYellow === c ? P.flowerWhite : P.flowerYellow);
            }
          }
          break;
        }
        case 'path': {
          ctx.fillStyle = P.path1;
          ctx.fillRect(ox, oy, T, T);
          for (let i = 0; i < 7; i++) px(ox + Math.floor(r(i) * 16), oy + Math.floor(r(i + 7) * 16), i % 3 ? P.path2 : P.path3);
          break;
        }
        case 'cobble': {
          ctx.fillStyle = P.cobble2;
          ctx.fillRect(ox, oy, T, T);
          // Offset rows of rounded stones.
          for (let row = 0; row < 4; row++) {
            const shift = row % 2 ? 4 : 0;
            for (let col = -1; col < 3; col++) {
              const sx = ox + col * 8 + shift;
              const sy = oy + row * 4;
              const c = hash2(tx * 4 + col, ty * 4 + row, seed) > 0.5 ? P.cobble1 : P.cobble3;
              ctx.fillStyle = c;
              ctx.fillRect(Math.max(ox, sx + 1), sy + 1, Math.min(6, ox + T - sx - 1), 2);
              ctx.fillRect(Math.max(ox, sx + 2), sy, Math.min(4, ox + T - sx - 2), 1);
            }
          }
          break;
        }
        case 'water': {
          ctx.fillStyle = P.water1;
          ctx.fillRect(ox, oy, T, T);
          for (let i = 0; i < 3; i++) {
            const x = ox + Math.floor(r(i) * 12);
            const y = oy + Math.floor(r(i + 3) * 14);
            ctx.fillStyle = P.water2;
            ctx.fillRect(x, y, 4, 1);
          }
          // Lily pads (a notched green circle, sometimes with a flower).
          if (r(9) > 0.72) {
            const lx = ox + 3 + Math.floor(r(10) * 7);
            const ly = oy + 3 + Math.floor(r(11) * 7);
            ctx.fillStyle = P.leaf1;
            ctx.fillRect(lx, ly + 1, 6, 3);
            ctx.fillRect(lx + 1, ly, 4, 5);
            ctx.fillStyle = P.leaf2;
            ctx.fillRect(lx + 1, ly + 1, 3, 2);
            ctx.fillStyle = P.water1;
            ctx.fillRect(lx + 3, ly, 1, 2);
            if (r(12) > 0.5) {
              ctx.fillStyle = P.flowerPink;
              ctx.fillRect(lx + 1, ly + 1, 2, 2);
              ctx.fillStyle = P.white;
              ctx.fillRect(lx + 1, ly + 1, 1, 1);
            }
          }
          break;
        }
        case 'soil':
        case 'field': {
          ctx.fillStyle = P.soil1;
          ctx.fillRect(ox, oy, T, T);
          for (let row = 0; row < T; row += 4) {
            ctx.fillStyle = P.soil2;
            ctx.fillRect(ox, oy + row + 2, T, 1);
            ctx.fillStyle = P.soil3;
            ctx.fillRect(ox, oy + row, T, 1);
          }
          for (let i = 0; i < 4; i++) px(ox + Math.floor(r(i) * 16), oy + Math.floor(r(i + 4) * 16), P.soil3);
          break;
        }
        case 'gully': {
          // Hillside where rain has cut a channel: pale soil with a dark, washed-out groove.
          ctx.fillStyle = '#b89468';
          ctx.fillRect(ox, oy, T, T);
          ctx.fillStyle = '#7a5a3c';
          ctx.fillRect(ox + 5, oy, 6, T);
          ctx.fillStyle = '#5e4430';
          ctx.fillRect(ox + 7, oy, 2, T);
          for (let i = 0; i < 3; i++) px(ox + 4 + Math.floor(r(i) * 8), oy + Math.floor(r(i + 5) * 16), '#cdb088');
          break;
        }
        case 'dryfield': {
          // Tired, pale soil: a dusty crust with cracks and few furrows.
          ctx.fillStyle = '#b89468';
          ctx.fillRect(ox, oy, T, T);
          for (let row = 0; row < T; row += 4) {
            ctx.fillStyle = '#a4815a';
            ctx.fillRect(ox, oy + row + 2, T, 1);
          }
          ctx.fillStyle = '#8a6a48';
          const cx = ox + 2 + Math.floor(r(1) * 10);
          const cy = oy + 2 + Math.floor(r(2) * 10);
          ctx.fillRect(cx, cy, 3, 1);
          ctx.fillRect(cx + 2, cy + 1, 1, 2);
          ctx.fillRect(cx + 3, cy + 3, 2, 1);
          for (let i = 0; i < 4; i++) px(ox + Math.floor(r(i + 3) * 16), oy + Math.floor(r(i + 8) * 16), '#cdb088');
          break;
        }
        case 'floor': {
          ctx.fillStyle = P.wood3;
          ctx.fillRect(ox, oy, T, T);
          ctx.fillStyle = P.wood1;
          for (let row = 0; row < T; row += 4) ctx.fillRect(ox, oy + row + 3, T, 1);
          const seam = (ty * 5 + tx * 3) % 16;
          ctx.fillRect(ox + seam, oy, 1, 4);
          ctx.fillRect(ox + ((seam + 8) % 16), oy + 4, 1, 4);
          ctx.fillRect(ox + ((seam + 4) % 16), oy + 8, 1, 4);
          ctx.fillRect(ox + ((seam + 12) % 16), oy + 12, 1, 4);
          break;
        }
        case 'rug': {
          ctx.fillStyle = '#b8483e';
          ctx.fillRect(ox, oy, T, T);
          ctx.fillStyle = '#e2c27a';
          if (at(tx - 1, ty) !== 'rug') ctx.fillRect(ox + 1, oy, 1, T);
          if (at(tx + 1, ty) !== 'rug') ctx.fillRect(ox + T - 2, oy, 1, T);
          if (at(tx, ty - 1) !== 'rug') ctx.fillRect(ox, oy + 1, T, 1);
          if (at(tx, ty + 1) !== 'rug') ctx.fillRect(ox, oy + T - 2, T, 1);
          ctx.fillStyle = '#963a33';
          for (let i = 3; i < T - 3; i += 4) ctx.fillRect(ox + i, oy + 7, 2, 2);
          break;
        }
        case 'wall': {
          ctx.fillStyle = P.woodDark;
          ctx.fillRect(ox, oy, T, T);
          break;
        }
      }
    }

  // Fringes: grass tufts spilling over paths and soil, foam around water.
  for (let ty = 0; ty < map.h; ty++)
    for (let tx = 0; tx < map.w; tx++) {
      const k = map.ground[ty][tx];
      const ox = tx * T;
      const oy = ty * T;
      const isGrassy = (g: GroundKind | null) => g === 'grass' || g === 'flowers';
      if (k === 'path' || k === 'cobble' || k === 'soil' || k === 'field' || k === 'dryfield' || k === 'gully') {
        const sides: Array<[number, number, (i: number) => [number, number]]> = [
          [0, -1, (i) => [ox + i, oy]],
          [0, 1, (i) => [ox + i, oy + T - 1]],
          [-1, 0, (i) => [ox, oy + i]],
          [1, 0, (i) => [ox + T - 1, oy + i]],
        ];
        for (const [dx, dy, pos] of sides) {
          if (!isGrassy(at(tx + dx, ty + dy))) continue;
          for (let i = 0; i < T; i++) {
            if (hash2(tx * 16 + i, ty * 16 + dx * 3 + dy * 7, seed + 3) > 0.55) {
              const [x, y] = pos(i);
              px(x, y, P.grass2);
            }
          }
        }
      }
      if (k === 'water') {
        ctx.fillStyle = P.waterEdge;
        if (at(tx, ty - 1) !== 'water') ctx.fillRect(ox, oy, T, 2);
        if (at(tx - 1, ty) !== 'water') ctx.fillRect(ox, oy, 1, T);
        if (at(tx + 1, ty) !== 'water') ctx.fillRect(ox + T - 1, oy, 1, T);
        ctx.fillStyle = P.water3;
        if (at(tx, ty + 1) !== 'water') ctx.fillRect(ox, oy + T - 2, T, 2);
        // Round off outer corners so the pond reads as a pond, not a box.
        const corners: Array<[number, number]> = [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ];
        for (const [dx, dy] of corners) {
          if (at(tx + dx, ty) === 'water' || at(tx, ty + dy) === 'water') continue;
          for (let j = 0; j < 6; j++)
            for (let i = 0; i < 6; i++) {
              if (Math.hypot(5.5 - i, 5.5 - j) <= 5.5) continue;
              const x = ox + (dx < 0 ? i : T - 1 - i);
              const y = oy + (dy < 0 ? j : T - 1 - j);
              px(x, y, P.grass1);
            }
        }
      }
    }

  // Soft contact shadows at the foot of every building's front wall.
  ctx.fillStyle = 'rgba(40, 30, 40, 0.22)';
  for (const b of map.buildings) ctx.fillRect(b.x * T, (b.y + b.d) * T, b.w * T, 3);
  return cv;
}

function mixGrass(v: number): string {
  return v > 0.9 ? P.grass3 : P.grass1;
}
