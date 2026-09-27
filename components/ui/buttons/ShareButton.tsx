'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Match } from '@/types/match';
import { formatShortName } from '@/lib/matches/match-utils';

/**
 * ShareButton — Figma: MatchCard › Footer › Share (44×44, bg subtle, radius control)
 * Fixed size in both states (no layout shift); "copied" is announced via a live region.
 */

const ICON = { size: 16, strokeWidth: 1.5, absoluteStrokeWidth: true } as const;

export const ShareButton = ({ match }: { match: Match }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const homeTeam = formatShortName(match.homeTeam.name);
    const awayTeam = formatShortName(match.awayTeam.name);
    const text = `⚽ ${homeTeam} vs ${awayTeam}\n📅 ${match.date} @ ${match.time}\n📍 ${match.location}`;
    const url = window.location.href;
    const shareData = { title: 'Matchdule', text, url };

    // canShare is missing in some browsers — guard before calling it
    if (
      navigator.share &&
      (!navigator.canShare || navigator.canShare(shareData))
    ) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError')
          console.error('Error sharing:', error);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${text}\n\nLink: ${url}`);
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
