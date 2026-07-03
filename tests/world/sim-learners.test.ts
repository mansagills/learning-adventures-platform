import { describe, expect, it } from 'vitest';

import {
  SIM_LEARNER_PROFILES,
  buildSimLearnerConfigs,
  findStudyCircles,
  getAmbientChatLine,
  getCelebrationLine,
  getSimLearnerStatusVisual,
  getSimLearnerSubjectVisual,
  getWaypointById,
} from '@/game/world/simLearners';

describe('simulated campus learners', () => {
  it('defines a small deterministic cohort for the Gather-style demo', () => {
    expect(SIM_LEARNER_PROFILES).toHaveLength(8);
    expect(SIM_LEARNER_PROFILES.map((profile) => profile.id)).toEqual([
      'sim-maya',
      'sim-eli',
      'sim-zara',
      'sim-noah',
      'sim-lina',
      'sim-omar',
      'sim-ivy',
      'sim-ben',
    ]);
  });

  it('builds spawn configs with valid waypoint loops and status labels', () => {
    const configs = buildSimLearnerConfigs();

    expect(configs).toHaveLength(8);
    expect(configs.every((config) => config.waypoints.length >= 3)).toBe(true);
    expect(configs.map((config) => config.status)).toEqual([
      'Questing',
      'Studying',
      'Looking for help',
      'Exploring',
      'Taking a break',
      'Questing',
      'Studying',
      'Exploring',
    ]);
    expect(configs[0]).toMatchObject({
      id: 'sim-maya',
      name: 'Maya',
      charKey: 'human-1',
      level: 3,
    });
  });

  it('keeps every configured waypoint on a named campus zone', () => {
    const configs = buildSimLearnerConfigs();
    const waypointIds = configs.flatMap((config) =>
      config.waypoints.map((waypoint) => waypoint.id),
    );

    for (const waypointId of waypointIds) {
      const waypoint = getWaypointById(waypointId);
      expect(waypoint).toBeDefined();
      expect(waypoint?.zoneId).toMatch(/^(hub|math|science|story|commons)$/);
      expect(waypoint?.x).toBeGreaterThan(0);
      expect(waypoint?.y).toBeGreaterThan(0);
    }
  });

  it('provides deterministic ambient chat for simulated learners', () => {
    expect(getAmbientChatLine('sim-zara', 0)).toBe('Anyone know a fraction trick?');
    expect(getAmbientChatLine('sim-zara', 1)).toBe('I am going to ask Professor Numbers.');
    expect(getAmbientChatLine('sim-zara', 99)).toBe('Anyone know a fraction trick?');
  });

  it('provides celebration lines for completed activities', () => {
    expect(getCelebrationLine('math-race-rally', 'sim-maya')).toBe(
      'Nice run! Math Race Rally is my favorite.',
    );
    expect(getCelebrationLine('unknown-activity', 'sim-ben')).toBe(
      'That looked fun. I am adding it to my quest list.',
    );
  });

  it('detects nearby simulated learners as study circles', () => {
    const circles = findStudyCircles(
      [
        { id: 'sim-maya', x: 100, y: 100 },
        { id: 'sim-zara', x: 150, y: 120 },
        { id: 'sim-noah', x: 600, y: 600 },
      ],
      90,
    );

    expect(circles).toEqual([
      {
        centerX: 125,
        centerY: 110,
        memberIds: ['sim-maya', 'sim-zara'],
        radius: 74,
        color: 0x38bdf8,
      },
    ]);
  });

  it('assigns readable visual accents by favorite subject', () => {
    expect(getSimLearnerSubjectVisual('math')).toEqual({
      label: 'Math',
      color: 0xf59e0b,
      textColor: '#fff7ed',
      backgroundColor: '#7c2d12e6',
    });
    expect(getSimLearnerSubjectVisual('science').label).toBe('Science');
    expect(getSimLearnerSubjectVisual('reading').label).toBe('Reading');
    expect(getSimLearnerSubjectVisual('commons').label).toBe('Social');
  });

  it('maps activity statuses to compact chips and circle colors', () => {
    expect(getSimLearnerStatusVisual('Questing')).toEqual({
      label: 'Quest',
      color: 0x4ade80,
      textColor: '#052e16',
      backgroundColor: '#bbf7d0e6',
    });
    expect(getSimLearnerStatusVisual('Looking for help').label).toBe('Help');
    expect(getSimLearnerStatusVisual('Unexpected Status').label).toBe('Here');
  });
});
