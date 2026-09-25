import { Match, TabOption } from '@/types/match';

interface StandingsViewProps {
  activeTeam: TabOption;
  matches: Match[];
}

interface TeamStats {
  name: string;
  gp: number;
  w: number;
  l: number;
  d: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  form: string[];
}

const getUtilityFromTab = (tab: TabOption): string | null => {
  if (tab === 'B&G') return 'b-and-g';
  if (tab === 'Soricha') return 'soricha';
  return null;
};

const getMatchSeason = (timestamp: number): string => {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = d.getMonth();
  return month >= 7 ? `FALL ${year}` : `SPRING ${year}`;
};

const getAgeGroupPill = (name: string): string | null => {
  const match = name.match(/\b(U\d{1,2})\b/i);
  if (match) return match[1].toUpperCase();
  if (name.includes('18 CJSL')) return 'U9';
  if (name.includes('EDP')) return 'U13';
  return null;
};

const getCleanName = (name: string): string => {
  return name
    .replace(/\b(U\d{1,2})\b/i, '')
    .replace(/\/18 CJSL/i, '')
    .replace(/\/ EDP/i, '')
    .replace(/\/$/, '')
    .trim();
};

const getCallouts = (team: TeamStats) => {
  const callouts = [];
  if (team.l === 0 && team.gp > 0) {
    callouts.push({
      icon: '🛡️',
      text: 'UNDEFEATED',
      color:
        'bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 border border-amber-400',
    });
  }
  if (team.form.length === 3 && team.form.every((f: string) => f === 'W')) {
    callouts.push({
      icon: '🔥',
      text: 'ON FIRE',
      color: 'bg-orange-500 text-white',
    });
  }
  if (team.gd >= 5) {
    callouts.push({
      icon: '⚽️',
      text: 'ATTACKING',
      color: 'bg-emerald-500 text-white',
    });
  }
  return callouts.slice(0, 2);
};

const calculateStatsBySeason = (matches: Match[], activeTeam: TabOption) => {
  const seasonMap = new Map<string, Map<string, TeamStats>>();

  const getOrInitStats = (season: string, teamName: string) => {
    if (!seasonMap.has(season)) {
      seasonMap.set(season, new Map());
    }
    const teamMap = seasonMap.get(season)!;

    if (!teamMap.has(teamName)) {
      teamMap.set(teamName, {
        name: teamName,
        gp: 0,
        w: 0,
        l: 0,
        d: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
        form: [],
      });
    }
    return teamMap.get(teamName)!;
  };

  matches.forEach((match) => {
    if (match.status !== 'final' || match.timestamp === 0) return;

    const season = getMatchSeason(match.timestamp);
    const targetUtility = getUtilityFromTab(activeTeam);
    const myTeamsInMatch = [];

    if (activeTeam === 'All Teams') {
      if (
        match.homeTeam.utility === 'b-and-g' ||
        match.homeTeam.utility === 'soricha'
      ) {
        myTeamsInMatch.push({ us: match.homeTeam, them: match.awayTeam });
      }
      if (
        match.awayTeam.utility === 'b-and-g' ||
        match.awayTeam.utility === 'soricha'
      ) {
        myTeamsInMatch.push({ us: match.awayTeam, them: match.homeTeam });
      }
    } else {
      if (match.homeTeam.utility === targetUtility) {
        myTeamsInMatch.push({ us: match.homeTeam, them: match.awayTeam });
      }
      if (match.awayTeam.utility === targetUtility) {
        myTeamsInMatch.push({ us: match.awayTeam, them: match.homeTeam });
      }
    }

    myTeamsInMatch.forEach(({ us, them }) => {
      if (us.score === undefined || them.score === undefined) return;

      const stats = getOrInitStats(season, us.name);
      stats.gp += 1;
      stats.gf += us.score;
      stats.ga += them.score;

      if (us.score > them.score) {
        stats.w += 1;
        stats.pts += 3;
        stats.form.push('W');
      } else if (us.score < them.score) {
        stats.l += 1;
        stats.form.push('L');
      } else {
        stats.d += 1;
        stats.pts += 1;
        stats.form.push('D');
      }
    });
  });

  const result = Array.from(seasonMap.entries()).map(([season, teamMap]) => {
    const teams = Array.from(teamMap.values())
      .map((stats) => {
        stats.gd = stats.gf - stats.ga;
        stats.form = stats.form.slice(-3);
        return stats;
      })
      .sort((a, b) => b.pts - a.pts);
    return { season, teams };
  });

  return result.sort((a, b) => {
    const [seasonA, yearA] = a.season.split(' ');
    const [seasonB, yearB] = b.season.split(' ');
    if (yearA !== yearB) return Number(yearB) - Number(yearA);
    return seasonA === 'FALL' ? -1 : 1;
  });
};

