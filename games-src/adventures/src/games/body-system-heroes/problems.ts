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
/** The missions built so far (half 1 of the build). */
export const OPEN_MISSIONS: Mission[] = ['skin', 'mouth', 'lungs'];
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
  | 'lungs-balloons'; // thinks the lungs are two empty bags

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

const BANKS: Partial<Record<Mission, QDef[]>> = { skin: SKIN, mouth: MOUTH, lungs: LUNGS };

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
  return BANKS[m] ?? [];
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
