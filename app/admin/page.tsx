import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold'>Admin</h1>

      <div className='grid gap-3 sm:grid-cols-3'>
        <Link
          className='rounded-xl border p-4 hover:bg-muted/40'
          href='/admin/events'
        >
          Events
        </Link>
        <Link
          className='rounded-xl border p-4 hover:bg-muted/40'
          href='/admin/teams'
        >
          Teams
        </Link>
        <Link
          className='rounded-xl border p-4 hover:bg-muted/40'
          href='/admin/locations'
        >
          Locations
        </Link>
      </div>
    </div>
  );
}
