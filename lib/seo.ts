export interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  foundingDate: string;
  sameAs: string[];
}

export interface WebSiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  description: string;
  publisher: {
    '@type': string;
    name: string;
  };
}

export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Learning Adventures',
    url: 'https://learningadventures.org',
    logo: 'https://learningadventures.org/logo.png',
    description:
      'Free educational mini-games for kids in grades K–5, and interactive ebooks that tell the stories behind them.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/learningadventures',
      'https://facebook.com/learningadventures',
      'https://linkedin.com/company/learningadventures',
    ],
  };
}

export function generateWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Learning Adventures',
    url: 'https://learningadventures.org',
    description:
      'Free math, science, reading and history games for grades K–5, plus interactive ebooks and an early look at the Learning Adventures World.',
    publisher: {
      '@type': 'Organization',
      name: 'Learning Adventures',
    },
  };
}

export function createJSONLD(
  schema: OrganizationSchema | WebSiteSchema
): string {
  return JSON.stringify(schema);
}

// SEO metadata helpers
export const seoConfig = {
  defaultTitle:
    'Learning Adventures | Free Learning Games and Interactive Ebooks for Kids',
  defaultDescription:
    'Free math, science, reading and history mini-games for grades K–5, plus interactive ebooks that turn every game into a story. No sign-up needed.',
  defaultImage: '/hero-image.jpg',
  siteUrl: 'https://learningadventures.org',
  twitterHandle: '@learningadventures',
};

export function generateMetadata({
  title = seoConfig.defaultTitle,
  description = seoConfig.defaultDescription,
  image = seoConfig.defaultImage,
  path = '',
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
} = {}) {
  const url = `${seoConfig.siteUrl}${path}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Learning Adventures',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: seoConfig.twitterHandle,
    },
    alternates: {
      canonical: url,
    },
  };
}
