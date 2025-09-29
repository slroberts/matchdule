import { Clock, Sun, Sunset, Moon } from "lucide-react";

type TimeBadgeProps = {
  startISO?: string | null;
  tz?: string;
  fallback?: string;
  soonMin?: number;
};

function getDaypart(date: Date) {
  const h = date.getHours();
  if (h >= 5 && h <= 11) return { label: "Morning", Icon: Sun };
  if (h >= 12 && h <= 16) return { label: "Afternoon", Icon: Sunset };
  if (h >= 17 && h <= 22) return { label: "Evening", Icon: Moon };
  return { label: "—", Icon: Clock };
}

function fmtTime(d: Date, tz?: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  }).format(d);
}

function fmtFull(d: Date, tz?: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: tz,
  }).format(d);
}

export default function TimeBadge({
  startISO,
  tz,
  fallback = "TBD",
  soonMin = 90,
}: TimeBadgeProps) {
  if (!startISO) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 ring-1 ring-border/60">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        <span className="text-sm font-semibold tracking-tight">{fallback}</span>
      </div>
    );
  }

  const d = new Date(startISO);
  const now = new Date();
  const minsAway = Math.round((d.getTime() - now.getTime()) / 60000);
  const soon = minsAway >= 0 && minsAway <= soonMin;
  const past = minsAway < 0;
  const live = minsAway <= 0 && minsAway > -120;

  const { label: daypart, Icon } = getDaypart(d);
  const tone = live
    ? "bg-emerald-500/10 ring-emerald-500/50 text-emerald-700 dark:text-emerald-300"
    : soon
    ? "bg-amber-500/10 ring-amber-500/50 text-amber-700 dark:text-amber-300"
    : past
    ? "opacity-70"
    : "";

  const label = live
    ? "Live"
    : soon
    ? `Starts in ${Math.floor(minsAway / 60)}h ${Math.abs(
        minsAway % 60,
      )}m`.replace(/^0h /, "")
    : daypart;

  const human = fmtTime(d, tz);
  const full = fmtFull(d, tz);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 ring-1 ring-border/60 ${tone}`}
      title={full}
      aria-label={`${label}: ${full}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <time
        dateTime={startISO}
        className="text-sm font-semibold tabular-nums tracking-tight"
      >
        {human}
      </time>
      <span className="inline text-xs font-medium text-foreground/60">
        • {label}
      </span>
    </div>
  );
}
