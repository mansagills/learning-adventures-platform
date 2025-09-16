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
    url: 'https://learningadventures.com',
    logo: 'https://learningadventures.com/logo.png',
    description: 'Interactive educational games and lessons for elementary and middle school students.',
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
    url: 'https://learningadventures.com',
    description: 'Transform your child\'s learning journey with engaging, interactive educational content designed for elementary and middle school students.',
    publisher: {
      '@type': 'Organization',
      name: 'Learning Adventures',
    },
  };
}

export function createJSONLD(schema: OrganizationSchema | WebSiteSchema): string {
  return JSON.stringify(schema);
}

// SEO metadata helpers
export const seoConfig = {
  defaultTitle: 'Learning Adventures - Interactive Education for Kids',
  defaultDescription: 'Transform your child\'s learning journey with engaging, interactive educational games and lessons designed for elementary and middle school students.',
  defaultImage: '/hero-image.jpg',
  siteUrl: 'https://learningadventures.com',
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