import { existsSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';
import { games } from '@/lib/content/games';
import { books } from '@/lib/content/books';
import { subjects } from '@/lib/content/subjects';

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
