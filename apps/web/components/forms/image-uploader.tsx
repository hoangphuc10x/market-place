'use client';

import { useRef, useState } from 'react';
import { Loader2, Plus, X, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  className?: string;
  /** Where the file POSTs. Defaults to the Next proxy that forwards to the API. */
  uploadUrl?: string;
}

/**
 * Multi-image uploader.
 *
 * - Click the dashed tile OR drag files anywhere on the grid to add.
 * - Files upload in parallel; thumbnails show a spinner until done.
 * - Per-thumbnail × removes from the value list.
 * - Respects `max` (default 12) — extra files are silently dropped to fit.
 *
 * Value is a list of URLs (strings). When we add real R2/Drive storage, only
 * the `uploadUrl` target changes — this component stays the same.
 */
export function ImageUploader({
  value,
  onChange,
  max = 12,
  className,
  uploadUrl = '/api/uploads',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const remaining = max - value.length;

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const list = Array.from(files).slice(0, remaining);
    if (list.length === 0) return;

    setUploadingCount(list.length);
    try {
      const urls = await Promise.all(
        list.map(async (file) => {
          const fd = new FormData();
          fd.append('file', file);
          const res = await fetch(uploadUrl, { method: 'POST', body: fd });
          if (!res.ok) {
            const text = await res.text().catch(() => '');
            throw new Error(text || `Upload failed (${res.status})`);
          }
          const data = (await res.json()) as { url: string };
          return data.url;
        }),
      );
      onChange([...value, ...urls]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploadingCount(0);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div
      className={cn('space-y-2', className)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div
        className={cn(
          'grid grid-cols-3 gap-2 rounded-lg border-2 border-dashed p-2 transition sm:grid-cols-4 md:grid-cols-5',
          dragOver ? 'border-foreground bg-muted/40' : 'border-border bg-transparent',
        )}
      >
        {value.map((url, i) => (
          <Thumbnail key={`${url}-${i}`} url={url} onRemove={() => removeAt(i)} />
        ))}

        {/* Upload-in-progress placeholders */}
        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div
            key={`up-${i}`}
            className="flex aspect-[4/5] items-center justify-center rounded-md bg-muted"
          >
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ))}

        {/* Add tile */}
        {value.length + uploadingCount < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-foreground hover:bg-muted/50 hover:text-foreground"
            aria-label="Add image"
          >
            {value.length === 0 && uploadingCount === 0 ? (
              <>
                <UploadCloud className="h-5 w-5" />
                <span className="text-[11px]">Click or drag</span>
              </>
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          // Reset so picking the same file again still fires onChange.
          e.target.value = '';
        }}
      />

      <p className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {value.length}/{max} images · max 8 MB each
        </span>
        {error && <span className="text-destructive">{error}</span>}
      </p>
    </div>
  );
}

function Thumbnail({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100"
        aria-label="Remove"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
