import { MarketplaceHeader } from '@/components/marketplace/header';
import { MarketplaceFooter } from '@/components/marketplace/footer';
import { getViewer } from '@/lib/session';

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  return (
    <div className="flex min-h-screen flex-col">
      <MarketplaceHeader viewer={viewer} />
      <main className="flex-1">{children}</main>
      <MarketplaceFooter />
    </div>
  );
}
