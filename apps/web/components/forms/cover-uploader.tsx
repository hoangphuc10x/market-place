'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, UploadCloud, X } from 'lucide-react';

interface CoverUploaderProps {
  /** Current image URL ('' = none). */
  url: string;
  onChange: (url: string) => void;
  label: string;
  uploadLabel: string;
  changeLabel: string;
  removeLabel: string;
  /** Placeholder for the "or paste a URL" input. */
  urlPlaceholder?: string;
}

/**
 * Wide 16:9 single-image uploader for the storefront cover. Mirrors the upload
 * flow used by {@link AvatarUploader} (POST /api/uploads → URL via onChange) but
 * lays out as a banner-shaped dropzone. A URL field is kept underneath so a
 * remote image can still be pasted instead of uploaded.
 */
export function CoverUploader({
  url,
  onChange,
  label,
  uploadLabel,
  changeLabel,
  removeLabel,
  urlPlaceholder,
}: CoverUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="space-y-2">
      <span className="block text-sm font-medium">{label}</span>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted disabled:opacity-60"
        aria-label={url ? changeLabel : uploadLabel}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus className="h-7 w-7" />
            <span className="text-sm">{uploadLabel}</span>
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

      <input
        value={url}
        onChange={(e) => onChange(e.target.value)}
        className="input font-mono text-xs"
        placeholder={urlPlaceholder ?? 'https://...'}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

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
