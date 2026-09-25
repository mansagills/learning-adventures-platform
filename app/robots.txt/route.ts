import { seoConfig } from '@/lib/seo';

export function GET(): Response {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${seoConfig.siteUrl}/sitemap.xml

# Not for search results: APIs, build files, admin/staging and dev tools
Disallow: /api/
Disallow: /_next/
Disallow: /internal/
Disallow: /staging/
Disallow: /dev/`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
