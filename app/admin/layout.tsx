import { requireAdmin } from '@/lib/auth/requireAdmin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <div className='mx-auto max-w-5xl p-4'>{children}</div>;
}
