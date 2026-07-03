import { GATHER_ROOMS, type GatherRoom } from './gatherPresentation';

export interface CampusAssetSource {
  id: string;
  name: string;
  url: string;
  license: 'CC0';
  attributionRequired: false;
  use: string;
}

export interface FuturisticRoomSkin {
  roomId: string;
  shortLabel: string;
  accentColor: number;
  darkColor: number;
  glassColor: number;
  sourceIds: string[];
}

export interface FuturisticLandmarkSkin {
  buildingId: string;
  shortLabel: string;
  accentColor: number;
  darkColor: number;
  glassColor: number;
  sourceIds: string[];
}

export const FUTURISTIC_CAMPUS_ASSET_SOURCES: CampusAssetSource[] = [
  {
    id: 'kenney-sci-fi-rts',
    name: 'Kenney Sci-Fi RTS',
    url: 'https://kenney.nl/assets/sci-fi-rts',
    license: 'CC0',
    attributionRequired: false,
    use: 'Primary reference for top-down futuristic buildings, panels, and campus-like tech structures.',
  },
  {
    id: 'kenney-modular-space-kit',
    name: 'Kenney Modular Space Kit',
    url: 'https://kenney.nl/assets/modular-space-kit',
    license: 'CC0',
    attributionRequired: false,
    use: 'Secondary reference for modular sci-fi trim, glass panels, door frames, and neon station forms.',
  },
];

const KENNEY_SOURCE_IDS = ['kenney-sci-fi-rts', 'kenney-modular-space-kit'];

export const FUTURISTIC_ROOM_SKINS: Record<GatherRoom['id'], FuturisticRoomSkin> = {
  'math-hall': {
    roomId: 'math-hall',
    shortLabel: 'MATH',
    accentColor: 0xf59e0b,
    darkColor: 0x2f1b0a,
    glassColor: 0xfff1a8,
    sourceIds: KENNEY_SOURCE_IDS,
  },
  'discovery-lab': {
    roomId: 'discovery-lab',
    shortLabel: 'LAB',
    accentColor: 0x38bdf8,
    darkColor: 0x082f49,
    glassColor: 0xbae6fd,
    sourceIds: KENNEY_SOURCE_IDS,
  },
  'story-grove': {
    roomId: 'story-grove',
    shortLabel: 'STORY',
    accentColor: 0xd946ef,
    darkColor: 0x3b0a46,
    glassColor: 0xf5d0fe,
    sourceIds: KENNEY_SOURCE_IDS,
  },
  commons: {
    roomId: 'commons',
    shortLabel: 'COMMONS',
    accentColor: 0x4ade80,
    darkColor: 0x052e16,
    glassColor: 0xbbf7d0,
    sourceIds: KENNEY_SOURCE_IDS,
  },
};

export const FUTURISTIC_LANDMARK_SKINS: Record<string, FuturisticLandmarkSkin> = {
  building_quest_board: {
    buildingId: 'building_quest_board',
    shortLabel: 'QUEST',
    accentColor: 0x60a5fa,
    darkColor: 0x07142f,
    glassColor: 0xbfdbfe,
    sourceIds: KENNEY_SOURCE_IDS,
  },
  building_campus_shop: {
    buildingId: 'building_campus_shop',
    shortLabel: 'SHOP',
    accentColor: 0x22c55e,
    darkColor: 0x052e16,
    glassColor: 0xbbf7d0,
    sourceIds: KENNEY_SOURCE_IDS,
  },
};

export function getFuturisticRoomSkin(
  roomId: GatherRoom['id'],
): FuturisticRoomSkin | undefined {
  return FUTURISTIC_ROOM_SKINS[roomId];
}

export function getFuturisticLandmarkSkin(
  buildingId: string,
): FuturisticLandmarkSkin | undefined {
  return FUTURISTIC_LANDMARK_SKINS[buildingId];
}

export function getFuturisticRoomSkinsForRooms(
  roomIds = GATHER_ROOMS.map((room) => room.id),
): FuturisticRoomSkin[] {
  return roomIds
    .map((roomId) => getFuturisticRoomSkin(roomId))
    .filter((skin): skin is FuturisticRoomSkin => Boolean(skin));
}
