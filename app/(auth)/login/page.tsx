'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    });

    setLoading(false);

    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div className='mx-auto max-w-sm p-6'>
      <h1 className='text-xl font-semibold'>Log in</h1>
      <p className='mt-1 text-sm opacity-80'>We’ll email you a magic link.</p>

      <form onSubmit={sendMagicLink} className='mt-6 space-y-3'>
        <input
          className='w-full rounded-md border px-3 py-2'
          type='email'
          placeholder='you@email.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          className='w-full rounded-md border px-3 py-2'
          type='submit'
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Send magic link'}
        </button>

        {sent && (
          <p className='text-sm'>Check your email for the login link.</p>
        )}

        {err && <p className='text-sm text-red-600'>{err}</p>}
      </form>
    </div>
  );
}
