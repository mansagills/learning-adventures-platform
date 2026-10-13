import type { GrownupsContent } from '../../kit/ui/grownups';
import type { Question as TalkQuestion } from '../../kit/ui/talk';
import type { BodyArea } from '../../kit/worlds/star-station/body';
import type { GermId, UpgradeId } from './art';
import type { Choice, Mission, Question } from './problems';

/**
 * Everything Body System Heroes says: the people, the missions (briefings,
 * where things are in each area, the debriefs and the germ files), the
 * opening, Nib's lines, the upgrades and the grown-ups page. The owner's
 * wording rule holds everywhere: short sentences, the facts first, then one
 * plain question, in words that match the picture, and no game jargon.
 * Characters are called by name, never "he" or "she".
 */

export const STARS_PER_MISSION = 5;
export const SCANS_PER_DIVE = 3;

export type PersonId = 'ama' | 'ayo';
export const PEOPLE: Record<PersonId, { name: string; role: string }> = {
  ama: { name: 'Dr. Ama Okafor', role: 'Station doctor and inventor of the shrink beam' },
  ayo: { name: 'Commander Ayo', role: 'Runs the Star Station (feeling unwell)' },
};
export const NIB = { name: 'Nib', role: 'Co-pilot of the Micro-Scout' };

export interface MissionInfo {
  id: Mission;
  name: string;
  organ: string;
  area: BodyArea;
  germ: GermId;
  germName: string;
  grades: string;
  /** Dr. Ama's briefing, the first time. */
  briefing: string[];
  /** What Nib says on arriving in the area. */
  arrive: string;
  /** Where things are in the area (tiles). */
  start: { x: number; y: number };
  scans: Array<{ x: number; y: number }>;
  nest: { x: number; y: number };
  exit: { x: number; y: number };
  flow?: { x: number; y: number };
  /** The blood flows in pushes, with each heartbeat. */
  pulse?: boolean;
  /** Good gut bacteria to protect. */
  helpers?: number;
  /** The finale: every germ of the gang, nerve relays in order, and a fever. */
  finale?: boolean;
  /** How many germs come out of the nest (plus 2 per level above 1). */
  germs: number;
  upgrade: UpgradeId;
  debrief: TalkQuestion;
  /** The germ file (the wanted poster) collected when the mission is done. */
  file: { what: string; where: string; stop: string };
  done: string;
}

