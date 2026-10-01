import type { MapDef, PropDef } from './map';

/** Tiles a prop occupies, relative to its (x, y). */
export function propFootprint(p: PropDef): Array<[number, number]> {
  if (p.solid === false) return [];
  switch (p.kind) {
    case 'well':
      return [[0, 0], [1, 0], [0, 1], [1, 1]];
    case 'stall':
    case 'bench':
    case 'wagon':
    case 'cow':
    case 'fairtable':
      return [[0, 0], [1, 0]];
    case 'leaves':
      return [];
    case 'crop':
    case 'reeds':
      return [];
    default:
      return [[0, 0]];
  }
}

/**
 * Which tiles are walkable. Built once per map from its data; NPCs add
 * themselves as dynamic blockers so the player can't walk through them.
 */
export class CollisionGrid {
  readonly w: number;
  readonly h: number;
  private readonly solid: Uint8Array;
  private readonly dynamic = new Set<string>();
  /** Round "personal space" around characters, so the player never stands on top of them. */
  private readonly circles = new Map<string, { x: number; y: number; r: number }>();

  constructor(map: MapDef) {
    this.w = map.w;
    this.h = map.h;
    this.solid = new Uint8Array(map.w * map.h);
    for (let y = 0; y < map.h; y++)
      for (let x = 0; x < map.w; x++) {
        const g = map.ground[y][x];
        if (g === 'water' || g === 'wall') this.solid[y * map.w + x] = 1;
      }
    for (const b of map.buildings)
      for (let y = b.y; y < b.y + b.d; y++) for (let x = b.x; x < b.x + b.w; x++) this.mark(x, y);
    for (const p of map.props) for (const [dx, dy] of propFootprint(p)) this.mark(p.x + dx, p.y + dy);
    map.blocked.forEach((k) => {
      const [x, y] = k.split(',').map(Number);
      this.mark(x, y);
    });
  }

  private mark(x: number, y: number): void {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.solid[y * this.w + x] = 1;
  }

  setDynamic(key: string, tiles: Array<[number, number]>): void {
    // key is unused beyond grouping; tiles are stored as "x,y".
    void key;
    tiles.forEach(([x, y]) => this.dynamic.add(`${x},${y}`));
  }

  clearDynamic(): void {
    this.dynamic.clear();
    this.circles.clear();
  }

  setBlocker(key: string, x: number, y: number, r: number): void {
    this.circles.set(key, { x, y, r });
  }

  private inCircle(x: number, y: number, r: number): boolean {
    for (const c of this.circles.values()) if (Math.hypot(x - c.x, y - c.y) < c.r + r) return true;
    return false;
  }

  /** For route planning: walls plus the tiles characters stand on. */
  isSolid(tx: number, ty: number): boolean {
    return this.isWall(tx, ty) || this.dynamic.has(`${tx},${ty}`);
  }

  /** For movement: only real walls (characters are round blockers instead). */
  isWall(tx: number, ty: number): boolean {
    if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return true;
    return this.solid[ty * this.w + tx] === 1;
  }

  /** Is a circle of radius r centred at (x, y) (tile units) free? */
  isFree(x: number, y: number, r: number): boolean {
    const x0 = Math.floor(x - r);
    const x1 = Math.floor(x + r);
    const y0 = Math.floor(y - r);
    const y1 = Math.floor(y + r);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.isWall(tx, ty)) return false;
    return !this.inCircle(x, y, r);
  }

  /**
   * Move with sliding: try x and y separately so the player glides along
   * walls instead of sticking to them.
   */
  move(x: number, y: number, dx: number, dy: number, r: number): { x: number; y: number } {
    const tileFree = (px: number, py: number) => {
      const x0 = Math.floor(px - r);
      const x1 = Math.floor(px + r);
      const y0 = Math.floor(py - r);
      const y1 = Math.floor(py + r);
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.isWall(tx, ty)) return false;
      return true;
    };
    let nx = x;
    let ny = y;
    if (dx !== 0 && tileFree(x + dx, y)) nx = x + dx;
    if (dy !== 0 && tileFree(nx, y + dy)) ny = y + dy;
    // Slide around characters: push out of their circle along its edge.
    for (const c of this.circles.values()) {
      const ox = nx - c.x;
      const oy = ny - c.y;
      const d = Math.hypot(ox, oy);
      const min = c.r + r;
      if (d < min) {
        const k = d > 1e-6 ? min / d : 1;
        const px = c.x + (d > 1e-6 ? ox * k : 0);
        const py = c.y + (d > 1e-6 ? oy * k : min);
        nx = px;
        ny = py;
        // Head-on bump: steer around the character's front (south) side
        // instead of stopping dead, like corner correction in 2D RPGs.
        const step = Math.hypot(dx, dy);
        if (Math.hypot(nx - x, ny - y) < step * 0.3 && d > 1e-6) {
          const nxn = ox / d;
          const nyn = oy / d;
          let tx = -nyn;
          let ty = nxn;
          if (ty < 0 || (ty === 0 && tx * dx < 0)) {
            tx = -tx;
            ty = -ty;
          }
          const sx = c.x + (nxn + tx * 0.35 * (step / min)) * min;
          const sy = c.y + (nyn + ty * 0.35 * (step / min)) * min;
          const sd = Math.hypot(sx - c.x, sy - c.y);
          nx = c.x + ((sx - c.x) / sd) * min;
          ny = c.y + ((sy - c.y) / sd) * min;
        }
        if (!tileFree(nx, ny)) {
          nx = x;
          ny = y;
        }
      }
    }
    return { x: nx, y: ny };
  }
}

