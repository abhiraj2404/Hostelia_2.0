import { motion } from "framer-motion";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  const quickLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "FAQ", href: "#faq" },
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: "support@hostelia.com",
      href: "mailto:support@hostelia.com",
    },
    { icon: Phone, text: "+1 (555) 123-4567", href: "tel:+15551234567" },
    { icon: MapPin, text: "University Campus, Building A", href: "#" },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer
      id="contact"
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Building2 className="w-10 h-10 text-[#4a90e2]" />
              <span className="text-3xl font-bold">Hostelia</span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Smart Hostel Management Made Simple. Revolutionizing the way
              students and administrators interact for a better hostel
              experience.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#4a90e2] flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-[#4a90e2] transition-colors flex items-center group"
                  >
                    <span className="w-0 h-0.5 bg-[#4a90e2] group-hover:w-4 transition-all mr-0 group-hover:mr-2" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              {contactInfo.map((info, index) => (
                <li key={index}>
                  <a
                    href={info.href}
                    className="flex items-start space-x-3 text-gray-400 hover:text-[#4a90e2] transition-colors group"
                  >
                    <info.icon className="w-5 h-5 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{info.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-6">Support Hours</h3>
            <div className="space-y-3 text-gray-400">
              <div>
                <div className="font-semibold text-white mb-1">
                  24/7 Online Support
                </div>
                <div className="text-sm">We're always here to help</div>
              </div>
              <div className="mt-4 p-4 bg-gray-800 rounded-xl">
                <div className="font-semibold text-white mb-2">
                  Emergency Hotline
                </div>
                <div className="text-[#4a90e2] text-lg font-bold">
                  +1 (555) 999-0000
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-700 pt-8 mt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Hostelia. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a
                href="#"
                className="text-gray-400 hover:text-[#4a90e2] transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#4a90e2] transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#4a90e2] transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-[#4a90e2] rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all z-40"
        aria-label="Scroll to top"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </motion.button>
    </footer>
  );
};

export default Footer;
