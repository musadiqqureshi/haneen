import { Star, BadgeCheck } from "lucide-react";
import type { Product } from "@/types";
import { getReviews, ratingBreakdown } from "@/lib/data/reviews";
import { readClient } from "@/lib/supabase/read";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ReviewComposer } from "@/components/product/review-composer";
import { cn } from "@/lib/utils";

interface DisplayReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  size?: string;
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-gold-500", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < Math.round(rating) ? "fill-current" : "text-taupe",
          )}
        />
      ))}
    </span>
  );
}

const AVATAR_TINTS = ["#e7d4b4", "#f7e7e6", "#d8cfc4", "#f3ead9", "#cfd8bd", "#e8d3cf"];

function relativeDate(iso: string): string {
  const d = new Date(iso).getTime();
  const days = Math.floor((Date.now() - d) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${days < 60 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

/** Real reviews from the DB, blended with seeded placeholders to stay lively. */
async function loadReviews(product: Product): Promise<DisplayReview[]> {
  let real: DisplayReview[] = [];
  if (isSupabaseConfigured()) {
    const { data } = await readClient()
      .from("reviews")
      .select("id,author_name,location,rating,title,body,size,verified,created_at")
      .eq("product_id", product.id)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(20);
    real = (data ?? []).map((r) => ({
      id: r.id,
      author: r.author_name,
      location: r.location ?? "",
      rating: r.rating,
      title: r.title ?? "",
      body: r.body ?? "",
      date: relativeDate(r.created_at),
      verified: r.verified,
      size: r.size ?? undefined,
    }));
  }
  const need = Math.max(0, 5 - real.length);
  const seeded = need > 0 ? getReviews(product, need) : [];
  return [...real, ...seeded];
}

export async function ProductReviews({ product }: { product: Product }) {
  const reviews = await loadReviews(product);
  const breakdown = ratingBreakdown(product); // [5★,4★,3★,2★,1★]
  const total = product.reviewCount || reviews.length;

  return (
    <section id="reviews" className="border-t border-line bg-ivory py-16 sm:py-20">
      <div className="container-lux">
        <div className="mb-10">
          <p className="eyebrow">Loved by our community</p>
          <h2 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
            Customer Reviews
          </h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
          {/* Summary */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex items-end gap-3">
              <span className="font-display text-5xl leading-none text-ink">
                {product.rating.toFixed(1)}
              </span>
              <span className="pb-1 text-sm text-ink-muted">out of 5</span>
            </div>
            <Stars rating={product.rating} className="mt-3" />
            <p className="mt-2 text-sm text-ink-soft">
              Based on {total} verified {total === 1 ? "review" : "reviews"}
            </p>

            <div className="mt-6 space-y-2">
              {breakdown.map((count, i) => {
                const stars = 5 - i;
                const pct = total ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="flex w-10 items-center gap-1 text-ink-soft">
                      {stars}
                      <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                    </span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <span
                        className="block h-full rounded-full bg-gold-400"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="w-8 text-right text-ink-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Review list + composer */}
          <div>
            <div className="divide-y divide-line">
              {reviews.map((r, i) => (
                <article key={r.id} className="flex gap-4 py-7 first:pt-0">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-base text-ink/80"
                    style={{ backgroundColor: AVATAR_TINTS[i % AVATAR_TINTS.length] }}
                    aria-hidden="true"
                  >
                    {r.author.charAt(0)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm font-semibold text-ink">{r.author}</span>
                      {r.verified && (
                        <span className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-gold-600">
                          <BadgeCheck className="h-3.5 w-3.5" /> Verified Buyer
                        </span>
                      )}
                      {r.location && (
                        <span className="text-[0.68rem] text-ink-muted">· {r.location}</span>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-3">
                      <Stars rating={r.rating} />
                      <span className="text-[0.68rem] uppercase tracking-[0.1em] text-ink-muted">
                        {r.date}
                      </span>
                    </div>

                    <h3 className="mt-3 font-serif text-lg italic leading-snug text-ink">
                      {r.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{r.body}</p>
                    {r.size && (
                      <p className="mt-3 text-[0.68rem] uppercase tracking-[0.12em] text-ink-muted">
                        Size purchased: {r.size}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <ReviewComposer productId={product.id} slug={product.slug} />
          </div>
        </div>
      </div>
    </section>
  );
}
