'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type {
  Daypart,
  FilterState,
  HomeAway,
  Result,
  TeamFilter,
} from '@/types/schedule';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  value: FilterState;
  teamOptions: string[];

  onApply: (next: FilterState) => void;
  onClear: () => void;
};

const RESULT_LABELS: Record<'W' | 'L' | 'D', string> = {
  W: 'Win',
  L: 'Loss',
  D: 'Draw',
};

const HOMEAWAY_LABELS: Record<'HOME' | 'AWAY' | 'TBD', string> = {
  HOME: 'Home',
  AWAY: 'Away',
  TBD: 'TBD',
};

const DAYPARTS: Daypart[] = ['morning', 'afternoon', 'evening'];

function Chip({
  active,
  children,
  onClick,
  title,
  ariaLabel,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  ariaLabel?: string;
}) {
  return (
    <Badge
      role='button'
      aria-label={ariaLabel}
      aria-pressed={active}
      onClick={onClick}
      title={title}
      className={cn(
        'rounded-full cursor-pointer select-none',
        'px-3 py-1 text-[13px] leading-none',
        'transition-[background-color,box-shadow,color] duration-150',
        active
          ? 'shadow-[0_1px_0_rgba(255,255,255,0.08),0_6px_16px_-14px_rgba(0,0,0,0.6)]'
          : 'hover:bg-secondary/80'
      )}
      variant={active ? 'default' : 'secondary'}
    >
      {children}
    </Badge>
  );
}

function HelperPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5',
        'text-[11px] text-muted-foreground',
        'bg-background/70',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
      )}
    >
      {children}
    </span>
  );
}

function Section({
  title,
  description,
  children,
  onClear,
  clearDisabled,
  collapsible,
  defaultOpen = true,
  rightSlot,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClear?: () => void;
  clearDisabled?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  rightSlot?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!collapsible) setOpen(true);
  }, [collapsible]);

  return (
    <section
      className={cn(
        'rounded-2xl border',
        'bg-background/60',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
      )}
    >
      <div className='flex items-start justify-between gap-3 px-4 py-3'>
        <button
          type='button'
          className={cn(
            'text-left flex-1 group',
            collapsible && 'cursor-pointer'
          )}
          onClick={() => collapsible && setOpen((v) => !v)}
        >
          <div className='flex items-center gap-2'>
            <div className='text-sm font-semibold tracking-[-0.01em]'>
              {title}
            </div>
            {collapsible ? (
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  open ? 'rotate-180' : 'rotate-0'
                )}
                aria-hidden
              />
            ) : null}
          </div>

          {description ? (
            <div className='text-xs text-muted-foreground mt-0.5'>
              {description}
            </div>
          ) : null}
        </button>

        <div className='flex items-center gap-2 pt-0.5'>
          {rightSlot}
          {onClear ? (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onClear}
              disabled={!!clearDisabled}
              className='h-7 px-2 text-xs'
            >
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      <div
        className={cn('px-4 pb-4', collapsible && !open ? 'hidden' : 'block')}
      >
        {children}
      </div>
    </section>
  );
}

function TeamRow({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className={cn(
        'w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2',
        'text-left',
        'transition-[background-color,border-color,box-shadow] duration-150',
        'border',
        active
          ? cn(
              'bg-foreground/6 border-foreground/20',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
            )
          : 'bg-background/40 border-border hover:bg-muted/40'
      )}
      aria-pressed={active}
    >
      <span
        className={cn(
          'text-[13px] leading-tight',
          active ? 'font-semibold' : 'font-medium'
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          'h-5 w-5 rounded-full border flex items-center justify-center',
          'transition-colors',
          active
            ? 'border-foreground/40 bg-foreground/5'
            : 'border-muted-foreground/35'
        )}
        aria-hidden
      >
        <Check
          className={cn(
            'h-3.5 w-3.5 transition-opacity',
            active ? 'opacity-100' : 'opacity-0'
          )}
        />
      </span>
    </button>
  );
}

