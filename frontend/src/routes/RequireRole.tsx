import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks";

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: ("admin" | "warden" | "student")[];
}

/**
 * Route guard that requires user to be authenticated and have one of the specified roles
 * Redirects to login if not authenticated, or home if role is not allowed
 */
export function RequireRole({ children, allowedRoles }: RequireRoleProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

