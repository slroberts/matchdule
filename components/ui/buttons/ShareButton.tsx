'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Match } from '@/types/match';
import { formatShortName } from '@/lib/matches/match-utils';
import { nyDateKey } from '@/lib/dates/ny-time';

/**
 * ShareButton — Figma: MatchCard › Footer › Share (44×44, bg subtle, radius control)
 * Fixed size in both states (no layout shift); "copied" is announced via a live region.
 *
 * Shares the game details + a link to that game's week. The link goes INSIDE `text`
 * (no separate `url` field): several share targets — Messages on Mac, Copy — keep only
 * the url when both are given and silently drop the details.
 */

const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

/* The browser allows ONE share sheet per page at a time — a second navigator.share()
   (double-tap, or another card's Share while the sheet is open) throws InvalidStateError.
   Module-level, not per-button, because the limit is page-wide. */
let isSharing = false;

export const ShareButton = ({ match }: { match: Match }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const homeTeam = formatShortName(match.homeTeam.name);
    const awayTeam = formatShortName(match.awayTeam.name);
    // Opens the schedule on the week of this game
    const url = `${window.location.origin}/?date=${nyDateKey(match.timestamp)}`;
    const text = `⚽ ${homeTeam} vs ${awayTeam}\n📅 ${match.date} @ ${match.time}\n📍 ${match.location}\n${url}`;
    // Title names the game — it's what the receiving app shows first
    const shareData = { title: `${homeTeam} vs ${awayTeam}`, text };

    // canShare is missing in some browsers — guard before calling it
    if (
      navigator.share &&
      (!navigator.canShare || navigator.canShare(shareData))
    ) {
      if (isSharing) return; // a share sheet is already open — ignore the extra tap
      isSharing = true;
      try {
        await navigator.share(shareData);
      } catch (error) {
        // AbortError = user dismissed the sheet; InvalidStateError = overlapping call. Both are expected.
        const name = (error as Error).name;
        if (name !== 'AbortError' && name !== 'InvalidStateError')
          console.error('Error sharing:', error);
      } finally {
        isSharing = false;
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <>
      <button
        type='button'
        onClick={handleShare}
        aria-label='Share match'
        className='pressable grid size-(--size-tap) shrink-0 place-items-center rounded-(--radius-control) bg-(--color-bg-subtle) text-(--color-icon-default) hover:text-(--color-text-primary)'
      >
        {copied ? (
          <Check
            {...ICON}
            aria-hidden='true'
            className='text-(--color-icon-accent)'
          />
        ) : (
          <Share2 {...ICON} aria-hidden='true' />
        )}
      </button>
      <span role='status' className='visually-hidden'>
        {copied ? 'Match details copied' : ''}
      </span>
    </>
  );
};
