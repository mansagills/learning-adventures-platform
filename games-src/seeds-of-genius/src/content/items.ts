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
};