export const MISSION_INFO: Record<Mission, MissionInfo> = {
  skin: {
    id: 'skin',
    name: 'The Scraped Knee',
    organ: 'Skin',
    area: 'skin',
    germ: 'scrapes',
    germName: 'Scrapes McGee',
    grades: 'grades 3–5',
    briefing: [
      'Commander Ayo scraped a knee in the gym. Now it is red and sore.',
      'Skin is a wall that keeps germs out. A scrape opens a gap in the wall.',
      'Fly down into the scrape. Scan the skin with Nib, find the germs, and help clean them out.',
    ],
    arrive: 'We are in the scrape! The top layer of skin is gone here. Fly onto the glowing spots and I will scan them.',
    start: { x: 3.4, y: 14.6 },
    scans: [
      { x: 5.6, y: 6.8 },
      { x: 12.4, y: 15.6 },
      { x: 21.4, y: 6.4 },
    ],
    nest: { x: 13.6, y: 10.8 },
    exit: { x: 3.6, y: 5.6 },
    germs: 5,
    upgrade: 'escort',
    debrief: {
      text: 'Why does a scrape need to be cleaned and covered?',
      options: [
        { text: 'Cleaning washes germs out, and a cover keeps new ones away.', correct: true, feedback: 'Yes! Clean first, then cover, so the skin can heal.' },
        { text: 'So you can pick the scab later.', feedback: 'Scabs should be left alone. They protect the new skin.', misconception: 'pick-scab' },
        { text: 'It does not matter. Scrapes always heal the same.', feedback: 'Germs in a dirty scrape can make it sore and slow to heal.', misconception: 'heals-itself' },
      ],
      hints: ['Think about the gap in the skin’s wall.', 'Germs can get in the gap. What keeps them out?', 'The answer is outlined: clean it, then cover it.'],
    },
    file: { what: 'Bacteria: tiny living cells. Some can get into a cut.', where: 'Cuts and scrapes, where the skin’s wall is open.', stop: 'Rinse a scrape with clean water and cover it. Do not pick the scab.' },
    done: 'The scrape is clean, and new skin is growing! A white blood cell wants to join your crew.',
  },
  mouth: {
    id: 'mouth',
    name: 'The Sugar Trap',
    organ: 'Mouth and teeth',
    area: 'mouth',
    germ: 'plaque',
    germName: 'Plaque Jack',
    grades: 'grades 3–5',
    briefing: [
      'Commander Ayo has a sore tooth. The station has been eating a lot of space candy.',
      'Bacteria live on teeth. They eat sugar and make acid. The acid can make holes in teeth.',
      'Fly into the mouth. Scan the teeth and the tongue, then clear out Plaque Jack and the gang.',
    ],
    arrive: 'We are on the tongue! Those white hills are teeth. Watch out for the sugar. Fly onto the glowing spots to scan.',
    start: { x: 12.4, y: 10.4 },
    scans: [
      { x: 6.4, y: 5.8 },
      { x: 13.4, y: 15.4 },
      { x: 18.8, y: 5.6 },
    ],
    nest: { x: 21.2, y: 11.6 },
    exit: { x: 4.4, y: 12.2 },
    germs: 6,
    upgrade: 'wave',
    debrief: {
      text: 'Why does brushing twice a day stop cavities?',
      options: [
        { text: 'It scrubs off the bacteria before their acid makes holes.', correct: true, feedback: 'Yes! No plaque means no acid on your teeth.' },
        { text: 'It makes teeth grow back.', feedback: 'Teeth cannot grow back. Brushing protects the ones you have.', misconception: 'heals-itself' },
        { text: 'Brushing does not matter if you eat candy.', feedback: 'Brushing matters most of all when you eat sweet things.', misconception: 'sugar-ok' },
      ],
      hints: ['What makes the acid?', 'The bacteria in plaque make it. Brushing scrubs them off.', 'The answer is outlined: brushing removes them before they make acid.'],
    },
    file: { what: 'Cavity bacteria: they eat sugar and make acid.', where: 'In plaque, the sticky film on teeth.', stop: 'Brush twice a day for two minutes, floss, and have fewer sugary snacks.' },
    done: 'The teeth are clean and the plaque is gone! Your ship learned the saliva wave.',
  },
  lungs: {
    id: 'lungs',
    name: 'The Flu',
    organ: 'Nose and lungs',
    area: 'lungs',
    germ: 'sniffles',
    germName: 'Sniffles',
    grades: 'grades 3–5',
    briefing: [
      'Commander Ayo has a fever and a cough. It is the flu.',
      'The flu is caused by a virus. It spreads when people cough, sneeze, or touch their faces with dirty hands.',
      'Fly into the lungs. The air flows in one way, so it will push you along. Scan the airways, then clear out Sniffles.',
    ],
    arrive: 'We are in the lungs! Feel the air pushing us? It flows in toward the tiny air sacs. Fly onto the glowing spots to scan.',
    start: { x: 3.2, y: 10.8 },
    scans: [
      { x: 6.6, y: 8.2 },
      { x: 12.8, y: 13.8 },
      { x: 19.6, y: 8.4 },
    ],
    nest: { x: 16.4, y: 11.4 },
    exit: { x: 23.6, y: 12.6 },
    flow: { x: 0.45, y: 0 },
    germs: 7,
    upgrade: 'net',
    debrief: {
      text: 'Why does washing your hands help stop the flu?',
      options: [
        { text: 'Soap and scrubbing lift the virus off, so it cannot get to your nose or mouth.', correct: true, feedback: 'Yes! Clean hands keep the flu from getting in, and from spreading to others.' },
        { text: 'A quick splash of water kills every germ.', feedback: 'Water alone leaves many germs. Soap and 20 seconds of scrubbing work.', misconception: 'water-only' },
        { text: 'Washing keeps you warm, and cold weather causes the flu.', feedback: 'Cold weather does not cause the flu. The flu virus does.', misconception: 'cold-weather' },
      ],
      hints: ['How does the flu virus get into your body?', 'It can ride on your hands to your nose or mouth.', 'The answer is outlined: soap lifts the virus off your hands.'],
    },
    file: { what: 'The flu virus: much smaller than bacteria, and not a cell.', where: 'The nose, the airways and the lungs.', stop: 'Wash hands with soap for 20 seconds, cough into your elbow, and rest at home when sick.' },
    done: 'The airways are clear, and Commander Ayo can breathe easy! Your ship learned the mucus net.',
  },
  gut: {
    id: 'gut',
    name: 'The Tummy Trouble',
    organ: 'Stomach and gut',
    area: 'stomach',
    germ: 'queasy',
    germName: 'Queasy Louie',
    grades: 'grades 3–5',
    briefing: [
      'Commander Ayo has a tummy ache. The station’s picnic chicken was not cooked all the way through.',
      'Some bacteria in food make the stomach sick. But most bacteria in the gut are helpers. They help digest food.',
      'Fly into the stomach. Scan it, then clear out Queasy Louie. Careful: the beam zaps whatever is closest, so keep the good bacteria safe!',
    ],
    arrive: 'We are in the stomach! See the folds? They squeeze food. The glowing pool is stomach acid. And the green bean cells are good bacteria: our friends.',
    start: { x: 3.4, y: 10.4 },
    scans: [
      { x: 6.8, y: 6.4 },
      { x: 12.6, y: 16.0 },
      { x: 19.8, y: 6.0 },
    ],
    nest: { x: 17.8, y: 12.0 },
    exit: { x: 3.6, y: 5.4 },
    helpers: 4,
    germs: 6,
    upgrade: 'buddies',
    debrief: {
      text: 'Why didn’t we zap the good bacteria?',
      options: [
        { text: 'They are helpers: they digest food and crowd out bad germs.', correct: true, feedback: 'Yes! Most gut bacteria are on our side.' },
        { text: 'We missed them by mistake. All bacteria are bad.', feedback: 'Most bacteria in the gut are helpers, not germs.', misconception: 'all-germs-bad' },
        { text: 'Because they were viruses.', feedback: 'They are bacteria, and they are helpful ones.', misconception: 'virus-bacteria' },
      ],
      hints: ['What do the good bacteria do for the gut?', 'They help break down food and leave less room for bad germs.', 'The answer is outlined: they are helpers.'],
    },
    file: { what: 'Food-poisoning bacteria: tiny living cells that upset the stomach.', where: 'Food that is not cooked well or left out warm, and unwashed hands.', stop: 'Wash hands before eating, wash fruit and vegetables, cook meat all the way through, and keep leftovers cold.' },
    done: 'The tummy feels better, and the good bacteria are safe! Two of them want to fly with you.',
  },
  heart: {
    id: 'heart',
    name: 'The Blood Bandit',
    organ: 'Heart and blood',
    area: 'blood',
    germ: 'bandit',
    germName: 'The Blood Bandit',
    grades: 'grades 3–5',
    briefing: [
      'A germ got into Commander Ayo’s blood through a cut. Now it is riding all around the body.',
      'The heart pumps blood one way, in pushes. Red blood cells carry oxygen. White blood cells fight germs.',
      'Fly into a blood vessel. The blood will push you with every heartbeat. Scan it, then catch the Blood Bandit.',
    ],
    arrive: 'We are in a blood vessel! Feel the push with each heartbeat? Blood flows one way, so we flow with it. Look at all the red blood cells.',
    start: { x: 2.6, y: 10.6 },
    scans: [
      { x: 7.4, y: 6.2 },
      { x: 13.2, y: 15.2 },
      { x: 19.4, y: 7.0 },
    ],
    nest: { x: 20.8, y: 12.6 },
    exit: { x: 24.0, y: 16.0 },
    flow: { x: 0.9, y: 0 },
    pulse: true,
    germs: 7,
    upgrade: 'darts',
    debrief: {
      text: 'Why does the blood need to flow in one direction?',
      options: [
        { text: 'So it can carry oxygen out to the body and come back for more.', correct: true, feedback: 'Yes! The valves keep the blood going one way, round and round.' },
        { text: 'It does not matter which way blood flows.', feedback: 'If blood sloshed back, oxygen would not get where it is needed.', misconception: 'wrong-order' },
        { text: 'So the heart can stop and rest.', feedback: 'The heart never stops. It rests only a moment between beats.', misconception: 'heart-tired' },
      ],
      hints: ['What does the blood carry, and where to?', 'Out to the body with oxygen, then back to the lungs for more.', 'The answer is outlined: one way, so the oxygen gets delivered.'],
    },
    file: { what: 'A germ that sneaks into the blood and rides around the body.', where: 'The blood, after getting in through a cut or a sore.', stop: 'Clean and cover cuts. Tell a grown-up about a cut that gets hot, red or swollen.' },
    done: 'The blood is clear, and Commander Ayo’s heart is pumping strong! Your ship learned antibody darts.',
  },
  brain: {
    id: 'brain',
    name: 'The Big Defense',
    organ: 'Brain and nerves',
    area: 'brain',
    germ: 'sniffles',
    germName: 'The Grime Gang',
    grades: 'grades 3–5',
    briefing: [
      'Uh oh. The whole Grime Gang is back, all at once, for one last try!',
      'The brain is the body’s control center. It sends messages along the nerves to every part of the body.',
      'Fly into the brain. Carry the message along the nerves, one glowing relay at a time, and call every defense to help.',
    ],
    arrive: 'We are in the brain! These glowing paths are nerves. Each spark is a message. Fly to the glowing relay, and we will send the call.',
    start: { x: 2.8, y: 10.8 },
    scans: [
      { x: 6.4, y: 6.6 },
      { x: 11.4, y: 15.4 },
      { x: 15.6, y: 6.2 },
      { x: 20.6, y: 14.6 },
      { x: 23.2, y: 7.4 },
    ],
    nest: { x: 13.0, y: 11.2 },
    exit: { x: 3.2, y: 15.6 },
    finale: true,
    germs: 10,
    upgrade: 'darts',
    debrief: {
      text: 'How did the brain help the whole body fight back?',
      options: [
        { text: 'It sent messages along the nerves, so every defense worked together.', correct: true, feedback: 'Yes! The brain is the control center, and the nerves carry its calls.' },
        { text: 'It fought the germs all by itself.', feedback: 'The brain gives the orders. The defenses do the fighting, as a team.', misconception: 'wrong-job' },
        { text: 'It only did the thinking.', feedback: 'The brain does much more: it runs breathing, the heartbeat, and even the fever.', misconception: 'brain-thinking-only' },
      ],
      hints: ['What did we carry along the glowing paths?', 'Messages, to call every defense to help.', 'The answer is outlined: the brain sent messages so the whole body worked as a team.'],
    },
    file: { what: 'The whole Grime Gang: bacteria and viruses together.', where: 'Anywhere they can get in: a cut, the mouth, the nose, food, or the blood.', stop: 'Healthy habits: wash hands, brush teeth, cook food well, stay active, and sleep well. Tell a grown-up when you feel sick.' },
    done: 'The Grime Gang is beaten! Every part of the body worked together.',
  },
};