export const StandingsView = ({ activeTeam, matches }: StandingsViewProps) => {
  const seasonData = calculateStatsBySeason(matches, activeTeam);

  if (seasonData.length === 0) {
    return (
      <div className='p-12 text-center w-full max-w-md mx-auto'>
        <h2 className='font-black text-xl text-brand-navy mb-2 tracking-tight'>
          No Data Yet
        </h2>
        <p className='text-sm text-slate-400'>
          Rankings will appear here once matches are completed.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-12 pb-12 w-full max-w-md mx-auto'>
      {seasonData.map(({ season, teams }) => (
        <div key={season} className='flex flex-col'>
          <div className='flex justify-between items-baseline pb-3 px-2 mx-2 border-b border-slate-200/80'>
            <h2 className='font-black text-xl text-brand-navy tracking-tight uppercase'>
              {season}
            </h2>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
              {teams.length} {teams.length === 1 ? 'Team' : 'Teams'}
            </span>
          </div>

          <div className='flex flex-col'>
            {teams.map((team, index) => {
              const ageGroup = getAgeGroupPill(team.name);
              const cleanName = getCleanName(team.name);
              const callouts = getCallouts(team);

              return (
                <div
                  key={team.name}
                  className='flex flex-col py-8 px-2 relative group'
                >
                  <div className='flex items-start gap-4 mb-8'>
                    <div className='w-6 flex justify-center pt-0.5'>
                      <span className='text-2xl font-black leading-none tracking-tighter text-slate-300'>
                        {index + 1}
                      </span>
                    </div>

                    <div className='flex flex-col items-start'>
                      <h4 className='font-black text-brand-navy text-xl sm:text-2xl leading-none uppercase max-w-65 sm:max-w-[320px] truncate tracking-tight mb-2.5'>
                        {cleanName}
                      </h4>

                      <div className='flex flex-wrap gap-2'>
                        {ageGroup && (
                          <span className='bg-brand-navy text-white font-bold text-[10px] px-3 py-1 rounded-full tracking-widest shadow-sm whitespace-nowrap'>
                            {ageGroup}
                          </span>
                        )}
                        {callouts.map((c, i) => (
                          <span
                            key={i}
                            className={`${c.color} font-bold text-[10px] px-3 py-1 rounded-full tracking-widest flex items-center gap-1.5 whitespace-nowrap`}
                          >
                            <span className='shrink-0'>{c.icon}</span>
                            <span>{c.text}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Perfectly Symmetrical 2-Row Stat Layout with Inner Divider */}
                  <div className='pl-10 pr-4 flex flex-col'>
                    {/* Top Row: Outcomes */}
                    <div className='flex items-end justify-between'>
                      <div className='flex flex-col'>
                        <span className='text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5'>
                          Points
                        </span>
                        <span className='text-4xl font-black text-brand-navy leading-none tracking-tighter tabular-nums'>
                          {team.pts}
                        </span>
                      </div>

                      <div className='flex flex-col items-center'>
                        <span className='text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5'>
                          Record
                        </span>
                        <span className='text-4xl font-black text-slate-700 leading-none tracking-tighter tabular-nums'>
                          {team.w}-{team.l}-{team.d}
                        </span>
                      </div>

                      <div className='flex flex-col items-end pb-0.5'>
                        <span className='text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2'>
                          Form
                        </span>
                        <div className='flex gap-1.5'>
                          {team.form.length > 0 ? (
                            team.form.map((result: string, i: number) => (
                              <span
                                key={i}
                                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs text-white font-black shadow-sm ring-1 ring-inset ring-white/20 shrink-0
                                  ${result === 'W' ? 'bg-emerald-500' : result === 'L' ? 'bg-rose-500' : 'bg-slate-300'}`}
                              >
                                {result}
                              </span>
                            ))
                          ) : (
                            <span className='text-slate-300 text-sm'>-</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Divider */}
                    <div className='w-full border-t border-slate-200 my-8' />

                    {/* Bottom Row: Goals */}
                    <div className='flex items-end justify-between'>
                      <div className='flex flex-col'>
                        <span className='text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5'>
                          Goals For
                        </span>
                        <span className='text-4xl font-black text-slate-700 leading-none tracking-tighter tabular-nums'>
                          {team.gf}
                        </span>
                      </div>

                      <div className='flex flex-col items-center'>
                        <span className='text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5'>
                          Goals Against
                        </span>
                        <span className='text-4xl font-black text-slate-400 leading-none tracking-tighter tabular-nums'>
                          {team.ga}
                        </span>
                      </div>

                      <div className='flex flex-col items-end'>
                        <span className='text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1.5'>
                          Goal Diff
                        </span>
                        <span
                          className={`text-4xl font-black leading-none tracking-tighter tabular-nums ${team.gd > 0 ? 'text-emerald-500' : team.gd < 0 ? 'text-rose-500' : 'text-slate-700'}`}
                        >
                          {team.gd > 0 ? `+${team.gd}` : team.gd}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
