'use client';

import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';

/** Reload once the signal is back — the service worker will fetch the real page */
export const RetryButton = () => (
  <Button onClick={() => window.location.reload()}>
    <RotateCw
      size={16}
      strokeWidth={1.5}
      absoluteStrokeWidth
      aria-hidden='true'
    />
    Try again
  </Button>
);
