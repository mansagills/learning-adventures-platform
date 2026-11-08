import { PixelBuffer } from '../../kit/art/pixel';
import { paintBramble, paintCard, paintFirefly, paintGlowMushrooms, paintGround, paintPiece, paintSea, type PieceId } from '../../kit/worlds/wild-lands/eco-art';
import type { Island } from './rules';

/** Pixels per tile (the Wild Lands style). */
export const T = 24;
/** The darker front edge under the island's front tiles. */
export const EDGE = 8;

const canvases = new Map<string, HTMLCanvasElement>();

function cached(key: string, make: () => PixelBuffer): HTMLCanvasElement {
  let c = canvases.get(key);
  if (!c) {
    c = make().toCanvas(1);
    canvases.set(key, c);
  }
  return c;
}

/** A tile's picture (two frames of a small idle movement). */
export function pieceCanvas(id: PieceId, frame: number): HTMLCanvasElement {
  return cached(`piece-${id}-${frame % 2}`, () => paintPiece(id, T, frame % 2));
}

export function cardCanvas(id: PieceId, chosen: boolean): HTMLCanvasElement {
  return cached(`card-${id}-${chosen ? 1 : 0}`, () => paintCard(T, id, chosen));
}

export function brambleCanvas(frame: number, face: 'left' | 'right'): HTMLCanvasElement {
  return cached(`bramble-${frame % 4}-${face}`, () => paintBramble(T, frame % 4, face));
}

export function fireflyCanvas(): HTMLCanvasElement {
  return cached('firefly', () => paintFirefly(4));
}

export function glowCanvas(): HTMLCanvasElement {
  return cached('glow', () => paintGlowMushrooms(T));
}

/** A stable key for an island's ground (so its picture is painted only once). */
function islandKey(is: Island): string {
  let h = 0;
  for (const g of is.ground) h = (h * 31 + (g ? g.charCodeAt(0) + g.length : 7)) | 0;
  return `${is.kind}-${h}`;
}

/** The island's ground tiles in one picture, with the front edge where the sea is below. */
export function groundCanvas(is: Island): HTMLCanvasElement {
  return cached(`ground-${islandKey(is)}`, () => {
    const b = new PixelBuffer(is.w * T, is.h * T + EDGE);
    for (let y = 0; y < is.h; y++)
      for (let x = 0; x < is.w; x++) {
        const g = is.ground[y * is.w + x];
        if (!g) continue;
        const front = y === is.h - 1 || !is.ground[(y + 1) * is.w + x];
        b.blit(paintGround(T, g, x * 13 + y * 7, front ? EDGE : 0), x * T, y * T);
      }
    return b;
  });
}

/** The sea round the island (four frames of moving glints), paler in the shallows. */
export function seaCanvas(is: Island, w: number, h: number, ox: number, oy: number, frame: number): HTMLCanvasElement {
  return cached(`sea-${islandKey(is)}-${w}-${h}-${ox}-${oy}-${frame % 4}`, () => {
    const land = (x: number, y: number) => {
      for (const [dx, dy] of [
        [0, 0],
        [-10, 0],
        [10, 0],
        [0, -10],
        [0, 14],
      ]) {
        const cx = Math.floor((x + dx - ox) / T);
        const cy = Math.floor((y + dy - oy) / T);
        if (cx >= 0 && cy >= 0 && cx < is.w && cy < is.h && is.ground[cy * is.w + cx]) return true;
      }
      return false;
    };
    return paintSea(w, h, frame % 4, land);
  });
}

/** A small thought bubble with three dots, over an animal with nothing to eat (or a decomposer with nothing to break down). */
export function hungryCanvas(): HTMLCanvasElement {
  return cached('hungry', () => {
    const b = new PixelBuffer(13, 10);
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 13; x++) {
        const edge = x === 0 || y === 0 || x === 12 || y === 7;
        const corner = (x === 0 || x === 12) && (y === 0 || y === 7);
        if (corner) continue;
        b.set(x, y, edge ? '#3a2414' : '#ffffff');
      }
    for (const x of [3, 6, 9]) {
      b.set(x, 3, '#7a6a5a');
      b.set(x, 4, '#7a6a5a');
    }
    b.set(4, 8, '#3a2414');
    b.set(3, 9, '#3a2414');
    return b;
  });
}
