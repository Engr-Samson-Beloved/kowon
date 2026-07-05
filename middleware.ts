import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile/edit",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for Supabase auth token in cookies
  // The vanilla @supabase/supabase-js stores tokens in localStorage (client-side only),
  // so for middleware we check for the sb-access-token cookie or redirect.
  // This is a lightweight check — full session validation happens client-side.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Look for any Supabase auth cookies
  const authCookies = request.cookies.getAll().filter(
    (cookie) => cookie.name.includes("sb-") && cookie.name.includes("auth-token")
  );

  if (authCookies.length === 0) {
    // No auth cookies found — redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/edit",
  ],
};
