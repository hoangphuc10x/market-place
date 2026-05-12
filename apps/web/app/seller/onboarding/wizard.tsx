'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import {
  DEFAULT_SECTIONS,
  ONBOARDING_STEPS,
  THEME_CATALOG,
  normalizeSlug,
  onboardingPayloadSchema,
  type OnboardingPayload,
  type OnboardingStep,
  type StoreCategory,
  type ThemeId,
} from '@threadly/types';
import { cn } from '@/lib/cn';
import { checkSlugAction, finishOnboardingAction } from './actions';

const CATEGORY_LABELS: Record<StoreCategory, { label: string; tag: string }> = {
  STREETWEAR: { label: 'Streetwear', tag: '🧢' },
  DESIGNER: { label: 'Designer', tag: '✦' },
  VINTAGE: { label: 'Vintage', tag: '👜' },
  HANDMADE: { label: 'Handmade', tag: '🪡' },
  ACCESSORIES: { label: 'Accessories', tag: '💍' },
  SHOES: { label: 'Shoes', tag: '👟' },
  FORMAL: { label: 'Formal wear', tag: '🎩' },
  ATHLEISURE: { label: 'Athleisure', tag: '🏃' },
  KIDS: { label: 'Kids', tag: '🧸' },
  OTHER: { label: 'Other', tag: '✨' },
};

