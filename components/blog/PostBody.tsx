import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface PostBodyProps {
  /** The post's Markdown text from content/blog/<slug>.md */
  markdown: string;
}

/**
 * Turns a post's Markdown into page content. Headings, paragraphs and lists
 * pick up their styles from ContentPage. Links inside the site use Next.js
 * links; links to other sites open in a new tab.
 */
export default function PostBody({ markdown }: PostBodyProps) {
  return (
    <ReactMarkdown
      components={{
        a: ({ href = '', children }) =>
          href.startsWith('/') ? (
            <Link href={href}>{children}</Link>
          ) : (
            <a
              href={href}
              {...(href.startsWith('mailto:')
                ? {}
                : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {children}
            </a>
          ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
