import { Sun, Sunset, LucideIcon } from 'lucide-react';

/**
 * Determines if a time string (e.g., "3:30 PM") qualifies as late afternoon.
 * Threshold: 3:00 PM or later (excluding 12:00 PM).
 */
export const getTimeOfDayAssets = (
  time: string,
): {
  TimeIcon: LucideIcon;
  isLateAfternoon: boolean;
} => {
  if (!time) {
    return {
      TimeIcon: Sun,
      isLateAfternoon: false,
    };
  }

  const hour = parseInt(time.split(':')[0], 10);
  const isPM = time.toLowerCase().includes('pm');
  const isLateAfternoon = isPM && hour >= 3 && hour !== 12;

  return {
    TimeIcon: isLateAfternoon ? Sunset : Sun,
    isLateAfternoon,
  };
};

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

  // The Sunday Night Offset
  // Check the pure NY string values so server UTC offsets can't interfere
  const isLateSunday = ny.weekday === 'Sun' && parseInt(ny.hour, 10) >= 18;

  if (isLateSunday) {
    nyNow.setDate(nyNow.getDate() + 1);
  }

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

  // Format the Date Range
  const startMonth = monday.toLocaleDateString('en-US', { month: 'short' });
  const startDay = monday.getDate();
  const endMonth = sunday.toLocaleDateString('en-US', { month: 'short' });
  const endDay = sunday.getDate();

  const dateRange =
    startMonth === endMonth
      ? `${startMonth} ${startDay} - ${endDay}`
      : `${startMonth} ${startDay} - ${endMonth} ${endDay}`;

  // Calculate ISO Week Number
  const targetThursday = new Date(monday);
  targetThursday.setDate(monday.getDate() + 3);
  const firstThursday = new Date(targetThursday.getFullYear(), 0, 4);
  const daysBetween =
    (targetThursday.getTime() - firstThursday.getTime()) / 86400000;
  const weekNumber = 1 + Math.round(daysBetween / 7);

  // Find the Monday of our adjusted "Today"
  const currentDay = nyToday.getDay();
  nyToday.setDate(nyToday.getDate() - currentDay + (currentDay === 0 ? -6 : 1));

  const targetMondayMidnight = new Date(monday);
  targetMondayMidnight.setHours(0, 0, 0, 0);

  // Generate Next/Prev navigation dates
  const prevWeek = new Date(monday);
  prevWeek.setDate(monday.getDate() - 7);

  const nextWeek = new Date(monday);
  nextWeek.setDate(monday.getDate() + 7);

  return {
    dateRange,
    weekNumber,
    isCurrentWeek: nyToday.getTime() === targetMondayMidnight.getTime(),
    prevWeekDate: `${prevWeek.getFullYear()}-${String(prevWeek.getMonth() + 1).padStart(2, '0')}-${String(prevWeek.getDate()).padStart(2, '0')}`,
    nextWeekDate: `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`,
    weekStart: monday,
    weekEnd: sunday,
  };
}
