import Link from 'next/link';
import { Flag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/buttons/Button';

export default function NotFound() {
  return (
    <main className='flex flex-col items-center justify-center min-h-[75vh] p-6 text-center animate-stagger-fade'>
      <div className='relative flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-status-warning/10 text-status-warning shadow-md'>
        <Flag
          size={48}
          strokeWidth={2.5}
          className='relative z-10 -rotate-12'
        />
        <div className='absolute inset-0 border-4 border-dashed border-status-warning/30 rounded-full opacity-50' />
      </div>

      <h1 className='text-4xl font-black tracking-tight text-brand-navy mb-2 uppercase italic'>
        Offside!
      </h1>

      <p className='text-surface-muted font-medium mb-8 max-w-sm mx-auto leading-snug'>
        The linesman has their flag up. Looks like the page you are searching
        for strayed a little too far past the last defender.
      </p>

      <Link href='/' passHref>
        <Button className='py-2.5 px-8 shadow-lg group'>
          <ArrowLeft
            size={18}
            className='mr-2 transition-transform duration-200 group-hover:-translate-x-1'
          />
          Jog back to the schedule
        </Button>
      </Link>
    </main>
  );
}
