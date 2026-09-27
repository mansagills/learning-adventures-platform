import Container from '@/components/Container';
import PostCard from '@/components/blog/PostCard';
import { publishedPosts } from '@/lib/content/blog';
import { generateMetadata as seoMetadata } from '@/lib/seo';

export const metadata = seoMetadata({
  title: 'Blog | Learning Adventures',
  description:
    'News, ideas and tips from Learning Adventures for parents and kids: what’s new on the site and simple ways to keep learning fun at home.',
  path: '/blog',
});

export default function BlogPage() {
  return (
    <div className="pb-20">
      <section className="border-b-2 border-pg-border bg-sunshine-50">
        <Container size="sm" className="py-12 text-center md:py-16">
          <p className="font-bold uppercase tracking-wider text-brand-600">
            Blog
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink-900 md:text-5xl">
            News and ideas for curious families
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-700">
            What&apos;s new at Learning Adventures, the thinking behind our
            games and stories, and simple ways to keep learning fun at home.
          </p>
        </Container>
      </section>

      <Container size="sm" className="pt-12">
        {publishedPosts.length > 0 ? (
          <ul className="space-y-6">
            {publishedPosts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-lg text-ink-700">
            Our first post is on its way. Check back soon!
          </p>
        )}
      </Container>
    </div>
  );
}
