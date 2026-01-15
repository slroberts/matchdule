import { useMemo } from 'react';
import type { Game } from '@/types/schedule';

export function useWeekOptions(data: Game[] | null | undefined): string[] {
  return useMemo(() => {
    if (!data?.length) return [];

    // Prefer explicit week labels
    const explicit = Array.from(
      new Set(
        data.map((g) => g.week?.trim()).filter((v): v is string => Boolean(v))
      )
    );
    if (explicit.length) return explicit;

    // Fallback: infer sequential weeks by unique dateISO strings (YYYY-MM-DD)
    const uniqueDates = Array.from(
      new Set(data.map((g) => g.dateISO).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));

    return uniqueDates.map((_, i) => `Week ${i + 1}`);
  }, [data]);
}
