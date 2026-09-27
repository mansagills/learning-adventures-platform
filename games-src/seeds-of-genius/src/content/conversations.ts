import type { Conversation, DialogueNode } from '../quests/types';

/**
 * Every conversation in the game. Carver's lines are written for this story
 * and are not historical quotations (the About panel says so too). The
 * townspeople are fictional.
 */

function convo(id: string, title: string, nodes: DialogueNode[]): Conversation {
  const map: Record<string, DialogueNode> = {};
  nodes.forEach((n) => (map[n.id] = n));
  return { id, title, start: nodes[0].id, nodes: map };
}

const CH = 'practice';

export const CONVERSATIONS: Record<string, Conversation> = Object.fromEntries(
  [
    // ------------------------------------------------ practice: Carver assigns
    convo('carver_practice_opening', 'Carver: A small first task', [
      { id: 'a1', speaker: 'carver', expression: 'smile', text: "Well, hello there! Welcome to Sweetgum Hollow. I'm George Washington Carver.", next: 'a2' },
      {
        id: 'a2',
        speaker: 'carver',
        expression: 'neutral',
        text: "I'm a scientist. I spent my life studying plants and soil, and teaching at Tuskegee Institute in Alabama.",
        next: 'a3',
      },
      {
        id: 'a3',
        speaker: 'carver',
        expression: 'curious',
        text: "When I was a boy, neighbors called me the 'plant doctor', because I helped sick plants grow strong again.",
        next: 'a4',
      },
      {
        id: 'a4',
        speaker: 'carver',
        expression: 'smile',
        text: 'Every good investigation starts with a small task. Will you help me with one?',
        choices: [
          { text: "Yes, I'd love to help!", next: 'a6' },
          { text: 'What kind of help?', next: 'a5' },
        ],
      },
      {
        id: 'a5',
        speaker: 'carver',
        expression: 'thinking',
        text: "I ordered a packet of seeds for my windowsill, but I haven't picked it up yet. Mae Porter is keeping it at the Seed & Mail, east of the town square.",
        choices: [{ text: "I'll go and get it!", next: 'a6' }],
      },
      {
        id: 'a6',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'acceptQuest', chapterId: CH }],
        text: "Wonderful! Mae's shop has a green roof and a striped stall out front. Your journal will remember where to go.",
        next: 'a7',
      },
      {
        id: 'a7',
        speaker: 'carver',
        expression: 'curious',
        text: 'And while you carry the packet, take a good look at it. A scientist notices things.',
        next: null,
      },
    ]),

    convo('carver_practice_waiting', 'Carver: Where to find Mae', [
      {
        id: 'w1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Mae Porter is at the Seed & Mail, east of the town square. Look for the green roof and the striped stall.',
        choices: [
          { text: "I'm on my way.", next: null },
          { text: 'Why do you need the seeds?', next: 'w2' },
        ],
      },
      {
        id: 'w2',
        speaker: 'carver',
        expression: 'curious',
        text: "I don't even know what kind they are yet! That's half the fun. We'll look closely and find out.",
        next: null,
      },
    ]),

    // ------------------------------------------------ practice: Mae helps
    convo('mae_practice_give', 'Mae: The seed packet', [
      { id: 'm1', speaker: 'mae', expression: 'smile', text: "Well now, a new face! You must be the explorer Professor Carver told me about.", next: 'm2' },
      {
        id: 'm2',
        speaker: 'mae',
        expression: 'neutral',
        text: 'He sent for a packet of seeds weeks ago. It came up from a farm down south, but the label never says what kind they are.',
        choices: [
          { text: 'Can I take them to him?', next: 'm4' },
          { text: 'What is the Seed & Mail?', next: 'm3' },
        ],
      },
      {
        id: 'm3',
        speaker: 'mae',
        expression: 'smile',
        text: 'Seeds, letters and parcels! Farmers swap seeds here, and folks send letters to family far away. Everything that grows or goes passes through my stall.',
        choices: [{ text: 'Can I take the seeds to Carver?', next: 'm4' }],
      },
      {
        id: 'm4',
        speaker: 'mae',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'seed_packet', from: 'mae' },
          { type: 'completeStep', chapterId: CH, stepId: 'get_seeds' },
        ],
        text: 'Of course. Here you are: one packet of mystery seeds. Handle it gently!',
        next: 'm5',
      },
      {
        id: 'm5',
        speaker: 'mae',
        expression: 'neutral',
        text: 'Have a good look inside before you hand it over. Open your bag (press I, or tap Bag) and choose the packet.',
        next: null,
      },
    ]),

    convo('mae_practice_after', 'Mae: After the delivery', [
      {
        id: 'x1',
        speaker: 'mae',
        expression: 'smile',
        text: "Did the Professor like his seeds? Whatever they are, he'll find out. He always does.",
        next: null,
      },
    ]),

    // ------------------------------------------------ practice: Carver debriefs
    convo('carver_practice_closing', 'Carver: What did you notice?', [
      { id: 'c1', speaker: 'carver', expression: 'smile', text: 'You found Mae, and you brought the packet! Thank you, friend.', next: 'c2' },
      {
        id: 'c2',
        speaker: 'carver',
        expression: 'curious',
        text: 'Before we plant them, tell me what you noticed. Scientists start with observations.',
        next: 'q',
      },
      {
        id: 'q',
        kind: 'question',
        speaker: 'carver',
        expression: 'curious',
        objectiveId: 'observe',
        text: 'Which of these is an observation: something you can see about the seeds right now?',
        options: [
          {
            id: 'future',
            text: 'They will grow into giant sunflowers.',
            correct: false,
            misconception: 'prediction-as-observation',
            feedback: "That's a guess about the future. It might even turn out right! But we can't see it yet.",
          },
          {
            id: 'obs',
            text: 'They are small, flat and tan, with a pointed tip.',
            correct: true,
            feedback: "Yes! That's an observation. You used your eyes, and anyone looking at the seeds could check it.",
          },
          {
            id: 'opinion',
            text: 'They are the best seeds in town.',
            correct: false,
            misconception: 'opinion-as-observation',
            feedback: "That's an opinion. Mae might disagree! An observation is something anyone can check.",
          },
        ],
        hints: [
          'Here is a clue: an observation is something you can see, hear, touch or measure right now.',
          'Two of those answers are about the future or about what someone thinks. Which one only describes how the seeds look?',
          "Let's check together: 'small, flat and tan'. Can we see that right now? Yes! So that is the observation.",
        ],
        next: 'c3',
      },
      {
        id: 'c3',
        speaker: 'carver',
        expression: 'proud',
        effects: [{ type: 'useItem', itemId: 'seed_packet', usedIn: 'Given to Carver to plant' }],
        text: 'Observations are the seeds of science: small, true things we can build on.',
        textIfRetried:
          'You checked your thinking and tried again. Scientists do that all the time! Observations are the seeds of science: small, true things we can build on.',
        next: 'c4',
      },
      {
        id: 'c4',
        speaker: 'carver',
        expression: 'smile',
        text: "Let's plant a few in a little pot for your windowsill. Whatever they turn out to be, we'll find out by watching.",
        next: 'c5',
      },
      {
        id: 'c5',
        speaker: 'carver',
        expression: 'neutral',
        effects: [{ type: 'completeChapter', chapterId: CH }],
        text: "Rest when you need to, and explore the town. Soon I'll need your help with a real puzzle in the garden.",
        next: null,
      },
    ]),

    convo('carver_practice_after', 'Carver: Patient watchers', [
      {
        id: 'r1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Your seed pot is on the windowsill in your cottage. Check on it now and then. Scientists are patient watchers.',
        choices: [
          { text: 'What will we do next?', next: 'r2' },
          { text: 'See you soon!', next: null },
        ],
      },
      {
        id: 'r2',
        speaker: 'carver',
        expression: 'curious',
        text: "The community garden has been acting strangely. When you're ready, we'll investigate what it's telling us.",
        next: null,
      },
    ]),

    convo('carver_ambient', 'Carver: Hello again', [
      { id: 'z1', speaker: 'carver', expression: 'smile', text: 'Hello again, friend. What have you noticed today?', next: null },
    ]),

    // ------------------------------------------------ small talk (optional)
    convo('mae_ambient', 'Mae: Seeds and letters', [
      {
        id: 'y1',
        speaker: 'mae',
        expression: 'smile',
        text: 'Seeds, letters and parcels. If it grows or it goes, it passes through here!',
        next: null,
      },
    ]),
    convo('mae_ambient_night', 'Mae: Late letters', [
      {
        id: 'y2',
        speaker: 'mae',
        expression: 'smile',
        text: 'Evening! I keep my lantern lit so late letters can still find their way.',
        next: null,
      },
    ]),
    convo('jojo_ambient', 'Jojo: Counting ladybugs', [
      {
        id: 'j1',
        speaker: 'jojo',
        expression: 'smile',
        text: "I'm counting ladybugs! I've got seven. Or eight. They keep moving!",
        choices: [
          { text: 'Try counting their spots, too.', next: 'j2' },
          { text: 'Good luck!', next: null },
        ],
      },
      {
        id: 'j2',
        speaker: 'jojo',
        expression: 'curious',
        text: "Ooh, this one has seven spots and that one has two. They're not all the same! I'm writing that down.",
        next: null,
      },
    ]),
    convo('odell_ambient', 'Mr. Odell: Lighting the lamps', [
      {
        id: 'o1',
        speaker: 'odell',
        expression: 'smile',
        text: 'Evening, explorer. I light the lamps so everyone can find their way home.',
        choices: [
          { text: 'What do you see at night?', next: 'o2' },
          { text: 'Good night!', next: null },
        ],
      },
      {
        id: 'o2',
        speaker: 'odell',
        expression: 'curious',
        text: 'Moths around the lamps, frogs by the pond, and stars. Each star is a sun, very far away.',
        next: null,
      },
    ]),
  ].map((c) => [c.id, c]),
);

/** One-off lines for objects and places (not replayed in the journal). */
export const PLACE_LINES: Record<string, string> = {
  school_door: 'The schoolhouse is closed for now. It opens in Chapter 2.',
  workshop_door: 'The workshop is locked. The craftsperson will open it in Chapter 4.',
  greenhouse_door: "Carver's greenhouse is full of seedlings and jars. He'll invite you in for later experiments.",
  shop_door: 'The Seed & Mail smells like paper and fresh soil. Mae is working at the stall out front.',
  shelf: 'An empty shelf. Things you earn on your adventures will go here.',
  windowsill_empty: 'A sunny windowsill. It would be a good spot for a plant.',
  windowsill_planted:
    'Your seed pot from Carver. The soil is damp, and nothing has sprouted yet. Keep watching; scientists are patient.',
};
