import { readFileSync } from 'fs';
import { join } from 'path';

/** Folder that holds each blog post's text, one Markdown file per slug. */
export const blogContentDir = join(process.cwd(), 'content', 'blog');

/**
 * Reads a post's Markdown text. Server-only: it runs while the site is built,
 * so the finished pages don't need the files at run time.
 */
export function getPostBody(slug: string): string {
  return readFileSync(join(blogContentDir, `${slug}.md`), 'utf8');
}
