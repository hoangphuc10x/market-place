import { notFound } from 'next/navigation';
import Link from 'next/link';
import { isReservedSlug, SLUG_PATTERN } from '@threadly/types/slugs';
import { fetchStoreBySlug, fetchStoreProducts } from '@/lib/api/stores';
import { formatMoney } from '@threadly/themes';

interface Params {
  storeSlug: string;
  productSlug: string;
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { storeSlug, productSlug } = await params;
  if (!SLUG_PATTERN.test(storeSlug) || isReservedSlug(storeSlug)) notFound();

  const store = await fetchStoreBySlug(storeSlug);
  if (!store) notFound();

  const products = await fetchStoreProducts(storeSlug);
  const product = products.find((p) => p.slug === productSlug);
  if (!product) notFound();

  return (
    <div className="bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <Link
          href={`/${storeSlug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← {store.name}
        </Link>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <div className="space-y-3">
            {product.images.map((img) => (
              <div key={img.url} className="aspect-[4/5] overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt ?? product.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="md:sticky md:top-16 md:self-start">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{product.title}</h1>
            <p className="mt-3 text-2xl">
              {formatMoney(product.priceFrom.amount, product.priceFrom.currency)}
            </p>
            <p className="mt-6 whitespace-pre-line text-muted-foreground">{product.description}</p>

            <VariantPicker product={product} />

            <button className="mt-6 h-12 w-full rounded-full bg-foreground text-sm font-medium text-background hover:opacity-90">
              Add to cart
            </button>

            {(product.details.material || product.details.careInstructions) && (
              <dl className="mt-10 space-y-3 border-t border-border pt-6 text-sm">
                {product.details.material && (
                  <DetailRow label="Material" value={product.details.material} />
                )}
                {product.details.careInstructions && (
                  <DetailRow label="Care" value={product.details.careInstructions} />
                )}
                {product.details.origin && (
                  <DetailRow label="Made in" value={product.details.origin} />
                )}
              </dl>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <dt className="w-28 text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function VariantPicker({
  product,
}: {
  product: {
    variants: { id: string; attributes: { size: string | null; color: string | null } }[];
  };
}) {
  const sizes = Array.from(
    new Set(product.variants.map((v) => v.attributes.size).filter((s): s is string => !!s)),
  );
  if (!sizes.length) return null;
  return (
    <div className="mt-8">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Size</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            type="button"
            className="h-10 min-w-12 rounded-md border border-border px-3 text-sm hover:border-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
