import { Game } from "@/types/schedule";
import { cn } from "@/lib/utils";

export default function StatusRibbon({ game }: { game: Game }) {
  const now = Date.now();
  const start = game.startISO ? new Date(game.startISO).getTime() : null;
  const end = game.endISO ? new Date(game.endISO).getTime() : null;

  let label: "LIVE" | "FINAL" | "SCHEDULED" = "SCHEDULED";
  if (game.result) label = "FINAL";
  else if (start && end && now >= start && now <= end) label = "LIVE";

  const tone =
    label === "LIVE"
      ? "bg-emerald-600 text-white"
      : label === "FINAL"
      ? "bg-muted-foreground/90 text-white dark:text-white"
      : "bg-amber-600 text-white";

  return (
    <span
      aria-label={`Status: ${label}`}
      className={cn(
        "pointer-events-none absolute right-0 top-0 select-none",
        "rounded-bl-md px-2 py-1 text-[10px] font-semibold tracking-wide",
        "shadow-sm ring-1 ring-black/5",
        tone,
      )}
    >
      {label}
    </span>
  );
}
