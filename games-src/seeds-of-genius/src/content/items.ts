import type { ItemDefinition } from '../quests/types';

/**
 * Quest items. Chapters 1-7 add their own entries here when they are built
 * (field notebook, magnifying lens, soil samples, ...).
 */
export const ITEMS: Record<string, ItemDefinition> = {
  seed_packet: {
    id: 'seed_packet',
    name: 'Mystery Seed Packet',
    icon: 'seedPacket',
    description: 'A paper packet of seeds that Carver ordered for his windowsill.',
    lookCloser: [
      'The brown paper is soft and a little crumpled at the corners.',
      'Inside are about twenty seeds. Each one is small, flat and tan, with a pointed tip.',
      "The label says only: 'From a farm down south. Plant in spring.'",
    ],
    purpose: 'Carver asked you to bring it to him.',
    chapterId: 'practice',
  },
  field_notebook: {
    id: 'field_notebook',
    name: 'Field Notebook',
    icon: 'notebook',
    description: "Hattie Bell's garden notebook, with a green cloth cover.",
    lookCloser: [
      'The first page shows how to write an observation: what you see, how many, what color, what size.',
      "There's a pencil tucked into the spine.",
      'Hattie has written "Beans chewed?? Soil by east fence always damp." on page two.',
    ],
    purpose: 'Record exactly what you observe in the garden.',
    chapterId: 'ch1',
  },
  magnifying_lens: {
    id: 'magnifying_lens',
    name: 'Magnifying Lens',
    icon: 'lens',
    description: "Theo's magnifying lens, with a smooth wooden handle.",
    lookCloser: [
      'Through the glass, your fingertip looks like a map of tiny ridges.',
      'Theo scratched his initials, T.O., into the handle.',
      'It makes small things look about three times bigger.',
    ],
    purpose: 'Look closely at small details: edges, hairs, specks of pollen.',
    chapterId: 'ch1',
  },
  nature_card: {
    id: 'nature_card',
    name: 'Nature Observation Card',
    icon: 'card',
    description: 'A card from Carver for observing nature in your own neighborhood.',
    lookCloser: [
      'It has three empty boxes: something I SAW, something I HEARD, something I TOUCHED.',
      'At the bottom it says: "Write what is there, not what you think happened."',
    ],
    purpose: 'An off-screen activity: take it outside (open it from the Journal to print).',
    chapterId: 'ch1',
  },
  school_record: {
    id: 'school_record',
    name: 'School Record Folder',
    icon: 'folder',
    description: "Ms. Nelson's folder of copied records about Carver's schooling.",
    lookCloser: [
      'A record is something written down at the time, like a diploma or a letter.',
      'Some pages have dates: "1870s", "about 1885", "1890", "1891 to 1896".',
      'Two moments in the folder have no date at all. The displays will have to help.',
    ],
    purpose: 'Put dates on the timeline cards.',
    chapterId: 'ch2',
  },
  botanical_sketch: {
    id: 'botanical_sketch',
    name: 'Botanical Sketch',
    icon: 'sketch',
    description: "Ada's pencil drawing of a leaf, with every vein drawn in.",
    lookCloser: [
      'Ada counted the veins before she drew them. Drawing is a way of looking closely.',
      'In the corner she wrote: "Carver studied art first, then plants."',
    ],
    purpose: 'A clue about where art fits in Carver\'s journey.',
    chapterId: 'ch2',
  },
  journey_card: {
    id: 'journey_card',
    name: 'Journey Card',
    icon: 'card',
    description: 'A card from Carver for making your own learning timeline.',
    lookCloser: [
      'It has a long line with five empty dots, and a box that says "Someone who helped me".',
      'At the bottom it says: "Every journey has helpers. Who are yours?"',
    ],
    purpose: 'An off-screen activity: draw a timeline of something you learned (open it from the Journal to print).',
    chapterId: 'ch2',
  },
  soil_samples: {
    id: 'soil_samples',
    name: 'Soil Sample Jars',
    icon: 'jar',
    description: "Two jars of soil from Mr. Hill's fields: one from the west plot and one from the east plot.",
    lookCloser: [
      'The west jar is pale and dusty. It crumbles into hard little chunks.',
      'The east jar is darker and smells like a forest floor.',
      'Mr. Hill labeled them in pencil: "West" and "East".',
    ],
    purpose: 'Look at each plot\'s soil up close at the farm.',
    chapterId: 'ch3',
  },
  crop_history: {
    id: 'crop_history',
    name: 'Crop History Ledger',
    icon: 'ledger',
    description: 'Mr. Hill\'s notebook of what he planted in each plot, year by year.',
    lookCloser: [
      'West plot: cotton, cotton, cotton, cotton, cotton.',
      'East plot: cotton, peanuts, cotton, cowpeas, cotton.',
      'In the margin: "West cotton gets smaller every year. Why?"',
    ],
    purpose: 'Compare what each plot grew before.',
    chapterId: 'ch3',
  },
  crop_cards: {
    id: 'crop_cards',
    name: 'Crop Cards',
    icon: 'cropcards',
    description: "Mae's cards for four crops that grow well around here: cotton, peanuts, cowpeas and sweet potatoes.",
    lookCloser: [
      'Peanuts and cowpeas have a little root drawn on them with bumps. Mae wrote "legume" next to it.',
      'Cotton\'s card says: "Sells well. Hungry for nitrogen."',
      'Sweet potato\'s card says: "Not a legume. Needs less nitrogen than cotton."',
    ],
    purpose: 'Plan which crop to plant each season.',
    chapterId: 'ch3',
  },
  rotation_card: {
    id: 'rotation_card',
    name: 'Crop-Rotation Planner',
    icon: 'card',
    description: 'A paper planner from Carver with four season boxes and a cup-of-soil experiment.',
    lookCloser: [
      'Four boxes in a circle: Season 1, Season 2, Season 3, Season 4.',
      'At the bottom: "Try it with cups of soil and bean seeds, with a grown-up."',
    ],
    purpose: 'An off-screen activity: plan a rotation on paper or with cups of soil (open it from the Journal to print).',
    chapterId: 'ch3',
  },
  need_card: {
    id: 'need_card',
    name: 'Community Need Card',
    icon: 'needcard',
    description: "Miss Lottie's card describing what the community kitchen needs.",
    lookCloser: [
      'AFTER-SCHOOL SNACK. Must: keep at least 7 days without a fridge. Be filling. Be easy enough for volunteers in about an hour a week. Be safe for every kid to share.',
      'At the bottom, underlined: "Two of our kids are allergic to peanuts."',
    ],
    purpose: 'Test each invention against what the kitchen really needs.',
    chapterId: 'ch4',
  },
  materials_kit: {
    id: 'materials_kit',
    name: 'Materials Kit',
    icon: 'kit',
    description: "Mr. Brooks's kit: jars with lids, paper bags, a bowl, allergy labels, and the rules of his workshop.",
    lookCloser: [
      'Inside: jars with lids, paper bags, an open bowl, a roll of "Contains peanuts" labels.',
      'A card says: "Workshop rules. No frying: hot oil is too dangerous. No electricity. Keep it to a few steps."',
      'The drying rack and the hand mill are in the workshop.',
    ],
    purpose: 'Build and package your prototypes in the workshop.',
    chapterId: 'ch4',
  },
  invention_card: {
    id: 'invention_card',
    name: 'Invention Sketch Card',
    icon: 'card',
    description: 'A card from Carver for sketching an invention from things you can find at home.',
    lookCloser: [
      'Boxes: "The need", "My idea", "What I will use", "How I will test it", "What I changed".',
      'At the bottom: "Every good invention starts with someone who needs it."',
    ],
    purpose: 'An off-screen activity: sketch an invention from household materials (open it from the Journal to print).',
    chapterId: 'ch4',
  },
};