/** The finale's nerve relays: which part of the body each message calls to help. */
export const RELAYS = [
  'Message sent to the skin: hold the wall!',
  'Message sent to the airways: more mucus!',
  'Message sent to the bone marrow: more white blood cells!',
  'Message sent to the stomach: acid ready!',
  'Message sent to the whole body: turn up the heat! A fever slows the germs.',
];
export const FINALE_GO = 'Every defense is here, and the fever is slowing the germs down. Now clear out the Grime Gang!';
export const FINALE_DONE = [
  'Commander Ayo is all better! Thank you, pilot. You know the body inside and out.',
  'Every germ file is collected, and every part of the body is healed. You are a real Body System Hero!',
  'You can fly back into any part of the body to explore and collect body fact cards.',
];

/** Body fact cards: three floating in each healed area (free exploring). */
export interface FactCard {
  id: string;
  mission: Mission;
  title: string;
  text: string;
  x: number;
  y: number;
}
export const FACT_CARDS: FactCard[] = [
  { id: 'skin-1', mission: 'skin', title: 'The biggest organ', text: 'Your skin is your body’s biggest organ. It covers you from head to toe.', x: 20.4, y: 15.2 },
  { id: 'skin-2', mission: 'skin', title: 'New skin', text: 'You lose tiny flakes of skin all the time. New skin keeps growing from underneath.', x: 9.6, y: 5.0 },
  { id: 'skin-3', mission: 'skin', title: 'Cool sweat', text: 'Sweat cools you down as it dries on your skin.', x: 24.0, y: 9.6 },
  { id: 'mouth-1', mission: 'mouth', title: 'The hardest part', text: 'Tooth enamel is the hardest thing in your whole body.', x: 9.4, y: 14.8 },
  { id: 'mouth-2', mission: 'mouth', title: 'Saliva', text: 'You make about one to two liters of saliva every day. It starts digesting food.', x: 16.2, y: 5.0 },
  { id: 'mouth-3', mission: 'mouth', title: 'Two sets of teeth', text: 'Kids have 20 baby teeth. Grown-ups have 32 teeth.', x: 23.6, y: 15.6 },
  { id: 'lungs-1', mission: 'lungs', title: 'Millions of air sacs', text: 'Your lungs have hundreds of millions of tiny air sacs.', x: 10.4, y: 12.4 },
  { id: 'lungs-2', mission: 'lungs', title: 'Breathe, breathe', text: 'You breathe about 20,000 times every day, without thinking about it.', x: 15.2, y: 5.4 },
  { id: 'lungs-3', mission: 'lungs', title: 'Room for the heart', text: 'Your left lung is a little smaller than your right one. It makes room for your heart.', x: 22.4, y: 14.6 },
  { id: 'gut-1', mission: 'gut', title: 'A long tube', text: 'A grown-up’s small intestine is about 6 meters (20 feet) long, all folded up.', x: 22.8, y: 7.6 },
  { id: 'gut-2', mission: 'gut', title: 'Helpers inside', text: 'Trillions of helpful bacteria live in your gut.', x: 8.0, y: 15.4 },
  { id: 'gut-3', mission: 'gut', title: 'A stretchy stomach', text: 'Your stomach’s folds let it stretch when it is full, and shrink back when it is empty.', x: 13.6, y: 5.0 },
  { id: 'heart-1', mission: 'heart', title: 'Beat, beat', text: 'Your heart beats about 100,000 times a day.', x: 10.6, y: 11.0 },
  { id: 'heart-2', mission: 'heart', title: 'A quick trip', text: 'Blood goes all the way around your body in about one minute.', x: 16.6, y: 4.8 },
  { id: 'heart-3', mission: 'heart', title: 'Long, long tubes', text: 'A grown-up’s blood vessels, laid end to end, would go around the Earth more than twice.', x: 5.4, y: 15.8 },
  { id: 'brain-1', mission: 'brain', title: 'Billions of nerve cells', text: 'Your brain has about 86 billion nerve cells.', x: 9.4, y: 9.8 },
  { id: 'brain-2', mission: 'brain', title: 'Fast messages', text: 'Some nerve messages race at more than 100 meters a second.', x: 18.4, y: 9.4 },
  { id: 'brain-3', mission: 'brain', title: 'Hungry brain', text: 'Your brain uses about one fifth of your body’s energy.', x: 24.0, y: 12.0 },
];

