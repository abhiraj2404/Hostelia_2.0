import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Home from "./components/Home";
import Contacts from "./components/Contacts";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Layout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
  </>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/contact" element={<Contacts />} />
        </Route>
        {/* <Route path="/other" element={<OtherComponent/>} /> */}
        {/* optional 404: <Route path="*" element={<NotFound/>} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
