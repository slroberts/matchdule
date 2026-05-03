'use client';

import { Button } from '@/components/ui/Button';
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
    // Optional: Log to an external service like Sentry here
    console.error(error);
  }, [error]);

  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] p-6 text-center animate-in fade-in zoom-in duration-500'>
      <div className='bg-blue-50 text-blue-500 rounded-full p-4 mb-4 transform-view'>
        <GlassWater size={48} />
      </div>
      <h2 className='text-xl font-bold text-slate-900 mb-2'>
        Connection Interrupted
      </h2>
      <p className='text-slate-500 max-w-sm mb-8'>
        We couldn&lsquo;t load the schedule from the locker room. The GotSport
        servers might be taking a water break.
      </p>
      {/* Relying on the base Button component for styles */}
      <Button onClick={() => reset()}>Try Again</Button>
    </div>
  );
}
