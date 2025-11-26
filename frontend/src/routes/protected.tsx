import { Route } from "react-router-dom";
import ComplaintDetailPage from "@/pages/complaints/ComplaintDetailPage";
import ComplaintsListPage from "@/pages/complaints/ComplaintsListPage";
import Dashboard from "@/pages/Dashboard";
import FeesPage from "@/pages/FeesPage";
import RequireAuth from "./guards/RequireAuth";

export const ProtectedRoutes = () => (
  <>
    <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
    <Route
      path="/complaints"
      element={<RequireAuth><ComplaintsListPage /></RequireAuth>}
    />
    <Route
      path="/complaints/:id"
      element={<RequireAuth><ComplaintDetailPage /></RequireAuth>}
    />
    <Route path="/fees" element={<RequireAuth><FeesPage /></RequireAuth>} />
  </>
);

