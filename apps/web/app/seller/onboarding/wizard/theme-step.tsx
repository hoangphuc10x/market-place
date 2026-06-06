'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  DEFAULT_SECTIONS,
  THEME_CATALOG,
  type PublicStore,
  type StoreCategory,
  type ThemeConfig,
  type ThemeId,
} from '@threadly/types';
import { THEMES } from '@threadly/themes';
import { cn } from '@/lib/cn';
import { NavRow } from './nav-row';
import type { UpdateFn, WizardState } from './types';

export function ThemeStep({
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
  const t = useTranslations('seller.onboarding.theme');
  const recommended = useMemo(() => recommendTheme(state.category), [state.category]);
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {THEME_CATALOG.map((th) => {
          const selected = state.themeId === th.id;
          const renderer = THEMES[th.id];
          const isCurrentChoice = selected;
          const previewTheme: ThemeConfig = {
            themeId: th.id,
            primaryColor: isCurrentChoice ? state.primaryColor : th.defaultPrimary,
            logoUrl: null,
            coverImageUrl: null,
            tagline: state.tagline || null,
            sections: DEFAULT_SECTIONS,
          };
          const previewStore: PublicStore = {
            id: 'preview',
            slug: state.storeSlug || 'your-shop',
            name: state.storeName || th.name,
            bio: null,
            category: state.category ?? 'OTHER',
            status: 'DRAFT',
            theme: previewTheme,
            productCount: 0,
            followerCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          const cssVars = renderer.cssVars(previewTheme) as React.CSSProperties;

          return (
            <button
              key={th.id}
              type="button"
              onClick={() => {
                update('themeId', th.id);
                update('primaryColor', th.defaultPrimary);
              }}
              className={cn(
                'flex flex-col overflow-hidden rounded-xl border bg-background text-left transition',
                selected
                  ? 'border-foreground ring-2 ring-foreground'
                  : 'border-border hover:border-foreground/40',
              )}
            >
              <div className="aspect-[4/5] overflow-hidden" style={cssVars}>
                <renderer.PickerPreview store={previewStore} />
              </div>
              <div className="space-y-1 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-semibold">{th.name}</span>
                  {th.id === recommended && (
                    <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                      {t('recommended')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{th.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border p-5">
        <p className="text-sm font-medium">{t('primaryColor')}</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="color"
            value={state.primaryColor}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="h-12 w-16 cursor-pointer rounded-lg border border-border"
          />
          <input
            type="text"
            value={state.primaryColor}
            onChange={(e) => update('primaryColor', e.target.value)}
            className="h-12 w-32 rounded-lg border border-border bg-background px-3 font-mono text-sm"
          />
          <p className="ml-auto text-xs text-muted-foreground">{t('colorTip')}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border p-5">
        <p className="text-sm font-medium">{t('tagline')}</p>
        <input
          value={state.tagline}
          onChange={(e) => update('tagline', e.target.value)}
          maxLength={120}
          placeholder={t('taglinePlaceholder')}
          className="mt-3 h-12 w-full rounded-lg border border-border bg-background px-3 text-sm"
        />
      </div>

      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}

function recommendTheme(cat: StoreCategory | null): ThemeId {
  switch (cat) {
    case 'STREETWEAR':
    case 'VINTAGE':
      return 'tokyo';
    case 'HANDMADE':
    case 'ACCESSORIES':
    case 'KIDS':
      return 'pastel';
    case 'DESIGNER':
    case 'FORMAL':
    default:
      return 'atelier';
  }
}
