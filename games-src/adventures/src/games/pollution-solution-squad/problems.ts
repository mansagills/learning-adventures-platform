/**
 * Pollution Solution Squad: the science, as data and pure functions (no
 * drawing, no timers) so every rule can be unit tested.
 *
 * Each stretch of the coast has a question bank at three levels, asked at the
 * water test between its two levels and in the Squad Journal at the end.
 * Half 1 has two stretches:
 *   Turtle Beach (Marisol Vega): trash and plastic
 *     1. animals mistake plastic for food; take only trash; litter far
 *        away reaches the sea; sorting into recycling, compost, trash and
 *        hazardous waste (5-ESS3-1)
 *     2. plastic breaks into tiny pieces but does not rot; most beach trash
 *        starts on land; reduce and reuse before recycling; clean
 *        recycling; storm drains run straight to the river (5-ESS3-1)
 *     3. why the beach got dirty again (find the source); reading a bar
 *        graph of the trash count; goals and limits; test and improve;
 *        many small actions add up (3-5-ETS1-1, 3-5-ETS1-2, 3-5-ETS1-3)
 *   The Harbor and River Mouth (Rafi Haddad): oil and ghost nets
 *     1. oil floats; oily feathers can't keep a bird warm; stop the leak
 *        first; lost nets keep catching animals; what a boom and pads do
 *        (3-LS4-4)
 *     2. oil spreads thin; sealed bottles float; comparing patch designs;
 *        net bins; soap breaks up oil; rivers carry the town's trash to the
 *        sea (3-LS4-4, 3-5-ETS1-2)
 *     3. prevention beats cleanup; comparing boom designs; improving a
 *        design (a skirt under the floats); reading a graph of the oil;
 *        a plan for the harbor; everyone working together
 *        (3-5-ETS1-2, 3-5-ETS1-3, 5-ESS3-1)
 *
 * Every wrong answer names the real mistake behind it (a misconception tag)
 * and carries one plain sentence that explains it without giving the answer
 * away.
 *
 * Wording rule (the owner's): short sentences, the facts first, then one
 * plain question, in words that match the picture, and no game jargon.
 */

import type { Recipe } from '../../kit/craft/workbench';
import { TRASH, type BinKind, type TrashId } from '../../kit/worlds/wild-lands/coast-art';

