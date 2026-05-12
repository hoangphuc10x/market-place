import type { ThemeId } from '@threadly/types';
import type { ThemeRenderer } from './types';
import { atelier } from './atelier';
import { tokyo } from './tokyo';
import { pastel } from './pastel';

export const THEMES: Record<ThemeId, ThemeRenderer> = {
  atelier,
  tokyo,
  pastel,
};

export function getTheme(themeId: ThemeId): ThemeRenderer {
  return THEMES[themeId];
}

export * from './types';
