/**
 * Weather Wizard Battle: the science, as data and pure functions (no drawing,
 * no timers) so every rule can be unit tested.
 *
 * Each region ends at the Weather Book: questions at three levels.
 * Half 1 has three regions:
 *   Sunny Shore (Professor Nimbus): the Sun drives the water cycle
 *     1. the Sun's heat makes water evaporate; water vapor is an invisible
 *        gas; puddles dry up on sunny days (5-ESS2-1, 5-PS1-1)
 *     2. evaporation without boiling; warmer water evaporates faster; the
 *        salt stays behind; steam is tiny drops, not vapor (5-PS1-1)
 *     3. most of Earth's water is salty; most fresh water is ice or under
 *        the ground; water is used again and again, never made new
 *        (5-ESS2-2)
 *   Cloud Heights (Professor Nimbus): clouds and condensation
 *     1. clouds are tiny drops of water or ice; cooling vapor makes clouds;
 *        warm air rises; cloud types (3-ESS2-1, 5-ESS2-1)
 *     2. drops on a cold glass are condensation, not a leak; cumulonimbus
 *        and stratus; how a heavy cloud floats
 *     3. dew and fog; why there is no rain from a clear sky; how cloud
 *        drops grow into raindrops; forecasting from clouds
 *   Mountain Pass (Dr. Iris Okoro): rain, snow and temperature
 *     1. water freezes below 0 °C; rain, snow, sleet and hail are all
 *        precipitation; colder higher up (3-ESS2-1, 5-PS1-1)
 *     2. cold air makes snow, not the other way round; reading a
 *        thermometer; hail grows in storm clouds; °F
 *     3. one side of a mountain wet and the other dry; spring melt fills
 *        the rivers; six-sided snowflakes, no two alike; glaciers; air
 *        cools about 6 °C for every 1,000 meters up
 *
 * Every wrong answer names the real mistake behind it (a misconception tag)
 * and carries one plain sentence that explains it without giving the
 * answer away.
 *
 * Wording rule (the owner's): short sentences, the facts first, then one
 * plain question, in words that match the picture, and no game jargon.
 */

import type { Region } from '../../kit/worlds/wild-lands/weather-art';

export type Station = Region;
/** The regions with a question bank so far (half 1). */
export const STATIONS: Station[] = ['shore', 'clouds', 'mountain'];
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];

export type Misconception =
  | 'vapor-visible' // thinks water vapor can be seen (steam, clouds and mist are tiny drops)
  | 'boil-only' // thinks water only evaporates when it boils
  | 'ground-only' // thinks a puddle disappears only because the ground drinks it
  | 'water-gone' // thinks water can vanish or get used up
  | 'new-water' // thinks the water cycle makes new water
  | 'mostly-fresh' // thinks most of Earth's water is fresh
  | 'fresh-where' // mixed up where Earth's fresh water is
  | 'salt-rises' // thinks the salt evaporates with the water
  | 'heat-mixup' // mixed up what heat or cooling does
  | 'state-mixup' // mixed up solid, liquid and gas
  | 'cause-mixup' // named the wrong cause (not the Sun)
  | 'cloud-cotton' // thinks clouds are cotton or fluff
  | 'cloud-smoke' // thinks clouds or steam are smoke
  | 'cloud-sponge' // thinks clouds are squeezed like a sponge, or break open to rain
  | 'cloud-weightless' // thinks clouds weigh nothing
  | 'cloud-type-mixup' // mixed up which cloud brings which weather
  | 'glass-leak' // thinks drops on a cold glass leaked through it
  | 'stage-mixup' // mixed up the names of the water cycle's stages
  | 'temp-mixup' // mixed up what the temperature means for rain, snow and ice
  | 'snow-makes-cold' // thinks snow makes the air cold (cold air makes snow)
  | 'closer-sun' // thinks higher up is warmer because it is closer to the Sun
  | 'hail-mixup' // mixed up hail, sleet and snow
  | 'snowflakes-same' // thinks snowflakes are all the same
  | 'people-weather' // thinks people (or wizards) can make or stop the weather
  | 'wrong-reason'; // gave a reason that does not explain it

export type CycleStage = 'evaporation' | 'condensation' | 'precipitation' | 'collection';

/** What the panel shows above the question (the words in the question match it). */
export type Pic =
  /** The water cycle: the sea, the Sun, rising vapor, a cloud, rain on a mountain, a river back to the sea. */
  | { k: 'cycle'; stage: CycleStage | null }
  /** A puddle drying in the sun (with the shimmer of vapor rising). */
  | { k: 'puddle' }
  /** Two things side by side, one in the sun and one in the shade. */
  | { k: 'sunshade'; thing: 'towel' | 'cup' }
  /** Water as ice, as liquid and as vapor. */
  | { k: 'states' }
  /** A kettle with a clear gap above the spout, then white steam. */
  | { k: 'kettle' }
  /** A tide pool drying out, leaving white salt on the rocks. */
  | { k: 'salt' }
  /** 100 drops of Earth's water: 97 salty, 3 fresh (2 of those frozen). */
  | { k: 'earth' }
  /** A thermometer reading this many degrees Celsius. */
  | { k: 'therm'; c: number }
  /** A kind of cloud. */
  | { k: 'cloud'; kind: CloudPic }
  /** A cold glass of ice water with drops on the outside. */
  | { k: 'glass' }
  /** A mountain: wet, green side on the left; dry side on the right. */
  | { k: 'mountain' }
  /** A mountain with the temperature at the bottom and higher up. */
  | { k: 'height'; bottom: number }
  /** A big snowflake. */
  | { k: 'snowflake' }
  /** Grass with dew, or fog over a lake at dawn. */
  | { k: 'dew'; fog: boolean };

