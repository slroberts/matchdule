import { Game } from "@/types/schedule";
import { parse } from "csv-parse/sync";

type Row = {
  Date?: string;
  Day?: string;
  Time?: string;
  Team?: string;
  Location?: string;
  Opponent?: string;
  "Home/Away"?: string;
  "W/L/D"?: string;
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

function normalizeHA(v?: string): "HOME" | "AWAY" | "TBD" {
  const s = (v || "").trim().toUpperCase();
  if (s.startsWith("HOME") || s === "H") return "HOME";
  if (s.startsWith("AWAY") || s === "A") return "AWAY";
  if (s === "TBD" || !s) return "TBD";
  return "TBD";
}

/** Parse "MM/DD/YYYY" strictly into numeric parts. Returns null if not in MDY. */
function parseMDY(input: string) {
  const m = input.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  return { year, month, day };
}

export async function fetchSchedule(): Promise<Game[]> {
  const id = process.env.NEXT_PUBLIC_SCHEDULE_SHEET_ID!;
  const gid = process.env.NEXT_PUBLIC_SCHEDULE_GID!;
  const url = csvUrl(id, gid);

  const res = await fetch(url, { cache: "no-store" });
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

    const parts = parseMDY(r.Date);
    if (!parts) continue; // ignore non-game/non-date rows
    const { year, month, day } = parts;

    // Anchor the calendar date to "noon UTC" to prevent SSR timezone drift
    const dateISO = new Date(
      Date.UTC(year, month - 1, day, 12, 0, 0),
    ).toISOString();

    // Build start/end from components (local arithmetic)
    function parseTimeRangeLocal(): {
      start: string | null;
      end: string | null;
      timeText: string;
    } {
      const raw = (r.Time || "").trim();
      if (!raw || raw.toUpperCase() === "TBD") {
        return { start: null, end: null, timeText: "TBD" };
      }

      const norm = raw.replace(/\s+/g, "").toUpperCase();

      const toHM = (s: string) => {
        // supports "8:00AM", "5:15PM", "17:15", "800", "1715"
        const m12 = s.match(/^(\d{1,2})(?::?(\d{2}))?(AM|PM)$/);
        const m24 = s.match(/^(\d{1,2})(?::?(\d{2}))$/);
        let h = 0,
          mi = 0;
        if (m12) {
          h = Number(m12[1]);
          mi = Number(m12[2] || 0);
          const ap = m12[3];
          if (ap === "PM" && h < 12) h += 12;
          if (ap === "AM" && h === 12) h = 0;
        } else if (m24) {
          h = Number(m24[1]);
          mi = Number(m24[2] || 0);
        } else {
          return null;
        }
        return { h, mi };
      };

      const pad = (n: number) => String(n).padStart(2, "0");
      const toNaiveISO = (
        y: number,
        m: number,
        d: number,
        h: number,
        mi: number,
        s = 0,
      ) => `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(mi)}:${pad(s)}`;

      // in parseTimeRangeLocal()
      const toISO = (h: number, mi: number) =>
        toNaiveISO(year, month, day, h, mi);

      if (norm.includes("-")) {
        // Range like "8:00-9:00 AM" or "4:00-5:00PM"
        const [Lraw, Rraw] = raw
          .split("-", 2)
          .map((s) => s.trim().toUpperCase());
        const ap = Rraw.match(/\b(AM|PM)\b/)?.[1];
        const Lfix = /\b(AM|PM)\b/.test(Lraw) || !ap ? Lraw : `${Lraw} ${ap}`;

        const a = toHM(Lfix.replace(/\s+/g, ""));
        const b = toHM(Rraw.replace(/\s+/g, ""));
        if (!a || !b) return { start: null, end: null, timeText: raw };

        return {
          start: toISO(a.h, a.mi),
          end: toISO(b.h, b.mi),
          timeText: raw,
        };
      }

      // Single time → assume 60 minutes
      const a = toHM(norm);
      if (!a) return { start: null, end: null, timeText: raw };
      const start = toISO(a.h, a.mi);
      const end = toNaiveISO(year, month, day, a.h, a.mi + 60);
      return { start, end, timeText: raw };
    }

    const { start, end, timeText } = parseTimeRangeLocal();
    const [scoreFor, scoreAgainst] = parseScore(r.Score);
    const resultRaw = (r["W/L/D"] || "").toUpperCase() as Game["result"];

    games.push({
      id: `g_${r.Date}_${r.Team}_${r.Opponent}`.replace(/\s+/g, ""),
      week: currentWeek,
      dateISO,
      startISO: start,
      endISO: end,
      timeText,
      day: (r.Day || "").trim(),
      team: (r.Team || "").trim(),
      location: (r.Location || "").trim(),
      opponent: (r.Opponent || "").trim(),
      homeAway: normalizeHA(r["Home/Away"]),
      result:
        resultRaw === "W" || resultRaw === "L" || resultRaw === "D"
          ? resultRaw
          : null,
      scoreFor,
      scoreAgainst,
    });
  }

  // Sort by day then time (TBD at end of the day)
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
