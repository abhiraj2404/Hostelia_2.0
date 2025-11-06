import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAppSelector } from "@/hooks";

type RequireAuthProps = { children: ReactNode };

function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export default RequireAuth;
