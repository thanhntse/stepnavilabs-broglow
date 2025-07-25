export const protectedRoutes = [
  "/dashboard",
  "/users",
  "/products",
  "/blogs",
  "/subscriptions",
  "/analytics",
  "/settings",
  "/notifications",
  "/roles",
  "/permissions",
  "/api-keys",
  "/email-templates",
  "/payments",
  "/reports"
];

export const publicOnlyRoutes = ["/login", "/forgot-password"];

export const DEFAULT_AUTH_ROUTE = "/dashboard";
export const DEFAULT_PUBLIC_ROUTE = "/login";
