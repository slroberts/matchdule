import { Match, MatchStatus, MatchResult, Team } from '@/types/match';

interface RawScrapedMatch {
  team_queried: string;
  game_id: string;
  date_time: string;
  home_team: string;
  score_or_status: string;
  away_team: string;
  venue: string;
}

export function mapApiToMatch(raw: RawScrapedMatch): Match {
  // Parsing "Mar 29, 2026 10:30AM"
  const [datePart, yearPart, timePart] = raw.date_time.split(' ');
  const formattedDate = `${datePart} ${yearPart.replace(',', '')}`;
  const formattedTime = timePart;

  // Parsing "2 - 1" or "Upcoming" or "Canceled"
  const isFinal = raw.score_or_status.includes('-');
  let homeScore: number | undefined;
  let awayScore: number | undefined;
  let status: MatchStatus = 'upcoming';

  if (isFinal) {
    const scores = raw.score_or_status
      .split('-')
      .map((s) => parseInt(s.trim()));
    homeScore = scores[0];
    awayScore = scores[1];
    status = 'final';
  } else if (raw.score_or_status.toLowerCase().includes('cancel')) {
    status = 'canceled';
  }

  // Determine Utility
  const getTeamUtility = (name: string): Team['utility'] => {
    const n = name.toLowerCase();
    if (n.includes('soricha')) return 'soricha';
    if (n.includes('bag') || n.includes('b-and-g')) return 'b-and-g';
    return 'away';
  };

  // Result Logic
  const getResult = (sA?: number, sB?: number): MatchResult => {
    if (sA === undefined || sB === undefined) return null;
    if (sA > sB) return 'W';
    if (sA < sB) return 'L';
    return 'D';
  };

  return {
    id: raw.game_id,
    homeTeam: {
      name: raw.home_team,
      utility: getTeamUtility(raw.home_team),
      score: homeScore,
      result: getResult(homeScore, awayScore),
    },
    awayTeam: {
      name: raw.away_team,
      utility: getTeamUtility(raw.away_team),
      score: awayScore,
      result: getResult(awayScore, homeScore),
    },
    date: formattedDate,
    time: formattedTime,
    location: raw.venue
      .split('-')[0]
      .trim()
      .replace('FIELD', '')
      .replace('  ', ' '),
    status,
  };
}
