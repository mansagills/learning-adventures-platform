import Link from 'next/link';
import ContentPage from '@/components/ContentPage';
import { games } from '@/lib/content/games';
import { generateMetadata as seoMetadata } from '@/lib/seo';

export const metadata = seoMetadata({
  title: 'About | Learning Adventures',
  description:
    'Learning Adventures makes free learning games for kids in grades K–5, interactive ebooks that tell the stories behind them, and the Learning Adventures World.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About us"
      title="Learning that feels like an adventure"
      intro={
        <p>
          Learning Adventures makes games and stories that help kids in grades
          K–5 practice real skills while they play.
        </p>
      }
    >
      <h2>What we make</h2>
      <ul>
        <li>
          <strong>Mini-games by subject.</strong>{' '}
          <Link href="/games">{games.length} free games and activities</Link>{' '}
          for math, science, reading and history. Every one is quick to start
          and teaches a real skill, with no sign-up needed.
        </li>
        <li>
          <strong>Interactive ebooks.</strong>{' '}
          <Link href="/books">Children&apos;s stories</Link> set in the same
          world as the games. Jaylen and his robot buddy SPARK go on adventures
          that pick up where the games leave off, so kids can read a story and
          then play the games that go with it.
        </li>
        <li>
          <strong>The Learning Adventures World.</strong> A pixel-art Academy
          campus where kids will explore, follow a season-long story and play
          games in every building. It&apos;s in development, and you can{' '}
          <Link href="/demo">try the early demo</Link> today.
        </li>
      </ul>

      <h2>What we believe</h2>
      <p>
        Kids learn best when they&apos;re curious. Our games aim to be fun
        first, with the learning built into how you play. Our stories give that
        curiosity a reason: in the Spark Chronicles, every question a kid asks
        helps keep the Academy full of wonder.
      </p>
      <p>
        We also think kids&apos; learning should be simple and safe for
        families. Every game on this site is free, with no accounts, no ads and
        no chatting with strangers.
      </p>
    </ContentPage>
  );
}
