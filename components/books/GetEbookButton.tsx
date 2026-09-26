import { BookOpen, ExternalLink } from 'lucide-react';
import type { Book } from '@/lib/content/books';
import { siteConfig } from '@/lib/siteConfig';

interface GetEbookButtonProps {
  book: Book;
}

/**
 * Link to buy/read a book in the interactive ebook reader, or a "Coming soon"
 * state until the book is available. The reader platform is never named on
 * the site; we only link to it.
 */
export default function GetEbookButton({ book }: GetEbookButtonProps) {
  const href = book.ebookUrl || siteConfig.links.ebookStore;

  if (book.status === 'available' && href) {
    return (
      <div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-pg-border bg-pg-violet px-7 py-3.5 text-lg font-bold text-white shadow-pop transition-all duration-200 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40"
        >
          <BookOpen size={22} aria-hidden />
          Get the interactive ebook
          <ExternalLink size={16} aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <p className="mt-3 max-w-md text-sm text-ink-500">
          Buying and reading happen in our interactive ebook reader, which has
          its own sign-in.
        </p>
      </div>
    );
  }

  return (
    <div>
      <span
        className="inline-flex cursor-default items-center gap-2 rounded-full border-2 border-dashed border-ink-400 bg-white px-6 py-3 text-lg font-bold text-ink-500"
        aria-disabled="true"
      >
        <BookOpen size={20} aria-hidden />
        Interactive ebook coming soon
      </span>
      {siteConfig.links.newsletter && (
        <p className="mt-3 text-sm">
          <a
            href={siteConfig.links.newsletter}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand-600 underline-offset-2 hover:underline"
          >
            Tell me when it&apos;s out
          </a>
        </p>
      )}
    </div>
  );
}
