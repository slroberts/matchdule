import { useEffect, useState } from "react";
import { Game } from "@/lib/schedule";

export function useSchedule() {
  const [data, setData] = useState<Game[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/schedule", { cache: "no-store" });
        const json = await res.json();
        if (!alive) return;
        if (!json.ok) throw new Error(json.error || "Failed");
        setData(json.data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setErr(e?.message ?? "Error");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return { data, loading, error };
}
