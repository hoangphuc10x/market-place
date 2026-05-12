import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signup } from '@/lib/api/auth';
import { setAuthCookie } from '@/lib/session';
import { signupInputSchema } from '@threadly/types';

export const metadata = { title: 'Sign up' };

async function signupAction(formData: FormData) {
  'use server';
  const parsed = signupInputSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
  });
  if (!parsed.success) return;
  const res = await signup(parsed.data);
  await setAuthCookie(res.accessToken);
  redirect('/seller/onboarding');
}

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Join Threadly</h1>
      <p className="mt-2 text-muted-foreground">Free. Takes a minute.</p>
      <form action={signupAction} className="mt-8 space-y-4">
        <Field label="Display name" name="displayName" required minLength={1} maxLength={60} />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required minLength={8} />
        <button
          type="submit"
          className="h-11 w-full rounded-full bg-foreground text-sm font-medium text-background hover:opacity-90"
        >
          Create account
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already a member?{' '}
        <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
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
