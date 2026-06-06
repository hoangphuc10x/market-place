'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  THEME_CATALOG,
  type PublicStore,
  type StoreCategory,
  type ThemeId,
  type UpdateStoreInput,
} from '@threadly/types';
import { cn } from '@/lib/cn';
import { updateStoreAction } from './actions';

const CATEGORIES: StoreCategory[] = [
  'STREETWEAR',
  'DESIGNER',
  'VINTAGE',
  'HANDMADE',
  'ACCESSORIES',
  'SHOES',
  'FORMAL',
  'ATHLEISURE',
  'KIDS',
  'OTHER',
];

export function StoreSettingsForm({ initial }: { initial: PublicStore }) {
  const t = useTranslations('seller.storeSettings');
  const tCat = useTranslations('seller.onboarding.category.items');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState({
    name: initial.name,
    bio: initial.bio ?? '',
    category: initial.category,
    themeId: initial.theme.themeId,
    primaryColor: initial.theme.primaryColor,
    tagline: initial.theme.tagline ?? '',
    coverImageUrl: initial.theme.coverImageUrl ?? '',
    logoUrl: initial.theme.logoUrl ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const input: UpdateStoreInput = {
      name: state.name,
      bio: state.bio || null,
      category: state.category,
      theme: {
        themeId: state.themeId,
        primaryColor: state.primaryColor,
        tagline: state.tagline || null,
        coverImageUrl: state.coverImageUrl || null,
        logoUrl: state.logoUrl || null,
      },
    };

    startTransition(async () => {
      try {
        await updateStoreAction(input);
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <Field label={t('fields.name')}>
        <input
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          maxLength={60}
          required
          className="input"
        />
      </Field>

      <Field label={t('fields.bio')}>
        <textarea
          value={state.bio}
          onChange={(e) => setState((s) => ({ ...s, bio: e.target.value }))}
          maxLength={280}
          rows={3}
          className="input"
        />
      </Field>

      <Field label={t('fields.category')}>
        <select
          value={state.category}
          onChange={(e) => setState((s) => ({ ...s, category: e.target.value as StoreCategory }))}
          className="input"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {tCat(c)}
            </option>
          ))}
        </select>
      </Field>

      <div>
        <p className="mb-3 text-sm font-medium">{t('fields.theme')}</p>
        <div className="grid grid-cols-3 gap-3">
          {THEME_CATALOG.map((th) => {
            const selected = state.themeId === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() =>
                  setState((s) => ({
                    ...s,
                    themeId: th.id as ThemeId,
                    primaryColor: s.themeId === th.id ? s.primaryColor : th.defaultPrimary,
                  }))
                }
                className={cn(
                  'rounded-lg border p-3 text-left text-sm transition',
                  selected
                    ? 'border-foreground ring-2 ring-foreground'
                    : 'border-border hover:border-foreground/40',
                )}
              >
                <p className="font-semibold">{th.name}</p>
                <p className="text-xs text-muted-foreground">{th.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Field label={t('fields.primaryColor')}>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={state.primaryColor}
            onChange={(e) => setState((s) => ({ ...s, primaryColor: e.target.value }))}
            className="h-11 w-16 cursor-pointer rounded border border-border"
          />
          <input
            type="text"
            value={state.primaryColor}
            onChange={(e) => setState((s) => ({ ...s, primaryColor: e.target.value }))}
            className="input w-32 font-mono"
          />
        </div>
      </Field>

      <Field label={t('fields.tagline')}>
        <input
          value={state.tagline}
          onChange={(e) => setState((s) => ({ ...s, tagline: e.target.value }))}
          maxLength={120}
          className="input"
        />
      </Field>

      <Field label={t('fields.logo')}>
        <div className="flex items-start gap-3">
          {state.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.logoUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full border border-border object-cover"
            />
          ) : (
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border text-xl font-semibold text-white"
              style={{ backgroundColor: state.primaryColor }}
              aria-hidden
            >
              {state.name.trim().slice(0, 1).toUpperCase() || 'S'}
            </div>
          )}
          <input
            value={state.logoUrl}
            onChange={(e) => setState((s) => ({ ...s, logoUrl: e.target.value }))}
            className="input font-mono text-xs"
            placeholder="https://..."
          />
        </div>
      </Field>

      <Field label={t('fields.coverImage')}>
        <input
          value={state.coverImageUrl}
          onChange={(e) => setState((s) => ({ ...s, coverImageUrl: e.target.value }))}
          className="input font-mono text-xs"
          placeholder="https://..."
        />
        {state.coverImageUrl && (
          <div className="mt-2 aspect-[16/9] w-full overflow-hidden rounded-md border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={state.coverImageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </Field>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-600">{t('saved')}</span>}
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? t('saving') : t('save')}
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
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
