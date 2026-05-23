// ============================================================================
// Navigation & Tab Types
// ============================================================================

export const TABS = ['All Teams', 'B&G', 'Soricha'] as const;
export type TabOption = (typeof TABS)[number];

// ============================================================================
// Core Match & Team Entities
// ============================================================================

export type MatchStatus = 'upcoming' | 'live' | 'final' | 'canceled';
export type MatchResult = 'W' | 'L' | 'D' | null;

export interface Team {
  name: string;
  utility: 'b-and-g' | 'soricha' | 'away';
  score?: number;
  result?: MatchResult;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  time: string;
  location: string;
  date: string;
  status: MatchStatus;
  timestamp: number;
  isConflict?: boolean;
  isTightGap?: boolean;
}

// ============================================================================
// Filter System Types & Initial State
// ============================================================================

export type HomeAwayFilter = 'all' | 'home' | 'away';
export type UrgencyOption = 'conflict' | 'tight-gap' | 'tbd';
export type MatchStateFilter = 'all' | 'upcoming' | 'live' | 'final';
export type TimeOfDayOption = 'all' | 'morning' | 'afternoon' | 'evening';

export interface FilterState {
  homeAway: HomeAwayFilter;
  urgency: UrgencyOption[];
  matchState: MatchStateFilter;
  timeOfDay: TimeOfDayOption[];
}

export const INITIAL_FILTERS: FilterState = {
  homeAway: 'all',
  urgency: [],
  matchState: 'all',
  timeOfDay: [],
};