export type CloudPic = 'cumulus' | 'grey' | 'cumulonimbus' | 'stratus';

/** The picture model that hint 2 adds. */
export type Model = 'cycle' | 'therm' | 'clouds' | 'states' | 'fact';

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

const cycle = (stage: CycleStage | null): Pic => ({ k: 'cycle', stage });
const therm = (c: number): Pic => ({ k: 'therm', c });
const cloud = (kind: CloudPic): Pic => ({ k: 'cloud', kind });

// ------------------------------------------------------------------ Sunny Shore (Professor Nimbus)

const SHORE: QDef[] = [
  // level 1
  {
    id: 's-sun',
    tier: 1,
    ask: 'The Sun shines on the sea. Some of the water rises into the air. What makes the water rise?',
    right: 'The Sun’s heat',
    wrong: [
      ['The fish splashing', 'cause-mixup', 'Splashes fall right back down. Something warms the water all day long.'],
      ['A weather wizard', 'people-weather', 'Professor Nimbus is make-believe. Real water rises with no wizard at all.'],
    ],
    explain: 'The Sun’s heat warms the water, and some of it rises as water vapor. That is evaporation.',
    hints: ['What warms the sea every day?', 'Look at the water cycle. Where does it start?'],
    pic: cycle('evaporation'),
    model: 'cycle',
  },
  {
    id: 's-invisible',
    tier: 1,
    ask: 'Water that rises from the sea turns into water vapor. Water vapor is a gas, like the air. Can you see water vapor?',
    right: 'No, it is invisible',
    wrong: [
      ['Yes, it is white and puffy', 'vapor-visible', 'White and puffy is a cloud. A cloud is made of tiny drops, not vapor.'],
      ['Yes, it is blue like the sea', 'vapor-visible', 'Vapor is a gas mixed into the air. Air has no color you can see.'],
    ],
    explain: 'Water vapor is invisible, like the rest of the air. You only see water when it is liquid drops or ice.',
    hints: ['Water vapor is a gas, like air. Can you see air?', 'Look at the three kinds of water: ice, liquid and vapor.'],
    pic: { k: 'states' },
    model: 'states',
  },
  {
    id: 's-puddle',
    tier: 1,
    ask: 'After the rain, a puddle sits in the sun. By the afternoon it is gone. Where did most of the water go?',
    right: 'Up into the air as water vapor',
    wrong: [
      ['It vanished. Water can disappear.', 'water-gone', 'Water never just disappears. It always goes somewhere.'],
      ['It all soaked into the ground', 'ground-only', 'A little soaks in, but this puddle is in the sun all day.'],
    ],
    explain: 'The Sun warmed the puddle, and the water evaporated. It is in the air now, as invisible vapor.',
    hints: ['What was the Sun doing to the puddle all day?', 'Look at the water cycle. The arrows go up from water in the sun.'],
    pic: { k: 'puddle' },
    model: 'cycle',
  },
  {
    id: 's-towel',
    tier: 1,
    ask: 'Two wet towels hang outside. One is in the sun. One is in the shade. Which one dries first?',
    right: 'The one in the sun',
    wrong: [
      ['The one in the shade', 'heat-mixup', 'Shade is cooler. Water evaporates more slowly where it is cool.'],
      ['They dry at the same time', 'heat-mixup', 'One towel gets the Sun’s heat and one does not. That makes a difference.'],
    ],
    explain: 'The Sun warms the towel, so its water evaporates faster. Warmth speeds up evaporation.',
    hints: ['Which towel gets more heat?', 'Warm water evaporates faster than cool water.'],
    pic: { k: 'sunshade', thing: 'towel' },
    model: 'fact',
  },
  {
    id: 's-gas',
    tier: 1,
    ask: 'Water can be a solid, a liquid or a gas. Ice is a solid. The sea is a liquid. What is water vapor?',
    right: 'A gas',
    wrong: [
      ['A solid', 'state-mixup', 'A solid keeps its shape, like ice. Vapor spreads out into the air.'],
      ['A liquid', 'state-mixup', 'A liquid pours, like the sea. Vapor floats away in the air.'],
    ],
    explain: 'Water vapor is water as a gas. It spreads out and mixes into the air.',
    hints: ['Ice and the sea are taken. What is left?', 'Look at the three kinds of water.'],
    pic: { k: 'states' },
    model: 'states',
  },
  {
    id: 's-energy',
    tier: 1,
    ask: 'Water goes round and round. It rises into the sky, falls as rain and flows back to the sea. What gives the water cycle its energy?',
    right: 'The Sun',
    wrong: [
      ['The Moon', 'cause-mixup', 'The Moon pulls the tides, but it does not warm the water.'],
      ['People', 'people-weather', 'The water cycle went round long before there were any people.'],
    ],
    explain: 'The Sun’s heat lifts water into the sky. Without the Sun, the water cycle would stop.',
    hints: ['What heats the sea so its water rises?', 'Look at the water cycle. What shines at the top?'],
    pic: cycle(null),
    model: 'cycle',
  },
  // level 2
  {
    id: 's-noboil',
    tier: 2,
    ask: 'The sea never boils. But water evaporates from it every day. Does water have to boil to evaporate?',
    right: 'No. Warm water is enough.',
    wrong: [
      ['Yes. It must boil first.', 'boil-only', 'The sea is never boiling, and its water still rises every day.'],
      ['Yes. Only steam can rise.', 'boil-only', 'Puddles dry up on warm days without ever boiling.'],
    ],
    explain: 'Water evaporates at any temperature. Boiling just makes it happen very fast.',
    hints: ['Does the sea ever boil? Does its water still rise?', 'Think of a puddle drying on a warm day.'],
    pic: { k: 'puddle' },
    model: 'fact',
  },
  {
    id: 's-salt',
    tier: 2,
    ask: 'The Sun warms a tide pool. Its water evaporates. White crystals stay behind on the rocks. What are they?',
    right: 'Salt from the sea water',
    wrong: [
      ['Little bits of ice', 'state-mixup', 'Ice would melt on warm rocks in the sun.'],
      ['Nothing. The salt rose with the water.', 'salt-rises', 'Look at the rocks. Something white stayed behind.'],
    ],
    explain: 'Only the water evaporates. The salt stays behind. That is why rain is not salty.',
    hints: ['Sea water is salty. What is left when the water is gone?', 'Only water rises as vapor. Everything else stays.'],
    pic: { k: 'salt' },
    model: 'fact',
  },
  {
    id: 's-warmer',
    tier: 2,
    ask: 'Two cups of water sit on a table. One is warm. One is cold. Which one evaporates faster?',
    right: 'The warm one',
    wrong: [
      ['The cold one', 'heat-mixup', 'Cold slows evaporation down. Think of a puddle on a cold day.'],
      ['They are the same', 'heat-mixup', 'The temperature makes a difference to how fast water rises.'],
    ],
    explain: 'Warm water evaporates faster than cold water. Heat gives the water energy to rise.',
    hints: ['Which cup has more heat?', 'Think of the towels: the sunny one dried first.'],
    pic: { k: 'sunshade', thing: 'cup' },
    model: 'fact',
  },
  {
    id: 's-steam',
    tier: 2,
    ask: 'A kettle boils. Right at the spout there is a clear gap. Then a white cloud of steam appears. What is the white cloud?',
    right: 'Tiny drops of water, made when vapor cooled',
    wrong: [
      ['Water vapor', 'vapor-visible', 'Vapor is invisible. It is in the clear gap at the spout.'],
      ['Smoke', 'cloud-smoke', 'Smoke comes from burning. Nothing is burning in a kettle.'],
    ],
    explain: 'The clear gap is the invisible vapor. A little farther out, it cools into tiny drops you can see.',
    hints: ['Look at the clear gap by the spout. What is in it?', 'Vapor is invisible. What can you see?'],
    pic: { k: 'kettle' },
    model: 'states',
  },
  {
    id: 's-wind',
    tier: 2,
    ask: 'Wind blows over the wet sand. The sand dries faster than on a still day. Why?',
    right: 'The wind carries the vapor away, so more water can rise',
    wrong: [
      ['The wind blows the water into the sea', 'wrong-reason', 'The water is soaked into the sand. Wind cannot push it out.'],
      ['The wind makes the sand hot', 'heat-mixup', 'Wind usually cools things down. It helps in another way.'],
    ],
    explain: 'Wind moves the damp air away and brings dry air in. Then more water can evaporate.',
    hints: ['What happens to the vapor just above the sand?', 'Wind moves air. Dry air can take more vapor.'],
    pic: cycle('evaporation'),
    model: 'fact',
  },
  {
    id: 's-lake',
    tier: 2,
    ask: 'The Sun shines on a lake all day. What happens to the water at the top?',
    right: 'It warms up, and some evaporates',
    wrong: [
      ['It freezes', 'heat-mixup', 'Freezing needs cold. The Sun warms things.'],
      ['It turns into salt', 'state-mixup', 'Water does not turn into salt. Heat changes water into vapor.'],
    ],
    explain: 'The Sun warms the top of the lake. Some of that water evaporates into the air.',
    hints: ['Is the Sun hot or cold?', 'Look at the water cycle. What rises from water in the sun?'],
    pic: cycle('evaporation'),
    model: 'cycle',
  },
  // level 3
  {
    id: 's-97',
    tier: 3,
    ask: 'Most of Earth’s water is in the sea. About 97 of every 100 drops are salty. Is most of Earth’s water fresh or salty?',
    right: 'Salty',
    wrong: [
      ['Fresh', 'mostly-fresh', 'Look at the 100 drops. Count the blue ones.'],
      ['About half and half', 'mostly-fresh', 'Only 3 of the 100 drops are fresh.'],
    ],
    explain: 'About 97 of every 100 drops are salty sea water. Fresh water is only about 3.',
    hints: ['Is 97 out of 100 most of them?', 'Look at the drops. Blue are salty.'],
    pic: { k: 'earth' },
    model: 'fact',
  },
  {
    id: 's-fresh',
    tier: 3,
    ask: 'Only about 3 of every 100 drops are fresh water. Where is most of that fresh water?',
    right: 'Frozen in ice, or under the ground',
    wrong: [
      ['In rivers and lakes', 'fresh-where', 'Rivers and lakes hold only a tiny part of it.'],
      ['In the sea', 'fresh-where', 'The sea is salty, not fresh.'],
    ],
    explain: 'Most fresh water is frozen in ice sheets and glaciers, or stored under the ground.',
    hints: ['Look at the 3 fresh drops. Which color are most of them?', 'White means frozen. Where is ice kept all year?'],
    pic: { k: 'earth' },
    model: 'fact',
  },
  {
    id: 's-new',
    tier: 3,
    ask: 'The water in your glass may once have been in a dinosaur’s lake. Does the water cycle make new water?',
    right: 'No. The same water is used again and again.',
    wrong: [
      ['Yes. Rain is brand-new water.', 'new-water', 'Rain is old water that went up as vapor and came back down.'],
      ['Yes. The Sun makes new water.', 'new-water', 'The Sun moves water around. It does not make any.'],
    ],
    explain: 'Earth keeps the same water. It goes round the cycle again and again, for millions of years.',
    hints: ['Where does rain come from?', 'Look at the water cycle. It is a circle, not a line.'],
    pic: cycle(null),
    model: 'cycle',
  },
  {
    id: 's-usedup',
    tier: 3,
    ask: 'Some people think water gets used up when we drink it or wash with it. What really happens to it?',
    right: 'It goes back into the water cycle',
    wrong: [
      ['It is gone forever', 'water-gone', 'Water does not disappear. It goes somewhere.'],
      ['It turns into air', 'water-gone', 'Water can become vapor in the air, but it is still water.'],
    ],
    explain: 'Used water drains, evaporates or soaks away. In time it goes round the cycle again.',
    hints: ['Can water ever vanish?', 'Look at the water cycle. Where can water join it?'],
    pic: cycle('collection'),
    model: 'cycle',
  },
  {
    id: 's-rainfresh',
    tier: 3,
    ask: 'Rain comes from water that rose from the sea. But rain is not salty. Why?',
    right: 'The salt stays behind when water evaporates',
    wrong: [
      ['Clouds clean the salt out', 'wrong-reason', 'Clouds are just tiny drops. The salt never got that far.'],
      ['Rain comes from a fresh sea far away', 'wrong-reason', 'Every sea is salty.'],
    ],
    explain: 'Only water evaporates. The salt is left in the sea, so the vapor, the clouds and the rain are fresh.',
    hints: ['Remember the tide pool and its white crystals.', 'What rises from the sea: the water, the salt, or both?'],
    pic: { k: 'salt' },
    model: 'fact',
  },
  {
    id: 's-both',
    tier: 3,
    ask: 'On a hot day, a puddle dries up. On the stove, a pan of water boils. Which one is evaporation?',
    right: 'Both of them',
    wrong: [
      ['Only the boiling pan', 'boil-only', 'The puddle’s water also turned into vapor.'],
      ['Only the puddle', 'boil-only', 'Boiling turns water into vapor too, only faster.'],
    ],
    explain: 'Both turn liquid water into vapor. Boiling is just very fast evaporation.',
    hints: ['Where did the water go in each one?', 'Does water need to boil to become vapor?'],
    pic: { k: 'kettle' },
    model: 'states',
  },
];

