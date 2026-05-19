'use client';

import { MapPinned } from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';
import { cn } from '@/lib/utils';

export const DirectionsButton = ({ location }: { location: string }) => {
  const isTBD = location.trim().toUpperCase() === 'TBD';

  const handleDirections = () => {
    if (isTBD) return;

    const encodedLocation = encodeURIComponent(location);

    const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant='outline'
      className={cn(
        'w-full py-2.5 transition-all duration-200',
        isTBD ? 'opacity-40 pointer-events-none' : 'opacity-100 cursor-pointer',
      )}
      onClick={handleDirections}
      disabled={isTBD}
      aria-disabled={isTBD}
    >
      <MapPinned size={16} className='mr-1' />
      Directions
    </Button>
  );
};
