/**
 * The upgrade shop: what the stand can sell, and the stall's looks. Bought
 * with the money earned from right answers. Each line unlocks in order.
 * Prices are in cents.
 */

export type Line = 'food' | 'drink' | 'topping' | 'stall';

export interface Upgrade {
  id: string;
  line: Line;
  name: string;
  /** What it does, in a few words. */
  text: string;
  cost: number;
  /** Extra tip on every sale (cents). */
  tip: number;
  /** More customers each day. */
  customers: number;
  /** Customers wait a little longer in line (seconds). */
  patience: number;
}

export const LINES: Array<{ id: Line; name: string }> = [
  { id: 'food', name: 'Food' },
  { id: 'drink', name: 'Drinks' },
  { id: 'topping', name: 'Toppings' },
  { id: 'stall', name: 'Stall' },
];

export const UPGRADES: Upgrade[] = [
  // food (popcorn is free from the start)
  { id: 'popcorn', line: 'food', name: 'Popcorn', text: 'Your first snack.', cost: 0, tip: 0, customers: 0, patience: 0 },
  { id: 'pretzel', line: 'food', name: 'Pretzels', text: 'Warm and salty. +1¢ tips.', cost: 150, tip: 1, customers: 1, patience: 0 },
  { id: 'hotdog', line: 'food', name: 'Hot dogs', text: 'A crowd favorite. +2¢ tips.', cost: 400, tip: 2, customers: 1, patience: 0 },
  { id: 'taco', line: 'food', name: 'Tacos', text: 'Crunchy! +3¢ tips.', cost: 900, tip: 3, customers: 1, patience: 0 },
  { id: 'pizza', line: 'food', name: 'Pizza slices', text: 'The best seller. +5¢ tips.', cost: 1800, tip: 5, customers: 2, patience: 0 },
  // drinks (water is free)
  { id: 'water', line: 'drink', name: 'Water', text: 'Cold and fresh.', cost: 0, tip: 0, customers: 0, patience: 0 },
  { id: 'lemonade', line: 'drink', name: 'Lemonade', text: 'Sweet and sour. +1¢ tips.', cost: 120, tip: 1, customers: 1, patience: 0 },
  { id: 'punch', line: 'drink', name: 'Fruit punch', text: 'Bright red! +2¢ tips.', cost: 350, tip: 2, customers: 0, patience: 1 },
  { id: 'smoothie', line: 'drink', name: 'Smoothies', text: 'Berry blast. +3¢ tips.', cost: 800, tip: 3, customers: 1, patience: 0 },
  { id: 'cocoa', line: 'drink', name: 'Hot cocoa', text: 'With a marshmallow. +4¢ tips.', cost: 1500, tip: 4, customers: 1, patience: 1 },
  // toppings
  { id: 'salt', line: 'topping', name: 'Salt', text: 'A pinch on top. Customers wait a bit longer.', cost: 80, tip: 0, customers: 0, patience: 1 },
  { id: 'ketchup', line: 'topping', name: 'Ketchup', text: 'Red squeeze bottle. +1¢ tips.', cost: 200, tip: 1, customers: 0, patience: 1 },
  { id: 'mustard', line: 'topping', name: 'Mustard', text: 'Yellow squeeze bottle. +1¢ tips.', cost: 450, tip: 1, customers: 1, patience: 0 },
  { id: 'cheese', line: 'topping', name: 'Cheese', text: 'Melty! +2¢ tips.', cost: 1000, tip: 2, customers: 0, patience: 1 },
  { id: 'sprinkles', line: 'topping', name: 'Sprinkles', text: 'Rainbow on everything. +3¢ tips.', cost: 1600, tip: 3, customers: 1, patience: 1 },
  // the stall's looks
  { id: 'awning', line: 'stall', name: 'Striped awning', text: 'Shade for the line. Customers wait longer.', cost: 250, tip: 0, customers: 0, patience: 2 },
  { id: 'sign', line: 'stall', name: 'Chalkboard sign', text: 'People see your menu. +1 customer.', cost: 500, tip: 0, customers: 1, patience: 0 },
  { id: 'plants', line: 'stall', name: 'Flower pots', text: 'So pretty. +1¢ tips.', cost: 700, tip: 1, customers: 0, patience: 1 },
  { id: 'lights', line: 'stall', name: 'String lights', text: 'The stand glows. +2¢ tips.', cost: 1200, tip: 2, customers: 1, patience: 1 },
];

export const STARTING = ['popcorn', 'water'];

/** The next thing to buy in a line (null when the line is complete). */
export function nextIn(line: Line, owned: string[]): Upgrade | null {
  return UPGRADES.find((u) => u.line === line && !owned.includes(u.id)) ?? null;
}

/** What can be bought right now: the next item in each line. */
export function shopOffers(owned: string[]): Upgrade[] {
  return LINES.map((l) => nextIn(l.id, owned)).filter((u): u is Upgrade => u !== null);
}

/** Totals from everything owned. */
export function bonuses(owned: string[]): { tip: number; customers: number; patience: number } {
  return UPGRADES.filter((u) => owned.includes(u.id)).reduce(
    (a, u) => ({ tip: a.tip + u.tip, customers: a.customers + u.customers, patience: a.patience + u.patience }),
    { tip: 0, customers: 0, patience: 0 },
  );
}

/** The menu: everything owned that customers can order, by line. */
export function menu(owned: string[]): { food: Upgrade[]; drink: Upgrade[]; topping: Upgrade[] } {
  const by = (line: Line) => UPGRADES.filter((u) => u.line === line && owned.includes(u.id));
  return { food: by('food'), drink: by('drink'), topping: by('topping') };
}

/** Customers in a day: 6 to start, more with upgrades (max 14). */
export function customersPerDay(owned: string[]): number {
  return Math.min(14, 6 + bonuses(owned).customers);
}
