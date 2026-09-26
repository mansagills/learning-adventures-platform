// characterCards.ts
// Pure TypeScript module — NO Phaser dependency.
//
// Who each campus character IS, for the pop-up card that appears when you
// talk to them. The NPC definitions in campusLayout.ts only carry an id, a
// name and dialogue lines, which is enough for a speech bubble but not enough
// to introduce a character to a player meeting them for the first time.
//
// Card copy is drawn from the Spark Chronicles bible (docs/lore/ in the
// platform repo — SEASON_1_ARC.md, factions/the-academy.md and
// characters/jaylen.md) so the demo and the story stay in step. Keep blurbs
// to one or two short sentences: this is a card a 3rd-grader reads mid-walk,
// not a codex entry.

export interface CharacterCard {
  /** Short role line under the name, e.g. "Campus Guide". */
  title: string;
  /** Where they are usually found — orients the player on the map. */
  location: string;
  /** One or two sentences, in-world, present tense. */
  blurb: string;
  /**
   * Card accent colour. Matches the subject wing they host so the cards read
   * as a set: math violet, science cyan, english amber, commons emerald,
   * campus-wide sky blue.
   */
  accent: string;
  /** Emoji badge shown beside the title. */
  badge: string;
}

/** Cards for the named campus hosts — the characters with a story role. */
export const CHARACTER_CARDS: Record<string, CharacterCard> = {
  npc_jaylen_guide: {
    title: 'Campus Guide · The First Spark',
    location: 'Main Hub plaza',
    blurb:
      "The first student whose Spark ever woke up at the Academy. He stayed on to help new students recognise theirs, and he still says it every time: every Spark's worth following.",
    accent: '#38bdf8',
    badge: '✨',
  },
  npc_professor_ivy: {
    title: 'Quest Guide',
    location: 'Main Hub plaza',
    blurb:
      'Keeps the day\'s quests moving and always knows who you should talk to next. Ask her where to start and she will actually tell you.',
    accent: '#38bdf8',
    badge: '🧭',
  },
  npc_professor_numbers: {
    title: 'Head of Math Hall',
    location: 'Math Hall',
    blurb:
      'Runs the Math Hall simulators and hands out the Racing Licence. She believes a number that will not behave is the most interesting thing in the room.',
    accent: '#a78bfa',
    badge: '📐',
  },
  npc_dr_spark: {
    title: 'Discovery Lab Lead',
    location: 'Discovery Lab',
    blurb:
      'Builds the experiments in the north wing and cheerfully sets most of them off twice. Nothing in the lab is finished until somebody has asked why.',
    accent: '#22d3ee',
    badge: '🔬',
  },
  npc_story_sage: {
    title: 'Keeper of Story Grove',
    location: 'Story Grove',
    blurb:
      'Looks after every story shelved in the east wing, and remembers them all. Bring one back and they will want to hear how you would have told it.',
    accent: '#fbbf24',
    badge: '📖',
  },
  npc_commons_host: {
    title: 'Commons Host',
    location: 'The Commons',
    blurb:
      'Keeps the Commons running — the shop counter, the cafeteria games, and the noticeboard nobody else remembers to update.',
    accent: '#34d399',
    badge: '🍎',
  },
};

/**
 * Fallback card for the simulated students patrolling the paths. They are
 * ambient "other players" rather than story characters, so they get an
 * identity without a written-up biography.
 */
export const STUDENT_CARD: CharacterCard = {
  title: 'Academy Student',
  location: 'Around campus',
  blurb: 'Another student exploring campus today.',
  accent: '#94a3b8',
  badge: '🎒',
};

/** The card for an NPC id, falling back to the generic student card. */
export function cardFor(npcId: string): CharacterCard {
  return CHARACTER_CARDS[npcId] ?? STUDENT_CARD;
}
