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
};
