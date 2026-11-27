/**
 * Small icons for the game's panels, drawn for this game as SVG (no emoji and
 * no stock icon sets). Each one is a 24x24 picture in the game's colors.
 */

const svg = (body: string) => `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">${body}</svg>`;

export const ICONS: Record<string, string> = {
  food: svg(
    '<path d="M12 21V8" stroke="#8a6a2a" stroke-width="1.6" fill="none"/>' +
      [6, 10, 14].map((y) => `<ellipse cx="9.4" cy="${y}" rx="2.2" ry="1.3" transform="rotate(-35 9.4 ${y})" fill="#e3b94b"/><ellipse cx="14.6" cy="${y}" rx="2.2" ry="1.3" transform="rotate(35 14.6 ${y})" fill="#e3b94b"/>`).join('') +
      '<ellipse cx="12" cy="4" rx="1.3" ry="2.2" fill="#e3b94b"/>',
  ),
  water: svg('<path d="M12 3c3.5 5 6 8.2 6 11.2A6 6 0 0 1 6 14.2C6 11.2 8.5 8 12 3z" fill="#3d93b5"/><path d="M9.2 14.5a3 3 0 0 0 2.6 3" stroke="#d6f0f7" stroke-width="1.4" fill="none" stroke-linecap="round"/>'),
  brick: svg(
    '<rect x="3" y="6" width="18" height="12" rx="1.5" fill="#c99c66"/><path d="M3 12h18M9 6v6M15 12v6" stroke="#8a6440" stroke-width="1.3"/>',
  ),
  stone: svg('<path d="M4 17l2.5-8 6-3 6.5 3 1 8-6 2z" fill="#eadcb8"/><path d="M6.5 9l6 2.5L19 9M12.5 11.5V19" stroke="#bfa77c" stroke-width="1.2" fill="none"/>'),
  papyrus: svg(
    '<path d="M12 21V9M9 21l2-9M15 21l-2-9" stroke="#6f9e3c" stroke-width="1.4" fill="none"/><path d="M6.5 9.5L12 5l5.5 4.5z" fill="#9cc456"/><path d="M5 12l4-1.5M19 12l-4-1.5" stroke="#9cc456" stroke-width="1.6"/>',
  ),
  house: svg('<rect x="4" y="9" width="16" height="11" rx="1" fill="#c99c66"/><rect x="3" y="7.5" width="18" height="2.5" fill="#a97c4c"/><rect x="7" y="13" width="3.2" height="7" fill="#3a281c"/><rect x="13.5" y="12" width="3" height="2.4" fill="#3a281c"/>'),
  field: svg(
    '<rect x="3" y="14" width="18" height="6" rx="1" fill="#4e3a2a"/>' + [6, 10, 14, 18].map((x) => `<path d="M${x} 15V7" stroke="#7db33f" stroke-width="1.8" stroke-linecap="round"/>`).join(''),
  ),
  granary: svg('<rect x="3" y="18" width="18" height="3" fill="#a97c4c"/>' + [6.5, 12, 17.5].map((x) => `<path d="M${x - 3} 18V11a3 3 0 0 1 6 0v7z" fill="#e7d6b1"/><rect x="${x - 0.9}" y="13" width="1.8" height="2" fill="#3a281c"/>`).join('')),
  shaduf: svg('<path d="M8 21V9M12 21V9M7 9h6" stroke="#8b6a45" stroke-width="1.8"/><path d="M3 6l18 7" stroke="#5e4630" stroke-width="1.6"/><circle cx="3.5" cy="6" r="2" fill="#a97c4c"/><path d="M20 13v4" stroke="#c9a75a"/><path d="M18.5 17h3l-.5 3h-2z" fill="#b8663a"/>'),
  scribe: svg('<rect x="4" y="5" width="16" height="14" rx="1.5" fill="#efe1bc"/><path d="M7 9h3M7 12h2M12 9l1.5 2.5L15 9M12 14h5M7 15.5h3" stroke="#5e4630" stroke-width="1.3" fill="none" stroke-linecap="round"/>'),
  sun: svg('<circle cx="12" cy="12" r="4.5" fill="#f3b733"/>' + Array.from({ length: 8 }, (_, i) => `<path d="M12 2.5v2.6" stroke="#f3b733" stroke-width="1.6" stroke-linecap="round" transform="rotate(${i * 45} 12 12)"/>`).join('')),
  turn: svg('<path d="M5 12a7 7 0 1 1 2 5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M3 16.5l4 1 .8-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  plus: svg('<path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  minus: svg('<path d="M6 12h12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'),
  map: svg('<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" fill="#e9d8ad"/><path d="M9 4v14M15 6v14" stroke="#b5562f" stroke-width="1.2"/><circle cx="12" cy="11" r="2" fill="#c23a3a"/>'),
};

/** The five needs on the Prosperity wheel, each with its own color. */
export const NEED_COLORS = ['#e3b94b', '#3d93b5', '#c99c66', '#e2792c', '#7a5cc2'];
