export interface CampusZoneDefinition {
  id: string;
  key: string;
  name: string;
  /** Display name used in zone banner and minimap label */
  displayName: string;
  color: number;
  /** Neon accent hex string for HUD borders, glow, and minimap fills */
  neonAccent: string;
  /** Dimmed variant of neonAccent for backgrounds and shadows */
  neonDim: string;
  pixelX: number;
  pixelY: number;
  pixelW: number;
  pixelH: number;
}

export interface CampusBuildingDefinition {
  id: string;
  building: string;
  zoneId: string;
  doorTileCol: number;
  doorTileRow: number;
  targetScene: string | null;
  spawnX: number;
  spawnY: number;
  label: string;
  wallKey: string;
  wallTileCol: number;
  wallTileRow: number;
  wallTileW: number;
  wallTileH: number;
  tileIndex: number;
  dialog: string;
}

export interface CampusNpcDefinition {
  id: string;
  name: string;
  zoneId: string;
  tileCol: number;
  tileRow: number;
  texture: 'door-gold-small' | 'door-teal-small' | 'door-amber-small';
  dialog: string[];
  onFinalDialogLine?: 'openQuestBoard';
}

export const CAMPUS_ZONES: CampusZoneDefinition[] = [
  {
    id: 'zone_discovery_lab',
    key: 'discovery-lab',
    name: 'Discovery Lab',
    displayName: 'Science Nexus',
    color: 0x00FFB3,
    neonAccent: '#00ffb3',
    neonDim: '#006644',
    pixelX: 2048,
    pixelY: 0,
    pixelW: 2048,
    pixelH: 1536,
  },
  {
    id: 'zone_math_hall',
    key: 'math-hall',
    name: 'Math Hall',
    displayName: 'Quantum Lab',
    color: 0x9B5CFF,
    neonAccent: '#9b5cff',
    neonDim: '#3a1a6a',
    pixelX: 0,
    pixelY: 1536,
    pixelW: 2048,
    pixelH: 1536,
  },
  {
    id: 'zone_main_hub',
    key: 'main-hub',
    name: 'Main Hub',
    displayName: 'Nexus Plaza',
    color: 0x00CCFF,
    neonAccent: '#00ccff',
    neonDim: '#004466',
    pixelX: 2048,
    pixelY: 1536,
    pixelW: 2048,
    pixelH: 1536,
  },
  {
    id: 'zone_story_grove',
    key: 'story-grove',
    name: 'Story Grove',
    displayName: 'Chronicle Archive',
    color: 0xFF4DCC,
    neonAccent: '#ff4dcc',
    neonDim: '#661a55',
    pixelX: 4096,
    pixelY: 1536,
    pixelW: 2048,
    pixelH: 1536,
  },
  {
    id: 'zone_commons',
    key: 'commons',
    name: 'Commons',
    displayName: 'Stellar Commons',
    color: 0xFFB300,
    neonAccent: '#ffb300',
    neonDim: '#664400',
    pixelX: 2048,
    pixelY: 3072,
    pixelW: 2048,
    pixelH: 1536,
  },
];

