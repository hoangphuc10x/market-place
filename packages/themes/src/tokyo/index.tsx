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
  'instagram',
  'all-products',
]);

function Hero({ store }: { store: StorefrontProps['store'] }) {
  const { theme, name } = store;
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      {theme.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={theme.coverImageUrl}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70"
        />
      ) : (
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #000 100%)' }}
        />
      )}
      <div className="mx-auto max-w-[1400px] px-6 py-32 md:py-44">
        <p
          className="font-mono text-xs uppercase tracking-[0.3em]"
          style={{ color: 'hsl(var(--primary))' }}
        >
          ── Issue 01
        </p>
        <h1 className="mt-8 text-[clamp(3rem,10vw,9rem)] font-black uppercase leading-[0.85] tracking-tight">
          {name}
        </h1>
        {theme.tagline && <p className="mt-8 max-w-xl text-xl font-medium">{theme.tagline}</p>}
        <a
          href="#all-products"
          className="mt-12 inline-block border-2 border-white px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-black"
        >
          Shop the Drop →
        </a>
      </div>
    </section>
  );
}

function FeatureCard({
  product,
  storeSlug,
  large = false,
}: {
  product: Product;
  storeSlug: string;
  large?: boolean;
}) {
  const primary = product.images[0];
  return (
    <a
      href={`/${storeSlug}/p/${product.slug}`}
      className="group relative block overflow-hidden bg-neutral-100"
    >
      <div className={clsx(large ? 'aspect-[3/4]' : 'aspect-square')}>
        {primary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.url}
            alt={primary.alt ?? product.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white">
        <h3 className="text-lg font-bold uppercase tracking-wide">{product.title}</h3>
        <p className="mt-1 font-mono text-xs">
          {formatMoney(product.priceFrom.amount, product.priceFrom.currency)}
        </p>
      </div>
    </a>
  );
}

function FeaturedProducts({ products, storeSlug }: { products: Product[]; storeSlug: string }) {
  const featured = products.slice(0, 5);
  if (!featured.length) return null;
  const [hero, ...rest] = featured;
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-4xl font-black uppercase tracking-tight md:text-6xl">
            Featured /<span style={{ color: 'hsl(var(--primary))' }}>{` ${featured.length}`}</span>
          </h2>
          <a
            href="#all-products"
            className="font-mono text-xs uppercase tracking-[0.2em] hover:opacity-60"
          >
            All →
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {hero && (
            <div className="col-span-2 row-span-2">
              <FeatureCard product={hero} storeSlug={storeSlug} large />
            </div>
          )}
          {rest.map((p) => (
            <FeatureCard key={p.id} product={p} storeSlug={storeSlug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Lookbook({ products }: { products: Product[] }) {
  const shots = products.flatMap((p) => p.images).slice(0, 8);
  if (shots.length < 2) return null;
  return (
    <section className="bg-black py-20 text-white">
      <div className="mx-auto max-w-[1400px] px-6">
        <h2 className="mb-10 text-4xl font-black uppercase tracking-tight md:text-6xl">
          / Lookbook
        </h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {shots.map((img) => (
            <div key={img.url} className="aspect-[3/4] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all"
                loading="lazy"
              />
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
    <section className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-6">
        <p
          className="font-mono text-xs uppercase tracking-[0.3em]"
          style={{ color: 'hsl(var(--primary))' }}
        >
          // The Brand
        </p>
        <p className="mt-6 text-2xl font-medium leading-snug md:text-3xl">{store.bio}</p>
      </div>
    </section>
  );
}

function AllProducts({ products, storeSlug }: { products: Product[]; storeSlug: string }) {
  if (!products.length) return null;
  return (
    <section id="all-products" className="bg-white py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <h2 className="mb-10 text-4xl font-black uppercase tracking-tight md:text-6xl">
          / All Items
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {products.map((p) => (
            <FeatureCard key={p.id} product={p} storeSlug={storeSlug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Storefront({ store, products }: StorefrontProps) {
  const sections = store.theme.sections;
  return (
    <div className="bg-white font-sans text-black antialiased">
      {sections.includes('hero') && <Hero store={store} />}
      {sections.includes('featured-products') && (
        <FeaturedProducts products={products} storeSlug={store.slug} />
      )}
      {sections.includes('lookbook') && <Lookbook products={products} />}
      {sections.includes('about') && <About store={store} />}
      {sections.includes('all-products') && (
        <AllProducts products={products} storeSlug={store.slug} />
      )}
      <footer className="bg-black py-12 text-center text-white">
        <p className="font-mono text-xs uppercase tracking-[0.3em]">© {store.name} · Threadly</p>
      </footer>
    </div>
  );
}

function PickerPreview({ store }: PickerPreviewProps) {
  return (
    <div className="flex h-full flex-col bg-black p-4 text-white">
      <p
        className="font-mono text-[9px] uppercase tracking-[0.3em]"
        style={{ color: 'hsl(var(--primary))' }}
      >
        ── Issue 01
      </p>
      <h3 className="mt-2 text-2xl font-black uppercase leading-[0.9] tracking-tight">
        {store.name}
      </h3>
      {/* asymmetric magazine grid — hero block uses primary color */}
      <div className="mt-3 grid flex-1 grid-cols-3 grid-rows-3 gap-1">
        <div
          className="col-span-2 row-span-2"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, #1a1a1a 100%)',
          }}
        />
        <div className="bg-neutral-900" />
        <div className="bg-neutral-800" />
        <div className="col-span-2 bg-neutral-900" />
        <div className="bg-white/10" style={{ borderTop: '2px solid hsl(var(--primary))' }} />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span
          className="border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.2em]"
          style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }}
        >
          Shop →
        </span>
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-neutral-400">
          /{store.slug || 'shop'}
        </span>
      </div>
    </div>
  );
}

export const tokyo: ThemeRenderer = {
  Storefront,
  PickerPreview,
  supportedSections: SUPPORTED,
  cssVars: (config) => ({
    '--primary': hexToHslString(config.primaryColor),
    '--primary-foreground': '0 0% 100%',
    '--background': '0 0% 100%',
    '--foreground': '0 0% 0%',
    '--muted': '0 0% 96%',
    '--muted-foreground': '0 0% 30%',
    '--border': '0 0% 88%',
    '--radius': '0px',
    '--font-sans': '"Inter", "Helvetica Neue", system-ui, sans-serif',
  }),
};
