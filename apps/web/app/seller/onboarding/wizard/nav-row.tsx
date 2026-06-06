'use client';

import { useTranslations } from 'next-intl';

export function NavRow({
  onBack,
  onNext,
  disabled,
}: {
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
}) {
  const tCommon = useTranslations('common');
  return (
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
        onClick={onNext}
        disabled={disabled}
        className="h-11 rounded-full bg-foreground px-7 text-sm font-medium text-background disabled:opacity-40"
      >
        {tCommon('continue')} →
      </button>
    </div>
  );
}
