'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

type Profile = { role: string } | null;

export default function AccountPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase.auth.getUser();
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      router.replace('/login');
      return;
    }

    setEmail(user.email ?? null);
    setUid(user.id);

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (pErr) setErr(pErr.message);
    setRole((profile as Profile)?.role ?? null);

    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  useEffect(() => {
    load();

    // Keep it updated if auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className='mx-auto max-w-xl p-6'>
        <div className='rounded-xl border p-5'>Loading account…</div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-xl p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold'>Account</h1>
        <button
          onClick={signOut}
          className='rounded-md border px-3 py-2 text-sm'
        >
          Sign out
        </button>
      </div>

      <div className='mt-4 rounded-xl border p-5 space-y-3'>
        <Row label='Email' value={email ?? '—'} />
        <Row label='UID' value={uid ?? '—'} mono />
        <Row label='Role' value={role ?? '—'} />

        {uid && (
          <div className='pt-2'>
            <p className='text-sm opacity-80'>
              Copy this UID into Supabase SQL to make yourself admin:
            </p>
            <pre className='mt-2 overflow-x-auto rounded-lg border p-3 text-xs'>
              {`update public.profiles
set role = 'admin'
where id = '${uid}';`}
            </pre>
          </div>
        )}

        {err && (
          <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm'>
            {err}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className='flex items-start justify-between gap-4'>
      <div className='text-sm opacity-70'>{label}</div>
      <div className={mono ? 'text-sm font-mono' : 'text-sm'}>{value}</div>
    </div>
  );
}
