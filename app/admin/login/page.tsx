import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { adminConfigured, isAdmin } from '@/lib/admin/auth';
import { LogoMark } from '@/components/layout/logo';
import { LoginForm } from '@/components/admin/login-form';

export const metadata: Metadata = { title: 'Giriş' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await isAdmin()) redirect('/admin');
  const { next } = await searchParams;
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="a-card w-full max-w-sm p-6 shadow-md">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-8 text-primary" />
          <h1 className="text-lg font-bold">İdarəetmə paneli</h1>
        </div>
        {adminConfigured() ? (
          <LoginForm next={next ?? ''} />
        ) : (
          <p className="mt-4 rounded-xl bg-warning-soft p-3 text-sm text-warning">
            Giriş bağlıdır: <code className="font-mono">.env.local</code> faylında <code className="font-mono">ADMIN_PASSWORD</code> təyin edin və serveri yenidən başladın.
          </p>
        )}
      </div>
    </main>
  );
}
