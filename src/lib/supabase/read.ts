import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Anonymous read-only Supabase client (no session/cookies). Works in both
 * Server Components and the browser, and in generateStaticParams/Metadata
 * where cookies aren't available. Storefront data is public via RLS.
 */
let cached: SupabaseClient<Database> | null = null;

export function readClient(): SupabaseClient<Database> {
  if (cached) return cached;
  cached = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  return cached;
}
