import { useMemo } from 'react';
import type { Game } from '@/types/schedule';

export function useWeekOptions(data: Game[] | null | undefined): string[] {
  return useMemo(() => {
    if (!data?.length) return [];

    const explicit = Array.from(
      new Set(
        data.map((g) => g.week?.trim()).filter((v): v is string => Boolean(v)),
      ),
    );

    const weekNum = (label: string) => {
      const m = label.match(/week\s*(\d+)/i);
      return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
    };

    if (explicit.length) {
      return [...explicit].sort((a, b) => weekNum(a) - weekNum(b));
    }

    const uniqueDates = Array.from(new Set(data.map((g) => g.dateISO)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return uniqueDates.map((_, i) => `Week ${i + 1}`);
  }, [data]);
}
