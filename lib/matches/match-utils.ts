import {
  CheckCircle2,
  Flag,
  Hourglass,
  Radio,
  TriangleAlert,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Match, MatchStatus, UrgencyOption } from '@/types/match';
import { MATCH_PLAY_MINUTES } from '@/lib/matches/match-constants';

/* =====================================================================
   TYPES & INTERFACES
   ===================================================================== */

interface StatusConfig {
  /** Sentence case — caps come from the text-label style */
  label: string;
  icon: LucideIcon;
  /** Token classes (bg + text) merged over the neutral badge */
  className: string;
}

/** Card-level urgencies — TBD is a filter option, not a card state */
export type MatchUrgency = Exclude<UrgencyOption, 'tbd'>;

interface UrgencyConfig {
  /** Sentence case — caps come from the text-label style */
  label: string;
  icon: LucideIcon;
  /** Icon color (UrgencyIcon) */
  iconClass: string;
  /** Inline label color on a surface (VersusCard meta line) */
  textClass: string;
}

/* =====================================================================
   RESULT STATE
   ===================================================================== */

/** Both scores reported */
export const hasScores = (m: Pick<Match, 'homeTeam' | 'awayTeam'>) =>
  m.homeTeam.score !== undefined && m.awayTeam.score !== undefined;

/**
 * The game is over but the league hasn't posted the score yet.
 * Shown as "Pending" (hourglass) instead of FINAL with empty dashes.
 */
export const isAwaitingResult = (
  m: Pick<Match, 'homeTeam' | 'awayTeam'>,
  status: MatchStatus,
) => status === 'final' && !hasScores(m);

/* =====================================================================
   UI & PRESENTATION UTILITIES
   ===================================================================== */

/**
 * Status badge config. Live is rendered by MatchHeader (pulsing dot), but kept
 * here for other consumers.
 */
export const getStatusConfig = (
  status: MatchStatus,
  {
    awaitingResult = false,
    note,
  }: { awaitingResult?: boolean; note?: string } = {},
): StatusConfig | null => {
  if (status === 'final' && awaitingResult) {
    // Not a problem, just not posted yet → neutral, gray hourglass
    return {
      label: 'Pending',
      icon: Hourglass,
      className:
        'bg-(--color-bg-subtle) text-(--color-text-primary) [&_svg]:text-(--color-icon-default)',
    };
  }

  const configs: Partial<Record<MatchStatus, StatusConfig>> = {
    live: {
      label: 'Live',
      icon: Radio,
      className:
        'bg-(--color-bg-subtle) text-(--color-text-primary) [&_svg]:text-(--color-danger-icon)',
    },
    final: {
      label: 'Final',
      icon: CheckCircle2,
      className: 'bg-(--color-bg-subtle) text-(--color-text-secondary)',
    },
    canceled: {
      label: note ?? 'Canceled',
      icon: XCircle,
      className:
        'bg-(--color-bg-subtle) text-(--color-text-primary) [&_svg]:text-(--color-danger-icon)',
    },
  };

  return configs[status] ?? null;
};

/**
 * Urgency config — one source for icon, label and tokens.
 * Mirrors Figma's `Urgency` variant on VersusCard + MatchRowCompact.
 */
export const URGENCY: Record<MatchUrgency, UrgencyConfig> = {
  conflict: {
    label: 'Conflict',
    icon: Flag,
    iconClass: 'text-(--color-danger-icon)',
    textClass: 'text-(--color-danger-on-surface)',
  },
  'tight-gap': {
    label: 'Tight gap',
    icon: TriangleAlert,
    iconClass: 'text-(--color-warning-icon)',
    textClass: 'text-(--color-warning-on-surface)',
  },
};

/** Conflict outranks tight gap — a card shows one urgency at most */
export const getUrgency = (
  m: Pick<Match, 'isConflict' | 'isTightGap'>,
): MatchUrgency | null =>
  m.isConflict ? 'conflict' : m.isTightGap ? 'tight-gap' : null;

/* =====================================================================
   DOMAIN & LIST HELPERS
   ===================================================================== */

/** Helper to always grab tracked team's name, regardless of Home/Away status */
export const getTrackedTeam = (m: Match) => {
  const home = m.homeTeam.name;
  const away = m.awayTeam.name;
  if (home.includes('B&G') || home.includes('Soricha')) return home;
  if (away.includes('B&G') || away.includes('Soricha')) return away;
  return home;
};

