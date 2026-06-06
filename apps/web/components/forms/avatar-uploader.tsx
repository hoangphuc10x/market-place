'use client';

import { useRef, useState } from 'react';
import { Loader2, UploadCloud, X } from 'lucide-react';

interface AvatarUploaderProps {
  /** Current image URL ('' = none). */
  url: string;
  onChange: (url: string) => void;
  /** Text used for the initials fallback (first char). */
  fallback: string;
  label: string;
  uploadLabel: string;
  changeLabel: string;
  removeLabel: string;
  hint?: string;
  /** Optional bg color for the initials circle (defaults to the foreground swatch). */
  fallbackColor?: string;
}

/**
 * Circular single-image uploader used for the account avatar and the shop logo.
 *
 * Click the circle or the "Upload" button → picks a file → POSTs to /api/uploads
 * (same proxy the product uploader uses) → stores the returned URL via onChange.
 * The value still saves through the parent form; this only sets the URL.
 */
export function AvatarUploader({
  url,
  onChange,
  fallback,
  label,
  uploadLabel,
  changeLabel,
  removeLabel,
  hint,
  fallbackColor,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initials = fallback.trim().slice(0, 1).toUpperCase() || 'U';

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Upload failed (${res.status})`);
      }
      const data = (await res.json()) as { url: string };
      onChange(data.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-muted disabled:opacity-60"
        aria-label={url ? changeLabel : uploadLabel}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className={
              fallbackColor
                ? 'flex h-full w-full items-center justify-center text-3xl font-semibold text-white'
                : 'flex h-full w-full items-center justify-center bg-foreground text-3xl font-semibold text-background'
            }
            style={fallbackColor ? { backgroundColor: fallbackColor } : undefined}
          >
            {initials}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>
      </button>

      <div className="flex-1 space-y-1.5">
        <span className="block text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm hover:bg-muted disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            {url ? changeLabel : uploadLabel}
          </button>
          {url && !uploading && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
              {removeLabel}
            </button>
          )}
        </div>
        {(error ?? hint) && <p className="text-xs text-muted-foreground">{error ?? hint}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
