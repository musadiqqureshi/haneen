"use client";

import { useRef, useState, useTransition } from "react";
import { Download, Upload, Loader2 } from "lucide-react";
import { importProductsCsvAction, type ImportResult } from "@/lib/admin/import";

export function ImportExport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  function onFile(file: File) {
    setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    start(async () => setResult(await importProductsCsvAction(fd)));
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <a
          href="/admin/products/export"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-gold-300 hover:text-ink"
        >
          <Download className="h-4 w-4" /> Export
        </a>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-white px-4 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-gold-300 hover:text-ink disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Import
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {result && (
        <div className="max-w-xs rounded-md border border-line bg-white px-3 py-2 text-xs">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <p className="text-ink-soft">
              <span className="font-medium text-green-700">
                {result.created} created
              </span>
              , {result.updated} updated
              {result.skipped ? `, ${result.skipped} skipped` : ""}.
              {result.errors && result.errors.length > 0 && (
                <span className="mt-1 block text-red-500">
                  {result.errors.join("; ")}
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
