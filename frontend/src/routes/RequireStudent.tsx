import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/hooks";

interface RequireStudentProps {
  children: ReactNode;
}

/**
 * Route guard that requires user to be authenticated and have student role
 * Redirects to login if not authenticated, or home if not a student
 */
export function RequireStudent({ children }: RequireStudentProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.role !== "student") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

