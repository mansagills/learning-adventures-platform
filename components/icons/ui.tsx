/**
 * Small interface icons (arrows, search, close, full screen…) drawn on a
 * 24×24 grid. They use `currentColor`, so they take the text color of the
 * button or link they sit in. UiIcon sets the shared stroke (thick, round
 * ends) to match the rounded outlines of the sticker icons in ./art.tsx.
 *
 * Use these for controls; use SiteIcon (./art.tsx) for content and sections.
 */

import type { ReactNode } from 'react';

const fill = 'currentColor';

/** Gear outline: `teeth` rounded teeth between radius r and R. */
function gear(teeth: number, r: number, R: number) {
  const points: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [angle, radius] of [
      [a - step * 0.3, r],
      [a - step * 0.16, R],
      [a + step * 0.16, R],
      [a + step * 0.3, r],
    ]) {
      points.push(
        `${(12 + radius * Math.cos(angle)).toFixed(2)} ${(12 + radius * Math.sin(angle)).toFixed(2)}`
      );
    }
  }
  return `M${points.join('L')}Z`;
}

export const uiArt = {
  'chevron-down': <path d="M6.5 9.5L12 15L17.5 9.5" />,
  'chevron-left': <path d="M14.5 6.5L9 12L14.5 17.5" />,
  'chevron-right': <path d="M9.5 6.5L15 12L9.5 17.5" />,
  'arrow-left': (
    <>
      <path d="M20 12H9" />
      <path d="M11 6.5L4.5 12L11 17.5Z" fill={fill} strokeWidth={2} />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M4 12H15" />
      <path d="M13 6.5L19.5 12L13 17.5Z" fill={fill} strokeWidth={2} />
    </>
  ),
  search: (
    <>
      <circle cx={10.5} cy={10.5} r={6.5} />
      <path d="M15.5 15.5L20 20" strokeWidth={3.2} />
      <path d="M7.6 9.8A3.2 3.2 0 0 1 9.8 7.6" strokeWidth={1.6} />
    </>
  ),
  close: <path d="M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5" />,
  menu: <path d="M4.5 7H19.5M4.5 12H15M4.5 17H19.5" />,
  clock: (
    <>
      <path d="M10 3.5H14" />
      <circle cx={12} cy={13} r={7.8} />
      <path d="M12 9V13L14.8 14.8" strokeWidth={2.2} />
      <circle cx={12} cy={13} r={1.3} fill={fill} stroke="none" />
    </>
  ),
  'grad-cap': (
    <>
      <path d="M2.5 9.5L12 5L21.5 9.5L12 14Z" fill={fill} strokeWidth={2} />
      <path d="M6.5 11.8V15.5Q12 19.5 17.5 15.5V11.8" />
      <path d="M21.5 9.5V14.5" strokeWidth={1.8} />
      <circle cx={21.5} cy={16} r={1.3} fill={fill} stroke="none" />
    </>
  ),
  expand: (
    <path d="M4.5 9.5V4.5H9.5M14.5 4.5H19.5V9.5M19.5 14.5V19.5H14.5M9.5 19.5H4.5V14.5" />
  ),
  shrink: (
    <path d="M9.5 4.5V9.5H4.5M19.5 9.5H14.5V4.5M14.5 19.5V14.5H19.5M4.5 14.5H9.5V19.5" />
  ),
  external: (
    <>
      <path d="M18.5 13.5V17.5Q18.5 19.5 16.5 19.5H6.5Q4.5 19.5 4.5 17.5V7.5Q4.5 5.5 6.5 5.5H10.5" />
      <path d="M14 4.5H19.5V10" />
      <path d="M19.5 4.5L11.5 12.5" />
    </>
  ),
  check: <path d="M5 12.5L10 17.5L19 7" strokeWidth={3} />,
  settings: (
    <>
      <path d={gear(8, 7.2, 9.6)} strokeWidth={2} />
      <circle cx={12} cy={12} r={2.8} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type UiIconName = keyof typeof uiArt;

export const uiIconNames = Object.keys(uiArt) as UiIconName[];
