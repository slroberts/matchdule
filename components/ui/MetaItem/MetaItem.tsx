import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

/**
 * MetaItem — Figma: MatchCard › Meta / Directions (icon + label)
 * 16px icon · 1.5px stroke · gap stack-sm · text-meta · truncates in flex rows
 */

interface MetaItemProps {
  icon: LucideIcon;
  label: string | number;
  /** Tailwind text-color class for the icon, e.g. 'text-(--color-icon-accent)' */
  iconColor?: string;
  className?: string;
}

export const MetaItem = ({
  icon: Icon,
  label,
  iconColor = 'text-(--color-icon-default)',
  className,
}: MetaItemProps) => (
  <div
    className={cn(
      'flex min-w-0 items-center gap-(--space-stack-sm)',
      className,
    )}
  >
    <Icon
      size={16}
      strokeWidth={1.5}
      absoluteStrokeWidth
      aria-hidden='true'
      className={cn('shrink-0', iconColor)}
    />
    <span className='text-meta truncate text-(--color-text-secondary)'>
      {label}
    </span>
  </div>
);
