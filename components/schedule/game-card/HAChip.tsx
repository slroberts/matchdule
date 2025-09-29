import { Game } from "@/types/schedule";
import { cn } from "@/lib/utils";
import { Home, HelpCircle, Map } from "lucide-react";

type Props = {
  value: Game["homeAway"];
  appearance?: "solid" | "subtle";
};

export default function HAChip({ value, appearance = "subtle" }: Props) {
  const map = {
    HOME: {
      Icon: Home,
      subtle:
        "text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20",
      solid:
        "text-emerald-950 dark:text-emerald-100 bg-emerald-400/90 dark:bg-emerald-500/30 border-emerald-400/50",
    },
    AWAY: {
      Icon: Map,
      subtle:
        "text-blue-700 dark:text-blue-300 border-blue-300/60 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20",
      solid:
        "text-blue-950 dark:text-blue-100 bg-blue-400/90 dark:bg-blue-500/30 border-blue-400/50",
    },
    TBD: {
      Icon: HelpCircle,
      subtle:
        "text-amber-700 dark:text-amber-300 border-amber-300/60 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20",
      solid:
        "text-amber-950 dark:text-amber-100 bg-amber-400/90 dark:bg-amber-500/30 border-amber-400/50",
    },
  } as const;

  const { Icon, subtle, solid } = map[value];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-[12px] font-semibold tabular-nums tracking-tight border-0",
        appearance === "solid" ? solid : subtle,
      )}
      aria-label={`Game is ${value}`}
      title={value}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {value}
    </div>
  );
}
