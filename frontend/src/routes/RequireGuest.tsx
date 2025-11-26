import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/hooks";

interface RequireGuestProps {
  children: ReactNode;
}

/**
 * Route guard that redirects authenticated users to home page
 * Use this for login/signup pages that should only be accessible to guests
 */
export function RequireGuest({ children }: RequireGuestProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

