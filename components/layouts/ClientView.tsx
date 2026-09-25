'use client';

import { useState, useEffect } from 'react';
import { Clock, Flag, FoldHorizontal } from 'lucide-react';
import { MatchList } from '@/components/modules/matches/MatchList';
import { Header } from '@/components/layouts/Header/Header';
import { TeamTabs } from './TeamTabs';
import { Alert } from '@/components/ui/Alert/Alert';
import { processWeekSpacing } from '@/lib/matches/match-utils';
import { getWeekData, getSeason } from '@/lib/dates/date-utils';
import { FilterState, Match, TabOption, TimeOfDayOption } from '@/types/match';
import { FilterDrawer } from './FilterDrawer/FilterDrawer';
import { AnimatePresence } from 'framer-motion';
import { StandingsView } from './StandingsView';

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
  initialTeam,
  initialFilters,
}: ClientViewProps) => {
  // Initialize state directly with the server's prop to prevent hydration flash
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState<TabOption>(initialTeam);
  const currentSeason = getSeason(weekInfo.weekStart);
  const [viewMode, setViewMode] = useState<'schedule' | 'standings'>(
    'schedule',
  );

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
    (filters.ageGroup !== 'all' ? 1 : 0) +
    (filters.homeAway !== 'all' ? 1 : 0) +
    filters.urgency.length +
    filters.timeOfDay.length +
    (filters.matchState !== 'all' ? 1 : 0) +
    (filters.resultsState !== null ? 1 : 0);

  // Set up boundary dates for the current week to calculate dynamic visibility
  const endOfSunday = new Date(weekInfo.weekEnd);
  // Push forward 12 hours to safely bypass any UTC-to-Local negative timezone shifts
  endOfSunday.setHours(endOfSunday.getHours() + 12);
  endOfSunday.setHours(23, 59, 59, 999);

  const startOfMonday = new Date(weekInfo.weekStart);
  // Push forward 12 hours to safely bypass any UTC-to-Local negative timezone shifts
  startOfMonday.setHours(startOfMonday.getHours() + 12);
  startOfMonday.setHours(0, 0, 0, 0);

  // Dynamically verify if matches exist outside the current view bounds
  const realHasNext = allMatches.some(
    (match) => match.timestamp > endOfSunday.getTime(),
  );
  const realHasPrev = allMatches.some(
    (match) => match.timestamp < startOfMonday.getTime(),
  );

  // Main Unified Filtration Engine
  const displayedMatches = allMatches.filter((match) => {
    const matchTime = match.timestamp;

    // UPDATE THIS LINE: Use startOfMonday instead of weekInfo.weekStart
    const isThisWeek =
      matchTime >= startOfMonday.getTime() &&
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

    // DRAWER FILTER A: AGE GROUP
    if (filters.ageGroup !== 'all') {
      const home = match.homeTeam.name || '';
      const away = match.awayTeam.name || '';

      if (filters.ageGroup === 'u13') {
        const isU13 =
          home.includes('Soricha Foot SFA EDP') ||
          away.includes('Soricha Foot SFA EDP');
        if (!isU13) return false;
      }

      if (filters.ageGroup === 'u9') {
        const isU9 =
          home.includes('Soricha Foot SFA /18') ||
          away.includes('Soricha Foot SFA /18');
        if (!isU9) return false;
      }
    }

    // DRAWER FILTER B: TEAM SIDE
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

    // DRAWER FILTER C: URGENCY ALERTS
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

    // DRAWER FILTER D: TIME OF DAY
    if (filters.timeOfDay.length > 0) {
      const matchPeriod = getTimePeriod(match.time);
      if (!filters.timeOfDay.includes(matchPeriod as TimeOfDayOption))
        return false;
    }

    // DRAWER FILTER E: MATCH STATUS
    if (filters.matchState !== 'all') {
      if (match.status !== filters.matchState) return false;
    }

    // DRAWER FILTER F: RESULTS
    if (filters.resultsState && filters.resultsState !== null) {
      // 1. Identify our team dynamically
      let myTeam;
      if (currentTeam !== 'All Teams') {
        const targetUtility = getUtilityFromTab(currentTeam);
        myTeam =
          match.homeTeam.utility === targetUtility
            ? match.homeTeam
            : match.awayTeam;
      } else {
        const isHomeOurs =
          match.homeTeam.utility === 'b-and-g' ||
          match.homeTeam.utility === 'soricha';
        myTeam = isHomeOurs ? match.homeTeam : match.awayTeam;
      }

      // 2. Safely grab the strings and standardize them to uppercase
      const rawResult = myTeam?.result || '';
      const activeFilter = filters.resultsState.toUpperCase();

      // 3. Map the strings just in case your drawer uses full words (e.g., 'WIN')
      // but your database uses letters (e.g., 'W')
      const isWin = activeFilter.startsWith('W') && rawResult.startsWith('W');
      const isLoss = activeFilter.startsWith('L') && rawResult.startsWith('L');
      const isDraw = activeFilter.startsWith('D') && rawResult.startsWith('D');

      // 4. If none of these match, drop the game from the list
      if (!isWin && !isLoss && !isDraw) {
        return false;
      }
    }

    return true;
  });

  const handleClearFilters = () => {
    setFilters({
      homeAway: 'all',
      urgency: [],
      timeOfDay: [],
      matchState: 'all',
      ageGroup: 'all',
      resultsState: null,
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
          seasonLabel={currentSeason}
          isCurrentWeek={weekInfo.isCurrentWeek}
          prevWeekDate={weekInfo.prevWeekDate}
          nextWeekDate={weekInfo.nextWeekDate}
          hasPrev={realHasPrev}
          hasNext={realHasNext}
          setIsFilterOpen={setIsFilterOpen}
          activeFilterCount={activeFilterCount}
          viewMode={viewMode}
        />

        <TeamTabs
          activeTeam={currentTeam}
          onTeamChange={handleTeamChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>

      <main className='px-6 py-2'>
        {viewMode === 'schedule' && (hasConflict || hasTightGap || hasTBD) && (
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
        {viewMode === 'schedule' ? (
          <MatchList
            matches={matchesWithSpacingStatus}
            hasActiveFilters={activeFilterCount > 0}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <StandingsView activeTeam={currentTeam} matches={allMatches} />
        )}
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
