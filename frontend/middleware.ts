// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   // Check for authentication token in cookies
//   const token = request.cookies.get("token")?.value;
//   const accessToken = request.cookies.get("access_token")?.value;
//   const isAuthenticated = !!(token && token.length > 0) || !!(accessToken && accessToken.length > 0);

//   // Protected routes that require authentication
//   const protectedRoutes = [
//     "/create-post",
//     "/dashboard",
//     "/generated-summary",
//     "/analytics"
//   ];

//   // Check if the current path matches any protected route
//   const isProtectedRoute = protectedRoutes.some(route =>
//     request.nextUrl.pathname.startsWith(route)
//   );

//   // If accessing protected route without authentication, redirect to login
//   if (isProtectedRoute && !isAuthenticated) {
//     console.log(`🚫 Unauthorized access attempt to: ${request.nextUrl.pathname}`);
//     console.log('🔍 Debug info:', {
//       hasToken: !!token,
//       tokenLength: token?.length || 0,
//       hasAccessToken: !!accessToken,
//       accessTokenLength: accessToken?.length || 0,
//       isAuthenticated,
//       allCookies: request.cookies.getAll().map(c => ({ name: c.name, length: c.value?.length || 0 }))
//     });

//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/create-post/:path*",
//     "/dashboard/:path*",
//     "/generated-summary/:path*",
//     "/analytics/:path*"
//   ],
// };



import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Skip middleware for login and logout pages to avoid redirect loops
  if (pathname.startsWith("/login") || pathname.startsWith("/logout")) {
    return NextResponse.next();
  }

  // ✅ Simplified authentication check
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("access_token")?.value;

  const isAuthenticated = Boolean(token);

  // ✅ Define protected routes
  const protectedRoutes = [
    "/create-post",
    "/dashboard",
    "/generated-summary",
    "/analytics",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // ✅ Redirect unauthenticated users
  if (isProtectedRoute && !isAuthenticated) {
    if (process.env.NODE_ENV === "development") {
      console.log(`🚫 Unauthorized access: ${pathname}`);
      console.log("🔍 Cookies found:", request.cookies.getAll().map(c => c.name));
    }

    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("expired", "true");
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Allow request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/create-post/:path*",
    "/dashboard/:path*",
    "/generated-summary/:path*",
    "/analytics/:path*",
  ],
};
