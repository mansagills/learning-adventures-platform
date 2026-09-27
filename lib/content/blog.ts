/**
 * Blog posts for parents and kids.
 *
 * Each post has an entry here (title, date, summary) and its text in
 * `content/blog/<slug>.md`, written in Markdown so it can be edited without
 * touching code. Pages, the sitemap and the content test are built from this
 * list.
 *
 * To add a post: add an entry below, create `content/blog/<slug>.md`, and run
 * `npm test`. Posts with `status: 'draft'` stay off the site until they are
 * switched to `'published'`.
 */

import type { IconName } from '@/components/icons/art';

export interface BlogPost {
  /** Used in the URL: /blog/<slug> */
  slug: string;
  title: string;
  /** One or two sentences for the post card and search results */
  excerpt: string;
  /** Publish date as YYYY-MM-DD */
  publishedAt: string;
  author: string;
  /** Sticker shown on the post card and at the top of the post */
  icon: IconName;
  status: 'published' | 'draft';
}

export const posts: BlogPost[] = [
  {
    slug: 'welcome-to-learning-adventures',
    title: 'Welcome to Learning Adventures!',
    excerpt:
      'Who we are, why we believe learning should feel like play, and what you and your kids can explore on the site today.',
    publishedAt: '2026-09-27',
    author: 'The Learning Adventures Team',
    icon: 'high-five',
    status: 'published',
  },
];

/** Posts visitors can see, newest first. */
export const publishedPosts: BlogPost[] = posts
  .filter((post) => post.status === 'published')
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function getPost(slug: string): BlogPost | undefined {
  return publishedPosts.find((post) => post.slug === slug);
}

/** "September 27, 2026". Read as UTC so the day never shifts by time zone. */
export function formatPostDate(publishedAt: string): string {
  return new Date(`${publishedAt}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