export type Station = 'beach' | 'harbor';
export const STATIONS: Station[] = ['beach', 'harbor'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'animal-food' // thinks animals can tell plastic from food, or that plastic is safe to eat
  | 'take-nature' // thinks taking shells and other natural things is fine
  | 'beach-source' // thinks beach trash is dropped at the beach or by ships, not carried from land
  | 'bin-mixup' // put something in the wrong bin
  | 'plastic-rots' // thinks plastic rots away like food
  | 'recycle-all' // thinks recycling is always first, or that anything with the symbol can go in, dirty or not
  | 'drain-cleaned' // thinks street drains go to a water-cleaning plant
  | 'cleanup-enough' // thinks cleaning up is enough, without stopping the source
  | 'graph-mixup' // read the graph wrong
  | 'goal-mixup' // mixed up the goals and the limits of a design
  | 'design-first' // thinks the first design is final, or that a design that failed should be kept
  | 'design-biggest' // thinks the biggest or simplest design must be best, without testing it
  | 'one-person' // thinks one person, or one group, can't make a difference, or that only experts can help
  | 'oil-sinks' // thinks oil sinks in water or mixes into it
  | 'oil-stays' // thinks spilled oil stays in one drop and doesn't spread
  | 'leak-later' // thinks the cleanup comes before stopping the leak
  | 'net-harmless' // thinks lost fishing nets stop catching animals
  | 'wrong-reason'; // gave a reason that doesn't explain it

/** The pictures above the questions (the words in the question match them). */
export type Scene =
  | 'turtle' // a sea turtle, a floating plastic bag and a jellyfish
  | 'shell' // a shell and a bottle cap on the sand
  | 'park' // a wrapper in a park, a drain, a river running to the sea
  | 'can' // an empty drink can
  | 'peel' // a banana peel
  | 'battery' // a battery
  | 'bottle-years' // a bottle breaking into smaller and smaller pieces
  | 'refill' // a refillable bottle and a pile of single-use bottles
  | 'yogurt' // a yogurt pot with food inside, and the recycling symbol
  | 'ring' // a six-pack ring, cut and not cut
  | 'drain' // a street drain with "drains to river" painted beside it
  | 'beach-again' // the beach clean on Monday, littered on Tuesday
  | 'nets' // the three drain nets side by side
  | 'blocked' // a blocked net with the water spilling over
  | 'families' // a row of houses, each with a bag of trash picked up
  | 'oil-glass' // a glass of water with oil floating on top
  | 'feather' // a clean feather and a clumped, oily one
  | 'boat' // the fishing boat dripping fuel
  | 'ghost' // a ghost net on the rocks
  | 'boom' // an oil boom around a patch of oil
  | 'pads' // absorbent pads soaked with oil
  | 'spread' // a drop of oil spreading into a wide, thin rainbow layer
  | 'bottles' // a sealed bottle floating and an open bottle sinking
  | 'patches' // tape, a bucket and a metal patch
  | 'netbin' // the dock's net bin
  | 'soap' // a bowl of soapy water breaking up oil
  | 'rivermouth' // the town, the river and the harbor where it meets the sea
  | 'booms' // three boom designs side by side
  | 'skirt' // a boom with a skirt hanging under the floats
  | 'harbor-people'; // fishers, a family, the mayor and the Squad at the harbor

export type Pic = { k: 'scene'; s: Scene } | { k: 'bars'; vals: number[]; labels: string[]; unit: string; mark?: number };

/** The picture that hint 2 adds. */
export type Model = 'path' | 'bins' | 'loop' | 'fact';

export interface Choice {
  value: string;
  label: string;
  correct: boolean;
  misconception?: Misconception;
  /** One sentence about this wrong answer (never gives the right one away). */
  why?: string;
}

export interface Question {
  id: string;
  station: Station;
  tier: Tier;
  ask: string;
  choices: Choice[];
  explain: string;
  hints: [string, string];
  pic: Pic;
  model: Model;
}

export interface QDef {
  id: string;
  tier: Tier;
  ask: string;
  right: string;
  wrong: Array<[string, Misconception, string]>;
  explain: string;
  hints: [string, string];
  pic: Pic;
  model: Model;
}

const scene = (s: Scene): Pic => ({ k: 'scene', s });
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ------------------------------------------------------------------ Turtle Beach (Marisol Vega)

const BEACH: QDef[] = [
  // level 1
  {
    id: 'b-turtle',
    tier: 1,
    ask: 'A sea turtle sees a plastic bag floating in the sea. Sea turtles eat jellyfish. Why might the turtle bite the bag?',
    right: 'The bag looks like a jellyfish',
    wrong: [
      ['Turtles like the taste of plastic', 'animal-food', 'Turtles eat plastic by mistake. Look at the bag and the jellyfish side by side.'],
      ['Plastic is good food for turtles', 'animal-food', 'Plastic has no food in it, and it can make an animal very sick.'],
    ],
    explain: 'A floating bag looks a lot like a jellyfish. That is one reason plastic bags are so dangerous in the sea.',
    hints: ['What does a sea turtle eat?', 'Look at the bag and the jellyfish. How are they alike?'],
    pic: scene('turtle'),
    model: 'fact',
  },
  {
    id: 'b-shell',
    tier: 1,
    ask: 'On the sand you find a pretty shell and a plastic bottle cap. The Squad’s rule is “take only trash”. What do you take?',
    right: 'Only the bottle cap',
    wrong: [
      ['Both of them', 'take-nature', 'A shell is part of the beach. It can be a home for a hermit crab.'],
      ['Only the shell', 'take-nature', 'The shell belongs on the beach. Which one is trash?'],
    ],
    explain: 'Take only trash. Shells, driftwood and seaweed are homes and food for beach animals, so they stay.',
    hints: ['Which one is trash, and which one is part of nature?', 'A shell can be a home for a hermit crab.'],
    pic: scene('shell'),
    model: 'fact',
  },
  {
    id: 'b-wind',
    tier: 1,
    ask: 'A snack wrapper is dropped in a park, far from the sea. A week later it is on the beach. How did it get there?',
    right: 'Wind and rain carried it to a drain and a river, then to the sea',
    wrong: [
      ['It can’t. The park is too far away.', 'beach-source', 'Trash can travel a long way. Look at the path from the park.'],
      ['Someone carried it to the beach', 'beach-source', 'No one carried this one. Something in nature moved it.'],
    ],
    explain: 'Wind blows litter into drains and streams. Rain washes it along, and rivers carry it all the way to the sea.',
    hints: ['What can move a light wrapper without a person?', 'Look at the path from the park to the sea.'],
    pic: scene('park'),
    model: 'path',
  },
  {
    id: 'b-can',
    tier: 1,
    ask: 'You pick up an empty drink can. The sorting station has four bins. Which bin does the can go in?',
    right: 'Recycling',
    wrong: [
      ['Compost', 'bin-mixup', 'Compost is for food scraps and plants. Metal never rots.'],
      ['Trash', 'bin-mixup', 'A metal can doesn’t need to be thrown away. It can be made into something new.'],
    ],
    explain: 'Metal cans go in recycling. They are melted down and made into new cans, again and again.',
    hints: ['What is the can made of?', 'Look at the four bins: recycling, compost, trash and hazardous waste.'],
    pic: scene('can'),
    model: 'bins',
  },
  {
    id: 'b-peel',
    tier: 1,
    ask: 'Someone left a banana peel on the beach. Which bin does it go in?',
    right: 'Compost',
    wrong: [
      ['Recycling', 'bin-mixup', 'Recycling is for things like cans, glass and some plastic. A peel is food.'],
      ['Trash', 'bin-mixup', 'Trash goes to a landfill. Food scraps can become something useful instead.'],
    ],
    explain: 'Food scraps go in compost. Worms and tiny living things turn them into rich soil.',
    hints: ['A banana peel was once part of a plant. What happens to it?', 'Look at the four bins. Which one turns scraps into soil?'],
    pic: scene('peel'),
    model: 'bins',
  },
  {
    id: 'b-battery',
    tier: 1,
    ask: 'You find an old battery in the sand. Batteries have chemicals inside. Which bin does it go in?',
    right: 'Hazardous waste',
    wrong: [
      ['Trash', 'bin-mixup', 'In the trash, the chemicals can leak out into the ground.'],
      ['Recycling', 'bin-mixup', 'Not the everyday recycling bin. Batteries can start fires in the recycling truck.'],
    ],
    explain: 'Batteries go to hazardous waste. There they are taken apart safely, so the chemicals don’t leak.',
    hints: ['What is inside a battery?', 'Look at the four bins. One has a warning sign.'],
    pic: scene('battery'),
    model: 'bins',
  },
  // level 2
  {
    id: 'b-years',
    tier: 2,
    ask: 'A plastic bottle lies on the beach for many years. The sun and the waves wear it down. What happens to it?',
    right: 'It breaks into tiny pieces that stay for hundreds of years',
    wrong: [
      ['It rots away, like an apple core', 'plastic-rots', 'An apple rots because tiny living things eat it. Nothing eats plastic.'],
      ['It turns into sand', 'plastic-rots', 'The pieces get very small, but they are still plastic, not sand.'],
    ],
    explain: 'Plastic breaks into smaller and smaller pieces called microplastics. They stay in the sea and sand for hundreds of years.',
    hints: ['Do tiny living things eat plastic the way they eat food?', 'Look at the bottle over the years.'],
    pic: scene('bottle-years'),
    model: 'fact',
  },
  {
    id: 'b-land',
    tier: 2,
    ask: 'The trash on Turtle Beach keeps coming back. Where does most of it start?',
    right: 'On land, upstream: rivers, drains and the wind bring it',
    wrong: [
      ['On ships far out at sea', 'beach-source', 'Ships drop some trash, but most beach trash starts somewhere else.'],
      ['People at the beach drop all of it', 'beach-source', 'Some is dropped here, but the beach was clean yesterday. More came in.'],
    ],
    explain: 'Most trash on beaches starts on land. Wind, rain, drains and rivers carry it down to the sea.',
    hints: ['The beach was clean yesterday. How did new trash arrive?', 'Look at the path from the town to the sea.'],
    pic: scene('park'),
    model: 'path',
  },
  {
    id: 'b-refill',
    tier: 2,
    ask: 'Recycling is good. But which is better for the sea: a new bottle you recycle each day, or one bottle you refill?',
    right: 'One bottle you refill',
    wrong: [
      ['A new bottle each day, recycled', 'recycle-all', 'Recycling helps, but making each new bottle still uses energy, and some never get recycled.'],
      ['They are just as good', 'recycle-all', 'One way makes a lot more plastic than the other.'],
    ],
    explain: 'Reduce and reuse come first: they mean less plastic is made at all. Recycle what is left.',
    hints: ['Which way makes less plastic?', 'Think: reduce, reuse, then recycle.'],
    pic: scene('refill'),
    model: 'fact',
  },
  {
    id: 'b-yogurt',
    tier: 2,
    ask: 'A yogurt pot has the recycling symbol on it. It is still full of old yogurt. What should you do?',
    right: 'Rinse it out, then recycle it',
    wrong: [
      ['Recycle it full', 'recycle-all', 'Old food inside can spoil a whole load of recycling.'],
      ['Put it in the compost', 'bin-mixup', 'The yogurt could rot, but the plastic pot never will.'],
    ],
    explain: 'Recycling must be clean. Rinse the food out, then the pot can be recycled.',
    hints: ['Can old food go in with the recycling?', 'Look at the four bins. Which one is the pot for, once it is clean?'],
    pic: scene('yogurt'),
    model: 'bins',
  },
  {
    id: 'b-ring',
    tier: 2,
    ask: 'Ollie got stuck in a plastic six-pack ring. Why should you cut the rings apart before you throw one away?',
    right: 'So it can’t trap an animal',
    wrong: [
      ['So it takes up less room', 'wrong-reason', 'It does take less room, but that’s not the reason the Squad cuts them.'],
      ['So it rots away faster', 'plastic-rots', 'Cutting it doesn’t make plastic rot. Think about what happened to Ollie.'],
    ],
    explain: 'Cut rings can’t loop around an animal’s neck or body. Ollie was lucky the Squad came along.',
    hints: ['What happened to Ollie?', 'A closed loop can catch an animal. A cut one can’t.'],
    pic: scene('ring'),
    model: 'fact',
  },
  {
    id: 'b-drain',
    tier: 2,
    ask: 'Rain runs off a street into a drain. In most towns, where does that water go?',
    right: 'Straight to a river or the sea, without being cleaned',
    wrong: [
      ['To a plant that cleans the water', 'drain-cleaned', 'In most towns, street drains are not joined to a cleaning plant.'],
      ['Deep under the ground, where it stays', 'drain-cleaned', 'The water doesn’t stay underground. Look where the drain pipe comes out.'],
    ],
    explain: 'Street drains usually run straight to a river or the sea. Anything washed into them goes there too.',
    hints: ['Look at the words painted by the drain.', 'Look at the path the water takes.'],
    pic: scene('drain'),
    model: 'path',
  },
  // level 3
  {
    id: 'b-again',
    tier: 3,
    ask: 'On Monday the Squad cleaned the whole beach. On Tuesday there was trash again. What does that tell us?',
    right: 'The trash keeps coming from somewhere, so we must find the source',
    wrong: [
      ['Cleanups don’t help at all', 'cleanup-enough', 'Cleanups do help the animals today. But something else is going on.'],
      ['Just clean it every day, and that’s enough', 'cleanup-enough', 'Cleaning every day helps, but the trash will never stop coming.'],
    ],
    explain: 'If trash keeps coming back, it is coming from somewhere. Stopping it at the source works better than cleaning forever.',
    hints: ['Where did Tuesday’s trash come from?', 'Look at the path the trash takes to the beach.'],
    pic: scene('beach-again'),
    model: 'path',
  },
  {
    id: 'b-bars',
    tier: 3,
    ask: 'The Squad counted the trash on the beach each morning. The drain net went on on Wednesday. What does the graph show?',
    right: 'Much less trash came after the net went on',
    wrong: [
      ['More trash came after the net went on', 'graph-mixup', 'Compare the bars before Wednesday with the bars after.'],
      ['The net made no difference', 'graph-mixup', 'Look how tall the bars are before and after the net.'],
    ],
    explain: 'Before the net, about 13 pieces came each day. After it, only 2 or 3. The net caught most of the trash.',
    hints: ['Compare the bars before Wednesday with the bars after.', 'Taller bars mean more trash.'],
    pic: { k: 'bars', vals: [14, 12, 3, 2, 3], labels: DAYS, unit: 'pieces of trash', mark: 2 },
    model: 'fact',
  },
  {
    id: 'b-goals',
    tier: 3,
    ask: 'The drain net must catch the trash, let the water flow through and not get blocked up. Which net meets every goal?',
    right: 'Holes as wide as your thumb',
    wrong: [
      ['Holes as wide as your hand', 'design-biggest', 'Water flows through and it never blocks, but small trash slips out.'],
      ['Holes as small as a pea', 'goal-mixup', 'It catches everything, but it blocks up fast and the water spills over.'],
    ],
    explain: 'Medium holes catch bottles, cans and bags, and let the water and fine sand through. That meets all three goals.',
    hints: ['Check each net against all three goals.', 'One net is too big, one is too small.'],
    pic: scene('nets'),
    model: 'loop',
  },
  {
    id: 'b-test',
    tier: 3,
    ask: 'Rafi’s first net blocked up in the rain, and the water spilled over. What should an engineer do next?',
    right: 'Look at what went wrong, change the design and test it again',
    wrong: [
      ['Give up. Nets don’t work.', 'design-first', 'A failed test is useful. It shows what to change.'],
      ['Keep it. The first design is always the best.', 'design-first', 'The test showed a problem. Keeping it the same won’t fix it.'],
    ],
    explain: 'Engineers test, find out what went wrong, improve the design and test again. A failed test is a clue.',
    hints: ['What did the test show?', 'Look at the engineering loop: problem, design, test, improve.'],
    pic: scene('blocked'),
    model: 'loop',
  },
  {
    id: 'b-limits',
    tier: 3,
    ask: 'A design has goals (what it must do) and limits (what we have to work with). Which of these is a limit for the drain net?',
    right: 'We can only use what we found on the beach',
    wrong: [
      ['It must catch the trash', 'goal-mixup', 'That is something the net must do. That makes it a goal.'],
      ['It must let the water through', 'goal-mixup', 'That is something the net must do. That makes it a goal.'],
    ],
    explain: 'Goals are what a design must do. Limits are what we have to work with, like materials, money or time.',
    hints: ['Goals are what it must do. Limits are what we have.', 'Which one is about the materials?'],
    pic: scene('nets'),
    model: 'loop',
  },
  {
    id: 'b-together',
    tier: 3,
    ask: 'One family picks up 10 pieces of litter a week. There are 200 families in town. If every family helps, how many pieces is that each week?',
    right: '2,000 pieces',
    wrong: [
      ['210 pieces', 'wrong-reason', 'That adds the numbers. Each of the 200 families picks up 10.'],
      ['10 pieces. One family can’t make a difference.', 'one-person', 'Each family’s pieces add up. Count them all together.'],
    ],
    explain: '200 families times 10 pieces is 2,000 pieces a week. Small actions add up when everyone helps.',
    hints: ['Every one of the 200 families picks up 10.', 'Multiply: 200 groups of 10.'],
    pic: scene('families'),
    model: 'fact',
  },
];

// ------------------------------------------------------------------ The Harbor and River Mouth (Rafi Haddad)

const HARBOR: QDef[] = [
  // level 1
  {
    id: 'h-floats',
    tier: 1,
    ask: 'Rafi pours a little oil into a glass of water. Where does the oil go?',
    right: 'It floats on top of the water',
    wrong: [
      ['It sinks to the bottom', 'oil-sinks', 'Oil is lighter than the same amount of water. Look at the glass.'],
      ['It mixes in and disappears', 'oil-sinks', 'Oil and water don’t mix. You can still see the oil.'],
    ],
    explain: 'Oil floats on water, because it is lighter than the same amount of water, and the two don’t mix.',
    hints: ['Look at the glass. Where is the yellow layer?', 'Oil and water don’t mix.'],
    pic: scene('oil-glass'),
    model: 'fact',
  },
  {
    id: 'h-feather',
    tier: 1,
    ask: 'A seabird’s feathers keep it warm and dry. Oil makes feathers clump together. Why is that a problem?',
    right: 'The feathers can’t keep the bird warm and dry',
    wrong: [
      ['It makes the bird fly faster', 'wrong-reason', 'Clumped feathers make flying harder, not easier.'],
      ['It isn’t a problem. Birds shake the oil off.', 'wrong-reason', 'Oil is sticky. It doesn’t shake off like water.'],
    ],
    explain: 'Oily feathers clump and let cold water in, so the bird gets cold. Rescuers wash oily birds gently.',
    hints: ['What do feathers do for a bird?', 'Look at the clean feather and the oily one.'],
    pic: scene('feather'),
    model: 'fact',
  },
  {
    id: 'h-first',
    tier: 1,
    ask: 'A fishing boat is leaking fuel into the harbor. What should the Squad do first?',
    right: 'Stop the leak',
    wrong: [
      ['Clean up the oil, and leave the leak for later', 'leak-later', 'While the leak drips, more oil keeps coming. The cleanup would never end.'],
      ['Wait for the tide to wash it away', 'leak-later', 'The tide only spreads the oil further along the coast.'],
    ],
    explain: 'Stop the source first. While it leaks, more oil keeps coming, and the cleanup never ends.',
    hints: ['While it leaks, does the oil stop coming?', 'Look at the path: where does the oil start?'],
    pic: scene('boat'),
    model: 'path',
  },
  {
    id: 'h-ghost',
    tier: 1,
    ask: 'A fishing net is lost in the sea. The fishers can’t find it. What happens to the net?',
    right: 'It keeps catching fish and other animals',
    wrong: [
      ['It stops catching anything', 'net-harmless', 'A net doesn’t know it is lost. It still traps what swims into it.'],
      ['It rots away in a few days', 'plastic-rots', 'Most nets are made of plastic. They last for many years.'],
    ],
    explain: 'Lost nets are called ghost nets. They keep catching animals for years, so the Squad pulls them out.',
    hints: ['Does a net stop working when no one is using it?', 'What are most nets made of?'],
    pic: scene('ghost'),
    model: 'fact',
  },
  {
    id: 'h-boom',
    tier: 1,
    ask: 'An oil boom is a floating fence. What does it do?',
    right: 'It keeps the oil in one place on the water',
    wrong: [
      ['It sinks the oil to the bottom', 'oil-sinks', 'The boom floats on top, just like the oil.'],
      ['It turns the oil into water', 'wrong-reason', 'Nothing turns oil into water. Look at what the boom is around.'],
    ],
    explain: 'Oil floats, so a floating fence can hold it in one place. Then it can be soaked up with pads.',
    hints: ['Does oil float or sink?', 'Look at the boom. What is inside it?'],
    pic: scene('boom'),
    model: 'fact',
  },
  {
    id: 'h-pads',
    tier: 1,
    ask: 'The pads soaked up the oil. Now they are full of oil. Where should they go?',
    right: 'To a safe hazardous waste place',
    wrong: [
      ['Back into the sea', 'wrong-reason', 'Then the oil would be back in the sea too.'],
      ['In the recycling bin', 'bin-mixup', 'Oily pads would spoil the recycling. Oil needs special care.'],
    ],
    explain: 'Oily pads are hazardous waste. They go somewhere safe, so the oil never reaches the water again.',
    hints: ['What is soaked into the pads?', 'Look at the four bins. One is for dangerous things.'],
    pic: scene('pads'),
    model: 'bins',
  },
  // level 2
  {
    id: 'h-spread',
    tier: 2,
    ask: 'A spoonful of oil lands on still water. What does it do?',
    right: 'It spreads out into a very thin, wide layer',
    wrong: [
      ['It stays in one round drop', 'oil-stays', 'Watch the drop. Oil keeps spreading across the water.'],
      ['It sinks', 'oil-sinks', 'Oil is lighter than water, so it stays on top.'],
    ],
    explain: 'Oil spreads across water into a very thin layer, often with a rainbow shine. A little oil covers a big area.',
    hints: ['Does oil float or sink?', 'Look at the drop as time goes by.'],
    pic: scene('spread'),
    model: 'fact',
  },
  {
    id: 'h-sealed',
    tier: 2,
    ask: 'The boom is made of bottles tied to a rope. Why must each bottle have its cap on?',
    right: 'The air inside makes it float. Open bottles fill with water and sink.',
    wrong: [
      ['Caps make the bottles heavier', 'wrong-reason', 'A cap weighs very little. Think about what is inside the bottle.'],
      ['So the oil can get inside them', 'wrong-reason', 'The boom holds the oil outside the bottles.'],
    ],
    explain: 'A sealed bottle is full of air, so it floats. An open one fills with water and sinks, and the boom sinks with it.',
    hints: ['What is inside a sealed, empty bottle?', 'Look at the two bottles in the water.'],
    pic: scene('bottles'),
    model: 'fact',
  },
  {
    id: 'h-patch',
    tier: 2,
    ask: 'Tape on the leak peeled off in the water. A bucket under the drip filled up and spilled. Which fix stops the leak?',
    right: 'A metal patch sealed onto the tank',
    wrong: [
      ['More tape', 'design-first', 'The same design fails the same way. Water loosens tape.'],
      ['A bigger bucket', 'cleanup-enough', 'A bucket catches the fuel, but the leak keeps going.'],
    ],
    explain: 'A sealed metal patch closes the hole, so the leak stops. A bucket only catches the fuel that leaks.',
    hints: ['Which one closes the hole?', 'Look at the engineering loop: what did each test show?'],
    pic: scene('patches'),
    model: 'loop',
  },
  {
    id: 'h-netbin',
    tier: 2,
    ask: 'The harbor has a bin just for old nets and rope. Why?',
    right: 'So old fishing gear is recycled, not lost in the sea',
    wrong: [
      ['Nets are just trash, so it doesn’t matter', 'net-harmless', 'A net lost at sea keeps catching animals. Where it goes matters.'],
      ['To keep the gulls fed', 'wrong-reason', 'Gulls don’t eat nets. They can get tangled in them.'],
    ],
    explain: 'Old nets and rope go in the net bin to be recycled, so they never become ghost nets.',
    hints: ['What happens to a net lost at sea?', 'Look at the net bin on the dock.'],
    pic: scene('netbin'),
    model: 'fact',
  },
  {
    id: 'h-soap',
    tier: 2,
    ask: 'Rescuers wash oily birds with gentle dish soap and warm water. Why soap, not just water?',
    right: 'Soap breaks up the oil so the water can rinse it away',
    wrong: [
      ['Water alone mixes with oil', 'oil-sinks', 'Oil and water don’t mix, so water alone runs right off.'],
      ['Soap makes the oil sink', 'oil-sinks', 'Soap doesn’t sink the oil. Look at the bowl.'],
    ],
    explain: 'Oil and water don’t mix, but soap breaks oil into tiny drops that water can carry away.',
    hints: ['Do oil and water mix?', 'Look at the oil in the soapy bowl.'],
    pic: scene('soap'),
    model: 'fact',
  },
  {
    id: 'h-mouth',
    tier: 2,
    ask: 'The harbor is where the river meets the sea. Why does trash from the town end up here?',
    right: 'The river carries it downstream to the sea',
    wrong: [
      ['The sea pushes it up the river into town', 'beach-source', 'Rivers flow downhill, from the town to the sea.'],
      ['Gulls carry it all here', 'wrong-reason', 'Gulls move a little, but something much bigger carries the trash.'],
    ],
    explain: 'Rivers flow downhill to the sea, and they carry trash from upstream with them. The harbor is at the end of the trip.',
    hints: ['Which way does a river flow?', 'Look at the path from the town to the sea.'],
    pic: scene('rivermouth'),
    model: 'path',
  },
  // level 3
  {
    id: 'h-prevent',
    tier: 3,
    ask: 'Cleaning up an oil spill is slow and costs a lot. Why do engineers say preventing a spill is best?',
    right: 'With no spill, no animals are harmed and no cleanup is needed',
    wrong: [
      ['Preventing a spill is more fun', 'wrong-reason', 'That isn’t the reason. Think about the animals and the cleanup.'],
      ['A cleanup always gets every drop back', 'cleanup-enough', 'Cleanups never get all the oil back, and animals can be harmed first.'],
    ],
    explain: 'A spill that never happens harms no animals and needs no cleanup. That is why fixing leaks early matters.',
    hints: ['Does a cleanup ever get all the oil back?', 'What happens to the animals while the oil is in the water?'],
    pic: scene('boat'),
    model: 'path',
  },
  {
    id: 'h-booms',
    tier: 3,
    ask: 'The boom must float, hold the oil when waves come, and use what we found. Which design meets every goal?',
    right: 'Sealed bottles tied along a rope',
    wrong: [
      ['Just a rope', 'design-biggest', 'A rope alone sinks, and the oil floats right over it.'],
      ['Open bottles on a rope', 'goal-mixup', 'Open bottles fill with water and sink, so it fails the first goal.'],
    ],
    explain: 'Sealed bottles float, the rope holds them together in the waves, and both were found as trash.',
    hints: ['Check each design: does it float?', 'Which bottles stay full of air?'],
    pic: scene('booms'),
    model: 'loop',
  },
  {
    id: 'h-skirt',
    tier: 3,
    ask: 'In big waves, oil splashes over the top of the boom. How could Rafi improve the design?',
    right: 'Hang a curtain, called a skirt, under the floats',
    wrong: [
      ['Take the boom away', 'design-first', 'Without a boom, all the oil spreads. Improve it instead.'],
      ['Paint it a brighter color', 'wrong-reason', 'A color doesn’t stop oil. What would stop it getting past?'],
    ],
    explain: 'Real booms have a skirt hanging under the water. It stops oil slipping underneath when the waves move it.',
    hints: ['Where does the oil get past?', 'Look at the boom with a curtain hanging under it.'],
    pic: scene('skirt'),
    model: 'loop',
  },
  {
    id: 'h-graph',
    tier: 3,
    ask: 'The leak was patched on Monday. The Squad measured the oil in the harbor each day. What does the graph show?',
    right: 'The oil went down day by day',
    wrong: [
      ['The oil went up', 'graph-mixup', 'Read the bars from Monday to Friday. Are they getting taller or shorter?'],
      ['The oil stayed the same', 'graph-mixup', 'Compare Monday’s bar with Friday’s.'],
    ],
    explain: 'The bars get shorter each day. With the leak stopped and the boom and pads working, the oil went down.',
    hints: ['Read the bars from left to right.', 'Shorter bars mean less oil.'],
    pic: { k: 'bars', vals: [9, 6, 4, 2, 1], labels: DAYS, unit: 'oil reading' },
    model: 'fact',
  },
  {
    id: 'h-plan',
    tier: 3,
    ask: 'Fishing boats need fuel. Which plan keeps the harbor cleanest?',
    right: 'Check the tanks often and fix small leaks early',
    wrong: [
      ['Only fix a leak after a big spill', 'leak-later', 'By then the oil is already in the water.'],
      ['Clean the harbor once a year', 'cleanup-enough', 'A whole year of small leaks adds up to a lot of oil.'],
    ],
    explain: 'Checking often and fixing small leaks early stops oil before it reaches the water. That is prevention.',
    hints: ['Which plan stops oil before it reaches the water?', 'Small leaks add up.'],
    pic: scene('boat'),
    model: 'path',
  },
  {
    id: 'h-together',
    tier: 3,
    ask: 'Who can help keep the harbor clean?',
    right: 'Everyone: fishers, families, the town and the Squad, together',
    wrong: [
      ['Only scientists', 'one-person', 'Scientists help, but so can everyone who uses the harbor.'],
      ['No one. The sea cleans itself.', 'cleanup-enough', 'Oil and plastic stay for a long time. People have to help.'],
    ],
    explain: 'Fishers fix leaks and use the net bin, families take their trash home, and the town makes rules. It works best together.',
    hints: ['Who uses the harbor?', 'Many small actions add up.'],
    pic: scene('harbor-people'),
    model: 'fact',
  },
];

const BANKS: Record<Station, QDef[]> = { beach: BEACH, harbor: HARBOR };

export type Rand = () => number;

export function shuffle<T>(r: Rand, list: readonly T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1)) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function bank(s: Station): QDef[] {
  return BANKS[s] ?? [];
}

