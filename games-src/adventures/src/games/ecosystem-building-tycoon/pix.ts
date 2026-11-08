import type { PixelBuffer } from '../../kit/art/pixel';
import { h } from '../../kit/ui/dom';

const urlCache = new Map<string, { url: string; w: number; h: number }>();

/** A pixel picture as an <img> scaled up with crisp pixels (cached by key). */
export function pix(key: string, paint: () => PixelBuffer, scale = 3, alt = ''): HTMLImageElement {
  let c = urlCache.get(key);
  if (!c) {
    const b = paint();
    c = { url: b.toDataURL(1), w: b.w, h: b.h };
    urlCache.set(key, c);
  }
  const img = h('img', { src: c.url, alt, width: c.w * scale, height: c.h * scale, class: 'px-icon', draggable: 'false' });
  if (!alt) img.setAttribute('aria-hidden', 'true');
  return img;
}
