// gatherPresentation.ts
// Pure TypeScript module — NO Phaser dependency.
//
// Gather-variant presentation layer over the shared campus layout
// (campusLayout.ts). The zone/building/NPC DATA stays in campusLayout so both
// world variants share one source of truth; this module adds what the
// Gather-style scene needs on top: animated character sprites and patrol
// routes for each NPC, plus walk-up learning stations placed per zone.

import { CAMPUS_NPCS, type CampusNpcDefinition } from './campusLayout';
import { TILE_SIZE } from './TilemapGenerator';
import type { TalkableNpcConfig } from '../entities/TalkableNPC';

const T = TILE_SIZE;

// ─── NPC presentation: character sheet + patrol per campusLayout NPC id ───────
interface NpcPresentation {
  charKey: string;
  /** Patrol offsets in tiles relative to the NPC's home tile */
  patrol?: { dc: number; dr: number }[];
}

const NPC_PRESENTATION: Record<string, NpcPresentation> = {
  npc_jaylen_guide: {
    charKey: 'human-2',
    patrol: [{ dc: 0, dr: 0 }, { dc: -2, dr: -1 }, { dc: 2, dr: -1 }],
  },
  npc_professor_ivy: {
    charKey: 'human-1',
    patrol: [{ dc: 0, dr: 0 }, { dc: 1, dr: 2 }, { dc: -1, dr: 2 }],
  },
  npc_professor_numbers: {
    charKey: 'wizard-purple',
    patrol: [{ dc: 0, dr: 0 }, { dc: 2, dr: 0 }, { dc: 1, dr: 2 }],
  },
  npc_dr_spark: {
    charKey: 'robot-blue',
    patrol: [{ dc: 0, dr: 0 }, { dc: -2, dr: 1 }, { dc: 2, dr: 2 }],
  },
  npc_story_sage: {
    charKey: 'cat-orange',
    patrol: [{ dc: 0, dr: 0 }, { dc: -1, dr: 2 }, { dc: 2, dr: 1 }],
  },
  npc_commons_host: {
    charKey: 'knight-silver',
    patrol: [{ dc: 0, dr: 0 }, { dc: 2, dr: 0 }, { dc: -2, dr: 1 }],
  },
};

const DEFAULT_CHAR_KEY = 'human-1';

/** Build TalkableNPC configs from the shared campus layout NPC definitions. */
export function buildGatherNpcConfigs(): TalkableNpcConfig[] {
  return CAMPUS_NPCS.map((def: CampusNpcDefinition) => {
    const presentation = NPC_PRESENTATION[def.id];
    const x = def.tileCol * T;
    const y = def.tileRow * T;
    return {
      id: def.id,
      name: def.name,
      charKey: presentation?.charKey ?? DEFAULT_CHAR_KEY,
      x,
      y,
      lines: def.dialog,
      wander: presentation?.patrol?.map((p) => ({
        x: x + p.dc * T,
        y: y + p.dr * T,
      })),
      onComplete:
        def.onFinalDialogLine === 'openQuestBoard'
          ? { event: 'open-job-board', payload: {} }
          : undefined,
    };
  });
}

// ─── Learning stations per zone ───────────────────────────────────────────────
// adventureId must match an HTML game in public/games/ (AdventureEmbed falls
// back to /games/{id}.html). Positions avoid building footprints, the main
// cross paths (cols 47-48 / rows 35-36), the hub plaza, and the pond.
export interface GatherStationDef {
  id: string;
  name: string;
  adventureId: string;
  texture: 'arcade-cabinet' | 'desk-computer';
  x: number;
  y: number;
}

export const GATHER_STATIONS: GatherStationDef[] = [
  // Quantum Lab (math zone, cols 0-31 / rows 24-47). Math Race Rally lives
  // inside Math Hall as the quest game, so outdoor stations differ.
  { id: 'math-1', name: 'Pizza Fractions', adventureId: 'pizza-fraction-frenzy', texture: 'arcade-cabinet', x: 8 * T, y: 31 * T },
  { id: 'math-2', name: 'Math Memory', adventureId: 'math-memory-match', texture: 'desk-computer', x: 24 * T, y: 31 * T },
  { id: 'math-3', name: 'Equation Balance', adventureId: 'equation-balance-scale', texture: 'desk-computer', x: 8 * T, y: 41 * T },
  { id: 'math-4', name: 'Geometry Builder', adventureId: 'geometry-builder-challenge', texture: 'arcade-cabinet', x: 24 * T, y: 41 * T },
  // Science Nexus (discovery zone, cols 32-63 / rows 0-23)
  { id: 'sci-1', name: 'Crystal Chemistry', adventureId: 'crystal-cave-chemistry', texture: 'desk-computer', x: 36 * T, y: 14 * T },
  { id: 'sci-2', name: 'Solar System', adventureId: 'solar-system-explorer', texture: 'arcade-cabinet', x: 56 * T, y: 6 * T },
  { id: 'sci-3', name: 'Matter Mixer', adventureId: 'states-of-matter-mixer', texture: 'desk-computer', x: 40 * T, y: 18 * T },
  { id: 'sci-4', name: 'Magnet Puzzle', adventureId: 'magnet-power-puzzle', texture: 'arcade-cabinet', x: 54 * T, y: 18 * T },
  // Chronicle Archive (story zone, cols 64-95 / rows 24-47)
  { id: 'story-1', name: 'Animal Match', adventureId: 'animal-kingdom-match', texture: 'arcade-cabinet', x: 70 * T, y: 31 * T },
  { id: 'story-2', name: 'Ocean Heroes', adventureId: 'ocean-conservation-heroes', texture: 'desk-computer', x: 88 * T, y: 31 * T },
  { id: 'story-3', name: 'Weather Wizard', adventureId: 'weather-wizard-battle', texture: 'arcade-cabinet', x: 78 * T, y: 42 * T },
  // Stellar Commons (commons zone, cols 32-63 / rows 48-71)
  { id: 'commons-1', name: 'Cafeteria Cashier', adventureId: 'cafeteria-cashier', texture: 'desk-computer', x: 42 * T, y: 54 * T },
  { id: 'commons-2', name: 'Money Market', adventureId: 'money-market-madness', texture: 'arcade-cabinet', x: 60 * T, y: 54 * T },
];
