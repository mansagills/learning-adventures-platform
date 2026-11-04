import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import GameRegistryInitializer from '@/components/GameRegistryInitializer';
import HeaderFooterWrapper, {
  FooterWrapper,
} from '@/components/navigation/HeaderFooterWrapper';
import AppLayout from '@/components/navigation/AppLayout';
import { Providers } from '@/components/Providers';
import {
  generateMetadata,
  generateOrganizationSchema,
  generateWebSiteSchema,
  createJSONLD,
} from '@/lib/seo';

// The fonts are kept in app/fonts/ (the Latin files from Google Fonts, all
// under the SIL Open Font License) so the build never has to download them.
// Downloading them from Google during the build broke CI on 2026-11-04.

// Legacy fonts (keeping for compatibility)
const nunito = localFont({
  src: './fonts/nunito-latin.woff2',
  weight: '200 1000',
  display: 'swap',
  variable: '--font-nunito',
  preload: true,
});

const inter = localFont({
  src: './fonts/inter-latin.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
});

// Playful Geometric Design System fonts
const outfit = localFont({
  src: './fonts/outfit-latin.woff2',
  weight: '400 800',
  display: 'swap',
  variable: '--font-outfit',
});

const plusJakartaSans = localFont({
  src: './fonts/plus-jakarta-sans-latin.woff2',
  weight: '400 700',
  display: 'swap',
  variable: '--font-plus-jakarta',
});

const pressStart2P = localFont({
  src: './fonts/press-start-2p-latin.woff2',
  weight: '400',
  display: 'swap',
  variable: '--font-pixel',
});

export const metadata: Metadata = generateMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = createJSONLD(generateOrganizationSchema());
  const websiteSchema = createJSONLD(generateWebSiteSchema());

  return (
    <html
      lang="en"
      className={`${nunito.variable} ${inter.variable} ${outfit.variable} ${plusJakartaSans.variable} ${pressStart2P.variable}`}
    >
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchema }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: websiteSchema }}
        />

        {/* Preconnect to external domains */}
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <Providers>
          <div className="min-h-screen flex flex-col">
            <GameRegistryInitializer />
            <HeaderFooterWrapper />

            <main id="main-content" className="flex-1">
              <AppLayout>{children}</AppLayout>
            </main>

            <FooterWrapper />
          </div>
        </Providers>

        {/* Analytics initialization stub */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Analytics initialization would go here
              // Example: gtag('config', 'GA_MEASUREMENT_ID');
              console.log('Analytics initialized');
            `,
          }}
        />
      </body>
    </html>
  );
}
