export function atLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const hasTZ = (s: string) => /Z|[+-]\d{2}:?\d{2}$/.test(s);

function parseParts(iso: string) {
  const m = iso.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return { y: +y, mo: +mo - 1, d: +d, h: +h, mi: +mi, s: +(s ?? 0) };
}

// Compute the timezone offset (ms) for a given UTC instant in an IANA tz.
// Positive result means the zone is *ahead* of UTC at that instant.
function tzOffsetMs(atUTC: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(atUTC).map((p) => [p.type, p.value]),
  );
  const asUTC = Date.UTC(
    +parts.year,
    +parts.month - 1,
    +parts.day,
    +parts.hour,
    +parts.minute,
    +parts.second,
  );
  return asUTC - atUTC.getTime();
}

/**
 * Interpret a naive ISO string (no Z/offset) as *local wall time in `tz`*,
 * converting to the correct UTC instant (DST-aware). If the string already
 * has Z/offset, it’s parsed as-is.
 */
export function parseISOZoned(iso?: string | null, tz = "America/New_York") {
  if (!iso) return null;
  if (hasTZ(iso)) return new Date(iso); // already absolute

  const p = parseParts(iso);
  if (!p) {
    // Fallback: let Date try, but this can be env-dependent; avoid if possible.
    return new Date(iso);
  }
  // Start with a UTC guess at the same wall clock time
  const utcGuess = Date.UTC(p.y, p.mo, p.d, p.h, p.mi, p.s);
  // Find what that wall time corresponds to in the tz, including DST
  const off = tzOffsetMs(new Date(utcGuess), tz);
  // Subtract the zone offset to get the real UTC instant
  return new Date(utcGuess - off);
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
