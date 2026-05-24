'use client';

import { useState, useEffect } from 'react';
import { Clock, Flag, FoldHorizontal } from 'lucide-react';
import { MatchList } from '@/components/modules/matches/MatchList';
import { Header } from '@/components/layouts/Header/Header';
import { TeamTabs } from './TeamTabs';
import { Alert } from '@/components/ui/Alert/Alert';
import { processWeekSpacing } from '@/lib/matches/match-utils';
import { getWeekData } from '@/lib/dates/date-utils';
import { FilterState, Match, TabOption, TimeOfDayOption } from '@/types/match';
import { FilterDrawer } from './FilterDrawer/FilterDrawer';
import { AnimatePresence } from 'framer-motion';

interface ClientViewProps {
  allMatches: Match[];
  weekInfo: ReturnType<typeof getWeekData>;
  gameWeekNumber: number;
  hasPrev: boolean;
  hasNext: boolean;
  initialTeam: TabOption;
  initialFilters: FilterState;
}

const getUtilityFromTab = (tab: TabOption) => {
  if (tab === 'B&G') return 'b-and-g';
  if (tab === 'Soricha') return 'soricha';
  return null;
};

const getTimePeriod = (
  timeString: string,
): 'morning' | 'afternoon' | 'evening' | 'unknown' => {
  if (!timeString || timeString.toUpperCase() === 'TBD') return 'unknown';

  const upperTime = timeString.toUpperCase();
  const isPM = upperTime.includes('PM');
  const [hourStr] = upperTime.split(':');
  let hour = parseInt(hourStr, 10);

  if (isNaN(hour)) return 'unknown';
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  if (hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
};

export const ClientView = ({
  allMatches,
  weekInfo,
  gameWeekNumber,
  hasPrev,
  hasNext,
  initialTeam,
  initialFilters,
}: ClientViewProps) => {
  // Initialize state directly with the server's prop to prevent hydration flash
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<TabOption>(initialTeam);

  // Auto-sync to cookie whenever filters change
  useEffect(() => {
    const encodedFilters = encodeURIComponent(JSON.stringify(filters));
    document.cookie = `matchdule_filters=${encodedFilters}; path=/; max-age=31536000`;
  }, [filters]);

  const handleTeamChange = (team: TabOption) => {
    setCurrentTeam(team);
    document.cookie = `matchdule_selected_team=${team}; path=/; max-age=31536000`;
  };

  // Calculate exactly how many individual filters are currently applied
  const activeFilterCount =
    (filters.homeAway !== 'all' ? 1 : 0) +
    filters.urgency.length +
    filters.timeOfDay.length +
    (filters.matchState !== 'all' ? 1 : 0);

  // Main Unified Filtration Engine
  const displayedMatches = allMatches.filter((match) => {
    const matchTime = new Date(match.date).getTime();
    const endOfSunday = new Date(weekInfo.weekEnd);
    endOfSunday.setHours(23, 59, 59, 999);

    const isThisWeek =
      matchTime >= weekInfo.weekStart.getTime() &&
      matchTime <= endOfSunday.getTime();

    if (!isThisWeek) return false;

    let isRightTeam = true;
    const targetUtility = getUtilityFromTab(currentTeam);

    if (currentTeam !== 'All Teams') {
      isRightTeam =
        match.homeTeam.utility === targetUtility ||
        match.awayTeam.utility === targetUtility;
    }
    if (!isRightTeam) return false;

    // DRAWER FILTER A: TEAM SIDE
    if (filters.homeAway !== 'all') {
      const isHomeSelected = filters.homeAway === 'home';

      if (currentTeam !== 'All Teams') {
        const activeSideUtility = isHomeSelected
          ? match.homeTeam.utility
          : match.awayTeam.utility;
        if (activeSideUtility !== targetUtility) return false;
      } else {
        const targetSideTeam = isHomeSelected ? match.homeTeam : match.awayTeam;
        const isInternalOnTargetSide =
          targetSideTeam.utility === 'b-and-g' ||
          targetSideTeam.utility === 'soricha';
        if (!isInternalOnTargetSide) return false;
      }
    }

    // DRAWER FILTER B: URGENCY ALERTS
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

    // DRAWER FILTER C: TIME OF DAY
    if (filters.timeOfDay.length > 0) {
      const matchPeriod = getTimePeriod(match.time);
      if (!filters.timeOfDay.includes(matchPeriod as TimeOfDayOption))
        return false;
    }

    // DRAWER FILTER D: MATCH STATUS
    if (filters.matchState !== 'all') {
      if (match.status !== filters.matchState) return false;
    }

    return true;
  });

  const handleClearFilters = () => {
    setFilters({
      homeAway: 'all',
      urgency: [],
      timeOfDay: [],
      matchState: 'all',
    });
  };

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
    <>
      <div className='sticky top-0 z-50 w-full flex flex-col'>
        <Header
          dateRange={weekInfo.dateRange}
          weekNumber={gameWeekNumber}
          isCurrentWeek={weekInfo.isCurrentWeek}
          prevWeekDate={weekInfo.prevWeekDate}
          nextWeekDate={weekInfo.nextWeekDate}
          hasPrev={hasPrev}
          hasNext={hasNext}
          setIsFilterOpen={setIsFilterOpen}
          activeFilterCount={activeFilterCount}
        />

        <TeamTabs activeTeam={currentTeam} onTeamChange={handleTeamChange} />
      </div>

      <main className='px-6 py-2'>
        {(hasConflict || hasTightGap || hasTBD) && (
          <div className='flex flex-col gap-3 w-full max-w-md mx-auto mb-6'>
            {hasConflict && (
              <Alert
                variant='destructive'
                icon={<Flag size={18} strokeWidth={2.5} />}
                title={`${conflictDetails.length} Schedule Conflict${conflictDetails.length > 1 ? 's' : ''}`}
                description='You have overlapping matches. You cannot be in two places at once.'
                details={conflictDetails}
              />
            )}

            {hasTightGap && !hasConflict && (
              <Alert
                variant='warning'
                icon={<FoldHorizontal size={18} strokeWidth={2.5} />}
                title={`${tightGapDetails.length} Schedule Overlap${tightGapDetails.length > 1 ? 's' : ''}`}
                description='Matches are scheduled very close together. Pack snacks and plan travel accordingly.'
                details={tightGapDetails}
              />
            )}

            {hasTBD && (
              <Alert
                variant='warning'
                icon={<Clock size={18} strokeWidth={2.5} />}
                title={`${tbdDetails.length} Schedule Note${tbdDetails.length > 1 ? 's' : ''}`}
                description={`The exact kickoff time for ${tbdDetails.length > 1 ? 'these matches' : 'the match'} is currently TBD.`}
                details={tbdDetails}
              />
            )}
          </div>
        )}

        <MatchList
          matches={matchesWithSpacingStatus}
          hasActiveFilters={activeFilterCount > 0}
          onClearFilters={handleClearFilters}
        />
      </main>

      <AnimatePresence>
        {isFilterOpen && (
          <FilterDrawer
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </AnimatePresence>
    </>
  );
};
