export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

// exact:
// patterns :

export type RouteConfig = {
  exact: string[];
  patterns: RegExp[];
};

export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const commonProtectedRoutes: RouteConfig = {
  exact: ["/myProfile", "/settings", "/change-password"],
  patterns: [],
};

export const superAdminProtectedRoutes: RouteConfig = {
  // patterns: [/^\/superAdmin/],
  patterns: [/^\/superAdmin(?:\/|$)/],
  exact: [],
};

export const adminProtectedRoutes: RouteConfig = {
  // patterns: [/^\/admin/],
  patterns: [/^\/admin(?:\/|$)/],
  exact: [],
};

export const userProtectedRoutes: RouteConfig = {
  // patterns: [/^\/dashboard/],
  patterns: [/^\/dashboard(?:\/|$)/],
  exact: [],
};

export const isAuthRoute = (pathname: string) => {
  return authRoutes.some((route: string) => route === pathname);
};

export const isRouteMatches = (
  pathname: string,
  routes: RouteConfig,
): boolean => {
  if (routes.exact.includes(pathname)) {
    return true;
  }
  return routes.patterns.some((pattern: RegExp) => pattern.test(pathname));
};

export const getRouteOwner = (
  pathname: string,
): "ADMIN" | "USER" | "SUPER_ADMIN" | "COMMON" | null => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  }
  if (isRouteMatches(pathname, superAdminProtectedRoutes)) {
    return "SUPER_ADMIN";
  }
  if (isRouteMatches(pathname, userProtectedRoutes)) {
    return "USER";
  }
  if (isRouteMatches(pathname, commonProtectedRoutes)) {
    return "COMMON";
  }
  return null;
};

export const getDefaultDashboardRoute = (role: UserRole): string => {
  if (role === "ADMIN") {
    return "/admin/dashboard";
  }
  if (role === "SUPER_ADMIN") {
    return "/superAdmin/dashboard";
  }
  if (role === "USER") {
    return "/dashboard";
  }
  return "/";
};

export const isValidRedirectForRole = (
  redirectPath: string,
  role: UserRole,
): boolean => {
  const routeOwner = getRouteOwner(redirectPath);
  if (routeOwner === null || routeOwner === "COMMON") {
    return true;
  }
  if (routeOwner === role) {
    return true;
  }
  return false;
};

/**
 * NEED TO CHANGE => DONT UNDERSTAND : 
 * 
 * Before using a user supplied redirect, ensure it is a local path. Your current getRouteOwner() returns null for an external URL, which makes isValidRedirectForRole() return true:
 * 
 * export const isValidRedirectForRole = (
  redirectPath: string,
  role: UserRole
): boolean => {
  if (
    !redirectPath.startsWith("/") ||
    redirectPath.startsWith("//") ||
    redirectPath.includes("\\")
  ) {
    return false;
  }

  const pathname = new URL(redirectPath, "http://localhost").pathname;
  const routeOwner = getRouteOwner(pathname);

  return routeOwner === null ||
    routeOwner === "COMMON" ||
    routeOwner === role;
};
*/
