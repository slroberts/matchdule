import type { Match } from '@/types/match';
import { MATCH_LENGTH_MS } from '@/lib/matches/match-constants';
import { cleanTeamName } from '@/lib/matches/match-utils';
import { getAgeGroup, getClubLabel } from '@/lib/matches/team-meta';
import { NY_TZ } from '@/lib/dates/ny-time';

/**
 * Add to calendar — Figma: Organisms › CalendarMenu
 * Pure helpers (no DOM) so the .ics route and the Google link share one event model.
 *
 * - Duration = MATCH_LENGTH_MS, the same window the app uses before a game flips to Final,
 *   so a calendar's "busy" block matches what Matchdule shows as Live.
 * - Kickoff "TBD" → all-day event on the match date (never a made-up time).
 */

export interface MatchEvent {
  uid: string;
  title: string;
  location: string;
  description: string;
  allDay: boolean;
  /** UTC epoch ms — timed events */
  start: number;
  end: number;
  /** YYYYMMDD in New York — all-day events (end is exclusive, per RFC 5545) */
  startDate: string;
  endDate: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** 20261003T200000Z */
const toUtcStamp = (ms: number) => {
  const d = new Date(ms);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
};

/** Calendar date of a timestamp in New York → 20261003 */
const toNyDate = (ms: number) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: NY_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(new Date(ms))
    .replaceAll('-', '');

const nextDay = (yyyymmdd: string) => {
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6)) - 1;
  const d = Number(yyyymmdd.slice(6, 8));
  const next = new Date(Date.UTC(y, m, d + 1));
  return `${next.getUTCFullYear()}${pad(next.getUTCMonth() + 1)}${pad(next.getUTCDate())}`;
};

export const getMatchEvent = (match: Match): MatchEvent => {
  const isHomeGame = Boolean(
    match.homeTeam.utility && match.homeTeam.utility !== 'away',
  );
  const club = isHomeGame ? match.homeTeam : match.awayTeam;
  const opponent = isHomeGame ? match.awayTeam : match.homeTeam;

  const age = getAgeGroup(club.name);
  const clubLabel = getClubLabel(club, cleanTeamName(club.name));
  const title = `${clubLabel}${age ? ` ${age}` : ''} vs ${cleanTeamName(opponent.name)}`;

  const allDay = match.time === 'TBD';
  const location = match.location === 'TBD' ? '' : match.location;
  const startDate = toNyDate(match.timestamp);

  return {
    uid: `${match.id}@matchdule`,
    title,
    location,
    description: [
      `${isHomeGame ? 'Home' : 'Away'} game`,
      allDay && 'Kickoff time TBD — check Matchdule for updates.',
      !location && 'Field TBD.',
    ]
      .filter(Boolean)
      .join('\n'),
    allDay,
    start: match.timestamp,
    end: match.timestamp + MATCH_LENGTH_MS,
    startDate,
    endDate: nextDay(startDate),
  };
};

/* ── .ics (RFC 5545) ─────────────────────────────────────────────────────── */

/** Escape TEXT values: backslash, semicolon, comma, newline */
const escapeText = (value: string) =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/** Fold lines at 75 octets (UTF-8), continuation lines start with a space */
const fold = (line: string) => {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74; // continuation lines lose 1 octet to the leading space
    if (encoder.encode(current + char).length > limit) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join('\r\n ');
};

export const buildMatchIcs = (match: Match, now = Date.now()) => {
  const e = getMatchEvent(match);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Matchdule//Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.uid}`,
    `DTSTAMP:${toUtcStamp(now)}`,
    ...(e.allDay
      ? [`DTSTART;VALUE=DATE:${e.startDate}`, `DTEND;VALUE=DATE:${e.endDate}`]
      : [`DTSTART:${toUtcStamp(e.start)}`, `DTEND:${toUtcStamp(e.end)}`]),
    `SUMMARY:${escapeText(e.title)}`,
    ...(e.location ? [`LOCATION:${escapeText(e.location)}`] : []),
    `DESCRIPTION:${escapeText(e.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
};

/** "soricha-u13-vs-albion-sc-brooklyn.ics" */
export const icsFilename = (match: Match) =>
  `${getMatchEvent(match)
    .title.toLowerCase()
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}.ics`;

/* ── Google Calendar ─────────────────────────────────────────────────────── */

export const googleCalendarUrl = (match: Match) => {
  const e = getMatchEvent(match);
  const dates = e.allDay
    ? `${e.startDate}/${e.endDate}`
    : `${toUtcStamp(e.start)}/${toUtcStamp(e.end)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates,
    details: e.description,
    ctz: NY_TZ,
  });
  if (e.location) params.set('location', e.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
