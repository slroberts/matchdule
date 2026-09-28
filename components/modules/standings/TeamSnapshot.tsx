import { Flame, ShieldCheck, Trophy } from 'lucide-react';
import type { TeamFlag, TeamSeasonStats } from '@/lib/matches/season-stats';
import { getCrestBrand } from '@/lib/matches/team-meta';
import { Badge } from '@/components/ui/Badge/Badge';
import { Crest } from '@/components/ui/Crest/Crest';
import GameBadge from '@/components/modules/matches/MatchCard/GameBadge';
import { StatTile } from './StatTile';
import { WdlBar, WdlLegend } from './WdlBar';

/**
 * TeamSnapshot — Figma: TeamSnapshot. "How is my team doing?" in one glance:
 *   who (crest · label · age) → points (big) → flags → W/D/L proportions → 3 stat tiles → form
 * No league rank: the data only covers your teams' games.
 */
/* Achievement flags — text row, no pill: navy label text + win-green icon (icon + text, never color alone) */
const FLAG_ICON: Record<TeamFlag['kind'], typeof Flame> = {
  undefeated: ShieldCheck,
  'win-streak': Flame,
  'biggest-win': Trophy,
};

export const TeamSnapshot = ({ team }: { team: TeamSeasonStats }) => {
  const gdLabel = team.gd > 0 ? `+${team.gd}` : `${team.gd}`;

  return (
    <article
      aria-label={`${team.label}${team.age ? ` ${team.age}` : ''}: ${team.pts} points, ${team.w} won, ${team.d} drawn, ${team.l} lost${team.flags.length ? `. ${team.flags.map((f) => f.label).join(', ')}` : ''}`}
      className='flex flex-col gap-(--space-stack-md) rounded-(--radius-card) bg-(--color-bg-surface) p-(--space-card-pad) shadow-(--shadow-card)'
    >
      {/* Who + points */}
      <header className='flex items-center gap-3'>
        <Crest brand={getCrestBrand(team)} />
        <div className='flex min-w-0 flex-1 flex-col gap-0.5'>
          <div className='flex min-w-0 items-center gap-(--space-stack-sm)'>
            <h3 className='text-title truncate text-(--color-text-primary)'>
              {team.label}
            </h3>
            {team.age && (
              <Badge variant='inverse' size='xs'>
                {team.age}
              </Badge>
            )}
          </div>
          <span className='text-meta text-(--color-text-secondary)'>
            {team.gp} played
          </span>
        </div>
        <div className='flex shrink-0 flex-col items-end'>
          <span className='text-display text-[2.5rem] leading-none font-extrabold tabular-nums text-(--color-text-primary)'>
            {team.pts}
          </span>
          <span className='text-label text-(--color-text-secondary)'>Pts</span>
        </div>
      </header>

      {/* Flags — Undefeated and/or win streak (biggest win only as a fallback).
          Text, not pills: one pill per card (the age) keeps the card calm. */}
      {team.flags.length > 0 && (
        <ul
          aria-label='Achievements'
          className='-mt-1 flex flex-wrap gap-x-3.5 gap-y-1'
        >
          {team.flags.map((flag) => {
            const Icon = FLAG_ICON[flag.kind];
            return (
              <li
                key={flag.kind}
                className='text-label flex list-none items-center gap-1 font-bold text-(--color-text-primary)'
              >
                <Icon
                  size={14}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                  aria-hidden='true'
                  className='shrink-0 text-(--color-text-win)'
                />
                {flag.label}
              </li>
            );
          })}
        </ul>
      )}

      {/* Record — proportions first, numbers second */}
      <div className='flex flex-col gap-(--space-stack-sm)'>
        <WdlBar w={team.w} d={team.d} l={team.l} />
        <WdlLegend w={team.w} d={team.d} l={team.l} />
      </div>

      {/* Stat tiles */}
      <div className='grid grid-cols-3 gap-(--space-stack-sm)'>
        <StatTile value={team.gf} label='Scored' />
        <StatTile value={team.ga} label='Conceded' />
        <StatTile
          value={gdLabel}
          label='Goal diff'
          tone={team.gd > 0 ? 'positive' : team.gd < 0 ? 'negative' : 'default'}
        />
      </div>

      {/* Form (last 5, oldest → newest) */}
      <div className='flex items-center gap-1.5'>
        <span className='text-label mr-0.5 text-(--color-text-secondary)'>
          Form
        </span>
        {team.form.map((r, i) => (
          <GameBadge key={i} result={r} />
        ))}
      </div>
    </article>
  );
};
