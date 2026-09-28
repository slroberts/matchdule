'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CloudOff, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';

/**
 * LoadError — Figma: EmptyState (Icon=CloudOff) · Screens › Schedule / Load error
 * Shown when the schedule couldn't be fetched — never a misleading "Rest week".
 * "Try again" = router.refresh(): re-runs the server fetch, keeps client state (team, filters).
 */
export const LoadError = () => {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  return (
    <div
      role='alert'
      className='stagger-fade mx-auto flex w-full max-w-lg flex-col items-center gap-(--space-stack-md) px-(--space-card-pad) py-8 text-center'
    >
      <div className='grid size-18 place-items-center rounded-full bg-(--color-bg-surface) text-(--color-icon-default) shadow-(--shadow-raised)'>
        <CloudOff
          size={28}
          strokeWidth={1.5}
          absoluteStrokeWidth
          aria-hidden='true'
        />
      </div>
      <h3 className='text-score text-(--color-text-primary)'>
        Couldn&rsquo;t load the schedule
      </h3>
      <p className='text-meta max-w-70 text-(--color-text-secondary)'>
        Check your connection and try again. Your filters are saved.
      </p>
      <Button
        variant='primary'
        onClick={() => startRetry(() => router.refresh())}
        disabled={isRetrying}
        aria-busy={isRetrying}
      >
        <RotateCw
          size={16}
          strokeWidth={1.5}
          absoluteStrokeWidth
          aria-hidden='true'
          className={isRetrying ? 'motion-safe:animate-spin' : undefined}
        />
        {isRetrying ? 'Trying again…' : 'Try again'}
      </Button>
    </div>
  );
};
