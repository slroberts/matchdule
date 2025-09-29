'use client';
import { Loader } from 'lucide-react';
import * as React from 'react';

type Props = {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number; // px
};

export default function PullToRefresh({
  onRefresh,
  children,
  threshold = 60,
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [y, setY] = React.useState(0);
  const startY = React.useRef<number | null>(null);
  const pulling = React.useRef(false);
  const refreshing = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current!;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing.current) return;
      if (el.scrollTop !== 0) return; // only at top
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!pulling.current || startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0 && el.scrollTop === 0) {
        e.preventDefault(); // stop native scroll bounce
        setY(Math.min(dy * 0.6, 120)); // dampen
      } else if (dy < 0) {
        // user swiped up; cancel
        pulling.current = false;
        setY(0);
        startY.current = null;
      }
    };

    const onTouchEnd = async () => {
      if (!pulling.current) return;
      pulling.current = false;

      if (y >= threshold && !refreshing.current) {
        refreshing.current = true;
        setY(threshold); // lock at threshold while refreshing
        try {
          await onRefresh();
        } finally {
          refreshing.current = false;
          // smooth reset
          requestAnimationFrame(() => setY(0));
        }
      } else {
        setY(0);
      }
      startY.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [y, threshold, onRefresh]);

  return (
    <div
      ref={ref}
      className='h-[100dvh] overflow-y-auto touch-pan-y overscroll-contain'
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* pull indicator */}
      <div
        className='pointer-events-none sticky top-0 z-10 flex h-10 items-center justify-center text-xs text-muted-foreground'
        style={{ transform: `translateY(${y ? y - 40 : -40}px)` }}
      >
        {y >= threshold ? (
          <span className='animate-spin'>
            <Loader className='w-8 h-8 opacity-30' />
          </span>
        ) : (
          'Pull to refresh '
        )}
      </div>

      {/* content shifts down while pulling */}
      <div
        style={{
          transform: `translateY(${y}px)`,
          transition: y ? 'none' : 'transform 180ms ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
