"use client";

import { DEFAULT_AUTH_ROUTE, DEFAULT_PUBLIC_ROUTE, protectedRoutes, publicOnlyRoutes } from "@/utils/auth-routes";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TokenStorage } from "@/lib/token-storage";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  const authCheck = useCallback(
    (path: string) => {
      const token = TokenStorage.getTokens()?.token;
      const isAuthenticated = !!token;

      // Handle root route for authenticated users
      if (path === "/" && isAuthenticated) {
        setAuthorized(false);
        router.push(DEFAULT_AUTH_ROUTE);
        return;
      }

      if (protectedRoutes.some((route) => {
        // Handle exact match for '/'
        if (route === '/' && path === '/') return true;
        // Handle others with startsWith
        if (route !== '/' && path.startsWith(route)) return true;
        return false;
      })) {
        if (!isAuthenticated) {
          setAuthorized(false);
          router.push(`${DEFAULT_PUBLIC_ROUTE}?returnUrl=${encodeURIComponent(path)}`);
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
