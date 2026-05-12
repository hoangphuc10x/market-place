import type { ReactNode } from 'react';
import type { Product, PublicStore, SectionId, ThemeConfig } from '@threadly/types';

/** Public data the storefront theme is allowed to read. */
export interface StorefrontData {
  store: PublicStore;
  products: Product[];
}

/** Each theme exports an object matching this shape. */
export interface ThemeRenderer {
  /** Whole-page renderer. Themes own their layout. */
  Storefront: (props: StorefrontProps) => ReactNode;
  /** Lightweight preview card for the theme picker. */
  PickerPreview: (props: PickerPreviewProps) => ReactNode;
  /**
   * CSS variables this theme expects (HSL triples without `hsl()`).
   * Web app injects these on the storefront root, allowing per-store color
   * overrides without recompiling Tailwind.
   */
  cssVars: (config: ThemeConfig) => Record<string, string>;
  /** Inline <style> contents — fonts, theme-specific keyframes, etc. */
  inlineStyles?: () => string;
  /** Which sections this theme supports. Unsupported ones are skipped. */
  supportedSections: Set<SectionId>;
}

export interface StorefrontProps extends StorefrontData {
  /** Hostname + storeSlug for canonical URLs (filled by host app). */
  baseUrl: string;
}

export interface PickerPreviewProps {
  /** Demo data the picker renders with. */
  store: PublicStore;
}

/** Helper: hex (#RRGGBB) -> "H S% L%" for CSS HSL variable interpolation. */
export function hexToHslString(hex: string): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function formatMoney(amount: number, currency: string): string {
  if (currency === 'VND') {
    return `${amount.toLocaleString('vi-VN')} ₫`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100);
}
