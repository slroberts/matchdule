'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Alert — Figma: Molecules › AlertBanner
 * Tinted surface + dark on-surface text (≥ 7:1, both modes) replaces white-on-gradient (~2:1).
 *
 * Structure (no nested interactive elements):
 *   [ button: icon · title · chevron  (toggles body) ] [ button: Mute ]
 *   [ body: description + details  (animated grid-rows collapse) ]
 */

interface AlertProps {
  variant: 'destructive' | 'warning';
  icon: ReactNode;
  title: string;
  description: string;
  details?: string[];
}

const TONES = {
  destructive: 'bg-(--color-danger-surface) text-(--color-danger-on-surface)',
  warning: 'bg-(--color-warning-surface) text-(--color-warning-on-surface)',
  muted: 'bg-(--color-bg-subtle) text-(--color-text-secondary)',
} as const;

export const Alert = ({
  variant,
  icon,
  title,
  description,
  details,
}: AlertProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const titleId = useId();
  const bodyId = useId();

  const handleMuteToggle = () => {
    setIsMuted((muted) => !muted);
    if (!isMuted) setIsExpanded(false); // muting collapses; unmuting leaves it collapsed
  };

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col rounded-(--radius-card) px-(--space-card-pad) py-(--space-stack-xs)',
        'transition-colors duration-(--duration-scrim)',
        isMuted ? TONES.muted : TONES[variant],
      )}
    >
      {/* Summary row */}
      <div className='flex items-center gap-(--space-stack-sm)'>
        <button
          type='button'
          onClick={() => setIsExpanded((open) => !open)}
          aria-expanded={isExpanded}
          aria-controls={bodyId}
          className='flex min-h-(--size-tap) min-w-0 flex-1 items-center gap-(--space-stack-sm) text-left'
        >
          <span aria-hidden='true' className='shrink-0 [&_svg]:size-4'>
            {icon}
          </span>
          <span id={titleId} className='text-control min-w-0 flex-1'>
            {title}
            {isMuted && (
              <span className='font-medium opacity-80'> · Muted</span>
            )}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            absoluteStrokeWidth
            aria-hidden='true'
            className={cn(
              'shrink-0 transition-transform duration-(--duration-fade)',
              isExpanded && 'rotate-180',
            )}
          />
        </button>

        {/* Sibling, not nested — visible label is the accessible name; state via aria-pressed */}
        <button
          type='button'
          onClick={handleMuteToggle}
          aria-pressed={isMuted}
          className='text-control min-h-(--size-tap) shrink-0 px-(--space-stack-sm) underline decoration-1 underline-offset-3 hover:decoration-2'
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      {/* Body — grid-rows 0fr↔1fr animates height without measuring; tokens handle reduced motion */}
      <div
        id={bodyId}
        aria-hidden={!isExpanded}
        className={cn(
          'grid transition-[grid-template-rows] duration-(--duration-page) ease-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className='overflow-hidden'>
          <div className='flex flex-col gap-(--space-stack-sm) pb-(--space-stack-md) pl-6'>
            <p className='text-meta'>{description}</p>

            {details && details.length > 0 && (
              <ul className='flex flex-col gap-(--space-stack-xs) border-t border-current/20 pt-(--space-stack-sm)'>
                {details.map((detail, idx) => (
                  <li
                    key={idx}
                    className='text-meta font-semibold tabular-nums'
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
