import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role Supabase client — SERVER ONLY.
 * Bypasses Row Level Security. Use exclusively in trusted server code
 * (Server Actions / Route Handlers) for privileged writes: creating orders,
 * decrementing stock, admin dashboard mutations, newsletter reads, etc.
 *
 * The `server-only` import throws at build time if this is ever imported
 * into a Client Component.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set — add it to .env.local (server only).",
    );
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
