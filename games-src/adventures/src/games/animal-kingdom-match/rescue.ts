/**
 * The Wildlife Rescue Center's rules (pure functions, unit tested).
 *
 * Dr. Amara has animals that wandered away from home. They are healthy and
 * ready to go back. For each one the child:
 *   1. picks its home on the Wild Lands map (every level). A wrong home gets
 *      a gentle reason: "The camel needs dry, sandy ground and tough plants
 *      to eat. The rainforest is warm and wet all year, with tall trees
 *      everywhere."
 *   2. says what that home gives it: food, water, shelter or space
 *      (level 2 and up)
 *   3. says which body part helps it live there (level 3)
 * These are the plan's steps: name the needs, find the home that meets them
 * all, then say which body part helps.
 */

import { HABITATS, type Habitat } from '../../kit/worlds/wild-lands/animal-art';
import type { Critter } from '../../kit/worlds/wild-lands/habitats';
import { ANIMALS, animal, cap, HABITAT_INFO, OPEN_TRIPS, toSpot, type Trip } from './animals';
import { shuffle, type Misconception, type Rand, type Tier } from './problems';

/** Animals Dr. Amara looks after in one visit. */
export const RESCUES_PER_VISIT = 3;

/** The animals of the trips built so far, by home. */
function pool(h: Habitat): Critter[] {
  return OPEN_TRIPS.includes(h) ? toSpot(h).filter((id) => ANIMALS[id]) : [];
}

/**
 * The animals for one visit after a trip: mostly animals from that trip,
 * plus one from an earlier finished trip (so homes get mixed up a little).
 */
export function pickRescues(trip: Trip, doneTrips: readonly Trip[], r: Rand, n = RESCUES_PER_VISIT): Critter[] {
  const here = shuffle(r, pool(trip));
  const earlier = shuffle(
    r,
    doneTrips.filter((t) => t !== trip).flatMap((t) => pool(t)),
  );
  const out = earlier.length ? [...here.slice(0, n - 1), earlier[0]] : here.slice(0, n);
  return shuffle(r, out);
}

/** The gentle reason for a wrong home. */
export function wrongHomeReason(id: Critter, picked: Habitat): string {
  const a = animal(id);
  return `${cap(a.the)} needs ${a.needs}. ${HABITAT_INFO[picked].is}`;
}

export interface StepChoice {
  label: string;
  correct: boolean;
  misconception?: Misconception;
  why?: string;
}

export interface RescueStep {
  kind: 'gives' | 'part';
  ask: string;
  choices: StepChoice[];
  /** Said after the right answer. */
  explain: string;
}

/** Animals from other homes (for wrong answers that clearly belong somewhere else). */
function others(id: Critter): Critter[] {
  const home = animal(id).home;
  return HABITATS.filter((h) => h !== home).flatMap(pool);
}

/** Level 2: what does its home give it? */
export function givesStep(id: Critter, r: Rand): RescueStep {
  const a = animal(id);
  const home = HABITAT_INFO[a.home];
  const wrong = shuffle(r, others(id)).slice(0, 2);
  return {
    kind: 'gives',
    ask: `What does ${home.the} give ${a.the}?`,
    choices: shuffle(r, [
      { label: a.gives, correct: true },
      ...wrong.map((w) => ({
        label: animal(w).gives,
        correct: false,
        misconception: 'just-a-place' as Misconception,
        why: `That is what ${HABITAT_INFO[animal(w).home].the} gives ${animal(w).the}. Think about what ${a.the} eats and where it rests.`,
      })),
    ]),
    explain: `${HABITAT_INFO[a.home].name} gives ${a.the} what it needs: ${a.gives.charAt(0).toLowerCase()}${a.gives.slice(1)}.`,
  };
}

/** Level 3: which body part helps it live there? */
export function partStep(id: Critter, r: Rand): RescueStep {
  const a = animal(id);
  const wrong = shuffle(r, others(id)).slice(0, 2);
  return {
    kind: 'part',
    ask: `Which body part helps ${a.the} live in ${HABITAT_INFO[a.home].the}?`,
    choices: shuffle(r, [
      { label: a.part, correct: true },
      ...wrong.map((w) => ({
        label: animal(w).part,
        correct: false,
        misconception: 'part-mixup' as Misconception,
        why: `That helps ${animal(w).the} in ${HABITAT_INFO[animal(w).home].the}. Look closely at ${a.the}.`,
      })),
    ]),
    explain: `${a.part}. It came from ${a.the}’s parents, and it fits life in ${HABITAT_INFO[a.home].the}.`,
  };
}

/** The steps after the right home, at this level. */
export function stepsFor(id: Critter, tier: Tier, r: Rand): RescueStep[] {
  return tier >= 3 ? [givesStep(id, r), partStep(id, r)] : tier === 2 ? [givesStep(id, r)] : [];
}
