import { MetadataRoute } from 'next';

export function GET(): Response {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://learningadventures.com/sitemap.xml

# Disallow private/admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /dashboard/

# Crawl-delay for respectful crawling
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}