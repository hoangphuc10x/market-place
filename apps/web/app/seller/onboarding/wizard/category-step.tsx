'use client';

import { useTranslations } from 'next-intl';
import type { StoreCategory } from '@threadly/types';
import { cn } from '@/lib/cn';
import { NavRow } from './nav-row';
import { CATEGORY_TAGS, type UpdateFn, type WizardState } from './types';

export function CategoryStep({
  state,
  update,
  onBack,
  onNext,
}: {
  state: WizardState;
  update: UpdateFn;
  onBack: () => void;
  onNext: () => void;
}) {
  const t = useTranslations('seller.onboarding.category');
  const tItems = useTranslations('seller.onboarding.category.items');
  const categories = Object.keys(CATEGORY_TAGS) as StoreCategory[];
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {categories.map((cat) => {
          const selected = state.category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => update('category', cat)}
              className={cn(
                'flex h-24 flex-col items-start justify-between rounded-xl border p-4 text-left transition',
                selected
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background hover:border-foreground/40',
              )}
            >
              <span className="text-2xl">{CATEGORY_TAGS[cat]}</span>
              <span className="text-sm font-medium">{tItems(cat)}</span>
            </button>
          );
        })}
      </div>
      <NavRow onBack={onBack} onNext={onNext} disabled={!state.category} />
    </div>
  );
}
