import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { PublicStore } from '@threadly/types';
import { fetchActiveStores } from '@/lib/api/stores';
import { Marquee } from '@/components/motion/marquee';
import { FadeIn } from '@/components/motion/fade-in';

export async function FeaturedShops() {
  const stores = await fetchActiveStores(20).catch(() => [] as PublicStore[]);
  if (stores.length === 0) return null;

  const t = await getTranslations('header');
  return (
    <section className="border-b border-border/60 py-16">
      <div className="mx-auto max-w-[1400px]">
        <FadeIn direction="up">
          <div className="mb-8 flex items-baseline justify-between px-6">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Shops on Threadly</h2>
            <Link href="/discover" className="text-sm text-muted-foreground hover:text-foreground">
              {t('discover')} →
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <Marquee speed={45}>
            {stores.map((store) => (
              <ShopCard key={store.id} store={store} />
            ))}
          </Marquee>
        </FadeIn>
      </div>
    </section>
  );
}

function ShopCard({ store }: { store: PublicStore }) {
  return (
    <Link
      href={`/${store.slug}`}
      className="group block w-[260px] shrink-0 overflow-hidden rounded-xl border border-border bg-background transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {store.theme.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.theme.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(135deg, ${store.theme.primaryColor}, hsl(var(--muted)))`,
            }}
          />
        )}
      </div>
      <div className="space-y-1 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-base font-semibold">{store.name}</h3>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            /{store.slug}
          </span>
        </div>
        {store.theme.tagline && (
          <p className="line-clamp-1 text-sm text-muted-foreground">{store.theme.tagline}</p>
        )}
        <p className="pt-1 text-xs text-muted-foreground">
          {store.productCount} {store.productCount === 1 ? 'piece' : 'pieces'}
          {store.followerCount > 0 && ` · ${store.followerCount} followers`}
        </p>
      </div>
    </Link>
  );
}