export function build(station: Station, d: QDef, r: Rand): Question {
  const choices: Choice[] = shuffle(r, [
    { value: 'right', label: d.right, correct: true },
    ...d.wrong.map(([label, misconception, why], i) => ({ value: `wrong${i}`, label, correct: false, misconception, why })),
  ]);
  return { id: d.id, station, tier: d.tier, ask: d.ask, choices, explain: d.explain, hints: d.hints, pic: d.pic, model: d.model };
}

/** A question at this level, avoiding the ones seen lately. */
export function makeQuestion(s: Station, tier: Tier, r: Rand, recent: readonly string[] = []): Question {
  const pool = bank(s).filter((d) => d.tier === tier);
  if (!pool.length) throw new Error(`No questions for ${s} at level ${tier}`);
  const fresh = pool.filter((d) => !recent.includes(d.id));
  const from = fresh.length ? fresh : pool;
  return build(s, from[Math.floor(r() * from.length) % from.length], r);
}

// ------------------------------------------------------------------ the sorting station

/** Materials you keep for crafting (they never go in a bin). */
export const MATERIALS: TrashId[] = ['bottle', 'net', 'rope', 'wood'];

export function isMaterial(id: TrashId): boolean {
  return MATERIALS.includes(id);
}

/** The right bin for a piece of trash that isn't a material. */
export function binFor(id: TrashId): BinKind {
  const b = TRASH[id].bin;
  if (b === 'reuse' || isMaterial(id)) throw new Error(`${id} is a material, not for a bin`);
  return b;
}

