import { MetadataRoute } from 'next';
import { books } from '@/lib/content/books';
import { games } from '@/lib/content/games';
import { subjects } from '@/lib/content/subjects';
import { seoConfig } from '@/lib/seo';

type Entry = MetadataRoute.Sitemap[number];

/**
 * Public pages of the v1 site, built from the content data so new games and
 * books are listed automatically. /demo/play is left out on purpose (it's
 * noindex; /demo is the page to find).
 */
export function GET(): Response {
  const base = seoConfig.siteUrl;
  const now = new Date();
  const page = (
    path: string,
    changeFrequency: Entry['changeFrequency'],
    priority: number
  ): Entry => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  const sitemap: MetadataRoute.Sitemap = [
    page('', 'weekly', 1),
    page('/games', 'weekly', 0.9),
    ...subjects.map((subject) =>
      page(`/subjects/${subject.id}`, 'weekly', 0.8)
    ),
    ...games.map((game) => page(`/games/${game.slug}`, 'monthly', 0.7)),
    page('/books', 'weekly', 0.8),
    ...books.map((book) => page(`/books/${book.slug}`, 'monthly', 0.7)),
    page('/demo', 'monthly', 0.7),
    page('/about', 'monthly', 0.5),
    page('/privacy', 'yearly', 0.3),
    page('/terms', 'yearly', 0.3),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map(
    (url) => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastModified instanceof Date ? url.lastModified.toISOString() : url.lastModified}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
