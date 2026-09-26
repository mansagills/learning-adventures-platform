import type { Metadata } from 'next';
import CampusDemoExperience from '@/components/demo/CampusDemoExperience';

export const metadata: Metadata = {
  title: 'Play the Learning Adventures World Demo',
  description:
    'An early preview of the Learning Adventures World: walk the Academy campus, meet Jaylen and SPARK, and play games.',
  // Search engines should land on /demo, not straight inside the game
  robots: { index: false, follow: true },
};

export default function DemoPlayPage() {
  return <CampusDemoExperience exitHref="/demo" />;
}