/** Why a piece of trash goes in its bin (said after a right answer). */
export const SORT_RIGHT: Partial<Record<TrashId, string>> = {
  can: 'Metal cans are melted down and made into new cans, again and again.',
  glass: 'Glass can be melted and made into new bottles, again and again.',
  cap: 'Small plastic caps go in with the recycling, so they don’t end up in a bird’s stomach.',
  peel: 'Food scraps rot. In compost, worms and tiny living things turn them into rich soil.',
  wrapper: 'Wrappers are made of mixed materials glued together, so they can’t be recycled.',
  bag: 'Most recycling bins can’t take plastic bags. Some shops collect them, but here it goes in the trash.',
  ring: 'Cut up first, so it can never trap an animal. Then it goes in the trash.',
  battery: 'Batteries have chemicals inside. Hazardous waste takes them apart safely.',
};

/** Why a piece of trash does NOT go in the bin picked (said after a wrong answer). */
export function sortWhy(id: TrashId, picked: BinKind): string {
  const right = binFor(id);
  if (picked === right) return SORT_RIGHT[id] ?? '';
  if (picked === 'compost') return 'Compost is for food scraps and plants. This won’t rot away.';
  if (picked === 'hazard') return 'Hazardous waste is for dangerous things, like batteries and chemicals. This is safe to handle.';
  if (picked === 'recycle') {
    if (id === 'battery') return 'Not the everyday recycling bin: batteries can start fires in the recycling truck.';
    if (id === 'peel') return 'Recycling is for cans, glass and some plastic. A peel is food.';
    return 'This can’t be recycled in the everyday bin. Look at what it is made of.';
  }
  // trash
  if (id === 'battery') return 'In the trash, the chemicals inside could leak into the ground.';
  if (id === 'peel') return 'Trash goes to a landfill. Food scraps can turn into something useful instead.';
  return 'This doesn’t need to be thrown away. It can be made into something new.';
}

