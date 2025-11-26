import ComplaintCreatePage from "@/pages/complaints/ComplaintCreatePage";
import { Route } from "react-router-dom";
import StudentOnly from "./guards/StudentOnly";

export const ComplaintRoutes = () => (
  <>
    <Route
      path="/complaints/new"
      element={
        <StudentOnly>
          <ComplaintCreatePage />
        </StudentOnly>
      }
    />
  </>
);
