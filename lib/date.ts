export function atLocalMidnight(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Treat naive ISO (no Z/offset) as UTC to avoid env-dependent parsing.
// Prefer sending ISO with an explicit offset from your data source.
const hasTZ = (s: string) => /Z|[+-]\d{2}:?\d{2}$/.test(s);
export const parseISOSafe = (iso?: string | null) =>
  iso ? new Date(hasTZ(iso) ? iso : `${iso}Z`) : null;

// Get hour in a specific IANA tz (e.g. America/New_York)
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
