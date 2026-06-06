'use client';

import { useEffect, useState } from 'react';
import type { OnboardingStep } from '@threadly/types';
import { CategoryStep } from './category-step';
import { IdentityStep } from './identity-step';
import { ReviewStep } from './review-step';
import { StepIndicator } from './step-indicator';
import { ThemeStep } from './theme-step';
import { STORAGE_KEY, defaultState, type WizardState } from './types';

export function OnboardingWizard({ initialSlug }: { initialSlug: string | null }) {
  const [state, setState] = useState<WizardState>(() => defaultState(initialSlug));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WizardState>;
        setState((s) => ({ ...s, ...parsed, step: parsed.step ?? s.step }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const update = <K extends keyof WizardState>(key: K, value: WizardState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const goTo = (step: OnboardingStep) => setState((s) => ({ ...s, step }));

  return (
    <div>
      <StepIndicator current={state.step} />
      <div className="mt-10">
        {state.step === 'identity' && (
          <IdentityStep state={state} update={update} onNext={() => goTo('category')} />
        )}
        {state.step === 'category' && (
          <CategoryStep
            state={state}
            update={update}
            onBack={() => goTo('identity')}
            onNext={() => goTo('theme')}
          />
        )}
        {state.step === 'theme' && (
          <ThemeStep
            state={state}
            update={update}
            onBack={() => goTo('category')}
            onNext={() => goTo('review')}
          />
        )}
        {state.step === 'review' && <ReviewStep state={state} onBack={() => goTo('theme')} />}
      </div>
    </div>
  );
}
