export function atLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Interpret a naive ISO string (no Z/offset) as *local wall time in `tz`*,
 * converting to the correct UTC instant (DST-aware). If the string already
 * has Z/offset, it’s parsed as-is.
 */
export function parseISOZoned(iso?: string | null, tz = "America/New_York") {
  if (!iso) return null;
  const hasTZ = /Z|[+-]\d{2}:?\d{2}$/.test(iso);
  if (hasTZ) return new Date(iso);

  const m = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!m) return new Date(iso);
  const [, y, mo, d, h, mi, s] = m;
  const utcGuess = Date.UTC(+y, +mo - 1, +d, +h, +mi, +(s ?? 0));

  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date(utcGuess)).map((p) => [p.type, p.value]),
  );
  const asUTC = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour,
    +parts.minute,
    +parts.second,
  );
  const offset = asUTC - utcGuess;

  return new Date(utcGuess - offset);
}

export const hourInTZ = (d: Date, tz: string) =>
  Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: tz,
    }).format(d),
  );

export const fmtTime = (d: Date, tz?: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  }).format(d);

export const fmtFull = (d: Date, tz?: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  }).format(d);