// ------------------------------------------------------------------ Cloud Heights (Professor Nimbus)

const CLOUDS: QDef[] = [
  // level 1
  {
    id: 'c-made',
    tier: 1,
    ask: 'Clouds look soft and fluffy. What are clouds made of?',
    right: 'Tiny drops of water or ice',
    wrong: [
      ['Cotton', 'cloud-cotton', 'They look like cotton, but you could fly straight through one.'],
      ['Smoke', 'cloud-smoke', 'Smoke comes from fires. Clouds form far from any fire.'],
    ],
    explain: 'A cloud is billions of tiny drops of water (or bits of ice), so small they float.',
    hints: ['Clouds bring rain. What could rain be made from?', 'Look at the water cycle. What rose into the sky?'],
    pic: cloud('cumulus'),
    model: 'cycle',
  },
  {
    id: 'c-cool',
    tier: 1,
    ask: 'Water vapor rises. High up, the air is cold. The vapor cools down. What does it make?',
    right: 'A cloud of tiny drops',
    wrong: [
      ['Hot steam', 'heat-mixup', 'Steam needs heat. This vapor is cooling down.'],
      ['Smoke', 'cloud-smoke', 'Smoke comes from burning, not from water.'],
    ],
    explain: 'Cooling vapor turns back into tiny liquid drops. Together they make a cloud. That is condensation.',
    hints: ['When vapor cools, does it stay a gas?', 'Look at the water cycle. What forms up high?'],
    pic: cycle('condensation'),
    model: 'cycle',
  },
  {
    id: 'c-higher',
    tier: 1,
    ask: 'You climb a tall mountain. You go higher and higher. How does the air feel?',
    right: 'Colder',
    wrong: [
      ['Hotter', 'closer-sun', 'A mountain top is a tiny step closer to the Sun. That does not warm it.'],
      ['Just the same', 'heat-mixup', 'Mountain tops often have snow, even in summer.'],
    ],
    explain: 'Air gets colder the higher you go. That is why clouds form up high, and why mountain tops are snowy.',
    hints: ['Where do you see snow on a mountain?', 'Look at the mountain. The top is white.'],
    pic: { k: 'height', bottom: 15 },
    model: 'therm',
  },
  {
    id: 'c-cumulus',
    tier: 1,
    ask: 'Puffy white clouds with flat bottoms are called cumulus. What weather do they usually mean?',
    right: 'Fair weather',
    wrong: [
      ['A big storm soon', 'cloud-type-mixup', 'Storm clouds are tall and dark. These are small and white.'],
      ['Snow tomorrow', 'cloud-type-mixup', 'Little white puffs come on warm, sunny days.'],
    ],
    explain: 'Small, white cumulus clouds usually mean fair weather. Only when they grow very tall do they bring storms.',
    hints: ['Are these clouds dark or white?', 'Look at the cloud chart.'],
    pic: cloud('cumulus'),
    model: 'clouds',
  },
  {
    id: 'c-grey',
    tier: 1,
    ask: 'A cloud turns dark grey. It is full of water drops. What may happen soon?',
    right: 'Rain',
    wrong: [
      ['The cloud will burst like a balloon', 'cloud-sponge', 'Clouds have no skin to burst. The drops just fall when they get heavy.'],
      ['A sunny day', 'cloud-type-mixup', 'Dark grey clouds block the Sun.'],
    ],
    explain: 'A dark grey cloud is thick with drops. When the drops grow heavy, they fall as rain.',
    hints: ['Why is the cloud so dark?', 'Look at the cloud chart. Which cloud rains?'],
    pic: cloud('grey'),
    model: 'clouds',
  },
  {
    id: 'c-rises',
    tier: 1,
    ask: 'Warm air rises. Cool air sinks. The hot sand warms the air above it. Which way does that air go?',
    right: 'Up',
    wrong: [
      ['Down into the sand', 'heat-mixup', 'Cool air sinks. This air is warm.'],
      ['Nowhere. Air cannot move.', 'wrong-reason', 'Air moves all the time. That is wind.'],
    ],
    explain: 'Warm air rises. It carries water vapor up with it, high into the cold sky.',
    hints: ['Does warm air rise or sink?', 'Think of a hot-air balloon.'],
    pic: cycle('evaporation'),
    model: 'fact',
  },
  // level 2
  {
    id: 'c-glass',
    tier: 2,
    ask: 'A glass of ice water sits out on a hot day. Drops form on the outside. Where do they come from?',
    right: 'Water vapor in the air cooled on the cold glass',
    wrong: [
      ['The water leaked through the glass', 'glass-leak', 'Glass does not let water through. The drink is still inside.'],
      ['The ice melted through the glass', 'glass-leak', 'The ice is still inside the glass.'],
    ],
    explain: 'The air has invisible vapor in it. The cold glass cools that vapor into drops. That is condensation.',
    hints: ['Is there water vapor in the air around the glass?', 'What happens when vapor touches something cold?'],
    pic: { k: 'glass' },
    model: 'states',
  },
  {
    id: 'c-name',
    tier: 2,
    ask: 'Water vapor cools and turns into liquid drops. This step has a name. What is it?',
    right: 'Condensation',
    wrong: [
      ['Evaporation', 'stage-mixup', 'Evaporation is the other way round: liquid turning into vapor.'],
      ['Precipitation', 'stage-mixup', 'Precipitation is water falling from clouds.'],
    ],
    explain: 'Condensation is vapor turning into liquid drops. It is how clouds form.',
    hints: ['Is the water going up, forming a cloud, or falling?', 'Look at the water cycle. Find the cloud.'],
    pic: cycle('condensation'),
    model: 'cycle',
  },
  {
    id: 'c-tall',
    tier: 2,
    ask: 'A cloud grows very tall and dark. Its top spreads out flat. It is called a cumulonimbus. What does it bring?',
    right: 'A thunderstorm',
    wrong: [
      ['Fair weather', 'cloud-type-mixup', 'Fair-weather clouds are small and white.'],
      ['Fog', 'cloud-type-mixup', 'Fog is a cloud down on the ground, not a tall tower.'],
    ],
    explain: 'A cumulonimbus is a storm cloud. It can bring heavy rain, lightning, thunder and even hail.',
    hints: ['Tall and dark: is that a calm cloud?', 'Look at the cloud chart.'],
    pic: cloud('cumulonimbus'),
    model: 'clouds',
  },
  {
    id: 'c-stratus',
    tier: 2,
    ask: 'A flat, grey sheet of cloud covers the whole sky. It is called stratus. What weather does it often bring?',
    right: 'A grey day, maybe drizzle',
    wrong: [
      ['A big thunderstorm', 'cloud-type-mixup', 'Storm clouds grow tall. Stratus is low and flat.'],
      ['Bright sunshine', 'cloud-type-mixup', 'The sheet of cloud covers the Sun.'],
    ],
    explain: 'Stratus is a low, flat layer. It makes grey days and sometimes light drizzle.',
    hints: ['Can the Sun shine through a sheet of cloud?', 'Look at the cloud chart.'],
    pic: cloud('stratus'),
    model: 'clouds',
  },
  {
    id: 'c-heavy',
    tier: 2,
    ask: 'A big puffy cloud holds about 1.1 million pounds of water. How can it float?',
    right: 'The drops are tiny and spread out, and rising air holds them up',
    wrong: [
      ['Clouds weigh nothing', 'cloud-weightless', 'All that water has weight.'],
      ['Clouds are full of helium, like a balloon', 'cloud-smoke', 'Clouds are made of water drops, not a special gas.'],
    ],
    explain: 'Each drop is so tiny and light that rising air keeps it up, even though the whole cloud is very heavy.',
    hints: ['How big is one cloud drop?', 'Warm air rises. What can it carry?'],
    pic: cloud('cumulus'),
    model: 'fact',
  },
  {
    id: 'c-mirror',
    tier: 2,
    ask: 'You breathe on a cold mirror. It fogs up. Why?',
    right: 'The vapor in your breath turns into tiny drops',
    wrong: [
      ['Your breath is smoke', 'cloud-smoke', 'Nothing is burning. Your breath is air with vapor in it.'],
      ['The mirror is leaking', 'glass-leak', 'Mirrors cannot leak. The water came from you.'],
    ],
    explain: 'Your breath is warm and full of vapor. The cold mirror cools it into tiny drops: condensation.',
    hints: ['Is your breath dry or damp?', 'What does a cold surface do to vapor?'],
    pic: { k: 'glass' },
    model: 'states',
  },
  // level 3
  {
    id: 'c-fog',
    tier: 3,
    ask: 'Fog is a cloud down on the ground. When does fog often form?',
    right: 'On a cool, still morning near water',
    wrong: [
      ['On a hot, dry afternoon', 'heat-mixup', 'Clouds form when damp air cools, not when it is hot and dry.'],
      ['Only when it is snowing', 'cloud-type-mixup', 'Fog forms on many mornings with no snow at all.'],
    ],
    explain: 'At night the ground cools. Damp air touching it cools too, and its vapor condenses into fog.',
    hints: ['Clouds form when damp air cools. When is the air coolest?', 'Look at the picture: water, early morning.'],
    pic: { k: 'dew', fog: true },
    model: 'fact',
  },
  {
    id: 'c-dew',
    tier: 3,
    ask: 'In the morning, the grass is wet with dew. It did not rain. Where did the water come from?',
    right: 'Vapor in the air condensed on the cool grass',
    wrong: [
      ['It rained in the night', 'wrong-reason', 'The ground under the trees is dry. It did not rain.'],
      ['The grass sweated it out', 'wrong-reason', 'Grass can give off a little water, but dew comes from the air.'],
    ],
    explain: 'The grass cooled in the night. Vapor in the air touched it and turned into drops, like on a cold glass.',
    hints: ['Remember the cold glass of ice water.', 'Is there vapor in the air at night?'],
    pic: { k: 'dew', fog: false },
    model: 'states',
  },
  {
    id: 'c-clear',
    tier: 3,
    ask: 'Professor Nimbus waves the staff at a clear blue sky. No rain falls. Why not?',
    right: 'There is no cloud, so there are no drops to fall',
    wrong: [
      ['The staff is out of power', 'people-weather', 'Even a real scientist cannot make rain with no clouds.'],
      ['Rain only falls at night', 'wrong-reason', 'Rain can fall at any time of day.'],
    ],
    explain: 'Rain falls from clouds full of heavy drops. With no cloud, there is nothing to fall.',
    hints: ['Where does rain come from?', 'Look at the water cycle. What comes before the rain?'],
    pic: cycle('precipitation'),
    model: 'cycle',
  },
  {
    id: 'c-grow',
    tier: 3,
    ask: 'Cloud drops are far too tiny to fall. How do they become raindrops?',
    right: 'They bump together and grow until they are heavy',
    wrong: [
      ['The cloud is squeezed like a sponge', 'cloud-sponge', 'Nothing squeezes a cloud. The drops change.'],
      ['The cloud breaks open', 'cloud-sponge', 'A cloud is not a bag. It has nothing to break.'],
    ],
    explain: 'Tiny drops bump and join. When enough have joined, a drop is heavy enough to fall as rain.',
    hints: ['What makes something fall instead of float?', 'What happens when two drops touch?'],
    pic: cloud('grey'),
    model: 'fact',
  },
  {
    id: 'c-slope',
    tier: 3,
    ask: 'Damp air blows up the side of a mountain. It rises and cools. What often forms there?',
    right: 'Clouds',
    wrong: [
      ['A clear, dry sky', 'heat-mixup', 'When damp air cools, its vapor turns into tiny drops.'],
      ['Hot steam', 'heat-mixup', 'The air is cooling, not heating.'],
    ],
    explain: 'Rising air cools. Its vapor condenses into a cloud, often wrapped round the mountain.',
    hints: ['Air gets colder as it goes up. What does cool vapor make?', 'Look at the mountain. Where are the clouds?'],
    pic: { k: 'mountain' },
    model: 'cycle',
  },
  {
    id: 'c-forecast',
    tier: 3,
    ask: 'Dr. Iris sees tall clouds growing fast in the afternoon. Their tops are flat. What should she forecast?',
    right: 'Thunderstorms later today',
    wrong: [
      ['A clear, calm night', 'cloud-type-mixup', 'Tall, flat-topped clouds are storm clouds.'],
      ['Fog tomorrow morning', 'cloud-type-mixup', 'Fog is a low cloud. These clouds are very tall.'],
    ],
    explain: 'Tall clouds with flat tops are cumulonimbus. They are a sign of thunderstorms on the way.',
    hints: ['What are tall clouds with flat tops called?', 'Look at the cloud chart.'],
    pic: cloud('cumulonimbus'),
    model: 'clouds',
  },
];

