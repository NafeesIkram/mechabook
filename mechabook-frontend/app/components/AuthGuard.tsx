"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileNav, Topbar } from "./MobileNav";

type AuthGuardProps = {
  children: ReactNode;
};

const publicRoutes = ["/login", "/register", "/admin/login"];

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = () => {
      try {
        const token = localStorage.getItem("mechabook-token");
        const userRaw = localStorage.getItem("mechabook-user");

        const isPublic = publicRoutes.includes(pathname);

        // Login/register/admin-login pages don't need authentication
        if (isPublic) {
          if (!cancelled) {
            setChecking(false);
          }
          return;
        }

        // No login information
        if (!token || !userRaw) {
          if (pathname.startsWith("/admin")) {
            router.replace("/admin/login");
          } else {
            router.replace("/login");
          }

          return;
        }

        // Check stored user
        let user;

        try {
          user = JSON.parse(userRaw);
        } catch {
          localStorage.removeItem("mechabook-token");
          localStorage.removeItem("mechabook-user");

          if (pathname.startsWith("/admin")) {
            router.replace("/admin/login");
          } else {
            router.replace("/login");
          }

          return;
        }

        // Admin route protection
        if (pathname.startsWith("/admin") && !user?.is_admin) {
          router.replace("/login");
          return;
        }

        if (!cancelled) {
          setChecking(false);
        }
      } catch (error) {
        console.error("AuthGuard error:", error);

        if (!cancelled) {
          setChecking(false);
        }
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking) {
    return (
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#08080d",
          color: "#92929f",
          fontSize: "15px",
        }}
      >
        Loading Mechabook...
      </div>
    );
  }

  // Public pages
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // Admin pages have their own layout
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  // Normal authenticated layout
  return (
    <div className="shell">
      <Sidebar />
      <Topbar />

      <main className="main">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}