'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  THEME_CATALOG,
  onboardingPayloadSchema,
  type OnboardingPayload,
} from '@threadly/types';
import { cn } from '@/lib/cn';
import { finishOnboardingAction } from '../actions';
import type { WizardState } from './types';

export function ReviewStep({ state, onBack }: { state: WizardState; onBack: () => void }) {
  const t = useTranslations('seller.onboarding.review');
  const tCommon = useTranslations('common');
  const tCategory = useTranslations('seller.onboarding.category.items');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload: OnboardingPayload | null = useMemo(() => {
    const draft = {
      storeName: state.storeName,
      storeSlug: state.storeSlug,
      category: state.category!,
      themeId: state.themeId,
      primaryColor: state.primaryColor,
      logoUrl: state.logoUrl || null,
      coverImageUrl: state.coverImageUrl || null,
      tagline: state.tagline || null,
    };
    const parsed = onboardingPayloadSchema.safeParse(draft);
    return parsed.success ? parsed.data : null;
  }, [state]);

  const submit = async () => {
    if (!payload) return;
    setSubmitting(true);
    setError(null);
    const res = await finishOnboardingAction(payload);
    if (res && !res.ok) {
      setError(res.error);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>

      <dl className="divide-y divide-border rounded-xl border border-border">
        <ReviewRow label={t('labels.shopName')} value={state.storeName} />
        <ReviewRow label={t('labels.url')} value={`threadly.com/${state.storeSlug}`} mono />
        <ReviewRow
          label={t('labels.category')}
          value={state.category ? tCategory(state.category) : '—'}
        />
        <ReviewRow
          label={t('labels.theme')}
          value={THEME_CATALOG.find((th) => th.id === state.themeId)?.name ?? state.themeId}
        />
        <ReviewRow label={t('labels.primaryColor')} value={state.primaryColor} mono />
        {state.tagline && <ReviewRow label={t('labels.tagline')} value={state.tagline} />}
      </dl>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="h-11 rounded-full border border-border px-6 text-sm font-medium hover:bg-muted"
        >
          ← {tCommon('back')}
        </button>
        <button
          type="button"
          disabled={!payload || submitting}
          onClick={submit}
          className="h-11 rounded-full bg-foreground px-8 text-sm font-medium text-background disabled:opacity-40"
        >
          {submitting ? t('submitting') : t('submit')}
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={cn('text-sm', mono && 'font-mono')}>{value}</dd>
    </div>
  );
}
