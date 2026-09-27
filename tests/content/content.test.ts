import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { basename, join, resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { games } from '@/lib/content/games';
import { books } from '@/lib/content/books';
import { posts } from '@/lib/content/blog';
import { subjects } from '@/lib/content/subjects';
import { iconNames } from '@/components/icons/art';

const publicDir = resolve(__dirname, '../../public');
const subjectIds = new Set(subjects.map((subject) => subject.id));
const gameSlugs = new Set(games.map((game) => game.slug));

function duplicates(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) !== index);
}

describe('public content data', () => {
  it('every game points at an HTML file that exists in public/', () => {
    const missing = games
      .filter((game) => !existsSync(resolve(publicDir, `.${game.htmlPath}`)))
      .map((game) => `${game.slug} -> ${game.htmlPath}`);
    expect(missing).toEqual([]);
  });

  it('every game has a card picture that exists in public/', () => {
    const missing = games
      .filter((game) => !existsSync(resolve(publicDir, `.${game.thumbnail}`)))
      .map(
        (game) =>
          `${game.slug} -> ${game.thumbnail} (run: npm run thumbnails -- --only ${game.slug})`
      );
    expect(missing).toEqual([]);
  });

  it('game and book slugs are unique across the site', () => {
    expect(duplicates(games.map((game) => game.slug))).toEqual([]);
    expect(duplicates(books.map((book) => book.slug))).toEqual([]);
  });

  it('game slugs are URL-safe', () => {
    for (const game of games) {
      expect(game.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('every game and book uses a known subject', () => {
    for (const item of [...games, ...books]) {
      expect(subjectIds.has(item.subject)).toBe(true);
    }
  });

  it('every book companion game exists', () => {
    const broken = books.flatMap((book) =>
      book.companionGameSlugs
        .filter((slug) => !gameSlugs.has(slug))
        .map((slug) => `${book.slug} -> ${slug}`)
    );
    expect(broken).toEqual([]);
  });

  it('every book image that is set exists in public/', () => {
    const images = books.flatMap((book) => [
      ...(book.coverImage ? [book.coverImage] : []),
      ...book.samplePages,
    ]);
    const missing = images.filter(
      (path) => !existsSync(resolve(publicDir, `.${path}`))
    );
    expect(missing).toEqual([]);
  });
});

describe('blog posts', () => {
  const blogDir = resolve(__dirname, '../../content/blog');

  it('post slugs are unique and URL-safe', () => {
    expect(duplicates(posts.map((post) => post.slug))).toEqual([]);
    for (const post of posts) {
      expect(post.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('every post has its Markdown file in content/blog/', () => {
    const missing = posts
      .filter((post) => !existsSync(join(blogDir, `${post.slug}.md`)))
      .map((post) => `${post.slug} -> content/blog/${post.slug}.md`);
    expect(missing).toEqual([]);
  });

  it('every post has a real publish date (YYYY-MM-DD)', () => {
    for (const post of posts) {
      expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(
        new Date(`${post.publishedAt}T00:00:00Z`).toISOString().slice(0, 10)
      ).toBe(post.publishedAt);
    }
  });

  it('every post uses an icon from the Learning Adventures set', () => {
    for (const post of posts) {
      expect(iconNames).toContain(post.icon);
    }
  });

  it('post text has no emojis or text arrows', () => {
    const emoji = /(?![©®])\p{Extended_Pictographic}|[←→✓✔]/u;
    const found = readdirSync(blogDir)
      .filter((name) => name.endsWith('.md'))
      .flatMap((name) =>
        readFileSync(join(blogDir, name), 'utf8')
          .split('\n')
          .flatMap((line, index) =>
            emoji.test(line) ? [`${name}:${index + 1}`] : []
          )
      );
    expect(found).toEqual([]);
  });
});

describe('site icons', () => {
  it('every subject uses an icon from the Learning Adventures set', () => {
    for (const subject of subjects) {
      expect(iconNames).toContain(subject.icon);
    }
  });

  it('public pages use SiteIcon/UiIcon instead of emojis and text arrows', () => {
    // Public-site source files. SocialProof.tsx is left out because it is not
    // rendered (see components/demo/DemoLanding.tsx). © and ® are allowed.
    const roots = [
      'components/home',
      'components/play',
      'components/books',
      'components/demo',
      'components/blog',
      'components/Header.tsx',
      'components/Footer.tsx',
      'components/ContentPage.tsx',
      'app/page.tsx',
      'app/games',
      'app/subjects',
      'app/books',
      'app/demo',
      'app/blog',
      'app/about',
      'app/privacy',
      'app/terms',
      'app/not-found.tsx',
      'lib/content',
    ].map((path) => resolve(__dirname, '../..', path));
    const skip = new Set(['SocialProof.tsx']);
    // Arrows and ticks are drawn with UiIcon too, so they count as well.
    const emoji = /(?![©®])\p{Extended_Pictographic}|[←→✓✔]/u;

    const files = roots.flatMap(function walk(path: string): string[] {
      if (statSync(path).isDirectory()) {
        return readdirSync(path).flatMap((name) => walk(join(path, name)));
      }
      return /\.tsx?$/.test(path) && !skip.has(basename(path)) ? [path] : [];
    });
    const found = files.flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, index) =>
          emoji.test(line)
            ? [`${file.split('/').slice(-2).join('/')}:${index + 1}`]
            : []
        )
    );
    expect(found).toEqual([]);
  });
});
