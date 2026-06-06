'use client';

import { useLocale } from 'next-intl';
import { useState, useTransition } from 'react';
import { Globe, Check } from 'lucide-react';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/i18n/config';
import { setLocale } from '@/app/actions/locale';
import { cn } from '@/lib/cn';

export function LanguageSwitcher() {
  const current = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    setOpen(false);
    startTransition(() => setLocale(next, window.location.pathname));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-label="Language"
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{LOCALE_LABELS[current].flag}</span>
      </button>
      {open && (
        <>
          {/* click-away */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-md">
            {LOCALES.map((loc) => {
              const meta = LOCALE_LABELS[loc];
              const active = loc === current;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => choose(loc)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted',
                    active && 'font-medium',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{meta.flag}</span>
                    <span>{meta.native}</span>
                  </span>
                  {active && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
