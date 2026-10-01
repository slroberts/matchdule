'use client';

import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * BottomSheet — Figma: Organisms › FilterDrawer / CalendarSheet (shared chrome)
 * One sheet language for every "more options" surface: scrim, dark sheet, grabber,
 * spring motion, and dialog behavior. Extracted from FilterDrawer so they can't drift.
 *
 * Dialog behavior: lock page scroll, focus `initialFocusRef` (the Close button),
 * Escape or scrim closes, focus returns to whatever opened the sheet.
 * Mount inside <AnimatePresence> so the exit animation plays.
 */

const SPRING = { type: 'spring', stiffness: 400, damping: 35 } as const;

interface BottomSheetProps {
  labelledBy: string;
  onClose: () => void;
  initialFocusRef: RefObject<HTMLElement | null>;
  /** Height rule for this sheet, e.g. full-height filters vs content-height menus */
  className?: string;
  children: ReactNode;
}

export const BottomSheet = ({
  labelledBy,
  onClose,
  initialFocusRef,
  className,
  children,
}: BottomSheetProps) => {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    initialFocusRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [initialFocusRef]);

  return (
    <MotionConfig reducedMotion='user'>
      {/* Scrim */}
      <motion.div
        aria-hidden='true'
        data-sheet-scrim // stable hook for interaction tests (backdrop tap)
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => onCloseRef.current()}
        className='fixed inset-0 z-(--z-scrim) bg-[rgb(5_8_20/0.6)]'
      />

      {/* Sheet */}
      <motion.div
        role='dialog'
        aria-modal='true'
        aria-labelledby={labelledBy}
        data-theme='dark'
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={SPRING}
        className={cn(
          'fixed inset-x-0 bottom-0 z-(--z-sheet) mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-(--radius-sheet) border-t border-(--color-border-strong) bg-(--color-bg-canvas) bg-(image:--gradient-sheet) shadow-(--shadow-sheet)',
          className,
        )}
      >
        {/* Grabber */}
        <div
          aria-hidden='true'
          className='mx-auto mt-2 h-1.25 w-9 shrink-0 rounded-full bg-(--color-border-strong)'
        />
        {children}
      </motion.div>
    </MotionConfig>
  );
};

/** Close (✕) for a sheet header — same control as FilterDrawer's */
export const SHEET_CLOSE_CLASSES = {
  button: 'tap-area min-w-(--size-tap) shrink-0 justify-center',
  visual:
    'tap-visual grid size-9 place-items-center rounded-(--radius-control) bg-(--color-bg-subtle) text-(--color-icon-default) shadow-(--shadow-control) hover:text-(--color-text-primary)',
} as const;
