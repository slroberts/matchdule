import { Game } from '@/types/schedule';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { parseISOZoned } from '@/lib/date'; // ✅ add

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function gameDayDate(g: Pick<Game, 'startISO' | 'dateISO'>, tz: string) {
  if (g.startISO) return new Date(g.startISO);
  return parseISOZoned(`${g.dateISO}T00:00:00`, tz)!;
}

export function formatGamesRange(
  weekGames: Game[] | null | undefined,
  tz: string,
  locale = 'en-US',
): string {
  if (!weekGames?.length) return '';

  const sorted = [...weekGames].sort(
    (a, b) => gameDayDate(a, tz).getTime() - gameDayDate(b, tz).getTime(),
  );

  const start = gameDayDate(sorted[0], tz);
  const end = gameDayDate(sorted[sorted.length - 1], tz);

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

  if (sameDay) return `${mStart} ${dStart}`;

  return mStart === mEnd
    ? `${mStart} ${dStart} – ${dEnd}`
    : `${mStart} ${dStart} – ${mEnd} ${dEnd}`;
}
