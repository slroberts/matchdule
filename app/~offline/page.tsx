import type { Metadata } from 'next';
import { WifiOff } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { SystemShell } from '@/components/layouts/SystemShell';
import { RetryButton } from './RetryButton';

/**
 * Offline fallback — shown only for a page that was never opened while online.
 * Pages you HAVE opened (e.g. this week's schedule) load from the service worker cache instead.
 * Static on purpose: it's precached at build time, so it works with zero signal.
 */
export const metadata: Metadata = { title: 'Offline' };

export default function Offline() {
  return (
    <SystemShell>
      <EmptyState
        as='h1'
        role='status'
        icon={WifiOff}
        title='You’re offline'
        body='This page hasn’t been saved yet. Schedules you’ve opened before still work offline.'
        action={<RetryButton />}
      />
    </SystemShell>
  );
}
