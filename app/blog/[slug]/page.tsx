import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentPage from '@/components/ContentPage';
import PostBody from '@/components/blog/PostBody';
import NewsletterCta from '@/components/newsletter/NewsletterCta';
import { formatPostDate, getPost, publishedPosts } from '@/lib/content/blog';
import { getPostBody } from '@/lib/blogPostBody';
import { generateMetadata as seoMetadata } from '@/lib/seo';
import SiteIcon from '@/components/icons/SiteIcon';
import UiIcon from '@/components/icons/UiIcon';

interface PostPageProps {
  params: { slug: string };
}

// Pre-build one page per published post; drafts and unknown slugs are a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return publishedPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: PostPageProps) {
  const post = getPost(params.slug);
  if (!post) return {};
  return seoMetadata({
    title: `${post.title} | Learning Adventures Blog`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

const buttonClass =
  'inline-flex items-center gap-2 rounded-full border-2 border-pg-border px-5 py-2 font-bold shadow-pop transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:no-underline hover:shadow-pop-hover';

export default function PostPage({ params }: PostPageProps) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <ContentPage
      eyebrow="Blog"
      title={post.title}
      intro={
        <p className="text-base font-semibold text-ink-600">
          <time dateTime={post.publishedAt}>
            {formatPostDate(post.publishedAt)}
          </time>{' '}
          · {post.author}
        </p>
      }
    >
      <PostBody markdown={getPostBody(post.slug)} />

      <NewsletterCta className="!mt-12" />

      <aside
        aria-labelledby="keep-exploring"
        className="!mt-12 rounded-3xl border-2 border-pg-border bg-sunshine-50 p-6 text-center shadow-pop"
      >
        <SiteIcon name="compass" size={56} />
        <h2 id="keep-exploring" className="!mt-3">
          Ready for an adventure?
        </h2>
        <p>Pick a free game or read a story together.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/games"
            className={`${buttonClass} bg-pg-violet !text-white`}
          >
            <SiteIcon name="controller" size={24} />
            Play the games
          </Link>
          <Link
            href="/books"
            className={`${buttonClass} bg-white !text-ink-900`}
          >
            <SiteIcon name="open-book" size={24} />
            See the books
          </Link>
        </div>
      </aside>

      <p className="!mt-10">
        <Link href="/blog" className="inline-flex items-center gap-1">
          <UiIcon name="arrow-left" size={16} />
          All blog posts
        </Link>
      </p>
    </ContentPage>
  );
}
