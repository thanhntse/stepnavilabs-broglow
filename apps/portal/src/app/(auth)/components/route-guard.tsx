"use client";

import { DEFAULT_AUTH_ROUTE, DEFAULT_PUBLIC_ROUTE, protectedRoutes, publicOnlyRoutes } from "@/utils/auth-routes";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TokenStorage } from "@/lib/token-storage";
import { AuthService } from "@/services/auth-service";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  const authCheck = useCallback(
    async (path: string) => {
      const token = TokenStorage.getTokens()?.token;
      const isAuthenticated = !!token;

      // Handle root route - allow everyone to access landing page
      if (path === "/") {
        setAuthorized(true);
        return;
      }

      if (protectedRoutes.some((route) => {
        // Handle exact match and startsWith for protected routes
        return path === route || (route !== '/' && path.startsWith(route));
      })) {
        if (!isAuthenticated) {
          setAuthorized(false);
          router.push(`${DEFAULT_PUBLIC_ROUTE}?returnUrl=${encodeURIComponent(path)}`);
          return;
        }

        // Check for admin role
        try {
          const isAdmin = await AuthService.isAdmin();
          if (!isAdmin) {
            setAuthorized(false);
            TokenStorage.clearTokens(); // Clear tokens if not admin
            router.push(`${DEFAULT_PUBLIC_ROUTE}?message=unauthorized`);
            return;
          }
        } catch (error) {
          console.error("Admin check failed:", error);
          setAuthorized(false);
          TokenStorage.clearTokens();
          router.push(`${DEFAULT_PUBLIC_ROUTE}?message=unauthorized`);
          return;
        }
      }

      if (publicOnlyRoutes.some((route) => path.startsWith(route))) {
        if (isAuthenticated) {
          setAuthorized(false);
          router.push(DEFAULT_AUTH_ROUTE);
          return;
        }
      }

      setAuthorized(true);
    },
    [router]
  );

  useEffect(() => {
    authCheck(pathname);
  }, [pathname, authCheck]);

  return authorized ? <>{children}</> : null;
}