export default function FilterSheet({
  open,
  onOpenChange,
  value,
  teamOptions,
  onApply,
  onClear,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<FilterState>(value);

  // UI state
  const TEAM_COLLAPSE_THRESHOLD = 10;
  const TEAM_MAX_HEIGHT_PX = 280;
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [teamQuery, setTeamQuery] = useState('');

  // refs for scroll polish
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const teamListRef = useRef<HTMLDivElement | null>(null);

  const [teamFadeTop, setTeamFadeTop] = useState(false);
  const [teamFadeBottom, setTeamFadeBottom] = useState(false);
  const [footerShadow, setFooterShadow] = useState(false);
  const [headerShadow, setHeaderShadow] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setShowAllTeams(false);
      setTeamQuery('');
    }
  }, [open, value]);

  const allTeams: string[] = useMemo(() => {
    const uniq = Array.from(new Set(teamOptions)).filter(Boolean);
    return ['All Teams', ...uniq];
  }, [teamOptions]);

  const hasManyTeams = allTeams.length > TEAM_COLLAPSE_THRESHOLD;

  const filteredTeams = useMemo(() => {
    const q = teamQuery.trim().toLowerCase();
    if (!q) return allTeams;

    const rest = allTeams
      .filter((t) => t !== 'All Teams')
      .filter((t) => t.toLowerCase().includes(q));

    return ['All Teams', ...rest];
  }, [allTeams, teamQuery]);

  const teamsToRender = useMemo(() => {
    if (!hasManyTeams) return filteredTeams;
    if (showAllTeams) return filteredTeams;

    const selected =
      draft.team && draft.team !== 'All Teams' ? draft.team : null;
    const base = filteredTeams.slice(0, TEAM_COLLAPSE_THRESHOLD);

    if (
      selected &&
      !base.includes(selected) &&
      filteredTeams.includes(selected)
    ) {
      return [
        'All Teams',
        selected,
        ...base.filter((t) => t !== 'All Teams'),
      ].slice(0, TEAM_COLLAPSE_THRESHOLD);
    }

    return base;
  }, [filteredTeams, hasManyTeams, showAllTeams, draft.team]);

  const toggleInArray = <T,>(arr: T[], v: T) => {
    const set = new Set(arr);
    set.has(v) ? set.delete(v) : set.add(v);
    return Array.from(set);
  };

  const applyNow = (next: FilterState) => {
    setDraft(next);
    onApply(next);
  };

  const clearAll = () => {
    const next: FilterState = {
      team: 'All Teams',
      scope: 'week',
      homeAway: [],
      result: [],
      dayparts: [],
    };
    applyNow(next);
    onClear();
  };

  const clearTeam = () => applyNow({ ...draft, team: 'All Teams' });
  const clearScope = () => applyNow({ ...draft, scope: 'week' });
  const clearHomeAway = () => applyNow({ ...draft, homeAway: [] });
  const clearResult = () => applyNow({ ...draft, result: [] });
  const clearTime = () => applyNow({ ...draft, dayparts: [] });

  const done = () => {
    onApply(draft);
    onOpenChange(false);
  };

  const isActiveAny =
    draft.team !== 'All Teams' ||
    draft.scope !== 'week' ||
    draft.homeAway.length > 0 ||
    draft.result.length > 0 ||
    draft.dayparts.length > 0;

  const computeTeamFades = useCallback(() => {
    const el = teamListRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasOverflow = scrollHeight - clientHeight > 2;

    if (!hasOverflow) {
      setTeamFadeTop(false);
      setTeamFadeBottom(false);
      return;
    }

    setTeamFadeTop(scrollTop > 4);
    setTeamFadeBottom(scrollTop + clientHeight < scrollHeight - 4);
  }, []);

  const computeShadows = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;

    // header shadow as soon as we scroll
    setHeaderShadow(scrollTop > 2);

    // footer shadow only when there is more content below
    setFooterShadow(scrollTop + clientHeight < scrollHeight - 2);
  }, []);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      computeTeamFades();
      computeShadows();
    });
    return () => cancelAnimationFrame(raf);
  }, [
    open,
    computeTeamFades,
    computeShadows,
    teamsToRender,
    teamQuery,
    showAllTeams,
  ]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-[360px] sm:w-[420px] p-0'>
        <div className='flex h-full flex-col'>
          {/* Sticky header (premium blur + shadow when scrolling) */}
          <div
            className={cn(
              'sticky top-0 z-10 border-b',
              'bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60',
              headerShadow ? 'shadow-sm' : 'shadow-none'
            )}
          >
            <div className='px-4 py-3'>
              <SheetHeader>
                <SheetTitle className='flex gap-8 items-center justify-between'>
                  <span className='tracking-[-0.01em]'>Filters</span>
                </SheetTitle>

                <SheetDescription className='sr-only'>
                  Choose options to narrow the games shown.
                </SheetDescription>
              </SheetHeader>
            </div>
          </div>

          {/* Body */}
          <div
            ref={bodyRef}
            onScroll={computeShadows}
            className='flex-1 overflow-auto px-4 py-3'
          >
            <div className='space-y-3'>
              {/* Scope */}
              <Section
                title='Scope'
                description='This week or all games.'
                onClear={clearScope}
                clearDisabled={draft.scope === 'week'}
              >
                <div className='flex flex-wrap gap-2'>
                  {(['week', 'all'] as const).map((s) => (
                    <Chip
                      key={s}
                      active={draft.scope === s}
                      title={s}
                      onClick={() => applyNow({ ...draft, scope: s })}
                    >
                      {s === 'week' ? 'This Week' : 'All Games'}
                    </Chip>
                  ))}
                </div>
              </Section>

              {/* Team */}
              <Section
                title='Team'
                description='Search + select one.'
                onClear={clearTeam}
                clearDisabled={draft.team === 'All Teams'}
                collapsible={hasManyTeams}
                defaultOpen
                rightSlot={
                  hasManyTeams ? (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='h-7 px-2 text-xs'
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllTeams((v) => !v);
                      }}
                    >
                      {showAllTeams ? 'Less' : `All (${filteredTeams.length})`}
                    </Button>
                  ) : null
                }
              >
                <div className='space-y-2.5'>
                  {/* Search */}
                  <div className='relative'>
                    <Search
                      className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground'
                      aria-hidden
                    />
                    <input
                      value={teamQuery}
                      onChange={(e) => setTeamQuery(e.target.value)}
                      placeholder='Search teams...'
                      className={cn(
                        'w-full h-10 rounded-xl border bg-background pl-9 pr-9 text-sm',
                        'shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
                        'focus:outline-none focus:ring-2 focus:ring-ring'
                      )}
                    />
                    {teamQuery ? (
                      <button
                        type='button'
                        onClick={() => setTeamQuery('')}
                        className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:bg-muted'
                        aria-label='Clear team search'
                      >
                        <X className='h-4 w-4' aria-hidden />
                      </button>
                    ) : null}
                  </div>

                  {/* List container w/ iOS fades */}
                  <div
                    className={cn(
                      'relative rounded-2xl border bg-background/45 p-2',
                      'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    )}
                  >
                    {/* Fades */}
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-x-0 top-0 h-9 rounded-t-2xl',
                        'transition-opacity duration-200',
                        teamFadeTop ? 'opacity-100' : 'opacity-0'
                      )}
                      style={{
                        background:
                          'linear-gradient(to bottom, rgba(0,0,0,0.22), rgba(0,0,0,0))',
                      }}
                      aria-hidden
                    />
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-x-0 bottom-0 h-9 rounded-b-2xl',
                        'transition-opacity duration-200',
                        teamFadeBottom ? 'opacity-100' : 'opacity-0'
                      )}
                      style={{
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.22), rgba(0,0,0,0))',
                      }}
                      aria-hidden
                    />

                    <div
                      ref={teamListRef}
                      onScroll={computeTeamFades}
                      className='space-y-2 overflow-auto pr-1'
                      style={{ maxHeight: TEAM_MAX_HEIGHT_PX }}
                    >
                      {teamsToRender.map((t) => (
                        <TeamRow
                          key={t}
                          label={t}
                          active={draft.team === t}
                          onSelect={() =>
                            applyNow({ ...draft, team: t as TeamFilter })
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {hasManyTeams && !showAllTeams ? (
                    <div className='pt-0.5'>
                      <HelperPill>Search or tap “All”</HelperPill>
                    </div>
                  ) : null}
                </div>
              </Section>

              {/* Time */}
              <Section
                title='Time'
                description='Time of day.'
                onClear={clearTime}
                clearDisabled={draft.dayparts.length === 0}
              >
                <div className='flex flex-wrap gap-2'>
                  {DAYPARTS.map((v) => (
                    <Chip
                      key={v}
                      active={draft.dayparts.includes(v)}
                      title={v}
                      onClick={() =>
                        applyNow({
                          ...draft,
                          dayparts: toggleInArray<Daypart>(draft.dayparts, v),
                        })
                      }
                    >
                      <span className='capitalize'>{v}</span>
                    </Chip>
                  ))}
                </div>
              </Section>

              {/* Home/Away */}
              <Section
                title='Home / Away'
                description='Filter by venue.'
                onClear={clearHomeAway}
                clearDisabled={draft.homeAway.length === 0}
              >
                <div className='flex flex-wrap gap-2'>
                  {(['HOME', 'AWAY', 'TBD'] as const).map((v) => (
                    <Chip
                      key={v}
                      active={draft.homeAway.includes(v)}
                      ariaLabel={HOMEAWAY_LABELS[v]}
                      title={HOMEAWAY_LABELS[v]}
                      onClick={() =>
                        applyNow({
                          ...draft,
                          homeAway: toggleInArray<HomeAway>(draft.homeAway, v),
                        })
                      }
                    >
                      {HOMEAWAY_LABELS[v]}
                    </Chip>
                  ))}
                </div>
              </Section>

              {/* Result */}
              <Section
                title='Result'
                description='Completed games only.'
                onClear={clearResult}
                clearDisabled={draft.result.length === 0}
              >
                <div className='flex flex-wrap gap-2'>
                  {(['W', 'L', 'D'] as const).map((v) => (
                    <Chip
                      key={v}
                      active={draft.result.includes(v)}
                      ariaLabel={RESULT_LABELS[v]}
                      title={RESULT_LABELS[v]}
                      onClick={() =>
                        applyNow({
                          ...draft,
                          result: toggleInArray<Result>(draft.result, v),
                        })
                      }
                    >
                      {RESULT_LABELS[v]}
                    </Chip>
                  ))}
                </div>
              </Section>
            </div>
          </div>

          {/* Sticky footer with premium shadow */}
          <div
            className={cn(
              'sticky bottom-0 border-t px-4 py-3',
              'bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60',
              footerShadow
                ? 'shadow-[0_-14px_28px_-18px_rgba(0,0,0,0.4)]'
                : 'shadow-none'
            )}
          >
            <div className='grid grid-cols-2 gap-2'>
              <Button
                variant='ghost'
                onClick={clearAll}
                disabled={!isActiveAny}
                className='h-9'
              >
                Clear
              </Button>

              <Button onClick={done} className='h-9'>
                Done
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
