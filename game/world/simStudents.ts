// simStudents.ts
// Pure TypeScript module — NO Phaser dependency.
//
// "Simulated Students" — Erenshor-style ambient players for the Gather campus.
// A handful of student characters patrol the campus paths, each with a name
// tag and a short scripted conversation, so a solo player feels like other
// kids are on campus with them. No networking, no LLM: waypoint loops +
// hand-written dialogue pools, rendered through the existing TalkableNPC
// (walk-up-and-talk, speech bubbles, one-conversation-at-a-time).
//
// Placement rule: patrol waypoints MUST stay on the two main cross-path bands
// (cols 47-48 and rows 35-36 of the 96×72 campus grid). TalkableNPC wander
// tweens are straight lines with no collision, and campusLayout guarantees
// those bands stay clear of rooms and buildings.

import { TILE_SIZE } from './TilemapGenerator';
import type { TalkableNpcConfig } from '../entities/TalkableNPC';

const T = TILE_SIZE;

/** Centerlines of the two guaranteed-walkable path bands. */
const H_PATH_Y = 35.5 * T; // horizontal band rows 35-36
const V_PATH_X = 47.5 * T; // vertical band cols 47-48

interface SimStudentDef {
  id: string;
  name: string;
  charKey: string;
  /** Straight-line patrol route (consecutive points must not cross walls). */
  waypoints: { x: number; y: number }[];
  lines: string[];
}

const SIM_STUDENTS: SimStudentDef[] = [
  {
    id: 'sim_zoe',
    name: 'Zoe',
    charKey: 'human-1',
    // West stretch of the horizontal path, outside Math Hall
    waypoints: [
      { x: 14 * T, y: H_PATH_Y },
      { x: 30 * T, y: H_PATH_Y },
      { x: 22 * T, y: H_PATH_Y },
    ],
    lines: [
      'Oh hey! Have you tried Math Race Rally in the Math Hall yet?',
      "I beat my best time this morning. Professor Numbers said I'm getting fast!",
      'Race you there sometime! 🏁',
    ],
  },
  {
    id: 'sim_marcus',
    name: 'Marcus',
    charKey: 'robot-blue',
    // North stretch of the vertical path, heading toward the Discovery Lab
    waypoints: [
      { x: V_PATH_X, y: 8 * T },
      { x: V_PATH_X, y: 20 * T },
    ],
    lines: [
      'The crystal chemistry game in the Discovery Lab is SO cool.',
      'I grew a crystal the size of my whole screen. Dr. Spark freaked out!',
    ],
  },
  {
    id: 'sim_priya',
    name: 'Priya',
    charKey: 'human-2',
    // East stretch of the horizontal path, near Story Grove
    waypoints: [
      { x: 60 * T, y: H_PATH_Y },
      { x: 78 * T, y: H_PATH_Y },
      { x: 68 * T, y: H_PATH_Y },
    ],
    lines: [
      "I'm headed to Story Grove — the Ocean Heroes game is my favorite.",
      'Story Sage tells the best stories. Have you talked to them yet?',
    ],
  },
  {
    id: 'sim_jayden',
    name: 'Jayden',
    charKey: 'cat-orange',
    // South stretch of the vertical path, toward the Commons
    waypoints: [
      { x: V_PATH_X, y: 42 * T },
      { x: V_PATH_X, y: 58 * T },
    ],
    lines: [
      "I'm saving up my coins for something at the campus shop.",
      'The Cafeteria Cashier game in the Commons pays out pretty well!',
      "Don't tell anyone my strategy though. 😼",
    ],
  },
  {
    id: 'sim_ava',
    name: 'Ava',
    charKey: 'wizard-purple',
    // Loiters around the central path intersection
    waypoints: [
      { x: 44 * T, y: H_PATH_Y },
      { x: 51 * T, y: H_PATH_Y },
      { x: V_PATH_X, y: H_PATH_Y },
    ],
    lines: [
      'This is my favorite spot — you can see the whole campus from here.',
      'Did you check the quest board today? There are new daily quests!',
    ],
  },
  {
    id: 'sim_leo',
    name: 'Leo',
    charKey: 'knight-silver',
    // Paces row 36 outside the Math Hall doorway
    waypoints: [
      { x: 11.5 * T, y: 36.5 * T },
      { x: 18 * T, y: 36.5 * T },
    ],
    lines: [
      'I keep losing at Multiplication Bingo. One more try!',
      "Okay maybe two more tries. It's really fun, you should play.",
    ],
  },
  {
    id: 'sim_mia',
    name: 'Mia',
    charKey: 'human-1',
    // Paces row 36 outside the Story Grove doorway
    waypoints: [
      { x: 78 * T, y: 36.5 * T },
      { x: 86 * T, y: 36.5 * T },
    ],
    lines: [
      'The Weather Wizard game is tricky today — watch out for the tornado round!',
      'I got a new high score though. ⛈️',
    ],
  },
  {
    id: 'sim_sam',
    name: 'Sam',
    charKey: 'robot-blue',
    // Far south vertical path, by the Commons entrance
    waypoints: [
      { x: V_PATH_X, y: 48 * T },
      { x: V_PATH_X, y: 63 * T },
    ],
    lines: [
      'Lunch rush at the Commons! The host in there is really friendly.',
      'Meet you there after I finish my lap around campus.',
    ],
  },
];

/**
 * Build TalkableNPC configs for every simulated student.
 * Spawn position is the first patrol waypoint.
 */
export function buildSimStudentConfigs(): TalkableNpcConfig[] {
  return SIM_STUDENTS.map((s) => ({
    id: s.id,
    name: s.name,
    charKey: s.charKey,
    x: s.waypoints[0].x,
    y: s.waypoints[0].y,
    lines: s.lines,
    wander: s.waypoints,
  }));
}
