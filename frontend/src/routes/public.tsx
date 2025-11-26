import { Route } from "react-router-dom";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";

export const PublicRoutes = () => (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
  </>
);

