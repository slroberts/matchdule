'use client';

import { useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Alert — Figma: Molecules › AlertBanner
 * White card like every other card: navy title, gray body — the ICON carries the tone
 * (warning amber / danger red). No tinted blocks.
 * The week alert is a HEADLINE → dark island card (same language as header / Versus / season);
 * warnings on individual cards stay quiet markers (neutral pill + amber icon).
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
  destructive:
    'bg-(--color-bg-surface) text-(--color-text-primary) shadow-(--shadow-raised)',
  warning:
    'bg-(--color-bg-surface) text-(--color-text-primary) shadow-(--shadow-raised)',
  /* Muted steps back: light context, no fill, hairline outline, grey text — still there, not asking */
  muted:
    'bg-transparent text-(--color-text-secondary) ring-1 ring-(--color-border-default) ring-inset',
} as const;

const ICON_TONES = {
  destructive: 'text-(--color-danger-icon)',
  warning: 'text-(--color-warning-icon)',
  muted: 'text-(--color-icon-default)',
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
      // Dark headline only while active; muted drops back to the page's light context
      data-theme={isMuted ? undefined : 'dark'}
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
          onClick={() => !isMuted && setIsExpanded((open) => !open)}
          aria-expanded={isMuted ? undefined : isExpanded}
          aria-controls={bodyId}
          className='flex min-h-(--size-tap) min-w-0 flex-1 items-center gap-(--space-stack-sm) text-left'
        >
          <span
            aria-hidden='true'
            className={cn(
              'shrink-0 [&_svg]:size-4',
              ICON_TONES[isMuted ? 'muted' : variant],
            )}
          >
            {icon}
          </span>
          <span id={titleId} className='text-control min-w-0 flex-1'>
            {title}
            {isMuted && (
              <span className='font-medium text-(--color-text-disabled)'>
                {' '}
                · Muted
              </span>
            )}
          </span>
          {/* No expand affordance while muted — details stay tucked away until unmuted */}
          {!isMuted && (
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
          )}
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
            <p className='text-meta text-(--color-text-secondary)'>
              {description}
            </p>

            {details && details.length > 0 && (
              <ul className='flex flex-col gap-(--space-stack-xs) border-t border-(--color-border-default) pt-(--space-stack-sm)'>
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
