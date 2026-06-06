import { redirect } from 'next/navigation';
import { MarketplaceHeader } from '@/components/marketplace/header';
import { getViewer } from '@/lib/session';
import { fetchMyStore } from '@/lib/api/seller';

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();
  if (!viewer) redirect('/signup?returnTo=/seller/onboarding');

  // Same fetch the marketplace layout does — lets the user menu render the
  // seller's shop links instead of "open shop". Cost is one extra API hit
  // per seller-area page; cheap and avoids prop drilling.
  const myStore = await fetchMyStore().catch(() => null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketplaceHeader
        viewer={viewer}
        myShopSlug={myStore?.slug ?? null}
        myShopName={myStore?.name ?? null}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
