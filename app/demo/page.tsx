import DemoLanding from '@/components/demo/DemoLanding';
import { generateMetadata as seoMetadata } from '@/lib/seo';

export const metadata = seoMetadata({
  title: 'Learning Adventures World Demo | Learning Adventures',
  description:
    'Take an early look at the Learning Adventures World: explore a pixel-art Academy campus, meet Jaylen and SPARK, and play games. Free, in your browser, no sign-up.',
  path: '/demo',
});

export default function DemoPage() {
  return <DemoLanding />;
}
