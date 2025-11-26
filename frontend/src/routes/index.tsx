import About from "@/pages/About";
import AnnouncementDetailPage from "@/pages/AnnouncementDetailPage";
import AnnouncementsPage from "@/pages/AnnouncementsPage";
import ComplaintCreatePage from "@/pages/complaints/ComplaintCreatePage";
import ComplaintDetailPage from "@/pages/complaints/ComplaintDetailPage";
import ComplaintsListPage from "@/pages/complaints/ComplaintsListPage";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";
import FeesPage from "@/pages/FeesPage";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import MessPage from "@/pages/MessPage";
import Signup from "@/pages/Signup";
import TransitPage from "@/pages/TransitPage";
import { Route, Routes } from "react-router-dom";
import OnlyGuests from "./guards/OnlyGuests";
import RequireAuth from "./guards/RequireAuth";
import StudentOnly from "./guards/StudentOnly";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/login"
        element={
          <OnlyGuests>
            <Login />
          </OnlyGuests>
        }
      />
      <Route
        path="/signup"
        element={
          <OnlyGuests>
            <Signup />
          </OnlyGuests>
        }
      />
      <Route
        path="/complaints"
        element={
          <RequireAuth>
            <ComplaintsListPage />
          </RequireAuth>
        }
      />
      <Route
        path="/complaints/new"
        element={
          <StudentOnly>
            <ComplaintCreatePage />
          </StudentOnly>
        }
      />
      <Route
        path="/complaints/:id"
        element={
          <RequireAuth>
            <ComplaintDetailPage />
          </RequireAuth>
        }
      />
      <Route path="/mess" element={<MessPage />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />
      <Route path="/announcements/:id" element={<AnnouncementDetailPage />} />
      <Route path="/transit" element={<TransitPage />} />
      <Route
        path="/fees"
        element={
          <RequireAuth>
            <FeesPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
