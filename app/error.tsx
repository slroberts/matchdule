'use client';

import { useEffect } from 'react';
import { LoadError } from '@/components/modules/matches/LoadError';
import { SystemShell } from '@/components/layouts/SystemShell';

/**
 * Route error boundary — Figma: Screens › Schedule / Load error
 * Same failure, same UI as an in-view fetch error: one design, one component.
 * `reset` re-renders the boundary; LoadError pairs it with router.refresh()
 * so the server data is re-fetched too.
 */
export default function ErrorState({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SystemShell>
      <LoadError onRetry={reset} />
    </SystemShell>
  );
}
