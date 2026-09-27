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
