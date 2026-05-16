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

// Helper: Smart Team Name Deduplication
const cleanTeamName = (rawName: string | undefined | null): string => {
  if (!rawName) return 'Unknown Team';

  const words = rawName.split(' ').filter((w) => w !== '-' && w.trim() !== '');
  const seenWords = new Set<string>();
  const cleanedWords: string[] = [];

  for (const word of words) {
    const lowercaseWord = word.toLowerCase();

    // Skip 1-character suffixes (like 'B') and duplicates
    if (word.length > 1 && !seenWords.has(lowercaseWord)) {
      seenWords.add(lowercaseWord);
      cleanedWords.push(word);
    }
  }

  return cleanedWords.length > 0 ? cleanedWords.join(' ') : rawName;
};

export function mapApiToMatch(raw: RawScrapedMatch): Match {
  // Extract clean date and time FIRST so we can use them for status checks
  const { date: formattedDate, time: formattedTime } = parseDateTime(
    raw.date_time,
  );

  let homeScore: number | undefined;
  let awayScore: number | undefined;
  let status: MatchStatus = 'upcoming';

  const lowerStatus = (raw.score_or_status || '').toLowerCase();

  // --- Status & Score Parsing ---
  if (lowerStatus.includes('cancel')) {
    status = 'canceled';
  } else if (raw.score_or_status && raw.score_or_status.includes('-')) {
    const [homeRaw, awayRaw] = raw.score_or_status.split('-');
    homeScore = safeScore(homeRaw);
    awayScore = safeScore(awayRaw);

    // Explicitly check for numbers, not just truthiness (since score can be 0)
    if (homeScore !== undefined && awayScore !== undefined) {
      status = 'final';
    }
  }

  // --- Time-based fallback for hidden scores ---
  if (status === 'upcoming' && formattedDate !== 'TBD') {
    // Inject a space before AM/PM ("1:00PM" -> "1:00 PM") so the server can parse it
    const safeTime = formattedTime.replace(/([AP]M)/i, ' $1');
    const timeToParse = formattedTime === 'TBD' ? '11:59 PM' : safeTime;

    // Append "EST" so the server knows this isn't a UTC time
    const matchDate = new Date(`${formattedDate} ${timeToParse} EST`);

    if (!isNaN(matchDate.getTime())) {
      const now = Date.now();
      const kickoffMs = matchDate.getTime();

      // Add 105 minutes (90 min game + 15 min halftime) to kickoff
      const gameEndMs = kickoffMs + 105 * 60000;

      if (now > gameEndMs) {
        // If current time is past the end of the game, it's final
        status = 'final';
      } else if (now >= kickoffMs && now <= gameEndMs) {
        // If current time is between kickoff and end time, it's live!
        status = 'live';
      }
    }
  }

  // --- Determine Utility ---
  const getTeamUtility = (name: string | undefined | null): Team['utility'] => {
    if (!name) return 'away';
    const n = name.toLowerCase();
    if (n.includes('soricha')) return 'soricha';
    if (n.includes('bag') || n.includes('b-and-g') || n.includes('b&g'))
      return 'b-and-g';
    return 'away';
  };

  // --- Result Logic ---
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
  };
}
