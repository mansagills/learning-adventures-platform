import { cn } from '@/lib/utils';
import { uiArt, type UiIconName } from './ui';

export type { UiIconName } from './ui';

interface UiIconProps {
  name: UiIconName;
  /** Width and height in pixels (default 20). */
  size?: number;
  className?: string;
  /** Text for screen readers. Leave it out when the icon is decoration. */
  title?: string;
}

/**
 * A small interface icon (see ./ui.tsx) in the current text color. Use it for
 * controls such as arrows, close and search; use SiteIcon for everything else.
 */
export default function UiIcon({
  name,
  size = 20,
  className,
  title,
}: UiIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn('inline-block shrink-0', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(title
        ? { role: 'img', 'aria-label': title }
        : { 'aria-hidden': true, focusable: false })}
    >
      {title && <title>{title}</title>}
      {uiArt[name]}
    </svg>
  );
}
