'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { CalendarPlus, Download, ExternalLink } from 'lucide-react';
import type { Match } from '@/types/match';
import { googleCalendarUrl } from '@/lib/calendar/match-event';

/**
 * CalendarButton — Figma: MatchCard / VersusCard › Footer › Calendar (44×44) + Organisms › CalendarMenu
 * Upcoming games only (the parent decides).
 *
 * Built on the native Popover API: light-dismiss, Escape, and focus-return to the button come
 * from the browser, and the menu renders in the top layer — VersusCard is `overflow-hidden`,
 * which would clip an absolutely-positioned dropdown.
 *
 * "Subscribe to all [team] games" (Figma) ships with the per-team feed endpoint — not yet.
 */

const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;
const MENU_WIDTH = 300;
const EDGE = 16; // keep clear of screen edges (320px screens → 288px menu)
const GAP = 8; // space between button and menu

const ITEM =
  'pressable flex min-h-(--size-tap) items-start gap-3 px-4 py-2.5 text-left hover:bg-(--color-bg-subtle)';

export const CalendarButton = ({ match }: { match: Match }) => {
  const menuId = `calendar-menu-${useId()}`;
  const labelId = `${menuId}-label`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Place the menu next to the button when it opens (above if it fits, else below)
  useEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const onToggle = (event: Event) => {
      const isOpen = (event as ToggleEvent).newState === 'open';
      setOpen(isOpen);
      if (!isOpen) {
        menu.removeAttribute('data-placed');
        return;
      }
      // Match the PAGE theme, not the card's: VersusCard is a data-theme="dark" island,
      // and the menu (DOM child, top-layer render) would otherwise inherit its navy tokens.
      menu.dataset.theme = document.documentElement.dataset.theme ?? 'light';
      const anchor = buttonRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const width = Math.min(MENU_WIDTH, window.innerWidth - EDGE * 2);
      menu.style.width = `${width}px`;
      const height = menu.offsetHeight;
      const above = anchor.top - GAP - height;
      menu.style.top = `${above >= EDGE ? above : anchor.bottom + GAP}px`;
      menu.style.left = `${Math.min(
        Math.max(anchor.right - width, EDGE),
        window.innerWidth - width - EDGE,
      )}px`;
      menu.setAttribute('data-placed', ''); // reveal only once positioned (no flash)
      menu.querySelector<HTMLElement>('a')?.focus();
    };

    menu.addEventListener('toggle', onToggle);
    return () => menu.removeEventListener('toggle', onToggle);
  }, []);

  // The menu is fixed-position — close it rather than let it drift on scroll/resize
  useEffect(() => {
    if (!open) return;
    const close = () => menuRef.current?.hidePopover();
    window.addEventListener('scroll', close, { passive: true, capture: true });
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, { capture: true });
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const close = () => menuRef.current?.hidePopover();

  return (
    <>
      <button
        ref={buttonRef}
        type='button'
        popoverTarget={menuId}
        aria-label='Add to calendar'
        aria-expanded={open}
        aria-controls={menuId}
        className='pressable grid size-(--size-tap) shrink-0 place-items-center rounded-(--radius-control) bg-(--color-bg-subtle) text-(--color-icon-default) hover:text-(--color-text-primary)'
      >
        <CalendarPlus {...ICON} aria-hidden='true' />
      </button>

      <div
        ref={menuRef}
        id={menuId}
        popover='auto'
        aria-labelledby={labelId}
        className='fixed inset-auto m-0 overflow-hidden rounded-(--radius-card) border-0 bg-(--color-bg-surface) p-0 py-1.5 text-(--color-text-primary) opacity-0 shadow-(--shadow-raised) transition-opacity duration-(--duration-fade) data-placed:opacity-100'
      >
        <p
          id={labelId}
          className='text-label px-4 pt-2.5 pb-1.5 text-(--color-text-secondary)'
        >
          Add to calendar
        </p>

        {/* Route handler, not a <Link>: it returns a file, not a page */}
        <a
          href={`/api/calendar/${encodeURIComponent(match.id)}`}
          onClick={close}
          className={ITEM}
        >
          <Download
            {...ICON}
            aria-hidden='true'
            className='mt-0.5 shrink-0 text-(--color-icon-default)'
          />
          <span className='flex min-w-0 flex-col gap-0.5'>
            <span className='text-control'>Apple Calendar or Outlook</span>
            <span className='text-meta text-(--color-text-secondary)'>
              Adds this game (.ics)
            </span>
          </span>
        </a>

        <a
          href={googleCalendarUrl(match)}
          target='_blank'
          rel='noopener noreferrer'
          onClick={close}
          className={ITEM}
        >
          <ExternalLink
            {...ICON}
            aria-hidden='true'
            className='mt-0.5 shrink-0 text-(--color-icon-default)'
          />
          <span className='flex min-w-0 flex-col gap-0.5'>
            <span className='text-control'>
              Google Calendar
              <span className='visually-hidden'> (opens in a new tab)</span>
            </span>
            <span className='text-meta text-(--color-text-secondary)'>
              Opens Google Calendar
            </span>
          </span>
        </a>
      </div>
    </>
  );
};
