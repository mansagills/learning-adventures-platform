import type { Rock } from './cycle';

/**
 * Words for Rock Cycle Racing: the cast, the rock forms the racer can take,
 * the test track's Order Cards, fork signs and question, and the host's
 * lines. Kept apart from the code so the wording is easy to check.
 *
 * Question wording rule (owner, 2026-10-10): short sentences, facts first,
 * then one plain question, in words that match the picture.
 */

export interface CastMember {
  id: string;
  name: string;
  role: string;
}

export const CAST: Record<string, CastMember> = {
  ana: { id: 'ana', name: 'Dr. Ana Quispe', role: 'Volcano scientist and race host' },
  noor: { id: 'noor', name: 'Noor Rahman', role: 'Desert guide on the Canyon Run' },
  bea: { id: 'bea', name: 'Captain Bea Lindqvist', role: 'Boat captain on the River Run' },
  sione: { id: 'sione', name: 'Dr. Sione Taufa', role: 'Mountain geologist on the Deep Squeeze' },
  tala: { id: 'tala', name: 'Ranger Tala', role: 'Wild Lands ranger and track marshal' },
  scree: { id: 'scree', name: 'Scree', role: 'A pika who keeps the race map' },
  blaze: { id: 'blaze', name: 'Blaze', role: 'A rival rock who always picks the hottest way' },
};

export interface RockForm {
  rock: Rock;
  name: string;
  family: string;
  /** One short fact, in words a third grader can read. */
  fact: string;
  /** How it formed, for the finish card. */
  how: string;
}

export const ROCK_FORMS: Partial<Record<Rock, RockForm>> = {
  magma: { rock: 'magma', name: 'Magma', family: 'Melted rock', fact: 'Magma is melted rock under the ground.', how: 'Rock deep underground got hot enough to melt.' },
  granite: {
    rock: 'granite',
    name: 'Granite',
    family: 'Igneous rock',
    fact: 'Granite has big crystals you can see.',
    how: 'Magma cooled slowly, deep underground. Slow cooling gives crystals time to grow big.',
  },
  basalt: {
    rock: 'basalt',
    name: 'Basalt',
    family: 'Igneous rock',
    fact: 'Basalt is dark, with crystals too tiny to see.',
    how: 'Lava cooled fast in the open air. Fast cooling makes tiny crystals.',
  },
  obsidian: { rock: 'obsidian', name: 'Obsidian', family: 'Igneous rock', fact: 'Obsidian is shiny volcanic glass.', how: 'Lava cooled so fast that no crystals could grow.' },
  pumice: { rock: 'pumice', name: 'Pumice', family: 'Igneous rock', fact: 'Pumice is so full of bubbles that it can float.', how: 'Gassy lava cooled with the bubbles still in it.' },
  sandstone: { rock: 'sandstone', name: 'Sandstone', family: 'Sedimentary rock', fact: 'Sandstone is sand glued together.', how: 'Layers of sand were pressed down and glued by minerals.' },
  gravel: { rock: 'gravel', name: 'River pebble', family: 'Sediment', fact: 'A river rolls pebbles until they are round.', how: 'Weathering broke rock, and the river carried the pieces.' },
  gneiss: { rock: 'gneiss', name: 'Banded gneiss', family: 'Metamorphic rock', fact: 'Gneiss has stripes from being squeezed.', how: 'Heat and pressure changed solid rock without melting it.' },
};

/** The racer's look for each form it can take (colors for the 3D model). */
export const FORM_LOOK: Partial<Record<Rock, { base: number; speck: number; glow?: number; shine?: number }>> = {
  magma: { base: 0xff6a1f, speck: 0xffd34a, glow: 0xff5a10 },
  granite: { base: 0xd9c9bd, speck: 0x2b2624 },
  basalt: { base: 0x3a3a40, speck: 0x5a5a62 },
  obsidian: { base: 0x141018, speck: 0x5a4a7a, shine: 0.25 },
  pumice: { base: 0xd8d2c2, speck: 0xa59c88 },
  sandstone: { base: 0xd7914f, speck: 0xf0c48a },
  gravel: { base: 0x8a8f86, speck: 0xb9bdb2 },
  gneiss: { base: 0x8c8c8c, speck: 0x2e2e33 },
};

