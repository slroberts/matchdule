import { createClient } from '@supabase/supabase-js';
import { mapApiToMatch } from './match-mapper';
import { Match } from '@/types/match';

export async function getMatches(): Promise<Match[]> {
  // This client only exists on the server
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );

  const { data, error } = await supabase.from('matches').select('*');
  if (error) throw new Error('Database connection failed');

  const mappedMatches = (data || []).map(mapApiToMatch);

  const monthMap: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  return mappedMatches.sort((a, b) => {
    // Helper to extract numbers directly from your formatted strings
    const getSortMetrics = (match: Match) => {
      // date is "Mar 29, 2026"
      const [monthStr, dayStr, yearStr] = match.date
        .replace(',', '')
        .split(' ');

      const year = parseInt(yearStr) || 2026;
      const month = monthMap[monthStr] ?? 99; // Unknown months go to end
      const day = parseInt(dayStr) || 0;

      // Convert time "10:30AM" to minutes-of-day
      let minutes = 1439; // Default to end of day for TBD
      if (match.time !== 'TBD') {
        const timeMatch = match.time.match(/(\d+):(\d+)(AM|PM)/i);
        if (timeMatch) {
          const [_, hrs, mins, ampm] = timeMatch;
          let h = parseInt(hrs);
          if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
          if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
          minutes = h * 60 + parseInt(mins);
        }
      }

      // Create a single comparable number: YYYYMMDDHHMM
      // Example: 202602291030 (Year 2026, Month 02, Day 29, 10:30)
      return year * 100000000 + month * 1000000 + day * 10000 + minutes;
    };

    return getSortMetrics(a) - getSortMetrics(b);
  });
}
