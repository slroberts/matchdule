import { cn } from '@/lib/utils';
import { URGENCY, type MatchUrgency } from '@/lib/matches/match-utils';

const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

/**
 * UrgencyIcon — Figma: `Urgency icon` layer (VersusCard, MatchRowCompact)
 * `announce`: true when the icon is the ONLY signal (compact row);
 *             false when a visible label sits next to it (VersusCard meta).
 */
export const UrgencyIcon = ({
  urgency,
  announce = true,
}: {
  urgency: MatchUrgency | null;
  announce?: boolean;
}) => {
  if (!urgency) return null;
  const { icon: Icon, label, iconClass } = URGENCY[urgency];
  return (
    <span className={cn('shrink-0', iconClass)}>
      <Icon {...ICON} aria-hidden='true' />
      {announce && <span className='visually-hidden'>{label}</span>}
    </span>
  );
};
