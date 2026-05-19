export const TABS = ['All Teams', 'B&G', 'Soricha'] as const;
export type TabOption = (typeof TABS)[number];

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