export const CAMPUS_BUILDINGS: CampusBuildingDefinition[] = [
  {
    id: 'building_math_hall',
    building: 'Math Hall',
    zoneId: 'zone_math_hall',
    doorTileCol: 14,
    doorTileRow: 31,
    targetScene: 'MathBuildingScene',
    spawnX: 320,
    spawnY: 320,
    label: 'MATH\nHALL',
    wallKey: 'wall-math-1',
    wallTileCol: 12,
    wallTileRow: 27,
    wallTileW: 6,
    wallTileH: 4,
    tileIndex: 8,
    dialog: 'Math Hall is open. Step inside to practice fractions, number sense, and fast mental math.',
  },
  {
    id: 'building_discovery_lab',
    building: 'Discovery Lab',
    zoneId: 'zone_discovery_lab',
    doorTileCol: 41,
    doorTileRow: 8,
    targetScene: null,
    spawnX: 0,
    spawnY: 0,
    label: 'DISCOVERY\nLAB',
    wallKey: 'wall-science-1',
    wallTileCol: 38,
    wallTileRow: 4,
    wallTileW: 6,
    wallTileH: 4,
    tileIndex: 9,
    dialog: 'The Discovery Lab is being prepared for a future campus update.',
  },
  {
    id: 'building_story_grove',
    building: 'Story Grove',
    zoneId: 'zone_story_grove',
    doorTileCol: 79,
    doorTileRow: 31,
    targetScene: null,
    spawnX: 0,
    spawnY: 0,
    label: 'STORY\nGROVE',
    wallKey: 'wall-english-1',
    wallTileCol: 76,
    wallTileRow: 27,
    wallTileW: 6,
    wallTileH: 4,
    tileIndex: 10,
    dialog: 'Story Grove will soon host reading quests, writing prompts, and vocabulary challenges.',
  },
  {
    id: 'building_quest_board',
    building: 'Quest Board',
    zoneId: 'zone_main_hub',
    doorTileCol: 43,
    doorTileRow: 43,
    targetScene: null,
    spawnX: 0,
    spawnY: 0,
    label: 'QUEST\nBOARD',
    wallKey: 'wall-brick-1',
    wallTileCol: 42,
    wallTileRow: 40,
    wallTileW: 3,
    wallTileH: 3,
    tileIndex: 11,
    dialog: 'Pick a daily quest, earn XP, and use the campus paths when you are ready for a new subject.',
  },
  {
    id: 'building_campus_shop',
    building: 'Campus Shop',
    zoneId: 'zone_commons',
    doorTileCol: 54,
    doorTileRow: 56,
    targetScene: null,
    spawnX: 0,
    spawnY: 0,
    label: 'CAMPUS\nSHOP',
    wallKey: 'wall-brick-1',
    wallTileCol: 51,
    wallTileRow: 52,
    wallTileW: 6,
    wallTileH: 4,
    tileIndex: 11,
    dialog: 'Spend coins on avatar style and campus goodies here.',
  },
];

export const CAMPUS_NPCS: CampusNpcDefinition[] = [
  {
    id: 'npc_jaylen_guide',
    name: 'Jaylen',
    zoneId: 'zone_main_hub',
    tileCol: 48,
    tileRow: 34,
    texture: 'door-gold-small',
    dialog: [
      'Welcome to campus. Professor Ivy is your quest guide for today.',
      'After you meet Ivy, head west to Math Hall and check in with Mrs. Numbers.',
    ],
  },
  {
    id: 'npc_professor_ivy',
    name: 'Professor Ivy',
    zoneId: 'zone_main_hub',
    tileCol: 43,
    tileRow: 36,
    texture: 'door-amber-small',
    dialog: [
      'Welcome, explorer. Learning Adventures begins with one clear quest: visit Mrs. Numbers at Math Hall.',
      'Mrs. Numbers needs rally parts before she can start Math Race Rally.',
    ],
  },
  {
    id: 'npc_professor_numbers',
    name: 'Mrs. Numbers',
    zoneId: 'zone_math_hall',
    tileCol: 18,
    tileRow: 34,
    texture: 'door-teal-small',
    dialog: [
      'I need three rally parts before Math Race Rally can start: a Number Battery, a Fraction Fuel Cell, and a Turbo Token.',
      'Bring them back here, then score at least 80% in Math Race Rally to earn the Math Explorer badge.',
    ],
    onFinalDialogLine: 'openQuestBoard',
  },
  {
    id: 'npc_dr_spark',
    name: 'Dr. Spark',
    zoneId: 'zone_discovery_lab',
    tileCol: 51,
    tileRow: 11,
    texture: 'door-amber-small',
    dialog: [
      'Discovery Lab is the north wing. New learning quests will open here after the Math Lab demo is proven.',
    ],
  },
  {
    id: 'npc_story_sage',
    name: 'Story Sage',
    zoneId: 'zone_story_grove',
    tileCol: 75,
    tileRow: 34,
    texture: 'door-teal-small',
    dialog: [
      'Story Grove is the east wing for reading, vocabulary, and creative writing quests.',
    ],
  },
  {
    id: 'npc_commons_host',
    name: 'Commons Host',
    zoneId: 'zone_commons',
    tileCol: 51,
    tileRow: 58,
    texture: 'door-gold-small',
    dialog: [
      'The Commons is the south wing for the shop, profile rewards, and future social spaces.',
    ],
  },
];
