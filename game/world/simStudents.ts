// simStudents.ts
// Pure TypeScript module — NO Phaser dependency.
//
// "Simulated Students" — Erenshor-style ambient players for the Gather campus.
// A handful of student characters patrol the campus paths, each with a name
// tag, rotating scripted conversations, and little emote stops (🎮 at a
// station, 💭 while thinking) so a solo player feels like other kids are on
// campus with them. No networking, no LLM: waypoint loops + hand-written
// dialogue pools, rendered through the existing TalkableNPC.
//
// Placement rule: patrol waypoints MUST follow straight, wall-free lines.
// Outdoors that means the two main cross-path bands (cols 47-48 and rows
// 35-36 of the 96×72 campus grid). Indoors (Leo in Math Hall) the segments
// stay on carved floor rows away from station collision bodies.

import { TILE_SIZE } from './TilemapGenerator';
import type { TalkableNpcConfig, NpcWaypoint } from '../entities/TalkableNPC';

const T = TILE_SIZE;

/** Centerlines of the two guaranteed-walkable path bands. */
const H_PATH_Y = 35.5 * T; // horizontal band rows 35-36
const V_PATH_X = 47.5 * T; // vertical band cols 47-48

interface SimStudentDef {
  id: string;
  name: string;
  charKey: string;
  /** Straight-line patrol route (consecutive points must not cross walls). */
  waypoints: NpcWaypoint[];
  /** Rotating conversations — a different one each time you walk up. */
  lineSets: string[][];
  /** Walk speed px/s (default 90). */
  speed?: number;
}

