import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAppSelector } from "@/hooks";

type StudentOnlyProps = { children: ReactNode };

function StudentOnly({ children }: StudentOnlyProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const role = user?.role;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "student") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default StudentOnly;

