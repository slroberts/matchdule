'use client';

import { cn } from '@/lib/utils';
import { Calendar, Equal, MapPin, Trophy } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../../ui/card';
import { Game } from '@/types/schedule';
import { MapLink, ShareMenu, TeamLine, TimeBadge } from '.';

export default function GameCard({
  game,
  label,
}: {
  game: Game;
  label: string;
}) {
  const norm = (s: string) =>
    s.replace(/&amp;/gi, '&').normalize('NFKC').replace(/\s+/g, ' ').trim();

  const name = norm(game.team);

  const teamAvatarClass = /\bB\s*&\s*G\b/i.test(name)
    ? 'avatar--bandg'
    : 'avatar--soricha';

  const bothScored =
    typeof game.scoreFor === 'number' && typeof game.scoreAgainst === 'number';

  const dimFor = bothScored ? game.scoreFor! < game.scoreAgainst! : false;
  const dimAgainst = bothScored ? game.scoreAgainst! < game.scoreFor! : false;
  return (
    <Card>
      <CardHeader>
        <div className='flex flex-nowrap max-[596px]:flex-wrap items-center gap-x-3 gap-y-2'>
          <div className='flex items-center gap-2 font-medium tracking-tight'>
            <Calendar className='h-4 w-4' aria-hidden />
            {label}
          </div>

          <span className='text-[#E2E8F0]'>|</span>

          <TimeBadge startISO={game.startISO} tz='America/New_York' />

          {/* hide this one on small screens */}
          <span className='text-[#E2E8F0] max-[596px]:hidden'>|</span>

          {/* force this block onto the next line under 540px */}
          <div className='flex items-center gap-2 min-w-0 max-[596px]:basis-full'>
            <MapPin className='h-4 w-4 shrink-0' aria-hidden />
            <span className='min-w-0 break-words'>
              {game.location || 'Location TBD'}
            </span>
          </div>
        </div>

        {game.result === 'W' ? (
          <div className='bg-[#00BC7D] rounded-full w-10 h-10 shrink-0 flex items-center justify-center'>
            <Trophy className='h-5 w-5 text-white' aria-hidden />
          </div>
        ) : game.result === 'L' ? (
          <div className='bg-[#E92C2C] rounded-full w-10 h-10 shrink-0 flex items-center justify-center'>
            <Trophy className='h-5 w-5 rotate-[30deg] text-white' aria-hidden />
          </div>
        ) : game.result === 'D' ? (
          <div className='bg-[#808080] rounded-full w-10 h-10 shrink-0 flex items-center justify-center'>
            <Equal className='h-5 w-5 text-white' aria-hidden />
          </div>
        ) : null}
      </CardHeader>

      <CardContent>
        <TeamLine
          name={game.team}
          score={bothScored ? game.scoreFor : null}
          dimScore={dimFor}
          avatarClassName={teamAvatarClass}
        />
        <div className={cn('flex items-center gap-2')}>
          <div className='h-px w-1/2 bg-[#E2E8F0]' />
          <span className='text-[10px] font-black tracking-widest text-[#64748B]/50'>
            VS
          </span>
          <div className='h-px w-1/2 bg-[#E2E8F0]' />
        </div>
        <TeamLine
          name={game.opponent}
          score={bothScored ? game.scoreAgainst : null}
          dimScore={dimAgainst}
        />
      </CardContent>
      <CardFooter>
        <div className='w-1/2'>
          <ShareMenu game={game} />
        </div>
        <div className='w-1/2'>
          <MapLink address={game.location || undefined}>
            <Button variant='outline' size='lg'>
              <MapPin className='h-4 w-4' aria-hidden />
              <span>Directions</span>
            </Button>
          </MapLink>
        </div>
      </CardFooter>
    </Card>
  );
}
