import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteCookie, getCookie } from "./app/services/auth/tokenHeaders";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  UserRole,
} from "./lib/authUtils";
import jwt, { JwtPayload } from "jsonwebtoken";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  const pathname = request.nextUrl.pathname;

  const accessToken = (await getCookie("accessToken")) || null;

  let userRole: UserRole | null = null;

  if (accessToken) {
    const verifiedToken: JwtPayload | string = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET as string,
    );
    if (typeof verifiedToken === "string") {
      // cookieStore.delete("accessToken");
      // cookieStore.delete("refreshToken");
      await deleteCookie("accessToken");
      await deleteCookie("refreshToken");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    userRole = verifiedToken.role;
  }

  const routeOwner = getRouteOwner(pathname);

  const isAuth = isAuthRoute(pathname);

  // Rule 1: logged in user trying to access auth route.
  if (accessToken && isAuth) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
    );
  }

  // Rule 2: user want to use publice route
  if (routeOwner === null) {
    return NextResponse.next();
  }

  if (!accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  //Rule 3 : user want to use ....
  if (routeOwner === "COMMON") {
    return NextResponse.next();
  }

  if (
    routeOwner === "ADMIN" ||
    routeOwner === "SUPER_ADMIN" ||
    routeOwner === "USER"
  ) {
    if (userRole !== routeOwner) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
