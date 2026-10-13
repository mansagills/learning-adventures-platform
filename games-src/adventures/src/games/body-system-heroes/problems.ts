/**
 * Body System Heroes: the science, as data and pure functions (no drawing,
 * no timers) so every rule can be unit tested.
 *
 * The Micro-Scout visits one organ per mission. In each mission the child
 * answers two kinds of question:
 *   - scan: Nib scans a part of the organ ("What do the tiny hairs in the
 *     airways do?"), at three levels:
 *       1. name it: which part is this, and what is it for? (grade 3)
 *       2. how it works: the steps or the path (grade 4)
 *       3. cause and effect: what happens if this part is hurt or sick? (grade 5)
 *   - diagnose: at the germs' nest, what is wrong and what helps?
 *
 * Every wrong answer names the real mistake behind it (a misconception tag)
 * and carries one plain sentence that explains it without giving the answer
 * away. Facts are checked against CDC, NIH MedlinePlus, Nemours KidsHealth
 * and the American Dental Association (see the grown-ups page credits).
 *
 * Wording rule (the owner's): short sentences, the facts first, then one
 * plain question, in words that match the picture, and no game jargon.
 */

export type Mission = 'skin' | 'mouth' | 'lungs' | 'gut' | 'heart' | 'brain';
export const MISSIONS: Mission[] = ['skin', 'mouth', 'lungs', 'gut', 'heart', 'brain'];
/** The five organ missions (the brain is the finale, open once all five are healed). */
export const ORGAN_MISSIONS: Mission[] = ['skin', 'mouth', 'lungs', 'gut', 'heart'];
/** Every mission with questions (all of them). */
export const OPEN_MISSIONS: Mission[] = MISSIONS;
export type Tier = 1 | 2 | 3;
export const TIERS: Tier[] = [1, 2, 3];
export type Kind = 'scan' | 'diagnose';

export type Misconception =
  | 'wrong-part' // mixed up which body part this is
  | 'wrong-job' // mixed up what a part does
  | 'wrong-order' // got the steps or the path in the wrong order
  | 'helper-or-germ' // took one of the body's own helper cells for a germ (or the wrong helper)
  | 'virus-bacteria' // mixed up viruses and bacteria
  | 'antibiotics-virus' // thinks antibiotics fight viruses like the flu
  | 'cold-weather' // thinks cold weather causes a cold or the flu
  | 'water-only' // thinks a quick rinse with water is enough to clean hands
  | 'fever-sickness' // thinks a fever is the sickness, not the body fighting it
  | 'pick-scab' // thinks a scab should be picked off
  | 'heals-itself' // thinks a problem fixes itself (a cavity, a dirty cut)
  | 'skip-habit' // thinks a healthy habit can be skipped or done rarely
  | 'sugar-ok' // thinks sugar does not matter for teeth
  | 'stomach-only' // thinks digestion only happens in the stomach
  | 'lungs-balloons' // thinks the lungs are two empty bags
  | 'all-germs-bad' // thinks every bacterium is a germ to get rid of
  | 'blue-blood' // thinks blood in the veins is blue
  | 'heart-tired' // thinks the heart gets tired, stops to rest, or beats fast from tiredness
  | 'brain-thinking-only'; // thinks the brain only does thinking (not breathing, the heartbeat, feelings)

export interface Choice {
  /** A unique key (the answer's own text). */
  value: string;
  label: string;
  correct: boolean;
  misconception?: Misconception;
  /** One sentence about this wrong answer (never gives the right one away). */
  why?: string;
}

export interface Question {
  id: string;
  mission: Mission;
  tier: Tier;
  kind: Kind;
  /** The banner text: the facts, then one plain question. */
  ask: string;
  choices: Choice[];
  /** Shown with the answer (hint 3, and after a right answer). */
  explain: string;
  /** Hint 1 (a nudge) and hint 2 (a worked clue); hint 3 outlines the answer. */
  hints: [string, string];
}

interface QDef {
  id: string;
  tier: Tier;
  kind: Kind;
  ask: string;
  right: string;
  wrong: Array<[string, Misconception, string]>;
  explain: string;
  hints: [string, string];
}

// ------------------------------------------------------------------ the question banks

