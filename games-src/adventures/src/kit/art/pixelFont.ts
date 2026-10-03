import { PixelBuffer } from './pixel';

/**
 * A tiny 3x5 pixel font for numbers and short labels painted into the game
 * world (stone numbers, jump sizes). Interface text uses real HTML fonts;
 * this is only for things that live inside the scene.
 */
// prettier-ignore
const GLYPHS: Record<string, string[]> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '.#.'],
  '2': ['###', '..#', '###', '#..', '###'],
  '3': ['###', '..#', '.##', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '###'],
  '+': ['...', '.#.', '###', '.#.', '...'],
  '-': ['...', '...', '###', '...', '...'],
  '=': ['...', '###', '...', '###', '...'],
  '?': ['###', '..#', '.##', '...', '.#.'],
  '<': ['..#', '.#.', '#..', '.#.', '..#'],
  '>': ['#..', '.#.', '..#', '.#.', '#..'],
  's': ['...', '.##', '#..', '..#', '##.'],
  ' ': ['...', '...', '...', '...', '...'],
};

/** Width in pixels of `text` (1px between glyphs). */
export function textWidth(text: string): number {
  return Math.max(0, text.length * 4 - 1);
}

/** Paint `text` into `b` with its top-left at (x, y). Unknown characters are skipped. */
export function paintText(b: PixelBuffer, text: string, x: number, y: number, color: string, shadow?: string): void {
  let cx = x;
  for (const ch of text) {
    const g = GLYPHS[ch];
    if (g) {
      for (let row = 0; row < 5; row++)
        for (let col = 0; col < 3; col++)
          if (g[row][col] === '#') {
            if (shadow) b.set(cx + col + 1, y + row + 1, shadow);
            b.set(cx + col, y + row, color);
          }
    }
    cx += 4;
  }
  // Shadows can land on the next glyph; repaint the glyph color on top.
  if (shadow) {
    cx = x;
    for (const ch of text) {
      const g = GLYPHS[ch];
      if (g) for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) if (g[row][col] === '#') b.set(cx + col, y + row, color);
      cx += 4;
    }
  }
}

/** A small label in its own buffer (with a 1px margin for an outline). */
export function labelBuffer(text: string, color: string, outline?: string): PixelBuffer {
  const b = new PixelBuffer(textWidth(text) + 2, 7);
  paintText(b, text, 1, 1, color);
  if (outline) b.outline(outline);
  return b;
}
