import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/Studio",
    "/Profile",
    "/Library",
    "/Dashboard",
    "/billing",
    "/subscriptions",
    "/checkout/success",
    "/checkout/cancel",
    "/Signup/ProfileSetup", // Onboarding page requires authentication
  ]

  // Define auth routes that should redirect to Studio if user is already logged in
  const authRoutes = ["/Login", "/Signup"]

  // Define API routes that need authentication (exclude auth and webhook endpoints)
  const protectedApiRoutes = [
    "/api/clips",
    "/api/analytics",
    "/api/launch-plugin",
    "/api/stop-plugin",
    "/api/streamers",
    "/api/streams",
    "/api/uploadedClips",
    "/api/user/updateInfo",
    "/api/user/updateOnboardingStatus",
    "/api/user/updatePresets",
    "/api/user/getPresets",
    "/api/user/getClipCount",
    "/api/user/plugin_state",
    "/api/socialMediaHandles",
    "/api/socialMediaPlatforms",
    "/api/clipsFeed",
    "/api/checkout",
    "/api/portal",
    "/api/subscription",
  ]

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // Check if current path is an auth route
  // Exclude ProfileSetup from auth routes since authenticated users need to access it for onboarding
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) && !pathname.startsWith("/Signup/ProfileSetup")

  // Check if current path is a protected API route
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  // Redirect unauthenticated users from protected routes to login
  if ((isProtectedRoute || isProtectedApiRoute) && !session?.user) {
    if (isProtectedApiRoute) {
      return NextResponse.json(
        {
          confirmation: "fail",
          error: "Unauthorized - Please login to access this resource"
        },
        { status: 401 }
      )
    }
    const loginUrl = new URL("/Login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes to Studio
  // Note: The actual redirect logic (to ProfileSetup or Studio) is handled in the Login/Signup pages
  // based on onboarding status. This is just to prevent accessing login/signup when already logged in.
  // ProfileSetup is excluded from this check since authenticated users need to complete onboarding.
  if (isAuthRoute && session?.user) {
    return NextResponse.redirect(new URL("/Studio", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api/auth (NextAuth API routes)
     * - api/webhooks (Stripe webhooks)
     * - api/user/register (registration endpoint)
     * - api/instagram (OAuth callbacks - handle their own auth)
     * - api/youtube (OAuth callbacks - handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/auth|api/webhooks|api/user/register|api/instagram|api/youtube).*)",
  ],
}