import Link from 'next/link';
import { Flag } from 'lucide-react';
import { buttonClasses } from '@/components/ui/buttons/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';

/**
 * 404 — Figma: Screens › 05 · System & empty states › System / Not found
 * The empty state IS the page, so its title is the h1.
 * The CTA is a real link styled as a button — never <Link><Button/></Link>.
 */
export default function NotFound() {
  return (
    <main className='flex min-h-[75vh] items-center'>
      <EmptyState
        as='h1'
        icon={Flag}
        title='Offside!'
        body='This page doesn’t exist. The link may be old or mistyped.'
        action={
          <Link href='/' className={buttonClasses()}>
            Back to schedule
          </Link>
        }
      />
    </main>
  );
}
