import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatPostDate, type BlogPost } from '@/lib/content/blog';
import SiteIcon from '@/components/icons/SiteIcon';

interface PostCardProps {
  post: BlogPost;
  className?: string;
}

/** A blog post on the /blog list: sticker, date, title and summary. */
export default function PostCard({ post, className }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group flex flex-col gap-4 rounded-2xl border-2 border-pg-border bg-white p-5 shadow-pop transition-all duration-200 ease-bounce sm:flex-row sm:items-center sm:gap-6',
        'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover',
        'focus:outline-none focus-visible:ring-4 focus-visible:ring-pg-violet/40',
        className
      )}
    >
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-pg-border bg-sunshine-50">
        <SiteIcon
          name={post.icon}
          size={64}
          className="transition-transform duration-300 group-hover:-rotate-6"
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-600">
          <time dateTime={post.publishedAt}>
            {formatPostDate(post.publishedAt)}
          </time>
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold leading-snug text-ink-900 group-hover:text-brand-600">
          {post.title}
        </h2>
        <p className="mt-2 text-ink-700">{post.excerpt}</p>
        <p className="mt-3 text-sm font-bold text-brand-600">Read the post</p>
      </div>
    </Link>
  );
}
