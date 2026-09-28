import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import MatchduleLogo from '@/public/matchdule-logo.svg';
import { cn } from '@/lib/utils';
import { TABS, type TabOption } from '@/types/match';

/**
 * ScheduleSkeleton — Figma: Screens › Schedule / Loading
 * The Suspense fallback while Supabase responds. A LOADING SHELL, not a card collage:
 * everything the server knows before the data arrives is REAL —
 *   • header: the week (from the URL) + season label
 *   • team tabs: labels + the parent's saved tab (cookie)
 *   • bottom tab bar
 * Only the match rows are placeholders, shaped like MatchRowCompact. Same geometry as the
 * real components, so nothing jumps when data lands. Server component — no client JS.
 */

interface Props {
  dateRange: string;
  seasonLabel: string;
  isCurrentWeek: boolean;
  activeTeam: TabOption;
  view?: 'schedule' | 'season';
}

const Bone = ({ className }: { className: string }) => (
  <span
    aria-hidden='true'
    className={cn('block rounded-full bg-(--color-bg-subtle)', className)}
  />
);

const RowSkeleton = ({ widths }: { widths: [string, string] }) => (
  <div className='flex min-h-18 items-center gap-(--space-stack-md) rounded-2xl bg-(--color-bg-surface) px-(--space-card-pad) py-3.5 shadow-(--shadow-card)'>
    <span className='flex w-14 shrink-0 flex-col gap-1.5'>
      <Bone className='h-3.5 w-10' />
      <Bone className='h-2 w-6' />
    </span>
    <Bone className='size-(--size-avatar) shrink-0' />
    <span className='flex min-w-0 flex-1 flex-col gap-2'>
      <Bone className='h-3 w-22' />
      <Bone className={cn('h-2.5', widths[0])} />
      <Bone className={cn('h-2.5', widths[1])} />
    </span>
  </div>
);

export const ScheduleSkeleton = ({
  dateRange,
  seasonLabel,
  isCurrentWeek,
  activeTeam,
  view = 'schedule',
}: Props) => (
  <div className='flex min-h-dvh flex-col'>
    {/* Sticky chrome = header + team tabs, exactly like ClientView */}
    <div className='sticky top-0 z-(--z-header) flex w-full flex-col'>
      {/* ── Header: same markup/geometry as <Header>, inert ─────────────────── */}
      <header
        data-theme='dark'
        className='surface-chrome w-full pt-[env(safe-area-inset-top,0px)] pb-2'
      >
        <div className='mx-auto w-full max-w-lg'>
          <div className='flex h-(--size-app-header) items-center justify-between pl-(--space-gutter) pr-(--space-stack-sm)'>
            <Image
              src={MatchduleLogo}
              width={140}
              height={17}
              alt='Matchdule'
              className='h-auto w-35 shrink-0'
              priority
            />
            {view === 'schedule' && (
              <span className='text-label inline-flex min-h-(--size-tap) items-center gap-(--space-stack-sm) px-(--space-stack-sm) text-(--color-text-secondary) opacity-60'>
                <SlidersHorizontal
                  size={16}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                  aria-hidden='true'
                />
                Filters
              </span>
            )}
          </div>

          {view === 'season' ? (
            <div className='flex h-18 items-end px-(--space-gutter) pb-3'>
              <Bone className='h-6 w-32 bg-white/10' />
            </div>
          ) : (
            <div className='flex h-18 items-center gap-(--space-stack-sm) px-(--space-gutter) py-(--space-stack-sm)'>
              {[ChevronLeft, null, ChevronRight].map((Icon, i) =>
                Icon ? (
                  <span
                    key={i}
                    aria-hidden='true'
                    className='grid min-w-(--size-tap) place-items-center'
                  >
                    <span className='grid size-9 place-items-center rounded-(--radius-control) bg-(--color-bg-subtle) text-(--color-icon-default) opacity-60 shadow-(--shadow-control)'>
                      <Icon size={16} strokeWidth={1.5} absoluteStrokeWidth />
                    </span>
                  </span>
                ) : (
                  <div
                    key={i}
                    className='flex min-w-0 flex-1 flex-col items-center gap-(--space-stack-xs)'
                  >
                    <h2 className='text-score whitespace-nowrap text-(--color-text-primary)'>
                      {dateRange}
                    </h2>
                    <div className='flex h-6 items-center gap-(--space-stack-sm)'>
                      <span className='text-label text-(--color-text-secondary)'>
                        {seasonLabel}
                      </span>
                      {isCurrentWeek && (
                        <span className='text-label rounded-full bg-(--color-accent-surface) px-1.75 py-0.75 text-[0.625rem] leading-none tracking-[0.08em] text-(--color-accent-on-surface)'>
                          This week
                        </span>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </header>
      {/* ── Team tabs: real labels, saved tab selected (same pill geometry) ── */}
      <div className='bg-(--color-bg-canvas) pt-(--space-stack-sm)'>
        <div className='scroll-x mx-auto w-full max-w-lg px-(--space-gutter)'>
          {TABS.map((tab) => (
            <span
              key={tab}
              className='inline-flex min-h-(--size-tap) shrink-0 items-center'
            >
              <span
                className={cn(
                  'text-control inline-flex h-9 items-center rounded-(--radius-full) px-(--space-stack-md)',
                  tab === activeTeam
                    ? 'bg-(--color-bg-accent) text-(--color-text-on-accent) shadow-(--shadow-accent)'
                    : 'bg-(--color-bg-surface) text-(--color-text-secondary) shadow-(--shadow-card)',
                )}
              >
                {tab}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>

    <main className='page-canvas flex-1 pt-(--space-stack-sm) pb-[calc(var(--size-tab-bar)+var(--safe-bottom)+24px)]'>
      {/* ── Placeholder rows (MatchRowCompact geometry) ─────────────────── */}
      <div
        role='status'
        aria-live='polite'
        className='mx-auto flex w-full max-w-lg flex-col gap-(--space-stack-sm) px-(--space-gutter) motion-safe:animate-pulse'
      >
        <span className='visually-hidden'>
          Loading {view === 'season' ? 'season' : 'matches'}…
        </span>
        <Bone className='mb-1 h-2.5 w-28 bg-(--color-border-default)' />
        <RowSkeleton widths={['w-44', 'w-36']} />
        <RowSkeleton widths={['w-48', 'w-28']} />
        <RowSkeleton widths={['w-40', 'w-40']} />
      </div>
    </main>

    {/* ── Tab bar: static, same position/height as <TabBar> ─────────────── */}
    <nav
      aria-hidden='true'
      className='glass fixed inset-x-0 bottom-0 z-(--z-tab-bar) border-t border-(--color-border-default) pt-1 pb-[max(env(safe-area-inset-bottom,0px),8px)]'
    >
      <div className='mx-auto flex w-full max-w-lg px-4'>
        {[
          { label: 'Schedule', Icon: Calendar, active: view === 'schedule' },
          { label: 'Season', Icon: Trophy, active: view === 'season' },
        ].map(({ label, Icon, active }) => (
          <span
            key={label}
            className={cn(
              'text-meta flex min-h-(--size-tap) flex-1 flex-col items-center justify-center gap-0.5 pt-1.5 pb-1 font-semibold',
              active
                ? 'text-(--color-text-accent)'
                : 'text-(--color-text-secondary)',
            )}
          >
            <Icon size={22} strokeWidth={1.5} absoluteStrokeWidth />
            {label}
          </span>
        ))}
      </div>
    </nav>
  </div>
);
