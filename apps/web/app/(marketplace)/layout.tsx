import { MarketplaceHeader } from '@/components/marketplace/header';
import { MarketplaceFooter } from '@/components/marketplace/footer';
import { getViewer } from '@/lib/session';
import { fetchMyStore } from '@/lib/api/seller';

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  // Only fetch shop info for authed users; anonymous viewers don't need it.
  const myStore = viewer ? await fetchMyStore().catch(() => null) : null;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketplaceHeader
        viewer={viewer}
        myShopSlug={myStore?.slug ?? null}
        myShopName={myStore?.name ?? null}
      />
      <main className="flex-1">{children}</main>
      <MarketplaceFooter />
    </div>
  );
}