const SKIN: QDef[] = [
  // level 1: name it
  {
    id: 'skin-barrier',
    tier: 1,
    kind: 'scan',
    ask: 'Skin covers your whole body. It is your biggest organ. What is one big job of your skin?',
    right: 'It keeps germs out.',
    wrong: [
      ['It pumps blood.', 'wrong-job', 'Pumping blood is the heart’s job, not the skin’s.'],
      ['It digests food.', 'wrong-job', 'Food is digested inside, in the stomach and intestines.'],
    ],
    explain: 'Skin is a wall around your body. It keeps germs out and keeps your insides in.',
    hints: ['Think of skin like a wall. What does a wall keep out?', 'Germs are all around us. Skin stops most of them from getting in.'],
  },
  {
    id: 'skin-scab',
    tier: 1,
    kind: 'scan',
    ask: 'A scab grows over a cut. It is hard and crusty. What does a scab do?',
    right: 'It covers the cut while new skin grows.',
    wrong: [
      ['It is dirt, so you should pick it off.', 'pick-scab', 'A scab is not dirt. Picking it opens the cut again.'],
      ['It stops you from feeling anything.', 'wrong-job', 'You can still feel near a scab. Feeling comes from nerves.'],
    ],
    explain: 'A scab is like a natural bandage. It covers the cut while new skin grows underneath.',
    hints: ['What do we put over a cut to protect it?', 'A bandage protects a cut. A scab does the same job, made by your body.'],
  },
  {
    id: 'skin-nerves',
    tier: 1,
    kind: 'scan',
    ask: 'Your skin has nerves in it. Nerves send messages to your brain. What do the nerves in your skin let you do?',
    right: 'Feel touch, heat and pain.',
    wrong: [
      ['See colors.', 'wrong-part', 'Seeing colors is the job of your eyes.'],
      ['Breathe air in.', 'wrong-part', 'Breathing is the job of your nose, windpipe and lungs.'],
    ],
    explain: 'Nerves in your skin tell your brain when something touches you, and if it is hot, cold or sore.',
    hints: ['Touch something soft. How do you know it is soft?', 'Your skin sends a message to your brain about what you touch.'],
  },
  {
    id: 'skin-sweat',
    tier: 1,
    kind: 'scan',
    ask: 'On a hot day, your skin makes sweat. Sweat is mostly water. What does sweat do?',
    right: 'It helps cool you down.',
    wrong: [
      ['It keeps germs inside you.', 'wrong-job', 'Sweat goes out of your skin. It does not lock germs in.'],
      ['It makes your skin grow.', 'wrong-job', 'New skin grows from cells under the top layer, not from sweat.'],
    ],
    explain: 'When sweat dries on your skin, it takes heat away. That cools you down.',
    hints: ['When do you sweat the most? When you are hot or cold?', 'You sweat when you are hot. Drying sweat takes heat away.'],
  },
  {
    id: 'skin-germs-in',
    tier: 1,
    kind: 'diagnose',
    ask: 'The scrape is red. Nib sees tiny round germs in it. They are living cells. What are they?',
    right: 'Bacteria',
    wrong: [
      ['Viruses', 'virus-bacteria', 'Viruses are much smaller, and they are not living cells.'],
      ['Red blood cells', 'helper-or-germ', 'Red blood cells are your own helpers. They carry oxygen.'],
    ],
    explain: 'Bacteria are tiny living cells. Some can get into a cut and make it sore.',
    hints: ['These germs are living cells. Which germ is a living cell?', 'Viruses are not cells. The living germs that are cells have another name.'],
  },
  {
    id: 'skin-help',
    tier: 1,
    kind: 'diagnose',
    ask: 'Bacteria got into the scrape. What should you do with a scrape?',
    right: 'Rinse it with clean water and cover it.',
    wrong: [
      ['Leave the dirt in it.', 'heals-itself', 'Dirt in a cut can bring more germs. A cut heals best when it is clean.'],
      ['Pick at it every day.', 'pick-scab', 'Picking opens the cut again and lets germs back in.'],
    ],
    explain: 'Rinse a scrape with clean water, then cover it with a bandage. Ask a grown-up to help.',
    hints: ['What do grown-ups do first when you scrape your knee?', 'They make it clean first. Then they protect it.'],
  },
  // level 2: how it works
  {
    id: 'skin-first',
    tier: 2,
    kind: 'scan',
    ask: 'You scrape your knee. It bleeds a little. Then a scab forms. Then new skin grows. What happens first?',
    right: 'Blood starts to clot.',
    wrong: [
      ['The scab falls off.', 'wrong-order', 'The scab falls off at the very end, after new skin grows.'],
      ['New skin grows.', 'wrong-order', 'New skin grows later, under the scab.'],
    ],
    explain: 'First the blood clots to stop the bleeding. The clot dries into a scab. New skin grows under it.',
    hints: ['A cut has to stop bleeding before anything else.', 'Bleeding stops when the blood clots.'],
  },
  {
    id: 'skin-platelets',
    tier: 2,
    kind: 'scan',
    ask: 'Your blood has tiny bits called platelets. At a cut, they stick together. What do they make?',
    right: 'A clot that stops the bleeding.',
    wrong: [
      ['Sweat to cool the cut.', 'wrong-job', 'Sweat comes from the skin, not from platelets.'],
      ['New bones.', 'wrong-part', 'Bones are not made at a cut.'],
    ],
    explain: 'Platelets stick together at a cut and make a clot. The clot plugs the hole and stops the bleeding.',
    hints: ['Sticking together makes a plug. What does a plug stop?', 'A plug in a cut stops the blood from coming out.'],
  },
  {
    id: 'skin-under',
    tier: 2,
    kind: 'scan',
    ask: 'A scab covers the cut now. What is happening under the scab?',
    right: 'New skin is growing.',
    wrong: [
      ['The cut is getting bigger.', 'heals-itself', 'A clean, covered cut gets smaller as it heals.'],
      ['Germs are moving in to live there.', 'helper-or-germ', 'The scab helps keep germs out while the skin heals.'],
    ],
    explain: 'Under the scab, the body makes new skin. When it is ready, the scab falls off by itself.',
    hints: ['A scab is like a bandage. What is it protecting?', 'It protects the place where the body is fixing the skin.'],
  },
  {
    id: 'skin-wbc',
    tier: 2,
    kind: 'scan',
    ask: 'Germs got into the cut. The body sends cells to fight them. Which cells?',
    right: 'White blood cells',
    wrong: [
      ['Red blood cells', 'helper-or-germ', 'Red blood cells carry oxygen. They do not fight germs.'],
      ['Platelets', 'helper-or-germ', 'Platelets make a clot. They do not fight germs.'],
    ],
    explain: 'White blood cells rush to a cut and fight the germs. That is why a cut can look red and swollen.',
    hints: ['Your blood has three kinds of helpers. Which one fights germs?', 'Red cells carry oxygen. Platelets clot. The third kind fights germs.'],
  },
  {
    id: 'skin-why-rinse',
    tier: 2,
    kind: 'diagnose',
    ask: 'Some bacteria are stuck in the scrape. Why should you rinse a scrape with clean water?',
    right: 'To wash out dirt and germs.',
    wrong: [
      ['To make it bleed more.', 'wrong-job', 'Rinsing is not for making a cut bleed.'],
      ['To turn it into a scab faster.', 'wrong-order', 'A scab forms from a clot, not from water.'],
    ],
    explain: 'Clean water washes dirt and many germs out. Then a bandage keeps new germs away.',
    hints: ['What is in a scrape after you fall outside?', 'Dirt and germs. Water can wash them out.'],
  },
  {
    id: 'skin-cover',
    tier: 2,
    kind: 'diagnose',
    ask: 'The scrape is clean now. Why do we put a bandage on it?',
    right: 'It keeps new germs and dirt out.',
    wrong: [
      ['It makes the cut stop hurting at once.', 'wrong-job', 'A bandage protects the cut. It does not stop the hurt at once.'],
      ['So you can pick the scab later.', 'pick-scab', 'Scabs should be left alone, not picked.'],
    ],
    explain: 'A bandage covers the cut, so new germs and dirt cannot get in while it heals.',
    hints: ['Skin is the body’s wall. Now the wall has a gap.', 'A bandage covers the gap until the skin grows back.'],
  },
  // level 3: cause and effect
  {
    id: 'skin-layers',
    tier: 3,
    kind: 'scan',
    ask: 'Skin has a top layer and a deeper layer. A scrape goes through the top layer. Why can germs get in now?',
    right: 'The skin’s wall has an opening.',
    wrong: [
      ['The scrape makes new germs.', 'heals-itself', 'Germs come from outside. A scrape only lets them in.'],
      ['Hurt skin pulls germs in.', 'wrong-job', 'Skin does not pull germs in. The gap just lets them through.'],
    ],
    explain: 'The top layer is a wall. A scrape opens a gap in the wall, so germs from outside can get in.',
    hints: ['What does the top layer of skin do when it is whole?', 'It keeps germs out. A scrape opens a gap in it.'],
  },
  {
    id: 'skin-picking',
    tier: 3,
    kind: 'scan',
    ask: 'Sam picks the scab off a cut every day. What will happen to the cut?',
    right: 'It takes longer to heal, and germs can get in.',
    wrong: [
      ['It heals faster.', 'pick-scab', 'Picking opens the cut again, so it has to start healing again.'],
      ['Nothing changes.', 'pick-scab', 'Picking changes a lot: the cut opens again.'],
    ],
    explain: 'Picking a scab opens the cut again. The body has to start over, and germs get a new way in.',
    hints: ['What is the scab protecting?', 'It protects the new skin. Picking it off leaves the cut open.'],
  },
  {
    id: 'skin-deep',
    tier: 3,
    kind: 'scan',
    ask: 'Blood vessels are in the deeper layer of skin. A deep cut bleeds. A tiny scratch may not. Why?',
    right: 'The deep cut reaches the blood vessels.',
    wrong: [
      ['The top layer is full of blood.', 'wrong-part', 'The blood vessels are in the deeper layer, not the top one.'],
      ['Scratches make the heart stop.', 'wrong-job', 'A scratch does not change your heart.'],
    ],
    explain: 'The top layer has no blood vessels. A cut deep enough to reach the deeper layer bleeds.',
    hints: ['Where are the blood vessels: the top layer or the deeper layer?', 'They are in the deeper layer. Only a deeper cut reaches them.'],
  },
  {
    id: 'skin-vitd',
    tier: 3,
    kind: 'scan',
    ask: 'Some sunlight on your skin helps your body make vitamin D. Vitamin D helps build strong bones. Which body system is your skin helping?',
    right: 'Your skeleton (your bones)',
    wrong: [
      ['Your lungs', 'wrong-part', 'Vitamin D helps bones, not breathing.'],
      ['Your stomach', 'wrong-part', 'Vitamin D helps bones, not digestion.'],
    ],
    explain: 'Skin makes vitamin D in sunlight, and vitamin D helps bones grow strong. Body systems help each other.',
    hints: ['The question says what vitamin D helps build.', 'It helps build strong bones. Bones make up the skeleton.'],
  },
  {
    id: 'skin-swollen',
    tier: 3,
    kind: 'diagnose',
    ask: 'The scrape is red, warm and a little swollen. What does that mean?',
    right: 'More blood and white blood cells came to fight the germs.',
    wrong: [
      ['The cut has already healed.', 'heals-itself', 'Red and swollen means the body is still working on it.'],
      ['The germs are sure to win.', 'helper-or-germ', 'Red and swollen means the body’s helpers are fighting back.'],
    ],
    explain: 'Extra blood brings white blood cells to fight germs. That makes the spot red, warm and a little swollen.',
    hints: ['Red and warm means extra blood is there. Why would the body send extra blood?', 'The blood brings white blood cells to fight the germs.'],
  },
  {
    id: 'skin-bandage-why',
    tier: 3,
    kind: 'diagnose',
    ask: 'A clean scrape left open got dirty again. A covered scrape stayed clean. Why did the covered one heal better?',
    right: 'The cover kept new germs out while the skin healed.',
    wrong: [
      ['Bandages kill all germs at once.', 'heals-itself', 'A bandage mostly keeps germs out. Cleaning the cut first matters too.'],
      ['Open cuts never heal.', 'heals-itself', 'Open cuts do heal, but germs can get in more easily.'],
    ],
    explain: 'Cleaning removes germs. Covering keeps new ones out. Together, they help the skin heal.',
    hints: ['What can land on an open scrape?', 'Dirt and germs can land on it. A cover stops that.'],
  },
];

