/**
 * Seed script for 2D World shop items
 * Run with: DATABASE_URL="..." npx ts-node prisma/seed-shop-items.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const shopItems = [
  // ── Consumables ─────────────────────────────────────────────────────────────
  {
    itemId: 'xp-potion-small',
    name: 'XP Potion',
    description: 'A fizzy potion that instantly grants +50 XP!',
    type: 'CONSUMABLE' as const,
    price: 20,
    levelRequirement: 1,
    iconEmoji: '🧪',
    effects: { xpBoost: 50 },
  },
  {
    itemId: 'xp-potion-large',
    name: 'Super XP Potion',
    description: 'A giant sparkling potion that grants +150 XP!',
    type: 'CONSUMABLE' as const,
    price: 50,
    levelRequirement: 3,
    iconEmoji: '⚗️',
    effects: { xpBoost: 150 },
  },
  {
    itemId: 'pizza-slice',
    name: 'Pizza Slice',
    description: 'Yummy! Grants +5 XP and restores your focus.',
    type: 'CONSUMABLE' as const,
    price: 10,
    levelRequirement: 1,
    iconEmoji: '🍕',
    effects: { xpBoost: 5 },
  },
  {
    itemId: 'apple',
    name: 'Shiny Apple',
    description: 'An apple a day keeps the bad grades away! +10 XP.',
    type: 'CONSUMABLE' as const,
    price: 8,
    levelRequirement: 1,
    iconEmoji: '🍎',
    effects: { xpBoost: 10 },
  },
  {
    itemId: 'energy-drink',
    name: 'Energy Drink',
    description: 'Boosts your speed in the world for 60 seconds!',
    type: 'CONSUMABLE' as const,
    price: 30,
    levelRequirement: 2,
    iconEmoji: '⚡',
    effects: { speedBoost: 2.0, duration: 60 },
  },
  {
    itemId: 'brain-cookie',
    name: 'Brain Cookie',
    description: 'A magical cookie that doubles XP for the next adventure!',
    type: 'CONSUMABLE' as const,
    price: 45,
    levelRequirement: 4,
    iconEmoji: '🍪',
    effects: { xpMultiplier: 2.0, duration: 1 },
  },

  // ── Cosmetic Hats ────────────────────────────────────────────────────────────
  {
    itemId: 'wizard-hat',
    name: 'Wizard Hat',
    description: 'A tall pointy hat worn by the greatest math wizards.',
    type: 'EQUIPMENT' as const,
    price: 100,
    levelRequirement: 1,
    iconEmoji: '🧙',
    effects: { slot: 'hat', equipId: 'wizard-hat' },
  },
  {
    itemId: 'baseball-cap',
    name: 'Baseball Cap',
    description: 'A sporty cap for the campus champion!',
    type: 'EQUIPMENT' as const,
    price: 60,
    levelRequirement: 1,
    iconEmoji: '🧢',
    effects: { slot: 'hat', equipId: 'baseball-cap' },
  },
  {
    itemId: 'crown',
    name: 'Golden Crown',
    description: 'Only the top students wear the crown of knowledge!',
    type: 'EQUIPMENT' as const,
    price: 250,
    levelRequirement: 5,
    iconEmoji: '👑',
    effects: { slot: 'hat', equipId: 'crown' },
  },
  {
    itemId: 'party-hat',
    name: 'Party Hat',
    description: 'Celebrate every adventure like it\'s a party!',
    type: 'EQUIPMENT' as const,
    price: 40,
    levelRequirement: 1,
    iconEmoji: '🎉',
    effects: { slot: 'hat', equipId: 'party-hat' },
  },
  {
    itemId: 'astronaut-helmet',
    name: 'Astronaut Helmet',
    description: 'For students who are out of this world! (Level 8)',
    type: 'EQUIPMENT' as const,
    price: 300,
    levelRequirement: 8,
    iconEmoji: '🪐',
    effects: { slot: 'hat', equipId: 'astronaut-helmet' },
  },

  // ── Cosmetic Shirts ──────────────────────────────────────────────────────────
  {
    itemId: 'math-tshirt',
    name: 'Math T-Shirt',
    description: 'Show off your love of numbers with this stylish tee!',
    type: 'EQUIPMENT' as const,
    price: 75,
    levelRequirement: 1,
    iconEmoji: '➕',
    effects: { slot: 'shirt', equipId: 'math-tshirt' },
  },
  {
    itemId: 'lab-coat',
    name: 'Science Lab Coat',
    description: 'Look like a real scientist while you learn!',
    type: 'EQUIPMENT' as const,
    price: 120,
    levelRequirement: 3,
    iconEmoji: '🔬',
    effects: { slot: 'shirt', equipId: 'lab-coat' },
  },
  {
    itemId: 'superhero-cape',
    name: 'Superhero Cape',
    description: 'Every learner is a superhero! Swish!',
    type: 'EQUIPMENT' as const,
    price: 180,
    levelRequirement: 5,
    iconEmoji: '🦸',
    effects: { slot: 'shirt', equipId: 'superhero-cape' },
  },

  // ── Accessories ──────────────────────────────────────────────────────────────
  {
    itemId: 'cool-glasses',
    name: 'Cool Glasses',
    description: 'Smart glasses for smart students!',
    type: 'EQUIPMENT' as const,
    price: 50,
    levelRequirement: 1,
    iconEmoji: '🕶️',
    effects: { slot: 'accessory', equipId: 'cool-glasses' },
  },
  {
    itemId: 'angel-wings',
    name: 'Angel Wings',
    description: 'Float through the campus like a math angel.',
    type: 'EQUIPMENT' as const,
    price: 200,
    levelRequirement: 6,
    iconEmoji: '😇',
    effects: { slot: 'accessory', equipId: 'angel-wings' },
  },
  {
    itemId: 'rainbow-backpack',
    name: 'Rainbow Backpack',
    description: 'The most colorful backpack on campus!',
    type: 'EQUIPMENT' as const,
    price: 90,
    levelRequirement: 2,
    iconEmoji: '🌈',
    effects: { slot: 'accessory', equipId: 'rainbow-backpack' },
  },

  // ── Pets ─────────────────────────────────────────────────────────────────────
  {
    itemId: 'pet-robot',
    name: 'Robot Companion',
    description: 'A tiny robot that follows you everywhere and beeps encouragement!',
    type: 'PET' as const,
    price: 200,
    levelRequirement: 5,
    iconEmoji: '🤖',
    effects: { petId: 'robot' },
  },
  {
    itemId: 'pet-dragon',
    name: 'Baby Dragon',
    description: 'A friendly dragon that breathes rainbow fire for you!',
    type: 'PET' as const,
    price: 350,
    levelRequirement: 10,
    iconEmoji: '🐉',
    effects: { petId: 'dragon' },
  },
  {
    itemId: 'pet-owl',
    name: 'Wise Owl',
    description: 'A wise owl who helps you find clues in games!',
    type: 'PET' as const,
    price: 150,
    levelRequirement: 4,
    iconEmoji: '🦉',
    effects: { petId: 'owl' },
  },
  {
    itemId: 'pet-cat',
    name: 'Lucky Cat',
    description: 'This lucky cat brings bonus coins when you play!',
    type: 'PET' as const,
    price: 175,
    levelRequirement: 3,
    iconEmoji: '🐱',
    effects: { petId: 'cat', coinBonus: 2 },
  },
];

async function main() {
  console.log('🛒 Seeding shop items...');

  let created = 0;
  let skipped = 0;

  for (const item of shopItems) {
    const existing = await prisma.shopItem.findUnique({
      where: { itemId: item.itemId },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.shopItem.create({ data: item });
    created++;
    console.log(`  ✅ Created: ${item.iconEmoji} ${item.name} (${item.price} coins)`);
  }

  console.log(`\n✨ Done! Created ${created} items, skipped ${skipped} existing.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
