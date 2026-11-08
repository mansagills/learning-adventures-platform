import Container from '@/components/Container';
import { games } from '@/lib/content/games';
import UiIcon from '@/components/icons/UiIcon';

const faqs = [
  {
    question: 'What is Learning Adventures?',
    answer: `A collection of ${games.length} free mini-games and activities for kids in grades K–5, organized by subject: math, science, reading and history.`,
  },
  {
    question: 'Is it really free? Do we need an account?',
    answer:
      'Yes. Every game on this site is free to play, with no sign-up and no account. Just pick a game and press play.',
  },
  {
    question: 'What devices does it work on?',
    answer:
      'Everything runs in a web browser, so there’s nothing to install. Games work best on a computer or tablet; many also work on phones.',
  },
  {
    question: 'Is it safe for kids?',
    answer:
      'Kids can play every game without creating an account or entering any personal information, and there’s no way to chat with other players.',
  },
];

export default function HomeFaq() {
  return (
    <section id="faq" className="py-20" aria-labelledby="faq-heading">
      <Container size="sm">
        <h2
          id="faq-heading"
          className="text-center font-display text-3xl font-extrabold text-ink-900 md:text-4xl"
        >
          Questions from parents
        </h2>
        <div className="mt-10 space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border-2 border-pg-border bg-white px-5 py-4 shadow-pop-active open:shadow-pop"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
                {faq.question}
                <UiIcon
                  name="chevron-down"
                  size={20}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-ink-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