export const UPGRADES: Record<UpgradeId, { name: string; what: string }> = {
  escort: { name: 'White blood cell escort', what: 'A white blood cell flies with you and zaps germs too. In your body, white blood cells rush to fight germs.' },
  wave: { name: 'Saliva wave', what: 'Press E (or the wave button) to wash away every germ close by. Saliva helps wash food and germs off your teeth.' },
  net: { name: 'Mucus net', what: 'Every few seconds, sticky mucus catches the germs near you. In your airways, mucus traps germs.' },
  buddies: { name: 'Gut buddies', what: 'Two good bacteria fly with you and crowd the germs, so they slow down. In your gut, good bacteria leave less room for bad germs.' },
  darts: { name: 'Antibody darts', what: 'Every few seconds, a dart sticks to a germ, and your beam clears it twice as fast. In your blood, antibodies stick to one kind of germ, like a key in a lock.' },
};

export const OPENING: string[] = [
  'Welcome to the med bay! I am Dr. Ama Okafor, the station doctor.',
  'Commander Ayo is not feeling well. A scraped knee, a sore tooth, a cough, and a tummy ache too.',
  'This is my shrink beam. It makes our ship, the Micro-Scout, smaller than a grain of sand.',
  'You will fly it inside Commander Ayo’s body, with Nib as your co-pilot. Learn how each part works, find the germs, and help the body heal.',
];
export const NIB_HELLO = 'Beep boop! I am Nib. I scan cells and give hints. Let’s fly!';
export const AYO_LINES: Record<number, string> = {
  0: 'Achoo! Oh, sorry. My knee is sore, my tooth hurts, and I have a cough. Thank you for helping!',
  1: 'My knee feels better already. Thank you, pilot!',
  2: 'My knee and my tooth feel so much better!',
  3: 'I can breathe easy again! My tummy still feels funny, though.',
  4: 'My tummy is much better. Thank you! I just feel a bit tired.',
  5: 'I feel strong again! But Dr. Ama looks worried about something...',
  6: 'I feel great! Thank you, Body System Hero!',
};
export const NIB_LINES = [
  'Your body has trillions of cells. I have scanned only a few of them!',
  'Fun fact: you make about one to two liters of saliva every day.',
  'Fun fact: your skin is your biggest organ.',
  'Fun fact: you breathe about 20,000 times a day.',
  'Fun fact: your heart beats about 100,000 times a day.',
  'Fly back into a healed part of the body to find body fact cards!',
];
export const HELPER_HIT = 'Ow! That was a good bacterium. Steer so the germs are closer than the helpers.';
export const HELPERS_SAFE = 'Every helper is safe! Nice flying.';
export const EXPLORE_ARRIVE = 'Free exploring! No questions this time. Find the gold fact cards, then fly to the glowing ring to go home.';
export const CONTROLS_TIP_KEYS = 'Walk with the arrow keys or WASD, or click where you want to go. Press Space to talk. J shows the missions.';
export const CONTROLS_TIP_TOUCH = 'Tap where you want to go, or use the pad. Tap someone to talk to them.';
export const FLY_TIP_KEYS = 'Fly with the arrow keys or WASD, or hold the mouse button down where you want to go. The cleaning beam zaps germs close by on its own.';
export const FLY_TIP_TOUCH = 'Hold your finger where you want to fly, or use the pad. The cleaning beam zaps germs close by on its own.';
export const NEST_LOCKED = 'That is the germs’ nest! Scan every glowing spot first, so we know what we are dealing with.';
export const NEST_FOUND = 'Found them! Let me scan one of these germs.';
export const HEAL_GO = 'Now catch them! Fly close, and the cleaning beam will zap them.';
export const HEALED = 'All clear! Fly to the glowing ring to go back to the med bay.';
export const BUMP_LINES = ['Whoa! It bumped us.', 'Bloop! Steady now.', 'Hey, that tickles!'];
export const BACK_HOME = 'Welcome back! How did it go down there?';

