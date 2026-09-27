/**
 * The Learning Adventures icon set: sticker-style drawings in the look of the
 * Jaylen & S.P.A.R.K. art. Every icon is drawn on a 48×48 grid.
 *
 * House style (keep new icons consistent):
 * - navy outline (`ink`), 2.5 wide, round joins; set once on the <svg> by
 *   SiteIcon, so shapes only choose a fill
 * - flat fills from `palette`, one darker "shade" shape for the cel shadow
 *   and one small white shine
 * - fills and shades are drawn first with `stroke="none"`, then the outline
 *   on top, so shadows never cover the outline
 */

import type { ReactNode } from 'react';
import { ink, palette as c } from './palette';

const none = 'none';

/** Bottom band of a rounded rectangle (its cel shadow), `s` units tall. */
function band(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  s: number
) {
  const b = y + h;
  return `M${x} ${b - s}H${x + w}V${b - r}Q${x + w} ${b} ${x + w - r} ${b}H${x + r}Q${x} ${b} ${x} ${b - r}Z`;
}

/** Crescent on the lower right of a circle (its cel shadow). */
function crescent(cx: number, cy: number, r: number, d: number) {
  const mx = cx - d / 2;
  const my = cy - d / 2;
  const h = Math.sqrt(r * r - (d * d) / 2) / Math.SQRT2;
  const p1 = `${mx + h} ${my - h}`;
  const p2 = `${mx - h} ${my + h}`;
  return `M${p1}A${r} ${r} 0 1 1 ${p2}A${r} ${r} 0 0 0 ${p1}Z`;
}

/** Star polygon points: `n` points, outer radius R, inner radius r. */
function star(cx: number, cy: number, R: number, r: number, n = 5) {
  const points: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const radius = i % 2 === 0 ? R : r;
    const angle = -Math.PI / 2 + (i * Math.PI) / n;
    points.push(
      `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`
    );
  }
  return points.join(' ');
}

/** A rounded block with its cel shadow and a shine. */
function Block({
  x,
  y,
  w,
  h,
  r = 3,
  fill,
  shade,
  shine = true,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  fill: string;
  shade: string;
  shine?: boolean;
}) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={none} />
      <path
        d={band(x, y, w, h, r, Math.max(3, h * 0.22))}
        fill={shade}
        stroke={none}
      />
      {shine && (
        <path
          d={`M${x + 3.5} ${y + 5}V${y + 3.5}H${x + 6.5}`}
          stroke={c.white}
          strokeWidth={2}
          fill={none}
        />
      )}
      <rect x={x} y={y} width={w} height={h} rx={r} fill={none} />
    </>
  );
}

/** Label text inside an icon (digits, "Aa", "FREE"). */
function Label({
  x,
  y,
  size,
  fill = ink,
  children,
}: {
  x: number;
  y: number;
  size: number;
  fill?: string;
  children: string;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={900}
      textAnchor="middle"
      fill={fill}
      stroke={none}
      style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
    >
      {children}
    </text>
  );
}

/** A cartoon hand pointing up (palm facing out), centered on 0,0. */
function Hand({ skin }: { skin: string }) {
  return (
    <g strokeWidth={2}>
      <rect
        x={-12.5}
        y={-4}
        width={4.5}
        height={11}
        rx={2.25}
        fill={skin}
        transform="rotate(-35 -10 2)"
      />
      {[
        [-7, -13],
        [-3.5, -16],
        [0, -15.5],
        [3.5, -13],
      ].map(([x, y]) => (
        <rect
          key={x}
          x={x}
          y={y}
          width={3.6}
          height={14}
          rx={1.8}
          fill={skin}
        />
      ))}
      <rect x={-7.5} y={-5} width={15} height={18} rx={5} fill={skin} />
    </g>
  );
}

