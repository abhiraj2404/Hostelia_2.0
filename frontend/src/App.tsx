import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import { SidebarLayout } from "./components/layout/SidebarLayout";
import { useAppSelector } from "./hooks";
import About from "./pages/About";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import ComplaintCreatePage from "./pages/complaints/ComplaintCreatePage";
import ComplaintDetailPage from "./pages/complaints/ComplaintDetailPage";
import ComplaintsListPage from "./pages/complaints/ComplaintsListPage";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MessPage from "./pages/MessPage";
import Signup from "./pages/Signup";
import TransitPage from "./pages/TransitPage";

function App() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const role = user?.role;

  const requireAuth = (component: ReactNode) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return component;
  };

  const onlyGuests = (component: ReactNode) => {
    if (isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return component;
  };

  const studentOnly = (component: ReactNode) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    if (role !== "student") {
      return <Navigate to="/" replace />;
    }
    return component;
  };

  return (
    <SidebarLayout>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={requireAuth(<Dashboard />)} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={onlyGuests(<Login />)} />
            <Route path="/signup" element={onlyGuests(<Signup />)} />

            <Route path="/complaints" element={requireAuth(<ComplaintsListPage />)} />
            <Route path="/complaints/new" element={studentOnly(<ComplaintCreatePage />)} />
            <Route path="/complaints/:id" element={requireAuth(<ComplaintDetailPage />)} />
            <Route path="/mess" element={<MessPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/transit" element={<TransitPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </SidebarLayout>
  );
}

export default App;
