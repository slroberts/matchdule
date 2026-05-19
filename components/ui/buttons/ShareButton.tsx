'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';
import { Match } from '@/types/match';
import { formatShortName } from '@/lib/match-utils';

export const ShareButton = ({ match }: { match: Match }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const homeTeam = formatShortName(match.homeTeam.name);
    const awayTeam = formatShortName(match.awayTeam.name);

    const matchText = `⚽ ${homeTeam} vs ${awayTeam}\n📅 ${match.date} @ ${match.time}\n📍 ${match.location}`;

    const url = window.location.href;

    const shareData = {
      title: 'Matchdule',
      text: matchText,
      url: url,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${matchText}\n\nLink: ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    }
  };

  return (
    <Button
      variant='outline'
      className='w-full py-2.5 transition-all duration-200 cursor-pointer'
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check size={16} className='mr-1 text-status-success' />
          <span className='text-status-success'>Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={16} className='mr-1' />
          Share
        </>
      )}
    </Button>
  );
};