const MOUTH: QDef[] = [
  {
    id: 'mouth-start',
    tier: 1,
    kind: 'scan',
    ask: 'Your teeth bite and chew food. Chewing is the first step of digestion. Where does digestion start?',
    right: 'In your mouth',
    wrong: [
      ['In your stomach', 'stomach-only', 'The stomach comes later. Digestion starts when you chew.'],
      ['In your lungs', 'wrong-part', 'Lungs are for breathing, not for food.'],
    ],
    explain: 'Digestion starts in your mouth. Teeth break food into small pieces, and spit makes it soft.',
    hints: ['Where does food go first when you eat?', 'Chewing is part of digestion. Where do you chew?'],
  },
  {
    id: 'mouth-saliva',
    tier: 1,
    kind: 'scan',
    ask: 'Spit is called saliva. Your mouth makes a lot of it. What does saliva do?',
    right: 'It makes food wet and soft to swallow.',
    wrong: [
      ['It brushes your teeth.', 'skip-habit', 'Saliva helps, but you still need to brush.'],
      ['It makes holes in teeth.', 'wrong-job', 'Holes come from acid made by germs, not from saliva.'],
    ],
    explain: 'Saliva makes food wet and soft so it is easy to swallow. It also helps wash bits of food away.',
    hints: ['Try to swallow a dry cracker. What helps?', 'Something wet helps. Your mouth makes it: saliva.'],
  },
  {
    id: 'mouth-enamel',
    tier: 1,
    kind: 'scan',
    ask: 'Enamel is the hard white outside of a tooth. Which is true about enamel?',
    right: 'It is the hardest thing in your body.',
    wrong: [
      ['It is soft, like skin.', 'wrong-part', 'Enamel is very hard, much harder than skin.'],
      ['It grows back when it chips.', 'heals-itself', 'Enamel cannot grow back. That is why we protect it.'],
    ],
    explain: 'Enamel is the hardest thing in your body. It cannot grow back, so we keep it clean and strong.',
    hints: ['Tap a tooth with your fingernail. Is it hard or soft?', 'It is very hard. Even harder than bone.'],
  },
  {
    id: 'mouth-molars',
    tier: 1,
    kind: 'scan',
    ask: 'Your front teeth are sharp. Your back teeth are wide and flat. What do the back teeth do?',
    right: 'Grind and mash food.',
    wrong: [
      ['Cut food into bites.', 'wrong-job', 'Cutting is the job of the sharp front teeth.'],
      ['Taste food.', 'wrong-part', 'Your tongue does the tasting.'],
    ],
    explain: 'Front teeth cut. Wide, flat back teeth (molars) grind and mash food into small bits.',
    hints: ['Wide and flat is good for crushing. What do you crush when you eat?', 'Back teeth crush and grind food.'],
  },
  {
    id: 'mouth-food',
    tier: 1,
    kind: 'diagnose',
    ask: 'Plaque Jack is a bacterium. Bacteria like Plaque Jack live on teeth. What do they love to eat?',
    right: 'Sugar',
    wrong: [
      ['Toothpaste', 'wrong-job', 'Toothpaste helps clean bacteria away. They do not feed on it.'],
      ['Plain water', 'sugar-ok', 'Water does not feed the bacteria. It helps rinse food away.'],
    ],
    explain: 'Cavity bacteria feed on sugar. Fewer sugary snacks means less food for them.',
    hints: ['Look at Plaque Jack’s hat. What is it made of?', 'Sweet things are Plaque Jack’s favorite food.'],
  },
  {
    id: 'mouth-brush-what',
    tier: 1,
    kind: 'diagnose',
    ask: 'Plaque Jack sticks to the teeth. What gets Plaque Jack off?',
    right: 'Brushing your teeth',
    wrong: [
      ['Eating more candy', 'sugar-ok', 'Candy feeds Plaque Jack. It does not get Plaque Jack off.'],
      ['Waiting for the bacteria to leave', 'heals-itself', 'Bacteria stay on teeth until you brush them off.'],
    ],
    explain: 'Brushing scrubs the bacteria and food off your teeth.',
    hints: ['What do you do with a toothbrush?', 'Think of what you do at the sink every morning and every night.'],
  },
  {
    id: 'mouth-how-often',
    tier: 2,
    kind: 'scan',
    ask: 'Dentists tell us how often to brush. How often should you brush your teeth?',
    right: 'Twice a day, for two minutes',
    wrong: [
      ['Once a week', 'skip-habit', 'A week is too long. Plaque builds up every day.'],
      ['Only when a tooth hurts', 'skip-habit', 'By the time a tooth hurts, there may be a cavity.'],
    ],
    explain: 'Brush twice a day, for two minutes each time: once in the morning and once before bed.',
    hints: ['Plaque builds up every single day.', 'So brushing has to happen every day: morning and night.'],
  },
  {
    id: 'mouth-plaque',
    tier: 2,
    kind: 'scan',
    ask: 'Plaque is a sticky film on your teeth. You can feel it with your tongue. What is plaque made of?',
    right: 'Bacteria and bits of food',
    wrong: [
      ['Toothpaste', 'wrong-job', 'Toothpaste rinses away. Plaque is what it helps clean off.'],
      ['Enamel', 'wrong-part', 'Enamel is the tooth itself. Plaque sits on top of it.'],
    ],
    explain: 'Plaque is a sticky layer of bacteria and food. Brushing removes it.',
    hints: ['Plaque Jack is part of it.', 'Plaque is bacteria like Plaque Jack, mixed with bits of food.'],
  },
  {
    id: 'mouth-fluoride',
    tier: 2,
    kind: 'scan',
    ask: 'Most toothpaste has fluoride in it. Why does fluoride help your teeth?',
    right: 'It makes enamel stronger.',
    wrong: [
      ['It feeds the bacteria.', 'sugar-ok', 'Fluoride does not feed bacteria. Sugar does.'],
      ['It makes teeth grow longer.', 'wrong-job', 'Fluoride does not make teeth grow.'],
    ],
    explain: 'Fluoride makes enamel stronger, so acid has a harder time making holes.',
    hints: ['What part of a tooth do we want to protect?', 'The enamel. Fluoride helps keep it strong.'],
  },
  {
    id: 'mouth-tongue',
    tier: 2,
    kind: 'scan',
    ask: 'Your tongue is a strong muscle. It helps you eat. What does your tongue do?',
    right: 'It tastes food and moves it around.',
    wrong: [
      ['It chews food.', 'wrong-part', 'Teeth do the chewing.'],
      ['It makes enamel.', 'wrong-job', 'The tongue does not make enamel.'],
    ],
    explain: 'Your tongue tastes food and pushes it between your teeth, then helps you swallow.',
    hints: ['What can you do with your tongue when you eat ice cream?', 'You taste it and move it around your mouth.'],
  },
  {
    id: 'mouth-acid',
    tier: 2,
    kind: 'diagnose',
    ask: 'Plaque Jack eats sugar. Then Plaque Jack makes something that hurts teeth. What is it?',
    right: 'Acid',
    wrong: [
      ['Saliva', 'wrong-job', 'Saliva comes from your mouth, and it helps protect teeth.'],
      ['Enamel', 'wrong-part', 'Enamel is the tooth’s hard outside. Bacteria cannot make it.'],
    ],
    explain: 'Bacteria eat sugar and make acid. The acid can make holes in enamel.',
    hints: ['Something sour and strong can wear away hard things.', 'It is sour and strong, like lemon juice but much stronger.'],
  },
  {
    id: 'mouth-snack',
    tier: 2,
    kind: 'diagnose',
    ask: 'You want a snack. Which snack gives Plaque Jack the least food?',
    right: 'An apple',
    wrong: [
      ['Sticky candy', 'sugar-ok', 'Sticky candy is lots of sugar, and it sticks to teeth.'],
      ['A sugary drink sipped all day', 'sugar-ok', 'Sipping all day gives the bacteria sugar again and again.'],
    ],
    explain: 'Fruit has some sugar too, but much less than candy, and it does not stick to teeth.',
    hints: ['Which snack has the least sugar on your teeth?', 'Candy and sugary drinks are full of sugar. Fruit has much less.'],
  },
  {
    id: 'mouth-cavity',
    tier: 3,
    kind: 'scan',
    ask: 'Bacteria make acid. The acid stays on a tooth for a long time. What happens to the tooth?',
    right: 'The acid makes a hole: a cavity.',
    wrong: [
      ['The tooth gets stronger.', 'wrong-job', 'Acid wears enamel away. It does not make teeth stronger.'],
      ['The acid turns into enamel.', 'wrong-part', 'Acid cannot turn into enamel.'],
    ],
    explain: 'Acid slowly wears away enamel. Over time, it can make a hole called a cavity.',
    hints: ['Acid wears hard things away, little by little.', 'If enamel wears away in one spot, a hole forms.'],
  },
  {
    id: 'mouth-sipping',
    tier: 3,
    kind: 'scan',
    ask: 'Mia sips juice all afternoon. Leo drinks one glass with lunch. Why is sipping harder on Mia’s teeth?',
    right: 'The bacteria get sugar again and again.',
    wrong: [
      ['Juice cleans teeth.', 'sugar-ok', 'Juice has sugar. It does not clean teeth.'],
      ['Sipping is slower to swallow.', 'wrong-job', 'How fast you swallow is not the problem. The sugar is.'],
    ],
    explain: 'Each sip feeds the bacteria, and they make acid each time. Fewer sugary times are better.',
    hints: ['Each sip brings more sugar to the bacteria.', 'More sugar more often means more acid more often.'],
  },
  {
    id: 'mouth-heal',
    tier: 3,
    kind: 'scan',
    ask: 'A cavity is a hole in a tooth. Can a cavity heal by itself?',
    right: 'No. A dentist needs to fix it.',
    wrong: [
      ['Yes, in about a week.', 'heals-itself', 'Enamel cannot grow back over a hole.'],
      ['Yes, if you eat more sugar.', 'sugar-ok', 'Sugar feeds the bacteria and makes cavities worse.'],
    ],
    explain: 'Enamel cannot grow back over a hole. A dentist cleans the hole and fills it.',
    hints: ['Can enamel grow back?', 'No. So a hole in enamel needs a dentist.'],
  },
  {
    id: 'mouth-baby',
    tier: 3,
    kind: 'scan',
    ask: 'Kids have 20 baby teeth. Adults have up to 32 teeth. Why do baby teeth fall out?',
    right: 'Grown-up teeth push up to take their place.',
    wrong: [
      ['They always get cavities.', 'heals-itself', 'Baby teeth fall out even when they are healthy.'],
      ['Chewing wears them away.', 'wrong-job', 'Chewing does not make baby teeth fall out.'],
    ],
    explain: 'Grown-up teeth grow under the baby teeth. They push up, and the baby teeth fall out.',
    hints: ['What grows in the gap after a baby tooth falls out?', 'A grown-up tooth. It was growing underneath.'],
  },
  {
    id: 'mouth-brush-why',
    tier: 3,
    kind: 'diagnose',
    ask: 'Plaque is a sticky film of bacteria. Why does brushing twice a day stop cavities?',
    right: 'It removes plaque before the acid can make holes.',
    wrong: [
      ['It makes teeth grow back.', 'heals-itself', 'Teeth do not grow back. Brushing protects them.'],
      ['It feeds the good bacteria.', 'sugar-ok', 'Brushing scrubs bacteria away. It does not feed them.'],
    ],
    explain: 'Brushing scrubs plaque away often, so the bacteria do not stay long enough to make holes.',
    hints: ['What makes the acid?', 'The bacteria in plaque. Brushing them off stops the acid.'],
  },
  {
    id: 'mouth-floss',
    tier: 3,
    kind: 'diagnose',
    ask: 'Plaque Jack hides between two teeth. A toothbrush cannot reach that spot. What can?',
    right: 'Dental floss',
    wrong: [
      ['A sugary drink', 'sugar-ok', 'A sugary drink feeds the bacteria. It does not clean them away.'],
      ['Nothing, so leave it.', 'heals-itself', 'Plaque left between teeth can still make cavities.'],
    ],
    explain: 'Floss slides between teeth and lifts out plaque where a brush cannot reach.',
    hints: ['You need something thin that fits between teeth.', 'A thin string made for teeth: floss.'],
  },
];

