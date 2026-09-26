import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Container from '@/components/Container';
import SiteIcon from '@/components/icons/SiteIcon';
import { iconNames, type IconName } from '@/components/icons/art';
import { subjects } from '@/lib/content/subjects';
import { cn } from '@/lib/utils';

/**
 * /dev/icons: review page for the Learning Adventures icon set. It works
 * locally and on Vercel preview deploys, and 404s on the live site.
 */

export const metadata: Metadata = {
  title: 'Icon preview',
  robots: { index: false, follow: false },
};

const subjectIcons: Record<string, IconName> = {
  math: 'math',
  science: 'flask',
  english: 'abc-book',
  history: 'columns',
  interdisciplinary: 'puzzle',
};

export default function IconPreviewPage() {
  if (process.env.VERCEL_ENV === 'production') notFound();

  return (
    <Container className="py-12">
      <h1 className="font-display text-4xl font-extrabold text-ink-900">
        Icon preview
      </h1>
      <p className="mt-2 max-w-2xl text-ink-600">
        Every icon at 24, 48 and 96 pixels. Hidden on the live site.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          All icons
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {iconNames.map((name) => (
            <div
              key={name}
              className="flex flex-col items-center gap-3 rounded-2xl border-2 border-pg-border bg-white p-4"
            >
              <SiteIcon name={name} size={96} />
              <div className="flex items-end gap-3">
                <SiteIcon name={name} size={48} />
                <SiteIcon name={name} size={24} />
              </div>
              <code className="text-sm font-bold text-ink-700">{name}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          Subject tiles (in context)
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={cn(
                'flex flex-col items-start gap-3 rounded-2xl border-2 border-pg-border p-5 shadow-pop',
                subject.theme.solid,
                subject.theme.onSolid
              )}
            >
              <span className="rounded-2xl bg-white/90 p-2 ring-2 ring-pg-border">
                <SiteIcon name={subjectIcons[subject.id]} size={48} />
              </span>
              <span className="font-display text-xl font-extrabold">
                {subject.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          On each subject color
        </h2>
        <div className="mt-4 space-y-3">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={cn(
                'flex flex-wrap gap-3 rounded-2xl border-2 border-pg-border p-4',
                subject.theme.solid
              )}
            >
              {iconNames.map((name) => (
                <SiteIcon key={name} name={name} size={40} />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink-900">
          In headings and buttons
        </h2>
        <div className="mt-4 space-y-5">
          <h3 className="flex items-center gap-2 font-display text-3xl font-extrabold text-ink-900">
            <SiteIcon name="books" size={40} /> Stories to read
          </h3>
          <h3 className="flex items-center gap-2 font-display text-3xl font-extrabold text-ink-900">
            <SiteIcon name="compass" size={40} /> Reading, history and more
          </h3>
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-pg-border bg-pg-yellow px-5 py-2.5 font-bold text-ink-900 shadow-pop">
              <SiteIcon name="map" size={24} /> See the demo
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-pg-border bg-pg-violet px-5 py-2.5 font-bold text-white shadow-pop">
              <SiteIcon name="controller" size={24} /> Play a game
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-pg-border bg-white px-5 py-2.5 font-bold text-ink-900 shadow-pop">
              <SiteIcon name="books" size={24} /> See the books
            </span>
          </div>
        </div>
      </section>
    </Container>
  );
}
