'use client';

import { useCallback, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export function useWeekNav({
  week,
  setWeek,
  weekOptions,
  defaultWeek,
  refreshing,
}: {
  week: string | null;
  setWeek: Dispatch<SetStateAction<string | null>>;
  weekOptions: string[];
  defaultWeek: string | null;
  refreshing: boolean;
}) {
  const state = useMemo(() => {
    const currentWeek = week ?? defaultWeek ?? weekOptions[0] ?? '';
    const currentIndex = weekOptions.indexOf(currentWeek);

    const canPrev = !refreshing && currentIndex > 0;
    const canNext =
      !refreshing && currentIndex >= 0 && currentIndex < weekOptions.length - 1;

    const isCurrentWeek = !!defaultWeek && currentWeek === defaultWeek;

    return { currentWeek, currentIndex, canPrev, canNext, isCurrentWeek };
  }, [week, defaultWeek, weekOptions, refreshing]);

  const onPrev = useCallback(() => {
    if (!state.canPrev) return;
    setWeek(weekOptions[state.currentIndex - 1] ?? null);
  }, [state.canPrev, state.currentIndex, setWeek, weekOptions]);

  const onNext = useCallback(() => {
    if (!state.canNext) return;
    setWeek(weekOptions[state.currentIndex + 1] ?? null);
  }, [state.canNext, state.currentIndex, setWeek, weekOptions]);

  const onJumpToCurrent = useCallback(() => {
    if (!defaultWeek || refreshing) return;
    setWeek(defaultWeek);
  }, [defaultWeek, refreshing, setWeek]);

  return { ...state, onPrev, onNext, onJumpToCurrent };
}
