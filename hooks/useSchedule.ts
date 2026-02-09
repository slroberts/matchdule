import useSWR, { type KeyedMutator } from 'swr';
import type { Game } from '@/types/schedule';

type UseSchedule = {
  data: Game[] | undefined;
  loading: boolean;
  error: string | null;
  isValidating: boolean;
  refetch: () => Promise<void>;
  mutate: KeyedMutator<Game[]>;
};

async function fetchScheduleFromApi(): Promise<Game[]> {
  const res = await fetch('/api/schedule', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch schedule: ${res.status}`);
  return res.json();
}

export function useSchedule(): UseSchedule {
  const { data, error, isValidating, mutate } = useSWR<Game[]>(
    '/api/schedule',
    fetchScheduleFromApi,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
    },
  );

  return {
    data,
    loading: !data && !error,
    error: error ? (error as Error).message : null,
    isValidating,
    refetch: async () => {
      await mutate();
    },
    mutate,
  };
}
