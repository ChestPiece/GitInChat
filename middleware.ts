import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Routes that don't require authentication
const publicRoutes = ["/", "/auth/login", "/auth/signup", "/auth/error"];

// Routes that require authentication
const protectedRoutes = ["/chat", "/profile", "/settings", "/api/chat", "/api/webhooks"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Allow OAuth callback without session
  if (pathname === "/auth/callback") {
    return NextResponse.next();
  }

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Verify session for protected routes
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if trying to access protected route without auth
  if (!session && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Check GitHub token availability for API routes
  if (pathname.startsWith("/api/") && !pathname.includes("/auth")) {
    if (!session?.provider_token) {
      return new Response(
        JSON.stringify({ error: "GitHub token missing" }),
        { status: 401, headers: { "content-type": "application/json" } }
      );
    }
  }

  // Add security headers to response
  const response = NextResponse.next();
  
  // CSRF protection: add token to response headers
  const csrfToken = crypto.getRandomValues(new Uint8Array(16)).toString();
  response.headers.set("X-CSRF-Token", csrfToken);
  
  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