const LUNGS: QDef[] = [
  {
    id: 'lungs-oxygen-in',
    tier: 1,
    kind: 'scan',
    ask: 'Air has a gas your body needs. You breathe it in all day and night. What is it?',
    right: 'Oxygen',
    wrong: [
      ['Carbon dioxide', 'wrong-order', 'Carbon dioxide is the gas you breathe out.'],
      ['Helium', 'wrong-part', 'Helium is the gas in party balloons. Your body does not use it.'],
    ],
    explain: 'You breathe in oxygen. Every part of your body needs it.',
    hints: ['Divers and astronauts carry tanks of this gas.', 'Its name starts with "ox".'],
  },
  {
    id: 'lungs-co2-out',
    tier: 1,
    kind: 'scan',
    ask: 'Your body makes a gas it does not need. You breathe it out. What is it?',
    right: 'Carbon dioxide',
    wrong: [
      ['Oxygen', 'wrong-order', 'Oxygen is the gas you breathe in and keep.'],
      ['Helium', 'wrong-part', 'Your body does not make helium.'],
    ],
    explain: 'You breathe in oxygen and breathe out carbon dioxide.',
    hints: ['It is not the gas you breathe in.', 'Plants take in this gas to make their food. It is not the one you need.'],
  },
  {
    id: 'lungs-sacs',
    tier: 1,
    kind: 'scan',
    ask: 'Inside your lungs are tiny air sacs, like bunches of grapes. How many are there?',
    right: 'Millions',
    wrong: [
      ['Just two', 'lungs-balloons', 'You have two lungs, but each one is full of tiny air sacs.'],
      ['About ten', 'lungs-balloons', 'Far more than ten. Too many to count!'],
    ],
    explain: 'Your lungs are not empty bags. They are full of millions of tiny air sacs.',
    hints: ['Look at all the bunches around the Micro-Scout. And they are tiny!', 'Each bunch has many sacs, and your lungs hold far more bunches than you can see.'],
  },
  {
    id: 'lungs-nose',
    tier: 1,
    kind: 'scan',
    ask: 'Air goes in through your nose. Your nose has tiny hairs and sticky mucus inside. What do they do?',
    right: 'Trap dust and germs.',
    wrong: [
      ['Add oxygen to the air.', 'wrong-job', 'Your nose does not add oxygen. The air already has it.'],
      ['Help you see.', 'wrong-part', 'Seeing is the job of your eyes.'],
    ],
    explain: 'Hairs and sticky mucus in your nose trap dust and germs before they reach your lungs.',
    hints: ['What happens to a fly that lands on something sticky?', 'It gets stuck. Mucus traps dust and germs the same way.'],
  },
  {
    id: 'lungs-what-is',
    tier: 1,
    kind: 'diagnose',
    ask: 'Sniffles is the flu. Nib scans one. It is tiny and it is not a cell. What is the flu?',
    right: 'A virus',
    wrong: [
      ['Bacteria', 'virus-bacteria', 'Bacteria are living cells. The flu is not a cell.'],
      ['Cold weather', 'cold-weather', 'Weather is not a germ. The flu is caused by a germ.'],
    ],
    explain: 'The flu is caused by a virus. Viruses are much smaller than bacteria.',
    hints: ['There are two kinds of germs in this game: bacteria and viruses.', 'Bacteria are living cells. This germ is not a cell.'],
  },
  {
    id: 'lungs-spread',
    tier: 1,
    kind: 'diagnose',
    ask: 'Commander Ayo caught the flu. How does the flu spread from person to person?',
    right: 'Coughs, sneezes and dirty hands',
    wrong: [
      ['Cold weather', 'cold-weather', 'Cold weather does not make the flu. A virus does.'],
      ['Eating vegetables', 'wrong-job', 'Vegetables do not spread the flu.'],
    ],
    explain: 'The flu virus spreads in tiny drops from coughs and sneezes, and on hands that touch your face.',
    hints: ['Where do the tiny flu viruses come from?', 'From people who have the flu, when they cough, sneeze or touch things.'],
  },
  {
    id: 'lungs-path',
    tier: 2,
    kind: 'scan',
    ask: 'Air goes in your nose. Then it goes down your windpipe. Where does it go next?',
    right: 'Into smaller tubes, then the tiny air sacs.',
    wrong: [
      ['Into your stomach.', 'wrong-part', 'Air goes to the lungs. Food goes to the stomach.'],
      ['Straight into your heart.', 'wrong-order', 'Air goes into the lungs first. Then oxygen moves into the blood.'],
    ],
    explain: 'Nose, then windpipe, then smaller and smaller tubes, then the tiny air sacs.',
    hints: ['The windpipe splits into tubes, like a tree’s branches.', 'The branches end in the tiny air sacs.'],
  },
  {
    id: 'lungs-into-blood',
    tier: 2,
    kind: 'scan',
    ask: 'Tiny blood vessels wrap around each air sac. Oxygen leaves the air sac. Where does it go?',
    right: 'Into the blood',
    wrong: [
      ['Into the stomach', 'wrong-part', 'The stomach is for food, not air.'],
      ['Into the bones', 'wrong-part', 'Bones get oxygen too, but only after something else carries it to them.'],
    ],
    explain: 'Oxygen moves from the air sacs into the blood. The blood carries it all over the body.',
    hints: ['What is wrapped around each air sac?', 'Tiny blood vessels. Oxygen goes into them.'],
  },
  {
    id: 'lungs-diaphragm',
    tier: 2,
    kind: 'scan',
    ask: 'A big muscle under your lungs helps you breathe. It moves down when you breathe in. What is it called?',
    right: 'The diaphragm',
    wrong: [
      ['The heart', 'wrong-part', 'The heart pumps blood. It is not the breathing muscle.'],
      ['The tongue', 'wrong-part', 'The tongue is in your mouth. It helps you eat and talk.'],
    ],
    explain: 'The diaphragm is a big muscle under your lungs. When it moves down, air rushes in.',
    hints: ['Put your hand on your belly and breathe in deeply. It moves!', 'That is the big breathing muscle pulling down under your lungs.'],
  },
  {
    id: 'lungs-cilia',
    tier: 2,
    kind: 'scan',
    ask: 'The airways have tiny hairs called cilia. They wave back and forth all the time. What do they do?',
    right: 'Sweep mucus and germs up and out.',
    wrong: [
      ['Pump air into the lungs.', 'wrong-part', 'The diaphragm pulls air in, not the cilia.'],
      ['Make oxygen.', 'wrong-job', 'Your body does not make oxygen. It comes from the air.'],
    ],
    explain: 'Cilia sweep sticky mucus, with the dust and germs in it, up and out of your airways.',
    hints: ['What do you do with a broom?', 'Cilia work like tiny brooms for mucus.'],
  },
  {
    id: 'lungs-antibiotics',
    tier: 2,
    kind: 'diagnose',
    ask: 'The flu is a virus. Antibiotics are medicines that fight bacteria. Will antibiotics fight the flu?',
    right: 'No. Antibiotics do not work on viruses.',
    wrong: [
      ['Yes. They fight every germ.', 'antibiotics-virus', 'Antibiotics only fight bacteria. The flu is a virus.'],
      ['Yes, if you take a lot.', 'antibiotics-virus', 'More antibiotics do not help against a virus.'],
    ],
    explain: 'Antibiotics fight bacteria, not viruses. The body’s own defenses fight the flu, with rest and care.',
    hints: ['Antibiotics fight which kind of germ?', 'Bacteria. Is the flu bacteria or a virus?'],
  },
  {
    id: 'lungs-hands',
    tier: 2,
    kind: 'diagnose',
    ask: 'Flu viruses can sit on a door handle. You touch it. How can you stop them reaching your nose?',
    right: 'Wash your hands with soap.',
    wrong: [
      ['Rinse your hands with water for a second.', 'water-only', 'A quick rinse leaves most germs behind. Soap and scrubbing work.'],
      ['Wear a warm hat.', 'cold-weather', 'Cold weather does not cause the flu, so a hat does not stop it.'],
    ],
    explain: 'Washing with soap lifts the viruses off your hands before you touch your face.',
    hints: ['The viruses are on your hands now.', 'Get them off your hands: soap and water.'],
  },
  {
    id: 'lungs-cough',
    tier: 3,
    kind: 'scan',
    ask: 'The flu spreads in tiny drops when people cough. Commander Ayo needs to cough. What is the best way?',
    right: 'Into a tissue or an elbow.',
    wrong: [
      ['Into both hands', 'water-only', 'Hands then spread the virus to everything they touch.'],
      ['Out into the air', 'skip-habit', 'The drops spread out to other people.'],
    ],
    explain: 'Coughing into a tissue or your elbow keeps the drops off your hands and away from others.',
    hints: ['After coughing into your hands, what do they touch next?', 'Door handles, toys, other people. Your elbow does not touch those.'],
  },
  {
    id: 'lungs-soap',
    tier: 3,
    kind: 'scan',
    ask: 'Washing hands takes soap and 20 seconds of scrubbing. Why not just a quick rinse with water?',
    right: 'Soap and scrubbing lift the germs off.',
    wrong: [
      ['Water alone kills germs at once.', 'water-only', 'Water alone leaves many germs on your hands.'],
      ['Two seconds is enough.', 'water-only', 'Germs hide between fingers and under nails. It takes time.'],
    ],
    explain: 'Soap and 20 seconds of scrubbing lift germs off, even between fingers. Then the water rinses them away.',
    hints: ['Germs stick to skin. What helps unstick them?', 'Soap, and scrubbing long enough to reach every spot.'],
  },
  {
    id: 'lungs-cold',
    tier: 3,
    kind: 'scan',
    ask: 'Some people say you catch the flu from going out in the cold. Is that true?',
    right: 'No. You catch it from the flu virus.',
    wrong: [
      ['Yes. Cold air makes the flu.', 'cold-weather', 'Cold air cannot make a virus. The flu comes from people who have it.'],
      ['Yes. Wet hair makes the flu.', 'cold-weather', 'Wet hair cannot make a virus.'],
    ],
    explain: 'The flu comes from the flu virus, passed from people who have it. More people get it in winter because they spend more time inside together.',
    hints: ['What causes the flu: weather or a germ?', 'A germ: the flu virus.'],
  },
  {
    id: 'lungs-tired',
    tier: 3,
    kind: 'scan',
    ask: 'The flu makes the airways swollen and full of mucus. Less air reaches the air sacs. Why does Commander Ayo feel tired?',
    right: 'Less oxygen reaches the blood and muscles.',
    wrong: [
      ['The lungs take food away from the body.', 'wrong-job', 'Lungs do not take food. They bring in oxygen.'],
      ['The heart stops beating.', 'wrong-part', 'The heart keeps beating. The problem is in the airways.'],
    ],
    explain: 'Muscles need oxygen. When less oxygen gets through, the body feels tired and weak.',
    hints: ['Where does the oxygen go after the air sacs?', 'Into the blood, and then to the muscles. Less oxygen in means tired muscles.'],
  },
  {
    id: 'lungs-fever',
    tier: 3,
    kind: 'diagnose',
    ask: 'Commander Ayo has a fever. A fever makes the body warmer. What is the fever doing?',
    right: 'Helping the body fight the virus.',
    wrong: [
      ['It is the virus itself.', 'fever-sickness', 'A fever is not a germ. It is the body turning up the heat.'],
      ['It means the lungs are too cold.', 'cold-weather', 'A fever is the body warming up on purpose, not the lungs being cold.'],
    ],
    explain: 'A fever is the body turning up its heat to slow the germs down while the defenses fight.',
    hints: ['Who turns up the heat: the virus or the body?', 'The body does. Why would it want to be warmer?'],
  },
  {
    id: 'lungs-rest',
    tier: 3,
    kind: 'diagnose',
    ask: 'The body’s defenses are fighting the flu. What helps Commander Ayo get better?',
    right: 'Rest, drinks, and staying home.',
    wrong: [
      ['Antibiotics for the virus.', 'antibiotics-virus', 'Antibiotics do not work on viruses like the flu.'],
      ['Running outside in the cold.', 'cold-weather', 'Cold weather does not cure or cause the flu. Rest helps the body fight.'],
    ],
    explain: 'Rest and drinks help the body fight the virus. Staying home keeps it from spreading.',
    hints: ['The body is busy fighting. What helps it most?', 'Giving it a rest. And staying home protects others.'],
  },
];


