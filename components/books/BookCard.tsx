import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Book } from '@/lib/content/books';
import BookCover from './BookCover';

interface BookCardProps {
  book: Book;
  /** Horizontal layout for sidebars and "read the story" callouts */
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export default function BookCard({
  book,
  layout = 'vertical',
  className,
}: BookCardProps) {
  const badge = (
    <span className="inline-block rounded-full border-2 border-pg-border bg-pg-yellow px-2.5 py-0.5 text-xs font-bold text-ink-900">
      {book.status === 'available' ? 'Interactive ebook' : 'Coming soon'}
    </span>
  );

  return (
    <Link
      href={`/books/${book.slug}`}
      className={cn(
        'group flex gap-4 rounded-2xl border-2 border-pg-border bg-white p-4 shadow-pop transition-all duration-200 ease-bounce',
        'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40',
        layout === 'vertical' ? 'flex-col' : 'flex-row items-center',
        className
      )}
    >
      <BookCover
        book={book}
        compact={layout === 'horizontal'}
        className={cn(
          'shrink-0 transition-transform duration-300 group-hover:-rotate-2',
          layout === 'vertical' ? 'mx-auto w-full max-w-[200px]' : 'w-24'
        )}
      />
      <div className="min-w-0">
        {badge}
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-ink-900 group-hover:text-brand-600">
          {book.title}
        </h3>
        <p className="mt-1 text-xs font-semibold text-ink-500">
          {book.ageRange}
        </p>
        <p className="mt-2 line-clamp-3 text-sm text-ink-600">{book.hook}</p>
      </div>
    </Link>
  );
}
