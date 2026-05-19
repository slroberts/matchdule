'use client';

import { useState } from 'react';
import { Clock, Flag, FoldHorizontal } from 'lucide-react';
import { MatchList } from '@/components/modules/matches/MatchList';
import { Header } from '@/components/layouts/Header/Header';
import { Alert } from '@/components/ui/Alert/Alert';
import { processWeekSpacing } from '@/lib/match-utils';
import { getWeekData } from '@/lib/date-utils';
import { Match, TabOption } from '@/types/match';

interface ClientViewProps {
  allMatches: Match[];
  weekInfo: ReturnType<typeof getWeekData>;
  gameWeekNumber: number;
  hasPrev: boolean;
  hasNext: boolean;
  initialTeam: TabOption;
}

const getUtilityFromTab = (tab: TabOption) => {
  if (tab === 'B&G') return 'b-and-g';
  if (tab === 'Soricha') return 'soricha';
  return null;
};

export const ClientView = ({
  allMatches,
  weekInfo,
  gameWeekNumber,
  hasPrev,
  hasNext,
  initialTeam,
}: ClientViewProps) => {
  // Initialize state directly with the server's cookie value. Zero flash!
  const [currentTeam, setCurrentTeam] = useState<TabOption>(initialTeam);

  // Update React state AND save to a cookie simultaneously
  const handleTeamChange = (team: TabOption) => {
    setCurrentTeam(team);
    // Path=/ ensures it works across the whole app. Max-age = 1 year.
    document.cookie = `matchdule_selected_team=${team}; path=/; max-age=31536000`;
  };

  // Filter matches by BOTH the current week AND the selected team
  const currentWeekMatches = allMatches.filter((match) => {
    // Week check
    const matchTime = new Date(match.date).getTime();
    const endOfSunday = new Date(weekInfo.weekEnd);
    endOfSunday.setHours(23, 59, 59, 999);
    const isThisWeek =
      matchTime >= weekInfo.weekStart.getTime() &&
      matchTime <= endOfSunday.getTime();

    let isRightTeam = true;
    if (currentTeam !== 'All Teams') {
      const targetUtility = getUtilityFromTab(currentTeam);

      // Check if EITHER the home or away team matches the selected tab
      isRightTeam =
        match.homeTeam.utility === targetUtility ||
        match.awayTeam.utility === targetUtility;
    }

    return isThisWeek && isRightTeam;
  });

  const {
    matchesWithSpacingStatus,
    conflictDetails,
    tightGapDetails,
    tbdDetails,
    hasConflict,
    hasTightGap,
    hasTBD,
  } = processWeekSpacing(currentWeekMatches);

  return (
    <>
      <Header
        dateRange={weekInfo.dateRange}
        weekNumber={gameWeekNumber}
        isCurrentWeek={weekInfo.isCurrentWeek}
        prevWeekDate={weekInfo.prevWeekDate}
        nextWeekDate={weekInfo.nextWeekDate}
        hasPrev={hasPrev}
        hasNext={hasNext}
        activeTeam={currentTeam}
        onTeamChange={handleTeamChange}
      />

      <main className='p-6'>
        {/* Render Alerts dynamically based on the filtered list */}
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

        <MatchList matches={matchesWithSpacingStatus} />
      </main>
    </>
  );
};
