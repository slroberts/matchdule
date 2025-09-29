import useSWR, { type KeyedMutator } from "swr";
import type { Game } from "@/types/schedule";
import { fetchSchedule } from "@/lib/schedule";

type UseSchedule = {
  data: Game[] | undefined;
  loading: boolean;
  error: string | null;
  isValidating: boolean;
  /** Revalidate from the network */
  refetch: () => Promise<void>;
  /** SWR mutate passthrough (optimistic updates etc.) */
  mutate: KeyedMutator<Game[]>;
};

export function useSchedule(): UseSchedule {
  const { data, error, isValidating, mutate } = useSWR<Game[]>(
    "schedule",
    fetchSchedule,
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
    // swallow the data return so the type is Promise<void>
    refetch: async () => {
      await mutate();
    },
    mutate,
  };
}