/** An open book (pages + cover), shared by `abc-book` and `open-book`. */
function OpenBook({
  cover,
  coverShade,
}: {
  cover: string;
  coverShade: string;
}) {
  const coverPath =
    'M3 16V41.5Q14 38.5 24 43.5Q34 38.5 45 41.5V16Q34 13 24 17Q14 13 3 16Z';
  const left = 'M24 14Q15 9 6 12V38Q15 35.5 24 40Z';
  const right = 'M24 14Q33 9 42 12V38Q33 35.5 24 40Z';
  return (
    <>
      <path d={coverPath} fill={cover} stroke={none} />
      <path
        d="M3 38.5Q14 36 24 40.5Q34 36 45 38.5V41.5Q34 38.5 24 43.5Q14 38.5 3 41.5Z"
        fill={coverShade}
        stroke={none}
      />
      <path d={coverPath} fill={none} />
      <path d={left} fill={c.white} />
      <path d={right} fill={c.white} stroke={none} />
      <path
        d="M24 14Q27 12.2 30 11.3V37.3Q27 38.2 24 40Z"
        fill={c.paperShade}
        stroke={none}
      />
      <path d={right} fill={none} />
    </>
  );
}

export const art = {
  /** Math: stacked number blocks with a lightning bolt. */
  math: (
    <>
      <Block
        x={4}
        y={26}
        w={18}
        h={17}
        fill={c.violet}
        shade={c.violetShade}
        shine={false}
      />
      <Label x={13} y={39.5} size={13} fill={c.white}>
        1
      </Label>
      <Block
        x={24}
        y={26}
        w={18}
        h={17}
        fill={c.yellow}
        shade={c.yellowShade}
        shine={false}
      />
      <Label x={33} y={39.5} size={13}>
        2
      </Label>
      <g transform="rotate(-10 23 16)">
        <Block
          x={14}
          y={7}
          w={18}
          h={17}
          fill={c.pink}
          shade={c.pinkShade}
          shine={false}
        />
        <Label x={23} y={20.5} size={13}>
          3
        </Label>
      </g>
      <path
        d="M40.5 2.5L34.5 12H38.5L36 19.5L43.5 9.5H39.3Z"
        fill={c.orange}
        strokeWidth={2}
      />
    </>
  ),

  /** Science: a flask glowing S.P.A.R.K. cyan. */
  flask: (
    <>
      <path
        d="M20 9V18.5L9 38Q7 43 12.5 43H35.5Q41 43 39 38L28 18.5V9Z"
        fill={c.glass}
        stroke={none}
      />
      <path
        d="M14.3 28.5Q19 26 24 28.5T33.7 28.5L39 38Q41 43 35.5 43H12.5Q7 43 9 38Z"
        fill={c.cyan}
        stroke={none}
      />
      <path
        d="M10.2 36H37.8L39 38Q41 43 35.5 43H12.5Q7 43 9 38Z"
        fill={c.cyanShade}
        stroke={none}
      />
      <path
        d="M14.3 28.5Q19 26 24 28.5T33.7 28.5"
        fill={none}
        strokeWidth={2}
      />
      <circle cx={19} cy={34.5} r={2} fill={c.white} stroke={none} />
      <circle cx={26.5} cy={32} r={1.4} fill={c.white} stroke={none} />
      <path
        d="M17.5 21.5L14 27.5"
        stroke={c.white}
        strokeWidth={2.2}
        fill={none}
      />
      <path
        d="M20 9V18.5L9 38Q7 43 12.5 43H35.5Q41 43 39 38L28 18.5V9"
        fill={none}
      />
      <rect x={16.5} y={4} width={15} height={5.5} rx={2.75} fill={c.steel} />
      <circle cx={36.5} cy={8.5} r={3} fill={c.cyan} strokeWidth={2} />
      <circle cx={42} cy={15} r={1.8} fill={c.cyan} strokeWidth={1.8} />
    </>
  ),

  /** English: an open book with "Aa" and a star. */
  'abc-book': (
    <>
      <OpenBook cover={c.pink} coverShade={c.pinkShade} />
      <Label x={15} y={30.5} size={12}>
        Aa
      </Label>
      <path
        d="M31 20.5H38M31 25.5H38M31 30.5H36"
        stroke={c.steelShade}
        strokeWidth={2}
        fill={none}
      />
      <polygon points={star(39, 7, 5.5, 2.4)} fill={c.yellow} strokeWidth={2} />
    </>
  ),

  /** History: a temple with columns. */
  columns: (
    <>
      <path d="M4.5 17.5L24 5L43.5 17.5Z" fill={c.yellow} />
      <circle cx={24} cy={13} r={2.4} fill={c.white} strokeWidth={2} />
      <rect x={6.5} y={17.5} width={35} height={5} rx={1.5} fill={c.paper} />
      {[9, 20.5, 32].map((x) => (
        <g key={x}>
          <rect
            x={x}
            y={22.5}
            width={7}
            height={14.5}
            fill={c.paper}
            stroke={none}
          />
          <rect
            x={x + 4.3}
            y={22.5}
            width={2.7}
            height={14.5}
            fill={c.paperShade}
            stroke={none}
          />
          <rect x={x} y={22.5} width={7} height={14.5} fill={none} />
        </g>
      ))}
      <Block
        x={4}
        y={37}
        w={40}
        h={6.5}
        r={2}
        fill={c.yellow}
        shade={c.yellowShade}
        shine={false}
      />
    </>
  ),

  /** Mixed skills: two puzzle pieces clicking together. */
  puzzle: (
    <g transform="rotate(-6 24 24)">
      <g transform="translate(2 -2) rotate(8 34 24)">
        <path
          d="M26 14Q26 12 28 12H42Q44 12 44 14V34Q44 36 42 36H28Q26 36 26 34V29A5 5 0 1 0 26 19Z"
          fill={c.orange}
          stroke={none}
        />
        <path
          d="M26 31H44V34Q44 36 42 36H28Q26 36 26 34Z"
          fill={c.orangeShade}
          stroke={none}
        />
        <path
          d="M26 14Q26 12 28 12H42Q44 12 44 14V34Q44 36 42 36H28Q26 36 26 34V29A5 5 0 1 0 26 19Z"
          fill={none}
        />
      </g>
      <path
        d="M6 14Q6 12 8 12H22Q24 12 24 14V19A5 5 0 1 1 24 29V34Q24 36 22 36H8Q6 36 6 34Z"
        fill={c.ocean}
        stroke={none}
      />
      <path
        d="M6 31H24V34Q24 36 22 36H8Q6 36 6 34Z"
        fill={c.oceanShade}
        stroke={none}
      />
      <path
        d="M9.5 17V15.5H12.5"
        stroke={c.white}
        strokeWidth={2}
        fill={none}
      />
      <path
        d="M6 14Q6 12 8 12H22Q24 12 24 14V19A5 5 0 1 1 24 29V34Q24 36 22 36H8Q6 36 6 34Z"
        fill={none}
      />
    </g>
  ),

  /** Stories: books on a shelf. */
  books: (
    <>
      <Block
        x={6}
        y={11}
        w={9}
        h={30}
        r={1.5}
        fill={c.violet}
        shade={c.violetShade}
        shine={false}
      />
      <path d="M6 16.5H15M6 35H15" strokeWidth={2} fill={none} />
      <Block
        x={16}
        y={7}
        w={10}
        h={34}
        r={1.5}
        fill={c.mint}
        shade={c.mintShade}
        shine={false}
      />
      <path d="M16 12.5H26M16 34.5H26" strokeWidth={2} fill={none} />
      <circle cx={21} cy={23.5} r={2.2} fill={c.yellow} strokeWidth={2} />
      <g transform="rotate(16 28 41)">
        <Block
          x={28}
          y={12}
          w={9}
          h={29}
          r={1.5}
          fill={c.pink}
          shade={c.pinkShade}
          shine={false}
        />
        <path d="M28 17H37M28 35H37" strokeWidth={2} fill={none} />
      </g>
      <rect x={3} y={41} width={42} height={4} rx={2} fill={c.wood} />
    </>
  ),

  /** Reading: an open book with a bookmark ribbon. */
  'open-book': (
    <>
      <OpenBook cover={c.violet} coverShade={c.violetShade} />
      <path
        d="M10 18.5H19M10 23.5H19M10 28.5H17"
        stroke={c.steelShade}
        strokeWidth={2}
        fill={none}
      />
      <path
        d="M30 18.5H38M30 23.5H38M30 28.5H36"
        stroke={c.steelShade}
        strokeWidth={2}
        fill={none}
      />
      <path
        d="M33 10.5V21L35.5 18.5L38 21V10"
        fill={c.orange}
        strokeWidth={2}
      />
    </>
  ),

  /** Explore: a brass compass. */
  compass: (
    <>
      <circle cx={24} cy={5} r={3} fill={c.yellow} strokeWidth={2} />
      <circle cx={24} cy={26} r={18} fill={c.yellow} stroke={none} />
      <path d={crescent(24, 26, 18, 5)} fill={c.yellowShade} stroke={none} />
      <circle cx={24} cy={26} r={18} fill={none} />
      <circle cx={24} cy={26} r={13} fill={c.white} />
      <path
        d="M24 15.5V18M24 34V36.5M13.5 26H16M32 26H34.5"
        strokeWidth={2}
        fill={none}
      />
      <g transform="rotate(35 24 26)">
        <path d="M24 14.5L28 26H20Z" fill={c.pink} strokeWidth={2} />
        <path d="M24 37.5L28 26H20Z" fill={c.cyan} strokeWidth={2} />
      </g>
      <circle cx={24} cy={26} r={2.2} fill={ink} stroke={none} />
    </>
  ),

  /** World demo: a folded treasure map. */
  map: (
    <>
      <path d="M4 11L16.5 7V37L4 41Z" fill={c.paper} />
      <path d="M16.5 7L31.5 11V41L16.5 37Z" fill={c.paperShade} />
      <path d="M31.5 11L44 7V37L31.5 41Z" fill={c.paper} />
      <path
        d="M8.5 34Q14 22 21 27T35 17"
        stroke={c.orange}
        strokeWidth={2.6}
        strokeDasharray="3 3.4"
        fill={none}
      />
      <path
        d="M35.5 12.5L41 18M41 12.5L35.5 18"
        stroke={c.pink}
        strokeWidth={3.2}
        fill={none}
      />
      <circle cx={9.5} cy={17} r={2.6} fill={c.mint} strokeWidth={2} />
    </>
  ),

  /** Peek / search: a magnifying glass. */
  magnifier: (
    <>
      <rect
        x={28}
        y={26.5}
        width={17}
        height={7.5}
        rx={3.75}
        transform="rotate(45 28 30.25)"
        fill={c.orange}
      />
      <circle cx={20} cy={20} r={15} fill={c.violet} stroke={none} />
      <path d={crescent(20, 20, 15, 4)} fill={c.violetShade} stroke={none} />
      <circle cx={20} cy={20} r={15} fill={none} />
      <circle cx={20} cy={20} r={10} fill={c.glass} />
      <path
        d="M13.5 19A7 7 0 0 1 19 13.5"
        stroke={c.cyanShade}
        strokeWidth={2.4}
        fill={none}
      />
    </>
  ),

  /** Play: a game controller with a bolt. */
  controller: (
    <>
      <path
        d="M12 15H36Q44 15 45.3 25.5L46.2 33Q47 40.5 40.8 40.5Q37 40.5 34 35H14Q11 40.5 7.2 40.5Q1 40.5 1.8 33L2.7 25.5Q4 15 12 15Z"
        fill={c.violet}
        stroke={none}
      />
      <path
        d="M2.3 30H45.7L46.2 33Q47 40.5 40.8 40.5Q37 40.5 34 35H14Q11 40.5 7.2 40.5Q1 40.5 1.8 33Z"
        fill={c.violetShade}
        stroke={none}
      />
      <path d="M8 21.5V20H11" stroke={c.white} strokeWidth={2} fill={none} />
      <path
        d="M12 15H36Q44 15 45.3 25.5L46.2 33Q47 40.5 40.8 40.5Q37 40.5 34 35H14Q11 40.5 7.2 40.5Q1 40.5 1.8 33L2.7 25.5Q4 15 12 15Z"
        fill={none}
      />
      <path
        d="M10.5 20.5H14.5V23.5H17.5V27.5H14.5V30.5H10.5V27.5H7.5V23.5H10.5Z"
        fill={c.white}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <circle cx={38} cy={22.5} r={2.8} fill={c.yellow} strokeWidth={2} />
      <circle cx={33.5} cy={28} r={2.8} fill={c.mint} strokeWidth={2} />
      <path
        d="M26 18.5L21.5 25H24.5L22.5 30.5L27.5 23.5H24.5Z"
        fill={c.orange}
        strokeWidth={1.6}
      />
    </>
  ),

  /** Coming soon / in development: a wrench and a pencil. */
  tools: (
    <>
      <g transform="rotate(-45 24 24)">
        <rect
          x={21}
          y={14}
          width={6}
          height={29}
          rx={3}
          fill={c.steel}
          stroke={none}
        />
        <rect
          x={24.2}
          y={14}
          width={2.8}
          height={29}
          fill={c.steelShade}
          stroke={none}
        />
        <rect x={21} y={14} width={6} height={29} rx={3} fill={none} />
        <path d="M20.5 5V10H27.5V5A7.2 7.2 0 1 1 20.5 5Z" fill={c.steel} />
      </g>
      <g transform="rotate(45 24 24)">
        <rect
          x={19.5}
          y={8}
          width={9}
          height={26}
          fill={c.yellow}
          stroke={none}
        />
        <rect
          x={25}
          y={8}
          width={3.5}
          height={26}
          fill={c.yellowShade}
          stroke={none}
        />
        <rect x={19.5} y={8} width={9} height={26} fill={none} />
        <rect x={19.5} y={2} width={9} height={6} rx={2} fill={c.pink} />
        <path d="M19.5 34L24 43.5L28.5 34Z" fill={c.paper} />
        <path d="M22.3 39.9L24 43.5L25.7 39.9Z" fill={ink} stroke={none} />
      </g>
    </>
  ),

  /** The Academy campus building. */
  campus: (
    <>
      <path d="M24 9V2" strokeWidth={2} fill={none} />
      <path d="M24 2.5L31.5 4.8L24 7.2Z" fill={c.orange} strokeWidth={2} />
      <rect x={8} y={20} width={32} height={22} fill={c.paper} stroke={none} />
      <rect
        x={34}
        y={20}
        width={6}
        height={22}
        fill={c.paperShade}
        stroke={none}
      />
      <rect x={8} y={20} width={32} height={22} fill={none} />
      <path d="M4.5 21.5L24 9L43.5 21.5Z" fill={c.violet} />
      <circle cx={24} cy={16.5} r={2.5} fill={c.yellow} strokeWidth={2} />
      <rect
        x={12}
        y={25}
        width={6}
        height={7}
        rx={1}
        fill={c.cyan}
        strokeWidth={2}
      />
      <rect
        x={30}
        y={25}
        width={6}
        height={7}
        rx={1}
        fill={c.cyan}
        strokeWidth={2}
      />
      <path d="M20 42V34A4 4 0 0 1 28 34V42Z" fill={c.orange} />
      <rect x={3} y={41.5} width={42} height={4} rx={2} fill={c.mint} />
    </>
  ),

  /** Free: a ticket. */
  ticket: (
    <g transform="rotate(-10 24 24)">
      <path
        d="M5 14H43V20A4 4 0 0 0 43 28V34H5V28A4 4 0 0 0 5 20Z"
        fill={c.yellow}
        stroke={none}
      />
      <path d="M5 30H43V34H5Z" fill={c.yellowShade} stroke={none} />
      <path
        d="M5 14H43V20A4 4 0 0 0 43 28V34H5V28A4 4 0 0 0 5 20Z"
        fill={none}
      />
      <path
        d="M34 16V32"
        strokeWidth={2}
        strokeDasharray="2.5 2.5"
        fill={none}
      />
      <Label x={19.5} y={27.5} size={8.5}>
        FREE
      </Label>
      <polygon
        points={star(38.6, 24, 3.6, 1.6)}
        fill={c.pink}
        strokeWidth={1.6}
      />
    </g>
  ),

  /** Plays in the browser: a laptop. */
  laptop: (
    <>
      <rect x={7} y={8} width={34} height={24} rx={3} fill={c.violet} />
      <rect
        x={10.5}
        y={11.5}
        width={27}
        height={17}
        rx={1.5}
        fill={c.cyan}
        strokeWidth={2}
      />
      <path
        d="M25.5 13.5L20.5 21H24L22 26.5L28 19H24.5Z"
        fill={c.yellow}
        strokeWidth={1.6}
      />
      <path d="M2.5 34H45.5L42.5 40.5H5.5Z" fill={c.steel} stroke={none} />
      <path
        d="M3.9 37.5H44.1L42.5 40.5H5.5Z"
        fill={c.steelShade}
        stroke={none}
      />
      <path d="M2.5 34H45.5L42.5 40.5H5.5Z" fill={none} />
      <path d="M20 34H28" strokeWidth={2} fill={none} />
    </>
  ),

  /** Create your character: a kid with an orange headband. */
  avatar: (
    <>
      <circle cx={10} cy={28} r={3.2} fill={c.skin} />
      <circle cx={38} cy={28} r={3.2} fill={c.skin} />
      <circle cx={24} cy={27} r={14} fill={c.skin} stroke={none} />
      <path d={crescent(24, 27, 14, 4)} fill={c.skinShade} stroke={none} />
      <circle cx={24} cy={27} r={14} fill={none} />
      <path
        d="M9.5 22A4.5 4.5 0 0 1 12.5 12A5 5 0 0 1 20 7A5 5 0 0 1 28 7A5 5 0 0 1 35.5 12A4.5 4.5 0 0 1 38.5 22Q24 14 9.5 22Z"
        fill={c.hair}
      />
      <path
        d="M10.2 20.5Q24 13 37.8 20.5L38.2 25Q24 17.5 9.8 25Z"
        fill={c.orange}
        strokeWidth={2}
      />
      <ellipse cx={19} cy={29} rx={1.9} ry={2.5} fill={ink} stroke={none} />
      <ellipse cx={29} cy={29} rx={1.9} ry={2.5} fill={ink} stroke={none} />
      <circle cx={19.6} cy={28.2} r={0.7} fill={c.white} stroke={none} />
      <circle cx={29.6} cy={28.2} r={0.7} fill={c.white} stroke={none} />
      <path d="M19.5 34Q24 37.5 28.5 34" strokeWidth={2} fill={none} />
    </>
  ),

  /** Talk to characters: two speech bubbles. */
  chat: (
    <>
      <path d="M34 22L41 30.5L28 23" fill={c.mint} />
      <rect x={18} y={5} width={27} height={19} rx={8} fill={c.mint} />
      <path d="M11 33L6.5 43L19 34.5" fill={c.violet} />
      <rect x={3} y={16} width={29} height={20} rx={9} fill={c.violet} />
      <circle cx={11} cy={26} r={2} fill={c.white} stroke={none} />
      <circle cx={17.5} cy={26} r={2} fill={c.white} stroke={none} />
      <circle cx={24} cy={26} r={2} fill={c.white} stroke={none} />
    </>
  ),

  /** Newsletter: an envelope with a star seal. */
  envelope: (
    <>
      <Block
        x={4}
        y={11}
        w={40}
        h={27}
        r={3}
        fill={c.paper}
        shade={c.paperShade}
        shine={false}
      />
      <path
        d="M5.5 36.5L19 24.5M42.5 36.5L29 24.5"
        strokeWidth={2}
        fill={none}
      />
      <path
        d="M4.8 12.2L24 28.5L43.2 12.2Z"
        fill={c.yellow}
        strokeWidth={2.2}
      />
      <path d="M10 14.5H14" stroke={c.white} strokeWidth={2} fill={none} />
      <polygon
        points={star(24, 27.5, 6, 2.7)}
        fill={c.pink}
        strokeWidth={1.8}
      />
    </>
  ),

  /** Energy / quick: a lightning bolt. */
  bolt: (
    <>
      <path
        d="M27 3L9 27.5H21L16.5 45L39.5 18.5H27.5L32 3Z"
        fill={c.yellow}
        stroke={none}
      />
      <path
        d="M27.5 18.5H39.5L16.5 45L19 35L31.5 22.5H26.2Z"
        fill={c.yellowShade}
        stroke={none}
      />
      <path d="M26 8L17.5 20" stroke={c.white} strokeWidth={2.2} fill={none} />
      <path d="M27 3L9 27.5H21L16.5 45L39.5 18.5H27.5L32 3Z" fill={none} />
    </>
  ),

  /** Quests: a sword behind a shield. */
  sword: (
    <>
      <g transform="rotate(45 24 24)">
        <path d="M21.5 31V7L24 2L26.5 7V31Z" fill={c.steel} />
        <rect x={16} y={31} width={16} height={4} rx={2} fill={c.orange} />
        <rect x={22} y={35} width={4} height={7} rx={1} fill={c.wood} />
        <circle cx={24} cy={44} r={2.4} fill={c.yellow} strokeWidth={2} />
      </g>
      <g transform="translate(-3 3) scale(0.82) translate(5.3 5.3)">
        <path
          d="M24 10Q32 13.5 38 12.5Q39 30 24 41.5Q9 30 10 12.5Q16 13.5 24 10Z"
          fill={c.violet}
          stroke={none}
        />
        <path
          d="M24 10Q32 13.5 38 12.5Q39 30 24 41.5Z"
          fill={c.violetShade}
          stroke={none}
        />
        <path
          d="M24 10Q32 13.5 38 12.5Q39 30 24 41.5Q9 30 10 12.5Q16 13.5 24 10Z"
          fill={none}
          strokeWidth={3}
        />
        <polygon
          points={star(24, 24, 6.5, 2.8)}
          fill={c.yellow}
          strokeWidth={2.4}
        />
      </g>
    </>
  ),

  /** Progress saved: a treasure chest. */
  chest: (
    <>
      <path
        d="M5.5 23V18Q5.5 10 13.5 10H34.5Q42.5 10 42.5 18V23Z"
        fill={c.wood}
      />
      <rect
        x={5.5}
        y={23}
        width={37}
        height={19}
        rx={2.5}
        fill={c.wood}
        stroke={none}
      />
      <path
        d={band(5.5, 23, 37, 19, 2.5, 5)}
        fill={c.woodShade}
        stroke={none}
      />
      <rect x={5.5} y={23} width={37} height={19} rx={2.5} fill={none} />
      <rect
        x={11}
        y={12}
        width={4}
        height={30}
        fill={c.yellow}
        strokeWidth={2}
      />
      <rect
        x={33}
        y={12}
        width={4}
        height={30}
        fill={c.yellow}
        strokeWidth={2}
      />
      <rect x={19.5} y={19} width={9} height={10} rx={2} fill={c.yellow} />
      <path d="M24 22.5V25.5" strokeWidth={2.2} fill={none} />
      <polygon
        points={star(41.5, 6, 4.5, 1.4, 4)}
        fill={c.yellow}
        strokeWidth={1.6}
      />
    </>
  ),

  /** Play together: a high five. */
  'high-five': (
    <>
      <g transform="translate(15 27) rotate(-18)">
        <rect x={-8} y={13} width={16} height={6} rx={2} fill={c.orange} />
        <Hand skin={c.skin} />
      </g>
      <g transform="translate(33 27) rotate(18) scale(-1 1)">
        <rect x={-8} y={13} width={16} height={6} rx={2} fill={c.violet} />
        <Hand skin={c.skinLight} />
      </g>
      <polygon points={star(24, 6.5, 5, 2.2)} fill={c.yellow} strokeWidth={2} />
    </>
  ),

  /** For families: a house with a heart. */
  family: (
    <>
      <rect x={31} y={8} width={5.5} height={10} fill={c.violet} />
      <path d="M9.5 23L24 11L38.5 23V41.5H9.5Z" fill={c.paper} stroke={none} />
      <path d="M33 18.5L38.5 23V41.5H33Z" fill={c.paperShade} stroke={none} />
      <path d="M9.5 23L24 11L38.5 23V41.5H9.5Z" fill={none} />
      <path d="M3.5 24L24 6L44.5 24L41 27.5L24 12.5L7 27.5Z" fill={c.pink} />
      <path
        d="M24 37C15.5 31.5 16 23 21 23.5Q23 23.8 24 26Q25 23.8 27 23.5C32 23 32.5 31.5 24 37Z"
        fill={c.pink}
        strokeWidth={2.2}
      />
      <rect x={3} y={41} width={42} height={4} rx={2} fill={c.mint} />
    </>
  ),

  /** Something new / magic: three sparkles. */
  sparkle: (
    <>
      <polygon points={star(19, 27, 15, 4.5, 4)} fill={c.yellow} />
      <path d="M17 20.5L18.5 16" stroke={c.white} strokeWidth={2} fill={none} />
      <polygon points={star(37, 11, 8, 2.6, 4)} fill={c.cyan} strokeWidth={2} />
      <polygon
        points={star(38.5, 35, 5.5, 1.8, 4)}
        fill={c.pink}
        strokeWidth={2}
      />
    </>
  ),

  /** S.P.A.R.K., the robot buddy, with star eyes. */
  'spark-bot': (
    <>
      <path d="M24 11V6" strokeWidth={2} fill={none} />
      <circle cx={24} cy={4.5} r={2.6} fill={c.orange} strokeWidth={2} />
      <rect
        x={2}
        y={21}
        width={5}
        height={11}
        rx={2.5}
        fill={c.steel}
        strokeWidth={2}
      />
      <rect
        x={41}
        y={21}
        width={5}
        height={11}
        rx={2.5}
        fill={c.steel}
        strokeWidth={2}
      />
      <Block
        x={5}
        y={11}
        w={38}
        h={31}
        r={9}
        fill={c.botBody}
        shade={c.botScreen}
      />
      <rect
        x={10}
        y={16}
        width={28}
        height={20}
        rx={6}
        fill={c.botScreen}
        strokeWidth={2}
      />
      <polygon points={star(18.5, 25, 4.6, 2)} fill={c.cyan} stroke={none} />
      <polygon points={star(29.5, 25, 4.6, 2)} fill={c.cyan} stroke={none} />
      <path
        d="M19.5 30.5Q24 34 28.5 30.5"
        stroke={c.cyan}
        strokeWidth={2}
        fill={none}
      />
    </>
  ),

  /** Questions: a question mark in a speech bubble. */
  question: (
    <>
      <path d="M14 34L9.5 44.5L23 38.5" fill={c.yellow} />
      <circle cx={25} cy={21} r={18} fill={c.yellow} stroke={none} />
      <path d={crescent(25, 21, 18, 5)} fill={c.yellowShade} stroke={none} />
      <path
        d="M14 13.5A12 12 0 0 1 20 7.5"
        stroke={c.white}
        strokeWidth={2.2}
        fill={none}
      />
      <circle cx={25} cy={21} r={18} fill={none} />
      <Label x={25} y={30} size={25}>
        ?
      </Label>
    </>
  ),

  /** Safe for kids: a shield with a heart. */
  shield: (
    <>
      <path
        d="M24 4Q34 8.5 42 7Q43.5 30 24 44Q4.5 30 6 7Q14 8.5 24 4Z"
        fill={c.violet}
        stroke={none}
      />
      <path
        d="M24 4Q34 8.5 42 7Q43.5 30 24 44Z"
        fill={c.violetShade}
        stroke={none}
      />
      <path
        d="M11.5 12.5Q11.3 17 12 20.5"
        stroke={c.white}
        strokeWidth={2.2}
        fill={none}
      />
      <path
        d="M24 4Q34 8.5 42 7Q43.5 30 24 44Q4.5 30 6 7Q14 8.5 24 4Z"
        fill={none}
      />
      <path
        d="M24 32C15.5 26.5 16 18 21 18.5Q23 18.8 24 21Q25 18.8 27 18.5C32 18 32.5 26.5 24 32Z"
        fill={c.pink}
        strokeWidth={2.2}
      />
    </>
  ),

  /** The site logo mark: Jaylen's lightning bolt on a violet badge. */
  'logo-bolt': (
    <>
      <Block
        x={3}
        y={3}
        w={42}
        h={42}
        r={12}
        fill={c.violet}
        shade={c.violetShade}
        shine={false}
      />
      <path
        d="M8.5 13V10.5Q8.5 8.5 10.5 8.5H13"
        stroke={c.white}
        strokeWidth={2.2}
        fill={none}
      />
      <path
        d="M27 8L13.5 26.5H22.5L19.5 40L34.5 21H25.5L29 8Z"
        fill={c.yellow}
      />
      <polygon
        points={star(37, 37, 4, 1.5, 4)}
        fill={c.white}
        strokeWidth={1.6}
      />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof art;

export const iconNames = Object.keys(art) as IconName[];
