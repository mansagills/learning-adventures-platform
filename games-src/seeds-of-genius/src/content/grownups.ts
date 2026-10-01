/**
 * The "For grown-ups" page in the journal: what each chapter teaches, a
 * talking point, and its optional off-screen activity. Written for parents
 * and teachers, not for players.
 */

export interface GrownupChapter {
  chapterId: string;
  goal: string;
  talk: string;
}

export const GROWNUP_CHAPTERS: GrownupChapter[] = [
  {
    chapterId: 'ch1',
    goal: 'Record specific observations (numbers, colors, sizes) about plants and small creatures, and tell an observation apart from a guess.',
    talk: 'Go outside together and describe one thing without guessing: "3 holes in a leaf" instead of "a bug ate it."',
  },
  {
    chapterId: 'ch2',
    goal: "Put the stages of Carver's education in order, and name one barrier he faced and one source of support.",
    talk: 'Who helped Carver keep learning? Who has helped your child learn something hard?',
  },
  {
    chapterId: 'ch3',
    goal: 'Compare planting cotton every year with a crop-rotation plan, and explain in simple terms why caring for soil matters.',
    talk: 'Why might it be worth planting something that earns less this year, if it helps the soil for later years?',
  },
  {
    chapterId: 'ch4',
    goal: 'Test several uses for a crop against a real need, improve one idea using the test results, and explain the choice.',
    talk: 'What is something at home that started as a need? How could you test whether it meets that need?',
  },
  {
    chapterId: 'ch5',
    goal: "Match two farmers' different problems to practical, affordable ideas, and explain who benefits and why.",
    talk: 'Why was the expensive "quick fix" the wrong answer for these farmers, even though it looked good?',
  },
  {
    chapterId: 'ch6',
    goal: 'Ask a testable question, make a prediction, change only one thing, measure several trials, and draw a conclusion from the data, even when the prediction was wrong.',
    talk: 'Is a prediction that turns out wrong a failure? What did the data teach instead?',
  },
  {
    chapterId: 'ch7',
    goal: 'Plan a community project with a real need, an idea, evidence from earlier chapters, a test plan, and one improvement after feedback.',
    talk: 'What need have you noticed in your school or neighborhood? Who could you ask about it first?',
  },
];

/** Shared with the Chapter 2 journal section. */
export const CH2_NOTE = [
  "This chapter follows George Washington Carver's education, from learning to read at home to teaching at Tuskegee Institute. It names racism plainly and at a child's level: a school that did not allow Black children, and a college that turned him away when they saw he was Black. The game always says these barriers were unjust and never his fault, and every display about racism can be skipped and read later.",
  'Facts are checked against the National Park Service biography. The pictures and the town of Sweetgum Hollow are imagined; Ms. Nelson and Ada are fictional. Talking points: who helped Carver keep learning, and who has helped your child learn something hard?',
];

export const SIMPLIFICATIONS = [
  "Carver's lines are written for the game; they are not his real words. The town of Sweetgum Hollow and its people are made up. Scenes from his life are always labeled as memories.",
  'Several activities use simple models so children can see cause and effect: the soil scores in Chapter 3, the kitchen rules in Chapter 4, the farm advice in Chapter 5, the seedling heights in Chapter 6 and the project feedback in Chapter 7. They are not real farming, cooking or safety guidance.',
  'The game corrects two common myths: Carver did not invent peanut butter, and planting a legume helps tired soil slowly over several seasons rather than fixing it at once.',
];

export const HELPFUL_SETTINGS =
  'Settings (the gear button) can make text larger, slow down or speed up dialogue, reduce motion, turn sound off, and show on-screen touch controls. Every part of the game works with a keyboard, a mouse or touch, and every conversation can be replayed from the journal.';

export const PRIVACY_NOTE =
  'No accounts, no names and no tracking. Progress is saved only in this browser, and typed answers in Chapter 7 stay on this device. Settings can export a save file to move progress to another computer, or reset it.';
