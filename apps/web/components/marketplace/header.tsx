import Link from 'next/link';
import { Search, ShoppingBag } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { User } from '@threadly/types';
import { LanguageSwitcher } from './language-switcher';
import { UserMenu } from './user-menu';

interface HeaderProps {
  viewer: User | null;
  myShopSlug: string | null;
  myShopName: string | null;
}

export async function MarketplaceHeader({ viewer, myShopSlug, myShopName }: HeaderProps) {
  const t = await getTranslations('header');
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          threadly
        </Link>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/discover" className="hover:text-foreground">
            {t('discover')}
          </Link>
          <Link href="/search" className="hover:text-foreground">
            {t('search')}
          </Link>
          <Link href="/discover?cat=new" className="hover:text-foreground">
            {t('new')}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <Link
            href="/search"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted md:inline-flex"
            aria-label={t('search')}
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
          </Link>
          {viewer ? (
            <div className="ml-2">
              <UserMenu viewer={viewer} myShopSlug={myShopSlug} myShopName={myShopName} />
            </div>
          ) : (
            <>
              <Link href="/login" className="ml-2 hidden text-sm font-medium md:inline-flex">
                {t('signIn')}
              </Link>
              <Link
                href="/seller/onboarding"
                className="ml-2 inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
              >
                {t('openShop')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
