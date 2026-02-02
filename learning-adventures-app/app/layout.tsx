import type { Metadata } from 'next';
import { Nunito, Inter, Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameRegistryInitializer from '@/components/GameRegistryInitializer';
import AppLayout from '@/components/navigation/AppLayout';
import { Providers } from '@/components/Providers';
import {
  generateMetadata,
  generateOrganizationSchema,
  generateWebSiteSchema,
  createJSONLD,
} from '@/lib/seo';

// Legacy fonts (keeping for compatibility)
const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
  preload: true,
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Playful Geometric Design System fonts
const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['400', '500', '600', '700', '800'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700'],
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
      className={`${nunito.variable} ${inter.variable} ${outfit.variable} ${plusJakartaSans.variable}`}
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
            <Header />

            <main id="main-content" className="flex-1">
              <AppLayout>{children}</AppLayout>
            </main>

            <Footer />
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
