import { Game } from "@/types/schedule";
import { Badge } from "../../ui/badge";
import { cn } from "@/lib/utils";

export default function HAChip({ value }: { value: Game["homeAway"] }) {
  const tone =
    value === "HOME"
      ? "text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900"
      : value === "AWAY"
      ? "text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-900"
      : "text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-900";

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 border",
        "bg-transparent",
        tone,
      )}
    >
      {value}
    </Badge>
  );
}