interface WizardState {
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

const STORAGE_KEY = 'threadly:onboarding:v1';

function defaultState(initialSlug: string | null): WizardState {
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

export function OnboardingWizard({ initialSlug }: { initialSlug: string | null }) {
  const [state, setState] = useState<WizardState>(() => defaultState(initialSlug));
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WizardState>;
        setState((s) => ({ ...s, ...parsed, step: parsed.step ?? s.step }));
      }
    } catch {
      // ignore
    }
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
        {state.step === 'review' && (
          <ReviewStep state={state} onBack={() => goTo('theme')} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { current: OnboardingStep }) {
  const currentIdx = ONBOARDING_STEPS.indexOf(current);
  const labels: Record<OnboardingStep, string> = {
    identity: 'Name',
    category: 'Category',
    theme: 'Theme',
    review: 'Review',
  };
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
              {labels[s]}
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

// ---------------------------------------------------------------------------
// Step 1 — Identity
// ---------------------------------------------------------------------------

function IdentityStep({
  state,
  update,
  onNext,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  onNext: () => void;
}) {
  const [slugStatus, setSlugStatus] = useState<{
    state: 'idle' | 'checking' | 'ok' | 'taken' | 'reserved' | 'invalid';
    suggestions?: string[];
  }>({ state: 'idle' });
  const [pending, startTransition] = useTransition();

  // Derive slug from name on first edit (until user touches slug manually)
  const [slugTouched, setSlugTouched] = useState(!!state.storeSlug);

  useEffect(() => {
    if (!slugTouched) {
      update('storeSlug', normalizeSlug(state.storeName));
    }
  }, [state.storeName, slugTouched]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkSlug = (slug: string) => {
    if (!slug) {
      setSlugStatus({ state: 'idle' });
      return;
    }
    setSlugStatus({ state: 'checking' });
    startTransition(async () => {
      const res = await checkSlugAction(slug);
      setSlugStatus({
        state: res.available
          ? 'ok'
          : res.reason === 'reserved'
            ? 'reserved'
            : res.reason === 'invalid'
              ? 'invalid'
              : 'taken',
        suggestions: res.suggestions,
      });
    });
  };

  const canProceed =
    state.storeName.trim().length >= 2 && state.storeSlug.length >= 3 && slugStatus.state === 'ok';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">What’s your shop called?</h1>
        <p className="mt-2 text-muted-foreground">
          Your URL will be <code className="font-mono">threadly.com/your-name</code>. You can change
          the display name later, but the URL stays.
        </p>
      </header>

      <label className="block">
        <span className="text-sm font-medium">Shop name</span>
        <input
          value={state.storeName}
          onChange={(e) => update('storeName', e.target.value)}
          placeholder="Linh Studio"
          maxLength={60}
          className="mt-2 h-12 w-full rounded-lg border border-border bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium">URL</span>
        <div className="mt-2 flex items-center overflow-hidden rounded-lg border border-border bg-background">
          <span className="border-r border-border bg-muted px-3 py-3 text-sm text-muted-foreground">
            threadly.com /
          </span>
          <input
            value={state.storeSlug}
            onChange={(e) => {
              setSlugTouched(true);
              const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
              update('storeSlug', v);
            }}
            onBlur={(e) => checkSlug(e.target.value)}
            placeholder="linhstudio"
            maxLength={32}
            className="h-12 flex-1 bg-transparent px-3 text-base focus:outline-none"
          />
        </div>
        <SlugStatusLine
          status={slugStatus.state}
          suggestions={slugStatus.suggestions}
          onPick={(s) => {
            update('storeSlug', s);
            checkSlug(s);
          }}
        />
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!canProceed || pending}
          onClick={onNext}
          className="h-11 rounded-full bg-foreground px-7 text-sm font-medium text-background disabled:opacity-40"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function SlugStatusLine({
  status,
  suggestions,
  onPick,
}: {
  status: 'idle' | 'checking' | 'ok' | 'taken' | 'reserved' | 'invalid';
  suggestions?: string[];
  onPick: (s: string) => void;
}) {
  if (status === 'idle') return null;
  if (status === 'checking')
    return <p className="mt-2 text-sm text-muted-foreground">Checking…</p>;
  if (status === 'ok')
    return <p className="mt-2 text-sm text-emerald-600">✓ Available — this URL is yours</p>;
  if (status === 'invalid')
    return (
      <p className="mt-2 text-sm text-destructive">
        Use 3–32 lowercase letters, numbers or dashes.
      </p>
    );

  return (
    <div className="mt-2 text-sm">
      <p className="text-destructive">
        {status === 'reserved' ? 'This name is reserved.' : 'Already taken.'}
      </p>
      {!!suggestions?.length && (
        <p className="mt-1 text-muted-foreground">
          Try:{' '}
          {suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => onPick(s)}
              className="font-mono text-foreground underline-offset-2 hover:underline"
            >
              {s}
              {i < suggestions.length - 1 && ', '}
            </button>
          ))}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Category
// ---------------------------------------------------------------------------

function CategoryStep({
  state,
  update,
  onBack,
  onNext,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">What do you sell?</h1>
        <p className="mt-2 text-muted-foreground">
          Pick what fits best — this guides our theme suggestion in the next step.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {(Object.keys(CATEGORY_LABELS) as StoreCategory[]).map((cat) => {
          const meta = CATEGORY_LABELS[cat];
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
              <span className="text-2xl">{meta.tag}</span>
              <span className="text-sm font-medium">{meta.label}</span>
            </button>
          );
        })}
      </div>
      <NavRow onBack={onBack} onNext={onNext} disabled={!state.category} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Theme + brand
// ---------------------------------------------------------------------------

function ThemeStep({
  state,
  update,
  onBack,
  onNext,
}: {
  state: WizardState;
  update: <K extends keyof WizardState>(k: K, v: WizardState[K]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const recommended = useMemo(() => recommendTheme(state.category), [state.category]);
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Pick a theme</h1>
        <p className="mt-2 text-muted-foreground">
          Each one is fashion-tuned. You can switch later from your shop settings.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {THEME_CATALOG.map((t) => {
          const selected = state.themeId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                update('themeId', t.id);
                update('primaryColor', t.defaultPrimary);
              }}
              className={cn(
                'flex flex-col overflow-hidden rounded-xl border bg-background text-left transition',
                selected ? 'border-foreground ring-2 ring-foreground' : 'border-border hover:border-foreground/40',
              )}
            >
              <div className="aspect-[4/5] bg-gradient-to-br from-neutral-100 to-neutral-300" />
              <div className="space-y-1 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-semibold">{t.name}</span>
                  {t.id === recommended && (
                    <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{t.tagline}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border p-5">
        <p className="text-sm font-medium">Primary color</p>
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
          <p className="ml-auto text-xs text-muted-foreground">
            Pro tip: pick something readable on both light and dark images.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border p-5">
        <p className="text-sm font-medium">Tagline (optional)</p>
        <input
          value={state.tagline}
          onChange={(e) => update('tagline', e.target.value)}
          maxLength={120}
          placeholder="Slow fashion, made in Hà Nội."
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

// ---------------------------------------------------------------------------
// Step 4 — Review + submit
// ---------------------------------------------------------------------------

function ReviewStep({ state, onBack }: { state: WizardState; onBack: () => void }) {
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
    // on success, server action redirects — component unmounts.
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Ready to go live?</h1>
        <p className="mt-2 text-muted-foreground">
          Double-check below. You can edit everything except your URL later.
        </p>
      </header>

      <dl className="divide-y divide-border rounded-xl border border-border">
        <ReviewRow label="Shop name" value={state.storeName} />
        <ReviewRow label="URL" value={`threadly.com/${state.storeSlug}`} mono />
        <ReviewRow label="Category" value={state.category ? CATEGORY_LABELS[state.category].label : '—'} />
        <ReviewRow label="Theme" value={THEME_CATALOG.find((t) => t.id === state.themeId)?.name ?? state.themeId} />
        <ReviewRow label="Primary color" value={state.primaryColor} mono />
        {state.tagline && <ReviewRow label="Tagline" value={state.tagline} />}
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
          ← Back
        </button>
        <button
          type="button"
          disabled={!payload || submitting}
          onClick={submit}
          className="h-11 rounded-full bg-foreground px-8 text-sm font-medium text-background disabled:opacity-40"
        >
          {submitting ? 'Going live…' : 'Finish · Go live'}
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

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function NavRow({
  onBack,
  onNext,
  disabled,
}: {
  onBack: () => void;
  onNext: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onBack}
        className="h-11 rounded-full border border-border px-6 text-sm font-medium hover:bg-muted"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="h-11 rounded-full bg-foreground px-7 text-sm font-medium text-background disabled:opacity-40"
      >
        Continue →
      </button>
    </div>
  );
}