const GUT: QDef[] = [
  // level 1: name it
  {
    id: 'gut-stomach',
    tier: 1,
    kind: 'scan',
    ask: 'Food goes down a tube into the stomach. The stomach squeezes and churns it. What does the stomach do with food?',
    right: 'It mashes it and mixes it with acid.',
    wrong: [
      ['It sends food to the lungs.', 'wrong-part', 'Food never goes to the lungs. Only air does.'],
      ['It pumps food into the blood at once.', 'wrong-job', 'The stomach does not pump food into the blood. It squeezes and mixes.'],
    ],
    explain: 'The stomach squeezes food and mixes it with a strong acid, until it is a thick mush.',
    hints: ['Look at the folds on the floor. They squeeze and churn.', 'Squeezing, plus a strong juice, turns food into mush.'],
  },
  {
    id: 'gut-start',
    tier: 1,
    kind: 'scan',
    ask: 'Digestion means breaking food down so the body can use it. Where does digestion start?',
    right: 'In the mouth, when you chew.',
    wrong: [
      ['In the stomach.', 'stomach-only', 'Food is already being broken down before it reaches the stomach.'],
      ['In the lungs.', 'wrong-part', 'The lungs are for air, not food.'],
    ],
    explain: 'Digestion starts in the mouth. Teeth chew the food, and saliva starts to break it down.',
    hints: ['What is the very first thing you do with food?', 'You bite. Saliva gets to work too.'],
  },
  {
    id: 'gut-small',
    tier: 1,
    kind: 'scan',
    ask: 'After the stomach, food goes into a long, twisty tube. It is the small intestine. What happens there?',
    right: 'Most of the food is digested and taken in.',
    wrong: [
      ['Nothing. It is just a pipe.', 'stomach-only', 'The small intestine does more digesting than any other part.'],
      ['Food turns into air.', 'wrong-job', 'Food never turns into air. Air comes in through the lungs.'],
    ],
    explain: 'Most digestion happens in the small intestine. Tiny parts of food pass from there into the blood.',
    hints: ['The small intestine is very long. Why would the body need so much tube?', 'A long tube gives lots of time and space to work on food.'],
  },
  {
    id: 'gut-helpers',
    tier: 1,
    kind: 'scan',
    ask: 'Trillions of bacteria live in your gut. Most of them are helpers. What do the helper bacteria do?',
    right: 'Help digest food and keep bad germs out.',
    wrong: [
      ['They make you sick every day.', 'all-germs-bad', 'Most gut bacteria are helpers, not germs that make you sick.'],
      ['They carry oxygen.', 'wrong-job', 'Red blood cells carry oxygen, not bacteria.'],
    ],
    explain: 'Good gut bacteria help break down food, make some vitamins, and leave less room for bad germs.',
    hints: ['Look at the green bean-shaped cells. Do they look friendly?', 'They are on our side, working with the gut.'],
  },
  {
    id: 'gut-louie',
    tier: 1,
    kind: 'diagnose',
    ask: 'Queasy Louie is a living cell, much bigger than a virus. Some come in food that is not cooked well. What is Queasy Louie?',
    right: 'Bacteria.',
    wrong: [
      ['A virus, like the flu.', 'virus-bacteria', 'Viruses are much smaller, and they are not cells.'],
      ['A good gut helper.', 'helper-or-germ', 'Queasy Louie upsets the stomach. Helpers do not.'],
    ],
    explain: 'Queasy Louie is bacteria: a tiny living cell. Some kinds make the stomach sick.',
    hints: ['Is it a living cell, or something much smaller?', 'We met living germ cells like this in the scrape and the mouth.'],
  },
  {
    id: 'gut-hands',
    tier: 1,
    kind: 'diagnose',
    ask: 'Queasy Louie can ride on unwashed hands. Then it gets onto food. How can you stop Queasy Louie?',
    right: 'Wash your hands before you eat.',
    wrong: [
      ['Eat faster.', 'skip-habit', 'Eating fast does not get germs off your hands.'],
      ['Skip washing if your hands look clean.', 'skip-habit', 'Germs are too small to see, so clean-looking hands can still have them.'],
    ],
    explain: 'Washing with soap before eating keeps germs from riding on your hands into your mouth.',
    hints: ['How do the germs get from your hands to your mouth?', 'On your food. What gets germs off your hands first?'],
  },
  // level 2: how it works
  {
    id: 'gut-path',
    tier: 2,
    kind: 'scan',
    ask: 'Food goes on a long trip through the body. It passes through four parts. Which order is right?',
    right: 'Mouth, stomach, small intestine, large intestine.',
    wrong: [
      ['Stomach, mouth, large intestine, small intestine.', 'wrong-order', 'The trip starts where food goes in.'],
      ['Mouth, lungs, stomach, heart.', 'wrong-part', 'Food never goes into the lungs or the heart.'],
    ],
    explain: 'Food goes from the mouth to the stomach, then the small intestine, then the large intestine.',
    hints: ['Where does food go in?', 'After the mouth, food slides down to the stomach. What comes after that?'],
  },
  {
    id: 'gut-acid',
    tier: 2,
    kind: 'scan',
    ask: 'The stomach makes a strong acid. It helps break down food. What else does the acid do?',
    right: 'It kills many germs in food.',
    wrong: [
      ['It makes food taste sweet.', 'wrong-job', 'Taste happens on the tongue, not in the stomach.'],
      ['It turns food into blood.', 'wrong-job', 'Food is not turned into blood. Tiny food parts go into the blood later.'],
    ],
    explain: 'Stomach acid helps break down food, and it kills many of the germs that come in with it.',
    hints: ['Germs can come in with food. What happens to them in a strong acid?', 'Strong acid is very hard on tiny living things.'],
  },
  {
    id: 'gut-large',
    tier: 2,
    kind: 'scan',
    ask: 'The large intestine comes last. Most food is already taken in by then. What does the large intestine take back?',
    right: 'Water.',
    wrong: [
      ['Oxygen.', 'wrong-job', 'Oxygen comes in through the lungs.'],
      ['All the food.', 'stomach-only', 'Most of the food was taken in earlier, in the small intestine.'],
    ],
    explain: 'The large intestine takes back water. What is left leaves the body as waste.',
    hints: ['The body needs to keep this, or you get thirsty.', 'What do you drink every day?'],
  },
  {
    id: 'gut-villi',
    tier: 2,
    kind: 'scan',
    ask: 'The small intestine is covered in tiny finger-like bumps. They are called villi. Why are there so many bumps?',
    right: 'They give more room to take in food.',
    wrong: [
      ['They chew the food.', 'wrong-job', 'Teeth chew. The intestine has no teeth.'],
      ['They push air through.', 'wrong-part', 'Air goes through the airways, not the intestine.'],
    ],
    explain: 'Millions of villi make a huge surface, so lots of food can pass into the blood.',
    hints: ['A towel with lots of loops soaks up more. Why?', 'More bumps mean more surface touching the food.'],
  },
  {
    id: 'gut-protect',
    tier: 2,
    kind: 'diagnose',
    ask: 'Good bacteria live right next to Queasy Louie’s gang. The good ones help digestion. Should we clear out every bacterium here?',
    right: 'No. Only the germs, and keep the helpers safe.',
    wrong: [
      ['Yes. All bacteria are bad.', 'all-germs-bad', 'Most gut bacteria are helpers.'],
      ['Yes, and the stomach lining too.', 'wrong-job', 'The stomach lining is part of the body. We only go after germs.'],
    ],
    explain: 'Most gut bacteria are helpers. We clear out the germs and leave the helpers to do their work.',
    hints: ['Are all bacteria the same?', 'Some make you sick. Others help digest food.'],
  },
  {
    id: 'gut-sick',
    tier: 2,
    kind: 'diagnose',
    ask: 'Queasy Louie upsets the stomach. Commander Ayo throws up. Why does the body do that?',
    right: 'To push the germs out fast.',
    wrong: [
      ['Because the stomach is empty.', 'wrong-job', 'An empty stomach does not make you throw up. The germs do.'],
      ['Because the lungs are sick.', 'wrong-part', 'The lungs are fine. The trouble is in the gut.'],
    ],
    explain: 'Throwing up is one way the body gets rid of germs quickly. Sips of water help afterwards.',
    hints: ['What does the body want to do with the germs?', 'Get rid of them, as quickly as it can.'],
  },
  // level 3: cause and effect
  {
    id: 'gut-energy',
    tier: 3,
    kind: 'scan',
    ask: 'The small intestine passes food into the blood. The blood carries it everywhere. What would happen if the small intestine stopped working?',
    right: 'The body would not get enough food energy.',
    wrong: [
      ['Nothing. The stomach would do it all.', 'stomach-only', 'The stomach cannot pass most food into the blood.'],
      ['The lungs would digest food.', 'wrong-part', 'The lungs never digest food.'],
    ],
    explain: 'Food energy reaches the body through the small intestine. Without it, the muscles and brain would go short.',
    hints: ['Where does food get into the blood?', 'If that part stops, how does energy reach the muscles?'],
  },
  {
    id: 'gut-legs',
    tier: 3,
    kind: 'scan',
    ask: 'Tiny food parts go into the blood. The heart pumps that blood. How does food energy get to your leg muscles?',
    right: 'The blood carries it there.',
    wrong: [
      ['The stomach sends it down a tube.', 'wrong-part', 'There is no tube from the stomach to the legs.'],
      ['Nerves carry the food.', 'wrong-job', 'Nerves carry messages, not food.'],
    ],
    explain: 'The gut and the blood work as a team: food goes into the blood, and the heart pumps it to every muscle.',
    hints: ['What flows to every part of the body?', 'The heart pumps it round and round.'],
  },
  {
    id: 'gut-antibiotics',
    tier: 3,
    kind: 'scan',
    ask: 'Antibiotics are medicines that kill bacteria. A doctor gives them only when needed. Why not take them for every tummy ache?',
    right: 'They can harm the good gut bacteria too.',
    wrong: [
      ['They fight viruses best.', 'antibiotics-virus', 'Antibiotics do not work on viruses at all.'],
      ['They always make you stronger.', 'wrong-job', 'Medicine is only for when a doctor says it is needed.'],
    ],
    explain: 'Antibiotics cannot tell bad bacteria from good ones, so they are used only when a doctor says so.',
    hints: ['Antibiotics kill bacteria. Which bacteria live in the gut?', 'Helpers live there too.'],
  },
  {
    id: 'gut-fiber',
    tier: 3,
    kind: 'scan',
    ask: 'Fruits, vegetables and beans have fiber. The good gut bacteria feed on fiber. What happens when you eat fiber?',
    right: 'The helper bacteria stay strong.',
    wrong: [
      ['The helper bacteria go away.', 'all-germs-bad', 'Fiber is food for the helpers, so they stay.'],
      ['Your lungs work harder.', 'wrong-part', 'Fiber is for the gut, not the lungs.'],
    ],
    explain: 'Fiber feeds the good gut bacteria, and a strong team of helpers keeps the gut healthy.',
    hints: ['Fiber is food. Food for whom?', 'When the helpers are well fed, what happens to them?'],
  },
  {
    id: 'gut-cook',
    tier: 3,
    kind: 'diagnose',
    ask: 'Queasy Louie can hide in raw meat and eggs. Heat kills these germs. What is the safest way to eat chicken?',
    right: 'Cook it all the way through.',
    wrong: [
      ['Eat it pink in the middle.', 'skip-habit', 'Germs can live in the pink middle.'],
      ['Wash it in the sink.', 'water-only', 'Washing raw meat splashes germs around. Heat is what kills them.'],
    ],
    explain: 'Cooking chicken all the way through kills the germs inside. A grown-up can check it is done.',
    hints: ['What kills the germs?', 'Heat has to reach the very middle.'],
  },
  {
    id: 'gut-fridge',
    tier: 3,
    kind: 'diagnose',
    ask: 'Germs grow fast in warm food. Cold slows them down. Where should leftovers go after dinner?',
    right: 'In the fridge.',
    wrong: [
      ['On the counter all night.', 'skip-habit', 'A warm room lets germs grow fast.'],
      ['In a warm oven until morning.', 'skip-habit', 'Warmth helps germs grow. It does not stop them.'],
    ],
    explain: 'Cold slows germs down, so leftovers go somewhere cold soon after the meal.',
    hints: ['Do germs grow faster when it is warm or cold?', 'Put the food somewhere cold.'],
  },
];

