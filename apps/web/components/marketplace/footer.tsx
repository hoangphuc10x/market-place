import Link from 'next/link';

export function MarketplaceFooter() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-12 text-sm md:grid-cols-4">
        <div>
          <p className="text-base font-semibold tracking-tight">threadly</p>
          <p className="mt-2 text-muted-foreground">
            A marketplace where every shop is its own storefront.
          </p>
        </div>
        <FooterColumn title="Discover">
          <FooterLink href="/discover">Browse shops</FooterLink>
          <FooterLink href="/search">Search</FooterLink>
        </FooterColumn>
        <FooterColumn title="Sell">
          <FooterLink href="/seller/onboarding">Open a shop</FooterLink>
          <FooterLink href="/seller">Seller dashboard</FooterLink>
        </FooterColumn>
        <FooterColumn title="Platform">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/help">Help</FooterLink>
          <FooterLink href="/terms">Terms</FooterLink>
        </FooterColumn>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-muted-foreground hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}
