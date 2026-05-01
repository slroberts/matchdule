import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './ui/Badge';
import MatchduleLogo from '@/public/matchdule-logo.svg';
import Image from 'next/image';

interface HeaderProps {
  dateRange: string;
  weekNumber: number;
  isCurrentWeek?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

export const Header = ({
  dateRange,
  weekNumber,
  isCurrentWeek = false, // Defaulting to false for safety
  onPrev,
  onNext,
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
          <button
            onClick={onPrev}
            className='nav-button'
            aria-label='Previous week'
          >
            <ChevronLeft size={20} />
          </button>

          <div className='text-center'>
            <h2 className='text-lg font-bold mb-1'>{dateRange}</h2>
            <div className='flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/50'>
              <span>Week {weekNumber}</span>
              {isCurrentWeek && <Badge variant='primary'>This Week</Badge>}
            </div>
          </div>

          <button
            onClick={onNext}
            className='nav-button'
            aria-label='Next week'
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
