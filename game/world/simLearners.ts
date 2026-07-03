import { TILE_SIZE } from './TilemapGenerator';

export type SimLearnerSubject = 'math' | 'science' | 'reading' | 'commons';
export type SimLearnerPersonality =
  | 'curious'
  | 'focused'
  | 'social'
  | 'stuck'
  | 'achiever';

export interface SimLearnerProfile {
  id: string;
  name: string;
  charKey: string;
  level: number;
  favoriteSubject: SimLearnerSubject;
  personality: SimLearnerPersonality;
}

export interface SimLearnerWaypoint {
  id: string;
  x: number;
  y: number;
  zoneId: 'hub' | 'math' | 'science' | 'story' | 'commons';
  status: string;
}

export interface SimLearnerConfig extends SimLearnerProfile {
  status: string;
  waypoints: SimLearnerWaypoint[];
  startDelayMs: number;
}

export interface StudyCircleParticipant {
  id: string;
  x: number;
  y: number;
}

export interface StudyCircle {
  centerX: number;
  centerY: number;
  memberIds: string[];
  radius: number;
}

const T = TILE_SIZE;

export const SIM_LEARNER_PROFILES: SimLearnerProfile[] = [
  {
    id: 'sim-maya',
    name: 'Maya',
    charKey: 'human-1',
    level: 3,
    favoriteSubject: 'math',
    personality: 'achiever',
  },
  {
    id: 'sim-eli',
    name: 'Eli',
    charKey: 'human-2',
    level: 2,
    favoriteSubject: 'science',
    personality: 'focused',
  },
  {
    id: 'sim-zara',
    name: 'Zara',
    charKey: 'cat-orange',
    level: 1,
    favoriteSubject: 'math',
    personality: 'stuck',
  },
  {
    id: 'sim-noah',
    name: 'Noah',
    charKey: 'robot-blue',
    level: 4,
    favoriteSubject: 'reading',
    personality: 'curious',
  },
  {
    id: 'sim-lina',
    name: 'Lina',
    charKey: 'knight-silver',
    level: 2,
    favoriteSubject: 'commons',
    personality: 'social',
  },
  {
    id: 'sim-omar',
    name: 'Omar',
    charKey: 'wizard-purple',
    level: 5,
    favoriteSubject: 'science',
    personality: 'achiever',
  },
  {
    id: 'sim-ivy',
    name: 'Ivy',
    charKey: 'human-1',
    level: 3,
    favoriteSubject: 'reading',
    personality: 'focused',
  },
  {
    id: 'sim-ben',
    name: 'Ben',
    charKey: 'human-2',
    level: 1,
    favoriteSubject: 'commons',
    personality: 'curious',
  },
];

const SIM_WAYPOINTS: SimLearnerWaypoint[] = [
  { id: 'hub-east', x: 52 * T, y: 36 * T, zoneId: 'hub', status: 'Exploring' },
  { id: 'hub-west', x: 43 * T, y: 35 * T, zoneId: 'hub', status: 'Exploring' },
  { id: 'hub-fountain', x: 48 * T, y: 32 * T, zoneId: 'hub', status: 'Taking a break' },
  { id: 'math-door', x: 12 * T, y: 36 * T, zoneId: 'math', status: 'Questing' },
  { id: 'math-stations', x: 10 * T, y: 29 * T, zoneId: 'math', status: 'Studying' },
  { id: 'math-help', x: 18 * T, y: 32 * T, zoneId: 'math', status: 'Looking for help' },
  { id: 'science-door', x: 40 * T, y: 17 * T, zoneId: 'science', status: 'Exploring' },
  { id: 'science-stations', x: 43 * T, y: 10 * T, zoneId: 'science', status: 'Studying' },
  { id: 'story-door', x: 82 * T, y: 36 * T, zoneId: 'story', status: 'Exploring' },
  { id: 'story-stations', x: 87 * T, y: 30 * T, zoneId: 'story', status: 'Studying' },
  { id: 'commons-door', x: 56 * T, y: 50 * T, zoneId: 'commons', status: 'Exploring' },
  { id: 'commons-lounge', x: 52 * T, y: 59 * T, zoneId: 'commons', status: 'Taking a break' },
  { id: 'commons-games', x: 60 * T, y: 57 * T, zoneId: 'commons', status: 'Questing' },
];

const ROUTES: Record<string, string[]> = {
  'sim-maya': ['hub-west', 'math-door', 'math-stations', 'math-help'],
  'sim-eli': ['science-door', 'science-stations', 'hub-east', 'commons-lounge'],
  'sim-zara': ['math-help', 'math-stations', 'hub-west', 'math-door'],
  'sim-noah': ['story-door', 'story-stations', 'hub-east', 'commons-games'],
  'sim-lina': ['commons-lounge', 'commons-door', 'hub-fountain', 'hub-east'],
  'sim-omar': ['science-stations', 'science-door', 'commons-games', 'hub-east'],
  'sim-ivy': ['story-stations', 'story-door', 'hub-fountain', 'hub-west'],
  'sim-ben': ['hub-fountain', 'commons-door', 'commons-lounge', 'hub-east'],
};

