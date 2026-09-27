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
};
