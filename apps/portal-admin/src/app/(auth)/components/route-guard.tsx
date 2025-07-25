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
  const [loading, setLoading] = useState(true);

  const authCheck = useCallback(
    async (path: string) => {
      const token = TokenStorage.getTokens()?.token;
      const isAuthenticated = !!token;

      // Handle root route - redirect to dashboard if authenticated
      if (path === "/") {
        if (isAuthenticated) {
          setAuthorized(true);
        } else {
          router.push(DEFAULT_PUBLIC_ROUTE);
        }
        setLoading(false);
        return;
      }

      if (protectedRoutes.some((route) => {
        // Handle exact match and startsWith for protected routes
        return path === route || (route !== '/' && path.startsWith(route));
      })) {
        if (!isAuthenticated) {
          setAuthorized(false);
          router.push(`${DEFAULT_PUBLIC_ROUTE}?returnUrl=${encodeURIComponent(path)}`);
          setLoading(false);
          return;
        }

        // Check for admin role
        try {
          const userProfile = await AuthService.getUserProfile();
          if (!userProfile.roles.some((role) => role.name === "admin")) {
            setAuthorized(false);
            TokenStorage.clearTokens(); // Clear tokens if not admin
            router.push(`${DEFAULT_PUBLIC_ROUTE}?message=unauthorized`);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error("Admin check failed:", error);
          setAuthorized(false);
          TokenStorage.clearTokens();
          router.push(`${DEFAULT_PUBLIC_ROUTE}?message=unauthorized`);
          setLoading(false);
          return;
        }
      }

      if (publicOnlyRoutes.some((route) => path.startsWith(route))) {
        if (isAuthenticated) {
          setAuthorized(false);
          router.push(DEFAULT_AUTH_ROUTE);
          setLoading(false);
          return;
        }
      }

      setAuthorized(true);
      setLoading(false);
    },
    [router]
  );

  useEffect(() => {
    authCheck(pathname);
  }, [pathname, authCheck]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
