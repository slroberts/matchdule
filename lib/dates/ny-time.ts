/**
 * New York calendar helpers.
 * Every game is played in New York, but servers (Vercel) run in UTC and browsers can be
 * anywhere. Anything that turns a timestamp into a DAY, MONTH or SEASON must use
 * New York time — otherwise a 9:30 PM game lands on "tomorrow" on the server.
 */

export const NY_TZ = 'America/New_York';

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: NY_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** { year, month (1–12), day } of a timestamp on the New York calendar */
export const nyDateParts = (timestamp: number) => {
  const parts = Object.fromEntries(
    partsFormatter
      .formatToParts(new Date(timestamp))
      .map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
};

/** "2026-11-14" on the New York calendar (day grouping keys, ?date= links) */
export const nyDateKey = (timestamp: number) => {
  const { year, month, day } = nyDateParts(timestamp);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/** Whole calendar days between two instants, on the New York calendar (0 = same day) */
export const nyDayDiff = (target: number, from: number) => {
  const a = nyDateParts(target);
  const b = nyDateParts(from);
  return Math.round(
    (Date.UTC(a.year, a.month - 1, a.day) -
      Date.UTC(b.year, b.month - 1, b.day)) /
      86_400_000,
  );
};

/** Intl formatting pinned to New York (e.g. { weekday: 'long', month: 'short', day: 'numeric' }) */
export const formatNY = (
  timestamp: number,
  options: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat('en-US', { timeZone: NY_TZ, ...options }).format(
    new Date(timestamp),
  );
