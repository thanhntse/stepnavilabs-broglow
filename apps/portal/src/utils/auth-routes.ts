export const protectedRoutes = [
  "/thread",
  "/thread/[id]",
  "/profile",
  "/recent-post",
  "/skin-profile",
  "/routine",
];

export const publicOnlyRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

export const DEFAULT_AUTH_ROUTE = "/thread";
export const DEFAULT_PUBLIC_ROUTE = "/";
