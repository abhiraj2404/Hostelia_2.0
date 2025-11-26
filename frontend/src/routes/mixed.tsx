import { Route } from "react-router-dom";
import AnnouncementDetailPage from "@/pages/AnnouncementDetailPage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import MessPage from "@/pages/MessPage";
import TransitPage from "@/pages/TransitPage";

export const MixedRoutes = () => (
  <>
    <Route path="/mess" element={<MessPage />} />
    <Route path="/announcements" element={<AnnouncementsPage />} />
    <Route
      path="/announcements/:id"
      element={<AnnouncementDetailPage />}
    />
    <Route path="/transit" element={<TransitPage />} />
  </>
);

