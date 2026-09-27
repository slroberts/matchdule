'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Clock, Flag, TriangleAlert } from 'lucide-react';
import { MatchList } from '@/components/modules/matches/MatchList';
import { Header } from '@/components/layouts/Header/Header';
import { TeamTabs } from './TeamTabs';
import { Alert } from '@/components/ui/Alert/Alert';
import { processWeekSpacing } from '@/lib/matches/match-utils';
import { getWeekData, getSeason, getTimePeriod } from '@/lib/dates/date-utils';
import { FilterState, Match, TabOption, TimeOfDayOption } from '@/types/match';
import {
  DEFAULT_FILTERS,
  FilterDrawer,
  getActiveFilterCount,
  normalizeFilters,
} from './FilterDrawer/FilterDrawer';
import { StandingsView } from './StandingsView';
import { ActiveFilters } from './ActiveFilters';
import { TabBar } from './TabBar';

interface ClientViewProps {
  allMatches: Match[];
  weekInfo: ReturnType<typeof getWeekData>;
  gameWeekNumber: number;
  hasPrev: boolean;
  hasNext: boolean;
  initialTeam: TabOption;
  initialFilters: FilterState;
}

const INTERNAL_UTILITIES = ['b-and-g', 'soricha'];

const getUtilityFromTab = (tab: TabOption) => {
  if (tab === 'B&G') return 'b-and-g';
  if (tab === 'Soricha') return 'soricha';
  return null;
};

const isTeamMatch = (match: Match, team: TabOption) => {
  if (team === 'All Teams') return true;
  const utility = getUtilityFromTab(team);
  return (
    match.homeTeam.utility === utility || match.awayTeam.utility === utility
  );
};

