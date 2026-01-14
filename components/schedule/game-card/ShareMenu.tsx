'use client';

import { useState, type MouseEvent } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import type { Game } from '@/types/schedule';
import { buildShareData, tryWebShare } from '@/lib/share';

type Props = { game: Game; className?: string };

export default function ShareMenu({ game }: Props) {
  const [open, setOpen] = useState(false);
  const data = buildShareData(game);

  const onClickShare = async (e: MouseEvent) => {
    // stop PopoverTrigger from toggling
    e.preventDefault();
    e.stopPropagation();

    const usedWebShare = await tryWebShare(game);
    if (usedWebShare) {
      // native sheet shown — keep popover closed
      setOpen(false);
      return;
    }
    // show popover fallback
    setOpen((v) => !v);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant='outline' size='lg' onClick={onClickShare}>
          <Share2 className='h-4 w-4' aria-hidden />
          <span>Share</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align='start' sideOffset={6} className='min-w-56 p-0'>
        <div className='px-3 py-2 text-sm font-medium'>Share</div>
        <div className='h-px bg-border' />

        <div className='py-1'>
          <button
            className='w-full text-left px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
            onClick={async () => {
              await navigator.clipboard.writeText(data.url);
              setOpen(false);
            }}
          >
            Copy link
          </button>

          <a
            className='block px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
            href={`mailto:?subject=${encodeURIComponent(
              data.title
            )}&body=${encodeURIComponent(`${data.text}\n${data.url}`)}`}
          >
            Email
          </a>

          <a
            className='block px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
            href={`sms:&body=${encodeURIComponent(`${data.text} ${data.url}`)}`}
          >
            SMS / iMessage
          </a>

          <a
            className='block px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
            target='_blank'
            rel='noopener'
            href={`https://wa.me/?text=${encodeURIComponent(
              `${data.text} ${data.url}`
            )}`}
          >
            WhatsApp
          </a>

          <a
            className='block px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
            target='_blank'
            rel='noopener'
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              data.text
            )}&url=${encodeURIComponent(data.url)}`}
          >
            X (Twitter)
          </a>

          <a
            className='block px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground'
            target='_blank'
            rel='noopener'
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              data.url
            )}`}
          >
            Facebook
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