/** Helper to always grab the opponent's name by finding our tracked team first */
export const getOpponentTeam = (m: Match) => {
  const trackedTeam = getTrackedTeam(m);
  return m.homeTeam.name === trackedTeam ? m.awayTeam.name : m.homeTeam.name;
};

/**
 * Formats a long team name into a clean, scannable short name for UI alerts.
 * Converts "B&G 2017 Boys Elite Blue" -> "B&G 2017"
 */
export const formatShortName = (name: string, wordCount = 2) =>
  name.split(' ').slice(0, wordCount).join(' ');

/* ---------------------------------------------------------------------
   Team-name casing
   Source data mixes "ALBION SC Brooklyn" style shouting with real acronyms.
   Rule: an ALL-CAPS word becomes Title Case only if it looks like a word
   (≥ 4 letters, has a vowel, not a known acronym). SC / FC / SFA / PBSC stay.
   --------------------------------------------------------------------- */
const ACRONYMS = new Set([
  'AC',
  'AFC',
  'B&G',
  'CF',
  'EDP',
  'FA',
  'FC',
  'NY',
  'NYC',
  'PBSC',
  'PFC',
  'SA',
  'SC',
  'SFA',
  'USA',
  'YSC',
]);

const smartCaseWord = (word: string) => {
  // Stray caps inside a word ("CIty", "BRooklyn") → "City", "Brooklyn"
  if (/^[A-Z]{2,}[a-z]{2,}$/.test(word))
    return word.charAt(0) + word.slice(1).toLowerCase();
  const isAllCaps = /^[A-Z][A-Z'&.\-]*$/.test(word);
  if (!isAllCaps) return word;
  if (ACRONYMS.has(word) || word.length < 4 || !/[AEIOUY]/.test(word))
    return word;
  return word.charAt(0) + word.slice(1).toLowerCase();
};

/**
 * Display name: strips age brackets/divisions + fixes shouting case.
 * "FC Copa Academy Brooklyn B13/14 Black" -> "FC Copa Academy Brooklyn"
 * "ALBION SC Brooklyn"                    -> "Albion SC Brooklyn"
 * NOTE: display only — age detection must keep using the raw team.name.
 */
export const cleanTeamName = (name: string) => {
  if (!name) return '';

  let cleanName = name;

  // 1. Truncate from the age bracket onward (B13, U12, B-14, /14, EDP, "( - )", trailing 17)
  const truncationRegex =
    /(\b[BU][\-\/]?\d{1,2}\b|\/\s*\d{2}\b|\bEDP\b|\(\s*-\s*\)|\b17$).*/i;
  cleanName = cleanName.replace(truncationRegex, '');

  // 2. Leftover academy suffixes (" SA -", " SA B -")
  cleanName = cleanName.replace(/\bSA\s*B?\s*-$/i, '');

  // 3. Orphaned dashes / slashes / spaces at the end
  cleanName = cleanName.replace(/[\/\-\s]+$/, '');

  // 4. Casing
  return cleanName.trim().split(/\s+/).map(smartCaseWord).join(' ');
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
  // Timestamps, not the raw date text — "Nov 14 2026 Scheduled" parses to Invalid Date
  const times = allMatches.map((m) => m.timestamp).filter((t) => t > 0);
  if (times.length === 0) return { hasPrev: false, hasNext: false };

  const first = Math.min(...times);
  const last = Math.max(...times);

  const endOfSunday = new Date(weekEnd);
  endOfSunday.setHours(23, 59, 59, 999);

  return {
    hasPrev: weekStart.getTime() > first,
    hasNext: endOfSunday.getTime() < last,
  };
}

/* =====================================================================
   CORE SCHEDULING ENGINE
   ===================================================================== */

/** Internal time parser (private helper for analyzeMatchSpacing) */
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
 * @param tightGapThresholdMins Minutes between games that triggers a warning (default: 60)
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
  if (
    matchA.time === 'TBD' ||
    matchB.time === 'TBD' ||
    matchA.date !== matchB.date
  ) {
    return { isConflict: false, isTightGap: false, overlapMins: 0, gapMins: 0 };
  }

  const startA = getMsFromTime(matchA.time);
  const startB = getMsFromTime(matchB.time);

  const matchDurationMs = MATCH_PLAY_MINUTES * 60000;
  const endA = startA + matchDurationMs;
  const endB = startB + matchDurationMs;

  const overlapMs = Math.min(endA, endB) - Math.max(startA, startB);
  const isConflict = overlapMs > 0;
  const overlapMins = isConflict ? Math.round(overlapMs / 60000) : 0;

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

    if (!isPast) {
      const myTeam = formatShortName(getTrackedTeam(match));

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
