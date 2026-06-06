'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Trash2, Plus } from 'lucide-react';
import type {
  CreateProductInput,
  Product,
  ProductStatus,
  UpdateProductInput,
} from '@threadly/types';
import { cn } from '@/lib/cn';
import { ImageUploader } from '@/components/forms/image-uploader';
import { createProductAction, updateProductAction } from './actions';

/** Tiny red star used to mark required fields. */
const Req = () => (
  <span aria-hidden className="ml-0.5 text-destructive">
    *
  </span>
);

/**
 * Reusable product form. `initial` is undefined for create, populated for edit.
 *
 * Returns the variants as a flat list — each (size, color) combo is one row.
 * For now the seller types prices in VND; multi-currency comes when we wire
 * the payment provider per market.
 */

interface VariantInput {
  size: string;
  color: string;
  colorHex: string;
  price: number; // VND
  stock: number;
}

interface FormState {
  title: string;
  description: string;
  tags: string; // comma-separated for UX
  images: string[]; // uploaded image URLs
  variants: VariantInput[];
  material: string;
  care: string;
  origin: string;
  status: ProductStatus;
}

function initialFromProduct(p?: Product): FormState {
  if (!p) {
    return {
      title: '',
      description: '',
      tags: '',
      images: [],
      variants: [{ size: 'M', color: '', colorHex: '', price: 500_000, stock: 5 }],
      material: '',
      care: 'Cold wash, hang dry. Do not bleach.',
      origin: '',
      status: 'DRAFT',
    };
  }
  return {
    title: p.title,
    description: p.description,
    tags: p.tags.join(', '),
    images: p.images.map((i) => i.url),
    variants: p.variants.map((v) => ({
      size: v.attributes.size ?? v.attributes.customSize ?? '',
      color: v.attributes.color ?? '',
      colorHex: v.attributes.colorHex ?? '',
      price: v.price.amount,
      stock: v.stock,
    })),
    material: p.details.material ?? '',
    care: p.details.careInstructions ?? '',
    origin: p.details.origin ?? '',
    status: p.status,
  };
}

