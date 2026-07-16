"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface ReviewState {
  error?: string;
  needsAuth?: boolean;
  success?: boolean;
  fieldErrors?: Record<string, string>;
}

const schema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Please choose a rating").max(5),
  title: z.string().trim().min(2, "Add a short title").max(120),
  body: z.string().trim().min(10, "Tell us a little more (min 10 chars)").max(2000),
  location: z.string().trim().max(80).optional(),
});

export async function submitReviewAction(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    slug: formData.get("slug"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
    location: formData.get("location") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (!fieldErrors[k]) fieldErrors[k] = issue.message;
    }
    return { fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      needsAuth: true,
      error: "Please sign in to share your review.",
    };
  }

  // Author name from profile (fallback to email handle).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();
  const authorName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "Verified Buyer";

  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    author_name: authorName,
    location: parsed.data.location ?? null,
    rating: parsed.data.rating,
    title: parsed.data.title,
    body: parsed.data.body,
    verified: true,
    status: "published",
  });

  if (error) {
    // A user may only review a product meaningfully; surface duplicates nicely.
    return { error: "Could not post your review. Please try again." };
  }

  revalidatePath(`/product/${parsed.data.slug}`);
  return { success: true };
}
