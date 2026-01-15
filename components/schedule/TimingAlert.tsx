import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import BoldLabel, { TimingTone } from './BoldLabel';

export default function TimingAlert({
  show,
  title,
  tone,
  countLabel,
  firstLabel,
  icon,
  resetKey,
}: {
  show: boolean;
  title: string;
  tone: TimingTone;
  countLabel: string;
  firstLabel: string | null;
  icon: React.ReactNode;
  resetKey: string;
}) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => setDismissed(false), [resetKey]);

  if (!show || dismissed) return null;

  const gradient =
    tone === 'conflict'
      ? 'bg-gradient-to-b from-[#FB2C36] to-[#E7000B]'
      : 'bg-gradient-to-b from-[#FBB000] to-[#F0A30A]';

  return (
    <div
      className={cn(
        'flex items-start gap-2 p-4 mt-6 mb-4 rounded-2xl text-white',
        gradient
      )}
      aria-live='polite'
    >
      <div className='mt-1'>{icon}</div>

      <div className='flex-1'>
        <div className='font-bold text-sm'>{title}</div>

        <div className='text-sm mt-1'>
          {countLabel}
          {firstLabel ? (
            <>
              {' — '}
              <BoldLabel label={firstLabel} tone={tone} />
            </>
          ) : null}
        </div>

        <button
          type='button'
          onClick={() => setDismissed(true)}
          className={cn(
            'mt-4 ml-auto block text-xs underline underline-offset-2',
            'opacity-90 hover:opacity-100'
          )}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