export function ProductForm({ initial }: { initial?: Product }) {
  const t = useTranslations('seller.productForm');
  const router = useRouter();
  const [state, setState] = useState<FormState>(() => initialFromProduct(initial));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const updateVariant = (idx: number, patch: Partial<VariantInput>) =>
    setState((s) => ({
      ...s,
      variants: s.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    }));

  const addVariant = () =>
    setState((s) => ({
      ...s,
      variants: [
        ...s.variants,
        { size: 'M', color: '', colorHex: '', price: 500_000, stock: 0 },
      ],
    }));

  const removeVariant = (idx: number) =>
    setState((s) => ({
      ...s,
      variants: s.variants.length > 1 ? s.variants.filter((_, i) => i !== idx) : s.variants,
    }));

  const submit = (status: ProductStatus) => {
    setError(null);

    const images = state.images
      .slice(0, 12)
      .map((url, position) => ({ url, position }));

    if (!state.title.trim()) {
      setError('Vui lòng nhập tên sản phẩm');
      return;
    }
    if (!images.length) {
      setError('Vui lòng tải lên ít nhất 1 ảnh sản phẩm');
      return;
    }
    if (!state.variants.length || state.variants.some((v) => v.price <= 0)) {
      setError('Cần ít nhất 1 phân loại với giá > 0');
      return;
    }

    const variants = state.variants.map((v) => ({
      price: { amount: v.price, currency: 'VND' as const },
      compareAtPrice: null,
      stock: v.stock,
      attributes: {
        size: isStandardSize(v.size) ? (v.size as 'S' | 'M' | 'L' | 'XS' | 'XL') : null,
        customSize: isStandardSize(v.size) ? null : v.size || null,
        color: v.color || null,
        colorHex: v.colorHex && /^#[0-9a-fA-F]{6}$/.test(v.colorHex) ? v.colorHex : null,
      },
    }));

    const tags = state.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 20);

    const details = {
      material: state.material || null,
      careInstructions: state.care || null,
      modelHeightCm: null,
      modelWearsSize: null,
      origin: state.origin || null,
    };

    startTransition(async () => {
      try {
        if (initial) {
          const payload: UpdateProductInput = {
            title: state.title,
            description: state.description,
            status,
            images,
            variants,
            tags,
            details,
          };
          await updateProductAction(initial.id, payload);
        } else {
          const payload: CreateProductInput = {
            title: state.title,
            description: state.description,
            images,
            variants,
            tags,
            details,
          };
          const created = await createProductAction(payload);
          // If publishing immediately, also flip status
          if (status === 'ACTIVE') {
            await updateProductAction(created.id, { status: 'ACTIVE' });
          }
        }
        router.push('/seller');
        router.refresh();
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(state.status);
      }}
      className="space-y-10"
    >
      {/* ── Basic ────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <Field label={<>{t('fields.title')}<Req /></>}>
          <input
            value={state.title}
            onChange={(e) => update('title', e.target.value)}
            maxLength={120}
            required
            className="input"
            placeholder="Wool Overcoat — Camel"
          />
        </Field>
        <Field label={t('fields.description')}>
          <textarea
            value={state.description}
            onChange={(e) => update('description', e.target.value)}
            maxLength={4000}
            rows={5}
            className="input"
          />
        </Field>
        <Field label={t('fields.tags')}>
          <input
            value={state.tags}
            onChange={(e) => update('tags', e.target.value)}
            className="input"
            placeholder="outerwear, wool, minimal"
          />
        </Field>
      </section>

      {/* ── Images ───────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <Field
          label={<>{t('fields.images')}<Req /></>}
          hint="Click hoặc kéo-thả file để upload (JPG/PNG/WebP, max 8 MB)"
        >
          <ImageUploader
            value={state.images}
            onChange={(images) => update('images', images)}
            max={12}
          />
        </Field>
      </section>

      {/* ── Variants ─────────────────────────────────────────────────────── */}
      <section>
        <p className="mb-3 text-sm font-medium">
          {t('fields.variants')}
          <Req />
        </p>
        <div className="space-y-2">
          {state.variants.map((v, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 rounded-lg border border-border bg-background p-3"
            >
              <input
                value={v.size}
                onChange={(e) => updateVariant(idx, { size: e.target.value.toUpperCase() })}
                placeholder="M"
                className="input col-span-2"
                aria-label={t('fields.variantSize')}
              />
              <input
                value={v.color}
                onChange={(e) => updateVariant(idx, { color: e.target.value })}
                placeholder="Camel"
                className="input col-span-3"
                aria-label={t('fields.variantColor')}
              />
              <input
                type="color"
                value={v.colorHex || '#888888'}
                onChange={(e) => updateVariant(idx, { colorHex: e.target.value })}
                className="col-span-1 h-10 w-full cursor-pointer rounded border border-border"
                aria-label="Color hex"
              />
              <input
                type="number"
                value={v.price}
                onChange={(e) => updateVariant(idx, { price: Math.max(0, Number(e.target.value)) })}
                min={0}
                step={10000}
                className="input col-span-3"
                aria-label={t('fields.variantPrice')}
              />
              <input
                type="number"
                value={v.stock}
                onChange={(e) => updateVariant(idx, { stock: Math.max(0, Number(e.target.value)) })}
                min={0}
                className="input col-span-2"
                aria-label={t('fields.variantStock')}
              />
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                disabled={state.variants.length === 1}
                className="col-span-1 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30"
                aria-label={t('fields.removeVariant')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-3 inline-flex items-center gap-1 text-sm text-foreground hover:underline"
        >
          <Plus className="h-4 w-4" /> {t('fields.addVariant')}
        </button>
      </section>

      {/* ── Details ──────────────────────────────────────────────────────── */}
      <section>
        <p className="mb-3 text-sm font-medium">{t('fields.details')}</p>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label={t('fields.material')}>
            <input
              value={state.material}
              onChange={(e) => update('material', e.target.value)}
              className="input"
              placeholder="100% wool"
            />
          </Field>
          <Field label={t('fields.care')}>
            <input
              value={state.care}
              onChange={(e) => update('care', e.target.value)}
              className="input"
            />
          </Field>
          <Field label={t('fields.origin')}>
            <input
              value={state.origin}
              onChange={(e) => update('origin', e.target.value)}
              className="input"
              placeholder="Vietnam"
            />
          </Field>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => submit('DRAFT')}
          className="h-11 rounded-full border border-border px-5 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {pending ? t('saving') : t('saveDraft')}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => submit('ACTIVE')}
          className="h-11 rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? t('saving') : t('publish')}
        </button>
      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          height: 2.75rem;
          padding: 0 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          font-size: 0.875rem;
        }
        :global(textarea.input) {
          height: auto;
          padding: 0.75rem;
          line-height: 1.5;
        }
        :global(.input:focus) {
          outline: 2px solid hsl(var(--ring));
          outline-offset: -1px;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

function isStandardSize(s: string): boolean {
  return ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'ONE_SIZE'].includes(s.toUpperCase());
}
