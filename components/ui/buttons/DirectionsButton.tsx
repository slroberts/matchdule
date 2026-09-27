import { MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * DirectionsButton — Figma: MatchCard › Footer › Directions
 * The whole row is ONE 44px target and a real link (long-press, open-in-new-tab, screen readers all work).
 */

const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;
const ROW =
  'flex min-h-(--size-tap) min-w-0 flex-1 items-center gap-(--space-stack-sm) rounded-(--radius-control) bg-(--color-bg-subtle) px-(--space-stack-md) py-(--space-stack-sm)';

export const DirectionsButton = ({ location }: { location: string }) => {
  const isTBD = !location.trim() || location.trim().toUpperCase() === 'TBD';

  if (isTBD) {
    return (
      <div className={cn(ROW, 'text-(--color-text-disabled)')}>
        <MapPin {...ICON} aria-hidden='true' className='shrink-0' />
        <span className='text-meta truncate'>Location TBD</span>
      </div>
    );
  }

  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(ROW, 'pressable text-(--color-text-primary)')}
    >
      <MapPin
        {...ICON}
        aria-hidden='true'
        className='shrink-0 text-(--color-icon-default)'
      />
      {/* Visible label stays in the accessible name (WCAG 2.5.3) */}
      <span className='text-meta min-w-0 flex-1 truncate'>
        <span className='visually-hidden'>Directions to </span>
        {location}
        <span className='visually-hidden'> (opens Maps)</span>
      </span>
      <Navigation
        {...ICON}
        aria-hidden='true'
        className='shrink-0 text-(--color-icon-default)'
      />
    </a>
  );
};