const SIM_STUDENTS: SimStudentDef[] = [
  {
    id: 'sim_zoe',
    name: 'Zoe',
    charKey: 'human-1',
    speed: 110, // the speedrunner walks fast
    // West stretch of the horizontal path, outside Math Hall
    waypoints: [
      { x: 14 * T, y: H_PATH_Y },
      { x: 30 * T, y: H_PATH_Y, pauseMs: 4000, emote: '💭' },
      { x: 22 * T, y: H_PATH_Y },
    ],
    lineSets: [
      [
        'Oh hey! Have you tried Math Race Rally in the Math Hall yet?',
        "I beat my best time this morning. Professor Numbers said I'm getting fast!",
        'Race you there sometime! 🏁',
      ],
      [
        "I'm doing laps to warm up my brain before another Math Race run.",
        'Top tip: the answers come faster when you say them out loud. Try it!',
      ],
      [
        'Still here? Me too. Training never stops. 🏃‍♀️',
      ],
    ],
  },
  {
    id: 'sim_marcus',
    name: 'Marcus',
    charKey: 'robot-blue',
    speed: 80,
    // North stretch of the vertical path, heading toward the Discovery Lab
    waypoints: [
      { x: V_PATH_X, y: 8 * T, pauseMs: 5000, emote: '💡' },
      { x: V_PATH_X, y: 20 * T },
    ],
    lineSets: [
      [
        'The crystal chemistry game in the Discovery Lab is SO cool.',
        'I grew a crystal the size of my whole screen. Dr. Spark freaked out!',
      ],
      [
        "I'm working out how magnets work before I try the Magnet Puzzle again.",
        'Opposites attract, same sides push. Simple, but the puzzles get tricky!',
      ],
    ],
  },
  {
    id: 'sim_priya',
    name: 'Priya',
    charKey: 'human-2',
    speed: 95,
    // East stretch of the horizontal path, near Story Grove
    waypoints: [
      { x: 60 * T, y: H_PATH_Y },
      { x: 78 * T, y: H_PATH_Y, pauseMs: 4500, emote: '📖' },
      { x: 68 * T, y: H_PATH_Y },
    ],
    lineSets: [
      [
        "I'm headed to Story Grove — the Ocean Heroes game is my favorite.",
        'Story Sage tells the best stories. Have you talked to them yet?',
      ],
      [
        'Did you know sea otters hold hands while they sleep so they don\'t drift apart?',
        'I learned that in Ocean Heroes. Now I tell everyone. You\'re everyone. 🦦',
      ],
    ],
  },
  {
    id: 'sim_jayden',
    name: 'Jayden',
    charKey: 'cat-orange',
    speed: 85,
    // South stretch of the vertical path, toward the Commons
    waypoints: [
      { x: V_PATH_X, y: 42 * T },
      { x: V_PATH_X, y: 58 * T, pauseMs: 4000, emote: '🪙' },
    ],
    lineSets: [
      [
        "I'm saving up my coins for something at the campus shop.",
        'The Cafeteria Cashier game in the Commons pays out pretty well!',
        "Don't tell anyone my strategy though. 😼",
      ],
      [
        'Almost have enough coins. Almost. Sooo close.',
        'Okay fine, my strategy is: play Cafeteria Cashier a LOT. That\'s it. That\'s the strategy.',
      ],
    ],
  },
  {
    id: 'sim_ava',
    name: 'Ava',
    charKey: 'wizard-purple',
    speed: 75, // the loiterer strolls
    // Loiters around the central path intersection
    waypoints: [
      { x: 44 * T, y: H_PATH_Y, pauseMs: 3500, emote: '👋' },
      { x: 51 * T, y: H_PATH_Y },
      { x: V_PATH_X, y: H_PATH_Y, pauseMs: 5000, emote: '✨' },
    ],
    lineSets: [
      [
        'This is my favorite spot — you can see the whole campus from here.',
        'Did you check the quest board today? There are new daily quests!',
      ],
      [
        'I like watching everyone go by. Zoe just zoomed past AGAIN.',
        'If you see a knight pacing around Math Hall, that\'s Leo. He\'s been in there all day.',
      ],
    ],
  },
  {
    id: 'sim_leo',
    name: 'Leo',
    charKey: 'knight-silver',
    speed: 90,
    // INSIDE Math Hall: from near the doorway up to the Multiplication Bingo
    // station (14,27) — stands one tile below it and "plays" with a 🎮 emote.
    // All segments on carved floor (rows 26-33, cols 5-19), clear of station
    // collision bodies on row 27 and at (8,32).
    waypoints: [
      { x: 11.75 * T, y: 33 * T },
      { x: 11.75 * T, y: 28.5 * T },
      { x: 14 * T, y: 28.5 * T, pauseMs: 7000, emote: '🎮' },
    ],
    lineSets: [
      [
        'I keep losing at Multiplication Bingo. One more try!',
        "Okay maybe two more tries. It's really fun, you should play.",
      ],
      [
        'I ALMOST won that round! Did you see it?',
        'The sevens get me every time. Seven times eight is... don\'t tell me... 56!',
      ],
      [
        "I'm not leaving this hall until I win a round. Knights never give up. ⚔️",
      ],
    ],
  },
  {
    id: 'sim_mia',
    name: 'Mia',
    charKey: 'human-1',
    speed: 100,
    // Paces row 36 outside the Story Grove doorway
    waypoints: [
      { x: 78 * T, y: 36.5 * T },
      { x: 86 * T, y: 36.5 * T, pauseMs: 3500, emote: '⭐' },
    ],
    lineSets: [
      [
        'The Weather Wizard game is tricky today — watch out for the tornado round!',
        'I got a new high score though. ⛈️',
      ],
      [
        'Animal Match speedrun: 48 seconds. Try to beat THAT.',
        'The trick is the penguins always show up in pairs. You didn\'t hear it from me.',
      ],
    ],
  },
  {
    id: 'sim_sam',
    name: 'Sam',
    charKey: 'robot-blue',
    speed: 70, // ambles
    // Far south vertical path, by the Commons entrance
    waypoints: [
      { x: V_PATH_X, y: 48 * T },
      { x: V_PATH_X, y: 63 * T, pauseMs: 4500, emote: '🍕' },
    ],
    lineSets: [
      [
        'Lunch rush at the Commons! The host in there is really friendly.',
        'Meet you there after I finish my lap around campus.',
      ],
      [
        'Fun fact: I walk this exact loop every day. Consistency is my superpower.',
        'Also pizza. Pizza is my other superpower.',
      ],
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
    lines: s.lineSets[0],
    lineSets: s.lineSets,
    wander: s.waypoints,
    speed: s.speed,
  }));
}