/** Local YYYY-MM-DD for ?date= links (any day inside the target week) */
const toDateParam = (timestamp: number) => {
  const d = new Date(timestamp);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const ClientView = ({
  allMatches,
  weekInfo,
  initialTeam,
  initialFilters,
}: ClientViewProps) => {
  // normalizeFilters repairs cookies saved with the old resultsState: 'all' bug
  const [filters, setFilters] = useState<FilterState>(() =>
    normalizeFilters(initialFilters),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<TabOption>(initialTeam);
  const currentSeason = getSeason(weekInfo.weekStart);
  const [viewMode, setViewMode] = useState<'schedule' | 'standings'>(
    'schedule',
  );

  // Persist filters (effect updates an external system — the cookie — which is the correct use)
  useEffect(() => {
    const encodedFilters = encodeURIComponent(JSON.stringify(filters));
    document.cookie = `matchdule_filters=${encodedFilters}; path=/; max-age=31536000`;
  }, [filters]);

  const handleTeamChange = (team: TabOption) => {
    setCurrentTeam(team);
    document.cookie = `matchdule_selected_team=${team}; path=/; max-age=31536000`;
  };

  const activeFilterCount = getActiveFilterCount(filters);

  // Week boundaries (+12h guards against UTC → local negative offsets)
  const endOfSunday = new Date(weekInfo.weekEnd);
  endOfSunday.setHours(endOfSunday.getHours() + 12);
  endOfSunday.setHours(23, 59, 59, 999);

  const startOfMonday = new Date(weekInfo.weekStart);
  startOfMonday.setHours(startOfMonday.getHours() + 12);
  startOfMonday.setHours(0, 0, 0, 0);

  const realHasNext = allMatches.some(
    (m) => m.timestamp > endOfSunday.getTime(),
  );
  const realHasPrev = allMatches.some(
    (m) => m.timestamp < startOfMonday.getTime(),
  );

  // Rest-week escape hatch: this team's next match after the current week
  const nextTeamMatch = allMatches
    .filter(
      (m) => m.timestamp > endOfSunday.getTime() && isTeamMatch(m, currentTeam),
    )
    .reduce<
      Match | undefined
    >((soonest, m) => (!soonest || m.timestamp < soonest.timestamp ? m : soonest), undefined);
  const nextMatch = nextTeamMatch
    ? {
        href: `/?date=${toDateParam(nextTeamMatch.timestamp)}`,
        label: new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).format(new Date(nextTeamMatch.timestamp)),
      }
    : undefined;

  // Main filtration engine
  const displayedMatches = allMatches.filter((match) => {
    const isThisWeek =
      match.timestamp >= startOfMonday.getTime() &&
      match.timestamp <= endOfSunday.getTime();
    if (!isThisWeek) return false;
    if (!isTeamMatch(match, currentTeam)) return false;

    const targetUtility = getUtilityFromTab(currentTeam);

    // A: Age group
    if (filters.ageGroup !== 'all') {
      const home = match.homeTeam.name || '';
      const away = match.awayTeam.name || '';
      const needle =
        filters.ageGroup === 'u13'
          ? 'Soricha Foot SFA EDP'
          : 'Soricha Foot SFA /18';
      if (!home.includes(needle) && !away.includes(needle)) return false;
    }

    // B: Team side
    if (filters.homeAway !== 'all') {
      const sideTeam =
        filters.homeAway === 'home' ? match.homeTeam : match.awayTeam;
      const isOursOnSide =
        currentTeam !== 'All Teams'
          ? sideTeam.utility === targetUtility
          : INTERNAL_UTILITIES.includes(sideTeam.utility ?? '');
      if (!isOursOnSide) return false;
    }

    // C: Alerts
    if (filters.urgency.length > 0) {
      const hasConflict =
        filters.urgency.includes('conflict') && match.isConflict;
      const hasTightGap =
        filters.urgency.includes('tight-gap') && match.isTightGap;
      const hasTbd =
        filters.urgency.includes('tbd') &&
        (!match.time || match.time.toUpperCase() === 'TBD');
      if (!hasConflict && !hasTightGap && !hasTbd) return false;
    }

    // D: Time of day
    if (filters.timeOfDay.length > 0) {
      const period = getTimePeriod(match.time);
      if (!filters.timeOfDay.includes(period as TimeOfDayOption)) return false;
    }

    // E: Match status
    if (filters.matchState !== 'all' && match.status !== filters.matchState)
      return false;

    // F: Result (only reachable with Final — enforced by normalizeFilters)
    if (filters.resultsState) {
      const myTeam =
        currentTeam !== 'All Teams'
          ? match.homeTeam.utility === targetUtility
            ? match.homeTeam
            : match.awayTeam
          : INTERNAL_UTILITIES.includes(match.homeTeam.utility ?? '')
            ? match.homeTeam
            : match.awayTeam;

      const wanted = filters.resultsState[0].toUpperCase(); // 'W' | 'L' | 'D'
      if (!(myTeam?.result ?? '').toUpperCase().startsWith(wanted))
        return false;
    }

    return true;
  });

  const {
    matchesWithSpacingStatus,
    conflictDetails,
    tightGapDetails,
    tbdDetails,
    hasConflict,
    hasTightGap,
    hasTBD,
  } = processWeekSpacing(displayedMatches);

  return (
    <div className='flex min-h-dvh flex-col'>
      {/* Sticky chrome: token z-index keeps it BELOW the scrim + sheet.
          Sits on the dark <body>, so the iOS status-bar edge samples dark, never the canvas. */}
      <div className='sticky top-0 z-(--z-header) flex w-full flex-col'>
        <Header
          dateRange={weekInfo.dateRange}
          seasonLabel={currentSeason}
          isCurrentWeek={weekInfo.isCurrentWeek}
          prevWeekDate={weekInfo.prevWeekDate}
          nextWeekDate={weekInfo.nextWeekDate}
          hasPrev={realHasPrev}
          hasNext={realHasNext}
          setIsFilterOpen={setIsFilterOpen}
          activeFilterCount={activeFilterCount}
        />
        {/* Opaque canvas so cards don't show through the tabs while scrolling */}
        <div className='bg-(--color-bg-canvas) pt-(--space-stack-sm)'>
          <TeamTabs activeTeam={currentTeam} onTeamChange={handleTeamChange} />
        </div>
      </div>

      {/* Bottom padding clears the floating TabBar + home indicator */}
      <main className='page-canvas flex-1 pt-(--space-stack-sm) pb-[calc(var(--size-tab-bar)+var(--safe-bottom)+24px)]'>
        {/* Applied filters — Figma: Schedule / Filters active */}
        {/* Always mounted in schedule view: its live region must survive "Clear all" */}
        {viewMode === 'schedule' && (
          <ActiveFilters filters={filters} setFilters={setFilters} />
        )}

        {viewMode === 'schedule' && (hasConflict || hasTightGap || hasTBD) && (
          <div className='mx-auto mb-(--space-stack-md) flex w-full max-w-lg flex-col gap-(--space-stack-sm) px-(--space-gutter)'>
            {hasConflict && (
              <Alert
                variant='destructive'
                icon={<Flag size={16} strokeWidth={1.5} absoluteStrokeWidth />}
                title={`${plural(conflictDetails.length, 'conflict')} this week`}
                description='These matches overlap — you can’t be at both.'
                details={conflictDetails}
              />
            )}

            {hasTightGap && !hasConflict && (
              <Alert
                variant='warning'
                icon={
                  <TriangleAlert
                    size={16}
                    strokeWidth={1.5}
                    absoluteStrokeWidth
                  />
                }
                title={`${plural(tightGapDetails.length, 'tight gap')} this week`}
                description='Less than an hour between games. Plan travel and pack snacks.'
                details={tightGapDetails}
              />
            )}

            {hasTBD && (
              <Alert
                variant='warning'
                icon={<Clock size={16} strokeWidth={1.5} absoluteStrokeWidth />}
                title={`${plural(tbdDetails.length, 'kickoff time')} TBD`}
                description={`We’ll show the time as soon as ${tbdDetails.length > 1 ? 'they’re' : 'it’s'} confirmed.`}
                details={tbdDetails}
              />
            )}
          </div>
        )}

        {viewMode === 'schedule' ? (
          <MatchList
            matches={matchesWithSpacingStatus}
            hasActiveFilters={activeFilterCount > 0}
            onClearFilters={() => setFilters(DEFAULT_FILTERS)}
            nextMatch={nextMatch}
          />
        ) : (
          <StandingsView activeTeam={currentTeam} matches={allMatches} />
        )}
      </main>

      <TabBar viewMode={viewMode} setViewMode={setViewMode} />

      <AnimatePresence>
        {isFilterOpen && (
          <FilterDrawer
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            setFilters={setFilters}
            matchCount={displayedMatches.length}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
