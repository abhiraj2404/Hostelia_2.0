import React from "react";
import { useState, useEffect } from "react";
import { Menu, X, Building2, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "/contact", isRoute: true },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogin = () => {
    // Login functionality will be implemented
    console.log("Login clicked");
  };

  const handleSignup = () => {
    // Signup functionality will be implemented
    console.log("Sign up clicked");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => scrollToSection("#home")}
          >
            <Building2
              className={`w-8 h-8 ${
                isScrolled ? "text-[#4a90e2]" : "text-white"
              }`}
            />
            <span
              className={`text-2xl font-bold ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Hostelia
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`font-semibold transition-colors hover:text-[#4a90e2] ${
                    isScrolled ? "text-gray-700" : "text-white"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => scrollToSection(item.href)}
                  className={`font-semibold transition-colors hover:text-[#4a90e2] ${
                    isScrolled ? "text-gray-700" : "text-white"
                  }`}
                >
                  {item.label}
                </button>
              )
            )}

            {/* Desktop Auth Buttons */}
            <div className="flex items-center space-x-3 ml-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  isScrolled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(74, 144, 226, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignup}
                className="flex items-center space-x-2 px-5 py-2 bg-[#4a90e2] text-white rounded-lg font-semibold shadow-lg hover:bg-[#357abd] transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${
              isScrolled ? "text-gray-900" : "text-white"
            }`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 bg-white rounded-lg shadow-xl overflow-hidden"
            >
              {navItems.map((item, index) =>
                item.isRoute ? (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-[#4a90e2] hover:text-white transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <motion.button
                    key={item.label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => scrollToSection(item.href)}
                    className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-[#4a90e2] hover:text-white transition-colors"
                  >
                    {item.label}
                  </motion.button>
                )
              )}

              {/* Mobile Auth Buttons */}
              <div className="border-t border-gray-200 p-4 space-y-3">
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.1 }}
                  onClick={handleLogin}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-gray-700 border-2 border-gray-300 rounded-lg font-semibold hover:border-[#4a90e2] hover:text-[#4a90e2] transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </motion.button>

                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: (navItems.length + 1) * 0.1 }}
                  onClick={handleSignup}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-[#4a90e2] text-white rounded-lg font-semibold shadow-lg hover:bg-[#357abd] transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
