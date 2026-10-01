'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { CalendarPlus, Download, ExternalLink, Rss, X } from 'lucide-react';
import type { Match } from '@/types/match';
import {
  feedKey,
  feedLabel,
  getMatchEvent,
  googleCalendarUrl,
} from '@/lib/calendar/match-event';
import { formatNY } from '@/lib/dates/ny-time';
import {
  BottomSheet,
  SHEET_CLOSE_CLASSES,
} from '@/components/ui/BottomSheet/BottomSheet';

/**
 * CalendarButton — Figma: MatchCard / VersusCard › Footer › Calendar (44×44) + Organisms › CalendarSheet
 * Upcoming games only (the parent decides).
 *
 * Opens a bottom sheet — the same sheet as Filters (BottomSheet), so every "more options"
 * surface rises from the bottom like the native share sheet. The header names the game,
 * because the sheet covers the card it came from.
 *
 * Options hand off to native iOS UI: .ics → "Add to Calendar" sheet, webcal:// → "Subscribe".
 * Rendered in a portal: cards use motion transforms + overflow-hidden, which would trap a fixed sheet.
 */

const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

const ITEM =
  'pressable flex min-h-(--size-tap) items-start gap-3 px-(--space-gutter) py-3 text-left hover:bg-(--color-bg-subtle)';

const noopSubscribe = () => () => {};

/** webcal:// opens Calendar's Subscribe dialog on Apple devices; elsewhere use Google's "add by URL" */
const subscribeUrl = (match: Match) => {
  const feed = `webcal://${window.location.host}/api/calendar/feed/${feedKey(match)}.ics`;
  return /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
    ? feed
    : `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(feed)}`;
};

/** "Sat, Oct 3 · 4:00 PM" — or "Time TBD" */
const whenLabel = (match: Match) => {
  const day = formatNY(match.timestamp, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `${day} · ${match.time === 'TBD' ? 'Time TBD' : match.time}`;
};

const CalendarSheet = ({
  match,
  onClose,
}: {
  match: Match;
  onClose: () => void;
}) => {
  const titleId = `calendar-sheet-${match.id}`;
  const closeRef = useRef<HTMLButtonElement>(null);
  const subscribeHref = subscribeUrl(match); // client-only: the sheet only mounts after a tap

  return (
    <BottomSheet
      labelledBy={titleId}
      onClose={onClose}
      initialFocusRef={closeRef}
      className='max-h-[85dvh]'
    >
      {/* Header — names the game the sheet now covers */}
      <div className='flex shrink-0 items-start gap-(--space-stack-sm) px-(--space-gutter) pt-3 pb-2'>
        <div className='min-w-0 flex-1'>
          <h2 id={titleId} className='text-display text-(--color-text-primary)'>
            Add to calendar
          </h2>
          <p className='text-meta text-(--color-text-secondary)'>
            {getMatchEvent(match).title}
            <br />
            {whenLabel(match)}
          </p>
        </div>
        <button
          ref={closeRef}
          type='button'
          onClick={onClose}
          aria-label='Close'
          className={SHEET_CLOSE_CLASSES.button}
        >
          <span className={SHEET_CLOSE_CLASSES.visual}>
            <X {...ICON} aria-hidden='true' />
          </span>
        </button>
      </div>

      <div className='flex flex-col overflow-y-auto overscroll-contain pb-[max(env(safe-area-inset-bottom,0px),16px)]'>
        {/* Route handler, not a <Link>: it returns a file, not a page */}
        <a
          href={`/api/calendar/${encodeURIComponent(match.id)}`}
          onClick={onClose}
          className={ITEM}
        >
          <Download
            {...ICON}
            aria-hidden='true'
            className='mt-0.5 shrink-0 text-(--color-icon-default)'
          />
          <span className='flex min-w-0 flex-col gap-0.5'>
            <span className='text-control text-(--color-text-primary)'>
              Apple Calendar or Outlook
            </span>
            <span className='text-meta text-(--color-text-secondary)'>
              Adds this game (.ics)
            </span>
          </span>
        </a>

        <a
          href={googleCalendarUrl(match)}
          target='_blank'
          rel='noopener noreferrer'
          onClick={onClose}
          className={ITEM}
        >
          <ExternalLink
            {...ICON}
            aria-hidden='true'
            className='mt-0.5 shrink-0 text-(--color-icon-default)'
          />
          <span className='flex min-w-0 flex-col gap-0.5'>
            <span className='text-control text-(--color-text-primary)'>
              Google Calendar
              <span className='visually-hidden'> (opens in a new tab)</span>
            </span>
            <span className='text-meta text-(--color-text-secondary)'>
              Opens Google Calendar
            </span>
          </span>
        </a>

        <div
          role='separator'
          className='mx-(--space-gutter) my-1 h-px bg-(--color-border-default)'
        />

        <a
          href={subscribeHref}
          target={subscribeHref.startsWith('webcal:') ? undefined : '_blank'}
          rel='noopener noreferrer'
          onClick={onClose}
          className={ITEM}
        >
          <Rss
            {...ICON}
            aria-hidden='true'
            className='mt-0.5 shrink-0 text-(--color-icon-accent)'
          />
          <span className='flex min-w-0 flex-col gap-0.5'>
            <span className='text-control text-(--color-text-accent)'>
              Subscribe to all {feedLabel(match)} games
            </span>
            <span className='text-meta text-(--color-text-secondary)'>
              New games and changes appear automatically
            </span>
          </span>
        </a>
      </div>
    </BottomSheet>
  );
};

export const CalendarButton = ({ match }: { match: Match }) => {
  const [open, setOpen] = useState(false);
  // Portal target exists only in the browser
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-label='Add to calendar'
        aria-haspopup='dialog'
        aria-expanded={open}
        className='pressable grid size-(--size-tap) shrink-0 place-items-center rounded-(--radius-control) bg-(--color-bg-subtle) text-(--color-icon-default) hover:text-(--color-text-primary)'
      >
        <CalendarPlus {...ICON} aria-hidden='true' />
      </button>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {open && (
              <CalendarSheet match={match} onClose={() => setOpen(false)} />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
};
