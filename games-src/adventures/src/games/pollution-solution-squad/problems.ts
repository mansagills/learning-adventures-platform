/**
 * Pollution Solution Squad: the science, as data and pure functions (no
 * drawing, no timers) so every rule can be unit tested.
 *
 * Each stretch of the coast has a question bank at three levels, asked at the
 * water test between its two levels and in the Squad Journal at the end.
 * Four stretches, followed upstream:
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
 *   The Wetland (Dr. Wen Li): clean water and the wetland
 *     1. wetlands filter water and soak up floods; mud blocks sunlight;
 *        reading the oxygen gauge; wetlands as nurseries; native plants
 *        (3-LS4-4, 5-ESS2-1)
 *     2. fertilizer feeds algae; dead algae uses up the oxygen; clear water
 *        can still be polluted; more fertilizer is not better; how reed
 *        roots help (5-ESS3-1)
 *     3. the filter layers in order; a bar graph of the oxygen; a changed
 *        habitat; improving a failed design; fixing the source; why a
 *        wetland is worth keeping (3-LS4-4, 3-5-ETS1-3)
 *   Farm and Town (Rosa Delgado): fixing it at the source
 *     1. storm drains go straight to the river; rain washes bare soil away;
 *        chimneys and engines dirty the air; roots hold soil (5-ESS3-1)
 *     2. buffer strips, cover crops, rain gardens and rain barrels; the
 *        right amount of fertilizer at the right time; engines off while
 *        waiting (5-ESS3-1, 4-ESS3-1)
 *     3. tracing pollution from source to sea; the best place for a fix;
 *        comparing designs against the goal; a bar graph of the mud; a
 *        town plan that meets every goal; many small actions add up
 *        (3-5-ETS1-1, 3-5-ETS1-2, 5-ESS3-1)
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

export type Station = 'beach' | 'harbor' | 'wetland' | 'town';
export const STATIONS: Station[] = ['beach', 'harbor', 'wetland', 'town'];
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
  | 'wetland-useless' // thinks a wetland is a useless swamp
  | 'mud-harmless' // thinks muddy water does no harm to the plants and animals in it
  | 'gauge-mixup' // read the water test gauges wrong
  | 'any-plant' // thinks any plant suits a habitat as well as the native ones
  | 'more-fertilizer' // thinks more fertilizer is always better, or that it stays on the field
  | 'algae-good' // thinks lots of algae is good for the fish
  | 'looks-clean' // thinks water (or a fix) that looks clean is clean
  | 'filter-order' // put the filter layers in an order that clogs or leaks
  | 'bare-soil' // thinks bare soil stays put in the rain
  | 'air-factories' // thinks only factories make air pollution, or that smoke vanishes
  | 'wrong-place' // picked a place for a fix that can't catch the pollution in time
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
  | 'harbor-people' // fishers, a family, the mayor and the Squad at the harbor
  | 'reeds-clean' // muddy water flowing into the reeds and clear water coming out
  | 'sponge' // storm rain soaking into the wetland, the town safe behind it
  | 'muddy' // sunlight reaching plants in clear water, and not in muddy water
  | 'gasp' // fish gasping at the surface of green water
  | 'nursery' // young fish, a nest and frog eggs among the reeds
  | 'reeds' // native reeds and cattails
  | 'green-pond' // a pond covered in green algae
  | 'two-glasses' // two clear glasses of water and a test strip
  | 'fertilizer' // a sack of fertilizer by a field, and the river below
  | 'channel' // trash blocking the channel into the reeds
  | 'filters' // three filters with their layers in different orders
  | 'heron-fish' // a heron by an empty pond, and fish swimming away
  | 'bare-field' // brown water running off a bare field into the river
  | 'mill-bus' // the smoking mill and an idling bus
  | 'buffer' // a field, a strip of tall plants, then the river
  | 'cover-crop' // a bare field beside a field of green cover crop
  | 'rain-garden' // a house, its roof water running into a rain garden
  | 'barrel' // a house with a rain barrel under the gutter
  | 'mills' // three mill designs: tall, painted, filtered
  | 'council' // the town council with Rosa, farmers and the Squad
  | 'valley'; // the whole valley from the hills to the sea, with arrows

export type Pic = { k: 'scene'; s: Scene } | { k: 'bars'; vals: number[]; labels: string[]; unit: string; mark?: number; markLabel?: string };

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

// ------------------------------------------------------------------ The Wetland (Dr. Wen Li)

const WETLAND: QDef[] = [
  // level 1
  {
    id: 'w-filter-job',
    tier: 1,
    ask: 'Water from the farms and the town flows slowly through the wetland’s reeds and mud before it reaches the sea. What does the wetland do to that water?',
    right: 'It cleans it: mud sinks, and plants take up extra fertilizer',
    wrong: [
      ['Nothing. A wetland is just a muddy swamp.', 'wetland-useless', 'Look at the water going in and the water coming out. Is it the same?'],
      ['It makes the water dirtier', 'wetland-useless', 'The water leaving the reeds is clearer than the water going in. Look again.'],
    ],
    explain: 'A wetland is nature’s water filter. Slow water drops its mud, and the plants’ roots take up the extra fertilizer.',
    hints: ['Compare the water going in and coming out.', 'What happens to mud when water slows down?'],
    pic: scene('reeds-clean'),
    model: 'fact',
  },
  {
    id: 'w-sponge',
    tier: 1,
    ask: 'A big storm brings lots of rain. The wetland’s soft ground soaks it up like a sponge, then lets it out slowly. How does that help the town downstream?',
    right: 'There is less flooding',
    wrong: [
      ['It makes the floods worse', 'wetland-useless', 'A sponge holds water. Does that send more water rushing downstream, or less?'],
      ['It doesn’t change anything', 'wetland-useless', 'Think about where the rain goes when the ground soaks it up.'],
    ],
    explain: 'A wetland holds storm water and lets it out slowly, so the river downstream doesn’t rise as fast. That means less flooding.',
    hints: ['What does a sponge do with water?', 'If the water comes out slowly, does the river rise fast or slowly?'],
    pic: scene('sponge'),
    model: 'fact',
  },
  {
    id: 'w-muddy',
    tier: 1,
    ask: 'Muddy water is brown and cloudy. Underwater plants need sunlight to grow. What does the mud do to them?',
    right: 'It blocks the sunlight, so they can’t grow well',
    wrong: [
      ['It feeds them, so they grow faster', 'mud-harmless', 'Look at the sunlight in the picture. How far does it reach in the brown water?'],
      ['Nothing. Plants don’t need light underwater.', 'mud-harmless', 'Underwater plants make their food from sunlight, just like plants on land.'],
    ],
    explain: 'Mud makes the water cloudy, so sunlight can’t reach the plants on the bottom. Without light they can’t make food.',
    hints: ['What do plants need to make their food?', 'Look how far the light reaches in the clear water and in the muddy water.'],
    pic: scene('muddy'),
    model: 'fact',
  },
  {
    id: 'w-gauge',
    tier: 1,
    ask: 'Dr. Wen’s test kit has four gauges: trash, oil, cloudiness and oxygen. The oxygen gauge reads very low. Who has a problem?',
    right: 'The fish: they need oxygen in the water to breathe',
    wrong: [
      ['Nobody. Fish don’t need oxygen.', 'gauge-mixup', 'Fish breathe oxygen too. They take it from the water with their gills.'],
      ['Only the birds flying above', 'gauge-mixup', 'This gauge measures the water. Who lives in the water?'],
    ],
    explain: 'Fish take oxygen out of the water with their gills. When the oxygen is low, they gasp at the surface.',
    hints: ['The gauge measures the water. Who breathes in the water?', 'Look at the fish at the top of the water.'],
    pic: scene('gasp'),
    model: 'fact',
  },
  {
    id: 'w-nursery',
    tier: 1,
    ask: 'Young fish hide among the reeds. Birds nest in them, and frogs lay eggs in the shallow water. Why do so many animals need wetlands?',
    right: 'Wetlands give them food, shelter and a safe place for their young',
    wrong: [
      ['They don’t. They could live anywhere.', 'wetland-useless', 'Where would the young fish hide without the reeds?'],
      ['Only because the water is warm', 'wrong-reason', 'Warm water is part of it, but look at what the reeds give the animals.'],
    ],
    explain: 'Wetlands are nurseries. The reeds give food and hiding places, so many young fish, birds and frogs grow up there.',
    hints: ['Look at where the young animals are hiding.', 'What do young animals need to grow up safely?'],
    pic: scene('nursery'),
    model: 'fact',
  },
  {
    id: 'w-native',
    tier: 1,
    ask: 'The Squad is replanting the wetland. Native reeds and cattails grow here naturally. Why plant those, and not a garden plant from far away?',
    right: 'They grow well in wet ground, local animals use them, and their roots clean the water',
    wrong: [
      ['Any plant works the same', 'any-plant', 'Lawn grass drowns in wet ground, and local animals don’t use it. Do all plants suit a wetland?'],
      ['Plants from far away always grow better', 'any-plant', 'Plants from far away may not survive the wet, or they may take over and crowd out the rest.'],
    ],
    explain: 'Native plants belong here. They grow in wet mud, animals know how to use them, and their roots clean the water.',
    hints: ['Which plants grow in this wetland on their own?', 'Think about the animals that live here. Which plants do they use?'],
    pic: scene('reeds'),
    model: 'fact',
  },
  // level 2
  {
    id: 'w-fertilizer',
    tier: 2,
    ask: 'Farmers spread fertilizer to help their crops grow. Rain washes the extra fertilizer into the river. What does it feed in the water?',
    right: 'Algae, which grows into a thick green layer',
    wrong: [
      ['Nothing. Fertilizer only works on land.', 'more-fertilizer', 'Fertilizer feeds plants wherever it lands. Algae are tiny water plants.'],
      ['The fish, so they grow bigger', 'more-fertilizer', 'Fish don’t eat fertilizer. What green thing in the pond grows from it?'],
    ],
    explain: 'Fertilizer feeds algae just as it feeds crops. Too much of it, and the algae covers the water in a thick green layer.',
    hints: ['Fertilizer feeds plants. Are there plants in the water?', 'Look at the green layer on the pond.'],
    pic: scene('green-pond'),
    model: 'path',
  },
  {
    id: 'w-oxygen',
    tier: 2,
    ask: 'The green algae grows fast, then dies. Tiny decomposers eat the dead algae, and they use up oxygen as they work. What happens to the fish?',
    right: 'They gasp at the surface, because the water has too little oxygen',
    wrong: [
      ['Nothing. Algae is food, so the fish are happy.', 'algae-good', 'A little algae is food for some animals. But what do the decomposers use up?'],
      ['They grow faster', 'algae-good', 'Look at the fish at the surface. Do they look well?'],
    ],
    explain: 'Decomposers breaking down the dead algae use up the oxygen in the water. The fish have too little to breathe.',
    hints: ['What do the decomposers use up while they work?', 'What do fish need from the water to breathe?'],
    pic: scene('gasp'),
    model: 'fact',
  },
  {
    id: 'w-clear',
    tier: 2,
    ask: 'Two glasses of water look exactly the same: clear. Dr. Wen tests them, and one has fertilizer and chemicals in it. How can you tell which one?',
    right: 'Test it: some pollution can’t be seen',
    wrong: [
      ['Look at it: clear water is always clean', 'looks-clean', 'Both glasses look clear, but one is polluted. Can your eyes see everything in water?'],
      ['Smell it: dirty water always smells', 'looks-clean', 'Many chemicals have no smell. What does a scientist use?'],
    ],
    explain: 'Clear water isn’t always clean. Fertilizer and many chemicals are invisible, so scientists test the water to know.',
    hints: ['The two glasses look the same. Does that mean they are the same?', 'What is in Dr. Wen’s hand?'],
    pic: scene('two-glasses'),
    model: 'fact',
  },
  {
    id: 'w-more',
    tier: 2,
    ask: 'A farmer thinks: “Fertilizer helps my crops, so twice as much will help them twice as much.” What happens to the extra?',
    right: 'The crops can’t use it all, so rain washes it into the river',
    wrong: [
      ['The crops grow twice as big', 'more-fertilizer', 'Plants can only take up so much. Where does the rest go when it rains?'],
      ['It stays in the soil forever', 'more-fertilizer', 'Rain soaks through and runs over the soil. What does it carry with it?'],
    ],
    explain: 'Crops only use what they need. The rest washes into the river, where it feeds algae. More is not better.',
    hints: ['Can a plant eat more and more forever?', 'Where does rain carry what the crops don’t use?'],
    pic: scene('fertilizer'),
    model: 'path',
  },
  {
    id: 'w-roots',
    tier: 2,
    ask: 'Reed roots take up fertilizer from the water to grow. Their stems slow the water down, so the mud sinks. How does that help the fish?',
    right: 'Less fertilizer means less algae, and clearer water lets the light in',
    wrong: [
      ['The reeds make the water warmer', 'wrong-reason', 'Warmth isn’t what changed. What do the roots take out of the water?'],
      ['The fish eat the reeds', 'wrong-reason', 'Some fish nibble plants, but that isn’t why the water got better. What do the roots take up?'],
    ],
    explain: 'The roots use up the fertilizer, so there is less algae and more oxygen. The slow water drops its mud, so light gets in.',
    hints: ['What do the roots take out of the water?', 'Less fertilizer means less of what green thing?'],
    pic: scene('reeds-clean'),
    model: 'fact',
  },
  {
    id: 'w-channel',
    tier: 2,
    ask: 'Trash blocks the channel into the reeds, so the river water flows around them instead. Why clear the channel?',
    right: 'The water has to flow through the reeds to be cleaned',
    wrong: [
      ['It doesn’t matter where the water flows', 'wetland-useless', 'The reeds clean the water. Can they clean water that never reaches them?'],
      ['So the trash floats out to sea', 'cleanup-enough', 'We want the trash out of the water, not sent downstream.'],
    ],
    explain: 'Reeds only clean the water that flows through them. Clearing the channel sends the river through the wetland’s filter.',
    hints: ['Where do the reeds do their cleaning?', 'Look at where the water goes when the channel is blocked.'],
    pic: scene('channel'),
    model: 'fact',
  },
  // level 3
  {
    id: 'w-order',
    tier: 3,
    ask: 'The Squad builds a filter. Dirty water goes in at the top. The layers are big stones, gravel and fine sand. Which order, from top to bottom, works without clogging?',
    right: 'Stones, then gravel, then sand',
    wrong: [
      ['Sand, then gravel, then stones', 'filter-order', 'Fine sand on top catches the leaves and twigs straight away, and it clogs. What should catch the big things first?'],
      ['All mixed together', 'filter-order', 'Mixed up, the water finds paths around the sand and comes out muddy.'],
    ],
    explain: 'Big stones catch the twigs and leaves, gravel catches the grit, and fine sand catches the mud. Each layer catches smaller things.',
    hints: ['Which layer should catch the biggest things?', 'Think from big to small, top to bottom.'],
    pic: scene('filters'),
    model: 'loop',
  },
  {
    id: 'w-graph',
    tier: 3,
    ask: 'Dr. Wen measured the oxygen in the water each week. The reeds were planted in week 3. What does the graph show?',
    right: 'The oxygen went up after the reeds were planted',
    wrong: [
      ['The oxygen went down after the reeds', 'graph-mixup', 'Look at the bars after the red line. Are they taller or shorter?'],
      ['The oxygen stayed the same', 'graph-mixup', 'Compare the bars before and after the red line.'],
    ],
    explain: 'After week 3 the bars grow taller. With less algae, the water held more oxygen, and the fish came back.',
    hints: ['Find the red line: that’s when the reeds were planted.', 'Are the bars after the line taller or shorter?'],
    pic: { k: 'bars', vals: [3, 2, 2, 5, 7], labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'], unit: 'oxygen', mark: 3, markLabel: 'Reeds in' },
    model: 'fact',
  },
  {
    id: 'w-heron',
    tier: 3,
    ask: 'The wetland turned green and low in oxygen. The fish swam away or died, and then the herons that eat them left too. Why did the herons leave?',
    right: 'Their food, the fish, was gone',
    wrong: [
      ['Herons don’t like the color green', 'wrong-reason', 'The herons didn’t mind the color. What do they eat?'],
      ['The reeds scared them away', 'wrong-reason', 'Herons hunt among reeds. What did they lose that they need?'],
    ],
    explain: 'Living things depend on each other. When the fish left, the herons lost their food, so they left too. A change in a habitat spreads.',
    hints: ['What does a heron eat?', 'What happened to the fish first?'],
    pic: scene('heron-fish'),
    model: 'fact',
  },
  {
    id: 'w-improve',
    tier: 3,
    ask: 'The first filter let muddy water through. Someone says: “That design failed, so filters don’t work.” What should the Squad do?',
    right: 'Look at what went wrong, change the design and test it again',
    wrong: [
      ['Give up on filters', 'design-first', 'One test showed one design didn’t work. Does that mean no design can?'],
      ['Keep using the muddy filter anyway', 'design-first', 'The test showed a problem. Should we ignore it?'],
    ],
    explain: 'Engineers learn from a failed test. Find what went wrong, improve the design, and test again.',
    hints: ['What do engineers do after a test?', 'Look at the loop: problem, design, test, improve.'],
    pic: scene('filters'),
    model: 'loop',
  },
  {
    id: 'w-source',
    tier: 3,
    ask: 'The reeds and the filter clean the wetland. But fertilizer keeps flowing in from upstream. What would stop the problem for good?',
    right: 'Stop the extra fertilizer where it starts, on the farms',
    wrong: [
      ['Build more and more filters, forever', 'cleanup-enough', 'Filters help, but the fertilizer keeps coming. Where does it start?'],
      ['Nothing can stop it', 'one-person', 'People put the fertilizer on the fields, so people can change how they use it.'],
    ],
    explain: 'Cleaning helps, but the fix that lasts is at the source. Next stop: the farms and the town upstream!',
    hints: ['Where does the fertilizer come from?', 'Follow the river upstream on the map.'],
    pic: scene('green-pond'),
    model: 'path',
  },
  {
    id: 'w-drain',
    tier: 3,
    ask: 'A builder wants to drain the wetland and make a parking lot. What problems would that cause?',
    right: 'More flooding, dirtier water and fewer homes for animals',
    wrong: [
      ['None. A wetland is wasted land.', 'wetland-useless', 'Think of all the jobs the wetland does: the water, the floods, the animals.'],
      ['The cars would have nowhere to park', 'wrong-reason', 'The cars would have a parking lot. What would the river and the animals lose?'],
    ],
    explain: 'A wetland cleans water, soaks up floods and shelters young animals. Without it, the town gets all three problems.',
    hints: ['What three jobs does a wetland do?', 'Water, floods, animals.'],
    pic: scene('sponge'),
    model: 'fact',
  },
];

// ------------------------------------------------------------------ Farm and Town (Rosa Delgado)

const TOWN: QDef[] = [
  // level 1
  {
    id: 't-carwash',
    tier: 1,
    ask: 'Someone washes their car in the street. The soapy, oily water runs into the storm drain. Where does it go?',
    right: 'Straight into the river, with no cleaning',
    wrong: [
      ['To a plant that cleans it', 'drain-cleaned', 'In most towns, storm drains have no cleaning plant. Follow the pipe.'],
      ['It disappears under the street', 'drain-cleaned', 'Water doesn’t disappear. Follow the pipe under the street.'],
    ],
    explain: 'Storm drains carry rain straight to the river. Soap, oil and litter go with it, so only rain should go down a drain.',
    hints: ['What do the words beside the drain say?', 'Follow the drain pipe on the map.'],
    pic: scene('drain'),
    model: 'path',
  },
  {
    id: 't-bare',
    tier: 1,
    ask: 'A field has been plowed, and the soil is bare. A heavy rain falls on it. What happens to the soil?',
    right: 'The rain washes some of it into the river',
    wrong: [
      ['Nothing. Soil stays where it is.', 'bare-soil', 'Look at the brown water running off the field. What is it carrying?'],
      ['The rain makes more soil', 'bare-soil', 'Rain doesn’t make soil. Look at where the brown water goes.'],
    ],
    explain: 'With nothing growing, nothing holds the soil. Heavy rain carries it off the field and into the river, making it muddy.',
    hints: ['Is anything growing to hold the soil?', 'Look at the color of the water leaving the field.'],
    pic: scene('bare-field'),
    model: 'path',
  },
  {
    id: 't-air',
    tier: 1,
    ask: 'Smoke comes out of the mill’s chimney. A bus waits with its engine running. What do both of them make dirty?',
    right: 'The air',
    wrong: [
      ['Only the river', 'air-factories', 'Look where the smoke goes. Is it in the water, or in the sky?'],
      ['Nothing. Smoke just disappears.', 'air-factories', 'The smoke spreads out, but it doesn’t vanish. We still breathe it in.'],
    ],
    explain: 'Smoke from chimneys and engines goes into the air we breathe. It spreads out, but it doesn’t vanish.',
    hints: ['Where does the smoke go?', 'Look at the sky above the mill and the bus.'],
    pic: scene('mill-bus'),
    model: 'fact',
  },
  {
    id: 't-who-air',
    tier: 1,
    ask: 'Which of these make air pollution?',
    right: 'Factories, cars, buses and burning things',
    wrong: [
      ['Only factories', 'air-factories', 'Look at the bus with its engine running. What comes out of the back?'],
      ['Only cars', 'air-factories', 'Cars do, but look at the chimney too.'],
    ],
    explain: 'Air pollution comes from many places: factory chimneys, car and bus engines, and burning wood or trash.',
    hints: ['Look at the whole picture. What is smoking?', 'More than one thing makes smoke.'],
    pic: scene('mill-bus'),
    model: 'fact',
  },
  {
    id: 't-roots',
    tier: 1,
    ask: 'Grass and plants grow along the riverbank. Their roots hold the soil together. What happens when it rains?',
    right: 'Less soil washes into the river',
    wrong: [
      ['More soil washes in', 'bare-soil', 'The roots hold on to the soil. Does that let more go, or less?'],
      ['The plants wash into the river', 'bare-soil', 'Roots hold plants in the ground. What else do they hold?'],
    ],
    explain: 'Roots work like a net in the ground. They hold the soil, so the rain carries much less of it into the river.',
    hints: ['What do roots hold on to?', 'Compare the bank with plants and the bare field.'],
    pic: scene('buffer'),
    model: 'fact',
  },
  {
    id: 't-marker',
    tier: 1,
    ask: 'The Squad paints “Drains to river” beside every storm drain in town. Why?',
    right: 'So people know not to pour or drop anything in',
    wrong: [
      ['To show people where to put their trash', 'drain-cleaned', 'A drain is not a trash bin. Where does it lead?'],
      ['To make the street look nice', 'wrong-reason', 'It does look nice, but what do the words tell people?'],
    ],
    explain: 'Many people think drains go to a cleaning plant. The sign tells them the truth: whatever goes in reaches the river.',
    hints: ['Read the words beside the drain.', 'Where does the drain lead?'],
    pic: scene('drain'),
    model: 'path',
  },
  // level 2
  {
    id: 't-buffer',
    tier: 2,
    ask: 'A wide strip of tall native plants grows between a field and the river. How does it help when it rains?',
    right: 'It slows the water, so soil and fertilizer are caught before the river',
    wrong: [
      ['It makes the rain fall somewhere else', 'wrong-reason', 'Plants can’t move the rain. What do they do to water running across them?'],
      ['It doesn’t. Plants can’t stop water.', 'bare-soil', 'Water slows down as it runs through thick plants. What does slow water drop?'],
    ],
    explain: 'A buffer strip slows the runoff. The soil settles out, and the roots take up fertilizer before it reaches the river.',
    hints: ['What happens to water running through thick plants?', 'What does slow water drop?'],
    pic: scene('buffer'),
    model: 'fact',
  },
  {
    id: 't-cover',
    tier: 2,
    ask: 'After the harvest, a farmer plants a cover crop instead of leaving the field bare all winter. Why?',
    right: 'Its roots hold the soil, so the winter rain can’t wash it away',
    wrong: [
      ['To sell it in winter', 'wrong-reason', 'A cover crop isn’t grown to sell. What does it do for the field?'],
      ['Bare soil is better for the river', 'bare-soil', 'Bare soil washes away in the rain. Where does it end up?'],
    ],
    explain: 'A cover crop covers the soil when nothing else is growing. Its roots hold the soil, and it adds goodness back when it is plowed in.',
    hints: ['What happens to bare soil in the rain?', 'Compare the bare field and the green one.'],
    pic: scene('cover-crop'),
    model: 'fact',
  },
  {
    id: 't-garden',
    tier: 2,
    ask: 'Rain runs off roofs and streets fast. A rain garden is a low patch of plants that fills up in a storm. What does it do?',
    right: 'It soaks the water into the ground, so less runs into the drain',
    wrong: [
      ['It sends the water to the drain faster', 'drain-cleaned', 'The garden is low, like a bowl. Does the water rush past it, or collect in it?'],
      ['It stops the rain from falling', 'wrong-reason', 'Nothing stops the rain. What happens to it after it lands?'],
    ],
    explain: 'A rain garden is like a shallow bowl. It catches the runoff and lets it soak in slowly, and the plants clean it.',
    hints: ['Look at the shape of the garden.', 'Where does the water go when it collects in the garden?'],
    pic: scene('rain-garden'),
    model: 'fact',
  },
  {
    id: 't-timing',
    tier: 2,
    ask: 'Rosa plans when to spread fertilizer. The forecast says heavy rain tomorrow. What is the best plan?',
    right: 'Wait until after the heavy rain, and use only what the crops need',
    wrong: [
      ['Spread it right before the rain, so it soaks in', 'more-fertilizer', 'Heavy rain washes fertilizer off the field. Where does it go?'],
      ['Spread extra, in case some washes away', 'more-fertilizer', 'The extra is exactly what washes into the river.'],
    ],
    explain: 'The right amount at the right time: wait for dry weather, and use only what the crops can take up. Then little washes away.',
    hints: ['What will the heavy rain do to fertilizer on the field?', 'How much do the crops really need?'],
    pic: scene('fertilizer'),
    model: 'fact',
  },
  {
    id: 't-barrel',
    tier: 2,
    ask: 'A rain barrel collects the water from a house’s roof. How does it help the river?',
    right: 'Less water rushes into the storm drain, and the garden gets watered later',
    wrong: [
      ['It cleans the river', 'wrong-reason', 'The barrel never touches the river. What does it catch?'],
      ['It makes more rain', 'wrong-reason', 'A barrel can’t make rain. Where would the roof water go without it?'],
    ],
    explain: 'Without the barrel, roof water rushes down the street into the drain, picking up dirt. The barrel keeps it for the garden.',
    hints: ['Where does roof water go without the barrel?', 'What is the saved water used for later?'],
    pic: scene('barrel'),
    model: 'fact',
  },
  {
    id: 't-idle',
    tier: 2,
    ask: 'A bus waits ten minutes with its engine running. The driver could switch it off. What changes if they do?',
    right: 'Less smoke goes into the air',
    wrong: [
      ['Nothing. A waiting engine makes no smoke.', 'air-factories', 'Look at the back of the waiting bus. What is coming out?'],
      ['The river gets cleaner', 'wrong-reason', 'Engine smoke goes into the air first. What does switching off help most?'],
    ],
    explain: 'An engine makes smoke whenever it runs, even standing still. Switching it off while waiting keeps the air cleaner.',
    hints: ['Is the waiting bus making smoke?', 'What happens to the smoke when the engine stops?'],
    pic: scene('mill-bus'),
    model: 'fact',
  },
  // level 3
  {
    id: 't-trace',
    tier: 3,
    ask: 'Soil washes off a bare field into a stream. Trace its path. Where does it go, in order?',
    right: 'The stream, the river, the wetland, the harbor, then the sea',
    wrong: [
      ['The sea first, then the stream', 'beach-source', 'Water flows downhill. Does it start at the sea or end there?'],
      ['It stays in the field', 'bare-soil', 'The rain carried it off the field. Follow the water downhill.'],
    ],
    explain: 'Water flows downhill, from the fields to the sea. That is why a fix upstream helps every place downstream.',
    hints: ['Which way does water flow: uphill or downhill?', 'Follow the arrows on the map from the hills to the sea.'],
    pic: scene('valley'),
    model: 'path',
  },
  {
    id: 't-spot',
    tier: 3,
    ask: 'The Squad can plant one buffer strip. Where will it catch the most soil from the field?',
    right: 'Between the field and the river, at the bottom of the slope',
    wrong: [
      ['At the top of the hill, far from the river', 'wrong-place', 'Water picks up soil all the way down the hill. Where would the strip catch it before the river?'],
      ['Beside the sea', 'wrong-place', 'By the sea, the soil has already traveled the whole river. Where can it be stopped sooner?'],
    ],
    explain: 'At the bottom of the field, the strip catches the runoff from the whole slope, just before it reaches the river.',
    hints: ['Where does the water go after it runs down the field?', 'Catch it before it reaches the river.'],
    pic: scene('buffer'),
    model: 'path',
  },
  {
    id: 't-mill',
    tier: 3,
    ask: 'The goal is cleaner air for the town. Design A: a taller chimney. Design B: a filter that catches the smoke. Design C: paint the chimney white. Which meets the goal?',
    right: 'B: the filter stops the smoke at its source',
    wrong: [
      ['A: the smoke goes higher', 'design-biggest', 'A taller chimney carries the smoke farther away. Is there any less smoke?'],
      ['C: it looks cleaner', 'looks-clean', 'Paint changes how it looks, not what comes out of the top.'],
    ],
    explain: 'Only the filter makes less smoke. The others move it or hide it. Check each design against the goal.',
    hints: ['What is the goal?', 'Which design means less smoke comes out?'],
    pic: scene('mills'),
    model: 'loop',
  },
  {
    id: 't-graph',
    tier: 3,
    ask: 'Rosa measured the mud in the river each month. The buffer strip and the cover crops were planted after March. What does the graph show?',
    right: 'The mud went down after the plants went in',
    wrong: [
      ['The mud went up after the plants went in', 'graph-mixup', 'Look at the bars after the red line. Are they taller or shorter?'],
      ['The mud stayed the same', 'graph-mixup', 'Compare the bars before and after the red line.'],
    ],
    explain: 'After March the bars get shorter. The roots held the soil, so less mud reached the river.',
    hints: ['Find the red line: that’s when the plants went in.', 'Are the bars after the line taller or shorter?'],
    pic: { k: 'bars', vals: [8, 7, 8, 4, 2], labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], unit: 'mud', mark: 3, markLabel: 'Plants in' },
    model: 'fact',
  },
  {
    id: 't-plan',
    tier: 3,
    ask: 'The town council picks one plan. The goals: a cleaner river, cleaner air, and the farms keep working. Which plan meets every goal?',
    right: 'Buffer strips and cover crops, rain gardens, and a filter on the mill',
    wrong: [
      ['Close all the farms', 'goal-mixup', 'That helps the river, but do the farms keep working?'],
      ['Clean the beach every day', 'cleanup-enough', 'Cleanups help, but does the pollution stop coming? Check every goal.'],
    ],
    explain: 'The best plan meets every goal. It stops the pollution at its sources and keeps the farms and the town working.',
    hints: ['Check each plan against all three goals.', 'Which plan stops the pollution where it starts?'],
    pic: scene('council'),
    model: 'loop',
  },
  {
    id: 't-together',
    tier: 3,
    ask: 'A farmer says: “I’m just one farmer. What I do doesn’t matter to the river.” What would you say?',
    right: 'Many farmers each making changes add up to a clean river',
    wrong: [
      ['You’re right. Only big factories matter.', 'one-person', 'Every field along the river adds a little. What if every farmer changed a little?'],
      ['Only scientists can help a river', 'one-person', 'Scientists test the water, but farmers, families and towns make the changes.'],
    ],
    explain: 'The river collects water from every field, street and roof. Many small changes add up, and towns can decide on them together.',
    hints: ['How many fields drain into the river?', 'What if everyone made one small change?'],
    pic: scene('council'),
    model: 'fact',
  },
];

const BANKS: Record<Station, QDef[]> = { beach: BEACH, harbor: HARBOR, wetland: WETLAND, town: TOWN };

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

// ------------------------------------------------------------------ the blueprints

export type RecipeId = 'bin-lids' | 'drain-net' | 'tank-patch' | 'boom' | 'net-bin' | 'reeds' | 'filter' | 'buffer' | 'rain-garden' | 'mill-filter';

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
  reeds: {
    id: 'reeds',
    name: 'Wetland plants',
    needs: { wood: 2, rope: 1 },
    goals: ['Grow in wet, muddy ground', 'Take up the extra fertilizer, so less algae grows', 'Give the wetland animals food and shelter'],
    limits: ['Plants from the Squad’s seed library', 'Wooden stakes and rope hold them until their roots grow'],
    designs: [
      {
        id: 'lawn',
        name: 'Lawn grass',
        note: 'Short grass from the garden shop',
        outcome: 'half',
        why: 'Lawn grass drowns in the wet mud, and its roots are too short to hold anything. The algae comes straight back.',
      },
      {
        id: 'flowers',
        name: 'Garden flowers',
        note: 'Bright flowers from far away',
        outcome: 'half',
        why: 'They look pretty for a week, then most of them rot in the wet. The ones that live give the local animals nothing to eat.',
      },
      {
        id: 'native',
        name: 'Native reeds and cattails',
        note: 'Plants that grow here naturally',
        outcome: 'works',
        why: 'The reeds love wet mud. Their roots take up the fertilizer, the algae shrinks, and the fish and birds have shelter again.',
      },
    ],
  },
  filter: {
    id: 'filter',
    name: 'Water filter',
    needs: { wood: 2, bottle: 2 },
    goals: ['Take the mud out of the water', 'Let the water keep flowing', 'Not clog up with leaves and twigs'],
    limits: ['A box of scrap wood with bottle pipes', 'Stones, gravel and sand from the riverbed'],
    designs: [
      {
        id: 'sand-top',
        name: 'Sand on top',
        note: 'Sand, then gravel, then stones',
        outcome: 'half',
        why: 'The fine sand on top catches the leaves and twigs straight away and clogs. The water backs up and spills over the side, still muddy.',
      },
      {
        id: 'mixed',
        name: 'All mixed up',
        note: 'Stones, gravel and sand stirred together',
        outcome: 'half',
        why: 'The water finds paths between the big stones and rushes around the sand. It comes out of the pipe still brown.',
      },
      {
        id: 'coarse',
        name: 'Big to small',
        note: 'Stones, then gravel, then sand',
        outcome: 'works',
        why: 'The stones catch the twigs, the gravel catches the grit, and the fine sand catches the mud. Clear water flows out of the pipe.',
      },
    ],
  },
  buffer: {
    id: 'buffer',
    name: 'Riverbank strip',
    needs: { wood: 2, rope: 1 },
    goals: ['Catch the soil and fertilizer washing off the field', 'Keep the riverbank from crumbling', 'Leave the farm room to grow crops'],
    limits: ['Plants from the seed library', 'Stakes and rope mark the strip while it grows'],
    designs: [
      {
        id: 'mowed',
        name: 'Mowed grass',
        note: 'Short lawn down to the water',
        outcome: 'half',
        why: 'The rain runs fast over the short grass, and its shallow roots hold little. Brown water still pours into the river.',
      },
      {
        id: 'fence',
        name: 'A wooden fence',
        note: 'A fence along the bank',
        outcome: 'half',
        why: 'The fence stops a few leaves, but the muddy water flows straight under it. A fence has no roots.',
      },
      {
        id: 'strip',
        name: 'A wide plant strip',
        note: 'Tall native grasses and shrubs',
        outcome: 'works',
        why: 'The thick plants slow the water down. The soil settles out, the roots take up the fertilizer, and clear water reaches the river.',
      },
    ],
  },
  'rain-garden': {
    id: 'rain-garden',
    name: 'Rain garden',
    needs: { wood: 2 },
    goals: ['Soak up the rain from the roofs and street', 'Send less water into the storm drain', 'Clean the water as it soaks in'],
    limits: ['A low corner by the houses', 'Scrap wood for the edges'],
    designs: [
      {
        id: 'pipe',
        name: 'A pipe to the drain',
        note: 'Send the roof water straight to the drain',
        outcome: 'half',
        why: 'The street stays dry, but the water rushes into the storm drain even faster, carrying dirt and oil to the river.',
      },
      {
        id: 'gravel',
        name: 'A gravel patch',
        note: 'Gravel, but no plants',
        outcome: 'half',
        why: 'A little water soaks in, but the gravel soon fills up and overflows. With no plants, nothing cleans the water.',
      },
      {
        id: 'garden',
        name: 'A rain garden',
        note: 'A low bowl of deep-rooted plants',
        outcome: 'works',
        why: 'The water collects in the low garden and soaks slowly into the ground. The plants and soil clean it on the way.',
      },
    ],
  },
  'mill-filter': {
    id: 'mill-filter',
    name: 'Chimney fix',
    needs: { can: 3 },
    goals: ['Less smoke in the town’s air', 'The mill keeps working'],
    limits: ['Metal from cans, and Rafi’s filter cloth'],
    designs: [
      {
        id: 'tall',
        name: 'A taller chimney',
        note: 'Make the chimney twice as tall',
        outcome: 'half',
        why: 'The smoke comes out higher up and drifts farther away, but there is just as much of it. It lands on the next town instead.',
      },
      {
        id: 'paint',
        name: 'Paint it white',
        note: 'A clean, bright chimney',
        outcome: 'half',
        why: 'The chimney looks clean, but the same smoke pours out of the top. Looking clean isn’t the same as being clean.',
      },
      {
        id: 'filter',
        name: 'A smoke filter',
        note: 'A filter that catches the smoke',
        outcome: 'works',
        why: 'The filter catches the smoke at its source, before it leaves the chimney. The mill keeps working, and the air is clean.',
      },
    ],
  },
};
