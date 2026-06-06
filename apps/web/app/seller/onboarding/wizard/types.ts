import {
  THEME_CATALOG,
  normalizeSlug,
  type OnboardingStep,
  type StoreCategory,
  type ThemeId,
} from '@threadly/types';

export interface WizardState {
  step: OnboardingStep;
  storeName: string;
  storeSlug: string;
  category: StoreCategory | null;
  themeId: ThemeId;
  primaryColor: string;
  logoUrl: string;
  coverImageUrl: string;
  tagline: string;
}

export type UpdateFn = <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;

export const STORAGE_KEY = 'threadly:onboarding:v1';

export const CATEGORY_TAGS: Record<StoreCategory, string> = {
  STREETWEAR: '🧢',
  DESIGNER: '✦',
  VINTAGE: '👜',
  HANDMADE: '🪡',
  ACCESSORIES: '💍',
  SHOES: '👟',
  FORMAL: '🎩',
  ATHLEISURE: '🏃',
  KIDS: '🧸',
  OTHER: '✨',
};

export function defaultState(initialSlug: string | null): WizardState {
  const firstTheme = THEME_CATALOG[0];
  return {
    step: 'identity',
    storeName: '',
    storeSlug: initialSlug ? normalizeSlug(initialSlug) : '',
    category: null,
    themeId: firstTheme?.id ?? 'atelier',
    primaryColor: firstTheme?.defaultPrimary ?? '#1a1a1a',
    logoUrl: '',
    coverImageUrl: '',
    tagline: '',
  };
}
