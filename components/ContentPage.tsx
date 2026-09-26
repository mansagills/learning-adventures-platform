import type { ReactNode } from 'react';
import Container from './Container';

interface ContentPageProps {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  /** Shows a notice that the text is a draft that still needs review */
  draft?: boolean;
  updated?: string;
  children: ReactNode;
}

/**
 * Simple long-form page layout (About, Privacy, Terms). Headings, paragraphs
 * and lists inside `children` are styled here, so pages can use plain HTML.
 */
export default function ContentPage({
  eyebrow,
  title,
  intro,
  draft = false,
  updated,
  children,
}: ContentPageProps) {
  return (
    <div className="pb-20">
      <section className="border-b-2 border-pg-border bg-brand-50">
        <Container size="sm" className="py-12 md:py-16">
          {eyebrow && (
            <p className="font-bold uppercase tracking-wider text-brand-600">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink-900 md:text-5xl">
            {title}
          </h1>
          {intro && <div className="mt-4 text-lg text-ink-700">{intro}</div>}
          {updated && (
            <p className="mt-4 text-sm font-semibold text-ink-600">
              Last updated {updated}
            </p>
          )}
        </Container>
      </section>

      <Container size="sm" className="pt-10">
        {draft && (
          <div
            role="note"
            className="mb-8 rounded-2xl border-2 border-dashed border-sunshine-600 bg-sunshine-50 p-4 text-sm font-semibold text-sunshine-700"
          >
            Draft: this page is a starting point written from how the site works
            today. Have it reviewed before relying on it.
          </div>
        )}
        <div className="space-y-4 text-ink-700 [&_a]:font-semibold [&_a]:text-brand-600 [&_a:hover]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink-900 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_p]:leading-relaxed [&_ul]:space-y-2">
          {children}
        </div>
      </Container>
    </div>
  );
}
