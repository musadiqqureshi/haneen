import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Note: Next 16 nudges toward the "proxy.ts" convention, but its proxy-export
// detection is unreliable in 16.2.x, so we keep the stable `middleware` export.
// The only side effect is a cosmetic deprecation warning in the dev log.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on all routes except static assets and images.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