/**
 * A* over tiles, 8 directions without cutting corners. Returns tile centres
 * from the tile after the start to the goal, or null if unreachable.
 */
export function findPath(
  grid: CollisionGrid,
  from: { x: number; y: number },
  to: { x: number; y: number },
  opts: { allowGoalSolid?: boolean; maxNodes?: number } = {},
): Array<{ x: number; y: number }> | null {
  const sx = Math.floor(from.x);
  const sy = Math.floor(from.y);
  let gx = Math.floor(to.x);
  let gy = Math.floor(to.y);
  if (grid.isSolid(gx, gy) && !opts.allowGoalSolid) {
    // Walk to the nearest free neighbour of a solid goal (an NPC, a sign).
    const n = nearestFree(grid, gx, gy, sx, sy);
    if (!n) return null;
    [gx, gy] = n;
  }
  const W = grid.w;
  const key = (x: number, y: number) => y * W + x;
  const open: number[] = [key(sx, sy)];
  const gScore = new Map<number, number>([[key(sx, sy), 0]]);
  const fScore = new Map<number, number>([[key(sx, sy), heur(sx, sy, gx, gy)]]);
  const came = new Map<number, number>();
  const closed = new Set<number>();
  const max = opts.maxNodes ?? 4000;
  let expanded = 0;

  while (open.length && expanded++ < max) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if ((fScore.get(open[i]) ?? 1e9) < (fScore.get(open[bi]) ?? 1e9)) bi = i;
    const cur = open.splice(bi, 1)[0];
    const cx = cur % W;
    const cy = Math.floor(cur / W);
    if (cx === gx && cy === gy) {
      const out: Array<{ x: number; y: number }> = [];
      let k: number | undefined = cur;
      while (k !== undefined && k !== key(sx, sy)) {
        out.unshift({ x: (k % W) + 0.5, y: Math.floor(k / W) + 0.5 });
        k = came.get(k);
      }
      return out;
    }
    closed.add(cur);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        const isGoal = nx === gx && ny === gy;
        if (grid.isSolid(nx, ny) && !(isGoal && opts.allowGoalSolid)) continue;
        if (dx && dy && (grid.isSolid(cx + dx, cy) || grid.isSolid(cx, cy + dy))) continue;
        const nk = key(nx, ny);
        if (closed.has(nk)) continue;
        const tentative = (gScore.get(cur) ?? 1e9) + (dx && dy ? 1.414 : 1);
        if (tentative < (gScore.get(nk) ?? 1e9)) {
          came.set(nk, cur);
          gScore.set(nk, tentative);
          fScore.set(nk, tentative + heur(nx, ny, gx, gy));
          if (!open.includes(nk)) open.push(nk);
        }
      }
  }
  return null;
}

function heur(ax: number, ay: number, bx: number, by: number): number {
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  return dx + dy - 0.586 * Math.min(dx, dy);
}

function nearestFree(grid: CollisionGrid, gx: number, gy: number, sx: number, sy: number): [number, number] | null {
  let best: [number, number] | null = null;
  let bestD = Infinity;
  for (let r = 1; r <= 2 && !best; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++) {
        const x = gx + dx;
        const y = gy + dy;
        if (grid.isSolid(x, y)) continue;
        // Prefer the side facing the player (usually the front).
        const d = Math.hypot(x - sx, y - sy) + Math.abs(dx) * 0.1 + (dy < 0 ? 0.5 : 0);
        if (d < bestD) {
          bestD = d;
          best = [x, y];
        }
      }
  return best;
}
