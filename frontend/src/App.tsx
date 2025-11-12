import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentComplaintDetailPage from "./pages/student/StudentComplaintDetailPage";
import StudentComplaintsPage from "./pages/student/StudentComplaintsPage";
import StudentNewComplaintPage from "./pages/student/StudentNewComplaintPage";
import MessPage from "./pages/MessPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import TransitPage from "./pages/TransitPage";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/student/complaints"
            element={<StudentComplaintsPage />}
          />
          <Route
            path="/student/complaints/new"
            element={<StudentNewComplaintPage />}
          />
          <Route
            path="/student/complaints/:id"
            element={<StudentComplaintDetailPage />}
          />
          <Route path="/mess" element={<MessPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/transit" element={<TransitPage />} />

          {/* Legacy routes - redirect to new paths */}
          <Route path="/student/mess" element={<Navigate to="/mess" replace />} />
          <Route path="/student/announcements" element={<Navigate to="/announcements" replace />} />
          <Route path="/student/entry-exit" element={<Navigate to="/transit" replace />} />
          <Route path="/warden/transit" element={<Navigate to="/transit" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
