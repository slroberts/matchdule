import { Match, MatchStatus, MatchResult, Team } from '@/types/match';
import { MATCH_LENGTH_MS } from '@/lib/matches/match-constants';

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
  return Number.isNaN(parsed) ? undefined : parsed;
};

/** "RANDALL'S ISLAND" → "Randall's Island"; mixed-case names keep their casing ('S → 's only) */
const tidyVenueCase = (s: string): string =>
  /[a-z]/.test(s)
    ? s.replace(/'S\b/g, "'s")
    : s
        .toLowerCase()
        .replace(
          /(^|[\s\-/(])([a-z])/g,
          (_match: string, sep: string, c: string) => sep + c.toUpperCase(),
        );

// Helper: Venue Sanitization
const cleanVenue = (venue: string | null | undefined): string => {
  if (!venue || venue.trim() === '') return 'TBD';
  const cleaned = venue
    // Drop a " - Field 3" style suffix, but keep hyphens INSIDE names ("Bedford-Stuyvesant Park")
    .split(/\s+-\s+/)[0]
    .trim()
    // Only a standalone trailing "FIELD" / "FIELD 3" / "FIELD #3" — never inside "FIELDS"
    .replace(/\bFIELD\b(\s*#?\d+)?\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned === '' ? 'TBD' : tidyVenueCase(cleaned);
};

// Helper: Date & Time Parsing
// Extracts ONLY "Mon DD, YYYY" — ignores status words ("Scheduled", "Rescheduled"),
// timezones and stray letters, so match.date is always clean.
const parseDateTime = (rawDateTime: string) => {
  const normalized = rawDateTime
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const timeMatch = normalized.match(/\d{1,2}:\d{2}\s?[AP]M/i);
  const time = timeMatch ? timeMatch[0].toUpperCase() : 'TBD';

  const dateMatch = normalized.match(
    /\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/,
  );
  const month = dateMatch
    ? dateMatch[1].charAt(0).toUpperCase() +
      dateMatch[1].slice(1, 3).toLowerCase()
    : '';
  const date = dateMatch
    ? `${month} ${dateMatch[2]}, ${dateMatch[3]}`
    : normalized;

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

    const monthIndex = months[dateParts[0].toLowerCase().substring(0, 3)];
    const day = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    if (monthIndex === undefined || Number.isNaN(day) || Number.isNaN(year))
      return null;

    let hours = 12;
    let minutes = 0;

    if (timeStr && timeStr !== 'TBD') {
      const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
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

    // VERCEL FIX: dynamic Eastern offset (EDT vs EST) for this specific date
    const targetDateUTC = new Date(Date.UTC(year, monthIndex, day));
    const nyFormat = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      timeZoneName: 'short',
    }).format(targetDateUTC);
    const offset = nyFormat.includes('EDT') ? '-04:00' : '-05:00';

    const pad = (n: number) => n.toString().padStart(2, '0');
    return new Date(
      `${year}-${pad(monthIndex + 1)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00${offset}`,
    );
  } catch {
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

/** Our clubs. Word-boundary matches, so an opponent merely containing "bag" isn't B&G. */
const getTeamUtility = (name: string | undefined | null): Team['utility'] => {
  if (!name) return 'away';
  if (/soricha/i.test(name)) return 'soricha';
  if (/\bb\s*&\s*g\b|\bb-and-g\b|\bbag\b/i.test(name)) return 'b-and-g';
  return 'away';
};

const getResult = (sA?: number, sB?: number): MatchResult => {
  if (sA === undefined || sB === undefined) return null;
  if (sA > sB) return 'W';
  if (sA < sB) return 'L';
  return 'D';
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
    if (homeScore !== undefined && awayScore !== undefined) status = 'final';
  }

  const matchDate = parseCrossBrowserDate(formattedDate, formattedTime);
  const timestamp = matchDate ? matchDate.getTime() : 0;

  // ── Time-based status: the clock decides whether the GAME is over.
  //    A missing score is a display state ("Pending" via isAwaitingResult), NOT "upcoming" —
  //    otherwise last season's unscored games keep showing up as "Next up".
  if (status === 'upcoming' && timestamp !== 0) {
    const now = Date.now();
    if (now > timestamp + MATCH_LENGTH_MS) status = 'final';
    else if (now >= timestamp) status = 'live';
  }

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
