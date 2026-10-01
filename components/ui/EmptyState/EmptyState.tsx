import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * EmptyState — Figma: Molecules › EmptyState (Icon · Title · Body · Show action)
 * One source for every "nothing here / something went wrong" moment:
 * Rest week, filters with no results, no season results, load error, 404.
 *
 * `as` sets the heading level for the page outline — h1 when the empty state IS
 * the page (404), h3 when it sits inside a view that already has headings.
 * `role='alert'` only for failures, so screen readers announce them immediately.
 */

interface EmptyStateProps {
  icon: LucideIcon;
  title: ReactNode;
  body: ReactNode;
  action?: ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  role?: 'alert' | 'status';
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  body,
  action,
  as: Heading = 'h3',
  role,
  className,
}: EmptyStateProps) => (
  <div
    role={role}
    className={cn(
      'stagger-fade mx-auto flex w-full max-w-lg flex-col items-center gap-(--space-stack-md) px-(--space-card-pad) py-8 text-center',
      className,
    )}
  >
    <div className='grid size-18 place-items-center rounded-full bg-(--color-bg-surface) text-(--color-icon-default) shadow-(--shadow-raised)'>
      <Icon
        size={28}
        strokeWidth={1.5}
        absoluteStrokeWidth
        aria-hidden='true'
      />
    </div>

    <Heading className='text-score text-(--color-text-primary)'>
      {title}
    </Heading>

    <p className='text-meta max-w-70 text-(--color-text-secondary)'>{body}</p>

    {action}
  </div>
);
