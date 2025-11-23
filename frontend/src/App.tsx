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
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={onlyGuests(<Login />)} />
            <Route path="/signup" element={onlyGuests(<Signup />)} />

            <Route
              path="/complaints"
              element={requireAuth(<ComplaintsListPage />)}
            />
            <Route
              path="/complaints/new"
              element={studentOnly(<ComplaintCreatePage />)}
            />
            <Route
              path="/complaints/:id"
              element={requireAuth(<ComplaintDetailPage />)}
            />
            <Route path="/mess" element={<MessPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/transit" element={<TransitPage />} />

            {/* Legacy routes - redirect to new paths */}
            <Route
              path="/student/complaints"
              element={requireAuth(<ComplaintsListPage />)}
            />
            <Route
              path="/student/complaints/new"
              element={studentOnly(<ComplaintCreatePage />)}
            />
            <Route
              path="/student/complaints/:id"
              element={requireAuth(<ComplaintDetailPage />)}
            />
            <Route
              path="/student/mess"
              element={<Navigate to="/mess" replace />}
            />
            <Route
              path="/student/announcements"
              element={<Navigate to="/announcements" replace />}
            />
            <Route
              path="/student/entry-exit"
              element={<Navigate to="/transit" replace />}
            />
            <Route
              path="/warden/transit"
              element={<Navigate to="/transit" replace />}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </SidebarLayout>
  );
}

export default App;
