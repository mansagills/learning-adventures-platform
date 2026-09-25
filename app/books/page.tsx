import Container from '@/components/Container';
import BookCard from '@/components/books/BookCard';
import { books } from '@/lib/content/books';
import { generateMetadata as seoMetadata } from '@/lib/seo';

export const metadata = seoMetadata({
  title: 'Interactive Ebooks for Kids | Learning Adventures',
  description:
    'Children’s interactive ebooks set in the world of our learning games. Read a free sample, then play the games that go with each story.',
  path: '/books',
});

const steps = [
  {
    emoji: '👀',
    title: 'Read a free sample',
    text: 'Flip through the first pages of any book right here on the site.',
  },
  {
    emoji: '📖',
    title: 'Get the interactive ebook',
    text: 'Buy and read the full story in our interactive ebook reader.',
  },
  {
    emoji: '🎮',
    title: 'Play the games',
    text: 'Every book comes with free games that continue the adventure.',
  },
];

export default function BooksPage() {
  return (
    <div className="pb-20">
      <section className="border-b-2 border-pg-border bg-coral-50">
        <Container className="py-12 text-center md:py-16">
          <p className="font-bold uppercase tracking-wider text-coral-700">
            Interactive ebooks
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink-900 md:text-5xl">
            Stories behind the games
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-700">
            Our interactive ebooks follow Jaylen and his robot buddy SPARK
            through the Academy, where strange things keep happening to math,
            science and stories. Each book pairs with games your child can play
            for free, so the adventure keeps going after the last page.
          </p>
        </Container>
      </section>

      <Container className="pt-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>

        <section className="mt-16" aria-labelledby="how-it-works">
          <h2
            id="how-it-works"
            className="text-center font-display text-2xl font-bold text-ink-900 md:text-3xl"
          >
            How it works
          </h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-3xl border-2 border-pg-border bg-white p-6 shadow-pop"
              >
                <span className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full border-2 border-pg-border bg-pg-yellow text-sm font-extrabold text-ink-900">
                  {index + 1}
                </span>
                <p className="text-4xl" aria-hidden>
                  {step.emoji}
                </p>
                <h3 className="mt-3 font-display text-xl font-bold text-ink-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-ink-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </Container>
    </div>
  );
}
