'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PackagePlus, X } from 'lucide-react';

/**
 * One-time celebratory banner shown to a shop owner right after creation
 * (?welcome=1). Nudges them to add their first product. Dismissing it also
 * strips the welcome flag from the URL so a refresh won't bring it back.
 */
export function WelcomeBanner({ storeName }: { storeName: string }) {
  const t = useTranslations('storefront.welcomeBanner');
  const router = useRouter();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-foreground text-background">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{t('title', { name: storeName })}</p>
          <p className="truncate text-xs text-background/70">{t('subtitle')}</p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-background px-4 text-sm font-medium text-foreground hover:opacity-90"
        >
          <PackagePlus className="h-4 w-4" />
          {t('cta')}
        </Link>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('dismiss')}
          className="shrink-0 rounded-full p-1.5 text-background/70 hover:bg-background/10 hover:text-background"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
