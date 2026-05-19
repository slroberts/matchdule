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

// Helper: Safe Score Parsing
const safeScore = (score: string | null | undefined): number | undefined => {
  if (!score || score.trim() === '') return undefined;
  const parsed = parseInt(score.trim(), 10);
  return isNaN(parsed) ? undefined : parsed;
};

// Helper: Venue Sanitization
const cleanVenue = (venue: string | null | undefined): string => {
  if (!venue || venue.trim() === '') return 'TBD';
  const cleaned = venue
    .split('-')[0]
    .trim()
    .replace('FIELD', '')
    .replace('  ', ' ')
    .trim();
  return cleaned === '' ? 'TBD' : cleaned;
};

// Helper: Date & Time Parsing
const parseDateTime = (rawDateTime: string) => {
  const normalized = rawDateTime
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const timeMatch = normalized.match(/\d{1,2}:\d{2}[AP]M/i);

  let time = 'TBD';
  let date = normalized;

  if (timeMatch) {
    time = timeMatch[0].toUpperCase();
    date = normalized.replace(timeMatch[0], '');
  }

  date = date
    .replace(/CDT|EST|EDT|Rescheduled/gi, '')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Add comma back before the 4-digit year
  date = date.replace(/ (\d{4})$/, ', $1');

  return { date, time };
};

// Exported Helper: Cross-Browser Device Agnostic Date Parser
export const parseCrossBrowserDate = (
  dateStr: string,
  timeStr: string,
): Date | null => {
  try {
    const months: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };

    const dateParts = dateStr.replace(/,/g, '').split(' ').filter(Boolean);
    if (dateParts.length < 3) return null;

    const monthName = dateParts[0].toLowerCase().substring(0, 3);
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    const monthIndex = months[monthName];

    if (monthIndex === undefined || isNaN(day) || isNaN(year)) return null;

    let hours = 12;
    let minutes = 0;

    if (timeStr && timeStr !== 'TBD') {
      const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
      const timeParts = timeStr.match(timeRegex);

      if (timeParts) {
        const [, hrStr, minStr, ampm] = timeParts;
        hours = parseInt(hrStr, 10);
        minutes = parseInt(minStr, 10);

        if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
    } else {
      hours = 23;
      minutes = 59;
    }

    return new Date(year, monthIndex, day, hours, minutes);
  } catch (e) {
    return null;
  }
};

// Helper: Smart Team Name Deduplication
const cleanTeamName = (rawName: string | undefined | null): string => {
  if (!rawName) return 'Unknown Team';

  const words = rawName.split(' ').filter((w) => w !== '-' && w.trim() !== '');
  const seenWords = new Set<string>();
  const cleanedWords: string[] = [];

  for (const word of words) {
    const lowercaseWord = word.toLowerCase();

    if (word.length > 1 && !seenWords.has(lowercaseWord)) {
      seenWords.add(lowercaseWord);
      cleanedWords.push(word);
    }
  }

  return cleanedWords.length > 0 ? cleanedWords.join(' ') : rawName;
};

export function mapApiToMatch(raw: RawScrapedMatch): Match {
  const { date: formattedDate, time: formattedTime } = parseDateTime(
    raw.date_time,
  );

  let homeScore: number | undefined;
  let awayScore: number | undefined;
  let status: MatchStatus = 'upcoming';

  const lowerStatus = (raw.score_or_status || '').toLowerCase();

  if (lowerStatus.includes('cancel')) {
    status = 'canceled';
  } else if (raw.score_or_status && raw.score_or_status.includes('-')) {
    const [homeRaw, awayRaw] = raw.score_or_status.split('-');
    homeScore = safeScore(homeRaw);
    awayScore = safeScore(awayRaw);

    if (homeScore !== undefined && awayScore !== undefined) {
      status = 'final';
    }
  }

  // Generate the unified target date single execution instance
  const matchDate = parseCrossBrowserDate(formattedDate, formattedTime);
  const timestamp = matchDate ? matchDate.getTime() : 0;

  // --- Time-based live status evaluation loop ---
  if (status === 'upcoming' && timestamp !== 0) {
    const now = Date.now();
    const gameEndMs = timestamp + 105 * 60000; // Kickoff + 105 minutes

    if (now > gameEndMs) {
      status = 'final';
    } else if (now >= timestamp && now <= gameEndMs) {
      status = 'live';
    }
  }

  const getTeamUtility = (name: string | undefined | null): Team['utility'] => {
    if (!name) return 'away';
    const n = name.toLowerCase();
    if (n.includes('soricha')) return 'soricha';
    if (n.includes('bag') || n.includes('b-and-g') || n.includes('b&g'))
      return 'b-and-g';
    return 'away';
  };

  const getResult = (sA?: number, sB?: number): MatchResult => {
    if (sA === undefined || sB === undefined) return null;
    if (sA > sB) return 'W';
    if (sA < sB) return 'L';
    return 'D';
  };

  return {
    id: raw.game_id,
    homeTeam: {
      name: cleanTeamName(raw.home_team),
      utility: getTeamUtility(raw.home_team),
      score: homeScore,
      result: getResult(homeScore, awayScore),
    },
    awayTeam: {
      name: cleanTeamName(raw.away_team),
      utility: getTeamUtility(raw.away_team),
      score: awayScore,
      result: getResult(awayScore, homeScore),
    },
    date: formattedDate,
    time: formattedTime,
    location: cleanVenue(raw.venue),
    status,
    timestamp,
  };
}
