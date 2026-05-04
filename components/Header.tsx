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
  isCurrentWeek = false, // Defaulting to false for safety
  prevWeekDate,
  nextWeekDate,
  hasPrev,
  hasNext,
}: HeaderProps) => {
  return (
    <header className='sticky top-0 z-50 text-white shadow-header bg-brand-gradient-navy'>
      <div className='max-w-md mx-auto'>
        {/* Top Row: Brand & Actions */}
        <div className='flex justify-between items-start p-6 border-b border-white/10'>
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

        {/* Bottom Row: Navigation */}
        <div className='flex items-center justify-between p-6 bg-glass-gradient'>
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

          <div className='text-center'>
            <h2 className='text-lg font-bold mb-1'>{dateRange}</h2>
            <div className='flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50'>
              <span>Week {weekNumber}</span>
              {isCurrentWeek ? (
                <Badge variant='primary'>This Week</Badge>
              ) : (
                <Link
                  href='/'
                  className='text-white/80 hover:text-white underline underline-offset-[3px] decoration-white/30 hover:decoration-white transition-all cursor-pointer'
                  aria-label='Return to current week'
                >
                  Go to current
                </Link>
              )}
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