const INITIAL_STATUS: Record<string, string> = {
  'sim-maya': 'Questing',
  'sim-eli': 'Studying',
  'sim-zara': 'Looking for help',
  'sim-noah': 'Exploring',
  'sim-lina': 'Taking a break',
  'sim-omar': 'Questing',
  'sim-ivy': 'Studying',
  'sim-ben': 'Exploring',
};

const AMBIENT_CHAT_LINES: Record<string, string[]> = {
  'sim-maya': [
    'I am trying to beat my Math Race time.',
    'Quest board first, snacks later.',
    'Anyone headed to Math Hall?',
  ],
  'sim-eli': [
    'Discovery Lab has a new station open.',
    'I finally understood magnetism.',
    'Science notes, then Commons.',
  ],
  'sim-zara': [
    'Anyone know a fraction trick?',
    'I am going to ask Professor Numbers.',
    'Pizza fractions are sneaky.',
  ],
  'sim-noah': [
    'Story Grove has the best quiet corners.',
    'I found a hidden reading challenge.',
    'Does anyone want to compare badges?',
  ],
  'sim-lina': [
    'Taking a quick Commons break.',
    'I heard Math Race gives solid XP.',
    'Meet by the lounge after your quest?',
  ],
  'sim-omar': [
    'Crystal Chemistry is worth the detour.',
    'I am farming science XP today.',
    'Lab route is faster from the hub.',
  ],
  'sim-ivy': [
    'Story station first, then Math Hall.',
    'I am collecting one badge per zone.',
    'Quiet study circle forming soon.',
  ],
  'sim-ben': [
    'I am still learning the campus map.',
    'Commons games look fun.',
    'Which station should I try next?',
  ],
};

const CELEBRATION_LINES: Record<string, Record<string, string>> = {
  'math-race-rally': {
    'sim-maya': 'Nice run! Math Race Rally is my favorite.',
    'sim-zara': 'That gave me a fraction idea.',
    default: 'Great finish. Math Hall is warming up.',
  },
  default: {
    default: 'That looked fun. I am adding it to my quest list.',
  },
};

export function getWaypointById(id: string): SimLearnerWaypoint | undefined {
  return SIM_WAYPOINTS.find((waypoint) => waypoint.id === id);
}

export function getAmbientChatLine(simLearnerId: string, sequence: number): string {
  const lines = AMBIENT_CHAT_LINES[simLearnerId] ?? ['This campus is busy today.'];
  const index = Math.abs(sequence) % lines.length;
  return lines[index];
}

export function getCelebrationLine(activityId: string, simLearnerId: string): string {
  const activityLines = CELEBRATION_LINES[activityId] ?? CELEBRATION_LINES.default;
  return activityLines[simLearnerId] ?? activityLines.default;
}

export function findStudyCircles(
  participants: StudyCircleParticipant[],
  proximityRadius: number,
): StudyCircle[] {
  const circles: StudyCircle[] = [];
  const used = new Set<string>();

  for (const participant of participants) {
    if (used.has(participant.id)) continue;

    const members = participants.filter((candidate) => {
      if (candidate.id === participant.id) return true;
      const distance = Math.hypot(candidate.x - participant.x, candidate.y - participant.y);
      return distance <= proximityRadius;
    });

    if (members.length < 2) continue;
    members.forEach((member) => used.add(member.id));

    const centerX = Math.round(
      members.reduce((sum, member) => sum + member.x, 0) / members.length,
    );
    const centerY = Math.round(
      members.reduce((sum, member) => sum + member.y, 0) / members.length,
    );

    circles.push({
      centerX,
      centerY,
      memberIds: members.map((member) => member.id),
      radius: Math.round(proximityRadius * 0.8) + 2,
    });
  }

  return circles;
}

export function buildSimLearnerConfigs(): SimLearnerConfig[] {
  return SIM_LEARNER_PROFILES.map((profile, index) => {
    const waypoints = (ROUTES[profile.id] ?? ['hub-fountain', 'hub-east', 'hub-west'])
      .map((id) => getWaypointById(id))
      .filter((waypoint): waypoint is SimLearnerWaypoint => Boolean(waypoint));

    return {
      ...profile,
      status: INITIAL_STATUS[profile.id] ?? waypoints[0]?.status ?? 'Exploring',
      waypoints,
      startDelayMs: index * 450,
    };
  });
}
