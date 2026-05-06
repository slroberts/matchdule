import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './ui/Badge';
import MatchduleLogo from '@/public/matchdule-logo.svg';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface HeaderProps {
  dateRange: string;
  weekNumber: number;
  isCurrentWeek: boolean;
  prevWeekDate: string;
  nextWeekDate: string;
  hasPrev: boolean;
  hasNext: boolean;
}

export const Header = ({
  dateRange,
  weekNumber,
  isCurrentWeek = false,
  prevWeekDate,
  nextWeekDate,
  hasPrev,
  hasNext,
}: HeaderProps) => {
  return (
    <header className='sticky top-0 z-50 w-full text-white shadow-header bg-brand-gradient-navy'>
      {/* Top Row: Brand & Actions */}
      <div className='border-b border-white/10'>
        <div className='w-full max-w-lg mx-auto flex justify-between items-center px-6 py-4'>
          <Image
            src={MatchduleLogo}
            width={140}
            height={17}
            alt='Logo'
            className='h-auto'
            loading='eager'
          />
          <button className='flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity'>
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Navigation */}
      <div className='bg-glass-gradient'>
        <div className='w-full max-w-lg mx-auto flex items-center justify-between px-6 py-4'>
          <Link
            href={hasPrev ? `/?date=${prevWeekDate}` : '#'}
            className={cn(
              'nav-button transition-all',
              !hasPrev && 'opacity-30 pointer-events-none',
            )}
            aria-disabled={!hasPrev}
            aria-label='Previous week'
          >
            <ChevronLeft size={20} />
          </Link>

          <div className='text-center flex flex-col items-center justify-center'>
            <h2 className='text-lg font-bold mb-1'>{dateRange}</h2>

            <div className='flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-white/50 h-6'>
              <span className='mr-2 shrink-0'>Week {weekNumber}</span>

              <div className='w-[100px] flex items-center justify-start shrink-0'>
                {isCurrentWeek ? (
                  <Badge variant='primary'>This Week</Badge>
                ) : (
                  <Link
                    href='/'
                    className='text-white/80 hover:text-white underline underline-offset-[3px] decoration-white/30 hover:decoration-white transition-all cursor-pointer whitespace-nowrap'
                    aria-label='Return to current week'
                  >
                    Jump to current
                  </Link>
                )}
              </div>
            </div>
          </div>

          <Link
            href={hasNext ? `/?date=${nextWeekDate}` : '#'}
            className={cn(
              'nav-button transition-all',
              !hasNext && 'opacity-30 pointer-events-none',
            )}
            aria-disabled={!hasNext}
            aria-label='Next week'
          >
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
};
