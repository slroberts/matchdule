import { Trophy } from 'lucide-react';
import { Match, TabOption } from '@/types/match';
import { getSeasonStats } from '@/lib/matches/season-stats';
import { SeasonSummary } from '@/components/modules/standings/SeasonSummary';
import { TeamSnapshot } from '@/components/modules/standings/TeamSnapshot';

/**
 * StandingsView — Figma: Standings / Season snapshot
 * Not a league table: "how are my teams doing?" at a glance.
 *   newest season → SeasonSummary hero + one TeamSnapshot per team
 *   older seasons → heading + TeamSnapshots
 */

interface StandingsViewProps {
  activeTeam: TabOption;
  matches: Match[];
}

export const StandingsView = ({ activeTeam, matches }: StandingsViewProps) => {
  const seasons = getSeasonStats(matches, activeTeam);

  if (seasons.length === 0) {
    return (
      <div className='stagger-fade mx-auto flex w-full max-w-lg flex-col items-center gap-(--space-stack-md) px-(--space-card-pad) py-8 text-center'>
        <div className='grid size-18 place-items-center rounded-full bg-(--color-bg-surface) text-(--color-icon-default) shadow-(--shadow-raised)'>
          <Trophy
            size={28}
            strokeWidth={1.5}
            absoluteStrokeWidth
            aria-hidden='true'
          />
        </div>
        <h3 className='text-score text-(--color-text-primary)'>
          No results yet
        </h3>
        <p className='text-meta max-w-70 text-(--color-text-secondary)'>
          Your teams&rsquo; records will show up here after their first final
          whistle.
        </p>
      </div>
    );
  }

  return (
    <div className='mx-auto flex w-full max-w-lg flex-col gap-8 px-(--space-gutter)'>
      {seasons.map(({ season, teams, totals }, index) => (
        <section
          key={season}
          aria-label={season}
          className='flex flex-col gap-(--space-stack-md)'
        >
          {index === 0 ? (
            <SeasonSummary season={season} totals={totals} />
          ) : (
            <h2 className='text-label text-(--color-text-secondary)'>
              {season}
            </h2>
          )}
          {teams.map((team) => (
            <div key={team.key} className='stagger-fade'>
              <TeamSnapshot team={team} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
};
