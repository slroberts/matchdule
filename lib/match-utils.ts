import { Radio, CheckCircle2, XCircle, LucideIcon } from 'lucide-react';
import { Match, MatchStatus } from '@/types/match';

/* =====================================================================
   TYPES & INTERFACES
   ===================================================================== */

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

/* =====================================================================
   UI & PRESENTATION UTILITIES
   ===================================================================== */

/**
 * Sets game status icons, labels, and styles based on game status
 */
export const getStatusConfig = (status: MatchStatus): StatusConfig | null => {
  const configs: Record<string, StatusConfig> = {
    live: {
      label: 'LIVE',
      icon: Radio,
      className: 'text-status-conflict animate-pulse font-black',
    },
    final: {
      label: 'FINAL',
      icon: CheckCircle2,
      className: 'text-surface-muted font-bold',
    },
    canceled: {
      label: 'CANCELED',
      icon: XCircle,
      className: 'text-status-conflict line-through opacity-70',
    },
  };

  return configs[status] || null;
};

/* =====================================================================
   DOMAIN & LIST HELPERS
   ===================================================================== */

/**
 * Helper to always grab tracked team's name, regardless of Home/Away status
 */
export const getTrackedTeam = (m: Match) => {
  const home = m.homeTeam.name;
  const away = m.awayTeam.name;

  // Check if the home team contains our target keywords
  if (home.includes('B&G') || home.includes('Soricha')) return home;

  // Check the away team
  if (away.includes('B&G') || away.includes('Soricha')) return away;

  // Fallback just in case neither matches
  return home;
};

/**
 * Helper to always grab the opponent's name by finding our tracked team first
 */
export const getOpponentTeam = (m: Match) => {
  const trackedTeam = getTrackedTeam(m);
  return m.homeTeam.name === trackedTeam ? m.awayTeam.name : m.homeTeam.name;
};

/**
 * Formats a long team name into a clean, scannable short name for UI alerts.
 * Converts "B&G 2017 Boys Elite Blue" -> "B&G 2017"
 */
export const formatShortName = (name: string, wordCount = 2) => {
  return name.split(' ').slice(0, wordCount).join(' ');
};

/**
 * Determines if there are matches before or after the current week
 * to enable/disable pagination arrows.
 */
export function getPaginationBounds(
  allMatches: Match[],
  weekEnd: Date,
  weekStart: Date,
) {
  if (allMatches.length === 0) return { hasPrev: false, hasNext: false };

  const firstMatchDate = new Date(allMatches[0].date).getTime();
  const lastMatchDate = new Date(
    allMatches[allMatches.length - 1].date,
  ).getTime();

  const endOfSunday = new Date(weekEnd);
  endOfSunday.setHours(23, 59, 59, 999);

  return {
    hasPrev: weekStart.getTime() > firstMatchDate,
    hasNext: endOfSunday.getTime() < lastMatchDate,
  };
}

/* =====================================================================
   CORE SCHEDULING ENGINE
   ===================================================================== */

// ---------------------------------------------------------------------
// Internal Time Parser (Private helper for analyzeMatchSpacing)
// ---------------------------------------------------------------------
const getMsFromTime = (timeStr: string) => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;

  const [, hStr, mStr, modifier] = match;
  const rawHours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);

  const hours =
    modifier.toUpperCase() === 'PM' && rawHours < 12
      ? rawHours + 12
      : modifier.toUpperCase() === 'AM' && rawHours === 12
        ? 0
        : rawHours;

  return new Date(2000, 0, 1, hours, minutes).getTime();
};

/**
 * Analyzes the spacing between two matches to determine if they conflict
 * or have a tight gap.
 * @param tightGapThresholdMins Defines how many minutes between games triggers a warning (default: 60)
 */
export function analyzeMatchSpacing(
  matchA: Match,
  matchB: Match,
  tightGapThresholdMins = 60,
): {
  isConflict: boolean;
  isTightGap: boolean;
  overlapMins: number;
  gapMins: number;
} {
  if (matchA.time === 'TBD' || matchB.time === 'TBD') {
    return { isConflict: false, isTightGap: false, overlapMins: 0, gapMins: 0 };
  }

  if (matchA.date !== matchB.date) {
    return { isConflict: false, isTightGap: false, overlapMins: 0, gapMins: 0 };
  }

  const startA = getMsFromTime(matchA.time);
  const startB = getMsFromTime(matchB.time);

  const matchDurationMs = 90 * 60000; // 90 minutes
  const endA = startA + matchDurationMs;
  const endB = startB + matchDurationMs;

  // Calculate Overlap
  const overlapMs = Math.min(endA, endB) - Math.max(startA, startB);
  const isConflict = overlapMs > 0;
  const overlapMins = isConflict ? Math.round(overlapMs / 60000) : 0;

  // Calculate Gap
  const gapMs = startA > startB ? startA - endB : startB - endA;
  const gapMins = gapMs >= 0 ? Math.round(gapMs / 60000) : 0;
  const isTightGap = !isConflict && gapMins <= tightGapThresholdMins;

  return { isConflict, isTightGap, overlapMins, gapMins };
}

/* =====================================================================
   DATA ORCHESTRATORS
   ===================================================================== */

/**
 * Processes a week's matches to detect conflicts, tight gaps,
 * and generate the descriptive alert text.
 */
export function processWeekSpacing(currentWeekMatches: Match[]) {
  const conflictDetails: string[] = [];
  const tightGapDetails: string[] = [];
  const tbdDetails: string[] = [];
  const processedPairs = new Set<string>();

  const matchesWithSpacingStatus = currentWeekMatches.map((match) => {
    let isConflict = false;
    let isTightGap = false;

    const isPast = match.status === 'final' || match.status === 'canceled';

    // Only run if the match is still active
    if (!isPast) {
      const myTeam = formatShortName(getTrackedTeam(match));

      // Check for TBD and build the detail string
      if (match.time === 'TBD') {
        const opponent = formatShortName(getOpponentTeam(match));
        tbdDetails.push(`${myTeam} vs ${opponent}`);
      }

      currentWeekMatches.forEach((otherMatch) => {
        if (
          match.id === otherMatch.id ||
          otherMatch.status === 'final' ||
          otherMatch.status === 'canceled'
        ) {
          return;
        }

        const pairKey = [match.id, otherMatch.id].sort().join('-');
        const spacing = analyzeMatchSpacing(match, otherMatch, 60);

        const teamA = formatShortName(getTrackedTeam(match));
        const teamB = formatShortName(getTrackedTeam(otherMatch));

        if (spacing.isConflict) {
          isConflict = true;
          if (!processedPairs.has(pairKey)) {
            conflictDetails.push(
              `${teamA} ${match.time} ↔ ${teamB} ${otherMatch.time} (overlap ${spacing.overlapMins} min)`,
            );
            processedPairs.add(pairKey);
          }
        }

        if (spacing.isTightGap) {
          isTightGap = true;
          if (!processedPairs.has(pairKey)) {
            tightGapDetails.push(
              `${teamA} ${match.time} → ${teamB} ${otherMatch.time} (${spacing.gapMins} min gap)`,
            );
            processedPairs.add(pairKey);
          }
        }
      });
    }

    return { ...match, isConflict, isTightGap };
  });

  return {
    matchesWithSpacingStatus,
    conflictDetails,
    tightGapDetails,
    tbdDetails,
    hasConflict: conflictDetails.length > 0,
    hasTightGap: tightGapDetails.length > 0,
    hasTBD: tbdDetails.length > 0,
  };
}
