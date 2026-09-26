import { cn } from '@/lib/utils';
import { art, type IconName } from './art';
import { ink } from './palette';

export type { IconName } from './art';

interface SiteIconProps {
  name: IconName;
  /** Width and height in pixels (default 48). */
  size?: number;
  className?: string;
  /** Text for screen readers. Leave it out when the icon is decoration. */
  title?: string;
}

/**
 * One of the Learning Adventures icons (see ./art.tsx). The outline style is
 * set here once, so every drawing shares it.
 */
export default function SiteIcon({
  name,
  size = 48,
  className,
  title,
}: SiteIconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn('inline-block shrink-0 overflow-visible', className)}
      stroke={ink}
      strokeWidth={2.5}
      strokeLinejoin="round"
      strokeLinecap="round"
      {...(title
        ? { role: 'img', 'aria-label': title }
        : { 'aria-hidden': true, focusable: false })}
    >
      {title && <title>{title}</title>}
      {art[name]}
    </svg>
  );
}
