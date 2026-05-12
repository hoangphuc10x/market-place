import type { Product, SectionId } from '@threadly/types';
import {
  formatMoney,
  hexToHslString,
  type PickerPreviewProps,
  type StorefrontProps,
  type ThemeRenderer,
} from '../types';

const SUPPORTED: Set<SectionId> = new Set([
  'hero',
  'featured-products',
  'collections',
  'about',
  'instagram',
  'newsletter',
  'all-products',
]);

function Hero({ store }: { store: StorefrontProps['store'] }) {
  const { theme, name } = store;
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--primary) / 0.25) 100%)`,
      }}
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-6 py-20 md:grid-cols-5 md:py-28">
        <div className="md:col-span-3 flex flex-col justify-center">
          <p className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>
            ✿ welcome ✿
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            <span className="block">{name}</span>
            <span className="mt-2 block text-2xl font-normal text-neutral-600 md:text-3xl">
              {theme.tagline ?? 'made with love'}
            </span>
          </h1>
          <a
            href="#all-products"
            className="mt-10 inline-block self-start rounded-full px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            Browse the shop ♡
          </a>
        </div>
        <div className="md:col-span-2">
          {theme.coverImageUrl ? (
            <div className="aspect-square overflow-hidden rounded-[2rem] border-4 border-white shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={theme.coverImageUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          ) : (
            <div className="aspect-square rounded-[2rem] border-4 border-white bg-white/60 shadow-xl" />
          )}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, storeSlug }: { product: Product; storeSlug: string }) {
  const primary = product.images[0];
  return (
    <a
      href={`/${storeSlug}/p/${product.slug}`}
      className="group block overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden bg-neutral-50">
        {primary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.url}
            alt={primary.alt ?? product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="text-base font-semibold">{product.title}</h3>
        <p className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>
          {formatMoney(product.priceFrom.amount, product.priceFrom.currency)}
        </p>
      </div>
    </a>
  );
}

function FeaturedProducts({ products, storeSlug }: { products: Product[]; storeSlug: string }) {
  const featured = products.slice(0, 6);
  if (!featured.length) return null;
  return (
    <section className="py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-10 text-center">
          <p className="text-sm" style={{ color: 'hsl(var(--primary))' }}>
            ♡ featured ♡
          </p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight">Picked for you</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function About({ store }: { store: StorefrontProps['store'] }) {
  if (!store.bio) return null;
  return (
    <section className="py-20" style={{ backgroundColor: 'hsl(var(--primary) / 0.08)' }}>
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="text-sm" style={{ color: 'hsl(var(--primary))' }}>
          ✿ our story ✿
        </p>
        <p className="mt-6 text-2xl leading-relaxed">{store.bio}</p>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight">stay in the loop ♡</h2>
        <p className="mt-3 text-neutral-600">
          New drops, behind-the-scenes, and little surprises in your inbox.
        </p>
        <form className="mt-8 flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm shadow-sm focus:outline-none focus:ring-2"
            style={{ ['--tw-ring-color' as string]: 'hsl(var(--primary))' }}
          />
          <button
            type="submit"
            className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: 'hsl(var(--primary))' }}
          >
            Join
          </button>
        </form>
      </div>
    </section>
  );
}

function AllProducts({ products, storeSlug }: { products: Product[]; storeSlug: string }) {
  if (!products.length) return null;
  return (
    <section id="all-products" className="py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mb-10 text-center text-4xl font-bold tracking-tight">everything ♡</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Storefront({ store, products }: StorefrontProps) {
  const sections = store.theme.sections;
  return (
    <div className="font-sans text-neutral-800 antialiased" style={{ backgroundColor: 'hsl(var(--background))' }}>
      {sections.includes('hero') && <Hero store={store} />}
      {sections.includes('featured-products') && (
        <FeaturedProducts products={products} storeSlug={store.slug} />
      )}
      {sections.includes('about') && <About store={store} />}
      {sections.includes('newsletter') && <Newsletter />}
      {sections.includes('all-products') && (
        <AllProducts products={products} storeSlug={store.slug} />
      )}
      <footer className="py-12 text-center" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)' }}>
        <p className="text-sm">
          {store.name} ♡ made on Threadly
        </p>
      </footer>
    </div>
  );
}

function PickerPreview({ store }: PickerPreviewProps) {
  return (
    <div
      className="flex h-full flex-col p-6 font-sans"
      style={{ background: `linear-gradient(135deg, #fff 0%, hsl(var(--primary) / 0.3) 100%)` }}
    >
      <p className="text-[11px] font-medium" style={{ color: 'hsl(var(--primary))' }}>
        ✿ pastel ✿
      </p>
      <h3 className="mt-2 text-xl font-bold">{store.name}</h3>
      <div className="mt-3 aspect-[4/3] flex-1 rounded-2xl border-4 border-white bg-white/40 shadow-md" />
      <p className="mt-3 text-[10px] uppercase tracking-wider text-neutral-500">
        Soft · Cute
      </p>
    </div>
  );
}

export const pastel: ThemeRenderer = {
  Storefront,
  PickerPreview,
  supportedSections: SUPPORTED,
  cssVars: (config) => ({
    '--primary': hexToHslString(config.primaryColor),
    '--primary-foreground': '0 0% 100%',
    '--background': '350 60% 99%',
    '--foreground': '340 15% 18%',
    '--muted': '350 30% 96%',
    '--muted-foreground': '340 10% 40%',
    '--border': '340 30% 92%',
    '--radius': '1rem',
    '--font-sans': '"Quicksand", "Nunito", system-ui, sans-serif',
  }),
};
