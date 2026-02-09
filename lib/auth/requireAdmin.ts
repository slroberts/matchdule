import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await supabaseServer();

  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth?.user) redirect('/login');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .single();

  if (profileError || profile?.role !== 'admin') redirect('/');
}
