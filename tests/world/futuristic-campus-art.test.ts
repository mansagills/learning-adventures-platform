import { describe, expect, it } from 'vitest';

import { GATHER_ROOMS } from '@/game/world/gatherPresentation';
import {
  FUTURISTIC_LANDMARK_SKINS,
  FUTURISTIC_CAMPUS_ASSET_SOURCES,
  FUTURISTIC_ROOM_SKINS,
  getFuturisticLandmarkSkin,
  getFuturisticRoomSkin,
  getFuturisticRoomSkinsForRooms,
} from '@/game/world/futuristicCampusArt';

describe('futuristic campus art direction', () => {
  it('tracks the CC0 Kenney source packs for the generated campus facelift', () => {
    expect(FUTURISTIC_CAMPUS_ASSET_SOURCES).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'kenney-sci-fi-rts',
          license: 'CC0',
          attributionRequired: false,
          url: 'https://kenney.nl/assets/sci-fi-rts',
        }),
        expect.objectContaining({
          id: 'kenney-modular-space-kit',
          license: 'CC0',
          attributionRequired: false,
          url: 'https://kenney.nl/assets/modular-space-kit',
        }),
      ]),
    );
  });

  it('defines a futuristic skin for every Gather campus room', () => {
    const roomIds = GATHER_ROOMS.map((room) => room.id);

    expect(Object.keys(FUTURISTIC_ROOM_SKINS).sort()).toEqual(roomIds.sort());
    expect(getFuturisticRoomSkinsForRooms(roomIds).map((skin) => skin.roomId)).toEqual(
      roomIds,
    );
  });

  it('keeps subject identity through neon accent colors and signs', () => {
    expect(getFuturisticRoomSkin('math-hall')).toMatchObject({
      roomId: 'math-hall',
      shortLabel: 'MATH',
      accentColor: 0xf59e0b,
      sourceIds: ['kenney-sci-fi-rts', 'kenney-modular-space-kit'],
    });
    expect(getFuturisticRoomSkin('discovery-lab')?.accentColor).toBe(0x38bdf8);
    expect(getFuturisticRoomSkin('story-grove')?.accentColor).toBe(0xd946ef);
    expect(getFuturisticRoomSkin('commons')?.accentColor).toBe(0x4ade80);
  });

  it('covers visible hub landmarks so the starting viewport shares the new style', () => {
    expect(Object.keys(FUTURISTIC_LANDMARK_SKINS).sort()).toEqual([
      'building_campus_shop',
      'building_quest_board',
    ]);
    expect(getFuturisticLandmarkSkin('building_quest_board')).toMatchObject({
      shortLabel: 'QUEST',
      accentColor: 0x60a5fa,
      sourceIds: ['kenney-sci-fi-rts', 'kenney-modular-space-kit'],
    });
    expect(getFuturisticLandmarkSkin('building_campus_shop')?.shortLabel).toBe('SHOP');
  });
});
