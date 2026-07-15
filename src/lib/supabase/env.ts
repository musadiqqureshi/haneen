/**
 * Whether the public Supabase env vars are present. Lets the app run as a
 * storefront (mock data) before credentials are added, and lets auth-dependent
 * code degrade gracefully instead of throwing.
 */
export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
