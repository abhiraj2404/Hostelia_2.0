import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/hooks";

type OnlyGuestsProps = { children: ReactNode };

function OnlyGuests({ children }: OnlyGuestsProps) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default OnlyGuests;

