import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Book } from '@/lib/content/books';
import { getSubject } from '@/lib/content/subjects';

interface BookCoverProps {
  book: Book;
  className?: string;
  sizes?: string;
  /** Small thumbnail: the placeholder shows only the subject icon */
  compact?: boolean;
}

/**
 * A book's cover image, or a drawn placeholder cover (subject color, series
 * name, title) until real cover art exists.
 */
export default function BookCover({
  book,
  className,
  sizes = '200px',
  compact = false,
}: BookCoverProps) {
  const subject = getSubject(book.subject);

  if (book.coverImage) {
    return (
      <div
        className={cn(
          'relative aspect-[3/4] overflow-hidden rounded-r-xl rounded-l-sm border-2 border-pg-border',
          className
        )}
      >
        <Image
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          fill
          sizes={sizes}
          className="object-cover"
        />
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          'relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-r-xl rounded-l-sm border-2 border-pg-border',
          subject?.theme.solid,
          className
        )}
        role="img"
        aria-label={`Cover of ${book.title}`}
      >
        <span className="absolute inset-y-0 left-0 w-2 bg-black/15" />
        <span className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-white/20" />
        <span className="relative text-3xl" aria-hidden>
          {subject?.emoji}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm border-2 border-pg-border p-4 text-white',
        subject?.theme.solid,
        className
      )}
      role="img"
      aria-label={`Cover of ${book.title}`}
    >
      {/* Spine shading */}
      <span className="absolute inset-y-0 left-0 w-3 bg-black/15" />
      <span className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20" />
      <span className="absolute -bottom-6 left-6 h-16 w-16 rotate-12 rounded-lg bg-white/15" />

      <p className="relative pl-2 text-[10px] font-bold uppercase tracking-widest opacity-90">
        {book.series}
      </p>
      <p className="relative pl-2 font-display text-lg font-extrabold leading-tight drop-shadow">
        {book.title}
      </p>
      <p className="relative pl-2 text-3xl" aria-hidden>
        {subject?.emoji}
      </p>
    </div>
  );
}
