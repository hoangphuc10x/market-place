'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { normalizeSlug } from '@threadly/types';
import { checkSlugAction } from '../actions';
import type { UpdateFn, WizardState } from './types';

type SlugState = 'idle' | 'checking' | 'ok' | 'taken' | 'reserved' | 'invalid';

export function IdentityStep({
  state,
  update,
  onNext,
}: {
  state: WizardState;
  update: UpdateFn;
  onNext: () => void;
}) {
  const t = useTranslations('seller.onboarding.identity');
  const tCommon = useTranslations('common');
  const [slugStatus, setSlugStatus] = useState<{
    state: SlugState;
    suggestions?: string[];
  }>({ state: 'idle' });
  const [pending, startTransition] = useTransition();

  const [slugTouched, setSlugTouched] = useState(!!state.storeSlug);

  useEffect(() => {
    if (!slugTouched) {
      update('storeSlug', normalizeSlug(state.storeName));
    }
  }, [state.storeName, slugTouched]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkSlug = (slug: string) => {
    if (!slug) {
      setSlugStatus({ state: 'idle' });
      return;
    }
    setSlugStatus({ state: 'checking' });
    startTransition(async () => {
      const res = await checkSlugAction(slug);
      setSlugStatus({
        state: res.available
          ? 'ok'
          : res.reason === 'reserved'
            ? 'reserved'
            : res.reason === 'invalid'
              ? 'invalid'
              : 'taken',
        suggestions: res.suggestions,
      });
    });
  };

  const canProceed =
    state.storeName.trim().length >= 2 && state.storeSlug.length >= 3 && slugStatus.state === 'ok';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <label className="block">
        <span className="text-sm font-medium">{t('shopNameLabel')}</span>
        <input
          value={state.storeName}
          onChange={(e) => update('storeName', e.target.value)}
          placeholder={t('shopNamePlaceholder')}
          maxLength={60}
          className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">{t('urlLabel')}</span>
        <div className="mt-2 flex items-center overflow-hidden rounded-lg border border-border bg-background">
          <span className="border-r border-border bg-muted px-3 py-3 text-sm text-muted-foreground">
            threadly.com /
          </span>
          <input
            value={state.storeSlug}
            onChange={(e) => {
              setSlugTouched(true);
              const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
              update('storeSlug', v);
            }}
            onBlur={(e) => checkSlug(e.target.value)}
            placeholder={t('urlPlaceholder')}
            maxLength={32}
            className="h-12 flex-1 bg-transparent px-3 text-base focus:outline-none"
          />
        </div>
        <SlugStatusLine
          status={slugStatus.state}
          suggestions={slugStatus.suggestions}
          onPick={(s) => {
            update('storeSlug', s);
            checkSlug(s);
          }}
        />
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canProceed || pending}
          onClick={onNext}
          className="h-11 rounded-full bg-foreground px-7 text-sm font-medium text-background disabled:opacity-40"
        >
          {tCommon('continue')} →
        </button>
      </div>
    </div>
  );
}

function SlugStatusLine({
  status,
  suggestions,
  onPick,
}: {
  status: SlugState;
  suggestions?: string[];
  onPick: (s: string) => void;
}) {
  const t = useTranslations('seller.onboarding.identity.slugStatus');
  if (status === 'idle') return null;
  if (status === 'checking')
    return <p className="mt-2 text-sm text-muted-foreground">{t('checking')}</p>;
  if (status === 'ok')
    return <p className="mt-2 text-sm text-emerald-600">{t('available')}</p>;
  if (status === 'invalid')
    return <p className="mt-2 text-sm text-destructive">{t('invalid')}</p>;

  return (
    <div className="mt-2 text-sm">
      <p className="text-destructive">{status === 'reserved' ? t('reserved') : t('taken')}</p>
      {!!suggestions?.length && (
        <p className="mt-1 text-muted-foreground">
          {t('trySuggestions')}{' '}
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="font-mono text-foreground underline-offset-2 hover:underline"
            >
              {s}
              {i < suggestions.length - 1 && ', '}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}
