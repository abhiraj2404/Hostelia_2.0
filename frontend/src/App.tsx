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
import MessPage from "./pages/student/MessPage";

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
          <Route path="/student/mess" element={<MessPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
