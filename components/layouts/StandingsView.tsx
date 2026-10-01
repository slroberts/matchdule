import { Trophy } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { Match, TabOption } from '@/types/match';
import { getSeasonStats } from '@/lib/matches/season-stats';
import { SeasonSummary } from '@/components/modules/standings/SeasonSummary';
import { TeamSnapshot } from '@/components/modules/standings/TeamSnapshot';

/**
 * StandingsView (Season tab) — Figma: Standings / Season snapshot
 * Not a league table: "how are my teams doing?" at a glance — ONE season at a time.
 *   SeasonSummary hero (with ‹ › season pager) + one TeamSnapshot per team.
 * The season comes from the URL (?season=spring-2026); none/unknown → newest season.
 */

interface StandingsViewProps {
  activeTeam: TabOption;
  matches: Match[];
  /** "Spring 2026" from the URL, or null → newest season */
  selectedSeason?: string | null;
  /** Real link for a season (long-press / share) */
  seasonHrefFor?: (season: string) => string;
  /** Switch season in place (pushState, no refetch) */
  onSelectSeason?: (season: string) => void;
}

export const StandingsView = ({
  activeTeam,
  matches,
  selectedSeason,
  seasonHrefFor,
  onSelectSeason,
}: StandingsViewProps) => {
  const seasons = getSeasonStats(matches, activeTeam); // newest first

  if (seasons.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title='No results yet'
        body={
          <>
            Your teams&rsquo; records will show up here after their first final
            whistle.
          </>
        }
      />
    );
  }

  // Unknown or missing season (e.g. a team tab without that season) → newest
  const found = seasons.findIndex((s) => s.season === selectedSeason);
  const index = found === -1 ? 0 : found;
  const { season, teams, totals } = seasons[index];

  const target = (i: number) =>
    seasons[i]
      ? {
          season: seasons[i].season,
          href: seasonHrefFor?.(seasons[i].season) ?? '#',
        }
      : undefined;

  return (
    <div className='mx-auto flex w-full max-w-lg flex-col gap-(--space-stack-md) px-(--space-gutter)'>
      <SeasonSummary
        season={season}
        totals={totals}
        isLatest={index === 0}
        older={target(index + 1)}
        newer={target(index - 1)}
        onSelect={onSelectSeason}
      />
      {/* key on season so cards re-run their entrance when the season changes */}
      {teams.map((team) => (
        <div key={`${season}-${team.key}`} className='stagger-fade'>
          <TeamSnapshot team={team} />
        </div>
      ))}
    </div>
  );
};
