import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Ensures the current request is from a signed-in admin. Used in the admin
 * layout and every admin server action (defense in depth on top of middleware).
 * Redirects non-admins away.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");
  return { user, profile };
}