// ------------------------------------------------------------------ the blueprints (half 1)

export type RecipeId = 'bin-lids' | 'drain-net' | 'tank-patch' | 'boom' | 'net-bin';

/** The Workbench blueprints. Every recipe has exactly one design that works; the others half work, and the test says why. */
export const RECIPES: Record<RecipeId, Recipe> = {
  'bin-lids': {
    id: 'bin-lids',
    name: 'Bin lids',
    needs: { wood: 1, rope: 1 },
    goals: ['Keep the trash inside the bins', 'Easy for people to open and use'],
    limits: ['Use what we found on the beach'],
    designs: [
      { id: 'none', name: 'No lid', note: 'Leave the bins open', outcome: 'half', why: 'The gulls pull out food wrappers, and the wind blows light trash out onto the sand.' },
      { id: 'loose', name: 'A loose lid', note: 'A board laid on top', outcome: 'half', why: 'It stops the gulls, but a gust of wind lifts the board off and the trash blows away.' },
      {
        id: 'clip',
        name: 'A clip-shut lid',
        note: 'A board held down with a rope loop',
        outcome: 'works',
        why: 'The rope loop holds the lid down in the wind, the gulls can’t lift it, and people can still open it.',
      },
    ],
  },
  'drain-net': {
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
  },
  'tank-patch': {
    id: 'tank-patch',
    name: 'Fuel tank fix',
    needs: { can: 2 },
    goals: ['Stop the fuel leaking into the water', 'Stay fixed when the boat rocks and gets wet'],
    limits: ['Use what we found, and Rafi’s sealant'],
    designs: [
      { id: 'tape', name: 'Tape', note: 'Tape over the hole', outcome: 'half', why: 'It stops the drip for a moment, but water loosens the tape and it peels off. The leak starts again.' },
      { id: 'bucket', name: 'A bucket', note: 'Catch the drips', outcome: 'half', why: 'It catches some fuel, but the hole is still there. The bucket fills up, spills, and the boat rocks it over.' },
      {
        id: 'patch',
        name: 'A metal patch',
        note: 'Flattened cans sealed over the hole',
        outcome: 'works',
        why: 'The metal patch is sealed tight over the hole, so no more fuel can leak out. The source is stopped.',
      },
    ],
  },
  boom: {
    id: 'boom',
    name: 'Oil boom',
    needs: { bottle: 4, rope: 2 },
    goals: ['Float on the water', 'Hold the oil in one place, even in waves', 'Use what we found'],
    limits: ['Bottles and rope from the harbor'],
    designs: [
      { id: 'rope', name: 'Just a rope', note: 'A rope across the water', outcome: 'half', why: 'A rope alone soaks up water and sinks under the oil, and the oil floats right over it.' },
      { id: 'open', name: 'Open bottles', note: 'Bottles with no caps, on a rope', outcome: 'half', why: 'The open bottles fill with water and sink, one by one. The oil drifts out over them.' },
      {
        id: 'sealed',
        name: 'Sealed bottles',
        note: 'Bottles with their caps on, on a rope',
        outcome: 'works',
        why: 'Full of air, the sealed bottles float, and the rope holds them together in a ring around the oil.',
      },
    ],
  },
  'net-bin': {
    id: 'net-bin',
    name: 'Net bin',
    needs: { wood: 3 },
    goals: ['Keep old nets and rope safe until they are recycled', 'Not let anything blow or wash away'],
    limits: ['Wood from the harbor'],
    designs: [
      { id: 'crate', name: 'An open crate', note: 'A box with no top', outcome: 'half', why: 'The wind tugs nets out, and gulls pull at the rope. Some of it ends up back in the water.' },
      { id: 'sack', name: 'A plastic sack', note: 'A big bag tied to a post', outcome: 'half', why: 'It holds the nets for a day, then the sharp hooks and the sun tear it open.' },
      {
        id: 'lid',
        name: 'A bin with a lid',
        note: 'Slats, a lid and drain holes',
        outcome: 'works',
        why: 'The lid keeps the nets in, the slats let rain drain out, and fishers can drop old gear in on the way home.',
      },
    ],
  },
};
