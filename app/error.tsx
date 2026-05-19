'use client';

import { Button } from '@/components/ui/buttons/Button';
import { GlassWater } from 'lucide-react';
import { useEffect } from 'react';

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
    <div className='flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-stagger-fade'>
      <div className='bg-surface-card border-2 border-divider shadow-sm rounded-full p-6 mb-6 text-brand-navy/60'>
        <GlassWater size={48} strokeWidth={1.5} />
      </div>

      <h2 className='text-2xl font-black text-brand-navy tracking-tight mb-2 uppercase'>
        Connection Interrupted
      </h2>

      <p className='text-surface-muted max-w-sm mb-8 text-sm font-medium'>
        We couldn&lsquo;t load the schedule from the locker room. The GotSport
        servers might be taking a water break.
      </p>

      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
