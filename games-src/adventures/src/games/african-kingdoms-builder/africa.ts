/**
 * A simple, kid-scale geography of Africa for the hub map: the coastline,
 * the big rivers and lakes, and which land (biome) and height each place has.
 * Points are [longitude, latitude] in degrees. Simplified on purpose; it is a
 * picture map, not a survey.
 */

export type LonLat = [number, number];

/** The mainland coast, going clockwise from Tangier. */
export const COAST: LonLat[] = [
  [-5.9, 35.8], [-1.5, 35.2], [3, 36.8], [10.2, 37.2], [11, 35.2], [10.2, 33.5], [11.5, 33], [15.3, 32.2], [19.2, 30.4], [20.1, 32.2],
  [23, 32.6], [25.2, 31.6], [29.9, 31.2], [32.3, 31.3], [32.6, 29.9], [34.2, 26.5], [35.6, 23.9], [37.2, 19.6], [38.6, 17.9], [39.6, 15.5],
  [41.8, 13.5], [43.3, 12.4], [43.1, 11.4], [44.6, 10.4], [47.5, 11.1], [51.2, 11.8], [51, 10.4], [49.8, 7.5], [48.1, 4.5], [45.3, 2],
  [42.5, -0.4], [40.9, -2.1], [39.7, -4.1], [38.9, -6.4], [39.4, -8.4], [40.4, -10.5], [40.6, -14.6], [39.2, -16.9], [36.3, -18.9], [34.8, -19.9],
  [35.5, -22.1], [35.4, -24], [32.9, -25.9], [32.4, -28.6], [30.9, -30.1], [28.1, -32.6], [25.7, -34], [22.1, -34.2], [20, -34.8], [18.4, -34.3],
  [18.2, -32.4], [16.5, -28.6], [15.2, -27], [14.5, -22.9], [13.2, -20.2], [11.8, -17.3], [12.2, -14.3], [13.6, -12], [13.2, -8.8], [12.2, -6],
  [11.8, -4.2], [9.3, -1.5], [9.4, 0.4], [9.8, 3.1], [8.6, 4.6], [6.2, 4.3], [4.6, 6.3], [2.7, 6.4], [-0.2, 5.5], [-2.1, 4.8],
  [-4, 5.2], [-7.5, 4.4], [-9.5, 5.6], [-11.4, 6.9], [-13.2, 8.5], [-14.8, 10.6], [-16.7, 12.4], [-17.5, 14.7], [-16.5, 16.2], [-16.1, 19.4],
  [-17, 21], [-15.9, 23.7], [-14.5, 26.1], [-12.9, 27.9], [-9.8, 29.6], [-9.6, 32.5], [-6.8, 34.1],
];

export const MADAGASCAR: LonLat[] = [
  [49.3, -12], [50.2, -14.5], [50.4, -15.9], [49.6, -17.4], [48.8, -20.3], [47.5, -24.4], [47.1, -25], [45.2, -25.6], [44, -25], [43.3, -22],
  [43.8, -20.2], [44.4, -16.2], [46.4, -15.6], [47.9, -13.6],
];

export const RIVERS: Record<string, LonLat[]> = {
  nile: [[33, -1], [32.6, 2.5], [31.6, 4.8], [31.4, 9.4], [32.5, 15.6], [33.9, 17.6], [32.3, 18.8], [30.6, 19.4], [31.5, 21.8], [32.9, 24.1], [32.7, 26.2], [31.2, 30], [31, 31.4]],
  blueNile: [[37.3, 12], [36.2, 10.6], [34.6, 11.4], [32.5, 15.6]],
  niger: [[-10.5, 9.2], [-8, 12.6], [-4.4, 14.3], [-3, 16.8], [0, 16.3], [2.1, 13.5], [4, 11.7], [6.5, 9], [6.7, 7.8], [6, 4.6]],
  congo: [[28.9, -8.5], [26.5, -4], [25.2, 0.5], [22.5, 1.9], [19, 1.5], [17.4, -1], [16, -3.9], [12.4, -6]],
  zambezi: [[24.1, -12], [23.4, -16.5], [25.9, -17.9], [28.8, -16.2], [33.2, -16.4], [35.5, -18.3], [36.3, -18.9]],
  orange: [[29.4, -29.4], [26.1, -29.9], [20.8, -28.7], [16.5, -28.6]],
};

