import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Daypart, Filters, HomeAway, Result } from '@/types/schedule';
import { useState } from 'react';

type FilterSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApply?: (filters: Filters) => void;
  onClear?: () => void;
};

const RESULT_LABELS: Record<'W' | 'L' | 'D', string> = {
  W: 'Win',
  L: 'Loss',
  D: 'Draw',
};

const HOMEAWAY_LABELS: Record<'HOME' | 'AWAY' | 'TBD', string> = {
  HOME: 'Home',
  AWAY: 'Away',
  TBD: 'TBD',
};

export default function FilterSheet({
  open,
  onOpenChange,
  onApply,
  onClear,
}: FilterSheetProps) {
  // selection state
  const [ha, setHA] = useState<Set<HomeAway>>(new Set());
  const [res, setRes] = useState<Set<Result>>(new Set());
  const [parts, setParts] = useState<Set<Daypart>>(new Set());

  // helpers
  const toggle = <T,>(
    set: React.Dispatch<React.SetStateAction<Set<T>>>,
    v: T
  ) =>
    set((prev) => {
      const next = new Set(prev);
      if (next.has(v)) {
        next.delete(v);
      } else {
        next.add(v);
      }
      return next;
    });

  const isSelected = <T,>(set: Set<T>, v: T) => set.has(v);

  // filter functions
  const filterHomeAway = (v: HomeAway) => toggle(setHA, v);
  const filterResults = (v: Result) => toggle(setRes, v);
  const filterTime = (v: Daypart) => toggle(setParts, v);

  const clearAll = () => {
    setHA(new Set());
    setRes(new Set());
    setParts(new Set());
    onClear?.();
  };

  const applyAll = () => {
    onApply?.({
      homeAway: Array.from(ha),
      result: Array.from(res),
      dayparts: Array.from(parts),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-[360px] sm:w-[380px] p-0'>
        <div className='flex h-full flex-col'>
          <div className='border-b'>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription className='sr-only'>
                Choose options to narrow the games shown.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className='flex-1 overflow-auto px-5 py-4'>
            <Tabs defaultValue='ha'>
              <TabsList className='grid grid-cols-3'>
                <TabsTrigger value='ha'>Home/Away</TabsTrigger>
                <TabsTrigger value='result'>Result</TabsTrigger>
                <TabsTrigger value='time'>Time</TabsTrigger>
              </TabsList>

              <TabsContent value='ha' className='pt-3'>
                <ul className='space-y-2'>
                  {(['HOME', 'AWAY', 'TBD'] as const).map((v) => (
                    <li key={v} className='flex items-center gap-2'>
                      <Badge
                        role='button'
                        aria-label={HOMEAWAY_LABELS[v]}
                        aria-pressed={isSelected(ha, v)}
                        onClick={() => filterHomeAway(v)}
                        className='rounded-full cursor-pointer px-3 py-1 text-sm'
                        variant={isSelected(ha, v) ? 'default' : 'secondary'}
                        title={HOMEAWAY_LABELS[v]}
                      >
                        {HOMEAWAY_LABELS[v]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value='result' className='pt-3'>
                <ul className='space-y-2'>
                  {(['W', 'L', 'D'] as const).map((v) => (
                    <li key={v} className='flex items-center gap-2'>
                      <Badge
                        role='button'
                        aria-label={RESULT_LABELS[v]}
                        aria-pressed={isSelected(res, v)}
                        onClick={() => filterResults(v)}
                        className='rounded-full cursor-pointer px-3 py-1 text-sm'
                        variant={isSelected(res, v) ? 'default' : 'secondary'}
                        title={RESULT_LABELS[v]}
                      >
                        {RESULT_LABELS[v]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value='time' className='pt-3'>
                <ul className='space-y-2'>
                  {(['morning', 'afternoon', 'evening'] as const).map((v) => (
                    <li key={v} className='flex items-center gap-2'>
                      <Badge
                        role='button'
                        aria-pressed={isSelected(parts, v)}
                        onClick={() => filterTime(v)}
                        className='rounded-full cursor-pointer capitalize px-3 py-1 text-sm'
                        variant={isSelected(parts, v) ? 'default' : 'secondary'}
                      >
                        {v}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </div>

          <div className='border-t px-5 py-3 flex items-center justify-between'>
            <Button variant='ghost' onClick={clearAll}>
              Clear
            </Button>
            <div className='space-x-2'>
              <Button variant='ghost' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={applyAll}>Apply</Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
