'use client';

import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';
import { cn } from '@/lib/utils';
import { MetaItem } from '../MetaItem/MetaItem';

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
      variant='muted'
      className={cn(
        'flex justify-between w-full transition-all duration-200',
        isTBD ? 'opacity-40 pointer-events-none' : 'opacity-100 cursor-pointer',
      )}
      onClick={handleDirections}
      disabled={isTBD}
      aria-disabled={isTBD}
    >
      <MetaItem icon={MapPin} label={location} />
      <div className='rounded-full bg-brand-primary text-white p-2'>
        <Navigation size={16} />
      </div>
    </Button>
  );
};
