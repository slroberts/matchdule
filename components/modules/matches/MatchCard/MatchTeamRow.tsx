import SoccerBallIcon from '@/components/ui/icons/SoccerBall';
import { cn } from '@/lib/utils';
import { MatchStatus, Team } from '@/types/match';
import GameBadge from './GameBadge';
import { Badge } from '@/components/ui/Badge/Badge';
import { cleanTeamName } from '@/lib/matches/match-utils';

const MatchTeamRow = ({
  team,
  score,
  status,
}: {
  team: Team;
  score?: number;
  status: MatchStatus;
}) => {
  const teamBranding = team.utility ?? 'away';

  return (
    <div className='flex items-center justify-between w-full'>
      <div className='flex items-center gap-grid-md min-w-0 flex-1 pr-2'>
        <div className='bg-surface-canvas w-1 h-10 rounded-2xl shrink-0'></div>

        {/* The Icon Container */}
        <div
          className={cn(
            'flex items-center justify-center p-1 rounded-full shadow-md text-white shrink-0',
            teamBranding,
          )}
        >
          <SoccerBallIcon size={28} />
        </div>

        {/* Name and Badge Container */}
        <div className='flex flex-col items-start gap-2 min-w-0 flex-1'>
          {/* The Team Name Text: Removed w-64, added w-full & break-words, scaled text for mobile */}
          <div className='text-brand-navy font-black text-lg sm:text-xl tracking-normal leading-tight uppercase break-words w-full'>
            {cleanTeamName(team.name)}
          </div>

          <div className='-mt-1'>
            {/* The Badges */}
            {team.name?.includes('Soricha Foot SFA EDP') && (
              <Badge
                variant='default'
                className='px-2 py-0.5 text-white bg-brand-navy font-black tracking-widest'
              >
                U13
              </Badge>
            )}

            {team.name?.includes('Soricha Foot SFA /18') && (
              <Badge
                variant='default'
                className='px-2 py-0.5 text-white bg-brand-navy font-black tracking-widest'
              >
                U9
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Score Area */}
      <div className='text-brand-navy font-black text-2xl tabular-nums shrink-0 flex justify-end ml-2'>
        {status === 'upcoming' ? (
          <div className='bg-divider w-4 h-1 self-center rounded-full opacity-50' />
        ) : score !== undefined ? (
          <div className='text-right'>
            {/* Hide outcome result badges during live play windows */}
            {status !== 'live' && <GameBadge result={team.result!} />}
            <span
              className={
                team.result === 'L' ? 'text-status-draw' : 'text-brand-navy'
              }
            >
              {score}
            </span>
          </div>
        ) : (
          <span className='text-surface-muted text-xl opacity-50'>-</span>
        )}
      </div>
    </div>
  );
};

export default MatchTeamRow;
