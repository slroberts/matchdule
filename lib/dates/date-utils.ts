import { Clock, Moon, Sun, Sunset, type LucideIcon } from 'lucide-react';

/* ──────────────────────────────────────────────────────────────────────────
   Time of day — ONE definition shared by the match card icon, the filter
   drawer's Morning/Afternoon/Evening chips, and ClientView's filtering.
     morning   < 12:00 PM   → Sun
     afternoon 12:00–4:59   → Sunset
     evening   ≥ 5:00 PM    → Moon
     unknown   TBD/invalid  → Clock
   ────────────────────────────────────────────────────────────────────────── */

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'unknown';

/** Parses "1:00 PM", "1:00PM", "1 pm", "12:30 am" → 24h hour, or null. */
const toHour24 = (time?: string): number | null => {
  const m = time?.trim().match(/^(\d{1,2})(?::\d{2})?\s*([ap])\.?m\.?$/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const isPM = m[2].toLowerCase() === 'p';
  if (hour < 1 || hour > 12) return null;
  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  return hour;
};

export const getTimePeriod = (time?: string): TimePeriod => {
  const hour = toHour24(time);
  if (hour === null) return 'unknown';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const PERIOD_ICON: Record<TimePeriod, LucideIcon> = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
  unknown: Clock,
};

const PERIOD_LABEL: Record<TimePeriod, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  unknown: 'Time TBD',
};

/**
 * Icon + label for a kickoff time — same icons as the filter chips.
 * `isLateAfternoon` is kept for existing callers (3 PM or later, before evening).
 */
export const getTimeOfDayAssets = (
  time: string,
): {
  TimeIcon: LucideIcon;
  period: TimePeriod;
  label: string;
  /** @deprecated use `period` */
  isLateAfternoon: boolean;
} => {
  const period = getTimePeriod(time);
  const hour = toHour24(time);
  return {
    TimeIcon: PERIOD_ICON[period],
    period,
    label: PERIOD_LABEL[period],
    isLateAfternoon: hour !== null && hour >= 15 && hour < 17,
  };
};

/**
 * Determines the season (Spring, Summer, Fall, Winter) and year for a given date.
 * Spring: Mar–May · Off season: Jun–Aug and Dec–Feb · Fall: Sep–Nov
 */
export function getSeason(date: Date): string {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  const year = date.getFullYear();

  if (month >= 2 && month <= 4) return `Spring ${year}`;
  if (month >= 8 && month <= 10) return `Fall ${year}`;
  return `Off Season`;
}

/**
 * Take any date and figure out the Monday-to-Sunday range,
 * the ISO week number, and whether it represents the current real-world week.
 */
export function getWeekData(targetDate?: Date | string) {
  // Get exact New York time parts (Bypasses Vercel UTC server traps)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    weekday: 'short',
  });

  const parts = formatter.formatToParts(new Date());
  const ny = {} as Record<string, string>;
  parts.forEach(({ type, value }) => (ny[type] = value));

  // Safely initialize "Today" at Noon to avoid midnight timezone jumps
  const nyNow = new Date(`${ny.year}-${ny.month}-${ny.day}T12:00:00`);

  const nyToday = new Date(nyNow);
  nyToday.setHours(0, 0, 0, 0);

  // Defensively parse the target date
  let date: Date;

  if (!targetDate) {
    date = new Date(nyToday);
  } else {
    const safeString =
      typeof targetDate === 'string' && !targetDate.includes('T')
        ? `${targetDate}T12:00:00`
        : targetDate;

    date = new Date(safeString);

    if (isNaN(date.getTime())) {
      date = new Date(nyToday);
    }
  }

  // Find the Monday of the target week
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);

  const monday = new Date(date);
  monday.setDate(diff);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Format the Date Range — en dash (–), not a hyphen, for ranges
  const startMonth = monday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = monday.getDate();
  const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const endDay = sunday.getDate();

  const dateRange =
    startMonth === endMonth
      ? `${startMonth} ${startDay} – ${endDay}`
      : `${startMonth} ${startDay} – ${endMonth} ${endDay}`;

  // Calculate ISO Week Number
  const targetThursday = new Date(monday);
  targetThursday.setDate(monday.getDate() + 3);
  const firstThursday = new Date(targetThursday.getFullYear(), 0, 4);
  const daysBetween =
    (targetThursday.getTime() - firstThursday.getTime()) / 86400000;
  const weekNumber = 1 + Math.round(daysBetween / 7);

  // Find the Monday of "Today"
  const currentDay = nyToday.getDay();
  nyToday.setDate(nyToday.getDate() - currentDay + (currentDay === 0 ? -6 : 1));

  const targetMondayMidnight = new Date(monday);
  targetMondayMidnight.setHours(0, 0, 0, 0);

  // Generate Next/Prev navigation dates
  const prevWeek = new Date(monday);
  prevWeek.setDate(monday.getDate() - 7);

  const nextWeek = new Date(monday);
  nextWeek.setDate(monday.getDate() + 7);

  const toParam = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return {
    dateRange,
    weekNumber,
    isCurrentWeek: nyToday.getTime() === targetMondayMidnight.getTime(),
    prevWeekDate: toParam(prevWeek),
    nextWeekDate: toParam(nextWeek),
    weekStart: monday,
    weekEnd: sunday,
  };
}
