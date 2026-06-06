'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { loginAction, type LoginFormState } from './actions';

const initialState: LoginFormState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const t = useTranslations('auth.login');
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t(state.error === 'credentials' ? 'errorCredentials' : 'errorGeneric')}
        </div>
      )}
      <Field label={t('email')} name="email" type="email" required />
      <Field label={t('password')} name="password" type="password" required />
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-full bg-foreground text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {pending ? `${t('submit')}…` : t('submit')}
      </button>
    </form>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...rest}
        className="mt-1.5 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
