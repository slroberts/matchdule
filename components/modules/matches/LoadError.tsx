'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CloudOff, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';

/**
 * LoadError — Figma: EmptyState (Icon=CloudOff) · Screens › Schedule / Load error
 * Shown when the schedule couldn't be fetched — never a misleading "Rest week".
 * "Try again" = router.refresh(): re-runs the server fetch, keeps client state (team, filters).
 * Inside an error boundary (app/error.tsx), pass `onRetry={reset}` so the boundary
 * re-renders its children too — refresh alone leaves the error UI on screen.
 */
export const LoadError = ({ onRetry }: { onRetry?: () => void }) => {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  return (
    <EmptyState
      role='alert'
      icon={CloudOff}
      title={<>Couldn&rsquo;t load the schedule</>}
      body='Check your connection and try again. Your filters are saved.'
      action={
        <Button
          variant='primary'
          onClick={() =>
            startRetry(() => {
              router.refresh();
              onRetry?.();
            })
          }
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
      }
    />
  );
};
