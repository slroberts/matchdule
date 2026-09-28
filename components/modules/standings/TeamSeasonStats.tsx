import { Match, MatchResult, TabOption, Team } from '@/types/match';
import { cleanTeamName } from '@/lib/matches/match-utils';
import { getAgeGroup, getClubLabel } from '@/lib/matches/team-meta';

/**
 * Season stats for YOUR teams — the data behind the Standings snapshot.
 * Pure functions: no React, easy to unit-test.
 */

export interface TeamSeasonStats {
  /** Raw team name (stable key; age detection reads it) */
  key: string;
  label: string; // "Soricha"
  age: string | null; // "U13"
  utility: Team['utility'];
  gp: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  /** Last 5 results, oldest → newest */
  form: Exclude<MatchResult, null>[];
  /** One computed sentence, or null (never filler) */
  insight: string | null;
}

export interface SeasonStats {
  season: string; // "Fall 2026"
  teams: TeamSeasonStats[];
  totals: { gp: number; w: number; d: number; l: number };
}

const OUR_UTILITIES: Team['utility'][] = ['b-and-g', 'soricha'];

const utilityForTab = (tab: TabOption): Team['utility'] | null =>
  tab === 'B&G' ? 'b-and-g' : tab === 'Soricha' ? 'soricha' : null;

/** Aug–Dec = Fall, Jan–Jul = Spring (a spring season can start in winter) */
const seasonOf = (timestamp: number) => {
  const d = new Date(timestamp);
  return `${d.getMonth() >= 7 ? 'Fall' : 'Spring'} ${d.getFullYear()}`;
};

const ageFor = (name: string) =>
  getAgeGroup(name) ?? name.match(/\bU\d{1,2}\b/i)?.[0].toUpperCase() ?? null;

/**
 * Insight priority — the single most useful sentence:
 *   1. "Unbeaten"          no losses, ≥ 2 games
 *   2. "Won last N"        current win streak ≥ 2
 *   3. "Biggest win 5–1"   largest margin ≥ 3
 *   otherwise null
 */
const insightFor = (
  s: Omit<TeamSeasonStats, 'insight'>,
  allForm: string[],
  biggest: [number, number] | null,
) => {
  if (s.gp >= 2 && s.l === 0) return 'Unbeaten';
  let streak = 0;
  for (let i = allForm.length - 1; i >= 0 && allForm[i] === 'W'; i--) streak++;
  if (streak >= 2) return `Won last ${streak}`;
  if (biggest && biggest[0] - biggest[1] >= 3)
    return `Biggest win ${biggest[0]}–${biggest[1]}`;
  return null;
};

export const getSeasonStats = (
  matches: Match[],
  activeTeam: TabOption,
): SeasonStats[] => {
  const target = utilityForTab(activeTeam);
  const isOurs = (t: Team) =>
    target ? t.utility === target : OUR_UTILITIES.includes(t.utility);

  type Acc = Omit<TeamSeasonStats, 'insight' | 'form'> & {
    allForm: Exclude<MatchResult, null>[];
    biggest: [number, number] | null;
  };
  const seasons = new Map<string, Map<string, Acc>>();

  // Chronological, so form + streaks read oldest → newest
  const finals = matches
    .filter((m) => m.status === 'final' && m.timestamp !== 0)
    .sort((a, b) => a.timestamp - b.timestamp);

  for (const m of finals) {
    const season = seasonOf(m.timestamp);
    const sides = [
      { us: m.homeTeam, them: m.awayTeam },
      { us: m.awayTeam, them: m.homeTeam },
    ].filter(({ us }) => isOurs(us));

    for (const { us, them } of sides) {
      if (us.score === undefined || them.score === undefined) continue; // awaiting score

      if (!seasons.has(season)) seasons.set(season, new Map());
      const teams = seasons.get(season)!;
      if (!teams.has(us.name)) {
        teams.set(us.name, {
          key: us.name,
          label: getClubLabel(us, cleanTeamName(us.name)),
          age: ageFor(us.name),
          utility: us.utility,
          gp: 0,
          w: 0,
          d: 0,
          l: 0,
          gf: 0,
          ga: 0,
          gd: 0,
          pts: 0,
          allForm: [],
          biggest: null,
        });
      }
      const s = teams.get(us.name)!;
      s.gp += 1;
      s.gf += us.score;
      s.ga += them.score;
      if (us.score > them.score) {
        s.w += 1;
        s.pts += 3;
        s.allForm.push('W');
        if (!s.biggest || us.score - them.score > s.biggest[0] - s.biggest[1])
          s.biggest = [us.score, them.score];
      } else if (us.score < them.score) {
        s.l += 1;
        s.allForm.push('L');
      } else {
        s.d += 1;
        s.pts += 1;
        s.allForm.push('D');
      }
    }
  }

  const result: SeasonStats[] = [...seasons.entries()].map(
    ([season, teamMap]) => {
      const teams = [...teamMap.values()]
        .map(({ allForm, biggest, ...s }) => {
          const base = { ...s, gd: s.gf - s.ga, form: allForm.slice(-5) };
          return { ...base, insight: insightFor(base, allForm, biggest) };
        })
        .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
      const totals = teams.reduce(
        (t, s) => ({
          gp: t.gp + s.gp,
          w: t.w + s.w,
          d: t.d + s.d,
          l: t.l + s.l,
        }),
        { gp: 0, w: 0, d: 0, l: 0 },
      );
      return { season, teams, totals };
    },
  );

  // Newest season first
  const rank = (s: string) => {
    const [term, year] = s.split(' ');
    return Number(year) * 2 + (term === 'Fall' ? 1 : 0);
  };
  return result.sort((a, b) => rank(b.season) - rank(a.season));
};
