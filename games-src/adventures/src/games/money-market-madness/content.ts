import type { GrownupsContent } from '../../kit/ui/grownups';
import { fmt, type Misconception, type Step } from './problems';

/** All the words in Money Market Madness, kept here so they can be reviewed on their own. */

export const HOST_NAME = 'Chef Amara';

export const INTRO = [
  `Welcome to the market! I am ${HOST_NAME}, and this little stand is yours now.`,
  'Customers will line up for snacks. Take their money carefully: count the coins, and make change when they pay with a bill.',
  'Every sale goes in your till. Get it right the first time and you get a tip too!',
  'After each market day, spend your money on upgrades: new food, new drinks, toppings, and a fancier stand.',
  'Ready? Here comes your first customer!',
];

export const CONTROLS_KEYS = 'Space or Enter serves the next customer. Number keys pick answers, H gives a hint, Esc pauses.';
export const CONTROLS_TOUCH = 'Tap Serve for the next customer, then tap coins and answers. Hint is always there if you need it.';

export const TIER_NAME: Record<number, string> = { 1: 'Counting coins', 2: 'Is it enough?', 3: 'Making change', 4: 'Big orders' };
export const TIER_UP: Record<number, string> = {
  2: 'Level up! Customers now pay with quarters too. Check if they paid enough.',
  3: 'Level up! Customers pay with a dollar bill. Count up to make change.',
  4: 'Level up! Bigger orders: add two prices, then make change from $5.',
};

export const PROMPT: Record<Step['kind'], string> = {
  count: 'How much money did they give you?',
  enough: 'Is that enough to pay?',
  total: 'What is the total for both items?',
  change: 'Make their change: tap coins into the tray.',
};

/** One sentence for a wrong answer, from the mistake behind it. */
export function mistakeLine(step: Step, m: Misconception, given: number | boolean): string {
  switch (m) {
    case 'coin-count':
      return 'That is how many coins there are. Add what each coin is worth instead.';
    case 'size-value':
      return 'Careful: the nickel is bigger, but it is only 5¢. The little dime is 10¢.';
    case 'quarter-20':
      return 'A quarter is worth 25¢, not 20¢. Four quarters make a dollar.';
    case 'said-yes':
      return step.kind === 'enough' ? `They paid ${fmt(step.paid)}. That is less than ${fmt(step.price)}, so it is not enough yet.` : 'Look again.';
    case 'said-no':
      return step.kind === 'enough' ? `${fmt(step.paid)} is ${step.paid === step.price ? 'exactly' : 'more than'} ${fmt(step.price)}, so it is enough!` : 'Look again.';
    case 'gave-price':
      return 'That is the price. The change is what is left over: count up from the price to what they paid.';
    case 'off-one':
      return `Off by one penny. Count up again from ${step.kind === 'change' ? fmt(step.price) : 'the price'}.`;
    case 'off-five':
      return 'Off by 5¢. Check your nickels.';
    case 'off-ten':
      return 'Off by 10¢. Count up again slowly: one coin at a time.';
    case 'off-dollar':
      return 'Off by a whole dollar. Count the dollars again.';
    case 'no-regroup':
      return '100 cents make a dollar. When the cents add up to more than 100, carry a dollar.';
    case 'dollars-only':
      return 'You added the dollars. Add the cents too!';
    case 'miscount':
      return 'Close! Count again, biggest coins first.';
    default:
      return typeof given === 'number' ? `Not quite: ${fmt(given)}. Try again.` : 'Not quite. Try again.';
  }
}

export function hintText(step: Step, rung: number): string {
  if (rung === 1)
    return step.kind === 'count'
      ? 'Start with the biggest coins (quarters, then dimes), then nickels, then pennies.'
      : step.kind === 'enough'
        ? 'Compare the two amounts. Which one is more?'
        : step.kind === 'total'
          ? 'Add the cents first. Then add the dollars.'
          : 'Count up from the price to what they paid, coin by coin.';
  if (rung === 2)
    return step.kind === 'count'
      ? 'Each coin now shows how much it is worth. Count along!'
      : step.kind === 'enough'
        ? `${fmt(step.paid)} ${step.paid >= step.price ? (step.paid === step.price ? '=' : '>') : '<'} ${fmt(step.price)}`
        : step.kind === 'total'
          ? `Cents: ${step.prices.map((p) => p % 100).join(' + ')}. Dollars: ${step.prices.map((p) => Math.floor(p / 100)).join(' + ')}.`
          : 'Follow the count-up path. The change so far shows under the tray.';
  return 'The answer is outlined.';
}

export const PRAISE = ['Thank you!', 'Perfect change!', 'Yum, thanks!', 'Great counting!', 'You are a pro!', 'Thanks a bunch!'];
export const LEAVE_LINES = ['Too long! Maybe next time.', 'I have to go!', 'Oh well, bye!'];

export const GROWNUPS: GrownupsContent = {
  game: 'Money Market Madness',
  grades: '1–4',
  summary:
    'Your child runs a snack stand at a market. Customers pay with coins and bills, and your child counts the money, checks if it is enough, and makes change. Money earned buys upgrades for the stand (new food, drinks, toppings and decorations), so getting the math right is how the stand grows.',
  teaches: [
    { title: 'Level 1: Counting coins', text: 'Count pennies, nickels and dimes up to 50¢. The game watches for counting coins instead of their values, and for mixing up the nickel (bigger) and the dime (worth more).' },
    { title: 'Level 2: Is it enough?', text: 'Count coins with quarters up to $1, then compare with a price: is it enough?' },
    { title: 'Level 3: Making change', text: 'A customer pays with a $1 bill. Your child taps coins into the change tray, counting up from the price (35¢: 40, 50, 75, one dollar).' },
    { title: 'Level 4: Big orders', text: 'Add two prices (with regrouping cents into dollars), then make change from $5 with bills and coins.' },
    { title: 'Help built in', text: 'Three hints for every step: a tip, then a model (coin values shown, or the count-up path), then the answer outlined. A wrong answer gets one sentence about the likely mistake.' },
  ],
  standards: [
    { code: '1.MD (counting coins)', text: 'Know the value of pennies, nickels, dimes and quarters.' },
    { code: '2.MD.8', text: 'Solve problems with dollar bills, quarters, dimes, nickels and pennies, using $ and ¢ symbols.' },
    { code: '3.OA.8', text: 'Two-step problems (add the total, then find the change).' },
    { code: '4.MD.2', text: 'Money problems with decimals.' },
  ],
  talk: [
    'At the store, ask: if this costs 65¢ and we pay with a dollar, how much change should we get?',
    'Which coin is bigger, a nickel or a dime? Which is worth more?',
    'Count a handful of coins together, biggest first.',
  ],
  help: [
    'Customers only lose patience while waiting in line, never while your child is serving them, so there is no rush on the math itself.',
    'The level goes up after two right answers in a row and down after two misses, so it stays at the right difficulty.',
    'Coins in the game have their value stamped on them, and they are drawn at their real relative sizes.',
  ],
  simplifies: ['Prices on the menu change with your child\'s level so the numbers stay at the right difficulty.'],
  credits: ['Made by Learning Adventures. Art, music and sound are made in code.'],
};