const PRAISE = ['Great scan!', 'You know your body!', 'Spot on!', 'Beep boop, correct!', 'Nicely done!', 'That’s right!'];
export function praise(i: number): string {
  return PRAISE[i % PRAISE.length];
}

/** The sentence after a wrong answer: the choice's own reason (never gives the answer away). */
export function mistakeLine(c: Choice): string {
  return c.why ?? 'Not quite. Look at the question again.';
}

/** The hint ladder: 1 a nudge, 2 a worked clue, 3 the answer outlined with its reason. */
export function hintText(q: Question, rung: number): string {
  if (rung >= 3) return `The answer is outlined. ${q.explain}`;
  return q.hints[rung - 1];
}

// ------------------------------------------------------------------ the grown-ups page

export const GROWNUPS: GrownupsContent = {
  game: 'Body System Heroes',
  grades: '3–5',
  summary:
    'Your child pilots the Micro-Scout, a ship shrunk smaller than a grain of sand, through the body of Commander Ayo, the Star Station’s commander, who is not feeling well. Each mission visits one part of the body. Your child flies freely around it, scans its parts and answers questions about how they work, works out what is wrong, and then helps clear out the germs with the body’s own defenses, which become upgrades for the ship. Back in the med bay, a short healthy-habit game practices what keeps that germ away (washing hands for 20 seconds, brushing, cleaning and covering a scrape, keeping food safe, staying active). Five missions heal the skin, the mouth, the lungs, the gut and the heart; the finale in the brain brings every defense together. Nothing is timed except the habits that really take time.',
  teaches: [
    { title: 'The Scraped Knee (skin)', text: 'Skin as the body’s wall; nerves and sweat; how a cut heals (a clot, a scab, new skin); what platelets and white blood cells do; why we clean and cover a scrape and leave the scab alone; the skin’s layers.' },
    { title: 'The Sugar Trap (mouth and teeth)', text: 'Digestion starts in the mouth; saliva, the tongue, front and back teeth, and enamel; how plaque bacteria eat sugar and make acid that causes cavities; brushing twice a day for two minutes, floss and fluoride; why sipping sugary drinks all day is harder on teeth.' },
    { title: 'The Flu (nose and lungs)', text: 'The path of air (nose, windpipe, smaller tubes, millions of tiny air sacs); oxygen in, carbon dioxide out; the diaphragm; how mucus and cilia trap and sweep out germs; the flu is a virus that spreads by coughs, sneezes and hands; antibiotics do not work on viruses; a fever is the body fighting; washing hands with soap for 20 seconds.' },
    { title: 'The Tummy Trouble (stomach and gut)', text: 'Digestion starts in the mouth; the path of food (mouth, stomach, small intestine, large intestine); stomach acid; villi; most digestion in the small intestine; most gut bacteria are helpers; why antibiotics are not for every tummy ache; washing hands and food, cooking meat through, keeping leftovers cold.' },
    { title: 'The Blood Bandit (heart and blood)', text: 'The heart as a pump with four chambers and one-way valves; red blood cells carry oxygen, white blood cells fight germs, and new blood cells come from bone marrow; antibodies; the pulse; blood is always red; exercise and a strong heart.' },
    { title: 'The Big Defense (brain and nerves, the finale)', text: 'The brain as the control center; nerves carry messages; the skull; reflexes; the brain runs breathing and the heartbeat; sleep; a fever is the body fighting; how every body system works together to beat germs.' },
    { title: 'Three levels for every mission', text: 'Level 1 names the parts and what they do (grade 3). Level 2 follows how they work, step by step (grade 4). Level 3 asks what happens when a part is hurt or sick, and how body systems depend on each other (grade 5). The level goes up after two clean answers in a row and down after two misses.' },
    { title: 'Mistakes get a reason', text: 'Every wrong answer comes from a real mix-up, and your child gets one sentence about it: thinking antibiotics cure the flu, that cold weather causes it, that a quick rinse cleans hands, that a scab should be picked, that a cavity heals by itself, that sugar does not matter, that the lungs are empty bags, or that a fever is the sickness itself.' },
    { title: 'Healthy habits and free exploring', text: 'After each mission, a short habit game: clean and cover a scrape, brush every tooth, wash hands for 20 real seconds, wash fruit and vegetables and keep food cold, and a jump-rope game where the heart rate rises. Healed parts of the body can be explored freely to collect 18 body fact cards.' },
  ],
  standards: [
    { code: '4-LS1-1', text: 'Construct an argument that plants and animals have internal and external structures that function to support survival, growth, behavior and reproduction.' },
    { code: 'MS-LS1-3 (preview)', text: 'The body is a system of interacting subsystems (level 3 questions about how systems depend on each other).' },
    { code: 'NHES 1 and 7', text: 'National Health Education Standards: health promotion and disease prevention, and practicing healthy behaviors (handwashing, brushing, caring for cuts).' },
  ],
  talk: [
    'Ask: why do we wash hands for 20 seconds and not just rinse them? (Soap and scrubbing lift germs off.)',
    'Ask: is the flu caused by cold weather? (No: by the flu virus, spread by people.)',
    'Time two minutes of brushing together with a song or a timer.',
    'Next time there is a scrape, talk through the steps: rinse, cover, and leave the scab alone.',
    'Feel your pulse together before and after jumping for a minute. Why does it speed up?',
    'Ask: are all bacteria bad? (No: most gut bacteria are helpers.)',
  ],
  help: [
    'Every question can be read aloud (the speaker button), and every answer can be picked with the number keys.',
    'A wrong answer never loses progress; it only costs that question’s star. Three hints are always there.',
    'The ship cannot be hurt: a germ that bumps it only nudges it.',
  ],
  simplifies: [
    'The germs have faces and names, and the body’s cells are drawn big and friendly. Real germs and cells are far too small to see without a microscope.',
    'The ship’s “cleaning beam” stands for the body’s own defenses doing their work; in real life, the body’s immune system, rest and care do the healing.',
    'This is a learning game, not medical advice. For a deep cut, a bad toothache, or a fever, talk to a doctor or dentist.',
  ],
  credits: [
    'Learning design and art by Learning Adventures, made in code. Rebuilt from the original Body System Heroes game.',
    'Facts checked against the CDC (handwashing; how flu spreads; food safety; physical activity for children), NIH MedlinePlus, NIH NIDDK (the digestive system), Nemours KidsHealth, and the American Dental Association.',
  ],
};
