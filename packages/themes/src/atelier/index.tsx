import { clsx } from 'clsx';
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
  'lookbook',
  'about',
  'reviews',
  'all-products',
]);

function Hero({ store }: { store: StorefrontProps['store'] }) {
  const { theme, name } = store;
  return (
    <section className="border-b border-neutral-200">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-6 py-24 md:grid-cols-2 md:py-32">
        <div className="flex flex-col justify-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
            Atelier · Est. {new Date(store.createdAt).getFullYear()}
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-tight tracking-tight md:text-7xl">
            {name}
          </h1>
          {theme.tagline && (
            <p className="mt-6 max-w-md text-lg text-neutral-600">{theme.tagline}</p>
          )}
          <div className="mt-10">
            <a
              href="#all-products"
              className="inline-block border-b border-neutral-900 pb-1 font-serif text-base tracking-wide hover:opacity-60"
            >
              Browse the collection ↓
            </a>
          </div>
        </div>
        {theme.coverImageUrl ? (
          <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        ) : (
          <div className="aspect-[4/5] bg-gradient-to-b from-neutral-100 to-neutral-200" />
        )}
      </div>
    </section>
  );
}

function ProductCard({ product, storeSlug }: { product: Product; storeSlug: string }) {
  const primary = product.images[0];
  return (
    <a href={`/${storeSlug}/p/${product.slug}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-neutral-100">
        {primary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.url}
            alt={primary.alt ?? product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-base">{product.title}</h3>
        <p className="font-mono text-xs text-neutral-600">
          {formatMoney(product.priceFrom.amount, product.priceFrom.currency)}
        </p>
      </div>
    </a>
  );
}

function FeaturedProducts({ products, storeSlug }: { products: Product[]; storeSlug: string }) {
  const featured = products.slice(0, 4);
  if (!featured.length) return null;
  return (
    <section className="border-b border-neutral-200 py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-12 flex items-baseline justify-between">
          <h2 className="font-serif text-3xl tracking-tight">Featured</h2>
          <a
            href="#all-products"
            className="font-mono text-xs uppercase tracking-[0.2em] hover:opacity-60"
          >
            See all →
          </a>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} storeSlug={storeSlug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Lookbook({ products }: { products: Product[] }) {
  const shots = products.flatMap((p) => p.images).slice(0, 6);
  if (shots.length < 2) return null;
  return (
    <section className="border-b border-neutral-200 py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mb-12 font-serif text-3xl tracking-tight">Lookbook</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {shots.map((img, i) => (
            <div
              key={img.url}
              className={clsx(
                'overflow-hidden bg-neutral-100',
                i % 5 === 0 ? 'aspect-[4/5] md:col-span-2 md:row-span-2' : 'aspect-[4/5]',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About({ store }: { store: StorefrontProps['store'] }) {
  if (!store.bio) return null;
  return (
    <section className="border-b border-neutral-200 py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">About</p>
        <p className="mt-6 font-serif text-2xl leading-relaxed">{store.bio}</p>
      </div>
    </section>
  );
}

function AllProducts({ products, storeSlug }: { products: Product[]; storeSlug: string }) {
  if (!products.length) return null;
  return (
    <section id="all-products" className="py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="mb-12 font-serif text-3xl tracking-tight">All Pieces</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
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
    <div className="bg-white font-sans text-neutral-900 antialiased">
      {sections.includes('hero') && <Hero store={store} />}
      {sections.includes('featured-products') && (
        <FeaturedProducts products={products} storeSlug={store.slug} />
      )}
      {sections.includes('lookbook') && <Lookbook products={products} />}
      {sections.includes('about') && <About store={store} />}
      {sections.includes('all-products') && (
        <AllProducts products={products} storeSlug={store.slug} />
      )}
      <footer className="border-t border-neutral-200 py-12 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">
          {store.name} · Powered by Threadly
        </p>
      </footer>
    </div>
  );
}

function PickerPreview({ store }: PickerPreviewProps) {
  return (
    <div className="flex h-full flex-col bg-white p-4 text-neutral-900">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-500">
          Atelier · Est.
        </p>
        <p className="font-mono text-[9px] text-neutral-400">··</p>
      </div>
      <h3 className="mt-3 font-serif text-2xl leading-tight tracking-tight">{store.name}</h3>
      <p className="mt-1 line-clamp-1 font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-500">
        {store.theme.tagline ?? 'Slow fashion'}
      </p>
      {/* mini product grid — 2x2 grayscale to convey minimal aesthetic */}
      <div className="mt-3 grid flex-1 grid-cols-2 gap-1.5">
        <div className="bg-gradient-to-br from-neutral-100 to-neutral-200" />
        <div className="bg-gradient-to-br from-neutral-200 to-neutral-300" />
        <div className="bg-gradient-to-br from-neutral-150 to-neutral-250 bg-neutral-200" />
        <div className="bg-gradient-to-br from-neutral-100 to-neutral-200" />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-2">
        <span className="font-serif text-[10px]">Browse →</span>
        <span className="font-mono text-[9px] text-neutral-400">/{store.slug || 'shop'}</span>
      </div>
    </div>
  );
}

export const atelier: ThemeRenderer = {
  Storefront,
  PickerPreview,
  supportedSections: SUPPORTED,
  cssVars: (config) => ({
    '--primary': hexToHslString(config.primaryColor),
    '--primary-foreground': '0 0% 100%',
    '--background': '0 0% 100%',
    '--foreground': '0 0% 8%',
    '--muted': '0 0% 96%',
    '--muted-foreground': '0 0% 40%',
    '--border': '0 0% 90%',
    '--radius': '0px',
    '--font-sans': 'ui-sans-serif, system-ui, sans-serif',
    '--font-serif': '"Cormorant Garamond", "Times New Roman", serif',
  }),
};