const HEART: QDef[] = [
  // level 1: name it
  {
    id: 'heart-pump',
    tier: 1,
    kind: 'scan',
    ask: 'The heart is a strong muscle in your chest. It beats all day and all night. What does the heart do?',
    right: 'It pumps blood all around the body.',
    wrong: [
      ['It breathes air in.', 'wrong-part', 'Breathing is the job of the lungs.'],
      ['It thinks your thoughts.', 'wrong-part', 'Thinking happens in the brain.'],
    ],
    explain: 'The heart is a pump. Every beat pushes blood out to the whole body.',
    hints: ['Put a hand on your chest. What do you feel?', 'A beat. Each beat pushes something along.'],
  },
  {
    id: 'heart-red',
    tier: 1,
    kind: 'scan',
    ask: 'Look at the red discs floating by. They are red blood cells. What do red blood cells carry?',
    right: 'Oxygen.',
    wrong: [
      ['Germs, on purpose.', 'helper-or-germ', 'Red blood cells do not carry germs on purpose.'],
      ['Food to the stomach.', 'wrong-job', 'Food goes down from the mouth. Red cells do not carry it there.'],
    ],
    explain: 'Red blood cells pick up oxygen in the lungs and carry it to every part of the body.',
    hints: ['What do your lungs breathe in that the whole body needs?', 'The air sacs pass it into the blood, and these cells take it everywhere.'],
  },
  {
    id: 'heart-white',
    tier: 1,
    kind: 'scan',
    ask: 'Some blood cells are white and puffy. They are white blood cells. What do they do?',
    right: 'Fight germs.',
    wrong: [
      ['Carry oxygen.', 'wrong-job', 'The red cells are the ones that carry oxygen.'],
      ['Make the heart beat.', 'wrong-job', 'The heart muscle makes itself beat.'],
    ],
    explain: 'White blood cells are the body’s guards. They find germs and get rid of them.',
    hints: ['They chase anything that does not belong in the body.', 'They are like the body’s guards.'],
  },
  {
    id: 'heart-color',
    tier: 1,
    kind: 'scan',
    ask: 'Veins can look blue through your skin. Some people say the blood inside is blue. What color is your blood?',
    right: 'Always red.',
    wrong: [
      ['Blue in the veins.', 'blue-blood', 'Veins only look blue through skin. The blood inside them is red too.'],
      ['Green.', 'blue-blood', 'Human blood is never green.'],
    ],
    explain: 'Blood is always red: bright red with lots of oxygen, darker red with less. Veins only look blue through skin.',
    hints: ['Look around this blood vessel. What color are the cells?', 'The color gets a little darker or brighter, but it stays in one color family.'],
  },
  {
    id: 'heart-bandit',
    tier: 1,
    kind: 'diagnose',
    ask: 'The Blood Bandit got into the blood through a cut. Now it rides around the body. Which cells rush to fight it?',
    right: 'White blood cells.',
    wrong: [
      ['Red blood cells.', 'helper-or-germ', 'Red cells carry oxygen. They are not the fighters.'],
      ['Good gut bacteria.', 'helper-or-germ', 'Gut bacteria stay in the gut. They do not ride in the blood to fight.'],
    ],
    explain: 'White blood cells rush to germs in the blood and fight them.',
    hints: ['Which cells are the body’s guards?', 'They are puffy and pale, not red.'],
  },
  {
    id: 'heart-cuts',
    tier: 1,
    kind: 'diagnose',
    ask: 'Germs can get into the blood through an open cut. How can you keep the Blood Bandit out?',
    right: 'Clean and cover cuts.',
    wrong: [
      ['Pick at scabs.', 'pick-scab', 'Picking a scab opens the cut again.'],
      ['Leave cuts dirty.', 'heals-itself', 'Dirt in a cut lets germs in.'],
    ],
    explain: 'A clean, covered cut keeps germs out of the blood while the skin heals.',
    hints: ['Remember the scraped knee?', 'What did we do for the knee in the med bay?'],
  },
  // level 2: how it works
  {
    id: 'heart-lungs',
    tier: 2,
    kind: 'scan',
    ask: 'Blood goes from the heart to the body and back. Then it goes to the lungs. Why does blood visit the lungs?',
    right: 'To pick up fresh oxygen.',
    wrong: [
      ['To get food.', 'wrong-job', 'Blood picks up food in the small intestine.'],
      ['To be cleaned of all germs.', 'wrong-job', 'The lungs swap air. That is not where germs are cleaned out.'],
    ],
    explain: 'In the lungs, the blood drops off carbon dioxide and picks up oxygen. Then the heart pumps it out again.',
    hints: ['What do the lungs bring into the body?', 'The blood stops by to fill up on it.'],
  },
  {
    id: 'heart-chambers',
    tier: 2,
    kind: 'scan',
    ask: 'The heart has four rooms inside, called chambers. The two top ones fill up. What do the two bottom ones do?',
    right: 'Squeeze to pump the blood out.',
    wrong: [
      ['Hold air.', 'wrong-part', 'Air stays in the lungs. The heart is full of blood.'],
      ['Digest food.', 'wrong-job', 'Digesting happens in the gut.'],
    ],
    explain: 'The top chambers fill up, and the strong bottom chambers squeeze to push the blood out.',
    hints: ['The heart is a pump. What does a pump do?', 'The bottom rooms have the strongest walls. They push hard.'],
  },
  {
    id: 'heart-valves',
    tier: 2,
    kind: 'scan',
    ask: 'The heart has little doors called valves. They open one way, then shut. Why do the valves shut behind the blood?',
    right: 'So blood only flows one way.',
    wrong: [
      ['To stop the heart.', 'wrong-job', 'Valves do not stop the heart. It keeps beating.'],
      ['To keep germs out.', 'wrong-job', 'Valves are for the flow, not for germs.'],
    ],
    explain: 'Valves are one-way doors. They shut so the blood cannot slosh backward.',
    hints: ['Feel how the flow pushes us. Does it ever go backward?', 'A door that only opens one way stops things going back.'],
  },
  {
    id: 'heart-pulse',
    tier: 2,
    kind: 'scan',
    ask: 'Press two fingers on your wrist. You can feel a beat there. What is that beat?',
    right: 'Blood pushed by each heartbeat.',
    wrong: [
      ['Air in your arm.', 'wrong-part', 'Arms do not have air in them.'],
      ['Your bones moving.', 'wrong-part', 'Bones do not beat. The beat comes from the chest.'],
    ],
    explain: 'That beat is your pulse. Each squeeze of the heart sends a push of blood all the way to your wrist.',
    hints: ['Where does the beat start?', 'Each squeeze in your chest sends a push all the way down your arm.'],
  },
  {
    id: 'heart-marrow',
    tier: 2,
    kind: 'diagnose',
    ask: 'White blood cells are fighting the Blood Bandit. The body makes more of them. Where are new blood cells made?',
    right: 'Inside the bones, in the marrow.',
    wrong: [
      ['In the stomach.', 'wrong-part', 'The stomach digests food. It does not make blood cells.'],
      ['In the lungs.', 'wrong-part', 'The lungs swap air. New blood cells come from somewhere else.'],
    ],
    explain: 'New blood cells are made in bone marrow, the soft middle of many bones.',
    hints: ['They are made somewhere hard on the outside and soft on the inside.', 'Your skeleton is not just for holding you up.'],
  },
  {
    id: 'heart-antibody',
    tier: 2,
    kind: 'diagnose',
    ask: 'White blood cells make antibodies. An antibody fits only one germ, like a key in a lock. What does an antibody do?',
    right: 'Sticks to its germ so the body can find it.',
    wrong: [
      ['Sticks to every cell.', 'helper-or-germ', 'An antibody fits only one kind of germ.'],
      ['Carries oxygen.', 'wrong-job', 'Red blood cells carry oxygen.'],
    ],
    explain: 'An antibody locks onto one kind of germ. That marks it, so white blood cells can find it fast.',
    hints: ['A key fits only one lock. What does that tell you?', 'It marks just one kind of germ.'],
  },
  // level 3: cause and effect
  {
    id: 'heart-run',
    tier: 3,
    kind: 'scan',
    ask: 'When you run, your muscles need more oxygen. Your heart beats faster. Why does the heart speed up?',
    right: 'To send more blood and oxygen to the muscles.',
    wrong: [
      ['Because the heart is tired.', 'heart-tired', 'A faster beat is not tiredness. The heart is working harder on purpose.'],
      ['To cool the lungs.', 'wrong-job', 'The heart does not cool the lungs.'],
    ],
    explain: 'Running muscles need more oxygen. A faster heartbeat sends them more blood, and more oxygen with it.',
    hints: ['What do running muscles need more of?', 'More blood brings more of it.'],
  },
  {
    id: 'heart-strong',
    tier: 3,
    kind: 'scan',
    ask: 'Exercise makes the heart muscle stronger. A strong heart pumps more blood with each beat. What can a strong heart do at rest?',
    right: 'Beat more slowly.',
    wrong: [
      ['Stop for a while.', 'heart-tired', 'A healthy heart never stops to rest. It beats all life long.'],
      ['Beat much faster.', 'wrong-job', 'A strong heart pushes more blood each beat, so it needs fewer beats.'],
    ],
    explain: 'A strong heart moves more blood with every beat, so at rest it can beat more slowly.',
    hints: ['More blood each beat means how many beats are needed?', 'Think about fewer, bigger pushes.'],
  },
  {
    id: 'heart-team',
    tier: 3,
    kind: 'scan',
    ask: 'The lungs put oxygen into the blood. The heart pumps that blood. What happens if the heart is weak?',
    right: 'Less oxygen gets to the body.',
    wrong: [
      ['The lungs stop breathing.', 'wrong-part', 'The lungs keep breathing. The trouble is the pumping.'],
      ['Nothing changes.', 'heals-itself', 'The body needs the heart to move oxygen around.'],
    ],
    explain: 'The lungs and the heart are a team. If the pump is weak, less oxygen reaches the muscles and the brain.',
    hints: ['Who carries the oxygen from the lungs to the body?', 'If the pump is weak, how much arrives?'],
  },
  {
    id: 'heart-rest',
    tier: 3,
    kind: 'scan',
    ask: 'Heart muscle does not get tired like leg muscles. It rests a tiny bit between beats. When does the heart stop for a long rest?',
    right: 'Never. It keeps beating all life long.',
    wrong: [
      ['At night, while you sleep.', 'heart-tired', 'The heart beats all night, just more slowly.'],
      ['After lunch.', 'heart-tired', 'The heart keeps beating after meals too.'],
    ],
    explain: 'The heart rests only for a moment between beats. It slows down at night, but it never stops.',
    hints: ['Can you feel your pulse while you sleep?', 'It slows down at night. Does it stop?'],
  },
  {
    id: 'heart-spread',
    tier: 3,
    kind: 'diagnose',
    ask: 'The Blood Bandit rides in the blood. Blood reaches every part of the body. Why is a germ in the blood a big problem?',
    right: 'It can travel everywhere the blood goes.',
    wrong: [
      ['It can only stay in one place.', 'wrong-job', 'Blood moves, so a germ in it moves too.'],
      ['Germs in the blood are always harmless.', 'heals-itself', 'Germs in the blood need the body’s defenses, and sometimes a doctor.'],
    ],
    explain: 'Blood flows to every part of the body, so a germ riding in it can reach anywhere.',
    hints: ['Where does blood go?', 'Think of a germ on a bus that stops at every town.'],
  },
  {
    id: 'heart-doctor',
    tier: 3,
    kind: 'diagnose',
    ask: 'Some germs in the blood are serious. The body might need extra help. What should Commander Ayo do about a hot, swollen cut and a fever?',
    right: 'Tell a doctor or a grown-up.',
    wrong: [
      ['Hide it and wait.', 'heals-itself', 'Some infections need a doctor. Waiting can make them worse.'],
      ['Pick the scab off.', 'pick-scab', 'Picking the scab opens the cut and lets more germs in.'],
    ],
    explain: 'A hot, swollen cut with a fever needs a doctor. Telling a grown-up is always the right move.',
    hints: ['Who can help when the body needs extra help?', 'Saying how you feel is always okay.'],
  },
];

