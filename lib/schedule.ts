import { parse } from 'csv-parse/sync';

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

// CSV columns expected for data rows
type Row = {
  Date?: string;
  Day?: string;
  Time?: string;
  Team?: string;
  Location?: string;
  Opponent?: string;
  'Home/Away'?: string;
  'W/L/D'?: string;
  Score?: string;
};

function csvUrl(id: string, gid: string) {
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`;
}

function parseScore(score?: string): [number | null, number | null] {
  if (!score) return [null, null];
  const m = score.match(/(\d+)\s*[-–]\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : [null, null];
}

function normalizeHA(v?: string): 'HOME' | 'AWAY' | 'TBD' {
  const s = (v || '').trim().toUpperCase();
  if (s.startsWith('HOME') || s === 'H') return 'HOME';
  if (s.startsWith('AWAY') || s === 'A') return 'AWAY';
  if (s === 'TBD' || !s) return 'TBD';
  return 'TBD';
}

// Accepts: "8:00-9:00 AM", "4:00-5:00PM", "11:00 AM", "17:15", "TBD"
function parseTimeRange(dateStr: string, timeCell?: string) {
  if (!timeCell) return { start: null, end: null, timeText: 'TBD' };
  const raw = timeCell.trim();
  if (!raw || raw.toUpperCase() === 'TBD')
    return { start: null, end: null, timeText: 'TBD' };

  // Try ranges
  const range = raw.replace(/\s+/g, '').toUpperCase();
  const hasDash = range.includes('-');

  const toISO = (d: Date) => (isNaN(d.getTime()) ? null : d.toISOString());

  if (hasDash) {
    const [left, right] = raw.split('-', 2).map((s) => s.trim());
    // inherit AM/PM from right if missing on left
    const ampm = right.match(/\b(AM|PM)\b/i)?.[1] ?? '';
    const leftFixed = /\b(AM|PM)\b/i.test(left)
      ? left
      : ampm
      ? `${left} ${ampm}`
      : left;

    const start = new Date(`${dateStr} ${leftFixed}`);
    const end = new Date(`${dateStr} ${right}`);
    return { start: toISO(start), end: toISO(end), timeText: raw };
  }

  // Single time (12h or 24h); assume 60m duration
  const start = new Date(`${dateStr} ${raw}`);
  const end = isNaN(start.getTime())
    ? null
    : new Date(start.getTime() + 60 * 60 * 1000);
  return { start: toISO(start), end: toISO(end as Date), timeText: raw };
}

export async function fetchSchedule(): Promise<Game[]> {
  const id = process.env.NEXT_PUBLIC_SCHEDULE_SHEET_ID!;
  const gid = process.env.NEXT_PUBLIC_SCHEDULE_GID!;
  const url = csvUrl(id, gid);

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
  const csv = await res.text();

  // Parse loosely; we’ll handle "Week N" spacer rows manually
  const rows = parse(csv, { columns: true, skip_empty_lines: true }) as Row[];

  let currentWeek: string | null = null;
  const games: Game[] = [];

  for (const r of rows) {
    // Detect a "Week N" spacer row in the Date column
    if (r.Date && /^Week\s*\d+/i.test(r.Date.trim())) {
      currentWeek = r.Date.trim(); // e.g., "Week 1"
      continue;
    }

    // If it doesn't look like a game row, skip
    if (!r.Date || !r.Team) continue;

    const dateISO = new Date(r.Date).toISOString();
    const { start, end, timeText } = parseTimeRange(r.Date, r.Time);
    const [scoreFor, scoreAgainst] = parseScore(r.Score);
    const resultRaw = (r['W/L/D'] || '').toUpperCase() as Game['result'];

    games.push({
      id: `g_${r.Date}_${r.Team}_${r.Opponent}`.replace(/\s+/g, ''),
      week: currentWeek,
      dateISO,
      startISO: start,
      endISO: end,
      timeText,
      day: (r.Day || '').trim(),
      team: (r.Team || '').trim(),
      location: (r.Location || '').trim(),
      opponent: (r.Opponent || '').trim(),
      homeAway: normalizeHA(r['Home/Away']),
      result:
        resultRaw === 'W' || resultRaw === 'L' || resultRaw === 'D'
          ? resultRaw
          : null,
      scoreFor,
      scoreAgainst,
    });
  }

  // Sort by start (TBD at end of same day)
  games.sort((a, b) => {
    const da = a.dateISO.localeCompare(b.dateISO);
    if (da !== 0) return da;
    if (a.startISO && b.startISO) return a.startISO.localeCompare(b.startISO);
    if (a.startISO && !b.startISO) return -1;
    if (!a.startISO && b.startISO) return 1;
    return 0;
  });

  return games;
}
