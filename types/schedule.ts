export type TeamFilter = "All Teams" | string;
export type Game = {
  id: string;
  week: string | null;
  dateISO: string;
  startISO: string | null;
  endISO: string | null;
  timeText: string;
  day: string;
  team: string;
  location: string;
  opponent: string;
  homeAway: HomeAway;
  result: Result;
  scoreFor: number | null;
  scoreAgainst: number | null;
};

export type HomeAway = "HOME" | "AWAY" | "TBD";
export type Result = "W" | "L" | "D" | null;
export type Daypart = "morning" | "afternoon" | "evening";

export type Filters = {
  homeAway: HomeAway[];
  result: Result[];
  dayparts: Daypart[];
};

export type FilterScope = "week" | "all";