export const LAKES: Array<{ at: LonLat; r: number }> = [
  { at: [33, -1.2], r: 1.6 }, // Lake Victoria
  { at: [29.6, -6.3], r: 0.9 }, // Lake Tanganyika (simplified)
  { at: [34.4, -11.8], r: 0.8 }, // Lake Malawi (simplified)
  { at: [14, 13.2], r: 0.9 }, // Lake Chad
  { at: [37.3, 12], r: 0.5 }, // Lake Tana
];

export type Biome = 'mediterranean' | 'desert' | 'sahel' | 'savanna' | 'rainforest' | 'highland' | 'dry' | 'fynbos' | 'mountain';

export const BIOME_COLOR: Record<Biome | 'water' | 'oasis', number> = {
  mediterranean: 0x8fae5a,
  desert: 0xe7b265,
  sahel: 0xd4ab52,
  savanna: 0xaab24a,
  rainforest: 0x3f8a4a,
  highland: 0x7fa45c,
  dry: 0xcf9a58,
  fynbos: 0x8fae6a,
  mountain: 0xb8a48e,
  water: 0x4fa3c7,
  oasis: 0x6fae5a,
};

/** Is a point inside a polygon (ray casting)? */
export function inPolygon(p: LonLat, poly: LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function onLand(p: LonLat): boolean {
  return inPolygon(p, COAST) || inPolygon(p, MADAGASCAR);
}

function distToSegment(p: LonLat, a: LonLat, b: LonLat): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Distance (degrees) from a point to the nearest point of a river. */
export function distToRiver(p: LonLat, river: LonLat[]): number {
  let d = Infinity;
  for (let i = 1; i < river.length; i++) d = Math.min(d, distToSegment(p, river[i - 1], river[i]));
  return d;
}

export function isWater(p: LonLat, riverWidth = 0.42): boolean {
  if (LAKES.some((l) => Math.hypot(p[0] - l.at[0], p[1] - l.at[1]) < l.r)) return true;
  return Object.values(RIVERS).some((r) => distToRiver(p, r) < riverWidth);
}

/** Which kind of land a place has (a simplified picture of Africa's biomes). */
export function biomeAt([lon, lat]: LonLat): Biome {
  if (lon > 35 && lon < 42 && lat > 5 && lat < 15) return 'highland'; // Ethiopian Highlands
  if (lat > 30 && lon > -10 && lon < 11) return lat > 32 || lon > 0 ? 'mediterranean' : 'mountain'; // Maghreb coast, Atlas
  if (lat > 31.2) return 'mediterranean';
  if (lat > 17.5 && lon < 40) return 'desert'; // Sahara
  if (lon > 41 && lat > -1 && lat < 12) return 'dry'; // the Horn of Africa
  if (lat > 12.5) return 'sahel';
  if (lat > 4 && lat < 9 && lon < -2.5) return 'rainforest'; // the West African forest
  if (lat > -5 && lat < 5.5 && lon > 8.5 && lon < 30) return 'rainforest'; // the Congo Basin
  if (lat < -17 && lat > -29.5 && lon < 24) return 'dry'; // Kalahari and Namib
  if (lat < -31.5 && lon < 27) return 'fynbos';
  return 'savanna';
}

/** How high the land stands on the picture map (0.25 to about 1.3). */
export function heightAt([lon, lat]: LonLat): number {
  let h = 0.32;
  const bump = (cx: number, cy: number, r: number, amt: number) => {
    const d = Math.hypot(lon - cx, lat - cy) / r;
    if (d < 1) h += amt * (1 - d * d);
  };
  bump(38.5, 9.5, 6.5, 0.75); // Ethiopian Highlands
  bump(35, -3, 9, 0.35); // East African plateau
  bump(27, -24, 9, 0.3); // the southern plateau
  bump(-4, 32, 5.5, 0.5); // Atlas Mountains
  bump(29.5, -29.5, 3, 0.35); // Drakensberg
  bump(37.35, -3.07, 1.2, 0.8); // Kilimanjaro
  bump(18.5, 21, 3, 0.25); // Tibesti
  bump(-3.3, 14.4, 1.4, 0.22); // the Bandiagara cliffs
  return h;
}

/** Turn a map point into scene coordinates (x east, z south). */
export function toScene([lon, lat]: LonLat, scale = 1): { x: number; z: number } {
  return { x: (lon - 17) * scale, z: -(lat - 1) * scale };
}
