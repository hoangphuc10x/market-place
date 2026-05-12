import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getViewer } from '@/lib/session';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) redirect('/signup?returnTo=/seller/onboarding');
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            threadly
          </Link>
          <span className="text-sm text-muted-foreground">{viewer.email}</span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
