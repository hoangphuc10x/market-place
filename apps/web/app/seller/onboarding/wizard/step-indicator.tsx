'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ONBOARDING_STEPS, type OnboardingStep } from '@threadly/types';
import { cn } from '@/lib/cn';

export function StepIndicator({ current }: { current: OnboardingStep }) {
  const t = useTranslations('seller.onboarding.steps');
  const currentIdx = ONBOARDING_STEPS.indexOf(current);
  return (
    <ol className="flex items-center gap-3 text-sm">
      {ONBOARDING_STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s} className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-xs',
                done && 'border-foreground bg-foreground text-background',
                active && 'border-foreground bg-background',
                !done && !active && 'border-border bg-background text-muted-foreground',
              )}
            >
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            <span className={cn(active ? 'font-medium' : 'text-muted-foreground')}>
              {t(s)}
            </span>
            {i < ONBOARDING_STEPS.length - 1 && (
              <span className="ml-1 h-px w-8 bg-border" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
