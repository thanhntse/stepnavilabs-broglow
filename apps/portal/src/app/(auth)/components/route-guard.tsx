"use client";

import { protectedRoutes, publicOnlyRoutes } from "@/utils/auth-routes";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  const authCheck = useCallback(
    (path: string) => {
      const token = localStorage.getItem("token");
      const isAuthenticated = !!token;

      if (protectedRoutes.some((route) => path.startsWith(route))) {
        if (!isAuthenticated) {
          setAuthorized(false);
          router.push(`/login?returnUrl=${encodeURIComponent(path)}`);
          return;
        }
      }

      if (publicOnlyRoutes.some((route) => path.startsWith(route))) {
        if (isAuthenticated) {
          setAuthorized(false);
          router.push("/");
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
