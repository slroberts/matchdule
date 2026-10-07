import { cn } from '@/lib/utils';
import { MatchStatus, Team } from '@/types/match';
import { cleanTeamName } from '@/lib/matches/match-utils';
import { getAgeGroup, getCrestBrand } from '@/lib/matches/team-meta';
import { Badge } from '@/components/ui/Badge/Badge';
import { Crest } from '@/components/ui/Crest/Crest';
import GameBadge from './GameBadge';

/**
 * MatchTeamRow — Figma: Molecules › TeamRow + Atoms › Crest
 * [Crest ball] [Name (bold, 2-line clamp) + Age tag · FILL] [Result word stacked on Score]
 *
 * Type tiers: name + score = Title/Score (700) · age = Label (11/12px caps, quiet tag)
 * Result word shows once, on the club's row at Final. Losing score is muted.
 */

const MatchTeamRow = ({
  team,
  score,
  status,
  isClub,
}: {
  team: Team;
  score?: number;
  status: MatchStatus;
  /** Club perspective (for the result word) — crest colorway comes from team.utility */
  isClub: boolean;
}) => {
  const name = cleanTeamName(team.name);
  const age = getAgeGroup(team);
  // Only when a score exists — a finished game without one shows "Awaiting score" in the header instead
  const showScore =
    (status === 'live' || status === 'final') && score !== undefined;
  const isLoser = status === 'final' && team.result === 'L';
  const showResult = isClub && status === 'final' && Boolean(team.result);

  return (
    <div className='flex w-full items-center gap-(--space-stack-md)'>
      <Crest brand={getCrestBrand(team)} />

      <div className='flex min-w-0 flex-1 flex-col items-start gap-(--space-stack-xs)'>
        <span className='text-title clamp-2 text-(--color-text-primary)'>
          {name}
        </span>
        {age && <Badge variant='inverse'>{age}</Badge>}
      </div>

      {showScore && (
        /* Result word stacked above the score, right-aligned in a fixed-width column */
        <div className='flex min-w-[2ch] shrink-0 flex-col items-end gap-1'>
          {showResult && team.result && (
            <GameBadge result={team.result} variant='label' />
          )}
          <span
            className={cn(
              'text-score text-right',
              isLoser
                ? 'text-(--color-text-secondary)'
                : 'text-(--color-text-primary)',
            )}
          >
            <span className='visually-hidden'>{name} score: </span>
            {score}
          </span>
        </div>
      )}
    </div>
  );
};

export default MatchTeamRow;
