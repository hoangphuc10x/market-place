'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { User } from '@threadly/types';
import { AvatarUploader } from '@/components/forms/avatar-uploader';
import { updateProfileAction } from '@/app/actions/auth';

export function ProfileForm({ viewer }: { viewer: User }) {
  const t = useTranslations('account');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(viewer.displayName);
  const [avatarUrl, setAvatarUrl] = useState(viewer.avatarUrl ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateProfileAction({
          displayName,
          avatarUrl: avatarUrl.trim() || null,
        });
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2500);
      } catch (e) {
        setError((e as Error).message);
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Avatar preview + upload */}
      <AvatarUploader
        url={avatarUrl}
        fallback={displayName}
        onChange={setAvatarUrl}
        label={t('avatarUrl')}
        hint={t('avatarHint')}
        uploadLabel={t('avatarUpload')}
        changeLabel={t('avatarChange')}
        removeLabel={t('avatarRemove')}
      />

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t('displayName')}</span>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={60}
          required
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t('email')}</span>
        <input
          value={viewer.email}
          disabled
          className="h-11 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground"
        />
      </label>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-600">{t('saved')}</span>}
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-foreground px-6 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? t('saving') : t('save')}
        </button>
      </div>
    </form>
  );
}
