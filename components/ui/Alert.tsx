'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface AlertProps {
  variant: 'destructive' | 'warning';
  icon: React.ReactNode;
  title: string;
  description: string;
  details?: string[];
}

export const Alert = ({
  variant,
  icon,
  title,
  description,
  details,
}: AlertProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const styles = {
    destructive: 'bg-gradient-to-r from-[#FB2C36] to-[#E7000B]',
    warning: 'bg-gradient-to-r from-[#FBB000] to-[#F0A30A]',
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      setIsExpanded(false);
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col p-4 rounded-xl shadow-md text-white transition-all duration-300',
        isMuted ? 'bg-zinc-500' : styles[variant],
      )}
    >
      <div
        className='flex items-start justify-between gap-3 cursor-pointer group'
        onClick={() => setIsExpanded(!isExpanded)}
        role='button'
        aria-expanded={isExpanded}
      >
        <div className='flex items-center gap-3'>
          <div className='shrink-0'>{icon}</div>
          <h4 className='text-sm font-bold uppercase tracking-wide leading-none shadow-black/10 text-shadow-sm mt-0.5'>
            {title}

            {isMuted && (
              <span className='ml-2 lowercase tracking-normal font-medium opacity-70'>
                (muted)
              </span>
            )}
          </h4>
        </div>

        <button
          className='shrink-0 opacity-70 group-hover:opacity-100 transition-opacity focus:outline-none mt-0.5'
          aria-label={isExpanded ? 'Collapse alert' : 'Expand alert'}
        >
          {isExpanded ? (
            <ChevronUp size={18} strokeWidth={2.5} />
          ) : (
            <ChevronDown size={18} strokeWidth={2.5} />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className='flex flex-col gap-1 pr-6 pl-8 animate-stagger-fade mt-2'>
          <p className='text-sm font-medium opacity-95 leading-snug'>
            {description}
          </p>

          {details && details.length > 0 && (
            <ul className='mt-2 flex flex-col gap-1 border-t border-white/20 pt-2 w-full'>
              {details.map((detail, idx) => (
                <li
                  key={idx}
                  className='text-sm font-bold opacity-90 tracking-wide'
                >
                  {detail}
                </li>
              ))}
            </ul>
          )}
          <div className='flex justify-end mt-1'>
            <button
              className='opacity-70 hover:opacity-100 transition-opacity focus:outline-none mt-1 cursor-pointer text-xs font-bold uppercase tracking-wider'
              aria-label={isMuted ? 'Alert muted' : 'Alert unmuted'}
              onClick={handleMuteToggle}
            >
              {isMuted ? 'Unmute' : 'Mute Alert'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
