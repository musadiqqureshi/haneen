"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, Star, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { uploadImagesAction } from "@/lib/admin/media";
import { cn } from "@/lib/utils";

/**
 * Drag-and-drop product image manager. Uploads to Supabase Storage on drop,
 * supports reordering + remove, and emits the ordered URL list through a hidden
 * `images` field (newline-joined) that the product form already understands.
 */
export function ImageUploader({ initial = [] }: { initial?: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    list.forEach((f) => fd.append("files", f));
    const res = await uploadImagesAction(fd);
    if (res.error) setError(res.error);
    else if (res.urls) setUrls((prev) => [...prev, ...res.urls!]);
    setBusy(false);
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= urls.length) return;
    setUrls((prev) => {
      const next = [...prev];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x);
      return next;
    });
  };
  const remove = (i: number) => setUrls((prev) => prev.filter((_, n) => n !== i));

  return (
    <div>
      <input type="hidden" name="images" value={urls.join("\n")} />

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          upload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragOver
            ? "border-gold-400 bg-gold-50/60"
            : "border-line bg-beige/40 hover:border-gold-300",
        )}
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-gold-600" />
        ) : (
          <UploadCloud className="h-6 w-6 text-gold-600" strokeWidth={1.6} />
        )}
        <p className="text-sm text-ink">
          {busy ? "Uploading…" : "Drag & drop images, or click to browse"}
        </p>
        <p className="text-xs text-ink-muted">JPG, PNG, WebP · up to 8MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {/* Previews */}
      {urls.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {urls.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-line bg-beige"
            >
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/85 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-ivory">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-end justify-center gap-1 bg-gradient-to-t from-ink/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  title="Move left"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className="rounded bg-white/90 p-1 text-ink disabled:opacity-30"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Make cover"
                  onClick={() => move(i, 0)}
                  disabled={i === 0}
                  className="rounded bg-white/90 p-1 text-gold-700 disabled:opacity-30"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Move right"
                  onClick={() => move(i, i + 1)}
                  disabled={i === urls.length - 1}
                  className="rounded bg-white/90 p-1 text-ink disabled:opacity-30"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Remove"
                  onClick={() => remove(i)}
                  className="rounded bg-white/90 p-1 text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
