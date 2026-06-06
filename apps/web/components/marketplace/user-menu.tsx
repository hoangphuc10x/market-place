'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  ChevronDown,
  ExternalLink,
  LogOut,
  Settings,
  ShoppingBag,
  Store,
  UserIcon as ProfileIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { User } from '@threadly/types';
import { cn } from '@/lib/cn';
import { logoutAction } from '@/app/actions/auth';

interface UserMenuProps {
  viewer: User;
  /** If the viewer owns a store, slug + name are passed so the menu can deep-link. */
  myShopSlug: string | null;
  myShopName: string | null;
}

/**
 * Header dropdown shown when a viewer is logged in.
 * Click avatar/name → reveals: profile, shop view, shop dashboard, orders, logout.
 *
 * Sellers get extra rows (view storefront, dashboard, add product, settings).
 * Buyers see only profile + orders + logout.
 */
export function UserMenu({ viewer, myShopSlug, myShopName }: UserMenuProps) {
  const t = useTranslations('userMenu');
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const close = () => setOpen(false);
  const onLogout = () => {
    setOpen(false);
    startTransition(() => logoutAction());
  };

  const isSeller = !!myShopSlug;
  const initials = viewer.displayName.trim().slice(0, 1).toUpperCase() || 'U';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-full bg-muted pl-1 pr-3 text-sm font-medium transition hover:bg-muted/70',
          open && 'bg-muted/70',
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar viewer={viewer} initials={initials} size={28} />
        <span className="hidden max-w-[140px] truncate md:inline">{viewer.displayName}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={close}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-popover text-sm shadow-xl">
            {/* Header card */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Avatar viewer={viewer} initials={initials} size={40} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{viewer.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{viewer.email}</p>
              </div>
            </div>

            {/* Buyer section */}
            <Section>
              <Item href="/account" icon={<ProfileIcon className="h-4 w-4" />} onSelect={close}>
                {t('profile')}
              </Item>
              <Item
                href="/account/orders"
                icon={<ShoppingBag className="h-4 w-4" />}
                onSelect={close}
              >
                {t('orders')}
              </Item>
            </Section>

            {/* Seller section */}
            {isSeller ? (
              <Section title={myShopName ?? t('myShop')}>
                <Item
                  href={`/${myShopSlug}`}
                  icon={<ExternalLink className="h-4 w-4" />}
                  onSelect={close}
                >
                  {t('viewStorefront')}
                </Item>
                <Item href="/seller" icon={<Store className="h-4 w-4" />} onSelect={close}>
                  {t('sellerDashboard')}
                </Item>
                <Item
                  href="/seller/settings"
                  icon={<Settings className="h-4 w-4" />}
                  onSelect={close}
                >
                  {t('shopSettings')}
                </Item>
              </Section>
            ) : (
              <Section>
                <Item
                  href="/seller/onboarding"
                  icon={<Store className="h-4 w-4" />}
                  onSelect={close}
                >
                  {t('openShop')}
                </Item>
              </Section>
            )}

            {/* Logout */}
            <Section>
              <button
                type="button"
                onClick={onLogout}
                disabled={pending}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-destructive hover:bg-destructive/5 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                {pending ? '…' : t('logout')}
              </button>
            </Section>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pieces ────────────────────────────────────────────────────────────────

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border last:border-b-0 py-1">
      {title && (
        <p className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function Item({
  href,
  icon,
  children,
  onSelect,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-muted"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

function Avatar({ viewer, initials, size }: { viewer: User; initials: string; size: number }) {
  if (viewer.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={viewer.avatarUrl}
        alt=""
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-foreground text-background"
      style={{ width: size, height: size, fontSize: Math.floor(size * 0.45) }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
