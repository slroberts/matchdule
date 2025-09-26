import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'; // ⬅️ use shadcn/ui
import { ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamFilter } from '@/types/schedule';

export default function ControlsBar({
  season,
  setSeason,
  week,
  setWeek,
  teamFilter,
  setTeamFilter,
  weekOptions,
  setFiltersOpen,
}: {
  season: string;
  setSeason: (v: string) => void;
  week: string | null;
  setWeek: (v: string) => void;
  teamFilter: TeamFilter;
  setTeamFilter: (v: TeamFilter) => void;
  weekOptions: string[];
  setFiltersOpen: (v: boolean) => void;
}) {
  return (
    <div className='flex flex-wrap items-center gap-2'>
      {/* Season */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='h-9 rounded-full px-3'>
            {season} <ChevronDown className='ms-2 h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          sideOffset={6}
          className='z-50 min-w-40'
        >
          <DropdownMenuLabel>Season</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {['Fall 2025'].map((s) => (
            <DropdownMenuItem key={s} onClick={() => setSeason(s)}>
              {s}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Week */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='h-9 rounded-full px-3'>
            {week ?? 'Week'} <ChevronDown className='ms-2 h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          sideOffset={6}
          className='z-50 min-w-40 max-h-[60vh] overflow-auto'
        >
          <DropdownMenuLabel>Week</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {weekOptions.map((w) => (
            <DropdownMenuItem key={w} onClick={() => setWeek(w)}>
              {w}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Teams */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='h-9 rounded-full px-3'>
            {teamFilter} <ChevronDown className='ms-2 h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='start'
          sideOffset={6}
          className='z-50 min-w-40'
        >
          <DropdownMenuLabel>Teams</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(['All Teams', 'B&G 2017', 'B&G 2015', 'Soricha 2014'] as const).map(
            (t) => (
              <DropdownMenuItem key={t} onClick={() => setTeamFilter(t)}>
                {t}
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant='outline'
        className='h-9 rounded-full px-3'
        onClick={() => setFiltersOpen(true)}
      >
        <Filter className='h-4 w-4 me-2' /> Filters
      </Button>
    </div>
  );
}
