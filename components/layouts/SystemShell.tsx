import type { ReactNode } from 'react';
import Image from 'next/image';
import MatchduleLogo from '@/public/matchdule-logo.svg';

/**
 * SystemShell — app chrome for pages outside the schedule/season views (404, route error).
 * Figma: Screens › 05 · System & empty states › System / Not found
 *
 * <body> is intentionally dark (iOS samples it for the status-bar blur), so content
 * must sit on `.page-canvas` — exactly like ClientView's <main>. The header row mirrors
 * Header's AppHeader row (same height, gutters, logo) without week nav or Filters,
 * which don't apply here.
 */
export const SystemShell = ({ children }: { children: ReactNode }) => (
  <div className='flex min-h-dvh flex-col'>
    <header
      data-theme='dark'
      className='surface-chrome w-full pt-[env(safe-area-inset-top,0px)] pb-2'
    >
      <div className='mx-auto w-full max-w-lg'>
        <div className='flex h-(--size-app-header) items-center pl-(--space-gutter) pr-(--space-stack-sm)'>
          <Image
            src={MatchduleLogo}
            width={140}
            height={17}
            alt='Matchdule'
            className='h-auto w-35 shrink-0'
            priority
          />
        </div>
      </div>
    </header>

    <main className='page-canvas flex-1 pt-(--space-stack-sm) pb-[calc(var(--safe-bottom)+24px)]'>
      {children}
    </main>
  </div>
);
