import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function MarketplaceFooter() {
  const t = await getTranslations('footer');
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-6 py-12 text-sm md:grid-cols-4">
        <div>
          <p className="text-base font-semibold tracking-tight">threadly</p>
          <p className="mt-2 text-muted-foreground">{t('tagline')}</p>
        </div>
        <FooterColumn title={t('sections.discover')}>
          <FooterLink href="/discover">{t('links.browseShops')}</FooterLink>
          <FooterLink href="/search">{t('links.search')}</FooterLink>
        </FooterColumn>
        <FooterColumn title={t('sections.sell')}>
          <FooterLink href="/seller/onboarding">{t('links.openShop')}</FooterLink>
          <FooterLink href="/seller">{t('links.sellerDashboard')}</FooterLink>
        </FooterColumn>
        <FooterColumn title={t('sections.platform')}>
          <FooterLink href="/about">{t('links.about')}</FooterLink>
          <FooterLink href="/help">{t('links.help')}</FooterLink>
          <FooterLink href="/terms">{t('links.terms')}</FooterLink>
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