const BRAIN: QDef[] = [
  // level 1: name it (the nerve relays of the finale)
  {
    id: 'brain-control',
    tier: 1,
    kind: 'scan',
    ask: 'The brain sits inside your head. It sends messages to every part of the body. What is the brain’s main job?',
    right: 'It is the control center.',
    wrong: [
      ['It pumps blood.', 'wrong-part', 'Pumping blood is the heart’s job.'],
      ['It digests food.', 'wrong-part', 'Digesting happens in the gut.'],
    ],
    explain: 'The brain is the body’s control center. It sends orders and gets news from every part.',
    hints: ['Who gives the orders in the body?', 'Like the captain of a ship.'],
  },
  {
    id: 'brain-nerves',
    tier: 1,
    kind: 'scan',
    ask: 'Nerves are like long wires all through your body. Look at the glowing paths here. What do nerves carry?',
    right: 'Messages to and from the brain.',
    wrong: [
      ['Food.', 'wrong-job', 'Food travels through the gut and the blood.'],
      ['Air.', 'wrong-part', 'Air goes through the airways.'],
    ],
    explain: 'Nerves carry messages, super fast, between the brain and every part of the body.',
    hints: ['Watch the sparks race along the paths.', 'Each spark is a tiny signal going somewhere.'],
  },
  {
    id: 'brain-skull',
    tier: 1,
    kind: 'scan',
    ask: 'The brain is soft. A hard bone covers it, called the skull. What does the skull do?',
    right: 'It protects the brain.',
    wrong: [
      ['It thinks for you.', 'wrong-part', 'The skull is bone. The brain does the thinking.'],
      ['It pumps blood to the head.', 'wrong-part', 'The heart pumps the blood.'],
    ],
    explain: 'The skull is a hard shell of bone that keeps the soft brain safe. A helmet helps it on a bike.',
    hints: ['What does a helmet do?', 'Hard bone keeps something soft safe.'],
  },
  {
    id: 'brain-senses',
    tier: 1,
    kind: 'scan',
    ask: 'Your eyes, ears, nose, tongue and skin notice things. They send messages to the brain. What does the brain do with them?',
    right: 'Works out what you see, hear and feel.',
    wrong: [
      ['Throws them away.', 'wrong-job', 'The brain uses every message to make sense of the world.'],
      ['Turns them into food.', 'wrong-job', 'Messages are not food.'],
    ],
    explain: 'Your senses collect the news. The brain puts it together, so you know what is going on.',
    hints: ['Who decides what a sound means?', 'The ears catch the sound. Something else understands it.'],
  },
  {
    id: 'brain-gang',
    tier: 1,
    kind: 'diagnose',
    ask: 'The whole Grime Gang is here: bacteria and viruses together. The body’s defenses are ready. What is the best plan?',
    right: 'Every defense works together.',
    wrong: [
      ['Only one defense should fight.', 'wrong-job', 'The body is strongest when its parts team up.'],
      ['Let the germs stay.', 'heals-itself', 'The germs will not leave on their own.'],
    ],
    explain: 'The body fights best as a team: skin, mucus, saliva, stomach acid and white blood cells, all led by the brain.',
    hints: ['Think of all the helpers we met.', 'Skin, mucus, saliva, white blood cells. What if they all joined in?'],
  },
  {
    id: 'brain-tell',
    tier: 1,
    kind: 'diagnose',
    ask: 'Commander Ayo feels sick. The brain notices something is wrong. What is the best thing to do when you feel sick?',
    right: 'Tell a grown-up.',
    wrong: [
      ['Keep it a secret.', 'heals-itself', 'A grown-up can help you get better.'],
      ['Go to school and play hard.', 'skip-habit', 'Rest helps the body fight, and staying home keeps germs from spreading.'],
    ],
    explain: 'Feeling sick is normal, and nobody is to blame. Telling a grown-up gets you help and rest.',
    hints: ['Who can help you when you are sick?', 'Saying how you feel is always okay.'],
  },
  // level 2: how it works
  {
    id: 'brain-hot',
    tier: 2,
    kind: 'scan',
    ask: 'You touch a hot pan. Your hand pulls away before you even think. How does that happen?',
    right: 'Nerves send a super-fast message.',
    wrong: [
      ['The hand decides by itself.', 'wrong-job', 'Hands do not think. Nerves and the spinal cord do the work.'],
      ['The heart pulls the hand back.', 'wrong-part', 'The heart pumps blood. It does not move your hand.'],
    ],
    explain: 'Nerves in your skin send a message to the spinal cord, and a message races straight back to pull your hand away.',
    hints: ['What carries messages very fast?', 'The glowing paths here race signals in a flash.'],
  },
  {
    id: 'brain-kick',
    tier: 2,
    kind: 'scan',
    ask: 'The brain sends orders to the muscles. You decide to kick a ball. Which path does the message take?',
    right: 'Brain, then nerves, then leg muscles.',
    wrong: [
      ['Leg muscles, then brain, then nerves.', 'wrong-order', 'The message starts where the decision is made.'],
      ['Stomach, then heart, then leg.', 'wrong-part', 'Messages travel along nerves, not through the stomach.'],
    ],
    explain: 'The brain decides, the nerves carry the order, and the leg muscles do the kicking.',
    hints: ['Where is the decision made?', 'The message travels along the wires to the part that moves.'],
  },
  {
    id: 'brain-auto',
    tier: 2,
    kind: 'scan',
    ask: 'You do not have to think about breathing. You do not think about your heartbeat either. Who keeps them going?',
    right: 'The brain, without you noticing.',
    wrong: [
      ['Nobody. They just happen.', 'brain-thinking-only', 'The brain runs them, even while you sleep.'],
      ['The stomach.', 'wrong-part', 'The stomach digests. It does not run breathing.'],
    ],
    explain: 'The brain does much more than thinking. It runs breathing and the heartbeat all the time, even in your sleep.',
    hints: ['Who is the control center?', 'It works even when you are asleep.'],
  },
  {
    id: 'brain-sleep',
    tier: 2,
    kind: 'scan',
    ask: 'Sleep gives the brain time to rest and sort out the day. Kids need lots of sleep. What happens with too little sleep?',
    right: 'It is harder to think and to fight germs.',
    wrong: [
      ['Nothing. Sleep does not matter.', 'skip-habit', 'The brain and the body’s defenses both need sleep.'],
      ['You grow extra muscles.', 'wrong-job', 'Missing sleep does not grow muscles.'],
    ],
    explain: 'Sleep helps the brain learn and helps the body’s defenses stay strong.',
    hints: ['How do you feel after a very late night?', 'A tired brain and tired defenses both work less well.'],
  },
  {
    id: 'brain-fever',
    tier: 2,
    kind: 'diagnose',
    ask: 'The brain can turn up the body’s heat when germs attack. This is called a fever. Why does the brain do it?',
    right: 'Heat slows the germs down.',
    wrong: [
      ['The fever is the germ.', 'fever-sickness', 'A fever is the body’s own move, not a germ.'],
      ['The body is broken.', 'fever-sickness', 'A fever is on purpose. The body is fighting back.'],
    ],
    explain: 'A fever makes the body too warm for many germs, and it helps the white blood cells work.',
    hints: ['Who turns up the heat: the germs or the brain?', 'Many germs do not like it too warm.'],
  },
  {
    id: 'brain-guards',
    tier: 2,
    kind: 'diagnose',
    ask: 'The brain notices the germs. Then the body sends its guards. Which cells rush to the germs?',
    right: 'White blood cells.',
    wrong: [
      ['Red blood cells.', 'helper-or-germ', 'Red cells carry oxygen. They do not fight germs.'],
      ['Skin cells.', 'wrong-part', 'Skin cells make the outside wall. They stay put.'],
    ],
    explain: 'White blood cells are the guards. They ride in the blood to wherever the germs are.',
    hints: ['They are the body’s guards.', 'Puffy and pale, and they ride in the blood.'],
  },
  // level 3: cause and effect across the body
  {
    id: 'brain-oxygen',
    tier: 3,
    kind: 'scan',
    ask: 'The brain uses lots of oxygen. Oxygen comes in through the lungs and rides in the blood. What happens if the brain gets too little?',
    right: 'It cannot work well.',
    wrong: [
      ['It works better.', 'wrong-job', 'The brain needs oxygen every moment.'],
      ['The stomach gives it oxygen.', 'wrong-part', 'Oxygen comes from the lungs, not the stomach.'],
    ],
    explain: 'The lungs, the heart and the brain are one team. Without enough oxygen, the brain gets slow and tired.',
    hints: ['What does every working part of the body need?', 'Without enough, the brain gets slow and tired.'],
  },
  {
    id: 'brain-boss',
    tier: 3,
    kind: 'scan',
    ask: 'Lungs bring in oxygen. The heart pumps it. The gut brings in food. Which part runs the whole team?',
    right: 'The brain and nerves.',
    wrong: [
      ['The skin.', 'wrong-part', 'The skin is the wall. It does not give the orders.'],
      ['The teeth.', 'wrong-part', 'Teeth chew. They do not run the body.'],
    ],
    explain: 'The brain and nerves link every body system, so they all work together.',
    hints: ['Who sends messages everywhere?', 'The glowing paths start here.'],
  },
  {
    id: 'brain-sleepy',
    tier: 3,
    kind: 'scan',
    ask: 'When you are sick, you often feel sleepy. The brain makes you feel that way. Why?',
    right: 'So you rest and the defenses can work.',
    wrong: [
      ['Because the brain is broken.', 'brain-thinking-only', 'The brain is fine. Feeling sleepy is part of its plan.'],
      ['So the germs can win.', 'wrong-job', 'The brain is always on the body’s side.'],
    ],
    explain: 'Feeling sleepy makes you rest. Resting saves energy for the body’s fight against the germs.',
    hints: ['What helps the body fight germs?', 'Resting saves energy for the fight.'],
  },
  {
    id: 'brain-sneeze',
    tier: 3,
    kind: 'scan',
    ask: 'Germs tickle the inside of the nose. Nerves tell the brain. What does the brain make you do?',
    right: 'Sneeze to blow them out.',
    wrong: [
      ['Blink.', 'wrong-part', 'Blinking protects the eyes, not the nose.'],
      ['Hiccup.', 'wrong-job', 'Hiccups come from the muscle under the lungs, not from germs in the nose.'],
    ],
    explain: 'A sneeze blasts the germs out of the nose. Sneeze into your elbow, so they do not reach other people.',
    hints: ['What happens when your nose tickles?', 'It is a big, sudden blast of air.'],
  },
  {
    id: 'brain-wall',
    tier: 3,
    kind: 'diagnose',
    ask: 'The body has many defenses: skin, mucus, saliva, stomach acid and white blood cells. Which one is the first wall against germs?',
    right: 'The skin.',
    wrong: [
      ['White blood cells.', 'wrong-order', 'White blood cells fight germs that already got in.'],
      ['Stomach acid.', 'wrong-order', 'Acid only meets germs that were swallowed.'],
    ],
    explain: 'The skin keeps most germs out in the first place. The other defenses fight the ones that get past.',
    hints: ['What covers the whole outside of you?', 'It was our very first mission.'],
  },
  {
    id: 'brain-habits',
    tier: 3,
    kind: 'diagnose',
    ask: 'Commander Ayo is well again. Healthy habits keep germs away. Which one is a set of healthy habits?',
    right: 'Wash hands, brush teeth and sleep well.',
    wrong: [
      ['Skip washing if hands look clean.', 'skip-habit', 'Germs are too small to see.'],
      ['Eat candy instead of brushing.', 'sugar-ok', 'Sugar feeds the cavity bacteria.'],
    ],
    explain: 'Washing hands, brushing teeth, cooking food well, staying active and sleeping well all keep the Grime Gang away.',
    hints: ['Think about the habit games we played.', 'Each mission ended with one. Which choice has three of them?'],
  },
];

