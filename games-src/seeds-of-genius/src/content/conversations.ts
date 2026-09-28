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

    // ================================================ Chapter 1: A Seed Is Planted
    convo('carver_ch1_opening', 'Carver: What is the garden telling us?', [
      { id: 'o1', speaker: 'carver', expression: 'curious', text: "Friend, I'm glad you're here. Something is going on in the community garden.", next: 'o2' },
      {
        id: 'o2',
        speaker: 'carver',
        expression: 'thinking',
        text: 'Some bean leaves have holes. The soil by the fence stays dark. A small creature or two may be involved. What is the garden telling us?',
        next: 'o3',
      },
      {
        id: 'o3',
        speaker: 'carver',
        expression: 'smile',
        text: 'When I was a boy, I spent every hour I could in the woods, just looking. Would you like to see a memory from those days?',
        choices: [
          { text: 'Yes, show me the memory.', next: 'o4', effects: [{ type: 'showMemory', memoryId: 'childhood' }] },
          { text: 'Maybe later.', next: 'o4' },
        ],
      },
      {
        id: 'o4',
        speaker: 'carver',
        expression: 'neutral',
        text: 'To investigate, we need two things: a way to look closely, and a way to remember what we see.',
        next: 'o5',
      },
      {
        id: 'o5',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'acceptQuest', chapterId: 'ch1' }],
        text: 'Hattie Bell, our gardener, keeps a field notebook for me. Young Theo, over by the pond, always carries a magnifying lens. Ask them both, then look closely at the garden.',
        next: 'o6',
      },
      {
        id: 'o6',
        speaker: 'carver',
        expression: 'curious',
        text: "Write down only what you can really see. We'll sort out the guessing afterward.",
        next: null,
      },
    ]),

    convo('carver_ch1_waiting', 'Carver: How is the investigation going?', [
      {
        id: 'w1',
        speaker: 'carver',
        expression: 'curious',
        text: '{carverNudge}',
        choices: [
          { text: "I'm on it!", next: null },
          { text: 'Can I see your memory again?', next: 'w2', effects: [{ type: 'showMemory', memoryId: 'childhood' }] },
        ],
      },
      { id: 'w2', speaker: 'carver', expression: 'smile', text: 'Those woods taught me to be patient. Plants tell their story slowly.', next: null },
    ]),

    convo('carver_ch1_closing', 'Carver: Reading your notebook', [
      { id: 'c1', speaker: 'carver', expression: 'smile', text: 'Welcome back, investigator! May I see your notebook?', next: 'c2' },
      {
        id: 'c2',
        speaker: 'carver',
        expression: 'curious',
        text: 'You wrote: "{obsFirst}" That is a real observation. Anyone could kneel down and check it.',
        next: 'c3',
      },
      { id: 'c3', speaker: 'carver', expression: 'thinking', text: '{sortReflection}', next: 'q' },
      {
        id: 'q',
        kind: 'question',
        speaker: 'carver',
        expression: 'curious',
        objectiveId: 'observe',
        text: 'One more question. Why is "The soil by the fence is dark and damp" an observation, while "A rabbit must have chewed the bean leaves" is a guess?',
        options: [
          {
            id: 'rabbits',
            text: "Because rabbits don't like beans.",
            correct: false,
            misconception: 'new-guess-as-evidence',
            feedback: "Hmm, that's a new guess about rabbits! The question is about what we can check right now.",
          },
          {
            id: 'evidence',
            text: 'We can see and touch the soil, but nobody saw a rabbit.',
            correct: true,
            feedback: 'Exactly. The soil is right in front of us. The rabbit is an idea about what might have happened.',
          },
          {
            id: 'length',
            text: 'Because the soil sentence is shorter.',
            correct: false,
            misconception: 'surface-feature',
            feedback: "Length isn't the clue. Think about which one we can check with our own eyes.",
          },
        ],
        hints: [
          'Here is a clue: think about what is really in the garden right now that you can look at.',
          'Did anyone actually see a rabbit? Pick the answer about what we can and cannot see.',
          'Worked example: the soil is there to touch, but nobody saw a rabbit. So "We can see and touch the soil, but nobody saw a rabbit" is the answer.',
        ],
        next: 'c4',
      },
      {
        id: 'c4',
        speaker: 'carver',
        expression: 'proud',
        text: 'When I was young, I learned about plants by watching them, day after day. Today you did the same thing.',
        textIfRetried:
          'You checked your thinking and changed your answer. Good scientists do that. When I was young, I learned about plants by watching them, day after day. Today you did the same thing.',
        next: 'c5',
      },
      {
        id: 'c5',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'grantItem', itemId: 'nature_card', from: 'carver' }],
        text: 'This is for you: a Nature Observation Card. Take it outside in your own neighborhood and find three things you can see, hear or touch.',
        next: 'c6',
      },
      {
        id: 'c6',
        speaker: 'carver',
        expression: 'thinking',
        text: "Guesses aren't bad, you know. A good guess is where the next experiment begins. But first, we observe.",
        next: 'c7',
      },
      {
        id: 'c7',
        speaker: 'carver',
        expression: 'neutral',
        effects: [{ type: 'completeChapter', chapterId: 'ch1' }],
        text: 'Next time, I will tell you how I kept on learning, even when the nearby school would not let me in.',
        next: null,
      },
    ]),

    convo('carver_ch1_after', 'Carver: After the garden', [
      {
        id: 'a1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Your Nature Observation Card is in your bag. The garden is always open if you want to look again.',
        choices: [
          { text: 'Can I see your memory again?', next: 'a2', effects: [{ type: 'showMemory', memoryId: 'childhood' }] },
          { text: 'How do I look at the garden again?', next: 'a3' },
          { text: 'See you soon!', next: null },
        ],
      },
      { id: 'a2', speaker: 'carver', expression: 'smile', text: 'Some of my best teachers were trees.', next: null },
      {
        id: 'a3',
        speaker: 'carver',
        expression: 'neutral',
        text: "Walk up to any spot in the garden and look with Theo's lens. The potting bench by the gate has the card game, if you'd like to sort again.",
        next: null,
      },
    ]),

    convo('hattie_ch1_give', 'Hattie: The field notebook', [
      { id: 'h1', speaker: 'hattie', expression: 'smile', text: "Afternoon! You must be Carver's new helper. I'm Hattie Bell. I look after this garden.", next: 'h2' },
      {
        id: 'h2',
        speaker: 'hattie',
        expression: 'thinking',
        text: "Something's been nibbling my beans, and the soil by the east fence never dries out. I keep meaning to write it all down.",
        choices: [
          { text: 'What should I look for?', next: 'h3' },
          { text: 'Could I borrow the field notebook?', next: 'h4' },
        ],
      },
      {
        id: 'h3',
        speaker: 'hattie',
        expression: 'neutral',
        text: 'Look at the undersides of the leaves, and kneel down by the soil. The small things tell the big story.',
        next: 'h4',
      },
      {
        id: 'h4',
        speaker: 'hattie',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'field_notebook', from: 'hattie' },
          { type: 'completeStep', chapterId: 'ch1', stepId: 'get_notebook' },
        ],
        text: 'Here is the field notebook. The first page shows how to write an observation: what you see, how many, what color, what size.',
        next: 'h5',
      },
      {
        id: 'h5',
        speaker: 'hattie',
        expression: 'neutral',
        text: "Sparkles will mark the spots I'm puzzling over, once you have Theo's lens too. There's a sorting game on my potting bench for afterward.",
        next: null,
      },
    ]),
    convo('hattie_ch1_after', 'Hattie: Count it, measure it', [
      { id: 'ha', speaker: 'hattie', expression: 'smile', text: 'How is the notebook? Remember: count it, measure it, and describe its color.', next: null },
    ]),
    convo('hattie_ambient', 'Hattie: Garden rows', [
      { id: 'hb', speaker: 'hattie', expression: 'smile', text: "Beans on the left, lettuce and carrots in between. A garden is a lot of little neighbors sharing one bed.", next: null },
    ]),

    convo('theo_ch1_give', 'Theo: The magnifying lens', [
      { id: 't1', speaker: 'theo', expression: 'curious', text: 'Shh! There is a ladybug on my sleeve. Look! What do you notice about it?', next: 'tq' },
      {
        id: 'tq',
        kind: 'question',
        speaker: 'theo',
        expression: 'curious',
        objectiveId: 'observe',
        text: 'Which one is something you can notice, not a guess?',
        options: [
          {
            id: 'family',
            text: 'It is looking for its family.',
            correct: false,
            misconception: 'story-as-observation',
            feedback: "Maybe! But we can't see what it's thinking. That part is a guess.",
          },
          {
            id: 'fastest',
            text: 'It is the fastest bug in town.',
            correct: false,
            misconception: 'opinion-as-observation',
            feedback: "We'd need a race to know that! Right now it's a guess.",
          },
          { id: 'spots', text: 'It is red with seven black spots.', correct: true, feedback: 'Yes! I counted seven too. Spots are something you can check.' },
        ],
        hints: [
          'Here is a clue: look at its color, and count its spots.',
          'One answer describes the ladybug\'s body. The others are about feelings or races.',
          'Worked example: "red with seven black spots" is something your eyes can check, so that one is the observation.',
        ],
        next: 't2',
      },
      {
        id: 't2',
        speaker: 'theo',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'magnifying_lens', from: 'theo' },
          { type: 'completeStep', chapterId: 'ch1', stepId: 'get_lens' },
        ],
        text: "You'd make a good naturalist. Here, borrow my magnifying lens. It makes tiny things look big!",
        next: 't3',
      },
      {
        id: 't3',
        speaker: 'theo',
        expression: 'neutral',
        text: 'Hold it close and look for the small details: edges, tiny hairs, specks of pollen.',
        next: null,
      },
    ]),
    convo('theo_ch1_after', 'Theo: Tiny things', [
      { id: 'tb', speaker: 'theo', expression: 'smile', text: "Found anything tiny yet? Once I saw a beetle whose wings shimmered green and purple!", next: null },
    ]),
    convo('theo_ambient', 'Theo: Pond skaters', [
      { id: 'tc', speaker: 'theo', expression: 'curious', text: "I'm watching the pond skaters. They stand right on top of the water!", next: null },
    ]),

    // ================================================ Chapter 2: Science Against the Odds
    convo('carver_ch2_opening', 'Carver: The road to school', [
      {
        id: 'o1',
        speaker: 'carver',
        expression: 'neutral',
        text: 'Last time I told you I kept on learning, even when a school would not let me in. Today I would like you to see that journey for yourself.',
        next: 'o2',
      },
      {
        id: 'o2',
        speaker: 'carver',
        expression: 'thinking',
        text: 'Ms. Nelson has opened the schoolhouse. Inside are storybook displays about my school years, but they are all out of order.',
        next: 'o3',
      },
      {
        id: 'o3',
        speaker: 'carver',
        expression: 'neutral',
        sensitive: { skipTo: 'o5' },
        text: 'Some parts are hard. When I was a boy, the school in Diamond, Missouri, did not allow Black children. That rule was unfair. It was racism, and it was not my fault.',
        choices: [
          { text: "That's not fair!", next: 'o4a' },
          { text: 'What did you do?', next: 'o4b' },
        ],
      },
      {
        id: 'o4a',
        speaker: 'carver',
        expression: 'thinking',
        text: "You're right, it was not fair. I felt sad about it, and I still wanted to learn. So I kept looking for a way.",
        next: 'o5',
      },
      {
        id: 'o4b',
        speaker: 'carver',
        expression: 'smile',
        text: 'I kept looking for a school that would teach me, even when it meant leaving home. And people helped me along the way.',
        next: 'o5',
      },
      {
        id: 'o5',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'acceptQuest', chapterId: 'ch2' }],
        text: 'Ms. Nelson, the teacher, has school records with dates in them. And Ada, the young artist in the town square, has something to show you about art.',
        next: 'o6',
      },
      {
        id: 'o6',
        speaker: 'carver',
        expression: 'curious',
        text: 'Put my journey in order. Then tell me: what stood in my way, and who helped me?',
        next: null,
      },
    ]),

    convo('carver_ch2_waiting', 'Carver: How is the timeline coming?', [
      {
        id: 'w1',
        speaker: 'carver',
        expression: 'curious',
        text: '{carverNudge2}',
        choices: [
          { text: "I'm on it!", next: null },
          { text: 'Why was the school rule unfair?', next: 'w2' },
        ],
      },
      {
        id: 'w2',
        speaker: 'carver',
        expression: 'neutral',
        sensitive: { skipTo: null },
        text: 'Because it judged children by the color of their skin, instead of letting every child learn. Rules like that were wrong, even when they were the law.',
        next: null,
      },
    ]),

    convo('carver_ch2_closing', 'Carver: Looking back at the road', [
      { id: 'c1', speaker: 'carver', expression: 'smile', text: 'You put my journey in order. Seeing it all laid out like that... it was a long road.', next: 'c2' },
      {
        id: 'c2',
        speaker: 'carver',
        expression: 'thinking',
        sensitive: { skipTo: 'c3' },
        text: 'You named a barrier: {barrierText} Doors were closed to me because I was Black. That was wrong, and it is good that you can see it clearly.',
        next: 'c3',
      },
      { id: 'c3', speaker: 'carver', expression: 'proud', text: 'And you named someone who helped: {supportText} {supportThanks}', next: 'q' },
      {
        id: 'q',
        kind: 'question',
        speaker: 'carver',
        expression: 'curious',
        objectiveId: 'journey',
        text: 'Here is my question for you. Why do you think learning mattered so much for my science?',
        options: [
          {
            id: 'rest',
            text: 'So you would never have to work hard again.',
            correct: false,
            misconception: 'learning-as-escape-from-work',
            feedback: 'Ha! I worked hard my whole life. Learning did not replace work. It made my work more useful.',
          },
          {
            id: 'tools',
            text: 'Learning gave you tools to help farmers and to share what you found.',
            correct: true,
            feedback: 'Yes. Reading, art and botany all became tools I could use to help people grow better crops.',
          },
          {
            id: 'easy',
            text: 'Because school was easy for you.',
            correct: false,
            misconception: 'school-was-easy',
            feedback: 'It was not easy at all! Think about what learning let me do for other people.',
          },
        ],
        hints: [
          'Here is a clue: think about who Carver helped with his science.',
          'Carver worked hard his whole life, and school was not easy. Which answer is about helping people?',
          'Worked example: learning gave Carver skills he could use to help farmers. So "Learning gave you tools to help farmers and to share what you found" is the answer.',
        ],
        next: 'c4',
      },
      {
        id: 'c4',
        speaker: 'carver',
        expression: 'smile',
        text: 'Everything I learned became something I could give back. That is what my helpers hoped for, too.',
        textIfRetried: 'You thought it through and changed your answer. Good. Everything I learned became something I could give back. That is what my helpers hoped for, too.',
        next: 'c5',
      },
      {
        id: 'c5',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'grantItem', itemId: 'journey_card', from: 'carver' }],
        text: 'This is for you: a Journey Card. Draw a timeline of something you have learned, and write down one person who helped you.',
        next: 'c6',
      },
      {
        id: 'c6',
        speaker: 'carver',
        expression: 'neutral',
        effects: [{ type: 'completeChapter', chapterId: 'ch2' }],
        text: 'Next time, we will put that learning to work. Some of the farmland around here is tired, and the soil needs a scientist.',
        next: null,
      },
    ]),

    convo('carver_ch2_after', 'Carver: Helpers along the way', [
      {
        id: 'a1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Your Journey Card is in your bag. The schoolhouse displays are always open if you want to visit them again.',
        choices: [
          { text: 'Who helped you the most?', next: 'a2' },
          { text: 'See you soon!', next: null },
        ],
      },
      {
        id: 'a2',
        speaker: 'carver',
        expression: 'thinking',
        text: 'So many people. A family who taught me to read, a nurse who gave me a home, an art teacher who saw what I could do. No one travels that road alone.',
        next: null,
      },
    ]),

    convo('ruth_ch2_give', 'Ms. Nelson: The school records', [
      {
        id: 'r1',
        speaker: 'ruth',
        expression: 'smile',
        text: "Welcome! I'm Ms. Nelson, the teacher here. Carver says you are putting his school years back in order.",
        next: 'r2',
      },
      {
        id: 'r2',
        speaker: 'ruth',
        expression: 'neutral',
        text: 'History detectives use records. I have a folder of copies about Carver\'s schooling, sent to us by a museum.',
        choices: [
          { text: 'What is a record?', next: 'r3' },
          { text: 'Can I see the folder?', next: 'r4' },
        ],
      },
      {
        id: 'r3',
        speaker: 'ruth',
        expression: 'thinking',
        text: 'A record is something written down at the time, like a diploma or a letter. It helps us know when things happened, instead of guessing.',
        next: 'r4',
      },
      {
        id: 'r4',
        speaker: 'ruth',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'school_record', from: 'ruth' },
          { type: 'completeStep', chapterId: 'ch2', stepId: 'get_record' },
        ],
        text: 'Here is the folder. Some records have dates. Two moments have no dates at all, so the displays will have to help you.',
        next: 'r5',
      },
      {
        id: 'r5',
        speaker: 'ruth',
        expression: 'neutral',
        text: 'The schoolhouse door is open now. Visit every display, then build the timeline on my chalkboard.',
        next: null,
      },
    ]),
    convo('ruth_ch2_after', 'Ms. Nelson: Each display', [
      { id: 'ra', speaker: 'ruth', expression: 'smile', text: 'Take your time inside. Every display is a real moment from Carver\'s life.', next: null },
    ]),
    convo('ruth_ambient', 'Ms. Nelson: A seat for everyone', [
      { id: 'rb', speaker: 'ruth', expression: 'smile', text: 'Every child deserves a seat in a classroom. That is why I teach.', next: null },
    ]),

    convo('ada_ch2_give', 'Ada: The botanical sketch', [
      {
        id: 'd1',
        speaker: 'ada',
        expression: 'curious',
        text: 'Oh, hi! Sorry, I was drawing this leaf. Did you know Carver was a painter before he was a scientist?',
        choices: [
          { text: 'Really? Tell me more.', next: 'd2' },
          { text: 'Why are you drawing a leaf?', next: 'd2b' },
        ],
      },
      {
        id: 'd2',
        speaker: 'ada',
        expression: 'smile',
        text: 'At Simpson College in Iowa, he studied art. His teacher, Etta Budd, saw how well he painted plants and encouraged him to study botany, the science of plants.',
        next: 'd3',
      },
      {
        id: 'd2b',
        speaker: 'ada',
        expression: 'neutral',
        text: 'To draw something, you have to look really closely. Carver painted plants, too! His art teacher, Etta Budd, noticed and encouraged him to study plants in college.',
        next: 'd3',
      },
      {
        id: 'd3',
        speaker: 'ada',
        expression: 'thinking',
        text: 'My art teacher encouraged me when I almost gave up. Sometimes one person believing in you changes everything.',
        next: 'd4',
      },
      {
        id: 'd4',
        speaker: 'ada',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'botanical_sketch', from: 'ada' },
          { type: 'completeStep', chapterId: 'ch2', stepId: 'get_sketch' },
        ],
        text: 'Here, take my leaf sketch. It is a clue for your timeline: Carver studied art first, and plants after.',
        next: 'd5',
      },
      { id: 'd5', speaker: 'ada', expression: 'smile', text: 'Good luck! Tell Carver I said hi.', next: null },
    ]),
    convo('ada_ch2_after', 'Ada: Tricky shapes', [
      { id: 'da', speaker: 'ada', expression: 'smile', text: 'I am drawing the pond reeds next. Their shapes are trickier than they look!', next: null },
    ]),
    convo('ada_ambient', 'Ada: Sketching', [
      { id: 'db', speaker: 'ada', expression: 'curious', text: 'I sketch something new every day. Today it is the well. Look at all those stones!', next: null },
    ]),

    // ------------------------------------------------ Chapter 3: The Soil Speaks
    convo('carver_ch3_opening', 'Carver: The tired field', [
      {
        id: 'o1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Have you met Mr. Hill? He farms Hilltop Farm, just north of the road. His cotton in the west plot gets smaller every year, and he does not know why.',
        next: 'o2',
      },
      {
        id: 'o2',
        speaker: 'carver',
        expression: 'thinking',
        text: 'When a crop keeps doing poorly, a scientist asks the soil. Soil is alive, and it tells you a lot if you look closely.',
        choices: [
          { text: 'How can soil be alive?', next: 'o3' },
          { text: 'What should I do?', next: 'o4' },
        ],
      },
      {
        id: 'o3',
        speaker: 'carver',
        expression: 'curious',
        text: 'A spoonful of healthy soil holds roots, worms, bits of old leaves and tiny living things too small to see. Together they feed the plants.',
        next: 'o4',
      },
      {
        id: 'o4',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'acceptQuest', chapterId: 'ch3' }],
        text: 'Mr. Hill has soil samples and a record of what he planted. Mae at the Seed & Mail keeps crop cards for the crops that grow around here.',
        next: 'o5',
      },
      {
        id: 'o5',
        speaker: 'carver',
        expression: 'curious',
        text: 'Compare his two plots, test some planting plans for the next four seasons, and bring me the plan you think is best. Then tell me why it works.',
        next: null,
      },
    ]),

    convo('carver_ch3_waiting', 'Carver: How is the soil lab going?', [
      {
        id: 'w1',
        speaker: 'carver',
        expression: 'curious',
        text: '{carverNudge3}',
        choices: [
          { text: "I'm on it!", next: null },
          { text: 'What is nitrogen?', next: 'w2' },
        ],
      },
      {
        id: 'w2',
        speaker: 'carver',
        expression: 'thinking',
        text: 'Nitrogen is a plant food. Plants need it to grow leaves and stems. Soil can run low on it, like a pantry running out of flour.',
        next: null,
      },
    ]),

    convo('carver_ch3_closing', 'Carver: Your plan for the west plot', [
      { id: 'c1', speaker: 'carver', expression: 'smile', text: 'Let me see your plan: {planText}.', next: 'c2' },
      { id: 'c2', speaker: 'carver', expression: 'thinking', text: '{planCompare}', next: 'c3' },
      { id: 'c3', speaker: 'carver', expression: 'proud', text: '{cottonCompare}', next: 'q' },
      {
        id: 'q',
        kind: 'question',
        speaker: 'carver',
        expression: 'curious',
        objectiveId: 'soil',
        text: 'Here is my question for you. What did the legumes in your plan do for the soil?',
        options: [
          {
            id: 'fixall',
            text: 'They fixed all of the soil in one season.',
            correct: false,
            misconception: 'instant-restoration',
            feedback: 'Not so fast! Soil gets better slowly. Look at your soil bar: each legume season added only a little.',
          },
          {
            id: 'slow',
            text: 'They put back a little nitrogen each season, so the soil slowly got healthier.',
            correct: true,
            feedback: 'Yes. Legumes add a little at a time. Taking turns, season after season, is what helps tired soil.',
          },
          {
            id: 'pests',
            text: 'They scared the pests away forever.',
            correct: false,
            misconception: 'legumes-stop-pests',
            feedback: 'Changing crops can slow pests down, but nothing stops them forever. Think about what legume roots do.',
          },
        ],
        hints: [
          'Here is a clue: think about the bumps on the legume roots in the east plot.',
          'Those bumps help put nitrogen into the soil. Did the soil bar jump all at once, or rise a little each season?',
          'Worked example: each legume season added a few soil points, not all at once. So "They put back a little nitrogen each season" is the answer.',
        ],
        next: 'c4',
      },
      {
        id: 'c4',
        speaker: 'carver',
        expression: 'smile',
        text: 'Right. And rain and weather still matter. A good plan makes good harvests more likely. It cannot promise them.',
        textIfRetried: 'You changed your answer after thinking it through. That is good science. Rain and weather still matter, too: a good plan makes good harvests more likely, but it cannot promise them.',
        next: 'c5',
      },
      {
        id: 'c5',
        speaker: 'carver',
        expression: 'thinking',
        text: 'I worked on this very problem at Tuskegee, with farmers whose fields had grown cotton for years. Would you like to see a memory?',
        choices: [
          { text: 'Yes, show me the memory.', next: 'c6', effects: [{ type: 'showMemory', memoryId: 'tuskegee_soil' }] },
          { text: 'Maybe later.', next: 'c6' },
        ],
      },
      {
        id: 'c6',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'grantItem', itemId: 'rotation_card', from: 'carver' }],
        text: 'This is for you: a Crop-Rotation Planner. Plan four seasons on paper, or try it with cups of soil and bean seeds, with a grown-up.',
        next: 'c7',
      },
      {
        id: 'c7',
        speaker: 'carver',
        expression: 'curious',
        effects: [{ type: 'completeChapter', chapterId: 'ch3' }],
        text: 'Next time: peanuts. If farmers grow lots of them, they will need new ways to use them. That is a job for an inventor.',
        next: null,
      },
    ]),

    convo('carver_ch3_after', 'Carver: Patient soil', [
      {
        id: 'a1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Mr. Hill is trying your plan in the west plot. Soil takes time, so we will keep watching. Your planner is in your bag.',
        choices: [
          { text: 'Can I see the Tuskegee memory?', next: 'a2', effects: [{ type: 'showMemory', memoryId: 'tuskegee_soil' }] },
          { text: 'See you soon!', next: null },
        ],
      },
      { id: 'a2', speaker: 'carver', expression: 'smile', text: 'Every field is an experiment, if you keep good notes.', next: null },
    ]),

    convo('amos_ch3_give', 'Mr. Hill: The west plot', [
      {
        id: 'm1',
        speaker: 'amos',
        expression: 'smile',
        text: 'Howdy! Amos Hill. Carver sent you about my west plot? Glad to have the help.',
        next: 'm2',
      },
      {
        id: 'm2',
        speaker: 'amos',
        expression: 'thinking',
        text: 'I have planted cotton there five years running. Cotton sells, and my family needs the money. But every year the plants come up thinner.',
        choices: [
          { text: 'Why not plant something else?', next: 'm3a' },
          { text: 'What about your east plot?', next: 'm3b' },
        ],
      },
      {
        id: 'm3a',
        speaker: 'amos',
        expression: 'neutral',
        text: 'I still need some cotton. It pays for seed and shoes. But I would take turns with other crops, if the plan still grows cotton sometimes.',
        next: 'm4',
      },
      {
        id: 'm3b',
        speaker: 'amos',
        expression: 'curious',
        text: 'The east plot took turns: cotton, peanuts, cotton, cowpeas, cotton. My neighbor talked me into it. That cotton looks much better. Funny, right?',
        next: 'm4',
      },
      {
        id: 'm4',
        speaker: 'amos',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'soil_samples', from: 'amos' },
          { type: 'grantItem', itemId: 'crop_history', from: 'amos' },
          { type: 'completeStep', chapterId: 'ch3', stepId: 'get_samples' },
        ],
        text: 'Here are two jars of soil, one from each plot, and my ledger of what I planted. Look at them up close out in the fields.',
        next: 'm5',
      },
      {
        id: 'm5',
        speaker: 'amos',
        expression: 'neutral',
        text: 'The gate is open now. Just remember: any plan for the west plot has to grow some cotton.',
        next: null,
      },
    ]),
    convo('amos_ch3_after', 'Mr. Hill: Soil does not hurry', [
      { id: 'ma', speaker: 'amos', expression: 'smile', text: 'Take your time in the fields. Soil does not hurry, and neither do I.', next: null },
    ]),
    convo('amos_ambient', 'Mr. Hill: The scarecrow', [
      { id: 'mb', speaker: 'amos', expression: 'smile', text: 'Morning! The crows think my scarecrow is their friend. Maybe it is.', next: null },
    ]),

    convo('mae_ch3_give', 'Mae: Crop cards', [
      { id: 'e1', speaker: 'mae', expression: 'smile', text: "Carver said you'd come by! You need crop cards for Mr. Hill's fields?", next: 'e2' },
      {
        id: 'e2',
        speaker: 'mae',
        expression: 'neutral',
        text: 'Four crops grow well around here: cotton, peanuts, cowpeas and sweet potatoes.',
        choices: [
          { text: 'What is a legume?', next: 'e3a' },
          { text: 'Which one is best?', next: 'e3b' },
        ],
      },
      {
        id: 'e3a',
        speaker: 'mae',
        expression: 'curious',
        text: 'A legume is a plant in the bean family, like peanuts and cowpeas. Their roots have little bumps where helpful bacteria turn air into nitrogen, a plant food.',
        next: 'e4',
      },
      {
        id: 'e3b',
        speaker: 'mae',
        expression: 'thinking',
        text: 'No single crop is best! It depends on what the soil needs and what the farmer needs. Peanuts and cowpeas are legumes, and they help the soil. That is what planning is for.',
        next: 'e4',
      },
      {
        id: 'e4',
        speaker: 'mae',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'crop_cards', from: 'mae' },
          { type: 'completeStep', chapterId: 'ch3', stepId: 'get_cards' },
        ],
        text: 'Take the whole set. I drew a little root with bumps on the legume cards.',
        next: 'e5',
      },
      { id: 'e5', speaker: 'mae', expression: 'smile', text: 'Good luck! And tell Mr. Hill his seed order came in.', next: null },
    ]),
    convo('mae_ch3_after', 'Mae: Busy seed orders', [
      { id: 'ea', speaker: 'mae', expression: 'smile', text: 'Peanuts, cowpeas, sweet potatoes... I will be busy if your plan catches on!', next: null },
    ]),

    // ------------------------------------------------ Chapter 4: The Peanut Isn't Just a Peanut
    convo('carver_ch4_opening', 'Carver: A job for an inventor', [
      {
        id: 'o1',
        speaker: 'carver',
        expression: 'smile',
        text: 'The farmers who took turns planting are growing lots of peanuts, sweet potatoes and cowpeas now. That is good for the soil. But a crop only helps a family if they can use it or sell it.',
        next: 'o2',
      },
      {
        id: 'o2',
        speaker: 'carver',
        expression: 'thinking',
        text: 'So here is a job for an inventor: find a useful new purpose for one of these crops.',
        choices: [
          { text: 'Did you invent peanut butter?', next: 'o3a' },
          { text: 'What kind of purpose?', next: 'o3b' },
        ],
      },
      {
        id: 'o3a',
        speaker: 'carver',
        expression: 'smile',
        text: 'Ha! People ask me that a lot. No, I did not. People made peanut pastes long before me. My work was looking for many different uses, so farmers had more reasons to grow these crops.',
        next: 'o4',
      },
      {
        id: 'o3b',
        speaker: 'carver',
        expression: 'curious',
        text: 'Something people really need. That is the secret: an invention starts with a need, not with a gadget.',
        next: 'o4',
      },
      {
        id: 'o4',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'acceptQuest', chapterId: 'ch4' }],
        text: 'Miss Lottie, the cook, has a need from the community kitchen. Mr. Brooks, the craftsperson, has materials and a few workshop rules.',
        next: 'o5',
      },
      {
        id: 'o5',
        speaker: 'carver',
        expression: 'curious',
        text: 'Try at least two ideas in his workshop, pay attention to what the tests show, and improve one. Then bring me your best invention and tell me why it fits.',
        next: null,
      },
    ]),

    convo('carver_ch4_waiting', 'Carver: How is the invention going?', [
      {
        id: 'w1',
        speaker: 'carver',
        expression: 'curious',
        text: '{carverNudge4}',
        choices: [
          { text: "I'm on it!", next: null },
          { text: "What if my idea doesn't work?", next: 'w2' },
        ],
      },
      {
        id: 'w2',
        speaker: 'carver',
        expression: 'smile',
        text: 'Then you have learned something! A test that fails tells you what to change. That is how every invention gets better.',
        next: null,
      },
    ]),

    convo('carver_ch4_closing', 'Carver: Your invention', [
      { id: 'c1', speaker: 'carver', expression: 'smile', text: 'Let me see what you made: {protoName}.', next: 'c2' },
      { id: 'c2', speaker: 'carver', expression: 'thinking', text: '{revisionText}', next: 'c3' },
      { id: 'c3', speaker: 'carver', expression: 'proud', text: '{trialText}', next: 'q' },
      {
        id: 'q',
        kind: 'question',
        speaker: 'carver',
        expression: 'curious',
        objectiveId: 'invent',
        text: 'Tell me: why does your final design fit the kitchen\'s need?',
        options: [
          {
            id: 'first',
            text: 'It was my very first idea.',
            correct: false,
            misconception: 'first-idea-best',
            feedback: 'First ideas are a starting place. What did your tests show about this one?',
          },
          {
            id: 'fits',
            text: "It keeps a week without a fridge, it's filling, it's easy enough, and it's safe to share.",
            correct: true,
            feedback: 'Yes. You checked it against every part of the need, with evidence from your tests.',
          },
          {
            id: 'steps',
            text: 'It used the most steps, so it must be the best.',
            correct: false,
            misconception: 'more-steps-better',
            feedback: 'More steps meant more work for the volunteers. Simple can be better. What did the need card ask for?',
          },
        ],
        hints: [
          'Here is a clue: look at the need card again. What four things did Miss Lottie ask for?',
          'She asked for a snack that keeps, fills kids up, is easy enough, and is safe. Which answer names those?',
          'Worked example: a design fits when it passes every part of the need. So "It keeps a week without a fridge, it\'s filling, it\'s easy enough, and it\'s safe to share" is the answer.',
        ],
        next: 'c4',
      },
      {
        id: 'c4',
        speaker: 'carver',
        expression: 'smile',
        text: 'That is how inventors think: the need first, then test, then improve.',
        textIfRetried: 'You thought again and found it. The need first, then test, then improve: that is how inventors think.',
        next: 'c5',
      },
      {
        id: 'c5',
        speaker: 'carver',
        expression: 'thinking',
        text: 'I spent many hours in my laboratory looking for new uses for crops. Would you like to see a memory?',
        choices: [
          { text: 'Yes, show me the memory.', next: 'c6', effects: [{ type: 'showMemory', memoryId: 'peanut_lab' }] },
          { text: 'Maybe later.', next: 'c6' },
        ],
      },
      {
        id: 'c6',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'grantItem', itemId: 'invention_card', from: 'carver' }],
        text: 'This is for you: an Invention Sketch Card. Sketch an invention from things you can find at home, and test it with a grown-up.',
        next: 'c7',
      },
      {
        id: 'c7',
        speaker: 'carver',
        expression: 'curious',
        effects: [{ type: 'completeChapter', chapterId: 'ch4' }],
        text: 'Next time, we take science out to the farms. Two neighbors need help, and they need answers they can really use.',
        next: null,
      },
    ]),

    convo('carver_ch4_after', 'Carver: Inventions people use', [
      {
        id: 'a1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Miss Lottie says the kids love your {protoName}. Your sketch card is in your bag.',
        choices: [
          { text: 'Can I see the laboratory memory?', next: 'a2', effects: [{ type: 'showMemory', memoryId: 'peanut_lab' }] },
          { text: 'See you soon!', next: null },
        ],
      },
      { id: 'a2', speaker: 'carver', expression: 'smile', text: 'A good invention is one somebody can actually use.', next: null },
    ]),

    convo('lottie_ch4_give', 'Miss Lottie: The kitchen\'s need', [
      {
        id: 'l1',
        speaker: 'lottie',
        expression: 'smile',
        text: "Hello there! I'm Lottie Greene. I cook for the after-school kitchen. Carver says you're an inventor now?",
        next: 'l2',
      },
      {
        id: 'l2',
        speaker: 'lottie',
        expression: 'thinking',
        text: 'Here is my problem. Some kids go home hungry, and I need a snack I can send home in their backpacks.',
        choices: [
          { text: 'Why not use the fridge?', next: 'l3a' },
          { text: 'What do the kids like?', next: 'l3b' },
        ],
      },
      {
        id: 'l3a',
        speaker: 'lottie',
        expression: 'neutral',
        text: "My fridge is tiny, and backpacks don't have fridges! The snack has to keep at least a week on a shelf.",
        next: 'l4',
      },
      {
        id: 'l3b',
        speaker: 'lottie',
        expression: 'smile',
        text: 'Crunchy things, and anything a little sweet. And it has to fill them up until dinner.',
        next: 'l4',
      },
      {
        id: 'l4',
        speaker: 'lottie',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'need_card', from: 'lottie' },
          { type: 'completeStep', chapterId: 'ch4', stepId: 'get_need' },
        ],
        text: 'I wrote it all on this card. Please read the last line: two of our kids are allergic to peanuts.',
        next: 'l5',
      },
      {
        id: 'l5',
        speaker: 'lottie',
        expression: 'neutral',
        text: 'So if you use peanuts, the snack needs a clear label, so those two know to pick something else.',
        next: null,
      },
    ]),
    convo('lottie_ch4_after', 'Miss Lottie: Taste test', [
      { id: 'la', speaker: 'lottie', expression: 'smile', text: "I can't wait to taste-test whatever you make!", next: null },
    ]),
    convo('lottie_ambient', 'Miss Lottie: Cornbread', [
      { id: 'lb', speaker: 'lottie', expression: 'smile', text: "Something always smells good at my kitchen. Today it's cornbread!", next: null },
    ]),

    convo('wendell_ch4_give', 'Mr. Brooks: The workshop', [
      { id: 'b1', speaker: 'wendell', expression: 'neutral', text: 'Afternoon. Wendell Brooks. Carver told me you need a workshop.', next: 'b2' },
      {
        id: 'b2',
        speaker: 'wendell',
        expression: 'smile',
        text: 'You can use mine. There is a hand mill for grinding, a drying rack, and an oven for roasting.',
        choices: [
          { text: 'Can I fry things?', next: 'b3a' },
          { text: 'Are there any rules?', next: 'b3b' },
        ],
      },
      {
        id: 'b3a',
        speaker: 'wendell',
        expression: 'thinking',
        text: "No frying, I'm afraid. Hot oil is too dangerous for young inventors and busy volunteers. Roasting and drying are safer.",
        next: 'b4',
      },
      {
        id: 'b3b',
        speaker: 'wendell',
        expression: 'thinking',
        text: 'Three rules. No frying: hot oil is too dangerous. No electricity in the kitchen. And keep it to a few steps: the volunteers have about an hour a week.',
        next: 'b4',
      },
      {
        id: 'b4',
        speaker: 'wendell',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'materials_kit', from: 'wendell' },
          { type: 'completeStep', chapterId: 'ch4', stepId: 'get_kit' },
        ],
        text: 'Here is the materials kit: jars with lids, paper bags, a bowl, and allergy labels. The workshop door is open.',
        next: 'b5',
      },
      { id: 'b5', speaker: 'wendell', expression: 'curious', text: 'Test every idea. My best inventions all started as my worst ones.', next: null },
    ]),
    convo('wendell_ch4_after', 'Mr. Brooks: Test twice', [
      { id: 'ba', speaker: 'wendell', expression: 'smile', text: "Measure twice, test twice! That's my rule.", next: null },
    ]),
    convo('wendell_ambient', 'Mr. Brooks: Fixing things', [
      { id: 'bb', speaker: 'wendell', expression: 'smile', text: 'I fix chairs, build shelves and mend fences. Everything can be improved.', next: null },
    ]),

    // ------------------------------------------------ Chapter 5: Science for the People
    convo('carver_ch5_opening', 'Carver: Science for the people', [
      {
        id: 'o1',
        speaker: 'carver',
        expression: 'thinking',
        text: 'Science is not only for laboratories and classrooms. It matters most when it helps real families, right where they live.',
        next: 'o2',
      },
      {
        id: 'o2',
        speaker: 'carver',
        expression: 'neutral',
        text: 'Two neighbors out at Two Creeks are having a hard year. Mrs. Watts farms a hillside. Mr. Pryor farms a flat field by the creek. Their problems are not the same.',
        choices: [
          { text: 'How can I help them?', next: 'o3a' },
          { text: 'Why not tell them what to buy?', next: 'o3b' },
        ],
      },
      {
        id: 'o3a',
        speaker: 'carver',
        expression: 'curious',
        text: 'Listen first. Get each farmer\'s own report, look at their land with your own eyes, then recommend what they can really do.',
        next: 'o4',
      },
      {
        id: 'o3b',
        speaker: 'carver',
        expression: 'thinking',
        text: 'Most farmers I knew had very little money. Advice that costs money they do not have is no help at all. The best answer uses what a family already has.',
        next: 'o4',
      },
      {
        id: 'o4',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'acceptQuest', chapterId: 'ch5' }],
        text: 'Miss Clara drives our demonstration wagon, a school on wheels. She has a map of what is free around Two Creeks, and she will take you there.',
        next: 'o5',
      },
      {
        id: 'o5',
        speaker: 'carver',
        expression: 'proud',
        text: 'One more thing: we do not sell advice. We share it. Neighbors help neighbors.',
        next: null,
      },
    ]),

    convo('carver_ch5_waiting', 'Carver: How are the neighbors?', [
      {
        id: 'w1',
        speaker: 'carver',
        expression: 'curious',
        text: '{carverNudge5}',
        choices: [
          { text: "I'm on it!", next: null },
          { text: 'What if the best idea costs money?', next: 'w2' },
        ],
      },
      {
        id: 'w2',
        speaker: 'carver',
        expression: 'smile',
        text: 'Then it is not the best idea for them. The best idea is the one a family can really use.',
        next: null,
      },
    ]),

    convo('carver_ch5_closing', 'Carver: Two neighbors helped', [
      { id: 'c1', speaker: 'carver', expression: 'smile', text: 'Clara tells me both farms are busy already! Tell me what you recommended.', next: 'c2' },
      { id: 'c2', speaker: 'carver', expression: 'thinking', text: '{wattsPlan}', next: 'c3' },
      { id: 'c3', speaker: 'carver', expression: 'thinking', text: '{pryorPlan}', next: 'c4' },
      { id: 'c4', speaker: 'carver', expression: 'proud', text: '{fertilizerNote}', next: 'q' },
      {
        id: 'q',
        kind: 'question',
        speaker: 'carver',
        expression: 'curious',
        objectiveId: 'help',
        text: 'So tell me: why didn\'t you recommend store fertilizer to them?',
        options: [
          {
            id: 'bad',
            text: 'Fertilizer is always bad for plants.',
            correct: false,
            misconception: 'fertilizer-always-bad',
            feedback: 'Fertilizer can help plants grow. So why not for these two farmers? Think about what their reports said.',
          },
          {
            id: 'fits',
            text: 'It costs money they do not have, and it does not stop the washing or build soil for next year.',
            correct: true,
            feedback: 'Yes. You judged it by their real lives: their money, their land, and next year too.',
          },
          {
            id: 'poster',
            text: 'Because the poster was too shiny.',
            correct: false,
            misconception: 'judge-by-looks',
            feedback: 'Ha! The poster was shiny. But what did the farmers\' reports and the resource map say about it?',
          },
        ],
        hints: [
          'Here is a clue: look at what each farmer has. How much money did they write down?',
          'Mrs. Watts has $3 and Mr. Pryor owes the store. A sack costs $12. And would it stop rain washing soil away?',
          'Worked example: a fix only helps if a family can afford it and it solves their real problem. So "It costs money they do not have, and it does not stop the washing or build soil for next year" is the answer.',
        ],
        next: 'c5',
      },
      {
        id: 'c5',
        speaker: 'carver',
        expression: 'smile',
        text: 'That is science for the people: an answer that fits their land, their money and their lives.',
        textIfRetried: 'You thought it through again. An answer has to fit a family\'s land, money and life. That is science for the people.',
        next: 'c6',
      },
      {
        id: 'c6',
        speaker: 'carver',
        expression: 'thinking',
        text: 'Long ago, we took a real wagon out to farms, just like Clara\'s. Would you like to see a memory?',
        choices: [
          { text: 'Yes, show me the memory.', next: 'c7', effects: [{ type: 'showMemory', memoryId: 'movable_school' }] },
          { text: 'Maybe later.', next: 'c7' },
        ],
      },
      {
        id: 'c7',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'grantItem', itemId: 'interview_card', from: 'carver' }],
        text: 'This is for you: a Growing-Need Interview Card. Ask someone you know about growing food, and listen first, the way you did today.',
        next: 'c8',
      },
      {
        id: 'c8',
        speaker: 'carver',
        expression: 'curious',
        effects: [{ type: 'completeChapter', chapterId: 'ch5' }],
        text: 'Next time, you ask a question nobody has answered yet, and design a fair test to find out.',
        next: null,
      },
    ]),

    convo('carver_ch5_after', 'Carver: Neighbors helping neighbors', [
      {
        id: 'a1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Mrs. Watts sent word: the rain came and her soil stayed put. Mr. Pryor\'s children planted greens. Your interview card is in your bag.',
        choices: [
          { text: 'Can I see the wagon memory?', next: 'a2', effects: [{ type: 'showMemory', memoryId: 'movable_school' }] },
          { text: 'See you soon!', next: null },
        ],
      },
      { id: 'a2', speaker: 'carver', expression: 'smile', text: 'When the farmers could not come to the school, we brought the school to them.', next: null },
    ]),

    convo('clara_ch5_give', 'Miss Clara: The movable school', [
      {
        id: 'k1',
        speaker: 'clara',
        expression: 'smile',
        text: "Hi! I'm Clara Dean. I drive the demonstration wagon out to farms. Carver calls it a movable school.",
        choices: [
          { text: 'Why a wagon?', next: 'k2a' },
          { text: "What's in it?", next: 'k2b' },
        ],
      },
      {
        id: 'k2a',
        speaker: 'clara',
        expression: 'neutral',
        text: "Farmers can't leave their fields for weeks to come to a school. So the school goes to them.",
        next: 'k3',
      },
      {
        id: 'k2b',
        speaker: 'clara',
        expression: 'curious',
        text: 'Seed samples, a shovel, a plow, and a table for showing ideas. Everything we show is something a family can do at home.',
        next: 'k3',
      },
      {
        id: 'k3',
        speaker: 'clara',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'resource_map', from: 'clara' },
          { type: 'completeStep', chapterId: 'ch5', stepId: 'get_map' },
        ],
        text: 'Here is my resource map of Two Creeks. It shows what is free around there, and what costs money.',
        next: 'k4',
      },
      {
        id: 'k4',
        speaker: 'clara',
        expression: 'curious',
        text: 'Hop on the wagon when you are ready: just walk up to it. And listen first. Every family knows their own land best.',
        next: null,
      },
    ]),
    convo('clara_ch5_after', 'Miss Clara: Ready to roll', [
      { id: 'ka', speaker: 'clara', expression: 'smile', text: 'The wagon is ready whenever you are! Walk up to it to ride to Two Creeks.', next: null },
    ]),
    convo('clara_ambient', 'Miss Clara: Every road', [
      { id: 'kb', speaker: 'clara', expression: 'smile', text: 'I have driven this wagon down every road in the county. Rain or shine, the school rolls on!', next: null },
    ]),

    convo('watts_ch5_give', 'Mrs. Watts: The hillside', [
      { id: 'm1', speaker: 'watts', expression: 'smile', text: "Well, look who Clara brought! I'm Estelle Watts. This hill is my farm.", next: 'm2' },
      {
        id: 'm2',
        speaker: 'watts',
        expression: 'thinking',
        text: 'Every time it storms, my soil runs down this hill like chocolate milk. My cotton gets thinner every year.',
        choices: [
          { text: 'Do you have help on the farm?', next: 'm3a' },
          { text: 'What do you have to work with?', next: 'm3b' },
        ],
      },
      {
        id: 'm3a',
        speaker: 'watts',
        expression: 'neutral',
        text: 'Just me and Buttercup, my cow. My children moved up north for work. So whatever it is, I have to be able to do it myself.',
        next: 'm4',
      },
      {
        id: 'm3b',
        speaker: 'watts',
        expression: 'neutral',
        text: 'Buttercup, a lot of leaves every fall, and three dollars in a jar. That is about it.',
        next: 'm4',
      },
      {
        id: 'm4',
        speaker: 'watts',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'farm_report_a', from: 'watts' },
          { type: 'completeStep', chapterId: 'ch5', stepId: 'get_report_watts' },
        ],
        text: 'I wrote it all down for you. Take a look around my hill, too. And please: nothing fancy.',
        next: null,
      },
    ]),
    convo('watts_ch5_after', 'Mrs. Watts: News from the hill', [{ id: 'ma', speaker: 'watts', expression: 'smile', text: '{wattsAfter}', next: null }]),
    convo('watts_ambient', 'Mrs. Watts: Buttercup', [
      { id: 'mb', speaker: 'watts', expression: 'smile', text: 'Buttercup gives the best milk in Two Creeks. Don\'t tell Mr. Pryor I said so.', next: null },
    ]),

    convo('pryor_ch5_give', 'Mr. Pryor: The creek field', [
      { id: 'p1', speaker: 'pryor', expression: 'neutral', text: 'Afternoon. Samuel Pryor. Carver said somebody might come by.', next: 'p2' },
      {
        id: 'p2',
        speaker: 'pryor',
        expression: 'thinking',
        text: 'My field is worn thin from cotton, and my children eat cornbread most nights. I want better for them.',
        choices: [
          { text: 'Have you tried store fertilizer?', next: 'p3a' },
          { text: 'What do you have plenty of?', next: 'p3b' },
        ],
      },
      {
        id: 'p3a',
        speaker: 'pryor',
        expression: 'neutral',
        text: 'Once. I borrowed money for a sack. I got a little more cotton, but not enough to pay it back. I still owe the store.',
        next: 'p4',
      },
      {
        id: 'p3b',
        speaker: 'pryor',
        expression: 'smile',
        text: 'Mud and leaves! The creek bank is full of black muck, and my woods drop leaves every fall.',
        next: 'p4',
      },
      {
        id: 'p4',
        speaker: 'pryor',
        expression: 'neutral',
        effects: [
          { type: 'grantItem', itemId: 'farm_report_b', from: 'pryor' },
          { type: 'completeStep', chapterId: 'ch5', stepId: 'get_report_pryor' },
        ],
        text: 'Here are my notes. Look around if you like. Whatever you suggest, it has to cost nothing.',
        next: null,
      },
    ]),
    convo('pryor_ch5_after', 'Mr. Pryor: News from the creek', [{ id: 'pa', speaker: 'pryor', expression: 'smile', text: '{pryorAfter}', next: null }]),
    convo('pryor_ambient', 'Mr. Pryor: The creek', [
      { id: 'pb', speaker: 'pryor', expression: 'smile', text: 'Listen: that creek never stops talking. My children say it sings them to sleep.', next: null },
    ]),

    // ------------------------------------------------ Chapter 6: A Scientist's Method
    convo('carver_ch6_opening', "Carver: A question nobody has answered", [
      {
        id: 'o1',
        speaker: 'carver',
        expression: 'curious',
        text: 'Hattie has a puzzle. Her bean seedlings grow differently in different spots, and everyone in town has a different explanation.',
        next: 'o2',
      },
      {
        id: 'o2',
        speaker: 'carver',
        expression: 'thinking',
        text: 'When people disagree about how nature works, a scientist does not argue. A scientist designs a fair test.',
        choices: [
          { text: 'What makes a test fair?', next: 'o3a' },
          { text: "Can't we just ask an expert?", next: 'o3b' },
        ],
      },
      {
        id: 'o3a',
        speaker: 'carver',
        expression: 'smile',
        text: 'You change only ONE thing and keep everything else the same. Then, if something is different, you know what caused it.',
        next: 'o4',
      },
      {
        id: 'o3b',
        speaker: 'carver',
        expression: 'smile',
        text: 'Experts are a fine place to start, but even experts test their ideas. The plants will tell us the truth, if we ask them fairly.',
        next: 'o4',
      },
      {
        id: 'o4',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'acceptQuest', chapterId: 'ch6' }],
        text: 'My greenhouse is open for you. Mr. Reed, my lab assistant, has a measuring kit inside, and Hattie has trial notes and seeds.',
        next: 'o5',
      },
      {
        id: 'o5',
        speaker: 'carver',
        expression: 'curious',
        text: 'Observe first, ask a question you can test, make a prediction, run a fair test, and bring me your conclusion, whatever the data says.',
        next: null,
      },
    ]),

    convo('carver_ch6_waiting', 'Carver: How is the experiment?', [
      {
        id: 'w1',
        speaker: 'carver',
        expression: 'curious',
        text: '{carverNudge6}',
        choices: [
          { text: "I'm on it!", next: null },
          { text: 'What if my hypothesis is wrong?', next: 'w2' },
        ],
      },
      {
        id: 'w2',
        speaker: 'carver',
        expression: 'smile',
        text: 'Then you have learned something true! A hypothesis is a guess you test, not a promise you have to keep.',
        next: null,
      },
    ]),

    convo('carver_ch6_closing', 'Carver: Your conclusion', [
      { id: 'c1', speaker: 'carver', expression: 'smile', text: 'A real experiment! Let me hear it. {expQuestion}', next: 'c2' },
      { id: 'c2', speaker: 'carver', expression: 'thinking', text: '{expData}', next: 'c3' },
      { id: 'c3', speaker: 'carver', expression: 'proud', text: '{expHypo}', next: 'q' },
      {
        id: 'q',
        kind: 'question',
        speaker: 'carver',
        expression: 'curious',
        objectiveId: 'method',
        text: 'Tell me: why did you change only the {expChanged} between your two trays?',
        options: [
          {
            id: 'faster',
            text: 'Because it was faster to set up.',
            correct: false,
            misconception: 'control-for-speed',
            feedback: 'It is quicker, but that is not the reason. Think about what happens if two things are different.',
          },
          {
            id: 'cause',
            text: 'So if the trays grew differently, I would know that one change caused it.',
            correct: true,
            feedback: 'Exactly. With only one difference, the data can point to the cause.',
          },
          {
            id: 'match',
            text: 'So the results would match my hypothesis.',
            correct: false,
            misconception: 'test-to-confirm',
            feedback: 'A fair test is not built to prove you right. It is built to find out what is true. Why keep everything else the same?',
          },
        ],
        hints: [
          'Here is a clue: think about what would happen if tray B had more light AND more water.',
          'If two things change, and tray B grows taller, which change did it? Which answer solves that problem?',
          'Worked example: with only one difference between the trays, any change in growth must come from it. So "So if the trays grew differently, I would know that one change caused it" is the answer.',
        ],
        next: 'c4',
      },
      {
        id: 'c4',
        speaker: 'carver',
        expression: 'smile',
        text: 'That is the heart of the scientific method: one change, careful measuring, and honest conclusions.',
        textIfRetried: 'You worked it out. One change, careful measuring, honest conclusions: that is the heart of the scientific method.',
        next: 'c5',
      },
      { id: 'c5', speaker: 'carver', expression: 'thinking', text: '{expExtra}', next: 'c6' },
      {
        id: 'c6',
        speaker: 'carver',
        expression: 'thinking',
        text: 'At Tuskegee, my students and I tested ideas on plots side by side. Would you like to see a memory?',
        choices: [
          { text: 'Yes, show me the memory.', next: 'c7', effects: [{ type: 'showMemory', memoryId: 'experiment_station' }] },
          { text: 'Maybe later.', next: 'c7' },
        ],
      },
      {
        id: 'c7',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'grantItem', itemId: 'experiment_card', from: 'carver' }],
        text: 'This is for you: a Fair-Test Plan Card. With a grown-up, you can plant a few bean seeds at home and test one thing.',
        next: 'c8',
      },
      {
        id: 'c8',
        speaker: 'carver',
        expression: 'proud',
        effects: [{ type: 'completeChapter', chapterId: 'ch6' }],
        text: 'You observe, you question, you test, and you tell the truth about what you find. Next time, it is your turn to use all of it to help your own community.',
        next: null,
      },
    ]),

    convo('carver_ch6_after', 'Carver: Keep asking', [
      {
        id: 'a1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Hattie is telling everyone about your experiment. Your fair-test card is in your bag.',
        choices: [
          { text: 'Can I see the experiment station memory?', next: 'a2', effects: [{ type: 'showMemory', memoryId: 'experiment_station' }] },
          { text: 'See you soon!', next: null },
        ],
      },
      { id: 'a2', speaker: 'carver', expression: 'smile', text: 'Every answer grows a new question. That is what keeps science alive.', next: null },
    ]),

    convo('isaac_ch6_give', 'Mr. Reed: The measuring kit', [
      {
        id: 'i1',
        speaker: 'isaac',
        expression: 'smile',
        text: "Welcome to the greenhouse! I'm Isaac Reed, Carver's lab assistant. I keep the plants watered and the measurements honest.",
        choices: [
          { text: 'Why do measurements need to be honest?', next: 'i2a' },
          { text: 'Why measure at all?', next: 'i2b' },
        ],
      },
      {
        id: 'i2a',
        speaker: 'isaac',
        expression: 'thinking',
        text: 'If you measure one plant to the top leaf and the next one to the tip of a stem, your numbers are not fair. Same way, every time.',
        next: 'i3',
      },
      {
        id: 'i2b',
        speaker: 'isaac',
        expression: 'thinking',
        text: '"It looks taller" is a guess. "Fourteen centimeters" is data. Data is something other people can check.',
        next: 'i3',
      },
      {
        id: 'i3',
        speaker: 'isaac',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'measuring_tool', from: 'isaac' },
          { type: 'completeStep', chapterId: 'ch6', stepId: 'get_tool' },
        ],
        text: 'Here is the measuring kit: a ruler in centimeters, and a cup marked for water. Measure from the soil to the top leaf.',
        next: 'i4',
      },
      {
        id: 'i4',
        speaker: 'isaac',
        expression: 'curious',
        text: "Hattie's seedlings are on the sunny bench and the shady shelf. Measuring them is a good first observation.",
        next: null,
      },
    ]),
    convo('isaac_ch6_after', 'Mr. Reed: Same way every time', [
      { id: 'ia', speaker: 'isaac', expression: 'smile', text: 'Remember: soil to top leaf, same way every time. And write it down right away!', next: null },
    ]),
    convo('isaac_ambient', 'Mr. Reed: Greenhouse chores', [
      { id: 'ib', speaker: 'isaac', expression: 'smile', text: 'Seedlings, labels, watering cans. A greenhouse is a lab where the experiments are alive.', next: null },
    ]),

    convo('hattie_ch6_give', 'Hattie: The bean puzzle', [
      { id: 'b1', speaker: 'hattie', expression: 'smile', text: "There's my garden helper! Carver says you're a scientist now. Good, because I have a puzzle.", next: 'b2' },
      {
        id: 'b2',
        speaker: 'hattie',
        expression: 'thinking',
        text: "My bean seedlings on the sunny porch rail are short and bushy. The ones under the shady fig tree shot up tall! Mae swears compost makes beans taller. Mr. Hill says water them a lot.",
        choices: [
          { text: 'So who is right?', next: 'b3a' },
          { text: 'How could we find out?', next: 'b3b' },
        ],
      },
      {
        id: 'b3a',
        speaker: 'hattie',
        expression: 'neutral',
        text: "That's the thing: nobody knows! Everybody has an opinion, and nobody has tested it fairly. It's an open question.",
        next: 'b4',
      },
      {
        id: 'b3b',
        speaker: 'hattie',
        expression: 'curious',
        text: 'Carver would say: test it. Grow some seedlings two different ways and measure them. But only change one thing, or you will never know which thing mattered.',
        next: 'b4',
      },
      {
        id: 'b4',
        speaker: 'hattie',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'trial_seeds', from: 'hattie' },
          { type: 'completeStep', chapterId: 'ch6', stepId: 'get_seeds' },
        ],
        text: 'Here are my notes and a pouch of bean seeds. They all came from one plant, so they start out alike. That keeps your test fair.',
        next: null,
      },
    ]),
    convo('hattie_ch6_after', 'Hattie: Waiting for the results', [
      { id: 'bc', speaker: 'hattie', expression: 'smile', text: "I can't wait to hear what the beans say! Tell me even if Mae turns out to be wrong.", next: null },
    ]),

    // ------------------------------------------------ Chapter 7: Your Turn to Plant the Seeds
    convo('carver_ch7_opening', 'Carver: Your turn', [
      {
        id: 'o1',
        speaker: 'carver',
        expression: 'proud',
        text: 'Look at all you have done. You observed a garden, followed my path through school, cared for tired soil, invented, helped two farms, and ran a fair test.',
        next: 'o2',
      },
      {
        id: 'o2',
        speaker: 'carver',
        expression: 'smile',
        text: 'Now it is your turn. Sweetgum Hollow is holding a Community Fair, and I would like you to bring a project of your own: science that helps your community.',
        choices: [
          { text: 'What should I make?', next: 'o3a' },
          { text: "What if my idea isn't good enough?", next: 'o3b' },
        ],
      },
      {
        id: 'o3a',
        speaker: 'carver',
        expression: 'curious',
        text: 'That is for you to decide! But start where every good invention starts: with a real need. Theo and Miss Lottie have been collecting need cards from the town.',
        next: 'o4',
      },
      {
        id: 'o3b',
        speaker: 'carver',
        expression: 'smile',
        text: 'Every idea starts rough. Mine did too. You build it, you let someone try it, and you make it better. Mr. Brooks has a rule about that.',
        next: 'o4',
      },
      {
        id: 'o4',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'acceptQuest', chapterId: 'ch7' }],
        text: 'Get the need cards from Theo and Miss Lottie, and a prototype kit from Mr. Brooks. Then work at the fair table in the square.',
        next: 'o5',
      },
      {
        id: 'o5',
        speaker: 'carver',
        expression: 'curious',
        text: 'Choose a need, design your project, let a neighbor try it, improve it once, and bring me your project card.',
        next: null,
      },
    ]),

    convo('carver_ch7_waiting', 'Carver: How is your project?', [
      {
        id: 'w1',
        speaker: 'carver',
        expression: 'curious',
        text: '{carverNudge7}',
        choices: [
          { text: "I'm on it!", next: null },
          { text: 'Can I make up my own need?', next: 'w2' },
        ],
      },
      {
        id: 'w2',
        speaker: 'carver',
        expression: 'smile',
        text: 'Of course! If you notice a need yourself, write it down at the fair table. Looking around and asking what people need is where science begins.',
        next: null,
      },
    ]),

    convo('carver_ch7_closing', 'Carver: Your project', [
      { id: 'c1', speaker: 'carver', expression: 'smile', text: 'The fair table was busy today! Show me your project: {projName}.', next: 'c2' },
      { id: 'c2', speaker: 'carver', expression: 'thinking', text: '{projNeed}', next: 'c3' },
      { id: 'c3', speaker: 'carver', expression: 'proud', text: '{projRevision}', next: 'c4' },
      { id: 'c4', speaker: 'carver', expression: 'smile', text: '{projTest}', next: 'c5' },
      {
        id: 'c5',
        speaker: 'carver',
        expression: 'curious',
        text: 'Tell me: which part of your project felt the most like being a scientist?',
        choices: [
          { text: 'Noticing the need', next: 'c6a' },
          { text: 'Planning the test', next: 'c6b' },
          { text: 'Fixing it after feedback', next: 'c6c' },
          { text: 'Helping someone', next: 'c6d' },
        ],
      },
      { id: 'c6a', speaker: 'carver', expression: 'smile', text: 'Noticing comes first. You looked at your town with care, and saw what people needed.', next: 'c7' },
      { id: 'c6b', speaker: 'carver', expression: 'smile', text: 'A plan to measure means you will know if it really works, not just hope it does.', next: 'c7' },
      { id: 'c6c', speaker: 'carver', expression: 'smile', text: 'Listening to feedback takes courage. Your second version is better because you did.', next: 'c7' },
      { id: 'c6d', speaker: 'carver', expression: 'smile', text: 'That is the heart of it. Science matters most when it helps people.', next: 'c7' },
      {
        id: 'c7',
        speaker: 'carver',
        expression: 'thinking',
        text: 'People sometimes call me a genius. But what I practiced, anyone can practice: look closely, ask questions, test your ideas, and share what you learn.',
        next: 'c8',
      },
      {
        id: 'c8',
        speaker: 'carver',
        expression: 'proud',
        text: 'Your project is not the same as my life\'s work, and it does not need to be. It is yours, and your town needs it.',
        next: 'c9',
      },
      {
        id: 'c9',
        speaker: 'carver',
        expression: 'thinking',
        text: 'Near the end of my life, I thought a lot about the young scientists who would come after me. Would you like to see one last memory?',
        choices: [
          { text: 'Yes, show me the memory.', next: 'c10', effects: [{ type: 'showMemory', memoryId: 'legacy' }] },
          { text: 'Maybe later.', next: 'c10' },
        ],
      },
      {
        id: 'c10',
        speaker: 'carver',
        expression: 'smile',
        effects: [{ type: 'grantItem', itemId: 'golden_seed', from: 'carver' }],
        text: 'This is for you: a Golden Seed. Observe, ask, test, share, and keep planting.',
        next: 'c11',
      },
      {
        id: 'c11',
        speaker: 'carver',
        expression: 'proud',
        effects: [{ type: 'completeChapter', chapterId: 'ch7' }, { type: 'showJourney' }],
        text: 'Now, let us look back at everything you did.',
        next: 'c12',
      },
      {
        id: 'c12',
        speaker: 'carver',
        expression: 'smile',
        text: 'The story is finished, but the seeds you planted will keep growing. Come and visit me any time.',
        next: null,
      },
    ]),

    convo('carver_ch7_after', 'Carver: Keep planting', [
      {
        id: 'a1',
        speaker: 'carver',
        expression: 'smile',
        text: 'Hello again, scientist! Your journey is on the shelf in your cottage. Is there anything you would like to look at?',
        choices: [
          { text: 'Show me my journey', next: 'a2', effects: [{ type: 'showJourney' }] },
          { text: 'Show me the last memory', next: 'a2', effects: [{ type: 'showMemory', memoryId: 'legacy' }] },
          { text: 'Just saying hello!', next: 'a2' },
        ],
      },
      { id: 'a2', speaker: 'carver', expression: 'smile', text: 'Keep noticing what people need. That is where the next project begins.', next: null },
    ]),

    convo('theo_ch7_give', 'Theo: Kids\' need cards', [
      { id: 't1', speaker: 'theo', expression: 'smile', text: "Hi! My friends and I have been writing need cards for the town's suggestion box!", next: 't2' },
      {
        id: 't2',
        speaker: 'theo',
        expression: 'curious',
        text: 'We found two problems that bug kids a lot.',
        choices: [
          { text: 'What did you notice?', next: 't3a' },
          { text: 'How did you find them?', next: 't3b' },
        ],
      },
      {
        id: 't3a',
        speaker: 'theo',
        expression: 'thinking',
        text: 'The school garden dries out every weekend, so the seedlings wilt by Monday. And there is no shade at the bus stop, so we bake while we wait.',
        next: 't4',
      },
      {
        id: 't3b',
        speaker: 'theo',
        expression: 'smile',
        text: 'We watched and wrote things down, like with the ladybugs! We checked the garden every Monday, and we timed how long we stood in the sun.',
        next: 't4',
      },
      {
        id: 't4',
        speaker: 'theo',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'need_cards', from: 'theo' },
          { type: 'completeStep', chapterId: 'ch7', stepId: 'get_kids_needs' },
        ],
        text: 'Here are our need cards. If you pick one of ours, I will test your project for you!',
        next: null,
      },
    ]),
    convo('theo_ch7_after', 'Theo: Ready to test', [
      { id: 'ta', speaker: 'theo', expression: 'curious', text: 'I am a very good tester. I notice everything!', next: null },
    ]),

    convo('lottie_ch7_give', "Miss Lottie: Neighbors' need cards", [
      { id: 'l1', speaker: 'lottie', expression: 'smile', text: 'The grown-ups at my kitchen talk about problems all day long. So I wrote two of them down for you.', next: 'l2' },
      {
        id: 'l2',
        speaker: 'lottie',
        expression: 'thinking',
        text: 'One is right in my kitchen, and one is out in the gardens.',
        choices: [
          { text: 'What are they?', next: 'l3a' },
          { text: 'Why do bees matter?', next: 'l3b' },
        ],
      },
      {
        id: 'l3a',
        speaker: 'lottie',
        expression: 'neutral',
        text: 'We throw away buckets of vegetable scraps every week. And the gardeners say fewer bees are visiting, so their beans and squash are not growing much.',
        next: 'l4',
      },
      {
        id: 'l3b',
        speaker: 'lottie',
        expression: 'curious',
        text: 'Bees carry pollen from flower to flower. Without them, bean and squash flowers do not turn into beans and squash. Fewer bees means less food.',
        next: 'l4',
      },
      {
        id: 'l4',
        speaker: 'lottie',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'neighbor_needs', from: 'lottie' },
          { type: 'completeStep', chapterId: 'ch7', stepId: 'get_neighbor_needs' },
        ],
        text: 'Here are the cards. If you choose one of mine, bring your project by, and I will try it out.',
        next: null,
      },
    ]),
    convo('lottie_ch7_after', 'Miss Lottie: Fair day', [
      { id: 'lc', speaker: 'lottie', expression: 'smile', text: "Fair day! I'm baking sweet potato pies for everybody who brings a project.", next: null },
    ]),

    convo('wendell_ch7_give', 'Mr. Brooks: The prototype kit', [
      { id: 'w1', speaker: 'wendell', expression: 'smile', text: 'A community project? Now you are talking my language.', next: 'w2' },
      {
        id: 'w2',
        speaker: 'wendell',
        expression: 'neutral',
        text: 'I packed a prototype kit for the fair. Barrels, canvas, posts, slats, seeds, rope and stakes. All scrap from my shop, so it costs nothing.',
        choices: [
          { text: 'Is there a rule for using it?', next: 'w3a' },
          { text: 'Why let someone try it?', next: 'w3b' },
        ],
      },
      {
        id: 'w3a',
        speaker: 'wendell',
        expression: 'smile',
        text: 'Just one. It is written in the lid: build it, let someone try it, fix what they find, then build it again.',
        next: 'w4',
      },
      {
        id: 'w3b',
        speaker: 'wendell',
        expression: 'thinking',
        text: 'Because you will never find every problem yourself. The person who uses it sees what you missed.',
        next: 'w4',
      },
      {
        id: 'w4',
        speaker: 'wendell',
        expression: 'smile',
        effects: [
          { type: 'grantItem', itemId: 'prototype_kit', from: 'wendell' },
          { type: 'completeStep', chapterId: 'ch7', stepId: 'get_kit' },
        ],
        text: 'Here you go. The fair table is set up in the town square, by the benches. Make me proud.',
        next: null,
      },
    ]),
    convo('wendell_ch7_after', 'Mr. Brooks: Build it again', [
      { id: 'wa', speaker: 'wendell', expression: 'smile', text: 'Build it, try it, fix it, build it again. You have got this.', next: null },
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
  creek_door: 'A covered wagon full of seed sacks, tools and posters. Carver calls it a movable school. It rolls out to the farms in Chapter 5.',
  farm_door: 'The farm gate is latched. Mr. Hill opens the fields for lessons in Chapter 3.',
  workshop_door: 'The workshop is locked. Mr. Brooks opens it for lessons in Chapter 4.',
  greenhouse_door: "Carver's greenhouse is full of seedlings and jars. He will invite you in for an experiment in Chapter 6.",
  shop_door: 'The Seed & Mail smells like paper and fresh soil. Mae is working at the stall out front.',
  shelf: 'An empty shelf. Things you earn on your adventures will go here.',
  windowsill_empty: 'A sunny windowsill. It would be a good spot for a plant.',
  windowsill_planted:
    'Your seed pot from Carver. The soil is damp, and nothing has sprouted yet. Keep watching; scientists are patient.',
};