export interface OrderCard {
  id: string;
  /** The rock the card asks for. */
  goal: Rock;
  line: string;
}

/** The test track's two Order Cards (the full game has one a race). */
export const ORDER_CARDS: OrderCard[] = [
  { id: 'granite', goal: 'granite', line: 'Finish as granite. Crystals you can see!' },
  { id: 'basalt', goal: 'basalt', line: 'Finish as basalt. Dark rock with tiny crystals!' },
];

export interface ForkSign {
  path: string;
  /** What you do on this side of the fork (the sign over the road). */
  sign: string;
  /** What the rock becomes at the end, and how long it takes in nature. */
  result: Rock;
  time: string;
}

/** The test track's one fork, at the top of the magma vent. */
export const FORK_SIGNS: ForkSign[] = [
  { path: 'deep', sign: 'Stay deep and cool slowly', result: 'granite', time: 'about a million years' },
  { path: 'erupt', sign: 'Erupt and flow out', result: 'basalt', time: 'a few days' },
];

/** The Deep Time Clock: how much time has passed at each stage (sped up for the race). */
export const CLOCK_STAGES: Record<'deep' | 'erupt', string[]> = {
  deep: ['100 years', '10,000 years', 'about a million years'],
  erupt: ['a few minutes', 'a few hours', 'a few days'],
};

export interface Answer {
  text: string;
  right: boolean;
  /** For a wrong answer: the mistake it shows, and a kind fix. */
  mistake?: string;
  fix?: string;
}

export interface Question {
  id: string;
  /** Facts first, then one plain question. */
  text: string;
  answers: Answer[];
  /** First a nudge, then the answer is outlined. */
  hint: string;
}

export const VENT_QUESTION: Question = {
  id: 'magma-lava',
  text: 'Melted rock under the ground is called magma. When it comes out of a volcano, it gets a new name. What is it called?',
  answers: [
    { text: 'Lava', right: true },
    { text: 'Ash', right: false, mistake: 'ash-is-lava', fix: 'Ash is tiny bits of broken rock and glass that blow out of a volcano. Melted rock that flows out is lava.' },
    {
      text: 'Magma, the same name',
      right: false,
      mistake: 'magma-lava-same',
      fix: 'It is the same melted rock, but it gets a new name outside. Magma is under the ground. Lava is above it.',
    },
  ],
  hint: 'Think of the bright, runny rock you see pouring down a volcano.',
};

/** Dr. Ana's lines on the test track. */
export const HOST_LINES = {
  start: 'Welcome to the magma chamber! You are melted rock. Roll up the vent, and pick your way at the fork.',
  startBasalt: 'Today the order is basalt. Basalt forms when lava cools fast in the open air. Which way gets you there?',
  startGranite: 'Today the order is granite. Granite forms when magma cools slowly, deep underground. Which way gets you there?',
  question: 'Quick question before the fork!',
  right: 'Yes! Outside a volcano, melted rock is called lava. Have a boost!',
  rightLater: 'That is it: lava. On you go!',
  forkDeep: 'You stayed deep. Down here the rock cools very, very slowly.',
  forkErupt: 'Eruption! Out you go into the air, where lava cools fast.',
  finishMet: 'You did it! You finished as the rock on your order.',
  finishMissed: 'You finished as a different rock. That is fine: every rock is part of the cycle. Try the other way next time!',
};

/** Shared words on the screen. */
export const UI = {
  title: 'Rock Cycle Racing',
  sub: 'Test track: the Lava Run',
  controlsKeys: 'Up or W to push, Down or S to brake, Left and Right to steer, Space to jump.',
  controlsTouch: 'Hold the arrows to steer. Tap Push for speed and Jump to hop.',
  clock: 'Deep Time Clock',
  clockNote: 'Sped up for the race',
  order: 'Order Card',
  again: 'Race again',
  other: 'Try the other way',
  place: (n: number) => (n === 1 ? '1st place' : '2nd place'),
};