const BANKS: Record<Mission, QDef[]> = { skin: SKIN, mouth: MOUTH, lungs: LUNGS, gut: GUT, heart: HEART, brain: BRAIN };

// ------------------------------------------------------------------ picking questions

export type Rand = () => number;
export function shuffle<T>(r: Rand, list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Every question for a mission (for tests and the grown-ups page). */
export function bank(m: Mission): QDef[] {
  return BANKS[m];
}

function build(m: Mission, d: QDef, r: Rand): Question {
  const choices: Choice[] = shuffle(r, [{ value: d.right, label: d.right, correct: true }, ...d.wrong.map(([label, mis, why]): Choice => ({ value: label, label, correct: false, misconception: mis, why }))]);
  return { id: d.id, mission: m, tier: d.tier, kind: d.kind, ask: d.ask, choices, explain: d.explain, hints: d.hints };
}

/**
 * A question for this mission, level and kind, avoiding the ids in `recent`
 * where it can (so a child sees every question before any comes back).
 */
export function makeQuestion(m: Mission, tier: Tier, kind: Kind, r: Rand, recent: readonly string[] = []): Question {
  const pool = bank(m).filter((d) => d.tier === tier && d.kind === kind);
  if (!pool.length) throw new Error(`No ${kind} questions for ${m} at level ${tier}`);
  const fresh = pool.filter((d) => !recent.includes(d.id));
  const from = fresh.length ? fresh : pool;
  return build(m, from[Math.floor(r() * from.length) % from.length], r);
}
