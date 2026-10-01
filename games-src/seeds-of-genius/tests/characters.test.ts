import { describe, expect, it } from 'vitest';
import { DEFAULT_APPEARANCE, lookFromAppearance } from '../src/art/characters';

describe('Boy / Girl look', () => {
  it('gives Girl a skirt in the outfit color and Boy pants only', () => {
    const girl = lookFromAppearance({ ...DEFAULT_APPEARANCE, body: 'girl', outfit: 'red' });
    const boy = lookFromAppearance({ ...DEFAULT_APPEARANCE, body: 'boy', outfit: 'red' });
    expect(girl.extras?.skirt?.base).toBe(girl.shirt.base);
    expect(boy.extras?.skirt).toBeUndefined();
  });
});
