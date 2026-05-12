import Link from 'next/link';
import { Search, ShoppingBag, User as UserIcon } from 'lucide-react';
import type { User } from '@threadly/types';

export function MarketplaceHeader({ viewer }: { viewer: User | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          threadly
        </Link>
        <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/discover" className="hover:text-foreground">
            Discover
          </Link>
          <Link href="/search" className="hover:text-foreground">
            Search
          </Link>
          <Link href="/discover?cat=new" className="hover:text-foreground">
            New
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/search"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted md:inline-flex"
            aria-label="Search"
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
            <Link
              href="/account"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-muted px-3 text-sm font-medium"
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden md:inline">{viewer.displayName}</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm font-medium md:inline-flex">
                Sign in
              </Link>
              <Link
                href="/seller/onboarding"
                className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90"
              >
                Open a shop
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
