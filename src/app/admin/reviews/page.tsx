import { Star } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageTitle, StatusBadge } from "@/components/admin/ui";
import { ReviewModerate } from "@/components/admin/review-moderate";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const admin = createAdminClient();
  const { data: reviews } = await admin
    .from("reviews")
    .select(
      "id, product_id, author_name, location, rating, title, body, status, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  // Resolve product titles.
  const ids = [...new Set((reviews ?? []).map((r) => r.product_id))];
  const { data: products } = ids.length
    ? await admin.from("products").select("id, title").in("id", ids)
    : { data: [] };
  const titleById = new Map((products ?? []).map((p) => [p.id, p.title]));

  const pending = (reviews ?? []).filter((r) => r.status === "pending").length;

  return (
    <>
      <PageTitle
        title="Reviews"
        subtitle={`${reviews?.length ?? 0} total · ${pending} pending`}
      />

      {reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-line bg-ivory p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink">{r.author_name}</span>
                    <span className="inline-flex items-center gap-0.5 text-gold-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < r.rating ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5 text-taupe"
                          }
                        />
                      ))}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {titleById.get(r.product_id) ?? "Unknown product"}
                    {r.location ? ` · ${r.location}` : ""} ·{" "}
                    {new Date(r.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {r.title && (
                    <p className="mt-2 font-serif text-base italic text-ink">
                      {r.title}
                    </p>
                  )}
                  {r.body && (
                    <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
                  )}
                </div>
                <ReviewModerate id={r.id} status={r.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-ivory px-6 py-12 text-center text-ink-soft">
          No reviews yet.
        </p>
      )}
    </>
  );
}
