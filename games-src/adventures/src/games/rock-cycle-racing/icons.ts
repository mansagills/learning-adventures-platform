/**
 * Small line icons for Rock Cycle Racing's screens (inline SVG, no emoji).
 * Each uses `currentColor`, so it takes the text color around it.
 */

const svg = (body: string) => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS: Record<string, string> = {
  left: svg('<path d="M15 5l-7 7 7 7"/>'),
  right: svg('<path d="M9 5l7 7-7 7"/>'),
  push: svg('<path d="M6 13l6-6 6 6"/><path d="M6 19l6-6 6 6"/>'),
  brake: svg('<rect x="6" y="6" width="12" height="12" rx="2"/>'),
  jump: svg('<path d="M4 19c3-9 13-9 16 0"/><path d="M17 12l3 7-7-1"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>'),
  star: svg('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>'),
  card: svg('<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  speaker: svg('<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16.5 9a4 4 0 0 1 0 6"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  again: svg('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>'),
  flag: svg('<path d="M6 21V4"/><path d="M6 4h11l-2.5 4L17 12H6"/>'),
};

export function iconEl(name: string): Element {
  const wrap = document.createElement('span');
  wrap.innerHTML = ICONS[name] ?? '';
  return wrap.firstElementChild!;
}
