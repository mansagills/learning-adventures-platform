import Link from 'next/link';
import Container from './Container';
import Icon from './Icon';
import { subjects } from '@/lib/content/subjects';
import { siteConfig } from '@/lib/siteConfig';

const columns = [
  {
    title: 'Play',
    links: [
      { href: '/games', label: 'All games' },
      ...subjects.map((subject) => ({
        href: `/subjects/${subject.id}`,
        label: subject.name,
      })),
    ],
  },
  {
    title: 'Read & Explore',
    links: [
      { href: '/books', label: 'Interactive ebooks' },
      { href: '/demo', label: 'World Demo' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export default function Footer() {
  const { contactEmail } = siteConfig.links;

  return (
    <footer className="bg-ink-900 text-white">
      <Container>
        <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="mb-4 flex items-center space-x-2 font-display text-xl font-bold"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500">
                <Icon name="academic" size={20} className="text-white" />
              </span>
              <span>Learning Adventures</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-300">
              Free learning games for grades K–5, plus interactive ebooks that
              tell the stories behind them.
            </p>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="mt-4 inline-block text-sm text-gray-300 underline-offset-2 hover:text-white hover:underline"
              >
                {contactEmail}
              </a>
            )}
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-4 text-lg font-semibold">{column.title}</h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 transition-colors duration-250 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-gray-700 py-6 text-sm text-gray-400">
          © {new Date().getFullYear()} Learning Adventures. All rights
          reserved.
        </div>
      </Container>
    </footer>
  );
}
