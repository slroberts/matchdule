'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

function parseHashParams() {
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(raw);
}

export default function ConfirmPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [msg, setMsg] = useState('Signing you in…');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // If already signed in, just go to admin
      const existing = await supabase.auth.getSession();
      if (existing.data.session) {
        router.replace('/admin');
        router.refresh();
        return;
      }

      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        router.replace(`/auth/callback?code=${encodeURIComponent(code)}`);
        return;
      }

      const params = parseHashParams();
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      const error = params.get('error');
      const error_description = params.get('error_description');

      if (error || error_description) {
        setMsg(
          `Login failed: ${error_description ?? error ?? 'Unknown error'}`,
        );
        return;
      }

      if (!access_token || !refresh_token) {
        setMsg('No session tokens found. Try logging in again.');
        return;
      }

      const { error: setErr } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (cancelled) return;

      if (setErr) {
        setMsg(`Login failed: ${setErr.message}`);
        return;
      }

      // Clean the URL (remove token hash)
      window.history.replaceState({}, document.title, '/confirm');

      router.replace('/admin');
      router.refresh();
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <div className='mx-auto max-w-md p-6'>
      <div className='rounded-xl border p-5'>
        <p className='text-sm opacity-80'>{msg}</p>
      </div>
    </div>
  );
}