// ------------------------------------------------------------------ Mountain Pass (Dr. Iris Okoro)

const MOUNTAIN: QDef[] = [
  // level 1
  {
    id: 'm-snow',
    tier: 1,
    ask: 'Water freezes at 0 °C (32 °F). The thermometer says −5 °C. A grey cloud is full. Will it rain or snow?',
    right: 'Snow',
    wrong: [
      ['Rain', 'temp-mixup', '−5 °C is below freezing. Rain would freeze.'],
      ['Nothing can fall when it is cold', 'temp-mixup', 'Clouds still drop water when it is cold. It just looks different.'],
    ],
    explain: 'Below 0 °C, the water in the cloud freezes into snowflakes, and they fall as snow.',
    hints: ['Is −5 °C above or below 0 °C?', 'Look at the thermometer. The line is 0 °C.'],
    pic: therm(-5),
    model: 'therm',
  },
  {
    id: 'm-word',
    tier: 1,
    ask: 'Rain, snow, sleet and hail all fall from clouds. What is the one word for all of them?',
    right: 'Precipitation',
    wrong: [
      ['Evaporation', 'stage-mixup', 'Evaporation is water rising, not falling.'],
      ['Condensation', 'stage-mixup', 'Condensation is how a cloud forms.'],
    ],
    explain: 'Precipitation is any water that falls from clouds: rain, snow, sleet or hail.',
    hints: ['Is the water rising, making a cloud, or falling?', 'Look at the water cycle. Find the falling rain.'],
    pic: cycle('precipitation'),
    model: 'cycle',
  },
  {
    id: 'm-rain',
    tier: 1,
    ask: 'The thermometer says 10 °C. A grey cloud is overhead. What will fall?',
    right: 'Rain',
    wrong: [
      ['Snow', 'temp-mixup', '10 °C is above freezing. Snow would melt.'],
      ['Nothing. It is too warm.', 'temp-mixup', 'Full grey clouds drop their water on warm days too.'],
    ],
    explain: 'Above 0 °C, water stays liquid, so a full cloud drops rain.',
    hints: ['Is 10 °C above or below 0 °C?', 'Look at the thermometer. Is the red above the line?'],
    pic: therm(10),
    model: 'therm',
  },
  {
    id: 'm-up',
    tier: 1,
    ask: 'It is 12 °C in the valley. Is it warmer or colder at the top of the mountain?',
    right: 'Colder',
    wrong: [
      ['Warmer, because it is closer to the Sun', 'closer-sun', 'The top is only a tiny bit closer to the Sun. That does not warm it.'],
      ['Just the same', 'heat-mixup', 'Look at the snow on the top.'],
    ],
    explain: 'The air gets colder as you go up. That is why there is snow on the top when the valley is warm.',
    hints: ['Where is the snow?', 'Look at the mountain. Snow stays where it is cold.'],
    pic: { k: 'height', bottom: 12 },
    model: 'therm',
  },
  {
    id: 'm-from',
    tier: 1,
    ask: 'Snowflakes fall from the sky. Where do they come from?',
    right: 'Clouds high up in the cold air',
    wrong: [
      ['The cold ground', 'wrong-reason', 'Snow falls down onto the ground, from above.'],
      ['Frozen puddles blown up by the wind', 'wrong-reason', 'Snowflakes grow in the sky, one by one.'],
    ],
    explain: 'Snowflakes grow inside cold clouds. When they are heavy, they fall.',
    hints: ['Where does rain come from?', 'Snow is precipitation, like rain.'],
    pic: { k: 'snowflake' },
    model: 'cycle',
  },
  {
    id: 'm-ice',
    tier: 1,
    ask: 'A pond freezes on a cold night. What is ice?',
    right: 'Water as a solid',
    wrong: [
      ['Something different from water', 'state-mixup', 'Melt the ice and you get the same water back.'],
      ['Water vapor', 'state-mixup', 'Vapor is a gas. You can hold ice in your hand.'],
    ],
    explain: 'Ice is water as a solid. Warm it and it melts back into liquid water.',
    hints: ['What happens when ice melts?', 'Look at the three kinds of water.'],
    pic: { k: 'states' },
    model: 'states',
  },
  // level 2
  {
    id: 'm-cold-air',
    tier: 2,
    ask: 'Some people say snow makes the air cold. Which is true?',
    right: 'Cold air makes the snow',
    wrong: [
      ['Snow makes the air cold', 'snow-makes-cold', 'Snow can only form if the air is cold first.'],
      ['Snow and cold have nothing to do with each other', 'temp-mixup', 'Snow only falls when the air is cold enough.'],
    ],
    explain: 'The air must be cold first. Then water in the clouds freezes into snow.',
    hints: ['Which comes first: the cold, or the snow?', 'Look at the thermometer. When does water freeze?'],
    pic: therm(-3),
    model: 'therm',
  },
  {
    id: 'm-read',
    tier: 2,
    ask: 'Look at the thermometer. It reads 3 °C. The cloud is full. What will fall?',
    right: 'Rain',
    wrong: [
      ['Snow', 'temp-mixup', '3 °C is just above freezing. Snow would melt.'],
      ['Hail, always', 'hail-mixup', 'Hail comes from storm clouds, not every grey cloud.'],
    ],
    explain: '3 °C is a little above 0 °C, so the water stays liquid and falls as rain.',
    hints: ['Is the red above or below the 0 °C line?', 'Water freezes below 0 °C.'],
    pic: therm(3),
    model: 'therm',
  },
  {
    id: 'm-hail',
    tier: 2,
    ask: 'Hail is balls of ice that fall from the sky. Where does hail grow?',
    right: 'Inside tall storm clouds, even in summer',
    wrong: [
      ['Only in winter snowstorms', 'hail-mixup', 'Hail often falls in summer thunderstorms.'],
      ['On the ground', 'wrong-reason', 'Hail falls from the sky.'],
    ],
    explain: 'Strong winds inside a storm cloud carry drops up into freezing air again and again. They grow into hail.',
    hints: ['Which cloud is tall enough to be freezing at the top?', 'Look at the cloud chart.'],
    pic: cloud('cumulonimbus'),
    model: 'clouds',
  },
  {
    id: 'm-sleet',
    tier: 2,
    ask: 'Snow starts to fall. It melts in warm air, then freezes again near the cold ground. It lands as little ice pellets. What is it called?',
    right: 'Sleet',
    wrong: [
      ['Hail', 'hail-mixup', 'Hail grows big inside storm clouds.'],
      ['Dew', 'stage-mixup', 'Dew forms on the grass. It does not fall.'],
    ],
    explain: 'Sleet is melted snow that freezes again into little pellets before it lands.',
    hints: ['These pellets are small and fall in winter.', 'It is not hail, which grows in storms.'],
    pic: therm(-1),
    model: 'fact',
  },
  {
    id: 'm-melt',
    tier: 2,
    ask: 'The Sun shines on the ice wall. It is 6 °C. What happens to the ice?',
    right: 'It melts into water',
    wrong: [
      ['It gets harder', 'temp-mixup', '6 °C is above freezing. Ice cannot stay solid.'],
      ['It turns straight into a cloud', 'state-mixup', 'Ice melts into liquid water first.'],
    ],
    explain: 'Above 0 °C, ice melts and becomes liquid water again.',
    hints: ['Is 6 °C above or below freezing?', 'Look at the thermometer.'],
    pic: therm(6),
    model: 'therm',
  },
  {
    id: 'm-f',
    tier: 2,
    ask: 'In the United States, people use °F. Water freezes at 32 °F. The forecast says 25 °F. A full cloud is coming. What may fall?',
    right: 'Snow',
    wrong: [
      ['Rain', 'temp-mixup', '25 °F is below 32 °F, the freezing point.'],
      ['Warm rain', 'temp-mixup', '25 °F is colder than freezing.'],
    ],
    explain: '25 °F is below 32 °F, so it is below freezing. The cloud’s water falls as snow.',
    hints: ['Is 25 bigger or smaller than 32?', 'Below 32 °F, water freezes.'],
    pic: therm(-4),
    model: 'therm',
  },
  // level 3
  {
    id: 'm-shadow',
    tier: 3,
    ask: 'Damp air blows up one side of a mountain. It rains there. The other side gets very little rain. Why?',
    right: 'The air dropped its water on the way up',
    wrong: [
      ['The dry side is closer to the Sun', 'closer-sun', 'Both sides are the same height.'],
      ['The mountain drinks the clouds', 'wrong-reason', 'Mountains cannot drink. The air changes as it climbs.'],
    ],
    explain: 'Rising air cools, makes clouds and rains. By the top, little water is left for the other side.',
    hints: ['What happens to air as it rises?', 'Look at the mountain. Where do the clouds rain?'],
    pic: { k: 'mountain' },
    model: 'cycle',
  },
  {
    id: 'm-spring',
    tier: 3,
    ask: 'In spring, the snow on the mountain melts. Where does that water go?',
    right: 'Down into streams and rivers',
    wrong: [
      ['It vanishes', 'water-gone', 'Water never just vanishes.'],
      ['It stays on the mountain all year', 'wrong-reason', 'Melted water flows downhill.'],
    ],
    explain: 'Meltwater runs downhill into streams and rivers. Many towns get their water this way.',
    hints: ['Which way does water flow?', 'Look at the water cycle. What comes after the mountain?'],
    pic: cycle('collection'),
    model: 'cycle',
  },
  {
    id: 'm-six',
    tier: 3,
    ask: 'Look closely at a snowflake. Every one has six sides or six arms. Why six?',
    right: 'Frozen water always joins in a six-sided pattern',
    wrong: [
      ['The wind cuts them into shape', 'wrong-reason', 'Wind breaks snowflakes. It does not shape them so neatly.'],
      ['They are all exactly the same', 'snowflakes-same', 'They all have six sides, but no two are exactly alike.'],
    ],
    explain: 'When water freezes, its tiny parts lock together in a six-sided pattern. Every snowflake grows from it.',
    hints: ['Is the six-sided shape from outside, or from the water itself?', 'Every snowflake starts as frozen water.'],
    pic: { k: 'snowflake' },
    model: 'fact',
  },
  {
    id: 'm-alike',
    tier: 3,
    ask: 'Scientists say no two snowflakes are exactly alike. Why?',
    right: 'Each one grows its own way as it falls through different air',
    wrong: [
      ['They really are all the same', 'snowflakes-same', 'Under a microscope, every one is different.'],
      ['People shape them as they fall', 'people-weather', 'No one shapes snowflakes. They grow on their own.'],
    ],
    explain: 'Each flake takes its own path through air of different coldness and dampness, so each grows differently.',
    hints: ['Does every snowflake fall the same way?', 'Cold and damp air changes how a flake grows.'],
    pic: { k: 'snowflake' },
    model: 'fact',
  },
  {
    id: 'm-glacier',
    tier: 3,
    ask: 'Snow piles up high on a mountain, year after year. It packs down into thick ice that slowly slides downhill. What is it called?',
    right: 'A glacier',
    wrong: [
      ['A cloud', 'state-mixup', 'A cloud is tiny drops in the air, not ice on the ground.'],
      ['A puddle', 'state-mixup', 'A puddle is liquid water. This is thick ice.'],
    ],
    explain: 'A glacier is a river of ice made from packed snow. Glaciers hold much of Earth’s fresh water.',
    hints: ['It is a huge amount of ice that moves.', 'Most of Earth’s fresh water is frozen. Where?'],
    pic: { k: 'height', bottom: 4 },
    model: 'fact',
  },
  {
    id: 'm-lapse',
    tier: 3,
    ask: 'For every 1,000 meters you climb, the air gets about 6 °C colder. It is 10 °C at the bottom. About how cold is it 2,000 meters up?',
    right: 'About −2 °C',
    wrong: [
      ['About 22 °C', 'closer-sun', 'Higher up is colder, so take away, not add.'],
      ['About 10 °C', 'heat-mixup', 'It cools by about 6 °C for each 1,000 meters.'],
    ],
    explain: '2,000 meters is two steps of 6 °C: 10 − 12 = −2 °C. Below freezing, so there may be snow up there.',
    hints: ['How many steps of 1,000 meters is 2,000?', 'Two steps of 6 °C colder: 10 − 6 − 6.'],
    pic: { k: 'height', bottom: 10 },
    model: 'therm',
  },
];

const BANKS: Partial<Record<Station, QDef[]>> = { shore: SHORE, clouds: CLOUDS, mountain: MOUNTAIN };

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
