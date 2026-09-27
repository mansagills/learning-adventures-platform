/**
 * Memories from Carver's life: short illustrated storybook pages. Young
 * George is drawn as a child; the adult Carver is never shown at events from
 * his childhood. The facts come from the National Park Service biography
 * (see content/sources.ts); the pictures are imagined.
 */
export interface MemoryPage {
  /** Key for the painter in art/memoryArt.ts. */
  art: string;
  caption: string;
}

export interface Memory {
  id: string;
  title: string;
  /** Where and when, stated plainly. */
  setting: string;
  pages: MemoryPage[];
}

export const MEMORIES: Record<string, Memory> = {
  childhood: {
    id: 'childhood',
    title: 'The Plant Doctor',
    setting: 'Diamond, Missouri, in the 1870s',
    pages: [
      {
        art: 'farm',
        caption:
          'George was born into slavery around 1864, near Diamond, Missouri. After slavery ended, he and his brother Jim were raised by Moses and Susan Carver on their farm.',
      },
      {
        art: 'woods',
        caption:
          'George was often sick as a boy, so he helped with chores in the house and garden. In his free time he explored the woods, looking closely at plants, insects and rocks.',
      },
      {
        art: 'doctor',
        caption:
          "He kept a small garden of his own. Neighbors brought him plants that were not doing well, and he helped many grow strong again. People called him the 'plant doctor.'",
      },
    ],
  },
  tuskegee_soil: {
    id: 'tuskegee_soil',
    title: 'Tired Cotton Fields',
    setting: 'Tuskegee Institute, Alabama, from 1896',
    pages: [
      {
        art: 'mem-station',
        caption:
          "At Tuskegee Institute, Carver worked with farmers whose soil had grown cotton year after year. Cotton had worn much of the soil out. He used test plots to try ways to make it healthy again.",
      },
      {
        art: 'mem-bulletin',
        caption:
          'He taught farmers to take turns: plant cotton one season, then legumes such as peanuts or peas, which put nitrogen back into the soil. He also wrote short booklets in plain words so farmers could try these ideas at home.',
      },
    ],
  },
  peanut_lab: {
    id: 'peanut_lab',
    title: 'New Uses for Crops',
    setting: 'Tuskegee Institute, Alabama, early 1900s',
    pages: [
      {
        art: 'mem-lab',
        caption:
          'In his laboratory at Tuskegee, Carver looked for new ways to use peanuts, sweet potatoes and other crops that farmers could grow when they took turns with cotton. He shared many of his ideas and recipes in plain-language bulletins.',
      },
      {
        art: 'mem-congress',
        caption:
          'In 1921, he spoke to a committee of the United States Congress about the many ways peanuts could be used. People sometimes say he invented peanut butter, but he did not. People had made peanut pastes long before him.',
      },
    ],
  },
};


