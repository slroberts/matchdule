import { createClient } from '@supabase/supabase-js';
import { mapApiToMatch } from './match-mapper';
import { Match } from '@/types/match';
import { unstable_cache } from 'next/cache';

export const getMatches = unstable_cache(async (): Promise<Match[]> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { data, error } = await supabase.from('matches').select('*');
  if (error) throw new Error('Database connection failed');

  // Process items seamlessly via your unified mapping configuration
  const mappedMatches = (data || []).map(mapApiToMatch);

  // Sort instantaneously on a pure primitive number constraint
  return mappedMatches.sort((a, b) => a.timestamp - b.timestamp);
});
