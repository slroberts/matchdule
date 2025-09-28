import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import * as React from 'react';

type FilterSheetProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onApply?: () => void;
  onClear?: () => void;
};

export default function FilterSheet({
  open,
  onOpenChange,
  onApply,
  onClear,
}: FilterSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-[360px] sm:w-[380px] p-0'>
        <div className='flex h-full flex-col'>
          {/* Header */}
          <div className='border-b'>
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
          </div>

          {/* Body (scrolls) */}
          <div className='flex-1 overflow-auto px-5 py-4'>
            <Tabs defaultValue='ha'>
              <TabsList className='grid grid-cols-3'>
                <TabsTrigger value='ha'>Home/Away</TabsTrigger>
                <TabsTrigger value='result'>Result</TabsTrigger>
                <TabsTrigger value='time'>Time</TabsTrigger>
              </TabsList>

              <TabsContent value='ha' className='pt-3 space-x-2'>
                <Badge className='me-2 rounded-full' variant='secondary'>
                  Home
                </Badge>
                <Badge className='me-2 rounded-full' variant='secondary'>
                  Away
                </Badge>
                <Badge className='rounded-full' variant='secondary'>
                  TBD
                </Badge>
              </TabsContent>

              <TabsContent value='result' className='pt-3 space-x-2'>
                <Badge variant='secondary' className='rounded-full'>
                  W
                </Badge>
                <Badge variant='secondary' className='rounded-full'>
                  L
                </Badge>
                <Badge variant='secondary' className='rounded-full'>
                  D
                </Badge>
              </TabsContent>

              <TabsContent
                value='time'
                className='pt-3 text-sm text-muted-foreground'
              >
                Morning • Afternoon • Evening
              </TabsContent>
            </Tabs>
          </div>

          {/* Sticky footer */}
          <div className='border-t px-5 py-3 flex items-center justify-between'>
            <Button
              variant='ghost'
              onClick={() => {
                onClear?.();
              }}
            >
              Clear
            </Button>
            <div className='space-x-2'>
              <Button variant='ghost' onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onApply?.();
                  onOpenChange(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
