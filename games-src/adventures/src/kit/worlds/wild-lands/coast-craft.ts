import type { Recipe } from '../../craft/workbench';
import { TRASH, type TrashId } from './coast-art';

/**
 * Pollution Solution Squad's first blueprint, used by the crafting test
 * (#coast-play): the net across the storm drain on Turtle Beach. Each design
 * is a real trade-off engineers weigh (the size of the holes), and the test
 * result says what happens and why.
 */
export const DRAIN_NET: Recipe = {
  id: 'drain-net',
  name: 'Drain net',
  needs: { net: 1, wood: 2, rope: 1 },
  goals: ['Catch the trash coming out of the drain', 'Let the water flow through', 'Not get blocked up'],
  limits: ['Use what we found on the beach', 'Easy to lift off and empty'],
  designs: [
    {
      id: 'big',
      name: 'Big holes',
      note: 'As wide as your hand',
      outcome: 'half',
      why: 'The water flows through and it never blocks. But bottle caps, wrappers and small bottles slip through the holes onto the beach.',
    },
    {
      id: 'small',
      name: 'Tiny holes',
      note: 'As small as a pea',
      outcome: 'half',
      why: 'It catches everything, even sand and leaves, so it blocks up fast. The water backs up and spills over the top, and the trash goes with it.',
    },
    {
      id: 'medium',
      name: 'Medium holes',
      note: 'As wide as your thumb',
      outcome: 'works',
      why: 'It catches bottles, cans, bags and wrappers, and the water and fine sand flow through. The Squad empties it after every big rain.',
    },
  ],
};

/** The material names, for messages. */
export const MATERIAL_NAME: Record<string, string> = Object.fromEntries((Object.keys(TRASH) as TrashId[]).map((id) => [id, TRASH[id].name]));
