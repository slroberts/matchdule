import { Game } from '@/types/schedule';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGamesRange(
  weekGames: Game[] | null | undefined,
  tz: string,
  locale = 'en-US'
): string {
  if (!weekGames?.length) return '';

  const sorted = [...weekGames].sort(
    (a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
  );
  const start = new Date(sorted[0].dateISO);
  const end = new Date(sorted[sorted.length - 1].dateISO);

  const fmtMonth = new Intl.DateTimeFormat(locale, {
    month: 'short',
    timeZone: tz,
  });
  const fmtDay = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    timeZone: tz,
  });

  const mStart = fmtMonth.format(start);
  const mEnd = fmtMonth.format(end);
  const dStart = fmtDay.format(start);
  const dEnd = fmtDay.format(end);

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    // e.g. "Nov 21"
    return `${mStart} ${dStart}`;
  }

  // Same month => "Nov 21 – 22"; different month => "Nov 30 – Dec 2"
  return mStart === mEnd
    ? `${mStart} ${dStart} – ${dEnd}`
    : `${mStart} ${dStart} – ${mEnd} ${dEnd}`;
}
