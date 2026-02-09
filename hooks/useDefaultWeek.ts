import { useCallback } from 'react';
import type { Game } from '@/types/schedule';

export function useDefaultWeek() {
  return useCallback((games: Game[], today = new Date()): string | null => {
    if (!games?.length) return null;

    const weekNum = (label: string) => {
      const m = label.match(/week\s*(\d+)/i);
      return m ? Number(m[1]) : Number.NaN;
    };

    const byWeek = new Map<string, { min: number; max: number }>();

    for (const g of games) {
      if (!g.week) continue;

      // ✅ Prefer true start time; fallback to stable noon UTC for YYYY-MM-DD
      const baseISO = g.startISO ?? `${g.dateISO}T12:00:00Z`;
      const t = new Date(baseISO).getTime();
      if (Number.isNaN(t)) continue;

      const cur = byWeek.get(g.week);
      if (!cur) byWeek.set(g.week, { min: t, max: t });
      else {
        if (t < cur.min) cur.min = t;
        if (t > cur.max) cur.max = t;
      }
    }

    if (!byWeek.size) return null;

    const now = today.getTime();

    for (const [label, r] of byWeek) {
      if (now >= r.min && now <= r.max) return label;
    }

    const labels = [...byWeek.keys()];
    const allHaveNums = labels.every((l) => !Number.isNaN(weekNum(l)));
    if (allHaveNums) return labels.sort((a, b) => weekNum(b) - weekNum(a))[0];

    let best: { label: string; max: number } | null = null;
    for (const [label, r] of byWeek) {
      if (!best || r.max > best.max) best = { label, max: r.max };
    }
    return best?.label ?? null;
  }, []);
}
