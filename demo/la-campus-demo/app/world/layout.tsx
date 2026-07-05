import { WorldErrorBoundary } from '@/components/world/WorldErrorBoundary';

export default function WorldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorldErrorBoundary>{children}</WorldErrorBoundary>;
}
