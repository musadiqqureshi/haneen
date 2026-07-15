import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { isSupabaseConfigured } from "./env";

/** Routes that require a signed-in user. */
const PROTECTED = ["/account", "/admin", "/wishlist"];
/** Routes that require an admin. */
const ADMIN_ONLY = ["/admin"];
/** Public account routes — never gated, even though they live under /account. */
const PUBLIC_ACCOUNT = [
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  "/account/reset-password",
];
/** Auth pages a signed-in user should be redirected away from. */
const AUTH_PAGES = ["/account/login", "/account/register"];

/**
 * Refreshes the Supabase auth session on every request and guards
 * protected / admin routes. Wired up from src/middleware.ts.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Before Supabase keys are configured, run as a plain storefront: no auth,
  // no route protection. Everything still renders from mock data.
  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token with Supabase (do not trust
  // getSession() in middleware).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicAccount = PUBLIC_ACCOUNT.some((p) => pathname.startsWith(p));
  const isProtected =
    PROTECTED.some((p) => pathname.startsWith(p)) && !isPublicAccount;
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Not signed in → bounce protected routes to login (preserve return path).
  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/account/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Signed in but hitting login/register → send to account.
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Admin gate.
  if (user && ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
