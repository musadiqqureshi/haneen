"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Star, PenLine, CheckCircle2, AlertCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { submitReviewAction, type ReviewState } from "@/lib/reviews/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="dark" size="md" disabled={pending}>
      {pending ? "Posting…" : "Post Review"}
    </Button>
  );
}

export function ReviewComposer({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, action] = useActionState(submitReviewAction, {} as ReviewState);

  if (state.success) {
    return (
      <div className="mt-8 flex items-center gap-3 rounded-[3px] border border-gold-200 bg-gold-50/70 px-5 py-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-gold-600" />
        <p className="text-sm text-ink">
          Thank you — your review has been published. It may take a moment to
          appear.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-8">
        <Button variant="outline" size="md" onClick={() => setOpen(true)}>
          <PenLine className="h-4 w-4" /> Write a Review
        </Button>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="mt-8 rounded-[3px] border border-line bg-ivory p-6 sm:p-7"
    >
      <h3 className="font-display text-xl text-ink">Share your experience</h3>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />

      {state.error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-[2px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            {state.error}
            {state.needsAuth && (
              <>
                {" "}
                <Link
                  href={`/account/login?redirect=/product/${slug}`}
                  className="font-semibold underline underline-offset-2"
                >
                  Sign in
                </Link>
              </>
            )}
          </span>
        </div>
      )}

      {/* Stars */}
      <div className="mt-5">
        <label className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink">
          Your rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition-colors",
                  (hover || rating) >= n
                    ? "fill-gold-400 text-gold-400"
                    : "text-taupe",
                )}
              />
            </button>
          ))}
        </div>
        {state.fieldErrors?.rating && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.rating}</p>
        )}
      </div>

      {/* Title */}
      <label className="mt-5 block">
        <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink">
          Title
        </span>
        <input
          name="title"
          placeholder="Loved it!"
          className="h-11 w-full border border-line bg-ivory px-4 text-sm text-ink outline-none focus:border-gold-400"
        />
        {state.fieldErrors?.title && (
          <span className="mt-1 block text-xs text-red-500">
            {state.fieldErrors.title}
          </span>
        )}
      </label>

      {/* Body */}
      <label className="mt-4 block">
        <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink">
          Your review
        </span>
        <textarea
          name="body"
          rows={4}
          placeholder="Tell us about the fabric, fit and finish…"
          className="w-full resize-none border border-line bg-ivory px-4 py-3 text-sm text-ink outline-none focus:border-gold-400"
        />
        {state.fieldErrors?.body && (
          <span className="mt-1 block text-xs text-red-500">
            {state.fieldErrors.body}
          </span>
        )}
      </label>

      {/* Location (optional) */}
      <label className="mt-4 block">
        <span className="mb-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-ink">
          City <span className="text-ink-muted">(optional)</span>
        </span>
        <input
          name="location"
          placeholder="Lahore"
          className="h-11 w-full max-w-xs border border-line bg-ivory px-4 text-sm text-ink outline-none focus:border-gold-400"
        />
      </label>

      <div className="mt-6 flex items-center gap-3">
        <SubmitBtn />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs uppercase tracking-[0.16em] text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
