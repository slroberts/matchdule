export type MatchStatus = 'upcoming' | 'live' | 'final' | 'canceled';
export type MatchResult = 'W' | 'L' | 'D' | null;

export interface Team {
  name: string;
  utility: 'b-and-g' | 'soricha' | 'away'; // Matches your @utility classes
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

  // UI Specific Flags
  isConflict?: boolean;
  isTightGap?: boolean;
}
