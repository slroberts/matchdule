export type TeamFilter = 'All Teams' | 'B&G 2017' | 'B&G 2015' | 'Soricha 2014';
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
  homeAway: 'HOME' | 'AWAY' | 'TBD';
  result: 'W' | 'L' | 'D' | null;
  scoreFor: number | null;
  scoreAgainst: number | null;
};
