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
  /** How many germs come out of the nest (plus 2 per level above 1). */
  germs: number;
  upgrade: UpgradeId;
  debrief: TalkQuestion;
  /** The germ file (the wanted poster) collected when the mission is done. */
  file: { what: string; where: string; stop: string };
  done: string;
}

export const MISSION_INFO: Partial<Record<Mission, MissionInfo>> = {
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
};

export const UPGRADES: Record<UpgradeId, { name: string; what: string }> = {
  escort: { name: 'White blood cell escort', what: 'A white blood cell flies with you and zaps germs too. In your body, white blood cells rush to fight germs.' },
  wave: { name: 'Saliva wave', what: 'Press E (or the wave button) to wash away every germ close by. Saliva helps wash food and germs off your teeth.' },
  net: { name: 'Mucus net', what: 'Every few seconds, sticky mucus catches the germs near you. In your airways, mucus traps germs.' },
};

export const OPENING: string[] = [
  'Welcome to the med bay! I am Dr. Ama Okafor, the station doctor.',
  'Commander Ayo is not feeling well. A scraped knee, a sore tooth, and now a cough.',
  'This is my shrink beam. It makes our ship, the Micro-Scout, smaller than a grain of sand.',
  'You will fly it inside Commander Ayo’s body, with Nib as your co-pilot. Learn how each part works, find the germs, and help the body heal.',
];
export const NIB_HELLO = 'Beep boop! I am Nib. I scan cells and give hints. Let’s fly!';
export const AYO_LINES: Record<number, string> = {
  0: 'Achoo! Oh, sorry. My knee is sore, my tooth hurts, and I have a cough. Thank you for helping!',
  1: 'My knee feels better already. Thank you, pilot!',
  2: 'My knee and my tooth feel so much better!',
  3: 'I can breathe easy again! You are a real body hero.',
};
export const NIB_LINES = [
  'Your body has trillions of cells. I have scanned only a few of them!',
  'Fun fact: you make about one to two liters of saliva every day.',
  'Fun fact: your skin is your biggest organ.',
  'Fun fact: you breathe about 20,000 times a day.',
];
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
    'Your child pilots the Micro-Scout, a ship shrunk smaller than a grain of sand, through the body of Commander Ayo, the Star Station’s commander, who is not feeling well. Each mission visits one part of the body. Your child flies freely around it, scans its parts and answers questions about how they work, works out what is wrong, and then helps clear out the germs with the body’s own defenses, which become upgrades for the ship. Back in the med bay, a short healthy-habit game practices what keeps that germ away (washing hands for 20 seconds, brushing, cleaning and covering a scrape). Nothing is timed except the habits that really take time.',
  teaches: [
    { title: 'The Scraped Knee (skin)', text: 'Skin as the body’s wall; nerves and sweat; how a cut heals (a clot, a scab, new skin); what platelets and white blood cells do; why we clean and cover a scrape and leave the scab alone; the skin’s layers.' },
    { title: 'The Sugar Trap (mouth and teeth)', text: 'Digestion starts in the mouth; saliva, the tongue, front and back teeth, and enamel; how plaque bacteria eat sugar and make acid that causes cavities; brushing twice a day for two minutes, floss and fluoride; why sipping sugary drinks all day is harder on teeth.' },
    { title: 'The Flu (nose and lungs)', text: 'The path of air (nose, windpipe, smaller tubes, millions of tiny air sacs); oxygen in, carbon dioxide out; the diaphragm; how mucus and cilia trap and sweep out germs; the flu is a virus that spreads by coughs, sneezes and hands; antibiotics do not work on viruses; a fever is the body fighting; washing hands with soap for 20 seconds.' },
    { title: 'Three levels for every mission', text: 'Level 1 names the parts and what they do (grade 3). Level 2 follows how they work, step by step (grade 4). Level 3 asks what happens when a part is hurt or sick, and how body systems depend on each other (grade 5). The level goes up after two clean answers in a row and down after two misses.' },
    { title: 'Mistakes get a reason', text: 'Every wrong answer comes from a real mix-up, and your child gets one sentence about it: thinking antibiotics cure the flu, that cold weather causes it, that a quick rinse cleans hands, that a scab should be picked, that a cavity heals by itself, that sugar does not matter, that the lungs are empty bags, or that a fever is the sickness itself.' },
    { title: 'Coming next', text: 'The gut (and why we protect the good bacteria), the heart and blood, and the finale in the brain.' },
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
    'Facts checked against the CDC (handwashing; how flu spreads), NIH MedlinePlus, Nemours KidsHealth, and the American Dental Association.',
  ],
};
